// A small, deterministic retriever over the résumé. No model, no network:
// a question is matched to an intent when one clearly applies, otherwise
// scored against every fact by keyword overlap. Every sentence the agent
// says is a fact from knowledge.js, and every fact carries its citation.
// If nothing in the résumé answers the question, it says so.

import { facts, byId, bullet, project, CITES, profile, experience, skillGroups, workRights } from './knowledge';

// --- text normalisation ---------------------------------------------------

const SYNONYMS = {
  visa: 'sponsorship', sponsor: 'sponsorship', sponsored: 'sponsorship', pr: 'citizen', citizenship: 'citizen',
  rights: 'sponsorship', relocate: 'location', relocation: 'location', where: 'location', lives: 'location', living: 'location',
  gpt: 'openai', chatgpt: 'openai', llms: 'llm', models: 'llm', model: 'llm', genai: 'llm', ai: 'llm',
  tests: 'testing', test: 'testing', tested: 'testing', qa: 'testing', evals: 'eval', evaluate: 'eval', evaluation: 'eval', evaluations: 'eval',
  hallucination: 'eval', hallucinations: 'eval', quality: 'eval', reliable: 'eval', reliability: 'eval',
  mentor: 'mentoring', mentors: 'mentoring', mentored: 'mentoring', coach: 'mentoring', lead: 'leadership', led: 'leadership', leading: 'leadership', manage: 'leadership', managed: 'leadership', management: 'leadership', manager: 'leadership', people: 'leadership',
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
  'a an the and or of to in on at for with by is are was were be been does do did has have had he his him this that these those it its can could would should will what which how why when much many any some about tell me show give please just really actually ever also than then there their they them from as into over under vs versus like anything something got get did work worked'.split(' '),
);

export const tokenize = (q) =>
  q
    .toLowerCase()
    .replace(/[’']/g, '')
    .split(/[^a-z0-9.+#-]+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((t) => t && !STOP.has(t))
    .map((t) => SYNONYMS[t] ?? t);

const stem = (t) => t.replace(/(ing|ed|es|s)$/, '');

// --- fact scoring ---------------------------------------------------------

const factTokens = new Map();
for (const f of facts) {
  const toks = new Set([...f.keys, ...tokenize(f.text)].map(stem));
  factTokens.set(f.id, toks);
}
const df = new Map();
for (const toks of factTokens.values()) for (const t of toks) df.set(t, (df.get(t) ?? 0) + 1);
const idf = (t) => Math.log(1 + facts.length / (1 + (df.get(t) ?? 0)));

export const scoreFacts = (query) => {
  const qt = [...new Set(tokenize(query).map(stem))].filter((t) => (df.get(t) ?? 0) <= facts.length * 0.2);
  return facts
    .map((f) => {
      const toks = factTokens.get(f.id);
      let s = 0;
      for (const t of qt) if (toks.has(t)) s += idf(t);
      return { f, s: s * f.weight };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
};

// --- intents --------------------------------------------------------------
// Each intent: `when` tests the normalised tokens; `answer` returns parts.
// A part is { text, cite } — text is spoken, cite is shown beside it.

const has = (toks, ...words) => words.some((w) => toks.includes(w));
const part = (fact, text) => (fact ? { text: text ?? fact.text, cite: fact.cite } : null);
const parts = (...ps) => ps.filter(Boolean);

const affle = experience.find((e) => e.company === 'Affle');

const INTENTS = [
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
    when: (t) => has(t, 'experience') && !has(t, 'stack', 'llm', 'agent', 'rag', 'react', 'aws'),
    answer: () =>
      parts(
        part(byId('stat-0'), 'Eleven-plus years in production, February 2015 to today, across six teams.'),
        {
          text: experience
            .map((r) => `${r.company} (${r.role}, ${r.from.replace(' —', '')} – ${r.current ? 'present' : r.to})`)
            .join('; ') + '.',
          cite: CITES.experience,
        },
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
const groupAnswer = (toks) => {
  const hit = skillGroups.find((g) => g.title.toLowerCase().split(/\W+/).some((w) => GROUP_WORDS.has(w) && toks.includes(w)));
  if (!hit) return null;
  const ps = [part(byId(`skills-${hit.n}`))];
  const top = scoreFacts(toks.join(' ')).find((x) => x.f.id.includes('-b'));
  if (top) ps.push(part(top.f));
  return ps;
};

// Technology lookup: "does he know Python / Angular / Playwright?"
const techAnswer = (toks) => {
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
  const top = scoreFacts(toks.join(' ')).find((x) => x.f.id.includes('-b'));
  if (top) ps.push(part(top.f));
  return ps;
};

const NOT_IN_CV = () =>
  parts(
    { text: 'That is not in the résumé, so this agent will not guess.', cite: null },
    { text: `Ask Sumanth directly at ${profile.email} — or try one of the questions below.`, cite: CITES.contact },
  );

const GREETING = /^(hi|hello|hey|yo|g'?day|good (morning|afternoon|evening))\b/i;

/**
 * Answer a question. Returns { parts: [{text, cite}], intent }.
 * Pure and synchronous — the UI adds the streaming effect.
 */
export const answer = (query) => {
  const q = query.trim();
  if (!q) return { intent: 'empty', parts: parts({ text: 'Ask anything about the résumé — role, work rights, projects, stack.', cite: null }) };
  if (GREETING.test(q) && q.length < 24) {
    return { intent: 'greeting', parts: parts({ text: `Hello. I answer from Sumanth's résumé only, with a citation on every sentence. Try "has he shipped agents to production?" or "does he need sponsorship?"`, cite: null }) };
  }
  const toks = tokenize(q);

  for (const intent of INTENTS) {
    if (intent.when(toks)) {
      const ps = intent.answer(toks);
      if (ps.length) return { intent: intent.id, parts: ps };
    }
  }

  const group = groupAnswer(toks);
  if (group) return { intent: 'group', parts: group };

  const tech = techAnswer(toks);
  if (tech) return { intent: 'tech', parts: tech };

  const ranked = scoreFacts(q);
  const top = ranked[0];
  if (top && top.s >= 1.2) {
    // Keep the answer tight: up to three facts, none from the same source twice.
    const chosen = [];
    const seen = new Set();
    for (const { f, s } of ranked) {
      if (s < top.s * 0.45) break;
      const key = f.cite?.label ?? f.id;
      if (seen.has(key)) continue;
      seen.add(key);
      chosen.push(part(f));
      if (chosen.length === 3) break;
    }
    return { intent: 'search', parts: chosen };
  }
  return { intent: 'none', parts: NOT_IN_CV() };
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

export { project };
