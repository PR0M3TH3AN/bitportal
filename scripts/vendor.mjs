// Vendors BitPortal's dependencies from sibling checkouts, and records exactly
// what was taken (BitBlocks convention D7: pin a build, record its hash).
//
//   npm run vendor          rebuild vendor/ from ../<repo> checkouts
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

// --- NSWP core: one ESM file plus type declarations -------------------------
{
  const repo = join(siblings, "Nostr-Spatial-Web-Protocol--NSWP-");
  const src = sourceInfo(repo);
  const out = join(root, "vendor", "nswp");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const esbuild = join(repo, "node_modules", ".bin", "esbuild");
  const tsc = join(repo, "node_modules", ".bin", "tsc");
  if (!existsSync(esbuild)) throw new Error(`run npm install in ${repo} first`);
  execFileSync(esbuild, [join(repo, "packages/core/src/index.ts"), "--bundle", "--format=esm", "--target=es2022", `--outfile=${join(out, "nswp-core.js")}`, "--legal-comments=inline", "--log-level=warning"], { stdio: "inherit" });
  execFileSync(tsc, ["-p", join(repo, "packages/core"), "--emitDeclarationOnly", "--declaration", "--outDir", join(out, "types")], { stdio: "inherit" });
  // The SDK's Three.js presence (avatars, voice, room controls). Core and three
  // stay external so BitPortal's own build supplies one copy of each.
  execFileSync(esbuild, [join(repo, "packages/sdk/src/three.ts"), "--bundle", "--format=esm", "--target=es2022", "--external:@nswp/core", "--external:three", `--outfile=${join(out, "nswp-sdk-three.js")}`, "--legal-comments=inline", "--log-level=warning"], { stdio: "inherit" });
  execFileSync(tsc, ["-p", join(repo, "packages/sdk"), "--noEmit", "false", "--emitDeclarationOnly", "--declaration", "--rootDir", join(repo, "packages/sdk/src"), "--outDir", join(out, "sdk-types")], { stdio: "inherit" });
  const version = JSON.parse(readFileSync(join(repo, "packages/core/package.json"), "utf8")).version;
  packages["@nswp/core"] = { path: "vendor/nswp", version, license: "MIT", source: src, files: hashDir(out) };
}

// --- BitFeed: the standalone single-file build -----------------------------
{
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

// --- Fonts: the BitBlocks family typefaces ----------------------------------
{
  const repo = join(siblings, "bitblocks");
  const src = sourceInfo(repo);
  const out = join(root, "public", "fonts");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const f of ["UbuntuSans-var.woff2", "UbuntuSansMono-var.woff2"]) cpSync(join(repo, "assets", "fonts", f), join(out, f));
  packages["bitblocks-fonts"] = { path: "public/fonts", license: "Ubuntu Font Licence 1.0", source: src, files: hashDir(out) };
}

writeFileSync(manifestPath, `${JSON.stringify({ note: "Generated by scripts/vendor.mjs. Do not edit by hand.", packages }, null, 2)}\n`);
for (const [name, p] of Object.entries(packages)) console.log(`vendored ${name} @ ${p.source.commit.slice(0, 7)} (${Object.keys(p.files).length} files)`);
