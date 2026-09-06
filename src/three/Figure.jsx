import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Lattice, Mesh, Slabs, Branch, Bars, Crystal, Beacon } from './models';
import { useDragRotate } from './useDragRotate';
import { usePrefersReducedMotion } from '../hooks/useActiveSection';

const ACCENT = { teal: '#22D3C5', amber: '#F0A93B' };
const MODELS = { lattice: Lattice, mesh: Mesh, slabs: Slabs, branch: Branch, bars: Bars, crystal: Crystal, beacon: Beacon };

function Rig({ kind, accent, hoverRef, frozen, api }) {
  const group = useRef();
  const Model = MODELS[kind];

  useFrame((state, delta) => {
    const { rot, hover } = api.step(delta, { hovered: hoverRef.current, frozen });
    if (!group.current) return;
    group.current.rotation.y = rot.y;
    group.current.rotation.x = rot.x;
    // hover lifts the figure and nudges it toward the viewer
    group.current.position.y = hover * 0.14;
    group.current.scale.setScalar(1 + hover * 0.06);
  });

  return (
    <group ref={group}>
      <Model accent={accent} hover={api.hover} />
    </group>
  );
}

/**
 * A small, self-contained 3D figure for one topic.
 *
 * Drag to rotate (momentum on release, tilt eases back); hovering lifts it,
 * brightens it and speeds it up. Rendering pauses whenever the figure is
 * off-screen, and the whole thing goes still under prefers-reduced-motion.
 */
const Figure = ({
  kind,
  caption,
  accent = 'teal',
  size = 260,
  className = '',
}) => {
  const wrapRef = useRef(null);
  const hoverRef = useRef(false);
  // No IntersectionObserver (old browser / SSR): assume visible and just render.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');
  const reduced = usePrefersReducedMotion();
  const api = useDragRotate();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '160px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const active = api.isHover || api.isDragging;
  useEffect(() => {
    hoverRef.current = active;
  }, [active]);

  const color = ACCENT[accent] ?? ACCENT.teal;

  return (
    <figure ref={wrapRef} className={`group relative m-0 ${className}`}>
      <div
        {...api.handlers}
        role="img"
        aria-label={caption}
        style={{ height: size, touchAction: 'pan-y' }}
        className={`panel ticks relative w-full overflow-hidden transition-colors duration-300 ${
          api.isDragging ? 'cursor-grabbing border-teal/45' : 'cursor-grab hover:border-teal/35'
        }`}
      >
        {/* accent wash that warms up on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(ellipse at 50% 55%, ${color}22, transparent 70%)` }}
        />

        <Canvas
          dpr={[1, 1.75]}
          frameloop={inView && !reduced ? 'always' : 'demand'}
          camera={{ position: [0, 0.2, 4.2], fov: 40 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={1.9} />
          <directionalLight position={[4, 5, 6]} intensity={2.8} />
          <directionalLight position={[-4, 2, -3]} intensity={1.1} color="#8FA0D0" />
          <pointLight position={[-2.5, -2, 3]} intensity={14} distance={14} color={color} />
          <Rig kind={kind} accent={color} hoverRef={hoverRef} frozen={reduced} api={api} />
        </Canvas>

        {/* interaction hint */}
        <span
          aria-hidden="true"
          className={`meta pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-dim transition-opacity duration-300 ${
            api.isDragging ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          drag to rotate
        </span>
      </div>

      {caption ? (
        <figcaption className="meta mt-3 flex items-center gap-2 text-dim">
          <span
            className="inline-block h-1.5 w-1.5 transition-colors duration-300"
            style={{ background: active ? color : '#232838' }}
          />
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
};

export default Figure;
