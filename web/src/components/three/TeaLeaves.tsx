"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Drifting tea leaves — the "floating leaves" element called for in the UI
 * mockups, done as a single instanced mesh so several hundred leaves cost one
 * draw call.
 *
 * Each leaf carries its own drift speed, spin axis and flutter phase, written
 * into the instance matrix on every frame.
 */

function makeLeafGeometry() {
  // A leaf silhouette: two symmetric quadratic curves meeting at tip and stem.
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.5);
  shape.quadraticCurveTo(0.42, -0.1, 0, 0.5);
  shape.quadraticCurveTo(-0.42, -0.1, 0, -0.5);
  const geo = new THREE.ShapeGeometry(shape, 12);
  geo.scale(0.9, 1, 1);
  return geo;
}

type LeafSeed = {
  origin: THREE.Vector3;
  scale: number;
  speed: number;
  spin: number;
  phase: number;
  sway: number;
  axis: THREE.Vector3;
};

export function TeaLeaves({
  count = 90,
  bounds = [14, 9, 8] as [number, number, number],
  color = "#7FA650",
  opacity = 0.9,
}: {
  count?: number;
  bounds?: [number, number, number];
  color?: string;
  opacity?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(makeLeafGeometry, []);

  const seeds = useMemo<LeafSeed[]>(() => {
    const out: LeafSeed[] = [];
    for (let i = 0; i < count; i++) {
      out.push({
        origin: new THREE.Vector3(
          (Math.random() - 0.5) * bounds[0] * 2,
          Math.random() * bounds[1],
          (Math.random() - 0.5) * bounds[2] * 2,
        ),
        scale: 0.1 + Math.random() * 0.22,
        speed: 0.18 + Math.random() * 0.4,
        spin: (Math.random() - 0.5) * 1.6,
        phase: Math.random() * Math.PI * 2,
        sway: 0.5 + Math.random() * 1.6,
        axis: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5,
        ).normalize(),
      });
    }
    return out;
  }, [count, bounds]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];

      // Fall, wrapping back to the top of the volume.
      const fallen = (t * s.speed + s.phase) % (bounds[1] + 2);
      const y = s.origin.y + bounds[1] - fallen;

      // Lateral flutter — leaves do not fall straight.
      const x = s.origin.x + Math.sin(t * s.sway * 0.5 + s.phase) * 0.8;
      const z = s.origin.z + Math.cos(t * s.sway * 0.35 + s.phase) * 0.5;

      dummy.position.set(x, y, z);
      quaternion.setFromAxisAngle(s.axis, t * s.spin + s.phase);
      dummy.quaternion.copy(quaternion);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, count]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        color={color}
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
        roughness={0.7}
        emissive={color}
        emissiveIntensity={0.12}
      />
    </instancedMesh>
  );
}
