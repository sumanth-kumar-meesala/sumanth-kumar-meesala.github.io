import React from 'react';
import { ArrowDownToLine, ArrowUpRight } from 'lucide-react';
import { profile } from '../data/resume';
import { Reveal } from './ui/Section';

const Footer = () => (
  <footer id="contact" className="scroll-mt-6 border-t border-line px-6 py-16 md:px-10 lg:px-14 lg:py-24">
    <div className="mx-auto w-full max-w-[1100px]">
      <Reveal>
        <div className="mb-4 flex items-center gap-3">
          <span className="meta text-moss">05</span>
          <span className="meta text-muted">Contact</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <h2 className="balance font-serif text-[34px] leading-[1.05] tracking-[-0.01em] md:text-[48px]">
          If the agent couldn't answer it, <em className="italic text-moss">I can.</em>
        </h2>
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={`mailto:${profile.email}`} className="inline-flex h-12 items-center gap-3 rounded-lg bg-forest px-5 text-[15px] font-semibold text-cream hover:bg-forest-2">
            {profile.email}
            <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" />
          </a>
          <a href={profile.resume} download className="inline-flex h-12 items-center gap-3 rounded-lg border border-line-2 px-5 text-[15px] font-medium text-ink hover:border-forest">
            Résumé (PDF)
            <ArrowDownToLine className="h-[18px] w-[18px]" aria-hidden="true" />
          </a>
          <a href={profile.detailedCv} download className="inline-flex h-12 items-center gap-3 rounded-lg border border-line-2 px-5 text-[15px] font-medium text-ink hover:border-forest">
            Detailed CV (PDF)
            <ArrowDownToLine className="h-[18px] w-[18px]" aria-hidden="true" />
          </a>
        </div>
      </Reveal>

      <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 font-mono text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          {profile.name} · {profile.location}
        </div>
        <div className="flex gap-5">
          <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-ink">
            {profile.githubLabel}
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-ink">
            {profile.linkedinLabel}
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
