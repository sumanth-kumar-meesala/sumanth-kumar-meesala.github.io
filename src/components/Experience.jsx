import React from 'react';
import { experience } from '../data/resume';
import { Section, SectionHead, Reveal } from './ui/Section';

const Experience = () => (
  <Section id="experience">
    <SectionHead
      index="005"
      label="Experience"
      node="evals"
      title="Eleven years, six teams"
      lead="From ASP.NET and SQL Server in 2015 to agent orchestration on Bedrock in 2026 — the same engineering habits, a very different stack."
    />

    <div className="relative">
      {/* the spine */}
      <div className="absolute left-[7px] top-2 bottom-2 hidden w-px bg-gradient-to-b from-teal/40 via-line to-transparent md:block" />

      <div className="flex flex-col">
        {experience.map((role, i) => (
          <Reveal key={role.company + role.from} delay={Math.min(i, 4) * 0.06}>
            <div className="group relative grid grid-cols-1 gap-x-8 gap-y-5 py-8 md:grid-cols-12 md:pl-10">
              {/* spine node */}
              <span
                className={`absolute left-0 top-[42px] hidden h-[15px] w-[15px] items-center justify-center border md:flex ${
                  role.current ? 'border-teal bg-void' : 'border-line bg-void'
                }`}
              >
                <span
                  className={`h-[5px] w-[5px] transition-colors ${
                    role.current ? 'animate-pulse-dot bg-teal' : 'bg-line group-hover:bg-muted'
                  }`}
                />
              </span>

              <div className="md:col-span-3">
                <div className="meta text-text">{role.from}</div>
                <div className="meta mt-1.5 text-dim">{role.to}</div>
                {role.current ? (
                  <div className="meta mt-3 inline-block border border-teal/35 bg-teal/[0.07] px-2 py-1 text-teal">
                    Current
                  </div>
                ) : null}
              </div>

              <div className="md:col-span-9">
                <h3 className="text-[20px] font-semibold leading-tight tracking-[-0.02em] md:text-[24px]">
                  {role.company}
                  {role.sub ? <span className="text-dim"> · {role.sub}</span> : null}
                </h3>
                <div className="mt-2 font-mono text-[12px] tracking-[0.05em] text-amber md:text-[13px]">
                  {role.role}
                </div>

                <ul className="mt-6 flex list-none flex-col gap-3 p-0">
                  {role.bullets.map((b) => (
                    <li key={b.slice(0, 32)} className="grid grid-cols-[16px_1fr] gap-3">
                      <span className="mt-[7px] h-[5px] w-[5px] shrink-0 bg-line transition-colors group-hover:bg-teal/60" />
                      <span className="pretty text-[14px] leading-relaxed text-muted md:text-[15px]">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {i < experience.length - 1 ? (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-line-2 md:left-10" />
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </Section>
);

export default Experience;
