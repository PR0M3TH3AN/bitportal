/**
 * The notice that this is an early prototype.
 *
 * The owner, 2026-11-21: "a pop-up modal saying that this is early in
 * dvelopment and is a prototype only. Not ready for a ton of users. And many
 * features that are planned have not been fully developed or proven at
 * scale." (NSWP `docs/backlog/landing-04-prototype-notice.md`.)
 *
 * A visitor is told once, as they arrive, and goes on with one press. This
 * browser remembers that they were told, for a good while, and nothing else:
 * it is not a setting, it is kept with nobody's profile, and nothing is sent
 * anywhere. It is shown where someone arrives (the landing page, the room)
 * and never in the middle of a visit: not on the Airlock, not to someone
 * coming home from a world, and never over a headset session, which a page
 * can't be seen from anyway.
 */
const KEY = "bitportal:told-prototype";
/** How long someone who has been told is not told again: ninety days. */
export const TOLD_FOR = 90 * 24 * 60 * 60 * 1000;

export const NOTICE = {
  title: "This is an early prototype",
  words: [
    "BitPortal is early in development, and a prototype only. It isn't ready for a lot of people at once.",
    "Many of the features planned for it aren't fully built yet, or proven at scale.",
  ],
  go: "Go on",
} as const;

type Store = Pick<Storage, "getItem" | "setItem">;
const store = (): Store | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/** Whether this browser was told within the last good while. A browser that keeps nothing was never told. */
export function toldLately(now = Date.now(), kept: Store | null = store()): boolean {
  try {
    const at = Number(kept?.getItem(KEY));
    // A time that hasn't come yet was never written by this page: not believed.
    return Number.isFinite(at) && at > 0 && at <= now && now - at < TOLD_FOR;
  } catch {
    return false;
  }
}

export function rememberTold(now = Date.now(), kept: Store | null = store()): void {
  try {
    kept?.setItem(KEY, String(now));
  } catch {
    /* a browser that keeps nothing is told again next time */
  }
}

export interface NoticeOptions {
  /** They are in the middle of a visit (coming home from a world, say): nothing is shown, whatever this browser remembers. */
  midVisit?: boolean;
  /** Larger things to press: read on a headset's flat panel with a controller's ray. */
  large?: boolean;
}

/**
 * Tell the visitor, if they haven't been told lately: a sheet over the page
 * with one thing to press. Returns whether it was shown.
 *
 * A browser driven by a script is not told, so that a test of anything else
 * isn't a test of this; `?notice=1` shows it to one all the same, and to
 * anyone, which is how it is looked at.
 */
export function prototypeNotice(opts: NoticeOptions = {}): boolean {
  const asked = new URLSearchParams(location.search).get("notice") === "1";
  if (opts.midVisit) return false;
  if (!asked && (toldLately() || navigator.webdriver)) return false;
  if (document.querySelector("dialog.notice")) return false;
  const sheet = document.createElement("dialog");
  sheet.className = `sheet notice${opts.large ? " large" : ""}`;
  sheet.setAttribute("aria-labelledby", "notice-title");
  const title = document.createElement("h2");
  title.id = "notice-title";
  title.textContent = NOTICE.title;
  const go = document.createElement("button");
  go.type = "button";
  go.className = "button primary";
  go.textContent = NOTICE.go;
  // Remembered at the press itself, not when the browser gets round to saying the sheet has closed.
  let told = false;
  const done = () => {
    if (told) return;
    told = true;
    rememberTold();
    sheet.remove();
  };
  go.addEventListener("click", () => {
    sheet.close();
    done();
  });
  sheet.append(title, ...NOTICE.words.map((w) => Object.assign(document.createElement("p"), { textContent: w })), go);
  // However it is put away (the button, Escape, a headset's back), they have been told.
  sheet.addEventListener("close", done);
  document.body.append(sheet);
  sheet.showModal();
  go.focus();
  return true;
}
