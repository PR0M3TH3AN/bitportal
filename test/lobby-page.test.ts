import { describe, expect, it } from "vitest";

const read = async (path: string) => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("the lobby's own page (/doors/; landing-01)", () => {
  it("is built: the lobby, at /doors/", async () => {
    const build = await read("scripts/build.mjs");
    expect(build).toMatch(/cpSync\(join\(root, "src\/lobby\/index\.html"\), join\(out, "doors\/index\.html"\)\)/);
    // And the front page is the way in, not the lobby again.
    expect(build).toMatch(/cpSync\(join\(root, "src\/landing\/index\.html"\), join\(out, "index\.html"\)\)/);
    expect(build).not.toMatch(/cpSync\(join\(root, "src\/lobby\/index\.html"\), join\(out, "index\.html"\)\)/);
  });

  it("is where every way back to the lobby leads, and nowhere leads back to the lobby at /", async () => {
    for (const page of ["go", "look", "publish", "account"]) {
      const html = await read(`src/${page}/index.html`);
      for (const m of html.matchAll(/<a [^>]*href="([^"]*)"[^>]*>([^<]*lobby[^<]*)<\/a>/g)) expect(m[1], `${page}: ${m[2]}`).toBe("/doors/");
    }
    expect(await read("src/account/back.ts")).toContain('{ href: "/doors/", label: "Back to the lobby"');
  });

  it("is what the room's control for settings and announcing opens", async () => {
    const room = await read("src/walk/main.ts");
    const control = room.split("\n").find((l) => l.includes('id: "front-page"')) ?? "";
    expect(control).toContain('goFrom("/doors/")');
    expect(room).not.toMatch(/on the front page/);
  });
});

describe("an old link to the lobby, from when it was the front page", () => {
  it("lands on the same thing at /doors/, with what came after the ? and the #", async () => {
    const { oldLinkTarget } = await import("../src/landing/forward.js");
    expect(oldLinkTarget("", "")).toBeNull();
    expect(oldLinkTarget("", "#shelves")).toBe("/doors/#shelves");
    expect(oldLinkTarget("?list=naddr1abc", "")).toBe("/doors/?list=naddr1abc");
    expect(oldLinkTarget("?list=naddr1abc", "#x")).toBe("/doors/?list=naddr1abc#x");
  });

  it("leaves what only the front page reads where it is", async () => {
    const { oldLinkTarget } = await import("../src/landing/forward.js");
    expect(oldLinkTarget("?notice=1", "")).toBeNull();
    expect(oldLinkTarget("?plain=1&notice=1", "")).toBeNull();
    expect(oldLinkTarget("?notice=1&list=a", "")).toBe("/doors/?list=a");
  });

  it("only ever sends someone to this site's own /doors/", async () => {
    const { oldLinkTarget } = await import("../src/landing/forward.js");
    for (const [search, hash] of [["?x=//evil.example", "#//evil.example"], ["", "#https://evil.example/"], ["?a=javascript:alert(1)", ""]]) expect(oldLinkTarget(search!, hash!)!.startsWith("/doors/")).toBe(true);
  });
});
