import { describe, expect, it } from "vitest";
import { inShell, PLAIN_KEY, SHELL_WORLDS, shellWanted, showsInShell } from "../src/shared/shell.js";

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

  it("is the way in at a desk, and not where it hasn't been tried or has been turned down", () => {
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
    // Already in a frame (the page that keeps the screen, or anyone's): never a frame inside a frame.
    expect(shellWanted(tab({ framed: true }).w)).toBe(false);
    // A phone, a headset's browser, a browser that can't fill a screen: the ordinary way, as before.
    expect(shellWanted(tab({ mouse: false }).w)).toBe(false);
    expect(shellWanted(tab({ canFill: false }).w)).toBe(false);
    for (const agent of ["Mozilla/5.0 (X11; Linux x86_64; Quest 3S) AppleWebKit/537.36 OculusBrowser/40.0 Chrome/138.0.0.0 VR Safari/537.36", "Mozilla/5.0 (Linux; Android 12; Pico 4) Chrome/120 Safari/537.36", "Mozilla/5.0 (Android 12; Mobile VR; rv:121.0) Gecko/121.0 Firefox/121.0 Wolvic/1.6"]) expect(shellWanted(tab({ agent }).w), agent).toBe(false);
    // Told to go the ordinary way: that tab stays so, until it is told otherwise.
    const told = tab({ search: "?plain=1" });
    expect(shellWanted(told.w)).toBe(false);
    expect(told.kept.get(PLAIN_KEY)).toBe("1");
    expect(shellWanted(tab({ kept: { [PLAIN_KEY]: "1" } }).w)).toBe(false);
    const back = tab({ search: "?plain=0", kept: { [PLAIN_KEY]: "1" } });
    expect(shellWanted(back.w)).toBe(true);
    expect(back.kept.has(PLAIN_KEY)).toBe(false);
    // Storage that can't be read (a private window that refuses it): the ordinary way, rather than a guess.
    const refused = tab();
    (refused.w as unknown as { sessionStorage: unknown }).sessionStorage = { getItem: () => { throw new Error("refused"); } };
    expect(shellWanted(refused.w)).toBe(false);
  });
});
