// Composition: turn chosen facts into a reply. The résumé is written in the
// first person; the agent speaks about Sumanth in the third. Nothing is added
// beyond a lead-in — the output guardrail checks the numbers regardless.

const VERBS = {
  own: 'owns', mentor: 'mentors', build: 'builds', run: 'runs', operate: 'operates', use: 'uses', ship: 'ships',
  start: 'starts', spend: 'spends', design: 'designs', lead: 'leads', write: 'writes', work: 'works', have: 'has',
  do: 'does', am: 'is', was: 'was', maintain: 'maintains', review: 'reviews', deliver: 'delivers', integrate: 'integrates',
  architect: 'architects', manage: 'manages', deploy: 'deploys', test: 'tests', still: 'still',
};
const VERB_RE = new RegExp(`\\bI (still |also |now |currently )?(${Object.keys(VERBS).filter((v) => v !== 'still').join('|')})\\b`, 'g');

/** First person → third person, conservatively. */
export const thirdPerson = (text) =>
  text
    .replace(VERB_RE, (m, adv, v) => `he ${adv ?? ''}${VERBS[v]}`)
    .replace(/\bI'm\b/g, 'he is')
    .replace(/\bI've\b/g, 'he has')
    .replace(/\bI\b/g, 'he')
    .replace(/\bmy\b/g, 'his')
    .replace(/\bMy\b/g, 'His')
    .replace(/\bme\b/g, 'him')
    .replace(/\bmyself\b/g, 'himself')
    .replace(/(^|[.!?]\s+)he\b/g, (m, p) => `${p}He`)
    .replace(/(^|[.!?]\s+)his\b/g, (m, p) => `${p}His`);

/** Keep a fact to its first two sentences so an answer stays readable. */
export const trim = (text, max = 2) => {
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z“"(])/);
  return sentences.slice(0, max).join(' ').trim();
};

const LEAD = {
  yes: 'Yes.',
  hedge: 'The résumé does not answer that directly; the closest thing it says:',
};

/**
 * @param selected  [{ f }] from rerank
 * @param opts      { hedge: boolean, yes: boolean }
 * @returns parts [{ text, cite, meta? }]
 */
export const compose = (selected, { hedge = false, yes = false } = {}) => {
  const parts = [];
  if (hedge) parts.push({ text: LEAD.hedge, meta: true });
  else if (yes) parts.push({ text: LEAD.yes, meta: true });
  for (const { f } of selected) parts.push({ text: thirdPerson(trim(f.text)), cite: f.cite });
  return parts;
};

/** Apply the same voice to hand-composed router parts. */
export const voice = (parts) =>
  parts.map((p) => {
    if (!p || !p.text) return p;
    if (!p.cite) return { ...p, meta: true };
    return { ...p, text: thirdPerson(p.text) };
  });
