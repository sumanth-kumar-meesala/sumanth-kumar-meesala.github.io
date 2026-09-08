# Sumanth Kumar Meesala — Portfolio

Live: https://sumanth-kumar-meesala.github.io/

**Senior AI Engineer · LLM & Agent Applications · Melbourne, VIC · Australian citizen**

11+ years shipping production Node.js, React and Angular systems — now an AI-native product engineer
building LLM-powered features, autonomous agents and multi-step agentic workflows on AWS.
At Affle: core contributor to Blueprix (MCP-enabled agent orchestration), owner of Qrank
(360° review platform used by 600+ employees globally), mentor to the AI team.

## The idea: ask my résumé

The portfolio is an agent. The first screen is a conversation: a recruiter asks the questions they
were going to ask anyway ("has he shipped agents to production, or just demos?", "does he need
sponsorship?") and gets an answer in which **every sentence is a fact from the résumé, followed by a
citation chip** that scrolls to the section it came from. If the résumé doesn't cover something —
salary, notice period, weaknesses — the agent says so and points to the email address rather than
guessing.

A sticky rail on the left carries the facts a recruiter needs without asking: current role, work
rights, availability, the résumé download and the email. Below the conversation the same content is
laid out as readable sections (Work, Experience, Stack, Education, Contact) for anyone who would
rather scan than ask.

### How the agent works

There is no model and no network call — the site is static on GitHub Pages and nothing a visitor
types leaves their browser. What there *is* is the shape of a production LLM pipeline, each step
visible under every reply as "how I answered":

1. **Input guardrails** (`src/agent/guardrails.js`) — prompt-injection patterns ("ignore previous
   instructions", role-play, fake system tags, "reveal your prompt"), abuse, requests for personal
   data a hiring process should not touch (age, family, religion, address…), out-of-scope tasks
   (poems, general definitions, other people) and small talk. Everything blocked gets a plain,
   cite-free reply; nothing blocked reaches retrieval.
2. **Query understanding** (`src/agent/query.js`) — stop words, a synonym table ("visa" →
   sponsorship, "QA" → testing), typo correction against the résumé's own vocabulary
   ("featurs" → features), and follow-up resolution ("and at Archimedes?" inherits the previous
   topic).
3. **Routing + retrieval** (`src/agent/intents.js`, `src/agent/retrieve.js`) — a rule router
   hand-orders answers for the questions recruiters actually ask; everything else goes to BM25
   over the facts derived from `resume.js`.
4. **Reranking** (`src/agent/rerank.js`) — candidates are rescored on lexical score, term
   coverage, bigram overlap, recency and source weight, then selected with maximal marginal
   relevance so an answer never repeats itself.
5. **Grounding gate** — a confidence from coverage and margin decides whether to answer plainly,
   answer with a caveat, or say "that is not in the résumé".
6. **Composition** (`src/agent/compose.js`) — first-person résumé bullets are rewritten in the
   third person; nothing else is added.
7. **Output guardrails** — every sentence must carry a citation, every number in a cited sentence
   must occur in the résumé corpus, and the reply is length-capped.

`src/agent/knowledge.js` derives the **facts** from `src/data/resume.js`, each with the citation
it resolves to, so updating the résumé updates the agent.

### Evals

`npm test` runs `src/agent/evals.test.js`: ~30 golden recruiter questions with expected route and
citations, "not in the résumé" cases, prompt-injection attempts, small talk, personal-data and
abusive input, a follow-up, and invariants over every input (every cited sentence is a real fact,
every number is in the résumé, every trace starts with guardrails and ends with the output check,
determinism, latency). The GitHub Pages workflow runs lint, evals and build in that order — a
regression blocks the deploy.

## Design

| Token | Value |
| --- | --- |
| Paper | `#F4F2EC` / `#ECE9E0` |
| Ink | `#17201B` · secondary `#3E4640` · muted `#7A8279` |
| Forest (rail) | `#0E3B2E` |
| Mint / Moss (accents, citations) | `#A8D9BA` · `#1F6B4A` |
| Answers & headings | Newsreader |
| UI | DM Sans |
| Metadata, citations | DM Mono |

## Content

All copy is generated from [`src/data/resume.js`](src/data/resume.js), which mirrors the current
résumé verbatim. **To update the site after a résumé change, edit that one file** — the sections
and the agent both render from it and hold no copy of their own.

## Stack

- React 19 + Vite
- Tailwind CSS 3
- Framer Motion (scroll reveals)
- lucide-react

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the build locally
```

Deploys to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`.
