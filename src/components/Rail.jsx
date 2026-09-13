import React from 'react';
import { ArrowDownToLine, ArrowRight } from 'lucide-react';
import { profile, workRights } from '../data/resume';

const NAV = [
  { id: 'ask', label: 'Ask' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'stack', label: 'Stack' },
  { id: 'education', label: 'Education' },
  { id: 'agent', label: 'How it answers' },
  { id: 'contact', label: 'Contact' },
];

const Row = ({ k, v, hot = false }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-cream/15 py-3 text-[14px]">
    <span className="text-cream/60">{k}</span>
    <span className={`text-right ${hot ? 'text-mint' : 'text-cream'}`}>{v}</span>
  </div>
);

/**
 * The facts column. Sticky on desktop so the two actions a recruiter needs —
 * résumé and email — are never off-screen; a compact header on mobile.
 */
const Rail = ({ active }) => (
  <aside
    id="top"
    className="relative flex flex-col justify-between gap-10 bg-forest px-6 py-8 text-cream md:px-10 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:px-10 lg:py-11"
  >
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="meta text-cream/60">{profile.name}</div>
        <h1 className="balance font-serif text-[38px] font-normal leading-[1.04] tracking-[-0.01em] md:text-[44px]">
          {profile.role},{' '}
          <em className="italic text-mint">LLM &amp; agents.</em>
        </h1>
        <p className="pretty text-[15px] leading-relaxed text-cream/80">
          Eleven years shipping production Node.js, React and Angular. Now building agents that ship to production — and this page is one of them.
        </p>
      </div>

      <div className="border-t border-cream/15">
        <Row k="Now" v="Affle · Melbourne" />
        <Row k="Building" v="Blueprix · Qrank" />
        <Row k="Work rights" v={workRights.title} />
        <Row k="Availability" v="Open to senior AI roles" hot />
      </div>

      <nav aria-label="Sections" className="hidden lg:block">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={active === n.id ? 'true' : undefined}
                className={`flex h-9 items-center gap-3 font-mono text-[12px] uppercase tracking-[0.12em] transition-colors ${
                  active === n.id ? 'text-mint' : 'text-cream/50 hover:text-cream'
                }`}
              >
                <span className={`h-px transition-all ${active === n.id ? 'w-6 bg-mint' : 'w-3 bg-cream/30'}`} />
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>

    <div className="flex flex-col gap-2.5">
      <a href={profile.resume} download className="btn-primary">
        <span>Download résumé</span>
        <ArrowDownToLine className="h-[18px] w-[18px]" aria-hidden="true" />
      </a>
      <a href={`mailto:${profile.email}`} className="btn-ghost">
        <span className="truncate">{profile.email}</span>
        <ArrowRight className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      </a>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[12px] text-cream/60">
        <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-mint">github</a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-mint">linkedin</a>
        <a href="https://qrank.it.com" target="_blank" rel="noreferrer" className="hover:text-mint">qrank.it.com</a>
        <a href={profile.detailedCv} download className="hover:text-mint">detailed cv</a>
      </div>
    </div>
  </aside>
);

export default Rail;
