/**
 * Where the room's doors stand (NSWP spec §14.1).
 *
 * Two walls of doors on a circle, facing its middle. How far apart two doors
 * stand is the kit's number and no other (`DOOR_SPACING`, through
 * `doorArcStep`): the same least distance every world keeps, so a door in
 * the room is never nearer its neighbour than a door anywhere else. The
 * owner, 2026-11-21: "Let's make sure there is a minimum distance separation
 * between each door."
 *
 * The room is as large as it has to be for a wall to show a dozen at that
 * spacing: no saved door leaves its wall or its place to make room.
 */
import { doorArcStep } from "nswp-sdk/three";
import { wallSlot } from "./saved.js";

/** Metres from the middle of the room to either wall of doors. Ten holds a dozen a wall; it was eight when doors stood 1.8 m apart. */
export const ROOM_RADIUS = 10;
/** The angle between neighbouring doors on a wall of the room, in radians. */
export const WALL_STEP = doorArcStep(ROOM_RADIUS);

export interface WallPlace {
  x: number;
  z: number;
  /** How far round the wall it stands, in radians: 0 is the wall's middle, and less is to the left. */
  theta: number;
}

const at = (theta: number, radius: number): WallPlace => ({ x: Math.sin(theta) * radius, z: -Math.cos(theta) * radius, theta });

/** Where the door in this place on a wall stands, facing the middle of the room: the visitor's own wall. The other wall is this one turned half round. */
export function wallPlace(slot: number): WallPlace {
  return at(wallSlot(slot) * WALL_STEP, ROOM_RADIUS);
}

/**
 * Where the sign past a wall's last door stands ("3 more on the list"): the
 * next place along, and never further round than the side of the room, where
 * it is as far from the other wall's last door as from its own.
 */
export function morePlace(shown: number): WallPlace {
  const theta = wallSlot(shown) * WALL_STEP;
  return at(Math.sign(theta) * Math.min(Math.abs(theta), Math.PI / 2), ROOM_RADIUS);
}

/** Doors in a row on a circle of this radius, centred on its middle, each the kit's spacing from the next: the landing page's picture of the room. */
export function arcRow(count: number, radius: number): WallPlace[] {
  const step = doorArcStep(radius);
  return Array.from({ length: Math.max(0, Math.floor(count)) }, (_, i) => at((i - (count - 1) / 2) * step, radius));
}
