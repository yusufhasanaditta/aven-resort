"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  TERRAIN_SEGMENTS,
  TERRAIN_SIZE,
  terrainHeight,
  terrainSlope,
} from "@/lib/terrain";

/**
 * The five tillas as a single displaced mesh.
 *
 * Tea terraces are drawn as contour bands injected into the standard material's
 * fragment shader, so the rows follow the height field exactly the way planted
 * terraces follow a real contour — and we keep physically-based lighting and
 * shadows rather than hand-rolling them.
 */
export function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      TERRAIN_SIZE,
      TERRAIN_SIZE,
      TERRAIN_SEGMENTS,
      TERRAIN_SEGMENTS,
    );
    geo.rotateX(-Math.PI / 2);

    const position = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(position.count * 3);

    const lowland = new THREE.Color("#4f7a3c");
    const upland = new THREE.Color("#8fb45c");
    const scrub = new THREE.Color("#6d5a3a");
    const tmp = new THREE.Color();

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const h = terrainHeight(x, z);
      position.setY(i, h);

      // Steep ground shows earth; gentle slopes stay planted.
      const slope = terrainSlope(x, z);
      const planted = 1 - Math.min(1, Math.max(0, (slope - 0.55) / 0.85));
      const elevation = Math.min(1, Math.max(0, h / 5.6));

      tmp.copy(lowland).lerp(upland, elevation);
      tmp.lerp(scrub, (1 - planted) * 0.75);

      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.94,
      metalness: 0,
      flatShading: false,
    });

    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           varying vec3 vWorldPos;`,
        )
        .replace(
          "#include <worldpos_vertex>",
          `#include <worldpos_vertex>
           vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           varying vec3 vWorldPos;`,
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
           // Contour bands following the height field — planted tea rows.
           float band = fract(vWorldPos.y * 5.5);
           float row = smoothstep(0.0, 0.16, band) * smoothstep(0.42, 0.26, band);
           diffuseColor.rgb *= 1.0 - row * 0.2;
           // Slight cross-hatch so rows do not read as perfect rings.
           float hatch = sin(vWorldPos.x * 2.2 + vWorldPos.z * 1.4) * 0.5 + 0.5;
           diffuseColor.rgb *= 0.94 + hatch * 0.06;`,
        );
    };

    return mat;
  }, []);

  return (
    <mesh
      geometry={geometry}
      material={material}
      receiveShadow
      castShadow
      position={[0, 0, 0]}
    />
  );
}
