import { describe, expect, it } from "vitest";
import bundle from "../src/starter/starter-set.json";
import { buildCatalog, type StarterBundle } from "../src/shared/catalog.js";
import { detectTier, deviceFit } from "../src/shared/device.js";
import { doorArt } from "../src/shared/door.js";
import { finalizeEvent, getPublicKey, parseManifest, parseWorldEvent, verifyEvent, verifyOrigin, type NostrEvent } from "@nswp/core";
import { formToEvent, manifestFor, manifestLocation, slugify, validateForm, worldToForm, writeRelays, type WorldForm } from "../src/shared/publishing.js";
import { rankShelves } from "../src/shared/rank.js";
import { checkedSigner } from "../src/shared/session.js";
import { cleanRelays } from "../src/shared/settings.js";
import { plainShelf, shelfDefs, whySentence, type Candidate } from "../src/shared/shelves.js";

const starter = bundle as unknown as StarterBundle;

describe("catalogue", () => {
  it("builds from the bundled starter set, in the curator's order", () => {
    const c = buildCatalog(starter);
    expect(c.entries.length).toBe(6);
    expect(c.entries.map((e) => e.rank)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(c.curator.title).toContain("starter set");
    expect(c.entries.filter((e) => e.curatorListing).length).toBe(4);
    expect(c.unlisted).toEqual([]);
  });

  it("rejects a starter set whose signature or curator doesn't check out", () => {
    expect(() => buildCatalog({ ...starter, set: { ...starter.set, content: "tampered" } })).toThrow();
    expect(() => buildCatalog({ ...starter, curator: "0".repeat(64) })).toThrow();
  });

  it("drops tampered world events and keeps the rest", () => {
    const worlds = starter.worlds.map((w, i) => (i === 0 ? { ...w, content: "changed" } : w));
    expect(buildCatalog({ ...starter, worlds }).entries.length).toBe(5);
  });

  it("ignores a relay 'set' signed by anyone but the curator, and separates unlisted worlds", () => {
    const stranger = starter.worlds[0]!; // a valid event by another key, wrong kind for a set
    const c = buildCatalog(starter, [stranger, { kind: 30004, tags: [], content: "", pubkey: "f".repeat(64), id: "0".repeat(64), sig: "0".repeat(128), created_at: 9e9 }]);
    expect(c.entries.length).toBe(6);
    expect(c.curator.updatedAt).toBe(starter.set.created_at);
  });
});

describe("device fit", () => {
  it("guesses the device tier from the browser's description", () => {
    expect(detectTier("Mozilla/5.0 (X11; Linux x86_64; Quest 3) OculusBrowser/40", true)).toBe("standalone");
    expect(detectTier("Mozilla/5.0 (Linux; Android 14) Mobile Safari", true)).toBe("mobile");
    expect(detectTier("Mozilla/5.0 (X11; Linux x86_64) Chrome/140", false)).toBe("desktop");
    expect(detectTier("Mozilla/5.0 (iPhone)", undefined)).toBe("mobile");
  });

  it("says when a world needs a headset or a stronger device", () => {
    const desktop = { vr: false, tier: "desktop" as const };
    const quest = { vr: true, tier: "standalone" as const };
    expect(deviceFit({ modes: ["immersive-vr"] }, desktop)).toEqual({ ok: false, reason: "Needs a VR headset" });
    expect(deviceFit({ modes: ["immersive-vr", "inline-3d"] }, desktop).ok).toBe(true);
    expect(deviceFit({ modes: ["immersive-vr"], perf: "desktop" }, quest)).toEqual({ ok: false, reason: "Built for more powerful devices" });
    expect(deviceFit({ modes: ["immersive-vr"], perf: "mobile" }, quest).ok).toBe(true);
    expect(deviceFit({ modes: [] }, desktop)).toEqual({ ok: true, reason: "" });
  });
});

describe("door art", () => {
  it("is stable for one world and differs between worlds", () => {
    expect(doorArt("37300:a:x")).toEqual(doorArt("37300:a:x"));
    expect(doorArt("37300:a:x")).not.toEqual(doorArt("37300:a:y"));
    const art = doorArt("37300:a:x");
    expect(art.glowX).toBeGreaterThanOrEqual(22);
    expect(art.glowX).toBeLessThanOrEqual(78);
  });
});

describe("shelves", () => {
  const cands: Candidate[] = [
    { id: "a", createdAt: 100, rank: 0, total: 3, fits: true, intensity: "low" },
    { id: "b", createdAt: 300, rank: 1, total: 3, fits: false, intensity: "high" },
    { id: "c", createdAt: 200, rank: 2, total: 3, fits: true, intensity: null },
  ];

  it("plain mode is date order with no explanations", () => {
    const s = plainShelf(cands);
    expect(s.items.map((i) => i.id)).toEqual(["b", "c", "a"]);
    expect(s.items.every((i) => i.why === "")).toBe(true);
  });

  it("every recipe names only providers BitPortal registers or BitFeed ships", () => {
    const known = new Set(["bitfeed.input", "bitfeed.recency", "bitfeed.random", "bitportal.curatorOrder", "bitportal.deviceFit", "bitportal.gentle", "bitportal.fitsDevice", "bitportal.notIntense"]);
    for (const def of shelfDefs("2026-11-17")) {
      const used = [...def.recipe.sources, ...(def.recipe.filters ?? []), ...(def.recipe.scorers ?? [])].map((p) => p.provider);
      expect(used.filter((p) => !known.has(p))).toEqual([]);
      const weights = (def.recipe.scorers ?? []).reduce((sum, s) => sum + (s.weight ?? 0), 0);
      expect(weights).toBeCloseTo(1, 5);
    }
  });

  it("explains a ranking with its two strongest reasons", () => {
    expect(whySentence([{ label: "the starter set ranks it highly", contribution: 0.6 }, { label: "exploration", contribution: 0.05 }, { label: "it runs on this device", contribution: 0.25 }])).toBe(
      "Here because the starter set ranks it highly and it runs on this device.",
    );
    expect(whySentence([{ label: "recency", contribution: 0.9 }])).toBe("Here because it is new.");
    expect(whySentence([{ label: "x", contribution: 0 }])).toBe("");
  });
});

describe("settings", () => {
  it("keeps only wss relays, without duplicates", () => {
    expect(cleanRelays(["wss://nos.lol/", "wss://nos.lol", "https://x.example", "ws://insecure.example", "not a url", " wss://relay.primal.net "])).toEqual(["wss://nos.lol", "wss://relay.primal.net"]);
  });
});

describe("ranking with the vendored BitFeed", () => {
  const now = 1_800_000_000;
  const day = 86400;
  const cands: Candidate[] = [
    { id: "first", createdAt: now - 40 * day, rank: 0, total: 4, fits: true, intensity: "low" },
    { id: "second", createdAt: now - 30 * day, rank: 1, total: 4, fits: true, intensity: null },
    { id: "ride", createdAt: now - 1 * day, rank: 2, total: 4, fits: true, intensity: "high" },
    { id: "headset-only", createdAt: now - 2 * day, rank: 3, total: 4, fits: false, intensity: "low" },
  ];

  it("composes every shelf and explains each item", async () => {
    const shelves = await rankShelves(cands, now, "2026-11-17");
    expect(shelves.map((s) => s.id)).toEqual(["start", "gentle", "new"]);
    const start = shelves[0]!;
    expect(start.items.length).toBe(4);
    expect(start.items[0]!.id).toBe("first"); // curator order dominates
    expect(start.items[0]!.why).toMatch(/^Here because .+\.$/);
  });

  it("keeps intense and ill-fitting worlds off the gentle shelf", async () => {
    const gentle = (await rankShelves(cands, now, "2026-11-17"))[1]!;
    expect(gentle.items.map((i) => i.id).sort()).toEqual(["first", "second"]);
    expect(gentle.items[0]!.id).toBe("first");
  });

  it("orders the newest shelf by date and respects its limit", async () => {
    const newest = (await rankShelves([...cands, { id: "old", createdAt: now - 300 * day, rank: 4, total: 5, fits: true, intensity: null }], now, "2026-11-17"))[2]!;
    expect(newest.items.map((i) => i.id)).toEqual(["ride", "headset-only", "second", "first"]);
  });

  it("is reproducible for the same day", async () => {
    const a = await rankShelves(cands, now, "2026-11-17");
    const b = await rankShelves(cands, now, "2026-11-17");
    expect(a).toEqual(b);
  });
});

describe("publishing a world", () => {
  const key = new Uint8Array(32).fill(7);
  const pubkey = getPublicKey(key);
  const form: WorldForm = {
    url: "https://museum.example/world",
    id: "example-museum",
    title: "Example Museum",
    summary: "Three wings of rotating exhibitions.",
    modes: ["immersive-vr", "inline-3d"],
    locomotion: "teleport",
    intensity: "low",
    seated: "supported",
    perf: "standalone",
    topics: "Art, #museum art",
    status: "beta",
    rooms: true,
  };

  it("makes readable IDs from names", () => {
    expect(slugify("  The Café: Night Garden!  ")).toBe("the-cafe-night-garden");
    expect(slugify("東京")).toBe("");
  });

  it("validates the form in plain language", () => {
    expect(validateForm(form)).toEqual([]);
    const bad = validateForm({ ...form, url: "http://museum.example/", title: " ", id: "Bad ID", modes: [] });
    expect(bad.map((i) => i.field).sort()).toEqual(["id", "modes", "title", "url"]);
  });

  it("builds an announcement that parses, signs and round-trips to the form", async () => {
    const signer = checkedSigner(pubkey, { signEvent: async (t) => finalizeEvent(t, key) });
    const signed = await signer.signEvent(formToEvent(form, 1_800_000_000));
    expect(verifyEvent(signed)).toBe(true);
    const parsed = parseWorldEvent(signed, { requireSigned: true });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.warnings).toEqual([]);
    expect(parsed.value.topics).toEqual(["art", "museum"]);
    expect(parsed.value.capabilities).toEqual(["webxr", "rooms"]);
    expect(worldToForm(parsed.value)).toEqual({ ...form, topics: "art, museum" });
  });

  it("writes a manifest that makes the announcement verify", async () => {
    const signed = finalizeEvent(formToEvent(form, 1_800_000_000), key);
    const world = parseWorldEvent(signed);
    const manifest = parseManifest(manifestFor(pubkey, form, null, ["wss://relay.example"]));
    expect(manifest.ok && world.ok).toBe(true);
    if (!manifest.ok || !world.ok) return;
    expect(manifest.warnings).toEqual([]);
    expect(manifestLocation(form.url)).toBe("https://museum.example/.well-known/nswp.json");
    expect(verifyOrigin(world.value, manifest.value, manifestLocation(form.url)).verified).toBe(true);
  });

  it("keeps what an existing manifest already lists", () => {
    const other = "a".repeat(64);
    const existing = parseManifest({ schema: "nswp/manifest/0.3", listing: "deny", publishers: { [other]: { worlds: ["old"] } }, worlds: { old: { entry: { url: "https://museum.example/old" }, entry_points: ["door"] } }, relays: ["wss://kept.example"] });
    if (!existing.ok) throw new Error("fixture");
    const m = manifestFor(pubkey, form, existing.value, ["wss://relay.example"]) as { listing: string; publishers: Record<string, { worlds: string[] }>; worlds: Record<string, { entry_points?: string[] }>; relays: string[] };
    expect(m.listing).toBe("deny");
    expect(m.publishers[other]).toEqual({ worlds: ["old"] });
    expect(m.publishers[pubkey]).toEqual({ worlds: ["example-museum"] });
    expect(m.worlds.old?.entry_points).toEqual(["door"]);
    expect(m.relays).toEqual(["wss://kept.example"]);
  });

  it("publishes to a person's own write relays, falling back to BitPortal's", () => {
    const list = (created_at: number, tags: string[][]): NostrEvent => ({ kind: 10002, pubkey, created_at, tags, content: "", id: "0".repeat(64), sig: "0".repeat(128) });
    const lists = [list(10, [["r", "wss://old.example"]]), list(20, [["r", "wss://both.example/"], ["r", "wss://read.example", "read"], ["r", "wss://write.example", "write"], ["r", "http://bad.example"]])];
    expect(writeRelays(lists, pubkey, ["wss://fallback.example"])).toEqual({ relays: ["wss://both.example", "wss://write.example"], fromOwnList: true });
    expect(writeRelays([], pubkey, ["wss://fallback.example"])).toEqual({ relays: ["wss://fallback.example"], fromOwnList: false });
    expect(writeRelays([list(5, [["r", "wss://someone-else.example"]])].map((e) => ({ ...e, pubkey: "b".repeat(64) })), pubkey, ["wss://fallback.example"]).fromOwnList).toBe(false);
  });
});

describe("signers are checked, not trusted", () => {
  const key = new Uint8Array(32).fill(7);
  const pubkey = getPublicKey(key);
  const template = { kind: 1, created_at: 1_800_000_000, tags: [["t", "x"]], content: "hello" };

  it("rejects a signature from another identity", async () => {
    const other = new Uint8Array(32).fill(9);
    await expect(checkedSigner(pubkey, { signEvent: async (t) => finalizeEvent(t, other) }).signEvent(template)).rejects.toMatchObject({ code: "wrong_identity" });
  });

  it("rejects an event the signer altered", async () => {
    await expect(checkedSigner(pubkey, { signEvent: async (t) => finalizeEvent({ ...t, content: "changed" }, key) }).signEvent(template)).rejects.toMatchObject({ code: "event_altered" });
  });

  it("rejects something that isn't a valid signed event", async () => {
    await expect(checkedSigner(pubkey, { signEvent: async () => ({ nope: true }) }).signEvent(template)).rejects.toMatchObject({ code: "bad_signature" });
  });
});
