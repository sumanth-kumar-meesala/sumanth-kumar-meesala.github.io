import React from 'react';
import { education, workRights } from '../data/resume';
import { Section, SectionHead, Reveal } from './ui/Section';

const Education = () => (
  <Section id="education">
    <SectionHead index="04" label="Education & work rights" title="Two degrees, one passport." />

    <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-12">
      <div className="flex flex-col md:col-span-8">
        {education.map((e, i) => (
          <Reveal key={e.degree} delay={i * 0.04}>
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 border-t border-line py-7 sm:grid-cols-[150px_minmax(0,1fr)]">
              <div className="meta text-ink">
                {e.from} {e.to}
              </div>
              <div>
                <h3 className="font-serif text-[24px] leading-[1.15] tracking-[-0.01em]">
                  {e.degree}
                  {e.major ? <span className="text-muted"> · {e.major}</span> : null}
                </h3>
                <div className="mt-1 text-[15px] text-ink-2">{e.institution}</div>
                {e.figure ? (
                  <div className="mt-3 inline-flex items-baseline gap-2">
                    <span className="font-serif text-[28px] leading-none">{e.figure.value}</span>
                    <span className="text-[12px] text-muted">{e.figure.label}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.08} className="md:col-span-4">
        <div className="flex h-full flex-col gap-3 rounded-2xl bg-forest p-7 text-cream">
          <div className="meta text-cream/60">Work rights</div>
          <div className="font-serif text-[28px] leading-[1.1]">{workRights.title}</div>
          <p className="text-[15px] leading-relaxed text-cream/80">{workRights.body}</p>
          <div className="mt-auto pt-3">
            <span className="inline-flex items-center rounded-full bg-mint px-3 py-1 font-mono text-[11px] text-forest">{workRights.note}</span>
          </div>
        </div>
      </Reveal>
    </div>
  </Section>
);

export default Education;
