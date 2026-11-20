import { K as jo, b as Go, c as I, D as gr, d as ht, w as k, f as kt, g as He, h as dn, S as Ct, j as Nt, k as xe, l as nt, B as Ho, m as Jo, n as Tt, o as Je, q as pn, r as fn, a as Fe, s as mr, t as zo, u as Yo } from "./bitlogin-shared-CK86q_VY.js";
import { g as b, s as M, v as N, b as ze, a as O, f as Ie, i as Qo, j as Xo, k as Zo, l as ei, m as ti, n as Dt, o as Wn, p as br, q as ni, t as ri, w as oi, x as st, y as kr, u as D, z as ii, A as _t, B as hn, C as vn, D as _r, E as ai, d as C, e as T, F as wn, G as si, H as Er, h as gn, I as Pr, J as ci, c as rt, K as Yt, L as ct } from "./bitlogin-shared-CFGY85HS.js";
import { b as ot, r as J, c as z, k as li, i as Pe, d as jn, T as Lt, e as Ut, R as Vt, n as Gn, g as ui, h as yi, w as qt, t as di, m as pi, N as Qt, j as Hn, l as Kr } from "./bitlogin-shared-BfY0khWO.js";
import { j as he, n as mn, o as Xt, w as fi, q as Be, t as $e, u as We, v as Z, x as Q, y as Sr, z as Ar, B as Ye, C as bn, c as hi, D as Qe, r as kn, m as _n, A as Et, E as se, k as vi, p as wi, F as gi, G as mi, H as bi, M as ki, I as _i, J as Jn, K as Ei, L as Pi, N as Ki, O as Si, Q as Ai, T as Ri, U as Ci, a as Ni, V as Ti } from "./bitlogin-shared-U7Szz15o.js";
function Rr(e) {
  const t = b(e.privateKey);
  return M({
    pubkey: t,
    created_at: e.createdAt,
    kind: jo,
    tags: [
      ["e", e.eventIdToDelete],
      ["k", String(e.deletedEventKind)]
    ],
    content: e.reason ?? ""
  }, e.privateKey);
}
function xi() {
  const e = globalThis.WebSocket;
  if (!e)
    throw new Error("No global WebSocket implementation is available in this environment.");
  return e;
}
const Pt = 1e3, Ii = 262144;
function Oi(e) {
  const t = Math.min(e.limit ?? Pt, Pt);
  return Math.max(50, t * 3);
}
const Mi = 2048, Di = 1e4, Li = 100;
function Ui(e, t) {
  if (e.size >= Mi) {
    const n = e.values().next().value;
    n !== void 0 && e.delete(n);
  }
  e.add(t);
}
class En {
  url;
  ws = null;
  connectPromise = null;
  subs = /* @__PURE__ */ new Map();
  pendingPublishes = /* @__PURE__ */ new Map();
  authPrivateKey;
  connectTimeoutMs;
  authenticated = !1;
  constructor(t, n = {}) {
    if (!ot(t))
      throw new Error("Relay URL must use secure WebSockets, except for an explicit loopback development endpoint.");
    this.url = t, this.authPrivateKey = n.authPrivateKey, this.connectTimeoutMs = n.connectTimeoutMs ?? 8e3;
  }
  async connect() {
    return this.connectPromise ? this.connectPromise : (this.connectPromise = new Promise((t, n) => {
      const r = xi(), o = new r(this.url);
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
    if (t.length > Ii)
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
      const l = s?.id;
      if (typeof l != "string" || a.seenIds.has(l))
        return;
      if (a.onEvent) {
        const y = Date.now();
        if (y - a.liveWindowStart >= Di && (a.liveWindowStart = y, a.liveVerifies = 0), a.liveVerifies >= Li || (a.liveVerifies++, !N(s) || !zn(s, a.filter)))
          return;
        Ui(a.seenIds, s.id), a.onEvent(s);
        return;
      }
      const u = Math.min(a.filter.limit ?? Pt, Pt);
      if (a.events.length >= u || a.verifyBudget <= 0 || (a.verifyBudget--, !N(s) || !zn(s, a.filter)))
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
    const n = b(this.authPrivateKey), r = M({
      pubkey: n,
      created_at: Math.floor(Date.now() / 1e3),
      kind: Go,
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
    const r = ze(O(8));
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
    const r = ze(O(8));
    return new Promise((o, i) => {
      const s = [], a = (u) => {
        clearTimeout(l), this.subs.delete(r);
        try {
          this.send(["CLOSE", r]);
        } catch {
        }
        u ? i(u) : o(s);
      }, l = setTimeout(() => a(new Error("relay did not answer the subscription before the timeout")), n);
      this.subs.set(r, {
        events: s,
        seenIds: /* @__PURE__ */ new Set(),
        verifyBudget: Oi(t),
        liveWindowStart: 0,
        liveVerifies: 0,
        filter: t,
        onEose: () => a()
      }), this.send(["REQ", r, t]);
    });
  }
}
function zn(e, t) {
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
      this.connections.set(r, new En(r, n));
  }
  get relayUrls() {
    return [...this.connections.keys()];
  }
  /** Queries every configured relay and waits for a quorum of responses (or all timeouts) before returning (§16.2). */
  async queryQuorum(t, n = 8e3) {
    const r = [...this.connections.entries()], o = await Promise.all(r.map(async ([a, l]) => {
      try {
        const u = await l.queryOnce(t, n);
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
function ve(e) {
  return e.filter((t) => t.result.ok).length;
}
const it = null, Cr = [
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
], Nr = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  // Added 2026-11-18: relay.nostr.band timed out and nostr-pub.wellorder.net
  // never connected in the same measurement, leaving two working lookups.
  "wss://nos.lol"
], Vi = [], qi = /^[0-9a-f]{64}$/u, Fi = 64;
function Ft(e) {
  return Array.isArray(e) && e.length <= Fi && e.every((t) => typeof t == "string" && ot(t)) && new Set(e).size === e.length;
}
function xt(e, t = it, n = -1) {
  if (!t || !qi.test(t) || /^0{64}$/u.test(t) || !N(e) || e.pubkey !== t || e.kind !== I || Ie(e, "d") !== gr)
    return null;
  try {
    const r = JSON.parse(e.content);
    if (typeof r != "object" || r === null || Array.isArray(r))
      return null;
    const o = r;
    return !Number.isSafeInteger(o.version) || o.version < 1 || o.version <= n || !Ft(o.vaultRelays) || !Ft(o.discoveryRelays) || o.deprecated !== void 0 && !Ft(o.deprecated) ? null : {
      version: o.version,
      vaultRelays: o.vaultRelays,
      discoveryRelays: o.discoveryRelays,
      ...o.deprecated === void 0 ? {} : { deprecated: o.deprecated }
    };
  } catch {
    return null;
  }
}
function Bi(e) {
  return Math.max(0, e - 1);
}
function Yn(e, t, n) {
  const r = t ? n === "vault" ? t.vaultRelays : t.discoveryRelays : [], o = new Set(t?.deprecated ?? []), i = new Set(e), s = [...new Set(r)].filter((a) => !o.has(a) && !i.has(a)).slice(0, Bi(e.length));
  return [...e, ...s];
}
async function $i(e, t = it, n = -1, r = 6e3) {
  if (!t || e.length === 0)
    return null;
  const o = new K([...e]);
  let i;
  try {
    i = (await o.queryQuorum({ kinds: [I], authors: [t], "#d": [gr], limit: 3 }, r)).outcomes.flatMap((l) => l.events);
  } finally {
    o.closeAll();
  }
  let s = null;
  for (const a of i) {
    const l = xt(a, t, n);
    l && (!s || l.version > s.list.version) && (s = { event: a, list: l });
  }
  return s;
}
const Tr = "bitlogin:bootstrap-relays:v1";
async function xr(e, t = it) {
  if (!t)
    return null;
  try {
    const n = await e.get(Tr);
    return n ? xt(JSON.parse(n), t) : null;
  } catch {
    return null;
  }
}
function vt(e) {
  return {
    vaultRelays: Yn(Cr, e, "vault"),
    discoveryRelays: Yn(Nr, e, "discovery"),
    listVersion: e?.version ?? null
  };
}
async function Wi(e, t = {}) {
  const n = t.maintainerPubkeyHex === void 0 ? it : t.maintainerPubkeyHex, r = await xr(e, n);
  if (!n)
    return vt(null);
  const o = vt(r), i = r?.version ?? -1;
  try {
    let s = await $i(t.queryRelayUrls ?? [.../* @__PURE__ */ new Set([...o.vaultRelays, ...o.discoveryRelays])], n, i, t.timeoutMs);
    if (!s) {
      const a = await ji(t.httpsFallbackUrls ?? Vi, n, i), l = a ? xt(a, n, i) : null;
      a && l && (s = { event: a, list: l });
    }
    return s ? (await e.set(Tr, JSON.stringify(s.event)), vt(s.list)) : o;
  } catch {
    return o;
  }
}
async function ji(e, t = it, n = -1) {
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
      if (N(a) && xt(a, t, n))
        return a;
    } catch {
    }
  return null;
}
const Pn = /^[0-9a-f]{64}$/u, Gi = 8, Hi = 4096, Ji = 256, zi = 512;
class ke extends Error {
  name = "BunkerUriParseError";
}
class Yi extends Error {
  name = "Nip46RequestTimeoutError";
  constructor(t, n) {
    super(`The remote signer did not answer ${t} within ${Math.round(n / 1e3)}s. It may be offline, or waiting for your approval on another device -- check your signer and try again.`);
  }
}
class Qi extends Error {
  name = "Nip46ErrorResponse";
}
function Xi(e) {
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return null;
  }
  const n = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol === "https:" || t.protocol === "http:" && n ? t.toString() : null;
}
function Zi(e) {
  if (e.length > Hi)
    throw new ke("That bunker URI is unreasonably long.");
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    throw new ke("That doesn't look like a valid URI.");
  }
  if (t.protocol !== "bunker:")
    throw new ke("A remote-signer URI must start with bunker://");
  const n = (t.host || t.pathname.replace(/^\/+/u, "")).toLowerCase();
  if (!Pn.test(n))
    throw new ke("The bunker URI does not name a valid signer public key.");
  const r = [
    ...new Set(t.searchParams.getAll("relay").map((i) => i.trim()).filter((i) => i.length > 0 && i.length <= zi))
  ].slice(0, Gi);
  if (r.length === 0)
    throw new ke("The bunker URI names no relays -- without at least one relay= parameter there is no way to reach the signer.");
  const o = t.searchParams.get("secret") ?? void 0;
  if (o && o.length > Ji)
    throw new ke("The bunker URI's secret is unreasonably long.");
  return { signerPubkey: n, relayUrls: r, secret: o || void 0 };
}
function ea(e) {
  if (!Pn.test(e.clientPubkey))
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
const ta = 12e4;
class Qn {
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
    this.clientSecretKey = t.clientSecretKey, this.clientPubkey = b(t.clientSecretKey), this.pointer = t.pointer, this.conversationKey = he(t.clientSecretKey, t.pointer.signerPubkey), this.onAuthUrl = t.onAuthUrl, this.requestTimeoutMs = t.requestTimeoutMs ?? ta, this.conns = t.pointer.relayUrls.map((n) => new En(n, { authPrivateKey: t.clientSecretKey }));
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
        kinds: [ht],
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
      n = JSON.parse(mn(this.conversationKey, t.content));
    } catch {
      return;
    }
    if (typeof n.id != "string")
      return;
    const r = this.pending.get(n.id);
    if (r) {
      if (n.result === "auth_url") {
        if (!r.authUrlSeen && typeof n.error == "string" && n.error) {
          const o = Xi(n.error);
          o && (r.authUrlSeen = !0, this.onAuthUrl?.(o));
        }
        return;
      }
      if (this.pending.delete(n.id), clearTimeout(r.timer), typeof n.error == "string" && n.error) {
        r.reject(new Qi(n.error));
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
    const r = ze(O(8)), o = Xt(this.conversationKey, JSON.stringify({ id: r, method: t, params: n })), i = [["p", this.pointer.signerPubkey]], s = M({
      pubkey: this.clientPubkey,
      created_at: Math.floor(Date.now() / 1e3),
      kind: ht,
      tags: i,
      content: o
    }, this.clientSecretKey), a = new Promise((y, d) => {
      const h = setTimeout(() => {
        this.pending.delete(r), d(new Yi(t, this.requestTimeoutMs));
      }, this.requestTimeoutMs);
      this.pending.set(r, { resolve: y, reject: d, timer: h, authUrlSeen: !1 });
    });
    if (a.catch(() => {
    }), !(await Promise.allSettled(this.conns.map((y) => y.publish(s)))).some((y) => y.status === "fulfilled" && y.value.ok)) {
      const y = this.pending.get(r);
      throw y && (this.pending.delete(r), clearTimeout(y.timer)), new Error("No relay accepted the request to the signer.");
    }
    return a;
  }
  /** bunker:// flow: announce ourselves; any non-error answer is acceptance. */
  async connect() {
    await this.rpc("connect", [this.pointer.signerPubkey, this.pointer.secret ?? ""]);
  }
  async getUserPublicKey() {
    const t = (await this.rpc("get_public_key", [])).trim().toLowerCase();
    if (!Pn.test(t))
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
    if (!N(o))
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
      const t = ze(O(8)), n = Xt(this.conversationKey, JSON.stringify({ id: t, method: "logout", params: [] }));
      return M({
        pubkey: this.clientPubkey,
        created_at: Math.floor(Date.now() / 1e3),
        kind: ht,
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
    this.pending.clear(), k(this.clientSecretKey), k(this.conversationKey);
  }
}
async function na(e) {
  const t = b(e.clientSecretKey), n = e.timeoutMs, r = e.relayUrls.map((i) => new En(i, { authPrivateKey: e.clientSecretKey })), o = () => {
    for (const i of r)
      i.close();
  };
  return new Promise((i, s) => {
    let a = !1;
    const l = () => u(new Error("The signer-connection attempt was cancelled.")), u = (p) => {
      a || (a = !0, clearTimeout(y), e.signal?.removeEventListener("abort", l), o(), p instanceof Error ? s(p) : i(p));
    }, y = setTimeout(() => u(new Error(`No signer connected within ${Math.round(n / 1e3)}s. Scan or paste the connection code in your signer app, then try again.`)), n);
    if (e.signal?.aborted) {
      l();
      return;
    }
    e.signal?.addEventListener("abort", l, { once: !0 });
    const d = { kinds: [ht], "#p": [t] }, h = (p) => {
      let v, w = null;
      try {
        w = he(e.clientSecretKey, p.pubkey), v = JSON.parse(mn(w, p.content));
      } catch {
        return;
      } finally {
        w && k(w);
      }
      v.result === e.secret && u({ signerPubkey: p.pubkey });
    };
    Promise.allSettled(r.map((p) => p.subscribeLive(d, h))).then((p) => {
      p.some((v) => v.status === "fulfilled") || u(new Error("Could not reach any relay to listen for the signer."));
    });
  });
}
function Kn() {
  const e = globalThis.crypto;
  if (!e || !e.subtle)
    throw new Error("WebCrypto SubtleCrypto is not available in this environment.");
  return e;
}
async function Ir(e) {
  if (e.length !== 32)
    throw new Error("AES-256-GCM key must be exactly 32 bytes.");
  return Kn().subtle.importKey("raw", e, "AES-GCM", !1, ["encrypt", "decrypt"]);
}
async function Or(e, t, n) {
  const r = Qo(), o = await Ir(e), i = await Kn().subtle.encrypt({ name: "AES-GCM", iv: r, additionalData: n, tagLength: 128 }, o, t);
  return { nonce: r, ciphertext: new Uint8Array(i) };
}
async function Mr(e, t, n, r) {
  const o = await Ir(e);
  try {
    const i = await Kn().subtle.decrypt({ name: "AES-GCM", iv: t, additionalData: r, tagLength: 128 }, o, n);
    return new Uint8Array(i);
  } catch {
    throw new Error("AES-256-GCM authentication failed: capsule is corrupted, tampered, or the wrong key was used.");
  }
}
const Dr = `abandon
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
function ra(e, t, n, r) {
  ei(e);
  const o = ti({ dkLen: 32, asyncTick: 10 }, r), { c: i, dkLen: s, asyncTick: a } = o;
  if (Dt(i), Dt(s), Dt(a), i < 1)
    throw new Error("iterations (c) should be >= 1");
  const l = Wn(t), u = Wn(n), y = new Uint8Array(s), d = br.create(e, l), h = d._cloneInto().update(u);
  return { c: i, dkLen: s, asyncTick: a, DK: y, PRF: d, PRFSalt: h };
}
function oa(e, t, n, r, o) {
  return e.destroy(), t.destroy(), r && r.destroy(), ni(o), n;
}
async function ia(e, t, n, r) {
  const { c: o, dkLen: i, asyncTick: s, DK: a, PRF: l, PRFSalt: u } = ra(e, t, n, r);
  let y;
  const d = new Uint8Array(4), h = Xo(d), p = new Uint8Array(l.outputLen);
  for (let v = 1, w = 0; w < i; v++, w += l.outputLen) {
    const m = a.subarray(w, w + l.outputLen);
    h.setInt32(0, v, !1), (y = u._cloneInto(y)).update(d).digestInto(p), m.set(p.subarray(0, m.length)), await Zo(o - 1, s, () => {
      l._cloneInto(y).update(p).digestInto(p);
      for (let g = 0; g < m.length; g++)
        m[g] ^= p[g];
    });
  }
  return oa(l, u, a, y, p);
}
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const aa = (e) => e[0] === "あいこくしん";
function Lr(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function Ur(e) {
  const t = Lr(e), n = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(n.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: n };
}
function Vr(e) {
  oi(e, 16, 20, 24, 28, 32);
}
const sa = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([kr(e)[0] >> t << t]);
};
function qr(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), st.chain(st.checksum(1, sa), st.radix2(11, !0), st.alphabet(e));
}
function ca(e, t) {
  const { words: n } = Ur(e), r = qr(t).decode(n);
  return Vr(r), r;
}
function la(e, t) {
  return Vr(e), qr(t).encode(e).join(aa(t) ? "　" : " ");
}
function ua(e, t) {
  try {
    ca(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const ya = (e) => Lr("mnemonic" + e);
function da(e, t = "") {
  return ia(ri, Ur(e).nfkd, ya(t), { c: 2048, dkLen: 64 });
}
function pa(e) {
  if (e.length !== 16)
    throw new Error("Recovery phrase entropy must be exactly 128 bits (16 bytes).");
  return la(e, Dr);
}
function Fr(e) {
  try {
    return ua(Br(e), Dr);
  } catch {
    return !1;
  }
}
function Br(e) {
  return e.trim().normalize("NFKD").toLowerCase().split(/\s+/u).join(" ");
}
async function Sn(e) {
  return da(Br(e), "");
}
const wt = [1024, 2048, 4096], pe = 4;
function fa(e) {
  const t = pe + e.length, n = wt.find((i) => i >= t);
  if (n === void 0)
    throw new Error(`Payload of ${e.length} bytes exceeds the largest padding bucket (${wt[wt.length - 1]} bytes minus ${pe}-byte length prefix).`);
  const r = new Uint8Array(n);
  return new DataView(r.buffer).setUint32(0, e.length, !1), r.set(e, pe), r;
}
function ha(e) {
  if (!wt.includes(e.length))
    throw new Error(`Padded plaintext length ${e.length} does not match a known bucket.`);
  const n = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !1);
  if (n > e.length - pe)
    throw new Error("Declared payload length exceeds the padded bucket size.");
  const r = e.slice(pe, pe + n), o = e.slice(pe + n);
  for (const i of o)
    if (i !== 0)
      throw new Error("Padding bytes are not all zero; capsule plaintext is malformed.");
  return r;
}
function va(e) {
  const t = ii(e);
  if (t === void 0)
    throw new Error("Value is not JSON-serializable for canonicalization.");
  return t;
}
function wa(e) {
  return D(va(e));
}
const ae = 16, ga = 283;
function ma(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function An(e) {
  return e << 1 ^ ga & -(e >> 7);
}
function Ke(e, t) {
  let n = 0;
  for (; t > 0; t >>= 1)
    n ^= e & -(t & 1), e = An(e);
  return n;
}
const Zt = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let n = 0, r = 1; n < 256; n++, r ^= An(r))
    e[n] = r;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let n = 0; n < 255; n++) {
    let r = e[255 - n];
    r |= r << 8, t[e[n]] = (r ^ r >> 4 ^ r >> 5 ^ r >> 6 ^ r >> 7 ^ 99) & 255;
  }
  return Ye(e), t;
})(), ba = /* @__PURE__ */ Zt.map((e, t) => Zt.indexOf(t)), ka = (e) => e << 24 | e >>> 8, Bt = (e) => e << 8 | e >>> 24;
function $r(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const n = new Uint32Array(256).map((u, y) => t(e[y])), r = n.map(Bt), o = r.map(Bt), i = o.map(Bt), s = new Uint32Array(256 * 256), a = new Uint32Array(256 * 256), l = new Uint16Array(256 * 256);
  for (let u = 0; u < 256; u++)
    for (let y = 0; y < 256; y++) {
      const d = u * 256 + y;
      s[d] = n[u] ^ r[y], a[d] = o[u] ^ i[y], l[d] = e[u] << 8 | e[y];
    }
  return { sbox: e, sbox2: l, T0: n, T1: r, T2: o, T3: i, T01: s, T23: a };
}
const Rn = /* @__PURE__ */ $r(Zt, (e) => Ke(e, 3) << 24 | e << 16 | e << 8 | Ke(e, 2)), Wr = /* @__PURE__ */ $r(ba, (e) => Ke(e, 11) << 24 | Ke(e, 13) << 16 | Ke(e, 9) << 8 | Ke(e, 14)), _a = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, n = 1; t < 16; t++, n = An(n))
    e[t] = n;
  return e;
})();
function jr(e) {
  bn(e);
  const t = e.length;
  ma(e);
  const { sbox2: n } = Rn, r = [];
  (!Be || !$e(e)) && r.push(e = We(e));
  const o = Q(Z(e)), i = o.length, s = (l) => B(n, l, l, l, l), a = new Uint32Array(t + 28);
  a.set(o);
  for (let l = i; l < a.length; l++) {
    let u = a[l - 1];
    l % i === 0 ? u = s(ka(u)) ^ _a[l / i - 1] : i > 6 && l % i === 4 && (u = s(u)), a[l] = a[l - i] ^ u;
  }
  return Ye(...r), a;
}
function Ea(e) {
  const t = jr(e), n = t.slice(), r = t.length, { sbox2: o } = Rn, { T0: i, T1: s, T2: a, T3: l } = Wr;
  for (let u = 0; u < r; u += 4)
    for (let y = 0; y < 4; y++)
      n[u + y] = t[r - u - 4 + y];
  Ye(t);
  for (let u = 4; u < r - 4; u++) {
    const y = n[u], d = B(o, y, y, y, y);
    n[u] = i[d & 255] ^ s[d >>> 8 & 255] ^ a[d >>> 16 & 255] ^ l[d >>> 24];
  }
  return n;
}
function ee(e, t, n, r, o, i) {
  return e[n << 8 & 65280 | r >>> 8 & 255] ^ t[o >>> 8 & 65280 | i >>> 24 & 255];
}
function B(e, t, n, r, o) {
  return e[t & 255 | n & 65280] | e[r >>> 16 & 255 | o >>> 16 & 65280] << 16;
}
function Xn(e, t, n, r, o) {
  const { sbox2: i, T01: s, T23: a } = Rn;
  let l = 0;
  t ^= e[l++], n ^= e[l++], r ^= e[l++], o ^= e[l++];
  const u = e.length / 4 - 2;
  for (let v = 0; v < u; v++) {
    const w = e[l++] ^ ee(s, a, t, n, r, o), m = e[l++] ^ ee(s, a, n, r, o, t), g = e[l++] ^ ee(s, a, r, o, t, n), _ = e[l++] ^ ee(s, a, o, t, n, r);
    t = w, n = m, r = g, o = _;
  }
  const y = e[l++] ^ B(i, t, n, r, o), d = e[l++] ^ B(i, n, r, o, t), h = e[l++] ^ B(i, r, o, t, n), p = e[l++] ^ B(i, o, t, n, r);
  return { s0: y, s1: d, s2: h, s3: p };
}
function Pa(e, t, n, r, o) {
  const { sbox2: i, T01: s, T23: a } = Wr;
  let l = 0;
  t ^= e[l++], n ^= e[l++], r ^= e[l++], o ^= e[l++];
  const u = e.length / 4 - 2;
  for (let v = 0; v < u; v++) {
    const w = e[l++] ^ ee(s, a, t, o, r, n), m = e[l++] ^ ee(s, a, n, t, o, r), g = e[l++] ^ ee(s, a, r, n, t, o), _ = e[l++] ^ ee(s, a, o, r, n, t);
    t = w, n = m, r = g, o = _;
  }
  const y = e[l++] ^ B(i, t, o, r, n), d = e[l++] ^ B(i, n, t, o, r), h = e[l++] ^ B(i, r, n, t, o), p = e[l++] ^ B(i, o, r, n, t);
  return { s0: y, s1: d, s2: h, s3: p };
}
function Ka(e) {
  if (bn(e), e.length % ae !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + ae);
}
function Sa(e, t, n) {
  bn(e);
  let r = e.length;
  const o = r % ae;
  if (!t && o !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (t) {
    let a = ae - o;
    a || (a = ae), r = r + a;
  }
  n = Sr(r, n), Ar(e, n), (!Be || !$e(e)) && (e = We(e));
  const i = Z(e);
  Q(i);
  const s = Z(n);
  return { b: i, o: s, out: n };
}
function Aa(e, t) {
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
function Ra(e) {
  const t = new Uint8Array(16), n = Z(t);
  t.set(e);
  const r = ae - e.length;
  for (let o = ae - r; o < ae; o++)
    t[o] = r;
  return n;
}
const Gr = /* @__PURE__ */ fi({ blockSize: 16, nonceLength: 16 }, function(t, n, r = {}) {
  const o = !r.disablePadding;
  return {
    encrypt(i, s) {
      const a = jr(t), { b: l, o: u, out: y } = Sa(i, o, s);
      let d = n;
      const h = [a];
      (!Be || !$e(d)) && h.push(d = We(d));
      const p = Z(d);
      Q(p);
      let v = p[0], w = p[1], m = p[2], g = p[3], _ = 0;
      for (; _ + 4 <= l.length; )
        v ^= l[_ + 0], w ^= l[_ + 1], m ^= l[_ + 2], g ^= l[_ + 3], { s0: v, s1: w, s2: m, s3: g } = Xn(a, v, w, m, g), u[_++] = v, u[_++] = w, u[_++] = m, u[_++] = g;
      if (o) {
        const E = Ra(i.subarray(_ * 4));
        Q(E), v ^= E[0], w ^= E[1], m ^= E[2], g ^= E[3], { s0: v, s1: w, s2: m, s3: g } = Xn(a, v, w, m, g), u[_++] = v, u[_++] = w, u[_++] = m, u[_++] = g;
      }
      return Q(u), Ye(...h), y;
    },
    decrypt(i, s) {
      Ka(i);
      const a = Ea(t);
      let l = n;
      const u = [a];
      (!Be || !$e(l)) && u.push(l = We(l));
      const y = Z(l);
      Q(y), s = Sr(i.length, s), Ar(i, s), (!Be || !$e(i)) && u.push(i = We(i));
      const d = Z(i), h = Z(s);
      Q(d);
      let p = y[0], v = y[1], w = y[2], m = y[3];
      for (let g = 0; g + 4 <= d.length; ) {
        const _ = p, E = v, x = w, V = m;
        p = d[g + 0], v = d[g + 1], w = d[g + 2], m = d[g + 3];
        const { s0: W, s1: be, s2: ue, s3: Ot } = Pa(a, p, v, w, m);
        h[g++] = W ^ _, h[g++] = be ^ E, h[g++] = ue ^ x, h[g++] = Ot ^ V;
      }
      return Q(h), Ye(...u), Aa(s, o);
    }
  };
});
function Hr(e, t) {
  const n = vn(new Uint8Array([2]), _r(t));
  return ai.getSharedSecret(e, n, !0).slice(1, 33);
}
function Ca(e, t, n) {
  return Na(e, t, n, O(16));
}
function Na(e, t, n, r) {
  if (r.length !== 16)
    throw new Error("NIP-04 iv must be exactly 16 bytes.");
  const o = Hr(e, t), i = Gr(o, r).encrypt(D(n));
  return `${_t.encode(i)}?iv=${_t.encode(r)}`;
}
function Ta(e, t, n) {
  const r = n.indexOf("?iv=");
  if (r === -1)
    throw new Error('NIP-04 payload is missing its "?iv=" suffix.');
  const o = _t.decode(n.slice(0, r)), i = _t.decode(n.slice(r + 4)), s = Hr(e, t), a = Gr(s, i).decrypt(o);
  return hn(a);
}
class ge extends Error {
  reason;
  constructor(t) {
    super("Account not found or credentials incorrect."), this.name = "AccountNotFoundError", this.reason = t;
  }
}
class te extends Error {
  constructor(t) {
    super(t), this.name = "RegistrationFailedError";
  }
}
class Jr extends Error {
  constructor(t = "An account already exists with this login name and password. Sign in instead, or choose different credentials.") {
    super(t), this.name = "AccountAlreadyExistsError";
  }
}
class ne extends Error {
  constructor(t) {
    super(t), this.name = "RecoveryFailedError";
  }
}
class zr extends Error {
  seenGeneration;
  capsuleGeneration;
  constructor(t, n) {
    super(`This credential capsule reports generation ${n}, but this device has already seen generation ${t}. Refusing to log in with older, possibly-revoked credentials.`), this.name = "RollbackDetectedError", this.seenGeneration = t, this.capsuleGeneration = n;
  }
}
function Xe(e, t) {
  const n = t ?? Math.floor(Date.now() / 1e3);
  return e == null ? n : Math.max(n, e + 1);
}
const xa = { generation: -1, recoveryGeneration: -1 };
function Cn(e) {
  return `bitlogin:hwm:${e}`;
}
async function Nn(e, t) {
  const n = await e.get(Cn(t));
  return n ? JSON.parse(n) : xa;
}
async function Yr(e, t, n) {
  const r = await Nn(e, t), o = {
    generation: Math.max(r.generation, n.generation ?? -1),
    recoveryGeneration: Math.max(r.recoveryGeneration, n.recoveryGeneration ?? -1)
  };
  return await e.set(Cn(t), JSON.stringify(o)), o;
}
async function Ia(e, t, n = { generation: 0, recoveryGeneration: -1 }) {
  await e.set(Cn(t), JSON.stringify(n));
}
function Oa(e, t, n) {
  return M({ pubkey: b(e), created_at: n, kind: kt, tags: [], content: JSON.stringify(t) }, e);
}
function Ma(e, t, n) {
  const r = t.map((o) => {
    const i = ["r", o.url];
    return o.read && !o.write && i.push("read"), o.write && !o.read && i.push("write"), i;
  });
  return M({ pubkey: b(e), created_at: n, kind: He, tags: r, content: "" }, e);
}
function Da(e, t, n) {
  return M({
    pubkey: b(e),
    created_at: n,
    kind: dn,
    tags: t.map((r) => ["relay", r]),
    content: ""
  }, e);
}
function La(e) {
  return e.tags.filter((t) => t[0] === "r" && t[1]).map((t) => t[1]);
}
function Ua(e) {
  return e.tags.filter((t) => t[0] === "relay" && t[1]).map((t) => t[1]);
}
async function Va(e) {
  const t = b(e.everydayPrivateKey), n = Math.floor(Date.now() / 1e3), r = [.../* @__PURE__ */ new Set([...e.generalRelays, ...e.dmRelays, ...e.discoveryRelays])], o = new K(r), [i, s, a] = await Promise.all([
    o.queryQuorum({ authors: [t], kinds: [kt] }),
    o.queryQuorum({ authors: [t], kinds: [He] }),
    o.queryQuorum({ authors: [t], kinds: [dn] })
  ]);
  o.closeAll();
  const l = i.outcomes.some((m) => m.events.length > 0), u = s.outcomes.some((m) => m.events.length > 0), y = a.outcomes.some((m) => m.events.length > 0), d = new K(r);
  let h = null, p = null, v = null;
  const w = [];
  if (!l && (e.name || e.about || e.picture)) {
    const m = Oa(e.everydayPrivateKey, { name: e.name, about: e.about, picture: e.picture }, n);
    w.push(d.publishAll(m).then((g) => void (h = g)));
  }
  if (!u) {
    const m = Ma(e.everydayPrivateKey, e.generalRelays.map((g) => ({ url: g, read: !0, write: !0 })), n);
    w.push(d.publishAll(m).then((g) => void (p = g)));
  }
  if (!y) {
    const m = Da(e.everydayPrivateKey, e.dmRelays, n);
    w.push(d.publishAll(m).then((g) => void (v = g)));
  }
  return await Promise.all(w), d.closeAll(), {
    profilePublished: h !== null && ve(h) > 0,
    relayListAcknowledgedCount: p !== null ? ve(p) : 0,
    dmRelayListAcknowledgedCount: v !== null ? ve(v) : 0,
    profileSkippedExisting: l,
    relayListSkippedExisting: u,
    dmRelayListSkippedExisting: y
  };
}
async function me(e, t, n) {
  const r = n.minAcks ?? 2, o = n.minReadbacks ?? 2, i = await e.publishAll(t, n.timeoutMs), s = ve(i), l = (await e.queryQuorum({ kinds: [I], authors: [t.pubkey], "#d": [n.dTag], limit: 5 }, n.timeoutMs)).outcomes.filter((u) => u.events.some((y) => y.id === t.id)).length;
  return {
    acknowledgedCount: s,
    readbackVerifiedCount: l,
    success: s >= r && l >= o
  };
}
function Qr(e) {
  return D(`bitlogin|password-capsule|v1|${e}|30078|bitlogin:password:v1`);
}
function Xr(e) {
  return D(`bitlogin|recovery-capsule|v1|${e}|30078|bitlogin:recovery:v1`);
}
async function Tn(e, t, n) {
  const r = wa(e), o = fa(r), i = await Or(t, o, n);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    nonce: C(i.nonce),
    ciphertext: C(i.ciphertext)
  };
}
async function xn(e, t, n) {
  if (e.version !== 1 || e.algorithm !== "aes-256-gcm")
    throw new Error(`Unsupported capsule envelope version/algorithm: ${e.version}/${e.algorithm}`);
  const r = T(e.nonce), o = T(e.ciphertext), i = await Mr(t, r, o, n), s = ha(i);
  return JSON.parse(hn(s));
}
class In extends Error {
  constructor(t) {
    super(t), this.name = "CapsuleValidationError";
  }
}
const qa = 1e6, Fa = /^[0-9a-f]{64}$/u;
function R(e, t) {
  if (!e)
    throw new In(t);
}
function Kt(e) {
  return typeof e == "string" && Fa.test(e);
}
function Zr(e) {
  R(Array.isArray(e), "vault_relay_hints must be an array (§12.4.7).");
  for (const t of e)
    R(typeof t == "string", "Each relay hint must be a string (§12.4.7)."), R(ot(t), `Relay URL must use secure WebSockets, except for an explicit loopback development endpoint (§12.4.7): ${t}`);
}
function eo(e) {
  R(typeof e == "string", "account_id must be a string (§12.4.2).");
  let t;
  try {
    t = T(e);
  } catch {
    throw new In("account_id is not valid base64url (§12.4.2).");
  }
  R(t.length === 16, "account_id must decode to exactly 128 bits (§12.4.2).");
}
function to(e, t) {
  R(typeof e == "string", "operational_private_key must be a string (§12.4.3).");
  const n = T(e);
  R(n.length === 32, "operational_private_key must be exactly 32 bytes (§12.4.3)."), R(wn(n), "operational_private_key is not a valid secp256k1 scalar (§12.4.3)."), R(Kt(t), "operational_public_key must be lowercase 64-char hex (§12.4.4).");
  const r = b(n);
  R(r === t, "operational_public_key does not match the derived public key (§12.4.4).");
}
function St(e, t) {
  R(typeof t == "string", `${e} must be a string (§CV5.2).`);
  let n;
  try {
    n = T(t);
  } catch {
    throw new In(`${e} is not valid base64url (§CV5.2).`);
  }
  R(n.length === 32, `${e} must decode to exactly 32 bytes (§CV5.2).`);
}
function Ba(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (R(t !== void 0 && n !== void 0, "connection_vault_root and vault_sudo_key must appear together (§CV5.2)."), St("connection_vault_root", t), St("vault_sudo_key", n));
}
function $a(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (R(t !== void 0, "vault_sudo_key cannot appear without connection_vault_root (§CV5.2)."), St("connection_vault_root", t), n !== void 0 && St("vault_sudo_key", n));
}
function no(e, t) {
  R(Number.isInteger(e) && e >= 0 && e <= qa, `${t} is out of supported bounds (§12.4.8).`);
}
function Wa(e) {
  R(e.schema === Nt, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), eo(e.account_id), no(e.generation, "generation"), to(e.operational_private_key, e.operational_public_key), R(Kt(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex (§12.4.5)."), Zr(e.vault_relay_hints), $a(e);
  const t = e.recovery_capsule_event;
  R(!!t && typeof t == "object", "recovery_capsule_event must be present (§12.4.6)."), R(N(t), "Embedded recovery_capsule_event has an invalid event id or signature (§12.4.6)."), R(t.pubkey === e.recovery_public_key, "Embedded recovery_capsule_event author does not match recovery_public_key (§12.4.5).");
}
function ja(e) {
  R(e.schema === Ct, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), eo(e.account_id), no(e.recovery_generation, "recovery_generation"), R(e.previous_recovery_event_id === null || Kt(e.previous_recovery_event_id), "previous_recovery_event_id must be null or lowercase 64-char hex (§12.3)."), to(e.operational_private_key, e.operational_public_key), R(Kt(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex."), Zr(e.vault_relay_hints), Ba(e);
}
function Ga(e) {
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
async function On(e) {
  const t = b(e.locatorPrivateKey), n = await Tn(e.payload, e.capsuleKey, Qr(t));
  return M({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: I,
    tags: [["d", xe]],
    content: JSON.stringify(n)
  }, e.locatorPrivateKey);
}
function Ha(e) {
  const t = b(e.oldLocatorPrivateKey);
  return M({
    pubkey: t,
    created_at: e.createdAt,
    kind: I,
    tags: [["d", xe]],
    content: ""
  }, e.oldLocatorPrivateKey);
}
async function Ja(e, t) {
  if (!N(e))
    throw new Error("Credential capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await xn(n, t, Qr(e.pubkey));
  return Wa(r), r;
}
async function Mn(e) {
  const t = b(e.recoveryPrivateKey), n = await Tn(e.payload, e.capsuleKey, Xr(t));
  return M({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: I,
    tags: [["d", nt]],
    content: JSON.stringify(n)
  }, e.recoveryPrivateKey);
}
async function ro(e, t) {
  if (!N(e))
    throw new Error("Recovery capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await xn(n, t, Xr(e.pubkey));
  return ja(r), r;
}
function Zn(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  for (const o of e)
    o.pubkey === t && o.kind === I && Ie(o, "d") === n && N(o) && r.set(o.id, o);
  return [...r.values()].sort((o, i) => i.created_at - o.created_at);
}
async function oo(e, t, n, r, o) {
  const i = await e.queryQuorum({ kinds: [I], authors: [t], "#d": [n], limit: 5 }, o), s = i.outcomes.flatMap((h) => h.events), a = Zn(s, t, n), l = [];
  for (const h of a)
    try {
      const p = await r(h);
      l.push({ event: h, payload: p });
    } catch (p) {
      l.push({ event: h, payload: null, error: p.message });
    }
  const u = l.find((h) => h.payload !== null) ?? null, y = i.outcomes.map((h) => ({
    responded: h.responded,
    events: Zn(h.events, t, n)
  })).filter((h) => h.responded && h.events.length > 0).map((h) => h.events[0].id), d = new Set(y).size > 1;
  return {
    quorumMet: i.quorumMet,
    respondedCount: i.respondedCount,
    totalCount: i.totalCount,
    candidates: l,
    best: u,
    relayDisagreement: d
  };
}
async function Ze(e, t, n, r = 8e3) {
  return oo(e, t, xe, (o) => Ja(o, n), r);
}
async function io(e, t, n, r = 8e3) {
  return oo(e, t, nt, (o) => ro(o, n), r);
}
function za(e) {
  const t = e.filter((n) => n.payload !== null);
  return t.length < 2 ? { consistent: !0 } : Ga(t.map((n) => ({
    eventId: n.event.id,
    recoveryGeneration: n.payload.recovery_generation,
    previousRecoveryEventId: n.payload.previous_recovery_event_id
  })));
}
async function er(e) {
  const t = [...new Set(e.relayUrls)], n = async (a) => {
    const l = new K(t);
    try {
      const u = await l.publishAll(a, e.timeoutMs);
      return new Map(u.map((y) => [
        y.relayUrl,
        { ok: y.result.ok, message: y.result.message ?? "" }
      ]));
    } finally {
      l.closeAll();
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
function Ya(e) {
  const t = Ie(e, "d");
  if (e.kind !== I || t === void 0 || !N(e))
    throw new Error("This session's capsule event is not a valid capsule.");
  return { pubkey: e.pubkey, dTag: t };
}
function Qa(e, t, n) {
  const r = e.filter((i) => i.pubkey === n.pubkey && i.kind === I && Ie(i, "d") === n.dTag && N(i));
  return r.some((i) => i.id === t.id) ? "current" : r.length === 0 ? "missing" : Math.max(...r.map((i) => i.created_at)) >= t.created_at ? "newer" : "older";
}
async function tr(e, t, n) {
  const r = Ya(t), o = new K(e);
  try {
    const i = await o.queryQuorum({
      kinds: [I],
      authors: [r.pubkey],
      "#d": [r.dTag],
      limit: 5
    }, n);
    return new Map(i.outcomes.map((s) => [
      s.relayUrl,
      s.responded ? { status: Qa(s.events, t, r) } : { status: "unreachable", error: s.error }
    ]));
  } finally {
    o.closeAll();
  }
}
async function Xa(e) {
  const t = [...new Set(e.relayUrls)], [n, r] = await Promise.all([
    tr(t, e.credentialEvent, e.timeoutMs),
    tr(t, e.recoveryEvent, e.timeoutMs)
  ]), o = t.map((i) => {
    const s = n.get(i) ?? { status: "unreachable" }, a = r.get(i) ?? { status: "unreachable" }, l = s.error ?? a.error;
    return {
      relayUrl: i,
      credential: s.status,
      recovery: a.status,
      ...l ? { error: l } : {}
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
const Dn = Ho.id, Ae = "aes-256-gcm-v1", Re = "bitlogin-bip39-hkdf-v1", ao = "bitlogin-recovery-hkdf-v1", Za = 4, es = 64;
function Ce(e) {
  return [...new Set(e)].filter((t) => t.length <= es).slice(0, Za);
}
function Ne(e) {
  return e ? { everyday_derivation: ao } : {};
}
function so(e) {
  return e.protocol?.everyday_derivation === ao;
}
async function co(e) {
  const t = Tt(e.loginName), n = e.now ?? Math.floor(Date.now() / 1e3), { locatorPrivateKey: r, capsuleKey: o } = await Je(e.password, t);
  try {
    const i = b(r), s = new K(e.vaultRelayUrls, {
      authPrivateKey: r
    });
    let a;
    try {
      a = await Ze(s, i, o, e.timeoutMs);
    } finally {
      s.closeAll();
    }
    if (!a.quorumMet)
      throw new te("Couldn't verify this login name and password aren't already registered. Please retry, or add more vault relays.");
    if (a.candidates.length > 0)
      throw new Jr();
    const l = e.everydayPrivateKey !== void 0;
    if (l && !wn(e.everydayPrivateKey))
      throw new te("The provided key is not a valid secp256k1 private key.");
    const u = pa(si()), y = await Sn(u);
    let d, h, p;
    try {
      ({ recoveryPrivateKey: d, capsuleKey: h } = pn(y)), p = l ? e.everydayPrivateKey : fn(y);
    } finally {
      k(y);
    }
    const v = !l, w = O(32), m = O(32);
    let g = !1;
    try {
      const _ = b(d), E = b(p), x = C(Er()), V = {
        schema: Ct,
        account_id: x,
        recovery_generation: 0,
        previous_recovery_event_id: null,
        operational_private_key: C(p),
        operational_public_key: E,
        recovery_public_key: _,
        connection_vault_root: C(w),
        vault_sudo_key: C(m),
        created_at: n,
        vault_relay_hints: Ce(e.vaultRelayUrls),
        protocol: {
          capsule_encryption: Ae,
          recovery_derivation: Re,
          ...Ne(v)
        }
      }, W = await Mn({
        recoveryPrivateKey: d,
        capsuleKey: h,
        payload: V
      }), be = new K(e.vaultRelayUrls, {
        authPrivateKey: d
      });
      let ue;
      try {
        ue = await me(be, W, {
          dTag: nt,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        be.closeAll();
      }
      if (!ue.success)
        throw new te("The recovery capsule did not reach the required relay acknowledgement and readback quorum. No login credential was published. Please retry, or add more vault relays.");
      const Ot = {
        schema: Nt,
        account_id: x,
        generation: 0,
        operational_private_key: C(p),
        operational_public_key: E,
        recovery_public_key: _,
        recovery_capsule_event: W,
        connection_vault_root: C(w),
        created_at: n,
        vault_relay_hints: Ce(e.vaultRelayUrls),
        protocol: {
          password_kdf: Dn,
          capsule_encryption: Ae,
          recovery_derivation: Re,
          ...Ne(v)
        }
      }, Bn = await On({
        locatorPrivateKey: r,
        capsuleKey: o,
        payload: Ot
      }), $n = new K(e.vaultRelayUrls, {
        authPrivateKey: r
      });
      let Mt;
      try {
        Mt = await me($n, Bn, {
          dTag: xe,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        $n.closeAll();
      }
      if (!Mt.success)
        throw new te("Registration did not reach the required credential acknowledgement and readback quorum. Please retry, or add more vault relays.");
      return g = !0, {
        normalizedLoginName: t,
        recoveryPhrase: u,
        everydayPrivateKey: p,
        everydayPublicKey: E,
        recoveryPublicKey: _,
        locatorPublicKey: i,
        accountId: x,
        imported: l,
        everydayKeyDerived: v,
        connectionVaultRoot: w,
        vaultSudoKey: m,
        credentialEvent: Bn,
        recoveryEvent: W,
        credentialPublish: Mt,
        recoveryPublish: ue
      };
    } finally {
      k(d, h), g || (l || k(p), k(w, m));
    }
  } finally {
    k(r, o);
  }
}
async function ts(e) {
  const { nsecOrHex: t, ...n } = e, r = lo(t);
  return co({ ...n, everydayPrivateKey: r });
}
function lo(e) {
  const t = e.trim();
  let n;
  if (t.startsWith("nsec1"))
    n = Jo(t);
  else if (/^[0-9a-fA-F]{64}$/u.test(t))
    n = _r(t.toLowerCase());
  else
    throw new te("Enter a valid nsec (nsec1…) or a 64-character hex private key.");
  if (!wn(n))
    throw new te("The provided key is not a valid secp256k1 private key.");
  return n;
}
class uo {
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
async function ns(e) {
  const t = Tt(e.loginName), { locatorPrivateKey: n, capsuleKey: r } = await Je(e.password, t), o = b(n), i = new K(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  try {
    const s = await Ze(i, o, r, e.timeoutMs);
    if (!s.quorumMet)
      throw new ge("quorum-not-met");
    if (!s.best)
      throw new ge(s.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
    const a = s.best.payload, l = e.store ?? new uo(), u = await Nn(l, a.operational_public_key), y = a.generation < u.generation;
    if (y && !e.acknowledgeRollback)
      throw new zr(u.generation, a.generation);
    const d = y ? `This device previously saw credential generation ${u.generation}, but the accepted capsule is generation ${a.generation}. Relays may be serving stale data, or an old capsule is being replayed.` : void 0;
    await Yr(l, a.operational_public_key, {
      generation: a.generation
    });
    const h = s.relayDisagreement ? 'Configured relays returned different credential capsules as "latest" for this account. Some relays may be stale, censored, or malicious.' : void 0;
    return {
      everydayPrivateKey: T(a.operational_private_key),
      everydayPublicKey: a.operational_public_key,
      recoveryPublicKey: a.recovery_public_key,
      accountId: a.account_id,
      generation: a.generation,
      everydayKeyDerived: so(a),
      credentialEvent: s.best.event,
      recoveryCapsuleEvent: a.recovery_capsule_event,
      connectionVaultRoot: a.connection_vault_root ? T(a.connection_vault_root) : void 0,
      rollbackWarning: d,
      relayDisagreementWarning: h
    };
  } finally {
    i.closeAll();
  }
}
function nr(e) {
  return e.filter((t) => N(t)).sort((t, n) => n.created_at - t.created_at)[0];
}
async function rs(e) {
  if (!Fr(e.phrase))
    throw new ne("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await Sn(e.phrase), { recoveryPrivateKey: n, capsuleKey: r } = pn(t), o = fn(t), i = b(o);
  k(t, o);
  const s = b(n), a = new K(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  let l;
  try {
    l = await io(a, s, r, e.timeoutMs);
  } finally {
    a.closeAll();
  }
  if (e.offlineRecoveryCapsuleEvents?.length) {
    const w = [];
    for (const E of e.offlineRecoveryCapsuleEvents)
      if (N(E))
        try {
          w.push({
            event: E,
            payload: await ro(E, r)
          });
        } catch (x) {
          w.push({
            event: E,
            payload: null,
            error: x.message
          });
        }
    const m = /* @__PURE__ */ new Map();
    for (const E of [...l.candidates, ...w])
      m.set(E.event.id, E);
    const g = [...m.values()].sort((E, x) => x.event.created_at - E.event.created_at), _ = g.find((E) => E.payload !== null) ?? null;
    l = {
      ...l,
      candidates: g,
      best: _,
      quorumMet: l.quorumMet || _ !== null
    };
  }
  if (!l.quorumMet)
    throw new ge("quorum-not-met");
  if (!l.best)
    throw new ge(l.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const u = l.best.payload, y = za(l.candidates), d = T(u.operational_private_key), h = u.operational_public_key, { generalRelays: p, dmRelays: v } = await yo(h, [...e.discoveryRelayUrls, ...u.vault_relay_hints], e.timeoutMs);
  return {
    everydayPrivateKey: d,
    everydayPublicKey: h,
    recoveryPrivateKey: n,
    recoveryPublicKey: s,
    recoveryCapsuleKey: r,
    accountId: u.account_id,
    currentRecoveryEvent: l.best.event,
    currentRecoveryPayload: u,
    generalRelays: p,
    dmRelays: v,
    chainWarning: y.consistent ? void 0 : y.warning,
    everydayKeyDerived: h === i
  };
}
async function yo(e, t, n) {
  const r = new K([...new Set(t)]);
  let o = [], i = [];
  try {
    const s = await r.queryQuorum({ kinds: [He], authors: [e], limit: 5 }, n), a = nr(s.outcomes.flatMap((y) => y.events));
    a && (o = La(a));
    const l = await r.queryQuorum({ kinds: [dn], authors: [e], limit: 5 }, n), u = nr(l.outcomes.flatMap((y) => y.events));
    u && (i = Ua(u));
  } finally {
    r.closeAll();
  }
  return { generalRelays: o, dmRelays: i };
}
async function po(e) {
  if (!Fr(e))
    throw new ne("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await Sn(e);
  try {
    const { recoveryPrivateKey: n, capsuleKey: r } = pn(t), o = fn(t);
    return {
      recoveryPrivateKey: n,
      recoveryPublicKey: b(n),
      capsuleKey: r,
      everydayPrivateKey: o,
      everydayPublicKey: b(o)
    };
  } finally {
    k(t);
  }
}
async function fo(e, t, n) {
  const r = new K(t, {
    authPrivateKey: e.recoveryPrivateKey
  });
  let o;
  try {
    o = await io(r, e.recoveryPublicKey, e.capsuleKey, n);
  } finally {
    r.closeAll();
  }
  if (!o.quorumMet)
    throw new ge("quorum-not-met");
  if (o.best)
    throw new ne("This account's recovery capsule is still on the relays. Use normal recovery instead of a rebuild.");
  return o.candidates.length > 0 ? Math.max(...o.candidates.map((i) => i.event.created_at)) : null;
}
async function os(e) {
  const t = await po(e.phrase);
  try {
    await fo(t, e.vaultRelayUrls, e.timeoutMs);
    const n = new K([
      .../* @__PURE__ */ new Set([...e.discoveryRelayUrls, ...e.vaultRelayUrls])
    ]);
    try {
      const o = (await n.queryQuorum({
        kinds: [kt, He],
        authors: [t.everydayPublicKey],
        limit: 10
      }, e.timeoutMs)).outcomes.flatMap((i) => i.events).filter((i) => i.pubkey === t.everydayPublicKey && N(i));
      return {
        everydayPublicKey: t.everydayPublicKey,
        profileFound: o.some((i) => i.kind === kt),
        relayListFound: o.some((i) => i.kind === He)
      };
    } finally {
      n.closeAll();
    }
  } finally {
    k(t.recoveryPrivateKey, t.capsuleKey, t.everydayPrivateKey);
  }
}
async function is(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = await po(e.phrase);
  let r = !1;
  try {
    const o = await fo(n, e.vaultRelayUrls, e.timeoutMs), i = {
      schema: Ct,
      account_id: C(Er()),
      recovery_generation: 0,
      previous_recovery_event_id: null,
      operational_private_key: C(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      connection_vault_root: C(O(32)),
      vault_sudo_key: C(O(32)),
      created_at: o === null ? t : Xe(o, t),
      vault_relay_hints: Ce(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: Ae,
        recovery_derivation: Re,
        ...Ne(!0)
      }
    }, s = await Mn({
      recoveryPrivateKey: n.recoveryPrivateKey,
      capsuleKey: n.capsuleKey,
      payload: i
    }), a = new K(e.vaultRelayUrls, {
      authPrivateKey: n.recoveryPrivateKey
    });
    let l;
    try {
      l = await me(a, s, {
        dTag: nt,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      a.closeAll();
    }
    if (!l.success)
      throw new ne("Could not publish the rebuilt recovery capsule to enough relays. Nothing else was changed; please retry.");
    const { generalRelays: u, dmRelays: y } = await yo(n.everydayPublicKey, [...e.discoveryRelayUrls, ...e.vaultRelayUrls], e.timeoutMs);
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
      dmRelays: y,
      everydayKeyDerived: !0
    };
  } finally {
    r || k(n.recoveryPrivateKey, n.capsuleKey, n.everydayPrivateKey);
  }
}
async function as(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = Tt(e.newLoginName), { recovered: r } = e, o = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root,
    vault_sudo_key: r.currentRecoveryPayload.vault_sudo_key
  } : {}, i = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root
  } : {}, { locatorPrivateKey: s, capsuleKey: a } = await Je(e.newPassword, n);
  try {
    const l = b(s), u = new K(e.vaultRelayUrls, {
      authPrivateKey: s
    });
    let y;
    try {
      y = await Ze(u, l, a, e.timeoutMs);
    } finally {
      u.closeAll();
    }
    if (!y.quorumMet)
      throw new ne("Couldn't verify the new login name and password aren't already registered. Please retry, or add more vault relays.");
    const d = y.best?.payload ?? null, h = d !== null && d.account_id === r.accountId && d.operational_public_key === r.everydayPublicKey && d.recovery_public_key === r.recoveryPublicKey && d.generation === 0 && d.recovery_capsule_event.id === r.currentRecoveryEvent.id;
    if (y.candidates.length > 0 && !h)
      throw new ne("Another account is already registered with that login name and password. Pick a different one.");
    const p = r.currentRecoveryPayload.recovery_generation + 1, v = {
      schema: Ct,
      account_id: r.accountId,
      recovery_generation: p,
      previous_recovery_event_id: r.currentRecoveryEvent.id,
      operational_private_key: C(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      ...o,
      created_at: Xe(r.currentRecoveryEvent.created_at, t),
      vault_relay_hints: Ce(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: Ae,
        recovery_derivation: Re,
        ...Ne(r.everydayKeyDerived)
      }
    }, w = await Mn({
      recoveryPrivateKey: r.recoveryPrivateKey,
      capsuleKey: r.recoveryCapsuleKey,
      payload: v
    }), m = new K(e.vaultRelayUrls, {
      authPrivateKey: r.recoveryPrivateKey
    });
    let g;
    try {
      g = await me(m, w, {
        dTag: nt,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      m.closeAll();
    }
    if (!g.success)
      throw new ne("Could not publish the refreshed recovery capsule to enough relays. No new credential was published; please retry.");
    r.currentRecoveryEvent = w, r.currentRecoveryPayload = v;
    const _ = {
      schema: Nt,
      account_id: r.accountId,
      generation: 0,
      operational_private_key: C(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      recovery_capsule_event: w,
      ...i,
      // A retry may be repairing a credential that reached only one relay.
      // It must replace that partial event deterministically on every relay.
      created_at: y.best ? Xe(y.best.event.created_at, t) : t,
      vault_relay_hints: Ce(e.vaultRelayUrls),
      protocol: {
        password_kdf: Dn,
        capsule_encryption: Ae,
        recovery_derivation: Re,
        ...Ne(r.everydayKeyDerived)
      }
    }, E = await On({
      locatorPrivateKey: s,
      capsuleKey: a,
      payload: _
    }), x = new K(e.vaultRelayUrls, {
      authPrivateKey: s
    });
    let V;
    try {
      V = await me(x, E, {
        dTag: xe,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      x.closeAll();
    }
    if (!V.success)
      throw new ne("Could not publish the new credential capsule to enough relays. Please retry.");
    return e.store && await Ia(e.store, r.everydayPublicKey, {
      generation: 0,
      recoveryGeneration: p
    }), {
      normalizedLoginName: n,
      locatorPublicKey: l,
      credentialEvent: E,
      refreshedRecoveryEvent: w,
      credentialPublish: V,
      recoveryPublish: g
    };
  } finally {
    k(s, a);
  }
}
async function ss(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = Tt(e.loginName), r = await Je(e.oldPassword, n), o = b(r.locatorPrivateKey), i = new K(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  });
  let s;
  try {
    s = await Ze(i, o, r.capsuleKey, e.timeoutMs);
  } finally {
    i.closeAll();
  }
  if (!s.quorumMet)
    throw new ge("quorum-not-met");
  if (!s.best)
    throw new ge(s.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const a = s.best.payload, l = s.best.event, u = e.store ?? new uo(), y = await Nn(u, a.operational_public_key);
  if (a.generation < y.generation && !e.acknowledgeRollback)
    throw new zr(y.generation, a.generation);
  const d = await Je(e.newPassword, n), h = b(d.locatorPrivateKey), p = new K(e.vaultRelayUrls, {
    authPrivateKey: d.locatorPrivateKey
  });
  let v;
  try {
    v = await Ze(p, h, d.capsuleKey, e.timeoutMs);
  } finally {
    p.closeAll();
  }
  if (!v.quorumMet)
    throw new te("Couldn't verify the new password isn't already registered under this login name. Please retry, or add more vault relays.");
  if (v.candidates.length > 0)
    throw new Jr("Another account is already registered with this login name and the new password you chose. Pick a different new password.");
  const w = a.generation + 1, m = {
    schema: Nt,
    account_id: a.account_id,
    generation: w,
    operational_private_key: a.operational_private_key,
    operational_public_key: a.operational_public_key,
    recovery_public_key: a.recovery_public_key,
    recovery_capsule_event: a.recovery_capsule_event,
    // Carry only the session root. A legacy credential may contain the sudo
    // key, but rotation deliberately scrubs it; personal-tier access remains
    // phrase-gated through the recovery capsule.
    ...a.connection_vault_root !== void 0 ? { connection_vault_root: a.connection_vault_root } : {},
    created_at: t,
    vault_relay_hints: Ce(e.vaultRelayUrls),
    protocol: {
      password_kdf: Dn,
      capsule_encryption: Ae,
      recovery_derivation: Re,
      ...Ne(so(a))
    }
  }, g = await On({
    locatorPrivateKey: d.locatorPrivateKey,
    capsuleKey: d.capsuleKey,
    payload: m
  }), _ = new K(e.vaultRelayUrls, {
    authPrivateKey: d.locatorPrivateKey
  }), E = await me(_, g, {
    dTag: xe,
    minAcks: e.minAcknowledgements,
    timeoutMs: e.timeoutMs
  });
  if (_.closeAll(), !E.success)
    throw new te("The new credential capsule did not reach the required relay acknowledgement and readback quorum. Your existing password still works; nothing was changed. Please retry.");
  const x = Ha({
    oldLocatorPrivateKey: r.locatorPrivateKey,
    createdAt: Xe(l.created_at, t)
  }), V = Rr({
    privateKey: r.locatorPrivateKey,
    eventIdToDelete: l.id,
    deletedEventKind: I,
    createdAt: t
  }), W = new K(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  }), [be, ue] = await Promise.all([
    W.publishAll(x, e.timeoutMs),
    W.publishAll(V, e.timeoutMs)
  ]);
  return W.closeAll(), await Yr(u, a.operational_public_key, {
    generation: w
  }), {
    normalizedLoginName: n,
    oldLocatorPublicKey: o,
    newLocatorPublicKey: h,
    newGeneration: w,
    recoveryPublicKey: a.recovery_public_key,
    recoveryCapsuleEvent: a.recovery_capsule_event,
    newCredentialEvent: g,
    tombstoneEvent: x,
    deletionRequestEvent: V,
    newCredentialPublish: E,
    tombstoneAcknowledgedCount: ve(be),
    deletionAcknowledgedCount: ve(ue)
  };
}
const cs = "bitlogin/connection-vault-root/v1", ls = "bitlogin/connection-vault-signing/v1", us = "bitlogin/connection-record-encryption/v1", ys = "bitlogin/connection-vault-personal/v1", en = "bitlogin:connection:";
function ds(e) {
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return gn(Pr(cs), e);
}
function Oe(e) {
  return ci(e, ls).scalar;
}
function ho(e) {
  const t = Oe(e);
  try {
    return b(t);
  } finally {
    k(t);
  }
}
function ps(e, t) {
  if (t.length !== 32)
    throw new Error("vault_sudo_key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return gn(Pr(ys), vn(e, t));
}
function vo(e, t) {
  const n = It(t);
  return rt(e, vn(D(us), new Uint8Array([0]), n), 32);
}
function fs() {
  return C(O(16));
}
function It(e) {
  const t = T(e);
  if (t.length !== 16)
    throw new Error("connection_id must decode to exactly 16 bytes (§CV7).");
  return t;
}
function wo(e) {
  return It(e), `${en}${e}`;
}
function go(e) {
  if (!e.startsWith(en))
    return null;
  const t = e.slice(en.length);
  try {
    return It(t), t;
  } catch {
    return null;
  }
}
class re {
  privateKey;
  publicKeyHex;
  destroyed = !1;
  constructor(t) {
    this.privateKey = t, this.publicKeyHex = b(t);
  }
  assertAlive() {
    if (this.destroyed)
      throw new Error("This signer has been destroyed (session locked or logged out).");
  }
  getPublicKey() {
    return this.assertAlive(), this.publicKeyHex;
  }
  signEvent(t) {
    return this.assertAlive(), M({
      pubkey: this.publicKeyHex,
      created_at: t.created_at ?? Math.floor(Date.now() / 1e3),
      kind: t.kind,
      tags: t.tags ?? [],
      content: t.content
    }, this.privateKey);
  }
  nip44Encrypt(t, n) {
    return this.assertAlive(), Xt(he(this.privateKey, t), n);
  }
  nip44Decrypt(t, n) {
    return this.assertAlive(), mn(he(this.privateKey, t), n);
  }
  /** Legacy relative to nip44Encrypt above, but still what a real NIP-07 extension exposes as
   * window.nostr.nip04.encrypt -- implemented for drop-in parity. */
  nip04Encrypt(t, n) {
    return this.assertAlive(), Ca(this.privateKey, t, n);
  }
  nip04Decrypt(t, n) {
    return this.assertAlive(), Ta(this.privateKey, t, n);
  }
  /** Best-practical secret wipe (§11.10, §21.4): overwrites the private key buffer in place. */
  destroy() {
    k(this.privateKey), this.destroyed = !0;
  }
}
const mo = "bitlogin.connection.v1", bo = "bitlogin.connection.nwc.v1", rr = 120, hs = /* @__PURE__ */ new Set(["active", "suspended", "deleted"]), vs = /* @__PURE__ */ new Set(["connectable", "personal"]);
class Ee extends Error {
  constructor(t) {
    super(t), this.name = "ConnectionRecordError";
  }
}
function ko(e, t) {
  return D(`bitlogin|connection-record|v1|${e}|30078|${t}`);
}
function _o(e) {
  const t = e, n = (i) => {
    throw new Ee(i);
  };
  (!t || typeof t != "object") && n("Connection record must be an object."), t.schema !== mo && n("Unsupported connection record schema (§CV8.3)."), typeof t.connection_id != "string" && n("connection_id must be a string (§CV7)."), (typeof t.connection_type != "string" || t.connection_type.length === 0) && n("connection_type must be a non-empty string (§CV8.3)."), vs.has(t.tier) || n("tier must be connectable or personal."), hs.has(t.state) || n("state must be active, suspended, or deleted (§CV8.3)."), (typeof t.label != "string" || t.label.length > rr) && n(`label must be a string of at most ${rr} characters.`), (!Number.isInteger(t.created_at) || !Number.isInteger(t.updated_at)) && n("created_at and updated_at must be integers (§CV8.3).");
  const r = t.credential;
  (!r || typeof r != "object" || typeof r.schema != "string") && n("credential must be an object naming its profile schema (§CV8.3).");
  const o = t.application_binding;
  (!o || typeof o != "object" || o.origin !== null && typeof o.origin != "string" || o.app_pubkey !== null && typeof o.app_pubkey != "string") && n("application_binding must carry origin and app_pubkey (string or null)."), t.notes !== null && typeof t.notes != "string" && n("notes must be a string or null.");
}
async function $t(e) {
  _o(e.record);
  const t = Oe(e.vaultPrk), n = b(t), r = wo(e.record.connection_id), o = vo(e.recordPrk, e.record.connection_id), i = await Tn(e.record, o, ko(n, r));
  return M({
    pubkey: n,
    created_at: Xe(e.previousCreatedAt, e.now),
    kind: I,
    tags: [["d", r]],
    content: JSON.stringify(i)
  }, t);
}
async function ws(e, t, n) {
  if (!N(e))
    throw new Ee("Connection record event has an invalid id or signature.");
  const r = b(Oe(t));
  if (e.pubkey !== r)
    throw new Ee("Connection record event is not signed by this vault's identity.");
  const o = Ie(e, "d") ?? "", i = go(o);
  if (i === null)
    throw new Ee("Connection record event has a malformed d tag.");
  const s = JSON.parse(e.content), a = ko(e.pubkey, o), l = [
    { prk: t, tier: "connectable" },
    ...n ? [{ prk: n, tier: "personal" }] : []
  ];
  for (const u of l) {
    let y;
    try {
      y = await xn(s, vo(u.prk, i), a);
    } catch {
      continue;
    }
    if (_o(y), y.connection_id !== i)
      throw new Ee("Connection record id does not match its d tag.");
    if (y.tier !== u.tier)
      throw new Ee("Connection record tier does not match the key that decrypted it.");
    return { record: y, tier: u.tier, event: e };
  }
  return null;
}
function gs(e, t) {
  return {
    ...e,
    state: "deleted",
    credential: { schema: e.credential.schema },
    notes: null,
    updated_at: t
  };
}
const At = /^[0-9a-f]{64}$/u;
class Y extends Error {
  constructor(t) {
    super(t), this.name = "NwcParseError";
  }
}
function or(e) {
  const t = e.trim();
  if (!/^nostr\+walletconnect:\/\//iu.test(t))
    throw new Y("Not an NWC URI: it must start with nostr+walletconnect://");
  let n;
  try {
    n = new URL(t.replace(/^nostr\+walletconnect:\/\//iu, "http://"));
  } catch {
    throw new Y("The NWC URI is malformed.");
  }
  const r = n.hostname.toLowerCase();
  if (!At.test(r))
    throw new Y("The NWC URI's wallet service pubkey is not 64-char hex.");
  const o = [], i = [];
  let s = null, a = null;
  for (const [l, u] of n.searchParams.entries())
    if (l === "relay") {
      if (!ot(u))
        throw new Y("An NWC relay must use secure WebSockets, except for an explicit loopback development endpoint.");
      o.push(u);
    } else if (l === "secret") {
      const y = u.toLowerCase();
      if (!At.test(y))
        throw new Y("The NWC URI's secret is not a 64-char hex client key.");
      s = y;
    } else l === "lud16" ? a = u : i.push([l, u]);
  if (o.length === 0)
    throw new Y("The NWC URI names no relay.");
  if (s === null)
    throw new Y("The NWC URI carries no secret.");
  return {
    schema: bo,
    wallet_pubkey: r,
    relays: o,
    secret: s,
    lud16: a,
    extra_params: i
  };
}
function ms(e) {
  Eo(e);
  const t = new URLSearchParams();
  for (const n of e.relays)
    t.append("relay", n);
  t.append("secret", e.secret), e.lud16 !== null && t.append("lud16", e.lud16);
  for (const [n, r] of e.extra_params)
    t.append(n, r);
  return `nostr+walletconnect://${e.wallet_pubkey}?${t.toString()}`;
}
function bs(e, t) {
  return e.wallet_pubkey === t.wallet_pubkey && e.secret === t.secret;
}
function Eo(e) {
  const t = e, n = (r) => {
    throw new Y(r);
  };
  (!t || typeof t != "object") && n("NWC credential must be an object."), t.schema !== bo && n("NWC credential has the wrong schema."), (typeof t.wallet_pubkey != "string" || !At.test(t.wallet_pubkey)) && n("NWC credential wallet_pubkey must be 64-char lowercase hex."), (!Array.isArray(t.relays) || t.relays.length === 0 || t.relays.some((r) => typeof r != "string")) && n("NWC credential must name at least one relay."), t.relays.some((r) => !ot(r)) && n("NWC relays must use secure WebSockets, except for explicit loopback development endpoints."), (typeof t.secret != "string" || !At.test(t.secret)) && n("NWC credential secret must be 64-char lowercase hex."), t.lud16 !== null && typeof t.lud16 != "string" && n("NWC credential lud16 must be a string or null."), (!Array.isArray(t.extra_params) || t.extra_params.some((r) => !Array.isArray(r) || r.length !== 2 || typeof r[0] != "string" || typeof r[1] != "string")) && n("NWC credential extra_params must be [key, value] string pairs.");
}
const ks = "bitlogin:vault-hwm:v2:", _s = "bitlogin/vault-hwm-index/v2", Po = "bitlogin/vault-hwm-encryption/v2", Es = /^[0-9a-f]{64}$/u;
class oe extends Error {
  constructor() {
    super("The local Connection Vault rollback marker is invalid or has been tampered with."), this.name = "RecordHighWaterMarkError";
  }
}
function Ln(e) {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return Number.isInteger(t.createdAt) && (t.createdAt ?? -1) >= 0 && typeof t.eventId == "string" && Es.test(t.eventId);
}
function Ko(e, t) {
  It(t);
  const n = rt(e, _s, 32), r = D(t);
  try {
    return `${ks}${C(br(kr, n, r))}`;
  } finally {
    k(n, r);
  }
}
function Ps(e, t) {
  return `bitlogin:vault-hwm:${ho(e)}:${t}`;
}
async function Ks(e, t, n) {
  const r = rt(e, Po, 32), o = D(JSON.stringify(n)), i = D(t);
  try {
    const s = await Or(r, o, i), a = {
      v: 2,
      nonce: C(s.nonce),
      ciphertext: C(s.ciphertext)
    };
    return JSON.stringify(a);
  } finally {
    k(r, o, i);
  }
}
async function Ss(e, t, n) {
  const r = rt(e, Po, 32), o = D(t);
  let i;
  try {
    const s = JSON.parse(n);
    if (s.v !== 2 || typeof s.nonce != "string" || typeof s.ciphertext != "string")
      throw new oe();
    i = await Mr(r, T(s.nonce), T(s.ciphertext), o);
    const a = JSON.parse(hn(i));
    if (!Ln(a))
      throw new oe();
    return a;
  } catch (s) {
    throw s instanceof oe ? s : new oe();
  } finally {
    k(r, o), i && k(i);
  }
}
async function So(e, t, n, r) {
  const o = Ko(t, n);
  await e.set(o, await Ks(t, o, r));
}
async function Ao(e, t, n) {
  const r = Ko(t, n), o = await e.get(r);
  if (o !== void 0)
    return Ss(t, r, o);
  const i = Ps(t, n), s = await e.get(i);
  if (s === void 0)
    return null;
  try {
    const a = JSON.parse(s);
    if (!Ln(a))
      throw new oe();
    return await So(e, t, n, a), await e.delete(i), a;
  } catch (a) {
    throw a instanceof oe ? a : new oe();
  }
}
async function Ro(e, t, n, r) {
  if (!Ln(r))
    throw new oe();
  const o = await Ao(e, t, n);
  o && Yt({ created_at: r.createdAt, id: r.eventId }, { created_at: o.createdAt, id: o.eventId }) <= 0 || await So(e, t, n, r);
}
async function As(e) {
  const t = Oe(e.vaultPrk), n = new K(e.relayUrls, { authPrivateKey: t });
  let r;
  try {
    r = await me(n, e.event, {
      dTag: wo(e.connectionId),
      minAcks: e.minAcknowledgements,
      // The readback bar follows the ack bar: a caller publishing to fewer
      // relays (a targeted repair, a test) has already lowered its quorum.
      minReadbacks: e.minAcknowledgements,
      timeoutMs: e.timeoutMs
    });
  } finally {
    n.closeAll(), k(t);
  }
  return r.success && await Ro(e.store, e.vaultPrk, e.connectionId, {
    createdAt: e.event.created_at,
    eventId: e.event.id
  }), r;
}
const ir = 500;
async function Rs(e) {
  const t = Oe(e.vaultPrk), n = b(t), r = new K(e.relayUrls, { authPrivateKey: t });
  let o;
  try {
    o = await r.queryQuorum({ kinds: [I], authors: [n], limit: ir }, e.timeoutMs);
  } finally {
    r.closeAll(), k(t);
  }
  const i = o.outcomes.some((u) => u.events.length >= ir), s = /* @__PURE__ */ new Map();
  for (const u of o.outcomes.flatMap((y) => y.events)) {
    if (!N(u) || u.pubkey !== n)
      continue;
    const y = go(Ie(u, "d") ?? "");
    if (y === null)
      continue;
    const d = s.get(y);
    (!d || Yt(u, d) > 0) && s.set(y, u);
  }
  const a = /* @__PURE__ */ new Map(), l = [];
  for (const [u, y] of s) {
    const d = await Ao(e.store, e.vaultPrk, u);
    if (d !== null && Yt(y, {
      created_at: d.createdAt,
      id: d.eventId
    }) < 0) {
      l.push(u);
      continue;
    }
    a.set(u, y), await Ro(e.store, e.vaultPrk, u, {
      createdAt: y.created_at,
      eventId: y.id
    });
  }
  return {
    events: a,
    rollbackWarnings: l,
    quorumMet: o.quorumMet,
    respondedCount: o.respondedCount,
    truncated: i
  };
}
class Cs {
  vaultPrk;
  personalPrk = null;
  destroyed = !1;
  connectionVaultRoot;
  vaultPublicKey;
  constructor(t) {
    this.connectionVaultRoot = t.slice(), this.vaultPrk = ds(this.connectionVaultRoot), this.vaultPublicKey = ho(this.vaultPrk);
  }
  get sudoActive() {
    return this.personalPrk !== null;
  }
  /** Opens a sudo window. Consumes (wipes) the caller's sudo key copy. */
  enableSudo(t) {
    this.endSudo(), this.personalPrk = ps(this.connectionVaultRoot, t), k(t);
  }
  /** Closes the sudo window and wipes the personal-tier key material. */
  endSudo() {
    this.personalPrk && k(this.personalPrk), this.personalPrk = null;
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
    this.endSudo(), k(this.vaultPrk, this.connectionVaultRoot), this.destroyed = !0;
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
      schema: mo,
      connection_id: fs(),
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
    }, o = await $t({
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
    }, s = await $t({
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
    const r = n ?? Math.floor(Date.now() / 1e3), o = gs(t.record, r), i = await $t({
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
    return this.destroyed ? Promise.reject(new Error("This vault session was destroyed; create a new one from the account's root.")) : ws(t, this.vaultPrk, this.personalPrk ?? void 0);
  }
  /** §CV11 step 3: a NIP-09 deletion request for a replaced record event,
   *  signed by the vault identity. Best-effort by contract — the encrypted
   *  tombstone is the durable part of a deletion, this is the courtesy ask. */
  buildDeletionRequest(t, n) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    return Rr({
      privateKey: Oe(this.vaultPrk),
      eventIdToDelete: t,
      deletedEventKind: I,
      createdAt: n ?? Math.floor(Date.now() / 1e3)
    });
  }
  publish(t) {
    return As({ vaultPrk: this.vaultPrk, ...t });
  }
  fetchEvents(t) {
    return Rs({ vaultPrk: this.vaultPrk, ...t });
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
const Ns = "bitlogin", X = "kv", q = "device-keys", Ts = 2;
function xs() {
  return new Promise((e, t) => {
    const n = indexedDB.open(Ns, Ts);
    n.onupgradeneeded = () => {
      const r = n.result;
      r.objectStoreNames.contains(X) || r.createObjectStore(X), r.objectStoreNames.contains(q) || r.createObjectStore(q);
    }, n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
  });
}
class Is {
  dbPromise = null;
  db() {
    return this.dbPromise || (this.dbPromise = xs()), this.dbPromise;
  }
  async get(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const s = n.transaction(X, "readonly").objectStore(X).get(t);
      s.onsuccess = () => r(s.result), s.onerror = () => o(s.error);
    });
  }
  async set(t, n) {
    const r = await this.db();
    return new Promise((o, i) => {
      const s = r.transaction(X, "readwrite");
      s.objectStore(X).put(n, t), s.oncomplete = () => o(), s.onerror = () => i(s.error);
    });
  }
  async delete(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const i = n.transaction(X, "readwrite");
      i.objectStore(X).delete(t), i.oncomplete = () => r(), i.onerror = () => o(i.error);
    });
  }
  /**
   * Returns a non-extractable AES-GCM key kept by the browser's IndexedDB
   * implementation. The key is deliberately separate from the string-only KV
   * API so callers cannot accidentally serialize it as application data.
   */
  async getOrCreateDeviceKey(t) {
    const n = await this.db(), r = await new Promise((i, s) => {
      const a = n.transaction(q, "readonly").objectStore(q).get(t);
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
        const a = n.transaction(q, "readwrite");
        a.objectStore(q).add(o, t), a.oncomplete = () => i(), a.onerror = () => s(a.error);
      }), o;
    } catch {
      const i = await new Promise((s, a) => {
        const l = n.transaction(q, "readonly").objectStore(q).get(t);
        l.onsuccess = () => s(l.result), l.onerror = () => a(l.error);
      });
      if (i) return i;
      throw new Error("Unable to create the browser-bound session key.");
    }
  }
  async deleteDeviceKey(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const i = n.transaction(q, "readwrite");
      i.objectStore(q).delete(t), i.oncomplete = () => r(), i.onerror = () => o(i.error);
    });
  }
}
const at = "bitlogin:session:v1", Un = "bitlogin:session-device-key:v1";
function Co(e) {
  return !!(e && typeof e == "object" && e.v === 3 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function No(e, t) {
  if (e.length !== 32) throw new Error("Not a lock key.");
  return crypto.subtle.importKey("raw", qe(e), "AES-GCM", !1, [t]);
}
async function gt(e, t = at) {
  try {
    const n = await e.get(t);
    if (!n) return "none";
    const r = JSON.parse(n);
    return Co(r) ? "locked" : To(r) ? "open" : "none";
  } catch {
    return "none";
  }
}
function lt(e) {
  let t = "";
  for (const n of e) t += String.fromCharCode(n);
  return btoa(t);
}
function ut(e) {
  const t = atob(e);
  return Uint8Array.from(t, (n) => n.charCodeAt(0));
}
function qe(e) {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}
function To(e) {
  return !!(e && typeof e == "object" && e.v === 2 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function tn(e, t, n, r = at) {
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
    const i = await e.getOrCreateDeviceKey(Un), s = crypto.getRandomValues(new Uint8Array(12)), a = new TextEncoder().encode(JSON.stringify(o)), l = await crypto.subtle.encrypt({ name: "AES-GCM", iv: s }, i, a), u = {
      v: 2,
      iv: lt(s),
      ciphertext: lt(new Uint8Array(l))
    };
    if (!n) {
      await e.set(r, JSON.stringify(u));
      return;
    }
    const y = crypto.getRandomValues(new Uint8Array(12)), d = await crypto.subtle.encrypt({ name: "AES-GCM", iv: y }, await No(n, "encrypt"), new TextEncoder().encode(JSON.stringify(u))), h = { v: 3, iv: lt(y), ciphertext: lt(new Uint8Array(d)) };
    await e.set(r, JSON.stringify(h));
  } catch {
    n && await e.delete(r).catch(() => {
    });
  }
}
async function xo(e, t, n = at) {
  let r;
  try {
    r = await e.get(n);
  } catch {
    return null;
  }
  if (!r) return null;
  try {
    let o = JSON.parse(r);
    if (Co(o)) {
      if (!t) return null;
      const l = await crypto.subtle.decrypt({ name: "AES-GCM", iv: qe(ut(o.iv)) }, await No(t, "decrypt"), qe(ut(o.ciphertext)));
      o = JSON.parse(new TextDecoder().decode(l));
    }
    if (!To(o) || typeof e.getOrCreateDeviceKey != "function")
      return await e.delete(n), null;
    const i = await e.getOrCreateDeviceKey(Un), s = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: qe(ut(o.iv)) },
      i,
      qe(ut(o.ciphertext))
    ), a = JSON.parse(new TextDecoder().decode(s));
    return typeof a.everydayPrivateKeyHex != "string" || typeof a.accountId != "string" || typeof a.recoveryPublicKey != "string" || !a.activeCredentialEvent || !a.activeRecoveryEvent ? null : {
      everydayPrivateKey: Uint8Array.from(
        a.everydayPrivateKeyHex.match(/.{1,2}/g) || [],
        (l) => Number.parseInt(l, 16)
      ),
      accountId: a.accountId,
      recoveryPublicKey: a.recoveryPublicKey,
      activeCredentialEvent: a.activeCredentialEvent,
      activeRecoveryEvent: a.activeRecoveryEvent,
      ...typeof a.connectionVaultRootHex == "string" ? {
        connectionVaultRoot: Uint8Array.from(
          a.connectionVaultRootHex.match(/.{1,2}/g) || [],
          (l) => Number.parseInt(l, 16)
        )
      } : {},
      ...typeof a.vaultEnabled == "boolean" ? { vaultEnabled: a.vaultEnabled } : {},
      ...typeof a.everydayKeyDerived == "boolean" ? { everydayKeyDerived: a.everydayKeyDerived } : {}
    };
  } catch {
    return null;
  }
}
const Os = "bitlogin:kept-session:v1:", U = (e) => Os + e;
async function G(e, t = at) {
  try {
    await e.delete(t);
  } catch {
  }
}
async function ar(e) {
  try {
    await e.delete(at), typeof e.deleteDeviceKey == "function" && await e.deleteDeviceKey(Un);
  } catch {
  }
}
const Ms = 27300, Te = {
  /** The longest address a picture may have. */
  pictureChars: 300,
  /** The most that is said about someone, in their own words. */
  aboutChars: 280,
  /** How long a pass made here lasts, in seconds. NSWP's verifier allows twelve hours; this gives four. */
  passSec: 4 * 3600,
  /** A profile's content is not read past this many characters. */
  contentChars: 2e4
};
function Ds(e) {
  if (typeof e != "string" || e.length > Te.pictureChars) return "";
  try {
    const t = new URL(e);
    return t.protocol !== "https:" || t.username || t.password || !t.hostname.includes(".") ? "" : t.href.length <= Te.pictureChars ? t.href : "";
  } catch {
    return "";
  }
}
const Ls = (e) => e <= 31 || e >= 127 && e <= 159 || e >= 8203 && e <= 8207 || e >= 8232 && e <= 8239 || e >= 8288 && e <= 8303 || e === 65279;
function Us(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, Te.aboutChars * 8).normalize("NFC")) t += Ls(n.codePointAt(0)) ? " " : n;
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, Te.aboutChars).join("").trim();
}
function ce(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, n = Qe(t.name), r = Ds(t.picture), o = Us(t.about);
  return !n && !r && !o ? null : { ...n ? { name: n } : {}, ...r ? { picture: r } : {}, ...o ? { about: o } : {} };
}
function Vs(e, t) {
  if (!N(e) || e.kind !== 0 || e.pubkey !== t || e.content.length > Te.contentChars) return null;
  let n;
  try {
    n = JSON.parse(e.content);
  } catch {
    return null;
  }
  if (!n || typeof n != "object" || Array.isArray(n)) return null;
  const r = n;
  return ce({ name: Qe(r.display_name) || Qe(r.displayName) || r.name, picture: r.picture, about: r.about });
}
function qs(e, t) {
  let n = null;
  for (const r of e)
    !N(r) || r.kind !== 0 || r.pubkey !== t || n && r.created_at <= n.at || (n = { at: r.created_at, profile: Vs(r, t) });
  return n?.profile ?? null;
}
const Fs = /^[0-9a-f]{64}$/u;
function Bs(e) {
  const t = hi(e.site);
  if (!t || typeof e.session != "string" || !Fs.test(e.session) || e.session === e.identity) return null;
  const n = Math.floor(e.nowSeconds), r = ce(e.profile) ?? {}, o = [
    ["nswp:session", e.session],
    ["nswp:origin", t],
    ["expiration", String(n + Te.passSec)]
  ];
  return r.name && o.push(["name", r.name]), r.picture && o.push(["picture", r.picture]), r.about && o.push(["about", r.about]), { kind: Ms, created_at: n, tags: o, content: "" };
}
const nn = "bitlogin:kept-accounts:v1", Rt = {
  /** No more accounts than this are kept on one device. The one least lately used goes first. */
  accounts: 8
}, $s = /^[0-9a-f]{64}$/u;
function Vn(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (typeof t.pubkey != "string" || !$s.test(t.pubkey)) return null;
  const n = ce({ name: t.name, picture: t.picture, about: t.about }) ?? {}, r = typeof t.at == "number" && Number.isFinite(t.at) && t.at > 0 ? Math.floor(t.at) : 0;
  let o;
  try {
    o = Fe(t.pubkey);
  } catch {
    return null;
  }
  return { pubkey: t.pubkey, npub: o, ...n, at: r };
}
function Ws(e) {
  if (!e) return [];
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return [];
  }
  if (!Array.isArray(t)) return [];
  const n = /* @__PURE__ */ new Set(), r = [];
  for (const o of t.slice(0, Rt.accounts * 2)) {
    const i = Vn(o);
    !i || n.has(i.pubkey) || (n.add(i.pubkey), r.push(i));
  }
  return r.sort((o, i) => i.at - o.at).slice(0, Rt.accounts);
}
function js(e, t, n, r = {}) {
  const o = e.find((a) => a.pubkey === t), i = Vn({
    pubkey: t,
    at: n,
    name: Qe(r.name) || o?.name,
    picture: r.picture ?? o?.picture,
    about: r.about ?? o?.about
  });
  if (!i) return { list: [...e], dropped: [] };
  const s = [i, ...e.filter((a) => a.pubkey !== t)];
  return { list: s.slice(0, Rt.accounts), dropped: s.slice(Rt.accounts).map((a) => a.pubkey) };
}
function Gs(e, t, n) {
  return e.map((r) => r.pubkey === t ? Vn({ ...r, name: Qe(n.name) || r.name, picture: n.picture ?? r.picture, about: n.about ?? r.about }) ?? r : r);
}
const mt = (e, t) => e.filter((n) => n.pubkey !== t);
async function F(e) {
  try {
    return Ws(await e.get(nn));
  } catch {
    return [];
  }
}
async function fe(e, t) {
  try {
    t.length === 0 ? await e.delete(nn) : await e.set(nn, JSON.stringify(t));
  } catch {
  }
}
const qn = "bitlogin:lock:v1", Hs = "bitlogin/lock/device/v1", Js = D("bitlogin:lock:device-wrap:v1"), $ = {
  pinMin: 6,
  pinMax: 64,
  /** Wrong tries, with the PIN or the device, before the record is removed. */
  tries: 5,
  /** Unused for this long, an unlocked session locks itself. In seconds. */
  idleSec: 900
}, Se = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
};
function Io(e) {
  if (typeof e != "string") return null;
  const t = e.normalize("NFKC"), n = [...t].length;
  return n >= $.pinMin && n <= $.pinMax ? D(t) : null;
}
async function Oo(e, t) {
  const n = O(12), r = await crypto.subtle.importKey("raw", Se(e), "AES-GCM", !1, ["encrypt"]), o = await crypto.subtle.encrypt({ name: "AES-GCM", iv: Se(n) }, r, Se(t));
  return { iv: C(n), wrapped: C(new Uint8Array(o)) };
}
async function Mo(e, t) {
  try {
    const n = await crypto.subtle.importKey("raw", Se(e), "AES-GCM", !1, ["decrypt"]), r = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: Se(T(t.iv)) }, n, Se(T(t.wrapped))));
    return r.length === 32 ? r : null;
  } catch {
    return null;
  }
}
const Do = (e) => rt(gn(Js, e), Hs, 32), sr = (e) => !!e && typeof e == "object" && typeof e.iv == "string" && typeof e.wrapped == "string";
async function le(e) {
  let t;
  try {
    t = await e.get(qn);
  } catch {
    return null;
  }
  if (!t) return null;
  try {
    const n = JSON.parse(t);
    return n.v !== 1 || typeof n.tries != "number" || !Number.isInteger(n.tries) || n.tries < 0 || !sr(n.pin) || typeof n.pin.salt != "string" || n.device !== void 0 && (!sr(n.device) || typeof n.device.credentialId != "string") ? null : { v: 1, tries: n.tries, pin: n.pin, ...n.device ? { device: n.device } : {} };
  } catch {
    return null;
  }
}
const et = (e, t) => e.set(qn, JSON.stringify(t));
async function je(e) {
  try {
    await e.delete(qn);
  } catch {
  }
}
async function zs(e, t, n) {
  const r = Io(t);
  if (!r) throw new Error(`A PIN is ${$.pinMin} to ${$.pinMax} characters.`);
  const o = n ? n.slice() : O(32), i = O(16), s = await mr(r, i);
  try {
    const a = n ? await le(e) : null;
    await et(e, { v: 1, tries: 0, pin: { salt: C(i), ...await Oo(s, o) }, ...a?.device ? { device: a.device } : {} });
  } finally {
    s.fill(0), r.fill(0);
  }
  return o;
}
async function Ys(e, t, n, r) {
  const o = await le(e);
  if (!o) throw new Error("The lock is not on.");
  if (r.length !== 32 || !/^[A-Za-z0-9_-]{8,1400}$/u.test(n)) throw new Error("That is not a device unlock.");
  const i = Do(r);
  try {
    await et(e, { ...o, device: { credentialId: n, ...await Oo(i, t) } });
  } finally {
    i.fill(0);
  }
}
async function Qs(e) {
  const t = await le(e);
  t?.device && await et(e, { v: 1, tries: t.tries, pin: t.pin });
}
async function Lo(e, t) {
  const n = await le(e);
  if (!n) return { ok: !1, left: 0, removed: !0 };
  const r = n.tries + 1;
  await et(e, { ...n, tries: r });
  const o = await t(n);
  return o ? (await et(e, { ...n, tries: 0 }), { ok: !0, lockKey: o }) : r >= $.tries ? (await je(e), { ok: !1, left: 0, removed: !0 }) : { ok: !1, left: $.tries - r, removed: !1 };
}
function Xs(e, t) {
  return Lo(e, async (n) => {
    const r = Io(t);
    if (!r) return null;
    const o = await mr(r, T(n.pin.salt));
    try {
      return await Mo(o, n.pin);
    } finally {
      o.fill(0), r.fill(0);
    }
  });
}
function Zs(e, t) {
  return Lo(e, async (n) => {
    if (!n.device || t.length !== 32) return null;
    const r = Do(t);
    try {
      return await Mo(r, n.device);
    } finally {
      r.fill(0);
    }
  });
}
const Ge = "bitlogin:signer-grant:v1:", Uo = "bitlogin:signer-grant-device-key:v1", ie = {
  /** The longest a site BitLogin knows is remembered, in seconds: thirty days from Allow. */
  keepSec: 720 * 3600,
  /** The longest for a site it does not know: seven days. */
  unknownKeepSec: 168 * 3600,
  /** How many recent room passes are remembered, to count them across page loads. */
  passKept: 10,
  /** How many recent signatures are remembered, to count them across page loads. */
  signedKept: 60
}, Wt = (e) => e.at ?? e.until - Vo(e.site), Vo = (e) => (J(e) ? li(e) : vi(e) !== null) ? ie.keepSec : ie.unknownKeepSec, ec = /^[0-9a-f]{64}$/u;
function tt(e) {
  if (typeof e != "string" || e.length > 300 || e.includes("*")) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin === e ? t.origin : "";
  } catch {
    return "";
  }
}
const Fn = (e) => J(e) || tt(e), cr = (e) => btoa(Array.from(e, (t) => String.fromCharCode(t)).join("")), lr = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), ur = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}, tc = (e) => Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
async function jt(e, t, n) {
  const r = Fn(t.site);
  if (!r || t.everydayPrivateKey.length !== 32 || typeof e.getOrCreateDeviceKey != "function" || J(r) && t.permissions) return !1;
  const o = Math.min(Math.floor(t.until), Math.floor(n) + Vo(r));
  if (!(o > n)) return !1;
  const i = crypto.getRandomValues(new Uint8Array(12));
  try {
    const s = await e.getOrCreateDeviceKey(Uo), a = JSON.stringify({
      site: r,
      key: tc(t.everydayPrivateKey),
      until: o,
      ...t.name ? { name: t.name.slice(0, 48) } : {},
      ...ce(t.profile) ? { profile: ce(t.profile) } : {},
      // An application's public signatures are counted up to its own hourly limit, so more of them are kept.
      signed: t.signed.filter((y) => Number.isFinite(y)).slice(-(t.permissions ? Et.public.hourly : ie.signedKept)),
      ...t.permissions ? { permissions: t.permissions } : {},
      ...!t.permissions && !J(r) && se(t.more).length ? { more: se(t.more) } : {},
      ...typeof t.at == "number" ? { at: Math.floor(t.at) } : {},
      ...z(t.relays).length ? { relays: z(t.relays) } : {},
      ...typeof t.checkedAt == "number" ? { checkedAt: Math.floor(t.checkedAt) } : {},
      ...typeof t.seenAt == "number" ? { seenAt: Math.floor(t.seenAt) } : {},
      ...t.signedPass?.length ? { signedPass: t.signedPass.filter((y) => Number.isFinite(y)).slice(-ie.passKept) } : {},
      ...t.permissions && t.signedSensitive ? { signedSensitive: t.signedSensitive.filter((y) => Number.isFinite(y)).slice(-Et.sensitive.hourly) } : {}
    }), l = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, s, new TextEncoder().encode(a)), u = { v: 1, iv: cr(i), ciphertext: cr(new Uint8Array(l)) };
    return await e.set(Ge + r, JSON.stringify(u)), !0;
  } catch {
    return !1;
  }
}
async function yt(e, t, n) {
  const r = Fn(t);
  if (!r || typeof e.getOrCreateDeviceKey != "function") return null;
  try {
    const o = await e.get(Ge + r);
    if (!o) return null;
    const i = JSON.parse(o);
    if (i.v !== 1 || typeof i.iv != "string" || typeof i.ciphertext != "string") return null;
    const s = await e.getOrCreateDeviceKey(Uo), a = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ur(lr(i.iv)) }, s, ur(lr(i.ciphertext))), l = JSON.parse(new TextDecoder().decode(a)), u = (p) => typeof p == "number" && Number.isFinite(p) && p > 0 ? Math.floor(p) : void 0, y = ce(l.profile), d = l.permissions === void 0 ? void 0 : kn(l.permissions);
    if (d === null || d && (J(r) || !_n(r, d)))
      return await e.delete(Ge + r), null;
    const h = (p, v) => Array.isArray(p) ? p.filter((w) => typeof w == "number" && Number.isFinite(w)).slice(-v) : [];
    return l.site !== r || typeof l.key != "string" || !ec.test(l.key) || typeof l.until != "number" ? null : !(l.until > n) || l.until > n + ie.keepSec ? (await e.delete(Ge + r), null) : {
      site: r,
      everydayPrivateKey: Uint8Array.from(l.key.match(/.{2}/gu) ?? [], (p) => Number.parseInt(p, 16)),
      until: l.until,
      ...typeof l.name == "string" && l.name ? { name: l.name.slice(0, 48) } : {},
      ...y ? { profile: y } : {},
      signed: h(l.signed, d ? Et.public.hourly : ie.signedKept),
      ...h(l.signedPass, ie.passKept).length ? { signedPass: h(l.signedPass, ie.passKept) } : {},
      ...!d && !J(r) && se(l.more).length ? { more: se(l.more) } : {},
      ...u(l.at) ? { at: u(l.at) } : {},
      ...z(l.relays).length ? { relays: z(l.relays) } : {},
      ...u(l.checkedAt) ? { checkedAt: u(l.checkedAt) } : {},
      ...u(l.seenAt) ? { seenAt: u(l.seenAt) } : {},
      ...d ? { permissions: d, signedSensitive: h(l.signedSensitive, Et.sensitive.hourly) } : {}
    };
  } catch {
    return null;
  }
}
async function dt(e, t) {
  const n = Fn(t);
  if (n)
    try {
      await e.delete(Ge + n);
    } catch {
    }
}
const qo = "bitlogin:signer-handoff:v1", nc = /* @__PURE__ */ new Set([
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
  // Asking the user's relays whether this site was taken back (docs/take-back.md). It reads one record and the
  // user's relay list, and can only end the grant or leave it be.
  "signerCheck",
  // Remembering a site, so the user is not asked on every page load (signerGrant.ts).
  "signerKeep",
  "signerRestore",
  "signerTouch",
  "signerForget"
]), rn = /^[0-9a-f]{64}$/;
function rc(e) {
  return Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
}
function oc(e) {
  return Uint8Array.from(e.match(/.{2}/g) ?? [], (t) => Number.parseInt(t, 16));
}
function ic(e, t, n, r, o = {}) {
  if (!rn.test(t)) throw new Error("The hand-off has no usable recipient key.");
  if (e.length !== 32) throw new Error("No identity is unlocked in this session.");
  let i = null;
  if (r !== void 0) {
    const h = tt(r.site), p = kn(r.permissions);
    if (!h || !p || !_n(h, p)) throw new Error("That is not a permission set an application may be given.");
    i = { site: h, permissions: p };
  }
  const s = o.site === void 0 ? "" : tt(o.site);
  if (o.site !== void 0 && (!s || i && i.site !== s)) throw new Error("The hand-off names no usable site.");
  const a = ce(o.profile), l = !!s && o.visitOnly !== !0 && o.remember === !0, u = o.family === void 0 ? "" : J(o.family);
  if (o.family !== void 0 && (!u || i || !l || !Pe(s, u))) throw new Error("That is not a family this site may be allowed as.");
  const y = se(o.more);
  if (o.more !== void 0 && (y.length === 0 || !s || i || u)) throw new Error("That is not something this site may be let do.");
  const d = new re(n.slice());
  try {
    const h = JSON.stringify({ v: 1, purpose: qo, key: rc(e), ...i ? { app: i } : {}, ...s ? { site: s } : {}, ...a ? { profile: a } : {}, ...l ? { remember: !0 } : {}, ...typeof o.at == "number" && Number.isFinite(o.at) ? { at: Math.floor(o.at) } : {}, ...z(o.relays).length ? { relays: z(o.relays) } : {}, ...u ? { family: u } : {}, ...y.length ? { more: y } : {} });
    return { senderPublicKey: d.getPublicKey(), payload: d.nip44Encrypt(t, h) };
  } finally {
    d.destroy();
  }
}
function ac(e, t) {
  if (!e || !rn.test(e.senderPublicKey) || typeof e.payload != "string")
    throw new Error("That is not a signer hand-off.");
  const n = new re(t.slice());
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
  if (o.v !== 1 || o.purpose !== qo || typeof o.key != "string" || !rn.test(o.key))
    throw new Error("That is not a signer hand-off.");
  const i = oc(o.key);
  try {
    b(i);
  } catch {
    throw i.fill(0), new Error("The hand-off carried an unusable key.");
  }
  const s = o.site === void 0 ? null : tt(o.site);
  if (s === "")
    throw i.fill(0), new Error("The hand-off names no usable site.");
  const a = ce(o.profile), l = o.remember === !0 && !!s, u = typeof o.at == "number" && Number.isFinite(o.at) && o.at > 0 ? Math.floor(o.at) : null, y = z(o.relays), d = o.family === void 0 ? null : J(o.family);
  if (d === "" || d && (o.app !== void 0 || !l || !Pe(s, d)))
    throw i.fill(0), new Error("The hand-off names a family it cannot be kept for.");
  const h = se(o.more);
  if (o.more !== void 0 && (h.length === 0 || !s || d || o.app !== void 0))
    throw i.fill(0), new Error("The hand-off carries something this site may not be let do.");
  if (o.app === void 0) return { key: i, app: null, site: s, profile: a, remember: l, at: u, relays: y, family: d, more: h };
  const p = o.app, v = p && typeof p == "object" ? tt(p.site) : "", w = p && typeof p == "object" ? kn(p.permissions) : null;
  if (!v || !w || !_n(v, w) || s && s !== v)
    throw i.fill(0), new Error("The hand-off carried a permission set that cannot be read.");
  return { key: i, app: { site: v, permissions: w }, site: v, profile: a, remember: l, at: u, relays: y, family: null, more: [] };
}
const Fo = "bitlogin:session-public:v1";
async function sc(e, t) {
  try {
    const n = {
      pubkey: t.pubkey,
      npub: t.npub,
      ...t.name ? { name: t.name } : {}
    };
    await e.set(Fo, JSON.stringify(n));
  } catch {
  }
}
async function Me(e) {
  try {
    await e.delete(Fo);
  } catch {
  }
}
class cc {
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
const c = {
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
let ye = null, S = [...Cr], j = [...Nr];
const f = new Is();
let on = !1, an = !1;
function yr(e) {
  on || (S = e.vaultRelays), an || (j = e.discoveryRelays);
}
const lc = new cc();
let P = null, Gt = Date.now();
const uc = /* @__PURE__ */ new Set(["configure", "lockStatus", "lockOpen", "restoreSession", "getSessionStatus", "logout"]), Bo = "bitlogin:taken-back:v1:";
async function yc(e) {
  try {
    const t = await f.get(Bo + e);
    return (t ? Kr(JSON.parse(t)) : null) ?? Qt;
  } catch {
    return Qt;
  }
}
function dr(e, t) {
  try {
    return Kr(JSON.parse(e.nip44Decrypt(e.getPublicKey(), t)));
  } catch {
    return null;
  }
}
function De() {
  L(), P && k(P), P = null;
}
async function _e() {
  const e = await le(f);
  return e ? {
    on: !0,
    // Locked with nothing in the active slot too, where other accounts are kept: theirs are sealed under it.
    locked: !P && (await gt(f) === "locked" || (await F(f)).length > 0),
    device: !!e.device,
    ...e.device ? { credentialId: e.device.credentialId } : {},
    triesLeft: Math.max(0, $.tries - e.tries)
  } : { on: !1, locked: !1, device: !1, triesLeft: 0 };
}
function A() {
  if (!c.signer || !c.everydayPrivateKey)
    throw new Error("No identity is unlocked in this session.");
  return { signer: c.signer, everydayPrivateKey: c.everydayPrivateKey };
}
function pt() {
  const e = A();
  if (!c.signerOnly || c.app || !c.site) throw new Error("refused");
  return { ...e, site: c.site };
}
const sn = "bitlogin:world-counts:v1:", dc = "bitlogin:follows-seen:v1:", cn = /* @__PURE__ */ new Map();
async function pr(e, t, n) {
  const r = `${sn}${e}:${t}`;
  let o = cn.get(r);
  if (!o)
    try {
      const l = JSON.parse(await f.get(r) ?? "[]");
      o = Array.isArray(l) ? l.filter((u) => typeof u == "number" && Number.isFinite(u)).slice(-n.hourly) : [];
    } catch {
      o = [];
    }
  const i = Ni(n, o), s = Date.now(), a = i.take(s);
  return cn.set(r, i.times()), a && await f.set(r, JSON.stringify(i.times())).catch(() => {
  }), a;
}
function Ht() {
  if (!c.signerOnly || !c.app) throw new Error("refused");
  return c.app;
}
function L() {
  c.signer?.destroy(), c.everydayPrivateKey && c.everydayPrivateKey.fill(0), c.signer = null, c.everydayPrivateKey = null, c.accountId = null, c.recoveryPublicKey = null, c.activeCredentialEvent = null, c.activeRecoveryEvent = null, c.everydayKeyDerived = !1, c.vault?.destroy(), c.vault = null, c.connectionVaultRoot && c.connectionVaultRoot.fill(0), c.connectionVaultRoot = null, c.vaultKnown = !1, c.signerOnly = !1, c.app = null, c.site = null, c.profile = null, c.remember = !1, c.grantAt = null, c.relays = [], c.family = null, c.more = [], c.pendingRecovery && (c.pendingRecovery.recoveryPrivateKey.fill(0), c.pendingRecovery.everydayPrivateKey.fill(0), c.pendingRecovery = null);
}
function fr(e) {
  return L(), c.pendingRecovery = e, c.signer = new re(e.everydayPrivateKey), c.everydayPrivateKey = e.everydayPrivateKey, c.accountId = e.accountId, c.recoveryPublicKey = e.recoveryPublicKey, c.activeRecoveryEvent = e.currentRecoveryEvent, c.everydayKeyDerived = e.everydayKeyDerived, ln(
    e.currentRecoveryPayload.connection_vault_root ? T(e.currentRecoveryPayload.connection_vault_root) : void 0
  ), {
    everydayPublicKey: e.everydayPublicKey,
    accountId: e.accountId,
    generalRelays: e.generalRelays,
    dmRelays: e.dmRelays,
    chainWarning: e.chainWarning,
    everydayKeyDerived: e.everydayKeyDerived
  };
}
function ln(e, t) {
  c.connectionVaultRoot = e ?? null, c.vaultKnown = !0, c.vault = null, t && k(t);
}
async function de() {
  if (!c.everydayPrivateKey || !c.accountId || !c.recoveryPublicKey || !c.activeCredentialEvent || !c.activeRecoveryEvent)
    return;
  const e = await le(f);
  e && !P && (await je(f), await un());
  const t = {
    everydayPrivateKey: c.everydayPrivateKey,
    accountId: c.accountId,
    recoveryPublicKey: c.recoveryPublicKey,
    activeCredentialEvent: c.activeCredentialEvent,
    activeRecoveryEvent: c.activeRecoveryEvent,
    ...c.connectionVaultRoot ? { connectionVaultRoot: c.connectionVaultRoot } : {},
    ...c.vaultKnown ? { vaultEnabled: c.connectionVaultRoot !== null } : {},
    everydayKeyDerived: c.everydayKeyDerived
  }, n = e && P ? P : null;
  await tn(f, t, n);
  const r = b(c.everydayPrivateKey);
  await tn(f, t, n, U(r));
  const o = js(await F(f), r, Date.now() / 1e3);
  for (const i of o.dropped) await G(f, U(i));
  await fe(f, o.list), await $o();
}
async function un() {
  for (const e of await F(f)) await G(f, U(e.pubkey));
  await fe(f, []);
}
async function hr(e, t) {
  const n = c.everydayPrivateKey ? b(c.everydayPrivateKey) : "";
  let r = await F(f);
  for (const o of r) {
    if (o.pubkey === n) continue;
    const i = await xo(f, e, U(o.pubkey));
    i ? (await tn(f, i, t, U(o.pubkey)), i.everydayPrivateKey.fill(0), i.connectionVaultRoot?.fill(0)) : (await G(f, U(o.pubkey)), r = mt(r, o.pubkey));
  }
  await fe(f, r);
}
async function Jt(e) {
  const t = await xo(f, P, e);
  return t ? (L(), c.signer = new re(t.everydayPrivateKey), c.everydayPrivateKey = t.everydayPrivateKey, c.accountId = t.accountId, c.recoveryPublicKey = t.recoveryPublicKey, c.activeCredentialEvent = t.activeCredentialEvent, c.activeRecoveryEvent = t.activeRecoveryEvent, c.everydayKeyDerived = t.everydayKeyDerived ?? !1, c.connectionVaultRoot = t.connectionVaultRoot ?? null, c.vaultKnown = t.vaultEnabled !== void 0, await $o(), {
    restored: !0,
    everydayPublicKey: c.signer.getPublicKey(),
    accountId: t.accountId,
    everydayKeyDerived: c.everydayKeyDerived
  }) : { restored: !1 };
}
async function $o() {
  if (!c.signer) return;
  const e = c.signer.getPublicKey();
  await sc(f, { pubkey: e, npub: Fe(e) });
}
function Le() {
  try {
    return new URL(self.location.href).origin;
  } catch {
    return "";
  }
}
function yn() {
  if (!c.signer) throw new Error("No identity is unlocked in this session.");
  if (!c.connectionVaultRoot)
    throw new Error(
      c.vaultKnown ? "This account predates the Connection Vault. Enable it from your BitLogin account manager (recovery phrase required)." : "Sign in again to use wallet connections on this device."
    );
  return c.vault ??= new Cs(c.connectionVaultRoot.slice()), c.vault;
}
function Ue(e) {
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
async function bt() {
  const e = yn(), t = await e.listConnections({ relayUrls: S, store: f });
  return {
    vault: e,
    connections: t.connections.filter((n) => n.record.state !== "deleted"),
    rollbackWarnings: t.rollbackWarnings,
    unreadable: t.unreadable,
    truncated: t.truncated,
    quorumMet: t.quorumMet
  };
}
async function zt(e) {
  const { vault: t, connections: n } = await bt(), r = n.find((o) => o.record.connection_id === e);
  if (!r) throw new Error("That connection no longer exists.");
  return { vault: t, connection: r };
}
let we = null, H = null;
function vr(e) {
  self.postMessage({ notify: "nip46-auth-url", url: e });
}
function Ve() {
  if (!we) throw new Error("No remote signer is connected.");
  return we;
}
function ft() {
  H && (H.abort.abort(), k(H.clientSecretKey), H = null);
}
function Wo(e) {
  const t = e.buildLogoutEvent();
  e.close(), t && e.publishCourtesy(t);
}
function wr(e, t) {
  we && Wo(we.client), we = { client: e, userPubkey: t };
}
async function pc(e, t) {
  if (c.signerOnly && !nc.has(e))
    throw new Error("This session can only sign. Sign in at your own BitLogin page for anything else.");
  switch (P && e !== "configure" && Date.now() - Gt > $.idleSec * 1e3 && De(), uc.has(e) || (Gt = Date.now()), e) {
    // ---- The optional lock (lock.ts) ----
    case "lockStatus":
      return _e();
    // Turn it on, or change the PIN. Only with a full session unlocked: the key that is sealed is the one in hand.
    case "lockEnable": {
      if (A(), await le(f) && !P) throw new Error("Unlock first.");
      const n = await zs(f, t.pin, P ?? void 0);
      return await hr(P, n), P && k(P), P = n, await de(), _e();
    }
    case "lockSetDevice": {
      if (A(), !P) throw new Error("Turn the lock on first.");
      const n = t, r = T(String(n.prfOutput));
      try {
        await Ys(f, P, String(n.credentialId), r);
      } finally {
        k(r);
      }
      return _e();
    }
    case "lockRemoveDevice": {
      if (A(), !P) throw new Error("Turn the lock on first.");
      return await Qs(f), _e();
    }
    case "lockDisable": {
      if (A(), await le(f) && !P) throw new Error("Unlock first.");
      return await hr(P, null), await je(f), P && k(P), P = null, await de(), _e();
    }
    case "lockNow": {
      if (!P) throw new Error("The lock is not on.");
      return De(), _e();
    }
    // Open it, with the PIN or with the device. A wrong try is counted; one too many removes the lock and the
    // cached session with it, and the user signs in again the ordinary way.
    case "lockOpen": {
      const n = t;
      let r;
      if (typeof n.prfOutput == "string") {
        const o = T(n.prfOutput);
        try {
          r = await Zs(f, o);
        } finally {
          k(o);
        }
      } else
        r = await Xs(f, n.pin);
      if (r.ok) {
        P && k(P), P = r.lockKey, Gt = Date.now();
        const o = await Jt();
        if (o.restored) return { ok: !0, left: $.tries, removed: !1, ...o };
        if (await gt(f) === "none" && (await F(f)).length > 0) return { ok: !0, left: $.tries, removed: !1, restored: !1 };
        await je(f), De(), r = { ok: !1, left: 0, removed: !0 };
      }
      return r.removed && (De(), await un(), await ar(f), await Me(f)), { ok: !1, left: r.left, removed: r.removed, restored: !1 };
    }
    // ---- Signer hand-off (docs/sign-in-window.md) ----
    // The receiving side, first: a throwaway key for the hand-off to be sealed to.
    case "handoffBegin":
      return ye && k(ye), ye = ct(), { recipientPublicKey: b(ye) };
    // The sending side: this worker has the session, and seals the everyday
    // key (only that) to the receiving worker's throwaway key.
    case "handoffExport": {
      const { everydayPrivateKey: n } = A(), r = ct(), o = t;
      try {
        return ic(n, o.recipientPublicKey, r, o.app, {
          ...o.site !== void 0 ? { site: o.site } : {},
          // Only a site that declared nothing is told who they are. An application is held to what it asked,
          // though the window may have read the profile to show the user which account this is.
          ...c.profile && !o.app ? { profile: c.profile } : {},
          ...o.remember === !0 ? { remember: !0 } : {},
          ...o.family !== void 0 ? { family: o.family } : {},
          ...o.more !== void 0 ? { more: o.more } : {},
          // With the lock on, nothing is kept for any site: a key at rest in a site's storage would be a key
          // the lock does not cover. Every site is allowed for the visit, and asks at the sign-in address again.
          ...P ? { visitOnly: !0 } : {},
          // When it was allowed, by this worker's clock, and where the user writes: what a signer needs to
          // find out later whether the site was taken back (docs/take-back.md).
          at: Date.now() / 1e3,
          relays: c.relays
        });
      } finally {
        k(r);
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
      if (!c.signerOnly) throw new Error("Only a signer-only session can be remembered for a site.");
      const r = t, o = Date.now() / 1e3;
      if (!c.remember) return { kept: !1 };
      if (c.app && c.app.site !== r.site || c.site && c.site !== r.site) throw new Error("This hand-off was for another site.");
      if (c.family) {
        if (!Pe(r.site, c.family)) throw new Error("This hand-off was for another site.");
        await dt(f, r.site);
      }
      return {
        kept: await jt(
          f,
          {
            site: c.family ?? r.site,
            everydayPrivateKey: n,
            until: r.until,
            ...r.name ? { name: r.name } : {},
            ...c.profile ? { profile: c.profile } : {},
            at: c.grantAt ?? Math.floor(o),
            ...c.relays.length ? { relays: c.relays } : {},
            signed: [],
            ...!c.app && !c.family && c.more.length ? { more: se(c.more) } : {},
            ...c.app ? { permissions: c.app.permissions, signedSensitive: [] } : {}
          },
          o
        )
      };
    }
    // The site's page was loaded again: what was kept for that site, if it is still in date, becomes a
    // signer-only session. It touches nothing a full session uses.
    case "signerRestore": {
      const n = t, r = await yt(f, n.site, Date.now() / 1e3), o = !r && n.family !== void 0 && J(n.family) && Pe(n.site, n.family) ? n.family : null, i = r ?? (o ? await yt(f, o, Date.now() / 1e3) : null);
      return !i || o && i.site !== o ? { restored: !1 } : (L(), c.signer = new re(i.everydayPrivateKey), c.everydayPrivateKey = i.everydayPrivateKey, c.signerOnly = !0, c.app = i.permissions ? { site: i.site, permissions: i.permissions } : null, c.site = o ? n.site : i.site, c.family = o, c.profile = i.profile ?? null, c.remember = !0, c.grantAt = Wt(i), c.relays = i.relays ?? [], c.more = o ? [] : i.more ?? [], {
        restored: !0,
        everydayPublicKey: c.signer.getPublicKey(),
        until: i.until,
        ...i.name ? { name: i.name } : {},
        ...i.profile ? { profile: i.profile } : {},
        signed: i.signed,
        ...i.signedPass ? { signedPass: i.signedPass } : {},
        check: jn(Date.now() / 1e3, Wt(i), i.checkedAt ?? 0),
        ...o ? { family: o } : {},
        ...c.more.length ? { more: se(c.more) } : {},
        ...i.permissions ? { permissions: i.permissions, signedSensitive: i.signedSensitive ?? [] } : {}
      });
    }
    // Count a signature against the site, where reloading the page can't lose the count.
    case "signerTouch": {
      const { everydayPrivateKey: n } = A();
      if (!c.signerOnly) throw new Error("Only a signer-only session is counted for a site.");
      const r = t, o = Date.now() / 1e3, i = await yt(f, c.family && Pe(r.site, c.family) ? c.family : r.site, o);
      return i && b(i.everydayPrivateKey) === b(n) && await jt(
        f,
        { ...i, signed: Array.isArray(r.signed) ? r.signed : [], ...Array.isArray(r.signedPass) ? { signedPass: r.signedPass } : {}, ...i.permissions ? { signedSensitive: Array.isArray(r.signedSensitive) ? r.signedSensitive : [] } : {} },
        o
      ), {};
    }
    // Signing out of a site that was allowed as one of a family signs out of the family: otherwise its next page
    // load would take the family's grant up again, and the sign-out would not have happened (SF6).
    case "signerForget": {
      const n = t.site;
      await dt(f, n), c.family && Pe(n, c.family) && await dt(f, c.family);
      for (const r of ["save", "follow"])
        cn.delete(`${sn}${r}:${n}`), await f.delete(`${sn}${r}:${n}`).catch(() => {
        });
      return {};
    }
    case "handoffAccept": {
      if (!ye) throw new Error("No hand-off was begun here.");
      const n = ye;
      ye = null;
      let r;
      try {
        r = ac(t, n);
      } finally {
        k(n);
      }
      return L(), c.signer = new re(r.key), c.everydayPrivateKey = r.key, c.signerOnly = !0, c.app = r.app, c.site = r.site, c.profile = r.profile, c.remember = r.remember, c.grantAt = r.at, c.relays = r.relays, c.family = r.family, c.more = r.more, {
        everydayPublicKey: c.signer.getPublicKey(),
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
      const { signer: n } = A(), r = n.getPublicKey(), o = t.profile !== !1, i = [.../* @__PURE__ */ new Set([...j, ...S])].slice(0, 8);
      if (i.length === 0) return {};
      const s = new K(i);
      try {
        const [a, l] = await Promise.all([
          o ? s.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 4e3) : Promise.resolve(null),
          s.queryQuorum({ kinds: [Vt], authors: [r], limit: 2 }, 4e3)
        ]);
        if (c.signer !== n) return {};
        c.profile = a ? qs(a.outcomes.flatMap((u) => u.events), r) : null, c.profile && !c.signerOnly && await fe(f, Gs(await F(f), r, c.profile)), c.relays = qt(l.outcomes.flatMap((u) => u.events), r);
      } finally {
        s.closeAll();
      }
      return { ...c.profile ? { profile: c.profile } : {}, relays: c.relays };
    }
    // ---- Taking a site back (docs/take-back.md) ----
    // At the sign-in address, with a full session: publish the record that says a site, or every site, is taken
    // back as of now. It carries everything an earlier record said, from the relays and from this browser's own
    // copy, so a record built here can never give a site back.
    case "takeBack": {
      const { signer: n } = A(), r = t, o = n.getPublicKey(), i = Date.now() / 1e3, s = r.all === !0 ? { all: !0 } : { site: String(r.site ?? "") }, a = new K([.../* @__PURE__ */ new Set([...j, ...S])].slice(0, 8));
      let l;
      try {
        l = qt((await a.queryQuorum({ kinds: [Vt], authors: [o], limit: 2 }, 4e3)).outcomes.flatMap((d) => d.events), o);
      } finally {
        a.closeAll();
      }
      const u = [.../* @__PURE__ */ new Set([...l, ...S])].slice(0, 16), y = new K(u);
      try {
        const d = await y.queryQuorum({ kinds: [Ut], authors: [o], "#d": [Lt], limit: 2 }, 5e3);
        if (d.respondedCount === 0) return { ok: !1, accepted: 0, of: u.length };
        const h = Gn(d.outcomes.flatMap((E) => E.events), o, i), p = h ? dr(n, h.content) : null, v = await yc(o), w = di(pi(p ?? Qt, v, i), s, i), m = n.signEvent({
          kind: Ut,
          // Later than the one it replaces, whatever the two clocks say.
          created_at: Math.max(Math.floor(i), (h?.created_at ?? 0) + 1),
          tags: [["d", Lt]],
          content: n.nip44Encrypt(o, Hn(w))
        }), g = ve(await y.publishAll(m, 6e3)), _ = g >= Math.min(2, u.length);
        return _ && await f.set(Bo + o, Hn(w)).catch(() => {
        }), { ok: _, accepted: g, of: u.length };
      } finally {
        y.closeAll();
      }
    }
    // In the embedded signer, for a kept grant: ask the user's relays whether this site was taken back. Asked at
    // most once a day. It can end the grant or leave it be, and nothing else.
    case "signerCheck": {
      const { signer: n } = A();
      if (!c.signerOnly || !c.site) return { state: "ok" };
      const r = c.family ?? c.site, o = Date.now() / 1e3, i = await yt(f, r, o);
      if (!i) return { state: "ok" };
      const s = n.getPublicKey(), a = Wt(i), l = jn(o, a, i.checkedAt ?? 0);
      if (l === "fresh") return { state: "ok" };
      const u = [.../* @__PURE__ */ new Set([...z(i.relays), ...S])].slice(0, 12), y = new K(u);
      let d, h;
      try {
        [d, h] = await Promise.all([
          y.queryQuorum({ kinds: [Ut], authors: [s], "#d": [Lt], limit: 2 }, 5e3),
          y.queryQuorum({ kinds: [Vt], authors: [s], limit: 2 }, 5e3)
        ]);
      } finally {
        y.closeAll();
      }
      if (c.signer !== n) return { state: "ok" };
      const p = Gn(d.outcomes.flatMap((g) => g.events), s, o), v = p ? dr(n, p.content) : null;
      if (v && ui(v, r, a))
        return await dt(f, r), L(), { state: "ended" };
      if (!yi({
        asked: u.length,
        answered: d.respondedCount,
        seenAt: i.seenAt ?? 0,
        newestAt: p ? p.created_at : null,
        readable: v !== null
      })) return { state: l === "overdue" ? "stale" : "ok" };
      const m = qt(h.outcomes.flatMap((g) => g.events), s);
      return await jt(
        f,
        {
          ...i,
          checkedAt: Math.floor(o),
          seenAt: Math.max(i.seenAt ?? 0, v && p ? p.created_at : 0),
          ...m.length ? { relays: m } : {}
        },
        o
      ), m.length && (c.relays = m), { state: "ok" };
    }
    // A room pass (NSWP kind 27300) for the site this session serves, and for no other. The site, the time, how
    // long it lasts and the profile are all this worker's own: what is asked for is a session public key. Not
    // for an application: an application is held to the set the user read, and a pass is not in one.
    case "roomPass": {
      const { signer: n } = A();
      if (!c.signerOnly || c.app || !c.site) throw new Error("refused");
      const r = Bs({
        session: t.session,
        site: c.site,
        identity: n.getPublicKey(),
        nowSeconds: Date.now() / 1e3,
        profile: c.profile
      });
      if (!r) throw new Error("refused");
      return n.signEvent(r);
    }
    // ---- What a world keeps for its visitor (NSWP-12; embedded/saves.ts). The world is never taken from what is
    // asked: it is the site this session serves, as the browser gave it to the signer's page.
    case "worldSave": {
      const { signer: n, everydayPrivateKey: r, site: o } = pt(), i = t, s = he(r, n.getPublicKey());
      try {
        const a = Ri({ conversationKey: s, world: o, slot: i.slot, data: i.data, nowSeconds: Date.now() / 1e3 });
        if (!a || !await pr("save", o, Ci)) throw new Error("refused");
        return n.signEvent(a);
      } finally {
        k(s);
      }
    }
    case "worldFind": {
      const { signer: n, everydayPrivateKey: r, site: o } = pt(), i = he(r, n.getPublicKey());
      try {
        const s = Ai(i, o, t.slot);
        if (!s) throw new Error("refused");
        return { d: s };
      } finally {
        k(i);
      }
    }
    case "worldOpen": {
      const { signer: n, everydayPrivateKey: r, site: o } = pt(), i = t.event;
      if (!N(i)) throw new Error("refused");
      const s = he(r, n.getPublicKey());
      try {
        const a = Si(i, { conversationKey: s, pubkey: n.getPublicKey(), world: o });
        if (!a) throw new Error("refused");
        return a;
      } finally {
        k(s);
      }
    }
    // ---- Following from inside a world (NSWP-14; embedded/follows.ts). Only for a world the user let do this, by
    // name, in the window. The world hands over their newest follow list and one change; what is signed is that
    // list with that change and nothing else. A follow list replaces the last, so before a world's word is
    // believed this worker looks at the user's own relays itself: a world that is behind, or that says there is
    // no list where one merely couldn't be reached, is refused.
    case "worldFollow": {
      const { signer: n, site: r } = pt();
      if (!c.more.includes("follows")) throw new Error("refused");
      const o = t, i = n.getPublicKey(), s = o.list === null ? null : Jn(o.list, i);
      if (o.list !== null && !s) throw new Error("refused");
      const a = dc + i;
      let l = 0;
      try {
        const v = Number(await f.get(a));
        Number.isSafeInteger(v) && v > 0 && (l = v);
      } catch {
      }
      const u = [.../* @__PURE__ */ new Set([...z(c.relays), ...j, ...S])].slice(0, 8);
      let y = 0, d = 0;
      if (u.length) {
        const v = new K(u);
        try {
          const w = await v.queryQuorum({ kinds: [Ei], authors: [i], limit: 2 }, 3500);
          y = w.respondedCount;
          for (const m of w.outcomes.flatMap((g) => g.events))
            m.created_at > d && Jn(m, i) && (d = m.created_at);
        } catch {
        } finally {
          v.closeAll();
        }
      }
      if (c.signer !== n || !c.more.includes("follows")) throw new Error("refused");
      if (l = Math.max(l, d), l && await f.set(a, String(l)).catch(() => {
      }), !Pi(s, { answered: y, newestAt: d })) throw new Error("refused");
      const h = Ki({ list: s, ...o.add !== void 0 ? { add: o.add } : {}, ...o.remove !== void 0 ? { remove: o.remove } : {}, pubkey: i, nowSeconds: Date.now() / 1e3, seen: l });
      if (!h || !await pr("follow", r, Ti)) throw new Error("refused");
      const p = n.signEvent(h);
      return await f.set(a, String(Math.max(l, p.created_at))).catch(() => {
      }), p;
    }
    // ---- What an approved application may ask beyond signing (§SW9.5). Refused without a permission set.
    case "appEncrypt": {
      const { signer: n } = A(), r = Ht(), o = t, i = n.getPublicKey(), s = r.permissions.sign.some((a) => ki.includes(a));
      if (!_i(r.permissions, i, o.peerPublicKey) && !(s && /^[0-9a-f]{64}$/u.test(String(o.peerPublicKey))))
        throw new Error("refused");
      if (typeof o.text != "string" || o.text.length > 1e5) throw new Error("refused");
      return { text: o.scheme === "nip04" ? n.nip04Encrypt(o.peerPublicKey, o.text) : n.nip44Encrypt(o.peerPublicKey, o.text) };
    }
    case "appDecrypt": {
      const { signer: n } = A(), r = Ht(), o = t;
      if (!bi(r.permissions, o.peerPublicKey) || typeof o.text != "string") throw new Error("refused");
      return { text: o.scheme === "nip04" ? n.nip04Decrypt(o.peerPublicKey, o.text) : n.nip44Decrypt(o.peerPublicKey, o.text) };
    }
    case "appDecryptEvent": {
      const { signer: n } = A(), r = Ht(), o = t.event;
      if (!N(o)) throw new Error("refused");
      const i = mi(r.permissions, n.getPublicKey(), o), s = o.kind === 4 || /\?iv=[A-Za-z0-9+/=]+$/u.test(o.content);
      for (const a of i)
        try {
          return { text: s ? n.nip04Decrypt(a, o.content) : n.nip44Decrypt(a, o.content) };
        } catch {
        }
      throw new Error("refused");
    }
    case "nip46Connect": {
      const r = Zi(t.uri), o = new Qn({
        clientSecretKey: ct(),
        pointer: r,
        onAuthUrl: vr
      });
      try {
        await o.connect();
        const i = await o.getUserPublicKey();
        return wr(o, i), ft(), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46NostrconnectStart": {
      const n = t, r = S.slice(0, 2);
      ft();
      const o = ct(), i = ze(O(16));
      return H = { clientSecretKey: o, relayUrls: r, secret: i, abort: new AbortController() }, { uri: ea({
        clientPubkey: b(o),
        relayUrls: r,
        secret: i,
        name: n.appName?.trim() || "BitLogin",
        perms: ["sign_event", "nip44_encrypt", "nip44_decrypt", "nip04_encrypt", "nip04_decrypt"]
      }) };
    }
    case "nip46NostrconnectAwait": {
      const n = H;
      if (!n) throw new Error("No signer-connection attempt is in progress.");
      let r;
      try {
        ({ signerPubkey: r } = await na({
          clientSecretKey: n.clientSecretKey,
          relayUrls: n.relayUrls,
          secret: n.secret,
          timeoutMs: 18e4,
          signal: n.abort.signal
        }));
      } catch (i) {
        throw H === n && ft(), i;
      }
      if (H !== n) throw new Error("This signer-connection attempt was superseded.");
      H = null;
      const o = new Qn({
        clientSecretKey: n.clientSecretKey,
        pointer: { signerPubkey: r, relayUrls: n.relayUrls },
        onAuthUrl: vr
      });
      try {
        const i = await o.getUserPublicKey();
        return wr(o, i), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46SignEvent": {
      const n = t;
      return Ve().client.signEvent({
        kind: n.kind,
        content: n.content,
        tags: n.tags ?? [],
        created_at: n.created_at ?? Math.floor(Date.now() / 1e3)
      });
    }
    case "nip46Nip44Encrypt": {
      const n = t;
      return { ciphertext: await Ve().client.nip44Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip44Decrypt": {
      const n = t;
      return { plaintext: await Ve().client.nip44Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Nip04Encrypt": {
      const n = t;
      return { ciphertext: await Ve().client.nip04Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip04Decrypt": {
      const n = t;
      return { plaintext: await Ve().client.nip04Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Disconnect": {
      const n = we;
      return we = null, ft(), n && Wo(n.client), {};
    }
    case "configure": {
      const n = t;
      return on = !!n.vaultRelayUrls?.length, an = !!n.discoveryRelayUrls?.length, n.vaultRelayUrls?.length && (S = n.vaultRelayUrls), n.discoveryRelayUrls?.length && (j = n.discoveryRelayUrls), yr(vt(await xr(f))), (!on || !an) && Wi(f).then(yr, () => {
      }), {};
    }
    case "register": {
      const n = t, r = n.importKey ? await ts({ nsecOrHex: n.importKey, loginName: n.loginName, password: n.password, vaultRelayUrls: S }) : await co({ loginName: n.loginName, password: n.password, vaultRelayUrls: S });
      return L(), c.signer = new re(r.everydayPrivateKey), c.everydayPrivateKey = r.everydayPrivateKey, c.accountId = r.accountId, c.recoveryPublicKey = r.recoveryPublicKey, c.activeCredentialEvent = r.credentialEvent, c.activeRecoveryEvent = r.recoveryEvent, c.everydayKeyDerived = r.everydayKeyDerived, ln(r.connectionVaultRoot, r.vaultSudoKey), await de(), {
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
      const r = lo(t.nsecOrHex), o = b(r), i = { everydayPublicKey: o, npub: Fe(o) };
      return r.fill(0), i;
    }
    case "login": {
      const n = t, r = await ns({
        loginName: n.loginName,
        password: n.password,
        vaultRelayUrls: S,
        store: f,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return L(), c.signer = new re(r.everydayPrivateKey), c.everydayPrivateKey = r.everydayPrivateKey, c.accountId = r.accountId, c.recoveryPublicKey = r.recoveryPublicKey, c.activeCredentialEvent = r.credentialEvent, c.activeRecoveryEvent = r.recoveryCapsuleEvent, c.everydayKeyDerived = r.everydayKeyDerived, ln(r.connectionVaultRoot, r.vaultSudoKey), await de(), !r.rollbackWarning && !r.relayDisagreementWarning && er({
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
      const n = t, r = await rs({
        phrase: n.phrase,
        vaultRelayUrls: S,
        discoveryRelayUrls: j,
        offlineRecoveryCapsuleEvents: n.offlineExportFile?.recovery_capsule_events
      });
      return fr(r);
    }
    case "previewPhraseRebuild": {
      const r = await os({ phrase: t.phrase, vaultRelayUrls: S, discoveryRelayUrls: j });
      return { ...r, npub: Fe(r.everydayPublicKey) };
    }
    case "rebuildFromPhrase": {
      const r = await is({ phrase: t.phrase, vaultRelayUrls: S, discoveryRelayUrls: j });
      return fr(r);
    }
    case "completeRecovery": {
      const n = t;
      if (!c.pendingRecovery) throw new Error("No recovery is in progress in this session.");
      const r = await as({
        recovered: c.pendingRecovery,
        newLoginName: n.newLoginName,
        newPassword: n.newPassword,
        vaultRelayUrls: S,
        store: f
      });
      return c.activeCredentialEvent = r.credentialEvent, c.activeRecoveryEvent = r.refreshedRecoveryEvent, c.pendingRecovery.recoveryPrivateKey.fill(0), c.pendingRecovery = null, await de(), {
        locatorPublicKey: r.locatorPublicKey,
        credentialEventId: r.credentialEvent.id,
        refreshedRecoveryEventId: r.refreshedRecoveryEvent.id
      };
    }
    case "changePassword": {
      const n = t, r = await ss({
        loginName: n.loginName,
        oldPassword: n.oldPassword,
        newPassword: n.newPassword,
        vaultRelayUrls: S,
        store: f,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return c.activeCredentialEvent = r.newCredentialEvent, c.recoveryPublicKey = r.recoveryPublicKey, c.activeRecoveryEvent = r.recoveryCapsuleEvent, await de(), {
        newLocatorPublicKey: r.newLocatorPublicKey,
        newGeneration: r.newGeneration,
        tombstoneAcknowledgedCount: r.tombstoneAcknowledgedCount,
        deletionAcknowledgedCount: r.deletionAcknowledgedCount
      };
    }
    case "publishProfileAndRelayLists": {
      const n = t, { everydayPrivateKey: r } = A();
      return Va({
        everydayPrivateKey: r,
        name: n.name,
        about: n.about,
        picture: n.picture,
        generalRelays: n.generalRelays,
        dmRelays: n.dmRelays,
        discoveryRelays: j
      });
    }
    case "getPublicKey": {
      const { signer: n } = A();
      return { publicKey: n.getPublicKey() };
    }
    case "signEvent": {
      const { signer: n } = A(), r = t;
      if (c.signerOnly) {
        if (c.app) {
          const o = wi(c.app.permissions, r, c.app.site, Date.now() / 1e3);
          if (!o) throw new Error("refused");
          return n.signEvent(o);
        }
        if (gi(r.kind) !== "ordinary") throw new Error("refused");
      }
      return n.signEvent({ kind: r.kind, tags: r.tags, content: r.content, created_at: r.created_at });
    }
    case "nip44Encrypt": {
      const { signer: n } = A(), r = t;
      return { ciphertext: n.nip44Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip44Decrypt": {
      const { signer: n } = A(), r = t;
      return { plaintext: n.nip44Decrypt(r.peerPublicKey, r.payload) };
    }
    case "nip04Encrypt": {
      const { signer: n } = A(), r = t;
      return { ciphertext: n.nip04Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip04Decrypt": {
      const { signer: n } = A(), r = t;
      return { plaintext: n.nip04Decrypt(r.peerPublicKey, r.payload) };
    }
    case "exportIdentity": {
      const { everydayPrivateKey: n, signer: r } = A();
      return { nsec: Yo(n), npub: Fe(r.getPublicKey()) };
    }
    case "buildRecoveryExport": {
      if (A(), !c.recoveryPublicKey || !c.activeRecoveryEvent)
        throw new Error("No recovery capsule is known in this session yet.");
      return zo({
        recoveryPublicKeyHex: c.recoveryPublicKey,
        vaultRelayUrls: S,
        recoveryCapsuleEvents: [c.activeRecoveryEvent],
        relayListEvents: []
      });
    }
    case "repairReplicas": {
      if (!c.activeCredentialEvent || !c.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return er({
        relayUrls: S,
        credentialEvent: c.activeCredentialEvent,
        recoveryEvent: c.activeRecoveryEvent
      });
    }
    case "checkReplicaHealth": {
      if (!c.activeCredentialEvent || !c.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Xa({
        relayUrls: S,
        credentialEvent: c.activeCredentialEvent,
        recoveryEvent: c.activeRecoveryEvent
      });
    }
    case "getSessionStatus":
      return { unlocked: !!c.signer, everydayPublicKey: c.signer?.getPublicKey(), signerOnly: c.signerOnly };
    // Called once, right after "configure", before the widget renders its welcome
    // screen -- restores whatever persistSession() last cached for this origin, so
    // a page reload doesn't ask for the login name + password again. A missing or
    // corrupt cache is not an error: it just means the widget falls through to its
    // normal welcome screen, exactly like it always has.
    case "restoreSession":
      return !P && await gt(f) === "locked" ? { restored: !1, locked: !0 } : Jt();
    // Log out: this account is forgotten on this device. Other accounts kept here stay, and so does the lock
    // they are sealed under; with none left, everything goes as it always did.
    case "logout": {
      const n = c.everydayPrivateKey && !c.signerOnly ? b(c.everydayPrivateKey) : "", r = mt(await F(f), n);
      return n && await G(f, U(n)), r.length > 0 && n ? (await fe(f, r), L(), await G(f), await Me(f), {}) : (De(), await je(f), await un(), await ar(f), await Me(f), {});
    }
    // ---- Several accounts on one device (docs/account-switching.md) ----
    // Who is kept here, and which of them is signed in. Public keys and what their own profiles call them.
    case "accountsList": {
      const n = c.everydayPrivateKey && !c.signerOnly ? b(c.everydayPrivateKey) : "";
      return { accounts: (await F(f)).map((r) => ({ ...r, active: r.pubkey === n })) };
    }
    // Switch to a kept account: its own slot is opened, on this device, with no password and no relay. With the
    // lock on and locked, it says so, and nothing changes.
    case "accountsSwitch": {
      if (c.signerOnly) throw new Error("A signer-only session cannot switch accounts.");
      const n = String(t.pubkey ?? ""), r = await F(f);
      if (!r.some((i) => i.pubkey === n)) return { restored: !1 };
      if (!P && await gt(f, U(n)) === "locked") return { restored: !1, locked: !0 };
      const o = await Jt(U(n));
      return !o.restored || o.everydayPublicKey !== n ? (L(), await G(f, U(n)), await fe(f, mt(r, n)), await G(f), await Me(f), { restored: !1 }) : (await de(), o);
    }
    // Make room to sign in as another account: nobody is signed in, and everyone kept stays kept.
    case "accountsAdd": {
      if (c.signerOnly) throw new Error("A signer-only session cannot add accounts.");
      return L(), await G(f), await Me(f), {};
    }
    // Forget one kept account that is not the one signed in. (For that one: log out.)
    case "accountsRemove": {
      const n = String(t.pubkey ?? ""), r = c.everydayPrivateKey && !c.signerOnly ? b(c.everydayPrivateKey) : "";
      if (n === r) throw new Error("Log out to remove the account that is signed in.");
      return await G(f, U(n)), await fe(f, mt(await F(f), n)), {};
    }
    // ---- Connection Vault (connection-vault.md §12, reveal mode) ----
    case "vaultStatus":
      return c.signer ? c.connectionVaultRoot ? { enabled: !0, vaultPublicKey: yn().vaultPublicKey } : { enabled: !1, reason: c.vaultKnown ? "no-vault" : "stale-cache" } : { enabled: !1 };
    case "vaultList": {
      const { connections: n, rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: s } = await bt();
      return { connections: n.map(Ue), rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: s };
    }
    case "vaultSaveNwc": {
      const n = t, r = Le(), o = yn(), i = or(n.uri), s = n.label.trim().slice(0, 120) || "Wallet connection", { record: a, event: l } = await o.createConnection({
        connection_type: "nwc",
        tier: "connectable",
        label: s,
        credential: i,
        application_binding: { origin: r, app_pubkey: null }
      });
      if (!(await o.publish({
        event: l,
        connectionId: a.connection_id,
        relayUrls: S,
        store: f
      })).success)
        throw new Error("The connection could not be saved to enough relays. Please try again.");
      const y = await o.decryptEvent(l);
      return Ue(y);
    }
    case "vaultFindForOrigin": {
      const n = Le(), { connections: r } = await bt(), o = r.find(
        (i) => i.record.connection_type === "nwc" && i.record.state === "active" && i.record.application_binding.origin === n
      );
      return { connection: o ? Ue(o) : null };
    }
    case "vaultRevealNwc": {
      const n = t, { connection: r } = await zt(n.connectionId);
      if (r.record.connection_type !== "nwc" || r.record.state !== "active")
        throw new Error("That connection is not an active wallet connection.");
      const o = r.record.application_binding.origin;
      if (o !== null && o !== Le())
        throw new Error("That connection belongs to a different site.");
      const i = r.record.credential;
      return Eo(i), { uri: ms(i) };
    }
    case "vaultSetBinding": {
      const n = t, { vault: r, connection: o } = await zt(n.connectionId), i = n.origin === null ? null : Le(), { record: s, event: a } = await r.updateConnection(o, {
        application_binding: { origin: i, app_pubkey: null }
      });
      if (!(await r.publish({
        event: a,
        connectionId: s.connection_id,
        relayUrls: S,
        store: f
      })).success) throw new Error("The change could not reach enough relays. Please try again.");
      const u = await r.decryptEvent(a);
      return Ue(u);
    }
    case "vaultDelete": {
      const n = t, { vault: r, connection: o } = await zt(n.connectionId), { record: i, event: s } = await r.deleteConnection(o);
      if (!(await r.publish({
        event: s,
        connectionId: i.connection_id,
        relayUrls: S,
        store: f
      })).success) throw new Error("The deletion could not reach enough relays. Please try again.");
      try {
        const l = r.buildDeletionRequest(o.event.id), u = new K(S);
        await u.publishAll(l), u.closeAll();
      } catch {
      }
      return {};
    }
    case "vaultOfferCheck": {
      const n = t, r = Le(), o = or(n.uri), { connections: i } = await bt(), s = i.find(
        (a) => a.record.connection_type === "nwc" && bs(a.record.credential, o)
      );
      return s ? s.record.application_binding.origin !== r ? { duplicate: !1 } : { duplicate: !0, connection: Ue(s) } : { duplicate: !1 };
    }
    default:
      throw new Error(`Unknown worker action: ${e}`);
  }
}
const fc = /* @__PURE__ */ new Set([
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
  if (typeof t.action != "string" || !fc.has(t.action)) {
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
  (r.startsWith("nip46") ? (s) => s() : (s) => lc.run(s))(() => pc(r, o)).then(
    (s) => {
      const a = { id: n, ok: !0, result: s };
      self.postMessage(a);
    },
    (s) => {
      const a = s instanceof Error ? s : new Error(String(s)), l = { id: n, ok: !1, error: a.message, errorName: a.name };
      self.postMessage(l);
    }
  );
});
