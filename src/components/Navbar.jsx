import React, { useEffect, useState } from 'react';
import { Link } from 'react-scroll';
import { Menu, X } from 'lucide-react';
import { profile } from '../data/resume';

const links = [
  { name: 'About', to: 'about', n: '002' },
  { name: 'Stack', to: 'skills', n: '003' },
  { name: 'Work', to: 'work', n: '004' },
  { name: 'Experience', to: 'experience', n: '005' },
  { name: 'Education', to: 'education', n: '006' },
];

const Navbar = ({ active }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-line bg-void/80 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="shell flex h-16 items-center justify-between md:h-[72px]">
        <Link to="home" smooth duration={600} className="group flex cursor-pointer items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping bg-teal opacity-60" />
            <span className="relative inline-flex h-2 w-2 bg-teal" />
          </span>
          <span className="font-mono text-[12px] tracking-[0.1em] text-text md:text-[13px]">
            SUMANTH<span className="text-dim">.</span>MEESALA
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              smooth
              duration={600}
              offset={-72}
              className={`meta cursor-pointer px-3 py-2 transition-colors ${
                active === l.to ? 'text-teal' : 'text-dim hover:text-text'
              }`}
            >
              {l.name}
            </Link>
          ))}
          <Link
            to="contact"
            smooth
            duration={700}
            className="meta ml-3 cursor-pointer border border-teal/40 bg-teal/[0.07] px-4 py-2.5 text-teal transition-colors hover:bg-teal hover:text-void"
          >
            Contact
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="-mr-2 flex h-11 w-11 items-center justify-center text-text md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-line bg-void/95 backdrop-blur-md md:hidden">
          <div className="shell flex flex-col py-2">
            {[...links, { name: 'Contact', to: 'contact', n: '007' }].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                smooth
                duration={600}
                offset={-64}
                onClick={() => setOpen(false)}
                className="meta flex h-12 cursor-pointer items-center gap-4 border-b border-line-2 text-dim last:border-b-0"
              >
                <span className="text-teal/70">{l.n}</span>
                {l.name}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
      <p className="sr-only">{profile.name} — {profile.role}</p>
    </header>
  );
};

export default Navbar;
