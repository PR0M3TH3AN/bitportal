import { K as Xi, b as Zi, c as L, D as io, d as Kt, w as P, f as Mt, g as ot, h as Vn, S as Gt, j as Ht, k as qe, l as ft, B as es, m as ts, n as zt, o as it, q as Fn, r as Wn, a as Qe, s as so, t as ns, u as rs } from "./bitlogin-shared-Gk6LhfK5.js";
import { g as _, s as U, v as R, b as Ie, a as D, f as $e, e as os, h as is, i as ss, j as as, k as cs, l as en, m as Cr, n as ao, o as ls, p as us, q as ds, t as co, u as q, w as Bn, x as jn, y as lo, z as ys, c as T, d as O, A as Jn, B as fs, C as uo, D as wn, E as Fe } from "./bitlogin-shared-CvPtgHf2.js";
import { u as gt, c as ps, b as It, h as Gn, l as yo, s as hs, a as pt } from "./bitlogin-shared-rALvK5cw.js";
import { b as ht, r as Q, c as Y, k as vs, i as Ne, w as Se, R as Ke, T as tn, d as nn, n as Nr, t as ws, m as gs, N as gn, e as Tr, g as Mr, h as fo, j as ms, l as bs } from "./bitlogin-shared-DkdmxQvn.js";
import { z as be, B as Hn, C as mn, D as ks, E as Ye, F as Xe, G as Ze, H as re, I as ee, J as po, K as ho, L as st, M as zn, w as at, c as Ot, r as Qn, m as Yn, g as Lt, N as de, u as Es, O as We, i as mt, Q as _s, T as Ps, U as Ss, V as Ks, X as As, Y as Rs, Z as Cs, _ as Ns, $ as Ts, a0 as Ir, a1 as Ms, a2 as Is, a3 as Os, a4 as Ls, a5 as Ds, a6 as xs, a7 as vo, e as Us, k as qs, a8 as $s, a9 as Vs, aa as Fs, ab as Ws, ac as Bs, ad as js, ae as Js, af as Or } from "./bitlogin-shared-BkM-XX5B.js";
import { a as ct, h as Xn, P as wo, b as go, W as bn, E as lt, q as et, v as mo, w as Gs, x as Hs, y as bo, z as ko, H as zs, A as Qs, B as Ys, U as Xs, p as Lr, C as Zs } from "./bitlogin-shared-BK8HgLxP.js";
import { e as Zn, a as er, b as tr } from "./bitlogin-shared-PwbHDYud.js";
function Eo(e) {
  const t = _(e.privateKey);
  return U({
    pubkey: t,
    created_at: e.createdAt,
    kind: Xi,
    tags: [
      ["e", e.eventIdToDelete],
      ["k", String(e.deletedEventKind)]
    ],
    content: e.reason ?? ""
  }, e.privateKey);
}
function ea() {
  const e = globalThis.WebSocket;
  if (!e)
    throw new Error("No global WebSocket implementation is available in this environment.");
  return e;
}
const Dt = 1e3, ta = 262144;
function na(e) {
  const t = Math.min(e.limit ?? Dt, Dt);
  return Math.max(50, t * 3);
}
const ra = 2048, oa = 1e4, ia = 100;
function sa(e, t) {
  if (e.size >= ra) {
    const n = e.values().next().value;
    n !== void 0 && e.delete(n);
  }
  e.add(t);
}
class nr {
  url;
  ws = null;
  connectPromise = null;
  subs = /* @__PURE__ */ new Map();
  pendingPublishes = /* @__PURE__ */ new Map();
  authPrivateKey;
  connectTimeoutMs;
  authenticated = !1;
  constructor(t, n = {}) {
    if (!ht(t))
      throw new Error("Relay URL must use secure WebSockets, except for an explicit loopback development endpoint.");
    this.url = t, this.authPrivateKey = n.authPrivateKey, this.connectTimeoutMs = n.connectTimeoutMs ?? 8e3;
  }
  async connect() {
    return this.connectPromise ? this.connectPromise : (this.connectPromise = new Promise((t, n) => {
      const r = ea(), o = new r(this.url);
      this.ws = o;
      const i = setTimeout(() => {
        n(new Error(`Timed out connecting to relay ${this.url}`));
      }, this.connectTimeoutMs);
      o.addEventListener("open", () => {
        clearTimeout(i);
        for (const [s, a] of this.subs)
          o.send(JSON.stringify(["REQ", s, a.filter]));
        t();
      }), o.addEventListener("error", () => {
        clearTimeout(i), n(new Error(`WebSocket error connecting to relay ${this.url}`));
      }), o.addEventListener("close", () => {
        this.connectPromise = null;
      }), o.addEventListener("message", (s) => {
        this.handleMessage(String(s.data));
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
    if (t.length > ta)
      return;
    let n;
    try {
      n = JSON.parse(t);
    } catch {
      return;
    }
    if (!Array.isArray(n) || typeof n[0] != "string")
      return;
    const [r, ...o] = n;
    if (r === "EVENT") {
      const [i, s] = o;
      if (typeof i != "string")
        return;
      const a = this.subs.get(i);
      if (!a)
        return;
      const c = s?.id;
      if (typeof c != "string" || a.seenIds.has(c))
        return;
      if (a.onEvent) {
        const d = Date.now();
        if (d - a.liveWindowStart >= oa && (a.liveWindowStart = d, a.liveVerifies = 0), a.liveVerifies >= ia || (a.liveVerifies++, !R(s) || !Dr(s, a.filter)))
          return;
        sa(a.seenIds, s.id), a.onEvent(s);
        return;
      }
      const u = Math.min(a.filter.limit ?? Dt, Dt);
      if (a.events.length >= u || a.verifyBudget <= 0 || (a.verifyBudget--, !R(s) || !Dr(s, a.filter)))
        return;
      a.seenIds.add(s.id), a.events.push(s);
      return;
    }
    if (r === "EOSE") {
      const [i] = o;
      if (typeof i != "string")
        return;
      this.subs.get(i)?.onEose();
      return;
    }
    if (r === "OK") {
      const [i, s, a] = o;
      if (typeof i != "string" || typeof s != "boolean" || a !== void 0 && typeof a != "string")
        return;
      this.pendingPublishes.get(i)?.({ ok: s, message: a ?? "" }), this.pendingPublishes.delete(i);
      return;
    }
    if (r === "AUTH") {
      const [i] = o;
      if (typeof i != "string")
        return;
      this.respondToAuthChallenge(i);
      return;
    }
  }
  async respondToAuthChallenge(t) {
    if (!this.authPrivateKey)
      return;
    const n = _(this.authPrivateKey), r = U({
      pubkey: n,
      created_at: Math.floor(Date.now() / 1e3),
      kind: Zi,
      tags: [
        ["relay", this.url],
        ["challenge", t]
      ],
      content: ""
    }, this.authPrivateKey);
    this.authenticated = !0, this.send(["AUTH", r]);
  }
  isAuthenticated() {
    return this.authenticated;
  }
  async publish(t, n = 8e3) {
    return await this.connect(), new Promise((r) => {
      const o = setTimeout(() => {
        this.pendingPublishes.delete(t.id), r({ ok: !1, message: "timeout: no OK received from relay" });
      }, n);
      this.pendingPublishes.set(t.id, (i) => {
        clearTimeout(o), r(i);
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
  async subscribeLive(t, n) {
    await this.connect();
    const r = Ie(D(8));
    return this.subs.set(r, {
      events: [],
      seenIds: /* @__PURE__ */ new Set(),
      verifyBudget: Number.POSITIVE_INFINITY,
      liveWindowStart: Date.now(),
      liveVerifies: 0,
      filter: t,
      onEose: () => {
      },
      onEvent: n
    }), this.send(["REQ", r, t]), {
      close: () => {
        if (this.subs.delete(r))
          try {
            this.send(["CLOSE", r]);
          } catch {
          }
      }
    };
  }
  async queryOnce(t, n = 8e3) {
    await this.connect();
    const r = Ie(D(8));
    return new Promise((o, i) => {
      const s = [], a = (u) => {
        clearTimeout(c), this.subs.delete(r);
        try {
          this.send(["CLOSE", r]);
        } catch {
        }
        u ? i(u) : o(s);
      }, c = setTimeout(() => a(new Error("relay did not answer the subscription before the timeout")), n);
      this.subs.set(r, {
        events: s,
        seenIds: /* @__PURE__ */ new Set(),
        verifyBudget: na(t),
        liveWindowStart: 0,
        liveVerifies: 0,
        filter: t,
        onEose: () => a()
      }), this.send(["REQ", r, t]);
    });
  }
}
function Dr(e, t) {
  if (t.ids && !t.ids.some((n) => e.id.startsWith(n)) || t.authors && !t.authors.some((n) => e.pubkey.startsWith(n)) || t.kinds && !t.kinds.includes(e.kind) || t.since !== void 0 && e.created_at < t.since || t.until !== void 0 && e.created_at > t.until)
    return !1;
  for (const [n, r] of Object.entries(t)) {
    if (!n.startsWith("#") || !Array.isArray(r))
      continue;
    const o = n.slice(1), i = r;
    if (!e.tags.some((s) => s[0] === o && i.some((a) => a === (s[1] ?? ""))))
      return !1;
  }
  return !0;
}
class E {
  connections = /* @__PURE__ */ new Map();
  constructor(t, n = {}) {
    for (const r of new Set(t))
      this.connections.set(r, new nr(r, n));
  }
  get relayUrls() {
    return [...this.connections.keys()];
  }
  /** Queries every configured relay and waits for a quorum of responses (or all timeouts) before returning (§16.2). */
  async queryQuorum(t, n = 8e3) {
    const r = [...this.connections.entries()], o = await Promise.all(r.map(async ([a, c]) => {
      try {
        const u = await c.queryOnce(t, n);
        return { relayUrl: a, events: u, responded: !0 };
      } catch (u) {
        return { relayUrl: a, events: [], responded: !1, error: u.message };
      }
    })), i = o.filter((a) => a.responded).length, s = o.length;
    return {
      outcomes: o,
      quorumMet: i >= Math.ceil(s / 2),
      respondedCount: i,
      totalCount: s
    };
  }
  /** Publishes an event to every configured relay, best-effort (§15.6, §24.4). */
  async publishAll(t, n = 8e3) {
    const r = [...this.connections.entries()];
    return Promise.all(r.map(async ([o, i]) => {
      try {
        const s = await i.publish(t, n);
        return { relayUrl: o, result: s };
      } catch (s) {
        return { relayUrl: o, result: { ok: !1, message: s.message } };
      }
    }));
  }
  closeAll() {
    for (const t of this.connections.values())
      t.close();
  }
}
function x(e) {
  return e.filter((t) => t.result.ok).length;
}
const vt = null, _o = [
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
], Po = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  // Added 2026-11-18: relay.nostr.band timed out and nostr-pub.wellorder.net
  // never connected in the same measurement, leaving two working lookups.
  "wss://nos.lol"
], aa = [], ca = /^[0-9a-f]{64}$/u, la = 64;
function rn(e) {
  return Array.isArray(e) && e.length <= la && e.every((t) => typeof t == "string" && ht(t)) && new Set(e).size === e.length;
}
function Qt(e, t = vt, n = -1) {
  if (!t || !ca.test(t) || /^0{64}$/u.test(t) || !R(e) || e.pubkey !== t || e.kind !== L || $e(e, "d") !== io)
    return null;
  try {
    const r = JSON.parse(e.content);
    if (typeof r != "object" || r === null || Array.isArray(r))
      return null;
    const o = r;
    return !Number.isSafeInteger(o.version) || o.version < 1 || o.version <= n || !rn(o.vaultRelays) || !rn(o.discoveryRelays) || o.deprecated !== void 0 && !rn(o.deprecated) ? null : {
      version: o.version,
      vaultRelays: o.vaultRelays,
      discoveryRelays: o.discoveryRelays,
      ...o.deprecated === void 0 ? {} : { deprecated: o.deprecated }
    };
  } catch {
    return null;
  }
}
function ua(e) {
  return Math.max(0, e - 1);
}
function xr(e, t, n) {
  const r = t ? n === "vault" ? t.vaultRelays : t.discoveryRelays : [], o = new Set(t?.deprecated ?? []), i = new Set(e), s = [...new Set(r)].filter((a) => !o.has(a) && !i.has(a)).slice(0, ua(e.length));
  return [...e, ...s];
}
async function da(e, t = vt, n = -1, r = 6e3) {
  if (!t || e.length === 0)
    return null;
  const o = new E([...e]);
  let i;
  try {
    i = (await o.queryQuorum({ kinds: [L], authors: [t], "#d": [io], limit: 3 }, r)).outcomes.flatMap((c) => c.events);
  } finally {
    o.closeAll();
  }
  let s = null;
  for (const a of i) {
    const c = Qt(a, t, n);
    c && (!s || c.version > s.list.version) && (s = { event: a, list: c });
  }
  return s;
}
const So = "bitlogin:bootstrap-relays:v1";
async function Ko(e, t = vt) {
  if (!t)
    return null;
  try {
    const n = await e.get(So);
    return n ? Qt(JSON.parse(n), t) : null;
  } catch {
    return null;
  }
}
function At(e) {
  return {
    vaultRelays: xr(_o, e, "vault"),
    discoveryRelays: xr(Po, e, "discovery"),
    listVersion: e?.version ?? null
  };
}
async function ya(e, t = {}) {
  const n = t.maintainerPubkeyHex === void 0 ? vt : t.maintainerPubkeyHex, r = await Ko(e, n);
  if (!n)
    return At(null);
  const o = At(r), i = r?.version ?? -1;
  try {
    let s = await da(t.queryRelayUrls ?? [.../* @__PURE__ */ new Set([...o.vaultRelays, ...o.discoveryRelays])], n, i, t.timeoutMs);
    if (!s) {
      const a = await fa(t.httpsFallbackUrls ?? aa, n, i), c = a ? Qt(a, n, i) : null;
      a && c && (s = { event: a, list: c });
    }
    return s ? (await e.set(So, JSON.stringify(s.event)), At(s.list)) : o;
  } catch {
    return o;
  }
}
async function fa(e, t = vt, n = -1) {
  if (!t)
    return null;
  for (const r of e)
    try {
      if (new URL(r).protocol !== "https:")
        continue;
      const o = await fetch(r);
      if (!o.ok || Number(o.headers.get("content-length") ?? 0) > 1e6)
        continue;
      const s = await o.text();
      if (s.length > 1e6)
        continue;
      const a = JSON.parse(s);
      if (R(a) && Qt(a, t, n))
        return a;
    } catch {
    }
  return null;
}
const rr = /^[0-9a-f]{64}$/u, pa = 8, ha = 4096, va = 256, wa = 512;
class Ae extends Error {
  name = "BunkerUriParseError";
}
class ga extends Error {
  name = "Nip46RequestTimeoutError";
  constructor(t, n) {
    super(`The remote signer did not answer ${t} within ${Math.round(n / 1e3)}s. It may be offline, or waiting for your approval on another device -- check your signer and try again.`);
  }
}
class ma extends Error {
  name = "Nip46ErrorResponse";
}
function ba(e) {
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return null;
  }
  const n = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol === "https:" || t.protocol === "http:" && n ? t.toString() : null;
}
function ka(e) {
  if (e.length > ha)
    throw new Ae("That bunker URI is unreasonably long.");
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    throw new Ae("That doesn't look like a valid URI.");
  }
  if (t.protocol !== "bunker:")
    throw new Ae("A remote-signer URI must start with bunker://");
  const n = (t.host || t.pathname.replace(/^\/+/u, "")).toLowerCase();
  if (!rr.test(n))
    throw new Ae("The bunker URI does not name a valid signer public key.");
  const r = [
    ...new Set(t.searchParams.getAll("relay").map((i) => i.trim()).filter((i) => i.length > 0 && i.length <= wa))
  ].slice(0, pa);
  if (r.length === 0)
    throw new Ae("The bunker URI names no relays -- without at least one relay= parameter there is no way to reach the signer.");
  const o = t.searchParams.get("secret") ?? void 0;
  if (o && o.length > va)
    throw new Ae("The bunker URI's secret is unreasonably long.");
  return { signerPubkey: n, relayUrls: r, secret: o || void 0 };
}
function Ea(e) {
  if (!rr.test(e.clientPubkey))
    throw new Error("Client public key must be 64 hex characters.");
  if (e.relayUrls.length === 0)
    throw new Error("At least one relay is required.");
  if (!e.secret)
    throw new Error("A nostrconnect secret is required.");
  const t = new URLSearchParams();
  for (const n of e.relayUrls)
    t.append("relay", n);
  return t.set("secret", e.secret), e.name && t.set("name", e.name), e.perms?.length && t.set("perms", e.perms.join(",")), `nostrconnect://${e.clientPubkey}?${t.toString()}`;
}
const _a = 12e4;
class Ur {
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
    this.clientSecretKey = t.clientSecretKey, this.clientPubkey = _(t.clientSecretKey), this.pointer = t.pointer, this.conversationKey = be(t.clientSecretKey, t.pointer.signerPubkey), this.onAuthUrl = t.onAuthUrl, this.requestTimeoutMs = t.requestTimeoutMs ?? _a, this.conns = t.pointer.relayUrls.map((n) => new nr(n, { authPrivateKey: t.clientSecretKey }));
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
        kinds: [Kt],
        authors: [this.pointer.signerPubkey],
        "#p": [this.clientPubkey]
      }, n = await Promise.allSettled(this.conns.map((r) => r.subscribeLive(t, (o) => this.handleResponse(o))));
      if (this.subs = n.filter((r) => r.status === "fulfilled").map((r) => r.value), this.subs.length === 0)
        throw this.startPromise = null, new Error("Could not reach any of the signer's relays.");
    })()), this.startPromise;
  }
  handleResponse(t) {
    if (t.pubkey !== this.pointer.signerPubkey)
      return;
    let n;
    try {
      n = JSON.parse(Hn(this.conversationKey, t.content));
    } catch {
      return;
    }
    if (typeof n.id != "string")
      return;
    const r = this.pending.get(n.id);
    if (r) {
      if (n.result === "auth_url") {
        if (!r.authUrlSeen && typeof n.error == "string" && n.error) {
          const o = ba(n.error);
          o && (r.authUrlSeen = !0, this.onAuthUrl?.(o));
        }
        return;
      }
      if (this.pending.delete(n.id), clearTimeout(r.timer), typeof n.error == "string" && n.error) {
        r.reject(new ma(n.error));
        return;
      }
      if (typeof n.result != "string") {
        r.reject(new Error("The signer returned a malformed response."));
        return;
      }
      r.resolve(n.result);
    }
  }
  async rpc(t, n) {
    await this.start();
    const r = Ie(D(8)), o = mn(this.conversationKey, JSON.stringify({ id: r, method: t, params: n })), i = [["p", this.pointer.signerPubkey]], s = U({
      pubkey: this.clientPubkey,
      created_at: Math.floor(Date.now() / 1e3),
      kind: Kt,
      tags: i,
      content: o
    }, this.clientSecretKey), a = new Promise((d, y) => {
      const f = setTimeout(() => {
        this.pending.delete(r), y(new ga(t, this.requestTimeoutMs));
      }, this.requestTimeoutMs);
      this.pending.set(r, { resolve: d, reject: y, timer: f, authUrlSeen: !1 });
    });
    if (a.catch(() => {
    }), !(await Promise.allSettled(this.conns.map((d) => d.publish(s)))).some((d) => d.status === "fulfilled" && d.value.ok)) {
      const d = this.pending.get(r);
      throw d && (this.pending.delete(r), clearTimeout(d.timer)), new Error("No relay accepted the request to the signer.");
    }
    return a;
  }
  /** bunker:// flow: announce ourselves; any non-error answer is acceptance. */
  async connect() {
    await this.rpc("connect", [this.pointer.signerPubkey, this.pointer.secret ?? ""]);
  }
  async getUserPublicKey() {
    const t = (await this.rpc("get_public_key", [])).trim().toLowerCase();
    if (!rr.test(t))
      throw new Error("The signer returned an invalid public key.");
    return this.userPubkeyKnown = t, t;
  }
  async signEvent(t) {
    const n = this.userPubkeyKnown ? { ...t, pubkey: this.userPubkeyKnown } : t, r = await this.rpc("sign_event", [JSON.stringify(n)]);
    let o;
    try {
      o = JSON.parse(r);
    } catch {
      throw new Error("The signer returned a malformed signed event.");
    }
    if (!R(o))
      throw new Error("The signer returned an event that does not verify.");
    if (this.userPubkeyKnown && o.pubkey !== this.userPubkeyKnown)
      throw new Error("The signer returned an event signed by a different identity.");
    if (o.kind !== t.kind || o.content !== t.content || o.created_at !== t.created_at || JSON.stringify(o.tags) !== JSON.stringify(t.tags))
      throw new Error("The signer returned a different event than the one requested.");
    return o;
  }
  async nip44Encrypt(t, n) {
    return this.rpc("nip44_encrypt", [t, n]);
  }
  async nip44Decrypt(t, n) {
    return this.rpc("nip44_decrypt", [t, n]);
  }
  async nip04Encrypt(t, n) {
    return this.rpc("nip04_encrypt", [t, n]);
  }
  async nip04Decrypt(t, n) {
    return this.rpc("nip04_decrypt", [t, n]);
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
      const t = Ie(D(8)), n = mn(this.conversationKey, JSON.stringify({ id: t, method: "logout", params: [] }));
      return U({
        pubkey: this.clientPubkey,
        created_at: Math.floor(Date.now() / 1e3),
        kind: Kt,
        tags: [["p", this.pointer.signerPubkey]],
        content: n
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
  async publishCourtesy(t, n = 2e3) {
    try {
      await Promise.race([
        Promise.allSettled(this.conns.map((r) => r.publish(t))),
        new Promise((r) => setTimeout(r, n))
      ]);
    } catch {
    } finally {
      for (const r of this.conns)
        r.close();
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
async function Pa(e) {
  const t = _(e.clientSecretKey), n = e.timeoutMs, r = e.relayUrls.map((i) => new nr(i, { authPrivateKey: e.clientSecretKey })), o = () => {
    for (const i of r)
      i.close();
  };
  return new Promise((i, s) => {
    let a = !1;
    const c = () => u(new Error("The signer-connection attempt was cancelled.")), u = (p) => {
      a || (a = !0, clearTimeout(d), e.signal?.removeEventListener("abort", c), o(), p instanceof Error ? s(p) : i(p));
    }, d = setTimeout(() => u(new Error(`No signer connected within ${Math.round(n / 1e3)}s. Scan or paste the connection code in your signer app, then try again.`)), n);
    if (e.signal?.aborted) {
      c();
      return;
    }
    e.signal?.addEventListener("abort", c, { once: !0 });
    const y = { kinds: [Kt], "#p": [t] }, f = (p) => {
      let v, h = null;
      try {
        h = be(e.clientSecretKey, p.pubkey), v = JSON.parse(Hn(h, p.content));
      } catch {
        return;
      } finally {
        h && P(h);
      }
      v.result === e.secret && u({ signerPubkey: p.pubkey });
    };
    Promise.allSettled(r.map((p) => p.subscribeLive(y, f))).then((p) => {
      p.some((v) => v.status === "fulfilled") || u(new Error("Could not reach any relay to listen for the signer."));
    });
  });
}
function or() {
  const e = globalThis.crypto;
  if (!e || !e.subtle)
    throw new Error("WebCrypto SubtleCrypto is not available in this environment.");
  return e;
}
async function Ao(e) {
  if (e.length !== 32)
    throw new Error("AES-256-GCM key must be exactly 32 bytes.");
  return or().subtle.importKey("raw", e, "AES-GCM", !1, ["encrypt", "decrypt"]);
}
async function Ro(e, t, n) {
  const r = os(), o = await Ao(e), i = await or().subtle.encrypt({ name: "AES-GCM", iv: r, additionalData: n, tagLength: 128 }, o, t);
  return { nonce: r, ciphertext: new Uint8Array(i) };
}
async function Co(e, t, n, r) {
  const o = await Ao(e);
  try {
    const i = await or().subtle.decrypt({ name: "AES-GCM", iv: t, additionalData: r, tagLength: 128 }, o, n);
    return new Uint8Array(i);
  } catch {
    throw new Error("AES-256-GCM authentication failed: capsule is corrupted, tampered, or the wrong key was used.");
  }
}
const No = `abandon
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
function Sa(e, t, n, r) {
  as(e);
  const o = cs({ dkLen: 32, asyncTick: 10 }, r), { c: i, dkLen: s, asyncTick: a } = o;
  if (en(i), en(s), en(a), i < 1)
    throw new Error("iterations (c) should be >= 1");
  const c = Cr(t), u = Cr(n), d = new Uint8Array(s), y = ao.create(e, c), f = y._cloneInto().update(u);
  return { c: i, dkLen: s, asyncTick: a, DK: d, PRF: y, PRFSalt: f };
}
function Ka(e, t, n, r, o) {
  return e.destroy(), t.destroy(), r && r.destroy(), ls(o), n;
}
async function Aa(e, t, n, r) {
  const { c: o, dkLen: i, asyncTick: s, DK: a, PRF: c, PRFSalt: u } = Sa(e, t, n, r);
  let d;
  const y = new Uint8Array(4), f = is(y), p = new Uint8Array(c.outputLen);
  for (let v = 1, h = 0; h < i; v++, h += c.outputLen) {
    const g = a.subarray(h, h + c.outputLen);
    f.setInt32(0, v, !1), (d = u._cloneInto(d)).update(y).digestInto(p), g.set(p.subarray(0, g.length)), await ss(o - 1, s, () => {
      c._cloneInto(d).update(p).digestInto(p);
      for (let m = 0; m < g.length; m++)
        g[m] ^= p[m];
    });
  }
  return Ka(c, u, a, d, p);
}
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const Ra = (e) => e[0] === "あいこくしん";
function To(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function Mo(e) {
  const t = To(e), n = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(n.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: n };
}
function Io(e) {
  ds(e, 16, 20, 24, 28, 32);
}
const Ca = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([co(e)[0] >> t << t]);
};
function Oo(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), gt.chain(gt.checksum(1, Ca), gt.radix2(11, !0), gt.alphabet(e));
}
function Na(e, t) {
  const { words: n } = Mo(e), r = Oo(t).decode(n);
  return Io(r), r;
}
function Ta(e, t) {
  return Io(e), Oo(t).encode(e).join(Ra(t) ? "　" : " ");
}
function Ma(e, t) {
  try {
    Na(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const Ia = (e) => To("mnemonic" + e);
function Oa(e, t = "") {
  return Aa(us, Mo(e).nfkd, Ia(t), { c: 2048, dkLen: 64 });
}
function La(e) {
  if (e.length !== 16)
    throw new Error("Recovery phrase entropy must be exactly 128 bits (16 bytes).");
  return Ta(e, No);
}
function Lo(e) {
  try {
    return Ma(Do(e), No);
  } catch {
    return !1;
  }
}
function Do(e) {
  return e.trim().normalize("NFKD").toLowerCase().split(/\s+/u).join(" ");
}
async function ir(e) {
  return Oa(Do(e), "");
}
const Rt = [1024, 2048, 4096], ge = 4;
function Da(e) {
  const t = ge + e.length, n = Rt.find((i) => i >= t);
  if (n === void 0)
    throw new Error(`Payload of ${e.length} bytes exceeds the largest padding bucket (${Rt[Rt.length - 1]} bytes minus ${ge}-byte length prefix).`);
  const r = new Uint8Array(n);
  return new DataView(r.buffer).setUint32(0, e.length, !1), r.set(e, ge), r;
}
function xa(e) {
  if (!Rt.includes(e.length))
    throw new Error(`Padded plaintext length ${e.length} does not match a known bucket.`);
  const n = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !1);
  if (n > e.length - ge)
    throw new Error("Declared payload length exceeds the padded bucket size.");
  const r = e.slice(ge, ge + n), o = e.slice(ge + n);
  for (const i of o)
    if (i !== 0)
      throw new Error("Padding bytes are not all zero; capsule plaintext is malformed.");
  return r;
}
function Ua(e) {
  const t = ps(e);
  if (t === void 0)
    throw new Error("Value is not JSON-serializable for canonicalization.");
  return t;
}
function qa(e) {
  return q(Ua(e));
}
const ue = 16, $a = 283;
function Va(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function sr(e) {
  return e << 1 ^ $a & -(e >> 7);
}
function Te(e, t) {
  let n = 0;
  for (; t > 0; t >>= 1)
    n ^= e & -(t & 1), e = sr(e);
  return n;
}
const kn = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let n = 0, r = 1; n < 256; n++, r ^= sr(r))
    e[n] = r;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let n = 0; n < 255; n++) {
    let r = e[255 - n];
    r |= r << 8, t[e[n]] = (r ^ r >> 4 ^ r >> 5 ^ r >> 6 ^ r >> 7 ^ 99) & 255;
  }
  return st(e), t;
})(), Fa = /* @__PURE__ */ kn.map((e, t) => kn.indexOf(t)), Wa = (e) => e << 24 | e >>> 8, on = (e) => e << 8 | e >>> 24;
function xo(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const n = new Uint32Array(256).map((u, d) => t(e[d])), r = n.map(on), o = r.map(on), i = o.map(on), s = new Uint32Array(256 * 256), a = new Uint32Array(256 * 256), c = new Uint16Array(256 * 256);
  for (let u = 0; u < 256; u++)
    for (let d = 0; d < 256; d++) {
      const y = u * 256 + d;
      s[y] = n[u] ^ r[d], a[y] = o[u] ^ i[d], c[y] = e[u] << 8 | e[d];
    }
  return { sbox: e, sbox2: c, T0: n, T1: r, T2: o, T3: i, T01: s, T23: a };
}
const ar = /* @__PURE__ */ xo(kn, (e) => Te(e, 3) << 24 | e << 16 | e << 8 | Te(e, 2)), Uo = /* @__PURE__ */ xo(Fa, (e) => Te(e, 11) << 24 | Te(e, 13) << 16 | Te(e, 9) << 8 | Te(e, 14)), Ba = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, n = 1; t < 16; t++, n = sr(n))
    e[t] = n;
  return e;
})();
function qo(e) {
  zn(e);
  const t = e.length;
  Va(e);
  const { sbox2: n } = ar, r = [];
  (!Ye || !Xe(e)) && r.push(e = Ze(e));
  const o = ee(re(e)), i = o.length, s = (c) => j(n, c, c, c, c), a = new Uint32Array(t + 28);
  a.set(o);
  for (let c = i; c < a.length; c++) {
    let u = a[c - 1];
    c % i === 0 ? u = s(Wa(u)) ^ Ba[c / i - 1] : i > 6 && c % i === 4 && (u = s(u)), a[c] = a[c - i] ^ u;
  }
  return st(...r), a;
}
function ja(e) {
  const t = qo(e), n = t.slice(), r = t.length, { sbox2: o } = ar, { T0: i, T1: s, T2: a, T3: c } = Uo;
  for (let u = 0; u < r; u += 4)
    for (let d = 0; d < 4; d++)
      n[u + d] = t[r - u - 4 + d];
  st(t);
  for (let u = 4; u < r - 4; u++) {
    const d = n[u], y = j(o, d, d, d, d);
    n[u] = i[y & 255] ^ s[y >>> 8 & 255] ^ a[y >>> 16 & 255] ^ c[y >>> 24];
  }
  return n;
}
function oe(e, t, n, r, o, i) {
  return e[n << 8 & 65280 | r >>> 8 & 255] ^ t[o >>> 8 & 65280 | i >>> 24 & 255];
}
function j(e, t, n, r, o) {
  return e[t & 255 | n & 65280] | e[r >>> 16 & 255 | o >>> 16 & 65280] << 16;
}
function qr(e, t, n, r, o) {
  const { sbox2: i, T01: s, T23: a } = ar;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const u = e.length / 4 - 2;
  for (let v = 0; v < u; v++) {
    const h = e[c++] ^ oe(s, a, t, n, r, o), g = e[c++] ^ oe(s, a, n, r, o, t), m = e[c++] ^ oe(s, a, r, o, t, n), k = e[c++] ^ oe(s, a, o, t, n, r);
    t = h, n = g, r = m, o = k;
  }
  const d = e[c++] ^ j(i, t, n, r, o), y = e[c++] ^ j(i, n, r, o, t), f = e[c++] ^ j(i, r, o, t, n), p = e[c++] ^ j(i, o, t, n, r);
  return { s0: d, s1: y, s2: f, s3: p };
}
function Ja(e, t, n, r, o) {
  const { sbox2: i, T01: s, T23: a } = Uo;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const u = e.length / 4 - 2;
  for (let v = 0; v < u; v++) {
    const h = e[c++] ^ oe(s, a, t, o, r, n), g = e[c++] ^ oe(s, a, n, t, o, r), m = e[c++] ^ oe(s, a, r, n, t, o), k = e[c++] ^ oe(s, a, o, r, n, t);
    t = h, n = g, r = m, o = k;
  }
  const d = e[c++] ^ j(i, t, o, r, n), y = e[c++] ^ j(i, n, t, o, r), f = e[c++] ^ j(i, r, n, t, o), p = e[c++] ^ j(i, o, r, n, t);
  return { s0: d, s1: y, s2: f, s3: p };
}
function Ga(e) {
  if (zn(e), e.length % ue !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + ue);
}
function Ha(e, t, n) {
  zn(e);
  let r = e.length;
  const o = r % ue;
  if (!t && o !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (t) {
    let a = ue - o;
    a || (a = ue), r = r + a;
  }
  n = po(r, n), ho(e, n), (!Ye || !Xe(e)) && (e = Ze(e));
  const i = re(e);
  ee(i);
  const s = re(n);
  return { b: i, o: s, out: n };
}
function za(e, t) {
  if (!t)
    return e;
  const n = e.length;
  if (n === 0)
    throw new Error("aes/pkcs7: empty ciphertext not allowed");
  const r = e[n - 1];
  let o = 1;
  o &= r - 1 >>> 31 ^ 1, o &= 16 - r >>> 31 ^ 1;
  for (let i = 0; i < 16; i++) {
    const s = i - r >>> 31, a = (e[n - 1 - i] ^ r) === 0 ? 1 : 0;
    o &= a | s ^ 1;
  }
  if (!o)
    throw new Error("aes/pkcs7: wrong padding");
  return e.subarray(0, n - r);
}
function Qa(e) {
  const t = new Uint8Array(16), n = re(t);
  t.set(e);
  const r = ue - e.length;
  for (let o = ue - r; o < ue; o++)
    t[o] = r;
  return n;
}
const $o = /* @__PURE__ */ ks({ blockSize: 16, nonceLength: 16 }, function(t, n, r = {}) {
  const o = !r.disablePadding;
  return {
    encrypt(i, s) {
      const a = qo(t), { b: c, o: u, out: d } = Ha(i, o, s);
      let y = n;
      const f = [a];
      (!Ye || !Xe(y)) && f.push(y = Ze(y));
      const p = re(y);
      ee(p);
      let v = p[0], h = p[1], g = p[2], m = p[3], k = 0;
      for (; k + 4 <= c.length; )
        v ^= c[k + 0], h ^= c[k + 1], g ^= c[k + 2], m ^= c[k + 3], { s0: v, s1: h, s2: g, s3: m } = qr(a, v, h, g, m), u[k++] = v, u[k++] = h, u[k++] = g, u[k++] = m;
      if (o) {
        const b = Qa(i.subarray(k * 4));
        ee(b), v ^= b[0], h ^= b[1], g ^= b[2], m ^= b[3], { s0: v, s1: h, s2: g, s3: m } = qr(a, v, h, g, m), u[k++] = v, u[k++] = h, u[k++] = g, u[k++] = m;
      }
      return ee(u), st(...f), d;
    },
    decrypt(i, s) {
      Ga(i);
      const a = ja(t);
      let c = n;
      const u = [a];
      (!Ye || !Xe(c)) && u.push(c = Ze(c));
      const d = re(c);
      ee(d), s = po(i.length, s), ho(i, s), (!Ye || !Xe(i)) && u.push(i = Ze(i));
      const y = re(i), f = re(s);
      ee(y);
      let p = d[0], v = d[1], h = d[2], g = d[3];
      for (let m = 0; m + 4 <= y.length; ) {
        const k = p, b = v, S = h, M = g;
        p = y[m + 0], v = y[m + 1], h = y[m + 2], g = y[m + 3];
        const { s0: $, s1: X, s2: pe, s3: Xt } = Ja(a, p, v, h, g);
        f[m++] = $ ^ k, f[m++] = X ^ b, f[m++] = pe ^ S, f[m++] = Xt ^ M;
      }
      return ee(f), st(...u), za(s, o);
    }
  };
});
function Vo(e, t) {
  const n = jn(new Uint8Array([2]), lo(t));
  return ys.getSharedSecret(e, n, !0).slice(1, 33);
}
function Ya(e, t, n) {
  return Xa(e, t, n, D(16));
}
function Xa(e, t, n, r) {
  if (r.length !== 16)
    throw new Error("NIP-04 iv must be exactly 16 bytes.");
  const o = Vo(e, t), i = $o(o, r).encrypt(q(n));
  return `${It.encode(i)}?iv=${It.encode(r)}`;
}
function Za(e, t, n) {
  const r = n.indexOf("?iv=");
  if (r === -1)
    throw new Error('NIP-04 payload is missing its "?iv=" suffix.');
  const o = It.decode(n.slice(0, r)), i = It.decode(n.slice(r + 4)), s = Vo(e, t), a = $o(s, i).decrypt(o);
  return Bn(a);
}
class Ee extends Error {
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
class Fo extends Error {
  constructor(t = "An account already exists with this login name and password. Sign in instead, or choose different credentials.") {
    super(t), this.name = "AccountAlreadyExistsError";
  }
}
class se extends Error {
  constructor(t) {
    super(t), this.name = "RecoveryFailedError";
  }
}
class Wo extends Error {
  seenGeneration;
  capsuleGeneration;
  constructor(t, n) {
    super(`This credential capsule reports generation ${n}, but this device has already seen generation ${t}. Refusing to log in with older, possibly-revoked credentials.`), this.name = "RollbackDetectedError", this.seenGeneration = t, this.capsuleGeneration = n;
  }
}
function ut(e, t) {
  const n = t ?? Math.floor(Date.now() / 1e3);
  return e == null ? n : Math.max(n, e + 1);
}
const ec = { generation: -1, recoveryGeneration: -1 };
function cr(e) {
  return `bitlogin:hwm:${e}`;
}
async function lr(e, t) {
  const n = await e.get(cr(t));
  return n ? JSON.parse(n) : ec;
}
async function Bo(e, t, n) {
  const r = await lr(e, t), o = {
    generation: Math.max(r.generation, n.generation ?? -1),
    recoveryGeneration: Math.max(r.recoveryGeneration, n.recoveryGeneration ?? -1)
  };
  return await e.set(cr(t), JSON.stringify(o)), o;
}
async function tc(e, t, n = { generation: 0, recoveryGeneration: -1 }) {
  await e.set(cr(t), JSON.stringify(n));
}
function nc(e, t, n) {
  return U({ pubkey: _(e), created_at: n, kind: Mt, tags: [], content: JSON.stringify(t) }, e);
}
function rc(e, t, n) {
  const r = t.map((o) => {
    const i = ["r", o.url];
    return o.read && !o.write && i.push("read"), o.write && !o.read && i.push("write"), i;
  });
  return U({ pubkey: _(e), created_at: n, kind: ot, tags: r, content: "" }, e);
}
function oc(e, t, n) {
  return U({
    pubkey: _(e),
    created_at: n,
    kind: Vn,
    tags: t.map((r) => ["relay", r]),
    content: ""
  }, e);
}
function ic(e) {
  return e.tags.filter((t) => t[0] === "r" && t[1]).map((t) => t[1]);
}
function sc(e) {
  return e.tags.filter((t) => t[0] === "relay" && t[1]).map((t) => t[1]);
}
async function ac(e) {
  const t = _(e.everydayPrivateKey), n = Math.floor(Date.now() / 1e3), r = [.../* @__PURE__ */ new Set([...e.generalRelays, ...e.dmRelays, ...e.discoveryRelays])], o = new E(r), [i, s, a] = await Promise.all([
    o.queryQuorum({ authors: [t], kinds: [Mt] }),
    o.queryQuorum({ authors: [t], kinds: [ot] }),
    o.queryQuorum({ authors: [t], kinds: [Vn] })
  ]);
  o.closeAll();
  const c = i.outcomes.some((g) => g.events.length > 0), u = s.outcomes.some((g) => g.events.length > 0), d = a.outcomes.some((g) => g.events.length > 0), y = new E(r);
  let f = null, p = null, v = null;
  const h = [];
  if (!c && (e.name || e.about || e.picture)) {
    const g = nc(e.everydayPrivateKey, { name: e.name, about: e.about, picture: e.picture }, n);
    h.push(y.publishAll(g).then((m) => void (f = m)));
  }
  if (!u) {
    const g = rc(e.everydayPrivateKey, e.generalRelays.map((m) => ({ url: m, read: !0, write: !0 })), n);
    h.push(y.publishAll(g).then((m) => void (p = m)));
  }
  if (!d) {
    const g = oc(e.everydayPrivateKey, e.dmRelays, n);
    h.push(y.publishAll(g).then((m) => void (v = m)));
  }
  return await Promise.all(h), y.closeAll(), {
    profilePublished: f !== null && x(f) > 0,
    relayListAcknowledgedCount: p !== null ? x(p) : 0,
    dmRelayListAcknowledgedCount: v !== null ? x(v) : 0,
    profileSkippedExisting: c,
    relayListSkippedExisting: u,
    dmRelayListSkippedExisting: d
  };
}
async function _e(e, t, n) {
  const r = n.minAcks ?? 2, o = n.minReadbacks ?? 2, i = await e.publishAll(t, n.timeoutMs), s = x(i), c = (await e.queryQuorum({ kinds: [L], authors: [t.pubkey], "#d": [n.dTag], limit: 5 }, n.timeoutMs)).outcomes.filter((u) => u.events.some((d) => d.id === t.id)).length;
  return {
    acknowledgedCount: s,
    readbackVerifiedCount: c,
    success: s >= r && c >= o
  };
}
function jo(e) {
  return q(`bitlogin|password-capsule|v1|${e}|30078|bitlogin:password:v1`);
}
function Jo(e) {
  return q(`bitlogin|recovery-capsule|v1|${e}|30078|bitlogin:recovery:v1`);
}
async function ur(e, t, n) {
  const r = qa(e), o = Da(r), i = await Ro(t, o, n);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    nonce: T(i.nonce),
    ciphertext: T(i.ciphertext)
  };
}
async function dr(e, t, n) {
  if (e.version !== 1 || e.algorithm !== "aes-256-gcm")
    throw new Error(`Unsupported capsule envelope version/algorithm: ${e.version}/${e.algorithm}`);
  const r = O(e.nonce), o = O(e.ciphertext), i = await Co(t, r, o, n), s = xa(i);
  return JSON.parse(Bn(s));
}
class yr extends Error {
  constructor(t) {
    super(t), this.name = "CapsuleValidationError";
  }
}
const cc = 1e6, lc = /^[0-9a-f]{64}$/u;
function N(e, t) {
  if (!e)
    throw new yr(t);
}
function xt(e) {
  return typeof e == "string" && lc.test(e);
}
function Go(e) {
  N(Array.isArray(e), "vault_relay_hints must be an array (§12.4.7).");
  for (const t of e)
    N(typeof t == "string", "Each relay hint must be a string (§12.4.7)."), N(ht(t), `Relay URL must use secure WebSockets, except for an explicit loopback development endpoint (§12.4.7): ${t}`);
}
function Ho(e) {
  N(typeof e == "string", "account_id must be a string (§12.4.2).");
  let t;
  try {
    t = O(e);
  } catch {
    throw new yr("account_id is not valid base64url (§12.4.2).");
  }
  N(t.length === 16, "account_id must decode to exactly 128 bits (§12.4.2).");
}
function zo(e, t) {
  N(typeof e == "string", "operational_private_key must be a string (§12.4.3).");
  const n = O(e);
  N(n.length === 32, "operational_private_key must be exactly 32 bytes (§12.4.3)."), N(Jn(n), "operational_private_key is not a valid secp256k1 scalar (§12.4.3)."), N(xt(t), "operational_public_key must be lowercase 64-char hex (§12.4.4).");
  const r = _(n);
  N(r === t, "operational_public_key does not match the derived public key (§12.4.4).");
}
function Ut(e, t) {
  N(typeof t == "string", `${e} must be a string (§CV5.2).`);
  let n;
  try {
    n = O(t);
  } catch {
    throw new yr(`${e} is not valid base64url (§CV5.2).`);
  }
  N(n.length === 32, `${e} must decode to exactly 32 bytes (§CV5.2).`);
}
function uc(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (N(t !== void 0 && n !== void 0, "connection_vault_root and vault_sudo_key must appear together (§CV5.2)."), Ut("connection_vault_root", t), Ut("vault_sudo_key", n));
}
function dc(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (N(t !== void 0, "vault_sudo_key cannot appear without connection_vault_root (§CV5.2)."), Ut("connection_vault_root", t), n !== void 0 && Ut("vault_sudo_key", n));
}
function Qo(e, t) {
  N(Number.isInteger(e) && e >= 0 && e <= cc, `${t} is out of supported bounds (§12.4.8).`);
}
function yc(e) {
  N(e.schema === Ht, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), Ho(e.account_id), Qo(e.generation, "generation"), zo(e.operational_private_key, e.operational_public_key), N(xt(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex (§12.4.5)."), Go(e.vault_relay_hints), dc(e);
  const t = e.recovery_capsule_event;
  N(!!t && typeof t == "object", "recovery_capsule_event must be present (§12.4.6)."), N(R(t), "Embedded recovery_capsule_event has an invalid event id or signature (§12.4.6)."), N(t.pubkey === e.recovery_public_key, "Embedded recovery_capsule_event author does not match recovery_public_key (§12.4.5).");
}
function fc(e) {
  N(e.schema === Gt, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), Ho(e.account_id), Qo(e.recovery_generation, "recovery_generation"), N(e.previous_recovery_event_id === null || xt(e.previous_recovery_event_id), "previous_recovery_event_id must be null or lowercase 64-char hex (§12.3)."), zo(e.operational_private_key, e.operational_public_key), N(xt(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex."), Go(e.vault_relay_hints), uc(e);
}
function pc(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e) {
    const o = t.get(r.recoveryGeneration);
    if (o && o.eventId !== r.eventId)
      return {
        consistent: !1,
        warning: `Two different recovery capsules both claim generation ${r.recoveryGeneration}: possible fork, replay, or relay misbehavior.`
      };
    t.set(r.recoveryGeneration, r);
  }
  const n = [...e].sort((r, o) => r.recoveryGeneration - o.recoveryGeneration);
  for (let r = 1; r < n.length; r++) {
    const o = n[r];
    if (o.previousRecoveryEventId === null)
      return {
        consistent: !1,
        warning: `Generation ${o.recoveryGeneration} has a null previous-event link but is not the first generation.`
      };
    const i = t.get(o.recoveryGeneration - 1);
    if (!i)
      return {
        consistent: !1,
        warning: `Recovery generation ${o.recoveryGeneration - 1} is missing, so the chain up to generation ${o.recoveryGeneration} cannot be verified.`
      };
    if (o.previousRecoveryEventId !== i.eventId)
      return {
        consistent: !1,
        warning: `Recovery generation chain is broken between generation ${o.recoveryGeneration - 1} and ${o.recoveryGeneration}: possible replay or relay misbehavior.`
      };
  }
  return { consistent: !0 };
}
async function fr(e) {
  const t = _(e.locatorPrivateKey), n = await ur(e.payload, e.capsuleKey, jo(t));
  return U({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: L,
    tags: [["d", qe]],
    content: JSON.stringify(n)
  }, e.locatorPrivateKey);
}
function hc(e) {
  const t = _(e.oldLocatorPrivateKey);
  return U({
    pubkey: t,
    created_at: e.createdAt,
    kind: L,
    tags: [["d", qe]],
    content: ""
  }, e.oldLocatorPrivateKey);
}
async function vc(e, t) {
  if (!R(e))
    throw new Error("Credential capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await dr(n, t, jo(e.pubkey));
  return yc(r), r;
}
async function pr(e) {
  const t = _(e.recoveryPrivateKey), n = await ur(e.payload, e.capsuleKey, Jo(t));
  return U({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: L,
    tags: [["d", ft]],
    content: JSON.stringify(n)
  }, e.recoveryPrivateKey);
}
async function Yo(e, t) {
  if (!R(e))
    throw new Error("Recovery capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await dr(n, t, Jo(e.pubkey));
  return fc(r), r;
}
function $r(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  for (const o of e)
    o.pubkey === t && o.kind === L && $e(o, "d") === n && R(o) && r.set(o.id, o);
  return [...r.values()].sort((o, i) => i.created_at - o.created_at);
}
async function Xo(e, t, n, r, o) {
  const i = await e.queryQuorum({ kinds: [L], authors: [t], "#d": [n], limit: 5 }, o), s = i.outcomes.flatMap((f) => f.events), a = $r(s, t, n), c = [];
  for (const f of a)
    try {
      const p = await r(f);
      c.push({ event: f, payload: p });
    } catch (p) {
      c.push({ event: f, payload: null, error: p.message });
    }
  const u = c.find((f) => f.payload !== null) ?? null, d = i.outcomes.map((f) => ({
    responded: f.responded,
    events: $r(f.events, t, n)
  })).filter((f) => f.responded && f.events.length > 0).map((f) => f.events[0].id), y = new Set(d).size > 1;
  return {
    quorumMet: i.quorumMet,
    respondedCount: i.respondedCount,
    totalCount: i.totalCount,
    candidates: c,
    best: u,
    relayDisagreement: y
  };
}
async function dt(e, t, n, r = 8e3) {
  return Xo(e, t, qe, (o) => vc(o, n), r);
}
async function Zo(e, t, n, r = 8e3) {
  return Xo(e, t, ft, (o) => Yo(o, n), r);
}
function wc(e) {
  const t = e.filter((n) => n.payload !== null);
  return t.length < 2 ? { consistent: !0 } : pc(t.map((n) => ({
    eventId: n.event.id,
    recoveryGeneration: n.payload.recovery_generation,
    previousRecoveryEventId: n.payload.previous_recovery_event_id
  })));
}
async function Vr(e) {
  const t = [...new Set(e.relayUrls)], n = async (a) => {
    const c = new E(t);
    try {
      const u = await c.publishAll(a, e.timeoutMs);
      return new Map(u.map((d) => [
        d.relayUrl,
        { ok: d.result.ok, message: d.result.message ?? "" }
      ]));
    } finally {
      c.closeAll();
    }
  }, [r, o] = await Promise.all([
    n(e.credentialEvent),
    n(e.recoveryEvent)
  ]), i = { ok: !1, message: "no reply" }, s = t.map((a) => ({
    relayUrl: a,
    credential: r.get(a) ?? i,
    recovery: o.get(a) ?? i
  }));
  return {
    credentialAcknowledgedCount: s.filter((a) => a.credential.ok).length,
    recoveryAcknowledgedCount: s.filter((a) => a.recovery.ok).length,
    relaysTried: s.length,
    relays: s
  };
}
function gc(e) {
  const t = $e(e, "d");
  if (e.kind !== L || t === void 0 || !R(e))
    throw new Error("This session's capsule event is not a valid capsule.");
  return { pubkey: e.pubkey, dTag: t };
}
function mc(e, t, n) {
  const r = e.filter((i) => i.pubkey === n.pubkey && i.kind === L && $e(i, "d") === n.dTag && R(i));
  return r.some((i) => i.id === t.id) ? "current" : r.length === 0 ? "missing" : Math.max(...r.map((i) => i.created_at)) >= t.created_at ? "newer" : "older";
}
async function Fr(e, t, n) {
  const r = gc(t), o = new E(e);
  try {
    const i = await o.queryQuorum({
      kinds: [L],
      authors: [r.pubkey],
      "#d": [r.dTag],
      limit: 5
    }, n);
    return new Map(i.outcomes.map((s) => [
      s.relayUrl,
      s.responded ? { status: mc(s.events, t, r) } : { status: "unreachable", error: s.error }
    ]));
  } finally {
    o.closeAll();
  }
}
async function bc(e) {
  const t = [...new Set(e.relayUrls)], [n, r] = await Promise.all([
    Fr(t, e.credentialEvent, e.timeoutMs),
    Fr(t, e.recoveryEvent, e.timeoutMs)
  ]), o = t.map((i) => {
    const s = n.get(i) ?? { status: "unreachable" }, a = r.get(i) ?? { status: "unreachable" }, c = s.error ?? a.error;
    return {
      relayUrl: i,
      credential: s.status,
      recovery: a.status,
      ...c ? { error: c } : {}
    };
  });
  return {
    relays: o,
    totalCount: o.length,
    reachableCount: o.filter((i) => i.credential !== "unreachable" && i.recovery !== "unreachable").length,
    credentialCurrentCount: o.filter((i) => i.credential === "current").length,
    recoveryCurrentCount: o.filter((i) => i.recovery === "current").length,
    checkedAt: e.now ?? Math.floor(Date.now() / 1e3)
  };
}
const hr = es.id, Oe = "aes-256-gcm-v1", Le = "bitlogin-bip39-hkdf-v1", ei = "bitlogin-recovery-hkdf-v1", kc = 4, Ec = 64;
function De(e) {
  return [...new Set(e)].filter((t) => t.length <= Ec).slice(0, kc);
}
function xe(e) {
  return e ? { everyday_derivation: ei } : {};
}
function ti(e) {
  return e.protocol?.everyday_derivation === ei;
}
async function ni(e) {
  const t = zt(e.loginName), n = e.now ?? Math.floor(Date.now() / 1e3), { locatorPrivateKey: r, capsuleKey: o } = await it(e.password, t);
  try {
    const i = _(r), s = new E(e.vaultRelayUrls, {
      authPrivateKey: r
    });
    let a;
    try {
      a = await dt(s, i, o, e.timeoutMs);
    } finally {
      s.closeAll();
    }
    if (!a.quorumMet)
      throw new ie("Couldn't verify this login name and password aren't already registered. Please retry, or add more vault relays.");
    if (a.candidates.length > 0)
      throw new Fo();
    const c = e.everydayPrivateKey !== void 0;
    if (c && !Jn(e.everydayPrivateKey))
      throw new ie("The provided key is not a valid secp256k1 private key.");
    const u = La(fs()), d = await ir(u);
    let y, f, p;
    try {
      ({ recoveryPrivateKey: y, capsuleKey: f } = Fn(d)), p = c ? e.everydayPrivateKey : Wn(d);
    } finally {
      P(d);
    }
    const v = !c, h = D(32), g = D(32);
    let m = !1;
    try {
      const k = _(y), b = _(p), S = T(uo()), M = {
        schema: Gt,
        account_id: S,
        recovery_generation: 0,
        previous_recovery_event_id: null,
        operational_private_key: T(p),
        operational_public_key: b,
        recovery_public_key: k,
        connection_vault_root: T(h),
        vault_sudo_key: T(g),
        created_at: n,
        vault_relay_hints: De(e.vaultRelayUrls),
        protocol: {
          capsule_encryption: Oe,
          recovery_derivation: Le,
          ...xe(v)
        }
      }, $ = await pr({
        recoveryPrivateKey: y,
        capsuleKey: f,
        payload: M
      }), X = new E(e.vaultRelayUrls, {
        authPrivateKey: y
      });
      let pe;
      try {
        pe = await _e(X, $, {
          dTag: ft,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        X.closeAll();
      }
      if (!pe.success)
        throw new ie("The recovery capsule did not reach the required relay acknowledgement and readback quorum. No login credential was published. Please retry, or add more vault relays.");
      const Xt = {
        schema: Ht,
        account_id: S,
        generation: 0,
        operational_private_key: T(p),
        operational_public_key: b,
        recovery_public_key: k,
        recovery_capsule_event: $,
        connection_vault_root: T(h),
        created_at: n,
        vault_relay_hints: De(e.vaultRelayUrls),
        protocol: {
          password_kdf: hr,
          capsule_encryption: Oe,
          recovery_derivation: Le,
          ...xe(v)
        }
      }, Ar = await fr({
        locatorPrivateKey: r,
        capsuleKey: o,
        payload: Xt
      }), Rr = new E(e.vaultRelayUrls, {
        authPrivateKey: r
      });
      let Zt;
      try {
        Zt = await _e(Rr, Ar, {
          dTag: qe,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        Rr.closeAll();
      }
      if (!Zt.success)
        throw new ie("Registration did not reach the required credential acknowledgement and readback quorum. Please retry, or add more vault relays.");
      return m = !0, {
        normalizedLoginName: t,
        recoveryPhrase: u,
        everydayPrivateKey: p,
        everydayPublicKey: b,
        recoveryPublicKey: k,
        locatorPublicKey: i,
        accountId: S,
        imported: c,
        everydayKeyDerived: v,
        connectionVaultRoot: h,
        vaultSudoKey: g,
        credentialEvent: Ar,
        recoveryEvent: $,
        credentialPublish: Zt,
        recoveryPublish: pe
      };
    } finally {
      P(y, f), m || (c || P(p), P(h, g));
    }
  } finally {
    P(r, o);
  }
}
async function _c(e) {
  const { nsecOrHex: t, ...n } = e, r = ri(t);
  return ni({ ...n, everydayPrivateKey: r });
}
function ri(e) {
  const t = e.trim();
  let n;
  if (t.startsWith("nsec1"))
    n = ts(t);
  else if (/^[0-9a-fA-F]{64}$/u.test(t))
    n = lo(t.toLowerCase());
  else
    throw new ie("Enter a valid nsec (nsec1…) or a 64-character hex private key.");
  if (!Jn(n))
    throw new ie("The provided key is not a valid secp256k1 private key.");
  return n;
}
class oi {
  map = /* @__PURE__ */ new Map();
  async get(t) {
    return this.map.get(t);
  }
  async set(t, n) {
    this.map.set(t, n);
  }
  async delete(t) {
    this.map.delete(t);
  }
}
async function Pc(e) {
  const t = zt(e.loginName), { locatorPrivateKey: n, capsuleKey: r } = await it(e.password, t), o = _(n), i = new E(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  try {
    const s = await dt(i, o, r, e.timeoutMs);
    if (!s.quorumMet)
      throw new Ee("quorum-not-met");
    if (!s.best)
      throw new Ee(s.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
    const a = s.best.payload, c = e.store ?? new oi(), u = await lr(c, a.operational_public_key), d = a.generation < u.generation;
    if (d && !e.acknowledgeRollback)
      throw new Wo(u.generation, a.generation);
    const y = d ? `This device previously saw credential generation ${u.generation}, but the accepted capsule is generation ${a.generation}. Relays may be serving stale data, or an old capsule is being replayed.` : void 0;
    await Bo(c, a.operational_public_key, {
      generation: a.generation
    });
    const f = s.relayDisagreement ? 'Configured relays returned different credential capsules as "latest" for this account. Some relays may be stale, censored, or malicious.' : void 0;
    return {
      everydayPrivateKey: O(a.operational_private_key),
      everydayPublicKey: a.operational_public_key,
      recoveryPublicKey: a.recovery_public_key,
      accountId: a.account_id,
      generation: a.generation,
      everydayKeyDerived: ti(a),
      credentialEvent: s.best.event,
      recoveryCapsuleEvent: a.recovery_capsule_event,
      connectionVaultRoot: a.connection_vault_root ? O(a.connection_vault_root) : void 0,
      rollbackWarning: y,
      relayDisagreementWarning: f
    };
  } finally {
    i.closeAll();
  }
}
function Wr(e) {
  return e.filter((t) => R(t)).sort((t, n) => n.created_at - t.created_at)[0];
}
async function Sc(e) {
  if (!Lo(e.phrase))
    throw new se("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await ir(e.phrase), { recoveryPrivateKey: n, capsuleKey: r } = Fn(t), o = Wn(t), i = _(o);
  P(t, o);
  const s = _(n), a = new E(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  let c;
  try {
    c = await Zo(a, s, r, e.timeoutMs);
  } finally {
    a.closeAll();
  }
  if (e.offlineRecoveryCapsuleEvents?.length) {
    const h = [];
    for (const b of e.offlineRecoveryCapsuleEvents)
      if (R(b))
        try {
          h.push({
            event: b,
            payload: await Yo(b, r)
          });
        } catch (S) {
          h.push({
            event: b,
            payload: null,
            error: S.message
          });
        }
    const g = /* @__PURE__ */ new Map();
    for (const b of [...c.candidates, ...h])
      g.set(b.event.id, b);
    const m = [...g.values()].sort((b, S) => S.event.created_at - b.event.created_at), k = m.find((b) => b.payload !== null) ?? null;
    c = {
      ...c,
      candidates: m,
      best: k,
      quorumMet: c.quorumMet || k !== null
    };
  }
  if (!c.quorumMet)
    throw new Ee("quorum-not-met");
  if (!c.best)
    throw new Ee(c.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const u = c.best.payload, d = wc(c.candidates), y = O(u.operational_private_key), f = u.operational_public_key, { generalRelays: p, dmRelays: v } = await ii(f, [...e.discoveryRelayUrls, ...u.vault_relay_hints], e.timeoutMs);
  return {
    everydayPrivateKey: y,
    everydayPublicKey: f,
    recoveryPrivateKey: n,
    recoveryPublicKey: s,
    recoveryCapsuleKey: r,
    accountId: u.account_id,
    currentRecoveryEvent: c.best.event,
    currentRecoveryPayload: u,
    generalRelays: p,
    dmRelays: v,
    chainWarning: d.consistent ? void 0 : d.warning,
    everydayKeyDerived: f === i
  };
}
async function ii(e, t, n) {
  const r = new E([...new Set(t)]);
  let o = [], i = [];
  try {
    const s = await r.queryQuorum({ kinds: [ot], authors: [e], limit: 5 }, n), a = Wr(s.outcomes.flatMap((d) => d.events));
    a && (o = ic(a));
    const c = await r.queryQuorum({ kinds: [Vn], authors: [e], limit: 5 }, n), u = Wr(c.outcomes.flatMap((d) => d.events));
    u && (i = sc(u));
  } finally {
    r.closeAll();
  }
  return { generalRelays: o, dmRelays: i };
}
async function si(e) {
  if (!Lo(e))
    throw new se("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await ir(e);
  try {
    const { recoveryPrivateKey: n, capsuleKey: r } = Fn(t), o = Wn(t);
    return {
      recoveryPrivateKey: n,
      recoveryPublicKey: _(n),
      capsuleKey: r,
      everydayPrivateKey: o,
      everydayPublicKey: _(o)
    };
  } finally {
    P(t);
  }
}
async function ai(e, t, n) {
  const r = new E(t, {
    authPrivateKey: e.recoveryPrivateKey
  });
  let o;
  try {
    o = await Zo(r, e.recoveryPublicKey, e.capsuleKey, n);
  } finally {
    r.closeAll();
  }
  if (!o.quorumMet)
    throw new Ee("quorum-not-met");
  if (o.best)
    throw new se("This account's recovery capsule is still on the relays. Use normal recovery instead of a rebuild.");
  return o.candidates.length > 0 ? Math.max(...o.candidates.map((i) => i.event.created_at)) : null;
}
async function Kc(e) {
  const t = await si(e.phrase);
  try {
    await ai(t, e.vaultRelayUrls, e.timeoutMs);
    const n = new E([
      .../* @__PURE__ */ new Set([...e.discoveryRelayUrls, ...e.vaultRelayUrls])
    ]);
    try {
      const o = (await n.queryQuorum({
        kinds: [Mt, ot],
        authors: [t.everydayPublicKey],
        limit: 10
      }, e.timeoutMs)).outcomes.flatMap((i) => i.events).filter((i) => i.pubkey === t.everydayPublicKey && R(i));
      return {
        everydayPublicKey: t.everydayPublicKey,
        profileFound: o.some((i) => i.kind === Mt),
        relayListFound: o.some((i) => i.kind === ot)
      };
    } finally {
      n.closeAll();
    }
  } finally {
    P(t.recoveryPrivateKey, t.capsuleKey, t.everydayPrivateKey);
  }
}
async function Ac(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = await si(e.phrase);
  let r = !1;
  try {
    const o = await ai(n, e.vaultRelayUrls, e.timeoutMs), i = {
      schema: Gt,
      account_id: T(uo()),
      recovery_generation: 0,
      previous_recovery_event_id: null,
      operational_private_key: T(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      connection_vault_root: T(D(32)),
      vault_sudo_key: T(D(32)),
      created_at: o === null ? t : ut(o, t),
      vault_relay_hints: De(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: Oe,
        recovery_derivation: Le,
        ...xe(!0)
      }
    }, s = await pr({
      recoveryPrivateKey: n.recoveryPrivateKey,
      capsuleKey: n.capsuleKey,
      payload: i
    }), a = new E(e.vaultRelayUrls, {
      authPrivateKey: n.recoveryPrivateKey
    });
    let c;
    try {
      c = await _e(a, s, {
        dTag: ft,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      a.closeAll();
    }
    if (!c.success)
      throw new se("Could not publish the rebuilt recovery capsule to enough relays. Nothing else was changed; please retry.");
    const { generalRelays: u, dmRelays: d } = await ii(n.everydayPublicKey, [...e.discoveryRelayUrls, ...e.vaultRelayUrls], e.timeoutMs);
    return r = !0, {
      everydayPrivateKey: n.everydayPrivateKey,
      everydayPublicKey: n.everydayPublicKey,
      recoveryPrivateKey: n.recoveryPrivateKey,
      recoveryPublicKey: n.recoveryPublicKey,
      recoveryCapsuleKey: n.capsuleKey,
      accountId: i.account_id,
      currentRecoveryEvent: s,
      currentRecoveryPayload: i,
      generalRelays: u,
      dmRelays: d,
      everydayKeyDerived: !0
    };
  } finally {
    r || P(n.recoveryPrivateKey, n.capsuleKey, n.everydayPrivateKey);
  }
}
async function Rc(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = zt(e.newLoginName), { recovered: r } = e, o = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root,
    vault_sudo_key: r.currentRecoveryPayload.vault_sudo_key
  } : {}, i = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root
  } : {}, { locatorPrivateKey: s, capsuleKey: a } = await it(e.newPassword, n);
  try {
    const c = _(s), u = new E(e.vaultRelayUrls, {
      authPrivateKey: s
    });
    let d;
    try {
      d = await dt(u, c, a, e.timeoutMs);
    } finally {
      u.closeAll();
    }
    if (!d.quorumMet)
      throw new se("Couldn't verify the new login name and password aren't already registered. Please retry, or add more vault relays.");
    const y = d.best?.payload ?? null, f = y !== null && y.account_id === r.accountId && y.operational_public_key === r.everydayPublicKey && y.recovery_public_key === r.recoveryPublicKey && y.generation === 0 && y.recovery_capsule_event.id === r.currentRecoveryEvent.id;
    if (d.candidates.length > 0 && !f)
      throw new se("Another account is already registered with that login name and password. Pick a different one.");
    const p = r.currentRecoveryPayload.recovery_generation + 1, v = {
      schema: Gt,
      account_id: r.accountId,
      recovery_generation: p,
      previous_recovery_event_id: r.currentRecoveryEvent.id,
      operational_private_key: T(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      ...o,
      created_at: ut(r.currentRecoveryEvent.created_at, t),
      vault_relay_hints: De(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: Oe,
        recovery_derivation: Le,
        ...xe(r.everydayKeyDerived)
      }
    }, h = await pr({
      recoveryPrivateKey: r.recoveryPrivateKey,
      capsuleKey: r.recoveryCapsuleKey,
      payload: v
    }), g = new E(e.vaultRelayUrls, {
      authPrivateKey: r.recoveryPrivateKey
    });
    let m;
    try {
      m = await _e(g, h, {
        dTag: ft,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      g.closeAll();
    }
    if (!m.success)
      throw new se("Could not publish the refreshed recovery capsule to enough relays. No new credential was published; please retry.");
    r.currentRecoveryEvent = h, r.currentRecoveryPayload = v;
    const k = {
      schema: Ht,
      account_id: r.accountId,
      generation: 0,
      operational_private_key: T(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      recovery_capsule_event: h,
      ...i,
      // A retry may be repairing a credential that reached only one relay.
      // It must replace that partial event deterministically on every relay.
      created_at: d.best ? ut(d.best.event.created_at, t) : t,
      vault_relay_hints: De(e.vaultRelayUrls),
      protocol: {
        password_kdf: hr,
        capsule_encryption: Oe,
        recovery_derivation: Le,
        ...xe(r.everydayKeyDerived)
      }
    }, b = await fr({
      locatorPrivateKey: s,
      capsuleKey: a,
      payload: k
    }), S = new E(e.vaultRelayUrls, {
      authPrivateKey: s
    });
    let M;
    try {
      M = await _e(S, b, {
        dTag: qe,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      S.closeAll();
    }
    if (!M.success)
      throw new se("Could not publish the new credential capsule to enough relays. Please retry.");
    return e.store && await tc(e.store, r.everydayPublicKey, {
      generation: 0,
      recoveryGeneration: p
    }), {
      normalizedLoginName: n,
      locatorPublicKey: c,
      credentialEvent: b,
      refreshedRecoveryEvent: h,
      credentialPublish: M,
      recoveryPublish: m
    };
  } finally {
    P(s, a);
  }
}
async function Cc(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = zt(e.loginName), r = await it(e.oldPassword, n), o = _(r.locatorPrivateKey), i = new E(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  });
  let s;
  try {
    s = await dt(i, o, r.capsuleKey, e.timeoutMs);
  } finally {
    i.closeAll();
  }
  if (!s.quorumMet)
    throw new Ee("quorum-not-met");
  if (!s.best)
    throw new Ee(s.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const a = s.best.payload, c = s.best.event, u = e.store ?? new oi(), d = await lr(u, a.operational_public_key);
  if (a.generation < d.generation && !e.acknowledgeRollback)
    throw new Wo(d.generation, a.generation);
  const y = await it(e.newPassword, n), f = _(y.locatorPrivateKey), p = new E(e.vaultRelayUrls, {
    authPrivateKey: y.locatorPrivateKey
  });
  let v;
  try {
    v = await dt(p, f, y.capsuleKey, e.timeoutMs);
  } finally {
    p.closeAll();
  }
  if (!v.quorumMet)
    throw new ie("Couldn't verify the new password isn't already registered under this login name. Please retry, or add more vault relays.");
  if (v.candidates.length > 0)
    throw new Fo("Another account is already registered with this login name and the new password you chose. Pick a different new password.");
  const h = a.generation + 1, g = {
    schema: Ht,
    account_id: a.account_id,
    generation: h,
    operational_private_key: a.operational_private_key,
    operational_public_key: a.operational_public_key,
    recovery_public_key: a.recovery_public_key,
    recovery_capsule_event: a.recovery_capsule_event,
    // Carry only the session root. A legacy credential may contain the sudo
    // key, but rotation deliberately scrubs it; personal-tier access remains
    // phrase-gated through the recovery capsule.
    ...a.connection_vault_root !== void 0 ? { connection_vault_root: a.connection_vault_root } : {},
    created_at: t,
    vault_relay_hints: De(e.vaultRelayUrls),
    protocol: {
      password_kdf: hr,
      capsule_encryption: Oe,
      recovery_derivation: Le,
      ...xe(ti(a))
    }
  }, m = await fr({
    locatorPrivateKey: y.locatorPrivateKey,
    capsuleKey: y.capsuleKey,
    payload: g
  }), k = new E(e.vaultRelayUrls, {
    authPrivateKey: y.locatorPrivateKey
  }), b = await _e(k, m, {
    dTag: qe,
    minAcks: e.minAcknowledgements,
    timeoutMs: e.timeoutMs
  });
  if (k.closeAll(), !b.success)
    throw new ie("The new credential capsule did not reach the required relay acknowledgement and readback quorum. Your existing password still works; nothing was changed. Please retry.");
  const S = hc({
    oldLocatorPrivateKey: r.locatorPrivateKey,
    createdAt: ut(c.created_at, t)
  }), M = Eo({
    privateKey: r.locatorPrivateKey,
    eventIdToDelete: c.id,
    deletedEventKind: L,
    createdAt: t
  }), $ = new E(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  }), [X, pe] = await Promise.all([
    $.publishAll(S, e.timeoutMs),
    $.publishAll(M, e.timeoutMs)
  ]);
  return $.closeAll(), await Bo(u, a.operational_public_key, {
    generation: h
  }), {
    normalizedLoginName: n,
    oldLocatorPublicKey: o,
    newLocatorPublicKey: f,
    newGeneration: h,
    recoveryPublicKey: a.recovery_public_key,
    recoveryCapsuleEvent: a.recovery_capsule_event,
    newCredentialEvent: m,
    tombstoneEvent: S,
    deletionRequestEvent: M,
    newCredentialPublish: b,
    tombstoneAcknowledgedCount: x(X),
    deletionAcknowledgedCount: x(pe)
  };
}
const Nc = "bitlogin/connection-vault-root/v1", Tc = "bitlogin/connection-vault-signing/v1", Mc = "bitlogin/connection-record-encryption/v1", Ic = "bitlogin/connection-vault-personal/v1", En = "bitlogin:connection:";
function Oc(e) {
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Gn(yo(Nc), e);
}
function Ve(e) {
  return hs(e, Tc).scalar;
}
function ci(e) {
  const t = Ve(e);
  try {
    return _(t);
  } finally {
    P(t);
  }
}
function Lc(e, t) {
  if (t.length !== 32)
    throw new Error("vault_sudo_key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Gn(yo(Ic), jn(e, t));
}
function li(e, t) {
  const n = Yt(t);
  return pt(e, jn(q(Mc), new Uint8Array([0]), n), 32);
}
function Dc() {
  return T(D(16));
}
function Yt(e) {
  const t = O(e);
  if (t.length !== 16)
    throw new Error("connection_id must decode to exactly 16 bytes (§CV7).");
  return t;
}
function ui(e) {
  return Yt(e), `${En}${e}`;
}
function di(e) {
  if (!e.startsWith(En))
    return null;
  const t = e.slice(En.length);
  try {
    return Yt(t), t;
  } catch {
    return null;
  }
}
class ae {
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
  nip44Encrypt(t, n) {
    return this.assertAlive(), mn(be(this.privateKey, t), n);
  }
  nip44Decrypt(t, n) {
    return this.assertAlive(), Hn(be(this.privateKey, t), n);
  }
  /** Legacy relative to nip44Encrypt above, but still what a real NIP-07 extension exposes as
   * window.nostr.nip04.encrypt -- implemented for drop-in parity. */
  nip04Encrypt(t, n) {
    return this.assertAlive(), Ya(this.privateKey, t, n);
  }
  nip04Decrypt(t, n) {
    return this.assertAlive(), Za(this.privateKey, t, n);
  }
  /** Best-practical secret wipe (§11.10, §21.4): overwrites the private key buffer in place. */
  destroy() {
    P(this.privateKey), this.destroyed = !0;
  }
}
const yi = "bitlogin.connection.v1", fi = "bitlogin.connection.nwc.v1", Br = 120, xc = /* @__PURE__ */ new Set(["active", "suspended", "deleted"]), Uc = /* @__PURE__ */ new Set(["connectable", "personal"]);
class Ce extends Error {
  constructor(t) {
    super(t), this.name = "ConnectionRecordError";
  }
}
function pi(e, t) {
  return q(`bitlogin|connection-record|v1|${e}|30078|${t}`);
}
function hi(e) {
  const t = e, n = (i) => {
    throw new Ce(i);
  };
  (!t || typeof t != "object") && n("Connection record must be an object."), t.schema !== yi && n("Unsupported connection record schema (§CV8.3)."), typeof t.connection_id != "string" && n("connection_id must be a string (§CV7)."), (typeof t.connection_type != "string" || t.connection_type.length === 0) && n("connection_type must be a non-empty string (§CV8.3)."), Uc.has(t.tier) || n("tier must be connectable or personal."), xc.has(t.state) || n("state must be active, suspended, or deleted (§CV8.3)."), (typeof t.label != "string" || t.label.length > Br) && n(`label must be a string of at most ${Br} characters.`), (!Number.isInteger(t.created_at) || !Number.isInteger(t.updated_at)) && n("created_at and updated_at must be integers (§CV8.3).");
  const r = t.credential;
  (!r || typeof r != "object" || typeof r.schema != "string") && n("credential must be an object naming its profile schema (§CV8.3).");
  const o = t.application_binding;
  (!o || typeof o != "object" || o.origin !== null && typeof o.origin != "string" || o.app_pubkey !== null && typeof o.app_pubkey != "string") && n("application_binding must carry origin and app_pubkey (string or null)."), t.notes !== null && typeof t.notes != "string" && n("notes must be a string or null.");
}
async function sn(e) {
  hi(e.record);
  const t = Ve(e.vaultPrk), n = _(t), r = ui(e.record.connection_id), o = li(e.recordPrk, e.record.connection_id), i = await ur(e.record, o, pi(n, r));
  return U({
    pubkey: n,
    created_at: ut(e.previousCreatedAt, e.now),
    kind: L,
    tags: [["d", r]],
    content: JSON.stringify(i)
  }, t);
}
async function qc(e, t, n) {
  if (!R(e))
    throw new Ce("Connection record event has an invalid id or signature.");
  const r = _(Ve(t));
  if (e.pubkey !== r)
    throw new Ce("Connection record event is not signed by this vault's identity.");
  const o = $e(e, "d") ?? "", i = di(o);
  if (i === null)
    throw new Ce("Connection record event has a malformed d tag.");
  const s = JSON.parse(e.content), a = pi(e.pubkey, o), c = [
    { prk: t, tier: "connectable" },
    ...n ? [{ prk: n, tier: "personal" }] : []
  ];
  for (const u of c) {
    let d;
    try {
      d = await dr(s, li(u.prk, i), a);
    } catch {
      continue;
    }
    if (hi(d), d.connection_id !== i)
      throw new Ce("Connection record id does not match its d tag.");
    if (d.tier !== u.tier)
      throw new Ce("Connection record tier does not match the key that decrypted it.");
    return { record: d, tier: u.tier, event: e };
  }
  return null;
}
function $c(e, t) {
  return {
    ...e,
    state: "deleted",
    credential: { schema: e.credential.schema },
    notes: null,
    updated_at: t
  };
}
const qt = /^[0-9a-f]{64}$/u;
class Z extends Error {
  constructor(t) {
    super(t), this.name = "NwcParseError";
  }
}
function jr(e) {
  const t = e.trim();
  if (!/^nostr\+walletconnect:\/\//iu.test(t))
    throw new Z("Not an NWC URI: it must start with nostr+walletconnect://");
  let n;
  try {
    n = new URL(t.replace(/^nostr\+walletconnect:\/\//iu, "http://"));
  } catch {
    throw new Z("The NWC URI is malformed.");
  }
  const r = n.hostname.toLowerCase();
  if (!qt.test(r))
    throw new Z("The NWC URI's wallet service pubkey is not 64-char hex.");
  const o = [], i = [];
  let s = null, a = null;
  for (const [c, u] of n.searchParams.entries())
    if (c === "relay") {
      if (!ht(u))
        throw new Z("An NWC relay must use secure WebSockets, except for an explicit loopback development endpoint.");
      o.push(u);
    } else if (c === "secret") {
      const d = u.toLowerCase();
      if (!qt.test(d))
        throw new Z("The NWC URI's secret is not a 64-char hex client key.");
      s = d;
    } else c === "lud16" ? a = u : i.push([c, u]);
  if (o.length === 0)
    throw new Z("The NWC URI names no relay.");
  if (s === null)
    throw new Z("The NWC URI carries no secret.");
  return {
    schema: fi,
    wallet_pubkey: r,
    relays: o,
    secret: s,
    lud16: a,
    extra_params: i
  };
}
function Vc(e) {
  vi(e);
  const t = new URLSearchParams();
  for (const n of e.relays)
    t.append("relay", n);
  t.append("secret", e.secret), e.lud16 !== null && t.append("lud16", e.lud16);
  for (const [n, r] of e.extra_params)
    t.append(n, r);
  return `nostr+walletconnect://${e.wallet_pubkey}?${t.toString()}`;
}
function Fc(e, t) {
  return e.wallet_pubkey === t.wallet_pubkey && e.secret === t.secret;
}
function vi(e) {
  const t = e, n = (r) => {
    throw new Z(r);
  };
  (!t || typeof t != "object") && n("NWC credential must be an object."), t.schema !== fi && n("NWC credential has the wrong schema."), (typeof t.wallet_pubkey != "string" || !qt.test(t.wallet_pubkey)) && n("NWC credential wallet_pubkey must be 64-char lowercase hex."), (!Array.isArray(t.relays) || t.relays.length === 0 || t.relays.some((r) => typeof r != "string")) && n("NWC credential must name at least one relay."), t.relays.some((r) => !ht(r)) && n("NWC relays must use secure WebSockets, except for explicit loopback development endpoints."), (typeof t.secret != "string" || !qt.test(t.secret)) && n("NWC credential secret must be 64-char lowercase hex."), t.lud16 !== null && typeof t.lud16 != "string" && n("NWC credential lud16 must be a string or null."), (!Array.isArray(t.extra_params) || t.extra_params.some((r) => !Array.isArray(r) || r.length !== 2 || typeof r[0] != "string" || typeof r[1] != "string")) && n("NWC credential extra_params must be [key, value] string pairs.");
}
const Wc = "bitlogin:vault-hwm:v2:", Bc = "bitlogin/vault-hwm-index/v2", wi = "bitlogin/vault-hwm-encryption/v2", jc = /^[0-9a-f]{64}$/u;
class ce extends Error {
  constructor() {
    super("The local Connection Vault rollback marker is invalid or has been tampered with."), this.name = "RecordHighWaterMarkError";
  }
}
function vr(e) {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return Number.isInteger(t.createdAt) && (t.createdAt ?? -1) >= 0 && typeof t.eventId == "string" && jc.test(t.eventId);
}
function gi(e, t) {
  Yt(t);
  const n = pt(e, Bc, 32), r = q(t);
  try {
    return `${Wc}${T(ao(co, n, r))}`;
  } finally {
    P(n, r);
  }
}
function Jc(e, t) {
  return `bitlogin:vault-hwm:${ci(e)}:${t}`;
}
async function Gc(e, t, n) {
  const r = pt(e, wi, 32), o = q(JSON.stringify(n)), i = q(t);
  try {
    const s = await Ro(r, o, i), a = {
      v: 2,
      nonce: T(s.nonce),
      ciphertext: T(s.ciphertext)
    };
    return JSON.stringify(a);
  } finally {
    P(r, o, i);
  }
}
async function Hc(e, t, n) {
  const r = pt(e, wi, 32), o = q(t);
  let i;
  try {
    const s = JSON.parse(n);
    if (s.v !== 2 || typeof s.nonce != "string" || typeof s.ciphertext != "string")
      throw new ce();
    i = await Co(r, O(s.nonce), O(s.ciphertext), o);
    const a = JSON.parse(Bn(i));
    if (!vr(a))
      throw new ce();
    return a;
  } catch (s) {
    throw s instanceof ce ? s : new ce();
  } finally {
    P(r, o), i && P(i);
  }
}
async function mi(e, t, n, r) {
  const o = gi(t, n);
  await e.set(o, await Gc(t, o, r));
}
async function bi(e, t, n) {
  const r = gi(t, n), o = await e.get(r);
  if (o !== void 0)
    return Hc(t, r, o);
  const i = Jc(t, n), s = await e.get(i);
  if (s === void 0)
    return null;
  try {
    const a = JSON.parse(s);
    if (!vr(a))
      throw new ce();
    return await mi(e, t, n, a), await e.delete(i), a;
  } catch (a) {
    throw a instanceof ce ? a : new ce();
  }
}
async function ki(e, t, n, r) {
  if (!vr(r))
    throw new ce();
  const o = await bi(e, t, n);
  o && wn({ created_at: r.createdAt, id: r.eventId }, { created_at: o.createdAt, id: o.eventId }) <= 0 || await mi(e, t, n, r);
}
async function zc(e) {
  const t = Ve(e.vaultPrk), n = new E(e.relayUrls, { authPrivateKey: t });
  let r;
  try {
    r = await _e(n, e.event, {
      dTag: ui(e.connectionId),
      minAcks: e.minAcknowledgements,
      // The readback bar follows the ack bar: a caller publishing to fewer
      // relays (a targeted repair, a test) has already lowered its quorum.
      minReadbacks: e.minAcknowledgements,
      timeoutMs: e.timeoutMs
    });
  } finally {
    n.closeAll(), P(t);
  }
  return r.success && await ki(e.store, e.vaultPrk, e.connectionId, {
    createdAt: e.event.created_at,
    eventId: e.event.id
  }), r;
}
const Jr = 500;
async function Qc(e) {
  const t = Ve(e.vaultPrk), n = _(t), r = new E(e.relayUrls, { authPrivateKey: t });
  let o;
  try {
    o = await r.queryQuorum({ kinds: [L], authors: [n], limit: Jr }, e.timeoutMs);
  } finally {
    r.closeAll(), P(t);
  }
  const i = o.outcomes.some((u) => u.events.length >= Jr), s = /* @__PURE__ */ new Map();
  for (const u of o.outcomes.flatMap((d) => d.events)) {
    if (!R(u) || u.pubkey !== n)
      continue;
    const d = di($e(u, "d") ?? "");
    if (d === null)
      continue;
    const y = s.get(d);
    (!y || wn(u, y) > 0) && s.set(d, u);
  }
  const a = /* @__PURE__ */ new Map(), c = [];
  for (const [u, d] of s) {
    const y = await bi(e.store, e.vaultPrk, u);
    if (y !== null && wn(d, {
      created_at: y.createdAt,
      id: y.eventId
    }) < 0) {
      c.push(u);
      continue;
    }
    a.set(u, d), await ki(e.store, e.vaultPrk, u, {
      createdAt: d.created_at,
      eventId: d.id
    });
  }
  return {
    events: a,
    rollbackWarnings: c,
    quorumMet: o.quorumMet,
    respondedCount: o.respondedCount,
    truncated: i
  };
}
class Yc {
  vaultPrk;
  personalPrk = null;
  destroyed = !1;
  connectionVaultRoot;
  vaultPublicKey;
  constructor(t) {
    this.connectionVaultRoot = t.slice(), this.vaultPrk = Oc(this.connectionVaultRoot), this.vaultPublicKey = ci(this.vaultPrk);
  }
  get sudoActive() {
    return this.personalPrk !== null;
  }
  /** Opens a sudo window. Consumes (wipes) the caller's sudo key copy. */
  enableSudo(t) {
    this.endSudo(), this.personalPrk = Lc(this.connectionVaultRoot, t), P(t);
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
    const n = t.now ?? Math.floor(Date.now() / 1e3), r = {
      schema: yi,
      connection_id: Dc(),
      connection_type: t.connection_type,
      tier: t.tier,
      state: "active",
      label: t.label,
      created_at: n,
      updated_at: n,
      credential: t.credential,
      application_binding: t.application_binding ?? {
        origin: null,
        app_pubkey: null
      },
      notes: t.notes ?? null
    }, o = await sn({
      vaultPrk: this.vaultPrk,
      recordPrk: this.prkForTier(t.tier),
      record: r,
      now: n
    });
    return { record: r, event: o };
  }
  /** Replaces a record's content. The tier is immutable — moving a secret
   *  between tiers is a delete-and-recreate, never a silent re-encryption. */
  async updateConnection(t, n, r) {
    const o = r ?? Math.floor(Date.now() / 1e3), i = {
      ...t.record,
      ...n,
      tier: t.record.tier,
      connection_id: t.record.connection_id,
      created_at: t.record.created_at,
      updated_at: o
    }, s = await sn({
      vaultPrk: this.vaultPrk,
      recordPrk: this.prkForTier(i.tier),
      record: i,
      previousCreatedAt: t.event.created_at,
      now: o
    });
    return { record: i, event: s };
  }
  /** §CV11 step 2: the encrypted tombstone replacement. */
  async deleteConnection(t, n) {
    const r = n ?? Math.floor(Date.now() / 1e3), o = $c(t.record, r), i = await sn({
      vaultPrk: this.vaultPrk,
      recordPrk: this.prkForTier(o.tier),
      record: o,
      previousCreatedAt: t.event.created_at,
      now: r
    });
    return { record: o, event: i };
  }
  /** Trial-decrypts one event; personal-tier records resolve only inside a sudo window. */
  decryptEvent(t) {
    return this.destroyed ? Promise.reject(new Error("This vault session was destroyed; create a new one from the account's root.")) : qc(t, this.vaultPrk, this.personalPrk ?? void 0);
  }
  /** §CV11 step 3: a NIP-09 deletion request for a replaced record event,
   *  signed by the vault identity. Best-effort by contract — the encrypted
   *  tombstone is the durable part of a deletion, this is the courtesy ask. */
  buildDeletionRequest(t, n) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    return Eo({
      privateKey: Ve(this.vaultPrk),
      eventIdToDelete: t,
      deletedEventKind: L,
      createdAt: n ?? Math.floor(Date.now() / 1e3)
    });
  }
  publish(t) {
    return zc({ vaultPrk: this.vaultPrk, ...t });
  }
  fetchEvents(t) {
    return Qc({ vaultPrk: this.vaultPrk, ...t });
  }
  /**
   * Fetches and decrypts everything decryptable right now. Outside a sudo
   * window the personal tier is simply absent from the result — invisible,
   * not erroring, exactly like the app-facing API contract.
   */
  async listConnections(t) {
    const n = await this.fetchEvents(t);
    if (!n.quorumMet && !t.acknowledgeIncompleteQuorum)
      throw new Error("Not enough vault relays answered to list your connections reliably. Check your connection and retry.");
    const r = [], o = [];
    for (const i of n.events.values())
      try {
        const s = await this.decryptEvent(i);
        s && r.push(s);
      } catch {
        o.push(i.id);
      }
    return r.sort((i, s) => s.record.updated_at - i.record.updated_at), {
      connections: r,
      rollbackWarnings: n.rollbackWarnings,
      unreadable: o,
      truncated: n.truncated,
      quorumMet: n.quorumMet
    };
  }
}
const Xc = "bitlogin", te = "kv", W = "device-keys", Zc = 2;
function el() {
  return new Promise((e, t) => {
    const n = indexedDB.open(Xc, Zc);
    n.onupgradeneeded = () => {
      const r = n.result;
      r.objectStoreNames.contains(te) || r.createObjectStore(te), r.objectStoreNames.contains(W) || r.createObjectStore(W);
    }, n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
  });
}
class tl {
  dbPromise = null;
  db() {
    return this.dbPromise || (this.dbPromise = el()), this.dbPromise;
  }
  async get(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const s = n.transaction(te, "readonly").objectStore(te).get(t);
      s.onsuccess = () => r(s.result), s.onerror = () => o(s.error);
    });
  }
  async set(t, n) {
    const r = await this.db();
    return new Promise((o, i) => {
      const s = r.transaction(te, "readwrite");
      s.objectStore(te).put(n, t), s.oncomplete = () => o(), s.onerror = () => i(s.error);
    });
  }
  async delete(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const i = n.transaction(te, "readwrite");
      i.objectStore(te).delete(t), i.oncomplete = () => r(), i.onerror = () => o(i.error);
    });
  }
  /**
   * Returns a non-extractable AES-GCM key kept by the browser's IndexedDB
   * implementation. The key is deliberately separate from the string-only KV
   * API so callers cannot accidentally serialize it as application data.
   */
  async getOrCreateDeviceKey(t) {
    const n = await this.db(), r = await new Promise((i, s) => {
      const a = n.transaction(W, "readonly").objectStore(W).get(t);
      a.onsuccess = () => i(a.result), a.onerror = () => s(a.error);
    });
    if (r) return r;
    const o = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      !1,
      ["encrypt", "decrypt"]
    );
    try {
      return await new Promise((i, s) => {
        const a = n.transaction(W, "readwrite");
        a.objectStore(W).add(o, t), a.oncomplete = () => i(), a.onerror = () => s(a.error);
      }), o;
    } catch {
      const i = await new Promise((s, a) => {
        const c = n.transaction(W, "readonly").objectStore(W).get(t);
        c.onsuccess = () => s(c.result), c.onerror = () => a(c.error);
      });
      if (i) return i;
      throw new Error("Unable to create the browser-bound session key.");
    }
  }
  async deleteDeviceKey(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const i = n.transaction(W, "readwrite");
      i.objectStore(W).delete(t), i.oncomplete = () => r(), i.onerror = () => o(i.error);
    });
  }
}
const wt = "bitlogin:session:v1", wr = "bitlogin:session-device-key:v1";
function Ei(e) {
  return !!(e && typeof e == "object" && e.v === 3 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function _i(e, t) {
  if (e.length !== 32) throw new Error("Not a lock key.");
  return crypto.subtle.importKey("raw", He(e), "AES-GCM", !1, [t]);
}
async function Ct(e, t = wt) {
  try {
    const n = await e.get(t);
    if (!n) return "none";
    const r = JSON.parse(n);
    return Ei(r) ? "locked" : Pi(r) ? "open" : "none";
  } catch {
    return "none";
  }
}
function bt(e) {
  let t = "";
  for (const n of e) t += String.fromCharCode(n);
  return btoa(t);
}
function kt(e) {
  const t = atob(e);
  return Uint8Array.from(t, (n) => n.charCodeAt(0));
}
function He(e) {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}
function Pi(e) {
  return !!(e && typeof e == "object" && e.v === 2 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function _n(e, t, n, r = wt) {
  const o = {
    everydayPrivateKeyHex: Array.from(t.everydayPrivateKey, (i) => i.toString(16).padStart(2, "0")).join(""),
    accountId: t.accountId,
    recoveryPublicKey: t.recoveryPublicKey,
    activeCredentialEvent: t.activeCredentialEvent,
    activeRecoveryEvent: t.activeRecoveryEvent,
    ...t.connectionVaultRoot ? {
      connectionVaultRootHex: Array.from(
        t.connectionVaultRoot,
        (i) => i.toString(16).padStart(2, "0")
      ).join("")
    } : {},
    ...t.vaultEnabled !== void 0 ? { vaultEnabled: t.vaultEnabled } : {},
    ...t.everydayKeyDerived !== void 0 ? { everydayKeyDerived: t.everydayKeyDerived } : {}
  };
  try {
    if (typeof e.getOrCreateDeviceKey != "function") {
      await e.delete(r);
      return;
    }
    const i = await e.getOrCreateDeviceKey(wr), s = crypto.getRandomValues(new Uint8Array(12)), a = new TextEncoder().encode(JSON.stringify(o)), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: s }, i, a), u = {
      v: 2,
      iv: bt(s),
      ciphertext: bt(new Uint8Array(c))
    };
    if (!n) {
      await e.set(r, JSON.stringify(u));
      return;
    }
    const d = crypto.getRandomValues(new Uint8Array(12)), y = await crypto.subtle.encrypt({ name: "AES-GCM", iv: d }, await _i(n, "encrypt"), new TextEncoder().encode(JSON.stringify(u))), f = { v: 3, iv: bt(d), ciphertext: bt(new Uint8Array(y)) };
    await e.set(r, JSON.stringify(f));
  } catch {
    n && await e.delete(r).catch(() => {
    });
  }
}
async function Si(e, t, n = wt) {
  let r;
  try {
    r = await e.get(n);
  } catch {
    return null;
  }
  if (!r) return null;
  try {
    let o = JSON.parse(r);
    if (Ei(o)) {
      if (!t) return null;
      const c = await crypto.subtle.decrypt({ name: "AES-GCM", iv: He(kt(o.iv)) }, await _i(t, "decrypt"), He(kt(o.ciphertext)));
      o = JSON.parse(new TextDecoder().decode(c));
    }
    if (!Pi(o) || typeof e.getOrCreateDeviceKey != "function")
      return await e.delete(n), null;
    const i = await e.getOrCreateDeviceKey(wr), s = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: He(kt(o.iv)) },
      i,
      He(kt(o.ciphertext))
    ), a = JSON.parse(new TextDecoder().decode(s));
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
const nl = "bitlogin:kept-session:v1:", F = (e) => nl + e;
async function H(e, t = wt) {
  try {
    await e.delete(t);
  } catch {
  }
}
async function Gr(e) {
  try {
    await e.delete(wt), typeof e.deleteDeviceKey == "function" && await e.deleteDeviceKey(wr);
  } catch {
  }
}
const rl = 27300, Ue = {
  /** The longest address a picture may have. */
  pictureChars: 300,
  /** The most that is said about someone, in their own words. */
  aboutChars: 280,
  /** How long a pass made here lasts, in seconds. NSWP's verifier allows twelve hours; this gives four. */
  passSec: 4 * 3600,
  /** A profile's content is not read past this many characters. */
  contentChars: 2e4
};
function ol(e) {
  if (typeof e != "string" || e.length > Ue.pictureChars) return "";
  try {
    const t = new URL(e);
    return t.protocol !== "https:" || t.username || t.password || !t.hostname.includes(".") ? "" : t.href.length <= Ue.pictureChars ? t.href : "";
  } catch {
    return "";
  }
}
const il = (e) => e <= 31 || e >= 127 && e <= 159 || e >= 8203 && e <= 8207 || e >= 8232 && e <= 8239 || e >= 8288 && e <= 8303 || e === 65279;
function sl(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, Ue.aboutChars * 8).normalize("NFC")) t += il(n.codePointAt(0)) ? " " : n;
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, Ue.aboutChars).join("").trim();
}
function ye(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, n = at(t.name), r = ol(t.picture), o = sl(t.about);
  return !n && !r && !o ? null : { ...n ? { name: n } : {}, ...r ? { picture: r } : {}, ...o ? { about: o } : {} };
}
function al(e, t) {
  if (!R(e) || e.kind !== 0 || e.pubkey !== t || e.content.length > Ue.contentChars) return null;
  let n;
  try {
    n = JSON.parse(e.content);
  } catch {
    return null;
  }
  if (!n || typeof n != "object" || Array.isArray(n)) return null;
  const r = n;
  return ye({ name: at(r.display_name) || at(r.displayName) || r.name, picture: r.picture, about: r.about });
}
function Hr(e, t) {
  let n = null;
  for (const r of e)
    !R(r) || r.kind !== 0 || r.pubkey !== t || n && r.created_at <= n.at || (n = { at: r.created_at, profile: al(r, t) });
  return n?.profile ?? null;
}
const cl = /^[0-9a-f]{64}$/u;
function ll(e) {
  const t = Ot(e.site);
  if (!t || typeof e.session != "string" || !cl.test(e.session) || e.session === e.identity) return null;
  const n = Math.floor(e.nowSeconds), r = ye(e.profile) ?? {}, o = [
    ["nswp:session", e.session],
    ["nswp:origin", t],
    ["expiration", String(n + Ue.passSec)]
  ];
  return r.name && o.push(["name", r.name]), r.picture && o.push(["picture", r.picture]), r.about && o.push(["about", r.about]), { kind: rl, created_at: n, tags: o, content: "" };
}
const Pn = "bitlogin:kept-accounts:v1", $t = {
  /** No more accounts than this are kept on one device. The one least lately used goes first. */
  accounts: 8
}, ul = /^[0-9a-f]{64}$/u;
function gr(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (typeof t.pubkey != "string" || !ul.test(t.pubkey)) return null;
  const n = ye({ name: t.name, picture: t.picture, about: t.about }) ?? {}, r = typeof t.at == "number" && Number.isFinite(t.at) && t.at > 0 ? Math.floor(t.at) : 0;
  let o;
  try {
    o = Qe(t.pubkey);
  } catch {
    return null;
  }
  return { pubkey: t.pubkey, npub: o, ...n, at: r };
}
function dl(e) {
  if (!e) return [];
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return [];
  }
  if (!Array.isArray(t)) return [];
  const n = /* @__PURE__ */ new Set(), r = [];
  for (const o of t.slice(0, $t.accounts * 2)) {
    const i = gr(o);
    !i || n.has(i.pubkey) || (n.add(i.pubkey), r.push(i));
  }
  return r.sort((o, i) => i.at - o.at).slice(0, $t.accounts);
}
function yl(e, t, n, r = {}) {
  const o = e.find((a) => a.pubkey === t), i = gr({
    pubkey: t,
    at: n,
    name: at(r.name) || o?.name,
    picture: r.picture ?? o?.picture,
    about: r.about ?? o?.about
  });
  if (!i) return { list: [...e], dropped: [] };
  const s = [i, ...e.filter((a) => a.pubkey !== t)];
  return { list: s.slice(0, $t.accounts), dropped: s.slice($t.accounts).map((a) => a.pubkey) };
}
function fl(e, t, n) {
  return e.map((r) => r.pubkey === t ? gr({ ...r, name: at(n.name) || r.name, picture: n.picture ?? r.picture, about: n.about ?? r.about }) ?? r : r);
}
const Nt = (e, t) => e.filter((n) => n.pubkey !== t);
async function B(e) {
  try {
    return dl(await e.get(Pn));
  } catch {
    return [];
  }
}
async function me(e, t) {
  try {
    t.length === 0 ? await e.delete(Pn) : await e.set(Pn, JSON.stringify(t));
  } catch {
  }
}
const mr = "bitlogin:lock:v1", pl = "bitlogin/lock/device/v1", hl = q("bitlogin:lock:device-wrap:v1"), J = {
  pinMin: 6,
  pinMax: 64,
  /** Wrong tries, with the PIN or the device, before the record is removed. */
  tries: 5,
  /** Unused for this long, an unlocked session locks itself. In seconds. */
  idleSec: 900
}, Me = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
};
function Ki(e) {
  if (typeof e != "string") return null;
  const t = e.normalize("NFKC"), n = [...t].length;
  return n >= J.pinMin && n <= J.pinMax ? q(t) : null;
}
async function Ai(e, t) {
  const n = D(12), r = await crypto.subtle.importKey("raw", Me(e), "AES-GCM", !1, ["encrypt"]), o = await crypto.subtle.encrypt({ name: "AES-GCM", iv: Me(n) }, r, Me(t));
  return { iv: T(n), wrapped: T(new Uint8Array(o)) };
}
async function Ri(e, t) {
  try {
    const n = await crypto.subtle.importKey("raw", Me(e), "AES-GCM", !1, ["decrypt"]), r = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: Me(O(t.iv)) }, n, Me(O(t.wrapped))));
    return r.length === 32 ? r : null;
  } catch {
    return null;
  }
}
const Ci = (e) => pt(Gn(hl, e), pl, 32), zr = (e) => !!e && typeof e == "object" && typeof e.iv == "string" && typeof e.wrapped == "string";
async function fe(e) {
  let t;
  try {
    t = await e.get(mr);
  } catch {
    return null;
  }
  if (!t) return null;
  try {
    const n = JSON.parse(t);
    return n.v !== 1 || typeof n.tries != "number" || !Number.isInteger(n.tries) || n.tries < 0 || !zr(n.pin) || typeof n.pin.salt != "string" || n.device !== void 0 && (!zr(n.device) || typeof n.device.credentialId != "string") ? null : { v: 1, tries: n.tries, pin: n.pin, ...n.device ? { device: n.device } : {} };
  } catch {
    return null;
  }
}
const yt = (e, t) => e.set(mr, JSON.stringify(t));
async function tt(e) {
  try {
    await e.delete(mr);
  } catch {
  }
}
async function vl(e, t, n) {
  const r = Ki(t);
  if (!r) throw new Error(`A PIN is ${J.pinMin} to ${J.pinMax} characters.`);
  const o = n ? n.slice() : D(32), i = D(16), s = await so(r, i);
  try {
    const a = n ? await fe(e) : null;
    await yt(e, { v: 1, tries: 0, pin: { salt: T(i), ...await Ai(s, o) }, ...a?.device ? { device: a.device } : {} });
  } finally {
    s.fill(0), r.fill(0);
  }
  return o;
}
async function wl(e, t, n, r) {
  const o = await fe(e);
  if (!o) throw new Error("The lock is not on.");
  if (r.length !== 32 || !/^[A-Za-z0-9_-]{8,1400}$/u.test(n)) throw new Error("That is not a device unlock.");
  const i = Ci(r);
  try {
    await yt(e, { ...o, device: { credentialId: n, ...await Ai(i, t) } });
  } finally {
    i.fill(0);
  }
}
async function gl(e) {
  const t = await fe(e);
  t?.device && await yt(e, { v: 1, tries: t.tries, pin: t.pin });
}
async function Ni(e, t) {
  const n = await fe(e);
  if (!n) return { ok: !1, left: 0, removed: !0 };
  const r = n.tries + 1;
  await yt(e, { ...n, tries: r });
  const o = await t(n);
  return o ? (await yt(e, { ...n, tries: 0 }), { ok: !0, lockKey: o }) : r >= J.tries ? (await tt(e), { ok: !1, left: 0, removed: !0 }) : { ok: !1, left: J.tries - r, removed: !1 };
}
function ml(e, t) {
  return Ni(e, async (n) => {
    const r = Ki(t);
    if (!r) return null;
    const o = await so(r, O(n.pin.salt));
    try {
      return await Ri(o, n.pin);
    } finally {
      o.fill(0), r.fill(0);
    }
  });
}
function bl(e, t) {
  return Ni(e, async (n) => {
    if (!n.device || t.length !== 32) return null;
    const r = Ci(t);
    try {
      return await Ri(r, n.device);
    } finally {
      r.fill(0);
    }
  });
}
const nt = "bitlogin:signer-grant:v1:", Ti = "bitlogin:signer-grant-device-key:v1", le = {
  /** The longest a site BitLogin knows is remembered, in seconds: thirty days from Allow. */
  keepSec: 720 * 3600,
  /** The longest for a site it does not know: seven days. */
  unknownKeepSec: 168 * 3600,
  /** How many recent room passes are remembered, to count them across page loads. */
  passKept: 10,
  /** How many recent signatures are remembered, to count them across page loads. */
  signedKept: 60
}, an = (e) => e.at ?? e.until - Mi(e.site), Mi = (e) => (Q(e) ? vs(e) : Es(e) !== null) ? le.keepSec : le.unknownKeepSec, kl = /^[0-9a-f]{64}$/u;
function Pe(e) {
  if (typeof e != "string" || e.length > 300 || e.includes("*")) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin === e ? t.origin : "";
  } catch {
    return "";
  }
}
const br = (e) => Q(e) || Pe(e), Qr = (e) => btoa(Array.from(e, (t) => String.fromCharCode(t)).join("")), Yr = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), Xr = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}, El = (e) => Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
async function cn(e, t, n) {
  const r = br(t.site);
  if (!r || t.everydayPrivateKey.length !== 32 || typeof e.getOrCreateDeviceKey != "function" || Q(r) && t.permissions) return !1;
  const o = Math.min(Math.floor(t.until), Math.floor(n) + Mi(r));
  if (!(o > n)) return !1;
  const i = crypto.getRandomValues(new Uint8Array(12));
  try {
    const s = await e.getOrCreateDeviceKey(Ti), a = JSON.stringify({
      site: r,
      key: El(t.everydayPrivateKey),
      until: o,
      ...t.name ? { name: t.name.slice(0, 48) } : {},
      ...ye(t.profile) ? { profile: ye(t.profile) } : {},
      // An application's public signatures are counted up to its own hourly limit, so more of them are kept.
      signed: t.signed.filter((d) => Number.isFinite(d)).slice(-(t.permissions ? Lt.public.hourly : le.signedKept)),
      ...t.permissions ? { permissions: t.permissions } : {},
      ...!t.permissions && !Q(r) && de(t.more).length ? { more: de(t.more) } : {},
      ...typeof t.at == "number" ? { at: Math.floor(t.at) } : {},
      ...Y(t.relays).length ? { relays: Y(t.relays) } : {},
      ...typeof t.checkedAt == "number" ? { checkedAt: Math.floor(t.checkedAt) } : {},
      ...typeof t.seenAt == "number" ? { seenAt: Math.floor(t.seenAt) } : {},
      ...t.signedPass?.length ? { signedPass: t.signedPass.filter((d) => Number.isFinite(d)).slice(-le.passKept) } : {},
      ...t.permissions && t.signedSensitive ? { signedSensitive: t.signedSensitive.filter((d) => Number.isFinite(d)).slice(-Lt.sensitive.hourly) } : {}
    }), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, s, new TextEncoder().encode(a)), u = { v: 1, iv: Qr(i), ciphertext: Qr(new Uint8Array(c)) };
    return await e.set(nt + r, JSON.stringify(u)), !0;
  } catch {
    return !1;
  }
}
async function Et(e, t, n) {
  const r = br(t);
  if (!r || typeof e.getOrCreateDeviceKey != "function") return null;
  try {
    const o = await e.get(nt + r);
    if (!o) return null;
    const i = JSON.parse(o);
    if (i.v !== 1 || typeof i.iv != "string" || typeof i.ciphertext != "string") return null;
    const s = await e.getOrCreateDeviceKey(Ti), a = await crypto.subtle.decrypt({ name: "AES-GCM", iv: Xr(Yr(i.iv)) }, s, Xr(Yr(i.ciphertext))), c = JSON.parse(new TextDecoder().decode(a)), u = (p) => typeof p == "number" && Number.isFinite(p) && p > 0 ? Math.floor(p) : void 0, d = ye(c.profile), y = c.permissions === void 0 ? void 0 : Qn(c.permissions);
    if (y === null || y && (Q(r) || !Yn(r, y)))
      return await e.delete(nt + r), null;
    const f = (p, v) => Array.isArray(p) ? p.filter((h) => typeof h == "number" && Number.isFinite(h)).slice(-v) : [];
    return c.site !== r || typeof c.key != "string" || !kl.test(c.key) || typeof c.until != "number" ? null : !(c.until > n) || c.until > n + le.keepSec ? (await e.delete(nt + r), null) : {
      site: r,
      everydayPrivateKey: Uint8Array.from(c.key.match(/.{2}/gu) ?? [], (p) => Number.parseInt(p, 16)),
      until: c.until,
      ...typeof c.name == "string" && c.name ? { name: c.name.slice(0, 48) } : {},
      ...d ? { profile: d } : {},
      signed: f(c.signed, y ? Lt.public.hourly : le.signedKept),
      ...f(c.signedPass, le.passKept).length ? { signedPass: f(c.signedPass, le.passKept) } : {},
      ...!y && !Q(r) && de(c.more).length ? { more: de(c.more) } : {},
      ...u(c.at) ? { at: u(c.at) } : {},
      ...Y(c.relays).length ? { relays: Y(c.relays) } : {},
      ...u(c.checkedAt) ? { checkedAt: u(c.checkedAt) } : {},
      ...u(c.seenAt) ? { seenAt: u(c.seenAt) } : {},
      ...y ? { permissions: y, signedSensitive: f(c.signedSensitive, Lt.sensitive.hourly) } : {}
    };
  } catch {
    return null;
  }
}
async function _t(e, t) {
  const n = br(t);
  if (n)
    try {
      await e.delete(nt + n);
    } catch {
    }
}
const Ii = "bitlogin:signer-handoff:v1", _l = /* @__PURE__ */ new Set([
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
]), Sn = /^[0-9a-f]{64}$/;
function Pl(e) {
  return Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
}
function Sl(e) {
  return Uint8Array.from(e.match(/.{2}/g) ?? [], (t) => Number.parseInt(t, 16));
}
function Kl(e, t, n, r, o = {}) {
  if (!Sn.test(t)) throw new Error("The hand-off has no usable recipient key.");
  if (e.length !== 32) throw new Error("No identity is unlocked in this session.");
  let i = null;
  if (r !== void 0) {
    const f = Pe(r.site), p = Qn(r.permissions);
    if (!f || !p || !Yn(f, p)) throw new Error("That is not a permission set an application may be given.");
    i = { site: f, permissions: p };
  }
  const s = o.site === void 0 ? "" : Pe(o.site);
  if (o.site !== void 0 && (!s || i && i.site !== s)) throw new Error("The hand-off names no usable site.");
  const a = ye(o.profile), c = !!s && o.visitOnly !== !0 && o.remember === !0, u = o.family === void 0 ? "" : Q(o.family);
  if (o.family !== void 0 && (!u || i || !c || !Ne(s, u))) throw new Error("That is not a family this site may be allowed as.");
  const d = de(o.more);
  if (o.more !== void 0 && (d.length === 0 || !s || i || u)) throw new Error("That is not something this site may be let do.");
  const y = new ae(n.slice());
  try {
    const f = JSON.stringify({ v: 1, purpose: Ii, key: Pl(e), ...i ? { app: i } : {}, ...s ? { site: s } : {}, ...a ? { profile: a } : {}, ...c ? { remember: !0 } : {}, ...typeof o.at == "number" && Number.isFinite(o.at) ? { at: Math.floor(o.at) } : {}, ...Y(o.relays).length ? { relays: Y(o.relays) } : {}, ...u ? { family: u } : {}, ...d.length ? { more: d } : {} });
    return { senderPublicKey: y.getPublicKey(), payload: y.nip44Encrypt(t, f) };
  } finally {
    y.destroy();
  }
}
function Al(e, t) {
  if (!e || !Sn.test(e.senderPublicKey) || typeof e.payload != "string")
    throw new Error("That is not a signer hand-off.");
  const n = new ae(t.slice());
  let r;
  try {
    r = n.nip44Decrypt(e.senderPublicKey, e.payload);
  } catch {
    throw new Error("The hand-off could not be opened.");
  } finally {
    n.destroy();
  }
  let o;
  try {
    o = JSON.parse(r);
  } catch {
    throw new Error("The hand-off could not be read.");
  }
  if (o.v !== 1 || o.purpose !== Ii || typeof o.key != "string" || !Sn.test(o.key))
    throw new Error("That is not a signer hand-off.");
  const i = Sl(o.key);
  try {
    _(i);
  } catch {
    throw i.fill(0), new Error("The hand-off carried an unusable key.");
  }
  const s = o.site === void 0 ? null : Pe(o.site);
  if (s === "")
    throw i.fill(0), new Error("The hand-off names no usable site.");
  const a = ye(o.profile), c = o.remember === !0 && !!s, u = typeof o.at == "number" && Number.isFinite(o.at) && o.at > 0 ? Math.floor(o.at) : null, d = Y(o.relays), y = o.family === void 0 ? null : Q(o.family);
  if (y === "" || y && (o.app !== void 0 || !c || !Ne(s, y)))
    throw i.fill(0), new Error("The hand-off names a family it cannot be kept for.");
  const f = de(o.more);
  if (o.more !== void 0 && (f.length === 0 || !s || y || o.app !== void 0))
    throw i.fill(0), new Error("The hand-off carries something this site may not be let do.");
  if (o.app === void 0) return { key: i, app: null, site: s, profile: a, remember: c, at: u, relays: d, family: y, more: f };
  const p = o.app, v = p && typeof p == "object" ? Pe(p.site) : "", h = p && typeof p == "object" ? Qn(p.permissions) : null;
  if (!v || !h || !Yn(v, h) || s && s !== v)
    throw i.fill(0), new Error("The hand-off carried a permission set that cannot be read.");
  return { key: i, app: { site: v, permissions: h }, site: v, profile: a, remember: c, at: u, relays: d, family: null, more: [] };
}
const Oi = 38e3, Li = "38172", Rl = ["https://testnut.cashu.space", "https://nofees.testnut.cashu.space"], Cl = 8;
function Nl(e, t, n = 10) {
  const r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const i of e)
    if (!(i.kind !== Oi || !i.tags.some((s) => s[0] === "k" && s[1] === Li)))
      for (const s of i.tags) {
        if (s[0] !== "u" || s[2] !== void 0 && s[2] !== "cashu") continue;
        const a = ct(s[1]);
        if (!a || !a.startsWith("https://") || Rl.includes(a)) continue;
        const c = o.get(i.pubkey) ?? /* @__PURE__ */ new Set();
        !c.has(a) && c.size >= Cl || (c.add(a), o.set(i.pubkey, c), (r.get(a) ?? r.set(a, /* @__PURE__ */ new Set()).get(a)).add(i.pubkey));
      }
  return [...r].map(([i, s]) => ({ mint: i, by: s.size, byFollowed: [...s].filter((a) => t.has(a)).length })).filter((i) => i.by >= 2 || i.byFollowed >= 1).sort((i, s) => s.byFollowed - i.byFollowed || s.by - i.by || i.mint.localeCompare(s.mint)).slice(0, n);
}
const Kn = 30078, An = "bitlogin-receipt:", Vt = 300, Ft = "bitlogin:receipts:v1:";
function kr(e, t) {
  const n = e, r = n?.event;
  if (!r || typeof r != "object" || r.kind !== 30078 || typeof r.content != "string" || r.content.length > 8e3 || !Array.isArray(r.tags) || !R(r)) return null;
  try {
    if (JSON.parse(r.content).buyerPubkey !== t) return null;
  } catch {
    return null;
  }
  return {
    event: { id: r.id, pubkey: r.pubkey, created_at: r.created_at, kind: r.kind, tags: r.tags.map((o) => o.map(String)), content: r.content, sig: r.sig },
    title: typeof n?.title == "string" ? n.title.slice(0, 80) : "",
    via: Ot(n?.via) || ""
  };
}
async function Di(e, t) {
  const n = t.getPublicKey(), r = /* @__PURE__ */ new Map(), o = async (s) => {
    try {
      const a = await e.get(s);
      return a ? JSON.parse(t.nip44Decrypt(n, a)) : null;
    } catch {
      return null;
    }
  }, i = await o(Ft + n);
  for (const s of Array.isArray(i?.ids) ? i.ids.slice(0, Vt) : []) {
    if (typeof s != "string") continue;
    const a = await o(`${Ft}${n}:${s}`), c = kr(a, n);
    c && c.event.id === s && r.set(s, { ...c, saved: a?.saved === !0 });
  }
  return r;
}
async function Er(e, t, n, r) {
  const o = t.getPublicKey(), i = (s) => t.nip44Encrypt(o, JSON.stringify(s));
  for (const s of r) {
    const a = n.get(s);
    a && await e.set(`${Ft}${o}:${s}`, i(a));
  }
  await e.set(Ft + o, i({ ids: [...n.keys()] }));
}
const Rn = (e, t) => ({
  receipts: [...e.values()].map(({ event: n, title: r, via: o }) => ({ event: n, title: r, via: o })).sort((n, r) => r.event.created_at - n.event.created_at),
  offline: t,
  unsaved: [...e.values()].some((n) => !n.saved)
});
async function xi(e, t) {
  const { signer: n, store: r, relays: o } = e, i = n.getPublicKey(), s = Math.floor(e.now ?? Date.now() / 1e3), a = [];
  for (const [c, u] of t) {
    if (u.saved) continue;
    const d = n.signEvent({ kind: Kn, created_at: s, tags: [["d", An + c]], content: n.nip44Encrypt(i, JSON.stringify({ v: 1, event: u.event, title: u.title, via: u.via })) });
    x(await o.publishAll(d, 6e3).catch(() => [])) >= Math.min(2, o.relayUrls.length) && (u.saved = !0, a.push(c));
  }
  a.length && await Er(r, n, t, a);
}
async function Tl(e) {
  const { signer: t, store: n, relays: r } = e, o = t.getPublicKey(), i = await Di(n, t), s = await r.queryQuorum({ kinds: [Kn], authors: [o], limit: 500 }, 6e3).catch(() => null);
  if (!s || s.respondedCount === 0) return Rn(i, !0);
  const a = /* @__PURE__ */ new Set(), c = [];
  for (const u of s.outcomes.flatMap((d) => d.events)) {
    if (u.kind !== Kn || u.pubkey !== o || !R(u)) continue;
    const d = u.tags.find((f) => f[0] === "d")?.[1];
    if (typeof d != "string" || !d.startsWith(An)) continue;
    let y;
    try {
      y = kr(JSON.parse(t.nip44Decrypt(o, u.content)), o);
    } catch {
      continue;
    }
    !y || y.event.id !== d.slice(An.length) || (a.add(y.event.id), !(i.has(y.event.id) || i.size >= Vt) && (i.set(y.event.id, { ...y, saved: !0 }), c.push(y.event.id)));
  }
  for (const [u, d] of i)
    a.has(u) !== d.saved && (d.saved = a.has(u), c.push(u));
  return await Er(n, t, i, c), await xi(e, i), Rn(i, !1);
}
async function Ml(e, t) {
  const { signer: n, store: r } = e, o = n.getPublicKey(), i = Array.isArray(t) ? t.slice(0, Vt).map((c) => kr(c, o)) : [];
  if (i.length === 0 || i.some((c) => !c)) throw new Error("That is not a receipt of this account's.");
  const s = await Di(r, n), a = [];
  for (const c of i)
    if (!s.has(c.event.id)) {
      if (s.size >= Vt) throw new Error("This account keeps as many receipts as it can.");
      s.set(c.event.id, { ...c, saved: !1 }), a.push(c.event.id);
    }
  return await Er(r, n, s, a), await xi(e, s).catch(() => {
  }), Rn(s, !1);
}
function Ui(e) {
  const t = e;
  if (!t || typeof t != "object") return null;
  const n = go(t.listing);
  if (!n || typeof t.order != "string" || !/^order_[A-Za-z0-9_-]{12,80}$/u.test(t.order) || typeof t.key != "string" || !/^[A-Za-z0-9_-]{16,128}$/u.test(t.key)) return null;
  const r = Ot(t.service);
  return r ? { listing: n, order: t.order, key: t.key, service: r, title: typeof t.title == "string" ? t.title.slice(0, 80) : "", via: Ot(t.via) || "", at: typeof t.at == "number" && Number.isFinite(t.at) ? t.at : 0 } : null;
}
const qi = (e) => Array.isArray(e) ? e.map(Ui).filter((t) => !!t).slice(-20) : [], Cn = 30078, Nn = "bitlogin-pay-settings", $i = "bitlogin:pay-settings:v1:";
async function Vi({ signer: e, store: t }) {
  const n = e.getPublicKey();
  try {
    const r = await t.get($i + n), o = r ? JSON.parse(e.nip44Decrypt(n, r)) : null;
    return o && typeof o.at == "number" ? { limitSats: Xn(o.limitSats), orders: qi(o.orders), at: o.at, saved: o.saved === !0 } : null;
  } catch {
    return null;
  }
}
const Wt = ({ signer: e, store: t }, n) => t.set($i + e.getPublicKey(), e.nip44Encrypt(e.getPublicKey(), JSON.stringify(n)));
async function Fi(e, t) {
  const { signer: n, relays: r } = e, o = n.getPublicKey(), i = n.signEvent({ kind: Cn, created_at: Math.floor(t.at), tags: [["d", Nn]], content: n.nip44Encrypt(o, JSON.stringify({ v: 1, limitSats: t.limitSats, orders: t.orders, at: t.at })) });
  return x(await r.publishAll(i, 5e3).catch(() => [])) >= Math.min(2, r.relayUrls.length);
}
async function Il(e) {
  const { signer: t, relays: n } = e, r = t.getPublicKey();
  let o = await Vi(e);
  const i = await n.queryQuorum({ kinds: [Cn], authors: [r], "#d": [Nn], limit: 2 }, 3e3).catch(() => null);
  if (i && i.respondedCount > 0) {
    const s = i.outcomes.flatMap((c) => c.events).filter((c) => c.kind === Cn && c.pubkey === r && c.tags.some((u) => u[0] === "d" && u[1] === Nn) && R(c)).sort((c, u) => u.created_at - c.created_at)[0];
    let a = null;
    try {
      const c = s ? JSON.parse(t.nip44Decrypt(r, s.content)) : null;
      c && (a = { limitSats: Xn(c.limitSats), orders: qi(c.orders), at: typeof c.at == "number" ? c.at : s.created_at, saved: !0 });
    } catch {
      a = null;
    }
    a && (!o || a.at > o.at) ? (o = a, await Wt(e, o)) : o && (!o.saved || !a) && (o.saved = await Fi(e, o), await Wt(e, o));
  }
  return { limitSats: o?.limitSats ?? wo.default, orders: o?.orders ?? [], unsaved: !!o && !o.saved };
}
async function Ol(e, t) {
  const n = t ?? {}, r = await Vi(e), o = { limitSats: r?.limitSats ?? wo.default, orders: r?.orders ?? [], at: e.now ?? Date.now() / 1e3, saved: !1 };
  if (n.limitSats !== void 0) {
    if (Xn(n.limitSats) !== n.limitSats) throw new Error("That is not a limit this wallet keeps.");
    o.limitSats = n.limitSats;
  } else if (n.addOrder !== void 0) {
    const i = Ui({ ...n.addOrder, at: o.at });
    if (!i) throw new Error("That is not an order this wallet can keep.");
    o.orders = [...o.orders.filter((s) => !(s.listing === i.listing && s.service === i.service)), i].slice(-20);
  } else if (typeof n.removeOrder == "string")
    o.orders = o.orders.filter((i) => i.order !== n.removeOrder);
  else throw new Error("That is not a change this wallet keeps.");
  return await Wt(e, o), o.saved = await Fi(e, o).catch(() => !1), o.saved && await Wt(e, o), { limitSats: o.limitSats, orders: o.orders, unsaved: !o.saved };
}
const Tn = 30078, Mn = "bitlogin-drive:", ze = 10063, Ll = 24242, rt = "bitlogin:drive:v1:", Dl = { autoPaySats: 0, at: 0, saved: !0 }, _r = (e) => {
  const t = e?.autoPaySats;
  return { autoPaySats: typeof t == "number" && Number.isSafeInteger(t) && t >= 0 && t <= 1e5 ? t : 0 };
};
async function Wi(e, t) {
  const n = t.getPublicKey(), r = { folders: /* @__PURE__ */ new Map(), removed: /* @__PURE__ */ new Map(), settings: { ...Dl } }, o = async (a) => {
    try {
      const c = await e.get(a);
      return c ? JSON.parse(t.nip44Decrypt(n, c)) : null;
    } catch {
      return null;
    }
  }, i = await o(rt + n);
  if (!i) return r;
  for (const a of Array.isArray(i.folders) ? i.folders.slice(0, er.folders + 1) : []) {
    if (typeof a != "string") continue;
    const c = await o(`${rt}${n}:${a}`), u = Zn(c?.folder);
    u && r.folders.set(u.id, { folder: u, saved: c?.saved === !0 });
  }
  for (const a of Array.isArray(i.removed) ? i.removed : [])
    Array.isArray(a) && typeof a[0] == "string" && typeof a[1] == "number" && r.removed.set(a[0], a[1]);
  const s = i.settings;
  return r.settings = { ..._r(s), at: typeof s?.at == "number" ? s.at : 0, saved: s?.saved !== !1 }, r;
}
async function Pr(e, t, n, r, o = []) {
  const i = t.getPublicKey(), s = (a) => t.nip44Encrypt(i, JSON.stringify(a));
  for (const a of r) {
    const c = n.folders.get(a);
    c && await e.set(`${rt}${i}:${a}`, s(c));
  }
  for (const a of o) await e.delete(`${rt}${i}:${a}`).catch(() => {
  });
  await e.set(rt + i, s({ folders: [...n.folders.keys()], removed: [...n.removed], settings: n.settings }));
}
const ln = (e, t) => x(e) >= Math.min(2, t);
function un(e, t, n, r) {
  const o = e.getPublicKey();
  return e.signEvent({ kind: Tn, created_at: Math.floor(r), tags: [["d", Mn + t]], content: e.nip44Encrypt(o, JSON.stringify(n)) });
}
const In = (e, t) => ({
  folders: [...e.folders.values()].map((n) => n.folder),
  settings: { autoPaySats: e.settings.autoPaySats },
  offline: t,
  unsaved: [...e.folders.values()].some((n) => !n.saved) || e.removed.size > 0 || !e.settings.saved
});
async function Bi(e, t) {
  const { signer: n, store: r, relays: o } = e, i = e.now ?? Date.now() / 1e3, s = [];
  for (const [a, c] of t.folders)
    c.saved || !ln(await o.publishAll(un(n, a, { v: 1, folder: c.folder }, Math.max(i, c.folder.at)), 6e3).catch(() => []), o.relayUrls.length) || (c.saved = !0, s.push(a));
  for (const [a, c] of [...t.removed])
    ln(await o.publishAll(un(n, a, { v: 1, deleted: !0, at: c }, Math.max(i, c)), 6e3).catch(() => []), o.relayUrls.length) && t.removed.delete(a);
  t.settings.saved || ln(await o.publishAll(un(n, "settings", { v: 1, settings: { autoPaySats: t.settings.autoPaySats }, at: t.settings.at }, Math.max(i, t.settings.at)), 6e3).catch(() => []), o.relayUrls.length) && (t.settings.saved = !0), await Pr(r, n, t, s);
}
async function xl(e) {
  const { signer: t, store: n, relays: r } = e, o = t.getPublicKey(), i = await Wi(n, t), s = await r.queryQuorum({ kinds: [Tn], authors: [o], limit: 500 }, 6e3).catch(() => null);
  if (!s || s.respondedCount === 0) return In(i, !0);
  const a = /* @__PURE__ */ new Map();
  for (const d of s.outcomes.flatMap((y) => y.events)) {
    if (d.kind !== Tn || d.pubkey !== o || !R(d)) continue;
    const y = d.tags.find((p) => p[0] === "d")?.[1];
    if (typeof y != "string" || !y.startsWith(Mn)) continue;
    const f = y.slice(Mn.length);
    (!a.has(f) || a.get(f).created_at < d.created_at) && a.set(f, d);
  }
  const c = [], u = [];
  for (const [d, y] of a) {
    let f;
    try {
      f = JSON.parse(t.nip44Decrypt(o, y.content));
    } catch {
      continue;
    }
    if (d === "settings") {
      const h = typeof f.at == "number" ? f.at : y.created_at;
      (i.settings.saved || h > i.settings.at) && (i.settings = { ..._r(f.settings), at: h, saved: !0 });
      continue;
    }
    const p = i.folders.get(d);
    if (f.deleted === !0) {
      const h = typeof f.at == "number" ? f.at : y.created_at;
      p && (p.saved || p.folder.at <= h) && (i.folders.delete(d), u.push(d)), i.removed.delete(d);
      continue;
    }
    const v = Zn(f.folder);
    !v || v.id !== d || i.removed.has(d) || p && !p.saved && p.folder.at >= v.at || p && p.saved && p.folder.at >= v.at || (i.folders.set(d, { folder: v, saved: !0 }), c.push(d));
  }
  for (const [d, y] of i.folders) a.has(d) || (y.saved = !1);
  return await Pr(n, t, i, c, u), await Bi(e, i), In(i, !1);
}
async function Ul(e, t) {
  const { signer: n, store: r } = e, o = e.now ?? Date.now() / 1e3, i = (t.save ?? []).map(Zn);
  if (i.some((u) => !u)) throw new Error("That is not a folder this drive can keep.");
  const s = await Wi(r, n), a = [], c = [];
  for (const u of i)
    s.folders.set(u.id, { folder: u, saved: !1 }), s.removed.delete(u.id), a.push(u.id);
  for (const u of t.remove ?? [])
    typeof u != "string" || !/^[0-9a-f]{16}$/u.test(u) || (s.folders.delete(u), s.removed.set(u, Math.floor(o)), c.push(u));
  if (s.folders.size > er.folders + 1) throw new Error("There are too many folders.");
  return t.settings !== void 0 && (s.settings = { ..._r(t.settings), at: Math.floor(o), saved: !1 }), await Pr(r, n, s, a, c), await Bi(e, s), In(s, !1);
}
function ql(e, t, n = Date.now() / 1e3) {
  const r = tr(t.server), o = t.verb;
  if (!r || o !== "upload" && o !== "delete" && o !== "get") throw new Error("That is not something a file server is asked.");
  const i = typeof t.sha256 == "string" && /^[0-9a-f]{64}$/u.test(t.sha256) ? t.sha256 : "";
  if (!i) throw new Error("A permission note names the one file it is for.");
  const s = e.signEvent({
    kind: Ll,
    // In the past, as a server requires, by a margin wider than two clocks usually differ.
    created_at: Math.floor(n) - 30,
    tags: [["t", o], ["expiration", String(Math.floor(n) + 300)], ["server", new URL(r).hostname.toLowerCase()], ["x", i]],
    content: o === "upload" ? "Upload a file" : o === "delete" ? "Delete a file" : "Fetch a file"
  }), a = new TextEncoder().encode(JSON.stringify(s));
  let c = "";
  for (const u of a) c += String.fromCharCode(u);
  return btoa(c).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}
const ji = (e) => [...new Set(e.tags.filter((t) => t[0] === "server").map((t) => tr(t[1])).filter(Boolean))];
function $l(e, t, n = 12) {
  const r = /* @__PURE__ */ new Map();
  for (const i of e) i.kind === ze && (!r.has(i.pubkey) || r.get(i.pubkey).created_at < i.created_at) && r.set(i.pubkey, i);
  const o = /* @__PURE__ */ new Map();
  for (const i of r.values()) for (const s of ji(i).filter((a) => a.startsWith("https://")).slice(0, 6)) (o.get(s) ?? o.set(s, /* @__PURE__ */ new Set()).get(s)).add(i.pubkey);
  return [...o].map(([i, s]) => ({ server: i, by: s.size, byFollowed: [...s].filter((a) => t.has(a)).length })).filter((i) => i.by >= 2 || i.byFollowed >= 1).sort((i, s) => s.byFollowed - i.byFollowed || s.by - i.by || i.server.localeCompare(s.server)).slice(0, n);
}
const Ji = "bitlogin:ecash:v1:", Bt = (e) => e.startsWith("local:"), Vl = () => `local:${Array.from(crypto.getRandomValues(new Uint8Array(8)), (e) => e.toString(16).padStart(2, "0")).join("")}`;
async function Sr(e, t) {
  const n = t.getPublicKey();
  try {
    const r = await e.get(Ji + n);
    if (!r) return { wallet: null, tokens: [] };
    const o = JSON.parse(t.nip44Decrypt(n, r)), i = typeof o.wallet == "string" ? mo(o.wallet) : null, s = [];
    for (const a of Array.isArray(o.tokens) ? o.tokens : []) {
      const c = a, u = ko(c.proofs);
      typeof c.event == "string" && c.event.length <= 80 && ct(c.mint) && u?.length && s.push({ event: c.event, mint: ct(c.mint), proofs: u });
    }
    return { wallet: i, tokens: s };
  } catch {
    return { wallet: null, tokens: [] };
  }
}
async function jt(e, t, n) {
  const r = t.getPublicKey();
  await e.set(Ji + r, t.nip44Encrypt(r, JSON.stringify({ wallet: n.wallet ? bo(n.wallet) : null, tokens: n.tokens })));
}
const Kr = (e, t) => x(e) >= Math.min(2, t);
function Gi(e, t, n) {
  const r = e.getPublicKey();
  return e.signEvent({ kind: et, created_at: Math.floor(n), tags: [], content: e.nip44Encrypt(r, Ys(t)) });
}
const Jt = (e, t) => ({ mints: e.wallet?.mints ?? [], tokens: e.tokens, offline: t, unsaved: e.tokens.some((n) => Bt(n.event)) });
async function Fl(e) {
  const { signer: t, store: n, relays: r } = e, o = t.getPublicKey(), i = await Sr(n, t), [s, a, c] = await Promise.all([
    r.queryQuorum({ kinds: [bn], authors: [o], limit: 2 }, 5e3),
    r.queryQuorum({ kinds: [et], authors: [o], limit: lt.tokens }, 6e3),
    r.queryQuorum({ kinds: [5], authors: [o], "#k": [String(et)], limit: lt.tokens }, 6e3)
  ]).catch(() => [null, null, null]);
  if (!a || !s || !c || a.respondedCount === 0) return Jt(i, !0);
  const u = (b, S) => b.filter((M) => M.kind === S && M.pubkey === o && R(M)), d = (b) => {
    try {
      return t.nip44Decrypt(o, b.content);
    } catch {
      return null;
    }
  }, y = u(s.outcomes.flatMap((b) => b.events), bn).sort((b, S) => S.created_at - b.created_at)[0], f = y && mo(d(y) ?? "") || i.wallet, p = new Set(u(c.outcomes.flatMap((b) => b.events), 5).flatMap((b) => b.tags.filter((S) => S[0] === "e" && typeof S[1] == "string").map((S) => S[1]))), v = /* @__PURE__ */ new Map();
  for (const b of u(a.outcomes.flatMap((S) => S.events), et)) v.set(b.id, b);
  const h = [...v.values()].flatMap((b) => {
    const S = Gs(d(b) ?? "");
    return S ? [{ event: b.id, created_at: b.created_at, ...S }] : [];
  }), g = Hs(h, p), m = new Set(g.flatMap((b) => b.proofs.map((S) => S.secret))), k = { wallet: f, tokens: [...g] };
  for (const b of i.tokens.filter((S) => Bt(S.event))) {
    const S = b.proofs.filter((X) => !m.has(X.secret));
    if (S.length === 0) continue;
    const M = Gi(t, { mint: b.mint, proofs: S }, e.now ?? Date.now() / 1e3), $ = Kr(await r.publishAll(M, 6e3).catch(() => []), r.relayUrls.length);
    k.tokens.push({ event: $ ? M.id : b.event, mint: b.mint, proofs: S });
  }
  return await jt(n, t, k), Jt(k, !1);
}
async function Wl(e, t) {
  const { signer: n, store: r, relays: o } = e, i = n.getPublicKey(), s = [...new Set((Array.isArray(t) ? t : []).map(ct).filter(Boolean))];
  if (s.length === 0 || s.length > lt.mints) throw new Error("Name between one and five mints, each an https address.");
  const a = await Sr(r, n), c = { privkey: a.wallet?.privkey ?? e.newKey(), mints: s }, u = { wallet: c, tokens: a.tokens };
  await jt(r, n, u);
  const d = n.signEvent({ kind: bn, created_at: Math.floor(e.now ?? Date.now() / 1e3), tags: [], content: n.nip44Encrypt(i, bo(c)) });
  if (!Kr(await o.publishAll(d, 6e3).catch(() => []), o.relayUrls.length)) throw new Error("The wallet was saved in this browser, but no relay took it. Try again when you are online.");
  return Jt(u, !1);
}
async function Bl(e, t) {
  const { signer: n, store: r, relays: o } = e, i = e.now ?? Date.now() / 1e3, s = new Set(t.destroy.filter((v) => typeof v == "string" && v.length <= 80)), a = t.keep.map((v) => ({ mint: ct(v.mint), proofs: ko(v.proofs, 5e3) }));
  if (a.some((v) => !v.mint || !v.proofs)) throw new Error("That is not ecash this wallet can keep.");
  const c = await Sr(r, n), u = a.flatMap((v) => {
    const h = [];
    for (let g = 0; g < v.proofs.length; g += lt.proofsWritten) h.push({ event: Vl(), mint: v.mint, proofs: v.proofs.slice(g, g + lt.proofsWritten) });
    return h;
  }), d = { wallet: c.wallet, tokens: [...c.tokens.filter((v) => !s.has(v.event)), ...u] };
  await jt(r, n, d);
  const y = [...s].filter((v) => !Bt(v)), f = [];
  for (const v of u) {
    const h = Gi(n, { mint: v.mint, proofs: v.proofs, ...y.length && f.length === 0 ? { del: y } : {} }, i);
    Kr(await o.publishAll(h, 6e3).catch(() => []), o.relayUrls.length) && (v.event = h.id, f.push(h.id));
  }
  await jt(r, n, d);
  const p = u.every((v) => !Bt(v.event));
  if (y.length && p) {
    const v = n.signEvent({ kind: 5, created_at: Math.floor(i), tags: [...y.map((h) => ["e", h]), ["k", String(et)]], content: "" });
    await o.publishAll(v, 6e3).catch(() => []);
  }
  if (t.history && p && Number.isSafeInteger(t.history.amount) && t.history.amount > 0) {
    const v = n.getPublicKey(), h = n.signEvent({ kind: zs, created_at: Math.floor(i), tags: [], content: n.nip44Encrypt(v, Qs({ ...t.history, created: f, destroyed: y })) });
    await o.publishAll(h, 6e3).catch(() => []);
  }
  return Jt(d, !1);
}
const Hi = "bitlogin:session-public:v1";
async function jl(e, t) {
  try {
    const n = {
      pubkey: t.pubkey,
      npub: t.npub,
      ...t.name ? { name: t.name } : {}
    };
    await e.set(Hi, JSON.stringify(n));
  } catch {
  }
}
async function Be(e) {
  try {
    await e.delete(Hi);
  } catch {
  }
}
class Jl {
  tail = Promise.resolve();
  run(t) {
    const n = this.tail.then(t, t);
    return this.tail = n.then(
      () => {
      },
      () => {
      }
    ), n;
  }
}
const l = {
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
let he = null, A = [..._o], I = [...Po];
const w = new tl();
let On = !1, Ln = !1;
function Zr(e) {
  On || (A = e.vaultRelays), Ln || (I = e.discoveryRelays);
}
const Gl = new Jl();
let C = null, dn = Date.now();
const Hl = /* @__PURE__ */ new Set(["configure", "lockStatus", "lockOpen", "restoreSession", "getSessionStatus", "logout"]), zi = "bitlogin:taken-back:v1:";
async function zl(e) {
  try {
    const t = await w.get(zi + e);
    return (t ? fo(JSON.parse(t)) : null) ?? gn;
  } catch {
    return gn;
  }
}
function eo(e, t) {
  try {
    return fo(JSON.parse(e.nip44Decrypt(e.getPublicKey(), t)));
  } catch {
    return null;
  }
}
function je() {
  V(), C && P(C), C = null;
}
async function Re() {
  const e = await fe(w);
  return e ? {
    on: !0,
    // Locked with nothing in the active slot too, where other accounts are kept: theirs are sealed under it.
    locked: !C && (await Ct(w) === "locked" || (await B(w)).length > 0),
    device: !!e.device,
    ...e.device ? { credentialId: e.device.credentialId } : {},
    triesLeft: Math.max(0, J.tries - e.tries)
  } : { on: !1, locked: !1, device: !1, triesLeft: 0 };
}
function K() {
  if (!l.signer || !l.everydayPrivateKey)
    throw new Error("No identity is unlocked in this session.");
  return { signer: l.signer, everydayPrivateKey: l.everydayPrivateKey };
}
function G() {
  const e = K();
  if (!l.signerOnly || l.app || !l.site) throw new Error("refused");
  return { ...e, site: l.site };
}
const Dn = "bitlogin:world-counts:v1:", Ql = "bitlogin:follows-seen:v1:", xn = /* @__PURE__ */ new Map();
async function ve(e, t, n, r = !0) {
  const o = `${Dn}${e}:${t}`;
  let i = xn.get(o);
  if (!i)
    try {
      const u = r ? JSON.parse(await w.get(o) ?? "[]") : [];
      i = Array.isArray(u) ? u.filter((d) => typeof d == "number" && Number.isFinite(d)).slice(-n.hourly) : [];
    } catch {
      i = [];
    }
  const s = Us(n, i), a = Date.now(), c = s.take(a);
  return xn.set(o, s.times()), c && r && await w.set(o, JSON.stringify(s.times())).catch(() => {
  }), c;
}
function yn() {
  if (!l.signerOnly || !l.app) throw new Error("refused");
  return l.app;
}
function V() {
  l.signer?.destroy(), l.everydayPrivateKey && l.everydayPrivateKey.fill(0), l.signer = null, l.everydayPrivateKey = null, l.accountId = null, l.recoveryPublicKey = null, l.activeCredentialEvent = null, l.activeRecoveryEvent = null, l.everydayKeyDerived = !1, l.vault?.destroy(), l.vault = null, l.connectionVaultRoot && l.connectionVaultRoot.fill(0), l.connectionVaultRoot = null, l.vaultKnown = !1, l.signerOnly = !1, l.app = null, l.site = null, l.profile = null, l.remember = !1, l.grantAt = null, l.relays = [], l.family = null, l.more = [], l.pendingRecovery && (l.pendingRecovery.recoveryPrivateKey.fill(0), l.pendingRecovery.everydayPrivateKey.fill(0), l.pendingRecovery = null);
}
function to(e) {
  return V(), l.pendingRecovery = e, l.signer = new ae(e.everydayPrivateKey), l.everydayPrivateKey = e.everydayPrivateKey, l.accountId = e.accountId, l.recoveryPublicKey = e.recoveryPublicKey, l.activeRecoveryEvent = e.currentRecoveryEvent, l.everydayKeyDerived = e.everydayKeyDerived, Un(
    e.currentRecoveryPayload.connection_vault_root ? O(e.currentRecoveryPayload.connection_vault_root) : void 0
  ), {
    everydayPublicKey: e.everydayPublicKey,
    accountId: e.accountId,
    generalRelays: e.generalRelays,
    dmRelays: e.dmRelays,
    chainWarning: e.chainWarning,
    everydayKeyDerived: e.everydayKeyDerived
  };
}
function Un(e, t) {
  l.connectionVaultRoot = e ?? null, l.vaultKnown = !0, l.vault = null, t && P(t);
}
async function we() {
  if (!l.everydayPrivateKey || !l.accountId || !l.recoveryPublicKey || !l.activeCredentialEvent || !l.activeRecoveryEvent)
    return;
  const e = await fe(w);
  e && !C && (await tt(w), await qn());
  const t = {
    everydayPrivateKey: l.everydayPrivateKey,
    accountId: l.accountId,
    recoveryPublicKey: l.recoveryPublicKey,
    activeCredentialEvent: l.activeCredentialEvent,
    activeRecoveryEvent: l.activeRecoveryEvent,
    ...l.connectionVaultRoot ? { connectionVaultRoot: l.connectionVaultRoot } : {},
    ...l.vaultKnown ? { vaultEnabled: l.connectionVaultRoot !== null } : {},
    everydayKeyDerived: l.everydayKeyDerived
  }, n = e && C ? C : null;
  await _n(w, t, n);
  const r = _(l.everydayPrivateKey);
  await _n(w, t, n, F(r));
  const o = yl(await B(w), r, Date.now() / 1e3);
  for (const i of o.dropped) await H(w, F(i));
  await me(w, o.list), await Qi();
}
async function qn() {
  for (const e of await B(w)) await H(w, F(e.pubkey));
  await me(w, []);
}
async function no(e, t) {
  const n = l.everydayPrivateKey ? _(l.everydayPrivateKey) : "";
  let r = await B(w);
  for (const o of r) {
    if (o.pubkey === n) continue;
    const i = await Si(w, e, F(o.pubkey));
    i ? (await _n(w, i, t, F(o.pubkey)), i.everydayPrivateKey.fill(0), i.connectionVaultRoot?.fill(0)) : (await H(w, F(o.pubkey)), r = Nt(r, o.pubkey));
  }
  await me(w, r);
}
async function fn(e) {
  const t = await Si(w, C, e);
  return t ? (V(), l.signer = new ae(t.everydayPrivateKey), l.everydayPrivateKey = t.everydayPrivateKey, l.accountId = t.accountId, l.recoveryPublicKey = t.recoveryPublicKey, l.activeCredentialEvent = t.activeCredentialEvent, l.activeRecoveryEvent = t.activeRecoveryEvent, l.everydayKeyDerived = t.everydayKeyDerived ?? !1, l.connectionVaultRoot = t.connectionVaultRoot ?? null, l.vaultKnown = t.vaultEnabled !== void 0, await Qi(), {
    restored: !0,
    everydayPublicKey: l.signer.getPublicKey(),
    accountId: t.accountId,
    everydayKeyDerived: l.everydayKeyDerived
  }) : { restored: !1 };
}
async function Qi() {
  if (!l.signer) return;
  const e = l.signer.getPublicKey();
  await jl(w, { pubkey: e, npub: Qe(e) });
}
function ne() {
  try {
    return new URL(self.location.href).origin;
  } catch {
    return "";
  }
}
const pn = "bitlogin:held:v1:";
function Pt() {
  if (!vo(ne())) throw new Error("That is done at BitLogin's own address.");
}
function hn(e) {
  if (e === void 0) return ne();
  const t = Pe(e);
  if (!t || !vo(ne())) throw new Error("A wallet connection is for this site only.");
  return t;
}
function $n() {
  if (!l.signer) throw new Error("No identity is unlocked in this session.");
  if (!l.connectionVaultRoot)
    throw new Error(
      l.vaultKnown ? "This account predates the Connection Vault. Enable it from your BitLogin account manager (recovery phrase required)." : "Sign in again to use wallet connections on this device."
    );
  return l.vault ??= new Yc(l.connectionVaultRoot.slice()), l.vault;
}
function Je(e) {
  const { record: t } = e, n = {
    connectionId: t.connection_id,
    connectionType: t.connection_type,
    label: t.label,
    state: t.state,
    origin: t.application_binding.origin,
    createdAt: t.created_at,
    updatedAt: t.updated_at
  };
  if (t.connection_type === "nwc" && t.state !== "deleted") {
    const r = t.credential;
    n.walletPubkey = r.wallet_pubkey, n.relayCount = r.relays?.length;
  }
  return n;
}
async function Tt() {
  const e = $n(), t = await e.listConnections({ relayUrls: A, store: w });
  return {
    vault: e,
    connections: t.connections.filter((n) => n.record.state !== "deleted"),
    rollbackWarnings: t.rollbackWarnings,
    unreadable: t.unreadable,
    truncated: t.truncated,
    quorumMet: t.quorumMet
  };
}
async function vn(e) {
  const { vault: t, connections: n } = await Tt(), r = n.find((o) => o.record.connection_id === e);
  if (!r) throw new Error("That connection no longer exists.");
  return { vault: t, connection: r };
}
let ke = null, z = null;
function ro(e) {
  self.postMessage({ notify: "nip46-auth-url", url: e });
}
function Ge() {
  if (!ke) throw new Error("No remote signer is connected.");
  return ke;
}
function St() {
  z && (z.abort.abort(), P(z.clientSecretKey), z = null);
}
function Yi(e) {
  const t = e.buildLogoutEvent();
  e.close(), t && e.publishCourtesy(t);
}
function oo(e, t) {
  ke && Yi(ke.client), ke = { client: e, userPubkey: t };
}
async function Yl(e, t) {
  if (l.signerOnly && !_l.has(e))
    throw new Error("This session can only sign. Sign in at your own BitLogin page for anything else.");
  switch (C && e !== "configure" && Date.now() - dn > J.idleSec * 1e3 && je(), Hl.has(e) || (dn = Date.now()), e) {
    // ---- The optional lock (lock.ts) ----
    case "lockStatus":
      return Re();
    // Turn it on, or change the PIN. Only with a full session unlocked: the key that is sealed is the one in hand.
    case "lockEnable": {
      if (K(), await fe(w) && !C) throw new Error("Unlock first.");
      const n = await vl(w, t.pin, C ?? void 0);
      return await no(C, n), C && P(C), C = n, await we(), Re();
    }
    case "lockSetDevice": {
      if (K(), !C) throw new Error("Turn the lock on first.");
      const n = t, r = O(String(n.prfOutput));
      try {
        await wl(w, C, String(n.credentialId), r);
      } finally {
        P(r);
      }
      return Re();
    }
    case "lockRemoveDevice": {
      if (K(), !C) throw new Error("Turn the lock on first.");
      return await gl(w), Re();
    }
    case "lockDisable": {
      if (K(), await fe(w) && !C) throw new Error("Unlock first.");
      return await no(C, null), await tt(w), C && P(C), C = null, await we(), Re();
    }
    case "lockNow": {
      if (!C) throw new Error("The lock is not on.");
      return je(), Re();
    }
    // Open it, with the PIN or with the device. A wrong try is counted; one too many removes the lock and the
    // cached session with it, and the user signs in again the ordinary way.
    case "lockOpen": {
      const n = t;
      let r;
      if (typeof n.prfOutput == "string") {
        const o = O(n.prfOutput);
        try {
          r = await bl(w, o);
        } finally {
          P(o);
        }
      } else
        r = await ml(w, n.pin);
      if (r.ok) {
        C && P(C), C = r.lockKey, dn = Date.now();
        const o = await fn();
        if (o.restored) return { ok: !0, left: J.tries, removed: !1, ...o };
        if (await Ct(w) === "none" && (await B(w)).length > 0) return { ok: !0, left: J.tries, removed: !1, restored: !1 };
        await tt(w), je(), r = { ok: !1, left: 0, removed: !0 };
      }
      return r.removed && (je(), await qn(), await Gr(w), await Be(w)), { ok: !1, left: r.left, removed: r.removed, restored: !1 };
    }
    // ---- Signer hand-off (docs/sign-in-window.md) ----
    // The receiving side, first: a throwaway key for the hand-off to be sealed to.
    case "handoffBegin":
      return he && P(he), he = Fe(), { recipientPublicKey: _(he) };
    // The sending side: this worker has the session, and seals the everyday
    // key (only that) to the receiving worker's throwaway key.
    case "handoffExport": {
      const { everydayPrivateKey: n } = K(), r = Fe(), o = t;
      try {
        return Kl(n, o.recipientPublicKey, r, o.app, {
          ...o.site !== void 0 ? { site: o.site } : {},
          // Only a site that declared nothing is told who they are. An application is held to what it asked,
          // though the window may have read the profile to show the user which account this is.
          ...l.profile && !o.app ? { profile: l.profile } : {},
          ...o.remember === !0 ? { remember: !0 } : {},
          ...o.family !== void 0 ? { family: o.family } : {},
          ...o.more !== void 0 ? { more: o.more } : {},
          // With the lock on, nothing is kept for any site: a key at rest in a site's storage would be a key
          // the lock does not cover. Every site is allowed for the visit, and asks at the sign-in address again.
          ...C ? { visitOnly: !0 } : {},
          // When it was allowed, by this worker's clock, and where the user writes: what a signer needs to
          // find out later whether the site was taken back (docs/take-back.md).
          at: Date.now() / 1e3,
          relays: l.relays
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
      const { everydayPrivateKey: n } = K();
      if (!l.signerOnly) throw new Error("Only a signer-only session can be remembered for a site.");
      const r = t, o = Date.now() / 1e3;
      if (!l.remember) return { kept: !1 };
      if (l.app && l.app.site !== r.site || l.site && l.site !== r.site) throw new Error("This hand-off was for another site.");
      if (l.family) {
        if (!Ne(r.site, l.family)) throw new Error("This hand-off was for another site.");
        await _t(w, r.site);
      }
      return {
        kept: await cn(
          w,
          {
            site: l.family ?? r.site,
            everydayPrivateKey: n,
            until: r.until,
            ...r.name ? { name: r.name } : {},
            ...l.profile ? { profile: l.profile } : {},
            at: l.grantAt ?? Math.floor(o),
            ...l.relays.length ? { relays: l.relays } : {},
            signed: [],
            ...!l.app && !l.family && l.more.length ? { more: de(l.more) } : {},
            ...l.app ? { permissions: l.app.permissions, signedSensitive: [] } : {}
          },
          o
        )
      };
    }
    // The site's page was loaded again: what was kept for that site, if it is still in date, becomes a
    // signer-only session. It touches nothing a full session uses.
    case "signerRestore": {
      const n = t, r = await Et(w, n.site, Date.now() / 1e3), o = !r && n.family !== void 0 && Q(n.family) && Ne(n.site, n.family) ? n.family : null, i = r ?? (o ? await Et(w, o, Date.now() / 1e3) : null);
      return !i || o && i.site !== o ? { restored: !1 } : (V(), l.signer = new ae(i.everydayPrivateKey), l.everydayPrivateKey = i.everydayPrivateKey, l.signerOnly = !0, l.app = i.permissions ? { site: i.site, permissions: i.permissions } : null, l.site = o ? n.site : i.site, l.family = o, l.profile = i.profile ?? null, l.remember = !0, l.grantAt = an(i), l.relays = i.relays ?? [], l.more = o ? [] : i.more ?? [], {
        restored: !0,
        everydayPublicKey: l.signer.getPublicKey(),
        until: i.until,
        ...i.name ? { name: i.name } : {},
        ...i.profile ? { profile: i.profile } : {},
        signed: i.signed,
        ...i.signedPass ? { signedPass: i.signedPass } : {},
        check: Mr(Date.now() / 1e3, an(i), i.checkedAt ?? 0),
        ...o ? { family: o } : {},
        ...l.more.length ? { more: de(l.more) } : {},
        ...i.permissions ? { permissions: i.permissions, signedSensitive: i.signedSensitive ?? [] } : {}
      });
    }
    // Count a signature against the site, where reloading the page can't lose the count.
    case "signerTouch": {
      const { everydayPrivateKey: n } = K();
      if (!l.signerOnly) throw new Error("Only a signer-only session is counted for a site.");
      const r = t, o = Date.now() / 1e3, i = await Et(w, l.family && Ne(r.site, l.family) ? l.family : r.site, o);
      return i && _(i.everydayPrivateKey) === _(n) && await cn(
        w,
        { ...i, signed: Array.isArray(r.signed) ? r.signed : [], ...Array.isArray(r.signedPass) ? { signedPass: r.signedPass } : {}, ...i.permissions ? { signedSensitive: Array.isArray(r.signedSensitive) ? r.signedSensitive : [] } : {} },
        o
      ), {};
    }
    // Signing out of a site that was allowed as one of a family signs out of the family: otherwise its next page
    // load would take the family's grant up again, and the sign-out would not have happened (SF6).
    case "signerForget": {
      const n = t.site;
      await _t(w, n), l.family && Ne(n, l.family) && await _t(w, l.family), await w.delete(pn + n).catch(() => {
      });
      for (const r of ["save", "follow", "seal", "unwrap", "reach", "score", "achieve"])
        xn.delete(`${Dn}${r}:${n}`), await w.delete(`${Dn}${r}:${n}`).catch(() => {
        });
      return {};
    }
    // The receipts BitLogin's own page handed a site's signer (docs/paying.md): the person's, for that site's own
    // listings. Kept beside the site's grant, so a page loaded again still knows what its visitor holds (owner,
    // 2026-11-21). They are signed notes and no secret; each is checked again where it is used. A signer-only
    // session only, and only for the site its hand-off was sealed for.
    case "signerHold":
    case "signerHeld": {
      const { signer: n } = K();
      if (!l.signerOnly) throw new Error("Only a site's signer holds receipts for it.");
      const r = Pe(t.site);
      if (!r) throw new Error("That is not a site.");
      if (l.app && l.app.site !== r || l.site && l.site !== r) throw new Error("That is another site's.");
      const o = n.getPublicKey();
      if (e === "signerHold") {
        const i = t.receipts, s = (Array.isArray(i) ? i.slice(0, Or) : []).filter((a) => !!a && typeof a == "object" && a.kind === 30078 && typeof a.content == "string" && a.content.length <= 8e3 && R(a));
        return await w.set(pn + r, JSON.stringify({ pubkey: o, receipts: s })), {};
      }
      try {
        const i = JSON.parse(await w.get(pn + r) ?? "null");
        return { receipts: i?.pubkey === o && Array.isArray(i.receipts) ? i.receipts.slice(0, Or) : [] };
      } catch {
        return { receipts: [] };
      }
    }
    case "handoffAccept": {
      if (!he) throw new Error("No hand-off was begun here.");
      const n = he;
      he = null;
      let r;
      try {
        r = Al(t, n);
      } finally {
        P(n);
      }
      return V(), l.signer = new ae(r.key), l.everydayPrivateKey = r.key, l.signerOnly = !0, l.app = r.app, l.site = r.site, l.profile = r.profile, l.remember = r.remember, l.grantAt = r.at, l.relays = r.relays, l.family = r.family, l.more = r.more, {
        everydayPublicKey: l.signer.getPublicKey(),
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
      const { signer: n } = K(), r = n.getPublicKey(), o = t.profile !== !1, i = [.../* @__PURE__ */ new Set([...I, ...A])].slice(0, 8);
      if (i.length === 0) return {};
      const s = new E(i);
      try {
        const [a, c] = await Promise.all([
          o ? s.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 4e3) : Promise.resolve(null),
          s.queryQuorum({ kinds: [Ke], authors: [r], limit: 2 }, 4e3)
        ]);
        if (l.signer !== n) return {};
        l.profile = a ? Hr(a.outcomes.flatMap((u) => u.events), r) : null, l.profile && !l.signerOnly && await me(w, fl(await B(w), r, l.profile)), l.relays = Se(c.outcomes.flatMap((u) => u.events), r);
      } finally {
        s.closeAll();
      }
      return { ...l.profile ? { profile: l.profile } : {}, relays: l.relays };
    }
    // ---- Taking a site back (docs/take-back.md) ----
    // At the sign-in address, with a full session: publish the record that says a site, or every site, is taken
    // back as of now. It carries everything an earlier record said, from the relays and from this browser's own
    // copy, so a record built here can never give a site back.
    case "takeBack": {
      const { signer: n } = K(), r = t, o = n.getPublicKey(), i = Date.now() / 1e3, s = r.all === !0 ? { all: !0 } : { site: String(r.site ?? "") }, a = new E([.../* @__PURE__ */ new Set([...I, ...A])].slice(0, 8));
      let c;
      try {
        c = Se((await a.queryQuorum({ kinds: [Ke], authors: [o], limit: 2 }, 4e3)).outcomes.flatMap((y) => y.events), o);
      } finally {
        a.closeAll();
      }
      const u = [.../* @__PURE__ */ new Set([...c, ...A])].slice(0, 16), d = new E(u);
      try {
        const y = await d.queryQuorum({ kinds: [nn], authors: [o], "#d": [tn], limit: 2 }, 5e3);
        if (y.respondedCount === 0) return { ok: !1, accepted: 0, of: u.length };
        const f = Nr(y.outcomes.flatMap((b) => b.events), o, i), p = f ? eo(n, f.content) : null, v = await zl(o), h = ws(gs(p ?? gn, v, i), s, i), g = n.signEvent({
          kind: nn,
          // Later than the one it replaces, whatever the two clocks say.
          created_at: Math.max(Math.floor(i), (f?.created_at ?? 0) + 1),
          tags: [["d", tn]],
          content: n.nip44Encrypt(o, Tr(h))
        }), m = x(await d.publishAll(g, 6e3)), k = m >= Math.min(2, u.length);
        return k && await w.set(zi + o, Tr(h)).catch(() => {
        }), { ok: k, accepted: m, of: u.length };
      } finally {
        d.closeAll();
      }
    }
    // In the embedded signer, for a kept grant: ask the user's relays whether this site was taken back. Asked at
    // most once a day. It can end the grant or leave it be, and nothing else.
    case "signerCheck": {
      const { signer: n } = K();
      if (!l.signerOnly || !l.site) return { state: "ok" };
      const r = l.family ?? l.site, o = Date.now() / 1e3, i = await Et(w, r, o);
      if (!i) return { state: "ok" };
      const s = n.getPublicKey(), a = an(i), c = Mr(o, a, i.checkedAt ?? 0);
      if (c === "fresh") return { state: "ok" };
      const u = [.../* @__PURE__ */ new Set([...Y(i.relays), ...A])].slice(0, 12), d = new E(u);
      let y, f;
      try {
        [y, f] = await Promise.all([
          d.queryQuorum({ kinds: [nn], authors: [s], "#d": [tn], limit: 2 }, 5e3),
          d.queryQuorum({ kinds: [Ke], authors: [s], limit: 2 }, 5e3)
        ]);
      } finally {
        d.closeAll();
      }
      if (l.signer !== n) return { state: "ok" };
      const p = Nr(y.outcomes.flatMap((m) => m.events), s, o), v = p ? eo(n, p.content) : null;
      if (v && ms(v, r, a))
        return await _t(w, r), V(), { state: "ended" };
      if (!bs({
        asked: u.length,
        answered: y.respondedCount,
        seenAt: i.seenAt ?? 0,
        newestAt: p ? p.created_at : null,
        readable: v !== null
      })) return { state: c === "overdue" ? "stale" : "ok" };
      const g = Se(f.outcomes.flatMap((m) => m.events), s);
      return await cn(
        w,
        {
          ...i,
          checkedAt: Math.floor(o),
          seenAt: Math.max(i.seenAt ?? 0, v && p ? p.created_at : 0),
          ...g.length ? { relays: g } : {}
        },
        o
      ), g.length && (l.relays = g), { state: "ok" };
    }
    // A room pass (NSWP kind 27300) for the site this session serves, and for no other. The site, the time, how
    // long it lasts and the profile are all this worker's own: what is asked for is a session public key. Not
    // for an application: an application is held to the set the user read, and a pass is not in one.
    case "roomPass": {
      const { signer: n } = K();
      if (!l.signerOnly || l.app || !l.site) throw new Error("refused");
      const r = ll({
        session: t.session,
        site: l.site,
        identity: n.getPublicKey(),
        nowSeconds: Date.now() / 1e3,
        profile: l.profile
      });
      if (!r) throw new Error("refused");
      return n.signEvent(r);
    }
    // ---- What a world keeps for its visitor (NSWP-12; embedded/saves.ts). The world is never taken from what is
    // asked: it is the site this session serves, as the browser gave it to the signer's page.
    case "worldSave": {
      const { signer: n, everydayPrivateKey: r, site: o } = G(), i = t, s = be(r, n.getPublicKey());
      try {
        const a = Ds({ conversationKey: s, world: o, slot: i.slot, data: i.data, nowSeconds: Date.now() / 1e3 });
        if (!a || !await ve("save", o, xs)) throw new Error("refused");
        return n.signEvent(a);
      } finally {
        P(s);
      }
    }
    case "worldFind": {
      const { signer: n, everydayPrivateKey: r, site: o } = G(), i = be(r, n.getPublicKey());
      try {
        const s = Ls(i, o, t.slot);
        if (!s) throw new Error("refused");
        return { d: s };
      } finally {
        P(i);
      }
    }
    case "worldOpen": {
      const { signer: n, everydayPrivateKey: r, site: o } = G(), i = t.event;
      if (!R(i)) throw new Error("refused");
      const s = be(r, n.getPublicKey());
      try {
        const a = Os(i, { conversationKey: s, pubkey: n.getPublicKey(), world: o });
        if (!a) throw new Error("refused");
        return a;
      } finally {
        P(s);
      }
    }
    // ---- Following from inside a world (NSWP-14; embedded/follows.ts). Only for a world the user let do this, by
    // name, in the window. The world hands over their newest follow list and one change; what is signed is that
    // list with that change and nothing else. A follow list replaces the last, so before a world's word is
    // believed this worker looks at the user's own relays itself: a world that is behind, or that says there is
    // no list where one merely couldn't be reached, is refused.
    case "worldFollow": {
      const { signer: n, site: r } = G();
      if (!l.more.includes("follows")) throw new Error("refused");
      const o = t, i = n.getPublicKey(), s = o.list === null ? null : Ir(o.list, i);
      if (o.list !== null && !s) throw new Error("refused");
      const a = Ql + i;
      let c = 0;
      try {
        const v = Number(await w.get(a));
        Number.isSafeInteger(v) && v > 0 && (c = v);
      } catch {
      }
      const u = [.../* @__PURE__ */ new Set([...Y(l.relays), ...I, ...A])].slice(0, 8);
      let d = 0, y = 0;
      if (u.length) {
        const v = new E(u);
        try {
          const h = await v.queryQuorum({ kinds: [We], authors: [i], limit: 2 }, 3500);
          d = h.respondedCount;
          for (const g of h.outcomes.flatMap((m) => m.events))
            g.created_at > y && Ir(g, i) && (y = g.created_at);
        } catch {
        } finally {
          v.closeAll();
        }
      }
      if (l.signer !== n || !l.more.includes("follows")) throw new Error("refused");
      if (c = Math.max(c, y), c && await w.set(a, String(c)).catch(() => {
      }), !Ms(s, { answered: d, newestAt: y })) throw new Error("refused");
      const f = Is({ list: s, ...o.add !== void 0 ? { add: o.add } : {}, ...o.remove !== void 0 ? { remove: o.remove } : {}, pubkey: i, nowSeconds: Date.now() / 1e3, seen: c });
      if (!f || !await ve("follow", r, Js)) throw new Error("refused");
      const p = n.signEvent(f);
      return await w.set(a, String(Math.max(c, p.created_at))).catch(() => {
      }), p;
    }
    // ---- A score on one of a world's boards (NSWP-15; embedded/scores.ts). For any world its visitor allowed: it
    // is less than a note. The world names its coordinate, a board and a number; the note and the mark that says
    // which site asked are this worker's own.
    case "worldScore": {
      const { signer: n, site: r } = G(), o = t, i = Ts({ world: o.world, board: o.board, score: o.score, title: o.title, format: o.format, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await ve("score", r, js)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- An achievement held in a world (NSWP-16; embedded/achievements.ts). As a score: for any world its visitor
    // allowed, built here from three plain fields, and marked with the site this session serves.
    case "worldAchieve": {
      const { signer: n, site: r } = G(), o = t, i = Ns({ world: o.world, id: o.achievement, title: o.title, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await ve("achieve", r, Bs)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- Private messages from inside a world (NSWP-14; embedded/messages.ts). Only for a world the user let do
    // this, by name, in the window. The world names a reader and the words, or hands over a wrap; it is never given
    // a key, and nothing else is encrypted or decrypted for it.
    case "worldSeal": {
      const { signer: n, site: r } = G();
      if (!l.more.includes("messages")) throw new Error("refused");
      const o = t, i = Cs(n, { to: o.to, text: o.text, nowSeconds: Date.now() / 1e3 });
      if (!i || !await ve("seal", r, Ws)) throw new Error("refused");
      return i;
    }
    case "worldUnwrap": {
      const { signer: n, site: r } = G();
      if (!l.more.includes("messages")) throw new Error("refused");
      if (!await ve("unwrap", r, Fs, !1)) throw new Error("refused");
      const o = Rs(n, t.event);
      if (!o) throw new Error("refused");
      return { message: o };
    }
    case "worldReach": {
      const { signer: n, site: r } = G();
      if (!l.more.includes("messages")) throw new Error("refused");
      const o = As(t.relays, Date.now() / 1e3);
      if (!o || !await ve("reach", r, Vs)) throw new Error("refused");
      return n.signEvent(o);
    }
    // ---- What an approved application may ask beyond signing (§SW9.5). Refused without a permission set.
    case "appEncrypt": {
      const { signer: n } = K(), r = yn(), o = t, i = n.getPublicKey(), s = r.permissions.sign.some((a) => Ss.includes(a));
      if (!Ks(r.permissions, i, o.peerPublicKey) && !(s && /^[0-9a-f]{64}$/u.test(String(o.peerPublicKey))))
        throw new Error("refused");
      if (typeof o.text != "string" || o.text.length > 1e5) throw new Error("refused");
      return { text: o.scheme === "nip04" ? n.nip04Encrypt(o.peerPublicKey, o.text) : n.nip44Encrypt(o.peerPublicKey, o.text) };
    }
    case "appDecrypt": {
      const { signer: n } = K(), r = yn(), o = t;
      if (!Ps(r.permissions, o.peerPublicKey) || typeof o.text != "string") throw new Error("refused");
      return { text: o.scheme === "nip04" ? n.nip04Decrypt(o.peerPublicKey, o.text) : n.nip44Decrypt(o.peerPublicKey, o.text) };
    }
    case "appDecryptEvent": {
      const { signer: n } = K(), r = yn(), o = t.event;
      if (!R(o)) throw new Error("refused");
      const i = _s(r.permissions, n.getPublicKey(), o), s = o.kind === 4 || /\?iv=[A-Za-z0-9+/=]+$/u.test(o.content);
      for (const a of i)
        try {
          return { text: s ? n.nip04Decrypt(a, o.content) : n.nip44Decrypt(a, o.content) };
        } catch {
        }
      throw new Error("refused");
    }
    case "nip46Connect": {
      const r = ka(t.uri), o = new Ur({
        clientSecretKey: Fe(),
        pointer: r,
        onAuthUrl: ro
      });
      try {
        await o.connect();
        const i = await o.getUserPublicKey();
        return oo(o, i), St(), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46NostrconnectStart": {
      const n = t, r = A.slice(0, 2);
      St();
      const o = Fe(), i = Ie(D(16));
      return z = { clientSecretKey: o, relayUrls: r, secret: i, abort: new AbortController() }, { uri: Ea({
        clientPubkey: _(o),
        relayUrls: r,
        secret: i,
        name: n.appName?.trim() || "BitLogin",
        perms: ["sign_event", "nip44_encrypt", "nip44_decrypt", "nip04_encrypt", "nip04_decrypt"]
      }) };
    }
    case "nip46NostrconnectAwait": {
      const n = z;
      if (!n) throw new Error("No signer-connection attempt is in progress.");
      let r;
      try {
        ({ signerPubkey: r } = await Pa({
          clientSecretKey: n.clientSecretKey,
          relayUrls: n.relayUrls,
          secret: n.secret,
          timeoutMs: 18e4,
          signal: n.abort.signal
        }));
      } catch (i) {
        throw z === n && St(), i;
      }
      if (z !== n) throw new Error("This signer-connection attempt was superseded.");
      z = null;
      const o = new Ur({
        clientSecretKey: n.clientSecretKey,
        pointer: { signerPubkey: r, relayUrls: n.relayUrls },
        onAuthUrl: ro
      });
      try {
        const i = await o.getUserPublicKey();
        return oo(o, i), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46SignEvent": {
      const n = t;
      return Ge().client.signEvent({
        kind: n.kind,
        content: n.content,
        tags: n.tags ?? [],
        created_at: n.created_at ?? Math.floor(Date.now() / 1e3)
      });
    }
    case "nip46Nip44Encrypt": {
      const n = t;
      return { ciphertext: await Ge().client.nip44Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip44Decrypt": {
      const n = t;
      return { plaintext: await Ge().client.nip44Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Nip04Encrypt": {
      const n = t;
      return { ciphertext: await Ge().client.nip04Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip04Decrypt": {
      const n = t;
      return { plaintext: await Ge().client.nip04Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Disconnect": {
      const n = ke;
      return ke = null, St(), n && Yi(n.client), {};
    }
    case "configure": {
      const n = t;
      return On = !!n.vaultRelayUrls?.length, Ln = !!n.discoveryRelayUrls?.length, n.vaultRelayUrls?.length && (A = n.vaultRelayUrls), n.discoveryRelayUrls?.length && (I = n.discoveryRelayUrls), Zr(At(await Ko(w))), (!On || !Ln) && ya(w).then(Zr, () => {
      }), {};
    }
    case "register": {
      const n = t, r = n.importKey ? await _c({ nsecOrHex: n.importKey, loginName: n.loginName, password: n.password, vaultRelayUrls: A }) : await ni({ loginName: n.loginName, password: n.password, vaultRelayUrls: A });
      return V(), l.signer = new ae(r.everydayPrivateKey), l.everydayPrivateKey = r.everydayPrivateKey, l.accountId = r.accountId, l.recoveryPublicKey = r.recoveryPublicKey, l.activeCredentialEvent = r.credentialEvent, l.activeRecoveryEvent = r.recoveryEvent, l.everydayKeyDerived = r.everydayKeyDerived, Un(r.connectionVaultRoot, r.vaultSudoKey), await we(), {
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
      const r = ri(t.nsecOrHex), o = _(r), i = { everydayPublicKey: o, npub: Qe(o) };
      return r.fill(0), i;
    }
    case "login": {
      const n = t, r = await Pc({
        loginName: n.loginName,
        password: n.password,
        vaultRelayUrls: A,
        store: w,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return V(), l.signer = new ae(r.everydayPrivateKey), l.everydayPrivateKey = r.everydayPrivateKey, l.accountId = r.accountId, l.recoveryPublicKey = r.recoveryPublicKey, l.activeCredentialEvent = r.credentialEvent, l.activeRecoveryEvent = r.recoveryCapsuleEvent, l.everydayKeyDerived = r.everydayKeyDerived, Un(r.connectionVaultRoot, r.vaultSudoKey), await we(), !r.rollbackWarning && !r.relayDisagreementWarning && Vr({
        relayUrls: A,
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
      const n = t, r = await Sc({
        phrase: n.phrase,
        vaultRelayUrls: A,
        discoveryRelayUrls: I,
        offlineRecoveryCapsuleEvents: n.offlineExportFile?.recovery_capsule_events
      });
      return to(r);
    }
    case "previewPhraseRebuild": {
      const r = await Kc({ phrase: t.phrase, vaultRelayUrls: A, discoveryRelayUrls: I });
      return { ...r, npub: Qe(r.everydayPublicKey) };
    }
    case "rebuildFromPhrase": {
      const r = await Ac({ phrase: t.phrase, vaultRelayUrls: A, discoveryRelayUrls: I });
      return to(r);
    }
    case "completeRecovery": {
      const n = t;
      if (!l.pendingRecovery) throw new Error("No recovery is in progress in this session.");
      const r = await Rc({
        recovered: l.pendingRecovery,
        newLoginName: n.newLoginName,
        newPassword: n.newPassword,
        vaultRelayUrls: A,
        store: w
      });
      return l.activeCredentialEvent = r.credentialEvent, l.activeRecoveryEvent = r.refreshedRecoveryEvent, l.pendingRecovery.recoveryPrivateKey.fill(0), l.pendingRecovery = null, await we(), {
        locatorPublicKey: r.locatorPublicKey,
        credentialEventId: r.credentialEvent.id,
        refreshedRecoveryEventId: r.refreshedRecoveryEvent.id
      };
    }
    case "changePassword": {
      const n = t, r = await Cc({
        loginName: n.loginName,
        oldPassword: n.oldPassword,
        newPassword: n.newPassword,
        vaultRelayUrls: A,
        store: w,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return l.activeCredentialEvent = r.newCredentialEvent, l.recoveryPublicKey = r.recoveryPublicKey, l.activeRecoveryEvent = r.recoveryCapsuleEvent, await we(), {
        newLocatorPublicKey: r.newLocatorPublicKey,
        newGeneration: r.newGeneration,
        tombstoneAcknowledgedCount: r.tombstoneAcknowledgedCount,
        deletionAcknowledgedCount: r.deletionAcknowledgedCount
      };
    }
    case "publishProfileAndRelayLists": {
      const n = t, { everydayPrivateKey: r } = K();
      return ac({
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
      const { signer: n } = K();
      return { publicKey: n.getPublicKey() };
    }
    case "signEvent": {
      const { signer: n } = K(), r = t;
      if (l.signerOnly) {
        if (l.app) {
          const o = qs(l.app.permissions, r, l.app.site, Date.now() / 1e3);
          if (!o) throw new Error("refused");
          return n.signEvent(o);
        }
        if ($s(r.kind) !== "ordinary") throw new Error("refused");
      }
      return n.signEvent({ kind: r.kind, tags: r.tags, content: r.content, created_at: r.created_at });
    }
    case "nip44Encrypt": {
      const { signer: n } = K(), r = t;
      return { ciphertext: n.nip44Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip44Decrypt": {
      const { signer: n } = K(), r = t;
      return { plaintext: n.nip44Decrypt(r.peerPublicKey, r.payload) };
    }
    case "nip04Encrypt": {
      const { signer: n } = K(), r = t;
      return { ciphertext: n.nip04Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip04Decrypt": {
      const { signer: n } = K(), r = t;
      return { plaintext: n.nip04Decrypt(r.peerPublicKey, r.payload) };
    }
    case "exportIdentity": {
      const { everydayPrivateKey: n, signer: r } = K();
      return { nsec: ns(n), npub: Qe(r.getPublicKey()) };
    }
    case "buildRecoveryExport": {
      if (K(), !l.recoveryPublicKey || !l.activeRecoveryEvent)
        throw new Error("No recovery capsule is known in this session yet.");
      return rs({
        recoveryPublicKeyHex: l.recoveryPublicKey,
        vaultRelayUrls: A,
        recoveryCapsuleEvents: [l.activeRecoveryEvent],
        relayListEvents: []
      });
    }
    case "repairReplicas": {
      if (!l.activeCredentialEvent || !l.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Vr({
        relayUrls: A,
        credentialEvent: l.activeCredentialEvent,
        recoveryEvent: l.activeRecoveryEvent
      });
    }
    case "checkReplicaHealth": {
      if (!l.activeCredentialEvent || !l.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return bc({
        relayUrls: A,
        credentialEvent: l.activeCredentialEvent,
        recoveryEvent: l.activeRecoveryEvent
      });
    }
    case "getSessionStatus":
      return { unlocked: !!l.signer, everydayPublicKey: l.signer?.getPublicKey(), signerOnly: l.signerOnly };
    // Called once, right after "configure", before the widget renders its welcome
    // screen -- restores whatever persistSession() last cached for this origin, so
    // a page reload doesn't ask for the login name + password again. A missing or
    // corrupt cache is not an error: it just means the widget falls through to its
    // normal welcome screen, exactly like it always has.
    case "restoreSession":
      return !C && await Ct(w) === "locked" ? { restored: !1, locked: !0 } : fn();
    // Log out: this account is forgotten on this device. Other accounts kept here stay, and so does the lock
    // they are sealed under; with none left, everything goes as it always did.
    case "logout": {
      const n = l.everydayPrivateKey && !l.signerOnly ? _(l.everydayPrivateKey) : "", r = Nt(await B(w), n);
      return n && await H(w, F(n)), r.length > 0 && n ? (await me(w, r), V(), await H(w), await Be(w), {}) : (je(), await tt(w), await qn(), await Gr(w), await Be(w), {});
    }
    // ---- Several accounts on one device (docs/account-switching.md) ----
    // Who is kept here, and which of them is signed in. Public keys and what their own profiles call them.
    case "accountsList": {
      const n = l.everydayPrivateKey && !l.signerOnly ? _(l.everydayPrivateKey) : "";
      return { accounts: (await B(w)).map((r) => ({ ...r, active: r.pubkey === n })) };
    }
    // Switch to a kept account: its own slot is opened, on this device, with no password and no relay. With the
    // lock on and locked, it says so, and nothing changes.
    case "accountsSwitch": {
      if (l.signerOnly) throw new Error("A signer-only session cannot switch accounts.");
      const n = String(t.pubkey ?? ""), r = await B(w);
      if (!r.some((i) => i.pubkey === n)) return { restored: !1 };
      if (!C && await Ct(w, F(n)) === "locked") return { restored: !1, locked: !0 };
      const o = await fn(F(n));
      return !o.restored || o.everydayPublicKey !== n ? (V(), await H(w, F(n)), await me(w, Nt(r, n)), await H(w), await Be(w), { restored: !1 }) : (await we(), o);
    }
    // Make room to sign in as another account: nobody is signed in, and everyone kept stays kept.
    case "accountsAdd": {
      if (l.signerOnly) throw new Error("A signer-only session cannot add accounts.");
      return V(), await H(w), await Be(w), {};
    }
    // Forget one kept account that is not the one signed in. (For that one: log out.)
    case "accountsRemove": {
      const n = String(t.pubkey ?? ""), r = l.everydayPrivateKey && !l.signerOnly ? _(l.everydayPrivateKey) : "";
      if (n === r) throw new Error("Log out to remove the account that is signed in.");
      return await H(w, F(n)), await me(w, Nt(await B(w), n)), {};
    }
    // ---- Connection Vault (connection-vault.md §12, reveal mode) ----
    // ---- An ecash wallet kept with the account (docs/ecash.md). A full session only: none of these is on the list a
    // handed-over session may ask, so no embedded signer, and so no site, can read a token.
    // ---- A person's files (docs/files.md). A full session only: none of these is on the list a handed-over
    // session may ask, so no embedded signer, and so no site, can read the index or have a permission note signed.
    case "blossomAuth": {
      const { signer: n } = K();
      return { token: ql(n, t) };
    }
    case "driveLoad":
    case "driveSave":
    case "blossomServers":
    case "blossomSetServers": {
      const { signer: n } = K(), r = n.getPublicKey(), o = [.../* @__PURE__ */ new Set([...I, ...A])].slice(0, 8);
      let i = l.relays;
      if (i.length === 0 && o.length) {
        const a = new E(o);
        try {
          i = Se((await a.queryQuorum({ kinds: [Ke], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((c) => c.events), r);
        } catch {
          i = [];
        } finally {
          a.closeAll();
        }
      }
      const s = new E([.../* @__PURE__ */ new Set([...i, ...A, ...e.startsWith("blossom") ? I : []])].slice(0, 16));
      try {
        const a = { signer: n, store: w, relays: s };
        if (e === "driveLoad") return await xl(a);
        if (e === "driveSave") return await Ul(a, t);
        const c = async () => {
          const g = (await s.queryQuorum({ kinds: [ze], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((m) => m.events).filter((m) => m.kind === ze && m.pubkey === r && R(m)).sort((m, k) => k.created_at - m.created_at)[0];
          return g ? ji(g) : [];
        };
        if (e === "blossomSetServers") {
          const h = [...new Set((t.servers ?? []).map(tr).filter(Boolean))].slice(0, er.servers);
          if (h.length === 0) throw new Error("Name at least one file server, by its https address.");
          const g = n.signEvent({ kind: ze, created_at: Math.floor(Date.now() / 1e3), tags: h.map((m) => ["server", m]), content: "" });
          if (x(await s.publishAll(g, 6e3)) < Math.min(2, s.relayUrls.length)) throw new Error("No relay took your server list. Try again when you are online.");
          return { mine: h };
        }
        const [u, d, y] = await Promise.all([
          c(),
          s.queryQuorum({ kinds: [ze], limit: 500 }, 5e3),
          s.queryQuorum({ kinds: [We], authors: [r], limit: 2 }, 4e3)
        ]), f = y.outcomes.flatMap((h) => h.events).filter((h) => h.pubkey === r && h.kind === We && R(h)).sort((h, g) => g.created_at - h.created_at)[0], p = new Set((f?.tags ?? []).filter((h) => h[0] === "p" && typeof h[1] == "string").map((h) => h[1])), v = new Map(d.outcomes.flatMap((h) => h.events).filter((h) => h.pubkey !== r && R(h)).map((h) => [h.id, h]));
        return { mine: u, ranked: $l([...v.values()], p) };
      } finally {
        s.closeAll();
      }
    }
    // ---- Paying, and buying (docs/paying.md). A full session at one of BitLogin's own sign-in addresses only: none
    // of these is on the list a handed-over session may ask, so no embedded signer, and so no site, can have a
    // buyer's permission note signed or read what a person bought.
    // Whom a tip is for: the name and the lightning address in that person's own signed profile. Read-only.
    case "payProfile": {
      K(), Pt();
      const n = t.pubkey;
      if (typeof n != "string" || !/^[0-9a-f]{64}$/u.test(n)) throw new Error("That is not an account.");
      const r = [.../* @__PURE__ */ new Set([...l.relays, ...I, ...A])].slice(0, 10);
      if (r.length === 0) return { name: "", address: "", answered: !1 };
      const o = new E(r);
      try {
        const i = await o.queryQuorum({ kinds: [0], authors: [n], limit: 2 }, 3500), s = i.outcomes.flatMap((c) => c.events), a = s.filter((c) => c.kind === 0 && c.pubkey === n && R(c)).sort((c, u) => u.created_at - c.created_at)[0];
        return { name: Hr(s, n)?.name ?? "", address: a ? Zs(a.content, { local: mt(ne()) }) : "", answered: i.respondedCount > 0 };
      } finally {
        o.closeAll();
      }
    }
    // A listing, by its coordinate, from the relays its service names and the account's own. The page checks it.
    case "payListing": {
      K(), Pt();
      const n = t, r = go(n.coordinate);
      if (!r) throw new Error("That is not a listing.");
      const o = mt(ne()), i = (Array.isArray(n.relays) ? n.relays : []).filter((c) => typeof c == "string" && c.length <= 200 && (/^wss:\/\//u.test(c) || o && /^ws:\/\/(localhost|127\.0\.0\.1)[:/]/u.test(c))).slice(0, 6), s = [.../* @__PURE__ */ new Set([...i, ...l.relays, ...I])].slice(0, 12);
      if (s.length === 0) return { event: null, answered: !1 };
      const a = new E(s);
      try {
        const c = await a.queryQuorum({ kinds: [30078], authors: [Lr(r)], "#d": [r.slice(71)], limit: 4 }, 5e3);
        return { event: c.outcomes.flatMap((d) => d.events).filter((d) => d.kind === 30078 && d.pubkey === Lr(r) && d.tags.some((y) => y[0] === "d" && y[1] === r.slice(71)) && R(d)).sort((d, y) => y.created_at - d.created_at)[0] ?? null, answered: c.respondedCount > 0 };
      } finally {
        a.closeAll();
      }
    }
    // A buyer's permission note (NIP-98) for one request to a selling service BitLogin knows: this address, this
    // method, this body, once. Kind 27235 is signed here and nowhere else, and never for a site.
    case "unlockAuth": {
      const { signer: n } = K();
      Pt();
      const r = t;
      let o;
      try {
        o = new URL(String(r.url));
      } catch {
        throw new Error("That is not an address.");
      }
      const i = Xs.some((d) => d.endpoint === o.origin) || mt(ne()) && mt(o.origin);
      if (typeof r.url != "string" || r.url.length > 1e3 || o.toString() !== r.url || o.username || o.password || !i) throw new Error("That is not a service BitLogin buys from.");
      if (r.method !== "GET" && r.method !== "POST") throw new Error("That is not something a selling service is asked.");
      const s = typeof r.payload == "string" && /^[0-9a-f]{64}$/u.test(r.payload) ? r.payload : "";
      if (r.method === "POST" && !s) throw new Error("A permission note names what is sent with it.");
      const a = n.signEvent({ kind: 27235, created_at: Math.floor(Date.now() / 1e3), tags: [["u", r.url], ["method", r.method], ["bitunlock:nonce", crypto.randomUUID()], ...s ? [["payload", s]] : []], content: "" }), c = new TextEncoder().encode(JSON.stringify(a));
      let u = "";
      for (const d of c) u += String.fromCharCode(d);
      return { token: `Nostr ${btoa(u)}` };
    }
    // The receipts kept with the account: in this browser first, then on its relays, each sealed to its own key.
    case "paySettingsLoad":
    case "paySettingsSave":
    case "receiptsLoad":
    case "receiptsKeep": {
      const { signer: n } = K();
      Pt();
      const r = n.getPublicKey(), o = [.../* @__PURE__ */ new Set([...I, ...A])].slice(0, 8);
      let i = l.relays;
      if (i.length === 0 && o.length) {
        const a = new E(o);
        try {
          i = Se((await a.queryQuorum({ kinds: [Ke], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((c) => c.events), r);
        } catch {
          i = [];
        } finally {
          a.closeAll();
        }
      }
      const s = new E([.../* @__PURE__ */ new Set([...i, ...A])].slice(0, 16));
      try {
        const a = { signer: n, store: w, relays: s };
        return e === "paySettingsLoad" ? await Il(a) : e === "paySettingsSave" ? await Ol(a, t) : e === "receiptsLoad" ? await Tl(a) : await Ml(a, t.receipts);
      } finally {
        s.closeAll();
      }
    }
    // The words of their newest profile note, to show what a proposed one would change. Read-only, and theirs.
    case "profileContent": {
      const { signer: n } = K(), r = n.getPublicKey(), o = [.../* @__PURE__ */ new Set([...l.relays, ...I, ...A])].slice(0, 10);
      if (o.length === 0) return { content: null, answered: !1 };
      const i = new E(o);
      try {
        const s = await i.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 3500), a = s.outcomes.flatMap((c) => c.events).filter((c) => c.kind === 0 && c.pubkey === r && R(c)).sort((c, u) => u.created_at - c.created_at)[0];
        return { content: a ? a.content : null, answered: s.respondedCount > 0 };
      } finally {
        i.closeAll();
      }
    }
    // The mints people recommend (NIP-87): read from relays, counted one voice per account, the user's own follows
    // first. It reads public notes and the user's follow list, and writes nothing.
    case "ecashMints": {
      const { signer: n } = K(), r = n.getPublicKey(), o = [.../* @__PURE__ */ new Set([...I, ...A])].slice(0, 8);
      if (o.length === 0) return { mints: [] };
      const i = new E(o);
      try {
        const [s, a] = await Promise.all([
          i.queryQuorum({ kinds: [Oi], "#k": [Li], limit: 500 }, 5e3),
          i.queryQuorum({ kinds: [We], authors: [r], limit: 2 }, 4e3)
        ]), c = a.outcomes.flatMap((y) => y.events).filter((y) => y.pubkey === r && y.kind === We && R(y)).sort((y, f) => f.created_at - y.created_at)[0], u = new Set((c?.tags ?? []).filter((y) => y[0] === "p" && typeof y[1] == "string").map((y) => y[1])), d = new Map(s.outcomes.flatMap((y) => y.events).filter((y) => R(y)).map((y) => [y.id, y]));
        return { mints: Nl([...d.values()], u) };
      } finally {
        i.closeAll();
      }
    }
    case "ecashLoad":
    case "ecashSetMints":
    case "ecashRoll": {
      const { signer: n } = K(), r = n.getPublicKey(), o = new E([.../* @__PURE__ */ new Set([...I, ...A])].slice(0, 8));
      let i = l.relays;
      if (i.length === 0)
        try {
          i = Se((await o.queryQuorum({ kinds: [Ke], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((c) => c.events), r);
        } catch {
          i = [];
        } finally {
          o.closeAll();
        }
      else o.closeAll();
      const s = [.../* @__PURE__ */ new Set([...i, ...A])].slice(0, 16), a = new E(s);
      try {
        const c = { signer: n, store: w, relays: a };
        return e === "ecashLoad" ? await Fl(c) : e === "ecashSetMints" ? await Wl({ ...c, newKey: () => Ie(Fe()) }, t.mints) : await Bl(c, t);
      } finally {
        a.closeAll();
      }
    }
    case "vaultStatus":
      return l.signer ? l.connectionVaultRoot ? { enabled: !0, vaultPublicKey: $n().vaultPublicKey } : { enabled: !1, reason: l.vaultKnown ? "no-vault" : "stale-cache" } : { enabled: !1 };
    case "vaultList": {
      const { connections: n, rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: s } = await Tt();
      return { connections: n.map(Je), rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: s };
    }
    case "vaultSaveNwc": {
      const n = t, r = hn(n.site), o = $n(), i = jr(n.uri), s = n.label.trim().slice(0, 120) || "Wallet connection", { record: a, event: c } = await o.createConnection({
        connection_type: "nwc",
        tier: "connectable",
        label: s,
        credential: i,
        application_binding: { origin: r, app_pubkey: null }
      });
      if (!(await o.publish({
        event: c,
        connectionId: a.connection_id,
        relayUrls: A,
        store: w
      })).success)
        throw new Error("The connection could not be saved to enough relays. Please try again.");
      const d = await o.decryptEvent(c);
      return Je(d);
    }
    case "vaultFindForOrigin": {
      const n = hn(t.site), { connections: r } = await Tt(), o = r.find(
        (i) => i.record.connection_type === "nwc" && i.record.state === "active" && i.record.application_binding.origin === n
      );
      return { connection: o ? Je(o) : null };
    }
    case "vaultRevealNwc": {
      const n = t, r = hn(n.site), { connection: o } = await vn(n.connectionId);
      if (o.record.connection_type !== "nwc" || o.record.state !== "active")
        throw new Error("That connection is not an active wallet connection.");
      const i = o.record.application_binding.origin;
      if (i !== null && i !== r)
        throw new Error("That connection belongs to a different site.");
      const s = o.record.credential;
      return vi(s), { uri: Vc(s) };
    }
    case "vaultSetBinding": {
      const n = t, { vault: r, connection: o } = await vn(n.connectionId), i = n.origin === null ? null : ne(), { record: s, event: a } = await r.updateConnection(o, {
        application_binding: { origin: i, app_pubkey: null }
      });
      if (!(await r.publish({
        event: a,
        connectionId: s.connection_id,
        relayUrls: A,
        store: w
      })).success) throw new Error("The change could not reach enough relays. Please try again.");
      const u = await r.decryptEvent(a);
      return Je(u);
    }
    case "vaultDelete": {
      const n = t, { vault: r, connection: o } = await vn(n.connectionId), { record: i, event: s } = await r.deleteConnection(o);
      if (!(await r.publish({
        event: s,
        connectionId: i.connection_id,
        relayUrls: A,
        store: w
      })).success) throw new Error("The deletion could not reach enough relays. Please try again.");
      try {
        const c = r.buildDeletionRequest(o.event.id), u = new E(A);
        await u.publishAll(c), u.closeAll();
      } catch {
      }
      return {};
    }
    case "vaultOfferCheck": {
      const n = t, r = ne(), o = jr(n.uri), { connections: i } = await Tt(), s = i.find(
        (a) => a.record.connection_type === "nwc" && Fc(a.record.credential, o)
      );
      return s ? s.record.application_binding.origin !== r ? { duplicate: !1 } : { duplicate: !0, connection: Je(s) } : { duplicate: !1 };
    }
    default:
      throw new Error(`Unknown worker action: ${e}`);
  }
}
const Xl = /* @__PURE__ */ new Set([
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
  "payProfile",
  "payListing",
  "unlockAuth",
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
  if (typeof t.action != "string" || !Xl.has(t.action)) {
    const s = {
      id: t.id,
      ok: !1,
      error: `Unknown worker action: ${String(t.action)}`,
      errorName: "Error"
    };
    self.postMessage(s);
    return;
  }
  const { id: n, action: r, payload: o } = e.data;
  (r.startsWith("nip46") ? (s) => s() : (s) => Gl.run(s))(() => Yl(r, o)).then(
    (s) => {
      const a = { id: n, ok: !0, result: s };
      self.postMessage(a);
    },
    (s) => {
      const a = s instanceof Error ? s : new Error(String(s)), c = { id: n, ok: !1, error: a.message, errorName: a.name };
      self.postMessage(c);
    }
  );
});
