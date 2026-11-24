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
    expect(shell).toContain('if (said.nswp === "here") {\n    lastHere = e;');
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

describe("the Airlock is under the visitor's menu too", () => {
  it("speaks the menu's words through the kit's own world's end, among its first files, and describes nothing", async () => {
    const menu = await read("src/go/menu.ts");
    expect([...menu.matchAll(/^import .* from "([^"]+)";$/gm)].map((m) => m[1]).sort()).toEqual(["nswp-sdk/menu-above", "nswp-sdk/ui"]);
    // One small mark, away from the corner the Airlock's own links are in; and Home is the room.
    expect(menu).toContain('createControls({ title: "The Airlock", address: location.host, presence: "quiet", corner: "bottom-left" });');
    expect(menu).toContain('portAbove(controls, { home: () => location.assign("/walk/") });');
    // Nothing is added to those controls: the menu over the Airlock is the way home and the visitor's own tabs.
    expect(menu).not.toMatch(/controls\.(add|addSection)\(/);
    // A plain import, never one that is waited for: loading the file is what puts `menu` in the page's `here`.
    const airlock = await read("src/go/airlock.ts");
    expect(airlock).toContain('import "./menu.js";');
    expect(airlock).not.toMatch(/import\(["']\.\/menu\.js["']\)/);
  });

  it("says `here` once: the kit says it, and the Airlock's own hello doesn't say it again", async () => {
    const airlock = await read("src/go/airlock.ts");
    expect(airlock).toContain("helloShell({ saidByKit: true });");
    const shell = await read("src/shared/shell.ts");
    expect(shell).toContain('if (!o.saidByKit) say({ nswp: "here", at: location.pathname });');
    expect(shell.split('nswp: "here"').length - 1).toBe(1);
  });

  it("has the sheet put away as each place arrives, so nothing of the menu is over what the place asks first", async () => {
    const menu = await read("src/shell/menu.ts");
    // When the place says `here`, not when its page has finished loading: that can be seconds later, with the
    // sheet open in the new place by then.
    expect(menu).toContain("arrived: () => menu.setOpen(false),");
    expect(menu).not.toMatch(/addEventListener\("load"/);
    const shell = await read("src/shell/main.ts");
    const heard = shell.slice(shell.indexOf('if (said.nswp === "here") {\n    lastHere = e;'));
    expect(heard.indexOf("shellMenu?.arrived();")).toBeGreaterThan(0);
    expect(heard.indexOf("shellMenu?.arrived();")).toBeLessThan(heard.indexOf("for (const fn of [...menuHears]) fn(e);"));
    // And a page that finishes loading late doesn't take the keys from under an open sheet.
    expect(shell.split("if (!shellMenu?.open) view.focus();").length - 1).toBe(2);
    // And a page of this site's own holds nothing of the visitor's to be left behind.
    expect(menu).toContain("if (left && below.origin !== location.origin) controls.say(");
  });
});

describe("what a world reports from its headset session is kept", () => {
  it("is taken as the visitor's own and kept, through the kit's own way in, and begun from when this page starts", async () => {
    const menu = await read("src/shell/menu.ts");
    expect(menu).toContain("arriveWith(keptReport(storage()));");
    expect(menu.indexOf("arriveWith(keptReport(storage()));")).toBeLessThan(menu.indexOf("const controls = createControls("));
    const taken = menu.slice(menu.indexOf("onReported: (settings) => {"));
    expect(taken.indexOf("changeSettings(settings);")).toBeLessThan(taken.indexOf("keepReport(settings, storage());"));
    // The kit's fix for the keys at the sheet's closing is in the vendored kit: this page works round nothing.
    expect(menu).not.toContain("menuClose");
    expect(menu).toContain("watchEscape();");
  });

  it("merges a later report over an earlier one, and reads nothing that isn't a kept report", () => {
    // The two functions, as they are written, over a store made here: the page's own code needs a browser.
    const kept = new Map<string, string>();
    const store = { getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v) };
    const KEY = "bitportal:reported";
    const keptReport = (): Record<string, unknown> => {
      try {
        const v = JSON.parse(store.getItem(KEY) ?? "null") as unknown;
        return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
      } catch {
        return {};
      }
    };
    const keepReport = (report: Record<string, unknown>): void => store.setItem(KEY, JSON.stringify({ ...keptReport(), ...report }));
    expect(keptReport()).toEqual({});
    keepReport({ turn: "snap", fade: true });
    keepReport({ turn: "smooth" });
    expect(keptReport()).toEqual({ turn: "smooth", fade: true });
    for (const junk of ["not json", "[1]", '"words"', "null", "7"]) {
      kept.set(KEY, junk);
      expect(keptReport(), junk).toEqual({});
    }
  });

  it("keeps them as those two functions are written in the page", async () => {
    const menu = await read("src/shell/menu.ts");
    expect(menu).toContain('export const REPORTED_KEY = "bitportal:reported";');
    expect(menu).toContain('const kept = JSON.parse(store?.getItem(REPORTED_KEY) ?? "null") as unknown;');
    expect(menu).toContain('return kept && typeof kept === "object" && !Array.isArray(kept) ? (kept as TravelSettings) : {};');
    expect(menu).toContain("store?.setItem(REPORTED_KEY, JSON.stringify({ ...keptReport(store), ...report }));");
  });
});

describe("the room is under the visitor's menu too, and fills its own tabs through the words", () => {
  it("asks the page above for the menu through the kit's own world's end, as a page of its client's own origin", async () => {
    const room = await read("src/walk/main.ts");
    // Plain imports, with the page's first files: loading the file is what puts `menu` in the room's `here`.
    expect(room).toContain('import { keepMenu, portAbove } from "nswp-sdk/menu-above";');
    expect(room).not.toMatch(/import\(["']nswp-sdk\/menu-above["']\)/);
    const asked = room.slice(room.indexOf("const above = portAbove(controls, {"), room.indexOf("const hud = keepMenu("));
    expect(asked).toContain("own: true,");
    // Signing in here is the room's own rows, said with its other tabs: no fact of it for the menu's own rows.
    expect(asked).toContain('signIn: "none",');
    // The room has no way home to be sent on: it is home, and the page above offers none there.
    expect(asked).not.toMatch(/\bhome:/);
  });

  it("keeps one menu, never two: its own only where nobody above has it, asked again each time its own is mounted", async () => {
    const room = await read("src/walk/main.ts");
    expect(room).toContain("const hud = keepMenu(controls, above, (only) => mountMenu(portHere(controls), only ? { only } : {}));");
    // And the room doesn't wait for the answer before it starts: with nobody above having the menu, it is no slower.
    expect(room).not.toContain("await hud.ready");
    // Nothing else in the room mounts a menu.
    expect(room).not.toContain("mountHud(");
    expect(room.split("mountMenu(").length - 1).toBe(1);
    // What the room's own menu covers is asked only of the room's own menu.
    expect(room.split("hud.own?.cover() ?? { top: 0, bottom: 0 }").length - 1).toBe(2);
    expect(room).not.toMatch(/hud\.cover\(\)/);
  });

  it("leaves to the page above what is the page above's: the one-time question on moving, and the menu's own sounds", async () => {
    const room = await read("src/walk/main.ts");
    expect(room).toContain("mayAsk: () => !above.has,");
    expect(room).toContain("addSoundControls(controls, sounds, { quiet: (cue) => above.has && MENU_CUES.includes(cue) });");
    expect(room).toContain("if (showing && above.has && above.menu.open) above.menu.setOpen(false);");
  });

  it("has none of the shell's own Home or You rows beside the room's", async () => {
    const menu = await read("src/shell/menu.ts");
    expect(menu).toContain('controls.add({ id: "home", section: "travel", icon: "home", label: "Home", hotbar: true, hidden: () => o.atRoom(), act: () => below.leave() });');
    expect(menu).toContain('const filledBelow = (tab: string): boolean => below.origin === location.origin && worldFills(tab);');
    expect(menu.split('hidden: () => filledBelow("you")').length - 1).toBe(3);
    // Where the place in the frame is, is what the browser reported of its own page, and only this site's own counts.
    const shell = await read("src/shell/main.ts");
    expect(shell).toContain('atRoom: () => !!lastHere && lastHere.origin === location.origin && typeof (lastHere.data as { at?: unknown }).at === "string" && (lastHere.data as { at: string }).at.startsWith("/walk/"),');
  });
});
