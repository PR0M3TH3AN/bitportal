import { K as li, b as ui, c as x, D as Cr, d as mt, w as _, f as Kt, g as Xe, h as En, S as Lt, j as Ut, k as De, l as at, B as yi, m as di, n as qt, o as Ze, q as _n, r as Pn, a as je, s as Nr, t as pi, u as fi } from "./bitlogin-shared-CDSZpiZ4.js";
import { g as E, s as L, v as C, b as Ce, a as O, f as Le, i as hi, j as vi, k as wi, l as gi, m as mi, n as $t, o as nr, p as Tr, q as bi, t as ki, w as Ei, x as yt, y as Mr, u as U, z as _i, A as St, B as Kn, C as Sn, D as Ir, E as Pi, d as T, e as I, F as An, G as Ki, H as xr, h as Rn, I as Or, J as Si, c as st, K as on, L as qe } from "./bitlogin-shared-Cj9s0_W_.js";
import { b as ct, r as z, c as Q, k as Ai, i as Se, w as dt, R as pt, T as jt, d as Gt, n as rr, t as Ri, m as Ci, N as an, e as or, g as ir, h as Dr, j as Ni, l as Ti } from "./bitlogin-shared-BASIqHEi.js";
import { x as me, y as Cn, z as sn, B as Mi, C as Ge, D as He, E as Je, F as te, G as Z, H as Lr, I as Ur, J as et, K as Nn, u as tt, c as Ii, r as Tn, m as Mn, f as At, L as ue, o as xi, M as Ht, N as Oi, O as Di, Q as Li, T as Ui, U as qi, V as Vi, X as Fi, Y as Wi, Z as Bi, _ as ar, $ as $i, a0 as ji, a1 as Gi, a2 as Hi, a3 as Ji, a4 as zi, a5 as Qi, d as Yi, i as Xi, a6 as Zi, a7 as ea, a8 as ta, a9 as na, aa as ra, ab as oa, ac as ia } from "./bitlogin-shared-BUDtZbQR.js";
import { a as nt, W as cn, E as ln, T as ze, r as qr, b as aa, l as sa, w as Vr, d as Fr, H as ca, e as la, f as ua } from "./bitlogin-shared-DkSVqQeC.js";
function Wr(e) {
  const t = E(e.privateKey);
  return L({
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
const Rt = 1e3, da = 262144;
function pa(e) {
  const t = Math.min(e.limit ?? Rt, Rt);
  return Math.max(50, t * 3);
}
const fa = 2048, ha = 1e4, va = 100;
function wa(e, t) {
  if (e.size >= fa) {
    const n = e.values().next().value;
    n !== void 0 && e.delete(n);
  }
  e.add(t);
}
class In {
  url;
  ws = null;
  connectPromise = null;
  subs = /* @__PURE__ */ new Map();
  pendingPublishes = /* @__PURE__ */ new Map();
  authPrivateKey;
  connectTimeoutMs;
  authenticated = !1;
  constructor(t, n = {}) {
    if (!ct(t))
      throw new Error("Relay URL must use secure WebSockets, except for an explicit loopback development endpoint.");
    this.url = t, this.authPrivateKey = n.authPrivateKey, this.connectTimeoutMs = n.connectTimeoutMs ?? 8e3;
  }
  async connect() {
    return this.connectPromise ? this.connectPromise : (this.connectPromise = new Promise((t, n) => {
      const r = ya(), o = new r(this.url);
      this.ws = o;
      const i = setTimeout(() => {
        n(new Error(`Timed out connecting to relay ${this.url}`));
      }, this.connectTimeoutMs);
      o.addEventListener("open", () => {
        clearTimeout(i);
        for (const [a, s] of this.subs)
          o.send(JSON.stringify(["REQ", a, s.filter]));
        t();
      }), o.addEventListener("error", () => {
        clearTimeout(i), n(new Error(`WebSocket error connecting to relay ${this.url}`));
      }), o.addEventListener("close", () => {
        this.connectPromise = null;
      }), o.addEventListener("message", (a) => {
        this.handleMessage(String(a.data));
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
    if (t.length > da)
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
      const [i, a] = o;
      if (typeof i != "string")
        return;
      const s = this.subs.get(i);
      if (!s)
        return;
      const c = a?.id;
      if (typeof c != "string" || s.seenIds.has(c))
        return;
      if (s.onEvent) {
        const y = Date.now();
        if (y - s.liveWindowStart >= ha && (s.liveWindowStart = y, s.liveVerifies = 0), s.liveVerifies >= va || (s.liveVerifies++, !C(a) || !sr(a, s.filter)))
          return;
        wa(s.seenIds, a.id), s.onEvent(a);
        return;
      }
      const u = Math.min(s.filter.limit ?? Rt, Rt);
      if (s.events.length >= u || s.verifyBudget <= 0 || (s.verifyBudget--, !C(a) || !sr(a, s.filter)))
        return;
      s.seenIds.add(a.id), s.events.push(a);
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
      const [i, a, s] = o;
      if (typeof i != "string" || typeof a != "boolean" || s !== void 0 && typeof s != "string")
        return;
      this.pendingPublishes.get(i)?.({ ok: a, message: s ?? "" }), this.pendingPublishes.delete(i);
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
      kind: ui,
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
      const a = [], s = (u) => {
        clearTimeout(c), this.subs.delete(r);
        try {
          this.send(["CLOSE", r]);
        } catch {
        }
        u ? i(u) : o(a);
      }, c = setTimeout(() => s(new Error("relay did not answer the subscription before the timeout")), n);
      this.subs.set(r, {
        events: a,
        seenIds: /* @__PURE__ */ new Set(),
        verifyBudget: pa(t),
        liveWindowStart: 0,
        liveVerifies: 0,
        filter: t,
        onEose: () => s()
      }), this.send(["REQ", r, t]);
    });
  }
}
function sr(e, t) {
  if (t.ids && !t.ids.some((n) => e.id.startsWith(n)) || t.authors && !t.authors.some((n) => e.pubkey.startsWith(n)) || t.kinds && !t.kinds.includes(e.kind) || t.since !== void 0 && e.created_at < t.since || t.until !== void 0 && e.created_at > t.until)
    return !1;
  for (const [n, r] of Object.entries(t)) {
    if (!n.startsWith("#") || !Array.isArray(r))
      continue;
    const o = n.slice(1), i = r;
    if (!e.tags.some((a) => a[0] === o && i.some((s) => s === (a[1] ?? ""))))
      return !1;
  }
  return !0;
}
class K {
  connections = /* @__PURE__ */ new Map();
  constructor(t, n = {}) {
    for (const r of new Set(t))
      this.connections.set(r, new In(r, n));
  }
  get relayUrls() {
    return [...this.connections.keys()];
  }
  /** Queries every configured relay and waits for a quorum of responses (or all timeouts) before returning (§16.2). */
  async queryQuorum(t, n = 8e3) {
    const r = [...this.connections.entries()], o = await Promise.all(r.map(async ([s, c]) => {
      try {
        const u = await c.queryOnce(t, n);
        return { relayUrl: s, events: u, responded: !0 };
      } catch (u) {
        return { relayUrl: s, events: [], responded: !1, error: u.message };
      }
    })), i = o.filter((s) => s.responded).length, a = o.length;
    return {
      outcomes: o,
      quorumMet: i >= Math.ceil(a / 2),
      respondedCount: i,
      totalCount: a
    };
  }
  /** Publishes an event to every configured relay, best-effort (§15.6, §24.4). */
  async publishAll(t, n = 8e3) {
    const r = [...this.connections.entries()];
    return Promise.all(r.map(async ([o, i]) => {
      try {
        const a = await i.publish(t, n);
        return { relayUrl: o, result: a };
      } catch (a) {
        return { relayUrl: o, result: { ok: !1, message: a.message } };
      }
    }));
  }
  closeAll() {
    for (const t of this.connections.values())
      t.close();
  }
}
function ce(e) {
  return e.filter((t) => t.result.ok).length;
}
const lt = null, Br = [
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
], $r = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  // Added 2026-11-18: relay.nostr.band timed out and nostr-pub.wellorder.net
  // never connected in the same measurement, leaving two working lookups.
  "wss://nos.lol"
], ga = [], ma = /^[0-9a-f]{64}$/u, ba = 64;
function Jt(e) {
  return Array.isArray(e) && e.length <= ba && e.every((t) => typeof t == "string" && ct(t)) && new Set(e).size === e.length;
}
function Vt(e, t = lt, n = -1) {
  if (!t || !ma.test(t) || /^0{64}$/u.test(t) || !C(e) || e.pubkey !== t || e.kind !== x || Le(e, "d") !== Cr)
    return null;
  try {
    const r = JSON.parse(e.content);
    if (typeof r != "object" || r === null || Array.isArray(r))
      return null;
    const o = r;
    return !Number.isSafeInteger(o.version) || o.version < 1 || o.version <= n || !Jt(o.vaultRelays) || !Jt(o.discoveryRelays) || o.deprecated !== void 0 && !Jt(o.deprecated) ? null : {
      version: o.version,
      vaultRelays: o.vaultRelays,
      discoveryRelays: o.discoveryRelays,
      ...o.deprecated === void 0 ? {} : { deprecated: o.deprecated }
    };
  } catch {
    return null;
  }
}
function ka(e) {
  return Math.max(0, e - 1);
}
function cr(e, t, n) {
  const r = t ? n === "vault" ? t.vaultRelays : t.discoveryRelays : [], o = new Set(t?.deprecated ?? []), i = new Set(e), a = [...new Set(r)].filter((s) => !o.has(s) && !i.has(s)).slice(0, ka(e.length));
  return [...e, ...a];
}
async function Ea(e, t = lt, n = -1, r = 6e3) {
  if (!t || e.length === 0)
    return null;
  const o = new K([...e]);
  let i;
  try {
    i = (await o.queryQuorum({ kinds: [x], authors: [t], "#d": [Cr], limit: 3 }, r)).outcomes.flatMap((c) => c.events);
  } finally {
    o.closeAll();
  }
  let a = null;
  for (const s of i) {
    const c = Vt(s, t, n);
    c && (!a || c.version > a.list.version) && (a = { event: s, list: c });
  }
  return a;
}
const jr = "bitlogin:bootstrap-relays:v1";
async function Gr(e, t = lt) {
  if (!t)
    return null;
  try {
    const n = await e.get(jr);
    return n ? Vt(JSON.parse(n), t) : null;
  } catch {
    return null;
  }
}
function bt(e) {
  return {
    vaultRelays: cr(Br, e, "vault"),
    discoveryRelays: cr($r, e, "discovery"),
    listVersion: e?.version ?? null
  };
}
async function _a(e, t = {}) {
  const n = t.maintainerPubkeyHex === void 0 ? lt : t.maintainerPubkeyHex, r = await Gr(e, n);
  if (!n)
    return bt(null);
  const o = bt(r), i = r?.version ?? -1;
  try {
    let a = await Ea(t.queryRelayUrls ?? [.../* @__PURE__ */ new Set([...o.vaultRelays, ...o.discoveryRelays])], n, i, t.timeoutMs);
    if (!a) {
      const s = await Pa(t.httpsFallbackUrls ?? ga, n, i), c = s ? Vt(s, n, i) : null;
      s && c && (a = { event: s, list: c });
    }
    return a ? (await e.set(jr, JSON.stringify(a.event)), bt(a.list)) : o;
  } catch {
    return o;
  }
}
async function Pa(e, t = lt, n = -1) {
  if (!t)
    return null;
  for (const r of e)
    try {
      if (new URL(r).protocol !== "https:")
        continue;
      const o = await fetch(r);
      if (!o.ok || Number(o.headers.get("content-length") ?? 0) > 1e6)
        continue;
      const a = await o.text();
      if (a.length > 1e6)
        continue;
      const s = JSON.parse(a);
      if (C(s) && Vt(s, t, n))
        return s;
    } catch {
    }
  return null;
}
const xn = /^[0-9a-f]{64}$/u, Ka = 8, Sa = 4096, Aa = 256, Ra = 512;
class _e extends Error {
  name = "BunkerUriParseError";
}
class Ca extends Error {
  name = "Nip46RequestTimeoutError";
  constructor(t, n) {
    super(`The remote signer did not answer ${t} within ${Math.round(n / 1e3)}s. It may be offline, or waiting for your approval on another device -- check your signer and try again.`);
  }
}
class Na extends Error {
  name = "Nip46ErrorResponse";
}
function Ta(e) {
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return null;
  }
  const n = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol === "https:" || t.protocol === "http:" && n ? t.toString() : null;
}
function Ma(e) {
  if (e.length > Sa)
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
  if (!xn.test(n))
    throw new _e("The bunker URI does not name a valid signer public key.");
  const r = [
    ...new Set(t.searchParams.getAll("relay").map((i) => i.trim()).filter((i) => i.length > 0 && i.length <= Ra))
  ].slice(0, Ka);
  if (r.length === 0)
    throw new _e("The bunker URI names no relays -- without at least one relay= parameter there is no way to reach the signer.");
  const o = t.searchParams.get("secret") ?? void 0;
  if (o && o.length > Aa)
    throw new _e("The bunker URI's secret is unreasonably long.");
  return { signerPubkey: n, relayUrls: r, secret: o || void 0 };
}
function Ia(e) {
  if (!xn.test(e.clientPubkey))
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
const xa = 12e4;
class lr {
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
    this.clientSecretKey = t.clientSecretKey, this.clientPubkey = E(t.clientSecretKey), this.pointer = t.pointer, this.conversationKey = me(t.clientSecretKey, t.pointer.signerPubkey), this.onAuthUrl = t.onAuthUrl, this.requestTimeoutMs = t.requestTimeoutMs ?? xa, this.conns = t.pointer.relayUrls.map((n) => new In(n, { authPrivateKey: t.clientSecretKey }));
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
        kinds: [mt],
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
      n = JSON.parse(Cn(this.conversationKey, t.content));
    } catch {
      return;
    }
    if (typeof n.id != "string")
      return;
    const r = this.pending.get(n.id);
    if (r) {
      if (n.result === "auth_url") {
        if (!r.authUrlSeen && typeof n.error == "string" && n.error) {
          const o = Ta(n.error);
          o && (r.authUrlSeen = !0, this.onAuthUrl?.(o));
        }
        return;
      }
      if (this.pending.delete(n.id), clearTimeout(r.timer), typeof n.error == "string" && n.error) {
        r.reject(new Na(n.error));
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
    const r = Ce(O(8)), o = sn(this.conversationKey, JSON.stringify({ id: r, method: t, params: n })), i = [["p", this.pointer.signerPubkey]], a = L({
      pubkey: this.clientPubkey,
      created_at: Math.floor(Date.now() / 1e3),
      kind: mt,
      tags: i,
      content: o
    }, this.clientSecretKey), s = new Promise((y, d) => {
      const h = setTimeout(() => {
        this.pending.delete(r), d(new Ca(t, this.requestTimeoutMs));
      }, this.requestTimeoutMs);
      this.pending.set(r, { resolve: y, reject: d, timer: h, authUrlSeen: !1 });
    });
    if (s.catch(() => {
    }), !(await Promise.allSettled(this.conns.map((y) => y.publish(a)))).some((y) => y.status === "fulfilled" && y.value.ok)) {
      const y = this.pending.get(r);
      throw y && (this.pending.delete(r), clearTimeout(y.timer)), new Error("No relay accepted the request to the signer.");
    }
    return s;
  }
  /** bunker:// flow: announce ourselves; any non-error answer is acceptance. */
  async connect() {
    await this.rpc("connect", [this.pointer.signerPubkey, this.pointer.secret ?? ""]);
  }
  async getUserPublicKey() {
    const t = (await this.rpc("get_public_key", [])).trim().toLowerCase();
    if (!xn.test(t))
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
      const t = Ce(O(8)), n = sn(this.conversationKey, JSON.stringify({ id: t, method: "logout", params: [] }));
      return L({
        pubkey: this.clientPubkey,
        created_at: Math.floor(Date.now() / 1e3),
        kind: mt,
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
async function Oa(e) {
  const t = E(e.clientSecretKey), n = e.timeoutMs, r = e.relayUrls.map((i) => new In(i, { authPrivateKey: e.clientSecretKey })), o = () => {
    for (const i of r)
      i.close();
  };
  return new Promise((i, a) => {
    let s = !1;
    const c = () => u(new Error("The signer-connection attempt was cancelled.")), u = (f) => {
      s || (s = !0, clearTimeout(y), e.signal?.removeEventListener("abort", c), o(), f instanceof Error ? a(f) : i(f));
    }, y = setTimeout(() => u(new Error(`No signer connected within ${Math.round(n / 1e3)}s. Scan or paste the connection code in your signer app, then try again.`)), n);
    if (e.signal?.aborted) {
      c();
      return;
    }
    e.signal?.addEventListener("abort", c, { once: !0 });
    const d = { kinds: [mt], "#p": [t] }, h = (f) => {
      let p, w = null;
      try {
        w = me(e.clientSecretKey, f.pubkey), p = JSON.parse(Cn(w, f.content));
      } catch {
        return;
      } finally {
        w && _(w);
      }
      p.result === e.secret && u({ signerPubkey: f.pubkey });
    };
    Promise.allSettled(r.map((f) => f.subscribeLive(d, h))).then((f) => {
      f.some((p) => p.status === "fulfilled") || u(new Error("Could not reach any relay to listen for the signer."));
    });
  });
}
function On() {
  const e = globalThis.crypto;
  if (!e || !e.subtle)
    throw new Error("WebCrypto SubtleCrypto is not available in this environment.");
  return e;
}
async function Hr(e) {
  if (e.length !== 32)
    throw new Error("AES-256-GCM key must be exactly 32 bytes.");
  return On().subtle.importKey("raw", e, "AES-GCM", !1, ["encrypt", "decrypt"]);
}
async function Jr(e, t, n) {
  const r = hi(), o = await Hr(e), i = await On().subtle.encrypt({ name: "AES-GCM", iv: r, additionalData: n, tagLength: 128 }, o, t);
  return { nonce: r, ciphertext: new Uint8Array(i) };
}
async function zr(e, t, n, r) {
  const o = await Hr(e);
  try {
    const i = await On().subtle.decrypt({ name: "AES-GCM", iv: t, additionalData: r, tagLength: 128 }, o, n);
    return new Uint8Array(i);
  } catch {
    throw new Error("AES-256-GCM authentication failed: capsule is corrupted, tampered, or the wrong key was used.");
  }
}
const Qr = `abandon
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
function Da(e, t, n, r) {
  gi(e);
  const o = mi({ dkLen: 32, asyncTick: 10 }, r), { c: i, dkLen: a, asyncTick: s } = o;
  if ($t(i), $t(a), $t(s), i < 1)
    throw new Error("iterations (c) should be >= 1");
  const c = nr(t), u = nr(n), y = new Uint8Array(a), d = Tr.create(e, c), h = d._cloneInto().update(u);
  return { c: i, dkLen: a, asyncTick: s, DK: y, PRF: d, PRFSalt: h };
}
function La(e, t, n, r, o) {
  return e.destroy(), t.destroy(), r && r.destroy(), bi(o), n;
}
async function Ua(e, t, n, r) {
  const { c: o, dkLen: i, asyncTick: a, DK: s, PRF: c, PRFSalt: u } = Da(e, t, n, r);
  let y;
  const d = new Uint8Array(4), h = vi(d), f = new Uint8Array(c.outputLen);
  for (let p = 1, w = 0; w < i; p++, w += c.outputLen) {
    const g = s.subarray(w, w + c.outputLen);
    h.setInt32(0, p, !1), (y = u._cloneInto(y)).update(d).digestInto(f), g.set(f.subarray(0, g.length)), await wi(o - 1, a, () => {
      c._cloneInto(y).update(f).digestInto(f);
      for (let m = 0; m < g.length; m++)
        g[m] ^= f[m];
    });
  }
  return La(c, u, s, y, f);
}
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const qa = (e) => e[0] === "あいこくしん";
function Yr(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function Xr(e) {
  const t = Yr(e), n = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(n.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: n };
}
function Zr(e) {
  Ei(e, 16, 20, 24, 28, 32);
}
const Va = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([Mr(e)[0] >> t << t]);
};
function eo(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), yt.chain(yt.checksum(1, Va), yt.radix2(11, !0), yt.alphabet(e));
}
function Fa(e, t) {
  const { words: n } = Xr(e), r = eo(t).decode(n);
  return Zr(r), r;
}
function Wa(e, t) {
  return Zr(e), eo(t).encode(e).join(qa(t) ? "　" : " ");
}
function Ba(e, t) {
  try {
    Fa(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const $a = (e) => Yr("mnemonic" + e);
function ja(e, t = "") {
  return Ua(ki, Xr(e).nfkd, $a(t), { c: 2048, dkLen: 64 });
}
function Ga(e) {
  if (e.length !== 16)
    throw new Error("Recovery phrase entropy must be exactly 128 bits (16 bytes).");
  return Wa(e, Qr);
}
function to(e) {
  try {
    return Ba(no(e), Qr);
  } catch {
    return !1;
  }
}
function no(e) {
  return e.trim().normalize("NFKD").toLowerCase().split(/\s+/u).join(" ");
}
async function Dn(e) {
  return ja(no(e), "");
}
const kt = [1024, 2048, 4096], we = 4;
function Ha(e) {
  const t = we + e.length, n = kt.find((i) => i >= t);
  if (n === void 0)
    throw new Error(`Payload of ${e.length} bytes exceeds the largest padding bucket (${kt[kt.length - 1]} bytes minus ${we}-byte length prefix).`);
  const r = new Uint8Array(n);
  return new DataView(r.buffer).setUint32(0, e.length, !1), r.set(e, we), r;
}
function Ja(e) {
  if (!kt.includes(e.length))
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
function za(e) {
  const t = _i(e);
  if (t === void 0)
    throw new Error("Value is not JSON-serializable for canonicalization.");
  return t;
}
function Qa(e) {
  return U(za(e));
}
const le = 16, Ya = 283;
function Xa(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function Ln(e) {
  return e << 1 ^ Ya & -(e >> 7);
}
function Ae(e, t) {
  let n = 0;
  for (; t > 0; t >>= 1)
    n ^= e & -(t & 1), e = Ln(e);
  return n;
}
const un = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let n = 0, r = 1; n < 256; n++, r ^= Ln(r))
    e[n] = r;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let n = 0; n < 255; n++) {
    let r = e[255 - n];
    r |= r << 8, t[e[n]] = (r ^ r >> 4 ^ r >> 5 ^ r >> 6 ^ r >> 7 ^ 99) & 255;
  }
  return et(e), t;
})(), Za = /* @__PURE__ */ un.map((e, t) => un.indexOf(t)), es = (e) => e << 24 | e >>> 8, zt = (e) => e << 8 | e >>> 24;
function ro(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const n = new Uint32Array(256).map((u, y) => t(e[y])), r = n.map(zt), o = r.map(zt), i = o.map(zt), a = new Uint32Array(256 * 256), s = new Uint32Array(256 * 256), c = new Uint16Array(256 * 256);
  for (let u = 0; u < 256; u++)
    for (let y = 0; y < 256; y++) {
      const d = u * 256 + y;
      a[d] = n[u] ^ r[y], s[d] = o[u] ^ i[y], c[d] = e[u] << 8 | e[y];
    }
  return { sbox: e, sbox2: c, T0: n, T1: r, T2: o, T3: i, T01: a, T23: s };
}
const Un = /* @__PURE__ */ ro(un, (e) => Ae(e, 3) << 24 | e << 16 | e << 8 | Ae(e, 2)), oo = /* @__PURE__ */ ro(Za, (e) => Ae(e, 11) << 24 | Ae(e, 13) << 16 | Ae(e, 9) << 8 | Ae(e, 14)), ts = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, n = 1; t < 16; t++, n = Ln(n))
    e[t] = n;
  return e;
})();
function io(e) {
  Nn(e);
  const t = e.length;
  Xa(e);
  const { sbox2: n } = Un, r = [];
  (!Ge || !He(e)) && r.push(e = Je(e));
  const o = Z(te(e)), i = o.length, a = (c) => $(n, c, c, c, c), s = new Uint32Array(t + 28);
  s.set(o);
  for (let c = i; c < s.length; c++) {
    let u = s[c - 1];
    c % i === 0 ? u = a(es(u)) ^ ts[c / i - 1] : i > 6 && c % i === 4 && (u = a(u)), s[c] = s[c - i] ^ u;
  }
  return et(...r), s;
}
function ns(e) {
  const t = io(e), n = t.slice(), r = t.length, { sbox2: o } = Un, { T0: i, T1: a, T2: s, T3: c } = oo;
  for (let u = 0; u < r; u += 4)
    for (let y = 0; y < 4; y++)
      n[u + y] = t[r - u - 4 + y];
  et(t);
  for (let u = 4; u < r - 4; u++) {
    const y = n[u], d = $(o, y, y, y, y);
    n[u] = i[d & 255] ^ a[d >>> 8 & 255] ^ s[d >>> 16 & 255] ^ c[d >>> 24];
  }
  return n;
}
function ne(e, t, n, r, o, i) {
  return e[n << 8 & 65280 | r >>> 8 & 255] ^ t[o >>> 8 & 65280 | i >>> 24 & 255];
}
function $(e, t, n, r, o) {
  return e[t & 255 | n & 65280] | e[r >>> 16 & 255 | o >>> 16 & 65280] << 16;
}
function ur(e, t, n, r, o) {
  const { sbox2: i, T01: a, T23: s } = Un;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const u = e.length / 4 - 2;
  for (let p = 0; p < u; p++) {
    const w = e[c++] ^ ne(a, s, t, n, r, o), g = e[c++] ^ ne(a, s, n, r, o, t), m = e[c++] ^ ne(a, s, r, o, t, n), k = e[c++] ^ ne(a, s, o, t, n, r);
    t = w, n = g, r = m, o = k;
  }
  const y = e[c++] ^ $(i, t, n, r, o), d = e[c++] ^ $(i, n, r, o, t), h = e[c++] ^ $(i, r, o, t, n), f = e[c++] ^ $(i, o, t, n, r);
  return { s0: y, s1: d, s2: h, s3: f };
}
function rs(e, t, n, r, o) {
  const { sbox2: i, T01: a, T23: s } = oo;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const u = e.length / 4 - 2;
  for (let p = 0; p < u; p++) {
    const w = e[c++] ^ ne(a, s, t, o, r, n), g = e[c++] ^ ne(a, s, n, t, o, r), m = e[c++] ^ ne(a, s, r, n, t, o), k = e[c++] ^ ne(a, s, o, r, n, t);
    t = w, n = g, r = m, o = k;
  }
  const y = e[c++] ^ $(i, t, o, r, n), d = e[c++] ^ $(i, n, t, o, r), h = e[c++] ^ $(i, r, n, t, o), f = e[c++] ^ $(i, o, r, n, t);
  return { s0: y, s1: d, s2: h, s3: f };
}
function os(e) {
  if (Nn(e), e.length % le !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + le);
}
function is(e, t, n) {
  Nn(e);
  let r = e.length;
  const o = r % le;
  if (!t && o !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (t) {
    let s = le - o;
    s || (s = le), r = r + s;
  }
  n = Lr(r, n), Ur(e, n), (!Ge || !He(e)) && (e = Je(e));
  const i = te(e);
  Z(i);
  const a = te(n);
  return { b: i, o: a, out: n };
}
function as(e, t) {
  if (!t)
    return e;
  const n = e.length;
  if (n === 0)
    throw new Error("aes/pkcs7: empty ciphertext not allowed");
  const r = e[n - 1];
  let o = 1;
  o &= r - 1 >>> 31 ^ 1, o &= 16 - r >>> 31 ^ 1;
  for (let i = 0; i < 16; i++) {
    const a = i - r >>> 31, s = (e[n - 1 - i] ^ r) === 0 ? 1 : 0;
    o &= s | a ^ 1;
  }
  if (!o)
    throw new Error("aes/pkcs7: wrong padding");
  return e.subarray(0, n - r);
}
function ss(e) {
  const t = new Uint8Array(16), n = te(t);
  t.set(e);
  const r = le - e.length;
  for (let o = le - r; o < le; o++)
    t[o] = r;
  return n;
}
const ao = /* @__PURE__ */ Mi({ blockSize: 16, nonceLength: 16 }, function(t, n, r = {}) {
  const o = !r.disablePadding;
  return {
    encrypt(i, a) {
      const s = io(t), { b: c, o: u, out: y } = is(i, o, a);
      let d = n;
      const h = [s];
      (!Ge || !He(d)) && h.push(d = Je(d));
      const f = te(d);
      Z(f);
      let p = f[0], w = f[1], g = f[2], m = f[3], k = 0;
      for (; k + 4 <= c.length; )
        p ^= c[k + 0], w ^= c[k + 1], g ^= c[k + 2], m ^= c[k + 3], { s0: p, s1: w, s2: g, s3: m } = ur(s, p, w, g, m), u[k++] = p, u[k++] = w, u[k++] = g, u[k++] = m;
      if (o) {
        const b = ss(i.subarray(k * 4));
        Z(b), p ^= b[0], w ^= b[1], g ^= b[2], m ^= b[3], { s0: p, s1: w, s2: g, s3: m } = ur(s, p, w, g, m), u[k++] = p, u[k++] = w, u[k++] = g, u[k++] = m;
      }
      return Z(u), et(...h), y;
    },
    decrypt(i, a) {
      os(i);
      const s = ns(t);
      let c = n;
      const u = [s];
      (!Ge || !He(c)) && u.push(c = Je(c));
      const y = te(c);
      Z(y), a = Lr(i.length, a), Ur(i, a), (!Ge || !He(i)) && u.push(i = Je(i));
      const d = te(i), h = te(a);
      Z(d);
      let f = y[0], p = y[1], w = y[2], g = y[3];
      for (let m = 0; m + 4 <= d.length; ) {
        const k = f, b = p, P = w, M = g;
        f = d[m + 0], p = d[m + 1], w = d[m + 2], g = d[m + 3];
        const { s0: q, s1: Y, s2: pe, s3: Wt } = rs(s, f, p, w, g);
        h[m++] = q ^ k, h[m++] = Y ^ b, h[m++] = pe ^ P, h[m++] = Wt ^ M;
      }
      return Z(h), et(...u), as(a, o);
    }
  };
});
function so(e, t) {
  const n = Sn(new Uint8Array([2]), Ir(t));
  return Pi.getSharedSecret(e, n, !0).slice(1, 33);
}
function cs(e, t, n) {
  return ls(e, t, n, O(16));
}
function ls(e, t, n, r) {
  if (r.length !== 16)
    throw new Error("NIP-04 iv must be exactly 16 bytes.");
  const o = so(e, t), i = ao(o, r).encrypt(U(n));
  return `${St.encode(i)}?iv=${St.encode(r)}`;
}
function us(e, t, n) {
  const r = n.indexOf("?iv=");
  if (r === -1)
    throw new Error('NIP-04 payload is missing its "?iv=" suffix.');
  const o = St.decode(n.slice(0, r)), i = St.decode(n.slice(r + 4)), a = so(e, t), s = ao(a, i).decrypt(o);
  return Kn(s);
}
class ke extends Error {
  reason;
  constructor(t) {
    super("Account not found or credentials incorrect."), this.name = "AccountNotFoundError", this.reason = t;
  }
}
class re extends Error {
  constructor(t) {
    super(t), this.name = "RegistrationFailedError";
  }
}
class co extends Error {
  constructor(t = "An account already exists with this login name and password. Sign in instead, or choose different credentials.") {
    super(t), this.name = "AccountAlreadyExistsError";
  }
}
class oe extends Error {
  constructor(t) {
    super(t), this.name = "RecoveryFailedError";
  }
}
class lo extends Error {
  seenGeneration;
  capsuleGeneration;
  constructor(t, n) {
    super(`This credential capsule reports generation ${n}, but this device has already seen generation ${t}. Refusing to log in with older, possibly-revoked credentials.`), this.name = "RollbackDetectedError", this.seenGeneration = t, this.capsuleGeneration = n;
  }
}
function rt(e, t) {
  const n = t ?? Math.floor(Date.now() / 1e3);
  return e == null ? n : Math.max(n, e + 1);
}
const ys = { generation: -1, recoveryGeneration: -1 };
function qn(e) {
  return `bitlogin:hwm:${e}`;
}
async function Vn(e, t) {
  const n = await e.get(qn(t));
  return n ? JSON.parse(n) : ys;
}
async function uo(e, t, n) {
  const r = await Vn(e, t), o = {
    generation: Math.max(r.generation, n.generation ?? -1),
    recoveryGeneration: Math.max(r.recoveryGeneration, n.recoveryGeneration ?? -1)
  };
  return await e.set(qn(t), JSON.stringify(o)), o;
}
async function ds(e, t, n = { generation: 0, recoveryGeneration: -1 }) {
  await e.set(qn(t), JSON.stringify(n));
}
function ps(e, t, n) {
  return L({ pubkey: E(e), created_at: n, kind: Kt, tags: [], content: JSON.stringify(t) }, e);
}
function fs(e, t, n) {
  const r = t.map((o) => {
    const i = ["r", o.url];
    return o.read && !o.write && i.push("read"), o.write && !o.read && i.push("write"), i;
  });
  return L({ pubkey: E(e), created_at: n, kind: Xe, tags: r, content: "" }, e);
}
function hs(e, t, n) {
  return L({
    pubkey: E(e),
    created_at: n,
    kind: En,
    tags: t.map((r) => ["relay", r]),
    content: ""
  }, e);
}
function vs(e) {
  return e.tags.filter((t) => t[0] === "r" && t[1]).map((t) => t[1]);
}
function ws(e) {
  return e.tags.filter((t) => t[0] === "relay" && t[1]).map((t) => t[1]);
}
async function gs(e) {
  const t = E(e.everydayPrivateKey), n = Math.floor(Date.now() / 1e3), r = [.../* @__PURE__ */ new Set([...e.generalRelays, ...e.dmRelays, ...e.discoveryRelays])], o = new K(r), [i, a, s] = await Promise.all([
    o.queryQuorum({ authors: [t], kinds: [Kt] }),
    o.queryQuorum({ authors: [t], kinds: [Xe] }),
    o.queryQuorum({ authors: [t], kinds: [En] })
  ]);
  o.closeAll();
  const c = i.outcomes.some((g) => g.events.length > 0), u = a.outcomes.some((g) => g.events.length > 0), y = s.outcomes.some((g) => g.events.length > 0), d = new K(r);
  let h = null, f = null, p = null;
  const w = [];
  if (!c && (e.name || e.about || e.picture)) {
    const g = ps(e.everydayPrivateKey, { name: e.name, about: e.about, picture: e.picture }, n);
    w.push(d.publishAll(g).then((m) => void (h = m)));
  }
  if (!u) {
    const g = fs(e.everydayPrivateKey, e.generalRelays.map((m) => ({ url: m, read: !0, write: !0 })), n);
    w.push(d.publishAll(g).then((m) => void (f = m)));
  }
  if (!y) {
    const g = hs(e.everydayPrivateKey, e.dmRelays, n);
    w.push(d.publishAll(g).then((m) => void (p = m)));
  }
  return await Promise.all(w), d.closeAll(), {
    profilePublished: h !== null && ce(h) > 0,
    relayListAcknowledgedCount: f !== null ? ce(f) : 0,
    dmRelayListAcknowledgedCount: p !== null ? ce(p) : 0,
    profileSkippedExisting: c,
    relayListSkippedExisting: u,
    dmRelayListSkippedExisting: y
  };
}
async function Ee(e, t, n) {
  const r = n.minAcks ?? 2, o = n.minReadbacks ?? 2, i = await e.publishAll(t, n.timeoutMs), a = ce(i), c = (await e.queryQuorum({ kinds: [x], authors: [t.pubkey], "#d": [n.dTag], limit: 5 }, n.timeoutMs)).outcomes.filter((u) => u.events.some((y) => y.id === t.id)).length;
  return {
    acknowledgedCount: a,
    readbackVerifiedCount: c,
    success: a >= r && c >= o
  };
}
function yo(e) {
  return U(`bitlogin|password-capsule|v1|${e}|30078|bitlogin:password:v1`);
}
function po(e) {
  return U(`bitlogin|recovery-capsule|v1|${e}|30078|bitlogin:recovery:v1`);
}
async function Fn(e, t, n) {
  const r = Qa(e), o = Ha(r), i = await Jr(t, o, n);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    nonce: T(i.nonce),
    ciphertext: T(i.ciphertext)
  };
}
async function Wn(e, t, n) {
  if (e.version !== 1 || e.algorithm !== "aes-256-gcm")
    throw new Error(`Unsupported capsule envelope version/algorithm: ${e.version}/${e.algorithm}`);
  const r = I(e.nonce), o = I(e.ciphertext), i = await zr(t, r, o, n), a = Ja(i);
  return JSON.parse(Kn(a));
}
class Bn extends Error {
  constructor(t) {
    super(t), this.name = "CapsuleValidationError";
  }
}
const ms = 1e6, bs = /^[0-9a-f]{64}$/u;
function N(e, t) {
  if (!e)
    throw new Bn(t);
}
function Ct(e) {
  return typeof e == "string" && bs.test(e);
}
function fo(e) {
  N(Array.isArray(e), "vault_relay_hints must be an array (§12.4.7).");
  for (const t of e)
    N(typeof t == "string", "Each relay hint must be a string (§12.4.7)."), N(ct(t), `Relay URL must use secure WebSockets, except for an explicit loopback development endpoint (§12.4.7): ${t}`);
}
function ho(e) {
  N(typeof e == "string", "account_id must be a string (§12.4.2).");
  let t;
  try {
    t = I(e);
  } catch {
    throw new Bn("account_id is not valid base64url (§12.4.2).");
  }
  N(t.length === 16, "account_id must decode to exactly 128 bits (§12.4.2).");
}
function vo(e, t) {
  N(typeof e == "string", "operational_private_key must be a string (§12.4.3).");
  const n = I(e);
  N(n.length === 32, "operational_private_key must be exactly 32 bytes (§12.4.3)."), N(An(n), "operational_private_key is not a valid secp256k1 scalar (§12.4.3)."), N(Ct(t), "operational_public_key must be lowercase 64-char hex (§12.4.4).");
  const r = E(n);
  N(r === t, "operational_public_key does not match the derived public key (§12.4.4).");
}
function Nt(e, t) {
  N(typeof t == "string", `${e} must be a string (§CV5.2).`);
  let n;
  try {
    n = I(t);
  } catch {
    throw new Bn(`${e} is not valid base64url (§CV5.2).`);
  }
  N(n.length === 32, `${e} must decode to exactly 32 bytes (§CV5.2).`);
}
function ks(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (N(t !== void 0 && n !== void 0, "connection_vault_root and vault_sudo_key must appear together (§CV5.2)."), Nt("connection_vault_root", t), Nt("vault_sudo_key", n));
}
function Es(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (N(t !== void 0, "vault_sudo_key cannot appear without connection_vault_root (§CV5.2)."), Nt("connection_vault_root", t), n !== void 0 && Nt("vault_sudo_key", n));
}
function wo(e, t) {
  N(Number.isInteger(e) && e >= 0 && e <= ms, `${t} is out of supported bounds (§12.4.8).`);
}
function _s(e) {
  N(e.schema === Ut, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), ho(e.account_id), wo(e.generation, "generation"), vo(e.operational_private_key, e.operational_public_key), N(Ct(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex (§12.4.5)."), fo(e.vault_relay_hints), Es(e);
  const t = e.recovery_capsule_event;
  N(!!t && typeof t == "object", "recovery_capsule_event must be present (§12.4.6)."), N(C(t), "Embedded recovery_capsule_event has an invalid event id or signature (§12.4.6)."), N(t.pubkey === e.recovery_public_key, "Embedded recovery_capsule_event author does not match recovery_public_key (§12.4.5).");
}
function Ps(e) {
  N(e.schema === Lt, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), ho(e.account_id), wo(e.recovery_generation, "recovery_generation"), N(e.previous_recovery_event_id === null || Ct(e.previous_recovery_event_id), "previous_recovery_event_id must be null or lowercase 64-char hex (§12.3)."), vo(e.operational_private_key, e.operational_public_key), N(Ct(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex."), fo(e.vault_relay_hints), ks(e);
}
function Ks(e) {
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
async function $n(e) {
  const t = E(e.locatorPrivateKey), n = await Fn(e.payload, e.capsuleKey, yo(t));
  return L({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: x,
    tags: [["d", De]],
    content: JSON.stringify(n)
  }, e.locatorPrivateKey);
}
function Ss(e) {
  const t = E(e.oldLocatorPrivateKey);
  return L({
    pubkey: t,
    created_at: e.createdAt,
    kind: x,
    tags: [["d", De]],
    content: ""
  }, e.oldLocatorPrivateKey);
}
async function As(e, t) {
  if (!C(e))
    throw new Error("Credential capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await Wn(n, t, yo(e.pubkey));
  return _s(r), r;
}
async function jn(e) {
  const t = E(e.recoveryPrivateKey), n = await Fn(e.payload, e.capsuleKey, po(t));
  return L({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: x,
    tags: [["d", at]],
    content: JSON.stringify(n)
  }, e.recoveryPrivateKey);
}
async function go(e, t) {
  if (!C(e))
    throw new Error("Recovery capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await Wn(n, t, po(e.pubkey));
  return Ps(r), r;
}
function yr(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  for (const o of e)
    o.pubkey === t && o.kind === x && Le(o, "d") === n && C(o) && r.set(o.id, o);
  return [...r.values()].sort((o, i) => i.created_at - o.created_at);
}
async function mo(e, t, n, r, o) {
  const i = await e.queryQuorum({ kinds: [x], authors: [t], "#d": [n], limit: 5 }, o), a = i.outcomes.flatMap((h) => h.events), s = yr(a, t, n), c = [];
  for (const h of s)
    try {
      const f = await r(h);
      c.push({ event: h, payload: f });
    } catch (f) {
      c.push({ event: h, payload: null, error: f.message });
    }
  const u = c.find((h) => h.payload !== null) ?? null, y = i.outcomes.map((h) => ({
    responded: h.responded,
    events: yr(h.events, t, n)
  })).filter((h) => h.responded && h.events.length > 0).map((h) => h.events[0].id), d = new Set(y).size > 1;
  return {
    quorumMet: i.quorumMet,
    respondedCount: i.respondedCount,
    totalCount: i.totalCount,
    candidates: c,
    best: u,
    relayDisagreement: d
  };
}
async function ot(e, t, n, r = 8e3) {
  return mo(e, t, De, (o) => As(o, n), r);
}
async function bo(e, t, n, r = 8e3) {
  return mo(e, t, at, (o) => go(o, n), r);
}
function Rs(e) {
  const t = e.filter((n) => n.payload !== null);
  return t.length < 2 ? { consistent: !0 } : Ks(t.map((n) => ({
    eventId: n.event.id,
    recoveryGeneration: n.payload.recovery_generation,
    previousRecoveryEventId: n.payload.previous_recovery_event_id
  })));
}
async function dr(e) {
  const t = [...new Set(e.relayUrls)], n = async (s) => {
    const c = new K(t);
    try {
      const u = await c.publishAll(s, e.timeoutMs);
      return new Map(u.map((y) => [
        y.relayUrl,
        { ok: y.result.ok, message: y.result.message ?? "" }
      ]));
    } finally {
      c.closeAll();
    }
  }, [r, o] = await Promise.all([
    n(e.credentialEvent),
    n(e.recoveryEvent)
  ]), i = { ok: !1, message: "no reply" }, a = t.map((s) => ({
    relayUrl: s,
    credential: r.get(s) ?? i,
    recovery: o.get(s) ?? i
  }));
  return {
    credentialAcknowledgedCount: a.filter((s) => s.credential.ok).length,
    recoveryAcknowledgedCount: a.filter((s) => s.recovery.ok).length,
    relaysTried: a.length,
    relays: a
  };
}
function Cs(e) {
  const t = Le(e, "d");
  if (e.kind !== x || t === void 0 || !C(e))
    throw new Error("This session's capsule event is not a valid capsule.");
  return { pubkey: e.pubkey, dTag: t };
}
function Ns(e, t, n) {
  const r = e.filter((i) => i.pubkey === n.pubkey && i.kind === x && Le(i, "d") === n.dTag && C(i));
  return r.some((i) => i.id === t.id) ? "current" : r.length === 0 ? "missing" : Math.max(...r.map((i) => i.created_at)) >= t.created_at ? "newer" : "older";
}
async function pr(e, t, n) {
  const r = Cs(t), o = new K(e);
  try {
    const i = await o.queryQuorum({
      kinds: [x],
      authors: [r.pubkey],
      "#d": [r.dTag],
      limit: 5
    }, n);
    return new Map(i.outcomes.map((a) => [
      a.relayUrl,
      a.responded ? { status: Ns(a.events, t, r) } : { status: "unreachable", error: a.error }
    ]));
  } finally {
    o.closeAll();
  }
}
async function Ts(e) {
  const t = [...new Set(e.relayUrls)], [n, r] = await Promise.all([
    pr(t, e.credentialEvent, e.timeoutMs),
    pr(t, e.recoveryEvent, e.timeoutMs)
  ]), o = t.map((i) => {
    const a = n.get(i) ?? { status: "unreachable" }, s = r.get(i) ?? { status: "unreachable" }, c = a.error ?? s.error;
    return {
      relayUrl: i,
      credential: a.status,
      recovery: s.status,
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
const Gn = yi.id, Ne = "aes-256-gcm-v1", Te = "bitlogin-bip39-hkdf-v1", ko = "bitlogin-recovery-hkdf-v1", Ms = 4, Is = 64;
function Me(e) {
  return [...new Set(e)].filter((t) => t.length <= Is).slice(0, Ms);
}
function Ie(e) {
  return e ? { everyday_derivation: ko } : {};
}
function Eo(e) {
  return e.protocol?.everyday_derivation === ko;
}
async function _o(e) {
  const t = qt(e.loginName), n = e.now ?? Math.floor(Date.now() / 1e3), { locatorPrivateKey: r, capsuleKey: o } = await Ze(e.password, t);
  try {
    const i = E(r), a = new K(e.vaultRelayUrls, {
      authPrivateKey: r
    });
    let s;
    try {
      s = await ot(a, i, o, e.timeoutMs);
    } finally {
      a.closeAll();
    }
    if (!s.quorumMet)
      throw new re("Couldn't verify this login name and password aren't already registered. Please retry, or add more vault relays.");
    if (s.candidates.length > 0)
      throw new co();
    const c = e.everydayPrivateKey !== void 0;
    if (c && !An(e.everydayPrivateKey))
      throw new re("The provided key is not a valid secp256k1 private key.");
    const u = Ga(Ki()), y = await Dn(u);
    let d, h, f;
    try {
      ({ recoveryPrivateKey: d, capsuleKey: h } = _n(y)), f = c ? e.everydayPrivateKey : Pn(y);
    } finally {
      _(y);
    }
    const p = !c, w = O(32), g = O(32);
    let m = !1;
    try {
      const k = E(d), b = E(f), P = T(xr()), M = {
        schema: Lt,
        account_id: P,
        recovery_generation: 0,
        previous_recovery_event_id: null,
        operational_private_key: T(f),
        operational_public_key: b,
        recovery_public_key: k,
        connection_vault_root: T(w),
        vault_sudo_key: T(g),
        created_at: n,
        vault_relay_hints: Me(e.vaultRelayUrls),
        protocol: {
          capsule_encryption: Ne,
          recovery_derivation: Te,
          ...Ie(p)
        }
      }, q = await jn({
        recoveryPrivateKey: d,
        capsuleKey: h,
        payload: M
      }), Y = new K(e.vaultRelayUrls, {
        authPrivateKey: d
      });
      let pe;
      try {
        pe = await Ee(Y, q, {
          dTag: at,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        Y.closeAll();
      }
      if (!pe.success)
        throw new re("The recovery capsule did not reach the required relay acknowledgement and readback quorum. No login credential was published. Please retry, or add more vault relays.");
      const Wt = {
        schema: Ut,
        account_id: P,
        generation: 0,
        operational_private_key: T(f),
        operational_public_key: b,
        recovery_public_key: k,
        recovery_capsule_event: q,
        connection_vault_root: T(w),
        created_at: n,
        vault_relay_hints: Me(e.vaultRelayUrls),
        protocol: {
          password_kdf: Gn,
          capsule_encryption: Ne,
          recovery_derivation: Te,
          ...Ie(p)
        }
      }, er = await $n({
        locatorPrivateKey: r,
        capsuleKey: o,
        payload: Wt
      }), tr = new K(e.vaultRelayUrls, {
        authPrivateKey: r
      });
      let Bt;
      try {
        Bt = await Ee(tr, er, {
          dTag: De,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        tr.closeAll();
      }
      if (!Bt.success)
        throw new re("Registration did not reach the required credential acknowledgement and readback quorum. Please retry, or add more vault relays.");
      return m = !0, {
        normalizedLoginName: t,
        recoveryPhrase: u,
        everydayPrivateKey: f,
        everydayPublicKey: b,
        recoveryPublicKey: k,
        locatorPublicKey: i,
        accountId: P,
        imported: c,
        everydayKeyDerived: p,
        connectionVaultRoot: w,
        vaultSudoKey: g,
        credentialEvent: er,
        recoveryEvent: q,
        credentialPublish: Bt,
        recoveryPublish: pe
      };
    } finally {
      _(d, h), m || (c || _(f), _(w, g));
    }
  } finally {
    _(r, o);
  }
}
async function xs(e) {
  const { nsecOrHex: t, ...n } = e, r = Po(t);
  return _o({ ...n, everydayPrivateKey: r });
}
function Po(e) {
  const t = e.trim();
  let n;
  if (t.startsWith("nsec1"))
    n = di(t);
  else if (/^[0-9a-fA-F]{64}$/u.test(t))
    n = Ir(t.toLowerCase());
  else
    throw new re("Enter a valid nsec (nsec1…) or a 64-character hex private key.");
  if (!An(n))
    throw new re("The provided key is not a valid secp256k1 private key.");
  return n;
}
class Ko {
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
async function Os(e) {
  const t = qt(e.loginName), { locatorPrivateKey: n, capsuleKey: r } = await Ze(e.password, t), o = E(n), i = new K(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  try {
    const a = await ot(i, o, r, e.timeoutMs);
    if (!a.quorumMet)
      throw new ke("quorum-not-met");
    if (!a.best)
      throw new ke(a.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
    const s = a.best.payload, c = e.store ?? new Ko(), u = await Vn(c, s.operational_public_key), y = s.generation < u.generation;
    if (y && !e.acknowledgeRollback)
      throw new lo(u.generation, s.generation);
    const d = y ? `This device previously saw credential generation ${u.generation}, but the accepted capsule is generation ${s.generation}. Relays may be serving stale data, or an old capsule is being replayed.` : void 0;
    await uo(c, s.operational_public_key, {
      generation: s.generation
    });
    const h = a.relayDisagreement ? 'Configured relays returned different credential capsules as "latest" for this account. Some relays may be stale, censored, or malicious.' : void 0;
    return {
      everydayPrivateKey: I(s.operational_private_key),
      everydayPublicKey: s.operational_public_key,
      recoveryPublicKey: s.recovery_public_key,
      accountId: s.account_id,
      generation: s.generation,
      everydayKeyDerived: Eo(s),
      credentialEvent: a.best.event,
      recoveryCapsuleEvent: s.recovery_capsule_event,
      connectionVaultRoot: s.connection_vault_root ? I(s.connection_vault_root) : void 0,
      rollbackWarning: d,
      relayDisagreementWarning: h
    };
  } finally {
    i.closeAll();
  }
}
function fr(e) {
  return e.filter((t) => C(t)).sort((t, n) => n.created_at - t.created_at)[0];
}
async function Ds(e) {
  if (!to(e.phrase))
    throw new oe("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await Dn(e.phrase), { recoveryPrivateKey: n, capsuleKey: r } = _n(t), o = Pn(t), i = E(o);
  _(t, o);
  const a = E(n), s = new K(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  let c;
  try {
    c = await bo(s, a, r, e.timeoutMs);
  } finally {
    s.closeAll();
  }
  if (e.offlineRecoveryCapsuleEvents?.length) {
    const w = [];
    for (const b of e.offlineRecoveryCapsuleEvents)
      if (C(b))
        try {
          w.push({
            event: b,
            payload: await go(b, r)
          });
        } catch (P) {
          w.push({
            event: b,
            payload: null,
            error: P.message
          });
        }
    const g = /* @__PURE__ */ new Map();
    for (const b of [...c.candidates, ...w])
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
  const u = c.best.payload, y = Rs(c.candidates), d = I(u.operational_private_key), h = u.operational_public_key, { generalRelays: f, dmRelays: p } = await So(h, [...e.discoveryRelayUrls, ...u.vault_relay_hints], e.timeoutMs);
  return {
    everydayPrivateKey: d,
    everydayPublicKey: h,
    recoveryPrivateKey: n,
    recoveryPublicKey: a,
    recoveryCapsuleKey: r,
    accountId: u.account_id,
    currentRecoveryEvent: c.best.event,
    currentRecoveryPayload: u,
    generalRelays: f,
    dmRelays: p,
    chainWarning: y.consistent ? void 0 : y.warning,
    everydayKeyDerived: h === i
  };
}
async function So(e, t, n) {
  const r = new K([...new Set(t)]);
  let o = [], i = [];
  try {
    const a = await r.queryQuorum({ kinds: [Xe], authors: [e], limit: 5 }, n), s = fr(a.outcomes.flatMap((y) => y.events));
    s && (o = vs(s));
    const c = await r.queryQuorum({ kinds: [En], authors: [e], limit: 5 }, n), u = fr(c.outcomes.flatMap((y) => y.events));
    u && (i = ws(u));
  } finally {
    r.closeAll();
  }
  return { generalRelays: o, dmRelays: i };
}
async function Ao(e) {
  if (!to(e))
    throw new oe("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await Dn(e);
  try {
    const { recoveryPrivateKey: n, capsuleKey: r } = _n(t), o = Pn(t);
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
async function Ro(e, t, n) {
  const r = new K(t, {
    authPrivateKey: e.recoveryPrivateKey
  });
  let o;
  try {
    o = await bo(r, e.recoveryPublicKey, e.capsuleKey, n);
  } finally {
    r.closeAll();
  }
  if (!o.quorumMet)
    throw new ke("quorum-not-met");
  if (o.best)
    throw new oe("This account's recovery capsule is still on the relays. Use normal recovery instead of a rebuild.");
  return o.candidates.length > 0 ? Math.max(...o.candidates.map((i) => i.event.created_at)) : null;
}
async function Ls(e) {
  const t = await Ao(e.phrase);
  try {
    await Ro(t, e.vaultRelayUrls, e.timeoutMs);
    const n = new K([
      .../* @__PURE__ */ new Set([...e.discoveryRelayUrls, ...e.vaultRelayUrls])
    ]);
    try {
      const o = (await n.queryQuorum({
        kinds: [Kt, Xe],
        authors: [t.everydayPublicKey],
        limit: 10
      }, e.timeoutMs)).outcomes.flatMap((i) => i.events).filter((i) => i.pubkey === t.everydayPublicKey && C(i));
      return {
        everydayPublicKey: t.everydayPublicKey,
        profileFound: o.some((i) => i.kind === Kt),
        relayListFound: o.some((i) => i.kind === Xe)
      };
    } finally {
      n.closeAll();
    }
  } finally {
    _(t.recoveryPrivateKey, t.capsuleKey, t.everydayPrivateKey);
  }
}
async function Us(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = await Ao(e.phrase);
  let r = !1;
  try {
    const o = await Ro(n, e.vaultRelayUrls, e.timeoutMs), i = {
      schema: Lt,
      account_id: T(xr()),
      recovery_generation: 0,
      previous_recovery_event_id: null,
      operational_private_key: T(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      connection_vault_root: T(O(32)),
      vault_sudo_key: T(O(32)),
      created_at: o === null ? t : rt(o, t),
      vault_relay_hints: Me(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: Ne,
        recovery_derivation: Te,
        ...Ie(!0)
      }
    }, a = await jn({
      recoveryPrivateKey: n.recoveryPrivateKey,
      capsuleKey: n.capsuleKey,
      payload: i
    }), s = new K(e.vaultRelayUrls, {
      authPrivateKey: n.recoveryPrivateKey
    });
    let c;
    try {
      c = await Ee(s, a, {
        dTag: at,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      s.closeAll();
    }
    if (!c.success)
      throw new oe("Could not publish the rebuilt recovery capsule to enough relays. Nothing else was changed; please retry.");
    const { generalRelays: u, dmRelays: y } = await So(n.everydayPublicKey, [...e.discoveryRelayUrls, ...e.vaultRelayUrls], e.timeoutMs);
    return r = !0, {
      everydayPrivateKey: n.everydayPrivateKey,
      everydayPublicKey: n.everydayPublicKey,
      recoveryPrivateKey: n.recoveryPrivateKey,
      recoveryPublicKey: n.recoveryPublicKey,
      recoveryCapsuleKey: n.capsuleKey,
      accountId: i.account_id,
      currentRecoveryEvent: a,
      currentRecoveryPayload: i,
      generalRelays: u,
      dmRelays: y,
      everydayKeyDerived: !0
    };
  } finally {
    r || _(n.recoveryPrivateKey, n.capsuleKey, n.everydayPrivateKey);
  }
}
async function qs(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = qt(e.newLoginName), { recovered: r } = e, o = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root,
    vault_sudo_key: r.currentRecoveryPayload.vault_sudo_key
  } : {}, i = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root
  } : {}, { locatorPrivateKey: a, capsuleKey: s } = await Ze(e.newPassword, n);
  try {
    const c = E(a), u = new K(e.vaultRelayUrls, {
      authPrivateKey: a
    });
    let y;
    try {
      y = await ot(u, c, s, e.timeoutMs);
    } finally {
      u.closeAll();
    }
    if (!y.quorumMet)
      throw new oe("Couldn't verify the new login name and password aren't already registered. Please retry, or add more vault relays.");
    const d = y.best?.payload ?? null, h = d !== null && d.account_id === r.accountId && d.operational_public_key === r.everydayPublicKey && d.recovery_public_key === r.recoveryPublicKey && d.generation === 0 && d.recovery_capsule_event.id === r.currentRecoveryEvent.id;
    if (y.candidates.length > 0 && !h)
      throw new oe("Another account is already registered with that login name and password. Pick a different one.");
    const f = r.currentRecoveryPayload.recovery_generation + 1, p = {
      schema: Lt,
      account_id: r.accountId,
      recovery_generation: f,
      previous_recovery_event_id: r.currentRecoveryEvent.id,
      operational_private_key: T(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      ...o,
      created_at: rt(r.currentRecoveryEvent.created_at, t),
      vault_relay_hints: Me(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: Ne,
        recovery_derivation: Te,
        ...Ie(r.everydayKeyDerived)
      }
    }, w = await jn({
      recoveryPrivateKey: r.recoveryPrivateKey,
      capsuleKey: r.recoveryCapsuleKey,
      payload: p
    }), g = new K(e.vaultRelayUrls, {
      authPrivateKey: r.recoveryPrivateKey
    });
    let m;
    try {
      m = await Ee(g, w, {
        dTag: at,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      g.closeAll();
    }
    if (!m.success)
      throw new oe("Could not publish the refreshed recovery capsule to enough relays. No new credential was published; please retry.");
    r.currentRecoveryEvent = w, r.currentRecoveryPayload = p;
    const k = {
      schema: Ut,
      account_id: r.accountId,
      generation: 0,
      operational_private_key: T(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      recovery_capsule_event: w,
      ...i,
      // A retry may be repairing a credential that reached only one relay.
      // It must replace that partial event deterministically on every relay.
      created_at: y.best ? rt(y.best.event.created_at, t) : t,
      vault_relay_hints: Me(e.vaultRelayUrls),
      protocol: {
        password_kdf: Gn,
        capsule_encryption: Ne,
        recovery_derivation: Te,
        ...Ie(r.everydayKeyDerived)
      }
    }, b = await $n({
      locatorPrivateKey: a,
      capsuleKey: s,
      payload: k
    }), P = new K(e.vaultRelayUrls, {
      authPrivateKey: a
    });
    let M;
    try {
      M = await Ee(P, b, {
        dTag: De,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      P.closeAll();
    }
    if (!M.success)
      throw new oe("Could not publish the new credential capsule to enough relays. Please retry.");
    return e.store && await ds(e.store, r.everydayPublicKey, {
      generation: 0,
      recoveryGeneration: f
    }), {
      normalizedLoginName: n,
      locatorPublicKey: c,
      credentialEvent: b,
      refreshedRecoveryEvent: w,
      credentialPublish: M,
      recoveryPublish: m
    };
  } finally {
    _(a, s);
  }
}
async function Vs(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = qt(e.loginName), r = await Ze(e.oldPassword, n), o = E(r.locatorPrivateKey), i = new K(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  });
  let a;
  try {
    a = await ot(i, o, r.capsuleKey, e.timeoutMs);
  } finally {
    i.closeAll();
  }
  if (!a.quorumMet)
    throw new ke("quorum-not-met");
  if (!a.best)
    throw new ke(a.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const s = a.best.payload, c = a.best.event, u = e.store ?? new Ko(), y = await Vn(u, s.operational_public_key);
  if (s.generation < y.generation && !e.acknowledgeRollback)
    throw new lo(y.generation, s.generation);
  const d = await Ze(e.newPassword, n), h = E(d.locatorPrivateKey), f = new K(e.vaultRelayUrls, {
    authPrivateKey: d.locatorPrivateKey
  });
  let p;
  try {
    p = await ot(f, h, d.capsuleKey, e.timeoutMs);
  } finally {
    f.closeAll();
  }
  if (!p.quorumMet)
    throw new re("Couldn't verify the new password isn't already registered under this login name. Please retry, or add more vault relays.");
  if (p.candidates.length > 0)
    throw new co("Another account is already registered with this login name and the new password you chose. Pick a different new password.");
  const w = s.generation + 1, g = {
    schema: Ut,
    account_id: s.account_id,
    generation: w,
    operational_private_key: s.operational_private_key,
    operational_public_key: s.operational_public_key,
    recovery_public_key: s.recovery_public_key,
    recovery_capsule_event: s.recovery_capsule_event,
    // Carry only the session root. A legacy credential may contain the sudo
    // key, but rotation deliberately scrubs it; personal-tier access remains
    // phrase-gated through the recovery capsule.
    ...s.connection_vault_root !== void 0 ? { connection_vault_root: s.connection_vault_root } : {},
    created_at: t,
    vault_relay_hints: Me(e.vaultRelayUrls),
    protocol: {
      password_kdf: Gn,
      capsule_encryption: Ne,
      recovery_derivation: Te,
      ...Ie(Eo(s))
    }
  }, m = await $n({
    locatorPrivateKey: d.locatorPrivateKey,
    capsuleKey: d.capsuleKey,
    payload: g
  }), k = new K(e.vaultRelayUrls, {
    authPrivateKey: d.locatorPrivateKey
  }), b = await Ee(k, m, {
    dTag: De,
    minAcks: e.minAcknowledgements,
    timeoutMs: e.timeoutMs
  });
  if (k.closeAll(), !b.success)
    throw new re("The new credential capsule did not reach the required relay acknowledgement and readback quorum. Your existing password still works; nothing was changed. Please retry.");
  const P = Ss({
    oldLocatorPrivateKey: r.locatorPrivateKey,
    createdAt: rt(c.created_at, t)
  }), M = Wr({
    privateKey: r.locatorPrivateKey,
    eventIdToDelete: c.id,
    deletedEventKind: x,
    createdAt: t
  }), q = new K(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  }), [Y, pe] = await Promise.all([
    q.publishAll(P, e.timeoutMs),
    q.publishAll(M, e.timeoutMs)
  ]);
  return q.closeAll(), await uo(u, s.operational_public_key, {
    generation: w
  }), {
    normalizedLoginName: n,
    oldLocatorPublicKey: o,
    newLocatorPublicKey: h,
    newGeneration: w,
    recoveryPublicKey: s.recovery_public_key,
    recoveryCapsuleEvent: s.recovery_capsule_event,
    newCredentialEvent: m,
    tombstoneEvent: P,
    deletionRequestEvent: M,
    newCredentialPublish: b,
    tombstoneAcknowledgedCount: ce(Y),
    deletionAcknowledgedCount: ce(pe)
  };
}
const Fs = "bitlogin/connection-vault-root/v1", Ws = "bitlogin/connection-vault-signing/v1", Bs = "bitlogin/connection-record-encryption/v1", $s = "bitlogin/connection-vault-personal/v1", yn = "bitlogin:connection:";
function js(e) {
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Rn(Or(Fs), e);
}
function Ue(e) {
  return Si(e, Ws).scalar;
}
function Co(e) {
  const t = Ue(e);
  try {
    return E(t);
  } finally {
    _(t);
  }
}
function Gs(e, t) {
  if (t.length !== 32)
    throw new Error("vault_sudo_key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Rn(Or($s), Sn(e, t));
}
function No(e, t) {
  const n = Ft(t);
  return st(e, Sn(U(Bs), new Uint8Array([0]), n), 32);
}
function Hs() {
  return T(O(16));
}
function Ft(e) {
  const t = I(e);
  if (t.length !== 16)
    throw new Error("connection_id must decode to exactly 16 bytes (§CV7).");
  return t;
}
function To(e) {
  return Ft(e), `${yn}${e}`;
}
function Mo(e) {
  if (!e.startsWith(yn))
    return null;
  const t = e.slice(yn.length);
  try {
    return Ft(t), t;
  } catch {
    return null;
  }
}
class ie {
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
    return this.assertAlive(), sn(me(this.privateKey, t), n);
  }
  nip44Decrypt(t, n) {
    return this.assertAlive(), Cn(me(this.privateKey, t), n);
  }
  /** Legacy relative to nip44Encrypt above, but still what a real NIP-07 extension exposes as
   * window.nostr.nip04.encrypt -- implemented for drop-in parity. */
  nip04Encrypt(t, n) {
    return this.assertAlive(), cs(this.privateKey, t, n);
  }
  nip04Decrypt(t, n) {
    return this.assertAlive(), us(this.privateKey, t, n);
  }
  /** Best-practical secret wipe (§11.10, §21.4): overwrites the private key buffer in place. */
  destroy() {
    _(this.privateKey), this.destroyed = !0;
  }
}
const Io = "bitlogin.connection.v1", xo = "bitlogin.connection.nwc.v1", hr = 120, Js = /* @__PURE__ */ new Set(["active", "suspended", "deleted"]), zs = /* @__PURE__ */ new Set(["connectable", "personal"]);
class Ke extends Error {
  constructor(t) {
    super(t), this.name = "ConnectionRecordError";
  }
}
function Oo(e, t) {
  return U(`bitlogin|connection-record|v1|${e}|30078|${t}`);
}
function Do(e) {
  const t = e, n = (i) => {
    throw new Ke(i);
  };
  (!t || typeof t != "object") && n("Connection record must be an object."), t.schema !== Io && n("Unsupported connection record schema (§CV8.3)."), typeof t.connection_id != "string" && n("connection_id must be a string (§CV7)."), (typeof t.connection_type != "string" || t.connection_type.length === 0) && n("connection_type must be a non-empty string (§CV8.3)."), zs.has(t.tier) || n("tier must be connectable or personal."), Js.has(t.state) || n("state must be active, suspended, or deleted (§CV8.3)."), (typeof t.label != "string" || t.label.length > hr) && n(`label must be a string of at most ${hr} characters.`), (!Number.isInteger(t.created_at) || !Number.isInteger(t.updated_at)) && n("created_at and updated_at must be integers (§CV8.3).");
  const r = t.credential;
  (!r || typeof r != "object" || typeof r.schema != "string") && n("credential must be an object naming its profile schema (§CV8.3).");
  const o = t.application_binding;
  (!o || typeof o != "object" || o.origin !== null && typeof o.origin != "string" || o.app_pubkey !== null && typeof o.app_pubkey != "string") && n("application_binding must carry origin and app_pubkey (string or null)."), t.notes !== null && typeof t.notes != "string" && n("notes must be a string or null.");
}
async function Qt(e) {
  Do(e.record);
  const t = Ue(e.vaultPrk), n = E(t), r = To(e.record.connection_id), o = No(e.recordPrk, e.record.connection_id), i = await Fn(e.record, o, Oo(n, r));
  return L({
    pubkey: n,
    created_at: rt(e.previousCreatedAt, e.now),
    kind: x,
    tags: [["d", r]],
    content: JSON.stringify(i)
  }, t);
}
async function Qs(e, t, n) {
  if (!C(e))
    throw new Ke("Connection record event has an invalid id or signature.");
  const r = E(Ue(t));
  if (e.pubkey !== r)
    throw new Ke("Connection record event is not signed by this vault's identity.");
  const o = Le(e, "d") ?? "", i = Mo(o);
  if (i === null)
    throw new Ke("Connection record event has a malformed d tag.");
  const a = JSON.parse(e.content), s = Oo(e.pubkey, o), c = [
    { prk: t, tier: "connectable" },
    ...n ? [{ prk: n, tier: "personal" }] : []
  ];
  for (const u of c) {
    let y;
    try {
      y = await Wn(a, No(u.prk, i), s);
    } catch {
      continue;
    }
    if (Do(y), y.connection_id !== i)
      throw new Ke("Connection record id does not match its d tag.");
    if (y.tier !== u.tier)
      throw new Ke("Connection record tier does not match the key that decrypted it.");
    return { record: y, tier: u.tier, event: e };
  }
  return null;
}
function Ys(e, t) {
  return {
    ...e,
    state: "deleted",
    credential: { schema: e.credential.schema },
    notes: null,
    updated_at: t
  };
}
const Tt = /^[0-9a-f]{64}$/u;
class X extends Error {
  constructor(t) {
    super(t), this.name = "NwcParseError";
  }
}
function vr(e) {
  const t = e.trim();
  if (!/^nostr\+walletconnect:\/\//iu.test(t))
    throw new X("Not an NWC URI: it must start with nostr+walletconnect://");
  let n;
  try {
    n = new URL(t.replace(/^nostr\+walletconnect:\/\//iu, "http://"));
  } catch {
    throw new X("The NWC URI is malformed.");
  }
  const r = n.hostname.toLowerCase();
  if (!Tt.test(r))
    throw new X("The NWC URI's wallet service pubkey is not 64-char hex.");
  const o = [], i = [];
  let a = null, s = null;
  for (const [c, u] of n.searchParams.entries())
    if (c === "relay") {
      if (!ct(u))
        throw new X("An NWC relay must use secure WebSockets, except for an explicit loopback development endpoint.");
      o.push(u);
    } else if (c === "secret") {
      const y = u.toLowerCase();
      if (!Tt.test(y))
        throw new X("The NWC URI's secret is not a 64-char hex client key.");
      a = y;
    } else c === "lud16" ? s = u : i.push([c, u]);
  if (o.length === 0)
    throw new X("The NWC URI names no relay.");
  if (a === null)
    throw new X("The NWC URI carries no secret.");
  return {
    schema: xo,
    wallet_pubkey: r,
    relays: o,
    secret: a,
    lud16: s,
    extra_params: i
  };
}
function Xs(e) {
  Lo(e);
  const t = new URLSearchParams();
  for (const n of e.relays)
    t.append("relay", n);
  t.append("secret", e.secret), e.lud16 !== null && t.append("lud16", e.lud16);
  for (const [n, r] of e.extra_params)
    t.append(n, r);
  return `nostr+walletconnect://${e.wallet_pubkey}?${t.toString()}`;
}
function Zs(e, t) {
  return e.wallet_pubkey === t.wallet_pubkey && e.secret === t.secret;
}
function Lo(e) {
  const t = e, n = (r) => {
    throw new X(r);
  };
  (!t || typeof t != "object") && n("NWC credential must be an object."), t.schema !== xo && n("NWC credential has the wrong schema."), (typeof t.wallet_pubkey != "string" || !Tt.test(t.wallet_pubkey)) && n("NWC credential wallet_pubkey must be 64-char lowercase hex."), (!Array.isArray(t.relays) || t.relays.length === 0 || t.relays.some((r) => typeof r != "string")) && n("NWC credential must name at least one relay."), t.relays.some((r) => !ct(r)) && n("NWC relays must use secure WebSockets, except for explicit loopback development endpoints."), (typeof t.secret != "string" || !Tt.test(t.secret)) && n("NWC credential secret must be 64-char lowercase hex."), t.lud16 !== null && typeof t.lud16 != "string" && n("NWC credential lud16 must be a string or null."), (!Array.isArray(t.extra_params) || t.extra_params.some((r) => !Array.isArray(r) || r.length !== 2 || typeof r[0] != "string" || typeof r[1] != "string")) && n("NWC credential extra_params must be [key, value] string pairs.");
}
const ec = "bitlogin:vault-hwm:v2:", tc = "bitlogin/vault-hwm-index/v2", Uo = "bitlogin/vault-hwm-encryption/v2", nc = /^[0-9a-f]{64}$/u;
class ae extends Error {
  constructor() {
    super("The local Connection Vault rollback marker is invalid or has been tampered with."), this.name = "RecordHighWaterMarkError";
  }
}
function Hn(e) {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return Number.isInteger(t.createdAt) && (t.createdAt ?? -1) >= 0 && typeof t.eventId == "string" && nc.test(t.eventId);
}
function qo(e, t) {
  Ft(t);
  const n = st(e, tc, 32), r = U(t);
  try {
    return `${ec}${T(Tr(Mr, n, r))}`;
  } finally {
    _(n, r);
  }
}
function rc(e, t) {
  return `bitlogin:vault-hwm:${Co(e)}:${t}`;
}
async function oc(e, t, n) {
  const r = st(e, Uo, 32), o = U(JSON.stringify(n)), i = U(t);
  try {
    const a = await Jr(r, o, i), s = {
      v: 2,
      nonce: T(a.nonce),
      ciphertext: T(a.ciphertext)
    };
    return JSON.stringify(s);
  } finally {
    _(r, o, i);
  }
}
async function ic(e, t, n) {
  const r = st(e, Uo, 32), o = U(t);
  let i;
  try {
    const a = JSON.parse(n);
    if (a.v !== 2 || typeof a.nonce != "string" || typeof a.ciphertext != "string")
      throw new ae();
    i = await zr(r, I(a.nonce), I(a.ciphertext), o);
    const s = JSON.parse(Kn(i));
    if (!Hn(s))
      throw new ae();
    return s;
  } catch (a) {
    throw a instanceof ae ? a : new ae();
  } finally {
    _(r, o), i && _(i);
  }
}
async function Vo(e, t, n, r) {
  const o = qo(t, n);
  await e.set(o, await oc(t, o, r));
}
async function Fo(e, t, n) {
  const r = qo(t, n), o = await e.get(r);
  if (o !== void 0)
    return ic(t, r, o);
  const i = rc(t, n), a = await e.get(i);
  if (a === void 0)
    return null;
  try {
    const s = JSON.parse(a);
    if (!Hn(s))
      throw new ae();
    return await Vo(e, t, n, s), await e.delete(i), s;
  } catch (s) {
    throw s instanceof ae ? s : new ae();
  }
}
async function Wo(e, t, n, r) {
  if (!Hn(r))
    throw new ae();
  const o = await Fo(e, t, n);
  o && on({ created_at: r.createdAt, id: r.eventId }, { created_at: o.createdAt, id: o.eventId }) <= 0 || await Vo(e, t, n, r);
}
async function ac(e) {
  const t = Ue(e.vaultPrk), n = new K(e.relayUrls, { authPrivateKey: t });
  let r;
  try {
    r = await Ee(n, e.event, {
      dTag: To(e.connectionId),
      minAcks: e.minAcknowledgements,
      // The readback bar follows the ack bar: a caller publishing to fewer
      // relays (a targeted repair, a test) has already lowered its quorum.
      minReadbacks: e.minAcknowledgements,
      timeoutMs: e.timeoutMs
    });
  } finally {
    n.closeAll(), _(t);
  }
  return r.success && await Wo(e.store, e.vaultPrk, e.connectionId, {
    createdAt: e.event.created_at,
    eventId: e.event.id
  }), r;
}
const wr = 500;
async function sc(e) {
  const t = Ue(e.vaultPrk), n = E(t), r = new K(e.relayUrls, { authPrivateKey: t });
  let o;
  try {
    o = await r.queryQuorum({ kinds: [x], authors: [n], limit: wr }, e.timeoutMs);
  } finally {
    r.closeAll(), _(t);
  }
  const i = o.outcomes.some((u) => u.events.length >= wr), a = /* @__PURE__ */ new Map();
  for (const u of o.outcomes.flatMap((y) => y.events)) {
    if (!C(u) || u.pubkey !== n)
      continue;
    const y = Mo(Le(u, "d") ?? "");
    if (y === null)
      continue;
    const d = a.get(y);
    (!d || on(u, d) > 0) && a.set(y, u);
  }
  const s = /* @__PURE__ */ new Map(), c = [];
  for (const [u, y] of a) {
    const d = await Fo(e.store, e.vaultPrk, u);
    if (d !== null && on(y, {
      created_at: d.createdAt,
      id: d.eventId
    }) < 0) {
      c.push(u);
      continue;
    }
    s.set(u, y), await Wo(e.store, e.vaultPrk, u, {
      createdAt: y.created_at,
      eventId: y.id
    });
  }
  return {
    events: s,
    rollbackWarnings: c,
    quorumMet: o.quorumMet,
    respondedCount: o.respondedCount,
    truncated: i
  };
}
class cc {
  vaultPrk;
  personalPrk = null;
  destroyed = !1;
  connectionVaultRoot;
  vaultPublicKey;
  constructor(t) {
    this.connectionVaultRoot = t.slice(), this.vaultPrk = js(this.connectionVaultRoot), this.vaultPublicKey = Co(this.vaultPrk);
  }
  get sudoActive() {
    return this.personalPrk !== null;
  }
  /** Opens a sudo window. Consumes (wipes) the caller's sudo key copy. */
  enableSudo(t) {
    this.endSudo(), this.personalPrk = Gs(this.connectionVaultRoot, t), _(t);
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
      schema: Io,
      connection_id: Hs(),
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
    }, o = await Qt({
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
    }, a = await Qt({
      vaultPrk: this.vaultPrk,
      recordPrk: this.prkForTier(i.tier),
      record: i,
      previousCreatedAt: t.event.created_at,
      now: o
    });
    return { record: i, event: a };
  }
  /** §CV11 step 2: the encrypted tombstone replacement. */
  async deleteConnection(t, n) {
    const r = n ?? Math.floor(Date.now() / 1e3), o = Ys(t.record, r), i = await Qt({
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
    return this.destroyed ? Promise.reject(new Error("This vault session was destroyed; create a new one from the account's root.")) : Qs(t, this.vaultPrk, this.personalPrk ?? void 0);
  }
  /** §CV11 step 3: a NIP-09 deletion request for a replaced record event,
   *  signed by the vault identity. Best-effort by contract — the encrypted
   *  tombstone is the durable part of a deletion, this is the courtesy ask. */
  buildDeletionRequest(t, n) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    return Wr({
      privateKey: Ue(this.vaultPrk),
      eventIdToDelete: t,
      deletedEventKind: x,
      createdAt: n ?? Math.floor(Date.now() / 1e3)
    });
  }
  publish(t) {
    return ac({ vaultPrk: this.vaultPrk, ...t });
  }
  fetchEvents(t) {
    return sc({ vaultPrk: this.vaultPrk, ...t });
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
        const a = await this.decryptEvent(i);
        a && r.push(a);
      } catch {
        o.push(i.id);
      }
    return r.sort((i, a) => a.record.updated_at - i.record.updated_at), {
      connections: r,
      rollbackWarnings: n.rollbackWarnings,
      unreadable: o,
      truncated: n.truncated,
      quorumMet: n.quorumMet
    };
  }
}
const lc = "bitlogin", ee = "kv", W = "device-keys", uc = 2;
function yc() {
  return new Promise((e, t) => {
    const n = indexedDB.open(lc, uc);
    n.onupgradeneeded = () => {
      const r = n.result;
      r.objectStoreNames.contains(ee) || r.createObjectStore(ee), r.objectStoreNames.contains(W) || r.createObjectStore(W);
    }, n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
  });
}
class dc {
  dbPromise = null;
  db() {
    return this.dbPromise || (this.dbPromise = yc()), this.dbPromise;
  }
  async get(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const a = n.transaction(ee, "readonly").objectStore(ee).get(t);
      a.onsuccess = () => r(a.result), a.onerror = () => o(a.error);
    });
  }
  async set(t, n) {
    const r = await this.db();
    return new Promise((o, i) => {
      const a = r.transaction(ee, "readwrite");
      a.objectStore(ee).put(n, t), a.oncomplete = () => o(), a.onerror = () => i(a.error);
    });
  }
  async delete(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const i = n.transaction(ee, "readwrite");
      i.objectStore(ee).delete(t), i.oncomplete = () => r(), i.onerror = () => o(i.error);
    });
  }
  /**
   * Returns a non-extractable AES-GCM key kept by the browser's IndexedDB
   * implementation. The key is deliberately separate from the string-only KV
   * API so callers cannot accidentally serialize it as application data.
   */
  async getOrCreateDeviceKey(t) {
    const n = await this.db(), r = await new Promise((i, a) => {
      const s = n.transaction(W, "readonly").objectStore(W).get(t);
      s.onsuccess = () => i(s.result), s.onerror = () => a(s.error);
    });
    if (r) return r;
    const o = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      !1,
      ["encrypt", "decrypt"]
    );
    try {
      return await new Promise((i, a) => {
        const s = n.transaction(W, "readwrite");
        s.objectStore(W).add(o, t), s.oncomplete = () => i(), s.onerror = () => a(s.error);
      }), o;
    } catch {
      const i = await new Promise((a, s) => {
        const c = n.transaction(W, "readonly").objectStore(W).get(t);
        c.onsuccess = () => a(c.result), c.onerror = () => s(c.error);
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
const ut = "bitlogin:session:v1", Jn = "bitlogin:session-device-key:v1";
function Bo(e) {
  return !!(e && typeof e == "object" && e.v === 3 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function $o(e, t) {
  if (e.length !== 32) throw new Error("Not a lock key.");
  return crypto.subtle.importKey("raw", $e(e), "AES-GCM", !1, [t]);
}
async function Et(e, t = ut) {
  try {
    const n = await e.get(t);
    if (!n) return "none";
    const r = JSON.parse(n);
    return Bo(r) ? "locked" : jo(r) ? "open" : "none";
  } catch {
    return "none";
  }
}
function ft(e) {
  let t = "";
  for (const n of e) t += String.fromCharCode(n);
  return btoa(t);
}
function ht(e) {
  const t = atob(e);
  return Uint8Array.from(t, (n) => n.charCodeAt(0));
}
function $e(e) {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}
function jo(e) {
  return !!(e && typeof e == "object" && e.v === 2 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function dn(e, t, n, r = ut) {
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
    const i = await e.getOrCreateDeviceKey(Jn), a = crypto.getRandomValues(new Uint8Array(12)), s = new TextEncoder().encode(JSON.stringify(o)), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: a }, i, s), u = {
      v: 2,
      iv: ft(a),
      ciphertext: ft(new Uint8Array(c))
    };
    if (!n) {
      await e.set(r, JSON.stringify(u));
      return;
    }
    const y = crypto.getRandomValues(new Uint8Array(12)), d = await crypto.subtle.encrypt({ name: "AES-GCM", iv: y }, await $o(n, "encrypt"), new TextEncoder().encode(JSON.stringify(u))), h = { v: 3, iv: ft(y), ciphertext: ft(new Uint8Array(d)) };
    await e.set(r, JSON.stringify(h));
  } catch {
    n && await e.delete(r).catch(() => {
    });
  }
}
async function Go(e, t, n = ut) {
  let r;
  try {
    r = await e.get(n);
  } catch {
    return null;
  }
  if (!r) return null;
  try {
    let o = JSON.parse(r);
    if (Bo(o)) {
      if (!t) return null;
      const c = await crypto.subtle.decrypt({ name: "AES-GCM", iv: $e(ht(o.iv)) }, await $o(t, "decrypt"), $e(ht(o.ciphertext)));
      o = JSON.parse(new TextDecoder().decode(c));
    }
    if (!jo(o) || typeof e.getOrCreateDeviceKey != "function")
      return await e.delete(n), null;
    const i = await e.getOrCreateDeviceKey(Jn), a = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: $e(ht(o.iv)) },
      i,
      $e(ht(o.ciphertext))
    ), s = JSON.parse(new TextDecoder().decode(a));
    return typeof s.everydayPrivateKeyHex != "string" || typeof s.accountId != "string" || typeof s.recoveryPublicKey != "string" || !s.activeCredentialEvent || !s.activeRecoveryEvent ? null : {
      everydayPrivateKey: Uint8Array.from(
        s.everydayPrivateKeyHex.match(/.{1,2}/g) || [],
        (c) => Number.parseInt(c, 16)
      ),
      accountId: s.accountId,
      recoveryPublicKey: s.recoveryPublicKey,
      activeCredentialEvent: s.activeCredentialEvent,
      activeRecoveryEvent: s.activeRecoveryEvent,
      ...typeof s.connectionVaultRootHex == "string" ? {
        connectionVaultRoot: Uint8Array.from(
          s.connectionVaultRootHex.match(/.{1,2}/g) || [],
          (c) => Number.parseInt(c, 16)
        )
      } : {},
      ...typeof s.vaultEnabled == "boolean" ? { vaultEnabled: s.vaultEnabled } : {},
      ...typeof s.everydayKeyDerived == "boolean" ? { everydayKeyDerived: s.everydayKeyDerived } : {}
    };
  } catch {
    return null;
  }
}
const pc = "bitlogin:kept-session:v1:", F = (e) => pc + e;
async function H(e, t = ut) {
  try {
    await e.delete(t);
  } catch {
  }
}
async function gr(e) {
  try {
    await e.delete(ut), typeof e.deleteDeviceKey == "function" && await e.deleteDeviceKey(Jn);
  } catch {
  }
}
const fc = 27300, xe = {
  /** The longest address a picture may have. */
  pictureChars: 300,
  /** The most that is said about someone, in their own words. */
  aboutChars: 280,
  /** How long a pass made here lasts, in seconds. NSWP's verifier allows twelve hours; this gives four. */
  passSec: 4 * 3600,
  /** A profile's content is not read past this many characters. */
  contentChars: 2e4
};
function hc(e) {
  if (typeof e != "string" || e.length > xe.pictureChars) return "";
  try {
    const t = new URL(e);
    return t.protocol !== "https:" || t.username || t.password || !t.hostname.includes(".") ? "" : t.href.length <= xe.pictureChars ? t.href : "";
  } catch {
    return "";
  }
}
const vc = (e) => e <= 31 || e >= 127 && e <= 159 || e >= 8203 && e <= 8207 || e >= 8232 && e <= 8239 || e >= 8288 && e <= 8303 || e === 65279;
function wc(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, xe.aboutChars * 8).normalize("NFC")) t += vc(n.codePointAt(0)) ? " " : n;
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, xe.aboutChars).join("").trim();
}
function ye(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, n = tt(t.name), r = hc(t.picture), o = wc(t.about);
  return !n && !r && !o ? null : { ...n ? { name: n } : {}, ...r ? { picture: r } : {}, ...o ? { about: o } : {} };
}
function gc(e, t) {
  if (!C(e) || e.kind !== 0 || e.pubkey !== t || e.content.length > xe.contentChars) return null;
  let n;
  try {
    n = JSON.parse(e.content);
  } catch {
    return null;
  }
  if (!n || typeof n != "object" || Array.isArray(n)) return null;
  const r = n;
  return ye({ name: tt(r.display_name) || tt(r.displayName) || r.name, picture: r.picture, about: r.about });
}
function mc(e, t) {
  let n = null;
  for (const r of e)
    !C(r) || r.kind !== 0 || r.pubkey !== t || n && r.created_at <= n.at || (n = { at: r.created_at, profile: gc(r, t) });
  return n?.profile ?? null;
}
const bc = /^[0-9a-f]{64}$/u;
function kc(e) {
  const t = Ii(e.site);
  if (!t || typeof e.session != "string" || !bc.test(e.session) || e.session === e.identity) return null;
  const n = Math.floor(e.nowSeconds), r = ye(e.profile) ?? {}, o = [
    ["nswp:session", e.session],
    ["nswp:origin", t],
    ["expiration", String(n + xe.passSec)]
  ];
  return r.name && o.push(["name", r.name]), r.picture && o.push(["picture", r.picture]), r.about && o.push(["about", r.about]), { kind: fc, created_at: n, tags: o, content: "" };
}
const pn = "bitlogin:kept-accounts:v1", Mt = {
  /** No more accounts than this are kept on one device. The one least lately used goes first. */
  accounts: 8
}, Ec = /^[0-9a-f]{64}$/u;
function zn(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (typeof t.pubkey != "string" || !Ec.test(t.pubkey)) return null;
  const n = ye({ name: t.name, picture: t.picture, about: t.about }) ?? {}, r = typeof t.at == "number" && Number.isFinite(t.at) && t.at > 0 ? Math.floor(t.at) : 0;
  let o;
  try {
    o = je(t.pubkey);
  } catch {
    return null;
  }
  return { pubkey: t.pubkey, npub: o, ...n, at: r };
}
function _c(e) {
  if (!e) return [];
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return [];
  }
  if (!Array.isArray(t)) return [];
  const n = /* @__PURE__ */ new Set(), r = [];
  for (const o of t.slice(0, Mt.accounts * 2)) {
    const i = zn(o);
    !i || n.has(i.pubkey) || (n.add(i.pubkey), r.push(i));
  }
  return r.sort((o, i) => i.at - o.at).slice(0, Mt.accounts);
}
function Pc(e, t, n, r = {}) {
  const o = e.find((s) => s.pubkey === t), i = zn({
    pubkey: t,
    at: n,
    name: tt(r.name) || o?.name,
    picture: r.picture ?? o?.picture,
    about: r.about ?? o?.about
  });
  if (!i) return { list: [...e], dropped: [] };
  const a = [i, ...e.filter((s) => s.pubkey !== t)];
  return { list: a.slice(0, Mt.accounts), dropped: a.slice(Mt.accounts).map((s) => s.pubkey) };
}
function Kc(e, t, n) {
  return e.map((r) => r.pubkey === t ? zn({ ...r, name: tt(n.name) || r.name, picture: n.picture ?? r.picture, about: n.about ?? r.about }) ?? r : r);
}
const _t = (e, t) => e.filter((n) => n.pubkey !== t);
async function B(e) {
  try {
    return _c(await e.get(pn));
  } catch {
    return [];
  }
}
async function ge(e, t) {
  try {
    t.length === 0 ? await e.delete(pn) : await e.set(pn, JSON.stringify(t));
  } catch {
  }
}
const Qn = "bitlogin:lock:v1", Sc = "bitlogin/lock/device/v1", Ac = U("bitlogin:lock:device-wrap:v1"), j = {
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
function Ho(e) {
  if (typeof e != "string") return null;
  const t = e.normalize("NFKC"), n = [...t].length;
  return n >= j.pinMin && n <= j.pinMax ? U(t) : null;
}
async function Jo(e, t) {
  const n = O(12), r = await crypto.subtle.importKey("raw", Re(e), "AES-GCM", !1, ["encrypt"]), o = await crypto.subtle.encrypt({ name: "AES-GCM", iv: Re(n) }, r, Re(t));
  return { iv: T(n), wrapped: T(new Uint8Array(o)) };
}
async function zo(e, t) {
  try {
    const n = await crypto.subtle.importKey("raw", Re(e), "AES-GCM", !1, ["decrypt"]), r = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: Re(I(t.iv)) }, n, Re(I(t.wrapped))));
    return r.length === 32 ? r : null;
  } catch {
    return null;
  }
}
const Qo = (e) => st(Rn(Ac, e), Sc, 32), mr = (e) => !!e && typeof e == "object" && typeof e.iv == "string" && typeof e.wrapped == "string";
async function de(e) {
  let t;
  try {
    t = await e.get(Qn);
  } catch {
    return null;
  }
  if (!t) return null;
  try {
    const n = JSON.parse(t);
    return n.v !== 1 || typeof n.tries != "number" || !Number.isInteger(n.tries) || n.tries < 0 || !mr(n.pin) || typeof n.pin.salt != "string" || n.device !== void 0 && (!mr(n.device) || typeof n.device.credentialId != "string") ? null : { v: 1, tries: n.tries, pin: n.pin, ...n.device ? { device: n.device } : {} };
  } catch {
    return null;
  }
}
const it = (e, t) => e.set(Qn, JSON.stringify(t));
async function Qe(e) {
  try {
    await e.delete(Qn);
  } catch {
  }
}
async function Rc(e, t, n) {
  const r = Ho(t);
  if (!r) throw new Error(`A PIN is ${j.pinMin} to ${j.pinMax} characters.`);
  const o = n ? n.slice() : O(32), i = O(16), a = await Nr(r, i);
  try {
    const s = n ? await de(e) : null;
    await it(e, { v: 1, tries: 0, pin: { salt: T(i), ...await Jo(a, o) }, ...s?.device ? { device: s.device } : {} });
  } finally {
    a.fill(0), r.fill(0);
  }
  return o;
}
async function Cc(e, t, n, r) {
  const o = await de(e);
  if (!o) throw new Error("The lock is not on.");
  if (r.length !== 32 || !/^[A-Za-z0-9_-]{8,1400}$/u.test(n)) throw new Error("That is not a device unlock.");
  const i = Qo(r);
  try {
    await it(e, { ...o, device: { credentialId: n, ...await Jo(i, t) } });
  } finally {
    i.fill(0);
  }
}
async function Nc(e) {
  const t = await de(e);
  t?.device && await it(e, { v: 1, tries: t.tries, pin: t.pin });
}
async function Yo(e, t) {
  const n = await de(e);
  if (!n) return { ok: !1, left: 0, removed: !0 };
  const r = n.tries + 1;
  await it(e, { ...n, tries: r });
  const o = await t(n);
  return o ? (await it(e, { ...n, tries: 0 }), { ok: !0, lockKey: o }) : r >= j.tries ? (await Qe(e), { ok: !1, left: 0, removed: !0 }) : { ok: !1, left: j.tries - r, removed: !1 };
}
function Tc(e, t) {
  return Yo(e, async (n) => {
    const r = Ho(t);
    if (!r) return null;
    const o = await Nr(r, I(n.pin.salt));
    try {
      return await zo(o, n.pin);
    } finally {
      o.fill(0), r.fill(0);
    }
  });
}
function Mc(e, t) {
  return Yo(e, async (n) => {
    if (!n.device || t.length !== 32) return null;
    const r = Qo(t);
    try {
      return await zo(r, n.device);
    } finally {
      r.fill(0);
    }
  });
}
const Ye = "bitlogin:signer-grant:v1:", Xo = "bitlogin:signer-grant-device-key:v1", se = {
  /** The longest a site BitLogin knows is remembered, in seconds: thirty days from Allow. */
  keepSec: 720 * 3600,
  /** The longest for a site it does not know: seven days. */
  unknownKeepSec: 168 * 3600,
  /** How many recent room passes are remembered, to count them across page loads. */
  passKept: 10,
  /** How many recent signatures are remembered, to count them across page loads. */
  signedKept: 60
}, Yt = (e) => e.at ?? e.until - Zo(e.site), Zo = (e) => (z(e) ? Ai(e) : xi(e) !== null) ? se.keepSec : se.unknownKeepSec, Ic = /^[0-9a-f]{64}$/u;
function Oe(e) {
  if (typeof e != "string" || e.length > 300 || e.includes("*")) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin === e ? t.origin : "";
  } catch {
    return "";
  }
}
const Yn = (e) => z(e) || Oe(e), br = (e) => btoa(Array.from(e, (t) => String.fromCharCode(t)).join("")), kr = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), Er = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}, xc = (e) => Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
async function Xt(e, t, n) {
  const r = Yn(t.site);
  if (!r || t.everydayPrivateKey.length !== 32 || typeof e.getOrCreateDeviceKey != "function" || z(r) && t.permissions) return !1;
  const o = Math.min(Math.floor(t.until), Math.floor(n) + Zo(r));
  if (!(o > n)) return !1;
  const i = crypto.getRandomValues(new Uint8Array(12));
  try {
    const a = await e.getOrCreateDeviceKey(Xo), s = JSON.stringify({
      site: r,
      key: xc(t.everydayPrivateKey),
      until: o,
      ...t.name ? { name: t.name.slice(0, 48) } : {},
      ...ye(t.profile) ? { profile: ye(t.profile) } : {},
      // An application's public signatures are counted up to its own hourly limit, so more of them are kept.
      signed: t.signed.filter((y) => Number.isFinite(y)).slice(-(t.permissions ? At.public.hourly : se.signedKept)),
      ...t.permissions ? { permissions: t.permissions } : {},
      ...!t.permissions && !z(r) && ue(t.more).length ? { more: ue(t.more) } : {},
      ...typeof t.at == "number" ? { at: Math.floor(t.at) } : {},
      ...Q(t.relays).length ? { relays: Q(t.relays) } : {},
      ...typeof t.checkedAt == "number" ? { checkedAt: Math.floor(t.checkedAt) } : {},
      ...typeof t.seenAt == "number" ? { seenAt: Math.floor(t.seenAt) } : {},
      ...t.signedPass?.length ? { signedPass: t.signedPass.filter((y) => Number.isFinite(y)).slice(-se.passKept) } : {},
      ...t.permissions && t.signedSensitive ? { signedSensitive: t.signedSensitive.filter((y) => Number.isFinite(y)).slice(-At.sensitive.hourly) } : {}
    }), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, a, new TextEncoder().encode(s)), u = { v: 1, iv: br(i), ciphertext: br(new Uint8Array(c)) };
    return await e.set(Ye + r, JSON.stringify(u)), !0;
  } catch {
    return !1;
  }
}
async function vt(e, t, n) {
  const r = Yn(t);
  if (!r || typeof e.getOrCreateDeviceKey != "function") return null;
  try {
    const o = await e.get(Ye + r);
    if (!o) return null;
    const i = JSON.parse(o);
    if (i.v !== 1 || typeof i.iv != "string" || typeof i.ciphertext != "string") return null;
    const a = await e.getOrCreateDeviceKey(Xo), s = await crypto.subtle.decrypt({ name: "AES-GCM", iv: Er(kr(i.iv)) }, a, Er(kr(i.ciphertext))), c = JSON.parse(new TextDecoder().decode(s)), u = (f) => typeof f == "number" && Number.isFinite(f) && f > 0 ? Math.floor(f) : void 0, y = ye(c.profile), d = c.permissions === void 0 ? void 0 : Tn(c.permissions);
    if (d === null || d && (z(r) || !Mn(r, d)))
      return await e.delete(Ye + r), null;
    const h = (f, p) => Array.isArray(f) ? f.filter((w) => typeof w == "number" && Number.isFinite(w)).slice(-p) : [];
    return c.site !== r || typeof c.key != "string" || !Ic.test(c.key) || typeof c.until != "number" ? null : !(c.until > n) || c.until > n + se.keepSec ? (await e.delete(Ye + r), null) : {
      site: r,
      everydayPrivateKey: Uint8Array.from(c.key.match(/.{2}/gu) ?? [], (f) => Number.parseInt(f, 16)),
      until: c.until,
      ...typeof c.name == "string" && c.name ? { name: c.name.slice(0, 48) } : {},
      ...y ? { profile: y } : {},
      signed: h(c.signed, d ? At.public.hourly : se.signedKept),
      ...h(c.signedPass, se.passKept).length ? { signedPass: h(c.signedPass, se.passKept) } : {},
      ...!d && !z(r) && ue(c.more).length ? { more: ue(c.more) } : {},
      ...u(c.at) ? { at: u(c.at) } : {},
      ...Q(c.relays).length ? { relays: Q(c.relays) } : {},
      ...u(c.checkedAt) ? { checkedAt: u(c.checkedAt) } : {},
      ...u(c.seenAt) ? { seenAt: u(c.seenAt) } : {},
      ...d ? { permissions: d, signedSensitive: h(c.signedSensitive, At.sensitive.hourly) } : {}
    };
  } catch {
    return null;
  }
}
async function wt(e, t) {
  const n = Yn(t);
  if (n)
    try {
      await e.delete(Ye + n);
    } catch {
    }
}
const ei = "bitlogin:signer-handoff:v1", Oc = /* @__PURE__ */ new Set([
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
]), fn = /^[0-9a-f]{64}$/;
function Dc(e) {
  return Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
}
function Lc(e) {
  return Uint8Array.from(e.match(/.{2}/g) ?? [], (t) => Number.parseInt(t, 16));
}
function Uc(e, t, n, r, o = {}) {
  if (!fn.test(t)) throw new Error("The hand-off has no usable recipient key.");
  if (e.length !== 32) throw new Error("No identity is unlocked in this session.");
  let i = null;
  if (r !== void 0) {
    const h = Oe(r.site), f = Tn(r.permissions);
    if (!h || !f || !Mn(h, f)) throw new Error("That is not a permission set an application may be given.");
    i = { site: h, permissions: f };
  }
  const a = o.site === void 0 ? "" : Oe(o.site);
  if (o.site !== void 0 && (!a || i && i.site !== a)) throw new Error("The hand-off names no usable site.");
  const s = ye(o.profile), c = !!a && o.visitOnly !== !0 && o.remember === !0, u = o.family === void 0 ? "" : z(o.family);
  if (o.family !== void 0 && (!u || i || !c || !Se(a, u))) throw new Error("That is not a family this site may be allowed as.");
  const y = ue(o.more);
  if (o.more !== void 0 && (y.length === 0 || !a || i || u)) throw new Error("That is not something this site may be let do.");
  const d = new ie(n.slice());
  try {
    const h = JSON.stringify({ v: 1, purpose: ei, key: Dc(e), ...i ? { app: i } : {}, ...a ? { site: a } : {}, ...s ? { profile: s } : {}, ...c ? { remember: !0 } : {}, ...typeof o.at == "number" && Number.isFinite(o.at) ? { at: Math.floor(o.at) } : {}, ...Q(o.relays).length ? { relays: Q(o.relays) } : {}, ...u ? { family: u } : {}, ...y.length ? { more: y } : {} });
    return { senderPublicKey: d.getPublicKey(), payload: d.nip44Encrypt(t, h) };
  } finally {
    d.destroy();
  }
}
function qc(e, t) {
  if (!e || !fn.test(e.senderPublicKey) || typeof e.payload != "string")
    throw new Error("That is not a signer hand-off.");
  const n = new ie(t.slice());
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
  if (o.v !== 1 || o.purpose !== ei || typeof o.key != "string" || !fn.test(o.key))
    throw new Error("That is not a signer hand-off.");
  const i = Lc(o.key);
  try {
    E(i);
  } catch {
    throw i.fill(0), new Error("The hand-off carried an unusable key.");
  }
  const a = o.site === void 0 ? null : Oe(o.site);
  if (a === "")
    throw i.fill(0), new Error("The hand-off names no usable site.");
  const s = ye(o.profile), c = o.remember === !0 && !!a, u = typeof o.at == "number" && Number.isFinite(o.at) && o.at > 0 ? Math.floor(o.at) : null, y = Q(o.relays), d = o.family === void 0 ? null : z(o.family);
  if (d === "" || d && (o.app !== void 0 || !c || !Se(a, d)))
    throw i.fill(0), new Error("The hand-off names a family it cannot be kept for.");
  const h = ue(o.more);
  if (o.more !== void 0 && (h.length === 0 || !a || d || o.app !== void 0))
    throw i.fill(0), new Error("The hand-off carries something this site may not be let do.");
  if (o.app === void 0) return { key: i, app: null, site: a, profile: s, remember: c, at: u, relays: y, family: d, more: h };
  const f = o.app, p = f && typeof f == "object" ? Oe(f.site) : "", w = f && typeof f == "object" ? Tn(f.permissions) : null;
  if (!p || !w || !Mn(p, w) || a && a !== p)
    throw i.fill(0), new Error("The hand-off carried a permission set that cannot be read.");
  return { key: i, app: { site: p, permissions: w }, site: p, profile: s, remember: c, at: u, relays: y, family: null, more: [] };
}
const ti = 38e3, ni = "38172", Vc = ["https://testnut.cashu.space", "https://nofees.testnut.cashu.space"], Fc = 8;
function Wc(e, t, n = 10) {
  const r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const i of e)
    if (!(i.kind !== ti || !i.tags.some((a) => a[0] === "k" && a[1] === ni)))
      for (const a of i.tags) {
        if (a[0] !== "u" || a[2] !== void 0 && a[2] !== "cashu") continue;
        const s = nt(a[1]);
        if (!s || !s.startsWith("https://") || Vc.includes(s)) continue;
        const c = o.get(i.pubkey) ?? /* @__PURE__ */ new Set();
        !c.has(s) && c.size >= Fc || (c.add(s), o.set(i.pubkey, c), (r.get(s) ?? r.set(s, /* @__PURE__ */ new Set()).get(s)).add(i.pubkey));
      }
  return [...r].map(([i, a]) => ({ mint: i, by: a.size, byFollowed: [...a].filter((s) => t.has(s)).length })).filter((i) => i.by >= 2 || i.byFollowed >= 1).sort((i, a) => a.byFollowed - i.byFollowed || a.by - i.by || i.mint.localeCompare(a.mint)).slice(0, n);
}
const ri = "bitlogin:ecash:v1:", It = (e) => e.startsWith("local:"), Bc = () => `local:${Array.from(crypto.getRandomValues(new Uint8Array(8)), (e) => e.toString(16).padStart(2, "0")).join("")}`;
async function Xn(e, t) {
  const n = t.getPublicKey();
  try {
    const r = await e.get(ri + n);
    if (!r) return { wallet: null, tokens: [] };
    const o = JSON.parse(t.nip44Decrypt(n, r)), i = typeof o.wallet == "string" ? qr(o.wallet) : null, a = [];
    for (const s of Array.isArray(o.tokens) ? o.tokens : []) {
      const c = s, u = Fr(c.proofs);
      typeof c.event == "string" && c.event.length <= 80 && nt(c.mint) && u?.length && a.push({ event: c.event, mint: nt(c.mint), proofs: u });
    }
    return { wallet: i, tokens: a };
  } catch {
    return { wallet: null, tokens: [] };
  }
}
async function xt(e, t, n) {
  const r = t.getPublicKey();
  await e.set(ri + r, t.nip44Encrypt(r, JSON.stringify({ wallet: n.wallet ? Vr(n.wallet) : null, tokens: n.tokens })));
}
const Zn = (e, t) => ce(e) >= Math.min(2, t);
function oi(e, t, n) {
  const r = e.getPublicKey();
  return e.signEvent({ kind: ze, created_at: Math.floor(n), tags: [], content: e.nip44Encrypt(r, ua(t)) });
}
const Ot = (e, t) => ({ mints: e.wallet?.mints ?? [], tokens: e.tokens, offline: t, unsaved: e.tokens.some((n) => It(n.event)) });
async function $c(e) {
  const { signer: t, store: n, relays: r } = e, o = t.getPublicKey(), i = await Xn(n, t), [a, s, c] = await Promise.all([
    r.queryQuorum({ kinds: [cn], authors: [o], limit: 2 }, 5e3),
    r.queryQuorum({ kinds: [ze], authors: [o], limit: ln.tokens }, 6e3),
    r.queryQuorum({ kinds: [5], authors: [o], "#k": [String(ze)], limit: ln.tokens }, 6e3)
  ]).catch(() => [null, null, null]);
  if (!s || !a || !c || s.respondedCount === 0) return Ot(i, !0);
  const u = (b, P) => b.filter((M) => M.kind === P && M.pubkey === o && C(M)), y = (b) => {
    try {
      return t.nip44Decrypt(o, b.content);
    } catch {
      return null;
    }
  }, d = u(a.outcomes.flatMap((b) => b.events), cn).sort((b, P) => P.created_at - b.created_at)[0], h = d && qr(y(d) ?? "") || i.wallet, f = new Set(u(c.outcomes.flatMap((b) => b.events), 5).flatMap((b) => b.tags.filter((P) => P[0] === "e" && typeof P[1] == "string").map((P) => P[1]))), p = /* @__PURE__ */ new Map();
  for (const b of u(s.outcomes.flatMap((P) => P.events), ze)) p.set(b.id, b);
  const w = [...p.values()].flatMap((b) => {
    const P = aa(y(b) ?? "");
    return P ? [{ event: b.id, created_at: b.created_at, ...P }] : [];
  }), g = sa(w, f), m = new Set(g.flatMap((b) => b.proofs.map((P) => P.secret))), k = { wallet: h, tokens: [...g] };
  for (const b of i.tokens.filter((P) => It(P.event))) {
    const P = b.proofs.filter((Y) => !m.has(Y.secret));
    if (P.length === 0) continue;
    const M = oi(t, { mint: b.mint, proofs: P }, e.now ?? Date.now() / 1e3), q = Zn(await r.publishAll(M, 6e3).catch(() => []), r.relayUrls.length);
    k.tokens.push({ event: q ? M.id : b.event, mint: b.mint, proofs: P });
  }
  return await xt(n, t, k), Ot(k, !1);
}
async function jc(e, t) {
  const { signer: n, store: r, relays: o } = e, i = n.getPublicKey(), a = [...new Set((Array.isArray(t) ? t : []).map(nt).filter(Boolean))];
  if (a.length === 0 || a.length > ln.mints) throw new Error("Name between one and five mints, each an https address.");
  const s = await Xn(r, n), c = { privkey: s.wallet?.privkey ?? e.newKey(), mints: a }, u = { wallet: c, tokens: s.tokens };
  await xt(r, n, u);
  const y = n.signEvent({ kind: cn, created_at: Math.floor(e.now ?? Date.now() / 1e3), tags: [], content: n.nip44Encrypt(i, Vr(c)) });
  if (!Zn(await o.publishAll(y, 6e3).catch(() => []), o.relayUrls.length)) throw new Error("The wallet was saved in this browser, but no relay took it. Try again when you are online.");
  return Ot(u, !1);
}
async function Gc(e, t) {
  const { signer: n, store: r, relays: o } = e, i = e.now ?? Date.now() / 1e3, a = new Set(t.destroy.filter((p) => typeof p == "string" && p.length <= 80)), s = t.keep.map((p) => ({ mint: nt(p.mint), proofs: Fr(p.proofs) }));
  if (s.some((p) => !p.mint || !p.proofs)) throw new Error("That is not ecash this wallet can keep.");
  const c = await Xn(r, n), u = s.filter((p) => p.proofs.length > 0).map((p) => ({ event: Bc(), mint: p.mint, proofs: p.proofs })), y = { wallet: c.wallet, tokens: [...c.tokens.filter((p) => !a.has(p.event)), ...u] };
  await xt(r, n, y);
  const d = [...a].filter((p) => !It(p)), h = [];
  for (const p of u) {
    const w = oi(n, { mint: p.mint, proofs: p.proofs, ...d.length && h.length === 0 ? { del: d } : {} }, i);
    Zn(await o.publishAll(w, 6e3).catch(() => []), o.relayUrls.length) && (p.event = w.id, h.push(w.id));
  }
  await xt(r, n, y);
  const f = u.every((p) => !It(p.event));
  if (d.length && f) {
    const p = n.signEvent({ kind: 5, created_at: Math.floor(i), tags: [...d.map((w) => ["e", w]), ["k", String(ze)]], content: "" });
    await o.publishAll(p, 6e3).catch(() => []);
  }
  if (t.history && f && Number.isSafeInteger(t.history.amount) && t.history.amount > 0) {
    const p = n.getPublicKey(), w = n.signEvent({ kind: ca, created_at: Math.floor(i), tags: [], content: n.nip44Encrypt(p, la({ ...t.history, created: h, destroyed: d })) });
    await o.publishAll(w, 6e3).catch(() => []);
  }
  return Ot(y, !1);
}
const ii = "bitlogin:session-public:v1";
async function Hc(e, t) {
  try {
    const n = {
      pubkey: t.pubkey,
      npub: t.npub,
      ...t.name ? { name: t.name } : {}
    };
    await e.set(ii, JSON.stringify(n));
  } catch {
  }
}
async function Ve(e) {
  try {
    await e.delete(ii);
  } catch {
  }
}
class Jc {
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
let fe = null, A = [...Br], D = [...$r];
const v = new dc();
let hn = !1, vn = !1;
function _r(e) {
  hn || (A = e.vaultRelays), vn || (D = e.discoveryRelays);
}
const zc = new Jc();
let S = null, Zt = Date.now();
const Qc = /* @__PURE__ */ new Set(["configure", "lockStatus", "lockOpen", "restoreSession", "getSessionStatus", "logout"]), ai = "bitlogin:taken-back:v1:";
async function Yc(e) {
  try {
    const t = await v.get(ai + e);
    return (t ? Dr(JSON.parse(t)) : null) ?? an;
  } catch {
    return an;
  }
}
function Pr(e, t) {
  try {
    return Dr(JSON.parse(e.nip44Decrypt(e.getPublicKey(), t)));
  } catch {
    return null;
  }
}
function Fe() {
  V(), S && _(S), S = null;
}
async function Pe() {
  const e = await de(v);
  return e ? {
    on: !0,
    // Locked with nothing in the active slot too, where other accounts are kept: theirs are sealed under it.
    locked: !S && (await Et(v) === "locked" || (await B(v)).length > 0),
    device: !!e.device,
    ...e.device ? { credentialId: e.device.credentialId } : {},
    triesLeft: Math.max(0, j.tries - e.tries)
  } : { on: !1, locked: !1, device: !1, triesLeft: 0 };
}
function R() {
  if (!l.signer || !l.everydayPrivateKey)
    throw new Error("No identity is unlocked in this session.");
  return { signer: l.signer, everydayPrivateKey: l.everydayPrivateKey };
}
function G() {
  const e = R();
  if (!l.signerOnly || l.app || !l.site) throw new Error("refused");
  return { ...e, site: l.site };
}
const wn = "bitlogin:world-counts:v1:", Xc = "bitlogin:follows-seen:v1:", gn = /* @__PURE__ */ new Map();
async function he(e, t, n, r = !0) {
  const o = `${wn}${e}:${t}`;
  let i = gn.get(o);
  if (!i)
    try {
      const u = r ? JSON.parse(await v.get(o) ?? "[]") : [];
      i = Array.isArray(u) ? u.filter((y) => typeof y == "number" && Number.isFinite(y)).slice(-n.hourly) : [];
    } catch {
      i = [];
    }
  const a = Yi(n, i), s = Date.now(), c = a.take(s);
  return gn.set(o, a.times()), c && r && await v.set(o, JSON.stringify(a.times())).catch(() => {
  }), c;
}
function en() {
  if (!l.signerOnly || !l.app) throw new Error("refused");
  return l.app;
}
function V() {
  l.signer?.destroy(), l.everydayPrivateKey && l.everydayPrivateKey.fill(0), l.signer = null, l.everydayPrivateKey = null, l.accountId = null, l.recoveryPublicKey = null, l.activeCredentialEvent = null, l.activeRecoveryEvent = null, l.everydayKeyDerived = !1, l.vault?.destroy(), l.vault = null, l.connectionVaultRoot && l.connectionVaultRoot.fill(0), l.connectionVaultRoot = null, l.vaultKnown = !1, l.signerOnly = !1, l.app = null, l.site = null, l.profile = null, l.remember = !1, l.grantAt = null, l.relays = [], l.family = null, l.more = [], l.pendingRecovery && (l.pendingRecovery.recoveryPrivateKey.fill(0), l.pendingRecovery.everydayPrivateKey.fill(0), l.pendingRecovery = null);
}
function Kr(e) {
  return V(), l.pendingRecovery = e, l.signer = new ie(e.everydayPrivateKey), l.everydayPrivateKey = e.everydayPrivateKey, l.accountId = e.accountId, l.recoveryPublicKey = e.recoveryPublicKey, l.activeRecoveryEvent = e.currentRecoveryEvent, l.everydayKeyDerived = e.everydayKeyDerived, mn(
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
function mn(e, t) {
  l.connectionVaultRoot = e ?? null, l.vaultKnown = !0, l.vault = null, t && _(t);
}
async function ve() {
  if (!l.everydayPrivateKey || !l.accountId || !l.recoveryPublicKey || !l.activeCredentialEvent || !l.activeRecoveryEvent)
    return;
  const e = await de(v);
  e && !S && (await Qe(v), await bn());
  const t = {
    everydayPrivateKey: l.everydayPrivateKey,
    accountId: l.accountId,
    recoveryPublicKey: l.recoveryPublicKey,
    activeCredentialEvent: l.activeCredentialEvent,
    activeRecoveryEvent: l.activeRecoveryEvent,
    ...l.connectionVaultRoot ? { connectionVaultRoot: l.connectionVaultRoot } : {},
    ...l.vaultKnown ? { vaultEnabled: l.connectionVaultRoot !== null } : {},
    everydayKeyDerived: l.everydayKeyDerived
  }, n = e && S ? S : null;
  await dn(v, t, n);
  const r = E(l.everydayPrivateKey);
  await dn(v, t, n, F(r));
  const o = Pc(await B(v), r, Date.now() / 1e3);
  for (const i of o.dropped) await H(v, F(i));
  await ge(v, o.list), await si();
}
async function bn() {
  for (const e of await B(v)) await H(v, F(e.pubkey));
  await ge(v, []);
}
async function Sr(e, t) {
  const n = l.everydayPrivateKey ? E(l.everydayPrivateKey) : "";
  let r = await B(v);
  for (const o of r) {
    if (o.pubkey === n) continue;
    const i = await Go(v, e, F(o.pubkey));
    i ? (await dn(v, i, t, F(o.pubkey)), i.everydayPrivateKey.fill(0), i.connectionVaultRoot?.fill(0)) : (await H(v, F(o.pubkey)), r = _t(r, o.pubkey));
  }
  await ge(v, r);
}
async function tn(e) {
  const t = await Go(v, S, e);
  return t ? (V(), l.signer = new ie(t.everydayPrivateKey), l.everydayPrivateKey = t.everydayPrivateKey, l.accountId = t.accountId, l.recoveryPublicKey = t.recoveryPublicKey, l.activeCredentialEvent = t.activeCredentialEvent, l.activeRecoveryEvent = t.activeRecoveryEvent, l.everydayKeyDerived = t.everydayKeyDerived ?? !1, l.connectionVaultRoot = t.connectionVaultRoot ?? null, l.vaultKnown = t.vaultEnabled !== void 0, await si(), {
    restored: !0,
    everydayPublicKey: l.signer.getPublicKey(),
    accountId: t.accountId,
    everydayKeyDerived: l.everydayKeyDerived
  }) : { restored: !1 };
}
async function si() {
  if (!l.signer) return;
  const e = l.signer.getPublicKey();
  await Hc(v, { pubkey: e, npub: je(e) });
}
function Dt() {
  try {
    return new URL(self.location.href).origin;
  } catch {
    return "";
  }
}
function nn(e) {
  if (e === void 0) return Dt();
  const t = Oe(e);
  if (!t || !Qi(Dt())) throw new Error("A wallet connection is for this site only.");
  return t;
}
function kn() {
  if (!l.signer) throw new Error("No identity is unlocked in this session.");
  if (!l.connectionVaultRoot)
    throw new Error(
      l.vaultKnown ? "This account predates the Connection Vault. Enable it from your BitLogin account manager (recovery phrase required)." : "Sign in again to use wallet connections on this device."
    );
  return l.vault ??= new cc(l.connectionVaultRoot.slice()), l.vault;
}
function We(e) {
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
async function Pt() {
  const e = kn(), t = await e.listConnections({ relayUrls: A, store: v });
  return {
    vault: e,
    connections: t.connections.filter((n) => n.record.state !== "deleted"),
    rollbackWarnings: t.rollbackWarnings,
    unreadable: t.unreadable,
    truncated: t.truncated,
    quorumMet: t.quorumMet
  };
}
async function rn(e) {
  const { vault: t, connections: n } = await Pt(), r = n.find((o) => o.record.connection_id === e);
  if (!r) throw new Error("That connection no longer exists.");
  return { vault: t, connection: r };
}
let be = null, J = null;
function Ar(e) {
  self.postMessage({ notify: "nip46-auth-url", url: e });
}
function Be() {
  if (!be) throw new Error("No remote signer is connected.");
  return be;
}
function gt() {
  J && (J.abort.abort(), _(J.clientSecretKey), J = null);
}
function ci(e) {
  const t = e.buildLogoutEvent();
  e.close(), t && e.publishCourtesy(t);
}
function Rr(e, t) {
  be && ci(be.client), be = { client: e, userPubkey: t };
}
async function Zc(e, t) {
  if (l.signerOnly && !Oc.has(e))
    throw new Error("This session can only sign. Sign in at your own BitLogin page for anything else.");
  switch (S && e !== "configure" && Date.now() - Zt > j.idleSec * 1e3 && Fe(), Qc.has(e) || (Zt = Date.now()), e) {
    // ---- The optional lock (lock.ts) ----
    case "lockStatus":
      return Pe();
    // Turn it on, or change the PIN. Only with a full session unlocked: the key that is sealed is the one in hand.
    case "lockEnable": {
      if (R(), await de(v) && !S) throw new Error("Unlock first.");
      const n = await Rc(v, t.pin, S ?? void 0);
      return await Sr(S, n), S && _(S), S = n, await ve(), Pe();
    }
    case "lockSetDevice": {
      if (R(), !S) throw new Error("Turn the lock on first.");
      const n = t, r = I(String(n.prfOutput));
      try {
        await Cc(v, S, String(n.credentialId), r);
      } finally {
        _(r);
      }
      return Pe();
    }
    case "lockRemoveDevice": {
      if (R(), !S) throw new Error("Turn the lock on first.");
      return await Nc(v), Pe();
    }
    case "lockDisable": {
      if (R(), await de(v) && !S) throw new Error("Unlock first.");
      return await Sr(S, null), await Qe(v), S && _(S), S = null, await ve(), Pe();
    }
    case "lockNow": {
      if (!S) throw new Error("The lock is not on.");
      return Fe(), Pe();
    }
    // Open it, with the PIN or with the device. A wrong try is counted; one too many removes the lock and the
    // cached session with it, and the user signs in again the ordinary way.
    case "lockOpen": {
      const n = t;
      let r;
      if (typeof n.prfOutput == "string") {
        const o = I(n.prfOutput);
        try {
          r = await Mc(v, o);
        } finally {
          _(o);
        }
      } else
        r = await Tc(v, n.pin);
      if (r.ok) {
        S && _(S), S = r.lockKey, Zt = Date.now();
        const o = await tn();
        if (o.restored) return { ok: !0, left: j.tries, removed: !1, ...o };
        if (await Et(v) === "none" && (await B(v)).length > 0) return { ok: !0, left: j.tries, removed: !1, restored: !1 };
        await Qe(v), Fe(), r = { ok: !1, left: 0, removed: !0 };
      }
      return r.removed && (Fe(), await bn(), await gr(v), await Ve(v)), { ok: !1, left: r.left, removed: r.removed, restored: !1 };
    }
    // ---- Signer hand-off (docs/sign-in-window.md) ----
    // The receiving side, first: a throwaway key for the hand-off to be sealed to.
    case "handoffBegin":
      return fe && _(fe), fe = qe(), { recipientPublicKey: E(fe) };
    // The sending side: this worker has the session, and seals the everyday
    // key (only that) to the receiving worker's throwaway key.
    case "handoffExport": {
      const { everydayPrivateKey: n } = R(), r = qe(), o = t;
      try {
        return Uc(n, o.recipientPublicKey, r, o.app, {
          ...o.site !== void 0 ? { site: o.site } : {},
          // Only a site that declared nothing is told who they are. An application is held to what it asked,
          // though the window may have read the profile to show the user which account this is.
          ...l.profile && !o.app ? { profile: l.profile } : {},
          ...o.remember === !0 ? { remember: !0 } : {},
          ...o.family !== void 0 ? { family: o.family } : {},
          ...o.more !== void 0 ? { more: o.more } : {},
          // With the lock on, nothing is kept for any site: a key at rest in a site's storage would be a key
          // the lock does not cover. Every site is allowed for the visit, and asks at the sign-in address again.
          ...S ? { visitOnly: !0 } : {},
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
        await wt(v, r.site);
      }
      return {
        kept: await Xt(
          v,
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
      const n = t, r = await vt(v, n.site, Date.now() / 1e3), o = !r && n.family !== void 0 && z(n.family) && Se(n.site, n.family) ? n.family : null, i = r ?? (o ? await vt(v, o, Date.now() / 1e3) : null);
      return !i || o && i.site !== o ? { restored: !1 } : (V(), l.signer = new ie(i.everydayPrivateKey), l.everydayPrivateKey = i.everydayPrivateKey, l.signerOnly = !0, l.app = i.permissions ? { site: i.site, permissions: i.permissions } : null, l.site = o ? n.site : i.site, l.family = o, l.profile = i.profile ?? null, l.remember = !0, l.grantAt = Yt(i), l.relays = i.relays ?? [], l.more = o ? [] : i.more ?? [], {
        restored: !0,
        everydayPublicKey: l.signer.getPublicKey(),
        until: i.until,
        ...i.name ? { name: i.name } : {},
        ...i.profile ? { profile: i.profile } : {},
        signed: i.signed,
        ...i.signedPass ? { signedPass: i.signedPass } : {},
        check: ir(Date.now() / 1e3, Yt(i), i.checkedAt ?? 0),
        ...o ? { family: o } : {},
        ...l.more.length ? { more: ue(l.more) } : {},
        ...i.permissions ? { permissions: i.permissions, signedSensitive: i.signedSensitive ?? [] } : {}
      });
    }
    // Count a signature against the site, where reloading the page can't lose the count.
    case "signerTouch": {
      const { everydayPrivateKey: n } = R();
      if (!l.signerOnly) throw new Error("Only a signer-only session is counted for a site.");
      const r = t, o = Date.now() / 1e3, i = await vt(v, l.family && Se(r.site, l.family) ? l.family : r.site, o);
      return i && E(i.everydayPrivateKey) === E(n) && await Xt(
        v,
        { ...i, signed: Array.isArray(r.signed) ? r.signed : [], ...Array.isArray(r.signedPass) ? { signedPass: r.signedPass } : {}, ...i.permissions ? { signedSensitive: Array.isArray(r.signedSensitive) ? r.signedSensitive : [] } : {} },
        o
      ), {};
    }
    // Signing out of a site that was allowed as one of a family signs out of the family: otherwise its next page
    // load would take the family's grant up again, and the sign-out would not have happened (SF6).
    case "signerForget": {
      const n = t.site;
      await wt(v, n), l.family && Se(n, l.family) && await wt(v, l.family);
      for (const r of ["save", "follow", "seal", "unwrap", "reach", "score", "achieve"])
        gn.delete(`${wn}${r}:${n}`), await v.delete(`${wn}${r}:${n}`).catch(() => {
        });
      return {};
    }
    case "handoffAccept": {
      if (!fe) throw new Error("No hand-off was begun here.");
      const n = fe;
      fe = null;
      let r;
      try {
        r = qc(t, n);
      } finally {
        _(n);
      }
      return V(), l.signer = new ie(r.key), l.everydayPrivateKey = r.key, l.signerOnly = !0, l.app = r.app, l.site = r.site, l.profile = r.profile, l.remember = r.remember, l.grantAt = r.at, l.relays = r.relays, l.family = r.family, l.more = r.more, {
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
      const { signer: n } = R(), r = n.getPublicKey(), o = t.profile !== !1, i = [.../* @__PURE__ */ new Set([...D, ...A])].slice(0, 8);
      if (i.length === 0) return {};
      const a = new K(i);
      try {
        const [s, c] = await Promise.all([
          o ? a.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 4e3) : Promise.resolve(null),
          a.queryQuorum({ kinds: [pt], authors: [r], limit: 2 }, 4e3)
        ]);
        if (l.signer !== n) return {};
        l.profile = s ? mc(s.outcomes.flatMap((u) => u.events), r) : null, l.profile && !l.signerOnly && await ge(v, Kc(await B(v), r, l.profile)), l.relays = dt(c.outcomes.flatMap((u) => u.events), r);
      } finally {
        a.closeAll();
      }
      return { ...l.profile ? { profile: l.profile } : {}, relays: l.relays };
    }
    // ---- Taking a site back (docs/take-back.md) ----
    // At the sign-in address, with a full session: publish the record that says a site, or every site, is taken
    // back as of now. It carries everything an earlier record said, from the relays and from this browser's own
    // copy, so a record built here can never give a site back.
    case "takeBack": {
      const { signer: n } = R(), r = t, o = n.getPublicKey(), i = Date.now() / 1e3, a = r.all === !0 ? { all: !0 } : { site: String(r.site ?? "") }, s = new K([.../* @__PURE__ */ new Set([...D, ...A])].slice(0, 8));
      let c;
      try {
        c = dt((await s.queryQuorum({ kinds: [pt], authors: [o], limit: 2 }, 4e3)).outcomes.flatMap((d) => d.events), o);
      } finally {
        s.closeAll();
      }
      const u = [.../* @__PURE__ */ new Set([...c, ...A])].slice(0, 16), y = new K(u);
      try {
        const d = await y.queryQuorum({ kinds: [Gt], authors: [o], "#d": [jt], limit: 2 }, 5e3);
        if (d.respondedCount === 0) return { ok: !1, accepted: 0, of: u.length };
        const h = rr(d.outcomes.flatMap((b) => b.events), o, i), f = h ? Pr(n, h.content) : null, p = await Yc(o), w = Ri(Ci(f ?? an, p, i), a, i), g = n.signEvent({
          kind: Gt,
          // Later than the one it replaces, whatever the two clocks say.
          created_at: Math.max(Math.floor(i), (h?.created_at ?? 0) + 1),
          tags: [["d", jt]],
          content: n.nip44Encrypt(o, or(w))
        }), m = ce(await y.publishAll(g, 6e3)), k = m >= Math.min(2, u.length);
        return k && await v.set(ai + o, or(w)).catch(() => {
        }), { ok: k, accepted: m, of: u.length };
      } finally {
        y.closeAll();
      }
    }
    // In the embedded signer, for a kept grant: ask the user's relays whether this site was taken back. Asked at
    // most once a day. It can end the grant or leave it be, and nothing else.
    case "signerCheck": {
      const { signer: n } = R();
      if (!l.signerOnly || !l.site) return { state: "ok" };
      const r = l.family ?? l.site, o = Date.now() / 1e3, i = await vt(v, r, o);
      if (!i) return { state: "ok" };
      const a = n.getPublicKey(), s = Yt(i), c = ir(o, s, i.checkedAt ?? 0);
      if (c === "fresh") return { state: "ok" };
      const u = [.../* @__PURE__ */ new Set([...Q(i.relays), ...A])].slice(0, 12), y = new K(u);
      let d, h;
      try {
        [d, h] = await Promise.all([
          y.queryQuorum({ kinds: [Gt], authors: [a], "#d": [jt], limit: 2 }, 5e3),
          y.queryQuorum({ kinds: [pt], authors: [a], limit: 2 }, 5e3)
        ]);
      } finally {
        y.closeAll();
      }
      if (l.signer !== n) return { state: "ok" };
      const f = rr(d.outcomes.flatMap((m) => m.events), a, o), p = f ? Pr(n, f.content) : null;
      if (p && Ni(p, r, s))
        return await wt(v, r), V(), { state: "ended" };
      if (!Ti({
        asked: u.length,
        answered: d.respondedCount,
        seenAt: i.seenAt ?? 0,
        newestAt: f ? f.created_at : null,
        readable: p !== null
      })) return { state: c === "overdue" ? "stale" : "ok" };
      const g = dt(h.outcomes.flatMap((m) => m.events), a);
      return await Xt(
        v,
        {
          ...i,
          checkedAt: Math.floor(o),
          seenAt: Math.max(i.seenAt ?? 0, p && f ? f.created_at : 0),
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
      const r = kc({
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
      const { signer: n, everydayPrivateKey: r, site: o } = G(), i = t, a = me(r, n.getPublicKey());
      try {
        const s = Ji({ conversationKey: a, world: o, slot: i.slot, data: i.data, nowSeconds: Date.now() / 1e3 });
        if (!s || !await he("save", o, zi)) throw new Error("refused");
        return n.signEvent(s);
      } finally {
        _(a);
      }
    }
    case "worldFind": {
      const { signer: n, everydayPrivateKey: r, site: o } = G(), i = me(r, n.getPublicKey());
      try {
        const a = Hi(i, o, t.slot);
        if (!a) throw new Error("refused");
        return { d: a };
      } finally {
        _(i);
      }
    }
    case "worldOpen": {
      const { signer: n, everydayPrivateKey: r, site: o } = G(), i = t.event;
      if (!C(i)) throw new Error("refused");
      const a = me(r, n.getPublicKey());
      try {
        const s = Gi(i, { conversationKey: a, pubkey: n.getPublicKey(), world: o });
        if (!s) throw new Error("refused");
        return s;
      } finally {
        _(a);
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
      const o = t, i = n.getPublicKey(), a = o.list === null ? null : ar(o.list, i);
      if (o.list !== null && !a) throw new Error("refused");
      const s = Xc + i;
      let c = 0;
      try {
        const p = Number(await v.get(s));
        Number.isSafeInteger(p) && p > 0 && (c = p);
      } catch {
      }
      const u = [.../* @__PURE__ */ new Set([...Q(l.relays), ...D, ...A])].slice(0, 8);
      let y = 0, d = 0;
      if (u.length) {
        const p = new K(u);
        try {
          const w = await p.queryQuorum({ kinds: [Ht], authors: [i], limit: 2 }, 3500);
          y = w.respondedCount;
          for (const g of w.outcomes.flatMap((m) => m.events))
            g.created_at > d && ar(g, i) && (d = g.created_at);
        } catch {
        } finally {
          p.closeAll();
        }
      }
      if (l.signer !== n || !l.more.includes("follows")) throw new Error("refused");
      if (c = Math.max(c, d), c && await v.set(s, String(c)).catch(() => {
      }), !$i(a, { answered: y, newestAt: d })) throw new Error("refused");
      const h = ji({ list: a, ...o.add !== void 0 ? { add: o.add } : {}, ...o.remove !== void 0 ? { remove: o.remove } : {}, pubkey: i, nowSeconds: Date.now() / 1e3, seen: c });
      if (!h || !await he("follow", r, ia)) throw new Error("refused");
      const f = n.signEvent(h);
      return await v.set(s, String(Math.max(c, f.created_at))).catch(() => {
      }), f;
    }
    // ---- A score on one of a world's boards (NSWP-15; embedded/scores.ts). For any world its visitor allowed: it
    // is less than a note. The world names its coordinate, a board and a number; the note and the mark that says
    // which site asked are this worker's own.
    case "worldScore": {
      const { signer: n, site: r } = G(), o = t, i = Bi({ world: o.world, board: o.board, score: o.score, title: o.title, format: o.format, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await he("score", r, oa)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- An achievement held in a world (NSWP-16; embedded/achievements.ts). As a score: for any world its visitor
    // allowed, built here from three plain fields, and marked with the site this session serves.
    case "worldAchieve": {
      const { signer: n, site: r } = G(), o = t, i = Wi({ world: o.world, id: o.achievement, title: o.title, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await he("achieve", r, ra)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- Private messages from inside a world (NSWP-14; embedded/messages.ts). Only for a world the user let do
    // this, by name, in the window. The world names a reader and the words, or hands over a wrap; it is never given
    // a key, and nothing else is encrypted or decrypted for it.
    case "worldSeal": {
      const { signer: n, site: r } = G();
      if (!l.more.includes("messages")) throw new Error("refused");
      const o = t, i = Fi(n, { to: o.to, text: o.text, nowSeconds: Date.now() / 1e3 });
      if (!i || !await he("seal", r, na)) throw new Error("refused");
      return i;
    }
    case "worldUnwrap": {
      const { signer: n, site: r } = G();
      if (!l.more.includes("messages")) throw new Error("refused");
      if (!await he("unwrap", r, ta, !1)) throw new Error("refused");
      const o = Vi(n, t.event);
      if (!o) throw new Error("refused");
      return { message: o };
    }
    case "worldReach": {
      const { signer: n, site: r } = G();
      if (!l.more.includes("messages")) throw new Error("refused");
      const o = qi(t.relays, Date.now() / 1e3);
      if (!o || !await he("reach", r, ea)) throw new Error("refused");
      return n.signEvent(o);
    }
    // ---- What an approved application may ask beyond signing (§SW9.5). Refused without a permission set.
    case "appEncrypt": {
      const { signer: n } = R(), r = en(), o = t, i = n.getPublicKey(), a = r.permissions.sign.some((s) => Li.includes(s));
      if (!Ui(r.permissions, i, o.peerPublicKey) && !(a && /^[0-9a-f]{64}$/u.test(String(o.peerPublicKey))))
        throw new Error("refused");
      if (typeof o.text != "string" || o.text.length > 1e5) throw new Error("refused");
      return { text: o.scheme === "nip04" ? n.nip04Encrypt(o.peerPublicKey, o.text) : n.nip44Encrypt(o.peerPublicKey, o.text) };
    }
    case "appDecrypt": {
      const { signer: n } = R(), r = en(), o = t;
      if (!Di(r.permissions, o.peerPublicKey) || typeof o.text != "string") throw new Error("refused");
      return { text: o.scheme === "nip04" ? n.nip04Decrypt(o.peerPublicKey, o.text) : n.nip44Decrypt(o.peerPublicKey, o.text) };
    }
    case "appDecryptEvent": {
      const { signer: n } = R(), r = en(), o = t.event;
      if (!C(o)) throw new Error("refused");
      const i = Oi(r.permissions, n.getPublicKey(), o), a = o.kind === 4 || /\?iv=[A-Za-z0-9+/=]+$/u.test(o.content);
      for (const s of i)
        try {
          return { text: a ? n.nip04Decrypt(s, o.content) : n.nip44Decrypt(s, o.content) };
        } catch {
        }
      throw new Error("refused");
    }
    case "nip46Connect": {
      const r = Ma(t.uri), o = new lr({
        clientSecretKey: qe(),
        pointer: r,
        onAuthUrl: Ar
      });
      try {
        await o.connect();
        const i = await o.getUserPublicKey();
        return Rr(o, i), gt(), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46NostrconnectStart": {
      const n = t, r = A.slice(0, 2);
      gt();
      const o = qe(), i = Ce(O(16));
      return J = { clientSecretKey: o, relayUrls: r, secret: i, abort: new AbortController() }, { uri: Ia({
        clientPubkey: E(o),
        relayUrls: r,
        secret: i,
        name: n.appName?.trim() || "BitLogin",
        perms: ["sign_event", "nip44_encrypt", "nip44_decrypt", "nip04_encrypt", "nip04_decrypt"]
      }) };
    }
    case "nip46NostrconnectAwait": {
      const n = J;
      if (!n) throw new Error("No signer-connection attempt is in progress.");
      let r;
      try {
        ({ signerPubkey: r } = await Oa({
          clientSecretKey: n.clientSecretKey,
          relayUrls: n.relayUrls,
          secret: n.secret,
          timeoutMs: 18e4,
          signal: n.abort.signal
        }));
      } catch (i) {
        throw J === n && gt(), i;
      }
      if (J !== n) throw new Error("This signer-connection attempt was superseded.");
      J = null;
      const o = new lr({
        clientSecretKey: n.clientSecretKey,
        pointer: { signerPubkey: r, relayUrls: n.relayUrls },
        onAuthUrl: Ar
      });
      try {
        const i = await o.getUserPublicKey();
        return Rr(o, i), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46SignEvent": {
      const n = t;
      return Be().client.signEvent({
        kind: n.kind,
        content: n.content,
        tags: n.tags ?? [],
        created_at: n.created_at ?? Math.floor(Date.now() / 1e3)
      });
    }
    case "nip46Nip44Encrypt": {
      const n = t;
      return { ciphertext: await Be().client.nip44Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip44Decrypt": {
      const n = t;
      return { plaintext: await Be().client.nip44Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Nip04Encrypt": {
      const n = t;
      return { ciphertext: await Be().client.nip04Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip04Decrypt": {
      const n = t;
      return { plaintext: await Be().client.nip04Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Disconnect": {
      const n = be;
      return be = null, gt(), n && ci(n.client), {};
    }
    case "configure": {
      const n = t;
      return hn = !!n.vaultRelayUrls?.length, vn = !!n.discoveryRelayUrls?.length, n.vaultRelayUrls?.length && (A = n.vaultRelayUrls), n.discoveryRelayUrls?.length && (D = n.discoveryRelayUrls), _r(bt(await Gr(v))), (!hn || !vn) && _a(v).then(_r, () => {
      }), {};
    }
    case "register": {
      const n = t, r = n.importKey ? await xs({ nsecOrHex: n.importKey, loginName: n.loginName, password: n.password, vaultRelayUrls: A }) : await _o({ loginName: n.loginName, password: n.password, vaultRelayUrls: A });
      return V(), l.signer = new ie(r.everydayPrivateKey), l.everydayPrivateKey = r.everydayPrivateKey, l.accountId = r.accountId, l.recoveryPublicKey = r.recoveryPublicKey, l.activeCredentialEvent = r.credentialEvent, l.activeRecoveryEvent = r.recoveryEvent, l.everydayKeyDerived = r.everydayKeyDerived, mn(r.connectionVaultRoot, r.vaultSudoKey), await ve(), {
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
      const r = Po(t.nsecOrHex), o = E(r), i = { everydayPublicKey: o, npub: je(o) };
      return r.fill(0), i;
    }
    case "login": {
      const n = t, r = await Os({
        loginName: n.loginName,
        password: n.password,
        vaultRelayUrls: A,
        store: v,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return V(), l.signer = new ie(r.everydayPrivateKey), l.everydayPrivateKey = r.everydayPrivateKey, l.accountId = r.accountId, l.recoveryPublicKey = r.recoveryPublicKey, l.activeCredentialEvent = r.credentialEvent, l.activeRecoveryEvent = r.recoveryCapsuleEvent, l.everydayKeyDerived = r.everydayKeyDerived, mn(r.connectionVaultRoot, r.vaultSudoKey), await ve(), !r.rollbackWarning && !r.relayDisagreementWarning && dr({
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
      const n = t, r = await Ds({
        phrase: n.phrase,
        vaultRelayUrls: A,
        discoveryRelayUrls: D,
        offlineRecoveryCapsuleEvents: n.offlineExportFile?.recovery_capsule_events
      });
      return Kr(r);
    }
    case "previewPhraseRebuild": {
      const r = await Ls({ phrase: t.phrase, vaultRelayUrls: A, discoveryRelayUrls: D });
      return { ...r, npub: je(r.everydayPublicKey) };
    }
    case "rebuildFromPhrase": {
      const r = await Us({ phrase: t.phrase, vaultRelayUrls: A, discoveryRelayUrls: D });
      return Kr(r);
    }
    case "completeRecovery": {
      const n = t;
      if (!l.pendingRecovery) throw new Error("No recovery is in progress in this session.");
      const r = await qs({
        recovered: l.pendingRecovery,
        newLoginName: n.newLoginName,
        newPassword: n.newPassword,
        vaultRelayUrls: A,
        store: v
      });
      return l.activeCredentialEvent = r.credentialEvent, l.activeRecoveryEvent = r.refreshedRecoveryEvent, l.pendingRecovery.recoveryPrivateKey.fill(0), l.pendingRecovery = null, await ve(), {
        locatorPublicKey: r.locatorPublicKey,
        credentialEventId: r.credentialEvent.id,
        refreshedRecoveryEventId: r.refreshedRecoveryEvent.id
      };
    }
    case "changePassword": {
      const n = t, r = await Vs({
        loginName: n.loginName,
        oldPassword: n.oldPassword,
        newPassword: n.newPassword,
        vaultRelayUrls: A,
        store: v,
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
      return gs({
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
          const o = Xi(l.app.permissions, r, l.app.site, Date.now() / 1e3);
          if (!o) throw new Error("refused");
          return n.signEvent(o);
        }
        if (Zi(r.kind) !== "ordinary") throw new Error("refused");
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
      return { nsec: pi(n), npub: je(r.getPublicKey()) };
    }
    case "buildRecoveryExport": {
      if (R(), !l.recoveryPublicKey || !l.activeRecoveryEvent)
        throw new Error("No recovery capsule is known in this session yet.");
      return fi({
        recoveryPublicKeyHex: l.recoveryPublicKey,
        vaultRelayUrls: A,
        recoveryCapsuleEvents: [l.activeRecoveryEvent],
        relayListEvents: []
      });
    }
    case "repairReplicas": {
      if (!l.activeCredentialEvent || !l.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return dr({
        relayUrls: A,
        credentialEvent: l.activeCredentialEvent,
        recoveryEvent: l.activeRecoveryEvent
      });
    }
    case "checkReplicaHealth": {
      if (!l.activeCredentialEvent || !l.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Ts({
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
      return !S && await Et(v) === "locked" ? { restored: !1, locked: !0 } : tn();
    // Log out: this account is forgotten on this device. Other accounts kept here stay, and so does the lock
    // they are sealed under; with none left, everything goes as it always did.
    case "logout": {
      const n = l.everydayPrivateKey && !l.signerOnly ? E(l.everydayPrivateKey) : "", r = _t(await B(v), n);
      return n && await H(v, F(n)), r.length > 0 && n ? (await ge(v, r), V(), await H(v), await Ve(v), {}) : (Fe(), await Qe(v), await bn(), await gr(v), await Ve(v), {});
    }
    // ---- Several accounts on one device (docs/account-switching.md) ----
    // Who is kept here, and which of them is signed in. Public keys and what their own profiles call them.
    case "accountsList": {
      const n = l.everydayPrivateKey && !l.signerOnly ? E(l.everydayPrivateKey) : "";
      return { accounts: (await B(v)).map((r) => ({ ...r, active: r.pubkey === n })) };
    }
    // Switch to a kept account: its own slot is opened, on this device, with no password and no relay. With the
    // lock on and locked, it says so, and nothing changes.
    case "accountsSwitch": {
      if (l.signerOnly) throw new Error("A signer-only session cannot switch accounts.");
      const n = String(t.pubkey ?? ""), r = await B(v);
      if (!r.some((i) => i.pubkey === n)) return { restored: !1 };
      if (!S && await Et(v, F(n)) === "locked") return { restored: !1, locked: !0 };
      const o = await tn(F(n));
      return !o.restored || o.everydayPublicKey !== n ? (V(), await H(v, F(n)), await ge(v, _t(r, n)), await H(v), await Ve(v), { restored: !1 }) : (await ve(), o);
    }
    // Make room to sign in as another account: nobody is signed in, and everyone kept stays kept.
    case "accountsAdd": {
      if (l.signerOnly) throw new Error("A signer-only session cannot add accounts.");
      return V(), await H(v), await Ve(v), {};
    }
    // Forget one kept account that is not the one signed in. (For that one: log out.)
    case "accountsRemove": {
      const n = String(t.pubkey ?? ""), r = l.everydayPrivateKey && !l.signerOnly ? E(l.everydayPrivateKey) : "";
      if (n === r) throw new Error("Log out to remove the account that is signed in.");
      return await H(v, F(n)), await ge(v, _t(await B(v), n)), {};
    }
    // ---- Connection Vault (connection-vault.md §12, reveal mode) ----
    // ---- An ecash wallet kept with the account (docs/ecash.md). A full session only: none of these is on the list a
    // handed-over session may ask, so no embedded signer, and so no site, can read a token.
    // The words of their newest profile note, to show what a proposed one would change. Read-only, and theirs.
    case "profileContent": {
      const { signer: n } = R(), r = n.getPublicKey(), o = [.../* @__PURE__ */ new Set([...l.relays, ...D, ...A])].slice(0, 10);
      if (o.length === 0) return { content: null, answered: !1 };
      const i = new K(o);
      try {
        const a = await i.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 3500), s = a.outcomes.flatMap((c) => c.events).filter((c) => c.kind === 0 && c.pubkey === r && C(c)).sort((c, u) => u.created_at - c.created_at)[0];
        return { content: s ? s.content : null, answered: a.respondedCount > 0 };
      } finally {
        i.closeAll();
      }
    }
    // The mints people recommend (NIP-87): read from relays, counted one voice per account, the user's own follows
    // first. It reads public notes and the user's follow list, and writes nothing.
    case "ecashMints": {
      const { signer: n } = R(), r = n.getPublicKey(), o = [.../* @__PURE__ */ new Set([...D, ...A])].slice(0, 8);
      if (o.length === 0) return { mints: [] };
      const i = new K(o);
      try {
        const [a, s] = await Promise.all([
          i.queryQuorum({ kinds: [ti], "#k": [ni], limit: 500 }, 5e3),
          i.queryQuorum({ kinds: [Ht], authors: [r], limit: 2 }, 4e3)
        ]), c = s.outcomes.flatMap((d) => d.events).filter((d) => d.pubkey === r && d.kind === Ht && C(d)).sort((d, h) => h.created_at - d.created_at)[0], u = new Set((c?.tags ?? []).filter((d) => d[0] === "p" && typeof d[1] == "string").map((d) => d[1])), y = new Map(a.outcomes.flatMap((d) => d.events).filter((d) => C(d)).map((d) => [d.id, d]));
        return { mints: Wc([...y.values()], u) };
      } finally {
        i.closeAll();
      }
    }
    case "ecashLoad":
    case "ecashSetMints":
    case "ecashRoll": {
      const { signer: n } = R(), r = n.getPublicKey(), o = new K([.../* @__PURE__ */ new Set([...D, ...A])].slice(0, 8));
      let i = l.relays;
      if (i.length === 0)
        try {
          i = dt((await o.queryQuorum({ kinds: [pt], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((c) => c.events), r);
        } catch {
          i = [];
        } finally {
          o.closeAll();
        }
      else o.closeAll();
      const a = [.../* @__PURE__ */ new Set([...i, ...A])].slice(0, 16), s = new K(a);
      try {
        const c = { signer: n, store: v, relays: s };
        return e === "ecashLoad" ? await $c(c) : e === "ecashSetMints" ? await jc({ ...c, newKey: () => Ce(qe()) }, t.mints) : await Gc(c, t);
      } finally {
        s.closeAll();
      }
    }
    case "vaultStatus":
      return l.signer ? l.connectionVaultRoot ? { enabled: !0, vaultPublicKey: kn().vaultPublicKey } : { enabled: !1, reason: l.vaultKnown ? "no-vault" : "stale-cache" } : { enabled: !1 };
    case "vaultList": {
      const { connections: n, rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: a } = await Pt();
      return { connections: n.map(We), rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: a };
    }
    case "vaultSaveNwc": {
      const n = t, r = nn(n.site), o = kn(), i = vr(n.uri), a = n.label.trim().slice(0, 120) || "Wallet connection", { record: s, event: c } = await o.createConnection({
        connection_type: "nwc",
        tier: "connectable",
        label: a,
        credential: i,
        application_binding: { origin: r, app_pubkey: null }
      });
      if (!(await o.publish({
        event: c,
        connectionId: s.connection_id,
        relayUrls: A,
        store: v
      })).success)
        throw new Error("The connection could not be saved to enough relays. Please try again.");
      const y = await o.decryptEvent(c);
      return We(y);
    }
    case "vaultFindForOrigin": {
      const n = nn(t.site), { connections: r } = await Pt(), o = r.find(
        (i) => i.record.connection_type === "nwc" && i.record.state === "active" && i.record.application_binding.origin === n
      );
      return { connection: o ? We(o) : null };
    }
    case "vaultRevealNwc": {
      const n = t, r = nn(n.site), { connection: o } = await rn(n.connectionId);
      if (o.record.connection_type !== "nwc" || o.record.state !== "active")
        throw new Error("That connection is not an active wallet connection.");
      const i = o.record.application_binding.origin;
      if (i !== null && i !== r)
        throw new Error("That connection belongs to a different site.");
      const a = o.record.credential;
      return Lo(a), { uri: Xs(a) };
    }
    case "vaultSetBinding": {
      const n = t, { vault: r, connection: o } = await rn(n.connectionId), i = n.origin === null ? null : Dt(), { record: a, event: s } = await r.updateConnection(o, {
        application_binding: { origin: i, app_pubkey: null }
      });
      if (!(await r.publish({
        event: s,
        connectionId: a.connection_id,
        relayUrls: A,
        store: v
      })).success) throw new Error("The change could not reach enough relays. Please try again.");
      const u = await r.decryptEvent(s);
      return We(u);
    }
    case "vaultDelete": {
      const n = t, { vault: r, connection: o } = await rn(n.connectionId), { record: i, event: a } = await r.deleteConnection(o);
      if (!(await r.publish({
        event: a,
        connectionId: i.connection_id,
        relayUrls: A,
        store: v
      })).success) throw new Error("The deletion could not reach enough relays. Please try again.");
      try {
        const c = r.buildDeletionRequest(o.event.id), u = new K(A);
        await u.publishAll(c), u.closeAll();
      } catch {
      }
      return {};
    }
    case "vaultOfferCheck": {
      const n = t, r = Dt(), o = vr(n.uri), { connections: i } = await Pt(), a = i.find(
        (s) => s.record.connection_type === "nwc" && Zs(s.record.credential, o)
      );
      return a ? a.record.application_binding.origin !== r ? { duplicate: !1 } : { duplicate: !0, connection: We(a) } : { duplicate: !1 };
    }
    default:
      throw new Error(`Unknown worker action: ${e}`);
  }
}
const el = /* @__PURE__ */ new Set([
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
  if (typeof t.action != "string" || !el.has(t.action)) {
    const a = {
      id: t.id,
      ok: !1,
      error: `Unknown worker action: ${String(t.action)}`,
      errorName: "Error"
    };
    self.postMessage(a);
    return;
  }
  const { id: n, action: r, payload: o } = e.data;
  (r.startsWith("nip46") ? (a) => a() : (a) => zc.run(a))(() => Zc(r, o)).then(
    (a) => {
      const s = { id: n, ok: !0, result: a };
      self.postMessage(s);
    },
    (a) => {
      const s = a instanceof Error ? a : new Error(String(a)), c = { id: n, ok: !1, error: s.message, errorName: s.name };
      self.postMessage(c);
    }
  );
});
