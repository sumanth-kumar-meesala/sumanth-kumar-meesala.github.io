import React from 'react';
import { motion as Motion } from 'framer-motion';

export const Reveal = ({ children, delay = 0, y = 18, className = '' }) => (
  <Motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </Motion.div>
);

/** Section masthead: a mono index + label line, then a serif title. */
export const SectionHead = ({ index, label, title, lead }) => (
  <div className="mb-10 lg:mb-12">
    <Reveal>
      <div className="mb-4 flex items-center gap-3">
        <span className="meta text-moss">{index}</span>
        <span className="meta text-muted">{label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    </Reveal>
    <Reveal delay={0.05}>
      <h2 className="balance font-serif text-[34px] font-normal leading-[1.05] tracking-[-0.01em] md:text-[44px]">{title}</h2>
    </Reveal>
    {lead ? (
      <Reveal delay={0.1}>
        <p className="pretty mt-4 max-w-prose2 text-[16px] leading-relaxed text-ink-2">{lead}</p>
      </Reveal>
    ) : null}
  </div>
);

export const Section = ({ id, children, className = '' }) => (
  <section id={id} className={`relative scroll-mt-6 border-t border-line px-6 py-16 md:px-10 lg:px-14 lg:py-24 ${className}`}>
    <div className="relative mx-auto w-full max-w-[1100px]">{children}</div>
  </section>
);
