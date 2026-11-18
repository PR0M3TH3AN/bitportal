/** Whether a world is fit to be the visitor's home (src/shared/home.ts). */
import { describe, expect, it } from "vitest";
import { buildWorldEvent, finalizeEvent, getPublicKey, type FetchManifestResult, type Manifest, type NostrEvent } from "@nswp/core";
import { checkHome, homeOf, loadHome, parseHome, storeHome, type HomeChoice } from "../src/shared/home.js";

const ME = new Uint8Array(32).fill(1);
const OTHER = new Uint8Array(32).fill(2);
const me = getPublicKey(ME);
const other = getPublicKey(OTHER);
const URL_ = "https://my-home.example/";

const announce = (key: Uint8Array, url = URL_, createdAt = 1_800_000_000, title = "My place") =>
  finalizeEvent(buildWorldEvent({ d: "my-home", title, url, modes: ["immersive-vr", "inline-3d"], createdAt } as never), key);
const manifest = (over: Partial<{ publisher: string; capabilities: string[]; modes: string[]; url: string }> = {}): Manifest => ({
  schema: "nswp/manifest/0.3",
  listing: "allow",
  publishers: { [over.publisher ?? me]: { worlds: ["my-home"] } },
  worlds: { "my-home": { entry: { url: over.url ?? URL_, modes: over.modes ?? ["immersive-vr", "inline-3d"] }, entryPoints: ["main-entrance"], capabilities: over.capabilities ?? ["webxr", "spatial-portals", "home"] } },
  relays: [],
});
const served = (m: Manifest | null) => async (url: string): Promise<FetchManifestResult> => ({ url: `${new URL(url).origin}/.well-known/nswp.json`, ...(m ? { manifest: m } : {}), issues: [], warnings: [] });
const deps = (m: Manifest | null, events: NostrEvent[]) => ({ relays: ["wss://relay.example"], fetchManifest: served(m), announcements: async () => events, now: () => 1_800_000_100 });
const failing = async (r: Promise<{ checks: { id: string; ok: boolean; must: boolean }[] }>) => (await r).checks.filter((c) => !c.ok && c.must).map((c) => c.id);

describe("a world that may be a home", () => {
  it("is one the visitor announced, whose site admits their key, and which says it can be", async () => {
    const r = await checkHome(URL_, me, deps(manifest(), [announce(ME)]));
    expect(r.fit).toBe(true);
    expect(r.checks.every((c) => c.ok)).toBe(true);
    expect(r.choice).toEqual({ url: URL_, origin: "https://my-home.example", owner: me, d: "my-home", title: "My place", chosenAt: 1_800_000_100 });
    // Typed without the https, as people type addresses.
    expect((await checkHome("my-home.example", me, deps(manifest(), [announce(ME)]))).fit).toBe(true);
  });

  it("is never one that only the site says is theirs: anyone can write a key into a manifest", async () => {
    expect(await failing(checkHome(URL_, me, deps(manifest(), [])))).toEqual(["announced"]);
    // And it is never told that the site's word makes it theirs.
    expect((await checkHome(URL_, me, deps(manifest(), []))).checks.find((c) => c.id === "admits")!.text).toMatch(/shows nothing/);
    // Nor one announced for them by somebody else's key.
    expect(await failing(checkHome(URL_, me, deps(manifest(), [announce(OTHER)])))).toEqual(["announced"]);
  });

  it("is never one that only they say is theirs: anyone can announce an address they don't run", async () => {
    const r = await checkHome(URL_, me, deps(manifest({ publisher: other }), [announce(ME)]));
    expect(r.fit).toBe(false);
    expect(r.choice).toBeUndefined();
    expect(await failing(Promise.resolve(r))).toEqual(["admits"]);
    // The site admits them, but for a different address than the one they announced.
    expect(await failing(checkHome(URL_, me, deps(manifest({ url: "https://my-home.example/elsewhere" }), [announce(ME)])))).toContain("admits");
  });

  it("has to say it can be a home, which is a promise of the way to their doors", async () => {
    expect(await failing(checkHome(URL_, me, deps(manifest({ capabilities: ["webxr", "rooms"] }), [announce(ME)])))).toEqual(["says-so"]);
  });

  it("has to be somewhere anyone can reach, and the visitor has to be signed in", async () => {
    for (const address of ["http://127.0.0.1:5173", "http://my-home.example", "javascript:alert(1)", ""]) expect((await checkHome(address, me, deps(manifest(), [announce(ME)]))).checks.map((c) => [c.id, c.ok]), address).toEqual([["address", false]]);
    expect(await failing(checkHome(URL_, null, deps(manifest(), [announce(ME)])))).toEqual(["signed-in"]);
    expect(await failing(checkHome(URL_, me, deps(null, [announce(ME)])))).toEqual(["answers"]);
  });

  it("may be one that can't be entered in a headset: that is said, and is theirs to decide", async () => {
    const r = await checkHome(URL_, me, deps(manifest({ modes: ["inline-3d"] }), [announce(ME, URL_, 1_800_000_000)]));
    expect(r.checks.find((c) => c.id === "headset")).toMatchObject({ ok: false, must: false });
    // The announcement has to agree with the site about modes for it to verify, so this one still does.
    expect(r.fit).toBe(true);
  });

  it("is judged by the newest thing they said about that address", async () => {
    const r = await checkHome(URL_, me, deps(manifest(), [announce(ME, URL_, 1_800_000_000, "Old name"), announce(ME, URL_, 1_800_000_050, "New name"), announce(ME, "https://elsewhere.example/", 1_800_000_090, "Another")]));
    expect(r.choice?.title).toBe("New name");
  });
});

describe("the choice", () => {
  const choice: HomeChoice = { url: URL_, origin: "https://my-home.example", owner: me, d: "my-home", title: "My place", chosenAt: 5 };

  it("is kept in this browser, and is the home of the key that made it and nobody else", () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };
    storeHome(choice, storage);
    expect([...store.keys()]).toEqual(["bitportal:home"]);
    expect(homeOf(loadHome(storage), me)).toEqual(choice);
    expect(homeOf(loadHome(storage), other)).toBeNull();
    expect(homeOf(loadHome(storage), null)).toBeNull();
    storeHome(null, storage);
    expect(loadHome(storage)).toBeNull();
  });

  it("is nothing when what was kept isn't a home", () => {
    for (const bad of [null, "home", {}, { ...choice, url: "http://plain.example" }, { ...choice, owner: "cd".repeat(32) }, { ...choice, d: "" }]) expect(parseHome(bad), JSON.stringify(bad)).toBeNull();
    expect(loadHome({ getItem: () => "{broken" })).toBeNull();
  });
});
