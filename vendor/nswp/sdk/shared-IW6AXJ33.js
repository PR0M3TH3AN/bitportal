// packages/sdk/src/relay-book.ts
import { cleanRelayUrl, DISCOVERY, DISCOVERY_RELAYS, learnRelays, pickDiscovered, pickRelays, publishEvent, queryRelays, readRelayList, RELAY_DISCOVERY_KIND, RELAY_LIST_KIND, RELAY_PICK, verifyEvent, WRAP_KIND } from "@nswp/core";
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
  return pickRelays({ ...o, notes: withMonitors(read()), now });
}
var openOf = (urls, to, at) => {
  const notes2 = withMonitors(read());
  return [...new Set(urls.map(cleanRelayUrl).filter(Boolean))].filter((u) => pickRelays({ own: [u], usual: [], notes: notes2, now: at, for: to }).relays.includes(u));
};
var withMonitors = (kept) => {
  if (!found?.closed.length) return kept;
  const next = { ...kept };
  for (const url of found.closed) next[url] = { ...next[url] ?? { ok: 0, failed: 0, at: found.at }, closed: { ...next[url]?.closed ?? {}, write: found.at } };
  return next;
};
async function sendWell(event, o) {
  const publish = o.publish ?? publishEvent;
  const now = o.now ?? (() => Date.now());
  const wrapped = event.kind === WRAP_KIND;
  const first = relaysWell({ own: o.own, usual: o.usual, for: "write", ...wrapped ? {} : { usualAtLeast: RELAY_PICK.usual } }, now());
  const sent = await publish(first.relays, event).catch(() => ({ relays: Object.fromEntries(first.relays.map((r) => [r, "error: not sent"])) }));
  learnFrom(sent.relays, now());
  let took = Object.values(sent.relays).filter((said) => said === "ok").length;
  const tried = [...first.relays];
  if (took < RELAY_PICK.took && !(wrapped && took > 0)) {
    const rest = openOf(o.usual.filter((r) => !tried.includes(cleanRelayUrl(r))), "write", now());
    if (rest.length) {
      const again = await publish(rest, event).catch(() => ({ relays: Object.fromEntries(rest.map((r) => [r, "error: not sent"])) }));
      learnFrom(again.relays, now());
      took += Object.values(again.relays).filter((said) => said === "ok").length;
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
var LIST_KEY = "nswp:relays:list";
var MENDED_KEY = "nswp:relays:mended";
var MENDED_FOR_MS = 24 * 3600 * 1e3;
var lists = /* @__PURE__ */ new Map();
var keptList = (who) => {
  try {
    const kept = JSON.parse(globalThis.localStorage?.getItem(LIST_KEY) ?? "null");
    return verifyEvent(kept) && kept.kind === RELAY_LIST_KIND && kept.pubkey === who ? kept : null;
  } catch {
    return null;
  }
};
var keepList = (list) => {
  try {
    globalThis.localStorage?.setItem(LIST_KEY, JSON.stringify(list));
  } catch {
  }
};
var mendedHere = {};
var mended = () => {
  try {
    const kept = JSON.parse(globalThis.localStorage?.getItem(MENDED_KEY) ?? "null");
    return kept && typeof kept === "object" && !Array.isArray(kept) ? kept : mendedHere;
  } catch {
    return mendedHere;
  }
};
var askEach = async (urls, filter, ms, query, now, into, events) => {
  await Promise.all(
    urls.map(async (url) => {
      const got = await query([url], filter, ms).catch(() => ({ events: [], relays: { [url]: "error: not asked" } }));
      learnFrom(got.relays, now());
      const ids = /* @__PURE__ */ new Set();
      for (const e of got.events) {
        if (!verifyEvent(e)) continue;
        ids.add(e.id);
        events.set(e.id, e);
      }
      into.set(url, { said: got.relays[url] ?? Object.values(got.relays)[0] ?? "timeout", ids });
    })
  );
};
var newest = (events) => events.slice().sort((x, y) => y.created_at - x.created_at || (x.id < y.id ? -1 : 1))[0] ?? null;
var putBack = (note, asked, o) => {
  if (!o.publish && typeof document === "undefined") return;
  if (note.kind === WRAP_KIND) return;
  const done = mended();
  const at = o.now();
  const missing = [...asked.entries()].filter(([url, a]) => a.said === "eose" && !a.ids.has(note.id) && !(at - (done[`${url} ${note.id}`] ?? -Infinity) < MENDED_FOR_MS)).map(([url]) => url);
  const ownFirst = [...missing.filter((u) => o.first?.includes(u)), ...missing.filter((u) => !o.first?.includes(u))];
  const to = openOf(ownFirst, "write", at).slice(0, RELAY_PICK.mend);
  if (!to.length) return;
  const next = Object.fromEntries(Object.entries(done).filter(([, when]) => at - when < MENDED_FOR_MS));
  for (const url of to) next[`${url} ${note.id}`] = at;
  mendedHere = next;
  try {
    globalThis.localStorage?.setItem(MENDED_KEY, JSON.stringify(next));
  } catch {
  }
  void (o.publish ?? publishEvent)(to, note).then((sent) => learnFrom(sent.relays, o.now())).catch(() => null);
};
var askFirst = (urls, filter, most, grace, query, now, into, events, pending) => new Promise((done) => {
  let left = urls.length;
  let graceTimer = null;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    if (graceTimer) clearTimeout(graceTimer);
    clearTimeout(cap);
    done();
  };
  const cap = setTimeout(finish, most);
  if (!left) return finish();
  for (const url of urls) {
    const asking = askEach([url], filter, most, query, now, into, events).then(() => {
      left--;
      if (events.size && !graceTimer) graceTimer = setTimeout(finish, grace);
      if (left === 0) finish();
    });
    pending?.push(asking);
  }
});
var listOf = async (who, o) => {
  const asked = /* @__PURE__ */ new Map();
  const events = /* @__PURE__ */ new Map();
  const best = relaysWell({ own: [], usual: o.usual, for: "read" }, o.now()).relays;
  await askFirst(best, { kinds: [RELAY_LIST_KIND], authors: [who], limit: 4 }, RELAY_PICK.listWaitMs, RELAY_PICK.graceMs, o.query, o.now, asked, events);
  const had = o.mine ? keptList(who) : lists.get(who) ?? null;
  const list = newest([...events.values(), ...had ? [had] : []].filter((e) => e.kind === RELAY_LIST_KIND && e.pubkey === who));
  if (!list) return null;
  if (o.mine) {
    keepList(list);
    putBack(list, asked, o);
  } else lists.set(who, list);
  return list;
};
async function relaysOf(who, o) {
  const known = o.mine ? keptList(who) : lists.get(who) ?? null;
  const coming = listOf(who, { usual: o.usual, mine: !!o.mine, query: o.query ?? queryRelays, ...o.publish ? { publish: o.publish } : {}, now: o.now ?? (() => Date.now()) }).catch(() => null);
  const list = known ?? await coming;
  return readRelayList(list ? [list] : [], who)?.write ?? [];
}
async function askOwn(filter, who, o) {
  const query = o.query ?? queryRelays;
  const now = o.now ?? (() => Date.now());
  const mine = !!o.mine;
  const first = o.timeoutMs ?? 4e3;
  const asked = /* @__PURE__ */ new Map();
  const events = /* @__PURE__ */ new Map();
  const pending = [];
  const ask = (urls, ms) => askFirst(urls.filter((u) => !asked.has(u)), filter, ms, RELAY_PICK.graceMs, query, now, asked, events, pending);
  const known = mine ? keptList(who) : lists.get(who) ?? null;
  const coming = listOf(who, { usual: o.usual, mine, query, ...o.publish ? { publish: o.publish } : {}, now });
  const ownOf = (list2) => readRelayList(list2 ? [list2] : [], who)?.write ?? [];
  const firstPick = relaysWell({ own: ownOf(known), usual: o.usual, for: "read", usualAtLeast: 1 }, now()).relays;
  const list = await Promise.all([ask(firstPick, first), coming]).then(([, l]) => l ?? known);
  const own = ownOf(list);
  await ask(relaysWell({ own, usual: [], for: "read" }, now()).relays, first);
  if (mine && events.size === 0) {
    const rest = openOf(own, "read", now()).filter((u) => !asked.has(u));
    const askedOfOwn = () => own.filter((u) => asked.has(u)).length;
    for (let i = 0, wave = 1; i < rest.length && events.size === 0; i += RELAY_PICK.wave, wave++) {
      const batch = rest.slice(i, i + RELAY_PICK.wave);
      o.onWave?.(wave, askedOfOwn() + batch.length, own.length);
      await ask(batch, RELAY_PICK.waveMs);
    }
    const late = [...asked.entries()].filter(([, a]) => a.said === "timeout").map(([url]) => url);
    for (let i = 0, wave = 1; i < late.length && events.size === 0; i += RELAY_PICK.wave, wave++) {
      o.onWave?.(wave, askedOfOwn(), own.length);
      await askFirst(late.slice(i, i + RELAY_PICK.wave), filter, RELAY_PICK.lateMs, RELAY_PICK.graceMs, query, now, asked, events, pending);
    }
  }
  const answered = () => [...asked.values()].filter((a) => a.said === "eose").length;
  if (answered() === 0 && events.size === 0 && mayAskBackUp([...asked.keys()], o)) {
    const more = (await foundRelays({ not: [...asked.keys()], ...o.query ? { query: o.query } : {}, now })).open.slice(0, BACKUP_AT_ONCE);
    if (more.length) await ask(more, first);
  }
  const all = [...events.values()];
  const relays = Object.fromEntries([...asked.entries()].map(([url, a]) => [url, a.said]));
  let state = "found";
  if (!all.length) {
    const n = asked.size;
    const need = Math.min(n, Math.max(3, Math.ceil(n / 2)));
    const everyOne = !mine || openOf(own, "read", now()).every((u) => asked.has(u));
    state = n > 0 && answered() >= need && everyOne ? "none" : "unreached";
  }
  const ownDevice = o.mine;
  const shown = newest(all);
  void Promise.all(pending).then(() => {
    const everything = [...events.values()];
    const latest = newest(everything);
    if (latest && shown && latest.id !== shown.id && latest.created_at > shown.created_at && o.onNewer)
      o.onNewer({ events: everything, state: "found", relays: Object.fromEntries([...asked.entries()].map(([url, a]) => [url, a.said])), own });
    if (ownDevice) {
      const note = newest([...everything, ...ownDevice.kept ? [ownDevice.kept] : []]);
      if (note && note.pubkey === who) putBack(note, asked, { ...o.publish ? { publish: o.publish } : {}, now, first: own });
    }
  });
  return { events: all, state, relays, own };
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
  relaysOf,
  askOwn,
  relayBackup,
  foundRelays,
  queryBacked,
  publishBacked
};
