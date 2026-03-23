import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, MapPin, Github } from 'lucide-react';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Premium Background Elements */}
      <div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[150px] -z-10 animate-float" />

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
            Senior Full Stack Developer
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight leading-[1.1]">
            Building scalable <br className="hidden md:block" />
            <span className="text-gradient">digital experiences.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 mb-6 max-w-2xl mx-auto leading-relaxed">
            Hi, I'm <strong className="text-white font-semibold">Sumanth Kumar</strong>. With over 11 years of experience, I specialize in crafting high-performance distributed systems and AI-assisted workflows using Node.js, React, and AWS.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-slate-400">
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
