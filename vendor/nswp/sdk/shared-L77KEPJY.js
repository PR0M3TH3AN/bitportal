// packages/sdk/src/relay-book.ts
import { DISCOVERY, DISCOVERY_RELAYS, learnRelays, pickDiscovered, pickRelays, publishEvent, queryRelays, RELAY_DISCOVERY_KIND, WRAP_KIND } from "@nswp/core";
var KEY = "nswp:relays";
var notes = null;
var read = () => {
  if (notes) return notes;
  try {
    const kept = JSON.parse(globalThis.localStorage?.getItem(KEY) ?? "{}");
    notes = kept && typeof kept === "object" && !Array.isArray(kept) ? kept : {};
  } catch {
    notes = {};
  }
  return notes;
};
function learnFrom(results, now = Date.now()) {
  notes = learnRelays(read(), results, now);
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(notes));
  } catch {
  }
}
function relaysWell(o, now = Date.now()) {
  return pickRelays({ ...o, notes: read(), now });
}
async function sendWell(event, o) {
  const publish = o.publish ?? publishEvent;
  const now = o.now ?? (() => Date.now());
  const first = relaysWell(o, now());
  const sent = await publish(first.relays, event).catch(() => ({ relays: Object.fromEntries(first.relays.map((r) => [r, "error: not sent"])) }));
  learnFrom(sent.relays, now());
  let took = Object.values(sent.relays).filter((said) => said === "ok").length;
  const tried = [...first.relays];
  if (took === 0) {
    const rest = o.usual.filter((r) => !tried.includes(r));
    if (rest.length) {
      const again = await publish(rest, event).catch(() => ({ relays: Object.fromEntries(rest.map((r) => [r, "error: not sent"])) }));
      learnFrom(again.relays, now());
      took = Object.values(again.relays).filter((said) => said === "ok").length;
      tried.push(...rest);
    }
  }
  if (took === 0 && maySendBackUp(tried, o) && event.kind !== WRAP_KIND) {
    const more = (await foundRelays({ not: tried, now, ...o.query ? { query: o.query } : {} })).open;
    for (let round = 0; round < BACKUP_ROUNDS && took === 0; round++) {
      const batch = more.slice(round * BACKUP_AT_ONCE, (round + 1) * BACKUP_AT_ONCE);
      if (!batch.length) break;
      const last = await publish(batch, event).catch(() => ({ relays: Object.fromEntries(batch.map((r) => [r, "error: not sent"])) }));
      learnFrom(last.relays, now());
      took = Object.values(last.relays).filter((said) => said === "ok").length;
      tried.push(...batch);
    }
  }
  return { took, relays: tried, own: first.own };
}
async function askWell(filter, o) {
  const now = o.now ?? (() => Date.now());
  const asked = relaysWell(o, now()).relays;
  return queryBacked(asked, filter, o.timeoutMs ?? 4e3, { ...o.query ? { query: o.query } : {}, now });
}
var FOUND_KEY = "nswp:relays:found";
var FOUND_FOR_MS = 24 * 3600 * 1e3;
var backup = true;
var found = null;
var finding = null;
function relayBackup(on) {
  if (on !== void 0) backup = on;
  return backup;
}
function foundRelays(o = {}) {
  const now = o.now ?? (() => Date.now());
  const without = (all) => ({ open: all.open.filter((r) => !(o.not ?? []).includes(r)), closed: all.closed });
  if (!found) {
    try {
      const kept = JSON.parse(globalThis.localStorage?.getItem(FOUND_KEY) ?? "null");
      const list = (v) => Array.isArray(v) ? v.filter((r) => typeof r === "string" && /^wss:\/\//.test(r)).slice(0, 400) : [];
      if (kept && typeof kept.at === "number") found = { at: kept.at, open: list(kept.open), closed: list(kept.closed) };
    } catch {
    }
  }
  if (found && now() - found.at < FOUND_FOR_MS) return Promise.resolve(without(found));
  finding ??= (async () => {
    const since = Math.floor(now() / 1e3) - DISCOVERY.freshSec;
    const got = await (o.query ?? queryRelays)([...DISCOVERY_RELAYS], { kinds: [RELAY_DISCOVERY_KIND], since, limit: 500 }, 5e3).catch(() => null);
    const picked = pickDiscovered(got?.events ?? [], { now: Math.floor(now() / 1e3), most: 24 });
    if (picked.open.length || picked.closed.length) {
      found = { at: now(), ...picked };
      try {
        globalThis.localStorage?.setItem(FOUND_KEY, JSON.stringify(found));
      } catch {
      }
    }
    return picked;
  })().finally(() => {
    finding = null;
  });
  return finding.then(without);
}
var BACKUP_AT_ONCE = 4;
var BACKUP_ROUNDS = 3;
var mayAskBackUp = (relays, o) => backup && relays.length > 0 && (!!o.query || typeof document !== "undefined");
var maySendBackUp = (relays, o) => backup && relays.length > 0 && (o.publish ? !!o.query : !o.query && typeof document !== "undefined");
async function queryBacked(relays, filter, timeoutMs = 4e3, o = {}) {
  const query = o.query ?? queryRelays;
  const now = o.now ?? (() => Date.now());
  const got = await query(relays, filter, timeoutMs);
  learnFrom(got.relays, now());
  if (!mayAskBackUp(relays, o) || Object.values(got.relays).some((said) => said === "eose")) return got;
  const more = (await foundRelays({ not: relays, ...o })).open.slice(0, BACKUP_AT_ONCE);
  if (!more.length) return got;
  const again = await query(more, filter, timeoutMs).catch(() => null);
  if (!again) return got;
  learnFrom(again.relays, now());
  const byId = new Map([...got.events, ...again.events].map((e) => [e.id, e]));
  return { events: [...byId.values()], relays: { ...got.relays, ...again.relays } };
}
async function publishBacked(relays, event, o = {}) {
  const publish = o.publish ?? publishEvent;
  const now = o.now ?? (() => Date.now());
  const sent = await publish(relays, event);
  learnFrom(sent.relays, now());
  if (!maySendBackUp(relays, o) || event.kind === WRAP_KIND || Object.values(sent.relays).some((said) => said === "ok")) return sent;
  const more = (await foundRelays({ not: relays, ...o.query ? { query: o.query } : {}, now })).open;
  const all = { ...sent.relays };
  for (let round = 0; round < BACKUP_ROUNDS; round++) {
    const batch = more.slice(round * BACKUP_AT_ONCE, (round + 1) * BACKUP_AT_ONCE);
    if (!batch.length) break;
    const again = await publish(batch, event).catch(() => null);
    if (!again) continue;
    learnFrom(again.relays, now());
    Object.assign(all, again.relays);
    if (Object.values(again.relays).some((said) => said === "ok")) break;
  }
  return { relays: all };
}

export {
  learnFrom,
  relaysWell,
  sendWell,
  askWell,
  relayBackup,
  foundRelays,
  queryBacked,
  publishBacked
};
