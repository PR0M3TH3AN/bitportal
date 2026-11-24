// Builds BitPortal into dist/ as plain static files.
import { build } from "esbuild";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

// One version number everywhere (BitBlocks convention D6).
const versionFile = readFileSync(join(root, "src/shared/version.ts"), "utf8");
if (!versionFile.includes(`"${pkg.version}"`)) throw new Error("src/shared/version.ts does not match package.json's version");

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "go"), { recursive: true });
mkdirSync(join(out, "walk"), { recursive: true });

// The visitor's menu, drawn by the page that keeps the screen (src/shell/menu.ts), is behind one switch, and the
// switch is off: a site built the ordinary way has a shell that says nothing of a menu to any world, exactly as
// before, and carries none of the menu's code. The menu takes over tabs a world then stops drawing (the Bag among
// them), so it can't go out in parts: main has to be something that can be deployed at any time. It is turned on
// only for a trial's own build, here, by whoever runs the build; never by a visitor, a link or anything a page reads.
// The last change of the client's menu's step 2 turns it on for everyone, on the owner's word.
//
//   BITPORTAL_SHELL_MENU=1 npm run build      a trial's build: never deployed (scripts/check-shell-menu.mjs)
const shellMenu = process.env.BITPORTAL_SHELL_MENU === "1";

const built = await build({
  define: { SHELL_MENU: JSON.stringify(shellMenu) },
  entryPoints: {
    lobby: join(root, "src/lobby/main.ts"),
    landing: join(root, "src/landing/main.ts"),
    "feed-worker": join(root, "src/lobby/feed-worker.ts"),
    "go/airlock": join(root, "src/go/airlock.ts"),
    "walk/main": join(root, "src/walk/main.ts"),
    "account/main": join(root, "src/account/main.ts"),
    "publish/main": join(root, "src/publish/main.ts"),
    "look/main": join(root, "src/look/main.ts"),
    "shell/main": join(root, "src/shell/main.ts"),
    // The visitor's menu, for the page that keeps the screen (src/shell/menu.ts): a file of its own, which that page
    // loads by its address after the frame is on its way. Only where the switch is on.
    ...(shellMenu ? { "shell/menu": join(root, "src/shell/menu.ts") } : {}),
    // The page that draws the things in the visitor's Bag for that menu (src/shell/pictures/main.ts): it has the
    // renderer, which the menu's own page never loads, and is framed by it unseen. Only where the switch is on.
    ...(shellMenu ? { "shell/pictures/main": join(root, "src/shell/pictures/main.ts") } : {}),
  },
  bundle: true,
  splitting: true, // keeps the headset emulator out of the page until asked for
  chunkNames: "chunks/[name]-[hash]",
  format: "esm",
  target: "es2022",
  minify: true,
  outdir: out,
  // BitLogin is served as its own static files and loaded by URL at run time.
  // And the shell's menu, where a build has it, is a file of its own (an entry above), loaded by its address.
  external: ["/vendor/bitlogin/*", "/shell/menu.js"],
  legalComments: "linked",
  logLevel: "warning",
  metafile: true,
  alias: {
    "@nswp/core": join(root, "vendor/nswp/nswp-core.js"),
    bitfeed: join(root, "vendor/bitfeed/bitfeed.js"),
    "nswp-sdk/three": join(root, "vendor/nswp/sdk/three.js"),
    "nswp-sdk/home": join(root, "vendor/nswp/sdk/home.js"),
    "nswp-sdk/ui": join(root, "vendor/nswp/sdk/ui.js"),
    "nswp-sdk/terminal": join(root, "vendor/nswp/sdk/terminal.js"),
    "nswp-sdk/menu": join(root, "vendor/nswp/sdk/menu.js"),
    "nswp-sdk/menu-above": join(root, "vendor/nswp/sdk/menu-above.js"),
    // What the shell's first file says of the visitor's settings: the reader where the menu is on, nothing where
    // it is off (src/shell/settings-off.ts says why).
    "shell-first-settings": join(root, shellMenu ? "src/shell/settings.ts" : "src/shell/settings-off.ts"),
    "nswp-sdk/bag": join(root, "vendor/nswp/sdk/bag-entry.js"),
  },
});

// The menu's file is built with the rest, so what it shares with the shell's first file (the kit's core, above all)
// is loaded once. Built by itself it carried its own copy of the core: 184 KB of 356, measured. It was built by
// itself because, split with the room, it once shared a file with it that names the renderer, and the page that
// only frames a world then loaded all of Three.js to draw a menu (610 KB, measured). So that is checked here every
// time, over everything the menu's file loads as it starts: no part of the renderer, or the build stops.
if (shellMenu) {
  const outputs = built.metafile.outputs;
  const start = Object.keys(outputs).find((f) => f.endsWith("dist/shell/menu.js"));
  if (!start) throw new Error("The shell's menu was not built as dist/shell/menu.js");
  const loaded = new Set();
  const follow = (f) => {
    if (loaded.has(f) || !outputs[f]) return;
    loaded.add(f);
    for (const i of outputs[f].imports) if (i.kind === "import-statement" && !i.external) follow(i.path);
  };
  follow(start);
  const three = [...loaded].flatMap((f) => Object.entries(outputs[f].inputs).filter(([src, part]) => src.includes("node_modules/three/") && part.bytesInOutput > 0).map(([src]) => `${src} (in ${f})`));
  if (three.length) throw new Error(`The shell's menu must not load the renderer, and now does: ${three.slice(0, 3).join(", ")}`);
}

cpSync(join(root, "public"), out, { recursive: true });
// The kit's own sounds, served from this site like everything else: nothing is fetched from anywhere else.
cpSync(join(root, "vendor/nswp/sounds"), join(out, "sounds/kit"), { recursive: true, filter: (f) => !/\.md$/.test(f) });
// The front page is the way in, and only that (landing-01, the owner's "keeping users on the landing is not
// necessary"). The lobby has a page of its own: every door as a list, search, lists, Settings, announcing a world.
cpSync(join(root, "src/landing/index.html"), join(out, "index.html"));
mkdirSync(join(out, "doors"), { recursive: true });
cpSync(join(root, "src/lobby/index.html"), join(out, "doors/index.html"));
// How to make a world (landing-02): the kit's own docs/start.md, vendored, shown as a page for a person and served as
// it is for an agent. One text, written once, in the kit: never a copy of BitPortal's own that could drift.
const startDoc = join(root, "vendor/nswp/docs/start.md");
if (existsSync(startDoc)) {
  const { markdownToHtml } = await import("./markdown.mjs");
  const text = readFileSync(startDoc, "utf8");
  cpSync(startDoc, join(out, "start.md"));
  mkdirSync(join(out, "start"), { recursive: true });
  writeFileSync(join(out, "start/index.html"), readFileSync(join(root, "src/start/index.html"), "utf8").replace("<!-- doc -->", markdownToHtml(text)));
} else console.warn("No vendor/nswp/docs/start.md yet: /start/ is not built. `npm run vendor -- --only nswp` brings it.");
cpSync(join(root, "src/go/index.html"), join(out, "go/index.html"));
// The kit's locked box, as the kit writes it, for the room (the owner's decision is in AGENTS.md, "Items").
const { ITEM_BOX_HTML, ITEM_BOX_CSP } = await import(join(root, "vendor/nswp/nswp-core.js"));
mkdirSync(join(out, "item-box"), { recursive: true });
writeFileSync(join(out, "item-box/index.html"), ITEM_BOX_HTML);
cpSync(join(root, "src/walk/index.html"), join(out, "walk/index.html"));
for (const page of ["account", "publish", "look", "shell"]) {
  mkdirSync(join(out, page), { recursive: true });
  cpSync(join(root, `src/${page}/index.html`), join(out, page, "index.html"));
}

if (shellMenu) {
  mkdirSync(join(out, "shell/pictures"), { recursive: true });
  cpSync(join(root, "src/shell/pictures/index.html"), join(out, "shell/pictures/index.html"));
}

// Everything is same-origin except what the visitor asks for: relays (wss)
// and, on opening a door or at the Airlock, a world's manifest (https).
// The one other site a page of BitPortal may embed: the sign-in address, whose signer runs unseen in a frame and
// signs what the visitor allowed in that address's own window (src/shared/session.ts). It is read from the
// instance's own settings, so the two can't drift; a test pins that nothing else is ever named here.
const instance = readFileSync(join(root, "src/shared/instance.ts"), "utf8");
const named = /^\s*signer:\s*"(https:\/\/[^"]+)"/m.exec(instance)?.[1] ?? "https://bitlogin.network/";
const signInOrigin = new URL(named).origin;
/**
 * A page's content rules. Every page of BitPortal may embed the one sign-in address and nothing else, and may be
 * embedded by nobody: with two exceptions, both for the page that keeps the screen filled from world to world
 * (src/shared/shell.ts; on the owner's word of 2026-11-20; the way in at a desk since 2026-11-21).
 *
 * - `/shell/` may also frame this site's own room and Airlock, and the worlds named in `shell-worlds.json`: each
 *   of which says, in its own rules, that BitPortal may frame it. Nothing else, and never `https:`.
 * - `/walk/` and `/go/` may be framed by this site itself, which is `/shell/` framing them. By nobody else.
 */
const shellWorlds = JSON.parse(readFileSync(join(root, "src/shared/shell-worlds.json"), "utf8"));
if (!Array.isArray(shellWorlds) || shellWorlds.some((o) => typeof o !== "string" || new URL(o).origin !== o || !o.startsWith("https://"))) throw new Error("src/shared/shell-worlds.json must be a list of https origins, each written as an origin and nothing more.");
const rulesFor = ({ frames = [], framedBy = "'none'" } = {}) =>
  [
    "default-src 'self'",
    // No page of BitPortal runs WebAssembly or takes a password: signing in is done at the sign-in address.
    "script-src 'self'",
    "worker-src 'self'",
    `frame-src ${[...frames, signInOrigin].join(" ")}`,
    "style-src 'self'",
    "font-src 'self'",
    "img-src 'self' data: blob:",
    "media-src 'self' blob: mediastream:",
    "connect-src 'self' https: wss:",
    "base-uri 'none'",
    "form-action 'none'",
    `frame-ancestors ${framedBy}`,
  ].join("; ");
const csp = rulesFor();
const cspFramed = rulesFor({ framedBy: "'self'" });
// The room alone frames a page of this site: the kit's locked box, where what an item does of its own runs, with
// nothing to reach (`ITEM_BOX_CSP`). Nothing else of BitPortal's is ever framed by it.
const cspRoom = rulesFor({ frames: ["'self'"], framedBy: "'self'" });
const cspShell = rulesFor({ frames: ["'self'", ...shellWorlds] });
// The page that keeps the screen is trusted by name by the sign-in address, and draws the visitor's menu over other
// people's worlds. Its rules are written out here a second time, word for word, and the build stops if what
// `rulesFor` made differs: a change to the rules every page shares can't loosen this page's without being made here
// too, where it is seen (NSWP docs/plans/the-clients-menu.md, 17.1). Only whom it frames comes from elsewhere: this
// site, the worlds named in shell-worlds.json, and the sign-in address.
const cspShellWritten = `default-src 'self'; script-src 'self'; worker-src 'self'; frame-src 'self' ${[...shellWorlds, signInOrigin].join(" ")}; style-src 'self'; font-src 'self'; img-src 'self' data: blob:; media-src 'self' blob: mediastream:; connect-src 'self' https: wss:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
if (cspShell !== cspShellWritten) throw new Error(`The rules for /shell/ differ from the ones written out for it in scripts/build.mjs.\n  made:    ${cspShell}\n  written: ${cspShellWritten}\nIf the change is meant, it needs the owner's word: that page frames the sign-in address's panel.`);
/**
 * The page that draws the Bag's things for `/shell/` (src/shell/pictures/main.ts), under rules of its own and no
 * others, written out whole. It is framed by this site and nobody else. Its scripts are this site's, and none
 * inline. It frames nothing and starts no worker. It reaches out only for a thing's model, over https (and reads
 * the pictures inside a model it has already been given, which is what `blob:` and `data:` are for): no relay, and
 * nothing of this site's but its own scripts. It may use nothing of the device.
 */
const cspPictures = "default-src 'none'; script-src 'self'; connect-src https: blob: data:; img-src blob: data:; frame-src 'none'; worker-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'";
const picturesGuards = [
  { key: "Content-Security-Policy", value: cspPictures },
  // A maker's host is told nothing of where the visitor is.
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: "xr-spatial-tracking=(), microphone=(), camera=(), geolocation=()" },
];
/** What a page may use, and hand on to what it frames: `/shell/` hands a headset and a microphone to the worlds it may frame, by name. */
const handsOn = (to = []) => `xr-spatial-tracking=(self${to.map((o) => ` "${o}"`).join("")}), microphone=(self${to.map((o) => ` "${o}"`).join("")}), camera=(), geolocation=()`;
/**
 * And `/shell/` alone hands the use and the making of a passkey to the sign-in address, whose panel it shows over
 * the world (src/shell/panel.ts): to that one address. The page has to be named too (`self`), because a browser
 * lets a page hand on only what it may use itself; no page of BitPortal asks for a passkey, here or anywhere.
 */
const passkeysTo = (origin) => `publickey-credentials-get=(self "${origin}"), publickey-credentials-create=(self "${origin}")`;
const guards = (policy, to, passkeys) => [
  { key: "Content-Security-Policy", value: policy },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: passkeys ? `${handsOn(to)}, ${passkeysTo(passkeys)}` : handsOn(to) },
];
writeFileSync(
  join(out, "vercel.json"),
  `${JSON.stringify(
    {
      cleanUrls: true,
      trailingSlash: true,
      // BitPortal's first address sends visitors on to the one it lives at now.
      redirects: [{ source: "/(.*)", has: [{ type: "host", value: "bitportal.vercel.app" }], destination: "https://portal.bitblocks.network/$1", permanent: false }],
      headers: [
        // One set of rules for each path, and no path under two: where two rules set the same header a browser
        // holds a page to both, and the page that frames worlds would be held to the rule that frames none.
        { source: "/((?!(?:walk|go|shell|item-box)(?:/|$)).*)", headers: guards(csp) },
        { source: "/walk(/.*)?", headers: guards(cspRoom) },
        { source: "/go(/.*)?", headers: guards(cspFramed) },
        // The kit's locked box for what an item does of its own, under the kit's own rules and no others: it reaches
        // nothing, and only this site may be above it (the room, and the page that keeps the screen above that).
        { source: "/item-box(/.*)?", headers: [{ key: "Content-Security-Policy", value: ITEM_BOX_CSP }, { key: "Referrer-Policy", value: "no-referrer" }, { key: "X-Content-Type-Options", value: "nosniff" }] },
        // With the menu on, the page that draws the Bag's things is under `/shell/` and has rules of its own: the
        // rule for `/shell/` then leaves that one path out, so that no path is under two. With the menu off there is
        // no such page, and the rule is as it always was.
        { source: shellMenu ? "/shell(/(?!pictures(?:/|$)).*)?" : "/shell(/.*)?", headers: guards(cspShell, shellWorlds, signInOrigin) },
        ...(shellMenu ? [{ source: "/shell/pictures(/.*)?", headers: picturesGuards }] : []),
        // Always the latest (NSWP-09): a browser asks before it uses a copy of a page or a script it kept. Said
        // outright, and not left to the host's habit. Not for the fonts and previews, which have rules of their own.
        { source: "/((?!fonts/|previews/).*)", headers: [{ key: "Cache-Control", value: "no-cache" }] },
        { source: "/fonts/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
        // Mirrored previews are named by their hash, so a file never changes.
        { source: "/previews/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
        // How to make a world, as plain text for an agent (landing-02): read as text by anything that fetches it.
        { source: "/start.md", headers: [{ key: "Content-Type", value: "text/markdown; charset=utf-8" }] },
      ],
    },
    null,
    2,
  )}\n`,
);
// What this build carries, for anyone asking which kit the portal is on (the NSWP repo's `npm run kits`): the
// kit's version and the commits of what was vendored. All of it is public already.
const vendored = JSON.parse(readFileSync(join(root, "vendor/integrity.json"), "utf8")).packages;
const kit = /KIT_VERSION = "([^"]+)"/.exec(readFileSync(join(root, "vendor/nswp/nswp-core.js"), "utf8"))?.[1] ?? null;
writeFileSync(
  join(out, "version.json"),
  `${JSON.stringify({ bitportal: pkg.version, kit, nswp: vendored["@nswp/core"]?.source?.commit ?? null, bitlogin: vendored["@bitlogin/widget"]?.source?.commit ?? null }, null, 1)}\n`,
);
// Every page is marked with the kit, this BitPortal and everything it is served with, so that a page changes
// whenever any of them does. A host answers "not modified" for a page whose HTML is the same, and a browser then
// keeps the content rules it first had with that page: a change to the rules above would never reach anyone who
// had been here before (NSWP-09; the kit's `stampPage`).
const { stampPage } = await import(join(root, "vendor/nswp/nswp-core.js"));
const served = readFileSync(join(out, "vercel.json"), "utf8");
const pages = (dir) => readdirSync(dir).flatMap((name) => (statSync(join(dir, name)).isDirectory() ? pages(join(dir, name)) : name.endsWith(".html") ? [join(dir, name)] : []));
for (const page of pages(out)) writeFileSync(page, stampPage(readFileSync(page, "utf8"), `${kit ?? "0"} bitportal ${pkg.version}`, served));
if (shellMenu) console.log("\nThe shell's menu is ON in this build. It is a trial's build and must not be deployed: `npm run deploy` refuses it.\n");
console.log(`built dist/ (BitPortal ${pkg.version})`);
