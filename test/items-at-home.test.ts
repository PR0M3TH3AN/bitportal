import { describe, expect, it } from "vitest";
import { ITEM_BOX_CSP } from "@nswp/core";

/**
 * What an item does of its own runs in the room as it does in every world: in the kit's locked box, a page of this
 * site served under the kit's own rules. The room frames that page and the sign-in address, and nothing else.
 */
const read = async (path: string) => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("items at home", () => {
  it("the box is the kit's own page, under the kit's own rules and no others", async () => {
    const build = await read("scripts/build.mjs");
    expect(build).toContain('writeFileSync(join(out, "item-box/index.html"), ITEM_BOX_HTML);');
    expect(build).toContain('{ source: "/item-box(/.*)?", headers: [{ key: "Content-Security-Policy", value: ITEM_BOX_CSP }');
    // It reaches nothing, and only this site may be above it.
    expect(ITEM_BOX_CSP).toMatch(/default-src 'none'/);
    expect(ITEM_BOX_CSP).toMatch(/frame-ancestors 'self'$/);
  });

  it("the room runs an item's own logic there, and frames no other page of this site", async () => {
    const room = await read("src/walk/main.ts");
    expect(room).toContain('itemScripts: { url: "/item-box/" }');
    // The room makes no frame of its own: the box is made by the kit, at that address, and the sign-in address's frame by BitLogin's client.
    for (const file of ["src/walk/main.ts", "src/walk/you.ts", "src/walk/door-list.ts", "src/walk/computers.ts", "src/walk/notes.ts"]) expect(await read(file), file).not.toMatch(/createElement\(["']iframe["']\)/);
  });

  it("no longer says an item's own logic doesn't run at home", async () => {
    expect(await read("src/walk/main.ts")).not.toMatch(/doesn't run at home/);
  });
});
