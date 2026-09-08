import React from 'react';
import { skillGroups, about } from '../data/resume';
import { Section, SectionHead, Reveal } from './ui/Section';

const Stack = () => (
  <Section id="stack">
    <SectionHead
      index="03"
      label="Stack"
      title="AI-native on a full-stack foundation."
      lead={`Daily drivers: ${about.dailyDriver.join(', ')}.`}
    />

    <div className="grid grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-2">
      {skillGroups.map((g, i) => (
        <Reveal key={g.n} delay={Math.min(i, 5) * 0.03}>
          <div className={`flex h-full flex-col gap-3 border-t py-6 ${g.emphasis ? 'border-forest' : 'border-line'}`}>
            <div className="flex items-baseline gap-3">
              <span className={`meta ${g.emphasis ? 'text-moss' : 'text-muted'}`}>{g.n}</span>
              <h3 className="text-[16px] font-semibold">{g.title}</h3>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {g.items.map((it) => (
                <li key={it} className={g.emphasis ? 'tag-hot' : 'tag'}>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  </Section>
);

export default Stack;
