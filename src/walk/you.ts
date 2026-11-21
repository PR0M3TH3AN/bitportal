/**
 * Who the visitor is and how they look, reached from the room.
 *
 * Both are kept by BitPortal and are the same in every world. A world's menu
 * brings a visitor here by the crossing's room and takes them back the same
 * way (NSWP-10, "Signing in from inside a world"; NSWP-05).
 *
 * - **A look** is a handful of choices from short lists. They are in the
 *   room's menu, which is the same on a phone, at a desk and on a headset's
 *   wrist, and the visitor's own figure stands in the room to show them.
 * - **Signing in** is done at BitLogin's own address, in a window of its own,
 *   which the room's own control opens at the visitor's press: the same row,
 *   in the same words, as in every world. Nowhere else is gone to for it.
 * - **The way back** to the world they came from is the door this site's own
 *   Airlock kept for the tab (who.ts). It leads to the Airlock, which checks
 *   it as it checks any door.
 */
import { LOOK_COLORS, LOOK_PARTS, type LookColor, type LookPart } from "@nswp/core";
import type { Controls, UiCard } from "nswp-sdk/ui";
import { colourName, forgetLook, LOOK_TITLES, lookOf, lookWord, newSeed, stepLook, storeLook, surprise, type KeptLook } from "../shared/look.js";
import { holdsReserved, signInHost } from "../shared/session.js";
import type { WhoDoor } from "../shared/who.js";

/** What to say about signing in: where it is done, and that a world asks once of its own. */
const signingIn = (): string =>
  ` You sign in at ${signInHost()}, which asks you itself: once for here, and once at each world you choose to be known in. Until you do, people there see a guest.${holdsReserved() ? "" : " At this address it signs no pass, so people in this room see a guest too."}`;

export interface YouOptions {
  controls: Controls;
  /** Bring the menu up on a section. */
  openMenu(section: string): void;
  /** The world they asked to come back to, if they came from one. */
  door: WhoDoor | null;
  /** Take them back there, by the crossing's room. */
  goBack(): void;
  /**
   * Sign them in, here: the sign-in address's own window opens at their press, as it does in every world. No
   * other place is gone to for it.
   */
  signIn(): void;
  /** Sign them out of this site, here. */
  signOut(): void;
  /** Let them be someone else: the sign-in address asks, to choose another account. */
  another(): void;
  /**
   * Show their account at the sign-in address, here: its own pages, in the panel drawn over the room. Left out,
   * or `canAccount` false, where there is no panel: the room shows none of that itself.
   */
  account?(): void;
  canAccount?(): boolean;
  /** Their look as it is kept, or null while they have none. */
  look(): KeptLook | null;
  /** Their look has changed, or been forgotten: draw it. */
  onLook(kept: KeptLook | null): void;
  signedInAs(): string;
  /**
   * Who they are signed in as, as the card every world shows at the head of You: their picture, name and key
   * (the kit's `UiCard`). Null for a guest, or someone going about as one.
   */
  card?(): UiCard | null;
}

export interface You {
  /** Begin changing the look: the menu comes up on it. */
  openLook(): void;
}

export function addYou(o: YouOptions): You {
  const { controls } = o;

  // --------------------------------------------------------------- who
  controls.addSection({
    id: "you",
    label: "You",
    icon: "you",
    // The same card as in every world, so who they are looks the same wherever they stand.
    card: () => o.card?.() ?? null,
    note: () => `How you look is kept here, by ${location.host}, and is the same in every world you go to.${signingIn()}${o.door ? ` When you are done, Back takes you to ${o.door.host || "the world you came from"}.` : ""}`,
  });
  controls.add(
    { id: "figure", section: "you", icon: "look", label: "Change how you look", short: "Look", act: () => openLook() },
    {
      id: "identity",
      section: "you",
      icon: "you",
      // The same row, in the same words, as in every world (the kit's `signerAction`): it says whose window will
      // open before anything is pressed, and signing out is the same row once they are in.
      label: () => (o.signedInAs() ? `Signed in as ${o.signedInAs()}. Sign out here` : `Sign in, at ${signInHost()}`),
      short: () => (o.signedInAs() ? "Sign out" : "Sign in"),
      on: () => !!o.signedInAs(),
      act: () => (o.signedInAs() ? o.signOut() : o.signIn()),
    },
    { id: "identity-another", section: "you", icon: "you", label: "Be someone else", short: "Other", hidden: () => !o.signedInAs(), act: () => o.another() },
    // The same row every world has (the kit's `accountAction`): everything the sign-in address does, without leaving.
    { id: "account", section: "you", icon: "key", label: () => `Your account, at ${signInHost()}`, short: "Account", hidden: () => !(o.account && o.canAccount?.()), act: () => o.account?.() },
  );
  if (o.door) {
    const where = o.door.host || "the world you came from";
    controls.add({ id: "back", section: "travel", icon: "leave", hotbar: true, tone: "primary", label: `Back to ${where}`, short: "Back", act: () => o.goBack() });
  }

  // -------------------------------------------------------------- look
  // Until they change something, this is only a suggestion: nothing is kept, and they go plain.
  let draft: KeptLook = o.look() ?? { seed: newSeed(), choices: {} };
  const keep = (next: KeptLook) => {
    draft = next;
    storeLook(next);
    o.onLook(next);
    controls.setTarget(""); // the words on the controls have changed
  };
  const now = () => lookOf(o.look() ?? draft);
  controls.addSection({
    id: "figure",
    label: "Your look",
    icon: "look",
    note: () =>
      o.look()
        ? "How other people see you, here and in every world that doesn't dress its visitors its own way. Your figure stands in the room to show you. It is kept in this browser, and with your profile if you keep your settings there."
        : "You have no look yet, so you are a different figure on every visit. Change anything here to keep one: your figure will stand in the room to show you.",
  });
  controls.add(
    { id: "figure-surprise", section: "figure", icon: "look", label: "Surprise me: change everything", short: "Surprise", act: () => keep(surprise(o.look() ?? draft)) },
    ...LOOK_COLORS.map((c: LookColor) => ({ id: `figure-${c}`, section: "figure", kind: "swatch" as const, color: () => now()[c], label: () => `${LOOK_TITLES[c]}: ${colourName(now()[c])}`, act: () => keep(stepLook(o.look() ?? draft, c)) })),
    ...(Object.keys(LOOK_PARTS) as LookPart[]).map((part) => ({ id: `figure-${part}`, section: "figure", icon: "look" as const, label: () => `${LOOK_TITLES[part]}: ${lookWord(String(now()[part]))}`, act: () => keep(stepLook(o.look() ?? draft, part)) })),
    { id: "figure-mark", section: "figure", icon: "turn", label: "Start again with a new mark", short: "New mark", act: () => keep({ seed: newSeed(), choices: (o.look() ?? draft).choices }) },
    {
      id: "figure-forget",
      section: "figure",
      icon: "exit",
      tone: "warn",
      hidden: () => !o.look(),
      label: "Stop wearing a look",
      short: "Go plain",
      act: () => {
        forgetLook();
        draft = { seed: newSeed(), choices: {} };
        o.onLook(null);
        controls.say("You go plain now: a different figure on every visit.");
      },
    },
  );
  const openLook = () => o.openMenu("figure");

  return { openLook };
}
