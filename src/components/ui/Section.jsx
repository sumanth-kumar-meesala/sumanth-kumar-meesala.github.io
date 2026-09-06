import React from 'react';
import { motion as Motion } from 'framer-motion';

export const Reveal = ({ children, delay = 0, y = 22, className = '' }) => (
  <Motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </Motion.div>
);

export const SectionHead = ({ index, label, title, lead, node }) => (
  <div className="mb-12 lg:mb-16">
    <Reveal>
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="meta text-teal">[ {index} ]</span>
        <span className="meta text-dim">{label}</span>
        <span className="hidden h-px flex-1 bg-gradient-to-r from-line to-transparent sm:block" />
        {node ? (
          <span className="meta flex items-center gap-2 text-dim">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-dot bg-teal" />
            node/{node}
          </span>
        ) : null}
      </div>
    </Reveal>
    <Reveal delay={0.06}>
      <h2 className="balance max-w-3xl text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[42px] lg:text-[52px]">
        {title}
      </h2>
    </Reveal>
    {lead ? (
      <Reveal delay={0.12}>
        <p className="pretty mt-5 max-w-2xl text-[15px] leading-relaxed text-muted md:text-base">{lead}</p>
      </Reveal>
    ) : null}
  </div>
);

export const Section = ({ id, children, className = '' }) => (
  <section id={id} className={`relative scroll-mt-24 py-20 lg:py-28 ${className}`}>
    <div className="shell relative">{children}</div>
  </section>
);

export const Panel = ({ children, ticks = false, quiet = false, className = '' }) => (
  <div className={`${quiet ? 'panel-quiet' : 'panel'} ${ticks ? 'ticks' : ''} ${className}`}>{children}</div>
);
