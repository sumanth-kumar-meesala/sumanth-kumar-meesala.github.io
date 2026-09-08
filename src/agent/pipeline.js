// The agent, end to end. Each step records what it did so the UI can show
// "how I answered" — the same shape as the LLM-backed pipelines Sumanth ships,
// minus the model: guardrails in, retrieval, reranking, a grounding gate,
// composition, guardrails out.

import { profile } from './knowledge';
import { understand, resolveFollowUp } from './query';
import { screenInput, refusal, screenOutput } from './guardrails';
import { retrieve, CORPUS } from './retrieve';
import { INTENTS, groupAnswer, techAnswer } from './intents';
import { rerank } from './rerank';
import { compose, voice } from './compose';

const ANSWER_AT = 0.42; // confidence needed to answer plainly
const HEDGE_AT = 0.22; // below this, refuse

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

const NOT_IN_CV = () => [
  { text: 'That is not in the résumé, so I will not guess.', meta: true },
  { text: `Ask Sumanth directly at ${profile.email}, or try one of the questions below.`, meta: true },
];

/**
 * Answer a question.
 * @param raw      the visitor's text
 * @param history  [{ query, tokens, intent }] previous turns (oldest first)
 * @returns { parts, intent, trace, tokens }
 */
export const ask = (raw, history = []) => {
  const trace = [];
  const t0 = now();
  const step = (name, status, detail) => trace.push({ name, status, detail, ms: Math.round((now() - t0) * 10) / 10 });

  // 1. Input guardrails ---------------------------------------------------
  const screen = screenInput(raw ?? '');
  if (screen.verdict !== 'ok') {
    step('guardrails', 'blocked', screen.verdict === 'social' ? `handled as conversation (${screen.kind})` : `blocked: ${screen.verdict}`);
    const parts = screenOutput(refusal(screen), CORPUS).parts;
    step('output check', 'passed', `${parts.length} sentence${parts.length === 1 ? '' : 's'}, no citations needed`);
    return { parts, intent: screen.verdict === 'social' ? `social:${screen.kind}` : screen.verdict, trace, tokens: [] };
  }
  step('guardrails', 'passed', `no injection, abuse or personal data${screen.truncated ? '; question truncated to 400 chars' : ''}`);

  // 2. Query understanding ------------------------------------------------
  const u = understand(screen.query);
  const { tokens, inherited } = resolveFollowUp(screen.query, u.tokens, history);
  const notes = [];
  if (u.corrections.length) notes.push(u.corrections.map(([a, b]) => `${a}→${b}`).join(', '));
  if (inherited.length) notes.push(`carried over: ${inherited.join(', ')}`);
  step('understand', 'passed', `${tokens.length} term${tokens.length === 1 ? '' : 's'}${notes.length ? ` · ${notes.join(' · ')}` : ''}`);

  // 3. Route: hand-composed answers for the questions that come up most ----
  const own = u.tokens;
  const routed = INTENTS.find((i) => i.when(own));
  if (routed) {
    const ps = routed.answer(own);
    if (ps.length) {
      step('retrieve', 'passed', `rule "${routed.id}" matched · ${ps.filter((p) => p.cite).length} facts`);
      step('rerank', 'skipped', 'rule answers are ordered by hand');
      step('grounding', 'passed', 'every fact cited');
      return finish(voice(ps), routed.id, trace, step, tokens);
    }
  }
  const lookup = groupAnswer(own) ?? techAnswer(own);
  if (lookup) {
    step('retrieve', 'passed', `stack lookup · ${lookup.length} facts`);
    step('rerank', 'skipped', 'lookup answers are ordered by hand');
    step('grounding', 'passed', 'every fact cited');
    return finish(voice(lookup), 'lookup', trace, step, tokens);
  }

  // 4. Retrieval ------------------------------------------------------------
  const { terms, candidates } = retrieve(tokens);
  step('retrieve', candidates.length ? 'passed' : 'empty', `BM25 over ${terms.length} term${terms.length === 1 ? '' : 's'} · ${candidates.length} candidates`);

  // 5. Rerank ---------------------------------------------------------------
  const rr = rerank(candidates, tokens);
  step('rerank', rr.selected.length ? 'passed' : 'empty', `${rr.considered} considered · ${rr.selected.length} kept (MMR)`);

  // 6. Grounding gate -------------------------------------------------------
  const conf = Math.round(rr.confidence * 100) / 100;
  if (!rr.selected.length || rr.confidence < HEDGE_AT) {
    step('grounding', 'blocked', `confidence ${conf} < ${HEDGE_AT} · declined to answer`);
    return finish(NOT_IN_CV(), 'none', trace, step, tokens);
  }
  const hedge = rr.confidence < ANSWER_AT;
  step('grounding', hedge ? 'warned' : 'passed', `confidence ${conf}${hedge ? ' · answering with a caveat' : ''}`);

  // 7. Compose --------------------------------------------------------------
  return finish(compose(rr.selected, { hedge }), hedge ? 'hedged' : 'search', trace, step, tokens);
};

// 8. Output guardrails --------------------------------------------------------
const finish = (parts, intent, trace, step, tokens) => {
  const out = screenOutput(parts, CORPUS);
  const cited = out.parts.filter((p) => p.cite).length;
  step('output check', out.dropped.length ? 'warned' : 'passed', `${cited} cited sentence${cited === 1 ? '' : 's'} · numbers verified against the résumé${out.dropped.length ? ` · dropped: ${out.dropped.join(', ')}` : ''}`);
  return { parts: out.parts, intent, trace, tokens };
};

export { SUGGESTED } from './intents';
