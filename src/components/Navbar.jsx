import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import Magnet from './reactbits/Magnet';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', to: 'home' },
    { name: 'About', to: 'about' },
    { name: 'Skills', to: 'skills' },
    { name: 'Projects', to: 'projects' },
    { name: 'Experience', to: 'experience' },
  ];

  return (
    <div className="fixed w-full z-50 top-0 flex justify-center mt-6 px-4 pointer-events-none">
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`pointer-events-auto transition-all duration-500 rounded-full px-5 py-2.5 flex items-center gap-6 ${
          isScrolled ? 'glass-nav shadow-lg shadow-black/50' : 'bg-transparent'
        }`}
      >
        <Link
          to="home"
          smooth={true}
          duration={500}
          className="cursor-pointer text-xl font-bold tracking-tighter text-white flex items-center hover:opacity-80 transition-opacity"
        >
          S<span className="text-slate-400">M</span>
          <span className="w-1.5 h-1.5 rounded-full bg-secondary ml-1 mb-1" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.name}
              to={link.to}
              smooth={true}
              duration={500}
              spy={true}
              activeClass="text-white"
              className="cursor-pointer text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
          <Magnet padding={20} magnetStrength={6}>
            <a
              href="/Sumanth_Resume.pdf"
              download
              aria-label="Download resume"
              title="Download resume"
              className="group inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-300 hover:text-white bg-white/5 hover:bg-gradient-to-r hover:from-primary hover:to-secondary border border-white/10 hover:border-transparent transition-all"
            >
              <Download className="w-4 h-4" />
            </a>
          </Magnet>
          <Magnet padding={20} magnetStrength={6}>
            <a
              href="/Sumanth_Detailed_CV.pdf"
              download
              aria-label="Download detailed CV"
              title="Download detailed CV"
              className="group inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-secondary/50 transition-all"
            >
              <FileText className="w-4 h-4" />
            </a>
          </Magnet>
        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;
