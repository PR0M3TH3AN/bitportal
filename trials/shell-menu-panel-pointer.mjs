// BitLogin's panel over a world whose view holds the pointer, brought up from the shell's OWN menu: the switched-on
// shell, where the world draws no menu and the panel is asked for by the shell's rows. The owner's report of
// 2026-11-24 ("the bitlogin panels force me to hit escape again to use ... when i hit escape the game exits full
// screen") on the path the switch-on changes. trials/shell-panel-pointer.mjs tries the world's own menu.
//
//   npm run build                                       the site, with the menu on
//   npm run trial -- trials/shell-menu-panel-pointer.mjs (BASE, the shell's local address; WORLD, a local world)
//
// For each row of the shell's menu that brings the panel up, a fresh page:
//   looking by the mouse is switched on in the shell's menu (under Moving; kept as `bitportal:fps`), the menu
//   closed, and one press on the view: the world holds the pointer;
//   the menu's key: the shell's menu comes up, and the pointer is let go;
//   the row is pressed and the panel comes up; NO ESCAPE IS PRESSED;
//   the world does not hold the pointer; a press at the panel's middle lands in the panel and not in the world;
//   W held and the mouse moved leave the visitor where they were and facing as they did;
//   then the panel is put away by a press beside it, and the shell's sheet comes back up on You, where the panel was
//   asked for (the owner, 2026-11-25), as a world's own menu does; closed, one press on the view gives the pointer
//   back to the world.
//
// FIRST, A CONTRAST: the same row with looking by the mouse left off, so the checks are known to be able to pass.
//
// Where a press lands is judged as in trials/shell-panel-pointer.mjs (its top says how, and why the trial waits for
// the panel to stand still): the panel's page, the world's (the fault), or neither; NOT JUDGED where it is handed to
// the shell's page as a press on the panel's own frame. Not-judged checks are counted and are not passes.
//
// Everything is on this machine. Every press is the mouse at a place on the screen and every key the keyboard's
// own; pages are only read. Nobody signs in. FULL SCREEN IS NOT TRIED: the scripted browser does not go full screen.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const NSWP = process.env.NSWP ?? `${process.env.HOME}/Documents/GitHub/Nostr-Spatial-Web-Protocol--NSWP-`;
const pw = await import(`${NSWP}/node_modules/playwright-core/index.mjs`);
const BASE = process.env.BASE ?? "https://192.168.68.84:4800";
const WORLD = process.env.WORLD ?? "https://192.168.68.84:4802";
const SHOTS = process.env.SHOTS ?? ".shots";
mkdirSync(SHOTS, { recursive: true });
const checks = [];
/** Checks that could not be judged on this run, and why: counted and printed, never passes. */
const notJudged = [];
const check = (name, ok, more) => { checks.push({ name, ok: !!ok, ...(more === undefined ? {} : { more }) }); console.log(`${ok ? "ok  " : "FAIL"} ${name}${more === undefined ? "" : ` ${JSON.stringify(more)}`}`); };
const browser = await pw.chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

/** The rows of the shell's own menu, under You, that bring the sign-in address's panel up over a world. */
const ROWS = [
  ["sign in", /^Sign in to /],
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
    // In the shell's own page: presses it was handed as being on the panel's own frame. A person's press on a frame
    // goes into the frame and its page hears nothing; a scripted browser may hand it to the page that holds the frame.
    window.__downsOnPanelFrame = 0;
    addEventListener("mousedown", (e) => { if (e.target instanceof HTMLIFrameElement && e.target.closest(".shell-panel")) window.__downsOnPanelFrame++; }, true);
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
    // Looked at twice, a moment apart, and pressed only once it stands still: the tab bar scrolls to the chosen tab,
    // and on a loaded machine a tab measured mid-scroll has its middle outside the sheet (seen 2026-11-25: three runs
    // in five at a load of 24 stopped on "div.outside", the press-outside layer, while the picture then showed the
    // tab in place).
    let seen = null;
    let was = "";
    for (let n = 0; n < 30; n++) {
      seen = await locator.first().evaluate((el) => {
        const r = el.getBoundingClientRect();
        const [x, y] = [r.x + r.width / 2, r.y + r.height / 2];
        let at = document.elementFromPoint(x, y);
        while (at?.shadowRoot) { const inner = at.shadowRoot.elementFromPoint(x, y); if (!inner || inner === at) break; at = inner; }
        const say = (n) => `${n.tagName.toLowerCase()} "${(n.textContent ?? "").trim().slice(0, 30)}"`;
        return { x, y, placed: el.isConnected && r.width > 0 && r.height > 0, on: !!at && (at === el || el.contains(at) || at.contains(el) || el.getRootNode().host === at), what: at ? say(at) : "nothing" };
      }).catch(() => null);
      const now = seen ? `${Math.round(seen.x)},${Math.round(seen.y)}` : "";
      if (seen?.placed && seen.on && now === was) break;
      was = now;
      await wait(150);
    }
    if (!seen?.placed) throw new Error(`no place on screen for ${locator}`);
    if (!seen.on) throw new Error(`the middle of ${locator} is not on it: what is there is ${seen.what}. Nothing was pressed.`);
    // The place is in the world's own page; the mouse is the screen's. The world's frame fills the shell's page.
    await page.mouse.click(seen.x, seen.y);
    await wait(500);
  };
  // The shell's own menu: the world draws none.
  const hud = page.locator(".shell-menu");
  const sheetOpen = () => hud.getByRole("button", { name: "Close", exact: true }).isVisible().catch(() => false);
  const chosen = () => hud.locator('[role="tab"][aria-selected="true"]:visible').first().innerText({ timeout: 1500 }).then((t) => t.trim()).catch(() => "");
  /** A tab, by the arrow keys from the chosen one: a tab scrolled half out of sight has no middle to press. */
  const goTab = async (name) => {
    if ((await chosen()) !== name) await press(hud.locator('[role="tab"][aria-selected="true"]:visible'));
    for (let n = 0; n < 24 && (await chosen()) !== name; n++) { const was = await chosen(); await page.keyboard.press("ArrowRight"); for (let i = 0; i < 40 && (await chosen()) === was; i++) await wait(100); }
    return (await chosen()) === name;
  };
  const worldHoldsPointer = () => world().evaluate(() => !!document.pointerLockElement);
  const panelIs = () => page.evaluate(() => { const p = document.querySelector(".shell-panel"); return !p ? "none" : p.hasAttribute("data-kept") ? "kept" : p.hasAttribute("data-waiting") ? "coming" : "up"; });
  const stands = () => world().evaluate(() => ({ where: Object.values(window.__nswpTest.where()).map((n) => Math.round(n * 100) / 100), heading: Math.round(window.__nswpTest.heading() * 10) / 10 }));
  const heard = async () => ({ world: await world().evaluate(() => window.__downs), panel: (await panel()?.evaluate(() => window.__downs).catch(() => 0)) ?? 0, shell: await page.evaluate(() => window.__downs), shellOnPanelFrame: await page.evaluate(() => window.__downsOnPanelFrame) });
  /**
   * One press at the panel's middle, and where it landed: "panel" (heard inside the panel's page), "world" (the
   * fault), "not judged" (handed to the shell's page as a press on the panel's frame: see the top of this file), or
   * "elsewhere".
   */
  /** Wait until the panel's box has not changed for `still` ms (see the top of this file), and say where its middle is. */
  const panelStill = async (still = 3000, most = 15000) => {
    const box = () => page.evaluate(() => { const r = document.querySelector(".shell-panel")?.getBoundingClientRect(); return r ? { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), left: Math.round(r.x), top: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) } : null; });
    let last = await box();
    let since = Date.now();
    for (const end = Date.now() + most; Date.now() < end && Date.now() - since < still; ) {
      await wait(100);
      const now = await box();
      if (JSON.stringify(now) !== JSON.stringify(last)) { last = now; since = Date.now(); }
    }
    return last;
  };
  const pressPanel = async (middle) => {
    const h0 = await heard();
    await page.mouse.click(middle.x, middle.y);
    await wait(500);
    const h1 = await heard();
    const by = { panel: h1.panel - h0.panel, world: h1.world - h0.world, shell: h1.shell - h0.shell, shellAsOnThePanelsFrame: h1.shellOnPanelFrame - h0.shellOnPanelFrame };
    const landed = by.world > 0 ? "world" : by.panel === 1 ? "panel" : by.panel === 0 && by.shell === 1 && by.shellAsOnThePanelsFrame === 1 ? "not judged" : "elsewhere";
    return { landed, by };
  };
  /** Records where a press at the panel's middle landed: a pass, a failure, or not judged (said, counted, not a pass). */
  const judgePress = (name, middle, pressed) => {
    if (pressed?.landed === "not judged") {
      notJudged.push({ name, saw: pressed.by });
      console.log(`NOT JUDGED ${name}: the press was handed to the shell's page as a press on the panel's own frame, and not carried into the panel's page, though the panel had stood still three seconds. The world did not hear it. ${JSON.stringify({ at: [middle.x, middle.y], ...pressed.by })}`);
    } else check(name, !!middle && pressed?.landed === "panel", { at: middle && [middle.x, middle.y], landed: pressed?.landed, ...(pressed?.by ?? {}) });
  };
  await page.goto(`${BASE}/shell/#to=${encodeURIComponent(`${WORLD}/`)}`);
  await until(() => world()?.evaluate(() => window.__nswpTest?.state?.ready === true), 90000);
  await until(() => hud.getByRole("button", { name: /^Menu/ }).isVisible(), 30000);
  await wait(2500);
  // The shell has the menu, and the world draws none: what this trial is about.
  const shellHasIt = (await hud.getByRole("button", { name: /^Menu/ }).isVisible()) && (await world().locator("nswp-hud").count()) === 0;
  return { ctx, page, faults, wait, until, world, panel, press, sheetOpen, goTab, chosen, hud, shellHasIt, worldHoldsPointer, panelIs, stands, heard, pressPanel, judgePress, panelStill };
};

// ---- the contrast: looking by the mouse left off (the casual way). Passes today.
{
  const name = "contrast: looking by the mouse off";
  const v = await visit();
  const w = v.hud;
  check(`(${name}) the shell draws the menu over the world, and the world draws none`, v.shellHasIt);
  await v.press(w.getByRole("button", { name: /^Menu/ }));
  check(`(${name}) the shell's switch says casual, and nobody holds the pointer`, (await v.goTab("Moving")) && (await w.getByRole("button", { name: /^Desk controls: casual/ }).isVisible()) && !(await v.worldHoldsPointer()));
  await v.goTab("You");
  await v.press(w.getByRole("button", { name: ROWS[0][1] }));
  check(`(${name}) the row brings the sign-in address's panel up over the world`, await v.until(async () => (await v.panelIs()) === "up", 15000), await v.panelIs());
  await v.wait(1500);
  check(`(${name}) with the panel up, the world does not hold the pointer`, !(await v.worldHoldsPointer()));
  const middle = await v.panelStill();
  const stood = await v.stands();
  v.judgePress(`(${name}) a press at the panel's middle lands in the panel, and not in the world`, middle, middle ? await v.pressPanel(middle) : null);
  await v.page.keyboard.down("w");
  await v.wait(1200);
  await v.page.keyboard.up("w");
  if (middle) await v.page.mouse.move(middle.x + 180, middle.y, { steps: 12 });
  await v.wait(400);
  const now = await v.stands();
  check(`(${name}) W held and the mouse moved, the visitor is where they were and faces as they did`, JSON.stringify(now) === JSON.stringify(stood), { before: stood, after: now });
  if (middle) await v.page.mouse.click(Math.max(20, middle.left - 60), middle.y);
  check(`(${name}) a press beside the panel puts it away`, await v.until(async () => ["none", "kept"].includes(await v.panelIs()), 6000), await v.panelIs());
  check(`(${name}) and the shell's sheet comes back up, on You, where the panel was asked for`, (await v.until(v.sheetOpen, 4000)) && (await v.chosen()) === "You", { sheetOpen: await v.sheetOpen(), tab: await v.chosen() });
  await v.ctx.close();
}

for (const [name, row] of ROWS) {
  const v = await visit();
  const w = v.hud;
  check(`(${name}) the shell draws the menu over the world, and the world draws none`, v.shellHasIt);
  // Looking with the mouse: the shell's switch, under Moving. The menu closed and one press on the view: the
  // pointer is the world's.
  await v.press(w.getByRole("button", { name: /^Menu/ }));
  await v.goTab("Moving");
  await v.press(w.getByRole("button", { name: /^Desk controls: casual/ }));
  await v.press(w.getByRole("button", { name: "Close", exact: true }));
  await v.wait(600);
  await v.page.mouse.click(720, 450);
  const looking = await v.until(v.worldHoldsPointer, 5000);
  check(`(${name}) with looking by the mouse on and the menu closed, the world holds the pointer`, looking);
  // The menu by its key (the pointer is the world's: there is nothing to press), and the row.
  await v.page.keyboard.press("m");
  check(`(${name}) the menu's key brings the shell's menu, and the pointer is let go`, (await v.until(v.sheetOpen, 5000)) && !(await v.worldHoldsPointer()));
  await v.goTab("You");
  await v.press(w.getByRole("button", { name: row }));
  const up = await v.until(async () => (await v.panelIs()) === "up", 15000);
  check(`(${name}) the row brings the sign-in address's panel up over the world`, up, await v.panelIs());
  await v.wait(1500);
  // No Escape is pressed, here or anywhere in this trial.
  check(`(${name}) with the panel up, the world does not hold the pointer`, !(await v.worldHoldsPointer()), { worldHoldsThePointer: await v.worldHoldsPointer() });
  const middle = await v.panelStill();
  const stood = await v.stands();
  v.judgePress(`(${name}) a press at the panel's middle lands in the panel, and not in the world`, middle, middle ? await v.pressPanel(middle) : null);
  await v.page.keyboard.down("w");
  await v.wait(1200);
  await v.page.keyboard.up("w");
  if (middle) await v.page.mouse.move(middle.x + 180, middle.y, { steps: 12 });
  await v.wait(400);
  const now = await v.stands();
  check(`(${name}) W held and the mouse moved, the visitor is where they were and faces as they did`, JSON.stringify(now) === JSON.stringify(stood), { before: stood, after: now });
  await v.page.screenshot({ path: join(SHOTS, `shell-menu-panel-pointer-${name.replace(/\s+/g, "-")}.png`) });
  // The panel is put away by a press beside it, on the page's own scrim.
  const beside = middle ? { x: Math.max(20, middle.left - 60), y: middle.y } : null;
  if (beside) await v.page.mouse.click(beside.x, beside.y);
  const away = await v.until(async () => ["none", "kept"].includes(await v.panelIs()), 6000);
  check(`(${name}) a press beside the panel puts it away`, away, await v.panelIs());
  check(`(${name}) and the shell's sheet comes back up, on You, where the panel was asked for`, (await v.until(v.sheetOpen, 4000)) && (await v.chosen()) === "You", { sheetOpen: await v.sheetOpen(), tab: await v.chosen() });
  // The sheet closed, one press on the view and the pointer is the world's.
  await v.wait(800);
  if (await v.sheetOpen()) await v.press(w.getByRole("button", { name: "Close", exact: true })).catch(() => {});
  await v.wait(600);
  await v.page.mouse.click(720, 450);
  check(`(${name}) the panel away and the sheet closed, one press on the view and the world holds the pointer again`, away && (await v.until(v.worldHoldsPointer, 5000)));
  check(`(${name}) no page error`, v.faults.length === 0, v.faults);
  await v.ctx.close();
}

const failed = checks.filter((c) => !c.ok);
writeFileSync(join(SHOTS, "shell-menu-panel-pointer.json"), JSON.stringify({ checks, notJudged }, null, 1));
console.log("\nnot tried: full screen (the scripted browser does not go full screen); a panel asked for with the menu closed; a world made with another engine");
const contrast = checks.filter((c) => c.name.startsWith("(contrast"));
console.log(`the contrast (passes today): ${contrast.filter((c) => c.ok).length} of ${contrast.length}`);
console.log(`${checks.length - failed.length} of ${checks.length} checks passed${notJudged.length ? `; ${notJudged.length} NOT JUDGED (where a press at the panel's middle lands: it was not carried into the panel's page), which are not passes` : ""}`);
await browser.close();
process.exit(failed.length ? 1 : 0);
