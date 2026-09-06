import React, { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { NODES, EDGES, NODE_BY_ID, ACCENT_HEX } from './graph';

const IDLE = new THREE.Color('#4C5878');

/** Deterministic PRNG — keeps the dust field stable across re-renders. */
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Soft radial sprite used as the emissive halo around each node. */
function useGlowTexture() {
  return useMemo(() => {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function Node({ node, active, glowTex, frozen }) {
  const meshRef = useRef();
  const cageRef = useRef();
  const haloRef = useRef();
  const lit = useRef(0);

  const accent = useMemo(() => new THREE.Color(ACCENT_HEX[node.accent]), [node.accent]);
  const cage = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(node.r * 1.42, 1)),
    [node.r],
  );

  useFrame((state, delta) => {
    const target = active ? 1 : 0;
    lit.current += (target - lit.current) * Math.min(1, delta * 3.2);
    const k = lit.current;

    const mat = meshRef.current?.material;
    if (mat) {
      mat.emissive.copy(IDLE).lerp(accent, k);
      mat.emissiveIntensity = 0.45 + k * 1.25;
      mat.color.copy(IDLE).lerp(accent, k * 0.3);
    }
    if (cageRef.current) {
      cageRef.current.material.color.copy(IDLE).lerp(accent, k);
      cageRef.current.material.opacity = 0.5 + k * 0.5;
    }
    if (haloRef.current) {
      const breath = frozen ? 0 : Math.sin(state.clock.elapsedTime * 1.6 + node.pos[0]) * 0.06;
      const s = node.r * (3.9 + k * 2.1 + breath);
      haloRef.current.scale.set(s, s, s);
      haloRef.current.material.opacity = 0.13 + k * 0.3;
      haloRef.current.material.color.copy(IDLE).lerp(accent, 0.35 + k * 0.65);
    }
    if (meshRef.current && !frozen) {
      meshRef.current.rotation.y += delta * (0.12 + k * 0.22);
      meshRef.current.rotation.x += delta * 0.05;
      const s = 1 + k * 0.16;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={node.pos}>
      <sprite ref={haloRef}>
        <spriteMaterial
          map={glowTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.15}
        />
      </sprite>

      <mesh ref={meshRef}>
        <icosahedronGeometry args={[node.r, 1]} />
        <meshStandardMaterial
          flatShading
          color="#39415A"
          emissive="#39415A"
          emissiveIntensity={0.75}
          roughness={0.42}
          metalness={0.35}
        />
      </mesh>

      <lineSegments ref={cageRef} geometry={cage}>
        <lineBasicMaterial color="#39415A" transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}

/** Packets travelling along an edge, brightening when either end is lit. */
function Edge({ from, to, active, frozen, index }) {
  const a = useMemo(() => new THREE.Vector3(...NODE_BY_ID[from].pos), [from]);
  const b = useMemo(() => new THREE.Vector3(...NODE_BY_ID[to].pos), [to]);
  const lineRef = useRef();
  const packets = useRef([]);
  const groupRef = useRef();
  const lit = useRef(0);

  const packetSeeds = useMemo(
    () => [index * 0.37 % 1, (index * 0.37 + 0.5) % 1],
    [index],
  );

  useFrame((state, delta) => {
    const target = active ? 1 : 0;
    lit.current += (target - lit.current) * Math.min(1, delta * 3);
    const k = lit.current;

    if (lineRef.current?.material) {
      lineRef.current.material.opacity = 0.3 + k * 0.5;
      lineRef.current.material.color.copy(IDLE).lerp(new THREE.Color(ACCENT_HEX.teal), k * 0.8);
    }

    if (frozen) return;
    const t = state.clock.elapsedTime;
    packets.current.forEach((p, i) => {
      if (!p) return;
      const speed = 0.16 + i * 0.03;
      const u = (packetSeeds[i] + t * speed) % 1;
      p.position.lerpVectors(a, b, u);
      const fade = Math.sin(u * Math.PI);
      p.material.opacity = (0.45 + k * 0.5) * fade;
      const s = 0.045 + k * 0.035;
      p.scale.setScalar(s * (0.6 + fade * 0.6));
    });
  });

  return (
    <group ref={groupRef}>
      <Line
        ref={lineRef}
        points={[a, b]}
        color="#39415A"
        lineWidth={1}
        transparent
        opacity={0.2}
        depthWrite={false}
      />
      {packetSeeds.map((_, i) => (
        <mesh key={i} ref={(el) => (packets.current[i] = el)}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color={ACCENT_HEX.teal}
            transparent
            opacity={0.4}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Ambient particulate — gives the void depth without costing much. */
function Dust({ count, frozen }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const rand = mulberry32(0x5eed);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (rand() - 0.5) * 34;
      arr[i * 3 + 1] = (rand() - 0.5) * 20;
      arr[i * 3 + 2] = (rand() - 0.5) * 22 - 4;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current && !frozen) {
      ref.current.rotation.y += delta * 0.012;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.06) * 0.04;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#7C88A8"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** Scroll drives the camera down the pipeline; the pointer adds a little parallax. */
function CameraRig({ frozen }) {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const target = useRef(new THREE.Vector3(0, 0, 0));

  const keyframes = useMemo(
    () => [
      { pos: new THREE.Vector3(-1.2, 1.4, 13.2), look: new THREE.Vector3(-0.6, 0.4, 0) },
      { pos: new THREE.Vector3(1.8, -0.6, 9.6), look: new THREE.Vector3(0.6, 0, 0) },
      { pos: new THREE.Vector3(-0.6, 1.1, 11.4), look: new THREE.Vector3(1.4, 0.2, 0) },
    ],
    [],
  );

  useFrame((state, delta) => {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, window.scrollY / max));

    const seg = p < 0.5 ? 0 : 1;
    const local = p < 0.5 ? p / 0.5 : (p - 0.5) / 0.5;
    const from = keyframes[seg];
    const to = keyframes[seg + 1];

    const px = state.pointer.x * (frozen ? 0 : 0.9);
    const py = state.pointer.y * (frozen ? 0 : 0.5);
    pointer.current.x += (px - pointer.current.x) * Math.min(1, delta * 2.4);
    pointer.current.y += (py - pointer.current.y) * Math.min(1, delta * 2.4);

    const desired = from.pos.clone().lerp(to.pos, local);
    desired.x += pointer.current.x;
    desired.y += pointer.current.y;

    camera.position.lerp(desired, Math.min(1, delta * 2.2));
    target.current.lerp(from.look.clone().lerp(to.look, local), Math.min(1, delta * 2.2));
    camera.lookAt(target.current);
  });

  return null;
}

function Scene({ activeSection, frozen, dustCount }) {
  const glowTex = useGlowTexture();
  const activeNodeId = useMemo(() => {
    const n = NODES.find((x) => x.section === activeSection);
    return n ? n.id : 'core';
  }, [activeSection]);

  return (
    <>
      <color attach="background" args={['#0B0D12']} />
      <fog attach="fog" args={['#0B0D12', 14, 34]} />
      <ambientLight intensity={0.9} />
      <pointLight position={[0, 3, 7]} intensity={55} distance={34} color="#22D3C5" />
      <pointLight position={[6, -3, 5]} intensity={60} distance={30} color="#F0A93B" />

      {/* Offset right so the hub clears the copy column on wide screens. */}
      <group position={[1.7, 0.35, 0]}>
      {EDGES.map(([from, to], i) => (
        <Edge
          key={`${from}-${to}`}
          index={i}
          from={from}
          to={to}
          frozen={frozen}
          active={activeNodeId === from || activeNodeId === to}
        />
      ))}

      {NODES.map((n) => (
        <Node key={n.id} node={n} glowTex={glowTex} frozen={frozen} active={n.id === activeNodeId} />
      ))}

      </group>

      <Dust count={dustCount} frozen={frozen} />
      <CameraRig frozen={frozen} />
    </>
  );
}

/**
 * Fixed, full-viewport WebGL layer that sits behind every section.
 * Purely decorative: aria-hidden, pointer-events off, and frozen when
 * the visitor prefers reduced motion.
 */
const PipelineScene = ({ activeSection, reducedMotion = false }) => {
  const small = typeof window !== 'undefined' && window.innerWidth < 768;
  const dustCount = small ? 420 : 1400;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background: '#0B0D12' }}
    >
      <Canvas
        dpr={[1, small ? 1.3 : 1.8]}
        camera={{ position: [-1.2, 1.4, 13.2], fov: 44, near: 0.1, far: 60 }}
        gl={{ antialias: !small, powerPreference: 'high-performance', alpha: false }}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <Suspense fallback={null}>
          <Scene activeSection={activeSection} frozen={reducedMotion} dustCount={dustCount} />
        </Suspense>
      </Canvas>

      {/* Scrims: keep the scene readable as texture, never as competition for the copy. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(11,13,18,0.78)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void via-void/80 to-void/25 lg:via-void/45 lg:to-transparent" />
    </div>
  );
};

export default PipelineScene;
