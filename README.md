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
types leaves their browser.

- `src/agent/knowledge.js` derives a list of **facts** from `src/data/resume.js`. Each fact is one
  sentence with the words a question might use to reach it and the citation it resolves to
  (a project, a role with its years, the Stack, Work rights…).
- `src/agent/retriever.js` normalises the question (stop words, a synonym table so "visa" reaches
  "sponsorship" and "QA" reaches "testing"), then tries three things in order: a small set of
  **intents** for the questions recruiters actually ask (production agents, sponsorship, current role,
  solo work, evals, mentoring, RAG, contact, summary…); a **skill lookup** ("does he know Python?");
  and finally **keyword scoring** (idf-weighted overlap) against every fact. Below a confidence
  threshold it answers "that's not in the résumé".
- `src/components/AskPanel.jsx` renders the conversation and streams each answer character by
  character (`useTypewriter`), instant under `prefers-reduced-motion`.

Because the facts are generated from `resume.js`, updating the résumé updates the agent. If you add
a new kind of question, add an intent in `retriever.js`; the test harness is simply calling
`answer('…')` and reading the parts.

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
