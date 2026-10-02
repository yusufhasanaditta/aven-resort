/**
 * The estate's land, digitised from the digital topographical survey
 * ("3D Surface Map", ICSCT — Mouza Balishira Pahar Block-2, J.L. 72,
 * Sreemangal, Moulvibazar).
 *
 * The survey's elevations (36–64 m) are sampled on a grid and interpolated
 * smoothly; the plot boundary and the road along the south are traced from
 * the same sheet. The 3D model, the zone pins, the trees and the paths all
 * read `terrainHeight`, so everything sits exactly on the ground.
 *
 * World units: x runs west → east, z runs north → south (north is −z).
 * 1 unit ≈ 4.4 m on the ground (the plot is 5 acres); heights are
 * exaggerated ×1.7, as on the survey's 3D surface map, so the tillas read clearly.
 */

export const ELEV_MIN = 36;
export const ELEV_MAX = 64;
/** World units per metre of elevation. */
export const VERTICAL = 0.38;

export const TERRAIN_SIZE = 56;
export const TERRAIN_SEGMENTS = 220;

/**
 * Survey elevations in metres, north row first, west column first. The grid
 * spans x = −28…28 and z = −26…26 in 4-unit steps.
 */
const GRID: number[][] = [
  [38, 38, 40, 41, 46, 52, 46, 42, 47, 56, 46, 45, 46, 44, 44],
  [37, 38, 40, 44, 52, 57, 52, 41, 46, 52, 42, 58, 63, 62, 58],
  [37, 39, 44, 47, 53, 57, 48, 42, 47, 46, 42, 57, 61, 59, 57],
  [39, 44, 50, 52, 55, 56, 57, 57, 54, 48, 46, 56, 58, 57, 55],
  [40, 45, 52, 53, 55, 57, 56, 52, 49, 46, 47, 57, 58, 54, 52],
  [40, 46, 51, 50, 53, 55, 48, 43, 42, 46, 54, 56, 54, 49, 48],
  [41, 46, 50, 49, 50, 47, 43, 41, 44, 52, 56, 54, 49, 46, 43],
  [40, 45, 49, 46, 45, 42, 42, 47, 52, 56, 58, 54, 48, 43, 42],
  [40, 42, 44, 42, 41, 46, 52, 55, 57, 57, 54, 49, 46, 42, 41],
  [38, 39, 40, 39, 40, 47, 51, 52, 53, 52, 49, 47, 43, 41, 40],
  [37, 37, 37, 38, 39, 44, 46, 46, 47, 46, 43, 42, 41, 40, 39],
  [45, 48, 49, 46, 40, 39, 38, 38, 39, 40, 40, 44, 45, 42, 40],
  [46, 48, 46, 45, 42, 44, 45, 41, 44, 45, 43, 46, 45, 41, 40],
  [45, 46, 46, 46, 42, 40, 41, 42, 42, 42, 42, 42, 42, 41, 40],
];
const GRID_X0 = -28;
const GRID_Z0 = -26;
const GRID_STEP = 4;

/** The plot as surveyed (the red line on the sheet), clockwise from the north-west corner. */
export const PLOT: [number, number][] = [
  [-9, -24.5],
  [3.7, -25.5],
  [5, -19],
  [15.5, -18.5],
  [14.8, -11],
  [21.5, 14],
  [14, 17.3],
  [8, 18],
  [2, 18.6],
  [-4, 16.6],
  [-8.5, 15],
];

/** The public road along the southern edge (the orange line on the sheet), west → east. */
export const ROAD: [number, number][] = [
  [-28, 13.6],
  [-17.5, 13.2],
  [-10, 15.2],
  [-4, 17.8],
  [2, 19.8],
  [8, 19.3],
  [14, 18.1],
  [21, 15.9],
  [28, 14.2],
];
export const ROAD_HALF_WIDTH = 0.85;

/** The kayaking lake, set in the central valley between the three ridges. */
export const lake = {
  center: [-0.6, -2.4] as [number, number],
  /** Semi-axes along and across the valley. */
  radii: [4.4, 2.1] as [number, number],
  /** Valley direction, radians (the valley runs north-east → south-west). */
  angle: 0.68,
  /** Water level, metres. */
  levelM: 42.2,
  get level() {
    return (this.levelM - ELEV_MIN) * VERTICAL;
  },
};

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function gridAt(col: number, row: number) {
  const r = Math.min(GRID.length - 1, Math.max(0, row));
  const c = Math.min(GRID[0].length - 1, Math.max(0, col));
  return GRID[r][c];
}

/** Smoothly interpolated survey elevation, metres. */
function surveyGrid(x: number, z: number) {
  const gx = (x - GRID_X0) / GRID_STEP;
  const gz = (z - GRID_Z0) / GRID_STEP;
  const c = Math.floor(gx);
  const r = Math.floor(gz);
  const tx = gx - c;
  const tz = gz - r;
  const rows = [-1, 0, 1, 2].map((dr) =>
    catmullRom(gridAt(c - 1, r + dr), gridAt(c, r + dr), gridAt(c + 1, r + dr), gridAt(c + 2, r + dr), tx),
  );
  return catmullRom(rows[0], rows[1], rows[2], rows[3], tz);
}

/** Cheap value noise, for small erosion detail on the slopes. */
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

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Nearest point on a polyline: distance and position along it (0…1). */
export function nearestOnPolyline(path: [number, number][], x: number, z: number) {
  let best = Infinity;
  let bestT = 0;
  let travelled = 0;
  const lengths = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const total = lengths.reduce((s, l) => s + l, 0);
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i];
    const [bx, bz] = path[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
    const d = Math.hypot(x - (ax + dx * t), z - (az + dz * t));
    if (d < best) {
      best = d;
      bestT = (travelled + lengths[i] * t) / total;
    }
    travelled += lengths[i];
  }
  return { distance: best, t: bestT };
}

/** Point along a polyline at 0…1 of its length. */
export function pointOnPolyline(path: [number, number][], t: number): [number, number] {
  const lengths = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  let target = lengths.reduce((s, l) => s + l, 0) * Math.min(1, Math.max(0, t));
  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i] || i === lengths.length - 1) {
      const k = lengths[i] ? target / lengths[i] : 0;
      return [path[i][0] + (path[i + 1][0] - path[i][0]) * k, path[i][1] + (path[i + 1][1] - path[i][1]) * k];
    }
    target -= lengths[i];
  }
  return path[path.length - 1];
}

/** Natural ground, metres — the survey plus fine erosion detail. */
function naturalElevation(x: number, z: number) {
  return (
    surveyGrid(x, z) +
    (valueNoise(x * 0.45, z * 0.45) - 0.5) * 1.1 +
    (valueNoise(x * 1.3 + 7, z * 1.3 - 3) - 0.5) * 0.35
  );
}

/** The road's grade: the ground along its line, smoothed so it never climbs a hill. */
const ROAD_PROFILE: number[] = (() => {
  const n = 80;
  const raw = Array.from({ length: n + 1 }, (_, i) => {
    const [x, z] = pointOnPolyline(ROAD, i / n);
    return naturalElevation(x, z);
  });
  return raw.map((_, i) => {
    const window = raw.slice(Math.max(0, i - 6), Math.min(raw.length, i + 7));
    return Math.min(...window) * 0.5 + (window.reduce((s, v) => s + v, 0) / window.length) * 0.5;
  });
})();

function roadElevation(t: number) {
  const f = t * (ROAD_PROFILE.length - 1);
  const i = Math.floor(f);
  const k = f - i;
  return ROAD_PROFILE[i] * (1 - k) + (ROAD_PROFILE[Math.min(i + 1, ROAD_PROFILE.length - 1)] ?? ROAD_PROFILE[i]) * k;
}

/** Distance inside the lake ellipse: 0 at the centre, 1 at the shore. */
export function lakeRadius(x: number, z: number) {
  const dx = x - lake.center[0];
  const dz = z - lake.center[1];
  const c = Math.cos(lake.angle);
  const s = Math.sin(lake.angle);
  const u = dx * c - dz * s;
  const v = dx * s + dz * c;
  return Math.hypot(u / lake.radii[0], v / lake.radii[1]);
}

/** Ground elevation in metres above sea level, with the lake basin and the road cut in. */
export function elevationAt(x: number, z: number): number {
  let e = naturalElevation(x, z);

  // Lake: a basin below the water, and a gentle bank that holds the water in.
  const r = lakeRadius(x, z);
  if (r < 1.7) {
    const bed = lake.levelM - 1.6 * (1 - Math.min(1, r) ** 2);
    const bank = lake.levelM + 0.25 + (r - 1) * 2.2;
    if (r < 1) e = Math.min(e, bed);
    else e = e * smoothstep(1, 1.7, r) + Math.max(Math.min(e, bank), lake.levelM + 0.2) * (1 - smoothstep(1, 1.7, r));
  }

  // Road: cut and filled to its smoothed grade.
  const road = nearestOnPolyline(ROAD, x, z);
  if (road.distance < ROAD_HALF_WIDTH + 2.4) {
    const k = 1 - smoothstep(ROAD_HALF_WIDTH + 0.15, ROAD_HALF_WIDTH + 2.4, road.distance);
    e = e * (1 - k) + roadElevation(road.t) * k;
  }
  return e;
}

/** Ground height in world units. */
export function terrainHeight(x: number, z: number): number {
  return (elevationAt(x, z) - ELEV_MIN) * VERTICAL;
}

/** Steepness (rise over run, in world units) — used to show bare earth on steep banks. */
export function terrainSlope(x: number, z: number, eps = 0.3): number {
  const dx = (terrainHeight(x + eps, z) - terrainHeight(x - eps, z)) / (2 * eps);
  const dz = (terrainHeight(x, z + eps) - terrainHeight(x, z - eps)) / (2 * eps);
  return Math.hypot(dx, dz);
}

/** Is the point inside the surveyed plot? */
export function insidePlot(x: number, z: number) {
  let inside = false;
  for (let i = 0, j = PLOT.length - 1; i < PLOT.length; j = i++) {
    const [xi, zi] = PLOT[i];
    const [xj, zj] = PLOT[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** Distance from the plot boundary line (positive either side). */
export function distanceToBoundary(x: number, z: number) {
  return nearestOnPolyline([...PLOT, PLOT[0]], x, z).distance;
}
