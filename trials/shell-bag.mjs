// The Bag in the shell's menu, tried with real presses (NSWP docs/plans/the-clients-menu.md, section 18, C).
//
//   BITPORTAL_SHELL_MENU=1 npm run build     the menu is off in an ordinary build: this is a trial's, never deployed
//   node trials/shell-bag.mjs                (BASE, the shell's local address; WORLD, a local world on kit 0.86 or later)
//   npm run build                            and back to an ordinary build afterwards
//
// Everything is on this machine, and nothing reaches the network. The visitor is someone made up here: a key made
// by this script and gone with it, never typed anywhere, and no password at all.
//
// - To BitPortal they are signed in: this browser's own note of who is (`bitportal:signed-in`) names their key.
//   Nothing signs for them in the shell's page, which makes no signer.
// - Their bag is a note their key signed, naming one real item: the dart blaster, by its own signed description
//   from the kit's repository. This script is the only relay: it answers for the bag and the item and nothing else.
//   The item's files are served from the world's own build, standing in for its file host.
// - In the world they have the same one thing, by the kit's own switch for a made-up bag (`__nswpTrial.has`, which
//   a world takes only on this machine), as the kit's own trial of the Bag does.
//
// ONE FACT IS SAID BY THIS TRIAL AND NOT BY THE WORLD: that the visitor is named there. A world says so only when
// something signs for them in it, which here would mean signing in at the sign-in address, and no password is
// typed in a trial. So the world's own page says it, four times a second, in the menu's words, with what is really
// in hand read from the world itself. Everything else is real: the shell's Bag, its relay questions, the item's
// signature and limits, the asking before a script runs, the word to the world, and the world taking the thing up.
// Signing in for real, and the Bag then, is on the owner's by-hand list.
//
// The Bag's things are drawn as themselves by a page the shell frames unseen (`/shell/pictures/`), which has the
// renderer the shell's own page never loads. Tried here: that neither that page nor any file of its is asked for
// until the Bag tab is open with something to show; that the picture then takes the place of the thing's letter;
// that the letter stays where the frame is refused (this script refuses it, for one visit) and where the model
// isn't what its description promised (this script serves other bytes for it, for one visit); and that the frame
// is gone once the sheet is closed.
//
// Every press is the mouse at a place on the screen. Pages are only read from.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
const NSWP = process.env.NSWP ?? `${process.env.HOME}/Documents/GitHub/Nostr-Spatial-Web-Protocol--NSWP-`;
const pw = await import(`${NSWP}/node_modules/playwright-core/index.mjs`);
const core = await import(`${NSWP}/packages/core/dist/index.js`);
const BASE = process.env.BASE ?? "https://192.168.68.84:4800";
const WORLD = process.env.WORLD ?? "https://192.168.68.84:4802";
const SHOTS = process.env.SHOTS ?? ".shots";
mkdirSync(SHOTS, { recursive: true });
const checks = [];
const check = (name, ok, more) => { checks.push({ name, ok: !!ok, ...(more === undefined ? {} : { more }) }); console.log(`${ok ? "ok  " : "FAIL"} ${name}${more === undefined ? "" : ` ${JSON.stringify(more)}`}`); };
const hex = (b) => [...b].map((x) => x.toString(16).padStart(2, "0")).join("");

// The made-up visitor, their pass for the world, and their bag.
const key = crypto.getRandomValues(new Uint8Array(32));
const me = core.getPublicKey(key);
const T = Math.floor(Date.now() / 1000);
const BLASTER = JSON.parse(readFileSync(join(NSWP, "sites", "items", "dart-blaster.event.json"), "utf8"));
const COORD = `${BLASTER.kind}:${BLASTER.pubkey}:${BLASTER.tags.find((t) => t[0] === "d")[1]}`;
const bag = core.finalizeEvent({ kind: core.BAG_KIND, created_at: T, tags: [["d", "bag"], ["a", COORD]], content: "" }, key);
const TYPES = { ".glb": "model/gltf-binary", ".js": "text/javascript", ".json": "application/json", ".ogg": "audio/ogg", ".webp": "image/webp", ".png": "image/png" };
const browser = await pw.chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const asked = [];
/** Each request a visit makes: its address, the address of the frame that made it, and when. */
const visit = async ({ signedIn, named, has = true, refuseFrame = false, wrongModel = false }) => {
  const reqs = [];
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  await ctx.addInitScript(
    ([base, record, world, has, named]) => {
      window.__refused = [];
      addEventListener("securitypolicyviolation", (e) => window.__refused.push(`${e.violatedDirective} ${e.blockedURI}`.slice(0, 140)));
      window.__told = [];
      addEventListener("message", (e) => e.source === parent && e.data && e.data.nswp === "menu" && window.__told.push(e.data));
      // This browser's own note of who is signed in to BitPortal: on BitPortal's own address, and nowhere else.
      if (location.origin === base && record) localStorage.setItem("bitportal:signed-in", record);
      if (location.origin !== world) return;
      // In the world: the kit's own switch for a made-up bag, on this machine only.
      if (has) window.__nswpTrial = { has: [has] };
      // And the one fact this trial says for the world (see the top of this file), with what is really in hand.
      if (named) setInterval(() => {
        const state = window.__nswpTest?.state;
        if (!state?.ready) return;
        parent.postMessage({ nswp: "menu", world: { title: document.title || "The Grove", level: "full", keys: true, state: { named: true, signIn: "none", items: "allowed", holding: typeof state.holding === "string" ? state.holding : "", headset: { supported: false, presenting: false } }, target: [], loading: null, sections: [] } }, "*");
      }, 250);
    },
    [BASE, signedIn ? JSON.stringify({ pubkey: me, name: "Ada" }) : "", WORLD, has ? COORD : "", named],
  );
  // The one relay there is: this script. It answers for the visitor's bag and the item's description, and says
  // "that is all" to everything else. Nothing a page publishes goes anywhere.
  await ctx.routeWebSocket(/^wss?:\/\//, (ws) =>
    ws.onMessage((raw) => {
      let m;
      try { m = JSON.parse(String(raw)); } catch { return; }
      if (m[0] === "EVENT") return ws.send(JSON.stringify(["OK", m[1].id, true, ""]));
      if (m[0] !== "REQ") return;
      for (const f of m.slice(2)) {
        if (f.kinds?.includes(core.BAG_KIND) && f.authors?.includes(me)) { asked.push("bag"); ws.send(JSON.stringify(["EVENT", m[1], bag])); }
        if (f.kinds?.includes(BLASTER.kind) && f.authors?.includes(BLASTER.pubkey)) { asked.push("item"); ws.send(JSON.stringify(["EVENT", m[1], BLASTER])); }
      }
      ws.send(JSON.stringify(["EOSE", m[1]]));
    }),
  );
  // The item's files, from the world's own build, standing in for the file host its description names.
  await ctx.route("https://grove.bitblocks.network/items/**", (route) => {
    const on = normalize(join(NSWP, "sites", "grove", "dist", new URL(route.request().url()).pathname));
    // For one visit: the model's file is not the one its description promised (its last byte is another).
    if (wrongModel && extname(on) === ".glb" && existsSync(on)) { const bytes = Buffer.from(readFileSync(on)); bytes[bytes.length - 1] ^= 1; return route.fulfill({ status: 200, contentType: TYPES[".glb"], headers: { "access-control-allow-origin": "*" }, body: bytes }); }
    return existsSync(on) ? route.fulfill({ status: 200, contentType: TYPES[extname(on)] ?? "application/octet-stream", headers: { "access-control-allow-origin": "*" }, body: readFileSync(on) }) : route.fulfill({ status: 404, headers: { "access-control-allow-origin": "*" }, body: "" });
  });
  // For one visit: the page that draws the Bag's things is refused, as a blocker or a broken line would.
  if (refuseFrame) await ctx.route(`${BASE}/shell/pictures/**`, (route) => route.abort());
  ctx.on("request", (r) => { let from = ""; try { from = r.frame().url(); } catch {} reqs.push({ url: r.url(), from, at: Date.now() }); });
  const page = await ctx.newPage();
  const faults = [];
  page.on("pageerror", (e) => faults.push(String(e).slice(0, 200)));
  page.on("console", (m) => /Content Security Policy|Refused to/i.test(m.text()) && faults.push(m.text().slice(0, 200)));
  const wait = (ms) => page.waitForTimeout(ms);
  const until = async (so, ms = 20000) => { for (const end = Date.now() + ms; Date.now() < end; ) { if (await Promise.resolve().then(so).catch(() => false)) return true; await wait(150); } return false; };
  const hud = page.locator(".shell-menu");
  const world = () => page.frames().find((f) => f.url().startsWith(WORLD));
  // Where a thing is, is asked until it has a place: the menu draws itself again whenever the world speaks.
  const press = async (locator) => {
    await locator.first().waitFor({ state: "visible", timeout: 40000 });
    await wait(400);
    // Where it is, and what is on top there, are read together, in one look at the page: read apart, the menu can
    // draw itself again in between, and the thing measured is then not the thing looked for. Only where the middle
    // of its box is on the thing itself is it pressed: a tab scrolled half out of sight has a box whose middle is
    // on the page outside the sheet, and a press there closes the sheet (BitPortal PR 213 has the account).
    const look = () => locator.first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      const [x, y] = [r.x + r.width / 2, r.y + r.height / 2];
      let at = document.elementFromPoint(x, y);
      while (at?.shadowRoot) { const inner = at.shadowRoot.elementFromPoint(x, y); if (!inner || inner === at) break; at = inner; }
      const say = (n) => `${n.tagName.toLowerCase()}${n.getAttribute("role") ? `[role=${n.getAttribute("role")}]` : ""} "${(n.textContent ?? "").trim().slice(0, 30)}"`;
      const placed = el.isConnected && r.width > 0 && r.height > 0;
      const on = !!at && (at === el || el.contains(at) || at.contains(el) || el.getRootNode().host === at);
      return { x, y, placed, on, what: at ? say(at) : "nothing", meant: `${say(el)}, ${el.isConnected ? "in the page" : "no longer in the page"}, ${Math.round(r.width)} by ${Math.round(r.height)}` };
    });
    let seen = null;
    for (let n = 0; n < 30; n++) {
      seen = await look().catch(() => null);
      if (seen?.placed) break;
      // Not there, or just taken out of the page as the menu drew itself again: looked for afresh.
      if (seen) console.log(`note ${locator} was ${seen.meant} when looked at; looked for again`);
      await wait(200);
    }
    if (!seen?.placed) throw new Error(`no place on screen for ${locator}`);
    if (!seen.on) throw new Error(`the middle of ${locator}, at ${Math.round(seen.x)},${Math.round(seen.y)}, is not on it: what is there is ${seen.what}, and the thing meant is ${seen.meant}. Nothing was pressed.`);
    const b = { x: seen.x, y: seen.y, width: 0, height: 0 };
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await wait(400);
  };
  /** Press something until what should follow is so, waiting a good while each time: a busy world is slow to answer. */
  const pressUntil = async (locator, so, tries = 3) => { for (let n = 0; n < tries; n++) { if (await until(so, 500)) return true; await press(locator).catch(() => {}); if (await until(so, 25000)) return true; } return false; };
  const sheetOpen = () => hud.getByRole("button", { name: "Close", exact: true }).isVisible().catch(() => false);
  const openSheet = async () => { for (let n = 0; n < 3 && !(await sheetOpen()); n++) { await press(hud.getByRole("button", { name: /^Menu/ })); await until(sheetOpen, 12000); } };
  const chosenTab = () => hud.locator('[role="tab"][aria-selected="true"]:visible').first().innerText({ timeout: 1500 }).then((t) => t.trim()).catch(() => "");
  const tabs = async () => (await hud.locator('[role="tab"]').allInnerTexts()).map((t) => t.trim()).filter(Boolean);
  const chosen = () => hud.locator('[role="tab"][aria-selected="true"]:visible').first().innerText({ timeout: 1500 }).then((t) => t.trim()).catch(() => "");
  const goTab = async (name) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await openSheet();
      if ((await chosen()) === name) return true;
      await press(hud.locator('[role="tab"][aria-selected="true"]:visible'));
      for (let n = 0; n < 24 && (await chosen()) !== name; n++) { const was = await chosen(); await page.keyboard.press("ArrowRight"); for (let i = 0; i < 60 && (await chosen()) === was; i++) await wait(100); }
      if ((await chosen()) === name) return true;
    }
    return false;
  };
  const shell = (read) => page.evaluate(read);
  const go = async (to) => {
    await page.goto(`${BASE}/shell/#to=${encodeURIComponent(to)}`);
    await until(() => hud.getByRole("button", { name: /^Menu/ }).isVisible(), 60000);
    await until(() => shell(() => (window.__bitportalShell.below.world?.sections.length ?? 0) > 3), 40000);
    await wait(1500);
  };
  // The page that draws the Bag's things: what was asked of it and by it, and whether the shell has it framed.
  const ofPictures = () => reqs.filter((r) => r.url.startsWith(`${BASE}/shell/pictures/`) || r.from.startsWith(`${BASE}/shell/pictures/`));
  const framed = () => shell(() => ({ frames: [...document.querySelectorAll("iframe")].filter((f) => (f.getAttribute("src") ?? "").startsWith("/shell/pictures/")).length, says: window.__bitportalShell.pictures.framed }));
  /** What stands for a thing on its tile: "picture" (a canvas), or the letters shown in its place. */
  const shownAs = (tile) => tile.locator(".shown").first().evaluate((el) => (el.querySelector("canvas") ? "picture" : `letters "${el.textContent.trim()}"`)).catch(() => "no tile");
  return { ctx, page, faults, wait, until, hud, world, press, pressUntil, openSheet, sheetOpen, tabs, goTab, shell, go, reqs, ofPictures, framed, shownAs, chosen: chosenTab };
};

// ---- named in the world, and signed in to BitPortal: their bag is in the shell's menu
{
  const v = await visit({ signedIn: true, named: true });
  await v.go(`${WORLD}/`);
  check("(said by this trial, in the world's page) the visitor is named there", await v.until(() => v.shell(() => window.__bitportalShell.below.world?.state.named === true), 40000));
  check("the world's own page draws no menu, and so no Bag", (await v.world().locator("nswp-hud").count()) === 0 || !(await v.world().getByRole("button", { name: /^Menu/ }).isVisible().catch(() => false)));
  check("before the menu is opened, the page that draws the Bag's things has not been asked for, nor anything by it", v.ofPictures().length === 0 && (await v.framed()).frames === 0, { asked: v.ofPictures().length, ...(await v.framed()) });
  await v.openSheet();
  check("the menu has a Bag tab", await v.until(async () => (await v.tabs()).includes("Bag")), await v.tabs());
  // The sheet is open, on another tab: still nothing.
  await v.wait(2000);
  check("with the sheet open on another tab, still not", (await v.chosen()) !== "Bag" && v.ofPictures().length === 0 && (await v.framed()).frames === 0, { tab: await v.chosen(), asked: v.ofPictures().length });
  const atBag = Date.now();
  check("and going to it by the keys finds it", await v.goTab("Bag"));
  const tile = v.hud.getByRole("button", { name: /blaster/i }).first();
  check("their own thing is in it, by its own name from its signed description", await v.until(() => tile.isVisible(), 40000), (await v.hud.locator("button:visible").allInnerTexts()).map((t) => t.replace(/\s+/g, " ").trim()).filter((t) => /blaster|bag|item/i.test(t)));
  // Drawn as itself: the picture takes the place of its letter.
  const pictured = await v.until(async () => (await v.shownAs(tile)) === "picture", 40000);
  const firstAsk = v.ofPictures()[0];
  check("with the Bag open and a thing in it, the page that draws it is framed, unseen, and the thing's picture takes the place of its letter", pictured && (await v.framed()).frames === 1, { shownAs: await v.shownAs(tile), ...(await v.framed()), msFromGoingToTheTabToThePicture: Date.now() - atBag, filesAskedByIt: v.ofPictures().length });
  check("that page was asked for only once the Bag tab was open", !!firstAsk && firstAsk.at >= atBag && firstAsk.url === `${BASE}/shell/pictures/`, firstAsk && { first: firstAsk.url.replace(BASE, ""), msAfterTheTab: firstAsk.at - atBag });
  // It is a picture of something: not one flat colour. Looked at on the screen, as a visitor sees it.
  // The menu draws its tiles afresh whenever the world speaks (this trial's world page speaks four times a second),
  // so the canvas measured may be gone a moment later: looked for again until one stands still to be looked at, and
  // said apart from a picture of nothing if none does.
  let box = null;
  let tries = 0;
  for (; tries < 20 && !box; tries++) {
    box = await tile.locator("canvas").first().evaluate((c) => { const r = c.getBoundingClientRect(); return c.isConnected && r.width > 0 ? { x: r.x, y: r.y, width: r.width, height: r.height } : null; }).catch(() => null);
    if (!box) await v.wait(150);
  }
  const seen = box ? await v.page.screenshot({ clip: box }) : null;
  // Counted on a blank page of the script's own: the shell's page is not asked to read a picture.
  const blank = await v.ctx.newPage();
  const colours = seen ? await blank.evaluate(async (b64) => { const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob()); const c = new OffscreenCanvas(img.width, img.height); const g = c.getContext("2d"); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, img.width, img.height).data; const set = new Set(); for (let i = 0; i < d.length; i += 4 * 7) set.add(`${d[i] >> 4},${d[i + 1] >> 4},${d[i + 2] >> 4}`); return set.size; }, seen.toString("base64")) : 0;
  await blank.close();
  check("and the picture is of something: many colours, on the screen", colours > 12, box ? { colours, ...(tries > 1 ? { lookedFor: tries } : {}) } : { colours: "not looked at: no canvas stood still to be looked at", lookedFor: tries });
  // Where its model comes from learns an address fetched a file, and from no stated page.
  const model = v.reqs.find((r) => r.url.endsWith(".glb") && r.from.startsWith(`${BASE}/shell/pictures/`));
  check("the thing's model was fetched by that page, not by the shell's own", !!model && !v.reqs.some((r) => r.url.endsWith(".glb") && r.from.startsWith(`${BASE}/shell/`) && !r.from.startsWith(`${BASE}/shell/pictures/`)), model && { from: model.from.replace(BASE, ""), url: model.url.slice(0, 60) });
  check("the bag and the item were asked of the relay there is", asked.includes("bag") && asked.includes("item"), [...new Set(asked)]);
  await v.page.screenshot({ path: join(SHOTS, "shell-bag.png") });
  const holding = () => v.shell(() => window.__bitportalShell.below.world?.state.holding ?? "");
  check("nothing is in hand to begin with, by the world's word", (await holding()) === "");
  // Chosen, then Hold: a thing that does things of its own is asked about first, here, and nothing is held.
  const hold = v.hud.getByRole("button", { name: /^Hold/ }).first();
  await v.pressUntil(tile, () => hold.isVisible());
  const letIt = v.hud.getByRole("button", { name: /^Let it run, and hold/ }).first();
  const askedFirst = await v.pressUntil(hold, () => letIt.isVisible());
  check("a thing with logic of its own is asked about first, in this page's Bag, and nothing is held yet", askedFirst && (await holding()) === "", (await v.hud.locator("button:visible").allInnerTexts()).map((t) => t.replace(/\s+/g, " ").trim()).filter((t) => /hold|run|blaster/i.test(t)));
  await v.page.screenshot({ path: join(SHOTS, "shell-bag-asked.png") });
  const scriptsBefore = (await v.world().evaluate(() => window.__told.filter((w) => w.settings?.holding).map((w) => w.settings.holding))).length;
  check("and the world was told of no hold yet", scriptsBefore === 0);
  // The second press is their yes: the world is told the item and the very script they let run, and says it is in hand.
  await v.pressUntil(letIt, async () => (await holding()) === COORD);
  check("taken up in this page's Bag, the world says it is in hand", await v.until(async () => (await holding()) === COORD, 30000), await holding());
  const toldHold = await v.world().evaluate(() => window.__told.filter((w) => w.settings?.holding).map((w) => w.settings.holding).pop());
  check("the world was told which thing, and the mark of the script they let run", toldHold?.item === COORD && /^[0-9a-f]{64}$/.test(toldHold?.script ?? ""), toldHold && { item: toldHold.item === COORD, script: typeof toldHold.script === "string" ? `${toldHold.script.length} letters` : toldHold.script });
  const worldsBag = () => v.world().evaluate(() => window.__nswpTest.controls.view().sections.find((s) => s.id === "bag")?.items.map((i) => i.label) ?? []);
  check("and it is in hand in the world itself", await v.until(async () => (await worldsBag()).some((l) => /^Put .* away/i.test(l)), 15000), await worldsBag());
  await v.page.screenshot({ path: join(SHOTS, "shell-bag-held.png") });
  // Put away again.
  const away = v.hud.getByRole("button", { name: /Put .*away|Put it away/i }).first();
  if (await v.until(() => away.isVisible(), 10000)) {
    await v.pressUntil(away, async () => (await holding()) === "");
    check("put away in this page's Bag, it is out of hand in the world", (await holding()) === "");
  } else check("the Bag offers to put it away", false);
  // It can't be changed here.
  const rows = (await v.hud.locator("button:visible").allInnerTexts()).map((t) => t.replace(/\s+/g, " ").trim());
  check("nothing here offers to put a thing in or take one out: that is done at home", !rows.some((r) => /Put in|Take .* out|item I copied|Remove/i.test(r)), rows.filter((r) => /Put|Take|copied|Remove/i.test(r)));
  const told = await v.world().evaluate(() => window.__told);
  check("nothing of the bag was said down but the hold", !JSON.stringify(told).includes(me) && told.every((w) => !("bag" in w)));
  // The shell's own page asked for no file with the renderer in it, the whole visit: only the framed page did.
  const ownFiles = [...new Set(v.reqs.filter((r) => r.from.startsWith(`${BASE}/shell/`) && !r.from.startsWith(`${BASE}/shell/pictures/`) && /\.js$/.test(r.url) && r.url.startsWith(BASE)).map((r) => r.url))];
  const framesFiles = [...new Set(v.reqs.filter((r) => r.from.startsWith(`${BASE}/shell/pictures/`) && /\.js$/.test(r.url)).map((r) => r.url))];
  const carries = async (urls) => { const with3 = []; for (const u of urls) if (/WebGLRenderer/.test(await (await v.ctx.request.get(u)).text())) with3.push(u.replace(BASE, "")); return with3; };
  check("the shell's own page loaded no file that carries the renderer; the page it frames did", (await carries(ownFiles)).length === 0 && (await carries(framesFiles)).length > 0, { shellsFiles: ownFiles.length, withTheRenderer: await carries(ownFiles), framesFiles: framesFiles.length, framesWithTheRenderer: (await carries(framesFiles)).length });
  // The sheet is closed: the frame goes. The picture is kept by the shell, so opening the Bag again makes none.
  await v.press(v.hud.getByRole("button", { name: "Close", exact: true }));
  check("with the sheet closed, the page that drew the things is gone", (await v.until(async () => (await v.framed()).frames === 0, 5000)) && (await v.framed()).says === false, await v.framed());
  const askedBefore = v.ofPictures().length;
  await v.goTab("Bag");
  const again = await v.until(async () => (await v.shownAs(v.hud.getByRole("button", { name: /blaster/i }).first())) === "picture", 8000);
  await v.wait(1500);
  check("opened again, the picture is there at once from what the shell kept, and no page is framed for it", again && v.ofPictures().length === askedBefore && (await v.framed()).frames === 0, { shownAs: await v.shownAs(v.hud.getByRole("button", { name: /blaster/i }).first()), askedSince: v.ofPictures().length - askedBefore, ...(await v.framed()) });
  check("nothing was refused by the shell's policy, and no page error", (await v.shell(() => window.__refused)).length === 0 && v.faults.length === 0, { refused: await v.shell(() => window.__refused), faults: v.faults });
  await v.ctx.close();
}

// ---- the page that draws the things is refused: the thing keeps its letter, and everything else works
{
  const v = await visit({ signedIn: true, named: true, refuseFrame: true });
  await v.go(`${WORLD}/`);
  await v.until(() => v.shell(() => window.__bitportalShell.below.world?.state.named === true), 40000);
  await v.goTab("Bag");
  const tile = v.hud.getByRole("button", { name: /blaster/i }).first();
  await v.until(() => tile.isVisible(), 40000);
  await v.wait(6000);
  // Refused, and so nothing came of it: the page was asked for, and asked for nothing itself.
  const byIt = v.reqs.filter((r) => r.from.startsWith(`${BASE}/shell/pictures/`) && r.url !== `${BASE}/shell/pictures/`).length;
  check("with the page that draws the things refused, it was asked for and nothing came of it", v.ofPictures().some((r) => r.url === `${BASE}/shell/pictures/`) && byIt === 0, { askedForThePage: v.ofPictures().filter((r) => r.url === `${BASE}/shell/pictures/`).length, askedByIt: byIt });
  check("and the thing is shown by its letter", /^letters "D/.test(await v.shownAs(tile)), { shownAs: await v.shownAs(tile) });
  check("and no model was fetched by anybody", !v.reqs.some((r) => r.url.endsWith(".glb") && r.from.startsWith(BASE)));
  const hold = v.hud.getByRole("button", { name: /^Hold/ }).first();
  check("and it can still be chosen: the Bag works without its pictures", await v.pressUntil(tile, () => hold.isVisible()));
  check("no page error", v.faults.filter((f) => !/pictures/.test(f)).length === 0, v.faults);
  await v.ctx.close();
}

// ---- the model is not what its description promised: no picture of it is made
{
  const v = await visit({ signedIn: true, named: true, wrongModel: true });
  await v.go(`${WORLD}/`);
  await v.until(() => v.shell(() => window.__bitportalShell.below.world?.state.named === true), 40000);
  await v.goTab("Bag");
  const tile = v.hud.getByRole("button", { name: /blaster/i }).first();
  await v.until(() => tile.isVisible(), 40000);
  const fetched = await v.until(() => v.reqs.some((r) => r.url.endsWith(".glb") && r.from.startsWith(`${BASE}/shell/pictures/`)), 30000);
  await v.wait(5000);
  check("with a model whose bytes are not the ones its description names, the page that draws was framed and fetched it", fetched && (await v.framed()).frames === 1, await v.framed());
  check("and made no picture of it: the thing is shown by its letter", /^letters "D/.test(await v.shownAs(tile)), { shownAs: await v.shownAs(tile) });
  await v.ctx.close();
}

// ---- a guest in the world carries nothing here, whoever is signed in to BitPortal
{
  const from = asked.length;
  const v = await visit({ signedIn: true, named: false });
  await v.go(`${WORLD}/`);
  await v.wait(3000);
  check("in a world where they are a guest, the world says so", (await v.shell(() => window.__bitportalShell.below.world?.state.named)) === false);
  const there = await v.goTab("Bag");
  const things = there ? await v.hud.getByRole("button", { name: /blaster/i }).count() : 0;
  check("and the menu shows them nothing of their bag there, though they are signed in to BitPortal", things === 0, { bagTab: there, rows: there ? (await v.hud.locator("button:visible").allInnerTexts()).map((t) => t.replace(/\s+/g, " ").trim()).filter((t) => !/^(Menu M|Full screen|Close|Keep this tab.*|›|‹|Home.*|Join.*)$/.test(t)).slice(-6) : [] });
  check("and nobody's bag was asked of any relay", asked.slice(from).filter((a) => a === "bag").length === 0, asked.slice(from));
  check("and the page that draws things was never asked for", v.ofPictures().length === 0 && (await v.framed()).frames === 0, { asked: v.ofPictures().length });
  await v.ctx.close();
}

// ---- named in the world, but nobody signed in to BitPortal: nothing of a bag, and nothing asked for
{
  const from = asked.length;
  const v = await visit({ signedIn: false, named: true });
  await v.go(`${WORLD}/`);
  await v.until(() => v.shell(() => window.__bitportalShell.below.world?.state.named === true), 40000);
  const there = await v.goTab("Bag");
  check("named in the world but not signed in to BitPortal: nothing of a bag is shown", (there ? await v.hud.getByRole("button", { name: /blaster/i }).count() : 0) === 0, { bagTab: there });
  check("and the shell asked no relay for a bag", asked.slice(from).filter((a) => a === "bag").length === 0, asked.slice(from));
  await v.ctx.close();
}

const failed = checks.filter((c) => !c.ok);
writeFileSync(join(SHOTS, "shell-bag.json"), JSON.stringify({ checks }, null, 1));
console.log(`\n${checks.length - failed.length} of ${checks.length} checks passed`);
await browser.close();
process.exit(failed.length ? 1 : 0);
