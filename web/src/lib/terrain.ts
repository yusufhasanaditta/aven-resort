/**
 * The estate's terrain, expressed as a height field.
 *
 * Five tillas (hills) as gaussian mounds, with the valley between Hills 2, 3
 * and 4 carved out for the eco-lake. Both the 3D mesh and the zone pins read
 * from `terrainHeight`, so markers always sit exactly on the ground.
 *
 * World units are arbitrary but consistent: roughly 1 unit ≈ 12 metres.
 */

export type Tilla = {
  id: string;
  label: string;
  /** Centre on the ground plane. */
  center: [number, number];
  radius: number;
  height: number;
};

export const tillas: Tilla[] = [
  { id: "hill-1", label: "Hill 1", center: [-6, 9], radius: 6.0, height: 4.2 },
  { id: "hill-2", label: "Hill 2", center: [-8, -4], radius: 6.8, height: 7.4 },
  { id: "hill-3", label: "Hill 3", center: [9, 0], radius: 6.4, height: 6.2 },
  { id: "hill-4", label: "Hill 4", center: [2, -12], radius: 6.0, height: 5.2 },
  { id: "hill-5", label: "Hill 5", center: [13, -9], radius: 5.4, height: 4.6 },
];

export const lake = {
  center: [1.5, -3] as [number, number],
  radius: 4.4,
  /** Water surface sits slightly below the surrounding ground. */
  level: 0.1,
  depth: 2.0,
};

export const TERRAIN_SIZE = 56;
export const TERRAIN_SEGMENTS = 200;

/**
 * A single tilla.
 *
 * Srimangal's hills are steep-sided and distinctly separate, so a plain
 * gaussian reads far too soft — the exponent is pushed up until each mound
 * falls away sharply enough that five of them stay legible as five.
 */
function mound(
  x: number,
  z: number,
  center: [number, number],
  radius: number,
  height: number,
) {
  const dx = x - center[0];
  const dz = z - center[1];
  const d2 = (dx * dx + dz * dz) / (radius * radius);
  return height * Math.exp(-d2 * 2.9);
}

/** Cheap value noise, for the ridges and erosion lines on the slopes. */
function hash(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise(x: number, z: number) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi);
  const b = hash(xi + 1, zi);
  const c = hash(xi, zi + 1);
  const d = hash(xi + 1, zi + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

/** Ground height at a point on the estate. */
export function terrainHeight(x: number, z: number): number {
  let h = 0;
  for (const t of tillas) {
    h += mound(x, z, t.center, t.radius, t.height);
  }

  // Gentle rolling base so the estate never reads as a flat table.
  h += (valueNoise(x * 0.16, z * 0.16) - 0.5) * 0.9;
  h += (valueNoise(x * 0.5, z * 0.5) - 0.5) * 0.28;

  // Carve the lake basin.
  const dx = x - lake.center[0];
  const dz = z - lake.center[1];
  const d = Math.sqrt(dx * dx + dz * dz);
  const basin = 1 - smoothstep(lake.radius * 0.6, lake.radius * 1.8, d);
  h -= basin * lake.depth;

  // Fall away to a flat plain beyond the estate boundary. The falloff has to
  // start outside the furthest tilla (hill 5, ~15.8 from origin) or that hill
  // gets flattened along with the plain.
  const edge = 1 - smoothstep(19, 27, Math.hypot(x, z));
  h *= edge;

  return h;
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Surface normal, by finite difference — used to tint steep ground. */
export function terrainSlope(x: number, z: number, eps = 0.35): number {
  const hL = terrainHeight(x - eps, z);
  const hR = terrainHeight(x + eps, z);
  const hD = terrainHeight(x, z - eps);
  const hU = terrainHeight(x, z + eps);
  const dx = (hR - hL) / (2 * eps);
  const dz = (hU - hD) / (2 * eps);
  return Math.sqrt(dx * dx + dz * dz);
}
