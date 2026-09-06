# Sumanth Kumar Meesala — Portfolio

Live: https://sumanth-kumar-meesala.github.io/

**Senior AI Engineer · LLM & Agent Applications · Melbourne, VIC · Australian citizen**

11+ years shipping production Node.js, React and Angular systems — now an AI-native product engineer
building LLM-powered features, autonomous agents and multi-step agentic workflows on AWS.
At Affle: core contributor to Blueprix (MCP-enabled agent orchestration), owner of Qrank
(360° review platform used by 600+ employees globally), mentor to the AI team.

## The 3D layer

The background is a live WebGL scene: the agent pipeline I actually build, rendered as a graph.
Seven nodes — Sources, RAG, MCP tools, Orchestrator, Bedrock, Evals, Production — wired by edges
that carry travelling packets. **Each node is bound to a page section**, so scrolling ignites the
node that section is about, and the hero legend names whichever node is currently lit. Scroll also
drives the camera down the pipeline; the pointer adds parallax.

- `src/three/graph.js` — node positions, edges, and the node → section binding
- `src/three/PipelineScene.jsx` — the R3F canvas, nodes, edges, packets, dust and camera rig
- `src/hooks/useActiveSection.js` — which section owns the viewport

It is decorative and defensive: `aria-hidden`, `pointer-events: none`, code-split out of the main
bundle so the page paints first, fewer particles and lower DPR on small screens, and **frozen
entirely when the visitor prefers reduced motion**. All content is real DOM above it.

## Design

| Token | Value |
| --- | --- |
| Void | `#0B0D12` |
| Surface | `#12151D` / `#171B26` |
| Line | `#232838` / `#1A1E2A` |
| Text | `#E8EAF0` · muted `#9AA1B4` · dim `#6B7285` |
| Teal (primary) | `#22D3C5` |
| Amber (secondary) | `#F0A93B` |
| Display / UI | Space Grotesk |
| Metadata | JetBrains Mono, tabular numerals |

Content panels are translucent with a hairline border and a light backdrop blur, so the pipeline
stays visible behind them without competing with the copy.

## Content

All copy is generated from [`src/data/resume.js`](src/data/resume.js), which mirrors the current
résumé verbatim. **To update the site after a résumé change, edit that one file** — the components
render from it and hold no copy of their own.

## Stack

- React 19 + Vite
- three.js · @react-three/fiber · @react-three/drei
- Tailwind CSS 3
- Framer Motion (scroll reveals)
- lucide-react · react-scroll

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # -> dist/
npm run lint
```

Deployment is automatic: pushing to `main` runs `.github/workflows/deploy.yml`, which builds and
publishes `dist/` to GitHub Pages.

## Sections

| # | Section | 3D node | Contents |
| --- | --- | --- | --- |
| 001 | Hero | Orchestrator | Name, role, positioning, résumé downloads, pipeline legend, four headline figures |
| 002 | About | RAG | Narrative plus four capability pillars |
| 003 | Stack | MCP tools | 11-group capability accordion; the three core groups open by default |
| 004 | Selected work | Bedrock | Blueprix · Qrank · Content Factory, plus Moose and Moonee Valley Council |
| 005 | Experience | Evals | Affle, DashAnalysis, Blaque Fracture, Archimedes, Blockfreight, ContenTerra |
| 006 | Education & standing | Sources | Deakin M.IT, CVR B.Tech, Australian work rights |
| 007 | Contact | Production | Email, LinkedIn, GitHub, location, résumé downloads |
