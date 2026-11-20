import { afterEach, describe, expect, it } from "vitest";
import { finalizeEvent, getPublicKey, type EventTemplate } from "@nswp/core";
import { checkedSigner, holdsReserved, knownSignedIn, namedAddress, permissionsFor, RESERVED_KINDS, SITE_MARK, signInAddress, signInHost } from "../src/shared/session.js";
import { INSTANCE } from "../src/shared/instance.js";

const secret = new Uint8Array(32).fill(7);
const pubkey = getPublicKey(secret);
const HERE = "https://portal.bitblocks.network";
const note: EventTemplate = { kind: 1, created_at: 1_800_000_000, tags: [], content: "hello" };

/** A signer that adds tags of its own before signing, as BitLogin's does for an application. */
const adding = (...extra: string[][]) => ({ signEvent: async (t: EventTemplate) => finalizeEvent({ ...t, tags: [...t.tags, ...extra] }, secret) });

describe("what BitPortal asks its sign-in address to let it do", () => {
  it("is one short list, shown to the visitor once, and it names nothing sensitive", () => {
    const asked = permissionsFor(true);
    expect(asked).toEqual({ name: "BitPortal", sign: [1, 27300, 27302, 27303, 30004, 30078, 37300, 37305], appData: ["bitportal/"], read: [30078] });
    // Never a profile, a follow list, a deletion, a mute or relay list, a relay sign-in, or anyone's messages.
    for (const kind of [0, 3, 5, 10000, 10002, 10050, 22242, 4, 13, 1059]) expect([...asked.sign, ...asked.read]).not.toContain(kind);
    // Its own data only, under its own name: never every application's.
    expect(asked.appData).not.toContain("*");
  });
  it("asks to change who they follow only where a visitor has pressed for it, and for nothing else beside", () => {
    // What everyone is asked at sign-in never has it (the owner's decision of 2026-11-20: asked on first use).
    expect(permissionsFor(true).sign).not.toContain(3);
    const more = permissionsFor(true, ["people"]);
    expect(more).toEqual({ ...permissionsFor(true), sign: [1, 3, 27300, 27302, 27303, 30004, 30078, 37300, 37305] });
    // Still never a profile, a deletion, a mute or relay list, a relay sign-in, or anyone's messages.
    for (const kind of [0, 5, 10000, 10002, 10050, 22242, 4, 13, 1059]) expect([...more.sign, ...more.read]).not.toContain(kind);
  });
  it("asks to send and read private messages only where a visitor has pressed for it", () => {
    for (const kind of [13, 1059, 10050]) expect([...permissionsFor(true).sign, ...permissionsFor(true).read]).not.toContain(kind);
    const more = permissionsFor(true, ["messages"]);
    expect(more.sign).toEqual([1, 13, 10050, 27300, 27302, 27303, 30004, 30078, 37300, 37305]);
    expect(more.read).toEqual([13, 1059, 30078]);
    // Not who they follow, unless that was asked for too; and never the older kind of message, a profile or a deletion.
    for (const kind of [0, 3, 4, 5, 10000, 10002, 22242]) expect([...more.sign, ...more.read]).not.toContain(kind);
    expect(permissionsFor(true, ["people", "messages"]).sign).toContain(3);
  });
  it("asks to change their bag only where a visitor has pressed for it, and for nothing else beside", () => {
    expect(permissionsFor(true).sign).not.toContain(37308);
    const more = permissionsFor(true, ["bag"]);
    expect(more).toEqual({ ...permissionsFor(true), sign: [1, 27300, 27302, 27303, 30004, 30078, 37300, 37305, 37308] });
    // Not who they follow or their messages, unless those were asked for too.
    for (const kind of [3, 13, 1059, 10050]) expect([...more.sign, ...more.read]).not.toContain(kind);
  });
  it("is the same without the pass and the grants, where the sign-in address won't sign those", () => {
    const less = permissionsFor(false);
    for (const kind of RESERVED_KINDS) expect(less.sign).not.toContain(kind);
    expect(less).toEqual({ ...permissionsFor(true), sign: [1, 30004, 30078, 37300, 37305] });
  });
  it("takes a pass and a grant to be signable only at BitPortal's own address, until the sign-in address has said", () => {
    expect(namedAddress(HERE)).toBe(true);
    expect(holdsReserved(HERE)).toBe(true);
    for (const elsewhere of ["https://192.168.68.84:4300", "https://bitportal.vercel.app", "https://portal.bitblocks.network.example", "http://portal.bitblocks.network"]) {
      expect(namedAddress(elsewhere)).toBe(false);
      expect(holdsReserved(elsewhere)).toBe(false);
    }
  });
  it("asks the sign-in address for everything first, and only then for less: its answer decides, not an address", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const session = readFileSync(new URL("../src/shared/session.ts", import.meta.url), "utf8");
    expect(session).toContain("let c = asking(true);");
    expect(session).toContain("const reserved = can ?? namedAddress(location.origin);");
    expect(session).toContain("c.destroy();");
  });
  it("is asked of the same address a world is told to sign in at: one sign-in", () => {
    expect(signInAddress()).toBe(INSTANCE.signer);
    expect(signInHost()).toBe("bitlogin.network");
  });
});

describe("what a signer hands back is checked before it is used", () => {
  it("takes a note signed as asked", async () => {
    const signed = await checkedSigner(pubkey, adding(), HERE).signEvent(note);
    expect(signed.content).toBe("hello");
  });
  it("allows the one tag BitLogin's signer adds, naming this site and nothing else", async () => {
    const signed = await checkedSigner(pubkey, adding([SITE_MARK, HERE]), HERE).signEvent(note);
    expect(signed.tags).toEqual([[SITE_MARK, HERE]]);
  });
  it("refuses a mark naming another site, a mark given twice, or a mark with more in it", async () => {
    await expect(checkedSigner(pubkey, adding([SITE_MARK, "https://elsewhere.example"]), HERE).signEvent(note)).rejects.toThrow(/changed the event/);
    await expect(checkedSigner(pubkey, adding([SITE_MARK, HERE], [SITE_MARK, HERE]), HERE).signEvent(note)).rejects.toThrow(/changed the event/);
    await expect(checkedSigner(pubkey, adding([SITE_MARK, HERE, "more"]), HERE).signEvent(note)).rejects.toThrow(/changed the event/);
  });
  it("refuses any other tag a signer adds, with the mark or without it", async () => {
    await expect(checkedSigner(pubkey, adding(["p", pubkey]), HERE).signEvent(note)).rejects.toThrow(/changed the event/);
    await expect(checkedSigner(pubkey, adding(["p", pubkey], [SITE_MARK, HERE]), HERE).signEvent(note)).rejects.toThrow(/changed the event/);
  });
  it("allows no mark at all from a signer that isn't the sign-in address's", async () => {
    await expect(checkedSigner(pubkey, adding([SITE_MARK, HERE])).signEvent(note)).rejects.toThrow(/changed the event/);
  });
  it("refuses another identity, other words, another kind or another time", async () => {
    const other = new Uint8Array(32).fill(9);
    await expect(checkedSigner(pubkey, { signEvent: async (t) => finalizeEvent(t, other) }, HERE).signEvent(note)).rejects.toThrow(/different identity/);
    await expect(checkedSigner(pubkey, { signEvent: async (t) => finalizeEvent({ ...t, content: "other words" }, secret) }, HERE).signEvent(note)).rejects.toThrow(/changed the event/);
    await expect(checkedSigner(pubkey, { signEvent: async (t) => finalizeEvent({ ...t, kind: 7 }, secret) }, HERE).signEvent(note)).rejects.toThrow(/changed the event/);
    await expect(checkedSigner(pubkey, { signEvent: async (t) => finalizeEvent({ ...t, created_at: t.created_at + 60 }, secret) }, HERE).signEvent(note)).rejects.toThrow(/changed the event/);
    await expect(checkedSigner(pubkey, { signEvent: async () => ({ not: "an event" }) }, HERE).signEvent(note)).rejects.toThrow(/doesn't verify/);
  });
});

describe("this browser's own note of who is signed in, for the Airlock", () => {
  const kept = new Map<string, string>();
  const store = { getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v), removeItem: (k: string) => void kept.delete(k) };
  const withStore = () => ((globalThis as { localStorage?: unknown }).localStorage = store);
  afterEach(() => {
    kept.clear();
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });
  it("is nobody where nothing was kept, or nothing can be", () => {
    expect(knownSignedIn()).toBeNull();
    withStore();
    expect(knownSignedIn()).toBeNull();
  });
  it("says who, until what they allowed runs out", () => {
    withStore();
    kept.set("bitportal:signed-in", JSON.stringify({ pubkey, name: "Ada", until: 2_000_000_000 }));
    expect(knownSignedIn(1_999_999_999_000)).toEqual({ pubkey, name: "Ada" });
    expect(knownSignedIn(2_000_000_000_000)).toBeNull();
  });
  it("takes nothing that isn't a public key, and tidies a name", () => {
    withStore();
    kept.set("bitportal:signed-in", JSON.stringify({ pubkey: "not a key", until: 0 }));
    expect(knownSignedIn()).toBeNull();
    kept.set("bitportal:signed-in", "{not json");
    expect(knownSignedIn()).toBeNull();
    kept.set("bitportal:signed-in", JSON.stringify({ pubkey, name: "  Ada\n", until: 0 }));
    expect(knownSignedIn()).toEqual({ pubkey, name: "Ada" });
  });
});
