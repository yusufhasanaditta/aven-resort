"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Terrain } from "./Terrain";
import { Lake } from "./Lake";
import { Structures } from "./Structures";
import { ZonePins } from "./ZonePins";
import { zones, getZone } from "@/data/zones";
import { terrainHeight } from "@/lib/terrain";

/**
 * Flies the camera to frame a zone when one is selected, and drifts back to the
 * overview when the selection is cleared. Uses damped interpolation rather than
 * a tween so a user grabbing the controls mid-flight takes over cleanly.
 */
function CameraDirector({
  selected,
  controlsRef,
}: {
  selected: string | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(30, 24, 34));
  const targetLook = useRef(new THREE.Vector3(0, 1.5, -2));
  const userEngaged = useRef(false);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const onStart = () => {
      userEngaged.current = true;
    };
    controls.addEventListener("start", onStart);
    return () => controls.removeEventListener("start", onStart);
  }, [controlsRef]);

  useEffect(() => {
    userEngaged.current = false;

    const zone = selected ? getZone(selected) : null;
    if (!zone) {
      targetPos.current.set(30, 24, 34);
      targetLook.current.set(0, 1.5, -2);
      return;
    }

    const [x, z] = zone.position;
    const ground = terrainHeight(x, z);
    // Approach from outside the estate centre so the zone is never behind a
    // hill. Zones near the origin have no meaningful outward direction, so
    // fall back to the default viewing axis.
    const outward = new THREE.Vector2(x, z);
    if (outward.length() < 0.5) outward.set(0.6, 0.8);
    outward.normalize().multiplyScalar(13);
    targetPos.current.set(x + outward.x, ground + 9, z + outward.y + 3);
    targetLook.current.set(x, ground + 1, z);
  }, [selected]);

  useFrame((_, delta) => {
    if (userEngaged.current) return;
    const controls = controlsRef.current;
    const k = 1 - Math.pow(0.001, delta);
    camera.position.lerp(targetPos.current, k);
    if (controls) {
      controls.target.lerp(targetLook.current, k);
      controls.update();
    }
  });

  return null;
}

/** Warm late-afternoon light, matching the golden hour in the project renders. */
function Lighting() {
  return (
    <>
      <hemisphereLight
        args={["#cfe4ff", "#3d5a2a", 0.85]}
        position={[0, 20, 0]}
      />
      <ambientLight intensity={0.35} color="#fff4e0" />
      <directionalLight
        position={[16, 22, 10]}
        intensity={2.1}
        color="#ffd9a0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0006}
      />
      {/* Cool fill from the opposite side, so shadowed slopes keep detail. */}
      <directionalLight
        position={[-14, 10, -12]}
        intensity={0.5}
        color="#9fc6e8"
      />
    </>
  );
}

export function MasterplanScene({
  selected,
  filter,
  onSelect,
  autoRotate = true,
}: {
  selected: string | null;
  filter: string | null;
  onSelect: (id: string) => void;
  autoRotate?: boolean;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <>
      <color attach="background" args={["#dfe9e4"]} />
      <fog attach="fog" args={["#dfe9e4", 48, 105]} />

      <Lighting />

      <Terrain />
      <Lake />
      <Structures />
      <ZonePins
        zones={zones}
        selected={selected}
        filter={filter}
        onSelect={onSelect}
      />

      <CameraDirector selected={selected} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={18}
        maxDistance={72}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2.4}
        autoRotate={autoRotate && !selected}
        autoRotateSpeed={0.28}
        target={[0, 1.5, -2]}
      />
    </>
  );
}
