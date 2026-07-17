import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, MapPin, Github, Mail, Download, FileText } from 'lucide-react';
import Magnet from './reactbits/Magnet';

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
            Senior AI Engineer @ Affle · Open to opportunities
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight leading-[1.05]">
            Building <span className="text-gradient">AI-native</span><br className="hidden md:block" />
            product systems.
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 mb-3 max-w-2xl mx-auto leading-relaxed">
            Hi, I'm <strong className="text-white font-semibold">Sumanth Kumar Meesala</strong>. 11+ years shipping production
            <span className="text-white"> Node.js, React, and AngularJS</span> systems &mdash; now <span className="text-white">Senior AI Engineer at Affle</span>, where a 360&deg; review platform I built is used by
            <span className="text-white"> 600+ employees across global offices</span>. I build LLM-powered features, agentic workflows, and RAG retrieval on AWS, with
            <span className="text-white"> Claude Code, Cursor, GitHub Copilot, and Augment Code</span> as my daily driver.
          </motion.p>

          <motion.p variants={itemVariants} className="text-sm md:text-base text-slate-500 mb-8 max-w-xl mx-auto">
            Founder of an AI content factory (Next.js · Claude Agent SDK · Hugging Face Parler-TTS · Remotion) &mdash; a fully AI-generated YouTube channel at <strong className="text-secondary">2,200+ subscribers and 600k+ views in 4 months</strong>.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Magnet padding={40} magnetStrength={7}>
              <a
                href="/Sumanth_Resume.pdf"
                download
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
              >
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                Download Resume
              </a>
            </Magnet>
            <Magnet padding={40} magnetStrength={7}>
              <a
                href="/Sumanth_Detailed_CV.pdf"
                download
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-sm text-white glass-card border border-white/15 hover:border-secondary/50 hover:bg-white/5 transition-colors"
              >
                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Detailed CV
              </a>
            </Magnet>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-5 md:gap-7 text-slate-400">
            <Magnet padding={30} magnetStrength={5}>
              <a href="https://github.com/sumanth-kumar-meesala/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2 group">
                <div className="p-2 rounded-full glass-card group-hover:border-primary/50 transition-colors">
                  <Github className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">GitHub</span>
              </a>
            </Magnet>
            <Magnet padding={30} magnetStrength={5}>
              <a href="https://linkedin.com/in/sumanthkumarmeesala" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2 group">
                <div className="p-2 rounded-full glass-card group-hover:border-primary/50 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">LinkedIn</span>
              </a>
            </Magnet>
            <Magnet padding={30} magnetStrength={5}>
              <a href="mailto:meesalasumanth1@gmail.com" className="hover:text-primary transition-colors flex items-center gap-2 group">
                <div className="p-2 rounded-full glass-card group-hover:border-primary/50 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Email</span>
              </a>
            </Magnet>
            <div className="flex items-center gap-2 group cursor-default">
              <div className="p-2 rounded-full glass-card group-hover:border-secondary/50 transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Melbourne, VIC</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
