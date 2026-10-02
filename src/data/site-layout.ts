/**
 * Where everything sits on the surveyed land, in the masterplan's world
 * units (see `src/lib/terrain.ts`: x west → east, z north → south).
 *
 * The five tillas of the brochure, read on the survey:
 *   Hill 1 — the lower south-west knoll beside the road (arrival)
 *   Hill 2 — the high southern ridge, ~58 m (hotel, pool, spa)
 *   Hill 3 — the northern ridge, ~57 m (villas, tea house)
 *   Hill 4 — the eastern spur, ~56 m (conference, event lawn, tree houses)
 *   Hill 5 — the south-eastern slope (organic farm)
 * and the central valley between Hills 2, 3 and 4 holds the lake.
 *
 * Structures, paths, trees and zone pins all read from here, so moving a
 * building moves its pin and clears its trees too.
 */

export type Spot = { x: number; z: number; rot?: number };

export const layout = {
  gatehouse: { x: 0.8, z: 16.2, rot: 0.32 },
  parking: { x: -4.6, z: 14.4, rot: 0.38 },
  kids: { x: -4.2, z: 10.2, rot: 0.2 },
  hotel: { x: 8.4, z: 4.0, rot: -0.12 },
  pool: { x: 4.8, z: 1.7, rot: -0.5 },
  spa: { x: 12.6, z: 6.8, rot: 0.3 },
  conference: { x: 12.8, z: -2.4, rot: 0.25 },
  eventLawn: { x: 13.8, z: -7.4, rot: 0 },
  treeHouses: [
    { x: 10.4, z: -14.6, rot: 0.4 },
    { x: 12.2, z: -13.2, rot: 1.3 },
    { x: 11.6, z: -16.4, rot: 2.2 },
    { x: 9.4, z: -12.6, rot: 3.0 },
  ] as Spot[],
  teaHouse: { x: 3.2, z: -12.2, rot: 0.6 },
  restaurant: { x: -5.0, z: 1.3, rot: 0.68 },
  barbecue: { x: 1.6, z: 0.4, rot: 0.68 },
  farm: { x: 14.6, z: 9.2, rot: -0.3 },
  bridge: { from: [-1.4, 5.6] as [number, number], to: [-3.6, -10.2] as [number, number] },
  /** The 20 two-room villas: along the northern ridge and down its far side, each facing the lake. */
  villas: [
    { x: -6.4, z: -21.0, rot: -1.45 },
    { x: -6.6, z: -18.6, rot: -1.4 },
    { x: -6.8, z: -16.2, rot: -1.2 },
    { x: -6.2, z: -13.2, rot: -0.75 },
    { x: -4.0, z: -11.6, rot: -0.15 },
    { x: -1.6, z: -12.4, rot: 0 },
    { x: 0.6, z: -11.4, rot: 0.15 },
    { x: -2.6, z: -15.2, rot: 0.1 },
    { x: -0.2, z: -15.0, rot: 0.2 },
    { x: 1.8, z: -16.6, rot: 0.6 },
    { x: 3.4, z: -15.0, rot: -0.31 },
    { x: -4.2, z: -18.0, rot: 0.23 },
    { x: -1.8, z: -18.2, rot: 0.08 },
    { x: 0.6, z: -19.0, rot: -0.07 },
    { x: 2.8, z: -19.6, rot: -0.2 },
    { x: -4.4, z: -20.6, rot: 0.21 },
    { x: -2.0, z: -21.0, rot: 0.08 },
    { x: 0.4, z: -21.6, rot: -0.05 },
    { x: 2.4, z: -22.4, rot: -0.15 },
    { x: -4.6, z: -23.2, rot: 0.19 },
  ] as Spot[],
};

/** Buggy paths (and the nature trail), as polylines. */
export const paths: { id: string; points: [number, number][]; trail?: boolean }[] = [
  { id: "arrival", points: [[0.8, 16.2], [2.6, 13.2], [4.8, 10.2], [6.6, 7.6], [8.2, 6.0]] },
  { id: "parking", points: [[0.8, 16.2], [-1.6, 15.6], [-4.6, 14.4]] },
  { id: "kids", points: [[-4.6, 14.4], [-4.8, 12.2], [-4.2, 10.2]] },
  { id: "spa", points: [[8.2, 6.0], [10.4, 6.6], [12.6, 6.8]] },
  { id: "farm", points: [[12.6, 6.8], [14.0, 8.0], [14.6, 9.2]] },
  { id: "east", points: [[9.8, 2.6], [11.6, 0.6], [12.8, -2.4], [13.6, -5.0], [13.8, -7.4], [12.6, -10.6], [11.0, -13.6]] },
  { id: "pool", points: [[7.0, 3.0], [5.6, 2.2], [4.8, 1.7]] },
  { id: "bridge-south", points: [[6.6, 4.6], [3.6, 5.6], [0.8, 6.0], [-1.4, 5.6]] },
  {
    id: "ridge",
    points: [[-3.6, -10.2], [-4.6, -11.4], [-5.8, -12.6], [-6.6, -14.6], [-7.0, -17.4], [-6.8, -20.0], [-6.2, -22.0]],
  },
  { id: "ridge-east", points: [[-3.6, -10.2], [-1.6, -11.0], [0.8, -10.6], [2.4, -11.4], [3.2, -12.2]] },
  { id: "ridge-inner", points: [[-4.6, -11.4], [-2.8, -13.6], [-0.4, -13.8], [1.6, -15.2]] },
  { id: "ridge-north", points: [[-2.8, -13.6], [-3.0, -16.6], [-3.2, -19.4], [-3.4, -22.2]] },
  { id: "ridge-gully", points: [[1.6, -15.2], [1.6, -18.0], [1.6, -21.0], [1.4, -23.2]] },
  {
    id: "lake-trail",
    trail: true,
    points: [[-5.0, 1.3], [-3.0, 2.0], [-0.6, 1.4], [1.6, 0.4], [3.4, -1.6], [4.4, -4.2], [3.4, -6.4], [1.2, -6.8], [-1.4, -5.6], [-3.6, -3.4], [-5.6, -1.2], [-5.0, 1.3]],
  },
  { id: "restaurant", points: [[-1.4, 5.6], [-3.2, 3.6], [-5.0, 1.3]] },
];

/** Built ground kept clear of trees: [x, z, radius]. */
export const builtAreas: [number, number, number][] = [
  [layout.gatehouse.x, layout.gatehouse.z, 1.6],
  [layout.parking.x, layout.parking.z, 2.4],
  [layout.kids.x, layout.kids.z, 1.6],
  [layout.hotel.x, layout.hotel.z, 3.6],
  [layout.pool.x, layout.pool.z, 2.0],
  [layout.spa.x, layout.spa.z, 1.8],
  [layout.conference.x, layout.conference.z, 1.8],
  [layout.eventLawn.x, layout.eventLawn.z, 2.6],
  [layout.teaHouse.x, layout.teaHouse.z, 1.2],
  [layout.restaurant.x, layout.restaurant.z, 1.4],
  [layout.barbecue.x, layout.barbecue.z, 1.2],
  [layout.farm.x, layout.farm.z, 2.8],
  ...layout.villas.map((v) => [v.x, v.z, 1.1] as [number, number, number]),
];
