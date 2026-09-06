import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { work, alsoShipped } from '../data/resume';
import { Section, SectionHead, Reveal, Panel } from './ui/Section';

const Figure = ({ value, unit, suffix, label }) => (
  <div>
    <div className="text-[26px] font-semibold leading-none tracking-[-0.03em] md:text-[32px]">
      {value}
      {unit ? <span className="text-[17px] text-muted md:text-[20px]">{unit}</span> : null}
      {suffix ? <span className="text-teal">{suffix}</span> : null}
    </div>
    <div className="meta mt-2 text-dim">{label}</div>
  </div>
);

const Projects = () => (
  <Section id="work">
    <SectionHead
      index="004"
      label="Selected work"
      node="bedrock"
      title="Three systems, in production"
      lead="Not demos. Each of these has real users, a deploy pipeline and an on-call surface."
    />

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {work.map((p, i) => (
        <Reveal key={p.key} delay={i * 0.1} className="h-full">
          <Panel
            ticks
            className="group flex h-full flex-col gap-5 p-6 transition-colors duration-300 hover:border-teal/35 md:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="meta text-teal">[ {p.key} ]</span>
              <span className="meta text-dim">{p.meta}</span>
            </div>

            <h3 className="text-[24px] font-semibold leading-tight tracking-[-0.025em] md:text-[28px]">
              {p.href ? (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-start gap-1.5 text-text transition-colors hover:text-teal"
                >
                  {p.name}
                  <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-dim transition-colors group-hover:text-teal" />
                </a>
              ) : (
                p.name
              )}
            </h3>

            <div className="font-mono text-[12px] tracking-[0.04em] text-amber">{p.kicker}</div>

            <div className="flex flex-col gap-3">
              {p.body.map((b) => (
                <p key={b.slice(0, 24)} className="pretty text-[14px] leading-relaxed text-muted">
                  {b}
                </p>
              ))}
            </div>

            {p.figures ? (
              <div className="flex flex-wrap gap-8 border-t border-line-2 pt-5">
                {p.figures.map((f) => (
                  <Figure key={f.label} {...f} />
                ))}
              </div>
            ) : null}

            <div className="mt-auto flex flex-wrap gap-1.5 border-t border-line-2 pt-5">
              {p.stack.map((s) => (
                <span key={s} className="tag">
                  {s}
                </span>
              ))}
            </div>

            {p.repo ? (
              <a
                href={p.repo}
                target="_blank"
                rel="noreferrer"
                className="meta inline-flex items-center gap-1.5 text-dim transition-colors hover:text-teal"
              >
                Repository <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </Panel>
        </Reveal>
      ))}
    </div>

    <Reveal delay={0.15} className="mt-6">
      <Panel quiet className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[140px_1fr] md:p-7">
        <div className="meta text-dim">Also shipped</div>
        <div className="flex flex-col gap-3">
          {alsoShipped.map((a) => (
            <p key={a.name} className="pretty text-[14px] leading-relaxed text-muted">
              <span className="font-medium text-text">{a.name}</span> — {a.body}
            </p>
          ))}
        </div>
      </Panel>
    </Reveal>
  </Section>
);

export default Projects;
