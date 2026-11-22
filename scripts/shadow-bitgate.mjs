// BitGate's shadow comparison, BitPortal's part (PR0M3TH3AN/bitgate docs/shadow-comparison.md, "BitPortal"): for every
// world, BitPortal's own answer to "may it be shown" beside BitGate's, from the same signed lists.
//
//   npm run shadow:bitgate                                   public relays, read only
//   npm run shadow:bitgate -- --relays ws://127.0.0.1:4313   the stand-in relay
//   npm run shadow:bitgate -- --operator <hex>               a trial's test key as the operator
//
// What each difference means, and which are expected, is in scripts/shadow/README.md.
//
// An operator's script, on the operator's own machine: never in a visitor's page. It only reads public events (lists,
// world announcements), publishes nothing, holds no key, and writes only to its own output: the log lines (which name
// no world) to the terminal and to .shadow/, and the reconciliation (which compares the two lists by coordinate) to
// .shadow/ alone. Nothing it computes changes what BitPortal shows.
//
// BitGate's readers are BitPortal's vendored copy (vendor/bitgate, built by `npm run vendor -- --only bitgate` from
// BitGate's committed tree at a pinned commit); the report says which commit.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name, fallback) => {
  const at = process.argv.indexOf(`--${name}`);
  return at >= 0 ? process.argv[at + 1] : fallback;
};
const vendored = JSON.parse(readFileSync(join(root, "vendor/integrity.json"), "utf8")).packages["@bitgate/readers"];
if (!vendored) {
  console.error("BitGate's readers aren't vendored: run npm run vendor -- --only bitgate.");
  process.exit(2);
}

// Bundle the comparison with BitGate's vendored readers and BitPortal's own catalogue.
const work = mkdtempSync(join(tmpdir(), "bitportal-shadow-"));
const bundle = join(work, "shadow.mjs");
execFileSync(
  join(root, "node_modules/.bin/esbuild"),
  [
    join(root, "scripts/shadow/entry.ts"),
    "--bundle",
    "--format=esm",
    "--platform=node",
    "--log-level=warning",
    `--outfile=${bundle}`,
    `--alias:@nswp/core=${join(root, "vendor/nswp/nswp-core.js")}`,
    `--alias:nswp-sdk/three=${join(root, "vendor/nswp/sdk/three.js")}`,
    `--alias:nswp-sdk/home=${join(root, "vendor/nswp/sdk/home.js")}`,
    `--alias:nswp-sdk/ui=${join(root, "vendor/nswp/sdk/ui.js")}`,
    `--alias:nswp-sdk/terminal=${join(root, "vendor/nswp/sdk/terminal.js")}`,
    `--alias:@bitgate/core=${join(root, "vendor/bitgate/core.js")}`,
    `--alias:@bitgate/nostr=${join(root, "vendor/bitgate/nostr.js")}`,
  ],
  { stdio: "inherit" },
);
const { shadowCompare, INSTANCE, DEFAULT_RELAYS, starter } = await import(pathToFileURL(bundle).href);
rmSync(work, { recursive: true, force: true });

const relays = (arg("relays", "") || DEFAULT_RELAYS.join(",")).split(",").map((s) => s.trim()).filter(Boolean);
const operator = arg("operator", "");
const policy = operator ? { ...INSTANCE, operators: [operator] } : INSTANCE;
const waitMs = Number(arg("wait", "8000"));

/** Ask one relay, read only: REQs out, events in, until it says it has sent everything or time runs out. */
function ask(url, filters) {
  return new Promise((done) => {
    const got = [];
    let open = filters.length;
    let ws;
    const finish = () => {
      clearTimeout(timer);
      try {
        ws?.close();
      } catch {
        /* closed already */
      }
      done(got);
    };
    const timer = setTimeout(finish, waitMs);
    try {
      ws = new WebSocket(url);
    } catch {
      return finish();
    }
    ws.onopen = () => filters.forEach((f, i) => ws.send(JSON.stringify(["REQ", `shadow-${i}`, f])));
    ws.onmessage = (m) => {
      let msg;
      try {
        msg = JSON.parse(String(m.data));
      } catch {
        return;
      }
      if (msg[0] === "EVENT") got.push(msg[2]);
      else if (msg[0] === "EOSE" && --open <= 0) finish();
    };
    ws.onerror = finish;
    ws.onclose = finish;
  });
}
const fetchAll = async (filters) => (await Promise.all(relays.map((r) => ask(r, filters)))).flat();

const curators = [...policy.operators, starter.curator];
const first = await fetchAll([{ kinds: [30004], authors: curators }, { kinds: [37300], limit: 1000 }]);
// Worlds the lists name that weren't among those: asked for by their own keys.
const seen = new Set(first.filter((e) => e?.kind === 37300).map((e) => `37300:${e.pubkey}:${e.tags?.find((t) => t[0] === "d")?.[1] ?? ""}`));
const named = new Map();
for (const e of [starter.set, ...first]) {
  if (e?.kind !== 30004) continue;
  for (const t of e.tags ?? []) {
    const m = t[0] === "a" ? /^37300:([0-9a-f]{64}):(.*)$/.exec(t[1] ?? "") : null;
    if (m && !seen.has(t[1])) named.set(t[1], { pubkey: m[1], d: m[2] });
  }
}
const more = named.size ? await fetchAll([...named.values()].slice(0, 200).map((w) => ({ kinds: [37300], authors: [w.pubkey], "#d": [w.d] }))) : [];
const fetchedAt = Math.floor(Date.now() / 1000);
const events = [...new Map([...first, ...more].filter((e) => e && typeof e.id === "string").map((e) => [e.id, e])).values()];

const report = shadowCompare({ bundle: starter, events, policy, now: Math.floor(Date.now() / 1000), fetchedAt });
for (const line of report.lines) console.log(JSON.stringify(line));
const out = join(root, ".shadow");
mkdirSync(out, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = join(out, `bitgate-shadow-${stamp}.json`);
writeFileSync(
  file,
  `${JSON.stringify({ ran: new Date().toISOString(), relays, operator: operator ? "trial key" : "instance", bitgate: { vendored: vendored.source.commit, version: vendored.version }, events: events.length, counts: report.counts, reconciliation: report.reconciliation, lines: report.lines }, null, 1)}\n`,
);
console.error(`${report.counts.worlds} worlds: ${report.counts.agree} agree, ${report.counts.disagree} disagree (${report.counts.expected} expected, ${report.counts.unexplained} to explain), ${report.counts.unavailable} unavailable (${report.counts.adultLeftOut} for adults left out). Report: ${file}`);
