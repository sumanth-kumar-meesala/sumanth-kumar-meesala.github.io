// Uploads the eval corpus to Langfuse as a dataset, so runs can be compared
// over time and against model changes rather than only at build time.
//
// The cases come from src/agent/evals.cases.js — the same table the test suite
// asserts on and scripts/evals.js measures. Add a case there and it lands here.
//
//   LANGFUSE_PUBLIC_KEY=pk-... LANGFUSE_SECRET_KEY=sk-... \
//     npx vite-node scripts/langfuse-seed.js
//
// Safe to re-run: Langfuse upserts items by id.

import { Langfuse } from 'langfuse';
import { GOLDEN, NOT_IN_CV, INJECTIONS, SOCIAL, PERSONAL, ABUSE, OUT_OF_SCOPE } from '../src/agent/evals.cases.js';

const DATASET = process.env.LANGFUSE_DATASET ?? 'resume-agent-evals';

const GROUPS = [
  ['golden', GOLDEN, 'a recruiter question the résumé can answer'],
  ['not-in-cv', NOT_IN_CV, 'in scope but absent from the résumé — must decline'],
  ['injection', INJECTIONS, 'must be refused before the model is reached'],
  ['social', SOCIAL, 'small talk — answer without a résumé dump'],
  ['personal', PERSONAL, 'protected characteristics — must refuse'],
  ['abuse', ABUSE, 'must decline'],
  ['scope', OUT_OF_SCOPE, 'not about Sumanth — must stay in scope'],
];

const main = async () => {
  const { LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_BASEURL } = process.env;
  if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) {
    console.error('LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY are required.');
    process.exitCode = 1;
    return;
  }

  const lf = new Langfuse({ publicKey: LANGFUSE_PUBLIC_KEY, secretKey: LANGFUSE_SECRET_KEY, baseUrl: LANGFUSE_BASEURL || undefined });
  await lf.createDataset({
    name: DATASET,
    description: 'Questions the résumé agent is held to: what it must answer, what it must decline, and what it must never let through.',
    metadata: { source: 'src/agent/evals.cases.js' },
  });

  let n = 0;
  for (const [group, cases, note] of GROUPS) {
    for (const c of cases) {
      await lf.createDatasetItem({
        datasetName: DATASET,
        id: `${group}:${c.q}`.slice(0, 250), // stable id, so re-running updates rather than duplicates
        input: { question: c.q },
        expectedOutput: {
          intent: c.intent,
          mustCite: c.cites ?? [],
          mustContain: c.includes ?? null,
          mustBeUncited: group !== 'golden',
        },
        metadata: { group, note },
      });
      n += 1;
    }
  }

  await lf.flushAsync();
  console.log(`seeded ${n} cases into "${DATASET}" across ${GROUPS.length} groups`);
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
