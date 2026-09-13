// Anti-drift: the diagram is drawn from STAGES, so every stage name the agent
// emits must appear there — otherwise a step runs that the picture never shows.

import { describe, it, expect } from 'vitest';
import { ask } from './pipeline';
import { STAGES } from './stages';
import { EVERYTHING } from './evals.cases';

const STAGE_NAMES = STAGES.map((s) => s.name);

describe('stage list covers what the agent emits', () => {
  it('every trace name across the whole corpus is a known stage', async () => {
    const seen = new Set();
    for (const q of EVERYTHING) {
      const a = await ask(q, [], { generator: null });
      for (const t of a.trace) seen.add(t.name);
    }
    const fake = async () => ({ text: 'He ships agents [1].', model: 'fake', ms: 1 });
    for (const t of (await ask('production agents?', [], { generator: fake })).trace) seen.add(t.name);

    expect([...seen].filter((n) => !STAGE_NAMES.includes(n))).toEqual([]);
  });

  // Note: a judge-driven retry deliberately revisits earlier stages, so a
  // trace is only monotonic when no retry fires. That cycle is the feature.
  it('lists stages in the order they run when no retry fires', async () => {
    const a = await ask('What is his RAG experience?', [], { generator: async () => ({ text: 'He did RAG [1].', model: 'f', ms: 1 }) });
    const order = a.trace.map((t) => STAGE_NAMES.indexOf(t.name));
    expect(order).toEqual([...order].sort((x, y) => x - y));
  });
});
