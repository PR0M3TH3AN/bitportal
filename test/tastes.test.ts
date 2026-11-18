/** The hashtags a visitor likes and doesn't (src/shared/tastes.ts). */
import { describe, expect, it } from "vitest";
import { cleanTag, loadTastes, parseTastes, setTaste, storeTastes, TASTE_LIMIT, tasteFor, tasteOf } from "../src/shared/tastes.js";

describe("a hashtag", () => {
  it("is kept lowercase, without its #", () => {
    expect(cleanTag("#Gallery")).toBe("gallery");
    expect(cleanTag("  how-to ")).toBe("how-to");
    expect(cleanTag("##art")).toBe("art");
    expect(cleanTag("café")).toBe("café");
  });

  it("is never a phrase, a script or nothing", () => {
    for (const bad of ["", "#", "two words", "<b>", "a".repeat(41), 7, null, "tag\u202e"]) expect(cleanTag(bad), String(bad)).toBe("");
  });
});

describe("what a visitor likes", () => {
  it("is liked, disliked, or neither, and never two of them", () => {
    let t = setTaste({ like: [], dislike: [] }, "#Gallery", "like");
    expect(tasteOf(t, "gallery")).toBe("like");
    t = setTaste(t, "gallery", "dislike");
    expect(t).toEqual({ like: [], dislike: ["gallery"] });
    t = setTaste(t, "gallery", "none");
    expect(t).toEqual({ like: [], dislike: [] });
    expect(setTaste(t, "not a tag", "like")).toBe(t);
    expect(parseTastes({ like: ["art"], dislike: ["art", "game"] })).toEqual({ like: ["art"], dislike: ["game"] });
  });

  it("is a few at most, kept in this browser under its own name", () => {
    let t = { like: [] as string[], dislike: [] as string[] };
    for (let i = 0; i < TASTE_LIMIT + 5; i++) t = setTaste(t, `tag${i}`, "like");
    expect(t.like.length).toBe(TASTE_LIMIT);
    expect(t.like.at(-1)).toBe(`tag${TASTE_LIMIT + 4}`); // the newest are the ones kept
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    storeTastes(setTaste({ like: [], dislike: [] }, "art", "like"), storage);
    expect([...store.keys()]).toEqual(["bitportal:hashtags"]);
    expect(loadTastes(storage)).toEqual({ like: ["art"], dislike: [] });
    expect(loadTastes({ getItem: () => "{broken" })).toEqual({ like: [], dislike: [] });
    expect(parseTastes("nope")).toEqual({ like: [], dislike: [] });
  });
});

describe("how well a world suits them", () => {
  const tastes = { like: ["art", "quiet"], dislike: ["game"] };

  it("is more for a hashtag they like, and says which", () => {
    expect(tasteFor(tastes, ["sculpture", "Art"])).toEqual({ score: 1, why: "it has #art, which you asked for more of" });
  });

  it("is less for one they don't, even beside one they do", () => {
    expect(tasteFor(tastes, ["game"]).score).toBe(0);
    expect(tasteFor(tastes, ["art", "game"]).score).toBe(0);
  });

  it("is neither for a world with neither, and for a visitor with no tastes", () => {
    expect(tasteFor(tastes, ["sky"]).score).toBe(0.5);
    expect(tasteFor(tastes, []).score).toBe(0.5);
    expect(tasteFor({ like: [], dislike: [] }, ["art", "game"]).score).toBe(0.5);
  });
});
