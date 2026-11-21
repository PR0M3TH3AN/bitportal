import { describe, expect, it } from "vitest";

const read = async (path: string) => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("the lobby's own page (/doors/; landing-01)", () => {
  it("is built: the lobby, at /doors/", async () => {
    const build = await read("scripts/build.mjs");
    expect(build).toMatch(/cpSync\(join\(root, "src\/lobby\/index\.html"\), join\(out, "doors\/index\.html"\)\)/);
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
