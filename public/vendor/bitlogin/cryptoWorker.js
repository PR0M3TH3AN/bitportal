import { K as li, b as ui, c as O, D as go, d as Ct, w as P, f as Dt, g as ct, h as Gn, S as Xt, j as Zt, k as We, l as wt, B as di, m as yi, n as en, o as lt, q as Hn, r as zn, a as et, s as mo, t as fi, u as pi } from "./bitlogin-shared-BgvdwPLe.js";
import { f as _, s as U, v as A, b as De, a as D, i as Be, j as hi, k as vi, l as wi, m as gi, n as mi, o as cn, p as Or, q as bo, t as bi, w as ki, x as Ei, y as Et, z as ko, u as q, A as _i, B as xt, C as Qn, D as Yn, E as Eo, F as Pi, d as M, e as L, G as Xn, H as Si, I as _o, h as Zn, J as Po, K as Ki, c as gt, L as Sn, M as Je } from "./bitlogin-shared-8bKMreA1.js";
import { b as mt, r as Y, c as X, k as Ai, i as Ie, w as Ae, R as Re, T as ln, d as un, n as Dr, t as Ri, m as Ci, N as Kn, e as xr, g as Ur, h as So, j as Ni, l as Ti } from "./bitlogin-shared-Cdz6Y9Lq.js";
import { ab as Ee, ac as er, ad as An, ae as Mi, af as tt, ag as nt, ah as rt, ai as oe, aj as te, ak as Ko, al as Ao, am as ut, an as tr, a2 as dt, y as Ut, z as nr, O as rr, J as qt, ao as ye, $ as Ii, a as yt, k as or, P as Ro, b as Co, ap as Rn, aq as ft, ar as ot, as as No, at as Li, au as Oi, av as To, aw as Mo, ax as qr, ay as Di, az as xi, aA as Ge, aB as Ui, aC as Fr, aD as $r, a9 as qi, U as Fi, A as _t, u as Vr, aE as $i, aF as Vi, aG as Wi, aH as Bi, aI as ji, aJ as Ji, aK as Gi, aL as Hi, aM as zi, aN as Qi, aO as Wr, aP as Yi, aQ as Xi, aR as Zi, aS as ea, aT as ta, aU as na, aV as Io, H as ra, R as oa, aW as sa, aX as ia, aY as aa, aZ as ca, a_ as la, a$ as ua, b0 as da, b1 as Br } from "./bitlogin-shared-csl-dNcj.js";
import { e as sr, a as ir, b as ar } from "./bitlogin-shared-PwbHDYud.js";
function Lo(e) {
  const t = _(e.privateKey);
  return U({
    pubkey: t,
    created_at: e.createdAt,
    kind: li,
    tags: [
      ["e", e.eventIdToDelete],
      ["k", String(e.deletedEventKind)]
    ],
    content: e.reason ?? ""
  }, e.privateKey);
}
function ya() {
  const e = globalThis.WebSocket;
  if (!e)
    throw new Error("No global WebSocket implementation is available in this environment.");
  return e;
}
const Ft = 1e3, fa = 262144;
function pa(e) {
  const t = Math.min(e.limit ?? Ft, Ft);
  return Math.max(50, t * 3);
}
const ha = 2048, va = 1e4, wa = 100;
function ga(e, t) {
  if (e.size >= ha) {
    const o = e.values().next().value;
    o !== void 0 && e.delete(o);
  }
  e.add(t);
}
class tn {
  url;
  ws = null;
  connectPromise = null;
  subs = /* @__PURE__ */ new Map();
  pendingPublishes = /* @__PURE__ */ new Map();
  authPrivateKey;
  connectTimeoutMs;
  authenticated = !1;
  constructor(t, o = {}) {
    if (!mt(t))
      throw new Error("Relay URL must use secure WebSockets, except for an explicit loopback development endpoint.");
    this.url = t, this.authPrivateKey = o.authPrivateKey, this.connectTimeoutMs = o.connectTimeoutMs ?? 8e3;
  }
  async connect() {
    return this.connectPromise ? this.connectPromise : (this.connectPromise = new Promise((t, o) => {
      const n = ya(), r = new n(this.url);
      this.ws = r;
      const s = setTimeout(() => {
        o(new Error(`Timed out connecting to relay ${this.url}`));
      }, this.connectTimeoutMs);
      r.addEventListener("open", () => {
        clearTimeout(s);
        for (const [i, a] of this.subs)
          r.send(JSON.stringify(["REQ", i, a.filter]));
        t();
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
  send(t) {
    if (!this.ws)
      throw new Error("Not connected to relay.");
    this.ws.send(JSON.stringify(t));
  }
  handleMessage(t) {
    if (t.length > fa)
      return;
    let o;
    try {
      o = JSON.parse(t);
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
        if (d - a.liveWindowStart >= va && (a.liveWindowStart = d, a.liveVerifies = 0), a.liveVerifies >= wa || (a.liveVerifies++, !A(i) || !jr(i, a.filter)))
          return;
        ga(a.seenIds, i.id), a.onEvent(i);
        return;
      }
      const l = Math.min(a.filter.limit ?? Ft, Ft);
      if (a.events.length >= l || a.verifyBudget <= 0 || (a.verifyBudget--, !A(i) || !jr(i, a.filter)))
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
  async respondToAuthChallenge(t) {
    if (!this.authPrivateKey)
      return;
    const o = _(this.authPrivateKey), n = U({
      pubkey: o,
      created_at: Math.floor(Date.now() / 1e3),
      kind: ui,
      tags: [
        ["relay", this.url],
        ["challenge", t]
      ],
      content: ""
    }, this.authPrivateKey);
    this.authenticated = !0, this.send(["AUTH", n]);
  }
  isAuthenticated() {
    return this.authenticated;
  }
  async publish(t, o = 8e3) {
    return await this.connect(), new Promise((n) => {
      const r = setTimeout(() => {
        this.pendingPublishes.delete(t.id), n({ ok: !1, message: "timeout: no OK received from relay" });
      }, o);
      this.pendingPublishes.set(t.id, (s) => {
        clearTimeout(r), n(s);
      }), this.send(["EVENT", t]);
    });
  }
  /**
   * Opens a subscription that stays live past EOSE: every verified,
   * filter-matching event is delivered to `onEvent` as it arrives, until the
   * returned handle is closed. Survives socket drops -- connect() re-issues
   * REQ for all open subscriptions on reopen -- though events published while
   * the socket was down are only seen if the relay replays them on the new REQ.
   */
  async subscribeLive(t, o) {
    await this.connect();
    const n = De(D(8));
    return this.subs.set(n, {
      events: [],
      seenIds: /* @__PURE__ */ new Set(),
      verifyBudget: Number.POSITIVE_INFINITY,
      liveWindowStart: Date.now(),
      liveVerifies: 0,
      filter: t,
      onEose: () => {
      },
      onEvent: o
    }), this.send(["REQ", n, t]), {
      close: () => {
        if (this.subs.delete(n))
          try {
            this.send(["CLOSE", n]);
          } catch {
          }
      }
    };
  }
  async queryOnce(t, o = 8e3) {
    await this.connect();
    const n = De(D(8));
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
        verifyBudget: pa(t),
        liveWindowStart: 0,
        liveVerifies: 0,
        filter: t,
        onEose: () => a()
      }), this.send(["REQ", n, t]);
    });
  }
}
function jr(e, t) {
  if (t.ids && !t.ids.some((o) => e.id.startsWith(o)) || t.authors && !t.authors.some((o) => e.pubkey.startsWith(o)) || t.kinds && !t.kinds.includes(e.kind) || t.since !== void 0 && e.created_at < t.since || t.until !== void 0 && e.created_at > t.until)
    return !1;
  for (const [o, n] of Object.entries(t)) {
    if (!o.startsWith("#") || !Array.isArray(n))
      continue;
    const r = o.slice(1), s = n;
    if (!e.tags.some((i) => i[0] === r && s.some((a) => a === (i[1] ?? ""))))
      return !1;
  }
  return !0;
}
const Jr = "Not waited for: it didn't answer a moment ago.";
class C {
  connections = /* @__PURE__ */ new Map();
  kept;
  notWaitedFor;
  heard;
  constructor(t, o = {}) {
    this.kept = !!o.connectionFor, this.notWaitedFor = o.notWaitedFor ?? (() => !1), this.heard = o.heard ?? (() => {
    });
    for (const n of new Set(t))
      this.connections.set(n, o.connectionFor ? o.connectionFor(n) : new tn(n, o));
  }
  /** The relays waited for this time, and the ones not: those that failed a moment ago, unless that is every one. */
  split() {
    const t = [...this.connections.entries()], o = t.filter(([n]) => this.notWaitedFor(n));
    return o.length === t.length ? { waited: t, skipped: [] } : { waited: t.filter(([n]) => !this.notWaitedFor(n)), skipped: o };
  }
  /** A record sent to a relay not waited for: it has the copy when it comes back, and nothing waits on it. */
  sendUnwaited(t, o, n) {
    for (const [r, s] of t)
      s.publish(o, n).then((i) => this.heard(r, !0), () => this.heard(r, !1));
    return t.map(([r]) => ({ relayUrl: r, result: { ok: !1, message: Jr } }));
  }
  get relayUrls() {
    return [...this.connections.keys()];
  }
  /** Queries every configured relay and waits for a quorum of responses (or all timeouts) before returning (§16.2). */
  async queryQuorum(t, o = 8e3) {
    const { waited: n, skipped: r } = this.split(), i = [...await Promise.all(n.map(async ([l, d]) => {
      try {
        const y = await d.queryOnce(t, o);
        return this.heard(l, !0), { relayUrl: l, events: y, responded: !0 };
      } catch (y) {
        return this.heard(l, !1), { relayUrl: l, events: [], responded: !1, error: y.message };
      }
    })), ...r.map(([l]) => ({ relayUrl: l, events: [], responded: !1, error: Jr }))], a = i.filter((l) => l.responded).length, c = i.length;
    return {
      outcomes: i,
      quorumMet: a >= Math.ceil(c / 2),
      respondedCount: a,
      totalCount: c
    };
  }
  /** Publishes an event to every configured relay, best-effort (§15.6, §24.4). */
  async publishAll(t, o = 8e3) {
    const { waited: n, skipped: r } = this.split(), s = this.sendUnwaited(r, t, o);
    return [...await Promise.all(n.map(async ([a, c]) => {
      try {
        const l = await c.publish(t, o);
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
  publishEnough(t, o = 8e3, n = 2, r = 1500) {
    const { waited: s, skipped: i } = this.split(), a = this.sendUnwaited(i, t, o);
    return new Promise((c) => {
      const l = /* @__PURE__ */ new Map();
      let d = 0, y = null, f = !1;
      const p = () => {
        f || (f = !0, y && clearTimeout(y), c([...s.map(([m]) => l.get(m) ?? { relayUrl: m, result: { ok: !1, message: "Not waited for." } }), ...a]));
      };
      if (s.length === 0)
        return p();
      for (const [m, g] of s)
        g.publish(t, o).then((b) => (this.heard(m, !b.message.startsWith("timeout")), { relayUrl: m, result: b }), (b) => (this.heard(m, !1), { relayUrl: m, result: { ok: !1, message: b.message } })).then((b) => {
          if (!f) {
            if (l.set(m, b), b.result.ok && d++, l.size === s.length)
              return p();
            d >= Math.min(n, s.length) && !y && (y = setTimeout(p, r));
          }
        });
    });
  }
  closeAll() {
    if (!this.kept)
      for (const t of this.connections.values())
        t.close();
  }
}
function x(e) {
  return e.filter((t) => t.result.ok).length;
}
const bt = null, Oo = [
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
], Do = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  // Added 2026-11-18: relay.nostr.band timed out and nostr-pub.wellorder.net
  // never connected in the same measurement, leaving two working lookups.
  "wss://nos.lol"
], ma = [], ba = /^[0-9a-f]{64}$/u, ka = 64;
function dn(e) {
  return Array.isArray(e) && e.length <= ka && e.every((t) => typeof t == "string" && mt(t)) && new Set(e).size === e.length;
}
function nn(e, t = bt, o = -1) {
  if (!t || !ba.test(t) || /^0{64}$/u.test(t) || !A(e) || e.pubkey !== t || e.kind !== O || Be(e, "d") !== go)
    return null;
  try {
    const n = JSON.parse(e.content);
    if (typeof n != "object" || n === null || Array.isArray(n))
      return null;
    const r = n;
    return !Number.isSafeInteger(r.version) || r.version < 1 || r.version <= o || !dn(r.vaultRelays) || !dn(r.discoveryRelays) || r.deprecated !== void 0 && !dn(r.deprecated) ? null : {
      version: r.version,
      vaultRelays: r.vaultRelays,
      discoveryRelays: r.discoveryRelays,
      ...r.deprecated === void 0 ? {} : { deprecated: r.deprecated }
    };
  } catch {
    return null;
  }
}
function Ea(e) {
  return Math.max(0, e - 1);
}
function Gr(e, t, o) {
  const n = t ? o === "vault" ? t.vaultRelays : t.discoveryRelays : [], r = new Set(t?.deprecated ?? []), s = new Set(e), i = [...new Set(n)].filter((a) => !r.has(a) && !s.has(a)).slice(0, Ea(e.length));
  return [...e, ...i];
}
async function _a(e, t = bt, o = -1, n = 6e3) {
  if (!t || e.length === 0)
    return null;
  const r = new C([...e]);
  let s;
  try {
    s = (await r.queryQuorum({ kinds: [O], authors: [t], "#d": [go], limit: 3 }, n)).outcomes.flatMap((c) => c.events);
  } finally {
    r.closeAll();
  }
  let i = null;
  for (const a of s) {
    const c = nn(a, t, o);
    c && (!i || c.version > i.list.version) && (i = { event: a, list: c });
  }
  return i;
}
const xo = "bitlogin:bootstrap-relays:v1";
async function Uo(e, t = bt) {
  if (!t)
    return null;
  try {
    const o = await e.get(xo);
    return o ? nn(JSON.parse(o), t) : null;
  } catch {
    return null;
  }
}
function Nt(e) {
  return {
    vaultRelays: Gr(Oo, e, "vault"),
    discoveryRelays: Gr(Do, e, "discovery"),
    listVersion: e?.version ?? null
  };
}
async function Pa(e, t = {}) {
  const o = t.maintainerPubkeyHex === void 0 ? bt : t.maintainerPubkeyHex, n = await Uo(e, o);
  if (!o)
    return Nt(null);
  const r = Nt(n), s = n?.version ?? -1;
  try {
    let i = await _a(t.queryRelayUrls ?? [.../* @__PURE__ */ new Set([...r.vaultRelays, ...r.discoveryRelays])], o, s, t.timeoutMs);
    if (!i) {
      const a = await Sa(t.httpsFallbackUrls ?? ma, o, s), c = a ? nn(a, o, s) : null;
      a && c && (i = { event: a, list: c });
    }
    return i ? (await e.set(xo, JSON.stringify(i.event)), Nt(i.list)) : r;
  } catch {
    return r;
  }
}
async function Sa(e, t = bt, o = -1) {
  if (!t)
    return null;
  for (const n of e)
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
      if (A(a) && nn(a, t, o))
        return a;
    } catch {
    }
  return null;
}
const cr = /^[0-9a-f]{64}$/u, Ka = 8, Aa = 4096, Ra = 256, Ca = 512;
class Ce extends Error {
  name = "BunkerUriParseError";
}
class Na extends Error {
  name = "Nip46RequestTimeoutError";
  constructor(t, o) {
    super(`The remote signer did not answer ${t} within ${Math.round(o / 1e3)}s. It may be offline, or waiting for your approval on another device -- check your signer and try again.`);
  }
}
class Ta extends Error {
  name = "Nip46ErrorResponse";
}
function Ma(e) {
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return null;
  }
  const o = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol === "https:" || t.protocol === "http:" && o ? t.toString() : null;
}
function Ia(e) {
  if (e.length > Aa)
    throw new Ce("That bunker URI is unreasonably long.");
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    throw new Ce("That doesn't look like a valid URI.");
  }
  if (t.protocol !== "bunker:")
    throw new Ce("A remote-signer URI must start with bunker://");
  const o = (t.host || t.pathname.replace(/^\/+/u, "")).toLowerCase();
  if (!cr.test(o))
    throw new Ce("The bunker URI does not name a valid signer public key.");
  const n = [
    ...new Set(t.searchParams.getAll("relay").map((s) => s.trim()).filter((s) => s.length > 0 && s.length <= Ca))
  ].slice(0, Ka);
  if (n.length === 0)
    throw new Ce("The bunker URI names no relays -- without at least one relay= parameter there is no way to reach the signer.");
  const r = t.searchParams.get("secret") ?? void 0;
  if (r && r.length > Ra)
    throw new Ce("The bunker URI's secret is unreasonably long.");
  return { signerPubkey: o, relayUrls: n, secret: r || void 0 };
}
function La(e) {
  if (!cr.test(e.clientPubkey))
    throw new Error("Client public key must be 64 hex characters.");
  if (e.relayUrls.length === 0)
    throw new Error("At least one relay is required.");
  if (!e.secret)
    throw new Error("A nostrconnect secret is required.");
  const t = new URLSearchParams();
  for (const o of e.relayUrls)
    t.append("relay", o);
  return t.set("secret", e.secret), e.name && t.set("name", e.name), e.perms?.length && t.set("perms", e.perms.join(",")), `nostrconnect://${e.clientPubkey}?${t.toString()}`;
}
const Oa = 12e4;
class Hr {
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
  constructor(t) {
    this.clientSecretKey = t.clientSecretKey, this.clientPubkey = _(t.clientSecretKey), this.pointer = t.pointer, this.conversationKey = Ee(t.clientSecretKey, t.pointer.signerPubkey), this.onAuthUrl = t.onAuthUrl, this.requestTimeoutMs = t.requestTimeoutMs ?? Oa, this.conns = t.pointer.relayUrls.map((o) => new tn(o, { authPrivateKey: t.clientSecretKey }));
  }
  /** The user pubkey this session signs for, once get_public_key has answered. */
  get userPublicKey() {
    return this.userPubkeyKnown;
  }
  async start() {
    if (this.closed)
      throw new Error("This signer connection is closed.");
    return this.startPromise || (this.startPromise = (async () => {
      const t = {
        kinds: [Ct],
        authors: [this.pointer.signerPubkey],
        "#p": [this.clientPubkey]
      }, o = await Promise.allSettled(this.conns.map((n) => n.subscribeLive(t, (r) => this.handleResponse(r))));
      if (this.subs = o.filter((n) => n.status === "fulfilled").map((n) => n.value), this.subs.length === 0)
        throw this.startPromise = null, new Error("Could not reach any of the signer's relays.");
    })()), this.startPromise;
  }
  handleResponse(t) {
    if (t.pubkey !== this.pointer.signerPubkey)
      return;
    let o;
    try {
      o = JSON.parse(er(this.conversationKey, t.content));
    } catch {
      return;
    }
    if (typeof o.id != "string")
      return;
    const n = this.pending.get(o.id);
    if (n) {
      if (o.result === "auth_url") {
        if (!n.authUrlSeen && typeof o.error == "string" && o.error) {
          const r = Ma(o.error);
          r && (n.authUrlSeen = !0, this.onAuthUrl?.(r));
        }
        return;
      }
      if (this.pending.delete(o.id), clearTimeout(n.timer), typeof o.error == "string" && o.error) {
        n.reject(new Ta(o.error));
        return;
      }
      if (typeof o.result != "string") {
        n.reject(new Error("The signer returned a malformed response."));
        return;
      }
      n.resolve(o.result);
    }
  }
  async rpc(t, o) {
    await this.start();
    const n = De(D(8)), r = An(this.conversationKey, JSON.stringify({ id: n, method: t, params: o })), s = [["p", this.pointer.signerPubkey]], i = U({
      pubkey: this.clientPubkey,
      created_at: Math.floor(Date.now() / 1e3),
      kind: Ct,
      tags: s,
      content: r
    }, this.clientSecretKey), a = new Promise((d, y) => {
      const f = setTimeout(() => {
        this.pending.delete(n), y(new Na(t, this.requestTimeoutMs));
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
    const t = (await this.rpc("get_public_key", [])).trim().toLowerCase();
    if (!cr.test(t))
      throw new Error("The signer returned an invalid public key.");
    return this.userPubkeyKnown = t, t;
  }
  async signEvent(t) {
    const o = this.userPubkeyKnown ? { ...t, pubkey: this.userPubkeyKnown } : t, n = await this.rpc("sign_event", [JSON.stringify(o)]);
    let r;
    try {
      r = JSON.parse(n);
    } catch {
      throw new Error("The signer returned a malformed signed event.");
    }
    if (!A(r))
      throw new Error("The signer returned an event that does not verify.");
    if (this.userPubkeyKnown && r.pubkey !== this.userPubkeyKnown)
      throw new Error("The signer returned an event signed by a different identity.");
    if (r.kind !== t.kind || r.content !== t.content || r.created_at !== t.created_at || JSON.stringify(r.tags) !== JSON.stringify(t.tags))
      throw new Error("The signer returned a different event than the one requested.");
    return r;
  }
  async nip44Encrypt(t, o) {
    return this.rpc("nip44_encrypt", [t, o]);
  }
  async nip44Decrypt(t, o) {
    return this.rpc("nip44_decrypt", [t, o]);
  }
  async nip04Encrypt(t, o) {
    return this.rpc("nip04_encrypt", [t, o]);
  }
  async nip04Decrypt(t, o) {
    return this.rpc("nip04_decrypt", [t, o]);
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
      const t = De(D(8)), o = An(this.conversationKey, JSON.stringify({ id: t, method: "logout", params: [] }));
      return U({
        pubkey: this.clientPubkey,
        created_at: Math.floor(Date.now() / 1e3),
        kind: Ct,
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
  async publishCourtesy(t, o = 2e3) {
    try {
      await Promise.race([
        Promise.allSettled(this.conns.map((n) => n.publish(t))),
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
    for (const t of this.subs)
      t.close();
    this.subs = [];
    for (const t of this.conns)
      t.close();
    for (const [, t] of this.pending)
      clearTimeout(t.timer), t.reject(new Error("The signer connection was closed."));
    this.pending.clear(), P(this.clientSecretKey), P(this.conversationKey);
  }
}
async function Da(e) {
  const t = _(e.clientSecretKey), o = e.timeoutMs, n = e.relayUrls.map((s) => new tn(s, { authPrivateKey: e.clientSecretKey })), r = () => {
    for (const s of n)
      s.close();
  };
  return new Promise((s, i) => {
    let a = !1;
    const c = () => l(new Error("The signer-connection attempt was cancelled.")), l = (p) => {
      a || (a = !0, clearTimeout(d), e.signal?.removeEventListener("abort", c), r(), p instanceof Error ? i(p) : s(p));
    }, d = setTimeout(() => l(new Error(`No signer connected within ${Math.round(o / 1e3)}s. Scan or paste the connection code in your signer app, then try again.`)), o);
    if (e.signal?.aborted) {
      c();
      return;
    }
    e.signal?.addEventListener("abort", c, { once: !0 });
    const y = { kinds: [Ct], "#p": [t] }, f = (p) => {
      let m, g = null;
      try {
        g = Ee(e.clientSecretKey, p.pubkey), m = JSON.parse(er(g, p.content));
      } catch {
        return;
      } finally {
        g && P(g);
      }
      m.result === e.secret && l({ signerPubkey: p.pubkey });
    };
    Promise.allSettled(n.map((p) => p.subscribeLive(y, f))).then((p) => {
      p.some((m) => m.status === "fulfilled") || l(new Error("Could not reach any relay to listen for the signer."));
    });
  });
}
function lr() {
  const e = globalThis.crypto;
  if (!e || !e.subtle)
    throw new Error("WebCrypto SubtleCrypto is not available in this environment.");
  return e;
}
async function qo(e) {
  if (e.length !== 32)
    throw new Error("AES-256-GCM key must be exactly 32 bytes.");
  return lr().subtle.importKey("raw", e, "AES-GCM", !1, ["encrypt", "decrypt"]);
}
async function Fo(e, t, o) {
  const n = hi(), r = await qo(e), s = await lr().subtle.encrypt({ name: "AES-GCM", iv: n, additionalData: o, tagLength: 128 }, r, t);
  return { nonce: n, ciphertext: new Uint8Array(s) };
}
async function $o(e, t, o, n) {
  const r = await qo(e);
  try {
    const s = await lr().subtle.decrypt({ name: "AES-GCM", iv: t, additionalData: n, tagLength: 128 }, r, o);
    return new Uint8Array(s);
  } catch {
    throw new Error("AES-256-GCM authentication failed: capsule is corrupted, tampered, or the wrong key was used.");
  }
}
const Vo = `abandon
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
function xa(e, t, o, n) {
  gi(e);
  const r = mi({ dkLen: 32, asyncTick: 10 }, n), { c: s, dkLen: i, asyncTick: a } = r;
  if (cn(s), cn(i), cn(a), s < 1)
    throw new Error("iterations (c) should be >= 1");
  const c = Or(t), l = Or(o), d = new Uint8Array(i), y = bo.create(e, c), f = y._cloneInto().update(l);
  return { c: s, dkLen: i, asyncTick: a, DK: d, PRF: y, PRFSalt: f };
}
function Ua(e, t, o, n, r) {
  return e.destroy(), t.destroy(), n && n.destroy(), bi(r), o;
}
async function qa(e, t, o, n) {
  const { c: r, dkLen: s, asyncTick: i, DK: a, PRF: c, PRFSalt: l } = xa(e, t, o, n);
  let d;
  const y = new Uint8Array(4), f = vi(y), p = new Uint8Array(c.outputLen);
  for (let m = 1, g = 0; g < s; m++, g += c.outputLen) {
    const b = a.subarray(g, g + c.outputLen);
    f.setInt32(0, m, !1), (d = l._cloneInto(d)).update(y).digestInto(p), b.set(p.subarray(0, b.length)), await wi(r - 1, i, () => {
      c._cloneInto(d).update(p).digestInto(p);
      for (let v = 0; v < b.length; v++)
        b[v] ^= p[v];
    });
  }
  return Ua(c, l, a, d, p);
}
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const Fa = (e) => e[0] === "あいこくしん";
function Wo(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function Bo(e) {
  const t = Wo(e), o = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(o.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: o };
}
function jo(e) {
  Ei(e, 16, 20, 24, 28, 32);
}
const $a = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([ko(e)[0] >> t << t]);
};
function Jo(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), Et.chain(Et.checksum(1, $a), Et.radix2(11, !0), Et.alphabet(e));
}
function Va(e, t) {
  const { words: o } = Bo(e), n = Jo(t).decode(o);
  return jo(n), n;
}
function Wa(e, t) {
  return jo(e), Jo(t).encode(e).join(Fa(t) ? "　" : " ");
}
function Ba(e, t) {
  try {
    Va(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const ja = (e) => Wo("mnemonic" + e);
function Ja(e, t = "") {
  return qa(ki, Bo(e).nfkd, ja(t), { c: 2048, dkLen: 64 });
}
function Ga(e) {
  if (e.length !== 16)
    throw new Error("Recovery phrase entropy must be exactly 128 bits (16 bytes).");
  return Wa(e, Vo);
}
function Go(e) {
  try {
    return Ba(Ho(e), Vo);
  } catch {
    return !1;
  }
}
function Ho(e) {
  return e.trim().normalize("NFKD").toLowerCase().split(/\s+/u).join(" ");
}
async function ur(e) {
  return Ja(Ho(e), "");
}
const Tt = [1024, 2048, 4096], be = 4;
function Ha(e) {
  const t = be + e.length, o = Tt.find((s) => s >= t);
  if (o === void 0)
    throw new Error(`Payload of ${e.length} bytes exceeds the largest padding bucket (${Tt[Tt.length - 1]} bytes minus ${be}-byte length prefix).`);
  const n = new Uint8Array(o);
  return new DataView(n.buffer).setUint32(0, e.length, !1), n.set(e, be), n;
}
function za(e) {
  if (!Tt.includes(e.length))
    throw new Error(`Padded plaintext length ${e.length} does not match a known bucket.`);
  const o = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !1);
  if (o > e.length - be)
    throw new Error("Declared payload length exceeds the padded bucket size.");
  const n = e.slice(be, be + o), r = e.slice(be + o);
  for (const s of r)
    if (s !== 0)
      throw new Error("Padding bytes are not all zero; capsule plaintext is malformed.");
  return n;
}
function Qa(e) {
  const t = _i(e);
  if (t === void 0)
    throw new Error("Value is not JSON-serializable for canonicalization.");
  return t;
}
function Ya(e) {
  return q(Qa(e));
}
const de = 16, Xa = 283;
function Za(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function dr(e) {
  return e << 1 ^ Xa & -(e >> 7);
}
function Le(e, t) {
  let o = 0;
  for (; t > 0; t >>= 1)
    o ^= e & -(t & 1), e = dr(e);
  return o;
}
const Cn = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let o = 0, n = 1; o < 256; o++, n ^= dr(n))
    e[o] = n;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let o = 0; o < 255; o++) {
    let n = e[255 - o];
    n |= n << 8, t[e[o]] = (n ^ n >> 4 ^ n >> 5 ^ n >> 6 ^ n >> 7 ^ 99) & 255;
  }
  return ut(e), t;
})(), ec = /* @__PURE__ */ Cn.map((e, t) => Cn.indexOf(t)), tc = (e) => e << 24 | e >>> 8, yn = (e) => e << 8 | e >>> 24;
function zo(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const o = new Uint32Array(256).map((l, d) => t(e[d])), n = o.map(yn), r = n.map(yn), s = r.map(yn), i = new Uint32Array(256 * 256), a = new Uint32Array(256 * 256), c = new Uint16Array(256 * 256);
  for (let l = 0; l < 256; l++)
    for (let d = 0; d < 256; d++) {
      const y = l * 256 + d;
      i[y] = o[l] ^ n[d], a[y] = r[l] ^ s[d], c[y] = e[l] << 8 | e[d];
    }
  return { sbox: e, sbox2: c, T0: o, T1: n, T2: r, T3: s, T01: i, T23: a };
}
const yr = /* @__PURE__ */ zo(Cn, (e) => Le(e, 3) << 24 | e << 16 | e << 8 | Le(e, 2)), Qo = /* @__PURE__ */ zo(ec, (e) => Le(e, 11) << 24 | Le(e, 13) << 16 | Le(e, 9) << 8 | Le(e, 14)), nc = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, o = 1; t < 16; t++, o = dr(o))
    e[t] = o;
  return e;
})();
function Yo(e) {
  tr(e);
  const t = e.length;
  Za(e);
  const { sbox2: o } = yr, n = [];
  (!tt || !nt(e)) && n.push(e = rt(e));
  const r = te(oe(e)), s = r.length, i = (c) => J(o, c, c, c, c), a = new Uint32Array(t + 28);
  a.set(r);
  for (let c = s; c < a.length; c++) {
    let l = a[c - 1];
    c % s === 0 ? l = i(tc(l)) ^ nc[c / s - 1] : s > 6 && c % s === 4 && (l = i(l)), a[c] = a[c - s] ^ l;
  }
  return ut(...n), a;
}
function rc(e) {
  const t = Yo(e), o = t.slice(), n = t.length, { sbox2: r } = yr, { T0: s, T1: i, T2: a, T3: c } = Qo;
  for (let l = 0; l < n; l += 4)
    for (let d = 0; d < 4; d++)
      o[l + d] = t[n - l - 4 + d];
  ut(t);
  for (let l = 4; l < n - 4; l++) {
    const d = o[l], y = J(r, d, d, d, d);
    o[l] = s[y & 255] ^ i[y >>> 8 & 255] ^ a[y >>> 16 & 255] ^ c[y >>> 24];
  }
  return o;
}
function se(e, t, o, n, r, s) {
  return e[o << 8 & 65280 | n >>> 8 & 255] ^ t[r >>> 8 & 65280 | s >>> 24 & 255];
}
function J(e, t, o, n, r) {
  return e[t & 255 | o & 65280] | e[n >>> 16 & 255 | r >>> 16 & 65280] << 16;
}
function zr(e, t, o, n, r) {
  const { sbox2: s, T01: i, T23: a } = yr;
  let c = 0;
  t ^= e[c++], o ^= e[c++], n ^= e[c++], r ^= e[c++];
  const l = e.length / 4 - 2;
  for (let m = 0; m < l; m++) {
    const g = e[c++] ^ se(i, a, t, o, n, r), b = e[c++] ^ se(i, a, o, n, r, t), v = e[c++] ^ se(i, a, n, r, t, o), k = e[c++] ^ se(i, a, r, t, o, n);
    t = g, o = b, n = v, r = k;
  }
  const d = e[c++] ^ J(s, t, o, n, r), y = e[c++] ^ J(s, o, n, r, t), f = e[c++] ^ J(s, n, r, t, o), p = e[c++] ^ J(s, r, t, o, n);
  return { s0: d, s1: y, s2: f, s3: p };
}
function oc(e, t, o, n, r) {
  const { sbox2: s, T01: i, T23: a } = Qo;
  let c = 0;
  t ^= e[c++], o ^= e[c++], n ^= e[c++], r ^= e[c++];
  const l = e.length / 4 - 2;
  for (let m = 0; m < l; m++) {
    const g = e[c++] ^ se(i, a, t, r, n, o), b = e[c++] ^ se(i, a, o, t, r, n), v = e[c++] ^ se(i, a, n, o, t, r), k = e[c++] ^ se(i, a, r, n, o, t);
    t = g, o = b, n = v, r = k;
  }
  const d = e[c++] ^ J(s, t, r, n, o), y = e[c++] ^ J(s, o, t, r, n), f = e[c++] ^ J(s, n, o, t, r), p = e[c++] ^ J(s, r, n, o, t);
  return { s0: d, s1: y, s2: f, s3: p };
}
function sc(e) {
  if (tr(e), e.length % de !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + de);
}
function ic(e, t, o) {
  tr(e);
  let n = e.length;
  const r = n % de;
  if (!t && r !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (t) {
    let a = de - r;
    a || (a = de), n = n + a;
  }
  o = Ko(n, o), Ao(e, o), (!tt || !nt(e)) && (e = rt(e));
  const s = oe(e);
  te(s);
  const i = oe(o);
  return { b: s, o: i, out: o };
}
function ac(e, t) {
  if (!t)
    return e;
  const o = e.length;
  if (o === 0)
    throw new Error("aes/pkcs7: empty ciphertext not allowed");
  const n = e[o - 1];
  let r = 1;
  r &= n - 1 >>> 31 ^ 1, r &= 16 - n >>> 31 ^ 1;
  for (let s = 0; s < 16; s++) {
    const i = s - n >>> 31, a = (e[o - 1 - s] ^ n) === 0 ? 1 : 0;
    r &= a | i ^ 1;
  }
  if (!r)
    throw new Error("aes/pkcs7: wrong padding");
  return e.subarray(0, o - n);
}
function cc(e) {
  const t = new Uint8Array(16), o = oe(t);
  t.set(e);
  const n = de - e.length;
  for (let r = de - n; r < de; r++)
    t[r] = n;
  return o;
}
const Xo = /* @__PURE__ */ Mi({ blockSize: 16, nonceLength: 16 }, function(t, o, n = {}) {
  const r = !n.disablePadding;
  return {
    encrypt(s, i) {
      const a = Yo(t), { b: c, o: l, out: d } = ic(s, r, i);
      let y = o;
      const f = [a];
      (!tt || !nt(y)) && f.push(y = rt(y));
      const p = oe(y);
      te(p);
      let m = p[0], g = p[1], b = p[2], v = p[3], k = 0;
      for (; k + 4 <= c.length; )
        m ^= c[k + 0], g ^= c[k + 1], b ^= c[k + 2], v ^= c[k + 3], { s0: m, s1: g, s2: b, s3: v } = zr(a, m, g, b, v), l[k++] = m, l[k++] = g, l[k++] = b, l[k++] = v;
      if (r) {
        const h = cc(s.subarray(k * 4));
        te(h), m ^= h[0], g ^= h[1], b ^= h[2], v ^= h[3], { s0: m, s1: g, s2: b, s3: v } = zr(a, m, g, b, v), l[k++] = m, l[k++] = g, l[k++] = b, l[k++] = v;
      }
      return te(l), ut(...f), d;
    },
    decrypt(s, i) {
      sc(s);
      const a = rc(t);
      let c = o;
      const l = [a];
      (!tt || !nt(c)) && l.push(c = rt(c));
      const d = oe(c);
      te(d), i = Ko(s.length, i), Ao(s, i), (!tt || !nt(s)) && l.push(s = rt(s));
      const y = oe(s), f = oe(i);
      te(y);
      let p = d[0], m = d[1], g = d[2], b = d[3];
      for (let v = 0; v + 4 <= y.length; ) {
        const k = p, h = m, E = g, T = b;
        p = y[v + 0], m = y[v + 1], g = y[v + 2], b = y[v + 3];
        const { s0: F, s1: Z, s2: he, s3: sn } = oc(a, p, m, g, b);
        f[v++] = F ^ k, f[v++] = Z ^ h, f[v++] = he ^ E, f[v++] = sn ^ T;
      }
      return te(f), ut(...l), ac(i, r);
    }
  };
});
function Zo(e, t) {
  const o = Yn(new Uint8Array([2]), Eo(t));
  return Pi.getSharedSecret(e, o, !0).slice(1, 33);
}
function lc(e, t, o) {
  return uc(e, t, o, D(16));
}
function uc(e, t, o, n) {
  if (n.length !== 16)
    throw new Error("NIP-04 iv must be exactly 16 bytes.");
  const r = Zo(e, t), s = Xo(r, n).encrypt(q(o));
  return `${xt.encode(s)}?iv=${xt.encode(n)}`;
}
function dc(e, t, o) {
  const n = o.indexOf("?iv=");
  if (n === -1)
    throw new Error('NIP-04 payload is missing its "?iv=" suffix.');
  const r = xt.decode(o.slice(0, n)), s = xt.decode(o.slice(n + 4)), i = Zo(e, t), a = Xo(i, s).decrypt(r);
  return Qn(a);
}
class Pe extends Error {
  reason;
  constructor(t) {
    super("Account not found or credentials incorrect."), this.name = "AccountNotFoundError", this.reason = t;
  }
}
class ie extends Error {
  constructor(t) {
    super(t), this.name = "RegistrationFailedError";
  }
}
class es extends Error {
  constructor(t = "An account already exists with this login name and password. Sign in instead, or choose different credentials.") {
    super(t), this.name = "AccountAlreadyExistsError";
  }
}
class ae extends Error {
  constructor(t) {
    super(t), this.name = "RecoveryFailedError";
  }
}
class ts extends Error {
  seenGeneration;
  capsuleGeneration;
  constructor(t, o) {
    super(`This credential capsule reports generation ${o}, but this device has already seen generation ${t}. Refusing to log in with older, possibly-revoked credentials.`), this.name = "RollbackDetectedError", this.seenGeneration = t, this.capsuleGeneration = o;
  }
}
function pt(e, t) {
  const o = t ?? Math.floor(Date.now() / 1e3);
  return e == null ? o : Math.max(o, e + 1);
}
const yc = { generation: -1, recoveryGeneration: -1 };
function fr(e) {
  return `bitlogin:hwm:${e}`;
}
async function pr(e, t) {
  const o = await e.get(fr(t));
  return o ? JSON.parse(o) : yc;
}
async function ns(e, t, o) {
  const n = await pr(e, t), r = {
    generation: Math.max(n.generation, o.generation ?? -1),
    recoveryGeneration: Math.max(n.recoveryGeneration, o.recoveryGeneration ?? -1)
  };
  return await e.set(fr(t), JSON.stringify(r)), r;
}
async function fc(e, t, o = { generation: 0, recoveryGeneration: -1 }) {
  await e.set(fr(t), JSON.stringify(o));
}
function pc(e, t, o) {
  return U({ pubkey: _(e), created_at: o, kind: Dt, tags: [], content: JSON.stringify(t) }, e);
}
function hc(e, t, o) {
  const n = t.map((r) => {
    const s = ["r", r.url];
    return r.read && !r.write && s.push("read"), r.write && !r.read && s.push("write"), s;
  });
  return U({ pubkey: _(e), created_at: o, kind: ct, tags: n, content: "" }, e);
}
function vc(e, t, o) {
  return U({
    pubkey: _(e),
    created_at: o,
    kind: Gn,
    tags: t.map((n) => ["relay", n]),
    content: ""
  }, e);
}
function wc(e) {
  return e.tags.filter((t) => t[0] === "r" && t[1]).map((t) => t[1]);
}
function gc(e) {
  return e.tags.filter((t) => t[0] === "relay" && t[1]).map((t) => t[1]);
}
async function mc(e) {
  const t = _(e.everydayPrivateKey), o = Math.floor(Date.now() / 1e3), n = [.../* @__PURE__ */ new Set([...e.generalRelays, ...e.dmRelays, ...e.discoveryRelays])], r = new C(n), [s, i, a] = await Promise.all([
    r.queryQuorum({ authors: [t], kinds: [Dt] }),
    r.queryQuorum({ authors: [t], kinds: [ct] }),
    r.queryQuorum({ authors: [t], kinds: [Gn] })
  ]);
  r.closeAll();
  const c = s.outcomes.some((b) => b.events.length > 0), l = i.outcomes.some((b) => b.events.length > 0), d = a.outcomes.some((b) => b.events.length > 0), y = new C(n);
  let f = null, p = null, m = null;
  const g = [];
  if (!c && (e.name || e.about || e.picture)) {
    const b = pc(e.everydayPrivateKey, { name: e.name, about: e.about, picture: e.picture }, o);
    g.push(y.publishAll(b).then((v) => void (f = v)));
  }
  if (!l) {
    const b = hc(e.everydayPrivateKey, e.generalRelays.map((v) => ({ url: v, read: !0, write: !0 })), o);
    g.push(y.publishAll(b).then((v) => void (p = v)));
  }
  if (!d) {
    const b = vc(e.everydayPrivateKey, e.dmRelays, o);
    g.push(y.publishAll(b).then((v) => void (m = v)));
  }
  return await Promise.all(g), y.closeAll(), {
    profilePublished: f !== null && x(f) > 0,
    relayListAcknowledgedCount: p !== null ? x(p) : 0,
    dmRelayListAcknowledgedCount: m !== null ? x(m) : 0,
    profileSkippedExisting: c,
    relayListSkippedExisting: l,
    dmRelayListSkippedExisting: d
  };
}
async function Se(e, t, o) {
  const n = o.minAcks ?? 2, r = o.minReadbacks ?? 2, s = await e.publishAll(t, o.timeoutMs), i = x(s), c = (await e.queryQuorum({ kinds: [O], authors: [t.pubkey], "#d": [o.dTag], limit: 5 }, o.timeoutMs)).outcomes.filter((l) => l.events.some((d) => d.id === t.id)).length;
  return {
    acknowledgedCount: i,
    readbackVerifiedCount: c,
    success: i >= n && c >= r
  };
}
function rs(e) {
  return q(`bitlogin|password-capsule|v1|${e}|30078|bitlogin:password:v1`);
}
function os(e) {
  return q(`bitlogin|recovery-capsule|v1|${e}|30078|bitlogin:recovery:v1`);
}
async function hr(e, t, o) {
  const n = Ya(e), r = Ha(n), s = await Fo(t, r, o);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    nonce: M(s.nonce),
    ciphertext: M(s.ciphertext)
  };
}
async function vr(e, t, o) {
  if (e.version !== 1 || e.algorithm !== "aes-256-gcm")
    throw new Error(`Unsupported capsule envelope version/algorithm: ${e.version}/${e.algorithm}`);
  const n = L(e.nonce), r = L(e.ciphertext), s = await $o(t, n, r, o), i = za(s);
  return JSON.parse(Qn(i));
}
class wr extends Error {
  constructor(t) {
    super(t), this.name = "CapsuleValidationError";
  }
}
const bc = 1e6, kc = /^[0-9a-f]{64}$/u;
function N(e, t) {
  if (!e)
    throw new wr(t);
}
function $t(e) {
  return typeof e == "string" && kc.test(e);
}
function ss(e) {
  N(Array.isArray(e), "vault_relay_hints must be an array (§12.4.7).");
  for (const t of e)
    N(typeof t == "string", "Each relay hint must be a string (§12.4.7)."), N(mt(t), `Relay URL must use secure WebSockets, except for an explicit loopback development endpoint (§12.4.7): ${t}`);
}
function is(e) {
  N(typeof e == "string", "account_id must be a string (§12.4.2).");
  let t;
  try {
    t = L(e);
  } catch {
    throw new wr("account_id is not valid base64url (§12.4.2).");
  }
  N(t.length === 16, "account_id must decode to exactly 128 bits (§12.4.2).");
}
function as(e, t) {
  N(typeof e == "string", "operational_private_key must be a string (§12.4.3).");
  const o = L(e);
  N(o.length === 32, "operational_private_key must be exactly 32 bytes (§12.4.3)."), N(Xn(o), "operational_private_key is not a valid secp256k1 scalar (§12.4.3)."), N($t(t), "operational_public_key must be lowercase 64-char hex (§12.4.4).");
  const n = _(o);
  N(n === t, "operational_public_key does not match the derived public key (§12.4.4).");
}
function Vt(e, t) {
  N(typeof t == "string", `${e} must be a string (§CV5.2).`);
  let o;
  try {
    o = L(t);
  } catch {
    throw new wr(`${e} is not valid base64url (§CV5.2).`);
  }
  N(o.length === 32, `${e} must decode to exactly 32 bytes (§CV5.2).`);
}
function Ec(e) {
  const t = e.connection_vault_root, o = e.vault_sudo_key;
  t === void 0 && o === void 0 || (N(t !== void 0 && o !== void 0, "connection_vault_root and vault_sudo_key must appear together (§CV5.2)."), Vt("connection_vault_root", t), Vt("vault_sudo_key", o));
}
function _c(e) {
  const t = e.connection_vault_root, o = e.vault_sudo_key;
  t === void 0 && o === void 0 || (N(t !== void 0, "vault_sudo_key cannot appear without connection_vault_root (§CV5.2)."), Vt("connection_vault_root", t), o !== void 0 && Vt("vault_sudo_key", o));
}
function cs(e, t) {
  N(Number.isInteger(e) && e >= 0 && e <= bc, `${t} is out of supported bounds (§12.4.8).`);
}
function Pc(e) {
  N(e.schema === Zt, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), is(e.account_id), cs(e.generation, "generation"), as(e.operational_private_key, e.operational_public_key), N($t(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex (§12.4.5)."), ss(e.vault_relay_hints), _c(e);
  const t = e.recovery_capsule_event;
  N(!!t && typeof t == "object", "recovery_capsule_event must be present (§12.4.6)."), N(A(t), "Embedded recovery_capsule_event has an invalid event id or signature (§12.4.6)."), N(t.pubkey === e.recovery_public_key, "Embedded recovery_capsule_event author does not match recovery_public_key (§12.4.5).");
}
function Sc(e) {
  N(e.schema === Xt, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), is(e.account_id), cs(e.recovery_generation, "recovery_generation"), N(e.previous_recovery_event_id === null || $t(e.previous_recovery_event_id), "previous_recovery_event_id must be null or lowercase 64-char hex (§12.3)."), as(e.operational_private_key, e.operational_public_key), N($t(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex."), ss(e.vault_relay_hints), Ec(e);
}
function Kc(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const r = t.get(n.recoveryGeneration);
    if (r && r.eventId !== n.eventId)
      return {
        consistent: !1,
        warning: `Two different recovery capsules both claim generation ${n.recoveryGeneration}: possible fork, replay, or relay misbehavior.`
      };
    t.set(n.recoveryGeneration, n);
  }
  const o = [...e].sort((n, r) => n.recoveryGeneration - r.recoveryGeneration);
  for (let n = 1; n < o.length; n++) {
    const r = o[n];
    if (r.previousRecoveryEventId === null)
      return {
        consistent: !1,
        warning: `Generation ${r.recoveryGeneration} has a null previous-event link but is not the first generation.`
      };
    const s = t.get(r.recoveryGeneration - 1);
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
async function gr(e) {
  const t = _(e.locatorPrivateKey), o = await hr(e.payload, e.capsuleKey, rs(t));
  return U({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: O,
    tags: [["d", We]],
    content: JSON.stringify(o)
  }, e.locatorPrivateKey);
}
function Ac(e) {
  const t = _(e.oldLocatorPrivateKey);
  return U({
    pubkey: t,
    created_at: e.createdAt,
    kind: O,
    tags: [["d", We]],
    content: ""
  }, e.oldLocatorPrivateKey);
}
async function Rc(e, t) {
  if (!A(e))
    throw new Error("Credential capsule event has an invalid id or signature.");
  const o = JSON.parse(e.content), n = await vr(o, t, rs(e.pubkey));
  return Pc(n), n;
}
async function mr(e) {
  const t = _(e.recoveryPrivateKey), o = await hr(e.payload, e.capsuleKey, os(t));
  return U({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: O,
    tags: [["d", wt]],
    content: JSON.stringify(o)
  }, e.recoveryPrivateKey);
}
async function ls(e, t) {
  if (!A(e))
    throw new Error("Recovery capsule event has an invalid id or signature.");
  const o = JSON.parse(e.content), n = await vr(o, t, os(e.pubkey));
  return Sc(n), n;
}
function Qr(e, t, o) {
  const n = /* @__PURE__ */ new Map();
  for (const r of e)
    r.pubkey === t && r.kind === O && Be(r, "d") === o && A(r) && n.set(r.id, r);
  return [...n.values()].sort((r, s) => s.created_at - r.created_at);
}
async function us(e, t, o, n, r) {
  const s = await e.queryQuorum({ kinds: [O], authors: [t], "#d": [o], limit: 5 }, r), i = s.outcomes.flatMap((f) => f.events), a = Qr(i, t, o), c = [];
  for (const f of a)
    try {
      const p = await n(f);
      c.push({ event: f, payload: p });
    } catch (p) {
      c.push({ event: f, payload: null, error: p.message });
    }
  const l = c.find((f) => f.payload !== null) ?? null, d = s.outcomes.map((f) => ({
    responded: f.responded,
    events: Qr(f.events, t, o)
  })).filter((f) => f.responded && f.events.length > 0).map((f) => f.events[0].id), y = new Set(d).size > 1;
  return {
    quorumMet: s.quorumMet,
    respondedCount: s.respondedCount,
    totalCount: s.totalCount,
    candidates: c,
    best: l,
    relayDisagreement: y
  };
}
async function ht(e, t, o, n = 8e3) {
  return us(e, t, We, (r) => Rc(r, o), n);
}
async function ds(e, t, o, n = 8e3) {
  return us(e, t, wt, (r) => ls(r, o), n);
}
function Cc(e) {
  const t = e.filter((o) => o.payload !== null);
  return t.length < 2 ? { consistent: !0 } : Kc(t.map((o) => ({
    eventId: o.event.id,
    recoveryGeneration: o.payload.recovery_generation,
    previousRecoveryEventId: o.payload.previous_recovery_event_id
  })));
}
async function Yr(e) {
  const t = [...new Set(e.relayUrls)], o = async (a) => {
    const c = new C(t);
    try {
      const l = await c.publishAll(a, e.timeoutMs);
      return new Map(l.map((d) => [
        d.relayUrl,
        { ok: d.result.ok, message: d.result.message ?? "" }
      ]));
    } finally {
      c.closeAll();
    }
  }, [n, r] = await Promise.all([
    o(e.credentialEvent),
    o(e.recoveryEvent)
  ]), s = { ok: !1, message: "no reply" }, i = t.map((a) => ({
    relayUrl: a,
    credential: n.get(a) ?? s,
    recovery: r.get(a) ?? s
  }));
  return {
    credentialAcknowledgedCount: i.filter((a) => a.credential.ok).length,
    recoveryAcknowledgedCount: i.filter((a) => a.recovery.ok).length,
    relaysTried: i.length,
    relays: i
  };
}
function Nc(e) {
  const t = Be(e, "d");
  if (e.kind !== O || t === void 0 || !A(e))
    throw new Error("This session's capsule event is not a valid capsule.");
  return { pubkey: e.pubkey, dTag: t };
}
function Tc(e, t, o) {
  const n = e.filter((s) => s.pubkey === o.pubkey && s.kind === O && Be(s, "d") === o.dTag && A(s));
  return n.some((s) => s.id === t.id) ? "current" : n.length === 0 ? "missing" : Math.max(...n.map((s) => s.created_at)) >= t.created_at ? "newer" : "older";
}
async function Xr(e, t, o) {
  const n = Nc(t), r = new C(e);
  try {
    const s = await r.queryQuorum({
      kinds: [O],
      authors: [n.pubkey],
      "#d": [n.dTag],
      limit: 5
    }, o);
    return new Map(s.outcomes.map((i) => [
      i.relayUrl,
      i.responded ? { status: Tc(i.events, t, n) } : { status: "unreachable", error: i.error }
    ]));
  } finally {
    r.closeAll();
  }
}
async function Mc(e) {
  const t = [...new Set(e.relayUrls)], [o, n] = await Promise.all([
    Xr(t, e.credentialEvent, e.timeoutMs),
    Xr(t, e.recoveryEvent, e.timeoutMs)
  ]), r = t.map((s) => {
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
    checkedAt: e.now ?? Math.floor(Date.now() / 1e3)
  };
}
const br = di.id, xe = "aes-256-gcm-v1", Ue = "bitlogin-bip39-hkdf-v1", ys = "bitlogin-recovery-hkdf-v1", Ic = 4, Lc = 64;
function qe(e) {
  return [...new Set(e)].filter((t) => t.length <= Lc).slice(0, Ic);
}
function Fe(e) {
  return e ? { everyday_derivation: ys } : {};
}
function fs(e) {
  return e.protocol?.everyday_derivation === ys;
}
async function ps(e) {
  const t = en(e.loginName), o = e.now ?? Math.floor(Date.now() / 1e3), { locatorPrivateKey: n, capsuleKey: r } = await lt(e.password, t);
  try {
    const s = _(n), i = new C(e.vaultRelayUrls, {
      authPrivateKey: n
    });
    let a;
    try {
      a = await ht(i, s, r, e.timeoutMs);
    } finally {
      i.closeAll();
    }
    if (!a.quorumMet)
      throw new ie("Couldn't verify this login name and password aren't already registered. Please retry, or add more vault relays.");
    if (a.candidates.length > 0)
      throw new es();
    const c = e.everydayPrivateKey !== void 0;
    if (c && !Xn(e.everydayPrivateKey))
      throw new ie("The provided key is not a valid secp256k1 private key.");
    const l = Ga(Si()), d = await ur(l);
    let y, f, p;
    try {
      ({ recoveryPrivateKey: y, capsuleKey: f } = Hn(d)), p = c ? e.everydayPrivateKey : zn(d);
    } finally {
      P(d);
    }
    const m = !c, g = D(32), b = D(32);
    let v = !1;
    try {
      const k = _(y), h = _(p), E = M(_o()), T = {
        schema: Xt,
        account_id: E,
        recovery_generation: 0,
        previous_recovery_event_id: null,
        operational_private_key: M(p),
        operational_public_key: h,
        recovery_public_key: k,
        connection_vault_root: M(g),
        vault_sudo_key: M(b),
        created_at: o,
        vault_relay_hints: qe(e.vaultRelayUrls),
        protocol: {
          capsule_encryption: xe,
          recovery_derivation: Ue,
          ...Fe(m)
        }
      }, F = await mr({
        recoveryPrivateKey: y,
        capsuleKey: f,
        payload: T
      }), Z = new C(e.vaultRelayUrls, {
        authPrivateKey: y
      });
      let he;
      try {
        he = await Se(Z, F, {
          dTag: wt,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        Z.closeAll();
      }
      if (!he.success)
        throw new ie("The recovery capsule did not reach the required relay acknowledgement and readback quorum. No login credential was published. Please retry, or add more vault relays.");
      const sn = {
        schema: Zt,
        account_id: E,
        generation: 0,
        operational_private_key: M(p),
        operational_public_key: h,
        recovery_public_key: k,
        recovery_capsule_event: F,
        connection_vault_root: M(g),
        created_at: o,
        vault_relay_hints: qe(e.vaultRelayUrls),
        protocol: {
          password_kdf: br,
          capsule_encryption: xe,
          recovery_derivation: Ue,
          ...Fe(m)
        }
      }, Ir = await gr({
        locatorPrivateKey: n,
        capsuleKey: r,
        payload: sn
      }), Lr = new C(e.vaultRelayUrls, {
        authPrivateKey: n
      });
      let an;
      try {
        an = await Se(Lr, Ir, {
          dTag: We,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        Lr.closeAll();
      }
      if (!an.success)
        throw new ie("Registration did not reach the required credential acknowledgement and readback quorum. Please retry, or add more vault relays.");
      return v = !0, {
        normalizedLoginName: t,
        recoveryPhrase: l,
        everydayPrivateKey: p,
        everydayPublicKey: h,
        recoveryPublicKey: k,
        locatorPublicKey: s,
        accountId: E,
        imported: c,
        everydayKeyDerived: m,
        connectionVaultRoot: g,
        vaultSudoKey: b,
        credentialEvent: Ir,
        recoveryEvent: F,
        credentialPublish: an,
        recoveryPublish: he
      };
    } finally {
      P(y, f), v || (c || P(p), P(g, b));
    }
  } finally {
    P(n, r);
  }
}
async function Oc(e) {
  const { nsecOrHex: t, ...o } = e, n = hs(t);
  return ps({ ...o, everydayPrivateKey: n });
}
function hs(e) {
  const t = e.trim();
  let o;
  if (t.startsWith("nsec1"))
    o = yi(t);
  else if (/^[0-9a-fA-F]{64}$/u.test(t))
    o = Eo(t.toLowerCase());
  else
    throw new ie("Enter a valid nsec (nsec1…) or a 64-character hex private key.");
  if (!Xn(o))
    throw new ie("The provided key is not a valid secp256k1 private key.");
  return o;
}
class vs {
  map = /* @__PURE__ */ new Map();
  async get(t) {
    return this.map.get(t);
  }
  async set(t, o) {
    this.map.set(t, o);
  }
  async delete(t) {
    this.map.delete(t);
  }
}
async function Dc(e) {
  const t = en(e.loginName), { locatorPrivateKey: o, capsuleKey: n } = await lt(e.password, t), r = _(o), s = new C(e.vaultRelayUrls, {
    authPrivateKey: o
  });
  try {
    const i = await ht(s, r, n, e.timeoutMs);
    if (!i.quorumMet)
      throw new Pe("quorum-not-met");
    if (!i.best)
      throw new Pe(i.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
    const a = i.best.payload, c = e.store ?? new vs(), l = await pr(c, a.operational_public_key), d = a.generation < l.generation;
    if (d && !e.acknowledgeRollback)
      throw new ts(l.generation, a.generation);
    const y = d ? `This device previously saw credential generation ${l.generation}, but the accepted capsule is generation ${a.generation}. Relays may be serving stale data, or an old capsule is being replayed.` : void 0;
    await ns(c, a.operational_public_key, {
      generation: a.generation
    });
    const f = i.relayDisagreement ? 'Configured relays returned different credential capsules as "latest" for this account. Some relays may be stale, censored, or malicious.' : void 0;
    return {
      everydayPrivateKey: L(a.operational_private_key),
      everydayPublicKey: a.operational_public_key,
      recoveryPublicKey: a.recovery_public_key,
      accountId: a.account_id,
      generation: a.generation,
      everydayKeyDerived: fs(a),
      credentialEvent: i.best.event,
      recoveryCapsuleEvent: a.recovery_capsule_event,
      connectionVaultRoot: a.connection_vault_root ? L(a.connection_vault_root) : void 0,
      rollbackWarning: y,
      relayDisagreementWarning: f
    };
  } finally {
    s.closeAll();
  }
}
function Zr(e) {
  return e.filter((t) => A(t)).sort((t, o) => o.created_at - t.created_at)[0];
}
async function xc(e) {
  if (!Go(e.phrase))
    throw new ae("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await ur(e.phrase), { recoveryPrivateKey: o, capsuleKey: n } = Hn(t), r = zn(t), s = _(r);
  P(t, r);
  const i = _(o), a = new C(e.vaultRelayUrls, {
    authPrivateKey: o
  });
  let c;
  try {
    c = await ds(a, i, n, e.timeoutMs);
  } finally {
    a.closeAll();
  }
  if (e.offlineRecoveryCapsuleEvents?.length) {
    const g = [];
    for (const h of e.offlineRecoveryCapsuleEvents)
      if (A(h))
        try {
          g.push({
            event: h,
            payload: await ls(h, n)
          });
        } catch (E) {
          g.push({
            event: h,
            payload: null,
            error: E.message
          });
        }
    const b = /* @__PURE__ */ new Map();
    for (const h of [...c.candidates, ...g])
      b.set(h.event.id, h);
    const v = [...b.values()].sort((h, E) => E.event.created_at - h.event.created_at), k = v.find((h) => h.payload !== null) ?? null;
    c = {
      ...c,
      candidates: v,
      best: k,
      quorumMet: c.quorumMet || k !== null
    };
  }
  if (!c.quorumMet)
    throw new Pe("quorum-not-met");
  if (!c.best)
    throw new Pe(c.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const l = c.best.payload, d = Cc(c.candidates), y = L(l.operational_private_key), f = l.operational_public_key, { generalRelays: p, dmRelays: m } = await ws(f, [...e.discoveryRelayUrls, ...l.vault_relay_hints], e.timeoutMs);
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
    dmRelays: m,
    chainWarning: d.consistent ? void 0 : d.warning,
    everydayKeyDerived: f === s
  };
}
async function ws(e, t, o) {
  const n = new C([...new Set(t)]);
  let r = [], s = [];
  try {
    const i = await n.queryQuorum({ kinds: [ct], authors: [e], limit: 5 }, o), a = Zr(i.outcomes.flatMap((d) => d.events));
    a && (r = wc(a));
    const c = await n.queryQuorum({ kinds: [Gn], authors: [e], limit: 5 }, o), l = Zr(c.outcomes.flatMap((d) => d.events));
    l && (s = gc(l));
  } finally {
    n.closeAll();
  }
  return { generalRelays: r, dmRelays: s };
}
async function gs(e) {
  if (!Go(e))
    throw new ae("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await ur(e);
  try {
    const { recoveryPrivateKey: o, capsuleKey: n } = Hn(t), r = zn(t);
    return {
      recoveryPrivateKey: o,
      recoveryPublicKey: _(o),
      capsuleKey: n,
      everydayPrivateKey: r,
      everydayPublicKey: _(r)
    };
  } finally {
    P(t);
  }
}
async function ms(e, t, o) {
  const n = new C(t, {
    authPrivateKey: e.recoveryPrivateKey
  });
  let r;
  try {
    r = await ds(n, e.recoveryPublicKey, e.capsuleKey, o);
  } finally {
    n.closeAll();
  }
  if (!r.quorumMet)
    throw new Pe("quorum-not-met");
  if (r.best)
    throw new ae("This account's recovery capsule is still on the relays. Use normal recovery instead of a rebuild.");
  return r.candidates.length > 0 ? Math.max(...r.candidates.map((s) => s.event.created_at)) : null;
}
async function Uc(e) {
  const t = await gs(e.phrase);
  try {
    await ms(t, e.vaultRelayUrls, e.timeoutMs);
    const o = new C([
      .../* @__PURE__ */ new Set([...e.discoveryRelayUrls, ...e.vaultRelayUrls])
    ]);
    try {
      const r = (await o.queryQuorum({
        kinds: [Dt, ct],
        authors: [t.everydayPublicKey],
        limit: 10
      }, e.timeoutMs)).outcomes.flatMap((s) => s.events).filter((s) => s.pubkey === t.everydayPublicKey && A(s));
      return {
        everydayPublicKey: t.everydayPublicKey,
        profileFound: r.some((s) => s.kind === Dt),
        relayListFound: r.some((s) => s.kind === ct)
      };
    } finally {
      o.closeAll();
    }
  } finally {
    P(t.recoveryPrivateKey, t.capsuleKey, t.everydayPrivateKey);
  }
}
async function qc(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), o = await gs(e.phrase);
  let n = !1;
  try {
    const r = await ms(o, e.vaultRelayUrls, e.timeoutMs), s = {
      schema: Xt,
      account_id: M(_o()),
      recovery_generation: 0,
      previous_recovery_event_id: null,
      operational_private_key: M(o.everydayPrivateKey),
      operational_public_key: o.everydayPublicKey,
      recovery_public_key: o.recoveryPublicKey,
      connection_vault_root: M(D(32)),
      vault_sudo_key: M(D(32)),
      created_at: r === null ? t : pt(r, t),
      vault_relay_hints: qe(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: xe,
        recovery_derivation: Ue,
        ...Fe(!0)
      }
    }, i = await mr({
      recoveryPrivateKey: o.recoveryPrivateKey,
      capsuleKey: o.capsuleKey,
      payload: s
    }), a = new C(e.vaultRelayUrls, {
      authPrivateKey: o.recoveryPrivateKey
    });
    let c;
    try {
      c = await Se(a, i, {
        dTag: wt,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      a.closeAll();
    }
    if (!c.success)
      throw new ae("Could not publish the rebuilt recovery capsule to enough relays. Nothing else was changed; please retry.");
    const { generalRelays: l, dmRelays: d } = await ws(o.everydayPublicKey, [...e.discoveryRelayUrls, ...e.vaultRelayUrls], e.timeoutMs);
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
    n || P(o.recoveryPrivateKey, o.capsuleKey, o.everydayPrivateKey);
  }
}
async function Fc(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), o = en(e.newLoginName), { recovered: n } = e, r = n.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: n.currentRecoveryPayload.connection_vault_root,
    vault_sudo_key: n.currentRecoveryPayload.vault_sudo_key
  } : {}, s = n.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: n.currentRecoveryPayload.connection_vault_root
  } : {}, { locatorPrivateKey: i, capsuleKey: a } = await lt(e.newPassword, o);
  try {
    const c = _(i), l = new C(e.vaultRelayUrls, {
      authPrivateKey: i
    });
    let d;
    try {
      d = await ht(l, c, a, e.timeoutMs);
    } finally {
      l.closeAll();
    }
    if (!d.quorumMet)
      throw new ae("Couldn't verify the new login name and password aren't already registered. Please retry, or add more vault relays.");
    const y = d.best?.payload ?? null, f = y !== null && y.account_id === n.accountId && y.operational_public_key === n.everydayPublicKey && y.recovery_public_key === n.recoveryPublicKey && y.generation === 0 && y.recovery_capsule_event.id === n.currentRecoveryEvent.id;
    if (d.candidates.length > 0 && !f)
      throw new ae("Another account is already registered with that login name and password. Pick a different one.");
    const p = n.currentRecoveryPayload.recovery_generation + 1, m = {
      schema: Xt,
      account_id: n.accountId,
      recovery_generation: p,
      previous_recovery_event_id: n.currentRecoveryEvent.id,
      operational_private_key: M(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      ...r,
      created_at: pt(n.currentRecoveryEvent.created_at, t),
      vault_relay_hints: qe(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: xe,
        recovery_derivation: Ue,
        ...Fe(n.everydayKeyDerived)
      }
    }, g = await mr({
      recoveryPrivateKey: n.recoveryPrivateKey,
      capsuleKey: n.recoveryCapsuleKey,
      payload: m
    }), b = new C(e.vaultRelayUrls, {
      authPrivateKey: n.recoveryPrivateKey
    });
    let v;
    try {
      v = await Se(b, g, {
        dTag: wt,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      b.closeAll();
    }
    if (!v.success)
      throw new ae("Could not publish the refreshed recovery capsule to enough relays. No new credential was published; please retry.");
    n.currentRecoveryEvent = g, n.currentRecoveryPayload = m;
    const k = {
      schema: Zt,
      account_id: n.accountId,
      generation: 0,
      operational_private_key: M(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      recovery_capsule_event: g,
      ...s,
      // A retry may be repairing a credential that reached only one relay.
      // It must replace that partial event deterministically on every relay.
      created_at: d.best ? pt(d.best.event.created_at, t) : t,
      vault_relay_hints: qe(e.vaultRelayUrls),
      protocol: {
        password_kdf: br,
        capsule_encryption: xe,
        recovery_derivation: Ue,
        ...Fe(n.everydayKeyDerived)
      }
    }, h = await gr({
      locatorPrivateKey: i,
      capsuleKey: a,
      payload: k
    }), E = new C(e.vaultRelayUrls, {
      authPrivateKey: i
    });
    let T;
    try {
      T = await Se(E, h, {
        dTag: We,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      E.closeAll();
    }
    if (!T.success)
      throw new ae("Could not publish the new credential capsule to enough relays. Please retry.");
    return e.store && await fc(e.store, n.everydayPublicKey, {
      generation: 0,
      recoveryGeneration: p
    }), {
      normalizedLoginName: o,
      locatorPublicKey: c,
      credentialEvent: h,
      refreshedRecoveryEvent: g,
      credentialPublish: T,
      recoveryPublish: v
    };
  } finally {
    P(i, a);
  }
}
async function $c(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), o = en(e.loginName), n = await lt(e.oldPassword, o), r = _(n.locatorPrivateKey), s = new C(e.vaultRelayUrls, {
    authPrivateKey: n.locatorPrivateKey
  });
  let i;
  try {
    i = await ht(s, r, n.capsuleKey, e.timeoutMs);
  } finally {
    s.closeAll();
  }
  if (!i.quorumMet)
    throw new Pe("quorum-not-met");
  if (!i.best)
    throw new Pe(i.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const a = i.best.payload, c = i.best.event, l = e.store ?? new vs(), d = await pr(l, a.operational_public_key);
  if (a.generation < d.generation && !e.acknowledgeRollback)
    throw new ts(d.generation, a.generation);
  const y = await lt(e.newPassword, o), f = _(y.locatorPrivateKey), p = new C(e.vaultRelayUrls, {
    authPrivateKey: y.locatorPrivateKey
  });
  let m;
  try {
    m = await ht(p, f, y.capsuleKey, e.timeoutMs);
  } finally {
    p.closeAll();
  }
  if (!m.quorumMet)
    throw new ie("Couldn't verify the new password isn't already registered under this login name. Please retry, or add more vault relays.");
  if (m.candidates.length > 0)
    throw new es("Another account is already registered with this login name and the new password you chose. Pick a different new password.");
  const g = a.generation + 1, b = {
    schema: Zt,
    account_id: a.account_id,
    generation: g,
    operational_private_key: a.operational_private_key,
    operational_public_key: a.operational_public_key,
    recovery_public_key: a.recovery_public_key,
    recovery_capsule_event: a.recovery_capsule_event,
    // Carry only the session root. A legacy credential may contain the sudo
    // key, but rotation deliberately scrubs it; personal-tier access remains
    // phrase-gated through the recovery capsule.
    ...a.connection_vault_root !== void 0 ? { connection_vault_root: a.connection_vault_root } : {},
    created_at: t,
    vault_relay_hints: qe(e.vaultRelayUrls),
    protocol: {
      password_kdf: br,
      capsule_encryption: xe,
      recovery_derivation: Ue,
      ...Fe(fs(a))
    }
  }, v = await gr({
    locatorPrivateKey: y.locatorPrivateKey,
    capsuleKey: y.capsuleKey,
    payload: b
  }), k = new C(e.vaultRelayUrls, {
    authPrivateKey: y.locatorPrivateKey
  }), h = await Se(k, v, {
    dTag: We,
    minAcks: e.minAcknowledgements,
    timeoutMs: e.timeoutMs
  });
  if (k.closeAll(), !h.success)
    throw new ie("The new credential capsule did not reach the required relay acknowledgement and readback quorum. Your existing password still works; nothing was changed. Please retry.");
  const E = Ac({
    oldLocatorPrivateKey: n.locatorPrivateKey,
    createdAt: pt(c.created_at, t)
  }), T = Lo({
    privateKey: n.locatorPrivateKey,
    eventIdToDelete: c.id,
    deletedEventKind: O,
    createdAt: t
  }), F = new C(e.vaultRelayUrls, {
    authPrivateKey: n.locatorPrivateKey
  }), [Z, he] = await Promise.all([
    F.publishAll(E, e.timeoutMs),
    F.publishAll(T, e.timeoutMs)
  ]);
  return F.closeAll(), await ns(l, a.operational_public_key, {
    generation: g
  }), {
    normalizedLoginName: o,
    oldLocatorPublicKey: r,
    newLocatorPublicKey: f,
    newGeneration: g,
    recoveryPublicKey: a.recovery_public_key,
    recoveryCapsuleEvent: a.recovery_capsule_event,
    newCredentialEvent: v,
    tombstoneEvent: E,
    deletionRequestEvent: T,
    newCredentialPublish: h,
    tombstoneAcknowledgedCount: x(Z),
    deletionAcknowledgedCount: x(he)
  };
}
const Vc = "bitlogin/connection-vault-root/v1", Wc = "bitlogin/connection-vault-signing/v1", Bc = "bitlogin/connection-record-encryption/v1", jc = "bitlogin/connection-vault-personal/v1", Nn = "bitlogin:connection:";
function Jc(e) {
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Zn(Po(Vc), e);
}
function je(e) {
  return Ki(e, Wc).scalar;
}
function bs(e) {
  const t = je(e);
  try {
    return _(t);
  } finally {
    P(t);
  }
}
function Gc(e, t) {
  if (t.length !== 32)
    throw new Error("vault_sudo_key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Zn(Po(jc), Yn(e, t));
}
function ks(e, t) {
  const o = rn(t);
  return gt(e, Yn(q(Bc), new Uint8Array([0]), o), 32);
}
function Hc() {
  return M(D(16));
}
function rn(e) {
  const t = L(e);
  if (t.length !== 16)
    throw new Error("connection_id must decode to exactly 16 bytes (§CV7).");
  return t;
}
function Es(e) {
  return rn(e), `${Nn}${e}`;
}
function _s(e) {
  if (!e.startsWith(Nn))
    return null;
  const t = e.slice(Nn.length);
  try {
    return rn(t), t;
  } catch {
    return null;
  }
}
class ce {
  privateKey;
  publicKeyHex;
  destroyed = !1;
  constructor(t) {
    this.privateKey = t, this.publicKeyHex = _(t);
  }
  assertAlive() {
    if (this.destroyed)
      throw new Error("This signer has been destroyed (session locked or logged out).");
  }
  getPublicKey() {
    return this.assertAlive(), this.publicKeyHex;
  }
  signEvent(t) {
    return this.assertAlive(), U({
      pubkey: this.publicKeyHex,
      created_at: t.created_at ?? Math.floor(Date.now() / 1e3),
      kind: t.kind,
      tags: t.tags ?? [],
      content: t.content
    }, this.privateKey);
  }
  nip44Encrypt(t, o) {
    return this.assertAlive(), An(Ee(this.privateKey, t), o);
  }
  nip44Decrypt(t, o) {
    return this.assertAlive(), er(Ee(this.privateKey, t), o);
  }
  /** Legacy relative to nip44Encrypt above, but still what a real NIP-07 extension exposes as
   * window.nostr.nip04.encrypt -- implemented for drop-in parity. */
  nip04Encrypt(t, o) {
    return this.assertAlive(), lc(this.privateKey, t, o);
  }
  nip04Decrypt(t, o) {
    return this.assertAlive(), dc(this.privateKey, t, o);
  }
  /** Best-practical secret wipe (§11.10, §21.4): overwrites the private key buffer in place. */
  destroy() {
    P(this.privateKey), this.destroyed = !0;
  }
}
const Ps = "bitlogin.connection.v1", Ss = "bitlogin.connection.nwc.v1", eo = 120, zc = /* @__PURE__ */ new Set(["active", "suspended", "deleted"]), Qc = /* @__PURE__ */ new Set(["connectable", "personal"]);
class Me extends Error {
  constructor(t) {
    super(t), this.name = "ConnectionRecordError";
  }
}
function Ks(e, t) {
  return q(`bitlogin|connection-record|v1|${e}|30078|${t}`);
}
function As(e) {
  const t = e, o = (s) => {
    throw new Me(s);
  };
  (!t || typeof t != "object") && o("Connection record must be an object."), t.schema !== Ps && o("Unsupported connection record schema (§CV8.3)."), typeof t.connection_id != "string" && o("connection_id must be a string (§CV7)."), (typeof t.connection_type != "string" || t.connection_type.length === 0) && o("connection_type must be a non-empty string (§CV8.3)."), Qc.has(t.tier) || o("tier must be connectable or personal."), zc.has(t.state) || o("state must be active, suspended, or deleted (§CV8.3)."), (typeof t.label != "string" || t.label.length > eo) && o(`label must be a string of at most ${eo} characters.`), (!Number.isInteger(t.created_at) || !Number.isInteger(t.updated_at)) && o("created_at and updated_at must be integers (§CV8.3).");
  const n = t.credential;
  (!n || typeof n != "object" || typeof n.schema != "string") && o("credential must be an object naming its profile schema (§CV8.3).");
  const r = t.application_binding;
  (!r || typeof r != "object" || r.origin !== null && typeof r.origin != "string" || r.app_pubkey !== null && typeof r.app_pubkey != "string") && o("application_binding must carry origin and app_pubkey (string or null)."), t.notes !== null && typeof t.notes != "string" && o("notes must be a string or null.");
}
async function fn(e) {
  As(e.record);
  const t = je(e.vaultPrk), o = _(t), n = Es(e.record.connection_id), r = ks(e.recordPrk, e.record.connection_id), s = await hr(e.record, r, Ks(o, n));
  return U({
    pubkey: o,
    created_at: pt(e.previousCreatedAt, e.now),
    kind: O,
    tags: [["d", n]],
    content: JSON.stringify(s)
  }, t);
}
async function Yc(e, t, o) {
  if (!A(e))
    throw new Me("Connection record event has an invalid id or signature.");
  const n = _(je(t));
  if (e.pubkey !== n)
    throw new Me("Connection record event is not signed by this vault's identity.");
  const r = Be(e, "d") ?? "", s = _s(r);
  if (s === null)
    throw new Me("Connection record event has a malformed d tag.");
  const i = JSON.parse(e.content), a = Ks(e.pubkey, r), c = [
    { prk: t, tier: "connectable" },
    ...o ? [{ prk: o, tier: "personal" }] : []
  ];
  for (const l of c) {
    let d;
    try {
      d = await vr(i, ks(l.prk, s), a);
    } catch {
      continue;
    }
    if (As(d), d.connection_id !== s)
      throw new Me("Connection record id does not match its d tag.");
    if (d.tier !== l.tier)
      throw new Me("Connection record tier does not match the key that decrypted it.");
    return { record: d, tier: l.tier, event: e };
  }
  return null;
}
function Xc(e, t) {
  return {
    ...e,
    state: "deleted",
    credential: { schema: e.credential.schema },
    notes: null,
    updated_at: t
  };
}
const Wt = /^[0-9a-f]{64}$/u;
class ee extends Error {
  constructor(t) {
    super(t), this.name = "NwcParseError";
  }
}
function to(e) {
  const t = e.trim();
  if (!/^nostr\+walletconnect:\/\//iu.test(t))
    throw new ee("Not an NWC URI: it must start with nostr+walletconnect://");
  let o;
  try {
    o = new URL(t.replace(/^nostr\+walletconnect:\/\//iu, "http://"));
  } catch {
    throw new ee("The NWC URI is malformed.");
  }
  const n = o.hostname.toLowerCase();
  if (!Wt.test(n))
    throw new ee("The NWC URI's wallet service pubkey is not 64-char hex.");
  const r = [], s = [];
  let i = null, a = null;
  for (const [c, l] of o.searchParams.entries())
    if (c === "relay") {
      if (!mt(l))
        throw new ee("An NWC relay must use secure WebSockets, except for an explicit loopback development endpoint.");
      r.push(l);
    } else if (c === "secret") {
      const d = l.toLowerCase();
      if (!Wt.test(d))
        throw new ee("The NWC URI's secret is not a 64-char hex client key.");
      i = d;
    } else c === "lud16" ? a = l : s.push([c, l]);
  if (r.length === 0)
    throw new ee("The NWC URI names no relay.");
  if (i === null)
    throw new ee("The NWC URI carries no secret.");
  return {
    schema: Ss,
    wallet_pubkey: n,
    relays: r,
    secret: i,
    lud16: a,
    extra_params: s
  };
}
function Zc(e) {
  Rs(e);
  const t = new URLSearchParams();
  for (const o of e.relays)
    t.append("relay", o);
  t.append("secret", e.secret), e.lud16 !== null && t.append("lud16", e.lud16);
  for (const [o, n] of e.extra_params)
    t.append(o, n);
  return `nostr+walletconnect://${e.wallet_pubkey}?${t.toString()}`;
}
function el(e, t) {
  return e.wallet_pubkey === t.wallet_pubkey && e.secret === t.secret;
}
function Rs(e) {
  const t = e, o = (n) => {
    throw new ee(n);
  };
  (!t || typeof t != "object") && o("NWC credential must be an object."), t.schema !== Ss && o("NWC credential has the wrong schema."), (typeof t.wallet_pubkey != "string" || !Wt.test(t.wallet_pubkey)) && o("NWC credential wallet_pubkey must be 64-char lowercase hex."), (!Array.isArray(t.relays) || t.relays.length === 0 || t.relays.some((n) => typeof n != "string")) && o("NWC credential must name at least one relay."), t.relays.some((n) => !mt(n)) && o("NWC relays must use secure WebSockets, except for explicit loopback development endpoints."), (typeof t.secret != "string" || !Wt.test(t.secret)) && o("NWC credential secret must be 64-char lowercase hex."), t.lud16 !== null && typeof t.lud16 != "string" && o("NWC credential lud16 must be a string or null."), (!Array.isArray(t.extra_params) || t.extra_params.some((n) => !Array.isArray(n) || n.length !== 2 || typeof n[0] != "string" || typeof n[1] != "string")) && o("NWC credential extra_params must be [key, value] string pairs.");
}
const tl = "bitlogin:vault-hwm:v2:", nl = "bitlogin/vault-hwm-index/v2", Cs = "bitlogin/vault-hwm-encryption/v2", rl = /^[0-9a-f]{64}$/u;
class le extends Error {
  constructor() {
    super("The local Connection Vault rollback marker is invalid or has been tampered with."), this.name = "RecordHighWaterMarkError";
  }
}
function kr(e) {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return Number.isInteger(t.createdAt) && (t.createdAt ?? -1) >= 0 && typeof t.eventId == "string" && rl.test(t.eventId);
}
function Ns(e, t) {
  rn(t);
  const o = gt(e, nl, 32), n = q(t);
  try {
    return `${tl}${M(bo(ko, o, n))}`;
  } finally {
    P(o, n);
  }
}
function ol(e, t) {
  return `bitlogin:vault-hwm:${bs(e)}:${t}`;
}
async function sl(e, t, o) {
  const n = gt(e, Cs, 32), r = q(JSON.stringify(o)), s = q(t);
  try {
    const i = await Fo(n, r, s), a = {
      v: 2,
      nonce: M(i.nonce),
      ciphertext: M(i.ciphertext)
    };
    return JSON.stringify(a);
  } finally {
    P(n, r, s);
  }
}
async function il(e, t, o) {
  const n = gt(e, Cs, 32), r = q(t);
  let s;
  try {
    const i = JSON.parse(o);
    if (i.v !== 2 || typeof i.nonce != "string" || typeof i.ciphertext != "string")
      throw new le();
    s = await $o(n, L(i.nonce), L(i.ciphertext), r);
    const a = JSON.parse(Qn(s));
    if (!kr(a))
      throw new le();
    return a;
  } catch (i) {
    throw i instanceof le ? i : new le();
  } finally {
    P(n, r), s && P(s);
  }
}
async function Ts(e, t, o, n) {
  const r = Ns(t, o);
  await e.set(r, await sl(t, r, n));
}
async function Ms(e, t, o) {
  const n = Ns(t, o), r = await e.get(n);
  if (r !== void 0)
    return il(t, n, r);
  const s = ol(t, o), i = await e.get(s);
  if (i === void 0)
    return null;
  try {
    const a = JSON.parse(i);
    if (!kr(a))
      throw new le();
    return await Ts(e, t, o, a), await e.delete(s), a;
  } catch (a) {
    throw a instanceof le ? a : new le();
  }
}
async function Is(e, t, o, n) {
  if (!kr(n))
    throw new le();
  const r = await Ms(e, t, o);
  r && Sn({ created_at: n.createdAt, id: n.eventId }, { created_at: r.createdAt, id: r.eventId }) <= 0 || await Ts(e, t, o, n);
}
async function al(e) {
  const t = je(e.vaultPrk), o = new C(e.relayUrls, { authPrivateKey: t });
  let n;
  try {
    n = await Se(o, e.event, {
      dTag: Es(e.connectionId),
      minAcks: e.minAcknowledgements,
      // The readback bar follows the ack bar: a caller publishing to fewer
      // relays (a targeted repair, a test) has already lowered its quorum.
      minReadbacks: e.minAcknowledgements,
      timeoutMs: e.timeoutMs
    });
  } finally {
    o.closeAll(), P(t);
  }
  return n.success && await Is(e.store, e.vaultPrk, e.connectionId, {
    createdAt: e.event.created_at,
    eventId: e.event.id
  }), n;
}
const no = 500;
async function cl(e) {
  const t = je(e.vaultPrk), o = _(t), n = new C(e.relayUrls, { authPrivateKey: t });
  let r;
  try {
    r = await n.queryQuorum({ kinds: [O], authors: [o], limit: no }, e.timeoutMs);
  } finally {
    n.closeAll(), P(t);
  }
  const s = r.outcomes.some((l) => l.events.length >= no), i = /* @__PURE__ */ new Map();
  for (const l of r.outcomes.flatMap((d) => d.events)) {
    if (!A(l) || l.pubkey !== o)
      continue;
    const d = _s(Be(l, "d") ?? "");
    if (d === null)
      continue;
    const y = i.get(d);
    (!y || Sn(l, y) > 0) && i.set(d, l);
  }
  const a = /* @__PURE__ */ new Map(), c = [];
  for (const [l, d] of i) {
    const y = await Ms(e.store, e.vaultPrk, l);
    if (y !== null && Sn(d, {
      created_at: y.createdAt,
      id: y.eventId
    }) < 0) {
      c.push(l);
      continue;
    }
    a.set(l, d), await Is(e.store, e.vaultPrk, l, {
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
class ll {
  vaultPrk;
  personalPrk = null;
  destroyed = !1;
  connectionVaultRoot;
  vaultPublicKey;
  constructor(t) {
    this.connectionVaultRoot = t.slice(), this.vaultPrk = Jc(this.connectionVaultRoot), this.vaultPublicKey = bs(this.vaultPrk);
  }
  get sudoActive() {
    return this.personalPrk !== null;
  }
  /** Opens a sudo window. Consumes (wipes) the caller's sudo key copy. */
  enableSudo(t) {
    this.endSudo(), this.personalPrk = Gc(this.connectionVaultRoot, t), P(t);
  }
  /** Closes the sudo window and wipes the personal-tier key material. */
  endSudo() {
    this.personalPrk && P(this.personalPrk), this.personalPrk = null;
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
    this.endSudo(), P(this.vaultPrk, this.connectionVaultRoot), this.destroyed = !0;
  }
  prkForTier(t) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    if (t === "connectable")
      return this.vaultPrk;
    if (!this.personalPrk)
      throw new Error("Personal-tier records require an open sudo window (enableSudo).");
    return this.personalPrk;
  }
  /** Builds a fresh record + its signed event. Purely local; publish separately. */
  async createConnection(t) {
    const o = t.now ?? Math.floor(Date.now() / 1e3), n = {
      schema: Ps,
      connection_id: Hc(),
      connection_type: t.connection_type,
      tier: t.tier,
      state: "active",
      label: t.label,
      created_at: o,
      updated_at: o,
      credential: t.credential,
      application_binding: t.application_binding ?? {
        origin: null,
        app_pubkey: null
      },
      notes: t.notes ?? null
    }, r = await fn({
      vaultPrk: this.vaultPrk,
      recordPrk: this.prkForTier(t.tier),
      record: n,
      now: o
    });
    return { record: n, event: r };
  }
  /** Replaces a record's content. The tier is immutable — moving a secret
   *  between tiers is a delete-and-recreate, never a silent re-encryption. */
  async updateConnection(t, o, n) {
    const r = n ?? Math.floor(Date.now() / 1e3), s = {
      ...t.record,
      ...o,
      tier: t.record.tier,
      connection_id: t.record.connection_id,
      created_at: t.record.created_at,
      updated_at: r
    }, i = await fn({
      vaultPrk: this.vaultPrk,
      recordPrk: this.prkForTier(s.tier),
      record: s,
      previousCreatedAt: t.event.created_at,
      now: r
    });
    return { record: s, event: i };
  }
  /** §CV11 step 2: the encrypted tombstone replacement. */
  async deleteConnection(t, o) {
    const n = o ?? Math.floor(Date.now() / 1e3), r = Xc(t.record, n), s = await fn({
      vaultPrk: this.vaultPrk,
      recordPrk: this.prkForTier(r.tier),
      record: r,
      previousCreatedAt: t.event.created_at,
      now: n
    });
    return { record: r, event: s };
  }
  /** Trial-decrypts one event; personal-tier records resolve only inside a sudo window. */
  decryptEvent(t) {
    return this.destroyed ? Promise.reject(new Error("This vault session was destroyed; create a new one from the account's root.")) : Yc(t, this.vaultPrk, this.personalPrk ?? void 0);
  }
  /** §CV11 step 3: a NIP-09 deletion request for a replaced record event,
   *  signed by the vault identity. Best-effort by contract — the encrypted
   *  tombstone is the durable part of a deletion, this is the courtesy ask. */
  buildDeletionRequest(t, o) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    return Lo({
      privateKey: je(this.vaultPrk),
      eventIdToDelete: t,
      deletedEventKind: O,
      createdAt: o ?? Math.floor(Date.now() / 1e3)
    });
  }
  publish(t) {
    return al({ vaultPrk: this.vaultPrk, ...t });
  }
  fetchEvents(t) {
    return cl({ vaultPrk: this.vaultPrk, ...t });
  }
  /**
   * Fetches and decrypts everything decryptable right now. Outside a sudo
   * window the personal tier is simply absent from the result — invisible,
   * not erroring, exactly like the app-facing API contract.
   */
  async listConnections(t) {
    const o = await this.fetchEvents(t);
    if (!o.quorumMet && !t.acknowledgeIncompleteQuorum)
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
const ul = "bitlogin", ne = "kv", B = "device-keys", dl = 2;
function yl() {
  return new Promise((e, t) => {
    const o = indexedDB.open(ul, dl);
    o.onupgradeneeded = () => {
      const n = o.result;
      n.objectStoreNames.contains(ne) || n.createObjectStore(ne), n.objectStoreNames.contains(B) || n.createObjectStore(B);
    }, o.onsuccess = () => e(o.result), o.onerror = () => t(o.error);
  });
}
class fl {
  dbPromise = null;
  db() {
    return this.dbPromise || (this.dbPromise = yl()), this.dbPromise;
  }
  async get(t) {
    const o = await this.db();
    return new Promise((n, r) => {
      const i = o.transaction(ne, "readonly").objectStore(ne).get(t);
      i.onsuccess = () => n(i.result), i.onerror = () => r(i.error);
    });
  }
  async set(t, o) {
    const n = await this.db();
    return new Promise((r, s) => {
      const i = n.transaction(ne, "readwrite");
      i.objectStore(ne).put(o, t), i.oncomplete = () => r(), i.onerror = () => s(i.error);
    });
  }
  async delete(t) {
    const o = await this.db();
    return new Promise((n, r) => {
      const s = o.transaction(ne, "readwrite");
      s.objectStore(ne).delete(t), s.oncomplete = () => n(), s.onerror = () => r(s.error);
    });
  }
  /**
   * Returns a non-extractable AES-GCM key kept by the browser's IndexedDB
   * implementation. The key is deliberately separate from the string-only KV
   * API so callers cannot accidentally serialize it as application data.
   */
  async getOrCreateDeviceKey(t) {
    const o = await this.db(), n = await new Promise((s, i) => {
      const a = o.transaction(B, "readonly").objectStore(B).get(t);
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
        const a = o.transaction(B, "readwrite");
        a.objectStore(B).add(r, t), a.oncomplete = () => s(), a.onerror = () => i(a.error);
      }), r;
    } catch {
      const s = await new Promise((i, a) => {
        const c = o.transaction(B, "readonly").objectStore(B).get(t);
        c.onsuccess = () => i(c.result), c.onerror = () => a(c.error);
      });
      if (s) return s;
      throw new Error("Unable to create the browser-bound session key.");
    }
  }
  async deleteDeviceKey(t) {
    const o = await this.db();
    return new Promise((n, r) => {
      const s = o.transaction(B, "readwrite");
      s.objectStore(B).delete(t), s.oncomplete = () => n(), s.onerror = () => r(s.error);
    });
  }
}
const kt = "bitlogin:session:v1", Er = "bitlogin:session-device-key:v1";
function Ls(e) {
  return !!(e && typeof e == "object" && e.v === 3 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function Os(e, t) {
  if (e.length !== 32) throw new Error("Not a lock key.");
  return crypto.subtle.importKey("raw", Xe(e), "AES-GCM", !1, [t]);
}
async function Mt(e, t = kt) {
  try {
    const o = await e.get(t);
    if (!o) return "none";
    const n = JSON.parse(o);
    return Ls(n) ? "locked" : Ds(n) ? "open" : "none";
  } catch {
    return "none";
  }
}
function Pt(e) {
  let t = "";
  for (const o of e) t += String.fromCharCode(o);
  return btoa(t);
}
function St(e) {
  const t = atob(e);
  return Uint8Array.from(t, (o) => o.charCodeAt(0));
}
function Xe(e) {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}
function Ds(e) {
  return !!(e && typeof e == "object" && e.v === 2 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function Tn(e, t, o, n = kt) {
  const r = {
    everydayPrivateKeyHex: Array.from(t.everydayPrivateKey, (s) => s.toString(16).padStart(2, "0")).join(""),
    accountId: t.accountId,
    recoveryPublicKey: t.recoveryPublicKey,
    activeCredentialEvent: t.activeCredentialEvent,
    activeRecoveryEvent: t.activeRecoveryEvent,
    ...t.connectionVaultRoot ? {
      connectionVaultRootHex: Array.from(
        t.connectionVaultRoot,
        (s) => s.toString(16).padStart(2, "0")
      ).join("")
    } : {},
    ...t.vaultEnabled !== void 0 ? { vaultEnabled: t.vaultEnabled } : {},
    ...t.everydayKeyDerived !== void 0 ? { everydayKeyDerived: t.everydayKeyDerived } : {}
  };
  try {
    if (typeof e.getOrCreateDeviceKey != "function") {
      await e.delete(n);
      return;
    }
    const s = await e.getOrCreateDeviceKey(Er), i = crypto.getRandomValues(new Uint8Array(12)), a = new TextEncoder().encode(JSON.stringify(r)), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, s, a), l = {
      v: 2,
      iv: Pt(i),
      ciphertext: Pt(new Uint8Array(c))
    };
    if (!o) {
      await e.set(n, JSON.stringify(l));
      return;
    }
    const d = crypto.getRandomValues(new Uint8Array(12)), y = await crypto.subtle.encrypt({ name: "AES-GCM", iv: d }, await Os(o, "encrypt"), new TextEncoder().encode(JSON.stringify(l))), f = { v: 3, iv: Pt(d), ciphertext: Pt(new Uint8Array(y)) };
    await e.set(n, JSON.stringify(f));
  } catch {
    o && await e.delete(n).catch(() => {
    });
  }
}
async function xs(e, t, o = kt) {
  let n;
  try {
    n = await e.get(o);
  } catch {
    return null;
  }
  if (!n) return null;
  try {
    let r = JSON.parse(n);
    if (Ls(r)) {
      if (!t) return null;
      const c = await crypto.subtle.decrypt({ name: "AES-GCM", iv: Xe(St(r.iv)) }, await Os(t, "decrypt"), Xe(St(r.ciphertext)));
      r = JSON.parse(new TextDecoder().decode(c));
    }
    if (!Ds(r) || typeof e.getOrCreateDeviceKey != "function")
      return await e.delete(o), null;
    const s = await e.getOrCreateDeviceKey(Er), i = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: Xe(St(r.iv)) },
      s,
      Xe(St(r.ciphertext))
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
const pl = "bitlogin:kept-session:v1:", W = (e) => pl + e;
async function z(e, t = kt) {
  try {
    await e.delete(t);
  } catch {
  }
}
async function ro(e) {
  try {
    await e.delete(kt), typeof e.deleteDeviceKey == "function" && await e.deleteDeviceKey(Er);
  } catch {
  }
}
const hl = 27300, $e = {
  /** The longest address a picture may have. */
  pictureChars: 300,
  /** The most that is said about someone, in their own words. */
  aboutChars: 280,
  /** How long a pass made here lasts, in seconds. NSWP's verifier allows twelve hours; this gives four. */
  passSec: 4 * 3600,
  /** A profile's content is not read past this many characters. */
  contentChars: 2e4
};
function vl(e) {
  if (typeof e != "string" || e.length > $e.pictureChars) return "";
  try {
    const t = new URL(e);
    return t.protocol !== "https:" || t.username || t.password || !t.hostname.includes(".") ? "" : t.href.length <= $e.pictureChars ? t.href : "";
  } catch {
    return "";
  }
}
const wl = (e) => e <= 31 || e >= 127 && e <= 159 || e >= 8203 && e <= 8207 || e >= 8232 && e <= 8239 || e >= 8288 && e <= 8303 || e === 65279;
function gl(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const o of e.slice(0, $e.aboutChars * 8).normalize("NFC")) t += wl(o.codePointAt(0)) ? " " : o;
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, $e.aboutChars).join("").trim();
}
function fe(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, o = dt(t.name), n = vl(t.picture), r = gl(t.about);
  return !o && !n && !r ? null : { ...o ? { name: o } : {}, ...n ? { picture: n } : {}, ...r ? { about: r } : {} };
}
function ml(e, t) {
  if (!A(e) || e.kind !== 0 || e.pubkey !== t || e.content.length > $e.contentChars) return null;
  let o;
  try {
    o = JSON.parse(e.content);
  } catch {
    return null;
  }
  if (!o || typeof o != "object" || Array.isArray(o)) return null;
  const n = o;
  return fe({ name: dt(n.display_name) || dt(n.displayName) || n.name, picture: n.picture, about: n.about });
}
function oo(e, t) {
  let o = null;
  for (const n of e)
    !A(n) || n.kind !== 0 || n.pubkey !== t || o && n.created_at <= o.at || (o = { at: n.created_at, profile: ml(n, t) });
  return o?.profile ?? null;
}
const bl = /^[0-9a-f]{64}$/u;
function kl(e) {
  const t = Ut(e.site);
  if (!t || typeof e.session != "string" || !bl.test(e.session) || e.session === e.identity) return null;
  const o = Math.floor(e.nowSeconds), n = fe(e.profile) ?? {}, r = [
    ["nswp:session", e.session],
    ["nswp:origin", t],
    ["expiration", String(o + $e.passSec)]
  ];
  return n.name && r.push(["name", n.name]), n.picture && r.push(["picture", n.picture]), n.about && r.push(["about", n.about]), { kind: hl, created_at: o, tags: r, content: "" };
}
const Mn = "bitlogin:kept-accounts:v1", Bt = {
  /** No more accounts than this are kept on one device. The one least lately used goes first. */
  accounts: 8
}, El = /^[0-9a-f]{64}$/u;
function _r(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (typeof t.pubkey != "string" || !El.test(t.pubkey)) return null;
  const o = fe({ name: t.name, picture: t.picture, about: t.about }) ?? {}, n = typeof t.at == "number" && Number.isFinite(t.at) && t.at > 0 ? Math.floor(t.at) : 0;
  let r;
  try {
    r = et(t.pubkey);
  } catch {
    return null;
  }
  return { pubkey: t.pubkey, npub: r, ...o, at: n };
}
function _l(e) {
  if (!e) return [];
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return [];
  }
  if (!Array.isArray(t)) return [];
  const o = /* @__PURE__ */ new Set(), n = [];
  for (const r of t.slice(0, Bt.accounts * 2)) {
    const s = _r(r);
    !s || o.has(s.pubkey) || (o.add(s.pubkey), n.push(s));
  }
  return n.sort((r, s) => s.at - r.at).slice(0, Bt.accounts);
}
function Pl(e, t, o, n = {}) {
  const r = e.find((a) => a.pubkey === t), s = _r({
    pubkey: t,
    at: o,
    name: dt(n.name) || r?.name,
    picture: n.picture ?? r?.picture,
    about: n.about ?? r?.about
  });
  if (!s) return { list: [...e], dropped: [] };
  const i = [s, ...e.filter((a) => a.pubkey !== t)];
  return { list: i.slice(0, Bt.accounts), dropped: i.slice(Bt.accounts).map((a) => a.pubkey) };
}
function Sl(e, t, o) {
  return e.map((n) => n.pubkey === t ? _r({ ...n, name: dt(o.name) || n.name, picture: o.picture ?? n.picture, about: o.about ?? n.about }) ?? n : n);
}
const It = (e, t) => e.filter((o) => o.pubkey !== t);
async function j(e) {
  try {
    return _l(await e.get(Mn));
  } catch {
    return [];
  }
}
async function ke(e, t) {
  try {
    t.length === 0 ? await e.delete(Mn) : await e.set(Mn, JSON.stringify(t));
  } catch {
  }
}
const Pr = "bitlogin:lock:v1", Kl = "bitlogin/lock/device/v1", Al = q("bitlogin:lock:device-wrap:v1"), G = {
  pinMin: 6,
  pinMax: 64,
  /** Wrong tries, with the PIN or the device, before the record is removed. */
  tries: 5,
  /** Unused for this long, an unlocked session locks itself. In seconds. */
  idleSec: 900
}, Oe = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
};
function Us(e) {
  if (typeof e != "string") return null;
  const t = e.normalize("NFKC"), o = [...t].length;
  return o >= G.pinMin && o <= G.pinMax ? q(t) : null;
}
async function qs(e, t) {
  const o = D(12), n = await crypto.subtle.importKey("raw", Oe(e), "AES-GCM", !1, ["encrypt"]), r = await crypto.subtle.encrypt({ name: "AES-GCM", iv: Oe(o) }, n, Oe(t));
  return { iv: M(o), wrapped: M(new Uint8Array(r)) };
}
async function Fs(e, t) {
  try {
    const o = await crypto.subtle.importKey("raw", Oe(e), "AES-GCM", !1, ["decrypt"]), n = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: Oe(L(t.iv)) }, o, Oe(L(t.wrapped))));
    return n.length === 32 ? n : null;
  } catch {
    return null;
  }
}
const $s = (e) => gt(Zn(Al, e), Kl, 32), so = (e) => !!e && typeof e == "object" && typeof e.iv == "string" && typeof e.wrapped == "string";
async function pe(e) {
  let t;
  try {
    t = await e.get(Pr);
  } catch {
    return null;
  }
  if (!t) return null;
  try {
    const o = JSON.parse(t);
    return o.v !== 1 || typeof o.tries != "number" || !Number.isInteger(o.tries) || o.tries < 0 || !so(o.pin) || typeof o.pin.salt != "string" || o.device !== void 0 && (!so(o.device) || typeof o.device.credentialId != "string") ? null : { v: 1, tries: o.tries, pin: o.pin, ...o.device ? { device: o.device } : {} };
  } catch {
    return null;
  }
}
const vt = (e, t) => e.set(Pr, JSON.stringify(t));
async function st(e) {
  try {
    await e.delete(Pr);
  } catch {
  }
}
async function Rl(e, t, o) {
  const n = Us(t);
  if (!n) throw new Error(`A PIN is ${G.pinMin} to ${G.pinMax} characters.`);
  const r = o ? o.slice() : D(32), s = D(16), i = await mo(n, s);
  try {
    const a = o ? await pe(e) : null;
    await vt(e, { v: 1, tries: 0, pin: { salt: M(s), ...await qs(i, r) }, ...a?.device ? { device: a.device } : {} });
  } finally {
    i.fill(0), n.fill(0);
  }
  return r;
}
async function Cl(e, t, o, n) {
  const r = await pe(e);
  if (!r) throw new Error("The lock is not on.");
  if (n.length !== 32 || !/^[A-Za-z0-9_-]{8,1400}$/u.test(o)) throw new Error("That is not a device unlock.");
  const s = $s(n);
  try {
    await vt(e, { ...r, device: { credentialId: o, ...await qs(s, t) } });
  } finally {
    s.fill(0);
  }
}
async function Nl(e) {
  const t = await pe(e);
  t?.device && await vt(e, { v: 1, tries: t.tries, pin: t.pin });
}
async function Vs(e, t) {
  const o = await pe(e);
  if (!o) return { ok: !1, left: 0, removed: !0 };
  const n = o.tries + 1;
  await vt(e, { ...o, tries: n });
  const r = await t(o);
  return r ? (await vt(e, { ...o, tries: 0 }), { ok: !0, lockKey: r }) : n >= G.tries ? (await st(e), { ok: !1, left: 0, removed: !0 }) : { ok: !1, left: G.tries - n, removed: !1 };
}
function Tl(e, t) {
  return Vs(e, async (o) => {
    const n = Us(t);
    if (!n) return null;
    const r = await mo(n, L(o.pin.salt));
    try {
      return await Fs(r, o.pin);
    } finally {
      r.fill(0), n.fill(0);
    }
  });
}
function Ml(e, t) {
  return Vs(e, async (o) => {
    if (!o.device || t.length !== 32) return null;
    const n = $s(t);
    try {
      return await Fs(n, o.device);
    } finally {
      n.fill(0);
    }
  });
}
const it = "bitlogin:signer-grant:v1:", Ws = "bitlogin:signer-grant-device-key:v1", ue = {
  /** The longest a site BitLogin knows is remembered, in seconds: thirty days from Allow. */
  keepSec: 720 * 3600,
  /** The longest for a site it does not know: seven days. */
  unknownKeepSec: 168 * 3600,
  /** How many recent room passes are remembered, to count them across page loads. */
  passKept: 10,
  /** How many recent signatures are remembered, to count them across page loads. */
  signedKept: 60
}, pn = (e) => e.at ?? e.until - Bs(e.site), Bs = (e) => (Y(e) ? Ai(e) : Ii(e) !== null) ? ue.keepSec : ue.unknownKeepSec, Il = /^[0-9a-f]{64}$/u;
function Ke(e) {
  if (typeof e != "string" || e.length > 300 || e.includes("*")) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin === e ? t.origin : "";
  } catch {
    return "";
  }
}
const Sr = (e) => Y(e) || Ke(e), io = (e) => btoa(Array.from(e, (t) => String.fromCharCode(t)).join("")), ao = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), co = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}, Ll = (e) => Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
async function hn(e, t, o) {
  const n = Sr(t.site);
  if (!n || t.everydayPrivateKey.length !== 32 || typeof e.getOrCreateDeviceKey != "function" || Y(n) && t.permissions) return !1;
  const r = Math.min(Math.floor(t.until), Math.floor(o) + Bs(n));
  if (!(r > o)) return !1;
  const s = crypto.getRandomValues(new Uint8Array(12));
  try {
    const i = await e.getOrCreateDeviceKey(Ws), a = JSON.stringify({
      site: n,
      key: Ll(t.everydayPrivateKey),
      until: r,
      ...t.name ? { name: t.name.slice(0, 48) } : {},
      ...fe(t.profile) ? { profile: fe(t.profile) } : {},
      // An application's public signatures are counted up to its own hourly limit, so more of them are kept.
      signed: t.signed.filter((d) => Number.isFinite(d)).slice(-(t.permissions ? qt.public.hourly : ue.signedKept)),
      ...t.permissions ? { permissions: t.permissions } : {},
      ...!t.permissions && !Y(n) && ye(t.more).length ? { more: ye(t.more) } : {},
      ...typeof t.at == "number" ? { at: Math.floor(t.at) } : {},
      ...X(t.relays).length ? { relays: X(t.relays) } : {},
      ...typeof t.checkedAt == "number" ? { checkedAt: Math.floor(t.checkedAt) } : {},
      ...typeof t.seenAt == "number" ? { seenAt: Math.floor(t.seenAt) } : {},
      ...t.signedPass?.length ? { signedPass: t.signedPass.filter((d) => Number.isFinite(d)).slice(-ue.passKept) } : {},
      ...t.permissions && t.signedSensitive ? { signedSensitive: t.signedSensitive.filter((d) => Number.isFinite(d)).slice(-qt.sensitive.hourly) } : {}
    }), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: s }, i, new TextEncoder().encode(a)), l = { v: 1, iv: io(s), ciphertext: io(new Uint8Array(c)) };
    return await e.set(it + n, JSON.stringify(l)), !0;
  } catch {
    return !1;
  }
}
async function Kt(e, t, o) {
  const n = Sr(t);
  if (!n || typeof e.getOrCreateDeviceKey != "function") return null;
  try {
    const r = await e.get(it + n);
    if (!r) return null;
    const s = JSON.parse(r);
    if (s.v !== 1 || typeof s.iv != "string" || typeof s.ciphertext != "string") return null;
    const i = await e.getOrCreateDeviceKey(Ws), a = await crypto.subtle.decrypt({ name: "AES-GCM", iv: co(ao(s.iv)) }, i, co(ao(s.ciphertext))), c = JSON.parse(new TextDecoder().decode(a)), l = (p) => typeof p == "number" && Number.isFinite(p) && p > 0 ? Math.floor(p) : void 0, d = fe(c.profile), y = c.permissions === void 0 ? void 0 : nr(c.permissions);
    if (y === null || y && (Y(n) || !rr(n, y)))
      return await e.delete(it + n), null;
    const f = (p, m) => Array.isArray(p) ? p.filter((g) => typeof g == "number" && Number.isFinite(g)).slice(-m) : [];
    return c.site !== n || typeof c.key != "string" || !Il.test(c.key) || typeof c.until != "number" ? null : !(c.until > o) || c.until > o + ue.keepSec ? (await e.delete(it + n), null) : {
      site: n,
      everydayPrivateKey: Uint8Array.from(c.key.match(/.{2}/gu) ?? [], (p) => Number.parseInt(p, 16)),
      until: c.until,
      ...typeof c.name == "string" && c.name ? { name: c.name.slice(0, 48) } : {},
      ...d ? { profile: d } : {},
      signed: f(c.signed, y ? qt.public.hourly : ue.signedKept),
      ...f(c.signedPass, ue.passKept).length ? { signedPass: f(c.signedPass, ue.passKept) } : {},
      ...!y && !Y(n) && ye(c.more).length ? { more: ye(c.more) } : {},
      ...l(c.at) ? { at: l(c.at) } : {},
      ...X(c.relays).length ? { relays: X(c.relays) } : {},
      ...l(c.checkedAt) ? { checkedAt: l(c.checkedAt) } : {},
      ...l(c.seenAt) ? { seenAt: l(c.seenAt) } : {},
      ...y ? { permissions: y, signedSensitive: f(c.signedSensitive, qt.sensitive.hourly) } : {}
    };
  } catch {
    return null;
  }
}
async function At(e, t) {
  const o = Sr(t);
  if (o)
    try {
      await e.delete(it + o);
    } catch {
    }
}
const js = "bitlogin:signer-handoff:v1", Ol = /* @__PURE__ */ new Set([
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
]), In = /^[0-9a-f]{64}$/;
function Dl(e) {
  return Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
}
function xl(e) {
  return Uint8Array.from(e.match(/.{2}/g) ?? [], (t) => Number.parseInt(t, 16));
}
function Ul(e, t, o, n, r = {}) {
  if (!In.test(t)) throw new Error("The hand-off has no usable recipient key.");
  if (e.length !== 32) throw new Error("No identity is unlocked in this session.");
  let s = null;
  if (n !== void 0) {
    const f = Ke(n.site), p = nr(n.permissions);
    if (!f || !p || !rr(f, p)) throw new Error("That is not a permission set an application may be given.");
    s = { site: f, permissions: p };
  }
  const i = r.site === void 0 ? "" : Ke(r.site);
  if (r.site !== void 0 && (!i || s && s.site !== i)) throw new Error("The hand-off names no usable site.");
  const a = fe(r.profile), c = !!i && r.visitOnly !== !0 && r.remember === !0, l = r.family === void 0 ? "" : Y(r.family);
  if (r.family !== void 0 && (!l || s || !c || !Ie(i, l))) throw new Error("That is not a family this site may be allowed as.");
  const d = ye(r.more);
  if (r.more !== void 0 && (d.length === 0 || !i || s || l)) throw new Error("That is not something this site may be let do.");
  const y = new ce(o.slice());
  try {
    const f = JSON.stringify({ v: 1, purpose: js, key: Dl(e), ...s ? { app: s } : {}, ...i ? { site: i } : {}, ...a ? { profile: a } : {}, ...c ? { remember: !0 } : {}, ...typeof r.at == "number" && Number.isFinite(r.at) ? { at: Math.floor(r.at) } : {}, ...X(r.relays).length ? { relays: X(r.relays) } : {}, ...l ? { family: l } : {}, ...d.length ? { more: d } : {} });
    return { senderPublicKey: y.getPublicKey(), payload: y.nip44Encrypt(t, f) };
  } finally {
    y.destroy();
  }
}
function ql(e, t) {
  if (!e || !In.test(e.senderPublicKey) || typeof e.payload != "string")
    throw new Error("That is not a signer hand-off.");
  const o = new ce(t.slice());
  let n;
  try {
    n = o.nip44Decrypt(e.senderPublicKey, e.payload);
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
  if (r.v !== 1 || r.purpose !== js || typeof r.key != "string" || !In.test(r.key))
    throw new Error("That is not a signer hand-off.");
  const s = xl(r.key);
  try {
    _(s);
  } catch {
    throw s.fill(0), new Error("The hand-off carried an unusable key.");
  }
  const i = r.site === void 0 ? null : Ke(r.site);
  if (i === "")
    throw s.fill(0), new Error("The hand-off names no usable site.");
  const a = fe(r.profile), c = r.remember === !0 && !!i, l = typeof r.at == "number" && Number.isFinite(r.at) && r.at > 0 ? Math.floor(r.at) : null, d = X(r.relays), y = r.family === void 0 ? null : Y(r.family);
  if (y === "" || y && (r.app !== void 0 || !c || !Ie(i, y)))
    throw s.fill(0), new Error("The hand-off names a family it cannot be kept for.");
  const f = ye(r.more);
  if (r.more !== void 0 && (f.length === 0 || !i || y || r.app !== void 0))
    throw s.fill(0), new Error("The hand-off carries something this site may not be let do.");
  if (r.app === void 0) return { key: s, app: null, site: i, profile: a, remember: c, at: l, relays: d, family: y, more: f };
  const p = r.app, m = p && typeof p == "object" ? Ke(p.site) : "", g = p && typeof p == "object" ? nr(p.permissions) : null;
  if (!m || !g || !rr(m, g) || i && i !== m)
    throw s.fill(0), new Error("The hand-off carried a permission set that cannot be read.");
  return { key: s, app: { site: m, permissions: g }, site: m, profile: a, remember: c, at: l, relays: d, family: null, more: [] };
}
const Js = 38e3, Gs = "38172", Fl = ["https://testnut.cashu.space", "https://nofees.testnut.cashu.space"], $l = 8;
function Vl(e, t, o = 10) {
  const n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  for (const s of e)
    if (!(s.kind !== Js || !s.tags.some((i) => i[0] === "k" && i[1] === Gs)))
      for (const i of s.tags) {
        if (i[0] !== "u" || i[2] !== void 0 && i[2] !== "cashu") continue;
        const a = yt(i[1]);
        if (!a || !a.startsWith("https://") || Fl.includes(a)) continue;
        const c = r.get(s.pubkey) ?? /* @__PURE__ */ new Set();
        !c.has(a) && c.size >= $l || (c.add(a), r.set(s.pubkey, c), (n.get(a) ?? n.set(a, /* @__PURE__ */ new Set()).get(a)).add(s.pubkey));
      }
  return [...n].map(([s, i]) => ({ mint: s, by: i.size, byFollowed: [...i].filter((a) => t.has(a)).length })).filter((s) => s.by >= 2 || s.byFollowed >= 1).sort((s, i) => i.byFollowed - s.byFollowed || i.by - s.by || s.mint.localeCompare(i.mint)).slice(0, o);
}
const Ln = 30078, On = "bitlogin-receipt:", jt = 300, Jt = "bitlogin:receipts:v1:";
function Kr(e, t) {
  const o = e, n = o?.event;
  if (!n || typeof n != "object" || n.kind !== 30078 || typeof n.content != "string" || n.content.length > 8e3 || !Array.isArray(n.tags) || !A(n)) return null;
  try {
    if (JSON.parse(n.content).buyerPubkey !== t) return null;
  } catch {
    return null;
  }
  return {
    event: { id: n.id, pubkey: n.pubkey, created_at: n.created_at, kind: n.kind, tags: n.tags.map((r) => r.map(String)), content: n.content, sig: n.sig },
    title: typeof o?.title == "string" ? o.title.slice(0, 80) : "",
    via: Ut(o?.via) || ""
  };
}
async function Ar(e, t) {
  const o = t.getPublicKey(), n = /* @__PURE__ */ new Map(), r = async (i) => {
    try {
      const a = await e.get(i);
      return a ? JSON.parse(t.nip44Decrypt(o, a)) : null;
    } catch {
      return null;
    }
  }, s = await r(Jt + o);
  for (const i of Array.isArray(s?.ids) ? s.ids.slice(0, jt) : []) {
    if (typeof i != "string") continue;
    const a = await r(`${Jt}${o}:${i}`), c = Kr(a, o);
    c && c.event.id === i && n.set(i, { ...c, saved: a?.saved === !0 });
  }
  return n;
}
async function Rr(e, t, o, n) {
  const r = t.getPublicKey(), s = (i) => t.nip44Encrypt(r, JSON.stringify(i));
  for (const i of n) {
    const a = o.get(i);
    a && await e.set(`${Jt}${r}:${i}`, s(a));
  }
  await e.set(Jt + r, s({ ids: [...o.keys()] }));
}
const Gt = (e, t) => ({
  receipts: [...e.values()].map(({ event: o, title: n, via: r }) => ({ event: o, title: n, via: r })).sort((o, n) => n.event.created_at - o.event.created_at),
  offline: t,
  unsaved: [...e.values()].some((o) => !o.saved)
});
async function Hs(e, t) {
  const { signer: o, store: n, relays: r } = e, s = o.getPublicKey(), i = Math.floor(e.now ?? Date.now() / 1e3), a = [];
  for (const [c, l] of t) {
    if (l.saved) continue;
    const d = o.signEvent({ kind: Ln, created_at: i, tags: [["d", On + c]], content: o.nip44Encrypt(s, JSON.stringify({ v: 1, event: l.event, title: l.title, via: l.via })) });
    x(await r.publishAll(d, 6e3).catch(() => [])) >= Math.min(2, r.relayUrls.length) && (l.saved = !0, a.push(c));
  }
  a.length && await Rr(n, o, t, a);
}
async function Wl(e) {
  return Gt(await Ar(e.store, e.signer), !0);
}
async function Bl(e) {
  const { signer: t, store: o, relays: n } = e, r = t.getPublicKey(), s = await Ar(o, t), i = await n.queryQuorum({ kinds: [Ln], authors: [r], limit: 500 }, 6e3).catch(() => null);
  if (!i || i.respondedCount === 0) return Gt(s, !0);
  const a = /* @__PURE__ */ new Set(), c = [];
  for (const l of i.outcomes.flatMap((d) => d.events)) {
    if (l.kind !== Ln || l.pubkey !== r || !A(l)) continue;
    const d = l.tags.find((f) => f[0] === "d")?.[1];
    if (typeof d != "string" || !d.startsWith(On)) continue;
    let y;
    try {
      y = Kr(JSON.parse(t.nip44Decrypt(r, l.content)), r);
    } catch {
      continue;
    }
    !y || y.event.id !== d.slice(On.length) || (a.add(y.event.id), !(s.has(y.event.id) || s.size >= jt) && (s.set(y.event.id, { ...y, saved: !0 }), c.push(y.event.id)));
  }
  for (const [l, d] of s)
    a.has(l) !== d.saved && (d.saved = a.has(l), c.push(l));
  return await Rr(o, t, s, c), await Hs(e, s), Gt(s, !1);
}
async function jl(e, t) {
  const { signer: o, store: n } = e, r = o.getPublicKey(), s = Array.isArray(t) ? t.slice(0, jt).map((c) => Kr(c, r)) : [];
  if (s.length === 0 || s.some((c) => !c)) throw new Error("That is not a receipt of this account's.");
  const i = await Ar(n, o), a = [];
  for (const c of s)
    if (!i.has(c.event.id)) {
      if (i.size >= jt) throw new Error("This account keeps as many receipts as it can.");
      i.set(c.event.id, { ...c, saved: !1 }), a.push(c.event.id);
    }
  return await Rr(n, o, i, a), await Hs(e, i).catch(() => {
  }), Gt(i, !1);
}
function zs(e) {
  const t = e;
  if (!t || typeof t != "object") return null;
  const o = Co(t.listing);
  if (!o || typeof t.order != "string" || !/^order_[A-Za-z0-9_-]{12,80}$/u.test(t.order) || typeof t.key != "string" || !/^[A-Za-z0-9_-]{16,128}$/u.test(t.key)) return null;
  const n = Ut(t.service);
  return n ? { listing: o, order: t.order, key: t.key, service: n, title: typeof t.title == "string" ? t.title.slice(0, 80) : "", via: Ut(t.via) || "", client: typeof t.client == "string" && /^[0-9a-f]{64}$/u.test(t.client) ? t.client : "", at: typeof t.at == "number" && Number.isFinite(t.at) ? t.at : 0 } : null;
}
const Qs = (e) => Array.isArray(e) ? e.map(zs).filter((t) => !!t).slice(-20) : [], Dn = 30078, xn = "bitlogin-pay-settings", Ys = "bitlogin:pay-settings:v1:";
async function Xs({ signer: e, store: t }) {
  const o = e.getPublicKey();
  try {
    const n = await t.get(Ys + o), r = n ? JSON.parse(e.nip44Decrypt(o, n)) : null;
    return r && typeof r.at == "number" ? { limitSats: or(r.limitSats), orders: Qs(r.orders), at: r.at, saved: r.saved === !0 } : null;
  } catch {
    return null;
  }
}
const Ht = ({ signer: e, store: t }, o) => t.set(Ys + e.getPublicKey(), e.nip44Encrypt(e.getPublicKey(), JSON.stringify(o)));
async function Zs(e, t) {
  const { signer: o, relays: n } = e, r = o.getPublicKey(), s = o.signEvent({ kind: Dn, created_at: Math.floor(t.at), tags: [["d", xn]], content: o.nip44Encrypt(r, JSON.stringify({ v: 1, limitSats: t.limitSats, orders: t.orders, at: t.at })) });
  return x(await n.publishAll(s, 5e3).catch(() => [])) >= Math.min(2, n.relayUrls.length);
}
async function Jl(e) {
  const { signer: t, relays: o } = e, n = t.getPublicKey();
  let r = await Xs(e);
  const s = await o.queryQuorum({ kinds: [Dn], authors: [n], "#d": [xn], limit: 2 }, 3e3).catch(() => null);
  if (s && s.respondedCount > 0) {
    const i = s.outcomes.flatMap((c) => c.events).filter((c) => c.kind === Dn && c.pubkey === n && c.tags.some((l) => l[0] === "d" && l[1] === xn) && A(c)).sort((c, l) => l.created_at - c.created_at)[0];
    let a = null;
    try {
      const c = i ? JSON.parse(t.nip44Decrypt(n, i.content)) : null;
      c && (a = { limitSats: or(c.limitSats), orders: Qs(c.orders), at: typeof c.at == "number" ? c.at : i.created_at, saved: !0 });
    } catch {
      a = null;
    }
    a && (!r || a.at > r.at) ? (r = a, await Ht(e, r)) : r && (!r.saved || !a) && (r.saved = await Zs(e, r), await Ht(e, r));
  }
  return { limitSats: r?.limitSats ?? Ro.default, orders: r?.orders ?? [], unsaved: !!r && !r.saved };
}
async function Gl(e, t) {
  const o = t ?? {}, n = await Xs(e), r = { limitSats: n?.limitSats ?? Ro.default, orders: n?.orders ?? [], at: e.now ?? Date.now() / 1e3, saved: !1 };
  if (o.limitSats !== void 0) {
    if (or(o.limitSats) !== o.limitSats) throw new Error("That is not a limit this wallet keeps.");
    r.limitSats = o.limitSats;
  } else if (o.addOrder !== void 0) {
    const s = zs({ ...o.addOrder, at: r.at });
    if (!s) throw new Error("That is not an order this wallet can keep.");
    r.orders = [...r.orders.filter((i) => !(i.listing === s.listing && i.service === s.service)), s].slice(-20);
  } else if (typeof o.removeOrder == "string")
    r.orders = r.orders.filter((s) => s.order !== o.removeOrder);
  else throw new Error("That is not a change this wallet keeps.");
  return await Ht(e, r), r.saved = await Zs(e, r).catch(() => !1), r.saved && await Ht(e, r), { limitSats: r.limitSats, orders: r.orders, unsaved: !r.saved };
}
const Hl = { enough: 2, graceMs: 700 };
function zl(e, t, o = Hl) {
  const n = e.map((s) => t(s)), r = (s, i) => new Promise((a) => {
    const c = [];
    let l = n.length, d = 0, y = null, f = !1;
    const p = () => {
      f || (f = !0, y && clearTimeout(y), a(c));
    };
    if (l === 0) return p();
    for (const m of n)
      s(m).then((g) => {
        f || (c.push(g), i(g) && d++);
      }).catch(() => {
      }).finally(() => {
        if (l--, l === 0) return p();
        d >= Math.min(o.enough, n.length) && !y && (y = setTimeout(p, o.graceMs));
      });
  });
  return {
    relayUrls: [...e],
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
const Un = 30078, qn = "bitlogin-drive:", Ze = 10063, Ql = 24242, at = "bitlogin:drive:v1:", Yl = { autoPaySats: 0, at: 0, saved: !0 }, Cr = (e) => {
  const t = e?.autoPaySats;
  return { autoPaySats: typeof t == "number" && Number.isSafeInteger(t) && t >= 0 && t <= 1e5 ? t : 0 };
};
async function Nr(e, t) {
  const o = t.getPublicKey(), n = { folders: /* @__PURE__ */ new Map(), removed: /* @__PURE__ */ new Map(), settings: { ...Yl } }, r = async (a) => {
    try {
      const c = await e.get(a);
      return c ? JSON.parse(t.nip44Decrypt(o, c)) : null;
    } catch {
      return null;
    }
  }, s = await r(at + o);
  if (!s) return n;
  for (const a of Array.isArray(s.folders) ? s.folders.slice(0, ir.folders + 1) : []) {
    if (typeof a != "string") continue;
    const c = await r(`${at}${o}:${a}`), l = sr(c?.folder);
    l && n.folders.set(l.id, { folder: l, saved: c?.saved === !0 });
  }
  for (const a of Array.isArray(s.removed) ? s.removed : [])
    Array.isArray(a) && typeof a[0] == "string" && typeof a[1] == "number" && n.removed.set(a[0], a[1]);
  const i = s.settings;
  return n.settings = { ...Cr(i), at: typeof i?.at == "number" ? i.at : 0, saved: i?.saved !== !1 }, n;
}
async function Tr(e, t, o, n, r = []) {
  const s = t.getPublicKey(), i = (a) => t.nip44Encrypt(s, JSON.stringify(a));
  for (const a of n) {
    const c = o.folders.get(a);
    c && await e.set(`${at}${s}:${a}`, i(c));
  }
  for (const a of r) await e.delete(`${at}${s}:${a}`).catch(() => {
  });
  await e.set(at + s, i({ folders: [...o.folders.keys()], removed: [...o.removed], settings: o.settings }));
}
const vn = (e, t) => x(e) >= Math.min(2, t);
function wn(e, t, o, n) {
  const r = e.getPublicKey();
  return e.signEvent({ kind: Un, created_at: Math.floor(n), tags: [["d", qn + t]], content: e.nip44Encrypt(r, JSON.stringify(o)) });
}
const zt = (e, t) => ({
  folders: [...e.folders.values()].map((o) => o.folder),
  settings: { autoPaySats: e.settings.autoPaySats },
  offline: t,
  unsaved: [...e.folders.values()].some((o) => !o.saved) || e.removed.size > 0 || !e.settings.saved
});
async function ei(e, t) {
  const { signer: o, store: n, relays: r } = e, s = e.now ?? Date.now() / 1e3, i = [];
  for (const [a, c] of t.folders)
    c.saved || !vn(await r.publishAll(wn(o, a, { v: 1, folder: c.folder }, Math.max(s, c.folder.at)), 6e3).catch(() => []), r.relayUrls.length) || (c.saved = !0, i.push(a));
  for (const [a, c] of [...t.removed])
    vn(await r.publishAll(wn(o, a, { v: 1, deleted: !0, at: c }, Math.max(s, c)), 6e3).catch(() => []), r.relayUrls.length) && t.removed.delete(a);
  t.settings.saved || vn(await r.publishAll(wn(o, "settings", { v: 1, settings: { autoPaySats: t.settings.autoPaySats }, at: t.settings.at }, Math.max(s, t.settings.at)), 6e3).catch(() => []), r.relayUrls.length) && (t.settings.saved = !0), await Tr(n, o, t, i);
}
async function Xl(e) {
  return zt(await Nr(e.store, e.signer), !0);
}
async function Zl(e) {
  const { signer: t, store: o, relays: n } = e, r = t.getPublicKey(), s = await Nr(o, t), i = await n.queryQuorum({ kinds: [Un], authors: [r], limit: 500 }, 6e3).catch(() => null);
  if (!i || i.respondedCount === 0) return zt(s, !0);
  const a = /* @__PURE__ */ new Map();
  for (const d of i.outcomes.flatMap((y) => y.events)) {
    if (d.kind !== Un || d.pubkey !== r || !A(d)) continue;
    const y = d.tags.find((p) => p[0] === "d")?.[1];
    if (typeof y != "string" || !y.startsWith(qn)) continue;
    const f = y.slice(qn.length);
    (!a.has(f) || a.get(f).created_at < d.created_at) && a.set(f, d);
  }
  const c = [], l = [];
  for (const [d, y] of a) {
    let f;
    try {
      f = JSON.parse(t.nip44Decrypt(r, y.content));
    } catch {
      continue;
    }
    if (d === "settings") {
      const g = typeof f.at == "number" ? f.at : y.created_at;
      (s.settings.saved || g > s.settings.at) && (s.settings = { ...Cr(f.settings), at: g, saved: !0 });
      continue;
    }
    const p = s.folders.get(d);
    if (f.deleted === !0) {
      const g = typeof f.at == "number" ? f.at : y.created_at;
      p && (p.saved || p.folder.at <= g) && (s.folders.delete(d), l.push(d)), s.removed.delete(d);
      continue;
    }
    const m = sr(f.folder);
    !m || m.id !== d || s.removed.has(d) || p && !p.saved && p.folder.at >= m.at || p && p.saved && p.folder.at >= m.at || (s.folders.set(d, { folder: m, saved: !0 }), c.push(d));
  }
  for (const [d, y] of s.folders) a.has(d) || (y.saved = !1);
  return await Tr(o, t, s, c, l), await ei(e, s), zt(s, !1);
}
async function eu(e, t) {
  const { signer: o, store: n } = e, r = e.now ?? Date.now() / 1e3, s = (t.save ?? []).map(sr);
  if (s.some((l) => !l)) throw new Error("That is not a folder this drive can keep.");
  const i = await Nr(n, o), a = [], c = [];
  for (const l of s)
    i.folders.set(l.id, { folder: l, saved: !1 }), i.removed.delete(l.id), a.push(l.id);
  for (const l of t.remove ?? [])
    typeof l != "string" || !/^[0-9a-f]{16}$/u.test(l) || (i.folders.delete(l), i.removed.set(l, Math.floor(r)), c.push(l));
  if (i.folders.size > ir.folders + 1) throw new Error("There are too many folders.");
  return t.settings !== void 0 && (i.settings = { ...Cr(t.settings), at: Math.floor(r), saved: !1 }), await Tr(n, o, i, a, c), await ei(e, i), zt(i, !1);
}
function tu(e, t, o = Date.now() / 1e3) {
  const n = ar(t.server), r = t.verb;
  if (!n || r !== "upload" && r !== "delete" && r !== "get") throw new Error("That is not something a file server is asked.");
  const s = typeof t.sha256 == "string" && /^[0-9a-f]{64}$/u.test(t.sha256) ? t.sha256 : "";
  if (!s) throw new Error("A permission note names the one file it is for.");
  const i = e.signEvent({
    kind: Ql,
    // In the past, as a server requires, by a margin wider than two clocks usually differ.
    created_at: Math.floor(o) - 30,
    tags: [["t", r], ["expiration", String(Math.floor(o) + 300)], ["server", new URL(n).hostname.toLowerCase()], ["x", s]],
    content: r === "upload" ? "Upload a file" : r === "delete" ? "Delete a file" : "Fetch a file"
  }), a = new TextEncoder().encode(JSON.stringify(i));
  let c = "";
  for (const l of a) c += String.fromCharCode(l);
  return btoa(c).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}
const ti = (e) => [...new Set(e.tags.filter((t) => t[0] === "server").map((t) => ar(t[1])).filter(Boolean))];
function nu(e, t, o = 12) {
  const n = /* @__PURE__ */ new Map();
  for (const s of e) s.kind === Ze && (!n.has(s.pubkey) || n.get(s.pubkey).created_at < s.created_at) && n.set(s.pubkey, s);
  const r = /* @__PURE__ */ new Map();
  for (const s of n.values()) for (const i of ti(s).filter((a) => a.startsWith("https://")).slice(0, 6)) (r.get(i) ?? r.set(i, /* @__PURE__ */ new Set()).get(i)).add(s.pubkey);
  return [...r].map(([s, i]) => ({ server: s, by: i.size, byFollowed: [...i].filter((a) => t.has(a)).length })).filter((s) => s.by >= 2 || s.byFollowed >= 1).sort((s, i) => i.byFollowed - s.byFollowed || i.by - s.by || s.server.localeCompare(i.server)).slice(0, o);
}
const ni = "bitlogin:ecash:v1:", Mr = (e) => e.startsWith("local:"), ru = () => `local:${Array.from(crypto.getRandomValues(new Uint8Array(8)), (e) => e.toString(16).padStart(2, "0")).join("")}`;
async function on(e, t) {
  const o = t.getPublicKey();
  try {
    const n = await e.get(ni + o);
    if (!n) return { wallet: null, tokens: [] };
    const r = JSON.parse(t.nip44Decrypt(o, n)), s = typeof r.wallet == "string" ? No(r.wallet) : null, i = [];
    for (const a of Array.isArray(r.tokens) ? r.tokens : []) {
      const c = a, l = Mo(c.proofs);
      typeof c.event == "string" && c.event.length <= 80 && yt(c.mint) && l?.length && i.push({ event: c.event, mint: yt(c.mint), proofs: l });
    }
    return { wallet: s, tokens: i };
  } catch {
    return { wallet: null, tokens: [] };
  }
}
async function Qt(e, t, o) {
  const n = t.getPublicKey();
  await e.set(ni + n, t.nip44Encrypt(n, JSON.stringify({ wallet: o.wallet ? To(o.wallet) : null, tokens: o.tokens })));
}
const Yt = (e, t) => x(e) >= Math.min(2, t);
function ri(e, t, o) {
  const n = e.getPublicKey();
  return e.signEvent({ kind: ot, created_at: Math.floor(o), tags: [], content: e.nip44Encrypt(n, xi(t)) });
}
const Ve = (e, t) => ({ mints: e.wallet?.mints ?? [], tokens: e.tokens, offline: t, unsaved: e.tokens.some((o) => Mr(o.event)) });
async function ou(e) {
  return Ve(await on(e.store, e.signer), !0);
}
async function su(e) {
  const { signer: t, store: o, relays: n } = e, r = t.getPublicKey(), s = await on(o, t), [i, a, c] = await Promise.all([
    n.queryQuorum({ kinds: [Rn], authors: [r], limit: 2 }, 5e3),
    n.queryQuorum({ kinds: [ot], authors: [r], limit: ft.tokens }, 6e3),
    n.queryQuorum({ kinds: [5], authors: [r], "#k": [String(ot)], limit: ft.tokens }, 6e3)
  ]).catch(() => [null, null, null]);
  if (!a || !i || !c || a.respondedCount === 0) return Ve(s, !0);
  const l = (h, E) => h.filter((T) => T.kind === E && T.pubkey === r && A(T)), d = (h) => {
    try {
      return t.nip44Decrypt(r, h.content);
    } catch {
      return null;
    }
  }, y = l(i.outcomes.flatMap((h) => h.events), Rn).sort((h, E) => E.created_at - h.created_at)[0], f = y && No(d(y) ?? "") || s.wallet, p = new Set(l(c.outcomes.flatMap((h) => h.events), 5).flatMap((h) => h.tags.filter((E) => E[0] === "e" && typeof E[1] == "string").map((E) => E[1]))), m = /* @__PURE__ */ new Map();
  for (const h of l(a.outcomes.flatMap((E) => E.events), ot)) m.set(h.id, h);
  const g = [...m.values()].flatMap((h) => {
    const E = Li(d(h) ?? "");
    return E ? [{ event: h.id, created_at: h.created_at, ...E }] : [];
  }), b = Oi(g, p), v = new Set(b.flatMap((h) => h.proofs.map((E) => E.secret))), k = { wallet: f, tokens: [...b] };
  for (const h of s.tokens.filter((E) => Mr(E.event))) {
    const E = h.proofs.filter((Z) => !v.has(Z.secret));
    if (E.length === 0) continue;
    const T = ri(t, { mint: h.mint, proofs: E }, e.now ?? Date.now() / 1e3), F = Yt(await n.publishAll(T, 6e3).catch(() => []), n.relayUrls.length);
    k.tokens.push({ event: F ? T.id : h.event, mint: h.mint, proofs: E });
  }
  return await Qt(o, t, k), Ve(k, !1);
}
async function iu(e, t) {
  const { signer: o, store: n, relays: r } = e, s = o.getPublicKey(), i = [...new Set((Array.isArray(t) ? t : []).map(yt).filter(Boolean))];
  if (i.length === 0 || i.length > ft.mints) throw new Error("Name between one and five mints, each an https address.");
  const a = await on(n, o), c = { privkey: a.wallet?.privkey ?? e.newKey(), mints: i }, l = { wallet: c, tokens: a.tokens };
  await Qt(n, o, l);
  const d = o.signEvent({ kind: Rn, created_at: Math.floor(e.now ?? Date.now() / 1e3), tags: [], content: o.nip44Encrypt(s, To(c)) });
  if (!Yt(await r.publishAll(d, 6e3).catch(() => []), r.relayUrls.length)) throw new Error("The wallet was saved in this browser, but no relay took it. Try again when you are online.");
  return Ve(l, !1);
}
async function au(e, t, o) {
  const { signer: n, store: r, relays: s } = e, i = e.now ?? Date.now() / 1e3, a = new Set(t.destroy.filter((h) => typeof h == "string" && h.length <= 80)), c = t.keep.map((h) => ({ mint: yt(h.mint), proofs: Mo(h.proofs, 5e3) }));
  if (c.some((h) => !h.mint || !h.proofs)) throw new Error("That is not ecash this wallet can keep.");
  const l = await on(r, n), d = c.flatMap((h) => {
    const E = [];
    for (let T = 0; T < h.proofs.length; T += ft.proofsWritten) E.push({ event: ru(), mint: h.mint, proofs: h.proofs.slice(T, T + ft.proofsWritten) });
    return E;
  }), y = { wallet: l.wallet, tokens: [...l.tokens.filter((h) => !a.has(h.event)), ...d] };
  await Qt(r, n, y), o?.(Ve(y, !1));
  const f = [...a].filter((h) => !Mr(h)), p = d.map((h, E) => ri(n, { mint: h.mint, proofs: h.proofs, ...f.length && E === 0 ? { del: f } : {} }, i)), m = n.getPublicKey(), g = t.history && Number.isSafeInteger(t.history.amount) && t.history.amount > 0 ? n.signEvent({ kind: qr, created_at: Math.floor(i), tags: [], content: n.nip44Encrypt(m, Di({ ...t.history, created: p.map((h) => h.id), destroyed: f })) }) : null, [b, v] = await Promise.all([
    Promise.all(p.map(async (h) => Yt(await s.publishAll(h, 6e3).catch(() => []), s.relayUrls.length))),
    g ? s.publishAll(g, 6e3).then((h) => Yt(h, s.relayUrls.length)).catch(() => !1) : Promise.resolve(!1)
  ]);
  for (const [h, E] of d.entries()) b[h] && (E.event = p[h].id);
  await Qt(r, n, y);
  const k = b.every(Boolean);
  if (g && v && !k) {
    const h = n.signEvent({ kind: 5, created_at: Math.floor(i), tags: [["e", g.id], ["k", String(qr)]], content: "" });
    await s.publishAll(h, 6e3).catch(() => []);
  }
  if (f.length && k) {
    const h = n.signEvent({ kind: 5, created_at: Math.floor(i), tags: [...f.map((E) => ["e", E]), ["k", String(ot)]], content: "" });
    await s.publishAll(h, 6e3).catch(() => []);
  }
  return Ve(y, !1);
}
const oi = "bitlogin:session-public:v1";
async function cu(e, t) {
  try {
    const o = {
      pubkey: t.pubkey,
      npub: t.npub,
      ...t.name ? { name: t.name } : {}
    };
    await e.set(oi, JSON.stringify(o));
  } catch {
  }
}
async function He(e) {
  try {
    await e.delete(oi);
  } catch {
  }
}
const lo = (e) => e.then(
  () => {
  },
  () => {
  }
);
class lu {
  alone = Promise.resolve();
  lanes = /* @__PURE__ */ new Map();
  run(t, o) {
    if (t === null) {
      const i = Promise.all([this.alone, ...this.lanes.values()]).then(o, o);
      return this.alone = lo(i), this.lanes.clear(), i;
    }
    const r = Promise.all([this.alone, this.lanes.get(t) ?? Promise.resolve()]).then(o, o);
    return this.lanes.set(t, lo(r)), r;
  }
}
const uu = 3 * 6e4;
class du {
  constructor(t, o = Date.now, n = (r, s) => new tn(r, { connectTimeoutMs: s })) {
    this.connectTimeoutMs = t, this.now = o, this.open = n;
  }
  connections = /* @__PURE__ */ new Map();
  failedAt = /* @__PURE__ */ new Map();
  /** The kept connection to a relay, opened the first time it is wanted. */
  connectionFor = (t) => {
    let o = this.connections.get(t);
    return o || (o = this.open(t, this.connectTimeoutMs), this.connections.set(t, o)), o;
  };
  /** Whether this relay failed within the memory's time. */
  notWaitedFor = (t) => {
    const o = this.failedAt.get(t);
    return o === void 0 ? !1 : this.now() - o < uu ? !0 : (this.failedAt.delete(t), !1);
  };
  /**
   * What a relay did when it was tried. A failure is remembered, and its connection dropped, so the next try after the
   * memory's time starts afresh. An answer clears what was remembered.
   */
  heard = (t, o) => {
    if (o) {
      this.failedAt.delete(t);
      return;
    }
    this.failedAt.set(t, this.now()), this.connections.get(t)?.close(), this.connections.delete(t);
  };
  /** The session is gone: every connection is closed, and nothing is remembered. */
  closeAll() {
    for (const t of this.connections.values()) t.close();
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
let ve = null, K = [...Oo], I = [...Do];
const w = new fl();
let Fn = !1, $n = !1;
function uo(e) {
  Fn || (K = e.vaultRelays), $n || (I = e.discoveryRelays);
}
const yu = new lu(), fu = {
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
let R = null, gn = Date.now();
const pu = /* @__PURE__ */ new Set(["configure", "lockStatus", "lockOpen", "restoreSession", "getSessionStatus", "logout"]), si = "bitlogin:taken-back:v1:";
async function hu(e) {
  try {
    const t = await w.get(si + e);
    return (t ? So(JSON.parse(t)) : null) ?? Kn;
  } catch {
    return Kn;
  }
}
function yo(e, t) {
  try {
    return So(JSON.parse(e.nip44Decrypt(e.getPublicKey(), t)));
  } catch {
    return null;
  }
}
function ze() {
  V(), R && P(R), R = null;
}
async function Ne() {
  const e = await pe(w);
  return e ? {
    on: !0,
    // Locked with nothing in the active slot too, where other accounts are kept: theirs are sealed under it.
    locked: !R && (await Mt(w) === "locked" || (await j(w)).length > 0),
    device: !!e.device,
    ...e.device ? { credentialId: e.device.credentialId } : {},
    triesLeft: Math.max(0, G.tries - e.tries)
  } : { on: !1, locked: !1, device: !1, triesLeft: 0 };
}
function S() {
  if (!u.signer || !u.everydayPrivateKey)
    throw new Error("No identity is unlocked in this session.");
  return { signer: u.signer, everydayPrivateKey: u.everydayPrivateKey };
}
function H() {
  const e = S();
  if (!u.signerOnly || u.app || !u.site) throw new Error("refused");
  return { ...e, site: u.site };
}
const Vn = "bitlogin:world-counts:v1:", vu = "bitlogin:follows-seen:v1:", Wn = /* @__PURE__ */ new Map();
async function we(e, t, o, n = !0) {
  const r = `${Vn}${e}:${t}`;
  let s = Wn.get(r);
  if (!s)
    try {
      const l = n ? JSON.parse(await w.get(r) ?? "[]") : [];
      s = Array.isArray(l) ? l.filter((d) => typeof d == "number" && Number.isFinite(d)).slice(-o.hourly) : [];
    } catch {
      s = [];
    }
  const i = ra(o, s), a = Date.now(), c = i.take(a);
  return Wn.set(r, i.times()), c && n && await w.set(r, JSON.stringify(i.times())).catch(() => {
  }), c;
}
function mn() {
  if (!u.signerOnly || !u.app) throw new Error("refused");
  return u.app;
}
function V() {
  Lt.closeAll(), u.signer?.destroy(), u.everydayPrivateKey && u.everydayPrivateKey.fill(0), u.signer = null, u.everydayPrivateKey = null, u.accountId = null, u.recoveryPublicKey = null, u.activeCredentialEvent = null, u.activeRecoveryEvent = null, u.everydayKeyDerived = !1, u.vault?.destroy(), u.vault = null, u.connectionVaultRoot && u.connectionVaultRoot.fill(0), u.connectionVaultRoot = null, u.vaultKnown = !1, u.signerOnly = !1, u.app = null, u.site = null, u.profile = null, u.remember = !1, u.grantAt = null, u.relays = [], u.family = null, u.more = [], u.pendingRecovery && (u.pendingRecovery.recoveryPrivateKey.fill(0), u.pendingRecovery.everydayPrivateKey.fill(0), u.pendingRecovery = null);
}
function fo(e) {
  return V(), u.pendingRecovery = e, u.signer = new ce(e.everydayPrivateKey), u.everydayPrivateKey = e.everydayPrivateKey, u.accountId = e.accountId, u.recoveryPublicKey = e.recoveryPublicKey, u.activeRecoveryEvent = e.currentRecoveryEvent, u.everydayKeyDerived = e.everydayKeyDerived, Bn(
    e.currentRecoveryPayload.connection_vault_root ? L(e.currentRecoveryPayload.connection_vault_root) : void 0
  ), {
    everydayPublicKey: e.everydayPublicKey,
    accountId: e.accountId,
    generalRelays: e.generalRelays,
    dmRelays: e.dmRelays,
    chainWarning: e.chainWarning,
    everydayKeyDerived: e.everydayKeyDerived
  };
}
function Bn(e, t) {
  u.connectionVaultRoot = e ?? null, u.vaultKnown = !0, u.vault = null, t && P(t);
}
async function ge() {
  if (!u.everydayPrivateKey || !u.accountId || !u.recoveryPublicKey || !u.activeCredentialEvent || !u.activeRecoveryEvent)
    return;
  const e = await pe(w);
  e && !R && (await st(w), await jn());
  const t = {
    everydayPrivateKey: u.everydayPrivateKey,
    accountId: u.accountId,
    recoveryPublicKey: u.recoveryPublicKey,
    activeCredentialEvent: u.activeCredentialEvent,
    activeRecoveryEvent: u.activeRecoveryEvent,
    ...u.connectionVaultRoot ? { connectionVaultRoot: u.connectionVaultRoot } : {},
    ...u.vaultKnown ? { vaultEnabled: u.connectionVaultRoot !== null } : {},
    everydayKeyDerived: u.everydayKeyDerived
  }, o = e && R ? R : null;
  await Tn(w, t, o);
  const n = _(u.everydayPrivateKey);
  await Tn(w, t, o, W(n));
  const r = Pl(await j(w), n, Date.now() / 1e3);
  for (const s of r.dropped) await z(w, W(s));
  await ke(w, r.list), await ii();
}
async function jn() {
  for (const e of await j(w)) await z(w, W(e.pubkey));
  await ke(w, []);
}
async function po(e, t) {
  const o = u.everydayPrivateKey ? _(u.everydayPrivateKey) : "";
  let n = await j(w);
  for (const r of n) {
    if (r.pubkey === o) continue;
    const s = await xs(w, e, W(r.pubkey));
    s ? (await Tn(w, s, t, W(r.pubkey)), s.everydayPrivateKey.fill(0), s.connectionVaultRoot?.fill(0)) : (await z(w, W(r.pubkey)), n = It(n, r.pubkey));
  }
  await ke(w, n);
}
async function bn(e) {
  const t = await xs(w, R, e);
  return t ? (V(), u.signer = new ce(t.everydayPrivateKey), u.everydayPrivateKey = t.everydayPrivateKey, u.accountId = t.accountId, u.recoveryPublicKey = t.recoveryPublicKey, u.activeCredentialEvent = t.activeCredentialEvent, u.activeRecoveryEvent = t.activeRecoveryEvent, u.everydayKeyDerived = t.everydayKeyDerived ?? !1, u.connectionVaultRoot = t.connectionVaultRoot ?? null, u.vaultKnown = t.vaultEnabled !== void 0, await ii(), {
    restored: !0,
    everydayPublicKey: u.signer.getPublicKey(),
    accountId: t.accountId,
    everydayKeyDerived: u.everydayKeyDerived
  }) : { restored: !1 };
}
async function ii() {
  if (!u.signer) return;
  const e = u.signer.getPublicKey();
  await cu(w, { pubkey: e, npub: et(e) });
}
function re() {
  try {
    return new URL(self.location.href).origin;
  } catch {
    return "";
  }
}
const kn = "bitlogin:held:v1:", ai = 3e3, ho = 2500, Lt = new du(ai), $ = (e) => {
  const t = new C(e, {
    connectTimeoutMs: ai,
    connectionFor: Lt.connectionFor,
    notWaitedFor: Lt.notWaitedFor,
    heard: Lt.heard
  }), o = t.queryQuorum.bind(t);
  return t.queryQuorum = (n, r = ho) => o(n, Math.min(r, ho)), t;
}, wu = 1500, En = (e) => {
  const t = $(e);
  return t.publishAll = (o, n) => t.publishEnough(o, n, 2, wu), t;
}, Te = (e) => zl(e, (t) => $([t]));
function me() {
  if (!Io(re())) throw new Error("That is done at BitLogin's own address.");
}
function _n(e) {
  if (e === void 0) return re();
  const t = Ke(e);
  if (!t || !Io(re())) throw new Error("A wallet connection is for this site only.");
  return t;
}
function Jn() {
  if (!u.signer) throw new Error("No identity is unlocked in this session.");
  if (!u.connectionVaultRoot)
    throw new Error(
      u.vaultKnown ? "This account predates the Connection Vault. Enable it from your BitLogin account manager (recovery phrase required)." : "Sign in again to use wallet connections on this device."
    );
  return u.vault ??= new ll(u.connectionVaultRoot.slice()), u.vault;
}
function Qe(e) {
  const { record: t } = e, o = {
    connectionId: t.connection_id,
    connectionType: t.connection_type,
    label: t.label,
    state: t.state,
    origin: t.application_binding.origin,
    createdAt: t.created_at,
    updatedAt: t.updated_at
  };
  if (t.connection_type === "nwc" && t.state !== "deleted") {
    const n = t.credential;
    o.walletPubkey = n.wallet_pubkey, o.relayCount = n.relays?.length;
  }
  return o;
}
async function Ot() {
  const e = Jn(), t = await e.listConnections({ relayUrls: K, store: w });
  return {
    vault: e,
    connections: t.connections.filter((o) => o.record.state !== "deleted"),
    rollbackWarnings: t.rollbackWarnings,
    unreadable: t.unreadable,
    truncated: t.truncated,
    quorumMet: t.quorumMet
  };
}
async function Pn(e) {
  const { vault: t, connections: o } = await Ot(), n = o.find((r) => r.record.connection_id === e);
  if (!n) throw new Error("That connection no longer exists.");
  return { vault: t, connection: n };
}
let _e = null, Q = null;
function vo(e) {
  self.postMessage({ notify: "nip46-auth-url", url: e });
}
function Ye() {
  if (!_e) throw new Error("No remote signer is connected.");
  return _e;
}
function Rt() {
  Q && (Q.abort.abort(), P(Q.clientSecretKey), Q = null);
}
function ci(e) {
  const t = e.buildLogoutEvent();
  e.close(), t && e.publishCourtesy(t);
}
function wo(e, t) {
  _e && ci(_e.client), _e = { client: e, userPubkey: t };
}
async function gu(e, t, o = "") {
  if (u.signerOnly && !Ol.has(e))
    throw new Error("This session can only sign. Sign in at your own BitLogin page for anything else.");
  switch (R && e !== "configure" && Date.now() - gn > G.idleSec * 1e3 && ze(), pu.has(e) || (gn = Date.now()), e) {
    // ---- The optional lock (lock.ts) ----
    case "lockStatus":
      return Ne();
    // Turn it on, or change the PIN. Only with a full session unlocked: the key that is sealed is the one in hand.
    case "lockEnable": {
      if (S(), await pe(w) && !R) throw new Error("Unlock first.");
      const n = await Rl(w, t.pin, R ?? void 0);
      return await po(R, n), R && P(R), R = n, await ge(), Ne();
    }
    case "lockSetDevice": {
      if (S(), !R) throw new Error("Turn the lock on first.");
      const n = t, r = L(String(n.prfOutput));
      try {
        await Cl(w, R, String(n.credentialId), r);
      } finally {
        P(r);
      }
      return Ne();
    }
    case "lockRemoveDevice": {
      if (S(), !R) throw new Error("Turn the lock on first.");
      return await Nl(w), Ne();
    }
    case "lockDisable": {
      if (S(), await pe(w) && !R) throw new Error("Unlock first.");
      return await po(R, null), await st(w), R && P(R), R = null, await ge(), Ne();
    }
    case "lockNow": {
      if (!R) throw new Error("The lock is not on.");
      return ze(), Ne();
    }
    // Open it, with the PIN or with the device. A wrong try is counted; one too many removes the lock and the
    // cached session with it, and the user signs in again the ordinary way.
    case "lockOpen": {
      const n = t;
      let r;
      if (typeof n.prfOutput == "string") {
        const s = L(n.prfOutput);
        try {
          r = await Ml(w, s);
        } finally {
          P(s);
        }
      } else
        r = await Tl(w, n.pin);
      if (r.ok) {
        R && P(R), R = r.lockKey, gn = Date.now();
        const s = await bn();
        if (s.restored) return { ok: !0, left: G.tries, removed: !1, ...s };
        if (await Mt(w) === "none" && (await j(w)).length > 0) return { ok: !0, left: G.tries, removed: !1, restored: !1 };
        await st(w), ze(), r = { ok: !1, left: 0, removed: !0 };
      }
      return r.removed && (ze(), await jn(), await ro(w), await He(w)), { ok: !1, left: r.left, removed: r.removed, restored: !1 };
    }
    // ---- Signer hand-off (docs/sign-in-window.md) ----
    // The receiving side, first: a throwaway key for the hand-off to be sealed to.
    case "handoffBegin":
      return ve && P(ve), ve = Je(), { recipientPublicKey: _(ve) };
    // The sending side: this worker has the session, and seals the everyday
    // key (only that) to the receiving worker's throwaway key.
    case "handoffExport": {
      const { everydayPrivateKey: n } = S(), r = Je(), s = t;
      try {
        return Ul(n, s.recipientPublicKey, r, s.app, {
          ...s.site !== void 0 ? { site: s.site } : {},
          // Only a site that declared nothing is told who they are. An application is held to what it asked,
          // though the window may have read the profile to show the user which account this is.
          ...u.profile && !s.app ? { profile: u.profile } : {},
          ...s.remember === !0 ? { remember: !0 } : {},
          ...s.family !== void 0 ? { family: s.family } : {},
          ...s.more !== void 0 ? { more: s.more } : {},
          // With the lock on, nothing is kept for any site: a key at rest in a site's storage would be a key
          // the lock does not cover. Every site is allowed for the visit, and asks at the sign-in address again.
          ...R ? { visitOnly: !0 } : {},
          // When it was allowed, by this worker's clock, and where the user writes: what a signer needs to
          // find out later whether the site was taken back (docs/take-back.md).
          at: Date.now() / 1e3,
          relays: u.relays
        });
      } finally {
        P(r);
      }
    }
    // The receiving side, last: open it with the throwaway key, which is
    // then gone. What results is a signer-only session, in memory. It is
    // never written to the session cache or the public record.
    // ---- What the embedded signer remembers for a site (signerGrant.ts) ----
    // Keep this hand-off for the site that asked, so the user is not asked again on its next page load. Only a
    // session that arrived by a hand-off is ever kept this way: a full session is never written as a grant.
    case "signerKeep": {
      const { everydayPrivateKey: n } = S();
      if (!u.signerOnly) throw new Error("Only a signer-only session can be remembered for a site.");
      const r = t, s = Date.now() / 1e3;
      if (!u.remember) return { kept: !1 };
      if (u.app && u.app.site !== r.site || u.site && u.site !== r.site) throw new Error("This hand-off was for another site.");
      if (u.family) {
        if (!Ie(r.site, u.family)) throw new Error("This hand-off was for another site.");
        await At(w, r.site);
      }
      return {
        kept: await hn(
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
            ...!u.app && !u.family && u.more.length ? { more: ye(u.more) } : {},
            ...u.app ? { permissions: u.app.permissions, signedSensitive: [] } : {}
          },
          s
        )
      };
    }
    // The site's page was loaded again: what was kept for that site, if it is still in date, becomes a
    // signer-only session. It touches nothing a full session uses.
    case "signerRestore": {
      const n = t, r = await Kt(w, n.site, Date.now() / 1e3), s = !r && n.family !== void 0 && Y(n.family) && Ie(n.site, n.family) ? n.family : null, i = r ?? (s ? await Kt(w, s, Date.now() / 1e3) : null);
      return !i || s && i.site !== s ? { restored: !1 } : (V(), u.signer = new ce(i.everydayPrivateKey), u.everydayPrivateKey = i.everydayPrivateKey, u.signerOnly = !0, u.app = i.permissions ? { site: i.site, permissions: i.permissions } : null, u.site = s ? n.site : i.site, u.family = s, u.profile = i.profile ?? null, u.remember = !0, u.grantAt = pn(i), u.relays = i.relays ?? [], u.more = s ? [] : i.more ?? [], {
        restored: !0,
        everydayPublicKey: u.signer.getPublicKey(),
        until: i.until,
        ...i.name ? { name: i.name } : {},
        ...i.profile ? { profile: i.profile } : {},
        signed: i.signed,
        ...i.signedPass ? { signedPass: i.signedPass } : {},
        check: Ur(Date.now() / 1e3, pn(i), i.checkedAt ?? 0),
        ...s ? { family: s } : {},
        ...u.more.length ? { more: ye(u.more) } : {},
        ...i.permissions ? { permissions: i.permissions, signedSensitive: i.signedSensitive ?? [] } : {}
      });
    }
    // Count a signature against the site, where reloading the page can't lose the count.
    case "signerTouch": {
      const { everydayPrivateKey: n } = S();
      if (!u.signerOnly) throw new Error("Only a signer-only session is counted for a site.");
      const r = t, s = Date.now() / 1e3, i = await Kt(w, u.family && Ie(r.site, u.family) ? u.family : r.site, s);
      return i && _(i.everydayPrivateKey) === _(n) && await hn(
        w,
        { ...i, signed: Array.isArray(r.signed) ? r.signed : [], ...Array.isArray(r.signedPass) ? { signedPass: r.signedPass } : {}, ...i.permissions ? { signedSensitive: Array.isArray(r.signedSensitive) ? r.signedSensitive : [] } : {} },
        s
      ), {};
    }
    // Signing out of a site that was allowed as one of a family signs out of the family: otherwise its next page
    // load would take the family's grant up again, and the sign-out would not have happened (SF6).
    case "signerForget": {
      const n = t.site;
      await At(w, n), u.family && Ie(n, u.family) && await At(w, u.family), await w.delete(kn + n).catch(() => {
      });
      for (const r of ["save", "follow", "seal", "unwrap", "reach", "score", "achieve"])
        Wn.delete(`${Vn}${r}:${n}`), await w.delete(`${Vn}${r}:${n}`).catch(() => {
        });
      return {};
    }
    // The receipts BitLogin's own page handed a site's signer (docs/paying.md): the person's, for that site's own
    // listings. Kept beside the site's grant, so a page loaded again still knows what its visitor holds (owner,
    // 2026-11-21). They are signed notes and no secret; each is checked again where it is used. A signer-only
    // session only, and only for the site its hand-off was sealed for.
    case "signerHold":
    case "signerHeld": {
      const { signer: n } = S();
      if (!u.signerOnly) throw new Error("Only a site's signer holds receipts for it.");
      const r = Ke(t.site);
      if (!r) throw new Error("That is not a site.");
      if (u.app && u.app.site !== r || u.site && u.site !== r) throw new Error("That is another site's.");
      const s = n.getPublicKey();
      if (e === "signerHold") {
        const i = t.receipts, a = (Array.isArray(i) ? i.slice(0, Br) : []).filter((c) => !!c && typeof c == "object" && c.kind === 30078 && typeof c.content == "string" && c.content.length <= 8e3 && A(c));
        return await w.set(kn + r, JSON.stringify({ pubkey: s, receipts: a })), {};
      }
      try {
        const i = JSON.parse(await w.get(kn + r) ?? "null");
        return { receipts: i?.pubkey === s && Array.isArray(i.receipts) ? i.receipts.slice(0, Br) : [] };
      } catch {
        return { receipts: [] };
      }
    }
    case "handoffAccept": {
      if (!ve) throw new Error("No hand-off was begun here.");
      const n = ve;
      ve = null;
      let r;
      try {
        r = ql(t, n);
      } finally {
        P(n);
      }
      return V(), u.signer = new ce(r.key), u.everydayPrivateKey = r.key, u.signerOnly = !0, u.app = r.app, u.site = r.site, u.profile = r.profile, u.remember = r.remember, u.grantAt = r.at, u.relays = r.relays, u.family = r.family, u.more = r.more, {
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
      const { signer: n } = S(), r = n.getPublicKey(), s = t.profile !== !1, i = [.../* @__PURE__ */ new Set([...I, ...K])].slice(0, 8);
      if (i.length === 0) return {};
      const a = $(i);
      try {
        const [c, l] = await Promise.all([
          s ? a.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 4e3) : Promise.resolve(null),
          a.queryQuorum({ kinds: [Re], authors: [r], limit: 2 }, 4e3)
        ]);
        if (u.signer !== n) return {};
        u.profile = c ? oo(c.outcomes.flatMap((d) => d.events), r) : null, u.profile && !u.signerOnly && await ke(w, Sl(await j(w), r, u.profile)), u.relays = Ae(l.outcomes.flatMap((d) => d.events), r);
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
      const { signer: n } = S(), r = t, s = n.getPublicKey(), i = Date.now() / 1e3, a = r.all === !0 ? { all: !0 } : { site: String(r.site ?? "") }, c = $([.../* @__PURE__ */ new Set([...I, ...K])].slice(0, 8));
      let l;
      try {
        l = Ae((await c.queryQuorum({ kinds: [Re], authors: [s], limit: 2 }, 4e3)).outcomes.flatMap((f) => f.events), s);
      } finally {
        c.closeAll();
      }
      const d = [.../* @__PURE__ */ new Set([...l, ...K])].slice(0, 16), y = $(d);
      try {
        const f = await y.queryQuorum({ kinds: [un], authors: [s], "#d": [ln], limit: 2 }, 5e3);
        if (f.respondedCount === 0) return { ok: !1, accepted: 0, of: d.length };
        const p = Dr(f.outcomes.flatMap((E) => E.events), s, i), m = p ? yo(n, p.content) : null, g = await hu(s), b = Ri(Ci(m ?? Kn, g, i), a, i), v = n.signEvent({
          kind: un,
          // Later than the one it replaces, whatever the two clocks say.
          created_at: Math.max(Math.floor(i), (p?.created_at ?? 0) + 1),
          tags: [["d", ln]],
          content: n.nip44Encrypt(s, xr(b))
        }), k = x(await y.publishAll(v, 6e3)), h = k >= Math.min(2, d.length);
        return h && await w.set(si + s, xr(b)).catch(() => {
        }), { ok: h, accepted: k, of: d.length };
      } finally {
        y.closeAll();
      }
    }
    // In the embedded signer, for a kept grant: ask the user's relays whether this site was taken back. Asked at
    // most once a day. It can end the grant or leave it be, and nothing else.
    case "signerCheck": {
      const { signer: n } = S();
      if (!u.signerOnly || !u.site) return { state: "ok" };
      const r = u.family ?? u.site, s = Date.now() / 1e3, i = await Kt(w, r, s);
      if (!i) return { state: "ok" };
      const a = n.getPublicKey(), c = pn(i), l = Ur(s, c, i.checkedAt ?? 0);
      if (l === "fresh") return { state: "ok" };
      const d = [.../* @__PURE__ */ new Set([...X(i.relays), ...K])].slice(0, 12), y = $(d);
      let f, p;
      try {
        [f, p] = await Promise.all([
          y.queryQuorum({ kinds: [un], authors: [a], "#d": [ln], limit: 2 }, 5e3),
          y.queryQuorum({ kinds: [Re], authors: [a], limit: 2 }, 5e3)
        ]);
      } finally {
        y.closeAll();
      }
      if (u.signer !== n) return { state: "ok" };
      const m = Dr(f.outcomes.flatMap((k) => k.events), a, s), g = m ? yo(n, m.content) : null;
      if (g && Ni(g, r, c))
        return await At(w, r), V(), { state: "ended" };
      if (!Ti({
        asked: d.length,
        answered: f.respondedCount,
        seenAt: i.seenAt ?? 0,
        newestAt: m ? m.created_at : null,
        readable: g !== null
      })) return { state: l === "overdue" ? "stale" : "ok" };
      const v = Ae(p.outcomes.flatMap((k) => k.events), a);
      return await hn(
        w,
        {
          ...i,
          checkedAt: Math.floor(s),
          seenAt: Math.max(i.seenAt ?? 0, g && m ? m.created_at : 0),
          ...v.length ? { relays: v } : {}
        },
        s
      ), v.length && (u.relays = v), { state: "ok" };
    }
    // A room pass (NSWP kind 27300) for the site this session serves, and for no other. The site, the time, how
    // long it lasts and the profile are all this worker's own: what is asked for is a session public key. Not
    // for an application: an application is held to the set the user read, and a pass is not in one.
    case "roomPass": {
      const { signer: n } = S();
      if (!u.signerOnly || u.app || !u.site) throw new Error("refused");
      const r = kl({
        session: t.session,
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
      const { signer: n, everydayPrivateKey: r, site: s } = H(), i = t, a = Ee(r, n.getPublicKey());
      try {
        const c = ta({ conversationKey: a, world: s, slot: i.slot, data: i.data, nowSeconds: Date.now() / 1e3 });
        if (!c || !await we("save", s, na)) throw new Error("refused");
        return n.signEvent(c);
      } finally {
        P(a);
      }
    }
    case "worldFind": {
      const { signer: n, everydayPrivateKey: r, site: s } = H(), i = Ee(r, n.getPublicKey());
      try {
        const a = ea(i, s, t.slot);
        if (!a) throw new Error("refused");
        return { d: a };
      } finally {
        P(i);
      }
    }
    case "worldOpen": {
      const { signer: n, everydayPrivateKey: r, site: s } = H(), i = t.event;
      if (!A(i)) throw new Error("refused");
      const a = Ee(r, n.getPublicKey());
      try {
        const c = Zi(i, { conversationKey: a, pubkey: n.getPublicKey(), world: s });
        if (!c) throw new Error("refused");
        return c;
      } finally {
        P(a);
      }
    }
    // ---- Following from inside a world (NSWP-14; embedded/follows.ts). Only for a world the user let do this, by
    // name, in the window. The world hands over their newest follow list and one change; what is signed is that
    // list with that change and nothing else. A follow list replaces the last, so before a world's word is
    // believed this worker looks at the user's own relays itself: a world that is behind, or that says there is
    // no list where one merely couldn't be reached, is refused.
    case "worldFollow": {
      const { signer: n, site: r } = H();
      if (!u.more.includes("follows")) throw new Error("refused");
      const s = t, i = n.getPublicKey(), a = s.list === null ? null : Wr(s.list, i);
      if (s.list !== null && !a) throw new Error("refused");
      const c = vu + i;
      let l = 0;
      try {
        const g = Number(await w.get(c));
        Number.isSafeInteger(g) && g > 0 && (l = g);
      } catch {
      }
      const d = [.../* @__PURE__ */ new Set([...X(u.relays), ...I, ...K])].slice(0, 8);
      let y = 0, f = 0;
      if (d.length) {
        const g = $(d);
        try {
          const b = await g.queryQuorum({ kinds: [Ge], authors: [i], limit: 2 }, 3500);
          y = b.respondedCount;
          for (const v of b.outcomes.flatMap((k) => k.events))
            v.created_at > f && Wr(v, i) && (f = v.created_at);
        } catch {
        } finally {
          g.closeAll();
        }
      }
      if (u.signer !== n || !u.more.includes("follows")) throw new Error("refused");
      if (l = Math.max(l, f), l && await w.set(c, String(l)).catch(() => {
      }), !Yi(a, { answered: y, newestAt: f })) throw new Error("refused");
      const p = Xi({ list: a, ...s.add !== void 0 ? { add: s.add } : {}, ...s.remove !== void 0 ? { remove: s.remove } : {}, pubkey: i, nowSeconds: Date.now() / 1e3, seen: l });
      if (!p || !await we("follow", r, da)) throw new Error("refused");
      const m = n.signEvent(p);
      return await w.set(c, String(Math.max(l, m.created_at))).catch(() => {
      }), m;
    }
    // ---- A score on one of a world's boards (NSWP-15; embedded/scores.ts). For any world its visitor allowed: it
    // is less than a note. The world names its coordinate, a board and a number; the note and the mark that says
    // which site asked are this worker's own.
    case "worldScore": {
      const { signer: n, site: r } = H(), s = t, i = Qi({ world: s.world, board: s.board, score: s.score, title: s.title, format: s.format, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await we("score", r, ua)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- An achievement held in a world (NSWP-16; embedded/achievements.ts). As a score: for any world its visitor
    // allowed, built here from three plain fields, and marked with the site this session serves.
    case "worldAchieve": {
      const { signer: n, site: r } = H(), s = t, i = zi({ world: s.world, id: s.achievement, title: s.title, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await we("achieve", r, la)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- Private messages from inside a world (NSWP-14; embedded/messages.ts). Only for a world the user let do
    // this, by name, in the window. The world names a reader and the words, or hands over a wrap; it is never given
    // a key, and nothing else is encrypted or decrypted for it.
    case "worldSeal": {
      const { signer: n, site: r } = H();
      if (!u.more.includes("messages")) throw new Error("refused");
      const s = t, i = Hi(n, { to: s.to, text: s.text, nowSeconds: Date.now() / 1e3 });
      if (!i || !await we("seal", r, ca)) throw new Error("refused");
      return i;
    }
    case "worldUnwrap": {
      const { signer: n, site: r } = H();
      if (!u.more.includes("messages")) throw new Error("refused");
      if (!await we("unwrap", r, aa, !1)) throw new Error("refused");
      const s = Gi(n, t.event);
      if (!s) throw new Error("refused");
      return { message: s };
    }
    case "worldReach": {
      const { signer: n, site: r } = H();
      if (!u.more.includes("messages")) throw new Error("refused");
      const s = Ji(t.relays, Date.now() / 1e3);
      if (!s || !await we("reach", r, ia)) throw new Error("refused");
      return n.signEvent(s);
    }
    // ---- What an approved application may ask beyond signing (§SW9.5). Refused without a permission set.
    case "appEncrypt": {
      const { signer: n } = S(), r = mn(), s = t, i = n.getPublicKey(), a = r.permissions.sign.some((c) => Bi.includes(c));
      if (!ji(r.permissions, i, s.peerPublicKey) && !(a && /^[0-9a-f]{64}$/u.test(String(s.peerPublicKey))))
        throw new Error("refused");
      if (typeof s.text != "string" || s.text.length > 1e5) throw new Error("refused");
      return { text: s.scheme === "nip04" ? n.nip04Encrypt(s.peerPublicKey, s.text) : n.nip44Encrypt(s.peerPublicKey, s.text) };
    }
    case "appDecrypt": {
      const { signer: n } = S(), r = mn(), s = t;
      if (!Wi(r.permissions, s.peerPublicKey) || typeof s.text != "string") throw new Error("refused");
      return { text: s.scheme === "nip04" ? n.nip04Decrypt(s.peerPublicKey, s.text) : n.nip44Decrypt(s.peerPublicKey, s.text) };
    }
    case "appDecryptEvent": {
      const { signer: n } = S(), r = mn(), s = t.event;
      if (!A(s)) throw new Error("refused");
      const i = Vi(r.permissions, n.getPublicKey(), s), a = s.kind === 4 || /\?iv=[A-Za-z0-9+/=]+$/u.test(s.content);
      for (const c of i)
        try {
          return { text: a ? n.nip04Decrypt(c, s.content) : n.nip44Decrypt(c, s.content) };
        } catch {
        }
      throw new Error("refused");
    }
    case "nip46Connect": {
      const r = Ia(t.uri), s = new Hr({
        clientSecretKey: Je(),
        pointer: r,
        onAuthUrl: vo
      });
      try {
        await s.connect();
        const i = await s.getUserPublicKey();
        return wo(s, i), Rt(), { userPubkey: i };
      } catch (i) {
        throw s.close(), i;
      }
    }
    case "nip46NostrconnectStart": {
      const n = t, r = K.slice(0, 2);
      Rt();
      const s = Je(), i = De(D(16));
      return Q = { clientSecretKey: s, relayUrls: r, secret: i, abort: new AbortController() }, { uri: La({
        clientPubkey: _(s),
        relayUrls: r,
        secret: i,
        name: n.appName?.trim() || "BitLogin",
        perms: ["sign_event", "nip44_encrypt", "nip44_decrypt", "nip04_encrypt", "nip04_decrypt"]
      }) };
    }
    case "nip46NostrconnectAwait": {
      const n = Q;
      if (!n) throw new Error("No signer-connection attempt is in progress.");
      let r;
      try {
        ({ signerPubkey: r } = await Da({
          clientSecretKey: n.clientSecretKey,
          relayUrls: n.relayUrls,
          secret: n.secret,
          timeoutMs: 18e4,
          signal: n.abort.signal
        }));
      } catch (i) {
        throw Q === n && Rt(), i;
      }
      if (Q !== n) throw new Error("This signer-connection attempt was superseded.");
      Q = null;
      const s = new Hr({
        clientSecretKey: n.clientSecretKey,
        pointer: { signerPubkey: r, relayUrls: n.relayUrls },
        onAuthUrl: vo
      });
      try {
        const i = await s.getUserPublicKey();
        return wo(s, i), { userPubkey: i };
      } catch (i) {
        throw s.close(), i;
      }
    }
    case "nip46SignEvent": {
      const n = t;
      return Ye().client.signEvent({
        kind: n.kind,
        content: n.content,
        tags: n.tags ?? [],
        created_at: n.created_at ?? Math.floor(Date.now() / 1e3)
      });
    }
    case "nip46Nip44Encrypt": {
      const n = t;
      return { ciphertext: await Ye().client.nip44Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip44Decrypt": {
      const n = t;
      return { plaintext: await Ye().client.nip44Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Nip04Encrypt": {
      const n = t;
      return { ciphertext: await Ye().client.nip04Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip04Decrypt": {
      const n = t;
      return { plaintext: await Ye().client.nip04Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Disconnect": {
      const n = _e;
      return _e = null, Rt(), n && ci(n.client), {};
    }
    case "configure": {
      const n = t;
      return Fn = !!n.vaultRelayUrls?.length, $n = !!n.discoveryRelayUrls?.length, n.vaultRelayUrls?.length && (K = n.vaultRelayUrls), n.discoveryRelayUrls?.length && (I = n.discoveryRelayUrls), uo(Nt(await Uo(w))), (!Fn || !$n) && Pa(w).then(uo, () => {
      }), {};
    }
    case "register": {
      const n = t, r = n.importKey ? await Oc({ nsecOrHex: n.importKey, loginName: n.loginName, password: n.password, vaultRelayUrls: K }) : await ps({ loginName: n.loginName, password: n.password, vaultRelayUrls: K });
      return V(), u.signer = new ce(r.everydayPrivateKey), u.everydayPrivateKey = r.everydayPrivateKey, u.accountId = r.accountId, u.recoveryPublicKey = r.recoveryPublicKey, u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.recoveryEvent, u.everydayKeyDerived = r.everydayKeyDerived, Bn(r.connectionVaultRoot, r.vaultSudoKey), await ge(), {
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
      const r = hs(t.nsecOrHex), s = _(r), i = { everydayPublicKey: s, npub: et(s) };
      return r.fill(0), i;
    }
    case "login": {
      const n = t, r = await Dc({
        loginName: n.loginName,
        password: n.password,
        vaultRelayUrls: K,
        store: w,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return V(), u.signer = new ce(r.everydayPrivateKey), u.everydayPrivateKey = r.everydayPrivateKey, u.accountId = r.accountId, u.recoveryPublicKey = r.recoveryPublicKey, u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.recoveryCapsuleEvent, u.everydayKeyDerived = r.everydayKeyDerived, Bn(r.connectionVaultRoot, r.vaultSudoKey), await ge(), !r.rollbackWarning && !r.relayDisagreementWarning && Yr({
        relayUrls: K,
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
      const n = t, r = await xc({
        phrase: n.phrase,
        vaultRelayUrls: K,
        discoveryRelayUrls: I,
        offlineRecoveryCapsuleEvents: n.offlineExportFile?.recovery_capsule_events
      });
      return fo(r);
    }
    case "previewPhraseRebuild": {
      const r = await Uc({ phrase: t.phrase, vaultRelayUrls: K, discoveryRelayUrls: I });
      return { ...r, npub: et(r.everydayPublicKey) };
    }
    case "rebuildFromPhrase": {
      const r = await qc({ phrase: t.phrase, vaultRelayUrls: K, discoveryRelayUrls: I });
      return fo(r);
    }
    case "completeRecovery": {
      const n = t;
      if (!u.pendingRecovery) throw new Error("No recovery is in progress in this session.");
      const r = await Fc({
        recovered: u.pendingRecovery,
        newLoginName: n.newLoginName,
        newPassword: n.newPassword,
        vaultRelayUrls: K,
        store: w
      });
      return u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.refreshedRecoveryEvent, u.pendingRecovery.recoveryPrivateKey.fill(0), u.pendingRecovery = null, await ge(), {
        locatorPublicKey: r.locatorPublicKey,
        credentialEventId: r.credentialEvent.id,
        refreshedRecoveryEventId: r.refreshedRecoveryEvent.id
      };
    }
    case "changePassword": {
      const n = t, r = await $c({
        loginName: n.loginName,
        oldPassword: n.oldPassword,
        newPassword: n.newPassword,
        vaultRelayUrls: K,
        store: w,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return u.activeCredentialEvent = r.newCredentialEvent, u.recoveryPublicKey = r.recoveryPublicKey, u.activeRecoveryEvent = r.recoveryCapsuleEvent, await ge(), {
        newLocatorPublicKey: r.newLocatorPublicKey,
        newGeneration: r.newGeneration,
        tombstoneAcknowledgedCount: r.tombstoneAcknowledgedCount,
        deletionAcknowledgedCount: r.deletionAcknowledgedCount
      };
    }
    case "publishProfileAndRelayLists": {
      const n = t, { everydayPrivateKey: r } = S();
      return mc({
        everydayPrivateKey: r,
        name: n.name,
        about: n.about,
        picture: n.picture,
        generalRelays: n.generalRelays,
        dmRelays: n.dmRelays,
        discoveryRelays: I
      });
    }
    case "getPublicKey": {
      const { signer: n } = S();
      return { publicKey: n.getPublicKey() };
    }
    case "signEvent": {
      const { signer: n } = S(), r = t;
      if (u.signerOnly) {
        if (u.app) {
          const s = oa(u.app.permissions, r, u.app.site, Date.now() / 1e3);
          if (!s) throw new Error("refused");
          return n.signEvent(s);
        }
        if (sa(r.kind) !== "ordinary") throw new Error("refused");
      }
      return n.signEvent({ kind: r.kind, tags: r.tags, content: r.content, created_at: r.created_at });
    }
    case "nip44Encrypt": {
      const { signer: n } = S(), r = t;
      return { ciphertext: n.nip44Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip44Decrypt": {
      const { signer: n } = S(), r = t;
      return { plaintext: n.nip44Decrypt(r.peerPublicKey, r.payload) };
    }
    case "nip04Encrypt": {
      const { signer: n } = S(), r = t;
      return { ciphertext: n.nip04Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip04Decrypt": {
      const { signer: n } = S(), r = t;
      return { plaintext: n.nip04Decrypt(r.peerPublicKey, r.payload) };
    }
    case "exportIdentity": {
      const { everydayPrivateKey: n, signer: r } = S();
      return { nsec: fi(n), npub: et(r.getPublicKey()) };
    }
    case "buildRecoveryExport": {
      if (S(), !u.recoveryPublicKey || !u.activeRecoveryEvent)
        throw new Error("No recovery capsule is known in this session yet.");
      return pi({
        recoveryPublicKeyHex: u.recoveryPublicKey,
        vaultRelayUrls: K,
        recoveryCapsuleEvents: [u.activeRecoveryEvent],
        relayListEvents: []
      });
    }
    case "repairReplicas": {
      if (!u.activeCredentialEvent || !u.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Yr({
        relayUrls: K,
        credentialEvent: u.activeCredentialEvent,
        recoveryEvent: u.activeRecoveryEvent
      });
    }
    case "checkReplicaHealth": {
      if (!u.activeCredentialEvent || !u.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Mc({
        relayUrls: K,
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
      return !R && await Mt(w) === "locked" ? { restored: !1, locked: !0 } : bn();
    // Log out: this account is forgotten on this device. Other accounts kept here stay, and so does the lock
    // they are sealed under; with none left, everything goes as it always did.
    case "logout": {
      const n = u.everydayPrivateKey && !u.signerOnly ? _(u.everydayPrivateKey) : "", r = It(await j(w), n);
      return n && await z(w, W(n)), r.length > 0 && n ? (await ke(w, r), V(), await z(w), await He(w), {}) : (ze(), await st(w), await jn(), await ro(w), await He(w), {});
    }
    // ---- Several accounts on one device (docs/account-switching.md) ----
    // Who is kept here, and which of them is signed in. Public keys and what their own profiles call them.
    case "accountsList": {
      const n = u.everydayPrivateKey && !u.signerOnly ? _(u.everydayPrivateKey) : "";
      return { accounts: (await j(w)).map((r) => ({ ...r, active: r.pubkey === n })) };
    }
    // Switch to a kept account: its own slot is opened, on this device, with no password and no relay. With the
    // lock on and locked, it says so, and nothing changes.
    case "accountsSwitch": {
      if (u.signerOnly) throw new Error("A signer-only session cannot switch accounts.");
      const n = String(t.pubkey ?? ""), r = await j(w);
      if (!r.some((i) => i.pubkey === n)) return { restored: !1 };
      if (!R && await Mt(w, W(n)) === "locked") return { restored: !1, locked: !0 };
      const s = await bn(W(n));
      return !s.restored || s.everydayPublicKey !== n ? (V(), await z(w, W(n)), await ke(w, It(r, n)), await z(w), await He(w), { restored: !1 }) : (await ge(), s);
    }
    // Make room to sign in as another account: nobody is signed in, and everyone kept stays kept.
    case "accountsAdd": {
      if (u.signerOnly) throw new Error("A signer-only session cannot add accounts.");
      return V(), await z(w), await He(w), {};
    }
    // Forget one kept account that is not the one signed in. (For that one: log out.)
    case "accountsRemove": {
      const n = String(t.pubkey ?? ""), r = u.everydayPrivateKey && !u.signerOnly ? _(u.everydayPrivateKey) : "";
      if (n === r) throw new Error("Log out to remove the account that is signed in.");
      return await z(w, W(n)), await ke(w, It(await j(w), n)), {};
    }
    // ---- Connection Vault (connection-vault.md §12, reveal mode) ----
    // ---- An ecash wallet kept with the account (docs/ecash.md). A full session only: none of these is on the list a
    // handed-over session may ask, so no embedded signer, and so no site, can read a token.
    // ---- A person's files (docs/files.md). A full session only: none of these is on the list a handed-over
    // session may ask, so no embedded signer, and so no site, can read the index or have a permission note signed.
    case "blossomAuth": {
      const { signer: n } = S();
      return { token: tu(n, t) };
    }
    case "driveLoad":
    case "driveSave":
    case "blossomServers":
    case "blossomSetServers": {
      const { signer: n } = S(), r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...I, ...K])].slice(0, 8);
      let i = u.relays;
      if (i.length === 0 && s.length) {
        const c = $(s);
        try {
          i = Ae((await c.queryQuorum({ kinds: [Re], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((l) => l.events), r), i.length && (u.relays = i);
        } catch {
          i = [];
        } finally {
          c.closeAll();
        }
      }
      const a = En([.../* @__PURE__ */ new Set([...i, ...K, ...e.startsWith("blossom") ? I : []])].slice(0, 16));
      try {
        const c = { signer: n, store: w, relays: a };
        if (e === "driveLoad") return await Zl(c);
        if (e === "driveSave") return await eu(c, t);
        const l = async () => {
          const v = await a.queryQuorum({ kinds: [Ze], authors: [r], limit: 2 }, 4e3);
          if (v.respondedCount === 0) throw new Error("No relay answered for your server list.");
          const k = v.outcomes.flatMap((h) => h.events).filter((h) => h.kind === Ze && h.pubkey === r && A(h)).sort((h, E) => E.created_at - h.created_at)[0];
          return k ? ti(k) : [];
        };
        if (e === "blossomSetServers") {
          const v = [...new Set((t.servers ?? []).map(ar).filter(Boolean))].slice(0, ir.servers);
          if (v.length === 0) throw new Error("Name at least one file server, by its https address.");
          const k = n.signEvent({ kind: Ze, created_at: Math.floor(Date.now() / 1e3), tags: v.map((h) => ["server", h]), content: "" });
          if (x(await a.publishAll(k, 6e3)) < Math.min(2, a.relayUrls.length)) throw new Error("No relay took your server list. Try again when you are online.");
          return { mine: v };
        }
        if (t.ranked !== !0) return { mine: await l(), ranked: [] };
        const d = Te(a.relayUrls), [y, f, p] = await Promise.all([
          l(),
          d.queryQuorum({ kinds: [Ze], limit: 500 }, 5e3),
          d.queryQuorum({ kinds: [Ge], authors: [r], limit: 2 }, 4e3)
        ]).finally(() => d.closeAll()), m = p.outcomes.flatMap((v) => v.events).filter((v) => v.pubkey === r && v.kind === Ge && A(v)).sort((v, k) => k.created_at - v.created_at)[0], g = new Set((m?.tags ?? []).filter((v) => v[0] === "p" && typeof v[1] == "string").map((v) => v[1])), b = new Map(f.outcomes.flatMap((v) => v.events).filter((v) => v.pubkey !== r && A(v)).map((v) => [v.id, v]));
        return { mine: y, ranked: nu([...b.values()], g) };
      } finally {
        a.closeAll();
      }
    }
    // ---- Paying, and buying (docs/paying.md). A full session at one of BitLogin's own sign-in addresses only: none
    // of these is on the list a handed-over session may ask, so no embedded signer, and so no site, can have a
    // buyer's permission note signed or read what a person bought.
    // Whom a tip is for: the name and the lightning address in that person's own signed profile. Read-only.
    case "payProfile": {
      S(), me();
      const n = t.pubkey;
      if (typeof n != "string" || !/^[0-9a-f]{64}$/u.test(n)) throw new Error("That is not an account.");
      const r = [.../* @__PURE__ */ new Set([...u.relays, ...I, ...K])].slice(0, 10);
      if (r.length === 0) return { name: "", address: "", answered: !1 };
      const s = Te(r);
      try {
        const i = await s.queryQuorum({ kinds: [0], authors: [n], limit: 2 }, 3500), a = i.outcomes.flatMap((l) => l.events), c = a.filter((l) => l.kind === 0 && l.pubkey === n && A(l)).sort((l, d) => d.created_at - l.created_at)[0];
        return { name: oo(a, n)?.name ?? "", address: c ? $i(c.content, { local: _t(re()) }) : "", answered: i.respondedCount > 0 };
      } finally {
        s.closeAll();
      }
    }
    // A listing, by its coordinate, from the relays its service names and the account's own. The page checks it.
    case "payListing": {
      S(), me();
      const n = t, r = Co(n.coordinate);
      if (!r) throw new Error("That is not a listing.");
      const s = _t(re()), i = (Array.isArray(n.relays) ? n.relays : []).filter((l) => typeof l == "string" && l.length <= 200 && (/^wss:\/\//u.test(l) || s && /^ws:\/\/(localhost|127\.0\.0\.1)[:/]/u.test(l))).slice(0, 6), a = [.../* @__PURE__ */ new Set([...i, ...u.relays, ...I])].slice(0, 12);
      if (a.length === 0) return { event: null, answered: !1 };
      const c = Te(a);
      try {
        const l = await c.queryQuorum({ kinds: [30078], authors: [Vr(r)], "#d": [r.slice(71)], limit: 4 }, 5e3);
        return { event: l.outcomes.flatMap((y) => y.events).filter((y) => y.kind === 30078 && y.pubkey === Vr(r) && y.tags.some((f) => f[0] === "d" && f[1] === r.slice(71)) && A(y)).sort((y, f) => f.created_at - y.created_at)[0] ?? null, answered: l.respondedCount > 0 };
      } finally {
        c.closeAll();
      }
    }
    // A buyer's permission note (NIP-98) for one request to a selling service BitLogin knows: this address, this
    // method, this body, once. Kind 27235 is signed here and nowhere else, and never for a site.
    case "unlockAuth": {
      const { signer: n } = S();
      me();
      const r = t;
      let s;
      try {
        s = new URL(String(r.url));
      } catch {
        throw new Error("That is not an address.");
      }
      const i = Fi.some((y) => y.endpoint === s.origin) || _t(re()) && _t(s.origin);
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
      const { signer: n } = S();
      me();
      const r = t;
      if (!Fr(r.subject) || r.scope !== "user-allow" && r.scope !== "user-deny") throw new Error("That is not a world's list.");
      const s = n.getPublicKey(), i = $([.../* @__PURE__ */ new Set([...u.relays, ...K, ...I])].slice(0, 12));
      try {
        const a = await i.queryQuorum({ kinds: [30078], authors: [s], "#d": [$r(r.scope, r.subject)], limit: 4 }, 5e3), c = a.outcomes.flatMap((f) => f.events), l = $r(r.scope, r.subject), d = qi(c, { scope: r.scope, subject: r.subject, root: [s] }), y = c.filter((f) => f.pubkey === s && f.kind === 30078 && f.tags.some((p) => p[0] === "d" && p[1] === l) && f.created_at <= Date.now() / 1e3 + 600).sort((f, p) => p.created_at - f.created_at || (f.id < p.id ? -1 : 1));
        return { event: d.ok ? y[0] ?? null : null, answered: a.respondedCount > 0 };
      } finally {
        i.closeAll();
      }
    }
    // Sign this account's list for a world: built here from the world, which list, and who is on it. Nothing else.
    case "guestListSign": {
      const { signer: n } = S();
      me();
      const r = t, s = typeof r.replaces == "number" && Number.isSafeInteger(r.replaces) && r.replaces <= Date.now() / 1e3 + 600 ? r.replaces : void 0, i = r.scope === "user-allow" || r.scope === "user-deny" ? Ui({ scope: r.scope, subject: String(r.subject), people: Array.isArray(r.people) ? r.people : [], createdAt: Math.floor(Date.now() / 1e3), ...s !== void 0 ? { notBefore: s } : {} }) : null;
      if (!i || !Fr(r.subject)) throw new Error("That is not a list this account can keep.");
      return { event: n.signEvent(i) };
    }
    // The receipts kept with the account: in this browser first, then on its relays, each sealed to its own key.
    case "paySettingsLoad":
    case "paySettingsSave":
    case "receiptsLoad":
    case "receiptsKeep": {
      const { signer: n } = S();
      me();
      const r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...I, ...K])].slice(0, 8);
      let i = u.relays;
      if (i.length === 0 && s.length) {
        const l = Te(s);
        try {
          i = Ae((await l.queryQuorum({ kinds: [Re], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((d) => d.events), r), i.length && (u.relays = i);
        } catch {
          i = [];
        } finally {
          l.closeAll();
        }
      }
      const a = [.../* @__PURE__ */ new Set([...i, ...K])].slice(0, 16), c = e === "receiptsLoad" || e === "receiptsKeep" ? Te(a) : En(a);
      try {
        const l = { signer: n, store: w, relays: c };
        return e === "paySettingsLoad" ? await Jl(l) : e === "paySettingsSave" ? await Gl(l, t) : e === "receiptsLoad" ? await Bl(l) : await jl(l, t.receipts);
      } finally {
        c.closeAll();
      }
    }
    // The words of their newest profile note, to show what a proposed one would change. Read-only, and theirs.
    case "profileContent": {
      const { signer: n } = S(), r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...u.relays, ...I, ...K])].slice(0, 10);
      if (s.length === 0) return { content: null, answered: !1 };
      const i = $(s);
      try {
        const a = await i.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 3500), c = a.outcomes.flatMap((l) => l.events).filter((l) => l.kind === 0 && l.pubkey === r && A(l)).sort((l, d) => d.created_at - l.created_at)[0];
        return { content: c ? c.content : null, answered: a.respondedCount > 0 };
      } finally {
        i.closeAll();
      }
    }
    // The mints people recommend (NIP-87): read from relays, counted one voice per account, the user's own follows
    // first. It reads public notes and the user's follow list, and writes nothing.
    case "ecashMints": {
      const { signer: n } = S(), r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...I, ...K])].slice(0, 8);
      if (s.length === 0) return { mints: [] };
      const i = Te(s);
      try {
        const [a, c] = await Promise.all([
          i.queryQuorum({ kinds: [Js], "#k": [Gs], limit: 500 }, 5e3),
          i.queryQuorum({ kinds: [Ge], authors: [r], limit: 2 }, 4e3)
        ]), l = c.outcomes.flatMap((f) => f.events).filter((f) => f.pubkey === r && f.kind === Ge && A(f)).sort((f, p) => p.created_at - f.created_at)[0], d = new Set((l?.tags ?? []).filter((f) => f[0] === "p" && typeof f[1] == "string").map((f) => f[1])), y = new Map(a.outcomes.flatMap((f) => f.events).filter((f) => A(f)).map((f) => [f.id, f]));
        return { mints: Vl([...y.values()], d) };
      } finally {
        i.closeAll();
      }
    }
    // The browser's own copies, asked of no relay and writing nothing: shown at once, marked as being checked, while
    // the careful read above runs behind them (docs/panel-speed-2026-11-23.md). A full session only, as the loads are.
    case "ecashPeek":
    case "drivePeek":
    case "receiptsPeek": {
      const { signer: n } = S();
      e === "receiptsPeek" && me();
      const r = { signer: n, store: w };
      return e === "ecashPeek" ? await ou(r) : e === "drivePeek" ? await Xl(r) : await Wl(r);
    }
    case "ecashLoad":
    case "ecashSetMints":
    case "ecashRoll": {
      const { signer: n } = S(), r = n.getPublicKey(), s = $([.../* @__PURE__ */ new Set([...I, ...K])].slice(0, 8));
      let i = u.relays;
      if (i.length === 0)
        try {
          i = Ae((await s.queryQuorum({ kinds: [Re], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((l) => l.events), r), i.length && (u.relays = i);
        } catch {
          i = [];
        } finally {
          s.closeAll();
        }
      else s.closeAll();
      const a = [.../* @__PURE__ */ new Set([...i, ...K])].slice(0, 16), c = En(a);
      try {
        const l = { signer: n, store: w, relays: c };
        return e === "ecashLoad" ? await su(l) : e === "ecashSetMints" ? await iu({ ...l, newKey: () => De(Je()) }, t.mints) : await au(l, t, () => self.postMessage({ notify: "ecash-sealed", id: o }));
      } finally {
        c.closeAll();
      }
    }
    case "vaultStatus":
      return u.signer ? u.connectionVaultRoot ? { enabled: !0, vaultPublicKey: Jn().vaultPublicKey } : { enabled: !1, reason: u.vaultKnown ? "no-vault" : "stale-cache" } : { enabled: !1 };
    case "vaultList": {
      const { connections: n, rollbackWarnings: r, unreadable: s, truncated: i, quorumMet: a } = await Ot();
      return { connections: n.map(Qe), rollbackWarnings: r, unreadable: s, truncated: i, quorumMet: a };
    }
    case "vaultSaveNwc": {
      const n = t, r = _n(n.site), s = Jn(), i = to(n.uri), a = n.label.trim().slice(0, 120) || "Wallet connection", { record: c, event: l } = await s.createConnection({
        connection_type: "nwc",
        tier: "connectable",
        label: a,
        credential: i,
        application_binding: { origin: r, app_pubkey: null }
      });
      if (!(await s.publish({
        event: l,
        connectionId: c.connection_id,
        relayUrls: K,
        store: w
      })).success)
        throw new Error("The connection could not be saved to enough relays. Please try again.");
      const y = await s.decryptEvent(l);
      return Qe(y);
    }
    case "vaultFindForOrigin": {
      const n = _n(t.site), { connections: r } = await Ot(), s = r.find(
        (i) => i.record.connection_type === "nwc" && i.record.state === "active" && i.record.application_binding.origin === n
      );
      return { connection: s ? Qe(s) : null };
    }
    case "vaultRevealNwc": {
      const n = t, r = _n(n.site), { connection: s } = await Pn(n.connectionId);
      if (s.record.connection_type !== "nwc" || s.record.state !== "active")
        throw new Error("That connection is not an active wallet connection.");
      const i = s.record.application_binding.origin;
      if (i !== null && i !== r)
        throw new Error("That connection belongs to a different site.");
      const a = s.record.credential;
      return Rs(a), { uri: Zc(a) };
    }
    case "vaultSetBinding": {
      const n = t, { vault: r, connection: s } = await Pn(n.connectionId), i = n.origin === null ? null : re(), { record: a, event: c } = await r.updateConnection(s, {
        application_binding: { origin: i, app_pubkey: null }
      });
      if (!(await r.publish({
        event: c,
        connectionId: a.connection_id,
        relayUrls: K,
        store: w
      })).success) throw new Error("The change could not reach enough relays. Please try again.");
      const d = await r.decryptEvent(c);
      return Qe(d);
    }
    case "vaultDelete": {
      const n = t, { vault: r, connection: s } = await Pn(n.connectionId), { record: i, event: a } = await r.deleteConnection(s);
      if (!(await r.publish({
        event: a,
        connectionId: i.connection_id,
        relayUrls: K,
        store: w
      })).success) throw new Error("The deletion could not reach enough relays. Please try again.");
      try {
        const l = r.buildDeletionRequest(s.event.id), d = new C(K);
        await d.publishAll(l), d.closeAll();
      } catch {
      }
      return {};
    }
    case "vaultOfferCheck": {
      const n = t, r = re(), s = to(n.uri), { connections: i } = await Ot(), a = i.find(
        (c) => c.record.connection_type === "nwc" && el(c.record.credential, s)
      );
      return a ? a.record.application_binding.origin !== r ? { duplicate: !1 } : { duplicate: !0, connection: Qe(a) } : { duplicate: !1 };
    }
    default:
      throw new Error(`Unknown worker action: ${e}`);
  }
}
const mu = /* @__PURE__ */ new Set([
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
self.addEventListener("message", (e) => {
  const t = e.data;
  if (!t || typeof t != "object" || typeof t.id != "string") return;
  if (typeof t.action != "string" || !mu.has(t.action)) {
    const i = {
      id: t.id,
      ok: !1,
      error: `Unknown worker action: ${String(t.action)}`,
      errorName: "Error"
    };
    self.postMessage(i);
    return;
  }
  const { id: o, action: n, payload: r } = e.data;
  // The peeks too: they read the browser's own sealed copy and change nothing, and they are what is on screen while
  // the queue is busy asking relays (docs/panel-speed-2026-11-23.md).
  (n.startsWith("nip46") || n === "ecashPeek" || n === "drivePeek" || n === "receiptsPeek" ? (i) => i() : (i) => yu.run(fu[n] ?? null, i))(() => gu(n, r, o)).then(
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
