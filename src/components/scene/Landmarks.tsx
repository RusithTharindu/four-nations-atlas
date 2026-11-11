"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getLocation } from "@/lib/data";
import { heightAt, volcanoCraters } from "@/lib/world/terrain";

/** Simple-shape hints of an Air Nomad temple: towers with pointed roofs on a plateau. */
function AirTemple({ x, z }: { x: number; z: number }) {
  const towers = useMemo(() => {
    const base = heightAt(x, z);
    return [
      { dx: 0, dz: 0, h: 3.2, r: 0.9 },
      { dx: 1.8, dz: 0.8, h: 2.2, r: 0.55 },
      { dx: -1.7, dz: 1, h: 2, r: 0.55 },
      { dx: 0.4, dz: -1.8, h: 2.6, r: 0.6 },
    ].map((t) => ({ ...t, y: Math.min(heightAt(x + t.dx, z + t.dz), base + 0.4) }));
  }, [x, z]);

  return (
    <group position={[x, 0, z]}>
      {towers.map((t, i) => (
        <group key={i} position={[t.dx, t.y, t.dz]}>
          <mesh position-y={t.h / 2} castShadow>
            <cylinderGeometry args={[t.r * 0.8, t.r, t.h, 7]} />
            <meshStandardMaterial color="#efe6d2" flatShading roughness={0.8} />
          </mesh>
          <mesh position-y={t.h + t.r * 0.9} castShadow>
            <coneGeometry args={[t.r * 1.35, t.r * 1.9, 7]} />
            <meshStandardMaterial color="#5b8fb3" flatShading roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A gently pulsing glow inside each big Fire Nation crater. */
function LavaGlow({ animate }: { animate: boolean }) {
  const craters = useMemo(
    () => volcanoCraters().map((c) => ({ ...c, y: heightAt(c.x, c.z) + 0.05 })),
    [],
  );
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ff6a2b", toneMapped: false }),
    [],
  );
  useFrame(({ clock }) => {
    if (animate) material.color.setHSL(0.04, 0.95, 0.5 + Math.sin(clock.elapsedTime * 1.3) * 0.06);
  });
  return (
    <>
      {craters.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} rotation-x={-Math.PI / 2} material={material}>
          <circleGeometry args={[Math.max(c.r * 2.4, 0.9), 9]} />
        </mesh>
      ))}
    </>
  );
}

export function Landmarks({ animate = true }: { animate?: boolean }) {
  const temple = getLocation("southern-air-temple");
  return (
    <>
      {temple && <AirTemple x={temple.position[0]} z={temple.position[1]} />}
      <LavaGlow animate={animate} />
    </>
  );
}
