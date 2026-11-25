import { describe, expect, it } from "vitest";

/**
 * The kit's held hands (kit 0.93.0): a Quest's controllers drawn as a see-through hand holding a see-through
 * controller, moved by the trigger, grip and thumb. The room serves them itself, beside it, as each reference world
 * does ("/hands/kit/"), and as it serves the kit's sounds.
 */
const read = async (path: string): Promise<string> => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("the kit's held hands in the room", () => {
  it("are asked for from this site's own address, as the reference worlds ask", async () => {
    const room = await read("src/walk/main.ts");
    const input = room.slice(room.indexOf("const xrInput: XrInput = createXrInput({"));
    expect(input.slice(0, input.indexOf("});"))).toContain('handsAt: "/hands/kit/",');
  });
  it("are taken from the kit with it, and recorded, every file", async () => {
    const vendor = await read("scripts/vendor.mjs");
    expect(vendor).toContain('cpSync(join(repo, "packages", "sdk", "assets", "hands"), join(out, "hands"), { recursive: true });');
    const files = Object.keys((JSON.parse(await read("vendor/integrity.json")) as { packages: Record<string, { files: Record<string, string> }> }).packages["@nswp/core"]!.files).filter((f) => f.startsWith("hands/"));
    expect(files.sort()).toEqual(["hands/LICENSE-webxr-input-profiles.md", "hands/PROVENANCE.md", "hands/controller-left.glb", "hands/controller-right.glb", "hands/hand-left.glb", "hands/hand-right.glb"].sort());
  });
  it("are served beside the room, with their licence and where they came from", async () => {
    const build = await read("scripts/build.mjs");
    expect(build).toContain('cpSync(join(root, "vendor/nswp/hands"), join(out, "hands/kit"), { recursive: true });');
  });
});
