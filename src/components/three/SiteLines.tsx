"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { PLOT, ROAD, ROAD_HALF_WIDTH, elevationAt, terrainHeight } from "@/lib/terrain";
import { paths } from "@/data/site-layout";

/** Points along a polyline every `step` units, lifted just above the ground. */
function drape(points: [number, number][], step: number, lift: number) {
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i];
    const [bx, bz] = points[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / step));
    for (let k = 0; k < n; k++) {
      const x = ax + ((bx - ax) * k) / n;
      const z = az + ((bz - az) * k) / n;
      out.push(new THREE.Vector3(x, terrainHeight(x, z) + lift, z));
    }
  }
  const [lx, lz] = points[points.length - 1];
  out.push(new THREE.Vector3(lx, terrainHeight(lx, lz) + lift, lz));
  return out;
}

/** A flat strip laid over the ground along a smoothed path (roads, buggy paths). */
function ribbon(points: [number, number][], halfWidth: number, lift: number, samples: number) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "centripetal");
  const verts: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const nx = -tan.z;
    const nz = tan.x;
    for (const s of [1, -1]) {
      const x = p.x + nx * halfWidth * s;
      const z = p.z + nz * halfWidth * s;
      verts.push(x, terrainHeight(x, z) + lift, z);
      uv.push(s > 0 ? 0 : 1, t * curve.getLength());
    }
    if (i < samples) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return { geometry: g, curve };
}

/** The surveyed plot boundary — the red line on the sheet — with a marker pillar at each corner. */
function Boundary() {
  const line = useMemo(() => drape([...PLOT, PLOT[0]], 0.25, 0.1), []);
  return (
    <group>
      <Line points={line} color="#ff8a6b" lineWidth={9} transparent opacity={0.28} depthWrite={false} />
      <Line points={line} color="#e8352a" lineWidth={3} />
      {PLOT.map(([x, z], i) => (
        <mesh key={i} position={[x, terrainHeight(x, z) + 0.22, z]} castShadow>
          <boxGeometry args={[0.16, 0.44, 0.16]} />
          <meshStandardMaterial color="#fbf7ef" roughness={0.6} emissive="#e8352a" emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

/** The public road along the south, with its centre line and a name tag. */
function Road() {
  const { geometry, curve } = useMemo(() => ribbon(ROAD, ROAD_HALF_WIDTH, 0.05, 260), []);
  const centre = useMemo(() => {
    const pts = curve.getSpacedPoints(160).map((p) => new THREE.Vector3(p.x, terrainHeight(p.x, p.z) + 0.08, p.z));
    return pts;
  }, [curve]);
  const tag = useMemo(() => {
    const p = curve.getPointAt(0.18);
    return new THREE.Vector3(p.x, terrainHeight(p.x, p.z) + 0.6, p.z);
  }, [curve]);
  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial color="#55595b" roughness={0.9} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <Line points={centre} color="#f2e6c4" lineWidth={1.4} dashed dashSize={0.5} gapSize={0.45} />
      <Html position={tag} center distanceFactor={26} zIndexRange={[5, 0]}>
        <span className="pointer-events-none whitespace-nowrap rounded-full bg-forest-950/70 px-2.5 py-1 text-[0.6875rem] font-medium text-cream-50 backdrop-blur">
          Access road
        </span>
      </Html>
    </group>
  );
}

/** Buggy paths in pale stone; the lake nature trail as a dashed earth line. */
function Paths() {
  const ribbons = useMemo(
    () => paths.filter((p) => !p.trail).map((p) => ({ id: p.id, geometry: ribbon(p.points, 0.17, 0.05, Math.max(24, p.points.length * 14)).geometry })),
    [],
  );
  const trails = useMemo(() => paths.filter((p) => p.trail).map((p) => ({ id: p.id, points: drape(p.points, 0.2, 0.08) })), []);
  return (
    <group>
      {ribbons.map((r) => (
        <mesh key={r.id} geometry={r.geometry} receiveShadow>
          <meshStandardMaterial color="#e6dac0" roughness={0.9} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}
      {trails.map((t) => (
        <Line key={t.id} points={t.points} color="#8a5f34" lineWidth={2} dashed dashSize={0.3} gapSize={0.22} />
      ))}
    </group>
  );
}

/** Spot heights for the survey view, read from the same ground the model is built from. */
const SPOTS: [number, number, string?][] = [
  [8.8, 3.4, "Hill 2"],
  [-4.2, -13.6, "Hill 3"],
  [13.4, -4.6, "Hill 4"],
  [-3.4, 9.8, "Hill 1"],
  [15.2, 9.6, "Hill 5"],
  [-6.8, -21.6],
  [0, -2.2, "Lake"],
  [20.4, -20.6],
  [-18, -10],
  [-24, 9.4],
];

function SpotHeights() {
  return (
    <>
      {SPOTS.map(([x, z, name]) => (
        <Html key={`${x},${z}`} position={[x, terrainHeight(x, z) + 0.35, z]} center distanceFactor={24} zIndexRange={[6, 0]}>
          <span className="pointer-events-none flex items-center gap-1 whitespace-nowrap rounded-md bg-white/90 px-1.5 py-0.5 text-[0.625rem] font-semibold text-forest-950 shadow">
            <span className="h-1.5 w-1.5 rounded-full bg-forest-950" />
            {name && <span className="text-forest-950/60">{name}</span>}
            {Math.round(elevationAt(x, z))} m
          </span>
        </Html>
      ))}
    </>
  );
}

/** Reports the view's compass bearing (degrees, 0 = looking north) as the camera turns. */
function CompassSync({ onBearing }: { onBearing: (deg: number) => void }) {
  const last = useRef(Infinity);
  useFrame(({ camera }) => {
    // Bearing from the camera to its target, projected on the ground: north (−z) is up when looking north.
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const angle = Math.atan2(dir.x, -dir.z);
    if (Math.abs(angle - last.current) < 0.002) return;
    last.current = angle;
    onBearing((angle * 180) / Math.PI);
  });
  return null;
}

export function SiteLines({ survey, onBearing }: { survey: boolean; onBearing?: (deg: number) => void }) {
  return (
    <group>
      <Road />
      <Paths />
      <Boundary />
      {survey && <SpotHeights />}
      {onBearing && <CompassSync onBearing={onBearing} />}
    </group>
  );
}
