/**
 * A visitor's bag, at their home (NSWP-17): the items they have.
 *
 * It is one public note of theirs (kind 37308). Home is where it is changed: a world can look through its
 * visitor's bag and has no hand to change it. The kit does the careful part (`createBag`): it starts from the
 * newest bag it can find, changes one line, and changes nothing when no relay could be reached.
 *
 * Changing a bag is not among the things BitPortal asks every visitor to allow at sign-in. It is asked for the
 * first time they put something in or take something out, in BitLogin's own window (`askFor`). Until then
 * nothing here can sign a bag.
 *
 * A guest (BitLogin's guest account for a visitor who arrived signed out, docs/guest-accounts.md) has its bag
 * too, and is asked nothing: BitLogin signs a guest's bag with no press (G4, the owner's word of 2026-11-25).
 *
 * Nothing carried is drawn in this room. That is a choice, not something the site's rules force: the room's
 * rule for items is "none", and the tab says so. Whether the home room should draw what people hold is the
 * owner's to decide.
 */
import { itemCoordinate } from "@nswp/core";
import { createBag, type Bag } from "nswp-sdk/three";
import starterJson from "../starter/items.json";
import { askFor, asks, signInHost, type quietGuestSigner, type quietSigner } from "./session.js";

/**
 * A few items offered here to begin with (`src/starter/items.json`): put in a bag with one press, like any other
 * item someone takes up. Which ones are offered is the operator's to say, as the starter set of worlds is.
 */
export const STARTER_ITEMS: readonly string[] = (starterJson.items as unknown[]).map((i) => itemCoordinate(i)).filter(Boolean);

export interface HomeBagOptions {
  /** Whose bag: who is signed in, or this browser's guest account (`guest`); null for nobody, or someone going about unnamed. */
  me(): string | null;
  /** Whether `me` is this browser's guest account, not someone signed in. */
  guest(): boolean;
  guestSignerFor: typeof quietGuestSigner;
  /** The usual relays, beside the visitor's own. */
  relays: string[];
  signerFor: typeof quietSigner;
  say(text: string): void;
  /** In a headset: a window that opens can't be seen from in there. */
  presenting(): boolean;
}

export interface HomeBag {
  bag: Bag;
  /** Whether a change can be signed now: this device has been let. */
  allowed(): boolean;
  /** Have them asked, from a press. What to say meanwhile. */
  ask(then: () => void): string;
}

export function homeBag(o: HomeBagOptions): HomeBag {
  // A guest is asked nothing: BitLogin signs its bag unasked. Anyone signed in is asked once, at first use.
  const allowed = () => o.guest() || asks().includes("bag");
  const bag = createBag({
    me: o.me,
    relays: o.relays,
    hand: {
      ready: allowed,
      async sign(made) {
        const me = o.me();
        const quiet = me ? await (o.guest() ? o.guestSignerFor(me) : o.signerFor(me)) : null;
        if (!quiet) return null;
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
    bag,
    allowed,
    ask(then) {
      const where = signInHost();
      if (o.presenting()) return `Changing your bag is one more thing ${where} asks you about, once, in a window that can't be seen from in here. Step out of the headset and press this again.`;
      void askFor("bag").then((answer) => {
        if (answer === "allowed") then();
        else o.say(answer === "blocked" ? `The window of ${where} is ready now. Press again to open it.` : "Your bag is as it was.");
      });
      return `Changing your bag is one more thing ${where} asks you about, once. Its window is opening.`;
    },
  };
}
