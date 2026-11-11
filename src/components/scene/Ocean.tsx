"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WORLD, buildCoastMask } from "@/lib/world/terrain";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vWorld;
  varying float vWave;
  #include <fog_pars_vertex>

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    float w = sin(world.x * 0.14 + uTime * 0.9) * 0.5
            + sin(world.z * 0.19 - uTime * 1.2) * 0.35
            + sin((world.x + world.z) * 0.07 + uTime * 0.6) * 0.6;
    world.y += w * uAmp;
    vWave = w;
    vWorld = world.xyz;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uMask;
  uniform float uMaskExtent;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uFoam;
  varying vec3 vWorld;
  varying float vWave;
  #include <fog_pars_fragment>

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    vec2 uv = vWorld.xz / uMaskExtent + 0.5;
    // Signed distance to coast in world units (+ = land); open sea outside the mask.
    float coast = (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0)
      ? -12.0
      : texture2D(uMask, uv).r * 16.0 - 12.0;

    float shallow = smoothstep(-7.0, -0.5, coast);
    vec3 col = mix(uDeep, uShallow, shallow);

    // Gentle crest highlights out at sea.
    col += smoothstep(0.7, 1.3, vWave) * 0.06;

    // Foam: a solid edge at the shoreline plus pulsing ink-like rings moving outward.
    float n = noise(vWorld.xz * 0.35 + uTime * 0.15);
    float d = -coast + n * 0.9;
    float edge = 1.0 - smoothstep(0.2, 0.9, d);
    float rings = step(0.72, sin(d * 3.2 + uTime * 1.6)) * (1.0 - smoothstep(0.8, 4.0, d));
    float foam = clamp(edge + rings * 0.85, 0.0, 1.0);
    col = mix(col, uFoam, foam * 0.9);

    // Subtle paper-like speckle.
    col *= 0.97 + 0.03 * noise(vWorld.xz * 2.5);

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

interface OceanProps {
  segments?: number;
  maskSize?: number;
  animate?: boolean;
}

export function Ocean({ segments = 160, maskSize = 256, animate = true }: OceanProps) {
  const mask = useMemo(() => {
    const tex = new THREE.DataTexture(buildCoastMask(maskSize), maskSize, maskSize, THREE.RGBAFormat);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }, [maskSize]);

  const uniforms = useMemo(
    () => ({
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      uTime: { value: 0 },
      uAmp: { value: 0.22 },
      uMask: { value: mask },
      uMaskExtent: { value: WORLD.maskExtent },
      uDeep: { value: new THREE.Color("#3f88a8") },
      uShallow: { value: new THREE.Color("#8fd0d6") },
      uFoam: { value: new THREE.Color("#fbf7ec") },
    }),
    [mask],
  );
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => () => mask.dispose(), [mask]);

  useFrame((_, delta) => {
    const m = materialRef.current;
    if (m && animate) m.uniforms.uTime.value += delta;
  });

  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[WORLD.oceanSize, WORLD.oceanSize, segments, segments]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        fog
      />
    </mesh>
  );
}
