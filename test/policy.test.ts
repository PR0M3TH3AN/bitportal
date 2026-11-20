/** What this copy of BitPortal will and won't show (src/shared/instance.ts; NSWP spec §15). */
import { describe, expect, it } from "vitest";
import { buildListEvent, buildWorldEvent, finalizeEvent, getPublicKey, type NostrEvent } from "@nswp/core";
import bundle from "../src/starter/starter-set.json";
import { buildCatalog, type StarterBundle } from "../src/shared/catalog.js";
import { INSTANCE, OPEN_POLICY, sendsPass, type InstancePolicy } from "../src/shared/instance.js";
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

describe("where this copy's visitors sign from inside a world", () => {
  it("is BitLogin's own site, an https address, and every arrival says so", async () => {
    const { signerAt } = await import("@nswp/core");
    expect(INSTANCE.signer).toBe("https://bitlogin.network/");
    expect(signerAt(INSTANCE.signer)).toEqual({ origin: "https://bitlogin.network", signer: "https://bitlogin.network/signer/", window: "https://bitlogin.network/connect/" });
    // Both ways the Airlock sends someone to a world carry it: through a door, and home.
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const airlock = readFileSync(new URL("../src/go/airlock.ts", import.meta.url), "utf8");
    expect(airlock.split("buildArrivalUrl(").length - 1).toBe(airlock.split("signer: INSTANCE.signer").length - 1);
    // BitPortal has no signer of its own, and no page of it may be embedded by another site.
    const build = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");
    expect(build).not.toContain("frame-ancestors https:");
    expect(build).not.toMatch(/signer\/main|connect\/main/);
  });
});

describe("where a visitor signs in to BitPortal itself (owner's decision, 2026-11-19)", () => {
  it("is the sign-in address's own window: no page of BitPortal has a sign-in form, and none loads BitLogin's widget", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    for (const page of ["account", "publish", "go", "walk", "lobby", "look"]) {
      const html = readFileSync(new URL(`../src/${page}/index.html`, import.meta.url), "utf8");
      expect(html, page).not.toContain("<bitlogin-auth");
      expect(html, page).not.toContain("/vendor/bitlogin/");
      expect(html, page).not.toMatch(/type="password"/);
    }
    // Only the session module reaches for BitLogin, and only for its client: never its widget or its headless signer.
    const session = readFileSync(new URL("../src/shared/session.ts", import.meta.url), "utf8");
    expect(session).toContain("/vendor/bitlogin/bitlogin-client.js");
    expect(session).not.toMatch(/bitlogin-headless|bitlogin-session|bitlogin\.js/);
  });
  it("may embed that one address and no other, runs no WebAssembly, and still may be embedded by nobody", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const build = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");
    expect(build).toContain("`frame-src ${signInOrigin}`");
    expect(build.split("frame-src").length - 1).toBe(1);
    expect(build).toContain(`"script-src 'self'"`);
    expect(build).not.toContain("wasm-unsafe-eval");
    expect(build).toContain(`"frame-ancestors 'none'"`);
    // The address in the policy is read from this instance's own settings, as the one named to worlds.
    expect(/^\s*signer:\s*"(https:\/\/[^"]+)"/m.exec(readFileSync(new URL("../src/shared/instance.ts", import.meta.url), "utf8"))?.[1]).toBe(INSTANCE.signer);
  });
  it("leaves the Airlock waiting on nobody: it reads this browser's own note, and loads nothing from the sign-in address to do it", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const airlock = readFileSync(new URL("../src/go/airlock.ts", import.meta.url), "utf8");
    expect(airlock).toContain("knownSignedIn()");
    expect(airlock).not.toContain("readSignedIn");
  });
});

describe("who says who a visitor is, at a world (NSWP-10, A pass from the signer)", () => {
  it("is their sign-in address, where this host names one: the Airlock sends no pass", () => {
    expect(INSTANCE.signer).toBe("https://bitlogin.network/");
    expect(sendsPass()).toBe(false);
    // A host that names none vouches for its visitors at each door, as before.
    expect(sendsPass({})).toBe(true);
  });

  it("holds in the Airlock: going by name is offered, and a pass signed, only where one is sent", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const airlock = readFileSync(new URL("../src/go/airlock.ts", import.meta.url), "utf8");
    expect(airlock).toContain("const signsThere = !sendsPass();");
    expect(airlock).toContain("const canName = !!who && verified && !signsThere;");
    // The one place a pass is signed is behind that.
    expect(airlock.match(/issuePass\(/g)).toHaveLength(1);
    expect(airlock).toContain('if (how === "name" && who && canName) {');
  });
});
