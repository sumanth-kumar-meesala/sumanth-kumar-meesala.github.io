// The pipeline graph rendered in 3D behind the page.
// Each node maps to a page section: scrolling a section into view ignites its node.

export const NODES = [
  { id: 'sources', label: 'Sources',      section: 'education',  pos: [-6.6, 1.7, -1.4], r: 0.34, accent: 'amber' },
  { id: 'rag',     label: 'RAG',          section: 'about',      pos: [-3.5, -1.5, 0.9], r: 0.40, accent: 'teal' },
  { id: 'mcp',     label: 'MCP tools',    section: 'skills',     pos: [-3.0, 2.7, -0.7], r: 0.40, accent: 'teal' },
  { id: 'core',    label: 'Orchestrator', section: 'home',       pos: [0, 0.2, 0],       r: 0.72, accent: 'teal' },
  { id: 'bedrock', label: 'Bedrock',      section: 'work',       pos: [3.1, 2.5, -1.1],  r: 0.42, accent: 'amber' },
  { id: 'evals',   label: 'Evals',        section: 'experience', pos: [3.3, -1.9, 1.0],  r: 0.42, accent: 'teal' },
  { id: 'prod',    label: 'Production',   section: 'contact',    pos: [6.5, 0.4, -0.5],  r: 0.46, accent: 'amber' },
];

export const EDGES = [
  ['sources', 'rag'],
  ['sources', 'mcp'],
  ['rag', 'core'],
  ['mcp', 'core'],
  ['core', 'bedrock'],
  ['core', 'evals'],
  ['bedrock', 'prod'],
  ['evals', 'prod'],
  ['core', 'prod'],
];

export const NODE_BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n]));
export const NODE_BY_SECTION = Object.fromEntries(NODES.map((n) => [n.section, n]));

export const COLORS = {
  teal: '#22D3C5',
  amber: '#F0A93B',
  idle: '#39415A',
};

export const ACCENT_HEX = { teal: '#22D3C5', amber: '#F0A93B' };
