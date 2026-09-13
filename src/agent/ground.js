// The grounding gate: given what retrieval found, is there enough to answer?
//
// Shared by the browser's offline fallback and the worker's compose node, so
// the two cannot drift on what "enough" means. They had identical copies of
// this — same thresholds, same wording — which is exactly how two answers to
// the same question start differing.

import { compose } from './compose';
import { profile } from './knowledge';

export const ANSWER_AT = 0.42; // answer plainly at or above this
export const HEDGE_AT = 0.22; // below this, decline rather than guess

const notInCv = () => [
  { text: 'That is not in the résumé, so I will not guess.', meta: true },
  { text: `Ask Sumanth directly at ${profile.email}, or try one of the questions below.`, meta: true },
];

/**
 * @param routed      the rule router's hit, or null
 * @param selected    reranked facts [{ f, ... }]
 * @param confidence  the reranker's confidence
 * @param intent      the intent decided upstream
 * @returns { parts, intent, status, detail } — callers format their own trace entry
 */
export const ground = ({ routed, selected, confidence, intent }) => {
  if (routed) {
    return { parts: compose(routed.facts.slice(0, 4)), intent, status: 'passed', detail: 'rule-selected facts, every one cited' };
  }
  const conf = Math.round(confidence * 100) / 100;
  if (!selected?.length || confidence < HEDGE_AT) {
    return { parts: notInCv(), intent: 'none', status: 'blocked', detail: `confidence ${conf} < ${HEDGE_AT} · declined to answer` };
  }
  const hedge = confidence < ANSWER_AT;
  return {
    parts: compose(selected.map((s) => s.f), { hedge }),
    intent: hedge ? 'hedged' : intent,
    status: hedge ? 'warned' : 'passed',
    detail: `confidence ${conf}${hedge ? ' · answering with a caveat' : ''}`,
  };
};
