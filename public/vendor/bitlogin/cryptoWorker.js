import { K as fi, b as pi, c as H, D as Lr, d as We, f as xt, w as _, u as Pt, g as Dt, h as dt, j as Cn, S as Wt, k as Gt, l as Xe, m as mt, B as hi, n as vi, o as Ht, q as ft, r as xn, s as Tn, a as lt, t as Dr, v as wi, x as gi } from "./bitlogin-shared-B1USaWR3.js";
import { g as k, s as oe, v as M, b as pt, a as G, f as Qe, e as Ze, h as In, i as Ur, u as z, j as bi, k as zt, l as On, m as Mn, n as mi, o as ki, p as Ei, q as _i, t as Pi, w as Qt, x as cr, y as Ki, z as Ai, A as Ri, c as I, d as V, B as Ln, C as Si, D as Vr, E as pn, F as Kt } from "./bitlogin-shared-BZPITbpl.js";
import { h as Jt, a as et, c as Ni, l as qr, s as Ci } from "./bitlogin-shared-DSv2Wjlg.js";
import { b as kt, r as Ue, c as Ke, k as xi, i as Fe, d as lr, T as Zt, e as en, R as tn, n as ur, g as Ti, h as Ii, w as nn, t as Oi, m as Mi, N as hn, j as yr, l as Br } from "./bitlogin-shared-D0Tnl0qY.js";
import { c as Li, i as ht, r as Dn, m as Un, A as Ut, k as Di, p as Ui, j as Vi, n as qi, o as Bi, M as Fi, q as $i } from "./bitlogin-shared-BGjrJsFT.js";
function Fr(e) {
  const t = k(e.privateKey);
  return oe({
    pubkey: t,
    created_at: e.createdAt,
    kind: fi,
    tags: [
      ["e", e.eventIdToDelete],
      ["k", String(e.deletedEventKind)]
    ],
    content: e.reason ?? ""
  }, e.privateKey);
}
function ji() {
  const e = globalThis.WebSocket;
  if (!e)
    throw new Error("No global WebSocket implementation is available in this environment.");
  return e;
}
const Vt = 1e3, Wi = 262144;
function Gi(e) {
  const t = Math.min(e.limit ?? Vt, Vt);
  return Math.max(50, t * 3);
}
const Hi = 2048, zi = 1e4, Ji = 100;
function Yi(e, t) {
  if (e.size >= Hi) {
    const n = e.values().next().value;
    n !== void 0 && e.delete(n);
  }
  e.add(t);
}
class Vn {
  url;
  ws = null;
  connectPromise = null;
  subs = /* @__PURE__ */ new Map();
  pendingPublishes = /* @__PURE__ */ new Map();
  authPrivateKey;
  connectTimeoutMs;
  authenticated = !1;
  constructor(t, n = {}) {
    if (!kt(t))
      throw new Error("Relay URL must use secure WebSockets, except for an explicit loopback development endpoint.");
    this.url = t, this.authPrivateKey = n.authPrivateKey, this.connectTimeoutMs = n.connectTimeoutMs ?? 8e3;
  }
  async connect() {
    return this.connectPromise ? this.connectPromise : (this.connectPromise = new Promise((t, n) => {
      const r = ji(), o = new r(this.url);
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
    if (t.length > Wi)
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
        const y = Date.now();
        if (y - a.liveWindowStart >= zi && (a.liveWindowStart = y, a.liveVerifies = 0), a.liveVerifies >= Ji || (a.liveVerifies++, !M(s) || !dr(s, a.filter)))
          return;
        Yi(a.seenIds, s.id), a.onEvent(s);
        return;
      }
      const u = Math.min(a.filter.limit ?? Vt, Vt);
      if (a.events.length >= u || a.verifyBudget <= 0 || (a.verifyBudget--, !M(s) || !dr(s, a.filter)))
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
    const n = k(this.authPrivateKey), r = oe({
      pubkey: n,
      created_at: Math.floor(Date.now() / 1e3),
      kind: pi,
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
    const r = pt(G(8));
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
    const r = pt(G(8));
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
        verifyBudget: Gi(t),
        liveWindowStart: 0,
        liveVerifies: 0,
        filter: t,
        onEose: () => a()
      }), this.send(["REQ", r, t]);
    });
  }
}
function dr(e, t) {
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
class A {
  connections = /* @__PURE__ */ new Map();
  constructor(t, n = {}) {
    for (const r of new Set(t))
      this.connections.set(r, new Vn(r, n));
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
function Te(e) {
  return e.filter((t) => t.result.ok).length;
}
const Et = null, $r = [
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
], jr = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  // Added 2026-11-18: relay.nostr.band timed out and nostr-pub.wellorder.net
  // never connected in the same measurement, leaving two working lookups.
  "wss://nos.lol"
], Xi = [], Qi = /^[0-9a-f]{64}$/u, Zi = 64;
function rn(e) {
  return Array.isArray(e) && e.length <= Zi && e.every((t) => typeof t == "string" && kt(t)) && new Set(e).size === e.length;
}
function Yt(e, t = Et, n = -1) {
  if (!t || !Qi.test(t) || /^0{64}$/u.test(t) || !M(e) || e.pubkey !== t || e.kind !== H || Qe(e, "d") !== Lr)
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
function ea(e) {
  return Math.max(0, e - 1);
}
function fr(e, t, n) {
  const r = t ? n === "vault" ? t.vaultRelays : t.discoveryRelays : [], o = new Set(t?.deprecated ?? []), i = new Set(e), s = [...new Set(r)].filter((a) => !o.has(a) && !i.has(a)).slice(0, ea(e.length));
  return [...e, ...s];
}
async function ta(e, t = Et, n = -1, r = 6e3) {
  if (!t || e.length === 0)
    return null;
  const o = new A([...e]);
  let i;
  try {
    i = (await o.queryQuorum({ kinds: [H], authors: [t], "#d": [Lr], limit: 3 }, r)).outcomes.flatMap((c) => c.events);
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
const Wr = "bitlogin:bootstrap-relays:v1";
async function Gr(e, t = Et) {
  if (!t)
    return null;
  try {
    const n = await e.get(Wr);
    return n ? Yt(JSON.parse(n), t) : null;
  } catch {
    return null;
  }
}
function Tt(e) {
  return {
    vaultRelays: fr($r, e, "vault"),
    discoveryRelays: fr(jr, e, "discovery"),
    listVersion: e?.version ?? null
  };
}
async function na(e, t = {}) {
  const n = t.maintainerPubkeyHex === void 0 ? Et : t.maintainerPubkeyHex, r = await Gr(e, n);
  if (!n)
    return Tt(null);
  const o = Tt(r), i = r?.version ?? -1;
  try {
    let s = await ta(t.queryRelayUrls ?? [.../* @__PURE__ */ new Set([...o.vaultRelays, ...o.discoveryRelays])], n, i, t.timeoutMs);
    if (!s) {
      const a = await ra(t.httpsFallbackUrls ?? Xi, n, i), c = a ? Yt(a, n, i) : null;
      a && c && (s = { event: a, list: c });
    }
    return s ? (await e.set(Wr, JSON.stringify(s.event)), Tt(s.list)) : o;
  } catch {
    return o;
  }
}
async function ra(e, t = Et, n = -1) {
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
      if (M(a) && Yt(a, t, n))
        return a;
    } catch {
    }
  return null;
}
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function oa(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
function pr(e) {
  if (typeof e != "boolean")
    throw new TypeError(`boolean expected, not ${e}`);
}
function on(e) {
  if (typeof e != "number")
    throw new TypeError("number expected, got " + typeof e);
  if (!Number.isSafeInteger(e) || e < 0)
    throw new RangeError("positive integer expected, got " + e);
}
function j(e, t, n = "") {
  const r = oa(e), o = e?.length, i = t !== void 0;
  if (!r || i && o !== t) {
    const s = n && `"${n}" `, a = i ? ` of length ${t}` : "", c = r ? `length=${o}` : `type=${typeof e}`, u = s + "expected Uint8Array" + a + ", got " + c;
    throw r ? new RangeError(u) : new TypeError(u);
  }
  return e;
}
function U(e) {
  return new Uint32Array(e.buffer, e.byteOffset, Math.floor(e.byteLength / 4));
}
function Me(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
const se = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68, ia = (e) => e << 24 & 4278190080 | e << 8 & 16711680 | e >>> 8 & 65280 | e >>> 24 & 255, aa = (e) => {
  for (let t = 0; t < e.length; t++)
    e[t] = ia(e[t]);
  return e;
}, W = se ? (e) => e : aa;
function sa(e, t) {
  return !e.byteLength || !t.byteLength ? !1 : e.buffer === t.buffer && // best we can do, may fail with an obscure Proxy
  e.byteOffset < t.byteOffset + t.byteLength && // a starts before b end
  t.byteOffset < e.byteOffset + e.byteLength;
}
function Hr(e, t) {
  if (sa(e, t) && e.byteOffset < t.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function ca(e, t) {
  if (t == null || typeof t != "object")
    throw new Error("options must be defined");
  return Object.assign(e, t);
}
const la = /* @__NO_SIDE_EFFECTS__ */ (e, t) => {
  function n(r, ...o) {
    if (j(r, void 0, "key"), e.nonceLength !== void 0) {
      const y = o[0];
      j(y, e.varSizeNonce ? void 0 : e.nonceLength, "nonce");
    }
    const i = e.tagLength;
    i && o[1] !== void 0 && j(o[1], void 0, "AAD");
    const s = t(r, ...o), a = (y, d) => {
      if (d !== void 0) {
        if (y !== 2)
          throw new Error("cipher output not supported");
        j(d, void 0, "output");
      }
    };
    let c = !1;
    return {
      encrypt(y, d) {
        if (c)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return c = !0, j(y), a(s.encrypt.length, d), s.encrypt(y, d);
      },
      decrypt(y, d) {
        if (j(y), i && y.length < i)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + i);
        return a(s.decrypt.length, d), s.decrypt(y, d);
      }
    };
  }
  return Object.assign(n, e), n;
};
function qn(e, t, n = !0) {
  if (t === void 0)
    return new Uint8Array(e);
  if (j(t, void 0, "output"), t.length !== e)
    throw new Error('"output" expected Uint8Array of length ' + e + ", got: " + t.length);
  if (n && !pe(t))
    throw new Error("invalid output, must be aligned");
  return t;
}
function pe(e) {
  return e.byteOffset % 4 === 0;
}
function Ie(e) {
  return Uint8Array.from(j(e));
}
const zr = (e) => Uint8Array.from(e.split(""), (t) => t.charCodeAt(0)), ua = W(U(zr("expand 16-byte k"))), ya = W(U(zr("expand 32-byte k")));
function P(e, t) {
  return e << t | e >>> 32 - t;
}
const nt = 64, da = 16, vn = 2 ** 32 - 1, hr = /* @__PURE__ */ Uint32Array.of();
function fa(e, t, n, r, o, i, s, a) {
  const c = o.length, u = new Uint8Array(nt), y = U(u), d = se && pe(o) && pe(i), p = d ? U(o) : hr, f = d ? U(i) : hr;
  if (!se) {
    for (let w = 0; w < c; s++) {
      if (e(t, n, r, y, s, a), W(y), s >= vn)
        throw new Error("arx: counter overflow");
      const g = Math.min(nt, c - w);
      for (let b = 0, h; b < g; b++)
        h = w + b, i[h] = o[h] ^ u[b];
      w += g;
    }
    return;
  }
  for (let w = 0; w < c; s++) {
    if (e(t, n, r, y, s, a), s >= vn)
      throw new Error("arx: counter overflow");
    const g = Math.min(nt, c - w);
    if (d && g === nt) {
      const b = w / 4;
      if (w % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let h = 0, m; h < da; h++)
        m = b + h, f[m] = p[m] ^ y[h];
      w += nt;
      continue;
    }
    for (let b = 0, h; b < g; b++)
      h = w + b, i[h] = o[h] ^ u[b];
    w += g;
  }
}
function pa(e, t) {
  const { allowShortKeys: n, extendNonceFn: r, counterLength: o, counterRight: i, rounds: s } = ca({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, t);
  if (typeof e != "function")
    throw new Error("core must be a function");
  return on(o), on(s), pr(i), pr(n), (a, c, u, y, d = 0) => {
    j(a, void 0, "key"), j(c, void 0, "nonce"), j(u, void 0, "data");
    const p = u.length;
    if (y = qn(p, y, !1), on(d), d < 0 || d >= vn)
      throw new Error("arx: counter overflow");
    const f = [];
    let w = a.length, g, b;
    if (w === 32)
      f.push(g = Ie(a)), b = ya;
    else if (w === 16 && n)
      g = new Uint8Array(32), g.set(a), g.set(a, 16), b = ua, f.push(g);
    else
      throw j(a, 32, "arx key"), new Error("invalid key size");
    (!se || !pe(c)) && f.push(c = Ie(c));
    let h = U(g);
    if (r) {
      if (c.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const R = c.subarray(0, 16);
      if (se)
        r(b, h, U(R), h);
      else {
        const q = W(Uint32Array.from(b));
        r(q, h, U(R), h), Me(q), W(h);
      }
      c = c.subarray(16);
    } else se || W(h);
    const m = 16 - o;
    if (m !== c.length)
      throw new Error(`arx: nonce must be ${m} or 16 bytes`);
    if (m !== 12) {
      const R = new Uint8Array(12);
      R.set(c, i ? 0 : 12 - c.length), c = R, f.push(c);
    }
    const E = W(U(c));
    try {
      return fa(e, b, h, E, u, y, d, s), y;
    } finally {
      Me(...f);
    }
  };
}
function ha(e, t, n, r, o, i = 20) {
  let s = e[0], a = e[1], c = e[2], u = e[3], y = t[0], d = t[1], p = t[2], f = t[3], w = t[4], g = t[5], b = t[6], h = t[7], m = o, E = n[0], R = n[1], q = n[2], N = s, O = a, T = c, L = u, B = y, F = d, D = p, J = f, Y = w, X = g, Q = b, Z = h, ee = m, te = E, ne = R, re = q;
  for (let sr = 0; sr < i; sr += 2)
    N = N + B | 0, ee = P(ee ^ N, 16), Y = Y + ee | 0, B = P(B ^ Y, 12), N = N + B | 0, ee = P(ee ^ N, 8), Y = Y + ee | 0, B = P(B ^ Y, 7), O = O + F | 0, te = P(te ^ O, 16), X = X + te | 0, F = P(F ^ X, 12), O = O + F | 0, te = P(te ^ O, 8), X = X + te | 0, F = P(F ^ X, 7), T = T + D | 0, ne = P(ne ^ T, 16), Q = Q + ne | 0, D = P(D ^ Q, 12), T = T + D | 0, ne = P(ne ^ T, 8), Q = Q + ne | 0, D = P(D ^ Q, 7), L = L + J | 0, re = P(re ^ L, 16), Z = Z + re | 0, J = P(J ^ Z, 12), L = L + J | 0, re = P(re ^ L, 8), Z = Z + re | 0, J = P(J ^ Z, 7), N = N + F | 0, re = P(re ^ N, 16), Q = Q + re | 0, F = P(F ^ Q, 12), N = N + F | 0, re = P(re ^ N, 8), Q = Q + re | 0, F = P(F ^ Q, 7), O = O + D | 0, ee = P(ee ^ O, 16), Z = Z + ee | 0, D = P(D ^ Z, 12), O = O + D | 0, ee = P(ee ^ O, 8), Z = Z + ee | 0, D = P(D ^ Z, 7), T = T + J | 0, te = P(te ^ T, 16), Y = Y + te | 0, J = P(J ^ Y, 12), T = T + J | 0, te = P(te ^ T, 8), Y = Y + te | 0, J = P(J ^ Y, 7), L = L + B | 0, ne = P(ne ^ L, 16), X = X + ne | 0, B = P(B ^ X, 12), L = L + B | 0, ne = P(ne ^ L, 8), X = X + ne | 0, B = P(B ^ X, 7);
  let $ = 0;
  r[$++] = s + N | 0, r[$++] = a + O | 0, r[$++] = c + T | 0, r[$++] = u + L | 0, r[$++] = y + B | 0, r[$++] = d + F | 0, r[$++] = p + D | 0, r[$++] = f + J | 0, r[$++] = w + Y | 0, r[$++] = g + X | 0, r[$++] = b + Q | 0, r[$++] = h + Z | 0, r[$++] = m + ee | 0, r[$++] = E + te | 0, r[$++] = R + ne | 0, r[$++] = q + re | 0;
}
const Jr = /* @__PURE__ */ pa(ha, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
}), Yr = 2, wn = 1, Xr = 65536, va = 4294967295, wa = 132, ga = 99, gn = 1024 * 1024;
function qt(e, t) {
  const n = Ze(new Uint8Array([2]), In(t)), o = Ur.getSharedSecret(e, n, !0).slice(1, 33);
  return Jt(z("nip44-v2"), o);
}
function Qr(e, t) {
  if (e.length !== 32)
    throw new Error("NIP-44 conversation key must be exactly 32 bytes.");
  if (t.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const n = et(e, t, 76);
  return {
    chachaKey: n.slice(0, 32),
    chachaNonce: n.slice(32, 44),
    hmacKey: n.slice(44, 76)
  };
}
function Bn(e) {
  if (e <= 32)
    return 32;
  const t = 2 ** Math.floor(Math.log2(e - 1) + 1), n = t <= 256 ? 32 : t / 8;
  return n * (Math.floor((e - 1) / n) + 1);
}
const Zr = 39 + Bn(gn) + 32, ba = Math.ceil(Zr / 3) * 4;
function ma(e) {
  if (e < Xr) {
    const n = new Uint8Array(2);
    return new DataView(n.buffer).setUint16(0, e, !1), n;
  }
  const t = new Uint8Array(6);
  return new DataView(t.buffer).setUint32(2, e, !1), t;
}
function ka(e) {
  const t = e.length;
  if (t < wn || t > gn)
    throw new Error(`NIP-44 plaintext length must be between ${wn} and ${gn} bytes on this platform.`);
  const n = ma(t), r = Bn(t), o = new Uint8Array(n.length + r);
  return o.set(n, 0), o.set(e, n.length), o;
}
function Ea(e) {
  const t = new DataView(e.buffer, e.byteOffset, e.byteLength), n = t.getUint16(0, !1);
  let r, o;
  if (n === 0) {
    if (r = t.getUint32(2, !1), o = 6, r < Xr)
      throw new Error("NIP-44 payload has inconsistent padding.");
  } else
    r = n, o = 2;
  if (r < wn || r > va || e.length !== o + Bn(r))
    throw new Error("NIP-44 payload has inconsistent padding.");
  return e.slice(o, o + r);
}
function eo(e, t, n) {
  return On(Mn, e, Ze(t, n));
}
function bn(e, t) {
  return _a(e, t, G(32));
}
function _a(e, t, n) {
  if (n.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const { chachaKey: r, chachaNonce: o, hmacKey: i } = Qr(e, n), s = ka(z(t)), a = Jr(r, o, s), c = eo(i, n, a);
  return We.encode(Ze(new Uint8Array([Yr]), n, a, c));
}
function Fn(e, t) {
  if (t.startsWith("#"))
    throw new Error("Unsupported NIP-44 non-base64 encoding.");
  if (t.length < wa || t.length > ba)
    throw new Error("NIP-44 payload size is outside this platform's supported range.");
  const n = We.decode(t);
  if (n.length < ga || n.length > Zr)
    throw new Error("NIP-44 decoded payload size is outside this platform's supported range.");
  if (n[0] !== Yr)
    throw new Error(`Unsupported NIP-44 version: ${n[0]}`);
  const r = n.slice(1, 33);
  if (r.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const o = n.slice(n.length - 32), i = n.slice(33, n.length - 32), { chachaKey: s, chachaNonce: a, hmacKey: c } = Qr(e, r), u = eo(c, r, i);
  if (!bi(o, u))
    throw new Error("NIP-44 MAC verification failed: payload is corrupted, tampered, or uses the wrong key.");
  const y = Jr(s, a, i);
  return zt(Ea(y));
}
const $n = /^[0-9a-f]{64}$/u, Pa = 8, Ka = 4096, Aa = 256, Ra = 512;
class Ve extends Error {
  name = "BunkerUriParseError";
}
class Sa extends Error {
  name = "Nip46RequestTimeoutError";
  constructor(t, n) {
    super(`The remote signer did not answer ${t} within ${Math.round(n / 1e3)}s. It may be offline, or waiting for your approval on another device -- check your signer and try again.`);
  }
}
class Na extends Error {
  name = "Nip46ErrorResponse";
}
function Ca(e) {
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return null;
  }
  const n = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol === "https:" || t.protocol === "http:" && n ? t.toString() : null;
}
function xa(e) {
  if (e.length > Ka)
    throw new Ve("That bunker URI is unreasonably long.");
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    throw new Ve("That doesn't look like a valid URI.");
  }
  if (t.protocol !== "bunker:")
    throw new Ve("A remote-signer URI must start with bunker://");
  const n = (t.host || t.pathname.replace(/^\/+/u, "")).toLowerCase();
  if (!$n.test(n))
    throw new Ve("The bunker URI does not name a valid signer public key.");
  const r = [
    ...new Set(t.searchParams.getAll("relay").map((i) => i.trim()).filter((i) => i.length > 0 && i.length <= Ra))
  ].slice(0, Pa);
  if (r.length === 0)
    throw new Ve("The bunker URI names no relays -- without at least one relay= parameter there is no way to reach the signer.");
  const o = t.searchParams.get("secret") ?? void 0;
  if (o && o.length > Aa)
    throw new Ve("The bunker URI's secret is unreasonably long.");
  return { signerPubkey: n, relayUrls: r, secret: o || void 0 };
}
function Ta(e) {
  if (!$n.test(e.clientPubkey))
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
const Ia = 12e4;
class vr {
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
    this.clientSecretKey = t.clientSecretKey, this.clientPubkey = k(t.clientSecretKey), this.pointer = t.pointer, this.conversationKey = qt(t.clientSecretKey, t.pointer.signerPubkey), this.onAuthUrl = t.onAuthUrl, this.requestTimeoutMs = t.requestTimeoutMs ?? Ia, this.conns = t.pointer.relayUrls.map((n) => new Vn(n, { authPrivateKey: t.clientSecretKey }));
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
        kinds: [xt],
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
      n = JSON.parse(Fn(this.conversationKey, t.content));
    } catch {
      return;
    }
    if (typeof n.id != "string")
      return;
    const r = this.pending.get(n.id);
    if (r) {
      if (n.result === "auth_url") {
        if (!r.authUrlSeen && typeof n.error == "string" && n.error) {
          const o = Ca(n.error);
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
    const r = pt(G(8)), o = bn(this.conversationKey, JSON.stringify({ id: r, method: t, params: n })), i = [["p", this.pointer.signerPubkey]], s = oe({
      pubkey: this.clientPubkey,
      created_at: Math.floor(Date.now() / 1e3),
      kind: xt,
      tags: i,
      content: o
    }, this.clientSecretKey), a = new Promise((y, d) => {
      const p = setTimeout(() => {
        this.pending.delete(r), d(new Sa(t, this.requestTimeoutMs));
      }, this.requestTimeoutMs);
      this.pending.set(r, { resolve: y, reject: d, timer: p, authUrlSeen: !1 });
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
    if (!$n.test(t))
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
    if (!M(o))
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
      const t = pt(G(8)), n = bn(this.conversationKey, JSON.stringify({ id: t, method: "logout", params: [] }));
      return oe({
        pubkey: this.clientPubkey,
        created_at: Math.floor(Date.now() / 1e3),
        kind: xt,
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
  const t = k(e.clientSecretKey), n = e.timeoutMs, r = e.relayUrls.map((i) => new Vn(i, { authPrivateKey: e.clientSecretKey })), o = () => {
    for (const i of r)
      i.close();
  };
  return new Promise((i, s) => {
    let a = !1;
    const c = () => u(new Error("The signer-connection attempt was cancelled.")), u = (f) => {
      a || (a = !0, clearTimeout(y), e.signal?.removeEventListener("abort", c), o(), f instanceof Error ? s(f) : i(f));
    }, y = setTimeout(() => u(new Error(`No signer connected within ${Math.round(n / 1e3)}s. Scan or paste the connection code in your signer app, then try again.`)), n);
    if (e.signal?.aborted) {
      c();
      return;
    }
    e.signal?.addEventListener("abort", c, { once: !0 });
    const d = { kinds: [xt], "#p": [t] }, p = (f) => {
      let w, g = null;
      try {
        g = qt(e.clientSecretKey, f.pubkey), w = JSON.parse(Fn(g, f.content));
      } catch {
        return;
      } finally {
        g && _(g);
      }
      w.result === e.secret && u({ signerPubkey: f.pubkey });
    };
    Promise.allSettled(r.map((f) => f.subscribeLive(d, p))).then((f) => {
      f.some((w) => w.status === "fulfilled") || u(new Error("Could not reach any relay to listen for the signer."));
    });
  });
}
function jn() {
  const e = globalThis.crypto;
  if (!e || !e.subtle)
    throw new Error("WebCrypto SubtleCrypto is not available in this environment.");
  return e;
}
async function to(e) {
  if (e.length !== 32)
    throw new Error("AES-256-GCM key must be exactly 32 bytes.");
  return jn().subtle.importKey("raw", e, "AES-GCM", !1, ["encrypt", "decrypt"]);
}
async function no(e, t, n) {
  const r = mi(), o = await to(e), i = await jn().subtle.encrypt({ name: "AES-GCM", iv: r, additionalData: n, tagLength: 128 }, o, t);
  return { nonce: r, ciphertext: new Uint8Array(i) };
}
async function ro(e, t, n, r) {
  const o = await to(e);
  try {
    const i = await jn().subtle.decrypt({ name: "AES-GCM", iv: t, additionalData: r, tagLength: 128 }, o, n);
    return new Uint8Array(i);
  } catch {
    throw new Error("AES-256-GCM authentication failed: capsule is corrupted, tampered, or the wrong key was used.");
  }
}
const oo = `abandon
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
function Ma(e, t, n, r) {
  _i(e);
  const o = Pi({ dkLen: 32, asyncTick: 10 }, r), { c: i, dkLen: s, asyncTick: a } = o;
  if (Qt(i), Qt(s), Qt(a), i < 1)
    throw new Error("iterations (c) should be >= 1");
  const c = cr(t), u = cr(n), y = new Uint8Array(s), d = On.create(e, c), p = d._cloneInto().update(u);
  return { c: i, dkLen: s, asyncTick: a, DK: y, PRF: d, PRFSalt: p };
}
function La(e, t, n, r, o) {
  return e.destroy(), t.destroy(), r && r.destroy(), Ki(o), n;
}
async function Da(e, t, n, r) {
  const { c: o, dkLen: i, asyncTick: s, DK: a, PRF: c, PRFSalt: u } = Ma(e, t, n, r);
  let y;
  const d = new Uint8Array(4), p = ki(d), f = new Uint8Array(c.outputLen);
  for (let w = 1, g = 0; g < i; w++, g += c.outputLen) {
    const b = a.subarray(g, g + c.outputLen);
    p.setInt32(0, w, !1), (y = u._cloneInto(y)).update(d).digestInto(f), b.set(f.subarray(0, b.length)), await Ei(o - 1, s, () => {
      c._cloneInto(y).update(f).digestInto(f);
      for (let h = 0; h < b.length; h++)
        b[h] ^= f[h];
    });
  }
  return La(c, u, a, y, f);
}
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const Ua = (e) => e[0] === "あいこくしん";
function io(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function ao(e) {
  const t = io(e), n = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(n.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: n };
}
function so(e) {
  Ri(e, 16, 20, 24, 28, 32);
}
const Va = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([Mn(e)[0] >> t << t]);
};
function co(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), Pt.chain(Pt.checksum(1, Va), Pt.radix2(11, !0), Pt.alphabet(e));
}
function qa(e, t) {
  const { words: n } = ao(e), r = co(t).decode(n);
  return so(r), r;
}
function Ba(e, t) {
  return so(e), co(t).encode(e).join(Ua(t) ? "　" : " ");
}
function Fa(e, t) {
  try {
    qa(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const $a = (e) => io("mnemonic" + e);
function ja(e, t = "") {
  return Da(Ai, ao(e).nfkd, $a(t), { c: 2048, dkLen: 64 });
}
function Wa(e) {
  if (e.length !== 16)
    throw new Error("Recovery phrase entropy must be exactly 128 bits (16 bytes).");
  return Ba(e, oo);
}
function lo(e) {
  try {
    return Fa(uo(e), oo);
  } catch {
    return !1;
  }
}
function uo(e) {
  return e.trim().normalize("NFKD").split(/\s+/u).join(" ");
}
async function Wn(e) {
  return ja(uo(e), "");
}
const It = [1024, 2048, 4096], Ce = 4;
function Ga(e) {
  const t = Ce + e.length, n = It.find((i) => i >= t);
  if (n === void 0)
    throw new Error(`Payload of ${e.length} bytes exceeds the largest padding bucket (${It[It.length - 1]} bytes minus ${Ce}-byte length prefix).`);
  const r = new Uint8Array(n);
  return new DataView(r.buffer).setUint32(0, e.length, !1), r.set(e, Ce), r;
}
function Ha(e) {
  if (!It.includes(e.length))
    throw new Error(`Padded plaintext length ${e.length} does not match a known bucket.`);
  const n = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !1);
  if (n > e.length - Ce)
    throw new Error("Declared payload length exceeds the padded bucket size.");
  const r = e.slice(Ce, Ce + n), o = e.slice(Ce + n);
  for (const i of o)
    if (i !== 0)
      throw new Error("Padding bytes are not all zero; capsule plaintext is malformed.");
  return r;
}
function za(e) {
  const t = Ni(e);
  if (t === void 0)
    throw new Error("Value is not JSON-serializable for canonicalization.");
  return t;
}
function Ja(e) {
  return z(za(e));
}
const Pe = 16, Ya = 283;
function Xa(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function Gn(e) {
  return e << 1 ^ Ya & -(e >> 7);
}
function $e(e, t) {
  let n = 0;
  for (; t > 0; t >>= 1)
    n ^= e & -(t & 1), e = Gn(e);
  return n;
}
const mn = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let n = 0, r = 1; n < 256; n++, r ^= Gn(r))
    e[n] = r;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let n = 0; n < 255; n++) {
    let r = e[255 - n];
    r |= r << 8, t[e[n]] = (r ^ r >> 4 ^ r >> 5 ^ r >> 6 ^ r >> 7 ^ 99) & 255;
  }
  return Me(e), t;
})(), Qa = /* @__PURE__ */ mn.map((e, t) => mn.indexOf(t)), Za = (e) => e << 24 | e >>> 8, an = (e) => e << 8 | e >>> 24;
function yo(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const n = new Uint32Array(256).map((u, y) => t(e[y])), r = n.map(an), o = r.map(an), i = o.map(an), s = new Uint32Array(256 * 256), a = new Uint32Array(256 * 256), c = new Uint16Array(256 * 256);
  for (let u = 0; u < 256; u++)
    for (let y = 0; y < 256; y++) {
      const d = u * 256 + y;
      s[d] = n[u] ^ r[y], a[d] = o[u] ^ i[y], c[d] = e[u] << 8 | e[y];
    }
  return { sbox: e, sbox2: c, T0: n, T1: r, T2: o, T3: i, T01: s, T23: a };
}
const Hn = /* @__PURE__ */ yo(mn, (e) => $e(e, 3) << 24 | e << 16 | e << 8 | $e(e, 2)), fo = /* @__PURE__ */ yo(Qa, (e) => $e(e, 11) << 24 | $e(e, 13) << 16 | $e(e, 9) << 8 | $e(e, 14)), es = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, n = 1; t < 16; t++, n = Gn(n))
    e[t] = n;
  return e;
})();
function po(e) {
  j(e);
  const t = e.length;
  Xa(e);
  const { sbox2: n } = Hn, r = [];
  (!se || !pe(e)) && r.push(e = Ie(e));
  const o = W(U(e)), i = o.length, s = (c) => ue(n, c, c, c, c), a = new Uint32Array(t + 28);
  a.set(o);
  for (let c = i; c < a.length; c++) {
    let u = a[c - 1];
    c % i === 0 ? u = s(Za(u)) ^ es[c / i - 1] : i > 6 && c % i === 4 && (u = s(u)), a[c] = a[c - i] ^ u;
  }
  return Me(...r), a;
}
function ts(e) {
  const t = po(e), n = t.slice(), r = t.length, { sbox2: o } = Hn, { T0: i, T1: s, T2: a, T3: c } = fo;
  for (let u = 0; u < r; u += 4)
    for (let y = 0; y < 4; y++)
      n[u + y] = t[r - u - 4 + y];
  Me(t);
  for (let u = 4; u < r - 4; u++) {
    const y = n[u], d = ue(o, y, y, y, y);
    n[u] = i[d & 255] ^ s[d >>> 8 & 255] ^ a[d >>> 16 & 255] ^ c[d >>> 24];
  }
  return n;
}
function ge(e, t, n, r, o, i) {
  return e[n << 8 & 65280 | r >>> 8 & 255] ^ t[o >>> 8 & 65280 | i >>> 24 & 255];
}
function ue(e, t, n, r, o) {
  return e[t & 255 | n & 65280] | e[r >>> 16 & 255 | o >>> 16 & 65280] << 16;
}
function wr(e, t, n, r, o) {
  const { sbox2: i, T01: s, T23: a } = Hn;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const u = e.length / 4 - 2;
  for (let w = 0; w < u; w++) {
    const g = e[c++] ^ ge(s, a, t, n, r, o), b = e[c++] ^ ge(s, a, n, r, o, t), h = e[c++] ^ ge(s, a, r, o, t, n), m = e[c++] ^ ge(s, a, o, t, n, r);
    t = g, n = b, r = h, o = m;
  }
  const y = e[c++] ^ ue(i, t, n, r, o), d = e[c++] ^ ue(i, n, r, o, t), p = e[c++] ^ ue(i, r, o, t, n), f = e[c++] ^ ue(i, o, t, n, r);
  return { s0: y, s1: d, s2: p, s3: f };
}
function ns(e, t, n, r, o) {
  const { sbox2: i, T01: s, T23: a } = fo;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const u = e.length / 4 - 2;
  for (let w = 0; w < u; w++) {
    const g = e[c++] ^ ge(s, a, t, o, r, n), b = e[c++] ^ ge(s, a, n, t, o, r), h = e[c++] ^ ge(s, a, r, n, t, o), m = e[c++] ^ ge(s, a, o, r, n, t);
    t = g, n = b, r = h, o = m;
  }
  const y = e[c++] ^ ue(i, t, o, r, n), d = e[c++] ^ ue(i, n, t, o, r), p = e[c++] ^ ue(i, r, n, t, o), f = e[c++] ^ ue(i, o, r, n, t);
  return { s0: y, s1: d, s2: p, s3: f };
}
function rs(e) {
  if (j(e), e.length % Pe !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + Pe);
}
function os(e, t, n) {
  j(e);
  let r = e.length;
  const o = r % Pe;
  if (!t && o !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (t) {
    let a = Pe - o;
    a || (a = Pe), r = r + a;
  }
  n = qn(r, n), Hr(e, n), (!se || !pe(e)) && (e = Ie(e));
  const i = U(e);
  W(i);
  const s = U(n);
  return { b: i, o: s, out: n };
}
function is(e, t) {
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
function as(e) {
  const t = new Uint8Array(16), n = U(t);
  t.set(e);
  const r = Pe - e.length;
  for (let o = Pe - r; o < Pe; o++)
    t[o] = r;
  return n;
}
const ho = /* @__PURE__ */ la({ blockSize: 16, nonceLength: 16 }, function(t, n, r = {}) {
  const o = !r.disablePadding;
  return {
    encrypt(i, s) {
      const a = po(t), { b: c, o: u, out: y } = os(i, o, s);
      let d = n;
      const p = [a];
      (!se || !pe(d)) && p.push(d = Ie(d));
      const f = U(d);
      W(f);
      let w = f[0], g = f[1], b = f[2], h = f[3], m = 0;
      for (; m + 4 <= c.length; )
        w ^= c[m + 0], g ^= c[m + 1], b ^= c[m + 2], h ^= c[m + 3], { s0: w, s1: g, s2: b, s3: h } = wr(a, w, g, b, h), u[m++] = w, u[m++] = g, u[m++] = b, u[m++] = h;
      if (o) {
        const E = as(i.subarray(m * 4));
        W(E), w ^= E[0], g ^= E[1], b ^= E[2], h ^= E[3], { s0: w, s1: g, s2: b, s3: h } = wr(a, w, g, b, h), u[m++] = w, u[m++] = g, u[m++] = b, u[m++] = h;
      }
      return W(u), Me(...p), y;
    },
    decrypt(i, s) {
      rs(i);
      const a = ts(t);
      let c = n;
      const u = [a];
      (!se || !pe(c)) && u.push(c = Ie(c));
      const y = U(c);
      W(y), s = qn(i.length, s), Hr(i, s), (!se || !pe(i)) && u.push(i = Ie(i));
      const d = U(i), p = U(s);
      W(d);
      let f = y[0], w = y[1], g = y[2], b = y[3];
      for (let h = 0; h + 4 <= d.length; ) {
        const m = f, E = w, R = g, q = b;
        f = d[h + 0], w = d[h + 1], g = d[h + 2], b = d[h + 3];
        const { s0: N, s1: O, s2: T, s3: L } = ns(a, f, w, g, b);
        p[h++] = N ^ m, p[h++] = O ^ E, p[h++] = T ^ R, p[h++] = L ^ q;
      }
      return W(p), Me(...u), is(s, o);
    }
  };
});
function vo(e, t) {
  const n = Ze(new Uint8Array([2]), In(t));
  return Ur.getSharedSecret(e, n, !0).slice(1, 33);
}
function ss(e, t, n) {
  return cs(e, t, n, G(16));
}
function cs(e, t, n, r) {
  if (r.length !== 16)
    throw new Error("NIP-04 iv must be exactly 16 bytes.");
  const o = vo(e, t), i = ho(o, r).encrypt(z(n));
  return `${We.encode(i)}?iv=${We.encode(r)}`;
}
function ls(e, t, n) {
  const r = n.indexOf("?iv=");
  if (r === -1)
    throw new Error('NIP-04 payload is missing its "?iv=" suffix.');
  const o = We.decode(n.slice(0, r)), i = We.decode(n.slice(r + 4)), s = vo(e, t), a = ho(s, i).decrypt(o);
  return zt(a);
}
class Le extends Error {
  reason;
  constructor(t) {
    super("Account not found or credentials incorrect."), this.name = "AccountNotFoundError", this.reason = t;
  }
}
class be extends Error {
  constructor(t) {
    super(t), this.name = "RegistrationFailedError";
  }
}
class wo extends Error {
  constructor(t = "An account already exists with this login name and password. Sign in instead, or choose different credentials.") {
    super(t), this.name = "AccountAlreadyExistsError";
  }
}
class me extends Error {
  constructor(t) {
    super(t), this.name = "RecoveryFailedError";
  }
}
class go extends Error {
  seenGeneration;
  capsuleGeneration;
  constructor(t, n) {
    super(`This credential capsule reports generation ${n}, but this device has already seen generation ${t}. Refusing to log in with older, possibly-revoked credentials.`), this.name = "RollbackDetectedError", this.seenGeneration = t, this.capsuleGeneration = n;
  }
}
function vt(e, t) {
  const n = t ?? Math.floor(Date.now() / 1e3);
  return e == null ? n : Math.max(n, e + 1);
}
const us = { generation: -1, recoveryGeneration: -1 };
function zn(e) {
  return `bitlogin:hwm:${e}`;
}
async function Jn(e, t) {
  const n = await e.get(zn(t));
  return n ? JSON.parse(n) : us;
}
async function bo(e, t, n) {
  const r = await Jn(e, t), o = {
    generation: Math.max(r.generation, n.generation ?? -1),
    recoveryGeneration: Math.max(r.recoveryGeneration, n.recoveryGeneration ?? -1)
  };
  return await e.set(zn(t), JSON.stringify(o)), o;
}
async function ys(e, t, n = { generation: 0, recoveryGeneration: -1 }) {
  await e.set(zn(t), JSON.stringify(n));
}
function ds(e, t, n) {
  return oe({ pubkey: k(e), created_at: n, kind: Dt, tags: [], content: JSON.stringify(t) }, e);
}
function fs(e, t, n) {
  const r = t.map((o) => {
    const i = ["r", o.url];
    return o.read && !o.write && i.push("read"), o.write && !o.read && i.push("write"), i;
  });
  return oe({ pubkey: k(e), created_at: n, kind: dt, tags: r, content: "" }, e);
}
function ps(e, t, n) {
  return oe({
    pubkey: k(e),
    created_at: n,
    kind: Cn,
    tags: t.map((r) => ["relay", r]),
    content: ""
  }, e);
}
function hs(e) {
  return e.tags.filter((t) => t[0] === "r" && t[1]).map((t) => t[1]);
}
function vs(e) {
  return e.tags.filter((t) => t[0] === "relay" && t[1]).map((t) => t[1]);
}
async function ws(e) {
  const t = k(e.everydayPrivateKey), n = Math.floor(Date.now() / 1e3), r = [.../* @__PURE__ */ new Set([...e.generalRelays, ...e.dmRelays, ...e.discoveryRelays])], o = new A(r), [i, s, a] = await Promise.all([
    o.queryQuorum({ authors: [t], kinds: [Dt] }),
    o.queryQuorum({ authors: [t], kinds: [dt] }),
    o.queryQuorum({ authors: [t], kinds: [Cn] })
  ]);
  o.closeAll();
  const c = i.outcomes.some((b) => b.events.length > 0), u = s.outcomes.some((b) => b.events.length > 0), y = a.outcomes.some((b) => b.events.length > 0), d = new A(r);
  let p = null, f = null, w = null;
  const g = [];
  if (!c && (e.name || e.about || e.picture)) {
    const b = ds(e.everydayPrivateKey, { name: e.name, about: e.about, picture: e.picture }, n);
    g.push(d.publishAll(b).then((h) => void (p = h)));
  }
  if (!u) {
    const b = fs(e.everydayPrivateKey, e.generalRelays.map((h) => ({ url: h, read: !0, write: !0 })), n);
    g.push(d.publishAll(b).then((h) => void (f = h)));
  }
  if (!y) {
    const b = ps(e.everydayPrivateKey, e.dmRelays, n);
    g.push(d.publishAll(b).then((h) => void (w = h)));
  }
  return await Promise.all(g), d.closeAll(), {
    profilePublished: p !== null && Te(p) > 0,
    relayListAcknowledgedCount: f !== null ? Te(f) : 0,
    dmRelayListAcknowledgedCount: w !== null ? Te(w) : 0,
    profileSkippedExisting: c,
    relayListSkippedExisting: u,
    dmRelayListSkippedExisting: y
  };
}
async function De(e, t, n) {
  const r = n.minAcks ?? 2, o = n.minReadbacks ?? 2, i = await e.publishAll(t, n.timeoutMs), s = Te(i), c = (await e.queryQuorum({ kinds: [H], authors: [t.pubkey], "#d": [n.dTag], limit: 5 }, n.timeoutMs)).outcomes.filter((u) => u.events.some((y) => y.id === t.id)).length;
  return {
    acknowledgedCount: s,
    readbackVerifiedCount: c,
    success: s >= r && c >= o
  };
}
function mo(e) {
  return z(`bitlogin|password-capsule|v1|${e}|30078|bitlogin:password:v1`);
}
function ko(e) {
  return z(`bitlogin|recovery-capsule|v1|${e}|30078|bitlogin:recovery:v1`);
}
async function Yn(e, t, n) {
  const r = Ja(e), o = Ga(r), i = await no(t, o, n);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    nonce: I(i.nonce),
    ciphertext: I(i.ciphertext)
  };
}
async function Xn(e, t, n) {
  if (e.version !== 1 || e.algorithm !== "aes-256-gcm")
    throw new Error(`Unsupported capsule envelope version/algorithm: ${e.version}/${e.algorithm}`);
  const r = V(e.nonce), o = V(e.ciphertext), i = await ro(t, r, o, n), s = Ha(i);
  return JSON.parse(zt(s));
}
class Qn extends Error {
  constructor(t) {
    super(t), this.name = "CapsuleValidationError";
  }
}
const gs = 1e6, bs = /^[0-9a-f]{64}$/u;
function x(e, t) {
  if (!e)
    throw new Qn(t);
}
function Bt(e) {
  return typeof e == "string" && bs.test(e);
}
function Eo(e) {
  x(Array.isArray(e), "vault_relay_hints must be an array (§12.4.7).");
  for (const t of e)
    x(typeof t == "string", "Each relay hint must be a string (§12.4.7)."), x(kt(t), `Relay URL must use secure WebSockets, except for an explicit loopback development endpoint (§12.4.7): ${t}`);
}
function _o(e) {
  x(typeof e == "string", "account_id must be a string (§12.4.2).");
  let t;
  try {
    t = V(e);
  } catch {
    throw new Qn("account_id is not valid base64url (§12.4.2).");
  }
  x(t.length === 16, "account_id must decode to exactly 128 bits (§12.4.2).");
}
function Po(e, t) {
  x(typeof e == "string", "operational_private_key must be a string (§12.4.3).");
  const n = V(e);
  x(n.length === 32, "operational_private_key must be exactly 32 bytes (§12.4.3)."), x(Ln(n), "operational_private_key is not a valid secp256k1 scalar (§12.4.3)."), x(Bt(t), "operational_public_key must be lowercase 64-char hex (§12.4.4).");
  const r = k(n);
  x(r === t, "operational_public_key does not match the derived public key (§12.4.4).");
}
function Ft(e, t) {
  x(typeof t == "string", `${e} must be a string (§CV5.2).`);
  let n;
  try {
    n = V(t);
  } catch {
    throw new Qn(`${e} is not valid base64url (§CV5.2).`);
  }
  x(n.length === 32, `${e} must decode to exactly 32 bytes (§CV5.2).`);
}
function ms(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (x(t !== void 0 && n !== void 0, "connection_vault_root and vault_sudo_key must appear together (§CV5.2)."), Ft("connection_vault_root", t), Ft("vault_sudo_key", n));
}
function ks(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (x(t !== void 0, "vault_sudo_key cannot appear without connection_vault_root (§CV5.2)."), Ft("connection_vault_root", t), n !== void 0 && Ft("vault_sudo_key", n));
}
function Ko(e, t) {
  x(Number.isInteger(e) && e >= 0 && e <= gs, `${t} is out of supported bounds (§12.4.8).`);
}
function Es(e) {
  x(e.schema === Gt, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), _o(e.account_id), Ko(e.generation, "generation"), Po(e.operational_private_key, e.operational_public_key), x(Bt(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex (§12.4.5)."), Eo(e.vault_relay_hints), ks(e);
  const t = e.recovery_capsule_event;
  x(!!t && typeof t == "object", "recovery_capsule_event must be present (§12.4.6)."), x(M(t), "Embedded recovery_capsule_event has an invalid event id or signature (§12.4.6)."), x(t.pubkey === e.recovery_public_key, "Embedded recovery_capsule_event author does not match recovery_public_key (§12.4.5).");
}
function _s(e) {
  x(e.schema === Wt, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), _o(e.account_id), Ko(e.recovery_generation, "recovery_generation"), x(e.previous_recovery_event_id === null || Bt(e.previous_recovery_event_id), "previous_recovery_event_id must be null or lowercase 64-char hex (§12.3)."), Po(e.operational_private_key, e.operational_public_key), x(Bt(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex."), Eo(e.vault_relay_hints), ms(e);
}
function Ps(e) {
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
async function Zn(e) {
  const t = k(e.locatorPrivateKey), n = await Yn(e.payload, e.capsuleKey, mo(t));
  return oe({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: H,
    tags: [["d", Xe]],
    content: JSON.stringify(n)
  }, e.locatorPrivateKey);
}
function Ks(e) {
  const t = k(e.oldLocatorPrivateKey);
  return oe({
    pubkey: t,
    created_at: e.createdAt,
    kind: H,
    tags: [["d", Xe]],
    content: ""
  }, e.oldLocatorPrivateKey);
}
async function As(e, t) {
  if (!M(e))
    throw new Error("Credential capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await Xn(n, t, mo(e.pubkey));
  return Es(r), r;
}
async function er(e) {
  const t = k(e.recoveryPrivateKey), n = await Yn(e.payload, e.capsuleKey, ko(t));
  return oe({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: H,
    tags: [["d", mt]],
    content: JSON.stringify(n)
  }, e.recoveryPrivateKey);
}
async function Ao(e, t) {
  if (!M(e))
    throw new Error("Recovery capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await Xn(n, t, ko(e.pubkey));
  return _s(r), r;
}
function gr(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  for (const o of e)
    o.pubkey === t && o.kind === H && Qe(o, "d") === n && M(o) && r.set(o.id, o);
  return [...r.values()].sort((o, i) => i.created_at - o.created_at);
}
async function Ro(e, t, n, r, o) {
  const i = await e.queryQuorum({ kinds: [H], authors: [t], "#d": [n], limit: 5 }, o), s = i.outcomes.flatMap((p) => p.events), a = gr(s, t, n), c = [];
  for (const p of a)
    try {
      const f = await r(p);
      c.push({ event: p, payload: f });
    } catch (f) {
      c.push({ event: p, payload: null, error: f.message });
    }
  const u = c.find((p) => p.payload !== null) ?? null, y = i.outcomes.map((p) => ({
    responded: p.responded,
    events: gr(p.events, t, n)
  })).filter((p) => p.responded && p.events.length > 0).map((p) => p.events[0].id), d = new Set(y).size > 1;
  return {
    quorumMet: i.quorumMet,
    respondedCount: i.respondedCount,
    totalCount: i.totalCount,
    candidates: c,
    best: u,
    relayDisagreement: d
  };
}
async function wt(e, t, n, r = 8e3) {
  return Ro(e, t, Xe, (o) => As(o, n), r);
}
async function So(e, t, n, r = 8e3) {
  return Ro(e, t, mt, (o) => Ao(o, n), r);
}
function Rs(e) {
  const t = e.filter((n) => n.payload !== null);
  return t.length < 2 ? { consistent: !0 } : Ps(t.map((n) => ({
    eventId: n.event.id,
    recoveryGeneration: n.payload.recovery_generation,
    previousRecoveryEventId: n.payload.previous_recovery_event_id
  })));
}
async function br(e) {
  const t = [...new Set(e.relayUrls)], n = async (a) => {
    const c = new A(t);
    try {
      const u = await c.publishAll(a, e.timeoutMs);
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
function Ss(e) {
  const t = Qe(e, "d");
  if (e.kind !== H || t === void 0 || !M(e))
    throw new Error("This session's capsule event is not a valid capsule.");
  return { pubkey: e.pubkey, dTag: t };
}
function Ns(e, t, n) {
  const r = e.filter((i) => i.pubkey === n.pubkey && i.kind === H && Qe(i, "d") === n.dTag && M(i));
  return r.some((i) => i.id === t.id) ? "current" : r.length === 0 ? "missing" : Math.max(...r.map((i) => i.created_at)) >= t.created_at ? "newer" : "older";
}
async function mr(e, t, n) {
  const r = Ss(t), o = new A(e);
  try {
    const i = await o.queryQuorum({
      kinds: [H],
      authors: [r.pubkey],
      "#d": [r.dTag],
      limit: 5
    }, n);
    return new Map(i.outcomes.map((s) => [
      s.relayUrl,
      s.responded ? { status: Ns(s.events, t, r) } : { status: "unreachable", error: s.error }
    ]));
  } finally {
    o.closeAll();
  }
}
async function Cs(e) {
  const t = [...new Set(e.relayUrls)], [n, r] = await Promise.all([
    mr(t, e.credentialEvent, e.timeoutMs),
    mr(t, e.recoveryEvent, e.timeoutMs)
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
const tr = hi.id, Ge = "aes-256-gcm-v1", He = "bitlogin-bip39-hkdf-v1", No = "bitlogin-recovery-hkdf-v1", xs = 4, Ts = 64;
function ze(e) {
  return [...new Set(e)].filter((t) => t.length <= Ts).slice(0, xs);
}
function Je(e) {
  return e ? { everyday_derivation: No } : {};
}
function Co(e) {
  return e.protocol?.everyday_derivation === No;
}
async function xo(e) {
  const t = Ht(e.loginName), n = e.now ?? Math.floor(Date.now() / 1e3), { locatorPrivateKey: r, capsuleKey: o } = await ft(e.password, t);
  try {
    const i = k(r), s = new A(e.vaultRelayUrls, {
      authPrivateKey: r
    });
    let a;
    try {
      a = await wt(s, i, o, e.timeoutMs);
    } finally {
      s.closeAll();
    }
    if (!a.quorumMet)
      throw new be("Couldn't verify this login name and password aren't already registered. Please retry, or add more vault relays.");
    if (a.candidates.length > 0)
      throw new wo();
    const c = e.everydayPrivateKey !== void 0;
    if (c && !Ln(e.everydayPrivateKey))
      throw new be("The provided key is not a valid secp256k1 private key.");
    const u = Wa(Si()), y = await Wn(u);
    let d, p, f;
    try {
      ({ recoveryPrivateKey: d, capsuleKey: p } = xn(y)), f = c ? e.everydayPrivateKey : Tn(y);
    } finally {
      _(y);
    }
    const w = !c, g = G(32), b = G(32);
    let h = !1;
    try {
      const m = k(d), E = k(f), R = I(Vr()), q = {
        schema: Wt,
        account_id: R,
        recovery_generation: 0,
        previous_recovery_event_id: null,
        operational_private_key: I(f),
        operational_public_key: E,
        recovery_public_key: m,
        connection_vault_root: I(g),
        vault_sudo_key: I(b),
        created_at: n,
        vault_relay_hints: ze(e.vaultRelayUrls),
        protocol: {
          capsule_encryption: Ge,
          recovery_derivation: He,
          ...Je(w)
        }
      }, N = await er({
        recoveryPrivateKey: d,
        capsuleKey: p,
        payload: q
      }), O = new A(e.vaultRelayUrls, {
        authPrivateKey: d
      });
      let T;
      try {
        T = await De(O, N, {
          dTag: mt,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        O.closeAll();
      }
      if (!T.success)
        throw new be("The recovery capsule did not reach the required relay acknowledgement and readback quorum. No login credential was published. Please retry, or add more vault relays.");
      const L = {
        schema: Gt,
        account_id: R,
        generation: 0,
        operational_private_key: I(f),
        operational_public_key: E,
        recovery_public_key: m,
        recovery_capsule_event: N,
        connection_vault_root: I(g),
        created_at: n,
        vault_relay_hints: ze(e.vaultRelayUrls),
        protocol: {
          password_kdf: tr,
          capsule_encryption: Ge,
          recovery_derivation: He,
          ...Je(w)
        }
      }, B = await Zn({
        locatorPrivateKey: r,
        capsuleKey: o,
        payload: L
      }), F = new A(e.vaultRelayUrls, {
        authPrivateKey: r
      });
      let D;
      try {
        D = await De(F, B, {
          dTag: Xe,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        F.closeAll();
      }
      if (!D.success)
        throw new be("Registration did not reach the required credential acknowledgement and readback quorum. Please retry, or add more vault relays.");
      return h = !0, {
        normalizedLoginName: t,
        recoveryPhrase: u,
        everydayPrivateKey: f,
        everydayPublicKey: E,
        recoveryPublicKey: m,
        locatorPublicKey: i,
        accountId: R,
        imported: c,
        everydayKeyDerived: w,
        connectionVaultRoot: g,
        vaultSudoKey: b,
        credentialEvent: B,
        recoveryEvent: N,
        credentialPublish: D,
        recoveryPublish: T
      };
    } finally {
      _(d, p), h || (c || _(f), _(g, b));
    }
  } finally {
    _(r, o);
  }
}
async function Is(e) {
  const { nsecOrHex: t, ...n } = e, r = To(t);
  return xo({ ...n, everydayPrivateKey: r });
}
function To(e) {
  const t = e.trim();
  let n;
  if (t.startsWith("nsec1"))
    n = vi(t);
  else if (/^[0-9a-fA-F]{64}$/u.test(t))
    n = In(t.toLowerCase());
  else
    throw new be("Enter a valid nsec (nsec1…) or a 64-character hex private key.");
  if (!Ln(n))
    throw new be("The provided key is not a valid secp256k1 private key.");
  return n;
}
class Io {
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
  const t = Ht(e.loginName), { locatorPrivateKey: n, capsuleKey: r } = await ft(e.password, t), o = k(n), i = new A(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  try {
    const s = await wt(i, o, r, e.timeoutMs);
    if (!s.quorumMet)
      throw new Le("quorum-not-met");
    if (!s.best)
      throw new Le(s.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
    const a = s.best.payload, c = e.store ?? new Io(), u = await Jn(c, a.operational_public_key), y = a.generation < u.generation;
    if (y && !e.acknowledgeRollback)
      throw new go(u.generation, a.generation);
    const d = y ? `This device previously saw credential generation ${u.generation}, but the accepted capsule is generation ${a.generation}. Relays may be serving stale data, or an old capsule is being replayed.` : void 0;
    await bo(c, a.operational_public_key, {
      generation: a.generation
    });
    const p = s.relayDisagreement ? 'Configured relays returned different credential capsules as "latest" for this account. Some relays may be stale, censored, or malicious.' : void 0;
    return {
      everydayPrivateKey: V(a.operational_private_key),
      everydayPublicKey: a.operational_public_key,
      recoveryPublicKey: a.recovery_public_key,
      accountId: a.account_id,
      generation: a.generation,
      everydayKeyDerived: Co(a),
      credentialEvent: s.best.event,
      recoveryCapsuleEvent: a.recovery_capsule_event,
      connectionVaultRoot: a.connection_vault_root ? V(a.connection_vault_root) : void 0,
      rollbackWarning: d,
      relayDisagreementWarning: p
    };
  } finally {
    i.closeAll();
  }
}
function kr(e) {
  return e.filter((t) => M(t)).sort((t, n) => n.created_at - t.created_at)[0];
}
async function Ms(e) {
  if (!lo(e.phrase))
    throw new me("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await Wn(e.phrase), { recoveryPrivateKey: n, capsuleKey: r } = xn(t), o = Tn(t), i = k(o);
  _(t, o);
  const s = k(n), a = new A(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  let c;
  try {
    c = await So(a, s, r, e.timeoutMs);
  } finally {
    a.closeAll();
  }
  if (e.offlineRecoveryCapsuleEvents?.length) {
    const g = [];
    for (const E of e.offlineRecoveryCapsuleEvents)
      if (M(E))
        try {
          g.push({
            event: E,
            payload: await Ao(E, r)
          });
        } catch (R) {
          g.push({
            event: E,
            payload: null,
            error: R.message
          });
        }
    const b = /* @__PURE__ */ new Map();
    for (const E of [...c.candidates, ...g])
      b.set(E.event.id, E);
    const h = [...b.values()].sort((E, R) => R.event.created_at - E.event.created_at), m = h.find((E) => E.payload !== null) ?? null;
    c = {
      ...c,
      candidates: h,
      best: m,
      quorumMet: c.quorumMet || m !== null
    };
  }
  if (!c.quorumMet)
    throw new Le("quorum-not-met");
  if (!c.best)
    throw new Le(c.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const u = c.best.payload, y = Rs(c.candidates), d = V(u.operational_private_key), p = u.operational_public_key, { generalRelays: f, dmRelays: w } = await Oo(p, [...e.discoveryRelayUrls, ...u.vault_relay_hints], e.timeoutMs);
  return {
    everydayPrivateKey: d,
    everydayPublicKey: p,
    recoveryPrivateKey: n,
    recoveryPublicKey: s,
    recoveryCapsuleKey: r,
    accountId: u.account_id,
    currentRecoveryEvent: c.best.event,
    currentRecoveryPayload: u,
    generalRelays: f,
    dmRelays: w,
    chainWarning: y.consistent ? void 0 : y.warning,
    everydayKeyDerived: p === i
  };
}
async function Oo(e, t, n) {
  const r = new A([...new Set(t)]);
  let o = [], i = [];
  try {
    const s = await r.queryQuorum({ kinds: [dt], authors: [e], limit: 5 }, n), a = kr(s.outcomes.flatMap((y) => y.events));
    a && (o = hs(a));
    const c = await r.queryQuorum({ kinds: [Cn], authors: [e], limit: 5 }, n), u = kr(c.outcomes.flatMap((y) => y.events));
    u && (i = vs(u));
  } finally {
    r.closeAll();
  }
  return { generalRelays: o, dmRelays: i };
}
async function Mo(e) {
  if (!lo(e))
    throw new me("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await Wn(e);
  try {
    const { recoveryPrivateKey: n, capsuleKey: r } = xn(t), o = Tn(t);
    return {
      recoveryPrivateKey: n,
      recoveryPublicKey: k(n),
      capsuleKey: r,
      everydayPrivateKey: o,
      everydayPublicKey: k(o)
    };
  } finally {
    _(t);
  }
}
async function Lo(e, t, n) {
  const r = new A(t, {
    authPrivateKey: e.recoveryPrivateKey
  });
  let o;
  try {
    o = await So(r, e.recoveryPublicKey, e.capsuleKey, n);
  } finally {
    r.closeAll();
  }
  if (!o.quorumMet)
    throw new Le("quorum-not-met");
  if (o.best)
    throw new me("This account's recovery capsule is still on the relays. Use normal recovery instead of a rebuild.");
  return o.candidates.length > 0 ? Math.max(...o.candidates.map((i) => i.event.created_at)) : null;
}
async function Ls(e) {
  const t = await Mo(e.phrase);
  try {
    await Lo(t, e.vaultRelayUrls, e.timeoutMs);
    const n = new A([
      .../* @__PURE__ */ new Set([...e.discoveryRelayUrls, ...e.vaultRelayUrls])
    ]);
    try {
      const o = (await n.queryQuorum({
        kinds: [Dt, dt],
        authors: [t.everydayPublicKey],
        limit: 10
      }, e.timeoutMs)).outcomes.flatMap((i) => i.events).filter((i) => i.pubkey === t.everydayPublicKey && M(i));
      return {
        everydayPublicKey: t.everydayPublicKey,
        profileFound: o.some((i) => i.kind === Dt),
        relayListFound: o.some((i) => i.kind === dt)
      };
    } finally {
      n.closeAll();
    }
  } finally {
    _(t.recoveryPrivateKey, t.capsuleKey, t.everydayPrivateKey);
  }
}
async function Ds(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = await Mo(e.phrase);
  let r = !1;
  try {
    const o = await Lo(n, e.vaultRelayUrls, e.timeoutMs), i = {
      schema: Wt,
      account_id: I(Vr()),
      recovery_generation: 0,
      previous_recovery_event_id: null,
      operational_private_key: I(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      connection_vault_root: I(G(32)),
      vault_sudo_key: I(G(32)),
      created_at: o === null ? t : vt(o, t),
      vault_relay_hints: ze(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: Ge,
        recovery_derivation: He,
        ...Je(!0)
      }
    }, s = await er({
      recoveryPrivateKey: n.recoveryPrivateKey,
      capsuleKey: n.capsuleKey,
      payload: i
    }), a = new A(e.vaultRelayUrls, {
      authPrivateKey: n.recoveryPrivateKey
    });
    let c;
    try {
      c = await De(a, s, {
        dTag: mt,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      a.closeAll();
    }
    if (!c.success)
      throw new me("Could not publish the rebuilt recovery capsule to enough relays. Nothing else was changed; please retry.");
    const { generalRelays: u, dmRelays: y } = await Oo(n.everydayPublicKey, [...e.discoveryRelayUrls, ...e.vaultRelayUrls], e.timeoutMs);
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
    r || _(n.recoveryPrivateKey, n.capsuleKey, n.everydayPrivateKey);
  }
}
async function Us(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = Ht(e.newLoginName), { recovered: r } = e, o = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root,
    vault_sudo_key: r.currentRecoveryPayload.vault_sudo_key
  } : {}, i = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root
  } : {}, { locatorPrivateKey: s, capsuleKey: a } = await ft(e.newPassword, n);
  try {
    const c = k(s), u = new A(e.vaultRelayUrls, {
      authPrivateKey: s
    });
    let y;
    try {
      y = await wt(u, c, a, e.timeoutMs);
    } finally {
      u.closeAll();
    }
    if (!y.quorumMet)
      throw new me("Couldn't verify the new login name and password aren't already registered. Please retry, or add more vault relays.");
    const d = y.best?.payload ?? null, p = d !== null && d.account_id === r.accountId && d.operational_public_key === r.everydayPublicKey && d.recovery_public_key === r.recoveryPublicKey && d.generation === 0 && d.recovery_capsule_event.id === r.currentRecoveryEvent.id;
    if (y.candidates.length > 0 && !p)
      throw new me("Another account is already registered with that login name and password. Pick a different one.");
    const f = r.currentRecoveryPayload.recovery_generation + 1, w = {
      schema: Wt,
      account_id: r.accountId,
      recovery_generation: f,
      previous_recovery_event_id: r.currentRecoveryEvent.id,
      operational_private_key: I(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      ...o,
      created_at: vt(r.currentRecoveryEvent.created_at, t),
      vault_relay_hints: ze(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: Ge,
        recovery_derivation: He,
        ...Je(r.everydayKeyDerived)
      }
    }, g = await er({
      recoveryPrivateKey: r.recoveryPrivateKey,
      capsuleKey: r.recoveryCapsuleKey,
      payload: w
    }), b = new A(e.vaultRelayUrls, {
      authPrivateKey: r.recoveryPrivateKey
    });
    let h;
    try {
      h = await De(b, g, {
        dTag: mt,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      b.closeAll();
    }
    if (!h.success)
      throw new me("Could not publish the refreshed recovery capsule to enough relays. No new credential was published; please retry.");
    r.currentRecoveryEvent = g, r.currentRecoveryPayload = w;
    const m = {
      schema: Gt,
      account_id: r.accountId,
      generation: 0,
      operational_private_key: I(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      recovery_capsule_event: g,
      ...i,
      // A retry may be repairing a credential that reached only one relay.
      // It must replace that partial event deterministically on every relay.
      created_at: y.best ? vt(y.best.event.created_at, t) : t,
      vault_relay_hints: ze(e.vaultRelayUrls),
      protocol: {
        password_kdf: tr,
        capsule_encryption: Ge,
        recovery_derivation: He,
        ...Je(r.everydayKeyDerived)
      }
    }, E = await Zn({
      locatorPrivateKey: s,
      capsuleKey: a,
      payload: m
    }), R = new A(e.vaultRelayUrls, {
      authPrivateKey: s
    });
    let q;
    try {
      q = await De(R, E, {
        dTag: Xe,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      R.closeAll();
    }
    if (!q.success)
      throw new me("Could not publish the new credential capsule to enough relays. Please retry.");
    return e.store && await ys(e.store, r.everydayPublicKey, {
      generation: 0,
      recoveryGeneration: f
    }), {
      normalizedLoginName: n,
      locatorPublicKey: c,
      credentialEvent: E,
      refreshedRecoveryEvent: g,
      credentialPublish: q,
      recoveryPublish: h
    };
  } finally {
    _(s, a);
  }
}
async function Vs(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = Ht(e.loginName), r = await ft(e.oldPassword, n), o = k(r.locatorPrivateKey), i = new A(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  });
  let s;
  try {
    s = await wt(i, o, r.capsuleKey, e.timeoutMs);
  } finally {
    i.closeAll();
  }
  if (!s.quorumMet)
    throw new Le("quorum-not-met");
  if (!s.best)
    throw new Le(s.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const a = s.best.payload, c = s.best.event, u = e.store ?? new Io(), y = await Jn(u, a.operational_public_key);
  if (a.generation < y.generation && !e.acknowledgeRollback)
    throw new go(y.generation, a.generation);
  const d = await ft(e.newPassword, n), p = k(d.locatorPrivateKey), f = new A(e.vaultRelayUrls, {
    authPrivateKey: d.locatorPrivateKey
  });
  let w;
  try {
    w = await wt(f, p, d.capsuleKey, e.timeoutMs);
  } finally {
    f.closeAll();
  }
  if (!w.quorumMet)
    throw new be("Couldn't verify the new password isn't already registered under this login name. Please retry, or add more vault relays.");
  if (w.candidates.length > 0)
    throw new wo("Another account is already registered with this login name and the new password you chose. Pick a different new password.");
  const g = a.generation + 1, b = {
    schema: Gt,
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
    vault_relay_hints: ze(e.vaultRelayUrls),
    protocol: {
      password_kdf: tr,
      capsule_encryption: Ge,
      recovery_derivation: He,
      ...Je(Co(a))
    }
  }, h = await Zn({
    locatorPrivateKey: d.locatorPrivateKey,
    capsuleKey: d.capsuleKey,
    payload: b
  }), m = new A(e.vaultRelayUrls, {
    authPrivateKey: d.locatorPrivateKey
  }), E = await De(m, h, {
    dTag: Xe,
    minAcks: e.minAcknowledgements,
    timeoutMs: e.timeoutMs
  });
  if (m.closeAll(), !E.success)
    throw new be("The new credential capsule did not reach the required relay acknowledgement and readback quorum. Your existing password still works; nothing was changed. Please retry.");
  const R = Ks({
    oldLocatorPrivateKey: r.locatorPrivateKey,
    createdAt: vt(c.created_at, t)
  }), q = Fr({
    privateKey: r.locatorPrivateKey,
    eventIdToDelete: c.id,
    deletedEventKind: H,
    createdAt: t
  }), N = new A(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  }), [O, T] = await Promise.all([
    N.publishAll(R, e.timeoutMs),
    N.publishAll(q, e.timeoutMs)
  ]);
  return N.closeAll(), await bo(u, a.operational_public_key, {
    generation: g
  }), {
    normalizedLoginName: n,
    oldLocatorPublicKey: o,
    newLocatorPublicKey: p,
    newGeneration: g,
    recoveryPublicKey: a.recovery_public_key,
    recoveryCapsuleEvent: a.recovery_capsule_event,
    newCredentialEvent: h,
    tombstoneEvent: R,
    deletionRequestEvent: q,
    newCredentialPublish: E,
    tombstoneAcknowledgedCount: Te(O),
    deletionAcknowledgedCount: Te(T)
  };
}
const qs = "bitlogin/connection-vault-root/v1", Bs = "bitlogin/connection-vault-signing/v1", Fs = "bitlogin/connection-record-encryption/v1", $s = "bitlogin/connection-vault-personal/v1", kn = "bitlogin:connection:";
function js(e) {
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Jt(qr(qs), e);
}
function tt(e) {
  return Ci(e, Bs).scalar;
}
function Do(e) {
  const t = tt(e);
  try {
    return k(t);
  } finally {
    _(t);
  }
}
function Ws(e, t) {
  if (t.length !== 32)
    throw new Error("vault_sudo_key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Jt(qr($s), Ze(e, t));
}
function Uo(e, t) {
  const n = Xt(t);
  return et(e, Ze(z(Fs), new Uint8Array([0]), n), 32);
}
function Gs() {
  return I(G(16));
}
function Xt(e) {
  const t = V(e);
  if (t.length !== 16)
    throw new Error("connection_id must decode to exactly 16 bytes (§CV7).");
  return t;
}
function Vo(e) {
  return Xt(e), `${kn}${e}`;
}
function qo(e) {
  if (!e.startsWith(kn))
    return null;
  const t = e.slice(kn.length);
  try {
    return Xt(t), t;
  } catch {
    return null;
  }
}
class ke {
  privateKey;
  publicKeyHex;
  destroyed = !1;
  constructor(t) {
    this.privateKey = t, this.publicKeyHex = k(t);
  }
  assertAlive() {
    if (this.destroyed)
      throw new Error("This signer has been destroyed (session locked or logged out).");
  }
  getPublicKey() {
    return this.assertAlive(), this.publicKeyHex;
  }
  signEvent(t) {
    return this.assertAlive(), oe({
      pubkey: this.publicKeyHex,
      created_at: t.created_at ?? Math.floor(Date.now() / 1e3),
      kind: t.kind,
      tags: t.tags ?? [],
      content: t.content
    }, this.privateKey);
  }
  nip44Encrypt(t, n) {
    return this.assertAlive(), bn(qt(this.privateKey, t), n);
  }
  nip44Decrypt(t, n) {
    return this.assertAlive(), Fn(qt(this.privateKey, t), n);
  }
  /** Legacy relative to nip44Encrypt above, but still what a real NIP-07 extension exposes as
   * window.nostr.nip04.encrypt -- implemented for drop-in parity. */
  nip04Encrypt(t, n) {
    return this.assertAlive(), ss(this.privateKey, t, n);
  }
  nip04Decrypt(t, n) {
    return this.assertAlive(), ls(this.privateKey, t, n);
  }
  /** Best-practical secret wipe (§11.10, §21.4): overwrites the private key buffer in place. */
  destroy() {
    _(this.privateKey), this.destroyed = !0;
  }
}
const Bo = "bitlogin.connection.v1", Fo = "bitlogin.connection.nwc.v1", Er = 120, Hs = /* @__PURE__ */ new Set(["active", "suspended", "deleted"]), zs = /* @__PURE__ */ new Set(["connectable", "personal"]);
class Be extends Error {
  constructor(t) {
    super(t), this.name = "ConnectionRecordError";
  }
}
function $o(e, t) {
  return z(`bitlogin|connection-record|v1|${e}|30078|${t}`);
}
function jo(e) {
  const t = e, n = (i) => {
    throw new Be(i);
  };
  (!t || typeof t != "object") && n("Connection record must be an object."), t.schema !== Bo && n("Unsupported connection record schema (§CV8.3)."), typeof t.connection_id != "string" && n("connection_id must be a string (§CV7)."), (typeof t.connection_type != "string" || t.connection_type.length === 0) && n("connection_type must be a non-empty string (§CV8.3)."), zs.has(t.tier) || n("tier must be connectable or personal."), Hs.has(t.state) || n("state must be active, suspended, or deleted (§CV8.3)."), (typeof t.label != "string" || t.label.length > Er) && n(`label must be a string of at most ${Er} characters.`), (!Number.isInteger(t.created_at) || !Number.isInteger(t.updated_at)) && n("created_at and updated_at must be integers (§CV8.3).");
  const r = t.credential;
  (!r || typeof r != "object" || typeof r.schema != "string") && n("credential must be an object naming its profile schema (§CV8.3).");
  const o = t.application_binding;
  (!o || typeof o != "object" || o.origin !== null && typeof o.origin != "string" || o.app_pubkey !== null && typeof o.app_pubkey != "string") && n("application_binding must carry origin and app_pubkey (string or null)."), t.notes !== null && typeof t.notes != "string" && n("notes must be a string or null.");
}
async function sn(e) {
  jo(e.record);
  const t = tt(e.vaultPrk), n = k(t), r = Vo(e.record.connection_id), o = Uo(e.recordPrk, e.record.connection_id), i = await Yn(e.record, o, $o(n, r));
  return oe({
    pubkey: n,
    created_at: vt(e.previousCreatedAt, e.now),
    kind: H,
    tags: [["d", r]],
    content: JSON.stringify(i)
  }, t);
}
async function Js(e, t, n) {
  if (!M(e))
    throw new Be("Connection record event has an invalid id or signature.");
  const r = k(tt(t));
  if (e.pubkey !== r)
    throw new Be("Connection record event is not signed by this vault's identity.");
  const o = Qe(e, "d") ?? "", i = qo(o);
  if (i === null)
    throw new Be("Connection record event has a malformed d tag.");
  const s = JSON.parse(e.content), a = $o(e.pubkey, o), c = [
    { prk: t, tier: "connectable" },
    ...n ? [{ prk: n, tier: "personal" }] : []
  ];
  for (const u of c) {
    let y;
    try {
      y = await Xn(s, Uo(u.prk, i), a);
    } catch {
      continue;
    }
    if (jo(y), y.connection_id !== i)
      throw new Be("Connection record id does not match its d tag.");
    if (y.tier !== u.tier)
      throw new Be("Connection record tier does not match the key that decrypted it.");
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
const $t = /^[0-9a-f]{64}$/u;
class he extends Error {
  constructor(t) {
    super(t), this.name = "NwcParseError";
  }
}
function _r(e) {
  const t = e.trim();
  if (!/^nostr\+walletconnect:\/\//iu.test(t))
    throw new he("Not an NWC URI: it must start with nostr+walletconnect://");
  let n;
  try {
    n = new URL(t.replace(/^nostr\+walletconnect:\/\//iu, "http://"));
  } catch {
    throw new he("The NWC URI is malformed.");
  }
  const r = n.hostname.toLowerCase();
  if (!$t.test(r))
    throw new he("The NWC URI's wallet service pubkey is not 64-char hex.");
  const o = [], i = [];
  let s = null, a = null;
  for (const [c, u] of n.searchParams.entries())
    if (c === "relay") {
      if (!kt(u))
        throw new he("An NWC relay must use secure WebSockets, except for an explicit loopback development endpoint.");
      o.push(u);
    } else if (c === "secret") {
      const y = u.toLowerCase();
      if (!$t.test(y))
        throw new he("The NWC URI's secret is not a 64-char hex client key.");
      s = y;
    } else c === "lud16" ? a = u : i.push([c, u]);
  if (o.length === 0)
    throw new he("The NWC URI names no relay.");
  if (s === null)
    throw new he("The NWC URI carries no secret.");
  return {
    schema: Fo,
    wallet_pubkey: r,
    relays: o,
    secret: s,
    lud16: a,
    extra_params: i
  };
}
function Xs(e) {
  Wo(e);
  const t = new URLSearchParams();
  for (const n of e.relays)
    t.append("relay", n);
  t.append("secret", e.secret), e.lud16 !== null && t.append("lud16", e.lud16);
  for (const [n, r] of e.extra_params)
    t.append(n, r);
  return `nostr+walletconnect://${e.wallet_pubkey}?${t.toString()}`;
}
function Qs(e, t) {
  return e.wallet_pubkey === t.wallet_pubkey && e.secret === t.secret;
}
function Wo(e) {
  const t = e, n = (r) => {
    throw new he(r);
  };
  (!t || typeof t != "object") && n("NWC credential must be an object."), t.schema !== Fo && n("NWC credential has the wrong schema."), (typeof t.wallet_pubkey != "string" || !$t.test(t.wallet_pubkey)) && n("NWC credential wallet_pubkey must be 64-char lowercase hex."), (!Array.isArray(t.relays) || t.relays.length === 0 || t.relays.some((r) => typeof r != "string")) && n("NWC credential must name at least one relay."), t.relays.some((r) => !kt(r)) && n("NWC relays must use secure WebSockets, except for explicit loopback development endpoints."), (typeof t.secret != "string" || !$t.test(t.secret)) && n("NWC credential secret must be 64-char lowercase hex."), t.lud16 !== null && typeof t.lud16 != "string" && n("NWC credential lud16 must be a string or null."), (!Array.isArray(t.extra_params) || t.extra_params.some((r) => !Array.isArray(r) || r.length !== 2 || typeof r[0] != "string" || typeof r[1] != "string")) && n("NWC credential extra_params must be [key, value] string pairs.");
}
const Zs = "bitlogin:vault-hwm:v2:", ec = "bitlogin/vault-hwm-index/v2", Go = "bitlogin/vault-hwm-encryption/v2", tc = /^[0-9a-f]{64}$/u;
class Ee extends Error {
  constructor() {
    super("The local Connection Vault rollback marker is invalid or has been tampered with."), this.name = "RecordHighWaterMarkError";
  }
}
function nr(e) {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return Number.isInteger(t.createdAt) && (t.createdAt ?? -1) >= 0 && typeof t.eventId == "string" && tc.test(t.eventId);
}
function Ho(e, t) {
  Xt(t);
  const n = et(e, ec, 32), r = z(t);
  try {
    return `${Zs}${I(On(Mn, n, r))}`;
  } finally {
    _(n, r);
  }
}
function nc(e, t) {
  return `bitlogin:vault-hwm:${Do(e)}:${t}`;
}
async function rc(e, t, n) {
  const r = et(e, Go, 32), o = z(JSON.stringify(n)), i = z(t);
  try {
    const s = await no(r, o, i), a = {
      v: 2,
      nonce: I(s.nonce),
      ciphertext: I(s.ciphertext)
    };
    return JSON.stringify(a);
  } finally {
    _(r, o, i);
  }
}
async function oc(e, t, n) {
  const r = et(e, Go, 32), o = z(t);
  let i;
  try {
    const s = JSON.parse(n);
    if (s.v !== 2 || typeof s.nonce != "string" || typeof s.ciphertext != "string")
      throw new Ee();
    i = await ro(r, V(s.nonce), V(s.ciphertext), o);
    const a = JSON.parse(zt(i));
    if (!nr(a))
      throw new Ee();
    return a;
  } catch (s) {
    throw s instanceof Ee ? s : new Ee();
  } finally {
    _(r, o), i && _(i);
  }
}
async function zo(e, t, n, r) {
  const o = Ho(t, n);
  await e.set(o, await rc(t, o, r));
}
async function Jo(e, t, n) {
  const r = Ho(t, n), o = await e.get(r);
  if (o !== void 0)
    return oc(t, r, o);
  const i = nc(t, n), s = await e.get(i);
  if (s === void 0)
    return null;
  try {
    const a = JSON.parse(s);
    if (!nr(a))
      throw new Ee();
    return await zo(e, t, n, a), await e.delete(i), a;
  } catch (a) {
    throw a instanceof Ee ? a : new Ee();
  }
}
async function Yo(e, t, n, r) {
  if (!nr(r))
    throw new Ee();
  const o = await Jo(e, t, n);
  o && pn({ created_at: r.createdAt, id: r.eventId }, { created_at: o.createdAt, id: o.eventId }) <= 0 || await zo(e, t, n, r);
}
async function ic(e) {
  const t = tt(e.vaultPrk), n = new A(e.relayUrls, { authPrivateKey: t });
  let r;
  try {
    r = await De(n, e.event, {
      dTag: Vo(e.connectionId),
      minAcks: e.minAcknowledgements,
      // The readback bar follows the ack bar: a caller publishing to fewer
      // relays (a targeted repair, a test) has already lowered its quorum.
      minReadbacks: e.minAcknowledgements,
      timeoutMs: e.timeoutMs
    });
  } finally {
    n.closeAll(), _(t);
  }
  return r.success && await Yo(e.store, e.vaultPrk, e.connectionId, {
    createdAt: e.event.created_at,
    eventId: e.event.id
  }), r;
}
const Pr = 500;
async function ac(e) {
  const t = tt(e.vaultPrk), n = k(t), r = new A(e.relayUrls, { authPrivateKey: t });
  let o;
  try {
    o = await r.queryQuorum({ kinds: [H], authors: [n], limit: Pr }, e.timeoutMs);
  } finally {
    r.closeAll(), _(t);
  }
  const i = o.outcomes.some((u) => u.events.length >= Pr), s = /* @__PURE__ */ new Map();
  for (const u of o.outcomes.flatMap((y) => y.events)) {
    if (!M(u) || u.pubkey !== n)
      continue;
    const y = qo(Qe(u, "d") ?? "");
    if (y === null)
      continue;
    const d = s.get(y);
    (!d || pn(u, d) > 0) && s.set(y, u);
  }
  const a = /* @__PURE__ */ new Map(), c = [];
  for (const [u, y] of s) {
    const d = await Jo(e.store, e.vaultPrk, u);
    if (d !== null && pn(y, {
      created_at: d.createdAt,
      id: d.eventId
    }) < 0) {
      c.push(u);
      continue;
    }
    a.set(u, y), await Yo(e.store, e.vaultPrk, u, {
      createdAt: y.created_at,
      eventId: y.id
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
class sc {
  vaultPrk;
  personalPrk = null;
  destroyed = !1;
  connectionVaultRoot;
  vaultPublicKey;
  constructor(t) {
    this.connectionVaultRoot = t.slice(), this.vaultPrk = js(this.connectionVaultRoot), this.vaultPublicKey = Do(this.vaultPrk);
  }
  get sudoActive() {
    return this.personalPrk !== null;
  }
  /** Opens a sudo window. Consumes (wipes) the caller's sudo key copy. */
  enableSudo(t) {
    this.endSudo(), this.personalPrk = Ws(this.connectionVaultRoot, t), _(t);
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
      schema: Bo,
      connection_id: Gs(),
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
    const r = n ?? Math.floor(Date.now() / 1e3), o = Ys(t.record, r), i = await sn({
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
    return this.destroyed ? Promise.reject(new Error("This vault session was destroyed; create a new one from the account's root.")) : Js(t, this.vaultPrk, this.personalPrk ?? void 0);
  }
  /** §CV11 step 3: a NIP-09 deletion request for a replaced record event,
   *  signed by the vault identity. Best-effort by contract — the encrypted
   *  tombstone is the durable part of a deletion, this is the courtesy ask. */
  buildDeletionRequest(t, n) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    return Fr({
      privateKey: tt(this.vaultPrk),
      eventIdToDelete: t,
      deletedEventKind: H,
      createdAt: n ?? Math.floor(Date.now() / 1e3)
    });
  }
  publish(t) {
    return ic({ vaultPrk: this.vaultPrk, ...t });
  }
  fetchEvents(t) {
    return ac({ vaultPrk: this.vaultPrk, ...t });
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
const cc = "bitlogin", we = "kv", ce = "device-keys", lc = 2;
function uc() {
  return new Promise((e, t) => {
    const n = indexedDB.open(cc, lc);
    n.onupgradeneeded = () => {
      const r = n.result;
      r.objectStoreNames.contains(we) || r.createObjectStore(we), r.objectStoreNames.contains(ce) || r.createObjectStore(ce);
    }, n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
  });
}
class yc {
  dbPromise = null;
  db() {
    return this.dbPromise || (this.dbPromise = uc()), this.dbPromise;
  }
  async get(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const s = n.transaction(we, "readonly").objectStore(we).get(t);
      s.onsuccess = () => r(s.result), s.onerror = () => o(s.error);
    });
  }
  async set(t, n) {
    const r = await this.db();
    return new Promise((o, i) => {
      const s = r.transaction(we, "readwrite");
      s.objectStore(we).put(n, t), s.oncomplete = () => o(), s.onerror = () => i(s.error);
    });
  }
  async delete(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const i = n.transaction(we, "readwrite");
      i.objectStore(we).delete(t), i.oncomplete = () => r(), i.onerror = () => o(i.error);
    });
  }
  /**
   * Returns a non-extractable AES-GCM key kept by the browser's IndexedDB
   * implementation. The key is deliberately separate from the string-only KV
   * API so callers cannot accidentally serialize it as application data.
   */
  async getOrCreateDeviceKey(t) {
    const n = await this.db(), r = await new Promise((i, s) => {
      const a = n.transaction(ce, "readonly").objectStore(ce).get(t);
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
        const a = n.transaction(ce, "readwrite");
        a.objectStore(ce).add(o, t), a.oncomplete = () => i(), a.onerror = () => s(a.error);
      }), o;
    } catch {
      const i = await new Promise((s, a) => {
        const c = n.transaction(ce, "readonly").objectStore(ce).get(t);
        c.onsuccess = () => s(c.result), c.onerror = () => a(c.error);
      });
      if (i) return i;
      throw new Error("Unable to create the browser-bound session key.");
    }
  }
  async deleteDeviceKey(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const i = n.transaction(ce, "readwrite");
      i.objectStore(ce).delete(t), i.oncomplete = () => r(), i.onerror = () => o(i.error);
    });
  }
}
const _t = "bitlogin:session:v1", rr = "bitlogin:session-device-key:v1";
function Xo(e) {
  return !!(e && typeof e == "object" && e.v === 3 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function Qo(e, t) {
  if (e.length !== 32) throw new Error("Not a lock key.");
  return crypto.subtle.importKey("raw", ct(e), "AES-GCM", !1, [t]);
}
async function Ot(e, t = _t) {
  try {
    const n = await e.get(t);
    if (!n) return "none";
    const r = JSON.parse(n);
    return Xo(r) ? "locked" : Zo(r) ? "open" : "none";
  } catch {
    return "none";
  }
}
function At(e) {
  let t = "";
  for (const n of e) t += String.fromCharCode(n);
  return btoa(t);
}
function Rt(e) {
  const t = atob(e);
  return Uint8Array.from(t, (n) => n.charCodeAt(0));
}
function ct(e) {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}
function Zo(e) {
  return !!(e && typeof e == "object" && e.v === 2 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function En(e, t, n, r = _t) {
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
    const i = await e.getOrCreateDeviceKey(rr), s = crypto.getRandomValues(new Uint8Array(12)), a = new TextEncoder().encode(JSON.stringify(o)), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: s }, i, a), u = {
      v: 2,
      iv: At(s),
      ciphertext: At(new Uint8Array(c))
    };
    if (!n) {
      await e.set(r, JSON.stringify(u));
      return;
    }
    const y = crypto.getRandomValues(new Uint8Array(12)), d = await crypto.subtle.encrypt({ name: "AES-GCM", iv: y }, await Qo(n, "encrypt"), new TextEncoder().encode(JSON.stringify(u))), p = { v: 3, iv: At(y), ciphertext: At(new Uint8Array(d)) };
    await e.set(r, JSON.stringify(p));
  } catch {
    n && await e.delete(r).catch(() => {
    });
  }
}
async function ei(e, t, n = _t) {
  let r;
  try {
    r = await e.get(n);
  } catch {
    return null;
  }
  if (!r) return null;
  try {
    let o = JSON.parse(r);
    if (Xo(o)) {
      if (!t) return null;
      const c = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ct(Rt(o.iv)) }, await Qo(t, "decrypt"), ct(Rt(o.ciphertext)));
      o = JSON.parse(new TextDecoder().decode(c));
    }
    if (!Zo(o) || typeof e.getOrCreateDeviceKey != "function")
      return await e.delete(n), null;
    const i = await e.getOrCreateDeviceKey(rr), s = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ct(Rt(o.iv)) },
      i,
      ct(Rt(o.ciphertext))
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
const dc = "bitlogin:kept-session:v1:", ae = (e) => dc + e;
async function de(e, t = _t) {
  try {
    await e.delete(t);
  } catch {
  }
}
async function Kr(e) {
  try {
    await e.delete(_t), typeof e.deleteDeviceKey == "function" && await e.deleteDeviceKey(rr);
  } catch {
  }
}
const fc = 27300, Ye = {
  /** The longest address a picture may have. */
  pictureChars: 300,
  /** The most that is said about someone, in their own words. */
  aboutChars: 280,
  /** How long a pass made here lasts, in seconds. NSWP's verifier allows twelve hours; this gives four. */
  passSec: 4 * 3600,
  /** A profile's content is not read past this many characters. */
  contentChars: 2e4
};
function pc(e) {
  if (typeof e != "string" || e.length > Ye.pictureChars) return "";
  try {
    const t = new URL(e);
    return t.protocol !== "https:" || t.username || t.password || !t.hostname.includes(".") ? "" : t.href.length <= Ye.pictureChars ? t.href : "";
  } catch {
    return "";
  }
}
const hc = (e) => e <= 31 || e >= 127 && e <= 159 || e >= 8203 && e <= 8207 || e >= 8232 && e <= 8239 || e >= 8288 && e <= 8303 || e === 65279;
function vc(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, Ye.aboutChars * 8).normalize("NFC")) t += hc(n.codePointAt(0)) ? " " : n;
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, Ye.aboutChars).join("").trim();
}
function Ae(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, n = ht(t.name), r = pc(t.picture), o = vc(t.about);
  return !n && !r && !o ? null : { ...n ? { name: n } : {}, ...r ? { picture: r } : {}, ...o ? { about: o } : {} };
}
function wc(e, t) {
  if (!M(e) || e.kind !== 0 || e.pubkey !== t || e.content.length > Ye.contentChars) return null;
  let n;
  try {
    n = JSON.parse(e.content);
  } catch {
    return null;
  }
  if (!n || typeof n != "object" || Array.isArray(n)) return null;
  const r = n;
  return Ae({ name: ht(r.display_name) || ht(r.displayName) || r.name, picture: r.picture, about: r.about });
}
function gc(e, t) {
  let n = null;
  for (const r of e)
    !M(r) || r.kind !== 0 || r.pubkey !== t || n && r.created_at <= n.at || (n = { at: r.created_at, profile: wc(r, t) });
  return n?.profile ?? null;
}
const bc = /^[0-9a-f]{64}$/u;
function mc(e) {
  const t = Li(e.site);
  if (!t || typeof e.session != "string" || !bc.test(e.session) || e.session === e.identity) return null;
  const n = Math.floor(e.nowSeconds), r = Ae(e.profile) ?? {}, o = [
    ["nswp:session", e.session],
    ["nswp:origin", t],
    ["expiration", String(n + Ye.passSec)]
  ];
  return r.name && o.push(["name", r.name]), r.picture && o.push(["picture", r.picture]), r.about && o.push(["about", r.about]), { kind: fc, created_at: n, tags: o, content: "" };
}
const _n = "bitlogin:kept-accounts:v1", jt = {
  /** No more accounts than this are kept on one device. The one least lately used goes first. */
  accounts: 8
}, kc = /^[0-9a-f]{64}$/u;
function or(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (typeof t.pubkey != "string" || !kc.test(t.pubkey)) return null;
  const n = Ae({ name: t.name, picture: t.picture, about: t.about }) ?? {}, r = typeof t.at == "number" && Number.isFinite(t.at) && t.at > 0 ? Math.floor(t.at) : 0;
  let o;
  try {
    o = lt(t.pubkey);
  } catch {
    return null;
  }
  return { pubkey: t.pubkey, npub: o, ...n, at: r };
}
function Ec(e) {
  if (!e) return [];
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return [];
  }
  if (!Array.isArray(t)) return [];
  const n = /* @__PURE__ */ new Set(), r = [];
  for (const o of t.slice(0, jt.accounts * 2)) {
    const i = or(o);
    !i || n.has(i.pubkey) || (n.add(i.pubkey), r.push(i));
  }
  return r.sort((o, i) => i.at - o.at).slice(0, jt.accounts);
}
function _c(e, t, n, r = {}) {
  const o = e.find((a) => a.pubkey === t), i = or({
    pubkey: t,
    at: n,
    name: ht(r.name) || o?.name,
    picture: r.picture ?? o?.picture,
    about: r.about ?? o?.about
  });
  if (!i) return { list: [...e], dropped: [] };
  const s = [i, ...e.filter((a) => a.pubkey !== t)];
  return { list: s.slice(0, jt.accounts), dropped: s.slice(jt.accounts).map((a) => a.pubkey) };
}
function Pc(e, t, n) {
  return e.map((r) => r.pubkey === t ? or({ ...r, name: ht(n.name) || r.name, picture: n.picture ?? r.picture, about: n.about ?? r.about }) ?? r : r);
}
const Mt = (e, t) => e.filter((n) => n.pubkey !== t);
async function le(e) {
  try {
    return Ec(await e.get(_n));
  } catch {
    return [];
  }
}
async function xe(e, t) {
  try {
    t.length === 0 ? await e.delete(_n) : await e.set(_n, JSON.stringify(t));
  } catch {
  }
}
const ir = "bitlogin:lock:v1", Kc = "bitlogin/lock/device/v1", Ac = z("bitlogin:lock:device-wrap:v1"), ye = {
  pinMin: 6,
  pinMax: 64,
  /** Wrong tries, with the PIN or the device, before the record is removed. */
  tries: 5,
  /** Unused for this long, an unlocked session locks itself. In seconds. */
  idleSec: 900
}, je = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
};
function ti(e) {
  if (typeof e != "string") return null;
  const t = e.normalize("NFKC"), n = [...t].length;
  return n >= ye.pinMin && n <= ye.pinMax ? z(t) : null;
}
async function ni(e, t) {
  const n = G(12), r = await crypto.subtle.importKey("raw", je(e), "AES-GCM", !1, ["encrypt"]), o = await crypto.subtle.encrypt({ name: "AES-GCM", iv: je(n) }, r, je(t));
  return { iv: I(n), wrapped: I(new Uint8Array(o)) };
}
async function ri(e, t) {
  try {
    const n = await crypto.subtle.importKey("raw", je(e), "AES-GCM", !1, ["decrypt"]), r = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: je(V(t.iv)) }, n, je(V(t.wrapped))));
    return r.length === 32 ? r : null;
  } catch {
    return null;
  }
}
const oi = (e) => et(Jt(Ac, e), Kc, 32), Ar = (e) => !!e && typeof e == "object" && typeof e.iv == "string" && typeof e.wrapped == "string";
async function Re(e) {
  let t;
  try {
    t = await e.get(ir);
  } catch {
    return null;
  }
  if (!t) return null;
  try {
    const n = JSON.parse(t);
    return n.v !== 1 || typeof n.tries != "number" || !Number.isInteger(n.tries) || n.tries < 0 || !Ar(n.pin) || typeof n.pin.salt != "string" || n.device !== void 0 && (!Ar(n.device) || typeof n.device.credentialId != "string") ? null : { v: 1, tries: n.tries, pin: n.pin, ...n.device ? { device: n.device } : {} };
  } catch {
    return null;
  }
}
const gt = (e, t) => e.set(ir, JSON.stringify(t));
async function ut(e) {
  try {
    await e.delete(ir);
  } catch {
  }
}
async function Rc(e, t, n) {
  const r = ti(t);
  if (!r) throw new Error(`A PIN is ${ye.pinMin} to ${ye.pinMax} characters.`);
  const o = n ? n.slice() : G(32), i = G(16), s = await Dr(r, i);
  try {
    const a = n ? await Re(e) : null;
    await gt(e, { v: 1, tries: 0, pin: { salt: I(i), ...await ni(s, o) }, ...a?.device ? { device: a.device } : {} });
  } finally {
    s.fill(0), r.fill(0);
  }
  return o;
}
async function Sc(e, t, n, r) {
  const o = await Re(e);
  if (!o) throw new Error("The lock is not on.");
  if (r.length !== 32 || !/^[A-Za-z0-9_-]{8,1400}$/u.test(n)) throw new Error("That is not a device unlock.");
  const i = oi(r);
  try {
    await gt(e, { ...o, device: { credentialId: n, ...await ni(i, t) } });
  } finally {
    i.fill(0);
  }
}
async function Nc(e) {
  const t = await Re(e);
  t?.device && await gt(e, { v: 1, tries: t.tries, pin: t.pin });
}
async function ii(e, t) {
  const n = await Re(e);
  if (!n) return { ok: !1, left: 0, removed: !0 };
  const r = n.tries + 1;
  await gt(e, { ...n, tries: r });
  const o = await t(n);
  return o ? (await gt(e, { ...n, tries: 0 }), { ok: !0, lockKey: o }) : r >= ye.tries ? (await ut(e), { ok: !1, left: 0, removed: !0 }) : { ok: !1, left: ye.tries - r, removed: !1 };
}
function Cc(e, t) {
  return ii(e, async (n) => {
    const r = ti(t);
    if (!r) return null;
    const o = await Dr(r, V(n.pin.salt));
    try {
      return await ri(o, n.pin);
    } finally {
      o.fill(0), r.fill(0);
    }
  });
}
function xc(e, t) {
  return ii(e, async (n) => {
    if (!n.device || t.length !== 32) return null;
    const r = oi(t);
    try {
      return await ri(r, n.device);
    } finally {
      r.fill(0);
    }
  });
}
const yt = "bitlogin:signer-grant:v1:", ai = "bitlogin:signer-grant-device-key:v1", _e = {
  /** The longest a site BitLogin knows is remembered, in seconds: thirty days from Allow. */
  keepSec: 720 * 3600,
  /** The longest for a site it does not know: seven days. */
  unknownKeepSec: 168 * 3600,
  /** How many recent room passes are remembered, to count them across page loads. */
  passKept: 10,
  /** How many recent signatures are remembered, to count them across page loads. */
  signedKept: 60
}, cn = (e) => e.at ?? e.until - si(e.site), si = (e) => (Ue(e) ? xi(e) : Di(e) !== null) ? _e.keepSec : _e.unknownKeepSec, Tc = /^[0-9a-f]{64}$/u;
function bt(e) {
  if (typeof e != "string" || e.length > 300 || e.includes("*")) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin === e ? t.origin : "";
  } catch {
    return "";
  }
}
const ar = (e) => Ue(e) || bt(e), Rr = (e) => btoa(Array.from(e, (t) => String.fromCharCode(t)).join("")), Sr = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), Nr = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}, Ic = (e) => Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
async function ln(e, t, n) {
  const r = ar(t.site);
  if (!r || t.everydayPrivateKey.length !== 32 || typeof e.getOrCreateDeviceKey != "function" || Ue(r) && t.permissions) return !1;
  const o = Math.min(Math.floor(t.until), Math.floor(n) + si(r));
  if (!(o > n)) return !1;
  const i = crypto.getRandomValues(new Uint8Array(12));
  try {
    const s = await e.getOrCreateDeviceKey(ai), a = JSON.stringify({
      site: r,
      key: Ic(t.everydayPrivateKey),
      until: o,
      ...t.name ? { name: t.name.slice(0, 48) } : {},
      ...Ae(t.profile) ? { profile: Ae(t.profile) } : {},
      // An application's public signatures are counted up to its own hourly limit, so more of them are kept.
      signed: t.signed.filter((y) => Number.isFinite(y)).slice(-(t.permissions ? Ut.public.hourly : _e.signedKept)),
      ...t.permissions ? { permissions: t.permissions } : {},
      ...typeof t.at == "number" ? { at: Math.floor(t.at) } : {},
      ...Ke(t.relays).length ? { relays: Ke(t.relays) } : {},
      ...typeof t.checkedAt == "number" ? { checkedAt: Math.floor(t.checkedAt) } : {},
      ...typeof t.seenAt == "number" ? { seenAt: Math.floor(t.seenAt) } : {},
      ...t.signedPass?.length ? { signedPass: t.signedPass.filter((y) => Number.isFinite(y)).slice(-_e.passKept) } : {},
      ...t.permissions && t.signedSensitive ? { signedSensitive: t.signedSensitive.filter((y) => Number.isFinite(y)).slice(-Ut.sensitive.hourly) } : {}
    }), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, s, new TextEncoder().encode(a)), u = { v: 1, iv: Rr(i), ciphertext: Rr(new Uint8Array(c)) };
    return await e.set(yt + r, JSON.stringify(u)), !0;
  } catch {
    return !1;
  }
}
async function St(e, t, n) {
  const r = ar(t);
  if (!r || typeof e.getOrCreateDeviceKey != "function") return null;
  try {
    const o = await e.get(yt + r);
    if (!o) return null;
    const i = JSON.parse(o);
    if (i.v !== 1 || typeof i.iv != "string" || typeof i.ciphertext != "string") return null;
    const s = await e.getOrCreateDeviceKey(ai), a = await crypto.subtle.decrypt({ name: "AES-GCM", iv: Nr(Sr(i.iv)) }, s, Nr(Sr(i.ciphertext))), c = JSON.parse(new TextDecoder().decode(a)), u = (f) => typeof f == "number" && Number.isFinite(f) && f > 0 ? Math.floor(f) : void 0, y = Ae(c.profile), d = c.permissions === void 0 ? void 0 : Dn(c.permissions);
    if (d === null || d && (Ue(r) || !Un(r, d)))
      return await e.delete(yt + r), null;
    const p = (f, w) => Array.isArray(f) ? f.filter((g) => typeof g == "number" && Number.isFinite(g)).slice(-w) : [];
    return c.site !== r || typeof c.key != "string" || !Tc.test(c.key) || typeof c.until != "number" ? null : !(c.until > n) || c.until > n + _e.keepSec ? (await e.delete(yt + r), null) : {
      site: r,
      everydayPrivateKey: Uint8Array.from(c.key.match(/.{2}/gu) ?? [], (f) => Number.parseInt(f, 16)),
      until: c.until,
      ...typeof c.name == "string" && c.name ? { name: c.name.slice(0, 48) } : {},
      ...y ? { profile: y } : {},
      signed: p(c.signed, d ? Ut.public.hourly : _e.signedKept),
      ...p(c.signedPass, _e.passKept).length ? { signedPass: p(c.signedPass, _e.passKept) } : {},
      ...u(c.at) ? { at: u(c.at) } : {},
      ...Ke(c.relays).length ? { relays: Ke(c.relays) } : {},
      ...u(c.checkedAt) ? { checkedAt: u(c.checkedAt) } : {},
      ...u(c.seenAt) ? { seenAt: u(c.seenAt) } : {},
      ...d ? { permissions: d, signedSensitive: p(c.signedSensitive, Ut.sensitive.hourly) } : {}
    };
  } catch {
    return null;
  }
}
async function Nt(e, t) {
  const n = ar(t);
  if (n)
    try {
      await e.delete(yt + n);
    } catch {
    }
}
const ci = "bitlogin:signer-handoff:v1", Oc = /* @__PURE__ */ new Set([
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
  // Asking the user's relays whether this site was taken back (docs/take-back.md). It reads one record and the
  // user's relay list, and can only end the grant or leave it be.
  "signerCheck",
  // Remembering a site, so the user is not asked on every page load (signerGrant.ts).
  "signerKeep",
  "signerRestore",
  "signerTouch",
  "signerForget"
]), Pn = /^[0-9a-f]{64}$/;
function Mc(e) {
  return Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
}
function Lc(e) {
  return Uint8Array.from(e.match(/.{2}/g) ?? [], (t) => Number.parseInt(t, 16));
}
function Dc(e, t, n, r, o = {}) {
  if (!Pn.test(t)) throw new Error("The hand-off has no usable recipient key.");
  if (e.length !== 32) throw new Error("No identity is unlocked in this session.");
  let i = null;
  if (r !== void 0) {
    const d = bt(r.site), p = Dn(r.permissions);
    if (!d || !p || !Un(d, p)) throw new Error("That is not a permission set an application may be given.");
    i = { site: d, permissions: p };
  }
  const s = o.site === void 0 ? "" : bt(o.site);
  if (o.site !== void 0 && (!s || i && i.site !== s)) throw new Error("The hand-off names no usable site.");
  const a = Ae(o.profile), c = !!s && o.visitOnly !== !0 && o.remember === !0, u = o.family === void 0 ? "" : Ue(o.family);
  if (o.family !== void 0 && (!u || i || !c || !Fe(s, u))) throw new Error("That is not a family this site may be allowed as.");
  const y = new ke(n.slice());
  try {
    const d = JSON.stringify({ v: 1, purpose: ci, key: Mc(e), ...i ? { app: i } : {}, ...s ? { site: s } : {}, ...a ? { profile: a } : {}, ...c ? { remember: !0 } : {}, ...typeof o.at == "number" && Number.isFinite(o.at) ? { at: Math.floor(o.at) } : {}, ...Ke(o.relays).length ? { relays: Ke(o.relays) } : {}, ...u ? { family: u } : {} });
    return { senderPublicKey: y.getPublicKey(), payload: y.nip44Encrypt(t, d) };
  } finally {
    y.destroy();
  }
}
function Uc(e, t) {
  if (!e || !Pn.test(e.senderPublicKey) || typeof e.payload != "string")
    throw new Error("That is not a signer hand-off.");
  const n = new ke(t.slice());
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
  if (o.v !== 1 || o.purpose !== ci || typeof o.key != "string" || !Pn.test(o.key))
    throw new Error("That is not a signer hand-off.");
  const i = Lc(o.key);
  try {
    k(i);
  } catch {
    throw i.fill(0), new Error("The hand-off carried an unusable key.");
  }
  const s = o.site === void 0 ? null : bt(o.site);
  if (s === "")
    throw i.fill(0), new Error("The hand-off names no usable site.");
  const a = Ae(o.profile), c = o.remember === !0 && !!s, u = typeof o.at == "number" && Number.isFinite(o.at) && o.at > 0 ? Math.floor(o.at) : null, y = Ke(o.relays), d = o.family === void 0 ? null : Ue(o.family);
  if (d === "" || d && (o.app !== void 0 || !c || !Fe(s, d)))
    throw i.fill(0), new Error("The hand-off names a family it cannot be kept for.");
  if (o.app === void 0) return { key: i, app: null, site: s, profile: a, remember: c, at: u, relays: y, family: d };
  const p = o.app, f = p && typeof p == "object" ? bt(p.site) : "", w = p && typeof p == "object" ? Dn(p.permissions) : null;
  if (!f || !w || !Un(f, w) || s && s !== f)
    throw i.fill(0), new Error("The hand-off carried a permission set that cannot be read.");
  return { key: i, app: { site: f, permissions: w }, site: f, profile: a, remember: c, at: u, relays: y, family: null };
}
const li = "bitlogin:session-public:v1";
async function Vc(e, t) {
  try {
    const n = {
      pubkey: t.pubkey,
      npub: t.npub,
      ...t.name ? { name: t.name } : {}
    };
    await e.set(li, JSON.stringify(n));
  } catch {
  }
}
async function rt(e) {
  try {
    await e.delete(li);
  } catch {
  }
}
class qc {
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
  family: null
};
let Se = null, S = [...$r], ve = [...jr];
const v = new yc();
let Kn = !1, An = !1;
function Cr(e) {
  Kn || (S = e.vaultRelays), An || (ve = e.discoveryRelays);
}
const Bc = new qc();
let K = null, un = Date.now();
const Fc = /* @__PURE__ */ new Set(["configure", "lockStatus", "lockOpen", "restoreSession", "getSessionStatus", "logout"]), ui = "bitlogin:taken-back:v1:";
async function $c(e) {
  try {
    const t = await v.get(ui + e);
    return (t ? Br(JSON.parse(t)) : null) ?? hn;
  } catch {
    return hn;
  }
}
function xr(e, t) {
  try {
    return Br(JSON.parse(e.nip44Decrypt(e.getPublicKey(), t)));
  } catch {
    return null;
  }
}
function ot() {
  ie(), K && _(K), K = null;
}
async function qe() {
  const e = await Re(v);
  return e ? {
    on: !0,
    // Locked with nothing in the active slot too, where other accounts are kept: theirs are sealed under it.
    locked: !K && (await Ot(v) === "locked" || (await le(v)).length > 0),
    device: !!e.device,
    ...e.device ? { credentialId: e.device.credentialId } : {},
    triesLeft: Math.max(0, ye.tries - e.tries)
  } : { on: !1, locked: !1, device: !1, triesLeft: 0 };
}
function C() {
  if (!l.signer || !l.everydayPrivateKey)
    throw new Error("No identity is unlocked in this session.");
  return { signer: l.signer, everydayPrivateKey: l.everydayPrivateKey };
}
function yn() {
  if (!l.signerOnly || !l.app) throw new Error("refused");
  return l.app;
}
function ie() {
  l.signer?.destroy(), l.everydayPrivateKey && l.everydayPrivateKey.fill(0), l.signer = null, l.everydayPrivateKey = null, l.accountId = null, l.recoveryPublicKey = null, l.activeCredentialEvent = null, l.activeRecoveryEvent = null, l.everydayKeyDerived = !1, l.vault?.destroy(), l.vault = null, l.connectionVaultRoot && l.connectionVaultRoot.fill(0), l.connectionVaultRoot = null, l.vaultKnown = !1, l.signerOnly = !1, l.app = null, l.site = null, l.profile = null, l.remember = !1, l.grantAt = null, l.relays = [], l.family = null, l.pendingRecovery && (l.pendingRecovery.recoveryPrivateKey.fill(0), l.pendingRecovery.everydayPrivateKey.fill(0), l.pendingRecovery = null);
}
function Tr(e) {
  return ie(), l.pendingRecovery = e, l.signer = new ke(e.everydayPrivateKey), l.everydayPrivateKey = e.everydayPrivateKey, l.accountId = e.accountId, l.recoveryPublicKey = e.recoveryPublicKey, l.activeRecoveryEvent = e.currentRecoveryEvent, l.everydayKeyDerived = e.everydayKeyDerived, Rn(
    e.currentRecoveryPayload.connection_vault_root ? V(e.currentRecoveryPayload.connection_vault_root) : void 0
  ), {
    everydayPublicKey: e.everydayPublicKey,
    accountId: e.accountId,
    generalRelays: e.generalRelays,
    dmRelays: e.dmRelays,
    chainWarning: e.chainWarning,
    everydayKeyDerived: e.everydayKeyDerived
  };
}
function Rn(e, t) {
  l.connectionVaultRoot = e ?? null, l.vaultKnown = !0, l.vault = null, t && _(t);
}
async function Ne() {
  if (!l.everydayPrivateKey || !l.accountId || !l.recoveryPublicKey || !l.activeCredentialEvent || !l.activeRecoveryEvent)
    return;
  const e = await Re(v);
  e && !K && (await ut(v), await Sn());
  const t = {
    everydayPrivateKey: l.everydayPrivateKey,
    accountId: l.accountId,
    recoveryPublicKey: l.recoveryPublicKey,
    activeCredentialEvent: l.activeCredentialEvent,
    activeRecoveryEvent: l.activeRecoveryEvent,
    ...l.connectionVaultRoot ? { connectionVaultRoot: l.connectionVaultRoot } : {},
    ...l.vaultKnown ? { vaultEnabled: l.connectionVaultRoot !== null } : {},
    everydayKeyDerived: l.everydayKeyDerived
  }, n = e && K ? K : null;
  await En(v, t, n);
  const r = k(l.everydayPrivateKey);
  await En(v, t, n, ae(r));
  const o = _c(await le(v), r, Date.now() / 1e3);
  for (const i of o.dropped) await de(v, ae(i));
  await xe(v, o.list), await yi();
}
async function Sn() {
  for (const e of await le(v)) await de(v, ae(e.pubkey));
  await xe(v, []);
}
async function Ir(e, t) {
  const n = l.everydayPrivateKey ? k(l.everydayPrivateKey) : "";
  let r = await le(v);
  for (const o of r) {
    if (o.pubkey === n) continue;
    const i = await ei(v, e, ae(o.pubkey));
    i ? (await En(v, i, t, ae(o.pubkey)), i.everydayPrivateKey.fill(0), i.connectionVaultRoot?.fill(0)) : (await de(v, ae(o.pubkey)), r = Mt(r, o.pubkey));
  }
  await xe(v, r);
}
async function dn(e) {
  const t = await ei(v, K, e);
  return t ? (ie(), l.signer = new ke(t.everydayPrivateKey), l.everydayPrivateKey = t.everydayPrivateKey, l.accountId = t.accountId, l.recoveryPublicKey = t.recoveryPublicKey, l.activeCredentialEvent = t.activeCredentialEvent, l.activeRecoveryEvent = t.activeRecoveryEvent, l.everydayKeyDerived = t.everydayKeyDerived ?? !1, l.connectionVaultRoot = t.connectionVaultRoot ?? null, l.vaultKnown = t.vaultEnabled !== void 0, await yi(), {
    restored: !0,
    everydayPublicKey: l.signer.getPublicKey(),
    accountId: t.accountId,
    everydayKeyDerived: l.everydayKeyDerived
  }) : { restored: !1 };
}
async function yi() {
  if (!l.signer) return;
  const e = l.signer.getPublicKey();
  await Vc(v, { pubkey: e, npub: lt(e) });
}
function it() {
  try {
    return new URL(self.location.href).origin;
  } catch {
    return "";
  }
}
function Nn() {
  if (!l.signer) throw new Error("No identity is unlocked in this session.");
  if (!l.connectionVaultRoot)
    throw new Error(
      l.vaultKnown ? "This account predates the Connection Vault. Enable it from your BitLogin account manager (recovery phrase required)." : "Sign in again to use wallet connections on this device."
    );
  return l.vault ??= new sc(l.connectionVaultRoot.slice()), l.vault;
}
function at(e) {
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
async function Lt() {
  const e = Nn(), t = await e.listConnections({ relayUrls: S, store: v });
  return {
    vault: e,
    connections: t.connections.filter((n) => n.record.state !== "deleted"),
    rollbackWarnings: t.rollbackWarnings,
    unreadable: t.unreadable,
    truncated: t.truncated,
    quorumMet: t.quorumMet
  };
}
async function fn(e) {
  const { vault: t, connections: n } = await Lt(), r = n.find((o) => o.record.connection_id === e);
  if (!r) throw new Error("That connection no longer exists.");
  return { vault: t, connection: r };
}
let Oe = null, fe = null;
function Or(e) {
  self.postMessage({ notify: "nip46-auth-url", url: e });
}
function st() {
  if (!Oe) throw new Error("No remote signer is connected.");
  return Oe;
}
function Ct() {
  fe && (fe.abort.abort(), _(fe.clientSecretKey), fe = null);
}
function di(e) {
  const t = e.buildLogoutEvent();
  e.close(), t && e.publishCourtesy(t);
}
function Mr(e, t) {
  Oe && di(Oe.client), Oe = { client: e, userPubkey: t };
}
async function jc(e, t) {
  if (l.signerOnly && !Oc.has(e))
    throw new Error("This session can only sign. Sign in at your own BitLogin page for anything else.");
  switch (K && e !== "configure" && Date.now() - un > ye.idleSec * 1e3 && ot(), Fc.has(e) || (un = Date.now()), e) {
    // ---- The optional lock (lock.ts) ----
    case "lockStatus":
      return qe();
    // Turn it on, or change the PIN. Only with a full session unlocked: the key that is sealed is the one in hand.
    case "lockEnable": {
      if (C(), await Re(v) && !K) throw new Error("Unlock first.");
      const n = await Rc(v, t.pin, K ?? void 0);
      return await Ir(K, n), K && _(K), K = n, await Ne(), qe();
    }
    case "lockSetDevice": {
      if (C(), !K) throw new Error("Turn the lock on first.");
      const n = t, r = V(String(n.prfOutput));
      try {
        await Sc(v, K, String(n.credentialId), r);
      } finally {
        _(r);
      }
      return qe();
    }
    case "lockRemoveDevice": {
      if (C(), !K) throw new Error("Turn the lock on first.");
      return await Nc(v), qe();
    }
    case "lockDisable": {
      if (C(), await Re(v) && !K) throw new Error("Unlock first.");
      return await Ir(K, null), await ut(v), K && _(K), K = null, await Ne(), qe();
    }
    case "lockNow": {
      if (!K) throw new Error("The lock is not on.");
      return ot(), qe();
    }
    // Open it, with the PIN or with the device. A wrong try is counted; one too many removes the lock and the
    // cached session with it, and the user signs in again the ordinary way.
    case "lockOpen": {
      const n = t;
      let r;
      if (typeof n.prfOutput == "string") {
        const o = V(n.prfOutput);
        try {
          r = await xc(v, o);
        } finally {
          _(o);
        }
      } else
        r = await Cc(v, n.pin);
      if (r.ok) {
        K && _(K), K = r.lockKey, un = Date.now();
        const o = await dn();
        if (o.restored) return { ok: !0, left: ye.tries, removed: !1, ...o };
        if (await Ot(v) === "none" && (await le(v)).length > 0) return { ok: !0, left: ye.tries, removed: !1, restored: !1 };
        await ut(v), ot(), r = { ok: !1, left: 0, removed: !0 };
      }
      return r.removed && (ot(), await Sn(), await Kr(v), await rt(v)), { ok: !1, left: r.left, removed: r.removed, restored: !1 };
    }
    // ---- Signer hand-off (docs/sign-in-window.md) ----
    // The receiving side, first: a throwaway key for the hand-off to be sealed to.
    case "handoffBegin":
      return Se && _(Se), Se = Kt(), { recipientPublicKey: k(Se) };
    // The sending side: this worker has the session, and seals the everyday
    // key (only that) to the receiving worker's throwaway key.
    case "handoffExport": {
      const { everydayPrivateKey: n } = C(), r = Kt(), o = t;
      try {
        return Dc(n, o.recipientPublicKey, r, o.app, {
          ...o.site !== void 0 ? { site: o.site } : {},
          // Only a site that declared nothing is told who they are. An application is held to what it asked,
          // though the window may have read the profile to show the user which account this is.
          ...l.profile && !o.app ? { profile: l.profile } : {},
          ...o.remember === !0 ? { remember: !0 } : {},
          ...o.family !== void 0 ? { family: o.family } : {},
          // With the lock on, nothing is kept for any site: a key at rest in a site's storage would be a key
          // the lock does not cover. Every site is allowed for the visit, and asks at the sign-in address again.
          ...K ? { visitOnly: !0 } : {},
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
      const { everydayPrivateKey: n } = C();
      if (!l.signerOnly) throw new Error("Only a signer-only session can be remembered for a site.");
      const r = t, o = Date.now() / 1e3;
      if (!l.remember) return { kept: !1 };
      if (l.app && l.app.site !== r.site || l.site && l.site !== r.site) throw new Error("This hand-off was for another site.");
      if (l.family) {
        if (!Fe(r.site, l.family)) throw new Error("This hand-off was for another site.");
        await Nt(v, r.site);
      }
      return {
        kept: await ln(
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
            ...l.app ? { permissions: l.app.permissions, signedSensitive: [] } : {}
          },
          o
        )
      };
    }
    // The site's page was loaded again: what was kept for that site, if it is still in date, becomes a
    // signer-only session. It touches nothing a full session uses.
    case "signerRestore": {
      const n = t, r = await St(v, n.site, Date.now() / 1e3), o = !r && n.family !== void 0 && Ue(n.family) && Fe(n.site, n.family) ? n.family : null, i = r ?? (o ? await St(v, o, Date.now() / 1e3) : null);
      return !i || o && i.site !== o ? { restored: !1 } : (ie(), l.signer = new ke(i.everydayPrivateKey), l.everydayPrivateKey = i.everydayPrivateKey, l.signerOnly = !0, l.app = i.permissions ? { site: i.site, permissions: i.permissions } : null, l.site = o ? n.site : i.site, l.family = o, l.profile = i.profile ?? null, l.remember = !0, l.grantAt = cn(i), l.relays = i.relays ?? [], {
        restored: !0,
        everydayPublicKey: l.signer.getPublicKey(),
        until: i.until,
        ...i.name ? { name: i.name } : {},
        ...i.profile ? { profile: i.profile } : {},
        signed: i.signed,
        ...i.signedPass ? { signedPass: i.signedPass } : {},
        check: lr(Date.now() / 1e3, cn(i), i.checkedAt ?? 0),
        ...o ? { family: o } : {},
        ...i.permissions ? { permissions: i.permissions, signedSensitive: i.signedSensitive ?? [] } : {}
      });
    }
    // Count a signature against the site, where reloading the page can't lose the count.
    case "signerTouch": {
      const { everydayPrivateKey: n } = C();
      if (!l.signerOnly) throw new Error("Only a signer-only session is counted for a site.");
      const r = t, o = Date.now() / 1e3, i = await St(v, l.family && Fe(r.site, l.family) ? l.family : r.site, o);
      return i && k(i.everydayPrivateKey) === k(n) && await ln(
        v,
        { ...i, signed: Array.isArray(r.signed) ? r.signed : [], ...Array.isArray(r.signedPass) ? { signedPass: r.signedPass } : {}, ...i.permissions ? { signedSensitive: Array.isArray(r.signedSensitive) ? r.signedSensitive : [] } : {} },
        o
      ), {};
    }
    // Signing out of a site that was allowed as one of a family signs out of the family: otherwise its next page
    // load would take the family's grant up again, and the sign-out would not have happened (SF6).
    case "signerForget": {
      const n = t.site;
      return await Nt(v, n), l.family && Fe(n, l.family) && await Nt(v, l.family), {};
    }
    case "handoffAccept": {
      if (!Se) throw new Error("No hand-off was begun here.");
      const n = Se;
      Se = null;
      let r;
      try {
        r = Uc(t, n);
      } finally {
        _(n);
      }
      return ie(), l.signer = new ke(r.key), l.everydayPrivateKey = r.key, l.signerOnly = !0, l.app = r.app, l.site = r.site, l.profile = r.profile, l.remember = r.remember, l.grantAt = r.at, l.relays = r.relays, l.family = r.family, {
        everydayPublicKey: l.signer.getPublicKey(),
        ...r.app ? { app: r.app } : {},
        ...r.site ? { site: r.site } : {},
        ...r.profile ? { profile: r.profile } : {},
        ...r.remember ? { remember: !0 } : {},
        ...r.family ? { family: r.family } : {}
      };
    }
    // ---- Who someone is, to a world they allowed (§SW16).
    // A full session, at the sign-in address: the person's own profile, asked of relays and believed only as
    // far as its signature goes. It is sealed into the next hand-off. A session that arrived by a hand-off
    // never asks a relay anything: this action is not on its list.
    case "loadProfile": {
      const { signer: n } = C(), r = n.getPublicKey(), o = t.profile !== !1, i = [.../* @__PURE__ */ new Set([...ve, ...S])].slice(0, 8);
      if (i.length === 0) return {};
      const s = new A(i);
      try {
        const [a, c] = await Promise.all([
          o ? s.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 4e3) : Promise.resolve(null),
          s.queryQuorum({ kinds: [tn], authors: [r], limit: 2 }, 4e3)
        ]);
        if (l.signer !== n) return {};
        l.profile = a ? gc(a.outcomes.flatMap((u) => u.events), r) : null, l.profile && !l.signerOnly && await xe(v, Pc(await le(v), r, l.profile)), l.relays = nn(c.outcomes.flatMap((u) => u.events), r);
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
      const { signer: n } = C(), r = t, o = n.getPublicKey(), i = Date.now() / 1e3, s = r.all === !0 ? { all: !0 } : { site: String(r.site ?? "") }, a = new A([.../* @__PURE__ */ new Set([...ve, ...S])].slice(0, 8));
      let c;
      try {
        c = nn((await a.queryQuorum({ kinds: [tn], authors: [o], limit: 2 }, 4e3)).outcomes.flatMap((d) => d.events), o);
      } finally {
        a.closeAll();
      }
      const u = [.../* @__PURE__ */ new Set([...c, ...S])].slice(0, 16), y = new A(u);
      try {
        const d = await y.queryQuorum({ kinds: [en], authors: [o], "#d": [Zt], limit: 2 }, 5e3);
        if (d.respondedCount === 0) return { ok: !1, accepted: 0, of: u.length };
        const p = ur(d.outcomes.flatMap((E) => E.events), o, i), f = p ? xr(n, p.content) : null, w = await $c(o), g = Oi(Mi(f ?? hn, w, i), s, i), b = n.signEvent({
          kind: en,
          // Later than the one it replaces, whatever the two clocks say.
          created_at: Math.max(Math.floor(i), (p?.created_at ?? 0) + 1),
          tags: [["d", Zt]],
          content: n.nip44Encrypt(o, yr(g))
        }), h = Te(await y.publishAll(b, 6e3)), m = h >= Math.min(2, u.length);
        return m && await v.set(ui + o, yr(g)).catch(() => {
        }), { ok: m, accepted: h, of: u.length };
      } finally {
        y.closeAll();
      }
    }
    // In the embedded signer, for a kept grant: ask the user's relays whether this site was taken back. Asked at
    // most once a day. It can end the grant or leave it be, and nothing else.
    case "signerCheck": {
      const { signer: n } = C();
      if (!l.signerOnly || !l.site) return { state: "ok" };
      const r = l.family ?? l.site, o = Date.now() / 1e3, i = await St(v, r, o);
      if (!i) return { state: "ok" };
      const s = n.getPublicKey(), a = cn(i), c = lr(o, a, i.checkedAt ?? 0);
      if (c === "fresh") return { state: "ok" };
      const u = [.../* @__PURE__ */ new Set([...Ke(i.relays), ...S])].slice(0, 12), y = new A(u);
      let d, p;
      try {
        [d, p] = await Promise.all([
          y.queryQuorum({ kinds: [en], authors: [s], "#d": [Zt], limit: 2 }, 5e3),
          y.queryQuorum({ kinds: [tn], authors: [s], limit: 2 }, 5e3)
        ]);
      } finally {
        y.closeAll();
      }
      if (l.signer !== n) return { state: "ok" };
      const f = ur(d.outcomes.flatMap((h) => h.events), s, o), w = f ? xr(n, f.content) : null;
      if (w && Ti(w, r, a))
        return await Nt(v, r), ie(), { state: "ended" };
      if (!Ii({
        asked: u.length,
        answered: d.respondedCount,
        seenAt: i.seenAt ?? 0,
        newestAt: f ? f.created_at : null,
        readable: w !== null
      })) return { state: c === "overdue" ? "stale" : "ok" };
      const b = nn(p.outcomes.flatMap((h) => h.events), s);
      return await ln(
        v,
        {
          ...i,
          checkedAt: Math.floor(o),
          seenAt: Math.max(i.seenAt ?? 0, w && f ? f.created_at : 0),
          ...b.length ? { relays: b } : {}
        },
        o
      ), b.length && (l.relays = b), { state: "ok" };
    }
    // A room pass (NSWP kind 27300) for the site this session serves, and for no other. The site, the time, how
    // long it lasts and the profile are all this worker's own: what is asked for is a session public key. Not
    // for an application: an application is held to the set the user read, and a pass is not in one.
    case "roomPass": {
      const { signer: n } = C();
      if (!l.signerOnly || l.app || !l.site) throw new Error("refused");
      const r = mc({
        session: t.session,
        site: l.site,
        identity: n.getPublicKey(),
        nowSeconds: Date.now() / 1e3,
        profile: l.profile
      });
      if (!r) throw new Error("refused");
      return n.signEvent(r);
    }
    // ---- What an approved application may ask beyond signing (§SW9.5). Refused without a permission set.
    case "appEncrypt": {
      const { signer: n } = C(), r = yn(), o = t, i = n.getPublicKey(), s = r.permissions.sign.some((a) => Fi.includes(a));
      if (!$i(r.permissions, i, o.peerPublicKey) && !(s && /^[0-9a-f]{64}$/u.test(String(o.peerPublicKey))))
        throw new Error("refused");
      if (typeof o.text != "string" || o.text.length > 1e5) throw new Error("refused");
      return { text: o.scheme === "nip04" ? n.nip04Encrypt(o.peerPublicKey, o.text) : n.nip44Encrypt(o.peerPublicKey, o.text) };
    }
    case "appDecrypt": {
      const { signer: n } = C(), r = yn(), o = t;
      if (!Bi(r.permissions, o.peerPublicKey) || typeof o.text != "string") throw new Error("refused");
      return { text: o.scheme === "nip04" ? n.nip04Decrypt(o.peerPublicKey, o.text) : n.nip44Decrypt(o.peerPublicKey, o.text) };
    }
    case "appDecryptEvent": {
      const { signer: n } = C(), r = yn(), o = t.event;
      if (!M(o)) throw new Error("refused");
      const i = qi(r.permissions, n.getPublicKey(), o), s = o.kind === 4 || /\?iv=[A-Za-z0-9+/=]+$/u.test(o.content);
      for (const a of i)
        try {
          return { text: s ? n.nip04Decrypt(a, o.content) : n.nip44Decrypt(a, o.content) };
        } catch {
        }
      throw new Error("refused");
    }
    case "nip46Connect": {
      const r = xa(t.uri), o = new vr({
        clientSecretKey: Kt(),
        pointer: r,
        onAuthUrl: Or
      });
      try {
        await o.connect();
        const i = await o.getUserPublicKey();
        return Mr(o, i), Ct(), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46NostrconnectStart": {
      const n = t, r = S.slice(0, 2);
      Ct();
      const o = Kt(), i = pt(G(16));
      return fe = { clientSecretKey: o, relayUrls: r, secret: i, abort: new AbortController() }, { uri: Ta({
        clientPubkey: k(o),
        relayUrls: r,
        secret: i,
        name: n.appName?.trim() || "BitLogin",
        perms: ["sign_event", "nip44_encrypt", "nip44_decrypt", "nip04_encrypt", "nip04_decrypt"]
      }) };
    }
    case "nip46NostrconnectAwait": {
      const n = fe;
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
        throw fe === n && Ct(), i;
      }
      if (fe !== n) throw new Error("This signer-connection attempt was superseded.");
      fe = null;
      const o = new vr({
        clientSecretKey: n.clientSecretKey,
        pointer: { signerPubkey: r, relayUrls: n.relayUrls },
        onAuthUrl: Or
      });
      try {
        const i = await o.getUserPublicKey();
        return Mr(o, i), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46SignEvent": {
      const n = t;
      return st().client.signEvent({
        kind: n.kind,
        content: n.content,
        tags: n.tags ?? [],
        created_at: n.created_at ?? Math.floor(Date.now() / 1e3)
      });
    }
    case "nip46Nip44Encrypt": {
      const n = t;
      return { ciphertext: await st().client.nip44Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip44Decrypt": {
      const n = t;
      return { plaintext: await st().client.nip44Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Nip04Encrypt": {
      const n = t;
      return { ciphertext: await st().client.nip04Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip04Decrypt": {
      const n = t;
      return { plaintext: await st().client.nip04Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Disconnect": {
      const n = Oe;
      return Oe = null, Ct(), n && di(n.client), {};
    }
    case "configure": {
      const n = t;
      return Kn = !!n.vaultRelayUrls?.length, An = !!n.discoveryRelayUrls?.length, n.vaultRelayUrls?.length && (S = n.vaultRelayUrls), n.discoveryRelayUrls?.length && (ve = n.discoveryRelayUrls), Cr(Tt(await Gr(v))), (!Kn || !An) && na(v).then(Cr, () => {
      }), {};
    }
    case "register": {
      const n = t, r = n.importKey ? await Is({ nsecOrHex: n.importKey, loginName: n.loginName, password: n.password, vaultRelayUrls: S }) : await xo({ loginName: n.loginName, password: n.password, vaultRelayUrls: S });
      return ie(), l.signer = new ke(r.everydayPrivateKey), l.everydayPrivateKey = r.everydayPrivateKey, l.accountId = r.accountId, l.recoveryPublicKey = r.recoveryPublicKey, l.activeCredentialEvent = r.credentialEvent, l.activeRecoveryEvent = r.recoveryEvent, l.everydayKeyDerived = r.everydayKeyDerived, Rn(r.connectionVaultRoot, r.vaultSudoKey), await Ne(), {
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
      const r = To(t.nsecOrHex), o = k(r), i = { everydayPublicKey: o, npub: lt(o) };
      return r.fill(0), i;
    }
    case "login": {
      const n = t, r = await Os({
        loginName: n.loginName,
        password: n.password,
        vaultRelayUrls: S,
        store: v,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return ie(), l.signer = new ke(r.everydayPrivateKey), l.everydayPrivateKey = r.everydayPrivateKey, l.accountId = r.accountId, l.recoveryPublicKey = r.recoveryPublicKey, l.activeCredentialEvent = r.credentialEvent, l.activeRecoveryEvent = r.recoveryCapsuleEvent, l.everydayKeyDerived = r.everydayKeyDerived, Rn(r.connectionVaultRoot, r.vaultSudoKey), await Ne(), !r.rollbackWarning && !r.relayDisagreementWarning && br({
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
      const n = t, r = await Ms({
        phrase: n.phrase,
        vaultRelayUrls: S,
        discoveryRelayUrls: ve,
        offlineRecoveryCapsuleEvents: n.offlineExportFile?.recovery_capsule_events
      });
      return Tr(r);
    }
    case "previewPhraseRebuild": {
      const r = await Ls({ phrase: t.phrase, vaultRelayUrls: S, discoveryRelayUrls: ve });
      return { ...r, npub: lt(r.everydayPublicKey) };
    }
    case "rebuildFromPhrase": {
      const r = await Ds({ phrase: t.phrase, vaultRelayUrls: S, discoveryRelayUrls: ve });
      return Tr(r);
    }
    case "completeRecovery": {
      const n = t;
      if (!l.pendingRecovery) throw new Error("No recovery is in progress in this session.");
      const r = await Us({
        recovered: l.pendingRecovery,
        newLoginName: n.newLoginName,
        newPassword: n.newPassword,
        vaultRelayUrls: S,
        store: v
      });
      return l.activeCredentialEvent = r.credentialEvent, l.activeRecoveryEvent = r.refreshedRecoveryEvent, l.pendingRecovery.recoveryPrivateKey.fill(0), l.pendingRecovery = null, await Ne(), {
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
        vaultRelayUrls: S,
        store: v,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return l.activeCredentialEvent = r.newCredentialEvent, l.recoveryPublicKey = r.recoveryPublicKey, l.activeRecoveryEvent = r.recoveryCapsuleEvent, await Ne(), {
        newLocatorPublicKey: r.newLocatorPublicKey,
        newGeneration: r.newGeneration,
        tombstoneAcknowledgedCount: r.tombstoneAcknowledgedCount,
        deletionAcknowledgedCount: r.deletionAcknowledgedCount
      };
    }
    case "publishProfileAndRelayLists": {
      const n = t, { everydayPrivateKey: r } = C();
      return ws({
        everydayPrivateKey: r,
        name: n.name,
        about: n.about,
        picture: n.picture,
        generalRelays: n.generalRelays,
        dmRelays: n.dmRelays,
        discoveryRelays: ve
      });
    }
    case "getPublicKey": {
      const { signer: n } = C();
      return { publicKey: n.getPublicKey() };
    }
    case "signEvent": {
      const { signer: n } = C(), r = t;
      if (l.signerOnly) {
        if (l.app) {
          const o = Ui(l.app.permissions, r, l.app.site, Date.now() / 1e3);
          if (!o) throw new Error("refused");
          return n.signEvent(o);
        }
        if (Vi(r.kind) !== "ordinary") throw new Error("refused");
      }
      return n.signEvent({ kind: r.kind, tags: r.tags, content: r.content, created_at: r.created_at });
    }
    case "nip44Encrypt": {
      const { signer: n } = C(), r = t;
      return { ciphertext: n.nip44Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip44Decrypt": {
      const { signer: n } = C(), r = t;
      return { plaintext: n.nip44Decrypt(r.peerPublicKey, r.payload) };
    }
    case "nip04Encrypt": {
      const { signer: n } = C(), r = t;
      return { ciphertext: n.nip04Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip04Decrypt": {
      const { signer: n } = C(), r = t;
      return { plaintext: n.nip04Decrypt(r.peerPublicKey, r.payload) };
    }
    case "exportIdentity": {
      const { everydayPrivateKey: n, signer: r } = C();
      return { nsec: gi(n), npub: lt(r.getPublicKey()) };
    }
    case "buildRecoveryExport": {
      if (C(), !l.recoveryPublicKey || !l.activeRecoveryEvent)
        throw new Error("No recovery capsule is known in this session yet.");
      return wi({
        recoveryPublicKeyHex: l.recoveryPublicKey,
        vaultRelayUrls: S,
        recoveryCapsuleEvents: [l.activeRecoveryEvent],
        relayListEvents: []
      });
    }
    case "repairReplicas": {
      if (!l.activeCredentialEvent || !l.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return br({
        relayUrls: S,
        credentialEvent: l.activeCredentialEvent,
        recoveryEvent: l.activeRecoveryEvent
      });
    }
    case "checkReplicaHealth": {
      if (!l.activeCredentialEvent || !l.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Cs({
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
      return !K && await Ot(v) === "locked" ? { restored: !1, locked: !0 } : dn();
    // Log out: this account is forgotten on this device. Other accounts kept here stay, and so does the lock
    // they are sealed under; with none left, everything goes as it always did.
    case "logout": {
      const n = l.everydayPrivateKey && !l.signerOnly ? k(l.everydayPrivateKey) : "", r = Mt(await le(v), n);
      return n && await de(v, ae(n)), r.length > 0 && n ? (await xe(v, r), ie(), await de(v), await rt(v), {}) : (ot(), await ut(v), await Sn(), await Kr(v), await rt(v), {});
    }
    // ---- Several accounts on one device (docs/account-switching.md) ----
    // Who is kept here, and which of them is signed in. Public keys and what their own profiles call them.
    case "accountsList": {
      const n = l.everydayPrivateKey && !l.signerOnly ? k(l.everydayPrivateKey) : "";
      return { accounts: (await le(v)).map((r) => ({ ...r, active: r.pubkey === n })) };
    }
    // Switch to a kept account: its own slot is opened, on this device, with no password and no relay. With the
    // lock on and locked, it says so, and nothing changes.
    case "accountsSwitch": {
      if (l.signerOnly) throw new Error("A signer-only session cannot switch accounts.");
      const n = String(t.pubkey ?? ""), r = await le(v);
      if (!r.some((i) => i.pubkey === n)) return { restored: !1 };
      if (!K && await Ot(v, ae(n)) === "locked") return { restored: !1, locked: !0 };
      const o = await dn(ae(n));
      return !o.restored || o.everydayPublicKey !== n ? (ie(), await de(v, ae(n)), await xe(v, Mt(r, n)), await de(v), await rt(v), { restored: !1 }) : (await Ne(), o);
    }
    // Make room to sign in as another account: nobody is signed in, and everyone kept stays kept.
    case "accountsAdd": {
      if (l.signerOnly) throw new Error("A signer-only session cannot add accounts.");
      return ie(), await de(v), await rt(v), {};
    }
    // Forget one kept account that is not the one signed in. (For that one: log out.)
    case "accountsRemove": {
      const n = String(t.pubkey ?? ""), r = l.everydayPrivateKey && !l.signerOnly ? k(l.everydayPrivateKey) : "";
      if (n === r) throw new Error("Log out to remove the account that is signed in.");
      return await de(v, ae(n)), await xe(v, Mt(await le(v), n)), {};
    }
    // ---- Connection Vault (connection-vault.md §12, reveal mode) ----
    case "vaultStatus":
      return l.signer ? l.connectionVaultRoot ? { enabled: !0, vaultPublicKey: Nn().vaultPublicKey } : { enabled: !1, reason: l.vaultKnown ? "no-vault" : "stale-cache" } : { enabled: !1 };
    case "vaultList": {
      const { connections: n, rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: s } = await Lt();
      return { connections: n.map(at), rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: s };
    }
    case "vaultSaveNwc": {
      const n = t, r = it(), o = Nn(), i = _r(n.uri), s = n.label.trim().slice(0, 120) || "Wallet connection", { record: a, event: c } = await o.createConnection({
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
        store: v
      })).success)
        throw new Error("The connection could not be saved to enough relays. Please try again.");
      const y = await o.decryptEvent(c);
      return at(y);
    }
    case "vaultFindForOrigin": {
      const n = it(), { connections: r } = await Lt(), o = r.find(
        (i) => i.record.connection_type === "nwc" && i.record.state === "active" && i.record.application_binding.origin === n
      );
      return { connection: o ? at(o) : null };
    }
    case "vaultRevealNwc": {
      const n = t, { connection: r } = await fn(n.connectionId);
      if (r.record.connection_type !== "nwc" || r.record.state !== "active")
        throw new Error("That connection is not an active wallet connection.");
      const o = r.record.application_binding.origin;
      if (o !== null && o !== it())
        throw new Error("That connection belongs to a different site.");
      const i = r.record.credential;
      return Wo(i), { uri: Xs(i) };
    }
    case "vaultSetBinding": {
      const n = t, { vault: r, connection: o } = await fn(n.connectionId), i = n.origin === null ? null : it(), { record: s, event: a } = await r.updateConnection(o, {
        application_binding: { origin: i, app_pubkey: null }
      });
      if (!(await r.publish({
        event: a,
        connectionId: s.connection_id,
        relayUrls: S,
        store: v
      })).success) throw new Error("The change could not reach enough relays. Please try again.");
      const u = await r.decryptEvent(a);
      return at(u);
    }
    case "vaultDelete": {
      const n = t, { vault: r, connection: o } = await fn(n.connectionId), { record: i, event: s } = await r.deleteConnection(o);
      if (!(await r.publish({
        event: s,
        connectionId: i.connection_id,
        relayUrls: S,
        store: v
      })).success) throw new Error("The deletion could not reach enough relays. Please try again.");
      try {
        const c = r.buildDeletionRequest(o.event.id), u = new A(S);
        await u.publishAll(c), u.closeAll();
      } catch {
      }
      return {};
    }
    case "vaultOfferCheck": {
      const n = t, r = it(), o = _r(n.uri), { connections: i } = await Lt(), s = i.find(
        (a) => a.record.connection_type === "nwc" && Qs(a.record.credential, o)
      );
      return s ? s.record.application_binding.origin !== r ? { duplicate: !1 } : { duplicate: !0, connection: at(s) } : { duplicate: !1 };
    }
    default:
      throw new Error(`Unknown worker action: ${e}`);
  }
}
const Wc = /* @__PURE__ */ new Set([
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
  if (typeof t.action != "string" || !Wc.has(t.action)) {
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
  (r.startsWith("nip46") ? (s) => s() : (s) => Bc.run(s))(() => jc(r, o)).then(
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
