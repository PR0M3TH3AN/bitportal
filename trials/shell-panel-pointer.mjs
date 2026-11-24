// BitLogin's panel over a world whose view holds the pointer (the owner, 2026-11-24: "the bitlogin panels force me
// to hit escape again to use. The game just playes behind them ... when i hit escape the game exits full screen.").
//
//   npm run build                            an ordinary build: the world draws its own menu
//   node trials/shell-panel-pointer.mjs      (BASE, the shell's local address; WORLD, a local world)
//
// What must be so, and is tried here for each row of a world's menu that brings the panel up:
//   with looking by the mouse on, the row is pressed and the panel comes up;
//   NO ESCAPE IS PRESSED;
//   the world does not hold the pointer; a press at the panel's middle lands in the panel and not in the world;
//   W held and the mouse moved leave the visitor where they were and facing as they were;
//   then the panel is put away by a press beside it, and one more press gives the pointer back to the world.
//
// The fault is the world's side of the kit: the world's menu steps aside for the panel, closing the menu goes back
// to looking, and the world takes the pointer as the panel comes up. So this fails against a world on kit 0.87.0
// or earlier, and should pass, unchanged, against a world on the kit that mends it. BitPortal's own pages are not
// what is wrong and nothing here tries them.
//
// Everything is on this machine. Every press is the mouse at a place on the screen and every key the keyboard's
// own; pages are only read. Nobody signs in: the panel is only brought up, and a press lands in it or doesn't.
//
// FULL SCREEN IS NOT TRIED: the scripted browser does not go full screen at the press of "Full screen". That the
// screen stays filled while the panel is used, with no Escape, is for a person to try by hand.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const NSWP = process.env.NSWP ?? `${process.env.HOME}/Documents/GitHub/Nostr-Spatial-Web-Protocol--NSWP-`;
const pw = await import(`${NSWP}/node_modules/playwright-core/index.mjs`);
const BASE = process.env.BASE ?? "https://192.168.68.84:4800";
const WORLD = process.env.WORLD ?? "https://192.168.68.84:4802";
const SHOTS = process.env.SHOTS ?? ".shots";
mkdirSync(SHOTS, { recursive: true });
const checks = [];
const check = (name, ok, more) => { checks.push({ name, ok: !!ok, ...(more === undefined ? {} : { more }) }); console.log(`${ok ? "ok  " : "FAIL"} ${name}${more === undefined ? "" : ` ${JSON.stringify(more)}`}`); };
const browser = await pw.chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

/** The rows of a world's own menu, under You, that ask its client for the sign-in address's panel. */
const ROWS = [
  ["sign in", /^Sign in, at/],
  ["your account", /^Your account, at/],
  ["your files", /^Your files, at/],
  ["your purchases", /^Your purchases, at/],
];

const visit = async () => {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  // Each page notes the presses and keys it hears: read afterwards, to say which page a press landed in.
  await ctx.addInitScript(() => {
    window.__downs = 0;
    window.__keys = [];
    addEventListener("mousedown", () => window.__downs++, true);
    addEventListener("keydown", (e) => window.__keys.push(e.code), true);
  });
  const page = await ctx.newPage();
  const faults = [];
  page.on("pageerror", (e) => faults.push(String(e).slice(0, 200)));
  const wait = (ms) => page.waitForTimeout(ms);
  const until = async (so, ms = 20000) => { for (const end = Date.now() + ms; Date.now() < end; ) { if (await Promise.resolve().then(so).catch(() => false)) return true; await wait(150); } return false; };
  const world = () => page.frames().find((f) => f.url().startsWith(WORLD));
  const panel = () => page.frames().find((f) => f !== page.mainFrame() && /\/connect\/panel\//.test(f.url()));
  // Where a thing is and what is on top there are read in one look, and it is pressed only where its middle is on
  // the thing itself (BitPortal PRs 213 and the Bag's pictures have the two accounts of why).
  const press = async (locator) => {
    await locator.first().waitFor({ state: "visible", timeout: 30000 });
    await wait(300);
    let seen = null;
    for (let n = 0; n < 30; n++) {
      seen = await locator.first().evaluate((el) => {
        const r = el.getBoundingClientRect();
        const [x, y] = [r.x + r.width / 2, r.y + r.height / 2];
        let at = document.elementFromPoint(x, y);
        while (at?.shadowRoot) { const inner = at.shadowRoot.elementFromPoint(x, y); if (!inner || inner === at) break; at = inner; }
        const say = (n) => `${n.tagName.toLowerCase()} "${(n.textContent ?? "").trim().slice(0, 30)}"`;
        return { x, y, placed: el.isConnected && r.width > 0 && r.height > 0, on: !!at && (at === el || el.contains(at) || at.contains(el) || el.getRootNode().host === at), what: at ? say(at) : "nothing" };
      }).catch(() => null);
      if (seen?.placed) break;
      await wait(200);
    }
    if (!seen?.placed) throw new Error(`no place on screen for ${locator}`);
    if (!seen.on) throw new Error(`the middle of ${locator} is not on it: what is there is ${seen.what}. Nothing was pressed.`);
    // The place is in the world's own page; the mouse is the screen's. The world's frame fills the shell's page.
    await page.mouse.click(seen.x, seen.y);
    await wait(500);
  };
  const sheetOpen = () => world().getByRole("button", { name: "Close", exact: true }).isVisible().catch(() => false);
  const chosen = () => world().locator('[role="tab"][aria-selected="true"]:visible').first().innerText({ timeout: 1500 }).then((t) => t.trim()).catch(() => "");
  /** A tab, by the arrow keys from the chosen one: a tab scrolled half out of sight has no middle to press. */
  const goTab = async (name) => {
    if ((await chosen()) !== name) await press(world().locator('[role="tab"][aria-selected="true"]:visible'));
    for (let n = 0; n < 24 && (await chosen()) !== name; n++) { const was = await chosen(); await page.keyboard.press("ArrowRight"); for (let i = 0; i < 40 && (await chosen()) === was; i++) await wait(100); }
    return (await chosen()) === name;
  };
  const worldHoldsPointer = () => world().evaluate(() => !!document.pointerLockElement);
  const panelIs = () => page.evaluate(() => { const p = document.querySelector(".shell-panel"); return !p ? "none" : p.hasAttribute("data-kept") ? "kept" : p.hasAttribute("data-waiting") ? "coming" : "up"; });
  const stands = () => world().evaluate(() => ({ where: Object.values(window.__nswpTest.where()).map((n) => Math.round(n * 100) / 100), heading: Math.round(window.__nswpTest.heading() * 10) / 10 }));
  const heard = async () => ({ world: await world().evaluate(() => window.__downs), panel: (await panel()?.evaluate(() => window.__downs).catch(() => 0)) ?? 0, shell: await page.evaluate(() => window.__downs) });
  await page.goto(`${BASE}/shell/#to=${encodeURIComponent(`${WORLD}/`)}`);
  await until(() => world()?.evaluate(() => window.__nswpTest?.state?.ready === true), 90000);
  await wait(2500);
  return { ctx, page, faults, wait, until, world, panel, press, sheetOpen, goTab, worldHoldsPointer, panelIs, stands, heard };
};

for (const [name, row] of ROWS) {
  const v = await visit();
  const w = v.world();
  // Looking with the mouse: the world's own switch, under Moving. Closing the menu, the pointer is the world's.
  await v.press(w.getByRole("button", { name: /^Menu/ }));
  await v.goTab("Moving");
  await v.press(w.getByRole("button", { name: /^Desk controls: casual/ }));
  await v.press(w.getByRole("button", { name: "Close", exact: true }));
  const looking = await v.until(v.worldHoldsPointer, 5000);
  check(`(${name}) with looking by the mouse on and the menu closed, the world holds the pointer`, looking);
  // The menu by its key (the pointer is the world's: there is nothing to press), and the row.
  await v.page.keyboard.press("m");
  check(`(${name}) the menu's key brings the world's menu, and the pointer is let go`, (await v.until(v.sheetOpen, 5000)) && !(await v.worldHoldsPointer()));
  await v.goTab("You");
  await v.press(w.getByRole("button", { name: row }));
  const up = await v.until(async () => (await v.panelIs()) === "up", 15000);
  check(`(${name}) the row brings the sign-in address's panel up over the world`, up, await v.panelIs());
  await v.wait(1500);
  // No Escape is pressed, here or anywhere in this trial.
  check(`(${name}) with the panel up, the world does not hold the pointer`, !(await v.worldHoldsPointer()), { worldHoldsThePointer: await v.worldHoldsPointer() });
  const middle = await v.page.evaluate(() => { const r = document.querySelector(".shell-panel")?.getBoundingClientRect(); return r ? { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), left: Math.round(r.x), top: Math.round(r.y) } : null; });
  const stood = await v.stands();
  const h0 = await v.heard();
  if (middle) await v.page.mouse.click(middle.x, middle.y);
  await v.wait(500);
  const h1 = await v.heard();
  check(`(${name}) a press at the panel's middle lands in the panel, and not in the world`, !!middle && h1.panel - h0.panel === 1 && h1.world - h0.world === 0, { at: middle && [middle.x, middle.y], heardByThePanel: h1.panel - h0.panel, heardByTheWorld: h1.world - h0.world });
  await v.page.keyboard.down("w");
  await v.wait(1200);
  await v.page.keyboard.up("w");
  if (middle) await v.page.mouse.move(middle.x + 180, middle.y, { steps: 12 });
  await v.wait(400);
  const now = await v.stands();
  check(`(${name}) W held and the mouse moved, the visitor is where they were and faces as they did`, JSON.stringify(now) === JSON.stringify(stood), { before: stood, after: now });
  await v.page.screenshot({ path: join(SHOTS, `shell-panel-pointer-${name.replace(/\s+/g, "-")}.png`) });
  // The panel is put away by a press beside it, on the page's own scrim.
  const beside = middle ? { x: Math.max(20, middle.left - 60), y: middle.y } : null;
  if (beside) await v.page.mouse.click(beside.x, beside.y);
  const away = await v.until(async () => ["none", "kept"].includes(await v.panelIs()), 6000);
  check(`(${name}) a press beside the panel puts it away`, away, await v.panelIs());
  // One more press and the pointer is the world's: on Close if the world's menu came back, on the view if not.
  await v.wait(800);
  if (await v.sheetOpen()) await v.press(w.getByRole("button", { name: "Close", exact: true })).catch(() => {});
  else await v.page.mouse.click(720, 450);
  check(`(${name}) the panel away, one press and the world holds the pointer again`, away && (await v.until(v.worldHoldsPointer, 5000)));
  check(`(${name}) no page error`, v.faults.length === 0, v.faults);
  await v.ctx.close();
}

const failed = checks.filter((c) => !c.ok);
writeFileSync(join(SHOTS, "shell-panel-pointer.json"), JSON.stringify({ checks }, null, 1));
console.log("\nnot tried: full screen (the scripted browser does not go full screen); a panel asked for with the menu closed; a world made with another engine");
console.log(`${checks.length - failed.length} of ${checks.length} checks passed`);
await browser.close();
process.exit(failed.length ? 1 : 0);
