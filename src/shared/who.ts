/**
 * Signing in from inside a world (NSWP-10, "Signing in from inside a world").
 *
 * A world never shows a sign-in. Its menu has a control that leaves for the
 * visitor's own client instead, with a door back to the same world and a
 * request: `who=1`. Here that means the Airlock sends them to the sign-in
 * page first, and the sign-in page offers the way back through the Airlock,
 * which checks the door as it checks any other.
 *
 * Two small things are kept for the tab, and only the Airlock and the
 * sign-in page write them:
 *
 * - the door they asked to come back to, so the sign-in page never takes an
 *   address from its own link;
 * - what they pressed on the sign-in page, for that one door: by name, or as
 *   a guest.
 *
 * The request is a link's word, and a link is something anyone can write. So
 * it only ever shows the visitor a choice. Nobody is signed in by it, and
 * nobody goes anywhere by name without having pressed the button that says
 * so, on this site's own page.
 */
import { checkDestination, parseAirlockFragment } from "@nswp/core";

export const WHO_DOOR = "bitportal:who-door";
export const GO_AS_ONCE = "bitportal:go-as-once";
/** How long the way back is offered. Long enough to make a profile; not so long that it turns up days later. */
export const WHO_DOOR_LASTS = 30 * 60 * 1000;
/** A door's link is short. Anything much longer than what a door carries isn't kept. */
export const WHO_DOOR_MOST = 4096;

export interface WhoDoor {
  /** The Airlock's fragment for the door, with the request taken out. */
  hash: string;
  /** The site's host, to say where the way back leads. "" when the door names no address. */
  host: string;
  at: number;
}

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** This tab's own storage, or nothing where a browser won't give it. */
export function tabStore(): Storage | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    return null;
  }
}

/** The fragment without the request: what the Airlock is opened with on the way back. */
export function doorWithoutWho(hash: string): string {
  return hash
    .replace(/^#/, "")
    .split("&")
    .filter((part) => part && !/^who=/.test(part))
    .join("&");
}

/** The door a fragment asks to come back to, if it is such a request and a door at all. */
export function whoDoorFrom(hash: string, now: number): WhoDoor | null {
  const req = parseAirlockFragment(hash);
  if (!req?.who) return null;
  const rest = doorWithoutWho(hash);
  if (rest.length > WHO_DOOR_MOST || !parseAirlockFragment(rest)) return null;
  const checked = req.url ? checkDestination(req.url) : null;
  return { hash: rest, host: checked?.ok ? new URL(checked.value.url).host : "", at: now };
}

export function keepWhoDoor(door: WhoDoor, store: Store | null): void {
  try {
    store?.setItem(WHO_DOOR, JSON.stringify(door));
  } catch {
    /* the sign-in page offers the lobby instead */
  }
}

/** The door kept for this tab, while it is still worth offering. Anything that isn't one is nothing. */
export function readWhoDoor(store: Pick<Storage, "getItem"> | null, now: number): WhoDoor | null {
  try {
    const kept = JSON.parse(store?.getItem(WHO_DOOR) ?? "null") as Partial<WhoDoor> | null;
    if (!kept || typeof kept.hash !== "string" || typeof kept.host !== "string" || typeof kept.at !== "number") return null;
    if (kept.hash.length > WHO_DOOR_MOST || now - kept.at > WHO_DOOR_LASTS || now < kept.at - 60_000) return null;
    const req = parseAirlockFragment(kept.hash);
    // What is kept is a door and nothing else: never the request again, which would go round in a circle.
    if (!req || req.who) return null;
    return { hash: kept.hash, host: kept.host, at: kept.at };
  } catch {
    return null;
  }
}

export function forgetWhoDoor(store: Pick<Storage, "removeItem"> | null): void {
  try {
    store?.removeItem(WHO_DOOR);
    store?.removeItem(GO_AS_ONCE);
  } catch {
    /* it runs out by itself */
  }
}

export type Once = "name" | "guest";

/** What they pressed on the sign-in page, for this one door. */
export function chooseOnce(how: Once, door: WhoDoor, store: Pick<Storage, "setItem"> | null): void {
  try {
    store?.setItem(GO_AS_ONCE, JSON.stringify({ how, hash: door.hash }));
  } catch {
    /* the Airlock goes on what they chose before */
  }
}

/**
 * Their choice for the door the Airlock has just been opened with, read once.
 * A choice made for one door is never used at another.
 */
export function takeOnce(hash: string, store: Store | null): Once | null {
  try {
    const kept = JSON.parse(store?.getItem(GO_AS_ONCE) ?? "null") as { how?: unknown; hash?: unknown } | null;
    store?.removeItem(GO_AS_ONCE);
    if (!kept || kept.hash !== hash.replace(/^#/, "")) return null;
    return kept.how === "name" || kept.how === "guest" ? kept.how : null;
  } catch {
    return null;
  }
}
