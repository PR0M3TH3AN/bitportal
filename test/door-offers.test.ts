import { describe, expect, it } from "vitest";
import { buildWorldEvent, DOOR_OFFERS, parseWorldEvent, type World, type WorldInput } from "@nswp/core";
import { doorOffers, placeKind, placeKindBesideTiles, plateMarks } from "../src/shared/plate.js";

const world = (more: Partial<WorldInput> = {}): World => {
  const parsed = parseWorldEvent(buildWorldEvent({ d: "w", title: "W", url: "https://w.example/", previews: [{ url: "https://w.example/p.webp", type: "pano", sha256: "a".repeat(64) }], ...more }));
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.errors));
  return parsed.value;
};
const fits = { ok: true, reason: "" };
const texts = (w: World, tiles: boolean) => plateMarks(w, fits, false, "", tiles).map((m) => m.text);

describe("the tiles beside a door in the room", () => {
  it("are the kit's own list, read from the world's own announcement", () => {
    const offered = doorOffers({ world: world({ modes: ["immersive-vr", "inline-3d"], capabilities: ["rooms", "saves"], items: "allowed" }), curatorListing: false })!;
    expect(offered.filter((o) => o.onDoor).map((o) => o.id)).toEqual([...DOOR_OFFERS]);
    expect(offered.filter((o) => o.on).map((o) => o.id)).toEqual(["headset", "people", "items", "saves"]);
  });

  it("a place a curator described for its maker has no tiles: lit or dark, they would be someone else's word", () => {
    expect(doorOffers({ world: world({ modes: ["immersive-vr"], capabilities: ["rooms", "voice"] }), curatorListing: true })).toBeNull();
  });

  it("a world that says nothing has every tile, all dark", () => {
    const offered = doorOffers({ world: world(), curatorListing: false })!;
    expect(offered.length).toBeGreaterThan(0);
    expect(offered.some((o) => o.on)).toBe(false);
  });
});

describe("a plate beside tiles doesn't say what the tiles say", () => {
  it("drops the kind of screen where a tile says it, and keeps what no tile says", () => {
    const vr = world({ modes: ["immersive-vr", "inline-3d"], category: "game" });
    expect(texts(vr, false)).toContain("VR, 3D");
    expect(texts(vr, true)).not.toContain("VR, 3D");
    expect(texts(vr, true)).toContain(texts(vr, false)[0]!); // what kind of place it is stays
    expect(placeKindBesideTiles(world({ modes: ["2d"] }))).toBe("Web page");
    expect(placeKindBesideTiles(world({ modes: ["immersive-ar", "inline-3d"] }))).toBe("AR");
    expect(placeKindBesideTiles(world({ modes: ["inline-3d"] }))).toBe("");
    expect(placeKindBesideTiles(world({ modes: ["2d", "inline-3d"] }))).toBe("");
  });

  it("a plate with no tiles beside it says what it always did: the list on the front page is unchanged", () => {
    const vr = world({ modes: ["immersive-vr", "inline-3d"] });
    expect(plateMarks(vr, fits, false, "")).toEqual(plateMarks(vr, fits, false, "", false));
    expect(placeKind(vr)).toBe("VR, 3D");
  });

  it("cautions stay on the plate whatever the tiles say: items in play is a warning, not an offer", () => {
    expect(texts(world({ items: "play", modes: ["immersive-vr"] }), true)).toContain("Items in play");
    expect(texts(world({ contentWarning: "flashing", modes: ["immersive-vr"] }), true)).toContain("Content warning");
  });

  it("a tile tapped with a finger keeps saying what it means until the next press, as a mouse resting on it would", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const room = readFileSync(new URL("../src/walk/main.ts", import.meta.url), "utf8");
    expect(room).toContain('if (thing?.tile && e.pointerType === "touch") tappedTile = thing;');
    expect(room).toContain("pointed = under() ?? tappedTile;");
    expect(room).toMatch(/if \(gameControls\(\)\) return;\n    tappedTile = null;/);
  });
});
