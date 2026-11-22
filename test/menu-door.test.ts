import { describe, expect, it } from "vitest";
import { buildWorldEvent, parseWorldEvent, type World, type WorldInput } from "@nswp/core";
import { menuDoor } from "../src/shared/menu-door.js";
import type { Entry } from "../src/shared/catalog.js";
import type { VerificationResult } from "../src/shared/verify.js";

const world = (more: Partial<WorldInput> = {}): World => {
  const parsed = parseWorldEvent(buildWorldEvent({ d: "w", title: "The Grove", url: "https://grove.example/", previews: [{ url: "https://grove.example/p.webp", type: "pano", sha256: "a".repeat(64) }], modes: ["immersive-vr"], capabilities: ["rooms", "voice"], ...more }));
  if (!parsed.ok) throw new Error("bad");
  return parsed.value;
};
const entry = (more: Partial<Entry> = {}): Entry => ({ id: "37300:k:w", world: world(), event: {} as Entry["event"], rank: 1, curatorListing: false, listedBy: null, ...more });
const checked = (state: VerificationResult["state"]): VerificationResult => ({ state, checkedAt: 1, listingDenied: false, failed: [] });

describe("a door on the room's list, in the menu's door details", () => {
  it("is its name, its address and what its world offers, the same as its tiles", () => {
    const d = menuDoor(entry(), null);
    expect(d).toMatchObject({ id: "37300:k:w", title: "The Grove", url: "https://grove.example/" });
    expect(d.offers!.filter((o) => o.on).map((o) => o.id)).toEqual(["headset", "people", "voice"]);
  });

  it("says whether its site vouches for it only from what this browser last found, and nothing when nobody looked", () => {
    expect(menuDoor(entry(), null).vouched).toBe("unknown");
    expect(menuDoor(entry(), checked("verified")).vouched).toBe("verified");
    expect(menuDoor(entry(), checked("listed")).vouched).toBe("listed");
    expect(menuDoor(entry(), checked("no-manifest")).vouched).toBe("listed");
  });

  it("a place a curator described has its curator named and no offers of its own", () => {
    const d = menuDoor(entry({ curatorListing: true, listedBy: "BitPortal's starter set" }), checked("no-manifest"));
    expect(d).toMatchObject({ vouched: "listed", listedBy: "BitPortal's starter set", offers: null });
  });
});
