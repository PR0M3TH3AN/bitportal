/**
 * Following and unfollowing someone from BitPortal's own room (NSWP-14).
 *
 * It is the visitor's own Nostr follow list that changes, the same one every other Nostr client reads, and the
 * one BitPortal counts ratings from. The kit does the careful part (`createPeople`): it starts from the newest
 * list it can find, changes one line, and changes nothing when no relay could be reached.
 *
 * Changing who someone follows is not among the things BitPortal asks every visitor to allow at sign-in. It is
 * asked for the first time they press Follow, in BitLogin's own window (`askFor`; the owner's decision of
 * 2026-11-20). Until then nothing here can sign a follow list, and nothing asks a relay who they follow for this.
 */
import { changeFollows } from "@nswp/core";
import { createPeople, type RoomFollows } from "nswp-sdk/three";
import { askFor, asks, signInHost, type quietSigner } from "./session.js";

export interface HomeFollowsOptions {
  /** Who is signed in, or null: a guest, or someone going about as one. */
  me(): string | null;
  /** The usual relays, beside the visitor's own. */
  relays: string[];
  signerFor: typeof quietSigner;
  say(text: string): void;
  /** In a headset: a window that opens can't be seen from in there. */
  presenting(): boolean;
}

export function homeFollows(o: HomeFollowsOptions): RoomFollows {
  const allowed = () => asks().includes("people");
  const people = createPeople({
    relays: o.relays,
    hand: {
      pubkey: o.me,
      ready: allowed,
      async change(list, change) {
        const me = o.me();
        const made = me ? changeFollows(list, { ...change, now: Date.now() / 1000, fromNothing: list === null }) : null;
        const quiet = made && me ? await o.signerFor(me) : null;
        if (!made || !quiet) return null;
        try {
          return await quiet.signer.signEvent(made);
        } catch {
          return null;
        } finally {
          quiet.close();
        }
      },
    },
  });
  return {
    people,
    pubkey: o.me,
    allowed,
    ask(then) {
      const where = signInHost();
      if (o.presenting()) return `Following is one more thing ${where} asks you about, once, in a window that can't be seen from in here. Step out of the headset and press this again.`;
      void askFor("people").then((answer) => {
        if (answer === "allowed") then();
        else o.say(answer === "blocked" ? `The window of ${where} is ready now. Press again to open it.` : "Who you follow is as it was.");
      });
      return `Following is one more thing ${where} asks you about, once. Its window is opening.`;
    },
  };
}
