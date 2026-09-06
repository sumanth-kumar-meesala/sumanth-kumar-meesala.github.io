import React, { useState } from 'react';
import { skillGroups } from '../data/resume';
import { Section, SectionHead, Reveal } from './ui/Section';

const Skills = () => {
  // Multi-open: the three core groups are expanded up front so a skim-reader
  // sees the AI stack without clicking; the rest stay tucked away.
  const [open, setOpen] = useState(() => new Set(skillGroups.filter((g) => g.emphasis).map((g) => g.n)));

  const toggle = (n) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

  return (
    <Section id="skills">
      <SectionHead
        index="003"
        label="Stack"
        title="The stack behind the systems"
        lead="Eleven groups, from the model layer down to the IAM policy that gates it. Everything here is something I have shipped with, not read about."
        figure={{ kind: 'slabs', caption: 'Typed services on AWS', accent: 'amber', size: 250 }}
      />

      <div className="border border-line bg-void/50 backdrop-blur-[6px]">
        {skillGroups.map((g, i) => {
          const isOpen = open.has(g.n);
          return (
            <Reveal key={g.n} delay={Math.min(i, 6) * 0.04} y={12}>
              <div className={i > 0 ? 'border-t border-line-2' : ''}>
                <button
                  type="button"
                  onClick={() => toggle(g.n)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-surface/50 md:px-7"
                >
                  <span className={`meta shrink-0 transition-colors ${isOpen ? 'text-teal' : 'text-dim'}`}>
                    {g.n}
                  </span>
                  <span
                    className={`shrink-0 transition-colors ${
                      isOpen ? 'text-teal' : g.emphasis ? 'text-text' : 'text-muted'
                    } text-[15px] font-medium tracking-[-0.01em] md:text-[17px]`}
                  >
                    {g.title}
                  </span>
                  {g.emphasis ? (
                    <span className="meta hidden shrink-0 border border-amber/30 px-2 py-1 text-amber/80 sm:inline">
                      core
                    </span>
                  ) : null}
                  <span className="hidden h-px flex-1 bg-line md:block" />
                  <span className="meta ml-auto shrink-0 text-dim md:ml-0">
                    {String(g.items.length).padStart(2, '0')}
                  </span>
                  <span
                    className={`shrink-0 font-mono text-[13px] transition-transform duration-300 ${
                      isOpen ? 'rotate-45 text-teal' : 'text-dim'
                    }`}
                  >
                    +
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-wrap gap-2 px-5 pb-6 md:px-7 md:pl-[104px]">
                      {g.items.map((s) => (
                        <span key={s} className={g.emphasis ? 'tag-hot' : 'tag'}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
};

export default Skills;
