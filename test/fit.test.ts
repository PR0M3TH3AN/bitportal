import { describe, expect, it } from "vitest";
import { cleanChecked, declared, fitFor, formOf } from "../src/shared/fit.js";

const both = { modes: ["immersive-vr", "inline-3d"], perf: "mobile" };
const vrOnly = { modes: ["immersive-vr"] };
const flat = { modes: ["inline-3d"], perf: "desktop" };

describe("the form a visitor is in", () => {
  it("is a headset for someone who left one to come, whatever else is said", () => {
    expect(formOf({ immersive: true, form: "touch", touchMain: true })).toBe("headset");
  });
  it("is how they are using a flat screen, when that is known, and the device's own otherwise", () => {
    expect(formOf({ form: "touch", touchMain: false })).toBe("phone");
    expect(formOf({ form: "desk", touchMain: true })).toBe("desk");
    expect(formOf({ form: undefined, touchMain: true })).toBe("phone");
    expect(formOf({ form: undefined, touchMain: false })).toBe("desk");
  });
});

describe("what a world's maker says", () => {
  it("is read from its modes and what it runs on", () => {
    expect([declared(both, "phone"), declared(both, "desk"), declared(both, "headset")]).toEqual([true, true, true]);
    expect([declared(vrOnly, "phone"), declared(vrOnly, "desk"), declared(vrOnly, "headset")]).toEqual([false, false, true]);
    expect([declared(flat, "phone"), declared(flat, "desk"), declared(flat, "headset")]).toEqual([false, true, false]);
  });
  it("is nothing where they say nothing", () => {
    expect(declared(null, "phone")).toBeNull();
    expect(declared({ modes: [] }, "headset")).toBeNull();
  });
});

describe("what a visitor is told", () => {
  it("puts what this copy found before what the maker says", () => {
    // Its maker says it runs on a phone. It didn't, when tried.
    const failed = fitFor(both, "phone", { phone: "fails", at: "2026-11-18" });
    expect(failed.tone).toBe("bad");
    expect(failed.text).toContain("2026-11-18");
    expect(fitFor(both, "phone", { phone: "works", at: "2026-11-18" }).tone).toBe("ok");
  });
  it("warns when the maker says it isn't for this, even if nothing was tried", () => {
    expect(fitFor(vrOnly, "phone")).toMatchObject({ tone: "warn", text: "Its maker says it is for VR headsets only." });
    expect(fitFor(flat, "phone")).toMatchObject({ tone: "warn", text: "Its maker says it needs a desktop computer." });
    expect(fitFor(flat, "headset").tone).toBe("warn");
  });
  it("never calls a maker's word a check", () => {
    const said = fitFor(both, "desk");
    expect(said.tone).toBe("plain");
    expect(said.text).toContain("hasn't confirmed");
    // Tried on a phone only: that says nothing of a headset.
    expect(fitFor(both, "headset", { phone: "works", at: "2026-11-18" }).tone).toBe("plain");
    expect(fitFor(null, "desk")).toMatchObject({ tone: "plain", short: "Not checked" });
  });
});

describe("what was found, as it is read", () => {
  it("keeps what it knows and drops the rest", () => {
    expect(cleanChecked({ phone: "works", desk: "fails", headset: "maybe", at: "2026-11-18", by: "x" })).toEqual({ phone: "works", desk: "fails", at: "2026-11-18" });
    for (const bad of [null, "works", {}, { phone: "works" }, { phone: "works", at: "yesterday" }]) expect(cleanChecked(bad)).toBeNull();
  });
});
