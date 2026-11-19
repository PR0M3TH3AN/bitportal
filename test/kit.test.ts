import { describe, expect, it } from "vitest";
import { crossingFor, type CrossingFacts } from "../src/shared/crossing.js";
import { kitNote } from "../src/shared/kit.js";

describe("saying how old a world's controls are", () => {
  it("says nothing of a world on the same kit, or a newer one", () => {
    expect(kitNote("0.21.0", true, "0.21.0")).toBeNull();
    expect(kitNote("0.21.4", true, "0.21.0")).toBeNull();
    expect(kitNote("0.30.0", true, "0.21.0")).toBeNull();
  });
  it("says an older one is older, which versions, and that it still works", () => {
    const note = kitNote("0.17.5", true, "0.21.0")!;
    expect(note).toContain("0.17.5");
    expect(note).toContain("0.21.0");
    expect(note).toContain("still works");
  });
  it("says when a world doesn't say, or says something that isn't a version", () => {
    expect(kitNote(undefined, true, "0.21.0")).toContain("doesn't say");
    expect(kitNote("<b>new</b>", true, "0.21.0")).toContain("doesn't say");
    // And never repeats what it was told when that wasn't a version.
    expect(kitNote("<b>new</b>", true, "0.21.0")).not.toContain("<b>");
  });
  it("says nothing of a site that hasn't adopted the protocol", () => {
    expect(kitNote(undefined, false, "0.21.0")).toBeNull();
    expect(kitNote("0.1.0", false, "0.21.0")).toBeNull();
  });
  it("is no part of deciding a crossing: nothing about a kit is among the facts that do", () => {
    const facts: CrossingFacts = { verified: true, onList: true, beenBefore: true, approved: false, askAlways: false, publisherChanged: false, warnings: 0, asking: 0, fit: "ok", setting: "known", held: false };
    expect(Object.keys(facts).some((k) => /kit/i.test(k))).toBe(false);
    expect(crossingFor(facts)).toBe("straight");
  });
});
