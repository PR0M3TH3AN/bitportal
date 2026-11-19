/**
 * Posting what you write in your own room as Nostr notes.
 *
 * In a world, a note is signed by the visitor's signer at BitLogin, which the
 * world asks and never holds (NSWP-10, "Signing from a world"). Here there is
 * nobody to ask on their behalf: this is the visitor's own client, and they
 * are already signed in to it. So the room's "Post what I write as Nostr
 * notes" is signed with that sign-in, the way a pass is.
 *
 * It signs one thing: a plain note (kind 1) with the words they wrote and no
 * tags, dated now. It is asked to only when the visitor has turned the switch
 * on in the room, which is off at every visit, and only for a line they just
 * sent. Someone going about as a guest is offered nothing.
 */
import { cleanChat, finalizeEvent, getPublicKey, type EventTemplate, type NostrEvent } from "@nswp/core";
import type { Signer } from "../shared/session.js";

export interface HomeNotes {
  /** Whether a note can be signed now: someone is signed in, and isn't going about as a guest. */
  ready(): boolean;
  /** Sign a note of the visitor's own words. Null for anything else, or if it can't be signed. */
  sign(note: { kind: number; content: string; tags: string[][] }): Promise<NostrEvent | null>;
  onChange(fn: () => void): () => void;
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
