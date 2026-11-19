import { describe, expect, it } from "vitest";
import { LOOK_PARTS } from "@nswp/core";
import { colourName, LOOK_PALETTE, lookOf, nextOf, startingMode, stepLook, type KeptLook } from "../src/shared/look.js";

describe("signed in is signed in everywhere", () => {
  const base = { canName: true, hasLook: true, asGuest: false, last: "look" as const };
  it("goes by name to a site that may be told, with nothing chosen at the door", () => {
    expect(startingMode(base)).toBe("name");
    expect(startingMode({ ...base, last: "plain" })).toBe("name");
    expect(startingMode({ ...base, hasLook: false })).toBe("name");
  });
  it("never goes by name where it can't: not signed in, or a site that hasn't proved who it is", () => {
    expect(startingMode({ ...base, canName: false })).toBe("look");
    expect(startingMode({ ...base, canName: false, hasLook: false })).toBe("plain");
  });
  it("goes as a guest once they have said so, as they last went", () => {
    expect(startingMode({ ...base, asGuest: true })).toBe("look");
    expect(startingMode({ ...base, asGuest: true, last: "plain" })).toBe("plain");
    expect(startingMode({ ...base, asGuest: true, hasLook: false })).toBe("plain");
  });
});

describe("changing a look a step at a time", () => {
  const kept: KeptLook = { seed: "g0123456789abcdef01234567", choices: {} };
  it("goes round each list of parts and comes back to where it began", () => {
    for (const part of Object.keys(LOOK_PARTS) as (keyof typeof LOOK_PARTS)[]) {
      const began = lookOf(kept)[part];
      let now = kept;
      const seen = new Set<string>();
      for (let i = 0; i < LOOK_PARTS[part].length; i++) {
        now = stepLook(now, part);
        seen.add(String(lookOf(now)[part]));
      }
      expect(seen.size).toBe(LOOK_PARTS[part].length);
      expect(lookOf(now)[part]).toBe(began);
    }
  });
  it("steps a colour onto the list, and keeps the seed, which is the mark", () => {
    const next = stepLook(kept, "color");
    expect(next.seed).toBe(kept.seed);
    expect(LOOK_PALETTE.map((c) => c.hex)).toContain(lookOf(next).color);
    expect(LOOK_PALETTE.map((c) => c.name)).toContain(colourName(lookOf(next).color));
    // A colour from anywhere is called by the nearest one on the list.
    expect(colourName("#3ef0a1")).toBe("Mint");
    expect(colourName("not a colour")).toBe("Ink");
    expect(lookOf(stepLook(next, "color")).color).not.toBe(lookOf(next).color);
  });
  it("only ever chooses what the protocol lists", () => {
    let now = kept;
    for (let i = 0; i < 30; i++) now = stepLook(now, i % 2 ? "head" : "pattern");
    expect(LOOK_PARTS.head).toContain(lookOf(now).head);
    expect(LOOK_PARTS.pattern).toContain(lookOf(now).pattern);
  });
  it("goes round a list", () => {
    expect(nextOf(["a", "b", "c"], "c")).toBe("a");
    expect(nextOf(["a", "b", "c"], "nowhere")).toBe("a");
  });
});
