import { describe, expect, it } from "vitest";
import { inShell, PLAIN_KEY, SHELL_WORLDS, shellWanted, showsInShell } from "../src/shared/shell.js";
import { isPanelMode, placePanel, readMenuPlace } from "../src/shell/panel.js";

const HERE = "https://portal.example";
const page = (path: string, top?: { origin: string; pathname: string } | "elsewhere" | "self") => {
  const self = { location: { origin: HERE, pathname: path } } as unknown as Window & { top: unknown };
  if (top === "self" || top === undefined) (self as { top: unknown }).top = self;
  else if (top === "elsewhere")
    (self as { top: unknown }).top = {
      get location(): never {
        throw new Error("another site's address can't be read");
      },
    };
  else (self as { top: unknown }).top = { location: top };
  return self as Window;
};

describe("the page that keeps the screen filled", () => {
  it("knows when a page of BitPortal's is being shown inside it, and only then", () => {
    expect(inShell(page("/walk/", { origin: HERE, pathname: "/shell/" }))).toBe(true);
    // Opened as a page of its own; framed by some other page of this site; framed by another site altogether.
    expect(inShell(page("/walk/", "self"))).toBe(false);
    expect(inShell(page("/walk/", { origin: HERE, pathname: "/publish/" }))).toBe(false);
    expect(inShell(page("/walk/", { origin: "https://elsewhere.example", pathname: "/shell/" }))).toBe(false);
    expect(inShell(page("/walk/", "elsewhere"))).toBe(false);
  });

  it("shows in its frame only this site's own room and Airlock, and the worlds it names", () => {
    expect(showsInShell("/walk/", HERE)).toBe(true);
    expect(showsInShell(`${HERE}/go/#nswp-go=abc`, HERE)).toBe(true);
    for (const world of SHELL_WORLDS) expect(showsInShell(`${world}/#nswp=abc`, HERE), world).toBe(true);
    // The front page and the rest of this site are framed by nobody, so they are gone to by the whole page.
    for (const other of ["/", "/look/", "/publish/", "/account/"]) expect(showsInShell(other, HERE), other).toBe(false);
    // And so is anywhere that hasn't said BitPortal may frame it: a look-alike of a world named, a plain site, nonsense.
    for (const other of [`${SHELL_WORLDS[0]}.evil.example/`, SHELL_WORLDS[0]!.replace("https:", "http:") + "/", "https://threejs.org/examples/", "about:blank", "not an address at all ://"]) expect(showsInShell(other, HERE), other).toBe(false);
  });

  it("is the way in on every device, and not where it has been turned down", () => {
    const DESK = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36";
    const tab = (o: { search?: string; agent?: string; canFill?: boolean; mouse?: boolean; framed?: boolean; kept?: Record<string, string> } = {}) => {
      const kept = new Map(Object.entries(o.kept ?? {}));
      const w = {
        location: { search: o.search ?? "" },
        sessionStorage: { getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v), removeItem: (k: string) => void kept.delete(k) },
        document: { fullscreenEnabled: o.canFill ?? true },
        navigator: { userAgent: o.agent ?? DESK },
        matchMedia: () => ({ matches: o.mouse ?? true }),
      } as unknown as Window & { top: unknown };
      (w as { top: unknown }).top = o.framed ? {} : w;
      return { w: w as Window, kept };
    };
    expect(shellWanted(tab().w)).toBe(true);
    // A phone, a headset's browser, a browser that can't fill a screen: all of them, since the owner tried it on
    // a phone and asked for it everywhere ("Make it the default for all modes. Including VR").
    expect(shellWanted(tab({ mouse: false }).w)).toBe(true);
    expect(shellWanted(tab({ canFill: false }).w)).toBe(true);
    for (const agent of ["Mozilla/5.0 (X11; Linux x86_64; Quest 3S) AppleWebKit/537.36 OculusBrowser/40.0 Chrome/138.0.0.0 VR Safari/537.36", "Mozilla/5.0 (Linux; Android 12; Pico 4) Chrome/120 Safari/537.36", "Mozilla/5.0 (Android 12; Mobile VR; rv:121.0) Gecko/121.0 Firefox/121.0 Wolvic/1.6", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"]) expect(shellWanted(tab({ agent, mouse: false }).w), agent).toBe(true);
    // Already in a frame (the page that keeps the screen, or anyone's): never a frame inside a frame.
    expect(shellWanted(tab({ framed: true }).w)).toBe(false);
    // Told to go the ordinary way: that tab stays so, until it is told otherwise. On any device.
    const told = tab({ search: "?plain=1" });
    expect(shellWanted(told.w)).toBe(false);
    expect(told.kept.get(PLAIN_KEY)).toBe("1");
    expect(shellWanted(tab({ kept: { [PLAIN_KEY]: "1" } }).w)).toBe(false);
    expect(shellWanted(tab({ kept: { [PLAIN_KEY]: "1" }, mouse: false }).w)).toBe(false);
    const back = tab({ search: "?plain=0", kept: { [PLAIN_KEY]: "1" } });
    expect(shellWanted(back.w)).toBe(true);
    expect(back.kept.has(PLAIN_KEY)).toBe(false);
    // Storage that can't be read (a private window that refuses it): the ordinary way, rather than a guess.
    const refused = tab();
    (refused.w as unknown as { sessionStorage: unknown }).sessionStorage = { getItem: () => { throw new Error("refused"); } };
    expect(shellWanted(refused.w)).toBe(false);
  });

  it("draws the sign-in panel where the menu is, and never off the screen or too small to read", () => {
    const desk = { width: 1440, height: 900 };
    const phone = { width: 390, height: 844 };
    // Where the world said its menu is.
    expect(placePanel("menu", desk, { left: 330, width: 780, bottom: 132 })).toEqual({ left: 330, width: 780, bottom: 132, height: 640 });
    expect(placePanel("tall", desk, { left: 330, width: 780, bottom: 132 })).toEqual({ left: 330, width: 780, bottom: 132, height: 758 });
    expect(placePanel("menu", phone, { left: 10, width: 370, bottom: 118 })).toEqual({ left: 10, width: 370, bottom: 118, height: 640 });
    // The tall one takes a phone's whole screen, less a margin.
    expect(placePanel("tall", phone, { left: 10, width: 370, bottom: 118 })).toEqual({ left: 10, width: 370, bottom: 10, height: 824 });
    // A world that said nothing: where a menu would be.
    expect(placePanel("menu", desk, null)).toEqual({ left: 330, width: 780, bottom: 132, height: 640 });
    expect(placePanel("menu", phone, null)).toEqual({ left: 10, width: 370, bottom: 118, height: 640 });
    // A world that said something absurd doesn't get to hide the question, shrink it, or push it off the screen.
    for (const absurd of [{ left: -5000, width: 1, bottom: -900 }, { left: 99999, width: 99999, bottom: 99999 }, { left: 700, width: 4, bottom: 0 }]) {
      for (const screen of [desk, phone]) {
        const p = placePanel("menu", screen, absurd);
        expect(p.width, JSON.stringify(absurd)).toBeGreaterThanOrEqual(320);
        expect(p.left).toBeGreaterThanOrEqual(0);
        expect(p.left + p.width).toBeLessThanOrEqual(screen.width);
        expect(p.bottom).toBeGreaterThanOrEqual(10);
        expect(p.bottom + p.height).toBeLessThanOrEqual(screen.height);
        expect(p.height).toBeGreaterThanOrEqual(400);
      }
    }
  });

  it("draws the panel as tall as its content where it says, within what can be read and what the screen has", () => {
    const desk = { width: 1440, height: 900 };
    const phone = { width: 390, height: 844 };
    const menu = { left: 330, width: 780, bottom: 132 };
    // As tall as its content, whichever size it also asked for.
    expect(placePanel("tall", desk, menu, 540)).toEqual({ left: 330, width: 780, bottom: 132, height: 540 });
    expect(placePanel("menu", desk, menu, 700)).toEqual({ left: 330, width: 780, bottom: 132, height: 700 });
    // Never more than the screen has above where it stands, and never too short to read.
    expect(placePanel("tall", desk, menu, 4000).height).toBe(758);
    expect(placePanel("menu", desk, menu, 5).height).toBe(240);
    expect(placePanel("menu", desk, menu, -300).height).toBe(240);
    // On a phone the tall one still stands at the foot of the screen, and is only as tall as it needs.
    expect(placePanel("tall", phone, { left: 10, width: 370, bottom: 118 }, 600)).toEqual({ left: 10, width: 370, bottom: 10, height: 600 });
    expect(placePanel("tall", phone, null, 2000).height).toBe(824);
    // Nothing said, or nonsense: as before.
    expect(placePanel("menu", desk, menu, null).height).toBe(640);
    expect(placePanel("tall", desk, menu, NaN).height).toBe(758);
    expect(placePanel("tall", desk, menu, Infinity).height).toBe(758);
  });

  it("takes from a world only a mode it knows and three numbers", () => {
    expect(["ask", "switch", "account", "files", "wallet"].every(isPanelMode)).toBe(true);
    for (const not of ["", "ASK", "everything", 1, null, undefined, {}]) expect(isPanelMode(not), String(not)).toBe(false);
    expect(readMenuPlace({ left: 1, width: 2, bottom: 3, more: "ignored" })).toEqual({ left: 1, width: 2, bottom: 3 });
    for (const not of [null, "menu", {}, { left: 1, width: 2 }, { left: "1", width: 2, bottom: 3 }, { left: NaN, width: 2, bottom: 3 }, { left: Infinity, width: 2, bottom: 3 }]) expect(readMenuPlace(not), JSON.stringify(not)).toBeNull();
  });
});
