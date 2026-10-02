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
import { Trees } from "./Trees";
import { SiteLines } from "./SiteLines";
import { zones, getZone } from "@/data/zones";
import { terrainHeight } from "@/lib/terrain";

/** The opening view: from the south over the road, like the survey sheet, the whole site in frame. */
const OVERVIEW_POS: [number, number, number] = [5, 50, 68];
const OVERVIEW_LOOK: [number, number, number] = [1.5, 2, -2];

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
  const targetPos = useRef(new THREE.Vector3(...OVERVIEW_POS));
  const targetLook = useRef(new THREE.Vector3(...OVERVIEW_LOOK));
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
      targetPos.current.set(...OVERVIEW_POS);
      targetLook.current.set(...OVERVIEW_LOOK);
      return;
    }

    const [x, z] = zone.position;
    const ground = terrainHeight(x, z);
    // Approach from outside the estate centre so the zone is never behind a
    // hill. Zones near the origin have no meaningful outward direction, so
    // fall back to the default viewing axis.
    const outward = new THREE.Vector2(x, z);
    if (outward.length() < 0.5) outward.set(0.6, 0.8);
    outward.normalize().multiplyScalar(17);
    targetPos.current.set(x + outward.x, ground + 13, z + outward.y + 4);
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

/** Warm late-afternoon sun from the south-west, matching the golden hour in the project renders. */
function Lighting() {
  return (
    <>
      <hemisphereLight args={["#d6e8ff", "#4a5a33", 0.9]} position={[0, 30, 0]} />
      <ambientLight intensity={0.3} color="#fff4e0" />
      <directionalLight
        position={[-20, 30, 22]}
        intensity={2.2}
        color="#ffd9a0"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={34}
        shadow-camera-bottom={-34}
        shadow-camera-near={1}
        shadow-camera-far={110}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      {/* Cool fill from the north-east, so shadowed slopes keep their detail. */}
      <directionalLight position={[18, 14, -20]} intensity={0.55} color="#a9cdee" />
    </>
  );
}

export function MasterplanScene({
  selected,
  filter,
  onSelect,
  autoRotate = true,
  survey = false,
  onBearing,
}: {
  selected: string | null;
  filter: string | null;
  onSelect: (id: string) => void;
  autoRotate?: boolean;
  /** Show the land in the topographical survey's colours, with contours and spot heights. */
  survey?: boolean;
  /** Called with the view's compass bearing in degrees as the camera turns. */
  onBearing?: (deg: number) => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <>
      <color attach="background" args={["#e4ece6"]} />
      <fog attach="fog" args={["#e4ece6", 90, 190]} />

      <Lighting />

      <Terrain survey={survey} />
      <Lake />
      <SiteLines survey={survey} onBearing={onBearing} />
      <Trees />
      <Structures />
      <ZonePins zones={zones} selected={selected} filter={filter} onSelect={onSelect} />

      <CameraDirector selected={selected} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={12}
        maxDistance={90}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.3}
        autoRotate={autoRotate && !selected}
        autoRotateSpeed={0.22}
        target={OVERVIEW_LOOK}
      />
    </>
  );
}
