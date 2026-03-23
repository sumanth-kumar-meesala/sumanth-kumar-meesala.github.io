import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Infrastructure from './components/Infrastructure';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-base-100 text-base-content min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Infrastructure />
        <Experience />
      </main>
      <Footer />
    </div>
  );
}

export default App;
