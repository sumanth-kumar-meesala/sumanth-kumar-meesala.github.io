// Query understanding: normalisation, synonym expansion, typo correction and
// follow-up resolution. Pure functions; the vocabulary comes from the facts.

import { facts } from './knowledge';

const SYNONYMS = {
  visa: 'sponsorship', sponsor: 'sponsorship', sponsored: 'sponsorship', pr: 'citizen', citizenship: 'citizen',
  rights: 'sponsorship', relocate: 'location', relocation: 'location', where: 'location', lives: 'location', living: 'location',
  gpt: 'openai', chatgpt: 'openai', llms: 'llm', models: 'llm', model: 'llm', genai: 'llm', ai: 'llm',
  tests: 'testing', test: 'testing', tested: 'testing', qa: 'testing', evals: 'eval', evaluate: 'eval', evaluation: 'eval', evaluations: 'eval',
  hallucination: 'eval', hallucinations: 'eval', quality: 'eval', reliable: 'eval', reliability: 'eval',
  mentor: 'mentoring', mentors: 'mentoring', mentored: 'mentoring', coach: 'mentoring', lead: 'leadership', led: 'leadership', leading: 'leadership', manage: 'leadership', managed: 'leadership', management: 'leadership', manager: 'leadership',
  cloud: 'aws', devops: 'aws', infra: 'aws', infrastructure: 'aws', serverless: 'aws', lambda: 'aws',
  frontend: 'react', 'front-end': 'react', ui: 'react', backend: 'node', 'back-end': 'node', nodejs: 'node', 'node.js': 'node',
  js: 'javascript', ts: 'typescript', db: 'data', database: 'data', databases: 'data', sql: 'data', storage: 'data', postgres: 'postgresql', secure: 'security', auth: 'security', authentication: 'security', monitoring: 'observability', logging: 'observability',
  cv: 'resume', résumé: 'resume', pdf: 'resume', download: 'resume',
  email: 'contact', reach: 'contact', call: 'contact', interview: 'contact', hire: 'contact', hiring: 'contact', phone: 'contact',
  youtube: 'content', video: 'content', videos: 'content', channel: 'content', solo: 'alone', own: 'alone', personal: 'alone', side: 'alone', hobby: 'alone', founder: 'alone',
  degree: 'education', university: 'education', uni: 'education', study: 'education', studied: 'education', masters: 'education', master: 'education', bachelor: 'education', school: 'education', college: 'education',
  years: 'experience', long: 'experience', career: 'experience', history: 'experience', timeline: 'experience', senior: 'experience',
  tools: 'stack', tech: 'stack', technologies: 'stack', technology: 'stack', skills: 'stack', language: 'languages', frameworks: 'stack',
  agents: 'agent', agentic: 'agent', orchestration: 'agent', autonomous: 'agent',
  retrieval: 'rag', embeddings: 'rag', vector: 'rag', search: 'rag',
  shipped: 'production', ship: 'production', shipping: 'production', prod: 'production', live: 'production', real: 'production', demo: 'production', demos: 'production',
  salary: 'compensation', pay: 'compensation', rate: 'compensation', money: 'compensation', notice: 'availability', start: 'availability', available: 'availability', contract: 'availability', remote: 'availability', hybrid: 'availability', onsite: 'availability',
  '30-second': 'summary', '30s': 'summary', seconds: 'summary', second: 'summary', nutshell: 'summary', version: 'summary', tldr: 'summary', overview: 'summary', pitch: 'summary', elevator: 'summary', short: 'summary', brief: 'summary', quick: 'summary', intro: 'summary', introduce: 'summary',
  daily: 'current', today: 'current', now: 'current', currently: 'current', role: 'current', job: 'current', affle: 'affle',
  government: 'public-sector', govt: 'public-sector', public: 'public-sector', council: 'public-sector', regulated: 'public-sector', acquired: 'acquired', acquisition: 'acquired', exit: 'acquired',
  weakness: 'weakness', weaknesses: 'weakness', bad: 'weakness', worst: 'weakness', fail: 'weakness', failed: 'weakness', failure: 'weakness',
};

const STOP = new Set(
  'whats whos hows a an the and or of to in on at for with by is are was were be been does do did has have had he his him this that these those it its can could would should will what which how why when much many any some about tell me show give please just really actually ever also than then there their they them from as into over under vs versus like anything something got get did work worked'.split(' '),
);

const rawTokens = (q) =>
  q
    .toLowerCase()
    .replace(/[’']/g, '')
    .split(/[^a-z0-9.+#-]+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ''))
    .filter(Boolean);

export const stem = (t) => t.replace(/(ing|ed|es|s)$/, '');

// --- typo correction against the résumé vocabulary ---------------------------

const VOCAB = new Set();
for (const f of facts) for (const t of rawTokens(f.text)) if (t.length >= 4) VOCAB.add(t);
for (const [k, v] of Object.entries(SYNONYMS)) {
  VOCAB.add(k);
  VOCAB.add(v);
}
for (const f of facts) for (const k of f.keys) if (k.length >= 4) VOCAB.add(k);

const editDistance = (a, b) => {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let last = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a[i - 1] === b[j - 1] ? 0 : 1));
      last = tmp;
    }
  }
  return prev[b.length];
};

/** Nearest vocabulary word within one edit (two for long words), or null. */
const correct = (t) => {
  if (t.length < 5 || VOCAB.has(t) || STOP.has(t) || SYNONYMS[t]) return null;
  const limit = t.length >= 8 ? 2 : 1;
  let best = null;
  let bestD = limit + 1;
  for (const v of VOCAB) {
    if (v[0] !== t[0]) continue; // first letter is almost always right
    const d = editDistance(t, v);
    if (d < bestD) {
      bestD = d;
      best = v;
    }
  }
  return best;
};

/**
 * Tokenise a question: lowercase, drop stop words, fix typos, map synonyms.
 * Returns { tokens, corrections: [[from, to]] }.
 */
export const understand = (q) => {
  const corrections = [];
  const tokens = [];
  for (const raw of rawTokens(q)) {
    if (STOP.has(raw)) continue;
    let t = raw;
    const fixed = correct(t);
    if (fixed) {
      corrections.push([t, fixed]);
      t = fixed;
    }
    const syn = SYNONYMS[t];
    if (syn && syn !== t) corrections.push([t, syn]);
    tokens.push(syn ?? t);
  }
  return { tokens, corrections };
};

/** Plain tokenizer used to index facts (no typo correction). */
export const tokenize = (q) =>
  rawTokens(q)
    .filter((t) => !STOP.has(t))
    .map((t) => SYNONYMS[t] ?? t);

// --- follow-up resolution -----------------------------------------------------

const LEADS = /^\s*(and|what about|how about|also|same for|what of|any more|more|else|then|why|when|which one|ok|okay|there|that one|those)\b/i;
const PRONOUN = /\b(that|it|those|them|there|the same|again)\b/i;

/**
 * A short question that leans on the previous one ("what about at Affle?")
 * inherits the previous content tokens so retrieval has something to hold.
 */
export const resolveFollowUp = (query, tokens, history) => {
  const prev = history?.length ? history[history.length - 1] : null;
  const leans = LEADS.test(query) || (tokens.length === 0 && PRONOUN.test(query));
  if (!prev || tokens.length > 4 || !leans) return { tokens, inherited: [] };
  const inherited = [...new Set(prev.tokens)].filter((t) => !tokens.includes(t)).slice(0, 4);
  return { tokens: [...tokens, ...inherited], inherited };
};
