import React from 'react';
import { Linkedin, ArrowUp, Github, Mail } from 'lucide-react';
import { Link } from 'react-scroll';

const Footer = () => {
  return (
    <footer className="relative mt-16 border-t border-white/10 bg-[#030014]">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

      <div className="container mx-auto px-6 py-12 flex flex-col items-center">

        <Link to="home"
          smooth={true}
          duration={800}
          className="absolute -top-6 w-12 h-12 rounded-full bg-background border border-white/20 flex items-center justify-center text-white hover:text-primary hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.5)] glow-border"
        >
          <div className="flex items-center justify-center w-full h-full glass-card rounded-full bg-surface/80">
            <ArrowUp className="w-5 h-5" />
          </div>
        </Link>

        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <Link to="about" smooth={true} duration={500} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer tracking-wide uppercase">About</Link>
          <Link to="skills" smooth={true} duration={500} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer tracking-wide uppercase">Skills</Link>
          <Link to="projects" smooth={true} duration={500} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer tracking-wide uppercase">Projects</Link>
          <Link to="experience" smooth={true} duration={500} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer tracking-wide uppercase">Experience</Link>
        </div>

        <div className="flex items-center gap-5 mb-8">
          <a href="https://github.com/sumanth-kumar-meesala/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full glass-card border border-white/10 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary/50 transition-all">
            <Github className="w-5 h-5" />
          </a>
          <a href="https://linkedin.com/in/sumanthkumarmeesala" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full glass-card border border-white/10 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary/50 transition-all">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="mailto:meesalasumanth1@gmail.com" className="w-10 h-10 rounded-full glass-card border border-white/10 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary/50 transition-all">
            <Mail className="w-5 h-5" />
          </a>
        </div>

        <p className="text-slate-500 text-sm text-center">
          &copy; {new Date().getFullYear()} Sumanth Kumar Meesala &middot; Senior LLM &amp; Agent Application Engineer &middot; Hyderabad, India
        </p>
      </div>
    </footer>
  );
};

export default Footer;
