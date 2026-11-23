// The shell's menu, tried with real presses and real keys (NSWP docs/plans/the-clients-menu.md, 17.1 and 17.2).
//
//   BITPORTAL_SHELL_MENU=1 npm run build     the menu is off in an ordinary build: this is a trial's, never deployed
//   node trials/shell-menu.mjs               (BASE, the shell's local address; WORLD, a local world on kit 0.84 or later)
//   npm run build                            and back to an ordinary build afterwards
//
// Everything is on this machine: BitPortal as built here, a reference world and BitLogin as built from their own
// repositories, served by NSWP's scripts/serve-local.mjs --lan --https. Nobody is signed in and no password is typed.
// Every press is the mouse at a place on the screen and every key is the keyboard's, never a call into a page: a
// call counts in that page as the visitor's own press, and a trial of who has the keys then passes wrongly. Pages
// are only read from (where a thing is, what is focused, what a page counted).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const NSWP = process.env.NSWP ?? `${process.env.HOME}/Documents/GitHub/Nostr-Spatial-Web-Protocol--NSWP-`;
const pw = await import(`${NSWP}/node_modules/playwright-core/index.mjs`);
const BASE = process.env.BASE ?? "https://192.168.68.84:4800";
const WORLD = process.env.WORLD ?? "https://192.168.68.84:4802";
const SHOTS = process.env.SHOTS ?? ".shots";
mkdirSync(SHOTS, { recursive: true });
const checks = [];
const notes = [];
const check = (name, ok, more) => { checks.push({ name, ok: !!ok, ...(more === undefined ? {} : { more }) }); console.log(`${ok ? "ok  " : "FAIL"} ${name}${more === undefined ? "" : ` ${JSON.stringify(more)}`}`); };

const browser = await pw.chromium.launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addInitScript(() => {
  // What each page counted, to be read: refusals by its policy, and the keys it heard.
  window.__refused = [];
  addEventListener("securitypolicyviolation", (e) => window.__refused.push(`${e.violatedDirective} ${e.blockedURI}`.slice(0, 140)));
  window.__keys = 0;
  addEventListener("keydown", (e) => e.isTrusted && window.__keys++, true);
  // And what a page was told by the page above it, in the menu's words: by name only.
  window.__told = [];
  addEventListener("message", (e) => e.source === parent && e.data && e.data.nswp === "menu" && window.__told.push(e.data));
});
const page = await ctx.newPage();
const faults = [];
page.on("pageerror", (e) => faults.push(String(e).slice(0, 200)));
page.on("console", (m) => /Content Security Policy|Refused to/i.test(m.text()) && faults.push(m.text().slice(0, 200)));
const downloads = [];
page.on("download", (d) => downloads.push(d.suggestedFilename()));

const wait = (ms) => page.waitForTimeout(ms);
const world = () => page.frames().find((f) => f.url().startsWith(WORLD));
const frameNamed = (part) => page.frames().find((f) => f !== page.mainFrame() && f.url().includes(part));
/** The shell's own menu: everything in it is under this. */
const hud = page.locator(".shell-menu");
/**
 * Where the middle of something is, once it has stopped moving: the sheet slides up as it opens, and a place read
 * while it slides is a place the thing has left by the time the mouse gets there (the press then lands on the view).
 */
const middle = async (locator) => {
  await locator.first().waitFor({ state: "visible", timeout: 10000 });
  let b = await locator.first().boundingBox();
  for (let i = 0; i < 20; i++) {
    await wait(120);
    const next = await locator.first().boundingBox();
    if (b && next && Math.abs(next.x - b.x) < 0.5 && Math.abs(next.y - b.y) < 0.5) break;
    b = next;
  }
  if (!b) throw new Error(`not on screen: ${locator}`);
  return [b.x + b.width / 2, b.y + b.height / 2];
};
/** Wait for something to be so, for as long as a busy machine may need. */
const until = async (so, ms = 6000) => { for (const end = Date.now() + ms; Date.now() < end; ) { if (await so().catch(() => false)) return true; await wait(100); } return false; };
/**
 * Whether something comes to be so and stays so. Not the same as catching it once: the keys can be given to the
 * frame and taken back two thousandths of a second later, and a look at the right moment would call that a pass.
 */
const holds = async (so) => (await until(so)) && (await wait(500), await so().catch(() => false));
/** A real press, at the middle of something of the shell's. */
const press = async (locator) => { const [x, y] = await middle(locator); await page.mouse.click(x, y); await wait(350); };
const active = () => page.evaluate(() => (document.activeElement === document.getElementById("view") ? "frame" : document.activeElement?.tagName ?? "nothing"));
const sheetOpen = () => hud.getByRole("button", { name: "Close", exact: true }).isVisible().catch(() => false);
const worldKeys = () => world().evaluate(() => window.__keys);
const tab = (name) => hud.getByRole("tab", { name });
/** Choose a tab of the open sheet with the keyboard's arrows, wherever the tab bar has scrolled to. */
const goTab = async (name) => {
  const chosen = () => hud.locator('[role="tab"][aria-selected="true"]:visible').first().innerText().then((t) => t.trim()).catch(() => "");
  for (let attempt = 0; attempt < 3; attempt++) {
    if (!(await sheetOpen())) { await press(hud.locator("button:visible").filter({ hasText: /^Menu/ }).first()).catch(() => {}); await wait(500); }
    if ((await chosen()) === name) return true;
    // The chosen tab is given the keys by a real press on it, then one arrow at a time, waiting for the chosen tab
    // to change before the next: a busy machine is slow to draw.
    await press(hud.locator('[role="tab"][aria-selected="true"]:visible'));
    for (let n = 0; n < 24 && (await chosen()) !== name; n++) {
      const was = await chosen();
      await page.keyboard.press("ArrowRight");
      for (let i = 0; i < 25 && (await chosen()) === was; i++) await wait(100);
    }
    await wait(300);
    if ((await chosen()) === name) return true;
  }
  return false;
};
const openSheet = async () => { if (!(await sheetOpen())) await press(hud.getByRole("button", { name: /^Menu/ })); await until(sheetOpen); await wait(300); };

await page.goto(`${BASE}/shell/#to=${encodeURIComponent(`${WORLD}/`)}`);
for (let i = 0; i < 100 && !(await hud.getByRole("button", { name: /^Menu/ }).isVisible().catch(() => false)); i++) await wait(200);
await wait(2500);
await page.screenshot({ path: join(SHOTS, "shell-menu-over-world.png") });

// ---- one menu, and it is this page's
check("the shell draws the menu over a world that speaks the words", await hud.getByRole("button", { name: /^Menu/ }).isVisible());
check("the world draws no menu of its own", (await world().locator("nswp-hud").count()) === 0 || !(await world().getByRole("button", { name: /^Menu/ }).isVisible().catch(() => false)));
check("the frame has the keys as the place comes up", (await active()) === "frame");

// ---- 17.2 (1): a press on the bar acts, and the world goes on hearing keys with no press on the view
await page.keyboard.down("w");
const before1 = await worldKeys();
await press(hud.getByRole("button", { name: /Join/ }));
await wait(600);
check("after a press on a bar key, the frame has the keys", (await active()) === "frame");
await page.keyboard.up("w");
await page.keyboard.press("a");
await page.keyboard.press("d");
check("and the world hears the next keys with no press on the view", (await worldKeys()) >= before1 + 2, { before: before1, after: await worldKeys() });

// ---- 17.2 (2): the sheet, closed each way, gives the frame the keys
await openSheet();
check("the sheet open: the shell has the keys", (await active()) !== "frame", await active());
await page.keyboard.press("Escape");
check("closed by a key (Escape): the frame has the keys", await holds(async () => !(await sheetOpen()) && (await active()) === "frame"), await active());
const kEsc = await worldKeys();
await page.keyboard.press("w");
check("and the very next key is the world's", (await worldKeys()) === kEsc + 1);
await openSheet();
await page.mouse.click(60, 300);
await wait(900);
// A press outside the sheet closes it (the kit's menu, from 0.85.0), and only closes it.
check("closed by a press outside it: the frame has the keys", await holds(async () => !(await sheetOpen()) && (await active()) === "frame"), await active());
await openSheet();
await press(hud.getByRole("button", { name: "Close", exact: true }));
check("closed by its own Close: the frame has the keys", await holds(async () => !(await sheetOpen()) && (await active()) === "frame"), await active());

// ---- 17.1 (2): every tab opened, and nothing refused by this page's policy
await openSheet();
const tabs = [];
// Round the tabs with the keyboard's own arrow, from the one that has the keys, reading which is chosen each time.
await press(tab("Travel"));
for (let n = 0; n < 24; n++) {
  const name = (await hud.locator('[role="tab"][aria-selected="true"]:visible').first().innerText()).trim();
  if (tabs.includes(name)) break;
  tabs.push(name);
  await wait(350);
  await page.keyboard.press("ArrowRight");
  // Until the chosen tab has changed: a busy machine is slow to draw it. At the last tab it doesn't change.
  await until(async () => (await hud.locator('[role="tab"][aria-selected="true"]:visible').first().innerText()).trim() !== name, 3000);
}
check("every tab opened, by the arrow key", tabs.length >= 10 && ["You", "Moving", "Sound", "Display", "Help"].every((t) => tabs.includes(t)), tabs);
await page.screenshot({ path: join(SHOTS, "shell-menu-sheet.png") });

// ---- the panel: topmost, and the keys
await press(tab("You"));
await press(hud.getByRole("button", { name: /^Your account/ }));
for (let i = 0; i < 40 && !(await page.locator(".shell-panel:not([data-waiting]):not([data-kept])").count()); i++) await wait(150);
await wait(600);
const panelBox = await page.locator(".shell-panel").boundingBox();
const top = await page.evaluate(([x, y]) => { const el = document.elementFromPoint(x, y); return { tag: el?.tagName, inPanel: !!el?.closest?.(".shell-panel") }; }, [panelBox.x + panelBox.width / 2, panelBox.y + panelBox.height / 2]);
check("17.1 (3): the thing at the middle of the panel's box is the panel", top.tag === "IFRAME" && top.inPanel, top);
check("the sheet is down while the panel is up", !(await sheetOpen()));
await page.screenshot({ path: join(SHOTS, "shell-menu-panel.png") });
await page.mouse.click(60, 300);
await wait(600);
check("the panel closed: the frame has the keys", await holds(async () => (await active()) === "frame"), await active());

// ---- 17.2 (3): the shell given the keys by hand
// Set up by a call, since nothing a visitor does here is known to move them: the keys then pressed are real.
await page.evaluate(() => { document.getElementById("view").blur(); document.body.focus(); });
check("(set up) the shell has the keys", (await active()) !== "frame", await active());
await page.keyboard.press("Backquote");
await wait(400);
check("with the shell holding the keys, the summons key opens the menu", await sheetOpen());
await page.keyboard.press("Backquote");
await wait(400);
await page.evaluate(() => { document.getElementById("view").blur(); document.body.focus(); });
const k1 = await worldKeys();
await page.keyboard.press("w");
await wait(200);
check("and another key gives them back to the frame", (await active()) === "frame", await active());
await page.keyboard.press("w");
check("so the next key is the world's", (await worldKeys()) === k1 + 1, { heard: (await worldKeys()) - k1 });

// ---- a picture handed up and saved by this page (Camera)
await openSheet();
if (await goTab("Camera")) {
  await press(hud.getByRole("button", { name: /Take a picture/ }));
  // The kit takes what a world hands up for ten seconds after the press (`MENU_SAVE_MS`). A machine drawing the
  // world without a graphics card, and busy, can take most of that to make the picture.
  for (let i = 0; i < 60 && !downloads.length; i++) await wait(200);
  check("Camera: a picture the world hands up is saved by this page, named by it", downloads.length === 1 && /\.(png|jpe?g|webp)$/.test(downloads[0] ?? ""), downloads);
} else check("Camera: its tab", false);

// ---- a file chosen in this page and handed down (Panels)
if (await goTab("Panels")) {
  const chooser = page.waitForEvent("filechooser", { timeout: 8000 }).catch(() => null);
  await press(hud.getByRole("button", { name: /Hang a picture or video from this device/ }));
  const asked = await chooser;
  check("Panels: this page's own chooser opens at the press", !!asked);
  if (asked) {
    // A picture one pixel square, made here.
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==", "base64");
    await asked.setFiles({ name: "one.png", mimeType: "image/png", buffer: png });
    await wait(1500);
    const got = await world().evaluate(() => window.__told.filter((w) => w.file instanceof Blob).map((w) => ({ press: w.press, size: w.file.size, type: w.file.type })));
    check("and the file goes down to the world that asked, as it is", got.length === 1 && got[0].size === png.length && got[0].type === "image/png", got);
  }
} else check("Panels: its tab", false);

// ---- a setting changed in this page's menu is said down, and nothing of the visitor's tabs is
if (await goTab("Display")) {
  const before = await world().evaluate(() => window.__told.filter((w) => w.settings).length);
  await press(hud.getByRole("button", { name: /^Text: / }));
  await wait(600);
  const said = await world().evaluate((n) => window.__told.filter((w) => w.settings).slice(n), before);
  check("a setting changed in the menu is said down to the world", said.length >= 1, said.map((w) => Object.keys(w.settings)));
  await press(hud.getByRole("button", { name: /^Text: / }));
}
const told = await world().evaluate(() => window.__told);
const names = [...new Set(told.flatMap((w) => Object.keys(w)))].sort();
check("the world was told only the menu's words down", names.every((n) => ["nswp", "has", "v", "settings", "open", "press", "field", "file", "go", "sign", "kind", "name"].includes(n)), names);
check("it was never told `filesAnywhere`", !JSON.stringify(told.map((w) => w.settings ?? {})).includes("filesAnywhere"));
check("it was answered `has: true` with the visitor's settings", told.some((w) => w.has === true && w.settings && typeof w.settings === "object"));

// ---- signing in: the menu's own row opens the sign-in address's panel for this world
if (await goTab("You")) {
  await press(hud.getByRole("button", { name: /^Sign in to / }));
  for (let i = 0; i < 40 && !(await page.locator(".shell-panel:not([data-waiting]):not([data-kept])").count()); i++) await wait(150);
  await wait(500);
  check("You: \"Sign in to <the world>\" opens the panel, with the sheet down", (await page.locator(".shell-panel:not([data-kept])").count()) === 1 && !(await sheetOpen()));
  await page.mouse.click(60, 300);
  await wait(700);
} else check("You: its tab", false);

// ---- the visitor's own music: chosen and played in this page, and still playing after a door
await openSheet();
let music = false;
if (await goTab("Sound")) {
  const chooser = page.waitForEvent("filechooser", { timeout: 8000 }).catch(() => null);
  await press(hud.getByRole("button", { name: /Add music from this device/ }));
  const asked = await chooser;
  if (asked) {
    // Two seconds of a quiet tone, made here: a WAV file, 8 kHz, 8 bit.
    const n = 16000;
    const wav = Buffer.alloc(44 + n);
    wav.write("RIFF", 0); wav.writeUInt32LE(36 + n, 4); wav.write("WAVEfmt ", 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(8000, 28); wav.writeUInt16LE(1, 32); wav.writeUInt16LE(8, 34); wav.write("data", 36); wav.writeUInt32LE(n, 40);
    for (let i = 0; i < n; i++) wav[44 + i] = 128 + Math.round(20 * Math.sin(i / 6));
    await asked.setFiles({ name: "a tone.wav", mimeType: "audio/wav", buffer: wav });
    await wait(1500);
    const play = hud.getByRole("button", { name: /Play your music/ });
    if (await play.isVisible().catch(() => false)) await press(play);
    await wait(800);
    music = await page.evaluate(() => window.__bitportalShell.sounds.jukebox.playing);
  }
  check("Sound: a song added from this device plays in this page", music, await page.evaluate(() => ({ songs: window.__bitportalShell.sounds.jukebox.list().length, playing: window.__bitportalShell.sounds.jukebox.playing })));
} else check("Sound: its tab", false);
await openSheet();
// ---- 17.1 (4) and 17.2 (4): a world's markup is shown as letters, and what is typed in the menu stays in it
// Said by the world's own page, as a hostile world would say it: this is the world's word, not a press. It has a
// row whose label is markup, and a row to type into, in a tab a world may put one in.
const marked = "<img src=x onerror=window.__owned=1><b>bold</b>";
// Whether the markup became elements: the picture it names, or the bold word.
const made = () => page.evaluate(() => { const root = document.querySelector(".shell-menu").firstElementChild.shadowRoot; return root.querySelectorAll('img[src="x"], [onerror]').length + [...root.querySelectorAll("b")].filter((b) => b.textContent === "bold").length; });
const say = () => world().evaluate((label) => parent.postMessage({ nswp: "menu", world: { title: label, level: "full", corner: "top-left", keys: false, state: {}, target: [], loading: null, sections: [{ id: "travel", label: "Travel", rows: [{ id: "marked", label, kind: "button" }] }, { id: "following", label: "Following", rows: [{ id: "typed", label: "Follow someone by key", kind: "field" }] }] } }, "*"), marked);
await say();
await press(tab("Travel"));
await wait(300);
const shown = await page.evaluate((label) => ({ letters: document.querySelector(".shell-menu").firstElementChild.shadowRoot.textContent.includes(label), owned: window.__owned === 1 }), marked);
check("markup in a world's label is shown as letters, and makes no element", shown.letters && (await made()) === 0 && !shown.owned, { ...shown, elements: await made() });
await page.screenshot({ path: join(SHOTS, "shell-menu-markup.png") });
await say();
await press(tab("Following"));
// A row typed into shows its field when it is pressed.
const typedRow = hud.getByRole("button", { name: /Follow someone by key/ });
if (await typedRow.isVisible().catch(() => false)) await press(typedRow);
const field = hud.locator("input:not([type=file]):not([type=checkbox]):visible, textarea:visible").first();
if (await field.isVisible().catch(() => false)) {
  const k0 = await worldKeys();
  await press(field);
  await page.keyboard.type("npub1notakey", { delay: 20 });
  await wait(200);
  check("typed into a field of the menu's: the world heard none of it", (await worldKeys()) === k0 && (await field.inputValue()) === "npub1notakey", { heard: (await worldKeys()) - k0, value: await field.inputValue() });
} else check("a field of the menu's to type into", false, await hud.locator('[role="tab"][aria-selected="true"]:visible').first().innerText().catch(() => "?"));
// The made-up description stands until the world's own changes: this is the last thing looked at in this world.

if (await sheetOpen()) await page.keyboard.press("Escape");
await wait(900);

// ---- a door crossed, by Home: the world is asked, and the visitor is home either way
await press(hud.getByRole("button", { name: /^Home/ }).last());
for (let i = 0; i < 60 && !frameNamed("/walk/"); i++) await wait(250);
check("Home: the frame is at the room", !!frameNamed("/walk/"), page.frames().map((f) => new URL(f.url()).pathname));
await wait(5000);
check("the visitor's music is still playing after the door", (await page.evaluate(() => window.__bitportalShell.sounds.jukebox.playing)) === music && music);
check("over the room, which doesn't speak the words yet, the shell draws no menu", !(await hud.getByRole("button", { name: /^Menu/ }).isVisible().catch(() => false)));
check("a door crossed: the frame has the keys", (await active()) === "frame", await active());
await page.screenshot({ path: join(SHOTS, "shell-menu-room.png") });

// ---- what a world reports from its headset session is kept, across a reload of this page
// Said by the world's own page, as a world in a headset session says it: its description says the session is
// running, and then what the visitor changed there. This is the world's word, not a press.
await page.goto("about:blank");
await page.goto(`${BASE}/shell/#to=${encodeURIComponent(`${WORLD}/`)}`);
for (let i = 0; i < 100 && !(await hud.getByRole("button", { name: /^Menu/ }).isVisible().catch(() => false)); i++) await wait(200);
await wait(2500);
await world().evaluate(() => {
  parent.postMessage({ nswp: "menu", world: { title: "The Grove", level: "full", keys: true, state: { headset: { supported: true, presenting: true } }, target: [], loading: null, sections: [] } }, "*");
  parent.postMessage({ nswp: "menu", settings: { turn: 90, hand: "left", fade: false, filesAnywhere: true, holding: { item: "x" } } }, "*");
});
await wait(600);
const keptNow = await page.evaluate(() => JSON.parse(localStorage.getItem("bitportal:reported") ?? "null"));
check("a world's headset report is kept for this site: comfort only, by the kit's list", keptNow && keptNow.turn === 90 && keptNow.hand === "left" && keptNow.fade === false && !("filesAnywhere" in keptNow) && !("holding" in keptNow), keptNow);
await page.goto("about:blank");
await page.goto(`${BASE}/shell/#to=${encodeURIComponent(`${WORLD}/`)}`);
for (let i = 0; i < 100 && !(await hud.getByRole("button", { name: /^Menu/ }).isVisible().catch(() => false)); i++) await wait(200);
await wait(1500);
const toldAfter = await world().evaluate(() => window.__told.find((w) => w.has === true)?.settings ?? null);
check("and after this page is loaded again, the next world is told it", toldAfter && toldAfter.turn === 90 && toldAfter.hand === "left" && toldAfter.fade === false, toldAfter && { turn: toldAfter.turn, hand: toldAfter.hand, fade: toldAfter.fade });
await page.evaluate(() => localStorage.removeItem("bitportal:reported"));

// ---- through a door: the Airlock, and the next world, under the same menu
const OTHER = process.env.OTHER ?? WORLD.replace(/:(\d+)$/, (_, p) => `:${Number(p) - 1}`);
const airlock = () => frameNamed("/go/");
const continueOn = () => airlock().getByRole("button", { name: /^Continue to / });
/** From the world, by a door of its own in the shell's menu, as far as the Airlock's question. Returns the door's name. */
const toTheAirlock = async () => {
  await page.goto("about:blank");
  await page.goto(`${BASE}/shell/#to=${encodeURIComponent(`${WORLD}/`)}`);
  for (let i = 0; i < 100 && !(await hud.getByRole("button", { name: /^Menu/ }).isVisible().catch(() => false)); i++) await wait(200);
  await wait(2500);
  await openSheet();
  await goTab("Travel");
  const door = hud.locator("button:visible").filter({ hasText: /^The (Gallery|Observatory|Grove|Workshop)$/ }).first();
  const name = (await door.innerText()).trim();
  await press(door);
  await press(hud.getByRole("button", { name: "Travel here" }));
  for (let i = 0; i < 60 && !airlock(); i++) await wait(250);
  if (airlock()) for (let i = 0; i < 60 && !(await continueOn().isVisible().catch(() => false)); i++) await wait(250);
  await wait(800);
  return name;
};
/** The mark, which is all of the menu that shows over the Airlock. */
const mark = () => hud.locator("button:visible").first();

let doorName = await toTheAirlock();
check("a door of the world's, pressed in the shell's menu, leads to the Airlock", !!airlock(), doorName);
if (airlock()) {
  const over = await page.evaluate(() => { const b = window.__bitportalShell.below; return { speaks: b.speaks, own: b.origin === location.origin, title: b.world?.title, level: b.world?.level, tabs: b.world?.sections.length }; });
  check("the Airlock speaks the words, as a page of this site's own, and describes no tab", over.speaks && over.own && over.title === "The Airlock" && over.tabs === 0, over);
  check("over it the menu is one small mark: no bar, and the sheet is down", over.level === "quiet" && !(await sheetOpen()) && !(await hud.getByRole("button", { name: /^Home/ }).isVisible().catch(() => false)));
  check("the Airlock has the keys as it arrives", (await active()) === "frame", await active());
  // Nothing of the shell's is over the Airlock's own panel: at its corners and its middle, the thing there is the frame.
  const card = await airlock().locator("#main section:visible").first().boundingBox();
  const at = await page.evaluate((b) => [[b.x + 4, b.y + 4], [b.x + b.width - 4, b.y + 4], [b.x + b.width / 2, b.y + b.height / 2], [b.x + 4, b.y + b.height - 4], [b.x + b.width - 4, b.y + b.height - 4]].map(([x, y]) => document.elementFromPoint(x, y)?.id), card);
  check("nothing of the menu is over the Airlock's panel", at.every((id) => id === "view"), at);
  await page.screenshot({ path: join(SHOTS, "shell-menu-airlock.png") });
  // The mark opens the visitor's tabs and the way home, and nothing of a world's.
  await press(mark());
  await wait(500);
  const airlockTabs = (await hud.locator('[role="tab"]:visible').allInnerTexts()).map((t) => t.trim());
  check("its sheet has the way home and the visitor's own tabs only", (await sheetOpen()) && airlockTabs.includes("Travel") && !airlockTabs.some((t) => ["Room", "People", "Camera", "Panels"].includes(t)), airlockTabs);
  await page.keyboard.press("Escape");
  check("closed again: the Airlock has the keys", await holds(async () => !(await sheetOpen()) && (await active()) === "frame"), await active());
  // Home, pressed over the Airlock.
  await press(mark());
  await wait(400);
  await goTab("Travel");
  await press(hud.getByRole("button", { name: /^Home/ }).last());
  for (let i = 0; i < 40 && !frameNamed("/walk/"); i++) await wait(250);
  check("Home, pressed over the Airlock, is the room at once", !!frameNamed("/walk/"), page.frames().map((f) => new URL(f.url()).pathname));

  // Again, and on through the door this time, by a real press on the Airlock's own button.
  doorName = await toTheAirlock();
  if (airlock()) {
    await page.mouse.click(...(await (async () => { const b = await continueOn().boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; })()));
    const next = () => page.frames().find((f) => f.url().startsWith(OTHER));
    for (let i = 0; i < 80 && !next(); i++) await wait(250);
    for (let i = 0; i < 100 && !(await hud.getByRole("button", { name: /^Menu/ }).isVisible().catch(() => false)); i++) await wait(200);
    await wait(2000);
    const then = await page.evaluate(() => { const b = window.__bitportalShell.below; return { speaks: b.speaks, title: b.world?.title, level: b.world?.level }; });
    check("the next world is under the same menu, with its own name", !!next() && then.speaks && then.title === doorName && then.level === "full", then);
    check("and has the keys as it arrives, with the sheet down", (await active()) === "frame" && !(await sheetOpen()), await active());
    await page.screenshot({ path: join(SHOTS, "shell-menu-next-world.png") });
  } else check("the Airlock asks a second time", false);
}

const refused = await page.evaluate(() => window.__refused);
check("17.1 (2): nothing was refused by the shell's policy", refused.length === 0, refused);
check("no page error, and no refusal in the console", faults.length === 0, faults);
const failed = checks.filter((c) => !c.ok);
writeFileSync(join(SHOTS, "shell-menu.json"), JSON.stringify({ checks, notes, tabs }, null, 1));
console.log(`\n${checks.length - failed.length} of ${checks.length} checks passed`);
await browser.close();
process.exit(failed.length ? 1 : 0);
