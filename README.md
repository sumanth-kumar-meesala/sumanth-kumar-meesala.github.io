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

The page runs a real LLM pipeline. Everything except the model runs in the visitor's browser and
every step is visible under each reply as "how I answered":

1. **Input guardrails** (`src/agent/guardrails.js`) — prompt-injection patterns ("ignore previous
   instructions", role-play, fake system tags, "reveal your prompt"), abuse, requests for personal
   data a hiring process should not touch, salary/notice questions the résumé cannot answer,
   out-of-scope tasks and small talk. Everything blocked gets a plain, cite-free reply and
   **never reaches the model**.
2. **Query understanding** (`src/agent/query.js`) — stop words, a synonym table, typo correction
   against the résumé's own vocabulary, follow-up resolution ("and at Archimedes?").
3. **Routing + retrieval** (`src/agent/intents.js`, `src/agent/retrieve.js`) — a rule router picks
   the facts for the questions recruiters actually ask; BM25 (idf-weighted coverage) over the facts
   derived from `resume.js` covers everything else.
4. **Reranking** (`src/agent/rerank.js`) — candidates rescored on lexical score, coverage, bigram
   overlap, recency and source weight, selected with maximal marginal relevance.
5. **Generation** (`src/agent/generate.js` → `proxy/`) — the question, the last three turns and up
   to ten retrieved facts go to a Cloudflare Worker that holds the Groq key and a pinned system
   prompt. The model is `openai/gpt-oss-120b`, with `llama-3.3-70b-versatile` as fallback on rate
   limits or outages. It must cite facts as `[n]`; the page maps those back to citation chips.
   If the proxy is unreachable or not configured, `src/agent/compose.js` composes an answer locally
   from the same facts.
6. **Output guardrails** — sentences without a citation are kept but marked; any sentence whose
   number does not occur in the résumé is dropped (whole-number match, so "25" does not pass
   because "81.25" exists); dangling `[n]` references are removed; the reply is length-capped.

`src/agent/knowledge.js` derives the **facts** from `src/data/resume.js`, each with the citation
it resolves to, so updating the résumé updates the agent.

### The proxy and the key

The site is static, so the Groq key cannot live in the frontend. It lives in **GitHub Actions
secrets** and is pushed to the worker at deploy time; it never enters the repository.

One-time setup:

1. Create a free Cloudflare account, note the **Account ID** (Workers & Pages overview), and
   create an **API token** with the "Edit Cloudflare Workers" template.
2. In the GitHub repo → Settings → Secrets and variables → Actions, add three **secrets**:
   `GROQ_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
3. Run the **Deploy Groq proxy** workflow (Actions tab → Run workflow). It prints the worker URL,
   e.g. `https://ask-sumanth.<account>.workers.dev`.
4. Add that URL as the repository **variable** `VITE_ASK_ENDPOINT` and re-run the Pages deploy.

The worker (`proxy/src/worker.js`) only accepts POSTs from the origins listed in
`proxy/wrangler.toml`, caps question/fact/history sizes, and returns 429 with `Retry-After` when
both models are rate limited. Rotate the key in the Groq console if it is ever shared.

Locally: copy `.env.example` to `.env`, set `VITE_ASK_ENDPOINT`, and `npm run dev`. Without it
the agent answers in local mode.

### Evals

`npm test` runs two suites. `src/agent/evals.test.js`: golden recruiter questions with expected
route and citations, "not in the résumé" cases, prompt injection (asserted to never reach the
generator), small talk, personal-data and abusive input, follow-ups, a **model mode** with a fake
generator (citation mapping, dangling references, invented numbers dropped, markdown stripped,
fallback when the model fails), and invariants over every input. `proxy/worker.test.js`: CORS,
validation, size caps, model fallback and key handling with Groq stubbed. The Pages workflow runs
lint → evals → build, so a regression blocks the deploy.

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
- Cloudflare Worker + Groq (`openai/gpt-oss-120b`) for generation

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
