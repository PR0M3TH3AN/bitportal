import { beforeEach, describe, expect, it } from "vitest";
import { finalizeEvent, getPublicKey, shortNpub } from "@nswp/core";
import { label, profileOf, PROFILES_KEY, PROFILES_MOST, readProfile, resetProfiles, takeProfiles } from "../src/shared/profiles.js";

const KEY = new Uint8Array(32).fill(5);
const PUB = getPublicKey(KEY);
const OTHER = getPublicKey(new Uint8Array(32).fill(6));
const profile = (content: unknown, at = 1_800_000_000, key = KEY) => finalizeEvent({ kind: 0, created_at: at, tags: [], content: typeof content === "string" ? content : JSON.stringify(content) }, key);
const store = () => {
  const kept = new Map<string, string>();
  return { kept, getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v) };
};
beforeEach(() => resetProfiles());

describe("a Nostr profile, as BitPortal reads it", () => {
  it("takes the display name, then the name, tidied", () => {
    expect(readProfile(JSON.stringify({ display_name: "  Alice\n", name: "alice" })).name).toBe("Alice");
    expect(readProfile(JSON.stringify({ name: "alice" })).name).toBe("alice");
    expect(readProfile(JSON.stringify({ display_name: "​", name: "bob" })).name).toBe("bob");
    expect(readProfile("not json")).toEqual({ name: "", picture: "", about: "" });
  });
  it("takes the start of what they wrote about themselves, as one line of plain text", () => {
    expect(readProfile(JSON.stringify({ about: "  Keeper of the east wing.\n\nAsk me about the clocks. " })).about).toBe("Keeper of the east wing. Ask me about the clocks.");
    expect([...readProfile(JSON.stringify({ about: "z".repeat(900) })).about]).toHaveLength(280);
    expect(readProfile(JSON.stringify({ about: `nice ${String.fromCodePoint(0x202e)}person` })).about).toBe("nice person");
    for (const not of [7, null, { a: 1 }]) expect(readProfile(JSON.stringify({ about: not })).about).toBe("");
  });
  it("takes a picture only from an https address", () => {
    expect(readProfile(JSON.stringify({ picture: "https://pictures.example/a.webp" })).picture).toBe("https://pictures.example/a.webp");
    for (const bad of ["http://pictures.example/a.png", "javascript:alert(1)", "data:image/png;base64,AA", 7]) expect(readProfile(JSON.stringify({ picture: bad })).picture).toBe("");
  });
});

describe("what someone is called", () => {
  it("is the short form of their key, never hex, until their name is known", () => {
    expect(label(PUB)).toBe(shortNpub(PUB));
    expect(label(PUB)).toMatch(/^npub1/);
    expect(label(PUB)).not.toContain(PUB.slice(0, 8));
  });
  it("is the name they chose, with the key beside it where which key it is matters", () => {
    const s = store();
    takeProfiles([profile({ name: "Alice" })], [PUB], 1000, s);
    expect(label(PUB)).toBe("Alice");
    expect(label(PUB, { key: true })).toBe(`Alice (${shortNpub(PUB)})`);
  });
});

describe("keeping profiles", () => {
  it("keeps the newest, and never goes back to an older one", () => {
    const s = store();
    expect(takeProfiles([profile({ name: "Old" }, 100), profile({ name: "New", picture: "https://p.example/n.png" }, 200)], [PUB], 1000, s)).toEqual([PUB]);
    expect(profileOf(PUB)).toMatchObject({ name: "New", picture: "https://p.example/n.png", at: 200 });
    expect(takeProfiles([profile({ name: "Old" }, 100)], [PUB], 2000, s)).toEqual([]);
    expect(profileOf(PUB)?.name).toBe("New");
  });
  it("takes nothing that isn't a signed profile of a key that was asked about", () => {
    const s = store();
    const forged = { ...profile({ name: "Alice" }), content: JSON.stringify({ name: "Mallory" }) };
    const note = finalizeEvent({ kind: 1, created_at: 5, tags: [], content: JSON.stringify({ name: "A note" }) }, KEY);
    takeProfiles([forged, note, profile({ name: "Uninvited" }, 9, new Uint8Array(32).fill(6))], [PUB], 1000, s);
    expect(profileOf(PUB)?.name).toBe("");
    expect(profileOf(OTHER)).toBeNull();
  });
  it("remembers that a key has no profile, so it isn't asked about on every page", () => {
    const s = store();
    takeProfiles([], [PUB], 5000, s);
    expect(profileOf(PUB)).toMatchObject({ name: "", asked: 5000 });
    expect(label(PUB)).toBe(shortNpub(PUB));
  });
  it("is kept in this browser, read back cleaned, and never more than it should be", () => {
    const s = store();
    takeProfiles([profile({ name: "Alice" })], [PUB], 1000, s);
    resetProfiles();
    s.kept.set(PROFILES_KEY, JSON.stringify({ ...JSON.parse(s.kept.get(PROFILES_KEY)!), "not-a-key": { name: "x" }, [OTHER]: { name: "Bob‮", picture: "javascript:alert(1)", at: 1, asked: 1 } }));
    takeProfiles([], [], 2000, s);
    expect(profileOf(PUB)?.name).toBe("Alice");
    expect(profileOf(OTHER)).toMatchObject({ name: "Bob", picture: "" });
    resetProfiles();
    const many = store();
    const keys = Array.from({ length: PROFILES_MOST + 50 }, (_, i) => i.toString(16).padStart(64, "0"));
    takeProfiles([], keys, 3000, many);
    expect(Object.keys(JSON.parse(many.kept.get(PROFILES_KEY)!)).length).toBe(PROFILES_MOST);
  });
});
