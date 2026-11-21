import { K as Zi, b as es, c as L, D as so, d as At, w as _, f as It, g as ot, h as Fn, S as Ht, j as zt, k as qe, l as ft, B as ts, m as ns, n as Qt, o as it, q as Wn, r as Bn, a as Qe, s as ao, t as rs, u as os } from "./bitlogin-shared-CDSZpiZ4.js";
import { g as E, s as U, v as R, b as Ie, a as D, f as $e, i as is, j as ss, k as as, l as cs, m as ls, n as tn, o as Nr, p as co, q as us, t as ds, w as ys, x as gt, y as lo, u as q, z as fs, A as Ot, B as jn, C as Jn, D as uo, E as ps, d as T, e as O, F as Gn, G as hs, H as yo, h as Hn, I as fo, J as vs, c as pt, K as gn, L as Fe } from "./bitlogin-shared-Cj9s0_W_.js";
import { b as ht, r as Q, c as Y, k as ws, i as Ne, w as Se, R as Ke, T as nn, d as rn, n as Tr, t as gs, m as ms, N as mn, e as Mr, g as Ir, h as po, j as bs, l as ks } from "./bitlogin-shared-AERJbEy6.js";
import { a5 as be, a6 as zn, a7 as bn, a8 as Es, a9 as Ye, aa as Xe, ab as Ze, ac as re, ad as ee, ae as ho, af as vo, ag as st, ah as Qn, a1 as at, y as Lt, z as Yn, O as Xn, J as Dt, ai as de, _ as _s, a as ct, k as Zn, P as wo, b as go, aj as kn, ak as lt, al as et, am as mo, an as Ps, ao as Ss, ap as bo, aq as ko, ar as Ks, as as As, at as Rs, au as We, U as Cs, A as mt, u as Or, av as Ns, aw as Ts, ax as Ms, ay as Is, az as Os, aA as Ls, aB as Ds, aC as xs, aD as Us, aE as qs, aF as Lr, aG as $s, aH as Vs, aI as Fs, aJ as Ws, aK as Bs, aL as js, aM as Eo, H as Js, R as Gs, aN as Hs, aO as zs, aP as Qs, aQ as Ys, aR as Xs, aS as Zs, aT as ea, aU as Dr } from "./bitlogin-shared-D4lxvcOu.js";
import { e as er, a as tr, b as nr } from "./bitlogin-shared-PwbHDYud.js";
function _o(e) {
  const t = E(e.privateKey);
  return U({
    pubkey: t,
    created_at: e.createdAt,
    kind: Zi,
    tags: [
      ["e", e.eventIdToDelete],
      ["k", String(e.deletedEventKind)]
    ],
    content: e.reason ?? ""
  }, e.privateKey);
}
function ta() {
  const e = globalThis.WebSocket;
  if (!e)
    throw new Error("No global WebSocket implementation is available in this environment.");
  return e;
}
const xt = 1e3, na = 262144;
function ra(e) {
  const t = Math.min(e.limit ?? xt, xt);
  return Math.max(50, t * 3);
}
const oa = 2048, ia = 1e4, sa = 100;
function aa(e, t) {
  if (e.size >= oa) {
    const n = e.values().next().value;
    n !== void 0 && e.delete(n);
  }
  e.add(t);
}
class rr {
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
      const r = ta(), o = new r(this.url);
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
    if (t.length > na)
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
        if (d - a.liveWindowStart >= ia && (a.liveWindowStart = d, a.liveVerifies = 0), a.liveVerifies >= sa || (a.liveVerifies++, !R(s) || !xr(s, a.filter)))
          return;
        aa(a.seenIds, s.id), a.onEvent(s);
        return;
      }
      const l = Math.min(a.filter.limit ?? xt, xt);
      if (a.events.length >= l || a.verifyBudget <= 0 || (a.verifyBudget--, !R(s) || !xr(s, a.filter)))
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
    const n = E(this.authPrivateKey), r = U({
      pubkey: n,
      created_at: Math.floor(Date.now() / 1e3),
      kind: es,
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
      const s = [], a = (l) => {
        clearTimeout(c), this.subs.delete(r);
        try {
          this.send(["CLOSE", r]);
        } catch {
        }
        l ? i(l) : o(s);
      }, c = setTimeout(() => a(new Error("relay did not answer the subscription before the timeout")), n);
      this.subs.set(r, {
        events: s,
        seenIds: /* @__PURE__ */ new Set(),
        verifyBudget: ra(t),
        liveWindowStart: 0,
        liveVerifies: 0,
        filter: t,
        onEose: () => a()
      }), this.send(["REQ", r, t]);
    });
  }
}
function xr(e, t) {
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
class S {
  connections = /* @__PURE__ */ new Map();
  constructor(t, n = {}) {
    for (const r of new Set(t))
      this.connections.set(r, new rr(r, n));
  }
  get relayUrls() {
    return [...this.connections.keys()];
  }
  /** Queries every configured relay and waits for a quorum of responses (or all timeouts) before returning (§16.2). */
  async queryQuorum(t, n = 8e3) {
    const r = [...this.connections.entries()], o = await Promise.all(r.map(async ([a, c]) => {
      try {
        const l = await c.queryOnce(t, n);
        return { relayUrl: a, events: l, responded: !0 };
      } catch (l) {
        return { relayUrl: a, events: [], responded: !1, error: l.message };
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
const vt = null, Po = [
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
], So = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  // Added 2026-11-18: relay.nostr.band timed out and nostr-pub.wellorder.net
  // never connected in the same measurement, leaving two working lookups.
  "wss://nos.lol"
], ca = [], la = /^[0-9a-f]{64}$/u, ua = 64;
function on(e) {
  return Array.isArray(e) && e.length <= ua && e.every((t) => typeof t == "string" && ht(t)) && new Set(e).size === e.length;
}
function Yt(e, t = vt, n = -1) {
  if (!t || !la.test(t) || /^0{64}$/u.test(t) || !R(e) || e.pubkey !== t || e.kind !== L || $e(e, "d") !== so)
    return null;
  try {
    const r = JSON.parse(e.content);
    if (typeof r != "object" || r === null || Array.isArray(r))
      return null;
    const o = r;
    return !Number.isSafeInteger(o.version) || o.version < 1 || o.version <= n || !on(o.vaultRelays) || !on(o.discoveryRelays) || o.deprecated !== void 0 && !on(o.deprecated) ? null : {
      version: o.version,
      vaultRelays: o.vaultRelays,
      discoveryRelays: o.discoveryRelays,
      ...o.deprecated === void 0 ? {} : { deprecated: o.deprecated }
    };
  } catch {
    return null;
  }
}
function da(e) {
  return Math.max(0, e - 1);
}
function Ur(e, t, n) {
  const r = t ? n === "vault" ? t.vaultRelays : t.discoveryRelays : [], o = new Set(t?.deprecated ?? []), i = new Set(e), s = [...new Set(r)].filter((a) => !o.has(a) && !i.has(a)).slice(0, da(e.length));
  return [...e, ...s];
}
async function ya(e, t = vt, n = -1, r = 6e3) {
  if (!t || e.length === 0)
    return null;
  const o = new S([...e]);
  let i;
  try {
    i = (await o.queryQuorum({ kinds: [L], authors: [t], "#d": [so], limit: 3 }, r)).outcomes.flatMap((c) => c.events);
  } finally {
    o.closeAll();
  }
  let s = null;
  for (const a of i) {
    const c = Yt(a, t, n);
    c && (!s || c.version > s.list.version) && (s = { event: a, list: c });
  }
  return s;
}
const Ko = "bitlogin:bootstrap-relays:v1";
async function Ao(e, t = vt) {
  if (!t)
    return null;
  try {
    const n = await e.get(Ko);
    return n ? Yt(JSON.parse(n), t) : null;
  } catch {
    return null;
  }
}
function Rt(e) {
  return {
    vaultRelays: Ur(Po, e, "vault"),
    discoveryRelays: Ur(So, e, "discovery"),
    listVersion: e?.version ?? null
  };
}
async function fa(e, t = {}) {
  const n = t.maintainerPubkeyHex === void 0 ? vt : t.maintainerPubkeyHex, r = await Ao(e, n);
  if (!n)
    return Rt(null);
  const o = Rt(r), i = r?.version ?? -1;
  try {
    let s = await ya(t.queryRelayUrls ?? [.../* @__PURE__ */ new Set([...o.vaultRelays, ...o.discoveryRelays])], n, i, t.timeoutMs);
    if (!s) {
      const a = await pa(t.httpsFallbackUrls ?? ca, n, i), c = a ? Yt(a, n, i) : null;
      a && c && (s = { event: a, list: c });
    }
    return s ? (await e.set(Ko, JSON.stringify(s.event)), Rt(s.list)) : o;
  } catch {
    return o;
  }
}
async function pa(e, t = vt, n = -1) {
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
      if (R(a) && Yt(a, t, n))
        return a;
    } catch {
    }
  return null;
}
const or = /^[0-9a-f]{64}$/u, ha = 8, va = 4096, wa = 256, ga = 512;
class Ae extends Error {
  name = "BunkerUriParseError";
}
class ma extends Error {
  name = "Nip46RequestTimeoutError";
  constructor(t, n) {
    super(`The remote signer did not answer ${t} within ${Math.round(n / 1e3)}s. It may be offline, or waiting for your approval on another device -- check your signer and try again.`);
  }
}
class ba extends Error {
  name = "Nip46ErrorResponse";
}
function ka(e) {
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return null;
  }
  const n = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol === "https:" || t.protocol === "http:" && n ? t.toString() : null;
}
function Ea(e) {
  if (e.length > va)
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
  if (!or.test(n))
    throw new Ae("The bunker URI does not name a valid signer public key.");
  const r = [
    ...new Set(t.searchParams.getAll("relay").map((i) => i.trim()).filter((i) => i.length > 0 && i.length <= ga))
  ].slice(0, ha);
  if (r.length === 0)
    throw new Ae("The bunker URI names no relays -- without at least one relay= parameter there is no way to reach the signer.");
  const o = t.searchParams.get("secret") ?? void 0;
  if (o && o.length > wa)
    throw new Ae("The bunker URI's secret is unreasonably long.");
  return { signerPubkey: n, relayUrls: r, secret: o || void 0 };
}
function _a(e) {
  if (!or.test(e.clientPubkey))
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
const Pa = 12e4;
class qr {
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
    this.clientSecretKey = t.clientSecretKey, this.clientPubkey = E(t.clientSecretKey), this.pointer = t.pointer, this.conversationKey = be(t.clientSecretKey, t.pointer.signerPubkey), this.onAuthUrl = t.onAuthUrl, this.requestTimeoutMs = t.requestTimeoutMs ?? Pa, this.conns = t.pointer.relayUrls.map((n) => new rr(n, { authPrivateKey: t.clientSecretKey }));
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
        kinds: [At],
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
      n = JSON.parse(zn(this.conversationKey, t.content));
    } catch {
      return;
    }
    if (typeof n.id != "string")
      return;
    const r = this.pending.get(n.id);
    if (r) {
      if (n.result === "auth_url") {
        if (!r.authUrlSeen && typeof n.error == "string" && n.error) {
          const o = ka(n.error);
          o && (r.authUrlSeen = !0, this.onAuthUrl?.(o));
        }
        return;
      }
      if (this.pending.delete(n.id), clearTimeout(r.timer), typeof n.error == "string" && n.error) {
        r.reject(new ba(n.error));
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
    const r = Ie(D(8)), o = bn(this.conversationKey, JSON.stringify({ id: r, method: t, params: n })), i = [["p", this.pointer.signerPubkey]], s = U({
      pubkey: this.clientPubkey,
      created_at: Math.floor(Date.now() / 1e3),
      kind: At,
      tags: i,
      content: o
    }, this.clientSecretKey), a = new Promise((d, y) => {
      const f = setTimeout(() => {
        this.pending.delete(r), y(new ma(t, this.requestTimeoutMs));
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
    if (!or.test(t))
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
      const t = Ie(D(8)), n = bn(this.conversationKey, JSON.stringify({ id: t, method: "logout", params: [] }));
      return U({
        pubkey: this.clientPubkey,
        created_at: Math.floor(Date.now() / 1e3),
        kind: At,
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
    this.pending.clear(), _(this.clientSecretKey), _(this.conversationKey);
  }
}
async function Sa(e) {
  const t = E(e.clientSecretKey), n = e.timeoutMs, r = e.relayUrls.map((i) => new rr(i, { authPrivateKey: e.clientSecretKey })), o = () => {
    for (const i of r)
      i.close();
  };
  return new Promise((i, s) => {
    let a = !1;
    const c = () => l(new Error("The signer-connection attempt was cancelled.")), l = (p) => {
      a || (a = !0, clearTimeout(d), e.signal?.removeEventListener("abort", c), o(), p instanceof Error ? s(p) : i(p));
    }, d = setTimeout(() => l(new Error(`No signer connected within ${Math.round(n / 1e3)}s. Scan or paste the connection code in your signer app, then try again.`)), n);
    if (e.signal?.aborted) {
      c();
      return;
    }
    e.signal?.addEventListener("abort", c, { once: !0 });
    const y = { kinds: [At], "#p": [t] }, f = (p) => {
      let v, h = null;
      try {
        h = be(e.clientSecretKey, p.pubkey), v = JSON.parse(zn(h, p.content));
      } catch {
        return;
      } finally {
        h && _(h);
      }
      v.result === e.secret && l({ signerPubkey: p.pubkey });
    };
    Promise.allSettled(r.map((p) => p.subscribeLive(y, f))).then((p) => {
      p.some((v) => v.status === "fulfilled") || l(new Error("Could not reach any relay to listen for the signer."));
    });
  });
}
function ir() {
  const e = globalThis.crypto;
  if (!e || !e.subtle)
    throw new Error("WebCrypto SubtleCrypto is not available in this environment.");
  return e;
}
async function Ro(e) {
  if (e.length !== 32)
    throw new Error("AES-256-GCM key must be exactly 32 bytes.");
  return ir().subtle.importKey("raw", e, "AES-GCM", !1, ["encrypt", "decrypt"]);
}
async function Co(e, t, n) {
  const r = is(), o = await Ro(e), i = await ir().subtle.encrypt({ name: "AES-GCM", iv: r, additionalData: n, tagLength: 128 }, o, t);
  return { nonce: r, ciphertext: new Uint8Array(i) };
}
async function No(e, t, n, r) {
  const o = await Ro(e);
  try {
    const i = await ir().subtle.decrypt({ name: "AES-GCM", iv: t, additionalData: r, tagLength: 128 }, o, n);
    return new Uint8Array(i);
  } catch {
    throw new Error("AES-256-GCM authentication failed: capsule is corrupted, tampered, or the wrong key was used.");
  }
}
const To = `abandon
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
function Ka(e, t, n, r) {
  cs(e);
  const o = ls({ dkLen: 32, asyncTick: 10 }, r), { c: i, dkLen: s, asyncTick: a } = o;
  if (tn(i), tn(s), tn(a), i < 1)
    throw new Error("iterations (c) should be >= 1");
  const c = Nr(t), l = Nr(n), d = new Uint8Array(s), y = co.create(e, c), f = y._cloneInto().update(l);
  return { c: i, dkLen: s, asyncTick: a, DK: d, PRF: y, PRFSalt: f };
}
function Aa(e, t, n, r, o) {
  return e.destroy(), t.destroy(), r && r.destroy(), us(o), n;
}
async function Ra(e, t, n, r) {
  const { c: o, dkLen: i, asyncTick: s, DK: a, PRF: c, PRFSalt: l } = Ka(e, t, n, r);
  let d;
  const y = new Uint8Array(4), f = ss(y), p = new Uint8Array(c.outputLen);
  for (let v = 1, h = 0; h < i; v++, h += c.outputLen) {
    const g = a.subarray(h, h + c.outputLen);
    f.setInt32(0, v, !1), (d = l._cloneInto(d)).update(y).digestInto(p), g.set(p.subarray(0, g.length)), await as(o - 1, s, () => {
      c._cloneInto(d).update(p).digestInto(p);
      for (let m = 0; m < g.length; m++)
        g[m] ^= p[m];
    });
  }
  return Aa(c, l, a, d, p);
}
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const Ca = (e) => e[0] === "あいこくしん";
function Mo(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function Io(e) {
  const t = Mo(e), n = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(n.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: n };
}
function Oo(e) {
  ys(e, 16, 20, 24, 28, 32);
}
const Na = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([lo(e)[0] >> t << t]);
};
function Lo(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), gt.chain(gt.checksum(1, Na), gt.radix2(11, !0), gt.alphabet(e));
}
function Ta(e, t) {
  const { words: n } = Io(e), r = Lo(t).decode(n);
  return Oo(r), r;
}
function Ma(e, t) {
  return Oo(e), Lo(t).encode(e).join(Ca(t) ? "　" : " ");
}
function Ia(e, t) {
  try {
    Ta(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const Oa = (e) => Mo("mnemonic" + e);
function La(e, t = "") {
  return Ra(ds, Io(e).nfkd, Oa(t), { c: 2048, dkLen: 64 });
}
function Da(e) {
  if (e.length !== 16)
    throw new Error("Recovery phrase entropy must be exactly 128 bits (16 bytes).");
  return Ma(e, To);
}
function Do(e) {
  try {
    return Ia(xo(e), To);
  } catch {
    return !1;
  }
}
function xo(e) {
  return e.trim().normalize("NFKD").toLowerCase().split(/\s+/u).join(" ");
}
async function sr(e) {
  return La(xo(e), "");
}
const Ct = [1024, 2048, 4096], ge = 4;
function xa(e) {
  const t = ge + e.length, n = Ct.find((i) => i >= t);
  if (n === void 0)
    throw new Error(`Payload of ${e.length} bytes exceeds the largest padding bucket (${Ct[Ct.length - 1]} bytes minus ${ge}-byte length prefix).`);
  const r = new Uint8Array(n);
  return new DataView(r.buffer).setUint32(0, e.length, !1), r.set(e, ge), r;
}
function Ua(e) {
  if (!Ct.includes(e.length))
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
function qa(e) {
  const t = fs(e);
  if (t === void 0)
    throw new Error("Value is not JSON-serializable for canonicalization.");
  return t;
}
function $a(e) {
  return q(qa(e));
}
const ue = 16, Va = 283;
function Fa(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function ar(e) {
  return e << 1 ^ Va & -(e >> 7);
}
function Te(e, t) {
  let n = 0;
  for (; t > 0; t >>= 1)
    n ^= e & -(t & 1), e = ar(e);
  return n;
}
const En = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let n = 0, r = 1; n < 256; n++, r ^= ar(r))
    e[n] = r;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let n = 0; n < 255; n++) {
    let r = e[255 - n];
    r |= r << 8, t[e[n]] = (r ^ r >> 4 ^ r >> 5 ^ r >> 6 ^ r >> 7 ^ 99) & 255;
  }
  return st(e), t;
})(), Wa = /* @__PURE__ */ En.map((e, t) => En.indexOf(t)), Ba = (e) => e << 24 | e >>> 8, sn = (e) => e << 8 | e >>> 24;
function Uo(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const n = new Uint32Array(256).map((l, d) => t(e[d])), r = n.map(sn), o = r.map(sn), i = o.map(sn), s = new Uint32Array(256 * 256), a = new Uint32Array(256 * 256), c = new Uint16Array(256 * 256);
  for (let l = 0; l < 256; l++)
    for (let d = 0; d < 256; d++) {
      const y = l * 256 + d;
      s[y] = n[l] ^ r[d], a[y] = o[l] ^ i[d], c[y] = e[l] << 8 | e[d];
    }
  return { sbox: e, sbox2: c, T0: n, T1: r, T2: o, T3: i, T01: s, T23: a };
}
const cr = /* @__PURE__ */ Uo(En, (e) => Te(e, 3) << 24 | e << 16 | e << 8 | Te(e, 2)), qo = /* @__PURE__ */ Uo(Wa, (e) => Te(e, 11) << 24 | Te(e, 13) << 16 | Te(e, 9) << 8 | Te(e, 14)), ja = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, n = 1; t < 16; t++, n = ar(n))
    e[t] = n;
  return e;
})();
function $o(e) {
  Qn(e);
  const t = e.length;
  Fa(e);
  const { sbox2: n } = cr, r = [];
  (!Ye || !Xe(e)) && r.push(e = Ze(e));
  const o = ee(re(e)), i = o.length, s = (c) => j(n, c, c, c, c), a = new Uint32Array(t + 28);
  a.set(o);
  for (let c = i; c < a.length; c++) {
    let l = a[c - 1];
    c % i === 0 ? l = s(Ba(l)) ^ ja[c / i - 1] : i > 6 && c % i === 4 && (l = s(l)), a[c] = a[c - i] ^ l;
  }
  return st(...r), a;
}
function Ja(e) {
  const t = $o(e), n = t.slice(), r = t.length, { sbox2: o } = cr, { T0: i, T1: s, T2: a, T3: c } = qo;
  for (let l = 0; l < r; l += 4)
    for (let d = 0; d < 4; d++)
      n[l + d] = t[r - l - 4 + d];
  st(t);
  for (let l = 4; l < r - 4; l++) {
    const d = n[l], y = j(o, d, d, d, d);
    n[l] = i[y & 255] ^ s[y >>> 8 & 255] ^ a[y >>> 16 & 255] ^ c[y >>> 24];
  }
  return n;
}
function oe(e, t, n, r, o, i) {
  return e[n << 8 & 65280 | r >>> 8 & 255] ^ t[o >>> 8 & 65280 | i >>> 24 & 255];
}
function j(e, t, n, r, o) {
  return e[t & 255 | n & 65280] | e[r >>> 16 & 255 | o >>> 16 & 65280] << 16;
}
function $r(e, t, n, r, o) {
  const { sbox2: i, T01: s, T23: a } = cr;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const l = e.length / 4 - 2;
  for (let v = 0; v < l; v++) {
    const h = e[c++] ^ oe(s, a, t, n, r, o), g = e[c++] ^ oe(s, a, n, r, o, t), m = e[c++] ^ oe(s, a, r, o, t, n), k = e[c++] ^ oe(s, a, o, t, n, r);
    t = h, n = g, r = m, o = k;
  }
  const d = e[c++] ^ j(i, t, n, r, o), y = e[c++] ^ j(i, n, r, o, t), f = e[c++] ^ j(i, r, o, t, n), p = e[c++] ^ j(i, o, t, n, r);
  return { s0: d, s1: y, s2: f, s3: p };
}
function Ga(e, t, n, r, o) {
  const { sbox2: i, T01: s, T23: a } = qo;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const l = e.length / 4 - 2;
  for (let v = 0; v < l; v++) {
    const h = e[c++] ^ oe(s, a, t, o, r, n), g = e[c++] ^ oe(s, a, n, t, o, r), m = e[c++] ^ oe(s, a, r, n, t, o), k = e[c++] ^ oe(s, a, o, r, n, t);
    t = h, n = g, r = m, o = k;
  }
  const d = e[c++] ^ j(i, t, o, r, n), y = e[c++] ^ j(i, n, t, o, r), f = e[c++] ^ j(i, r, n, t, o), p = e[c++] ^ j(i, o, r, n, t);
  return { s0: d, s1: y, s2: f, s3: p };
}
function Ha(e) {
  if (Qn(e), e.length % ue !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + ue);
}
function za(e, t, n) {
  Qn(e);
  let r = e.length;
  const o = r % ue;
  if (!t && o !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (t) {
    let a = ue - o;
    a || (a = ue), r = r + a;
  }
  n = ho(r, n), vo(e, n), (!Ye || !Xe(e)) && (e = Ze(e));
  const i = re(e);
  ee(i);
  const s = re(n);
  return { b: i, o: s, out: n };
}
function Qa(e, t) {
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
function Ya(e) {
  const t = new Uint8Array(16), n = re(t);
  t.set(e);
  const r = ue - e.length;
  for (let o = ue - r; o < ue; o++)
    t[o] = r;
  return n;
}
const Vo = /* @__PURE__ */ Es({ blockSize: 16, nonceLength: 16 }, function(t, n, r = {}) {
  const o = !r.disablePadding;
  return {
    encrypt(i, s) {
      const a = $o(t), { b: c, o: l, out: d } = za(i, o, s);
      let y = n;
      const f = [a];
      (!Ye || !Xe(y)) && f.push(y = Ze(y));
      const p = re(y);
      ee(p);
      let v = p[0], h = p[1], g = p[2], m = p[3], k = 0;
      for (; k + 4 <= c.length; )
        v ^= c[k + 0], h ^= c[k + 1], g ^= c[k + 2], m ^= c[k + 3], { s0: v, s1: h, s2: g, s3: m } = $r(a, v, h, g, m), l[k++] = v, l[k++] = h, l[k++] = g, l[k++] = m;
      if (o) {
        const b = Ya(i.subarray(k * 4));
        ee(b), v ^= b[0], h ^= b[1], g ^= b[2], m ^= b[3], { s0: v, s1: h, s2: g, s3: m } = $r(a, v, h, g, m), l[k++] = v, l[k++] = h, l[k++] = g, l[k++] = m;
      }
      return ee(l), st(...f), d;
    },
    decrypt(i, s) {
      Ha(i);
      const a = Ja(t);
      let c = n;
      const l = [a];
      (!Ye || !Xe(c)) && l.push(c = Ze(c));
      const d = re(c);
      ee(d), s = ho(i.length, s), vo(i, s), (!Ye || !Xe(i)) && l.push(i = Ze(i));
      const y = re(i), f = re(s);
      ee(y);
      let p = d[0], v = d[1], h = d[2], g = d[3];
      for (let m = 0; m + 4 <= y.length; ) {
        const k = p, b = v, P = h, M = g;
        p = y[m + 0], v = y[m + 1], h = y[m + 2], g = y[m + 3];
        const { s0: $, s1: X, s2: pe, s3: Zt } = Ga(a, p, v, h, g);
        f[m++] = $ ^ k, f[m++] = X ^ b, f[m++] = pe ^ P, f[m++] = Zt ^ M;
      }
      return ee(f), st(...l), Qa(s, o);
    }
  };
});
function Fo(e, t) {
  const n = Jn(new Uint8Array([2]), uo(t));
  return ps.getSharedSecret(e, n, !0).slice(1, 33);
}
function Xa(e, t, n) {
  return Za(e, t, n, D(16));
}
function Za(e, t, n, r) {
  if (r.length !== 16)
    throw new Error("NIP-04 iv must be exactly 16 bytes.");
  const o = Fo(e, t), i = Vo(o, r).encrypt(q(n));
  return `${Ot.encode(i)}?iv=${Ot.encode(r)}`;
}
function ec(e, t, n) {
  const r = n.indexOf("?iv=");
  if (r === -1)
    throw new Error('NIP-04 payload is missing its "?iv=" suffix.');
  const o = Ot.decode(n.slice(0, r)), i = Ot.decode(n.slice(r + 4)), s = Fo(e, t), a = Vo(s, i).decrypt(o);
  return jn(a);
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
class Wo extends Error {
  constructor(t = "An account already exists with this login name and password. Sign in instead, or choose different credentials.") {
    super(t), this.name = "AccountAlreadyExistsError";
  }
}
class se extends Error {
  constructor(t) {
    super(t), this.name = "RecoveryFailedError";
  }
}
class Bo extends Error {
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
const tc = { generation: -1, recoveryGeneration: -1 };
function lr(e) {
  return `bitlogin:hwm:${e}`;
}
async function ur(e, t) {
  const n = await e.get(lr(t));
  return n ? JSON.parse(n) : tc;
}
async function jo(e, t, n) {
  const r = await ur(e, t), o = {
    generation: Math.max(r.generation, n.generation ?? -1),
    recoveryGeneration: Math.max(r.recoveryGeneration, n.recoveryGeneration ?? -1)
  };
  return await e.set(lr(t), JSON.stringify(o)), o;
}
async function nc(e, t, n = { generation: 0, recoveryGeneration: -1 }) {
  await e.set(lr(t), JSON.stringify(n));
}
function rc(e, t, n) {
  return U({ pubkey: E(e), created_at: n, kind: It, tags: [], content: JSON.stringify(t) }, e);
}
function oc(e, t, n) {
  const r = t.map((o) => {
    const i = ["r", o.url];
    return o.read && !o.write && i.push("read"), o.write && !o.read && i.push("write"), i;
  });
  return U({ pubkey: E(e), created_at: n, kind: ot, tags: r, content: "" }, e);
}
function ic(e, t, n) {
  return U({
    pubkey: E(e),
    created_at: n,
    kind: Fn,
    tags: t.map((r) => ["relay", r]),
    content: ""
  }, e);
}
function sc(e) {
  return e.tags.filter((t) => t[0] === "r" && t[1]).map((t) => t[1]);
}
function ac(e) {
  return e.tags.filter((t) => t[0] === "relay" && t[1]).map((t) => t[1]);
}
async function cc(e) {
  const t = E(e.everydayPrivateKey), n = Math.floor(Date.now() / 1e3), r = [.../* @__PURE__ */ new Set([...e.generalRelays, ...e.dmRelays, ...e.discoveryRelays])], o = new S(r), [i, s, a] = await Promise.all([
    o.queryQuorum({ authors: [t], kinds: [It] }),
    o.queryQuorum({ authors: [t], kinds: [ot] }),
    o.queryQuorum({ authors: [t], kinds: [Fn] })
  ]);
  o.closeAll();
  const c = i.outcomes.some((g) => g.events.length > 0), l = s.outcomes.some((g) => g.events.length > 0), d = a.outcomes.some((g) => g.events.length > 0), y = new S(r);
  let f = null, p = null, v = null;
  const h = [];
  if (!c && (e.name || e.about || e.picture)) {
    const g = rc(e.everydayPrivateKey, { name: e.name, about: e.about, picture: e.picture }, n);
    h.push(y.publishAll(g).then((m) => void (f = m)));
  }
  if (!l) {
    const g = oc(e.everydayPrivateKey, e.generalRelays.map((m) => ({ url: m, read: !0, write: !0 })), n);
    h.push(y.publishAll(g).then((m) => void (p = m)));
  }
  if (!d) {
    const g = ic(e.everydayPrivateKey, e.dmRelays, n);
    h.push(y.publishAll(g).then((m) => void (v = m)));
  }
  return await Promise.all(h), y.closeAll(), {
    profilePublished: f !== null && x(f) > 0,
    relayListAcknowledgedCount: p !== null ? x(p) : 0,
    dmRelayListAcknowledgedCount: v !== null ? x(v) : 0,
    profileSkippedExisting: c,
    relayListSkippedExisting: l,
    dmRelayListSkippedExisting: d
  };
}
async function _e(e, t, n) {
  const r = n.minAcks ?? 2, o = n.minReadbacks ?? 2, i = await e.publishAll(t, n.timeoutMs), s = x(i), c = (await e.queryQuorum({ kinds: [L], authors: [t.pubkey], "#d": [n.dTag], limit: 5 }, n.timeoutMs)).outcomes.filter((l) => l.events.some((d) => d.id === t.id)).length;
  return {
    acknowledgedCount: s,
    readbackVerifiedCount: c,
    success: s >= r && c >= o
  };
}
function Jo(e) {
  return q(`bitlogin|password-capsule|v1|${e}|30078|bitlogin:password:v1`);
}
function Go(e) {
  return q(`bitlogin|recovery-capsule|v1|${e}|30078|bitlogin:recovery:v1`);
}
async function dr(e, t, n) {
  const r = $a(e), o = xa(r), i = await Co(t, o, n);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    nonce: T(i.nonce),
    ciphertext: T(i.ciphertext)
  };
}
async function yr(e, t, n) {
  if (e.version !== 1 || e.algorithm !== "aes-256-gcm")
    throw new Error(`Unsupported capsule envelope version/algorithm: ${e.version}/${e.algorithm}`);
  const r = O(e.nonce), o = O(e.ciphertext), i = await No(t, r, o, n), s = Ua(i);
  return JSON.parse(jn(s));
}
class fr extends Error {
  constructor(t) {
    super(t), this.name = "CapsuleValidationError";
  }
}
const lc = 1e6, uc = /^[0-9a-f]{64}$/u;
function N(e, t) {
  if (!e)
    throw new fr(t);
}
function Ut(e) {
  return typeof e == "string" && uc.test(e);
}
function Ho(e) {
  N(Array.isArray(e), "vault_relay_hints must be an array (§12.4.7).");
  for (const t of e)
    N(typeof t == "string", "Each relay hint must be a string (§12.4.7)."), N(ht(t), `Relay URL must use secure WebSockets, except for an explicit loopback development endpoint (§12.4.7): ${t}`);
}
function zo(e) {
  N(typeof e == "string", "account_id must be a string (§12.4.2).");
  let t;
  try {
    t = O(e);
  } catch {
    throw new fr("account_id is not valid base64url (§12.4.2).");
  }
  N(t.length === 16, "account_id must decode to exactly 128 bits (§12.4.2).");
}
function Qo(e, t) {
  N(typeof e == "string", "operational_private_key must be a string (§12.4.3).");
  const n = O(e);
  N(n.length === 32, "operational_private_key must be exactly 32 bytes (§12.4.3)."), N(Gn(n), "operational_private_key is not a valid secp256k1 scalar (§12.4.3)."), N(Ut(t), "operational_public_key must be lowercase 64-char hex (§12.4.4).");
  const r = E(n);
  N(r === t, "operational_public_key does not match the derived public key (§12.4.4).");
}
function qt(e, t) {
  N(typeof t == "string", `${e} must be a string (§CV5.2).`);
  let n;
  try {
    n = O(t);
  } catch {
    throw new fr(`${e} is not valid base64url (§CV5.2).`);
  }
  N(n.length === 32, `${e} must decode to exactly 32 bytes (§CV5.2).`);
}
function dc(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (N(t !== void 0 && n !== void 0, "connection_vault_root and vault_sudo_key must appear together (§CV5.2)."), qt("connection_vault_root", t), qt("vault_sudo_key", n));
}
function yc(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (N(t !== void 0, "vault_sudo_key cannot appear without connection_vault_root (§CV5.2)."), qt("connection_vault_root", t), n !== void 0 && qt("vault_sudo_key", n));
}
function Yo(e, t) {
  N(Number.isInteger(e) && e >= 0 && e <= lc, `${t} is out of supported bounds (§12.4.8).`);
}
function fc(e) {
  N(e.schema === zt, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), zo(e.account_id), Yo(e.generation, "generation"), Qo(e.operational_private_key, e.operational_public_key), N(Ut(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex (§12.4.5)."), Ho(e.vault_relay_hints), yc(e);
  const t = e.recovery_capsule_event;
  N(!!t && typeof t == "object", "recovery_capsule_event must be present (§12.4.6)."), N(R(t), "Embedded recovery_capsule_event has an invalid event id or signature (§12.4.6)."), N(t.pubkey === e.recovery_public_key, "Embedded recovery_capsule_event author does not match recovery_public_key (§12.4.5).");
}
function pc(e) {
  N(e.schema === Ht, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), zo(e.account_id), Yo(e.recovery_generation, "recovery_generation"), N(e.previous_recovery_event_id === null || Ut(e.previous_recovery_event_id), "previous_recovery_event_id must be null or lowercase 64-char hex (§12.3)."), Qo(e.operational_private_key, e.operational_public_key), N(Ut(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex."), Ho(e.vault_relay_hints), dc(e);
}
function hc(e) {
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
async function pr(e) {
  const t = E(e.locatorPrivateKey), n = await dr(e.payload, e.capsuleKey, Jo(t));
  return U({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: L,
    tags: [["d", qe]],
    content: JSON.stringify(n)
  }, e.locatorPrivateKey);
}
function vc(e) {
  const t = E(e.oldLocatorPrivateKey);
  return U({
    pubkey: t,
    created_at: e.createdAt,
    kind: L,
    tags: [["d", qe]],
    content: ""
  }, e.oldLocatorPrivateKey);
}
async function wc(e, t) {
  if (!R(e))
    throw new Error("Credential capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await yr(n, t, Jo(e.pubkey));
  return fc(r), r;
}
async function hr(e) {
  const t = E(e.recoveryPrivateKey), n = await dr(e.payload, e.capsuleKey, Go(t));
  return U({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: L,
    tags: [["d", ft]],
    content: JSON.stringify(n)
  }, e.recoveryPrivateKey);
}
async function Xo(e, t) {
  if (!R(e))
    throw new Error("Recovery capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await yr(n, t, Go(e.pubkey));
  return pc(r), r;
}
function Vr(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  for (const o of e)
    o.pubkey === t && o.kind === L && $e(o, "d") === n && R(o) && r.set(o.id, o);
  return [...r.values()].sort((o, i) => i.created_at - o.created_at);
}
async function Zo(e, t, n, r, o) {
  const i = await e.queryQuorum({ kinds: [L], authors: [t], "#d": [n], limit: 5 }, o), s = i.outcomes.flatMap((f) => f.events), a = Vr(s, t, n), c = [];
  for (const f of a)
    try {
      const p = await r(f);
      c.push({ event: f, payload: p });
    } catch (p) {
      c.push({ event: f, payload: null, error: p.message });
    }
  const l = c.find((f) => f.payload !== null) ?? null, d = i.outcomes.map((f) => ({
    responded: f.responded,
    events: Vr(f.events, t, n)
  })).filter((f) => f.responded && f.events.length > 0).map((f) => f.events[0].id), y = new Set(d).size > 1;
  return {
    quorumMet: i.quorumMet,
    respondedCount: i.respondedCount,
    totalCount: i.totalCount,
    candidates: c,
    best: l,
    relayDisagreement: y
  };
}
async function dt(e, t, n, r = 8e3) {
  return Zo(e, t, qe, (o) => wc(o, n), r);
}
async function ei(e, t, n, r = 8e3) {
  return Zo(e, t, ft, (o) => Xo(o, n), r);
}
function gc(e) {
  const t = e.filter((n) => n.payload !== null);
  return t.length < 2 ? { consistent: !0 } : hc(t.map((n) => ({
    eventId: n.event.id,
    recoveryGeneration: n.payload.recovery_generation,
    previousRecoveryEventId: n.payload.previous_recovery_event_id
  })));
}
async function Fr(e) {
  const t = [...new Set(e.relayUrls)], n = async (a) => {
    const c = new S(t);
    try {
      const l = await c.publishAll(a, e.timeoutMs);
      return new Map(l.map((d) => [
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
function mc(e) {
  const t = $e(e, "d");
  if (e.kind !== L || t === void 0 || !R(e))
    throw new Error("This session's capsule event is not a valid capsule.");
  return { pubkey: e.pubkey, dTag: t };
}
function bc(e, t, n) {
  const r = e.filter((i) => i.pubkey === n.pubkey && i.kind === L && $e(i, "d") === n.dTag && R(i));
  return r.some((i) => i.id === t.id) ? "current" : r.length === 0 ? "missing" : Math.max(...r.map((i) => i.created_at)) >= t.created_at ? "newer" : "older";
}
async function Wr(e, t, n) {
  const r = mc(t), o = new S(e);
  try {
    const i = await o.queryQuorum({
      kinds: [L],
      authors: [r.pubkey],
      "#d": [r.dTag],
      limit: 5
    }, n);
    return new Map(i.outcomes.map((s) => [
      s.relayUrl,
      s.responded ? { status: bc(s.events, t, r) } : { status: "unreachable", error: s.error }
    ]));
  } finally {
    o.closeAll();
  }
}
async function kc(e) {
  const t = [...new Set(e.relayUrls)], [n, r] = await Promise.all([
    Wr(t, e.credentialEvent, e.timeoutMs),
    Wr(t, e.recoveryEvent, e.timeoutMs)
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
const vr = ts.id, Oe = "aes-256-gcm-v1", Le = "bitlogin-bip39-hkdf-v1", ti = "bitlogin-recovery-hkdf-v1", Ec = 4, _c = 64;
function De(e) {
  return [...new Set(e)].filter((t) => t.length <= _c).slice(0, Ec);
}
function xe(e) {
  return e ? { everyday_derivation: ti } : {};
}
function ni(e) {
  return e.protocol?.everyday_derivation === ti;
}
async function ri(e) {
  const t = Qt(e.loginName), n = e.now ?? Math.floor(Date.now() / 1e3), { locatorPrivateKey: r, capsuleKey: o } = await it(e.password, t);
  try {
    const i = E(r), s = new S(e.vaultRelayUrls, {
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
      throw new Wo();
    const c = e.everydayPrivateKey !== void 0;
    if (c && !Gn(e.everydayPrivateKey))
      throw new ie("The provided key is not a valid secp256k1 private key.");
    const l = Da(hs()), d = await sr(l);
    let y, f, p;
    try {
      ({ recoveryPrivateKey: y, capsuleKey: f } = Wn(d)), p = c ? e.everydayPrivateKey : Bn(d);
    } finally {
      _(d);
    }
    const v = !c, h = D(32), g = D(32);
    let m = !1;
    try {
      const k = E(y), b = E(p), P = T(yo()), M = {
        schema: Ht,
        account_id: P,
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
      }, $ = await hr({
        recoveryPrivateKey: y,
        capsuleKey: f,
        payload: M
      }), X = new S(e.vaultRelayUrls, {
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
      const Zt = {
        schema: zt,
        account_id: P,
        generation: 0,
        operational_private_key: T(p),
        operational_public_key: b,
        recovery_public_key: k,
        recovery_capsule_event: $,
        connection_vault_root: T(h),
        created_at: n,
        vault_relay_hints: De(e.vaultRelayUrls),
        protocol: {
          password_kdf: vr,
          capsule_encryption: Oe,
          recovery_derivation: Le,
          ...xe(v)
        }
      }, Rr = await pr({
        locatorPrivateKey: r,
        capsuleKey: o,
        payload: Zt
      }), Cr = new S(e.vaultRelayUrls, {
        authPrivateKey: r
      });
      let en;
      try {
        en = await _e(Cr, Rr, {
          dTag: qe,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        Cr.closeAll();
      }
      if (!en.success)
        throw new ie("Registration did not reach the required credential acknowledgement and readback quorum. Please retry, or add more vault relays.");
      return m = !0, {
        normalizedLoginName: t,
        recoveryPhrase: l,
        everydayPrivateKey: p,
        everydayPublicKey: b,
        recoveryPublicKey: k,
        locatorPublicKey: i,
        accountId: P,
        imported: c,
        everydayKeyDerived: v,
        connectionVaultRoot: h,
        vaultSudoKey: g,
        credentialEvent: Rr,
        recoveryEvent: $,
        credentialPublish: en,
        recoveryPublish: pe
      };
    } finally {
      _(y, f), m || (c || _(p), _(h, g));
    }
  } finally {
    _(r, o);
  }
}
async function Pc(e) {
  const { nsecOrHex: t, ...n } = e, r = oi(t);
  return ri({ ...n, everydayPrivateKey: r });
}
function oi(e) {
  const t = e.trim();
  let n;
  if (t.startsWith("nsec1"))
    n = ns(t);
  else if (/^[0-9a-fA-F]{64}$/u.test(t))
    n = uo(t.toLowerCase());
  else
    throw new ie("Enter a valid nsec (nsec1…) or a 64-character hex private key.");
  if (!Gn(n))
    throw new ie("The provided key is not a valid secp256k1 private key.");
  return n;
}
class ii {
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
async function Sc(e) {
  const t = Qt(e.loginName), { locatorPrivateKey: n, capsuleKey: r } = await it(e.password, t), o = E(n), i = new S(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  try {
    const s = await dt(i, o, r, e.timeoutMs);
    if (!s.quorumMet)
      throw new Ee("quorum-not-met");
    if (!s.best)
      throw new Ee(s.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
    const a = s.best.payload, c = e.store ?? new ii(), l = await ur(c, a.operational_public_key), d = a.generation < l.generation;
    if (d && !e.acknowledgeRollback)
      throw new Bo(l.generation, a.generation);
    const y = d ? `This device previously saw credential generation ${l.generation}, but the accepted capsule is generation ${a.generation}. Relays may be serving stale data, or an old capsule is being replayed.` : void 0;
    await jo(c, a.operational_public_key, {
      generation: a.generation
    });
    const f = s.relayDisagreement ? 'Configured relays returned different credential capsules as "latest" for this account. Some relays may be stale, censored, or malicious.' : void 0;
    return {
      everydayPrivateKey: O(a.operational_private_key),
      everydayPublicKey: a.operational_public_key,
      recoveryPublicKey: a.recovery_public_key,
      accountId: a.account_id,
      generation: a.generation,
      everydayKeyDerived: ni(a),
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
function Br(e) {
  return e.filter((t) => R(t)).sort((t, n) => n.created_at - t.created_at)[0];
}
async function Kc(e) {
  if (!Do(e.phrase))
    throw new se("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await sr(e.phrase), { recoveryPrivateKey: n, capsuleKey: r } = Wn(t), o = Bn(t), i = E(o);
  _(t, o);
  const s = E(n), a = new S(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  let c;
  try {
    c = await ei(a, s, r, e.timeoutMs);
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
            payload: await Xo(b, r)
          });
        } catch (P) {
          h.push({
            event: b,
            payload: null,
            error: P.message
          });
        }
    const g = /* @__PURE__ */ new Map();
    for (const b of [...c.candidates, ...h])
      g.set(b.event.id, b);
    const m = [...g.values()].sort((b, P) => P.event.created_at - b.event.created_at), k = m.find((b) => b.payload !== null) ?? null;
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
  const l = c.best.payload, d = gc(c.candidates), y = O(l.operational_private_key), f = l.operational_public_key, { generalRelays: p, dmRelays: v } = await si(f, [...e.discoveryRelayUrls, ...l.vault_relay_hints], e.timeoutMs);
  return {
    everydayPrivateKey: y,
    everydayPublicKey: f,
    recoveryPrivateKey: n,
    recoveryPublicKey: s,
    recoveryCapsuleKey: r,
    accountId: l.account_id,
    currentRecoveryEvent: c.best.event,
    currentRecoveryPayload: l,
    generalRelays: p,
    dmRelays: v,
    chainWarning: d.consistent ? void 0 : d.warning,
    everydayKeyDerived: f === i
  };
}
async function si(e, t, n) {
  const r = new S([...new Set(t)]);
  let o = [], i = [];
  try {
    const s = await r.queryQuorum({ kinds: [ot], authors: [e], limit: 5 }, n), a = Br(s.outcomes.flatMap((d) => d.events));
    a && (o = sc(a));
    const c = await r.queryQuorum({ kinds: [Fn], authors: [e], limit: 5 }, n), l = Br(c.outcomes.flatMap((d) => d.events));
    l && (i = ac(l));
  } finally {
    r.closeAll();
  }
  return { generalRelays: o, dmRelays: i };
}
async function ai(e) {
  if (!Do(e))
    throw new se("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await sr(e);
  try {
    const { recoveryPrivateKey: n, capsuleKey: r } = Wn(t), o = Bn(t);
    return {
      recoveryPrivateKey: n,
      recoveryPublicKey: E(n),
      capsuleKey: r,
      everydayPrivateKey: o,
      everydayPublicKey: E(o)
    };
  } finally {
    _(t);
  }
}
async function ci(e, t, n) {
  const r = new S(t, {
    authPrivateKey: e.recoveryPrivateKey
  });
  let o;
  try {
    o = await ei(r, e.recoveryPublicKey, e.capsuleKey, n);
  } finally {
    r.closeAll();
  }
  if (!o.quorumMet)
    throw new Ee("quorum-not-met");
  if (o.best)
    throw new se("This account's recovery capsule is still on the relays. Use normal recovery instead of a rebuild.");
  return o.candidates.length > 0 ? Math.max(...o.candidates.map((i) => i.event.created_at)) : null;
}
async function Ac(e) {
  const t = await ai(e.phrase);
  try {
    await ci(t, e.vaultRelayUrls, e.timeoutMs);
    const n = new S([
      .../* @__PURE__ */ new Set([...e.discoveryRelayUrls, ...e.vaultRelayUrls])
    ]);
    try {
      const o = (await n.queryQuorum({
        kinds: [It, ot],
        authors: [t.everydayPublicKey],
        limit: 10
      }, e.timeoutMs)).outcomes.flatMap((i) => i.events).filter((i) => i.pubkey === t.everydayPublicKey && R(i));
      return {
        everydayPublicKey: t.everydayPublicKey,
        profileFound: o.some((i) => i.kind === It),
        relayListFound: o.some((i) => i.kind === ot)
      };
    } finally {
      n.closeAll();
    }
  } finally {
    _(t.recoveryPrivateKey, t.capsuleKey, t.everydayPrivateKey);
  }
}
async function Rc(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = await ai(e.phrase);
  let r = !1;
  try {
    const o = await ci(n, e.vaultRelayUrls, e.timeoutMs), i = {
      schema: Ht,
      account_id: T(yo()),
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
    }, s = await hr({
      recoveryPrivateKey: n.recoveryPrivateKey,
      capsuleKey: n.capsuleKey,
      payload: i
    }), a = new S(e.vaultRelayUrls, {
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
    const { generalRelays: l, dmRelays: d } = await si(n.everydayPublicKey, [...e.discoveryRelayUrls, ...e.vaultRelayUrls], e.timeoutMs);
    return r = !0, {
      everydayPrivateKey: n.everydayPrivateKey,
      everydayPublicKey: n.everydayPublicKey,
      recoveryPrivateKey: n.recoveryPrivateKey,
      recoveryPublicKey: n.recoveryPublicKey,
      recoveryCapsuleKey: n.capsuleKey,
      accountId: i.account_id,
      currentRecoveryEvent: s,
      currentRecoveryPayload: i,
      generalRelays: l,
      dmRelays: d,
      everydayKeyDerived: !0
    };
  } finally {
    r || _(n.recoveryPrivateKey, n.capsuleKey, n.everydayPrivateKey);
  }
}
async function Cc(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = Qt(e.newLoginName), { recovered: r } = e, o = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root,
    vault_sudo_key: r.currentRecoveryPayload.vault_sudo_key
  } : {}, i = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root
  } : {}, { locatorPrivateKey: s, capsuleKey: a } = await it(e.newPassword, n);
  try {
    const c = E(s), l = new S(e.vaultRelayUrls, {
      authPrivateKey: s
    });
    let d;
    try {
      d = await dt(l, c, a, e.timeoutMs);
    } finally {
      l.closeAll();
    }
    if (!d.quorumMet)
      throw new se("Couldn't verify the new login name and password aren't already registered. Please retry, or add more vault relays.");
    const y = d.best?.payload ?? null, f = y !== null && y.account_id === r.accountId && y.operational_public_key === r.everydayPublicKey && y.recovery_public_key === r.recoveryPublicKey && y.generation === 0 && y.recovery_capsule_event.id === r.currentRecoveryEvent.id;
    if (d.candidates.length > 0 && !f)
      throw new se("Another account is already registered with that login name and password. Pick a different one.");
    const p = r.currentRecoveryPayload.recovery_generation + 1, v = {
      schema: Ht,
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
    }, h = await hr({
      recoveryPrivateKey: r.recoveryPrivateKey,
      capsuleKey: r.recoveryCapsuleKey,
      payload: v
    }), g = new S(e.vaultRelayUrls, {
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
      schema: zt,
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
        password_kdf: vr,
        capsule_encryption: Oe,
        recovery_derivation: Le,
        ...xe(r.everydayKeyDerived)
      }
    }, b = await pr({
      locatorPrivateKey: s,
      capsuleKey: a,
      payload: k
    }), P = new S(e.vaultRelayUrls, {
      authPrivateKey: s
    });
    let M;
    try {
      M = await _e(P, b, {
        dTag: qe,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      P.closeAll();
    }
    if (!M.success)
      throw new se("Could not publish the new credential capsule to enough relays. Please retry.");
    return e.store && await nc(e.store, r.everydayPublicKey, {
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
    _(s, a);
  }
}
async function Nc(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = Qt(e.loginName), r = await it(e.oldPassword, n), o = E(r.locatorPrivateKey), i = new S(e.vaultRelayUrls, {
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
  const a = s.best.payload, c = s.best.event, l = e.store ?? new ii(), d = await ur(l, a.operational_public_key);
  if (a.generation < d.generation && !e.acknowledgeRollback)
    throw new Bo(d.generation, a.generation);
  const y = await it(e.newPassword, n), f = E(y.locatorPrivateKey), p = new S(e.vaultRelayUrls, {
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
    throw new Wo("Another account is already registered with this login name and the new password you chose. Pick a different new password.");
  const h = a.generation + 1, g = {
    schema: zt,
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
      password_kdf: vr,
      capsule_encryption: Oe,
      recovery_derivation: Le,
      ...xe(ni(a))
    }
  }, m = await pr({
    locatorPrivateKey: y.locatorPrivateKey,
    capsuleKey: y.capsuleKey,
    payload: g
  }), k = new S(e.vaultRelayUrls, {
    authPrivateKey: y.locatorPrivateKey
  }), b = await _e(k, m, {
    dTag: qe,
    minAcks: e.minAcknowledgements,
    timeoutMs: e.timeoutMs
  });
  if (k.closeAll(), !b.success)
    throw new ie("The new credential capsule did not reach the required relay acknowledgement and readback quorum. Your existing password still works; nothing was changed. Please retry.");
  const P = vc({
    oldLocatorPrivateKey: r.locatorPrivateKey,
    createdAt: ut(c.created_at, t)
  }), M = _o({
    privateKey: r.locatorPrivateKey,
    eventIdToDelete: c.id,
    deletedEventKind: L,
    createdAt: t
  }), $ = new S(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  }), [X, pe] = await Promise.all([
    $.publishAll(P, e.timeoutMs),
    $.publishAll(M, e.timeoutMs)
  ]);
  return $.closeAll(), await jo(l, a.operational_public_key, {
    generation: h
  }), {
    normalizedLoginName: n,
    oldLocatorPublicKey: o,
    newLocatorPublicKey: f,
    newGeneration: h,
    recoveryPublicKey: a.recovery_public_key,
    recoveryCapsuleEvent: a.recovery_capsule_event,
    newCredentialEvent: m,
    tombstoneEvent: P,
    deletionRequestEvent: M,
    newCredentialPublish: b,
    tombstoneAcknowledgedCount: x(X),
    deletionAcknowledgedCount: x(pe)
  };
}
const Tc = "bitlogin/connection-vault-root/v1", Mc = "bitlogin/connection-vault-signing/v1", Ic = "bitlogin/connection-record-encryption/v1", Oc = "bitlogin/connection-vault-personal/v1", _n = "bitlogin:connection:";
function Lc(e) {
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Hn(fo(Tc), e);
}
function Ve(e) {
  return vs(e, Mc).scalar;
}
function li(e) {
  const t = Ve(e);
  try {
    return E(t);
  } finally {
    _(t);
  }
}
function Dc(e, t) {
  if (t.length !== 32)
    throw new Error("vault_sudo_key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Hn(fo(Oc), Jn(e, t));
}
function ui(e, t) {
  const n = Xt(t);
  return pt(e, Jn(q(Ic), new Uint8Array([0]), n), 32);
}
function xc() {
  return T(D(16));
}
function Xt(e) {
  const t = O(e);
  if (t.length !== 16)
    throw new Error("connection_id must decode to exactly 16 bytes (§CV7).");
  return t;
}
function di(e) {
  return Xt(e), `${_n}${e}`;
}
function yi(e) {
  if (!e.startsWith(_n))
    return null;
  const t = e.slice(_n.length);
  try {
    return Xt(t), t;
  } catch {
    return null;
  }
}
class ae {
  privateKey;
  publicKeyHex;
  destroyed = !1;
  constructor(t) {
    this.privateKey = t, this.publicKeyHex = E(t);
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
    return this.assertAlive(), bn(be(this.privateKey, t), n);
  }
  nip44Decrypt(t, n) {
    return this.assertAlive(), zn(be(this.privateKey, t), n);
  }
  /** Legacy relative to nip44Encrypt above, but still what a real NIP-07 extension exposes as
   * window.nostr.nip04.encrypt -- implemented for drop-in parity. */
  nip04Encrypt(t, n) {
    return this.assertAlive(), Xa(this.privateKey, t, n);
  }
  nip04Decrypt(t, n) {
    return this.assertAlive(), ec(this.privateKey, t, n);
  }
  /** Best-practical secret wipe (§11.10, §21.4): overwrites the private key buffer in place. */
  destroy() {
    _(this.privateKey), this.destroyed = !0;
  }
}
const fi = "bitlogin.connection.v1", pi = "bitlogin.connection.nwc.v1", jr = 120, Uc = /* @__PURE__ */ new Set(["active", "suspended", "deleted"]), qc = /* @__PURE__ */ new Set(["connectable", "personal"]);
class Ce extends Error {
  constructor(t) {
    super(t), this.name = "ConnectionRecordError";
  }
}
function hi(e, t) {
  return q(`bitlogin|connection-record|v1|${e}|30078|${t}`);
}
function vi(e) {
  const t = e, n = (i) => {
    throw new Ce(i);
  };
  (!t || typeof t != "object") && n("Connection record must be an object."), t.schema !== fi && n("Unsupported connection record schema (§CV8.3)."), typeof t.connection_id != "string" && n("connection_id must be a string (§CV7)."), (typeof t.connection_type != "string" || t.connection_type.length === 0) && n("connection_type must be a non-empty string (§CV8.3)."), qc.has(t.tier) || n("tier must be connectable or personal."), Uc.has(t.state) || n("state must be active, suspended, or deleted (§CV8.3)."), (typeof t.label != "string" || t.label.length > jr) && n(`label must be a string of at most ${jr} characters.`), (!Number.isInteger(t.created_at) || !Number.isInteger(t.updated_at)) && n("created_at and updated_at must be integers (§CV8.3).");
  const r = t.credential;
  (!r || typeof r != "object" || typeof r.schema != "string") && n("credential must be an object naming its profile schema (§CV8.3).");
  const o = t.application_binding;
  (!o || typeof o != "object" || o.origin !== null && typeof o.origin != "string" || o.app_pubkey !== null && typeof o.app_pubkey != "string") && n("application_binding must carry origin and app_pubkey (string or null)."), t.notes !== null && typeof t.notes != "string" && n("notes must be a string or null.");
}
async function an(e) {
  vi(e.record);
  const t = Ve(e.vaultPrk), n = E(t), r = di(e.record.connection_id), o = ui(e.recordPrk, e.record.connection_id), i = await dr(e.record, o, hi(n, r));
  return U({
    pubkey: n,
    created_at: ut(e.previousCreatedAt, e.now),
    kind: L,
    tags: [["d", r]],
    content: JSON.stringify(i)
  }, t);
}
async function $c(e, t, n) {
  if (!R(e))
    throw new Ce("Connection record event has an invalid id or signature.");
  const r = E(Ve(t));
  if (e.pubkey !== r)
    throw new Ce("Connection record event is not signed by this vault's identity.");
  const o = $e(e, "d") ?? "", i = yi(o);
  if (i === null)
    throw new Ce("Connection record event has a malformed d tag.");
  const s = JSON.parse(e.content), a = hi(e.pubkey, o), c = [
    { prk: t, tier: "connectable" },
    ...n ? [{ prk: n, tier: "personal" }] : []
  ];
  for (const l of c) {
    let d;
    try {
      d = await yr(s, ui(l.prk, i), a);
    } catch {
      continue;
    }
    if (vi(d), d.connection_id !== i)
      throw new Ce("Connection record id does not match its d tag.");
    if (d.tier !== l.tier)
      throw new Ce("Connection record tier does not match the key that decrypted it.");
    return { record: d, tier: l.tier, event: e };
  }
  return null;
}
function Vc(e, t) {
  return {
    ...e,
    state: "deleted",
    credential: { schema: e.credential.schema },
    notes: null,
    updated_at: t
  };
}
const $t = /^[0-9a-f]{64}$/u;
class Z extends Error {
  constructor(t) {
    super(t), this.name = "NwcParseError";
  }
}
function Jr(e) {
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
  if (!$t.test(r))
    throw new Z("The NWC URI's wallet service pubkey is not 64-char hex.");
  const o = [], i = [];
  let s = null, a = null;
  for (const [c, l] of n.searchParams.entries())
    if (c === "relay") {
      if (!ht(l))
        throw new Z("An NWC relay must use secure WebSockets, except for an explicit loopback development endpoint.");
      o.push(l);
    } else if (c === "secret") {
      const d = l.toLowerCase();
      if (!$t.test(d))
        throw new Z("The NWC URI's secret is not a 64-char hex client key.");
      s = d;
    } else c === "lud16" ? a = l : i.push([c, l]);
  if (o.length === 0)
    throw new Z("The NWC URI names no relay.");
  if (s === null)
    throw new Z("The NWC URI carries no secret.");
  return {
    schema: pi,
    wallet_pubkey: r,
    relays: o,
    secret: s,
    lud16: a,
    extra_params: i
  };
}
function Fc(e) {
  wi(e);
  const t = new URLSearchParams();
  for (const n of e.relays)
    t.append("relay", n);
  t.append("secret", e.secret), e.lud16 !== null && t.append("lud16", e.lud16);
  for (const [n, r] of e.extra_params)
    t.append(n, r);
  return `nostr+walletconnect://${e.wallet_pubkey}?${t.toString()}`;
}
function Wc(e, t) {
  return e.wallet_pubkey === t.wallet_pubkey && e.secret === t.secret;
}
function wi(e) {
  const t = e, n = (r) => {
    throw new Z(r);
  };
  (!t || typeof t != "object") && n("NWC credential must be an object."), t.schema !== pi && n("NWC credential has the wrong schema."), (typeof t.wallet_pubkey != "string" || !$t.test(t.wallet_pubkey)) && n("NWC credential wallet_pubkey must be 64-char lowercase hex."), (!Array.isArray(t.relays) || t.relays.length === 0 || t.relays.some((r) => typeof r != "string")) && n("NWC credential must name at least one relay."), t.relays.some((r) => !ht(r)) && n("NWC relays must use secure WebSockets, except for explicit loopback development endpoints."), (typeof t.secret != "string" || !$t.test(t.secret)) && n("NWC credential secret must be 64-char lowercase hex."), t.lud16 !== null && typeof t.lud16 != "string" && n("NWC credential lud16 must be a string or null."), (!Array.isArray(t.extra_params) || t.extra_params.some((r) => !Array.isArray(r) || r.length !== 2 || typeof r[0] != "string" || typeof r[1] != "string")) && n("NWC credential extra_params must be [key, value] string pairs.");
}
const Bc = "bitlogin:vault-hwm:v2:", jc = "bitlogin/vault-hwm-index/v2", gi = "bitlogin/vault-hwm-encryption/v2", Jc = /^[0-9a-f]{64}$/u;
class ce extends Error {
  constructor() {
    super("The local Connection Vault rollback marker is invalid or has been tampered with."), this.name = "RecordHighWaterMarkError";
  }
}
function wr(e) {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return Number.isInteger(t.createdAt) && (t.createdAt ?? -1) >= 0 && typeof t.eventId == "string" && Jc.test(t.eventId);
}
function mi(e, t) {
  Xt(t);
  const n = pt(e, jc, 32), r = q(t);
  try {
    return `${Bc}${T(co(lo, n, r))}`;
  } finally {
    _(n, r);
  }
}
function Gc(e, t) {
  return `bitlogin:vault-hwm:${li(e)}:${t}`;
}
async function Hc(e, t, n) {
  const r = pt(e, gi, 32), o = q(JSON.stringify(n)), i = q(t);
  try {
    const s = await Co(r, o, i), a = {
      v: 2,
      nonce: T(s.nonce),
      ciphertext: T(s.ciphertext)
    };
    return JSON.stringify(a);
  } finally {
    _(r, o, i);
  }
}
async function zc(e, t, n) {
  const r = pt(e, gi, 32), o = q(t);
  let i;
  try {
    const s = JSON.parse(n);
    if (s.v !== 2 || typeof s.nonce != "string" || typeof s.ciphertext != "string")
      throw new ce();
    i = await No(r, O(s.nonce), O(s.ciphertext), o);
    const a = JSON.parse(jn(i));
    if (!wr(a))
      throw new ce();
    return a;
  } catch (s) {
    throw s instanceof ce ? s : new ce();
  } finally {
    _(r, o), i && _(i);
  }
}
async function bi(e, t, n, r) {
  const o = mi(t, n);
  await e.set(o, await Hc(t, o, r));
}
async function ki(e, t, n) {
  const r = mi(t, n), o = await e.get(r);
  if (o !== void 0)
    return zc(t, r, o);
  const i = Gc(t, n), s = await e.get(i);
  if (s === void 0)
    return null;
  try {
    const a = JSON.parse(s);
    if (!wr(a))
      throw new ce();
    return await bi(e, t, n, a), await e.delete(i), a;
  } catch (a) {
    throw a instanceof ce ? a : new ce();
  }
}
async function Ei(e, t, n, r) {
  if (!wr(r))
    throw new ce();
  const o = await ki(e, t, n);
  o && gn({ created_at: r.createdAt, id: r.eventId }, { created_at: o.createdAt, id: o.eventId }) <= 0 || await bi(e, t, n, r);
}
async function Qc(e) {
  const t = Ve(e.vaultPrk), n = new S(e.relayUrls, { authPrivateKey: t });
  let r;
  try {
    r = await _e(n, e.event, {
      dTag: di(e.connectionId),
      minAcks: e.minAcknowledgements,
      // The readback bar follows the ack bar: a caller publishing to fewer
      // relays (a targeted repair, a test) has already lowered its quorum.
      minReadbacks: e.minAcknowledgements,
      timeoutMs: e.timeoutMs
    });
  } finally {
    n.closeAll(), _(t);
  }
  return r.success && await Ei(e.store, e.vaultPrk, e.connectionId, {
    createdAt: e.event.created_at,
    eventId: e.event.id
  }), r;
}
const Gr = 500;
async function Yc(e) {
  const t = Ve(e.vaultPrk), n = E(t), r = new S(e.relayUrls, { authPrivateKey: t });
  let o;
  try {
    o = await r.queryQuorum({ kinds: [L], authors: [n], limit: Gr }, e.timeoutMs);
  } finally {
    r.closeAll(), _(t);
  }
  const i = o.outcomes.some((l) => l.events.length >= Gr), s = /* @__PURE__ */ new Map();
  for (const l of o.outcomes.flatMap((d) => d.events)) {
    if (!R(l) || l.pubkey !== n)
      continue;
    const d = yi($e(l, "d") ?? "");
    if (d === null)
      continue;
    const y = s.get(d);
    (!y || gn(l, y) > 0) && s.set(d, l);
  }
  const a = /* @__PURE__ */ new Map(), c = [];
  for (const [l, d] of s) {
    const y = await ki(e.store, e.vaultPrk, l);
    if (y !== null && gn(d, {
      created_at: y.createdAt,
      id: y.eventId
    }) < 0) {
      c.push(l);
      continue;
    }
    a.set(l, d), await Ei(e.store, e.vaultPrk, l, {
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
class Xc {
  vaultPrk;
  personalPrk = null;
  destroyed = !1;
  connectionVaultRoot;
  vaultPublicKey;
  constructor(t) {
    this.connectionVaultRoot = t.slice(), this.vaultPrk = Lc(this.connectionVaultRoot), this.vaultPublicKey = li(this.vaultPrk);
  }
  get sudoActive() {
    return this.personalPrk !== null;
  }
  /** Opens a sudo window. Consumes (wipes) the caller's sudo key copy. */
  enableSudo(t) {
    this.endSudo(), this.personalPrk = Dc(this.connectionVaultRoot, t), _(t);
  }
  /** Closes the sudo window and wipes the personal-tier key material. */
  endSudo() {
    this.personalPrk && _(this.personalPrk), this.personalPrk = null;
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
    this.endSudo(), _(this.vaultPrk, this.connectionVaultRoot), this.destroyed = !0;
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
      schema: fi,
      connection_id: xc(),
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
    }, o = await an({
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
    }, s = await an({
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
    const r = n ?? Math.floor(Date.now() / 1e3), o = Vc(t.record, r), i = await an({
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
    return this.destroyed ? Promise.reject(new Error("This vault session was destroyed; create a new one from the account's root.")) : $c(t, this.vaultPrk, this.personalPrk ?? void 0);
  }
  /** §CV11 step 3: a NIP-09 deletion request for a replaced record event,
   *  signed by the vault identity. Best-effort by contract — the encrypted
   *  tombstone is the durable part of a deletion, this is the courtesy ask. */
  buildDeletionRequest(t, n) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    return _o({
      privateKey: Ve(this.vaultPrk),
      eventIdToDelete: t,
      deletedEventKind: L,
      createdAt: n ?? Math.floor(Date.now() / 1e3)
    });
  }
  publish(t) {
    return Qc({ vaultPrk: this.vaultPrk, ...t });
  }
  fetchEvents(t) {
    return Yc({ vaultPrk: this.vaultPrk, ...t });
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
const Zc = "bitlogin", te = "kv", W = "device-keys", el = 2;
function tl() {
  return new Promise((e, t) => {
    const n = indexedDB.open(Zc, el);
    n.onupgradeneeded = () => {
      const r = n.result;
      r.objectStoreNames.contains(te) || r.createObjectStore(te), r.objectStoreNames.contains(W) || r.createObjectStore(W);
    }, n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
  });
}
class nl {
  dbPromise = null;
  db() {
    return this.dbPromise || (this.dbPromise = tl()), this.dbPromise;
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
const wt = "bitlogin:session:v1", gr = "bitlogin:session-device-key:v1";
function _i(e) {
  return !!(e && typeof e == "object" && e.v === 3 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function Pi(e, t) {
  if (e.length !== 32) throw new Error("Not a lock key.");
  return crypto.subtle.importKey("raw", He(e), "AES-GCM", !1, [t]);
}
async function Nt(e, t = wt) {
  try {
    const n = await e.get(t);
    if (!n) return "none";
    const r = JSON.parse(n);
    return _i(r) ? "locked" : Si(r) ? "open" : "none";
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
function Si(e) {
  return !!(e && typeof e == "object" && e.v === 2 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function Pn(e, t, n, r = wt) {
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
    const i = await e.getOrCreateDeviceKey(gr), s = crypto.getRandomValues(new Uint8Array(12)), a = new TextEncoder().encode(JSON.stringify(o)), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: s }, i, a), l = {
      v: 2,
      iv: bt(s),
      ciphertext: bt(new Uint8Array(c))
    };
    if (!n) {
      await e.set(r, JSON.stringify(l));
      return;
    }
    const d = crypto.getRandomValues(new Uint8Array(12)), y = await crypto.subtle.encrypt({ name: "AES-GCM", iv: d }, await Pi(n, "encrypt"), new TextEncoder().encode(JSON.stringify(l))), f = { v: 3, iv: bt(d), ciphertext: bt(new Uint8Array(y)) };
    await e.set(r, JSON.stringify(f));
  } catch {
    n && await e.delete(r).catch(() => {
    });
  }
}
async function Ki(e, t, n = wt) {
  let r;
  try {
    r = await e.get(n);
  } catch {
    return null;
  }
  if (!r) return null;
  try {
    let o = JSON.parse(r);
    if (_i(o)) {
      if (!t) return null;
      const c = await crypto.subtle.decrypt({ name: "AES-GCM", iv: He(kt(o.iv)) }, await Pi(t, "decrypt"), He(kt(o.ciphertext)));
      o = JSON.parse(new TextDecoder().decode(c));
    }
    if (!Si(o) || typeof e.getOrCreateDeviceKey != "function")
      return await e.delete(n), null;
    const i = await e.getOrCreateDeviceKey(gr), s = await crypto.subtle.decrypt(
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
const rl = "bitlogin:kept-session:v1:", F = (e) => rl + e;
async function H(e, t = wt) {
  try {
    await e.delete(t);
  } catch {
  }
}
async function Hr(e) {
  try {
    await e.delete(wt), typeof e.deleteDeviceKey == "function" && await e.deleteDeviceKey(gr);
  } catch {
  }
}
const ol = 27300, Ue = {
  /** The longest address a picture may have. */
  pictureChars: 300,
  /** The most that is said about someone, in their own words. */
  aboutChars: 280,
  /** How long a pass made here lasts, in seconds. NSWP's verifier allows twelve hours; this gives four. */
  passSec: 4 * 3600,
  /** A profile's content is not read past this many characters. */
  contentChars: 2e4
};
function il(e) {
  if (typeof e != "string" || e.length > Ue.pictureChars) return "";
  try {
    const t = new URL(e);
    return t.protocol !== "https:" || t.username || t.password || !t.hostname.includes(".") ? "" : t.href.length <= Ue.pictureChars ? t.href : "";
  } catch {
    return "";
  }
}
const sl = (e) => e <= 31 || e >= 127 && e <= 159 || e >= 8203 && e <= 8207 || e >= 8232 && e <= 8239 || e >= 8288 && e <= 8303 || e === 65279;
function al(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, Ue.aboutChars * 8).normalize("NFC")) t += sl(n.codePointAt(0)) ? " " : n;
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, Ue.aboutChars).join("").trim();
}
function ye(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, n = at(t.name), r = il(t.picture), o = al(t.about);
  return !n && !r && !o ? null : { ...n ? { name: n } : {}, ...r ? { picture: r } : {}, ...o ? { about: o } : {} };
}
function cl(e, t) {
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
function zr(e, t) {
  let n = null;
  for (const r of e)
    !R(r) || r.kind !== 0 || r.pubkey !== t || n && r.created_at <= n.at || (n = { at: r.created_at, profile: cl(r, t) });
  return n?.profile ?? null;
}
const ll = /^[0-9a-f]{64}$/u;
function ul(e) {
  const t = Lt(e.site);
  if (!t || typeof e.session != "string" || !ll.test(e.session) || e.session === e.identity) return null;
  const n = Math.floor(e.nowSeconds), r = ye(e.profile) ?? {}, o = [
    ["nswp:session", e.session],
    ["nswp:origin", t],
    ["expiration", String(n + Ue.passSec)]
  ];
  return r.name && o.push(["name", r.name]), r.picture && o.push(["picture", r.picture]), r.about && o.push(["about", r.about]), { kind: ol, created_at: n, tags: o, content: "" };
}
const Sn = "bitlogin:kept-accounts:v1", Vt = {
  /** No more accounts than this are kept on one device. The one least lately used goes first. */
  accounts: 8
}, dl = /^[0-9a-f]{64}$/u;
function mr(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (typeof t.pubkey != "string" || !dl.test(t.pubkey)) return null;
  const n = ye({ name: t.name, picture: t.picture, about: t.about }) ?? {}, r = typeof t.at == "number" && Number.isFinite(t.at) && t.at > 0 ? Math.floor(t.at) : 0;
  let o;
  try {
    o = Qe(t.pubkey);
  } catch {
    return null;
  }
  return { pubkey: t.pubkey, npub: o, ...n, at: r };
}
function yl(e) {
  if (!e) return [];
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return [];
  }
  if (!Array.isArray(t)) return [];
  const n = /* @__PURE__ */ new Set(), r = [];
  for (const o of t.slice(0, Vt.accounts * 2)) {
    const i = mr(o);
    !i || n.has(i.pubkey) || (n.add(i.pubkey), r.push(i));
  }
  return r.sort((o, i) => i.at - o.at).slice(0, Vt.accounts);
}
function fl(e, t, n, r = {}) {
  const o = e.find((a) => a.pubkey === t), i = mr({
    pubkey: t,
    at: n,
    name: at(r.name) || o?.name,
    picture: r.picture ?? o?.picture,
    about: r.about ?? o?.about
  });
  if (!i) return { list: [...e], dropped: [] };
  const s = [i, ...e.filter((a) => a.pubkey !== t)];
  return { list: s.slice(0, Vt.accounts), dropped: s.slice(Vt.accounts).map((a) => a.pubkey) };
}
function pl(e, t, n) {
  return e.map((r) => r.pubkey === t ? mr({ ...r, name: at(n.name) || r.name, picture: n.picture ?? r.picture, about: n.about ?? r.about }) ?? r : r);
}
const Tt = (e, t) => e.filter((n) => n.pubkey !== t);
async function B(e) {
  try {
    return yl(await e.get(Sn));
  } catch {
    return [];
  }
}
async function me(e, t) {
  try {
    t.length === 0 ? await e.delete(Sn) : await e.set(Sn, JSON.stringify(t));
  } catch {
  }
}
const br = "bitlogin:lock:v1", hl = "bitlogin/lock/device/v1", vl = q("bitlogin:lock:device-wrap:v1"), J = {
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
function Ai(e) {
  if (typeof e != "string") return null;
  const t = e.normalize("NFKC"), n = [...t].length;
  return n >= J.pinMin && n <= J.pinMax ? q(t) : null;
}
async function Ri(e, t) {
  const n = D(12), r = await crypto.subtle.importKey("raw", Me(e), "AES-GCM", !1, ["encrypt"]), o = await crypto.subtle.encrypt({ name: "AES-GCM", iv: Me(n) }, r, Me(t));
  return { iv: T(n), wrapped: T(new Uint8Array(o)) };
}
async function Ci(e, t) {
  try {
    const n = await crypto.subtle.importKey("raw", Me(e), "AES-GCM", !1, ["decrypt"]), r = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: Me(O(t.iv)) }, n, Me(O(t.wrapped))));
    return r.length === 32 ? r : null;
  } catch {
    return null;
  }
}
const Ni = (e) => pt(Hn(vl, e), hl, 32), Qr = (e) => !!e && typeof e == "object" && typeof e.iv == "string" && typeof e.wrapped == "string";
async function fe(e) {
  let t;
  try {
    t = await e.get(br);
  } catch {
    return null;
  }
  if (!t) return null;
  try {
    const n = JSON.parse(t);
    return n.v !== 1 || typeof n.tries != "number" || !Number.isInteger(n.tries) || n.tries < 0 || !Qr(n.pin) || typeof n.pin.salt != "string" || n.device !== void 0 && (!Qr(n.device) || typeof n.device.credentialId != "string") ? null : { v: 1, tries: n.tries, pin: n.pin, ...n.device ? { device: n.device } : {} };
  } catch {
    return null;
  }
}
const yt = (e, t) => e.set(br, JSON.stringify(t));
async function tt(e) {
  try {
    await e.delete(br);
  } catch {
  }
}
async function wl(e, t, n) {
  const r = Ai(t);
  if (!r) throw new Error(`A PIN is ${J.pinMin} to ${J.pinMax} characters.`);
  const o = n ? n.slice() : D(32), i = D(16), s = await ao(r, i);
  try {
    const a = n ? await fe(e) : null;
    await yt(e, { v: 1, tries: 0, pin: { salt: T(i), ...await Ri(s, o) }, ...a?.device ? { device: a.device } : {} });
  } finally {
    s.fill(0), r.fill(0);
  }
  return o;
}
async function gl(e, t, n, r) {
  const o = await fe(e);
  if (!o) throw new Error("The lock is not on.");
  if (r.length !== 32 || !/^[A-Za-z0-9_-]{8,1400}$/u.test(n)) throw new Error("That is not a device unlock.");
  const i = Ni(r);
  try {
    await yt(e, { ...o, device: { credentialId: n, ...await Ri(i, t) } });
  } finally {
    i.fill(0);
  }
}
async function ml(e) {
  const t = await fe(e);
  t?.device && await yt(e, { v: 1, tries: t.tries, pin: t.pin });
}
async function Ti(e, t) {
  const n = await fe(e);
  if (!n) return { ok: !1, left: 0, removed: !0 };
  const r = n.tries + 1;
  await yt(e, { ...n, tries: r });
  const o = await t(n);
  return o ? (await yt(e, { ...n, tries: 0 }), { ok: !0, lockKey: o }) : r >= J.tries ? (await tt(e), { ok: !1, left: 0, removed: !0 }) : { ok: !1, left: J.tries - r, removed: !1 };
}
function bl(e, t) {
  return Ti(e, async (n) => {
    const r = Ai(t);
    if (!r) return null;
    const o = await ao(r, O(n.pin.salt));
    try {
      return await Ci(o, n.pin);
    } finally {
      o.fill(0), r.fill(0);
    }
  });
}
function kl(e, t) {
  return Ti(e, async (n) => {
    if (!n.device || t.length !== 32) return null;
    const r = Ni(t);
    try {
      return await Ci(r, n.device);
    } finally {
      r.fill(0);
    }
  });
}
const nt = "bitlogin:signer-grant:v1:", Mi = "bitlogin:signer-grant-device-key:v1", le = {
  /** The longest a site BitLogin knows is remembered, in seconds: thirty days from Allow. */
  keepSec: 720 * 3600,
  /** The longest for a site it does not know: seven days. */
  unknownKeepSec: 168 * 3600,
  /** How many recent room passes are remembered, to count them across page loads. */
  passKept: 10,
  /** How many recent signatures are remembered, to count them across page loads. */
  signedKept: 60
}, cn = (e) => e.at ?? e.until - Ii(e.site), Ii = (e) => (Q(e) ? ws(e) : _s(e) !== null) ? le.keepSec : le.unknownKeepSec, El = /^[0-9a-f]{64}$/u;
function Pe(e) {
  if (typeof e != "string" || e.length > 300 || e.includes("*")) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin === e ? t.origin : "";
  } catch {
    return "";
  }
}
const kr = (e) => Q(e) || Pe(e), Yr = (e) => btoa(Array.from(e, (t) => String.fromCharCode(t)).join("")), Xr = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), Zr = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}, _l = (e) => Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
async function ln(e, t, n) {
  const r = kr(t.site);
  if (!r || t.everydayPrivateKey.length !== 32 || typeof e.getOrCreateDeviceKey != "function" || Q(r) && t.permissions) return !1;
  const o = Math.min(Math.floor(t.until), Math.floor(n) + Ii(r));
  if (!(o > n)) return !1;
  const i = crypto.getRandomValues(new Uint8Array(12));
  try {
    const s = await e.getOrCreateDeviceKey(Mi), a = JSON.stringify({
      site: r,
      key: _l(t.everydayPrivateKey),
      until: o,
      ...t.name ? { name: t.name.slice(0, 48) } : {},
      ...ye(t.profile) ? { profile: ye(t.profile) } : {},
      // An application's public signatures are counted up to its own hourly limit, so more of them are kept.
      signed: t.signed.filter((d) => Number.isFinite(d)).slice(-(t.permissions ? Dt.public.hourly : le.signedKept)),
      ...t.permissions ? { permissions: t.permissions } : {},
      ...!t.permissions && !Q(r) && de(t.more).length ? { more: de(t.more) } : {},
      ...typeof t.at == "number" ? { at: Math.floor(t.at) } : {},
      ...Y(t.relays).length ? { relays: Y(t.relays) } : {},
      ...typeof t.checkedAt == "number" ? { checkedAt: Math.floor(t.checkedAt) } : {},
      ...typeof t.seenAt == "number" ? { seenAt: Math.floor(t.seenAt) } : {},
      ...t.signedPass?.length ? { signedPass: t.signedPass.filter((d) => Number.isFinite(d)).slice(-le.passKept) } : {},
      ...t.permissions && t.signedSensitive ? { signedSensitive: t.signedSensitive.filter((d) => Number.isFinite(d)).slice(-Dt.sensitive.hourly) } : {}
    }), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, s, new TextEncoder().encode(a)), l = { v: 1, iv: Yr(i), ciphertext: Yr(new Uint8Array(c)) };
    return await e.set(nt + r, JSON.stringify(l)), !0;
  } catch {
    return !1;
  }
}
async function Et(e, t, n) {
  const r = kr(t);
  if (!r || typeof e.getOrCreateDeviceKey != "function") return null;
  try {
    const o = await e.get(nt + r);
    if (!o) return null;
    const i = JSON.parse(o);
    if (i.v !== 1 || typeof i.iv != "string" || typeof i.ciphertext != "string") return null;
    const s = await e.getOrCreateDeviceKey(Mi), a = await crypto.subtle.decrypt({ name: "AES-GCM", iv: Zr(Xr(i.iv)) }, s, Zr(Xr(i.ciphertext))), c = JSON.parse(new TextDecoder().decode(a)), l = (p) => typeof p == "number" && Number.isFinite(p) && p > 0 ? Math.floor(p) : void 0, d = ye(c.profile), y = c.permissions === void 0 ? void 0 : Yn(c.permissions);
    if (y === null || y && (Q(r) || !Xn(r, y)))
      return await e.delete(nt + r), null;
    const f = (p, v) => Array.isArray(p) ? p.filter((h) => typeof h == "number" && Number.isFinite(h)).slice(-v) : [];
    return c.site !== r || typeof c.key != "string" || !El.test(c.key) || typeof c.until != "number" ? null : !(c.until > n) || c.until > n + le.keepSec ? (await e.delete(nt + r), null) : {
      site: r,
      everydayPrivateKey: Uint8Array.from(c.key.match(/.{2}/gu) ?? [], (p) => Number.parseInt(p, 16)),
      until: c.until,
      ...typeof c.name == "string" && c.name ? { name: c.name.slice(0, 48) } : {},
      ...d ? { profile: d } : {},
      signed: f(c.signed, y ? Dt.public.hourly : le.signedKept),
      ...f(c.signedPass, le.passKept).length ? { signedPass: f(c.signedPass, le.passKept) } : {},
      ...!y && !Q(r) && de(c.more).length ? { more: de(c.more) } : {},
      ...l(c.at) ? { at: l(c.at) } : {},
      ...Y(c.relays).length ? { relays: Y(c.relays) } : {},
      ...l(c.checkedAt) ? { checkedAt: l(c.checkedAt) } : {},
      ...l(c.seenAt) ? { seenAt: l(c.seenAt) } : {},
      ...y ? { permissions: y, signedSensitive: f(c.signedSensitive, Dt.sensitive.hourly) } : {}
    };
  } catch {
    return null;
  }
}
async function _t(e, t) {
  const n = kr(t);
  if (n)
    try {
      await e.delete(nt + n);
    } catch {
    }
}
const Oi = "bitlogin:signer-handoff:v1", Pl = /* @__PURE__ */ new Set([
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
]), Kn = /^[0-9a-f]{64}$/;
function Sl(e) {
  return Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
}
function Kl(e) {
  return Uint8Array.from(e.match(/.{2}/g) ?? [], (t) => Number.parseInt(t, 16));
}
function Al(e, t, n, r, o = {}) {
  if (!Kn.test(t)) throw new Error("The hand-off has no usable recipient key.");
  if (e.length !== 32) throw new Error("No identity is unlocked in this session.");
  let i = null;
  if (r !== void 0) {
    const f = Pe(r.site), p = Yn(r.permissions);
    if (!f || !p || !Xn(f, p)) throw new Error("That is not a permission set an application may be given.");
    i = { site: f, permissions: p };
  }
  const s = o.site === void 0 ? "" : Pe(o.site);
  if (o.site !== void 0 && (!s || i && i.site !== s)) throw new Error("The hand-off names no usable site.");
  const a = ye(o.profile), c = !!s && o.visitOnly !== !0 && o.remember === !0, l = o.family === void 0 ? "" : Q(o.family);
  if (o.family !== void 0 && (!l || i || !c || !Ne(s, l))) throw new Error("That is not a family this site may be allowed as.");
  const d = de(o.more);
  if (o.more !== void 0 && (d.length === 0 || !s || i || l)) throw new Error("That is not something this site may be let do.");
  const y = new ae(n.slice());
  try {
    const f = JSON.stringify({ v: 1, purpose: Oi, key: Sl(e), ...i ? { app: i } : {}, ...s ? { site: s } : {}, ...a ? { profile: a } : {}, ...c ? { remember: !0 } : {}, ...typeof o.at == "number" && Number.isFinite(o.at) ? { at: Math.floor(o.at) } : {}, ...Y(o.relays).length ? { relays: Y(o.relays) } : {}, ...l ? { family: l } : {}, ...d.length ? { more: d } : {} });
    return { senderPublicKey: y.getPublicKey(), payload: y.nip44Encrypt(t, f) };
  } finally {
    y.destroy();
  }
}
function Rl(e, t) {
  if (!e || !Kn.test(e.senderPublicKey) || typeof e.payload != "string")
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
  if (o.v !== 1 || o.purpose !== Oi || typeof o.key != "string" || !Kn.test(o.key))
    throw new Error("That is not a signer hand-off.");
  const i = Kl(o.key);
  try {
    E(i);
  } catch {
    throw i.fill(0), new Error("The hand-off carried an unusable key.");
  }
  const s = o.site === void 0 ? null : Pe(o.site);
  if (s === "")
    throw i.fill(0), new Error("The hand-off names no usable site.");
  const a = ye(o.profile), c = o.remember === !0 && !!s, l = typeof o.at == "number" && Number.isFinite(o.at) && o.at > 0 ? Math.floor(o.at) : null, d = Y(o.relays), y = o.family === void 0 ? null : Q(o.family);
  if (y === "" || y && (o.app !== void 0 || !c || !Ne(s, y)))
    throw i.fill(0), new Error("The hand-off names a family it cannot be kept for.");
  const f = de(o.more);
  if (o.more !== void 0 && (f.length === 0 || !s || y || o.app !== void 0))
    throw i.fill(0), new Error("The hand-off carries something this site may not be let do.");
  if (o.app === void 0) return { key: i, app: null, site: s, profile: a, remember: c, at: l, relays: d, family: y, more: f };
  const p = o.app, v = p && typeof p == "object" ? Pe(p.site) : "", h = p && typeof p == "object" ? Yn(p.permissions) : null;
  if (!v || !h || !Xn(v, h) || s && s !== v)
    throw i.fill(0), new Error("The hand-off carried a permission set that cannot be read.");
  return { key: i, app: { site: v, permissions: h }, site: v, profile: a, remember: c, at: l, relays: d, family: null, more: [] };
}
const Li = 38e3, Di = "38172", Cl = ["https://testnut.cashu.space", "https://nofees.testnut.cashu.space"], Nl = 8;
function Tl(e, t, n = 10) {
  const r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const i of e)
    if (!(i.kind !== Li || !i.tags.some((s) => s[0] === "k" && s[1] === Di)))
      for (const s of i.tags) {
        if (s[0] !== "u" || s[2] !== void 0 && s[2] !== "cashu") continue;
        const a = ct(s[1]);
        if (!a || !a.startsWith("https://") || Cl.includes(a)) continue;
        const c = o.get(i.pubkey) ?? /* @__PURE__ */ new Set();
        !c.has(a) && c.size >= Nl || (c.add(a), o.set(i.pubkey, c), (r.get(a) ?? r.set(a, /* @__PURE__ */ new Set()).get(a)).add(i.pubkey));
      }
  return [...r].map(([i, s]) => ({ mint: i, by: s.size, byFollowed: [...s].filter((a) => t.has(a)).length })).filter((i) => i.by >= 2 || i.byFollowed >= 1).sort((i, s) => s.byFollowed - i.byFollowed || s.by - i.by || i.mint.localeCompare(s.mint)).slice(0, n);
}
const An = 30078, Rn = "bitlogin-receipt:", Ft = 300, Wt = "bitlogin:receipts:v1:";
function Er(e, t) {
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
    via: Lt(n?.via) || ""
  };
}
async function xi(e, t) {
  const n = t.getPublicKey(), r = /* @__PURE__ */ new Map(), o = async (s) => {
    try {
      const a = await e.get(s);
      return a ? JSON.parse(t.nip44Decrypt(n, a)) : null;
    } catch {
      return null;
    }
  }, i = await o(Wt + n);
  for (const s of Array.isArray(i?.ids) ? i.ids.slice(0, Ft) : []) {
    if (typeof s != "string") continue;
    const a = await o(`${Wt}${n}:${s}`), c = Er(a, n);
    c && c.event.id === s && r.set(s, { ...c, saved: a?.saved === !0 });
  }
  return r;
}
async function _r(e, t, n, r) {
  const o = t.getPublicKey(), i = (s) => t.nip44Encrypt(o, JSON.stringify(s));
  for (const s of r) {
    const a = n.get(s);
    a && await e.set(`${Wt}${o}:${s}`, i(a));
  }
  await e.set(Wt + o, i({ ids: [...n.keys()] }));
}
const Cn = (e, t) => ({
  receipts: [...e.values()].map(({ event: n, title: r, via: o }) => ({ event: n, title: r, via: o })).sort((n, r) => r.event.created_at - n.event.created_at),
  offline: t,
  unsaved: [...e.values()].some((n) => !n.saved)
});
async function Ui(e, t) {
  const { signer: n, store: r, relays: o } = e, i = n.getPublicKey(), s = Math.floor(e.now ?? Date.now() / 1e3), a = [];
  for (const [c, l] of t) {
    if (l.saved) continue;
    const d = n.signEvent({ kind: An, created_at: s, tags: [["d", Rn + c]], content: n.nip44Encrypt(i, JSON.stringify({ v: 1, event: l.event, title: l.title, via: l.via })) });
    x(await o.publishAll(d, 6e3).catch(() => [])) >= Math.min(2, o.relayUrls.length) && (l.saved = !0, a.push(c));
  }
  a.length && await _r(r, n, t, a);
}
async function Ml(e) {
  const { signer: t, store: n, relays: r } = e, o = t.getPublicKey(), i = await xi(n, t), s = await r.queryQuorum({ kinds: [An], authors: [o], limit: 500 }, 6e3).catch(() => null);
  if (!s || s.respondedCount === 0) return Cn(i, !0);
  const a = /* @__PURE__ */ new Set(), c = [];
  for (const l of s.outcomes.flatMap((d) => d.events)) {
    if (l.kind !== An || l.pubkey !== o || !R(l)) continue;
    const d = l.tags.find((f) => f[0] === "d")?.[1];
    if (typeof d != "string" || !d.startsWith(Rn)) continue;
    let y;
    try {
      y = Er(JSON.parse(t.nip44Decrypt(o, l.content)), o);
    } catch {
      continue;
    }
    !y || y.event.id !== d.slice(Rn.length) || (a.add(y.event.id), !(i.has(y.event.id) || i.size >= Ft) && (i.set(y.event.id, { ...y, saved: !0 }), c.push(y.event.id)));
  }
  for (const [l, d] of i)
    a.has(l) !== d.saved && (d.saved = a.has(l), c.push(l));
  return await _r(n, t, i, c), await Ui(e, i), Cn(i, !1);
}
async function Il(e, t) {
  const { signer: n, store: r } = e, o = n.getPublicKey(), i = Array.isArray(t) ? t.slice(0, Ft).map((c) => Er(c, o)) : [];
  if (i.length === 0 || i.some((c) => !c)) throw new Error("That is not a receipt of this account's.");
  const s = await xi(r, n), a = [];
  for (const c of i)
    if (!s.has(c.event.id)) {
      if (s.size >= Ft) throw new Error("This account keeps as many receipts as it can.");
      s.set(c.event.id, { ...c, saved: !1 }), a.push(c.event.id);
    }
  return await _r(r, n, s, a), await Ui(e, s).catch(() => {
  }), Cn(s, !1);
}
function qi(e) {
  const t = e;
  if (!t || typeof t != "object") return null;
  const n = go(t.listing);
  if (!n || typeof t.order != "string" || !/^order_[A-Za-z0-9_-]{12,80}$/u.test(t.order) || typeof t.key != "string" || !/^[A-Za-z0-9_-]{16,128}$/u.test(t.key)) return null;
  const r = Lt(t.service);
  return r ? { listing: n, order: t.order, key: t.key, service: r, title: typeof t.title == "string" ? t.title.slice(0, 80) : "", via: Lt(t.via) || "", client: typeof t.client == "string" && /^[0-9a-f]{64}$/u.test(t.client) ? t.client : "", at: typeof t.at == "number" && Number.isFinite(t.at) ? t.at : 0 } : null;
}
const $i = (e) => Array.isArray(e) ? e.map(qi).filter((t) => !!t).slice(-20) : [], Nn = 30078, Tn = "bitlogin-pay-settings", Vi = "bitlogin:pay-settings:v1:";
async function Fi({ signer: e, store: t }) {
  const n = e.getPublicKey();
  try {
    const r = await t.get(Vi + n), o = r ? JSON.parse(e.nip44Decrypt(n, r)) : null;
    return o && typeof o.at == "number" ? { limitSats: Zn(o.limitSats), orders: $i(o.orders), at: o.at, saved: o.saved === !0 } : null;
  } catch {
    return null;
  }
}
const Bt = ({ signer: e, store: t }, n) => t.set(Vi + e.getPublicKey(), e.nip44Encrypt(e.getPublicKey(), JSON.stringify(n)));
async function Wi(e, t) {
  const { signer: n, relays: r } = e, o = n.getPublicKey(), i = n.signEvent({ kind: Nn, created_at: Math.floor(t.at), tags: [["d", Tn]], content: n.nip44Encrypt(o, JSON.stringify({ v: 1, limitSats: t.limitSats, orders: t.orders, at: t.at })) });
  return x(await r.publishAll(i, 5e3).catch(() => [])) >= Math.min(2, r.relayUrls.length);
}
async function Ol(e) {
  const { signer: t, relays: n } = e, r = t.getPublicKey();
  let o = await Fi(e);
  const i = await n.queryQuorum({ kinds: [Nn], authors: [r], "#d": [Tn], limit: 2 }, 3e3).catch(() => null);
  if (i && i.respondedCount > 0) {
    const s = i.outcomes.flatMap((c) => c.events).filter((c) => c.kind === Nn && c.pubkey === r && c.tags.some((l) => l[0] === "d" && l[1] === Tn) && R(c)).sort((c, l) => l.created_at - c.created_at)[0];
    let a = null;
    try {
      const c = s ? JSON.parse(t.nip44Decrypt(r, s.content)) : null;
      c && (a = { limitSats: Zn(c.limitSats), orders: $i(c.orders), at: typeof c.at == "number" ? c.at : s.created_at, saved: !0 });
    } catch {
      a = null;
    }
    a && (!o || a.at > o.at) ? (o = a, await Bt(e, o)) : o && (!o.saved || !a) && (o.saved = await Wi(e, o), await Bt(e, o));
  }
  return { limitSats: o?.limitSats ?? wo.default, orders: o?.orders ?? [], unsaved: !!o && !o.saved };
}
async function Ll(e, t) {
  const n = t ?? {}, r = await Fi(e), o = { limitSats: r?.limitSats ?? wo.default, orders: r?.orders ?? [], at: e.now ?? Date.now() / 1e3, saved: !1 };
  if (n.limitSats !== void 0) {
    if (Zn(n.limitSats) !== n.limitSats) throw new Error("That is not a limit this wallet keeps.");
    o.limitSats = n.limitSats;
  } else if (n.addOrder !== void 0) {
    const i = qi({ ...n.addOrder, at: o.at });
    if (!i) throw new Error("That is not an order this wallet can keep.");
    o.orders = [...o.orders.filter((s) => !(s.listing === i.listing && s.service === i.service)), i].slice(-20);
  } else if (typeof n.removeOrder == "string")
    o.orders = o.orders.filter((i) => i.order !== n.removeOrder);
  else throw new Error("That is not a change this wallet keeps.");
  return await Bt(e, o), o.saved = await Wi(e, o).catch(() => !1), o.saved && await Bt(e, o), { limitSats: o.limitSats, orders: o.orders, unsaved: !o.saved };
}
const Dl = { enough: 2, graceMs: 700 };
function xl(e, t, n = Dl) {
  const r = e.map((i) => t(i)), o = (i, s) => new Promise((a) => {
    const c = [];
    let l = r.length, d = 0, y = null, f = !1;
    const p = () => {
      f || (f = !0, y && clearTimeout(y), a(c));
    };
    if (l === 0) return p();
    for (const v of r)
      i(v).then((h) => {
        f || (c.push(h), s(h) && d++);
      }).catch(() => {
      }).finally(() => {
        if (l--, l === 0) return p();
        d >= Math.min(n.enough, r.length) && !y && (y = setTimeout(p, n.graceMs));
      });
  });
  return {
    relayUrls: [...e],
    async queryQuorum(i, s) {
      const a = await o((c) => c.queryQuorum(i, s), (c) => c.respondedCount > 0);
      return { outcomes: a.flatMap((c) => c.outcomes), respondedCount: a.reduce((c, l) => c + l.respondedCount, 0) };
    },
    async publishAll(i, s) {
      return (await o((a) => a.publishAll(i, s), (a) => a.some((c) => c.result.ok))).flat();
    },
    closeAll() {
      for (const i of r) i.closeAll();
    }
  };
}
const Mn = 30078, In = "bitlogin-drive:", ze = 10063, Ul = 24242, rt = "bitlogin:drive:v1:", ql = { autoPaySats: 0, at: 0, saved: !0 }, Pr = (e) => {
  const t = e?.autoPaySats;
  return { autoPaySats: typeof t == "number" && Number.isSafeInteger(t) && t >= 0 && t <= 1e5 ? t : 0 };
};
async function Bi(e, t) {
  const n = t.getPublicKey(), r = { folders: /* @__PURE__ */ new Map(), removed: /* @__PURE__ */ new Map(), settings: { ...ql } }, o = async (a) => {
    try {
      const c = await e.get(a);
      return c ? JSON.parse(t.nip44Decrypt(n, c)) : null;
    } catch {
      return null;
    }
  }, i = await o(rt + n);
  if (!i) return r;
  for (const a of Array.isArray(i.folders) ? i.folders.slice(0, tr.folders + 1) : []) {
    if (typeof a != "string") continue;
    const c = await o(`${rt}${n}:${a}`), l = er(c?.folder);
    l && r.folders.set(l.id, { folder: l, saved: c?.saved === !0 });
  }
  for (const a of Array.isArray(i.removed) ? i.removed : [])
    Array.isArray(a) && typeof a[0] == "string" && typeof a[1] == "number" && r.removed.set(a[0], a[1]);
  const s = i.settings;
  return r.settings = { ...Pr(s), at: typeof s?.at == "number" ? s.at : 0, saved: s?.saved !== !1 }, r;
}
async function Sr(e, t, n, r, o = []) {
  const i = t.getPublicKey(), s = (a) => t.nip44Encrypt(i, JSON.stringify(a));
  for (const a of r) {
    const c = n.folders.get(a);
    c && await e.set(`${rt}${i}:${a}`, s(c));
  }
  for (const a of o) await e.delete(`${rt}${i}:${a}`).catch(() => {
  });
  await e.set(rt + i, s({ folders: [...n.folders.keys()], removed: [...n.removed], settings: n.settings }));
}
const un = (e, t) => x(e) >= Math.min(2, t);
function dn(e, t, n, r) {
  const o = e.getPublicKey();
  return e.signEvent({ kind: Mn, created_at: Math.floor(r), tags: [["d", In + t]], content: e.nip44Encrypt(o, JSON.stringify(n)) });
}
const On = (e, t) => ({
  folders: [...e.folders.values()].map((n) => n.folder),
  settings: { autoPaySats: e.settings.autoPaySats },
  offline: t,
  unsaved: [...e.folders.values()].some((n) => !n.saved) || e.removed.size > 0 || !e.settings.saved
});
async function ji(e, t) {
  const { signer: n, store: r, relays: o } = e, i = e.now ?? Date.now() / 1e3, s = [];
  for (const [a, c] of t.folders)
    c.saved || !un(await o.publishAll(dn(n, a, { v: 1, folder: c.folder }, Math.max(i, c.folder.at)), 6e3).catch(() => []), o.relayUrls.length) || (c.saved = !0, s.push(a));
  for (const [a, c] of [...t.removed])
    un(await o.publishAll(dn(n, a, { v: 1, deleted: !0, at: c }, Math.max(i, c)), 6e3).catch(() => []), o.relayUrls.length) && t.removed.delete(a);
  t.settings.saved || un(await o.publishAll(dn(n, "settings", { v: 1, settings: { autoPaySats: t.settings.autoPaySats }, at: t.settings.at }, Math.max(i, t.settings.at)), 6e3).catch(() => []), o.relayUrls.length) && (t.settings.saved = !0), await Sr(r, n, t, s);
}
async function $l(e) {
  const { signer: t, store: n, relays: r } = e, o = t.getPublicKey(), i = await Bi(n, t), s = await r.queryQuorum({ kinds: [Mn], authors: [o], limit: 500 }, 6e3).catch(() => null);
  if (!s || s.respondedCount === 0) return On(i, !0);
  const a = /* @__PURE__ */ new Map();
  for (const d of s.outcomes.flatMap((y) => y.events)) {
    if (d.kind !== Mn || d.pubkey !== o || !R(d)) continue;
    const y = d.tags.find((p) => p[0] === "d")?.[1];
    if (typeof y != "string" || !y.startsWith(In)) continue;
    const f = y.slice(In.length);
    (!a.has(f) || a.get(f).created_at < d.created_at) && a.set(f, d);
  }
  const c = [], l = [];
  for (const [d, y] of a) {
    let f;
    try {
      f = JSON.parse(t.nip44Decrypt(o, y.content));
    } catch {
      continue;
    }
    if (d === "settings") {
      const h = typeof f.at == "number" ? f.at : y.created_at;
      (i.settings.saved || h > i.settings.at) && (i.settings = { ...Pr(f.settings), at: h, saved: !0 });
      continue;
    }
    const p = i.folders.get(d);
    if (f.deleted === !0) {
      const h = typeof f.at == "number" ? f.at : y.created_at;
      p && (p.saved || p.folder.at <= h) && (i.folders.delete(d), l.push(d)), i.removed.delete(d);
      continue;
    }
    const v = er(f.folder);
    !v || v.id !== d || i.removed.has(d) || p && !p.saved && p.folder.at >= v.at || p && p.saved && p.folder.at >= v.at || (i.folders.set(d, { folder: v, saved: !0 }), c.push(d));
  }
  for (const [d, y] of i.folders) a.has(d) || (y.saved = !1);
  return await Sr(n, t, i, c, l), await ji(e, i), On(i, !1);
}
async function Vl(e, t) {
  const { signer: n, store: r } = e, o = e.now ?? Date.now() / 1e3, i = (t.save ?? []).map(er);
  if (i.some((l) => !l)) throw new Error("That is not a folder this drive can keep.");
  const s = await Bi(r, n), a = [], c = [];
  for (const l of i)
    s.folders.set(l.id, { folder: l, saved: !1 }), s.removed.delete(l.id), a.push(l.id);
  for (const l of t.remove ?? [])
    typeof l != "string" || !/^[0-9a-f]{16}$/u.test(l) || (s.folders.delete(l), s.removed.set(l, Math.floor(o)), c.push(l));
  if (s.folders.size > tr.folders + 1) throw new Error("There are too many folders.");
  return t.settings !== void 0 && (s.settings = { ...Pr(t.settings), at: Math.floor(o), saved: !1 }), await Sr(r, n, s, a, c), await ji(e, s), On(s, !1);
}
function Fl(e, t, n = Date.now() / 1e3) {
  const r = nr(t.server), o = t.verb;
  if (!r || o !== "upload" && o !== "delete" && o !== "get") throw new Error("That is not something a file server is asked.");
  const i = typeof t.sha256 == "string" && /^[0-9a-f]{64}$/u.test(t.sha256) ? t.sha256 : "";
  if (!i) throw new Error("A permission note names the one file it is for.");
  const s = e.signEvent({
    kind: Ul,
    // In the past, as a server requires, by a margin wider than two clocks usually differ.
    created_at: Math.floor(n) - 30,
    tags: [["t", o], ["expiration", String(Math.floor(n) + 300)], ["server", new URL(r).hostname.toLowerCase()], ["x", i]],
    content: o === "upload" ? "Upload a file" : o === "delete" ? "Delete a file" : "Fetch a file"
  }), a = new TextEncoder().encode(JSON.stringify(s));
  let c = "";
  for (const l of a) c += String.fromCharCode(l);
  return btoa(c).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}
const Ji = (e) => [...new Set(e.tags.filter((t) => t[0] === "server").map((t) => nr(t[1])).filter(Boolean))];
function Wl(e, t, n = 12) {
  const r = /* @__PURE__ */ new Map();
  for (const i of e) i.kind === ze && (!r.has(i.pubkey) || r.get(i.pubkey).created_at < i.created_at) && r.set(i.pubkey, i);
  const o = /* @__PURE__ */ new Map();
  for (const i of r.values()) for (const s of Ji(i).filter((a) => a.startsWith("https://")).slice(0, 6)) (o.get(s) ?? o.set(s, /* @__PURE__ */ new Set()).get(s)).add(i.pubkey);
  return [...o].map(([i, s]) => ({ server: i, by: s.size, byFollowed: [...s].filter((a) => t.has(a)).length })).filter((i) => i.by >= 2 || i.byFollowed >= 1).sort((i, s) => s.byFollowed - i.byFollowed || s.by - i.by || i.server.localeCompare(s.server)).slice(0, n);
}
const Gi = "bitlogin:ecash:v1:", jt = (e) => e.startsWith("local:"), Bl = () => `local:${Array.from(crypto.getRandomValues(new Uint8Array(8)), (e) => e.toString(16).padStart(2, "0")).join("")}`;
async function Kr(e, t) {
  const n = t.getPublicKey();
  try {
    const r = await e.get(Gi + n);
    if (!r) return { wallet: null, tokens: [] };
    const o = JSON.parse(t.nip44Decrypt(n, r)), i = typeof o.wallet == "string" ? mo(o.wallet) : null, s = [];
    for (const a of Array.isArray(o.tokens) ? o.tokens : []) {
      const c = a, l = ko(c.proofs);
      typeof c.event == "string" && c.event.length <= 80 && ct(c.mint) && l?.length && s.push({ event: c.event, mint: ct(c.mint), proofs: l });
    }
    return { wallet: i, tokens: s };
  } catch {
    return { wallet: null, tokens: [] };
  }
}
async function Jt(e, t, n) {
  const r = t.getPublicKey();
  await e.set(Gi + r, t.nip44Encrypt(r, JSON.stringify({ wallet: n.wallet ? bo(n.wallet) : null, tokens: n.tokens })));
}
const Ar = (e, t) => x(e) >= Math.min(2, t);
function Hi(e, t, n) {
  const r = e.getPublicKey();
  return e.signEvent({ kind: et, created_at: Math.floor(n), tags: [], content: e.nip44Encrypt(r, Rs(t)) });
}
const Gt = (e, t) => ({ mints: e.wallet?.mints ?? [], tokens: e.tokens, offline: t, unsaved: e.tokens.some((n) => jt(n.event)) });
async function jl(e) {
  const { signer: t, store: n, relays: r } = e, o = t.getPublicKey(), i = await Kr(n, t), [s, a, c] = await Promise.all([
    r.queryQuorum({ kinds: [kn], authors: [o], limit: 2 }, 5e3),
    r.queryQuorum({ kinds: [et], authors: [o], limit: lt.tokens }, 6e3),
    r.queryQuorum({ kinds: [5], authors: [o], "#k": [String(et)], limit: lt.tokens }, 6e3)
  ]).catch(() => [null, null, null]);
  if (!a || !s || !c || a.respondedCount === 0) return Gt(i, !0);
  const l = (b, P) => b.filter((M) => M.kind === P && M.pubkey === o && R(M)), d = (b) => {
    try {
      return t.nip44Decrypt(o, b.content);
    } catch {
      return null;
    }
  }, y = l(s.outcomes.flatMap((b) => b.events), kn).sort((b, P) => P.created_at - b.created_at)[0], f = y && mo(d(y) ?? "") || i.wallet, p = new Set(l(c.outcomes.flatMap((b) => b.events), 5).flatMap((b) => b.tags.filter((P) => P[0] === "e" && typeof P[1] == "string").map((P) => P[1]))), v = /* @__PURE__ */ new Map();
  for (const b of l(a.outcomes.flatMap((P) => P.events), et)) v.set(b.id, b);
  const h = [...v.values()].flatMap((b) => {
    const P = Ps(d(b) ?? "");
    return P ? [{ event: b.id, created_at: b.created_at, ...P }] : [];
  }), g = Ss(h, p), m = new Set(g.flatMap((b) => b.proofs.map((P) => P.secret))), k = { wallet: f, tokens: [...g] };
  for (const b of i.tokens.filter((P) => jt(P.event))) {
    const P = b.proofs.filter((X) => !m.has(X.secret));
    if (P.length === 0) continue;
    const M = Hi(t, { mint: b.mint, proofs: P }, e.now ?? Date.now() / 1e3), $ = Ar(await r.publishAll(M, 6e3).catch(() => []), r.relayUrls.length);
    k.tokens.push({ event: $ ? M.id : b.event, mint: b.mint, proofs: P });
  }
  return await Jt(n, t, k), Gt(k, !1);
}
async function Jl(e, t) {
  const { signer: n, store: r, relays: o } = e, i = n.getPublicKey(), s = [...new Set((Array.isArray(t) ? t : []).map(ct).filter(Boolean))];
  if (s.length === 0 || s.length > lt.mints) throw new Error("Name between one and five mints, each an https address.");
  const a = await Kr(r, n), c = { privkey: a.wallet?.privkey ?? e.newKey(), mints: s }, l = { wallet: c, tokens: a.tokens };
  await Jt(r, n, l);
  const d = n.signEvent({ kind: kn, created_at: Math.floor(e.now ?? Date.now() / 1e3), tags: [], content: n.nip44Encrypt(i, bo(c)) });
  if (!Ar(await o.publishAll(d, 6e3).catch(() => []), o.relayUrls.length)) throw new Error("The wallet was saved in this browser, but no relay took it. Try again when you are online.");
  return Gt(l, !1);
}
async function Gl(e, t) {
  const { signer: n, store: r, relays: o } = e, i = e.now ?? Date.now() / 1e3, s = new Set(t.destroy.filter((v) => typeof v == "string" && v.length <= 80)), a = t.keep.map((v) => ({ mint: ct(v.mint), proofs: ko(v.proofs, 5e3) }));
  if (a.some((v) => !v.mint || !v.proofs)) throw new Error("That is not ecash this wallet can keep.");
  const c = await Kr(r, n), l = a.flatMap((v) => {
    const h = [];
    for (let g = 0; g < v.proofs.length; g += lt.proofsWritten) h.push({ event: Bl(), mint: v.mint, proofs: v.proofs.slice(g, g + lt.proofsWritten) });
    return h;
  }), d = { wallet: c.wallet, tokens: [...c.tokens.filter((v) => !s.has(v.event)), ...l] };
  await Jt(r, n, d);
  const y = [...s].filter((v) => !jt(v)), f = [];
  for (const v of l) {
    const h = Hi(n, { mint: v.mint, proofs: v.proofs, ...y.length && f.length === 0 ? { del: y } : {} }, i);
    Ar(await o.publishAll(h, 6e3).catch(() => []), o.relayUrls.length) && (v.event = h.id, f.push(h.id));
  }
  await Jt(r, n, d);
  const p = l.every((v) => !jt(v.event));
  if (y.length && p) {
    const v = n.signEvent({ kind: 5, created_at: Math.floor(i), tags: [...y.map((h) => ["e", h]), ["k", String(et)]], content: "" });
    await o.publishAll(v, 6e3).catch(() => []);
  }
  if (t.history && p && Number.isSafeInteger(t.history.amount) && t.history.amount > 0) {
    const v = n.getPublicKey(), h = n.signEvent({ kind: Ks, created_at: Math.floor(i), tags: [], content: n.nip44Encrypt(v, As({ ...t.history, created: f, destroyed: y })) });
    await o.publishAll(h, 6e3).catch(() => []);
  }
  return Gt(d, !1);
}
const zi = "bitlogin:session-public:v1";
async function Hl(e, t) {
  try {
    const n = {
      pubkey: t.pubkey,
      npub: t.npub,
      ...t.name ? { name: t.name } : {}
    };
    await e.set(zi, JSON.stringify(n));
  } catch {
  }
}
async function Be(e) {
  try {
    await e.delete(zi);
  } catch {
  }
}
class zl {
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
let he = null, A = [...Po], I = [...So];
const w = new nl();
let Ln = !1, Dn = !1;
function eo(e) {
  Ln || (A = e.vaultRelays), Dn || (I = e.discoveryRelays);
}
const Ql = new zl();
let C = null, yn = Date.now();
const Yl = /* @__PURE__ */ new Set(["configure", "lockStatus", "lockOpen", "restoreSession", "getSessionStatus", "logout"]), Qi = "bitlogin:taken-back:v1:";
async function Xl(e) {
  try {
    const t = await w.get(Qi + e);
    return (t ? po(JSON.parse(t)) : null) ?? mn;
  } catch {
    return mn;
  }
}
function to(e, t) {
  try {
    return po(JSON.parse(e.nip44Decrypt(e.getPublicKey(), t)));
  } catch {
    return null;
  }
}
function je() {
  V(), C && _(C), C = null;
}
async function Re() {
  const e = await fe(w);
  return e ? {
    on: !0,
    // Locked with nothing in the active slot too, where other accounts are kept: theirs are sealed under it.
    locked: !C && (await Nt(w) === "locked" || (await B(w)).length > 0),
    device: !!e.device,
    ...e.device ? { credentialId: e.device.credentialId } : {},
    triesLeft: Math.max(0, J.tries - e.tries)
  } : { on: !1, locked: !1, device: !1, triesLeft: 0 };
}
function K() {
  if (!u.signer || !u.everydayPrivateKey)
    throw new Error("No identity is unlocked in this session.");
  return { signer: u.signer, everydayPrivateKey: u.everydayPrivateKey };
}
function G() {
  const e = K();
  if (!u.signerOnly || u.app || !u.site) throw new Error("refused");
  return { ...e, site: u.site };
}
const xn = "bitlogin:world-counts:v1:", Zl = "bitlogin:follows-seen:v1:", Un = /* @__PURE__ */ new Map();
async function ve(e, t, n, r = !0) {
  const o = `${xn}${e}:${t}`;
  let i = Un.get(o);
  if (!i)
    try {
      const l = r ? JSON.parse(await w.get(o) ?? "[]") : [];
      i = Array.isArray(l) ? l.filter((d) => typeof d == "number" && Number.isFinite(d)).slice(-n.hourly) : [];
    } catch {
      i = [];
    }
  const s = Js(n, i), a = Date.now(), c = s.take(a);
  return Un.set(o, s.times()), c && r && await w.set(o, JSON.stringify(s.times())).catch(() => {
  }), c;
}
function fn() {
  if (!u.signerOnly || !u.app) throw new Error("refused");
  return u.app;
}
function V() {
  u.signer?.destroy(), u.everydayPrivateKey && u.everydayPrivateKey.fill(0), u.signer = null, u.everydayPrivateKey = null, u.accountId = null, u.recoveryPublicKey = null, u.activeCredentialEvent = null, u.activeRecoveryEvent = null, u.everydayKeyDerived = !1, u.vault?.destroy(), u.vault = null, u.connectionVaultRoot && u.connectionVaultRoot.fill(0), u.connectionVaultRoot = null, u.vaultKnown = !1, u.signerOnly = !1, u.app = null, u.site = null, u.profile = null, u.remember = !1, u.grantAt = null, u.relays = [], u.family = null, u.more = [], u.pendingRecovery && (u.pendingRecovery.recoveryPrivateKey.fill(0), u.pendingRecovery.everydayPrivateKey.fill(0), u.pendingRecovery = null);
}
function no(e) {
  return V(), u.pendingRecovery = e, u.signer = new ae(e.everydayPrivateKey), u.everydayPrivateKey = e.everydayPrivateKey, u.accountId = e.accountId, u.recoveryPublicKey = e.recoveryPublicKey, u.activeRecoveryEvent = e.currentRecoveryEvent, u.everydayKeyDerived = e.everydayKeyDerived, qn(
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
function qn(e, t) {
  u.connectionVaultRoot = e ?? null, u.vaultKnown = !0, u.vault = null, t && _(t);
}
async function we() {
  if (!u.everydayPrivateKey || !u.accountId || !u.recoveryPublicKey || !u.activeCredentialEvent || !u.activeRecoveryEvent)
    return;
  const e = await fe(w);
  e && !C && (await tt(w), await $n());
  const t = {
    everydayPrivateKey: u.everydayPrivateKey,
    accountId: u.accountId,
    recoveryPublicKey: u.recoveryPublicKey,
    activeCredentialEvent: u.activeCredentialEvent,
    activeRecoveryEvent: u.activeRecoveryEvent,
    ...u.connectionVaultRoot ? { connectionVaultRoot: u.connectionVaultRoot } : {},
    ...u.vaultKnown ? { vaultEnabled: u.connectionVaultRoot !== null } : {},
    everydayKeyDerived: u.everydayKeyDerived
  }, n = e && C ? C : null;
  await Pn(w, t, n);
  const r = E(u.everydayPrivateKey);
  await Pn(w, t, n, F(r));
  const o = fl(await B(w), r, Date.now() / 1e3);
  for (const i of o.dropped) await H(w, F(i));
  await me(w, o.list), await Yi();
}
async function $n() {
  for (const e of await B(w)) await H(w, F(e.pubkey));
  await me(w, []);
}
async function ro(e, t) {
  const n = u.everydayPrivateKey ? E(u.everydayPrivateKey) : "";
  let r = await B(w);
  for (const o of r) {
    if (o.pubkey === n) continue;
    const i = await Ki(w, e, F(o.pubkey));
    i ? (await Pn(w, i, t, F(o.pubkey)), i.everydayPrivateKey.fill(0), i.connectionVaultRoot?.fill(0)) : (await H(w, F(o.pubkey)), r = Tt(r, o.pubkey));
  }
  await me(w, r);
}
async function pn(e) {
  const t = await Ki(w, C, e);
  return t ? (V(), u.signer = new ae(t.everydayPrivateKey), u.everydayPrivateKey = t.everydayPrivateKey, u.accountId = t.accountId, u.recoveryPublicKey = t.recoveryPublicKey, u.activeCredentialEvent = t.activeCredentialEvent, u.activeRecoveryEvent = t.activeRecoveryEvent, u.everydayKeyDerived = t.everydayKeyDerived ?? !1, u.connectionVaultRoot = t.connectionVaultRoot ?? null, u.vaultKnown = t.vaultEnabled !== void 0, await Yi(), {
    restored: !0,
    everydayPublicKey: u.signer.getPublicKey(),
    accountId: t.accountId,
    everydayKeyDerived: u.everydayKeyDerived
  }) : { restored: !1 };
}
async function Yi() {
  if (!u.signer) return;
  const e = u.signer.getPublicKey();
  await Hl(w, { pubkey: e, npub: Qe(e) });
}
function ne() {
  try {
    return new URL(self.location.href).origin;
  } catch {
    return "";
  }
}
const hn = "bitlogin:held:v1:", Pt = (e) => xl(e, (t) => new S([t]));
function St() {
  if (!Eo(ne())) throw new Error("That is done at BitLogin's own address.");
}
function vn(e) {
  if (e === void 0) return ne();
  const t = Pe(e);
  if (!t || !Eo(ne())) throw new Error("A wallet connection is for this site only.");
  return t;
}
function Vn() {
  if (!u.signer) throw new Error("No identity is unlocked in this session.");
  if (!u.connectionVaultRoot)
    throw new Error(
      u.vaultKnown ? "This account predates the Connection Vault. Enable it from your BitLogin account manager (recovery phrase required)." : "Sign in again to use wallet connections on this device."
    );
  return u.vault ??= new Xc(u.connectionVaultRoot.slice()), u.vault;
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
async function Mt() {
  const e = Vn(), t = await e.listConnections({ relayUrls: A, store: w });
  return {
    vault: e,
    connections: t.connections.filter((n) => n.record.state !== "deleted"),
    rollbackWarnings: t.rollbackWarnings,
    unreadable: t.unreadable,
    truncated: t.truncated,
    quorumMet: t.quorumMet
  };
}
async function wn(e) {
  const { vault: t, connections: n } = await Mt(), r = n.find((o) => o.record.connection_id === e);
  if (!r) throw new Error("That connection no longer exists.");
  return { vault: t, connection: r };
}
let ke = null, z = null;
function oo(e) {
  self.postMessage({ notify: "nip46-auth-url", url: e });
}
function Ge() {
  if (!ke) throw new Error("No remote signer is connected.");
  return ke;
}
function Kt() {
  z && (z.abort.abort(), _(z.clientSecretKey), z = null);
}
function Xi(e) {
  const t = e.buildLogoutEvent();
  e.close(), t && e.publishCourtesy(t);
}
function io(e, t) {
  ke && Xi(ke.client), ke = { client: e, userPubkey: t };
}
async function eu(e, t) {
  if (u.signerOnly && !Pl.has(e))
    throw new Error("This session can only sign. Sign in at your own BitLogin page for anything else.");
  switch (C && e !== "configure" && Date.now() - yn > J.idleSec * 1e3 && je(), Yl.has(e) || (yn = Date.now()), e) {
    // ---- The optional lock (lock.ts) ----
    case "lockStatus":
      return Re();
    // Turn it on, or change the PIN. Only with a full session unlocked: the key that is sealed is the one in hand.
    case "lockEnable": {
      if (K(), await fe(w) && !C) throw new Error("Unlock first.");
      const n = await wl(w, t.pin, C ?? void 0);
      return await ro(C, n), C && _(C), C = n, await we(), Re();
    }
    case "lockSetDevice": {
      if (K(), !C) throw new Error("Turn the lock on first.");
      const n = t, r = O(String(n.prfOutput));
      try {
        await gl(w, C, String(n.credentialId), r);
      } finally {
        _(r);
      }
      return Re();
    }
    case "lockRemoveDevice": {
      if (K(), !C) throw new Error("Turn the lock on first.");
      return await ml(w), Re();
    }
    case "lockDisable": {
      if (K(), await fe(w) && !C) throw new Error("Unlock first.");
      return await ro(C, null), await tt(w), C && _(C), C = null, await we(), Re();
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
          r = await kl(w, o);
        } finally {
          _(o);
        }
      } else
        r = await bl(w, n.pin);
      if (r.ok) {
        C && _(C), C = r.lockKey, yn = Date.now();
        const o = await pn();
        if (o.restored) return { ok: !0, left: J.tries, removed: !1, ...o };
        if (await Nt(w) === "none" && (await B(w)).length > 0) return { ok: !0, left: J.tries, removed: !1, restored: !1 };
        await tt(w), je(), r = { ok: !1, left: 0, removed: !0 };
      }
      return r.removed && (je(), await $n(), await Hr(w), await Be(w)), { ok: !1, left: r.left, removed: r.removed, restored: !1 };
    }
    // ---- Signer hand-off (docs/sign-in-window.md) ----
    // The receiving side, first: a throwaway key for the hand-off to be sealed to.
    case "handoffBegin":
      return he && _(he), he = Fe(), { recipientPublicKey: E(he) };
    // The sending side: this worker has the session, and seals the everyday
    // key (only that) to the receiving worker's throwaway key.
    case "handoffExport": {
      const { everydayPrivateKey: n } = K(), r = Fe(), o = t;
      try {
        return Al(n, o.recipientPublicKey, r, o.app, {
          ...o.site !== void 0 ? { site: o.site } : {},
          // Only a site that declared nothing is told who they are. An application is held to what it asked,
          // though the window may have read the profile to show the user which account this is.
          ...u.profile && !o.app ? { profile: u.profile } : {},
          ...o.remember === !0 ? { remember: !0 } : {},
          ...o.family !== void 0 ? { family: o.family } : {},
          ...o.more !== void 0 ? { more: o.more } : {},
          // With the lock on, nothing is kept for any site: a key at rest in a site's storage would be a key
          // the lock does not cover. Every site is allowed for the visit, and asks at the sign-in address again.
          ...C ? { visitOnly: !0 } : {},
          // When it was allowed, by this worker's clock, and where the user writes: what a signer needs to
          // find out later whether the site was taken back (docs/take-back.md).
          at: Date.now() / 1e3,
          relays: u.relays
        });
      } finally {
        _(r);
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
      if (!u.signerOnly) throw new Error("Only a signer-only session can be remembered for a site.");
      const r = t, o = Date.now() / 1e3;
      if (!u.remember) return { kept: !1 };
      if (u.app && u.app.site !== r.site || u.site && u.site !== r.site) throw new Error("This hand-off was for another site.");
      if (u.family) {
        if (!Ne(r.site, u.family)) throw new Error("This hand-off was for another site.");
        await _t(w, r.site);
      }
      return {
        kept: await ln(
          w,
          {
            site: u.family ?? r.site,
            everydayPrivateKey: n,
            until: r.until,
            ...r.name ? { name: r.name } : {},
            ...u.profile ? { profile: u.profile } : {},
            at: u.grantAt ?? Math.floor(o),
            ...u.relays.length ? { relays: u.relays } : {},
            signed: [],
            ...!u.app && !u.family && u.more.length ? { more: de(u.more) } : {},
            ...u.app ? { permissions: u.app.permissions, signedSensitive: [] } : {}
          },
          o
        )
      };
    }
    // The site's page was loaded again: what was kept for that site, if it is still in date, becomes a
    // signer-only session. It touches nothing a full session uses.
    case "signerRestore": {
      const n = t, r = await Et(w, n.site, Date.now() / 1e3), o = !r && n.family !== void 0 && Q(n.family) && Ne(n.site, n.family) ? n.family : null, i = r ?? (o ? await Et(w, o, Date.now() / 1e3) : null);
      return !i || o && i.site !== o ? { restored: !1 } : (V(), u.signer = new ae(i.everydayPrivateKey), u.everydayPrivateKey = i.everydayPrivateKey, u.signerOnly = !0, u.app = i.permissions ? { site: i.site, permissions: i.permissions } : null, u.site = o ? n.site : i.site, u.family = o, u.profile = i.profile ?? null, u.remember = !0, u.grantAt = cn(i), u.relays = i.relays ?? [], u.more = o ? [] : i.more ?? [], {
        restored: !0,
        everydayPublicKey: u.signer.getPublicKey(),
        until: i.until,
        ...i.name ? { name: i.name } : {},
        ...i.profile ? { profile: i.profile } : {},
        signed: i.signed,
        ...i.signedPass ? { signedPass: i.signedPass } : {},
        check: Ir(Date.now() / 1e3, cn(i), i.checkedAt ?? 0),
        ...o ? { family: o } : {},
        ...u.more.length ? { more: de(u.more) } : {},
        ...i.permissions ? { permissions: i.permissions, signedSensitive: i.signedSensitive ?? [] } : {}
      });
    }
    // Count a signature against the site, where reloading the page can't lose the count.
    case "signerTouch": {
      const { everydayPrivateKey: n } = K();
      if (!u.signerOnly) throw new Error("Only a signer-only session is counted for a site.");
      const r = t, o = Date.now() / 1e3, i = await Et(w, u.family && Ne(r.site, u.family) ? u.family : r.site, o);
      return i && E(i.everydayPrivateKey) === E(n) && await ln(
        w,
        { ...i, signed: Array.isArray(r.signed) ? r.signed : [], ...Array.isArray(r.signedPass) ? { signedPass: r.signedPass } : {}, ...i.permissions ? { signedSensitive: Array.isArray(r.signedSensitive) ? r.signedSensitive : [] } : {} },
        o
      ), {};
    }
    // Signing out of a site that was allowed as one of a family signs out of the family: otherwise its next page
    // load would take the family's grant up again, and the sign-out would not have happened (SF6).
    case "signerForget": {
      const n = t.site;
      await _t(w, n), u.family && Ne(n, u.family) && await _t(w, u.family), await w.delete(hn + n).catch(() => {
      });
      for (const r of ["save", "follow", "seal", "unwrap", "reach", "score", "achieve"])
        Un.delete(`${xn}${r}:${n}`), await w.delete(`${xn}${r}:${n}`).catch(() => {
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
      if (!u.signerOnly) throw new Error("Only a site's signer holds receipts for it.");
      const r = Pe(t.site);
      if (!r) throw new Error("That is not a site.");
      if (u.app && u.app.site !== r || u.site && u.site !== r) throw new Error("That is another site's.");
      const o = n.getPublicKey();
      if (e === "signerHold") {
        const i = t.receipts, s = (Array.isArray(i) ? i.slice(0, Dr) : []).filter((a) => !!a && typeof a == "object" && a.kind === 30078 && typeof a.content == "string" && a.content.length <= 8e3 && R(a));
        return await w.set(hn + r, JSON.stringify({ pubkey: o, receipts: s })), {};
      }
      try {
        const i = JSON.parse(await w.get(hn + r) ?? "null");
        return { receipts: i?.pubkey === o && Array.isArray(i.receipts) ? i.receipts.slice(0, Dr) : [] };
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
        r = Rl(t, n);
      } finally {
        _(n);
      }
      return V(), u.signer = new ae(r.key), u.everydayPrivateKey = r.key, u.signerOnly = !0, u.app = r.app, u.site = r.site, u.profile = r.profile, u.remember = r.remember, u.grantAt = r.at, u.relays = r.relays, u.family = r.family, u.more = r.more, {
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
      const { signer: n } = K(), r = n.getPublicKey(), o = t.profile !== !1, i = [.../* @__PURE__ */ new Set([...I, ...A])].slice(0, 8);
      if (i.length === 0) return {};
      const s = new S(i);
      try {
        const [a, c] = await Promise.all([
          o ? s.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 4e3) : Promise.resolve(null),
          s.queryQuorum({ kinds: [Ke], authors: [r], limit: 2 }, 4e3)
        ]);
        if (u.signer !== n) return {};
        u.profile = a ? zr(a.outcomes.flatMap((l) => l.events), r) : null, u.profile && !u.signerOnly && await me(w, pl(await B(w), r, u.profile)), u.relays = Se(c.outcomes.flatMap((l) => l.events), r);
      } finally {
        s.closeAll();
      }
      return { ...u.profile ? { profile: u.profile } : {}, relays: u.relays };
    }
    // ---- Taking a site back (docs/take-back.md) ----
    // At the sign-in address, with a full session: publish the record that says a site, or every site, is taken
    // back as of now. It carries everything an earlier record said, from the relays and from this browser's own
    // copy, so a record built here can never give a site back.
    case "takeBack": {
      const { signer: n } = K(), r = t, o = n.getPublicKey(), i = Date.now() / 1e3, s = r.all === !0 ? { all: !0 } : { site: String(r.site ?? "") }, a = new S([.../* @__PURE__ */ new Set([...I, ...A])].slice(0, 8));
      let c;
      try {
        c = Se((await a.queryQuorum({ kinds: [Ke], authors: [o], limit: 2 }, 4e3)).outcomes.flatMap((y) => y.events), o);
      } finally {
        a.closeAll();
      }
      const l = [.../* @__PURE__ */ new Set([...c, ...A])].slice(0, 16), d = new S(l);
      try {
        const y = await d.queryQuorum({ kinds: [rn], authors: [o], "#d": [nn], limit: 2 }, 5e3);
        if (y.respondedCount === 0) return { ok: !1, accepted: 0, of: l.length };
        const f = Tr(y.outcomes.flatMap((b) => b.events), o, i), p = f ? to(n, f.content) : null, v = await Xl(o), h = gs(ms(p ?? mn, v, i), s, i), g = n.signEvent({
          kind: rn,
          // Later than the one it replaces, whatever the two clocks say.
          created_at: Math.max(Math.floor(i), (f?.created_at ?? 0) + 1),
          tags: [["d", nn]],
          content: n.nip44Encrypt(o, Mr(h))
        }), m = x(await d.publishAll(g, 6e3)), k = m >= Math.min(2, l.length);
        return k && await w.set(Qi + o, Mr(h)).catch(() => {
        }), { ok: k, accepted: m, of: l.length };
      } finally {
        d.closeAll();
      }
    }
    // In the embedded signer, for a kept grant: ask the user's relays whether this site was taken back. Asked at
    // most once a day. It can end the grant or leave it be, and nothing else.
    case "signerCheck": {
      const { signer: n } = K();
      if (!u.signerOnly || !u.site) return { state: "ok" };
      const r = u.family ?? u.site, o = Date.now() / 1e3, i = await Et(w, r, o);
      if (!i) return { state: "ok" };
      const s = n.getPublicKey(), a = cn(i), c = Ir(o, a, i.checkedAt ?? 0);
      if (c === "fresh") return { state: "ok" };
      const l = [.../* @__PURE__ */ new Set([...Y(i.relays), ...A])].slice(0, 12), d = new S(l);
      let y, f;
      try {
        [y, f] = await Promise.all([
          d.queryQuorum({ kinds: [rn], authors: [s], "#d": [nn], limit: 2 }, 5e3),
          d.queryQuorum({ kinds: [Ke], authors: [s], limit: 2 }, 5e3)
        ]);
      } finally {
        d.closeAll();
      }
      if (u.signer !== n) return { state: "ok" };
      const p = Tr(y.outcomes.flatMap((m) => m.events), s, o), v = p ? to(n, p.content) : null;
      if (v && bs(v, r, a))
        return await _t(w, r), V(), { state: "ended" };
      if (!ks({
        asked: l.length,
        answered: y.respondedCount,
        seenAt: i.seenAt ?? 0,
        newestAt: p ? p.created_at : null,
        readable: v !== null
      })) return { state: c === "overdue" ? "stale" : "ok" };
      const g = Se(f.outcomes.flatMap((m) => m.events), s);
      return await ln(
        w,
        {
          ...i,
          checkedAt: Math.floor(o),
          seenAt: Math.max(i.seenAt ?? 0, v && p ? p.created_at : 0),
          ...g.length ? { relays: g } : {}
        },
        o
      ), g.length && (u.relays = g), { state: "ok" };
    }
    // A room pass (NSWP kind 27300) for the site this session serves, and for no other. The site, the time, how
    // long it lasts and the profile are all this worker's own: what is asked for is a session public key. Not
    // for an application: an application is held to the set the user read, and a pass is not in one.
    case "roomPass": {
      const { signer: n } = K();
      if (!u.signerOnly || u.app || !u.site) throw new Error("refused");
      const r = ul({
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
      const { signer: n, everydayPrivateKey: r, site: o } = G(), i = t, s = be(r, n.getPublicKey());
      try {
        const a = Bs({ conversationKey: s, world: o, slot: i.slot, data: i.data, nowSeconds: Date.now() / 1e3 });
        if (!a || !await ve("save", o, js)) throw new Error("refused");
        return n.signEvent(a);
      } finally {
        _(s);
      }
    }
    case "worldFind": {
      const { signer: n, everydayPrivateKey: r, site: o } = G(), i = be(r, n.getPublicKey());
      try {
        const s = Ws(i, o, t.slot);
        if (!s) throw new Error("refused");
        return { d: s };
      } finally {
        _(i);
      }
    }
    case "worldOpen": {
      const { signer: n, everydayPrivateKey: r, site: o } = G(), i = t.event;
      if (!R(i)) throw new Error("refused");
      const s = be(r, n.getPublicKey());
      try {
        const a = Fs(i, { conversationKey: s, pubkey: n.getPublicKey(), world: o });
        if (!a) throw new Error("refused");
        return a;
      } finally {
        _(s);
      }
    }
    // ---- Following from inside a world (NSWP-14; embedded/follows.ts). Only for a world the user let do this, by
    // name, in the window. The world hands over their newest follow list and one change; what is signed is that
    // list with that change and nothing else. A follow list replaces the last, so before a world's word is
    // believed this worker looks at the user's own relays itself: a world that is behind, or that says there is
    // no list where one merely couldn't be reached, is refused.
    case "worldFollow": {
      const { signer: n, site: r } = G();
      if (!u.more.includes("follows")) throw new Error("refused");
      const o = t, i = n.getPublicKey(), s = o.list === null ? null : Lr(o.list, i);
      if (o.list !== null && !s) throw new Error("refused");
      const a = Zl + i;
      let c = 0;
      try {
        const v = Number(await w.get(a));
        Number.isSafeInteger(v) && v > 0 && (c = v);
      } catch {
      }
      const l = [.../* @__PURE__ */ new Set([...Y(u.relays), ...I, ...A])].slice(0, 8);
      let d = 0, y = 0;
      if (l.length) {
        const v = new S(l);
        try {
          const h = await v.queryQuorum({ kinds: [We], authors: [i], limit: 2 }, 3500);
          d = h.respondedCount;
          for (const g of h.outcomes.flatMap((m) => m.events))
            g.created_at > y && Lr(g, i) && (y = g.created_at);
        } catch {
        } finally {
          v.closeAll();
        }
      }
      if (u.signer !== n || !u.more.includes("follows")) throw new Error("refused");
      if (c = Math.max(c, y), c && await w.set(a, String(c)).catch(() => {
      }), !$s(s, { answered: d, newestAt: y })) throw new Error("refused");
      const f = Vs({ list: s, ...o.add !== void 0 ? { add: o.add } : {}, ...o.remove !== void 0 ? { remove: o.remove } : {}, pubkey: i, nowSeconds: Date.now() / 1e3, seen: c });
      if (!f || !await ve("follow", r, ea)) throw new Error("refused");
      const p = n.signEvent(f);
      return await w.set(a, String(Math.max(c, p.created_at))).catch(() => {
      }), p;
    }
    // ---- A score on one of a world's boards (NSWP-15; embedded/scores.ts). For any world its visitor allowed: it
    // is less than a note. The world names its coordinate, a board and a number; the note and the mark that says
    // which site asked are this worker's own.
    case "worldScore": {
      const { signer: n, site: r } = G(), o = t, i = qs({ world: o.world, board: o.board, score: o.score, title: o.title, format: o.format, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await ve("score", r, Zs)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- An achievement held in a world (NSWP-16; embedded/achievements.ts). As a score: for any world its visitor
    // allowed, built here from three plain fields, and marked with the site this session serves.
    case "worldAchieve": {
      const { signer: n, site: r } = G(), o = t, i = Us({ world: o.world, id: o.achievement, title: o.title, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await ve("achieve", r, Xs)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- Private messages from inside a world (NSWP-14; embedded/messages.ts). Only for a world the user let do
    // this, by name, in the window. The world names a reader and the words, or hands over a wrap; it is never given
    // a key, and nothing else is encrypted or decrypted for it.
    case "worldSeal": {
      const { signer: n, site: r } = G();
      if (!u.more.includes("messages")) throw new Error("refused");
      const o = t, i = xs(n, { to: o.to, text: o.text, nowSeconds: Date.now() / 1e3 });
      if (!i || !await ve("seal", r, Ys)) throw new Error("refused");
      return i;
    }
    case "worldUnwrap": {
      const { signer: n, site: r } = G();
      if (!u.more.includes("messages")) throw new Error("refused");
      if (!await ve("unwrap", r, Qs, !1)) throw new Error("refused");
      const o = Ds(n, t.event);
      if (!o) throw new Error("refused");
      return { message: o };
    }
    case "worldReach": {
      const { signer: n, site: r } = G();
      if (!u.more.includes("messages")) throw new Error("refused");
      const o = Ls(t.relays, Date.now() / 1e3);
      if (!o || !await ve("reach", r, zs)) throw new Error("refused");
      return n.signEvent(o);
    }
    // ---- What an approved application may ask beyond signing (§SW9.5). Refused without a permission set.
    case "appEncrypt": {
      const { signer: n } = K(), r = fn(), o = t, i = n.getPublicKey(), s = r.permissions.sign.some((a) => Is.includes(a));
      if (!Os(r.permissions, i, o.peerPublicKey) && !(s && /^[0-9a-f]{64}$/u.test(String(o.peerPublicKey))))
        throw new Error("refused");
      if (typeof o.text != "string" || o.text.length > 1e5) throw new Error("refused");
      return { text: o.scheme === "nip04" ? n.nip04Encrypt(o.peerPublicKey, o.text) : n.nip44Encrypt(o.peerPublicKey, o.text) };
    }
    case "appDecrypt": {
      const { signer: n } = K(), r = fn(), o = t;
      if (!Ms(r.permissions, o.peerPublicKey) || typeof o.text != "string") throw new Error("refused");
      return { text: o.scheme === "nip04" ? n.nip04Decrypt(o.peerPublicKey, o.text) : n.nip44Decrypt(o.peerPublicKey, o.text) };
    }
    case "appDecryptEvent": {
      const { signer: n } = K(), r = fn(), o = t.event;
      if (!R(o)) throw new Error("refused");
      const i = Ts(r.permissions, n.getPublicKey(), o), s = o.kind === 4 || /\?iv=[A-Za-z0-9+/=]+$/u.test(o.content);
      for (const a of i)
        try {
          return { text: s ? n.nip04Decrypt(a, o.content) : n.nip44Decrypt(a, o.content) };
        } catch {
        }
      throw new Error("refused");
    }
    case "nip46Connect": {
      const r = Ea(t.uri), o = new qr({
        clientSecretKey: Fe(),
        pointer: r,
        onAuthUrl: oo
      });
      try {
        await o.connect();
        const i = await o.getUserPublicKey();
        return io(o, i), Kt(), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46NostrconnectStart": {
      const n = t, r = A.slice(0, 2);
      Kt();
      const o = Fe(), i = Ie(D(16));
      return z = { clientSecretKey: o, relayUrls: r, secret: i, abort: new AbortController() }, { uri: _a({
        clientPubkey: E(o),
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
        ({ signerPubkey: r } = await Sa({
          clientSecretKey: n.clientSecretKey,
          relayUrls: n.relayUrls,
          secret: n.secret,
          timeoutMs: 18e4,
          signal: n.abort.signal
        }));
      } catch (i) {
        throw z === n && Kt(), i;
      }
      if (z !== n) throw new Error("This signer-connection attempt was superseded.");
      z = null;
      const o = new qr({
        clientSecretKey: n.clientSecretKey,
        pointer: { signerPubkey: r, relayUrls: n.relayUrls },
        onAuthUrl: oo
      });
      try {
        const i = await o.getUserPublicKey();
        return io(o, i), { userPubkey: i };
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
      return ke = null, Kt(), n && Xi(n.client), {};
    }
    case "configure": {
      const n = t;
      return Ln = !!n.vaultRelayUrls?.length, Dn = !!n.discoveryRelayUrls?.length, n.vaultRelayUrls?.length && (A = n.vaultRelayUrls), n.discoveryRelayUrls?.length && (I = n.discoveryRelayUrls), eo(Rt(await Ao(w))), (!Ln || !Dn) && fa(w).then(eo, () => {
      }), {};
    }
    case "register": {
      const n = t, r = n.importKey ? await Pc({ nsecOrHex: n.importKey, loginName: n.loginName, password: n.password, vaultRelayUrls: A }) : await ri({ loginName: n.loginName, password: n.password, vaultRelayUrls: A });
      return V(), u.signer = new ae(r.everydayPrivateKey), u.everydayPrivateKey = r.everydayPrivateKey, u.accountId = r.accountId, u.recoveryPublicKey = r.recoveryPublicKey, u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.recoveryEvent, u.everydayKeyDerived = r.everydayKeyDerived, qn(r.connectionVaultRoot, r.vaultSudoKey), await we(), {
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
      const r = oi(t.nsecOrHex), o = E(r), i = { everydayPublicKey: o, npub: Qe(o) };
      return r.fill(0), i;
    }
    case "login": {
      const n = t, r = await Sc({
        loginName: n.loginName,
        password: n.password,
        vaultRelayUrls: A,
        store: w,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return V(), u.signer = new ae(r.everydayPrivateKey), u.everydayPrivateKey = r.everydayPrivateKey, u.accountId = r.accountId, u.recoveryPublicKey = r.recoveryPublicKey, u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.recoveryCapsuleEvent, u.everydayKeyDerived = r.everydayKeyDerived, qn(r.connectionVaultRoot, r.vaultSudoKey), await we(), !r.rollbackWarning && !r.relayDisagreementWarning && Fr({
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
      const n = t, r = await Kc({
        phrase: n.phrase,
        vaultRelayUrls: A,
        discoveryRelayUrls: I,
        offlineRecoveryCapsuleEvents: n.offlineExportFile?.recovery_capsule_events
      });
      return no(r);
    }
    case "previewPhraseRebuild": {
      const r = await Ac({ phrase: t.phrase, vaultRelayUrls: A, discoveryRelayUrls: I });
      return { ...r, npub: Qe(r.everydayPublicKey) };
    }
    case "rebuildFromPhrase": {
      const r = await Rc({ phrase: t.phrase, vaultRelayUrls: A, discoveryRelayUrls: I });
      return no(r);
    }
    case "completeRecovery": {
      const n = t;
      if (!u.pendingRecovery) throw new Error("No recovery is in progress in this session.");
      const r = await Cc({
        recovered: u.pendingRecovery,
        newLoginName: n.newLoginName,
        newPassword: n.newPassword,
        vaultRelayUrls: A,
        store: w
      });
      return u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.refreshedRecoveryEvent, u.pendingRecovery.recoveryPrivateKey.fill(0), u.pendingRecovery = null, await we(), {
        locatorPublicKey: r.locatorPublicKey,
        credentialEventId: r.credentialEvent.id,
        refreshedRecoveryEventId: r.refreshedRecoveryEvent.id
      };
    }
    case "changePassword": {
      const n = t, r = await Nc({
        loginName: n.loginName,
        oldPassword: n.oldPassword,
        newPassword: n.newPassword,
        vaultRelayUrls: A,
        store: w,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return u.activeCredentialEvent = r.newCredentialEvent, u.recoveryPublicKey = r.recoveryPublicKey, u.activeRecoveryEvent = r.recoveryCapsuleEvent, await we(), {
        newLocatorPublicKey: r.newLocatorPublicKey,
        newGeneration: r.newGeneration,
        tombstoneAcknowledgedCount: r.tombstoneAcknowledgedCount,
        deletionAcknowledgedCount: r.deletionAcknowledgedCount
      };
    }
    case "publishProfileAndRelayLists": {
      const n = t, { everydayPrivateKey: r } = K();
      return cc({
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
      if (u.signerOnly) {
        if (u.app) {
          const o = Gs(u.app.permissions, r, u.app.site, Date.now() / 1e3);
          if (!o) throw new Error("refused");
          return n.signEvent(o);
        }
        if (Hs(r.kind) !== "ordinary") throw new Error("refused");
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
      return { nsec: rs(n), npub: Qe(r.getPublicKey()) };
    }
    case "buildRecoveryExport": {
      if (K(), !u.recoveryPublicKey || !u.activeRecoveryEvent)
        throw new Error("No recovery capsule is known in this session yet.");
      return os({
        recoveryPublicKeyHex: u.recoveryPublicKey,
        vaultRelayUrls: A,
        recoveryCapsuleEvents: [u.activeRecoveryEvent],
        relayListEvents: []
      });
    }
    case "repairReplicas": {
      if (!u.activeCredentialEvent || !u.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Fr({
        relayUrls: A,
        credentialEvent: u.activeCredentialEvent,
        recoveryEvent: u.activeRecoveryEvent
      });
    }
    case "checkReplicaHealth": {
      if (!u.activeCredentialEvent || !u.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return kc({
        relayUrls: A,
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
      return !C && await Nt(w) === "locked" ? { restored: !1, locked: !0 } : pn();
    // Log out: this account is forgotten on this device. Other accounts kept here stay, and so does the lock
    // they are sealed under; with none left, everything goes as it always did.
    case "logout": {
      const n = u.everydayPrivateKey && !u.signerOnly ? E(u.everydayPrivateKey) : "", r = Tt(await B(w), n);
      return n && await H(w, F(n)), r.length > 0 && n ? (await me(w, r), V(), await H(w), await Be(w), {}) : (je(), await tt(w), await $n(), await Hr(w), await Be(w), {});
    }
    // ---- Several accounts on one device (docs/account-switching.md) ----
    // Who is kept here, and which of them is signed in. Public keys and what their own profiles call them.
    case "accountsList": {
      const n = u.everydayPrivateKey && !u.signerOnly ? E(u.everydayPrivateKey) : "";
      return { accounts: (await B(w)).map((r) => ({ ...r, active: r.pubkey === n })) };
    }
    // Switch to a kept account: its own slot is opened, on this device, with no password and no relay. With the
    // lock on and locked, it says so, and nothing changes.
    case "accountsSwitch": {
      if (u.signerOnly) throw new Error("A signer-only session cannot switch accounts.");
      const n = String(t.pubkey ?? ""), r = await B(w);
      if (!r.some((i) => i.pubkey === n)) return { restored: !1 };
      if (!C && await Nt(w, F(n)) === "locked") return { restored: !1, locked: !0 };
      const o = await pn(F(n));
      return !o.restored || o.everydayPublicKey !== n ? (V(), await H(w, F(n)), await me(w, Tt(r, n)), await H(w), await Be(w), { restored: !1 }) : (await we(), o);
    }
    // Make room to sign in as another account: nobody is signed in, and everyone kept stays kept.
    case "accountsAdd": {
      if (u.signerOnly) throw new Error("A signer-only session cannot add accounts.");
      return V(), await H(w), await Be(w), {};
    }
    // Forget one kept account that is not the one signed in. (For that one: log out.)
    case "accountsRemove": {
      const n = String(t.pubkey ?? ""), r = u.everydayPrivateKey && !u.signerOnly ? E(u.everydayPrivateKey) : "";
      if (n === r) throw new Error("Log out to remove the account that is signed in.");
      return await H(w, F(n)), await me(w, Tt(await B(w), n)), {};
    }
    // ---- Connection Vault (connection-vault.md §12, reveal mode) ----
    // ---- An ecash wallet kept with the account (docs/ecash.md). A full session only: none of these is on the list a
    // handed-over session may ask, so no embedded signer, and so no site, can read a token.
    // ---- A person's files (docs/files.md). A full session only: none of these is on the list a handed-over
    // session may ask, so no embedded signer, and so no site, can read the index or have a permission note signed.
    case "blossomAuth": {
      const { signer: n } = K();
      return { token: Fl(n, t) };
    }
    case "driveLoad":
    case "driveSave":
    case "blossomServers":
    case "blossomSetServers": {
      const { signer: n } = K(), r = n.getPublicKey(), o = [.../* @__PURE__ */ new Set([...I, ...A])].slice(0, 8);
      let i = u.relays;
      if (i.length === 0 && o.length) {
        const a = new S(o);
        try {
          i = Se((await a.queryQuorum({ kinds: [Ke], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((c) => c.events), r);
        } catch {
          i = [];
        } finally {
          a.closeAll();
        }
      }
      const s = new S([.../* @__PURE__ */ new Set([...i, ...A, ...e.startsWith("blossom") ? I : []])].slice(0, 16));
      try {
        const a = { signer: n, store: w, relays: s };
        if (e === "driveLoad") return await $l(a);
        if (e === "driveSave") return await Vl(a, t);
        const c = async () => {
          const g = (await s.queryQuorum({ kinds: [ze], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((m) => m.events).filter((m) => m.kind === ze && m.pubkey === r && R(m)).sort((m, k) => k.created_at - m.created_at)[0];
          return g ? Ji(g) : [];
        };
        if (e === "blossomSetServers") {
          const h = [...new Set((t.servers ?? []).map(nr).filter(Boolean))].slice(0, tr.servers);
          if (h.length === 0) throw new Error("Name at least one file server, by its https address.");
          const g = n.signEvent({ kind: ze, created_at: Math.floor(Date.now() / 1e3), tags: h.map((m) => ["server", m]), content: "" });
          if (x(await s.publishAll(g, 6e3)) < Math.min(2, s.relayUrls.length)) throw new Error("No relay took your server list. Try again when you are online.");
          return { mine: h };
        }
        const [l, d, y] = await Promise.all([
          c(),
          s.queryQuorum({ kinds: [ze], limit: 500 }, 5e3),
          s.queryQuorum({ kinds: [We], authors: [r], limit: 2 }, 4e3)
        ]), f = y.outcomes.flatMap((h) => h.events).filter((h) => h.pubkey === r && h.kind === We && R(h)).sort((h, g) => g.created_at - h.created_at)[0], p = new Set((f?.tags ?? []).filter((h) => h[0] === "p" && typeof h[1] == "string").map((h) => h[1])), v = new Map(d.outcomes.flatMap((h) => h.events).filter((h) => h.pubkey !== r && R(h)).map((h) => [h.id, h]));
        return { mine: l, ranked: Wl([...v.values()], p) };
      } finally {
        s.closeAll();
      }
    }
    // ---- Paying, and buying (docs/paying.md). A full session at one of BitLogin's own sign-in addresses only: none
    // of these is on the list a handed-over session may ask, so no embedded signer, and so no site, can have a
    // buyer's permission note signed or read what a person bought.
    // Whom a tip is for: the name and the lightning address in that person's own signed profile. Read-only.
    case "payProfile": {
      K(), St();
      const n = t.pubkey;
      if (typeof n != "string" || !/^[0-9a-f]{64}$/u.test(n)) throw new Error("That is not an account.");
      const r = [.../* @__PURE__ */ new Set([...u.relays, ...I, ...A])].slice(0, 10);
      if (r.length === 0) return { name: "", address: "", answered: !1 };
      const o = Pt(r);
      try {
        const i = await o.queryQuorum({ kinds: [0], authors: [n], limit: 2 }, 3500), s = i.outcomes.flatMap((c) => c.events), a = s.filter((c) => c.kind === 0 && c.pubkey === n && R(c)).sort((c, l) => l.created_at - c.created_at)[0];
        return { name: zr(s, n)?.name ?? "", address: a ? Ns(a.content, { local: mt(ne()) }) : "", answered: i.respondedCount > 0 };
      } finally {
        o.closeAll();
      }
    }
    // A listing, by its coordinate, from the relays its service names and the account's own. The page checks it.
    case "payListing": {
      K(), St();
      const n = t, r = go(n.coordinate);
      if (!r) throw new Error("That is not a listing.");
      const o = mt(ne()), i = (Array.isArray(n.relays) ? n.relays : []).filter((c) => typeof c == "string" && c.length <= 200 && (/^wss:\/\//u.test(c) || o && /^ws:\/\/(localhost|127\.0\.0\.1)[:/]/u.test(c))).slice(0, 6), s = [.../* @__PURE__ */ new Set([...i, ...u.relays, ...I])].slice(0, 12);
      if (s.length === 0) return { event: null, answered: !1 };
      const a = Pt(s);
      try {
        const c = await a.queryQuorum({ kinds: [30078], authors: [Or(r)], "#d": [r.slice(71)], limit: 4 }, 5e3);
        return { event: c.outcomes.flatMap((d) => d.events).filter((d) => d.kind === 30078 && d.pubkey === Or(r) && d.tags.some((y) => y[0] === "d" && y[1] === r.slice(71)) && R(d)).sort((d, y) => y.created_at - d.created_at)[0] ?? null, answered: c.respondedCount > 0 };
      } finally {
        a.closeAll();
      }
    }
    // A buyer's permission note (NIP-98) for one request to a selling service BitLogin knows: this address, this
    // method, this body, once. Kind 27235 is signed here and nowhere else, and never for a site.
    case "unlockAuth": {
      const { signer: n } = K();
      St();
      const r = t;
      let o;
      try {
        o = new URL(String(r.url));
      } catch {
        throw new Error("That is not an address.");
      }
      const i = Cs.some((d) => d.endpoint === o.origin) || mt(ne()) && mt(o.origin);
      if (typeof r.url != "string" || r.url.length > 1e3 || o.toString() !== r.url || o.username || o.password || !i) throw new Error("That is not a service BitLogin buys from.");
      if (r.method !== "GET" && r.method !== "POST") throw new Error("That is not something a selling service is asked.");
      const s = typeof r.payload == "string" && /^[0-9a-f]{64}$/u.test(r.payload) ? r.payload : "";
      if (r.method === "POST" && !s) throw new Error("A permission note names what is sent with it.");
      const a = n.signEvent({ kind: 27235, created_at: Math.floor(Date.now() / 1e3), tags: [["u", r.url], ["method", r.method], ["bitunlock:nonce", crypto.randomUUID()], ...s ? [["payload", s]] : []], content: "" }), c = new TextEncoder().encode(JSON.stringify(a));
      let l = "";
      for (const d of c) l += String.fromCharCode(d);
      return { token: `Nostr ${btoa(l)}` };
    }
    // The receipts kept with the account: in this browser first, then on its relays, each sealed to its own key.
    case "paySettingsLoad":
    case "paySettingsSave":
    case "receiptsLoad":
    case "receiptsKeep": {
      const { signer: n } = K();
      St();
      const r = n.getPublicKey(), o = [.../* @__PURE__ */ new Set([...I, ...A])].slice(0, 8);
      let i = u.relays;
      if (i.length === 0 && o.length) {
        const a = Pt(o);
        try {
          i = Se((await a.queryQuorum({ kinds: [Ke], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((c) => c.events), r);
        } catch {
          i = [];
        } finally {
          a.closeAll();
        }
      }
      const s = Pt([.../* @__PURE__ */ new Set([...i, ...A])].slice(0, 16));
      try {
        const a = { signer: n, store: w, relays: s };
        return e === "paySettingsLoad" ? await Ol(a) : e === "paySettingsSave" ? await Ll(a, t) : e === "receiptsLoad" ? await Ml(a) : await Il(a, t.receipts);
      } finally {
        s.closeAll();
      }
    }
    // The words of their newest profile note, to show what a proposed one would change. Read-only, and theirs.
    case "profileContent": {
      const { signer: n } = K(), r = n.getPublicKey(), o = [.../* @__PURE__ */ new Set([...u.relays, ...I, ...A])].slice(0, 10);
      if (o.length === 0) return { content: null, answered: !1 };
      const i = new S(o);
      try {
        const s = await i.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 3500), a = s.outcomes.flatMap((c) => c.events).filter((c) => c.kind === 0 && c.pubkey === r && R(c)).sort((c, l) => l.created_at - c.created_at)[0];
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
      const i = new S(o);
      try {
        const [s, a] = await Promise.all([
          i.queryQuorum({ kinds: [Li], "#k": [Di], limit: 500 }, 5e3),
          i.queryQuorum({ kinds: [We], authors: [r], limit: 2 }, 4e3)
        ]), c = a.outcomes.flatMap((y) => y.events).filter((y) => y.pubkey === r && y.kind === We && R(y)).sort((y, f) => f.created_at - y.created_at)[0], l = new Set((c?.tags ?? []).filter((y) => y[0] === "p" && typeof y[1] == "string").map((y) => y[1])), d = new Map(s.outcomes.flatMap((y) => y.events).filter((y) => R(y)).map((y) => [y.id, y]));
        return { mints: Tl([...d.values()], l) };
      } finally {
        i.closeAll();
      }
    }
    case "ecashLoad":
    case "ecashSetMints":
    case "ecashRoll": {
      const { signer: n } = K(), r = n.getPublicKey(), o = new S([.../* @__PURE__ */ new Set([...I, ...A])].slice(0, 8));
      let i = u.relays;
      if (i.length === 0)
        try {
          i = Se((await o.queryQuorum({ kinds: [Ke], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((c) => c.events), r);
        } catch {
          i = [];
        } finally {
          o.closeAll();
        }
      else o.closeAll();
      const s = [.../* @__PURE__ */ new Set([...i, ...A])].slice(0, 16), a = new S(s);
      try {
        const c = { signer: n, store: w, relays: a };
        return e === "ecashLoad" ? await jl(c) : e === "ecashSetMints" ? await Jl({ ...c, newKey: () => Ie(Fe()) }, t.mints) : await Gl(c, t);
      } finally {
        a.closeAll();
      }
    }
    case "vaultStatus":
      return u.signer ? u.connectionVaultRoot ? { enabled: !0, vaultPublicKey: Vn().vaultPublicKey } : { enabled: !1, reason: u.vaultKnown ? "no-vault" : "stale-cache" } : { enabled: !1 };
    case "vaultList": {
      const { connections: n, rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: s } = await Mt();
      return { connections: n.map(Je), rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: s };
    }
    case "vaultSaveNwc": {
      const n = t, r = vn(n.site), o = Vn(), i = Jr(n.uri), s = n.label.trim().slice(0, 120) || "Wallet connection", { record: a, event: c } = await o.createConnection({
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
      const n = vn(t.site), { connections: r } = await Mt(), o = r.find(
        (i) => i.record.connection_type === "nwc" && i.record.state === "active" && i.record.application_binding.origin === n
      );
      return { connection: o ? Je(o) : null };
    }
    case "vaultRevealNwc": {
      const n = t, r = vn(n.site), { connection: o } = await wn(n.connectionId);
      if (o.record.connection_type !== "nwc" || o.record.state !== "active")
        throw new Error("That connection is not an active wallet connection.");
      const i = o.record.application_binding.origin;
      if (i !== null && i !== r)
        throw new Error("That connection belongs to a different site.");
      const s = o.record.credential;
      return wi(s), { uri: Fc(s) };
    }
    case "vaultSetBinding": {
      const n = t, { vault: r, connection: o } = await wn(n.connectionId), i = n.origin === null ? null : ne(), { record: s, event: a } = await r.updateConnection(o, {
        application_binding: { origin: i, app_pubkey: null }
      });
      if (!(await r.publish({
        event: a,
        connectionId: s.connection_id,
        relayUrls: A,
        store: w
      })).success) throw new Error("The change could not reach enough relays. Please try again.");
      const l = await r.decryptEvent(a);
      return Je(l);
    }
    case "vaultDelete": {
      const n = t, { vault: r, connection: o } = await wn(n.connectionId), { record: i, event: s } = await r.deleteConnection(o);
      if (!(await r.publish({
        event: s,
        connectionId: i.connection_id,
        relayUrls: A,
        store: w
      })).success) throw new Error("The deletion could not reach enough relays. Please try again.");
      try {
        const c = r.buildDeletionRequest(o.event.id), l = new S(A);
        await l.publishAll(c), l.closeAll();
      } catch {
      }
      return {};
    }
    case "vaultOfferCheck": {
      const n = t, r = ne(), o = Jr(n.uri), { connections: i } = await Mt(), s = i.find(
        (a) => a.record.connection_type === "nwc" && Wc(a.record.credential, o)
      );
      return s ? s.record.application_binding.origin !== r ? { duplicate: !1 } : { duplicate: !0, connection: Je(s) } : { duplicate: !1 };
    }
    default:
      throw new Error(`Unknown worker action: ${e}`);
  }
}
const tu = /* @__PURE__ */ new Set([
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
  if (typeof t.action != "string" || !tu.has(t.action)) {
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
  (r.startsWith("nip46") ? (s) => s() : (s) => Ql.run(s))(() => eu(r, o)).then(
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
