import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { education, workRights } from '../data/resume';
import { Section, SectionHead, Reveal, Panel } from './ui/Section';

const Education = () => (
  <Section id="education">
    <SectionHead
      index="006"
      label="Education & standing"
      title="Credentials"
      lead="A data-analytics master's, an engineering degree, and the right to work here without conditions."
      figure={{ kind: 'crystal', caption: 'Data analytics · Deakin', accent: 'teal', size: 250 }}
    />

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {education.map((e, i) => (
        <Reveal key={e.degree} delay={i * 0.08} className="h-full">
          <Panel className="flex h-full flex-col gap-4 p-6 md:p-7">
            <div className="flex items-center justify-between">
              <span className="meta text-dim">{e.from} {e.to}</span>
              {e.figure ? (
                <span className="meta border border-teal/30 bg-teal/[0.07] px-2 py-1 text-teal">
                  WAM {e.figure.value}
                </span>
              ) : null}
            </div>
            <h3 className="text-[20px] font-semibold leading-tight tracking-[-0.02em] md:text-[23px]">
              {e.degree}
            </h3>
            {e.major ? (
              <div className="font-mono text-[12px] tracking-[0.05em] text-amber">{e.major}</div>
            ) : null}
            <div className="mt-auto text-[14px] text-muted">{e.institution}</div>
          </Panel>
        </Reveal>
      ))}

      <Reveal delay={0.16} className="h-full">
        <Panel
          ticks
          className="flex h-full flex-col gap-4 border-teal/25 bg-teal/[0.04] p-6 md:p-7"
        >
          <ShieldCheck className="h-6 w-6 text-teal" />
          <h3 className="text-[20px] font-semibold leading-tight tracking-[-0.02em] md:text-[23px]">
            {workRights.title}
          </h3>
          <p className="pretty text-[14px] leading-relaxed text-muted">{workRights.body}</p>
          <div className="meta mt-auto text-teal">{workRights.note}</div>
        </Panel>
      </Reveal>
    </div>
  </Section>
);

export default Education;
