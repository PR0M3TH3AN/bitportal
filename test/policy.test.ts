/** What this copy of BitPortal will and won't show (src/shared/instance.ts; NSWP spec §15). */
import { describe, expect, it } from "vitest";
import { buildListEvent, buildWorldEvent, finalizeEvent, getPublicKey, type NostrEvent } from "@nswp/core";
import bundle from "../src/starter/starter-set.json";
import { buildCatalog as buildAt, type CatalogOptions, type StarterBundle } from "../src/shared/catalog.js";
import { INSTANCE, OPEN_POLICY, sendsPass, type InstancePolicy } from "../src/shared/instance.js";
import { follow } from "../src/shared/lists.js";
import { savedEntries } from "../src/shared/saved.js";

const starter = bundle as unknown as StarterBundle;
const key = (n: number) => new Uint8Array(32).fill(n);
const OPERATOR = key(7);
const ALICE = key(1);
const BOB = key(2);
const operator = getPublicKey(OPERATOR);
const T = 1_800_000_000;
// The reader's clock is the lists' own: which copy of a list counts is NSWP-08's rule, and a copy far ahead of now doesn't.
const buildCatalog = (b: StarterBundle, events: unknown[] = [], opts: CatalogOptions = {}) => buildAt(b, events, { now: T, ...opts });
const world = (d: string, sk: Uint8Array, extra: Partial<Parameters<typeof buildWorldEvent>[0]> = {}, at = T): NostrEvent =>
  finalizeEvent(buildWorldEvent({ d, title: `World ${d}`, url: `https://${d}.example/`, createdAt: at, ...extra }), sk);
const list = (d: string, sk: Uint8Array, worlds: string[], at = T): NostrEvent => finalizeEvent(buildListEvent({ d, title: `List ${d}`, description: "", worlds, createdAt: at }), sk);
const id = (e: NostrEvent) => `37300:${e.pubkey}:${e.tags.find((t) => t[0] === "d")![1]}`;
/** A site run by OPERATOR that shows only what its operators list, and no adult worlds. */
const strict: InstancePolicy = { operators: [operator], allowList: "bitportal", allowListOnly: true, allowAdult: false };

const pond = world("pond", BOB, { audience: "general" });
const park = world("park", BOB, { audience: "kids" });
const club = world("club", BOB, { audience: "adult" });
const fog = world("fog", BOB, { contentWarning: "flashing lights" }); // warned, and doesn't say who it is for
const maze = world("maze", BOB, { contentWarning: "flashing lights", audience: "general" });
const plain = world("plain", BOB); // says nothing about itself
const stray = world("stray", ALICE, { audience: "general" }); // announced, and on nobody's list

describe("this site's own settings", () => {
  it("keep adult worlds out, and show only what its operator has listed", () => {
    expect(INSTANCE.allowAdult).toBe(false);
    expect(INSTANCE.allowListOnly).toBe(true);
    expect(INSTANCE.operators.length).toBeGreaterThan(0);
    for (const k of INSTANCE.operators) expect(k).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("the allow list", () => {
  const allow = list("bitportal", OPERATOR, [id(pond), id(park), id(club), id(fog), id(maze), id(plain)]);
  const events = [allow, pond, park, club, fog, maze, plain, stray];

  it("is a list the operator signed, under the agreed name, and nothing else", () => {
    const c = buildCatalog(starter, events, { policy: strict });
    expect(c.lists.filter((l) => !l.starter).map((l) => [l.pubkey, l.operator])).toEqual([[operator, true]]);
    expect(c.allowed.has(id(pond))).toBe(true);
    // Another name, another key, a bad signature: none of them is the allow list.
    for (const fake of [list("favourites", OPERATOR, [id(stray)]), list("bitportal", ALICE, [id(stray)]), { ...list("bitportal", OPERATOR, [id(stray)], T + 9), sig: "0".repeat(128) }]) {
      const c2 = buildCatalog(starter, [fake, stray], { policy: strict });
      expect(c2.allowed.has(id(stray))).toBe(false);
      expect(c2.entries.some((e) => e.id === id(stray))).toBe(false);
    }
  });

  it("is the newest one the operator signed", () => {
    const later = list("bitportal", OPERATOR, [id(park)], T + 50);
    const c = buildCatalog(starter, [...events, later], { policy: strict });
    expect(c.allowed.has(id(park))).toBe(true);
    expect(c.allowed.has(id(pond))).toBe(false);
    expect(c.operatorLists.map((e) => e.id)).toEqual([later.id]);
  });

  it("is known from an earlier visit before any relay answers", () => {
    const c = buildCatalog(starter, [pond], { policy: strict, operatorLists: [allow] });
    expect(c.entries.some((e) => e.id === id(pond))).toBe(true);
  });

  it("still counts the list this copy ships with, whether or not the visitor is showing it", () => {
    const shipped = buildCatalog(starter, [], { policy: strict });
    expect(shipped.entries.length).toBeGreaterThan(0);
    const away = buildCatalog(starter, [], { policy: strict, showStarter: false });
    expect(away.entries).toEqual([]);
    for (const e of shipped.entries) expect(away.allowed.has(e.id)).toBe(true);
  });
});

describe("what is shown", () => {
  const allow = list("bitportal", OPERATOR, [id(pond), id(park), id(club), id(fog), id(maze), id(plain)]);
  const events = [allow, pond, park, club, fog, maze, plain, stray];
  const shown = (c: ReturnType<typeof buildCatalog>) => c.entries.map((e) => e.world.d).filter((d) => ["pond", "park", "club", "fog", "maze", "plain", "stray"].includes(d));

  it("never includes a world that is for adults, whoever listed it", () => {
    const c = buildCatalog(starter, events, { policy: strict });
    // The adult world, and the one with a warning that doesn't say who it is for, are out. The warned one whose
    // maker says it is for everyone stays, and so does the one that says nothing: the operator listed it.
    expect(shown(c)).toEqual(["pond", "park", "maze", "plain"]);
    expect(c.withheld.adult).toBe(2);
    expect(c.permits(id(club), { audience: "adult" })).toBe(false);
    expect(c.permits(id(pond), { audience: "general" })).toBe(true);
  });

  it("never includes a world no operator listed: not from a list the visitor follows, and not from the shelf of the unlisted", () => {
    const theirs = follow([], list("mine", ALICE, [id(stray), id(pond)]), [stray, pond], 1);
    const c = buildCatalog(starter, events, { policy: strict, followed: theirs });
    expect(c.lists.some((l) => l.pubkey === getPublicKey(ALICE))).toBe(false);
    expect(shown(c)).not.toContain("stray");
    expect(c.unlisted).toEqual([]);
    expect(c.withheld.lists).toBe(1);
    expect(c.withheld.notListed).toBeGreaterThanOrEqual(1);
    expect(c.permits(id(stray), { audience: "general" })).toBe(false);
  });

  it("gives an operator the worlds waiting to be listed, adult ones among them, and still lists none of those", () => {
    const c = buildCatalog(starter, events, { policy: strict, operatorView: true });
    expect(c.unlisted.map((e) => e.world.d)).toContain("stray");
    expect(shown(c)).not.toContain("stray");
    expect(shown(c)).not.toContain("club");
  });

  it("doesn't show a door saved before the policy, if the policy wouldn't show it now", () => {
    const c = buildCatalog(starter, events, { policy: strict });
    const saved = [stray, club, pond].map((event, slot) => ({ id: id(event), event, slot, savedAt: 1 }));
    expect(savedEntries(saved as never, c).map((e) => e.world.d)).toEqual(["pond"]);
  });

  it("is everything, on a copy whose operator set no policy", () => {
    const theirs = follow([], list("mine", ALICE, [id(stray)]), [stray], 1);
    const c = buildCatalog(starter, events, { policy: OPEN_POLICY, followed: theirs });
    expect(c.entries.some((e) => e.world.d === "stray")).toBe(true);
    expect(c.unlisted.map((e) => e.world.d)).toContain("club"); // an adult world, shown where nothing forbids it
    expect(c.withheld).toEqual({ adult: 0, notListed: 0, lists: 0 });
  });
});

describe("where this copy's visitors sign from inside a world", () => {
  it("is BitLogin's own site, an https address, and every arrival says so", async () => {
    const { signerAt } = await import("@nswp/core");
    expect(INSTANCE.signer).toBe("https://bitlogin.network/");
    expect(signerAt(INSTANCE.signer)).toEqual({ origin: "https://bitlogin.network", signer: "https://bitlogin.network/signer/", window: "https://bitlogin.network/connect/" });
    // Both ways the Airlock sends someone to a world carry it: through a door, and home.
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const airlock = readFileSync(new URL("../src/go/airlock.ts", import.meta.url), "utf8");
    expect(airlock.split("buildArrivalUrl(").length - 1).toBe(airlock.split("signer: INSTANCE.signer").length - 1);
    // BitPortal has no signer of its own, and no page of it may be embedded by another site.
    const build = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");
    expect(build).not.toContain("frame-ancestors https:");
    expect(build).not.toMatch(/signer\/main|connect\/main/);
  });
});

describe("where a visitor signs in to BitPortal itself (owner's decision, 2026-11-19)", () => {
  it("is the sign-in address's own window: no page of BitPortal has a sign-in form, and none loads BitLogin's widget", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    for (const page of ["account", "publish", "go", "walk", "lobby", "look", "landing", "start"]) {
      const html = readFileSync(new URL(`../src/${page}/index.html`, import.meta.url), "utf8");
      expect(html, page).not.toContain("<bitlogin-auth");
      expect(html, page).not.toContain("/vendor/bitlogin/");
      expect(html, page).not.toMatch(/type="password"/);
    }
    // Only the session module reaches for BitLogin, and only for its client: never its widget or its headless signer.
    const session = readFileSync(new URL("../src/shared/session.ts", import.meta.url), "utf8");
    expect(session).toContain("/vendor/bitlogin/bitlogin-client.js");
    expect(session).not.toMatch(/bitlogin-headless|bitlogin-session|bitlogin\.js/);
  });
  it("may embed that one address and no other, runs no WebAssembly, and still may be embedded by nobody", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const build = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");
    // One place writes what a page may embed: the sign-in address, after whatever a page is given by name. Left
    // to itself a page is given nothing, and may be embedded by nobody.
    expect(build).toContain('`frame-src ${[...frames, signInOrigin].join(" ")}`');
    // Written there, and once more where the rules of the page that keeps the screen are written out whole to be
    // checked against what that one place made (below): a check, which can stop a build and can't change a header.
    expect(build.split("frame-src").length - 1).toBe(2);
    expect(build.split("frame-src").slice(1).map((after) => after.startsWith(" 'self' ${[...shellWorlds, signInOrigin]") || after.startsWith(' ${[...frames, signInOrigin].join(" ")}`'))).toEqual([true, true]);
    expect(build).toContain(`const rulesFor = ({ frames = [], framedBy = "'none'" } = {}) =>`);
    expect(build).toContain("const csp = rulesFor();");
    expect(build).toContain(`"script-src 'self'"`);
    expect(build).not.toContain("wasm-unsafe-eval");
    // Every page but four is under those rules, and each path is under one set of rules only.
    expect(build).toContain('{ source: "/((?!(?:walk|go|shell|item-box)(?:/|$)).*)", headers: guards(csp) },');
    // The address in the policy is read from this instance's own settings, as the one named to worlds.
    expect(/^\s*signer:\s*"(https:\/\/[^"]+)"/m.exec(readFileSync(new URL("../src/shared/instance.ts", import.meta.url), "utf8"))?.[1]).toBe(INSTANCE.signer);
  });
  it("lets one page keep the screen, framing only its own room, its Airlock and the worlds it names (2026-11-20)", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const build = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");
    // The exceptions, and no more: the page that holds the screen, the two it shows of this site's own, and the
    // room's own, which frames the kit's locked item box (below).
    expect(build.split("rulesFor(").length - 1).toBe(4);
    expect(build).toContain(`const cspFramed = rulesFor({ framedBy: "'self'" });`);
    expect(build).toContain(`const cspRoom = rulesFor({ frames: ["'self'"], framedBy: "'self'" });`);
    expect(build).toContain(`const cspShell = rulesFor({ frames: ["'self'", ...shellWorlds] });`);
    // Its rules are written out a second time, whole, and the build stops if the two differ: the page draws the
    // visitor's menu over other people's worlds and frames the sign-in address's panel, so none of these words may
    // change by a change made somewhere else (NSWP docs/plans/the-clients-menu.md, 17.1).
    expect(build).toContain("const cspShellWritten = `default-src 'self'; script-src 'self'; worker-src 'self'; frame-src 'self' ${[...shellWorlds, signInOrigin].join(\" \")}; style-src 'self'; font-src 'self'; img-src 'self' data: blob:; media-src 'self' blob: mediastream:; connect-src 'self' https: wss:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;");
    expect(build).toContain("if (cspShell !== cspShellWritten) throw new Error(");
    expect(build.indexOf("if (cspShell !== cspShellWritten)")).toBeLessThan(build.indexOf('{ source: "/shell(/.*)?"'));
    expect(build).toContain('{ source: "/walk(/.*)?", headers: guards(cspRoom) },');
    expect(build).toContain('{ source: "/go(/.*)?", headers: guards(cspFramed) },');
    expect(build).toContain('{ source: "/shell(/.*)?", headers: guards(cspShell, shellWorlds, signInOrigin) },');
    // The worlds it names are sites, each by its own address and nothing wider: never a whole scheme, never a star.
    const named = JSON.parse(readFileSync(new URL("../src/shared/shell-worlds.json", import.meta.url), "utf8")) as string[];
    expect(named.length).toBeGreaterThan(0);
    for (const origin of named) {
      expect(origin).toMatch(/^https:\/\/[a-z0-9.-]+$/);
      expect(new URL(origin).origin).toBe(origin);
    }
    // What the frame is handed goes to whatever is in it, since it goes from place to place: so it is this page's
    // own rules that say which places may have a headset or a microphone, by name, and the frame is never handed the screen.
    const page = readFileSync(new URL("../src/shell/index.html", import.meta.url), "utf8");
    expect(page).toContain(`allow="xr-spatial-tracking *; microphone *; autoplay *; gamepad *; clipboard-write *; fullscreen 'none'"`);
    expect(build).toContain('const handsOn = (to = []) => `xr-spatial-tracking=(self${to.map((o) => ` "${o}"`).join("")}), microphone=(self${to.map((o) => ` "${o}"`).join("")}), camera=(), geolocation=()`;');
    // And each is a world this copy itself shows a door to: it frames nothing it doesn't already send people to.
    const shown = new Set((JSON.parse(readFileSync(new URL("../src/starter/starter-set.json", import.meta.url), "utf8")) as { worlds: { tags: string[][] }[] }).worlds.map((w) => new URL(w.tags.find((t) => t[0] === "r")![1]!).origin));
    for (const origin of named) expect(shown.has(origin), origin).toBe(true);
  });
  it("shows the sign-in address's panel from the page that keeps the screen, and from nowhere else", async () => {
    const { readFileSync, readdirSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string; readdirSync(path: URL, o: { recursive: true }): string[] };
    const build = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");
    // A passkey may be used and made by the sign-in address in that page's frame of it: by that one address, on
    // that one page, and never by BitPortal itself, which signs nobody in.
    expect(build).toContain('const passkeysTo = (origin) => `publickey-credentials-get=(self "${origin}"), publickey-credentials-create=(self "${origin}")`;');
    // BitPortal itself never asks for one: the page is named only because a browser lets a page hand on what it may use.
    for (const file of readdirSync(new URL("../src/", import.meta.url), { recursive: true }).filter((f) => /\.ts$/.test(f))) expect(readFileSync(new URL(file, new URL("../src/", import.meta.url)), "utf8"), file).not.toMatch(/navigator\.credentials|PublicKeyCredential/);
    expect(build).toContain("{ key: \"Permissions-Policy\", value: passkeys ? `${handsOn(to)}, ${passkeysTo(passkeys)}` : handsOn(to) },");
    expect(build.match(/guards\([^)]*signInOrigin\)/g)).toEqual(["guards(cspShell, shellWorlds, signInOrigin)"]);
    // The frame is BitLogin's panel page and nothing else, handed passkeys and nothing else, and it is made in one
    // file: a frame of this page directly, beside the world's, which is where BitLogin's panel looks for the signer.
    const panel = readFileSync(new URL("../src/shell/panel.ts", import.meta.url), "utf8");
    expect(panel).toContain("frame.allow = `publickey-credentials-get ${o.at}; publickey-credentials-create ${o.at}`;");
    expect(panel).toContain("frame.src = `${o.at}/connect/panel/`;");
    expect(panel).toContain("document.body.append(scrim, box);");
    // It listens only to that frame, at that address; and tells it who is asking at that address only.
    expect(panel).toContain("if (!up || e.source !== up.frame.contentWindow || e.origin !== o.at) return;");
    expect(panel).not.toMatch(/postMessage\([^)]*,\s*"\*"\)/);
    // The address is the instance's own sign-in address, as it is reached from here.
    const shell = readFileSync(new URL("../src/shell/main.ts", import.meta.url), "utf8");
    expect(shell).toContain('const SIGN_IN = new URL(INSTANCE.signer ?? "https://bitlogin.network/").origin;');
    expect(shell).toContain("void toLocal(`${SIGN_IN}/`)");
    // Shown only at a press, and only for a place that may be in the frame.
    expect(shell).toContain("if (!panel || panel.open || !pressed()) return;");
    expect(shell).toContain("void (asker === location.origin ? Promise.resolve(true) : mayShow(asker)).then((may) => {");
    // No other file of BitPortal's makes a frame of the sign-in address's pages with an interface.
    const src = new URL("../src/", import.meta.url);
    for (const file of readdirSync(src, { recursive: true }).filter((f) => /\.(ts|html)$/.test(f) && !/shell[\\/]panel\.ts$/.test(f))) expect(readFileSync(new URL(file, src), "utf8"), file).not.toContain("/connect/panel");
  });
  it("leaves the Airlock waiting on nobody: it reads this browser's own note, and loads nothing from the sign-in address to do it", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const airlock = readFileSync(new URL("../src/go/airlock.ts", import.meta.url), "utf8");
    expect(airlock).toContain("knownSignedIn()");
    expect(airlock).not.toContain("readSignedIn");
  });
});

describe("who says who a visitor is, at a world (NSWP-10, A pass from the signer)", () => {
  it("is their sign-in address, where this host names one: the Airlock sends no pass", () => {
    expect(INSTANCE.signer).toBe("https://bitlogin.network/");
    expect(sendsPass()).toBe(false);
    // A host that names none vouches for its visitors at each door, as before.
    expect(sendsPass({})).toBe(true);
  });

  it("holds in the Airlock: going by name is offered, and a pass signed, only where one is sent", async () => {
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const airlock = readFileSync(new URL("../src/go/airlock.ts", import.meta.url), "utf8");
    expect(airlock).toContain("const signsThere = !sendsPass();");
    expect(airlock).toContain("const canName = !!who && verified && !signsThere;");
    // The one place a pass is signed is behind that.
    expect(airlock.match(/issuePass\(/g)).toHaveLength(1);
    expect(airlock).toContain('if (how === "name" && who && canName) {');
  });
});
