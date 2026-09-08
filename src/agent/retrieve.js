// Lexical retrieval over the facts: BM25 with idf, term-frequency saturation
// and length normalisation. Coverage is idf-weighted, so missing the one
// informative word in a question ("name") costs more than missing "full".

import { facts } from './knowledge';
import { tokenize, stem } from './query';

const K1 = 1.2;
const B = 0.75;

// Index ----------------------------------------------------------------------
const index = new Map(); // fact id -> { tf: Map(term -> count), len }
const df = new Map();
let totalLen = 0;

for (const f of facts) {
  const terms = [...f.keys, ...tokenize(f.text)].map(stem);
  const tf = new Map();
  for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + 1);
  index.set(f.id, { tf, len: terms.length });
  totalLen += terms.length;
  for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
}
const avgLen = totalLen / facts.length;
const N = facts.length;

const idf = (t) => Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));

/** Query terms worth scoring: stemmed, deduplicated, not ubiquitous. */
const contentTerms = (tokens) => [...new Set(tokens.map(stem))].filter((t) => (df.get(t) ?? 0) <= N * 0.2);

const bm25 = (factId, terms) => {
  const { tf, len } = index.get(factId);
  let s = 0;
  const matched = [];
  for (const t of terms) {
    const f = tf.get(t);
    if (!f) continue;
    matched.push(t);
    s += idf(t) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * len) / avgLen)));
  }
  return { s, matched };
};

/**
 * Retrieve candidates for a token list.
 * Returns [{ f, bm25, matched, coverage }] sorted by score, top `k`.
 */
export const retrieve = (tokens, k = 12) => {
  const terms = contentTerms(tokens);
  if (!terms.length) return { terms, candidates: [] };
  const totalIdf = terms.reduce((a, t) => a + idf(t), 0) || 1;
  const candidates = [];
  for (const f of facts) {
    const { s, matched } = bm25(f.id, terms);
    if (s > 0) candidates.push({ f, bm25: s * f.weight, matched, coverage: matched.reduce((a, t) => a + idf(t), 0) / totalIdf });
  }
  candidates.sort((a, b) => b.bm25 - a.bm25);
  return { terms, candidates: candidates.slice(0, k) };
};

/** Every fact's text, lower-cased, for the output faithfulness check. */
export const CORPUS = facts.map((f) => f.text.toLowerCase()).join('\n');
