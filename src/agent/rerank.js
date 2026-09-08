// Reranking: candidates from retrieval are rescored with features the first
// pass cannot see, then selected with maximal marginal relevance so the answer
// does not repeat itself. Returns the chosen facts and a confidence.

import { tokenize, stem } from './query';

const WEIGHTS = { lexical: 0.55, coverage: 0.25, bigram: 0.1, recency: 0.05, weight: 0.05 };
const LAMBDA = 0.7; // relevance vs. novelty in MMR
const MAX_PARTS = 3;

const bigrams = (toks) => {
  const out = new Set();
  for (let i = 0; i < toks.length - 1; i++) out.add(`${toks[i]} ${toks[i + 1]}`);
  return out;
};

const jaccard = (a, b) => {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
};

/**
 * @param candidates  [{ f, bm25, coverage }] from retrieve()
 * @param tokens      the understood query tokens
 * @returns { selected: [{ f, score, features }], confidence, considered }
 */
export const rerank = (candidates, tokens) => {
  if (!candidates.length) return { selected: [], confidence: 0, considered: 0 };
  const top = candidates[0].bm25 || 1;
  const qBig = bigrams(tokens.map(stem));

  const scored = candidates.map((c) => {
    const fTokens = tokenize(c.f.text).map(stem);
    const features = {
      lexical: c.bm25 / top,
      coverage: c.coverage,
      bigram: qBig.size ? [...bigrams(fTokens)].filter((b) => qBig.has(b)).length / qBig.size : 0,
      recency: /Affle · 2026/.test(c.f.cite?.label ?? '') ? 1 : 0,
      weight: Math.min(1, (c.f.weight - 0.9) / 0.4),
    };
    const score = Object.entries(WEIGHTS).reduce((s, [k, w]) => s + w * features[k], 0);
    return { f: c.f, score, features, tokens: new Set(fTokens) };
  });
  scored.sort((a, b) => b.score - a.score);

  // MMR: pick the best, then repeatedly the candidate that is relevant AND
  // least similar to what is already chosen; stop when relevance falls away.
  const selected = [scored[0]];
  const floor = scored[0].score * 0.45;
  while (selected.length < MAX_PARTS) {
    let best = null;
    let bestMmr = -Infinity;
    for (const c of scored) {
      if (selected.includes(c) || c.score < floor) continue;
      const sim = Math.max(...selected.map((s) => jaccard(c.tokens, s.tokens)));
      if (sim > 0.5) continue; // near-duplicate of something already chosen
      const sameSource = selected.some((s) => s.f.cite?.label === c.f.cite?.label);
      const mmr = LAMBDA * c.score - (1 - LAMBDA) * sim - (sameSource ? 0.08 : 0);
      if (mmr > bestMmr) {
        bestMmr = mmr;
        best = c;
      }
    }
    if (!best || bestMmr < 0.15) break;
    selected.push(best);
  }

  // Confidence: how well the best fact covers the question, tempered by how
  // decisively it beat the field.
  const margin = scored.length > 1 ? Math.min(1, (scored[0].score - scored[1].score) / 0.3 + 0.5) : 1;
  const confidence = Math.min(1, 0.65 * scored[0].features.coverage + 0.25 * scored[0].features.lexical + 0.1 * margin);

  return {
    selected: selected.map(({ f, score, features }) => ({ f, score, features })),
    confidence,
    considered: scored.length,
  };
};
