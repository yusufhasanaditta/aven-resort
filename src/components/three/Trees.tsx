"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  ELEV_MIN,
  ROAD,
  ROAD_HALF_WIDTH,
  TERRAIN_SIZE,
  VERTICAL,
  distanceToBoundary,
  insidePlot,
  lakeRadius,
  nearestOnPolyline,
  terrainHeight,
} from "@/lib/terrain";
import { builtAreas, layout, paths } from "@/data/site-layout";

function rand(i: number, salt: number) {
  const n = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Trees, the way a Sreemangal tea estate has them: tall shade trees spaced
 * through the tea, denser woods in the valleys and on the neighbouring land,
 * a planted edge along the boundary and a grove around the tree houses.
 * One instanced mesh each for canopies and trunks.
 */
export function Trees() {
  const trees = useMemo(() => {
    const out: { x: number; z: number; y: number; s: number; tint: number }[] = [];
    const half = TERRAIN_SIZE / 2 - 0.6;
    const step = 0.85;
    let i = 0;
    const grove = layout.treeHouses[0];
    for (let gx = -half; gx <= half; gx += step) {
      for (let gz = -half; gz <= half; gz += step) {
        i++;
        const x = gx + (rand(i, 1) - 0.5) * step * 0.9;
        const z = gz + (rand(i, 2) - 0.5) * step * 0.9;
        if (lakeRadius(x, z) < 1.35) continue;
        if (nearestOnPolyline(ROAD, x, z).distance < ROAD_HALF_WIDTH + 0.7) continue;
        if (builtAreas.some(([bx, bz, r]) => Math.hypot(x - bx, z - bz) < r)) continue;
        if (paths.some((p) => nearestOnPolyline(p.points, x, z).distance < 0.42)) continue;
        if (nearestOnPolyline([layout.bridge.from, layout.bridge.to], x, z).distance < 0.9) continue;

        const y = terrainHeight(x, z);
        const elev = ELEV_MIN + y / VERTICAL;
        const inside = insidePlot(x, z);
        const edge = distanceToBoundary(x, z);
        const inGrove = Math.hypot(x - grove.x - 0.8, z - grove.z) < 4.2;

        let p: number;
        if (inGrove) p = 0.5;
        else if (inside && edge < 0.7) p = 0.42; // planted boundary
        else if (inside) p = elev < 44.5 ? 0.1 : 0.035; // shade trees in the tea, a little denser in the valleys
        else p = elev < 43 ? 0.3 : 0.13; // neighbouring land
        if (rand(i, 3) > p) continue;

        out.push({ x, z, y, s: 0.5 + rand(i, 4) * 0.45 + (inGrove ? 0.15 : 0), tint: rand(i, 5) });
      }
    }
    return out;
  }, []);

  const canopy = useRef<THREE.InstancedMesh>(null);
  const trunk = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const greens = ["#2f5a2a", "#3d6b2e", "#4a7a35", "#2b4f2d", "#557f3a"].map((c) => new THREE.Color(c));
    trees.forEach((t, i) => {
      const h = 0.55 * t.s;
      q.setFromEuler(new THREE.Euler(0, t.tint * Math.PI * 2, 0));
      m.compose(new THREE.Vector3(t.x, t.y + h + 0.32 * t.s, t.z), q, new THREE.Vector3(0.5 * t.s, 0.62 * t.s, 0.5 * t.s));
      canopy.current?.setMatrixAt(i, m);
      canopy.current?.setColorAt(i, greens[Math.floor(t.tint * greens.length)]);
      m.compose(new THREE.Vector3(t.x, t.y + h / 2, t.z), q, new THREE.Vector3(t.s, h, t.s));
      trunk.current?.setMatrixAt(i, m);
    });
    if (canopy.current) {
      canopy.current.instanceMatrix.needsUpdate = true;
      if (canopy.current.instanceColor) canopy.current.instanceColor.needsUpdate = true;
    }
    if (trunk.current) trunk.current.instanceMatrix.needsUpdate = true;
  }, [trees]);

  return (
    <group>
      <instancedMesh ref={canopy} args={[undefined, undefined, trees.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={trunk} args={[undefined, undefined, trees.length]} castShadow>
        <cylinderGeometry args={[0.035, 0.05, 1, 5]} />
        <meshStandardMaterial color="#5a4330" roughness={0.95} />
      </instancedMesh>
    </group>
  );
}
