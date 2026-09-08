import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { work, alsoShipped } from '../data/resume';
import { Section, SectionHead, Reveal } from './ui/Section';

const Figure = ({ f }) => (
  <div className="flex flex-col gap-0.5">
    <div className="font-serif text-[30px] leading-none tracking-[-0.01em]">
      {f.value}
      {f.unit}
      {f.suffix ? <span className="text-moss">{f.suffix}</span> : null}
    </div>
    <div className="text-[12px] text-muted">{f.label}</div>
  </div>
);

const Work = () => (
  <Section id="work">
    <SectionHead index="01" label="Selected work" title="Three things I built and still run." />

    <div className="flex flex-col">
      {work.map((w, i) => (
        <Reveal key={w.name} delay={Math.min(i, 2) * 0.05}>
          <article className="grid grid-cols-1 gap-x-10 gap-y-5 border-t border-line py-9 md:grid-cols-12 lg:py-11">
            <div className="md:col-span-4">
              <div className="meta text-muted">{w.meta}</div>
              <h3 className="mt-2 font-serif text-[30px] leading-[1.05] tracking-[-0.01em]">{w.name}</h3>
              <div className="mt-1.5 text-[15px] text-moss">{w.kicker}</div>
              {w.figures ? (
                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
                  {w.figures.map((f) => (
                    <Figure key={f.label} f={f} />
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col gap-4 md:col-span-8">
              {w.body.map((p) => (
                <p key={p} className="pretty text-[16px] leading-relaxed text-ink-2">
                  {p}
                </p>
              ))}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {w.stack.map((s) => (
                  <span key={s} className="tag">
                    {s}
                  </span>
                ))}
                {w.href ? (
                  <a href={w.href} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 font-mono text-[12px] text-moss hover:text-forest">
                    visit <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : null}
                {w.repo ? (
                  <a href={w.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[12px] text-moss hover:text-forest">
                    source <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        </Reveal>
      ))}
    </div>

    <Reveal>
      <div className="grid grid-cols-1 gap-x-10 gap-y-5 border-t border-line pt-8 md:grid-cols-12">
        <div className="meta text-muted md:col-span-4">Also shipped</div>
        <div className="flex flex-col gap-4 md:col-span-8">
          {alsoShipped.map((a) => (
            <p key={a.name} className="pretty text-[15px] leading-relaxed text-ink-2">
              <span className="font-medium text-ink">{a.name}.</span> {a.body}
            </p>
          ))}
        </div>
      </div>
    </Reveal>
  </Section>
);

export default Work;
