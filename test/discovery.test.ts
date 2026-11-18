/** Finding worlds beyond BitPortal's own list (NSWP-08). */
import { describe, expect, it } from "vitest";
import { buildListEvent, buildWorldEvent, encodeNaddr, finalizeEvent, getPublicKey, type NostrEvent } from "@nswp/core";
import bundle from "../src/starter/starter-set.json";
import { buildCatalog, UNLISTED_LIMITS, type StarterBundle } from "../src/shared/catalog.js";
import { commonTopics, matches, matchesQuery } from "../src/shared/find.js";
import { follow, FOLLOW_LIMIT, followedAuthors, KEPT_WORLDS, parseFollowed, readList, readListAddress, refreshFollowed, unfollow } from "../src/shared/lists.js";

const starter = bundle as unknown as StarterBundle;
const key = (n: number) => new Uint8Array(32).fill(n);
const ALICE = key(1);
const BOB = key(2);
const alice = getPublicKey(ALICE);
const bob = getPublicKey(BOB);
const T = 1_800_000_000;

const world = (d: string, sk: Uint8Array, extra: Partial<Parameters<typeof buildWorldEvent>[0]> = {}, at = T): NostrEvent =>
  finalizeEvent(buildWorldEvent({ d, title: `World ${d}`, url: `https://${d}.example/`, createdAt: at, ...extra }), sk);
const list = (d: string, sk: Uint8Array, worlds: string[], at = T, title = `List ${d}`): NostrEvent => finalizeEvent(buildListEvent({ d, title, description: "Chosen by hand.", worlds, createdAt: at }), sk);
const id = (e: NostrEvent) => `37300:${e.pubkey}:${e.tags.find((t) => t[0] === "d")![1]}`;

const pond = world("pond", BOB);
const hill = world("hill", BOB);
const cave = world("cave", ALICE); // Alice's own description of a place: her key wrote it
const quiet = list("quiet", ALICE, [id(pond), id(cave), `37300:${bob}:nowhere`]);

describe("following a list", () => {
  it("follows a signed list and keeps its worlds in the curator's order", () => {
    const f = follow([], quiet, [hill, cave, pond], 5);
    expect(f.length).toBe(1);
    expect(f[0]!.id).toBe(`30004:${alice}:quiet`);
    expect(f[0]!.worlds.map((w) => w.id)).toEqual([pond.id, cave.id]); // hill isn't on it
    expect(follow(f, quiet, [], 6).length).toBe(1); // following twice is following once
    expect(unfollow(f, f[0]!.id)).toEqual([]);
  });

  it("refuses anything that isn't a validly signed list", () => {
    expect(follow([], { ...quiet, content: "changed" }, [], 1)).toEqual([]);
    expect(follow([], pond, [], 1)).toEqual([]);
    expect(readList({ ...quiet, sig: "0".repeat(128) })).toBeNull();
  });

  it("stops at the limit", () => {
    let f = follow([], quiet, [], 1);
    for (let i = 0; i < FOLLOW_LIMIT + 2; i++) f = follow(f, list(`l${i}`, BOB, []), [], 2);
    expect(f.length).toBe(FOLLOW_LIMIT);
  });

  it("takes a newer copy only from the same key", () => {
    const f = follow([], quiet, [pond, cave], 1);
    const newer = list("quiet", ALICE, [id(cave), id(hill)], T + 10);
    const forged = list("quiet", BOB, [id(hill)], T + 99); // another key, same name: a different list
    const older = list("quiet", ALICE, [], T - 10);
    expect(refreshFollowed(f, [forged, older])).toBe(f);
    const next = refreshFollowed(f, [forged, newer, hill]);
    expect(next[0]!.event.id).toBe(newer.id);
    expect(next[0]!.worlds.map((w) => w.id)).toEqual([cave.id, hill.id]);
  });

  it("takes a world's newer announcement, and only a validly signed one", () => {
    const f = follow([], quiet, [pond, cave], 1);
    const pond2 = world("pond", BOB, { title: "The Pond, rebuilt" }, T + 5);
    const fake = { ...world("pond", BOB, {}, T + 50), content: "tampered" };
    const next = refreshFollowed(f, [fake, pond2]);
    expect(next[0]!.worlds[0]!.id).toBe(pond2.id);
    expect(refreshFollowed(next, [pond2])).toBe(next);
  });

  it("keeps only what checks out when read back from storage", () => {
    const f = follow([], quiet, [pond, cave], 1);
    const stored = JSON.parse(JSON.stringify(f));
    expect(parseFollowed(stored)).toEqual(f);
    stored[0].event.tags.push(["a", id(hill)]); // edited on disk: the signature no longer holds
    expect(parseFollowed(stored)).toEqual([]);
    expect(parseFollowed([{ id: "30004:x:y", event: pond }, null, 4])).toEqual([]);
  });

  it("keeps a bounded number of a list's announcements", () => {
    const many = Array.from({ length: KEPT_WORLDS + 5 }, (_, i) => world(`w${i}`, BOB));
    const big = list("big", ALICE, many.map(id));
    expect(follow([], big, many, 1)[0]!.worlds.length).toBe(KEPT_WORLDS);
  });

  it("knows whom to ask relays about", () => {
    expect(followedAuthors(follow([], quiet, [], 1)).sort()).toEqual([alice, bob].sort());
  });

  it("reads a list's address however it is written, and says what is wrong with anything else", () => {
    const naddr = encodeNaddr({ kind: 30004, pubkey: alice, identifier: "quiet", relays: ["wss://relay.example", "https://not-a-relay.example"] });
    const want = { address: { pubkey: alice, d: "quiet", relays: ["wss://relay.example"] } };
    expect(readListAddress(naddr)).toEqual(want);
    expect(readListAddress(`  nostr:${naddr} `)).toEqual(want);
    expect(readListAddress(`https://portal.example/?list=${naddr}`)).toEqual(want);
    expect(readListAddress(`30004:${alice}:quiet`)).toEqual({ address: { pubkey: alice, d: "quiet", relays: [] } });
    expect(readListAddress(encodeNaddr({ kind: 37300, pubkey: bob, identifier: "pond" }))).toEqual({ error: "That is the address of a world, not of a list." });
    expect("error" in readListAddress("naddr1notreal")).toBe(true);
    expect("error" in readListAddress("")).toBe(true);
    expect("error" in readListAddress("hello")).toBe(true);
  });
});

describe("a catalogue of several lists", () => {
  const followed = follow([], quiet, [pond, cave], 1);

  it("gives a followed list its own place after BitPortal's, and ranks every listed world once", () => {
    const c = buildCatalog(starter, [], { followed });
    expect(c.lists.map((l) => [l.title, l.starter])).toEqual([[c.curator.title, true], ["List quiet", false]]);
    expect(c.lists[1]!.ids).toEqual([id(pond), id(cave)]);
    expect(c.lists[1]!.missing).toBe(1); // "nowhere" was never announced
    expect(c.entries.length).toBe(14);
    expect(c.entries.map((e) => e.rank)).toEqual(c.entries.map((_, i) => i));
    expect(c.unlisted).toEqual([]);
  });

  it("says who wrote a description when a curator wrote it themselves", () => {
    const c = buildCatalog(starter, [], { followed });
    const byId = Object.fromEntries(c.entries.map((e) => [e.id, e]));
    expect(byId[id(cave)]).toMatchObject({ curatorListing: true, listedBy: "List quiet" });
    expect(byId[id(pond)]).toMatchObject({ curatorListing: false, listedBy: null });
    expect(c.entries.filter((e) => e.listedBy === c.curator.title).length).toBe(4);
  });

  it("lets the visitor put BitPortal's own list away", () => {
    const c = buildCatalog(starter, [], { followed, showStarter: false });
    expect(c.lists.map((l) => l.title)).toEqual(["List quiet"]);
    expect(c.entries.map((e) => e.id)).toEqual([id(pond), id(cave)]);
    // Its worlds are still announcements, so they turn up among the unlisted ones, a few per key.
    expect(c.unlisted.length).toBeGreaterThan(0);
    expect(c.unlisted.every((e) => e.rank === null)).toBe(true);
    const none = buildCatalog(starter, [], { showStarter: false });
    expect(none.lists).toEqual([]);
    expect(none.entries).toEqual([]);
  });

  it("counts a world on two lists once, and never shows a retired one", () => {
    const first = starter.worlds[0]!;
    const both = follow([], list("both", ALICE, [id(first), id(pond)]), [pond], 1);
    const c = buildCatalog(starter, [], { followed: both });
    expect(c.entries.length).toBe(13);
    expect(c.lists[1]!.ids).toEqual([id(first), id(pond)]);
    const closed = world("pond", BOB, { status: "retired" }, T + 1);
    const after = buildCatalog(starter, [closed], { followed: both });
    expect(after.lists[1]!.ids).toEqual([id(first)]);
    expect(after.unlisted).toEqual([]);
  });

  it("ignores a followed list that is BitPortal's own, or that doesn't check out", () => {
    const own = [{ id: `30004:${starter.curator}:x`, event: starter.set, worlds: [], followedAt: 0 }];
    expect(buildCatalog(starter, [], { followed: own }).lists.length).toBe(1);
    const bad = [{ ...followed[0]!, event: { ...quiet, content: "x" } }];
    expect(buildCatalog(starter, [], { followed: bad }).lists.length).toBe(1);
  });
});

describe("worlds nobody has listed", () => {
  it("shows them apart, newest first, a few per key", () => {
    const flood = Array.from({ length: 7 }, (_, i) => world(`spam${i}`, BOB, {}, T + i));
    const c = buildCatalog(starter, [...flood, world("cave", ALICE, {}, T - 100)]);
    expect(c.entries.length).toBe(12);
    expect(c.unlisted.map((e) => e.world.d)).toEqual(["spam6", "spam5", "spam4", "cave"]);
    expect(c.unlistedHeld).toBe(7 - UNLISTED_LIMITS.perKey);
  });

  it("drops a second claim on an address the visitor already has a door to", () => {
    const real = buildCatalog(starter).entries[0]!;
    const copycat = world("lookalike", BOB, { url: real.world.url, title: real.world.title });
    expect(buildCatalog(starter, [copycat]).unlisted).toEqual([]);
    // The same goes for an address the visitor saved for themselves.
    expect(buildCatalog(starter, [pond], { taken: ["https://pond.example/"] }).unlisted).toEqual([]);
    expect(buildCatalog(starter, [pond]).unlisted.length).toBe(1);
  });

  it("stops at the total", () => {
    const crowd = Array.from({ length: UNLISTED_LIMITS.total + 9 }, (_, i) => world("only", key(10 + i), { url: `https://w${i}.example/` }, T + i));
    const c = buildCatalog(starter, crowd);
    expect(c.unlisted.length).toBe(UNLISTED_LIMITS.total);
    expect(c.unlistedHeld).toBe(9);
  });
});

describe("finding a world on the page", () => {
  const garden = { title: "The Café Garden", url: "https://garden.example.org/", summary: "Tea among the roses.", topics: ["garden", "quiet"], languages: ["en", "fr"] };

  it("matches every word, wherever it is, whatever the case or accents", () => {
    expect(matchesQuery(garden, "")).toBe(true);
    expect(matchesQuery(garden, "cafe")).toBe(true);
    expect(matchesQuery(garden, "ROSES garden")).toBe(true);
    expect(matchesQuery(garden, "example.org")).toBe(true);
    expect(matchesQuery(garden, "quiet fr")).toBe(true);
    expect(matchesQuery(garden, "garden racing")).toBe(false);
  });

  it("narrows by topic as well", () => {
    expect(matches(garden, { query: "tea", topic: "quiet" })).toBe(true);
    expect(matches(garden, { query: "tea", topic: "game" })).toBe(false);
    expect(matches(garden, { query: "", topic: "" })).toBe(true);
  });

  it("offers the topics that more than one world shares, commonest first", () => {
    const worlds = [{ topics: ["art", "quiet"] }, { topics: ["quiet", "game"] }, { topics: ["quiet", "art", "art"] }, { topics: ["solo"] }];
    expect(commonTopics(worlds)).toEqual(["quiet", "art"]);
    expect(commonTopics(worlds, 1)).toEqual(["quiet"]);
  });
});

// ------------------------------------------------------------------ identity
import { verifyRoomPass, PASS_LIMITS } from "@nswp/core";
import { issuePass } from "../src/shared/pass.js";
import { checkedSigner } from "../src/shared/session.js";

describe("issuing a pass (NSWP-10)", () => {
  const signer = checkedSigner(alice, { signEvent: async (t) => finalizeEvent(t, ALICE) });
  const SITE = "https://grove.example";

  it("makes a throwaway key and a pass a world will believe, and gives away nothing else", async () => {
    const { pass, sessionKey } = await issuePass(signer, { origin: `${SITE}/somewhere`, name: "  Alice \n" }, { now: T });
    expect(pass.pubkey).toBe(alice);
    expect(sessionKey).toMatch(/^[0-9a-f]{64}$/);
    const session = getPublicKey(Uint8Array.from(sessionKey.match(/../g)!.map((b) => parseInt(b, 16))));
    const read = verifyRoomPass(pass, { origin: SITE, session, now: T + 30 });
    expect(read.ok && read.value).toMatchObject({ pubkey: alice, name: "Alice", expiresAt: T + PASS_LIMITS.defaultTtlSec });
    // Good at that site and nowhere else, and not for anyone else's session key.
    expect(verifyRoomPass(pass, { origin: "https://other.example", session, now: T + 30 }).ok).toBe(false);
    expect(verifyRoomPass(pass, { origin: SITE, session: bob, now: T + 30 }).ok).toBe(false);
    expect(JSON.stringify(pass)).not.toContain(sessionKey);
  });

  it("uses a new key every trip", async () => {
    const a = await issuePass(signer, { origin: SITE }, { now: T });
    const b = await issuePass(signer, { origin: SITE }, { now: T });
    expect(a.sessionKey).not.toBe(b.sessionKey);
    expect(a.pass.tags.some((t) => t[0] === "name")).toBe(false);
  });

  it("refuses to hand over a pass the signer tampered with or signed as someone else", async () => {
    const asBob = checkedSigner(alice, { signEvent: async (t) => finalizeEvent(t, BOB) });
    await expect(issuePass(asBob, { origin: SITE }, { now: T })).rejects.toMatchObject({ code: "wrong_identity" });
    const meddling = checkedSigner(alice, { signEvent: async (t) => finalizeEvent({ ...t, tags: t.tags.map((x) => (x[0] === "nswp:origin" ? ["nswp:origin", "https://evil.example"] : x)) }, ALICE) });
    await expect(issuePass(meddling, { origin: SITE }, { now: T })).rejects.toMatchObject({ code: "event_altered" });
  });

  it("never lets the session key be the identity key", async () => {
    await expect(issuePass(signer, { origin: SITE }, { now: T, random: (b) => b.set(ALICE) })).rejects.toMatchObject({ code: "no_session_key" });
  });
});
