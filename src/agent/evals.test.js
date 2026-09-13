// Evals for the résumé agent. These gate the deploy: a change that makes the
// agent answer an injection, dump facts at small talk, cite nothing, or
// let an invented number through fails CI before it reaches GitHub Pages.
//
// The cases live in evals.cases.js, shared with scripts/evals.js (which turns
// them into the public metrics panel) and scripts/langfuse-seed.js. Add a case
// there and it is asserted, measured and uploaded in one go.
//
// Two modes are exercised: LOCAL (no generator — the composer answers from
// retrieved facts) and MODEL (a fake generator standing in for Groq, so the
// parsing, grounding and output checks around the model are tested without
// a network).

import { describe, it, expect } from 'vitest';
import { ask, local as localAnswer } from './pipeline';
import { facts } from './knowledge';
import { CORPUS } from './retrieve';
import { toParts } from './generate';
import { GOLDEN, NOT_IN_CV, INJECTIONS, SOCIAL, PERSONAL, ABUSE, OUT_OF_SCOPE, EVERYTHING } from './evals.cases';

const local = (q, history = [], opts = {}) => (opts.hasModel ? localAnswer(q, history, opts) : ask(q, history, opts));
const cited = (a) => a.parts.filter((p) => p.cite);
const text = (a) => a.parts.map((p) => p.text).join(' ');
const labels = (a) => cited(a).map((p) => p.cite.label);

describe('golden questions (local mode)', () => {
  for (const g of GOLDEN) {
    it(`answers "${g.q}"`, async () => {
      const a = await local(g.q);
      expect(a.intent).toBe(g.intent);
      expect(cited(a).length).toBeGreaterThan(0);
      for (const c of g.cites ?? []) expect(labels(a).some((l) => l.includes(c))).toBe(true);
      if (g.includes) expect(text(a)).toContain(g.includes);
    });
  }
});

// --- honesty: not in the résumé -> say so -----------------------------------
describe('does not guess', () => {
  for (const { q, intent } of NOT_IN_CV) {
    it(`declines "${q}"`, async () => {
      const a = await local(q);
      expect(a.intent).toBe(intent);
      expect(cited(a)).toHaveLength(0);
      expect(text(a)).toMatch(/not in the résumé|does not cover/i);
    });
  }
});

// --- guardrails: prompt injection (never reaches the model) -----------------
describe('prompt injection', () => {
  for (const { q } of INJECTIONS) {
    it(`refuses "${q}" before anything downstream runs`, async () => {
      const a = await local(q);
      expect(a.intent).toBe('inject');
      expect(cited(a)).toHaveLength(0);
      // Retrieval and generation never appear in the trace: the turn stopped
      // at the guardrail. (That the worker's model is never called is asserted
      // against the graph, in proxy/graph.test.js.)
      expect(a.trace.map((t) => t.name)).toEqual(['guardrails', 'output check']);
    });
  }
});

// --- guardrails: small talk gets conversation, not a résumé dump ------------
describe('small talk', () => {
  for (const { q, kind } of SOCIAL) {
    it(`handles "${q}" as ${kind}`, async () => {
      const a = await local(q);
      expect(a.intent).toBe(`social:${kind}`);
      expect(cited(a)).toHaveLength(0);
      expect(text(a)).not.toMatch(/AngularJS|Blueprix|LangGraph/);
    });
  }
});

// --- guardrails: personal data, abuse, scope --------------------------------
describe('personal, abusive and off-topic input', () => {
  for (const { q, intent } of PERSONAL) {
    it(`refuses personal "${q}"`, async () => {
      const a = await local(q);
      expect(a.intent).toBe(intent);
      expect(cited(a)).toHaveLength(0);
    });
  }
  for (const { q, intent } of ABUSE) {
    it(`declines abuse "${q}"`, async () => {
      const a = await local(q);
      expect(a.intent).toBe(intent);
      expect(cited(a)).toHaveLength(0);
    });
  }
  for (const { q, intent } of OUT_OF_SCOPE) {
    it(`stays in scope for "${q}"`, async () => {
      const a = await local(q);
      expect(a.intent).toBe(intent);
      expect(cited(a)).toHaveLength(0);
    });
  }
});

// --- the agent describes itself truthfully per mode -------------------------
// Both branches are reachable now that guardrails.js takes `hasModel` as an
// argument instead of reading a Vite env var it cannot see under vitest.
describe('self-description matches the mode it is running in', () => {
  const withModel = (q) => local(q, [], { hasModel: true });

  it('claims no model and no network in local mode', async () => {
    expect(text(await local('who are you?'))).toContain('no language model behind me');
    expect(text(await local('how are you'))).toContain('no model, no network');
  });

  it('names the model and the proxy in model mode', async () => {
    const identity = text(await withModel('who are you?'));
    expect(identity).toContain('gpt-oss-120b on Groq');
    expect(identity).not.toContain('no language model behind me');
    expect(text(await withModel('how are you'))).not.toContain('no model, no network');
  });

  it('answers small talk without reaching retrieval at all', async () => {
    const a = await local('who are you?');
    expect(a.intent).toBe('social:identity');
    expect(a.trace.map((t) => t.name)).toEqual(['guardrails', 'output check']);
  });
});

// --- follow-ups -------------------------------------------------------------
describe('follow-ups', () => {
  it('carries the previous topic into a short follow-up', async () => {
    const first = await local('What did he do at ContenTerra?');
    const second = await local('and at Archimedes?', [{ query: 'x', answer: '', tokens: first.tokens, intent: first.intent }]);
    expect(second.intent).toBe('company');
    expect(labels(second).every((l) => l.startsWith('Archimedes'))).toBe(true);
  });
});

// --- model output parsing ---------------------------------------------------
// Generation itself lives in the worker's graph and is tested there; this is
// the pure parser both runtimes share.
describe('model output parsing', () => {
  it('strips markdown from model output', () => {
    const { parts } = toParts('**Yes.** He *owns* Qrank [1].', [{ text: 'x', cite: { label: 'Qrank', anchor: 'work' } }]);
    expect(parts.map((p) => p.text).join(' ')).toBe('Yes. He owns Qrank.');
  });

  it('maps [n] to the nth fact and flags a dangling reference', () => {
    const facts = [{ text: 'a', cite: { label: 'Affle' } }, { text: 'b', cite: { label: 'Qrank' } }];
    const { parts, badRefs, uncited } = toParts('He ships agents [2]. He also mentors [9].', facts);
    expect(parts[0].cite.label).toBe('Qrank');
    expect(parts[1].meta).toBe(true);
    expect(badRefs).toBe(1);
    expect(uncited).toBe(1);
  });
});

// --- invariants over everything (local mode) --------------------------------
describe('invariants', () => {
  for (const q of EVERYTHING) {
    it(`"${q.slice(0, 40)}": every cited sentence is a résumé fact and every number is in the résumé`, async () => {
      const a = await local(q);
      expect(a.parts.length).toBeGreaterThan(0);
      for (const p of a.parts) {
        expect(p.text.length).toBeGreaterThan(0);
        expect(Boolean(p.cite) || Boolean(p.meta)).toBe(true);
        if (p.cite) {
          expect(facts.some((f) => f.cite.label === p.cite.label)).toBe(true);
          for (const n of p.text.match(/\d[\d.,]*[%k+]?/gi) ?? []) expect(CORPUS).toContain(n.toLowerCase());
        }
      }
      expect(a.trace[0].name).toBe('guardrails');
      expect(a.trace[a.trace.length - 1].name).toBe('output check');
      expect(text(a).length).toBeLessThanOrEqual(1500);
    });
  }

  it('is deterministic in local mode', async () => {
    const a = await local('Has he shipped agents to production?');
    const b = await local('Has he shipped agents to production?');
    expect(a.parts).toEqual(b.parts);
  });

  it('answers fast in local mode', async () => {
    const t = performance.now();
    for (let i = 0; i < 50; i++) await local(EVERYTHING[i % EVERYTHING.length]);
    expect(performance.now() - t).toBeLessThan(2000);
  });
});
