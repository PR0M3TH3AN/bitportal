import { K as Ja, b as Ha, c as H, D as Ls, d as sn, w as S, f as fn, g as Ot, h as Fr, S as Nn, j as Mn, k as ht, l as Vt, B as za, m as Qa, n as On, o as It, q as qr, r as In, a as St, s as Ds, t as Ya, u as Xa } from "./bitlogin-shared-CDSZpiZ4.js";
import { g as K, s as Z, v as C, b as Ve, a as J, f as Ne, i as Za, j as ec, k as tc, l as nc, m as rc, n as Yn, o as Uo, p as xs, q as oc, t as sc, w as ic, x as Yt, y as Us, u as ee, z as ac, A as hn, B as Br, C as Wr, D as $s, E as cc, d as U, e as V, F as Vr, G as Fs, H as qs, h as Ln, I as Dn, J as lc, c as pt, K as pr, L as be } from "./bitlogin-shared-Cj9s0_W_.js";
import { al as jt, am as je, an as jr, ao as wr, ap as uc, aq as Kt, ar as At, as as Rt, at as Se, au as ke, av as Bs, aw as Ws, ax as Lt, ay as Gr, aa as Dt, y as pn, a7 as D, J as wn, az as pe, aA as we, Q as st, a6 as dc, z as Jr, V as Hr, a9 as Ee, a as at, k as zr, P as Vs, b as js, aB as Gs, aC as Js, aD as yc, aE as Hs, aF as $o, aG as fc, aH as xt, aI as qe, aJ as rt, aK as Qr, aL as hc, aM as pc, aN as zs, aO as Fo, aP as wc, aQ as vc, aR as gc, aS as mc, aT as Qs, aU as bc, aV as kc, aW as Ye, aX as Xe, aY as gt, aZ as Ec, a_ as qo, a$ as Bo, ah as _c, U as Pc, A as Xt, u as Wo, b0 as Sc, b1 as Kc, b2 as Ac, b3 as Rc, b4 as Cc, b5 as Tc, b6 as Nc, b7 as Mc, b8 as Oc, b9 as Ic, ba as Vo, bb as Lc, bc as Dc, bd as xc, be as Uc, bf as $c, bg as Fc, bh as Xn, bi as Zn, bj as jo, bk as qc, bl as Bc, bm as vr, bn as Go, bo as Jo, bp as Ho, bq as Ys, H as Wc, br as Xs, Y as Vc, Z as jc, bs as Gc, bt as Jc, bu as Hc, bv as zc, bw as Qc, bx as Yc, by as Xc, X as Zc, bz as el, bA as tl } from "./bitlogin-shared-BkXi7a9G.js";
import { e as Yr, a as Xr, b as Zr } from "./bitlogin-shared-PwbHDYud.js";
import { verifyDLEQProof as nl, pointFromHex as er, OutputData as rl, Amount as zo, deriveKeysetId as Qo, deriveBlindingFactor as ol, deriveSecret as sl, blindMessage as il, createSecretAndBlindingFactorDeriver as al } from "./bitlogin-shared-BooorIKj.js";
import { c as cl, e as Zs, n as ll, m as ul, f as gr, A as dl, g as vn, h as yl, r as fl, i as Yo } from "./bitlogin-shared-CBcVjlY7.js";
function ei(e) {
  const t = K(e.privateKey);
  return Z({
    pubkey: t,
    created_at: e.createdAt,
    kind: Ja,
    tags: [
      ["e", e.eventIdToDelete],
      ["k", String(e.deletedEventKind)]
    ],
    content: e.reason ?? ""
  }, e.privateKey);
}
function hl() {
  const e = globalThis.WebSocket;
  if (!e)
    throw new Error("No global WebSocket implementation is available in this environment.");
  return e;
}
const gn = 1e3, pl = 262144;
function wl(e) {
  const t = Math.min(e.limit ?? gn, gn);
  return Math.max(50, t * 3);
}
const vl = 2048, gl = 1e4, ml = 100;
function bl(e, t) {
  if (e.size >= vl) {
    const o = e.values().next().value;
    o !== void 0 && e.delete(o);
  }
  e.add(t);
}
class Gt {
  url;
  ws = null;
  connectPromise = null;
  subs = /* @__PURE__ */ new Map();
  pendingPublishes = /* @__PURE__ */ new Map();
  authPrivateKey;
  connectTimeoutMs;
  authenticated = !1;
  constructor(t, o = {}) {
    if (!jt(t))
      throw new Error("Relay URL must use secure WebSockets, except for an explicit loopback development endpoint.");
    this.url = t, this.authPrivateKey = o.authPrivateKey, this.connectTimeoutMs = o.connectTimeoutMs ?? 8e3;
  }
  async connect() {
    return this.connectPromise ? this.connectPromise : (this.connectPromise = new Promise((t, o) => {
      const n = hl(), r = new n(this.url);
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
    if (t.length > pl)
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
        if (d - a.liveWindowStart >= gl && (a.liveWindowStart = d, a.liveVerifies = 0), a.liveVerifies >= ml || (a.liveVerifies++, !C(i) || !Xo(i, a.filter)))
          return;
        bl(a.seenIds, i.id), a.onEvent(i);
        return;
      }
      const l = Math.min(a.filter.limit ?? gn, gn);
      if (a.events.length >= l || a.verifyBudget <= 0 || (a.verifyBudget--, !C(i) || !Xo(i, a.filter)))
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
    const o = K(this.authPrivateKey), n = Z({
      pubkey: o,
      created_at: Math.floor(Date.now() / 1e3),
      kind: Ha,
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
    const n = Ve(J(8));
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
    const n = Ve(J(8));
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
        verifyBudget: wl(t),
        liveWindowStart: 0,
        liveVerifies: 0,
        filter: t,
        onEose: () => a()
      }), this.send(["REQ", n, t]);
    });
  }
}
function Xo(e, t) {
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
const Zo = "Not waited for: it didn't answer a moment ago.";
class N {
  connections = /* @__PURE__ */ new Map();
  kept;
  notWaitedFor;
  heard;
  constructor(t, o = {}) {
    this.kept = !!o.connectionFor, this.notWaitedFor = o.notWaitedFor ?? (() => !1), this.heard = o.heard ?? (() => {
    });
    for (const n of new Set(t))
      this.connections.set(n, o.connectionFor ? o.connectionFor(n) : new Gt(n, o));
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
    return t.map(([r]) => ({ relayUrl: r, result: { ok: !1, message: Zo } }));
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
    })), ...r.map(([l]) => ({ relayUrl: l, events: [], responded: !1, error: Zo }))], a = i.filter((l) => l.responded).length, c = i.length;
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
      const h = () => {
        f || (f = !0, y && clearTimeout(y), c([...s.map(([p]) => l.get(p) ?? { relayUrl: p, result: { ok: !1, message: "Not waited for." } }), ...a]));
      };
      if (s.length === 0)
        return h();
      for (const [p, w] of s)
        w.publish(t, o).then((m) => (this.heard(p, !m.message.startsWith("timeout")), { relayUrl: p, result: m }), (m) => (this.heard(p, !1), { relayUrl: p, result: { ok: !1, message: m.message } })).then((m) => {
          if (!f) {
            if (l.set(p, m), m.result.ok && d++, l.size === s.length)
              return h();
            d >= Math.min(n, s.length) && !y && (y = setTimeout(h, r));
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
function Y(e) {
  return e.filter((t) => t.result.ok).length;
}
const Jt = null, ti = [
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
], ni = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  // Added 2026-11-18: relay.nostr.band timed out and nostr-pub.wellorder.net
  // never connected in the same measurement, leaving two working lookups.
  "wss://nos.lol"
], kl = [], El = /^[0-9a-f]{64}$/u, _l = 64;
function tr(e) {
  return Array.isArray(e) && e.length <= _l && e.every((t) => typeof t == "string" && jt(t)) && new Set(e).size === e.length;
}
function xn(e, t = Jt, o = -1) {
  if (!t || !El.test(t) || /^0{64}$/u.test(t) || !C(e) || e.pubkey !== t || e.kind !== H || Ne(e, "d") !== Ls)
    return null;
  try {
    const n = JSON.parse(e.content);
    if (typeof n != "object" || n === null || Array.isArray(n))
      return null;
    const r = n;
    return !Number.isSafeInteger(r.version) || r.version < 1 || r.version <= o || !tr(r.vaultRelays) || !tr(r.discoveryRelays) || r.deprecated !== void 0 && !tr(r.deprecated) ? null : {
      version: r.version,
      vaultRelays: r.vaultRelays,
      discoveryRelays: r.discoveryRelays,
      ...r.deprecated === void 0 ? {} : { deprecated: r.deprecated }
    };
  } catch {
    return null;
  }
}
function Pl(e) {
  return Math.max(0, e - 1);
}
function es(e, t, o) {
  const n = t ? o === "vault" ? t.vaultRelays : t.discoveryRelays : [], r = new Set(t?.deprecated ?? []), s = new Set(e), i = [...new Set(n)].filter((a) => !r.has(a) && !s.has(a)).slice(0, Pl(e.length));
  return [...e, ...i];
}
async function Sl(e, t = Jt, o = -1, n = 6e3) {
  if (!t || e.length === 0)
    return null;
  const r = new N([...e]);
  let s;
  try {
    s = (await r.queryQuorum({ kinds: [H], authors: [t], "#d": [Ls], limit: 3 }, n)).outcomes.flatMap((c) => c.events);
  } finally {
    r.closeAll();
  }
  let i = null;
  for (const a of s) {
    const c = xn(a, t, o);
    c && (!i || c.version > i.list.version) && (i = { event: a, list: c });
  }
  return i;
}
const ri = "bitlogin:bootstrap-relays:v1";
async function oi(e, t = Jt) {
  if (!t)
    return null;
  try {
    const o = await e.get(ri);
    return o ? xn(JSON.parse(o), t) : null;
  } catch {
    return null;
  }
}
function an(e) {
  return {
    vaultRelays: es(ti, e, "vault"),
    discoveryRelays: es(ni, e, "discovery"),
    listVersion: e?.version ?? null
  };
}
async function Kl(e, t = {}) {
  const o = t.maintainerPubkeyHex === void 0 ? Jt : t.maintainerPubkeyHex, n = await oi(e, o);
  if (!o)
    return an(null);
  const r = an(n), s = n?.version ?? -1;
  try {
    let i = await Sl(t.queryRelayUrls ?? [.../* @__PURE__ */ new Set([...r.vaultRelays, ...r.discoveryRelays])], o, s, t.timeoutMs);
    if (!i) {
      const a = await Al(t.httpsFallbackUrls ?? kl, o, s), c = a ? xn(a, o, s) : null;
      a && c && (i = { event: a, list: c });
    }
    return i ? (await e.set(ri, JSON.stringify(i.event)), an(i.list)) : r;
  } catch {
    return r;
  }
}
async function Al(e, t = Jt, o = -1) {
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
      if (C(a) && xn(a, t, o))
        return a;
    } catch {
    }
  return null;
}
const eo = /^[0-9a-f]{64}$/u, Rl = 8, Cl = 4096, Tl = 256, Nl = 512;
class Ze extends Error {
  name = "BunkerUriParseError";
}
class Ml extends Error {
  name = "Nip46RequestTimeoutError";
  constructor(t, o) {
    super(`The remote signer did not answer ${t} within ${Math.round(o / 1e3)}s. It may be offline, or waiting for your approval on another device -- check your signer and try again.`);
  }
}
class Ol extends Error {
  name = "Nip46ErrorResponse";
}
function Il(e) {
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return null;
  }
  const o = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol === "https:" || t.protocol === "http:" && o ? t.toString() : null;
}
function Ll(e) {
  if (e.length > Cl)
    throw new Ze("That bunker URI is unreasonably long.");
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    throw new Ze("That doesn't look like a valid URI.");
  }
  if (t.protocol !== "bunker:")
    throw new Ze("A remote-signer URI must start with bunker://");
  const o = (t.host || t.pathname.replace(/^\/+/u, "")).toLowerCase();
  if (!eo.test(o))
    throw new Ze("The bunker URI does not name a valid signer public key.");
  const n = [
    ...new Set(t.searchParams.getAll("relay").map((s) => s.trim()).filter((s) => s.length > 0 && s.length <= Nl))
  ].slice(0, Rl);
  if (n.length === 0)
    throw new Ze("The bunker URI names no relays -- without at least one relay= parameter there is no way to reach the signer.");
  const r = t.searchParams.get("secret") ?? void 0;
  if (r && r.length > Tl)
    throw new Ze("The bunker URI's secret is unreasonably long.");
  return { signerPubkey: o, relayUrls: n, secret: r || void 0 };
}
function Dl(e) {
  if (!eo.test(e.clientPubkey))
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
const xl = 12e4;
class ts {
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
    this.clientSecretKey = t.clientSecretKey, this.clientPubkey = K(t.clientSecretKey), this.pointer = t.pointer, this.conversationKey = je(t.clientSecretKey, t.pointer.signerPubkey), this.onAuthUrl = t.onAuthUrl, this.requestTimeoutMs = t.requestTimeoutMs ?? xl, this.conns = t.pointer.relayUrls.map((o) => new Gt(o, { authPrivateKey: t.clientSecretKey }));
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
        kinds: [sn],
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
      o = JSON.parse(jr(this.conversationKey, t.content));
    } catch {
      return;
    }
    if (typeof o.id != "string")
      return;
    const n = this.pending.get(o.id);
    if (n) {
      if (o.result === "auth_url") {
        if (!n.authUrlSeen && typeof o.error == "string" && o.error) {
          const r = Il(o.error);
          r && (n.authUrlSeen = !0, this.onAuthUrl?.(r));
        }
        return;
      }
      if (this.pending.delete(o.id), clearTimeout(n.timer), typeof o.error == "string" && o.error) {
        n.reject(new Ol(o.error));
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
    const n = Ve(J(8)), r = wr(this.conversationKey, JSON.stringify({ id: n, method: t, params: o })), s = [["p", this.pointer.signerPubkey]], i = Z({
      pubkey: this.clientPubkey,
      created_at: Math.floor(Date.now() / 1e3),
      kind: sn,
      tags: s,
      content: r
    }, this.clientSecretKey), a = new Promise((d, y) => {
      const f = setTimeout(() => {
        this.pending.delete(n), y(new Ml(t, this.requestTimeoutMs));
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
    if (!eo.test(t))
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
      const t = Ve(J(8)), o = wr(this.conversationKey, JSON.stringify({ id: t, method: "logout", params: [] }));
      return Z({
        pubkey: this.clientPubkey,
        created_at: Math.floor(Date.now() / 1e3),
        kind: sn,
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
async function Ul(e) {
  const t = K(e.clientSecretKey), o = e.timeoutMs, n = e.relayUrls.map((s) => new Gt(s, { authPrivateKey: e.clientSecretKey })), r = () => {
    for (const s of n)
      s.close();
  };
  return new Promise((s, i) => {
    let a = !1;
    const c = () => l(new Error("The signer-connection attempt was cancelled.")), l = (h) => {
      a || (a = !0, clearTimeout(d), e.signal?.removeEventListener("abort", c), r(), h instanceof Error ? i(h) : s(h));
    }, d = setTimeout(() => l(new Error(`No signer connected within ${Math.round(o / 1e3)}s. Scan or paste the connection code in your signer app, then try again.`)), o);
    if (e.signal?.aborted) {
      c();
      return;
    }
    e.signal?.addEventListener("abort", c, { once: !0 });
    const y = { kinds: [sn], "#p": [t] }, f = (h) => {
      let p, w = null;
      try {
        w = je(e.clientSecretKey, h.pubkey), p = JSON.parse(jr(w, h.content));
      } catch {
        return;
      } finally {
        w && S(w);
      }
      p.result === e.secret && l({ signerPubkey: h.pubkey });
    };
    Promise.allSettled(n.map((h) => h.subscribeLive(y, f))).then((h) => {
      h.some((p) => p.status === "fulfilled") || l(new Error("Could not reach any relay to listen for the signer."));
    });
  });
}
function to() {
  const e = globalThis.crypto;
  if (!e || !e.subtle)
    throw new Error("WebCrypto SubtleCrypto is not available in this environment.");
  return e;
}
async function si(e) {
  if (e.length !== 32)
    throw new Error("AES-256-GCM key must be exactly 32 bytes.");
  return to().subtle.importKey("raw", e, "AES-GCM", !1, ["encrypt", "decrypt"]);
}
async function ii(e, t, o) {
  const n = Za(), r = await si(e), s = await to().subtle.encrypt({ name: "AES-GCM", iv: n, additionalData: o, tagLength: 128 }, r, t);
  return { nonce: n, ciphertext: new Uint8Array(s) };
}
async function ai(e, t, o, n) {
  const r = await si(e);
  try {
    const s = await to().subtle.decrypt({ name: "AES-GCM", iv: t, additionalData: n, tagLength: 128 }, r, o);
    return new Uint8Array(s);
  } catch {
    throw new Error("AES-256-GCM authentication failed: capsule is corrupted, tampered, or the wrong key was used.");
  }
}
const ci = `abandon
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
function $l(e, t, o, n) {
  nc(e);
  const r = rc({ dkLen: 32, asyncTick: 10 }, n), { c: s, dkLen: i, asyncTick: a } = r;
  if (Yn(s), Yn(i), Yn(a), s < 1)
    throw new Error("iterations (c) should be >= 1");
  const c = Uo(t), l = Uo(o), d = new Uint8Array(i), y = xs.create(e, c), f = y._cloneInto().update(l);
  return { c: s, dkLen: i, asyncTick: a, DK: d, PRF: y, PRFSalt: f };
}
function Fl(e, t, o, n, r) {
  return e.destroy(), t.destroy(), n && n.destroy(), oc(r), o;
}
async function ql(e, t, o, n) {
  const { c: r, dkLen: s, asyncTick: i, DK: a, PRF: c, PRFSalt: l } = $l(e, t, o, n);
  let d;
  const y = new Uint8Array(4), f = ec(y), h = new Uint8Array(c.outputLen);
  for (let p = 1, w = 0; w < s; p++, w += c.outputLen) {
    const m = a.subarray(w, w + c.outputLen);
    f.setInt32(0, p, !1), (d = l._cloneInto(d)).update(y).digestInto(h), m.set(h.subarray(0, m.length)), await tc(r - 1, i, () => {
      c._cloneInto(d).update(h).digestInto(h);
      for (let v = 0; v < m.length; v++)
        m[v] ^= h[v];
    });
  }
  return Fl(c, l, a, d, h);
}
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const Bl = (e) => e[0] === "あいこくしん";
function li(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function ui(e) {
  const t = li(e), o = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(o.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: o };
}
function di(e) {
  ic(e, 16, 20, 24, 28, 32);
}
const Wl = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([Us(e)[0] >> t << t]);
};
function yi(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), Yt.chain(Yt.checksum(1, Wl), Yt.radix2(11, !0), Yt.alphabet(e));
}
function Vl(e, t) {
  const { words: o } = ui(e), n = yi(t).decode(o);
  return di(n), n;
}
function jl(e, t) {
  return di(e), yi(t).encode(e).join(Bl(t) ? "　" : " ");
}
function Gl(e, t) {
  try {
    Vl(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const Jl = (e) => li("mnemonic" + e);
function Hl(e, t = "") {
  return ql(sc, ui(e).nfkd, Jl(t), { c: 2048, dkLen: 64 });
}
function fi(e) {
  if (e.length !== 16)
    throw new Error("Recovery phrase entropy must be exactly 128 bits (16 bytes).");
  return jl(e, ci);
}
function no(e) {
  try {
    return Gl(mn(e), ci);
  } catch {
    return !1;
  }
}
function mn(e) {
  return e.trim().normalize("NFKD").toLowerCase().split(/\s+/u).join(" ");
}
async function Un(e) {
  return Hl(mn(e), "");
}
const cn = [1024, 2048, 4096], Be = 4;
function zl(e) {
  const t = Be + e.length, o = cn.find((s) => s >= t);
  if (o === void 0)
    throw new Error(`Payload of ${e.length} bytes exceeds the largest padding bucket (${cn[cn.length - 1]} bytes minus ${Be}-byte length prefix).`);
  const n = new Uint8Array(o);
  return new DataView(n.buffer).setUint32(0, e.length, !1), n.set(e, Be), n;
}
function Ql(e) {
  if (!cn.includes(e.length))
    throw new Error(`Padded plaintext length ${e.length} does not match a known bucket.`);
  const o = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !1);
  if (o > e.length - Be)
    throw new Error("Declared payload length exceeds the padded bucket size.");
  const n = e.slice(Be, Be + o), r = e.slice(Be + o);
  for (const s of r)
    if (s !== 0)
      throw new Error("Padding bytes are not all zero; capsule plaintext is malformed.");
  return n;
}
function Yl(e) {
  const t = ac(e);
  if (t === void 0)
    throw new Error("Value is not JSON-serializable for canonicalization.");
  return t;
}
function Xl(e) {
  return ee(Yl(e));
}
const Te = 16, Zl = 283;
function eu(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function ro(e) {
  return e << 1 ^ Zl & -(e >> 7);
}
function ot(e, t) {
  let o = 0;
  for (; t > 0; t >>= 1)
    o ^= e & -(t & 1), e = ro(e);
  return o;
}
const mr = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let o = 0, n = 1; o < 256; o++, n ^= ro(n))
    e[o] = n;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let o = 0; o < 255; o++) {
    let n = e[255 - o];
    n |= n << 8, t[e[o]] = (n ^ n >> 4 ^ n >> 5 ^ n >> 6 ^ n >> 7 ^ 99) & 255;
  }
  return Lt(e), t;
})(), tu = /* @__PURE__ */ mr.map((e, t) => mr.indexOf(t)), nu = (e) => e << 24 | e >>> 8, nr = (e) => e << 8 | e >>> 24;
function hi(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const o = new Uint32Array(256).map((l, d) => t(e[d])), n = o.map(nr), r = n.map(nr), s = r.map(nr), i = new Uint32Array(256 * 256), a = new Uint32Array(256 * 256), c = new Uint16Array(256 * 256);
  for (let l = 0; l < 256; l++)
    for (let d = 0; d < 256; d++) {
      const y = l * 256 + d;
      i[y] = o[l] ^ n[d], a[y] = r[l] ^ s[d], c[y] = e[l] << 8 | e[d];
    }
  return { sbox: e, sbox2: c, T0: o, T1: n, T2: r, T3: s, T01: i, T23: a };
}
const oo = /* @__PURE__ */ hi(mr, (e) => ot(e, 3) << 24 | e << 16 | e << 8 | ot(e, 2)), pi = /* @__PURE__ */ hi(tu, (e) => ot(e, 11) << 24 | ot(e, 13) << 16 | ot(e, 9) << 8 | ot(e, 14)), ru = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, o = 1; t < 16; t++, o = ro(o))
    e[t] = o;
  return e;
})();
function wi(e) {
  Gr(e);
  const t = e.length;
  eu(e);
  const { sbox2: o } = oo, n = [];
  (!Kt || !At(e)) && n.push(e = Rt(e));
  const r = ke(Se(e)), s = r.length, i = (c) => se(o, c, c, c, c), a = new Uint32Array(t + 28);
  a.set(r);
  for (let c = s; c < a.length; c++) {
    let l = a[c - 1];
    c % s === 0 ? l = i(nu(l)) ^ ru[c / s - 1] : s > 6 && c % s === 4 && (l = i(l)), a[c] = a[c - s] ^ l;
  }
  return Lt(...n), a;
}
function ou(e) {
  const t = wi(e), o = t.slice(), n = t.length, { sbox2: r } = oo, { T0: s, T1: i, T2: a, T3: c } = pi;
  for (let l = 0; l < n; l += 4)
    for (let d = 0; d < 4; d++)
      o[l + d] = t[n - l - 4 + d];
  Lt(t);
  for (let l = 4; l < n - 4; l++) {
    const d = o[l], y = se(r, d, d, d, d);
    o[l] = s[y & 255] ^ i[y >>> 8 & 255] ^ a[y >>> 16 & 255] ^ c[y >>> 24];
  }
  return o;
}
function Ke(e, t, o, n, r, s) {
  return e[o << 8 & 65280 | n >>> 8 & 255] ^ t[r >>> 8 & 65280 | s >>> 24 & 255];
}
function se(e, t, o, n, r) {
  return e[t & 255 | o & 65280] | e[n >>> 16 & 255 | r >>> 16 & 65280] << 16;
}
function ns(e, t, o, n, r) {
  const { sbox2: s, T01: i, T23: a } = oo;
  let c = 0;
  t ^= e[c++], o ^= e[c++], n ^= e[c++], r ^= e[c++];
  const l = e.length / 4 - 2;
  for (let p = 0; p < l; p++) {
    const w = e[c++] ^ Ke(i, a, t, o, n, r), m = e[c++] ^ Ke(i, a, o, n, r, t), v = e[c++] ^ Ke(i, a, n, r, t, o), b = e[c++] ^ Ke(i, a, r, t, o, n);
    t = w, o = m, n = v, r = b;
  }
  const d = e[c++] ^ se(s, t, o, n, r), y = e[c++] ^ se(s, o, n, r, t), f = e[c++] ^ se(s, n, r, t, o), h = e[c++] ^ se(s, r, t, o, n);
  return { s0: d, s1: y, s2: f, s3: h };
}
function su(e, t, o, n, r) {
  const { sbox2: s, T01: i, T23: a } = pi;
  let c = 0;
  t ^= e[c++], o ^= e[c++], n ^= e[c++], r ^= e[c++];
  const l = e.length / 4 - 2;
  for (let p = 0; p < l; p++) {
    const w = e[c++] ^ Ke(i, a, t, r, n, o), m = e[c++] ^ Ke(i, a, o, t, r, n), v = e[c++] ^ Ke(i, a, n, o, t, r), b = e[c++] ^ Ke(i, a, r, n, o, t);
    t = w, o = m, n = v, r = b;
  }
  const d = e[c++] ^ se(s, t, r, n, o), y = e[c++] ^ se(s, o, t, r, n), f = e[c++] ^ se(s, n, o, t, r), h = e[c++] ^ se(s, r, n, o, t);
  return { s0: d, s1: y, s2: f, s3: h };
}
function iu(e) {
  if (Gr(e), e.length % Te !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + Te);
}
function au(e, t, o) {
  Gr(e);
  let n = e.length;
  const r = n % Te;
  if (!t && r !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (t) {
    let a = Te - r;
    a || (a = Te), n = n + a;
  }
  o = Bs(n, o), Ws(e, o), (!Kt || !At(e)) && (e = Rt(e));
  const s = Se(e);
  ke(s);
  const i = Se(o);
  return { b: s, o: i, out: o };
}
function cu(e, t) {
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
function lu(e) {
  const t = new Uint8Array(16), o = Se(t);
  t.set(e);
  const n = Te - e.length;
  for (let r = Te - n; r < Te; r++)
    t[r] = n;
  return o;
}
const vi = /* @__PURE__ */ uc({ blockSize: 16, nonceLength: 16 }, function(t, o, n = {}) {
  const r = !n.disablePadding;
  return {
    encrypt(s, i) {
      const a = wi(t), { b: c, o: l, out: d } = au(s, r, i);
      let y = o;
      const f = [a];
      (!Kt || !At(y)) && f.push(y = Rt(y));
      const h = Se(y);
      ke(h);
      let p = h[0], w = h[1], m = h[2], v = h[3], b = 0;
      for (; b + 4 <= c.length; )
        p ^= c[b + 0], w ^= c[b + 1], m ^= c[b + 2], v ^= c[b + 3], { s0: p, s1: w, s2: m, s3: v } = ns(a, p, w, m, v), l[b++] = p, l[b++] = w, l[b++] = m, l[b++] = v;
      if (r) {
        const _ = lu(s.subarray(b * 4));
        ke(_), p ^= _[0], w ^= _[1], m ^= _[2], v ^= _[3], { s0: p, s1: w, s2: m, s3: v } = ns(a, p, w, m, v), l[b++] = p, l[b++] = w, l[b++] = m, l[b++] = v;
      }
      return ke(l), Lt(...f), d;
    },
    decrypt(s, i) {
      iu(s);
      const a = ou(t);
      let c = o;
      const l = [a];
      (!Kt || !At(c)) && l.push(c = Rt(c));
      const d = Se(c);
      ke(d), i = Bs(s.length, i), Ws(s, i), (!Kt || !At(s)) && l.push(s = Rt(s));
      const y = Se(s), f = Se(i);
      ke(y);
      let h = d[0], p = d[1], w = d[2], m = d[3];
      for (let v = 0; v + 4 <= y.length; ) {
        const b = h, _ = p, k = w, M = m;
        h = y[v + 0], p = y[v + 1], w = y[v + 2], m = y[v + 3];
        const { s0: O, s1: G, s2: x, s3: $ } = su(a, h, p, w, m);
        f[v++] = O ^ b, f[v++] = G ^ _, f[v++] = x ^ k, f[v++] = $ ^ M;
      }
      return ke(f), Lt(...l), cu(i, r);
    }
  };
});
function gi(e, t) {
  const o = Wr(new Uint8Array([2]), $s(t));
  return cc.getSharedSecret(e, o, !0).slice(1, 33);
}
function uu(e, t, o) {
  return du(e, t, o, J(16));
}
function du(e, t, o, n) {
  if (n.length !== 16)
    throw new Error("NIP-04 iv must be exactly 16 bytes.");
  const r = gi(e, t), s = vi(r, n).encrypt(ee(o));
  return `${hn.encode(s)}?iv=${hn.encode(n)}`;
}
function yu(e, t, o) {
  const n = o.indexOf("?iv=");
  if (n === -1)
    throw new Error('NIP-04 payload is missing its "?iv=" suffix.');
  const r = hn.decode(o.slice(0, n)), s = hn.decode(o.slice(n + 4)), i = gi(e, t), a = vi(i, s).decrypt(r);
  return Br(a);
}
class Je extends Error {
  reason;
  constructor(t) {
    super("Account not found or credentials incorrect."), this.name = "AccountNotFoundError", this.reason = t;
  }
}
class rs extends Error {
  reason;
  /** For "unreached": how many listed relays couldn't be reached. */
  unreached;
  /** The reason, as a code that crosses a worker's boundary. */
  code;
  constructor(t, o = 0) {
    super(t === "slow" ? "Some of your relays didn't answer in time, so your account couldn't be read. Try again." : `Your account wasn't on the relays that answered, but ${o} of your relays couldn't be reached. Try again.`), this.name = "RelaysSlowError", this.reason = t, this.code = t, this.unreached = o;
  }
}
class de extends Error {
  constructor(t) {
    super(t), this.name = "RegistrationFailedError";
  }
}
class mi extends Error {
  constructor(t = "An account already exists with this login name and password. Sign in instead, or choose different credentials.") {
    super(t), this.name = "AccountAlreadyExistsError";
  }
}
class Ae extends Error {
  constructor(t) {
    super(t), this.name = "RecoveryFailedError";
  }
}
class bi extends Error {
  seenGeneration;
  capsuleGeneration;
  constructor(t, o) {
    super(`This credential capsule reports generation ${o}, but this device has already seen generation ${t}. Refusing to log in with older, possibly-revoked credentials.`), this.name = "RollbackDetectedError", this.seenGeneration = t, this.capsuleGeneration = o;
  }
}
function Ut(e, t) {
  const o = t ?? Math.floor(Date.now() / 1e3);
  return e == null ? o : Math.max(o, e + 1);
}
const fu = { generation: -1, recoveryGeneration: -1 };
function so(e) {
  return `bitlogin:hwm:${e}`;
}
async function io(e, t) {
  const o = await e.get(so(t));
  return o ? JSON.parse(o) : fu;
}
async function ki(e, t, o) {
  const n = await io(e, t), r = {
    generation: Math.max(n.generation, o.generation ?? -1),
    recoveryGeneration: Math.max(n.recoveryGeneration, o.recoveryGeneration ?? -1)
  };
  return await e.set(so(t), JSON.stringify(r)), r;
}
async function hu(e, t, o = { generation: 0, recoveryGeneration: -1 }) {
  await e.set(so(t), JSON.stringify(o));
}
function pu(e, t, o) {
  return Z({ pubkey: K(e), created_at: o, kind: fn, tags: [], content: JSON.stringify(t) }, e);
}
function wu(e, t, o) {
  const n = t.map((r) => {
    const s = ["r", r.url];
    return r.read && !r.write && s.push("read"), r.write && !r.read && s.push("write"), s;
  });
  return Z({ pubkey: K(e), created_at: o, kind: Ot, tags: n, content: "" }, e);
}
function vu(e, t, o) {
  return Z({
    pubkey: K(e),
    created_at: o,
    kind: Fr,
    tags: t.map((n) => ["relay", n]),
    content: ""
  }, e);
}
function gu(e) {
  return e.tags.filter((t) => t[0] === "r" && t[1]).map((t) => t[1]);
}
function mu(e) {
  return e.tags.filter((t) => t[0] === "relay" && t[1]).map((t) => t[1]);
}
async function bu(e) {
  const t = K(e.everydayPrivateKey), o = Math.floor(Date.now() / 1e3), n = [.../* @__PURE__ */ new Set([...e.generalRelays, ...e.dmRelays, ...e.discoveryRelays])], r = new N(n), [s, i, a] = await Promise.all([
    r.queryQuorum({ authors: [t], kinds: [fn] }),
    r.queryQuorum({ authors: [t], kinds: [Ot] }),
    r.queryQuorum({ authors: [t], kinds: [Fr] })
  ]);
  r.closeAll();
  const c = s.outcomes.some((m) => m.events.length > 0), l = i.outcomes.some((m) => m.events.length > 0), d = a.outcomes.some((m) => m.events.length > 0), y = new N(n);
  let f = null, h = null, p = null;
  const w = [];
  if (!c && (e.name || e.about || e.picture)) {
    const m = pu(e.everydayPrivateKey, { name: e.name, about: e.about, picture: e.picture }, o);
    w.push(y.publishAll(m).then((v) => void (f = v)));
  }
  if (!l) {
    const m = wu(e.everydayPrivateKey, e.generalRelays.map((v) => ({ url: v, read: !0, write: !0 })), o);
    w.push(y.publishAll(m).then((v) => void (h = v)));
  }
  if (!d) {
    const m = vu(e.everydayPrivateKey, e.dmRelays, o);
    w.push(y.publishAll(m).then((v) => void (p = v)));
  }
  return await Promise.all(w), y.closeAll(), {
    profilePublished: f !== null && Y(f) > 0,
    relayListAcknowledgedCount: h !== null ? Y(h) : 0,
    dmRelayListAcknowledgedCount: p !== null ? Y(p) : 0,
    profileSkippedExisting: c,
    relayListSkippedExisting: l,
    dmRelayListSkippedExisting: d
  };
}
async function He(e, t, o) {
  const n = o.minAcks ?? 2, r = o.minReadbacks ?? 2, s = await e.publishAll(t, o.timeoutMs), i = Y(s), c = (await e.queryQuorum({ kinds: [H], authors: [t.pubkey], "#d": [o.dTag], limit: 5 }, o.timeoutMs)).outcomes.filter((l) => l.events.some((d) => d.id === t.id)).length;
  return {
    acknowledgedCount: i,
    readbackVerifiedCount: c,
    success: i >= n && c >= r
  };
}
function Ei(e) {
  return ee(`bitlogin|password-capsule|v1|${e}|30078|bitlogin:password:v1`);
}
function _i(e) {
  return ee(`bitlogin|recovery-capsule|v1|${e}|30078|bitlogin:recovery:v1`);
}
async function ao(e, t, o) {
  const n = Xl(e), r = zl(n), s = await ii(t, r, o);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    nonce: U(s.nonce),
    ciphertext: U(s.ciphertext)
  };
}
async function co(e, t, o) {
  if (e.version !== 1 || e.algorithm !== "aes-256-gcm")
    throw new Error(`Unsupported capsule envelope version/algorithm: ${e.version}/${e.algorithm}`);
  const n = V(e.nonce), r = V(e.ciphertext), s = await ai(t, n, r, o), i = Ql(s);
  return JSON.parse(Br(i));
}
class lo extends Error {
  constructor(t) {
    super(t), this.name = "CapsuleValidationError";
  }
}
const ku = 1e6, Eu = /^[0-9a-f]{64}$/u;
function I(e, t) {
  if (!e)
    throw new lo(t);
}
function bn(e) {
  return typeof e == "string" && Eu.test(e);
}
function Pi(e) {
  I(Array.isArray(e), "vault_relay_hints must be an array (§12.4.7).");
  for (const t of e)
    I(typeof t == "string", "Each relay hint must be a string (§12.4.7)."), I(jt(t), `Relay URL must use secure WebSockets, except for an explicit loopback development endpoint (§12.4.7): ${t}`);
}
function Si(e) {
  I(typeof e == "string", "account_id must be a string (§12.4.2).");
  let t;
  try {
    t = V(e);
  } catch {
    throw new lo("account_id is not valid base64url (§12.4.2).");
  }
  I(t.length === 16, "account_id must decode to exactly 128 bits (§12.4.2).");
}
function Ki(e, t) {
  I(typeof e == "string", "operational_private_key must be a string (§12.4.3).");
  const o = V(e);
  I(o.length === 32, "operational_private_key must be exactly 32 bytes (§12.4.3)."), I(Vr(o), "operational_private_key is not a valid secp256k1 scalar (§12.4.3)."), I(bn(t), "operational_public_key must be lowercase 64-char hex (§12.4.4).");
  const n = K(o);
  I(n === t, "operational_public_key does not match the derived public key (§12.4.4).");
}
function kn(e, t) {
  I(typeof t == "string", `${e} must be a string (§CV5.2).`);
  let o;
  try {
    o = V(t);
  } catch {
    throw new lo(`${e} is not valid base64url (§CV5.2).`);
  }
  I(o.length === 32, `${e} must decode to exactly 32 bytes (§CV5.2).`);
}
function _u(e) {
  const t = e.connection_vault_root, o = e.vault_sudo_key;
  t === void 0 && o === void 0 || (I(t !== void 0 && o !== void 0, "connection_vault_root and vault_sudo_key must appear together (§CV5.2)."), kn("connection_vault_root", t), kn("vault_sudo_key", o));
}
function Pu(e) {
  const t = e.connection_vault_root, o = e.vault_sudo_key;
  t === void 0 && o === void 0 || (I(t !== void 0, "vault_sudo_key cannot appear without connection_vault_root (§CV5.2)."), kn("connection_vault_root", t), o !== void 0 && kn("vault_sudo_key", o));
}
function Ai(e, t) {
  I(Number.isInteger(e) && e >= 0 && e <= ku, `${t} is out of supported bounds (§12.4.8).`);
}
function Su(e) {
  I(e.schema === Mn, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), Si(e.account_id), Ai(e.generation, "generation"), Ki(e.operational_private_key, e.operational_public_key), I(bn(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex (§12.4.5)."), Pi(e.vault_relay_hints), Pu(e);
  const t = e.recovery_capsule_event;
  I(!!t && typeof t == "object", "recovery_capsule_event must be present (§12.4.6)."), I(C(t), "Embedded recovery_capsule_event has an invalid event id or signature (§12.4.6)."), I(t.pubkey === e.recovery_public_key, "Embedded recovery_capsule_event author does not match recovery_public_key (§12.4.5).");
}
function Ku(e) {
  I(e.schema === Nn, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), Si(e.account_id), Ai(e.recovery_generation, "recovery_generation"), I(e.previous_recovery_event_id === null || bn(e.previous_recovery_event_id), "previous_recovery_event_id must be null or lowercase 64-char hex (§12.3)."), Ki(e.operational_private_key, e.operational_public_key), I(bn(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex."), Pi(e.vault_relay_hints), _u(e);
}
function Au(e) {
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
async function uo(e) {
  const t = K(e.locatorPrivateKey), o = await ao(e.payload, e.capsuleKey, Ei(t));
  return Z({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: H,
    tags: [["d", ht]],
    content: JSON.stringify(o)
  }, e.locatorPrivateKey);
}
function Ru(e) {
  const t = K(e.oldLocatorPrivateKey);
  return Z({
    pubkey: t,
    created_at: e.createdAt,
    kind: H,
    tags: [["d", ht]],
    content: ""
  }, e.oldLocatorPrivateKey);
}
async function Cu(e, t) {
  if (!C(e))
    throw new Error("Credential capsule event has an invalid id or signature.");
  const o = JSON.parse(e.content), n = await co(o, t, Ei(e.pubkey));
  return Su(n), n;
}
async function yo(e) {
  const t = K(e.recoveryPrivateKey), o = await ao(e.payload, e.capsuleKey, _i(t));
  return Z({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: H,
    tags: [["d", Vt]],
    content: JSON.stringify(o)
  }, e.recoveryPrivateKey);
}
async function Ri(e, t) {
  if (!C(e))
    throw new Error("Recovery capsule event has an invalid id or signature.");
  const o = JSON.parse(e.content), n = await co(o, t, _i(e.pubkey));
  return Ku(n), n;
}
function Tu(e) {
  return e.responded ? "answered" : /connecting to relay|Not connected to relay|Not waited for/u.test(e.error ?? "") ? "not-asked" : "slow";
}
function rr(e, t, o) {
  const n = /* @__PURE__ */ new Map();
  for (const r of e)
    r.pubkey === t && r.kind === H && Ne(r, "d") === o && C(r) && n.set(r.id, r);
  return [...n.values()].sort((r, s) => s.created_at - r.created_at);
}
async function Ci(e, t, o, n, r) {
  const s = await e.queryQuorum({ kinds: [H], authors: [t], "#d": [o], limit: 5 }, r), i = s.outcomes.flatMap((f) => f.events), a = rr(i, t, o), c = [];
  for (const f of a)
    try {
      const h = await n(f);
      c.push({ event: f, payload: h });
    } catch (h) {
      c.push({ event: f, payload: null, error: h.message });
    }
  const l = c.find((f) => f.payload !== null) ?? null, d = s.outcomes.map((f) => ({
    responded: f.responded,
    events: rr(f.events, t, o)
  })).filter((f) => f.responded && f.events.length > 0).map((f) => f.events[0].id), y = new Set(d).size > 1;
  return {
    quorumMet: s.quorumMet,
    respondedCount: s.respondedCount,
    totalCount: s.totalCount,
    candidates: c,
    best: l,
    relayDisagreement: y,
    relays: s.outcomes.map((f) => ({ relayUrl: f.relayUrl, state: Tu(f), held: rr(f.events, t, o).length }))
  };
}
async function ct(e, t, o, n = 8e3) {
  return Ci(e, t, ht, (r) => Cu(r, o), n);
}
async function br(e, t, o, n = 8e3) {
  return Ci(e, t, Vt, (r) => Ri(r, o), n);
}
function Nu(e) {
  const t = e.filter((o) => o.payload !== null);
  return t.length < 2 ? { consistent: !0 } : Au(t.map((o) => ({
    eventId: o.event.id,
    recoveryGeneration: o.payload.recovery_generation,
    previousRecoveryEventId: o.payload.previous_recovery_event_id
  })));
}
const Mu = 5e3;
async function Ti(e, t, o, n = Mu) {
  const r = [...new Set(t)], s = await e(r, o);
  if (s.best || s.candidates.length > 0)
    return s;
  const i = s.relays.filter((d) => d.state === "slow").map((d) => d.relayUrl);
  let a = s, c = 0;
  if (i.length > 0) {
    const d = await e(i, n);
    if (d.best || d.candidates.length > 0)
      return { ...d, quorumMet: !0, respondedCount: s.respondedCount + d.respondedCount, totalCount: s.totalCount, relays: [...s.relays.filter((y) => y.state !== "slow"), ...d.relays] };
    c = d.relays.filter((y) => y.state !== "answered").length, a = { ...s, respondedCount: s.respondedCount + d.respondedCount, relays: [...s.relays.filter((y) => y.state !== "slow"), ...d.relays] };
  }
  if (c > 0)
    throw new rs("slow");
  const l = a.relays.filter((d) => d.state !== "answered").length;
  if (l > 0)
    throw new rs("unreached", l);
  return { ...a, quorumMet: !0 };
}
async function Ou(e, t, o) {
  const n = Ne(t, "d") ?? "", r = new N(e);
  try {
    const s = await r.queryQuorum({ kinds: [t.kind], authors: [t.pubkey], "#d": [n], limit: 5 }, o), i = [], a = /* @__PURE__ */ new Map();
    for (const c of s.outcomes) {
      const l = c.events.filter((d) => d.kind === t.kind && d.pubkey === t.pubkey && Ne(d, "d") === n);
      c.responded ? l.some((d) => d.id !== t.id) ? a.set(c.relayUrl, "held back: it holds another record at this address") : i.push(c.relayUrl) : a.set(c.relayUrl, "held back: it didn't answer what it holds at this address");
    }
    return { ok: i, heldBack: a };
  } finally {
    r.closeAll();
  }
}
async function os(e) {
  const t = [...new Set(e.relayUrls)], o = async (l, d = t) => {
    if (d.length === 0)
      return /* @__PURE__ */ new Map();
    const y = new N(d);
    try {
      const f = await y.publishAll(l, e.timeoutMs);
      return new Map(f.map((h) => [
        h.relayUrl,
        { ok: h.result.ok, message: h.result.message ?? "" }
      ]));
    } finally {
      y.closeAll();
    }
  }, n = await Ou(t, e.credentialEvent, e.timeoutMs), [r, s] = await Promise.all([
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
function Iu(e) {
  const t = Ne(e, "d");
  if (e.kind !== H || t === void 0 || !C(e))
    throw new Error("This session's capsule event is not a valid capsule.");
  return { pubkey: e.pubkey, dTag: t };
}
function Lu(e, t, o) {
  const n = e.filter((s) => s.pubkey === o.pubkey && s.kind === H && Ne(s, "d") === o.dTag && C(s));
  return n.some((s) => s.id === t.id) ? "current" : n.length === 0 ? "missing" : Math.max(...n.map((s) => s.created_at)) >= t.created_at ? "newer" : "older";
}
async function ss(e, t, o) {
  const n = Iu(t), r = new N(e);
  try {
    const s = await r.queryQuorum({
      kinds: [H],
      authors: [n.pubkey],
      "#d": [n.dTag],
      limit: 5
    }, o);
    return new Map(s.outcomes.map((i) => [
      i.relayUrl,
      i.responded ? { status: Lu(i.events, t, n) } : { status: "unreachable", error: i.error }
    ]));
  } finally {
    r.closeAll();
  }
}
async function Du(e) {
  const t = [...new Set(e.relayUrls)], [o, n] = await Promise.all([
    ss(t, e.credentialEvent, e.timeoutMs),
    ss(t, e.recoveryEvent, e.timeoutMs)
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
const fo = za.id, lt = "aes-256-gcm-v1", ut = "bitlogin-bip39-hkdf-v1", Ni = "bitlogin-recovery-hkdf-v1", xu = 4, Uu = 64;
function dt(e) {
  return [...new Set(e)].filter((t) => t.length <= Uu).slice(0, xu);
}
function yt(e) {
  return e ? { everyday_derivation: Ni } : {};
}
function Mi(e) {
  return e.protocol?.everyday_derivation === Ni;
}
const $u = 5e3;
async function ho(e) {
  const t = [...new Set(e.urls)], o = await e.read(t, e.timeoutMs), n = o.relays.filter((s) => s.state === "answered").map((s) => s.relayUrl);
  if (o.candidates.length > 0)
    return { state: "taken", result: o, answeredUrls: n };
  const r = o.relays.filter((s) => s.state === "slow").map((s) => s.relayUrl);
  if (r.length > 0) {
    const s = await e.read(r, e.slowWaitMs ?? $u);
    if (s.candidates.length > 0)
      return { state: "taken", result: s, answeredUrls: [...n, ...s.relays.filter((i) => i.state === "answered").map((i) => i.relayUrl)] };
    if (s.relays.some((i) => i.state !== "answered"))
      return { state: "unchecked", why: "slow", answered: n.length, of: t.length };
    n.push(...r);
  }
  return n.length < Math.ceil(t.length / 2) ? { state: "unchecked", why: "too-few", answered: n.length, of: t.length } : { state: "free", writeUrls: n };
}
const po = {
  slow: "a vault relay that connected didn't finish answering, and it may hold an account",
  "too-few": "too few vault relays answered"
};
async function Oi(e) {
  const t = On(e.loginName), o = e.now ?? Math.floor(Date.now() / 1e3), { locatorPrivateKey: n, capsuleKey: r } = await It(e.password, t);
  try {
    const s = K(n), i = await ho({
      urls: e.vaultRelayUrls,
      timeoutMs: e.timeoutMs,
      read: async (b, _) => {
        const k = new N(b, { authPrivateKey: n });
        try {
          return await ct(k, s, r, _);
        } finally {
          k.closeAll();
        }
      }
    });
    if (i.state === "taken")
      throw new mi();
    if (i.state === "unchecked")
      throw new de(`Couldn't check that this login name and password are free: ${po[i.why]}. Nothing was registered. Try again in a moment.`);
    const a = i.writeUrls, c = e.everydayPrivateKey !== void 0;
    if (c && !Vr(e.everydayPrivateKey))
      throw new de("The provided key is not a valid secp256k1 private key.");
    if (e.recoveryPhrase !== void 0 && (c || !no(mn(e.recoveryPhrase))))
      throw new de("That recovery phrase can't make this account.");
    const l = e.recoveryPhrase !== void 0 ? mn(e.recoveryPhrase) : fi(Fs()), d = await Un(l);
    let y, f, h;
    try {
      ({ recoveryPrivateKey: y, capsuleKey: f } = qr(d)), h = c ? e.everydayPrivateKey : In(d);
    } finally {
      S(d);
    }
    const p = !c, w = J(32), m = J(32);
    let v = !1;
    try {
      const b = K(y), _ = K(h), k = U(qs()), M = {
        schema: Nn,
        account_id: k,
        recovery_generation: 0,
        previous_recovery_event_id: null,
        operational_private_key: U(h),
        operational_public_key: _,
        recovery_public_key: b,
        connection_vault_root: U(w),
        vault_sudo_key: U(m),
        created_at: o,
        vault_relay_hints: dt(e.vaultRelayUrls),
        protocol: {
          capsule_encryption: lt,
          recovery_derivation: ut,
          ...yt(p)
        }
      }, O = await yo({
        recoveryPrivateKey: y,
        capsuleKey: f,
        payload: M
      }), G = new N(e.vaultRelayUrls, {
        authPrivateKey: y
      });
      let x;
      try {
        x = await He(G, O, {
          dTag: Vt,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        G.closeAll();
      }
      if (!x.success)
        throw new de("The recovery capsule did not reach the required relay acknowledgement and readback quorum. No login credential was published. Please retry, or add more vault relays.");
      const $ = {
        schema: Mn,
        account_id: k,
        generation: 0,
        operational_private_key: U(h),
        operational_public_key: _,
        recovery_public_key: b,
        recovery_capsule_event: O,
        connection_vault_root: U(w),
        created_at: o,
        vault_relay_hints: dt(e.vaultRelayUrls),
        protocol: {
          password_kdf: fo,
          capsule_encryption: lt,
          recovery_derivation: ut,
          ...yt(p)
        }
      }, F = await uo({
        locatorPrivateKey: n,
        capsuleKey: r,
        payload: $
      }), B = new N(a, {
        authPrivateKey: n
      });
      let De;
      try {
        De = await He(B, F, {
          dTag: ht,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        B.closeAll();
      }
      if (!De.success)
        throw new de("Registration did not reach the required credential acknowledgement and readback quorum. Please retry, or add more vault relays.");
      return v = !0, {
        normalizedLoginName: t,
        recoveryPhrase: l,
        everydayPrivateKey: h,
        everydayPublicKey: _,
        recoveryPublicKey: b,
        locatorPublicKey: s,
        accountId: k,
        imported: c,
        everydayKeyDerived: p,
        connectionVaultRoot: w,
        vaultSudoKey: m,
        credentialEvent: F,
        recoveryEvent: O,
        credentialPublish: De,
        recoveryPublish: x
      };
    } finally {
      S(y, f), v || (c || S(h), S(w, m));
    }
  } finally {
    S(n, r);
  }
}
async function Fu(e) {
  const { nsecOrHex: t, ...o } = e, n = Ii(t);
  return Oi({ ...o, everydayPrivateKey: n });
}
function Ii(e) {
  const t = e.trim();
  let o;
  if (t.startsWith("nsec1"))
    o = Qa(t);
  else if (/^[0-9a-fA-F]{64}$/u.test(t))
    o = $s(t.toLowerCase());
  else
    throw new de("Enter a valid nsec (nsec1…) or a 64-character hex private key.");
  if (!Vr(o))
    throw new de("The provided key is not a valid secp256k1 private key.");
  return o;
}
class Li {
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
async function qu(e) {
  const t = On(e.loginName), { locatorPrivateKey: o, capsuleKey: n } = await It(e.password, t), r = K(o), s = new N(e.vaultRelayUrls, {
    authPrivateKey: o
  });
  try {
    const i = await Ti(async (h, p) => {
      if (h.length === e.vaultRelayUrls.length)
        return ct(s, r, n, p);
      const w = new N(h, { authPrivateKey: o });
      try {
        return await ct(w, r, n, p);
      } finally {
        w.closeAll();
      }
    }, e.vaultRelayUrls, e.timeoutMs);
    if (!i.quorumMet)
      throw new Je("quorum-not-met");
    if (!i.best)
      throw new Je(i.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
    const a = i.best.payload, c = e.store ?? new Li(), l = await io(c, a.operational_public_key), d = a.generation < l.generation;
    if (d && !e.acknowledgeRollback)
      throw new bi(l.generation, a.generation);
    const y = d ? `This device previously saw credential generation ${l.generation}, but the accepted capsule is generation ${a.generation}. Relays may be serving stale data, or an old capsule is being replayed.` : void 0;
    await ki(c, a.operational_public_key, {
      generation: a.generation
    });
    const f = i.relayDisagreement ? 'Configured relays returned different credential capsules as "latest" for this account. Some relays may be stale, censored, or malicious.' : void 0;
    return {
      everydayPrivateKey: V(a.operational_private_key),
      everydayPublicKey: a.operational_public_key,
      recoveryPublicKey: a.recovery_public_key,
      accountId: a.account_id,
      generation: a.generation,
      everydayKeyDerived: Mi(a),
      credentialEvent: i.best.event,
      recoveryCapsuleEvent: a.recovery_capsule_event,
      connectionVaultRoot: a.connection_vault_root ? V(a.connection_vault_root) : void 0,
      rollbackWarning: y,
      relayDisagreementWarning: f
    };
  } finally {
    s.closeAll();
  }
}
function is(e) {
  return e.filter((t) => C(t)).sort((t, o) => o.created_at - t.created_at)[0];
}
async function Bu(e) {
  if (!no(e.phrase))
    throw new Ae("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await Un(e.phrase), { recoveryPrivateKey: o, capsuleKey: n } = qr(t), r = In(t), s = K(r);
  S(t, r);
  const i = K(o), a = new N(e.vaultRelayUrls, {
    authPrivateKey: o
  });
  let c;
  try {
    const w = async (m, v) => {
      if (m.length === e.vaultRelayUrls.length)
        return br(a, i, n, v);
      const b = new N(m, { authPrivateKey: o });
      try {
        return await br(b, i, n, v);
      } finally {
        b.closeAll();
      }
    };
    c = e.offlineRecoveryCapsuleEvents?.length ? await w(e.vaultRelayUrls, e.timeoutMs) : await Ti(w, e.vaultRelayUrls, e.timeoutMs);
  } finally {
    a.closeAll();
  }
  if (e.offlineRecoveryCapsuleEvents?.length) {
    const w = [];
    for (const _ of e.offlineRecoveryCapsuleEvents)
      if (C(_))
        try {
          w.push({
            event: _,
            payload: await Ri(_, n)
          });
        } catch (k) {
          w.push({
            event: _,
            payload: null,
            error: k.message
          });
        }
    const m = /* @__PURE__ */ new Map();
    for (const _ of [...c.candidates, ...w])
      m.set(_.event.id, _);
    const v = [...m.values()].sort((_, k) => k.event.created_at - _.event.created_at), b = v.find((_) => _.payload !== null) ?? null;
    c = {
      ...c,
      candidates: v,
      best: b,
      quorumMet: c.quorumMet || b !== null
    };
  }
  if (!c.quorumMet)
    throw new Je("quorum-not-met");
  if (!c.best)
    throw new Je(c.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const l = c.best.payload, d = Nu(c.candidates), y = V(l.operational_private_key), f = l.operational_public_key, { generalRelays: h, dmRelays: p } = await Di(f, [...e.discoveryRelayUrls, ...l.vault_relay_hints], e.timeoutMs);
  return {
    everydayPrivateKey: y,
    everydayPublicKey: f,
    recoveryPrivateKey: o,
    recoveryPublicKey: i,
    recoveryCapsuleKey: n,
    accountId: l.account_id,
    currentRecoveryEvent: c.best.event,
    currentRecoveryPayload: l,
    generalRelays: h,
    dmRelays: p,
    chainWarning: d.consistent ? void 0 : d.warning,
    everydayKeyDerived: f === s
  };
}
async function Di(e, t, o) {
  const n = new N([...new Set(t)]);
  let r = [], s = [];
  try {
    const i = await n.queryQuorum({ kinds: [Ot], authors: [e], limit: 5 }, o), a = is(i.outcomes.flatMap((d) => d.events));
    a && (r = gu(a));
    const c = await n.queryQuorum({ kinds: [Fr], authors: [e], limit: 5 }, o), l = is(c.outcomes.flatMap((d) => d.events));
    l && (s = mu(l));
  } finally {
    n.closeAll();
  }
  return { generalRelays: r, dmRelays: s };
}
async function xi(e) {
  if (!no(e))
    throw new Ae("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await Un(e);
  try {
    const { recoveryPrivateKey: o, capsuleKey: n } = qr(t), r = In(t);
    return {
      recoveryPrivateKey: o,
      recoveryPublicKey: K(o),
      capsuleKey: n,
      everydayPrivateKey: r,
      everydayPublicKey: K(r)
    };
  } finally {
    S(t);
  }
}
async function Ui(e, t, o) {
  const n = new N(t, {
    authPrivateKey: e.recoveryPrivateKey
  });
  let r;
  try {
    r = await br(n, e.recoveryPublicKey, e.capsuleKey, o);
  } finally {
    n.closeAll();
  }
  if (!r.quorumMet)
    throw new Je("quorum-not-met");
  if (r.best)
    throw new Ae("This account's recovery capsule is still on the relays. Use normal recovery instead of a rebuild.");
  return r.candidates.length > 0 ? Math.max(...r.candidates.map((s) => s.event.created_at)) : null;
}
async function Wu(e) {
  const t = await xi(e.phrase);
  try {
    await Ui(t, e.vaultRelayUrls, e.timeoutMs);
    const o = new N([
      .../* @__PURE__ */ new Set([...e.discoveryRelayUrls, ...e.vaultRelayUrls])
    ]);
    try {
      const r = (await o.queryQuorum({
        kinds: [fn, Ot],
        authors: [t.everydayPublicKey],
        limit: 10
      }, e.timeoutMs)).outcomes.flatMap((s) => s.events).filter((s) => s.pubkey === t.everydayPublicKey && C(s));
      return {
        everydayPublicKey: t.everydayPublicKey,
        profileFound: r.some((s) => s.kind === fn),
        relayListFound: r.some((s) => s.kind === Ot)
      };
    } finally {
      o.closeAll();
    }
  } finally {
    S(t.recoveryPrivateKey, t.capsuleKey, t.everydayPrivateKey);
  }
}
async function Vu(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), o = await xi(e.phrase);
  let n = !1;
  try {
    const r = await Ui(o, e.vaultRelayUrls, e.timeoutMs), s = {
      schema: Nn,
      account_id: U(qs()),
      recovery_generation: 0,
      previous_recovery_event_id: null,
      operational_private_key: U(o.everydayPrivateKey),
      operational_public_key: o.everydayPublicKey,
      recovery_public_key: o.recoveryPublicKey,
      connection_vault_root: U(J(32)),
      vault_sudo_key: U(J(32)),
      created_at: r === null ? t : Ut(r, t),
      vault_relay_hints: dt(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: lt,
        recovery_derivation: ut,
        ...yt(!0)
      }
    }, i = await yo({
      recoveryPrivateKey: o.recoveryPrivateKey,
      capsuleKey: o.capsuleKey,
      payload: s
    }), a = new N(e.vaultRelayUrls, {
      authPrivateKey: o.recoveryPrivateKey
    });
    let c;
    try {
      c = await He(a, i, {
        dTag: Vt,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      a.closeAll();
    }
    if (!c.success)
      throw new Ae("Could not publish the rebuilt recovery capsule to enough relays. Nothing else was changed; please retry.");
    const { generalRelays: l, dmRelays: d } = await Di(o.everydayPublicKey, [...e.discoveryRelayUrls, ...e.vaultRelayUrls], e.timeoutMs);
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
async function ju(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), o = On(e.newLoginName), { recovered: n } = e, r = n.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: n.currentRecoveryPayload.connection_vault_root,
    vault_sudo_key: n.currentRecoveryPayload.vault_sudo_key
  } : {}, s = n.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: n.currentRecoveryPayload.connection_vault_root
  } : {}, { locatorPrivateKey: i, capsuleKey: a } = await It(e.newPassword, o);
  try {
    const c = K(i), l = await ho({
      urls: e.vaultRelayUrls,
      timeoutMs: e.timeoutMs,
      read: async (k, M) => {
        const O = new N(k, { authPrivateKey: i });
        try {
          return await ct(O, c, a, M);
        } finally {
          O.closeAll();
        }
      }
    });
    if (l.state === "unchecked")
      throw new Ae(`Couldn't check that this login name and password are free: ${po[l.why]}. Nothing was changed. Try again in a moment.`);
    let d;
    if (l.state === "taken") {
      const k = l.result.best?.payload ?? null;
      if (!(k !== null && k.account_id === n.accountId && k.operational_public_key === n.everydayPublicKey && k.recovery_public_key === n.recoveryPublicKey && k.generation === 0 && k.recovery_capsule_event.id === n.currentRecoveryEvent.id))
        throw new Ae("Another account is already registered with that login name and password. Pick a different one.");
      d = l.answeredUrls;
    } else
      d = l.writeUrls;
    const y = n.currentRecoveryPayload.recovery_generation + 1, f = {
      schema: Nn,
      account_id: n.accountId,
      recovery_generation: y,
      previous_recovery_event_id: n.currentRecoveryEvent.id,
      operational_private_key: U(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      ...r,
      created_at: Ut(n.currentRecoveryEvent.created_at, t),
      vault_relay_hints: dt(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: lt,
        recovery_derivation: ut,
        ...yt(n.everydayKeyDerived)
      }
    }, h = await yo({
      recoveryPrivateKey: n.recoveryPrivateKey,
      capsuleKey: n.recoveryCapsuleKey,
      payload: f
    }), p = new N(e.vaultRelayUrls, {
      authPrivateKey: n.recoveryPrivateKey
    });
    let w;
    try {
      w = await He(p, h, {
        dTag: Vt,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      p.closeAll();
    }
    if (!w.success)
      throw new Ae("Could not publish the refreshed recovery capsule to enough relays. No new credential was published; please retry.");
    n.currentRecoveryEvent = h, n.currentRecoveryPayload = f;
    const m = {
      schema: Mn,
      account_id: n.accountId,
      generation: 0,
      operational_private_key: U(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      recovery_capsule_event: h,
      ...s,
      // A retry may be repairing a credential that reached only one relay.
      // It must replace that partial event deterministically on every relay.
      created_at: l.state === "taken" && l.result.best ? Ut(l.result.best.event.created_at, t) : t,
      vault_relay_hints: dt(e.vaultRelayUrls),
      protocol: {
        password_kdf: fo,
        capsule_encryption: lt,
        recovery_derivation: ut,
        ...yt(n.everydayKeyDerived)
      }
    }, v = await uo({
      locatorPrivateKey: i,
      capsuleKey: a,
      payload: m
    }), b = new N(d, {
      authPrivateKey: i
    });
    let _;
    try {
      _ = await He(b, v, {
        dTag: ht,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      b.closeAll();
    }
    if (!_.success)
      throw new Ae("Could not publish the new credential capsule to enough relays. Please retry.");
    return e.store && await hu(e.store, n.everydayPublicKey, {
      generation: 0,
      recoveryGeneration: y
    }), {
      normalizedLoginName: o,
      locatorPublicKey: c,
      credentialEvent: v,
      refreshedRecoveryEvent: h,
      credentialPublish: _,
      recoveryPublish: w
    };
  } finally {
    S(i, a);
  }
}
async function Gu(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), o = On(e.loginName), n = await It(e.oldPassword, o), r = K(n.locatorPrivateKey), s = new N(e.vaultRelayUrls, {
    authPrivateKey: n.locatorPrivateKey
  });
  let i;
  try {
    i = await ct(s, r, n.capsuleKey, e.timeoutMs);
  } finally {
    s.closeAll();
  }
  if (!i.quorumMet)
    throw new Je("quorum-not-met");
  if (!i.best)
    throw new Je(i.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const a = i.best.payload, c = i.best.event, l = e.store ?? new Li(), d = await io(l, a.operational_public_key);
  if (a.generation < d.generation && !e.acknowledgeRollback)
    throw new bi(d.generation, a.generation);
  const y = await It(e.newPassword, o), f = K(y.locatorPrivateKey), h = await ho({
    urls: e.vaultRelayUrls,
    timeoutMs: e.timeoutMs,
    read: async ($, F) => {
      const B = new N($, { authPrivateKey: y.locatorPrivateKey });
      try {
        return await ct(B, f, y.capsuleKey, F);
      } finally {
        B.closeAll();
      }
    }
  });
  if (h.state === "taken")
    throw new mi("Another account is already registered with this login name and the new password you chose. Pick a different new password.");
  if (h.state === "unchecked")
    throw new de(`Couldn't check that the new password is free under this login name: ${po[h.why]}. Your password wasn't changed. Try again in a moment.`);
  const p = h.writeUrls, w = a.generation + 1, m = {
    schema: Mn,
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
    vault_relay_hints: dt(e.vaultRelayUrls),
    protocol: {
      password_kdf: fo,
      capsule_encryption: lt,
      recovery_derivation: ut,
      ...yt(Mi(a))
    }
  }, v = await uo({
    locatorPrivateKey: y.locatorPrivateKey,
    capsuleKey: y.capsuleKey,
    payload: m
  }), b = new N(p, {
    authPrivateKey: y.locatorPrivateKey
  }), _ = await He(b, v, {
    dTag: ht,
    minAcks: e.minAcknowledgements,
    timeoutMs: e.timeoutMs
  });
  if (b.closeAll(), !_.success)
    throw new de("The new credential capsule did not reach the required relay acknowledgement and readback quorum. Your existing password still works; nothing was changed. Please retry.");
  const k = Ru({
    oldLocatorPrivateKey: n.locatorPrivateKey,
    createdAt: Ut(c.created_at, t)
  }), M = ei({
    privateKey: n.locatorPrivateKey,
    eventIdToDelete: c.id,
    deletedEventKind: H,
    createdAt: t
  }), O = new N(e.vaultRelayUrls, {
    authPrivateKey: n.locatorPrivateKey
  }), [G, x] = await Promise.all([
    O.publishAll(k, e.timeoutMs),
    O.publishAll(M, e.timeoutMs)
  ]);
  return O.closeAll(), await ki(l, a.operational_public_key, {
    generation: w
  }), {
    normalizedLoginName: o,
    oldLocatorPublicKey: r,
    newLocatorPublicKey: f,
    newGeneration: w,
    recoveryPublicKey: a.recovery_public_key,
    recoveryCapsuleEvent: a.recovery_capsule_event,
    newCredentialEvent: v,
    tombstoneEvent: k,
    deletionRequestEvent: M,
    newCredentialPublish: _,
    tombstoneAcknowledgedCount: Y(G),
    deletionAcknowledgedCount: Y(x)
  };
}
const Ju = "bitlogin/connection-vault-root/v1", Hu = "bitlogin/connection-vault-signing/v1", zu = "bitlogin/connection-record-encryption/v1", Qu = "bitlogin/connection-vault-personal/v1", kr = "bitlogin:connection:";
function Yu(e) {
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Ln(Dn(Ju), e);
}
function wt(e) {
  return lc(e, Hu).scalar;
}
function $i(e) {
  const t = wt(e);
  try {
    return K(t);
  } finally {
    S(t);
  }
}
function Xu(e, t) {
  if (t.length !== 32)
    throw new Error("vault_sudo_key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Ln(Dn(Qu), Wr(e, t));
}
function Fi(e, t) {
  const o = $n(t);
  return pt(e, Wr(ee(zu), new Uint8Array([0]), o), 32);
}
function Zu() {
  return U(J(16));
}
function $n(e) {
  const t = V(e);
  if (t.length !== 16)
    throw new Error("connection_id must decode to exactly 16 bytes (§CV7).");
  return t;
}
function qi(e) {
  return $n(e), `${kr}${e}`;
}
function Bi(e) {
  if (!e.startsWith(kr))
    return null;
  const t = e.slice(kr.length);
  try {
    return $n(t), t;
  } catch {
    return null;
  }
}
class Q {
  privateKey;
  publicKeyHex;
  destroyed = !1;
  constructor(t) {
    this.privateKey = t, this.publicKeyHex = K(t);
  }
  assertAlive() {
    if (this.destroyed)
      throw new Error("This signer has been destroyed (session locked or logged out).");
  }
  getPublicKey() {
    return this.assertAlive(), this.publicKeyHex;
  }
  signEvent(t) {
    return this.assertAlive(), Z({
      pubkey: this.publicKeyHex,
      created_at: t.created_at ?? Math.floor(Date.now() / 1e3),
      kind: t.kind,
      tags: t.tags ?? [],
      content: t.content
    }, this.privateKey);
  }
  nip44Encrypt(t, o) {
    return this.assertAlive(), wr(je(this.privateKey, t), o);
  }
  nip44Decrypt(t, o) {
    return this.assertAlive(), jr(je(this.privateKey, t), o);
  }
  /** Legacy relative to nip44Encrypt above, but still what a real NIP-07 extension exposes as
   * window.nostr.nip04.encrypt -- implemented for drop-in parity. */
  nip04Encrypt(t, o) {
    return this.assertAlive(), uu(this.privateKey, t, o);
  }
  nip04Decrypt(t, o) {
    return this.assertAlive(), yu(this.privateKey, t, o);
  }
  /** Best-practical secret wipe (§11.10, §21.4): overwrites the private key buffer in place. */
  destroy() {
    S(this.privateKey), this.destroyed = !0;
  }
}
const Wi = "bitlogin.connection.v1", Vi = "bitlogin.connection.nwc.v1", as = 120, ed = /* @__PURE__ */ new Set(["active", "suspended", "deleted"]), td = /* @__PURE__ */ new Set(["connectable", "personal"]);
class nt extends Error {
  constructor(t) {
    super(t), this.name = "ConnectionRecordError";
  }
}
function ji(e, t) {
  return ee(`bitlogin|connection-record|v1|${e}|30078|${t}`);
}
function Gi(e) {
  const t = e, o = (s) => {
    throw new nt(s);
  };
  (!t || typeof t != "object") && o("Connection record must be an object."), t.schema !== Wi && o("Unsupported connection record schema (§CV8.3)."), typeof t.connection_id != "string" && o("connection_id must be a string (§CV7)."), (typeof t.connection_type != "string" || t.connection_type.length === 0) && o("connection_type must be a non-empty string (§CV8.3)."), td.has(t.tier) || o("tier must be connectable or personal."), ed.has(t.state) || o("state must be active, suspended, or deleted (§CV8.3)."), (typeof t.label != "string" || t.label.length > as) && o(`label must be a string of at most ${as} characters.`), (!Number.isInteger(t.created_at) || !Number.isInteger(t.updated_at)) && o("created_at and updated_at must be integers (§CV8.3).");
  const n = t.credential;
  (!n || typeof n != "object" || typeof n.schema != "string") && o("credential must be an object naming its profile schema (§CV8.3).");
  const r = t.application_binding;
  (!r || typeof r != "object" || r.origin !== null && typeof r.origin != "string" || r.app_pubkey !== null && typeof r.app_pubkey != "string") && o("application_binding must carry origin and app_pubkey (string or null)."), t.notes !== null && typeof t.notes != "string" && o("notes must be a string or null.");
}
async function or(e) {
  Gi(e.record);
  const t = wt(e.vaultPrk), o = K(t), n = qi(e.record.connection_id), r = Fi(e.recordPrk, e.record.connection_id), s = await ao(e.record, r, ji(o, n));
  return Z({
    pubkey: o,
    created_at: Ut(e.previousCreatedAt, e.now),
    kind: H,
    tags: [["d", n]],
    content: JSON.stringify(s)
  }, t);
}
async function nd(e, t, o) {
  if (!C(e))
    throw new nt("Connection record event has an invalid id or signature.");
  const n = K(wt(t));
  if (e.pubkey !== n)
    throw new nt("Connection record event is not signed by this vault's identity.");
  const r = Ne(e, "d") ?? "", s = Bi(r);
  if (s === null)
    throw new nt("Connection record event has a malformed d tag.");
  const i = JSON.parse(e.content), a = ji(e.pubkey, r), c = [
    { prk: t, tier: "connectable" },
    ...o ? [{ prk: o, tier: "personal" }] : []
  ];
  for (const l of c) {
    let d;
    try {
      d = await co(i, Fi(l.prk, s), a);
    } catch {
      continue;
    }
    if (Gi(d), d.connection_id !== s)
      throw new nt("Connection record id does not match its d tag.");
    if (d.tier !== l.tier)
      throw new nt("Connection record tier does not match the key that decrypted it.");
    return { record: d, tier: l.tier, event: e };
  }
  return null;
}
function rd(e, t) {
  return {
    ...e,
    state: "deleted",
    credential: { schema: e.credential.schema },
    notes: null,
    updated_at: t
  };
}
const En = /^[0-9a-f]{64}$/u;
class me extends Error {
  constructor(t) {
    super(t), this.name = "NwcParseError";
  }
}
function cs(e) {
  const t = e.trim();
  if (!/^nostr\+walletconnect:\/\//iu.test(t))
    throw new me("Not an NWC URI: it must start with nostr+walletconnect://");
  let o;
  try {
    o = new URL(t.replace(/^nostr\+walletconnect:\/\//iu, "http://"));
  } catch {
    throw new me("The NWC URI is malformed.");
  }
  const n = o.hostname.toLowerCase();
  if (!En.test(n))
    throw new me("The NWC URI's wallet service pubkey is not 64-char hex.");
  const r = [], s = [];
  let i = null, a = null;
  for (const [c, l] of o.searchParams.entries())
    if (c === "relay") {
      if (!jt(l))
        throw new me("An NWC relay must use secure WebSockets, except for an explicit loopback development endpoint.");
      r.push(l);
    } else if (c === "secret") {
      const d = l.toLowerCase();
      if (!En.test(d))
        throw new me("The NWC URI's secret is not a 64-char hex client key.");
      i = d;
    } else c === "lud16" ? a = l : s.push([c, l]);
  if (r.length === 0)
    throw new me("The NWC URI names no relay.");
  if (i === null)
    throw new me("The NWC URI carries no secret.");
  return {
    schema: Vi,
    wallet_pubkey: n,
    relays: r,
    secret: i,
    lud16: a,
    extra_params: s
  };
}
function od(e) {
  Ji(e);
  const t = new URLSearchParams();
  for (const o of e.relays)
    t.append("relay", o);
  t.append("secret", e.secret), e.lud16 !== null && t.append("lud16", e.lud16);
  for (const [o, n] of e.extra_params)
    t.append(o, n);
  return `nostr+walletconnect://${e.wallet_pubkey}?${t.toString()}`;
}
function sd(e, t) {
  return e.wallet_pubkey === t.wallet_pubkey && e.secret === t.secret;
}
function Ji(e) {
  const t = e, o = (n) => {
    throw new me(n);
  };
  (!t || typeof t != "object") && o("NWC credential must be an object."), t.schema !== Vi && o("NWC credential has the wrong schema."), (typeof t.wallet_pubkey != "string" || !En.test(t.wallet_pubkey)) && o("NWC credential wallet_pubkey must be 64-char lowercase hex."), (!Array.isArray(t.relays) || t.relays.length === 0 || t.relays.some((n) => typeof n != "string")) && o("NWC credential must name at least one relay."), t.relays.some((n) => !jt(n)) && o("NWC relays must use secure WebSockets, except for explicit loopback development endpoints."), (typeof t.secret != "string" || !En.test(t.secret)) && o("NWC credential secret must be 64-char lowercase hex."), t.lud16 !== null && typeof t.lud16 != "string" && o("NWC credential lud16 must be a string or null."), (!Array.isArray(t.extra_params) || t.extra_params.some((n) => !Array.isArray(n) || n.length !== 2 || typeof n[0] != "string" || typeof n[1] != "string")) && o("NWC credential extra_params must be [key, value] string pairs.");
}
const id = "bitlogin:vault-hwm:v2:", ad = "bitlogin/vault-hwm-index/v2", Hi = "bitlogin/vault-hwm-encryption/v2", cd = /^[0-9a-f]{64}$/u;
class Re extends Error {
  constructor() {
    super("The local Connection Vault rollback marker is invalid or has been tampered with."), this.name = "RecordHighWaterMarkError";
  }
}
function wo(e) {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return Number.isInteger(t.createdAt) && (t.createdAt ?? -1) >= 0 && typeof t.eventId == "string" && cd.test(t.eventId);
}
function zi(e, t) {
  $n(t);
  const o = pt(e, ad, 32), n = ee(t);
  try {
    return `${id}${U(xs(Us, o, n))}`;
  } finally {
    S(o, n);
  }
}
function ld(e, t) {
  return `bitlogin:vault-hwm:${$i(e)}:${t}`;
}
async function ud(e, t, o) {
  const n = pt(e, Hi, 32), r = ee(JSON.stringify(o)), s = ee(t);
  try {
    const i = await ii(n, r, s), a = {
      v: 2,
      nonce: U(i.nonce),
      ciphertext: U(i.ciphertext)
    };
    return JSON.stringify(a);
  } finally {
    S(n, r, s);
  }
}
async function dd(e, t, o) {
  const n = pt(e, Hi, 32), r = ee(t);
  let s;
  try {
    const i = JSON.parse(o);
    if (i.v !== 2 || typeof i.nonce != "string" || typeof i.ciphertext != "string")
      throw new Re();
    s = await ai(n, V(i.nonce), V(i.ciphertext), r);
    const a = JSON.parse(Br(s));
    if (!wo(a))
      throw new Re();
    return a;
  } catch (i) {
    throw i instanceof Re ? i : new Re();
  } finally {
    S(n, r), s && S(s);
  }
}
async function Qi(e, t, o, n) {
  const r = zi(t, o);
  await e.set(r, await ud(t, r, n));
}
async function Yi(e, t, o) {
  const n = zi(t, o), r = await e.get(n);
  if (r !== void 0)
    return dd(t, n, r);
  const s = ld(t, o), i = await e.get(s);
  if (i === void 0)
    return null;
  try {
    const a = JSON.parse(i);
    if (!wo(a))
      throw new Re();
    return await Qi(e, t, o, a), await e.delete(s), a;
  } catch (a) {
    throw a instanceof Re ? a : new Re();
  }
}
async function Xi(e, t, o, n) {
  if (!wo(n))
    throw new Re();
  const r = await Yi(e, t, o);
  r && pr({ created_at: n.createdAt, id: n.eventId }, { created_at: r.createdAt, id: r.eventId }) <= 0 || await Qi(e, t, o, n);
}
async function yd(e) {
  const t = wt(e.vaultPrk), o = new N(e.relayUrls, { authPrivateKey: t });
  let n;
  try {
    n = await He(o, e.event, {
      dTag: qi(e.connectionId),
      minAcks: e.minAcknowledgements,
      // The readback bar follows the ack bar: a caller publishing to fewer
      // relays (a targeted repair, a test) has already lowered its quorum.
      minReadbacks: e.minAcknowledgements,
      timeoutMs: e.timeoutMs
    });
  } finally {
    o.closeAll(), S(t);
  }
  return n.success && await Xi(e.store, e.vaultPrk, e.connectionId, {
    createdAt: e.event.created_at,
    eventId: e.event.id
  }), n;
}
const ls = 500;
async function fd(e) {
  const t = wt(e.vaultPrk), o = K(t), n = new N(e.relayUrls, { authPrivateKey: t });
  let r;
  try {
    r = await n.queryQuorum({ kinds: [H], authors: [o], limit: ls }, e.timeoutMs);
  } finally {
    n.closeAll(), S(t);
  }
  const s = r.outcomes.some((l) => l.events.length >= ls), i = /* @__PURE__ */ new Map();
  for (const l of r.outcomes.flatMap((d) => d.events)) {
    if (!C(l) || l.pubkey !== o)
      continue;
    const d = Bi(Ne(l, "d") ?? "");
    if (d === null)
      continue;
    const y = i.get(d);
    (!y || pr(l, y) > 0) && i.set(d, l);
  }
  const a = /* @__PURE__ */ new Map(), c = [];
  for (const [l, d] of i) {
    const y = await Yi(e.store, e.vaultPrk, l);
    if (y !== null && pr(d, {
      created_at: y.createdAt,
      id: y.eventId
    }) < 0) {
      c.push(l);
      continue;
    }
    a.set(l, d), await Xi(e.store, e.vaultPrk, l, {
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
class hd {
  vaultPrk;
  personalPrk = null;
  destroyed = !1;
  connectionVaultRoot;
  vaultPublicKey;
  constructor(t) {
    this.connectionVaultRoot = t.slice(), this.vaultPrk = Yu(this.connectionVaultRoot), this.vaultPublicKey = $i(this.vaultPrk);
  }
  get sudoActive() {
    return this.personalPrk !== null;
  }
  /** Opens a sudo window. Consumes (wipes) the caller's sudo key copy. */
  enableSudo(t) {
    this.endSudo(), this.personalPrk = Xu(this.connectionVaultRoot, t), S(t);
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
      schema: Wi,
      connection_id: Zu(),
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
    }, r = await or({
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
    }, i = await or({
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
    const n = o ?? Math.floor(Date.now() / 1e3), r = rd(t.record, n), s = await or({
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
    return this.destroyed ? Promise.reject(new Error("This vault session was destroyed; create a new one from the account's root.")) : nd(t, this.vaultPrk, this.personalPrk ?? void 0);
  }
  /** §CV11 step 3: a NIP-09 deletion request for a replaced record event,
   *  signed by the vault identity. Best-effort by contract — the encrypted
   *  tombstone is the durable part of a deletion, this is the courtesy ask. */
  buildDeletionRequest(t, o) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    return ei({
      privateKey: wt(this.vaultPrk),
      eventIdToDelete: t,
      deletedEventKind: H,
      createdAt: o ?? Math.floor(Date.now() / 1e3)
    });
  }
  publish(t) {
    return yd({ vaultPrk: this.vaultPrk, ...t });
  }
  fetchEvents(t) {
    return fd({ vaultPrk: this.vaultPrk, ...t });
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
const pd = "bitlogin", _e = "kv", re = "device-keys", wd = 2;
function vd() {
  return new Promise((e, t) => {
    const o = indexedDB.open(pd, wd);
    o.onupgradeneeded = () => {
      const n = o.result;
      n.objectStoreNames.contains(_e) || n.createObjectStore(_e), n.objectStoreNames.contains(re) || n.createObjectStore(re);
    }, o.onsuccess = () => e(o.result), o.onerror = () => t(o.error);
  });
}
class gd {
  dbPromise = null;
  db() {
    return this.dbPromise || (this.dbPromise = vd()), this.dbPromise;
  }
  async get(t) {
    const o = await this.db();
    return new Promise((n, r) => {
      const i = o.transaction(_e, "readonly").objectStore(_e).get(t);
      i.onsuccess = () => n(i.result), i.onerror = () => r(i.error);
    });
  }
  async set(t, o) {
    const n = await this.db();
    return new Promise((r, s) => {
      const i = n.transaction(_e, "readwrite");
      i.objectStore(_e).put(o, t), i.oncomplete = () => r(), i.onerror = () => s(i.error);
    });
  }
  async delete(t) {
    const o = await this.db();
    return new Promise((n, r) => {
      const s = o.transaction(_e, "readwrite");
      s.objectStore(_e).delete(t), s.oncomplete = () => n(), s.onerror = () => r(s.error);
    });
  }
  /**
   * Returns a non-extractable AES-GCM key kept by the browser's IndexedDB
   * implementation. The key is deliberately separate from the string-only KV
   * API so callers cannot accidentally serialize it as application data.
   */
  async getOrCreateDeviceKey(t) {
    const o = await this.db(), n = await new Promise((s, i) => {
      const a = o.transaction(re, "readonly").objectStore(re).get(t);
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
        const a = o.transaction(re, "readwrite");
        a.objectStore(re).add(r, t), a.oncomplete = () => s(), a.onerror = () => i(a.error);
      }), r;
    } catch {
      const s = await new Promise((i, a) => {
        const c = o.transaction(re, "readonly").objectStore(re).get(t);
        c.onsuccess = () => i(c.result), c.onerror = () => a(c.error);
      });
      if (s) return s;
      throw new Error("Unable to create the browser-bound session key.");
    }
  }
  async deleteDeviceKey(t) {
    const o = await this.db();
    return new Promise((n, r) => {
      const s = o.transaction(re, "readwrite");
      s.objectStore(re).delete(t), s.oncomplete = () => n(), s.onerror = () => r(s.error);
    });
  }
}
const Ht = "bitlogin:session:v1", vo = "bitlogin:session-device-key:v1";
function Zi(e) {
  return !!(e && typeof e == "object" && e.v === 3 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function ea(e, t) {
  if (e.length !== 32) throw new Error("Not a lock key.");
  return crypto.subtle.importKey("raw", _t(e), "AES-GCM", !1, [t]);
}
async function ln(e, t = Ht) {
  try {
    const o = await e.get(t);
    if (!o) return "none";
    const n = JSON.parse(o);
    return Zi(n) ? "locked" : ta(n) ? "open" : "none";
  } catch {
    return "none";
  }
}
function Zt(e) {
  let t = "";
  for (const o of e) t += String.fromCharCode(o);
  return btoa(t);
}
function en(e) {
  const t = atob(e);
  return Uint8Array.from(t, (o) => o.charCodeAt(0));
}
function _t(e) {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}
function ta(e) {
  return !!(e && typeof e == "object" && e.v === 2 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function Er(e, t, o, n = Ht) {
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
    const s = await e.getOrCreateDeviceKey(vo), i = crypto.getRandomValues(new Uint8Array(12)), a = new TextEncoder().encode(JSON.stringify(r)), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, s, a), l = {
      v: 2,
      iv: Zt(i),
      ciphertext: Zt(new Uint8Array(c))
    };
    if (!o) {
      await e.set(n, JSON.stringify(l));
      return;
    }
    const d = crypto.getRandomValues(new Uint8Array(12)), y = await crypto.subtle.encrypt({ name: "AES-GCM", iv: d }, await ea(o, "encrypt"), new TextEncoder().encode(JSON.stringify(l))), f = { v: 3, iv: Zt(d), ciphertext: Zt(new Uint8Array(y)) };
    await e.set(n, JSON.stringify(f));
  } catch {
    o && await e.delete(n).catch(() => {
    });
  }
}
async function na(e, t, o = Ht) {
  let n;
  try {
    n = await e.get(o);
  } catch {
    return null;
  }
  if (!n) return null;
  try {
    let r = JSON.parse(n);
    if (Zi(r)) {
      if (!t) return null;
      const c = await crypto.subtle.decrypt({ name: "AES-GCM", iv: _t(en(r.iv)) }, await ea(t, "decrypt"), _t(en(r.ciphertext)));
      r = JSON.parse(new TextDecoder().decode(c));
    }
    if (!ta(r) || typeof e.getOrCreateDeviceKey != "function")
      return await e.delete(o), null;
    const s = await e.getOrCreateDeviceKey(vo), i = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: _t(en(r.iv)) },
      s,
      _t(en(r.ciphertext))
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
const md = "bitlogin:kept-session:v1:", ne = (e) => md + e;
async function ue(e, t = Ht) {
  try {
    await e.delete(t);
  } catch {
  }
}
async function us(e) {
  try {
    await e.delete(Ht), typeof e.deleteDeviceKey == "function" && await e.deleteDeviceKey(vo);
  } catch {
  }
}
const bd = 27300, ft = {
  /** The longest address a picture may have. */
  pictureChars: 300,
  /** The most that is said about someone, in their own words. */
  aboutChars: 280,
  /** How long a pass made here lasts, in seconds. NSWP's verifier allows twelve hours; this gives four. */
  passSec: 4 * 3600,
  /** A profile's content is not read past this many characters. */
  contentChars: 2e4
};
function kd(e) {
  if (typeof e != "string" || e.length > ft.pictureChars) return "";
  try {
    const t = new URL(e);
    return t.protocol !== "https:" || t.username || t.password || !t.hostname.includes(".") ? "" : t.href.length <= ft.pictureChars ? t.href : "";
  } catch {
    return "";
  }
}
const Ed = (e) => e <= 31 || e >= 127 && e <= 159 || e >= 8203 && e <= 8207 || e >= 8232 && e <= 8239 || e >= 8288 && e <= 8303 || e === 65279;
function _d(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const o of e.slice(0, ft.aboutChars * 8).normalize("NFC")) t += Ed(o.codePointAt(0)) ? " " : o;
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, ft.aboutChars).join("").trim();
}
function Me(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, o = Dt(t.name), n = kd(t.picture), r = _d(t.about);
  return !o && !n && !r ? null : { ...o ? { name: o } : {}, ...n ? { picture: n } : {}, ...r ? { about: r } : {} };
}
function Pd(e, t) {
  if (!C(e) || e.kind !== 0 || e.pubkey !== t || e.content.length > ft.contentChars) return null;
  let o;
  try {
    o = JSON.parse(e.content);
  } catch {
    return null;
  }
  if (!o || typeof o != "object" || Array.isArray(o)) return null;
  const n = o;
  return Me({ name: Dt(n.display_name) || Dt(n.displayName) || n.name, picture: n.picture, about: n.about });
}
function ds(e, t) {
  let o = null;
  for (const n of e)
    !C(n) || n.kind !== 0 || n.pubkey !== t || o && n.created_at <= o.at || (o = { at: n.created_at, profile: Pd(n, t) });
  return o?.profile ?? null;
}
const Sd = /^[0-9a-f]{64}$/u;
function Kd(e) {
  const t = pn(e.site);
  if (!t || typeof e.session != "string" || !Sd.test(e.session) || e.session === e.identity) return null;
  const o = Math.floor(e.nowSeconds), n = Me(e.profile) ?? {}, r = [
    ["nswp:session", e.session],
    ["nswp:origin", t],
    ...e.guest ? [["nswp:guest", "1"]] : [],
    ["expiration", String(o + ft.passSec)]
  ];
  return n.name && r.push(["name", n.name]), n.picture && r.push(["picture", n.picture]), n.about && r.push(["about", n.about]), { kind: bd, created_at: o, tags: r, content: "" };
}
const _r = "bitlogin:kept-accounts:v1", _n = {
  /** No more accounts than this are kept on one device. The one least lately used goes first. */
  accounts: 8
}, Ad = /^[0-9a-f]{64}$/u;
function go(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (typeof t.pubkey != "string" || !Ad.test(t.pubkey)) return null;
  const o = Me({ name: t.name, picture: t.picture, about: t.about }) ?? {}, n = typeof t.at == "number" && Number.isFinite(t.at) && t.at > 0 ? Math.floor(t.at) : 0;
  let r;
  try {
    r = St(t.pubkey);
  } catch {
    return null;
  }
  return { pubkey: t.pubkey, npub: r, ...o, at: n };
}
function Rd(e) {
  if (!e) return [];
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return [];
  }
  if (!Array.isArray(t)) return [];
  const o = /* @__PURE__ */ new Set(), n = [];
  for (const r of t.slice(0, _n.accounts * 2)) {
    const s = go(r);
    !s || o.has(s.pubkey) || (o.add(s.pubkey), n.push(s));
  }
  return n.sort((r, s) => s.at - r.at).slice(0, _n.accounts);
}
function Cd(e, t, o, n = {}) {
  const r = e.find((a) => a.pubkey === t), s = go({
    pubkey: t,
    at: o,
    name: Dt(n.name) || r?.name,
    picture: n.picture ?? r?.picture,
    about: n.about ?? r?.about
  });
  if (!s) return { list: [...e], dropped: [] };
  const i = [s, ...e.filter((a) => a.pubkey !== t)];
  return { list: i.slice(0, _n.accounts), dropped: i.slice(_n.accounts).map((a) => a.pubkey) };
}
function Td(e, t, o) {
  return e.map((n) => n.pubkey === t ? go({ ...n, name: Dt(o.name) || n.name, picture: o.picture ?? n.picture, about: o.about ?? n.about }) ?? n : n);
}
const un = (e, t) => e.filter((o) => o.pubkey !== t);
async function oe(e) {
  try {
    return Rd(await e.get(_r));
  } catch {
    return [];
  }
}
async function We(e, t) {
  try {
    t.length === 0 ? await e.delete(_r) : await e.set(_r, JSON.stringify(t));
  } catch {
  }
}
const mo = "bitlogin:lock:v1", Nd = "bitlogin/lock/device/v1", Md = ee("bitlogin:lock:device-wrap:v1"), ie = {
  pinMin: 6,
  pinMax: 64,
  /** Wrong tries, with the PIN or the device, before the record is removed. */
  tries: 5,
  /** Unused for this long, an unlocked session locks itself. In seconds. */
  idleSec: 900
}, it = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
};
function ra(e) {
  if (typeof e != "string") return null;
  const t = e.normalize("NFKC"), o = [...t].length;
  return o >= ie.pinMin && o <= ie.pinMax ? ee(t) : null;
}
async function oa(e, t) {
  const o = J(12), n = await crypto.subtle.importKey("raw", it(e), "AES-GCM", !1, ["encrypt"]), r = await crypto.subtle.encrypt({ name: "AES-GCM", iv: it(o) }, n, it(t));
  return { iv: U(o), wrapped: U(new Uint8Array(r)) };
}
async function sa(e, t) {
  try {
    const o = await crypto.subtle.importKey("raw", it(e), "AES-GCM", !1, ["decrypt"]), n = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: it(V(t.iv)) }, o, it(V(t.wrapped))));
    return n.length === 32 ? n : null;
  } catch {
    return null;
  }
}
const ia = (e) => pt(Ln(Md, e), Nd, 32), ys = (e) => !!e && typeof e == "object" && typeof e.iv == "string" && typeof e.wrapped == "string";
async function Oe(e) {
  let t;
  try {
    t = await e.get(mo);
  } catch {
    return null;
  }
  if (!t) return null;
  try {
    const o = JSON.parse(t);
    return o.v !== 1 || typeof o.tries != "number" || !Number.isInteger(o.tries) || o.tries < 0 || !ys(o.pin) || typeof o.pin.salt != "string" || o.device !== void 0 && (!ys(o.device) || typeof o.device.credentialId != "string") ? null : { v: 1, tries: o.tries, pin: o.pin, ...o.device ? { device: o.device } : {} };
  } catch {
    return null;
  }
}
const $t = (e, t) => e.set(mo, JSON.stringify(t));
async function Ct(e) {
  try {
    await e.delete(mo);
  } catch {
  }
}
async function Od(e, t, o) {
  const n = ra(t);
  if (!n) throw new Error(`A PIN is ${ie.pinMin} to ${ie.pinMax} characters.`);
  const r = o ? o.slice() : J(32), s = J(16), i = await Ds(n, s);
  try {
    const a = o ? await Oe(e) : null;
    await $t(e, { v: 1, tries: 0, pin: { salt: U(s), ...await oa(i, r) }, ...a?.device ? { device: a.device } : {} });
  } finally {
    i.fill(0), n.fill(0);
  }
  return r;
}
async function Id(e, t, o, n) {
  const r = await Oe(e);
  if (!r) throw new Error("The lock is not on.");
  if (n.length !== 32 || !/^[A-Za-z0-9_-]{8,1400}$/u.test(o)) throw new Error("That is not a device unlock.");
  const s = ia(n);
  try {
    await $t(e, { ...r, device: { credentialId: o, ...await oa(s, t) } });
  } finally {
    s.fill(0);
  }
}
async function Ld(e) {
  const t = await Oe(e);
  t?.device && await $t(e, { v: 1, tries: t.tries, pin: t.pin });
}
async function aa(e, t) {
  const o = await Oe(e);
  if (!o) return { ok: !1, left: 0, removed: !0 };
  const n = o.tries + 1;
  await $t(e, { ...o, tries: n });
  const r = await t(o);
  return r ? (await $t(e, { ...o, tries: 0 }), { ok: !0, lockKey: r }) : n >= ie.tries ? (await Ct(e), { ok: !1, left: 0, removed: !0 }) : { ok: !1, left: ie.tries - n, removed: !1 };
}
function Dd(e, t) {
  return aa(e, async (o) => {
    const n = ra(t);
    if (!n) return null;
    const r = await Ds(n, V(o.pin.salt));
    try {
      return await sa(r, o.pin);
    } finally {
      r.fill(0), n.fill(0);
    }
  });
}
function xd(e, t) {
  return aa(e, async (o) => {
    if (!o.device || t.length !== 32) return null;
    const n = ia(t);
    try {
      return await sa(n, o.device);
    } finally {
      n.fill(0);
    }
  });
}
const Tt = "bitlogin:signer-grant:v1:", ca = "bitlogin:signer-grant-device-key:v1", Ce = {
  /** The longest a site BitLogin knows is remembered, in seconds: thirty days from Allow. */
  keepSec: 720 * 3600,
  /** The longest for a site it does not know: seven days. */
  unknownKeepSec: 168 * 3600,
  /** How many recent room passes are remembered, to count them across page loads. */
  passKept: 10,
  /** How many recent signatures are remembered, to count them across page loads. */
  signedKept: 60
}, sr = (e) => e.at ?? e.until - Pn(e.site), Pn = (e) => (D(e) ? st(e) : dc(e) !== null) ? Ce.keepSec : Ce.unknownKeepSec, Ud = /^[0-9a-f]{64}$/u;
function he(e) {
  if (typeof e != "string" || e.length > 300 || e.includes("*")) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin === e ? t.origin : "";
  } catch {
    return "";
  }
}
const bo = (e) => D(e) || he(e), fs = (e) => btoa(Array.from(e, (t) => String.fromCharCode(t)).join("")), hs = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), ps = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}, $d = (e) => Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
async function tn(e, t, o) {
  const n = bo(t.site);
  if (!n || t.everydayPrivateKey.length !== 32 || typeof e.getOrCreateDeviceKey != "function" || D(n) && t.permissions) return !1;
  const r = Math.min(Math.floor(t.until), Math.floor(o) + Pn(n));
  if (!(r > o)) return !1;
  const s = crypto.getRandomValues(new Uint8Array(12));
  try {
    const i = await e.getOrCreateDeviceKey(ca), a = JSON.stringify({
      site: n,
      key: $d(t.everydayPrivateKey),
      until: r,
      ...t.name ? { name: t.name.slice(0, 48) } : {},
      ...Me(t.profile) ? { profile: Me(t.profile) } : {},
      // An application's public signatures are counted up to its own hourly limit, so more of them are kept.
      signed: t.signed.filter((d) => Number.isFinite(d)).slice(-(t.permissions ? wn.public.hourly : Ce.signedKept)),
      ...t.permissions ? { permissions: t.permissions } : {},
      ...!t.permissions && !D(n) && we(t.more).length ? { more: we(t.more) } : {},
      ...typeof t.at == "number" ? { at: Math.floor(t.at) } : {},
      ...!D(n) && D(t.memberOf) ? { memberOf: D(t.memberOf) } : {},
      ...typeof t.device == "string" && /^[0-9a-f]{32}$/u.test(t.device) ? { device: t.device } : {},
      ...pe(t.relays).length ? { relays: pe(t.relays) } : {},
      ...typeof t.checkedAt == "number" ? { checkedAt: Math.floor(t.checkedAt) } : {},
      ...typeof t.seenAt == "number" ? { seenAt: Math.floor(t.seenAt) } : {},
      ...t.signedPass?.length ? { signedPass: t.signedPass.filter((d) => Number.isFinite(d)).slice(-Ce.passKept) } : {},
      ...t.permissions && t.signedSensitive ? { signedSensitive: t.signedSensitive.filter((d) => Number.isFinite(d)).slice(-wn.sensitive.hourly) } : {}
    }), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: s }, i, new TextEncoder().encode(a)), l = { v: 1, iv: fs(s), ciphertext: fs(new Uint8Array(c)) };
    return await e.set(Tt + n, JSON.stringify(l)), !0;
  } catch {
    return !1;
  }
}
async function nn(e, t, o) {
  const n = bo(t);
  if (!n || typeof e.getOrCreateDeviceKey != "function") return null;
  try {
    const r = await e.get(Tt + n);
    if (!r) return null;
    const s = JSON.parse(r);
    if (s.v !== 1 || typeof s.iv != "string" || typeof s.ciphertext != "string") return null;
    const i = await e.getOrCreateDeviceKey(ca), a = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ps(hs(s.iv)) }, i, ps(hs(s.ciphertext))), c = JSON.parse(new TextDecoder().decode(a)), l = (h) => typeof h == "number" && Number.isFinite(h) && h > 0 ? Math.floor(h) : void 0, d = Me(c.profile), y = c.permissions === void 0 ? void 0 : Jr(c.permissions);
    if (y === null || y && (D(n) || !Hr(n, y)))
      return await e.delete(Tt + n), null;
    const f = (h, p) => Array.isArray(h) ? h.filter((w) => typeof w == "number" && Number.isFinite(w)).slice(-p) : [];
    return c.site !== n || typeof c.key != "string" || !Ud.test(c.key) || typeof c.until != "number" ? null : !(c.until > o) || c.until > o + Ce.keepSec ? (await e.delete(Tt + n), null) : {
      site: n,
      everydayPrivateKey: Uint8Array.from(c.key.match(/.{2}/gu) ?? [], (h) => Number.parseInt(h, 16)),
      until: c.until,
      ...typeof c.name == "string" && c.name ? { name: c.name.slice(0, 48) } : {},
      ...d ? { profile: d } : {},
      signed: f(c.signed, y ? wn.public.hourly : Ce.signedKept),
      ...f(c.signedPass, Ce.passKept).length ? { signedPass: f(c.signedPass, Ce.passKept) } : {},
      ...!y && !D(n) && we(c.more).length ? { more: we(c.more) } : {},
      ...l(c.at) ? { at: l(c.at) } : {},
      ...!D(n) && D(c.memberOf) ? { memberOf: D(c.memberOf) } : {},
      ...typeof c.device == "string" && /^[0-9a-f]{32}$/u.test(c.device) ? { device: c.device } : {},
      ...pe(c.relays).length ? { relays: pe(c.relays) } : {},
      ...l(c.checkedAt) ? { checkedAt: l(c.checkedAt) } : {},
      ...l(c.seenAt) ? { seenAt: l(c.seenAt) } : {},
      ...y ? { permissions: y, signedSensitive: f(c.signedSensitive, wn.sensitive.hourly) } : {}
    };
  } catch {
    return null;
  }
}
function Fd(e) {
  return e.app && e.family ? [{ site: e.site, permissions: e.app.permissions, memberOf: e.family }, { site: e.family }] : e.family ? [{ site: e.family }] : e.app ? [{ site: e.site, permissions: e.app.permissions }] : [{ site: e.site, ...e.more.length ? { more: we(e.more) } : {} }];
}
async function rn(e, t) {
  const o = bo(t);
  if (o)
    try {
      await e.delete(Tt + o);
    } catch {
    }
}
const la = "bitlogin:signer-handoff:v1", qd = /* @__PURE__ */ new Set([
  "configure",
  "getPublicKey",
  "signEvent",
  "getSessionStatus",
  "logout",
  "handoffBegin",
  "handoffAccept",
  // A headset signed in from a phone (docs/pair-a-headset.md): begun, heard and cancelled in its signer frame, which
  // may be a guest's. What arrives is opened as a hand-off is.
  "pairBegin",
  "pairPoll",
  "pairCancel",
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
]), Pr = /^[0-9a-f]{64}$/;
function Bd(e) {
  return Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
}
function Wd(e) {
  return Uint8Array.from(e.match(/.{2}/g) ?? [], (t) => Number.parseInt(t, 16));
}
const ua = /^[0-9a-f]{32}$/u;
function ws(e, t, o, n, r = {}) {
  if (!Pr.test(t)) throw new Error("The hand-off has no usable recipient key.");
  if (e.length !== 32) throw new Error("No identity is unlocked in this session.");
  let s = null;
  if (n !== void 0) {
    const f = he(n.site), h = Jr(n.permissions);
    if (!f || !h || !Hr(f, h)) throw new Error("That is not a permission set an application may be given.");
    s = { site: f, permissions: h };
  }
  const i = r.site === void 0 ? "" : he(r.site);
  if (r.site !== void 0 && (!i || s && s.site !== i)) throw new Error("The hand-off names no usable site.");
  const a = Me(r.profile), c = !!i && r.visitOnly !== !0 && r.remember === !0, l = r.family === void 0 ? "" : D(r.family);
  if (r.family !== void 0 && (!l || s && !st(l) || !c || !Ee(i, l))) throw new Error("That is not a family this site may be allowed as.");
  const d = we(r.more);
  if (r.more !== void 0 && (d.length === 0 || !i || s || l)) throw new Error("That is not something this site may be let do.");
  const y = new Q(o.slice());
  try {
    const f = JSON.stringify({ v: 1, purpose: la, key: Bd(e), ...s ? { app: s } : {}, ...i ? { site: i } : {}, ...a ? { profile: a } : {}, ...c ? { remember: !0 } : {}, ...typeof r.at == "number" && Number.isFinite(r.at) ? { at: Math.floor(r.at) } : {}, ...pe(r.relays).length ? { relays: pe(r.relays) } : {}, ...l ? { family: l } : {}, ...d.length ? { more: d } : {}, ...typeof r.device == "string" && ua.test(r.device) ? { device: r.device } : {} });
    return { senderPublicKey: y.getPublicKey(), payload: y.nip44Encrypt(t, f) };
  } finally {
    y.destroy();
  }
}
function da(e, t) {
  if (!e || !Pr.test(e.senderPublicKey) || typeof e.payload != "string")
    throw new Error("That is not a signer hand-off.");
  const o = new Q(t.slice());
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
  if (r.v !== 1 || r.purpose !== la || typeof r.key != "string" || !Pr.test(r.key))
    throw new Error("That is not a signer hand-off.");
  const s = Wd(r.key);
  try {
    K(s);
  } catch {
    throw s.fill(0), new Error("The hand-off carried an unusable key.");
  }
  const i = r.site === void 0 ? null : he(r.site);
  if (i === "")
    throw s.fill(0), new Error("The hand-off names no usable site.");
  const a = Me(r.profile), c = r.remember === !0 && !!i, l = typeof r.at == "number" && Number.isFinite(r.at) && r.at > 0 ? Math.floor(r.at) : null, d = pe(r.relays), y = r.family === void 0 ? null : D(r.family);
  if (y === "" || y && (r.app !== void 0 && !st(y) || !c || !Ee(i, y)))
    throw s.fill(0), new Error("The hand-off names a family it cannot be kept for.");
  const f = we(r.more);
  if (r.more !== void 0 && (f.length === 0 || !i || y || r.app !== void 0))
    throw s.fill(0), new Error("The hand-off carries something this site may not be let do.");
  const h = typeof r.device == "string" && ua.test(r.device) ? { device: r.device } : {};
  if (r.app === void 0) return { key: s, app: null, site: i, profile: a, remember: c, at: l, relays: d, family: y, more: f, ...h };
  const p = r.app, w = p && typeof p == "object" ? he(p.site) : "", m = p && typeof p == "object" ? Jr(p.permissions) : null;
  if (!w || !m || !Hr(w, m) || i && i !== w)
    throw s.fill(0), new Error("The hand-off carried a permission set that cannot be read.");
  return { key: s, app: { site: w, permissions: m }, site: w, profile: a, remember: c, at: l, relays: d, family: y, more: [], ...h };
}
const ya = 38e3, fa = "38172", Vd = ["https://testnut.cashu.space", "https://nofees.testnut.cashu.space"], jd = 8;
function Gd(e, t, o = 10) {
  const n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  for (const s of e)
    if (!(s.kind !== ya || !s.tags.some((i) => i[0] === "k" && i[1] === fa)))
      for (const i of s.tags) {
        if (i[0] !== "u" || i[2] !== void 0 && i[2] !== "cashu") continue;
        const a = at(i[1]);
        if (!a || !a.startsWith("https://") || Vd.includes(a)) continue;
        const c = r.get(s.pubkey) ?? /* @__PURE__ */ new Set();
        !c.has(a) && c.size >= jd || (c.add(a), r.set(s.pubkey, c), (n.get(a) ?? n.set(a, /* @__PURE__ */ new Set()).get(a)).add(s.pubkey));
      }
  return [...n].map(([s, i]) => ({ mint: s, by: i.size, byFollowed: [...i].filter((a) => t.has(a)).length })).filter((s) => s.by >= 2 || s.byFollowed >= 1).sort((s, i) => i.byFollowed - s.byFollowed || i.by - s.by || s.mint.localeCompare(i.mint)).slice(0, o);
}
const Sr = 30078, Kr = "bitlogin-receipt:", Sn = 300, Kn = "bitlogin:receipts:v1:";
function ko(e, t) {
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
    via: pn(o?.via) || ""
  };
}
async function Eo(e, t) {
  const o = t.getPublicKey(), n = /* @__PURE__ */ new Map(), r = async (i) => {
    try {
      const a = await e.get(i);
      return a ? JSON.parse(t.nip44Decrypt(o, a)) : null;
    } catch {
      return null;
    }
  }, s = await r(Kn + o);
  for (const i of Array.isArray(s?.ids) ? s.ids.slice(0, Sn) : []) {
    if (typeof i != "string") continue;
    const a = await r(`${Kn}${o}:${i}`), c = ko(a, o);
    c && c.event.id === i && n.set(i, { ...c, saved: a?.saved === !0 });
  }
  return n;
}
async function _o(e, t, o, n) {
  const r = t.getPublicKey(), s = (i) => t.nip44Encrypt(r, JSON.stringify(i));
  for (const i of n) {
    const a = o.get(i);
    a && await e.set(`${Kn}${r}:${i}`, s(a));
  }
  await e.set(Kn + r, s({ ids: [...o.keys()] }));
}
const An = (e, t) => ({
  receipts: [...e.values()].map(({ event: o, title: n, via: r }) => ({ event: o, title: n, via: r })).sort((o, n) => n.event.created_at - o.event.created_at),
  offline: t,
  unsaved: [...e.values()].some((o) => !o.saved)
});
async function ha(e, t) {
  const { signer: o, store: n, relays: r } = e, s = o.getPublicKey(), i = Math.floor(e.now ?? Date.now() / 1e3), a = [];
  for (const [c, l] of t) {
    if (l.saved) continue;
    const d = o.signEvent({ kind: Sr, created_at: i, tags: [["d", Kr + c]], content: o.nip44Encrypt(s, JSON.stringify({ v: 1, event: l.event, title: l.title, via: l.via })) });
    Y(await r.publishAll(d, 6e3).catch(() => [])) >= Math.min(2, r.relayUrls.length) && (l.saved = !0, a.push(c));
  }
  a.length && await _o(n, o, t, a);
}
async function Jd(e) {
  return An(await Eo(e.store, e.signer), !0);
}
async function Hd(e) {
  const { signer: t, store: o, relays: n } = e, r = t.getPublicKey(), s = await Eo(o, t), i = await n.queryQuorum({ kinds: [Sr], authors: [r], limit: 500 }, 6e3).catch(() => null);
  if (!i || i.respondedCount === 0) return An(s, !0);
  const a = /* @__PURE__ */ new Set(), c = [];
  for (const l of i.outcomes.flatMap((d) => d.events)) {
    if (l.kind !== Sr || l.pubkey !== r || !C(l)) continue;
    const d = l.tags.find((f) => f[0] === "d")?.[1];
    if (typeof d != "string" || !d.startsWith(Kr)) continue;
    let y;
    try {
      y = ko(JSON.parse(t.nip44Decrypt(r, l.content)), r);
    } catch {
      continue;
    }
    !y || y.event.id !== d.slice(Kr.length) || (a.add(y.event.id), !(s.has(y.event.id) || s.size >= Sn) && (s.set(y.event.id, { ...y, saved: !0 }), c.push(y.event.id)));
  }
  for (const [l, d] of s)
    a.has(l) !== d.saved && (d.saved = a.has(l), c.push(l));
  return await _o(o, t, s, c), await ha(e, s), An(s, !1);
}
async function zd(e, t) {
  const { signer: o, store: n } = e, r = o.getPublicKey(), s = Array.isArray(t) ? t.slice(0, Sn).map((c) => ko(c, r)) : [];
  if (s.length === 0 || s.some((c) => !c)) throw new Error("That is not a receipt of this account's.");
  const i = await Eo(n, o), a = [];
  for (const c of s)
    if (!i.has(c.event.id)) {
      if (i.size >= Sn) throw new Error("This account keeps as many receipts as it can.");
      i.set(c.event.id, { ...c, saved: !1 }), a.push(c.event.id);
    }
  return await _o(n, o, i, a), await ha(e, i).catch(() => {
  }), An(i, !1);
}
function pa(e) {
  const t = e;
  if (!t || typeof t != "object") return null;
  const o = js(t.listing);
  if (!o || typeof t.order != "string" || !/^order_[A-Za-z0-9_-]{12,80}$/u.test(t.order) || typeof t.key != "string" || !/^[A-Za-z0-9_-]{16,128}$/u.test(t.key)) return null;
  const n = pn(t.service);
  return n ? { listing: o, order: t.order, key: t.key, service: n, title: typeof t.title == "string" ? t.title.slice(0, 80) : "", via: pn(t.via) || "", client: typeof t.client == "string" && /^[0-9a-f]{64}$/u.test(t.client) ? t.client : "", at: typeof t.at == "number" && Number.isFinite(t.at) ? t.at : 0 } : null;
}
const wa = (e) => Array.isArray(e) ? e.map(pa).filter((t) => !!t).slice(-20) : [], Ar = 30078, Rr = "bitlogin-pay-settings", va = "bitlogin:pay-settings:v1:";
async function ga({ signer: e, store: t }) {
  const o = e.getPublicKey();
  try {
    const n = await t.get(va + o), r = n ? JSON.parse(e.nip44Decrypt(o, n)) : null;
    return r && typeof r.at == "number" ? { limitSats: zr(r.limitSats), orders: wa(r.orders), at: r.at, saved: r.saved === !0 } : null;
  } catch {
    return null;
  }
}
const Rn = ({ signer: e, store: t }, o) => t.set(va + e.getPublicKey(), e.nip44Encrypt(e.getPublicKey(), JSON.stringify(o)));
async function ma(e, t) {
  const { signer: o, relays: n } = e, r = o.getPublicKey(), s = o.signEvent({ kind: Ar, created_at: Math.floor(t.at), tags: [["d", Rr]], content: o.nip44Encrypt(r, JSON.stringify({ v: 1, limitSats: t.limitSats, orders: t.orders, at: t.at })) });
  return Y(await n.publishAll(s, 5e3).catch(() => [])) >= Math.min(2, n.relayUrls.length);
}
async function Qd(e) {
  const { signer: t, relays: o } = e, n = t.getPublicKey();
  let r = await ga(e);
  const s = await o.queryQuorum({ kinds: [Ar], authors: [n], "#d": [Rr], limit: 2 }, 3e3).catch(() => null);
  if (s && s.respondedCount > 0) {
    const i = s.outcomes.flatMap((c) => c.events).filter((c) => c.kind === Ar && c.pubkey === n && c.tags.some((l) => l[0] === "d" && l[1] === Rr) && C(c)).sort((c, l) => l.created_at - c.created_at)[0];
    let a = null;
    try {
      const c = i ? JSON.parse(t.nip44Decrypt(n, i.content)) : null;
      c && (a = { limitSats: zr(c.limitSats), orders: wa(c.orders), at: typeof c.at == "number" ? c.at : i.created_at, saved: !0 });
    } catch {
      a = null;
    }
    a && (!r || a.at > r.at) ? (r = a, await Rn(e, r)) : r && (!r.saved || !a) && (r.saved = await ma(e, r), await Rn(e, r));
  }
  return { limitSats: r?.limitSats ?? Vs.default, orders: r?.orders ?? [], unsaved: !!r && !r.saved };
}
async function Yd(e, t) {
  const o = t ?? {}, n = await ga(e), r = { limitSats: n?.limitSats ?? Vs.default, orders: n?.orders ?? [], at: e.now ?? Date.now() / 1e3, saved: !1 };
  if (o.limitSats !== void 0) {
    if (zr(o.limitSats) !== o.limitSats) throw new Error("That is not a limit this wallet keeps.");
    r.limitSats = o.limitSats;
  } else if (o.addOrder !== void 0) {
    const s = pa({ ...o.addOrder, at: r.at });
    if (!s) throw new Error("That is not an order this wallet can keep.");
    r.orders = [...r.orders.filter((i) => !(i.listing === s.listing && i.service === s.service)), s].slice(-20);
  } else if (typeof o.removeOrder == "string")
    r.orders = r.orders.filter((s) => s.order !== o.removeOrder);
  else throw new Error("That is not a change this wallet keeps.");
  return await Rn(e, r), r.saved = await ma(e, r).catch(() => !1), r.saved && await Rn(e, r), { limitSats: r.limitSats, orders: r.orders, unsaved: !r.saved };
}
const Xd = { enough: 2, graceMs: 700 };
function Zd(e, t, o = Xd) {
  const n = e.map((s) => t(s)), r = (s, i) => new Promise((a) => {
    const c = [];
    let l = n.length, d = 0, y = null, f = !1;
    const h = () => {
      f || (f = !0, y && clearTimeout(y), a(c));
    };
    if (l === 0) return h();
    for (const p of n)
      s(p).then((w) => {
        f || (c.push(w), i(w) && d++);
      }).catch(() => {
      }).finally(() => {
        if (l--, l === 0) return h();
        d >= Math.min(o.enough, n.length) && !y && (y = setTimeout(h, o.graceMs));
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
const Cr = 30078, Tr = "bitlogin-drive:", Pt = 10063, ey = 24242, Nt = "bitlogin:drive:v1:", ty = { autoPaySats: 0, at: 0, saved: !0 }, Po = (e) => {
  const t = e?.autoPaySats;
  return { autoPaySats: typeof t == "number" && Number.isSafeInteger(t) && t >= 0 && t <= 1e5 ? t : 0 };
};
async function So(e, t) {
  const o = t.getPublicKey(), n = { folders: /* @__PURE__ */ new Map(), removed: /* @__PURE__ */ new Map(), settings: { ...ty } }, r = async (a) => {
    try {
      const c = await e.get(a);
      return c ? JSON.parse(t.nip44Decrypt(o, c)) : null;
    } catch {
      return null;
    }
  }, s = await r(Nt + o);
  if (!s) return n;
  for (const a of Array.isArray(s.folders) ? s.folders.slice(0, Xr.folders + 1) : []) {
    if (typeof a != "string") continue;
    const c = await r(`${Nt}${o}:${a}`), l = Yr(c?.folder);
    l && n.folders.set(l.id, { folder: l, saved: c?.saved === !0 });
  }
  for (const a of Array.isArray(s.removed) ? s.removed : [])
    Array.isArray(a) && typeof a[0] == "string" && typeof a[1] == "number" && n.removed.set(a[0], a[1]);
  const i = s.settings;
  return n.settings = { ...Po(i), at: typeof i?.at == "number" ? i.at : 0, saved: i?.saved !== !1 }, n;
}
async function Ko(e, t, o, n, r = []) {
  const s = t.getPublicKey(), i = (a) => t.nip44Encrypt(s, JSON.stringify(a));
  for (const a of n) {
    const c = o.folders.get(a);
    c && await e.set(`${Nt}${s}:${a}`, i(c));
  }
  for (const a of r) await e.delete(`${Nt}${s}:${a}`).catch(() => {
  });
  await e.set(Nt + s, i({ folders: [...o.folders.keys()], removed: [...o.removed], settings: o.settings }));
}
const ir = (e, t) => Y(e) >= Math.min(2, t);
function ar(e, t, o, n) {
  const r = e.getPublicKey();
  return e.signEvent({ kind: Cr, created_at: Math.floor(n), tags: [["d", Tr + t]], content: e.nip44Encrypt(r, JSON.stringify(o)) });
}
const Cn = (e, t) => ({
  folders: [...e.folders.values()].map((o) => o.folder),
  settings: { autoPaySats: e.settings.autoPaySats },
  offline: t,
  unsaved: [...e.folders.values()].some((o) => !o.saved) || e.removed.size > 0 || !e.settings.saved
});
async function ba(e, t) {
  const { signer: o, store: n, relays: r } = e, s = e.now ?? Date.now() / 1e3, i = [];
  for (const [a, c] of t.folders)
    c.saved || !ir(await r.publishAll(ar(o, a, { v: 1, folder: c.folder }, Math.max(s, c.folder.at)), 6e3).catch(() => []), r.relayUrls.length) || (c.saved = !0, i.push(a));
  for (const [a, c] of [...t.removed])
    ir(await r.publishAll(ar(o, a, { v: 1, deleted: !0, at: c }, Math.max(s, c)), 6e3).catch(() => []), r.relayUrls.length) && t.removed.delete(a);
  t.settings.saved || ir(await r.publishAll(ar(o, "settings", { v: 1, settings: { autoPaySats: t.settings.autoPaySats }, at: t.settings.at }, Math.max(s, t.settings.at)), 6e3).catch(() => []), r.relayUrls.length) && (t.settings.saved = !0), await Ko(n, o, t, i);
}
async function ny(e) {
  return Cn(await So(e.store, e.signer), !0);
}
async function ry(e) {
  const { signer: t, store: o, relays: n } = e, r = t.getPublicKey(), s = await So(o, t), i = await n.queryQuorum({ kinds: [Cr], authors: [r], limit: 500 }, 6e3).catch(() => null);
  if (!i || i.respondedCount === 0) return Cn(s, !0);
  const a = /* @__PURE__ */ new Map();
  for (const d of i.outcomes.flatMap((y) => y.events)) {
    if (d.kind !== Cr || d.pubkey !== r || !C(d)) continue;
    const y = d.tags.find((h) => h[0] === "d")?.[1];
    if (typeof y != "string" || !y.startsWith(Tr)) continue;
    const f = y.slice(Tr.length);
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
      const w = typeof f.at == "number" ? f.at : y.created_at;
      (s.settings.saved || w > s.settings.at) && (s.settings = { ...Po(f.settings), at: w, saved: !0 });
      continue;
    }
    const h = s.folders.get(d);
    if (f.deleted === !0) {
      const w = typeof f.at == "number" ? f.at : y.created_at;
      h && (h.saved || h.folder.at <= w) && (s.folders.delete(d), l.push(d)), s.removed.delete(d);
      continue;
    }
    const p = Yr(f.folder);
    !p || p.id !== d || s.removed.has(d) || h && !h.saved && h.folder.at >= p.at || h && h.saved && h.folder.at >= p.at || (s.folders.set(d, { folder: p, saved: !0 }), c.push(d));
  }
  for (const [d, y] of s.folders) a.has(d) || (y.saved = !1);
  return await Ko(o, t, s, c, l), await ba(e, s), Cn(s, !1);
}
async function oy(e, t) {
  const { signer: o, store: n } = e, r = e.now ?? Date.now() / 1e3, s = (t.save ?? []).map(Yr);
  if (s.some((l) => !l)) throw new Error("That is not a folder this drive can keep.");
  const i = await So(n, o), a = [], c = [];
  for (const l of s)
    i.folders.set(l.id, { folder: l, saved: !1 }), i.removed.delete(l.id), a.push(l.id);
  for (const l of t.remove ?? [])
    typeof l != "string" || !/^[0-9a-f]{16}$/u.test(l) || (i.folders.delete(l), i.removed.set(l, Math.floor(r)), c.push(l));
  if (i.folders.size > Xr.folders + 1) throw new Error("There are too many folders.");
  return t.settings !== void 0 && (i.settings = { ...Po(t.settings), at: Math.floor(r), saved: !1 }), await Ko(n, o, i, a, c), await ba(e, i), Cn(i, !1);
}
function sy(e, t, o = Date.now() / 1e3) {
  const n = Zr(t.server), r = t.verb;
  if (!n || r !== "upload" && r !== "delete" && r !== "get") throw new Error("That is not something a file server is asked.");
  const s = typeof t.sha256 == "string" && /^[0-9a-f]{64}$/u.test(t.sha256) ? t.sha256 : "";
  if (!s) throw new Error("A permission note names the one file it is for.");
  const i = e.signEvent({
    kind: ey,
    // In the past, as a server requires, by a margin wider than two clocks usually differ.
    created_at: Math.floor(o) - 30,
    tags: [["t", r], ["expiration", String(Math.floor(o) + 300)], ["server", new URL(n).hostname.toLowerCase()], ["x", s]],
    content: r === "upload" ? "Upload a file" : r === "delete" ? "Delete a file" : "Fetch a file"
  }), a = new TextEncoder().encode(JSON.stringify(i));
  let c = "";
  for (const l of a) c += String.fromCharCode(l);
  return btoa(c).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}
const ka = (e) => [...new Set(e.tags.filter((t) => t[0] === "server").map((t) => Zr(t[1])).filter(Boolean))];
function iy(e, t, o = 12) {
  const n = /* @__PURE__ */ new Map();
  for (const s of e) s.kind === Pt && (!n.has(s.pubkey) || n.get(s.pubkey).created_at < s.created_at) && n.set(s.pubkey, s);
  const r = /* @__PURE__ */ new Map();
  for (const s of n.values()) for (const i of ka(s).filter((a) => a.startsWith("https://")).slice(0, 6)) (r.get(i) ?? r.set(i, /* @__PURE__ */ new Set()).get(i)).add(s.pubkey);
  return [...r].map(([s, i]) => ({ server: s, by: i.size, byFollowed: [...i].filter((a) => t.has(a)).length })).filter((s) => s.by >= 2 || s.byFollowed >= 1).sort((s, i) => i.byFollowed - s.byFollowed || i.by - s.by || s.server.localeCompare(i.server)).slice(0, o);
}
const ay = "bitlogin/ecash-seed/v1", cy = "nut13";
function vs(e) {
  if (!(e instanceof Uint8Array) || e.length !== 32) throw new Error("An account key is 32 bytes.");
  return pt(Ln(Dn(ay), e), cy, 64);
}
const Nr = (e) => Array.from(e, (t) => t.toString(16).padStart(2, "0")).join(""), Ea = /^[0-9a-f]{16}$|^[0-9a-f]{66}$/u, Ao = 2 ** 31 - 1, gs = al;
function Ro(e, t) {
  return typeof gs == "function" ? gs(e, t) : (o) => ({ secret: sl(e, t, o), blindingFactor: ol(e, t, o) });
}
function Co(e, t) {
  const o = e(t), n = new TextEncoder().encode(Nr(o.secret)), { r, B_: s } = il(n, BigInt(`0x${Nr(o.blindingFactor)}`));
  return { secret: n, r, B_: s.toHex(!0) };
}
const _a = (e) => {
  if (typeof e != "string" || !Ea.test(e)) throw new Error("That is not a keyset id.");
  return e;
};
function ly(e, t, o, n) {
  const r = _a(t);
  if (!Number.isSafeInteger(n) || n < 1 || n > 200) throw new Error("Between one and two hundred at a time.");
  if (!Number.isSafeInteger(o) || o < 1 || o + n > Ao) throw new Error("That counter is out of range.");
  const s = Ro(e, r), i = [];
  for (let a = o; a < o + n; a++)
    try {
      i.push({ counter: a, id: r, B_: Co(s, a).B_ });
    } catch {
    }
  return i;
}
const ms = (e) => {
  if (!/^(?:[0-9a-f]{2})+$/u.test(e)) throw new Error("That is not hex.");
  return new Uint8Array(e.match(/../gu).map((t) => parseInt(t, 16)));
};
function To(e, t) {
  const o = t?.keys;
  if (!o || typeof o != "object" || Object.keys(o).length === 0 || Object.keys(o).length > 64) throw new Error("Those are not a keyset's keys.");
  if ((e.startsWith("00") ? Qo(o, { versionByte: 0 }) : Qo(o, { versionByte: 1, unit: t.unit ?? "sat", ...t.input_fee_ppk ? { input_fee_ppk: t.input_fee_ppk } : {}, ...t.final_expiry ? { expiry: t.final_expiry } : {} })) !== e) throw new Error("Those keys are not this keyset's.");
  return o;
}
function uy(e, t, o, n) {
  const r = _a(t), s = To(r, o);
  if (!Array.isArray(n) || n.length > 1e3) throw new Error("At most a thousand at a time.");
  const i = n.map((l) => l?.counter);
  if (new Set(i).size !== i.length) throw new Error("Each counter is finished once.");
  const a = Ro(e, r), c = { id: r, keys: s };
  return n.map((l) => {
    if (!Number.isSafeInteger(l?.counter) || l.counter < 1 || l.counter >= Ao || !Number.isSafeInteger(l.amount) || l.amount < 1 || typeof l.C_ != "string") throw new Error("That is not a signature for a counter.");
    const d = s[String(l.amount)];
    if (typeof d != "string") throw new Error("This keyset has no key for that amount.");
    const y = Co(a, l.counter);
    if (!(typeof l.dleq?.e == "string" && typeof l.dleq?.s == "string")) throw Object.assign(new Error("This mint doesn't prove what it signs."), { code: "no-dleq" });
    if (!nl({ e: ms(l.dleq.e), s: ms(l.dleq.s) }, er(y.B_), er(l.C_), er(d))) throw new Error("That signature isn't proved to be the mint's.");
    return new rl({ amount: zo.from(l.amount), id: r, B_: y.B_ }, y.r, y.secret).toProof({ id: r, amount: zo.from(l.amount), C_: l.C_ }, c);
  });
}
function Pa(e, t, o, n) {
  if (typeof t != "string" || !Ea.test(t)) throw new Error("That is not a keyset id.");
  if (!Array.isArray(o) || o.length === 0 || o.length > 100) throw new Error("Between one and a hundred outputs.");
  if (!o.every((a) => Number.isSafeInteger(a) && a > 0 && a <= 2 ** 30)) throw new Error("Each output is a whole number of sats.");
  if (!Number.isSafeInteger(n) || n < 1 || n + o.length * 2 > Ao) throw new Error("That counter is out of range.");
  const r = [], s = Ro(e, t);
  let i = n;
  for (const a of o)
    for (; ; ) {
      const c = i++;
      try {
        const l = Co(s, c);
        r.push({ amount: a, id: t, B_: l.B_, blindingFactor: l.r.toString(16).padStart(64, "0"), secret: Nr(l.secret), counter: c });
        break;
      } catch (l) {
        if (i - n > o.length * 2) throw l;
      }
    }
  return { outputs: r, next: i };
}
const Fn = /^[0-9a-f]{16}$|^[0-9a-f]{66}$/u, ze = (e) => {
  if (typeof e != "string" || !Fn.test(e)) throw new Error("That is not a keyset id.");
  return e;
}, qn = (e, t) => `bitlogin:ecash-lane:v1:${e}:${ze(t)}`, dy = (e, t) => `bitlogin:ecash-trial-next:v1:${e}:${t}`, Sa = (e) => `bitlogin:ecash-counters:v1:${e}`, Ft = () => {
  const e = globalThis.navigator?.locks;
  return e && typeof e.request == "function" ? ((t, o) => e.request(t, o)) : null;
}, Ka = "This browser can't keep two tabs from using the same counters, so the seed isn't used in it.", Bn = (e, t, o) => e.lock ? e.lock(t, o) : Promise.reject(Object.assign(new Error(Ka), { code: "no-seed-here" })), No = (e) => `bitlogin:ecash-seed:${e}`;
async function Wn(e, t) {
  const o = e.signer.getPublicKey(), n = await e.store.get(t);
  if (!n) return null;
  try {
    return JSON.parse(e.signer.nip44Decrypt(o, n));
  } catch {
    return null;
  }
}
async function vt(e, t, o) {
  const n = e.signer.getPublicKey();
  await e.store.set(t, e.signer.nip44Encrypt(n, JSON.stringify(o)));
}
async function zt(e, t) {
  return Js(await Wn(e, qn(e.signer.getPublicKey(), t)));
}
const Qt = (e) => {
  if (!e.lock) throw Object.assign(new Error(Ka), { code: "no-seed-here" });
};
async function yy(e, t) {
  return Qt(e), zt(e, t);
}
async function fy(e, t, o, n) {
  Qt(e);
  const r = e.seed();
  try {
    return ly(r, t, o, n);
  } finally {
    r.fill(0);
  }
}
async function hy(e, t, o, n) {
  Qt(e);
  const r = ze(t);
  await Io(e, r, o);
  const s = e.seed();
  try {
    return uy(s, r, o, n);
  } finally {
    s.fill(0);
  }
}
const Aa = (e) => ({ amount: e.amount, id: e.id, B_: e.B_, counter: e.counter }), Ra = (e) => `bitlogin:ecash-keypins:v1:${e}`, Mr = /^[0-9a-f]{64}$/u, Ca = (e) => {
  const t = Object.entries(e?.keys ?? {}).sort(([o], [n]) => Number(o) - Number(n) || o.localeCompare(n));
  return Array.from(Dn(JSON.stringify(t)), (o) => o.toString(16).padStart(2, "0")).join("");
};
async function Vn(e) {
  const t = await Wn(e, Ra(e.signer.getPublicKey())), o = {};
  for (const [n, r] of Object.entries(t && typeof t == "object" ? t : {})) {
    if (!Fn.test(n)) continue;
    typeof r == "string" && Mr.test(r) && (o[n] = { hash: r, at: 0 });
    const s = r;
    s && typeof s == "object" && typeof s.hash == "string" && Mr.test(s.hash) && Number.isSafeInteger(s.at) && s.at >= 0 && (o[n] = { hash: s.hash, at: s.at });
  }
  return o;
}
const Mo = (e, t) => vt(e, Ra(e.signer.getPublicKey()), t), py = "These aren't the keys this mint's keyset was first used with here.", bs = /* @__PURE__ */ new Map();
function Oo(e, t) {
  const o = e.signer.getPublicKey(), n = Ft();
  if (n) return n(`bitlogin:ecash-keypins:${o}`, t);
  const r = (bs.get(o) ?? Promise.resolve()).then(t, t);
  return bs.set(o, r.catch(() => {
  })), r;
}
async function Io(e, t, o) {
  To(t, o);
  const n = Ca(o);
  return Oo(e, async () => {
    const r = await Vn(e);
    if (r[t] && r[t].hash !== n) throw Object.assign(new Error(py), { code: "pin-mismatch" });
    r[t] || await Mo(e, { ...r, [t]: { hash: n, at: Math.floor(Date.now() / 1e3) } });
  });
}
async function wy(e, t, o) {
  const n = ze(t);
  To(n, o);
  const r = { hash: Ca(o), at: Math.floor(Date.now() / 1e3) };
  return Oo(e, async () => {
    const s = await Vn(e), i = Math.max(r.at, (s[n]?.at ?? 0) + 1);
    return await Mo(e, { ...s, [n]: { hash: r.hash, at: i } }), { hash: r.hash, at: i };
  });
}
function vy(e, t) {
  return Oo(e, async () => {
    const o = await Vn(e), n = t.filter((r) => Fn.test(r.keysetId) && Mr.test(r.hash) && (!o[r.keysetId] || (r.at ?? 0) > o[r.keysetId].at));
    n.length && await Mo(e, { ...o, ...Object.fromEntries(n.map((r) => [r.keysetId, { hash: r.hash, at: r.at ?? 0 }])) });
  });
}
async function gy(e, t, o) {
  const n = qn(e.signer.getPublicKey(), t), r = Js(o);
  if (!r) throw new Error("That is not a lane.");
  const s = await zt(e, t);
  return s && (s.lane !== r.lane || r.next <= s.next) ? s : (await vt(e, n, r), await Lo(e, t, r), r);
}
async function Ta(e) {
  const t = await Wn(e, Sa(e.signer.getPublicKey())), o = {};
  for (const [n, r] of Object.entries(t && typeof t == "object" ? t : {}))
    if (!(!Fn.test(n) || !r || typeof r != "object"))
      for (const [s, i] of Object.entries(r)) Gs(Number(s)) && Number.isSafeInteger(i) && ((o[n] ??= {})[s] = i);
  return o;
}
const ks = /* @__PURE__ */ new Map();
async function Lo(e, t, o) {
  const n = e.signer.getPublicKey(), r = async () => {
    const a = await Ta(e), c = a[t] ??= {};
    (c[String(o.lane)] ?? 0) >= o.next || (c[String(o.lane)] = o.next, await vt(e, Sa(n), a));
  }, s = Ft();
  if (s) return s(`bitlogin:ecash-counters:${n}`, r);
  const i = (ks.get(n) ?? Promise.resolve()).then(r, r);
  return ks.set(n, i.catch(() => {
  })), i;
}
function my(e, t, o) {
  const n = ze(t);
  return Gs(o) ? Bn(e, No(n), async () => {
    const r = await zt(e, n);
    if (r) return r;
    const s = { lane: o, next: yc(o) };
    return await vt(e, qn(e.signer.getPublicKey(), n), s), await Lo(e, n, s), s;
  }) : Promise.reject(new Error("That is not a lane."));
}
async function by(e, t, o, n) {
  Qt(e);
  const r = ze(t);
  return await Io(e, r, n), Bn(e, No(r), async () => {
    const s = await zt(e, r);
    if (!s) throw Object.assign(new Error("No lane is drawn for this keyset in this browser yet."), { code: "no-lane" });
    const i = e.seed();
    let a;
    try {
      a = Pa(i, r, o, s.next);
    } finally {
      i.fill(0);
    }
    if (a.next - 1 > Hs(s.lane)) throw Object.assign(new Error("This lane is used up."), { code: "no-lane" });
    const c = { lane: s.lane, next: a.next };
    return await vt(e, qn(e.signer.getPublicKey(), r), c), await Lo(e, r, c), { outputs: a.outputs.map(Aa), from: s.next, next: a.next };
  });
}
function ky(e, t, o) {
  const n = ze(t);
  return Number.isSafeInteger(o) ? Bn(e, No(n), async () => {
    const r = await zt(e, n);
    return !r || o <= r.next ? r : gy(e, n, { lane: r.lane, next: Math.min(o, Hs(r.lane)) });
  }) : Promise.reject(new Error("That is not a counter."));
}
async function Ey(e, t, o) {
  Qt(e);
  const n = ze(t);
  return await Io(e, n, o), Bn(e, `bitlogin:ecash-trial:${n}`, async () => {
    const r = dy(e.signer.getPublicKey(), n), s = await Wn(e, r), i = Number.isSafeInteger(s?.next) && s.next >= $o ? s.next : $o;
    if (i > fc) throw new Error("Every trial counter of this keyset has been used.");
    const a = e.seed();
    let c;
    try {
      c = Pa(a, n, [1], i);
    } finally {
      a.fill(0);
    }
    return await vt(e, r, { next: c.next }), Aa(c.outputs[0]);
  });
}
const Es = /* @__PURE__ */ new Map();
function ve(e, t) {
  const o = e.getPublicKey(), n = Ft();
  if (n) return n(`bitlogin:ecash-local:${o}`, t);
  const r = (Es.get(o) ?? Promise.resolve()).then(t, t);
  return Es.set(o, r.catch(() => {
  })), r;
}
const Na = "bitlogin:ecash:v1:", qt = (e) => e.startsWith("local:"), Ma = () => `local:${Array.from(crypto.getRandomValues(new Uint8Array(8)), (e) => e.toString(16).padStart(2, "0")).join("")}`;
async function X(e, t) {
  const o = t.getPublicKey();
  try {
    const n = await e.get(Na + o);
    if (!n) return { wallet: null, tokens: [] };
    const r = JSON.parse(t.nip44Decrypt(o, n)), s = typeof r.wallet == "string" ? Qr(r.wallet) : null, i = [];
    for (const a of Array.isArray(r.tokens) ? r.tokens : []) {
      const c = a, l = zs(c.proofs);
      typeof c.event == "string" && c.event.length <= 80 && at(c.mint) && l?.length && i.push({ event: c.event, mint: at(c.mint), proofs: l });
    }
    return { wallet: s, tokens: i, ...Number.isSafeInteger(r.walletAt) ? { walletAt: r.walletAt } : {}, ...r.walletUnsent === !0 ? { walletUnsent: !0 } : {} };
  } catch {
    return { wallet: null, tokens: [] };
  }
}
async function Ie(e, t, o) {
  const n = t.getPublicKey();
  await e.set(Na + n, t.nip44Encrypt(n, JSON.stringify({ wallet: o.wallet ? Qs(o.wallet) : null, tokens: o.tokens, ...o.walletAt ? { walletAt: o.walletAt } : {}, ...o.walletUnsent ? { walletUnsent: !0 } : {} })));
}
const Tn = (e, t) => Y(e) >= Math.min(2, t);
function Oa(e, t, o) {
  const n = e.getPublicKey();
  return e.signEvent({ kind: rt, created_at: Math.floor(o), tags: [], content: e.nip44Encrypt(n, bc(t)) });
}
function _y(e) {
  const t = /* @__PURE__ */ new Set(), o = [];
  for (const n of e) {
    const r = n.proofs.filter((s) => !t.has(s.secret));
    for (const s of r) t.add(s.secret);
    r.length && o.push(r.length === n.proofs.length ? n : { ...n, proofs: r });
  }
  return o;
}
const Le = (e, t) => ({
  mints: e.wallet?.mints ?? [],
  tokens: _y(e.tokens),
  offline: t,
  unsaved: e.tokens.some((o) => qt(o.event)) || !!e.walletUnsent,
  ...e.wallet?.trials?.length ? { trials: e.wallet.trials } : {},
  ...e.wallet?.counters?.length ? { counters: e.wallet.counters } : {}
});
async function Bt(e) {
  return Object.entries(await Vn(e).catch(() => ({}))).map(([t, o]) => ({ keysetId: t, hash: o.hash, ...o.at ? { at: o.at } : {} }));
}
async function jn(e) {
  const t = await Ta(e).catch(() => ({}));
  return Object.entries(t).flatMap(([o, n]) => Object.entries(n).map(([r, s]) => ({ keysetId: o, lane: Number(r), next: s })));
}
function Ia(e, t) {
  return t ? !e || e.mints.join(`
`) !== t.mints.join(`
`) || !(t.trials ?? []).every((o) => (e.trials ?? []).some((n) => n.mint === o.mint && n.keysetId === o.keysetId && n.at >= o.at)) || !(t.pins ?? []).every((o) => (e.pins ?? []).some((n) => n.keysetId === o.keysetId && (n.at ?? 0) >= (o.at ?? 0))) ? !1 : (t.counters ?? []).every((o) => (e.counters ?? []).some((n) => n.keysetId === o.keysetId && n.lane === o.lane && n.next >= o.next)) : !0;
}
function Wt(e, t, o = [], n = []) {
  const r = vc(e.trials, ...t.map((y) => y?.trials)), s = gc(e.counters, ...t.map((y) => y?.counters), o), i = mc(n, e.pins, ...t.map((y) => y?.pins)), { trials: a, counters: c, pins: l, ...d } = e;
  return { ...d, ...r.length ? { trials: r } : {}, ...s.length ? { counters: s } : {}, ...i.length ? { pins: i } : {} };
}
async function Py(e, t) {
  const { signer: o, store: n, relays: r } = e, s = o.getPublicKey(), i = await jn(e), a = await X(n, o);
  if (!a.wallet || Ia(a.wallet, Wt(a.wallet, [], i, await Bt(e)))) return null;
  const l = ((await r.queryQuorum({ kinds: [xt], authors: [s], limit: 2 }, 4e3).catch(() => null))?.outcomes ?? []).flatMap((p) => p.events).filter((p) => p.kind === xt && p.pubkey === s && C(p)).sort((p, w) => w.created_at - p.created_at || p.id.localeCompare(w.id))[0];
  let d = null;
  try {
    d = l ? Qr(o.nip44Decrypt(s, l.content)) : null;
  } catch {
    d = null;
  }
  const y = await Bt(e), f = await ve(o, async () => {
    const p = await X(n, o);
    if (!p.wallet) return null;
    const w = !!d && !!l && l.created_at >= (p.walletAt ?? 0), m = Wt(w ? d : p.wallet, [p.wallet, d], i, y), v = Jn(t, Math.max(p.walletAt ?? 0, l?.created_at ?? 0));
    return await Ie(n, o, { ...p, wallet: m, walletAt: v, walletUnsent: !0 }), { wallet: m, at: v };
  });
  if (!f) return null;
  const h = await Gn(e, f.wallet, f.at);
  return ve(o, async () => {
    const p = await X(n, o);
    return h && p.walletAt === f.at && (delete p.walletUnsent, await Ie(n, o, p)), p;
  });
}
async function Gn(e, t, o) {
  const n = e.signer.getPublicKey(), r = e.signer.signEvent({ kind: xt, created_at: o, tags: [], content: e.signer.nip44Encrypt(n, Qs(t)) });
  return Tn(await e.relays.publishAll(r, 6e3).catch(() => []), e.relays.relayUrls.length);
}
async function Sy(e) {
  return Le(await X(e.store, e.signer), !0);
}
async function Ky(e) {
  const { signer: t, store: o, relays: n } = e, r = t.getPublicKey(), s = await X(o, t), [i, a, c] = await Promise.all([
    n.queryQuorum({ kinds: [xt], authors: [r], limit: 2 }, 5e3),
    n.queryQuorum({ kinds: [rt], authors: [r], limit: qe.tokens }, 6e3),
    n.queryQuorum({ kinds: [5], authors: [r], "#k": [String(rt)], limit: qe.tokens }, 6e3)
  ]).catch(() => [null, null, null]);
  if (!a || !i || !c || a.respondedCount === 0) return Le(s, !0);
  const l = (E, P) => E.filter((L) => L.kind === P && L.pubkey === r && C(L)), d = (E) => {
    try {
      return t.nip44Decrypt(r, E.content);
    } catch {
      return null;
    }
  }, y = l(i.outcomes.flatMap((E) => E.events), xt).sort((E, P) => P.created_at - E.created_at || E.id.localeCompare(P.id))[0], f = y && Qr(d(y) ?? "") || null, p = !!s.wallet && (!y || (s.walletAt ?? 0) > y.created_at) ? s.wallet : f ?? s.wallet;
  f?.pins?.length && await vy(e, f.pins).catch(() => {
  });
  const w = p ? Wt(p, [f, s.wallet], await jn(e), await Bt(e)) : null, m = new Set(l(c.outcomes.flatMap((E) => E.events), 5).flatMap((E) => E.tags.filter((P) => P[0] === "e" && typeof P[1] == "string").map((P) => P[1]))), v = /* @__PURE__ */ new Map();
  for (const E of l(a.outcomes.flatMap((P) => P.events), rt)) v.set(E.id, E);
  const b = [...v.values()].flatMap((E) => {
    const P = hc(d(E) ?? "");
    return P ? [{ event: E.id, created_at: E.created_at, ...P }] : [];
  }), _ = pc(b, m), k = new Set(_.map((E) => E.event)), M = new Set(_.flatMap((E) => E.proofs.map((P) => P.secret))), O = new Set(b.flatMap((E) => E.del)), G = new Map(b.map((E) => [E.event, E.proofs.map((P) => P.secret)])), x = (E) => a.outcomes.every((P) => {
    const L = new Set(P.events.map((j) => j.id));
    if (!L.has(E)) return !0;
    const ge = new Set([...L].filter((j) => j !== E && k.has(j)).flatMap((j) => G.get(j) ?? []));
    return (G.get(E) ?? []).every((j) => ge.has(j));
  }), $ = b.filter((E) => !k.has(E.event) && !m.has(E.event) && !O.has(E.event) && E.proofs.length > 0 && E.proofs.every((P) => M.has(P.secret)) && x(E.event));
  if ($.length) {
    const E = t.signEvent({ kind: 5, created_at: Math.floor(e.now ?? Date.now() / 1e3), tags: [...$.map((P) => ["e", P.event]), ["k", String(rt)]], content: "" });
    await n.publishAll(E, 6e3).catch(() => []);
  }
  const F = new Set(_.flatMap((E) => E.proofs.map((P) => P.secret)));
  let B = Math.max(y?.created_at ?? 0, s.walletAt ?? 0) || void 0, De = !1;
  if (w && !Ia(f, w)) {
    const E = Jn(e.now ?? Date.now() / 1e3, B);
    await Gn(e, w, E) ? B = E : De = !0;
  }
  const Qe = { wallet: w, tokens: [..._], ...B ? { walletAt: B } : {}, ...De ? { walletUnsent: De } : {} }, Wa = new Set(b.flatMap((E) => E.del));
  for (const E of s.tokens.filter((P) => !qt(P.event))) {
    if (v.has(E.event) || m.has(E.event) || Wa.has(E.event)) continue;
    const P = E.proofs.filter((L) => !F.has(L.secret));
    if (P.length !== 0) {
      for (const L of P) F.add(L.secret);
      Qe.tokens.push({ event: E.event, mint: E.mint, proofs: P });
    }
  }
  const Hn = /* @__PURE__ */ new Map();
  for (const E of s.tokens.filter((P) => qt(P.event))) {
    const P = E.proofs.filter((L) => !F.has(L.secret));
    for (const L of P) F.add(L.secret);
    P.length && Hn.set(E.mint, [...Hn.get(E.mint) ?? [], ...P]);
  }
  const zn = [];
  for (const [E, P] of Hn) for (let L = 0; L < P.length; L += qe.proofsWritten) zn.push({ mint: E, proofs: P.slice(L, L + qe.proofsWritten) });
  const Va = e.now ?? Date.now() / 1e3, xo = zn.map((E) => Oa(t, E, Va)), ja = await Promise.all(xo.map(async (E) => Tn(await n.publishAll(E, 6e3).catch(() => []), n.relayUrls.length)));
  for (const [E, P] of zn.entries()) Qe.tokens.push({ event: ja[E] ? xo[E].id : Ma(), ...P });
  const Ga = await ve(t, async () => {
    const E = await X(o, t), P = new Set(s.tokens.map((ge) => ge.event)), L = new Set(Qe.tokens.flatMap((ge) => ge.proofs.map((j) => j.secret)));
    for (const ge of E.tokens.filter((j) => !P.has(j.event))) {
      const j = ge.proofs.filter((Qn) => !L.has(Qn.secret));
      j.length && Qe.tokens.push({ ...ge, proofs: j });
      for (const Qn of j) L.add(Qn.secret);
    }
    return await Ie(o, t, Qe), Qe;
  });
  return Le(Ga, !1);
}
const Jn = (e, t) => Math.max(Math.floor(e), (t ?? 0) + 1);
async function La(e, t) {
  return ve(e.signer, async () => {
    const o = await X(e.store, e.signer);
    if (o.walletAt !== t || !o.walletUnsent) return o;
    const n = { ...o };
    return delete n.walletUnsent, await Ie(e.store, e.signer, n), n;
  });
}
async function Ay(e, t) {
  const { signer: o, store: n } = e, r = [...new Set((Array.isArray(t) ? t : []).map(at).filter(Boolean))];
  if (r.length === 0 || r.length > qe.mints) throw new Error("Name between one and five mints, each an https address.");
  const s = await jn(e), i = await Bt(e), { wallet: a, at: c } = await ve(o, async () => {
    const d = await X(n, o), y = (d.wallet?.trials ?? []).filter((p) => r.includes(p.mint)), f = Wt({ privkey: d.wallet?.privkey ?? e.newKey(), mints: r, ...y.length ? { trials: y } : {} }, [{ privkey: "", mints: [], ...d.wallet?.counters ? { counters: d.wallet.counters } : {}, ...d.wallet?.pins ? { pins: d.wallet.pins } : {} }], s, i), h = Jn(e.now ?? Date.now() / 1e3, d.walletAt);
    return await Ie(n, o, { ...d, wallet: f, walletAt: h, walletUnsent: !0 }), { wallet: f, at: h };
  });
  if (!await Gn(e, a, c)) throw new Error("The wallet was saved in this browser, but no relay took it. Try again when you are online.");
  return Le(await La(e, c), !1);
}
async function Ry(e, t, o) {
  const { signer: n, store: r, relays: s } = e, i = e.now ?? Date.now() / 1e3, a = new Set(t.destroy.filter((k) => typeof k == "string" && k.length <= 80)), c = t.keep.map((k) => ({ mint: at(k.mint), proofs: zs(k.proofs, 5e3) }));
  if (c.some((k) => !k.mint || !k.proofs)) throw new Error("That is not ecash this wallet can keep.");
  const l = await ve(n, async () => {
    const k = await X(r, n);
    {
      const x = /* @__PURE__ */ new Set();
      for (const $ of k.tokens.filter((F) => !a.has(F.event))) {
        qt($.event) && $.proofs.length && $.proofs.every((F) => x.has(F.secret)) && a.add($.event);
        for (const F of $.proofs) x.add(F.secret);
      }
    }
    const M = new Set(k.tokens.filter((x) => !a.has(x.event)).flatMap((x) => x.proofs.map(($) => $.secret))), O = c.flatMap((x) => {
      const $ = [], F = x.proofs.filter((B) => !M.has(B.secret));
      for (let B = 0; B < F.length; B += qe.proofsWritten) $.push({ event: Ma(), mint: x.mint, proofs: F.slice(B, B + qe.proofsWritten) });
      return $;
    }), G = { wallet: k.wallet, tokens: [...k.tokens.filter((x) => !a.has(x.event)), ...O], ...k.walletAt ? { walletAt: k.walletAt } : {}, ...k.walletUnsent ? { walletUnsent: !0 } : {} };
    return await Ie(r, n, G), { added: O, next: G };
  }), { added: d } = l;
  o?.(Le(l.next, !1));
  const y = [...a].filter((k) => !qt(k)), f = d.map((k, M) => Oa(n, { mint: k.mint, proofs: k.proofs, ...y.length && M === 0 ? { del: y } : {} }, i)), h = n.getPublicKey(), p = t.history && Number.isSafeInteger(t.history.amount) && t.history.amount > 0 ? n.signEvent({ kind: Fo, created_at: Math.floor(i), tags: [], content: n.nip44Encrypt(h, wc({ ...t.history, created: f.map((k) => k.id), destroyed: y })) }) : null, [w, m] = await Promise.all([
    Promise.all(f.map(async (k) => Tn(await s.publishAll(k, 6e3).catch(() => []), s.relayUrls.length))),
    p ? s.publishAll(p, 6e3).then((k) => Tn(k, s.relayUrls.length)).catch(() => !1) : Promise.resolve(!1)
  ]), v = await ve(n, async () => {
    const k = await X(r, n), M = new Map(d.flatMap((O, G) => w[G] ? [[O.event, f[G].id]] : []));
    for (const O of k.tokens) M.has(O.event) && (O.event = M.get(O.event));
    return await Ie(r, n, k), k;
  }), b = w.every(Boolean);
  if (p && m && !b) {
    const k = n.signEvent({ kind: 5, created_at: Math.floor(i), tags: [["e", p.id], ["k", String(Fo)]], content: "" });
    await s.publishAll(k, 6e3).catch(() => []);
  }
  if (y.length && b) {
    const k = n.signEvent({ kind: 5, created_at: Math.floor(i), tags: [...y.map((M) => ["e", M]), ["k", String(rt)]], content: "" });
    await s.publishAll(k, 6e3).catch(() => []);
  }
  const _ = await Py(e, i);
  return Le(_ ? { ...v, wallet: _.wallet, ..._.walletAt ? { walletAt: _.walletAt } : {}, walletUnsent: !!_.walletUnsent } : v, !1);
}
async function Cy(e, t) {
  const { signer: o, store: n } = e, r = t, s = at(r?.mint);
  if (!s || typeof r?.keysetId != "string" || !/^[0-9a-f]{16}$|^[0-9a-f]{66}$/u.test(r.keysetId) || r.outcome !== "passed" && r.outcome !== "failed") throw new Error("That is not a trial of a mint.");
  const i = r.keysetId, a = r.outcome, c = await jn(e), l = await Bt(e), { wallet: d, at: y } = await ve(o, async () => {
    const f = await X(n, o);
    if (!f.wallet || !f.wallet.mints.includes(s)) throw new Error("That mint is not in this wallet.");
    const h = Jn(e.now ?? Date.now() / 1e3, f.walletAt), p = Wt({ ...f.wallet, trials: kc(f.wallet.trials, { mint: s, keysetId: i, outcome: a, at: h }) }, [], c, l);
    return await Ie(n, o, { ...f, wallet: p, walletAt: h, walletUnsent: !0 }), { wallet: p, at: h };
  });
  return await Gn(e, d, y) ? Le(await La(e, y), !1) : Le(await ve(o, () => X(n, o)), !1);
}
const Do = "bitlogin:signer-guest:v1:", Da = "bitlogin:signer-grant-device-key:v1", _s = (e) => btoa(String.fromCharCode(...e)), Ps = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), Ss = (e) => e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength);
async function Ty(e) {
  const t = await Un(e);
  try {
    return In(t);
  } finally {
    S(t);
  }
}
async function Mt(e, t) {
  const o = D(t);
  if (!o || typeof e.getOrCreateDeviceKey != "function") return null;
  try {
    const n = await e.get(Do + o);
    if (!n) return null;
    const r = JSON.parse(n);
    if (r.v !== 1 || typeof r.iv != "string" || typeof r.ciphertext != "string") return null;
    const s = await e.getOrCreateDeviceKey(Da), i = await crypto.subtle.decrypt({ name: "AES-GCM", iv: Ss(Ps(r.iv)) }, s, Ss(Ps(r.ciphertext))), a = JSON.parse(new TextDecoder().decode(i));
    return a.family !== o || typeof a.phrase != "string" ? null : { key: await Ty(a.phrase), phrase: a.phrase };
  } catch {
    return null;
  }
}
async function Ny(e, t) {
  const o = D(t);
  if (!o) throw new Error("A guest is made only for a family.");
  const n = await Mt(e, o);
  if (n) return n;
  if (typeof e.getOrCreateDeviceKey != "function") throw new Error("No storage here to keep a guest in.");
  const r = fi(Fs()), s = await e.getOrCreateDeviceKey(Da), i = crypto.getRandomValues(new Uint8Array(12)), a = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, s, new TextEncoder().encode(JSON.stringify({ family: o, phrase: r })));
  await e.set(Do + o, JSON.stringify({ v: 1, iv: _s(i), ciphertext: _s(new Uint8Array(a)) }));
  const c = await Mt(e, o);
  if (!c) throw new Error("The guest could not be kept here.");
  return c;
}
async function My(e, t) {
  const o = D(t);
  o && await e.delete(Do + o);
}
const fe = () => Math.floor(Date.now() / 1e3);
async function xa(e, t, o) {
  const n = /* @__PURE__ */ new Set(), r = [], s = [];
  return await Promise.all(
    e.map(async (i) => {
      try {
        const a = new Gt(i);
        r.push(a), s.push(
          await a.subscribeLive(t, (c) => {
            n.has(c.id) || (n.add(c.id), o(c));
          })
        );
      } catch {
      }
    })
  ), () => {
    for (const i of s) i.close();
    for (const i of r) i.close();
  };
}
const Oy = (e) => {
  const t = Number(e.tags.find((o) => o[0] === "expiration")?.[1]);
  return !Number.isSafeInteger(t) || t <= fe();
};
async function Ks(e) {
  const t = be(), o = K(t), n = new Q(t.slice()), r = ll(e.code) || ul(), s = Zs(r), i = fe() + Math.min(e.ttlSec ?? gr, gr), a = new N([...e.relayUrls]);
  let c = "waiting", l, d, y, f = null, h = () => {
  }, p = null, w = null;
  const m = (b) => {
    c === "paired" || c === "ended" || c === "expired" || (c = b, p && clearInterval(p), w && clearTimeout(w), h(), a.closeAll(), n.destroy?.(), S(t));
  }, v = () => {
    if (c !== "waiting" && c !== "found") return;
    const b = n.signEvent({
      kind: vn,
      created_at: fe(),
      tags: [[yl, s], ["nswp:origin", e.site], ["expiration", String(i)]],
      content: JSON.stringify({ device: e.device, ...e.to ? { to: e.to } : {} })
    });
    a.publishAll(b, 4e3).catch(() => []);
  };
  return h = await xa(e.relayUrls, { kinds: [vn], "#p": [o], since: fe() - 10 }, (b) => {
    if (c !== "waiting" && c !== "found" || Oy(b)) return;
    let _ = null;
    try {
      const M = JSON.parse(b.content);
      typeof M.senderPublicKey == "string" && typeof M.payload == "string" && (_ = M);
    } catch {
      _ = null;
    }
    if (_) {
      if (c !== "found" || b.pubkey !== f) return;
      if (e.to) {
        y = _, m("paired");
        return;
      }
      try {
        d = da(_, t);
      } catch {
        return;
      }
      m("paired");
      return;
    }
    let k;
    try {
      k = JSON.parse(n.nip44Decrypt(b.pubkey, b.content));
    } catch {
      return;
    }
    if (c === "waiting" && Number.isSafeInteger(k.found) && k.found >= 10 && k.found <= 99) {
      f = b.pubkey, l = k.found, c = "found";
      return;
    }
    k.end === !0 && b.pubkey === f && m("ended");
  }), v(), p = setInterval(v, e.republishMs ?? 2e3), w = setTimeout(() => m("expired"), Math.max(0, i - fe()) * 1e3), {
    code: r,
    expires: i,
    state: () => ({ status: c, ...l !== void 0 ? { number: l } : {}, ...d ? { opened: d } : {}, ...y ? { sealed: y } : {} }),
    cancel: () => m("ended")
  };
}
function Iy(e) {
  const t = new Q(be()), o = async (n, r) => {
    const s = new N([...e.relayUrls]);
    try {
      const i = t.signEvent({ kind: vn, created_at: fe(), tags: [["p", n.key], ["e", n.id], ["expiration", String(fe() + dl)]], content: r });
      await s.publishAll(i, 6e3);
    } finally {
      s.closeAll();
    }
  };
  return {
    async find(n, { waitMs: r = 6e3, settleMs: s = 2e3 } = {}) {
      const i = Zs(n);
      if (!i) return [];
      const a = /* @__PURE__ */ new Map();
      return new Promise((c) => {
        let l = null, d = () => {
        };
        const y = () => {
          d(), c([...a.values()]);
        }, f = setTimeout(y, r);
        xa(e.relayUrls, { kinds: [vn], since: fe() - gr }, (h) => {
          const p = fl(h, fe());
          !p || p.hash !== i || (a.set(p.key, p), l || (l = setTimeout(() => {
            clearTimeout(f), y();
          }, s)));
        }).then((h) => d = h);
      });
    },
    async found(n) {
      const r = cl();
      return await o(n, t.nip44Encrypt(n.key, JSON.stringify({ found: r }))), r;
    },
    async end(n) {
      await o(n, t.nip44Encrypt(n.key, JSON.stringify({ end: !0 })));
    },
    async answer(n, r) {
      await o(n, JSON.stringify(r));
    }
  };
}
const Ua = "bitlogin:session-public:v1";
async function Ly(e, t) {
  try {
    const o = {
      pubkey: t.pubkey,
      npub: t.npub,
      ...t.name ? { name: t.name } : {}
    };
    await e.set(Ua, JSON.stringify(o));
  } catch {
  }
}
async function mt(e) {
  try {
    await e.delete(Ua);
  } catch {
  }
}
const As = (e) => e.then(
  () => {
  },
  () => {
  }
);
class Dy {
  alone = Promise.resolve();
  lanes = /* @__PURE__ */ new Map();
  run(t, o) {
    if (t === null) {
      const i = Promise.all([this.alone, ...this.lanes.values()]).then(o, o);
      return this.alone = As(i), this.lanes.clear(), i;
    }
    const r = Promise.all([this.alone, this.lanes.get(t) ?? Promise.resolve()]).then(o, o);
    return this.lanes.set(t, As(r)), r;
  }
}
const xy = 3 * 6e4;
class Uy {
  constructor(t, o = Date.now, n = (r, s) => new Gt(r, { connectTimeoutMs: s })) {
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
    return o === void 0 ? !1 : this.now() - o < xy ? !0 : (this.failedAt.delete(t), !1);
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
function $y(e, t) {
  const o = t instanceof Error ? t : new Error(String(t)), n = o.code;
  return { id: e, ok: !1, error: o.message, errorName: o.name, ...typeof n == "string" && /^[a-z0-9-]{1,40}$/u.test(n) ? { errorCode: n } : {} };
}
const Fy = 24 * 3600, u = {
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
  device: null,
  more: []
};
let xe = null, ae = null, ce = null, W = null, R = [...ti], q = [...ni];
const g = new gd();
let Or = !1, Ir = !1;
function Rs(e) {
  Or || (R = e.vaultRelays), Ir || (q = e.discoveryRelays);
}
const qy = 1500, By = new Dy(), Wy = {
  ecashLoad: "ecash",
  ecashSetMints: "ecash",
  ecashRoll: "ecash",
  ecashKeepTrial: "ecash",
  // The seed's outputs and this browser's lanes (docs/ecash-seed-counter.md): no relay, no wait behind a wallet read.
  ecashLaneGet: "seed",
  ecashDraw: "seed",
  ecashReserve: "seed",
  ecashForward: "seed",
  ecashBlinded: "seed",
  ecashUnblind: "seed",
  ecashTrialOutput: "seed",
  ecashRepin: "seed",
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
let T = null, cr = Date.now();
const Vy = /* @__PURE__ */ new Set(["configure", "lockStatus", "lockOpen", "restoreSession", "getSessionStatus", "logout"]), $a = "bitlogin:taken-back:v1:";
async function jy(e) {
  try {
    const t = await g.get($a + e);
    return (t ? Xs(JSON.parse(t)) : null) ?? vr;
  } catch {
    return vr;
  }
}
function Cs(e, t) {
  try {
    return Xs(JSON.parse(e.nip44Decrypt(e.getPublicKey(), t)));
  } catch {
    return null;
  }
}
function bt() {
  z(), T && S(T), T = null;
}
async function et() {
  const e = await Oe(g);
  return e ? {
    on: !0,
    // Locked with nothing in the active slot too, where other accounts are kept: theirs are sealed under it.
    locked: !T && (await ln(g) === "locked" || (await oe(g)).length > 0),
    device: !!e.device,
    ...e.device ? { credentialId: e.device.credentialId } : {},
    triesLeft: Math.max(0, ie.tries - e.tries)
  } : { on: !1, locked: !1, device: !1, triesLeft: 0 };
}
function A() {
  if (!u.signer || !u.everydayPrivateKey)
    throw new Error("No identity is unlocked in this session.");
  return { signer: u.signer, everydayPrivateKey: u.everydayPrivateKey };
}
function le() {
  const e = A();
  if (!u.signerOnly || u.app || !u.site) throw new Error("refused");
  return { ...e, site: u.site };
}
const Lr = "bitlogin:world-counts:v1:", Gy = "bitlogin:follows-seen:v1:", Dr = /* @__PURE__ */ new Map();
async function Ue(e, t, o, n = !0) {
  const r = `${Lr}${e}:${t}`;
  let s = Dr.get(r);
  if (!s)
    try {
      const l = n ? JSON.parse(await g.get(r) ?? "[]") : [];
      s = Array.isArray(l) ? l.filter((d) => typeof d == "number" && Number.isFinite(d)).slice(-o.hourly) : [];
    } catch {
      s = [];
    }
  const i = Wc(o, s), a = Date.now(), c = i.take(a);
  return Dr.set(r, i.times()), c && n && await g.set(r, JSON.stringify(i.times())).catch(() => {
  }), c;
}
function lr() {
  if (!u.signerOnly || !u.app) throw new Error("refused");
  return u.app;
}
function z() {
  dn.closeAll(), u.signer?.destroy(), u.everydayPrivateKey && u.everydayPrivateKey.fill(0), u.signer = null, u.everydayPrivateKey = null, u.accountId = null, u.recoveryPublicKey = null, u.activeCredentialEvent = null, u.activeRecoveryEvent = null, u.everydayKeyDerived = !1, u.vault?.destroy(), u.vault = null, u.connectionVaultRoot && u.connectionVaultRoot.fill(0), u.connectionVaultRoot = null, u.vaultKnown = !1, u.signerOnly = !1, u.app = null, u.site = null, u.profile = null, u.remember = !1, u.grantAt = null, u.relays = [], u.family = null, u.memberOf = null, u.guest = null, u.device = null, u.more = [], u.pendingRecovery && (u.pendingRecovery.recoveryPrivateKey.fill(0), u.pendingRecovery.everydayPrivateKey.fill(0), u.pendingRecovery = null);
}
function Ts(e) {
  return z(), u.pendingRecovery = e, u.signer = new Q(e.everydayPrivateKey), u.everydayPrivateKey = e.everydayPrivateKey, u.accountId = e.accountId, u.recoveryPublicKey = e.recoveryPublicKey, u.activeRecoveryEvent = e.currentRecoveryEvent, u.everydayKeyDerived = e.everydayKeyDerived, xr(
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
function xr(e, t) {
  u.connectionVaultRoot = e ?? null, u.vaultKnown = !0, u.vault = null, t && S(t);
}
async function $e() {
  if (!u.everydayPrivateKey || !u.accountId || !u.recoveryPublicKey || !u.activeCredentialEvent || !u.activeRecoveryEvent)
    return;
  const e = await Oe(g);
  e && !T && (await Ct(g), await Ur());
  const t = {
    everydayPrivateKey: u.everydayPrivateKey,
    accountId: u.accountId,
    recoveryPublicKey: u.recoveryPublicKey,
    activeCredentialEvent: u.activeCredentialEvent,
    activeRecoveryEvent: u.activeRecoveryEvent,
    ...u.connectionVaultRoot ? { connectionVaultRoot: u.connectionVaultRoot } : {},
    ...u.vaultKnown ? { vaultEnabled: u.connectionVaultRoot !== null } : {},
    everydayKeyDerived: u.everydayKeyDerived
  }, o = e && T ? T : null;
  await Er(g, t, o);
  const n = K(u.everydayPrivateKey);
  await Er(g, t, o, ne(n));
  const r = Cd(await oe(g), n, Date.now() / 1e3);
  for (const s of r.dropped) await ue(g, ne(s));
  await We(g, r.list), await Fa();
}
async function Ur() {
  for (const e of await oe(g)) await ue(g, ne(e.pubkey));
  await We(g, []);
}
async function Ns(e, t) {
  const o = u.everydayPrivateKey ? K(u.everydayPrivateKey) : "";
  let n = await oe(g);
  for (const r of n) {
    if (r.pubkey === o) continue;
    const s = await na(g, e, ne(r.pubkey));
    s ? (await Er(g, s, t, ne(r.pubkey)), s.everydayPrivateKey.fill(0), s.connectionVaultRoot?.fill(0)) : (await ue(g, ne(r.pubkey)), n = un(n, r.pubkey));
  }
  await We(g, n);
}
async function ur(e) {
  const t = await na(g, T, e);
  return t ? (z(), u.signer = new Q(t.everydayPrivateKey), u.everydayPrivateKey = t.everydayPrivateKey, u.accountId = t.accountId, u.recoveryPublicKey = t.recoveryPublicKey, u.activeCredentialEvent = t.activeCredentialEvent, u.activeRecoveryEvent = t.activeRecoveryEvent, u.everydayKeyDerived = t.everydayKeyDerived ?? !1, u.connectionVaultRoot = t.connectionVaultRoot ?? null, u.vaultKnown = t.vaultEnabled !== void 0, await Fa(), {
    restored: !0,
    everydayPublicKey: u.signer.getPublicKey(),
    accountId: t.accountId,
    everydayKeyDerived: u.everydayKeyDerived
  }) : { restored: !1 };
}
async function Fa() {
  if (!u.signer) return;
  const e = u.signer.getPublicKey();
  await Ly(g, { pubkey: e, npub: St(e) });
}
function Pe() {
  try {
    return new URL(self.location.href).origin;
  } catch {
    return "";
  }
}
const dr = "bitlogin:held:v1:", qa = 3e3, Ms = 2500, dn = new Uy(qa), te = (e) => {
  const t = new N(e, {
    connectTimeoutMs: qa,
    connectionFor: dn.connectionFor,
    notWaitedFor: dn.notWaitedFor,
    heard: dn.heard
  }), o = t.queryQuorum.bind(t);
  return t.queryQuorum = (n, r = Ms) => o(n, Math.min(r, Ms)), t;
}, Jy = 1500, yr = (e) => {
  const t = te(e);
  return t.publishAll = (o, n) => t.publishEnough(o, n, 2, Jy), t;
}, tt = (e) => Zd(e, (t) => te([t]));
function Fe() {
  if (!Ys(Pe())) throw new Error("That is done at BitLogin's own address.");
}
function fr(e) {
  if (e === void 0) return Pe();
  const t = he(e);
  if (!t || !Ys(Pe())) throw new Error("A wallet connection is for this site only.");
  return t;
}
function $r() {
  if (!u.signer) throw new Error("No identity is unlocked in this session.");
  if (!u.connectionVaultRoot)
    throw new Error(
      u.vaultKnown ? "This account predates the Connection Vault. Enable it from your BitLogin account manager (recovery phrase required)." : "Sign in again to use wallet connections on this device."
    );
  return u.vault ??= new hd(u.connectionVaultRoot.slice()), u.vault;
}
function kt(e) {
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
async function yn() {
  const e = $r(), t = await e.listConnections({ relayUrls: R, store: g });
  return {
    vault: e,
    connections: t.connections.filter((o) => o.record.state !== "deleted"),
    rollbackWarnings: t.rollbackWarnings,
    unreadable: t.unreadable,
    truncated: t.truncated,
    quorumMet: t.quorumMet
  };
}
async function hr(e) {
  const { vault: t, connections: o } = await yn(), n = o.find((r) => r.record.connection_id === e);
  if (!n) throw new Error("That connection no longer exists.");
  return { vault: t, connection: n };
}
let Ge = null, ye = null;
function Os(e) {
  self.postMessage({ notify: "nip46-auth-url", url: e });
}
function Et() {
  if (!Ge) throw new Error("No remote signer is connected.");
  return Ge;
}
function on() {
  ye && (ye.abort.abort(), S(ye.clientSecretKey), ye = null);
}
function Ba(e) {
  const t = e.buildLogoutEvent();
  e.close(), t && e.publishCourtesy(t);
}
function Is(e, t) {
  Ge && Ba(Ge.client), Ge = { client: e, userPubkey: t };
}
async function Hy(e, t, o = "") {
  if (u.signerOnly && !qd.has(e))
    throw new Error("This session can only sign. Sign in at your own BitLogin page for anything else.");
  switch (T && e !== "configure" && Date.now() - cr > ie.idleSec * 1e3 && bt(), Vy.has(e) || (cr = Date.now()), e) {
    // ---- The optional lock (lock.ts) ----
    case "lockStatus":
      return et();
    // Turn it on, or change the PIN. Only with a full session unlocked: the key that is sealed is the one in hand.
    case "lockEnable": {
      if (A(), await Oe(g) && !T) throw new Error("Unlock first.");
      const n = await Od(g, t.pin, T ?? void 0);
      return await Ns(T, n), T && S(T), T = n, await $e(), et();
    }
    case "lockSetDevice": {
      if (A(), !T) throw new Error("Turn the lock on first.");
      const n = t, r = V(String(n.prfOutput));
      try {
        await Id(g, T, String(n.credentialId), r);
      } finally {
        S(r);
      }
      return et();
    }
    case "lockRemoveDevice": {
      if (A(), !T) throw new Error("Turn the lock on first.");
      return await Ld(g), et();
    }
    case "lockDisable": {
      if (A(), await Oe(g) && !T) throw new Error("Unlock first.");
      return await Ns(T, null), await Ct(g), T && S(T), T = null, await $e(), et();
    }
    case "lockNow": {
      if (!T) throw new Error("The lock is not on.");
      return bt(), et();
    }
    // Open it, with the PIN or with the device. A wrong try is counted; one too many removes the lock and the
    // cached session with it, and the user signs in again the ordinary way.
    case "lockOpen": {
      const n = t;
      let r;
      if (typeof n.prfOutput == "string") {
        const s = V(n.prfOutput);
        try {
          r = await xd(g, s);
        } finally {
          S(s);
        }
      } else
        r = await Dd(g, n.pin);
      if (r.ok) {
        T && S(T), T = r.lockKey, cr = Date.now();
        const s = await ur();
        if (s.restored) return { ok: !0, left: ie.tries, removed: !1, ...s };
        if (await ln(g) === "none" && (await oe(g)).length > 0) return { ok: !0, left: ie.tries, removed: !1, restored: !1 };
        await Ct(g), bt(), r = { ok: !1, left: 0, removed: !0 };
      }
      return r.removed && (bt(), await Ur(), await us(g), await mt(g)), { ok: !1, left: r.left, removed: r.removed, restored: !1 };
    }
    // ---- Signer hand-off (docs/sign-in-window.md) ----
    // The receiving side, first: a throwaway key for the hand-off to be sealed to.
    case "handoffBegin":
      return xe && S(xe), xe = be(), { recipientPublicKey: K(xe) };
    // The sending side: this worker has the session, and seals the everyday
    // key (only that) to the receiving worker's throwaway key.
    case "handoffExport": {
      const { everydayPrivateKey: n } = A(), r = be(), s = t;
      try {
        return ws(n, s.recipientPublicKey, r, s.app, {
          ...s.site !== void 0 ? { site: s.site } : {},
          // Only a site that declared nothing is told who they are. An application is held to what it asked,
          // though the window may have read the profile to show the user which account this is.
          ...u.profile && !s.app ? { profile: u.profile } : {},
          ...s.remember === !0 ? { remember: !0 } : {},
          ...s.family !== void 0 ? { family: s.family } : {},
          ...s.more !== void 0 ? { more: s.more } : {},
          // With the lock on, nothing is kept for any site: a key at rest in a site's storage would be a key
          // the lock does not cover. Every site is allowed for the visit, and asks at the sign-in address again.
          ...T ? { visitOnly: !0 } : {},
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
      if (i && !Ee(r.site, i)) throw new Error("This hand-off was for another site.");
      u.family && await rn(g, r.site);
      const a = Fd({ site: r.site, app: u.app, family: i, more: we(u.more) });
      let c = !0;
      for (const l of a)
        c = await tn(
          g,
          {
            site: l.site,
            everydayPrivateKey: n,
            // The application's own grant for as long as the signer worked out for it; the family's by its own name.
            until: u.app && i && l.site === i ? Math.floor(s) + Pn(i) : r.until,
            ...r.name ? { name: r.name } : {},
            ...u.profile && !u.app ? { profile: u.profile } : {},
            at: u.grantAt ?? Math.floor(s),
            ...u.relays.length ? { relays: u.relays } : {},
            signed: [],
            ...l.more ? { more: l.more } : {},
            ...l.memberOf ? { memberOf: l.memberOf } : {},
            ...u.device ? { device: u.device } : {},
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
      const n = t.family, r = typeof n == "string" && D(n) ? await Mt(g, n) : null;
      return r ? { pubkey: K(r.key) } : {};
    }
    case "signerRestore": {
      const n = t, r = await nn(g, n.site, Date.now() / 1e3), s = !r && n.family !== void 0 && D(n.family) && Ee(n.site, n.family) ? n.family : null, i = r ?? (s ? await nn(g, s, Date.now() / 1e3) : null);
      if (!i || s && i.site !== s) {
        const a = n.family !== void 0 && D(n.family) && Ee(n.site, n.family) && st(n.family) ? n.family : null, c = a ? n.guest === !0 ? await Ny(g, a).catch(() => null) : await Mt(g, a) : null;
        return c ? (z(), u.signer = new Q(c.key), u.everydayPrivateKey = c.key, u.signerOnly = !0, u.app = null, u.site = n.site, u.guest = a, u.remember = !1, u.profile = null, u.relays = [], u.more = [], { restored: !0, everydayPublicKey: u.signer.getPublicKey(), until: Math.floor(Date.now() / 1e3) + Fy, signed: [], guest: !0 }) : { restored: !1 };
      }
      return z(), u.signer = new Q(i.everydayPrivateKey), u.everydayPrivateKey = i.everydayPrivateKey, u.signerOnly = !0, u.app = i.permissions ? { site: i.site, permissions: i.permissions } : null, u.site = s ? n.site : i.site, u.family = s, u.memberOf = !s && i.memberOf ? i.memberOf : null, u.device = i.device ?? null, u.profile = i.profile ?? null, u.remember = !0, u.grantAt = sr(i), u.relays = i.relays ?? [], u.more = s ? [] : i.more ?? [], {
        restored: !0,
        everydayPublicKey: u.signer.getPublicKey(),
        until: i.until,
        ...i.name ? { name: i.name } : {},
        ...i.profile ? { profile: i.profile } : {},
        signed: i.signed,
        ...i.signedPass ? { signedPass: i.signedPass } : {},
        check: Ho(Date.now() / 1e3, sr(i), i.checkedAt ?? 0),
        ...s ? { family: s } : {},
        ...u.more.length ? { more: we(u.more) } : {},
        ...i.permissions ? { permissions: i.permissions, signedSensitive: i.signedSensitive ?? [] } : {}
      };
    }
    // Count a signature against the site, where reloading the page can't lose the count.
    case "signerTouch": {
      const { everydayPrivateKey: n } = A();
      if (!u.signerOnly) throw new Error("Only a signer-only session is counted for a site.");
      const r = t, s = Date.now() / 1e3, i = await nn(g, u.family && Ee(r.site, u.family) ? u.family : r.site, s);
      return i && K(i.everydayPrivateKey) === K(n) && await tn(
        g,
        { ...i, signed: Array.isArray(r.signed) ? r.signed : [], ...Array.isArray(r.signedPass) ? { signedPass: r.signedPass } : {}, ...i.permissions ? { signedSensitive: Array.isArray(r.signedSensitive) ? r.signedSensitive : [] } : {} },
        s
      ), {};
    }
    // Signing out of a site that was allowed as one of a family signs out of the family: otherwise its next page
    // load would take the family's grant up again, and the sign-out would not have happened (SF6).
    case "signerForget": {
      const n = t.site;
      await rn(g, n);
      const r = u.family ?? u.memberOf;
      r && Ee(n, r) && await rn(g, r), await g.delete(dr + n).catch(() => {
      });
      for (const s of ["save", "follow", "seal", "unwrap", "reach", "score", "achieve"])
        Dr.delete(`${Lr}${s}:${n}`), await g.delete(`${Lr}${s}:${n}`).catch(() => {
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
      const r = he(t.site);
      if (!r) throw new Error("That is not a site.");
      if (u.app && u.app.site !== r || u.site && u.site !== r) throw new Error("That is another site's.");
      const s = n.getPublicKey();
      if (e === "signerHold") {
        const i = t.receipts, a = (Array.isArray(i) ? i.slice(0, Jo) : []).filter((c) => !!c && typeof c == "object" && c.kind === 30078 && typeof c.content == "string" && c.content.length <= 8e3 && C(c));
        return await g.set(dr + r, JSON.stringify({ pubkey: s, receipts: a })), {};
      }
      try {
        const i = JSON.parse(await g.get(dr + r) ?? "null");
        return { receipts: i?.pubkey === s && Array.isArray(i.receipts) ? i.receipts.slice(0, Jo) : [] };
      } catch {
        return { receipts: [] };
      }
    }
    // ---- A headset signed in from a phone (docs/pair-a-headset.md). The headset's side, in its signer frame: a
    // one-time key made here, an offer naming the code by hash, and the phone's notes heard. What arrives is the same
    // sealed hand-off an Allow sends, opened once and taken up as one.
    case "pairBegin": {
      Yo();
      const n = t, r = he(n.site);
      if (!r) throw new Error("That is not a site.");
      return ae?.cancel(), ae = await Ks({ relayUrls: R, site: r, device: typeof n.device == "string" ? n.device.slice(0, 48) : "a device" }), { code: ae.code, expires: ae.expires };
    }
    case "pairPoll": {
      if (!ae) return { status: "ended" };
      const n = ae.state();
      if (n.status !== "paired" || !n.opened) return { status: n.status, ...n.number !== void 0 ? { number: n.number } : {} };
      ae = null;
      const r = n.opened;
      return z(), u.signer = new Q(r.key), u.everydayPrivateKey = r.key, u.signerOnly = !0, u.app = null, u.site = r.site, u.profile = r.profile, u.remember = r.remember, u.grantAt = r.at, u.relays = r.relays, u.family = r.family, u.more = [], u.device = r.device ?? null, {
        status: "paired",
        everydayPublicKey: u.signer.getPublicKey(),
        ...r.site ? { site: r.site } : {},
        ...r.profile ? { profile: r.profile } : {},
        ...r.remember ? { remember: !0 } : {},
        ...r.family ? { family: r.family } : {}
      };
    }
    case "pairCancel":
      return ae?.cancel(), ae = null, {};
    // Way 1 (docs/pair-a-headset.md): BitLogin's own /headset/ page, top-level in the headset's 2D browser, where the
    // world can't draw. It offers the code for the world's signer, named by that signer's one-time hand-off key, and
    // keeps what the phone sends sealed, as it came: only that signer can open it. No session is needed or touched.
    // Not on the list a handed-over session may ask: no signer frame offers a code.
    case "headsetBegin": {
      const n = t, r = he(n.site);
      if (!r) throw new Error("That is not a site.");
      if (typeof n.to != "string" || !/^[0-9a-f]{64}$/u.test(n.to)) throw new Error("That is not a signer's key.");
      return ce?.cancel(), ce = await Ks({ relayUrls: R, site: r, device: typeof n.device == "string" ? n.device.slice(0, 48) : "a device", to: n.to }), { code: ce.code, expires: ce.expires };
    }
    case "headsetPoll": {
      if (!ce) return { status: "ended" };
      const n = ce.state();
      return n.status === "paired" && (ce = null), { status: n.status, ...n.number !== void 0 ? { number: n.number } : {}, ...n.sealed ? { sealed: n.sealed } : {} };
    }
    case "headsetCancel":
      return ce?.cancel(), ce = null, {};
    // The phone's side, at BitLogin's own /pair, signed in: find the offer by its code, the number to match, and the
    // answer: the hand-off an Allow would send that site, sealed to the headset's one-time key, with a device id.
    case "pairFind": {
      W = { phone: Iy({ relayUrls: R }), offers: /* @__PURE__ */ new Map(), numbers: /* @__PURE__ */ new Map() };
      const n = await W.phone.find(String(t.code ?? ""));
      for (const r of n) W.offers.set(r.id, r);
      return { offers: n };
    }
    case "pairFound":
    case "pairEnd": {
      const n = W?.offers.get(String(t.offer ?? ""));
      if (!W || !n) throw new Error("That headset isn't being paired here.");
      if (e === "pairEnd")
        return await W.phone.end(n), W = null, {};
      const r = W.numbers.get(n.id);
      if (r !== void 0) return { number: r };
      const s = await W.phone.found(n);
      return W.numbers.set(n.id, s), { number: s };
    }
    case "pairAnswer": {
      const { everydayPrivateKey: n } = A();
      if (u.signerOnly) throw new Error("A headset is signed in from BitLogin's own page only.");
      const r = t, s = W?.offers.get(String(r.offer ?? ""));
      if (!W || !s) throw new Error("That headset isn't being paired here.");
      s.to || Yo();
      const i = W.numbers.get(s.id);
      if (i === void 0 || r.number !== i) {
        const { phone: l } = W;
        throw W = null, await l.end(s).catch(() => {
        }), new Error("Not the number the headset shows.");
      }
      if (r.family !== void 0 && (typeof r.family != "string" || !D(r.family) || !Ee(s.site, r.family) || !st(r.family))) throw new Error("Not that site's family.");
      const a = Ve(J(16)), c = be();
      try {
        const l = ws(n, s.to ?? s.key, c, void 0, {
          site: s.site,
          ...u.profile ? { profile: u.profile } : {},
          remember: !0,
          ...typeof r.family == "string" ? { family: r.family } : {},
          ...T ? { visitOnly: !0 } : {},
          at: Date.now() / 1e3,
          relays: u.relays,
          device: a
        });
        await W.phone.answer(s, l);
      } finally {
        S(c);
      }
      return W = null, { device: a };
    }
    case "handoffAccept": {
      if (!xe) throw new Error("No hand-off was begun here.");
      const n = xe;
      xe = null;
      let r;
      try {
        r = da(t, n);
      } finally {
        S(n);
      }
      return z(), u.signer = new Q(r.key), u.everydayPrivateKey = r.key, u.signerOnly = !0, u.app = r.app, u.site = r.site, u.profile = r.profile, u.remember = r.remember, u.grantAt = r.at, u.relays = r.relays, u.family = r.app ? null : r.family, u.memberOf = r.app ? r.family : null, u.device = r.device ?? null, u.more = r.more, {
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
      const { signer: n } = A(), r = n.getPublicKey(), s = t.profile !== !1, i = [.../* @__PURE__ */ new Set([...q, ...R])].slice(0, 8);
      if (i.length === 0) return {};
      const a = te(i);
      try {
        const [c, l] = await Promise.all([
          s ? a.queryQuorum({ kinds: [0], authors: [r], limit: 2 }, 4e3) : Promise.resolve(null),
          a.queryQuorum({ kinds: [Ye], authors: [r], limit: 2 }, 4e3)
        ]);
        if (u.signer !== n) return {};
        u.profile = c ? ds(c.outcomes.flatMap((d) => d.events), r) : null, u.profile && !u.signerOnly && await We(g, Td(await oe(g), r, u.profile)), u.relays = Xe(l.outcomes.flatMap((d) => d.events), r);
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
      const { signer: n } = A(), r = t, s = n.getPublicKey(), i = Date.now() / 1e3, a = r.all === !0 ? { all: !0 } : typeof r.device == "string" ? { device: r.device } : { site: String(r.site ?? "") }, c = te([.../* @__PURE__ */ new Set([...q, ...R])].slice(0, 8));
      let l;
      try {
        l = Xe((await c.queryQuorum({ kinds: [Ye], authors: [s], limit: 2 }, 4e3)).outcomes.flatMap((f) => f.events), s);
      } finally {
        c.closeAll();
      }
      const d = [.../* @__PURE__ */ new Set([...l, ...R])].slice(0, 16), y = te(d);
      try {
        const f = await y.queryQuorum({ kinds: [Zn], authors: [s], "#d": [Xn], limit: 2 }, 5e3);
        if (f.respondedCount === 0) return { ok: !1, accepted: 0, of: d.length };
        const h = jo(f.outcomes.flatMap((k) => k.events), s, i), p = h ? Cs(n, h.content) : null, w = await jy(s), m = qc(Bc(p ?? vr, w, i), a, i), v = n.signEvent({
          kind: Zn,
          // Later than the one it replaces, whatever the two clocks say.
          created_at: Math.max(Math.floor(i), (h?.created_at ?? 0) + 1),
          tags: [["d", Xn]],
          content: n.nip44Encrypt(s, Go(m))
        }), b = Y(await y.publishAll(v, 6e3)), _ = b >= Math.min(2, d.length);
        return _ && await g.set($a + s, Go(m)).catch(() => {
        }), { ok: _, accepted: b, of: d.length };
      } finally {
        y.closeAll();
      }
    }
    // In the embedded signer, for a kept grant: ask the user's relays whether this site was taken back. Asked at
    // most once a day. It can end the grant or leave it be, and nothing else.
    case "signerCheck": {
      const { signer: n } = A();
      if (!u.signerOnly || !u.site) return { state: "ok" };
      const r = u.family ?? u.site, s = Date.now() / 1e3, i = await nn(g, r, s);
      if (!i) return { state: "ok" };
      const a = n.getPublicKey(), c = sr(i), l = Ho(s, c, i.checkedAt ?? 0);
      if (l === "fresh") return { state: "ok" };
      const d = [.../* @__PURE__ */ new Set([...pe(i.relays), ...R])].slice(0, 12), y = te(d);
      let f, h;
      try {
        [f, h] = await Promise.all([
          y.queryQuorum({ kinds: [Zn], authors: [a], "#d": [Xn], limit: 2 }, 5e3),
          y.queryQuorum({ kinds: [Ye], authors: [a], limit: 2 }, 5e3)
        ]);
      } finally {
        y.closeAll();
      }
      if (u.signer !== n) return { state: "ok" };
      const p = jo(f.outcomes.flatMap((b) => b.events), a, s), w = p ? Cs(n, p.content) : null;
      if (w && el(w, r, c, i.device))
        return await rn(g, r), z(), { state: "ended" };
      if (!tl({
        asked: d.length,
        answered: f.respondedCount,
        seenAt: i.seenAt ?? 0,
        newestAt: p ? p.created_at : null,
        readable: w !== null
      })) return { state: l === "overdue" ? "stale" : "ok" };
      const v = Xe(h.outcomes.flatMap((b) => b.events), a);
      return await tn(
        g,
        {
          ...i,
          checkedAt: Math.floor(s),
          seenAt: Math.max(i.seenAt ?? 0, w && p ? p.created_at : 0),
          ...v.length ? { relays: v } : {}
        },
        s
      ), v.length && (u.relays = v), { state: "ok" };
    }
    // A room pass (NSWP kind 27300) for the site this session serves, and for no other. The site, the time, how
    // long it lasts and the profile are all this worker's own: what is asked for is a session public key. For an
    // application only where the set the user read already signs the pass's kind (passAllowed); for a guest, said.
    case "roomPass": {
      const { signer: n } = A();
      if (!u.signerOnly || !Zc(u.app ? u.app.permissions : null) || !u.site) throw new Error("refused");
      const r = Kd({
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
      const { signer: n, everydayPrivateKey: r, site: s } = le(), i = t, a = je(r, n.getPublicKey());
      try {
        const c = $c({ conversationKey: a, world: s, slot: i.slot, data: i.data, nowSeconds: Date.now() / 1e3 });
        if (!c || !await Ue("save", s, Fc)) throw new Error("refused");
        return n.signEvent(c);
      } finally {
        S(a);
      }
    }
    case "worldFind": {
      const { signer: n, everydayPrivateKey: r, site: s } = le(), i = je(r, n.getPublicKey());
      try {
        const a = Uc(i, s, t.slot);
        if (!a) throw new Error("refused");
        return { d: a };
      } finally {
        S(i);
      }
    }
    case "worldOpen": {
      const { signer: n, everydayPrivateKey: r, site: s } = le(), i = t.event;
      if (!C(i)) throw new Error("refused");
      const a = je(r, n.getPublicKey());
      try {
        const c = xc(i, { conversationKey: a, pubkey: n.getPublicKey(), world: s });
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
      const { signer: n, site: r } = le();
      if (!u.more.includes("follows")) throw new Error("refused");
      const s = t, i = n.getPublicKey(), a = s.list === null ? null : Vo(s.list, i);
      if (s.list !== null && !a) throw new Error("refused");
      const c = Gy + i;
      let l = 0;
      try {
        const w = Number(await g.get(c));
        Number.isSafeInteger(w) && w > 0 && (l = w);
      } catch {
      }
      const d = [.../* @__PURE__ */ new Set([...pe(u.relays), ...q, ...R])].slice(0, 8);
      let y = 0, f = 0;
      if (d.length) {
        const w = te(d);
        try {
          const m = await w.queryQuorum({ kinds: [gt], authors: [i], limit: 2 }, 3500);
          y = m.respondedCount;
          for (const v of m.outcomes.flatMap((b) => b.events))
            v.created_at > f && Vo(v, i) && (f = v.created_at);
        } catch {
        } finally {
          w.closeAll();
        }
      }
      if (u.signer !== n || !u.more.includes("follows")) throw new Error("refused");
      if (l = Math.max(l, f), l && await g.set(c, String(l)).catch(() => {
      }), !Lc(a, { answered: y, newestAt: f })) throw new Error("refused");
      const h = Dc({ list: a, ...s.add !== void 0 ? { add: s.add } : {}, ...s.remove !== void 0 ? { remove: s.remove } : {}, pubkey: i, nowSeconds: Date.now() / 1e3, seen: l });
      if (!h || !await Ue("follow", r, Xc)) throw new Error("refused");
      const p = n.signEvent(h);
      return await g.set(c, String(Math.max(l, p.created_at))).catch(() => {
      }), p;
    }
    // ---- A score on one of a world's boards (NSWP-15; embedded/scores.ts). For any world its visitor allowed: it
    // is less than a note. The world names its coordinate, a board and a number; the note and the mark that says
    // which site asked are this worker's own.
    case "worldScore": {
      const { signer: n, site: r } = le(), s = t, i = Ic({ world: s.world, board: s.board, score: s.score, title: s.title, format: s.format, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await Ue("score", r, Yc)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- An achievement held in a world (NSWP-16; embedded/achievements.ts). As a score: for any world its visitor
    // allowed, built here from three plain fields, and marked with the site this session serves.
    case "worldAchieve": {
      const { signer: n, site: r } = le(), s = t, i = Oc({ world: s.world, id: s.achievement, title: s.title, origin: r, nowSeconds: Date.now() / 1e3 });
      if (!i || !await Ue("achieve", r, Qc)) throw new Error("refused");
      return n.signEvent(i);
    }
    // ---- Private messages from inside a world (NSWP-14; embedded/messages.ts). Only for a world the user let do
    // this, by name, in the window. The world names a reader and the words, or hands over a wrap; it is never given
    // a key, and nothing else is encrypted or decrypted for it.
    case "worldSeal": {
      const { signer: n, site: r } = le();
      if (!u.more.includes("messages")) throw new Error("refused");
      const s = t, i = Mc(n, { to: s.to, text: s.text, nowSeconds: Date.now() / 1e3 });
      if (!i || !await Ue("seal", r, zc)) throw new Error("refused");
      return i;
    }
    case "worldUnwrap": {
      const { signer: n, site: r } = le();
      if (!u.more.includes("messages")) throw new Error("refused");
      if (!await Ue("unwrap", r, Hc, !1)) throw new Error("refused");
      const s = Nc(n, t.event);
      if (!s) throw new Error("refused");
      return { message: s };
    }
    case "worldReach": {
      const { signer: n, site: r } = le();
      if (!u.more.includes("messages")) throw new Error("refused");
      const s = Tc(t.relays, Date.now() / 1e3);
      if (!s || !await Ue("reach", r, Jc)) throw new Error("refused");
      return n.signEvent(s);
    }
    // ---- What an approved application may ask beyond signing (§SW9.5). Refused without a permission set.
    case "appEncrypt": {
      const { signer: n } = A(), r = lr(), s = t, i = n.getPublicKey(), a = r.permissions.sign.some((c) => Rc.includes(c));
      if (!Cc(r.permissions, i, s.peerPublicKey) && !(a && /^[0-9a-f]{64}$/u.test(String(s.peerPublicKey))))
        throw new Error("refused");
      if (typeof s.text != "string" || s.text.length > 1e5) throw new Error("refused");
      return { text: s.scheme === "nip04" ? n.nip04Encrypt(s.peerPublicKey, s.text) : n.nip44Encrypt(s.peerPublicKey, s.text) };
    }
    case "appDecrypt": {
      const { signer: n } = A(), r = lr(), s = t;
      if (!Ac(r.permissions, s.peerPublicKey) || typeof s.text != "string") throw new Error("refused");
      return { text: s.scheme === "nip04" ? n.nip04Decrypt(s.peerPublicKey, s.text) : n.nip44Decrypt(s.peerPublicKey, s.text) };
    }
    case "appDecryptEvent": {
      const { signer: n } = A(), r = lr(), s = t.event;
      if (!C(s)) throw new Error("refused");
      const i = Kc(r.permissions, n.getPublicKey(), s), a = s.kind === 4 || /\?iv=[A-Za-z0-9+/=]+$/u.test(s.content);
      for (const c of i)
        try {
          return { text: a ? n.nip04Decrypt(c, s.content) : n.nip44Decrypt(c, s.content) };
        } catch {
        }
      throw new Error("refused");
    }
    case "nip46Connect": {
      const r = Ll(t.uri), s = new ts({
        clientSecretKey: be(),
        pointer: r,
        onAuthUrl: Os
      });
      try {
        await s.connect();
        const i = await s.getUserPublicKey();
        return Is(s, i), on(), { userPubkey: i };
      } catch (i) {
        throw s.close(), i;
      }
    }
    case "nip46NostrconnectStart": {
      const n = t, r = R.slice(0, 2);
      on();
      const s = be(), i = Ve(J(16));
      return ye = { clientSecretKey: s, relayUrls: r, secret: i, abort: new AbortController() }, { uri: Dl({
        clientPubkey: K(s),
        relayUrls: r,
        secret: i,
        name: n.appName?.trim() || "BitLogin",
        perms: ["sign_event", "nip44_encrypt", "nip44_decrypt", "nip04_encrypt", "nip04_decrypt"]
      }) };
    }
    case "nip46NostrconnectAwait": {
      const n = ye;
      if (!n) throw new Error("No signer-connection attempt is in progress.");
      let r;
      try {
        ({ signerPubkey: r } = await Ul({
          clientSecretKey: n.clientSecretKey,
          relayUrls: n.relayUrls,
          secret: n.secret,
          timeoutMs: 18e4,
          signal: n.abort.signal
        }));
      } catch (i) {
        throw ye === n && on(), i;
      }
      if (ye !== n) throw new Error("This signer-connection attempt was superseded.");
      ye = null;
      const s = new ts({
        clientSecretKey: n.clientSecretKey,
        pointer: { signerPubkey: r, relayUrls: n.relayUrls },
        onAuthUrl: Os
      });
      try {
        const i = await s.getUserPublicKey();
        return Is(s, i), { userPubkey: i };
      } catch (i) {
        throw s.close(), i;
      }
    }
    case "nip46SignEvent": {
      const n = t;
      return Et().client.signEvent({
        kind: n.kind,
        content: n.content,
        tags: n.tags ?? [],
        created_at: n.created_at ?? Math.floor(Date.now() / 1e3)
      });
    }
    case "nip46Nip44Encrypt": {
      const n = t;
      return { ciphertext: await Et().client.nip44Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip44Decrypt": {
      const n = t;
      return { plaintext: await Et().client.nip44Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Nip04Encrypt": {
      const n = t;
      return { ciphertext: await Et().client.nip04Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip04Decrypt": {
      const n = t;
      return { plaintext: await Et().client.nip04Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Disconnect": {
      const n = Ge;
      return Ge = null, on(), n && Ba(n.client), {};
    }
    case "configure": {
      const n = t;
      return Or = !!n.vaultRelayUrls?.length, Ir = !!n.discoveryRelayUrls?.length, n.vaultRelayUrls?.length && (R = n.vaultRelayUrls), n.discoveryRelayUrls?.length && (q = n.discoveryRelayUrls), Rs(an(await oi(g))), (!Or || !Ir) && Kl(g).then(Rs, () => {
      }), {};
    }
    case "register": {
      const n = t, r = n.fromGuest !== void 0 && !n.importKey && D(n.fromGuest) && st(n.fromGuest) ? n.fromGuest : null;
      if (n.fromGuest !== void 0 && !r) throw new Error("That is not a guest account kept here.");
      const s = r ? await Mt(g, r) : null;
      if (r && !s) throw new Error("No guest account is kept here to secure.");
      const i = n.importKey ? await Fu({ nsecOrHex: n.importKey, loginName: n.loginName, password: n.password, vaultRelayUrls: R }) : await Oi({ loginName: n.loginName, password: n.password, vaultRelayUrls: R, ...s ? { recoveryPhrase: s.phrase } : {} });
      if (r) {
        const a = Date.now() / 1e3;
        await tn(g, { site: r, everydayPrivateKey: i.everydayPrivateKey, until: Math.floor(a) + Pn(r), at: Math.floor(a), signed: [] }, a), await My(g, r);
      }
      return z(), u.signer = new Q(i.everydayPrivateKey), u.everydayPrivateKey = i.everydayPrivateKey, u.accountId = i.accountId, u.recoveryPublicKey = i.recoveryPublicKey, u.activeCredentialEvent = i.credentialEvent, u.activeRecoveryEvent = i.recoveryEvent, u.everydayKeyDerived = i.everydayKeyDerived, xr(i.connectionVaultRoot, i.vaultSudoKey), await $e(), {
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
      const r = Ii(t.nsecOrHex), s = K(r), i = { everydayPublicKey: s, npub: St(s) };
      return r.fill(0), i;
    }
    case "login": {
      const n = t, r = await qu({
        loginName: n.loginName,
        password: n.password,
        vaultRelayUrls: R,
        store: g,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return z(), u.signer = new Q(r.everydayPrivateKey), u.everydayPrivateKey = r.everydayPrivateKey, u.accountId = r.accountId, u.recoveryPublicKey = r.recoveryPublicKey, u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.recoveryCapsuleEvent, u.everydayKeyDerived = r.everydayKeyDerived, xr(r.connectionVaultRoot, r.vaultSudoKey), await $e(), !r.rollbackWarning && !r.relayDisagreementWarning && os({
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
      const n = t, r = await Bu({
        phrase: n.phrase,
        vaultRelayUrls: R,
        discoveryRelayUrls: q,
        offlineRecoveryCapsuleEvents: n.offlineExportFile?.recovery_capsule_events
      });
      return Ts(r);
    }
    case "previewPhraseRebuild": {
      const r = await Wu({ phrase: t.phrase, vaultRelayUrls: R, discoveryRelayUrls: q });
      return { ...r, npub: St(r.everydayPublicKey) };
    }
    case "rebuildFromPhrase": {
      const r = await Vu({ phrase: t.phrase, vaultRelayUrls: R, discoveryRelayUrls: q });
      return Ts(r);
    }
    case "completeRecovery": {
      const n = t;
      if (!u.pendingRecovery) throw new Error("No recovery is in progress in this session.");
      const r = await ju({
        recovered: u.pendingRecovery,
        newLoginName: n.newLoginName,
        newPassword: n.newPassword,
        vaultRelayUrls: R,
        store: g
      });
      return u.activeCredentialEvent = r.credentialEvent, u.activeRecoveryEvent = r.refreshedRecoveryEvent, u.pendingRecovery.recoveryPrivateKey.fill(0), u.pendingRecovery = null, await $e(), {
        locatorPublicKey: r.locatorPublicKey,
        credentialEventId: r.credentialEvent.id,
        refreshedRecoveryEventId: r.refreshedRecoveryEvent.id
      };
    }
    case "changePassword": {
      const n = t, r = await Gu({
        loginName: n.loginName,
        oldPassword: n.oldPassword,
        newPassword: n.newPassword,
        vaultRelayUrls: R,
        store: g,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return u.activeCredentialEvent = r.newCredentialEvent, u.recoveryPublicKey = r.recoveryPublicKey, u.activeRecoveryEvent = r.recoveryCapsuleEvent, await $e(), {
        newLocatorPublicKey: r.newLocatorPublicKey,
        newGeneration: r.newGeneration,
        tombstoneAcknowledgedCount: r.tombstoneAcknowledgedCount,
        deletionAcknowledgedCount: r.deletionAcknowledgedCount
      };
    }
    case "publishProfileAndRelayLists": {
      const n = t, { everydayPrivateKey: r } = A();
      return bu({
        everydayPrivateKey: r,
        name: n.name,
        about: n.about,
        picture: n.picture,
        generalRelays: n.generalRelays,
        dmRelays: n.dmRelays,
        discoveryRelays: q
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
          const s = Vc(u.app.permissions, r, u.app.site, Date.now() / 1e3);
          if (!s) throw new Error("refused");
          return n.signEvent(s);
        }
        if (u.guest) {
          const s = u.site ? jc(r, u.site, Date.now() / 1e3) : null;
          if (!s) throw new Error("refused");
          return n.signEvent(s);
        }
        if (Gc(r.kind) !== "ordinary") throw new Error("refused");
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
      return { nsec: Ya(n), npub: St(r.getPublicKey()) };
    }
    case "buildRecoveryExport": {
      if (A(), !u.recoveryPublicKey || !u.activeRecoveryEvent)
        throw new Error("No recovery capsule is known in this session yet.");
      return Xa({
        recoveryPublicKeyHex: u.recoveryPublicKey,
        vaultRelayUrls: R,
        recoveryCapsuleEvents: [u.activeRecoveryEvent],
        relayListEvents: []
      });
    }
    case "repairReplicas": {
      if (!u.activeCredentialEvent || !u.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return os({
        relayUrls: R,
        credentialEvent: u.activeCredentialEvent,
        recoveryEvent: u.activeRecoveryEvent
      });
    }
    case "checkReplicaHealth": {
      if (!u.activeCredentialEvent || !u.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Du({
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
      return !T && await ln(g) === "locked" ? { restored: !1, locked: !0 } : ur();
    // Log out: this account is forgotten on this device. Other accounts kept here stay, and so does the lock
    // they are sealed under; with none left, everything goes as it always did.
    case "logout": {
      const n = u.everydayPrivateKey && !u.signerOnly ? K(u.everydayPrivateKey) : "", r = un(await oe(g), n);
      return n && await ue(g, ne(n)), r.length > 0 && n ? (await We(g, r), z(), await ue(g), await mt(g), {}) : (bt(), await Ct(g), await Ur(), await us(g), await mt(g), {});
    }
    // ---- Several accounts on one device (docs/account-switching.md) ----
    // Who is kept here, and which of them is signed in. Public keys and what their own profiles call them.
    case "accountsList": {
      const n = u.everydayPrivateKey && !u.signerOnly ? K(u.everydayPrivateKey) : "";
      return { accounts: (await oe(g)).map((r) => ({ ...r, active: r.pubkey === n })) };
    }
    // Switch to a kept account: its own slot is opened, on this device, with no password and no relay. With the
    // lock on and locked, it says so, and nothing changes.
    case "accountsSwitch": {
      if (u.signerOnly) throw new Error("A signer-only session cannot switch accounts.");
      const n = String(t.pubkey ?? ""), r = await oe(g);
      if (!r.some((i) => i.pubkey === n)) return { restored: !1 };
      if (!T && await ln(g, ne(n)) === "locked") return { restored: !1, locked: !0 };
      const s = await ur(ne(n));
      return !s.restored || s.everydayPublicKey !== n ? (z(), await ue(g, ne(n)), await We(g, un(r, n)), await ue(g), await mt(g), { restored: !1 }) : (await $e(), s);
    }
    // Make room to sign in as another account: nobody is signed in, and everyone kept stays kept.
    case "accountsAdd": {
      if (u.signerOnly) throw new Error("A signer-only session cannot add accounts.");
      return z(), await ue(g), await mt(g), {};
    }
    // Forget one kept account that is not the one signed in. (For that one: log out.)
    case "accountsRemove": {
      const n = String(t.pubkey ?? ""), r = u.everydayPrivateKey && !u.signerOnly ? K(u.everydayPrivateKey) : "";
      if (n === r) throw new Error("Log out to remove the account that is signed in.");
      return await ue(g, ne(n)), await We(g, un(await oe(g), n)), {};
    }
    // ---- Connection Vault (connection-vault.md §12, reveal mode) ----
    // ---- An ecash wallet kept with the account (docs/ecash.md). A full session only: none of these is on the list a
    // handed-over session may ask, so no embedded signer, and so no site, can read a token.
    // ---- A person's files (docs/files.md). A full session only: none of these is on the list a handed-over
    // session may ask, so no embedded signer, and so no site, can read the index or have a permission note signed.
    case "blossomAuth": {
      const { signer: n } = A();
      return { token: sy(n, t) };
    }
    case "driveLoad":
    case "driveSave":
    case "blossomServers":
    case "blossomSetServers": {
      const { signer: n } = A(), r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...q, ...R])].slice(0, 8);
      let i = u.relays;
      if (i.length === 0 && s.length) {
        const c = te(s);
        try {
          i = Xe((await c.queryQuorum({ kinds: [Ye], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((l) => l.events), r), i.length && (u.relays = i);
        } catch {
          i = [];
        } finally {
          c.closeAll();
        }
      }
      const a = yr([.../* @__PURE__ */ new Set([...i, ...R, ...e.startsWith("blossom") ? q : []])].slice(0, 16));
      try {
        const c = { signer: n, store: g, relays: a };
        if (e === "driveLoad") return await ry(c);
        if (e === "driveSave") return await oy(c, t);
        const l = async () => {
          const v = await a.queryQuorum({ kinds: [Pt], authors: [r], limit: 2 }, 4e3);
          if (v.respondedCount === 0) throw new Error("No relay answered for your server list.");
          const b = v.outcomes.flatMap((_) => _.events).filter((_) => _.kind === Pt && _.pubkey === r && C(_)).sort((_, k) => k.created_at - _.created_at)[0];
          return b ? ka(b) : [];
        };
        if (e === "blossomSetServers") {
          const v = [...new Set((t.servers ?? []).map(Zr).filter(Boolean))].slice(0, Xr.servers);
          if (v.length === 0) throw new Error("Name at least one file server, by its https address.");
          const b = n.signEvent({ kind: Pt, created_at: Math.floor(Date.now() / 1e3), tags: v.map((_) => ["server", _]), content: "" });
          if (Y(await a.publishAll(b, 6e3)) < Math.min(2, a.relayUrls.length)) throw new Error("No relay took your server list. Try again when you are online.");
          return { mine: v };
        }
        if (t.ranked !== !0) return { mine: await l(), ranked: [] };
        const d = tt(a.relayUrls), [y, f, h] = await Promise.all([
          l(),
          d.queryQuorum({ kinds: [Pt], limit: 500 }, 5e3),
          d.queryQuorum({ kinds: [gt], authors: [r], limit: 2 }, 4e3)
        ]).finally(() => d.closeAll()), p = h.outcomes.flatMap((v) => v.events).filter((v) => v.pubkey === r && v.kind === gt && C(v)).sort((v, b) => b.created_at - v.created_at)[0], w = new Set((p?.tags ?? []).filter((v) => v[0] === "p" && typeof v[1] == "string").map((v) => v[1])), m = new Map(f.outcomes.flatMap((v) => v.events).filter((v) => v.pubkey !== r && C(v)).map((v) => [v.id, v]));
        return { mine: y, ranked: iy([...m.values()], w) };
      } finally {
        a.closeAll();
      }
    }
    // ---- Paying, and buying (docs/paying.md). A full session at one of BitLogin's own sign-in addresses only: none
    // of these is on the list a handed-over session may ask, so no embedded signer, and so no site, can have a
    // buyer's permission note signed or read what a person bought.
    // Whom a tip is for: the name and the lightning address in that person's own signed profile. Read-only.
    case "payProfile": {
      A(), Fe();
      const n = t.pubkey;
      if (typeof n != "string" || !/^[0-9a-f]{64}$/u.test(n)) throw new Error("That is not an account.");
      const r = [.../* @__PURE__ */ new Set([...u.relays, ...q, ...R])].slice(0, 10);
      if (r.length === 0) return { name: "", address: "", answered: !1 };
      const s = tt(r);
      try {
        const i = await s.queryQuorum({ kinds: [0], authors: [n], limit: 2 }, 3500), a = i.outcomes.flatMap((l) => l.events), c = a.filter((l) => l.kind === 0 && l.pubkey === n && C(l)).sort((l, d) => d.created_at - l.created_at)[0];
        return { name: ds(a, n)?.name ?? "", address: c ? Sc(c.content, { local: Xt(Pe()) }) : "", answered: i.respondedCount > 0 };
      } finally {
        s.closeAll();
      }
    }
    // A listing, by its coordinate, from the relays its service names and the account's own. The page checks it.
    case "payListing": {
      A(), Fe();
      const n = t, r = js(n.coordinate);
      if (!r) throw new Error("That is not a listing.");
      const s = Xt(Pe()), i = (Array.isArray(n.relays) ? n.relays : []).filter((l) => typeof l == "string" && l.length <= 200 && (/^wss:\/\//u.test(l) || s && /^ws:\/\/(localhost|127\.0\.0\.1)[:/]/u.test(l))).slice(0, 6), a = [.../* @__PURE__ */ new Set([...i, ...u.relays, ...q])].slice(0, 12);
      if (a.length === 0) return { event: null, answered: !1 };
      const c = tt(a);
      try {
        const l = await c.queryQuorum({ kinds: [30078], authors: [Wo(r)], "#d": [r.slice(71)], limit: 4 }, 5e3);
        return { event: l.outcomes.flatMap((y) => y.events).filter((y) => y.kind === 30078 && y.pubkey === Wo(r) && y.tags.some((f) => f[0] === "d" && f[1] === r.slice(71)) && C(y)).sort((y, f) => f.created_at - y.created_at)[0] ?? null, answered: l.respondedCount > 0 };
      } finally {
        c.closeAll();
      }
    }
    // A buyer's permission note (NIP-98) for one request to a selling service BitLogin knows: this address, this
    // method, this body, once. Kind 27235 is signed here and nowhere else, and never for a site.
    case "unlockAuth": {
      const { signer: n } = A();
      Fe();
      const r = t;
      let s;
      try {
        s = new URL(String(r.url));
      } catch {
        throw new Error("That is not an address.");
      }
      const i = Pc.some((y) => y.endpoint === s.origin) || Xt(Pe()) && Xt(s.origin);
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
      Fe();
      const r = t;
      if (!qo(r.subject) || r.scope !== "user-allow" && r.scope !== "user-deny") throw new Error("That is not a world's list.");
      const s = n.getPublicKey(), i = te([.../* @__PURE__ */ new Set([...u.relays, ...R, ...q])].slice(0, 12));
      try {
        const a = await i.queryQuorum({ kinds: [30078], authors: [s], "#d": [Bo(r.scope, r.subject)], limit: 4 }, 5e3), c = a.outcomes.flatMap((f) => f.events), l = Bo(r.scope, r.subject), d = _c(c, { scope: r.scope, subject: r.subject, root: [s] }), y = c.filter((f) => f.pubkey === s && f.kind === 30078 && f.tags.some((h) => h[0] === "d" && h[1] === l) && f.created_at <= Date.now() / 1e3 + 600).sort((f, h) => h.created_at - f.created_at || (f.id < h.id ? -1 : 1));
        return { event: d.ok ? y[0] ?? null : null, answered: a.respondedCount > 0 };
      } finally {
        i.closeAll();
      }
    }
    // Sign this account's list for a world: built here from the world, which list, and who is on it. Nothing else.
    case "guestListSign": {
      const { signer: n } = A();
      Fe();
      const r = t, s = typeof r.replaces == "number" && Number.isSafeInteger(r.replaces) && r.replaces <= Date.now() / 1e3 + 600 ? r.replaces : void 0, i = r.scope === "user-allow" || r.scope === "user-deny" ? Ec({ scope: r.scope, subject: String(r.subject), people: Array.isArray(r.people) ? r.people : [], createdAt: Math.floor(Date.now() / 1e3), ...s !== void 0 ? { notBefore: s } : {} }) : null;
      if (!i || !qo(r.subject)) throw new Error("That is not a list this account can keep.");
      return { event: n.signEvent(i) };
    }
    // The receipts kept with the account: in this browser first, then on its relays, each sealed to its own key.
    case "paySettingsLoad":
    case "paySettingsSave":
    case "receiptsLoad":
    case "receiptsKeep": {
      const { signer: n } = A();
      Fe();
      const r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...q, ...R])].slice(0, 8);
      let i = u.relays;
      if (i.length === 0 && s.length) {
        const l = tt(s);
        try {
          i = Xe((await l.queryQuorum({ kinds: [Ye], authors: [r], limit: 2 }, 4e3)).outcomes.flatMap((d) => d.events), r), i.length && (u.relays = i);
        } catch {
          i = [];
        } finally {
          l.closeAll();
        }
      }
      const a = [.../* @__PURE__ */ new Set([...i, ...R])].slice(0, 16), c = e === "receiptsLoad" || e === "receiptsKeep" ? tt(a) : yr(a);
      try {
        const l = { signer: n, store: g, relays: c };
        return e === "paySettingsLoad" ? await Qd(l) : e === "paySettingsSave" ? await Yd(l, t) : e === "receiptsLoad" ? await Hd(l) : await zd(l, t.receipts);
      } finally {
        c.closeAll();
      }
    }
    // The words of their newest profile note, to show what a proposed one would change. Read-only, and theirs.
    case "profileContent": {
      const { signer: n } = A(), r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...u.relays, ...q, ...R])].slice(0, 10);
      if (s.length === 0) return { content: null, answered: !1 };
      const i = te(s);
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
      const { signer: n } = A(), r = n.getPublicKey(), s = [.../* @__PURE__ */ new Set([...q, ...R])].slice(0, 8);
      if (s.length === 0) return { mints: [] };
      const i = tt(s);
      try {
        const [a, c] = await Promise.all([
          i.queryQuorum({ kinds: [ya], "#k": [fa], limit: 500 }, 5e3),
          i.queryQuorum({ kinds: [gt], authors: [r], limit: 2 }, 4e3)
        ]), l = c.outcomes.flatMap((f) => f.events).filter((f) => f.pubkey === r && f.kind === gt && C(f)).sort((f, h) => h.created_at - f.created_at)[0], d = new Set((l?.tags ?? []).filter((f) => f[0] === "p" && typeof f[1] == "string").map((f) => f[1])), y = new Map(a.outcomes.flatMap((f) => f.events).filter((f) => C(f)).map((f) => [f.id, f]));
        return { mints: Gd([...y.values()], d) };
      } finally {
        i.closeAll();
      }
    }
    // The browser's own copies, asked of no relay and writing nothing: shown at once, marked as being checked, while
    // the careful read above runs behind them (docs/panel-speed-2026-11-23.md). A full session only, as the loads are.
    // ---- The wallet's seed (docs/ecash-seed-counter.md). A full session only: none of these is on the list a
    // handed-over session may ask, so no embedded signer, and so no site, can have an output made or a lane read.
    // The seed is made here from the account's key and never leaves: the page is handed the outputs alone.
    // The worker keeps the counters too (2026-11-25, the review's finding 3): an output's secret and blinding factor are
    // handed over only for counters it reserves itself, for one operation, under the lock every tab shares. Anything
    // else is a blinded message, or a finished proof for a signature the mint already made.
    case "ecashLaneGet":
    case "ecashDraw":
    case "ecashReserve":
    case "ecashForward":
    case "ecashTrialOutput":
    case "ecashRepin": {
      const { signer: n, everydayPrivateKey: r } = A(), s = { signer: n, store: g, seed: () => vs(r), lock: Ft() }, i = t;
      return e === "ecashRepin" ? await wy(s, i.keysetId, i.keyset) : e === "ecashLaneGet" ? { state: await yy(s, i.keysetId) } : e === "ecashDraw" ? { state: await my(s, i.keysetId, i.lane) } : e === "ecashReserve" ? await by(s, i.keysetId, i.amounts, i.keyset) : e === "ecashForward" ? { state: await ky(s, i.keysetId, i.next) } : { output: await Ey(s, i.keysetId, i.keyset) };
    }
    // Blinded messages, and proofs for signatures the mint proved it made (DLEQ, checked here), and only where the
    // worker has the lock every tab shares (the review's second finding 1).
    case "ecashBlinded":
    case "ecashUnblind": {
      const { signer: n, everydayPrivateKey: r } = A(), s = { signer: n, store: g, seed: () => vs(r), lock: Ft() }, i = t;
      return e === "ecashBlinded" ? { blinded: await fy(s, i.keysetId, i.from, i.count) } : { proofs: (await hy(s, i.keysetId, i.keyset, i.found)).map((a) => ({ id: a.id, amount: Number(a.amount), secret: a.secret, C: a.C })) };
    }
    case "ecashPeek":
    case "drivePeek":
    case "receiptsPeek": {
      const { signer: n } = A();
      e === "receiptsPeek" && Fe();
      const r = { signer: n, store: g };
      return e === "ecashPeek" ? await Sy(r) : e === "drivePeek" ? await ny(r) : await Jd(r);
    }
    case "ecashLoad":
    case "ecashSetMints":
    case "ecashKeepTrial":
    case "ecashRoll": {
      const { signer: n } = A(), r = n.getPublicKey(), s = te([.../* @__PURE__ */ new Set([...q, ...R])].slice(0, 8)), i = s.queryQuorum({ kinds: [Ye], authors: [r], limit: 2 }, 4e3).then((d) => Xe(d.outcomes.flatMap((y) => y.events), r)).catch(() => []).then((d) => (d.length && u.signer === n && (u.relays = d), d)).finally(() => s.closeAll());
      let a = u.relays;
      if (a.length === 0) a = await i;
      else {
        const d = await Promise.race([i, new Promise((y) => setTimeout(() => y([]), qy))]);
        d.length && (a = d);
      }
      const c = [.../* @__PURE__ */ new Set([...a, ...R])].slice(0, 16), l = yr(c);
      try {
        const d = { signer: n, store: g, relays: l };
        return e === "ecashLoad" ? await Ky(d) : e === "ecashSetMints" ? await Ay({ ...d, newKey: () => Ve(be()) }, t.mints) : e === "ecashKeepTrial" ? await Cy(d, t.trial) : await Ry(d, t, () => self.postMessage({ notify: "ecash-sealed", id: o }));
      } finally {
        l.closeAll();
      }
    }
    case "vaultStatus":
      return u.signer ? u.connectionVaultRoot ? { enabled: !0, vaultPublicKey: $r().vaultPublicKey } : { enabled: !1, reason: u.vaultKnown ? "no-vault" : "stale-cache" } : { enabled: !1 };
    case "vaultList": {
      const { connections: n, rollbackWarnings: r, unreadable: s, truncated: i, quorumMet: a } = await yn();
      return { connections: n.map(kt), rollbackWarnings: r, unreadable: s, truncated: i, quorumMet: a };
    }
    case "vaultSaveNwc": {
      const n = t, r = fr(n.site), s = $r(), i = cs(n.uri), a = n.label.trim().slice(0, 120) || "Wallet connection", { record: c, event: l } = await s.createConnection({
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
        store: g
      })).success)
        throw new Error("The connection could not be saved to enough relays. Please try again.");
      const y = await s.decryptEvent(l);
      return kt(y);
    }
    case "vaultFindForOrigin": {
      const n = fr(t.site), { connections: r } = await yn(), s = r.find(
        (i) => i.record.connection_type === "nwc" && i.record.state === "active" && i.record.application_binding.origin === n
      );
      return { connection: s ? kt(s) : null };
    }
    case "vaultRevealNwc": {
      const n = t, r = fr(n.site), { connection: s } = await hr(n.connectionId);
      if (s.record.connection_type !== "nwc" || s.record.state !== "active")
        throw new Error("That connection is not an active wallet connection.");
      const i = s.record.application_binding.origin;
      if (i !== null && i !== r)
        throw new Error("That connection belongs to a different site.");
      const a = s.record.credential;
      return Ji(a), { uri: od(a) };
    }
    case "vaultSetBinding": {
      const n = t, { vault: r, connection: s } = await hr(n.connectionId), i = n.origin === null ? null : Pe(), { record: a, event: c } = await r.updateConnection(s, {
        application_binding: { origin: i, app_pubkey: null }
      });
      if (!(await r.publish({
        event: c,
        connectionId: a.connection_id,
        relayUrls: R,
        store: g
      })).success) throw new Error("The change could not reach enough relays. Please try again.");
      const d = await r.decryptEvent(c);
      return kt(d);
    }
    case "vaultDelete": {
      const n = t, { vault: r, connection: s } = await hr(n.connectionId), { record: i, event: a } = await r.deleteConnection(s);
      if (!(await r.publish({
        event: a,
        connectionId: i.connection_id,
        relayUrls: R,
        store: g
      })).success) throw new Error("The deletion could not reach enough relays. Please try again.");
      try {
        const l = r.buildDeletionRequest(s.event.id), d = new N(R);
        await d.publishAll(l), d.closeAll();
      } catch {
      }
      return {};
    }
    case "vaultOfferCheck": {
      const n = t, r = Pe(), s = cs(n.uri), { connections: i } = await yn(), a = i.find(
        (c) => c.record.connection_type === "nwc" && sd(c.record.credential, s)
      );
      return a ? a.record.application_binding.origin !== r ? { duplicate: !1 } : { duplicate: !0, connection: kt(a) } : { duplicate: !1 };
    }
    default:
      throw new Error(`Unknown worker action: ${e}`);
  }
}
const zy = /* @__PURE__ */ new Set([
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
  "pairBegin",
  "pairPoll",
  "pairCancel",
  "headsetBegin",
  "headsetPoll",
  "headsetCancel",
  "pairFind",
  "pairFound",
  "pairEnd",
  "pairAnswer",
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
  "ecashLaneGet",
  "ecashDraw",
  "ecashReserve",
  "ecashForward",
  "ecashBlinded",
  "ecashUnblind",
  "ecashTrialOutput",
  "ecashRepin",
  "ecashKeepTrial",
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
  if (typeof t.action != "string" || !zy.has(t.action)) {
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
  (n.startsWith("nip46") || n === "ecashPeek" || n === "drivePeek" || n === "receiptsPeek" ? (i) => i() : (i) => By.run(Wy[n] ?? null, i))(() => Hy(n, r, o)).then(
    (i) => {
      const a = { id: o, ok: !0, result: i };
      self.postMessage(a);
    },
    (i) => {
      self.postMessage($y(o, i));
    }
  );
});
