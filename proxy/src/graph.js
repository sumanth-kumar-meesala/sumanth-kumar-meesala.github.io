// The agent as a LangGraph StateGraph.
//
//   screen ──blocked──────────────────────────────────────► verify ─► END
//     │ ok                                                     ▲
//     ▼                                                        │
//   retrieve ─► rerank ─┬─ no model ─► compose ────────────────┤
//     ▲                 │                                      │
//     │                 └─ model ─► generate ─┬─ failed ─► compose
//     │                                       │ ok
//     │                                       ▼
//     └──────── score < 0.6, one attempt ─── judge ────────────┘
//
// Refusals go through `verify` too: the output screen is the last word on
// every path, exactly as pipeline.js's finish() is today.

import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { screen, retrieve, rerank, generate, judge, composeLocal, verify, shouldRetry } from './nodes.js';

const last = (a, b) => (b === undefined ? a : b);

export const AskState = Annotation.Root({
  // input
  raw: Annotation({ reducer: last, default: () => '' }),
  history: Annotation({ reducer: last, default: () => [] }),
  hasModel: Annotation({ reducer: last, default: () => false }),
  modelConfigured: Annotation({ reducer: last, default: () => false }), // an endpoint exists but this turn ran without it
  t0: Annotation({ reducer: last, default: () => 0 }),
  // working state
  screening: Annotation({ reducer: last, default: () => null }), // node names and channel names share a namespace in LangGraph
  question: Annotation({ reducer: last, default: () => '' }),
  tokens: Annotation({ reducer: last, default: () => [] }),
  extraTokens: Annotation({ reducer: last, default: () => [] }),
  routed: Annotation({ reducer: last, default: () => null }),
  candidates: Annotation({ reducer: last, default: () => [] }),
  selected: Annotation({ reducer: last, default: () => [] }),
  confidence: Annotation({ reducer: last, default: () => 0 }),
  context: Annotation({ reducer: last, default: () => [] }),
  generated: Annotation({ reducer: last, default: () => false }),
  attempts: Annotation({ reducer: last, default: () => 0 }),
  review: Annotation({ reducer: last, default: () => null }), // the judge node's verdict — channels and nodes share a namespace
  // output
  intent: Annotation({ reducer: last, default: () => 'none' }),
  parts: Annotation({ reducer: last, default: () => [] }),
  model: Annotation({ reducer: last, default: () => null }),
  dropped: Annotation({ reducer: last, default: () => [] }),
  // the visible record, appended to by every node
  trace: Annotation({ reducer: (a = [], b = []) => [...a, ...b], default: () => [] }),
});

const afterScreen = (s) => (s.screening?.verdict === 'ok' ? 'retrieve' : 'verify');
const afterRerank = (s, config) => (config?.configurable?.generator ? 'generate' : 'compose');
const afterGenerate = (s, config) => (!s.generated ? 'compose' : config?.configurable?.judge ? 'judge' : 'verify');

/** The cycle: an answer the judge fails goes back through retrieval, once. */
const afterJudge = (s) => (shouldRetry(s.review, s.attempts) ? 'retrieve' : 'verify');

export const graph = new StateGraph(AskState)
    .addNode('screen', screen)
    .addNode('retrieve', retrieve)
    .addNode('rerank', rerank)
    .addNode('generate', generate)
    .addNode('judge', judge)
    .addNode('compose', composeLocal)
    .addNode('verify', verify)
    .addEdge(START, 'screen')
    .addConditionalEdges('screen', afterScreen, ['retrieve', 'verify'])
    .addEdge('retrieve', 'rerank')
    .addConditionalEdges('rerank', afterRerank, ['generate', 'compose'])
    .addConditionalEdges('generate', afterGenerate, ['judge', 'verify', 'compose'])
    .addConditionalEdges('judge', afterJudge, ['retrieve', 'verify'])
    .addEdge('compose', 'verify')
    .addEdge('verify', END)
    .compile();

/** Node order for the UI diagram — derived here so the picture cannot drift. */
export const NODES = ['screen', 'retrieve', 'rerank', 'generate', 'judge', 'compose', 'verify'];

/**
 * Run the graph. Mirrors pipeline.js's ask() signature so the same evals hold.
 * @param raw       the visitor's text
 * @param history   [{ query, answer, tokens, intent }] previous turns
 * @param opts      { generator, onStep }
 * @returns { parts, intent, trace, tokens, model }
 */
export const run = async (raw, history = [], opts = {}) => {
  const { generator = null, judge: judgeFn = null, guard = null, onStep, modelConfigured = false } = opts;
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const config = { configurable: { generator, judge: judgeFn, guard } };

  if (!onStep) {
    const s = await graph.invoke({ raw, history, hasModel: Boolean(generator), modelConfigured, t0 }, config);
    return { parts: s.parts, intent: s.intent, trace: s.trace, tokens: s.tokens, model: s.model };
  }

  // Streaming: emit each node's trace entries as they are produced.
  let final = null;
  let seen = 0;
  for await (const chunk of await graph.stream({ raw, history, hasModel: Boolean(generator), modelConfigured, t0 }, { ...config, streamMode: 'values' })) {
    final = chunk;
    for (const step of (chunk.trace ?? []).slice(seen)) onStep(step);
    seen = chunk.trace?.length ?? seen;
  }
  return { parts: final.parts, intent: final.intent, trace: final.trace, tokens: final.tokens, model: final.model };
};
