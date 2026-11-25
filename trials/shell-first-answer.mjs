// The shell says it has the menu from its first file (NSWP docs/plans/the-clients-menu.md: "a client that has the
// menu says so from its first script, before it loads anything else"), tried with the menu's own file held back.
//
//   BITPORTAL_SHELL_MENU=1 npm run build     the menu is off in an ordinary build: this is a trial's, never deployed
//   npm run trial -- trials/shell-first-answer.mjs (BASE, the shell's local address)
//   npm run build                            and back to an ordinary build afterwards
//
// The place is the room: a page of this site's own, which starts fast. The menu's file (`/shell/menu.js`) is held
// back on purpose, by this script standing between the page and its server: until this script lets it go, for
// longer than the shell will wait, and for ever. Everything is on this machine. Keys are the keyboard's own; pages
// are only read.
//
// The shell gives the menu's file up eight seconds after asking for it (MENU_FILE_MS in src/shell/main.ts), so a
// section that wants the file to come *before* that has only so long to do its work. Such a section holds the file
// until its work is done and lets it go then, not after a fixed time. Where the machine was too slow for that (the
// work wasn't done in time, or the place changed something of its own just as the file came), the section says so
// and is SKIPPED: counted, printed, and never a pass. A run with a skipped section ends "not a pass", exit 2.
// Exit 0 is every check passed and nothing skipped; exit 1 is a check failed.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const NSWP = process.env.NSWP ?? `${process.env.HOME}/Documents/GitHub/Nostr-Spatial-Web-Protocol--NSWP-`;
const pw = await import(`${NSWP}/node_modules/playwright-core/index.mjs`);
const BASE = process.env.BASE ?? "https://192.168.68.84:4800";
const SHOTS = process.env.SHOTS ?? ".shots";
mkdirSync(SHOTS, { recursive: true });
const checks = [];
/** Sections that could not be tried on this run, and why. Never a pass. */
const skipped = [];
const skip = (section, why, more) => { skipped.push({ section, why, ...(more === undefined ? {} : { more }) }); console.log(`SKIP ${section}: ${why}${more === undefined ? "" : ` ${JSON.stringify(more)}`}`); };
/** How long after asking for the menu's file the shell tells a place it hasn't the menu (src/shell/main.ts). */
const GIVES_UP_MS = 8000;
/** The latest a held file is let go, so the menu has time to start before the shell gives it up. */
const LET_GO_BY_MS = 5500;
const check = (name, ok, more) => { checks.push({ name, ok: !!ok, ...(more === undefined ? {} : { more }) }); console.log(`${ok ? "ok  " : "FAIL"} ${name}${more === undefined ? "" : ` ${JSON.stringify(more)}`}`); };
const browser = await pw.chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

const GROVE = process.env.WORLD ?? "https://192.168.68.84:4802";
/**
 * A visit in the shell, with the menu's file held back for `hold` ms (Infinity: it never comes; "told": until
 * `letGo()` is called). The place is the room unless `to` names another (a world, by its local address).
 */
const visit = async (hold, to = "/walk/") => {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await ctx.addInitScript(() => {
    const clock = () => performance.timeOrigin + performance.now();
    if (location.pathname.startsWith("/shell/")) {
      window.__heard = [];
      window.__up = [];
      addEventListener("message", (e) => {
        if (e.data?.nswp === "here" && e.data.menu) window.__heard.push(clock());
        // Each word the place says up, when, and (for its description) the description itself, to tell a new one
        // from the same one said again.
        if (e.data?.nswp === "menu") window.__up.push({ at: clock(), names: Object.keys(e.data).filter((k) => k !== "nswp"), ...(e.data.world ? { world: JSON.stringify(e.data.world) } : {}) });
      }, true);
    } else if (parent !== window) {
      window.__told = [];
      addEventListener("message", (e) => { if (e.source === parent && e.data?.nswp === "menu") window.__told.push({ at: clock(), word: e.data }); }, true);
      // Each time the place puts a menu of its own on its page, and when.
      window.__ownMenus = [];
      new MutationObserver((changes) => { for (const c of changes) for (const n of c.addedNodes) if (n.nodeName === "NSWP-HUD") window.__ownMenus.push(clock()); }).observe(document, { childList: true, subtree: true });
    }
  });
  let fileAt = null;
  let askedAt = null;
  let letGo = () => {};
  const told = new Promise((done) => { letGo = done; });
  await ctx.route("**/shell/menu.js", async (route) => {
    askedAt = Date.now();
    if (hold === Infinity) return route.abort();
    await (hold === "told" ? told : new Promise((done) => setTimeout(done, hold)));
    fileAt = Date.now();
    return route.continue();
  });
  const page = await ctx.newPage();
  const faults = [];
  page.on("pageerror", (e) => faults.push(String(e).slice(0, 200)));
  const wait = (ms) => page.waitForTimeout(ms);
  const until = async (so, ms = 20000) => { for (const end = Date.now() + ms; Date.now() < end; ) { if (await Promise.resolve().then(so).catch(() => false)) return true; await wait(100); } return false; };
  const room = () => page.frames().find((f) => f !== page.mainFrame() && (to.startsWith("/") ? f.url().includes(to) : f.url().startsWith(to)));
  const toldPlace = () => room().evaluate(() => window.__told);
  await page.goto(`${BASE}/shell/#to=${encodeURIComponent(to.startsWith("/") ? to : `${to}/`)}`);
  await until(async () => !!room() && (await toldPlace()).some((t) => "has" in t.word), 30000);
  return {
    ctx, page, faults, wait, until, room, told: toldPlace, hud: page.locator(".shell-menu"), fileAt: () => fileAt, shell: (read, arg) => page.evaluate(read, arg),
    /** Lets a file held "told" go, and says how long after it was asked for that was. */
    letGo: () => { letGo(); return Date.now() - askedAt; },
    /** How long ago the shell asked for the menu's file. */
    heldMs: () => (askedAt === null ? 0 : Date.now() - askedAt),
  };
};
const answerMs = async (v) => { const heard = await v.shell(() => window.__heard[0]); const first = (await v.told()).find((t) => "has" in t.word); return Math.round((first.at - heard) * 10) / 10; };

// ---- the menu's file late: the room is answered at once, and nothing it says meanwhile is lost
// The file is held until this section has done its work in the gap (the room has described itself, the visitor has
// pressed a key), and let go then.
{
  const section = "the menu's file late";
  const v = await visit("told");
  const first = (await v.told()).find((t) => "has" in t.word);
  const ms = await answerMs(v);
  check("with the menu's file held back, the room is told at once that this page has the menu", first.word.has === true && ms < 100, { ms });
  check("that first answer carries the visitor's settings and the version of the words", first.word.v === 1 && typeof first.word.settings === "object" && first.word.settings !== null, Object.keys(first.word.settings ?? {}));
  check("and says nothing of files from anywhere or of what is in hand", !("filesAnywhere" in first.word.settings) && !("holding" in first.word.settings));
  check("the menu isn't drawn yet: its file hasn't come", (await v.shell(() => !window.__bitportalShell)) === true);
  // The next two are true only while the shell still expects the file. They are looked at now and counted below,
  // once it is known the work was done in time: after the shell has given the file up the room rightly draws its
  // own menu and takes the visitor's key itself, and that is the last section's story.
  const inTheGap = [];
  inTheGap.push(["the room draws no menu of its own meanwhile: it was told the page above has it", (await v.until(() => v.room().evaluate(() => window.__bitportalTest?.menuAbove?.() === true), 10000)) && (await v.room().locator("nswp-hud").count()) === 0]);
  // In the gap the room describes itself, and the visitor presses the summons key, which the room forwards.
  await v.until(async () => (await v.shell(() => window.__up.filter((w) => w.names.includes("world")).length)) > 0, 10000);
  const before = await v.shell(() => window.__up.map((w) => w.names.join("+")));
  await v.page.keyboard.press("Backquote");
  await v.wait(300);
  // Looked at together, at once: what was said up, and that there was still no menu to hear it.
  const gap = await v.shell(() => ({ said: window.__up.map((w) => w.names.join("+")), noMenuYet: !window.__bitportalShell }));
  const inGap = gap.said;
  inTheGap.push(["in the gap the room says its description and forwards the visitor's key, with no menu yet to hear them", inGap.some((w) => w === "world") && inGap.includes("key") && gap.noMenuYet, { before: before.length, inGap: inGap.filter((w) => w !== "world").slice(0, 6), descriptions: inGap.filter((w) => w === "world").length }]);
  const heldMs = v.letGo();
  if (heldMs <= LET_GO_BY_MS + 1000) for (const [name, ok, more] of inTheGap) check(name, ok, more);
  if (heldMs > LET_GO_BY_MS + 1000) {
    // The gap's work took so long that the shell is about to give the file up, or has: what follows would be the
    // late file's story (the last section), not this one's.
    skip(section, "the machine was too slow: the work in the gap was not done in time for the file to come before the shell gives it up", { workDoneAfterMs: heldMs, shellGivesUpAtMs: GIVES_UP_MS, lookedAtButNotCounted: inTheGap.map(([name, ok]) => `${ok ? "ok" : "not ok"}: ${name.slice(0, 40)}`) });
  } else {
    await v.until(() => v.shell(() => !!window.__bitportalShell), 15000);
    await v.wait(600);
    const saidAfterStart = await v.shell(() => window.__bitportalShell?.below.world?.sections.length ?? 0);
    check("when the menu's file comes, the room's description is there already: what it said in the gap was kept and said again", saidAfterStart > 5, { tabs: saidAfterStart, fileHeldMs: heldMs });
    check("and the key pressed in the gap has opened the sheet", await v.until(() => v.hud.getByRole("button", { name: "Close", exact: true }).isVisible(), 6000));
    const has = (await v.told()).filter((t) => "has" in t.word);
    check("the menu's own file says `has: true` once more as it starts, with the same settings as the first answer", has.length === 2 && has.every((t) => t.word.has === true) && JSON.stringify(has[0].word.settings) === JSON.stringify(has[1].word.settings), { answers: has.map((t) => t.word.has), same: JSON.stringify(has[0].word.settings) === JSON.stringify(has[1]?.word.settings) });
  }
  check("no page error", v.faults.length === 0, v.faults);
  await v.page.screenshot({ path: join(SHOTS, "shell-first-answer.png") });
  await v.ctx.close();
}

// ---- told "has" twice with the same settings, a place does nothing the second time
// The room says its description again whenever something of its own changes, whoever is listening: a few seconds
// after it starts, when the sign-in address has answered, a note of its own (in You) changes. So the second answer
// has to come once the room has settled, or what the room does of itself can't be told from what it does for the
// answer. The file is held until the room's description has stood unchanged for a while, and let go then; at the
// latest in time for the menu to start before the shell gives the file up.
//
// What follows the second answer is then judged by what it is, not by when it came:
//   - the same description said again: the room re-described itself for the answer. The fault. FAIL.
//   - a different description: something of the room's own changed just then. On this run the section can't say
//     what the answer did. SKIPPED.
//   - nothing: the room did nothing the second time. Passed.
{
  const section = "told twice, a place does nothing the second time";
  const STOOD_MS = 1500;
  const SETTLES_AFTER_MS = 4000;
  const v = await visit("told");
  const described = () => v.shell(() => window.__up.filter((w) => w.world).map((w) => ({ at: w.at, world: w.world })));
  // Settled: the room has described itself, and its description has stood for a while. Not before the time its own
  // late change is known to come on a free machine.
  let settled = false;
  while (v.heldMs() < LET_GO_BY_MS && !settled) {
    const said = await described();
    const stoodMs = said.length ? Date.now() - said.at(-1).at : 0;
    settled = v.heldMs() >= SETTLES_AFTER_MS && stoodMs >= STOOD_MS;
    if (!settled) await v.wait(100);
  }
  const heldMs = v.letGo();
  const answers = async () => (await v.told()).filter((t) => "has" in t.word);
  const twice = await v.until(async () => (await answers()).length >= 2, 20000);
  const has = await answers();
  await v.wait(2500);
  const said = await described();
  const startedMs = has[1] ? Math.round(has[1].at - v.fileAt()) : null;
  const facts = { fileHeldMs: heldMs, settledFirst: settled, menuAnsweredMsAfterFile: startedMs, answers: has.map((t) => t.word.has) };
  if (heldMs > LET_GO_BY_MS + 1000) {
    // The room itself took so long to come up that the file could not be let go in time: the shell has given it up,
    // or is about to. That is the late file's story (the last section), not this one's.
    skip(section, "the machine was too slow: the room was not up in time for the file to come before the shell gives it up", { ...facts, shellGivesUpAtMs: GIVES_UP_MS });
  } else if (!twice) {
    check("the menu's own answer comes once its file has", false, facts);
  } else if (has[1].word.has !== true) {
    // The shell gave the file up before the menu had started. The file was let go in time (by LET_GO_BY_MS), so this
    // is the menu taking over two seconds to start: said as a failure, with the time it took.
    check("the menu starts, once its file has come, before the shell gives the file up", false, facts);
  } else {
    const before = said.filter((w) => w.at < has[1].at);
    const after = said.filter((w) => w.at >= has[1].at);
    const last = before.at(-1)?.world;
    const again = after.filter((w, n) => w.world === (n === 0 ? last : after[n - 1].world)).length;
    const changed = after.length - again;
    check("the two answers carry the same settings", JSON.stringify(has[0].word.settings) === JSON.stringify(has[1].word.settings), { ...facts, gapMs: Math.round(has[1].at - has[0].at) });
    if (again > 0) check("after the second, the room describes itself no more than it had: no description is said again for it", false, { saidAgain: again, changedOfItsOwn: changed, before: before.length });
    else if (changed > 0) skip(section, "the machine was too slow, or the room late: the room changed its own description just after the second answer, so this run can't say the answer did nothing", { ...facts, changedOfItsOwn: changed, msAfterTheAnswer: after.map((w) => Math.round(w.at - has[1].at)) });
    else check("after the second, the room describes itself no more than it had: no description is said again for it", true, { before: before.length, after: 0 });
    const own = await v.room().evaluate(() => window.__ownMenus.length);
    check("and the room never put a menu of its own on its page: nothing to flicker", own === 0, { ownMenus: own });
    check("the shell's menu is the only one, with the room's tabs in it", (await v.shell(() => window.__bitportalShell?.below.world?.sections.length ?? 0)) > 5 && (await v.hud.getByRole("button", { name: /^Menu/ }).isVisible()));
  }
  await v.ctx.close();
}

// ---- if the two differ, the later (the menu's own) holds, and the place changes once
// The file is held until the setting has been changed, and let go then.
{
  const section = "the two answers differ";
  const v = await visit("told", GROVE);
  const first = (await v.told()).find((t) => "has" in t.word);
  // A setting changed between the two answers: stood in for by writing where the menu's own controls write it.
  // (With the menu's file not yet come there is no control to press.) How fast the view turns: 1 becomes 0.5.
  await v.shell(() => localStorage.setItem("nswp:desk", JSON.stringify({ look: 0.5 })));
  const heldMs = v.letGo();
  if (heldMs > LET_GO_BY_MS + 1000) {
    // The world took so long to come up that the shell is about to give the file up, or has.
    skip(section, "the machine was too slow: the world was not up in time for the file to come before the shell gives it up", { worldUpAfterMs: heldMs, shellGivesUpAtMs: GIVES_UP_MS });
  } else {
    await v.until(async () => (await v.told()).filter((t) => "has" in t.word).length === 2, 20000);
    await v.wait(2000);
    const told = await v.told();
    const has = told.filter((t) => "has" in t.word);
    const kept = await v.room().evaluate(() => JSON.parse(localStorage.getItem("nswp:desk") ?? "null"));
    check("the first answer said the setting as it was, and the menu's own says it as it now is", first.word.settings.look === 1 && has[1]?.word.settings?.look === 0.5, { first: first.word.settings.look, second: has[1]?.word.settings?.look, answers: has.map((t) => t.word.has), fileHeldMs: heldMs });
    check("the later one holds: the world keeps the new setting as the visitor's", kept?.look === 0.5, kept);
    check("and it is said once: no word of settings follows it", !!has[1] && told.filter((t) => t.at > has[1].at && "settings" in t.word && !("has" in t.word)).length === 0, has[1] ? told.filter((t) => t.at > has[1].at).map((t) => Object.keys(t.word).filter((k) => k !== "nswp").join("+")) : "no second answer");
    check("the world never put a menu of its own on its page", (await v.room().evaluate(() => window.__ownMenus.length)) === 0);
  }
  await v.ctx.close();
}

// ---- the menu's file never comes: the room is told so, and draws its own
{
  const v = await visit(Infinity);
  const has = async () => (await v.told()).filter((t) => "has" in t.word).map((t) => t.word.has);
  // The refusal can come before the room has said `here` (then it is told "hasn't" straight away) or after (then
  // "has", and "hasn't" as soon as the file is known not to have come). Either way the last word is "hasn't".
  await v.until(async () => (await has()).at(-1) === false, 15000);
  await v.wait(1500);
  check("with the menu's file refused, the room is told the page hasn't the menu, and nothing says otherwise after", ["[false]", "[true,false]"].includes(JSON.stringify(await has())), await has());
  check("and the room draws its own menu", await v.until(() => v.room().getByRole("button", { name: /^Menu/ }).isVisible(), 15000));
  check("and the shell draws none", (await v.shell(() => !window.__bitportalShell)) === true);
  await v.ctx.close();
}

// ---- the menu's file comes after the shell has stopped waiting: the room draws its own, then puts it away
{
  const v = await visit(10500);
  const has = async () => (await v.told()).filter((t) => "has" in t.word).map((t) => t.word.has);
  check("with the menu's file ten seconds late, the room is told at eight that the page hasn't the menu", await v.until(async () => JSON.stringify(await has()) === "[true,false]", 12000), await has());
  check("and draws its own menu meanwhile", await v.until(() => v.room().getByRole("button", { name: /^Menu/ }).isVisible(), 6000));
  // The visitor opens the room's own menu meanwhile, by a real press on it: what do they see when the shell's comes?
  const ownMenuKey = v.room().getByRole("button", { name: /^Menu/ });
  const b = await ownMenuKey.boundingBox();
  await v.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  const ownSheetOpen = await v.until(() => v.room().getByRole("button", { name: "Close", exact: true }).isVisible(), 4000);
  check("(the visitor has the room's own sheet open as the file comes)", ownSheetOpen);
  check("when the file comes after all, the menu says it has it", await v.until(async () => JSON.stringify(await has()) === "[true,false,true]", 15000), await has());
  check("the room puts its own menu away, and the shell's is the one on screen", (await v.until(async () => (await v.room().locator("nswp-hud").count()) === 0, 8000)) && (await v.until(() => v.hud.getByRole("button", { name: /^Menu/ }).isVisible(), 8000)));
  // Never both at once: looked at as soon as the room's own is gone.
  const both = await v.room().evaluate(() => document.querySelectorAll("nswp-hud").length);
  const shellSheet = await v.hud.getByRole("button", { name: "Close", exact: true }).isVisible().catch(() => false);
  check("nothing is shown twice: the room has no menu of its own left", both === 0);
  console.log(`note what a visitor with the room's own sheet open sees as the shell's menu comes: their sheet goes, and the shell's menu stands in its place with its sheet ${shellSheet ? "open" : "down"}`);
  await v.page.screenshot({ path: join(SHOTS, "shell-first-answer-takeover.png") });
  await v.ctx.close();
}

const failed = checks.filter((c) => !c.ok);
writeFileSync(join(SHOTS, "shell-first-answer.json"), JSON.stringify({ checks, skipped }, null, 1));
console.log(`\n${checks.length - failed.length} of ${checks.length} checks passed${skipped.length ? `; ${skipped.length} section${skipped.length === 1 ? "" : "s"} SKIPPED (${skipped.map((s) => s.section).join("; ")}): NOT A PASS` : ""}`);
await browser.close();
// 1: a check failed. 2: none failed, but a section could not be tried, so the run is not a pass. 0: all of it passed.
process.exit(failed.length ? 1 : skipped.length ? 2 : 0);
