import { describe, expect, it } from "vitest";
import { NOTICE, rememberTold, TOLD_FOR, toldLately } from "../src/shared/notice.js";

const shelf = (start: Record<string, string> = {}) => {
  const kept = new Map(Object.entries(start));
  return { getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v), kept };
};
const DAY = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 10, 21);

describe("the notice that this is an early prototype", () => {
  it("someone never told is told, and a browser that keeps nothing was never told", () => {
    expect(toldLately(now, shelf())).toBe(false);
    expect(toldLately(now, null)).toBe(false);
    expect(toldLately(now, { getItem: () => { throw new Error("no storage"); }, setItem: () => {} })).toBe(false);
  });

  it("someone told is not told again for a good while, and then is", () => {
    const s = shelf();
    rememberTold(now, s);
    expect(toldLately(now, s)).toBe(true);
    expect(toldLately(now + 60 * DAY, s)).toBe(true);
    expect(toldLately(now + TOLD_FOR + DAY, s)).toBe(false);
    expect(TOLD_FOR).toBeGreaterThanOrEqual(30 * DAY);
  });

  it("what it remembers is a time under one name, and nothing about the visitor", () => {
    const s = shelf();
    rememberTold(now, s);
    expect([...s.kept.entries()]).toEqual([["bitportal:told-prototype", String(now)]]);
  });

  it("a time that hasn't come, or isn't a time, is not believed", () => {
    for (const said of [String(now + DAY), "yes", "", "-5", "NaN"]) expect(toldLately(now, shelf({ "bitportal:told-prototype": said })), said).toBe(false);
  });

  it("says what the owner asked it to say, in plain words, with one thing to press", () => {
    const all = `${NOTICE.title} ${NOTICE.words.join(" ")}`;
    for (const said of [/early/i, /prototype/i, /isn't ready for a lot of people/i, /aren't fully built/i, /proven at scale/i]) expect(all).toMatch(said);
    expect(typeof NOTICE.go).toBe("string");
  });

  it("is shown where someone arrives, and nowhere in the middle of a visit: never by the Airlock or the page that keeps the screen", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const uses = (file: string) => /prototypeNotice\(/.test(readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8"));
    expect(uses("lobby/main.ts")).toBe(true);
    expect(uses("walk/main.ts")).toBe(true);
    for (const file of ["go/airlock.ts", "shell/main.ts", "shell/panel.ts", "account/main.ts", "look/main.ts", "publish/main.ts"]) expect(uses(file), file).toBe(false);
    // And it is not kept with a profile, or anywhere but this browser.
    expect(readFileSync(new URL("../src/shared/sync.ts", import.meta.url), "utf8")).not.toMatch(/told-prototype/);
  });
});
