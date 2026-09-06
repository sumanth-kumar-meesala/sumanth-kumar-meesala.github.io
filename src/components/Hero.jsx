import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Download, FileText, MapPin } from 'lucide-react';
import { profile, stats } from '../data/resume';
import Figure from './ui/Figure3D';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

const Hero = () => (
  <section id="home" className="relative flex min-h-svh items-center pt-24 pb-16 lg:pt-28">
    <div className="shell relative w-full">
      <div className="grid grid-cols-1 items-center gap-x-10 gap-y-12 lg:grid-cols-12">
        <Motion.div variants={container} initial="hidden" animate="visible" className="lg:col-span-7">
          <Motion.div
            variants={item}
            className="mb-8 inline-flex items-center gap-3 border border-line bg-surface/60 px-4 py-2 backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping bg-teal opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 bg-teal" />
            </span>
            <span className="meta text-muted">{profile.role} @ Affle · Open to opportunities</span>
          </Motion.div>

          <Motion.h1
            variants={item}
            className="m-0 text-[42px] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-[58px] lg:text-[76px]"
          >
            <span className="block text-text">
              {profile.firstName} {profile.middleName}
            </span>
            <span className="block text-glow-teal text-teal">{profile.lastName}</span>
          </Motion.h1>

          <Motion.div variants={item} className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono text-[13px] tracking-[0.06em] text-muted md:text-[15px]">
              {profile.role}
            </span>
            <span className="h-3 w-px bg-line" />
            <span className="font-mono text-[13px] tracking-[0.06em] text-amber md:text-[15px]">
              {profile.discipline}
            </span>
          </Motion.div>

          <Motion.p variants={item} className="pretty mt-8 max-w-2xl text-[16px] leading-relaxed text-muted md:text-[18px]">
            {profile.lead}
          </Motion.p>

          <Motion.p variants={item} className="pretty mt-4 max-w-2xl text-[14px] leading-relaxed text-dim md:text-[15px]">
            {profile.sub}
          </Motion.p>

          <Motion.div variants={item} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={profile.resume} download className="btn-primary">
              <Download className="h-4 w-4" /> Download résumé
            </a>
            <a href={profile.detailedCv} download className="btn-ghost">
              <FileText className="h-4 w-4" /> Detailed CV
            </a>
          </Motion.div>

          <Motion.div variants={item} className="meta mt-6 flex items-center gap-2 text-dim">
            <MapPin className="h-3.5 w-3.5" /> {profile.location} · {profile.citizenship}
          </Motion.div>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-4 lg:col-start-9"
        >
          <Figure kind="lattice" caption="Agentic AI · LLM applications" accent="teal" size={340} />
        </Motion.div>
      </div>

      <Motion.dl
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="mt-16 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4"
      >
        {stats.map((s) => (
          <div key={s.label} className="bg-void/70 px-5 py-6 backdrop-blur-sm">
            <dd className="text-[30px] font-semibold leading-none tracking-[-0.03em] md:text-[40px]">
              {s.value}
              {s.unit ? <span className="text-[20px] text-muted md:text-[26px]">{s.unit}</span> : null}
              {s.suffix ? <span className="text-teal">{s.suffix}</span> : null}
            </dd>
            <dt className="meta mt-3 text-dim">{s.label}</dt>
          </div>
        ))}
      </Motion.dl>
    </div>
  </section>
);

export default Hero;
