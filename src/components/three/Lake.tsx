"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { lake } from "@/lib/terrain";

/**
 * The kayaking lake, lying along the central valley between Hills 2, 3 and 4.
 *
 * An ellipse turned to the valley's line, with a hand-written water shader:
 * two crossing wave trains, a fresnel term so the far side goes reflective,
 * and a soft shore so the water meets its bank rather than a hard edge.
 */
export function Lake() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const g = new THREE.CircleGeometry(1, 128);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const c = Math.cos(lake.angle);
    const s = Math.sin(lake.angle);
    for (let i = 0; i < pos.count; i++) {
      // Unit circle (u along the valley, v across it) → world, matching `lakeRadius`.
      const u = pos.getX(i) * lake.radii[0] * 1.04;
      const v = pos.getZ(i) * lake.radii[1] * 1.04;
      pos.setXYZ(i, lake.center[0] + u * c + v * s, lake.level, lake.center[1] - u * s + v * c);
    }
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uShallow: { value: new THREE.Color("#6cc2cf") },
      uDeep: { value: new THREE.Color("#145a6e") },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh geometry={geometry} renderOrder={1}>
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
            float w1 = sin(p.x * 30.0 + uTime * 0.7);
            float w2 = sin((p.y * 24.0 - p.x * 9.0) + uTime * 0.45);
            float ripple = (w1 * 0.5 + w2 * 0.5) * 0.5 + 0.5;
            vec3 color = mix(uDeep, uShallow, smoothstep(0.1, 1.0, r) * 0.7 + ripple * 0.18);
            float fresnel = pow(1.0 - clamp(vViewDir.z, 0.0, 1.0), 2.4);
            color += fresnel * 0.3;
            color += smoothstep(0.95, 1.0, ripple) * 0.1;
            float alpha = 0.93 * (1.0 - smoothstep(0.88, 1.0, r));
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}
