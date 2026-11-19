/**
 * Where a visitor came to the sign-in page from, and so where "carry on"
 * leads. Only the places named here: an address is never taken from the link,
 * so a link to this page can't be made to send anyone somewhere else.
 *
 * One of them is a world. A visitor who asked to sign in from inside a world
 * (NSWP-10, "Signing in from inside a world") is offered the way back to it.
 * That way is the door this site's own Airlock kept for the tab (who.ts), and
 * it leads to the Airlock and nowhere else: the door is checked there, as any
 * door is, before anyone goes through it.
 */
import type { WhoDoor } from "../shared/who.js";

export interface WayBack {
  /** Where to go, or null to go back the way they came. */
  href: string | null;
  /** What the way back is called. */
  label: string;
  /** The same, for someone who chose to stay anonymous. */
  guest: string;
  /** The world they asked to come back to, when that is where this leads. */
  door?: WhoDoor;
  /** The way back for someone signed in, who goes by name. Only with a door. */
  named?: string;
}

export function wayBack(search: string, door: WhoDoor | null = null): WayBack {
  const q = new URLSearchParams(search);
  const back = q.get("back");
  if (back === "walk") {
    // They left a headset session to come here: the room offers the way back into one first.
    return { href: q.get("xr") === "1" ? "/walk/#back&xr=1" : "/walk/#back", label: "Back to your room", guest: "Back to your room, as a guest" };
  }
  // Come from the sign-in window a world opened (src/connect/main.ts): back to it, in this same window.
  if (back === "connect") return { href: "/connect/", label: "Back to what the world asked", guest: "Go back without signing in" };
  if (back === "history") return { href: null, label: "Back to where you were", guest: "Go back, as a guest" };
  if (back === "door" && door) {
    const where = door.host || "where you were";
    return { href: `/go/#${door.hash}`, label: `Back to ${where}`, guest: "Go back as a guest", named: `Back to ${where}, by name`, door };
  }
  return { href: "/", label: "Back to the lobby", guest: "Carry on as a guest" };
}

/**
 * Why signing in can't work at this address, or null when it can. BitLogin opens an account with the browser's own
 * cryptography, and a browser gives a page that only at an https address or at localhost.
 */
export function cannotSignInHere(o: { secure: boolean; subtle: boolean; host: string; protocol: string }): string | null {
  if (o.secure && o.subtle) return null;
  const where = o.protocol === "http:" ? `This page is at a plain http address (${o.host}), so` : "Here,";
  return `${where} your browser has switched off the cryptography that signing in needs. Signing in will fail with "Account not found or credentials incorrect", whatever you type. It works at an https address, and at localhost on the computer that is serving this page. Everything else here works as a guest.`;
}
