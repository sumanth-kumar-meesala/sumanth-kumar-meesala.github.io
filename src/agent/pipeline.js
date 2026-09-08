// The agent, end to end. Each step records what it did so the UI can show
// "how I answered": guardrails in, query understanding, routing + retrieval,
// reranking, generation (gpt-oss-120b on Groq through the proxy — or the
// local composer when the proxy is unreachable), guardrails out.

import { profile, byId } from './knowledge';
import { understand, resolveFollowUp } from './query';
import { screenInput, refusal, screenOutput } from './guardrails';
import { retrieve, CORPUS } from './retrieve';
import { route } from './intents';
import { rerank } from './rerank';
import { compose } from './compose';
import { ENDPOINT, generate, toParts } from './generate';

const ANSWER_AT = 0.42; // local mode: confidence needed to answer plainly
const HEDGE_AT = 0.22; // local mode: below this, refuse
const CONTEXT_MAX = 10; // facts handed to the model

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

const NOT_IN_CV = () => [
  { text: 'That is not in the résumé, so I will not guess.', meta: true },
  { text: `Ask Sumanth directly at ${profile.email}, or try one of the questions below.`, meta: true },
];

const dedupe = (facts) => {
  const seen = new Set();
  return facts.filter((f) => f && !seen.has(f.id) && seen.add(f.id));
};

/**
 * Answer a question.
 * @param raw      the visitor's text
 * @param history  [{ query, answer, tokens, intent }] previous turns (oldest first)
 * @param opts     { generator } — override the generator (tests); `null` forces local mode
 * @returns Promise<{ parts, intent, trace, tokens, model }>
 */
export const ask = async (raw, history = [], opts = {}) => {
  const generator = 'generator' in opts ? opts.generator : ENDPOINT ? generate : null;
  const trace = [];
  const t0 = now();
  const step = (name, status, detail) => trace.push({ name, status, detail, ms: Math.round((now() - t0) * 10) / 10 });
  const finish = (parts, intent, tokens, model = null) => {
    const out = screenOutput(parts, CORPUS);
    const cited = out.parts.filter((p) => p.cite).length;
    const uncited = out.parts.filter((p) => !p.cite).length;
    step(
      'output check',
      out.dropped.length ? 'warned' : 'passed',
      `${cited} cited, ${uncited} uncited sentence${cited + uncited === 1 ? '' : 's'} · numbers verified against the résumé${out.dropped.length ? ` · dropped: ${out.dropped.join(', ')}` : ''}`,
    );
    return { parts: out.parts, intent, trace, tokens, model };
  };

  // 1. Input guardrails ---------------------------------------------------
  const screen = screenInput(raw ?? '');
  if (screen.verdict !== 'ok') {
    const label = screen.verdict === 'social' ? `handled as conversation (${screen.kind})` : screen.verdict === 'offcv' ? `not a résumé question (${screen.kind})` : `blocked: ${screen.verdict}`;
    step('guardrails', 'blocked', label);
    const intent = screen.kind ? `${screen.verdict}:${screen.kind}` : screen.verdict;
    return finish(refusal(screen), intent, []);
  }
  step('guardrails', 'passed', `no injection, abuse or personal data${screen.truncated ? '; question truncated to 400 chars' : ''}`);

  // 2. Query understanding ------------------------------------------------
  const u = understand(screen.query);
  const { tokens, inherited } = resolveFollowUp(screen.query, u.tokens, history);
  const notes = [];
  if (u.corrections.length) notes.push(u.corrections.map(([a, b]) => `${a}→${b}`).join(', '));
  if (inherited.length) notes.push(`carried over: ${inherited.join(', ')}`);
  step('understand', 'passed', `${tokens.length} term${tokens.length === 1 ? '' : 's'}${notes.length ? ` · ${notes.join(' · ')}` : ''}`);

  // 3. Route + retrieve ---------------------------------------------------
  const routed = route(u.tokens);
  const { terms, candidates } = retrieve(tokens);
  step(
    'retrieve',
    routed || candidates.length ? 'passed' : 'empty',
    `${routed ? `rule "${routed.id}" · ${routed.facts.length} facts` : 'no rule matched'} · BM25 over ${terms.length} term${terms.length === 1 ? '' : 's'} · ${candidates.length} candidates`,
  );

  // 4. Rerank -------------------------------------------------------------
  const rr = rerank(candidates, tokens);
  step('rerank', rr.selected.length ? 'passed' : 'empty', `${rr.considered} considered · ${rr.selected.length} kept (MMR) · confidence ${rr.confidence.toFixed(2)}`);
  const intent = routed?.id ?? (rr.selected.length ? 'search' : 'none');

  // 5. Generate (model) ---------------------------------------------------
  if (generator) {
    const context = dedupe([byId('name'), ...(routed?.facts ?? []), ...rr.selected.map((s) => s.f), byId('rights')]).slice(0, CONTEXT_MAX);
    const chat = history.slice(-3).flatMap((h) => [
      { role: 'user', content: h.query },
      { role: 'assistant', content: h.answer },
    ]);
    try {
      const gen = await generator({ question: screen.query, facts: context, history: chat });
      const parsed = toParts(gen.text, context);
      step('generate', 'passed', `${gen.model} · ${context.length} facts in context · ${gen.ms} ms`);
      step(
        'grounding',
        parsed.badRefs ? 'warned' : 'passed',
        `${parsed.parts.length - parsed.uncited} sentence${parsed.parts.length - parsed.uncited === 1 ? '' : 's'} cited by the model${parsed.badRefs ? ` · ${parsed.badRefs} dangling reference${parsed.badRefs === 1 ? '' : 's'} removed` : ''}`,
      );
      return finish(parsed.parts, intent, tokens, gen.model);
    } catch (err) {
      step('generate', 'warned', `model unavailable (${err.code ?? 'error'}) · composing locally`);
    }
  } else {
    step('generate', 'skipped', ENDPOINT ? 'model disabled' : 'no model configured · composing locally');
  }

  // 6. Local fallback: grounding gate + composer -----------------------------
  if (routed) {
    step('grounding', 'passed', 'rule-selected facts, every one cited');
    return finish(compose(routed.facts.slice(0, 4)), intent, tokens);
  }
  const conf = Math.round(rr.confidence * 100) / 100;
  if (!rr.selected.length || rr.confidence < HEDGE_AT) {
    step('grounding', 'blocked', `confidence ${conf} < ${HEDGE_AT} · declined to answer`);
    return finish(NOT_IN_CV(), 'none', tokens);
  }
  const hedge = rr.confidence < ANSWER_AT;
  step('grounding', hedge ? 'warned' : 'passed', `confidence ${conf}${hedge ? ' · answering with a caveat' : ''}`);
  return finish(compose(rr.selected.map((s) => s.f), { hedge }), hedge ? 'hedged' : intent, tokens);
};

export { SUGGESTED } from './intents';
