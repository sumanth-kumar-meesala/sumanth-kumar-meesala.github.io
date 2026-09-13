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

The agent is a **LangGraph state graph**, not a prompt. Every answer walks the same nodes in order,
each one recorded and shown under the reply as "how I answered" — the steps stream in as they
happen, so the wait is the agent working rather than a spinner.

```
BROWSER (static, GitHub Pages)              WORKER (Cloudflare, LangGraph)
guardrails tier 1                           screen ──blocked──────────────► verify ─► END
  │ blocked → refused with zero                │ ok
  │           network calls                    ▼
  │ ok                                      retrieve ─► rerank
  ▼                                            ▲            │
POST /ask (SSE) ─────────────────────────►     │            ▼
  │ ◄── one frame per step (live trace)        │        generate ──failed──► compose
  │ ◄── done: answer, citations, traceId       │            │ ok
  ▼ worker unreachable                         └── judge ───┘
offline composer (same modules, no model)
```

1. **Input guardrails** (`src/agent/guardrails.js`) — prompt-injection patterns ("ignore previous
   instructions", role-play, fake system tags, "reveal your prompt"), abuse, requests for personal
   data a hiring process should not touch, salary/notice questions the résumé cannot answer,
   out-of-scope tasks and small talk. Rule-based on purpose: every refusal is explainable.
   This runs **in the browser first**, so an injection is refused with no network call at all — and
   again in the worker, because a public endpoint cannot trust a client's verdict.
2. **Tier 2 screening** (`proxy/src/guard.js`) — `llama-prompt-guard-2-86m` gets a second opinion on
   whatever the rules let through. It can only ever tighten: an unrecognised reply counts as "no
   opinion" and tier 1 stands.
3. **Query understanding** (`src/agent/query.js`) — stop words, a synonym table, typo correction
   against the résumé's own vocabulary, follow-up resolution ("and at Archimedes?").
4. **Routing + retrieval** (`src/agent/intents.js`, `src/agent/retrieve.js`) — a rule router picks
   the facts for the questions recruiters actually ask; BM25 over the facts derived from `resume.js`
   covers everything else.
5. **Reranking** (`src/agent/rerank.js`) — candidates rescored on lexical score, coverage, bigram
   overlap, recency and source weight, selected with maximal marginal relevance.
6. **Generation** — up to ten retrieved facts and the last three turns go to `openai/gpt-oss-120b`
   on Groq, with `llama-3.3-70b-versatile` as fallback. The model must cite facts as `[n]`; the page
   maps those back to citation chips.
7. **LLM as judge** (`proxy/src/judge.js`) — a second pass reads the answer back against the facts it
   was meant to come from and scores it for groundedness and completeness. **Below 0.6 the graph
   loops back to retrieval**, widening the search with the terms the judge says are missing, and
   writes again — once. A typical turn costs two model calls; the worst case is four.
8. **Output guardrails** — the last word on every path, refusals included. Uncited sentences are
   dropped, any number that does not occur in the résumé is dropped (whole-number match, so "25"
   does not pass because "81.25" exists), dangling `[n]` references are removed, length is capped.

The judge never decides what ships. A bad score buys one more attempt; `screenOutput` still has the
final say.

**The same modules run in both places.** `retrieve.js`, `rerank.js`, `intents.js`, `guardrails.js`,
`ground.js` and `compose.js` are plain ESM with no browser or bundler globals — the worker imports
them directly. There is one BM25, one MMR and one output screen in this repo; they just execute in
two runtimes. When the worker is unreachable the browser answers from those same modules, without a
model, so the agent degrades rather than fails.

`src/agent/knowledge.js` derives the **facts** from `src/data/resume.js`, each with the citation
it resolves to, so updating the résumé updates the agent.

### Observability

Both tools are optional — with no keys set the agent answers identically.

- **LangSmith** traces the graph. It needs no integration code: `nodejs_compat` populates
  `process.env` from the worker's secrets, so `LANGSMITH_TRACING` and `LANGSMITH_API_KEY` are the
  whole of it. This is the debugging surface — every node, every model call, every retry.
- **Langfuse** (`proxy/src/observability.js`) is instrumented by hand from the base SDK, carrying
  the things worth *showing* rather than debugging: the guardrail verdict, the judge's score,
  whether a retry fired. It also owns the eval dataset (`scripts/langfuse-seed.js`) and the 👍/👎
  a visitor can leave on any answer, which posts to the worker's `/score` route.

### The proxy and the key

The site is static, so the Groq key cannot live in the frontend. It lives in **GitHub Actions
secrets** and is pushed to the worker at deploy time; it never enters the repository.

One-time setup:

1. Create a free Cloudflare account, note the **Account ID** (Workers & Pages overview), and
   create an **API token** with the "Edit Cloudflare Workers" template.
2. In the GitHub repo → Settings → Secrets and variables → Actions, add three **secrets**:
   `GROQ_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Optionally add
   `LANGSMITH_API_KEY` + `LANGSMITH_TRACING`, and `LANGFUSE_PUBLIC_KEY` + `LANGFUSE_SECRET_KEY`;
   the deploy pushes whichever are present and skips the rest.
3. Run the **Deploy Groq proxy** workflow (Actions tab → Run workflow). It prints the worker URL,
   e.g. `https://ask-sumanth.<account>.workers.dev`.
4. Add that URL as the repository **variable** `VITE_ASK_ENDPOINT` and re-run the Pages deploy.

The worker only accepts POSTs from the origins listed in `proxy/wrangler.toml`, caps question and
history sizes, **ignores any `facts` in the request** (it retrieves its own, so nothing can be
planted in the model's context), and returns 429 with `Retry-After` when both models are rate
limited. `JUDGE_MODEL` and `GUARD_MODEL` can each be set to `""` to switch off the second pass or
tier-2 screening. The bundle is ~549 KiB gzipped, inside the Workers free-plan cap.

Locally: copy `.env.example` to `.env`, set `VITE_ASK_ENDPOINT`, and `npm run dev`. Without it
the agent answers offline from the résumé in the bundle.

### Evals

`npm test` runs 275 tests across eight files. The cases live in one table,
`src/agent/evals.cases.js`, shared by three consumers — the suite asserts on them, `scripts/evals.js`
measures them into the public metrics panel, and `scripts/langfuse-seed.js` uploads them as a
Langfuse dataset. Add a case once and it lands everywhere.

- `src/agent/evals.test.js` — golden recruiter questions with expected route and citations, "not in
  the résumé" cases, prompt injection (asserted to stop at the guardrail, with nothing downstream in
  the trace), small talk, personal-data and abusive input, follow-ups, and invariants over every
  input.
- `proxy/graph.test.js` — generation, citation mapping, invented numbers, the judge and its retry
  cycle, tier-2 screening, and 68 cases asserting the browser's offline path and the graph give
  byte-identical answers.
- `proxy/worker.test.js`, `judge.test.js`, `guard.test.js`, `observability.test.js` — CORS, size
  caps, model fallback, server-side screening, judge and guard parsing, and that a dead Langfuse
  can never cost a visitor an answer.
- `src/agent/remote.test.js`, `stages.test.js` — SSE frame parsing, the offline fallback, and that
  the pipeline diagram cannot drift from the stages the agent emits.

The Pages workflow runs lint → tests → build, so a regression blocks the deploy. `npm run build`
also regenerates `src/data/evals.json`, which is what the "Evals, not vibes" section on the site
reads — the numbers there are always the numbers from the commit that built it.

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

- React 19 + Vite, Tailwind CSS 3, Framer Motion, lucide-react (browser — no agent framework ships to the visitor)
- LangGraph (`@langchain/langgraph`) orchestrating the agent inside a Cloudflare Worker
- Groq — `openai/gpt-oss-120b` to answer and judge, `llama-prompt-guard-2-86m` to screen
- LangSmith for graph tracing, Langfuse for evals, public metrics and feedback scores

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

Deploys to GitHub Pages on every push to `main`/`master` via `.github/workflows/deploy.yml`.
Changes under `proxy/**` also redeploy the worker via `.github/workflows/deploy-proxy.yml`.

```bash
npm run evals     # recompute src/data/evals.json by hand
cd proxy && npx wrangler dev    # run the agent locally
```
