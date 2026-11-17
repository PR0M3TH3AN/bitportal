// Builds BitPortal into dist/ as plain static files.
import { build } from "esbuild";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

await build({
  entryPoints: {
    lobby: join(root, "src/lobby/main.ts"),
    "feed-worker": join(root, "src/lobby/feed-worker.ts"),
    "go/airlock": join(root, "src/go/airlock.ts"),
    "walk/main": join(root, "src/walk/main.ts"),
    "account/main": join(root, "src/account/main.ts"),
    "publish/main": join(root, "src/publish/main.ts"),
  },
  bundle: true,
  splitting: true, // keeps the headset emulator out of the page until asked for
  chunkNames: "chunks/[name]-[hash]",
  format: "esm",
  target: "es2022",
  minify: true,
  outdir: out,
  // BitLogin is served as its own static files and loaded by URL at run time.
  external: ["/vendor/bitlogin/*"],
  legalComments: "linked",
  logLevel: "warning",
  alias: {
    "@nswp/core": join(root, "vendor/nswp/nswp-core.js"),
    bitfeed: join(root, "vendor/bitfeed/bitfeed.js"),
    "nswp-sdk/three": join(root, "vendor/nswp/nswp-sdk-three.js"),
  },
});

cpSync(join(root, "public"), out, { recursive: true });
cpSync(join(root, "src/lobby/index.html"), join(out, "index.html"));
cpSync(join(root, "src/go/index.html"), join(out, "go/index.html"));
cpSync(join(root, "src/walk/index.html"), join(out, "walk/index.html"));
for (const page of ["account", "publish"]) {
  mkdirSync(join(out, page), { recursive: true });
  cpSync(join(root, `src/${page}/index.html`), join(out, page, "index.html"));
}

// Everything is same-origin except what the visitor asks for: relays (wss)
// and, on opening a door or at the Airlock, a world's manifest (https).
const csp = [
  "default-src 'self'",
  // BitLogin hashes passwords with Argon2 compiled to WebAssembly in its worker.
  "script-src 'self' 'wasm-unsafe-eval'",
  "worker-src 'self'",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob: mediastream:",
  "connect-src 'self' https: wss:",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");
writeFileSync(
  join(out, "vercel.json"),
  `${JSON.stringify(
    {
      cleanUrls: true,
      trailingSlash: true,
      headers: [
        {
          source: "/(.*)",
          headers: [
            { key: "Content-Security-Policy", value: csp },
            { key: "Referrer-Policy", value: "no-referrer" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Permissions-Policy", value: "xr-spatial-tracking=(self), microphone=(self), camera=(), geolocation=()" },
          ],
        },
        { source: "/fonts/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      ],
    },
    null,
    2,
  )}\n`,
);
console.log(`built dist/ (BitPortal ${pkg.version})`);
