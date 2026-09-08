import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from './useActiveSection';

/**
 * Reveals `total` characters over time, the way a streamed answer arrives.
 * Returns how many characters are visible and whether it has finished.
 * Instant when streaming is off or under prefers-reduced-motion.
 */
export function useTypewriter(total, { enabled = true, cps = 170, onDone } = {}) {
  const reduced = usePrefersReducedMotion();
  const animate = enabled && !reduced;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!animate) return undefined;
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const n = Math.min(total, Math.floor(((now - start) / 1000) * cps));
      setProgress(n);
      if (n < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total, animate, cps]);

  const shown = animate ? Math.min(progress, total) : total;
  const done = shown >= total;

  useEffect(() => {
    if (done && onDone) onDone();
  }, [done, onDone]);

  return { shown, done };
}
