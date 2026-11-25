/**
 * What BitPortal says to a guest: the account BitLogin made for a visitor who arrived signed out, the same in every
 * bitblocks.network site (BitLogin docs/guest-accounts.md). The owner, 2026-11-23 and again 2026-11-25: "a guest
 * should be the same guest in every world and they should have access to a bag with the free items that the worlds
 * allow".
 *
 * A guest is themselves here: their name (the kit's `guestName`, the same in the room and every world), their look,
 * their notes and their bag. What needs an account that lasts past this browser (following people, messages, a
 * rating, a computer, a wallet, files, buying) says to secure it first. BitLogin's own screens say the same of
 * what is theirs (G5).
 */
import { guestName } from "@nswp/core";

export { guestName };

/** Said where a guest can't yet: BitLogin's words for it (G5). */
export const SECURE_FIRST = "Secure this account first";

/** The press beside it: BitLogin's panel, opened straight on "Secure this account" (its mode "secure", G6). */
export const SECURE = "Secure this account";

/**
 * Said where no panel can be drawn (a page something else frames, or not at BitPortal's own address): BitLogin lets
 * only BitPortal's own address draw its panel, and a window of its own can't see the guest.
 */
export const SECURE_ELSEWHERE = "This account can be secured from BitPortal's menu, at BitPortal's own address.";

/** Whether this is Brave, which by default forgets a framed site's storage when it closes (G2, G8). */
export function isBrave(nav: unknown = typeof navigator === "undefined" ? undefined : navigator): boolean {
  return !!nav && typeof nav === "object" && "brave" in nav && !!(nav as { brave?: unknown }).brave;
}

/** What You says to a guest (G8): who they are, in every world, and where the account lives. */
export function guestNote(brave: boolean = isBrave()): string {
  return `You're a guest. Every world in BitPortal knows it's the same guest. ${brave ? "This browser forgets guests when it closes. Secure this account to keep it." : "This account lives in this browser only. Clearing this site's data loses it."}`;
}
