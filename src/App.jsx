import React, { lazy, Suspense, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Education from './components/Education';
import Footer from './components/Footer';
// The WebGL layer is ~900 kB of three.js — split it out so the page paints first.
const PipelineScene = lazy(() => import('./three/PipelineScene'));
import { useActiveSection, usePrefersReducedMotion } from './hooks/useActiveSection';

const SECTION_IDS = ['home', 'about', 'skills', 'work', 'experience', 'education', 'contact'];

function App() {
  const ids = useMemo(() => SECTION_IDS, []);
  const active = useActiveSection(ids);
  const reducedMotion = usePrefersReducedMotion();

  return (
    // Deliberately no background here: the fixed -z-10 WebGL layer paints the ground.
    <div className="relative min-h-screen text-text">
      <Suspense
        fallback={
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 bg-void"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(34,211,197,0.10), transparent 70%), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(240,169,59,0.07), transparent 70%)',
            }}
          />
        }
      >
        <PipelineScene activeSection={active} reducedMotion={reducedMotion} />
      </Suspense>

      {/* faint measurement grid over the 3D layer, under the content */}
      <div aria-hidden="true" className="hairline-grid pointer-events-none fixed inset-0 -z-10 opacity-40" />

      <Navbar active={active} />
      <main className="relative">
        <Hero activeSection={active} />
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
