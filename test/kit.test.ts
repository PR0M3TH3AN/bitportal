import { describe, expect, it } from "vitest";
import { crossingFor, type CrossingFacts } from "../src/shared/crossing.js";
import { kitNote } from "../src/shared/kit.js";

describe("saying how old a world's controls are", () => {
  it("says nothing of a world on the same kit, or a newer one", () => {
    expect(kitNote("0.21.0", true, "0.21.0")).toBeNull();
    expect(kitNote("0.21.4", true, "0.21.0")).toBeNull();
    expect(kitNote("0.30.0", true, "0.21.0")).toBeNull();
  });
  it("says an older one is older, which versions, and that it still works", () => {
    const note = kitNote("0.17.5", true, "0.21.0")!;
    expect(note).toContain("0.17.5");
    expect(note).toContain("0.21.0");
    expect(note).toContain("still works");
  });
  it("says when a world doesn't say, or says something that isn't a version", () => {
    expect(kitNote(undefined, true, "0.21.0")).toContain("doesn't say");
    expect(kitNote("<b>new</b>", true, "0.21.0")).toContain("doesn't say");
    // And never repeats what it was told when that wasn't a version.
    expect(kitNote("<b>new</b>", true, "0.21.0")).not.toContain("<b>");
  });
  it("says nothing of a site that hasn't adopted the protocol", () => {
    expect(kitNote(undefined, false, "0.21.0")).toBeNull();
    expect(kitNote("0.1.0", false, "0.21.0")).toBeNull();
  });
  it("is no part of deciding a crossing: nothing about a kit is among the facts that do", () => {
    const facts: CrossingFacts = { verified: true, onList: true, beenBefore: true, approved: false, askAlways: false, publisherChanged: false, warnings: 0, asking: 0, fit: "ok", setting: "known", held: false };
    expect(Object.keys(facts).some((k) => /kit/i.test(k))).toBe(false);
    expect(crossingFor(facts)).toBe("straight");
  });
});

describe("the kit's menu, as a client carries it", () => {
  it("is vendored as files of its own, beside a world's end of it, and neither names the renderer", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const recorded = JSON.parse(readFileSync(new URL("../vendor/integrity.json", import.meta.url), "utf8")) as { packages: Record<string, { files: Record<string, string> }> };
    const files = Object.keys(recorded.packages["@nswp/core"]!.files);
    for (const name of ["sdk/menu.js", "sdk/menu-above.js", "sdk/bag-entry.js", "sdk-types/menu.d.ts", "sdk-types/menu-above.d.ts", "sdk-types/bag-entry.d.ts"]) expect(files, name).toContain(name);
    for (const name of ["menu.js", "menu-above.js", "bag-entry.js"]) expect(readFileSync(new URL(`../vendor/nswp/sdk/${name}`, import.meta.url), "utf8"), name).not.toMatch(/from\s*"three"/);
    const build = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");
    expect(build).toContain('"nswp-sdk/menu": join(root, "vendor/nswp/sdk/menu.js"),');
    expect(build).toContain('"nswp-sdk/menu-above": join(root, "vendor/nswp/sdk/menu-above.js"),');
    expect(build).toContain('"nswp-sdk/bag": join(root, "vendor/nswp/sdk/bag-entry.js"),');
  });

  it("is built from the kit's own folder, so the same commit gives the same bytes wherever its checkout is", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const core = readFileSync(new URL("../vendor/nswp/nswp-core.js", import.meta.url), "utf8");
    expect(core).toContain("// packages/core/src/constants.ts");
    expect(core).not.toMatch(/^\/\/ (\.\.\/|\/)/m);
  });
});
