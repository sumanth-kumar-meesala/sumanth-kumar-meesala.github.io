import React from 'react';
import { Link } from 'react-scroll';
import { ArrowUp, Download, FileText, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { profile } from '../data/resume';
import { Reveal, Panel } from './ui/Section';
import Figure from './ui/Figure3D';

const channels = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, Icon: Mail },
  { label: 'LinkedIn', value: profile.linkedinLabel, href: profile.linkedin, Icon: Linkedin },
  { label: 'GitHub', value: profile.githubLabel, href: profile.github, Icon: Github },
  { label: 'Location', value: `${profile.location} · AU`, Icon: MapPin },
];

const Footer = () => (
  <footer id="contact" className="relative scroll-mt-24 pt-20 lg:pt-28">
    <div className="shell relative">
      <div className="grid grid-cols-1 items-center gap-x-10 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="meta text-teal">[ 007 ]</span>
              <span className="meta text-dim">Contact</span>
              <span className="hidden h-px flex-1 bg-gradient-to-r from-line to-transparent sm:block" />
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="balance text-[32px] font-semibold leading-[1.05] tracking-[-0.035em] md:text-[46px] lg:text-[56px]">
              Building something that
              <span className="text-teal"> needs to actually work?</span>
            </h2>
          </Reveal>
        </div>

        <Reveal delay={0.14} className="lg:col-span-4 lg:col-start-9">
          <Figure kind="beacon" caption="Melbourne, VIC · open" accent="amber" size={250} />
        </Reveal>
      </div>

      <Reveal delay={0.12} className="mt-12">
        <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c) => {
            const { label, value, href } = c;
            const Glyph = c.Icon;
            const inner = (
              <>
                <Glyph className="h-4 w-4 text-dim transition-colors group-hover:text-teal" />
                <div className="min-w-0">
                  <div className="meta text-dim">{label}</div>
                  <div className="mt-2 break-all text-[13.5px] leading-snug text-text md:text-[14.5px]">{value}</div>
                </div>
              </>
            );
            return href ? (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="group flex items-start gap-3 bg-void/70 px-5 py-6 backdrop-blur-sm transition-colors hover:bg-surface/70"
              >
                {inner}
              </a>
            ) : (
              <div key={label} className="group flex items-start gap-3 bg-void/70 px-5 py-6 backdrop-blur-sm">
                {inner}
              </div>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={0.18} className="mt-8">
        <Panel quiet className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-7">
          <p className="pretty max-w-md text-[14px] leading-relaxed text-muted">
            The résumé this site is built from, in two lengths — a one-pager and the full detail.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={profile.resume} download className="btn-primary">
              <Download className="h-4 w-4" /> Résumé
            </a>
            <a href={profile.detailedCv} download className="btn-ghost">
              <FileText className="h-4 w-4" /> Detailed CV
            </a>
          </div>
        </Panel>
      </Reveal>

      <div className="mt-16 flex flex-col gap-4 border-t border-line py-8 md:flex-row md:items-center md:justify-between">
        <span className="meta text-dim">
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span className="meta hidden text-dim lg:inline">
          {profile.role} · {profile.discipline}
        </span>
        <Link
          to="home"
          smooth
          duration={800}
          className="meta inline-flex cursor-pointer items-center gap-2 text-dim transition-colors hover:text-teal"
        >
          Back to top <ArrowUp className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
