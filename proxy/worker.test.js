// Contract tests for the proxy: CORS, validation, model fallback. Groq is
// stubbed — nothing here touches the network.

import { describe, it, expect, vi, afterEach } from 'vitest';
import worker from './src/worker.js';

const env = {
  GROQ_API_KEY: 'test-key',
  ALLOWED_ORIGINS: 'https://sumanth-kumar-meesala.github.io,http://localhost:5173',
  PRIMARY_MODEL: 'openai/gpt-oss-120b',
  FALLBACK_MODEL: 'llama-3.3-70b-versatile',
};
const ORIGIN = 'https://sumanth-kumar-meesala.github.io';

const post = (body, origin = ORIGIN, headers = {}) =>
  new Request('https://ask.example/', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(origin ? { origin } : {}), ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const groqReply = (content, model = 'openai/gpt-oss-120b') =>
  new Response(JSON.stringify({ model, choices: [{ message: { content } }], usage: { total_tokens: 42 } }), { status: 200 });

afterEach(() => vi.restoreAllMocks());

describe('access', () => {
  it('rejects unknown origins', async () => {
    const res = await worker.fetch(post({ question: 'hi' }, 'https://evil.example'), env);
    expect(res.status).toBe(403);
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('rejects requests with no origin', async () => {
    const res = await worker.fetch(post({ question: 'hi' }, null), env);
    expect(res.status).toBe(403);
  });

  it('answers preflight for an allowed origin', async () => {
    const res = await worker.fetch(new Request('https://ask.example/', { method: 'OPTIONS', headers: { origin: ORIGIN } }), env);
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('refuses non-POST', async () => {
    const res = await worker.fetch(new Request('https://ask.example/', { method: 'GET', headers: { origin: ORIGIN } }), env);
    expect(res.status).toBe(405);
  });

  it('reports a missing key as 503, never as a model error', async () => {
    const res = await worker.fetch(post({ question: 'hi' }), { ...env, GROQ_API_KEY: '' });
    expect(res.status).toBe(503);
  });
});

describe('validation', () => {
  it('rejects bad JSON and empty questions', async () => {
    expect((await worker.fetch(post('{nope'), env)).status).toBe(400);
    expect((await worker.fetch(post({ question: '   ' }), env)).status).toBe(400);
  });

  it('rejects oversized bodies by content-length', async () => {
    const res = await worker.fetch(post({ question: 'x' }, ORIGIN, { 'content-length': '999999' }), env);
    expect(res.status).toBe(413);
  });

  it('truncates the question and caps facts and history before calling the model', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(groqReply('Fine [1].'));
    const facts = Array.from({ length: 30 }, (_, i) => ({ text: `fact ${i}`, cite: `c${i}` }));
    const history = Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `turn ${i}` }));
    await worker.fetch(post({ question: 'q'.repeat(1000), facts, history }), env);
    const sent = JSON.parse(spy.mock.calls[0][1].body);
    const user = sent.messages[sent.messages.length - 1].content;
    expect(user.match(/^\[\d+\]/gm)).toHaveLength(12);
    expect(user).toContain('q'.repeat(400));
    expect(user).not.toContain('q'.repeat(401));
    expect(sent.messages.filter((m) => m.role !== 'system').length).toBe(7); // 6 history + 1 user
    expect(sent.messages[0].role).toBe('system');
    expect(sent.max_tokens).toBeLessThanOrEqual(450);
  });
});

describe('models', () => {
  it('uses the primary model and forwards the key', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(groqReply('He builds agents [1].'));
    const res = await worker.fetch(post({ question: 'agents?', facts: [{ text: 'f', cite: 'c' }] }), env);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.answer).toBe('He builds agents [1].');
    expect(body.model).toBe('openai/gpt-oss-120b');
    expect(JSON.parse(spy.mock.calls[0][1].body).model).toBe('openai/gpt-oss-120b');
    expect(spy.mock.calls[0][1].headers.authorization).toBe('Bearer test-key');
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('falls back to the second model on a rate limit', async () => {
    const spy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('slow down', { status: 429 }))
      .mockResolvedValueOnce(groqReply('Fallback [1].', 'llama-3.3-70b-versatile'));
    const res = await worker.fetch(post({ question: 'q' }), env);
    expect(res.status).toBe(200);
    expect((await res.json()).model).toBe('llama-3.3-70b-versatile');
    expect(JSON.parse(spy.mock.calls[1][1].body).model).toBe('llama-3.3-70b-versatile');
  });

  it('stops on an auth error and never leaks the key in the response', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('bad key', { status: 401 }));
    const res = await worker.fetch(post({ question: 'q' }), env);
    expect(res.status).toBe(502);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(await res.text()).not.toContain('test-key');
  });

  it('returns 429 with retry-after when both models are rate limited', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('slow down', { status: 429 }));
    const res = await worker.fetch(post({ question: 'q' }), env);
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('10');
  });
});
