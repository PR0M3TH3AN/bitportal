/**
 * The page that holds the screen (src/shared/shell.ts). Everything a visitor sees is in its one frame: the room,
 * the Airlock, each world. The frame's page changes at every door and this one never does, so a filled screen
 * stays filled.
 *
 * It does three things and nothing else:
 *
 * - **It fills the screen when the place in its frame asks,** at the visitor's press there, and says back whether
 *   it is filled (the kit's client-frame.ts; the same few words from this site's own Airlock). So the visitor's
 *   own control for it, in every menu, works here as anywhere, and their preference is what decides.
 * - **It remembers where they are,** so loading this page again comes back to the same place and not to the room.
 * - **It goes the ordinary way when the frame fails.** A place that doesn't say it came up is opened as a page
 *   of its own, as it always was.
 * - **It shows the sign-in address's panel when the place in its frame asks,** at the visitor's press there, over
 *   the world and in place of a window (panel.ts). So signing in doesn't give up the screen either.
 *
 * It can't see into a world it frames, or into the panel, and doesn't try to.
 */
import { fromLocal, toLocal } from "@nswp/core";
import { INSTANCE } from "../shared/instance.js";
import { PLAIN_KEY, showsInShell } from "../shared/shell.js";
import { createPanel, isPanelMode, readMenuPlace, type Panel, type PanelMode } from "./panel.js";

const view = document.getElementById("view") as HTMLIFrameElement;
/** Where this tab keeps the place that is in the frame. */
const AT_KEY = "bitportal:shell-at";
/**
 * How long a place is given to say it came up: once the browser says its page has loaded, and at the very most.
 * A browser doesn't always say that a page it refused to show in a frame has "loaded", so the second is what a
 * world that won't be framed costs: a blank for that long, and then the ordinary way. A world says it came up as
 * soon as its script begins, well before it has finished loading, so only a very slow line is ever caught by it.
 */
const HELLO_MS = 4000;
const AT_MOST_MS = 15_000;

/** The sign-in address: the real one, which is what a world knows its own signer by. */
const SIGN_IN = new URL(INSTANCE.signer ?? "https://bitlogin.network/").origin;
const filled = (): boolean => !!document.fullscreenElement;
const tell = (): void => {
  // To whatever is in the frame: whether the screen is filled is nobody's secret, nor that this page can show the
  // sign-in address's panel, and whose.
  // `holds` is whether this page can fill a screen at all: where a browser can't (a phone's, some of them), the
  // place in the frame is told so and offers no control for it, as it wouldn't as a page of its own.
  view.contentWindow?.postMessage({ nswp: "screen", holds: document.fullscreenEnabled === true, filled: filled(), signIn: SIGN_IN }, "*");
};
/** The panel, once it is known where the sign-in address is reached from here (a local copy, on a development server). */
let panel: Panel | null = null;
void toLocal(`${SIGN_IN}/`)
  .then((at) => new URL(at).origin)
  .catch(() => SIGN_IN)
  .then((at) => {
    panel = createPanel({
      at,
      told: (open, more) => {
        view.contentWindow?.postMessage({ nswp: "sign-in", open, ...(more?.failed ? { failed: true } : {}), ...(more?.allowed ? { allowed: true } : {}) }, "*");
        // The keys go back to the world as the panel goes.
        if (!open) view.focus();
      },
    });
  });
/** Whether the visitor has only just pressed something, by the browser's own account (a press in a frame counts for this page). */
const pressed = (): boolean => (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation?.isActive !== false;

/** An address as a secure web address, or null: nothing else is ever gone to from here. */
const webAddress = (address: string): string | null => {
  try {
    const to = new URL(address, location.href);
    return to.protocol === "https:" || to.origin === location.origin ? to.href : null;
  } catch {
    return null;
  }
};

/** The room, asked for the ordinary way: what is gone to when nothing here works. */
const ROOM_PLAIN = "/walk/?plain=1";
/** What the frame was last sent to, if it has yet to say it came up: gone to as a page of its own if it never does. */
let awaited: { to: string; timer: ReturnType<typeof setTimeout> } | null = null;
const giveUp = (): void => {
  const to = awaited?.to ?? ROOM_PLAIN;
  awaited = null;
  try {
    sessionStorage.removeItem(AT_KEY);
    // The room itself didn't come up in the frame: this tab goes the ordinary way from now on.
    if (to === ROOM_PLAIN) sessionStorage.setItem(PLAIN_KEY, "1");
  } catch {
    /* it goes all the same */
  }
  location.assign(to);
};
const await_ = (to: string): void => {
  if (awaited) clearTimeout(awaited.timer);
  awaited = { to, timer: setTimeout(giveUp, AT_MOST_MS) };
};
const cameUp = (): void => {
  if (awaited) clearTimeout(awaited.timer);
  awaited = null;
};

addEventListener("message", (e: MessageEvent) => {
  if (e.source !== view.contentWindow) return;
  const said = e.data as { nswp?: unknown; fill?: unknown; at?: unknown; to?: unknown } | null;
  if (!said || typeof said !== "object") return;
  if (said.nswp === "here") {
    cameUp();
    // Where they are, to come back to: a page of this site by its path, a world by its address. Never the
    // Airlock, which is a moment on the way, and never anything but a place that may be shown here.
    const at = typeof said.at === "string" && said.at.startsWith("/") && said.at.length <= 300 ? said.at : "/";
    const where = e.origin === location.origin ? at : `${e.origin}${at}`;
    // At the Airlock they are between places, and if they stay there (a door that won't open, a way home it
    // couldn't read) the place to come back to is the room: never the world they were in before it.
    if (e.origin === location.origin && at.startsWith("/go/")) void remember("/walk/");
    else void remember(where);
    // Said for the page that has just loaded (late), or for the one about to (a place says it as its script starts,
    // before its page has finished loading).
    if (unheard) {
      clearTimeout(unheard);
      unheard = null;
    } else heard = true;
    tell();
  } else if (said.nswp === "screen" && typeof said.fill === "boolean") {
    // Asked at the visitor's own press in the frame, which a browser counts for this page too.
    void (said.fill ? document.documentElement.requestFullscreen() : document.exitFullscreen()).catch(() => tell());
  } else if (said.nswp === "sign-in" && isPanelMode((said as { mode?: unknown }).mode)) {
    // Only at the visitor's own press in the frame: a world doesn't get to put a sign-in in front of someone.
    if (!panel || panel.open || !pressed()) return;
    const mode = (said as { mode: PanelMode }).mode;
    const menu = readMenuPlace((said as { menu?: unknown }).menu);
    const asker = e.origin;
    // And only for a place that may be shown here: this site's own pages, and the worlds named.
    void (asker === location.origin ? Promise.resolve(true) : mayShow(asker)).then((may) => {
      // Still the same place in the frame: the answer is for whoever asked.
      if (may && e.source === view.contentWindow) panel?.show(asker, mode, menu);
    });
  } else if (said.nswp === "going" && e.origin === location.origin && typeof said.to === "string") {
    // This site's own Airlock is sending the frame on: if the place doesn't come up here, it is gone to whole.
    // Only ever to a web address: what is kept here is what this whole page may be sent to.
    const to = webAddress(said.to);
    if (to) await_(to);
  }
});
document.addEventListener("fullscreenchange", () => {
  tell();
  // The keys are the world's: they go to whatever is in the frame, not to this page.
  view.focus();
});
/** Whether the page coming into the frame has said where it is, before its page finished loading. */
let heard = false;
/** Waiting, after a page loaded without saying, for it to say so late. */
let unheard: ReturnType<typeof setTimeout> | null = null;
view.addEventListener("load", () => {
  // A panel that was up was for the place that has gone.
  panel?.close();
  // A page came into the frame and never said where it is (a browser's own "refused to connect", say): what was
  // kept is no longer where they are, so a refresh comes back to the room instead of an older place.
  if (unheard) clearTimeout(unheard);
  unheard = null;
  if (heard) heard = false;
  else
    unheard = setTimeout(() => {
      unheard = null;
      forgetWhere();
    }, HELLO_MS);
  // Each place that comes into the frame is given the keys as it arrives: a visitor walks on with no press.
  view.focus();
  // Its page has loaded, so it has had its chance to say so: a little longer, and then the ordinary way.
  if (awaited) {
    clearTimeout(awaited.timer);
    awaited.timer = setTimeout(giveUp, HELLO_MS);
  }
});

/**
 * Whether a place may be shown here, by where it really is: on a development server a world is a copy at a local
 * address, and it is the world it is a copy of that is on the list.
 */
const mayShow = async (where: string): Promise<boolean> => {
  if (where.startsWith("/")) return showsInShell(where);
  try {
    return showsInShell(await fromLocal(where));
  } catch {
    return false;
  }
};
const forgetWhere = (): void => {
  try {
    sessionStorage.removeItem(AT_KEY);
  } catch {
    /* nothing kept */
  }
};
const remember = async (where: string): Promise<void> => {
  if (!(await mayShow(where))) return;
  try {
    sessionStorage.setItem(AT_KEY, where);
  } catch {
    /* it begins at the room next time */
  }
};

/** Where to begin: where this page was asked to open, else where they were, else the room. */
const begin = async (): Promise<string> => {
  const asked = new URLSearchParams(location.hash.replace(/^#/, "")).get("to");
  if (asked) {
    // Taken off the address at once, so loading this page again doesn't arrive a second time.
    history.replaceState(history.state, "", location.pathname);
    // A page of this site, by its path; or a page of one of the worlds named, by its address, shown here as a door
    // to that world would show it. Never anything else: this is not a way to have some other site shown here.
    if (asked.startsWith("/") && !asked.startsWith("//") && showsInShell(asked)) return asked;
    if (/^https:\/\//.test(asked) && asked.length <= 6000 && (await mayShow(asked))) return asked;
  }
  try {
    const kept = sessionStorage.getItem(AT_KEY);
    if (kept && (await mayShow(kept))) return kept;
  } catch {
    /* the room, then */
  }
  return "/walk/";
};
void begin().then((first) => {
  await_(first.startsWith("/") ? ROOM_PLAIN : first);
  view.src = first;
});
