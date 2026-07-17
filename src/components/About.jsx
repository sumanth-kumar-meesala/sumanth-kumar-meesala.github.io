import React from 'react';
import { motion } from 'framer-motion';
import { User, Code2, Cpu, Bot } from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';

const About = () => {
  return (
    <section id="about" className="py-8 px-6 relative">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl glass-card mb-6 text-primary">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">About Me</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative glow-border rounded-3xl"
        >
          <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-5 text-lg text-slate-300 leading-relaxed">
                <p>
                  I'm a <strong className="text-white">Senior AI Engineer</strong> with 11+ years of production experience on Node.js, React, and AngularJS &mdash; now building LLM and agent systems as an AI-native product engineer. Currently <strong className="text-white">Senior AI Engineer at Affle</strong>.
                </p>
                <p>
                  I build <strong className="text-white">LLM-powered features, RAG pipelines, and bounded agentic workflows</strong> on top of typed JavaScript stacks running on AWS. Daily driver of <strong className="text-white">Claude Code, Cursor, GitHub Copilot, and Augment Code</strong> &mdash; I treat AI agents as engineering teammates with explicit responsibilities, context, and guardrails.
                </p>
                <p>
                  Strongest where unclear product requirements meet hard system constraints. I own 0&rarr;1 prototypes through to hardened production at enterprise scale &mdash; a 360&deg; review platform I built now serves <strong className="text-white">600+ employees across Affle's global offices</strong>, and I founded an AI content system running at <strong className="text-white">2,200+ subscribers and 600k+ views</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SpotlightCard
                  className="glass-card rounded-2xl border border-white/5 hover:border-primary/30 transition-colors"
                  spotlightColor="rgba(139, 92, 246, 0.18)"
                >
                  <div className="p-6 flex flex-col items-center justify-center text-center gap-3 relative z-10">
                    <Bot className="w-8 h-8 text-primary" />
                    <h3 className="text-white font-semibold">AI-Native</h3>
                    <p className="text-sm text-slate-400">LLM apps, RAG, Agents</p>
                  </div>
                </SpotlightCard>
                <SpotlightCard
                  className="glass-card rounded-2xl border border-white/5 hover:border-secondary/30 transition-colors"
                  spotlightColor="rgba(6, 182, 212, 0.18)"
                >
                  <div className="p-6 flex flex-col items-center justify-center text-center gap-3 relative z-10">
                    <Cpu className="w-8 h-8 text-secondary" />
                    <h3 className="text-white font-semibold">Backend &amp; Cloud</h3>
                    <p className="text-sm text-slate-400">Node.js, AWS, Serverless</p>
                  </div>
                </SpotlightCard>
                <SpotlightCard
                  className="glass-card rounded-2xl border border-white/5 hover:border-primary/30 transition-colors"
                  spotlightColor="rgba(139, 92, 246, 0.18)"
                >
                  <div className="p-6 flex flex-col items-center justify-center text-center gap-3 relative z-10">
                    <Code2 className="w-8 h-8 text-primary" />
                    <h3 className="text-white font-semibold">Full-Stack</h3>
                    <p className="text-sm text-slate-400">React, TypeScript, AngularJS</p>
                  </div>
                </SpotlightCard>
                <SpotlightCard
                  className="glass-card rounded-2xl border border-white/5 hover:border-secondary/30 transition-colors"
                  spotlightColor="rgba(6, 182, 212, 0.18)"
                >
                  <div className="p-6 flex flex-col items-center justify-center text-center gap-3 relative z-10">
                    <span className="text-2xl">⚡</span>
                    <h3 className="text-white font-semibold">Rapid Shipping</h3>
                    <p className="text-sm text-slate-400">0&rarr;1 with AI workflows</p>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
