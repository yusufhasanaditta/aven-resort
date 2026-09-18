"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { OrbitControls } from "@react-three/drei";
import { Terrain } from "./Terrain";
import { Lake } from "./Lake";
import { Structures } from "./Structures";
import { TeaLeaves } from "./TeaLeaves";

const SceneCanvas = dynamic(
  () => import("./SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);

/**
 * A slowly turning study model of the whole estate, used on the homepage as
 * the entry point to the full masterplan. No pins and no selection — this one
 * is there to be looked at.
 */
export function EstatePreview({ className }: { className?: string }) {
  return (
    <SceneCanvas
      className={className}
      shadows
      camera={{ position: [32, 26, 36], fov: 32 }}
      fallback={
        <Image
          src="/renders/masterplan-aerial.jpg"
          alt="Aerial view of the Aven Tea Empire estate"
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      }
    >
      <color attach="background" args={["#e4ece7"]} />
      <fog attach="fog" args={["#e4ece7", 50, 110]} />

      <hemisphereLight args={["#cfe4ff", "#3d5a2a", 0.9]} />
      <ambientLight intensity={0.3} color="#fff4e0" />
      <directionalLight
        position={[16, 22, 10]}
        intensity={2.0}
        color="#ffd9a0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-far={70}
        shadow-bias={-0.0006}
      />

      <Terrain />
      <Lake />
      <Structures />
      <group position={[0, 4, 0]}>
        <TeaLeaves count={34} bounds={[16, 7, 14]} color="#a8cc74" opacity={0.7} />
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.05}
        minPolarAngle={0.4}
        maxPolarAngle={Math.PI / 2.5}
        autoRotate
        autoRotateSpeed={0.45}
        target={[0, 1.5, -2]}
      />
    </SceneCanvas>
  );
}
