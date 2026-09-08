// Rule router for the questions recruiters ask most. A rule that fires
// returns the facts that answer it, in the order they should be read; the
// generator (or the local composer) turns them into prose.

import { byId, bullet, experience, skillGroups } from './knowledge';

const has = (toks, ...words) => words.some((w) => toks.includes(w));
const list = (...fs) => fs.filter(Boolean);

const COMPANY = {
  dashanalysis: 'dashanalysis', dash: 'dashanalysis', blaque: 'blaque', fracture: 'blaque',
  archimedes: 'archimedes', blockfreight: 'blockfreight', contenterra: 'contenterra',
};

const INTENTS = [
  {
    id: 'name',
    when: (t) => has(t, 'name', 'called', 'surname'),
    facts: () => list(byId('name')),
  },
  {
    id: 'education',
    when: (t) => has(t, 'education', 'deakin', 'wam'),
    facts: () => list(byId('edu-0'), byId('edu-1')),
  },
  {
    id: 'rights',
    when: (t) => has(t, 'sponsorship', 'citizen', 'australia', 'melbourne') || (has(t, 'location') && !has(t, 'stack', 'education')),
    facts: () => list(byId('rights')),
  },
  {
    id: 'contact',
    when: (t) => has(t, 'contact', 'linkedin', 'github'),
    facts: () => list(byId('contact'), byId('rights')),
  },
  {
    id: 'summary',
    when: (t) => has(t, 'summary') || (has(t, 'who') && t.length <= 2),
    facts: () => list(byId('name'), byId('lead'), byId('sub'), byId('rights')),
  },
  {
    id: 'production-agents',
    when: (t) => has(t, 'production') && has(t, 'agent', 'llm'),
    facts: () => list(bullet('Affle', 'Blueprix'), bullet('DashAnalysis', 'LangGraph'), byId('Content Factory-body-0'), byId('Content Factory-figures')),
  },
  {
    id: 'current',
    when: (t) => has(t, 'affle', 'current') && !has(t, 'previous', 'before', 'earlier'),
    facts: () => list(byId('Affle-role'), bullet('Affle', 'Blueprix'), bullet('Affle', 'Qrank'), bullet('Affle', 'Mentor')),
  },
  {
    id: 'company',
    when: (t) => t.some((x) => COMPANY[x]),
    facts: (t) => {
      const r = experience.find((e) => e.company.toLowerCase().startsWith(COMPANY[t.find((x) => COMPANY[x])]));
      return r ? list(byId(`${r.company}-role`), ...r.bullets.slice(0, 4).map((_, i) => byId(`${r.company}-b${i}`))) : [];
    },
  },
  {
    id: 'solo',
    when: (t) => has(t, 'alone', 'content', 'factory', 'youtube'),
    facts: () => list(byId('Content Factory-what'), byId('Content Factory-body-0'), byId('Content Factory-figures')),
  },
  {
    id: 'evals',
    when: (t) => has(t, 'eval', 'testing', 'guardrails', 'observability', 'langfuse', 'tracing'),
    facts: () => list(bullet('Affle', 'evaluation and observability'), bullet('DashAnalysis', 'guardrail'), bullet('DashAnalysis', 'Jest'), byId('skills-08')),
  },
  {
    id: 'mentoring',
    when: (t) => has(t, 'mentoring', 'leadership', 'team', 'junior', 'review', 'reviews'),
    facts: () => list(bullet('Affle', 'Mentor'), bullet('DashAnalysis', 'Mentored'), bullet('ContenTerra', 'mentored'), byId('skills-11')),
  },
  {
    id: 'rag',
    when: (t) => has(t, 'rag', 'langchain', 'llamaindex', '40%', '40'),
    facts: () => list(bullet('DashAnalysis', 'RAG'), bullet('Affle', 'RAG context'), byId('skills-03')),
  },
  {
    id: 'qrank',
    when: (t) => has(t, 'qrank', 'review', '360'),
    facts: () => list(byId('Qrank-what'), byId('Qrank-body-0'), byId('Qrank-body-1'), byId('Qrank-figures')),
  },
  {
    id: 'blueprix',
    when: (t) => has(t, 'blueprix', 'mcp'),
    facts: () => list(byId('Blueprix-what'), byId('Blueprix-body-0'), byId('Blueprix-body-1')),
  },
  {
    id: 'aws',
    when: (t) => has(t, 'aws', 'bedrock', 'ci', 'cd', 'ci/cd', 'cdk', 'docker', 'pipelines'),
    facts: () => list(byId('skills-06'), bullet('Affle', 'CI/CD'), bullet('DashAnalysis', 'Moose')),
  },
  {
    id: 'experience',
    when: (t) => has(t, 'experience') && t.length <= 2 && !has(t, 'stack', 'llm', 'agent', 'rag', 'react', 'aws'),
    facts: () => list(byId('stat-0'), byId('timeline'), byId('about-0')),
  },
  {
    id: 'stack',
    when: (t) => has(t, 'stack'),
    facts: (t) => {
      const named = skillGroups.filter((g) => g.items.some((it) => t.some((tok) => tok.length > 1 && it.toLowerCase().includes(tok))));
      const groups = named.length && t.length > 1 ? named.slice(0, 3) : skillGroups.filter((g) => g.emphasis).concat(skillGroups.slice(4, 6));
      return list(...groups.map((g) => byId(`skills-${g.n}`)));
    },
  },
];

// Skill-group and single-technology lookups: "what databases?", "does he know Python?"
const GROUP_WORDS = new Set(['data', 'testing', 'security', 'observability', 'leadership', 'cloud', 'languages']);

const lookupFacts = (toks) => {
  const group = skillGroups.find((g) => g.title.toLowerCase().split(/\W+/).some((w) => GROUP_WORDS.has(w) && toks.includes(w)));
  if (group) return { id: `group:${group.n}`, facts: list(byId(`skills-${group.n}`)) };
  const hits = [];
  for (const g of skillGroups) {
    for (const it of g.items) {
      const il = it.toLowerCase();
      if (toks.some((t) => t.length > 2 && (il === t || il.split(/[\s/(),.]+/).includes(t)))) hits.push(g);
    }
  }
  const groups = [...new Set(hits)].slice(0, 2);
  return groups.length ? { id: `tech:${groups.map((g) => g.n).join('+')}`, facts: list(...groups.map((g) => byId(`skills-${g.n}`))) } : null;
};

/** Route a token list: { id, facts } or null. */
export const route = (toks) => {
  const intent = INTENTS.find((i) => i.when(toks));
  if (intent) {
    const facts = intent.facts(toks);
    if (facts.length) return { id: intent.id, facts };
  }
  return lookupFacts(toks);
};

export const SUGGESTED = [
  'Has he shipped agents to production, or just demos?',
  'Does he need visa sponsorship?',
  'What does he do at Affle day to day?',
  'Show me something he built alone',
  'How does he test LLM features?',
  'Has he mentored engineers?',
  'Give me the 30-second version',
  'Does he know Python?',
];
