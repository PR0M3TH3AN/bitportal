// Vendors BitPortal's dependencies from sibling checkouts, and records exactly
// what was taken (BitBlocks convention D7: pin a build, record its hash).
//
//   npm run vendor          rebuild vendor/ from ../<repo> checkouts
//   npm run vendor -- --only nswp   one of them, leaving the others as recorded
//   npm run vendor:check    verify vendor/ still matches vendor/integrity.json
//
// Vendored files are committed, so BitPortal builds without the sibling repos.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siblings = join(root, "..");
const manifestPath = join(root, "vendor", "integrity.json");
const check = process.argv.includes("--check");

const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const git = (repo, ...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();

function listFiles(dir, base = dir) {
  return readdirSync(dir)
    .flatMap((name) => {
      const p = join(dir, name);
      return statSync(p).isDirectory() ? listFiles(p, base) : [relative(base, p)];
    })
    .sort();
}

function hashDir(dir) {
  return Object.fromEntries(listFiles(dir).map((f) => [f, sha256(join(dir, f))]));
}

function sourceInfo(repo) {
  const dirty = git(repo, "status", "--porcelain") !== "";
  if (dirty) throw new Error(`${repo} has uncommitted changes; vendor only from a clean checkout`);
  return { commit: git(repo, "rev-parse", "HEAD"), remote: git(repo, "remote", "get-url", "origin") };
}

if (check) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  let bad = 0;
  for (const [name, entry] of Object.entries(manifest.packages)) {
    const dir = join(root, entry.path);
    const actual = hashDir(dir);
    for (const f of new Set([...Object.keys(actual), ...Object.keys(entry.files)])) {
      if (actual[f] !== entry.files[f]) {
        console.error(`MISMATCH ${name}: ${entry.path}/${f}`);
        bad++;
      }
    }
  }
  if (bad) {
    console.error("Vendored files differ from vendor/integrity.json. Re-run `npm run vendor` or restore them.");
    process.exit(1);
  }
  console.log(`vendor ok: ${Object.keys(manifest.packages).length} packages match integrity.json`);
  process.exit(0);
}

const packages = {};
// `--only <name>` takes one of them afresh (nswp, bitfeed, bitlogin, fonts, bitgate) and leaves the rest exactly as they
// were recorded. So one block can be brought up to date while another's checkout has work in progress: nothing is
// ever taken from a checkout with uncommitted changes, and what isn't taken isn't touched.
const onlyAt = process.argv.indexOf("--only");
const only = onlyAt >= 0 ? process.argv[onlyAt + 1] : null;
if (onlyAt >= 0 && !["nswp", "bitfeed", "bitlogin", "fonts", "bitgate"].includes(only)) throw new Error("--only takes one of: nswp, bitfeed, bitlogin, fonts, bitgate");
const recorded = only ? JSON.parse(readFileSync(manifestPath, "utf8")).packages : {};
function take(name, key) {
  if (!only || only === name) return true;
  if (!recorded[key]) throw new Error(`${key} has never been vendored, so it can't be left as it was; run without --only`);
  packages[key] = recorded[key];
  return false;
}

// --- NSWP core: one ESM file plus type declarations -------------------------
if (take("nswp", "@nswp/core")) {
  // Beside this repo, or wherever NSWP_CHECKOUT says (a clean clone at the commit a kit version was cut from, when
  // the checkout beside this one has moved on or has work in progress). Whichever it is, it is taken the same way.
  const repo = process.env.NSWP_CHECKOUT || join(siblings, "Nostr-Spatial-Web-Protocol--NSWP-");
  const src = sourceInfo(repo);
  const out = join(root, "vendor", "nswp");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const esbuild = join(repo, "node_modules", ".bin", "esbuild");
  const tsc = join(repo, "node_modules", ".bin", "tsc");
  if (!existsSync(esbuild)) throw new Error(`run npm install in ${repo} first`);
  // Run from the kit's own folder: a bundle names each source file in a comment, by its path from where the bundler
  // ran. From there the names are the same wherever the checkout is, so the same commit gives the same bytes.
  execFileSync(esbuild, [join(repo, "packages/core/src/index.ts"), "--bundle", "--format=esm", "--target=es2022", `--outfile=${join(out, "nswp-core.js")}`, "--legal-comments=inline", "--log-level=warning"], { stdio: "inherit", cwd: repo });
  execFileSync(tsc, ["-p", join(repo, "packages/core"), "--emitDeclarationOnly", "--declaration", "--outDir", join(out, "types")], { stdio: "inherit" });
  // The SDK's Three.js parts: presence (avatars, voice, room controls), the
  // home renderer, and the terminal panel (with its emulator, which only the
  // room loads, and only when a terminal is opened). Built together so they share one copy of what both use.
  // Core and three stay external so BitPortal's own build supplies one of each.
  // With them, the visitor's menu as a client carries it (`nswp-sdk/menu`: the page that keeps the screen draws it
  // above a framed world) and a world's end of that (`nswp-sdk/menu-above`: what this site's own pages say to it).
  // Neither loads Three.js. Nor does the visitor's Bag for such a page (`nswp-sdk/bag`, the kit's bag-entry.ts).
  execFileSync(esbuild, [join(repo, "packages/sdk/src/three.ts"), join(repo, "packages/sdk/src/home.ts"), join(repo, "packages/sdk/src/ui.ts"), join(repo, "packages/sdk/src/terminal.ts"), join(repo, "packages/sdk/src/menu.ts"), join(repo, "packages/sdk/src/menu-above.ts"), join(repo, "packages/sdk/src/bag-entry.ts"), "--bundle", "--splitting", "--format=esm", "--target=es2022", "--external:@nswp/core", "--external:three", `--outdir=${join(out, "sdk")}`, "--chunk-names=shared-[hash]", "--legal-comments=inline", "--log-level=warning"], { stdio: "inherit", cwd: repo });
  execFileSync(tsc, ["-p", join(repo, "packages/sdk"), "--noEmit", "false", "--emitDeclarationOnly", "--declaration", "--rootDir", join(repo, "packages/sdk/src"), "--outDir", join(out, "sdk-types")], { stdio: "inherit" });
  // Its licence, and the notices for the libraries built into these files, travel with them.
  for (const name of ["LICENSE", "THIRD-PARTY-NOTICES.md"]) cpSync(join(repo, name), join(out, name));
  // How to make a world: the kit's one starting document, which BitPortal shows at /start/ and serves at /start.md.
  mkdirSync(join(out, "docs"), { recursive: true });
  cpSync(join(repo, "docs", "start.md"), join(out, "docs", "start.md"));
  // The sounds every place starts with: recorded cues and a room's hum, with a note of where each came from.
  cpSync(join(repo, "packages", "sdk", "sounds"), join(out, "sounds"), { recursive: true });
  const version = JSON.parse(readFileSync(join(repo, "packages/core/package.json"), "utf8")).version;
  packages["@nswp/core"] = { path: "vendor/nswp", version, license: "MIT", source: src, files: hashDir(out) };
}

// --- BitFeed: the standalone single-file build -----------------------------
if (take("bitfeed", "bitfeed")) {
  const repo = join(siblings, "BitFeed");
  const src = sourceInfo(repo);
  const dist = join(repo, "packages", "standalone", "dist");
  const upstream = JSON.parse(readFileSync(join(dist, "integrity.json"), "utf8"));
  const out = join(root, "vendor", "bitfeed");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  cpSync(join(dist, "bitfeed.js"), join(out, "bitfeed.js"));
  cpSync(join(repo, "LICENSE"), join(out, "LICENSE"));
  const sri = `sha384-${createHash("sha384").update(readFileSync(join(out, "bitfeed.js"))).digest("base64")}`;
  if (sri !== upstream.artifacts["bitfeed.js"]) throw new Error("BitFeed dist/bitfeed.js does not match its own integrity.json; rebuild BitFeed's standalone bundle");
  packages["bitfeed"] = { path: "vendor/bitfeed", version: upstream.version, license: "MIT", source: src, sri, files: hashDir(out) };
}

// --- BitLogin: the sign-in widget, served as static same-origin files ---------
// The widget finds its worker and chunks relative to its own URL, so the files
// are deployed side by side under /vendor/bitlogin/ and never bundled. It runs
// same-origin with BitPortal, so it is part of what BitPortal must trust: the
// copy is checked against BitLogin's own integrity manifest before it is taken.
if (take("bitlogin", "@bitlogin/widget")) {
  // Beside this repo, or wherever BITLOGIN_CHECKOUT says: someone may be working in the checkout beside this one,
  // and a copy is only ever taken from a clean checkout at the commit its release was built from. Whichever it
  // is, everything below is checked the same way.
  const repo = process.env.BITLOGIN_CHECKOUT || join(siblings, "bitlogin");
  const src = sourceInfo(repo);
  const version = JSON.parse(readFileSync(join(repo, "packages/widget/package.json"), "utf8")).version;
  const rel = join(repo, "release", `bitlogin-widget-v${version}`);
  if (!existsSync(join(rel, "integrity.json"))) throw new Error(`run \`npm run release:artifacts\` in ${repo} first`);
  const upstream = JSON.parse(readFileSync(join(rel, "integrity.json"), "utf8"));
  if (upstream.commit !== src.commit) throw new Error("BitLogin's release folder was built from a different commit than its checkout; re-run its release:artifacts");
  const out = join(root, "public", "vendor", "bitlogin");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const [name, f] of Object.entries(upstream.files)) {
    if (sha256(join(rel, name)) !== f.sha256) throw new Error(`BitLogin ${name} does not match its integrity manifest`);
    cpSync(join(rel, name), join(out, name));
  }
  for (const name of ["LICENSE", "integrity.json"]) cpSync(join(rel, name), join(out, name));
  packages["@bitlogin/widget"] = { path: "public/vendor/bitlogin", version, license: "MIT", source: src, files: hashDir(out) };
}

// --- Fonts: the BitBlocks family typefaces ----------------------------------
if (take("fonts", "bitblocks-fonts")) {
  const repo = join(siblings, "bitblocks");
  const src = sourceInfo(repo);
  const out = join(root, "public", "fonts");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const f of ["UbuntuSans-var.woff2", "UbuntuSansMono-var.woff2"]) cpSync(join(repo, "assets", "fonts", f), join(out, f));
  // The Ubuntu Font Licence asks for its text to go wherever the fonts go.
  writeFileSync(
    join(out, "LICENCE.txt"),
    `Ubuntu Sans and Ubuntu Sans Mono, in WOFF2 form.\nCopyright Canonical Ltd. https://design.ubuntu.com/font\nLicensed under the Ubuntu Font Licence 1.0, which follows.\n\n${readFileSync(join(root, "scripts", "licences", "ubuntu-font-licence-1.0.txt"), "utf8")}`,
  );
  packages["bitblocks-fonts"] = { path: "public/fonts", license: "Ubuntu Font Licence 1.0", source: src, files: hashDir(out) };
}

// --- BitGate: its readers, for the operator's shadow comparison (scripts/shadow-bitgate.mjs) only ----------------
// Nothing BitPortal serves uses it. Built from BitGate's committed tree at a pinned commit, read with `git archive`,
// which changes nothing in its checkout: that checkout is BitGate's session's, read only, and its working files may
// be mid-edit. BITGATE_COMMIT takes a newer commit; it must contain ace04a7 (the readers the shadow plan names).
const BITGATE_COMMIT = process.env.BITGATE_COMMIT || "2220c95ebb70fadae746f0c88a482cafb92f9d32";
if (take("bitgate", "@bitgate/readers")) {
  const repo = join(siblings, "bitgate");
  const commit = git(repo, "rev-parse", "--verify", `${BITGATE_COMMIT}^{commit}`);
  try {
    git(repo, "merge-base", "--is-ancestor", "ace04a7", commit);
  } catch {
    throw new Error(`BitGate ${commit.slice(0, 7)} doesn't contain ace04a7; vendor a newer commit`);
  }
  const tree = join(root, "vendor", ".bitgate-tree");
  rmSync(tree, { recursive: true, force: true });
  mkdirSync(tree, { recursive: true });
  const archive = execFileSync("git", ["-C", repo, "archive", "--format=tar", commit, "LICENSE", "packages/core/src", "packages/core/package.json", "packages/nostr/src"], { maxBuffer: 64 * 1024 * 1024 });
  execFileSync("tar", ["-x", "-C", tree], { input: archive });
  const out = join(root, "vendor", "bitgate");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const esbuild = join(root, "node_modules", ".bin", "esbuild");
  execFileSync(esbuild, [join(tree, "packages/core/src/index.js"), "--bundle", "--format=esm", "--target=es2022", `--outfile=${join(out, "core.js")}`, "--legal-comments=inline", "--log-level=warning"], { stdio: "inherit" });
  // The readers, sharing that one copy of the core.
  execFileSync(esbuild, [join(tree, "packages/nostr/src/index.js"), "--bundle", "--format=esm", "--target=es2022", "--external:@bitgate/core", `--outfile=${join(out, "nostr.js")}`, "--legal-comments=inline", "--log-level=warning"], { stdio: "inherit" });
  cpSync(join(tree, "LICENSE"), join(out, "LICENSE"));
  const version = JSON.parse(readFileSync(join(tree, "packages/core/package.json"), "utf8")).version;
  rmSync(tree, { recursive: true, force: true });
  packages["@bitgate/readers"] = { path: "vendor/bitgate", version, license: "MIT", source: { commit, remote: git(repo, "remote", "get-url", "origin") }, files: hashDir(out) };
}

writeFileSync(manifestPath, `${JSON.stringify({ note: "Generated by scripts/vendor.mjs. Do not edit by hand.", packages }, null, 2)}\n`);
for (const [name, p] of Object.entries(packages)) console.log(`${only && recorded[name] === p ? "left as it was" : "vendored"} ${name} @ ${p.source.commit.slice(0, 7)} (${Object.keys(p.files).length} files)`);
