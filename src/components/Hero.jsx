import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, MapPin, Github, Mail } from 'lucide-react';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.18, delayChildren: 0.25 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Premium Background Elements */}
      <div className="absolute top-[18%] left-[12%] w-[520px] h-[520px] bg-primary/20 rounded-full blur-[130px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[8%] right-[8%] w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[150px] -z-10 animate-float" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay -z-10 pointer-events-none"></div>

      <div className="container mx-auto px-6 z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-card border border-white/5 shadow-xl text-sm font-medium text-slate-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            Available · Senior LLM &amp; Agent Application Engineer
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight leading-[1.05]">
            Building <span className="text-gradient">AI-native</span><br className="hidden md:block" />
            product systems.
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 mb-3 max-w-2xl mx-auto leading-relaxed">
            Hi, I'm <strong className="text-white font-semibold">Sumanth Kumar Meesala</strong>. 11+ years shipping production
            <span className="text-white"> Node.js, React, and AngularJS</span> systems &mdash; now operating as an AI-native product engineer.
            I build LLM-powered features, agentic workflows, and RAG retrieval on AWS, with
            <span className="text-white"> Claude Code, Cursor, GitHub Copilot, and Augment Code</span> as my daily driver.
          </motion.p>

          <motion.p variants={itemVariants} className="text-sm md:text-base text-slate-500 mb-8 max-w-xl mx-auto">
            Side project: an AI content factory (Next.js · Claude Agent SDK · Hugging Face Parler-TTS · Remotion) running a YouTube channel with <strong className="text-secondary">500+ subscribers and 2 lakh+ views</strong>.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-5 md:gap-7 text-slate-400">
            <a href="https://github.com/sumanth-kumar-meesala/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2 group">
              <div className="p-2 rounded-full glass-card group-hover:border-primary/50 transition-colors">
                <Github className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">GitHub</span>
            </a>
            <a href="https://linkedin.com/in/sumanthkumarmeesala" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2 group">
              <div className="p-2 rounded-full glass-card group-hover:border-primary/50 transition-colors">
                <Linkedin className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">LinkedIn</span>
            </a>
            <a href="mailto:meesalasumanth1@gmail.com" className="hover:text-primary transition-colors flex items-center gap-2 group">
              <div className="p-2 rounded-full glass-card group-hover:border-primary/50 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Email</span>
            </a>
            <div className="flex items-center gap-2 group cursor-default">
              <div className="p-2 rounded-full glass-card group-hover:border-secondary/50 transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Hyderabad, India</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
