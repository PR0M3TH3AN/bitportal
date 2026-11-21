import { describe, expect, it } from "vitest";
import { inShell, SHELL_WORLDS, showsInShell } from "../src/shared/shell.js";

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

describe("the page that keeps the screen filled (a trial)", () => {
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
});
