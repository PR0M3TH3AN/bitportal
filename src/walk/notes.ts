/**
 * Sending out a post from your own room (NSWP-10, "Posting from a world").
 *
 * In a world, a post is signed by the visitor's signer at BitLogin, which the
 * world asks and never holds (NSWP-10, "Signing from a world"). Here there is
 * nobody to ask on their behalf: this is the visitor's own client, and they
 * are already signed in to it. So "Send out a post", in the room's "My public
 * feed", is signed with that sign-in, the way a pass is.
 *
 * It signs one thing: a plain note (kind 1) with the words they wrote and no
 * tags, dated now. It is asked to only when the visitor writes a post in
 * their feed and sends it: nothing said to the room is ever posted. Someone
 * going about as a guest is offered nothing.
 */
import { cleanChat, finalizeEvent, getPublicKey, type EventTemplate, type NostrEvent } from "@nswp/core";
import type { Signer } from "../shared/session.js";

export interface HomeNotes {
  /** Whether a note can be signed now: someone is signed in, and isn't going about as a guest. */
  ready(): boolean;
  /** Sign a note of the visitor's own words. Null for anything else, or if it can't be signed. */
  sign(note: { kind: number; content: string; tags: string[][] }): Promise<NostrEvent | null>;
  onChange(fn: () => void): () => void;
  /** Whose key signs: their feed is that key's posts. Null for nobody, or a guest. */
  pubkey(): string | null;
  /** What to call them over their feed: the name in their own profile, or null. */
  who(): string | null;
  /** The site each post is marked with by what signs it, or null for none. They are told so where they write. */
  marked(): string | null;
  /** Say who is signed in, or that nobody is. */
  setWho(pubkey: string | null): void;
  /**
   * For tests: stand in a throwaway identity, made in this page, and return
   * its public key. Nothing in an address can do this.
   */
  useTestIdentity(secretKey?: Uint8Array): string;
}

export interface HomeNotesDeps {
  /** A signer for someone already signed in, with nothing shown; null when they aren't. (`quietSigner`.) */
  signerFor(pubkey: string): Promise<{ signer: Signer; close(): void } | null>;
  /** Whether they have said to go about as a guest. */
  asGuest(): boolean;
  /** The name in someone's own Nostr profile, if this browser knows it. */
  nameOf?(pubkey: string): string | null;
  /** The site their signer marks each post with, to tell them so; null where it marks nothing. */
  marked?(): string | null;
  now?: () => number;
}

export function createHomeNotes(deps: HomeNotesDeps): HomeNotes {
  let who: string | null = null;
  let test: { pubkey: string; signer: Signer } | null = null;
  const watchers = new Set<() => void>();
  const changed = () => {
    for (const fn of watchers) fn();
  };
  return {
    ready: () => !!(test ?? who) && !deps.asGuest(),
    async sign(note) {
      const pubkey = test?.pubkey ?? who;
      if (!pubkey || deps.asGuest()) return null;
      // A plain note, the words as the chat would show them, and nothing else: no kind but 1, and no tags.
      const words = cleanChat(note.content);
      if (note.kind !== 1 || !words || words !== note.content || note.tags.length !== 0) return null;
      const template: EventTemplate = { kind: 1, created_at: Math.floor((deps.now?.() ?? Date.now()) / 1000), tags: [], content: words };
      const quiet = test ? { signer: test.signer, close: () => {} } : await deps.signerFor(pubkey);
      if (!quiet) return null;
      try {
        const signed = await quiet.signer.signEvent(template);
        return signed.pubkey === pubkey && signed.kind === 1 && signed.content === words ? signed : null;
      } catch {
        return null;
      } finally {
        quiet.close();
      }
    },
    onChange(fn) {
      watchers.add(fn);
      return () => void watchers.delete(fn);
    },
    pubkey: () => (deps.asGuest() ? null : (test?.pubkey ?? who)),
    who: () => {
      const pubkey = test?.pubkey ?? who;
      return pubkey && !deps.asGuest() ? (deps.nameOf?.(pubkey) ?? null) : null;
    },
    // The throwaway identity tests use marks nothing.
    marked: () => (test ? null : (deps.marked?.() ?? null)),
    setWho(pubkey) {
      who = pubkey;
      changed();
    },
    useTestIdentity(secretKey = crypto.getRandomValues(new Uint8Array(32))) {
      const pubkey = getPublicKey(secretKey);
      test = { pubkey, signer: { getPublicKey: async () => pubkey, signEvent: async (t) => finalizeEvent(t, secretKey) } };
      changed();
      return pubkey;
    },
  };
}
