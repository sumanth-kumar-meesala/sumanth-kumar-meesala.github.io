import { useEffect, useState } from 'react';

/** Reports which section id currently owns the viewport; drives the rail nav. */
export function useActiveSection(ids, offset = 0.42) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const pick = () => {
      const line = window.innerHeight * offset;
      let best = ids[0];
      let bestDelta = Infinity;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
        const delta = Math.abs(rect.top - line);
        if (rect.top <= line && rect.bottom >= line) {
          best = id;
          bestDelta = -1;
          break;
        }
        if (delta < bestDelta) {
          bestDelta = delta;
          best = id;
        }
      }
      setActive((prev) => (prev === best ? prev : best));
    };

    pick();
    window.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick);
    return () => {
      window.removeEventListener('scroll', pick);
      window.removeEventListener('resize', pick);
    };
  }, [ids, offset]);

  return active;
}

/** True when the visitor has asked for reduced motion. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
