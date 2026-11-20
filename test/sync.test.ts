import { describe, expect, it } from "vitest";
import { finalizeEvent, getConversationKey, getPublicKey, nip44Decrypt, nip44Encrypt, verifyEvent, type NostrEvent } from "@nswp/core";
import { emptyNote, loadSync, merge, noteText, NOTE_LIMIT, readNote, reconcileSaved, SECTIONS, SETTINGS_D, SETTINGS_KIND, snapshot, storeSync, SYNC_KEY, syncOnce, WANTED_KEY, type Shelf, type Snapshot, type Vault } from "../src/shared/sync.js";

/** A browser's storage. */
const browser = (start: Record<string, string> = {}) => {
  const kept = new Map(Object.entries(start));
  return { kept, getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v), removeItem: (k: string) => void kept.delete(k) };
};
/** A profile, as a throwaway key that signs and seals to itself. Nothing here is a real identity. */
const profile = (seed: number): Vault => {
  const secret = new Uint8Array(32).fill(seed);
  const pubkey = getPublicKey(secret);
  const key = getConversationKey(secret, pubkey);
  return { pubkey, sign: async (t) => finalizeEvent(t, secret), seal: async (text) => nip44Encrypt(text, key), open: async (note) => nip44Decrypt(note.content, key) };
};
/** The relays, as one shelf that keeps the newest note for each key. */
const relays = () => {
  const notes = new Map<string, NostrEvent>();
  const shelf: Shelf = {
    fetch: async (pubkey) => notes.get(pubkey) ?? null,
    put: async (event) => {
      if (!verifyEvent(event)) return false;
      notes.set(event.pubkey, event);
      return true;
    },
  };
  return { notes, shelf };
};
const on = (b: ReturnType<typeof browser>) => storeSync(b, { ...loadSync(b), on: true });
const door = (d: string, slot: number) => ({ id: `37300:${"a".repeat(64)}:${d}`, slot, savedAt: 1 });
const savedWith = (...doors: { id: string; slot: number; savedAt: number }[]) => JSON.stringify(doors.map((p) => ({ ...p, event: { id: p.id, fake: true } })));

describe("keeping settings with a profile", () => {
  it("does nothing until the visitor turns it on", async () => {
    const b = browser({ "bitportal:settings": '{"airlock":"ask"}' });
    const r = relays();
    expect(await syncOnce({ store: b, vault: profile(1), shelf: r.shelf })).toMatchObject({ sent: false, why: "off" });
    expect(r.notes.size).toBe(0);
  });

  it("sends what a browser has, sealed so that nothing in it can be read off the relay", async () => {
    const b = browser({ "bitportal:settings": '{"airlock":"ask"}', "bitportal:blocked": JSON.stringify([{ key: "b".repeat(64), at: 5, where: "grove.example" }]) });
    on(b);
    const r = relays();
    const me = profile(1);
    expect((await syncOnce({ store: b, vault: me, shelf: r.shelf, now: 1000 })).sent).toBe(true);
    const note = r.notes.get(me.pubkey)!;
    expect(note.kind).toBe(SETTINGS_KIND);
    expect(note.tags).toEqual([["d", SETTINGS_D]]);
    for (const secret of ["airlock", "grove.example", "b".repeat(64), "blocked", "settings"]) expect(note.content).not.toContain(secret);
    // And only that key opens it.
    await expect(profile(2).open(note)).rejects.toThrow();
    expect(readNote(await me.open(note)).settings?.value).toBe('{"airlock":"ask"}');
  });

  it("brings a second device up to the first, and never the other way on its first sync", async () => {
    const r = relays();
    const me = profile(1);
    const first = browser({ "bitportal:settings": '{"airlock":"ask"}', "nswp:ui": '{"scale":1.25}', "bitportal:fps": "1" });
    on(first);
    await syncOnce({ store: first, vault: me, shelf: r.shelf, now: 1000 });
    // A new browser, with defaults of its own that it has never been told to keep.
    const second = browser({ "bitportal:settings": '{"airlock":"known"}' });
    on(second);
    const out = await syncOnce({ store: second, vault: me, shelf: r.shelf, now: 2000 });
    expect(out.took.sort()).toEqual(["moving", "settings", "ui"]);
    expect(second.getItem("bitportal:settings")).toBe('{"airlock":"ask"}');
    expect(second.getItem("nswp:ui")).toBe('{"scale":1.25}');
    expect(second.getItem("bitportal:fps")).toBe("1");
    expect(out.sent).toBe(false);
  });

  it("after that, keeps whichever device changed a setting last, a section at a time", async () => {
    const r = relays();
    const me = profile(1);
    const a = browser({ "bitportal:settings": '{"airlock":"ask"}', "nswp:ui": '{"scale":1}' });
    const b = browser();
    on(a);
    on(b);
    await syncOnce({ store: a, vault: me, shelf: r.shelf, now: 1000 });
    await syncOnce({ store: b, vault: me, shelf: r.shelf, now: 2000 });
    // Each changes a different thing.
    a.setItem("bitportal:settings", '{"airlock":"known"}');
    b.setItem("nswp:ui", '{"scale":1.5}');
    await syncOnce({ store: a, vault: me, shelf: r.shelf, now: 3000 });
    await syncOnce({ store: b, vault: me, shelf: r.shelf, now: 4000 });
    await syncOnce({ store: a, vault: me, shelf: r.shelf, now: 5000 });
    for (const dev of [a, b]) {
      expect(dev.getItem("bitportal:settings")).toBe('{"airlock":"known"}');
      expect(dev.getItem("nswp:ui")).toBe('{"scale":1.5}');
    }
  });

  it("sends nothing when nothing changed, however often it is asked", async () => {
    const r = relays();
    const me = profile(1);
    const a = browser({ "bitportal:settings": '{"airlock":"ask"}' });
    on(a);
    await syncOnce({ store: a, vault: me, shelf: r.shelf, now: 1000 });
    const id = r.notes.get(me.pubkey)!.id;
    for (const now of [2000, 3000, 4000]) expect((await syncOnce({ store: a, vault: me, shelf: r.shelf, now })).sent).toBe(false);
    expect(r.notes.get(me.pubkey)!.id).toBe(id);
  });

  it("never sends what belongs to one device", async () => {
    const local = { "bitportal:approved": '{"x":true}', "bitportal:publisher-pins": '{"https://a.example":"p"}', "bitportal:airlock-ask": "{}", "bitportal:travel-mic": "1", "bitportal:computers": "[1]", "bitportal:my-worlds": "[2]", "bitportal:go-as": "name", "bitportal:jukebox": "[3]" };
    const a = browser({ ...local, "bitportal:sound": '{"music":0,"hearShared":true}' });
    on(a);
    const r = relays();
    const me = profile(1);
    await syncOnce({ store: a, vault: me, shelf: r.shelf, now: 1000 });
    const text = await me.open(r.notes.get(me.pubkey)!);
    for (const never of ["approved", "publisher", "airlock-ask", "travel-mic", "computers", "my-worlds", "go-as", "jukebox", "hearShared"]) expect(text).not.toContain(never);
    expect(SECTIONS.map((s) => s.key).filter((k) => Object.keys(local).includes(k))).toEqual([]);
    // Hearing other people's music stays as it was said on each device.
    const b = browser({ "bitportal:sound": '{"music":0.45,"hearShared":false}' });
    on(b);
    await syncOnce({ store: b, vault: me, shelf: r.shelf, now: 2000 });
    expect(JSON.parse(b.getItem("bitportal:sound")!)).toEqual({ music: 0, hearShared: false });
  });

  it("leaves everything alone when the note can't be fetched or opened", async () => {
    const a = browser({ "bitportal:settings": '{"airlock":"ask"}' });
    on(a);
    const me = profile(1);
    const down: Shelf = { fetch: async () => Promise.reject(new Error("no relay")), put: async () => true };
    expect(await syncOnce({ store: a, vault: me, shelf: down, now: 1000 })).toMatchObject({ sent: false, why: "unreadable" });
    // Someone else's note under this name, or one that was tampered with: not opened, and not overwritten.
    const r = relays();
    const other = profile(2);
    const theirs = await other.sign({ kind: SETTINGS_KIND, created_at: 1, tags: [["d", SETTINGS_D]], content: await other.seal(noteText({ settings: { at: 9e15, value: '{"airlock":"known"}' } })) });
    const wrong: Shelf = { fetch: async () => ({ ...theirs, pubkey: me.pubkey }), put: r.shelf.put };
    expect((await syncOnce({ store: a, vault: me, shelf: wrong, now: 2000 })).why).toBe("unreadable");
    expect(a.getItem("bitportal:settings")).toBe('{"airlock":"ask"}');
  });

  it("starts again for another profile, and never mixes one into the other's note", async () => {
    const r = relays();
    const a = browser({ "bitportal:settings": '{"airlock":"ask"}' });
    on(a);
    await syncOnce({ store: a, vault: profile(1), shelf: r.shelf, now: 1000 });
    await syncOnce({ store: a, vault: profile(2), shelf: r.shelf, now: 2000 });
    expect(r.notes.size).toBe(2);
    expect(loadSync(a).who).toBe(profile(2).pubkey);
  });
});

describe("saved doors", () => {
  it("travel as which doors and where, not as their announcements", () => {
    const b = browser({ "bitportal:saved": savedWith(door("tour", 0), door("grove", 1)) });
    const s = snapshot(b, { on: true, who: "", at: {}, mark: {}, syncedAt: 0 }, 1000);
    expect(JSON.parse(s.saved!.value!)).toEqual([door("tour", 0), door("grove", 1)]);
    expect(s.saved!.value).not.toContain("fake");
  });

  it("arrive on another device, are fetched, and one not found yet is kept as wanted and not forgotten", async () => {
    const r = relays();
    const me = profile(1);
    const a = browser({ "bitportal:saved": savedWith(door("tour", 0), door("grove", 1), door("arcade", 2)) });
    on(a);
    await syncOnce({ store: a, vault: me, shelf: r.shelf, now: 1000 });
    const b = browser();
    on(b);
    // This device can find two of the three announcements for now.
    const known = new Map([[door("tour", 0).id, { id: "tour-event" } as unknown as NostrEvent], [door("grove", 1).id, { id: "grove-event" } as unknown as NostrEvent]]);
    const out = await syncOnce({ store: b, vault: me, shelf: r.shelf, now: 2000, find: (id) => known.get(id) ?? null });
    expect(out.took).toContain("saved");
    expect(out.missing).toEqual([door("arcade", 2)]);
    expect(JSON.parse(b.getItem("bitportal:saved")!).map((s: { id: string }) => s.id)).toEqual([door("tour", 0).id, door("grove", 1).id]);
    expect(JSON.parse(b.getItem(WANTED_KEY)!)).toEqual([door("arcade", 2)]);
    // Asked again before the third is found: it doesn't tell the profile the door was taken down.
    expect((await syncOnce({ store: b, vault: me, shelf: r.shelf, now: 3000 })).sent).toBe(false);
    expect(JSON.parse(readNote(await me.open(r.notes.get(me.pubkey)!)).saved!.value!)).toHaveLength(3);
    // Found: it joins the others, and nothing is wanted.
    expect(reconcileSaved(b, [door("tour", 0), door("grove", 1), door("arcade", 2)], (id) => (id === door("arcade", 2).id ? ({ id: "arcade-event" } as unknown as NostrEvent) : null))).toEqual([]);
    expect(b.getItem(WANTED_KEY)).toBeNull();
    expect(JSON.parse(b.getItem("bitportal:saved")!)).toHaveLength(3);
  });

  it("taken down on one device are taken down on the other", async () => {
    const r = relays();
    const me = profile(1);
    const a = browser({ "bitportal:saved": savedWith(door("tour", 0), door("grove", 1)) });
    const b = browser();
    on(a);
    on(b);
    const all = (id: string) => ({ id: `${id}-event` }) as unknown as NostrEvent;
    await syncOnce({ store: a, vault: me, shelf: r.shelf, now: 1000 });
    await syncOnce({ store: b, vault: me, shelf: r.shelf, now: 2000, find: all });
    a.setItem("bitportal:saved", savedWith(door("tour", 0)));
    await syncOnce({ store: a, vault: me, shelf: r.shelf, now: 3000 });
    await syncOnce({ store: b, vault: me, shelf: r.shelf, now: 4000, find: all });
    expect(JSON.parse(b.getItem("bitportal:saved")!).map((s: { id: string }) => s.id)).toEqual([door("tour", 0).id]);
  });

  it("are added together the first time a browser with doors of its own meets a profile with others", () => {
    const mine: Snapshot = { saved: { at: 2000, value: JSON.stringify([door("tour", 0)]) } };
    const theirs: Snapshot = { saved: { at: 1000, value: JSON.stringify([door("grove", 1)]) } };
    const m = merge(mine, theirs, true);
    expect(JSON.parse(m.result.saved!.value!).map((d: { id: string }) => d.id)).toEqual([door("tour", 0).id, door("grove", 1).id]);
    expect(m.take).toContain("saved");
    expect(m.send).toBe(true);
  });
});

describe("the note", () => {
  it("drops what it doesn't know, and what is out of bounds", () => {
    const text = JSON.stringify({ v: 1, sections: { settings: { at: 5, value: "{}" }, approved: { at: 5, value: "{}" }, ui: { at: "soon", value: "{}" }, look: { at: 5, value: "x".repeat(20000) }, room: { at: 5, value: 7 } } });
    expect(Object.keys(readNote(text))).toEqual(["settings"]);
    for (const bad of ["", "not json", "[]", '{"v":2,"sections":{}}']) expect(readNote(bad)).toEqual({});
  });

  it("stays small enough to seal, leaving out the least needed first", () => {
    const big: Snapshot = Object.fromEntries(SECTIONS.map((s) => [s.name, { at: 1, value: "x".repeat(15000) }]));
    const text = noteText(big);
    expect(text.length).toBeLessThanOrEqual(NOTE_LIMIT);
    const kept = Object.keys(readNote(text));
    expect(kept).toContain("settings");
    expect(kept).not.toContain("room");
  });

  it("can be emptied, for a visitor who wants nothing of theirs kept there", async () => {
    const r = relays();
    const me = profile(1);
    const a = browser({ "bitportal:settings": '{"airlock":"ask"}' });
    on(a);
    await syncOnce({ store: a, vault: me, shelf: r.shelf, now: 1000 });
    expect(await emptyNote({ vault: me, shelf: r.shelf, now: 2000 })).toBe(true);
    expect(readNote(await me.open(r.notes.get(me.pubkey)!))).toEqual({});
    expect(a.getItem(SYNC_KEY)).not.toBeNull();
  });
});

describe("what is on a visitor's bar, kept with their profile", () => {
  it("travels as the kit keeps it, and is one of the things that may", () => {
    expect(SECTIONS.find((s) => s.name === "bar")?.key).toBe("nswp:ui:pins");
    // And still nothing that is said per device, or trusted by a computer of theirs.
    const keys = SECTIONS.map((s) => s.key);
    for (const never of ["bitportal:approved", "bitportal:publisher-pins", "bitportal:airlock-ask", "bitportal:travel-mic", "bitportal:go-as", "bitportal:computers", "bitportal:my-worlds", "bitportal:signed-in"]) expect(keys).not.toContain(never);
  });
});
