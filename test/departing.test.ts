import { describe, expect, it } from "vitest";

/**
 * A visitor who chose to move the intense way in a headset kept it in the room, and lost it at every door: the room
 * ended the headset session and only then asked how they were moving, which by then was the desk's answer
 * (found 2026-11-21; NSWP docs/backlog/headset-casual-and-intense.md). The room is a page with a renderer, which a unit
 * test can't run, so this holds the order where it is written: how they move is read before any session is ended,
 * and the Airlock is told what was read then.
 */
const source = async () => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL("../src/walk/main.ts", import.meta.url), "utf8");
};

describe("how a visitor moves goes with them through a door, as it was in the headset", () => {
  it("is read before every headset session is ended on the way out", async () => {
    const text = await source();
    const ends = [...text.matchAll(/await renderer\.xr\.getSession\(\)\?\.end\(\);/g)].map((m) => m.index!);
    expect(ends.length).toBeGreaterThanOrEqual(2);
    for (const at of ends) {
      // The way out this end belongs to: from the nearest function start before it to the next location.assign.
      const before = text.slice(Math.max(0, at - 1200), at);
      const after = text.slice(at, text.indexOf("location.assign(", at) + 400);
      expect(before, "read before the session ends").toMatch(/const going = departing\(\);/);
      expect(after, "what was read is what the Airlock is told").toMatch(/\.\.\.going/);
      expect(after, "nothing asks again after the session has ended").not.toMatch(/movingFlag\(\)|currentForm\(\)|currentSettings\(\)/);
    }
  });

  it("is one helper that says moving, form and settings together", async () => {
    const text = await source();
    expect(text).toMatch(/const departing = \(\) => \(\{ \.\.\.movingFlag\(\), form: currentForm\(\), settings: currentSettings\(\) \}\);/);
  });
});
