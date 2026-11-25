/**
 * The sign-in address's own panel, drawn over the world (the owner, 2026-11-21: "Keep all of it in app and not in
 * a separate window. I want all of bitportal to feel like one cohesive experience.").
 *
 * A window opening gives up a filled screen, as a door does. So where a visitor would have been sent to BitLogin's
 * window, the page that holds the screen shows BitLogin's panel instead: BitLogin's own page, in a second frame
 * beside the world's, laid over it where the world's menu is. BitLogin lists this page by name as one that may
 * (its `frame-ancestors`); no world may, because a page that frames a question can cover it or slide it under a
 * press. A world can do neither to a frame that is its sibling in a page it can't script.
 *
 * BitPortal still holds no key, no session and no form: everything in the panel is BitLogin's, at BitLogin's
 * address, and this page can't see into it. What passes between the two is BitLogin's to define (its
 * docs/sign-in-window.md, §SW19) and says nothing about the visitor: which world asked, what size the panel would
 * like to be, and that it is done.
 *
 * The panel finds the world's signer itself, in this page's frames and theirs, two deep and no deeper. So it must
 * be a frame of this page directly, beside the world's: never put it inside anything.
 */
const PROTOCOL = "bitlogin-panel";
const VERSION = 1;
/** How often the panel is told who is asking, until it says it heard: it can't speak first. */
const HELLO_EVERY_MS = 200;
/** How long it has to say so. After that the world is told, and its next press opens the window, as before. */
const READY_MS = 6000;

/**
 * What the panel is opened for (BitLogin's `PanelMode`). "secure" opens it straight on "Secure this account", where
 * this browser keeps the family's guest account (BitLogin docs/guest-accounts.md G6), and otherwise on the account
 * pages.
 */
export type PanelMode = "ask" | "switch" | "account" | "files" | "wallet" | "library" | "secure";
export const isPanelMode = (mode: unknown): mode is PanelMode => mode === "ask" || mode === "switch" || mode === "account" || mode === "files" || mode === "wallet" || mode === "library" || mode === "secure";
/** The modes that are a page of the person's own, for no world in particular: no world is named with them. */
const ownPage = (mode: PanelMode): boolean => mode === "account" || mode === "files" || mode === "wallet" || mode === "library" || mode === "secure";
/**
 * How many times a page of their own is asked for by its name before it is asked for as their account page: a
 * panel older than "files", "wallet" and "library" says nothing to those, and its account page leads to them.
 */
const OWN_PAGE_TRIES = 8;
/**
 * A panel kept between openings (BitLogin's docs/sign-in-window.md, §SW19.8): its frame stays, hidden, and is shown
 * again with `show` instead of being loaded anew, which is most of what an opening costs. This long hidden and it is
 * removed: BitLogin lets go of what its hidden panel holds after the same five minutes.
 */
const KEEP_MS = 5 * 60_000;
/**
 * How long a panel shown again has to say its size, which it does as it draws each screen (measured: under a tenth
 * of a second). A panel older than `show` says nothing to it: the frame is then removed and a new one loaded, as
 * before, and no frame is kept again by this page, so that wait is paid once.
 */
const SHOWN_MS = 1500;

/** Where the world's menu is, as the world says: used to draw the panel in its place, and never trusted. */
export interface MenuPlace {
  left: number;
  width: number;
  bottom: number;
}
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
export function readMenuPlace(said: unknown): MenuPlace | null {
  if (!said || typeof said !== "object") return null;
  const m = said as Record<string, unknown>;
  const left = num(m.left);
  const width = num(m.width);
  const bottom = num(m.bottom);
  return left === null || width === null || bottom === null ? null : { left, width, bottom };
}

/**
 * Where the panel goes on a screen this big: where the menu is if the world said, else where a menu would be.
 * Whatever the world said is held within the screen, and never so small that the panel couldn't be read: a world
 * doesn't get to hide the question or shrink it.
 */
export function placePanel(size: "menu" | "tall", screen: { width: number; height: number }, menu: MenuPlace | null, wished?: number | null): { left: number; width: number; bottom: number; height: number } {
  const edge = 10;
  const phone = screen.width < 640;
  const most = Math.max(200, screen.width - edge * 2);
  const width = Math.round(Math.min(most, Math.max(Math.min(320, most), menu?.width ?? Math.min(780, screen.width - (phone ? 20 : 40)))));
  const left = Math.round(Math.min(screen.width - width - edge, Math.max(edge, menu?.left ?? (screen.width - width) / 2)));
  // A phone has no room to spare: the tall panel takes the whole screen, less a margin.
  const bottom = size === "tall" && phone ? edge : Math.round(Math.min(screen.height * 0.4, Math.max(edge, menu?.bottom ?? (phone ? 118 : 132))));
  const room = Math.max(160, screen.height - bottom - edge);
  // How tall its content is, where the panel says: as tall as that and no taller, so nothing of the world is
  // covered by an empty panel. Never shorter than can be read, and never more than the screen has.
  if (typeof wished === "number" && Number.isFinite(wished)) return { left: Math.max(0, left), width, bottom, height: Math.round(Math.min(room, Math.max(Math.min(PANEL_FLOOR, room), wished))) };
  return { left: Math.max(0, left), width, bottom, height: Math.round(size === "tall" ? room : Math.min(640, room)) };
}

/** The least a panel is ever drawn, whatever it says of its height: enough for its bar and a question. */
const PANEL_FLOOR = 240;
/** The box's own top and bottom edges (its border, in public/bitportal.css), which its height includes. */
const PANEL_EDGES = 2;

/** BitLogin's panel saying it signed out or locked: exactly that, and nothing else counts. */
const isGone = (said: unknown): boolean => {
  if (!said || typeof said !== "object") return false;
  const m = said as { bitlogin?: unknown; v?: unknown; t?: unknown; why?: unknown };
  return m.bitlogin === PROTOCOL && m.v === VERSION && m.t === "gone" && (m.why === "signed-out" || m.why === "locked");
};

export interface Panel {
  /** Whether it is up. */
  readonly open: boolean;
  /** Whether a frame is being kept, hidden, for the next opening. */
  readonly kept: boolean;
  /** Show it, for the page at `asker` (its origin, as the browser reported it). Does nothing if one is up. */
  show(asker: string, mode: PanelMode, menu: MenuPlace | null): void;
  /** Take it away, if it is up: the place in the frame changed, or the visitor pressed outside it. Its frame is kept. */
  close(): void;
  /**
   * Whose place is in the frame now (its origin). A panel kept for another origin's place is removed: it is shown
   * again only for the place it was opened for.
   */
  placeIs(origin: string): void;
  /** Remove a kept frame, and one that is up. */
  drop(): void;
}

/**
 * The panel, for a page that holds the screen. `at` is the sign-in address's origin as it is reached from here (on
 * a development server, a local copy's). `told` is called as it comes up and as it goes.
 *
 * Between openings its frame is kept, hidden (§SW19.8). To a kept frame this page says `show` and `hide` and
 * nothing else: `show` only from `show()` here, which is called only at the visitor's press, and only for the origin
 * the frame was first opened for.
 */
export function createPanel(o: { at: string; told(open: boolean, more?: { failed?: boolean; allowed?: boolean }): void }): Panel {
  interface Up {
    box: HTMLElement;
    scrim: HTMLElement;
    frame: HTMLIFrameElement;
    asker: string;
    mode: PanelMode;
    size: "menu" | "tall";
    wished: number | null;
    menu: MenuPlace | null;
    ready: boolean;
    /** Whether the world has been told it is up: once for each opening, however the frame came. */
    said: boolean;
    hello: ReturnType<typeof setInterval> | null;
    giveUp: ReturnType<typeof setTimeout> | null;
    /** It said it signed out or locked while it was up: removed, not kept, when it closes. */
    gone?: boolean;
  }
  let up: Up | null = null;
  /** The frame kept from the last opening, hidden, and the origin it was opened for. */
  let kept: { box: HTMLElement; frame: HTMLIFrameElement; asker: string; old: ReturnType<typeof setTimeout> } | null = null;
  /** Whether the panel at this address has yet failed to answer `show`: one that has is never kept again. */
  let knowsShow = true;
  const place = (): void => {
    if (!up) return;
    // What it wishes is its content's height; the box is that and its own two edges.
    const p = placePanel(up.size, { width: innerWidth, height: innerHeight }, up.menu, up.wished === null ? null : up.wished + PANEL_EDGES);
    // Set as properties, one by one: this page's rules allow no style written into the page.
    up.box.style.setProperty("--panel-left", `${p.left}px`);
    up.box.style.setProperty("--panel-width", `${p.width}px`);
    up.box.style.setProperty("--panel-bottom", `${p.bottom}px`);
    up.box.style.setProperty("--panel-height", `${p.height}px`);
  };
  const say = (frame: HTMLIFrameElement, message: Record<string, unknown>): void => {
    // Addressed to BitLogin's origin: nothing else that might be in the frame hears it.
    try {
      frame.contentWindow?.postMessage({ bitlogin: PROTOCOL, v: VERSION, ...message }, o.at);
    } catch {
      /* a frame that can't be spoken to is removed when its time is up */
    }
  };
  const drop = (): void => {
    if (!kept) return;
    clearTimeout(kept.old);
    kept.box.remove();
    kept = null;
  };
  /** Take it down. A frame that had come up is kept, hidden and told so; one that never did is removed. */
  const end = (more?: { failed?: boolean; allowed?: boolean }, keep = true): void => {
    if (!up) return;
    const was = up;
    up = null;
    if (was.hello) clearInterval(was.hello);
    if (was.giveUp) clearTimeout(was.giveUp);
    was.scrim.remove();
    if (keep && knowsShow && was.ready && !was.gone && !more?.failed) {
      was.box.dataset.kept = "";
      say(was.frame, { t: "hide" });
      kept = { box: was.box, frame: was.frame, asker: was.asker, old: setTimeout(drop, KEEP_MS) };
    } else was.box.remove();
    o.told(false, more);
  };
  const cameUp = (): void => {
    if (!up || up.said) return;
    up.said = true;
    o.told(true);
  };
  // A kept panel says one thing while hidden: that it signed out, or locked (§SW19.8, `gone`). Its frame is removed
  // at once. Only `why` is read, and only those two words; it says nothing of the account.
  addEventListener("message", (e: MessageEvent) => {
    if (e.origin !== o.at || !isGone(e.data)) return;
    if (kept && e.source === kept.frame.contentWindow) drop();
    // One that is up is what the visitor is looking at: it stays until it closes, and is not kept then.
    else if (up && e.source === up.frame.contentWindow) up.gone = true;
  });
  // A kept panel may load its page afresh while hidden (BitLogin, a new build served: it reloads itself in the same
  // frame and says `ready` again). A `hide` said while it was loading was heard by nobody, so a page that comes up
  // hidden would think itself shown. Its `ready`, from that frame's own window at BitLogin's own address, is
  // answered with `hide` again: the one thing a hidden panel is heard saying, and nothing else is read from it.
  addEventListener("message", (e: MessageEvent) => {
    if (!kept || e.source !== kept.frame.contentWindow || e.origin !== o.at) return;
    const said = e.data as { bitlogin?: unknown; v?: unknown; t?: unknown } | null;
    if (said && typeof said === "object" && said.bitlogin === PROTOCOL && said.v === VERSION && said.t === "ready") say(kept.frame, { t: "hide" });
  });
  addEventListener("message", (e: MessageEvent) => {
    // Only BitLogin's own page, in the frame this page made for it, at BitLogin's own address. A hidden one is not
    // heard here (its one word, `ready`, is answered above).
    if (!up || e.source !== up.frame.contentWindow || e.origin !== o.at) return;
    const said = e.data as { bitlogin?: unknown; v?: unknown; t?: unknown; size?: unknown; height?: unknown; allowed?: unknown } | null;
    if (!said || typeof said !== "object" || said.bitlogin !== PROTOCOL || said.v !== VERSION) return;
    if (said.t === "ready") {
      if (up.ready) return;
      up.ready = true;
      if (up.hello) clearInterval(up.hello);
      up.hello = null;
      if (up.giveUp) clearTimeout(up.giveUp);
      up.giveUp = null;
      delete up.box.dataset.waiting;
      up.frame.focus();
      cameUp();
    } else if (said.t === "size" && (said.size === "menu" || said.size === "tall")) {
      // A wish: what it gets is this page's to say, and stays on the screen. With it, how tall its content is
      // (said again whenever that changes): the panel is then drawn that tall, within the same bounds.
      up.size = said.size;
      up.wished = num(said.height);
      // A panel shown again has drawn its screen: it knew `show`.
      if (up.ready && up.giveUp) {
        clearTimeout(up.giveUp);
        up.giveUp = null;
      }
      place();
    } else if (said.t === "close") {
      end({ allowed: said.allowed === true });
    }
  });
  addEventListener("resize", place);
  // Escape, where this page has the keys (a press outside the panel gives them to it): the panel's own close is
  // the ordinary way out, and this is the one that works even if the panel never drew.
  addEventListener("keydown", (e: KeyboardEvent) => {
    if (up && e.key === "Escape") end();
  });
  // The frame goes with this page, said plainly: nothing of the sign-in address's is left behind it.
  addEventListener("pagehide", () => {
    end(undefined, false);
    drop();
  });
  const scrimFor = (): HTMLElement => {
    const scrim = document.createElement("div");
    scrim.className = "shell-scrim";
    scrim.addEventListener("click", () => end());
    return scrim;
  };
  /** A new frame, loaded from nothing and told who is asking until it says it heard. */
  const anew = (asker: string, mode: PanelMode, menu: MenuPlace | null, said: boolean): void => {
    const scrim = scrimFor();
    const box = document.createElement("div");
    box.className = "shell-panel";
    box.dataset.waiting = "";
    const wait = document.createElement("p");
    wait.className = "shell-panel-wait";
    let host = o.at;
    try {
      host = new URL(o.at).host;
    } catch {
      /* said as it is */
    }
    wait.textContent = `Asking ${host}…`;
    const frame = document.createElement("iframe");
    frame.title = "Sign in";
    // A passkey may be used and made in it, by BitLogin's own address and nobody else. Nothing else is handed on.
    frame.allow = `publickey-credentials-get ${o.at}; publickey-credentials-create ${o.at}`;
    frame.referrerPolicy = "no-referrer";
    // With the last slash: without it BitLogin serves its window's rules, which refuse to be framed.
    frame.src = `${o.at}/connect/panel/`;
    box.append(wait, frame);
    let tries = 0;
    const hello = (): void => {
      // A panel that doesn't know "files" or "wallet" leaves them unanswered: after a moment it is asked for
      // the account page instead, which every panel has, and which leads to both.
      const as: PanelMode = (mode === "files" || mode === "wallet" || mode === "library" || mode === "secure") && tries++ >= OWN_PAGE_TRIES ? "account" : mode;
      say(frame, { t: "hello", mode: as, ...(ownPage(as) ? {} : { world: asker }) });
    };
    up = { box, scrim, frame, asker, mode, size: "menu", wished: null, menu, ready: false, said, hello: null, giveUp: setTimeout(() => end({ failed: true }), READY_MS) };
    // It is told once its page has loaded, and again until it says it heard: it can't speak first, since it only
    // learns who is above it from being spoken to.
    frame.addEventListener("load", () => {
      if (!up || up.frame !== frame || up.ready || up.hello) return;
      hello();
      up.hello = setInterval(hello, HELLO_EVERY_MS);
    });
    place();
    document.body.append(scrim, box);
  };
  return {
    get open() {
      return !!up;
    },
    get kept() {
      return !!kept;
    },
    show(asker, mode, menu) {
      if (up) return;
      // Kept for another place: never shown for this one.
      if (kept && kept.asker !== asker) drop();
      if (!kept) return anew(asker, mode, menu, false);
      const { box, frame } = kept;
      clearTimeout(kept.old);
      kept = null;
      const scrim = scrimFor();
      up = {
        box,
        scrim,
        frame,
        asker,
        mode,
        size: "menu",
        wished: null,
        menu,
        ready: true,
        said: false,
        hello: null,
        // It never drew: an older panel, or one that has gone wrong. Loaded anew, as every opening used to be.
        giveUp: setTimeout(() => {
          if (!up || up.frame !== frame) return;
          const now = up;
          up = null;
          knowsShow = false;
          now.scrim.remove();
          now.box.remove();
          anew(now.asker, now.mode, now.menu, now.said);
        }, SHOWN_MS),
      };
      place();
      delete box.dataset.kept;
      box.before(scrim);
      say(frame, { t: "show", mode, ...(ownPage(mode) ? {} : { world: asker }) });
      frame.focus();
      cameUp();
    },
    close: () => end(),
    placeIs(origin) {
      if (kept && kept.asker !== origin) drop();
    },
    drop() {
      end(undefined, false);
      drop();
    },
  };
}
