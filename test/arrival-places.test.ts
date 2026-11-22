// Places to arrive in the room (NSWP-01, "Places to arrive"): eight round where the visitor arrived, so that if they
// join inside someone the kit steps them, and only them, to a clear one.
import { describe, expect, it } from "vitest";
import { ENTRY_PLACES_ROOMS, entryPlaces, pickEntryPlace } from "@nswp/core";

const read = async (path: string) => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("arriving in the room", () => {
  it("tells the kit's presence where they arrived: eight places round the spot, inside the room", async () => {
    const room = await read("src/walk/main.ts");
    expect(room).toContain("entryPlaces({ position: [arrivedAt.x, 0, arrivedAt.z], yaw: arrivedAt.yaw }, ENTRY_PLACES_ROOMS)");
    expect(room).toMatch(/createPresence\(\{ scene, camera, rig, renderer, controllers, arrival: \(\) =>/);
    expect(room).toContain("arrivedAt = { x: rig.position.x, z: rig.position.z, yaw: THREE.MathUtils.radToDeg(rig.rotation.y) };");
  });

  it("with someone on the spot, the next visitor's place is the first clear one, a metre or more away", () => {
    const places = entryPlaces({ position: [0, 0, 0], yaw: 180 }, ENTRY_PLACES_ROOMS);
    expect(places).toHaveLength(8);
    const i = pickEntryPlace(places, [[0, 0]], (x, z) => Math.hypot(x, z) <= 10);
    expect(i).toBe(1);
    expect(Math.hypot(places[i]!.position[0], places[i]!.position[2])).toBeGreaterThanOrEqual(1);
  });
});
