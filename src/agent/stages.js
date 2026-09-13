// The stages an answer passes through, in order — the trace's vocabulary.
//
// Both runtimes emit trace entries named from this list, and the UI draws its
// diagram from it, so the picture is the pipeline rather than a drawing of it.
// A test asserts that every name the agent actually emits appears here, which
// is what stops the two drifting apart.

export const STAGES = [
  { name: 'guardrails', blurb: 'screens the question for injection, abuse and personal data' },
  { name: 'understand', blurb: 'fixes typos, expands synonyms, resolves what a follow-up refers to' },
  { name: 'retrieve', blurb: 'rule router plus BM25 over the résumé' },
  { name: 'rerank', blurb: 'MMR keeps the best few and drops near-duplicates' },
  { name: 'generate', blurb: 'the model writes from those facts and nothing else' },
  { name: 'grounding', blurb: 'is there enough to answer, and did the model cite it' },
  { name: 'judge', blurb: 'a second model reads the answer back against the facts and can send it round again' },
  { name: 'output check', blurb: 'every sentence cited, every number verified against the résumé' },
];

