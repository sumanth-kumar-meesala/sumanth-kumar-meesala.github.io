// Local composition — the fallback when the generator is unreachable or not
// configured. The résumé is written in the first person; the agent speaks
// about Sumanth in the third. Nothing is added beyond a lead-in.

const VERBS = {
  own: 'owns', mentor: 'mentors', build: 'builds', run: 'runs', operate: 'operates', use: 'uses', ship: 'ships',
  start: 'starts', spend: 'spends', design: 'designs', lead: 'leads', write: 'writes', work: 'works', have: 'has',
  do: 'does', am: 'is', maintain: 'maintains', review: 'reviews', deliver: 'delivers', integrate: 'integrates',
  architect: 'architects', manage: 'manages', deploy: 'deploys', test: 'tests',
};
const VERB_RE = new RegExp(`\\bI (still |also |now |currently )?(${Object.keys(VERBS).join('|')})\\b`, 'g');

/** First person → third person, conservatively. */
const thirdPerson = (text) =>
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
const trim = (text, max = 2) => text.split(/(?<=[.!?])\s+(?=[A-Z“"(])/).slice(0, max).join(' ').trim();

/**
 * @param facts   ordered facts to speak
 * @param hedge   prefix a caveat when grounding was weak
 * @returns parts [{ text, cite, meta? }]
 */
export const compose = (facts, { hedge = false } = {}) => {
  const parts = [];
  if (hedge) parts.push({ text: 'The résumé does not answer that directly; the closest thing it says:', meta: true });
  for (const f of facts) parts.push({ text: thirdPerson(trim(f.text)), cite: f.cite });
  return parts;
};
