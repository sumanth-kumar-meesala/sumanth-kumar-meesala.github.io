// Observability is optional and must stay invisible when it fails. A dead
// Langfuse, a bad key or a malformed span must never cost the visitor an
// answer — these tests are the contract for that.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { observe } from './src/observability.js';
import worker from './src/worker.js';

const KEYS = { LANGFUSE_PUBLIC_KEY: 'pk-lf-test', LANGFUSE_SECRET_KEY: 'sk-lf-test' };
const STEP = { name: 'retrieve', status: 'passed', detail: '9 candidates', ms: 12 };
const RESULT = { parts: [{ text: 'He ships agents.', cite: { label: 'Affle' } }], intent: 'current', model: 'gpt-oss-120b', trace: [STEP] };

afterEach(() => vi.restoreAllMocks());

describe('observe()', () => {
  it('is a silent no-op with no keys configured', async () => {
    const obs = observe({}, { question: 'q', history: [] });
    expect(obs.traceId).toBeNull();
    expect(() => obs.step(STEP)).not.toThrow();
    expect(() => obs.finish(RESULT)).not.toThrow();
    await expect(obs.flush()).resolves.toBeUndefined();
  });

  it('produces a trace id to hang feedback scores on', () => {
    const obs = observe(KEYS, { question: 'q', history: [] });
    expect(obs.traceId).toEqual(expect.any(String));
    expect(obs.traceId.length).toBeGreaterThan(0);
  });

  it('swallows a broken exporter rather than failing the turn', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('langfuse is down'));
    const obs = observe(KEYS, { question: 'q', history: [] });
    obs.step(STEP);
    obs.finish(RESULT);
    await expect(obs.flush()).resolves.toBeUndefined();
  });

  it('survives malformed steps and results', () => {
    const obs = observe(KEYS, { question: 'q', history: [] });
    expect(() => obs.step({})).not.toThrow();
    expect(() => obs.step({ name: 'x', ms: NaN })).not.toThrow();
    expect(() => obs.finish({ parts: [], trace: [] })).not.toThrow();
  });
});

describe('the worker answers regardless of observability', () => {
  const env = {
    GROQ_API_KEY: 'test-key',
    ALLOWED_ORIGINS: 'https://x.example',
    PRIMARY_MODEL: 'openai/gpt-oss-120b',
    FALLBACK_MODEL: 'llama-3.3-70b-versatile',
    ...KEYS,
  };
  const post = (body) =>
    new Request('https://ask.example/', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://x.example' }, body: JSON.stringify(body) });

  it('answers normally when Langfuse ingestion fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (String(url).includes('groq.com')) {
        return new Response(JSON.stringify({ model: 'openai/gpt-oss-120b', choices: [{ message: { content: 'He is an Australian citizen [1].' } }] }), { status: 200 });
      }
      throw new Error('langfuse unreachable');
    });
    const res = await worker.fetch(post({ question: 'Does he need visa sponsorship?' }), env);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.answer).toContain('Australian citizen');
    expect(body.traceId).toEqual(expect.any(String));
  });
});
