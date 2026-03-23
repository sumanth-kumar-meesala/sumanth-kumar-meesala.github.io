import React from 'react';
import { motion } from 'framer-motion';
import { User, Code2, Cpu } from 'lucide-react';

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
            {/* Decorative background element inside card */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                <p>
                  I am a <strong className="text-white">Senior Full Stack Developer</strong> with over 11 years of experience designing high-performance backend services, modern frontend architectures, and integrating innovative tools.
                </p>
                <p>
                  My expertise lies in building scalable cloud-native applications using Node.js, React.js, Angular, and AWS. I actively embrace AI-assisted development workflows incorporating tools like Claude Code, Cursor, and GitHub Copilot to significantly accelerate delivery and elevate code quality.
                </p>
                <p>
                  Recently, my primary focus has been on architecting AI-driven workflows, robust backend orchestration systems, and maintaining extensive distributed architectures.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-white/5 hover:bg-white/5 transition-colors">
                  <Cpu className="w-8 h-8 text-secondary" />
                  <h3 className="text-white font-semibold">Backend & Cloud</h3>
                  <p className="text-sm text-slate-400">Node.js, AWS, Microservices</p>
                </div>
                <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-white/5 hover:bg-white/5 transition-colors">
                  <Code2 className="w-8 h-8 text-primary" />
                  <h3 className="text-white font-semibold">Frontend AI</h3>
                  <p className="text-sm text-slate-400">React, Modern UI, AI Tools</p>
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
