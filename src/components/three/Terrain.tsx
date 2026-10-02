"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  ELEV_MIN,
  TERRAIN_SEGMENTS,
  TERRAIN_SIZE,
  VERTICAL,
  distanceToBoundary,
  insidePlot,
  lakeRadius,
  nearestOnPolyline,
  ROAD,
  ROAD_HALF_WIDTH,
  terrainHeight,
  terrainSlope,
} from "@/lib/terrain";

/** How deep the model block's sides go below the lowest ground. */
const BASE_Y = -1.6;

/**
 * The surveyed land as a physical site model: the terrain mesh, cut square
 * with earth-coloured sides, on a pale plinth.
 *
 * Two looks share one shader. "Resort" is the planted estate — tea rows
 * following the contours inside the plot, the neighbouring land softened
 * around it. "Survey" recolours the same ground with the topographical
 * survey's elevation scale (36 m violet → 64 m red) and draws its contour
 * lines every 2 m, heavier every 10 m — so the model can be read against
 * the survey sheet directly.
 */
export function Terrain({ survey = false }: { survey?: boolean }) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
    geo.rotateX(-Math.PI / 2);

    const position = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(position.count * 3);
    const planted = new Float32Array(position.count);

    const tea = new THREE.Color("#3f6f2c");
    const teaHigh = new THREE.Color("#5f8f38");
    const meadow = new THREE.Color("#93b35c");
    const earth = new THREE.Color("#8d6b45");
    const verge = new THREE.Color("#a9a78a");
    const outside = new THREE.Color("#a3bd8a");
    const tmp = new THREE.Color();

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const h = terrainHeight(x, z);
      position.setY(i, h);

      const elev = ELEV_MIN + h / VERTICAL;
      const slope = terrainSlope(x, z);
      const inPlot = insidePlot(x, z);
      const road = nearestOnPolyline(ROAD, x, z).distance;
      const shore = lakeRadius(x, z);

      // Valley floors stay meadow; slopes are tea; the steepest cuts show earth.
      const highness = Math.min(1, Math.max(0, (elev - 44) / 14));
      tmp.copy(tea).lerp(teaHigh, highness);
      const valley = 1 - Math.min(1, Math.max(0, (elev - 41.5) / 3));
      tmp.lerp(meadow, valley * 0.85);
      const steep = Math.min(1, Math.max(0, (slope - 1.05) / 0.9));
      tmp.lerp(earth, steep * 0.7);
      if (road < ROAD_HALF_WIDTH + 1.6) tmp.lerp(verge, 0.55 * (1 - Math.max(0, road - ROAD_HALF_WIDTH) / 1.6));
      if (shore < 1.25) tmp.lerp(meadow, 0.6);

      // Neighbouring land is softened so the plot reads first.
      if (!inPlot) tmp.lerp(outside, Math.min(0.42, 0.18 + distanceToBoundary(x, z) * 0.03));

      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;

      // Tea rows: planted slopes inside the plot, not the valley floor, banks, lake or road verge.
      planted[i] =
        (inPlot ? 1 : 0.45) * (1 - valley) * (1 - steep) * (shore > 1.3 ? 1 : 0) * (road > ROAD_HALF_WIDTH + 1.2 ? 1 : 0);
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aPlanted", new THREE.BufferAttribute(planted, 1));
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, metalness: 0 });
    const uniforms = {
      uMode: { value: 0 },
      uVertical: { value: VERTICAL },
      uElevMin: { value: ELEV_MIN },
    };
    mat.userData.uniforms = uniforms;

    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
           attribute float aPlanted;
           varying float vPlanted;
           varying vec3 vWorldPos;`,
        )
        .replace(
          "#include <worldpos_vertex>",
          `#include <worldpos_vertex>
           vPlanted = aPlanted;
           vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
           uniform float uMode;
           uniform float uVertical;
           uniform float uElevMin;
           varying float vPlanted;
           varying vec3 vWorldPos;

           // The survey sheet's elevation scale, 36 m → 64 m.
           vec3 surveyRamp(float e) {
             float t = clamp((e - 36.0) / 28.0, 0.0, 1.0);
             vec3 c0 = vec3(0.66, 0.52, 0.96);  // 36 violet
             vec3 c1 = vec3(0.20, 0.27, 0.96);  // 40 blue
             vec3 c2 = vec3(0.10, 0.78, 0.80);  // 44 cyan
             vec3 c3 = vec3(0.20, 0.82, 0.25);  // 47 green
             vec3 c4 = vec3(0.95, 0.93, 0.15);  // 52 yellow
             vec3 c5 = vec3(0.97, 0.60, 0.13);  // 57 orange
             vec3 c6 = vec3(0.91, 0.13, 0.12);  // 64 red
             if (t < 0.143) return mix(c0, c1, t / 0.143);
             if (t < 0.286) return mix(c1, c2, (t - 0.143) / 0.143);
             if (t < 0.393) return mix(c2, c3, (t - 0.286) / 0.107);
             if (t < 0.571) return mix(c3, c4, (t - 0.393) / 0.178);
             if (t < 0.750) return mix(c4, c5, (t - 0.571) / 0.179);
             return mix(c5, c6, (t - 0.750) / 0.250);
           }

           float contourLine(float value, float width) {
             float f = abs(fract(value - 0.5) - 0.5);
             float w = fwidth(value) * width;
             return 1.0 - smoothstep(0.0, w, f);
           }`,
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
           float elev = uElevMin + vWorldPos.y / uVertical;

           // Resort look: tea rows following the contours, with a soft hatch so they don't read as rings.
           vec3 natural = diffuseColor.rgb;
           float rowBand = fract(elev / 0.75);
           float row = smoothstep(0.0, 0.18, rowBand) * smoothstep(0.55, 0.32, rowBand);
           natural *= 1.0 - row * 0.24 * vPlanted;
           float hatch = sin(vWorldPos.x * 2.3 + vWorldPos.z * 1.5) * 0.5 + 0.5;
           natural *= 0.95 + hatch * 0.05;
           natural = mix(natural, natural * 0.82, contourLine(elev / 2.0, 1.0) * 0.25);

           // Survey look: the elevation scale with 2 m and 10 m contours.
           vec3 survey = surveyRamp(elev);
           survey = mix(survey, vec3(0.08), contourLine(elev / 2.0, 1.0) * 0.45);
           survey = mix(survey, vec3(0.05), contourLine(elev / 10.0, 1.8) * 0.65);

           diffuseColor.rgb = mix(natural, survey, uMode);`,
        );
    };
    return mat;
  }, []);

  // Fade between the resort and survey looks.
  const ground = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    const mat = ground.current?.material as THREE.MeshStandardMaterial | undefined;
    const u = mat?.userData.uniforms?.uMode;
    if (u) u.value += ((survey ? 1 : 0) - u.value) * Math.min(1, delta * 5);
  });

  // The model block's cut sides, following the terrain along each edge.
  const sides = useMemo(() => {
    const half = TERRAIN_SIZE / 2;
    const n = TERRAIN_SEGMENTS;
    const verts: number[] = [];
    const index: number[] = [];
    const edges: [number, number, number, number][] = [
      [-half, -half, half, -half],
      [half, -half, half, half],
      [half, half, -half, half],
      [-half, half, -half, -half],
    ];
    for (const [x0, z0, x1, z1] of edges) {
      const start = verts.length / 3;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const x = x0 + (x1 - x0) * t;
        const z = z0 + (z1 - z0) * t;
        verts.push(x, terrainHeight(x, z), z, x, BASE_Y, z);
      }
      for (let i = 0; i < n; i++) {
        const a = start + i * 2;
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setIndex(index);
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      <mesh ref={ground} geometry={geometry} material={material} receiveShadow castShadow />
      <mesh geometry={sides}>
        <meshStandardMaterial color="#6e563b" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Plinth */}
      <mesh position={[0, BASE_Y - 0.18, 0]} receiveShadow>
        <boxGeometry args={[TERRAIN_SIZE + 2.4, 0.36, TERRAIN_SIZE + 2.4]} />
        <meshStandardMaterial color="#f3efe6" roughness={0.85} />
      </mesh>
    </group>
  );
}
