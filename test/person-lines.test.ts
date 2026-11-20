import { achievementForWorld, finalizeEvent, getPublicKey, scoreForWorld, type NostrEvent } from "@nswp/core";
import { describe, expect, it } from "vitest";
import { homePersonLines, linesFor, type KnownWorld } from "../src/shared/person-lines.js";

// Throwaway keys, made here from plain numbers: nothing in this file is anyone's.
const key = (n: number) => Uint8Array.from({ length: 32 }, (_, i) => ((n * 11 + i * 7 + 3) % 250) + 1);
const pk = (n: number) => getPublicKey(key(n));
const ARCADE: KnownWorld = { id: `37300:${pk(90)}:arcade`, title: "The Arcade", url: "https://arcade.example/" };
const GROVE: KnownWorld = { id: `37300:${pk(90)}:grove`, title: "The Grove", url: "https://grove.example/" };
const T = 1_800_000_000;
const score = (by: number, n: number, o: { world?: KnownWorld; origin?: string; at?: number; title?: string; format?: "time" | "number" } = {}): NostrEvent =>
  finalizeEvent(scoreForWorld({ world: (o.world ?? ARCADE).id, board: "lantern-run", score: n, title: o.title ?? "Lantern Run", format: o.format ?? "time", origin: o.origin ?? "https://arcade.example", now: o.at ?? T })!, key(by));
const held = (by: number, id: string, title: string, o: { world?: KnownWorld; origin?: string; at?: number } = {}): NostrEvent =>
  finalizeEvent(achievementForWorld({ world: (o.world ?? ARCADE).id, id, title, origin: o.origin ?? "https://arcade.example", now: o.at ?? T })!, key(by));

describe("what someone has done, on their card at home", () => {
  it("says their newest score on each board, and what they show, world by world", () => {
    const events = [score(1, 50_000), score(1, 41_200, { at: T + 60 }), held(1, "first-lantern", "First light"), held(1, "all-twelve", "All twelve", { at: T + 5 })];
    expect(linesFor(events, pk(1), [ARCADE, GROVE])).toEqual(["In The Arcade: Lantern Run, 41.2 s", "In The Arcade: shows 2 achievements: First light, All twelve"]);
  });

  it("shows nothing that wasn't asked for at the world's own address, isn't theirs, or isn't really signed", () => {
    const elsewhere = score(1, 1, { origin: "https://cheat.example" });
    const someoneElses = score(2, 1);
    const forged = { ...score(2, 1), pubkey: pk(1) };
    const atAnotherWorldsAddress = held(1, "all-twelve", "All twelve", { world: GROVE, origin: "https://arcade.example" });
    expect(linesFor([elsewhere, someoneElses, forged, atAnotherWorldsAddress], pk(1), [ARCADE, GROVE])).toEqual([]);
  });

  it("shows nothing for a world this copy has no announcement of", () => {
    expect(linesFor([score(1, 41_200)], pk(1), [GROVE])).toEqual([]);
    expect(linesFor([score(1, 41_200)], pk(1), [])).toEqual([]);
  });

  it("reads a score that doesn't say how it counts as a plain number on a board known by its name", () => {
    const plain = finalizeEvent(scoreForWorld({ world: ARCADE.id, board: "main", score: 1200, origin: "https://arcade.example", now: T })!, key(1));
    expect(linesFor([plain], pk(1), [ARCADE])).toEqual(["In The Arcade: main, 1,200"]);
  });

  it("is a few lines at most", () => {
    const many = Array.from({ length: 12 }, (_, i) => finalizeEvent(scoreForWorld({ world: ARCADE.id, board: `board-${i}`, score: i, origin: "https://arcade.example", now: T })!, key(1)));
    expect(linesFor(many, pk(1), [ARCADE]).length).toBe(6);
  });

  it("asks relays about a person once, when their card is shown, and says when it has an answer", async () => {
    const asked: string[][] = [];
    const about = homePersonLines({
      relays: ["wss://one.example"],
      worlds: () => [ARCADE],
      query: async (_relays, filter) => {
        asked.push(filter.authors ?? []);
        return { events: [score(1, 41_200)], relays: { "wss://one.example": "eose" } };
      },
    });
    let told = 0;
    about.onChange(() => told++);
    expect(about.lines(pk(1))).toEqual([]);
    expect(about.lines(pk(1))).toEqual([]);
    await new Promise((r) => setTimeout(r, 0));
    expect(asked).toEqual([[pk(1)]]);
    expect(told).toBe(1);
    expect(about.lines(pk(1))).toEqual(["In The Arcade: Lantern Run, 41.2 s"]);
    expect(about.lines("not a key")).toEqual([]);
    expect(asked.length).toBe(1);
  });
});
