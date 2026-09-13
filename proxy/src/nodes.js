// Graph nodes. Each is a plain async function over the shared agent modules —
// no LangChain Runnables, no ChatModel classes, so the worker bundle stays at
// LangGraph + its @langchain/core peer and nothing more.
//
// The retrieval, reranking, guardrail and composition logic is imported from
// ../../src/agent/, the same modules the browser runs. There is one BM25, one
// MMR and one output screen in this repo; they just execute in two places.

import { byId } from '../../src/agent/knowledge';
import { understand, resolveFollowUp } from '../../src/agent/query';
import { screenInput, refusal, screenOutput } from '../../src/agent/guardrails';
import { retrieve as bm25, CORPUS } from '../../src/agent/retrieve';
import { route } from '../../src/agent/intents';
import { rerank as mmr } from '../../src/agent/rerank';
import { ground } from '../../src/agent/ground';
import { toParts } from '../../src/agent/generate';
import { JUDGE_PASS } from './judge.js';

export const MAX_PASSES = 1; // generations the judge may ask to redo — one, so a turn is at most two

/**
 * The retry decision, in one place. The judge node needs it to decide whether
 * to attach its search terms; the graph edge needs it to decide where to go.
 * Two copies of this drifted apart once already.
 */
export const shouldRetry = (verdict, attempts = 0) => Boolean(verdict && verdict.score < JUDGE_PASS && attempts <= MAX_PASSES);
const CONTEXT_MAX = 10; // facts handed to the model

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/** Trace entries keep the shape the UI already renders: { name, status, detail, ms }. */
const entry = (t0, name, status, detail) => ({ name, status, detail, ms: Math.round((now() - t0) * 10) / 10 });

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const dedupe = (facts) => {
  const seen = new Set();
  return facts.filter((f) => f && !seen.has(f.id) && seen.add(f.id));
};

// --- nodes -------------------------------------------------------------------

/**
 * Tier-1 guardrail. Runs here even though the browser already ran it: this
 * endpoint is public, so a client verdict is a hint, never a decision.
 */
export const screen = async (s, config) => {
  const verdict = screenInput(s.raw ?? '');
  if (verdict.verdict === 'ok') {
    const tier1 = `no injection, abuse or personal data${verdict.truncated ? '; question truncated to 400 chars' : ''}`;

    // Tier 2: a classifier opinion on what the rules let through. It can only
    // ever tighten — no opinion, or an error, leaves tier 1's verdict standing.
    const guardFn = config?.configurable?.guard;
    if (guardFn) {
      let opinion;
      try {
        opinion = await guardFn(verdict.query);
      } catch (err) {
        return {
          screening: verdict,
          question: verdict.query,
          trace: [entry(s.t0, 'guardrails', 'passed', `${tier1} · Prompt Guard unavailable (${err.code ?? 'error'}), rules only`)],
        };
      }
      if (opinion?.jailbreak) {
        const flagged = { ...verdict, verdict: 'inject' };
        return {
          screening: flagged,
          question: verdict.query,
          intent: 'inject',
          parts: refusal(flagged, s.hasModel),
          tokens: [],
          trace: [entry(s.t0, 'guardrails', 'blocked', `rules passed, but Prompt Guard flagged a jailbreak (${opinion.score.toFixed(2)})`)],
        };
      }
      return {
        screening: verdict,
        question: verdict.query,
        trace: [entry(s.t0, 'guardrails', 'passed', `${tier1} · Prompt Guard ${opinion ? 'agrees' : 'had no opinion'}`)],
      };
    }

    return { screening: verdict, question: verdict.query, trace: [entry(s.t0, 'guardrails', 'passed', tier1)] };
  }
  const label =
    verdict.verdict === 'social' ? `handled as conversation (${verdict.kind})`
    : verdict.verdict === 'offcv' ? `not a résumé question (${verdict.kind})`
    : `blocked: ${verdict.verdict}`;
  return {
    screening: verdict,
    question: verdict.query,
    intent: verdict.kind ? `${verdict.verdict}:${verdict.kind}` : verdict.verdict,
    parts: refusal(verdict, s.hasModel),
    tokens: [],
    trace: [entry(s.t0, 'guardrails', 'blocked', label)],
  };
};

/**
 * Understand the question, then route and retrieve over the SAME tokens.
 * (pipeline.js routed on pre-follow-up tokens while retrieving on post-, so
 * inherited terms never reached the rule router. They do now — which also
 * makes the judge's re-retrieval work, since it widens these same tokens.)
 */
export const retrieve = async (s) => {
  const u = understand(s.question);
  const { tokens, inherited } = resolveFollowUp(s.question, u.tokens, s.history ?? []);
  // Base tokens are passed through untouched — BM25 scores on term frequency,
  // so deduping them here would silently change ranking. Only terms the judge
  // adds on a retry are deduped, and only against what is already there.
  const extra = [...new Set((s.extraTokens ?? []).filter((x) => x && !tokens.includes(x)))];
  const merged = extra.length ? [...tokens, ...extra] : tokens;
  const routed = route(merged);
  const { terms, candidates } = bm25(merged);

  const notes = [];
  if (u.corrections.length) notes.push(u.corrections.map(([a, b]) => `${a}→${b}`).join(', '));
  if (inherited.length) notes.push(`carried over: ${inherited.join(', ')}`);
  if (extra.length) notes.push(`widened after review: ${extra.join(', ')}`);

  return {
    tokens: merged,
    routed,
    candidates,
    trace: [
      entry(s.t0, 'understand', 'passed', `${plural(merged.length, 'term')}${notes.length ? ` · ${notes.join(' · ')}` : ''}`),
      entry(
        s.t0,
        'retrieve',
        routed || candidates.length ? 'passed' : 'empty',
        `${routed ? `rule "${routed.id}" · ${plural(routed.facts.length, 'fact')}` : 'no rule matched'} · BM25 over ${plural(terms.length, 'term')} · ${candidates.length} candidates`,
      ),
    ],
  };
};

export const rerank = async (s) => {
  const rr = mmr(s.candidates ?? [], s.tokens ?? []);
  return {
    selected: rr.selected,
    confidence: rr.confidence,
    intent: s.routed?.id ?? (rr.selected.length ? 'search' : 'none'),
    trace: [entry(s.t0, 'rerank', rr.selected.length ? 'passed' : 'empty', `${rr.considered} considered · ${rr.selected.length} kept (MMR) · confidence ${rr.confidence.toFixed(2)}`)],
  };
};

/** Facts handed to the model: name first, rights last, deduped, capped. */
const contextFor = (s) =>
  dedupe([byId('name'), ...(s.routed?.facts ?? []), ...(s.selected ?? []).map((x) => x.f), byId('rights')]).slice(0, CONTEXT_MAX);

export const generate = async (s, config) => {
  const generator = config?.configurable?.generator;
  const context = contextFor(s);
  const chat = (s.history ?? []).slice(-3).flatMap((h) => [
    { role: 'user', content: h.query },
    { role: 'assistant', content: h.answer },
  ]);
  try {
    const gen = await generator({ question: s.question, facts: context, history: chat });
    const parsed = toParts(gen.text, context);
    const citedCount = parsed.parts.length - parsed.uncited;
    return {
      parts: parsed.parts,
      context,
      model: gen.model,
      generated: true,
      attempts: (s.attempts ?? 0) + 1,
      trace: [
        entry(s.t0, 'generate', 'passed', `${gen.model} · ${plural(context.length, 'fact')} in context · ${gen.ms} ms`),
        entry(
          s.t0,
          'grounding',
          parsed.badRefs ? 'warned' : 'passed',
          `${plural(citedCount, 'sentence')} cited by the model${parsed.badRefs ? ` · ${plural(parsed.badRefs, 'dangling reference')} removed` : ''}`,
        ),
      ],
    };
  } catch (err) {
    // Non-fatal: the local composer answers instead, exactly as before.
    return { generated: false, trace: [entry(s.t0, 'generate', 'warned', `model unavailable (${err.code ?? 'error'}) · composing locally`)] };
  }
};

/**
 * Read the answer back against the facts it was meant to come from. A low
 * score sends the graph around again — retrieval widens with the terms the
 * judge names — but only once, and the judge never blocks an answer itself.
 */
export const judge = async (s, config) => {
  const judgeFn = config?.configurable?.judge;
  if (!judgeFn) return { trace: [entry(s.t0, 'judge', 'skipped', 'no judge configured')] };

  let verdict = null;
  try {
    verdict = await judgeFn({ question: s.question, answer: s.parts.map((p) => p.text).join(' '), facts: s.context ?? [] });
  } catch (err) {
    return { trace: [entry(s.t0, 'judge', 'warned', `judge unavailable (${err.code ?? 'error'}) · keeping the answer as written`)] };
  }
  if (!verdict) return { trace: [entry(s.t0, 'judge', 'warned', 'judge returned nothing usable · keeping the answer as written')] };

  const retrying = shouldRetry(verdict, s.attempts ?? 0);
  const flags = [!verdict.grounded && 'ungrounded', !verdict.complete && 'incomplete'].filter(Boolean);
  return {
    review: verdict,
    extraTokens: retrying ? verdict.missing : [],
    trace: [
      entry(
        s.t0,
        'judge',
        verdict.score < JUDGE_PASS ? 'warned' : 'passed',
        `scored ${verdict.score.toFixed(2)}${flags.length ? ` · ${flags.join(', ')}` : ''}${verdict.reason ? ` · ${verdict.reason}` : ''}${
          retrying ? ` · retrying with: ${verdict.missing.join(', ') || 'a wider search'}` : ''
        }`,
      ),
    ],
  };
};

/** Local grounding gate + composer: the fallback, and the only path with no model. */
export const composeLocal = async (s, config) => {
  // Reached either because no generator was configured, or because one failed.
  // Only the first case needs a 'generate' entry — a failure already logged its own.
  const skipped = config?.configurable?.generator
    ? []
    : [entry(s.t0, 'generate', 'skipped', s.modelConfigured ? 'model disabled' : 'no model configured · composing locally')];

  const g = ground({ routed: s.routed, selected: s.selected, confidence: s.confidence, intent: s.intent });
  return { parts: g.parts, intent: g.intent, trace: [...skipped, entry(s.t0, 'grounding', g.status, g.detail)] };
};

/** The last word on what ships. Runs on every path, refusals included. */
export const verify = async (s) => {
  const out = screenOutput(s.parts ?? [], CORPUS);
  const cited = out.parts.filter((p) => p.cite).length;
  const uncited = out.parts.filter((p) => !p.cite).length;
  return {
    parts: out.parts,
    dropped: out.dropped,
    trace: [
      entry(
        s.t0,
        'output check',
        out.dropped.length ? 'warned' : 'passed',
        `${cited} cited, ${uncited} uncited sentence${cited + uncited === 1 ? '' : 's'} · numbers verified against the résumé${out.dropped.length ? ` · dropped: ${out.dropped.join(', ')}` : ''}`,
      ),
    ],
  };
};
