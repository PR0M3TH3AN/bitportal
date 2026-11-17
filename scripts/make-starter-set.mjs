// Builds and signs src/starter/starter-set.json: the curator's listings for
// existing WebXR sites, the reference worlds' own announcements, and the
// NIP-51 curation set (kind 30004) that puts them in order (spec §5.4, §14).
//
// The curator key stays outside the repo. Default path:
//   ~/.config/nswp/bitportal-curator.key   (override with BITPORTAL_CURATOR_KEY)
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildWorldEvent, coordinate, CURATION_SET_KIND, finalizeEvent, getPublicKey, parseWorldEvent, verifyEvent, WORLD_KIND } from "../vendor/nswp/nswp-core.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bundlePath = join(root, "src/starter/starter-set.json");
const nswpAnnouncements = join(root, "..", "Nostr-Spatial-Web-Protocol--NSWP-", "sites", "announcements");

// --reference-only: take the reference worlds' newest announcements and change
// nothing else. The curator's list and listings stay exactly as signed, so this
// needs no key.
if (process.argv.includes("--reference-only")) {
  const bundle = JSON.parse(readFileSync(bundlePath, "utf8"));
  const names = JSON.parse(readFileSync(join(root, "src/starter/listings.json"), "utf8")).referenceWorlds;
  let changed = 0;
  for (const name of names) {
    const event = JSON.parse(readFileSync(join(nswpAnnouncements, `${name}.event.json`), "utf8"));
    if (!verifyEvent(event)) throw new Error(`${name}: bad signature`);
    const d = event.tags.find((t) => t[0] === "d")[1];
    const i = bundle.worlds.findIndex((w) => w.pubkey === event.pubkey && w.tags.find((t) => t[0] === "d")[1] === d);
    if (i < 0) throw new Error(`${name} is not in the starter set; run without --reference-only to add it`);
    if (bundle.worlds[i].id !== event.id) {
      if (event.created_at < bundle.worlds[i].created_at) throw new Error(`${name}: the announcement on disk is older than the bundled one`);
      bundle.worlds[i] = event;
      changed++;
    }
  }
  writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`);
  console.log(`starter set: ${changed} reference announcement${changed === 1 ? "" : "s"} updated; the curator's list is unchanged`);
  process.exit(0);
}

const keyPath = process.env.BITPORTAL_CURATOR_KEY ?? join(homedir(), ".config", "nswp", "bitportal-curator.key");
const hex = readFileSync(keyPath, "utf8").trim();
if (!/^[0-9a-f]{64}$/.test(hex)) throw new Error(`${keyPath} must hold a 64-character hex key`);
const key = Uint8Array.from(hex.match(/../g).map((b) => parseInt(b, 16)));
const curator = getPublicKey(key);

const input = JSON.parse(readFileSync(join(root, "src/starter/listings.json"), "utf8"));
const now = Math.floor(Date.now() / 1000);
const worlds = [];

// The reference worlds announce themselves; take their published events as they are.
for (const name of input.referenceWorlds) {
  const event = JSON.parse(readFileSync(join(nswpAnnouncements, `${name}.event.json`), "utf8"));
  if (!verifyEvent(event)) throw new Error(`${name}: bad signature`);
  worlds.push(event);
}

for (const l of input.listings) {
  const event = finalizeEvent(buildWorldEvent({ ...l, createdAt: now, description: `${l.summary} Listed by the BitPortal starter set; this site has not announced itself.` }), key);
  const parsed = parseWorldEvent(event, { requireSigned: true });
  if (!parsed.ok) throw new Error(`${l.d}: ${parsed.errors.map((e) => e.message).join(" ")}`);
  worlds.push(event);
}

const set = finalizeEvent(
  {
    kind: CURATION_SET_KIND,
    created_at: now,
    tags: [
      ["d", input.set.d],
      ["title", input.set.title],
      ["description", input.set.description],
      ...worlds.map((w) => ["a", coordinate({ kind: WORLD_KIND, pubkey: w.pubkey, identifier: w.tags.find((t) => t[0] === "d")[1] })]),
    ],
    content: "",
  },
  key,
);

writeFileSync(bundlePath, `${JSON.stringify({ curator, set, worlds }, null, 2)}\n`);
console.log(`starter set signed by ${curator.slice(0, 12)}… with ${worlds.length} worlds`);
