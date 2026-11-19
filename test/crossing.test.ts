import { describe, expect, it } from "vitest";
import { crossingFor, type CrossingFacts } from "../src/shared/crossing.js";

const known: CrossingFacts = { verified: true, onList: true, beenBefore: true, approved: false, askAlways: false, publisherChanged: false, warnings: 0, asking: 0, fit: "ok", setting: "known", held: false };

describe("how much of the Airlock a crossing needs", () => {
  it("is none, for a place the visitor knows and nothing has changed", () => {
    expect(crossingFor(known)).toBe("straight");
    expect(crossingFor({ ...known, fit: "plain" })).toBe("straight");
  });

  it("is all of it the first time, however good the world looks", () => {
    expect(crossingFor({ ...known, beenBefore: false })).toBe("ask");
  });

  it("is all of it when any one thing fails", () => {
    const failing: Partial<CrossingFacts>[] = [
      { verified: false },
      { publisherChanged: true },
      { warnings: 1 },
      { asking: 1 },
      { fit: "warn" },
      { fit: "bad" },
      { askAlways: true },
      { held: true },
      { onList: false },
      { setting: "ask" },
    ];
    for (const one of failing) expect(crossingFor({ ...known, ...one }), JSON.stringify(one)).toBe("ask");
  });

  it("never goes straight through to a world that isn't on this copy's list, even one they ticked", () => {
    expect(crossingFor({ ...known, onList: false, approved: true })).toBe("countdown");
  });

  it("keeps their own tick for one world, with a moment to change their mind, when they are asked every time", () => {
    expect(crossingFor({ ...known, setting: "ask", approved: true })).toBe("countdown");
    expect(crossingFor({ ...known, setting: "ask", approved: true, warnings: 1 })).toBe("ask");
    expect(crossingFor({ ...known, setting: "ask", approved: true, askAlways: true })).toBe("ask");
  });

  it("never lets a tick or a setting get past something that has to be seen", () => {
    for (const setting of ["known", "ask"] as const) {
      for (const seen of [{ publisherChanged: true }, { asking: 2 }, { verified: false }, { fit: "bad" as const }]) expect(crossingFor({ ...known, setting, approved: true, ...seen })).toBe("ask");
    }
  });
});
