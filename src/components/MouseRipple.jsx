import React, { useEffect, useRef } from 'react';

/**
 * Mouse ripple + cursor-follow glow.
 * - Click anywhere -> a soft expanding ring ripple emanates from the click point.
 * - Cursor glow -> a subtle gradient blob trails the cursor with smooth lerp.
 * Disabled on touch devices, small screens, and when prefers-reduced-motion is set.
 */
const MouseRipple = () => {
  const glowRef = useRef(null);
  const ripplesRef = useRef(null);
  const target = useRef({ x: -1000, y: -1000 });
  const current = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    const small   = window.matchMedia('(max-width: 768px)').matches;
    if (reduced || noHover || small) return;

    const animate = () => {
      // Soft lerp toward the cursor for a buttery follow.
      current.current.x += (target.current.x - current.current.x) * 0.14;
      current.current.y += (target.current.y - current.current.y) * 0.14;
      if (glowRef.current) {
        const x = current.current.x - 240;
        const y = current.current.y - 240;
        glowRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (glowRef.current && glowRef.current.style.opacity !== '1') {
        glowRef.current.style.opacity = '1';
      }
    };

    const onLeave = () => {
      if (glowRef.current) glowRef.current.style.opacity = '0';
    };

    const onClick = (e) => {
      // Skip clicks coming from the script/devtools (synthesized) without coords.
      if (typeof e.clientX !== 'number') return;
      const ripple = document.createElement('span');
      ripple.className = 'mouse-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top  = `${e.clientY}px`;
      ripplesRef.current?.appendChild(ripple);
      // Auto-clean after the animation finishes.
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave, { passive: true });
    window.addEventListener('click', onClick, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
      <div ref={ripplesRef} className="mouse-ripple-container" aria-hidden="true" />
    </>
  );
};

export default MouseRipple;
