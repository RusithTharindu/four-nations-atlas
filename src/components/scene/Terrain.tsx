"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { WORLD, sampleTerrain, terrainColor, type TerrainSample } from "@/lib/world/terrain";

interface TerrainProps {
  /** Grid cells along x; z is scaled to keep cells square. */
  segments?: number;
  shadows?: boolean;
}

/**
 * Low-poly, faceted terrain. Each triangle gets one flat colour from its centroid,
 * and triangles that are fully under water are dropped.
 */
export function Terrain({ segments = 220, shadows = true }: TerrainProps) {
  const geometry = useMemo(() => buildTerrain(segments), [segments]);
  return (
    <mesh geometry={geometry} castShadow={shadows} receiveShadow={shadows}>
      <meshStandardMaterial vertexColors flatShading roughness={0.92} metalness={0} />
    </mesh>
  );
}

function buildTerrain(segX: number): THREE.BufferGeometry {
  const { halfX, halfZ } = WORLD;
  const segZ = Math.round(segX * (halfZ / halfX));
  const cols = segX + 1;
  const rows = segZ + 1;

  // Shared grid of heights (with a little jitter so the facets don't look gridded).
  const px = new Float32Array(cols * rows);
  const pz = new Float32Array(cols * rows);
  const py = new Float32Array(cols * rows);
  const samples: TerrainSample[] = new Array(cols * rows);
  const cell = (2 * halfX) / segX;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const edge = i === 0 || j === 0 || i === segX || j === segZ;
      const jx = edge ? 0 : (hash2(i, j) - 0.5) * cell * 0.5;
      const jz = edge ? 0 : (hash2(j + 999, i) - 0.5) * cell * 0.5;
      const x = -halfX + (i / segX) * 2 * halfX + jx;
      const z = -halfZ + (j / segZ) * 2 * halfZ + jz;
      px[k] = x;
      pz[k] = z;
      samples[k] = sampleTerrain(x, z);
      py[k] = samples[k].height;
    }
  }

  const positions: number[] = [];
  const colors: number[] = [];
  const pushTri = (a: number, b: number, c: number) => {
    const maxY = Math.max(py[a], py[b], py[c]);
    if (maxY < -0.6) return; // fully submerged: never visible through the ocean
    const cx = (px[a] + px[b] + px[c]) / 3;
    const cz = (pz[a] + pz[b] + pz[c]) / 3;
    const cy = (py[a] + py[b] + py[c]) / 3;
    // Colour from the vertex sample most inland, so coast triangles pick up land colours.
    const sa = samples[a], sb = samples[b], sc = samples[c];
    const sample = sa.coast >= sb.coast && sa.coast >= sc.coast ? sa : sb.coast >= sc.coast ? sb : sc;
    const col = terrainColor(cx, cz, cy, sample);
    for (const v of [a, b, c]) {
      positions.push(px[v], py[v], pz[v]);
      colors.push(col[0], col[1], col[2]);
    }
  };

  for (let j = 0; j < segZ; j++) {
    for (let i = 0; i < segX; i++) {
      const a = j * cols + i;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      // Alternate the diagonal for a less regular look.
      if ((i + j) % 2 === 0) {
        pushTri(a, c, b);
        pushTri(b, c, d);
      } else {
        pushTri(a, c, d);
        pushTri(a, d, b);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

function hash2(x: number, y: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
