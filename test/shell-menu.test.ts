import { describe, expect, it } from "vitest";

/**
 * The visitor's menu in the page that keeps the screen (src/shell/menu.ts; NSWP docs/plans/the-clients-menu.md,
 * section 17). The menu is the kit's, drawn in a browser, and what it does there is tried with real presses
 * (trials/shell-menu.mjs). These hold the rules that are about how this page is written, where they are written.
 */
const read = async (path: string): Promise<string> => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("the shell's menu is the kit's, from this site's own copy, and nothing else", () => {
  it("takes its code from the kit's menu and controls, and from no other place", async () => {
    const menu = await read("src/shell/menu.ts");
    const from = [...menu.matchAll(/^import .* from "([^"]+)";$/gm)].map((m) => m[1]);
    expect(from.sort()).toEqual(["./panel.js", "nswp-sdk/menu", "nswp-sdk/ui"]);
    // The panel's code stays apart: the menu knows its modes by name, as a type, and asks this page to show it.
    expect(menu).toContain('import type { PanelMode } from "./panel.js";');
  });

  it("puts nothing of a world's into the page as markup, and says nothing to the frame itself", async () => {
    const menu = await read("src/shell/menu.ts");
    expect(menu).not.toMatch(/innerHTML|outerHTML|insertAdjacentHTML|document\.write/);
    // Every word between this page and the frame is the kit's to say, held to the kit's limits.
    expect(menu).not.toMatch(/postMessage/);
    expect(menu).not.toMatch(/filesAnywhere/);
  });

  it("is built by itself, with no part of the renderer, and the build stops if it ever carries one", async () => {
    const build = await read("scripts/build.mjs");
    expect(build).toContain('entryPoints: { "shell/menu": join(root, "src/shell/menu.ts") },');
    expect(build).toContain("The shell's menu must not carry the renderer, and now does:");
    // Not one of the entries that are split with the room's.
    const first = build.slice(build.indexOf("entryPoints: {"), build.indexOf("splitting: true"));
    expect(first).not.toContain("shell/menu");
  });
});

describe("the frame is on its way before the menu is loaded", () => {
  it("sets the frame's address first, and only then asks for the menu's file", async () => {
    const shell = await read("src/shell/main.ts");
    const start = shell.indexOf("void begin().then((first) => {");
    expect(start).toBeGreaterThan(0);
    const sent = shell.indexOf("view.src = first;", start);
    const asked = shell.indexOf('import("/shell/menu.js" as string)', start);
    expect(sent).toBeGreaterThan(start);
    expect(asked).toBeGreaterThan(sent);
    // Nothing of the menu is in the page's first file.
    expect(shell).not.toMatch(/from "nswp-sdk\/menu"/);
    expect(shell).toContain('import type { ShellMenu } from "./menu.js";');
  });

  it("says a place's last `here` again to a menu that started after it, and only if it is still that place", async () => {
    const shell = await read("src/shell/main.ts");
    expect(shell).toContain('if (said.nswp === "here") lastHere = e;');
    expect(shell).toContain("queueMicrotask(() => said === lastHere && said.source === view.contentWindow && menuHears.has(fn) && fn(said));");
    // Only words from the frame are ever handed on.
    const handler = shell.slice(shell.indexOf('addEventListener("message", (e: MessageEvent) => {'));
    expect(handler.indexOf("if (e.source !== view.contentWindow) return;")).toBeLessThan(handler.indexOf("for (const fn of [...menuHears]) fn(e);"));
  });
});

describe("the panel is always above the menu", () => {
  it("keeps the menu in a place of its own, under the scrim and the panel", async () => {
    const css = await read("public/bitportal.css");
    const z = (rule: string): number => Number(new RegExp(`\\${rule} \\{[^}]*z-index: (\\d+)`).exec(css)?.[1]);
    expect(z(".shell-menu")).toBe(1);
    expect(z(".shell-scrim")).toBe(2);
    expect(z(".shell-panel")).toBe(3);
    expect(css).toMatch(/\.shell-menu \{ position: relative; z-index: 1; \}/);
    const menu = await read("src/shell/menu.ts");
    expect(menu).toContain("mountMenu(below.port, { parent: place })");
  });

  it("puts the sheet away before the panel comes up, from the menu's own row and from a world's ask", async () => {
    const menu = await read("src/shell/menu.ts");
    const ask = menu.slice(menu.indexOf("const ask = (mode: PanelMode): void => {"));
    expect(ask.indexOf("menu.setOpen(false);")).toBeGreaterThan(0);
    expect(ask.indexOf("menu.setOpen(false);")).toBeLessThan(ask.indexOf("o.openPanel(below.origin, mode);"));
    const shell = await read("src/shell/main.ts");
    expect(shell).toContain("if (shellMenu?.open) return;");
    // The panel is shown for the place in the frame, at a press, and only where that place may be shown here.
    expect(shell).toContain("if (!panel || panel.open || !pressed()) return;\n  void (origin === location.origin ? Promise.resolve(true) : mayShow(origin)).then((may) => {");
    expect(shell).toContain("if (may && shellMenu?.below.origin === origin) panel?.show(origin, mode, null);");
  });
});

describe("the menu is behind one switch, and the switch is off", () => {
  it("is set when the site is built, off unless the build is told otherwise, and by nothing a page can read", async () => {
    const build = await read("scripts/build.mjs");
    expect(build).toContain('const shellMenu = process.env.BITPORTAL_SHELL_MENU === "1";');
    expect(build).toContain("define: { SHELL_MENU: JSON.stringify(shellMenu) },");
    // The menu's own file is built only for a build that has it on.
    expect(build).toContain('if (shellMenu) await build({\n  entryPoints: { "shell/menu": join(root, "src/shell/menu.ts") },');
    const shell = await read("src/shell/main.ts");
    expect(shell).toContain("declare const SHELL_MENU: boolean;");
    // Read nowhere but where the menu is loaded, and never from the address, storage or a message.
    expect(shell.split("SHELL_MENU").length - 1).toBe(2);
    const guarded = shell.slice(shell.indexOf("if (SHELL_MENU) {"));
    expect(guarded.indexOf('import("/shell/menu.js" as string)')).toBeGreaterThan(0);
    expect(shell.slice(0, shell.indexOf("if (SHELL_MENU) {"))).not.toContain("/shell/menu.js");
    for (const page of ["src/shell/menu.ts", "src/shell/panel.ts", "src/shared/shell.ts"]) expect(await read(page), page).not.toContain("SHELL_MENU");
  });

  it("is checked in the built site by the gate, after the build, and by the deploy before anything is sent", async () => {
    const gate = await read("scripts/gate.mjs");
    expect(gate.indexOf('["shell-menu:off", "the built site has the client\'s menu off"],')).toBeGreaterThan(gate.indexOf('["build", "every page"],'));
    expect(JSON.parse(await read("package.json")).scripts["shell-menu:off"]).toBe("node scripts/check-shell-menu.mjs");
    const deploy = await read("scripts/deploy.mjs");
    expect(deploy.indexOf("const menuOn = shellMenuFaults(dist);")).toBeGreaterThan(0);
    expect(deploy.indexOf("if (menuOn.length) throw new Error(")).toBeLessThan(deploy.indexOf('execFileSync("vercel"'));
  });

  it("finds a build that has the menu on, by its file and by the shell naming it", async () => {
    const fs = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { mkdtempSync(prefix: string): string; mkdirSync(path: string): void; writeFileSync(path: string, text: string): void; rmSync(path: string, how: { recursive: boolean; force: boolean }): void };
    const os = (await import(/* @vite-ignore */ ["node", "os"].join(":"))) as { tmpdir(): string };
    const path = (await import(/* @vite-ignore */ ["node", "path"].join(":"))) as { join(...parts: string[]): string };
    const { shellMenuFaults } = (await import(/* @vite-ignore */ ["..", "scripts", "check-shell-menu.mjs"].join("/"))) as { shellMenuFaults(dir: string): string[] };
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "shell-menu-"));
    try {
      expect(shellMenuFaults(dir)).toEqual(["dist/shell/main.js is missing: run npm run build"]);
      fs.mkdirSync(path.join(dir, "shell"));
      fs.writeFileSync(path.join(dir, "shell", "main.js"), "frame.src=first;");
      expect(shellMenuFaults(dir)).toEqual([]);
      fs.writeFileSync(path.join(dir, "shell", "main.js"), 'frame.src=first;import("/shell/menu.js")');
      expect(shellMenuFaults(dir).length).toBe(1);
      fs.writeFileSync(path.join(dir, "shell", "menu.js"), "export{}");
      expect(shellMenuFaults(dir).length).toBe(2);
      fs.writeFileSync(path.join(dir, "shell", "main.js"), "frame.src=first;");
      expect(shellMenuFaults(dir).length).toBe(1);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
