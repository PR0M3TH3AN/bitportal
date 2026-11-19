// Tries every world in the starter set on a phone-sized touch screen, at a desk and with a made-up headset, and
// writes down what was found (src/starter/checked.json). The Airlock tells a visitor what this copy found before
// what a world's maker says (src/shared/fit.ts).
//
//   npm run probe                 every world in the starter set
//   npm run probe -- tour grove   only the worlds whose address has one of these words in it
//
// The trying is done by the NSWP repository's probe (scripts/probe-world.mjs there), which needs to be checked out
// beside this one with its dependencies installed, and Chrome on this machine. It visits each world's address as
// any browser would. A form it couldn't confirm either way is left out: a world is never called broken for
// something only a software renderer or a made-up headset might get wrong.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const probe = join(root, "..", "Nostr-Spatial-Web-Protocol--NSWP-", "scripts", "probe-world.mjs");
if (!existsSync(probe)) {
  console.error(`The probe isn't there: ${probe}. Check the NSWP repository out beside this one.`);
  process.exit(1);
}
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const file = join(root, "src", "starter", "checked.json");
const kept = JSON.parse(readFileSync(file, "utf8"));
const bundle = JSON.parse(readFileSync(join(root, "src", "starter", "starter-set.json"), "utf8"));
const tag = (event, name) => event.tags.find((t) => t[0] === name)?.[1];
const worlds = bundle.worlds
  .map((event) => ({ id: `${event.kind}:${event.pubkey}:${tag(event, "d")}`, url: tag(event, "r") ?? tag(event, "url") ?? "" }))
  .filter((w) => /^https:\/\//.test(w.url) && (!only.length || only.some((word) => w.url.includes(word))));
if (!worlds.length) {
  console.error("No worlds to try.");
  process.exit(1);
}
for (const world of worlds) {
  process.stdout.write(`${world.url} `);
  let entry;
  try {
    entry = JSON.parse(execFileSync(process.execPath, [probe, "--json", world.url], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, timeout: 240000 }))[0];
  } catch (e) {
    console.log(`couldn't be tried: ${String(e.message ?? e).split("\n")[0].slice(0, 100)}`);
    continue;
  }
  const found = { at: entry.at };
  for (const form of ["phone", "desk", "headset"]) if (entry[form]) found[form] = entry[form];
  kept.worlds[world.id] = found;
  console.log(["phone", "desk", "headset"].map((f) => `${f}: ${entry[f] ?? "not confirmed"}`).join(", "));
}
writeFileSync(file, `${JSON.stringify(kept, null, 2)}\n`);
console.log(`wrote ${file}`);
