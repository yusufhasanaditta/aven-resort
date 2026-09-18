"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { terrainHeight } from "@/lib/terrain";
import { zoneCategories, type Zone } from "@/data/zones";

/** A single pin: a stem rising off the terrain, a pulsing ring, and a label. */
function ZonePin({
  zone,
  active,
  dimmed,
  onSelect,
}: {
  zone: Zone;
  active: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const [x, z] = zone.position;
  const ground = terrainHeight(x, z);
  const color = zoneCategories[zone.category].color;
  const stem = active ? 2.2 : 1.5;

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = clock.getElapsedTime();
    const pulse = active ? 1 + Math.sin(t * 3) * 0.22 : 1;
    ringRef.current.scale.setScalar(pulse);
  });

  return (
    <group position={[x, ground, z]}>
      {/* Ground ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[0.32, 0.46, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={dimmed ? 0.18 : active ? 0.95 : 0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Stem */}
      <mesh position={[0, stem / 2, 0]}>
        <cylinderGeometry args={[0.018, 0.018, stem, 6]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={dimmed ? 0.2 : 0.8}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, stem, 0]}>
        <sphereGeometry args={[active ? 0.13 : 0.09, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={dimmed ? 0.3 : 1}
        />
      </mesh>

      <Html
        position={[0, stem + 0.28, 0]}
        center
        distanceFactor={16}
        occlude={false}
        zIndexRange={[20, 0]}
        style={{ pointerEvents: dimmed ? "none" : "auto" }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(zone.id);
          }}
          className={`group flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide transition-all duration-300 ${
            active
              ? "scale-110 border-transparent bg-forest-950 text-cream-50 shadow-float"
              : dimmed
                ? "border-white/30 bg-white/40 text-forest-900/40"
                : "border-white/60 bg-white/85 text-forest-900 backdrop-blur hover:scale-105 hover:bg-white"
          }`}
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: color }}
          />
          {zone.name}
        </button>
      </Html>
    </group>
  );
}

export function ZonePins({
  zones,
  selected,
  filter,
  onSelect,
}: {
  zones: Zone[];
  selected: string | null;
  filter: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <group>
      {zones.map((zone) => (
        <ZonePin
          key={zone.id}
          zone={zone}
          active={selected === zone.id}
          dimmed={Boolean(filter) && zone.category !== filter}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
