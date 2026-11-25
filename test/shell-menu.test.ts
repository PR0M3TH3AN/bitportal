import { describe, expect, it } from "vitest";
import { asOurOwn } from "../src/shell/own-labels.js";
import { bagOwner } from "../src/shell/bag.js";
import { shellSettings } from "../src/shell/settings.js";

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
    expect(from.sort()).toEqual(["../shared/look.js", "../shared/prefs.js", "../shared/session.js", "../shared/settings.js", "./bag-pictures.js", "./bag.js", "./own-labels.js", "./panel.js", "./settings.js", "nswp-sdk/menu", "nswp-sdk/ui"]);
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

  it("is built with the rest, so the kit's core is loaded once, and the build stops if it would ever load the renderer", async () => {
    const build = await read("scripts/build.mjs");
    // One build, the menu's file an entry of it only where the switch is on: what it shares with the shell's first
    // file is then one file, loaded once.
    expect(build.split("await build({").length - 1).toBe(1);
    const entries = build.slice(build.indexOf("entryPoints: {"), build.indexOf("splitting: true"));
    expect(entries).toContain('...(shellMenu ? { "shell/menu": join(root, "src/shell/menu.ts") } : {}),');
    // Everything the menu's file loads as it starts is followed, and no part of the renderer may be in any of it.
    expect(build).toContain('for (const i of outputs[f].imports) if (i.kind === "import-statement" && !i.external) follow(i.path);');
    expect(build).toContain('src.includes("node_modules/three/") && part.bytesInOutput > 0');
    expect(build).toContain("The shell's menu must not load the renderer, and now does:");
    expect(build.indexOf("must not load the renderer")).toBeGreaterThan(build.indexOf("if (shellMenu) {"));
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
    expect(shell).toContain("    lastHere = e;\n    unheardWords = [];\n    // Answered from here, always");
    expect(shell).toContain("if (said !== lastHere || said.source !== view.contentWindow || !menuHears.has(fn)) return;\n        fn(said);\n        for (const word of after) fn(word);");
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
    expect(menu).toContain("mountMenu(port, { parent: place })");
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

describe("how they move at a desk is one choice, in the room and over every world", () => {
  it("is kept by the shell's menu under the name the room keeps it by, and read from there by the one settings reader", async () => {
    const menu = await read("src/shell/menu.ts");
    expect(menu).toContain('import { INTENSE_KEY } from "../shared/prefs.js";');
    expect(menu).toContain("controls.add(deskMovingSwitch(controls, { presenting, keep: INTENSE_KEY }));");
    expect(menu).toContain("askDeskMoving(controls, { presenting, keep: INTENSE_KEY });");
    expect(menu.split("deskMovingSwitch(").length - 1).toBe(1);
    expect(menu.split("askDeskMoving(").length - 1).toBe(1);
    const prefs = await read("src/shared/prefs.ts");
    expect(prefs).toContain('export const INTENSE_KEY = "bitportal:fps";');
    const room = await read("src/walk/main.ts");
    expect(room).toContain('keep: "bitportal:fps",');
  });
});

describe("the menu is on, and the switch is kept the other way round for a trial's comparison", () => {
  it("is set when the site is built, on unless the build is told otherwise, and by nothing a page can read", async () => {
    const build = await read("scripts/build.mjs");
    expect(build).toContain('const shellMenu = process.env.BITPORTAL_SHELL_MENU !== "0";');
    expect(build).toContain("define: { SHELL_MENU: JSON.stringify(shellMenu) },");
    // The menu's own file is built only for a build that has it on.
    expect(build).toContain('...(shellMenu ? { "shell/menu": join(root, "src/shell/menu.ts") } : {}),');
    expect(build.split('join(root, "src/shell/menu.ts")').length - 1).toBe(1);
    const shell = await read("src/shell/main.ts");
    expect(shell).toContain("declare const SHELL_MENU: boolean;");
    // Read nowhere but where the menu is loaded, and never from the address, storage or a message.
    // Read where the menu is loaded, where a place is told this page has none, where a place's words are kept for a
    // menu still to come, and where it is declared. Never from the address, storage or a message.
    expect(shell.split("SHELL_MENU").length - 1).toBe(4);
    expect(shell.split("if (SHELL_MENU").length - 1).toBe(3);
    const guarded = shell.slice(shell.indexOf("if (SHELL_MENU) {"));
    expect(guarded.indexOf('import("/shell/menu.js" as string)')).toBeGreaterThan(0);
    expect(shell.slice(0, shell.indexOf("if (SHELL_MENU) {"))).not.toContain("/shell/menu.js");
    for (const page of ["src/shell/menu.ts", "src/shell/panel.ts", "src/shared/shell.ts"]) expect(await read(page), page).not.toContain("SHELL_MENU");
  });

  it("is checked in the built site by the gate, after the build, and by the deploy before anything is sent", async () => {
    const gate = await read("scripts/gate.mjs");
    expect(gate.indexOf('["shell-menu:on", "the built site has the client\'s menu on"],')).toBeGreaterThan(gate.indexOf('["build", "every page"],'));
    expect(gate).not.toContain("shell-menu:off");
    const scripts = JSON.parse(await read("package.json")).scripts;
    expect(scripts["shell-menu:on"]).toBe("node scripts/check-shell-menu.mjs");
    expect(scripts["shell-menu:off"]).toBeUndefined();
    const deploy = await read("scripts/deploy.mjs");
    expect(deploy.indexOf("const menuMissing = shellMenuMissing(dist);")).toBeGreaterThan(0);
    expect(deploy.indexOf("if (menuMissing.length) throw new Error(")).toBeLessThan(deploy.indexOf('execFileSync("vercel"'));
  });

  it("finds a build that hasn't all of the menu: its file, the shell naming it, the Bag's page and its rules", async () => {
    const fs = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { mkdtempSync(prefix: string): string; mkdirSync(path: string, o?: { recursive: boolean }): void; writeFileSync(path: string, text: string): void; rmSync(path: string, how: { recursive: boolean; force: boolean }): void };
    const os = (await import(/* @vite-ignore */ ["node", "os"].join(":"))) as { tmpdir(): string };
    const path = (await import(/* @vite-ignore */ ["node", "path"].join(":"))) as { join(...parts: string[]): string };
    const { shellMenuMissing } = (await import(/* @vite-ignore */ ["..", "scripts", "check-shell-menu.mjs"].join("/"))) as { shellMenuMissing(dir: string): string[] };
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "shell-menu-on-"));
    try {
      expect(shellMenuMissing(dir)).toEqual(["dist/shell/main.js is missing: run npm run build"]);
      fs.mkdirSync(path.join(dir, "shell", "pictures"), { recursive: true });
      fs.writeFileSync(path.join(dir, "shell", "main.js"), "frame.src=first;");
      // Nothing of the menu: four things missing (its file, the shell naming it, the Bag's page twice) and the rules.
      expect(shellMenuMissing(dir).length).toBe(5);
      fs.writeFileSync(path.join(dir, "shell", "main.js"), 'frame.src=first;import("/shell/menu.js")');
      fs.writeFileSync(path.join(dir, "shell", "menu.js"), "export{}");
      fs.writeFileSync(path.join(dir, "shell", "pictures", "index.html"), "<!doctype html>");
      fs.writeFileSync(path.join(dir, "shell", "pictures", "main.js"), "export{}");
      expect(shellMenuMissing(dir)).toEqual(["dist/vercel.json has no rules of its own for /shell/pictures"]);
      fs.writeFileSync(path.join(dir, "vercel.json"), '{"headers":[{"source":"/shell/pictures(/.*)?"}]}');
      expect(shellMenuMissing(dir)).toEqual([]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("still finds a build that has the menu on, for a trial's comparison build that should not: by its file and by the shell naming it", async () => {
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
    const heard = shell.slice(shell.indexOf("    lastHere = e;\n    unheardWords = [];\n    // Answered from here, always"));
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
    const menu = await read("src/shell/settings.ts");
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
    // What the menu covers of the room's view is asked of the kept menu, whoever draws it: the room's own, or the
    // page above's as it last said (the kit's `covers`). So the view is shifted clear of the bar under either.
    expect(room.split("const cover = hud.cover();").length - 1).toBe(2);
    expect(room).not.toMatch(/hud\.own\?\.cover\(\)/);
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

describe("over a page of this site's own, what the page fills is labelled as this site's own", () => {
  const item = (id: string, from?: string) => ({ id, label: id, ...(from ? { from } : {}) }) as never;
  const view = {
    title: "Your room",
    sections: [
      { id: "travel", label: "Travel", icon: null, note: "", card: null, pinned: false, items: [item("home"), item("world:list", "Your room")] },
      { id: "help", label: "Help", icon: null, note: "How to move.", card: null, pinned: false, items: [], said: { from: "Your room", note: "Your doors are here." } },
      { id: "doors", label: "Doors · Your room", icon: null, note: "", card: null, pinned: true, items: [item("world:grove", "Your room")] },
    ],
    hotbar: [item("home"), item("world:join", "Your room")],
    pins: [{ id: "doors", label: "Doors · Your room", icon: null, key: "3" }],
  } as never;

  it("takes the room's name off its rows, its tabs and what it says, and changes nothing else", () => {
    const ours = asOurOwn(view, "Your room") as unknown as { title: string; sections: { id: string; label: string; note: string; said?: unknown; pinned: boolean; items: { id: string; from?: string }[] }[]; hotbar: { id: string; from?: string }[]; pins: { label: string; key: string }[] };
    expect(ours.sections.map((s) => s.label)).toEqual(["Travel", "Help", "Doors"]);
    expect(ours.sections.flatMap((s) => s.items).every((i) => !("from" in i))).toBe(true);
    expect(ours.sections.flatMap((s) => s.items.map((i) => i.id))).toEqual(["home", "world:list", "world:grove"]);
    expect(ours.sections[1]!.note).toBe("How to move.\n\nYour doors are here.");
    expect(ours.sections[1]!.said).toBeUndefined();
    expect(ours.sections[2]!.pinned).toBe(true);
    expect(ours.hotbar.every((i) => !("from" in i))).toBe(true);
    expect(ours.pins).toEqual([{ id: "doors", label: "Doors", icon: null, key: "3" }]);
    expect(ours.title).toBe("Your room");
  });

  it("leaves alone anything said under another name, and everything where there is no name", () => {
    const other = asOurOwn(view, "The Grove") as unknown as { sections: { label: string; said?: unknown; items: { from?: string }[] }[] };
    expect(other.sections.map((s) => s.label)).toEqual(["Travel", "Help", "Doors · Your room"]);
    expect(other.sections[0]!.items[1]!.from).toBe("Your room");
    expect(other.sections[1]!.said).toEqual({ from: "Your room", note: "Your doors are here." });
    expect(asOurOwn(view, "")).toBe(view);
  });

  it("is used only where the browser says the page is of this site's own origin, exactly", async () => {
    const menu = await read("src/shell/menu.ts");
    expect(menu).toContain("view: { value: () => (below.origin === location.origin && below.world ? asOurOwn(below.port.view(), below.world.title || location.host) : below.port.view()) },");
    expect(menu.split("asOurOwn(").length - 1).toBe(1);
  });
});

describe("a place is answered from the shell's first file, at once", () => {
  it("is told \"hasn't\" with the menu off or its file not come, and \"has\" with the visitor's settings otherwise", async () => {
    const shell = await read("src/shell/main.ts");
    const answer = shell.slice(shell.indexOf("const answerPlace = (): void => {"), shell.indexOf("/** Whether the frame's page has finished loading"));
    // Only to the origin that said `here`, only from the frame, and only where the place speaks the menu's words.
    expect(answer).toContain('if (!said || said.source !== view.contentWindow || !said.origin || said.origin === "null") return;');
    expect(answer).toContain("const v = menuVersionOf(said.data);\n  if (!v) return;");
    expect(answer).toContain("if (SHELL_MENU && !menuFailed) {");
    expect(answer).toContain('view.contentWindow?.postMessage({ nswp: "menu", has: true, v, settings: shellSettings() }, said.origin);');
    expect(answer).toContain('view.contentWindow?.postMessage({ nswp: "menu", has: false }, said.origin);');
    expect(shell).not.toMatch(/postMessage\(\{ nswp: "menu"[^)]*\}, "\*"\)/);
    // Always, and before anything else is done about the new place: before the sheet is put away, and before the
    // menu's own end is handed the word.
    const heard = shell.slice(shell.indexOf("    lastHere = e;\n    unheardWords = [];"));
    expect(heard.indexOf("answerPlace();")).toBeGreaterThan(0);
    expect(heard.indexOf("answerPlace();")).toBeLessThan(heard.indexOf("shellMenu?.arrived();"));
    expect(heard.indexOf("answerPlace();")).toBeLessThan(heard.indexOf("for (const fn of [...menuHears]) fn(e);"));
  });

  it("says the same settings as the menu's own file will: one reader, used by both", async () => {
    const menu = await read("src/shell/menu.ts");
    expect(menu).toContain("settings: () => shellSettings(),");
    const shell = await read("src/shell/main.ts");
    expect(shell.split("shellSettings()").length - 1).toBe(1);
    expect(menu).toContain('from "./settings.js";');
    // The first file takes the same reader by a name the build fills in: the reader where the menu is on, and a
    // stand-in that reads nothing where it is off, so an ordinary build loads nothing for a menu it hasn't got.
    expect(shell).toContain('import { shellSettings } from "shell-first-settings";');
    const build = await read("scripts/build.mjs");
    expect(build).toContain('"shell-first-settings": join(root, shellMenu ? "src/shell/settings.ts" : "src/shell/settings-off.ts"),');
    const off = await read("src/shell/settings-off.ts");
    expect(off).toContain("export const shellSettings = (): MenuSettings => ({});");
    expect([...off.matchAll(/^import .* from "([^"]+)";$/gm)].map((m) => m[1])).toEqual(["@nswp/core"]);
    expect(off).toContain('import type { MenuSettings } from "@nswp/core";');
  });

  it("keeps what a place says before the menu's file has come, the newest of it, and says it to the menu in order", async () => {
    const shell = await read("src/shell/main.ts");
    expect(shell).toContain("const KEPT_WORDS = 48;");
    // Only where a menu can come: an ordinary build keeps nothing for a menu it hasn't got.
    expect(shell).toContain('} else if (SHELL_MENU && said.nswp === "menu" && menuHears.size === 0 && lastHere && e.origin === lastHere.origin) {');
    expect(shell.split("unheardWords.push(").length - 1).toBe(1);
    expect(shell).toContain("unheardWords.push(e);\n    if (unheardWords.length > KEPT_WORDS) unheardWords.shift();");
    // A new place's `here` forgets what the last place said.
    expect(shell).toContain("lastHere = e;\n    unheardWords = [];");
  });

  it("tells the place to draw its own if the menu's file fails or takes too long, and lets the menu take over if it comes after all", async () => {
    const shell = await read("src/shell/main.ts");
    expect(shell).toContain("const MENU_FILE_MS = 8000;");
    const late = shell.slice(shell.indexOf("const tooLong = setTimeout(() => {"));
    expect(late.indexOf("if (menuHears.size > 0) return;")).toBeLessThan(late.indexOf("menuFailed = true;"));
    const failed = shell.slice(shell.indexOf(".catch(() => {\n        // Without it every place draws its own menu"));
    expect(failed.indexOf("menuFailed = true;")).toBeLessThan(failed.indexOf("answerPlace();"));
    expect(shell).toContain("clearTimeout(tooLong);\n        menuFailed = false;");
  });
});

describe("the visitor's settings, as the shell says them", () => {
  const store = (kept: Record<string, string>) => ({ getItem: (k: string) => kept[k] ?? null });

  it("reads what the kit's parts keep for this site, and what a world reported, with the kept over the reported", () => {
    const said = shellSettings(store({ "bitportal:reported": JSON.stringify({ turn: 90, hand: "left", look: 2 }), "nswp:desk": JSON.stringify({ look: 0.75 }), "nswp:full": "1" }));
    expect(said.turn).toBe(90);
    expect(said.hand).toBe("left");
    expect(said.full).toBe(true);
    // How fast the view turns is kept by a part of the kit in this page: that, not an older report of it.
    expect(said.look).toBe(0.75);
  });

  it("never says files from anywhere, or what is in hand, whatever is kept", () => {
    const said = shellSettings(store({ "bitportal:reported": JSON.stringify({ filesAnywhere: true, holding: { item: "x" }, turn: 45 }), "nswp:holding": JSON.stringify({ item: `37303:${"a".repeat(64)}:thing` }) }));
    expect("filesAnywhere" in said).toBe(false);
    expect("holding" in said).toBe(false);
    expect(said.turn).toBe(45);
  });

  it("says something sensible with nothing kept, and with what is kept unreadable", () => {
    expect(() => shellSettings(store({}))).not.toThrow();
    expect(() => shellSettings(store({ "bitportal:reported": "not json", "nswp:desk": "{", "bitportal:sound": "7" }))).not.toThrow();
    expect(() => shellSettings(null)).not.toThrow();
    expect(typeof shellSettings(store({})).pictures).toBe("boolean");
  });
});

describe("the Bag in the shell's menu, over a world", () => {
  const ME = "a".repeat(64);
  const OURS = "https://portal.bitblocks.network";
  const WORLD = "https://grove.bitblocks.network";

  it("is the bag of whoever is signed in to BitPortal, and only where the world says they are named there", () => {
    expect(bagOwner({ signedIn: () => ME, origin: WORLD, ours: OURS, named: true })).toBe(ME);
    // A guest in that world carries nothing there, whoever they are to BitPortal.
    expect(bagOwner({ signedIn: () => ME, origin: WORLD, ours: OURS, named: false })).toBeNull();
    // Nobody signed in to BitPortal: nobody's bag, whatever the world says.
    expect(bagOwner({ signedIn: () => null, origin: WORLD, ours: OURS, named: true })).toBeNull();
    // Over this site's own pages the room fills the Bag itself, and before any place has spoken there is none.
    expect(bagOwner({ signedIn: () => ME, origin: OURS, ours: OURS, named: true })).toBeNull();
    expect(bagOwner({ signedIn: () => ME, origin: "", ours: OURS, named: true })).toBeNull();
  });

  it("asks who is signed in only once the world has said they are named: a guest's visit asks nothing of who they are", () => {
    let asked = 0;
    const signedIn = (): string => (asked++, ME);
    bagOwner({ signedIn, origin: WORLD, ours: OURS, named: false });
    bagOwner({ signedIn, origin: OURS, ours: OURS, named: true });
    expect(asked).toBe(0);
  });

  it("is the kit's own Bag and item store, with no hand to change it, and its things shown without the renderer", async () => {
    const bag = await read("src/shell/bag.ts");
    expect([...bag.matchAll(/^import .* from "([^"]+)";$/gm)].map((m) => m[1]).sort()).toEqual(["nswp-sdk/bag", "nswp-sdk/menu", "nswp-sdk/ui"]);
    expect(bag).toContain("const bag = createBag({ me, relays: o.relays, hand: null });");
    expect(bag).toContain("const items = createItemStore({ relays: o.relays, viewer: me });");
    // Each thing's picture is handed in by the menu (bag-pictures.ts: drawn by a page framed unseen); with none
    // handed in, the kit shows first letters. Either way this page loads no renderer.
    expect(bag).toContain("previews: o.previews ?? null,");
    // No lookup, signature check or query of this site's own: those are the kit's.
    expect(bag).not.toMatch(/verifyEvent|queryRelays|parseItem|new WebSocket|fetch\(/);
  });

  it("asks before a thing's own logic first runs, by the kit's rule, and tells the world only the script they let run", async () => {
    const bag = await read("src/shell/bag.ts");
    const hold = bag.slice(bag.indexOf("hold: async (item, tints) => {"));
    const may = hold.indexOf("const may = mayHold(described, { rule: rule(), scripts: true, asked });");
    const told = hold.indexOf("await o.below.hold(item, {");
    expect(may).toBeGreaterThan(0);
    expect(hold.indexOf("if (!may.ok) return may;")).toBeGreaterThan(may);
    expect(told).toBeGreaterThan(hold.indexOf("if (!may.ok) return may;"));
    expect(hold).toContain("...(script && scriptAllowed(script) ? { script } : {})");
    // One memory of what was asked, kept for the page's life: a second press on the same item is their yes.
    expect(bag.split('const asked = { sha: "" };').length - 1).toBe(1);
  });

  it("reads who is signed in from this browser's own note, in the menu's own file and not the shell's first one", async () => {
    const menu = await read("src/shell/menu.ts");
    expect(menu).toContain("addShellBag({ controls, below, signedIn: () => (goesAsGuest() ? null : (knownSignedIn()?.pubkey ?? null)), relays: loadSettings().relays, previews: pictures });");
    // The page's first file gains nothing for it: with the menu off, nothing of who is signed in is loaded there.
    const shell = await read("src/shell/main.ts");
    expect(shell).not.toMatch(/shared\/session|shared\/look|knownSignedIn/);
    const build = await read("scripts/build.mjs");
    // The kit's Bag is named to the one build, which the menu's file is an entry of.
    expect(build.split('"nswp-sdk/bag": join(root, "vendor/nswp/sdk/bag-entry.js"),').length - 1).toBe(1);
  });
});
