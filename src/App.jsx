import React, { useMemo } from 'react';
import Rail from './components/Rail';
import AskPanel from './components/AskPanel';
import Work from './components/Work';
import Experience from './components/Experience';
import Stack from './components/Stack';
import Education from './components/Education';
import EvalPanel from './components/EvalPanel';
import Footer from './components/Footer';
import { useActiveSection } from './hooks/useActiveSection';

const SECTION_IDS = ['ask', 'work', 'experience', 'stack', 'education', 'agent', 'contact'];

/**
 * Two columns: the facts rail (sticky) and the page. The first screen of the
 * page is the conversation; the readable sections follow for anyone who
 * would rather scan than ask.
 */
function App() {
  const ids = useMemo(() => SECTION_IDS, []);
  const active = useActiveSection(ids);

  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[400px_minmax(0,1fr)] xl:grid-cols-[440px_minmax(0,1fr)]">
      <Rail active={active} />
      <div className="min-w-0">
        <main>
          <AskPanel />
          <Work />
          <Experience />
          <Stack />
          <Education />
          <EvalPanel />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
