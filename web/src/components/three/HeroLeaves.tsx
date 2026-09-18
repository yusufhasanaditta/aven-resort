"use client";

import dynamic from "next/dynamic";
import { TeaLeaves } from "./TeaLeaves";

const SceneCanvas = dynamic(
  () => import("./SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);

/**
 * The hero's floating-leaf layer. Sits above the render and below the copy,
 * with pointer events off so it never intercepts a click.
 */
export function HeroLeaves({ className }: { className?: string }) {
  return (
    <SceneCanvas
      className={className}
      camera={{ position: [0, 3, 12], fov: 42 }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 8, 6]} intensity={1.6} color="#fff0d0" />
      <TeaLeaves count={70} bounds={[13, 9, 6]} color="#9dc16a" opacity={0.85} />
      <TeaLeaves count={26} bounds={[9, 7, 3]} color="#d9e8b8" opacity={0.55} />
    </SceneCanvas>
  );
}
