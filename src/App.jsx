import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Infrastructure from './components/Infrastructure';
import Footer from './components/Footer';
import MouseRipple from './components/MouseRipple';

function App() {
  return (
    <div className="bg-base-100 text-base-content min-h-screen">
      <MouseRipple />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Infrastructure />
        <Experience />
      </main>
      <Footer />
    </div>
  );
}

export default App;
