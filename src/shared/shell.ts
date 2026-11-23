/**
 * A filled screen that stays filled from world to world (NSWP-02, "A client that keeps the screen").
 *
 * A browser gives up a filled screen whenever the page changes. `/shell/` is one page of BitPortal's that fills the
 * screen once and never changes: the room, the Airlock and each world are shown in a frame inside it, so going
 * through a door changes what is in the frame and nothing else.
 *
 * It can only show a place that lets BitPortal frame it. Those are named here, and they are BitPortal's own
 * worlds: each says so itself, in its own content rules (`frame-ancestors`), and this list is what the page's
 * rules let it frame (`scripts/build.mjs`) and hand a microphone or a headset to. Anywhere else is gone to the
 * ordinary way, leaving this page: a site that hasn't said BitPortal may frame it would only show a blank.
 */
import worlds from "./shell-worlds.json";

/** The page that holds the screen. */
export const SHELL_PATH = "/shell/";
/** The sites that may be shown in it, each by its origin. */
export const SHELL_WORLDS: readonly string[] = worlds;

/** Whether this page is being shown inside that page: framed, by a page of this same site, at that address. */
export function inShell(self: Window = window): boolean {
  try {
    const top = self.top;
    return !!top && top !== self && top.location.origin === self.location.origin && top.location.pathname.startsWith(SHELL_PATH);
  } catch {
    // Framed by another site: its address can't be read, and it isn't ours.
    return false;
  }
}

/** Whether an address may be shown in the frame: a page of this site that lets itself be framed, or one of the worlds named. */
export function showsInShell(address: string, here: string = location.origin): boolean {
  try {
    const to = new URL(address, here);
    if (to.protocol !== "https:" && to.origin !== here) return false;
    if (to.origin === here) return /^\/(walk|go)\//.test(to.pathname);
    return SHELL_WORLDS.includes(to.origin);
  } catch {
    return false;
  }
}

/**
 * Go to an address from a page that may be in the frame. `real` is where it really leads, which is what says
 * whether it can be shown there (on a development server `address` is a local copy of it). A place that can't be
 * framed is gone to by the whole page, the ordinary way.
 */
export function goFrom(address: string, o: { real?: string; replace?: boolean } = {}): void {
  const whole = inShell() && !showsInShell(o.real ?? address);
  // The page that holds the screen is told where its frame is being sent, so that if the place doesn't come up
  // there (it has changed who may frame it, or can't be reached) it is gone to the ordinary way instead.
  if (inShell() && !whole) {
    try {
      window.parent.postMessage({ nswp: "going", to: new URL(address, location.href).href }, location.origin);
    } catch {
      /* it goes all the same */
    }
  }
  const where = whole ? window.top!.location : location;
  if (o.replace && !whole) where.replace(address);
  else where.assign(address);
}

/**
 * For a page that may be in the frame: a link on it to somewhere that can't be shown there (the front page, the
 * page a look is made on) opens in the whole page. Without this it would open in the frame, and show a blank.
 */
export function linksLeaveWhole(): void {
  if (!inShell()) return;
  document.addEventListener("click", (e) => {
    const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!link || e.defaultPrevented || link.target === "_blank" || showsInShell(link.href)) return;
    e.preventDefault();
    window.top!.location.assign(link.href);
  });
}

// ---------------------------------------------------------------- every way in goes through it

/** Where this tab keeps that it is to go the ordinary way: the page that holds the screen didn't work here. */
export const PLAIN_KEY = "bitportal:plain";

/**
 * Whether a page of BitPortal opened by its own address should be shown inside the page that keeps the screen
 * instead (the owner, 2026-11-21: "should be our new default process and the old method should be our fall back").
 *
 * On every device (the owner, later that day, having tried it on a phone: "works well on mobile. Make it the
 * default for all modes. Including VR"). It began as a desk's alone, since a desk is where a filled screen is
 * lost at every door; but it is also what draws the sign-in address's panel over the world, so a phone and a
 * headset's browser want it as much. Where a screen can't be filled at all the page says so, and worlds offer no
 * control for it (`holds` in src/shell/main.ts).
 *
 * Not in a frame already, and not in a tab that has been told to go the ordinary way (`?plain=1`, or the page
 * that holds the screen having found that what it showed didn't come up). That stays: it is the way back for a
 * browser this turns out not to work in.
 */
export function shellWanted(w: Window = window): boolean {
  try {
    if (w.top !== w) return false;
    const asked = new URLSearchParams(w.location.search).get("plain");
    if (asked === "1") w.sessionStorage.setItem(PLAIN_KEY, "1");
    if (asked === "0") w.sessionStorage.removeItem(PLAIN_KEY);
    return w.sessionStorage.getItem(PLAIN_KEY) !== "1";
  } catch {
    return false;
  }
}

/**
 * Called first thing by the room and the Airlock: opened as a page of its own where the other way is wanted, it
 * is opened again inside the page that keeps the screen, at the same address, and this page does nothing more.
 * Returns whether it is going.
 */
export function enterShell(): boolean {
  if (!shellWanted()) return false;
  location.replace(`${SHELL_PATH}#to=${encodeURIComponent(`${location.pathname}${location.search}${location.hash}`)}`);
  return true;
}

const say = (words: Record<string, unknown>): void => {
  try {
    if (inShell()) window.parent.postMessage(words, location.origin);
  } catch {
    /* nobody to tell */
  }
};

/**
 * For a page of BitPortal's that isn't made with the kit (the Airlock): say it came up, as a world's page says
 * (the kit's client-frame.ts), and ask for the screen at the visitor's first press if they prefer it filled.
 */
export function helloShell(o: { saidByKit?: boolean } = {}): void {
  if (!inShell()) return;
  let isFilled = false;
  addEventListener("message", (e) => {
    if (e.source !== window.parent || e.origin !== location.origin) return;
    const said = e.data as { nswp?: unknown; filled?: unknown } | null;
    if (said && typeof said === "object" && said.nswp === "screen") isFilled = said.filled === true;
  });
  // Said here unless this page's own copy of the kit says it, which it does where the page speaks the menu's words
  // (the Airlock: go/menu.ts). A page says `here` once: the page above takes a second as the next page's, and one
  // that didn't say it speaks those words would undo one that did.
  if (!o.saidByKit) say({ nswp: "here", at: location.pathname });
  let prefers = false;
  try {
    prefers = localStorage.getItem("nswp:full") === "1";
  } catch {
    /* nothing kept */
  }
  if (!prefers) return;
  const onPress = (e: Event): void => {
    if ((e as KeyboardEvent).code === "Escape" || isFilled) return;
    say({ nswp: "screen", fill: true });
  };
  for (const type of ["keydown", "pointerup", "touchend"] as const) addEventListener(type, onPress, true);
}
