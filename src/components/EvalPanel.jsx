import React from 'react';
import { Section, SectionHead, Reveal } from './ui/Section';
import { STAGES } from '../agent/stages';
import report from '../data/evals.json';

const fmt = (m) => (m.unit === '%' ? `${m.value}%` : `${m.value} ${m.unit}`);

/**
 * What the agent is held to, with the numbers from this build.
 *
 * The figures come from src/data/evals.json, written by scripts/evals.js at
 * build time over the same cases the test suite asserts on. They are the
 * deterministic half of the system — retrieval, routing and the guardrails.
 * The model's own output is judged per answer at runtime instead, which is
 * what the judge score under each reply reports.
 */
const EvalPanel = () => (
  <Section id="agent">
    <SectionHead index="05" label="How this page answers" title="Evals, not vibes." />

    <div className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-12">
      <div className="md:col-span-7">
        <Reveal>
          <p className="pretty max-w-[54ch] text-[17px] leading-relaxed text-ink-2">
            The agent above is a graph, not a prompt. Every answer passes through the same stages in order, each one recorded and shown under
            the reply. The numbers below are measured on every build from {report.cases} test cases over {report.facts} résumé facts — the same
            cases that gate the deploy, so a regression stops the release rather than reaching this page.
          </p>
        </Reveal>

        <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {report.metrics.map((m, i) => (
            <Reveal key={m.key} delay={i * 0.02}>
              <div className="flex h-full flex-col gap-1 bg-paper p-5">
                <dd className="font-serif text-[30px] leading-none tabular-nums">{fmt(m)}</dd>
                <dt className="text-[14px] font-medium text-ink">{m.label}</dt>
                <p className="text-[13px] leading-snug text-muted">{m.detail}</p>
              </div>
            </Reveal>
          ))}
        </dl>

        <Reveal>
          <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted">
            Measured in {report.mode} mode on {new Date(report.generatedAt).toISOString().slice(0, 10)}
            {report.commit ? ` · commit ${report.commit}` : ''} · deterministic, no network. Full marks mean every case in the corpus passed,
            not that the corpus is exhaustive — the counts above are the denominators.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.08} className="md:col-span-5">
        <div className="flex h-full flex-col gap-4 rounded-2xl bg-forest p-7 text-cream">
          <div className="meta text-cream/60">The pipeline</div>
          <ol className="flex flex-col gap-3">
            {STAGES.map((s, i) => (
              <li key={s.name} className="flex gap-3">
                <span className="mt-[3px] font-mono text-[11px] text-cream/40 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0">
                  <span className="font-mono text-[12px] text-mint">{s.name}</span>
                  <span className="block text-[14px] leading-snug text-cream/70">{s.blurb}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-auto pt-2 text-[13px] leading-relaxed text-cream/60">
            A low judge score sends the answer back to retrieval once, with the terms the judge says are missing. Everything is traced to
            LangSmith and Langfuse; the output check is the last word on every path.
          </p>
        </div>
      </Reveal>
    </div>
  </Section>
);

export default EvalPanel;
