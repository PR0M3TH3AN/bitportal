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

describe("deleting one of your own posts, from your own room", () => {
  const ID = "ab".repeat(32);
  const deletion = (over: Partial<{ kind: number; content: string; tags: string[][] }> = {}) => ({ kind: 5, content: "", tags: [["e", ID], ["k", "1"]], ...over });
  const asking = (o: { answer?: (asked: { kind: number; content: string; tags: string[][] }) => ReturnType<typeof finalizeEvent> | null; asGuest?: boolean } = {}) => {
    const put: { kind: number; content: string; tags: string[][] }[] = [];
    const notes = createHomeNotes({
      asGuest: () => !!o.asGuest,
      signerFor: async () => null,
      host: () => "signin.example",
      // The sign-in address, standing in: it signs what was put to the person, marked with this site, as BitLogin does.
      propose: async (asked) => (put.push(asked), o.answer ? o.answer(asked) : finalizeEvent({ ...asked, tags: [...asked.tags, ["nswp:world", "https://portal.example"]], created_at: 1_794_500_000 }, KEY)),
    });
    notes.setWho(ME);
    return { notes, put };
  };

  it("puts exactly that to them at their sign-in address, and hands back what they signed", async () => {
    const { notes, put } = asking();
    const signed = await notes.propose(deletion());
    expect(put).toEqual([{ kind: 5, content: "", tags: [["e", ID], ["k", "1"]] }]);
    expect(signed && verifyEvent(signed)).toBe(true);
    expect([signed?.kind, signed?.pubkey, signed?.tags.filter((t) => t[0] === "e")]).toEqual([5, ME, [["e", ID]]]);
    expect(notes.host()).toBe("signin.example");
  });

  it("puts nothing else to them: no other kind, no words, no second note, no address, nothing malformed", async () => {
    const { notes, put } = asking();
    for (const not of [
      deletion({ kind: 0 }),
      deletion({ kind: 1 }),
      deletion({ kind: 3 }),
      deletion({ kind: 10002 }),
      deletion({ content: "and a word" }),
      deletion({ tags: [["e", ID], ["k", "1"], ["e", "cd".repeat(32)]] }),
      deletion({ tags: [["e", ID]] }),
      deletion({ tags: [["a", `30023:${ME}:essay`], ["k", "30023"]] }),
      deletion({ tags: [["e", "not an id"], ["k", "1"]] }),
      deletion({ tags: [["e", ID, "wss://relay.example"], ["k", "1"]] }),
      deletion({ tags: [["e", ID], ["k", "30078"]] }),
      deletion({ tags: [] }),
    ])
      expect(await notes.propose(not), JSON.stringify(not)).toBeNull();
    expect(put).toEqual([]);
  });

  it("is nothing for a guest, for nobody, and where nothing can ask them", async () => {
    expect(await asking({ asGuest: true }).notes.propose(deletion())).toBeNull();
    const nobody = createHomeNotes({ asGuest: () => false, signerFor: async () => null, propose: async () => null });
    expect(await nobody.propose(deletion())).toBeNull();
    const cannot = createHomeNotes({ asGuest: () => false, signerFor: async () => null });
    cannot.setWho(ME);
    expect(await cannot.propose(deletion())).toBeNull();
    expect(cannot.host()).toBeNull();
  });

  it("takes back only a deletion of that note, by them", async () => {
    const other = new Uint8Array(32).fill(6);
    const sign = (asked: { kind: number; content: string; tags: string[][] }, by: Uint8Array = KEY) => finalizeEvent({ ...asked, created_at: 1_794_500_000 }, by);
    for (const answer of [
      () => null,
      (asked: { kind: number; content: string; tags: string[][] }) => sign(asked, other),
      (asked: { kind: number; content: string; tags: string[][] }) => sign({ ...asked, tags: [["e", "cd".repeat(32)], ["k", "1"]] }),
      (asked: { kind: number; content: string; tags: string[][] }) => sign({ ...asked, tags: [...asked.tags, ["e", "cd".repeat(32)]] }),
      (asked: { kind: number; content: string; tags: string[][] }) => sign({ ...asked, kind: 1 }),
    ])
      expect(await asking({ answer }).notes.propose(deletion())).toBeNull();
  });
});
