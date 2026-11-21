import { describe, expect, it } from "vitest";
import bundle from "../src/starter/starter-set.json";
import { buildCatalog, type StarterBundle } from "../src/shared/catalog.js";
import { detectTier, deviceFit } from "../src/shared/device.js";
import { doorArt } from "../src/shared/door.js";
import { placeKind, plateMarks } from "../src/shared/plate.js";
import { decidePreview, pickPreview, sniffImage } from "../src/shared/preview.js";
import { finalizeEvent, getPublicKey, parseManifest, parseWorldEvent, verifyEvent, verifyOrigin, type NostrEvent } from "@nswp/core";
import { formToEvent, manifestFor, manifestLocation, slugify, validateForm, worldToForm, writeRelays, type WorldForm } from "../src/shared/publishing.js";
import { rankShelves } from "../src/shared/rank.js";
import { DEFAULT_ROOM, roomFromInput } from "../src/shared/room.js";
import { addSaved, parseLeft, parseSaved, refreshSaved, removeSaved, restoreSaved, savedEntries, SAVED_LIMIT, wallSlot } from "../src/shared/saved.js";
import { checkedSigner } from "../src/shared/session.js";
import { cleanRelays } from "../src/shared/settings.js";
import { plainShelf, shelfDefs, whySentence, type Candidate } from "../src/shared/shelves.js";

const starter = bundle as unknown as StarterBundle;

describe("catalogue", () => {
  it("builds from the bundled starter set, in the curator's order", () => {
    const c = buildCatalog(starter);
    // Nine worlds made for BitPortal and four existing sites the curator lists.
    expect(c.entries.length).toBe(13);
    expect(c.entries.map((e) => e.rank)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(c.entries[0]!.world.title).toBe("The Tour");
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
    expect(buildCatalog({ ...starter, worlds }).entries.length).toBe(12);
  });

  it("ignores a relay 'set' signed by anyone but the curator, and separates unlisted worlds", () => {
    const stranger = starter.worlds[0]!; // a valid event by another key, wrong kind for a set
    const c = buildCatalog(starter, [stranger, { kind: 30004, tags: [], content: "", pubkey: "f".repeat(64), id: "0".repeat(64), sig: "0".repeat(128), created_at: 9e9 }]);
    expect(c.entries.length).toBe(13);
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
    const known = new Set(["bitfeed.input", "bitfeed.recency", "bitfeed.random", "bitportal.curatorOrder", "bitportal.deviceFit", "bitportal.gentle", "bitportal.fitsDevice", "bitportal.notIntense", "bitportal.tastes", "bitportal.hasTopic"]);
    for (const def of shelfDefs("2026-11-17", ["art", "quiet"])) {
      const used = [...def.recipe.sources, ...(def.recipe.filters ?? []), ...(def.recipe.scorers ?? [])].map((p) => p.provider);
      expect(used.filter((p) => !known.has(p))).toEqual([]);
      const weights = (def.recipe.scorers ?? []).reduce((sum, s) => sum + (s.weight ?? 0), 0);
      expect(weights).toBeCloseTo(1, 5);
    }
  });

  it("explains a ranking with its two strongest reasons", () => {
    expect(whySentence([{ label: "its list ranks it highly", contribution: 0.6 }, { label: "exploration", contribution: 0.05 }, { label: "it runs on this device", contribution: 0.25 }])).toBe(
      "Here because its list ranks it highly and it runs on this device.",
    );
    expect(whySentence([{ label: "recency", contribution: 0.9 }])).toBe("Here because it is new.");
    // A scorer with nothing to say is not a reason, and doesn't take the place of one that has.
    expect(whySentence([{ label: "its list ranks it highly", contribution: 0.3 }, { label: "Tastes", contribution: 0.2 }, { label: "it runs on this device", contribution: 0.15 }])).toBe("Here because its list ranks it highly and it runs on this device.");
    expect(whySentence([{ label: "Tastes", contribution: 0.2 }])).toBe("");
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
    audience: "general",
    category: "",
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

// ------------------------------------------------------------------ previews

describe("previews (spec §5.8)", () => {
  const sha = "a".repeat(64);
  const pano = { url: "https://world.example.com/previews/a.webp", type: "pano" as const, sha256: sha };
  const flat = { url: "https://cdn.example.net/b.webp", type: "flat" as const, sha256: "b".repeat(64) };
  const world = { url: "https://world.example.com/", previews: [pano], modes: ["immersive-vr"], contentWarning: undefined as string | undefined };
  const chosen = { chosen: true, asked: false, doorOpen: false, mirror: {} };

  it("has nothing to show for a world without a preview", () => {
    expect(decidePreview({ ...world, previews: [] }, chosen).show).toBe("none");
  });
  it("serves a mirrored preview from BitPortal's own site", () => {
    const d = decidePreview(world, { ...chosen, mirror: { [sha]: { file: `${sha}.webp`, mime: "image/webp", bytes: 1 } } });
    expect(d).toMatchObject({ show: "now", from: "mirror", url: `/previews/${sha}.webp` });
  });
  it("never fetches from the world's own site while the door is closed", () => {
    expect(decidePreview(world, chosen).show).toBe("on-open");
    expect(decidePreview(world, { ...chosen, doorOpen: true })).toMatchObject({ show: "now", from: "origin" });
  });
  it("is stricter than the spec: other storage also waits for the door to open", () => {
    const stored = { ...world, previews: [{ ...pano, url: "https://cdn.example.net/a.webp" }] };
    expect(decidePreview(stored, chosen).show).toBe("on-open");
    expect(decidePreview(stored, { ...chosen, doorOpen: true })).toMatchObject({ show: "now", from: "storage" });
  });
  it("holds the preview of a world nobody chose until the visitor asks", () => {
    const mirror = { [sha]: { file: `${sha}.webp`, mime: "image/webp", bytes: 1 } };
    expect(decidePreview(world, { chosen: false, asked: false, doorOpen: true, mirror })).toMatchObject({ show: "ask", reason: "unreviewed" });
    expect(decidePreview(world, { chosen: false, asked: true, doorOpen: true, mirror }).show).toBe("now");
  });
  it("holds the preview of a world with a content warning, even a chosen one", () => {
    const warned = { ...world, contentWarning: "" };
    expect(decidePreview(warned, chosen)).toMatchObject({ show: "ask", reason: "content-warning" });
    expect(decidePreview(warned, { ...chosen, asked: true, doorOpen: true }).show).toBe("now");
  });
  it("prefers a 360° picture for places and a screenshot for web pages", () => {
    expect(pickPreview({ previews: [flat, pano], modes: ["inline-3d"] })?.type).toBe("pano");
    expect(pickPreview({ previews: [pano, flat], modes: ["2d"] })?.type).toBe("flat");
    expect(pickPreview({ previews: [flat], modes: ["immersive-vr"] })?.type).toBe("flat");
  });
  it("tells image types from their first bytes", () => {
    const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50]);
    expect(sniffImage(webp)).toBe("image/webp");
    expect(sniffImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(sniffImage(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'>"))).toBeNull();
  });
});

describe("door plate (spec §6.7)", () => {
  const fit = { ok: true, reason: "Runs on this device" };
  it("says what kind of place a world is", () => {
    expect(placeKind({ modes: ["immersive-vr", "inline-3d"] })).toBe("VR, 3D");
    expect(placeKind({ modes: ["2d"] })).toBe("Web page");
    expect(placeKind({ modes: [] })).toBe("");
  });
  it("always marks high intensity, content warnings and a poor device fit", () => {
    const marks = plateMarks({ modes: ["immersive-vr"], comfort: { intensity: "high" }, contentWarning: "" }, { ok: false, reason: "Needs a VR headset" }, true);
    expect(marks.map((m) => m.text)).toEqual(["VR", "Verified", "Needs a VR headset", "Intense", "Content warning"]);
    expect(marks.filter((m) => m.tone === "warn")).toHaveLength(3);
  });
  it("says first what kind of place its maker calls it, and nothing for a word it doesn't know", () => {
    expect(plateMarks({ modes: ["inline-3d"], comfort: {}, contentWarning: undefined, category: "game" }, fit, false).map((m) => m.text)).toEqual(["A game", "3D"]);
    expect(plateMarks({ modes: ["inline-3d"], comfort: {}, contentWarning: undefined, category: "casino" as never }, fit, false).map((m) => m.text)).toEqual(["3D"]);
  });
  it("says what a place does with the things visitors carry only where it isn't the ordinary rule", () => {
    const of = (items?: "none" | "allowed" | "play") => plateMarks({ modes: ["inline-3d"], comfort: {}, contentWarning: undefined, ...(items ? { items } : {}) }, fit, false);
    // Items work everywhere that hasn't said otherwise, so that is no mark at all.
    expect(of().map((m) => m.text)).toEqual(["3D"]);
    expect(of("allowed").map((m) => m.text)).toEqual(["3D"]);
    expect(of("play")).toContainEqual({ text: "Items in play", tone: "warn" });
    expect(of("none")).toContainEqual({ text: "No items", tone: "plain" });
    // A rule nobody knows is a place that turned them off, never one where they are the game.
    expect(of("anything-goes" as never)).toContainEqual({ text: "No items", tone: "plain" });
  });
  it("states a gentle world's intensity without alarm", () => {
    expect(plateMarks({ modes: ["inline-3d"], comfort: { intensity: "low" }, contentWarning: undefined }, fit, false)).toEqual([
      { text: "3D", tone: "plain" },
      { text: "Gentle", tone: "plain" },
    ]);
  });
});

describe("your doors (spec §14.1)", () => {
  const catalog = buildCatalog(starter);
  const [a, b, c] = catalog.entries as [(typeof catalog.entries)[0], (typeof catalog.entries)[0], (typeof catalog.entries)[0]];

  it("gives each saved place the first free place on the wall", () => {
    let list = addSaved([], a, 100);
    list = addSaved(list, b, 101);
    list = addSaved(list, c, 102);
    expect(list.map((s) => [s.id, s.slot])).toEqual([[a.id, 0], [b.id, 1], [c.id, 2]]);
    expect(addSaved(list, a, 103)).toBe(list); // already saved
  });

  it("never moves a door when another is removed, and reuses the gap", () => {
    let list = addSaved(addSaved(addSaved([], a, 1), b, 2), c, 3);
    list = removeSaved(list, a.id);
    expect(list.map((s) => [s.id, s.slot])).toEqual([[b.id, 1], [c.id, 2]]);
    list = addSaved(list, a, 4);
    expect(list.find((s) => s.id === a.id)!.slot).toBe(0);
    expect(list.map((s) => s.slot)).toEqual([0, 1, 2]);
  });

  it("puts a removed door back where it was, unless another took its place", () => {
    const full = addSaved(addSaved([], a, 1), b, 2);
    const removed = full.find((s) => s.id === a.id)!;
    const without = removeSaved(full, a.id);
    expect(restoreSaved(without, removed).find((s) => s.id === a.id)!.slot).toBe(0);
    const taken = addSaved(without, c, 3); // c takes the gap at 0
    expect(restoreSaved(taken, removed).find((s) => s.id === a.id)!.slot).toBe(2);
  });

  it("drops stored entries that are tampered with, mislabelled or repeated, and repairs places", () => {
    const good = addSaved(addSaved([], a, 1), b, 2);
    const stored = JSON.parse(JSON.stringify(good)) as typeof good;
    const raw = [
      stored[0],
      { ...stored[1]!, event: { ...stored[1]!.event, content: "changed" } }, // signature no longer matches
      { ...stored[0]!, id: b.id }, // says it is another world
      stored[0], // twice
      { id: c.id, event: c.event, savedAt: 5, slot: 0 }, // a place already taken
      "junk",
    ];
    const parsed = parseSaved(raw);
    expect(parsed.map((s) => [s.id, s.slot])).toEqual([[a.id, 0], [c.id, 1]]);
    expect(parseSaved("nope")).toEqual([]);
  });

  it("stops at the limit", () => {
    const many = Array.from({ length: SAVED_LIMIT }, (_, i) => ({ id: `x${i}`, event: a.event, savedAt: 0, slot: i }));
    expect(addSaved(many, a, 1)).toBe(many);
  });

  it("takes a newer announcement of a saved place, and only from the same publisher", () => {
    const list = addSaved([], a, 1);
    const sk = new Uint8Array(32).fill(7);
    const stranger = finalizeEvent({ kind: a.event.kind, created_at: a.event.created_at + 10, tags: a.event.tags, content: a.event.content }, sk);
    expect(refreshSaved(list, [stranger])).toBe(list);
    expect(refreshSaved(list, [a.event])).toBe(list); // not newer
  });

  it("draws saved places in wall order, using the catalogue's copy when it is as new", () => {
    const list = addSaved(addSaved([], b, 1), a, 2); // b at 0, a at 1
    const drawn = savedEntries(list, catalog);
    expect(drawn.map((e) => e.id)).toEqual([b.id, a.id]);
    expect(drawn[0]).toBe(catalog.entries.find((e) => e.id === b.id));
    // A saved place the catalogue doesn't know is still a door.
    const alone = savedEntries(list, { entries: [], unlisted: [] });
    expect(alone.map((e) => [e.id, e.rank])).toEqual([[b.id, null], [a.id, null]]);
  });

  it("stands the first places either side of the middle, then alternately outward", () => {
    expect([0, 1, 2, 3, 4].map(wallSlot)).toEqual([-0.5, 0.5, -1.5, 1.5, -2.5]);
  });

  it("only believes a well-formed note of the door a visitor left through", () => {
    expect(parseLeft('{"id":"37300:k:d","from":"walk"}')).toEqual({ id: "37300:k:d", from: "walk" });
    expect(parseLeft('{"id":"x","from":"elsewhere"}')).toBeNull();
    expect(parseLeft("not json")).toBeNull();
    expect(parseLeft(null)).toBeNull();
  });
});

describe("the room's layout (spec §4.5)", () => {
  it("has a default that draws", () => {
    expect(DEFAULT_ROOM.layout.room.template).toBe("open");
    expect(DEFAULT_ROOM.layout.items.length).toBeGreaterThan(0);
    expect(DEFAULT_ROOM.skipped).toBe(0);
  });

  it("takes a world template's home.json, keeping furniture and leaving out what would contact another site", () => {
    const room = roomFromInput({
      room: { template: "hall", color: "#e6cfa8", accent: "#c8553d" },
      items: [
        { type: "bench", position: [0, 0, -4] },
        { type: "frame", position: [0, 1.6, -8.8], args: ["https://example.org/a.jpg", "a".repeat(64)] },
        { type: "portal", position: [3, 0, -5], args: ["https://example.org/"] },
        { type: "note", position: [0, 2, -6], args: ["Hello"] },
      ],
    })!;
    expect(room.layout.items.map((i) => i.type)).toEqual(["bench", "note"]);
    expect(room.skipped).toBe(2);
    expect(room.layout.room.template).toBe("open"); // a hall's walls would stand across the doors
    expect(room.layout.room.accent).toBe("#c8553d");
  });

  it("refuses something that isn't a layout", () => {
    expect(roomFromInput({ hello: "world" })).toBeNull();
    expect(roomFromInput(null)).toBeNull();
    expect(roomFromInput("text")).toBeNull();
  });
});

import { decodeLook, generatedLook } from "@nswp/core";
import { inlineLook, lookOf, newSeed, parseKept, surprise } from "../src/shared/look.js";

describe("the visitor's look", () => {
  it("makes a seed by chance, in the form a look can carry", () => {
    const seed = newSeed();
    expect(seed).toMatch(/^g[0-9a-f]{24}$/);
    expect(newSeed()).not.toBe(seed);
  });

  it("reads back only what a kept look can hold", () => {
    expect(parseKept(null)).toBeNull();
    expect(parseKept("not json")).toBeNull();
    expect(parseKept('{"seed":"x"}')).toBeNull();
    expect(parseKept('{"seed":"g0123456789abcdef01234567","choices":{"head":"tall","evil":"<script>","color":"#102030"}}')).toEqual({ seed: "g0123456789abcdef01234567", choices: { head: "tall", color: "#102030" } });
  });

  it("draws a kept look as its seed gives it, with the choices on top", () => {
    const kept = { seed: "g0123456789abcdef01234567", choices: { head: "tall", body: "wings" } };
    const look = lookOf(kept);
    expect(look.head).toBe("tall");
    expect(look.body).toBe(generatedLook(kept.seed).body); // not on the list: the seed's own stays
    expect(look.mark).toBe(generatedLook(kept.seed).mark);
  });

  it("travels in a form a world reads back as the same look", () => {
    const kept = surprise({ seed: "g0123456789abcdef01234567", choices: {} }, () => 0.42);
    const read = decodeLook(inlineLook(kept));
    expect(read.ok && read.value.look).toEqual(lookOf(kept));
    expect(inlineLook(kept).length).toBeLessThan(600);
  });

  it("keeps the mark when everything else is changed by chance", () => {
    const kept = { seed: "g0123456789abcdef01234567", choices: {} };
    expect(lookOf(surprise(kept)).mark).toBe(lookOf(kept).mark);
  });
});

describe("who a world is for, on the Announce page", () => {
  const base = { url: "https://w.example/", id: "my-world", title: "W", summary: "", modes: ["inline-3d"], locomotion: "", intensity: "", seated: "", perf: "", topics: "", category: "", status: "live", rooms: false };

  it("has to be said: nothing is announced until its maker chooses", () => {
    expect(validateForm({ ...base, audience: "" }).map((i) => i.field)).toEqual(["audience"]);
    expect(validateForm({ ...base, audience: "everyone" }).map((i) => i.field)).toEqual(["audience"]);
    for (const audience of ["kids", "general", "adult"]) expect(validateForm({ ...base, audience })).toEqual([]);
  });

  it("goes into the announcement, with the warning other apps read when it is for adults", () => {
    const tags = (audience: string) => formToEvent({ ...base, audience }, 1).tags.filter((t) => t[0] === "audience" || t[0] === "content-warning");
    expect(tags("kids")).toEqual([["audience", "kids"]]);
    expect(tags("general")).toEqual([["audience", "general"]]);
    expect(tags("adult")).toEqual([["content-warning", "adult"], ["audience", "adult"]]);
  });

  it("says what kind of place it is only when its maker chose one from the list", () => {
    const said = (category: string) => formToEvent({ ...base, audience: "general", category }, 1).tags.filter((t) => t[0] === "category");
    expect(said("game")).toEqual([["category", "game"]]);
    expect(said("")).toEqual([]);
    expect(said("casino")).toEqual([]);
    expect(validateForm({ ...base, audience: "general", category: "" })).toEqual([]);
  });
});

describe("ranking by the hashtags a visitor likes", () => {
  const now = 1_800_000_000;
  const world = (id: string, rank: number, topics: string[], taste: number, tasteWhy = ""): Candidate => ({ id, createdAt: now - 86400, rank, total: 8, fits: true, intensity: "low", topics, taste, tasteWhy });
  // The lists put them in this order. The visitor likes #art and has said less #game.
  const cands = [
    world("arcade", 0, ["game"], 0),
    world("grove", 1, ["quiet"], 0.5),
    world("tour", 2, ["help"], 0.5),
    world("gallery", 3, ["art"], 1, "it has #art, which you asked for more of"),
    ...["a", "b", "c", "d"].map((n, i) => world(n, 4 + i, [], 0.5)),
  ];

  it("lifts a world with a hashtag they like, sinks one they don't, and says why", async () => {
    const start = (await rankShelves(cands, now, "2026-11-17", ["art"]))[0]!;
    const order = start.items.map((i) => i.id);
    // First on the lists, and now behind what it stood ahead of. It sinks; it isn't removed.
    expect(order.indexOf("gallery")).toBeLessThan(order.indexOf("arcade"));
    expect(order.indexOf("grove")).toBeLessThan(order.indexOf("arcade"));
    expect(order).toContain("arcade");
    expect(start.items.find((i) => i.id === "gallery")!.why).toMatch(/#art, which you asked for more of/);
    expect(start.items.find((i) => i.id === "arcade")!.why).not.toMatch(/asked for/);
  });

  it("gives each hashtag they like a shelf of its own, with only the worlds that carry it", async () => {
    const shelves = await rankShelves(cands, now, "2026-11-17", ["art", "nothing-has-this"]);
    const art = shelves.find((s) => s.id === "tag-art")!;
    expect(art.title).toBe("#art");
    expect(art.items.map((i) => i.id)).toEqual(["gallery"]);
    expect(shelves.find((s) => s.id === "tag-nothing-has-this")!.items).toEqual([]);
  });

  it("changes nothing for a visitor with no tastes", async () => {
    const plain = cands.map((c) => ({ ...c, taste: 0.5, tasteWhy: "" }));
    const withNone = (await rankShelves(plain, now, "2026-11-17"))[0]!.items.map((i) => i.id);
    expect(withNone[0]).toBe("arcade"); // the lists' own first choice
    expect((await rankShelves(plain, now, "2026-11-17")).some((s) => s.id.startsWith("tag-"))).toBe(false);
  });
});
