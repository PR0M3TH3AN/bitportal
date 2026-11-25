import { K as yi, b as fi, c as U, D as bo, d as Mt, w as S, f as qt, g as yt, h as Yn, S as nn, j as rn, k as He, l as bt, B as pi, m as hi, n as on, o as ft, q as Xn, r as Zn, a as ot, s as ko, t as wi, u as vi } from "./bitlogin-shared-CDSZpiZ4.js";
import { g as P, s as W, v as C, b as $e, a as F, f as we, i as gi, j as mi, k as bi, l as ki, m as Ei, n as dn, o as Ur, p as Eo, q as _i, t as Pi, w as Si, x as St, y as _o, u as V, z as Ki, A as Ft, B as er, C as tr, D as Po, E as Ai, d as L, e as x, F as nr, G as Ri, H as So, h as rr, I as Ko, J as Ci, c as kt, K as Cn, L as Qe } from "./bitlogin-shared-Cj9s0_W_.js";
import { b as Et, r as ne, c as re, k as Ni, i as Ue, R as Me, w as Ie, T as yn, d as fn, n as qr, t as Ti, m as Mi, N as Nn, e as Fr, g as $r, h as Ao, j as Ii, l as Li } from "./bitlogin-shared-ocmFRDk5.js";
import { ab as Ae, ac as or, ad as Tn, ae as Oi, af as st, ag as it, ah as at, ai as ce, aj as se, ak as Ro, al as Co, am as pt, an as sr, a2 as ht, y as $t, z as ir, O as ar, J as Wt, ao as ve, $ as Di, a as wt, k as cr, P as No, b as To, ap as Mn, aq as Pe, ar as ct, as as Mo, at as xi, au as Ui, av as Io, aw as Lo, ax as Wr, ay as qi, az as Fi, aA as Ye, aB as $i, aC as Vr, aD as Br, a9 as Wi, U as Vi, A as Kt, u as jr, aE as Bi, aF as ji, aG as Ji, aH as Gi, aI as Hi, aJ as zi, aK as Qi, aL as Yi, aM as Xi, aN as Zi, aO as Jr, aP as ea, aQ as ta, aR as na, aS as ra, aT as oa, aU as sa, aV as Oo, H as ia, R as aa, aW as ca, aX as la, aY as ua, aZ as da, a_ as ya, a$ as fa, b0 as pa, b1 as Gr } from "./bitlogin-shared-BosVxhRE.js";
import { e as lr, a as ur, b as dr } from "./bitlogin-shared-PwbHDYud.js";
function Do(t) {
  const e = P(t.privateKey);
  return W({
    pubkey: e,
    created_at: t.createdAt,
    kind: yi,
    tags: [
      ["e", t.eventIdToDelete],
      ["k", String(t.deletedEventKind)]
    ],
    content: t.reason ?? ""
  }, t.privateKey);
}
function ha() {
  const t = globalThis.WebSocket;
  if (!t)
    throw new Error("No global WebSocket implementation is available in this environment.");
  return t;
}
const Vt = 1e3, wa = 262144;
function va(t) {
  const e = Math.min(t.limit ?? Vt, Vt);
  return Math.max(50, e * 3);
}
const ga = 2048, ma = 1e4, ba = 100;
function ka(t, e) {
  if (t.size >= ga) {
    const o = t.values().next().value;
    o !== void 0 && t.delete(o);
  }
  t.add(e);
}
class sn {
  url;
  ws = null;
  connectPromise = null;
  subs = /* @__PURE__ */ new Map();
  pendingPublishes = /* @__PURE__ */ new Map();
  authPrivateKey;
  connectTimeoutMs;
  authenticated = !1;
  constructor(e, o = {}) {
    if (!Et(e))
      throw new Error("Relay URL must use secure WebSockets, except for an explicit loopback development endpoint.");
    this.url = e, this.authPrivateKey = o.authPrivateKey, this.connectTimeoutMs = o.connectTimeoutMs ?? 8e3;
  }
  async connect() {
    return this.connectPromise ? this.connectPromise : (this.connectPromise = new Promise((e, o) => {
      const n = ha(), r = new n(this.url);
      this.ws = r;
      const s = setTimeout(() => {
        o(new Error(`Timed out connecting to relay ${this.url}`));
      }, this.connectTimeoutMs);
      r.addEventListener("open", () => {
        clearTimeout(s);
        for (const [i, a] of this.subs)
          r.send(JSON.stringify(["REQ", i, a.filter]));
        e();
      }), r.addEventListener("error", () => {
        clearTimeout(s), o(new Error(`WebSocket error connecting to relay ${this.url}`));
      }), r.addEventListener("close", () => {
        this.connectPromise = null;
      }), r.addEventListener("message", (i) => {
        this.handleMessage(String(i.data));
      });
    }), this.connectPromise);
  }
  close() {
    this.ws?.close(), this.ws = null, this.connectPromise = null, this.subs.clear(), this.pendingPublishes.clear();
  }
  send(e) {
    if (!this.ws)
      throw new Error("Not connected to relay.");
    this.ws.send(JSON.stringify(e));
  }
  handleMessage(e) {
    if (e.length > wa)
      return;
    let o;
    try {
      o = JSON.parse(e);
    } catch {
      return;
    }
    if (!Array.isArray(o) || typeof o[0] != "string")
      return;
    const [n, ...r] = o;
    if (n === "EVENT") {
      const [s, i] = r;
      if (typeof s != "string")
        return;
      const a = this.subs.get(s);
      if (!a)
        return;
      const c = i?.id;
      if (typeof c != "string" || a.seenIds.has(c))
        return;
      if (a.onEvent) {
        const d = Date.now();
        if (d - a.liveWindowStart >= ma && (a.liveWindowStart = d, a.liveVerifies = 0), a.liveVerifies >= ba || (a.liveVerifies++, !C(i) || !Hr(i, a.filter)))
          return;
        ka(a.seenIds, i.id), a.onEvent(i);
        return;
      }
      const l = Math.min(a.filter.limit ?? Vt, Vt);
      if (a.events.length >= l || a.verifyBudget <= 0 || (a.verifyBudget--, !C(i) || !Hr(i, a.filter)))
        return;
      a.seenIds.add(i.id), a.events.push(i);
      return;
    }
    if (n === "EOSE") {
      const [s] = r;
      if (typeof s != "string")
        return;
      this.subs.get(s)?.onEose();
      return;
    }
    if (n === "OK") {
      const [s, i, a] = r;
      if (typeof s != "string" || typeof i != "boolean" || a !== void 0 && typeof a != "string")
        return;
      this.pendingPublishes.get(s)?.({ ok: i, message: a ?? "" }), this.pendingPublishes.delete(s);
      return;
    }
    if (n === "AUTH") {
      const [s] = r;
      if (typeof s != "string")
        return;
      this.respondToAuthChallenge(s);
      return;
    }
  }
  async respondToAuthChallenge(e) {
    if (!this.authPrivateKey)
      return;
    const o = P(this.authPrivateKey), n = W({
      pubkey: o,
      created_at: Math.floor(Date.now() / 1e3),
      kind: fi,
      tags: [
        ["relay", this.url],
        ["challenge", e]
      ],
      content: ""
    }, this.authPrivateKey);
    this.authenticated = !0, this.send(["AUTH", n]);
  }
  isAuthenticated() {
    return this.authenticated;
  }
  async publish(e, o = 8e3) {
    return await this.connect(), new Promise((n) => {
      const r = setTimeout(() => {
        this.pendingPublishes.delete(e.id), n({ ok: !1, message: "timeout: no OK received from relay" });
      }, o);
      this.pendingPublishes.set(e.id, (s) => {
        clearTimeout(r), n(s);
      }), this.send(["EVENT", e]);
    });
  }
  /**
   * Opens a subscription that stays live past EOSE: every verified,
   * filter-matching event is delivered to `onEvent` as it arrives, until the
   * returned handle is closed. Survives socket drops -- connect() re-issues
   * REQ for all open subscriptions on reopen -- though events published while
   * the socket was down are only seen if the relay replays them on the new REQ.
   */
  async subscribeLive(e, o) {
    await this.connect();
    const n = $e(F(8));
    return this.subs.set(n, {
      events: [],
      seenIds: /* @__PURE__ */ new Set(),
      verifyBudget: Number.POSITIVE_INFINITY,
      liveWindowStart: Date.now(),
      liveVerifies: 0,
      filter: e,
      onEose: () => {
      },
      onEvent: o
    }), this.send(["REQ", n, e]), {
      close: () => {
        if (this.subs.delete(n))
          try {
            this.send(["CLOSE", n]);
          } catch {
          }
      }
    };
  }
  async queryOnce(e, o = 8e3) {
    await this.connect();
    const n = $e(F(8));
    return new Promise((r, s) => {
      const i = [], a = (l) => {
        clearTimeout(c), this.subs.delete(n);
        try {
          this.send(["CLOSE", n]);
        } catch {
        }
        l ? s(l) : r(i);
      }, c = setTimeout(() => a(new Error("relay did not answer the subscription before the timeout")), o);
      this.subs.set(n, {
        events: i,
        seenIds: /* @__PURE__ */ new Set(),
        verifyBudget: va(e),
        liveWindowStart: 0,
        liveVerifies: 0,
        filter: e,
        onEose: () => a()
      }), this.send(["REQ", n, e]);
    });
  }
}
function Hr(t, e) {
  if (e.ids && !e.ids.some((o) => t.id.startsWith(o)) || e.authors && !e.authors.some((o) => t.pubkey.startsWith(o)) || e.kinds && !e.kinds.includes(t.kind) || e.since !== void 0 && t.created_at < e.since || e.until !== void 0 && t.created_at > e.until)
    return !1;
  for (const [o, n] of Object.entries(e)) {
    if (!o.startsWith("#") || !Array.isArray(n))
      continue;
    const r = o.slice(1), s = n;
    if (!t.tags.some((i) => i[0] === r && s.some((a) => a === (i[1] ?? ""))))
      return !1;
  }
  return !0;
}
const zr = "Not waited for: it didn't answer a moment ago.";
class T {
  connections = /* @__PURE__ */ new Map();
  kept;
  notWaitedFor;
  heard;
  constructor(e, o = {}) {
    this.kept = !!o.connectionFor, this.notWaitedFor = o.notWaitedFor ?? (() => !1), this.heard = o.heard ?? (() => {
    });
    for (const n of new Set(e))
      this.connections.set(n, o.connectionFor ? o.connectionFor(n) : new sn(n, o));
  }
  /** The relays waited for this time, and the ones not: those that failed a moment ago, unless that is every one. */
  split() {
    const e = [...this.connections.entries()], o = e.filter(([n]) => this.notWaitedFor(n));
    return o.length === e.length ? { waited: e, skipped: [] } : { waited: e.filter(([n]) => !this.notWaitedFor(n)), skipped: o };
  }
  /** A record sent to a relay not waited for: it has the copy when it comes back, and nothing waits on it. */
  sendUnwaited(e, o, n) {
    for (const [r, s] of e)
      s.publish(o, n).then((i) => this.heard(r, !0), () => this.heard(r, !1));
    return e.map(([r]) => ({ relayUrl: r, result: { ok: !1, message: zr } }));
  }
  get relayUrls() {
    return [...this.connections.keys()];
  }
  /** Queries every configured relay and waits for a quorum of responses (or all timeouts) before returning (§16.2). */
  async queryQuorum(e, o = 8e3) {
    const { waited: n, skipped: r } = this.split(), i = [...await Promise.all(n.map(async ([l, d]) => {
      try {
        const y = await d.queryOnce(e, o);
        return this.heard(l, !0), { relayUrl: l, events: y, responded: !0 };
      } catch (y) {
        return this.heard(l, !1), { relayUrl: l, events: [], responded: !1, error: y.message };
      }
    })), ...r.map(([l]) => ({ relayUrl: l, events: [], responded: !1, error: zr }))], a = i.filter((l) => l.responded).length, c = i.length;
    return {
      outcomes: i,
      quorumMet: a >= Math.ceil(c / 2),
      respondedCount: a,
      totalCount: c
    };
  }
  /** Publishes an event to every configured relay, best-effort (§15.6, §24.4). */
  async publishAll(e, o = 8e3) {
    const { waited: n, skipped: r } = this.split(), s = this.sendUnwaited(r, e, o);
    return [...await Promise.all(n.map(async ([a, c]) => {
      try {
        const l = await c.publish(e, o);
        return this.heard(a, !l.message.startsWith("timeout")), { relayUrl: a, result: l };
      } catch (l) {
        return this.heard(a, !1), { relayUrl: a, result: { ok: !1, message: l.message } };
      }
    })), ...s];
  }
  /**
   * Sent to every relay, as `publishAll`; but finished once every relay has answered, or `graceMs` after `enough` of
   * them have taken it. A relay that connects and never answers then costs the grace, not the whole timeout. With
   * fewer than `enough` taking it, the whole timeout is waited, so nothing is called taken out of impatience. A relay
   * not waited for is reported as not having taken it.
   */
  publishEnough(e, o = 8e3, n = 2, r = 1500) {
    const { waited: s, skipped: i } = this.split(), a = this.sendUnwaited(i, e, o);
    return new Promise((c) => {
      const l = /* @__PURE__ */ new Map();
      let d = 0, y = null, f = !1;
      const p = () => {
        f || (f = !0, y && clearTimeout(y), c([...s.map(([g]) => l.get(g) ?? { relayUrl: g, result: { ok: !1, message: "Not waited for." } }), ...a]));
      };
      if (s.length === 0)
        return p();
      for (const [g, v] of s)
        v.publish(e, o).then((b) => (this.heard(g, !b.message.startsWith("timeout")), { relayUrl: g, result: b }), (b) => (this.heard(g, !1), { relayUrl: g, result: { ok: !1, message: b.message } })).then((b) => {
          if (!f) {
            if (l.set(g, b), b.result.ok && d++, l.size === s.length)
              return p();
            d >= Math.min(n, s.length) && !y && (y = setTimeout(p, r));
          }
        });
    });
  }
  closeAll() {
    if (!this.kept)
      for (const e of this.connections.values())
        e.close();
  }
}
function $(t) {
  return t.filter((e) => e.result.ok).length;
}
const _t = null, xo = [
  "wss://nos.lol",
  "wss://offchain.pub",
  "wss://nostr.bitcoiner.social",
  "wss://relay.mostr.pub",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  "wss://relay.snort.social",
  "wss://relay.damus.io",
  // Added 2026-11-18 after `scripts/relay-probe.mjs` measured the eight above
  // from one machine: nos.lol, relay.primal.net and relay.snort.social stored
  // everything; relay.mostr.pub and nostr-pub.wellorder.net never connected;
  // relay.damus.io connected about one time in eight; nostr.bitcoiner.social
  // intermittently refused capsule keys ("pubkey is not in our web of
  // trust"); and offchain.pub acknowledged and returned capsules, then held
  // only half of them minutes later. That is about four dependable relays,
  // and an account whose owner lost it to exactly this.
  //
  // NOTHING ABOVE IS REMOVED. Existing accounts live on those relays, and a
  // client that stopped asking them could no longer find those accounts.
  // These five each stored 8 of 8 capsule-shaped test events from throwaway
  // keys and still held all 8 on two later re-reads. That is minutes of
  // evidence, not months: re-run the probe before trusting any of them more.
  "wss://nostr.mom",
  "wss://relay.nostr.net",
  "wss://nostr-01.yakihonne.com",
  "wss://relay.nostr.wirednet.jp",
  "wss://nostr.sathoarder.com"
  // Measured again 2026-11-20, from one machine, re-read 15 to 17 minutes after publishing. NOTHING IS CHANGED BY
  // IT: one run adds no relay and removes none.
  //   Held 8 of 8: nos.lol, nostr.bitcoiner.social, relay.primal.net, nostr-01.yakihonne.com,
  //     relay.nostr.wirednet.jp, nostr.sathoarder.com.
  //   Accepted 8, held about half: offchain.pub (4), nostr.mom (4, then 3).
  //   Accepted 8, held 0 in one run and 4 in another: relay.snort.social.
  //   One of eight stored: relay.damus.io. Never connected: relay.mostr.pub, nostr-pub.wellorder.net,
  //     relay.nostr.net.
  // So six of these thirteen kept an account, against the floor of two acknowledgements.
  // Of 60 relays that NIP-66 monitors listed as open, 49 refused a capsule from a key they did not know. Five not
  // on this list held 8 of 8 through the re-read, once: nostr.hanshan.io, relay.nearhood.co.uk, relay.jmoose.rocks,
  // relay-fra.zombi.cloudrodion.com, relay.solomonstr.com. They are candidates for the next run, and are added
  // only if they hold again on another day (CONTRIBUTING.md, "Before a promotion: the relay probe").
], Uo = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  // Added 2026-11-18: relay.nostr.band timed out and nostr-pub.wellorder.net
  // never connected in the same measurement, leaving two working lookups.
  "wss://nos.lol"
], Ea = [], _a = /^[0-9a-f]{64}$/u, Pa = 64;
function pn(t) {
  return Array.isArray(t) && t.length <= Pa && t.every((e) => typeof e == "string" && Et(e)) && new Set(t).size === t.length;
}
function an(t, e = _t, o = -1) {
  if (!e || !_a.test(e) || /^0{64}$/u.test(e) || !C(t) || t.pubkey !== e || t.kind !== U || we(t, "d") !== bo)
    return null;
  try {
    const n = JSON.parse(t.content);
    if (typeof n != "object" || n === null || Array.isArray(n))
      return null;
    const r = n;
    return !Number.isSafeInteger(r.version) || r.version < 1 || r.version <= o || !pn(r.vaultRelays) || !pn(r.discoveryRelays) || r.deprecated !== void 0 && !pn(r.deprecated) ? null : {
      version: r.version,
      vaultRelays: r.vaultRelays,
      discoveryRelays: r.discoveryRelays,
      ...r.deprecated === void 0 ? {} : { deprecated: r.deprecated }
    };
  } catch {
    return null;
  }
}
function Sa(t) {
  return Math.max(0, t - 1);
}
function Qr(t, e, o) {
  const n = e ? o === "vault" ? e.vaultRelays : e.discoveryRelays : [], r = new Set(e?.deprecated ?? []), s = new Set(t), i = [...new Set(n)].filter((a) => !r.has(a) && !s.has(a)).slice(0, Sa(t.length));
  return [...t, ...i];
}
async function Ka(t, e = _t, o = -1, n = 6e3) {
  if (!e || t.length === 0)
    return null;
  const r = new T([...t]);
  let s;
  try {
    s = (await r.queryQuorum({ kinds: [U], authors: [e], "#d": [bo], limit: 3 }, n)).outcomes.flatMap((c) => c.events);
  } finally {
    r.closeAll();
  }
  let i = null;
  for (const a of s) {
    const c = an(a, e, o);
    c && (!i || c.version > i.list.version) && (i = { event: a, list: c });
  }
  return i;
}
const qo = "bitlogin:bootstrap-relays:v1";
async function Fo(t, e = _t) {
  if (!e)
    return null;
  try {
    const o = await t.get(qo);
    return o ? an(JSON.parse(o), e) : null;
  } catch {
    return null;
  }
}
function It(t) {
  return {
    vaultRelays: Qr(xo, t, "vault"),
    discoveryRelays: Qr(Uo, t, "discovery"),
    listVersion: t?.version ?? null
  };
}
async function Aa(t, e = {}) {
  const o = e.maintainerPubkeyHex === void 0 ? _t : e.maintainerPubkeyHex, n = await Fo(t, o);
  if (!o)
    return It(null);
  const r = It(n), s = n?.version ?? -1;
  try {
    let i = await Ka(e.queryRelayUrls ?? [.../* @__PURE__ */ new Set([...r.vaultRelays, ...r.discoveryRelays])], o, s, e.timeoutMs);
    if (!i) {
      const a = await Ra(e.httpsFallbackUrls ?? Ea, o, s), c = a ? an(a, o, s) : null;
      a && c && (i = { event: a, list: c });
    }
    return i ? (await t.set(qo, JSON.stringify(i.event)), It(i.list)) : r;
  } catch {
    return r;
  }
}
async function Ra(t, e = _t, o = -1) {
  if (!e)
    return null;
  for (const n of t)
    try {
      if (new URL(n).protocol !== "https:")
        continue;
      const r = await fetch(n);
      if (!r.ok || Number(r.headers.get("content-length") ?? 0) > 1e6)
        continue;
      const i = await r.text();
      if (i.length > 1e6)
        continue;
      const a = JSON.parse(i);
      if (C(a) && an(a, e, o))
        return a;
    } catch {
    }
  return null;
}
const yr = /^[0-9a-f]{64}$/u, Ca = 8, Na = 4096, Ta = 256, Ma = 512;
class Le extends Error {
  name = "BunkerUriParseError";
}
class Ia extends Error {
  name = "Nip46RequestTimeoutError";
  constructor(e, o) {
    super(`The remote signer did not answer ${e} within ${Math.round(o / 1e3)}s. It may be offline, or waiting for your approval on another device -- check your signer and try again.`);
  }
}
class La extends Error {
  name = "Nip46ErrorResponse";
}
function Oa(t) {
  let e;
  try {
    e = new URL(t.trim());
  } catch {
    return null;
  }
  const o = e.hostname === "localhost" || e.hostname === "127.0.0.1";
  return e.protocol === "https:" || e.protocol === "http:" && o ? e.toString() : null;
}
function Da(t) {
  if (t.length > Na)
    throw new Le("That bunker URI is unreasonably long.");
  let e;
  try {
    e = new URL(t.trim());
  } catch {
    throw new Le("That doesn't look like a valid URI.");
  }
  if (e.protocol !== "bunker:")
    throw new Le("A remote-signer URI must start with bunker://");
  const o = (e.host || e.pathname.replace(/^\/+/u, "")).toLowerCase();
  if (!yr.test(o))
    throw new Le("The bunker URI does not name a valid signer public key.");
  const n = [
    ...new Set(e.searchParams.getAll("relay").map((s) => s.trim()).filter((s) => s.length > 0 && s.length <= Ma))
  ].slice(0, Ca);
  if (n.length === 0)
    throw new Le("The bunker URI names no relays -- without at least one relay= parameter there is no way to reach the signer.");
  const r = e.searchParams.get("secret") ?? void 0;
  if (r && r.length > Ta)
    throw new Le("The bunker URI's secret is unreasonably long.");
  return { signerPubkey: o, relayUrls: n, secret: r || void 0 };
}
function xa(t) {
  if (!yr.test(t.clientPubkey))
    throw new Error("Client public key must be 64 hex characters.");
  if (t.relayUrls.length === 0)
    throw new Error("At least one relay is required.");
  if (!t.secret)
    throw new Error("A nostrconnect secret is required.");
  const e = new URLSearchParams();
  for (const o of t.relayUrls)
    e.append("relay", o);
  return e.set("secret", t.secret), t.name && e.set("name", t.name), t.perms?.length && e.set("perms", t.perms.join(",")), `nostrconnect://${t.clientPubkey}?${e.toString()}`;
}
const Ua = 12e4;
class Yr {
  clientSecretKey;
  clientPubkey;
  pointer;
  conversationKey;
  conns;
  onAuthUrl;
  requestTimeoutMs;
  pending = /* @__PURE__ */ new Map();
  subs = [];
  startPromise = null;
  userPubkeyKnown = null;
  closed = !1;
  constructor(e) {
    this.clientSecretKey = e.clientSecretKey, this.clientPubkey = P(e.clientSecretKey), this.pointer = e.pointer, this.conversationKey = Ae(e.clientSecretKey, e.pointer.signerPubkey), this.onAuthUrl = e.onAuthUrl, this.requestTimeoutMs = e.requestTimeoutMs ?? Ua, this.conns = e.pointer.relayUrls.map((o) => new sn(o, { authPrivateKey: e.clientSecretKey }));
  }
  /** The user pubkey this session signs for, once get_public_key has answered. */
  get userPublicKey() {
    return this.userPubkeyKnown;
  }
  async start() {
    if (this.closed)
      throw new Error("This signer connection is closed.");
    return this.startPromise || (this.startPromise = (async () => {
      const e = {
        kinds: [Mt],
        authors: [this.pointer.signerPubkey],
        "#p": [this.clientPubkey]
      }, o = await Promise.allSettled(this.conns.map((n) => n.subscribeLive(e, (r) => this.handleResponse(r))));
      if (this.subs = o.filter((n) => n.status === "fulfilled").map((n) => n.value), this.subs.length === 0)
        throw this.startPromise = null, new Error("Could not reach any of the signer's relays.");
    })()), this.startPromise;
  }
  handleResponse(e) {
    if (e.pubkey !== this.pointer.signerPubkey)
      return;
    let o;
    try {
      o = JSON.parse(or(this.conversationKey, e.content));
    } catch {
      return;
    }
    if (typeof o.id != "string")
      return;
    const n = this.pending.get(o.id);
    if (n) {
      if (o.result === "auth_url") {
        if (!n.authUrlSeen && typeof o.error == "string" && o.error) {
          const r = Oa(o.error);
          r && (n.authUrlSeen = !0, this.onAuthUrl?.(r));
        }
        return;
      }
      if (this.pending.delete(o.id), clearTimeout(n.timer), typeof o.error == "string" && o.error) {
        n.reject(new La(o.error));
        return;
      }
      if (typeof o.result != "string") {
        n.reject(new Error("The signer returned a malformed response."));
        return;
      }
      n.resolve(o.result);
    }
  }
  async rpc(e, o) {
    await this.start();
    const n = $e(F(8)), r = Tn(this.conversationKey, JSON.stringify({ id: n, method: e, params: o })), s = [["p", this.pointer.signerPubkey]], i = W({
      pubkey: this.clientPubkey,
      created_at: Math.floor(Date.now() / 1e3),
      kind: Mt,
      tags: s,
      content: r
    }, this.clientSecretKey), a = new Promise((d, y) => {
      const f = setTimeout(() => {
        this.pending.delete(n), y(new Ia(e, this.requestTimeoutMs));
      }, this.requestTimeoutMs);
      this.pending.set(n, { resolve: d, reject: y, timer: f, authUrlSeen: !1 });
    });
    if (a.catch(() => {
    }), !(await Promise.allSettled(this.conns.map((d) => d.publish(i)))).some((d) => d.status === "fulfilled" && d.value.ok)) {
      const d = this.pending.get(n);
      throw d && (this.pending.delete(n), clearTimeout(d.timer)), new Error("No relay accepted the request to the signer.");
    }
    return a;
  }
  /** bunker:// flow: announce ourselves; any non-error answer is acceptance. */
  async connect() {
    await this.rpc("connect", [this.pointer.signerPubkey, this.pointer.secret ?? ""]);
  }
  async getUserPublicKey() {
    const e = (await this.rpc("get_public_key", [])).trim().toLowerCase();
    if (!yr.test(e))
      throw new Error("The signer returned an invalid public key.");
    return this.userPubkeyKnown = e, e;
  }
  async signEvent(e) {
    const o = this.userPubkeyKnown ? { ...e, pubkey: this.userPubkeyKnown } : e, n = await this.rpc("sign_event", [JSON.stringify(o)]);
    let r;
    try {
      r = JSON.parse(n);
    } catch {
      throw new Error("The signer returned a malformed signed event.");
    }
    if (!C(r))
      throw new Error("The signer returned an event that does not verify.");
    if (this.userPubkeyKnown && r.pubkey !== this.userPubkeyKnown)
      throw new Error("The signer returned an event signed by a different identity.");
    if (r.kind !== e.kind || r.content !== e.content || r.created_at !== e.created_at || JSON.stringify(r.tags) !== JSON.stringify(e.tags))
      throw new Error("The signer returned a different event than the one requested.");
    return r;
  }
  async nip44Encrypt(e, o) {
    return this.rpc("nip44_encrypt", [e, o]);
  }
  async nip44Decrypt(e, o) {
    return this.rpc("nip44_decrypt", [e, o]);
  }
  async nip04Encrypt(e, o) {
    return this.rpc("nip04_encrypt", [e, o]);
  }
  async nip04Decrypt(e, o) {
    return this.rpc("nip04_decrypt", [e, o]);
  }
  /**
   * Pre-signs the courtesy protocol logout event (current NIP-46 defines
   * logout as exactly that -- a courtesy, never a security boundary). Must
   * run BEFORE close(), while the keys still exist; the caller then closes
   * IMMEDIATELY (local revocation must not wait on the network, BL-26) and
   * delivers the pre-signed event afterward via publishCourtesy().
   */
  buildLogoutEvent() {
    if (this.closed)
      return null;
    try {
      const e = $e(F(8)), o = Tn(this.conversationKey, JSON.stringify({ id: e, method: "logout", params: [] }));
      return W({
        pubkey: this.clientPubkey,
        created_at: Math.floor(Date.now() / 1e3),
        kind: Mt,
        tags: [["p", this.pointer.signerPubkey]],
        content: o
      }, this.clientSecretKey);
    } catch {
      return null;
    }
  }
  /**
   * Best-effort, bounded delivery of a pre-signed event. Safe (and intended)
   * to run AFTER close(): it needs no key material, and RelayConnection
   * reconnects transiently to publish. Never throws.
   */
  async publishCourtesy(e, o = 2e3) {
    try {
      await Promise.race([
        Promise.allSettled(this.conns.map((n) => n.publish(e))),
        new Promise((n) => setTimeout(n, o))
      ]);
    } catch {
    } finally {
      for (const n of this.conns)
        n.close();
    }
  }
  close() {
    this.closed = !0;
    for (const e of this.subs)
      e.close();
    this.subs = [];
    for (const e of this.conns)
      e.close();
    for (const [, e] of this.pending)
      clearTimeout(e.timer), e.reject(new Error("The signer connection was closed."));
    this.pending.clear(), S(this.clientSecretKey), S(this.conversationKey);
  }
}
async function qa(t) {
  const e = P(t.clientSecretKey), o = t.timeoutMs, n = t.relayUrls.map((s) => new sn(s, { authPrivateKey: t.clientSecretKey })), r = () => {
    for (const s of n)
      s.close();
  };
  return new Promise((s, i) => {
    let a = !1;
    const c = () => l(new Error("The signer-connection attempt was cancelled.")), l = (p) => {
      a || (a = !0, clearTimeout(d), t.signal?.removeEventListener("abort", c), r(), p instanceof Error ? i(p) : s(p));
    }, d = setTimeout(() => l(new Error(`No signer connected within ${Math.round(o / 1e3)}s. Scan or paste the connection code in your signer app, then try again.`)), o);
    if (t.signal?.aborted) {
      c();
      return;
    }
    t.signal?.addEventListener("abort", c, { once: !0 });
    const y = { kinds: [Mt], "#p": [e] }, f = (p) => {
      let g, v = null;
      try {
        v = Ae(t.clientSecretKey, p.pubkey), g = JSON.parse(or(v, p.content));
      } catch {
        return;
      } finally {
        v && S(v);
      }
      g.result === t.secret && l({ signerPubkey: p.pubkey });
    };
    Promise.allSettled(n.map((p) => p.subscribeLive(y, f))).then((p) => {
      p.some((g) => g.status === "fulfilled") || l(new Error("Could not reach any relay to listen for the signer."));
    });
  });
}
function fr() {
  const t = globalThis.crypto;
  if (!t || !t.subtle)
    throw new Error("WebCrypto SubtleCrypto is not available in this environment.");
  return t;
}
async function $o(t) {
  if (t.length !== 32)
    throw new Error("AES-256-GCM key must be exactly 32 bytes.");
  return fr().subtle.importKey("raw", t, "AES-GCM", !1, ["encrypt", "decrypt"]);
}
async function Wo(t, e, o) {
  const n = gi(), r = await $o(t), s = await fr().subtle.encrypt({ name: "AES-GCM", iv: n, additionalData: o, tagLength: 128 }, r, e);
  return { nonce: n, ciphertext: new Uint8Array(s) };
}
async function Vo(t, e, o, n) {
  const r = await $o(t);
  try {
    const s = await fr().subtle.decrypt({ name: "AES-GCM", iv: e, additionalData: n, tagLength: 128 }, r, o);
    return new Uint8Array(s);
  } catch {
    throw new Error("AES-256-GCM authentication failed: capsule is corrupted, tampered, or the wrong key was used.");
  }
}
const Bo = `abandon
ability
able
about
above
absent
absorb
abstract
absurd
abuse
access
accident
account
accuse
achieve
acid
acoustic
acquire
across
act
action
actor
actress
actual
adapt
add
addict
address
adjust
admit
adult
advance
advice
aerobic
affair
afford
afraid
again
age
agent
agree
ahead
aim
air
airport
aisle
alarm
album
alcohol
alert
alien
all
alley
allow
almost
alone
alpha
already
also
alter
always
amateur
amazing
among
amount
amused
analyst
anchor
ancient
anger
angle
angry
animal
ankle
announce
annual
another
answer
antenna
antique
anxiety
any
apart
apology
appear
apple
approve
april
arch
arctic
area
arena
argue
arm
armed
armor
army
around
arrange
arrest
arrive
arrow
art
artefact
artist
artwork
ask
aspect
assault
asset
assist
assume
asthma
athlete
atom
attack
attend
attitude
attract
auction
audit
august
aunt
author
auto
autumn
average
avocado
avoid
awake
aware
away
awesome
awful
awkward
axis
baby
bachelor
bacon
badge
bag
balance
balcony
ball
bamboo
banana
banner
bar
barely
bargain
barrel
base
basic
basket
battle
beach
bean
beauty
because
become
beef
before
begin
behave
behind
believe
below
belt
bench
benefit
best
betray
better
between
beyond
bicycle
bid
bike
bind
biology
bird
birth
bitter
black
blade
blame
blanket
blast
bleak
bless
blind
blood
blossom
blouse
blue
blur
blush
board
boat
body
boil
bomb
bone
bonus
book
boost
border
boring
borrow
boss
bottom
bounce
box
boy
bracket
brain
brand
brass
brave
bread
breeze
brick
bridge
brief
bright
bring
brisk
broccoli
broken
bronze
broom
brother
brown
brush
bubble
buddy
budget
buffalo
build
bulb
bulk
bullet
bundle
bunker
burden
burger
burst
bus
business
busy
butter
buyer
buzz
cabbage
cabin
cable
cactus
cage
cake
call
calm
camera
camp
can
canal
cancel
candy
cannon
canoe
canvas
canyon
capable
capital
captain
car
carbon
card
cargo
carpet
carry
cart
case
cash
casino
castle
casual
cat
catalog
catch
category
cattle
caught
cause
caution
cave
ceiling
celery
cement
census
century
cereal
certain
chair
chalk
champion
change
chaos
chapter
charge
chase
chat
cheap
check
cheese
chef
cherry
chest
chicken
chief
child
chimney
choice
choose
chronic
chuckle
chunk
churn
cigar
cinnamon
circle
citizen
city
civil
claim
clap
clarify
claw
clay
clean
clerk
clever
click
client
cliff
climb
clinic
clip
clock
clog
close
cloth
cloud
clown
club
clump
cluster
clutch
coach
coast
coconut
code
coffee
coil
coin
collect
color
column
combine
come
comfort
comic
common
company
concert
conduct
confirm
congress
connect
consider
control
convince
cook
cool
copper
copy
coral
core
corn
correct
cost
cotton
couch
country
couple
course
cousin
cover
coyote
crack
cradle
craft
cram
crane
crash
crater
crawl
crazy
cream
credit
creek
crew
cricket
crime
crisp
critic
crop
cross
crouch
crowd
crucial
cruel
cruise
crumble
crunch
crush
cry
crystal
cube
culture
cup
cupboard
curious
current
curtain
curve
cushion
custom
cute
cycle
dad
damage
damp
dance
danger
daring
dash
daughter
dawn
day
deal
debate
debris
decade
december
decide
decline
decorate
decrease
deer
defense
define
defy
degree
delay
deliver
demand
demise
denial
dentist
deny
depart
depend
deposit
depth
deputy
derive
describe
desert
design
desk
despair
destroy
detail
detect
develop
device
devote
diagram
dial
diamond
diary
dice
diesel
diet
differ
digital
dignity
dilemma
dinner
dinosaur
direct
dirt
disagree
discover
disease
dish
dismiss
disorder
display
distance
divert
divide
divorce
dizzy
doctor
document
dog
doll
dolphin
domain
donate
donkey
donor
door
dose
double
dove
draft
dragon
drama
drastic
draw
dream
dress
drift
drill
drink
drip
drive
drop
drum
dry
duck
dumb
dune
during
dust
dutch
duty
dwarf
dynamic
eager
eagle
early
earn
earth
easily
east
easy
echo
ecology
economy
edge
edit
educate
effort
egg
eight
either
elbow
elder
electric
elegant
element
elephant
elevator
elite
else
embark
embody
embrace
emerge
emotion
employ
empower
empty
enable
enact
end
endless
endorse
enemy
energy
enforce
engage
engine
enhance
enjoy
enlist
enough
enrich
enroll
ensure
enter
entire
entry
envelope
episode
equal
equip
era
erase
erode
erosion
error
erupt
escape
essay
essence
estate
eternal
ethics
evidence
evil
evoke
evolve
exact
example
excess
exchange
excite
exclude
excuse
execute
exercise
exhaust
exhibit
exile
exist
exit
exotic
expand
expect
expire
explain
expose
express
extend
extra
eye
eyebrow
fabric
face
faculty
fade
faint
faith
fall
false
fame
family
famous
fan
fancy
fantasy
farm
fashion
fat
fatal
father
fatigue
fault
favorite
feature
february
federal
fee
feed
feel
female
fence
festival
fetch
fever
few
fiber
fiction
field
figure
file
film
filter
final
find
fine
finger
finish
fire
firm
first
fiscal
fish
fit
fitness
fix
flag
flame
flash
flat
flavor
flee
flight
flip
float
flock
floor
flower
fluid
flush
fly
foam
focus
fog
foil
fold
follow
food
foot
force
forest
forget
fork
fortune
forum
forward
fossil
foster
found
fox
fragile
frame
frequent
fresh
friend
fringe
frog
front
frost
frown
frozen
fruit
fuel
fun
funny
furnace
fury
future
gadget
gain
galaxy
gallery
game
gap
garage
garbage
garden
garlic
garment
gas
gasp
gate
gather
gauge
gaze
general
genius
genre
gentle
genuine
gesture
ghost
giant
gift
giggle
ginger
giraffe
girl
give
glad
glance
glare
glass
glide
glimpse
globe
gloom
glory
glove
glow
glue
goat
goddess
gold
good
goose
gorilla
gospel
gossip
govern
gown
grab
grace
grain
grant
grape
grass
gravity
great
green
grid
grief
grit
grocery
group
grow
grunt
guard
guess
guide
guilt
guitar
gun
gym
habit
hair
half
hammer
hamster
hand
happy
harbor
hard
harsh
harvest
hat
have
hawk
hazard
head
health
heart
heavy
hedgehog
height
hello
helmet
help
hen
hero
hidden
high
hill
hint
hip
hire
history
hobby
hockey
hold
hole
holiday
hollow
home
honey
hood
hope
horn
horror
horse
hospital
host
hotel
hour
hover
hub
huge
human
humble
humor
hundred
hungry
hunt
hurdle
hurry
hurt
husband
hybrid
ice
icon
idea
identify
idle
ignore
ill
illegal
illness
image
imitate
immense
immune
impact
impose
improve
impulse
inch
include
income
increase
index
indicate
indoor
industry
infant
inflict
inform
inhale
inherit
initial
inject
injury
inmate
inner
innocent
input
inquiry
insane
insect
inside
inspire
install
intact
interest
into
invest
invite
involve
iron
island
isolate
issue
item
ivory
jacket
jaguar
jar
jazz
jealous
jeans
jelly
jewel
job
join
joke
journey
joy
judge
juice
jump
jungle
junior
junk
just
kangaroo
keen
keep
ketchup
key
kick
kid
kidney
kind
kingdom
kiss
kit
kitchen
kite
kitten
kiwi
knee
knife
knock
know
lab
label
labor
ladder
lady
lake
lamp
language
laptop
large
later
latin
laugh
laundry
lava
law
lawn
lawsuit
layer
lazy
leader
leaf
learn
leave
lecture
left
leg
legal
legend
leisure
lemon
lend
length
lens
leopard
lesson
letter
level
liar
liberty
library
license
life
lift
light
like
limb
limit
link
lion
liquid
list
little
live
lizard
load
loan
lobster
local
lock
logic
lonely
long
loop
lottery
loud
lounge
love
loyal
lucky
luggage
lumber
lunar
lunch
luxury
lyrics
machine
mad
magic
magnet
maid
mail
main
major
make
mammal
man
manage
mandate
mango
mansion
manual
maple
marble
march
margin
marine
market
marriage
mask
mass
master
match
material
math
matrix
matter
maximum
maze
meadow
mean
measure
meat
mechanic
medal
media
melody
melt
member
memory
mention
menu
mercy
merge
merit
merry
mesh
message
metal
method
middle
midnight
milk
million
mimic
mind
minimum
minor
minute
miracle
mirror
misery
miss
mistake
mix
mixed
mixture
mobile
model
modify
mom
moment
monitor
monkey
monster
month
moon
moral
more
morning
mosquito
mother
motion
motor
mountain
mouse
move
movie
much
muffin
mule
multiply
muscle
museum
mushroom
music
must
mutual
myself
mystery
myth
naive
name
napkin
narrow
nasty
nation
nature
near
neck
need
negative
neglect
neither
nephew
nerve
nest
net
network
neutral
never
news
next
nice
night
noble
noise
nominee
noodle
normal
north
nose
notable
note
nothing
notice
novel
now
nuclear
number
nurse
nut
oak
obey
object
oblige
obscure
observe
obtain
obvious
occur
ocean
october
odor
off
offer
office
often
oil
okay
old
olive
olympic
omit
once
one
onion
online
only
open
opera
opinion
oppose
option
orange
orbit
orchard
order
ordinary
organ
orient
original
orphan
ostrich
other
outdoor
outer
output
outside
oval
oven
over
own
owner
oxygen
oyster
ozone
pact
paddle
page
pair
palace
palm
panda
panel
panic
panther
paper
parade
parent
park
parrot
party
pass
patch
path
patient
patrol
pattern
pause
pave
payment
peace
peanut
pear
peasant
pelican
pen
penalty
pencil
people
pepper
perfect
permit
person
pet
phone
photo
phrase
physical
piano
picnic
picture
piece
pig
pigeon
pill
pilot
pink
pioneer
pipe
pistol
pitch
pizza
place
planet
plastic
plate
play
please
pledge
pluck
plug
plunge
poem
poet
point
polar
pole
police
pond
pony
pool
popular
portion
position
possible
post
potato
pottery
poverty
powder
power
practice
praise
predict
prefer
prepare
present
pretty
prevent
price
pride
primary
print
priority
prison
private
prize
problem
process
produce
profit
program
project
promote
proof
property
prosper
protect
proud
provide
public
pudding
pull
pulp
pulse
pumpkin
punch
pupil
puppy
purchase
purity
purpose
purse
push
put
puzzle
pyramid
quality
quantum
quarter
question
quick
quit
quiz
quote
rabbit
raccoon
race
rack
radar
radio
rail
rain
raise
rally
ramp
ranch
random
range
rapid
rare
rate
rather
raven
raw
razor
ready
real
reason
rebel
rebuild
recall
receive
recipe
record
recycle
reduce
reflect
reform
refuse
region
regret
regular
reject
relax
release
relief
rely
remain
remember
remind
remove
render
renew
rent
reopen
repair
repeat
replace
report
require
rescue
resemble
resist
resource
response
result
retire
retreat
return
reunion
reveal
review
reward
rhythm
rib
ribbon
rice
rich
ride
ridge
rifle
right
rigid
ring
riot
ripple
risk
ritual
rival
river
road
roast
robot
robust
rocket
romance
roof
rookie
room
rose
rotate
rough
round
route
royal
rubber
rude
rug
rule
run
runway
rural
sad
saddle
sadness
safe
sail
salad
salmon
salon
salt
salute
same
sample
sand
satisfy
satoshi
sauce
sausage
save
say
scale
scan
scare
scatter
scene
scheme
school
science
scissors
scorpion
scout
scrap
screen
script
scrub
sea
search
season
seat
second
secret
section
security
seed
seek
segment
select
sell
seminar
senior
sense
sentence
series
service
session
settle
setup
seven
shadow
shaft
shallow
share
shed
shell
sheriff
shield
shift
shine
ship
shiver
shock
shoe
shoot
shop
short
shoulder
shove
shrimp
shrug
shuffle
shy
sibling
sick
side
siege
sight
sign
silent
silk
silly
silver
similar
simple
since
sing
siren
sister
situate
six
size
skate
sketch
ski
skill
skin
skirt
skull
slab
slam
sleep
slender
slice
slide
slight
slim
slogan
slot
slow
slush
small
smart
smile
smoke
smooth
snack
snake
snap
sniff
snow
soap
soccer
social
sock
soda
soft
solar
soldier
solid
solution
solve
someone
song
soon
sorry
sort
soul
sound
soup
source
south
space
spare
spatial
spawn
speak
special
speed
spell
spend
sphere
spice
spider
spike
spin
spirit
split
spoil
sponsor
spoon
sport
spot
spray
spread
spring
spy
square
squeeze
squirrel
stable
stadium
staff
stage
stairs
stamp
stand
start
state
stay
steak
steel
stem
step
stereo
stick
still
sting
stock
stomach
stone
stool
story
stove
strategy
street
strike
strong
struggle
student
stuff
stumble
style
subject
submit
subway
success
such
sudden
suffer
sugar
suggest
suit
summer
sun
sunny
sunset
super
supply
supreme
sure
surface
surge
surprise
surround
survey
suspect
sustain
swallow
swamp
swap
swarm
swear
sweet
swift
swim
swing
switch
sword
symbol
symptom
syrup
system
table
tackle
tag
tail
talent
talk
tank
tape
target
task
taste
tattoo
taxi
teach
team
tell
ten
tenant
tennis
tent
term
test
text
thank
that
theme
then
theory
there
they
thing
this
thought
three
thrive
throw
thumb
thunder
ticket
tide
tiger
tilt
timber
time
tiny
tip
tired
tissue
title
toast
tobacco
today
toddler
toe
together
toilet
token
tomato
tomorrow
tone
tongue
tonight
tool
tooth
top
topic
topple
torch
tornado
tortoise
toss
total
tourist
toward
tower
town
toy
track
trade
traffic
tragic
train
transfer
trap
trash
travel
tray
treat
tree
trend
trial
tribe
trick
trigger
trim
trip
trophy
trouble
truck
true
truly
trumpet
trust
truth
try
tube
tuition
tumble
tuna
tunnel
turkey
turn
turtle
twelve
twenty
twice
twin
twist
two
type
typical
ugly
umbrella
unable
unaware
uncle
uncover
under
undo
unfair
unfold
unhappy
uniform
unique
unit
universe
unknown
unlock
until
unusual
unveil
update
upgrade
uphold
upon
upper
upset
urban
urge
usage
use
used
useful
useless
usual
utility
vacant
vacuum
vague
valid
valley
valve
van
vanish
vapor
various
vast
vault
vehicle
velvet
vendor
venture
venue
verb
verify
version
very
vessel
veteran
viable
vibrant
vicious
victory
video
view
village
vintage
violin
virtual
virus
visa
visit
visual
vital
vivid
vocal
voice
void
volcano
volume
vote
voyage
wage
wagon
wait
walk
wall
walnut
want
warfare
warm
warrior
wash
wasp
waste
water
wave
way
wealth
weapon
wear
weasel
weather
web
wedding
weekend
weird
welcome
west
wet
whale
what
wheat
wheel
when
where
whip
whisper
wide
width
wife
wild
will
win
window
wine
wing
wink
winner
winter
wire
wisdom
wise
wish
witness
wolf
woman
wonder
wood
wool
word
work
world
worry
worth
wrap
wreck
wrestle
wrist
write
wrong
yard
year
yellow
you
young
youth
zebra
zero
zone
zoo`.split(`
`);
function Fa(t, e, o, n) {
  ki(t);
  const r = Ei({ dkLen: 32, asyncTick: 10 }, n), { c: s, dkLen: i, asyncTick: a } = r;
  if (dn(s), dn(i), dn(a), s < 1)
    throw new Error("iterations (c) should be >= 1");
  const c = Ur(e), l = Ur(o), d = new Uint8Array(i), y = Eo.create(t, c), f = y._cloneInto().update(l);
  return { c: s, dkLen: i, asyncTick: a, DK: d, PRF: y, PRFSalt: f };
}
function $a(t, e, o, n, r) {
  return t.destroy(), e.destroy(), n && n.destroy(), _i(r), o;
}
async function Wa(t, e, o, n) {
  const { c: r, dkLen: s, asyncTick: i, DK: a, PRF: c, PRFSalt: l } = Fa(t, e, o, n);
  let d;
  const y = new Uint8Array(4), f = mi(y), p = new Uint8Array(c.outputLen);
  for (let g = 1, v = 0; v < s; g++, v += c.outputLen) {
    const b = a.subarray(v, v + c.outputLen);
    f.setInt32(0, g, !1), (d = l._cloneInto(d)).update(y).digestInto(p), b.set(p.subarray(0, b.length)), await bi(r - 1, i, () => {
      c._cloneInto(d).update(p).digestInto(p);
      for (let h = 0; h < b.length; h++)
        b[h] ^= p[h];
    });
  }
  return $a(c, l, a, d, p);
}
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const Va = (t) => t[0] === "あいこくしん";
function jo(t) {
  if (typeof t != "string")
    throw new TypeError("invalid mnemonic type: " + typeof t);
  return t.normalize("NFKD");
}
function Jo(t) {
  const e = jo(t), o = e.split(" ");
  if (![12, 15, 18, 21, 24].includes(o.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: e, words: o };
}
function Go(t) {
  Si(t, 16, 20, 24, 28, 32);
}
const Ba = (t) => {
  const e = 8 - t.length / 4;
  return new Uint8Array([_o(t)[0] >> e << e]);
};
function Ho(t) {
  if (!Array.isArray(t) || t.length !== 2048 || typeof t[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return t.forEach((e) => {
    if (typeof e != "string")
      throw new Error("wordlist: non-string element: " + e);
  }), St.chain(St.checksum(1, Ba), St.radix2(11, !0), St.alphabet(t));
}
function ja(t, e) {
  const { words: o } = Jo(t), n = Ho(e).decode(o);
  return Go(n), n;
}
function Ja(t, e) {
  return Go(t), Ho(e).encode(t).join(Va(e) ? "　" : " ");
}
function Ga(t, e) {
  try {
    ja(t, e);
  } catch {
    return !1;
  }
  return !0;
}
const Ha = (t) => jo("mnemonic" + t);
function za(t, e = "") {
  return Wa(Pi, Jo(t).nfkd, Ha(e), { c: 2048, dkLen: 64 });
}
function Qa(t) {
  if (t.length !== 16)
    throw new Error("Recovery phrase entropy must be exactly 128 bits (16 bytes).");
  return Ja(t, Bo);
}
function zo(t) {
  try {
    return Ga(Qo(t), Bo);
  } catch {
    return !1;
  }
}
function Qo(t) {
  return t.trim().normalize("NFKD").toLowerCase().split(/\s+/u).join(" ");
}
async function pr(t) {
  return za(Qo(t), "");
}
const Lt = [1024, 2048, 4096], Se = 4;
function Ya(t) {
  const e = Se + t.length, o = Lt.find((s) => s >= e);
  if (o === void 0)
    throw new Error(`Payload of ${t.length} bytes exceeds the largest padding bucket (${Lt[Lt.length - 1]} bytes minus ${Se}-byte length prefix).`);
  const n = new Uint8Array(o);
  return new DataView(n.buffer).setUint32(0, t.length, !1), n.set(t, Se), n;
}
function Xa(t) {
  if (!Lt.includes(t.length))
    throw new Error(`Padded plaintext length ${t.length} does not match a known bucket.`);
  const o = new DataView(t.buffer, t.byteOffset, t.byteLength).getUint32(0, !1);
  if (o > t.length - Se)
    throw new Error("Declared payload length exceeds the padded bucket size.");
  const n = t.slice(Se, Se + o), r = t.slice(Se + o);
  for (const s of r)
    if (s !== 0)
      throw new Error("Padding bytes are not all zero; capsule plaintext is malformed.");
  return n;
}
function Za(t) {
  const e = Ki(t);
  if (e === void 0)
    throw new Error("Value is not JSON-serializable for canonicalization.");
  return e;
}
function ec(t) {
  return V(Za(t));
}
const he = 16, tc = 283;
function nc(t) {
  if (![16, 24, 32].includes(t.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + t.length);
}
function hr(t) {
  return t << 1 ^ tc & -(t >> 7);
}
function qe(t, e) {
  let o = 0;
  for (; e > 0; e >>= 1)
    o ^= t & -(e & 1), t = hr(t);
  return o;
}
const In = /* @__PURE__ */ (() => {
  const t = new Uint8Array(256);
  for (let o = 0, n = 1; o < 256; o++, n ^= hr(n))
    t[o] = n;
  const e = new Uint8Array(256);
  e[0] = 99;
  for (let o = 0; o < 255; o++) {
    let n = t[255 - o];
    n |= n << 8, e[t[o]] = (n ^ n >> 4 ^ n >> 5 ^ n >> 6 ^ n >> 7 ^ 99) & 255;
  }
  return pt(t), e;
})(), rc = /* @__PURE__ */ In.map((t, e) => In.indexOf(e)), oc = (t) => t << 24 | t >>> 8, hn = (t) => t << 8 | t >>> 24;
function Yo(t, e) {
  if (t.length !== 256)
    throw new Error("Wrong sbox length");
  const o = new Uint32Array(256).map((l, d) => e(t[d])), n = o.map(hn), r = n.map(hn), s = r.map(hn), i = new Uint32Array(256 * 256), a = new Uint32Array(256 * 256), c = new Uint16Array(256 * 256);
  for (let l = 0; l < 256; l++)
    for (let d = 0; d < 256; d++) {
      const y = l * 256 + d;
      i[y] = o[l] ^ n[d], a[y] = r[l] ^ s[d], c[y] = t[l] << 8 | t[d];
    }
  return { sbox: t, sbox2: c, T0: o, T1: n, T2: r, T3: s, T01: i, T23: a };
}
const wr = /* @__PURE__ */ Yo(In, (t) => qe(t, 3) << 24 | t << 16 | t << 8 | qe(t, 2)), Xo = /* @__PURE__ */ Yo(rc, (t) => qe(t, 11) << 24 | qe(t, 13) << 16 | qe(t, 9) << 8 | qe(t, 14)), sc = /* @__PURE__ */ (() => {
  const t = new Uint8Array(16);
  for (let e = 0, o = 1; e < 16; e++, o = hr(o))
    t[e] = o;
  return t;
})();
function Zo(t) {
  sr(t);
  const e = t.length;
  nc(t);
  const { sbox2: o } = wr, n = [];
  (!st || !it(t)) && n.push(t = at(t));
  const r = se(ce(t)), s = r.length, i = (c) => z(o, c, c, c, c), a = new Uint32Array(e + 28);
  a.set(r);
  for (let c = s; c < a.length; c++) {
    let l = a[c - 1];
    c % s === 0 ? l = i(oc(l)) ^ sc[c / s - 1] : s > 6 && c % s === 4 && (l = i(l)), a[c] = a[c - s] ^ l;
  }
  return pt(...n), a;
}
function ic(t) {
  const e = Zo(t), o = e.slice(), n = e.length, { sbox2: r } = wr, { T0: s, T1: i, T2: a, T3: c } = Xo;
  for (let l = 0; l < n; l += 4)
    for (let d = 0; d < 4; d++)
      o[l + d] = e[n - l - 4 + d];
  pt(e);
  for (let l = 4; l < n - 4; l++) {
    const d = o[l], y = z(r, d, d, d, d);
    o[l] = s[y & 255] ^ i[y >>> 8 & 255] ^ a[y >>> 16 & 255] ^ c[y >>> 24];
  }
  return o;
}
function le(t, e, o, n, r, s) {
  return t[o << 8 & 65280 | n >>> 8 & 255] ^ e[r >>> 8 & 65280 | s >>> 24 & 255];
}
function z(t, e, o, n, r) {
  return t[e & 255 | o & 65280] | t[n >>> 16 & 255 | r >>> 16 & 65280] << 16;
}
function Xr(t, e, o, n, r) {
  const { sbox2: s, T01: i, T23: a } = wr;
  let c = 0;
  e ^= t[c++], o ^= t[c++], n ^= t[c++], r ^= t[c++];
  const l = t.length / 4 - 2;
  for (let g = 0; g < l; g++) {
    const v = t[c++] ^ le(i, a, e, o, n, r), b = t[c++] ^ le(i, a, o, n, r, e), h = t[c++] ^ le(i, a, n, r, e, o), k = t[c++] ^ le(i, a, r, e, o, n);
    e = v, o = b, n = h, r = k;
  }
  const d = t[c++] ^ z(s, e, o, n, r), y = t[c++] ^ z(s, o, n, r, e), f = t[c++] ^ z(s, n, r, e, o), p = t[c++] ^ z(s, r, e, o, n);
  return { s0: d, s1: y, s2: f, s3: p };
}
function ac(t, e, o, n, r) {
  const { sbox2: s, T01: i, T23: a } = Xo;
  let c = 0;
  e ^= t[c++], o ^= t[c++], n ^= t[c++], r ^= t[c++];
  const l = t.length / 4 - 2;
  for (let g = 0; g < l; g++) {
    const v = t[c++] ^ le(i, a, e, r, n, o), b = t[c++] ^ le(i, a, o, e, r, n), h = t[c++] ^ le(i, a, n, o, e, r), k = t[c++] ^ le(i, a, r, n, o, e);
    e = v, o = b, n = h, r = k;
  }
  const d = t[c++] ^ z(s, e, r, n, o), y = t[c++] ^ z(s, o, e, r, n), f = t[c++] ^ z(s, n, o, e, r), p = t[c++] ^ z(s, r, n, o, e);
  return { s0: d, s1: y, s2: f, s3: p };
}
function cc(t) {
  if (sr(t), t.length % he !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + he);
}
function lc(t, e, o) {
  sr(t);
  let n = t.length;
  const r = n % he;
  if (!e && r !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (e) {
    let a = he - r;
    a || (a = he), n = n + a;
  }
  o = Ro(n, o), Co(t, o), (!st || !it(t)) && (t = at(t));
  const s = ce(t);
  se(s);
  const i = ce(o);
  return { b: s, o: i, out: o };
}
function uc(t, e) {
  if (!e)
    return t;
  const o = t.length;
  if (o === 0)
    throw new Error("aes/pkcs7: empty ciphertext not allowed");
  const n = t[o - 1];
  let r = 1;
  r &= n - 1 >>> 31 ^ 1, r &= 16 - n >>> 31 ^ 1;
  for (let s = 0; s < 16; s++) {
    const i = s - n >>> 31, a = (t[o - 1 - s] ^ n) === 0 ? 1 : 0;
    r &= a | i ^ 1;
  }
  if (!r)
    throw new Error("aes/pkcs7: wrong padding");
  return t.subarray(0, o - n);
}
function dc(t) {
  const e = new Uint8Array(16), o = ce(e);
  e.set(t);
  const n = he - t.length;
  for (let r = he - n; r < he; r++)
    e[r] = n;
  return o;
}
const es = /* @__PURE__ */ Oi({ blockSize: 16, nonceLength: 16 }, function(e, o, n = {}) {
  const r = !n.disablePadding;
  return {
    encrypt(s, i) {
      const a = Zo(e), { b: c, o: l, out: d } = lc(s, r, i);
      let y = o;
      const f = [a];
      (!st || !it(y)) && f.push(y = at(y));
      const p = ce(y);
      se(p);
      let g = p[0], v = p[1], b = p[2], h = p[3], k = 0;
      for (; k + 4 <= c.length; )
        g ^= c[k + 0], v ^= c[k + 1], b ^= c[k + 2], h ^= c[k + 3], { s0: g, s1: v, s2: b, s3: h } = Xr(a, g, v, b, h), l[k++] = g, l[k++] = v, l[k++] = b, l[k++] = h;
      if (r) {
        const m = dc(s.subarray(k * 4));
        se(m), g ^= m[0], v ^= m[1], b ^= m[2], h ^= m[3], { s0: g, s1: v, s2: b, s3: h } = Xr(a, g, v, b, h), l[k++] = g, l[k++] = v, l[k++] = b, l[k++] = h;
      }
      return se(l), pt(...f), d;
    },
    decrypt(s, i) {
      cc(s);
      const a = ic(e);
      let c = o;
      const l = [a];
      (!st || !it(c)) && l.push(c = at(c));
      const d = ce(c);
      se(d), i = Ro(s.length, i), Co(s, i), (!st || !it(s)) && l.push(s = at(s));
      const y = ce(s), f = ce(i);
      se(y);
      let p = d[0], g = d[1], v = d[2], b = d[3];
      for (let h = 0; h + 4 <= y.length; ) {
        const k = p, m = g, _ = v, O = b;
        p = y[h + 0], g = y[h + 1], v = y[h + 2], b = y[h + 3];
        const { s0: q, s1: Y, s2: X, s3: E } = ac(a, p, g, v, b);
        f[h++] = q ^ k, f[h++] = Y ^ m, f[h++] = X ^ _, f[h++] = E ^ O;
      }
      return se(f), pt(...l), uc(i, r);
    }
  };
});
function ts(t, e) {
  const o = tr(new Uint8Array([2]), Po(e));
  return Ai.getSharedSecret(t, o, !0).slice(1, 33);
}
function yc(t, e, o) {
  return fc(t, e, o, F(16));
}
function fc(t, e, o, n) {
  if (n.length !== 16)
    throw new Error("NIP-04 iv must be exactly 16 bytes.");
  const r = ts(t, e), s = es(r, n).encrypt(V(o));
  return `${Ft.encode(s)}?iv=${Ft.encode(n)}`;
}
function pc(t, e, o) {
  const n = o.indexOf("?iv=");
  if (n === -1)
    throw new Error('NIP-04 payload is missing its "?iv=" suffix.');
  const r = Ft.decode(o.slice(0, n)), s = Ft.decode(o.slice(n + 4)), i = ts(t, e), a = es(i, s).decrypt(r);
  return er(a);
}
class Ce extends Error {
  reason;
  constructor(e) {
    super("Account not found or credentials incorrect."), this.name = "AccountNotFoundError", this.reason = e;
  }
}
class ue extends Error {
  constructor(e) {
    super(e), this.name = "RegistrationFailedError";
  }
}
class ns extends Error {
  constructor(e = "An account already exists with this login name and password. Sign in instead, or choose different credentials.") {
    super(e), this.name = "AccountAlreadyExistsError";
  }
}
class de extends Error {
  constructor(e) {
    super(e), this.name = "RecoveryFailedError";
  }
}
class rs extends Error {
  seenGeneration;
  capsuleGeneration;
  constructor(e, o) {
    super(`This credential capsule reports generation ${o}, but this device has already seen generation ${e}. Refusing to log in with older, possibly-revoked credentials.`), this.name = "RollbackDetectedError", this.seenGeneration = e, this.capsuleGeneration = o;
  }
}
function vt(t, e) {
  const o = e ?? Math.floor(Date.now() / 1e3);
  return t == null ? o : Math.max(o, t + 1);
}
const hc = { generation: -1, recoveryGeneration: -1 };
function vr(t) {
  return `bitlogin:hwm:${t}`;
}
async function gr(t, e) {
  const o = await t.get(vr(e));
  return o ? JSON.parse(o) : hc;
}
async function os(t, e, o) {
  const n = await gr(t, e), r = {
    generation: Math.max(n.generation, o.generation ?? -1),
    recoveryGeneration: Math.max(n.recoveryGeneration, o.recoveryGeneration ?? -1)
  };
  return await t.set(vr(e), JSON.stringify(r)), r;
}
async function wc(t, e, o = { generation: 0, recoveryGeneration: -1 }) {
  await t.set(vr(e), JSON.stringify(o));
}
function vc(t, e, o) {
  return W({ pubkey: P(t), created_at: o, kind: qt, tags: [], content: JSON.stringify(e) }, t);
}
function gc(t, e, o) {
  const n = e.map((r) => {
    const s = ["r", r.url];
    return r.read && !r.write && s.push("read"), r.write && !r.read && s.push("write"), s;
  });
  return W({ pubkey: P(t), created_at: o, kind: yt, tags: n, content: "" }, t);
}
function mc(t, e, o) {
  return W({
    pubkey: P(t),
    created_at: o,
    kind: Yn,
    tags: e.map((n) => ["relay", n]),
    content: ""
  }, t);
}
function bc(t) {
  return t.tags.filter((e) => e[0] === "r" && e[1]).map((e) => e[1]);
}
function kc(t) {
  return t.tags.filter((e) => e[0] === "relay" && e[1]).map((e) => e[1]);
}
async function Ec(t) {
  const e = P(t.everydayPrivateKey), o = Math.floor(Date.now() / 1e3), n = [.../* @__PURE__ */ new Set([...t.generalRelays, ...t.dmRelays, ...t.discoveryRelays])], r = new T(n), [s, i, a] = await Promise.all([
    r.queryQuorum({ authors: [e], kinds: [qt] }),
    r.queryQuorum({ authors: [e], kinds: [yt] }),
    r.queryQuorum({ authors: [e], kinds: [Yn] })
  ]);
  r.closeAll();
  const c = s.outcomes.some((b) => b.events.length > 0), l = i.outcomes.some((b) => b.events.length > 0), d = a.outcomes.some((b) => b.events.length > 0), y = new T(n);
  let f = null, p = null, g = null;
  const v = [];
  if (!c && (t.name || t.about || t.picture)) {
    const b = vc(t.everydayPrivateKey, { name: t.name, about: t.about, picture: t.picture }, o);
    v.push(y.publishAll(b).then((h) => void (f = h)));
  }
  if (!l) {
    const b = gc(t.everydayPrivateKey, t.generalRelays.map((h) => ({ url: h, read: !0, write: !0 })), o);
    v.push(y.publishAll(b).then((h) => void (p = h)));
  }
  if (!d) {
    const b = mc(t.everydayPrivateKey, t.dmRelays, o);
    v.push(y.publishAll(b).then((h) => void (g = h)));
  }
  return await Promise.all(v), y.closeAll(), {
    profilePublished: f !== null && $(f) > 0,
    relayListAcknowledgedCount: p !== null ? $(p) : 0,
    dmRelayListAcknowledgedCount: g !== null ? $(g) : 0,
    profileSkippedExisting: c,
    relayListSkippedExisting: l,
    dmRelayListSkippedExisting: d
  };
}
async function Ne(t, e, o) {
  const n = o.minAcks ?? 2, r = o.minReadbacks ?? 2, s = await t.publishAll(e, o.timeoutMs), i = $(s), c = (await t.queryQuorum({ kinds: [U], authors: [e.pubkey], "#d": [o.dTag], limit: 5 }, o.timeoutMs)).outcomes.filter((l) => l.events.some((d) => d.id === e.id)).length;
  return {
    acknowledgedCount: i,
    readbackVerifiedCount: c,
    success: i >= n && c >= r
  };
}
function ss(t) {
  return V(`bitlogin|password-capsule|v1|${t}|30078|bitlogin:password:v1`);
}
function is(t) {
  return V(`bitlogin|recovery-capsule|v1|${t}|30078|bitlogin:recovery:v1`);
}
async function mr(t, e, o) {
  const n = ec(t), r = Ya(n), s = await Wo(e, r, o);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    nonce: L(s.nonce),
    ciphertext: L(s.ciphertext)
  };
}
async function br(t, e, o) {
  if (t.version !== 1 || t.algorithm !== "aes-256-gcm")
    throw new Error(`Unsupported capsule envelope version/algorithm: ${t.version}/${t.algorithm}`);
  const n = x(t.nonce), r = x(t.ciphertext), s = await Vo(e, n, r, o), i = Xa(s);
  return JSON.parse(er(i));
}
class kr extends Error {
  constructor(e) {
    super(e), this.name = "CapsuleValidationError";
  }
}
const _c = 1e6, Pc = /^[0-9a-f]{64}$/u;
function M(t, e) {
  if (!t)
    throw new kr(e);
}
function Bt(t) {
  return typeof t == "string" && Pc.test(t);
}
function as(t) {
  M(Array.isArray(t), "vault_relay_hints must be an array (§12.4.7).");
  for (const e of t)
    M(typeof e == "string", "Each relay hint must be a string (§12.4.7)."), M(Et(e), `Relay URL must use secure WebSockets, except for an explicit loopback development endpoint (§12.4.7): ${e}`);
}
function cs(t) {
  M(typeof t == "string", "account_id must be a string (§12.4.2).");
  let e;
  try {
    e = x(t);
  } catch {
    throw new kr("account_id is not valid base64url (§12.4.2).");
  }
  M(e.length === 16, "account_id must decode to exactly 128 bits (§12.4.2).");
}
function ls(t, e) {
  M(typeof t == "string", "operational_private_key must be a string (§12.4.3).");
  const o = x(t);
  M(o.length === 32, "operational_private_key must be exactly 32 bytes (§12.4.3)."), M(nr(o), "operational_private_key is not a valid secp256k1 scalar (§12.4.3)."), M(Bt(e), "operational_public_key must be lowercase 64-char hex (§12.4.4).");
  const n = P(o);
  M(n === e, "operational_public_key does not match the derived public key (§12.4.4).");
}
function jt(t, e) {
  M(typeof e == "string", `${t} must be a string (§CV5.2).`);
  let o;
  try {
    o = x(e);
  } catch {
    throw new kr(`${t} is not valid base64url (§CV5.2).`);
  }
  M(o.length === 32, `${t} must decode to exactly 32 bytes (§CV5.2).`);
}
function Sc(t) {
  const e = t.connection_vault_root, o = t.vault_sudo_key;
  e === void 0 && o === void 0 || (M(e !== void 0 && o !== void 0, "connection_vault_root and vault_sudo_key must appear together (§CV5.2)."), jt("connection_vault_root", e), jt("vault_sudo_key", o));
}
function Kc(t) {
  const e = t.connection_vault_root, o = t.vault_sudo_key;
  e === void 0 && o === void 0 || (M(e !== void 0, "vault_sudo_key cannot appear without connection_vault_root (§CV5.2)."), jt("connection_vault_root", e), o !== void 0 && jt("vault_sudo_key", o));
}
function us(t, e) {
  M(Number.isInteger(t) && t >= 0 && t <= _c, `${e} is out of supported bounds (§12.4.8).`);
}
function Ac(t) {
  M(t.schema === rn, `Unsupported or unknown schema: ${String(t.schema)} (§12.4.1)`), cs(t.account_id), us(t.generation, "generation"), ls(t.operational_private_key, t.operational_public_key), M(Bt(t.recovery_public_key), "recovery_public_key must be lowercase 64-char hex (§12.4.5)."), as(t.vault_relay_hints), Kc(t);
  const e = t.recovery_capsule_event;
  M(!!e && typeof e == "object", "recovery_capsule_event must be present (§12.4.6)."), M(C(e), "Embedded recovery_capsule_event has an invalid event id or signature (§12.4.6)."), M(e.pubkey === t.recovery_public_key, "Embedded recovery_capsule_event author does not match recovery_public_key (§12.4.5).");
}
function Rc(t) {
  M(t.schema === nn, `Unsupported or unknown schema: ${String(t.schema)} (§12.4.1)`), cs(t.account_id), us(t.recovery_generation, "recovery_generation"), M(t.previous_recovery_event_id === null || Bt(t.previous_recovery_event_id), "previous_recovery_event_id must be null or lowercase 64-char hex (§12.3)."), ls(t.operational_private_key, t.operational_public_key), M(Bt(t.recovery_public_key), "recovery_public_key must be lowercase 64-char hex."), as(t.vault_relay_hints), Sc(t);
}
function Cc(t) {
  const e = /* @__PURE__ */ new Map();
  for (const n of t) {
    const r = e.get(n.recoveryGeneration);
    if (r && r.eventId !== n.eventId)
      return {
        consistent: !1,
        warning: `Two different recovery capsules both claim generation ${n.recoveryGeneration}: possible fork, replay, or relay misbehavior.`
      };
    e.set(n.recoveryGeneration, n);
  }
  const o = [...t].sort((n, r) => n.recoveryGeneration - r.recoveryGeneration);
  for (let n = 1; n < o.length; n++) {
    const r = o[n];
    if (r.previousRecoveryEventId === null)
      return {
        consistent: !1,
        warning: `Generation ${r.recoveryGeneration} has a null previous-event link but is not the first generation.`
      };
    const s = e.get(r.recoveryGeneration - 1);
    if (!s)
      return {
        consistent: !1,
        warning: `Recovery generation ${r.recoveryGeneration - 1} is missing, so the chain up to generation ${r.recoveryGeneration} cannot be verified.`
      };
    if (r.previousRecoveryEventId !== s.eventId)
      return {
        consistent: !1,
        warning: `Recovery generation chain is broken between generation ${r.recoveryGeneration - 1} and ${r.recoveryGeneration}: possible replay or relay misbehavior.`
      };
  }
  return { consistent: !0 };
}
async function Er(t) {
  const e = P(t.locatorPrivateKey), o = await mr(t.payload, t.capsuleKey, ss(e));
  return W({
    pubkey: e,
    created_at: t.payload.created_at,
    kind: U,
    tags: [["d", He]],
    content: JSON.stringify(o)
  }, t.locatorPrivateKey);
}
function Nc(t) {
  const e = P(t.oldLocatorPrivateKey);
  return W({
    pubkey: e,
    created_at: t.createdAt,
    kind: U,
    tags: [["d", He]],
    content: ""
  }, t.oldLocatorPrivateKey);
}
async function Tc(t, e) {
  if (!C(t))
    throw new Error("Credential capsule event has an invalid id or signature.");
  const o = JSON.parse(t.content), n = await br(o, e, ss(t.pubkey));
  return Ac(n), n;
}
async function _r(t) {
  const e = P(t.recoveryPrivateKey), o = await mr(t.payload, t.capsuleKey, is(e));
  return W({
    pubkey: e,
    created_at: t.payload.created_at,
    kind: U,
    tags: [["d", bt]],
    content: JSON.stringify(o)
  }, t.recoveryPrivateKey);
}
async function ds(t, e) {
  if (!C(t))
    throw new Error("Recovery capsule event has an invalid id or signature.");
  const o = JSON.parse(t.content), n = await br(o, e, is(t.pubkey));
  return Rc(n), n;
}
function Mc(t) {
  return t.responded ? "answered" : /connecting to relay|Not connected to relay|Not waited for/u.test(t.error ?? "") ? "not-asked" : "slow";
}
function wn(t, e, o) {
  const n = /* @__PURE__ */ new Map();
  for (const r of t)
    r.pubkey === e && r.kind === U && we(r, "d") === o && C(r) && n.set(r.id, r);
  return [...n.values()].sort((r, s) => s.created_at - r.created_at);
}
async function ys(t, e, o, n, r) {
  const s = await t.queryQuorum({ kinds: [U], authors: [e], "#d": [o], limit: 5 }, r), i = s.outcomes.flatMap((f) => f.events), a = wn(i, e, o), c = [];
  for (const f of a)
    try {
      const p = await n(f);
      c.push({ event: f, payload: p });
    } catch (p) {
      c.push({ event: f, payload: null, error: p.message });
    }
  const l = c.find((f) => f.payload !== null) ?? null, d = s.outcomes.map((f) => ({
    responded: f.responded,
    events: wn(f.events, e, o)
  })).filter((f) => f.responded && f.events.length > 0).map((f) => f.events[0].id), y = new Set(d).size > 1;
  return {
    quorumMet: s.quorumMet,
    respondedCount: s.respondedCount,
    totalCount: s.totalCount,
    candidates: c,
    best: l,
    relayDisagreement: y,
    relays: s.outcomes.map((f) => ({ relayUrl: f.relayUrl, state: Mc(f), held: wn(f.events, e, o).length }))
  };
}
async function gt(t, e, o, n = 8e3) {
  return ys(t, e, He, (r) => Tc(r, o), n);
}
async function fs(t, e, o, n = 8e3) {
  return ys(t, e, bt, (r) => ds(r, o), n);
}
function Ic(t) {
  const e = t.filter((o) => o.payload !== null);
  return e.length < 2 ? { consistent: !0 } : Cc(e.map((o) => ({
    eventId: o.event.id,
    recoveryGeneration: o.payload.recovery_generation,
    previousRecoveryEventId: o.payload.previous_recovery_event_id
  })));
}
async function Lc(t, e, o) {
  const n = we(e, "d") ?? "", r = new T(t);
  try {
    const s = await r.queryQuorum({ kinds: [e.kind], authors: [e.pubkey], "#d": [n], limit: 5 }, o), i = [], a = /* @__PURE__ */ new Map();
    for (const c of s.outcomes) {
      const l = c.events.filter((d) => d.kind === e.kind && d.pubkey === e.pubkey && we(d, "d") === n);
      c.responded ? l.some((d) => d.id !== e.id) ? a.set(c.relayUrl, "held back: it holds another record at this address") : i.push(c.relayUrl) : a.set(c.relayUrl, "held back: it didn't answer what it holds at this address");
    }
    return { ok: i, heldBack: a };
  } finally {
    r.closeAll();
  }
}
async function Zr(t) {
  const e = [...new Set(t.relayUrls)], o = async (l, d = e) => {
    if (d.length === 0)
      return /* @__PURE__ */ new Map();
    const y = new T(d);
    try {
      const f = await y.publishAll(l, t.timeoutMs);
      return new Map(f.map((p) => [
        p.relayUrl,
        { ok: p.result.ok, message: p.result.message ?? "" }
      ]));
    } finally {
      y.closeAll();
    }
  }, n = await Lc(e, t.credentialEvent, t.timeoutMs), [r, s] = await Promise.all([
    o(t.credentialEvent, n.ok),
    o(t.recoveryEvent)
  ]), i = new Map(r);
  for (const [l, d] of n.heldBack)
    i.set(l, { ok: !1, message: d });
  const a = { ok: !1, message: "no reply" }, c = e.map((l) => ({
    relayUrl: l,
    credential: i.get(l) ?? a,
    recovery: s.get(l) ?? a
  }));
  return {
    credentialAcknowledgedCount: c.filter((l) => l.credential.ok).length,
    recoveryAcknowledgedCount: c.filter((l) => l.recovery.ok).length,
    relaysTried: c.length,
    relays: c
  };
}
function Oc(t) {
  const e = we(t, "d");
  if (t.kind !== U || e === void 0 || !C(t))
    throw new Error("This session's capsule event is not a valid capsule.");
  return { pubkey: t.pubkey, dTag: e };
}
function Dc(t, e, o) {
  const n = t.filter((s) => s.pubkey === o.pubkey && s.kind === U && we(s, "d") === o.dTag && C(s));
  return n.some((s) => s.id === e.id) ? "current" : n.length === 0 ? "missing" : Math.max(...n.map((s) => s.created_at)) >= e.created_at ? "newer" : "older";
}
async function eo(t, e, o) {
  const n = Oc(e), r = new T(t);
  try {
    const s = await r.queryQuorum({
      kinds: [U],
      authors: [n.pubkey],
      "#d": [n.dTag],
      limit: 5
    }, o);
    return new Map(s.outcomes.map((i) => [
      i.relayUrl,
      i.responded ? { status: Dc(i.events, e, n) } : { status: "unreachable", error: i.error }
    ]));
  } finally {
    r.closeAll();
  }
}
async function xc(t) {
  const e = [...new Set(t.relayUrls)], [o, n] = await Promise.all([
    eo(e, t.credentialEvent, t.timeoutMs),
    eo(e, t.recoveryEvent, t.timeoutMs)
  ]), r = e.map((s) => {
    const i = o.get(s) ?? { status: "unreachable" }, a = n.get(s) ?? { status: "unreachable" }, c = i.error ?? a.error;
    return {
      relayUrl: s,
      credential: i.status,
      recovery: a.status,
      ...c ? { error: c } : {}
    };
  });
  return {
    relays: r,
    totalCount: r.length,
    reachableCount: r.filter((s) => s.credential !== "unreachable" && s.recovery !== "unreachable").length,
    credentialCurrentCount: r.filter((s) => s.credential === "current").length,
    recoveryCurrentCount: r.filter((s) => s.recovery === "current").length,
    checkedAt: t.now ?? Math.floor(Date.now() / 1e3)
  };
}
const Pr = pi.id, We = "aes-256-gcm-v1", Ve = "bitlogin-bip39-hkdf-v1", ps = "bitlogin-recovery-hkdf-v1", Uc = 4, qc = 64;
function Be(t) {
  return [...new Set(t)].filter((e) => e.length <= qc).slice(0, Uc);
}
function je(t) {
  return t ? { everyday_derivation: ps } : {};
}
function hs(t) {
  return t.protocol?.everyday_derivation === ps;
}
const Fc = 5e3;
async function Sr(t) {
  const e = [...new Set(t.urls)], o = await t.read(e, t.timeoutMs), n = o.relays.filter((s) => s.state === "answered").map((s) => s.relayUrl);
  if (o.candidates.length > 0)
    return { state: "taken", result: o, answeredUrls: n };
  const r = o.relays.filter((s) => s.state === "slow").map((s) => s.relayUrl);
  if (r.length > 0) {
    const s = await t.read(r, t.slowWaitMs ?? Fc);
    if (s.candidates.length > 0)
      return { state: "taken", result: s, answeredUrls: [...n, ...s.relays.filter((i) => i.state === "answered").map((i) => i.relayUrl)] };
    if (s.relays.some((i) => i.state !== "answered"))
      return { state: "unchecked", why: "slow", answered: n.length, of: e.length };
    n.push(...r);
  }
  return n.length < Math.ceil(e.length / 2) ? { state: "unchecked", why: "too-few", answered: n.length, of: e.length } : { state: "free", writeUrls: n };
}
const Kr = {
  slow: "a vault relay that connected didn't finish answering, and it may hold an account",
  "too-few": "too few vault relays answered"
};
async function ws(t) {
  const e = on(t.loginName), o = t.now ?? Math.floor(Date.now() / 1e3), { locatorPrivateKey: n, capsuleKey: r } = await ft(t.password, e);
  try {
    const s = P(n), i = await Sr({
      urls: t.vaultRelayUrls,
      timeoutMs: t.timeoutMs,
      read: async (k, m) => {
        const _ = new T(k, { authPrivateKey: n });
        try {
          return await gt(_, s, r, m);
        } finally {
          _.closeAll();
        }
      }
    });
    if (i.state === "taken")
      throw new ns();
    if (i.state === "unchecked")
      throw new ue(`Couldn't check that this login name and password are free: ${Kr[i.why]}. Nothing was registered. Try again in a moment.`);
    const a = i.writeUrls, c = t.everydayPrivateKey !== void 0;
    if (c && !nr(t.everydayPrivateKey))
      throw new ue("The provided key is not a valid secp256k1 private key.");
    const l = Qa(Ri()), d = await pr(l);
    let y, f, p;
    try {
      ({ recoveryPrivateKey: y, capsuleKey: f } = Xn(d)), p = c ? t.everydayPrivateKey : Zn(d);
    } finally {
      S(d);
    }
    const g = !c, v = F(32), b = F(32);
    let h = !1;
    try {
      const k = P(y), m = P(p), _ = L(So()), O = {
        schema: nn,
        account_id: _,
        recovery_generation: 0,
        previous_recovery_event_id: null,
        operational_private_key: L(p),
        operational_public_key: m,
        recovery_public_key: k,
        connection_vault_root: L(v),
        vault_sudo_key: L(b),
        created_at: o,
        vault_relay_hints: Be(t.vaultRelayUrls),
        protocol: {
          capsule_encryption: We,
          recovery_derivation: Ve,
          ...je(g)
        }
      }, q = await _r({
        recoveryPrivateKey: y,
        capsuleKey: f,
        payload: O
      }), Y = new T(t.vaultRelayUrls, {
        authPrivateKey: y
      });
      let X;
      try {
        X = await Ne(Y, q, {
          dTag: bt,
          minAcks: t.minAcknowledgements,
          timeoutMs: t.timeoutMs
        });
      } finally {
        Y.closeAll();
      }
      if (!X.success)
        throw new ue("The recovery capsule did not reach the required relay acknowledgement and readback quorum. No login credential was published. Please retry, or add more vault relays.");
      const E = {
        schema: rn,
        account_id: _,
        generation: 0,
        operational_private_key: L(p),
        operational_public_key: m,
        recovery_public_key: k,
        recovery_capsule_event: q,
        connection_vault_root: L(v),
        created_at: o,
        vault_relay_hints: Be(t.vaultRelayUrls),
        protocol: {
          password_kdf: Pr,
          capsule_encryption: We,
          recovery_derivation: Ve,
          ...je(g)
        }
      }, K = await Er({
        locatorPrivateKey: n,
        capsuleKey: r,
        payload: E
      }), I = new T(a, {
        authPrivateKey: n
      });
      let un;
      try {
        un = await Ne(I, K, {
          dTag: He,
          minAcks: t.minAcknowledgements,
          timeoutMs: t.timeoutMs
        });
      } finally {
        I.closeAll();
      }
      if (!un.success)
        throw new ue("Registration did not reach the required credential acknowledgement and readback quorum. Please retry, or add more vault relays.");
      return h = !0, {
        normalizedLoginName: e,
        recoveryPhrase: l,
        everydayPrivateKey: p,
        everydayPublicKey: m,
        recoveryPublicKey: k,
        locatorPublicKey: s,
        accountId: _,
        imported: c,
        everydayKeyDerived: g,
        connectionVaultRoot: v,
        vaultSudoKey: b,
        credentialEvent: K,
        recoveryEvent: q,
        credentialPublish: un,
        recoveryPublish: X
      };
    } finally {
      S(y, f), h || (c || S(p), S(v, b));
    }
  } finally {
    S(n, r);
  }
}
async function $c(t) {
  const { nsecOrHex: e, ...o } = t, n = vs(e);
  return ws({ ...o, everydayPrivateKey: n });
}
function vs(t) {
  const e = t.trim();
  let o;
  if (e.startsWith("nsec1"))
    o = hi(e);
  else if (/^[0-9a-fA-F]{64}$/u.test(e))
    o = Po(e.toLowerCase());
  else
    throw new ue("Enter a valid nsec (nsec1…) or a 64-character hex private key.");
  if (!nr(o))
    throw new ue("The provided key is not a valid secp256k1 private key.");
  return o;
}
class gs {
  map = /* @__PURE__ */ new Map();
  async get(e) {
    return this.map.get(e);
  }
  async set(e, o) {
    this.map.set(e, o);
  }
  async delete(e) {
    this.map.delete(e);
  }
}
async function Wc(t) {
  const e = on(t.loginName), { locatorPrivateKey: o, capsuleKey: n } = await ft(t.password, e), r = P(o), s = new T(t.vaultRelayUrls, {
    authPrivateKey: o
  });
  try {
    const i = await gt(s, r, n, t.timeoutMs);
    if (!i.quorumMet)
      throw new Ce("quorum-not-met");
    if (!i.best)
      throw new Ce(i.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
    const a = i.best.payload, c = t.store ?? new gs(), l = await gr(c, a.operational_public_key), d = a.generation < l.generation;
    if (d && !t.acknowledgeRollback)
      throw new rs(l.generation, a.generation);
    const y = d ? `This device previously saw credential generation ${l.generation}, but the accepted capsule is generation ${a.generation}. Relays may be serving stale data, or an old capsule is being replayed.` : void 0;
    await os(c, a.operational_public_key, {
      generation: a.generation
    });
    const f = i.relayDisagreement ? 'Configured relays returned different credential capsules as "latest" for this account. Some relays may be stale, censored, or malicious.' : void 0;
    return {
      everydayPrivateKey: x(a.operational_private_key),
      everydayPublicKey: a.operational_public_key,
      recoveryPublicKey: a.recovery_public_key,
      accountId: a.account_id,
      generation: a.generation,
      everydayKeyDerived: hs(a),
      credentialEvent: i.best.event,
      recoveryCapsuleEvent: a.recovery_capsule_event,
      connectionVaultRoot: a.connection_vault_root ? x(a.connection_vault_root) : void 0,
      rollbackWarning: y,
      relayDisagreementWarning: f
    };
  } finally {
    s.closeAll();
  }
}
function to(t) {
  return t.filter((e) => C(e)).sort((e, o) => o.created_at - e.created_at)[0];
}
async function Vc(t) {
  if (!zo(t.phrase))
    throw new de("This does not look like a valid 12-word BitLogin recovery phrase.");
  const e = await pr(t.phrase), { recoveryPrivateKey: o, capsuleKey: n } = Xn(e), r = Zn(e), s = P(r);
  S(e, r);
  const i = P(o), a = new T(t.vaultRelayUrls, {
    authPrivateKey: o
  });
  let c;
  try {
    c = await fs(a, i, n, t.timeoutMs);
  } finally {
    a.closeAll();
  }
  if (t.offlineRecoveryCapsuleEvents?.length) {
    const v = [];
    for (const m of t.offlineRecoveryCapsuleEvents)
      if (C(m))
        try {
          v.push({
            event: m,
            payload: await ds(m, n)
          });
        } catch (_) {
          v.push({
            event: m,
            payload: null,
            error: _.message
          });
        }
    const b = /* @__PURE__ */ new Map();
    for (const m of [...c.candidates, ...v])
      b.set(m.event.id, m);
    const h = [...b.values()].sort((m, _) => _.event.created_at - m.event.created_at), k = h.find((m) => m.payload !== null) ?? null;
    c = {
      ...c,
      candidates: h,
      best: k,
      quorumMet: c.quorumMet || k !== null
    };
  }
  if (!c.quorumMet)
    throw new Ce("quorum-not-met");
  if (!c.best)
    throw new Ce(c.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const l = c.best.payload, d = Ic(c.candidates), y = x(l.operational_private_key), f = l.operational_public_key, { generalRelays: p, dmRelays: g } = await ms(f, [...t.discoveryRelayUrls, ...l.vault_relay_hints], t.timeoutMs);
  return {
    everydayPrivateKey: y,
    everydayPublicKey: f,
    recoveryPrivateKey: o,
    recoveryPublicKey: i,
    recoveryCapsuleKey: n,
    accountId: l.account_id,
    currentRecoveryEvent: c.best.event,
    currentRecoveryPayload: l,
    generalRelays: p,
    dmRelays: g,
    chainWarning: d.consistent ? void 0 : d.warning,
    everydayKeyDerived: f === s
  };
}
async function ms(t, e, o) {
  const n = new T([...new Set(e)]);
  let r = [], s = [];
  try {
    const i = await n.queryQuorum({ kinds: [yt], authors: [t], limit: 5 }, o), a = to(i.outcomes.flatMap((d) => d.events));
    a && (r = bc(a));
    const c = await n.queryQuorum({ kinds: [Yn], authors: [t], limit: 5 }, o), l = to(c.outcomes.flatMap((d) => d.events));
    l && (s = kc(l));
  } finally {
    n.closeAll();
  }
  return { generalRelays: r, dmRelays: s };
}
async function bs(t) {
  if (!zo(t))
    throw new de("This does not look like a valid 12-word BitLogin recovery phrase.");
  const e = await pr(t);
  try {
    const { recoveryPrivateKey: o, capsuleKey: n } = Xn(e), r = Zn(e);
    return {
      recoveryPrivateKey: o,
      recoveryPublicKey: P(o),
      capsuleKey: n,
      everydayPrivateKey: r,
      everydayPublicKey: P(r)
    };
  } finally {
    S(e);
  }
}
async function ks(t, e, o) {
  const n = new T(e, {
    authPrivateKey: t.recoveryPrivateKey
  });
  let r;
  try {
    r = await fs(n, t.recoveryPublicKey, t.capsuleKey, o);
  } finally {
    n.closeAll();
  }
  if (!r.quorumMet)
    throw new Ce("quorum-not-met");
  if (r.best)
    throw new de("This account's recovery capsule is still on the relays. Use normal recovery instead of a rebuild.");
  return r.candidates.length > 0 ? Math.max(...r.candidates.map((s) => s.event.created_at)) : null;
}
async function Bc(t) {
  const e = await bs(t.phrase);
  try {
    await ks(e, t.vaultRelayUrls, t.timeoutMs);
    const o = new T([
      .../* @__PURE__ */ new Set([...t.discoveryRelayUrls, ...t.vaultRelayUrls])
    ]);
    try {
      const r = (await o.queryQuorum({
        kinds: [qt, yt],
        authors: [e.everydayPublicKey],
        limit: 10
      }, t.timeoutMs)).outcomes.flatMap((s) => s.events).filter((s) => s.pubkey === e.everydayPublicKey && C(s));
      return {
        everydayPublicKey: e.everydayPublicKey,
        profileFound: r.some((s) => s.kind === qt),
        relayListFound: r.some((s) => s.kind === yt)
      };
    } finally {
      o.closeAll();
    }
  } finally {
    S(e.recoveryPrivateKey, e.capsuleKey, e.everydayPrivateKey);
  }
}
async function jc(t) {
  const e = t.now ?? Math.floor(Date.now() / 1e3), o = await bs(t.phrase);
  let n = !1;
  try {
    const r = await ks(o, t.vaultRelayUrls, t.timeoutMs), s = {
      schema: nn,
      account_id: L(So()),
      recovery_generation: 0,
      previous_recovery_event_id: null,
      operational_private_key: L(o.everydayPrivateKey),
      operational_public_key: o.everydayPublicKey,
      recovery_public_key: o.recoveryPublicKey,
      connection_vault_root: L(F(32)),
      vault_sudo_key: L(F(32)),
      created_at: r === null ? e : vt(r, e),
      vault_relay_hints: Be(t.vaultRelayUrls),
      protocol: {
        capsule_encryption: We,
        recovery_derivation: Ve,
        ...je(!0)
      }
    }, i = await _r({
      recoveryPrivateKey: o.recoveryPrivateKey,
      capsuleKey: o.capsuleKey,
      payload: s
    }), a = new T(t.vaultRelayUrls, {
      authPrivateKey: o.recoveryPrivateKey
    });
    let c;
    try {
      c = await Ne(a, i, {
        dTag: bt,
        minAcks: t.minAcknowledgements,
        timeoutMs: t.timeoutMs
      });
    } finally {
      a.closeAll();
    }
    if (!c.success)
      throw new de("Could not publish the rebuilt recovery capsule to enough relays. Nothing else was changed; please retry.");
    const { generalRelays: l, dmRelays: d } = await ms(o.everydayPublicKey, [...t.discoveryRelayUrls, ...t.vaultRelayUrls], t.timeoutMs);
    return n = !0, {
      everydayPrivateKey: o.everydayPrivateKey,
      everydayPublicKey: o.everydayPublicKey,
      recoveryPrivateKey: o.recoveryPrivateKey,
      recoveryPublicKey: o.recoveryPublicKey,
      recoveryCapsuleKey: o.capsuleKey,
      accountId: s.account_id,
      currentRecoveryEvent: i,
      currentRecoveryPayload: s,
      generalRelays: l,
      dmRelays: d,
      everydayKeyDerived: !0
    };
  } finally {
    n || S(o.recoveryPrivateKey, o.capsuleKey, o.everydayPrivateKey);
  }
}
async function Jc(t) {
  const e = t.now ?? Math.floor(Date.now() / 1e3), o = on(t.newLoginName), { recovered: n } = t, r = n.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: n.currentRecoveryPayload.connection_vault_root,
    vault_sudo_key: n.currentRecoveryPayload.vault_sudo_key
  } : {}, s = n.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: n.currentRecoveryPayload.connection_vault_root
  } : {}, { locatorPrivateKey: i, capsuleKey: a } = await ft(t.newPassword, o);
  try {
    const c = P(i), l = await Sr({
      urls: t.vaultRelayUrls,
      timeoutMs: t.timeoutMs,
      read: async (_, O) => {
        const q = new T(_, { authPrivateKey: i });
        try {
          return await gt(q, c, a, O);
        } finally {
          q.closeAll();
        }
      }
    });
    if (l.state === "unchecked")
      throw new de(`Couldn't check that this login name and password are free: ${Kr[l.why]}. Nothing was changed. Try again in a moment.`);
    let d;
    if (l.state === "taken") {
      const _ = l.result.best?.payload ?? null;
      if (!(_ !== null && _.account_id === n.accountId && _.operational_public_key === n.everydayPublicKey && _.recovery_public_key === n.recoveryPublicKey && _.generation === 0 && _.recovery_capsule_event.id === n.currentRecoveryEvent.id))
        throw new de("Another account is already registered with that login name and password. Pick a different one.");
      d = l.answeredUrls;
    } else
      d = l.writeUrls;
    const y = n.currentRecoveryPayload.recovery_generation + 1, f = {
      schema: nn,
      account_id: n.accountId,
      recovery_generation: y,
      previous_recovery_event_id: n.currentRecoveryEvent.id,
      operational_private_key: L(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      ...r,
      created_at: vt(n.currentRecoveryEvent.created_at, e),
      vault_relay_hints: Be(t.vaultRelayUrls),
      protocol: {
        capsule_encryption: We,
        recovery_derivation: Ve,
        ...je(n.everydayKeyDerived)
      }
    }, p = await _r({
      recoveryPrivateKey: n.recoveryPrivateKey,
      capsuleKey: n.recoveryCapsuleKey,
      payload: f
    }), g = new T(t.vaultRelayUrls, {
      authPrivateKey: n.recoveryPrivateKey
    });
    let v;
    try {
      v = await Ne(g, p, {
        dTag: bt,
        minAcks: t.minAcknowledgements,
        timeoutMs: t.timeoutMs
      });
    } finally {
      g.closeAll();
    }
    if (!v.success)
      throw new de("Could not publish the refreshed recovery capsule to enough relays. No new credential was published; please retry.");
    n.currentRecoveryEvent = p, n.currentRecoveryPayload = f;
    const b = {
      schema: rn,
      account_id: n.accountId,
      generation: 0,
      operational_private_key: L(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      recovery_capsule_event: p,
      ...s,
      // A retry may be repairing a credential that reached only one relay.
      // It must replace that partial event deterministically on every relay.
      created_at: l.state === "taken" && l.result.best ? vt(l.result.best.event.created_at, e) : e,
      vault_relay_hints: Be(t.vaultRelayUrls),
      protocol: {
        password_kdf: Pr,
        capsule_encryption: We,
        recovery_derivation: Ve,
        ...je(n.everydayKeyDerived)
      }
    }, h = await Er({
      locatorPrivateKey: i,
      capsuleKey: a,
      payload: b
    }), k = new T(d, {
      authPrivateKey: i
    });
    let m;
    try {
      m = await Ne(k, h, {
        dTag: He,
        minAcks: t.minAcknowledgements,
        timeoutMs: t.timeoutMs
      });
    } finally {
      k.closeAll();
    }
    if (!m.success)
      throw new de("Could not publish the new credential capsule to enough relays. Please retry.");
    return t.store && await wc(t.store, n.everydayPublicKey, {
      generation: 0,
      recoveryGeneration: y
    }), {
      normalizedLoginName: o,
      locatorPublicKey: c,
      credentialEvent: h,
      refreshedRecoveryEvent: p,
      credentialPublish: m,
      recoveryPublish: v
    };
  } finally {
    S(i, a);
  }
}
async function Gc(t) {
  const e = t.now ?? Math.floor(Date.now() / 1e3), o = on(t.loginName), n = await ft(t.oldPassword, o), r = P(n.locatorPrivateKey), s = new T(t.vaultRelayUrls, {
    authPrivateKey: n.locatorPrivateKey
  });
  let i;
  try {
    i = await gt(s, r, n.capsuleKey, t.timeoutMs);
  } finally {
    s.closeAll();
  }
  if (!i.quorumMet)
    throw new Ce("quorum-not-met");
  if (!i.best)
    throw new Ce(i.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const a = i.best.payload, c = i.best.event, l = t.store ?? new gs(), d = await gr(l, a.operational_public_key);
  if (a.generation < d.generation && !t.acknowledgeRollback)
    throw new rs(d.generation, a.generation);
  const y = await ft(t.newPassword, o), f = P(y.locatorPrivateKey), p = await Sr({
    urls: t.vaultRelayUrls,
    timeoutMs: t.timeoutMs,
    read: async (E, K) => {
      const I = new T(E, { authPrivateKey: y.locatorPrivateKey });
      try {
        return await gt(I, f, y.capsuleKey, K);
      } finally {
        I.closeAll();
      }
    }
  });
  if (p.state === "taken")
    throw new ns("Another account is already registered with this login name and the new password you chose. Pick a different new password.");
  if (p.state === "unchecked")
    throw new ue(`Couldn't check that the new password is free under this login name: ${Kr[p.why]}. Your password wasn't changed. Try again in a moment.`);
  const g = p.writeUrls, v = a.generation + 1, b = {
    schema: rn,
    account_id: a.account_id,
    generation: v,
    operational_private_key: a.operational_private_key,
    operational_public_key: a.operational_public_key,
    recovery_public_key: a.recovery_public_key,
    recovery_capsule_event: a.recovery_capsule_event,
    // Carry only the session root. A legacy credential may contain the sudo
    // key, but rotation deliberately scrubs it; personal-tier access remains
    // phrase-gated through the recovery capsule.
    ...a.connection_vault_root !== void 0 ? { connection_vault_root: a.connection_vault_root } : {},
    created_at: e,
    vault_relay_hints: Be(t.vaultRelayUrls),
    protocol: {
      password_kdf: Pr,
      capsule_encryption: We,
      recovery_derivation: Ve,
      ...je(hs(a))
    }
  }, h = await Er({
    locatorPrivateKey: y.locatorPrivateKey,
    capsuleKey: y.capsuleKey,
    payload: b
  }), k = new T(g, {
    authPrivateKey: y.locatorPrivateKey
  }), m = await Ne(k, h, {
    dTag: He,
    minAcks: t.minAcknowledgements,
    timeoutMs: t.timeoutMs
  });
  if (k.closeAll(), !m.success)
    throw new ue("The new credential capsule did not reach the required relay acknowledgement and readback quorum. Your existing password still works; nothing was changed. Please retry.");
  const _ = Nc({
    oldLocatorPrivateKey: n.locatorPrivateKey,
    createdAt: vt(c.created_at, e)
  }), O = Do({
    privateKey: n.locatorPrivateKey,
    eventIdToDelete: c.id,
    deletedEventKind: U,
    createdAt: e
  }), q = new T(t.vaultRelayUrls, {
    authPrivateKey: n.locatorPrivateKey
  }), [Y, X] = await Promise.all([
    q.publishAll(_, t.timeoutMs),
    q.publishAll(O, t.timeoutMs)
  ]);
  return q.closeAll(), await os(l, a.operational_public_key, {
    generation: v
  }), {
    normalizedLoginName: o,
    oldLocatorPublicKey: r,
    newLocatorPublicKey: f,
    newGeneration: v,
    recoveryPublicKey: a.recovery_public_key,
    recoveryCapsuleEvent: a.recovery_capsule_event,
    newCredentialEvent: h,
    tombstoneEvent: _,
    deletionRequestEvent: O,
    newCredentialPublish: m,
    tombstoneAcknowledgedCount: $(Y),
    deletionAcknowledgedCount: $(X)
  };
}
const Hc = "bitlogin/connection-vault-root/v1", zc = "bitlogin/connection-vault-signing/v1", Qc = "bitlogin/connection-record-encryption/v1", Yc = "bitlogin/connection-vault-personal/v1", Ln = "bitlogin:connection:";
function Xc(t) {
  if (t.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return rr(Ko(Hc), t);
}
function ze(t) {
  return Ci(t, zc).scalar;
}
function Es(t) {
  const e = ze(t);
  try {
    return P(e);
  } finally {
    S(e);
  }
}
function Zc(t, e) {
  if (e.length !== 32)
    throw new Error("vault_sudo_key must be exactly 32 bytes.");
  if (t.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return rr(Ko(Yc), tr(t, e));
}
function _s(t, e) {
  const o = cn(e);
  return kt(t, tr(V(Qc), new Uint8Array([0]), o), 32);
}
function el() {
  return L(F(16));
}
function cn(t) {
  const e = x(t);
  if (e.length !== 16)
    throw new Error("connection_id must decode to exactly 16 bytes (§CV7).");
  return e;
}
function Ps(t) {
  return cn(t), `${Ln}${t}`;
}
function Ss(t) {
  if (!t.startsWith(Ln))
    return null;
  const e = t.slice(Ln.length);
  try {
    return cn(e), e;
  } catch {
    return null;
  }
}
class ye {
  privateKey;
  publicKeyHex;
  destroyed = !1;
  constructor(e) {
    this.privateKey = e, this.publicKeyHex = P(e);
  }
  assertAlive() {
    if (this.destroyed)
      throw new Error("This signer has been destroyed (session locked or logged out).");
  }
  getPublicKey() {
    return this.assertAlive(), this.publicKeyHex;
  }
  signEvent(e) {
    return this.assertAlive(), W({
      pubkey: this.publicKeyHex,
      created_at: e.created_at ?? Math.floor(Date.now() / 1e3),
      kind: e.kind,
      tags: e.tags ?? [],
      content: e.content
    }, this.privateKey);
  }
  nip44Encrypt(e, o) {
    return this.assertAlive(), Tn(Ae(this.privateKey, e), o);
  }
  nip44Decrypt(e, o) {
    return this.assertAlive(), or(Ae(this.privateKey, e), o);
  }
  /** Legacy relative to nip44Encrypt above, but still what a real NIP-07 extension exposes as
   * window.nostr.nip04.encrypt -- implemented for drop-in parity. */
  nip04Encrypt(e, o) {
    return this.assertAlive(), yc(this.privateKey, e, o);
  }
  nip04Decrypt(e, o) {
    return this.assertAlive(), pc(this.privateKey, e, o);
  }
  /** Best-practical secret wipe (§11.10, §21.4): overwrites the private key buffer in place. */
  destroy() {
    S(this.privateKey), this.destroyed = !0;
  }
}
const Ks = "bitlogin.connection.v1", As = "bitlogin.connection.nwc.v1", no = 120, tl = /* @__PURE__ */ new Set(["active", "suspended", "deleted"]), nl = /* @__PURE__ */ new Set(["connectable", "personal"]);
class xe extends Error {
  constructor(e) {
    super(e), this.name = "ConnectionRecordError";
  }
}
function Rs(t, e) {
  return V(`bitlogin|connection-record|v1|${t}|30078|${e}`);
}
function Cs(t) {
  const e = t, o = (s) => {
    throw new xe(s);
  };
  (!e || typeof e != "object") && o("Connection record must be an object."), e.schema !== Ks && o("Unsupported connection record schema (§CV8.3)."), typeof e.connection_id != "string" && o("connection_id must be a string (§CV7)."), (typeof e.connection_type != "string" || e.connection_type.length === 0) && o("connection_type must be a non-empty string (§CV8.3)."), nl.has(e.tier) || o("tier must be connectable or personal."), tl.has(e.state) || o("state must be active, suspended, or deleted (§CV8.3)."), (typeof e.label != "string" || e.label.length > no) && o(`label must be a string of at most ${no} characters.`), (!Number.isInteger(e.created_at) || !Number.isInteger(e.updated_at)) && o("created_at and updated_at must be integers (§CV8.3).");
  const n = e.credential;
  (!n || typeof n != "object" || typeof n.schema != "string") && o("credential must be an object naming its profile schema (§CV8.3).");
  const r = e.application_binding;
  (!r || typeof r != "object" || r.origin !== null && typeof r.origin != "string" || r.app_pubkey !== null && typeof r.app_pubkey != "string") && o("application_binding must carry origin and app_pubkey (string or null)."), e.notes !== null && typeof e.notes != "string" && o("notes must be a string or null.");
}
async function vn(t) {
  Cs(t.record);
  const e = ze(t.vaultPrk), o = P(e), n = Ps(t.record.connection_id), r = _s(t.recordPrk, t.record.connection_id), s = await mr(t.record, r, Rs(o, n));
  return W({
    pubkey: o,
    created_at: vt(t.previousCreatedAt, t.now),
    kind: U,
    tags: [["d", n]],
    content: JSON.stringify(s)
  }, e);
}
async function rl(t, e, o) {
  if (!C(t))
    throw new xe("Connection record event has an invalid id or signature.");
  const n = P(ze(e));
  if (t.pubkey !== n)
    throw new xe("Connection record event is not signed by this vault's identity.");
  const r = we(t, "d") ?? "", s = Ss(r);
  if (s === null)
    throw new xe("Connection record event has a malformed d tag.");
  const i = JSON.parse(t.content), a = Rs(t.pubkey, r), c = [
    { prk: e, tier: "connectable" },
    ...o ? [{ prk: o, tier: "personal" }] : []
  ];
  for (const l of c) {
    let d;
    try {
      d = await br(i, _s(l.prk, s), a);
    } catch {
      continue;
    }
    if (Cs(d), d.connection_id !== s)
      throw new xe("Connection record id does not match its d tag.");
    if (d.tier !== l.tier)
      throw new xe("Connection record tier does not match the key that decrypted it.");
    return { record: d, tier: l.tier, event: t };
  }
  return null;
}
function ol(t, e) {
  return {
    ...t,
    state: "deleted",
    credential: { schema: t.credential.schema },
    notes: null,
    updated_at: e
  };
}
const Jt = /^[0-9a-f]{64}$/u;
class oe extends Error {
  constructor(e) {
    super(e), this.name = "NwcParseError";
  }
}
function ro(t) {
  const e = t.trim();
  if (!/^nostr\+walletconnect:\/\//iu.test(e))
    throw new oe("Not an NWC URI: it must start with nostr+walletconnect://");
  let o;
  try {
    o = new URL(e.replace(/^nostr\+walletconnect:\/\//iu, "http://"));
  } catch {
    throw new oe("The NWC URI is malformed.");
  }
  const n = o.hostname.toLowerCase();
  if (!Jt.test(n))
    throw new oe("The NWC URI's wallet service pubkey is not 64-char hex.");
  const r = [], s = [];
  let i = null, a = null;
  for (const [c, l] of o.searchParams.entries())
    if (c === "relay") {
      if (!Et(l))
        throw new oe("An NWC relay must use secure WebSockets, except for an explicit loopback development endpoint.");
      r.push(l);
    } else if (c === "secret") {
      const d = l.toLowerCase();
      if (!Jt.test(d))
        throw new oe("The NWC URI's secret is not a 64-char hex client key.");
      i = d;
    } else c === "lud16" ? a = l : s.push([c, l]);
  if (r.length === 0)
    throw new oe("The NWC URI names no relay.");
  if (i === null)
    throw new oe("The NWC URI carries no secret.");
  return {
    schema: As,
    wallet_pubkey: n,
    relays: r,
    secret: i,
    lud16: a,
    extra_params: s
  };
}
function sl(t) {
  Ns(t);
  const e = new URLSearchParams();
  for (const o of t.relays)
    e.append("relay", o);
  e.append("secret", t.secret), t.lud16 !== null && e.append("lud16", t.lud16);
  for (const [o, n] of t.extra_params)
    e.append(o, n);
  return `nostr+walletconnect://${t.wallet_pubkey}?${e.toString()}`;
}
function il(t, e) {
  return t.wallet_pubkey === e.wallet_pubkey && t.secret === e.secret;
}
function Ns(t) {
  const e = t, o = (n) => {
    throw new oe(n);
  };
  (!e || typeof e != "object") && o("NWC credential must be an object."), e.schema !== As && o("NWC credential has the wrong schema."), (typeof e.wallet_pubkey != "string" || !Jt.test(e.wallet_pubkey)) && o("NWC credential wallet_pubkey must be 64-char lowercase hex."), (!Array.isArray(e.relays) || e.relays.length === 0 || e.relays.some((n) => typeof n != "string")) && o("NWC credential must name at least one relay."), e.relays.some((n) => !Et(n)) && o("NWC relays must use secure WebSockets, except for explicit loopback development endpoints."), (typeof e.secret != "string" || !Jt.test(e.secret)) && o("NWC credential secret must be 64-char lowercase hex."), e.lud16 !== null && typeof e.lud16 != "string" && o("NWC credential lud16 must be a string or null."), (!Array.isArray(e.extra_params) || e.extra_params.some((n) => !Array.isArray(n) || n.length !== 2 || typeof n[0] != "string" || typeof n[1] != "string")) && o("NWC credential extra_params must be [key, value] string pairs.");
}
const al = "bitlogin:vault-hwm:v2:", cl = "bitlogin/vault-hwm-index/v2", Ts = "bitlogin/vault-hwm-encryption/v2", ll = /^[0-9a-f]{64}$/u;
class fe extends Error {
  constructor() {
    super("The local Connection Vault rollback marker is invalid or has been tampered with."), this.name = "RecordHighWaterMarkError";
  }
}
function Ar(t) {
  if (!t || typeof t != "object")
    return !1;
  const e = t;
  return Number.isInteger(e.createdAt) && (e.createdAt ?? -1) >= 0 && typeof e.eventId == "string" && ll.test(e.eventId);
}
function Ms(t, e) {
  cn(e);
  const o = kt(t, cl, 32), n = V(e);
  try {
    return `${al}${L(Eo(_o, o, n))}`;
  } finally {
    S(o, n);
  }
}
function ul(t, e) {
  return `bitlogin:vault-hwm:${Es(t)}:${e}`;
}
async function dl(t, e, o) {
  const n = kt(t, Ts, 32), r = V(JSON.stringify(o)), s = V(e);
  try {
    const i = await Wo(n, r, s), a = {
      v: 2,
      nonce: L(i.nonce),
      ciphertext: L(i.ciphertext)
    };
    return JSON.stringify(a);
  } finally {
    S(n, r, s);
  }
}
async function yl(t, e, o) {
  const n = kt(t, Ts, 32), r = V(e);
  let s;
  try {
    const i = JSON.parse(o);
    if (i.v !== 2 || typeof i.nonce != "string" || typeof i.ciphertext != "string")
      throw new fe();
    s = await Vo(n, x(i.nonce), x(i.ciphertext), r);
    const a = JSON.parse(er(s));
    if (!Ar(a))
      throw new fe();
    return a;
  } catch (i) {
    throw i instanceof fe ? i : new fe();
  } finally {
    S(n, r), s && S(s);
  }
}
async function Is(t, e, o, n) {
  const r = Ms(e, o);
  await t.set(r, await dl(e, r, n));
}
async function Ls(t, e, o) {
  const n = Ms(e, o), r = await t.get(n);
  if (r !== void 0)
    return yl(e, n, r);
  const s = ul(e, o), i = await t.get(s);
  if (i === void 0)
    return null;
  try {
    const a = JSON.parse(i);
    if (!Ar(a))
      throw new fe();
    return await Is(t, e, o, a), await t.delete(s), a;
  } catch (a) {
    throw a instanceof fe ? a : new fe();
  }
}
async function Os(t, e, o, n) {
  if (!Ar(n))
    throw new fe();
  const r = await Ls(t, e, o);
  r && Cn({ created_at: n.createdAt, id: n.eventId }, { created_at: r.createdAt, id: r.eventId }) <= 0 || await Is(t, e, o, n);
}
async function fl(t) {
  const e = ze(t.vaultPrk), o = new T(t.relayUrls, { authPrivateKey: e });
  let n;
  try {
    n = await Ne(o, t.event, {
      dTag: Ps(t.connectionId),
      minAcks: t.minAcknowledgements,
      // The readback bar follows the ack bar: a caller publishing to fewer
      // relays (a targeted repair, a test) has already lowered its quorum.
      minReadbacks: t.minAcknowledgements,
      timeoutMs: t.timeoutMs
    });
  } finally {
    o.closeAll(), S(e);
  }
  return n.success && await Os(t.store, t.vaultPrk, t.connectionId, {
    createdAt: t.event.created_at,
    eventId: t.event.id
  }), n;
}
const oo = 500;
async function pl(t) {
  const e = ze(t.vaultPrk), o = P(e), n = new T(t.relayUrls, { authPrivateKey: e });
  let r;
  try {
    r = await n.queryQuorum({ kinds: [U], authors: [o], limit: oo }, t.timeoutMs);
  } finally {
    n.closeAll(), S(e);
  }
  const s = r.outcomes.some((l) => l.events.length >= oo), i = /* @__PURE__ */ new Map();
  for (const l of r.outcomes.flatMap((d) => d.events)) {
    if (!C(l) || l.pubkey !== o)
      continue;
    const d = Ss(we(l, "d") ?? "");
    if (d === null)
      continue;
    const y = i.get(d);
    (!y || Cn(l, y) > 0) && i.set(d, l);
  }
  const a = /* @__PURE__ */ new Map(), c = [];
  for (const [l, d] of i) {
    const y = await Ls(t.store, t.vaultPrk, l);
    if (y !== null && Cn(d, {
      created_at: y.createdAt,
      id: y.eventId
    }) < 0) {
      c.push(l);
      continue;
    }
    a.set(l, d), await Os(t.store, t.vaultPrk, l, {
      createdAt: d.created_at,
      eventId: d.id
    });
  }
  return {
    events: a,
    rollbackWarnings: c,
    quorumMet: r.quorumMet,
    respondedCount: r.respondedCount,
    truncated: s
  };
}
class hl {
  vaultPrk;
  personalPrk = null;
  destroyed = !1;
  connectionVaultRoot;
  vaultPublicKey;
  constructor(e) {
    this.connectionVaultRoot = e.slice(), this.vaultPrk = Xc(this.connectionVaultRoot), this.vaultPublicKey = Es(this.vaultPrk);
  }
  get sudoActive() {
    return this.personalPrk !== null;
  }
  /** Opens a sudo window. Consumes (wipes) the caller's sudo key copy. */
  enableSudo(e) {
    this.endSudo(), this.personalPrk = Zc(this.connectionVaultRoot, e), S(e);
  }
  /** Closes the sudo window and wipes the personal-tier key material. */
  endSudo() {
    this.personalPrk && S(this.personalPrk), this.personalPrk = null;
  }
  /**
   * Wipes everything this session holds, permanently.
   *
   * The ROOT is wiped too, not just the derived prk: the root regenerates the
   * prk and (with a sudo key) the personal prk, so leaving it live made
   * "wipes everything" false. And the session is marked destroyed rather than
   * merely zeroed, because a zeroed prk is not inert -- deriveRecordKey and
   * deriveVaultSigningKey over 32 zero bytes are deterministic, WORLD-
   * COMPUTABLE values. A stale reference calling createConnection() after
   * teardown would otherwise seal a wallet secret under a key any observer
   * can derive, sign it with a publicly known identity, and report success.
   * Failing loudly is the only safe behaviour.
   */
  destroy() {
    this.endSudo(), S(this.vaultPrk, this.connectionVaultRoot), this.destroyed = !0;
  }
  prkForTier(e) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    if (e === "connectable")
      return this.vaultPrk;
    if (!this.personalPrk)
      throw new Error("Personal-tier records require an open sudo window (enableSudo).");
    return this.personalPrk;
  }
  /** Builds a fresh record + its signed event. Purely local; publish separately. */
  async createConnection(e) {
    const o = e.now ?? Math.floor(Date.now() / 1e3), n = {
      schema: Ks,
      connection_id: el(),
      connection_type: e.connection_type,
      tier: e.tier,
      state: "active",
      label: e.label,
      created_at: o,
      updated_at: o,
      credential: e.credential,
      application_binding: e.application_binding ?? {
        origin: null,
        app_pubkey: null
      },
      notes: e.notes ?? null
    }, r = await vn({
      vaultPrk: this.vaultPrk,
      recordPrk: this.prkForTier(e.tier),
      record: n,
      now: o
    });
    return { record: n, event: r };
  }
  /** Replaces a record's content. The tier is immutable — moving a secret
   *  between tiers is a delete-and-recreate, never a silent re-encryption. */
  async updateConnection(e, o, n) {
    const r = n ?? Math.floor(Date.now() / 1e3), s = {
      ...e.record,
      ...o,
      tier: e.record.tier,
      connection_id: e.record.connection_id,
      created_at: e.record.created_at,
      updated_at: r
    }, i = await vn({
      vaultPrk: this.vaultPrk,
      recordPrk: this.prkForTier(s.tier),
      record: s,
      previousCreatedAt: e.event.created_at,
      now: r
    });
    return { record: s, event: i };
  }
  /** §CV11 step 2: the encrypted tombstone replacement. */
  async deleteConnection(e, o) {
    const n = o ?? Math.floor(Date.now() / 1e3), r = ol(e.record, n), s = await vn({
      vaultPrk: this.vaultPrk,
      recordPrk: this.prkForTier(r.tier),
      record: r,
      previousCreatedAt: e.event.created_at,
      now: n
    });
    return { record: r, event: s };
  }
  /** Trial-decrypts one event; personal-tier records resolve only inside a sudo window. */
  decryptEvent(e) {
    return this.destroyed ? Promise.reject(new Error("This vault session was destroyed; create a new one from the account's root.")) : rl(e, this.vaultPrk, this.personalPrk ?? void 0);
  }
  /** §CV11 step 3: a NIP-09 deletion request for a replaced record event,
   *  signed by the vault identity. Best-effort by contract — the encrypted
   *  tombstone is the durable part of a deletion, this is the courtesy ask. */
  buildDeletionRequest(e, o) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    return Do({
      privateKey: ze(this.vaultPrk),
      eventIdToDelete: e,
      deletedEventKind: U,
      createdAt: o ?? Math.floor(Date.now() / 1e3)
    });
  }
  publish(e) {
    return fl({ vaultPrk: this.vaultPrk, ...e });
  }
  fetchEvents(e) {
    return pl({ vaultPrk: this.vaultPrk, ...e });
  }
  /**
   * Fetches and decrypts everything decryptable right now. Outside a sudo
   * window the personal tier is simply absent from the result — invisible,
   * not erroring, exactly like the app-facing API contract.
   */
  async listConnections(e) {
    const o = await this.fetchEvents(e);
    if (!o.quorumMet && !e.acknowledgeIncompleteQuorum)
      throw new Error("Not enough vault relays answered to list your connections reliably. Check your connection and retry.");
    const n = [], r = [];
    for (const s of o.events.values())
      try {
        const i = await this.decryptEvent(s);
        i && n.push(i);
      } catch {
        r.push(s.id);
      }
    return n.sort((s, i) => i.record.updated_at - s.record.updated_at), {
      connections: n,
      rollbackWarnings: o.rollbackWarnings,
      unreadable: r,
      truncated: o.truncated,
      quorumMet: o.quorumMet
    };
  }
}
const wl = "bitlogin", ie = "kv", G = "device-keys", vl = 2;
function gl() {
  return new Promise((t, e) => {
    const o = indexedDB.open(wl, vl);
    o.onupgradeneeded = () => {
      const n = o.result;
      n.objectStoreNames.contains(ie) || n.createObjectStore(ie), n.objectStoreNames.contains(G) || n.createObjectStore(G);
    }, o.onsuccess = () => t(o.result), o.onerror = () => e(o.error);
  });
}
class ml {
  dbPromise = null;
  db() {
    return this.dbPromise || (this.dbPromise = gl()), this.dbPromise;
  }
  async get(e) {
    const o = await this.db();
    return new Promise((n, r) => {
      const i = o.transaction(ie, "readonly").objectStore(ie).get(e);
      i.onsuccess = () => n(i.result), i.onerror = () => r(i.error);
    });
  }
  async set(e, o) {
    const n = await this.db();
    return new Promise((r, s) => {
      const i = n.transaction(ie, "readwrite");
      i.objectStore(ie).put(o, e), i.oncomplete = () => r(), i.onerror = () => s(i.error);
    });
  }
  async delete(e) {
    const o = await this.db();
    return new Promise((n, r) => {
      const s = o.transaction(ie, "readwrite");
      s.objectStore(ie).delete(e), s.oncomplete = () => n(), s.onerror = () => r(s.error);
    });
  }
  /**
   * Returns a non-extractable AES-GCM key kept by the browser's IndexedDB
   * implementation. The key is deliberately separate from the string-only KV
   * API so callers cannot accidentally serialize it as application data.
   */
  async getOrCreateDeviceKey(e) {
    const o = await this.db(), n = await new Promise((s, i) => {
      const a = o.transaction(G, "readonly").objectStore(G).get(e);
      a.onsuccess = () => s(a.result), a.onerror = () => i(a.error);
    });
    if (n) return n;
    const r = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      !1,
      ["encrypt", "decrypt"]
    );
    try {
      return await new Promise((s, i) => {
        const a = o.transaction(G, "readwrite");
        a.objectStore(G).add(r, e), a.oncomplete = () => s(), a.onerror = () => i(a.error);
      }), r;
    } catch {
      const s = await new Promise((i, a) => {
        const c = o.transaction(G, "readonly").objectStore(G).get(e);
        c.onsuccess = () => i(c.result), c.onerror = () => a(c.error);
      });
      if (s) return s;
      throw new Error("Unable to create the browser-bound session key.");
    }
  }
  async deleteDeviceKey(e) {
    const o = await this.db();
    return new Promise((n, r) => {
      const s = o.transaction(G, "readwrite");
      s.objectStore(G).delete(e), s.oncomplete = () => n(), s.onerror = () => r(s.error);
    });
  }
}
const Pt = "bitlogin:session:v1", Rr = "bitlogin:session-device-key:v1";
function Ds(t) {
  return !!(t && typeof t == "object" && t.v === 3 && typeof t.iv == "string" && typeof t.ciphertext == "string");
}
async function xs(t, e) {
  if (t.length !== 32) throw new Error("Not a lock key.");
  return crypto.subtle.importKey("raw", nt(t), "AES-GCM", !1, [e]);
}
async function Ot(t, e = Pt) {
  try {
    const o = await t.get(e);
    if (!o) return "none";
    const n = JSON.parse(o);
    return Ds(n) ? "locked" : Us(n) ? "open" : "none";
  } catch {
    return "none";
  }
}
function At(t) {
  let e = "";
  for (const o of t) e += String.fromCharCode(o);
  return btoa(e);
}
function Rt(t) {
  const e = atob(t);
  return Uint8Array.from(e, (o) => o.charCodeAt(0));
}
function nt(t) {
  const e = new Uint8Array(t.byteLength);
  return e.set(t), e.buffer;
}
function Us(t) {
  return !!(t && typeof t == "object" && t.v === 2 && typeof t.iv == "string" && typeof t.ciphertext == "string");
}
async function On(t, e, o, n = Pt) {
  const r = {
    everydayPrivateKeyHex: Array.from(e.everydayPrivateKey, (s) => s.toString(16).padStart(2, "0")).join(""),
    accountId: e.accountId,
    recoveryPublicKey: e.recoveryPublicKey,
    activeCredentialEvent: e.activeCredentialEvent,
    activeRecoveryEvent: e.activeRecoveryEvent,
    ...e.connectionVaultRoot ? {
      connectionVaultRootHex: Array.from(
        e.connectionVaultRoot,
        (s) => s.toString(16).padStart(2, "0")
      ).join("")
    } : {},
    ...e.vaultEnabled !== void 0 ? { vaultEnabled: e.vaultEnabled } : {},
    ...e.everydayKeyDerived !== void 0 ? { everydayKeyDerived: e.everydayKeyDerived } : {}
  };
  try {
    if (typeof t.getOrCreateDeviceKey != "function") {
      await t.delete(n);
      return;
    }
    const s = await t.getOrCreateDeviceKey(Rr), i = crypto.getRandomValues(new Uint8Array(12)), a = new TextEncoder().encode(JSON.stringify(r)), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, s, a), l = {
      v: 2,
      iv: At(i),
      ciphertext: At(new Uint8Array(c))
    };
    if (!o) {
      await t.set(n, JSON.stringify(l));
      return;
    }
    const d = crypto.getRandomValues(new Uint8Array(12)), y = await crypto.subtle.encrypt({ name: "AES-GCM", iv: d }, await xs(o, "encrypt"), new TextEncoder().encode(JSON.stringify(l))), f = { v: 3, iv: At(d), ciphertext: At(new Uint8Array(y)) };
    await t.set(n, JSON.stringify(f));
  } catch {
    o && await t.delete(n).catch(() => {
    });
  }
}
async function qs(t, e, o = Pt) {
  let n;
  try {
    n = await t.get(o);
  } catch {
    return null;
  }
  if (!n) return null;
  try {
    let r = JSON.parse(n);
    if (Ds(r)) {
      if (!e) return null;
      const c = await crypto.subtle.decrypt({ name: "AES-GCM", iv: nt(Rt(r.iv)) }, await xs(e, "decrypt"), nt(Rt(r.ciphertext)));
      r = JSON.parse(new TextDecoder().decode(c));
    }
    if (!Us(r) || typeof t.getOrCreateDeviceKey != "function")
      return await t.delete(o), null;
    const s = await t.getOrCreateDeviceKey(Rr), i = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nt(Rt(r.iv)) },
      s,
      nt(Rt(r.ciphertext))
    ), a = JSON.parse(new TextDecoder().decode(i));
    return typeof a.everydayPrivateKeyHex != "string" || typeof a.accountId != "string" || typeof a.recoveryPublicKey != "string" || !a.activeCredentialEvent || !a.activeRecoveryEvent ? null : {
      everydayPrivateKey: Uint8Array.from(
        a.everydayPrivateKeyHex.match(/.{1,2}/g) || [],
        (c) => Number.parseInt(c, 16)
      ),
      accountId: a.accountId,
      recoveryPublicKey: a.recoveryPublicKey,
      activeCredentialEvent: a.activeCredentialEvent,
      activeRecoveryEvent: a.activeRecoveryEvent,
      ...typeof a.connectionVaultRootHex == "string" ? {
        connectionVaultRoot: Uint8Array.from(
          a.connectionVaultRootHex.match(/.{1,2}/g) || [],
          (c) => Number.parseInt(c, 16)
        )
      } : {},
      ...typeof a.vaultEnabled == "boolean" ? { vaultEnabled: a.vaultEnabled } : {},
      ...typeof a.everydayKeyDerived == "boolean" ? { everydayKeyDerived: a.everydayKeyDerived } : {}
    };
  } catch {
    return null;
  }
}
const bl = "bitlogin:kept-session:v1:", J = (t) => bl + t;
async function ee(t, e = Pt) {
  try {
    await t.delete(e);
  } catch {
  }
}
async function so(t) {
  try {
    await t.delete(Pt), typeof t.deleteDeviceKey == "function" && await t.deleteDeviceKey(Rr);
  } catch {
  }
}
const kl = 27300, Je = {
  /** The longest address a picture may have. */
  pictureChars: 300,
  /** The most that is said about someone, in their own words. */
  aboutChars: 280,
  /** How long a pass made here lasts, in seconds. NSWP's verifier allows twelve hours; this gives four. */
  passSec: 4 * 3600,
  /** A profile's content is not read past this many characters. */
  contentChars: 2e4
};
function El(t) {
  if (typeof t != "string" || t.length > Je.pictureChars) return "";
  try {
    const e = new URL(t);
    return e.protocol !== "https:" || e.username || e.password || !e.hostname.includes(".") ? "" : e.href.length <= Je.pictureChars ? e.href : "";
  } catch {
    return "";
  }
}
const _l = (t) => t <= 31 || t >= 127 && t <= 159 || t >= 8203 && t <= 8207 || t >= 8232 && t <= 8239 || t >= 8288 && t <= 8303 || t === 65279;
function Pl(t) {
  if (typeof t != "string") return "";
  let e = "";
  for (const o of t.slice(0, Je.aboutChars * 8).normalize("NFC")) e += _l(o.codePointAt(0)) ? " " : o;
  return [...e.replace(/\s+/gu, " ").trim()].slice(0, Je.aboutChars).join("").trim();
}
function ge(t) {
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const e = t, o = ht(e.name), n = El(e.picture), r = Pl(e.about);
  return !o && !n && !r ? null : { ...o ? { name: o } : {}, ...n ? { picture: n } : {}, ...r ? { about: r } : {} };
}
function Sl(t, e) {
  if (!C(t) || t.kind !== 0 || t.pubkey !== e || t.content.length > Je.contentChars) return null;
  let o;
  try {
    o = JSON.parse(t.content);
  } catch {
    return null;
  }
  if (!o || typeof o != "object" || Array.isArray(o)) return null;
  const n = o;
  return ge({ name: ht(n.display_name) || ht(n.displayName) || n.name, picture: n.picture, about: n.about });
}
function io(t, e) {
  let o = null;
  for (const n of t)
    !C(n) || n.kind !== 0 || n.pubkey !== e || o && n.created_at <= o.at || (o = { at: n.created_at, profile: Sl(n, e) });
  return o?.profile ?? null;
}
const Kl = /^[0-9a-f]{64}$/u;
function Al(t) {
  const e = $t(t.site);
  if (!e || typeof t.session != "string" || !Kl.test(t.session) || t.session === t.identity) return null;
  const o = Math.floor(t.nowSeconds), n = ge(t.profile) ?? {}, r = [
    ["nswp:session", t.session],
    ["nswp:origin", e],
    ["expiration", String(o + Je.passSec)]
  ];
  return n.name && r.push(["name", n.name]), n.picture && r.push(["picture", n.picture]), n.about && r.push(["about", n.about]), { kind: kl, created_at: o, tags: r, content: "" };
}
const Dn = "bitlogin:kept-accounts:v1", Gt = {
  /** No more accounts than this are kept on one device. The one least lately used goes first. */
  accounts: 8
}, Rl = /^[0-9a-f]{64}$/u;
function Cr(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (typeof e.pubkey != "string" || !Rl.test(e.pubkey)) return null;
  const o = ge({ name: e.name, picture: e.picture, about: e.about }) ?? {}, n = typeof e.at == "number" && Number.isFinite(e.at) && e.at > 0 ? Math.floor(e.at) : 0;
  let r;
  try {
    r = ot(e.pubkey);
  } catch {
    return null;
  }
  return { pubkey: e.pubkey, npub: r, ...o, at: n };
}
function Cl(t) {
  if (!t) return [];
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    return [];
  }
  if (!Array.isArray(e)) return [];
  const o = /* @__PURE__ */ new Set(), n = [];
  for (const r of e.slice(0, Gt.accounts * 2)) {
    const s = Cr(r);
    !s || o.has(s.pubkey) || (o.add(s.pubkey), n.push(s));
  }
  return n.sort((r, s) => s.at - r.at).slice(0, Gt.accounts);
}
function Nl(t, e, o, n = {}) {
  const r = t.find((a) => a.pubkey === e), s = Cr({
    pubkey: e,
    at: o,
    name: ht(n.name) || r?.name,
    picture: n.picture ?? r?.picture,
    about: n.about ?? r?.about
  });
  if (!s) return { list: [...t], dropped: [] };
  const i = [s, ...t.filter((a) => a.pubkey !== e)];
  return { list: i.slice(0, Gt.accounts), dropped: i.slice(Gt.accounts).map((a) => a.pubkey) };
}
function Tl(t, e, o) {
  return t.map((n) => n.pubkey === e ? Cr({ ...n, name: ht(o.name) || n.name, picture: o.picture ?? n.picture, about: o.about ?? n.about }) ?? n : n);
}
const Dt = (t, e) => t.filter((o) => o.pubkey !== e);
async function H(t) {
  try {
    return Cl(await t.get(Dn));
  } catch {
    return [];
  }
}
async function Ke(t, e) {
  try {
    e.length === 0 ? await t.delete(Dn) : await t.set(Dn, JSON.stringify(e));
  } catch {
  }
}
const Nr = "bitlogin:lock:v1", Ml = "bitlogin/lock/device/v1", Il = V("bitlogin:lock:device-wrap:v1"), Q = {
  pinMin: 6,
  pinMax: 64,
  /** Wrong tries, with the PIN or the device, before the record is removed. */
  tries: 5,
  /** Unused for this long, an unlocked session locks itself. In seconds. */
  idleSec: 900
}, Fe = (t) => {
  const e = new Uint8Array(t.byteLength);
  return e.set(t), e.buffer;
};
function Fs(t) {
  if (typeof t != "string") return null;
  const e = t.normalize("NFKC"), o = [...e].length;
  return o >= Q.pinMin && o <= Q.pinMax ? V(e) : null;
}
async function $s(t, e) {
  const o = F(12), n = await crypto.subtle.importKey("raw", Fe(t), "AES-GCM", !1, ["encrypt"]), r = await crypto.subtle.encrypt({ name: "AES-GCM", iv: Fe(o) }, n, Fe(e));
  return { iv: L(o), wrapped: L(new Uint8Array(r)) };
}
async function Ws(t, e) {
  try {
    const o = await crypto.subtle.importKey("raw", Fe(t), "AES-GCM", !1, ["decrypt"]), n = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: Fe(x(e.iv)) }, o, Fe(x(e.wrapped))));
    return n.length === 32 ? n : null;
  } catch {
    return null;
  }
}
const Vs = (t) => kt(rr(Il, t), Ml, 32), ao = (t) => !!t && typeof t == "object" && typeof t.iv == "string" && typeof t.wrapped == "string";
async function me(t) {
  let e;
  try {
    e = await t.get(Nr);
  } catch {
    return null;
  }
  if (!e) return null;
  try {
    const o = JSON.parse(e);
    return o.v !== 1 || typeof o.tries != "number" || !Number.isInteger(o.tries) || o.tries < 0 || !ao(o.pin) || typeof o.pin.salt != "string" || o.device !== void 0 && (!ao(o.device) || typeof o.device.credentialId != "string") ? null : { v: 1, tries: o.tries, pin: o.pin, ...o.device ? { device: o.device } : {} };
  } catch {
    return null;
  }
}
const mt = (t, e) => t.set(Nr, JSON.stringify(e));
async function lt(t) {
  try {
    await t.delete(Nr);
  } catch {
  }
}
async function Ll(t, e, o) {
  const n = Fs(e);
  if (!n) throw new Error(`A PIN is ${Q.pinMin} to ${Q.pinMax} characters.`);
  const r = o ? o.slice() : F(32), s = F(16), i = await ko(n, s);
  try {
    const a = o ? await me(t) : null;
    await mt(t, { v: 1, tries: 0, pin: { salt: L(s), ...await $s(i, r) }, ...a?.device ? { device: a.device } : {} });
  } finally {
    i.fill(0), n.fill(0);
  }
  return r;
}
async function Ol(t, e, o, n) {
  const r = await me(t);
  if (!r) throw new Error("The lock is not on.");
  if (n.length !== 32 || !/^[A-Za-z0-9_-]{8,1400}$/u.test(o)) throw new Error("That is not a device unlock.");
  const s = Vs(n);
  try {
    await mt(t, { ...r, device: { credentialId: o, ...await $s(s, e) } });
  } finally {
    s.fill(0);
  }
}
async function Dl(t) {
  const e = await me(t);
  e?.device && await mt(t, { v: 1, tries: e.tries, pin: e.pin });
}
async function Bs(t, e) {
  const o = await me(t);
  if (!o) return { ok: !1, left: 0, removed: !0 };
  const n = o.tries + 1;
  await mt(t, { ...o, tries: n });
  const r = await e(o);
  return r ? (await mt(t, { ...o, tries: 0 }), { ok: !0, lockKey: r }) : n >= Q.tries ? (await lt(t), { ok: !1, left: 0, removed: !0 }) : { ok: !1, left: Q.tries - n, removed: !1 };
}
function xl(t, e) {
  return Bs(t, async (o) => {
    const n = Fs(e);
    if (!n) return null;
    const r = await ko(n, x(o.pin.salt));
    try {
      return await Ws(r, o.pin);
    } finally {
      r.fill(0), n.fill(0);
    }
  });
}
function Ul(t, e) {
  return Bs(t, async (o) => {
    if (!o.device || e.length !== 32) return null;
    const n = Vs(e);
    try {
      return await Ws(n, o.device);
    } finally {
      n.fill(0);
    }
  });
}
const ut = "bitlogin:signer-grant:v1:", js = "bitlogin:signer-grant-device-key:v1", pe = {
  /** The longest a site BitLogin knows is remembered, in seconds: thirty days from Allow. */
  keepSec: 720 * 3600,
  /** The longest for a site it does not know: seven days. */
  unknownKeepSec: 168 * 3600,
  /** How many recent room passes are remembered, to count them across page loads. */
  passKept: 10,
  /** How many recent signatures are remembered, to count them across page loads. */
  signedKept: 60
}, gn = (t) => t.at ?? t.until - Js(t.site), Js = (t) => (ne(t) ? Ni(t) : Di(t) !== null) ? pe.keepSec : pe.unknownKeepSec, ql = /^[0-9a-f]{64}$/u;
function Te(t) {
  if (typeof t != "string" || t.length > 300 || t.includes("*")) return "";
  try {
    const e = new URL(t);
    return (e.protocol === "https:" || e.protocol === "http:") && e.origin === t ? e.origin : "";
  } catch {
    return "";
  }
}
const Tr = (t) => ne(t) || Te(t), co = (t) => btoa(Array.from(t, (e) => String.fromCharCode(e)).join("")), lo = (t) => Uint8Array.from(atob(t), (e) => e.charCodeAt(0)), uo = (t) => {
  const e = new Uint8Array(t.byteLength);
  return e.set(t), e.buffer;
}, Fl = (t) => Array.from(t, (e) => e.toString(16).padStart(2, "0")).join("");
async function mn(t, e, o) {
  const n = Tr(e.site);
  if (!n || e.everydayPrivateKey.length !== 32 || typeof t.getOrCreateDeviceKey != "function" || ne(n) && e.permissions) return !1;
  const r = Math.min(Math.floor(e.until), Math.floor(o) + Js(n));
  if (!(r > o)) return !1;
  const s = crypto.getRandomValues(new Uint8Array(12));
  try {
    const i = await t.getOrCreateDeviceKey(js), a = JSON.stringify({
      site: n,
      key: Fl(e.everydayPrivateKey),
      until: r,
      ...e.name ? { name: e.name.slice(0, 48) } : {},
      ...ge(e.profile) ? { profile: ge(e.profile) } : {},
      // An application's public signatures are counted up to its own hourly limit, so more of them are kept.
      signed: e.signed.filter((d) => Number.isFinite(d)).slice(-(e.permissions ? Wt.public.hourly : pe.signedKept)),
      ...e.permissions ? { permissions: e.permissions } : {},
      ...!e.permissions && !ne(n) && ve(e.more).length ? { more: ve(e.more) } : {},
      ...typeof e.at == "number" ? { at: Math.floor(e.at) } : {},
      ...re(e.relays).length ? { relays: re(e.relays) } : {},
      ...typeof e.checkedAt == "number" ? { checkedAt: Math.floor(e.checkedAt) } : {},
      ...typeof e.seenAt == "number" ? { seenAt: Math.floor(e.seenAt) } : {},
      ...e.signedPass?.length ? { signedPass: e.signedPass.filter((d) => Number.isFinite(d)).slice(-pe.passKept) } : {},
      ...e.permissions && e.signedSensitive ? { signedSensitive: e.signedSensitive.filter((d) => Number.isFinite(d)).slice(-Wt.sensitive.hourly) } : {}
    }), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: s }, i, new TextEncoder().encode(a)), l = { v: 1, iv: co(s), ciphertext: co(new Uint8Array(c)) };
    return await t.set(ut + n, JSON.stringify(l)), !0;
  } catch {
    return !1;
  }
}
async function Ct(t, e, o) {
  const n = Tr(e);
  if (!n || typeof t.getOrCreateDeviceKey != "function") return null;
  try {
    const r = await t.get(ut + n);
    if (!r) return null;
    const s = JSON.parse(r);
    if (s.v !== 1 || typeof s.iv != "string" || typeof s.ciphertext != "string") return null;
    const i = await t.getOrCreateDeviceKey(js), a = await crypto.subtle.decrypt({ name: "AES-GCM", iv: uo(lo(s.iv)) }, i, uo(lo(s.ciphertext))), c = JSON.parse(new TextDecoder().decode(a)), l = (p) => typeof p == "number" && Number.isFinite(p) && p > 0 ? Math.floor(p) : void 0, d = ge(c.profile), y = c.permissions === void 0 ? void 0 : ir(c.permissions);
    if (y === null || y && (ne(n) || !ar(n, y)))
      return await t.delete(ut + n), null;
    const f = (p, g) => Array.isArray(p) ? p.filter((v) => typeof v == "number" && Number.isFinite(v)).slice(-g) : [];
    return c.site !== n || typeof c.key != "string" || !ql.test(c.key) || typeof c.until != "number" ? null : !(c.until > o) || c.until > o + pe.keepSec ? (await t.delete(ut + n), null) : {
      site: n,
      everydayPrivateKey: Uint8Array.from(c.key.match(/.{2}/gu) ?? [], (p) => Number.parseInt(p, 16)),
      until: c.until,
      ...typeof c.name == "string" && c.name ? { name: c.name.slice(0, 48) } : {},
      ...d ? { profile: d } : {},
      signed: f(c.signed, y ? Wt.public.hourly : pe.signedKept),
      ...f(c.signedPass, pe.passKept).length ? { signedPass: f(c.signedPass, pe.passKept) } : {},
      ...!y && !ne(n) && ve(c.more).length ? { more: ve(c.more) } : {},
      ...l(c.at) ? { at: l(c.at) } : {},
      ...re(c.relays).length ? { relays: re(c.relays) } : {},
      ...l(c.checkedAt) ? { checkedAt: l(c.checkedAt) } : {},
      ...l(c.seenAt) ? { seenAt: l(c.seenAt) } : {},
      ...y ? { permissions: y, signedSensitive: f(c.signedSensitive, Wt.sensitive.hourly) } : {}
    };
  } catch {
    return null;
  }
}
async function Nt(t, e) {
  const o = Tr(e);
  if (o)
    try {
      await t.delete(ut + o);
    } catch {
    }
}
const Gs = "bitlogin:signer-handoff:v1", $l = /* @__PURE__ */ new Set([
  "configure",
  "getPublicKey",
  "signEvent",
  "getSessionStatus",
  "logout",
  "handoffBegin",
  "handoffAccept",
  // The receipts BitLogin's page handed this site's signer, kept beside its grant (docs/paying.md; owner, 2026-11-21).
  "signerHold",
  "signerHeld",
  // What an approved application may ask beyond signing (§SW9.5). Each is refused unless the session carries a
  // permission set, and then held to it (cryptoWorker.ts).
  "appEncrypt",
  "appDecrypt",
  "appDecryptEvent",
  // A room pass for the site the hand-off was sealed for, built whole in the worker (§SW16).
  "roomPass",
  // What a world keeps for its visitor (NSWP-12): written, found and opened for the site the session serves.
  "worldSave",
  "worldFind",
  "worldOpen",
  // One person followed or unfollowed, for a world the user let do that (NSWP-14; embedded/follows.ts).
  "worldFollow",
  // A score on one of a world's boards, built whole in the worker (embedded/scores.ts).
  "worldScore",
  // An achievement held in a world, built whole in the worker (embedded/achievements.ts).
  "worldAchieve",
  // Private messages sealed and opened, and where they reach the user, for a world let do that (embedded/messages.ts).
  "worldSeal",
  "worldUnwrap",
  "worldReach",
  // Asking the user's relays whether this site was taken back (docs/take-back.md). It reads one record and the
  // user's relay list, and can only end the grant or leave it be.
  "signerCheck",
  // Remembering a site, so the user is not asked on every page load (signerGrant.ts).
  "signerKeep",
  "signerRestore",
  "signerTouch",
  "signerForget"
]), xn = /^[0-9a-f]{64}$/;
function Wl(t) {
  return Array.from(t, (e) => e.toString(16).padStart(2, "0")).join("");
}
function Vl(t) {
  return Uint8Array.from(t.match(/.{2}/g) ?? [], (e) => Number.parseInt(e, 16));
}
function Bl(t, e, o, n, r = {}) {
  if (!xn.test(e)) throw new Error("The hand-off has no usable recipient key.");
  if (t.length !== 32) throw new Error("No identity is unlocked in this session.");
  let s = null;
  if (n !== void 0) {
    const f = Te(n.site), p = ir(n.permissions);
    if (!f || !p || !ar(f, p)) throw new Error("That is not a permission set an application may be given.");
    s = { site: f, permissions: p };
  }
  const i = r.site === void 0 ? "" : Te(r.site);
  if (r.site !== void 0 && (!i || s && s.site !== i)) throw new Error("The hand-off names no usable site.");
  const a = ge(r.profile), c = !!i && r.visitOnly !== !0 && r.remember === !0, l = r.family === void 0 ? "" : ne(r.family);
  if (r.family !== void 0 && (!l || s || !c || !Ue(i, l))) throw new Error("That is not a family this site may be allowed as.");
  const d = ve(r.more);
  if (r.more !== void 0 && (d.length === 0 || !i || s || l)) throw new Error("That is not something this site may be let do.");
  const y = new ye(o.slice());
  try {
    const f = JSON.stringify({ v: 1, purpose: Gs, key: Wl(t), ...s ? { app: s } : {}, ...i ? { site: i } : {}, ...a ? { profile: a } : {}, ...c ? { remember: !0 } : {}, ...typeof r.at == "number" && Number.isFinite(r.at) ? { at: Math.floor(r.at) } : {}, ...re(r.relays).length ? { relays: re(r.relays) } : {}, ...l ? { family: l } : {}, ...d.length ? { more: d } : {} });
    return { senderPublicKey: y.getPublicKey(), payload: y.nip44Encrypt(e, f) };
  } finally {
    y.destroy();
  }
}
function jl(t, e) {
  if (!t || !xn.test(t.senderPublicKey) || typeof t.payload != "string")
    throw new Error("That is not a signer hand-off.");
  const o = new ye(e.slice());
  let n;
  try {
    n = o.nip44Decrypt(t.senderPublicKey, t.payload);
  } catch {
    throw new Error("The hand-off could not be opened.");
  } finally {
    o.destroy();
  }
  let r;
  try {
    r = JSON.parse(n);
  } catch {
    throw new Error("The hand-off could not be read.");
  }
  if (r.v !== 1 || r.purpose !== Gs || typeof r.key != "string" || !xn.test(r.key))
    throw new Error("That is not a signer hand-off.");
  const s = Vl(r.key);
  try {
    P(s);
  } catch {
    throw s.fill(0), new Error("The hand-off carried an unusable key.");
  }
  const i = r.site === void 0 ? null : Te(r.site);
  if (i === "")
    throw s.fill(0), new Error("The hand-off names no usable site.");
  const a = ge(r.profile), c = r.remember === !0 && !!i, l = typeof r.at == "number" && Number.isFinite(r.at) && r.at > 0 ? Math.floor(r.at) : null, d = re(r.relays), y = r.family === void 0 ? null : ne(r.family);
  if (y === "" || y && (r.app !== void 0 || !c || !Ue(i, y)))
    throw s.fill(0), new Error("The hand-off names a family it cannot be kept for.");
  const f = ve(r.more);
  if (r.more !== void 0 && (f.length === 0 || !i || y || r.app !== void 0))
    throw s.fill(0), new Error("The hand-off carries something this site may not be let do.");
  if (r.app === void 0) return { key: s, app: null, site: i, profile: a, remember: c, at: l, relays: d, family: y, more: f };
  const p = r.app, g = p && typeof p == "object" ? Te(p.site) : "", v = p && typeof p == "object" ? ir(p.permissions) : null;
  if (!g || !v || !ar(g, v) || i && i !== g)
    throw s.fill(0), new Error("The hand-off carried a permission set that cannot be read.");
  return { key: s, app: { site: g, permissions: v }, site: g, profile: a, remember: c, at: l, relays: d, family: null, more: [] };
}
const Hs = 38e3, zs = "38172", Jl = ["https://testnut.cashu.space", "https://nofees.testnut.cashu.space"], Gl = 8;
function Hl(t, e, o = 10) {
  const n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  for (const s of t)
    if (!(s.kind !== Hs || !s.tags.some((i) => i[0] === "k" && i[1] === zs)))
      for (const i of s.tags) {
        if (i[0] !== "u" || i[2] !== void 0 && i[2] !== "cashu") continue;
        const a = wt(i[1]);
        if (!a || !a.startsWith("https://") || Jl.includes(a)) continue;
        const c = r.get(s.pubkey) ?? /* @__PURE__ */ new Set();
        !c.has(a) && c.size >= Gl || (c.add(a), r.set(s.pubkey, c), (n.get(a) ?? n.set(a, /* @__PURE__ */ new Set()).get(a)).add(s.pubkey));
      }
  return [...n].map(([s, i]) => ({ mint: s, by: i.size, byFollowed: [...i].filter((a) => e.has(a)).length })).filter((s) => s.by >= 2 || s.byFollowed >= 1).sort((s, i) => i.byFollowed - s.byFollowed || i.by - s.by || s.mint.localeCompare(i.mint)).slice(0, o);
}
const Un = 30078, qn = "bitlogin-receipt:", Ht = 300, zt = "bitlogin:receipts:v1:";
function Mr(t, e) {
  const o = t, n = o?.event;
  if (!n || typeof n != "object" || n.kind !== 30078 || typeof n.content != "string" || n.content.length > 8e3 || !Array.isArray(n.tags) || !C(n)) return null;
  try {
    if (JSON.parse(n.content).buyerPubkey !== e) return null;
  } catch {
    return null;
  }
  return {
    event: { id: n.id, pubkey: n.pubkey, created_at: n.created_at, kind: n.kind, tags: n.tags.map((r) => r.map(String)), content: n.content, sig: n.sig },
    title: typeof o?.title == "string" ? o.title.slice(0, 80) : "",
    via: $t(o?.via) || ""
  };
}
async function Ir(t, e) {
  const o = e.getPublicKey(), n = /* @__PURE__ */ new Map(), r = async (i) => {
    try {
      const a = await t.get(i);
      return a ? JSON.parse(e.nip44Decrypt(o, a)) : null;
    } catch {
      return null;
    }
  }, s = await r(zt + o);
  for (const i of Array.isArray(s?.ids) ? s.ids.slice(0, Ht) : []) {
    if (typeof i != "string") continue;
    const a = await r(`${zt}${o}:${i}`), c = Mr(a, o);
    c && c.event.id === i && n.set(i, { ...c, saved: a?.saved === !0 });
  }
  return n;
}
async function Lr(t, e, o, n) {
  const r = e.getPublicKey(), s = (i) => e.nip44Encrypt(r, JSON.stringify(i));
  for (const i of n) {
    const a = o.get(i);
    a && await t.set(`${zt}${r}:${i}`, s(a));
  }
  await t.set(zt + r, s({ ids: [...o.keys()] }));
}
const Qt = (t, e) => ({
  receipts: [...t.values()].map(({ event: o, title: n, via: r }) => ({ event: o, title: n, via: r })).sort((o, n) => n.event.created_at - o.event.created_at),
  offline: e,
  unsaved: [...t.values()].some((o) => !o.saved)
});
async function Qs(t, e) {
  const { signer: o, store: n, relays: r } = t, s = o.getPublicKey(), i = Math.floor(t.now ?? Date.now() / 1e3), a = [];
  for (const [c, l] of e) {
    if (l.saved) continue;
    const d = o.signEvent({ kind: Un, created_at: i, tags: [["d", qn + c]], content: o.nip44Encrypt(s, JSON.stringify({ v: 1, event: l.event, title: l.title, via: l.via })) });
    $(await r.publishAll(d, 6e3).catch(() => [])) >= Math.min(2, r.relayUrls.length) && (l.saved = !0, a.push(c));
  }
  a.length && await Lr(n, o, e, a);
}
async function zl(t) {
  return Qt(await Ir(t.store, t.signer), !0);
}
async function Ql(t) {
  const { signer: e, store: o, relays: n } = t, r = e.getPublicKey(), s = await Ir(o, e), i = await n.queryQuorum({ kinds: [Un], authors: [r], limit: 500 }, 6e3).catch(() => null);
  if (!i || i.respondedCount === 0) return Qt(s, !0);
  const a = /* @__PURE__ */ new Set(), c = [];
  for (const l of i.outcomes.flatMap((d) => d.events)) {
    if (l.kind !== Un || l.pubkey !== r || !C(l)) continue;
    const d = l.tags.find((f) => f[0] === "d")?.[1];
    if (typeof d != "string" || !d.startsWith(qn)) continue;
    let y;
    try {
      y = Mr(JSON.parse(e.nip44Decrypt(r, l.content)), r);
    } catch {
      continue;
    }
    !y || y.event.id !== d.slice(qn.length) || (a.add(y.event.id), !(s.has(y.event.id) || s.size >= Ht) && (s.set(y.event.id, { ...y, saved: !0 }), c.push(y.event.id)));
  }
  for (const [l, d] of s)
    a.has(l) !== d.saved && (d.saved = a.has(l), c.push(l));
  return await Lr(o, e, s, c), await Qs(t, s), Qt(s, !1);
}
async function Yl(t, e) {
  const { signer: o, store: n } = t, r = o.getPublicKey(), s = Array.isArray(e) ? e.slice(0, Ht).map((c) => Mr(c, r)) : [];
  if (s.length === 0 || s.some((c) => !c)) throw new Error("That is not a receipt of this account's.");
  const i = await Ir(n, o), a = [];
  for (const c of s)
    if (!i.has(c.event.id)) {
      if (i.size >= Ht) throw new Error("This account keeps as many receipts as it can.");
      i.set(c.event.id, { ...c, saved: !1 }), a.push(c.event.id);
    }
  return await Lr(n, o, i, a), await Qs(t, i).catch(() => {
  }), Qt(i, !1);
}
function Ys(t) {
  const e = t;
  if (!e || typeof e != "object") return null;
  const o = To(e.listing);
  if (!o || typeof e.order != "string" || !/^order_[A-Za-z0-9_-]{12,80}$/u.test(e.order) || typeof e.key != "string" || !/^[A-Za-z0-9_-]{16,128}$/u.test(e.key)) return null;
  const n = $t(e.service);
  return n ? { listing: o, order: e.order, key: e.key, service: n, title: typeof e.title == "string" ? e.title.slice(0, 80) : "", via: $t(e.via) || "", client: typeof e.client == "string" && /^[0-9a-f]{64}$/u.test(e.client) ? e.client : "", at: typeof e.at == "number" && Number.isFinite(e.at) ? e.at : 0 } : null;
}
const Xs = (t) => Array.isArray(t) ? t.map(Ys).filter((e) => !!e).slice(-20) : [], Fn = 30078, $n = "bitlogin-pay-settings", Zs = "bitlogin:pay-settings:v1:";
async function ei({ signer: t, store: e }) {
  const o = t.getPublicKey();
  try {
    const n = await e.get(Zs + o), r = n ? JSON.parse(t.nip44Decrypt(o, n)) : null;
    return r && typeof r.at == "number" ? { limitSats: cr(r.limitSats), orders: Xs(r.orders), at: r.at, saved: r.saved === !0 } : null;
  } catch {
    return null;
  }
}
const Yt = ({ signer: t, store: e }, o) => e.set(Zs + t.getPublicKey(), t.nip44Encrypt(t.getPublicKey(), JSON.stringify(o)));
async function ti(t, e) {
  const { signer: o, relays: n } = t, r = o.getPublicKey(), s = o.signEvent({ kind: Fn, created_at: Math.floor(e.at), tags: [["d", $n]], content: o.nip44Encrypt(r, JSON.stringify({ v: 1, limitSats: e.limitSats, orders: e.orders, at: e.at })) });
  return $(await n.publishAll(s, 5e3).catch(() => [])) >= Math.min(2, n.relayUrls.length);
}
async function Xl(t) {
  const { signer: e, relays: o } = t, n = e.getPublicKey();
  let r = await ei(t);
  const s = await o.queryQuorum({ kinds: [Fn], authors: [n], "#d": [$n], limit: 2 }, 3e3).catch(() => null);
  if (s && s.respondedCount > 0) {
    const i = s.outcomes.flatMap((c) => c.events).filter((c) => c.kind === Fn && c.pubkey === n && c.tags.some((l) => l[0] === "d" && l[1] === $n) && C(c)).sort((c, l) => l.created_at - c.created_at)[0];
    let a = null;
    try {
      const c = i ? JSON.parse(e.nip44Decrypt(n, i.content)) : null;
      c && (a = { limitSats: cr(c.limitSats), orders: Xs(c.orders), at: typeof c.at == "number" ? c.at : i.created_at, saved: !0 });
    } catch {
      a = null;
    }
    a && (!r || a.at > r.at) ? (r = a, await Yt(t, r)) : r && (!r.saved || !a) && (r.saved = await ti(t, r), await Yt(t, r));
  }
  return { limitSats: r?.limitSats ?? No.default, orders: r?.orders ?? [], unsaved: !!r && !r.saved };
}
async function Zl(t, e) {
  const o = e ?? {}, n = await ei(t), r = { limitSats: n?.limitSats ?? No.default, orders: n?.orders ?? [], at: t.now ?? Date.now() / 1e3, saved: !1 };
  if (o.limitSats !== void 0) {
    if (cr(o.limitSats) !== o.limitSats) throw new Error("That is not a limit this wallet keeps.");
    r.limitSats = o.limitSats;
  } else if (o.addOrder !== void 0) {
    const s = Ys({ ...o.addOrder, at: r.at });
    if (!s) throw new Error("That is not an order this wallet can keep.");
    r.orders = [...r.orders.filter((i) => !(i.listing === s.listing && i.service === s.service)), s].slice(-20);
  } else if (typeof o.removeOrder == "string")
    r.orders = r.orders.filter((s) => s.order !== o.removeOrder);
  else throw new Error("That is not a change this wallet keeps.");
  return await Yt(t, r), r.saved = await ti(t, r).catch(() => !1), r.saved && await Yt(t, r), { limitSats: r.limitSats, orders: r.orders, unsaved: !r.saved };
}
const eu = { enough: 2, graceMs: 700 };
function tu(t, e, o = eu) {
  const n = t.map((s) => e(s)), r = (s, i) => new Promise((a) => {
    const c = [];
    let l = n.length, d = 0, y = null, f = !1;
    const p = () => {
      f || (f = !0, y && clearTimeout(y), a(c));
    };
    if (l === 0) return p();
    for (const g of n)
      s(g).then((v) => {
        f || (c.push(v), i(v) && d++);
      }).catch(() => {
      }).finally(() => {
        if (l--, l === 0) return p();
        d >= Math.min(o.enough, n.length) && !y && (y = setTimeout(p, o.graceMs));
      });
  });
  return {
    relayUrls: [...t],
    async queryQuorum(s, i) {
      const a = await r((c) => c.queryQuorum(s, i), (c) => c.respondedCount > 0);
      return { outcomes: a.flatMap((c) => c.outcomes), respondedCount: a.reduce((c, l) => c + l.respondedCount, 0) };
    },
    async publishAll(s, i) {
      return (await r((a) => a.publishAll(s, i), (a) => a.some((c) => c.result.ok))).flat();
    },
    closeAll() {
      for (const s of n) s.closeAll();
    }
  };
}
const Wn = 30078, Vn = "bitlogin-drive:", rt = 10063, nu = 24242, dt = "bitlogin:drive:v1:", ru = { autoPaySats: 0, at: 0, saved: !0 }, Or = (t) => {
  const e = t?.autoPaySats;
  return { autoPaySats: typeof e == "number" && Number.isSafeInteger(e) && e >= 0 && e <= 1e5 ? e : 0 };
};
async function Dr(t, e) {
  const o = e.getPublicKey(), n = { folders: /* @__PURE__ */ new Map(), removed: /* @__PURE__ */ new Map(), settings: { ...ru } }, r = async (a) => {
    try {
      const c = await t.get(a);
      return c ? JSON.parse(e.nip44Decrypt(o, c)) : null;
    } catch {
      return null;
    }
  }, s = await r(dt + o);
  if (!s) return n;
  for (const a of Array.isArray(s.folders) ? s.folders.slice(0, ur.folders + 1) : []) {
    if (typeof a != "string") continue;
    const c = await r(`${dt}${o}:${a}`), l = lr(c?.folder);
    l && n.folders.set(l.id, { folder: l, saved: c?.saved === !0 });
  }
  for (const a of Array.isArray(s.removed) ? s.removed : [])
    Array.isArray(a) && typeof a[0] == "string" && typeof a[1] == "number" && n.removed.set(a[0], a[1]);
  const i = s.settings;
  return n.settings = { ...Or(i), at: typeof i?.at == "number" ? i.at : 0, saved: i?.saved !== !1 }, n;
}
async function xr(t, e, o, n, r = []) {
  const s = e.getPublicKey(), i = (a) => e.nip44Encrypt(s, JSON.stringify(a));
  for (const a of n) {
    const c = o.folders.get(a);
    c && await t.set(`${dt}${s}:${a}`, i(c));
  }
  for (const a of r) await t.delete(`${dt}${s}:${a}`).catch(() => {
  });
  await t.set(dt + s, i({ folders: [...o.folders.keys()], removed: [...o.removed], settings: o.settings }));
}
const bn = (t, e) => $(t) >= Math.min(2, e);
function kn(t, e, o, n) {
  const r = t.getPublicKey();
  return t.signEvent({ kind: Wn, created_at: Math.floor(n), tags: [["d", Vn + e]], content: t.nip44Encrypt(r, JSON.stringify(o)) });
}
const Xt = (t, e) => ({
  folders: [...t.folders.values()].map((o) => o.folder),
  settings: { autoPaySats: t.settings.autoPaySats },
  offline: e,
  unsaved: [...t.folders.values()].some((o) => !o.saved) || t.removed.size > 0 || !t.settings.saved
});
async function ni(t, e) {
  const { signer: o, store: n, relays: r } = t, s = t.now ?? Date.now() / 1e3, i = [];
  for (const [a, c] of e.folders)
    c.saved || !bn(await r.publishAll(kn(o, a, { v: 1, folder: c.folder }, Math.max(s, c.folder.at)), 6e3).catch(() => []), r.relayUrls.length) || (c.saved = !0, i.push(a));
  for (const [a, c] of [...e.removed])
    bn(await r.publishAll(kn(o, a, { v: 1, deleted: !0, at: c }, Math.max(s, c)), 6e3).catch(() => []), r.relayUrls.length) && e.removed.delete(a);
  e.settings.saved || bn(await r.publishAll(kn(o, "settings", { v: 1, settings: { autoPaySats: e.settings.autoPaySats }, at: e.settings.at }, Math.max(s, e.settings.at)), 6e3).catch(() => []), r.relayUrls.length) && (e.settings.saved = !0), await xr(n, o, e, i);
}
async function ou(t) {
  return Xt(await Dr(t.store, t.signer), !0);
}
async function su(t) {
  const { signer: e, store: o, relays: n } = t, r = e.getPublicKey(), s = await Dr(o, e), i = await n.queryQuorum({ kinds: [Wn], authors: [r], limit: 500 }, 6e3).catch(() => null);
  if (!i || i.respondedCount === 0) return Xt(s, !0);
  const a = /* @__PURE__ */ new Map();
  for (const d of i.outcomes.flatMap((y) => y.events)) {
    if (d.kind !== Wn || d.pubkey !== r || !C(d)) continue;
    const y = d.tags.find((p) => p[0] === "d")?.[1];
    if (typeof y != "string" || !y.startsWith(Vn)) continue;
    const f = y.slice(Vn.length);
    (!a.has(f) || a.get(f).created_at < d.created_at) && a.set(f, d);
  }
  const c = [], l = [];
  for (const [d, y] of a) {
    let f;
    try {
      f = JSON.parse(e.nip44Decrypt(r, y.content));
    } catch {
      continue;
    }
    if (d === "settings") {
      const v = typeof f.at == "number" ? f.at : y.created_at;
      (s.settings.saved || v > s.settings.at) && (s.settings = { ...Or(f.settings), at: v, saved: !0 });
      continue;
    }
    const p = s.folders.get(d);
    if (f.deleted === !0) {
      const v = typeof f.at == "number" ? f.at : y.created_at;
      p && (p.saved || p.folder.at <= v) && (s.folders.delete(d), l.push(d)), s.removed.delete(d);
      continue;
    }
    const g = lr(f.folder);
    !g || g.id !== d || s.removed.has(d) || p && !p.saved && p.folder.at >= g.at || p && p.saved && p.folder.at >= g.at || (s.folders.set(d, { folder: g, saved: !0 }), c.push(d));
  }
  for (const [d, y] of s.folders) a.has(d) || (y.saved = !1);
  return await xr(o, e, s, c, l), await ni(t, s), Xt(s, !1);
}
async function iu(t, e) {
  const { signer: o, store: n } = t, r = t.now ?? Date.now() / 1e3, s = (e.save ?? []).map(lr);
  if (s.some((l) => !l)) throw new Error("That is not a folder this drive can keep.");
  const i = await Dr(n, o), a = [], c = [];
  for (const l of s)
    i.folders.set(l.id, { folder: l, saved: !1 }), i.removed.delete(l.id), a.push(l.id);
  for (const l of e.remove ?? [])
    typeof l != "string" || !/^[0-9a-f]{16}$/u.test(l) || (i.folders.delete(l), i.removed.set(l, Math.floor(r)), c.push(l));
  if (i.folders.size > ur.folders + 1) throw new Error("There are too many folders.");
  return e.settings !== void 0 && (i.settings = { ...Or(e.settings), at: Math.floor(r), saved: !1 }), await xr(n, o, i, a, c), await ni(t, i), Xt(i, !1);
}
function au(t, e, o = Date.now() / 1e3) {
  const n = dr(e.server), r = e.verb;
  if (!n || r !== "upload" && r !== "delete" && r !== "get") throw new Error("That is not something a file server is asked.");
  const s = typeof e.sha256 == "string" && /^[0-9a-f]{64}$/u.test(e.sha256) ? e.sha256 : "";
  if (!s) throw new Error("A permission note names the one file it is for.");
  const i = t.signEvent({
    kind: nu,
    // In the past, as a server requires, by a margin wider than two clocks usually differ.
    created_at: Math.floor(o) - 30,
    tags: [["t", r], ["expiration", String(Math.floor(o) + 300)], ["server", new URL(n).hostname.toLowerCase()], ["x", s]],
    content: r === "upload" ? "Upload a file" : r === "delete" ? "Delete a file" : "Fetch a file"
  }), a = new TextEncoder().encode(JSON.stringify(i));
  let c = "";
  for (const l of a) c += String.fromCharCode(l);
  return btoa(c).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}
const ri = (t) => [...new Set(t.tags.filter((e) => e[0] === "server").map((e) => dr(e[1])).filter(Boolean))];
function cu(t, e, o = 12) {
  const n = /* @__PURE__ */ new Map();
  for (const s of t) s.kind === rt && (!n.has(s.pubkey) || n.get(s.pubkey).created_at < s.created_at) && n.set(s.pubkey, s);
  const r = /* @__PURE__ */ new Map();
  for (const s of n.values()) for (const i of ri(s).filter((a) => a.startsWith("https://")).slice(0, 6)) (r.get(i) ?? r.set(i, /* @__PURE__ */ new Set()).get(i)).add(s.pubkey);
  return [...r].map(([s, i]) => ({ server: s, by: i.size, byFollowed: [...i].filter((a) => e.has(a)).length })).filter((s) => s.by >= 2 || s.byFollowed >= 1).sort((s, i) => i.byFollowed - s.byFollowed || i.by - s.by || s.server.localeCompare(i.server)).slice(0, o);
}
const oi = "bitlogin:ecash:v1:", Zt = (t) => t.startsWith("local:"), si = () => `local:${Array.from(crypto.getRandomValues(new Uint8Array(8)), (t) => t.toString(16).padStart(2, "0")).join("")}`;
async function ln(t, e) {
  const o = e.getPublicKey();
  try {
    const n = await t.get(oi + o);
    if (!n) return { wallet: null, tokens: [] };
    const r = JSON.parse(e.nip44Decrypt(o, n)), s = typeof r.wallet == "string" ? Mo(r.wallet) : null, i = [];
    for (const a of Array.isArray(r.tokens) ? r.tokens : []) {
      const c = a, l = Lo(c.proofs);
      typeof c.event == "string" && c.event.length <= 80 && wt(c.mint) && l?.length && i.push({ event: c.event, mint: wt(c.mint), proofs: l });
    }
    return { wallet: s, tokens: i };
  } catch {
    return { wallet: null, tokens: [] };
  }
}
async function en(t, e, o) {
  const n = e.getPublicKey();
  await t.set(oi + n, e.nip44Encrypt(n, JSON.stringify({ wallet: o.wallet ? Io(o.wallet) : null, tokens: o.tokens })));
}
const tn = (t, e) => $(t) >= Math.min(2, e);
function ii(t, e, o) {
  const n = t.getPublicKey();
  return t.signEvent({ kind: ct, created_at: Math.floor(o), tags: [], content: t.nip44Encrypt(n, Fi(e)) });
}
const Ge = (t, e) => ({ mints: t.wallet?.mints ?? [], tokens: t.tokens, offline: e, unsaved: t.tokens.some((o) => Zt(o.event)) });
async function lu(t) {
  return Ge(await ln(t.store, t.signer), !0);
}
async function uu(t) {
  const { signer: e, store: o, relays: n } = t, r = e.getPublicKey(), s = await ln(o, e), [i, a, c] = await Promise.all([
    n.queryQuorum({ kinds: [Mn], authors: [r], limit: 2 }, 5e3),
    n.queryQuorum({ kinds: [ct], authors: [r], limit: Pe.tokens }, 6e3),
    n.queryQuorum({ kinds: [5], authors: [r], "#k": [String(ct)], limit: Pe.tokens }, 6e3)
  ]).catch(() => [null, null, null]);
  if (!a || !i || !c || a.respondedCount === 0) return Ge(s, !0);
  const l = (E, K) => E.filter((I) => I.kind === K && I.pubkey === r && C(I)), d = (E) => {
    try {
      return e.nip44Decrypt(r, E.content);
    } catch {
      return null;
    }
  }, y = l(i.outcomes.flatMap((E) => E.events), Mn).sort((E, K) => K.created_at - E.created_at)[0], f = y && Mo(d(y) ?? "") || s.wallet, p = new Set(l(c.outcomes.flatMap((E) => E.events), 5).flatMap((E) => E.tags.filter((K) => K[0] === "e" && typeof K[1] == "string").map((K) => K[1]))), g = /* @__PURE__ */ new Map();
  for (const E of l(a.outcomes.flatMap((K) => K.events), ct)) g.set(E.id, E);
  const v = [...g.values()].flatMap((E) => {
    const K = xi(d(E) ?? "");
    return K ? [{ event: E.id, created_at: E.created_at, ...K }] : [];
  }), b = Ui(v, p), h = new Set(b.flatMap((E) => E.proofs.map((K) => K.secret))), k = { wallet: f, tokens: [...b] }, m = new Set(v.flatMap((E) => E.del));
  for (const E of s.tokens.filter((K) => !Zt(K.event))) {
    if (g.has(E.event) || p.has(E.event) || m.has(E.event)) continue;
    const K = E.proofs.filter((I) => !h.has(I.secret));
    if (K.length !== 0) {
      for (const I of K) h.add(I.secret);
      k.tokens.push({ event: E.event, mint: E.mint, proofs: K });
    }
  }
  const _ = /* @__PURE__ */ new Map();
  for (const E of s.tokens.filter((K) => Zt(K.event))) {
    const K = E.proofs.filter((I) => !h.has(I.secret));
    for (const I of K) h.add(I.secret);
    K.length && _.set(E.mint, [..._.get(E.mint) ?? [], ...K]);
  }
  const O = [];
  for (const [E, K] of _) for (let I = 0; I < K.length; I += Pe.proofsWritten) O.push({ mint: E, proofs: K.slice(I, I + Pe.proofsWritten) });
  const q = t.now ?? Date.now() / 1e3, Y = O.map((E) => ii(e, E, q)), X = await Promise.all(Y.map(async (E) => tn(await n.publishAll(E, 6e3).catch(() => []), n.relayUrls.length)));
  for (const [E, K] of O.entries()) k.tokens.push({ event: X[E] ? Y[E].id : si(), ...K });
  return await en(o, e, k), Ge(k, !1);
}
async function du(t, e) {
  const { signer: o, store: n, relays: r } = t, s = o.getPublicKey(), i = [...new Set((Array.isArray(e) ? e : []).map(wt).filter(Boolean))];
  if (i.length === 0 || i.length > Pe.mints) throw new Error("Name between one and five mints, each an https address.");
  const a = await ln(n, o), c = { privkey: a.wallet?.privkey ?? t.newKey(), mints: i }, l = { wallet: c, tokens: a.tokens };
  await en(n, o, l);
  const d = o.signEvent({ kind: Mn, created_at: Math.floor(t.now ?? Date.now() / 1e3), tags: [], content: o.nip44Encrypt(s, Io(c)) });
  if (!tn(await r.publishAll(d, 6e3).catch(() => []), r.relayUrls.length)) throw new Error("The wallet was saved in this browser, but no relay took it. Try again when you are online.");
  return Ge(l, !1);
}
async function yu(t, e, o) {
  const { signer: n, store: r, relays: s } = t, i = t.now ?? Date.now() / 1e3, a = new Set(e.destroy.filter((m) => typeof m == "string" && m.length <= 80)), c = e.keep.map((m) => ({ mint: wt(m.mint), proofs: Lo(m.proofs, 5e3) }));
  if (c.some((m) => !m.mint || !m.proofs)) throw new Error("That is not ecash this wallet can keep.");
  const l = await ln(r, n), d = c.flatMap((m) => {
    const _ = [];
    for (let O = 0; O < m.proofs.length; O += Pe.proofsWritten) _.push({ event: si(), mint: m.mint, proofs: m.proofs.slice(O, O + Pe.proofsWritten) });
    return _;
  }), y = { wallet: l.wallet, tokens: [...l.tokens.filter((m) => !a.has(m.event)), ...d] };
  await en(r, n, y), o?.(Ge(y, !1));
  const f = [...a].filter((m) => !Zt(m)), p = d.map((m, _) => ii(n, { mint: m.mint, proofs: m.proofs, ...f.length && _ === 0 ? { del: f } : {} }, i)), g = n.getPublicKey(), v = e.history && Number.isSafeInteger(e.history.amount) && e.history.amount > 0 ? n.signEvent({ kind: Wr, created_at: Math.floor(i), tags: [], content: n.nip44Encrypt(g, qi({ ...e.history, created: p.map((m) => m.id), destroyed: f })) }) : null, [b, h] = await Promise.all([
    Promise.all(p.map(async (m) => tn(await s.publishAll(m, 6e3).catch(() => []), s.relayUrls.length))),
    v ? s.publishAll(v, 6e3).then((m) => tn(m, s.relayUrls.length)).catch(() => !1) : Promise.resolve(!1)
  ]);
  for (const [m, _] of d.entries()) b[m] && (_.event = p[m].id);
  await en(r, n, y);
  const k = b.every(Boolean);
  if (v && h && !k) {
    const m = n.signEvent({ kind: 5, created_at: Math.floor(i), tags: [["e", v.id], ["k", String(Wr)]], content: "" });
    await s.publishAll(m, 6e3).catch(() => []);
  }
  if (f.length && k) {
    const m = n.signEvent({ kind: 5, created_at: Math.floor(i), tags: [...f.map((_) => ["e", _]), ["k", String(ct)]], content: "" });
    await s.publishAll(m, 6e3).catch(() => []);
  }
  return Ge(y, !1);
}
const ai = "bitlogin:session-public:v1";
async function fu(t, e) {
  try {
    const o = {
      pubkey: e.pubkey,
      npub: e.npub,
      ...e.name ? { name: e.name } : {}
    };
    await t.set(ai, JSON.stringify(o));
  } catch {
  }
}
async function Xe(t) {
  try {
    await t.delete(ai);
  } catch {
  }
}
const yo = (t) => t.then(
  () => {
  },
  () => {
  }
);
class pu {
  alone = Promise.resolve();
  lanes = /* @__PURE__ */ new Map();
  run(e, o) {
    if (e === null) {
      const i = Promise.all([this.alone, ...this.lanes.values()]).then(o, o);
      return this.alone = yo(i), this.lanes.clear(), i;
    }
    const r = Promise.all([this.alone, this.lanes.get(e) ?? Promise.resolve()]).then(o, o);
    return this.lanes.set(e, yo(r)), r;
  }
}
const hu = 3 * 6e4;
class wu {
  constructor(e, o = Date.now, n = (r, s) => new sn(r, { connectTimeoutMs: s })) {
    this.connectTimeoutMs = e, this.now = o, this.open = n;
  }
  connections = /* @__PURE__ */ new Map();
  failedAt = /* @__PURE__ */ new Map();
  /** The kept connection to a relay, opened the first time it is wanted. */
  connectionFor = (e) => {
    let o = this.connections.get(e);
    return o || (o = this.open(e, this.connectTimeoutMs), this.connections.set(e, o)), o;
  };
  /** Whether this relay failed within the memory's time. */
  notWaitedFor = (e) => {
    const o = this.failedAt.get(e);
    return o === void 0 ? !1 : this.now() - o < hu ? !0 : (this.failedAt.delete(e), !1);
  };
  /**
   * What a relay did when it was tried. A failure is remembered, and its connection dropped, so the next try after the
   * memory's time starts afresh. An answer clears what was remembered.
   */
  heard = (e, o) => {
    if (o) {
      this.failedAt.delete(e);
      return;
    }
    this.failedAt.set(e, this.now()), this.connections.get(e)?.close(), this.connections.delete(e);
  };
  /** The session is gone: every connection is closed, and nothing is remembered. */
  closeAll() {
    for (const e of this.connections.values()) e.close();
    this.connections.clear(), this.failedAt.clear();
  }
}
const u = {
  signer: null,
  everydayPrivateKey: null,
  accountId: null,
  recoveryPublicKey: null,
  activeCredentialEvent: null,
  activeRecoveryEvent: null,
  pendingRecovery: null,
  everydayKeyDerived: !1,
  connectionVaultRoot: null,
  vaultKnown: !1,
  vault: null,
  signerOnly: !1,
  app: null,
  site: null,
  profile: null,
  remember: !1,
  grantAt: null,
  relays: [],
  family: null,
  more: []
};
let be = null, R = [...xo], D = [...Uo];
const w = new ml();
let Bn = !1, jn = !1;
function fo(t) {
  Bn || (R = t.vaultRelays), jn || (D = t.discoveryRelays);
}
const vu = 1500, gu = new pu(), mu = {
  ecashLoad: "ecash",
  ecashSetMints: "ecash",
  ecashRoll: "ecash",
  // Asks relays which mints people recommend, and writes nothing: a line of its own, so it holds up no wallet work.
  ecashMints: "mints",
  driveLoad: "drive",
  driveSave: "drive",
  blossomServers: "drive",
  blossomSetServers: "drive",
  blossomAuth: "drive",
  receiptsLoad: "receipts",
  receiptsKeep: "receipts",
  paySettingsLoad: "paySettings",
  paySettingsSave: "paySettings",
  // Reads the account's profile and relay list, and keeps them only if the session is still the one that asked.
  loadProfile: "profile",
  profileContent: "profile"
};
let N = null, En = Date.now();
const bu = /* @__PURE__ */ new Set(["configure", "lockStatus", "lockOpen", "restoreSession", "getSessionStatus", "logout"]), ci = "bitlogin:taken-back:v1:";
async function ku(t) {
  try {
    const e = await w.get(ci + t);
    return (e ? Ao(JSON.parse(e)) : null) ?? Nn;
  } catch {
    return Nn;
  }
}
function po(t, e) {
  try {
    return Ao(JSON.parse(t.nip44Decrypt(t.getPublicKey(), e)));
  } catch {
    return null;
  }
}
function Ze() {
  j(), N && S(N), N = null;
}
async function Oe() {
  const t = await me(w);
  return t ? {
    on: !0,
    // Locked with nothing in the active slot too, where other accounts are kept: theirs are sealed under it.
    locked: !N && (await Ot(w) === "locked" || (await H(w)).length > 0),
    device: !!t.device,
    ...t.device ? { credentialId: t.device.credentialId } : {},
    triesLeft: Math.max(0, Q.tries - t.tries)
  } : { on: !1, locked: !1, device: !1, triesLeft: 0 };
}
function A() {
  if (!u.signer || !u.everydayPrivateKey)
    throw new Error("No identity is unlocked in this session.");
  return { signer: u.signer, everydayPrivateKey: u.everydayPrivateKey };
}
function Z() {
  const t = A();
  if (!u.signerOnly || u.app || !u.site) throw new Error("refused");
  return { ...t, site: u.site };
}
const Jn = "bitlogin:world-counts:v1:", Eu = "bitlogin:follows-seen:v1:", Gn = /* @__PURE__ */ new Map();
async function ke(t, e, o, n = !0) {
  const r = `${Jn}${t}:${e}`;
  let s = Gn.get(r);
  if (!s)
    try {
      const l = n ? JSON.parse(await w.get(r) ?? "[]") : [];
      s = Array.isArray(l) ? l.filter((d) => typeof d == "number" && Number.isFinite(d)).slice(-o.hourly) : [];
    } catch {
      s = [];
    }
  const i = ia(o, s), a = Date.now(), c = i.take(a);
  return Gn.set(r, i.times()), c && n && await w.set(r, JSON.stringify(i.times())).catch(() => {
  }), c;
}
function _n() {
  if (!u.signerOnly || !u.app) throw new Error("refused");
  return u.app;
}
function j() {
  xt.closeAll(), u.signer?.destroy(), u.everydayPrivateKey && u.everydayPrivateKey.fill(0), u.signer = null, u.everydayPrivateKey = null, u.accountId = null, u.recoveryPublicKey = null, u.activeCredentialEvent = null, u.activeRecoveryEvent = null, u.everydayKeyDerived = !1, u.vault?.destroy(), u.vault = null, u.connectionVaultRoot && u.connectionVaultRoot.fill(0), u.connectionVaultRoot = null, u.vaultKnown = !1, u.signerOnly = !1, u.app = null, u.site = null, u.profile = null, u.remember = !1, u.grantAt = null, u.relays = [], u.family = null, u.more = [], u.pendingRecovery && (u.pendingRecovery.recoveryPrivateKey.fill(0), u.pendingRecovery.everydayPrivateKey.fill(0), u.pendingRecovery = null);
}
function ho(t) {
  return j(), u.pendingRecovery = t, u.signer = new ye(t.everydayPrivateKey), u.everydayPrivateKey = t.everydayPrivateKey, u.accountId = t.accountId, u.recoveryPublicKey = t.recoveryPublicKey, u.activeRecoveryEvent = t.currentRecoveryEvent, u.everydayKeyDerived = t.everydayKeyDerived, Hn(
    t.currentRecoveryPayload.connection_vault_root ? x(t.currentRecoveryPayload.connection_vault_root) : void 0
  ), {
    everydayPublicKey: t.everydayPublicKey,
    accountId: t.accountId,
    generalRelays: t.generalRelays,
    dmRelays: t.dmRelays,
    chainWarning: t.chainWarning,
    everydayKeyDerived: t.everydayKeyDerived
  };
}
function Hn(t, e) {
  u.connectionVaultRoot = t ?? null, u.vaultKnown = !0, u.vault = null, e && S(e);
}
async function Ee() {
  if (!u.everydayPrivateKey || !u.accountId || !u.recoveryPublicKey || !u.activeCredentialEvent || !u.activeRecoveryEvent)
    return;
  const t = await me(w);
  t && !N && (await lt(w), await zn());
  const e = {
    everydayPrivateKey: u.everydayPrivateKey,
    accountId: u.accountId,
    recoveryPublicKey: u.recoveryPublicKey,
    activeCredentialEvent: u.activeCredentialEvent,
    activeRecoveryEvent: u.activeRecoveryEvent,
    ...u.connectionVaultRoot ? { connectionVaultRoot: u.connectionVaultRoot } : {},
    ...u.vaultKnown ? { vaultEnabled: u.connectionVaultRoot !== null } : {},
    everydayKeyDerived: u.everydayKeyDerived
  }, o = t && N ? N : null;
  await On(w, e, o);
  const n = P(u.everydayPrivateKey);
  await On(w, e, o, J(n));
  const r = Nl(await H(w), n, Date.now() / 1e3);
  for (const s of r.dropped) await ee(w, J(s));
  await Ke(w, r.list), await li();
}
async function zn() {
  for (const t of await H(w)) await ee(w, J(t.pubkey));
  await Ke(w, []);
}
async function wo(t, e) {
  const o = u.everydayPrivateKey ? P(u.everydayPrivateKey) : "";
  let n = await H(w);
  for (const r of n) {
    if (r.pubkey === o) continue;
    const s = await qs(w, t, J(r.pubkey));
    s ? (await On(w, s, e, J(r.pubkey)), s.everydayPrivateKey.fill(0), s.connectionVaultRoot?.fill(0)) : (await ee(w, J(r.pubkey)), n = Dt(n, r.pubkey));
  }
  await Ke(w, n);
}
async function Pn(t) {
  const e = await qs(w, N, t);
  return e ? (j(), u.signer = new ye(e.everydayPrivateKey), u.everydayPrivateKey = e.everydayPrivateKey, u.accountId = e.accountId, u.recoveryPublicKey = e.recoveryPublicKey, u.activeCredentialEvent = e.activeCredentialEvent, u.activeRecoveryEvent = e.activeRecoveryEvent, u.everydayKeyDerived = e.everydayKeyDerived ?? !1, u.connectionVaultRoot = e.connectionVaultRoot ?? null, u.vaultKnown = e.vaultEnabled !== void 0, await li(), {
    restored: !0,
    everydayPublicKey: u.signer.getPublicKey(),
    accountId: e.accountId,
    everydayKeyDerived: u.everydayKeyDerived
  }) : { restored: !1 };
}
async function li() {
  if (!u.signer) return;
  const t = u.signer.getPublicKey();
  await fu(w, { pubkey: t, npub: ot(t) });
}
function ae() {
  try {
    return new URL(self.location.href).origin;
  } catch {
    return "";
  }
}
const Sn = "bitlogin:held:v1:", ui = 3e3, vo = 2500, xt = new wu(ui), B = (t) => {
  const e = new T(t, {
    connectTimeoutMs: ui,
    connectionFor: xt.connectionFor,
    notWaitedFor: xt.notWaitedFor,
    heard: xt.heard
  }), o = e.queryQuorum.bind(e);
  return e.queryQuorum = (n, r = vo) => o(n, Math.min(r, vo)), e;
}, _u = 1500, Kn = (t) => {
  const e = B(t);
  return e.publishAll = (o, n) => e.publishEnough(o, n, 2, _u), e;
}, De = (t) => tu(t, (e) => B([e]));
function _e() {
  if (!Oo(ae())) throw new Error("That is done at BitLogin's own address.");
}
function An(t) {
  if (t === void 0) return ae();
  const e = Te(t);
  if (!e || !Oo(ae())) throw new Error("A wallet connection is for this site only.");
  return e;
}
function Qn() {
  if (!u.signer) throw new Error("No identity is unlocked in this session.");
  if (!u.connectionVaultRoot)
    throw new Error(
      u.vaultKnown ? "This account predates the Connection Vault. Enable it from your BitLogin account manager (recovery phrase required)." : "Sign in again to use wallet connections on this device."
    );
  return u.vault ??= new hl(u.connectionVaultRoot.slice()), u.vault;
}
function et(t) {
  const { record: e } = t, o = {
    connectionId: e.connection_id,
    connectionType: e.connection_type,
    label: e.label,
    state: e.state,
    origin: e.application_binding.origin,
    createdAt: e.created_at,
    updatedAt: e.updated_at
  };
  if (e.connection_type === "nwc" && e.state !== "deleted") {
    const n = e.credential;
    o.walletPubkey = n.wallet_pubkey, o.relayCount = n.relays?.length;
  }
  return o;
}
async function Ut() {
  const t = Qn(), e = await t.listConnections({ relayUrls: R, store: w });
  return {
    vault: t,
    connections: e.connections.filter((o) => o.record.state !== "deleted"),
    rollbackWarnings: e.rollbackWarnings,
    unreadable: e.unreadable,
    truncated: e.truncated,
    quorumMet: e.quorumMet
  };
}
async function Rn(t) {
  const { vault: e, connections: o } = await Ut(), n = o.find((r) => r.record.connection_id === t);
  if (!n) throw new Error("That connection no longer exists.");
  return { vault: e, connection: n };
}
let Re = null, te = null;
function go(t) {
  self.postMessage({ notify: "nip46-auth-url", url: t });
}
function tt() {
  if (!Re) throw new Error("No remote signer is connected.");
  return Re;
}
function Tt() {
  te && (te.abort.abort(), S(te.clientSecretKey), te = null);
}
function di(t) {
  const e = t.buildLogoutEvent();
  t.close(), e && t.publishCourtesy(e);
}
function mo(t, e) {
  Re && di(Re.client), Re = { client: t, userPubkey: e };
}
async function Pu(t, e, o = "") {
  if (u.signerOnly && !$l.has(t))
    throw new Error("This session can only sign. Sign in at your own BitLogin page for anything else.");
  switch (N && t !== "configure" && Date.now() - En > Q.idleSec * 1e3 && Ze(), bu.has(t) || (En = Date.now()), t) {
    // ---- The optional lock (lock.ts) ----
    case "lockStatus":
      return Oe();
    // Turn it on, or change the PIN. Only with a full session unlocked: the key that is sealed is the one in hand.
    case "lockEnable": {
      if (A(), await me(w) && !N) throw new Error("Unlock first.");
      const n = await Ll(w, e.pin, N ?? void 0);
      return await wo(N, n), N && S(N), N = n, await Ee(), Oe();
    }
    case "lockSetDevice": {
      if (A(), !N) throw new Error("Turn the lock on first.");
      const n = e, r = x(String(n.prfOutput));
      try {
        await Ol(w, N, String(n.credentialId), r);
      } finally {
        S(r);
      }
      return Oe();
    }
    case "lockRemoveDevice": {
      if (A(), !N) throw new Error("Turn the lock on first.");
      return await Dl(w), Oe();
    }
    case "lockDisable": {
      if (A(), await me(w) && !N) throw new Error("Unlock first.");
      return await wo(N, null), await lt(w), N && S(N), N = null, await Ee(), Oe();
    }
    case "lockNow": {
      if (!N) throw new Error("The lock is not on.");
      return Ze(), Oe();
    }
    // Open it, with the PIN or with the device. A wrong try is counted; one too many removes the lock and the
    // cached session with it, and the user signs in again the ordinary way.
    case "lockOpen": {
      const n = e;
      let r;
      if (typeof n.prfOutput == "string") {
        const s = x(n.prfOutput);
        try {
          r = await Ul(w, s);
        } finally {
          S(s);
        }
      } else
        r = await xl(w, n.pin);
      if (r.ok) {
        N && S(N), N = r.lockKey, En = Date.now();
        const s = await Pn();
        if (s.restored) return { ok: !0, left: Q.tries, removed: !1, ...s };
        if (await Ot(w) === "none" && (await H(w)).length > 0) return { ok: !0, left: Q.tries, removed: !1, restored: !1 };
        await lt(w), Ze(), r = { ok: !1, left: 0, removed: !0 };
      }
      return r.removed && (Ze(), await zn(), await so(w), await Xe(w)), { ok: !1, left: r.left, removed: r.removed, restored: !1 };
    }
    // ---- Signer hand-off (docs/sign-in-window.md) ----
    // The receiving side, first: a throwaway key for the hand-off to be sealed to.
    case "handoffBegin":
      return be && S(be), be = Qe(), { recipientPublicKey: P(be) };
    // The sending side: this worker has the session, and seals the everyday
    // key (only that) to the receiving worker's throwaway key.
    case "handoffExport": {
      const { everydayPrivateKey: n } = A(), r = Qe(), s = e;
      try {
        return Bl(n, s.recipientPublicKey, r, s.app, {
          ...s.site !== void 0 ? { site: s.site } : {},
          // Only a site that declared nothing is told who they are. An application is held to what it asked,
          // though the window may have read the profile to show the user which account this is.
          ...u.profile && !s.app ? { profile: u.profile } : {},
          ...s.remember === !0 ? { remember: !0 } : {},
          ...s.family !== void 0 ? { family: s.family } : {},
          ...s.more !== void 0 ? { more: s.more } : {},
          // With the lock on, nothing is kept for any site: a key at rest in a site's storage would be a key
          // the lock does not cover. Every site is allowed for the visit, and asks at the sign-in address again.
          ...N ? { visitOnly: !0 } : {},
          // When it was allowed, by this worker's clock, and where the user writes: what a signer needs to
          // find out later whether the site was taken back (docs/take-back.md).
          at: Date.now() / 1e3,
          relays: u.relays
        });
      } finally {
        S(r);
      }
    }
    // The receiving side, last: open it with the throwaway key, which is
    // then gone. What results is a signer-only session, in memory. It is
    // never written to the session cache or the public record.
    // ---- What the embedded signer remembers for a site (signerGrant.ts) ----
    // Keep this hand-off for the site that asked, so the user is not asked again on its next page load. Only a
    // session that arrived by a hand-off is ever kept this way: a full session is never written as a grant.
    case "signerKeep": {
      const { everydayPrivateKey: n } = A();
      if (!u.signerOnly) throw new Error("Only a signer-only session can be remembered for a site.");
      const r = e, s = Date.now() / 1e3;
      if (!u.remember) return { kept: !1 };
      if (u.app && u.app.site !== r.site || u.site && u.site !== r.site) throw new Error("This hand-off was for another site.");
      if (u.family) {
        if (!Ue(r.site, u.family)) throw new Error("This hand-off was for another site.");
        await Nt(w, r.site);
      }
      return {
        kept: await mn(
          w,
          {
            site: u.family ?? r.site,
            everydayPrivateKey: n,
            until: r.until,
            ...r.name ? { name: r.name } : {},
            ...u.profile ? { profile: u.profile } : {},
            at: u.grantAt ?? Math.floor(s),
            ...u.relays.length ? { relays: u.relays } : {},
            signed: [],
            ...!u.app && !u.family && u.more.length ? { more: ve(u.more) } : {},
            ...u.app ? { permissions: u.app.permissions, signedSensitive: [] } : {}
          },
          s
        )
      };
    }
    // The site's page was loaded again: what was kept for that site, if it is still in date, becomes a
    // signer-only session. It touches nothing a full session uses.
    case "signerRestore": {
      const n = e, r = await Ct(w, n.site, Date.now() / 1e3), s = !r && n.family !== void 0 && ne(n.family) && Ue(n.site, n.family) ? n.family : null, i = r ?? (s ? await Ct(w, s, Date.now() / 1e3) : null);
      return !i || s && i.site !== s ? { restored: !1 } : (j(), u.signer = new ye(i.everydayPrivateKey), u.everydayPrivateKey = i.everydayPrivateKey, u.signerOnly = !0, u.app = i.permissions ? { site: i.site, permissions: i.permissions } : null, u.site = s ? n.site : i.site, u.family = s, u.profile = i.profile ?? null, u.remember = !0, u.grantAt = gn(i), u.relays = i.relays ?? [], u.more = s ? [] : i.more ?? [], {
        restored: !0,
        everydayPublicKey: u.signer.getPublicKey(),
        until: i.until,
        ...i.name ? { name: i.name } : {},
        ...i.profile ? { profile: i.profile } : {},
        signed: i.signed,
        ...i.signedPass ? { signedPass: i.signedPass } : {},
        check: $r(Date.now() / 1e3, gn(i), i.checkedAt ?? 0),
        ...s ? { family: s } : {},
        ...u.more.length ? { more: ve(u.more) } : {},
        ...i.permissions ? { permissions: i.permissions, signedSensitive: i.signedSensitive ?? [] } : {}
      });
    }
    // Count a signature against the site, where reloading the page can't lose the count.
    case "signerTouch": {
      const { everydayPrivateKey: n } = A();
      if (!u.signerOnly) throw new Error("Only a signer-only session is counted for a site.");
      const r = e, s = Date.now() / 1e3, i = await Ct(w, u.family && Ue(r.site, u.family) ? u.family : r.site, s);
      return i && P(i.everydayPrivateKey) === P(n) && await mn(
        w,
        { ...i, signed: Array.isArray(r.signed) ? r.signed : [], ...Array.isArray(r.signedPass) ? { signedPass: r.signedPass } : {}, ...i.permissions ? { signedSensitive: Array.isArray(r.signedSensitive) ? r.signedSensitive : [] } : {} },
        s
      ), {};
    }
    // Signing out of a site that was allowed as one of a family signs out of the family: otherwise its next page
    // load would take the family's grant up again, and the sign-out would not have happened (SF6).
    case "signerForget": {
      const n = e.site;
      await Nt(w, n), u.family && Ue(n, u.family) && await Nt(w, u.family), await w.delete(Sn + n).catch(() => {
      });
      for (const r of ["save", "follow", "seal", "unwrap", "reach", "score", "achieve"])
        Gn.delete(`${Jn}${r}:${n}`), await w.delete(`${Jn}${r}:${n}`).catch(() => {
        });
      return {};
    }
    // The receipts BitLogin's own page handed a site's signer (docs/paying.md): the person's, for that site's own
    // listings. Kept beside the site's grant, so a page loaded again still knows what its visitor holds (owner,
    // 2026-11-21). They are signed notes and no secret; each is checked again where it is used. A signer-only
    // session only, and only for the site its hand-off was sealed for.
    case "signerHold":
    case "signerHeld": {
      const { signer: n } = A();
      if (!u.signerOnly) throw new Error("Only a site's signer holds receipts for it.");
      const r = Te(e.site);
      if (!r) throw new Error("That is not a site.");
      if (u.app && u.app.site !== r || u.site && u.site !== r) throw new Error("That is another site's.");
      const s = n.getPublicKey();
      if (t === "signerHold") {
        const i = e.receipts, a = (Array.isArray(i) ? i.slice(0, Gr) : []).filter((c) => !!c && typeof c == "object" && c.kind === 30078 && typeof c.content == "string" && c.content.length <= 8e3 && C(c));
        return await w.set(Sn + r, JSON.stringify({ pubkey: s, receipts: a })), {};
      }
      try {
        const i = JSON.parse(await w.get(Sn + r) ?? "null");
        return { receipts: i?.pubkey === s && Array.isArray(i.receipts) ? i.receipts.slice(0, Gr) : [] };
      } catch {
        return { receipts: [] };
      }
    }
    case "handoffAccept": {
      if (!be) throw new Error("No hand-off was begun here.");
      const n = be;
      be = null;
      let r;
      try {
        r = jl(e, n);
      } finally {
        S(n);
      }
      return j(), u.signer = new ye(r.key), u.everydayPrivateKey = r.key, u.signerOnly = !0, u.app = r.app, u.site = r.site, u.profile = r.profile, u.remember = r.remember, u.grantAt = r.at, u.relays = r.relays, u.family = r.family, u.more = r.more, {
        everydayPublicKey: u.signer.getPublicKey(),
        ...r.app ? { app: r.app } : {},
        ...r.site ? { site: r.site } : {},
        ...r.profile ? { profile: r.profile } : {},
        ...r.remember ? { remember: !0 } : {},
        ...r.family ? { family: r.family } : {},
        ...r.more.length ? { more: r.more } : {}
      };
    }
    // ---- Who someone is, to a world they allowed (§SW16).
    // A full session, at the sign-in address: the person's own profile, asked of relays and believed only as
    // far as its signature goes. It is sealed into the next hand-off. A session that arrived by a hand-off
    // never asks a relay anything: this action is not on its list.
    case "loadProfile": {
      const { signer: n } = A(), r = n.getPublicKey(), s = e.profile !== !1, i = [.../* @__PURE__ */ new Set([...D, ...R])].slice(0, 8);
      if (i.length === 0) return {};
      const a = B(i);
      try {
        const [c, l] = await Promise.all([
          s ? a.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 4e3) : Promise.resolve(null),
          a.queryQuorum({ kinds: [Me], authors: [r], limit: 2 }, 4e3)
        ]);
        if (u.signer !== n) return {};
        u.profile = c ? io(c.outcomes.flatMap((d) => d.events), r) : null, u.profile && !u.signerOnly && await Ke(w, Tl(await H(w), r, u.profile)), u.relays = Ie(l.outcomes.flatMap((d) => d.events), r);
      } finally {
        a.closeAll();
      }
      return { ...u.profile ? { profile: u.profile } : {}, relays: u.relays };
    }
    // ---- Taking a site back (docs/take-back.md) ----
    // At the sign-in address, with a full session: publish the record that says a site, or every site, is taken
    // back as of now. It carries everything an earlier record said, from the relays and from this browser's own
    // copy, so a record built here can never give a site back.
    case "takeBack": {
      const { signer: n } = A(), r = e, s = n.getPublicKey(), i = Date.now() / 1e3, a = r.all === !0 ? { all: !0 } : { site: String(r.site ?? "") }, c = B([.../* @__PURE__ */ new Set([...D, ...R])].slice(0, 8));
      let l;
      try {
        l = Ie((await c.queryQuorum({ kinds: [Me], authors: [s], limit: 2 }, 4e3)).outcomes.flatMap((f) => f.events), s);
      } finally {
        c.closeAll();
      }
      const d = [.../* @__PURE__ */ new Set([...l, ...R])].slice(0, 16), y = B(d);
      try {
        const f = await y.queryQuorum({ kinds: [fn], authors: [s], "#d": [yn], limit: 2 }, 5e3);
        if (f.respondedCount === 0) return { ok: !1, accepted: 0, of: d.length };
        const p = qr(f.outcomes.flatMap((_) => _.events), s, i), g = p ? po(n, p.content) : null, v = await ku(s), b = Ti(Mi(g ?? Nn, v, i), a, i), h = n.signEvent({
          kind: fn,
          // Later than the one it replaces, whatever the two clocks say.
          created_at: Math.max(Math.floor(i), (p?.created_at ?? 0) + 1),
          tags: [["d", yn]],
          content: n.nip44Encrypt(s, Fr(b))
        }), k = $(await y.publishAll(h, 6e3)), m = k >= Math.min(2, d.length);
        return m && await w.set(ci + s, Fr(b)).catch(() => {
        }), { ok: m, accepted: k, of: d.length };
      } finally {
        y.closeAll();
      }
    }
    // In the embedded signer, for a kept grant: ask the user's relays whether this site was taken back. Asked at
    // most once a day. It can end the grant or leave it be, and nothing else.
    case "signerCheck": {
      const { signer: n } = A();
      if (!u.signerOnly || !u.site) return { state: "ok" };
      const r = u.family ?? u.site, s = Date.now() / 1e3, i = await Ct(w, r, s);
      if (!i) return { state: "ok" };
      const a = n.getPublicKey(), c = gn(i), l = $r(s, c, i.checkedAt ?? 0);
      if (l === "fresh") return { state: "ok" };
      const d = [.../* @__PURE__ */ new Set([...re(i.relays), ...R])].slice(0, 12), y = B(d);
      let f, p;
      try {
        [f, p] = await Promise.all([
          y.queryQuorum({ kinds: [fn], authors: [a], "#d": [yn], limit: 2 }, 5e3),
          y.queryQuorum({ kinds: [Me], authors: [a], limit: 2 }, 5e3)
        ]);
      } finally {
        y.closeAll();
      }
      if (u.signer !== n) return { state: "ok" };
      const g = qr(f.outcomes.flatMap((k) => k.events), a, s), v = g ? po(n, g.content) : null;
      if (v && Ii(v, r, c))
        return await Nt(w, r), j(), { state: "ended" };
      if (!Li({
        asked: d.length,
        answered: f.respondedCount,
        seenAt: i.seenAt ?? 0,
        newestAt: g ? g.created_at : null,
        readable: v !== null
      })) return { state: l === "overdue" ? "stale" : "ok" };
      const h = Ie(p.outcomes.flatMap((k) => k.events), a);
      return await mn(
        w,
        {
          ...i,
          checkedAt: Math.floor(s),
          seenAt: Math.max(i.seenAt ?? 0, v && g ? g.created_at : 0),
          ...h.length ? { relays: h } : {}
        },
        s
      ), h.length && (u.relays = h), { state: "ok" };
    }
    // A room pass (NSWP kind 27300) for the site this session serves, and for no other. The site, the time, how
    // long it lasts and the profile are all this worker's own: what is asked for is a session public key. Not
    // for an application: an application is held to the set the user read, and a pass is not in one.
    case "roomPass": {
      const { signer: n } = A();
      if (!u.signerOnly || u.app || !u.site) throw new Error("refused");
      const r = Al({
        session: e.session,
        site: u.site,
        identity: n.getPublicKey(),
        nowSeconds: Date.now() / 1e3,
        profile: u.profile
      });
      if (!r) throw new Error("refused");
      return n.signEvent(r);
    }
    // ---- What a world keeps for its visitor (NSWP-12; embedded/saves.ts). The world is never taken from what is
    // asked: it is the site this session serves, as the browser gave it to the signer's page.
    case "worldSave": {
      const { signer: n, everydayPrivateKey: r, site: s } = Z(), i = e, a = Ae(r, n.getPublicKey());
      try {
        const c = oa({ conversationKey: a, world: s, slot: i.slot, data: i.data, nowSeconds: Date.now() / 1e3 });
        if (!c || !await ke("save", s, sa)) throw new Error("refused");
        return n.signEvent(c);
      } finally {
        S(a);
      }
    }
    case "worldFind": {
      const { signer: n, everydayPrivateKey: r, site: s } = Z(), i = Ae(r, n.getPublicKey());
      try {
        const a = ra(i, s, e.slot);
        if (!a) throw new Error("refused");
        return { d: a };
      } finally {
        S(i);
      }
    }
    case "worldOpen": {
      const { signer: n, everydayPrivateKey: r, site: s } = Z(), i = e.event;
      if (!C(i)) throw new Error("refused");
      const a = Ae(r, n.getPublicKey());
      try {
        const c = na(i, { conversationKey: a, pubkey: n.getPublicKey(), world: s });
        if (!c) throw new Error("refused");
        return c;
      } finally {
        S(a);
      }
    }
    // ---- Following from inside a world (NSWP-14; embedded/follows.ts). Only for a world the user let do this, by
    // name, in the window. The world hands over their newest follow list and one change; what is signed is that
    // list with that change and nothing else. A follow list replaces the last, so before a world's word is
    // believed this worker looks at the user's own relays itself: a world that is behind, or that says there is
    // no list where one merely couldn't be reached, is refused.
    case "worldFollow": {
      const { signer: n, site: r } = Z();
      if (!u.more.includes("follows")) throw new Error("refused");
      const s = e, i = n.getPublicKey(), a = s.list === null ? null : Jr(s.list, i);
      if (s.list !== null && !a) throw new Error("refused");
      const c = Eu + i;
      let l = 0;
      try {
        const v = Number(await w.get(c));
        Number.isSafeInteger(v) && v > 0 && (l = v);
      } catch {
      }
      const d = [.../* @__PURE__ */ new Set([...re(u.relays), ...D, ...R])].slice(0, 8);
      let y = 0, f = 0;
      if (d.length) {
        const v = B(d);
        try {
          const b = await v.queryQuorum({ kinds: [Ye], authors: [i], limit: 2 }, 3500);
          y = b.respondedCount;
          for (const h of b.outcomes.flatMap((k) => k.events))
            h.created_at > f && Jr(h, i) && (f = h.created_at);
        } catch {
        } finally {
          v.closeAll();
        }
      }
      if (u.signer !== n || !u.more.includes("follows")) throw new Error("refused");
      if (l = Math.max(l, f), l && await w.set(c, String(l)).catch(() => {
      }), !ea(a, { answered: y, newestAt: f })) throw new Error("refused");
      const p = ta({ list: a, ...s.add !== void 0 ? { add: s.add } : {}, ...s.remove !== void 0 ? { remove: s.remove } : {}, pubkey: i, nowSeconds: Date.now() / 1e3, seen: l });
      if (!p || !await ke("follow", r, pa)) throw new Error("refused");
      const g = n.signEvent(p);
      return await w.set(c, String(Math.max(l, g.created_at))).catch(() => {
      }), g;
    }
    // ---- A score on one of a world's boards (NSWP-15; embedded/scores.ts). For any world its visitor allowed: it
    // is less than a note. The world names its coordinate, a board and a number; the note and the mark that says
    // which site asked are this worker's own.
    case "worldScore": {
      const { signer: n, site: r } = Z(), s = e, i = Zi({ world: s.world, board: s.board, score: s.score, title: s.title, format: s.format, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await ke("score", r, fa)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- An achievement held in a world (NSWP-16; embedded/achievements.ts). As a score: for any world its visitor
    // allowed, built here from three plain fields, and marked with the site this session serves.
    case "worldAchieve": {
      const { signer: n, site: r } = Z(), s = e, i = Xi({ world: s.world, id: s.achievement, title: s.title, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await ke("achieve", r, ya)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- Private messages from inside a world (NSWP-14; embedded/messages.ts). Only for a world the user let do
    // this, by name, in the window. The world names a reader and the words, or hands over a wrap; it is never given
    // a key, and nothing else is encrypted or decrypted for it.
    case "worldSeal": {
      const { signer: n, site: r } = Z();
      if (!u.more.includes("messages")) throw new Error("refused");
      const s = e, i = Yi(n, { to: s.to, text: s.text, nowSeconds: Date.now() / 1e3 });
      if (!i || !await ke("seal", r, da)) throw new Error("refused");
      return i;
    }
    case "worldUnwrap": {
      const { signer: n, site: r } = Z();
      if (!u.more.includes("messages")) throw new Error("refused");
      if (!await ke("unwrap", r, ua, !1)) throw new Error("refused");
      const s = Qi(n, e.event);
      if (!s) throw new Error("refused");
      return { message: s };
    }
    case "worldReach": {
      const { signer: n, site: r } = Z();
      if (!u.more.includes("messages")) throw new Error("refused");
      const s = zi(e.relays, Date.now() / 1e3);
      if (!s || !await ke("reach", r, la)) throw new Error("refused");
      return n.signEvent(s);
    }
    // ---- What an approved application may ask beyond signing (§SW9.5). Refused without a permission set.
    case "appEncrypt": {
      const { signer: n } = A(), r = _n(), s = e, i = n.getPublicKey(), a = r.permissions.sign.some((c) => Gi.includes(c));
      if (!Hi(r.permissions, i, s.peerPublicKey) && !(a && /^[0-9a-f]{64}$/u.test(String(s.peerPublicKey))))
        throw new Error("refused");
      if (typeof s.text != "string" || s.text.length > 1e5) throw new Error("refused");
      return { text: s.scheme === "nip04" ? n.nip04Encrypt(s.peerPublicKey, s.text) : n.nip44Encrypt(s.peerPublicKey, s.text) };
    }
    case "appDecrypt": {
      const { signer: n } = A(), r = _n(), s = e;
      if (!Ji(r.permissions, s.peerPublicKey) || typeof s.text != "string") throw new Error("refused");
      return { text: s.scheme === "nip04" ? n.nip04Decrypt(s.peerPublicKey, s.text) : n.nip44Decrypt(s.peerPublicKey, s.text) };
    }
    case "appDecryptEvent": {
      const { signer: n } = A(), r = _n(), s = e.event;
      if (!C(s)) throw new Error("refused");
      const i = ji(r.permissions, n.getPublicKey(), s), a = s.kind === 4 || /\?iv=[A-Za-z0-9+/=]+$/u.test(s.content);
      for (const c of i)
        try {
          return { text: a ? n.nip04Decrypt(c, s.content) : n.nip44Decrypt(c, s.content) };
        } catch {
        }
      throw new Error("refused");
    }
    case "nip46Connect": {
      const r = Da(e.uri), s = new Yr({
        clientSecretKey: Qe(),
        pointer: r,
        onAuthUrl: go
      });
      try {
        await s.connect();
        const i = await s.getUserPublicKey();
        return mo(s, i), Tt(), { userPubkey: i };
      } catch (i) {
        throw s.close(), i;
      }
    }
    case "nip46NostrconnectStart": {
      const n = e, r = R.slice(0, 2);
      Tt();
      const s = Qe(), i = $e(F(16));
      return te = { clientSecretKey: s, relayUrls: r, secret: i, abort: new AbortController() }, { uri: xa({
        clientPubkey: P(s),
        relayUrls: r,
        secret: i,
        name: n.appName?.trim() || "BitLogin",
        perms: ["sign_event", "nip44_encrypt", "nip44_decrypt", "nip04_encrypt", "nip04_decrypt"]
      }) };
    }
    case "nip46NostrconnectAwait": {
      const n = te;
      if (!n) throw new Error("No signer-connection attempt is in progress.");
      let r;
      try {
        ({ signerPubkey: r } = await qa({
          clientSecretKey: n.clientSecretKey,
          relayUrls: n.relayUrls,
          secret: n.secret,
          timeoutMs: 18e4,
          signal: n.abort.signal
        }));
      } catch (i) {
        throw te === n && Tt(), i;
      }
      if (te !== n) throw new Error("This signer-connection attempt was superseded.");
      te = null;
      const s = new Yr({
        clientSecretKey: n.clientSecretKey,
        pointer: { signerPubkey: r, relayUrls: n.relayUrls },
        onAuthUrl: go
      });
      try {
        const i = await s.getUserPublicKey();
        return mo(s, i), { userPubkey: i };
      } catch (i) {
        throw s.close(), i;
      }
    }
    case "nip46SignEvent": {
      const n = e;
      return tt().client.signEvent({
        kind: n.kind,
        content: n.content,
        tags: n.tags ?? [],
        created_at: n.created_at ?? Math.floor(Date.now() / 1e3)
      });
    }
    case "nip46Nip44Encrypt": {
      const n = e;
      return { ciphertext: await tt().client.nip44Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip44Decrypt": {
      const n = e;
      return { plaintext: await tt().client.nip44Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Nip04Encrypt": {
      const n = e;
      return { ciphertext: await tt().client.nip04Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip04Decrypt": {
      const n = e;
      return { plaintext: await tt().client.nip04Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Disconnect": {
      const n = Re;
      return Re = null, Tt(), n && di(n.client), {};
    }
    case "configure": {
      const n = e;
      return Bn = !!n.vaultRelayUrls?.length, jn = !!n.discoveryRelayUrls?.length, n.vaultRelayUrls?.length && (R = n.vaultRelayUrls), n.discoveryRelayUrls?.length && (D = n.discoveryRelayUrls), fo(It(await Fo(w))), (!Bn || !jn) && Aa(w).then(fo, () => {
      }), {};
    }
    case "register": {
      const n = e, r = n.importKey ? await $c({ nsecOrHex: n.importKey, loginName: n.loginName, password: n.password, vaultRelayUrls: R }) : await ws({ loginName: n.loginName, password: n.password, vaultRelayUrls: R });
      return j(), u.signer = new ye(r.everydayPrivateKey), u.everydayPrivateKey = r.everydayPrivateKey, u.accountId = r.accountId, u.recoveryPublicKey = r.recoveryPublicKey, u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.recoveryEvent, u.everydayKeyDerived = r.everydayKeyDerived, Hn(r.connectionVaultRoot, r.vaultSudoKey), await Ee(), {
        recoveryPhrase: r.recoveryPhrase,
        everydayPublicKey: r.everydayPublicKey,
        recoveryPublicKey: r.recoveryPublicKey,
        accountId: r.accountId,
        imported: r.imported,
        everydayKeyDerived: r.everydayKeyDerived,
        credentialEventId: r.credentialEvent.id,
        recoveryEventId: r.recoveryEvent.id
      };
    }
    case "previewImportKey": {
      const r = vs(e.nsecOrHex), s = P(r), i = { everydayPublicKey: s, npub: ot(s) };
      return r.fill(0), i;
    }
    case "login": {
      const n = e, r = await Wc({
        loginName: n.loginName,
        password: n.password,
        vaultRelayUrls: R,
        store: w,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return j(), u.signer = new ye(r.everydayPrivateKey), u.everydayPrivateKey = r.everydayPrivateKey, u.accountId = r.accountId, u.recoveryPublicKey = r.recoveryPublicKey, u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.recoveryCapsuleEvent, u.everydayKeyDerived = r.everydayKeyDerived, Hn(r.connectionVaultRoot, r.vaultSudoKey), await Ee(), !r.rollbackWarning && !r.relayDisagreementWarning && Zr({
        relayUrls: R,
        credentialEvent: r.credentialEvent,
        recoveryEvent: r.recoveryCapsuleEvent
      }).catch(() => {
      }), {
        everydayPublicKey: r.everydayPublicKey,
        accountId: r.accountId,
        generation: r.generation,
        everydayKeyDerived: r.everydayKeyDerived,
        rollbackWarning: r.rollbackWarning,
        relayDisagreementWarning: r.relayDisagreementWarning
      };
    }
    case "recover": {
      const n = e, r = await Vc({
        phrase: n.phrase,
        vaultRelayUrls: R,
        discoveryRelayUrls: D,
        offlineRecoveryCapsuleEvents: n.offlineExportFile?.recovery_capsule_events
      });
      return ho(r);
    }
    case "previewPhraseRebuild": {
      const r = await Bc({ phrase: e.phrase, vaultRelayUrls: R, discoveryRelayUrls: D });
      return { ...r, npub: ot(r.everydayPublicKey) };
    }
    case "rebuildFromPhrase": {
      const r = await jc({ phrase: e.phrase, vaultRelayUrls: R, discoveryRelayUrls: D });
      return ho(r);
    }
    case "completeRecovery": {
      const n = e;
      if (!u.pendingRecovery) throw new Error("No recovery is in progress in this session.");
      const r = await Jc({
        recovered: u.pendingRecovery,
        newLoginName: n.newLoginName,
        newPassword: n.newPassword,
        vaultRelayUrls: R,
        store: w
      });
      return u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.refreshedRecoveryEvent, u.pendingRecovery.recoveryPrivateKey.fill(0), u.pendingRecovery = null, await Ee(), {
        locatorPublicKey: r.locatorPublicKey,
        credentialEventId: r.credentialEvent.id,
        refreshedRecoveryEventId: r.refreshedRecoveryEvent.id
      };
    }
    case "changePassword": {
      const n = e, r = await Gc({
        loginName: n.loginName,
        oldPassword: n.oldPassword,
        newPassword: n.newPassword,
        vaultRelayUrls: R,
        store: w,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return u.activeCredentialEvent = r.newCredentialEvent, u.recoveryPublicKey = r.recoveryPublicKey, u.activeRecoveryEvent = r.recoveryCapsuleEvent, await Ee(), {
        newLocatorPublicKey: r.newLocatorPublicKey,
        newGeneration: r.newGeneration,
        tombstoneAcknowledgedCount: r.tombstoneAcknowledgedCount,
        deletionAcknowledgedCount: r.deletionAcknowledgedCount
      };
    }
    case "publishProfileAndRelayLists": {
      const n = e, { everydayPrivateKey: r } = A();
      return Ec({
        everydayPrivateKey: r,
        name: n.name,
        about: n.about,
        picture: n.picture,
        generalRelays: n.generalRelays,
        dmRelays: n.dmRelays,
        discoveryRelays: D
      });
    }
    case "getPublicKey": {
      const { signer: n } = A();
      return { publicKey: n.getPublicKey() };
    }
    case "signEvent": {
      const { signer: n } = A(), r = e;
      if (u.signerOnly) {
        if (u.app) {
          const s = aa(u.app.permissions, r, u.app.site, Date.now() / 1e3);
          if (!s) throw new Error("refused");
          return n.signEvent(s);
        }
        if (ca(r.kind) !== "ordinary") throw new Error("refused");
      }
      return n.signEvent({ kind: r.kind, tags: r.tags, content: r.content, created_at: r.created_at });
    }
    case "nip44Encrypt": {
      const { signer: n } = A(), r = e;
      return { ciphertext: n.nip44Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip44Decrypt": {
      const { signer: n } = A(), r = e;
      return { plaintext: n.nip44Decrypt(r.peerPublicKey, r.payload) };
    }
    case "nip04Encrypt": {
      const { signer: n } = A(), r = e;
      return { ciphertext: n.nip04Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip04Decrypt": {
      const { signer: n } = A(), r = e;
      return { plaintext: n.nip04Decrypt(r.peerPublicKey, r.payload) };
    }
    case "exportIdentity": {
      const { everydayPrivateKey: n, signer: r } = A();
      return { nsec: wi(n), npub: ot(r.getPublicKey()) };
    }
    case "buildRecoveryExport": {
      if (A(), !u.recoveryPublicKey || !u.activeRecoveryEvent)
        throw new Error("No recovery capsule is known in this session yet.");
      return vi({
        recoveryPublicKeyHex: u.recoveryPublicKey,
        vaultRelayUrls: R,
        recoveryCapsuleEvents: [u.activeRecoveryEvent],
        relayListEvents: []
      });
    }
    case "repairReplicas": {
      if (!u.activeCredentialEvent || !u.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Zr({
        relayUrls: R,
        credentialEvent: u.activeCredentialEvent,
        recoveryEvent: u.activeRecoveryEvent
      });
    }
    case "checkReplicaHealth": {
      if (!u.activeCredentialEvent || !u.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return xc({
        relayUrls: R,
        credentialEvent: u.activeCredentialEvent,
        recoveryEvent: u.activeRecoveryEvent
      });
    }
    case "getSessionStatus":
      return { unlocked: !!u.signer, everydayPublicKey: u.signer?.getPublicKey(), signerOnly: u.signerOnly };
    // Called once, right after "configure", before the widget renders its welcome
    // screen -- restores whatever persistSession() last cached for this origin, so
    // a page reload doesn't ask for the login name + password again. A missing or
    // corrupt cache is not an error: it just means the widget falls through to its
    // normal welcome screen, exactly like it always has.
    case "restoreSession":
      return !N && await Ot(w) === "locked" ? { restored: !1, locked: !0 } : Pn();
    // Log out: this account is forgotten on this device. Other accounts kept here stay, and so does the lock
    // they are sealed under; with none left, everything goes as it always did.
    case "logout": {
      const n = u.everydayPrivateKey && !u.signerOnly ? P(u.everydayPrivateKey) : "", r = Dt(await H(w), n);
      return n && await ee(w, J(n)), r.length > 0 && n ? (await Ke(w, r), j(), await ee(w), await Xe(w), {}) : (Ze(), await lt(w), await zn(), await so(w), await Xe(w), {});
    }
    // ---- Several accounts on one device (docs/account-switching.md) ----
    // Who is kept here, and which of them is signed in. Public keys and what their own profiles call them.
    case "accountsList": {
      const n = u.everydayPrivateKey && !u.signerOnly ? P(u.everydayPrivateKey) : "";
      return { accounts: (await H(w)).map((r) => ({ ...r, active: r.pubkey === n })) };
    }
    // Switch to a kept account: its own slot is opened, on this device, with no password and no relay. With the
    // lock on and locked, it says so, and nothing changes.
    case "accountsSwitch": {
      if (u.signerOnly) throw new Error("A signer-only session cannot switch accounts.");
      const n = String(e.pubkey ?? ""), r = await H(w);
      if (!r.some((i) => i.pubkey === n)) return { restored: !1 };
      if (!N && await Ot(w, J(n)) === "locked") return { restored: !1, locked: !0 };
      const s = await Pn(J(n));
      return !s.restored || s.everydayPublicKey !== n ? (j(), await ee(w, J(n)), await Ke(w, Dt(r, n)), await ee(w), await Xe(w), { restored: !1 }) : (await Ee(), s);
    }
    // Make room to sign in as another account: nobody is signed in, and everyone kept stays kept.
    case "accountsAdd": {
      if (u.signerOnly) throw new Error("A signer-only session cannot add accounts.");
      return j(), await ee(w), await Xe(w), {};
    }
    // Forget one kept account that is not the one signed in. (For that one: log out.)
    case "accountsRemove": {
      const n = String(e.pubkey ?? ""), r = u.everydayPrivateKey && !u.signerOnly ? P(u.everydayPrivateKey) : "";
      if (n === r) throw new Error("Log out to remove the account that is signed in.");
      return await ee(w, J(n)), await Ke(w, Dt(await H(w), n)), {};
    }
    // ---- Connection Vault (connection-vault.md §12, reveal mode) ----
    // ---- An ecash wallet kept with the account (docs/ecash.md). A full session only: none of these is on the list a
    // handed-over session may ask, so no embedded signer, and so no site, can read a token.
    // ---- A person's files (docs/files.md). A full session only: none of these is on the list a handed-over
    // session may ask, so no embedded signer, and so no site, can read the index or have a permission note signed.
    case "blossomAuth": {
      const { signer: n } = A();
      return { token: au(n, e) };
    }
    case "driveLoad":
    case "driveSave":
    case "blossomServers":
    case "blossomSetServers": {
      const { signer: n } = A(), r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...D, ...R])].slice(0, 8);
      let i = u.relays;
      if (i.length === 0 && s.length) {
        const c = B(s);
        try {
          i = Ie((await c.queryQuorum({ kinds: [Me], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((l) => l.events), r), i.length && (u.relays = i);
        } catch {
          i = [];
        } finally {
          c.closeAll();
        }
      }
      const a = Kn([.../* @__PURE__ */ new Set([...i, ...R, ...t.startsWith("blossom") ? D : []])].slice(0, 16));
      try {
        const c = { signer: n, store: w, relays: a };
        if (t === "driveLoad") return await su(c);
        if (t === "driveSave") return await iu(c, e);
        const l = async () => {
          const h = await a.queryQuorum({ kinds: [rt], authors: [r], limit: 2 }, 4e3);
          if (h.respondedCount === 0) throw new Error("No relay answered for your server list.");
          const k = h.outcomes.flatMap((m) => m.events).filter((m) => m.kind === rt && m.pubkey === r && C(m)).sort((m, _) => _.created_at - m.created_at)[0];
          return k ? ri(k) : [];
        };
        if (t === "blossomSetServers") {
          const h = [...new Set((e.servers ?? []).map(dr).filter(Boolean))].slice(0, ur.servers);
          if (h.length === 0) throw new Error("Name at least one file server, by its https address.");
          const k = n.signEvent({ kind: rt, created_at: Math.floor(Date.now() / 1e3), tags: h.map((m) => ["server", m]), content: "" });
          if ($(await a.publishAll(k, 6e3)) < Math.min(2, a.relayUrls.length)) throw new Error("No relay took your server list. Try again when you are online.");
          return { mine: h };
        }
        if (e.ranked !== !0) return { mine: await l(), ranked: [] };
        const d = De(a.relayUrls), [y, f, p] = await Promise.all([
          l(),
          d.queryQuorum({ kinds: [rt], limit: 500 }, 5e3),
          d.queryQuorum({ kinds: [Ye], authors: [r], limit: 2 }, 4e3)
        ]).finally(() => d.closeAll()), g = p.outcomes.flatMap((h) => h.events).filter((h) => h.pubkey === r && h.kind === Ye && C(h)).sort((h, k) => k.created_at - h.created_at)[0], v = new Set((g?.tags ?? []).filter((h) => h[0] === "p" && typeof h[1] == "string").map((h) => h[1])), b = new Map(f.outcomes.flatMap((h) => h.events).filter((h) => h.pubkey !== r && C(h)).map((h) => [h.id, h]));
        return { mine: y, ranked: cu([...b.values()], v) };
      } finally {
        a.closeAll();
      }
    }
    // ---- Paying, and buying (docs/paying.md). A full session at one of BitLogin's own sign-in addresses only: none
    // of these is on the list a handed-over session may ask, so no embedded signer, and so no site, can have a
    // buyer's permission note signed or read what a person bought.
    // Whom a tip is for: the name and the lightning address in that person's own signed profile. Read-only.
    case "payProfile": {
      A(), _e();
      const n = e.pubkey;
      if (typeof n != "string" || !/^[0-9a-f]{64}$/u.test(n)) throw new Error("That is not an account.");
      const r = [.../* @__PURE__ */ new Set([...u.relays, ...D, ...R])].slice(0, 10);
      if (r.length === 0) return { name: "", address: "", answered: !1 };
      const s = De(r);
      try {
        const i = await s.queryQuorum({ kinds: [0], authors: [n], limit: 2 }, 3500), a = i.outcomes.flatMap((l) => l.events), c = a.filter((l) => l.kind === 0 && l.pubkey === n && C(l)).sort((l, d) => d.created_at - l.created_at)[0];
        return { name: io(a, n)?.name ?? "", address: c ? Bi(c.content, { local: Kt(ae()) }) : "", answered: i.respondedCount > 0 };
      } finally {
        s.closeAll();
      }
    }
    // A listing, by its coordinate, from the relays its service names and the account's own. The page checks it.
    case "payListing": {
      A(), _e();
      const n = e, r = To(n.coordinate);
      if (!r) throw new Error("That is not a listing.");
      const s = Kt(ae()), i = (Array.isArray(n.relays) ? n.relays : []).filter((l) => typeof l == "string" && l.length <= 200 && (/^wss:\/\//u.test(l) || s && /^ws:\/\/(localhost|127\.0\.0\.1)[:/]/u.test(l))).slice(0, 6), a = [.../* @__PURE__ */ new Set([...i, ...u.relays, ...D])].slice(0, 12);
      if (a.length === 0) return { event: null, answered: !1 };
      const c = De(a);
      try {
        const l = await c.queryQuorum({ kinds: [30078], authors: [jr(r)], "#d": [r.slice(71)], limit: 4 }, 5e3);
        return { event: l.outcomes.flatMap((y) => y.events).filter((y) => y.kind === 30078 && y.pubkey === jr(r) && y.tags.some((f) => f[0] === "d" && f[1] === r.slice(71)) && C(y)).sort((y, f) => f.created_at - y.created_at)[0] ?? null, answered: l.respondedCount > 0 };
      } finally {
        c.closeAll();
      }
    }
    // A buyer's permission note (NIP-98) for one request to a selling service BitLogin knows: this address, this
    // method, this body, once. Kind 27235 is signed here and nowhere else, and never for a site.
    case "unlockAuth": {
      const { signer: n } = A();
      _e();
      const r = e;
      let s;
      try {
        s = new URL(String(r.url));
      } catch {
        throw new Error("That is not an address.");
      }
      const i = Vi.some((y) => y.endpoint === s.origin) || Kt(ae()) && Kt(s.origin);
      if (typeof r.url != "string" || r.url.length > 1e3 || s.toString() !== r.url || s.username || s.password || !i) throw new Error("That is not a service BitLogin buys from.");
      if (r.method !== "GET" && r.method !== "POST") throw new Error("That is not something a selling service is asked.");
      const a = typeof r.payload == "string" && /^[0-9a-f]{64}$/u.test(r.payload) ? r.payload : "";
      if (r.method === "POST" && !a) throw new Error("A permission note names what is sent with it.");
      const c = n.signEvent({ kind: 27235, created_at: Math.floor(Date.now() / 1e3), tags: [["u", r.url], ["method", r.method], ["bitunlock:nonce", crypto.randomUUID()], ...a ? [["payload", a]] : []], content: "" }), l = new TextEncoder().encode(JSON.stringify(c));
      let d = "";
      for (const y of l) d += String.fromCharCode(y);
      return { token: `Nostr ${btoa(d)}` };
    }
    // ---- A world owner's lists (embedded/guests.ts). A full session at one of BitLogin's own sign-in addresses
    // only: the page asks the owner every time, and these build nothing a world wrote but the people. Kind 30078 stays
    // on the never list for every site's `sign` and `propose`.
    // The newest of this account's own lists for a world, as relays hold it: so a world can't hand over an old one.
    case "guestListFind": {
      const { signer: n } = A();
      _e();
      const r = e;
      if (!Vr(r.subject) || r.scope !== "user-allow" && r.scope !== "user-deny") throw new Error("That is not a world's list.");
      const s = n.getPublicKey(), i = B([.../* @__PURE__ */ new Set([...u.relays, ...R, ...D])].slice(0, 12));
      try {
        const a = await i.queryQuorum({ kinds: [30078], authors: [s], "#d": [Br(r.scope, r.subject)], limit: 4 }, 5e3), c = a.outcomes.flatMap((f) => f.events), l = Br(r.scope, r.subject), d = Wi(c, { scope: r.scope, subject: r.subject, root: [s] }), y = c.filter((f) => f.pubkey === s && f.kind === 30078 && f.tags.some((p) => p[0] === "d" && p[1] === l) && f.created_at <= Date.now() / 1e3 + 600).sort((f, p) => p.created_at - f.created_at || (f.id < p.id ? -1 : 1));
        return { event: d.ok ? y[0] ?? null : null, answered: a.respondedCount > 0 };
      } finally {
        i.closeAll();
      }
    }
    // Sign this account's list for a world: built here from the world, which list, and who is on it. Nothing else.
    case "guestListSign": {
      const { signer: n } = A();
      _e();
      const r = e, s = typeof r.replaces == "number" && Number.isSafeInteger(r.replaces) && r.replaces <= Date.now() / 1e3 + 600 ? r.replaces : void 0, i = r.scope === "user-allow" || r.scope === "user-deny" ? $i({ scope: r.scope, subject: String(r.subject), people: Array.isArray(r.people) ? r.people : [], createdAt: Math.floor(Date.now() / 1e3), ...s !== void 0 ? { notBefore: s } : {} }) : null;
      if (!i || !Vr(r.subject)) throw new Error("That is not a list this account can keep.");
      return { event: n.signEvent(i) };
    }
    // The receipts kept with the account: in this browser first, then on its relays, each sealed to its own key.
    case "paySettingsLoad":
    case "paySettingsSave":
    case "receiptsLoad":
    case "receiptsKeep": {
      const { signer: n } = A();
      _e();
      const r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...D, ...R])].slice(0, 8);
      let i = u.relays;
      if (i.length === 0 && s.length) {
        const l = De(s);
        try {
          i = Ie((await l.queryQuorum({ kinds: [Me], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((d) => d.events), r), i.length && (u.relays = i);
        } catch {
          i = [];
        } finally {
          l.closeAll();
        }
      }
      const a = [.../* @__PURE__ */ new Set([...i, ...R])].slice(0, 16), c = t === "receiptsLoad" || t === "receiptsKeep" ? De(a) : Kn(a);
      try {
        const l = { signer: n, store: w, relays: c };
        return t === "paySettingsLoad" ? await Xl(l) : t === "paySettingsSave" ? await Zl(l, e) : t === "receiptsLoad" ? await Ql(l) : await Yl(l, e.receipts);
      } finally {
        c.closeAll();
      }
    }
    // The words of their newest profile note, to show what a proposed one would change. Read-only, and theirs.
    case "profileContent": {
      const { signer: n } = A(), r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...u.relays, ...D, ...R])].slice(0, 10);
      if (s.length === 0) return { content: null, answered: !1 };
      const i = B(s);
      try {
        const a = await i.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 3500), c = a.outcomes.flatMap((l) => l.events).filter((l) => l.kind === 0 && l.pubkey === r && C(l)).sort((l, d) => d.created_at - l.created_at)[0];
        return { content: c ? c.content : null, answered: a.respondedCount > 0 };
      } finally {
        i.closeAll();
      }
    }
    // The mints people recommend (NIP-87): read from relays, counted one voice per account, the user's own follows
    // first. It reads public notes and the user's follow list, and writes nothing.
    case "ecashMints": {
      const { signer: n } = A(), r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...D, ...R])].slice(0, 8);
      if (s.length === 0) return { mints: [] };
      const i = De(s);
      try {
        const [a, c] = await Promise.all([
          i.queryQuorum({ kinds: [Hs], "#k": [zs], limit: 500 }, 5e3),
          i.queryQuorum({ kinds: [Ye], authors: [r], limit: 2 }, 4e3)
        ]), l = c.outcomes.flatMap((f) => f.events).filter((f) => f.pubkey === r && f.kind === Ye && C(f)).sort((f, p) => p.created_at - f.created_at)[0], d = new Set((l?.tags ?? []).filter((f) => f[0] === "p" && typeof f[1] == "string").map((f) => f[1])), y = new Map(a.outcomes.flatMap((f) => f.events).filter((f) => C(f)).map((f) => [f.id, f]));
        return { mints: Hl([...y.values()], d) };
      } finally {
        i.closeAll();
      }
    }
    // The browser's own copies, asked of no relay and writing nothing: shown at once, marked as being checked, while
    // the careful read above runs behind them (docs/panel-speed-2026-11-23.md). A full session only, as the loads are.
    case "ecashPeek":
    case "drivePeek":
    case "receiptsPeek": {
      const { signer: n } = A();
      t === "receiptsPeek" && _e();
      const r = { signer: n, store: w };
      return t === "ecashPeek" ? await lu(r) : t === "drivePeek" ? await ou(r) : await zl(r);
    }
    case "ecashLoad":
    case "ecashSetMints":
    case "ecashRoll": {
      const { signer: n } = A(), r = n.getPublicKey(), s = B([.../* @__PURE__ */ new Set([...D, ...R])].slice(0, 8)), i = s.queryQuorum({ kinds: [Me], authors: [r], limit: 2 }, 4e3).then((d) => Ie(d.outcomes.flatMap((y) => y.events), r)).catch(() => []).then((d) => (d.length && u.signer === n && (u.relays = d), d)).finally(() => s.closeAll());
      let a = u.relays;
      if (a.length === 0) a = await i;
      else {
        const d = await Promise.race([i, new Promise((y) => setTimeout(() => y([]), vu))]);
        d.length && (a = d);
      }
      const c = [.../* @__PURE__ */ new Set([...a, ...R])].slice(0, 16), l = Kn(c);
      try {
        const d = { signer: n, store: w, relays: l };
        return t === "ecashLoad" ? await uu(d) : t === "ecashSetMints" ? await du({ ...d, newKey: () => $e(Qe()) }, e.mints) : await yu(d, e, () => self.postMessage({ notify: "ecash-sealed", id: o }));
      } finally {
        l.closeAll();
      }
    }
    case "vaultStatus":
      return u.signer ? u.connectionVaultRoot ? { enabled: !0, vaultPublicKey: Qn().vaultPublicKey } : { enabled: !1, reason: u.vaultKnown ? "no-vault" : "stale-cache" } : { enabled: !1 };
    case "vaultList": {
      const { connections: n, rollbackWarnings: r, unreadable: s, truncated: i, quorumMet: a } = await Ut();
      return { connections: n.map(et), rollbackWarnings: r, unreadable: s, truncated: i, quorumMet: a };
    }
    case "vaultSaveNwc": {
      const n = e, r = An(n.site), s = Qn(), i = ro(n.uri), a = n.label.trim().slice(0, 120) || "Wallet connection", { record: c, event: l } = await s.createConnection({
        connection_type: "nwc",
        tier: "connectable",
        label: a,
        credential: i,
        application_binding: { origin: r, app_pubkey: null }
      });
      if (!(await s.publish({
        event: l,
        connectionId: c.connection_id,
        relayUrls: R,
        store: w
      })).success)
        throw new Error("The connection could not be saved to enough relays. Please try again.");
      const y = await s.decryptEvent(l);
      return et(y);
    }
    case "vaultFindForOrigin": {
      const n = An(e.site), { connections: r } = await Ut(), s = r.find(
        (i) => i.record.connection_type === "nwc" && i.record.state === "active" && i.record.application_binding.origin === n
      );
      return { connection: s ? et(s) : null };
    }
    case "vaultRevealNwc": {
      const n = e, r = An(n.site), { connection: s } = await Rn(n.connectionId);
      if (s.record.connection_type !== "nwc" || s.record.state !== "active")
        throw new Error("That connection is not an active wallet connection.");
      const i = s.record.application_binding.origin;
      if (i !== null && i !== r)
        throw new Error("That connection belongs to a different site.");
      const a = s.record.credential;
      return Ns(a), { uri: sl(a) };
    }
    case "vaultSetBinding": {
      const n = e, { vault: r, connection: s } = await Rn(n.connectionId), i = n.origin === null ? null : ae(), { record: a, event: c } = await r.updateConnection(s, {
        application_binding: { origin: i, app_pubkey: null }
      });
      if (!(await r.publish({
        event: c,
        connectionId: a.connection_id,
        relayUrls: R,
        store: w
      })).success) throw new Error("The change could not reach enough relays. Please try again.");
      const d = await r.decryptEvent(c);
      return et(d);
    }
    case "vaultDelete": {
      const n = e, { vault: r, connection: s } = await Rn(n.connectionId), { record: i, event: a } = await r.deleteConnection(s);
      if (!(await r.publish({
        event: a,
        connectionId: i.connection_id,
        relayUrls: R,
        store: w
      })).success) throw new Error("The deletion could not reach enough relays. Please try again.");
      try {
        const l = r.buildDeletionRequest(s.event.id), d = new T(R);
        await d.publishAll(l), d.closeAll();
      } catch {
      }
      return {};
    }
    case "vaultOfferCheck": {
      const n = e, r = ae(), s = ro(n.uri), { connections: i } = await Ut(), a = i.find(
        (c) => c.record.connection_type === "nwc" && il(c.record.credential, s)
      );
      return a ? a.record.application_binding.origin !== r ? { duplicate: !1 } : { duplicate: !0, connection: et(a) } : { duplicate: !1 };
    }
    default:
      throw new Error(`Unknown worker action: ${t}`);
  }
}
const Su = /* @__PURE__ */ new Set([
  "configure",
  "register",
  "previewImportKey",
  "login",
  "recover",
  "previewPhraseRebuild",
  "rebuildFromPhrase",
  "completeRecovery",
  "changePassword",
  "publishProfileAndRelayLists",
  "getPublicKey",
  "signEvent",
  "nip44Encrypt",
  "nip44Decrypt",
  "nip04Encrypt",
  "nip04Decrypt",
  "exportIdentity",
  "buildRecoveryExport",
  "repairReplicas",
  "checkReplicaHealth",
  "getSessionStatus",
  "restoreSession",
  "logout",
  "handoffBegin",
  "handoffExport",
  "handoffAccept",
  "signerKeep",
  "signerRestore",
  "signerTouch",
  "signerForget",
  "signerHold",
  "signerHeld",
  "appEncrypt",
  "appDecrypt",
  "appDecryptEvent",
  "loadProfile",
  "roomPass",
  "worldSave",
  "worldFind",
  "worldOpen",
  "worldFollow",
  "worldScore",
  "worldAchieve",
  "worldSeal",
  "worldUnwrap",
  "worldReach",
  "takeBack",
  "signerCheck",
  "accountsList",
  "accountsSwitch",
  "accountsAdd",
  "accountsRemove",
  "lockStatus",
  "lockEnable",
  "lockSetDevice",
  "lockRemoveDevice",
  "lockDisable",
  "lockNow",
  "lockOpen",
  "ecashLoad",
  "ecashSetMints",
  "ecashRoll",
  "ecashMints",
  "profileContent",
  "ecashPeek",
  "drivePeek",
  "receiptsPeek",
  "payProfile",
  "payListing",
  "unlockAuth",
  "guestListFind",
  "guestListSign",
  "receiptsLoad",
  "receiptsKeep",
  "paySettingsLoad",
  "paySettingsSave",
  "driveLoad",
  "driveSave",
  "blossomAuth",
  "blossomServers",
  "blossomSetServers",
  "vaultStatus",
  "vaultList",
  "vaultSaveNwc",
  "vaultFindForOrigin",
  "vaultRevealNwc",
  "vaultSetBinding",
  "vaultDelete",
  "vaultOfferCheck",
  "nip46Connect",
  "nip46NostrconnectStart",
  "nip46NostrconnectAwait",
  "nip46SignEvent",
  "nip46Nip44Encrypt",
  "nip46Nip44Decrypt",
  "nip46Nip04Encrypt",
  "nip46Nip04Decrypt",
  "nip46Disconnect"
]);
self.addEventListener("message", (t) => {
  const e = t.data;
  if (!e || typeof e != "object" || typeof e.id != "string") return;
  if (typeof e.action != "string" || !Su.has(e.action)) {
    const i = {
      id: e.id,
      ok: !1,
      error: `Unknown worker action: ${String(e.action)}`,
      errorName: "Error"
    };
    self.postMessage(i);
    return;
  }
  const { id: o, action: n, payload: r } = t.data;
  // The peeks too: they read the browser's own sealed copy and change nothing, and they are what is on screen while
  // the queue is busy asking relays (docs/panel-speed-2026-11-23.md).
  (n.startsWith("nip46") || n === "ecashPeek" || n === "drivePeek" || n === "receiptsPeek" ? (i) => i() : (i) => gu.run(mu[n] ?? null, i))(() => Pu(n, r, o)).then(
    (i) => {
      const a = { id: o, ok: !0, result: i };
      self.postMessage(a);
    },
    (i) => {
      const a = i instanceof Error ? i : new Error(String(i)), c = { id: o, ok: !1, error: a.message, errorName: a.name };
      self.postMessage(c);
    }
  );
});
