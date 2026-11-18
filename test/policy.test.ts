/** What this copy of BitPortal will and won't show (src/shared/instance.ts; NSWP spec §15). */
import { describe, expect, it } from "vitest";
import { buildListEvent, buildWorldEvent, finalizeEvent, getPublicKey, type NostrEvent } from "@nswp/core";
import bundle from "../src/starter/starter-set.json";
import { buildCatalog, type StarterBundle } from "../src/shared/catalog.js";
import { INSTANCE, OPEN_POLICY, type InstancePolicy } from "../src/shared/instance.js";
import { follow } from "../src/shared/lists.js";
import { savedEntries } from "../src/shared/saved.js";

const starter = bundle as unknown as StarterBundle;
const key = (n: number) => new Uint8Array(32).fill(n);
const OPERATOR = key(7);
const ALICE = key(1);
const BOB = key(2);
const operator = getPublicKey(OPERATOR);
const T = 1_800_000_000;
const world = (d: string, sk: Uint8Array, extra: Partial<Parameters<typeof buildWorldEvent>[0]> = {}, at = T): NostrEvent =>
  finalizeEvent(buildWorldEvent({ d, title: `World ${d}`, url: `https://${d}.example/`, createdAt: at, ...extra }), sk);
const list = (d: string, sk: Uint8Array, worlds: string[], at = T): NostrEvent => finalizeEvent(buildListEvent({ d, title: `List ${d}`, description: "", worlds, createdAt: at }), sk);
const id = (e: NostrEvent) => `37300:${e.pubkey}:${e.tags.find((t) => t[0] === "d")![1]}`;
/** A site run by OPERATOR that shows only what its operators list, and no adult worlds. */
const strict: InstancePolicy = { operators: [operator], allowList: "bitportal", allowListOnly: true, allowAdult: false };

const pond = world("pond", BOB, { audience: "general" });
const park = world("park", BOB, { audience: "kids" });
const club = world("club", BOB, { audience: "adult" });
const fog = world("fog", BOB, { contentWarning: "flashing lights" }); // warned, and doesn't say who it is for
const maze = world("maze", BOB, { contentWarning: "flashing lights", audience: "general" });
const plain = world("plain", BOB); // says nothing about itself
const stray = world("stray", ALICE, { audience: "general" }); // announced, and on nobody's list

describe("this site's own settings", () => {
  it("keep adult worlds out, and show only what its operator has listed", () => {
    expect(INSTANCE.allowAdult).toBe(false);
    expect(INSTANCE.allowListOnly).toBe(true);
    expect(INSTANCE.operators.length).toBeGreaterThan(0);
    for (const k of INSTANCE.operators) expect(k).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("the allow list", () => {
  const allow = list("bitportal", OPERATOR, [id(pond), id(park), id(club), id(fog), id(maze), id(plain)]);
  const events = [allow, pond, park, club, fog, maze, plain, stray];

  it("is a list the operator signed, under the agreed name, and nothing else", () => {
    const c = buildCatalog(starter, events, { policy: strict });
    expect(c.lists.filter((l) => !l.starter).map((l) => [l.pubkey, l.operator])).toEqual([[operator, true]]);
    expect(c.allowed.has(id(pond))).toBe(true);
    // Another name, another key, a bad signature: none of them is the allow list.
    for (const fake of [list("favourites", OPERATOR, [id(stray)]), list("bitportal", ALICE, [id(stray)]), { ...list("bitportal", OPERATOR, [id(stray)], T + 9), sig: "0".repeat(128) }]) {
      const c2 = buildCatalog(starter, [fake, stray], { policy: strict });
      expect(c2.allowed.has(id(stray))).toBe(false);
      expect(c2.entries.some((e) => e.id === id(stray))).toBe(false);
    }
  });

  it("is the newest one the operator signed", () => {
    const later = list("bitportal", OPERATOR, [id(park)], T + 50);
    const c = buildCatalog(starter, [...events, later], { policy: strict });
    expect(c.allowed.has(id(park))).toBe(true);
    expect(c.allowed.has(id(pond))).toBe(false);
    expect(c.operatorLists.map((e) => e.id)).toEqual([later.id]);
  });

  it("is known from an earlier visit before any relay answers", () => {
    const c = buildCatalog(starter, [pond], { policy: strict, operatorLists: [allow] });
    expect(c.entries.some((e) => e.id === id(pond))).toBe(true);
  });

  it("still counts the list this copy ships with, whether or not the visitor is showing it", () => {
    const shipped = buildCatalog(starter, [], { policy: strict });
    expect(shipped.entries.length).toBeGreaterThan(0);
    const away = buildCatalog(starter, [], { policy: strict, showStarter: false });
    expect(away.entries).toEqual([]);
    for (const e of shipped.entries) expect(away.allowed.has(e.id)).toBe(true);
  });
});

describe("what is shown", () => {
  const allow = list("bitportal", OPERATOR, [id(pond), id(park), id(club), id(fog), id(maze), id(plain)]);
  const events = [allow, pond, park, club, fog, maze, plain, stray];
  const shown = (c: ReturnType<typeof buildCatalog>) => c.entries.map((e) => e.world.d).filter((d) => ["pond", "park", "club", "fog", "maze", "plain", "stray"].includes(d));

  it("never includes a world that is for adults, whoever listed it", () => {
    const c = buildCatalog(starter, events, { policy: strict });
    // The adult world, and the one with a warning that doesn't say who it is for, are out. The warned one whose
    // maker says it is for everyone stays, and so does the one that says nothing: the operator listed it.
    expect(shown(c)).toEqual(["pond", "park", "maze", "plain"]);
    expect(c.withheld.adult).toBe(2);
    expect(c.permits(id(club), { audience: "adult" })).toBe(false);
    expect(c.permits(id(pond), { audience: "general" })).toBe(true);
  });

  it("never includes a world no operator listed: not from a list the visitor follows, and not from the shelf of the unlisted", () => {
    const theirs = follow([], list("mine", ALICE, [id(stray), id(pond)]), [stray, pond], 1);
    const c = buildCatalog(starter, events, { policy: strict, followed: theirs });
    expect(c.lists.some((l) => l.pubkey === getPublicKey(ALICE))).toBe(false);
    expect(shown(c)).not.toContain("stray");
    expect(c.unlisted).toEqual([]);
    expect(c.withheld.lists).toBe(1);
    expect(c.withheld.notListed).toBeGreaterThanOrEqual(1);
    expect(c.permits(id(stray), { audience: "general" })).toBe(false);
  });

  it("gives an operator the worlds waiting to be listed, adult ones among them, and still lists none of those", () => {
    const c = buildCatalog(starter, events, { policy: strict, operatorView: true });
    expect(c.unlisted.map((e) => e.world.d)).toContain("stray");
    expect(shown(c)).not.toContain("stray");
    expect(shown(c)).not.toContain("club");
  });

  it("doesn't show a door saved before the policy, if the policy wouldn't show it now", () => {
    const c = buildCatalog(starter, events, { policy: strict });
    const saved = [stray, club, pond].map((event, slot) => ({ id: id(event), event, slot, savedAt: 1 }));
    expect(savedEntries(saved as never, c).map((e) => e.world.d)).toEqual(["pond"]);
  });

  it("is everything, on a copy whose operator set no policy", () => {
    const theirs = follow([], list("mine", ALICE, [id(stray)]), [stray], 1);
    const c = buildCatalog(starter, events, { policy: OPEN_POLICY, followed: theirs });
    expect(c.entries.some((e) => e.world.d === "stray")).toBe(true);
    expect(c.unlisted.map((e) => e.world.d)).toContain("club"); // an adult world, shown where nothing forbids it
    expect(c.withheld).toEqual({ adult: 0, notListed: 0, lists: 0 });
  });
});
