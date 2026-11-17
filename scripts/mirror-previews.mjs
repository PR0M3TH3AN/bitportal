// Mirrors the starter set's previews onto BitPortal's own site (NSWP spec §5.8).
//
//   npm run previews          copy and check every preview the starter set names
//   npm run previews:check    verify the mirrored files still match their hashes
//
// A lobby must not fetch a preview from the world's own server while the world
// is merely listed (§5.7), so BitPortal serves a copy itself, named by its
// SHA-256. Each copy is checked against the hash in the world's signed
// announcement before it is kept; the visitor's browser checks it again.
//
// The reference worlds' previews are taken from the sibling NSWP checkout when
// it has them. Anything else is downloaded from the address in the
// announcement. That download happens here, on the maintainer's machine, when
// this script is run. It never happens in a visitor's browser.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkPreviewBytes, parseWorldEvent, verifyEvent } from "../vendor/nswp/nswp-core.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "previews");
const indexPath = join(root, "src", "starter", "previews.json");
const sibling = join(root, "..", "Nostr-Spatial-Web-Protocol--NSWP-", "sites", "previews");
const check = process.argv.includes("--check");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Only formats a browser can draw from a blob. The first bytes decide, not the address. */
function sniff(bytes) {
  const b = Buffer.from(bytes.subarray(0, 12));
  if (b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return { ext: "webp", mime: "image/webp" };
  if (b[0] === 0xff && b[1] === 0xd8) return { ext: "jpg", mime: "image/jpeg" };
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", mime: "image/png" };
  return null;
}

if (check) {
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  let bad = 0;
  for (const [hash, entry] of Object.entries(index)) {
    const path = join(outDir, entry.file);
    if (!existsSync(path) || sha256(readFileSync(path)) !== hash) {
      console.error(`MISMATCH public/previews/${entry.file}`);
      bad++;
    }
  }
  for (const f of existsSync(outDir) ? readdirSync(outDir) : []) {
    if (!Object.values(index).some((e) => e.file === f)) {
      console.error(`UNLISTED public/previews/${f}`);
      bad++;
    }
  }
  if (bad) process.exit(1);
  console.log(`previews ok: ${Object.keys(index).length} mirrored files match their hashes`);
  process.exit(0);
}

const bundle = JSON.parse(readFileSync(join(root, "src", "starter", "starter-set.json"), "utf8"));
mkdirSync(outDir, { recursive: true });
const index = {};
for (const event of bundle.worlds) {
  if (!verifyEvent(event)) throw new Error(`bad signature on ${event.id}`);
  const parsed = parseWorldEvent(event);
  if (!parsed.ok) continue;
  const world = parsed.value;
  for (const preview of world.previews) {
    let bytes;
    const local = join(sibling, `${preview.sha256}.webp`);
    if (existsSync(local)) bytes = new Uint8Array(readFileSync(local));
    else {
      console.log(`downloading ${preview.url}`);
      const res = await fetch(preview.url, { redirect: "error" });
      if (!res.ok) {
        console.warn(`  skipped: ${world.title} (HTTP ${res.status})`);
        continue;
      }
      bytes = new Uint8Array(await res.arrayBuffer());
    }
    const result = checkPreviewBytes(preview, bytes);
    if (!result.ok) {
      console.warn(`  skipped: ${world.title} (${result.code})`);
      continue;
    }
    const kind = sniff(bytes);
    if (!kind) {
      console.warn(`  skipped: ${world.title} (not a WebP, JPEG or PNG)`);
      continue;
    }
    const file = `${preview.sha256}.${kind.ext}`;
    writeFileSync(join(outDir, file), bytes);
    index[preview.sha256] = { file, mime: kind.mime, bytes: bytes.length, world: world.title };
    console.log(`mirrored ${world.title}: ${preview.type}, ${bytes.length} bytes`);
  }
}
for (const f of readdirSync(outDir)) if (!Object.values(index).some((e) => e.file === f)) rmSync(join(outDir, f));
writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`${Object.keys(index).length} previews mirrored to public/previews/`);
