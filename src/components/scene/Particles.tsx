"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ambient, mulberry32 } from "@/lib/world/ambient";
import { volcanoCraters, heightAt } from "@/lib/world/terrain";
import { getLocation } from "@/lib/data";

/** 0 snow (falls), 1 leaves (drift and tumble), 2 embers (rise and fade), 3 wind streaks (sweep sideways). */
type Mode = 0 | 1 | 2 | 3;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform int uMode;
  uniform vec3 uBoxMin;
  uniform vec3 uBoxSize;
  attribute vec3 aSeed;
  varying float vAlpha;
  varying float vSpin;

  void main() {
    vec3 p = uBoxMin + aSeed * uBoxSize;
    float t = uTime * uSpeed * (0.6 + aSeed.x * 0.8);
    vAlpha = 1.0;
    vSpin = 0.0;
    if (uMode == 0) {            // snow: fall and sway
      float f = fract(aSeed.y - t * 0.08);
      p.y = uBoxMin.y + f * uBoxSize.y;
      p.x += sin(uTime * 0.7 + aSeed.z * 20.0) * 0.8;
      vAlpha = smoothstep(0.0, 0.1, f);
    } else if (uMode == 1) {     // leaves: drift east, bob, tumble
      float f = fract(aSeed.x + t * 0.03);
      p.x = uBoxMin.x + f * uBoxSize.x;
      p.y += sin(uTime * 1.3 + aSeed.y * 30.0) * 0.6;
      p.z += cos(uTime * 0.9 + aSeed.x * 25.0) * 0.8;
      vAlpha = smoothstep(0.0, 0.08, f) * (1.0 - smoothstep(0.92, 1.0, f));
      vSpin = uTime * (1.0 + aSeed.z * 3.0);
    } else if (uMode == 2) {     // embers: rise from the crater and fade
      float f = fract(aSeed.y + t * 0.12);
      p.y = uBoxMin.y + f * uBoxSize.y;
      p.x += sin(uTime * 2.0 + aSeed.z * 40.0) * 0.35 * f;
      vAlpha = 1.0 - f;
    } else {                     // wind: streak sideways around the peaks
      float f = fract(aSeed.x + t * 0.1);
      float a = f * 6.2831 + aSeed.z * 6.2831;
      vec3 c = uBoxMin + uBoxSize * 0.5;
      float r = uBoxSize.x * 0.5 * (0.55 + aSeed.y * 0.45);
      p = vec3(c.x + cos(a) * r, uBoxMin.y + aSeed.y * uBoxSize.y, c.z + sin(a) * r * 0.8);
      vAlpha = sin(f * 3.1416);
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (120.0 / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uTint;
  uniform float uOpacity;
  uniform int uMode;
  uniform float uGlow;
  varying float vAlpha;
  varying float vSpin;

  void main() {
    vec2 q = gl_PointCoord - 0.5;
    float a;
    if (uMode == 3) {
      // a thin, slightly curved horizontal streak
      float y = q.y + q.x * q.x * 0.8;
      a = (1.0 - smoothstep(0.03, 0.07, abs(y))) * (1.0 - smoothstep(0.3, 0.5, abs(q.x)));
    } else if (uMode == 1) {
      // a little leaf: rotated diamond
      float c = cos(vSpin), s = sin(vSpin);
      vec2 r = vec2(c * q.x - s * q.y, s * q.x + c * q.y);
      a = 1.0 - smoothstep(0.26, 0.32, abs(r.x) * 1.8 + abs(r.y));
    } else {
      a = 1.0 - smoothstep(0.25, 0.5, length(q));
    }
    if (a < 0.02) discard;
    vec3 col = mix(uColor * uTint, uColor, uGlow);
    gl_FragColor = vec4(col, a * vAlpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

interface FieldProps {
  mode: Mode;
  count: number;
  min: [number, number, number];
  size: [number, number, number];
  color: string;
  pointSize: number;
  speed?: number;
  opacity?: number;
  /** 1 = self-lit (embers stay bright at night). */
  glow?: number;
  seed?: number;
}

function ParticleField({
  mode,
  count,
  min,
  size,
  color,
  pointSize,
  speed = 1,
  opacity = 0.9,
  glow = 0,
  seed = 1,
}: FieldProps) {
  const dpr = useThree((s) => s.viewport.dpr);
  const material = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const rand = mulberry32(seed);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < seeds.length; i++) seeds[i] = rand();
    const g = new THREE.BufferGeometry();
    // position is unused by the shader but three.js needs it for the draw count
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));
    return g;
  }, [count, seed]);
  // Field settings are fixed for the component's lifetime, so build the uniforms once.
  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uSpeed: { value: speed },
    uSize: { value: pointSize },
    uPixelRatio: { value: dpr },
    uMode: { value: mode },
    uBoxMin: { value: new THREE.Vector3(...min) },
    uBoxSize: { value: new THREE.Vector3(...size) },
    uColor: { value: new THREE.Color(color) },
    uTint: { value: new THREE.Color(1, 1, 1) },
    uOpacity: { value: opacity },
    uGlow: { value: glow },
  }));

  useFrame((_, delta) => {
    const m = material.current;
    if (!m) return;
    m.uniforms.uTime.value += Math.min(delta, 0.1);
    m.uniforms.uTint.value.copy(ambient.tint);
    m.uniforms.uPixelRatio.value = dpr;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={mode === 2 ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

/** Gentle per-nation particles: polar snow, drifting leaves, volcano embers, wind round the air temple. */
export function NationParticles({ density = 1 }: { density?: number }) {
  const n = (c: number) => Math.max(4, Math.round(c * density));
  const craters = useMemo(() => volcanoCraters(6).map((c) => ({ ...c, y: heightAt(c.x, c.z) })), []);
  const temple = getLocation("southern-air-temple")!.position;

  return (
    <>
      {/* Water Tribes: snow over both poles */}
      <ParticleField
        mode={0}
        count={n(260)}
        min={[-70, 0, -88]}
        size={[150, 22, 26]}
        color="#ffffff"
        pointSize={2.4}
        seed={3}
      />
      <ParticleField
        mode={0}
        count={n(240)}
        min={[-70, 0, 60]}
        size={[150, 22, 26]}
        color="#ffffff"
        pointSize={2.4}
        seed={4}
      />
      {/* Earth Kingdom: leaves blowing across the continent */}
      <ParticleField
        mode={1}
        count={n(120)}
        min={[-15, 3, -40]}
        size={[100, 8, 70]}
        color="#6f9a3a"
        pointSize={3.6}
        speed={0.8}
        seed={5}
      />
      <ParticleField
        mode={1}
        count={n(50)}
        min={[-15, 3, -40]}
        size={[100, 8, 70]}
        color="#d38b2c"
        pointSize={3.4}
        speed={0.7}
        seed={6}
      />
      {/* Fire Nation: embers rising from the larger craters */}
      {craters.map((c, i) => (
        <ParticleField
          key={i}
          mode={2}
          count={n(40)}
          min={[c.x - 1.5, c.y, c.z - 1.5]}
          size={[3, 12, 3]}
          color="#ff7a2e"
          pointSize={2.2}
          speed={1.2}
          glow={1}
          seed={10 + i}
        />
      ))}
      {/* Air Nomads: wind streaks circling the temple peaks */}
      <ParticleField
        mode={3}
        count={n(70)}
        min={[temple[0] - 16, 6, temple[1] - 16]}
        size={[32, 14, 32]}
        color="#ffffff"
        pointSize={9}
        speed={0.6}
        opacity={0.75}
        seed={20}
      />
    </>
  );
}
