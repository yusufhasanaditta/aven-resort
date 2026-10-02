"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { lake, terrainHeight } from "@/lib/terrain";
import { layout } from "@/data/site-layout";

/**
 * The resort's architecture as a clean study model on the surveyed land —
 * white and timber volumes, glass bands with a warm evening glow. Built on
 * terraces cut into the slope, as hillside buildings in Sreemangal are: each
 * piece stands on a podium that reaches down to the ground on its low side.
 * Massing is indicative, not final elevations.
 */

const WHITE = "#f5f1e8";
const STONE = "#d8cdb8";
/** Retaining walls of the terraces. */
const WALL = "#8f846f";
const TIMBER = "#9a6b42";
const DARK_TIMBER = "#6a482b";
const WATER = "#38a9c7";
const GOLD = "#e8b94a";

const glass = new THREE.MeshStandardMaterial({
  color: "#57808f",
  roughness: 0.12,
  metalness: 0.55,
  emissive: new THREE.Color("#ffcf7a"),
  emissiveIntensity: 0.22,
});

/** Floor level for a footprint on a slope: cut a little into the hill, so the uphill side sits in the ground and the downhill side stands on its terrace wall. */
function groundFor(x: number, z: number, radius: number) {
  const centre = terrainHeight(x, z);
  let high = centre;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    high = Math.max(high, terrainHeight(x + Math.cos(a) * radius, z + Math.sin(a) * radius));
  }
  return centre + (high - centre) * 0.15;
}

function Site({
  x,
  z,
  rot = 0,
  footprint = 0.6,
  podium,
  children,
}: {
  x: number;
  z: number;
  rot?: number;
  footprint?: number;
  /** Podium size [w, d] — a terrace reaching down into the slope. */
  podium?: [number, number];
  children: React.ReactNode;
}) {
  const y = useMemo(() => groundFor(x, z, footprint), [x, z, footprint]);
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      {podium && <Box size={[podium[0], 2.2, podium[1]]} at={[0, -2.2, 0]} color={WALL} />}
      {children}
    </group>
  );
}

/** A box sitting on `at` (its base, not its centre). */
function Box({
  size,
  at = [0, 0, 0],
  color = WHITE,
  rot = 0,
  material,
  roughness = 0.8,
}: {
  size: [number, number, number];
  at?: [number, number, number];
  color?: string;
  rot?: number;
  material?: THREE.Material;
  roughness?: number;
}) {
  return (
    <mesh position={[at[0], at[1] + size[1] / 2, at[2]]} rotation={[0, rot, 0]} castShadow receiveShadow material={material}>
      <boxGeometry args={size} />
      {!material && <meshStandardMaterial color={color} roughness={roughness} />}
    </mesh>
  );
}

function Water({ size, at = [0, 0, 0] }: { size: [number, number]; at?: [number, number, number] }) {
  return (
    <mesh position={at} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={WATER} roughness={0.06} metalness={0.4} emissive="#0d5e73" emissiveIntensity={0.25} />
    </mesh>
  );
}

/** A pyramid roof (4-sided cone turned square to the walls). */
function Roof({ w, h, at = [0, 0, 0], color = DARK_TIMBER }: { w: number; h: number; at?: [number, number, number]; color?: string }) {
  return (
    <mesh position={[at[0], at[1] + h / 2, at[2]]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[w * 0.72, h, 4]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

/** One storey of glazing between two white slabs. */
function Storey({ w, d, y, inset = 0.06 }: { w: number; d: number; y: number; inset?: number }) {
  return (
    <>
      <Box size={[w - inset * 2, 0.3, d - inset * 2]} at={[0, y, 0]} material={glass} />
      <Box size={[w, 0.07, d]} at={[0, y + 0.3, 0]} color={WHITE} />
    </>
  );
}

/**
 * Main hotel on Hill 2 — three wings in a gentle arc, terraced so each floor
 * steps back up the slope, with roof gardens on every setback and a glass
 * atrium where the wings meet.
 */
function Hotel() {
  const { x, z, rot } = layout.hotel;
  const wings: { dx: number; dz: number; r: number; len: number }[] = [
    { dx: -2.3, dz: 0.55, r: 0.42, len: 2.6 },
    { dx: 0, dz: 0, r: 0, len: 2.4 },
    { dx: 2.3, dz: 0.55, r: -0.42, len: 2.6 },
  ];
  return (
    <Site x={x} z={z} rot={rot} footprint={1.3} podium={[7.4, 3.0]}>
      {wings.map((wg, i) => (
        <group key={i} position={[wg.dx, 0, wg.dz]} rotation={[0, wg.r, 0]}>
          {[0, 1, 2, 3].map((lvl) => (
            <group key={lvl} position={[0, 0, -lvl * 0.28]}>
              <Storey w={wg.len} d={1.5 - lvl * 0.28} y={lvl * 0.37} />
              {/* Roof garden on each setback */}
              <Box size={[wg.len - 0.1, 0.03, 0.22]} at={[0, lvl * 0.37 + 0.37, (1.5 - lvl * 0.28) / 2 - 0.13]} color="#6f9a4c" />
            </group>
          ))}
        </group>
      ))}
      {/* Atrium */}
      <Box size={[0.9, 1.9, 0.9]} at={[0, 0, -0.35]} material={glass} />
      <Box size={[1.1, 0.06, 1.1]} at={[0, 1.9, -0.35]} color={WHITE} />
      {/* Arrival canopy on the uphill side */}
      <Box size={[1.6, 0.05, 0.7]} at={[0, 0.42, -1.4]} color={GOLD} roughness={0.4} />
    </Site>
  );
}

/** The infinity pool on the terrace below the hotel, looking over the lake. */
function CommonPool() {
  const { x, z, rot } = layout.pool;
  return (
    <Site x={x} z={z} rot={rot} footprint={1.2} podium={[2.8, 1.6]}>
      <Box size={[2.8, 0.08, 1.6]} color={STONE} />
      <Water size={[2.1, 0.9]} at={[0, 0.1, 0.15]} />
      {[-1, -0.55, -0.1, 0.35, 0.8].map((dx) => (
        <Box key={dx} size={[0.14, 0.04, 0.32]} at={[dx, 0.08, -0.55]} color={WHITE} />
      ))}
      {[-0.8, 0.6].map((dx) => (
        <group key={dx} position={[dx, 0.08, -0.6]}>
          <Box size={[0.02, 0.32, 0.02]} color={DARK_TIMBER} />
          <mesh position={[0, 0.34, 0]}>
            <coneGeometry args={[0.24, 0.1, 10]} />
            <meshStandardMaterial color="#efe3c8" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </Site>
  );
}

/** Spa & wellness — round treatment pods with thatched roofs around a plunge pool. */
function Spa() {
  const { x, z, rot } = layout.spa;
  const pods = [0, 1, 2, 3, 4].map((i) => {
    const a = (i / 5) * Math.PI * 2;
    return [Math.cos(a) * 0.9, Math.sin(a) * 0.9] as [number, number];
  });
  return (
    <Site x={x} z={z} rot={rot} footprint={1.1} podium={[2.6, 2.6]}>
      <Box size={[2.6, 0.05, 2.6]} color={STONE} />
      <Water size={[0.7, 0.7]} at={[0, 0.07, 0]} />
      {pods.map(([px, pz], i) => (
        <group key={i} position={[px, 0.05, pz]}>
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.32, 14]} />
            <meshStandardMaterial color={i % 2 ? WHITE : "#e9dcc4"} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <coneGeometry args={[0.36, 0.26, 14]} />
            <meshStandardMaterial color="#8a6a3d" roughness={0.95} />
          </mesh>
        </group>
      ))}
    </Site>
  );
}

/** Conference hall — a glass pavilion under a deep timber roof on the east spur. */
function Conference() {
  const { x, z, rot } = layout.conference;
  return (
    <Site x={x} z={z} rot={rot} footprint={1.1} podium={[2.6, 1.7]}>
      <Box size={[2.6, 0.06, 1.7]} color={STONE} />
      <Box size={[2.1, 0.5, 1.2]} at={[0, 0.06, 0]} material={glass} />
      <Box size={[2.5, 0.08, 1.6]} at={[0, 0.56, 0]} color={DARK_TIMBER} />
      <Box size={[0.8, 0.04, 0.5]} at={[0, 0.36, 0.85]} color={WHITE} />
    </Site>
  );
}

/** Hillside villa — a glass living box under a floating white roof, with its own pool. */
function Villa({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  return (
    <Site x={x} z={z} rot={rot} footprint={0.55} podium={[1.3, 1.1]}>
      <Box size={[1.3, 0.05, 1.1]} color={STONE} />
      <Box size={[0.95, 0.3, 0.55]} at={[0, 0.05, -0.18]} material={glass} />
      <Box size={[0.32, 0.3, 0.55]} at={[-0.48, 0.05, -0.18]} color={TIMBER} />
      <Box size={[1.18, 0.05, 0.78]} at={[0, 0.35, -0.12]} color={WHITE} />
      <Water size={[0.7, 0.26]} at={[0.1, 0.07, 0.33]} />
    </Site>
  );
}

/** Tea house — a timber pavilion with a pyramid roof on the ridge above the lake. */
function TeaHouse() {
  const { x, z, rot } = layout.teaHouse;
  return (
    <Site x={x} z={z} rot={rot} footprint={0.6} podium={[1.3, 1.3]}>
      <Box size={[1.3, 0.06, 1.3]} color={TIMBER} />
      {[-0.42, 0.42].flatMap((dx) => [-0.42, 0.42].map((dz) => <Box key={`${dx}${dz}`} size={[0.06, 0.36, 0.06]} at={[dx, 0.06, dz]} color={DARK_TIMBER} />))}
      <Box size={[0.6, 0.26, 0.6]} at={[0, 0.06, 0]} material={glass} />
      <Roof w={1.25} h={0.42} at={[0, 0.42, 0]} />
    </Site>
  );
}

/** Tree houses — raised timber cabins on stilts in the grove of the eastern valley. */
function TreeHouses() {
  return (
    <>
      {layout.treeHouses.map((t, i) => (
        <Site key={i} x={t.x} z={t.z} rot={t.rot} footprint={0.3}>
          {[-0.22, 0.22].flatMap((dx) => [-0.2, 0.2].map((dz) => <Box key={`${dx}${dz}`} size={[0.05, 0.7, 0.05]} at={[dx, 0, dz]} color={DARK_TIMBER} />))}
          <Box size={[0.75, 0.04, 0.65]} at={[0, 0.7, 0]} color={TIMBER} />
          <Box size={[0.48, 0.26, 0.42]} at={[0, 0.74, 0]} color="#b38657" />
          <Roof w={0.62} h={0.28} at={[0, 1.0, 0]} />
        </Site>
      ))}
    </>
  );
}

/** Signature valley restaurant — a glazed pavilion on a deck reaching over the lake. */
function Restaurant() {
  const { x, z, rot } = layout.restaurant;
  const y = lake.level + 0.32;
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      {[-0.7, 0, 0.7].flatMap((dx) => [-0.4, 0.4].map((dz) => <Box key={`${dx}${dz}`} size={[0.05, 0.9, 0.05]} at={[dx, -0.9, dz]} color={DARK_TIMBER} />))}
      <Box size={[2.0, 0.06, 1.1]} color={TIMBER} />
      <Box size={[1.2, 0.34, 0.7]} at={[-0.25, 0.06, -0.05]} material={glass} />
      <Box size={[1.5, 0.06, 0.95]} at={[-0.25, 0.4, -0.05]} color={DARK_TIMBER} />
      {[0.55, 0.8].map((dx) => (
        <Box key={dx} size={[0.12, 0.08, 0.12]} at={[dx, 0.06, 0.25]} color={WHITE} />
      ))}
    </group>
  );
}

/** Lakeside barbecue decks with umbrellas, a jetty and kayaks on the water. */
function LakeLife() {
  const { x, z, rot } = layout.barbecue;
  const kayaks: [number, number, number, string][] = [
    [-1.6, -3.2, 0.4, "#e8673a"],
    [0.4, -3.9, 1.1, "#f2c230"],
    [1.6, -2.6, 2.2, "#2f8fd0"],
  ];
  return (
    <>
      <Site x={x} z={z} rot={rot} footprint={0.5}>
        <Box size={[1.3, 0.05, 0.8]} color={TIMBER} />
        {[-0.35, 0.35].map((dx) => (
          <group key={dx} position={[dx, 0.05, 0]}>
            <Box size={[0.02, 0.3, 0.02]} color={DARK_TIMBER} />
            <mesh position={[0, 0.32, 0]}>
              <coneGeometry args={[0.22, 0.09, 10]} />
              <meshStandardMaterial color="#d9532f" roughness={0.9} />
            </mesh>
          </group>
        ))}
        {/* Jetty out over the water */}
        <Box size={[0.22, 0.04, 1.4]} at={[0, -0.12, -1.0]} color={TIMBER} />
      </Site>
      {kayaks.map(([kx, kz, r, color], i) => (
        <mesh key={i} position={[kx, lake.level + 0.04, kz]} rotation={[Math.PI / 2, 0, r]} scale={[1, 1, 0.45]}>
          <capsuleGeometry args={[0.07, 0.42, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </>
  );
}

/**
 * The hanging bridge — a suspension walkway across the lake valley from Hill 2
 * to Hill 3, with its handrail cables lit gold: the line of light in the renders.
 */
function HangingBridge() {
  const { start, end, points } = useMemo(() => {
    const [ax, az] = layout.bridge.from;
    const [bx, bz] = layout.bridge.to;
    const s = new THREE.Vector3(ax, terrainHeight(ax, az) + 0.25, az);
    const e = new THREE.Vector3(bx, terrainHeight(bx, bz) + 0.25, bz);
    const n = 40;
    const pts = Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n;
      const p = s.clone().lerp(e, t);
      p.y -= Math.sin(t * Math.PI) * 0.9;
      return p;
    });
    return { start: s, end: e, points: pts };
  }, []);

  const { deck, rails, hangers } = useMemo(() => {
    const dir = end.clone().sub(start).setY(0).normalize();
    const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.2);
    // Deck: a flat ribbon following the sag.
    const verts: number[] = [];
    const idx: number[] = [];
    points.forEach((p, i) => {
      const l = p.clone().add(side);
      const r = p.clone().sub(side);
      verts.push(l.x, l.y, l.z, r.x, r.y, r.z);
      if (i < points.length - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    });
    const deckGeo = new THREE.BufferGeometry();
    deckGeo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    deckGeo.setIndex(idx);
    deckGeo.computeVertexNormals();

    const rail = (sign: number) =>
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => p.clone().addScaledVector(side, sign).setY(p.y + 0.36))), 80, 0.022, 5, false);
    // Main cables hang from the tower tops in a deeper curve.
    const cable = (sign: number) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          points.map((p, i) => {
            const t = i / (points.length - 1);
            const top = start.clone().lerp(end, t);
            return p.clone().addScaledVector(side, sign * 1.1).setY(top.y + 1.25 - Math.sin(t * Math.PI) * 1.55);
          }),
        ),
        80,
        0.018,
        5,
        false,
      );
    const hangerPts = points.filter((_, i) => i % 4 === 2);
    return { deck: deckGeo, rails: [rail(1), rail(-1), cable(1), cable(-1)], hangers: { pts: hangerPts, side } };
  }, [points, start, end]);

  return (
    <group>
      <mesh geometry={deck} castShadow receiveShadow>
        <meshStandardMaterial color={TIMBER} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {rails.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={i < 2 ? 2.2 : 0.6} roughness={0.35} />
        </mesh>
      ))}
      {hangers.pts.map((p, i) => (
        <mesh key={i} position={[p.x, p.y + 0.2, p.z]}>
          <boxGeometry args={[0.02, 0.4, 0.02]} />
          <meshStandardMaterial color={DARK_TIMBER} />
        </mesh>
      ))}
      {/* Towers at each end */}
      {[start, end].map((p, i) =>
        [1, -1].map((s) => (
          <mesh key={`${i}${s}`} position={[p.x + hangers.side.x * 1.1 * s, p.y + 0.6, p.z + hangers.side.z * 1.1 * s]} castShadow>
            <boxGeometry args={[0.12, 1.3, 0.12]} />
            <meshStandardMaterial color={DARK_TIMBER} roughness={0.7} />
          </mesh>
        )),
      )}
    </group>
  );
}

/** Entrance gate off the road: stone pillars, a gold-lettered beam, guard house and canopy. */
function Gatehouse() {
  const { x, z, rot } = layout.gatehouse;
  return (
    <Site x={x} z={z} rot={rot} footprint={0.3} podium={[2.4, 1.2]}>
      {[-0.85, 0.85].map((dx) => (
        <Box key={dx} size={[0.18, 0.62, 0.18]} at={[dx, 0, 0.3]} color={STONE} />
      ))}
      <Box size={[1.9, 0.12, 0.16]} at={[0, 0.62, 0.3]} color={DARK_TIMBER} />
      <Box size={[1.2, 0.06, 0.02]} at={[0, 0.65, 0.39]} color={GOLD} roughness={0.3} />
      <Box size={[0.6, 0.3, 0.45]} at={[1.35, 0, -0.2]} color={WHITE} />
      <Box size={[0.75, 0.04, 0.6]} at={[1.35, 0.3, -0.2]} color={DARK_TIMBER} />
    </Site>
  );
}

/** Shaded parking with a solar canopy and EV bays. */
function Parking() {
  const { x, z, rot } = layout.parking;
  const cars = ["#f4f4f2", "#2d3b45", "#9aa3a8", "#7a1f1f", "#f4f4f2", "#2f5d7c", "#c8c2b5", "#2d3b45"];
  return (
    <Site x={x} z={z} rot={rot} footprint={0.5} podium={[3.6, 2.2]}>
      <Box size={[3.6, 0.04, 2.2]} color="#5b5f60" />
      {cars.map((c, i) => (
        <Box key={i} size={[0.2, 0.13, 0.4]} at={[-1.4 + (i % 4) * 0.42, 0.04, i < 4 ? -0.6 : 0.6]} color={c} roughness={0.3} />
      ))}
      <Box size={[1.9, 0.04, 0.8]} at={[-0.77, 0.42, -0.6]} color="#1f3b5c" roughness={0.2} />
      <Box size={[0.05, 0.42, 0.05]} at={[-0.77, 0.04, -0.6]} color={WHITE} />
      {/* Buggy station */}
      <Box size={[0.8, 0.25, 0.5]} at={[1.2, 0.04, 0]} color={WHITE} />
      <Box size={[1.0, 0.04, 0.7]} at={[1.2, 0.29, 0]} color={DARK_TIMBER} />
    </Site>
  );
}

/** Kids zone — soft play surface, a play tower with a slide, and swings. */
function KidsZone() {
  const { x, z, rot } = layout.kids;
  return (
    <Site x={x} z={z} rot={rot} footprint={0.5} podium={[2.2, 1.6]}>
      <Box size={[2.2, 0.04, 1.6]} color="#e2b24a" />
      <Box size={[0.5, 0.55, 0.5]} at={[-0.5, 0.04, 0]} color="#e2553b" />
      <Roof w={0.62} h={0.3} at={[-0.5, 0.59, 0]} color="#2f8fd0" />
      <Box size={[0.18, 0.04, 0.7]} at={[-0.5, 0.25, 0.5]} rot={0} color="#f2c230" />
      {[0.35, 0.95].map((dx) => (
        <Box key={dx} size={[0.04, 0.5, 0.04]} at={[dx, 0.04, -0.3]} color={WHITE} />
      ))}
      <Box size={[0.66, 0.04, 0.04]} at={[0.65, 0.52, -0.3]} color={WHITE} />
      <Box size={[0.6, 0.04, 0.6]} at={[0.6, 0.04, 0.35]} color="#59b36b" />
    </Site>
  );
}

/** Event lawn and amphitheatre on the east spur. */
function EventLawn() {
  const { x, z } = layout.eventLawn;
  const rings = [1.55, 1.9, 2.25];
  return (
    <Site x={x} z={z} footprint={1.8} podium={[4.6, 4.6]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[2.3, 48]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <circleGeometry args={[1.3, 48]} />
        <meshStandardMaterial color="#79a84d" roughness={0.95} />
      </mesh>
      {rings.map((r, i) => (
        <mesh key={r} position={[0, 0.03 + i * 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[r - 0.28, r, 48, 1, Math.PI * 0.15, Math.PI * 0.95]} />
          <meshStandardMaterial color={WHITE} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <Box size={[1.1, 0.12, 0.6]} at={[0, 0, 1.3]} color={TIMBER} />
      <Box size={[1.3, 0.04, 0.8]} at={[0, 0.7, 1.3]} color={WHITE} />
      {[-0.6, 0.6].map((dx) => (
        <Box key={dx} size={[0.04, 0.58, 0.04]} at={[dx, 0.12, 1.6]} color={DARK_TIMBER} />
      ))}
    </Site>
  );
}

/** Organic farm on the south-east slope: crop strips and a greenhouse. */
function Farm() {
  const { x, z, rot } = layout.farm;
  const strips = ["#7a5a3a", "#6f9a44", "#8aa94c", "#7a5a3a", "#5f8c3a", "#9bb158"];
  return (
    <group>
      {strips.map((c, i) => (
        <DrapedRect key={i} x={x + Math.cos(rot) * (i - 2.5) * 0.48} z={z - Math.sin(rot) * (i - 2.5) * 0.48} w={0.42} d={3.0} rot={rot} color={c} />
      ))}
      <Site x={x + Math.cos(rot) * 2.1} z={z - Math.sin(rot) * 2.1} rot={rot} footprint={0.5}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 1.2, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#e9f2ee" roughness={0.2} transparent opacity={0.75} side={THREE.DoubleSide} />
        </mesh>
      </Site>
    </group>
  );
}

/** A rectangle laid over the ground, following its contours. */
function DrapedRect({ x, z, w, d, rot, color }: { x: number; z: number; w: number; d: number; rot: number; color: string }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, d, 4, 16);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i);
      const lz = pos.getZ(i);
      const wx = x + lx * c + lz * s;
      const wz = z - lx * s + lz * c;
      pos.setXYZ(i, wx, terrainHeight(wx, wz) + 0.04, wz);
    }
    g.computeVertexNormals();
    return g;
  }, [x, z, w, d, rot]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

export function Structures() {
  return (
    <group>
      <Hotel />
      <CommonPool />
      <Spa />
      <Conference />
      {layout.villas.map((v, i) => (
        <Villa key={i} {...v} />
      ))}
      <TeaHouse />
      <TreeHouses />
      <Restaurant />
      <LakeLife />
      <HangingBridge />
      <Gatehouse />
      <Parking />
      <KidsZone />
      <EventLawn />
      <Farm />
    </group>
  );
}
