import React, { useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Education from './components/Education';
import Footer from './components/Footer';
import { useActiveSection } from './hooks/useActiveSection';

const SECTION_IDS = ['home', 'about', 'skills', 'work', 'experience', 'education', 'contact'];

function App() {
  const ids = useMemo(() => SECTION_IDS, []);
  const active = useActiveSection(ids);

  return (
    // Background is CSS only now; the 3D lives inline beside each section.
    <div className="relative min-h-screen text-text">
      {/* Static ground; the 3D now lives inline, one figure per section. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 bg-void" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 45% at 15% 0%, rgba(34,211,197,0.10), transparent 65%), radial-gradient(ellipse 55% 45% at 90% 85%, rgba(240,169,59,0.07), transparent 65%)',
        }}
      />

      {/* faint measurement grid */}
      <div aria-hidden="true" className="hairline-grid pointer-events-none fixed inset-0 -z-10 opacity-40" />

      <Navbar active={active} />
      <main className="relative">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Education />
      </main>
      <Footer />
    </div>
  );
}

export default App;
