import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, ServerCog, Cpu, Database, Network, Bot, ArrowRight, Cloud } from 'lucide-react';

const Block = ({ title, subtitle, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors group w-full bg-surface/40 backdrop-blur-md"
  >
    <div className="w-12 h-12 rounded-xl bg-background/50 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
      <Icon className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
    </div>
    <div className="text-left">
      <h3 className="text-white font-semibold text-sm tracking-wide">{title}</h3>
      <p className="text-slate-400 text-xs mt-1 leading-snug">{subtitle}</p>
    </div>
  </motion.div>
);

const Infrastructure = () => {
  return (
    <section id="infrastructure" className="py-8 px-6 relative">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-xl glass-card mb-6 text-secondary border border-white/5">
            <Network className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-white">System Architecture</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mb-6"></div>
          <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
            Professional representation of my technical ecosystem, demonstrating the end-to-end integration of AI workflows, scalable backend services, and cloud infrastructure.
          </p>
        </motion.div>

        {/* Architecture Flowchart */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Grid container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-8 items-stretch relative z-10">

            {/* Column 1: Client & Tooling */}
            <div className="flex flex-col gap-4 relative">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-2 mb-2 hidden md:block">Interfaces & AI</div>
              <Block delay={0.1} title="Frontend Apps" subtitle="React.js, Angular" icon={Monitor} />
              <Block delay={0.2} title="AI Assistants" subtitle="Claude Code, Cursor" icon={Bot} />

              {/* Connector to next col - Desktop only */}
              <div className="hidden md:flex absolute -right-6 lg:-right-8 top-1/2 -translate-y-1/2 w-8 items-center justify-center text-white/20">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Column 2: Core Services */}
            <div className="flex flex-col gap-4 relative">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-2 mb-2 hidden md:block">Core Backend</div>
              <div className="p-4 rounded-3xl border border-primary/20 bg-primary/5 h-full flex flex-col gap-4 relative">
                <Block delay={0.3} title="API Gateway" subtitle="REST, Express.js" icon={ServerCog} />
                <Block delay={0.4} title="Microservices" subtitle="Node.js, Event-driven" icon={Cpu} />
              </div>

              {/* Connector to next col - Desktop only */}
              <div className="hidden md:flex absolute -right-6 lg:-right-8 top-1/2 -translate-y-1/2 w-8 items-center justify-center text-white/20">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Column 3: Data & Cloud */}
            <div className="flex flex-col gap-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-2 mb-2 hidden md:block">Data & Cloud</div>
              <Block delay={0.5} title="Databases" subtitle="MongoDB, SQL Server" icon={Database} />
              <Block delay={0.6} title="AWS Cloud" subtitle="EC2, S3, Lambda" icon={Cloud} />
            </div>

          </div>

          {/* Subtle background glow for the whole diagram */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default Infrastructure;
