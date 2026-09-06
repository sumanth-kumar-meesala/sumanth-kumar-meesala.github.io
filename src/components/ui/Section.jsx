import React from 'react';
import { motion as Motion } from 'framer-motion';
import Figure from './Figure3D';

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

/**
 * Section masthead: index, label and title on the left, the section's
 * 3D figure on the right. The figure is the section's subject in object form.
 */
export const SectionHead = ({ index, label, title, lead, figure }) => (
  <div className="mb-12 grid grid-cols-1 gap-x-10 gap-y-10 lg:mb-16 lg:grid-cols-12">
    <div className="lg:col-span-7">
      <Reveal>
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="meta text-teal">[ {index} ]</span>
          <span className="meta text-dim">{label}</span>
          <span className="hidden h-px flex-1 bg-gradient-to-r from-line to-transparent sm:block" />
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="balance text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[40px] lg:text-[46px]">
          {title}
        </h2>
      </Reveal>
      {lead ? (
        <Reveal delay={0.12}>
          <p className="pretty mt-5 max-w-xl text-[15px] leading-relaxed text-muted md:text-base">{lead}</p>
        </Reveal>
      ) : null}
    </div>

    {figure ? (
      <Reveal delay={0.14} className="lg:col-span-4 lg:col-start-9">
        <Figure {...figure} />
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
