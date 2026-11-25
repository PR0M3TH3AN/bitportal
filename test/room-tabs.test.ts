import { describe, expect, it } from "vitest";
import { MENU_LIMITS } from "@nswp/core";

/**
 * A place says at most twelve tabs to the menu above it (the kit's MENU_LIMITS.sections), and the rest are dropped,
 * unsaid. On 0.92.0 live, a guest's room or an account's had fourteen, and Doors and Your computers were never in the
 * menu. The door list is under Travel and the computers under Panels: twelve with a guest's Bag and Rate.
 */
const read = async (path: string): Promise<string> => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("the room's tabs fit the menu above it", () => {
  it("is a limit of twelve, the kit's", () => {
    expect(MENU_LIMITS.sections).toBe(12);
  });
  it("lists every door under Travel, and opens Travel for 'Every door, as a list'", async () => {
    const room = await read("src/walk/main.ts");
    expect(room).not.toMatch(/addSection\(\{ id: "doors"/);
    expect(room).toContain('const doorMenu = addDoorControls(controls, {\n    section: "travel",');
    expect(room).toContain('openList = () => (renderer.xr.isPresenting ? everyDoor?.open() : hud.setOpen(true, "travel"));');
  });
  it("puts the visitor's computers under Panels, where a terminal opens", async () => {
    const computers = await read("src/walk/computers.ts");
    expect(computers).not.toMatch(/id: "computers"/);
    expect(computers).not.toContain('section: "computers"');
    expect(computers.split('section: "panels"').length - 1).toBe(6);
  });
  it("makes no tab of its own beyond those it had, in the room, You, or its computers", async () => {
    const files = await Promise.all(["src/walk/main.ts", "src/walk/you.ts", "src/walk/computers.ts"].map(read));
    const own = files.flatMap((src) => [...src.matchAll(/controls\.addSection\(\{\s*id: "([a-z-]+)"/g)].map((m) => m[1]));
    // Beside the kit's own (Travel, Room, People, Bag, Camera, Panels, View, Moving, Sound): who they are, their look,
    // Rate, and Help (which the menu above has its own of). A new tab here must leave a guest's room at twelve.
    expect(own.sort()).toEqual(["figure", "help", "rate", "you"]);
  });
});
