import React from 'react';
import { about } from '../data/resume';
import { Section, SectionHead, Reveal, Panel } from './ui/Section';

const About = () => (
  <Section id="about">
    <SectionHead
      index="002"
      label="About"
      node="rag"
      title={about.headline}
    />

    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <Reveal className="flex flex-col gap-5">
          {about.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="pretty text-[15px] leading-relaxed text-muted md:text-[17px]">
              {p}
            </p>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="meta text-dim">Daily driver</span>
            <span className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
          </div>
          <div className="flex flex-wrap gap-2">
            {about.dailyDriver.map((t, i) => (
              <span key={t} className={i === about.dailyDriver.length - 1 ? 'tag-hot' : 'tag'}>
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="lg:col-span-6 lg:col-start-7">
        <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
          {about.pillars.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.08}>
              <Panel ticks className="group h-full !border-0 bg-void/60 p-6 transition-colors hover:bg-surface/70">
                <div className="meta mb-4 text-teal/70">{p.n}</div>
                <h3 className="text-[17px] font-medium tracking-[-0.01em] text-text">{p.title}</h3>
                <p className="pretty mt-3 text-[14px] leading-relaxed text-dim">{p.body}</p>
              </Panel>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </Section>
);

export default About;
