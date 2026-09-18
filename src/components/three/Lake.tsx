"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { lake } from "@/lib/terrain";

/**
 * The eco-lake in the valley between Hills 2, 3 and 4.
 *
 * A translucent disc with a hand-written shader: two crossing wave trains for
 * the surface, a fresnel term so the far edge goes reflective, and a soft
 * alpha falloff at the rim so the water meets the planted bank rather than
 * ending on a hard circle.
 */
export function Lake() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uShallow: { value: new THREE.Color("#5fa8b8") },
      uDeep: { value: new THREE.Color("#12495c") },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[lake.center[0], lake.level, lake.center[1]]}
    >
      <circleGeometry args={[lake.radius, 96]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vViewDir;
          void main() {
            vUv = uv;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vViewDir = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uShallow;
          uniform vec3 uDeep;
          varying vec2 vUv;
          varying vec3 vViewDir;

          void main() {
            vec2 p = (vUv - 0.5) * 2.0;
            float r = length(p);

            // Two crossing wave trains.
            float w1 = sin(p.x * 26.0 + uTime * 0.7);
            float w2 = sin((p.y * 21.0 - p.x * 8.0) + uTime * 0.45);
            float ripple = (w1 * 0.5 + w2 * 0.5) * 0.5 + 0.5;

            vec3 color = mix(uDeep, uShallow, smoothstep(0.15, 1.0, r) * 0.65 + ripple * 0.22);

            // Fresnel — the far edge of the water turns to sky.
            float fresnel = pow(1.0 - clamp(vViewDir.z, 0.0, 1.0), 2.4);
            color += fresnel * 0.35;

            // Specular glints riding the ripples — kept subtle, or the lake
            // reads as speckled noise rather than water at this scale.
            float glint = smoothstep(0.94, 1.0, ripple);
            color += glint * 0.12;

            // Soft rim so the lake meets its planted bank.
            float alpha = 0.9 * (1.0 - smoothstep(0.82, 1.0, r));
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}
