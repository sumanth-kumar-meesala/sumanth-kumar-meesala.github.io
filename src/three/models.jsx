import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STRUCT = '#5A6790';
const STRUCT_DIM = '#3C4763';

/** A cylinder stretched between two points — used for every link in these models. */
function Rod({ a, b, color = STRUCT, radius = 0.028, opacity = 1 }) {
  const { position, quaternion, length } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = new THREE.Vector3().subVectors(vb, va);
    const len = dir.length() || 0.0001;
    return {
      position: new THREE.Vector3().addVectors(va, vb).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.clone().normalize(),
      ),
      length: len,
    };
  }, [a, b]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 6]} />
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.6}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

/** Evenly spread points on a sphere. */
function fibonacciSphere(n, r) {
  const pts = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i += 1) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = phi * i;
    pts.push([Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r]);
  }
  return pts;
}

/* ── 01 · LATTICE — generative AI, agents ─────────────────────────────── */
export function Lattice({ accent, hover }) {
  const coreRef = useRef();
  const nodesRef = useRef();
  const ringsRef = useRef();
  const cage = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.15, 1)), []);
  const points = useMemo(() => fibonacciSphere(16, 1.15), []);

  useFrame((state, delta) => {
    const h = hover.current;
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      const s = 0.5 + Math.sin(t * 1.8) * 0.03 + h * 0.1;
      coreRef.current.scale.setScalar(s / 0.5);
      coreRef.current.material.emissiveIntensity = 0.85 + h * 1.3 + Math.sin(t * 2.4) * 0.18;
    }
    if (ringsRef.current) ringsRef.current.rotation.z += delta * (0.35 + h * 0.7);
    if (nodesRef.current) {
      nodesRef.current.children.forEach((m, i) => {
        const p = (Math.sin(t * 2 + i * 0.9) + 1) / 2;
        m.material.emissiveIntensity = 0.5 + p * (0.9 + h * 1.4);
        m.scale.setScalar(0.85 + p * 0.3);
      });
    }
  });

  return (
    <group>
      <lineSegments geometry={cage}>
        <lineBasicMaterial color={STRUCT} transparent opacity={0.75} />
      </lineSegments>

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial
          color={STRUCT_DIM}
          emissive={accent}
          emissiveIntensity={0.85}
          flatShading
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      <group ref={ringsRef}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2 + i * 0.9, i * 0.7, 0]}>
            <torusGeometry args={[1.15, 0.012, 6, 48]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>

      <group ref={nodesRef}>
        {points.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ── 02 · MESH — MCP tools, multi-agent ───────────────────────────────── */
const MESH_NODES = [
  [0, 0, 0],
  [0.95, 0.55, 0.2],
  [-0.9, 0.5, -0.25],
  [0.75, -0.65, -0.35],
  [-0.7, -0.6, 0.4],
  [0.15, 1.0, -0.55],
  [-0.2, -1.0, -0.15],
];
const MESH_LINKS = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 5], [3, 6], [4, 6], [1, 3]];

export function Mesh({ accent, hover }) {
  const group = useRef();
  const packet = useRef();

  useFrame((state, delta) => {
    const h = hover.current;
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.children.forEach((m, i) => {
        if (!m.material?.emissive) return;
        const p = (Math.sin(t * 1.6 + i * 1.3) + 1) / 2;
        m.material.emissiveIntensity = 0.18 + p * (0.5 + h * 0.9);
        m.rotation.y += delta * (0.3 + i * 0.05);
      });
    }
    if (packet.current) {
      const cycle = (t * 0.4) % MESH_LINKS.length;
      const li = Math.floor(cycle);
      const u = cycle - li;
      const [ai, bi] = MESH_LINKS[li];
      packet.current.position.lerpVectors(
        new THREE.Vector3(...MESH_NODES[ai]),
        new THREE.Vector3(...MESH_NODES[bi]),
        u,
      );
      packet.current.material.opacity = Math.sin(u * Math.PI) * (0.7 + h * 0.3);
    }
  });

  return (
    <group>
      {MESH_LINKS.map(([a, b], i) => (
        <Rod key={i} a={MESH_NODES[a]} b={MESH_NODES[b]} radius={0.018} opacity={0.85} />
      ))}

      <group ref={group}>
        {MESH_NODES.map((p, i) => (
          <mesh key={i} position={p}>
            <boxGeometry args={i === 0 ? [0.42, 0.42, 0.42] : [0.24, 0.24, 0.24]} />
            <meshStandardMaterial
              color={STRUCT_DIM}
              emissive={accent}
              emissiveIntensity={0.22}
              flatShading
              roughness={0.35}
              metalness={0.55}
            />
          </mesh>
        ))}
      </group>

      <mesh ref={packet}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color={accent} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── 03 · SLABS — the stack, cloud infrastructure ─────────────────────── */
export function Slabs({ accent, hover }) {
  const group = useRef();
  const LAYERS = 5;

  useFrame((state) => {
    const h = hover.current;
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.children.forEach((layer, i) => {
      const base = (i - (LAYERS - 1) / 2) * 0.32;
      // hovering fans the stack apart
      layer.position.y = base + h * (i - (LAYERS - 1) / 2) * 0.13;
      layer.rotation.y = Math.sin(t * 0.4 + i * 0.5) * 0.06 + h * (i - 2) * 0.05;
      const led = layer.children[1];
      if (led?.material) {
        const on = (Math.sin(t * 2.2 - i * 0.85) + 1) / 2;
        led.material.emissiveIntensity = 0.5 + on * (1.1 + h * 1.6);
      }
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: LAYERS }).map((_, i) => (
        <group key={i}>
          <mesh>
            <boxGeometry args={[1.5, 0.14, 0.9]} />
            <meshStandardMaterial color={STRUCT} roughness={0.42} metalness={0.62} flatShading />
          </mesh>
          <mesh position={[0.52, 0, 0.46]}>
            <boxGeometry args={[0.34, 0.05, 0.02]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
          </mesh>
          <mesh position={[-0.3, 0, 0.46]}>
            <boxGeometry args={[0.5, 0.03, 0.015]} />
            <meshStandardMaterial color={STRUCT_DIM} emissive={STRUCT_DIM} emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── 04 · BRANCH — pipelines, CI/CD, delivery ─────────────────────────── */
const BRANCH_NODES = [
  [0, -1.15, 0],
  [0, -0.35, 0],
  [-0.72, 0.35, 0.18],
  [0.72, 0.35, -0.18],
  [-1.05, 1.1, 0.3],
  [-0.38, 1.1, 0.05],
  [0.4, 1.1, -0.05],
  [1.06, 1.1, -0.3],
];
const BRANCH_LINKS = [[0, 1], [1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7]];

export function Branch({ accent, hover }) {
  const nodes = useRef();
  const packet = useRef();

  useFrame((state) => {
    const h = hover.current;
    const t = state.clock.elapsedTime;
    if (nodes.current) {
      nodes.current.children.forEach((m, i) => {
        const wave = (Math.sin(t * 1.8 - i * 0.6) + 1) / 2;
        m.material.emissiveIntensity = 0.2 + wave * (0.6 + h * 1.1);
        m.scale.setScalar(1 + wave * 0.12 + h * 0.08);
      });
    }
    if (packet.current) {
      const cycle = (t * 0.5) % BRANCH_LINKS.length;
      const li = Math.floor(cycle);
      const u = cycle - li;
      const [a, b] = BRANCH_LINKS[li];
      packet.current.position.lerpVectors(
        new THREE.Vector3(...BRANCH_NODES[a]),
        new THREE.Vector3(...BRANCH_NODES[b]),
        u,
      );
      packet.current.material.opacity = Math.sin(u * Math.PI) * (0.75 + h * 0.25);
    }
  });

  return (
    <group>
      {BRANCH_LINKS.map(([a, b], i) => (
        <Rod key={i} a={BRANCH_NODES[a]} b={BRANCH_NODES[b]} radius={0.022} />
      ))}
      <group ref={nodes}>
        {BRANCH_NODES.map((p, i) => (
          <mesh key={i} position={p}>
            <octahedronGeometry args={[i === 0 ? 0.2 : 0.14, 0]} />
            <meshStandardMaterial
              color={STRUCT_DIM}
              emissive={accent}
              emissiveIntensity={0.25}
              flatShading
              roughness={0.32}
              metalness={0.55}
            />
          </mesh>
        ))}
      </group>
      <mesh ref={packet}>
        <sphereGeometry args={[0.075, 8, 8]} />
        <meshBasicMaterial color={accent} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── 05 · BARS — eleven years, measured growth ────────────────────────── */
const BAR_H = [0.5, 0.85, 0.7, 1.25, 1.05, 1.6];

export function Bars({ accent, hover }) {
  const group = useRef();

  useFrame((state) => {
    const h = hover.current;
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.children.forEach((bar, i) => {
      const breathe = 1 + Math.sin(t * 1.4 + i * 0.7) * 0.05;
      const grow = 1 + h * 0.16;
      const height = BAR_H[i] * breathe * grow;
      bar.scale.y = height / BAR_H[i];
      bar.position.y = -0.85 + (BAR_H[i] * bar.scale.y) / 2;
      const cap = bar.children[1];
      if (cap?.material) {
        cap.material.emissiveIntensity = 0.5 + h * 1.1 + Math.sin(t * 2 + i) * 0.18;
      }
    });
  });

  return (
    <group>
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[1.85, 0.06, 0.72]} />
        <meshStandardMaterial color={STRUCT_DIM} roughness={0.5} metalness={0.4} />
      </mesh>
      <group ref={group}>
        {BAR_H.map((hh, i) => (
          <group key={i} position={[-0.75 + i * 0.3, -0.85 + hh / 2, 0]}>
            <mesh>
              <boxGeometry args={[0.2, hh, 0.2]} />
              <meshStandardMaterial color={STRUCT} roughness={0.4} metalness={0.6} flatShading />
            </mesh>
            <mesh position={[0, hh / 2 + 0.025, 0]}>
              <boxGeometry args={[0.22, 0.05, 0.22]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ── 06 · CRYSTAL — study, analysis, a credential ─────────────────────── */
export function Crystal({ accent, hover }) {
  const body = useRef();
  const core = useRef();
  const orbit = useRef();

  useFrame((state, delta) => {
    const h = hover.current;
    const t = state.clock.elapsedTime;
    if (body.current) {
      body.current.material.emissiveIntensity = 0.12 + h * 0.35;
      body.current.material.opacity = 0.78 - h * 0.16; // hovering makes it clearer
    }
    if (core.current) {
      core.current.material.emissiveIntensity = 0.9 + h * 1.4 + Math.sin(t * 2.2) * 0.2;
      core.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.045 + h * 0.1);
    }
    if (orbit.current) {
      orbit.current.rotation.y += delta * (0.5 + h * 0.9);
      orbit.current.children.forEach((m, i) => {
        if (!m.material?.emissive) return;
        m.rotation.x += delta * (0.8 + i * 0.2);
        m.rotation.z += delta * 0.5;
        m.material.emissiveIntensity = 0.5 + h * 1.1;
      });
    }
  });

  return (
    <group>
      {/* glowing core, seen through the faceted body */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color={STRUCT_DIM} emissive={accent} emissiveIntensity={0.9} flatShading />
      </mesh>

      <mesh ref={body}>
        <dodecahedronGeometry args={[0.92, 0]} />
        <meshStandardMaterial
          color={STRUCT}
          emissive={accent}
          emissiveIntensity={0.12}
          flatShading
          roughness={0.14}
          metalness={0.88}
          transparent
          opacity={0.78}
        />
      </mesh>

      <group ref={orbit} rotation={[0.35, 0, 0.18]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.28, 0.014, 6, 48]} />
          <meshBasicMaterial color={accent} transparent opacity={0.42} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.28, 0, Math.sin(a) * 1.28]}>
              <tetrahedronGeometry args={[0.13, 0]} />
              <meshStandardMaterial color={STRUCT_DIM} emissive={accent} emissiveIntensity={0.5} flatShading />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/* ── 07 · BEACON — reach out, production, signal ──────────────────────── */
export function Beacon({ accent, hover }) {
  const core = useRef();
  const rings = useRef();

  useFrame((state, delta) => {
    const h = hover.current;
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.material.emissiveIntensity = 0.8 + h * 1.5 + Math.sin(t * 3) * 0.22;
      core.current.scale.setScalar(1 + Math.sin(t * 3) * 0.05 + h * 0.12);
    }
    if (rings.current) {
      rings.current.rotation.y += delta * (0.4 + h * 0.9);
      rings.current.children.forEach((r, i) => {
        const phase = (t * 0.6 + i * 0.33) % 1;
        const s = 0.55 + phase * 1.15;
        r.scale.setScalar(s);
        r.material.opacity = (1 - phase) * (0.55 + h * 0.4);
      });
    }
  });

  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color={STRUCT_DIM} emissive={accent} emissiveIntensity={0.8} flatShading roughness={0.3} metalness={0.5} />
      </mesh>
      <group ref={rings}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1, 0.018, 6, 40]} />
            <meshBasicMaterial color={accent} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <torusGeometry args={[0.75, 0.014, 6, 40]} />
        <meshStandardMaterial color={STRUCT} emissive={accent} emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

