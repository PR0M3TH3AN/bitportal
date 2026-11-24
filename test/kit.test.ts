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

describe("no entry of the kit's is left out without a word", () => {
  const load = async () => (await import(/* @vite-ignore */ ["..", "scripts", "sdk-entries.mjs"].join("/"))) as { SDK_TAKEN: string[]; SDK_LEFT: Record<string, string>; sdkEntries(exported: unknown): string[] };
  const kit = { ".": "./src/index.ts", "./three": "./src/three.ts", "./home": "./src/home.ts", "./ui": "./src/ui.ts", "./menu": "./src/menu.ts", "./menu-above": "./src/menu-above.ts", "./bag": "./src/bag-entry.ts", "./terminal": "./src/terminal.ts" };

  it("takes the files the kit itself names for the entries this site uses", async () => {
    const { sdkEntries } = await load();
    expect(sdkEntries(kit)).toEqual(["./src/three.ts", "./src/home.ts", "./src/ui.ts", "./src/terminal.ts", "./src/menu.ts", "./src/menu-above.ts", "./src/bag-entry.ts"]);
    // A file the kit renames is followed, since the name comes from the kit.
    expect(sdkEntries({ ...kit, "./bag": "./src/bag.entry.ts" })).toContain("./src/bag.entry.ts");
  });

  it("stops where the kit has an entry this site hasn't named, and where one it takes is gone", async () => {
    const { sdkEntries } = await load();
    expect(() => sdkEntries({ ...kit, "./wallet": "./src/wallet.ts" })).toThrow(/doesn't know: nswp-sdk\/wallet\./);
    const { "./bag": _gone, ...without } = kit;
    expect(() => sdkEntries(without)).toThrow(/takes nswp-sdk\/bag, which the kit no longer has/);
    expect(() => sdkEntries(undefined)).toThrow();
  });

  it("is what the vendor script builds from, and every entry it takes has its name in the build and the types", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const { SDK_TAKEN, SDK_LEFT } = await load();
    const vendor = readFileSync(new URL("../scripts/vendor.mjs", import.meta.url), "utf8");
    expect(vendor).toContain('const entries = sdkEntries(JSON.parse(readFileSync(join(repo, "packages/sdk/package.json"), "utf8")).exports);');
    expect(vendor).not.toMatch(/packages\/sdk\/src\/[a-z-]+\.ts"\)/);
    const build = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");
    const types = readFileSync(new URL("../tsconfig.json", import.meta.url), "utf8");
    const tests = readFileSync(new URL("../vitest.config.ts", import.meta.url), "utf8");
    for (const name of SDK_TAKEN) {
      expect(tests, name).toContain(`"nswp-sdk/${name.slice(2)}": at("./vendor/nswp/sdk/`);
      expect(build, name).toContain(`"nswp-sdk/${name.slice(2)}": join(root, "vendor/nswp/sdk/`);
      expect(types, name).toContain(`"nswp-sdk/${name.slice(2)}": ["./vendor/nswp/sdk-types/`);
    }
    expect(Object.keys(SDK_LEFT)).toEqual(["."]);
  });
});
