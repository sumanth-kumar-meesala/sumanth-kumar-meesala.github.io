// Rule-based router for the questions recruiters actually ask. When a rule
// fires it supplies an ordered, hand-composed set of facts; when none fires
// the pipeline falls back to ranked retrieval. Every part still cites.

import { byId, bullet, CITES, profile, experience, skillGroups, workRights } from './knowledge';
import { scoreFacts } from './retrieve';

// --- intents --------------------------------------------------------------
// Each intent: `when` tests the normalised tokens; `answer` returns parts.
// A part is { text, cite } — text is spoken, cite is shown beside it.

const has = (toks, ...words) => words.some((w) => toks.includes(w));
const part = (fact, text) => (fact ? { text: text ?? fact.text, cite: fact.cite } : null);
const parts = (...ps) => ps.filter(Boolean);

const affle = experience.find((e) => e.company === 'Affle');

const COMPANY = { dashanalysis: 'dashanalysis', dash: 'dashanalysis', blaque: 'blaque', fracture: 'blaque', archimedes: 'archimedes', blockfreight: 'blockfreight', contenterra: 'contenterra' };

export const INTENTS = [
  {
    id: 'company',
    when: (t) => t.some((x) => COMPANY[x]),
    answer: (t) => {
      const key = t.find((x) => COMPANY[x]);
      const r = experience.find((e) => e.company.toLowerCase().startsWith(COMPANY[key]));
      if (!r) return [];
      return parts(part(byId(`${r.company}-role`)), ...r.bullets.slice(0, 3).map((_, i) => part(byId(`${r.company}-b${i}`))));
    },
  },
  {
    id: 'compensation',
    when: (t) => has(t, 'compensation', 'availability') && !has(t, 'sponsorship', 'citizen'),
    answer: () =>
      parts(
        { text: 'That is not in the résumé — salary, notice period and working arrangements are for a conversation, not a document.', cite: null },
        { text: `He is open to senior AI roles; the fastest route is an email to ${profile.email}.`, cite: CITES.contact },
      ),
  },
  {
    id: 'weakness',
    when: (t) => has(t, 'weakness'),
    answer: () =>
      parts(
        { text: 'The résumé does not cover weaknesses or failures, so this agent will not invent any.', cite: null },
        { text: 'What it does say: he is strongest where unclear product requirements meet hard system constraints — which is also where things go wrong first.', cite: CITES.profile },
      ),
  },
  {
    id: 'education',
    when: (t) => has(t, 'education', 'deakin', 'wam'),
    answer: () => parts(part(byId('edu-0')), part(byId('edu-1'))),
  },
  {
    id: 'rights',
    when: (t) => has(t, 'sponsorship', 'citizen', 'australia', 'melbourne') || (has(t, 'location') && !has(t, 'stack', 'education')),
    answer: () => parts({ text: `No sponsorship needed. ${workRights.title} with ${workRights.body.charAt(0).toLowerCase()}${workRights.body.slice(1)}`, cite: CITES.rights }),
  },
  {
    id: 'contact',
    when: (t) => has(t, 'contact', 'linkedin', 'github'),
    answer: () =>
      parts(
        { text: `Email ${profile.email} — that is the fastest route.`, cite: CITES.contact },
        { text: `He is also on LinkedIn (${profile.linkedinLabel}) and GitHub (${profile.githubLabel}), and the résumé PDF is one click away in the sidebar.`, cite: CITES.contact },
      ),
  },
  {
    id: 'summary',
    when: (t) => has(t, 'summary') || (has(t, 'who') && t.length <= 2),
    answer: () =>
      parts(
        part(byId('lead')),
        part(byId('sub')),
        { text: `${workRights.title}, based in ${profile.location}.`, cite: CITES.rights },
      ),
  },
  {
    id: 'production-agents',
    when: (t) => has(t, 'production') && has(t, 'agent', 'llm'),
    answer: () =>
      parts(
        { text: 'Production, and still running.', cite: null },
        part(bullet('Affle', 'Blueprix'), `At Affle he is a core contributor to Blueprix, a state-machine-based, MCP-enabled agent-orchestration platform — he built its MCP servers and tool integration, multi-agent orchestration and checkpoint/resume state handling, and standardised model access on Amazon Bedrock.`),
        part(bullet('DashAnalysis', 'LangGraph')),
        part(byId('Content Factory-body-0'), 'He also runs one alone: Content Factory, an autonomous video pipeline on the Claude Agent SDK that has reached 600K+ views.'),
      ),
  },
  {
    id: 'current',
    when: (t) => has(t, 'affle', 'current') && !has(t, 'previous', 'before', 'earlier'),
    answer: () =>
      parts(
        { text: `${affle.role} at Affle, Melbourne, since ${affle.from.replace(' —', '')}.`, cite: CITES.role(affle) },
        part(bullet('Affle', 'Blueprix')),
        part(bullet('Affle', 'Qrank')),
        part(bullet('Affle', 'Mentor')),
      ),
  },
  {
    id: 'solo',
    when: (t) => has(t, 'alone', 'content', 'factory', 'youtube'),
    answer: () =>
      parts(
        part(byId('Content Factory-what'), 'Content Factory — an autonomous video pipeline he founded, built and runs alone.'),
        part(byId('Content Factory-body-0')),
        part(byId('Content Factory-figures')),
      ),
  },
  {
    id: 'evals',
    when: (t) => has(t, 'eval', 'testing', 'guardrails', 'observability', 'langfuse', 'tracing'),
    answer: () =>
      parts(
        part(bullet('Affle', 'evaluation and observability')),
        part(bullet('DashAnalysis', 'guardrail')),
        part(bullet('DashAnalysis', 'Jest')),
      ),
  },
  {
    id: 'mentoring',
    when: (t) => has(t, 'mentoring', 'leadership', 'team', 'junior', 'review', 'reviews'),
    answer: () =>
      parts(
        part(bullet('Affle', 'Mentor')),
        part(bullet('DashAnalysis', 'Mentored')),
        part(bullet('ContenTerra', 'mentored')),
      ),
  },
  {
    id: 'rag',
    when: (t) => has(t, 'rag', 'langchain', 'llamaindex', '40%', '40'),
    answer: () =>
      parts(
        part(bullet('DashAnalysis', 'RAG')),
        part(bullet('Affle', 'RAG context'), 'At Affle that carries into Blueprix, where he built the RAG context management and standardised embeddings on Amazon Bedrock (Titan Embeddings).'),
        part(byId('skills-03')),
      ),
  },
  {
    id: 'qrank',
    when: (t) => has(t, 'qrank', 'review', '360'),
    answer: () => parts(part(byId('Qrank-what')), part(byId('Qrank-body-0')), part(byId('Qrank-body-1'))),
  },
  {
    id: 'blueprix',
    when: (t) => has(t, 'blueprix', 'mcp'),
    answer: () => parts(part(byId('Blueprix-what')), part(byId('Blueprix-body-0')), part(byId('Blueprix-body-1'))),
  },
  {
    id: 'aws',
    when: (t) => has(t, 'aws', 'bedrock', 'ci', 'cd', 'ci/cd', 'cdk', 'docker', 'pipelines'),
    answer: () =>
      parts(
        part(byId('skills-06')),
        part(bullet('Affle', 'CI/CD')),
        part(bullet('DashAnalysis', 'Moose')),
      ),
  },
  {
    id: 'experience',
    when: (t) => has(t, 'experience') && t.length <= 2 && !has(t, 'stack', 'llm', 'agent', 'rag', 'react', 'aws'),
    answer: () =>
      parts(
        part(byId('stat-0'), 'Eleven-plus years in production, February 2015 to today, across six teams.'),
        part(byId('timeline')),
        part(byId('about-0')),
      ),
  },
  {
    id: 'stack',
    when: (t) => has(t, 'stack'),
    answer: (t) => {
      // A specific technology named? Answer about it; otherwise the headline groups.
      const named = skillGroups.filter((g) => g.items.some((it) => t.some((tok) => tok.length > 1 && it.toLowerCase().includes(tok))));
      if (named.length && t.length > 1) {
        return parts(...named.slice(0, 3).map((g) => part(byId(`skills-${g.n}`))));
      }
      return parts(part(byId('skills-01')), part(byId('skills-03')), part(byId('skills-05')), part(byId('skills-06')));
    },
  },
];

// Skill-group lookup: "what databases / testing / security has he done?"
const GROUP_WORDS = new Set(['data', 'testing', 'security', 'observability', 'leadership', 'cloud', 'languages']);
export const groupAnswer = (toks) => {
  const hit = skillGroups.find((g) => g.title.toLowerCase().split(/\W+/).some((w) => GROUP_WORDS.has(w) && toks.includes(w)));
  if (!hit) return null;
  const ps = [part(byId(`skills-${hit.n}`))];
  const top = scoreFacts(toks.join(' ')).find((x) => /-b\d+$/.test(x.f.id));
  if (top) ps.push(part(top.f));
  return ps;
};

// Technology lookup: "does he know Python / Angular / Playwright?"
export const techAnswer = (toks) => {
  const hits = [];
  for (const g of skillGroups) {
    for (const it of g.items) {
      const il = it.toLowerCase();
      if (toks.some((t) => t.length > 2 && (il === t || il.split(/[\s/(),.]+/).includes(t)))) hits.push({ g, it });
    }
  }
  if (!hits.length) return null;
  const seen = new Set();
  const ps = [];
  for (const { g, it } of hits) {
    if (seen.has(g.n)) continue;
    seen.add(g.n);
    ps.push({ text: `Yes — ${it} is in his ${g.title} set, alongside ${g.items.filter((x) => x !== it).slice(0, 5).join(', ')}.`, cite: CITES.stack });
    if (ps.length === 2) break;
  }
  // Add the strongest bullet that mentions it, if any.
  const top = scoreFacts(toks.join(' ')).find((x) => /-b\d+$/.test(x.f.id));
  if (top) ps.push(part(top.f));
  return ps;
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
