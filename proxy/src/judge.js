// LLM as judge: a second pass that reads the answer back against the facts it
// was supposed to come from, and says whether it is grounded and complete.
//
// The judge never decides what ships. A low score buys the agent exactly one
// more attempt — retrieval widens with the terms the judge says are missing,
// and the model writes again. screenOutput still has the last word either way.

import { z } from 'zod';

export const JUDGE_PASS = 0.6; // below this, and with an attempt left, try again
export const MAX_ATTEMPTS = 2; // one generation, one retry — never more

export const JUDGE_SYSTEM = `You are a strict evaluator for a résumé question-answering agent. You are given the FACTS the agent was allowed to use, the visitor's QUESTION, and the ANSWER it produced. Judge the answer only against those facts.

Return ONLY a JSON object with these keys:
  "grounded"  true if every factual claim in the answer is supported by the facts. Any invented number, employer, date, tool or outcome makes this false.
  "complete"  true if the answer actually addresses the question asked.
  "score"     0 to 1. Start at 1. Subtract heavily for unsupported claims, moderately for not answering the question, lightly for vagueness. An answer that correctly says the résumé does not cover something scores 1.
  "reason"    one short sentence, max 25 words, explaining the score.
  "missing"   up to 5 lowercase single-word search terms from the QUESTION that were not covered by the facts and would help retrieve a better answer. Empty when the answer is good.

Judge only. Do not rewrite the answer. Do not add commentary outside the JSON.`;

const Verdict = z.object({
  grounded: z.boolean().catch(true),
  complete: z.boolean().catch(true),
  score: z.number().min(0).max(1).catch(1),
  reason: z.string().max(300).catch(''),
  // Deliberately permissive: an over-long list is truncated below, not
  // discarded. Rejecting the field would turn "too many hints" into "no hints".
  missing: z.array(z.string()).catch([]),
});

export const buildJudgeMessages = ({ question, answer, facts }) => [
  { role: 'system', content: JUDGE_SYSTEM },
  {
    role: 'user',
    content: `FACTS:\n${facts.map((f, i) => `[${i + 1}] ${f.text}`).join('\n')}\n\nQUESTION:\n${question}\n\nANSWER:\n${answer}`,
  },
];

/**
 * Parse the judge's reply. Anything unparseable is "no opinion" — a null
 * verdict, which the graph treats as a pass rather than blocking an answer on
 * a broken judge.
 */
export const parseVerdict = (raw) => {
  let data;
  try {
    data = JSON.parse(String(raw ?? '').trim());
  } catch {
    // Some models wrap JSON in prose or a fence despite being told not to.
    const match = /\{[\s\S]*\}/.exec(String(raw ?? ''));
    if (!match) return null;
    try {
      data = JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const parsed = Verdict.safeParse(data);
  if (!parsed.success) return null;
  // A model that returns only prose fields shouldn't look like a confident pass.
  const missing = parsed.data.missing
    .map((m) => String(m).toLowerCase().trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 5);
  return { ...parsed.data, missing };
};
