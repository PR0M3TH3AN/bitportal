import { K as ki, b as Ei, c as q, D as Co, d as Dt, w as S, f as Wt, g as ft, h as rr, S as cn, j as ln, k as He, l as Et, B as _i, m as Pi, n as un, o as pt, q as or, r as dn, a as ot, s as No, t as Si, u as Ki } from "./bitlogin-shared-CDSZpiZ4.js";
import { g as P, s as B, v as C, b as $e, a as $, f as ve, i as Ai, j as Ri, k as Ci, l as Ni, m as Ti, n as gn, o as Br, p as To, q as Mi, t as Oi, w as Ii, x as At, y as Mo, u as G, z as Di, A as Vt, B as sr, C as ir, D as Oo, E as Li, d as I, e as U, F as ar, G as Io, H as Do, h as cr, I as Lo, J as xi, c as _t, K as Dn, L as Qe } from "./bitlogin-shared-Cj9s0_W_.js";
import { aj as Pt, ak as Re, al as lr, am as Ln, an as Ui, ao as st, ap as it, aq as at, ar as de, as as ce, at as xo, au as Uo, av as ht, aw as ur, a8 as wt, y as Bt, a5 as D, J as Gt, ax as se, ay as ie, O as vt, a2 as qi, z as dr, Q as yr, a7 as Pe, a as gt, k as fr, P as qo, b as Fo, az as xn, aA as Se, aB as ct, aC as $o, aD as Fi, aE as $i, aF as Wo, aG as Vo, aH as Gr, aI as Wi, aJ as Vi, aK as Oe, aL as Ie, aM as Ye, aN as Bi, aO as jr, aP as Jr, af as Gi, U as ji, A as Rt, u as Hr, aQ as Ji, aR as Hi, aS as zi, aT as Qi, aU as Yi, aV as Xi, aW as Zi, aX as ea, aY as ta, aZ as na, a_ as zr, a$ as ra, b0 as oa, b1 as sa, b2 as ia, b3 as aa, b4 as ca, b5 as mn, b6 as bn, b7 as Qr, b8 as la, b9 as ua, ba as Un, bb as Yr, bc as Xr, bd as Bo, H as da, be as Go, W as ya, X as fa, bf as pa, bg as ha, bh as wa, bi as va, bj as ga, bk as ma, bl as ba, V as ka, bm as Ea, bn as _a, bo as Zr } from "./bitlogin-shared-waDFdrWm.js";
import { e as pr, a as hr, b as wr } from "./bitlogin-shared-PwbHDYud.js";
function jo(e) {
  const t = P(e.privateKey);
  return B({
    pubkey: t,
    created_at: e.createdAt,
    kind: ki,
    tags: [
      ["e", e.eventIdToDelete],
      ["k", String(e.deletedEventKind)]
    ],
    content: e.reason ?? ""
  }, e.privateKey);
}
function Pa() {
  const e = globalThis.WebSocket;
  if (!e)
    throw new Error("No global WebSocket implementation is available in this environment.");
  return e;
}
const jt = 1e3, Sa = 262144;
function Ka(e) {
  const t = Math.min(e.limit ?? jt, jt);
  return Math.max(50, t * 3);
}
const Aa = 2048, Ra = 1e4, Ca = 100;
function Na(e, t) {
  if (e.size >= Aa) {
    const o = e.values().next().value;
    o !== void 0 && e.delete(o);
  }
  e.add(t);
}
class yn {
  url;
  ws = null;
  connectPromise = null;
  subs = /* @__PURE__ */ new Map();
  pendingPublishes = /* @__PURE__ */ new Map();
  authPrivateKey;
  connectTimeoutMs;
  authenticated = !1;
  constructor(t, o = {}) {
    if (!Pt(t))
      throw new Error("Relay URL must use secure WebSockets, except for an explicit loopback development endpoint.");
    this.url = t, this.authPrivateKey = o.authPrivateKey, this.connectTimeoutMs = o.connectTimeoutMs ?? 8e3;
  }
  async connect() {
    return this.connectPromise ? this.connectPromise : (this.connectPromise = new Promise((t, o) => {
      const n = Pa(), r = new n(this.url);
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
    if (t.length > Sa)
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
        if (d - a.liveWindowStart >= Ra && (a.liveWindowStart = d, a.liveVerifies = 0), a.liveVerifies >= Ca || (a.liveVerifies++, !C(i) || !eo(i, a.filter)))
          return;
        Na(a.seenIds, i.id), a.onEvent(i);
        return;
      }
      const l = Math.min(a.filter.limit ?? jt, jt);
      if (a.events.length >= l || a.verifyBudget <= 0 || (a.verifyBudget--, !C(i) || !eo(i, a.filter)))
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
    const o = P(this.authPrivateKey), n = B({
      pubkey: o,
      created_at: Math.floor(Date.now() / 1e3),
      kind: Ei,
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
    const n = $e($(8));
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
    const n = $e($(8));
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
        verifyBudget: Ka(t),
        liveWindowStart: 0,
        liveVerifies: 0,
        filter: t,
        onEose: () => a()
      }), this.send(["REQ", n, t]);
    });
  }
}
function eo(e, t) {
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
const to = "Not waited for: it didn't answer a moment ago.";
class T {
  connections = /* @__PURE__ */ new Map();
  kept;
  notWaitedFor;
  heard;
  constructor(t, o = {}) {
    this.kept = !!o.connectionFor, this.notWaitedFor = o.notWaitedFor ?? (() => !1), this.heard = o.heard ?? (() => {
    });
    for (const n of new Set(t))
      this.connections.set(n, o.connectionFor ? o.connectionFor(n) : new yn(n, o));
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
    return t.map(([r]) => ({ relayUrl: r, result: { ok: !1, message: to } }));
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
    })), ...r.map(([l]) => ({ relayUrl: l, events: [], responded: !1, error: to }))], a = i.filter((l) => l.responded).length, c = i.length;
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
        f || (f = !0, y && clearTimeout(y), c([...s.map(([g]) => l.get(g) ?? { relayUrl: g, result: { ok: !1, message: "Not waited for." } }), ...a]));
      };
      if (s.length === 0)
        return p();
      for (const [g, v] of s)
        v.publish(t, o).then((b) => (this.heard(g, !b.message.startsWith("timeout")), { relayUrl: g, result: b }), (b) => (this.heard(g, !1), { relayUrl: g, result: { ok: !1, message: b.message } })).then((b) => {
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
      for (const t of this.connections.values())
        t.close();
  }
}
function V(e) {
  return e.filter((t) => t.result.ok).length;
}
const St = null, Jo = [
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
], Ho = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  // Added 2026-11-18: relay.nostr.band timed out and nostr-pub.wellorder.net
  // never connected in the same measurement, leaving two working lookups.
  "wss://nos.lol"
], Ta = [], Ma = /^[0-9a-f]{64}$/u, Oa = 64;
function kn(e) {
  return Array.isArray(e) && e.length <= Oa && e.every((t) => typeof t == "string" && Pt(t)) && new Set(e).size === e.length;
}
function fn(e, t = St, o = -1) {
  if (!t || !Ma.test(t) || /^0{64}$/u.test(t) || !C(e) || e.pubkey !== t || e.kind !== q || ve(e, "d") !== Co)
    return null;
  try {
    const n = JSON.parse(e.content);
    if (typeof n != "object" || n === null || Array.isArray(n))
      return null;
    const r = n;
    return !Number.isSafeInteger(r.version) || r.version < 1 || r.version <= o || !kn(r.vaultRelays) || !kn(r.discoveryRelays) || r.deprecated !== void 0 && !kn(r.deprecated) ? null : {
      version: r.version,
      vaultRelays: r.vaultRelays,
      discoveryRelays: r.discoveryRelays,
      ...r.deprecated === void 0 ? {} : { deprecated: r.deprecated }
    };
  } catch {
    return null;
  }
}
function Ia(e) {
  return Math.max(0, e - 1);
}
function no(e, t, o) {
  const n = t ? o === "vault" ? t.vaultRelays : t.discoveryRelays : [], r = new Set(t?.deprecated ?? []), s = new Set(e), i = [...new Set(n)].filter((a) => !r.has(a) && !s.has(a)).slice(0, Ia(e.length));
  return [...e, ...i];
}
async function Da(e, t = St, o = -1, n = 6e3) {
  if (!t || e.length === 0)
    return null;
  const r = new T([...e]);
  let s;
  try {
    s = (await r.queryQuorum({ kinds: [q], authors: [t], "#d": [Co], limit: 3 }, n)).outcomes.flatMap((c) => c.events);
  } finally {
    r.closeAll();
  }
  let i = null;
  for (const a of s) {
    const c = fn(a, t, o);
    c && (!i || c.version > i.list.version) && (i = { event: a, list: c });
  }
  return i;
}
const zo = "bitlogin:bootstrap-relays:v1";
async function Qo(e, t = St) {
  if (!t)
    return null;
  try {
    const o = await e.get(zo);
    return o ? fn(JSON.parse(o), t) : null;
  } catch {
    return null;
  }
}
function Lt(e) {
  return {
    vaultRelays: no(Jo, e, "vault"),
    discoveryRelays: no(Ho, e, "discovery"),
    listVersion: e?.version ?? null
  };
}
async function La(e, t = {}) {
  const o = t.maintainerPubkeyHex === void 0 ? St : t.maintainerPubkeyHex, n = await Qo(e, o);
  if (!o)
    return Lt(null);
  const r = Lt(n), s = n?.version ?? -1;
  try {
    let i = await Da(t.queryRelayUrls ?? [.../* @__PURE__ */ new Set([...r.vaultRelays, ...r.discoveryRelays])], o, s, t.timeoutMs);
    if (!i) {
      const a = await xa(t.httpsFallbackUrls ?? Ta, o, s), c = a ? fn(a, o, s) : null;
      a && c && (i = { event: a, list: c });
    }
    return i ? (await e.set(zo, JSON.stringify(i.event)), Lt(i.list)) : r;
  } catch {
    return r;
  }
}
async function xa(e, t = St, o = -1) {
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
      if (C(a) && fn(a, t, o))
        return a;
    } catch {
    }
  return null;
}
const vr = /^[0-9a-f]{64}$/u, Ua = 8, qa = 4096, Fa = 256, $a = 512;
class De extends Error {
  name = "BunkerUriParseError";
}
class Wa extends Error {
  name = "Nip46RequestTimeoutError";
  constructor(t, o) {
    super(`The remote signer did not answer ${t} within ${Math.round(o / 1e3)}s. It may be offline, or waiting for your approval on another device -- check your signer and try again.`);
  }
}
class Va extends Error {
  name = "Nip46ErrorResponse";
}
function Ba(e) {
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return null;
  }
  const o = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol === "https:" || t.protocol === "http:" && o ? t.toString() : null;
}
function Ga(e) {
  if (e.length > qa)
    throw new De("That bunker URI is unreasonably long.");
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    throw new De("That doesn't look like a valid URI.");
  }
  if (t.protocol !== "bunker:")
    throw new De("A remote-signer URI must start with bunker://");
  const o = (t.host || t.pathname.replace(/^\/+/u, "")).toLowerCase();
  if (!vr.test(o))
    throw new De("The bunker URI does not name a valid signer public key.");
  const n = [
    ...new Set(t.searchParams.getAll("relay").map((s) => s.trim()).filter((s) => s.length > 0 && s.length <= $a))
  ].slice(0, Ua);
  if (n.length === 0)
    throw new De("The bunker URI names no relays -- without at least one relay= parameter there is no way to reach the signer.");
  const r = t.searchParams.get("secret") ?? void 0;
  if (r && r.length > Fa)
    throw new De("The bunker URI's secret is unreasonably long.");
  return { signerPubkey: o, relayUrls: n, secret: r || void 0 };
}
function ja(e) {
  if (!vr.test(e.clientPubkey))
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
const Ja = 12e4;
class ro {
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
    this.clientSecretKey = t.clientSecretKey, this.clientPubkey = P(t.clientSecretKey), this.pointer = t.pointer, this.conversationKey = Re(t.clientSecretKey, t.pointer.signerPubkey), this.onAuthUrl = t.onAuthUrl, this.requestTimeoutMs = t.requestTimeoutMs ?? Ja, this.conns = t.pointer.relayUrls.map((o) => new yn(o, { authPrivateKey: t.clientSecretKey }));
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
        kinds: [Dt],
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
      o = JSON.parse(lr(this.conversationKey, t.content));
    } catch {
      return;
    }
    if (typeof o.id != "string")
      return;
    const n = this.pending.get(o.id);
    if (n) {
      if (o.result === "auth_url") {
        if (!n.authUrlSeen && typeof o.error == "string" && o.error) {
          const r = Ba(o.error);
          r && (n.authUrlSeen = !0, this.onAuthUrl?.(r));
        }
        return;
      }
      if (this.pending.delete(o.id), clearTimeout(n.timer), typeof o.error == "string" && o.error) {
        n.reject(new Va(o.error));
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
    const n = $e($(8)), r = Ln(this.conversationKey, JSON.stringify({ id: n, method: t, params: o })), s = [["p", this.pointer.signerPubkey]], i = B({
      pubkey: this.clientPubkey,
      created_at: Math.floor(Date.now() / 1e3),
      kind: Dt,
      tags: s,
      content: r
    }, this.clientSecretKey), a = new Promise((d, y) => {
      const f = setTimeout(() => {
        this.pending.delete(n), y(new Wa(t, this.requestTimeoutMs));
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
    if (!vr.test(t))
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
    if (!C(r))
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
      const t = $e($(8)), o = Ln(this.conversationKey, JSON.stringify({ id: t, method: "logout", params: [] }));
      return B({
        pubkey: this.clientPubkey,
        created_at: Math.floor(Date.now() / 1e3),
        kind: Dt,
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
    this.pending.clear(), S(this.clientSecretKey), S(this.conversationKey);
  }
}
async function Ha(e) {
  const t = P(e.clientSecretKey), o = e.timeoutMs, n = e.relayUrls.map((s) => new yn(s, { authPrivateKey: e.clientSecretKey })), r = () => {
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
    const y = { kinds: [Dt], "#p": [t] }, f = (p) => {
      let g, v = null;
      try {
        v = Re(e.clientSecretKey, p.pubkey), g = JSON.parse(lr(v, p.content));
      } catch {
        return;
      } finally {
        v && S(v);
      }
      g.result === e.secret && l({ signerPubkey: p.pubkey });
    };
    Promise.allSettled(n.map((p) => p.subscribeLive(y, f))).then((p) => {
      p.some((g) => g.status === "fulfilled") || l(new Error("Could not reach any relay to listen for the signer."));
    });
  });
}
function gr() {
  const e = globalThis.crypto;
  if (!e || !e.subtle)
    throw new Error("WebCrypto SubtleCrypto is not available in this environment.");
  return e;
}
async function Yo(e) {
  if (e.length !== 32)
    throw new Error("AES-256-GCM key must be exactly 32 bytes.");
  return gr().subtle.importKey("raw", e, "AES-GCM", !1, ["encrypt", "decrypt"]);
}
async function Xo(e, t, o) {
  const n = Ai(), r = await Yo(e), s = await gr().subtle.encrypt({ name: "AES-GCM", iv: n, additionalData: o, tagLength: 128 }, r, t);
  return { nonce: n, ciphertext: new Uint8Array(s) };
}
async function Zo(e, t, o, n) {
  const r = await Yo(e);
  try {
    const s = await gr().subtle.decrypt({ name: "AES-GCM", iv: t, additionalData: n, tagLength: 128 }, r, o);
    return new Uint8Array(s);
  } catch {
    throw new Error("AES-256-GCM authentication failed: capsule is corrupted, tampered, or the wrong key was used.");
  }
}
const es = `abandon
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
function za(e, t, o, n) {
  Ni(e);
  const r = Ti({ dkLen: 32, asyncTick: 10 }, n), { c: s, dkLen: i, asyncTick: a } = r;
  if (gn(s), gn(i), gn(a), s < 1)
    throw new Error("iterations (c) should be >= 1");
  const c = Br(t), l = Br(o), d = new Uint8Array(i), y = To.create(e, c), f = y._cloneInto().update(l);
  return { c: s, dkLen: i, asyncTick: a, DK: d, PRF: y, PRFSalt: f };
}
function Qa(e, t, o, n, r) {
  return e.destroy(), t.destroy(), n && n.destroy(), Mi(r), o;
}
async function Ya(e, t, o, n) {
  const { c: r, dkLen: s, asyncTick: i, DK: a, PRF: c, PRFSalt: l } = za(e, t, o, n);
  let d;
  const y = new Uint8Array(4), f = Ri(y), p = new Uint8Array(c.outputLen);
  for (let g = 1, v = 0; v < s; g++, v += c.outputLen) {
    const b = a.subarray(v, v + c.outputLen);
    f.setInt32(0, g, !1), (d = l._cloneInto(d)).update(y).digestInto(p), b.set(p.subarray(0, b.length)), await Ci(r - 1, i, () => {
      c._cloneInto(d).update(p).digestInto(p);
      for (let w = 0; w < b.length; w++)
        b[w] ^= p[w];
    });
  }
  return Qa(c, l, a, d, p);
}
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const Xa = (e) => e[0] === "あいこくしん";
function ts(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function ns(e) {
  const t = ts(e), o = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(o.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: o };
}
function rs(e) {
  Ii(e, 16, 20, 24, 28, 32);
}
const Za = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([Mo(e)[0] >> t << t]);
};
function os(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), At.chain(At.checksum(1, Za), At.radix2(11, !0), At.alphabet(e));
}
function ec(e, t) {
  const { words: o } = ns(e), n = os(t).decode(o);
  return rs(n), n;
}
function tc(e, t) {
  return rs(e), os(t).encode(e).join(Xa(t) ? "　" : " ");
}
function nc(e, t) {
  try {
    ec(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const rc = (e) => ts("mnemonic" + e);
function oc(e, t = "") {
  return Ya(Oi, ns(e).nfkd, rc(t), { c: 2048, dkLen: 64 });
}
function ss(e) {
  if (e.length !== 16)
    throw new Error("Recovery phrase entropy must be exactly 128 bits (16 bytes).");
  return tc(e, es);
}
function mr(e) {
  try {
    return nc(Jt(e), es);
  } catch {
    return !1;
  }
}
function Jt(e) {
  return e.trim().normalize("NFKD").toLowerCase().split(/\s+/u).join(" ");
}
async function pn(e) {
  return oc(Jt(e), "");
}
const xt = [1024, 2048, 4096], Ke = 4;
function sc(e) {
  const t = Ke + e.length, o = xt.find((s) => s >= t);
  if (o === void 0)
    throw new Error(`Payload of ${e.length} bytes exceeds the largest padding bucket (${xt[xt.length - 1]} bytes minus ${Ke}-byte length prefix).`);
  const n = new Uint8Array(o);
  return new DataView(n.buffer).setUint32(0, e.length, !1), n.set(e, Ke), n;
}
function ic(e) {
  if (!xt.includes(e.length))
    throw new Error(`Padded plaintext length ${e.length} does not match a known bucket.`);
  const o = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !1);
  if (o > e.length - Ke)
    throw new Error("Declared payload length exceeds the padded bucket size.");
  const n = e.slice(Ke, Ke + o), r = e.slice(Ke + o);
  for (const s of r)
    if (s !== 0)
      throw new Error("Padding bytes are not all zero; capsule plaintext is malformed.");
  return n;
}
function ac(e) {
  const t = Di(e);
  if (t === void 0)
    throw new Error("Value is not JSON-serializable for canonicalization.");
  return t;
}
function cc(e) {
  return G(ac(e));
}
const we = 16, lc = 283;
function uc(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function br(e) {
  return e << 1 ^ lc & -(e >> 7);
}
function qe(e, t) {
  let o = 0;
  for (; t > 0; t >>= 1)
    o ^= e & -(t & 1), e = br(e);
  return o;
}
const qn = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let o = 0, n = 1; o < 256; o++, n ^= br(n))
    e[o] = n;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let o = 0; o < 255; o++) {
    let n = e[255 - o];
    n |= n << 8, t[e[o]] = (n ^ n >> 4 ^ n >> 5 ^ n >> 6 ^ n >> 7 ^ 99) & 255;
  }
  return ht(e), t;
})(), dc = /* @__PURE__ */ qn.map((e, t) => qn.indexOf(t)), yc = (e) => e << 24 | e >>> 8, En = (e) => e << 8 | e >>> 24;
function is(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const o = new Uint32Array(256).map((l, d) => t(e[d])), n = o.map(En), r = n.map(En), s = r.map(En), i = new Uint32Array(256 * 256), a = new Uint32Array(256 * 256), c = new Uint16Array(256 * 256);
  for (let l = 0; l < 256; l++)
    for (let d = 0; d < 256; d++) {
      const y = l * 256 + d;
      i[y] = o[l] ^ n[d], a[y] = r[l] ^ s[d], c[y] = e[l] << 8 | e[d];
    }
  return { sbox: e, sbox2: c, T0: o, T1: n, T2: r, T3: s, T01: i, T23: a };
}
const kr = /* @__PURE__ */ is(qn, (e) => qe(e, 3) << 24 | e << 16 | e << 8 | qe(e, 2)), as = /* @__PURE__ */ is(dc, (e) => qe(e, 11) << 24 | qe(e, 13) << 16 | qe(e, 9) << 8 | qe(e, 14)), fc = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, o = 1; t < 16; t++, o = br(o))
    e[t] = o;
  return e;
})();
function cs(e) {
  ur(e);
  const t = e.length;
  uc(e);
  const { sbox2: o } = kr, n = [];
  (!st || !it(e)) && n.push(e = at(e));
  const r = ce(de(e)), s = r.length, i = (c) => Q(o, c, c, c, c), a = new Uint32Array(t + 28);
  a.set(r);
  for (let c = s; c < a.length; c++) {
    let l = a[c - 1];
    c % s === 0 ? l = i(yc(l)) ^ fc[c / s - 1] : s > 6 && c % s === 4 && (l = i(l)), a[c] = a[c - s] ^ l;
  }
  return ht(...n), a;
}
function pc(e) {
  const t = cs(e), o = t.slice(), n = t.length, { sbox2: r } = kr, { T0: s, T1: i, T2: a, T3: c } = as;
  for (let l = 0; l < n; l += 4)
    for (let d = 0; d < 4; d++)
      o[l + d] = t[n - l - 4 + d];
  ht(t);
  for (let l = 4; l < n - 4; l++) {
    const d = o[l], y = Q(r, d, d, d, d);
    o[l] = s[y & 255] ^ i[y >>> 8 & 255] ^ a[y >>> 16 & 255] ^ c[y >>> 24];
  }
  return o;
}
function ye(e, t, o, n, r, s) {
  return e[o << 8 & 65280 | n >>> 8 & 255] ^ t[r >>> 8 & 65280 | s >>> 24 & 255];
}
function Q(e, t, o, n, r) {
  return e[t & 255 | o & 65280] | e[n >>> 16 & 255 | r >>> 16 & 65280] << 16;
}
function oo(e, t, o, n, r) {
  const { sbox2: s, T01: i, T23: a } = kr;
  let c = 0;
  t ^= e[c++], o ^= e[c++], n ^= e[c++], r ^= e[c++];
  const l = e.length / 4 - 2;
  for (let g = 0; g < l; g++) {
    const v = e[c++] ^ ye(i, a, t, o, n, r), b = e[c++] ^ ye(i, a, o, n, r, t), w = e[c++] ^ ye(i, a, n, r, t, o), k = e[c++] ^ ye(i, a, r, t, o, n);
    t = v, o = b, n = w, r = k;
  }
  const d = e[c++] ^ Q(s, t, o, n, r), y = e[c++] ^ Q(s, o, n, r, t), f = e[c++] ^ Q(s, n, r, t, o), p = e[c++] ^ Q(s, r, t, o, n);
  return { s0: d, s1: y, s2: f, s3: p };
}
function hc(e, t, o, n, r) {
  const { sbox2: s, T01: i, T23: a } = as;
  let c = 0;
  t ^= e[c++], o ^= e[c++], n ^= e[c++], r ^= e[c++];
  const l = e.length / 4 - 2;
  for (let g = 0; g < l; g++) {
    const v = e[c++] ^ ye(i, a, t, r, n, o), b = e[c++] ^ ye(i, a, o, t, r, n), w = e[c++] ^ ye(i, a, n, o, t, r), k = e[c++] ^ ye(i, a, r, n, o, t);
    t = v, o = b, n = w, r = k;
  }
  const d = e[c++] ^ Q(s, t, r, n, o), y = e[c++] ^ Q(s, o, t, r, n), f = e[c++] ^ Q(s, n, o, t, r), p = e[c++] ^ Q(s, r, n, o, t);
  return { s0: d, s1: y, s2: f, s3: p };
}
function wc(e) {
  if (ur(e), e.length % we !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + we);
}
function vc(e, t, o) {
  ur(e);
  let n = e.length;
  const r = n % we;
  if (!t && r !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (t) {
    let a = we - r;
    a || (a = we), n = n + a;
  }
  o = xo(n, o), Uo(e, o), (!st || !it(e)) && (e = at(e));
  const s = de(e);
  ce(s);
  const i = de(o);
  return { b: s, o: i, out: o };
}
function gc(e, t) {
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
function mc(e) {
  const t = new Uint8Array(16), o = de(t);
  t.set(e);
  const n = we - e.length;
  for (let r = we - n; r < we; r++)
    t[r] = n;
  return o;
}
const ls = /* @__PURE__ */ Ui({ blockSize: 16, nonceLength: 16 }, function(t, o, n = {}) {
  const r = !n.disablePadding;
  return {
    encrypt(s, i) {
      const a = cs(t), { b: c, o: l, out: d } = vc(s, r, i);
      let y = o;
      const f = [a];
      (!st || !it(y)) && f.push(y = at(y));
      const p = de(y);
      ce(p);
      let g = p[0], v = p[1], b = p[2], w = p[3], k = 0;
      for (; k + 4 <= c.length; )
        g ^= c[k + 0], v ^= c[k + 1], b ^= c[k + 2], w ^= c[k + 3], { s0: g, s1: v, s2: b, s3: w } = oo(a, g, v, b, w), l[k++] = g, l[k++] = v, l[k++] = b, l[k++] = w;
      if (r) {
        const m = mc(s.subarray(k * 4));
        ce(m), g ^= m[0], v ^= m[1], b ^= m[2], w ^= m[3], { s0: g, s1: v, s2: b, s3: w } = oo(a, g, v, b, w), l[k++] = g, l[k++] = v, l[k++] = b, l[k++] = w;
      }
      return ce(l), ht(...f), d;
    },
    decrypt(s, i) {
      wc(s);
      const a = pc(t);
      let c = o;
      const l = [a];
      (!st || !it(c)) && l.push(c = at(c));
      const d = de(c);
      ce(d), i = xo(s.length, i), Uo(s, i), (!st || !it(s)) && l.push(s = at(s));
      const y = de(s), f = de(i);
      ce(y);
      let p = d[0], g = d[1], v = d[2], b = d[3];
      for (let w = 0; w + 4 <= y.length; ) {
        const k = p, m = g, _ = v, L = b;
        p = y[w + 0], g = y[w + 1], v = y[w + 2], b = y[w + 3];
        const { s0: F, s1: X, s2: Z, s3: E } = hc(a, p, g, v, b);
        f[w++] = F ^ k, f[w++] = X ^ m, f[w++] = Z ^ _, f[w++] = E ^ L;
      }
      return ce(f), ht(...l), gc(i, r);
    }
  };
});
function us(e, t) {
  const o = ir(new Uint8Array([2]), Oo(t));
  return Li.getSharedSecret(e, o, !0).slice(1, 33);
}
function bc(e, t, o) {
  return kc(e, t, o, $(16));
}
function kc(e, t, o, n) {
  if (n.length !== 16)
    throw new Error("NIP-04 iv must be exactly 16 bytes.");
  const r = us(e, t), s = ls(r, n).encrypt(G(o));
  return `${Vt.encode(s)}?iv=${Vt.encode(n)}`;
}
function Ec(e, t, o) {
  const n = o.indexOf("?iv=");
  if (n === -1)
    throw new Error('NIP-04 payload is missing its "?iv=" suffix.');
  const r = Vt.decode(o.slice(0, n)), s = Vt.decode(o.slice(n + 4)), i = us(e, t), a = ls(i, s).decrypt(r);
  return sr(a);
}
class Ne extends Error {
  reason;
  constructor(t) {
    super("Account not found or credentials incorrect."), this.name = "AccountNotFoundError", this.reason = t;
  }
}
class ne extends Error {
  constructor(t) {
    super(t), this.name = "RegistrationFailedError";
  }
}
class ds extends Error {
  constructor(t = "An account already exists with this login name and password. Sign in instead, or choose different credentials.") {
    super(t), this.name = "AccountAlreadyExistsError";
  }
}
class fe extends Error {
  constructor(t) {
    super(t), this.name = "RecoveryFailedError";
  }
}
class ys extends Error {
  seenGeneration;
  capsuleGeneration;
  constructor(t, o) {
    super(`This credential capsule reports generation ${o}, but this device has already seen generation ${t}. Refusing to log in with older, possibly-revoked credentials.`), this.name = "RollbackDetectedError", this.seenGeneration = t, this.capsuleGeneration = o;
  }
}
function mt(e, t) {
  const o = t ?? Math.floor(Date.now() / 1e3);
  return e == null ? o : Math.max(o, e + 1);
}
const _c = { generation: -1, recoveryGeneration: -1 };
function Er(e) {
  return `bitlogin:hwm:${e}`;
}
async function _r(e, t) {
  const o = await e.get(Er(t));
  return o ? JSON.parse(o) : _c;
}
async function fs(e, t, o) {
  const n = await _r(e, t), r = {
    generation: Math.max(n.generation, o.generation ?? -1),
    recoveryGeneration: Math.max(n.recoveryGeneration, o.recoveryGeneration ?? -1)
  };
  return await e.set(Er(t), JSON.stringify(r)), r;
}
async function Pc(e, t, o = { generation: 0, recoveryGeneration: -1 }) {
  await e.set(Er(t), JSON.stringify(o));
}
function Sc(e, t, o) {
  return B({ pubkey: P(e), created_at: o, kind: Wt, tags: [], content: JSON.stringify(t) }, e);
}
function Kc(e, t, o) {
  const n = t.map((r) => {
    const s = ["r", r.url];
    return r.read && !r.write && s.push("read"), r.write && !r.read && s.push("write"), s;
  });
  return B({ pubkey: P(e), created_at: o, kind: ft, tags: n, content: "" }, e);
}
function Ac(e, t, o) {
  return B({
    pubkey: P(e),
    created_at: o,
    kind: rr,
    tags: t.map((n) => ["relay", n]),
    content: ""
  }, e);
}
function Rc(e) {
  return e.tags.filter((t) => t[0] === "r" && t[1]).map((t) => t[1]);
}
function Cc(e) {
  return e.tags.filter((t) => t[0] === "relay" && t[1]).map((t) => t[1]);
}
async function Nc(e) {
  const t = P(e.everydayPrivateKey), o = Math.floor(Date.now() / 1e3), n = [.../* @__PURE__ */ new Set([...e.generalRelays, ...e.dmRelays, ...e.discoveryRelays])], r = new T(n), [s, i, a] = await Promise.all([
    r.queryQuorum({ authors: [t], kinds: [Wt] }),
    r.queryQuorum({ authors: [t], kinds: [ft] }),
    r.queryQuorum({ authors: [t], kinds: [rr] })
  ]);
  r.closeAll();
  const c = s.outcomes.some((b) => b.events.length > 0), l = i.outcomes.some((b) => b.events.length > 0), d = a.outcomes.some((b) => b.events.length > 0), y = new T(n);
  let f = null, p = null, g = null;
  const v = [];
  if (!c && (e.name || e.about || e.picture)) {
    const b = Sc(e.everydayPrivateKey, { name: e.name, about: e.about, picture: e.picture }, o);
    v.push(y.publishAll(b).then((w) => void (f = w)));
  }
  if (!l) {
    const b = Kc(e.everydayPrivateKey, e.generalRelays.map((w) => ({ url: w, read: !0, write: !0 })), o);
    v.push(y.publishAll(b).then((w) => void (p = w)));
  }
  if (!d) {
    const b = Ac(e.everydayPrivateKey, e.dmRelays, o);
    v.push(y.publishAll(b).then((w) => void (g = w)));
  }
  return await Promise.all(v), y.closeAll(), {
    profilePublished: f !== null && V(f) > 0,
    relayListAcknowledgedCount: p !== null ? V(p) : 0,
    dmRelayListAcknowledgedCount: g !== null ? V(g) : 0,
    profileSkippedExisting: c,
    relayListSkippedExisting: l,
    dmRelayListSkippedExisting: d
  };
}
async function Te(e, t, o) {
  const n = o.minAcks ?? 2, r = o.minReadbacks ?? 2, s = await e.publishAll(t, o.timeoutMs), i = V(s), c = (await e.queryQuorum({ kinds: [q], authors: [t.pubkey], "#d": [o.dTag], limit: 5 }, o.timeoutMs)).outcomes.filter((l) => l.events.some((d) => d.id === t.id)).length;
  return {
    acknowledgedCount: i,
    readbackVerifiedCount: c,
    success: i >= n && c >= r
  };
}
function ps(e) {
  return G(`bitlogin|password-capsule|v1|${e}|30078|bitlogin:password:v1`);
}
function hs(e) {
  return G(`bitlogin|recovery-capsule|v1|${e}|30078|bitlogin:recovery:v1`);
}
async function Pr(e, t, o) {
  const n = cc(e), r = sc(n), s = await Xo(t, r, o);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    nonce: I(s.nonce),
    ciphertext: I(s.ciphertext)
  };
}
async function Sr(e, t, o) {
  if (e.version !== 1 || e.algorithm !== "aes-256-gcm")
    throw new Error(`Unsupported capsule envelope version/algorithm: ${e.version}/${e.algorithm}`);
  const n = U(e.nonce), r = U(e.ciphertext), s = await Zo(t, n, r, o), i = ic(s);
  return JSON.parse(sr(i));
}
class Kr extends Error {
  constructor(t) {
    super(t), this.name = "CapsuleValidationError";
  }
}
const Tc = 1e6, Mc = /^[0-9a-f]{64}$/u;
function M(e, t) {
  if (!e)
    throw new Kr(t);
}
function Ht(e) {
  return typeof e == "string" && Mc.test(e);
}
function ws(e) {
  M(Array.isArray(e), "vault_relay_hints must be an array (§12.4.7).");
  for (const t of e)
    M(typeof t == "string", "Each relay hint must be a string (§12.4.7)."), M(Pt(t), `Relay URL must use secure WebSockets, except for an explicit loopback development endpoint (§12.4.7): ${t}`);
}
function vs(e) {
  M(typeof e == "string", "account_id must be a string (§12.4.2).");
  let t;
  try {
    t = U(e);
  } catch {
    throw new Kr("account_id is not valid base64url (§12.4.2).");
  }
  M(t.length === 16, "account_id must decode to exactly 128 bits (§12.4.2).");
}
function gs(e, t) {
  M(typeof e == "string", "operational_private_key must be a string (§12.4.3).");
  const o = U(e);
  M(o.length === 32, "operational_private_key must be exactly 32 bytes (§12.4.3)."), M(ar(o), "operational_private_key is not a valid secp256k1 scalar (§12.4.3)."), M(Ht(t), "operational_public_key must be lowercase 64-char hex (§12.4.4).");
  const n = P(o);
  M(n === t, "operational_public_key does not match the derived public key (§12.4.4).");
}
function zt(e, t) {
  M(typeof t == "string", `${e} must be a string (§CV5.2).`);
  let o;
  try {
    o = U(t);
  } catch {
    throw new Kr(`${e} is not valid base64url (§CV5.2).`);
  }
  M(o.length === 32, `${e} must decode to exactly 32 bytes (§CV5.2).`);
}
function Oc(e) {
  const t = e.connection_vault_root, o = e.vault_sudo_key;
  t === void 0 && o === void 0 || (M(t !== void 0 && o !== void 0, "connection_vault_root and vault_sudo_key must appear together (§CV5.2)."), zt("connection_vault_root", t), zt("vault_sudo_key", o));
}
function Ic(e) {
  const t = e.connection_vault_root, o = e.vault_sudo_key;
  t === void 0 && o === void 0 || (M(t !== void 0, "vault_sudo_key cannot appear without connection_vault_root (§CV5.2)."), zt("connection_vault_root", t), o !== void 0 && zt("vault_sudo_key", o));
}
function ms(e, t) {
  M(Number.isInteger(e) && e >= 0 && e <= Tc, `${t} is out of supported bounds (§12.4.8).`);
}
function Dc(e) {
  M(e.schema === ln, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), vs(e.account_id), ms(e.generation, "generation"), gs(e.operational_private_key, e.operational_public_key), M(Ht(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex (§12.4.5)."), ws(e.vault_relay_hints), Ic(e);
  const t = e.recovery_capsule_event;
  M(!!t && typeof t == "object", "recovery_capsule_event must be present (§12.4.6)."), M(C(t), "Embedded recovery_capsule_event has an invalid event id or signature (§12.4.6)."), M(t.pubkey === e.recovery_public_key, "Embedded recovery_capsule_event author does not match recovery_public_key (§12.4.5).");
}
function Lc(e) {
  M(e.schema === cn, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), vs(e.account_id), ms(e.recovery_generation, "recovery_generation"), M(e.previous_recovery_event_id === null || Ht(e.previous_recovery_event_id), "previous_recovery_event_id must be null or lowercase 64-char hex (§12.3)."), gs(e.operational_private_key, e.operational_public_key), M(Ht(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex."), ws(e.vault_relay_hints), Oc(e);
}
function xc(e) {
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
async function Ar(e) {
  const t = P(e.locatorPrivateKey), o = await Pr(e.payload, e.capsuleKey, ps(t));
  return B({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: q,
    tags: [["d", He]],
    content: JSON.stringify(o)
  }, e.locatorPrivateKey);
}
function Uc(e) {
  const t = P(e.oldLocatorPrivateKey);
  return B({
    pubkey: t,
    created_at: e.createdAt,
    kind: q,
    tags: [["d", He]],
    content: ""
  }, e.oldLocatorPrivateKey);
}
async function qc(e, t) {
  if (!C(e))
    throw new Error("Credential capsule event has an invalid id or signature.");
  const o = JSON.parse(e.content), n = await Sr(o, t, ps(e.pubkey));
  return Dc(n), n;
}
async function Rr(e) {
  const t = P(e.recoveryPrivateKey), o = await Pr(e.payload, e.capsuleKey, hs(t));
  return B({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: q,
    tags: [["d", Et]],
    content: JSON.stringify(o)
  }, e.recoveryPrivateKey);
}
async function bs(e, t) {
  if (!C(e))
    throw new Error("Recovery capsule event has an invalid id or signature.");
  const o = JSON.parse(e.content), n = await Sr(o, t, hs(e.pubkey));
  return Lc(n), n;
}
function Fc(e) {
  return e.responded ? "answered" : /connecting to relay|Not connected to relay|Not waited for/u.test(e.error ?? "") ? "not-asked" : "slow";
}
function _n(e, t, o) {
  const n = /* @__PURE__ */ new Map();
  for (const r of e)
    r.pubkey === t && r.kind === q && ve(r, "d") === o && C(r) && n.set(r.id, r);
  return [...n.values()].sort((r, s) => s.created_at - r.created_at);
}
async function ks(e, t, o, n, r) {
  const s = await e.queryQuorum({ kinds: [q], authors: [t], "#d": [o], limit: 5 }, r), i = s.outcomes.flatMap((f) => f.events), a = _n(i, t, o), c = [];
  for (const f of a)
    try {
      const p = await n(f);
      c.push({ event: f, payload: p });
    } catch (p) {
      c.push({ event: f, payload: null, error: p.message });
    }
  const l = c.find((f) => f.payload !== null) ?? null, d = s.outcomes.map((f) => ({
    responded: f.responded,
    events: _n(f.events, t, o)
  })).filter((f) => f.responded && f.events.length > 0).map((f) => f.events[0].id), y = new Set(d).size > 1;
  return {
    quorumMet: s.quorumMet,
    respondedCount: s.respondedCount,
    totalCount: s.totalCount,
    candidates: c,
    best: l,
    relayDisagreement: y,
    relays: s.outcomes.map((f) => ({ relayUrl: f.relayUrl, state: Fc(f), held: _n(f.events, t, o).length }))
  };
}
async function bt(e, t, o, n = 8e3) {
  return ks(e, t, He, (r) => qc(r, o), n);
}
async function Es(e, t, o, n = 8e3) {
  return ks(e, t, Et, (r) => bs(r, o), n);
}
function $c(e) {
  const t = e.filter((o) => o.payload !== null);
  return t.length < 2 ? { consistent: !0 } : xc(t.map((o) => ({
    eventId: o.event.id,
    recoveryGeneration: o.payload.recovery_generation,
    previousRecoveryEventId: o.payload.previous_recovery_event_id
  })));
}
async function Wc(e, t, o) {
  const n = ve(t, "d") ?? "", r = new T(e);
  try {
    const s = await r.queryQuorum({ kinds: [t.kind], authors: [t.pubkey], "#d": [n], limit: 5 }, o), i = [], a = /* @__PURE__ */ new Map();
    for (const c of s.outcomes) {
      const l = c.events.filter((d) => d.kind === t.kind && d.pubkey === t.pubkey && ve(d, "d") === n);
      c.responded ? l.some((d) => d.id !== t.id) ? a.set(c.relayUrl, "held back: it holds another record at this address") : i.push(c.relayUrl) : a.set(c.relayUrl, "held back: it didn't answer what it holds at this address");
    }
    return { ok: i, heldBack: a };
  } finally {
    r.closeAll();
  }
}
async function so(e) {
  const t = [...new Set(e.relayUrls)], o = async (l, d = t) => {
    if (d.length === 0)
      return /* @__PURE__ */ new Map();
    const y = new T(d);
    try {
      const f = await y.publishAll(l, e.timeoutMs);
      return new Map(f.map((p) => [
        p.relayUrl,
        { ok: p.result.ok, message: p.result.message ?? "" }
      ]));
    } finally {
      y.closeAll();
    }
  }, n = await Wc(t, e.credentialEvent, e.timeoutMs), [r, s] = await Promise.all([
    o(e.credentialEvent, n.ok),
    o(e.recoveryEvent)
  ]), i = new Map(r);
  for (const [l, d] of n.heldBack)
    i.set(l, { ok: !1, message: d });
  const a = { ok: !1, message: "no reply" }, c = t.map((l) => ({
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
function Vc(e) {
  const t = ve(e, "d");
  if (e.kind !== q || t === void 0 || !C(e))
    throw new Error("This session's capsule event is not a valid capsule.");
  return { pubkey: e.pubkey, dTag: t };
}
function Bc(e, t, o) {
  const n = e.filter((s) => s.pubkey === o.pubkey && s.kind === q && ve(s, "d") === o.dTag && C(s));
  return n.some((s) => s.id === t.id) ? "current" : n.length === 0 ? "missing" : Math.max(...n.map((s) => s.created_at)) >= t.created_at ? "newer" : "older";
}
async function io(e, t, o) {
  const n = Vc(t), r = new T(e);
  try {
    const s = await r.queryQuorum({
      kinds: [q],
      authors: [n.pubkey],
      "#d": [n.dTag],
      limit: 5
    }, o);
    return new Map(s.outcomes.map((i) => [
      i.relayUrl,
      i.responded ? { status: Bc(i.events, t, n) } : { status: "unreachable", error: i.error }
    ]));
  } finally {
    r.closeAll();
  }
}
async function Gc(e) {
  const t = [...new Set(e.relayUrls)], [o, n] = await Promise.all([
    io(t, e.credentialEvent, e.timeoutMs),
    io(t, e.recoveryEvent, e.timeoutMs)
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
const Cr = _i.id, We = "aes-256-gcm-v1", Ve = "bitlogin-bip39-hkdf-v1", _s = "bitlogin-recovery-hkdf-v1", jc = 4, Jc = 64;
function Be(e) {
  return [...new Set(e)].filter((t) => t.length <= Jc).slice(0, jc);
}
function Ge(e) {
  return e ? { everyday_derivation: _s } : {};
}
function Ps(e) {
  return e.protocol?.everyday_derivation === _s;
}
const Hc = 5e3;
async function Nr(e) {
  const t = [...new Set(e.urls)], o = await e.read(t, e.timeoutMs), n = o.relays.filter((s) => s.state === "answered").map((s) => s.relayUrl);
  if (o.candidates.length > 0)
    return { state: "taken", result: o, answeredUrls: n };
  const r = o.relays.filter((s) => s.state === "slow").map((s) => s.relayUrl);
  if (r.length > 0) {
    const s = await e.read(r, e.slowWaitMs ?? Hc);
    if (s.candidates.length > 0)
      return { state: "taken", result: s, answeredUrls: [...n, ...s.relays.filter((i) => i.state === "answered").map((i) => i.relayUrl)] };
    if (s.relays.some((i) => i.state !== "answered"))
      return { state: "unchecked", why: "slow", answered: n.length, of: t.length };
    n.push(...r);
  }
  return n.length < Math.ceil(t.length / 2) ? { state: "unchecked", why: "too-few", answered: n.length, of: t.length } : { state: "free", writeUrls: n };
}
const Tr = {
  slow: "a vault relay that connected didn't finish answering, and it may hold an account",
  "too-few": "too few vault relays answered"
};
async function Ss(e) {
  const t = un(e.loginName), o = e.now ?? Math.floor(Date.now() / 1e3), { locatorPrivateKey: n, capsuleKey: r } = await pt(e.password, t);
  try {
    const s = P(n), i = await Nr({
      urls: e.vaultRelayUrls,
      timeoutMs: e.timeoutMs,
      read: async (k, m) => {
        const _ = new T(k, { authPrivateKey: n });
        try {
          return await bt(_, s, r, m);
        } finally {
          _.closeAll();
        }
      }
    });
    if (i.state === "taken")
      throw new ds();
    if (i.state === "unchecked")
      throw new ne(`Couldn't check that this login name and password are free: ${Tr[i.why]}. Nothing was registered. Try again in a moment.`);
    const a = i.writeUrls, c = e.everydayPrivateKey !== void 0;
    if (c && !ar(e.everydayPrivateKey))
      throw new ne("The provided key is not a valid secp256k1 private key.");
    if (e.recoveryPhrase !== void 0 && (c || !mr(Jt(e.recoveryPhrase))))
      throw new ne("That recovery phrase can't make this account.");
    const l = e.recoveryPhrase !== void 0 ? Jt(e.recoveryPhrase) : ss(Io()), d = await pn(l);
    let y, f, p;
    try {
      ({ recoveryPrivateKey: y, capsuleKey: f } = or(d)), p = c ? e.everydayPrivateKey : dn(d);
    } finally {
      S(d);
    }
    const g = !c, v = $(32), b = $(32);
    let w = !1;
    try {
      const k = P(y), m = P(p), _ = I(Do()), L = {
        schema: cn,
        account_id: _,
        recovery_generation: 0,
        previous_recovery_event_id: null,
        operational_private_key: I(p),
        operational_public_key: m,
        recovery_public_key: k,
        connection_vault_root: I(v),
        vault_sudo_key: I(b),
        created_at: o,
        vault_relay_hints: Be(e.vaultRelayUrls),
        protocol: {
          capsule_encryption: We,
          recovery_derivation: Ve,
          ...Ge(g)
        }
      }, F = await Rr({
        recoveryPrivateKey: y,
        capsuleKey: f,
        payload: L
      }), X = new T(e.vaultRelayUrls, {
        authPrivateKey: y
      });
      let Z;
      try {
        Z = await Te(X, F, {
          dTag: Et,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        X.closeAll();
      }
      if (!Z.success)
        throw new ne("The recovery capsule did not reach the required relay acknowledgement and readback quorum. No login credential was published. Please retry, or add more vault relays.");
      const E = {
        schema: ln,
        account_id: _,
        generation: 0,
        operational_private_key: I(p),
        operational_public_key: m,
        recovery_public_key: k,
        recovery_capsule_event: F,
        connection_vault_root: I(v),
        created_at: o,
        vault_relay_hints: Be(e.vaultRelayUrls),
        protocol: {
          password_kdf: Cr,
          capsule_encryption: We,
          recovery_derivation: Ve,
          ...Ge(g)
        }
      }, K = await Ar({
        locatorPrivateKey: n,
        capsuleKey: r,
        payload: E
      }), O = new T(a, {
        authPrivateKey: n
      });
      let vn;
      try {
        vn = await Te(O, K, {
          dTag: He,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        O.closeAll();
      }
      if (!vn.success)
        throw new ne("Registration did not reach the required credential acknowledgement and readback quorum. Please retry, or add more vault relays.");
      return w = !0, {
        normalizedLoginName: t,
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
        recoveryEvent: F,
        credentialPublish: vn,
        recoveryPublish: Z
      };
    } finally {
      S(y, f), w || (c || S(p), S(v, b));
    }
  } finally {
    S(n, r);
  }
}
async function zc(e) {
  const { nsecOrHex: t, ...o } = e, n = Ks(t);
  return Ss({ ...o, everydayPrivateKey: n });
}
function Ks(e) {
  const t = e.trim();
  let o;
  if (t.startsWith("nsec1"))
    o = Pi(t);
  else if (/^[0-9a-fA-F]{64}$/u.test(t))
    o = Oo(t.toLowerCase());
  else
    throw new ne("Enter a valid nsec (nsec1…) or a 64-character hex private key.");
  if (!ar(o))
    throw new ne("The provided key is not a valid secp256k1 private key.");
  return o;
}
class As {
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
async function Qc(e) {
  const t = un(e.loginName), { locatorPrivateKey: o, capsuleKey: n } = await pt(e.password, t), r = P(o), s = new T(e.vaultRelayUrls, {
    authPrivateKey: o
  });
  try {
    const i = await bt(s, r, n, e.timeoutMs);
    if (!i.quorumMet)
      throw new Ne("quorum-not-met");
    if (!i.best)
      throw new Ne(i.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
    const a = i.best.payload, c = e.store ?? new As(), l = await _r(c, a.operational_public_key), d = a.generation < l.generation;
    if (d && !e.acknowledgeRollback)
      throw new ys(l.generation, a.generation);
    const y = d ? `This device previously saw credential generation ${l.generation}, but the accepted capsule is generation ${a.generation}. Relays may be serving stale data, or an old capsule is being replayed.` : void 0;
    await fs(c, a.operational_public_key, {
      generation: a.generation
    });
    const f = i.relayDisagreement ? 'Configured relays returned different credential capsules as "latest" for this account. Some relays may be stale, censored, or malicious.' : void 0;
    return {
      everydayPrivateKey: U(a.operational_private_key),
      everydayPublicKey: a.operational_public_key,
      recoveryPublicKey: a.recovery_public_key,
      accountId: a.account_id,
      generation: a.generation,
      everydayKeyDerived: Ps(a),
      credentialEvent: i.best.event,
      recoveryCapsuleEvent: a.recovery_capsule_event,
      connectionVaultRoot: a.connection_vault_root ? U(a.connection_vault_root) : void 0,
      rollbackWarning: y,
      relayDisagreementWarning: f
    };
  } finally {
    s.closeAll();
  }
}
function ao(e) {
  return e.filter((t) => C(t)).sort((t, o) => o.created_at - t.created_at)[0];
}
async function Yc(e) {
  if (!mr(e.phrase))
    throw new fe("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await pn(e.phrase), { recoveryPrivateKey: o, capsuleKey: n } = or(t), r = dn(t), s = P(r);
  S(t, r);
  const i = P(o), a = new T(e.vaultRelayUrls, {
    authPrivateKey: o
  });
  let c;
  try {
    c = await Es(a, i, n, e.timeoutMs);
  } finally {
    a.closeAll();
  }
  if (e.offlineRecoveryCapsuleEvents?.length) {
    const v = [];
    for (const m of e.offlineRecoveryCapsuleEvents)
      if (C(m))
        try {
          v.push({
            event: m,
            payload: await bs(m, n)
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
    const w = [...b.values()].sort((m, _) => _.event.created_at - m.event.created_at), k = w.find((m) => m.payload !== null) ?? null;
    c = {
      ...c,
      candidates: w,
      best: k,
      quorumMet: c.quorumMet || k !== null
    };
  }
  if (!c.quorumMet)
    throw new Ne("quorum-not-met");
  if (!c.best)
    throw new Ne(c.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const l = c.best.payload, d = $c(c.candidates), y = U(l.operational_private_key), f = l.operational_public_key, { generalRelays: p, dmRelays: g } = await Rs(f, [...e.discoveryRelayUrls, ...l.vault_relay_hints], e.timeoutMs);
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
async function Rs(e, t, o) {
  const n = new T([...new Set(t)]);
  let r = [], s = [];
  try {
    const i = await n.queryQuorum({ kinds: [ft], authors: [e], limit: 5 }, o), a = ao(i.outcomes.flatMap((d) => d.events));
    a && (r = Rc(a));
    const c = await n.queryQuorum({ kinds: [rr], authors: [e], limit: 5 }, o), l = ao(c.outcomes.flatMap((d) => d.events));
    l && (s = Cc(l));
  } finally {
    n.closeAll();
  }
  return { generalRelays: r, dmRelays: s };
}
async function Cs(e) {
  if (!mr(e))
    throw new fe("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await pn(e);
  try {
    const { recoveryPrivateKey: o, capsuleKey: n } = or(t), r = dn(t);
    return {
      recoveryPrivateKey: o,
      recoveryPublicKey: P(o),
      capsuleKey: n,
      everydayPrivateKey: r,
      everydayPublicKey: P(r)
    };
  } finally {
    S(t);
  }
}
async function Ns(e, t, o) {
  const n = new T(t, {
    authPrivateKey: e.recoveryPrivateKey
  });
  let r;
  try {
    r = await Es(n, e.recoveryPublicKey, e.capsuleKey, o);
  } finally {
    n.closeAll();
  }
  if (!r.quorumMet)
    throw new Ne("quorum-not-met");
  if (r.best)
    throw new fe("This account's recovery capsule is still on the relays. Use normal recovery instead of a rebuild.");
  return r.candidates.length > 0 ? Math.max(...r.candidates.map((s) => s.event.created_at)) : null;
}
async function Xc(e) {
  const t = await Cs(e.phrase);
  try {
    await Ns(t, e.vaultRelayUrls, e.timeoutMs);
    const o = new T([
      .../* @__PURE__ */ new Set([...e.discoveryRelayUrls, ...e.vaultRelayUrls])
    ]);
    try {
      const r = (await o.queryQuorum({
        kinds: [Wt, ft],
        authors: [t.everydayPublicKey],
        limit: 10
      }, e.timeoutMs)).outcomes.flatMap((s) => s.events).filter((s) => s.pubkey === t.everydayPublicKey && C(s));
      return {
        everydayPublicKey: t.everydayPublicKey,
        profileFound: r.some((s) => s.kind === Wt),
        relayListFound: r.some((s) => s.kind === ft)
      };
    } finally {
      o.closeAll();
    }
  } finally {
    S(t.recoveryPrivateKey, t.capsuleKey, t.everydayPrivateKey);
  }
}
async function Zc(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), o = await Cs(e.phrase);
  let n = !1;
  try {
    const r = await Ns(o, e.vaultRelayUrls, e.timeoutMs), s = {
      schema: cn,
      account_id: I(Do()),
      recovery_generation: 0,
      previous_recovery_event_id: null,
      operational_private_key: I(o.everydayPrivateKey),
      operational_public_key: o.everydayPublicKey,
      recovery_public_key: o.recoveryPublicKey,
      connection_vault_root: I($(32)),
      vault_sudo_key: I($(32)),
      created_at: r === null ? t : mt(r, t),
      vault_relay_hints: Be(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: We,
        recovery_derivation: Ve,
        ...Ge(!0)
      }
    }, i = await Rr({
      recoveryPrivateKey: o.recoveryPrivateKey,
      capsuleKey: o.capsuleKey,
      payload: s
    }), a = new T(e.vaultRelayUrls, {
      authPrivateKey: o.recoveryPrivateKey
    });
    let c;
    try {
      c = await Te(a, i, {
        dTag: Et,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      a.closeAll();
    }
    if (!c.success)
      throw new fe("Could not publish the rebuilt recovery capsule to enough relays. Nothing else was changed; please retry.");
    const { generalRelays: l, dmRelays: d } = await Rs(o.everydayPublicKey, [...e.discoveryRelayUrls, ...e.vaultRelayUrls], e.timeoutMs);
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
async function el(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), o = un(e.newLoginName), { recovered: n } = e, r = n.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: n.currentRecoveryPayload.connection_vault_root,
    vault_sudo_key: n.currentRecoveryPayload.vault_sudo_key
  } : {}, s = n.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: n.currentRecoveryPayload.connection_vault_root
  } : {}, { locatorPrivateKey: i, capsuleKey: a } = await pt(e.newPassword, o);
  try {
    const c = P(i), l = await Nr({
      urls: e.vaultRelayUrls,
      timeoutMs: e.timeoutMs,
      read: async (_, L) => {
        const F = new T(_, { authPrivateKey: i });
        try {
          return await bt(F, c, a, L);
        } finally {
          F.closeAll();
        }
      }
    });
    if (l.state === "unchecked")
      throw new fe(`Couldn't check that this login name and password are free: ${Tr[l.why]}. Nothing was changed. Try again in a moment.`);
    let d;
    if (l.state === "taken") {
      const _ = l.result.best?.payload ?? null;
      if (!(_ !== null && _.account_id === n.accountId && _.operational_public_key === n.everydayPublicKey && _.recovery_public_key === n.recoveryPublicKey && _.generation === 0 && _.recovery_capsule_event.id === n.currentRecoveryEvent.id))
        throw new fe("Another account is already registered with that login name and password. Pick a different one.");
      d = l.answeredUrls;
    } else
      d = l.writeUrls;
    const y = n.currentRecoveryPayload.recovery_generation + 1, f = {
      schema: cn,
      account_id: n.accountId,
      recovery_generation: y,
      previous_recovery_event_id: n.currentRecoveryEvent.id,
      operational_private_key: I(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      ...r,
      created_at: mt(n.currentRecoveryEvent.created_at, t),
      vault_relay_hints: Be(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: We,
        recovery_derivation: Ve,
        ...Ge(n.everydayKeyDerived)
      }
    }, p = await Rr({
      recoveryPrivateKey: n.recoveryPrivateKey,
      capsuleKey: n.recoveryCapsuleKey,
      payload: f
    }), g = new T(e.vaultRelayUrls, {
      authPrivateKey: n.recoveryPrivateKey
    });
    let v;
    try {
      v = await Te(g, p, {
        dTag: Et,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      g.closeAll();
    }
    if (!v.success)
      throw new fe("Could not publish the refreshed recovery capsule to enough relays. No new credential was published; please retry.");
    n.currentRecoveryEvent = p, n.currentRecoveryPayload = f;
    const b = {
      schema: ln,
      account_id: n.accountId,
      generation: 0,
      operational_private_key: I(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      recovery_capsule_event: p,
      ...s,
      // A retry may be repairing a credential that reached only one relay.
      // It must replace that partial event deterministically on every relay.
      created_at: l.state === "taken" && l.result.best ? mt(l.result.best.event.created_at, t) : t,
      vault_relay_hints: Be(e.vaultRelayUrls),
      protocol: {
        password_kdf: Cr,
        capsule_encryption: We,
        recovery_derivation: Ve,
        ...Ge(n.everydayKeyDerived)
      }
    }, w = await Ar({
      locatorPrivateKey: i,
      capsuleKey: a,
      payload: b
    }), k = new T(d, {
      authPrivateKey: i
    });
    let m;
    try {
      m = await Te(k, w, {
        dTag: He,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      k.closeAll();
    }
    if (!m.success)
      throw new fe("Could not publish the new credential capsule to enough relays. Please retry.");
    return e.store && await Pc(e.store, n.everydayPublicKey, {
      generation: 0,
      recoveryGeneration: y
    }), {
      normalizedLoginName: o,
      locatorPublicKey: c,
      credentialEvent: w,
      refreshedRecoveryEvent: p,
      credentialPublish: m,
      recoveryPublish: v
    };
  } finally {
    S(i, a);
  }
}
async function tl(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), o = un(e.loginName), n = await pt(e.oldPassword, o), r = P(n.locatorPrivateKey), s = new T(e.vaultRelayUrls, {
    authPrivateKey: n.locatorPrivateKey
  });
  let i;
  try {
    i = await bt(s, r, n.capsuleKey, e.timeoutMs);
  } finally {
    s.closeAll();
  }
  if (!i.quorumMet)
    throw new Ne("quorum-not-met");
  if (!i.best)
    throw new Ne(i.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const a = i.best.payload, c = i.best.event, l = e.store ?? new As(), d = await _r(l, a.operational_public_key);
  if (a.generation < d.generation && !e.acknowledgeRollback)
    throw new ys(d.generation, a.generation);
  const y = await pt(e.newPassword, o), f = P(y.locatorPrivateKey), p = await Nr({
    urls: e.vaultRelayUrls,
    timeoutMs: e.timeoutMs,
    read: async (E, K) => {
      const O = new T(E, { authPrivateKey: y.locatorPrivateKey });
      try {
        return await bt(O, f, y.capsuleKey, K);
      } finally {
        O.closeAll();
      }
    }
  });
  if (p.state === "taken")
    throw new ds("Another account is already registered with this login name and the new password you chose. Pick a different new password.");
  if (p.state === "unchecked")
    throw new ne(`Couldn't check that the new password is free under this login name: ${Tr[p.why]}. Your password wasn't changed. Try again in a moment.`);
  const g = p.writeUrls, v = a.generation + 1, b = {
    schema: ln,
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
    created_at: t,
    vault_relay_hints: Be(e.vaultRelayUrls),
    protocol: {
      password_kdf: Cr,
      capsule_encryption: We,
      recovery_derivation: Ve,
      ...Ge(Ps(a))
    }
  }, w = await Ar({
    locatorPrivateKey: y.locatorPrivateKey,
    capsuleKey: y.capsuleKey,
    payload: b
  }), k = new T(g, {
    authPrivateKey: y.locatorPrivateKey
  }), m = await Te(k, w, {
    dTag: He,
    minAcks: e.minAcknowledgements,
    timeoutMs: e.timeoutMs
  });
  if (k.closeAll(), !m.success)
    throw new ne("The new credential capsule did not reach the required relay acknowledgement and readback quorum. Your existing password still works; nothing was changed. Please retry.");
  const _ = Uc({
    oldLocatorPrivateKey: n.locatorPrivateKey,
    createdAt: mt(c.created_at, t)
  }), L = jo({
    privateKey: n.locatorPrivateKey,
    eventIdToDelete: c.id,
    deletedEventKind: q,
    createdAt: t
  }), F = new T(e.vaultRelayUrls, {
    authPrivateKey: n.locatorPrivateKey
  }), [X, Z] = await Promise.all([
    F.publishAll(_, e.timeoutMs),
    F.publishAll(L, e.timeoutMs)
  ]);
  return F.closeAll(), await fs(l, a.operational_public_key, {
    generation: v
  }), {
    normalizedLoginName: o,
    oldLocatorPublicKey: r,
    newLocatorPublicKey: f,
    newGeneration: v,
    recoveryPublicKey: a.recovery_public_key,
    recoveryCapsuleEvent: a.recovery_capsule_event,
    newCredentialEvent: w,
    tombstoneEvent: _,
    deletionRequestEvent: L,
    newCredentialPublish: m,
    tombstoneAcknowledgedCount: V(X),
    deletionAcknowledgedCount: V(Z)
  };
}
const nl = "bitlogin/connection-vault-root/v1", rl = "bitlogin/connection-vault-signing/v1", ol = "bitlogin/connection-record-encryption/v1", sl = "bitlogin/connection-vault-personal/v1", Fn = "bitlogin:connection:";
function il(e) {
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return cr(Lo(nl), e);
}
function ze(e) {
  return xi(e, rl).scalar;
}
function Ts(e) {
  const t = ze(e);
  try {
    return P(t);
  } finally {
    S(t);
  }
}
function al(e, t) {
  if (t.length !== 32)
    throw new Error("vault_sudo_key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return cr(Lo(sl), ir(e, t));
}
function Ms(e, t) {
  const o = hn(t);
  return _t(e, ir(G(ol), new Uint8Array([0]), o), 32);
}
function cl() {
  return I($(16));
}
function hn(e) {
  const t = U(e);
  if (t.length !== 16)
    throw new Error("connection_id must decode to exactly 16 bytes (§CV7).");
  return t;
}
function Os(e) {
  return hn(e), `${Fn}${e}`;
}
function Is(e) {
  if (!e.startsWith(Fn))
    return null;
  const t = e.slice(Fn.length);
  try {
    return hn(t), t;
  } catch {
    return null;
  }
}
class re {
  privateKey;
  publicKeyHex;
  destroyed = !1;
  constructor(t) {
    this.privateKey = t, this.publicKeyHex = P(t);
  }
  assertAlive() {
    if (this.destroyed)
      throw new Error("This signer has been destroyed (session locked or logged out).");
  }
  getPublicKey() {
    return this.assertAlive(), this.publicKeyHex;
  }
  signEvent(t) {
    return this.assertAlive(), B({
      pubkey: this.publicKeyHex,
      created_at: t.created_at ?? Math.floor(Date.now() / 1e3),
      kind: t.kind,
      tags: t.tags ?? [],
      content: t.content
    }, this.privateKey);
  }
  nip44Encrypt(t, o) {
    return this.assertAlive(), Ln(Re(this.privateKey, t), o);
  }
  nip44Decrypt(t, o) {
    return this.assertAlive(), lr(Re(this.privateKey, t), o);
  }
  /** Legacy relative to nip44Encrypt above, but still what a real NIP-07 extension exposes as
   * window.nostr.nip04.encrypt -- implemented for drop-in parity. */
  nip04Encrypt(t, o) {
    return this.assertAlive(), bc(this.privateKey, t, o);
  }
  nip04Decrypt(t, o) {
    return this.assertAlive(), Ec(this.privateKey, t, o);
  }
  /** Best-practical secret wipe (§11.10, §21.4): overwrites the private key buffer in place. */
  destroy() {
    S(this.privateKey), this.destroyed = !0;
  }
}
const Ds = "bitlogin.connection.v1", Ls = "bitlogin.connection.nwc.v1", co = 120, ll = /* @__PURE__ */ new Set(["active", "suspended", "deleted"]), ul = /* @__PURE__ */ new Set(["connectable", "personal"]);
class Ue extends Error {
  constructor(t) {
    super(t), this.name = "ConnectionRecordError";
  }
}
function xs(e, t) {
  return G(`bitlogin|connection-record|v1|${e}|30078|${t}`);
}
function Us(e) {
  const t = e, o = (s) => {
    throw new Ue(s);
  };
  (!t || typeof t != "object") && o("Connection record must be an object."), t.schema !== Ds && o("Unsupported connection record schema (§CV8.3)."), typeof t.connection_id != "string" && o("connection_id must be a string (§CV7)."), (typeof t.connection_type != "string" || t.connection_type.length === 0) && o("connection_type must be a non-empty string (§CV8.3)."), ul.has(t.tier) || o("tier must be connectable or personal."), ll.has(t.state) || o("state must be active, suspended, or deleted (§CV8.3)."), (typeof t.label != "string" || t.label.length > co) && o(`label must be a string of at most ${co} characters.`), (!Number.isInteger(t.created_at) || !Number.isInteger(t.updated_at)) && o("created_at and updated_at must be integers (§CV8.3).");
  const n = t.credential;
  (!n || typeof n != "object" || typeof n.schema != "string") && o("credential must be an object naming its profile schema (§CV8.3).");
  const r = t.application_binding;
  (!r || typeof r != "object" || r.origin !== null && typeof r.origin != "string" || r.app_pubkey !== null && typeof r.app_pubkey != "string") && o("application_binding must carry origin and app_pubkey (string or null)."), t.notes !== null && typeof t.notes != "string" && o("notes must be a string or null.");
}
async function Pn(e) {
  Us(e.record);
  const t = ze(e.vaultPrk), o = P(t), n = Os(e.record.connection_id), r = Ms(e.recordPrk, e.record.connection_id), s = await Pr(e.record, r, xs(o, n));
  return B({
    pubkey: o,
    created_at: mt(e.previousCreatedAt, e.now),
    kind: q,
    tags: [["d", n]],
    content: JSON.stringify(s)
  }, t);
}
async function dl(e, t, o) {
  if (!C(e))
    throw new Ue("Connection record event has an invalid id or signature.");
  const n = P(ze(t));
  if (e.pubkey !== n)
    throw new Ue("Connection record event is not signed by this vault's identity.");
  const r = ve(e, "d") ?? "", s = Is(r);
  if (s === null)
    throw new Ue("Connection record event has a malformed d tag.");
  const i = JSON.parse(e.content), a = xs(e.pubkey, r), c = [
    { prk: t, tier: "connectable" },
    ...o ? [{ prk: o, tier: "personal" }] : []
  ];
  for (const l of c) {
    let d;
    try {
      d = await Sr(i, Ms(l.prk, s), a);
    } catch {
      continue;
    }
    if (Us(d), d.connection_id !== s)
      throw new Ue("Connection record id does not match its d tag.");
    if (d.tier !== l.tier)
      throw new Ue("Connection record tier does not match the key that decrypted it.");
    return { record: d, tier: l.tier, event: e };
  }
  return null;
}
function yl(e, t) {
  return {
    ...e,
    state: "deleted",
    credential: { schema: e.credential.schema },
    notes: null,
    updated_at: t
  };
}
const Qt = /^[0-9a-f]{64}$/u;
class ae extends Error {
  constructor(t) {
    super(t), this.name = "NwcParseError";
  }
}
function lo(e) {
  const t = e.trim();
  if (!/^nostr\+walletconnect:\/\//iu.test(t))
    throw new ae("Not an NWC URI: it must start with nostr+walletconnect://");
  let o;
  try {
    o = new URL(t.replace(/^nostr\+walletconnect:\/\//iu, "http://"));
  } catch {
    throw new ae("The NWC URI is malformed.");
  }
  const n = o.hostname.toLowerCase();
  if (!Qt.test(n))
    throw new ae("The NWC URI's wallet service pubkey is not 64-char hex.");
  const r = [], s = [];
  let i = null, a = null;
  for (const [c, l] of o.searchParams.entries())
    if (c === "relay") {
      if (!Pt(l))
        throw new ae("An NWC relay must use secure WebSockets, except for an explicit loopback development endpoint.");
      r.push(l);
    } else if (c === "secret") {
      const d = l.toLowerCase();
      if (!Qt.test(d))
        throw new ae("The NWC URI's secret is not a 64-char hex client key.");
      i = d;
    } else c === "lud16" ? a = l : s.push([c, l]);
  if (r.length === 0)
    throw new ae("The NWC URI names no relay.");
  if (i === null)
    throw new ae("The NWC URI carries no secret.");
  return {
    schema: Ls,
    wallet_pubkey: n,
    relays: r,
    secret: i,
    lud16: a,
    extra_params: s
  };
}
function fl(e) {
  qs(e);
  const t = new URLSearchParams();
  for (const o of e.relays)
    t.append("relay", o);
  t.append("secret", e.secret), e.lud16 !== null && t.append("lud16", e.lud16);
  for (const [o, n] of e.extra_params)
    t.append(o, n);
  return `nostr+walletconnect://${e.wallet_pubkey}?${t.toString()}`;
}
function pl(e, t) {
  return e.wallet_pubkey === t.wallet_pubkey && e.secret === t.secret;
}
function qs(e) {
  const t = e, o = (n) => {
    throw new ae(n);
  };
  (!t || typeof t != "object") && o("NWC credential must be an object."), t.schema !== Ls && o("NWC credential has the wrong schema."), (typeof t.wallet_pubkey != "string" || !Qt.test(t.wallet_pubkey)) && o("NWC credential wallet_pubkey must be 64-char lowercase hex."), (!Array.isArray(t.relays) || t.relays.length === 0 || t.relays.some((n) => typeof n != "string")) && o("NWC credential must name at least one relay."), t.relays.some((n) => !Pt(n)) && o("NWC relays must use secure WebSockets, except for explicit loopback development endpoints."), (typeof t.secret != "string" || !Qt.test(t.secret)) && o("NWC credential secret must be 64-char lowercase hex."), t.lud16 !== null && typeof t.lud16 != "string" && o("NWC credential lud16 must be a string or null."), (!Array.isArray(t.extra_params) || t.extra_params.some((n) => !Array.isArray(n) || n.length !== 2 || typeof n[0] != "string" || typeof n[1] != "string")) && o("NWC credential extra_params must be [key, value] string pairs.");
}
const hl = "bitlogin:vault-hwm:v2:", wl = "bitlogin/vault-hwm-index/v2", Fs = "bitlogin/vault-hwm-encryption/v2", vl = /^[0-9a-f]{64}$/u;
class pe extends Error {
  constructor() {
    super("The local Connection Vault rollback marker is invalid or has been tampered with."), this.name = "RecordHighWaterMarkError";
  }
}
function Mr(e) {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return Number.isInteger(t.createdAt) && (t.createdAt ?? -1) >= 0 && typeof t.eventId == "string" && vl.test(t.eventId);
}
function $s(e, t) {
  hn(t);
  const o = _t(e, wl, 32), n = G(t);
  try {
    return `${hl}${I(To(Mo, o, n))}`;
  } finally {
    S(o, n);
  }
}
function gl(e, t) {
  return `bitlogin:vault-hwm:${Ts(e)}:${t}`;
}
async function ml(e, t, o) {
  const n = _t(e, Fs, 32), r = G(JSON.stringify(o)), s = G(t);
  try {
    const i = await Xo(n, r, s), a = {
      v: 2,
      nonce: I(i.nonce),
      ciphertext: I(i.ciphertext)
    };
    return JSON.stringify(a);
  } finally {
    S(n, r, s);
  }
}
async function bl(e, t, o) {
  const n = _t(e, Fs, 32), r = G(t);
  let s;
  try {
    const i = JSON.parse(o);
    if (i.v !== 2 || typeof i.nonce != "string" || typeof i.ciphertext != "string")
      throw new pe();
    s = await Zo(n, U(i.nonce), U(i.ciphertext), r);
    const a = JSON.parse(sr(s));
    if (!Mr(a))
      throw new pe();
    return a;
  } catch (i) {
    throw i instanceof pe ? i : new pe();
  } finally {
    S(n, r), s && S(s);
  }
}
async function Ws(e, t, o, n) {
  const r = $s(t, o);
  await e.set(r, await ml(t, r, n));
}
async function Vs(e, t, o) {
  const n = $s(t, o), r = await e.get(n);
  if (r !== void 0)
    return bl(t, n, r);
  const s = gl(t, o), i = await e.get(s);
  if (i === void 0)
    return null;
  try {
    const a = JSON.parse(i);
    if (!Mr(a))
      throw new pe();
    return await Ws(e, t, o, a), await e.delete(s), a;
  } catch (a) {
    throw a instanceof pe ? a : new pe();
  }
}
async function Bs(e, t, o, n) {
  if (!Mr(n))
    throw new pe();
  const r = await Vs(e, t, o);
  r && Dn({ created_at: n.createdAt, id: n.eventId }, { created_at: r.createdAt, id: r.eventId }) <= 0 || await Ws(e, t, o, n);
}
async function kl(e) {
  const t = ze(e.vaultPrk), o = new T(e.relayUrls, { authPrivateKey: t });
  let n;
  try {
    n = await Te(o, e.event, {
      dTag: Os(e.connectionId),
      minAcks: e.minAcknowledgements,
      // The readback bar follows the ack bar: a caller publishing to fewer
      // relays (a targeted repair, a test) has already lowered its quorum.
      minReadbacks: e.minAcknowledgements,
      timeoutMs: e.timeoutMs
    });
  } finally {
    o.closeAll(), S(t);
  }
  return n.success && await Bs(e.store, e.vaultPrk, e.connectionId, {
    createdAt: e.event.created_at,
    eventId: e.event.id
  }), n;
}
const uo = 500;
async function El(e) {
  const t = ze(e.vaultPrk), o = P(t), n = new T(e.relayUrls, { authPrivateKey: t });
  let r;
  try {
    r = await n.queryQuorum({ kinds: [q], authors: [o], limit: uo }, e.timeoutMs);
  } finally {
    n.closeAll(), S(t);
  }
  const s = r.outcomes.some((l) => l.events.length >= uo), i = /* @__PURE__ */ new Map();
  for (const l of r.outcomes.flatMap((d) => d.events)) {
    if (!C(l) || l.pubkey !== o)
      continue;
    const d = Is(ve(l, "d") ?? "");
    if (d === null)
      continue;
    const y = i.get(d);
    (!y || Dn(l, y) > 0) && i.set(d, l);
  }
  const a = /* @__PURE__ */ new Map(), c = [];
  for (const [l, d] of i) {
    const y = await Vs(e.store, e.vaultPrk, l);
    if (y !== null && Dn(d, {
      created_at: y.createdAt,
      id: y.eventId
    }) < 0) {
      c.push(l);
      continue;
    }
    a.set(l, d), await Bs(e.store, e.vaultPrk, l, {
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
class _l {
  vaultPrk;
  personalPrk = null;
  destroyed = !1;
  connectionVaultRoot;
  vaultPublicKey;
  constructor(t) {
    this.connectionVaultRoot = t.slice(), this.vaultPrk = il(this.connectionVaultRoot), this.vaultPublicKey = Ts(this.vaultPrk);
  }
  get sudoActive() {
    return this.personalPrk !== null;
  }
  /** Opens a sudo window. Consumes (wipes) the caller's sudo key copy. */
  enableSudo(t) {
    this.endSudo(), this.personalPrk = al(this.connectionVaultRoot, t), S(t);
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
      schema: Ds,
      connection_id: cl(),
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
    }, r = await Pn({
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
    }, i = await Pn({
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
    const n = o ?? Math.floor(Date.now() / 1e3), r = yl(t.record, n), s = await Pn({
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
    return this.destroyed ? Promise.reject(new Error("This vault session was destroyed; create a new one from the account's root.")) : dl(t, this.vaultPrk, this.personalPrk ?? void 0);
  }
  /** §CV11 step 3: a NIP-09 deletion request for a replaced record event,
   *  signed by the vault identity. Best-effort by contract — the encrypted
   *  tombstone is the durable part of a deletion, this is the courtesy ask. */
  buildDeletionRequest(t, o) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    return jo({
      privateKey: ze(this.vaultPrk),
      eventIdToDelete: t,
      deletedEventKind: q,
      createdAt: o ?? Math.floor(Date.now() / 1e3)
    });
  }
  publish(t) {
    return kl({ vaultPrk: this.vaultPrk, ...t });
  }
  fetchEvents(t) {
    return El({ vaultPrk: this.vaultPrk, ...t });
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
const Pl = "bitlogin", le = "kv", H = "device-keys", Sl = 2;
function Kl() {
  return new Promise((e, t) => {
    const o = indexedDB.open(Pl, Sl);
    o.onupgradeneeded = () => {
      const n = o.result;
      n.objectStoreNames.contains(le) || n.createObjectStore(le), n.objectStoreNames.contains(H) || n.createObjectStore(H);
    }, o.onsuccess = () => e(o.result), o.onerror = () => t(o.error);
  });
}
class Al {
  dbPromise = null;
  db() {
    return this.dbPromise || (this.dbPromise = Kl()), this.dbPromise;
  }
  async get(t) {
    const o = await this.db();
    return new Promise((n, r) => {
      const i = o.transaction(le, "readonly").objectStore(le).get(t);
      i.onsuccess = () => n(i.result), i.onerror = () => r(i.error);
    });
  }
  async set(t, o) {
    const n = await this.db();
    return new Promise((r, s) => {
      const i = n.transaction(le, "readwrite");
      i.objectStore(le).put(o, t), i.oncomplete = () => r(), i.onerror = () => s(i.error);
    });
  }
  async delete(t) {
    const o = await this.db();
    return new Promise((n, r) => {
      const s = o.transaction(le, "readwrite");
      s.objectStore(le).delete(t), s.oncomplete = () => n(), s.onerror = () => r(s.error);
    });
  }
  /**
   * Returns a non-extractable AES-GCM key kept by the browser's IndexedDB
   * implementation. The key is deliberately separate from the string-only KV
   * API so callers cannot accidentally serialize it as application data.
   */
  async getOrCreateDeviceKey(t) {
    const o = await this.db(), n = await new Promise((s, i) => {
      const a = o.transaction(H, "readonly").objectStore(H).get(t);
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
        const a = o.transaction(H, "readwrite");
        a.objectStore(H).add(r, t), a.oncomplete = () => s(), a.onerror = () => i(a.error);
      }), r;
    } catch {
      const s = await new Promise((i, a) => {
        const c = o.transaction(H, "readonly").objectStore(H).get(t);
        c.onsuccess = () => i(c.result), c.onerror = () => a(c.error);
      });
      if (s) return s;
      throw new Error("Unable to create the browser-bound session key.");
    }
  }
  async deleteDeviceKey(t) {
    const o = await this.db();
    return new Promise((n, r) => {
      const s = o.transaction(H, "readwrite");
      s.objectStore(H).delete(t), s.oncomplete = () => n(), s.onerror = () => r(s.error);
    });
  }
}
const Kt = "bitlogin:session:v1", Or = "bitlogin:session-device-key:v1";
function Gs(e) {
  return !!(e && typeof e == "object" && e.v === 3 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function js(e, t) {
  if (e.length !== 32) throw new Error("Not a lock key.");
  return crypto.subtle.importKey("raw", nt(e), "AES-GCM", !1, [t]);
}
async function Ut(e, t = Kt) {
  try {
    const o = await e.get(t);
    if (!o) return "none";
    const n = JSON.parse(o);
    return Gs(n) ? "locked" : Js(n) ? "open" : "none";
  } catch {
    return "none";
  }
}
function Ct(e) {
  let t = "";
  for (const o of e) t += String.fromCharCode(o);
  return btoa(t);
}
function Nt(e) {
  const t = atob(e);
  return Uint8Array.from(t, (o) => o.charCodeAt(0));
}
function nt(e) {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}
function Js(e) {
  return !!(e && typeof e == "object" && e.v === 2 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function $n(e, t, o, n = Kt) {
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
    const s = await e.getOrCreateDeviceKey(Or), i = crypto.getRandomValues(new Uint8Array(12)), a = new TextEncoder().encode(JSON.stringify(r)), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, s, a), l = {
      v: 2,
      iv: Ct(i),
      ciphertext: Ct(new Uint8Array(c))
    };
    if (!o) {
      await e.set(n, JSON.stringify(l));
      return;
    }
    const d = crypto.getRandomValues(new Uint8Array(12)), y = await crypto.subtle.encrypt({ name: "AES-GCM", iv: d }, await js(o, "encrypt"), new TextEncoder().encode(JSON.stringify(l))), f = { v: 3, iv: Ct(d), ciphertext: Ct(new Uint8Array(y)) };
    await e.set(n, JSON.stringify(f));
  } catch {
    o && await e.delete(n).catch(() => {
    });
  }
}
async function Hs(e, t, o = Kt) {
  let n;
  try {
    n = await e.get(o);
  } catch {
    return null;
  }
  if (!n) return null;
  try {
    let r = JSON.parse(n);
    if (Gs(r)) {
      if (!t) return null;
      const c = await crypto.subtle.decrypt({ name: "AES-GCM", iv: nt(Nt(r.iv)) }, await js(t, "decrypt"), nt(Nt(r.ciphertext)));
      r = JSON.parse(new TextDecoder().decode(c));
    }
    if (!Js(r) || typeof e.getOrCreateDeviceKey != "function")
      return await e.delete(o), null;
    const s = await e.getOrCreateDeviceKey(Or), i = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nt(Nt(r.iv)) },
      s,
      nt(Nt(r.ciphertext))
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
const Rl = "bitlogin:kept-session:v1:", J = (e) => Rl + e;
async function te(e, t = Kt) {
  try {
    await e.delete(t);
  } catch {
  }
}
async function yo(e) {
  try {
    await e.delete(Kt), typeof e.deleteDeviceKey == "function" && await e.deleteDeviceKey(Or);
  } catch {
  }
}
const Cl = 27300, je = {
  /** The longest address a picture may have. */
  pictureChars: 300,
  /** The most that is said about someone, in their own words. */
  aboutChars: 280,
  /** How long a pass made here lasts, in seconds. NSWP's verifier allows twelve hours; this gives four. */
  passSec: 4 * 3600,
  /** A profile's content is not read past this many characters. */
  contentChars: 2e4
};
function Nl(e) {
  if (typeof e != "string" || e.length > je.pictureChars) return "";
  try {
    const t = new URL(e);
    return t.protocol !== "https:" || t.username || t.password || !t.hostname.includes(".") ? "" : t.href.length <= je.pictureChars ? t.href : "";
  } catch {
    return "";
  }
}
const Tl = (e) => e <= 31 || e >= 127 && e <= 159 || e >= 8203 && e <= 8207 || e >= 8232 && e <= 8239 || e >= 8288 && e <= 8303 || e === 65279;
function Ml(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const o of e.slice(0, je.aboutChars * 8).normalize("NFC")) t += Tl(o.codePointAt(0)) ? " " : o;
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, je.aboutChars).join("").trim();
}
function ge(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, o = wt(t.name), n = Nl(t.picture), r = Ml(t.about);
  return !o && !n && !r ? null : { ...o ? { name: o } : {}, ...n ? { picture: n } : {}, ...r ? { about: r } : {} };
}
function Ol(e, t) {
  if (!C(e) || e.kind !== 0 || e.pubkey !== t || e.content.length > je.contentChars) return null;
  let o;
  try {
    o = JSON.parse(e.content);
  } catch {
    return null;
  }
  if (!o || typeof o != "object" || Array.isArray(o)) return null;
  const n = o;
  return ge({ name: wt(n.display_name) || wt(n.displayName) || n.name, picture: n.picture, about: n.about });
}
function fo(e, t) {
  let o = null;
  for (const n of e)
    !C(n) || n.kind !== 0 || n.pubkey !== t || o && n.created_at <= o.at || (o = { at: n.created_at, profile: Ol(n, t) });
  return o?.profile ?? null;
}
const Il = /^[0-9a-f]{64}$/u;
function Dl(e) {
  const t = Bt(e.site);
  if (!t || typeof e.session != "string" || !Il.test(e.session) || e.session === e.identity) return null;
  const o = Math.floor(e.nowSeconds), n = ge(e.profile) ?? {}, r = [
    ["nswp:session", e.session],
    ["nswp:origin", t],
    ...e.guest ? [["nswp:guest", "1"]] : [],
    ["expiration", String(o + je.passSec)]
  ];
  return n.name && r.push(["name", n.name]), n.picture && r.push(["picture", n.picture]), n.about && r.push(["about", n.about]), { kind: Cl, created_at: o, tags: r, content: "" };
}
const Wn = "bitlogin:kept-accounts:v1", Yt = {
  /** No more accounts than this are kept on one device. The one least lately used goes first. */
  accounts: 8
}, Ll = /^[0-9a-f]{64}$/u;
function Ir(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (typeof t.pubkey != "string" || !Ll.test(t.pubkey)) return null;
  const o = ge({ name: t.name, picture: t.picture, about: t.about }) ?? {}, n = typeof t.at == "number" && Number.isFinite(t.at) && t.at > 0 ? Math.floor(t.at) : 0;
  let r;
  try {
    r = ot(t.pubkey);
  } catch {
    return null;
  }
  return { pubkey: t.pubkey, npub: r, ...o, at: n };
}
function xl(e) {
  if (!e) return [];
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return [];
  }
  if (!Array.isArray(t)) return [];
  const o = /* @__PURE__ */ new Set(), n = [];
  for (const r of t.slice(0, Yt.accounts * 2)) {
    const s = Ir(r);
    !s || o.has(s.pubkey) || (o.add(s.pubkey), n.push(s));
  }
  return n.sort((r, s) => s.at - r.at).slice(0, Yt.accounts);
}
function Ul(e, t, o, n = {}) {
  const r = e.find((a) => a.pubkey === t), s = Ir({
    pubkey: t,
    at: o,
    name: wt(n.name) || r?.name,
    picture: n.picture ?? r?.picture,
    about: n.about ?? r?.about
  });
  if (!s) return { list: [...e], dropped: [] };
  const i = [s, ...e.filter((a) => a.pubkey !== t)];
  return { list: i.slice(0, Yt.accounts), dropped: i.slice(Yt.accounts).map((a) => a.pubkey) };
}
function ql(e, t, o) {
  return e.map((n) => n.pubkey === t ? Ir({ ...n, name: wt(o.name) || n.name, picture: o.picture ?? n.picture, about: o.about ?? n.about }) ?? n : n);
}
const qt = (e, t) => e.filter((o) => o.pubkey !== t);
async function z(e) {
  try {
    return xl(await e.get(Wn));
  } catch {
    return [];
  }
}
async function Ae(e, t) {
  try {
    t.length === 0 ? await e.delete(Wn) : await e.set(Wn, JSON.stringify(t));
  } catch {
  }
}
const Dr = "bitlogin:lock:v1", Fl = "bitlogin/lock/device/v1", $l = G("bitlogin:lock:device-wrap:v1"), Y = {
  pinMin: 6,
  pinMax: 64,
  /** Wrong tries, with the PIN or the device, before the record is removed. */
  tries: 5,
  /** Unused for this long, an unlocked session locks itself. In seconds. */
  idleSec: 900
}, Fe = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
};
function zs(e) {
  if (typeof e != "string") return null;
  const t = e.normalize("NFKC"), o = [...t].length;
  return o >= Y.pinMin && o <= Y.pinMax ? G(t) : null;
}
async function Qs(e, t) {
  const o = $(12), n = await crypto.subtle.importKey("raw", Fe(e), "AES-GCM", !1, ["encrypt"]), r = await crypto.subtle.encrypt({ name: "AES-GCM", iv: Fe(o) }, n, Fe(t));
  return { iv: I(o), wrapped: I(new Uint8Array(r)) };
}
async function Ys(e, t) {
  try {
    const o = await crypto.subtle.importKey("raw", Fe(e), "AES-GCM", !1, ["decrypt"]), n = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: Fe(U(t.iv)) }, o, Fe(U(t.wrapped))));
    return n.length === 32 ? n : null;
  } catch {
    return null;
  }
}
const Xs = (e) => _t(cr($l, e), Fl, 32), po = (e) => !!e && typeof e == "object" && typeof e.iv == "string" && typeof e.wrapped == "string";
async function me(e) {
  let t;
  try {
    t = await e.get(Dr);
  } catch {
    return null;
  }
  if (!t) return null;
  try {
    const o = JSON.parse(t);
    return o.v !== 1 || typeof o.tries != "number" || !Number.isInteger(o.tries) || o.tries < 0 || !po(o.pin) || typeof o.pin.salt != "string" || o.device !== void 0 && (!po(o.device) || typeof o.device.credentialId != "string") ? null : { v: 1, tries: o.tries, pin: o.pin, ...o.device ? { device: o.device } : {} };
  } catch {
    return null;
  }
}
const kt = (e, t) => e.set(Dr, JSON.stringify(t));
async function lt(e) {
  try {
    await e.delete(Dr);
  } catch {
  }
}
async function Wl(e, t, o) {
  const n = zs(t);
  if (!n) throw new Error(`A PIN is ${Y.pinMin} to ${Y.pinMax} characters.`);
  const r = o ? o.slice() : $(32), s = $(16), i = await No(n, s);
  try {
    const a = o ? await me(e) : null;
    await kt(e, { v: 1, tries: 0, pin: { salt: I(s), ...await Qs(i, r) }, ...a?.device ? { device: a.device } : {} });
  } finally {
    i.fill(0), n.fill(0);
  }
  return r;
}
async function Vl(e, t, o, n) {
  const r = await me(e);
  if (!r) throw new Error("The lock is not on.");
  if (n.length !== 32 || !/^[A-Za-z0-9_-]{8,1400}$/u.test(o)) throw new Error("That is not a device unlock.");
  const s = Xs(n);
  try {
    await kt(e, { ...r, device: { credentialId: o, ...await Qs(s, t) } });
  } finally {
    s.fill(0);
  }
}
async function Bl(e) {
  const t = await me(e);
  t?.device && await kt(e, { v: 1, tries: t.tries, pin: t.pin });
}
async function Zs(e, t) {
  const o = await me(e);
  if (!o) return { ok: !1, left: 0, removed: !0 };
  const n = o.tries + 1;
  await kt(e, { ...o, tries: n });
  const r = await t(o);
  return r ? (await kt(e, { ...o, tries: 0 }), { ok: !0, lockKey: r }) : n >= Y.tries ? (await lt(e), { ok: !1, left: 0, removed: !0 }) : { ok: !1, left: Y.tries - n, removed: !1 };
}
function Gl(e, t) {
  return Zs(e, async (o) => {
    const n = zs(t);
    if (!n) return null;
    const r = await No(n, U(o.pin.salt));
    try {
      return await Ys(r, o.pin);
    } finally {
      r.fill(0), n.fill(0);
    }
  });
}
function jl(e, t) {
  return Zs(e, async (o) => {
    if (!o.device || t.length !== 32) return null;
    const n = Xs(t);
    try {
      return await Ys(n, o.device);
    } finally {
      n.fill(0);
    }
  });
}
const ut = "bitlogin:signer-grant:v1:", ei = "bitlogin:signer-grant-device-key:v1", he = {
  /** The longest a site BitLogin knows is remembered, in seconds: thirty days from Allow. */
  keepSec: 720 * 3600,
  /** The longest for a site it does not know: seven days. */
  unknownKeepSec: 168 * 3600,
  /** How many recent room passes are remembered, to count them across page loads. */
  passKept: 10,
  /** How many recent signatures are remembered, to count them across page loads. */
  signedKept: 60
}, Sn = (e) => e.at ?? e.until - Xt(e.site), Xt = (e) => (D(e) ? vt(e) : qi(e) !== null) ? he.keepSec : he.unknownKeepSec, Jl = /^[0-9a-f]{64}$/u;
function Me(e) {
  if (typeof e != "string" || e.length > 300 || e.includes("*")) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin === e ? t.origin : "";
  } catch {
    return "";
  }
}
const Lr = (e) => D(e) || Me(e), ho = (e) => btoa(Array.from(e, (t) => String.fromCharCode(t)).join("")), wo = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), vo = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}, Hl = (e) => Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
async function Tt(e, t, o) {
  const n = Lr(t.site);
  if (!n || t.everydayPrivateKey.length !== 32 || typeof e.getOrCreateDeviceKey != "function" || D(n) && t.permissions) return !1;
  const r = Math.min(Math.floor(t.until), Math.floor(o) + Xt(n));
  if (!(r > o)) return !1;
  const s = crypto.getRandomValues(new Uint8Array(12));
  try {
    const i = await e.getOrCreateDeviceKey(ei), a = JSON.stringify({
      site: n,
      key: Hl(t.everydayPrivateKey),
      until: r,
      ...t.name ? { name: t.name.slice(0, 48) } : {},
      ...ge(t.profile) ? { profile: ge(t.profile) } : {},
      // An application's public signatures are counted up to its own hourly limit, so more of them are kept.
      signed: t.signed.filter((d) => Number.isFinite(d)).slice(-(t.permissions ? Gt.public.hourly : he.signedKept)),
      ...t.permissions ? { permissions: t.permissions } : {},
      ...!t.permissions && !D(n) && ie(t.more).length ? { more: ie(t.more) } : {},
      ...typeof t.at == "number" ? { at: Math.floor(t.at) } : {},
      ...!D(n) && D(t.memberOf) ? { memberOf: D(t.memberOf) } : {},
      ...se(t.relays).length ? { relays: se(t.relays) } : {},
      ...typeof t.checkedAt == "number" ? { checkedAt: Math.floor(t.checkedAt) } : {},
      ...typeof t.seenAt == "number" ? { seenAt: Math.floor(t.seenAt) } : {},
      ...t.signedPass?.length ? { signedPass: t.signedPass.filter((d) => Number.isFinite(d)).slice(-he.passKept) } : {},
      ...t.permissions && t.signedSensitive ? { signedSensitive: t.signedSensitive.filter((d) => Number.isFinite(d)).slice(-Gt.sensitive.hourly) } : {}
    }), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: s }, i, new TextEncoder().encode(a)), l = { v: 1, iv: ho(s), ciphertext: ho(new Uint8Array(c)) };
    return await e.set(ut + n, JSON.stringify(l)), !0;
  } catch {
    return !1;
  }
}
async function Mt(e, t, o) {
  const n = Lr(t);
  if (!n || typeof e.getOrCreateDeviceKey != "function") return null;
  try {
    const r = await e.get(ut + n);
    if (!r) return null;
    const s = JSON.parse(r);
    if (s.v !== 1 || typeof s.iv != "string" || typeof s.ciphertext != "string") return null;
    const i = await e.getOrCreateDeviceKey(ei), a = await crypto.subtle.decrypt({ name: "AES-GCM", iv: vo(wo(s.iv)) }, i, vo(wo(s.ciphertext))), c = JSON.parse(new TextDecoder().decode(a)), l = (p) => typeof p == "number" && Number.isFinite(p) && p > 0 ? Math.floor(p) : void 0, d = ge(c.profile), y = c.permissions === void 0 ? void 0 : dr(c.permissions);
    if (y === null || y && (D(n) || !yr(n, y)))
      return await e.delete(ut + n), null;
    const f = (p, g) => Array.isArray(p) ? p.filter((v) => typeof v == "number" && Number.isFinite(v)).slice(-g) : [];
    return c.site !== n || typeof c.key != "string" || !Jl.test(c.key) || typeof c.until != "number" ? null : !(c.until > o) || c.until > o + he.keepSec ? (await e.delete(ut + n), null) : {
      site: n,
      everydayPrivateKey: Uint8Array.from(c.key.match(/.{2}/gu) ?? [], (p) => Number.parseInt(p, 16)),
      until: c.until,
      ...typeof c.name == "string" && c.name ? { name: c.name.slice(0, 48) } : {},
      ...d ? { profile: d } : {},
      signed: f(c.signed, y ? Gt.public.hourly : he.signedKept),
      ...f(c.signedPass, he.passKept).length ? { signedPass: f(c.signedPass, he.passKept) } : {},
      ...!y && !D(n) && ie(c.more).length ? { more: ie(c.more) } : {},
      ...l(c.at) ? { at: l(c.at) } : {},
      ...!D(n) && D(c.memberOf) ? { memberOf: D(c.memberOf) } : {},
      ...se(c.relays).length ? { relays: se(c.relays) } : {},
      ...l(c.checkedAt) ? { checkedAt: l(c.checkedAt) } : {},
      ...l(c.seenAt) ? { seenAt: l(c.seenAt) } : {},
      ...y ? { permissions: y, signedSensitive: f(c.signedSensitive, Gt.sensitive.hourly) } : {}
    };
  } catch {
    return null;
  }
}
function zl(e) {
  return e.app && e.family ? [{ site: e.site, permissions: e.app.permissions, memberOf: e.family }, { site: e.family }] : e.family ? [{ site: e.family }] : e.app ? [{ site: e.site, permissions: e.app.permissions }] : [{ site: e.site, ...e.more.length ? { more: ie(e.more) } : {} }];
}
async function Ot(e, t) {
  const o = Lr(t);
  if (o)
    try {
      await e.delete(ut + o);
    } catch {
    }
}
const ti = "bitlogin:signer-handoff:v1", Ql = /* @__PURE__ */ new Set([
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
]), Vn = /^[0-9a-f]{64}$/;
function Yl(e) {
  return Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
}
function Xl(e) {
  return Uint8Array.from(e.match(/.{2}/g) ?? [], (t) => Number.parseInt(t, 16));
}
function Zl(e, t, o, n, r = {}) {
  if (!Vn.test(t)) throw new Error("The hand-off has no usable recipient key.");
  if (e.length !== 32) throw new Error("No identity is unlocked in this session.");
  let s = null;
  if (n !== void 0) {
    const f = Me(n.site), p = dr(n.permissions);
    if (!f || !p || !yr(f, p)) throw new Error("That is not a permission set an application may be given.");
    s = { site: f, permissions: p };
  }
  const i = r.site === void 0 ? "" : Me(r.site);
  if (r.site !== void 0 && (!i || s && s.site !== i)) throw new Error("The hand-off names no usable site.");
  const a = ge(r.profile), c = !!i && r.visitOnly !== !0 && r.remember === !0, l = r.family === void 0 ? "" : D(r.family);
  if (r.family !== void 0 && (!l || s && !vt(l) || !c || !Pe(i, l))) throw new Error("That is not a family this site may be allowed as.");
  const d = ie(r.more);
  if (r.more !== void 0 && (d.length === 0 || !i || s || l)) throw new Error("That is not something this site may be let do.");
  const y = new re(o.slice());
  try {
    const f = JSON.stringify({ v: 1, purpose: ti, key: Yl(e), ...s ? { app: s } : {}, ...i ? { site: i } : {}, ...a ? { profile: a } : {}, ...c ? { remember: !0 } : {}, ...typeof r.at == "number" && Number.isFinite(r.at) ? { at: Math.floor(r.at) } : {}, ...se(r.relays).length ? { relays: se(r.relays) } : {}, ...l ? { family: l } : {}, ...d.length ? { more: d } : {} });
    return { senderPublicKey: y.getPublicKey(), payload: y.nip44Encrypt(t, f) };
  } finally {
    y.destroy();
  }
}
function eu(e, t) {
  if (!e || !Vn.test(e.senderPublicKey) || typeof e.payload != "string")
    throw new Error("That is not a signer hand-off.");
  const o = new re(t.slice());
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
  if (r.v !== 1 || r.purpose !== ti || typeof r.key != "string" || !Vn.test(r.key))
    throw new Error("That is not a signer hand-off.");
  const s = Xl(r.key);
  try {
    P(s);
  } catch {
    throw s.fill(0), new Error("The hand-off carried an unusable key.");
  }
  const i = r.site === void 0 ? null : Me(r.site);
  if (i === "")
    throw s.fill(0), new Error("The hand-off names no usable site.");
  const a = ge(r.profile), c = r.remember === !0 && !!i, l = typeof r.at == "number" && Number.isFinite(r.at) && r.at > 0 ? Math.floor(r.at) : null, d = se(r.relays), y = r.family === void 0 ? null : D(r.family);
  if (y === "" || y && (r.app !== void 0 && !vt(y) || !c || !Pe(i, y)))
    throw s.fill(0), new Error("The hand-off names a family it cannot be kept for.");
  const f = ie(r.more);
  if (r.more !== void 0 && (f.length === 0 || !i || y || r.app !== void 0))
    throw s.fill(0), new Error("The hand-off carries something this site may not be let do.");
  if (r.app === void 0) return { key: s, app: null, site: i, profile: a, remember: c, at: l, relays: d, family: y, more: f };
  const p = r.app, g = p && typeof p == "object" ? Me(p.site) : "", v = p && typeof p == "object" ? dr(p.permissions) : null;
  if (!g || !v || !yr(g, v) || i && i !== g)
    throw s.fill(0), new Error("The hand-off carried a permission set that cannot be read.");
  return { key: s, app: { site: g, permissions: v }, site: g, profile: a, remember: c, at: l, relays: d, family: y, more: [] };
}
const ni = 38e3, ri = "38172", tu = ["https://testnut.cashu.space", "https://nofees.testnut.cashu.space"], nu = 8;
function ru(e, t, o = 10) {
  const n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  for (const s of e)
    if (!(s.kind !== ni || !s.tags.some((i) => i[0] === "k" && i[1] === ri)))
      for (const i of s.tags) {
        if (i[0] !== "u" || i[2] !== void 0 && i[2] !== "cashu") continue;
        const a = gt(i[1]);
        if (!a || !a.startsWith("https://") || tu.includes(a)) continue;
        const c = r.get(s.pubkey) ?? /* @__PURE__ */ new Set();
        !c.has(a) && c.size >= nu || (c.add(a), r.set(s.pubkey, c), (n.get(a) ?? n.set(a, /* @__PURE__ */ new Set()).get(a)).add(s.pubkey));
      }
  return [...n].map(([s, i]) => ({ mint: s, by: i.size, byFollowed: [...i].filter((a) => t.has(a)).length })).filter((s) => s.by >= 2 || s.byFollowed >= 1).sort((s, i) => i.byFollowed - s.byFollowed || i.by - s.by || s.mint.localeCompare(i.mint)).slice(0, o);
}
const Bn = 30078, Gn = "bitlogin-receipt:", Zt = 300, en = "bitlogin:receipts:v1:";
function xr(e, t) {
  const o = e, n = o?.event;
  if (!n || typeof n != "object" || n.kind !== 30078 || typeof n.content != "string" || n.content.length > 8e3 || !Array.isArray(n.tags) || !C(n)) return null;
  try {
    if (JSON.parse(n.content).buyerPubkey !== t) return null;
  } catch {
    return null;
  }
  return {
    event: { id: n.id, pubkey: n.pubkey, created_at: n.created_at, kind: n.kind, tags: n.tags.map((r) => r.map(String)), content: n.content, sig: n.sig },
    title: typeof o?.title == "string" ? o.title.slice(0, 80) : "",
    via: Bt(o?.via) || ""
  };
}
async function Ur(e, t) {
  const o = t.getPublicKey(), n = /* @__PURE__ */ new Map(), r = async (i) => {
    try {
      const a = await e.get(i);
      return a ? JSON.parse(t.nip44Decrypt(o, a)) : null;
    } catch {
      return null;
    }
  }, s = await r(en + o);
  for (const i of Array.isArray(s?.ids) ? s.ids.slice(0, Zt) : []) {
    if (typeof i != "string") continue;
    const a = await r(`${en}${o}:${i}`), c = xr(a, o);
    c && c.event.id === i && n.set(i, { ...c, saved: a?.saved === !0 });
  }
  return n;
}
async function qr(e, t, o, n) {
  const r = t.getPublicKey(), s = (i) => t.nip44Encrypt(r, JSON.stringify(i));
  for (const i of n) {
    const a = o.get(i);
    a && await e.set(`${en}${r}:${i}`, s(a));
  }
  await e.set(en + r, s({ ids: [...o.keys()] }));
}
const tn = (e, t) => ({
  receipts: [...e.values()].map(({ event: o, title: n, via: r }) => ({ event: o, title: n, via: r })).sort((o, n) => n.event.created_at - o.event.created_at),
  offline: t,
  unsaved: [...e.values()].some((o) => !o.saved)
});
async function oi(e, t) {
  const { signer: o, store: n, relays: r } = e, s = o.getPublicKey(), i = Math.floor(e.now ?? Date.now() / 1e3), a = [];
  for (const [c, l] of t) {
    if (l.saved) continue;
    const d = o.signEvent({ kind: Bn, created_at: i, tags: [["d", Gn + c]], content: o.nip44Encrypt(s, JSON.stringify({ v: 1, event: l.event, title: l.title, via: l.via })) });
    V(await r.publishAll(d, 6e3).catch(() => [])) >= Math.min(2, r.relayUrls.length) && (l.saved = !0, a.push(c));
  }
  a.length && await qr(n, o, t, a);
}
async function ou(e) {
  return tn(await Ur(e.store, e.signer), !0);
}
async function su(e) {
  const { signer: t, store: o, relays: n } = e, r = t.getPublicKey(), s = await Ur(o, t), i = await n.queryQuorum({ kinds: [Bn], authors: [r], limit: 500 }, 6e3).catch(() => null);
  if (!i || i.respondedCount === 0) return tn(s, !0);
  const a = /* @__PURE__ */ new Set(), c = [];
  for (const l of i.outcomes.flatMap((d) => d.events)) {
    if (l.kind !== Bn || l.pubkey !== r || !C(l)) continue;
    const d = l.tags.find((f) => f[0] === "d")?.[1];
    if (typeof d != "string" || !d.startsWith(Gn)) continue;
    let y;
    try {
      y = xr(JSON.parse(t.nip44Decrypt(r, l.content)), r);
    } catch {
      continue;
    }
    !y || y.event.id !== d.slice(Gn.length) || (a.add(y.event.id), !(s.has(y.event.id) || s.size >= Zt) && (s.set(y.event.id, { ...y, saved: !0 }), c.push(y.event.id)));
  }
  for (const [l, d] of s)
    a.has(l) !== d.saved && (d.saved = a.has(l), c.push(l));
  return await qr(o, t, s, c), await oi(e, s), tn(s, !1);
}
async function iu(e, t) {
  const { signer: o, store: n } = e, r = o.getPublicKey(), s = Array.isArray(t) ? t.slice(0, Zt).map((c) => xr(c, r)) : [];
  if (s.length === 0 || s.some((c) => !c)) throw new Error("That is not a receipt of this account's.");
  const i = await Ur(n, o), a = [];
  for (const c of s)
    if (!i.has(c.event.id)) {
      if (i.size >= Zt) throw new Error("This account keeps as many receipts as it can.");
      i.set(c.event.id, { ...c, saved: !1 }), a.push(c.event.id);
    }
  return await qr(n, o, i, a), await oi(e, i).catch(() => {
  }), tn(i, !1);
}
function si(e) {
  const t = e;
  if (!t || typeof t != "object") return null;
  const o = Fo(t.listing);
  if (!o || typeof t.order != "string" || !/^order_[A-Za-z0-9_-]{12,80}$/u.test(t.order) || typeof t.key != "string" || !/^[A-Za-z0-9_-]{16,128}$/u.test(t.key)) return null;
  const n = Bt(t.service);
  return n ? { listing: o, order: t.order, key: t.key, service: n, title: typeof t.title == "string" ? t.title.slice(0, 80) : "", via: Bt(t.via) || "", client: typeof t.client == "string" && /^[0-9a-f]{64}$/u.test(t.client) ? t.client : "", at: typeof t.at == "number" && Number.isFinite(t.at) ? t.at : 0 } : null;
}
const ii = (e) => Array.isArray(e) ? e.map(si).filter((t) => !!t).slice(-20) : [], jn = 30078, Jn = "bitlogin-pay-settings", ai = "bitlogin:pay-settings:v1:";
async function ci({ signer: e, store: t }) {
  const o = e.getPublicKey();
  try {
    const n = await t.get(ai + o), r = n ? JSON.parse(e.nip44Decrypt(o, n)) : null;
    return r && typeof r.at == "number" ? { limitSats: fr(r.limitSats), orders: ii(r.orders), at: r.at, saved: r.saved === !0 } : null;
  } catch {
    return null;
  }
}
const nn = ({ signer: e, store: t }, o) => t.set(ai + e.getPublicKey(), e.nip44Encrypt(e.getPublicKey(), JSON.stringify(o)));
async function li(e, t) {
  const { signer: o, relays: n } = e, r = o.getPublicKey(), s = o.signEvent({ kind: jn, created_at: Math.floor(t.at), tags: [["d", Jn]], content: o.nip44Encrypt(r, JSON.stringify({ v: 1, limitSats: t.limitSats, orders: t.orders, at: t.at })) });
  return V(await n.publishAll(s, 5e3).catch(() => [])) >= Math.min(2, n.relayUrls.length);
}
async function au(e) {
  const { signer: t, relays: o } = e, n = t.getPublicKey();
  let r = await ci(e);
  const s = await o.queryQuorum({ kinds: [jn], authors: [n], "#d": [Jn], limit: 2 }, 3e3).catch(() => null);
  if (s && s.respondedCount > 0) {
    const i = s.outcomes.flatMap((c) => c.events).filter((c) => c.kind === jn && c.pubkey === n && c.tags.some((l) => l[0] === "d" && l[1] === Jn) && C(c)).sort((c, l) => l.created_at - c.created_at)[0];
    let a = null;
    try {
      const c = i ? JSON.parse(t.nip44Decrypt(n, i.content)) : null;
      c && (a = { limitSats: fr(c.limitSats), orders: ii(c.orders), at: typeof c.at == "number" ? c.at : i.created_at, saved: !0 });
    } catch {
      a = null;
    }
    a && (!r || a.at > r.at) ? (r = a, await nn(e, r)) : r && (!r.saved || !a) && (r.saved = await li(e, r), await nn(e, r));
  }
  return { limitSats: r?.limitSats ?? qo.default, orders: r?.orders ?? [], unsaved: !!r && !r.saved };
}
async function cu(e, t) {
  const o = t ?? {}, n = await ci(e), r = { limitSats: n?.limitSats ?? qo.default, orders: n?.orders ?? [], at: e.now ?? Date.now() / 1e3, saved: !1 };
  if (o.limitSats !== void 0) {
    if (fr(o.limitSats) !== o.limitSats) throw new Error("That is not a limit this wallet keeps.");
    r.limitSats = o.limitSats;
  } else if (o.addOrder !== void 0) {
    const s = si({ ...o.addOrder, at: r.at });
    if (!s) throw new Error("That is not an order this wallet can keep.");
    r.orders = [...r.orders.filter((i) => !(i.listing === s.listing && i.service === s.service)), s].slice(-20);
  } else if (typeof o.removeOrder == "string")
    r.orders = r.orders.filter((s) => s.order !== o.removeOrder);
  else throw new Error("That is not a change this wallet keeps.");
  return await nn(e, r), r.saved = await li(e, r).catch(() => !1), r.saved && await nn(e, r), { limitSats: r.limitSats, orders: r.orders, unsaved: !r.saved };
}
const lu = { enough: 2, graceMs: 700 };
function uu(e, t, o = lu) {
  const n = e.map((s) => t(s)), r = (s, i) => new Promise((a) => {
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
const Hn = 30078, zn = "bitlogin-drive:", rt = 10063, du = 24242, dt = "bitlogin:drive:v1:", yu = { autoPaySats: 0, at: 0, saved: !0 }, Fr = (e) => {
  const t = e?.autoPaySats;
  return { autoPaySats: typeof t == "number" && Number.isSafeInteger(t) && t >= 0 && t <= 1e5 ? t : 0 };
};
async function $r(e, t) {
  const o = t.getPublicKey(), n = { folders: /* @__PURE__ */ new Map(), removed: /* @__PURE__ */ new Map(), settings: { ...yu } }, r = async (a) => {
    try {
      const c = await e.get(a);
      return c ? JSON.parse(t.nip44Decrypt(o, c)) : null;
    } catch {
      return null;
    }
  }, s = await r(dt + o);
  if (!s) return n;
  for (const a of Array.isArray(s.folders) ? s.folders.slice(0, hr.folders + 1) : []) {
    if (typeof a != "string") continue;
    const c = await r(`${dt}${o}:${a}`), l = pr(c?.folder);
    l && n.folders.set(l.id, { folder: l, saved: c?.saved === !0 });
  }
  for (const a of Array.isArray(s.removed) ? s.removed : [])
    Array.isArray(a) && typeof a[0] == "string" && typeof a[1] == "number" && n.removed.set(a[0], a[1]);
  const i = s.settings;
  return n.settings = { ...Fr(i), at: typeof i?.at == "number" ? i.at : 0, saved: i?.saved !== !1 }, n;
}
async function Wr(e, t, o, n, r = []) {
  const s = t.getPublicKey(), i = (a) => t.nip44Encrypt(s, JSON.stringify(a));
  for (const a of n) {
    const c = o.folders.get(a);
    c && await e.set(`${dt}${s}:${a}`, i(c));
  }
  for (const a of r) await e.delete(`${dt}${s}:${a}`).catch(() => {
  });
  await e.set(dt + s, i({ folders: [...o.folders.keys()], removed: [...o.removed], settings: o.settings }));
}
const Kn = (e, t) => V(e) >= Math.min(2, t);
function An(e, t, o, n) {
  const r = e.getPublicKey();
  return e.signEvent({ kind: Hn, created_at: Math.floor(n), tags: [["d", zn + t]], content: e.nip44Encrypt(r, JSON.stringify(o)) });
}
const rn = (e, t) => ({
  folders: [...e.folders.values()].map((o) => o.folder),
  settings: { autoPaySats: e.settings.autoPaySats },
  offline: t,
  unsaved: [...e.folders.values()].some((o) => !o.saved) || e.removed.size > 0 || !e.settings.saved
});
async function ui(e, t) {
  const { signer: o, store: n, relays: r } = e, s = e.now ?? Date.now() / 1e3, i = [];
  for (const [a, c] of t.folders)
    c.saved || !Kn(await r.publishAll(An(o, a, { v: 1, folder: c.folder }, Math.max(s, c.folder.at)), 6e3).catch(() => []), r.relayUrls.length) || (c.saved = !0, i.push(a));
  for (const [a, c] of [...t.removed])
    Kn(await r.publishAll(An(o, a, { v: 1, deleted: !0, at: c }, Math.max(s, c)), 6e3).catch(() => []), r.relayUrls.length) && t.removed.delete(a);
  t.settings.saved || Kn(await r.publishAll(An(o, "settings", { v: 1, settings: { autoPaySats: t.settings.autoPaySats }, at: t.settings.at }, Math.max(s, t.settings.at)), 6e3).catch(() => []), r.relayUrls.length) && (t.settings.saved = !0), await Wr(n, o, t, i);
}
async function fu(e) {
  return rn(await $r(e.store, e.signer), !0);
}
async function pu(e) {
  const { signer: t, store: o, relays: n } = e, r = t.getPublicKey(), s = await $r(o, t), i = await n.queryQuorum({ kinds: [Hn], authors: [r], limit: 500 }, 6e3).catch(() => null);
  if (!i || i.respondedCount === 0) return rn(s, !0);
  const a = /* @__PURE__ */ new Map();
  for (const d of i.outcomes.flatMap((y) => y.events)) {
    if (d.kind !== Hn || d.pubkey !== r || !C(d)) continue;
    const y = d.tags.find((p) => p[0] === "d")?.[1];
    if (typeof y != "string" || !y.startsWith(zn)) continue;
    const f = y.slice(zn.length);
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
      const v = typeof f.at == "number" ? f.at : y.created_at;
      (s.settings.saved || v > s.settings.at) && (s.settings = { ...Fr(f.settings), at: v, saved: !0 });
      continue;
    }
    const p = s.folders.get(d);
    if (f.deleted === !0) {
      const v = typeof f.at == "number" ? f.at : y.created_at;
      p && (p.saved || p.folder.at <= v) && (s.folders.delete(d), l.push(d)), s.removed.delete(d);
      continue;
    }
    const g = pr(f.folder);
    !g || g.id !== d || s.removed.has(d) || p && !p.saved && p.folder.at >= g.at || p && p.saved && p.folder.at >= g.at || (s.folders.set(d, { folder: g, saved: !0 }), c.push(d));
  }
  for (const [d, y] of s.folders) a.has(d) || (y.saved = !1);
  return await Wr(o, t, s, c, l), await ui(e, s), rn(s, !1);
}
async function hu(e, t) {
  const { signer: o, store: n } = e, r = e.now ?? Date.now() / 1e3, s = (t.save ?? []).map(pr);
  if (s.some((l) => !l)) throw new Error("That is not a folder this drive can keep.");
  const i = await $r(n, o), a = [], c = [];
  for (const l of s)
    i.folders.set(l.id, { folder: l, saved: !1 }), i.removed.delete(l.id), a.push(l.id);
  for (const l of t.remove ?? [])
    typeof l != "string" || !/^[0-9a-f]{16}$/u.test(l) || (i.folders.delete(l), i.removed.set(l, Math.floor(r)), c.push(l));
  if (i.folders.size > hr.folders + 1) throw new Error("There are too many folders.");
  return t.settings !== void 0 && (i.settings = { ...Fr(t.settings), at: Math.floor(r), saved: !1 }), await Wr(n, o, i, a, c), await ui(e, i), rn(i, !1);
}
function wu(e, t, o = Date.now() / 1e3) {
  const n = wr(t.server), r = t.verb;
  if (!n || r !== "upload" && r !== "delete" && r !== "get") throw new Error("That is not something a file server is asked.");
  const s = typeof t.sha256 == "string" && /^[0-9a-f]{64}$/u.test(t.sha256) ? t.sha256 : "";
  if (!s) throw new Error("A permission note names the one file it is for.");
  const i = e.signEvent({
    kind: du,
    // In the past, as a server requires, by a margin wider than two clocks usually differ.
    created_at: Math.floor(o) - 30,
    tags: [["t", r], ["expiration", String(Math.floor(o) + 300)], ["server", new URL(n).hostname.toLowerCase()], ["x", s]],
    content: r === "upload" ? "Upload a file" : r === "delete" ? "Delete a file" : "Fetch a file"
  }), a = new TextEncoder().encode(JSON.stringify(i));
  let c = "";
  for (const l of a) c += String.fromCharCode(l);
  return btoa(c).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}
const di = (e) => [...new Set(e.tags.filter((t) => t[0] === "server").map((t) => wr(t[1])).filter(Boolean))];
function vu(e, t, o = 12) {
  const n = /* @__PURE__ */ new Map();
  for (const s of e) s.kind === rt && (!n.has(s.pubkey) || n.get(s.pubkey).created_at < s.created_at) && n.set(s.pubkey, s);
  const r = /* @__PURE__ */ new Map();
  for (const s of n.values()) for (const i of di(s).filter((a) => a.startsWith("https://")).slice(0, 6)) (r.get(i) ?? r.set(i, /* @__PURE__ */ new Set()).get(i)).add(s.pubkey);
  return [...r].map(([s, i]) => ({ server: s, by: i.size, byFollowed: [...i].filter((a) => t.has(a)).length })).filter((s) => s.by >= 2 || s.byFollowed >= 1).sort((s, i) => i.byFollowed - s.byFollowed || i.by - s.by || s.server.localeCompare(i.server)).slice(0, o);
}
const yi = "bitlogin:ecash:v1:", on = (e) => e.startsWith("local:"), fi = () => `local:${Array.from(crypto.getRandomValues(new Uint8Array(8)), (e) => e.toString(16).padStart(2, "0")).join("")}`;
async function wn(e, t) {
  const o = t.getPublicKey();
  try {
    const n = await e.get(yi + o);
    if (!n) return { wallet: null, tokens: [] };
    const r = JSON.parse(t.nip44Decrypt(o, n)), s = typeof r.wallet == "string" ? $o(r.wallet) : null, i = [];
    for (const a of Array.isArray(r.tokens) ? r.tokens : []) {
      const c = a, l = Vo(c.proofs);
      typeof c.event == "string" && c.event.length <= 80 && gt(c.mint) && l?.length && i.push({ event: c.event, mint: gt(c.mint), proofs: l });
    }
    return { wallet: s, tokens: i };
  } catch {
    return { wallet: null, tokens: [] };
  }
}
async function sn(e, t, o) {
  const n = t.getPublicKey();
  await e.set(yi + n, t.nip44Encrypt(n, JSON.stringify({ wallet: o.wallet ? Wo(o.wallet) : null, tokens: o.tokens })));
}
const an = (e, t) => V(e) >= Math.min(2, t);
function pi(e, t, o) {
  const n = e.getPublicKey();
  return e.signEvent({ kind: ct, created_at: Math.floor(o), tags: [], content: e.nip44Encrypt(n, Vi(t)) });
}
const Je = (e, t) => ({ mints: e.wallet?.mints ?? [], tokens: e.tokens, offline: t, unsaved: e.tokens.some((o) => on(o.event)) });
async function gu(e) {
  return Je(await wn(e.store, e.signer), !0);
}
async function mu(e) {
  const { signer: t, store: o, relays: n } = e, r = t.getPublicKey(), s = await wn(o, t), [i, a, c] = await Promise.all([
    n.queryQuorum({ kinds: [xn], authors: [r], limit: 2 }, 5e3),
    n.queryQuorum({ kinds: [ct], authors: [r], limit: Se.tokens }, 6e3),
    n.queryQuorum({ kinds: [5], authors: [r], "#k": [String(ct)], limit: Se.tokens }, 6e3)
  ]).catch(() => [null, null, null]);
  if (!a || !i || !c || a.respondedCount === 0) return Je(s, !0);
  const l = (E, K) => E.filter((O) => O.kind === K && O.pubkey === r && C(O)), d = (E) => {
    try {
      return t.nip44Decrypt(r, E.content);
    } catch {
      return null;
    }
  }, y = l(i.outcomes.flatMap((E) => E.events), xn).sort((E, K) => K.created_at - E.created_at)[0], f = y && $o(d(y) ?? "") || s.wallet, p = new Set(l(c.outcomes.flatMap((E) => E.events), 5).flatMap((E) => E.tags.filter((K) => K[0] === "e" && typeof K[1] == "string").map((K) => K[1]))), g = /* @__PURE__ */ new Map();
  for (const E of l(a.outcomes.flatMap((K) => K.events), ct)) g.set(E.id, E);
  const v = [...g.values()].flatMap((E) => {
    const K = Fi(d(E) ?? "");
    return K ? [{ event: E.id, created_at: E.created_at, ...K }] : [];
  }), b = $i(v, p), w = new Set(b.flatMap((E) => E.proofs.map((K) => K.secret))), k = { wallet: f, tokens: [...b] }, m = new Set(v.flatMap((E) => E.del));
  for (const E of s.tokens.filter((K) => !on(K.event))) {
    if (g.has(E.event) || p.has(E.event) || m.has(E.event)) continue;
    const K = E.proofs.filter((O) => !w.has(O.secret));
    if (K.length !== 0) {
      for (const O of K) w.add(O.secret);
      k.tokens.push({ event: E.event, mint: E.mint, proofs: K });
    }
  }
  const _ = /* @__PURE__ */ new Map();
  for (const E of s.tokens.filter((K) => on(K.event))) {
    const K = E.proofs.filter((O) => !w.has(O.secret));
    for (const O of K) w.add(O.secret);
    K.length && _.set(E.mint, [..._.get(E.mint) ?? [], ...K]);
  }
  const L = [];
  for (const [E, K] of _) for (let O = 0; O < K.length; O += Se.proofsWritten) L.push({ mint: E, proofs: K.slice(O, O + Se.proofsWritten) });
  const F = e.now ?? Date.now() / 1e3, X = L.map((E) => pi(t, E, F)), Z = await Promise.all(X.map(async (E) => an(await n.publishAll(E, 6e3).catch(() => []), n.relayUrls.length)));
  for (const [E, K] of L.entries()) k.tokens.push({ event: Z[E] ? X[E].id : fi(), ...K });
  return await sn(o, t, k), Je(k, !1);
}
async function bu(e, t) {
  const { signer: o, store: n, relays: r } = e, s = o.getPublicKey(), i = [...new Set((Array.isArray(t) ? t : []).map(gt).filter(Boolean))];
  if (i.length === 0 || i.length > Se.mints) throw new Error("Name between one and five mints, each an https address.");
  const a = await wn(n, o), c = { privkey: a.wallet?.privkey ?? e.newKey(), mints: i }, l = { wallet: c, tokens: a.tokens };
  await sn(n, o, l);
  const d = o.signEvent({ kind: xn, created_at: Math.floor(e.now ?? Date.now() / 1e3), tags: [], content: o.nip44Encrypt(s, Wo(c)) });
  if (!an(await r.publishAll(d, 6e3).catch(() => []), r.relayUrls.length)) throw new Error("The wallet was saved in this browser, but no relay took it. Try again when you are online.");
  return Je(l, !1);
}
async function ku(e, t, o) {
  const { signer: n, store: r, relays: s } = e, i = e.now ?? Date.now() / 1e3, a = new Set(t.destroy.filter((m) => typeof m == "string" && m.length <= 80)), c = t.keep.map((m) => ({ mint: gt(m.mint), proofs: Vo(m.proofs, 5e3) }));
  if (c.some((m) => !m.mint || !m.proofs)) throw new Error("That is not ecash this wallet can keep.");
  const l = await wn(r, n), d = c.flatMap((m) => {
    const _ = [];
    for (let L = 0; L < m.proofs.length; L += Se.proofsWritten) _.push({ event: fi(), mint: m.mint, proofs: m.proofs.slice(L, L + Se.proofsWritten) });
    return _;
  }), y = { wallet: l.wallet, tokens: [...l.tokens.filter((m) => !a.has(m.event)), ...d] };
  await sn(r, n, y), o?.(Je(y, !1));
  const f = [...a].filter((m) => !on(m)), p = d.map((m, _) => pi(n, { mint: m.mint, proofs: m.proofs, ...f.length && _ === 0 ? { del: f } : {} }, i)), g = n.getPublicKey(), v = t.history && Number.isSafeInteger(t.history.amount) && t.history.amount > 0 ? n.signEvent({ kind: Gr, created_at: Math.floor(i), tags: [], content: n.nip44Encrypt(g, Wi({ ...t.history, created: p.map((m) => m.id), destroyed: f })) }) : null, [b, w] = await Promise.all([
    Promise.all(p.map(async (m) => an(await s.publishAll(m, 6e3).catch(() => []), s.relayUrls.length))),
    v ? s.publishAll(v, 6e3).then((m) => an(m, s.relayUrls.length)).catch(() => !1) : Promise.resolve(!1)
  ]);
  for (const [m, _] of d.entries()) b[m] && (_.event = p[m].id);
  await sn(r, n, y);
  const k = b.every(Boolean);
  if (v && w && !k) {
    const m = n.signEvent({ kind: 5, created_at: Math.floor(i), tags: [["e", v.id], ["k", String(Gr)]], content: "" });
    await s.publishAll(m, 6e3).catch(() => []);
  }
  if (f.length && k) {
    const m = n.signEvent({ kind: 5, created_at: Math.floor(i), tags: [...f.map((_) => ["e", _]), ["k", String(ct)]], content: "" });
    await s.publishAll(m, 6e3).catch(() => []);
  }
  return Je(y, !1);
}
const Vr = "bitlogin:signer-guest:v1:", hi = "bitlogin:signer-grant-device-key:v1", go = (e) => btoa(String.fromCharCode(...e)), mo = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), bo = (e) => e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength);
async function Eu(e) {
  const t = await pn(e);
  try {
    return dn(t);
  } finally {
    S(t);
  }
}
async function yt(e, t) {
  const o = D(t);
  if (!o || typeof e.getOrCreateDeviceKey != "function") return null;
  try {
    const n = await e.get(Vr + o);
    if (!n) return null;
    const r = JSON.parse(n);
    if (r.v !== 1 || typeof r.iv != "string" || typeof r.ciphertext != "string") return null;
    const s = await e.getOrCreateDeviceKey(hi), i = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bo(mo(r.iv)) }, s, bo(mo(r.ciphertext))), a = JSON.parse(new TextDecoder().decode(i));
    return a.family !== o || typeof a.phrase != "string" ? null : { key: await Eu(a.phrase), phrase: a.phrase };
  } catch {
    return null;
  }
}
async function _u(e, t) {
  const o = D(t);
  if (!o) throw new Error("A guest is made only for a family.");
  const n = await yt(e, o);
  if (n) return n;
  if (typeof e.getOrCreateDeviceKey != "function") throw new Error("No storage here to keep a guest in.");
  const r = ss(Io()), s = await e.getOrCreateDeviceKey(hi), i = crypto.getRandomValues(new Uint8Array(12)), a = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, s, new TextEncoder().encode(JSON.stringify({ family: o, phrase: r })));
  await e.set(Vr + o, JSON.stringify({ v: 1, iv: go(i), ciphertext: go(new Uint8Array(a)) }));
  const c = await yt(e, o);
  if (!c) throw new Error("The guest could not be kept here.");
  return c;
}
async function Pu(e, t) {
  const o = D(t);
  o && await e.delete(Vr + o);
}
const wi = "bitlogin:session-public:v1";
async function Su(e, t) {
  try {
    const o = {
      pubkey: t.pubkey,
      npub: t.npub,
      ...t.name ? { name: t.name } : {}
    };
    await e.set(wi, JSON.stringify(o));
  } catch {
  }
}
async function Xe(e) {
  try {
    await e.delete(wi);
  } catch {
  }
}
const ko = (e) => e.then(
  () => {
  },
  () => {
  }
);
class Ku {
  alone = Promise.resolve();
  lanes = /* @__PURE__ */ new Map();
  run(t, o) {
    if (t === null) {
      const i = Promise.all([this.alone, ...this.lanes.values()]).then(o, o);
      return this.alone = ko(i), this.lanes.clear(), i;
    }
    const r = Promise.all([this.alone, this.lanes.get(t) ?? Promise.resolve()]).then(o, o);
    return this.lanes.set(t, ko(r)), r;
  }
}
const Au = 3 * 6e4;
class Ru {
  constructor(t, o = Date.now, n = (r, s) => new yn(r, { connectTimeoutMs: s })) {
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
    return o === void 0 ? !1 : this.now() - o < Au ? !0 : (this.failedAt.delete(t), !1);
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
const Cu = 24 * 3600, u = {
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
  memberOf: null,
  guest: null,
  more: []
};
let be = null, R = [...Jo], x = [...Ho];
const h = new Al();
let Qn = !1, Yn = !1;
function Eo(e) {
  Qn || (R = e.vaultRelays), Yn || (x = e.discoveryRelays);
}
const Nu = 1500, Tu = new Ku(), Mu = {
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
let N = null, Rn = Date.now();
const Ou = /* @__PURE__ */ new Set(["configure", "lockStatus", "lockOpen", "restoreSession", "getSessionStatus", "logout"]), vi = "bitlogin:taken-back:v1:";
async function Iu(e) {
  try {
    const t = await h.get(vi + e);
    return (t ? Go(JSON.parse(t)) : null) ?? Un;
  } catch {
    return Un;
  }
}
function _o(e, t) {
  try {
    return Go(JSON.parse(e.nip44Decrypt(e.getPublicKey(), t)));
  } catch {
    return null;
  }
}
function Ze() {
  W(), N && S(N), N = null;
}
async function Le() {
  const e = await me(h);
  return e ? {
    on: !0,
    // Locked with nothing in the active slot too, where other accounts are kept: theirs are sealed under it.
    locked: !N && (await Ut(h) === "locked" || (await z(h)).length > 0),
    device: !!e.device,
    ...e.device ? { credentialId: e.device.credentialId } : {},
    triesLeft: Math.max(0, Y.tries - e.tries)
  } : { on: !1, locked: !1, device: !1, triesLeft: 0 };
}
function A() {
  if (!u.signer || !u.everydayPrivateKey)
    throw new Error("No identity is unlocked in this session.");
  return { signer: u.signer, everydayPrivateKey: u.everydayPrivateKey };
}
function ee() {
  const e = A();
  if (!u.signerOnly || u.app || !u.site) throw new Error("refused");
  return { ...e, site: u.site };
}
const Xn = "bitlogin:world-counts:v1:", Du = "bitlogin:follows-seen:v1:", Zn = /* @__PURE__ */ new Map();
async function ke(e, t, o, n = !0) {
  const r = `${Xn}${e}:${t}`;
  let s = Zn.get(r);
  if (!s)
    try {
      const l = n ? JSON.parse(await h.get(r) ?? "[]") : [];
      s = Array.isArray(l) ? l.filter((d) => typeof d == "number" && Number.isFinite(d)).slice(-o.hourly) : [];
    } catch {
      s = [];
    }
  const i = da(o, s), a = Date.now(), c = i.take(a);
  return Zn.set(r, i.times()), c && n && await h.set(r, JSON.stringify(i.times())).catch(() => {
  }), c;
}
function Cn() {
  if (!u.signerOnly || !u.app) throw new Error("refused");
  return u.app;
}
function W() {
  Ft.closeAll(), u.signer?.destroy(), u.everydayPrivateKey && u.everydayPrivateKey.fill(0), u.signer = null, u.everydayPrivateKey = null, u.accountId = null, u.recoveryPublicKey = null, u.activeCredentialEvent = null, u.activeRecoveryEvent = null, u.everydayKeyDerived = !1, u.vault?.destroy(), u.vault = null, u.connectionVaultRoot && u.connectionVaultRoot.fill(0), u.connectionVaultRoot = null, u.vaultKnown = !1, u.signerOnly = !1, u.app = null, u.site = null, u.profile = null, u.remember = !1, u.grantAt = null, u.relays = [], u.family = null, u.memberOf = null, u.guest = null, u.more = [], u.pendingRecovery && (u.pendingRecovery.recoveryPrivateKey.fill(0), u.pendingRecovery.everydayPrivateKey.fill(0), u.pendingRecovery = null);
}
function Po(e) {
  return W(), u.pendingRecovery = e, u.signer = new re(e.everydayPrivateKey), u.everydayPrivateKey = e.everydayPrivateKey, u.accountId = e.accountId, u.recoveryPublicKey = e.recoveryPublicKey, u.activeRecoveryEvent = e.currentRecoveryEvent, u.everydayKeyDerived = e.everydayKeyDerived, er(
    e.currentRecoveryPayload.connection_vault_root ? U(e.currentRecoveryPayload.connection_vault_root) : void 0
  ), {
    everydayPublicKey: e.everydayPublicKey,
    accountId: e.accountId,
    generalRelays: e.generalRelays,
    dmRelays: e.dmRelays,
    chainWarning: e.chainWarning,
    everydayKeyDerived: e.everydayKeyDerived
  };
}
function er(e, t) {
  u.connectionVaultRoot = e ?? null, u.vaultKnown = !0, u.vault = null, t && S(t);
}
async function Ee() {
  if (!u.everydayPrivateKey || !u.accountId || !u.recoveryPublicKey || !u.activeCredentialEvent || !u.activeRecoveryEvent)
    return;
  const e = await me(h);
  e && !N && (await lt(h), await tr());
  const t = {
    everydayPrivateKey: u.everydayPrivateKey,
    accountId: u.accountId,
    recoveryPublicKey: u.recoveryPublicKey,
    activeCredentialEvent: u.activeCredentialEvent,
    activeRecoveryEvent: u.activeRecoveryEvent,
    ...u.connectionVaultRoot ? { connectionVaultRoot: u.connectionVaultRoot } : {},
    ...u.vaultKnown ? { vaultEnabled: u.connectionVaultRoot !== null } : {},
    everydayKeyDerived: u.everydayKeyDerived
  }, o = e && N ? N : null;
  await $n(h, t, o);
  const n = P(u.everydayPrivateKey);
  await $n(h, t, o, J(n));
  const r = Ul(await z(h), n, Date.now() / 1e3);
  for (const s of r.dropped) await te(h, J(s));
  await Ae(h, r.list), await gi();
}
async function tr() {
  for (const e of await z(h)) await te(h, J(e.pubkey));
  await Ae(h, []);
}
async function So(e, t) {
  const o = u.everydayPrivateKey ? P(u.everydayPrivateKey) : "";
  let n = await z(h);
  for (const r of n) {
    if (r.pubkey === o) continue;
    const s = await Hs(h, e, J(r.pubkey));
    s ? (await $n(h, s, t, J(r.pubkey)), s.everydayPrivateKey.fill(0), s.connectionVaultRoot?.fill(0)) : (await te(h, J(r.pubkey)), n = qt(n, r.pubkey));
  }
  await Ae(h, n);
}
async function Nn(e) {
  const t = await Hs(h, N, e);
  return t ? (W(), u.signer = new re(t.everydayPrivateKey), u.everydayPrivateKey = t.everydayPrivateKey, u.accountId = t.accountId, u.recoveryPublicKey = t.recoveryPublicKey, u.activeCredentialEvent = t.activeCredentialEvent, u.activeRecoveryEvent = t.activeRecoveryEvent, u.everydayKeyDerived = t.everydayKeyDerived ?? !1, u.connectionVaultRoot = t.connectionVaultRoot ?? null, u.vaultKnown = t.vaultEnabled !== void 0, await gi(), {
    restored: !0,
    everydayPublicKey: u.signer.getPublicKey(),
    accountId: t.accountId,
    everydayKeyDerived: u.everydayKeyDerived
  }) : { restored: !1 };
}
async function gi() {
  if (!u.signer) return;
  const e = u.signer.getPublicKey();
  await Su(h, { pubkey: e, npub: ot(e) });
}
function ue() {
  try {
    return new URL(self.location.href).origin;
  } catch {
    return "";
  }
}
const Tn = "bitlogin:held:v1:", mi = 3e3, Ko = 2500, Ft = new Ru(mi), j = (e) => {
  const t = new T(e, {
    connectTimeoutMs: mi,
    connectionFor: Ft.connectionFor,
    notWaitedFor: Ft.notWaitedFor,
    heard: Ft.heard
  }), o = t.queryQuorum.bind(t);
  return t.queryQuorum = (n, r = Ko) => o(n, Math.min(r, Ko)), t;
}, Lu = 1500, Mn = (e) => {
  const t = j(e);
  return t.publishAll = (o, n) => t.publishEnough(o, n, 2, Lu), t;
}, xe = (e) => uu(e, (t) => j([t]));
function _e() {
  if (!Bo(ue())) throw new Error("That is done at BitLogin's own address.");
}
function On(e) {
  if (e === void 0) return ue();
  const t = Me(e);
  if (!t || !Bo(ue())) throw new Error("A wallet connection is for this site only.");
  return t;
}
function nr() {
  if (!u.signer) throw new Error("No identity is unlocked in this session.");
  if (!u.connectionVaultRoot)
    throw new Error(
      u.vaultKnown ? "This account predates the Connection Vault. Enable it from your BitLogin account manager (recovery phrase required)." : "Sign in again to use wallet connections on this device."
    );
  return u.vault ??= new _l(u.connectionVaultRoot.slice()), u.vault;
}
function et(e) {
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
async function $t() {
  const e = nr(), t = await e.listConnections({ relayUrls: R, store: h });
  return {
    vault: e,
    connections: t.connections.filter((o) => o.record.state !== "deleted"),
    rollbackWarnings: t.rollbackWarnings,
    unreadable: t.unreadable,
    truncated: t.truncated,
    quorumMet: t.quorumMet
  };
}
async function In(e) {
  const { vault: t, connections: o } = await $t(), n = o.find((r) => r.record.connection_id === e);
  if (!n) throw new Error("That connection no longer exists.");
  return { vault: t, connection: n };
}
let Ce = null, oe = null;
function Ao(e) {
  self.postMessage({ notify: "nip46-auth-url", url: e });
}
function tt() {
  if (!Ce) throw new Error("No remote signer is connected.");
  return Ce;
}
function It() {
  oe && (oe.abort.abort(), S(oe.clientSecretKey), oe = null);
}
function bi(e) {
  const t = e.buildLogoutEvent();
  e.close(), t && e.publishCourtesy(t);
}
function Ro(e, t) {
  Ce && bi(Ce.client), Ce = { client: e, userPubkey: t };
}
async function xu(e, t, o = "") {
  if (u.signerOnly && !Ql.has(e))
    throw new Error("This session can only sign. Sign in at your own BitLogin page for anything else.");
  switch (N && e !== "configure" && Date.now() - Rn > Y.idleSec * 1e3 && Ze(), Ou.has(e) || (Rn = Date.now()), e) {
    // ---- The optional lock (lock.ts) ----
    case "lockStatus":
      return Le();
    // Turn it on, or change the PIN. Only with a full session unlocked: the key that is sealed is the one in hand.
    case "lockEnable": {
      if (A(), await me(h) && !N) throw new Error("Unlock first.");
      const n = await Wl(h, t.pin, N ?? void 0);
      return await So(N, n), N && S(N), N = n, await Ee(), Le();
    }
    case "lockSetDevice": {
      if (A(), !N) throw new Error("Turn the lock on first.");
      const n = t, r = U(String(n.prfOutput));
      try {
        await Vl(h, N, String(n.credentialId), r);
      } finally {
        S(r);
      }
      return Le();
    }
    case "lockRemoveDevice": {
      if (A(), !N) throw new Error("Turn the lock on first.");
      return await Bl(h), Le();
    }
    case "lockDisable": {
      if (A(), await me(h) && !N) throw new Error("Unlock first.");
      return await So(N, null), await lt(h), N && S(N), N = null, await Ee(), Le();
    }
    case "lockNow": {
      if (!N) throw new Error("The lock is not on.");
      return Ze(), Le();
    }
    // Open it, with the PIN or with the device. A wrong try is counted; one too many removes the lock and the
    // cached session with it, and the user signs in again the ordinary way.
    case "lockOpen": {
      const n = t;
      let r;
      if (typeof n.prfOutput == "string") {
        const s = U(n.prfOutput);
        try {
          r = await jl(h, s);
        } finally {
          S(s);
        }
      } else
        r = await Gl(h, n.pin);
      if (r.ok) {
        N && S(N), N = r.lockKey, Rn = Date.now();
        const s = await Nn();
        if (s.restored) return { ok: !0, left: Y.tries, removed: !1, ...s };
        if (await Ut(h) === "none" && (await z(h)).length > 0) return { ok: !0, left: Y.tries, removed: !1, restored: !1 };
        await lt(h), Ze(), r = { ok: !1, left: 0, removed: !0 };
      }
      return r.removed && (Ze(), await tr(), await yo(h), await Xe(h)), { ok: !1, left: r.left, removed: r.removed, restored: !1 };
    }
    // ---- Signer hand-off (docs/sign-in-window.md) ----
    // The receiving side, first: a throwaway key for the hand-off to be sealed to.
    case "handoffBegin":
      return be && S(be), be = Qe(), { recipientPublicKey: P(be) };
    // The sending side: this worker has the session, and seals the everyday
    // key (only that) to the receiving worker's throwaway key.
    case "handoffExport": {
      const { everydayPrivateKey: n } = A(), r = Qe(), s = t;
      try {
        return Zl(n, s.recipientPublicKey, r, s.app, {
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
      const r = t, s = Date.now() / 1e3;
      if (!u.remember) return { kept: !1 };
      if (u.app && u.app.site !== r.site || u.site && u.site !== r.site) throw new Error("This hand-off was for another site.");
      const i = u.family ?? u.memberOf;
      if (i && !Pe(r.site, i)) throw new Error("This hand-off was for another site.");
      u.family && await Ot(h, r.site);
      const a = zl({ site: r.site, app: u.app, family: i, more: ie(u.more) });
      let c = !0;
      for (const l of a)
        c = await Tt(
          h,
          {
            site: l.site,
            everydayPrivateKey: n,
            // The application's own grant for as long as the signer worked out for it; the family's by its own name.
            until: u.app && i && l.site === i ? Math.floor(s) + Xt(i) : r.until,
            ...r.name ? { name: r.name } : {},
            ...u.profile && !u.app ? { profile: u.profile } : {},
            at: u.grantAt ?? Math.floor(s),
            ...u.relays.length ? { relays: u.relays } : {},
            signed: [],
            ...l.more ? { more: l.more } : {},
            ...l.memberOf ? { memberOf: l.memberOf } : {},
            ...l.permissions ? { permissions: l.permissions, signedSensitive: [] } : {}
          },
          s
        ) && c;
      return { kept: c };
    }
    // The site's page was loaded again: what was kept for that site, if it is still in date, becomes a
    // signer-only session. It touches nothing a full session uses.
    // Whether a guest is kept here for a family: its public key, and nothing else of it. For BitLogin's own panel,
    // which says so and offers to secure it (docs/guest-accounts.md G3, G8).
    case "guestStatus": {
      const n = t.family, r = typeof n == "string" && D(n) ? await yt(h, n) : null;
      return r ? { pubkey: P(r.key) } : {};
    }
    case "signerRestore": {
      const n = t, r = await Mt(h, n.site, Date.now() / 1e3), s = !r && n.family !== void 0 && D(n.family) && Pe(n.site, n.family) ? n.family : null, i = r ?? (s ? await Mt(h, s, Date.now() / 1e3) : null);
      if (!i || s && i.site !== s) {
        const a = n.family !== void 0 && D(n.family) && Pe(n.site, n.family) && vt(n.family) ? n.family : null, c = a ? n.guest === !0 ? await _u(h, a).catch(() => null) : await yt(h, a) : null;
        return c ? (W(), u.signer = new re(c.key), u.everydayPrivateKey = c.key, u.signerOnly = !0, u.app = null, u.site = n.site, u.guest = a, u.remember = !1, u.profile = null, u.relays = [], u.more = [], { restored: !0, everydayPublicKey: u.signer.getPublicKey(), until: Math.floor(Date.now() / 1e3) + Cu, signed: [], guest: !0 }) : { restored: !1 };
      }
      return W(), u.signer = new re(i.everydayPrivateKey), u.everydayPrivateKey = i.everydayPrivateKey, u.signerOnly = !0, u.app = i.permissions ? { site: i.site, permissions: i.permissions } : null, u.site = s ? n.site : i.site, u.family = s, u.memberOf = !s && i.memberOf ? i.memberOf : null, u.profile = i.profile ?? null, u.remember = !0, u.grantAt = Sn(i), u.relays = i.relays ?? [], u.more = s ? [] : i.more ?? [], {
        restored: !0,
        everydayPublicKey: u.signer.getPublicKey(),
        until: i.until,
        ...i.name ? { name: i.name } : {},
        ...i.profile ? { profile: i.profile } : {},
        signed: i.signed,
        ...i.signedPass ? { signedPass: i.signedPass } : {},
        check: Xr(Date.now() / 1e3, Sn(i), i.checkedAt ?? 0),
        ...s ? { family: s } : {},
        ...u.more.length ? { more: ie(u.more) } : {},
        ...i.permissions ? { permissions: i.permissions, signedSensitive: i.signedSensitive ?? [] } : {}
      };
    }
    // Count a signature against the site, where reloading the page can't lose the count.
    case "signerTouch": {
      const { everydayPrivateKey: n } = A();
      if (!u.signerOnly) throw new Error("Only a signer-only session is counted for a site.");
      const r = t, s = Date.now() / 1e3, i = await Mt(h, u.family && Pe(r.site, u.family) ? u.family : r.site, s);
      return i && P(i.everydayPrivateKey) === P(n) && await Tt(
        h,
        { ...i, signed: Array.isArray(r.signed) ? r.signed : [], ...Array.isArray(r.signedPass) ? { signedPass: r.signedPass } : {}, ...i.permissions ? { signedSensitive: Array.isArray(r.signedSensitive) ? r.signedSensitive : [] } : {} },
        s
      ), {};
    }
    // Signing out of a site that was allowed as one of a family signs out of the family: otherwise its next page
    // load would take the family's grant up again, and the sign-out would not have happened (SF6).
    case "signerForget": {
      const n = t.site;
      await Ot(h, n);
      const r = u.family ?? u.memberOf;
      r && Pe(n, r) && await Ot(h, r), await h.delete(Tn + n).catch(() => {
      });
      for (const s of ["save", "follow", "seal", "unwrap", "reach", "score", "achieve"])
        Zn.delete(`${Xn}${s}:${n}`), await h.delete(`${Xn}${s}:${n}`).catch(() => {
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
      const r = Me(t.site);
      if (!r) throw new Error("That is not a site.");
      if (u.app && u.app.site !== r || u.site && u.site !== r) throw new Error("That is another site's.");
      const s = n.getPublicKey();
      if (e === "signerHold") {
        const i = t.receipts, a = (Array.isArray(i) ? i.slice(0, Zr) : []).filter((c) => !!c && typeof c == "object" && c.kind === 30078 && typeof c.content == "string" && c.content.length <= 8e3 && C(c));
        return await h.set(Tn + r, JSON.stringify({ pubkey: s, receipts: a })), {};
      }
      try {
        const i = JSON.parse(await h.get(Tn + r) ?? "null");
        return { receipts: i?.pubkey === s && Array.isArray(i.receipts) ? i.receipts.slice(0, Zr) : [] };
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
        r = eu(t, n);
      } finally {
        S(n);
      }
      return W(), u.signer = new re(r.key), u.everydayPrivateKey = r.key, u.signerOnly = !0, u.app = r.app, u.site = r.site, u.profile = r.profile, u.remember = r.remember, u.grantAt = r.at, u.relays = r.relays, u.family = r.app ? null : r.family, u.memberOf = r.app ? r.family : null, u.more = r.more, {
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
      const { signer: n } = A(), r = n.getPublicKey(), s = t.profile !== !1, i = [.../* @__PURE__ */ new Set([...x, ...R])].slice(0, 8);
      if (i.length === 0) return {};
      const a = j(i);
      try {
        const [c, l] = await Promise.all([
          s ? a.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 4e3) : Promise.resolve(null),
          a.queryQuorum({ kinds: [Oe], authors: [r], limit: 2 }, 4e3)
        ]);
        if (u.signer !== n) return {};
        u.profile = c ? fo(c.outcomes.flatMap((d) => d.events), r) : null, u.profile && !u.signerOnly && await Ae(h, ql(await z(h), r, u.profile)), u.relays = Ie(l.outcomes.flatMap((d) => d.events), r);
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
      const { signer: n } = A(), r = t, s = n.getPublicKey(), i = Date.now() / 1e3, a = r.all === !0 ? { all: !0 } : { site: String(r.site ?? "") }, c = j([.../* @__PURE__ */ new Set([...x, ...R])].slice(0, 8));
      let l;
      try {
        l = Ie((await c.queryQuorum({ kinds: [Oe], authors: [s], limit: 2 }, 4e3)).outcomes.flatMap((f) => f.events), s);
      } finally {
        c.closeAll();
      }
      const d = [.../* @__PURE__ */ new Set([...l, ...R])].slice(0, 16), y = j(d);
      try {
        const f = await y.queryQuorum({ kinds: [bn], authors: [s], "#d": [mn], limit: 2 }, 5e3);
        if (f.respondedCount === 0) return { ok: !1, accepted: 0, of: d.length };
        const p = Qr(f.outcomes.flatMap((_) => _.events), s, i), g = p ? _o(n, p.content) : null, v = await Iu(s), b = la(ua(g ?? Un, v, i), a, i), w = n.signEvent({
          kind: bn,
          // Later than the one it replaces, whatever the two clocks say.
          created_at: Math.max(Math.floor(i), (p?.created_at ?? 0) + 1),
          tags: [["d", mn]],
          content: n.nip44Encrypt(s, Yr(b))
        }), k = V(await y.publishAll(w, 6e3)), m = k >= Math.min(2, d.length);
        return m && await h.set(vi + s, Yr(b)).catch(() => {
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
      const r = u.family ?? u.site, s = Date.now() / 1e3, i = await Mt(h, r, s);
      if (!i) return { state: "ok" };
      const a = n.getPublicKey(), c = Sn(i), l = Xr(s, c, i.checkedAt ?? 0);
      if (l === "fresh") return { state: "ok" };
      const d = [.../* @__PURE__ */ new Set([...se(i.relays), ...R])].slice(0, 12), y = j(d);
      let f, p;
      try {
        [f, p] = await Promise.all([
          y.queryQuorum({ kinds: [bn], authors: [a], "#d": [mn], limit: 2 }, 5e3),
          y.queryQuorum({ kinds: [Oe], authors: [a], limit: 2 }, 5e3)
        ]);
      } finally {
        y.closeAll();
      }
      if (u.signer !== n) return { state: "ok" };
      const g = Qr(f.outcomes.flatMap((k) => k.events), a, s), v = g ? _o(n, g.content) : null;
      if (v && Ea(v, r, c))
        return await Ot(h, r), W(), { state: "ended" };
      if (!_a({
        asked: d.length,
        answered: f.respondedCount,
        seenAt: i.seenAt ?? 0,
        newestAt: g ? g.created_at : null,
        readable: v !== null
      })) return { state: l === "overdue" ? "stale" : "ok" };
      const w = Ie(p.outcomes.flatMap((k) => k.events), a);
      return await Tt(
        h,
        {
          ...i,
          checkedAt: Math.floor(s),
          seenAt: Math.max(i.seenAt ?? 0, v && g ? g.created_at : 0),
          ...w.length ? { relays: w } : {}
        },
        s
      ), w.length && (u.relays = w), { state: "ok" };
    }
    // A room pass (NSWP kind 27300) for the site this session serves, and for no other. The site, the time, how
    // long it lasts and the profile are all this worker's own: what is asked for is a session public key. For an
    // application only where the set the user read already signs the pass's kind (passAllowed); for a guest, said.
    case "roomPass": {
      const { signer: n } = A();
      if (!u.signerOnly || !ka(u.app ? u.app.permissions : null) || !u.site) throw new Error("refused");
      const r = Dl({
        session: t.session,
        site: u.site,
        identity: n.getPublicKey(),
        nowSeconds: Date.now() / 1e3,
        profile: u.profile,
        guest: !!u.guest
      });
      if (!r) throw new Error("refused");
      return n.signEvent(r);
    }
    // ---- What a world keeps for its visitor (NSWP-12; embedded/saves.ts). The world is never taken from what is
    // asked: it is the site this session serves, as the browser gave it to the signer's page.
    case "worldSave": {
      const { signer: n, everydayPrivateKey: r, site: s } = ee(), i = t, a = Re(r, n.getPublicKey());
      try {
        const c = aa({ conversationKey: a, world: s, slot: i.slot, data: i.data, nowSeconds: Date.now() / 1e3 });
        if (!c || !await ke("save", s, ca)) throw new Error("refused");
        return n.signEvent(c);
      } finally {
        S(a);
      }
    }
    case "worldFind": {
      const { signer: n, everydayPrivateKey: r, site: s } = ee(), i = Re(r, n.getPublicKey());
      try {
        const a = ia(i, s, t.slot);
        if (!a) throw new Error("refused");
        return { d: a };
      } finally {
        S(i);
      }
    }
    case "worldOpen": {
      const { signer: n, everydayPrivateKey: r, site: s } = ee(), i = t.event;
      if (!C(i)) throw new Error("refused");
      const a = Re(r, n.getPublicKey());
      try {
        const c = sa(i, { conversationKey: a, pubkey: n.getPublicKey(), world: s });
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
      const { signer: n, site: r } = ee();
      if (!u.more.includes("follows")) throw new Error("refused");
      const s = t, i = n.getPublicKey(), a = s.list === null ? null : zr(s.list, i);
      if (s.list !== null && !a) throw new Error("refused");
      const c = Du + i;
      let l = 0;
      try {
        const v = Number(await h.get(c));
        Number.isSafeInteger(v) && v > 0 && (l = v);
      } catch {
      }
      const d = [.../* @__PURE__ */ new Set([...se(u.relays), ...x, ...R])].slice(0, 8);
      let y = 0, f = 0;
      if (d.length) {
        const v = j(d);
        try {
          const b = await v.queryQuorum({ kinds: [Ye], authors: [i], limit: 2 }, 3500);
          y = b.respondedCount;
          for (const w of b.outcomes.flatMap((k) => k.events))
            w.created_at > f && zr(w, i) && (f = w.created_at);
        } catch {
        } finally {
          v.closeAll();
        }
      }
      if (u.signer !== n || !u.more.includes("follows")) throw new Error("refused");
      if (l = Math.max(l, f), l && await h.set(c, String(l)).catch(() => {
      }), !ra(a, { answered: y, newestAt: f })) throw new Error("refused");
      const p = oa({ list: a, ...s.add !== void 0 ? { add: s.add } : {}, ...s.remove !== void 0 ? { remove: s.remove } : {}, pubkey: i, nowSeconds: Date.now() / 1e3, seen: l });
      if (!p || !await ke("follow", r, ba)) throw new Error("refused");
      const g = n.signEvent(p);
      return await h.set(c, String(Math.max(l, g.created_at))).catch(() => {
      }), g;
    }
    // ---- A score on one of a world's boards (NSWP-15; embedded/scores.ts). For any world its visitor allowed: it
    // is less than a note. The world names its coordinate, a board and a number; the note and the mark that says
    // which site asked are this worker's own.
    case "worldScore": {
      const { signer: n, site: r } = ee(), s = t, i = na({ world: s.world, board: s.board, score: s.score, title: s.title, format: s.format, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await ke("score", r, ma)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- An achievement held in a world (NSWP-16; embedded/achievements.ts). As a score: for any world its visitor
    // allowed, built here from three plain fields, and marked with the site this session serves.
    case "worldAchieve": {
      const { signer: n, site: r } = ee(), s = t, i = ta({ world: s.world, id: s.achievement, title: s.title, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await ke("achieve", r, ga)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- Private messages from inside a world (NSWP-14; embedded/messages.ts). Only for a world the user let do
    // this, by name, in the window. The world names a reader and the words, or hands over a wrap; it is never given
    // a key, and nothing else is encrypted or decrypted for it.
    case "worldSeal": {
      const { signer: n, site: r } = ee();
      if (!u.more.includes("messages")) throw new Error("refused");
      const s = t, i = ea(n, { to: s.to, text: s.text, nowSeconds: Date.now() / 1e3 });
      if (!i || !await ke("seal", r, va)) throw new Error("refused");
      return i;
    }
    case "worldUnwrap": {
      const { signer: n, site: r } = ee();
      if (!u.more.includes("messages")) throw new Error("refused");
      if (!await ke("unwrap", r, wa, !1)) throw new Error("refused");
      const s = Zi(n, t.event);
      if (!s) throw new Error("refused");
      return { message: s };
    }
    case "worldReach": {
      const { signer: n, site: r } = ee();
      if (!u.more.includes("messages")) throw new Error("refused");
      const s = Xi(t.relays, Date.now() / 1e3);
      if (!s || !await ke("reach", r, ha)) throw new Error("refused");
      return n.signEvent(s);
    }
    // ---- What an approved application may ask beyond signing (§SW9.5). Refused without a permission set.
    case "appEncrypt": {
      const { signer: n } = A(), r = Cn(), s = t, i = n.getPublicKey(), a = r.permissions.sign.some((c) => Qi.includes(c));
      if (!Yi(r.permissions, i, s.peerPublicKey) && !(a && /^[0-9a-f]{64}$/u.test(String(s.peerPublicKey))))
        throw new Error("refused");
      if (typeof s.text != "string" || s.text.length > 1e5) throw new Error("refused");
      return { text: s.scheme === "nip04" ? n.nip04Encrypt(s.peerPublicKey, s.text) : n.nip44Encrypt(s.peerPublicKey, s.text) };
    }
    case "appDecrypt": {
      const { signer: n } = A(), r = Cn(), s = t;
      if (!zi(r.permissions, s.peerPublicKey) || typeof s.text != "string") throw new Error("refused");
      return { text: s.scheme === "nip04" ? n.nip04Decrypt(s.peerPublicKey, s.text) : n.nip44Decrypt(s.peerPublicKey, s.text) };
    }
    case "appDecryptEvent": {
      const { signer: n } = A(), r = Cn(), s = t.event;
      if (!C(s)) throw new Error("refused");
      const i = Hi(r.permissions, n.getPublicKey(), s), a = s.kind === 4 || /\?iv=[A-Za-z0-9+/=]+$/u.test(s.content);
      for (const c of i)
        try {
          return { text: a ? n.nip04Decrypt(c, s.content) : n.nip44Decrypt(c, s.content) };
        } catch {
        }
      throw new Error("refused");
    }
    case "nip46Connect": {
      const r = Ga(t.uri), s = new ro({
        clientSecretKey: Qe(),
        pointer: r,
        onAuthUrl: Ao
      });
      try {
        await s.connect();
        const i = await s.getUserPublicKey();
        return Ro(s, i), It(), { userPubkey: i };
      } catch (i) {
        throw s.close(), i;
      }
    }
    case "nip46NostrconnectStart": {
      const n = t, r = R.slice(0, 2);
      It();
      const s = Qe(), i = $e($(16));
      return oe = { clientSecretKey: s, relayUrls: r, secret: i, abort: new AbortController() }, { uri: ja({
        clientPubkey: P(s),
        relayUrls: r,
        secret: i,
        name: n.appName?.trim() || "BitLogin",
        perms: ["sign_event", "nip44_encrypt", "nip44_decrypt", "nip04_encrypt", "nip04_decrypt"]
      }) };
    }
    case "nip46NostrconnectAwait": {
      const n = oe;
      if (!n) throw new Error("No signer-connection attempt is in progress.");
      let r;
      try {
        ({ signerPubkey: r } = await Ha({
          clientSecretKey: n.clientSecretKey,
          relayUrls: n.relayUrls,
          secret: n.secret,
          timeoutMs: 18e4,
          signal: n.abort.signal
        }));
      } catch (i) {
        throw oe === n && It(), i;
      }
      if (oe !== n) throw new Error("This signer-connection attempt was superseded.");
      oe = null;
      const s = new ro({
        clientSecretKey: n.clientSecretKey,
        pointer: { signerPubkey: r, relayUrls: n.relayUrls },
        onAuthUrl: Ao
      });
      try {
        const i = await s.getUserPublicKey();
        return Ro(s, i), { userPubkey: i };
      } catch (i) {
        throw s.close(), i;
      }
    }
    case "nip46SignEvent": {
      const n = t;
      return tt().client.signEvent({
        kind: n.kind,
        content: n.content,
        tags: n.tags ?? [],
        created_at: n.created_at ?? Math.floor(Date.now() / 1e3)
      });
    }
    case "nip46Nip44Encrypt": {
      const n = t;
      return { ciphertext: await tt().client.nip44Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip44Decrypt": {
      const n = t;
      return { plaintext: await tt().client.nip44Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Nip04Encrypt": {
      const n = t;
      return { ciphertext: await tt().client.nip04Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip04Decrypt": {
      const n = t;
      return { plaintext: await tt().client.nip04Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Disconnect": {
      const n = Ce;
      return Ce = null, It(), n && bi(n.client), {};
    }
    case "configure": {
      const n = t;
      return Qn = !!n.vaultRelayUrls?.length, Yn = !!n.discoveryRelayUrls?.length, n.vaultRelayUrls?.length && (R = n.vaultRelayUrls), n.discoveryRelayUrls?.length && (x = n.discoveryRelayUrls), Eo(Lt(await Qo(h))), (!Qn || !Yn) && La(h).then(Eo, () => {
      }), {};
    }
    case "register": {
      const n = t, r = n.fromGuest !== void 0 && !n.importKey && D(n.fromGuest) && vt(n.fromGuest) ? n.fromGuest : null;
      if (n.fromGuest !== void 0 && !r) throw new Error("That is not a guest account kept here.");
      const s = r ? await yt(h, r) : null;
      if (r && !s) throw new Error("No guest account is kept here to secure.");
      const i = n.importKey ? await zc({ nsecOrHex: n.importKey, loginName: n.loginName, password: n.password, vaultRelayUrls: R }) : await Ss({ loginName: n.loginName, password: n.password, vaultRelayUrls: R, ...s ? { recoveryPhrase: s.phrase } : {} });
      if (r) {
        const a = Date.now() / 1e3;
        await Tt(h, { site: r, everydayPrivateKey: i.everydayPrivateKey, until: Math.floor(a) + Xt(r), at: Math.floor(a), signed: [] }, a), await Pu(h, r);
      }
      return W(), u.signer = new re(i.everydayPrivateKey), u.everydayPrivateKey = i.everydayPrivateKey, u.accountId = i.accountId, u.recoveryPublicKey = i.recoveryPublicKey, u.activeCredentialEvent = i.credentialEvent, u.activeRecoveryEvent = i.recoveryEvent, u.everydayKeyDerived = i.everydayKeyDerived, er(i.connectionVaultRoot, i.vaultSudoKey), await Ee(), {
        recoveryPhrase: i.recoveryPhrase,
        everydayPublicKey: i.everydayPublicKey,
        recoveryPublicKey: i.recoveryPublicKey,
        accountId: i.accountId,
        imported: i.imported,
        everydayKeyDerived: i.everydayKeyDerived,
        credentialEventId: i.credentialEvent.id,
        recoveryEventId: i.recoveryEvent.id
      };
    }
    case "previewImportKey": {
      const r = Ks(t.nsecOrHex), s = P(r), i = { everydayPublicKey: s, npub: ot(s) };
      return r.fill(0), i;
    }
    case "login": {
      const n = t, r = await Qc({
        loginName: n.loginName,
        password: n.password,
        vaultRelayUrls: R,
        store: h,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return W(), u.signer = new re(r.everydayPrivateKey), u.everydayPrivateKey = r.everydayPrivateKey, u.accountId = r.accountId, u.recoveryPublicKey = r.recoveryPublicKey, u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.recoveryCapsuleEvent, u.everydayKeyDerived = r.everydayKeyDerived, er(r.connectionVaultRoot, r.vaultSudoKey), await Ee(), !r.rollbackWarning && !r.relayDisagreementWarning && so({
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
      const n = t, r = await Yc({
        phrase: n.phrase,
        vaultRelayUrls: R,
        discoveryRelayUrls: x,
        offlineRecoveryCapsuleEvents: n.offlineExportFile?.recovery_capsule_events
      });
      return Po(r);
    }
    case "previewPhraseRebuild": {
      const r = await Xc({ phrase: t.phrase, vaultRelayUrls: R, discoveryRelayUrls: x });
      return { ...r, npub: ot(r.everydayPublicKey) };
    }
    case "rebuildFromPhrase": {
      const r = await Zc({ phrase: t.phrase, vaultRelayUrls: R, discoveryRelayUrls: x });
      return Po(r);
    }
    case "completeRecovery": {
      const n = t;
      if (!u.pendingRecovery) throw new Error("No recovery is in progress in this session.");
      const r = await el({
        recovered: u.pendingRecovery,
        newLoginName: n.newLoginName,
        newPassword: n.newPassword,
        vaultRelayUrls: R,
        store: h
      });
      return u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.refreshedRecoveryEvent, u.pendingRecovery.recoveryPrivateKey.fill(0), u.pendingRecovery = null, await Ee(), {
        locatorPublicKey: r.locatorPublicKey,
        credentialEventId: r.credentialEvent.id,
        refreshedRecoveryEventId: r.refreshedRecoveryEvent.id
      };
    }
    case "changePassword": {
      const n = t, r = await tl({
        loginName: n.loginName,
        oldPassword: n.oldPassword,
        newPassword: n.newPassword,
        vaultRelayUrls: R,
        store: h,
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
      const n = t, { everydayPrivateKey: r } = A();
      return Nc({
        everydayPrivateKey: r,
        name: n.name,
        about: n.about,
        picture: n.picture,
        generalRelays: n.generalRelays,
        dmRelays: n.dmRelays,
        discoveryRelays: x
      });
    }
    case "getPublicKey": {
      const { signer: n } = A();
      return { publicKey: n.getPublicKey() };
    }
    case "signEvent": {
      const { signer: n } = A(), r = t;
      if (u.signerOnly) {
        if (u.app) {
          const s = ya(u.app.permissions, r, u.app.site, Date.now() / 1e3);
          if (!s) throw new Error("refused");
          return n.signEvent(s);
        }
        if (u.guest) {
          const s = u.site ? fa(r, u.site, Date.now() / 1e3) : null;
          if (!s) throw new Error("refused");
          return n.signEvent(s);
        }
        if (pa(r.kind) !== "ordinary") throw new Error("refused");
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
      return { nsec: Si(n), npub: ot(r.getPublicKey()) };
    }
    case "buildRecoveryExport": {
      if (A(), !u.recoveryPublicKey || !u.activeRecoveryEvent)
        throw new Error("No recovery capsule is known in this session yet.");
      return Ki({
        recoveryPublicKeyHex: u.recoveryPublicKey,
        vaultRelayUrls: R,
        recoveryCapsuleEvents: [u.activeRecoveryEvent],
        relayListEvents: []
      });
    }
    case "repairReplicas": {
      if (!u.activeCredentialEvent || !u.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return so({
        relayUrls: R,
        credentialEvent: u.activeCredentialEvent,
        recoveryEvent: u.activeRecoveryEvent
      });
    }
    case "checkReplicaHealth": {
      if (!u.activeCredentialEvent || !u.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Gc({
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
      return !N && await Ut(h) === "locked" ? { restored: !1, locked: !0 } : Nn();
    // Log out: this account is forgotten on this device. Other accounts kept here stay, and so does the lock
    // they are sealed under; with none left, everything goes as it always did.
    case "logout": {
      const n = u.everydayPrivateKey && !u.signerOnly ? P(u.everydayPrivateKey) : "", r = qt(await z(h), n);
      return n && await te(h, J(n)), r.length > 0 && n ? (await Ae(h, r), W(), await te(h), await Xe(h), {}) : (Ze(), await lt(h), await tr(), await yo(h), await Xe(h), {});
    }
    // ---- Several accounts on one device (docs/account-switching.md) ----
    // Who is kept here, and which of them is signed in. Public keys and what their own profiles call them.
    case "accountsList": {
      const n = u.everydayPrivateKey && !u.signerOnly ? P(u.everydayPrivateKey) : "";
      return { accounts: (await z(h)).map((r) => ({ ...r, active: r.pubkey === n })) };
    }
    // Switch to a kept account: its own slot is opened, on this device, with no password and no relay. With the
    // lock on and locked, it says so, and nothing changes.
    case "accountsSwitch": {
      if (u.signerOnly) throw new Error("A signer-only session cannot switch accounts.");
      const n = String(t.pubkey ?? ""), r = await z(h);
      if (!r.some((i) => i.pubkey === n)) return { restored: !1 };
      if (!N && await Ut(h, J(n)) === "locked") return { restored: !1, locked: !0 };
      const s = await Nn(J(n));
      return !s.restored || s.everydayPublicKey !== n ? (W(), await te(h, J(n)), await Ae(h, qt(r, n)), await te(h), await Xe(h), { restored: !1 }) : (await Ee(), s);
    }
    // Make room to sign in as another account: nobody is signed in, and everyone kept stays kept.
    case "accountsAdd": {
      if (u.signerOnly) throw new Error("A signer-only session cannot add accounts.");
      return W(), await te(h), await Xe(h), {};
    }
    // Forget one kept account that is not the one signed in. (For that one: log out.)
    case "accountsRemove": {
      const n = String(t.pubkey ?? ""), r = u.everydayPrivateKey && !u.signerOnly ? P(u.everydayPrivateKey) : "";
      if (n === r) throw new Error("Log out to remove the account that is signed in.");
      return await te(h, J(n)), await Ae(h, qt(await z(h), n)), {};
    }
    // ---- Connection Vault (connection-vault.md §12, reveal mode) ----
    // ---- An ecash wallet kept with the account (docs/ecash.md). A full session only: none of these is on the list a
    // handed-over session may ask, so no embedded signer, and so no site, can read a token.
    // ---- A person's files (docs/files.md). A full session only: none of these is on the list a handed-over
    // session may ask, so no embedded signer, and so no site, can read the index or have a permission note signed.
    case "blossomAuth": {
      const { signer: n } = A();
      return { token: wu(n, t) };
    }
    case "driveLoad":
    case "driveSave":
    case "blossomServers":
    case "blossomSetServers": {
      const { signer: n } = A(), r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...x, ...R])].slice(0, 8);
      let i = u.relays;
      if (i.length === 0 && s.length) {
        const c = j(s);
        try {
          i = Ie((await c.queryQuorum({ kinds: [Oe], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((l) => l.events), r), i.length && (u.relays = i);
        } catch {
          i = [];
        } finally {
          c.closeAll();
        }
      }
      const a = Mn([.../* @__PURE__ */ new Set([...i, ...R, ...e.startsWith("blossom") ? x : []])].slice(0, 16));
      try {
        const c = { signer: n, store: h, relays: a };
        if (e === "driveLoad") return await pu(c);
        if (e === "driveSave") return await hu(c, t);
        const l = async () => {
          const w = await a.queryQuorum({ kinds: [rt], authors: [r], limit: 2 }, 4e3);
          if (w.respondedCount === 0) throw new Error("No relay answered for your server list.");
          const k = w.outcomes.flatMap((m) => m.events).filter((m) => m.kind === rt && m.pubkey === r && C(m)).sort((m, _) => _.created_at - m.created_at)[0];
          return k ? di(k) : [];
        };
        if (e === "blossomSetServers") {
          const w = [...new Set((t.servers ?? []).map(wr).filter(Boolean))].slice(0, hr.servers);
          if (w.length === 0) throw new Error("Name at least one file server, by its https address.");
          const k = n.signEvent({ kind: rt, created_at: Math.floor(Date.now() / 1e3), tags: w.map((m) => ["server", m]), content: "" });
          if (V(await a.publishAll(k, 6e3)) < Math.min(2, a.relayUrls.length)) throw new Error("No relay took your server list. Try again when you are online.");
          return { mine: w };
        }
        if (t.ranked !== !0) return { mine: await l(), ranked: [] };
        const d = xe(a.relayUrls), [y, f, p] = await Promise.all([
          l(),
          d.queryQuorum({ kinds: [rt], limit: 500 }, 5e3),
          d.queryQuorum({ kinds: [Ye], authors: [r], limit: 2 }, 4e3)
        ]).finally(() => d.closeAll()), g = p.outcomes.flatMap((w) => w.events).filter((w) => w.pubkey === r && w.kind === Ye && C(w)).sort((w, k) => k.created_at - w.created_at)[0], v = new Set((g?.tags ?? []).filter((w) => w[0] === "p" && typeof w[1] == "string").map((w) => w[1])), b = new Map(f.outcomes.flatMap((w) => w.events).filter((w) => w.pubkey !== r && C(w)).map((w) => [w.id, w]));
        return { mine: y, ranked: vu([...b.values()], v) };
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
      const n = t.pubkey;
      if (typeof n != "string" || !/^[0-9a-f]{64}$/u.test(n)) throw new Error("That is not an account.");
      const r = [.../* @__PURE__ */ new Set([...u.relays, ...x, ...R])].slice(0, 10);
      if (r.length === 0) return { name: "", address: "", answered: !1 };
      const s = xe(r);
      try {
        const i = await s.queryQuorum({ kinds: [0], authors: [n], limit: 2 }, 3500), a = i.outcomes.flatMap((l) => l.events), c = a.filter((l) => l.kind === 0 && l.pubkey === n && C(l)).sort((l, d) => d.created_at - l.created_at)[0];
        return { name: fo(a, n)?.name ?? "", address: c ? Ji(c.content, { local: Rt(ue()) }) : "", answered: i.respondedCount > 0 };
      } finally {
        s.closeAll();
      }
    }
    // A listing, by its coordinate, from the relays its service names and the account's own. The page checks it.
    case "payListing": {
      A(), _e();
      const n = t, r = Fo(n.coordinate);
      if (!r) throw new Error("That is not a listing.");
      const s = Rt(ue()), i = (Array.isArray(n.relays) ? n.relays : []).filter((l) => typeof l == "string" && l.length <= 200 && (/^wss:\/\//u.test(l) || s && /^ws:\/\/(localhost|127\.0\.0\.1)[:/]/u.test(l))).slice(0, 6), a = [.../* @__PURE__ */ new Set([...i, ...u.relays, ...x])].slice(0, 12);
      if (a.length === 0) return { event: null, answered: !1 };
      const c = xe(a);
      try {
        const l = await c.queryQuorum({ kinds: [30078], authors: [Hr(r)], "#d": [r.slice(71)], limit: 4 }, 5e3);
        return { event: l.outcomes.flatMap((y) => y.events).filter((y) => y.kind === 30078 && y.pubkey === Hr(r) && y.tags.some((f) => f[0] === "d" && f[1] === r.slice(71)) && C(y)).sort((y, f) => f.created_at - y.created_at)[0] ?? null, answered: l.respondedCount > 0 };
      } finally {
        c.closeAll();
      }
    }
    // A buyer's permission note (NIP-98) for one request to a selling service BitLogin knows: this address, this
    // method, this body, once. Kind 27235 is signed here and nowhere else, and never for a site.
    case "unlockAuth": {
      const { signer: n } = A();
      _e();
      const r = t;
      let s;
      try {
        s = new URL(String(r.url));
      } catch {
        throw new Error("That is not an address.");
      }
      const i = ji.some((y) => y.endpoint === s.origin) || Rt(ue()) && Rt(s.origin);
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
      const r = t;
      if (!jr(r.subject) || r.scope !== "user-allow" && r.scope !== "user-deny") throw new Error("That is not a world's list.");
      const s = n.getPublicKey(), i = j([.../* @__PURE__ */ new Set([...u.relays, ...R, ...x])].slice(0, 12));
      try {
        const a = await i.queryQuorum({ kinds: [30078], authors: [s], "#d": [Jr(r.scope, r.subject)], limit: 4 }, 5e3), c = a.outcomes.flatMap((f) => f.events), l = Jr(r.scope, r.subject), d = Gi(c, { scope: r.scope, subject: r.subject, root: [s] }), y = c.filter((f) => f.pubkey === s && f.kind === 30078 && f.tags.some((p) => p[0] === "d" && p[1] === l) && f.created_at <= Date.now() / 1e3 + 600).sort((f, p) => p.created_at - f.created_at || (f.id < p.id ? -1 : 1));
        return { event: d.ok ? y[0] ?? null : null, answered: a.respondedCount > 0 };
      } finally {
        i.closeAll();
      }
    }
    // Sign this account's list for a world: built here from the world, which list, and who is on it. Nothing else.
    case "guestListSign": {
      const { signer: n } = A();
      _e();
      const r = t, s = typeof r.replaces == "number" && Number.isSafeInteger(r.replaces) && r.replaces <= Date.now() / 1e3 + 600 ? r.replaces : void 0, i = r.scope === "user-allow" || r.scope === "user-deny" ? Bi({ scope: r.scope, subject: String(r.subject), people: Array.isArray(r.people) ? r.people : [], createdAt: Math.floor(Date.now() / 1e3), ...s !== void 0 ? { notBefore: s } : {} }) : null;
      if (!i || !jr(r.subject)) throw new Error("That is not a list this account can keep.");
      return { event: n.signEvent(i) };
    }
    // The receipts kept with the account: in this browser first, then on its relays, each sealed to its own key.
    case "paySettingsLoad":
    case "paySettingsSave":
    case "receiptsLoad":
    case "receiptsKeep": {
      const { signer: n } = A();
      _e();
      const r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...x, ...R])].slice(0, 8);
      let i = u.relays;
      if (i.length === 0 && s.length) {
        const l = xe(s);
        try {
          i = Ie((await l.queryQuorum({ kinds: [Oe], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((d) => d.events), r), i.length && (u.relays = i);
        } catch {
          i = [];
        } finally {
          l.closeAll();
        }
      }
      const a = [.../* @__PURE__ */ new Set([...i, ...R])].slice(0, 16), c = e === "receiptsLoad" || e === "receiptsKeep" ? xe(a) : Mn(a);
      try {
        const l = { signer: n, store: h, relays: c };
        return e === "paySettingsLoad" ? await au(l) : e === "paySettingsSave" ? await cu(l, t) : e === "receiptsLoad" ? await su(l) : await iu(l, t.receipts);
      } finally {
        c.closeAll();
      }
    }
    // The words of their newest profile note, to show what a proposed one would change. Read-only, and theirs.
    case "profileContent": {
      const { signer: n } = A(), r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...u.relays, ...x, ...R])].slice(0, 10);
      if (s.length === 0) return { content: null, answered: !1 };
      const i = j(s);
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
      const { signer: n } = A(), r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...x, ...R])].slice(0, 8);
      if (s.length === 0) return { mints: [] };
      const i = xe(s);
      try {
        const [a, c] = await Promise.all([
          i.queryQuorum({ kinds: [ni], "#k": [ri], limit: 500 }, 5e3),
          i.queryQuorum({ kinds: [Ye], authors: [r], limit: 2 }, 4e3)
        ]), l = c.outcomes.flatMap((f) => f.events).filter((f) => f.pubkey === r && f.kind === Ye && C(f)).sort((f, p) => p.created_at - f.created_at)[0], d = new Set((l?.tags ?? []).filter((f) => f[0] === "p" && typeof f[1] == "string").map((f) => f[1])), y = new Map(a.outcomes.flatMap((f) => f.events).filter((f) => C(f)).map((f) => [f.id, f]));
        return { mints: ru([...y.values()], d) };
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
      e === "receiptsPeek" && _e();
      const r = { signer: n, store: h };
      return e === "ecashPeek" ? await gu(r) : e === "drivePeek" ? await fu(r) : await ou(r);
    }
    case "ecashLoad":
    case "ecashSetMints":
    case "ecashRoll": {
      const { signer: n } = A(), r = n.getPublicKey(), s = j([.../* @__PURE__ */ new Set([...x, ...R])].slice(0, 8)), i = s.queryQuorum({ kinds: [Oe], authors: [r], limit: 2 }, 4e3).then((d) => Ie(d.outcomes.flatMap((y) => y.events), r)).catch(() => []).then((d) => (d.length && u.signer === n && (u.relays = d), d)).finally(() => s.closeAll());
      let a = u.relays;
      if (a.length === 0) a = await i;
      else {
        const d = await Promise.race([i, new Promise((y) => setTimeout(() => y([]), Nu))]);
        d.length && (a = d);
      }
      const c = [.../* @__PURE__ */ new Set([...a, ...R])].slice(0, 16), l = Mn(c);
      try {
        const d = { signer: n, store: h, relays: l };
        return e === "ecashLoad" ? await mu(d) : e === "ecashSetMints" ? await bu({ ...d, newKey: () => $e(Qe()) }, t.mints) : await ku(d, t, () => self.postMessage({ notify: "ecash-sealed", id: o }));
      } finally {
        l.closeAll();
      }
    }
    case "vaultStatus":
      return u.signer ? u.connectionVaultRoot ? { enabled: !0, vaultPublicKey: nr().vaultPublicKey } : { enabled: !1, reason: u.vaultKnown ? "no-vault" : "stale-cache" } : { enabled: !1 };
    case "vaultList": {
      const { connections: n, rollbackWarnings: r, unreadable: s, truncated: i, quorumMet: a } = await $t();
      return { connections: n.map(et), rollbackWarnings: r, unreadable: s, truncated: i, quorumMet: a };
    }
    case "vaultSaveNwc": {
      const n = t, r = On(n.site), s = nr(), i = lo(n.uri), a = n.label.trim().slice(0, 120) || "Wallet connection", { record: c, event: l } = await s.createConnection({
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
        store: h
      })).success)
        throw new Error("The connection could not be saved to enough relays. Please try again.");
      const y = await s.decryptEvent(l);
      return et(y);
    }
    case "vaultFindForOrigin": {
      const n = On(t.site), { connections: r } = await $t(), s = r.find(
        (i) => i.record.connection_type === "nwc" && i.record.state === "active" && i.record.application_binding.origin === n
      );
      return { connection: s ? et(s) : null };
    }
    case "vaultRevealNwc": {
      const n = t, r = On(n.site), { connection: s } = await In(n.connectionId);
      if (s.record.connection_type !== "nwc" || s.record.state !== "active")
        throw new Error("That connection is not an active wallet connection.");
      const i = s.record.application_binding.origin;
      if (i !== null && i !== r)
        throw new Error("That connection belongs to a different site.");
      const a = s.record.credential;
      return qs(a), { uri: fl(a) };
    }
    case "vaultSetBinding": {
      const n = t, { vault: r, connection: s } = await In(n.connectionId), i = n.origin === null ? null : ue(), { record: a, event: c } = await r.updateConnection(s, {
        application_binding: { origin: i, app_pubkey: null }
      });
      if (!(await r.publish({
        event: c,
        connectionId: a.connection_id,
        relayUrls: R,
        store: h
      })).success) throw new Error("The change could not reach enough relays. Please try again.");
      const d = await r.decryptEvent(c);
      return et(d);
    }
    case "vaultDelete": {
      const n = t, { vault: r, connection: s } = await In(n.connectionId), { record: i, event: a } = await r.deleteConnection(s);
      if (!(await r.publish({
        event: a,
        connectionId: i.connection_id,
        relayUrls: R,
        store: h
      })).success) throw new Error("The deletion could not reach enough relays. Please try again.");
      try {
        const l = r.buildDeletionRequest(s.event.id), d = new T(R);
        await d.publishAll(l), d.closeAll();
      } catch {
      }
      return {};
    }
    case "vaultOfferCheck": {
      const n = t, r = ue(), s = lo(n.uri), { connections: i } = await $t(), a = i.find(
        (c) => c.record.connection_type === "nwc" && pl(c.record.credential, s)
      );
      return a ? a.record.application_binding.origin !== r ? { duplicate: !1 } : { duplicate: !0, connection: et(a) } : { duplicate: !1 };
    }
    default:
      throw new Error(`Unknown worker action: ${e}`);
  }
}
const Uu = /* @__PURE__ */ new Set([
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
  "guestStatus",
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
  if (typeof t.action != "string" || !Uu.has(t.action)) {
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
  (n.startsWith("nip46") || n === "ecashPeek" || n === "drivePeek" || n === "receiptsPeek" ? (i) => i() : (i) => Tu.run(Mu[n] ?? null, i))(() => xu(n, r, o)).then(
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
