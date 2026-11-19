/**
 * Staying joined as a visitor travels (NSWP-02 and NSWP-03, "Staying joined").
 *
 * A world's link may say its visitor was in the room there, and heard. A link is something anyone can write, so
 * what is done with it is decided here, in the visitor's own client:
 *
 * - Joined is passed on unless they untick it. Being seen in a room is what joining was, and it can be left at once.
 * - A microphone is passed on only when they have said, once, that theirs may stay on between worlds. Without
 *   that, a link somebody sent them could put a live microphone into a room of strangers.
 */

/** Session storage, this site only, read once: the Airlock telling BitPortal's own room its visitor arrives joined. */
export const ARRIVED_JOINED = "bitportal:arrived-joined";
/**
 * The same, for how they move: they were moving the intense way where they came from. Its value says on which
 * device, "desk" or "headset", since the two are separate choices: intense at a desk never makes a headset slide.
 */
export const ARRIVED_MOVING = "bitportal:arrived-moving";
/**
 * The settings a visitor came home with (their volumes, text size and the rest: NSWP-11, "Settings that travel"),
 * for this tab, handed from the Airlock to the room. Preferences, already cleaned by the kit.
 */
export const ARRIVED_SETTINGS = "bitportal:arrived-settings";
const MIC = "bitportal:travel-mic";

/** Whether the visitor has said their microphone may stay on from one world to the next. Off until they say so. */
export function micMayTravel(storage: Pick<Storage, "getItem"> | null = safeLocal()): boolean {
  try {
    return storage?.getItem(MIC) === "1";
  } catch {
    return false;
  }
}

export function setMicMayTravel(on: boolean, storage: Pick<Storage, "setItem" | "removeItem"> | null = safeLocal()): void {
  try {
    if (on) storage?.setItem(MIC, "1");
    else storage?.removeItem(MIC);
  } catch {
    /* it stays off */
  }
}

/**
 * What goes on to the next place, from what a link says and what the visitor chose. A microphone never goes
 * without joined, and never without their say-so.
 */
export function carriedOn(link: { joined?: boolean; mic?: boolean }, chose: { stay: boolean; mic: boolean }): { joined?: true; mic?: true } {
  if (!link.joined || !chose.stay) return {};
  return { joined: true, ...(link.mic && chose.mic ? { mic: true as const } : {}) };
}

function safeLocal(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}
