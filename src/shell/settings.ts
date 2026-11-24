/**
 * The visitor's settings, as the page that keeps the screen says them to the place in its frame. One reader, used
 * by the page's first file (which answers a place at once that this page has the menu) and by the menu's own file
 * (which says them from then on): so the first answer and the menu's can't differ.
 *
 * It reads what is kept for this site and nothing else:
 *
 * - what the kit's own parts keep, each under its own name (shared/prefs.ts: the same reading the Airlock carries a
 *   visitor's settings from), which is where a change made in the menu is written as it is made; and
 * - what a world last reported from its headset session (below), which no part of the kit in this page holds.
 *
 * Cleaned by the core as a link's settings are. "Load people's files from anywhere" is never said, on or off, and
 * nor is what is in their hand: the kit's own end leaves both out of what it says, and so does this.
 */
import { cleanMenuSettings, type MenuSettings, type TravelSettings } from "@nswp/core";
import { keptSettings } from "../shared/prefs.js";

/**
 * What a world reported the visitor changed in its headset session, kept for this site. Inside a headset only the
 * world can draw the console, so it is there that they change how they turn and move, and the world says so
 * upward (comfort and layout only, by the kit's own list, already cleaned). Most of it is held by no part of the
 * kit in this page, which moves nobody: so it is kept here, and said to every world from then on, across a reload
 * of this page too.
 */
export const REPORTED_KEY = "bitportal:reported";
export function keptReport(store: Pick<Storage, "getItem"> | null): TravelSettings {
  try {
    const kept = JSON.parse(store?.getItem(REPORTED_KEY) ?? "null") as unknown;
    return kept && typeof kept === "object" && !Array.isArray(kept) ? (kept as TravelSettings) : {};
  } catch {
    return {};
  }
}
export function keepReport(report: TravelSettings, store: Pick<Storage, "getItem" | "setItem"> | null): void {
  try {
    store?.setItem(REPORTED_KEY, JSON.stringify({ ...keptReport(store), ...report }));
  } catch {
    /* kept for as long as this page lives, then */
  }
}
export const storage = (): Storage | null => {
  try {
    return localStorage;
  } catch {
    return null;
  }
};

/** The settings to say to a place, now. What the kit's parts keep comes over what a world reported: it is newer. */
export function shellSettings(store: Pick<Storage, "getItem"> | null = storage()): MenuSettings {
  const { filesAnywhere: _notSaid, holding: _saidAtAPress, ...rest } = cleanMenuSettings({ ...keptReport(store), ...keptSettings(store) });
  return rest;
}
