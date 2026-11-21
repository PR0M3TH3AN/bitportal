import { describe, expect, it } from "vitest";
import { DOOR_SPACING, doorsTooClose } from "nswp-sdk/three";
import { WALL_DOORS } from "../src/shared/saved.js";
import { arcRow, morePlace, ROOM_RADIUS, wallPlace, WALL_STEP } from "../src/shared/wall.js";

/** The other wall is the visitor's own, turned half round. */
const behind = (p: { x: number; z: number }) => ({ x: -p.x, z: -p.z });
const apart = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);

describe("where the room's doors stand", () => {
  const yours = Array.from({ length: WALL_DOORS }, (_, slot) => wallPlace(slot));
  const suggested = yours.map(behind);

  it("no two doors in the room are nearer than the kit's least distance, on a wall or between the two", () => {
    expect(doorsTooClose([...yours, ...suggested])).toEqual([]);
  });

  it("neighbours are exactly that far apart: the kit's number and no other", () => {
    const byAngle = [...yours].sort((a, b) => a.theta - b.theta);
    for (let i = 1; i < byAngle.length; i++) expect(apart(byAngle[i]!, byAngle[i - 1]!)).toBeCloseTo(DOOR_SPACING, 9);
  });

  it("a wall shows a dozen, and no door stands round the side of the room", () => {
    expect(WALL_DOORS).toBe(12);
    for (const p of yours) expect(Math.abs(p.theta)).toBeLessThan(Math.PI / 2);
    expect((WALL_DOORS - 1) * WALL_STEP).toBeLessThan(Math.PI);
  });

  it("a saved door's place is where it was, a step further out: the first two either side of the middle, then alternately left and right", () => {
    expect(yours.slice(0, 4).map((p) => Math.round((p.theta / WALL_STEP) * 2) / 2)).toEqual([-0.5, 0.5, -1.5, 1.5]);
    for (const p of yours) expect(Math.hypot(p.x, p.z)).toBeCloseTo(ROOM_RADIUS, 9);
  });

  it("the sign past a full wall's last door is clear of every door, on both walls", () => {
    const more = morePlace(WALL_DOORS);
    const moreBehind = behind(more);
    for (const door of [...yours, ...suggested]) {
      expect(apart(more, door)).toBeGreaterThan(1.8);
      expect(apart(moreBehind, door)).toBeGreaterThan(1.8);
    }
    expect(apart(more, moreBehind)).toBeGreaterThan(DOOR_SPACING);
    // On a wall shown short (a test aid), it is simply the next place along.
    expect(morePlace(2).theta).toBeCloseTo(wallPlace(2).theta, 9);
  });

  it("the landing page's picture of the room keeps the same distance", () => {
    for (const count of [1, 2, 5, 8]) {
      const row = arcRow(count, 11);
      expect(row).toHaveLength(count);
      expect(doorsTooClose(row)).toEqual([]);
      if (count > 1) expect(row[0]!.theta + row[count - 1]!.theta).toBeCloseTo(0, 9);
    }
  });
});
