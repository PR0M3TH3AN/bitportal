import { describe, expect, it } from "vitest";
import { DESK_KEY, FULL_KEY, INTENSE_KEY, keptSettings, loadPrefs, settingsToCarry, storePrefs } from "../src/shared/prefs.js";

const store = (first: Record<string, string> = {}) => {
  const kept = new Map<string, string>(Object.entries(first));
  return { kept, getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v), removeItem: (k: string) => void kept.delete(k) };
};

describe("what a visitor prefers in every world", () => {
  it("is nothing special until they say so", () => {
    expect(loadPrefs(store())).toEqual({ full: false, intense: false, look: 1, fov: null, pictures: true });
    expect(loadPrefs(null)).toEqual({ full: false, intense: false, look: 1, fov: null, pictures: true });
  });

  it("is kept where the kit keeps it, and read back the same", () => {
    const s = store();
    storePrefs({ full: true, intense: true, look: 1.5, fov: 90, pictures: false }, s);
    expect(s.kept.get(FULL_KEY)).toBe("1");
    expect(s.kept.get(INTENSE_KEY)).toBe("1");
    expect(JSON.parse(s.kept.get(DESK_KEY)!)).toEqual({ look: 1.5, fov: 90 });
    expect(loadPrefs(s)).toEqual({ full: true, intense: true, look: 1.5, fov: 90, pictures: false });
    expect(s.kept.get("nswp:pictures")).toBe("0");
    storePrefs({ full: false, intense: false, look: 1, fov: null, pictures: true }, s);
    expect(s.kept.has(FULL_KEY)).toBe(false);
    expect(s.kept.has(INTENSE_KEY)).toBe(false);
    expect(loadPrefs(s).fov).toBeNull();
  });

  it("reads anything out of range as the nearest thing a world can do", () => {
    expect(loadPrefs(store({ [DESK_KEY]: JSON.stringify({ look: 99, fov: 5 }) }))).toMatchObject({ look: 3, fov: 50 });
    expect(loadPrefs(store({ [DESK_KEY]: "not json" }))).toMatchObject({ look: 1, fov: null });
    expect(loadPrefs(store({ [DESK_KEY]: JSON.stringify({ look: "fast", fov: "wide" }) }))).toMatchObject({ look: 1, fov: null });
  });
});

describe("what goes through a door", () => {
  const kept = store({ [FULL_KEY]: "1", [INTENSE_KEY]: "1", [DESK_KEY]: JSON.stringify({ look: 2, fov: 100 }), "bitportal:sound": JSON.stringify({ music: 0.2, effects: 0.6, hearShared: true }), "nswp:ui": JSON.stringify({ scale: 1.25, motion: false, accent: "#fff" }) });

  it("is everything this browser keeps for them, and only what may travel", () => {
    const s = keptSettings(kept);
    expect(s).toEqual({ sound: { music: 0.2, effects: 0.6 }, text: 1.25, motion: false, full: true, intense: true, look: 2, fov: 100, pictures: true });
    // Hearing other people's music is a consent, not a setting: it never goes on a link.
    expect(JSON.stringify(s)).not.toContain("hearShared");
  });

  it("goes along from a door that says nothing, such as one on the front page", () => {
    expect(settingsToCarry(keptSettings(kept), undefined)).toMatchObject({ full: true, intense: true, look: 2, fov: 100 });
  });

  it("gives way to what the place they are leaving says they have now", () => {
    const on = settingsToCarry(keptSettings(kept), { full: false, sound: { music: 0.9 }, look: 0.5 });
    expect(on).toMatchObject({ full: false, intense: true, look: 0.5, fov: 100 });
    expect(on.sound).toEqual({ music: 0.9, effects: 0.6 });
  });

  it("says they prefer an unfilled screen and the casual way as plainly as the other", () => {
    expect(keptSettings(store())).toMatchObject({ full: false, intense: false, look: 1 });
    expect(keptSettings(store()).fov).toBeUndefined();
  });
});
