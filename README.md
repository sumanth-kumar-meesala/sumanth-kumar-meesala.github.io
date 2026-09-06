# Sumanth Kumar Meesala — Portfolio

Live: https://sumanth-kumar-meesala.github.io/

**Senior AI Engineer · LLM & Agent Applications · Melbourne, VIC · Australian citizen**

11+ years shipping production Node.js, React and Angular systems — now an AI-native product engineer
building LLM-powered features, autonomous agents and multi-step agentic workflows on AWS.
At Affle: core contributor to Blueprix (MCP-enabled agent orchestration), owner of Qrank
(360° review platform used by 600+ employees globally), mentor to the AI team.

## The 3D figures

Every section carries its own small 3D object — the subject of that section, modelled. They are
not decoration bolted on; each one is the thing the section is about:

| Figure | Section | What it is |
| --- | --- | --- |
| `lattice` | Hero | A wireframe shell around a pulsing core, orbit rings and firing nodes — agentic AI |
| `mesh` | About | Linked cubes with a packet hopping between them — multi-agent orchestration |
| `slabs` | Stack | A stack of server slabs with sequencing status LEDs; hovering fans them apart |
| `branch` | Selected work | A trunk splitting into build/test/deploy leaves, with a packet running the tree |
| `bars` | Experience | Six growing bars with lit caps — 2015 → 2026 |
| `crystal` | Education | A faceted gem with a glowing core and orbiting satellites |
| `beacon` | Contact | A pulsing core throwing expanding rings |

**They are interactive.** Drag any figure to rotate it — it keeps momentum on release, then the
tilt eases back to its resting angle. Hovering lifts it, brightens it, speeds up its motion and
lights the caption marker.

- `src/three/models.jsx` — the seven models, each a plain three.js group
- `src/three/Figure.jsx` — canvas wrapper, lighting, hover and drag wiring
- `src/three/useDragRotate.js` — pointer → rotation, momentum and settle
- `src/components/ui/Figure3D.jsx` — lazy boundary with a matching skeleton

Built defensively: each figure is `role="img"` with its caption as the accessible label,
rendering **pauses whenever the figure scrolls off-screen**, `touch-action: pan-y` keeps vertical
scrolling working on touch, three.js is code-split out of the first paint (page 120 kB gzip,
figures 238 kB after), and everything goes still under `prefers-reduced-motion`.

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
- three.js · @react-three/fiber
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

| # | Section | Figure | Contents |
| --- | --- | --- | --- |
| 001 | Hero | lattice | Name, role, positioning, résumé downloads, four headline figures |
| 002 | About | mesh | Narrative plus four capability pillars |
| 003 | Stack | slabs | 11-group capability accordion; the three core groups open by default |
| 004 | Selected work | branch | Blueprix · Qrank · Content Factory, plus Moose and Moonee Valley Council |
| 005 | Experience | bars | Affle, DashAnalysis, Blaque Fracture, Archimedes, Blockfreight, ContenTerra |
| 006 | Education & standing | crystal | Deakin M.IT, CVR B.Tech, Australian work rights |
| 007 | Contact | beacon | Email, LinkedIn, GitHub, location, résumé downloads |
