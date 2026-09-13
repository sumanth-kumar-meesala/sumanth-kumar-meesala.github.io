// The agent as the browser sees it.
//
// When a worker is configured, the graph runs there (proxy/src/graph.js) and
// this file is a client: it screens the question locally first — so an
// injection is refused without a single network call — then streams the
// worker's steps back as they happen.
//
// Without a worker, or when one is unreachable, `local()` below answers from
// the résumé in this bundle: guardrails, query understanding, routing and
// BM25 retrieval, reranking, a grounding gate, and the output check.
//
// It never calls a model. Generation, judging and the retry cycle belong to
// the graph in the worker — having a second copy here meant two answers to
// the same question maintained side by side, which is a drift surface, not a
// feature. This is the offline composer and nothing more.

import { understand, resolveFollowUp } from './query';
import { screenInput, refusal, screenOutput } from './guardrails';
import { retrieve, CORPUS } from './retrieve';
import { route } from './intents';
import { rerank } from './rerank';
import { ground } from './ground';
import { ENDPOINT, askRemote } from './generate';

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/**
 * Answer from the résumé in this bundle, with no model involved.
 * @param opts { hasModel, onStep } — hasModel only changes how the agent describes itself
 */
export const local = async (raw, history = [], opts = {}) => {
  const hasModel = opts.hasModel ?? false;
  const trace = [];
  const t0 = now();
  const step = (name, status, detail) => {
    const entry = { name, status, detail, ms: Math.round((now() - t0) * 10) / 10 };
    trace.push(entry);
    opts.onStep?.(entry);
  };
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
    return finish(refusal(screen, hasModel), intent, []);
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

  // 5. No model here, by design ---------------------------------------------
  step('generate', 'skipped', hasModel ? 'worker unreachable · composing locally' : 'no model configured · composing locally');

  // 6. Grounding gate + composer ---------------------------------------------
  const g = ground({ routed, selected: rr.selected, confidence: rr.confidence, intent });
  step('grounding', g.status, g.detail);
  return finish(g.parts, g.intent, tokens);
};

/**
 * Answer a question.
 *
 * Routes to the worker when one is configured, and falls back to `local()` if
 * it cannot be reached — so the agent never simply fails.
 *
 * @param raw      the visitor's text
 * @param history  [{ query, answer, tokens, intent }] previous turns (oldest first)
 * @param opts     { onStep, signal }
 * @returns Promise<{ parts, intent, trace, tokens, model }>
 */
export const ask = async (raw, history = [], opts = {}) => {
  if (!ENDPOINT) return local(raw, history, opts);

  // Tier 1, in the browser: an injection is refused here, before any network
  // call. The worker screens again with this same module — a public endpoint
  // cannot trust a client's verdict — but the visitor never waits for that.
  const screened = screenInput(raw ?? '');
  if (screened.verdict !== 'ok') return local(raw, history, { hasModel: true, onStep: opts.onStep });

  // Collect the streamed steps so the returned trace is complete even for a
  // caller that passed no onStep.
  const trace = [];
  const onStep = (entry) => {
    trace.push(entry);
    opts.onStep?.(entry);
  };
  try {
    const remote = await askRemote({ question: raw, history, onStep }, { signal: opts.signal });
    return { parts: remote.parts, intent: remote.intent, trace, tokens: remote.tokens, model: remote.model, degraded: remote.degraded, traceId: remote.traceId };
  } catch {
    return local(raw, history, { hasModel: true, onStep: opts.onStep });
  }
};

export { SUGGESTED } from './intents';
