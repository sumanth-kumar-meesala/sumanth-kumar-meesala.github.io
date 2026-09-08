import React from 'react';
import { experience } from '../data/resume';
import { Section, SectionHead, Reveal } from './ui/Section';

const Experience = () => (
  <Section id="experience">
    <SectionHead
      index="02"
      label="Experience"
      title="Eleven years, six teams."
      lead="From ASP.NET and SQL Server in 2015 to agent orchestration on Bedrock in 2026 — the same engineering habits, a very different stack."
    />

    <div className="flex flex-col">
      {experience.map((role, i) => (
        <Reveal key={role.company + role.from} delay={Math.min(i, 3) * 0.04}>
          <article className="grid grid-cols-1 gap-x-10 gap-y-4 border-t border-line py-8 md:grid-cols-12 lg:py-10">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3">
                <span className="meta text-ink">
                  {role.from} {role.to}
                </span>
                {role.current ? <span className="tag-hot">Current</span> : null}
              </div>
              <h3 className="mt-2 font-serif text-[26px] leading-[1.1] tracking-[-0.01em]">
                {role.company}
                {role.sub ? <span className="text-muted"> · {role.sub}</span> : null}
              </h3>
              <div className="mt-1 text-[15px] text-moss">{role.role}</div>
            </div>
            <ul className="flex flex-col gap-2.5 md:col-span-8">
              {role.bullets.map((b) => (
                <li key={b} className="pretty flex gap-3 text-[15px] leading-relaxed text-ink-2">
                  <span aria-hidden="true" className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-moss" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      ))}
    </div>
  </Section>
);

export default Experience;
