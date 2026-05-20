import React, { useEffect, useRef, useState } from 'react';

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, [data-cursor="interactive"]';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    const small = window.matchMedia('(max-width: 768px)').matches;
    if (reduced || noHover || small) return;

    setEnabled(true);
    document.documentElement.classList.add('cursor-none');

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.18;
      current.current.y += (target.current.y - current.current.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (ringRef.current && ringRef.current.style.opacity !== '1') {
        ringRef.current.style.opacity = '1';
        dotRef.current.style.opacity = '1';
      }
    };

    const onLeave = () => {
      if (ringRef.current) ringRef.current.style.opacity = '0';
      if (dotRef.current) dotRef.current.style.opacity = '0';
    };

    const onOver = (e) => {
      const interactive = e.target.closest?.(INTERACTIVE_SELECTOR);
      if (interactive) {
        ringRef.current?.classList.add('cursor-ring-active');
        dotRef.current?.classList.add('cursor-dot-active');
      } else {
        ringRef.current?.classList.remove('cursor-ring-active');
        dotRef.current?.classList.remove('cursor-dot-active');
      }
    };

    const onDown = () => {
      ringRef.current?.classList.add('cursor-ring-down');
    };
    const onUp = () => {
      ringRef.current?.classList.remove('cursor-ring-down');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.documentElement.classList.remove('cursor-none');
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
    </>
  );
};

export default CustomCursor;
