import React from 'react';
import { motion } from 'framer-motion';
import { User, Code2, Cpu, Bot } from 'lucide-react';

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
                  I'm a <strong className="text-white">Senior LLM &amp; Agent Application Engineer</strong> with 11+ years of production experience on Node.js, React, and AngularJS &mdash; now operating as an AI-native product engineer.
                </p>
                <p>
                  I build <strong className="text-white">LLM-powered features, RAG pipelines, and bounded agentic workflows</strong> on top of typed JavaScript stacks running on AWS. Daily driver of <strong className="text-white">Claude Code, Cursor, GitHub Copilot, and Augment Code</strong> &mdash; I treat AI agents as engineering teammates with explicit responsibilities, context, and guardrails.
                </p>
                <p>
                  Strongest where unclear product requirements meet hard system constraints. I own 0&rarr;1 prototypes through to hardened production at enterprise scale.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-white/5 hover:bg-white/5 transition-colors">
                  <Bot className="w-8 h-8 text-primary" />
                  <h3 className="text-white font-semibold">AI-Native</h3>
                  <p className="text-sm text-slate-400">LLM apps, RAG, Agents</p>
                </div>
                <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-white/5 hover:bg-white/5 transition-colors">
                  <Cpu className="w-8 h-8 text-secondary" />
                  <h3 className="text-white font-semibold">Backend &amp; Cloud</h3>
                  <p className="text-sm text-slate-400">Node.js, AWS, Serverless</p>
                </div>
                <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-white/5 hover:bg-white/5 transition-colors">
                  <Code2 className="w-8 h-8 text-primary" />
                  <h3 className="text-white font-semibold">Full-Stack</h3>
                  <p className="text-sm text-slate-400">React, TypeScript, AngularJS</p>
                </div>
                <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-white/5 hover:bg-white/5 transition-colors">
                  <span className="text-2xl">⚡</span>
                  <h3 className="text-white font-semibold">Rapid Shipping</h3>
                  <p className="text-sm text-slate-400">0&rarr;1 with AI workflows</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
