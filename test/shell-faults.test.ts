import { describe, expect, it } from "vitest";

/**
 * Faults the owner hit in the page that keeps the screen on 2026-11-21: stranded on the Airlock's explainer after a
 * way home it couldn't read; "refused to connect" in the frame from a link to the lobby; a refresh that brought back
 * an older world. The pages are scripts with a renderer or the page that frames them, so these hold the fixes where
 * they are written; the trial in the pull request saw them work.
 */
const read = async (path: string) => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("no link inside the page that keeps the screen leads to a page that refuses to be framed", () => {
  it("the Airlock makes its links leave whole before any screen it shows, the explainer and a blocked door included", async () => {
    const airlock = await read("src/go/airlock.ts");
    const render = airlock.slice(airlock.indexOf("async function render()"));
    const leaves = render.indexOf("linksLeaveWhole();");
    expect(leaves).toBeGreaterThan(0);
    // Before the first way this function can end with something shown.
    for (const later of ["if (req?.who)", '$("landing").hidden = false;', 'el("h1", {}, "This door is blocked")']) expect(leaves, later).toBeLessThan(render.indexOf(later));
    expect(render.split("linksLeaveWhole();").length - 1).toBe(1);
  });

  it("the room does too, so a sheet's link to the front page leaves whole", async () => {
    const room = await read("src/walk/main.ts");
    const start = room.indexOf("if (enterShell()) return;");
    expect(room.indexOf("linksLeaveWhole();", start)).toBeGreaterThan(start);
    expect(room.indexOf("linksLeaveWhole();", start)).toBeLessThan(room.indexOf("const settings = loadSettings();", start));
  });

  it("the room's ways to other places go through the shell-aware helper, not straight to the frame's address", async () => {
    const computers = await read("src/walk/computers.ts");
    expect(computers).not.toMatch(/location\.assign\(to\)/);
    expect(computers).toMatch(/goFrom\(to\)/);
  });

});

describe("a way home that can't be read still goes home", () => {
  it("only an Airlock opened with nothing after its address explains itself; anything else unreadable goes to the room", async () => {
    const airlock = await read("src/go/airlock.ts");
    const fallback = airlock.indexOf('if (location.hash.replace(/^#/, "").trim()) {');
    expect(fallback).toBeGreaterThan(0);
    expect(fallback).toBeLessThan(airlock.indexOf('$("landing").hidden = false;'));
    expect(airlock.slice(fallback, fallback + 300)).toMatch(/location\.replace\(`\/walk\/#back/);
  });
});

describe("a refresh comes back to where they are, or to the room, never to an older place", () => {
  it("at the Airlock, the place to come back to is the room", async () => {
    const shell = await read("src/shell/main.ts");
    expect(shell).toMatch(/at\.startsWith\("\/go\/"\)\) void remember\("\/walk\/"\);/);
  });

  it("a page in the frame that never says where it is (a browser's refusal) forgets the place kept", async () => {
    const shell = await read("src/shell/main.ts");
    const onLoad = shell.slice(shell.indexOf('view.addEventListener("load"'));
    expect(onLoad.slice(0, 900)).toMatch(/unheard = setTimeout\(\(\) => \{\s*unheard = null;\s*forgetWhere\(\);/);
    expect(shell).toMatch(/sessionStorage\.removeItem\(AT_KEY\)/);
  });
});
