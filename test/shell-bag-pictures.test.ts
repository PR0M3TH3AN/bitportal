import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Item } from "@nswp/core";
import { PICTURE_SIZE, PICTURES_ASKED, PICTURES_PATH, PICTURES_TAG, PICTURES_V, pictureId, readDrawWord, readPictureWord } from "../src/shell/pictures-words.js";
import { framedPictures } from "../src/shell/bag-pictures.js";

/**
 * The Bag's things drawn as themselves in the shell's menu (src/shell/bag-pictures.ts, src/shell/pictures/). The
 * page that keeps the screen loads no renderer: a page it frames unseen draws each thing and hands the picture up.
 * What that looks like in a browser is tried with real presses (trials/shell-bag.mjs). These hold the rules.
 */
const read = async (path: string): Promise<string> => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};
const SHA = "ab".repeat(32);
const item = (over: Record<string, unknown> = {}): Item => ({ id: `37303:${"cd".repeat(32)}:blaster`, model: { url: "https://items.example/blaster.glb", sha256: SHA }, size: [0.2, 0.2, 0.4], tints: [], ...over }) as unknown as Item;
const word = (body: Record<string, unknown>): Record<string, unknown> => ({ bitportal: PICTURES_TAG, v: PICTURES_V, ...body });

describe("what crosses between the shell and its picture frame", () => {
  it("down: exactly a thing to draw and its colours, with a model fetched only over https", () => {
    const draw = { id: "x", item: item(), tints: { accent: "#ff7a1a" } };
    expect(readDrawWord(word({ draw }))?.id).toBe("x");
    expect(readDrawWord({ draw })).toBeNull();
    expect(readDrawWord({ ...word({ draw }), v: 2 })).toBeNull();
    expect(readDrawWord({ nswp: "menu", draw })).toBeNull();
    for (const bad of [
      { ...draw, id: "" },
      { ...draw, id: "x".repeat(2001) },
      { ...draw, tints: null },
      { ...draw, tints: { accent: 7 } },
      { ...draw, item: item({ model: { url: "http://items.example/blaster.glb", sha256: SHA } }) },
      { ...draw, item: item({ model: { url: "javascript:alert(1)", sha256: SHA } }) },
      { ...draw, item: item({ model: { url: "/shell/main.js", sha256: SHA } }) },
      { ...draw, item: item({ model: { url: "https://items.example/blaster.glb", sha256: "nothex" } }) },
      { ...draw, item: item({ size: [0.2, 0.2] }) },
      { ...draw, item: item({ size: [0.2, Number.NaN, 0.4] }) },
      { ...draw, item: item({ tints: null }) },
      { ...draw, item: null },
    ])
      expect(readDrawWord(word({ draw: bad })), JSON.stringify(bad).slice(0, 80)).toBeNull();
  });

  it("up: exactly a picture of the size pictures are, for a thing that was asked for, and nothing beside it", () => {
    const isPicture = (v: unknown): v is ImageBitmap => !!v && typeof v === "object" && (v as { picture?: boolean }).picture === true;
    const bitmap = { picture: true, width: PICTURE_SIZE, height: PICTURE_SIZE };
    const asked = (id: string): boolean => id === "x";
    expect(readPictureWord(word({ picture: { id: "x", bitmap } }), asked, isPicture)?.id).toBe("x");
    // Not asked for.
    expect(readPictureWord(word({ picture: { id: "y", bitmap } }), asked, isPicture)).toBeNull();
    // Not a picture, or not the size.
    expect(readPictureWord(word({ picture: { id: "x", bitmap: "data:image/png;base64,AAAA" } }), asked, isPicture)).toBeNull();
    expect(readPictureWord(word({ picture: { id: "x", bitmap: { ...bitmap, width: 4096 } } }), asked, isPicture)).toBeNull();
    // Anything beside the picture and its id is refused whole: nothing else crosses.
    expect(readPictureWord(word({ picture: { id: "x", bitmap, also: "who" } }), asked, isPicture)).toBeNull();
    expect(readPictureWord(word({ picture: { id: "x", bitmap }, also: "who" }), asked, isPicture)).toBeNull();
    expect(readPictureWord({ picture: { id: "x", bitmap } }, asked, isPicture)).toBeNull();
    expect(readPictureWord({ nswp: "menu", picture: { id: "x", bitmap } }, asked, isPicture)).toBeNull();
  });

  it("is BitPortal's own and takes no word of NSWP's", async () => {
    const words = await read("src/shell/pictures-words.ts");
    expect(words).not.toMatch(/nswp:\s*"/);
    expect(PICTURES_TAG).toBe("bag-pictures");
    expect(PICTURES_PATH).toBe("/shell/pictures/");
    expect(pictureId(item(), { accent: "#fff" })).toBe(`${item().id}|${SHA}|{"accent":"#fff"}`);
  });
});

describe("the shell's side: a frame only while there is something to draw", () => {
  interface FakeFrame { hidden: boolean; src: string; contentWindow: { said: unknown[]; postMessage(m: unknown, to: string): void }; on: Record<string, () => void>; gone: boolean }
  let frames: FakeFrame[] = [];
  let hear: ((e: unknown) => void) | null = null;
  let painted = 0;
  beforeEach(() => {
    frames = [];
    painted = 0;
    vi.useFakeTimers();
    vi.stubGlobal("location", { origin: "https://portal.example" });
    vi.stubGlobal("addEventListener", (type: string, fn: (e: unknown) => void) => { if (type === "message") hear = fn; });
    vi.stubGlobal("ImageBitmap", class { width = PICTURE_SIZE; height = PICTURE_SIZE; close(): void {} });
    vi.stubGlobal("document", {
      body: { append: () => {} },
      createElement: (tag: string) => {
        if (tag === "canvas") return { width: 0, height: 0, getContext: () => ({ drawImage: () => void painted++ }) };
        const frame: FakeFrame = { hidden: false, src: "", gone: false, on: {}, contentWindow: { said: [], postMessage(m: unknown, to: string) { this.said.push([m, to]); } } };
        frames.push(frame);
        return Object.assign(frame, { setAttribute: () => {}, addEventListener: (t: string, fn: () => void) => { frame.on[t] = fn; }, remove: () => { frame.gone = true; } });
      },
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  const picture = (id: string): unknown => ({ bitportal: PICTURES_TAG, v: PICTURES_V, picture: { id, bitmap: new (globalThis as unknown as { ImageBitmap: new () => ImageBitmap }).ImageBitmap() } });

  it("makes no frame until a picture is wanted with the sheet open, and never in a headset", () => {
    let open = false;
    let presenting = false;
    const p = framedPictures({ open: () => open, presenting: () => presenting });
    expect(frames.length).toBe(0);
    // The sheet is down: nothing.
    expect(p.still(item())).toBeNull();
    expect(frames.length).toBe(0);
    // In a headset: nothing.
    open = true;
    presenting = true;
    expect(p.still(item())).toBeNull();
    expect(frames.length).toBe(0);
    presenting = false;
    expect(p.still(item())).toBeNull();
    expect(frames.length).toBe(1);
    expect(frames[0]!.src).toBe("/shell/pictures/");
    expect(frames[0]!.hidden).toBe(true);
    expect(p.framed).toBe(true);
    // Asked again before it has come: one frame, and not asked twice.
    p.still(item());
    expect(frames.length).toBe(1);
  });

  it("says which thing and which colours once the frame has loaded, to this site's origin only", () => {
    const p = framedPictures({ open: () => true, presenting: () => false });
    p.still(item(), { accent: "#fff" });
    expect(frames[0]!.contentWindow.said).toEqual([]);
    frames[0]!.on.load!();
    const [said, to] = frames[0]!.contentWindow.said[0] as [{ draw: { id: string; item: Item; tints: Record<string, string> } } & Record<string, unknown>, string];
    expect(to).toBe("https://portal.example");
    expect(Object.keys(said).sort()).toEqual(["bitportal", "draw", "v"]);
    expect(Object.keys(said.draw).sort()).toEqual(["id", "item", "tints"]);
    expect(said.draw.tints).toEqual({ accent: "#fff" });
  });

  it("takes a picture only from the frame's own window, at exactly this site's origin, and paints it without reading it", () => {
    const p = framedPictures({ open: () => true, presenting: () => false });
    let told = 0;
    p.onChange(() => void told++);
    p.still(item());
    frames[0]!.on.load!();
    const id = pictureId(item());
    // From some other window; from the frame's window under another origin; for a thing not asked for.
    hear!({ source: {}, origin: "https://portal.example", data: picture(id) });
    hear!({ source: frames[0]!.contentWindow, origin: "https://elsewhere.example", data: picture(id) });
    hear!({ source: frames[0]!.contentWindow, origin: "https://portal.example", data: picture("another") });
    expect(p.still(item())).toBeNull();
    expect(told).toBe(0);
    hear!({ source: frames[0]!.contentWindow, origin: "https://portal.example", data: picture(id) });
    expect(told).toBe(1);
    expect(painted).toBe(1);
    expect(p.still(item())).not.toBeNull();
  });

  it("drops the frame when the sheet closes, keeps the pictures it has, and makes no frame for one it has", () => {
    let open = true;
    const p = framedPictures({ open: () => open, presenting: () => false, watchMs: 250 });
    p.still(item());
    frames[0]!.on.load!();
    hear!({ source: frames[0]!.contentWindow, origin: "https://portal.example", data: picture(pictureId(item())) });
    vi.advanceTimersByTime(1000);
    expect(frames[0]!.gone).toBe(false);
    open = false;
    vi.advanceTimersByTime(300);
    expect(frames[0]!.gone).toBe(true);
    expect(p.framed).toBe(false);
    // Opened again: the picture is there at once, and no frame is made for it.
    open = true;
    expect(p.still(item())).not.toBeNull();
    expect(frames.length).toBe(1);
    // A picture from the frame that was dropped is not taken.
    const other = item({ id: `37303:${"cd".repeat(32)}:lantern` });
    expect(p.still(other)).toBeNull();
    expect(frames.length).toBe(2);
    hear!({ source: frames[0]!.contentWindow, origin: "https://portal.example", data: picture(pictureId(other)) });
    expect(p.still(other)).toBeNull();
  });

  it("asks for only so many at a time", () => {
    const p = framedPictures({ open: () => true, presenting: () => false });
    for (let n = 0; n < PICTURES_ASKED + 10; n++) p.still(item({ id: `37303:${"cd".repeat(32)}:thing-${n}` }));
    frames[0]!.on.load!();
    expect(frames[0]!.contentWindow.said.length).toBe(PICTURES_ASKED);
  });
});

describe("how the two pages are written", () => {
  it("the shell's side loads no renderer, reads no picture, and is handed to the kit's own Bag", async () => {
    for (const file of ["src/shell/bag-pictures.ts", "src/shell/pictures-words.ts", "src/shell/bag.ts", "src/shell/menu.ts"]) expect(await read(file), file).not.toMatch(/from "(three|nswp-sdk\/three)[^"]*"/);
    const side = await read("src/shell/bag-pictures.ts");
    expect(side).not.toMatch(/getImageData|toDataURL|toBlob|convertToBlob/);
    expect(side).toContain("if (!frame || e.source !== frame.contentWindow || e.origin !== location.origin) return;");
    expect(side).toContain("frame?.contentWindow?.postMessage(word, location.origin);");
    expect(side).not.toMatch(/postMessage\([^)]*"\*"/);
    expect(side).toContain("made.hidden = true;");
    // Stills only: the chosen thing is the same still.
    expect(side).toContain("turning: (item, tints) => still(item, tints),");
    const bag = await read("src/shell/bag.ts");
    expect(bag).toContain("previews: o.previews ?? null,");
    const menu = await read("src/shell/menu.ts");
    expect(menu).toContain("framedPictures({ open: () => sheetOpen(), presenting });");
    expect(menu).toContain("sheetOpen = () => menu.open;");
  });

  it("the frame's page listens only to the page that frames it, knows nobody, and leaves every check to the kit", async () => {
    const page = await read("src/shell/pictures/main.ts");
    expect(page).toContain("if (above !== window) {");
    expect(page).toContain("if (e.source !== above || e.origin !== location.origin) return;");
    expect(page).toContain("above.postMessage(word, location.origin, [bitmap]);");
    expect(page).not.toMatch(/postMessage\([^)]*"\*"/);
    // The model is the kit's to fetch, check, count, fit and tint; as a guest, with no relay and no key.
    expect(page).toContain('import { createItemPreviews, createItems } from "nswp-sdk/three";');
    expect(page).toContain("createItems({ viewer: () => null });");
    // And the picture is the kit's to draw: the code that draws a thing in a world's Bag. No copy of it here.
    expect(page).toContain("createItemPreviews({ model: (item, tints) => items.model(item, tints), size: PICTURE_SIZE });");
    expect(page).not.toMatch(/WebGLRenderer|PerspectiveCamera|from "three"/);
    const fs = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readdirSync(path: URL): string[] };
    expect(fs.readdirSync(new URL("../src/shell/pictures/", import.meta.url)).sort()).toEqual(["index.html", "main.ts"]);
    expect(page).not.toMatch(/relays|pubkey|signed-in|localStorage|sessionStorage|knownSignedIn|fetch\(/);
    expect([...page.matchAll(/^import .* from "([^"]+)";$/gm)].map((m) => m[1]).sort()).toEqual(["../pictures-words.js", "nswp-sdk/three"]);
    const html = await read("src/shell/pictures/index.html");
    expect([...html.matchAll(/<script[^>]*>/g)].map((m) => m[0])).toEqual(['<script type="module" src="/shell/pictures/main.js">']);
    expect(html).not.toMatch(/<iframe|<link|style=| on[a-z]+=/);
  });

  it("is built only where the menu is on, under rules of its own, and a build with it can't go out", async () => {
    const build = await read("scripts/build.mjs");
    expect(build).toContain('...(shellMenu ? { "shell/pictures/main": join(root, "src/shell/pictures/main.ts") } : {}),');
    expect(build).toContain(`const cspPictures = "default-src 'none'; script-src 'self'; connect-src https: blob: data:; img-src blob: data:; frame-src 'none'; worker-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'";`);
    expect(build).toContain('{ key: "Referrer-Policy", value: "no-referrer" },');
    // No path under two rules: with the page there, the rule for /shell/ leaves it out. Without it, the rule is as it was.
    expect(build).toContain('{ source: shellMenu ? "/shell(/(?!pictures(?:/|$)).*)?" : "/shell(/.*)?", headers: guards(cspShell, shellWorlds, signInOrigin) },');
    expect(build).toContain('...(shellMenu ? [{ source: "/shell/pictures(/.*)?", headers: picturesGuards }] : []),');
    const shell = new RegExp("^/shell(/(?!pictures(?:/|$)).*)?$");
    const pictures = new RegExp("^/shell/pictures(/.*)?$");
    for (const path of ["/shell", "/shell/", "/shell/main.js", "/shell/menu.js", "/shell/picturesque.js"]) expect([shell.test(path), pictures.test(path)], path).toEqual([true, false]);
    for (const path of ["/shell/pictures", "/shell/pictures/", "/shell/pictures/main.js"]) expect([shell.test(path), pictures.test(path)], path).toEqual([false, true]);
    // The rule every other page is under already leaves /shell/ out.
    expect(new RegExp("^/((?!(?:walk|go|shell|item-box)(?:/|$)).*)$").test("/shell/pictures/")).toBe(false);

    const fs = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { mkdtempSync(prefix: string): string; mkdirSync(path: string, o?: { recursive: boolean }): void; writeFileSync(path: string, text: string): void; rmSync(path: string, o: { recursive: boolean; force: boolean }): void };
    const os = (await import(/* @vite-ignore */ ["node", "os"].join(":"))) as { tmpdir(): string };
    const path = (await import(/* @vite-ignore */ ["node", "path"].join(":"))) as { join(...parts: string[]): string };
    const { shellMenuFaults } = (await import(/* @vite-ignore */ ["..", "scripts", "check-shell-menu.mjs"].join("/"))) as { shellMenuFaults(dir: string): string[] };
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "shell-pictures-"));
    try {
      fs.mkdirSync(path.join(dir, "shell"));
      fs.writeFileSync(path.join(dir, "shell", "main.js"), "frame.src=first;");
      fs.writeFileSync(path.join(dir, "vercel.json"), '{"headers":[{"source":"/shell(/.*)?"}]}');
      expect(shellMenuFaults(dir)).toEqual([]);
      fs.mkdirSync(path.join(dir, "shell", "pictures"));
      expect(shellMenuFaults(dir).length).toBe(1);
      fs.writeFileSync(path.join(dir, "vercel.json"), '{"headers":[{"source":"/shell/pictures(/.*)?"}]}');
      expect(shellMenuFaults(dir).length).toBe(2);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
