import { describe, expect, it } from "vitest";
import { finalizeEvent, getPublicKey, verifyEvent, type EventTemplate } from "@nswp/core";
import { createHomeNotes } from "../src/walk/notes.js";

const KEY = new Uint8Array(32).fill(5);
const ME = getPublicKey(KEY);
const NOW = 1_794_500_000_000;

const made = (over: { asGuest?: boolean; signedIn?: boolean; signAs?: Uint8Array } = {}) => {
  const asked: EventTemplate[] = [];
  let closed = 0;
  const notes = createHomeNotes({
    asGuest: () => !!over.asGuest,
    now: () => NOW,
    signerFor: async () =>
      over.signedIn === false
        ? null
        : {
            signer: { getPublicKey: async () => ME, signEvent: async (t) => (asked.push(t), finalizeEvent(t, over.signAs ?? KEY)) },
            close: () => void closed++,
          },
  });
  return { notes, asked, closed: () => closed };
};
const note = (content: string, over: Partial<{ kind: number; tags: string[][] }> = {}) => ({ kind: 1, content, tags: [], ...over });

describe("whose feed it is", () => {
  it("is the key that is signed in, by the name in their own profile, and nobody's for a guest", () => {
    const notes = createHomeNotes({ asGuest: () => false, signerFor: async () => null, nameOf: (k) => (k === ME ? "Ada" : null) });
    expect(notes.pubkey()).toBeNull();
    expect(notes.who()).toBeNull();
    notes.setWho(ME);
    expect(notes.pubkey()).toBe(ME);
    expect(notes.who()).toBe("Ada");
    const guest = createHomeNotes({ asGuest: () => true, signerFor: async () => null, nameOf: () => "Ada" });
    guest.setWho(ME);
    expect(guest.pubkey()).toBeNull();
    expect(guest.who()).toBeNull();
  });
});

describe("posting from your own room", () => {
  it("is offered to someone signed in, and to nobody else", () => {
    const { notes } = made();
    expect(notes.ready()).toBe(false);
    let told = 0;
    notes.onChange(() => told++);
    notes.setWho(ME);
    expect(notes.ready()).toBe(true);
    expect(told).toBe(1);
    notes.setWho(null);
    expect(notes.ready()).toBe(false);
  });

  it("is not offered to someone going about as a guest, and signs nothing for them", async () => {
    const { notes, asked } = made({ asGuest: true });
    notes.setWho(ME);
    expect(notes.ready()).toBe(false);
    expect(await notes.sign(note("hello"))).toBeNull();
    expect(asked).toEqual([]);
  });

  it("signs a plain note of the words written, dated now, and lets go of the signer", async () => {
    const { notes, asked, closed } = made();
    notes.setWho(ME);
    const signed = await notes.sign(note("Hello from my room"));
    expect(signed && verifyEvent(signed)).toBe(true);
    expect(signed).toMatchObject({ kind: 1, content: "Hello from my room", tags: [], pubkey: ME, created_at: NOW / 1000 });
    expect(asked).toEqual([{ kind: 1, created_at: NOW / 1000, tags: [], content: "Hello from my room" }]);
    expect(closed()).toBe(1);
  });

  it("signs nothing but that: no other kind, no tags, nothing empty or untidied", async () => {
    const { notes, asked } = made();
    notes.setWho(ME);
    for (const not of [note("hi", { kind: 0 }), note("hi", { kind: 3 }), note("hi", { kind: 30078 }), note("hi", { tags: [["p", ME]] }), note(""), note("   "), note("two\nlines"), note("x".repeat(500))]) {
      expect(await notes.sign(not), JSON.stringify(not).slice(0, 60)).toBeNull();
    }
    expect(asked).toEqual([]);
  });

  it("gives nothing back when nobody is signed in after all, or the signature is someone else's", async () => {
    const gone = made({ signedIn: false });
    gone.notes.setWho(ME);
    expect(await gone.notes.sign(note("hi"))).toBeNull();
    const other = made({ signAs: new Uint8Array(32).fill(9) });
    other.notes.setWho(ME);
    expect(await other.notes.sign(note("hi"))).toBeNull();
    expect(other.closed()).toBe(1);
  });

  it("a test's throwaway identity signs as itself, with no sign-in asked for", async () => {
    const { notes, asked } = made({ signedIn: false });
    const pubkey = notes.useTestIdentity(new Uint8Array(32).fill(7));
    expect(notes.ready()).toBe(true);
    const signed = await notes.sign(note("hi"));
    expect(signed?.pubkey).toBe(pubkey);
    expect(asked).toEqual([]);
  });
});
