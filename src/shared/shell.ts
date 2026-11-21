/**
 * A filled screen that stays filled from world to world (a trial; NSWP-02, "A client that keeps the screen").
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
