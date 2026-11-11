"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getLocation } from "@/lib/data";
import { ambient, mulberry32 } from "@/lib/world/ambient";

interface Puff {
  dx: number;
  dy: number;
  dz: number;
  r: number;
}
interface Cloud {
  x: number;
  y: number;
  z: number;
  scale: number;
  /** drifting clouds move east and wrap; orbiting clouds circle the air temple */
  kind: "drift" | "orbit";
  speed: number;
  angle: number;
  radius: number;
  puffs: Puff[];
}

const WRAP = 150;
const WHITE = new THREE.Color(1, 1, 1);

function makeClouds(driftCount: number, orbitCount: number): Cloud[] {
  const rand = mulberry32(42);
  const puffs = (n: number): Puff[] =>
    Array.from({ length: n }, (_, i) => ({
      dx: (i - (n - 1) / 2) * 1.6 + (rand() - 0.5),
      dy: rand() * 0.8,
      dz: (rand() - 0.5) * 1.8,
      r: 1.1 + rand() * 1.1 - Math.abs(i - (n - 1) / 2) * 0.25,
    }));
  const clouds: Cloud[] = [];
  for (let i = 0; i < driftCount; i++) {
    clouds.push({
      kind: "drift",
      x: -WRAP + rand() * WRAP * 2,
      y: 20 + rand() * 9,
      z: -80 + rand() * 160,
      scale: 1.2 + rand() * 1.4,
      speed: 1 + rand() * 1.3,
      angle: 0,
      radius: 0,
      puffs: puffs(3 + Math.floor(rand() * 3)),
    });
  }
  for (let i = 0; i < orbitCount; i++) {
    clouds.push({
      kind: "orbit",
      x: 0,
      y: 9 + rand() * 7,
      z: 0,
      scale: 0.7 + rand() * 0.6,
      speed: 0.06 + rand() * 0.05,
      angle: (i / orbitCount) * Math.PI * 2,
      radius: 9 + rand() * 6,
      puffs: puffs(3 + Math.floor(rand() * 2)),
    });
  }
  return clouds;
}

/** Low-poly cloud puffs drifting across the map, with a wreath wrapped around the Air Nomad peaks. */
export function Clouds({ drift = 14, orbit = 7, animate = true, shadows = true }) {
  const clouds = useMemo(() => makeClouds(drift, orbit), [drift, orbit]);
  const count = clouds.reduce((n, c) => n + c.puffs.length, 0);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const state = useRef(clouds.map((c) => ({ x: c.x, angle: c.angle })));
  const temple = getLocation("southern-air-temple")!.position;

  const write = useMemo(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    return (target: THREE.InstancedMesh, positions: { x: number; angle: number }[]) => {
      let k = 0;
      clouds.forEach((c, i) => {
        const p = positions[i];
        const cx = c.kind === "drift" ? p.x : temple[0] + Math.cos(p.angle) * c.radius;
        const cz = c.kind === "drift" ? c.z : temple[1] + Math.sin(p.angle) * c.radius * 0.8;
        for (const puff of c.puffs) {
          pos.set(cx + puff.dx * c.scale, c.y + puff.dy * c.scale, cz + puff.dz * c.scale);
          scl.set(puff.r * c.scale, puff.r * c.scale * 0.72, puff.r * c.scale);
          target.setMatrixAt(k++, m.compose(pos, q, scl));
        }
      });
      target.instanceMatrix.needsUpdate = true;
    };
  }, [clouds, temple]);

  useLayoutEffect(() => {
    if (mesh.current) write(mesh.current, state.current);
  }, [write]);

  useFrame((_, delta) => {
    if (material.current) {
      material.current.color.copy(ambient.tint).lerp(WHITE, 0.35);
      material.current.emissiveIntensity = 0.6 * (1 - ambient.night * 0.7);
    }
    if (!animate || !mesh.current) return;
    const dt = Math.min(delta, 0.1);
    clouds.forEach((c, i) => {
      const p = state.current[i];
      if (c.kind === "drift") {
        p.x += c.speed * dt;
        if (p.x > WRAP) p.x = -WRAP;
      } else {
        p.angle += c.speed * dt;
      }
    });
    write(mesh.current, state.current);
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow={shadows} frustumCulled={false}>
      <sphereGeometry args={[1, 12, 9]} />
      <meshStandardMaterial
        ref={material}
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.6}
        roughness={1}
        transparent
        opacity={0.95}
      />
    </instancedMesh>
  );
}
