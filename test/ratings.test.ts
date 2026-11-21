import { buildRating, finalizeEvent, getPublicKey, parseRating, RATING_KIND, type EventTemplate } from "@nswp/core";
import { describe, expect, it } from "vitest";
import { plateMarks } from "../src/shared/plate.js";
import { countedFor, followsIn, giveRating, ratingMark, ratingWords, talliesFor } from "../src/shared/ratings.js";
import { checkedSigner } from "../src/shared/session.js";

/** Throwaway keys, made from a number: nobody's. */
const key = (n: number) => Uint8Array.from({ length: 32 }, (_, i) => ((n * 7 + i * 13 + 1) % 250) + 1);
const pk = (n: number) => getPublicKey(key(n));
const PUBLISHER = pk(90);
const ARCADE = { id: `37300:${PUBLISHER}:arcade`, url: "https://arcade.example/" };
const GROVE = { id: `37300:${PUBLISHER}:grove`, url: "https://grove.example/" };
const rate = (n: number, world: string, stars: number, extra: string[][] = []) => {
  const made = buildRating({ world, stars, now: 1_800_000_000 })!;
  return finalizeEvent({ ...made, tags: [...made.tags, ...extra] }, key(n));
};

describe("whose ratings count", () => {
  it("is the curators and the people the visitor follows, each once", () => {
    expect(countedFor([pk(1), pk(2)], [pk(2), pk(3), "not a key"])).toEqual([pk(1), pk(2), pk(3)]);
    expect(countedFor([], [])).toEqual([]);
  });

  it("reads who someone follows from their follow list, and nothing else in it", () => {
    expect(followsIn({ tags: [["p", pk(1)], ["p", pk(2), "wss://r.example"], ["p", pk(1)], ["p", "nonsense"], ["t", "art"], ["e", pk(3)]] })).toEqual([pk(1), pk(2)]);
    expect(followsIn(null)).toEqual([]);
  });
});

describe("a tally for each place on show", () => {
  const events = [rate(1, ARCADE.id, 5), rate(2, ARCADE.id, 4), rate(50, ARCADE.id, 1), rate(1, GROVE.id, 2, [["bitlogin:site", "https://grove.example"]])];

  it("counts only the people it was told to, and leaves out places nobody counted has rated", () => {
    const t = talliesFor(events, [ARCADE, GROVE], [pk(1), pk(2)], null);
    expect([...t.keys()]).toEqual([ARCADE.id]);
    expect(t.get(ARCADE.id)).toMatchObject({ count: 2, average: 4.5 });
  });

  it("drops a rating the place asked for itself", () => {
    // The Grove's one rating was signed at the Grove: it isn't counted, so the Grove has no tally at all.
    expect(talliesFor(events, [GROVE], [pk(1)], null).size).toBe(0);
  });

  it("is said with whose it is, and not at all when there is none", () => {
    const t = talliesFor(events, [ARCADE], [pk(1), pk(2)], null).get(ARCADE.id);
    expect(ratingMark(t)).toBe("★ 4.5 from 2");
    expect(ratingWords(t, true)).toBe("4.5 of 5, from 2 people you follow, or whose lists you use");
    expect(ratingWords(t, false)).toBe("4.5 of 5, from 2 of the curators whose lists are shown here");
    expect(ratingMark(null)).toBe("");
    expect(ratingWords(undefined, true)).toBe("");
    expect(ratingWords({ count: 1, average: 5 }, true)).toBe("5.0 of 5, from 1 person you follow, or whose lists you use");
    // Their own is said apart from the people they follow.
    expect(ratingWords({ count: 3, average: 4, mine: 4 }, true)).toBe("4.0 of 5, from you and 2 people you follow, or whose lists you use");
    expect(ratingWords({ count: 1, average: 4, mine: 4 }, true)).toBe("4.0 of 5: your own rating, and nobody else's yet");
  });

  it("shares a door's plate with a warning where items are part of the game there", () => {
    const fit = { ok: true, reason: "" };
    const world = { modes: ["inline-3d"], comfort: {}, contentWarning: undefined };
    expect(plateMarks({ ...world, items: "play" as const }, fit, false).find((m) => /Items/.test(m.text))).toEqual({ text: "Items in play", tone: "warn" });
    // A place where items simply work, which is one that says nothing too, has no mark: it is the ordinary rule.
    expect(plateMarks({ ...world, items: "allowed" as const }, fit, false).some((m) => /items/i.test(m.text))).toBe(false);
    expect(plateMarks(world, fit, false).some((m) => /items/i.test(m.text))).toBe(false);
    // One that has turned them off says so, plainly.
    expect(plateMarks({ ...world, items: "none" as const }, fit, false).find((m) => /items/i.test(m.text))).toEqual({ text: "No items", tone: "plain" });
  });

  it("goes on a door's plate first after what kind of place it is", () => {
    const fit = { ok: true, reason: "" };
    expect(plateMarks({ modes: ["inline-3d"], comfort: {}, contentWarning: undefined, category: "game" }, fit, false, "★ 4.5 from 2").map((m) => m.text)).toEqual(["A game", "★ 4.5 from 2", "3D"]);
    expect(plateMarks({ modes: ["inline-3d"], comfort: {}, contentWarning: undefined }, fit, false).map((m) => m.text)).toEqual(["3D"]);
  });
});

describe("giving one", () => {
  it("is signed by the visitor as a rating of that world, and nothing else", async () => {
    const asked: EventTemplate[] = [];
    const signer = checkedSigner(pk(7), {
      signEvent: async (t) => {
        asked.push(t);
        return finalizeEvent({ ...t, tags: [...t.tags, ["bitlogin:site", "https://portal.example"]] }, key(7));
      },
    }, "https://portal.example");
    const given = await giveRating(signer, [], ARCADE.id, 4);
    expect(asked).toHaveLength(1);
    expect(asked[0]!.kind).toBe(RATING_KIND);
    expect(parseRating(given!.event)).toMatchObject({ by: pk(7), world: ARCADE.id, stars: 4, askedAt: ["https://portal.example"] });
    expect(given!.took).toBe(0);
    // Signed at the visitor's own portal, it counts for the world.
    expect(talliesFor([given!.event], [ARCADE], [], pk(7)).get(ARCADE.id)).toMatchObject({ count: 1, mine: 4 });
  });

  it("is nothing if the stars aren't one to five, or the signer says no", async () => {
    const never = checkedSigner(pk(7), { signEvent: async () => Promise.reject(new Error("no")) });
    expect(await giveRating(never, [], ARCADE.id, 4)).toBeNull();
    expect(await giveRating(never, [], ARCADE.id, 9)).toBeNull();
  });
});
