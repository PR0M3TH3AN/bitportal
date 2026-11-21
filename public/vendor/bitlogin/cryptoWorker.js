import { K as Pi, b as Ki, c as x, D as Fr, d as _t, w as _, f as Ct, g as rt, h as Cn, S as Ft, j as $t, k as Oe, l as yt, B as Si, m as Ai, n as Wt, o as ot, q as Nn, r as Tn, a as ze, s as $r, t as Ri, u as Ci } from "./bitlogin-shared-CDSZpiZ4.js";
import { g as E, s as L, v as C, b as Ce, a as O, f as Le, i as Ni, j as Ti, k as Mi, l as Ii, m as xi, n as Jt, o as pr, p as Wr, q as Di, t as Oi, w as Li, x as wt, y as Br, u as U, z as Ui, A as Nt, B as Mn, C as In, D as jr, E as qi, d as T, e as I, F as xn, G as Vi, H as Gr, h as Dn, I as Hr, J as Fi, c as ft, K as un, L as qe } from "./bitlogin-shared-Cj9s0_W_.js";
import { b as pt, r as Q, c as Y, k as $i, i as Se, w as Ve, R as Fe, T as zt, d as Qt, n as hr, t as Wi, m as Bi, N as dn, e as vr, g as wr, h as Jr, j as ji, l as Gi } from "./bitlogin-shared-AdzLHSV8.js";
import { x as me, y as On, z as yn, B as Hi, C as Qe, D as Ye, E as Xe, F as ne, G as ee, H as zr, I as Qr, J as it, K as Ln, u as st, c as Ji, r as Un, m as qn, f as Tt, L as ue, o as zi, M as $e, N as Qi, O as Yi, Q as Xi, T as Zi, U as es, V as ts, X as ns, Y as rs, Z as os, _ as gr, $ as is, a0 as ss, a1 as as, a2 as cs, a3 as ls, a4 as us, a5 as ds, d as ys, i as fs, a6 as ps, a7 as hs, a8 as vs, a9 as ws, aa as gs, ab as ms, ac as bs } from "./bitlogin-shared-BqDMTUOp.js";
import { a as at, W as fn, E as ct, T as Ze, r as Yr, b as ks, l as Es, w as Xr, d as Zr, H as _s, e as Ps, f as Ks } from "./bitlogin-shared-19Ribcs2.js";
import { e as Vn, a as Fn, b as $n } from "./bitlogin-shared-PwbHDYud.js";
function eo(e) {
  const t = E(e.privateKey);
  return L({
    pubkey: t,
    created_at: e.createdAt,
    kind: Pi,
    tags: [
      ["e", e.eventIdToDelete],
      ["k", String(e.deletedEventKind)]
    ],
    content: e.reason ?? ""
  }, e.privateKey);
}
function Ss() {
  const e = globalThis.WebSocket;
  if (!e)
    throw new Error("No global WebSocket implementation is available in this environment.");
  return e;
}
const Mt = 1e3, As = 262144;
function Rs(e) {
  const t = Math.min(e.limit ?? Mt, Mt);
  return Math.max(50, t * 3);
}
const Cs = 2048, Ns = 1e4, Ts = 100;
function Ms(e, t) {
  if (e.size >= Cs) {
    const n = e.values().next().value;
    n !== void 0 && e.delete(n);
  }
  e.add(t);
}
class Wn {
  url;
  ws = null;
  connectPromise = null;
  subs = /* @__PURE__ */ new Map();
  pendingPublishes = /* @__PURE__ */ new Map();
  authPrivateKey;
  connectTimeoutMs;
  authenticated = !1;
  constructor(t, n = {}) {
    if (!pt(t))
      throw new Error("Relay URL must use secure WebSockets, except for an explicit loopback development endpoint.");
    this.url = t, this.authPrivateKey = n.authPrivateKey, this.connectTimeoutMs = n.connectTimeoutMs ?? 8e3;
  }
  async connect() {
    return this.connectPromise ? this.connectPromise : (this.connectPromise = new Promise((t, n) => {
      const r = Ss(), o = new r(this.url);
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
    if (t.length > As)
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
        if (d - a.liveWindowStart >= Ns && (a.liveWindowStart = d, a.liveVerifies = 0), a.liveVerifies >= Ts || (a.liveVerifies++, !C(s) || !mr(s, a.filter)))
          return;
        Ms(a.seenIds, s.id), a.onEvent(s);
        return;
      }
      const u = Math.min(a.filter.limit ?? Mt, Mt);
      if (a.events.length >= u || a.verifyBudget <= 0 || (a.verifyBudget--, !C(s) || !mr(s, a.filter)))
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
    const n = E(this.authPrivateKey), r = L({
      pubkey: n,
      created_at: Math.floor(Date.now() / 1e3),
      kind: Ki,
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
    const r = Ce(O(8));
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
    const r = Ce(O(8));
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
        verifyBudget: Rs(t),
        liveWindowStart: 0,
        liveVerifies: 0,
        filter: t,
        onEose: () => a()
      }), this.send(["REQ", r, t]);
    });
  }
}
function mr(e, t) {
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
class K {
  connections = /* @__PURE__ */ new Map();
  constructor(t, n = {}) {
    for (const r of new Set(t))
      this.connections.set(r, new Wn(r, n));
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
function j(e) {
  return e.filter((t) => t.result.ok).length;
}
const ht = null, to = [
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
], no = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  // Added 2026-11-18: relay.nostr.band timed out and nostr-pub.wellorder.net
  // never connected in the same measurement, leaving two working lookups.
  "wss://nos.lol"
], Is = [], xs = /^[0-9a-f]{64}$/u, Ds = 64;
function Yt(e) {
  return Array.isArray(e) && e.length <= Ds && e.every((t) => typeof t == "string" && pt(t)) && new Set(e).size === e.length;
}
function Bt(e, t = ht, n = -1) {
  if (!t || !xs.test(t) || /^0{64}$/u.test(t) || !C(e) || e.pubkey !== t || e.kind !== x || Le(e, "d") !== Fr)
    return null;
  try {
    const r = JSON.parse(e.content);
    if (typeof r != "object" || r === null || Array.isArray(r))
      return null;
    const o = r;
    return !Number.isSafeInteger(o.version) || o.version < 1 || o.version <= n || !Yt(o.vaultRelays) || !Yt(o.discoveryRelays) || o.deprecated !== void 0 && !Yt(o.deprecated) ? null : {
      version: o.version,
      vaultRelays: o.vaultRelays,
      discoveryRelays: o.discoveryRelays,
      ...o.deprecated === void 0 ? {} : { deprecated: o.deprecated }
    };
  } catch {
    return null;
  }
}
function Os(e) {
  return Math.max(0, e - 1);
}
function br(e, t, n) {
  const r = t ? n === "vault" ? t.vaultRelays : t.discoveryRelays : [], o = new Set(t?.deprecated ?? []), i = new Set(e), s = [...new Set(r)].filter((a) => !o.has(a) && !i.has(a)).slice(0, Os(e.length));
  return [...e, ...s];
}
async function Ls(e, t = ht, n = -1, r = 6e3) {
  if (!t || e.length === 0)
    return null;
  const o = new K([...e]);
  let i;
  try {
    i = (await o.queryQuorum({ kinds: [x], authors: [t], "#d": [Fr], limit: 3 }, r)).outcomes.flatMap((c) => c.events);
  } finally {
    o.closeAll();
  }
  let s = null;
  for (const a of i) {
    const c = Bt(a, t, n);
    c && (!s || c.version > s.list.version) && (s = { event: a, list: c });
  }
  return s;
}
const ro = "bitlogin:bootstrap-relays:v1";
async function oo(e, t = ht) {
  if (!t)
    return null;
  try {
    const n = await e.get(ro);
    return n ? Bt(JSON.parse(n), t) : null;
  } catch {
    return null;
  }
}
function Pt(e) {
  return {
    vaultRelays: br(to, e, "vault"),
    discoveryRelays: br(no, e, "discovery"),
    listVersion: e?.version ?? null
  };
}
async function Us(e, t = {}) {
  const n = t.maintainerPubkeyHex === void 0 ? ht : t.maintainerPubkeyHex, r = await oo(e, n);
  if (!n)
    return Pt(null);
  const o = Pt(r), i = r?.version ?? -1;
  try {
    let s = await Ls(t.queryRelayUrls ?? [.../* @__PURE__ */ new Set([...o.vaultRelays, ...o.discoveryRelays])], n, i, t.timeoutMs);
    if (!s) {
      const a = await qs(t.httpsFallbackUrls ?? Is, n, i), c = a ? Bt(a, n, i) : null;
      a && c && (s = { event: a, list: c });
    }
    return s ? (await e.set(ro, JSON.stringify(s.event)), Pt(s.list)) : o;
  } catch {
    return o;
  }
}
async function qs(e, t = ht, n = -1) {
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
      if (C(a) && Bt(a, t, n))
        return a;
    } catch {
    }
  return null;
}
const Bn = /^[0-9a-f]{64}$/u, Vs = 8, Fs = 4096, $s = 256, Ws = 512;
class _e extends Error {
  name = "BunkerUriParseError";
}
class Bs extends Error {
  name = "Nip46RequestTimeoutError";
  constructor(t, n) {
    super(`The remote signer did not answer ${t} within ${Math.round(n / 1e3)}s. It may be offline, or waiting for your approval on another device -- check your signer and try again.`);
  }
}
class js extends Error {
  name = "Nip46ErrorResponse";
}
function Gs(e) {
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return null;
  }
  const n = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol === "https:" || t.protocol === "http:" && n ? t.toString() : null;
}
function Hs(e) {
  if (e.length > Fs)
    throw new _e("That bunker URI is unreasonably long.");
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    throw new _e("That doesn't look like a valid URI.");
  }
  if (t.protocol !== "bunker:")
    throw new _e("A remote-signer URI must start with bunker://");
  const n = (t.host || t.pathname.replace(/^\/+/u, "")).toLowerCase();
  if (!Bn.test(n))
    throw new _e("The bunker URI does not name a valid signer public key.");
  const r = [
    ...new Set(t.searchParams.getAll("relay").map((i) => i.trim()).filter((i) => i.length > 0 && i.length <= Ws))
  ].slice(0, Vs);
  if (r.length === 0)
    throw new _e("The bunker URI names no relays -- without at least one relay= parameter there is no way to reach the signer.");
  const o = t.searchParams.get("secret") ?? void 0;
  if (o && o.length > $s)
    throw new _e("The bunker URI's secret is unreasonably long.");
  return { signerPubkey: n, relayUrls: r, secret: o || void 0 };
}
function Js(e) {
  if (!Bn.test(e.clientPubkey))
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
const zs = 12e4;
class kr {
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
    this.clientSecretKey = t.clientSecretKey, this.clientPubkey = E(t.clientSecretKey), this.pointer = t.pointer, this.conversationKey = me(t.clientSecretKey, t.pointer.signerPubkey), this.onAuthUrl = t.onAuthUrl, this.requestTimeoutMs = t.requestTimeoutMs ?? zs, this.conns = t.pointer.relayUrls.map((n) => new Wn(n, { authPrivateKey: t.clientSecretKey }));
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
        kinds: [_t],
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
      n = JSON.parse(On(this.conversationKey, t.content));
    } catch {
      return;
    }
    if (typeof n.id != "string")
      return;
    const r = this.pending.get(n.id);
    if (r) {
      if (n.result === "auth_url") {
        if (!r.authUrlSeen && typeof n.error == "string" && n.error) {
          const o = Gs(n.error);
          o && (r.authUrlSeen = !0, this.onAuthUrl?.(o));
        }
        return;
      }
      if (this.pending.delete(n.id), clearTimeout(r.timer), typeof n.error == "string" && n.error) {
        r.reject(new js(n.error));
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
    const r = Ce(O(8)), o = yn(this.conversationKey, JSON.stringify({ id: r, method: t, params: n })), i = [["p", this.pointer.signerPubkey]], s = L({
      pubkey: this.clientPubkey,
      created_at: Math.floor(Date.now() / 1e3),
      kind: _t,
      tags: i,
      content: o
    }, this.clientSecretKey), a = new Promise((d, y) => {
      const h = setTimeout(() => {
        this.pending.delete(r), y(new Bs(t, this.requestTimeoutMs));
      }, this.requestTimeoutMs);
      this.pending.set(r, { resolve: d, reject: y, timer: h, authUrlSeen: !1 });
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
    if (!Bn.test(t))
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
    if (!C(o))
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
      const t = Ce(O(8)), n = yn(this.conversationKey, JSON.stringify({ id: t, method: "logout", params: [] }));
      return L({
        pubkey: this.clientPubkey,
        created_at: Math.floor(Date.now() / 1e3),
        kind: _t,
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
async function Qs(e) {
  const t = E(e.clientSecretKey), n = e.timeoutMs, r = e.relayUrls.map((i) => new Wn(i, { authPrivateKey: e.clientSecretKey })), o = () => {
    for (const i of r)
      i.close();
  };
  return new Promise((i, s) => {
    let a = !1;
    const c = () => u(new Error("The signer-connection attempt was cancelled.")), u = (f) => {
      a || (a = !0, clearTimeout(d), e.signal?.removeEventListener("abort", c), o(), f instanceof Error ? s(f) : i(f));
    }, d = setTimeout(() => u(new Error(`No signer connected within ${Math.round(n / 1e3)}s. Scan or paste the connection code in your signer app, then try again.`)), n);
    if (e.signal?.aborted) {
      c();
      return;
    }
    e.signal?.addEventListener("abort", c, { once: !0 });
    const y = { kinds: [_t], "#p": [t] }, h = (f) => {
      let v, p = null;
      try {
        p = me(e.clientSecretKey, f.pubkey), v = JSON.parse(On(p, f.content));
      } catch {
        return;
      } finally {
        p && _(p);
      }
      v.result === e.secret && u({ signerPubkey: f.pubkey });
    };
    Promise.allSettled(r.map((f) => f.subscribeLive(y, h))).then((f) => {
      f.some((v) => v.status === "fulfilled") || u(new Error("Could not reach any relay to listen for the signer."));
    });
  });
}
function jn() {
  const e = globalThis.crypto;
  if (!e || !e.subtle)
    throw new Error("WebCrypto SubtleCrypto is not available in this environment.");
  return e;
}
async function io(e) {
  if (e.length !== 32)
    throw new Error("AES-256-GCM key must be exactly 32 bytes.");
  return jn().subtle.importKey("raw", e, "AES-GCM", !1, ["encrypt", "decrypt"]);
}
async function so(e, t, n) {
  const r = Ni(), o = await io(e), i = await jn().subtle.encrypt({ name: "AES-GCM", iv: r, additionalData: n, tagLength: 128 }, o, t);
  return { nonce: r, ciphertext: new Uint8Array(i) };
}
async function ao(e, t, n, r) {
  const o = await io(e);
  try {
    const i = await jn().subtle.decrypt({ name: "AES-GCM", iv: t, additionalData: r, tagLength: 128 }, o, n);
    return new Uint8Array(i);
  } catch {
    throw new Error("AES-256-GCM authentication failed: capsule is corrupted, tampered, or the wrong key was used.");
  }
}
const co = `abandon
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
function Ys(e, t, n, r) {
  Ii(e);
  const o = xi({ dkLen: 32, asyncTick: 10 }, r), { c: i, dkLen: s, asyncTick: a } = o;
  if (Jt(i), Jt(s), Jt(a), i < 1)
    throw new Error("iterations (c) should be >= 1");
  const c = pr(t), u = pr(n), d = new Uint8Array(s), y = Wr.create(e, c), h = y._cloneInto().update(u);
  return { c: i, dkLen: s, asyncTick: a, DK: d, PRF: y, PRFSalt: h };
}
function Xs(e, t, n, r, o) {
  return e.destroy(), t.destroy(), r && r.destroy(), Di(o), n;
}
async function Zs(e, t, n, r) {
  const { c: o, dkLen: i, asyncTick: s, DK: a, PRF: c, PRFSalt: u } = Ys(e, t, n, r);
  let d;
  const y = new Uint8Array(4), h = Ti(y), f = new Uint8Array(c.outputLen);
  for (let v = 1, p = 0; p < i; v++, p += c.outputLen) {
    const g = a.subarray(p, p + c.outputLen);
    h.setInt32(0, v, !1), (d = u._cloneInto(d)).update(y).digestInto(f), g.set(f.subarray(0, g.length)), await Mi(o - 1, s, () => {
      c._cloneInto(d).update(f).digestInto(f);
      for (let m = 0; m < g.length; m++)
        g[m] ^= f[m];
    });
  }
  return Xs(c, u, a, d, f);
}
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const ea = (e) => e[0] === "あいこくしん";
function lo(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function uo(e) {
  const t = lo(e), n = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(n.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: n };
}
function yo(e) {
  Li(e, 16, 20, 24, 28, 32);
}
const ta = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([Br(e)[0] >> t << t]);
};
function fo(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), wt.chain(wt.checksum(1, ta), wt.radix2(11, !0), wt.alphabet(e));
}
function na(e, t) {
  const { words: n } = uo(e), r = fo(t).decode(n);
  return yo(r), r;
}
function ra(e, t) {
  return yo(e), fo(t).encode(e).join(ea(t) ? "　" : " ");
}
function oa(e, t) {
  try {
    na(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const ia = (e) => lo("mnemonic" + e);
function sa(e, t = "") {
  return Zs(Oi, uo(e).nfkd, ia(t), { c: 2048, dkLen: 64 });
}
function aa(e) {
  if (e.length !== 16)
    throw new Error("Recovery phrase entropy must be exactly 128 bits (16 bytes).");
  return ra(e, co);
}
function po(e) {
  try {
    return oa(ho(e), co);
  } catch {
    return !1;
  }
}
function ho(e) {
  return e.trim().normalize("NFKD").toLowerCase().split(/\s+/u).join(" ");
}
async function Gn(e) {
  return sa(ho(e), "");
}
const Kt = [1024, 2048, 4096], we = 4;
function ca(e) {
  const t = we + e.length, n = Kt.find((i) => i >= t);
  if (n === void 0)
    throw new Error(`Payload of ${e.length} bytes exceeds the largest padding bucket (${Kt[Kt.length - 1]} bytes minus ${we}-byte length prefix).`);
  const r = new Uint8Array(n);
  return new DataView(r.buffer).setUint32(0, e.length, !1), r.set(e, we), r;
}
function la(e) {
  if (!Kt.includes(e.length))
    throw new Error(`Padded plaintext length ${e.length} does not match a known bucket.`);
  const n = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !1);
  if (n > e.length - we)
    throw new Error("Declared payload length exceeds the padded bucket size.");
  const r = e.slice(we, we + n), o = e.slice(we + n);
  for (const i of o)
    if (i !== 0)
      throw new Error("Padding bytes are not all zero; capsule plaintext is malformed.");
  return r;
}
function ua(e) {
  const t = Ui(e);
  if (t === void 0)
    throw new Error("Value is not JSON-serializable for canonicalization.");
  return t;
}
function da(e) {
  return U(ua(e));
}
const le = 16, ya = 283;
function fa(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function Hn(e) {
  return e << 1 ^ ya & -(e >> 7);
}
function Ae(e, t) {
  let n = 0;
  for (; t > 0; t >>= 1)
    n ^= e & -(t & 1), e = Hn(e);
  return n;
}
const pn = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let n = 0, r = 1; n < 256; n++, r ^= Hn(r))
    e[n] = r;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let n = 0; n < 255; n++) {
    let r = e[255 - n];
    r |= r << 8, t[e[n]] = (r ^ r >> 4 ^ r >> 5 ^ r >> 6 ^ r >> 7 ^ 99) & 255;
  }
  return it(e), t;
})(), pa = /* @__PURE__ */ pn.map((e, t) => pn.indexOf(t)), ha = (e) => e << 24 | e >>> 8, Xt = (e) => e << 8 | e >>> 24;
function vo(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const n = new Uint32Array(256).map((u, d) => t(e[d])), r = n.map(Xt), o = r.map(Xt), i = o.map(Xt), s = new Uint32Array(256 * 256), a = new Uint32Array(256 * 256), c = new Uint16Array(256 * 256);
  for (let u = 0; u < 256; u++)
    for (let d = 0; d < 256; d++) {
      const y = u * 256 + d;
      s[y] = n[u] ^ r[d], a[y] = o[u] ^ i[d], c[y] = e[u] << 8 | e[d];
    }
  return { sbox: e, sbox2: c, T0: n, T1: r, T2: o, T3: i, T01: s, T23: a };
}
const Jn = /* @__PURE__ */ vo(pn, (e) => Ae(e, 3) << 24 | e << 16 | e << 8 | Ae(e, 2)), wo = /* @__PURE__ */ vo(pa, (e) => Ae(e, 11) << 24 | Ae(e, 13) << 16 | Ae(e, 9) << 8 | Ae(e, 14)), va = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, n = 1; t < 16; t++, n = Hn(n))
    e[t] = n;
  return e;
})();
function go(e) {
  Ln(e);
  const t = e.length;
  fa(e);
  const { sbox2: n } = Jn, r = [];
  (!Qe || !Ye(e)) && r.push(e = Xe(e));
  const o = ee(ne(e)), i = o.length, s = (c) => B(n, c, c, c, c), a = new Uint32Array(t + 28);
  a.set(o);
  for (let c = i; c < a.length; c++) {
    let u = a[c - 1];
    c % i === 0 ? u = s(ha(u)) ^ va[c / i - 1] : i > 6 && c % i === 4 && (u = s(u)), a[c] = a[c - i] ^ u;
  }
  return it(...r), a;
}
function wa(e) {
  const t = go(e), n = t.slice(), r = t.length, { sbox2: o } = Jn, { T0: i, T1: s, T2: a, T3: c } = wo;
  for (let u = 0; u < r; u += 4)
    for (let d = 0; d < 4; d++)
      n[u + d] = t[r - u - 4 + d];
  it(t);
  for (let u = 4; u < r - 4; u++) {
    const d = n[u], y = B(o, d, d, d, d);
    n[u] = i[y & 255] ^ s[y >>> 8 & 255] ^ a[y >>> 16 & 255] ^ c[y >>> 24];
  }
  return n;
}
function re(e, t, n, r, o, i) {
  return e[n << 8 & 65280 | r >>> 8 & 255] ^ t[o >>> 8 & 65280 | i >>> 24 & 255];
}
function B(e, t, n, r, o) {
  return e[t & 255 | n & 65280] | e[r >>> 16 & 255 | o >>> 16 & 65280] << 16;
}
function Er(e, t, n, r, o) {
  const { sbox2: i, T01: s, T23: a } = Jn;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const u = e.length / 4 - 2;
  for (let v = 0; v < u; v++) {
    const p = e[c++] ^ re(s, a, t, n, r, o), g = e[c++] ^ re(s, a, n, r, o, t), m = e[c++] ^ re(s, a, r, o, t, n), k = e[c++] ^ re(s, a, o, t, n, r);
    t = p, n = g, r = m, o = k;
  }
  const d = e[c++] ^ B(i, t, n, r, o), y = e[c++] ^ B(i, n, r, o, t), h = e[c++] ^ B(i, r, o, t, n), f = e[c++] ^ B(i, o, t, n, r);
  return { s0: d, s1: y, s2: h, s3: f };
}
function ga(e, t, n, r, o) {
  const { sbox2: i, T01: s, T23: a } = wo;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const u = e.length / 4 - 2;
  for (let v = 0; v < u; v++) {
    const p = e[c++] ^ re(s, a, t, o, r, n), g = e[c++] ^ re(s, a, n, t, o, r), m = e[c++] ^ re(s, a, r, n, t, o), k = e[c++] ^ re(s, a, o, r, n, t);
    t = p, n = g, r = m, o = k;
  }
  const d = e[c++] ^ B(i, t, o, r, n), y = e[c++] ^ B(i, n, t, o, r), h = e[c++] ^ B(i, r, n, t, o), f = e[c++] ^ B(i, o, r, n, t);
  return { s0: d, s1: y, s2: h, s3: f };
}
function ma(e) {
  if (Ln(e), e.length % le !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + le);
}
function ba(e, t, n) {
  Ln(e);
  let r = e.length;
  const o = r % le;
  if (!t && o !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (t) {
    let a = le - o;
    a || (a = le), r = r + a;
  }
  n = zr(r, n), Qr(e, n), (!Qe || !Ye(e)) && (e = Xe(e));
  const i = ne(e);
  ee(i);
  const s = ne(n);
  return { b: i, o: s, out: n };
}
function ka(e, t) {
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
function Ea(e) {
  const t = new Uint8Array(16), n = ne(t);
  t.set(e);
  const r = le - e.length;
  for (let o = le - r; o < le; o++)
    t[o] = r;
  return n;
}
const mo = /* @__PURE__ */ Hi({ blockSize: 16, nonceLength: 16 }, function(t, n, r = {}) {
  const o = !r.disablePadding;
  return {
    encrypt(i, s) {
      const a = go(t), { b: c, o: u, out: d } = ba(i, o, s);
      let y = n;
      const h = [a];
      (!Qe || !Ye(y)) && h.push(y = Xe(y));
      const f = ne(y);
      ee(f);
      let v = f[0], p = f[1], g = f[2], m = f[3], k = 0;
      for (; k + 4 <= c.length; )
        v ^= c[k + 0], p ^= c[k + 1], g ^= c[k + 2], m ^= c[k + 3], { s0: v, s1: p, s2: g, s3: m } = Er(a, v, p, g, m), u[k++] = v, u[k++] = p, u[k++] = g, u[k++] = m;
      if (o) {
        const b = Ea(i.subarray(k * 4));
        ee(b), v ^= b[0], p ^= b[1], g ^= b[2], m ^= b[3], { s0: v, s1: p, s2: g, s3: m } = Er(a, v, p, g, m), u[k++] = v, u[k++] = p, u[k++] = g, u[k++] = m;
      }
      return ee(u), it(...h), d;
    },
    decrypt(i, s) {
      ma(i);
      const a = wa(t);
      let c = n;
      const u = [a];
      (!Qe || !Ye(c)) && u.push(c = Xe(c));
      const d = ne(c);
      ee(d), s = zr(i.length, s), Qr(i, s), (!Qe || !Ye(i)) && u.push(i = Xe(i));
      const y = ne(i), h = ne(s);
      ee(y);
      let f = d[0], v = d[1], p = d[2], g = d[3];
      for (let m = 0; m + 4 <= y.length; ) {
        const k = f, b = v, P = p, M = g;
        f = y[m + 0], v = y[m + 1], p = y[m + 2], g = y[m + 3];
        const { s0: q, s1: X, s2: fe, s3: Gt } = ga(a, f, v, p, g);
        h[m++] = q ^ k, h[m++] = X ^ b, h[m++] = fe ^ P, h[m++] = Gt ^ M;
      }
      return ee(h), it(...u), ka(s, o);
    }
  };
});
function bo(e, t) {
  const n = In(new Uint8Array([2]), jr(t));
  return qi.getSharedSecret(e, n, !0).slice(1, 33);
}
function _a(e, t, n) {
  return Pa(e, t, n, O(16));
}
function Pa(e, t, n, r) {
  if (r.length !== 16)
    throw new Error("NIP-04 iv must be exactly 16 bytes.");
  const o = bo(e, t), i = mo(o, r).encrypt(U(n));
  return `${Nt.encode(i)}?iv=${Nt.encode(r)}`;
}
function Ka(e, t, n) {
  const r = n.indexOf("?iv=");
  if (r === -1)
    throw new Error('NIP-04 payload is missing its "?iv=" suffix.');
  const o = Nt.decode(n.slice(0, r)), i = Nt.decode(n.slice(r + 4)), s = bo(e, t), a = mo(s, i).decrypt(o);
  return Mn(a);
}
class ke extends Error {
  reason;
  constructor(t) {
    super("Account not found or credentials incorrect."), this.name = "AccountNotFoundError", this.reason = t;
  }
}
class oe extends Error {
  constructor(t) {
    super(t), this.name = "RegistrationFailedError";
  }
}
class ko extends Error {
  constructor(t = "An account already exists with this login name and password. Sign in instead, or choose different credentials.") {
    super(t), this.name = "AccountAlreadyExistsError";
  }
}
class ie extends Error {
  constructor(t) {
    super(t), this.name = "RecoveryFailedError";
  }
}
class Eo extends Error {
  seenGeneration;
  capsuleGeneration;
  constructor(t, n) {
    super(`This credential capsule reports generation ${n}, but this device has already seen generation ${t}. Refusing to log in with older, possibly-revoked credentials.`), this.name = "RollbackDetectedError", this.seenGeneration = t, this.capsuleGeneration = n;
  }
}
function lt(e, t) {
  const n = t ?? Math.floor(Date.now() / 1e3);
  return e == null ? n : Math.max(n, e + 1);
}
const Sa = { generation: -1, recoveryGeneration: -1 };
function zn(e) {
  return `bitlogin:hwm:${e}`;
}
async function Qn(e, t) {
  const n = await e.get(zn(t));
  return n ? JSON.parse(n) : Sa;
}
async function _o(e, t, n) {
  const r = await Qn(e, t), o = {
    generation: Math.max(r.generation, n.generation ?? -1),
    recoveryGeneration: Math.max(r.recoveryGeneration, n.recoveryGeneration ?? -1)
  };
  return await e.set(zn(t), JSON.stringify(o)), o;
}
async function Aa(e, t, n = { generation: 0, recoveryGeneration: -1 }) {
  await e.set(zn(t), JSON.stringify(n));
}
function Ra(e, t, n) {
  return L({ pubkey: E(e), created_at: n, kind: Ct, tags: [], content: JSON.stringify(t) }, e);
}
function Ca(e, t, n) {
  const r = t.map((o) => {
    const i = ["r", o.url];
    return o.read && !o.write && i.push("read"), o.write && !o.read && i.push("write"), i;
  });
  return L({ pubkey: E(e), created_at: n, kind: rt, tags: r, content: "" }, e);
}
function Na(e, t, n) {
  return L({
    pubkey: E(e),
    created_at: n,
    kind: Cn,
    tags: t.map((r) => ["relay", r]),
    content: ""
  }, e);
}
function Ta(e) {
  return e.tags.filter((t) => t[0] === "r" && t[1]).map((t) => t[1]);
}
function Ma(e) {
  return e.tags.filter((t) => t[0] === "relay" && t[1]).map((t) => t[1]);
}
async function Ia(e) {
  const t = E(e.everydayPrivateKey), n = Math.floor(Date.now() / 1e3), r = [.../* @__PURE__ */ new Set([...e.generalRelays, ...e.dmRelays, ...e.discoveryRelays])], o = new K(r), [i, s, a] = await Promise.all([
    o.queryQuorum({ authors: [t], kinds: [Ct] }),
    o.queryQuorum({ authors: [t], kinds: [rt] }),
    o.queryQuorum({ authors: [t], kinds: [Cn] })
  ]);
  o.closeAll();
  const c = i.outcomes.some((g) => g.events.length > 0), u = s.outcomes.some((g) => g.events.length > 0), d = a.outcomes.some((g) => g.events.length > 0), y = new K(r);
  let h = null, f = null, v = null;
  const p = [];
  if (!c && (e.name || e.about || e.picture)) {
    const g = Ra(e.everydayPrivateKey, { name: e.name, about: e.about, picture: e.picture }, n);
    p.push(y.publishAll(g).then((m) => void (h = m)));
  }
  if (!u) {
    const g = Ca(e.everydayPrivateKey, e.generalRelays.map((m) => ({ url: m, read: !0, write: !0 })), n);
    p.push(y.publishAll(g).then((m) => void (f = m)));
  }
  if (!d) {
    const g = Na(e.everydayPrivateKey, e.dmRelays, n);
    p.push(y.publishAll(g).then((m) => void (v = m)));
  }
  return await Promise.all(p), y.closeAll(), {
    profilePublished: h !== null && j(h) > 0,
    relayListAcknowledgedCount: f !== null ? j(f) : 0,
    dmRelayListAcknowledgedCount: v !== null ? j(v) : 0,
    profileSkippedExisting: c,
    relayListSkippedExisting: u,
    dmRelayListSkippedExisting: d
  };
}
async function Ee(e, t, n) {
  const r = n.minAcks ?? 2, o = n.minReadbacks ?? 2, i = await e.publishAll(t, n.timeoutMs), s = j(i), c = (await e.queryQuorum({ kinds: [x], authors: [t.pubkey], "#d": [n.dTag], limit: 5 }, n.timeoutMs)).outcomes.filter((u) => u.events.some((d) => d.id === t.id)).length;
  return {
    acknowledgedCount: s,
    readbackVerifiedCount: c,
    success: s >= r && c >= o
  };
}
function Po(e) {
  return U(`bitlogin|password-capsule|v1|${e}|30078|bitlogin:password:v1`);
}
function Ko(e) {
  return U(`bitlogin|recovery-capsule|v1|${e}|30078|bitlogin:recovery:v1`);
}
async function Yn(e, t, n) {
  const r = da(e), o = ca(r), i = await so(t, o, n);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    nonce: T(i.nonce),
    ciphertext: T(i.ciphertext)
  };
}
async function Xn(e, t, n) {
  if (e.version !== 1 || e.algorithm !== "aes-256-gcm")
    throw new Error(`Unsupported capsule envelope version/algorithm: ${e.version}/${e.algorithm}`);
  const r = I(e.nonce), o = I(e.ciphertext), i = await ao(t, r, o, n), s = la(i);
  return JSON.parse(Mn(s));
}
class Zn extends Error {
  constructor(t) {
    super(t), this.name = "CapsuleValidationError";
  }
}
const xa = 1e6, Da = /^[0-9a-f]{64}$/u;
function N(e, t) {
  if (!e)
    throw new Zn(t);
}
function It(e) {
  return typeof e == "string" && Da.test(e);
}
function So(e) {
  N(Array.isArray(e), "vault_relay_hints must be an array (§12.4.7).");
  for (const t of e)
    N(typeof t == "string", "Each relay hint must be a string (§12.4.7)."), N(pt(t), `Relay URL must use secure WebSockets, except for an explicit loopback development endpoint (§12.4.7): ${t}`);
}
function Ao(e) {
  N(typeof e == "string", "account_id must be a string (§12.4.2).");
  let t;
  try {
    t = I(e);
  } catch {
    throw new Zn("account_id is not valid base64url (§12.4.2).");
  }
  N(t.length === 16, "account_id must decode to exactly 128 bits (§12.4.2).");
}
function Ro(e, t) {
  N(typeof e == "string", "operational_private_key must be a string (§12.4.3).");
  const n = I(e);
  N(n.length === 32, "operational_private_key must be exactly 32 bytes (§12.4.3)."), N(xn(n), "operational_private_key is not a valid secp256k1 scalar (§12.4.3)."), N(It(t), "operational_public_key must be lowercase 64-char hex (§12.4.4).");
  const r = E(n);
  N(r === t, "operational_public_key does not match the derived public key (§12.4.4).");
}
function xt(e, t) {
  N(typeof t == "string", `${e} must be a string (§CV5.2).`);
  let n;
  try {
    n = I(t);
  } catch {
    throw new Zn(`${e} is not valid base64url (§CV5.2).`);
  }
  N(n.length === 32, `${e} must decode to exactly 32 bytes (§CV5.2).`);
}
function Oa(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (N(t !== void 0 && n !== void 0, "connection_vault_root and vault_sudo_key must appear together (§CV5.2)."), xt("connection_vault_root", t), xt("vault_sudo_key", n));
}
function La(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (N(t !== void 0, "vault_sudo_key cannot appear without connection_vault_root (§CV5.2)."), xt("connection_vault_root", t), n !== void 0 && xt("vault_sudo_key", n));
}
function Co(e, t) {
  N(Number.isInteger(e) && e >= 0 && e <= xa, `${t} is out of supported bounds (§12.4.8).`);
}
function Ua(e) {
  N(e.schema === $t, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), Ao(e.account_id), Co(e.generation, "generation"), Ro(e.operational_private_key, e.operational_public_key), N(It(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex (§12.4.5)."), So(e.vault_relay_hints), La(e);
  const t = e.recovery_capsule_event;
  N(!!t && typeof t == "object", "recovery_capsule_event must be present (§12.4.6)."), N(C(t), "Embedded recovery_capsule_event has an invalid event id or signature (§12.4.6)."), N(t.pubkey === e.recovery_public_key, "Embedded recovery_capsule_event author does not match recovery_public_key (§12.4.5).");
}
function qa(e) {
  N(e.schema === Ft, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), Ao(e.account_id), Co(e.recovery_generation, "recovery_generation"), N(e.previous_recovery_event_id === null || It(e.previous_recovery_event_id), "previous_recovery_event_id must be null or lowercase 64-char hex (§12.3)."), Ro(e.operational_private_key, e.operational_public_key), N(It(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex."), So(e.vault_relay_hints), Oa(e);
}
function Va(e) {
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
async function er(e) {
  const t = E(e.locatorPrivateKey), n = await Yn(e.payload, e.capsuleKey, Po(t));
  return L({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: x,
    tags: [["d", Oe]],
    content: JSON.stringify(n)
  }, e.locatorPrivateKey);
}
function Fa(e) {
  const t = E(e.oldLocatorPrivateKey);
  return L({
    pubkey: t,
    created_at: e.createdAt,
    kind: x,
    tags: [["d", Oe]],
    content: ""
  }, e.oldLocatorPrivateKey);
}
async function $a(e, t) {
  if (!C(e))
    throw new Error("Credential capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await Xn(n, t, Po(e.pubkey));
  return Ua(r), r;
}
async function tr(e) {
  const t = E(e.recoveryPrivateKey), n = await Yn(e.payload, e.capsuleKey, Ko(t));
  return L({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: x,
    tags: [["d", yt]],
    content: JSON.stringify(n)
  }, e.recoveryPrivateKey);
}
async function No(e, t) {
  if (!C(e))
    throw new Error("Recovery capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await Xn(n, t, Ko(e.pubkey));
  return qa(r), r;
}
function _r(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  for (const o of e)
    o.pubkey === t && o.kind === x && Le(o, "d") === n && C(o) && r.set(o.id, o);
  return [...r.values()].sort((o, i) => i.created_at - o.created_at);
}
async function To(e, t, n, r, o) {
  const i = await e.queryQuorum({ kinds: [x], authors: [t], "#d": [n], limit: 5 }, o), s = i.outcomes.flatMap((h) => h.events), a = _r(s, t, n), c = [];
  for (const h of a)
    try {
      const f = await r(h);
      c.push({ event: h, payload: f });
    } catch (f) {
      c.push({ event: h, payload: null, error: f.message });
    }
  const u = c.find((h) => h.payload !== null) ?? null, d = i.outcomes.map((h) => ({
    responded: h.responded,
    events: _r(h.events, t, n)
  })).filter((h) => h.responded && h.events.length > 0).map((h) => h.events[0].id), y = new Set(d).size > 1;
  return {
    quorumMet: i.quorumMet,
    respondedCount: i.respondedCount,
    totalCount: i.totalCount,
    candidates: c,
    best: u,
    relayDisagreement: y
  };
}
async function ut(e, t, n, r = 8e3) {
  return To(e, t, Oe, (o) => $a(o, n), r);
}
async function Mo(e, t, n, r = 8e3) {
  return To(e, t, yt, (o) => No(o, n), r);
}
function Wa(e) {
  const t = e.filter((n) => n.payload !== null);
  return t.length < 2 ? { consistent: !0 } : Va(t.map((n) => ({
    eventId: n.event.id,
    recoveryGeneration: n.payload.recovery_generation,
    previousRecoveryEventId: n.payload.previous_recovery_event_id
  })));
}
async function Pr(e) {
  const t = [...new Set(e.relayUrls)], n = async (a) => {
    const c = new K(t);
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
function Ba(e) {
  const t = Le(e, "d");
  if (e.kind !== x || t === void 0 || !C(e))
    throw new Error("This session's capsule event is not a valid capsule.");
  return { pubkey: e.pubkey, dTag: t };
}
function ja(e, t, n) {
  const r = e.filter((i) => i.pubkey === n.pubkey && i.kind === x && Le(i, "d") === n.dTag && C(i));
  return r.some((i) => i.id === t.id) ? "current" : r.length === 0 ? "missing" : Math.max(...r.map((i) => i.created_at)) >= t.created_at ? "newer" : "older";
}
async function Kr(e, t, n) {
  const r = Ba(t), o = new K(e);
  try {
    const i = await o.queryQuorum({
      kinds: [x],
      authors: [r.pubkey],
      "#d": [r.dTag],
      limit: 5
    }, n);
    return new Map(i.outcomes.map((s) => [
      s.relayUrl,
      s.responded ? { status: ja(s.events, t, r) } : { status: "unreachable", error: s.error }
    ]));
  } finally {
    o.closeAll();
  }
}
async function Ga(e) {
  const t = [...new Set(e.relayUrls)], [n, r] = await Promise.all([
    Kr(t, e.credentialEvent, e.timeoutMs),
    Kr(t, e.recoveryEvent, e.timeoutMs)
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
const nr = Si.id, Ne = "aes-256-gcm-v1", Te = "bitlogin-bip39-hkdf-v1", Io = "bitlogin-recovery-hkdf-v1", Ha = 4, Ja = 64;
function Me(e) {
  return [...new Set(e)].filter((t) => t.length <= Ja).slice(0, Ha);
}
function Ie(e) {
  return e ? { everyday_derivation: Io } : {};
}
function xo(e) {
  return e.protocol?.everyday_derivation === Io;
}
async function Do(e) {
  const t = Wt(e.loginName), n = e.now ?? Math.floor(Date.now() / 1e3), { locatorPrivateKey: r, capsuleKey: o } = await ot(e.password, t);
  try {
    const i = E(r), s = new K(e.vaultRelayUrls, {
      authPrivateKey: r
    });
    let a;
    try {
      a = await ut(s, i, o, e.timeoutMs);
    } finally {
      s.closeAll();
    }
    if (!a.quorumMet)
      throw new oe("Couldn't verify this login name and password aren't already registered. Please retry, or add more vault relays.");
    if (a.candidates.length > 0)
      throw new ko();
    const c = e.everydayPrivateKey !== void 0;
    if (c && !xn(e.everydayPrivateKey))
      throw new oe("The provided key is not a valid secp256k1 private key.");
    const u = aa(Vi()), d = await Gn(u);
    let y, h, f;
    try {
      ({ recoveryPrivateKey: y, capsuleKey: h } = Nn(d)), f = c ? e.everydayPrivateKey : Tn(d);
    } finally {
      _(d);
    }
    const v = !c, p = O(32), g = O(32);
    let m = !1;
    try {
      const k = E(y), b = E(f), P = T(Gr()), M = {
        schema: Ft,
        account_id: P,
        recovery_generation: 0,
        previous_recovery_event_id: null,
        operational_private_key: T(f),
        operational_public_key: b,
        recovery_public_key: k,
        connection_vault_root: T(p),
        vault_sudo_key: T(g),
        created_at: n,
        vault_relay_hints: Me(e.vaultRelayUrls),
        protocol: {
          capsule_encryption: Ne,
          recovery_derivation: Te,
          ...Ie(v)
        }
      }, q = await tr({
        recoveryPrivateKey: y,
        capsuleKey: h,
        payload: M
      }), X = new K(e.vaultRelayUrls, {
        authPrivateKey: y
      });
      let fe;
      try {
        fe = await Ee(X, q, {
          dTag: yt,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        X.closeAll();
      }
      if (!fe.success)
        throw new oe("The recovery capsule did not reach the required relay acknowledgement and readback quorum. No login credential was published. Please retry, or add more vault relays.");
      const Gt = {
        schema: $t,
        account_id: P,
        generation: 0,
        operational_private_key: T(f),
        operational_public_key: b,
        recovery_public_key: k,
        recovery_capsule_event: q,
        connection_vault_root: T(p),
        created_at: n,
        vault_relay_hints: Me(e.vaultRelayUrls),
        protocol: {
          password_kdf: nr,
          capsule_encryption: Ne,
          recovery_derivation: Te,
          ...Ie(v)
        }
      }, yr = await er({
        locatorPrivateKey: r,
        capsuleKey: o,
        payload: Gt
      }), fr = new K(e.vaultRelayUrls, {
        authPrivateKey: r
      });
      let Ht;
      try {
        Ht = await Ee(fr, yr, {
          dTag: Oe,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        fr.closeAll();
      }
      if (!Ht.success)
        throw new oe("Registration did not reach the required credential acknowledgement and readback quorum. Please retry, or add more vault relays.");
      return m = !0, {
        normalizedLoginName: t,
        recoveryPhrase: u,
        everydayPrivateKey: f,
        everydayPublicKey: b,
        recoveryPublicKey: k,
        locatorPublicKey: i,
        accountId: P,
        imported: c,
        everydayKeyDerived: v,
        connectionVaultRoot: p,
        vaultSudoKey: g,
        credentialEvent: yr,
        recoveryEvent: q,
        credentialPublish: Ht,
        recoveryPublish: fe
      };
    } finally {
      _(y, h), m || (c || _(f), _(p, g));
    }
  } finally {
    _(r, o);
  }
}
async function za(e) {
  const { nsecOrHex: t, ...n } = e, r = Oo(t);
  return Do({ ...n, everydayPrivateKey: r });
}
function Oo(e) {
  const t = e.trim();
  let n;
  if (t.startsWith("nsec1"))
    n = Ai(t);
  else if (/^[0-9a-fA-F]{64}$/u.test(t))
    n = jr(t.toLowerCase());
  else
    throw new oe("Enter a valid nsec (nsec1…) or a 64-character hex private key.");
  if (!xn(n))
    throw new oe("The provided key is not a valid secp256k1 private key.");
  return n;
}
class Lo {
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
async function Qa(e) {
  const t = Wt(e.loginName), { locatorPrivateKey: n, capsuleKey: r } = await ot(e.password, t), o = E(n), i = new K(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  try {
    const s = await ut(i, o, r, e.timeoutMs);
    if (!s.quorumMet)
      throw new ke("quorum-not-met");
    if (!s.best)
      throw new ke(s.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
    const a = s.best.payload, c = e.store ?? new Lo(), u = await Qn(c, a.operational_public_key), d = a.generation < u.generation;
    if (d && !e.acknowledgeRollback)
      throw new Eo(u.generation, a.generation);
    const y = d ? `This device previously saw credential generation ${u.generation}, but the accepted capsule is generation ${a.generation}. Relays may be serving stale data, or an old capsule is being replayed.` : void 0;
    await _o(c, a.operational_public_key, {
      generation: a.generation
    });
    const h = s.relayDisagreement ? 'Configured relays returned different credential capsules as "latest" for this account. Some relays may be stale, censored, or malicious.' : void 0;
    return {
      everydayPrivateKey: I(a.operational_private_key),
      everydayPublicKey: a.operational_public_key,
      recoveryPublicKey: a.recovery_public_key,
      accountId: a.account_id,
      generation: a.generation,
      everydayKeyDerived: xo(a),
      credentialEvent: s.best.event,
      recoveryCapsuleEvent: a.recovery_capsule_event,
      connectionVaultRoot: a.connection_vault_root ? I(a.connection_vault_root) : void 0,
      rollbackWarning: y,
      relayDisagreementWarning: h
    };
  } finally {
    i.closeAll();
  }
}
function Sr(e) {
  return e.filter((t) => C(t)).sort((t, n) => n.created_at - t.created_at)[0];
}
async function Ya(e) {
  if (!po(e.phrase))
    throw new ie("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await Gn(e.phrase), { recoveryPrivateKey: n, capsuleKey: r } = Nn(t), o = Tn(t), i = E(o);
  _(t, o);
  const s = E(n), a = new K(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  let c;
  try {
    c = await Mo(a, s, r, e.timeoutMs);
  } finally {
    a.closeAll();
  }
  if (e.offlineRecoveryCapsuleEvents?.length) {
    const p = [];
    for (const b of e.offlineRecoveryCapsuleEvents)
      if (C(b))
        try {
          p.push({
            event: b,
            payload: await No(b, r)
          });
        } catch (P) {
          p.push({
            event: b,
            payload: null,
            error: P.message
          });
        }
    const g = /* @__PURE__ */ new Map();
    for (const b of [...c.candidates, ...p])
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
    throw new ke("quorum-not-met");
  if (!c.best)
    throw new ke(c.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const u = c.best.payload, d = Wa(c.candidates), y = I(u.operational_private_key), h = u.operational_public_key, { generalRelays: f, dmRelays: v } = await Uo(h, [...e.discoveryRelayUrls, ...u.vault_relay_hints], e.timeoutMs);
  return {
    everydayPrivateKey: y,
    everydayPublicKey: h,
    recoveryPrivateKey: n,
    recoveryPublicKey: s,
    recoveryCapsuleKey: r,
    accountId: u.account_id,
    currentRecoveryEvent: c.best.event,
    currentRecoveryPayload: u,
    generalRelays: f,
    dmRelays: v,
    chainWarning: d.consistent ? void 0 : d.warning,
    everydayKeyDerived: h === i
  };
}
async function Uo(e, t, n) {
  const r = new K([...new Set(t)]);
  let o = [], i = [];
  try {
    const s = await r.queryQuorum({ kinds: [rt], authors: [e], limit: 5 }, n), a = Sr(s.outcomes.flatMap((d) => d.events));
    a && (o = Ta(a));
    const c = await r.queryQuorum({ kinds: [Cn], authors: [e], limit: 5 }, n), u = Sr(c.outcomes.flatMap((d) => d.events));
    u && (i = Ma(u));
  } finally {
    r.closeAll();
  }
  return { generalRelays: o, dmRelays: i };
}
async function qo(e) {
  if (!po(e))
    throw new ie("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await Gn(e);
  try {
    const { recoveryPrivateKey: n, capsuleKey: r } = Nn(t), o = Tn(t);
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
async function Vo(e, t, n) {
  const r = new K(t, {
    authPrivateKey: e.recoveryPrivateKey
  });
  let o;
  try {
    o = await Mo(r, e.recoveryPublicKey, e.capsuleKey, n);
  } finally {
    r.closeAll();
  }
  if (!o.quorumMet)
    throw new ke("quorum-not-met");
  if (o.best)
    throw new ie("This account's recovery capsule is still on the relays. Use normal recovery instead of a rebuild.");
  return o.candidates.length > 0 ? Math.max(...o.candidates.map((i) => i.event.created_at)) : null;
}
async function Xa(e) {
  const t = await qo(e.phrase);
  try {
    await Vo(t, e.vaultRelayUrls, e.timeoutMs);
    const n = new K([
      .../* @__PURE__ */ new Set([...e.discoveryRelayUrls, ...e.vaultRelayUrls])
    ]);
    try {
      const o = (await n.queryQuorum({
        kinds: [Ct, rt],
        authors: [t.everydayPublicKey],
        limit: 10
      }, e.timeoutMs)).outcomes.flatMap((i) => i.events).filter((i) => i.pubkey === t.everydayPublicKey && C(i));
      return {
        everydayPublicKey: t.everydayPublicKey,
        profileFound: o.some((i) => i.kind === Ct),
        relayListFound: o.some((i) => i.kind === rt)
      };
    } finally {
      n.closeAll();
    }
  } finally {
    _(t.recoveryPrivateKey, t.capsuleKey, t.everydayPrivateKey);
  }
}
async function Za(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = await qo(e.phrase);
  let r = !1;
  try {
    const o = await Vo(n, e.vaultRelayUrls, e.timeoutMs), i = {
      schema: Ft,
      account_id: T(Gr()),
      recovery_generation: 0,
      previous_recovery_event_id: null,
      operational_private_key: T(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      connection_vault_root: T(O(32)),
      vault_sudo_key: T(O(32)),
      created_at: o === null ? t : lt(o, t),
      vault_relay_hints: Me(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: Ne,
        recovery_derivation: Te,
        ...Ie(!0)
      }
    }, s = await tr({
      recoveryPrivateKey: n.recoveryPrivateKey,
      capsuleKey: n.capsuleKey,
      payload: i
    }), a = new K(e.vaultRelayUrls, {
      authPrivateKey: n.recoveryPrivateKey
    });
    let c;
    try {
      c = await Ee(a, s, {
        dTag: yt,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      a.closeAll();
    }
    if (!c.success)
      throw new ie("Could not publish the rebuilt recovery capsule to enough relays. Nothing else was changed; please retry.");
    const { generalRelays: u, dmRelays: d } = await Uo(n.everydayPublicKey, [...e.discoveryRelayUrls, ...e.vaultRelayUrls], e.timeoutMs);
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
    r || _(n.recoveryPrivateKey, n.capsuleKey, n.everydayPrivateKey);
  }
}
async function ec(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = Wt(e.newLoginName), { recovered: r } = e, o = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root,
    vault_sudo_key: r.currentRecoveryPayload.vault_sudo_key
  } : {}, i = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root
  } : {}, { locatorPrivateKey: s, capsuleKey: a } = await ot(e.newPassword, n);
  try {
    const c = E(s), u = new K(e.vaultRelayUrls, {
      authPrivateKey: s
    });
    let d;
    try {
      d = await ut(u, c, a, e.timeoutMs);
    } finally {
      u.closeAll();
    }
    if (!d.quorumMet)
      throw new ie("Couldn't verify the new login name and password aren't already registered. Please retry, or add more vault relays.");
    const y = d.best?.payload ?? null, h = y !== null && y.account_id === r.accountId && y.operational_public_key === r.everydayPublicKey && y.recovery_public_key === r.recoveryPublicKey && y.generation === 0 && y.recovery_capsule_event.id === r.currentRecoveryEvent.id;
    if (d.candidates.length > 0 && !h)
      throw new ie("Another account is already registered with that login name and password. Pick a different one.");
    const f = r.currentRecoveryPayload.recovery_generation + 1, v = {
      schema: Ft,
      account_id: r.accountId,
      recovery_generation: f,
      previous_recovery_event_id: r.currentRecoveryEvent.id,
      operational_private_key: T(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      ...o,
      created_at: lt(r.currentRecoveryEvent.created_at, t),
      vault_relay_hints: Me(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: Ne,
        recovery_derivation: Te,
        ...Ie(r.everydayKeyDerived)
      }
    }, p = await tr({
      recoveryPrivateKey: r.recoveryPrivateKey,
      capsuleKey: r.recoveryCapsuleKey,
      payload: v
    }), g = new K(e.vaultRelayUrls, {
      authPrivateKey: r.recoveryPrivateKey
    });
    let m;
    try {
      m = await Ee(g, p, {
        dTag: yt,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      g.closeAll();
    }
    if (!m.success)
      throw new ie("Could not publish the refreshed recovery capsule to enough relays. No new credential was published; please retry.");
    r.currentRecoveryEvent = p, r.currentRecoveryPayload = v;
    const k = {
      schema: $t,
      account_id: r.accountId,
      generation: 0,
      operational_private_key: T(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      recovery_capsule_event: p,
      ...i,
      // A retry may be repairing a credential that reached only one relay.
      // It must replace that partial event deterministically on every relay.
      created_at: d.best ? lt(d.best.event.created_at, t) : t,
      vault_relay_hints: Me(e.vaultRelayUrls),
      protocol: {
        password_kdf: nr,
        capsule_encryption: Ne,
        recovery_derivation: Te,
        ...Ie(r.everydayKeyDerived)
      }
    }, b = await er({
      locatorPrivateKey: s,
      capsuleKey: a,
      payload: k
    }), P = new K(e.vaultRelayUrls, {
      authPrivateKey: s
    });
    let M;
    try {
      M = await Ee(P, b, {
        dTag: Oe,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      P.closeAll();
    }
    if (!M.success)
      throw new ie("Could not publish the new credential capsule to enough relays. Please retry.");
    return e.store && await Aa(e.store, r.everydayPublicKey, {
      generation: 0,
      recoveryGeneration: f
    }), {
      normalizedLoginName: n,
      locatorPublicKey: c,
      credentialEvent: b,
      refreshedRecoveryEvent: p,
      credentialPublish: M,
      recoveryPublish: m
    };
  } finally {
    _(s, a);
  }
}
async function tc(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = Wt(e.loginName), r = await ot(e.oldPassword, n), o = E(r.locatorPrivateKey), i = new K(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  });
  let s;
  try {
    s = await ut(i, o, r.capsuleKey, e.timeoutMs);
  } finally {
    i.closeAll();
  }
  if (!s.quorumMet)
    throw new ke("quorum-not-met");
  if (!s.best)
    throw new ke(s.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const a = s.best.payload, c = s.best.event, u = e.store ?? new Lo(), d = await Qn(u, a.operational_public_key);
  if (a.generation < d.generation && !e.acknowledgeRollback)
    throw new Eo(d.generation, a.generation);
  const y = await ot(e.newPassword, n), h = E(y.locatorPrivateKey), f = new K(e.vaultRelayUrls, {
    authPrivateKey: y.locatorPrivateKey
  });
  let v;
  try {
    v = await ut(f, h, y.capsuleKey, e.timeoutMs);
  } finally {
    f.closeAll();
  }
  if (!v.quorumMet)
    throw new oe("Couldn't verify the new password isn't already registered under this login name. Please retry, or add more vault relays.");
  if (v.candidates.length > 0)
    throw new ko("Another account is already registered with this login name and the new password you chose. Pick a different new password.");
  const p = a.generation + 1, g = {
    schema: $t,
    account_id: a.account_id,
    generation: p,
    operational_private_key: a.operational_private_key,
    operational_public_key: a.operational_public_key,
    recovery_public_key: a.recovery_public_key,
    recovery_capsule_event: a.recovery_capsule_event,
    // Carry only the session root. A legacy credential may contain the sudo
    // key, but rotation deliberately scrubs it; personal-tier access remains
    // phrase-gated through the recovery capsule.
    ...a.connection_vault_root !== void 0 ? { connection_vault_root: a.connection_vault_root } : {},
    created_at: t,
    vault_relay_hints: Me(e.vaultRelayUrls),
    protocol: {
      password_kdf: nr,
      capsule_encryption: Ne,
      recovery_derivation: Te,
      ...Ie(xo(a))
    }
  }, m = await er({
    locatorPrivateKey: y.locatorPrivateKey,
    capsuleKey: y.capsuleKey,
    payload: g
  }), k = new K(e.vaultRelayUrls, {
    authPrivateKey: y.locatorPrivateKey
  }), b = await Ee(k, m, {
    dTag: Oe,
    minAcks: e.minAcknowledgements,
    timeoutMs: e.timeoutMs
  });
  if (k.closeAll(), !b.success)
    throw new oe("The new credential capsule did not reach the required relay acknowledgement and readback quorum. Your existing password still works; nothing was changed. Please retry.");
  const P = Fa({
    oldLocatorPrivateKey: r.locatorPrivateKey,
    createdAt: lt(c.created_at, t)
  }), M = eo({
    privateKey: r.locatorPrivateKey,
    eventIdToDelete: c.id,
    deletedEventKind: x,
    createdAt: t
  }), q = new K(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  }), [X, fe] = await Promise.all([
    q.publishAll(P, e.timeoutMs),
    q.publishAll(M, e.timeoutMs)
  ]);
  return q.closeAll(), await _o(u, a.operational_public_key, {
    generation: p
  }), {
    normalizedLoginName: n,
    oldLocatorPublicKey: o,
    newLocatorPublicKey: h,
    newGeneration: p,
    recoveryPublicKey: a.recovery_public_key,
    recoveryCapsuleEvent: a.recovery_capsule_event,
    newCredentialEvent: m,
    tombstoneEvent: P,
    deletionRequestEvent: M,
    newCredentialPublish: b,
    tombstoneAcknowledgedCount: j(X),
    deletionAcknowledgedCount: j(fe)
  };
}
const nc = "bitlogin/connection-vault-root/v1", rc = "bitlogin/connection-vault-signing/v1", oc = "bitlogin/connection-record-encryption/v1", ic = "bitlogin/connection-vault-personal/v1", hn = "bitlogin:connection:";
function sc(e) {
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Dn(Hr(nc), e);
}
function Ue(e) {
  return Fi(e, rc).scalar;
}
function Fo(e) {
  const t = Ue(e);
  try {
    return E(t);
  } finally {
    _(t);
  }
}
function ac(e, t) {
  if (t.length !== 32)
    throw new Error("vault_sudo_key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Dn(Hr(ic), In(e, t));
}
function $o(e, t) {
  const n = jt(t);
  return ft(e, In(U(oc), new Uint8Array([0]), n), 32);
}
function cc() {
  return T(O(16));
}
function jt(e) {
  const t = I(e);
  if (t.length !== 16)
    throw new Error("connection_id must decode to exactly 16 bytes (§CV7).");
  return t;
}
function Wo(e) {
  return jt(e), `${hn}${e}`;
}
function Bo(e) {
  if (!e.startsWith(hn))
    return null;
  const t = e.slice(hn.length);
  try {
    return jt(t), t;
  } catch {
    return null;
  }
}
class se {
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
    return this.assertAlive(), L({
      pubkey: this.publicKeyHex,
      created_at: t.created_at ?? Math.floor(Date.now() / 1e3),
      kind: t.kind,
      tags: t.tags ?? [],
      content: t.content
    }, this.privateKey);
  }
  nip44Encrypt(t, n) {
    return this.assertAlive(), yn(me(this.privateKey, t), n);
  }
  nip44Decrypt(t, n) {
    return this.assertAlive(), On(me(this.privateKey, t), n);
  }
  /** Legacy relative to nip44Encrypt above, but still what a real NIP-07 extension exposes as
   * window.nostr.nip04.encrypt -- implemented for drop-in parity. */
  nip04Encrypt(t, n) {
    return this.assertAlive(), _a(this.privateKey, t, n);
  }
  nip04Decrypt(t, n) {
    return this.assertAlive(), Ka(this.privateKey, t, n);
  }
  /** Best-practical secret wipe (§11.10, §21.4): overwrites the private key buffer in place. */
  destroy() {
    _(this.privateKey), this.destroyed = !0;
  }
}
const jo = "bitlogin.connection.v1", Go = "bitlogin.connection.nwc.v1", Ar = 120, lc = /* @__PURE__ */ new Set(["active", "suspended", "deleted"]), uc = /* @__PURE__ */ new Set(["connectable", "personal"]);
class Ke extends Error {
  constructor(t) {
    super(t), this.name = "ConnectionRecordError";
  }
}
function Ho(e, t) {
  return U(`bitlogin|connection-record|v1|${e}|30078|${t}`);
}
function Jo(e) {
  const t = e, n = (i) => {
    throw new Ke(i);
  };
  (!t || typeof t != "object") && n("Connection record must be an object."), t.schema !== jo && n("Unsupported connection record schema (§CV8.3)."), typeof t.connection_id != "string" && n("connection_id must be a string (§CV7)."), (typeof t.connection_type != "string" || t.connection_type.length === 0) && n("connection_type must be a non-empty string (§CV8.3)."), uc.has(t.tier) || n("tier must be connectable or personal."), lc.has(t.state) || n("state must be active, suspended, or deleted (§CV8.3)."), (typeof t.label != "string" || t.label.length > Ar) && n(`label must be a string of at most ${Ar} characters.`), (!Number.isInteger(t.created_at) || !Number.isInteger(t.updated_at)) && n("created_at and updated_at must be integers (§CV8.3).");
  const r = t.credential;
  (!r || typeof r != "object" || typeof r.schema != "string") && n("credential must be an object naming its profile schema (§CV8.3).");
  const o = t.application_binding;
  (!o || typeof o != "object" || o.origin !== null && typeof o.origin != "string" || o.app_pubkey !== null && typeof o.app_pubkey != "string") && n("application_binding must carry origin and app_pubkey (string or null)."), t.notes !== null && typeof t.notes != "string" && n("notes must be a string or null.");
}
async function Zt(e) {
  Jo(e.record);
  const t = Ue(e.vaultPrk), n = E(t), r = Wo(e.record.connection_id), o = $o(e.recordPrk, e.record.connection_id), i = await Yn(e.record, o, Ho(n, r));
  return L({
    pubkey: n,
    created_at: lt(e.previousCreatedAt, e.now),
    kind: x,
    tags: [["d", r]],
    content: JSON.stringify(i)
  }, t);
}
async function dc(e, t, n) {
  if (!C(e))
    throw new Ke("Connection record event has an invalid id or signature.");
  const r = E(Ue(t));
  if (e.pubkey !== r)
    throw new Ke("Connection record event is not signed by this vault's identity.");
  const o = Le(e, "d") ?? "", i = Bo(o);
  if (i === null)
    throw new Ke("Connection record event has a malformed d tag.");
  const s = JSON.parse(e.content), a = Ho(e.pubkey, o), c = [
    { prk: t, tier: "connectable" },
    ...n ? [{ prk: n, tier: "personal" }] : []
  ];
  for (const u of c) {
    let d;
    try {
      d = await Xn(s, $o(u.prk, i), a);
    } catch {
      continue;
    }
    if (Jo(d), d.connection_id !== i)
      throw new Ke("Connection record id does not match its d tag.");
    if (d.tier !== u.tier)
      throw new Ke("Connection record tier does not match the key that decrypted it.");
    return { record: d, tier: u.tier, event: e };
  }
  return null;
}
function yc(e, t) {
  return {
    ...e,
    state: "deleted",
    credential: { schema: e.credential.schema },
    notes: null,
    updated_at: t
  };
}
const Dt = /^[0-9a-f]{64}$/u;
class Z extends Error {
  constructor(t) {
    super(t), this.name = "NwcParseError";
  }
}
function Rr(e) {
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
  if (!Dt.test(r))
    throw new Z("The NWC URI's wallet service pubkey is not 64-char hex.");
  const o = [], i = [];
  let s = null, a = null;
  for (const [c, u] of n.searchParams.entries())
    if (c === "relay") {
      if (!pt(u))
        throw new Z("An NWC relay must use secure WebSockets, except for an explicit loopback development endpoint.");
      o.push(u);
    } else if (c === "secret") {
      const d = u.toLowerCase();
      if (!Dt.test(d))
        throw new Z("The NWC URI's secret is not a 64-char hex client key.");
      s = d;
    } else c === "lud16" ? a = u : i.push([c, u]);
  if (o.length === 0)
    throw new Z("The NWC URI names no relay.");
  if (s === null)
    throw new Z("The NWC URI carries no secret.");
  return {
    schema: Go,
    wallet_pubkey: r,
    relays: o,
    secret: s,
    lud16: a,
    extra_params: i
  };
}
function fc(e) {
  zo(e);
  const t = new URLSearchParams();
  for (const n of e.relays)
    t.append("relay", n);
  t.append("secret", e.secret), e.lud16 !== null && t.append("lud16", e.lud16);
  for (const [n, r] of e.extra_params)
    t.append(n, r);
  return `nostr+walletconnect://${e.wallet_pubkey}?${t.toString()}`;
}
function pc(e, t) {
  return e.wallet_pubkey === t.wallet_pubkey && e.secret === t.secret;
}
function zo(e) {
  const t = e, n = (r) => {
    throw new Z(r);
  };
  (!t || typeof t != "object") && n("NWC credential must be an object."), t.schema !== Go && n("NWC credential has the wrong schema."), (typeof t.wallet_pubkey != "string" || !Dt.test(t.wallet_pubkey)) && n("NWC credential wallet_pubkey must be 64-char lowercase hex."), (!Array.isArray(t.relays) || t.relays.length === 0 || t.relays.some((r) => typeof r != "string")) && n("NWC credential must name at least one relay."), t.relays.some((r) => !pt(r)) && n("NWC relays must use secure WebSockets, except for explicit loopback development endpoints."), (typeof t.secret != "string" || !Dt.test(t.secret)) && n("NWC credential secret must be 64-char lowercase hex."), t.lud16 !== null && typeof t.lud16 != "string" && n("NWC credential lud16 must be a string or null."), (!Array.isArray(t.extra_params) || t.extra_params.some((r) => !Array.isArray(r) || r.length !== 2 || typeof r[0] != "string" || typeof r[1] != "string")) && n("NWC credential extra_params must be [key, value] string pairs.");
}
const hc = "bitlogin:vault-hwm:v2:", vc = "bitlogin/vault-hwm-index/v2", Qo = "bitlogin/vault-hwm-encryption/v2", wc = /^[0-9a-f]{64}$/u;
class ae extends Error {
  constructor() {
    super("The local Connection Vault rollback marker is invalid or has been tampered with."), this.name = "RecordHighWaterMarkError";
  }
}
function rr(e) {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return Number.isInteger(t.createdAt) && (t.createdAt ?? -1) >= 0 && typeof t.eventId == "string" && wc.test(t.eventId);
}
function Yo(e, t) {
  jt(t);
  const n = ft(e, vc, 32), r = U(t);
  try {
    return `${hc}${T(Wr(Br, n, r))}`;
  } finally {
    _(n, r);
  }
}
function gc(e, t) {
  return `bitlogin:vault-hwm:${Fo(e)}:${t}`;
}
async function mc(e, t, n) {
  const r = ft(e, Qo, 32), o = U(JSON.stringify(n)), i = U(t);
  try {
    const s = await so(r, o, i), a = {
      v: 2,
      nonce: T(s.nonce),
      ciphertext: T(s.ciphertext)
    };
    return JSON.stringify(a);
  } finally {
    _(r, o, i);
  }
}
async function bc(e, t, n) {
  const r = ft(e, Qo, 32), o = U(t);
  let i;
  try {
    const s = JSON.parse(n);
    if (s.v !== 2 || typeof s.nonce != "string" || typeof s.ciphertext != "string")
      throw new ae();
    i = await ao(r, I(s.nonce), I(s.ciphertext), o);
    const a = JSON.parse(Mn(i));
    if (!rr(a))
      throw new ae();
    return a;
  } catch (s) {
    throw s instanceof ae ? s : new ae();
  } finally {
    _(r, o), i && _(i);
  }
}
async function Xo(e, t, n, r) {
  const o = Yo(t, n);
  await e.set(o, await mc(t, o, r));
}
async function Zo(e, t, n) {
  const r = Yo(t, n), o = await e.get(r);
  if (o !== void 0)
    return bc(t, r, o);
  const i = gc(t, n), s = await e.get(i);
  if (s === void 0)
    return null;
  try {
    const a = JSON.parse(s);
    if (!rr(a))
      throw new ae();
    return await Xo(e, t, n, a), await e.delete(i), a;
  } catch (a) {
    throw a instanceof ae ? a : new ae();
  }
}
async function ei(e, t, n, r) {
  if (!rr(r))
    throw new ae();
  const o = await Zo(e, t, n);
  o && un({ created_at: r.createdAt, id: r.eventId }, { created_at: o.createdAt, id: o.eventId }) <= 0 || await Xo(e, t, n, r);
}
async function kc(e) {
  const t = Ue(e.vaultPrk), n = new K(e.relayUrls, { authPrivateKey: t });
  let r;
  try {
    r = await Ee(n, e.event, {
      dTag: Wo(e.connectionId),
      minAcks: e.minAcknowledgements,
      // The readback bar follows the ack bar: a caller publishing to fewer
      // relays (a targeted repair, a test) has already lowered its quorum.
      minReadbacks: e.minAcknowledgements,
      timeoutMs: e.timeoutMs
    });
  } finally {
    n.closeAll(), _(t);
  }
  return r.success && await ei(e.store, e.vaultPrk, e.connectionId, {
    createdAt: e.event.created_at,
    eventId: e.event.id
  }), r;
}
const Cr = 500;
async function Ec(e) {
  const t = Ue(e.vaultPrk), n = E(t), r = new K(e.relayUrls, { authPrivateKey: t });
  let o;
  try {
    o = await r.queryQuorum({ kinds: [x], authors: [n], limit: Cr }, e.timeoutMs);
  } finally {
    r.closeAll(), _(t);
  }
  const i = o.outcomes.some((u) => u.events.length >= Cr), s = /* @__PURE__ */ new Map();
  for (const u of o.outcomes.flatMap((d) => d.events)) {
    if (!C(u) || u.pubkey !== n)
      continue;
    const d = Bo(Le(u, "d") ?? "");
    if (d === null)
      continue;
    const y = s.get(d);
    (!y || un(u, y) > 0) && s.set(d, u);
  }
  const a = /* @__PURE__ */ new Map(), c = [];
  for (const [u, d] of s) {
    const y = await Zo(e.store, e.vaultPrk, u);
    if (y !== null && un(d, {
      created_at: y.createdAt,
      id: y.eventId
    }) < 0) {
      c.push(u);
      continue;
    }
    a.set(u, d), await ei(e.store, e.vaultPrk, u, {
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
class _c {
  vaultPrk;
  personalPrk = null;
  destroyed = !1;
  connectionVaultRoot;
  vaultPublicKey;
  constructor(t) {
    this.connectionVaultRoot = t.slice(), this.vaultPrk = sc(this.connectionVaultRoot), this.vaultPublicKey = Fo(this.vaultPrk);
  }
  get sudoActive() {
    return this.personalPrk !== null;
  }
  /** Opens a sudo window. Consumes (wipes) the caller's sudo key copy. */
  enableSudo(t) {
    this.endSudo(), this.personalPrk = ac(this.connectionVaultRoot, t), _(t);
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
      schema: jo,
      connection_id: cc(),
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
    }, o = await Zt({
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
    }, s = await Zt({
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
    const r = n ?? Math.floor(Date.now() / 1e3), o = yc(t.record, r), i = await Zt({
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
    return this.destroyed ? Promise.reject(new Error("This vault session was destroyed; create a new one from the account's root.")) : dc(t, this.vaultPrk, this.personalPrk ?? void 0);
  }
  /** §CV11 step 3: a NIP-09 deletion request for a replaced record event,
   *  signed by the vault identity. Best-effort by contract — the encrypted
   *  tombstone is the durable part of a deletion, this is the courtesy ask. */
  buildDeletionRequest(t, n) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    return eo({
      privateKey: Ue(this.vaultPrk),
      eventIdToDelete: t,
      deletedEventKind: x,
      createdAt: n ?? Math.floor(Date.now() / 1e3)
    });
  }
  publish(t) {
    return kc({ vaultPrk: this.vaultPrk, ...t });
  }
  fetchEvents(t) {
    return Ec({ vaultPrk: this.vaultPrk, ...t });
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
const Pc = "bitlogin", te = "kv", $ = "device-keys", Kc = 2;
function Sc() {
  return new Promise((e, t) => {
    const n = indexedDB.open(Pc, Kc);
    n.onupgradeneeded = () => {
      const r = n.result;
      r.objectStoreNames.contains(te) || r.createObjectStore(te), r.objectStoreNames.contains($) || r.createObjectStore($);
    }, n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
  });
}
class Ac {
  dbPromise = null;
  db() {
    return this.dbPromise || (this.dbPromise = Sc()), this.dbPromise;
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
      const a = n.transaction($, "readonly").objectStore($).get(t);
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
        const a = n.transaction($, "readwrite");
        a.objectStore($).add(o, t), a.oncomplete = () => i(), a.onerror = () => s(a.error);
      }), o;
    } catch {
      const i = await new Promise((s, a) => {
        const c = n.transaction($, "readonly").objectStore($).get(t);
        c.onsuccess = () => s(c.result), c.onerror = () => a(c.error);
      });
      if (i) return i;
      throw new Error("Unable to create the browser-bound session key.");
    }
  }
  async deleteDeviceKey(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const i = n.transaction($, "readwrite");
      i.objectStore($).delete(t), i.oncomplete = () => r(), i.onerror = () => o(i.error);
    });
  }
}
const vt = "bitlogin:session:v1", or = "bitlogin:session-device-key:v1";
function ti(e) {
  return !!(e && typeof e == "object" && e.v === 3 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function ni(e, t) {
  if (e.length !== 32) throw new Error("Not a lock key.");
  return crypto.subtle.importKey("raw", He(e), "AES-GCM", !1, [t]);
}
async function St(e, t = vt) {
  try {
    const n = await e.get(t);
    if (!n) return "none";
    const r = JSON.parse(n);
    return ti(r) ? "locked" : ri(r) ? "open" : "none";
  } catch {
    return "none";
  }
}
function gt(e) {
  let t = "";
  for (const n of e) t += String.fromCharCode(n);
  return btoa(t);
}
function mt(e) {
  const t = atob(e);
  return Uint8Array.from(t, (n) => n.charCodeAt(0));
}
function He(e) {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}
function ri(e) {
  return !!(e && typeof e == "object" && e.v === 2 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function vn(e, t, n, r = vt) {
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
    const i = await e.getOrCreateDeviceKey(or), s = crypto.getRandomValues(new Uint8Array(12)), a = new TextEncoder().encode(JSON.stringify(o)), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: s }, i, a), u = {
      v: 2,
      iv: gt(s),
      ciphertext: gt(new Uint8Array(c))
    };
    if (!n) {
      await e.set(r, JSON.stringify(u));
      return;
    }
    const d = crypto.getRandomValues(new Uint8Array(12)), y = await crypto.subtle.encrypt({ name: "AES-GCM", iv: d }, await ni(n, "encrypt"), new TextEncoder().encode(JSON.stringify(u))), h = { v: 3, iv: gt(d), ciphertext: gt(new Uint8Array(y)) };
    await e.set(r, JSON.stringify(h));
  } catch {
    n && await e.delete(r).catch(() => {
    });
  }
}
async function oi(e, t, n = vt) {
  let r;
  try {
    r = await e.get(n);
  } catch {
    return null;
  }
  if (!r) return null;
  try {
    let o = JSON.parse(r);
    if (ti(o)) {
      if (!t) return null;
      const c = await crypto.subtle.decrypt({ name: "AES-GCM", iv: He(mt(o.iv)) }, await ni(t, "decrypt"), He(mt(o.ciphertext)));
      o = JSON.parse(new TextDecoder().decode(c));
    }
    if (!ri(o) || typeof e.getOrCreateDeviceKey != "function")
      return await e.delete(n), null;
    const i = await e.getOrCreateDeviceKey(or), s = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: He(mt(o.iv)) },
      i,
      He(mt(o.ciphertext))
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
const Rc = "bitlogin:kept-session:v1:", F = (e) => Rc + e;
async function J(e, t = vt) {
  try {
    await e.delete(t);
  } catch {
  }
}
async function Nr(e) {
  try {
    await e.delete(vt), typeof e.deleteDeviceKey == "function" && await e.deleteDeviceKey(or);
  } catch {
  }
}
const Cc = 27300, xe = {
  /** The longest address a picture may have. */
  pictureChars: 300,
  /** The most that is said about someone, in their own words. */
  aboutChars: 280,
  /** How long a pass made here lasts, in seconds. NSWP's verifier allows twelve hours; this gives four. */
  passSec: 4 * 3600,
  /** A profile's content is not read past this many characters. */
  contentChars: 2e4
};
function Nc(e) {
  if (typeof e != "string" || e.length > xe.pictureChars) return "";
  try {
    const t = new URL(e);
    return t.protocol !== "https:" || t.username || t.password || !t.hostname.includes(".") ? "" : t.href.length <= xe.pictureChars ? t.href : "";
  } catch {
    return "";
  }
}
const Tc = (e) => e <= 31 || e >= 127 && e <= 159 || e >= 8203 && e <= 8207 || e >= 8232 && e <= 8239 || e >= 8288 && e <= 8303 || e === 65279;
function Mc(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, xe.aboutChars * 8).normalize("NFC")) t += Tc(n.codePointAt(0)) ? " " : n;
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, xe.aboutChars).join("").trim();
}
function de(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, n = st(t.name), r = Nc(t.picture), o = Mc(t.about);
  return !n && !r && !o ? null : { ...n ? { name: n } : {}, ...r ? { picture: r } : {}, ...o ? { about: o } : {} };
}
function Ic(e, t) {
  if (!C(e) || e.kind !== 0 || e.pubkey !== t || e.content.length > xe.contentChars) return null;
  let n;
  try {
    n = JSON.parse(e.content);
  } catch {
    return null;
  }
  if (!n || typeof n != "object" || Array.isArray(n)) return null;
  const r = n;
  return de({ name: st(r.display_name) || st(r.displayName) || r.name, picture: r.picture, about: r.about });
}
function xc(e, t) {
  let n = null;
  for (const r of e)
    !C(r) || r.kind !== 0 || r.pubkey !== t || n && r.created_at <= n.at || (n = { at: r.created_at, profile: Ic(r, t) });
  return n?.profile ?? null;
}
const Dc = /^[0-9a-f]{64}$/u;
function Oc(e) {
  const t = Ji(e.site);
  if (!t || typeof e.session != "string" || !Dc.test(e.session) || e.session === e.identity) return null;
  const n = Math.floor(e.nowSeconds), r = de(e.profile) ?? {}, o = [
    ["nswp:session", e.session],
    ["nswp:origin", t],
    ["expiration", String(n + xe.passSec)]
  ];
  return r.name && o.push(["name", r.name]), r.picture && o.push(["picture", r.picture]), r.about && o.push(["about", r.about]), { kind: Cc, created_at: n, tags: o, content: "" };
}
const wn = "bitlogin:kept-accounts:v1", Ot = {
  /** No more accounts than this are kept on one device. The one least lately used goes first. */
  accounts: 8
}, Lc = /^[0-9a-f]{64}$/u;
function ir(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (typeof t.pubkey != "string" || !Lc.test(t.pubkey)) return null;
  const n = de({ name: t.name, picture: t.picture, about: t.about }) ?? {}, r = typeof t.at == "number" && Number.isFinite(t.at) && t.at > 0 ? Math.floor(t.at) : 0;
  let o;
  try {
    o = ze(t.pubkey);
  } catch {
    return null;
  }
  return { pubkey: t.pubkey, npub: o, ...n, at: r };
}
function Uc(e) {
  if (!e) return [];
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return [];
  }
  if (!Array.isArray(t)) return [];
  const n = /* @__PURE__ */ new Set(), r = [];
  for (const o of t.slice(0, Ot.accounts * 2)) {
    const i = ir(o);
    !i || n.has(i.pubkey) || (n.add(i.pubkey), r.push(i));
  }
  return r.sort((o, i) => i.at - o.at).slice(0, Ot.accounts);
}
function qc(e, t, n, r = {}) {
  const o = e.find((a) => a.pubkey === t), i = ir({
    pubkey: t,
    at: n,
    name: st(r.name) || o?.name,
    picture: r.picture ?? o?.picture,
    about: r.about ?? o?.about
  });
  if (!i) return { list: [...e], dropped: [] };
  const s = [i, ...e.filter((a) => a.pubkey !== t)];
  return { list: s.slice(0, Ot.accounts), dropped: s.slice(Ot.accounts).map((a) => a.pubkey) };
}
function Vc(e, t, n) {
  return e.map((r) => r.pubkey === t ? ir({ ...r, name: st(n.name) || r.name, picture: n.picture ?? r.picture, about: n.about ?? r.about }) ?? r : r);
}
const At = (e, t) => e.filter((n) => n.pubkey !== t);
async function W(e) {
  try {
    return Uc(await e.get(wn));
  } catch {
    return [];
  }
}
async function ge(e, t) {
  try {
    t.length === 0 ? await e.delete(wn) : await e.set(wn, JSON.stringify(t));
  } catch {
  }
}
const sr = "bitlogin:lock:v1", Fc = "bitlogin/lock/device/v1", $c = U("bitlogin:lock:device-wrap:v1"), G = {
  pinMin: 6,
  pinMax: 64,
  /** Wrong tries, with the PIN or the device, before the record is removed. */
  tries: 5,
  /** Unused for this long, an unlocked session locks itself. In seconds. */
  idleSec: 900
}, Re = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
};
function ii(e) {
  if (typeof e != "string") return null;
  const t = e.normalize("NFKC"), n = [...t].length;
  return n >= G.pinMin && n <= G.pinMax ? U(t) : null;
}
async function si(e, t) {
  const n = O(12), r = await crypto.subtle.importKey("raw", Re(e), "AES-GCM", !1, ["encrypt"]), o = await crypto.subtle.encrypt({ name: "AES-GCM", iv: Re(n) }, r, Re(t));
  return { iv: T(n), wrapped: T(new Uint8Array(o)) };
}
async function ai(e, t) {
  try {
    const n = await crypto.subtle.importKey("raw", Re(e), "AES-GCM", !1, ["decrypt"]), r = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: Re(I(t.iv)) }, n, Re(I(t.wrapped))));
    return r.length === 32 ? r : null;
  } catch {
    return null;
  }
}
const ci = (e) => ft(Dn($c, e), Fc, 32), Tr = (e) => !!e && typeof e == "object" && typeof e.iv == "string" && typeof e.wrapped == "string";
async function ye(e) {
  let t;
  try {
    t = await e.get(sr);
  } catch {
    return null;
  }
  if (!t) return null;
  try {
    const n = JSON.parse(t);
    return n.v !== 1 || typeof n.tries != "number" || !Number.isInteger(n.tries) || n.tries < 0 || !Tr(n.pin) || typeof n.pin.salt != "string" || n.device !== void 0 && (!Tr(n.device) || typeof n.device.credentialId != "string") ? null : { v: 1, tries: n.tries, pin: n.pin, ...n.device ? { device: n.device } : {} };
  } catch {
    return null;
  }
}
const dt = (e, t) => e.set(sr, JSON.stringify(t));
async function et(e) {
  try {
    await e.delete(sr);
  } catch {
  }
}
async function Wc(e, t, n) {
  const r = ii(t);
  if (!r) throw new Error(`A PIN is ${G.pinMin} to ${G.pinMax} characters.`);
  const o = n ? n.slice() : O(32), i = O(16), s = await $r(r, i);
  try {
    const a = n ? await ye(e) : null;
    await dt(e, { v: 1, tries: 0, pin: { salt: T(i), ...await si(s, o) }, ...a?.device ? { device: a.device } : {} });
  } finally {
    s.fill(0), r.fill(0);
  }
  return o;
}
async function Bc(e, t, n, r) {
  const o = await ye(e);
  if (!o) throw new Error("The lock is not on.");
  if (r.length !== 32 || !/^[A-Za-z0-9_-]{8,1400}$/u.test(n)) throw new Error("That is not a device unlock.");
  const i = ci(r);
  try {
    await dt(e, { ...o, device: { credentialId: n, ...await si(i, t) } });
  } finally {
    i.fill(0);
  }
}
async function jc(e) {
  const t = await ye(e);
  t?.device && await dt(e, { v: 1, tries: t.tries, pin: t.pin });
}
async function li(e, t) {
  const n = await ye(e);
  if (!n) return { ok: !1, left: 0, removed: !0 };
  const r = n.tries + 1;
  await dt(e, { ...n, tries: r });
  const o = await t(n);
  return o ? (await dt(e, { ...n, tries: 0 }), { ok: !0, lockKey: o }) : r >= G.tries ? (await et(e), { ok: !1, left: 0, removed: !0 }) : { ok: !1, left: G.tries - r, removed: !1 };
}
function Gc(e, t) {
  return li(e, async (n) => {
    const r = ii(t);
    if (!r) return null;
    const o = await $r(r, I(n.pin.salt));
    try {
      return await ai(o, n.pin);
    } finally {
      o.fill(0), r.fill(0);
    }
  });
}
function Hc(e, t) {
  return li(e, async (n) => {
    if (!n.device || t.length !== 32) return null;
    const r = ci(t);
    try {
      return await ai(r, n.device);
    } finally {
      r.fill(0);
    }
  });
}
const tt = "bitlogin:signer-grant:v1:", ui = "bitlogin:signer-grant-device-key:v1", ce = {
  /** The longest a site BitLogin knows is remembered, in seconds: thirty days from Allow. */
  keepSec: 720 * 3600,
  /** The longest for a site it does not know: seven days. */
  unknownKeepSec: 168 * 3600,
  /** How many recent room passes are remembered, to count them across page loads. */
  passKept: 10,
  /** How many recent signatures are remembered, to count them across page loads. */
  signedKept: 60
}, en = (e) => e.at ?? e.until - di(e.site), di = (e) => (Q(e) ? $i(e) : zi(e) !== null) ? ce.keepSec : ce.unknownKeepSec, Jc = /^[0-9a-f]{64}$/u;
function De(e) {
  if (typeof e != "string" || e.length > 300 || e.includes("*")) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin === e ? t.origin : "";
  } catch {
    return "";
  }
}
const ar = (e) => Q(e) || De(e), Mr = (e) => btoa(Array.from(e, (t) => String.fromCharCode(t)).join("")), Ir = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), xr = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}, zc = (e) => Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
async function tn(e, t, n) {
  const r = ar(t.site);
  if (!r || t.everydayPrivateKey.length !== 32 || typeof e.getOrCreateDeviceKey != "function" || Q(r) && t.permissions) return !1;
  const o = Math.min(Math.floor(t.until), Math.floor(n) + di(r));
  if (!(o > n)) return !1;
  const i = crypto.getRandomValues(new Uint8Array(12));
  try {
    const s = await e.getOrCreateDeviceKey(ui), a = JSON.stringify({
      site: r,
      key: zc(t.everydayPrivateKey),
      until: o,
      ...t.name ? { name: t.name.slice(0, 48) } : {},
      ...de(t.profile) ? { profile: de(t.profile) } : {},
      // An application's public signatures are counted up to its own hourly limit, so more of them are kept.
      signed: t.signed.filter((d) => Number.isFinite(d)).slice(-(t.permissions ? Tt.public.hourly : ce.signedKept)),
      ...t.permissions ? { permissions: t.permissions } : {},
      ...!t.permissions && !Q(r) && ue(t.more).length ? { more: ue(t.more) } : {},
      ...typeof t.at == "number" ? { at: Math.floor(t.at) } : {},
      ...Y(t.relays).length ? { relays: Y(t.relays) } : {},
      ...typeof t.checkedAt == "number" ? { checkedAt: Math.floor(t.checkedAt) } : {},
      ...typeof t.seenAt == "number" ? { seenAt: Math.floor(t.seenAt) } : {},
      ...t.signedPass?.length ? { signedPass: t.signedPass.filter((d) => Number.isFinite(d)).slice(-ce.passKept) } : {},
      ...t.permissions && t.signedSensitive ? { signedSensitive: t.signedSensitive.filter((d) => Number.isFinite(d)).slice(-Tt.sensitive.hourly) } : {}
    }), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, s, new TextEncoder().encode(a)), u = { v: 1, iv: Mr(i), ciphertext: Mr(new Uint8Array(c)) };
    return await e.set(tt + r, JSON.stringify(u)), !0;
  } catch {
    return !1;
  }
}
async function bt(e, t, n) {
  const r = ar(t);
  if (!r || typeof e.getOrCreateDeviceKey != "function") return null;
  try {
    const o = await e.get(tt + r);
    if (!o) return null;
    const i = JSON.parse(o);
    if (i.v !== 1 || typeof i.iv != "string" || typeof i.ciphertext != "string") return null;
    const s = await e.getOrCreateDeviceKey(ui), a = await crypto.subtle.decrypt({ name: "AES-GCM", iv: xr(Ir(i.iv)) }, s, xr(Ir(i.ciphertext))), c = JSON.parse(new TextDecoder().decode(a)), u = (f) => typeof f == "number" && Number.isFinite(f) && f > 0 ? Math.floor(f) : void 0, d = de(c.profile), y = c.permissions === void 0 ? void 0 : Un(c.permissions);
    if (y === null || y && (Q(r) || !qn(r, y)))
      return await e.delete(tt + r), null;
    const h = (f, v) => Array.isArray(f) ? f.filter((p) => typeof p == "number" && Number.isFinite(p)).slice(-v) : [];
    return c.site !== r || typeof c.key != "string" || !Jc.test(c.key) || typeof c.until != "number" ? null : !(c.until > n) || c.until > n + ce.keepSec ? (await e.delete(tt + r), null) : {
      site: r,
      everydayPrivateKey: Uint8Array.from(c.key.match(/.{2}/gu) ?? [], (f) => Number.parseInt(f, 16)),
      until: c.until,
      ...typeof c.name == "string" && c.name ? { name: c.name.slice(0, 48) } : {},
      ...d ? { profile: d } : {},
      signed: h(c.signed, y ? Tt.public.hourly : ce.signedKept),
      ...h(c.signedPass, ce.passKept).length ? { signedPass: h(c.signedPass, ce.passKept) } : {},
      ...!y && !Q(r) && ue(c.more).length ? { more: ue(c.more) } : {},
      ...u(c.at) ? { at: u(c.at) } : {},
      ...Y(c.relays).length ? { relays: Y(c.relays) } : {},
      ...u(c.checkedAt) ? { checkedAt: u(c.checkedAt) } : {},
      ...u(c.seenAt) ? { seenAt: u(c.seenAt) } : {},
      ...y ? { permissions: y, signedSensitive: h(c.signedSensitive, Tt.sensitive.hourly) } : {}
    };
  } catch {
    return null;
  }
}
async function kt(e, t) {
  const n = ar(t);
  if (n)
    try {
      await e.delete(tt + n);
    } catch {
    }
}
const yi = "bitlogin:signer-handoff:v1", Qc = /* @__PURE__ */ new Set([
  "configure",
  "getPublicKey",
  "signEvent",
  "getSessionStatus",
  "logout",
  "handoffBegin",
  "handoffAccept",
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
]), gn = /^[0-9a-f]{64}$/;
function Yc(e) {
  return Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
}
function Xc(e) {
  return Uint8Array.from(e.match(/.{2}/g) ?? [], (t) => Number.parseInt(t, 16));
}
function Zc(e, t, n, r, o = {}) {
  if (!gn.test(t)) throw new Error("The hand-off has no usable recipient key.");
  if (e.length !== 32) throw new Error("No identity is unlocked in this session.");
  let i = null;
  if (r !== void 0) {
    const h = De(r.site), f = Un(r.permissions);
    if (!h || !f || !qn(h, f)) throw new Error("That is not a permission set an application may be given.");
    i = { site: h, permissions: f };
  }
  const s = o.site === void 0 ? "" : De(o.site);
  if (o.site !== void 0 && (!s || i && i.site !== s)) throw new Error("The hand-off names no usable site.");
  const a = de(o.profile), c = !!s && o.visitOnly !== !0 && o.remember === !0, u = o.family === void 0 ? "" : Q(o.family);
  if (o.family !== void 0 && (!u || i || !c || !Se(s, u))) throw new Error("That is not a family this site may be allowed as.");
  const d = ue(o.more);
  if (o.more !== void 0 && (d.length === 0 || !s || i || u)) throw new Error("That is not something this site may be let do.");
  const y = new se(n.slice());
  try {
    const h = JSON.stringify({ v: 1, purpose: yi, key: Yc(e), ...i ? { app: i } : {}, ...s ? { site: s } : {}, ...a ? { profile: a } : {}, ...c ? { remember: !0 } : {}, ...typeof o.at == "number" && Number.isFinite(o.at) ? { at: Math.floor(o.at) } : {}, ...Y(o.relays).length ? { relays: Y(o.relays) } : {}, ...u ? { family: u } : {}, ...d.length ? { more: d } : {} });
    return { senderPublicKey: y.getPublicKey(), payload: y.nip44Encrypt(t, h) };
  } finally {
    y.destroy();
  }
}
function el(e, t) {
  if (!e || !gn.test(e.senderPublicKey) || typeof e.payload != "string")
    throw new Error("That is not a signer hand-off.");
  const n = new se(t.slice());
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
  if (o.v !== 1 || o.purpose !== yi || typeof o.key != "string" || !gn.test(o.key))
    throw new Error("That is not a signer hand-off.");
  const i = Xc(o.key);
  try {
    E(i);
  } catch {
    throw i.fill(0), new Error("The hand-off carried an unusable key.");
  }
  const s = o.site === void 0 ? null : De(o.site);
  if (s === "")
    throw i.fill(0), new Error("The hand-off names no usable site.");
  const a = de(o.profile), c = o.remember === !0 && !!s, u = typeof o.at == "number" && Number.isFinite(o.at) && o.at > 0 ? Math.floor(o.at) : null, d = Y(o.relays), y = o.family === void 0 ? null : Q(o.family);
  if (y === "" || y && (o.app !== void 0 || !c || !Se(s, y)))
    throw i.fill(0), new Error("The hand-off names a family it cannot be kept for.");
  const h = ue(o.more);
  if (o.more !== void 0 && (h.length === 0 || !s || y || o.app !== void 0))
    throw i.fill(0), new Error("The hand-off carries something this site may not be let do.");
  if (o.app === void 0) return { key: i, app: null, site: s, profile: a, remember: c, at: u, relays: d, family: y, more: h };
  const f = o.app, v = f && typeof f == "object" ? De(f.site) : "", p = f && typeof f == "object" ? Un(f.permissions) : null;
  if (!v || !p || !qn(v, p) || s && s !== v)
    throw i.fill(0), new Error("The hand-off carried a permission set that cannot be read.");
  return { key: i, app: { site: v, permissions: p }, site: v, profile: a, remember: c, at: u, relays: d, family: null, more: [] };
}
const fi = 38e3, pi = "38172", tl = ["https://testnut.cashu.space", "https://nofees.testnut.cashu.space"], nl = 8;
function rl(e, t, n = 10) {
  const r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const i of e)
    if (!(i.kind !== fi || !i.tags.some((s) => s[0] === "k" && s[1] === pi)))
      for (const s of i.tags) {
        if (s[0] !== "u" || s[2] !== void 0 && s[2] !== "cashu") continue;
        const a = at(s[1]);
        if (!a || !a.startsWith("https://") || tl.includes(a)) continue;
        const c = o.get(i.pubkey) ?? /* @__PURE__ */ new Set();
        !c.has(a) && c.size >= nl || (c.add(a), o.set(i.pubkey, c), (r.get(a) ?? r.set(a, /* @__PURE__ */ new Set()).get(a)).add(i.pubkey));
      }
  return [...r].map(([i, s]) => ({ mint: i, by: s.size, byFollowed: [...s].filter((a) => t.has(a)).length })).filter((i) => i.by >= 2 || i.byFollowed >= 1).sort((i, s) => s.byFollowed - i.byFollowed || s.by - i.by || i.mint.localeCompare(s.mint)).slice(0, n);
}
const mn = 30078, bn = "bitlogin-drive:", Je = 10063, ol = 24242, nt = "bitlogin:drive:v1:", il = { autoPaySats: 0, at: 0, saved: !0 }, cr = (e) => {
  const t = e?.autoPaySats;
  return { autoPaySats: typeof t == "number" && Number.isSafeInteger(t) && t >= 0 && t <= 1e5 ? t : 0 };
};
async function hi(e, t) {
  const n = t.getPublicKey(), r = { folders: /* @__PURE__ */ new Map(), removed: /* @__PURE__ */ new Map(), settings: { ...il } }, o = async (a) => {
    try {
      const c = await e.get(a);
      return c ? JSON.parse(t.nip44Decrypt(n, c)) : null;
    } catch {
      return null;
    }
  }, i = await o(nt + n);
  if (!i) return r;
  for (const a of Array.isArray(i.folders) ? i.folders.slice(0, Fn.folders + 1) : []) {
    if (typeof a != "string") continue;
    const c = await o(`${nt}${n}:${a}`), u = Vn(c?.folder);
    u && r.folders.set(u.id, { folder: u, saved: c?.saved === !0 });
  }
  for (const a of Array.isArray(i.removed) ? i.removed : [])
    Array.isArray(a) && typeof a[0] == "string" && typeof a[1] == "number" && r.removed.set(a[0], a[1]);
  const s = i.settings;
  return r.settings = { ...cr(s), at: typeof s?.at == "number" ? s.at : 0, saved: s?.saved !== !1 }, r;
}
async function lr(e, t, n, r, o = []) {
  const i = t.getPublicKey(), s = (a) => t.nip44Encrypt(i, JSON.stringify(a));
  for (const a of r) {
    const c = n.folders.get(a);
    c && await e.set(`${nt}${i}:${a}`, s(c));
  }
  for (const a of o) await e.delete(`${nt}${i}:${a}`).catch(() => {
  });
  await e.set(nt + i, s({ folders: [...n.folders.keys()], removed: [...n.removed], settings: n.settings }));
}
const nn = (e, t) => j(e) >= Math.min(2, t);
function rn(e, t, n, r) {
  const o = e.getPublicKey();
  return e.signEvent({ kind: mn, created_at: Math.floor(r), tags: [["d", bn + t]], content: e.nip44Encrypt(o, JSON.stringify(n)) });
}
const kn = (e, t) => ({
  folders: [...e.folders.values()].map((n) => n.folder),
  settings: { autoPaySats: e.settings.autoPaySats },
  offline: t,
  unsaved: [...e.folders.values()].some((n) => !n.saved) || e.removed.size > 0 || !e.settings.saved
});
async function vi(e, t) {
  const { signer: n, store: r, relays: o } = e, i = e.now ?? Date.now() / 1e3, s = [];
  for (const [a, c] of t.folders)
    c.saved || !nn(await o.publishAll(rn(n, a, { v: 1, folder: c.folder }, Math.max(i, c.folder.at)), 6e3).catch(() => []), o.relayUrls.length) || (c.saved = !0, s.push(a));
  for (const [a, c] of [...t.removed])
    nn(await o.publishAll(rn(n, a, { v: 1, deleted: !0, at: c }, Math.max(i, c)), 6e3).catch(() => []), o.relayUrls.length) && t.removed.delete(a);
  t.settings.saved || nn(await o.publishAll(rn(n, "settings", { v: 1, settings: { autoPaySats: t.settings.autoPaySats }, at: t.settings.at }, Math.max(i, t.settings.at)), 6e3).catch(() => []), o.relayUrls.length) && (t.settings.saved = !0), await lr(r, n, t, s);
}
async function sl(e) {
  const { signer: t, store: n, relays: r } = e, o = t.getPublicKey(), i = await hi(n, t), s = await r.queryQuorum({ kinds: [mn], authors: [o], limit: 500 }, 6e3).catch(() => null);
  if (!s || s.respondedCount === 0) return kn(i, !0);
  const a = /* @__PURE__ */ new Map();
  for (const d of s.outcomes.flatMap((y) => y.events)) {
    if (d.kind !== mn || d.pubkey !== o || !C(d)) continue;
    const y = d.tags.find((f) => f[0] === "d")?.[1];
    if (typeof y != "string" || !y.startsWith(bn)) continue;
    const h = y.slice(bn.length);
    (!a.has(h) || a.get(h).created_at < d.created_at) && a.set(h, d);
  }
  const c = [], u = [];
  for (const [d, y] of a) {
    let h;
    try {
      h = JSON.parse(t.nip44Decrypt(o, y.content));
    } catch {
      continue;
    }
    if (d === "settings") {
      const p = typeof h.at == "number" ? h.at : y.created_at;
      (i.settings.saved || p > i.settings.at) && (i.settings = { ...cr(h.settings), at: p, saved: !0 });
      continue;
    }
    const f = i.folders.get(d);
    if (h.deleted === !0) {
      const p = typeof h.at == "number" ? h.at : y.created_at;
      f && (f.saved || f.folder.at <= p) && (i.folders.delete(d), u.push(d)), i.removed.delete(d);
      continue;
    }
    const v = Vn(h.folder);
    !v || v.id !== d || i.removed.has(d) || f && !f.saved && f.folder.at >= v.at || f && f.saved && f.folder.at >= v.at || (i.folders.set(d, { folder: v, saved: !0 }), c.push(d));
  }
  for (const [d, y] of i.folders) a.has(d) || (y.saved = !1);
  return await lr(n, t, i, c, u), await vi(e, i), kn(i, !1);
}
async function al(e, t) {
  const { signer: n, store: r } = e, o = e.now ?? Date.now() / 1e3, i = (t.save ?? []).map(Vn);
  if (i.some((u) => !u)) throw new Error("That is not a folder this drive can keep.");
  const s = await hi(r, n), a = [], c = [];
  for (const u of i)
    s.folders.set(u.id, { folder: u, saved: !1 }), s.removed.delete(u.id), a.push(u.id);
  for (const u of t.remove ?? [])
    typeof u != "string" || !/^[0-9a-f]{16}$/u.test(u) || (s.folders.delete(u), s.removed.set(u, Math.floor(o)), c.push(u));
  if (s.folders.size > Fn.folders + 1) throw new Error("There are too many folders.");
  return t.settings !== void 0 && (s.settings = { ...cr(t.settings), at: Math.floor(o), saved: !1 }), await lr(r, n, s, a, c), await vi(e, s), kn(s, !1);
}
function cl(e, t, n = Date.now() / 1e3) {
  const r = $n(t.server), o = t.verb;
  if (!r || o !== "upload" && o !== "delete" && o !== "get") throw new Error("That is not something a file server is asked.");
  const i = typeof t.sha256 == "string" && /^[0-9a-f]{64}$/u.test(t.sha256) ? t.sha256 : "";
  if (!i) throw new Error("A permission note names the one file it is for.");
  const s = e.signEvent({
    kind: ol,
    // In the past, as a server requires, by a margin wider than two clocks usually differ.
    created_at: Math.floor(n) - 30,
    tags: [["t", o], ["expiration", String(Math.floor(n) + 300)], ["server", new URL(r).hostname.toLowerCase()], ["x", i]],
    content: o === "upload" ? "Upload a file" : o === "delete" ? "Delete a file" : "Fetch a file"
  }), a = new TextEncoder().encode(JSON.stringify(s));
  let c = "";
  for (const u of a) c += String.fromCharCode(u);
  return btoa(c).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}
const wi = (e) => [...new Set(e.tags.filter((t) => t[0] === "server").map((t) => $n(t[1])).filter(Boolean))];
function ll(e, t, n = 12) {
  const r = /* @__PURE__ */ new Map();
  for (const i of e) i.kind === Je && (!r.has(i.pubkey) || r.get(i.pubkey).created_at < i.created_at) && r.set(i.pubkey, i);
  const o = /* @__PURE__ */ new Map();
  for (const i of r.values()) for (const s of wi(i).filter((a) => a.startsWith("https://")).slice(0, 6)) (o.get(s) ?? o.set(s, /* @__PURE__ */ new Set()).get(s)).add(i.pubkey);
  return [...o].map(([i, s]) => ({ server: i, by: s.size, byFollowed: [...s].filter((a) => t.has(a)).length })).filter((i) => i.by >= 2 || i.byFollowed >= 1).sort((i, s) => s.byFollowed - i.byFollowed || s.by - i.by || i.server.localeCompare(s.server)).slice(0, n);
}
const gi = "bitlogin:ecash:v1:", Lt = (e) => e.startsWith("local:"), ul = () => `local:${Array.from(crypto.getRandomValues(new Uint8Array(8)), (e) => e.toString(16).padStart(2, "0")).join("")}`;
async function ur(e, t) {
  const n = t.getPublicKey();
  try {
    const r = await e.get(gi + n);
    if (!r) return { wallet: null, tokens: [] };
    const o = JSON.parse(t.nip44Decrypt(n, r)), i = typeof o.wallet == "string" ? Yr(o.wallet) : null, s = [];
    for (const a of Array.isArray(o.tokens) ? o.tokens : []) {
      const c = a, u = Zr(c.proofs);
      typeof c.event == "string" && c.event.length <= 80 && at(c.mint) && u?.length && s.push({ event: c.event, mint: at(c.mint), proofs: u });
    }
    return { wallet: i, tokens: s };
  } catch {
    return { wallet: null, tokens: [] };
  }
}
async function Ut(e, t, n) {
  const r = t.getPublicKey();
  await e.set(gi + r, t.nip44Encrypt(r, JSON.stringify({ wallet: n.wallet ? Xr(n.wallet) : null, tokens: n.tokens })));
}
const dr = (e, t) => j(e) >= Math.min(2, t);
function mi(e, t, n) {
  const r = e.getPublicKey();
  return e.signEvent({ kind: Ze, created_at: Math.floor(n), tags: [], content: e.nip44Encrypt(r, Ks(t)) });
}
const qt = (e, t) => ({ mints: e.wallet?.mints ?? [], tokens: e.tokens, offline: t, unsaved: e.tokens.some((n) => Lt(n.event)) });
async function dl(e) {
  const { signer: t, store: n, relays: r } = e, o = t.getPublicKey(), i = await ur(n, t), [s, a, c] = await Promise.all([
    r.queryQuorum({ kinds: [fn], authors: [o], limit: 2 }, 5e3),
    r.queryQuorum({ kinds: [Ze], authors: [o], limit: ct.tokens }, 6e3),
    r.queryQuorum({ kinds: [5], authors: [o], "#k": [String(Ze)], limit: ct.tokens }, 6e3)
  ]).catch(() => [null, null, null]);
  if (!a || !s || !c || a.respondedCount === 0) return qt(i, !0);
  const u = (b, P) => b.filter((M) => M.kind === P && M.pubkey === o && C(M)), d = (b) => {
    try {
      return t.nip44Decrypt(o, b.content);
    } catch {
      return null;
    }
  }, y = u(s.outcomes.flatMap((b) => b.events), fn).sort((b, P) => P.created_at - b.created_at)[0], h = y && Yr(d(y) ?? "") || i.wallet, f = new Set(u(c.outcomes.flatMap((b) => b.events), 5).flatMap((b) => b.tags.filter((P) => P[0] === "e" && typeof P[1] == "string").map((P) => P[1]))), v = /* @__PURE__ */ new Map();
  for (const b of u(a.outcomes.flatMap((P) => P.events), Ze)) v.set(b.id, b);
  const p = [...v.values()].flatMap((b) => {
    const P = ks(d(b) ?? "");
    return P ? [{ event: b.id, created_at: b.created_at, ...P }] : [];
  }), g = Es(p, f), m = new Set(g.flatMap((b) => b.proofs.map((P) => P.secret))), k = { wallet: h, tokens: [...g] };
  for (const b of i.tokens.filter((P) => Lt(P.event))) {
    const P = b.proofs.filter((X) => !m.has(X.secret));
    if (P.length === 0) continue;
    const M = mi(t, { mint: b.mint, proofs: P }, e.now ?? Date.now() / 1e3), q = dr(await r.publishAll(M, 6e3).catch(() => []), r.relayUrls.length);
    k.tokens.push({ event: q ? M.id : b.event, mint: b.mint, proofs: P });
  }
  return await Ut(n, t, k), qt(k, !1);
}
async function yl(e, t) {
  const { signer: n, store: r, relays: o } = e, i = n.getPublicKey(), s = [...new Set((Array.isArray(t) ? t : []).map(at).filter(Boolean))];
  if (s.length === 0 || s.length > ct.mints) throw new Error("Name between one and five mints, each an https address.");
  const a = await ur(r, n), c = { privkey: a.wallet?.privkey ?? e.newKey(), mints: s }, u = { wallet: c, tokens: a.tokens };
  await Ut(r, n, u);
  const d = n.signEvent({ kind: fn, created_at: Math.floor(e.now ?? Date.now() / 1e3), tags: [], content: n.nip44Encrypt(i, Xr(c)) });
  if (!dr(await o.publishAll(d, 6e3).catch(() => []), o.relayUrls.length)) throw new Error("The wallet was saved in this browser, but no relay took it. Try again when you are online.");
  return qt(u, !1);
}
async function fl(e, t) {
  const { signer: n, store: r, relays: o } = e, i = e.now ?? Date.now() / 1e3, s = new Set(t.destroy.filter((v) => typeof v == "string" && v.length <= 80)), a = t.keep.map((v) => ({ mint: at(v.mint), proofs: Zr(v.proofs, 5e3) }));
  if (a.some((v) => !v.mint || !v.proofs)) throw new Error("That is not ecash this wallet can keep.");
  const c = await ur(r, n), u = a.flatMap((v) => {
    const p = [];
    for (let g = 0; g < v.proofs.length; g += ct.proofsWritten) p.push({ event: ul(), mint: v.mint, proofs: v.proofs.slice(g, g + ct.proofsWritten) });
    return p;
  }), d = { wallet: c.wallet, tokens: [...c.tokens.filter((v) => !s.has(v.event)), ...u] };
  await Ut(r, n, d);
  const y = [...s].filter((v) => !Lt(v)), h = [];
  for (const v of u) {
    const p = mi(n, { mint: v.mint, proofs: v.proofs, ...y.length && h.length === 0 ? { del: y } : {} }, i);
    dr(await o.publishAll(p, 6e3).catch(() => []), o.relayUrls.length) && (v.event = p.id, h.push(p.id));
  }
  await Ut(r, n, d);
  const f = u.every((v) => !Lt(v.event));
  if (y.length && f) {
    const v = n.signEvent({ kind: 5, created_at: Math.floor(i), tags: [...y.map((p) => ["e", p]), ["k", String(Ze)]], content: "" });
    await o.publishAll(v, 6e3).catch(() => []);
  }
  if (t.history && f && Number.isSafeInteger(t.history.amount) && t.history.amount > 0) {
    const v = n.getPublicKey(), p = n.signEvent({ kind: _s, created_at: Math.floor(i), tags: [], content: n.nip44Encrypt(v, Ps({ ...t.history, created: h, destroyed: y })) });
    await o.publishAll(p, 6e3).catch(() => []);
  }
  return qt(d, !1);
}
const bi = "bitlogin:session-public:v1";
async function pl(e, t) {
  try {
    const n = {
      pubkey: t.pubkey,
      npub: t.npub,
      ...t.name ? { name: t.name } : {}
    };
    await e.set(bi, JSON.stringify(n));
  } catch {
  }
}
async function We(e) {
  try {
    await e.delete(bi);
  } catch {
  }
}
class hl {
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
let pe = null, S = [...to], D = [...no];
const w = new Ac();
let En = !1, _n = !1;
function Dr(e) {
  En || (S = e.vaultRelays), _n || (D = e.discoveryRelays);
}
const vl = new hl();
let A = null, on = Date.now();
const wl = /* @__PURE__ */ new Set(["configure", "lockStatus", "lockOpen", "restoreSession", "getSessionStatus", "logout"]), ki = "bitlogin:taken-back:v1:";
async function gl(e) {
  try {
    const t = await w.get(ki + e);
    return (t ? Jr(JSON.parse(t)) : null) ?? dn;
  } catch {
    return dn;
  }
}
function Or(e, t) {
  try {
    return Jr(JSON.parse(e.nip44Decrypt(e.getPublicKey(), t)));
  } catch {
    return null;
  }
}
function Be() {
  V(), A && _(A), A = null;
}
async function Pe() {
  const e = await ye(w);
  return e ? {
    on: !0,
    // Locked with nothing in the active slot too, where other accounts are kept: theirs are sealed under it.
    locked: !A && (await St(w) === "locked" || (await W(w)).length > 0),
    device: !!e.device,
    ...e.device ? { credentialId: e.device.credentialId } : {},
    triesLeft: Math.max(0, G.tries - e.tries)
  } : { on: !1, locked: !1, device: !1, triesLeft: 0 };
}
function R() {
  if (!l.signer || !l.everydayPrivateKey)
    throw new Error("No identity is unlocked in this session.");
  return { signer: l.signer, everydayPrivateKey: l.everydayPrivateKey };
}
function H() {
  const e = R();
  if (!l.signerOnly || l.app || !l.site) throw new Error("refused");
  return { ...e, site: l.site };
}
const Pn = "bitlogin:world-counts:v1:", ml = "bitlogin:follows-seen:v1:", Kn = /* @__PURE__ */ new Map();
async function he(e, t, n, r = !0) {
  const o = `${Pn}${e}:${t}`;
  let i = Kn.get(o);
  if (!i)
    try {
      const u = r ? JSON.parse(await w.get(o) ?? "[]") : [];
      i = Array.isArray(u) ? u.filter((d) => typeof d == "number" && Number.isFinite(d)).slice(-n.hourly) : [];
    } catch {
      i = [];
    }
  const s = ys(n, i), a = Date.now(), c = s.take(a);
  return Kn.set(o, s.times()), c && r && await w.set(o, JSON.stringify(s.times())).catch(() => {
  }), c;
}
function sn() {
  if (!l.signerOnly || !l.app) throw new Error("refused");
  return l.app;
}
function V() {
  l.signer?.destroy(), l.everydayPrivateKey && l.everydayPrivateKey.fill(0), l.signer = null, l.everydayPrivateKey = null, l.accountId = null, l.recoveryPublicKey = null, l.activeCredentialEvent = null, l.activeRecoveryEvent = null, l.everydayKeyDerived = !1, l.vault?.destroy(), l.vault = null, l.connectionVaultRoot && l.connectionVaultRoot.fill(0), l.connectionVaultRoot = null, l.vaultKnown = !1, l.signerOnly = !1, l.app = null, l.site = null, l.profile = null, l.remember = !1, l.grantAt = null, l.relays = [], l.family = null, l.more = [], l.pendingRecovery && (l.pendingRecovery.recoveryPrivateKey.fill(0), l.pendingRecovery.everydayPrivateKey.fill(0), l.pendingRecovery = null);
}
function Lr(e) {
  return V(), l.pendingRecovery = e, l.signer = new se(e.everydayPrivateKey), l.everydayPrivateKey = e.everydayPrivateKey, l.accountId = e.accountId, l.recoveryPublicKey = e.recoveryPublicKey, l.activeRecoveryEvent = e.currentRecoveryEvent, l.everydayKeyDerived = e.everydayKeyDerived, Sn(
    e.currentRecoveryPayload.connection_vault_root ? I(e.currentRecoveryPayload.connection_vault_root) : void 0
  ), {
    everydayPublicKey: e.everydayPublicKey,
    accountId: e.accountId,
    generalRelays: e.generalRelays,
    dmRelays: e.dmRelays,
    chainWarning: e.chainWarning,
    everydayKeyDerived: e.everydayKeyDerived
  };
}
function Sn(e, t) {
  l.connectionVaultRoot = e ?? null, l.vaultKnown = !0, l.vault = null, t && _(t);
}
async function ve() {
  if (!l.everydayPrivateKey || !l.accountId || !l.recoveryPublicKey || !l.activeCredentialEvent || !l.activeRecoveryEvent)
    return;
  const e = await ye(w);
  e && !A && (await et(w), await An());
  const t = {
    everydayPrivateKey: l.everydayPrivateKey,
    accountId: l.accountId,
    recoveryPublicKey: l.recoveryPublicKey,
    activeCredentialEvent: l.activeCredentialEvent,
    activeRecoveryEvent: l.activeRecoveryEvent,
    ...l.connectionVaultRoot ? { connectionVaultRoot: l.connectionVaultRoot } : {},
    ...l.vaultKnown ? { vaultEnabled: l.connectionVaultRoot !== null } : {},
    everydayKeyDerived: l.everydayKeyDerived
  }, n = e && A ? A : null;
  await vn(w, t, n);
  const r = E(l.everydayPrivateKey);
  await vn(w, t, n, F(r));
  const o = qc(await W(w), r, Date.now() / 1e3);
  for (const i of o.dropped) await J(w, F(i));
  await ge(w, o.list), await Ei();
}
async function An() {
  for (const e of await W(w)) await J(w, F(e.pubkey));
  await ge(w, []);
}
async function Ur(e, t) {
  const n = l.everydayPrivateKey ? E(l.everydayPrivateKey) : "";
  let r = await W(w);
  for (const o of r) {
    if (o.pubkey === n) continue;
    const i = await oi(w, e, F(o.pubkey));
    i ? (await vn(w, i, t, F(o.pubkey)), i.everydayPrivateKey.fill(0), i.connectionVaultRoot?.fill(0)) : (await J(w, F(o.pubkey)), r = At(r, o.pubkey));
  }
  await ge(w, r);
}
async function an(e) {
  const t = await oi(w, A, e);
  return t ? (V(), l.signer = new se(t.everydayPrivateKey), l.everydayPrivateKey = t.everydayPrivateKey, l.accountId = t.accountId, l.recoveryPublicKey = t.recoveryPublicKey, l.activeCredentialEvent = t.activeCredentialEvent, l.activeRecoveryEvent = t.activeRecoveryEvent, l.everydayKeyDerived = t.everydayKeyDerived ?? !1, l.connectionVaultRoot = t.connectionVaultRoot ?? null, l.vaultKnown = t.vaultEnabled !== void 0, await Ei(), {
    restored: !0,
    everydayPublicKey: l.signer.getPublicKey(),
    accountId: t.accountId,
    everydayKeyDerived: l.everydayKeyDerived
  }) : { restored: !1 };
}
async function Ei() {
  if (!l.signer) return;
  const e = l.signer.getPublicKey();
  await pl(w, { pubkey: e, npub: ze(e) });
}
function Vt() {
  try {
    return new URL(self.location.href).origin;
  } catch {
    return "";
  }
}
function cn(e) {
  if (e === void 0) return Vt();
  const t = De(e);
  if (!t || !ds(Vt())) throw new Error("A wallet connection is for this site only.");
  return t;
}
function Rn() {
  if (!l.signer) throw new Error("No identity is unlocked in this session.");
  if (!l.connectionVaultRoot)
    throw new Error(
      l.vaultKnown ? "This account predates the Connection Vault. Enable it from your BitLogin account manager (recovery phrase required)." : "Sign in again to use wallet connections on this device."
    );
  return l.vault ??= new _c(l.connectionVaultRoot.slice()), l.vault;
}
function je(e) {
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
async function Rt() {
  const e = Rn(), t = await e.listConnections({ relayUrls: S, store: w });
  return {
    vault: e,
    connections: t.connections.filter((n) => n.record.state !== "deleted"),
    rollbackWarnings: t.rollbackWarnings,
    unreadable: t.unreadable,
    truncated: t.truncated,
    quorumMet: t.quorumMet
  };
}
async function ln(e) {
  const { vault: t, connections: n } = await Rt(), r = n.find((o) => o.record.connection_id === e);
  if (!r) throw new Error("That connection no longer exists.");
  return { vault: t, connection: r };
}
let be = null, z = null;
function qr(e) {
  self.postMessage({ notify: "nip46-auth-url", url: e });
}
function Ge() {
  if (!be) throw new Error("No remote signer is connected.");
  return be;
}
function Et() {
  z && (z.abort.abort(), _(z.clientSecretKey), z = null);
}
function _i(e) {
  const t = e.buildLogoutEvent();
  e.close(), t && e.publishCourtesy(t);
}
function Vr(e, t) {
  be && _i(be.client), be = { client: e, userPubkey: t };
}
async function bl(e, t) {
  if (l.signerOnly && !Qc.has(e))
    throw new Error("This session can only sign. Sign in at your own BitLogin page for anything else.");
  switch (A && e !== "configure" && Date.now() - on > G.idleSec * 1e3 && Be(), wl.has(e) || (on = Date.now()), e) {
    // ---- The optional lock (lock.ts) ----
    case "lockStatus":
      return Pe();
    // Turn it on, or change the PIN. Only with a full session unlocked: the key that is sealed is the one in hand.
    case "lockEnable": {
      if (R(), await ye(w) && !A) throw new Error("Unlock first.");
      const n = await Wc(w, t.pin, A ?? void 0);
      return await Ur(A, n), A && _(A), A = n, await ve(), Pe();
    }
    case "lockSetDevice": {
      if (R(), !A) throw new Error("Turn the lock on first.");
      const n = t, r = I(String(n.prfOutput));
      try {
        await Bc(w, A, String(n.credentialId), r);
      } finally {
        _(r);
      }
      return Pe();
    }
    case "lockRemoveDevice": {
      if (R(), !A) throw new Error("Turn the lock on first.");
      return await jc(w), Pe();
    }
    case "lockDisable": {
      if (R(), await ye(w) && !A) throw new Error("Unlock first.");
      return await Ur(A, null), await et(w), A && _(A), A = null, await ve(), Pe();
    }
    case "lockNow": {
      if (!A) throw new Error("The lock is not on.");
      return Be(), Pe();
    }
    // Open it, with the PIN or with the device. A wrong try is counted; one too many removes the lock and the
    // cached session with it, and the user signs in again the ordinary way.
    case "lockOpen": {
      const n = t;
      let r;
      if (typeof n.prfOutput == "string") {
        const o = I(n.prfOutput);
        try {
          r = await Hc(w, o);
        } finally {
          _(o);
        }
      } else
        r = await Gc(w, n.pin);
      if (r.ok) {
        A && _(A), A = r.lockKey, on = Date.now();
        const o = await an();
        if (o.restored) return { ok: !0, left: G.tries, removed: !1, ...o };
        if (await St(w) === "none" && (await W(w)).length > 0) return { ok: !0, left: G.tries, removed: !1, restored: !1 };
        await et(w), Be(), r = { ok: !1, left: 0, removed: !0 };
      }
      return r.removed && (Be(), await An(), await Nr(w), await We(w)), { ok: !1, left: r.left, removed: r.removed, restored: !1 };
    }
    // ---- Signer hand-off (docs/sign-in-window.md) ----
    // The receiving side, first: a throwaway key for the hand-off to be sealed to.
    case "handoffBegin":
      return pe && _(pe), pe = qe(), { recipientPublicKey: E(pe) };
    // The sending side: this worker has the session, and seals the everyday
    // key (only that) to the receiving worker's throwaway key.
    case "handoffExport": {
      const { everydayPrivateKey: n } = R(), r = qe(), o = t;
      try {
        return Zc(n, o.recipientPublicKey, r, o.app, {
          ...o.site !== void 0 ? { site: o.site } : {},
          // Only a site that declared nothing is told who they are. An application is held to what it asked,
          // though the window may have read the profile to show the user which account this is.
          ...l.profile && !o.app ? { profile: l.profile } : {},
          ...o.remember === !0 ? { remember: !0 } : {},
          ...o.family !== void 0 ? { family: o.family } : {},
          ...o.more !== void 0 ? { more: o.more } : {},
          // With the lock on, nothing is kept for any site: a key at rest in a site's storage would be a key
          // the lock does not cover. Every site is allowed for the visit, and asks at the sign-in address again.
          ...A ? { visitOnly: !0 } : {},
          // When it was allowed, by this worker's clock, and where the user writes: what a signer needs to
          // find out later whether the site was taken back (docs/take-back.md).
          at: Date.now() / 1e3,
          relays: l.relays
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
      const { everydayPrivateKey: n } = R();
      if (!l.signerOnly) throw new Error("Only a signer-only session can be remembered for a site.");
      const r = t, o = Date.now() / 1e3;
      if (!l.remember) return { kept: !1 };
      if (l.app && l.app.site !== r.site || l.site && l.site !== r.site) throw new Error("This hand-off was for another site.");
      if (l.family) {
        if (!Se(r.site, l.family)) throw new Error("This hand-off was for another site.");
        await kt(w, r.site);
      }
      return {
        kept: await tn(
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
            ...!l.app && !l.family && l.more.length ? { more: ue(l.more) } : {},
            ...l.app ? { permissions: l.app.permissions, signedSensitive: [] } : {}
          },
          o
        )
      };
    }
    // The site's page was loaded again: what was kept for that site, if it is still in date, becomes a
    // signer-only session. It touches nothing a full session uses.
    case "signerRestore": {
      const n = t, r = await bt(w, n.site, Date.now() / 1e3), o = !r && n.family !== void 0 && Q(n.family) && Se(n.site, n.family) ? n.family : null, i = r ?? (o ? await bt(w, o, Date.now() / 1e3) : null);
      return !i || o && i.site !== o ? { restored: !1 } : (V(), l.signer = new se(i.everydayPrivateKey), l.everydayPrivateKey = i.everydayPrivateKey, l.signerOnly = !0, l.app = i.permissions ? { site: i.site, permissions: i.permissions } : null, l.site = o ? n.site : i.site, l.family = o, l.profile = i.profile ?? null, l.remember = !0, l.grantAt = en(i), l.relays = i.relays ?? [], l.more = o ? [] : i.more ?? [], {
        restored: !0,
        everydayPublicKey: l.signer.getPublicKey(),
        until: i.until,
        ...i.name ? { name: i.name } : {},
        ...i.profile ? { profile: i.profile } : {},
        signed: i.signed,
        ...i.signedPass ? { signedPass: i.signedPass } : {},
        check: wr(Date.now() / 1e3, en(i), i.checkedAt ?? 0),
        ...o ? { family: o } : {},
        ...l.more.length ? { more: ue(l.more) } : {},
        ...i.permissions ? { permissions: i.permissions, signedSensitive: i.signedSensitive ?? [] } : {}
      });
    }
    // Count a signature against the site, where reloading the page can't lose the count.
    case "signerTouch": {
      const { everydayPrivateKey: n } = R();
      if (!l.signerOnly) throw new Error("Only a signer-only session is counted for a site.");
      const r = t, o = Date.now() / 1e3, i = await bt(w, l.family && Se(r.site, l.family) ? l.family : r.site, o);
      return i && E(i.everydayPrivateKey) === E(n) && await tn(
        w,
        { ...i, signed: Array.isArray(r.signed) ? r.signed : [], ...Array.isArray(r.signedPass) ? { signedPass: r.signedPass } : {}, ...i.permissions ? { signedSensitive: Array.isArray(r.signedSensitive) ? r.signedSensitive : [] } : {} },
        o
      ), {};
    }
    // Signing out of a site that was allowed as one of a family signs out of the family: otherwise its next page
    // load would take the family's grant up again, and the sign-out would not have happened (SF6).
    case "signerForget": {
      const n = t.site;
      await kt(w, n), l.family && Se(n, l.family) && await kt(w, l.family);
      for (const r of ["save", "follow", "seal", "unwrap", "reach", "score", "achieve"])
        Kn.delete(`${Pn}${r}:${n}`), await w.delete(`${Pn}${r}:${n}`).catch(() => {
        });
      return {};
    }
    case "handoffAccept": {
      if (!pe) throw new Error("No hand-off was begun here.");
      const n = pe;
      pe = null;
      let r;
      try {
        r = el(t, n);
      } finally {
        _(n);
      }
      return V(), l.signer = new se(r.key), l.everydayPrivateKey = r.key, l.signerOnly = !0, l.app = r.app, l.site = r.site, l.profile = r.profile, l.remember = r.remember, l.grantAt = r.at, l.relays = r.relays, l.family = r.family, l.more = r.more, {
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
      const { signer: n } = R(), r = n.getPublicKey(), o = t.profile !== !1, i = [.../* @__PURE__ */ new Set([...D, ...S])].slice(0, 8);
      if (i.length === 0) return {};
      const s = new K(i);
      try {
        const [a, c] = await Promise.all([
          o ? s.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 4e3) : Promise.resolve(null),
          s.queryQuorum({ kinds: [Fe], authors: [r], limit: 2 }, 4e3)
        ]);
        if (l.signer !== n) return {};
        l.profile = a ? xc(a.outcomes.flatMap((u) => u.events), r) : null, l.profile && !l.signerOnly && await ge(w, Vc(await W(w), r, l.profile)), l.relays = Ve(c.outcomes.flatMap((u) => u.events), r);
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
      const { signer: n } = R(), r = t, o = n.getPublicKey(), i = Date.now() / 1e3, s = r.all === !0 ? { all: !0 } : { site: String(r.site ?? "") }, a = new K([.../* @__PURE__ */ new Set([...D, ...S])].slice(0, 8));
      let c;
      try {
        c = Ve((await a.queryQuorum({ kinds: [Fe], authors: [o], limit: 2 }, 4e3)).outcomes.flatMap((y) => y.events), o);
      } finally {
        a.closeAll();
      }
      const u = [.../* @__PURE__ */ new Set([...c, ...S])].slice(0, 16), d = new K(u);
      try {
        const y = await d.queryQuorum({ kinds: [Qt], authors: [o], "#d": [zt], limit: 2 }, 5e3);
        if (y.respondedCount === 0) return { ok: !1, accepted: 0, of: u.length };
        const h = hr(y.outcomes.flatMap((b) => b.events), o, i), f = h ? Or(n, h.content) : null, v = await gl(o), p = Wi(Bi(f ?? dn, v, i), s, i), g = n.signEvent({
          kind: Qt,
          // Later than the one it replaces, whatever the two clocks say.
          created_at: Math.max(Math.floor(i), (h?.created_at ?? 0) + 1),
          tags: [["d", zt]],
          content: n.nip44Encrypt(o, vr(p))
        }), m = j(await d.publishAll(g, 6e3)), k = m >= Math.min(2, u.length);
        return k && await w.set(ki + o, vr(p)).catch(() => {
        }), { ok: k, accepted: m, of: u.length };
      } finally {
        d.closeAll();
      }
    }
    // In the embedded signer, for a kept grant: ask the user's relays whether this site was taken back. Asked at
    // most once a day. It can end the grant or leave it be, and nothing else.
    case "signerCheck": {
      const { signer: n } = R();
      if (!l.signerOnly || !l.site) return { state: "ok" };
      const r = l.family ?? l.site, o = Date.now() / 1e3, i = await bt(w, r, o);
      if (!i) return { state: "ok" };
      const s = n.getPublicKey(), a = en(i), c = wr(o, a, i.checkedAt ?? 0);
      if (c === "fresh") return { state: "ok" };
      const u = [.../* @__PURE__ */ new Set([...Y(i.relays), ...S])].slice(0, 12), d = new K(u);
      let y, h;
      try {
        [y, h] = await Promise.all([
          d.queryQuorum({ kinds: [Qt], authors: [s], "#d": [zt], limit: 2 }, 5e3),
          d.queryQuorum({ kinds: [Fe], authors: [s], limit: 2 }, 5e3)
        ]);
      } finally {
        d.closeAll();
      }
      if (l.signer !== n) return { state: "ok" };
      const f = hr(y.outcomes.flatMap((m) => m.events), s, o), v = f ? Or(n, f.content) : null;
      if (v && ji(v, r, a))
        return await kt(w, r), V(), { state: "ended" };
      if (!Gi({
        asked: u.length,
        answered: y.respondedCount,
        seenAt: i.seenAt ?? 0,
        newestAt: f ? f.created_at : null,
        readable: v !== null
      })) return { state: c === "overdue" ? "stale" : "ok" };
      const g = Ve(h.outcomes.flatMap((m) => m.events), s);
      return await tn(
        w,
        {
          ...i,
          checkedAt: Math.floor(o),
          seenAt: Math.max(i.seenAt ?? 0, v && f ? f.created_at : 0),
          ...g.length ? { relays: g } : {}
        },
        o
      ), g.length && (l.relays = g), { state: "ok" };
    }
    // A room pass (NSWP kind 27300) for the site this session serves, and for no other. The site, the time, how
    // long it lasts and the profile are all this worker's own: what is asked for is a session public key. Not
    // for an application: an application is held to the set the user read, and a pass is not in one.
    case "roomPass": {
      const { signer: n } = R();
      if (!l.signerOnly || l.app || !l.site) throw new Error("refused");
      const r = Oc({
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
      const { signer: n, everydayPrivateKey: r, site: o } = H(), i = t, s = me(r, n.getPublicKey());
      try {
        const a = ls({ conversationKey: s, world: o, slot: i.slot, data: i.data, nowSeconds: Date.now() / 1e3 });
        if (!a || !await he("save", o, us)) throw new Error("refused");
        return n.signEvent(a);
      } finally {
        _(s);
      }
    }
    case "worldFind": {
      const { signer: n, everydayPrivateKey: r, site: o } = H(), i = me(r, n.getPublicKey());
      try {
        const s = cs(i, o, t.slot);
        if (!s) throw new Error("refused");
        return { d: s };
      } finally {
        _(i);
      }
    }
    case "worldOpen": {
      const { signer: n, everydayPrivateKey: r, site: o } = H(), i = t.event;
      if (!C(i)) throw new Error("refused");
      const s = me(r, n.getPublicKey());
      try {
        const a = as(i, { conversationKey: s, pubkey: n.getPublicKey(), world: o });
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
      const { signer: n, site: r } = H();
      if (!l.more.includes("follows")) throw new Error("refused");
      const o = t, i = n.getPublicKey(), s = o.list === null ? null : gr(o.list, i);
      if (o.list !== null && !s) throw new Error("refused");
      const a = ml + i;
      let c = 0;
      try {
        const v = Number(await w.get(a));
        Number.isSafeInteger(v) && v > 0 && (c = v);
      } catch {
      }
      const u = [.../* @__PURE__ */ new Set([...Y(l.relays), ...D, ...S])].slice(0, 8);
      let d = 0, y = 0;
      if (u.length) {
        const v = new K(u);
        try {
          const p = await v.queryQuorum({ kinds: [$e], authors: [i], limit: 2 }, 3500);
          d = p.respondedCount;
          for (const g of p.outcomes.flatMap((m) => m.events))
            g.created_at > y && gr(g, i) && (y = g.created_at);
        } catch {
        } finally {
          v.closeAll();
        }
      }
      if (l.signer !== n || !l.more.includes("follows")) throw new Error("refused");
      if (c = Math.max(c, y), c && await w.set(a, String(c)).catch(() => {
      }), !is(s, { answered: d, newestAt: y })) throw new Error("refused");
      const h = ss({ list: s, ...o.add !== void 0 ? { add: o.add } : {}, ...o.remove !== void 0 ? { remove: o.remove } : {}, pubkey: i, nowSeconds: Date.now() / 1e3, seen: c });
      if (!h || !await he("follow", r, bs)) throw new Error("refused");
      const f = n.signEvent(h);
      return await w.set(a, String(Math.max(c, f.created_at))).catch(() => {
      }), f;
    }
    // ---- A score on one of a world's boards (NSWP-15; embedded/scores.ts). For any world its visitor allowed: it
    // is less than a note. The world names its coordinate, a board and a number; the note and the mark that says
    // which site asked are this worker's own.
    case "worldScore": {
      const { signer: n, site: r } = H(), o = t, i = os({ world: o.world, board: o.board, score: o.score, title: o.title, format: o.format, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await he("score", r, ms)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- An achievement held in a world (NSWP-16; embedded/achievements.ts). As a score: for any world its visitor
    // allowed, built here from three plain fields, and marked with the site this session serves.
    case "worldAchieve": {
      const { signer: n, site: r } = H(), o = t, i = rs({ world: o.world, id: o.achievement, title: o.title, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await he("achieve", r, gs)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- Private messages from inside a world (NSWP-14; embedded/messages.ts). Only for a world the user let do
    // this, by name, in the window. The world names a reader and the words, or hands over a wrap; it is never given
    // a key, and nothing else is encrypted or decrypted for it.
    case "worldSeal": {
      const { signer: n, site: r } = H();
      if (!l.more.includes("messages")) throw new Error("refused");
      const o = t, i = ns(n, { to: o.to, text: o.text, nowSeconds: Date.now() / 1e3 });
      if (!i || !await he("seal", r, ws)) throw new Error("refused");
      return i;
    }
    case "worldUnwrap": {
      const { signer: n, site: r } = H();
      if (!l.more.includes("messages")) throw new Error("refused");
      if (!await he("unwrap", r, vs, !1)) throw new Error("refused");
      const o = ts(n, t.event);
      if (!o) throw new Error("refused");
      return { message: o };
    }
    case "worldReach": {
      const { signer: n, site: r } = H();
      if (!l.more.includes("messages")) throw new Error("refused");
      const o = es(t.relays, Date.now() / 1e3);
      if (!o || !await he("reach", r, hs)) throw new Error("refused");
      return n.signEvent(o);
    }
    // ---- What an approved application may ask beyond signing (§SW9.5). Refused without a permission set.
    case "appEncrypt": {
      const { signer: n } = R(), r = sn(), o = t, i = n.getPublicKey(), s = r.permissions.sign.some((a) => Xi.includes(a));
      if (!Zi(r.permissions, i, o.peerPublicKey) && !(s && /^[0-9a-f]{64}$/u.test(String(o.peerPublicKey))))
        throw new Error("refused");
      if (typeof o.text != "string" || o.text.length > 1e5) throw new Error("refused");
      return { text: o.scheme === "nip04" ? n.nip04Encrypt(o.peerPublicKey, o.text) : n.nip44Encrypt(o.peerPublicKey, o.text) };
    }
    case "appDecrypt": {
      const { signer: n } = R(), r = sn(), o = t;
      if (!Yi(r.permissions, o.peerPublicKey) || typeof o.text != "string") throw new Error("refused");
      return { text: o.scheme === "nip04" ? n.nip04Decrypt(o.peerPublicKey, o.text) : n.nip44Decrypt(o.peerPublicKey, o.text) };
    }
    case "appDecryptEvent": {
      const { signer: n } = R(), r = sn(), o = t.event;
      if (!C(o)) throw new Error("refused");
      const i = Qi(r.permissions, n.getPublicKey(), o), s = o.kind === 4 || /\?iv=[A-Za-z0-9+/=]+$/u.test(o.content);
      for (const a of i)
        try {
          return { text: s ? n.nip04Decrypt(a, o.content) : n.nip44Decrypt(a, o.content) };
        } catch {
        }
      throw new Error("refused");
    }
    case "nip46Connect": {
      const r = Hs(t.uri), o = new kr({
        clientSecretKey: qe(),
        pointer: r,
        onAuthUrl: qr
      });
      try {
        await o.connect();
        const i = await o.getUserPublicKey();
        return Vr(o, i), Et(), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46NostrconnectStart": {
      const n = t, r = S.slice(0, 2);
      Et();
      const o = qe(), i = Ce(O(16));
      return z = { clientSecretKey: o, relayUrls: r, secret: i, abort: new AbortController() }, { uri: Js({
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
        ({ signerPubkey: r } = await Qs({
          clientSecretKey: n.clientSecretKey,
          relayUrls: n.relayUrls,
          secret: n.secret,
          timeoutMs: 18e4,
          signal: n.abort.signal
        }));
      } catch (i) {
        throw z === n && Et(), i;
      }
      if (z !== n) throw new Error("This signer-connection attempt was superseded.");
      z = null;
      const o = new kr({
        clientSecretKey: n.clientSecretKey,
        pointer: { signerPubkey: r, relayUrls: n.relayUrls },
        onAuthUrl: qr
      });
      try {
        const i = await o.getUserPublicKey();
        return Vr(o, i), { userPubkey: i };
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
      const n = be;
      return be = null, Et(), n && _i(n.client), {};
    }
    case "configure": {
      const n = t;
      return En = !!n.vaultRelayUrls?.length, _n = !!n.discoveryRelayUrls?.length, n.vaultRelayUrls?.length && (S = n.vaultRelayUrls), n.discoveryRelayUrls?.length && (D = n.discoveryRelayUrls), Dr(Pt(await oo(w))), (!En || !_n) && Us(w).then(Dr, () => {
      }), {};
    }
    case "register": {
      const n = t, r = n.importKey ? await za({ nsecOrHex: n.importKey, loginName: n.loginName, password: n.password, vaultRelayUrls: S }) : await Do({ loginName: n.loginName, password: n.password, vaultRelayUrls: S });
      return V(), l.signer = new se(r.everydayPrivateKey), l.everydayPrivateKey = r.everydayPrivateKey, l.accountId = r.accountId, l.recoveryPublicKey = r.recoveryPublicKey, l.activeCredentialEvent = r.credentialEvent, l.activeRecoveryEvent = r.recoveryEvent, l.everydayKeyDerived = r.everydayKeyDerived, Sn(r.connectionVaultRoot, r.vaultSudoKey), await ve(), {
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
      const r = Oo(t.nsecOrHex), o = E(r), i = { everydayPublicKey: o, npub: ze(o) };
      return r.fill(0), i;
    }
    case "login": {
      const n = t, r = await Qa({
        loginName: n.loginName,
        password: n.password,
        vaultRelayUrls: S,
        store: w,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return V(), l.signer = new se(r.everydayPrivateKey), l.everydayPrivateKey = r.everydayPrivateKey, l.accountId = r.accountId, l.recoveryPublicKey = r.recoveryPublicKey, l.activeCredentialEvent = r.credentialEvent, l.activeRecoveryEvent = r.recoveryCapsuleEvent, l.everydayKeyDerived = r.everydayKeyDerived, Sn(r.connectionVaultRoot, r.vaultSudoKey), await ve(), !r.rollbackWarning && !r.relayDisagreementWarning && Pr({
        relayUrls: S,
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
      const n = t, r = await Ya({
        phrase: n.phrase,
        vaultRelayUrls: S,
        discoveryRelayUrls: D,
        offlineRecoveryCapsuleEvents: n.offlineExportFile?.recovery_capsule_events
      });
      return Lr(r);
    }
    case "previewPhraseRebuild": {
      const r = await Xa({ phrase: t.phrase, vaultRelayUrls: S, discoveryRelayUrls: D });
      return { ...r, npub: ze(r.everydayPublicKey) };
    }
    case "rebuildFromPhrase": {
      const r = await Za({ phrase: t.phrase, vaultRelayUrls: S, discoveryRelayUrls: D });
      return Lr(r);
    }
    case "completeRecovery": {
      const n = t;
      if (!l.pendingRecovery) throw new Error("No recovery is in progress in this session.");
      const r = await ec({
        recovered: l.pendingRecovery,
        newLoginName: n.newLoginName,
        newPassword: n.newPassword,
        vaultRelayUrls: S,
        store: w
      });
      return l.activeCredentialEvent = r.credentialEvent, l.activeRecoveryEvent = r.refreshedRecoveryEvent, l.pendingRecovery.recoveryPrivateKey.fill(0), l.pendingRecovery = null, await ve(), {
        locatorPublicKey: r.locatorPublicKey,
        credentialEventId: r.credentialEvent.id,
        refreshedRecoveryEventId: r.refreshedRecoveryEvent.id
      };
    }
    case "changePassword": {
      const n = t, r = await tc({
        loginName: n.loginName,
        oldPassword: n.oldPassword,
        newPassword: n.newPassword,
        vaultRelayUrls: S,
        store: w,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return l.activeCredentialEvent = r.newCredentialEvent, l.recoveryPublicKey = r.recoveryPublicKey, l.activeRecoveryEvent = r.recoveryCapsuleEvent, await ve(), {
        newLocatorPublicKey: r.newLocatorPublicKey,
        newGeneration: r.newGeneration,
        tombstoneAcknowledgedCount: r.tombstoneAcknowledgedCount,
        deletionAcknowledgedCount: r.deletionAcknowledgedCount
      };
    }
    case "publishProfileAndRelayLists": {
      const n = t, { everydayPrivateKey: r } = R();
      return Ia({
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
      const { signer: n } = R();
      return { publicKey: n.getPublicKey() };
    }
    case "signEvent": {
      const { signer: n } = R(), r = t;
      if (l.signerOnly) {
        if (l.app) {
          const o = fs(l.app.permissions, r, l.app.site, Date.now() / 1e3);
          if (!o) throw new Error("refused");
          return n.signEvent(o);
        }
        if (ps(r.kind) !== "ordinary") throw new Error("refused");
      }
      return n.signEvent({ kind: r.kind, tags: r.tags, content: r.content, created_at: r.created_at });
    }
    case "nip44Encrypt": {
      const { signer: n } = R(), r = t;
      return { ciphertext: n.nip44Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip44Decrypt": {
      const { signer: n } = R(), r = t;
      return { plaintext: n.nip44Decrypt(r.peerPublicKey, r.payload) };
    }
    case "nip04Encrypt": {
      const { signer: n } = R(), r = t;
      return { ciphertext: n.nip04Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip04Decrypt": {
      const { signer: n } = R(), r = t;
      return { plaintext: n.nip04Decrypt(r.peerPublicKey, r.payload) };
    }
    case "exportIdentity": {
      const { everydayPrivateKey: n, signer: r } = R();
      return { nsec: Ri(n), npub: ze(r.getPublicKey()) };
    }
    case "buildRecoveryExport": {
      if (R(), !l.recoveryPublicKey || !l.activeRecoveryEvent)
        throw new Error("No recovery capsule is known in this session yet.");
      return Ci({
        recoveryPublicKeyHex: l.recoveryPublicKey,
        vaultRelayUrls: S,
        recoveryCapsuleEvents: [l.activeRecoveryEvent],
        relayListEvents: []
      });
    }
    case "repairReplicas": {
      if (!l.activeCredentialEvent || !l.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Pr({
        relayUrls: S,
        credentialEvent: l.activeCredentialEvent,
        recoveryEvent: l.activeRecoveryEvent
      });
    }
    case "checkReplicaHealth": {
      if (!l.activeCredentialEvent || !l.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Ga({
        relayUrls: S,
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
      return !A && await St(w) === "locked" ? { restored: !1, locked: !0 } : an();
    // Log out: this account is forgotten on this device. Other accounts kept here stay, and so does the lock
    // they are sealed under; with none left, everything goes as it always did.
    case "logout": {
      const n = l.everydayPrivateKey && !l.signerOnly ? E(l.everydayPrivateKey) : "", r = At(await W(w), n);
      return n && await J(w, F(n)), r.length > 0 && n ? (await ge(w, r), V(), await J(w), await We(w), {}) : (Be(), await et(w), await An(), await Nr(w), await We(w), {});
    }
    // ---- Several accounts on one device (docs/account-switching.md) ----
    // Who is kept here, and which of them is signed in. Public keys and what their own profiles call them.
    case "accountsList": {
      const n = l.everydayPrivateKey && !l.signerOnly ? E(l.everydayPrivateKey) : "";
      return { accounts: (await W(w)).map((r) => ({ ...r, active: r.pubkey === n })) };
    }
    // Switch to a kept account: its own slot is opened, on this device, with no password and no relay. With the
    // lock on and locked, it says so, and nothing changes.
    case "accountsSwitch": {
      if (l.signerOnly) throw new Error("A signer-only session cannot switch accounts.");
      const n = String(t.pubkey ?? ""), r = await W(w);
      if (!r.some((i) => i.pubkey === n)) return { restored: !1 };
      if (!A && await St(w, F(n)) === "locked") return { restored: !1, locked: !0 };
      const o = await an(F(n));
      return !o.restored || o.everydayPublicKey !== n ? (V(), await J(w, F(n)), await ge(w, At(r, n)), await J(w), await We(w), { restored: !1 }) : (await ve(), o);
    }
    // Make room to sign in as another account: nobody is signed in, and everyone kept stays kept.
    case "accountsAdd": {
      if (l.signerOnly) throw new Error("A signer-only session cannot add accounts.");
      return V(), await J(w), await We(w), {};
    }
    // Forget one kept account that is not the one signed in. (For that one: log out.)
    case "accountsRemove": {
      const n = String(t.pubkey ?? ""), r = l.everydayPrivateKey && !l.signerOnly ? E(l.everydayPrivateKey) : "";
      if (n === r) throw new Error("Log out to remove the account that is signed in.");
      return await J(w, F(n)), await ge(w, At(await W(w), n)), {};
    }
    // ---- Connection Vault (connection-vault.md §12, reveal mode) ----
    // ---- An ecash wallet kept with the account (docs/ecash.md). A full session only: none of these is on the list a
    // handed-over session may ask, so no embedded signer, and so no site, can read a token.
    // ---- A person's files (docs/files.md). A full session only: none of these is on the list a handed-over
    // session may ask, so no embedded signer, and so no site, can read the index or have a permission note signed.
    case "blossomAuth": {
      const { signer: n } = R();
      return { token: cl(n, t) };
    }
    case "driveLoad":
    case "driveSave":
    case "blossomServers":
    case "blossomSetServers": {
      const { signer: n } = R(), r = n.getPublicKey(), o = [.../* @__PURE__ */ new Set([...D, ...S])].slice(0, 8);
      let i = l.relays;
      if (i.length === 0 && o.length) {
        const a = new K(o);
        try {
          i = Ve((await a.queryQuorum({ kinds: [Fe], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((c) => c.events), r);
        } catch {
          i = [];
        } finally {
          a.closeAll();
        }
      }
      const s = new K([.../* @__PURE__ */ new Set([...i, ...S, ...e.startsWith("blossom") ? D : []])].slice(0, 16));
      try {
        const a = { signer: n, store: w, relays: s };
        if (e === "driveLoad") return await sl(a);
        if (e === "driveSave") return await al(a, t);
        const c = async () => {
          const g = (await s.queryQuorum({ kinds: [Je], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((m) => m.events).filter((m) => m.kind === Je && m.pubkey === r && C(m)).sort((m, k) => k.created_at - m.created_at)[0];
          return g ? wi(g) : [];
        };
        if (e === "blossomSetServers") {
          const p = [...new Set((t.servers ?? []).map($n).filter(Boolean))].slice(0, Fn.servers);
          if (p.length === 0) throw new Error("Name at least one file server, by its https address.");
          const g = n.signEvent({ kind: Je, created_at: Math.floor(Date.now() / 1e3), tags: p.map((m) => ["server", m]), content: "" });
          if (j(await s.publishAll(g, 6e3)) < Math.min(2, s.relayUrls.length)) throw new Error("No relay took your server list. Try again when you are online.");
          return { mine: p };
        }
        const [u, d, y] = await Promise.all([
          c(),
          s.queryQuorum({ kinds: [Je], limit: 500 }, 5e3),
          s.queryQuorum({ kinds: [$e], authors: [r], limit: 2 }, 4e3)
        ]), h = y.outcomes.flatMap((p) => p.events).filter((p) => p.pubkey === r && p.kind === $e && C(p)).sort((p, g) => g.created_at - p.created_at)[0], f = new Set((h?.tags ?? []).filter((p) => p[0] === "p" && typeof p[1] == "string").map((p) => p[1])), v = new Map(d.outcomes.flatMap((p) => p.events).filter((p) => p.pubkey !== r && C(p)).map((p) => [p.id, p]));
        return { mine: u, ranked: ll([...v.values()], f) };
      } finally {
        s.closeAll();
      }
    }
    // The words of their newest profile note, to show what a proposed one would change. Read-only, and theirs.
    case "profileContent": {
      const { signer: n } = R(), r = n.getPublicKey(), o = [.../* @__PURE__ */ new Set([...l.relays, ...D, ...S])].slice(0, 10);
      if (o.length === 0) return { content: null, answered: !1 };
      const i = new K(o);
      try {
        const s = await i.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 3500), a = s.outcomes.flatMap((c) => c.events).filter((c) => c.kind === 0 && c.pubkey === r && C(c)).sort((c, u) => u.created_at - c.created_at)[0];
        return { content: a ? a.content : null, answered: s.respondedCount > 0 };
      } finally {
        i.closeAll();
      }
    }
    // The mints people recommend (NIP-87): read from relays, counted one voice per account, the user's own follows
    // first. It reads public notes and the user's follow list, and writes nothing.
    case "ecashMints": {
      const { signer: n } = R(), r = n.getPublicKey(), o = [.../* @__PURE__ */ new Set([...D, ...S])].slice(0, 8);
      if (o.length === 0) return { mints: [] };
      const i = new K(o);
      try {
        const [s, a] = await Promise.all([
          i.queryQuorum({ kinds: [fi], "#k": [pi], limit: 500 }, 5e3),
          i.queryQuorum({ kinds: [$e], authors: [r], limit: 2 }, 4e3)
        ]), c = a.outcomes.flatMap((y) => y.events).filter((y) => y.pubkey === r && y.kind === $e && C(y)).sort((y, h) => h.created_at - y.created_at)[0], u = new Set((c?.tags ?? []).filter((y) => y[0] === "p" && typeof y[1] == "string").map((y) => y[1])), d = new Map(s.outcomes.flatMap((y) => y.events).filter((y) => C(y)).map((y) => [y.id, y]));
        return { mints: rl([...d.values()], u) };
      } finally {
        i.closeAll();
      }
    }
    case "ecashLoad":
    case "ecashSetMints":
    case "ecashRoll": {
      const { signer: n } = R(), r = n.getPublicKey(), o = new K([.../* @__PURE__ */ new Set([...D, ...S])].slice(0, 8));
      let i = l.relays;
      if (i.length === 0)
        try {
          i = Ve((await o.queryQuorum({ kinds: [Fe], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((c) => c.events), r);
        } catch {
          i = [];
        } finally {
          o.closeAll();
        }
      else o.closeAll();
      const s = [.../* @__PURE__ */ new Set([...i, ...S])].slice(0, 16), a = new K(s);
      try {
        const c = { signer: n, store: w, relays: a };
        return e === "ecashLoad" ? await dl(c) : e === "ecashSetMints" ? await yl({ ...c, newKey: () => Ce(qe()) }, t.mints) : await fl(c, t);
      } finally {
        a.closeAll();
      }
    }
    case "vaultStatus":
      return l.signer ? l.connectionVaultRoot ? { enabled: !0, vaultPublicKey: Rn().vaultPublicKey } : { enabled: !1, reason: l.vaultKnown ? "no-vault" : "stale-cache" } : { enabled: !1 };
    case "vaultList": {
      const { connections: n, rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: s } = await Rt();
      return { connections: n.map(je), rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: s };
    }
    case "vaultSaveNwc": {
      const n = t, r = cn(n.site), o = Rn(), i = Rr(n.uri), s = n.label.trim().slice(0, 120) || "Wallet connection", { record: a, event: c } = await o.createConnection({
        connection_type: "nwc",
        tier: "connectable",
        label: s,
        credential: i,
        application_binding: { origin: r, app_pubkey: null }
      });
      if (!(await o.publish({
        event: c,
        connectionId: a.connection_id,
        relayUrls: S,
        store: w
      })).success)
        throw new Error("The connection could not be saved to enough relays. Please try again.");
      const d = await o.decryptEvent(c);
      return je(d);
    }
    case "vaultFindForOrigin": {
      const n = cn(t.site), { connections: r } = await Rt(), o = r.find(
        (i) => i.record.connection_type === "nwc" && i.record.state === "active" && i.record.application_binding.origin === n
      );
      return { connection: o ? je(o) : null };
    }
    case "vaultRevealNwc": {
      const n = t, r = cn(n.site), { connection: o } = await ln(n.connectionId);
      if (o.record.connection_type !== "nwc" || o.record.state !== "active")
        throw new Error("That connection is not an active wallet connection.");
      const i = o.record.application_binding.origin;
      if (i !== null && i !== r)
        throw new Error("That connection belongs to a different site.");
      const s = o.record.credential;
      return zo(s), { uri: fc(s) };
    }
    case "vaultSetBinding": {
      const n = t, { vault: r, connection: o } = await ln(n.connectionId), i = n.origin === null ? null : Vt(), { record: s, event: a } = await r.updateConnection(o, {
        application_binding: { origin: i, app_pubkey: null }
      });
      if (!(await r.publish({
        event: a,
        connectionId: s.connection_id,
        relayUrls: S,
        store: w
      })).success) throw new Error("The change could not reach enough relays. Please try again.");
      const u = await r.decryptEvent(a);
      return je(u);
    }
    case "vaultDelete": {
      const n = t, { vault: r, connection: o } = await ln(n.connectionId), { record: i, event: s } = await r.deleteConnection(o);
      if (!(await r.publish({
        event: s,
        connectionId: i.connection_id,
        relayUrls: S,
        store: w
      })).success) throw new Error("The deletion could not reach enough relays. Please try again.");
      try {
        const c = r.buildDeletionRequest(o.event.id), u = new K(S);
        await u.publishAll(c), u.closeAll();
      } catch {
      }
      return {};
    }
    case "vaultOfferCheck": {
      const n = t, r = Vt(), o = Rr(n.uri), { connections: i } = await Rt(), s = i.find(
        (a) => a.record.connection_type === "nwc" && pc(a.record.credential, o)
      );
      return s ? s.record.application_binding.origin !== r ? { duplicate: !1 } : { duplicate: !0, connection: je(s) } : { duplicate: !1 };
    }
    default:
      throw new Error(`Unknown worker action: ${e}`);
  }
}
const kl = /* @__PURE__ */ new Set([
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
  if (typeof t.action != "string" || !kl.has(t.action)) {
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
  (r.startsWith("nip46") ? (s) => s() : (s) => vl.run(s))(() => bl(r, o)).then(
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
