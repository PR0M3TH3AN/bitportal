/**
 * The visitor's Bag, in the menu the page that keeps the screen draws over a world (NSWP docs/plans/
 * the-clients-menu.md; protocol "The client has the menu"). The Bag is the visitor's own tab, so a world whose
 * client has the menu draws none: this is the one they have there.
 *
 * It is the kit's own Bag (`nswp-sdk/bag`), which loads no renderer: what it does, how it words itself, and the
 * careful parts (an item's description really signed by its maker, its limits, the rule for a thing that does
 * things of its own) are the kit's. This file says only what is this page's to say:
 *
 * - **Whose bag.** The key signed in to BitPortal, read from this browser's own note of it. This page makes no
 *   signer and signs nothing. And only where the world in the frame says the visitor is named there: a guest in
 *   that world carries nothing, and has no tab. Over this site's own pages the room fills the Bag itself.
 * - **What is in hand** is the world's to say. Taking something up here tells the world, which takes it only if
 *   it is in their bag as they signed it, and this waits for the world to say so.
 * - **A thing that does things of its own** is asked about here, before it is first held, by the kit's own rule
 *   (the second press on Hold is the visitor's yes). The world is then told which script they let run, and runs
 *   that one and no other unasked. Without this a thing with logic is taken up and held by nothing.
 * - **Each thing is shown as itself**, drawn from its own checked model: by a small page this one frames unseen
 *   while the Bag is open (bag-pictures.ts), since this page loads no renderer. By its first letters until its
 *   picture comes, and where it can't be drawn.
 * - **It can't be changed here, for now.** Putting things in and taking them out stays at home, in the room. The
 *   bag is made with no hand to sign a change, and that is the one thing to give it when that is built.
 */
import { addBagControls, createBag, createItemStore, mayHold, scriptAllowed, type Bagging, type ItemPreviews } from "nswp-sdk/bag";
import type { MenuBelow } from "nswp-sdk/menu";
import type { Controls } from "nswp-sdk/ui";

export interface ShellBagOptions {
  controls: Controls;
  below: MenuBelow;
  /** Who is signed in to BitPortal, or null: a guest, or someone going about as one. */
  signedIn(): string | null;
  /** The usual relays, beside the visitor's own. */
  relays: string[];
  /**
   * Each thing's picture, drawn from its own model by a page this one frames unseen (bag-pictures.ts): this page
   * loads no renderer. Left out or null, things are shown by their first letters.
   */
  previews?: ItemPreviews | null;
}

/** Whose bag is shown over the place in the frame, or null for none: see the top of this file. */
export function bagOwner(o: { signedIn(): string | null; origin: string; ours: string; named: boolean }): string | null {
  if (!o.origin || o.origin === o.ours || !o.named) return null;
  return o.signedIn();
}

export function addShellBag(o: ShellBagOptions): Bagging {
  const me = (): string | null => bagOwner({ signedIn: o.signedIn, origin: o.below.origin, ours: location.origin, named: o.below.world?.state.named === true });
  const rule = (): string => o.below.world?.state.items ?? "allowed";
  // No hand: read, and never changed from here.
  const bag = createBag({ me, relays: o.relays, hand: null });
  const items = createItemStore({ relays: o.relays, viewer: me });
  /** The script the visitor was last told about: a second press on the same item is their yes to it. */
  const asked = { sha: "" };
  const bagging = addBagControls(o.controls, {
    bag,
    items,
    // Each thing drawn as itself where its picture has come; by its first letters where it hasn't, or can't.
    previews: o.previews ?? null,
    me,
    rule,
    place: () => o.below.world?.title || "this place",
    holding: () => o.below.world?.state.holding ?? "",
    hold: async (item, tints) => {
      if (!item) return (await o.below.hold("")) ? { ok: true, said: "Put away." } : { ok: false, said: "This place still has it in your hand." };
      const described = items.known(item) ?? (await items.describe(item));
      const may = mayHold(described, { rule: rule(), scripts: true, asked });
      if (!may.ok) return may;
      const script = described?.script?.sha256;
      return (await o.below.hold(item, { ...(tints ? { tints } : {}), ...(script && scriptAllowed(script) ? { script } : {}) })) ? { ok: true, said: "In your hand." } : { ok: false, said: "This place didn't take it in hand." };
    },
  });
  // Who they are there, what is in hand and the place's rule are all the world's to say: looked at again as it speaks.
  o.below.onChange(() => bagging.refresh());
  return bagging;
}
