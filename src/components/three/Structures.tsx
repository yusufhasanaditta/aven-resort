"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { terrainHeight } from "@/lib/terrain";

/**
 * Architectural massing for the masterplan — the resort as a white study model
 * set into the green terrain. Deliberately abstract: these are volumes and
 * footprints, not a claim about final elevations.
 */

const STONE = "#efe9dc";
const TIMBER = "#a97c4f";
const GLASS = "#8fc4cf";
const DECK = "#c9a227";

/** Positions children on the ground at (x, z). */
function OnTerrain({
  x,
  z,
  yOffset = 0,
  rotation = 0,
  children,
}: {
  x: number;
  z: number;
  yOffset?: number;
  rotation?: number;
  children: React.ReactNode;
}) {
  const y = useMemo(() => terrainHeight(x, z) + yOffset, [x, z, yOffset]);
  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]}>
      {children}
    </group>
  );
}

function Block({
  size,
  position = [0, 0, 0],
  color = STONE,
  rotation = 0,
  roughness = 0.75,
  opacity = 1,
}: {
  size: [number, number, number];
  position?: [number, number, number];
  color?: string;
  rotation?: number;
  roughness?: number;
  opacity?: number;
}) {
  return (
    <mesh
      position={[position[0], position[1] + size[1] / 2, position[2]]}
      rotation={[0, rotation, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={color === GLASS ? 0.35 : 0.02}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

/** The three-storey main building on Hill 2, stepping back at each level. */
function MainHotel() {
  return (
    <OnTerrain x={-8} z={-4} rotation={0.28}>
      <Block size={[4.6, 0.5, 2.6]} color={STONE} />
      <Block size={[4.1, 0.55, 2.2]} position={[0, 0.5, 0]} color={STONE} />
      <Block size={[3.4, 0.5, 1.8]} position={[0, 1.05, 0]} color={STONE} />
      {/* Glazed atrium */}
      <Block size={[1.0, 1.75, 0.35]} position={[0, 0, 1.15]} color={GLASS} />
      {/* Wings */}
      <Block size={[1.0, 0.45, 1.6]} position={[-2.4, 0, 0.3]} color={STONE} />
      <Block size={[1.0, 0.45, 1.6]} position={[2.4, 0, 0.3]} color={STONE} />
      {/* Roof terrace */}
      <Block size={[3.0, 0.06, 1.5]} position={[0, 1.55, 0]} color={DECK} />
    </OnTerrain>
  );
}

/** Infinity pool on the apron in front of the hotel. */
function CommonPool() {
  return (
    <OnTerrain x={-5.5} z={-6} rotation={0.28}>
      <Block size={[2.6, 0.12, 1.3]} position={[0, -0.02, 0]} color="#e6dfd0" />
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.2, 0.95]} />
        <meshStandardMaterial
          color="#3fa0bb"
          roughness={0.08}
          metalness={0.55}
        />
      </mesh>
    </OnTerrain>
  );
}

/** Spa courtyard — a cluster of small pavilions. */
function Spa() {
  const pods: [number, number][] = [
    [-0.7, -0.4],
    [0.1, 0.2],
    [0.85, -0.3],
    [-0.2, -0.95],
  ];
  return (
    <OnTerrain x={-10} z={-7}>
      {pods.map(([dx, dz], i) => (
        <Block
          key={i}
          size={[0.62, 0.38 + (i % 2) * 0.12, 0.62]}
          position={[dx, 0, dz]}
          color={i % 2 ? TIMBER : STONE}
          rotation={i * 0.4}
        />
      ))}
    </OnTerrain>
  );
}

/** Villas terraced down the slope of Hill 3, each stepping below the last. */
function HillsideVillas() {
  const villas = useMemo(() => {
    const out: { x: number; z: number; rot: number }[] = [];
    for (let i = 0; i < 11; i++) {
      const t = i / 10;
      const angle = -0.55 + t * 2.0;
      const radius = 4.4 + (i % 2) * 0.7;
      out.push({
        x: 9 + Math.cos(angle) * radius,
        z: 0 + Math.sin(angle) * radius,
        rot: -angle + Math.PI / 2,
      });
    }
    return out;
  }, []);

  return (
    <>
      {villas.map((v, i) => (
        <OnTerrain key={i} x={v.x} z={v.z} rotation={v.rot}>
          <Block size={[1.0, 0.34, 0.72]} color={STONE} />
          <Block
            size={[0.72, 0.26, 0.5]}
            position={[0.12, 0.34, 0]}
            color={TIMBER}
          />
          {/* Private pool, cantilevered off the downhill edge */}
          <mesh
            position={[-0.1, 0.07, 0.62]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[0.66, 0.26]} />
            <meshStandardMaterial
              color="#3fa0bb"
              roughness={0.08}
              metalness={0.55}
            />
          </mesh>
        </OnTerrain>
      ))}
    </>
  );
}

/**
 * The hanging bridge — a catenary deck between Hill 1 and Hill 2 with lit
 * towers, which is the estate's signature piece of architecture.
 */
function HangingBridge() {
  const start = useMemo(
    () => new THREE.Vector3(-6.2, terrainHeight(-6.2, 7.2) + 0.5, 7.2),
    [],
  );
  const end = useMemo(
    () => new THREE.Vector3(-7.6, terrainHeight(-7.6, 0.6) + 0.5, 0.6),
    [],
  );

  const segments = 26;
  const points = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = start.clone().lerp(end, t);
      // Catenary sag between the towers.
      p.y -= Math.sin(t * Math.PI) * 0.55;
      out.push(p);
    }
    return out;
  }, [start, end]);

  const deck = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 60, 0.12, 6, false);
  }, [points]);

  const cable = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(p.x, p.y + 0.62, p.z)),
    );
    return new THREE.TubeGeometry(curve, 60, 0.02, 4, false);
  }, [points]);

  return (
    <group>
      <mesh geometry={deck} castShadow>
        <meshStandardMaterial color={TIMBER} roughness={0.6} />
      </mesh>
      <mesh geometry={cable}>
        <meshStandardMaterial
          color={DECK}
          emissive={DECK}
          emissiveIntensity={1.6}
          roughness={0.3}
        />
      </mesh>
      {[0.18, 0.5, 0.82].map((t) => {
        const p = points[Math.round(t * segments)];
        return (
          <mesh key={t} position={[p.x, p.y + 0.42, p.z]} castShadow>
            <boxGeometry args={[0.16, 0.95, 0.16]} />
            <meshStandardMaterial color={TIMBER} roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Glass conference pavilion on the mid-slope. */
function ConferenceHall() {
  return (
    <OnTerrain x={0} z={-6} rotation={-0.3}>
      <Block size={[1.9, 0.12, 1.4]} color="#ded6c4" />
      <Block
        size={[1.6, 0.62, 1.15]}
        position={[0, 0.12, 0]}
        color={GLASS}
        opacity={0.72}
        roughness={0.12}
      />
      <Block size={[1.7, 0.06, 1.25]} position={[0, 0.74, 0]} color={STONE} />
    </OnTerrain>
  );
}

/** Reception and gatehouse on Hill 1, where the estate opens. */
function Gatehouse() {
  return (
    <OnTerrain x={-6} z={9} rotation={0.15}>
      <Block size={[1.6, 0.4, 1.0]} color={STONE} />
      <Block size={[1.9, 0.08, 1.3]} position={[0, 0.4, 0]} color={TIMBER} />
    </OnTerrain>
  );
}

/** Valley restaurant, in the fold beneath the bridge. */
function ValleyRestaurant() {
  return (
    <OnTerrain x={-4.2} z={3.4} rotation={0.6}>
      <Block size={[1.1, 0.3, 0.8]} color={TIMBER} />
      <Block
        size={[1.25, 0.06, 0.95]}
        position={[0, 0.3, 0]}
        color="#8a6238"
      />
    </OnTerrain>
  );
}

/** Amphitheatre — concentric stepped rings cut into Hill 4. */
function Amphitheatre() {
  const rings = [1.5, 1.9, 2.3, 2.7];
  return (
    <OnTerrain x={1} z={-11}>
      {rings.map((r, i) => (
        <mesh
          key={r}
          position={[0, 0.07 * i, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <ringGeometry args={[r - 0.32, r, 48, 1, Math.PI * 0.15, Math.PI * 1.7]} />
          <meshStandardMaterial color="#ddd5c2" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.35, 40]} />
        <meshStandardMaterial color="#6f9a4c" roughness={0.95} />
      </mesh>
    </OnTerrain>
  );
}

/** Tea house and tree houses — the small timber pieces. */
function SmallPavilions() {
  const items: { x: number; z: number; h: number; stilts?: boolean }[] = [
    { x: 7, z: 4, h: 0.4, stilts: true }, // Tea house
    { x: 4, z: -11, h: 0.32, stilts: true }, // Tree houses
    { x: 5.5, z: 0.5, h: 0.22 }, // Barbecue decks
    { x: -3, z: 8, h: 0.26 }, // Kids zone
    { x: 12, z: -9, h: 0.2 }, // Organic farm sheds
    { x: -8, z: 11, h: 0.22 }, // Parking canopy
  ];

  return (
    <>
      {items.map((item, i) => (
        <OnTerrain key={i} x={item.x} z={item.z} rotation={i * 0.7}>
          {item.stilts && (
            <Block size={[0.5, 0.35, 0.5]} color="#7a6a52" roughness={0.9} />
          )}
          <Block
            size={[0.8, item.h, 0.7]}
            position={[0, item.stilts ? 0.35 : 0, 0]}
            color={TIMBER}
          />
          <Block
            size={[0.95, 0.05, 0.85]}
            position={[0, (item.stilts ? 0.35 : 0) + item.h, 0]}
            color="#8a6238"
          />
        </OnTerrain>
      ))}
    </>
  );
}

export function Structures() {
  return (
    <group>
      <Gatehouse />
      <HangingBridge />
      <ValleyRestaurant />
      <MainHotel />
      <CommonPool />
      <Spa />
      <ConferenceHall />
      <HillsideVillas />
      <Amphitheatre />
      <SmallPavilions />
    </group>
  );
}
