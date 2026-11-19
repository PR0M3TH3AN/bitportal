import { v as V, g as k, s as Z, b as $e, a as ee, K as Yr, j as ct, k as je, l as Dt, m as W, u as te, n as Xr, o as Qr, d as x, q as ne, t as ft, S as pt, w as Vt, x as vt, D as Ue, y as Je, z as Me, A as Zr, B as eo, C as to, F as no, G as mt, H as hn, I as qt, J as ro, L as oo, M as io, N as Ze, O as Bt, P as ao, Q as so, T as Wt, U as wt, V as Fe, W as co, X as $t, Y as jt, Z as E, _ as Ln, $ as lo, h as Ft, a0 as Un, a1 as Oe, a2 as uo, c as Ye, a3 as Mn, a4 as Ce, a5 as yo, a6 as On, a7 as rt, a8 as Rt, a9 as ho, f as ot, aa as fo, ab as et } from "./bitlogin-shared-DDWBXFUP.js";
class _e extends Error {
  reason;
  constructor(t) {
    super("Account not found or credentials incorrect."), this.name = "AccountNotFoundError", this.reason = t;
  }
}
class de extends Error {
  constructor(t) {
    super(t), this.name = "RegistrationFailedError";
  }
}
class Dn extends Error {
  constructor(t = "An account already exists with this login name and password. Sign in instead, or choose different credentials.") {
    super(t), this.name = "AccountAlreadyExistsError";
  }
}
class ye extends Error {
  constructor(t) {
    super(t), this.name = "RecoveryFailedError";
  }
}
class Vn extends Error {
  seenGeneration;
  capsuleGeneration;
  constructor(t, n) {
    super(`This credential capsule reports generation ${n}, but this device has already seen generation ${t}. Refusing to log in with older, possibly-revoked credentials.`), this.name = "RollbackDetectedError", this.seenGeneration = t, this.capsuleGeneration = n;
  }
}
function ze(e, t) {
  const n = t ?? Math.floor(Date.now() / 1e3);
  return e == null ? n : Math.max(n, e + 1);
}
const po = { generation: -1, recoveryGeneration: -1 };
function zt(e) {
  return `bitlogin:hwm:${e}`;
}
async function Ht(e, t) {
  const n = await e.get(zt(t));
  return n ? JSON.parse(n) : po;
}
async function qn(e, t, n) {
  const r = await Ht(e, t), o = {
    generation: Math.max(r.generation, n.generation ?? -1),
    recoveryGeneration: Math.max(r.recoveryGeneration, n.recoveryGeneration ?? -1)
  };
  return await e.set(zt(t), JSON.stringify(o)), o;
}
async function vo(e, t, n = { generation: 0, recoveryGeneration: -1 }) {
  await e.set(zt(t), JSON.stringify(n));
}
function wo(e) {
  const t = e.split(".");
  if (t.length !== 4 || t.some((r) => !/^\d{1,3}$/u.test(r)))
    return !1;
  const n = t.map(Number);
  return n.every((r) => r >= 0 && r <= 255) && n[0] === 127;
}
function Xe(e) {
  let t;
  try {
    t = new URL(e);
  } catch {
    return !1;
  }
  return t.username || t.password || t.hash ? !1 : t.protocol === "wss:" ? !0 : t.protocol !== "ws:" ? !1 : t.hostname === "localhost" || t.hostname === "[::1]" || wo(t.hostname);
}
function go() {
  const e = globalThis.WebSocket;
  if (!e)
    throw new Error("No global WebSocket implementation is available in this environment.");
  return e;
}
const lt = 1e3, bo = 262144;
function mo(e) {
  const t = Math.min(e.limit ?? lt, lt);
  return Math.max(50, t * 3);
}
const _o = 2048, ko = 1e4, Eo = 100;
function Po(e, t) {
  if (e.size >= _o) {
    const n = e.values().next().value;
    n !== void 0 && e.delete(n);
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
  constructor(t, n = {}) {
    if (!Xe(t))
      throw new Error("Relay URL must use secure WebSockets, except for an explicit loopback development endpoint.");
    this.url = t, this.authPrivateKey = n.authPrivateKey, this.connectTimeoutMs = n.connectTimeoutMs ?? 8e3;
  }
  async connect() {
    return this.connectPromise ? this.connectPromise : (this.connectPromise = new Promise((t, n) => {
      const r = go(), o = new r(this.url);
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
    if (t.length > bo)
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
        const u = Date.now();
        if (u - s.liveWindowStart >= ko && (s.liveWindowStart = u, s.liveVerifies = 0), s.liveVerifies >= Eo || (s.liveVerifies++, !V(a) || !fn(a, s.filter)))
          return;
        Po(s.seenIds, a.id), s.onEvent(a);
        return;
      }
      const l = Math.min(s.filter.limit ?? lt, lt);
      if (s.events.length >= l || s.verifyBudget <= 0 || (s.verifyBudget--, !V(a) || !fn(a, s.filter)))
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
    const n = k(this.authPrivateKey), r = Z({
      pubkey: n,
      created_at: Math.floor(Date.now() / 1e3),
      kind: Yr,
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
    const r = $e(ee(8));
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
    const r = $e(ee(8));
    return new Promise((o, i) => {
      const a = [], s = (l) => {
        clearTimeout(c), this.subs.delete(r);
        try {
          this.send(["CLOSE", r]);
        } catch {
        }
        l ? i(l) : o(a);
      }, c = setTimeout(() => s(new Error("relay did not answer the subscription before the timeout")), n);
      this.subs.set(r, {
        events: a,
        seenIds: /* @__PURE__ */ new Set(),
        verifyBudget: mo(t),
        liveWindowStart: 0,
        liveVerifies: 0,
        filter: t,
        onEose: () => s()
      }), this.send(["REQ", r, t]);
    });
  }
}
function fn(e, t) {
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
      this.connections.set(r, new Gt(r, n));
  }
  get relayUrls() {
    return [...this.connections.keys()];
  }
  /** Queries every configured relay and waits for a quorum of responses (or all timeouts) before returning (§16.2). */
  async queryQuorum(t, n = 8e3) {
    const r = [...this.connections.entries()], o = await Promise.all(r.map(async ([s, c]) => {
      try {
        const l = await c.queryOnce(t, n);
        return { relayUrl: s, events: l, responded: !0 };
      } catch (l) {
        return { relayUrl: s, events: [], responded: !1, error: l.message };
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
function Ne(e) {
  return e.filter((t) => t.result.ok).length;
}
function Ko(e, t, n) {
  return Z({ pubkey: k(e), created_at: n, kind: ct, tags: [], content: JSON.stringify(t) }, e);
}
function Ro(e, t, n) {
  const r = t.map((o) => {
    const i = ["r", o.url];
    return o.read && !o.write && i.push("read"), o.write && !o.read && i.push("write"), i;
  });
  return Z({ pubkey: k(e), created_at: n, kind: je, tags: r, content: "" }, e);
}
function Ao(e, t, n) {
  return Z({
    pubkey: k(e),
    created_at: n,
    kind: Dt,
    tags: t.map((r) => ["relay", r]),
    content: ""
  }, e);
}
function So(e) {
  return e.tags.filter((t) => t[0] === "r" && t[1]).map((t) => t[1]);
}
function No(e) {
  return e.tags.filter((t) => t[0] === "relay" && t[1]).map((t) => t[1]);
}
async function Co(e) {
  const t = k(e.everydayPrivateKey), n = Math.floor(Date.now() / 1e3), r = [.../* @__PURE__ */ new Set([...e.generalRelays, ...e.dmRelays, ...e.discoveryRelays])], o = new K(r), [i, a, s] = await Promise.all([
    o.queryQuorum({ authors: [t], kinds: [ct] }),
    o.queryQuorum({ authors: [t], kinds: [je] }),
    o.queryQuorum({ authors: [t], kinds: [Dt] })
  ]);
  o.closeAll();
  const c = i.outcomes.some((v) => v.events.length > 0), l = a.outcomes.some((v) => v.events.length > 0), u = s.outcomes.some((v) => v.events.length > 0), y = new K(r);
  let w = null, f = null, g = null;
  const p = [];
  if (!c && (e.name || e.about || e.picture)) {
    const v = Ko(e.everydayPrivateKey, { name: e.name, about: e.about, picture: e.picture }, n);
    p.push(y.publishAll(v).then((h) => void (w = h)));
  }
  if (!l) {
    const v = Ro(e.everydayPrivateKey, e.generalRelays.map((h) => ({ url: h, read: !0, write: !0 })), n);
    p.push(y.publishAll(v).then((h) => void (f = h)));
  }
  if (!u) {
    const v = Ao(e.everydayPrivateKey, e.dmRelays, n);
    p.push(y.publishAll(v).then((h) => void (g = h)));
  }
  return await Promise.all(p), y.closeAll(), {
    profilePublished: w !== null && Ne(w) > 0,
    relayListAcknowledgedCount: f !== null ? Ne(f) : 0,
    dmRelayListAcknowledgedCount: g !== null ? Ne(g) : 0,
    profileSkippedExisting: c,
    relayListSkippedExisting: l,
    dmRelayListSkippedExisting: u
  };
}
async function ke(e, t, n) {
  const r = n.minAcks ?? 2, o = n.minReadbacks ?? 2, i = await e.publishAll(t, n.timeoutMs), a = Ne(i), c = (await e.queryQuorum({ kinds: [W], authors: [t.pubkey], "#d": [n.dTag], limit: 5 }, n.timeoutMs)).outcomes.filter((l) => l.events.some((u) => u.id === t.id)).length;
  return {
    acknowledgedCount: a,
    readbackVerifiedCount: c,
    success: a >= r && c >= o
  };
}
function xo(e) {
  const t = Xr(e);
  if (t === void 0)
    throw new Error("Value is not JSON-serializable for canonicalization.");
  return t;
}
function To(e) {
  return te(xo(e));
}
const it = [1024, 2048, 4096], we = 4;
function Io(e) {
  const t = we + e.length, n = it.find((i) => i >= t);
  if (n === void 0)
    throw new Error(`Payload of ${e.length} bytes exceeds the largest padding bucket (${it[it.length - 1]} bytes minus ${we}-byte length prefix).`);
  const r = new Uint8Array(n);
  return new DataView(r.buffer).setUint32(0, e.length, !1), r.set(e, we), r;
}
function Lo(e) {
  if (!it.includes(e.length))
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
function Jt() {
  const e = globalThis.crypto;
  if (!e || !e.subtle)
    throw new Error("WebCrypto SubtleCrypto is not available in this environment.");
  return e;
}
async function Bn(e) {
  if (e.length !== 32)
    throw new Error("AES-256-GCM key must be exactly 32 bytes.");
  return Jt().subtle.importKey("raw", e, "AES-GCM", !1, ["encrypt", "decrypt"]);
}
async function Wn(e, t, n) {
  const r = Qr(), o = await Bn(e), i = await Jt().subtle.encrypt({ name: "AES-GCM", iv: r, additionalData: n, tagLength: 128 }, o, t);
  return { nonce: r, ciphertext: new Uint8Array(i) };
}
async function $n(e, t, n, r) {
  const o = await Bn(e);
  try {
    const i = await Jt().subtle.decrypt({ name: "AES-GCM", iv: t, additionalData: r, tagLength: 128 }, o, n);
    return new Uint8Array(i);
  } catch {
    throw new Error("AES-256-GCM authentication failed: capsule is corrupted, tampered, or the wrong key was used.");
  }
}
function jn(e) {
  return te(`bitlogin|password-capsule|v1|${e}|30078|bitlogin:password:v1`);
}
function Fn(e) {
  return te(`bitlogin|recovery-capsule|v1|${e}|30078|bitlogin:recovery:v1`);
}
async function Yt(e, t, n) {
  const r = To(e), o = Io(r), i = await Wn(t, o, n);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    nonce: x(i.nonce),
    ciphertext: x(i.ciphertext)
  };
}
async function Xt(e, t, n) {
  if (e.version !== 1 || e.algorithm !== "aes-256-gcm")
    throw new Error(`Unsupported capsule envelope version/algorithm: ${e.version}/${e.algorithm}`);
  const r = ne(e.nonce), o = ne(e.ciphertext), i = await $n(t, r, o, n), a = Lo(i);
  return JSON.parse(ft(a));
}
class Qt extends Error {
  constructor(t) {
    super(t), this.name = "CapsuleValidationError";
  }
}
const Uo = 1e6, Mo = /^[0-9a-f]{64}$/u;
function A(e, t) {
  if (!e)
    throw new Qt(t);
}
function ut(e) {
  return typeof e == "string" && Mo.test(e);
}
function zn(e) {
  A(Array.isArray(e), "vault_relay_hints must be an array (§12.4.7).");
  for (const t of e)
    A(typeof t == "string", "Each relay hint must be a string (§12.4.7)."), A(Xe(t), `Relay URL must use secure WebSockets, except for an explicit loopback development endpoint (§12.4.7): ${t}`);
}
function Hn(e) {
  A(typeof e == "string", "account_id must be a string (§12.4.2).");
  let t;
  try {
    t = ne(e);
  } catch {
    throw new Qt("account_id is not valid base64url (§12.4.2).");
  }
  A(t.length === 16, "account_id must decode to exactly 128 bits (§12.4.2).");
}
function Gn(e, t) {
  A(typeof e == "string", "operational_private_key must be a string (§12.4.3).");
  const n = ne(e);
  A(n.length === 32, "operational_private_key must be exactly 32 bytes (§12.4.3)."), A(Vt(n), "operational_private_key is not a valid secp256k1 scalar (§12.4.3)."), A(ut(t), "operational_public_key must be lowercase 64-char hex (§12.4.4).");
  const r = k(n);
  A(r === t, "operational_public_key does not match the derived public key (§12.4.4).");
}
function dt(e, t) {
  A(typeof t == "string", `${e} must be a string (§CV5.2).`);
  let n;
  try {
    n = ne(t);
  } catch {
    throw new Qt(`${e} is not valid base64url (§CV5.2).`);
  }
  A(n.length === 32, `${e} must decode to exactly 32 bytes (§CV5.2).`);
}
function Oo(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (A(t !== void 0 && n !== void 0, "connection_vault_root and vault_sudo_key must appear together (§CV5.2)."), dt("connection_vault_root", t), dt("vault_sudo_key", n));
}
function Do(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (A(t !== void 0, "vault_sudo_key cannot appear without connection_vault_root (§CV5.2)."), dt("connection_vault_root", t), n !== void 0 && dt("vault_sudo_key", n));
}
function Jn(e, t) {
  A(Number.isInteger(e) && e >= 0 && e <= Uo, `${t} is out of supported bounds (§12.4.8).`);
}
function Vo(e) {
  A(e.schema === vt, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), Hn(e.account_id), Jn(e.generation, "generation"), Gn(e.operational_private_key, e.operational_public_key), A(ut(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex (§12.4.5)."), zn(e.vault_relay_hints), Do(e);
  const t = e.recovery_capsule_event;
  A(!!t && typeof t == "object", "recovery_capsule_event must be present (§12.4.6)."), A(V(t), "Embedded recovery_capsule_event has an invalid event id or signature (§12.4.6)."), A(t.pubkey === e.recovery_public_key, "Embedded recovery_capsule_event author does not match recovery_public_key (§12.4.5).");
}
function qo(e) {
  A(e.schema === pt, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), Hn(e.account_id), Jn(e.recovery_generation, "recovery_generation"), A(e.previous_recovery_event_id === null || ut(e.previous_recovery_event_id), "previous_recovery_event_id must be null or lowercase 64-char hex (§12.3)."), Gn(e.operational_private_key, e.operational_public_key), A(ut(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex."), zn(e.vault_relay_hints), Oo(e);
}
function Bo(e) {
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
async function Zt(e) {
  const t = k(e.locatorPrivateKey), n = await Yt(e.payload, e.capsuleKey, jn(t));
  return Z({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: W,
    tags: [["d", Ue]],
    content: JSON.stringify(n)
  }, e.locatorPrivateKey);
}
function Wo(e) {
  const t = k(e.oldLocatorPrivateKey);
  return Z({
    pubkey: t,
    created_at: e.createdAt,
    kind: W,
    tags: [["d", Ue]],
    content: ""
  }, e.oldLocatorPrivateKey);
}
async function $o(e, t) {
  if (!V(e))
    throw new Error("Credential capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await Xt(n, t, jn(e.pubkey));
  return Vo(r), r;
}
async function en(e) {
  const t = k(e.recoveryPrivateKey), n = await Yt(e.payload, e.capsuleKey, Fn(t));
  return Z({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: W,
    tags: [["d", Je]],
    content: JSON.stringify(n)
  }, e.recoveryPrivateKey);
}
async function Yn(e, t) {
  if (!V(e))
    throw new Error("Recovery capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await Xt(n, t, Fn(e.pubkey));
  return qo(r), r;
}
function pn(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  for (const o of e)
    o.pubkey === t && o.kind === W && Me(o, "d") === n && V(o) && r.set(o.id, o);
  return [...r.values()].sort((o, i) => i.created_at - o.created_at);
}
async function Xn(e, t, n, r, o) {
  const i = await e.queryQuorum({ kinds: [W], authors: [t], "#d": [n], limit: 5 }, o), a = i.outcomes.flatMap((w) => w.events), s = pn(a, t, n), c = [];
  for (const w of s)
    try {
      const f = await r(w);
      c.push({ event: w, payload: f });
    } catch (f) {
      c.push({ event: w, payload: null, error: f.message });
    }
  const l = c.find((w) => w.payload !== null) ?? null, u = i.outcomes.map((w) => ({
    responded: w.responded,
    events: pn(w.events, t, n)
  })).filter((w) => w.responded && w.events.length > 0).map((w) => w.events[0].id), y = new Set(u).size > 1;
  return {
    quorumMet: i.quorumMet,
    respondedCount: i.respondedCount,
    totalCount: i.totalCount,
    candidates: c,
    best: l,
    relayDisagreement: y
  };
}
async function He(e, t, n, r = 8e3) {
  return Xn(e, t, Ue, (o) => $o(o, n), r);
}
async function Qn(e, t, n, r = 8e3) {
  return Xn(e, t, Je, (o) => Yn(o, n), r);
}
function jo(e) {
  const t = e.filter((n) => n.payload !== null);
  return t.length < 2 ? { consistent: !0 } : Bo(t.map((n) => ({
    eventId: n.event.id,
    recoveryGeneration: n.payload.recovery_generation,
    previousRecoveryEventId: n.payload.previous_recovery_event_id
  })));
}
async function vn(e) {
  const t = [...new Set(e.relayUrls)], n = async (s) => {
    const c = new K(t);
    try {
      const l = await c.publishAll(s, e.timeoutMs);
      return new Map(l.map((u) => [
        u.relayUrl,
        { ok: u.result.ok, message: u.result.message ?? "" }
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
function Fo(e) {
  const t = Me(e, "d");
  if (e.kind !== W || t === void 0 || !V(e))
    throw new Error("This session's capsule event is not a valid capsule.");
  return { pubkey: e.pubkey, dTag: t };
}
function zo(e, t, n) {
  const r = e.filter((i) => i.pubkey === n.pubkey && i.kind === W && Me(i, "d") === n.dTag && V(i));
  return r.some((i) => i.id === t.id) ? "current" : r.length === 0 ? "missing" : Math.max(...r.map((i) => i.created_at)) >= t.created_at ? "newer" : "older";
}
async function wn(e, t, n) {
  const r = Fo(t), o = new K(e);
  try {
    const i = await o.queryQuorum({
      kinds: [W],
      authors: [r.pubkey],
      "#d": [r.dTag],
      limit: 5
    }, n);
    return new Map(i.outcomes.map((a) => [
      a.relayUrl,
      a.responded ? { status: zo(a.events, t, r) } : { status: "unreachable", error: a.error }
    ]));
  } finally {
    o.closeAll();
  }
}
async function Ho(e) {
  const t = [...new Set(e.relayUrls)], [n, r] = await Promise.all([
    wn(t, e.credentialEvent, e.timeoutMs),
    wn(t, e.recoveryEvent, e.timeoutMs)
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
const Zn = `abandon
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
function Go(e, t, n, r) {
  to(e);
  const o = no({ dkLen: 32, asyncTick: 10 }, r), { c: i, dkLen: a, asyncTick: s } = o;
  if (mt(i), mt(a), mt(s), i < 1)
    throw new Error("iterations (c) should be >= 1");
  const c = hn(t), l = hn(n), u = new Uint8Array(a), y = qt.create(e, c), w = y._cloneInto().update(l);
  return { c: i, dkLen: a, asyncTick: s, DK: u, PRF: y, PRFSalt: w };
}
function Jo(e, t, n, r, o) {
  return e.destroy(), t.destroy(), r && r.destroy(), ro(o), n;
}
async function Yo(e, t, n, r) {
  const { c: o, dkLen: i, asyncTick: a, DK: s, PRF: c, PRFSalt: l } = Go(e, t, n, r);
  let u;
  const y = new Uint8Array(4), w = Zr(y), f = new Uint8Array(c.outputLen);
  for (let g = 1, p = 0; p < i; g++, p += c.outputLen) {
    const v = s.subarray(p, p + c.outputLen);
    w.setInt32(0, g, !1), (u = l._cloneInto(u)).update(y).digestInto(f), v.set(f.subarray(0, v.length)), await eo(o - 1, a, () => {
      c._cloneInto(u).update(f).digestInto(f);
      for (let h = 0; h < v.length; h++)
        v[h] ^= f[h];
    });
  }
  return Jo(c, l, s, u, f);
}
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const Xo = (e) => e[0] === "あいこくしん";
function er(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function tr(e) {
  const t = er(e), n = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(n.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: n };
}
function nr(e) {
  io(e, 16, 20, 24, 28, 32);
}
const Qo = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([Bt(e)[0] >> t << t]);
};
function rr(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), Ze.chain(Ze.checksum(1, Qo), Ze.radix2(11, !0), Ze.alphabet(e));
}
function Zo(e, t) {
  const { words: n } = tr(e), r = rr(t).decode(n);
  return nr(r), r;
}
function ei(e, t) {
  return nr(e), rr(t).encode(e).join(Xo(t) ? "　" : " ");
}
function ti(e, t) {
  try {
    Zo(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const ni = (e) => er("mnemonic" + e);
function ri(e, t = "") {
  return Yo(oo, tr(e).nfkd, ni(t), { c: 2048, dkLen: 64 });
}
function oi(e) {
  if (e.length !== 16)
    throw new Error("Recovery phrase entropy must be exactly 128 bits (16 bytes).");
  return ei(e, Zn);
}
function or(e) {
  try {
    return ti(ir(e), Zn);
  } catch {
    return !1;
  }
}
function ir(e) {
  return e.trim().normalize("NFKD").split(/\s+/u).join(" ");
}
async function tn(e) {
  return ri(ir(e), "");
}
const nn = ao.id, xe = "aes-256-gcm-v1", Te = "bitlogin-bip39-hkdf-v1", ar = "bitlogin-recovery-hkdf-v1", ii = 4, ai = 64;
function Ie(e) {
  return [...new Set(e)].filter((t) => t.length <= ai).slice(0, ii);
}
function Le(e) {
  return e ? { everyday_derivation: ar } : {};
}
function sr(e) {
  return e.protocol?.everyday_derivation === ar;
}
async function cr(e) {
  const t = wt(e.loginName), n = e.now ?? Math.floor(Date.now() / 1e3), { locatorPrivateKey: r, capsuleKey: o } = await Fe(e.password, t);
  try {
    const i = k(r), a = new K(e.vaultRelayUrls, {
      authPrivateKey: r
    });
    let s;
    try {
      s = await He(a, i, o, e.timeoutMs);
    } finally {
      a.closeAll();
    }
    if (!s.quorumMet)
      throw new de("Couldn't verify this login name and password aren't already registered. Please retry, or add more vault relays.");
    if (s.candidates.length > 0)
      throw new Dn();
    const c = e.everydayPrivateKey !== void 0;
    if (c && !Vt(e.everydayPrivateKey))
      throw new de("The provided key is not a valid secp256k1 private key.");
    const l = oi(co()), u = await tn(l);
    let y, w, f;
    try {
      ({ recoveryPrivateKey: y, capsuleKey: w } = $t(u)), f = c ? e.everydayPrivateKey : jt(u);
    } finally {
      E(u);
    }
    const g = !c, p = ee(32), v = ee(32);
    let h = !1;
    try {
      const b = k(y), m = k(f), P = x(Ln()), U = {
        schema: pt,
        account_id: P,
        recovery_generation: 0,
        previous_recovery_event_id: null,
        operational_private_key: x(f),
        operational_public_key: m,
        recovery_public_key: b,
        connection_vault_root: x(p),
        vault_sudo_key: x(v),
        created_at: n,
        vault_relay_hints: Ie(e.vaultRelayUrls),
        protocol: {
          capsule_encryption: xe,
          recovery_derivation: Te,
          ...Le(g)
        }
      }, R = await en({
        recoveryPrivateKey: y,
        capsuleKey: w,
        payload: U
      }), N = new K(e.vaultRelayUrls, {
        authPrivateKey: y
      });
      let S;
      try {
        S = await ke(N, R, {
          dTag: Je,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        N.closeAll();
      }
      if (!S.success)
        throw new de("The recovery capsule did not reach the required relay acknowledgement and readback quorum. No login credential was published. Please retry, or add more vault relays.");
      const T = {
        schema: vt,
        account_id: P,
        generation: 0,
        operational_private_key: x(f),
        operational_public_key: m,
        recovery_public_key: b,
        recovery_capsule_event: R,
        connection_vault_root: x(p),
        created_at: n,
        vault_relay_hints: Ie(e.vaultRelayUrls),
        protocol: {
          password_kdf: nn,
          capsule_encryption: xe,
          recovery_derivation: Te,
          ...Le(g)
        }
      }, M = await Zt({
        locatorPrivateKey: r,
        capsuleKey: o,
        payload: T
      }), O = new K(e.vaultRelayUrls, {
        authPrivateKey: r
      });
      let I;
      try {
        I = await ke(O, M, {
          dTag: Ue,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        O.closeAll();
      }
      if (!I.success)
        throw new de("Registration did not reach the required credential acknowledgement and readback quorum. Please retry, or add more vault relays.");
      return h = !0, {
        normalizedLoginName: t,
        recoveryPhrase: l,
        everydayPrivateKey: f,
        everydayPublicKey: m,
        recoveryPublicKey: b,
        locatorPublicKey: i,
        accountId: P,
        imported: c,
        everydayKeyDerived: g,
        connectionVaultRoot: p,
        vaultSudoKey: v,
        credentialEvent: M,
        recoveryEvent: R,
        credentialPublish: I,
        recoveryPublish: S
      };
    } finally {
      E(y, w), h || (c || E(f), E(p, v));
    }
  } finally {
    E(r, o);
  }
}
async function si(e) {
  const { nsecOrHex: t, ...n } = e, r = lr(t);
  return cr({ ...n, everydayPrivateKey: r });
}
function lr(e) {
  const t = e.trim();
  let n;
  if (t.startsWith("nsec1"))
    n = so(t);
  else if (/^[0-9a-fA-F]{64}$/u.test(t))
    n = Wt(t.toLowerCase());
  else
    throw new de("Enter a valid nsec (nsec1…) or a 64-character hex private key.");
  if (!Vt(n))
    throw new de("The provided key is not a valid secp256k1 private key.");
  return n;
}
class ur {
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
async function ci(e) {
  const t = wt(e.loginName), { locatorPrivateKey: n, capsuleKey: r } = await Fe(e.password, t), o = k(n), i = new K(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  try {
    const a = await He(i, o, r, e.timeoutMs);
    if (!a.quorumMet)
      throw new _e("quorum-not-met");
    if (!a.best)
      throw new _e(a.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
    const s = a.best.payload, c = e.store ?? new ur(), l = await Ht(c, s.operational_public_key), u = s.generation < l.generation;
    if (u && !e.acknowledgeRollback)
      throw new Vn(l.generation, s.generation);
    const y = u ? `This device previously saw credential generation ${l.generation}, but the accepted capsule is generation ${s.generation}. Relays may be serving stale data, or an old capsule is being replayed.` : void 0;
    await qn(c, s.operational_public_key, {
      generation: s.generation
    });
    const w = a.relayDisagreement ? 'Configured relays returned different credential capsules as "latest" for this account. Some relays may be stale, censored, or malicious.' : void 0;
    return {
      everydayPrivateKey: ne(s.operational_private_key),
      everydayPublicKey: s.operational_public_key,
      recoveryPublicKey: s.recovery_public_key,
      accountId: s.account_id,
      generation: s.generation,
      everydayKeyDerived: sr(s),
      credentialEvent: a.best.event,
      recoveryCapsuleEvent: s.recovery_capsule_event,
      connectionVaultRoot: s.connection_vault_root ? ne(s.connection_vault_root) : void 0,
      rollbackWarning: y,
      relayDisagreementWarning: w
    };
  } finally {
    i.closeAll();
  }
}
function gn(e) {
  return e.filter((t) => V(t)).sort((t, n) => n.created_at - t.created_at)[0];
}
async function li(e) {
  if (!or(e.phrase))
    throw new ye("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await tn(e.phrase), { recoveryPrivateKey: n, capsuleKey: r } = $t(t), o = jt(t), i = k(o);
  E(t, o);
  const a = k(n), s = new K(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  let c;
  try {
    c = await Qn(s, a, r, e.timeoutMs);
  } finally {
    s.closeAll();
  }
  if (e.offlineRecoveryCapsuleEvents?.length) {
    const p = [];
    for (const m of e.offlineRecoveryCapsuleEvents)
      if (V(m))
        try {
          p.push({
            event: m,
            payload: await Yn(m, r)
          });
        } catch (P) {
          p.push({
            event: m,
            payload: null,
            error: P.message
          });
        }
    const v = /* @__PURE__ */ new Map();
    for (const m of [...c.candidates, ...p])
      v.set(m.event.id, m);
    const h = [...v.values()].sort((m, P) => P.event.created_at - m.event.created_at), b = h.find((m) => m.payload !== null) ?? null;
    c = {
      ...c,
      candidates: h,
      best: b,
      quorumMet: c.quorumMet || b !== null
    };
  }
  if (!c.quorumMet)
    throw new _e("quorum-not-met");
  if (!c.best)
    throw new _e(c.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const l = c.best.payload, u = jo(c.candidates), y = ne(l.operational_private_key), w = l.operational_public_key, { generalRelays: f, dmRelays: g } = await dr(w, [...e.discoveryRelayUrls, ...l.vault_relay_hints], e.timeoutMs);
  return {
    everydayPrivateKey: y,
    everydayPublicKey: w,
    recoveryPrivateKey: n,
    recoveryPublicKey: a,
    recoveryCapsuleKey: r,
    accountId: l.account_id,
    currentRecoveryEvent: c.best.event,
    currentRecoveryPayload: l,
    generalRelays: f,
    dmRelays: g,
    chainWarning: u.consistent ? void 0 : u.warning,
    everydayKeyDerived: w === i
  };
}
async function dr(e, t, n) {
  const r = new K([...new Set(t)]);
  let o = [], i = [];
  try {
    const a = await r.queryQuorum({ kinds: [je], authors: [e], limit: 5 }, n), s = gn(a.outcomes.flatMap((u) => u.events));
    s && (o = So(s));
    const c = await r.queryQuorum({ kinds: [Dt], authors: [e], limit: 5 }, n), l = gn(c.outcomes.flatMap((u) => u.events));
    l && (i = No(l));
  } finally {
    r.closeAll();
  }
  return { generalRelays: o, dmRelays: i };
}
async function yr(e) {
  if (!or(e))
    throw new ye("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await tn(e);
  try {
    const { recoveryPrivateKey: n, capsuleKey: r } = $t(t), o = jt(t);
    return {
      recoveryPrivateKey: n,
      recoveryPublicKey: k(n),
      capsuleKey: r,
      everydayPrivateKey: o,
      everydayPublicKey: k(o)
    };
  } finally {
    E(t);
  }
}
async function hr(e, t, n) {
  const r = new K(t, {
    authPrivateKey: e.recoveryPrivateKey
  });
  let o;
  try {
    o = await Qn(r, e.recoveryPublicKey, e.capsuleKey, n);
  } finally {
    r.closeAll();
  }
  if (!o.quorumMet)
    throw new _e("quorum-not-met");
  if (o.best)
    throw new ye("This account's recovery capsule is still on the relays. Use normal recovery instead of a rebuild.");
  return o.candidates.length > 0 ? Math.max(...o.candidates.map((i) => i.event.created_at)) : null;
}
async function ui(e) {
  const t = await yr(e.phrase);
  try {
    await hr(t, e.vaultRelayUrls, e.timeoutMs);
    const n = new K([
      .../* @__PURE__ */ new Set([...e.discoveryRelayUrls, ...e.vaultRelayUrls])
    ]);
    try {
      const o = (await n.queryQuorum({
        kinds: [ct, je],
        authors: [t.everydayPublicKey],
        limit: 10
      }, e.timeoutMs)).outcomes.flatMap((i) => i.events).filter((i) => i.pubkey === t.everydayPublicKey && V(i));
      return {
        everydayPublicKey: t.everydayPublicKey,
        profileFound: o.some((i) => i.kind === ct),
        relayListFound: o.some((i) => i.kind === je)
      };
    } finally {
      n.closeAll();
    }
  } finally {
    E(t.recoveryPrivateKey, t.capsuleKey, t.everydayPrivateKey);
  }
}
async function di(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = await yr(e.phrase);
  let r = !1;
  try {
    const o = await hr(n, e.vaultRelayUrls, e.timeoutMs), i = {
      schema: pt,
      account_id: x(Ln()),
      recovery_generation: 0,
      previous_recovery_event_id: null,
      operational_private_key: x(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      connection_vault_root: x(ee(32)),
      vault_sudo_key: x(ee(32)),
      created_at: o === null ? t : ze(o, t),
      vault_relay_hints: Ie(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: xe,
        recovery_derivation: Te,
        ...Le(!0)
      }
    }, a = await en({
      recoveryPrivateKey: n.recoveryPrivateKey,
      capsuleKey: n.capsuleKey,
      payload: i
    }), s = new K(e.vaultRelayUrls, {
      authPrivateKey: n.recoveryPrivateKey
    });
    let c;
    try {
      c = await ke(s, a, {
        dTag: Je,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      s.closeAll();
    }
    if (!c.success)
      throw new ye("Could not publish the rebuilt recovery capsule to enough relays. Nothing else was changed; please retry.");
    const { generalRelays: l, dmRelays: u } = await dr(n.everydayPublicKey, [...e.discoveryRelayUrls, ...e.vaultRelayUrls], e.timeoutMs);
    return r = !0, {
      everydayPrivateKey: n.everydayPrivateKey,
      everydayPublicKey: n.everydayPublicKey,
      recoveryPrivateKey: n.recoveryPrivateKey,
      recoveryPublicKey: n.recoveryPublicKey,
      recoveryCapsuleKey: n.capsuleKey,
      accountId: i.account_id,
      currentRecoveryEvent: a,
      currentRecoveryPayload: i,
      generalRelays: l,
      dmRelays: u,
      everydayKeyDerived: !0
    };
  } finally {
    r || E(n.recoveryPrivateKey, n.capsuleKey, n.everydayPrivateKey);
  }
}
async function yi(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = wt(e.newLoginName), { recovered: r } = e, o = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root,
    vault_sudo_key: r.currentRecoveryPayload.vault_sudo_key
  } : {}, i = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
    connection_vault_root: r.currentRecoveryPayload.connection_vault_root
  } : {}, { locatorPrivateKey: a, capsuleKey: s } = await Fe(e.newPassword, n);
  try {
    const c = k(a), l = new K(e.vaultRelayUrls, {
      authPrivateKey: a
    });
    let u;
    try {
      u = await He(l, c, s, e.timeoutMs);
    } finally {
      l.closeAll();
    }
    if (!u.quorumMet)
      throw new ye("Couldn't verify the new login name and password aren't already registered. Please retry, or add more vault relays.");
    const y = u.best?.payload ?? null, w = y !== null && y.account_id === r.accountId && y.operational_public_key === r.everydayPublicKey && y.recovery_public_key === r.recoveryPublicKey && y.generation === 0 && y.recovery_capsule_event.id === r.currentRecoveryEvent.id;
    if (u.candidates.length > 0 && !w)
      throw new ye("Another account is already registered with that login name and password. Pick a different one.");
    const f = r.currentRecoveryPayload.recovery_generation + 1, g = {
      schema: pt,
      account_id: r.accountId,
      recovery_generation: f,
      previous_recovery_event_id: r.currentRecoveryEvent.id,
      operational_private_key: x(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      ...o,
      created_at: ze(r.currentRecoveryEvent.created_at, t),
      vault_relay_hints: Ie(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: xe,
        recovery_derivation: Te,
        ...Le(r.everydayKeyDerived)
      }
    }, p = await en({
      recoveryPrivateKey: r.recoveryPrivateKey,
      capsuleKey: r.recoveryCapsuleKey,
      payload: g
    }), v = new K(e.vaultRelayUrls, {
      authPrivateKey: r.recoveryPrivateKey
    });
    let h;
    try {
      h = await ke(v, p, {
        dTag: Je,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      v.closeAll();
    }
    if (!h.success)
      throw new ye("Could not publish the refreshed recovery capsule to enough relays. No new credential was published; please retry.");
    r.currentRecoveryEvent = p, r.currentRecoveryPayload = g;
    const b = {
      schema: vt,
      account_id: r.accountId,
      generation: 0,
      operational_private_key: x(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      recovery_capsule_event: p,
      ...i,
      // A retry may be repairing a credential that reached only one relay.
      // It must replace that partial event deterministically on every relay.
      created_at: u.best ? ze(u.best.event.created_at, t) : t,
      vault_relay_hints: Ie(e.vaultRelayUrls),
      protocol: {
        password_kdf: nn,
        capsule_encryption: xe,
        recovery_derivation: Te,
        ...Le(r.everydayKeyDerived)
      }
    }, m = await Zt({
      locatorPrivateKey: a,
      capsuleKey: s,
      payload: b
    }), P = new K(e.vaultRelayUrls, {
      authPrivateKey: a
    });
    let U;
    try {
      U = await ke(P, m, {
        dTag: Ue,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      P.closeAll();
    }
    if (!U.success)
      throw new ye("Could not publish the new credential capsule to enough relays. Please retry.");
    return e.store && await vo(e.store, r.everydayPublicKey, {
      generation: 0,
      recoveryGeneration: f
    }), {
      normalizedLoginName: n,
      locatorPublicKey: c,
      credentialEvent: m,
      refreshedRecoveryEvent: p,
      credentialPublish: U,
      recoveryPublish: h
    };
  } finally {
    E(a, s);
  }
}
function fr(e) {
  const t = k(e.privateKey);
  return Z({
    pubkey: t,
    created_at: e.createdAt,
    kind: lo,
    tags: [
      ["e", e.eventIdToDelete],
      ["k", String(e.deletedEventKind)]
    ],
    content: e.reason ?? ""
  }, e.privateKey);
}
async function hi(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = wt(e.loginName), r = await Fe(e.oldPassword, n), o = k(r.locatorPrivateKey), i = new K(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  });
  let a;
  try {
    a = await He(i, o, r.capsuleKey, e.timeoutMs);
  } finally {
    i.closeAll();
  }
  if (!a.quorumMet)
    throw new _e("quorum-not-met");
  if (!a.best)
    throw new _e(a.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
  const s = a.best.payload, c = a.best.event, l = e.store ?? new ur(), u = await Ht(l, s.operational_public_key);
  if (s.generation < u.generation && !e.acknowledgeRollback)
    throw new Vn(u.generation, s.generation);
  const y = await Fe(e.newPassword, n), w = k(y.locatorPrivateKey), f = new K(e.vaultRelayUrls, {
    authPrivateKey: y.locatorPrivateKey
  });
  let g;
  try {
    g = await He(f, w, y.capsuleKey, e.timeoutMs);
  } finally {
    f.closeAll();
  }
  if (!g.quorumMet)
    throw new de("Couldn't verify the new password isn't already registered under this login name. Please retry, or add more vault relays.");
  if (g.candidates.length > 0)
    throw new Dn("Another account is already registered with this login name and the new password you chose. Pick a different new password.");
  const p = s.generation + 1, v = {
    schema: vt,
    account_id: s.account_id,
    generation: p,
    operational_private_key: s.operational_private_key,
    operational_public_key: s.operational_public_key,
    recovery_public_key: s.recovery_public_key,
    recovery_capsule_event: s.recovery_capsule_event,
    // Carry only the session root. A legacy credential may contain the sudo
    // key, but rotation deliberately scrubs it; personal-tier access remains
    // phrase-gated through the recovery capsule.
    ...s.connection_vault_root !== void 0 ? { connection_vault_root: s.connection_vault_root } : {},
    created_at: t,
    vault_relay_hints: Ie(e.vaultRelayUrls),
    protocol: {
      password_kdf: nn,
      capsule_encryption: xe,
      recovery_derivation: Te,
      ...Le(sr(s))
    }
  }, h = await Zt({
    locatorPrivateKey: y.locatorPrivateKey,
    capsuleKey: y.capsuleKey,
    payload: v
  }), b = new K(e.vaultRelayUrls, {
    authPrivateKey: y.locatorPrivateKey
  }), m = await ke(b, h, {
    dTag: Ue,
    minAcks: e.minAcknowledgements,
    timeoutMs: e.timeoutMs
  });
  if (b.closeAll(), !m.success)
    throw new de("The new credential capsule did not reach the required relay acknowledgement and readback quorum. Your existing password still works; nothing was changed. Please retry.");
  const P = Wo({
    oldLocatorPrivateKey: r.locatorPrivateKey,
    createdAt: ze(c.created_at, t)
  }), U = fr({
    privateKey: r.locatorPrivateKey,
    eventIdToDelete: c.id,
    deletedEventKind: W,
    createdAt: t
  }), R = new K(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  }), [N, S] = await Promise.all([
    R.publishAll(P, e.timeoutMs),
    R.publishAll(U, e.timeoutMs)
  ]);
  return R.closeAll(), await qn(l, s.operational_public_key, {
    generation: p
  }), {
    normalizedLoginName: n,
    oldLocatorPublicKey: o,
    newLocatorPublicKey: w,
    newGeneration: p,
    recoveryPublicKey: s.recovery_public_key,
    recoveryCapsuleEvent: s.recovery_capsule_event,
    newCredentialEvent: h,
    tombstoneEvent: P,
    deletionRequestEvent: U,
    newCredentialPublish: m,
    tombstoneAcknowledgedCount: Ne(N),
    deletionAcknowledgedCount: Ne(S)
  };
}
const fi = "bitlogin/connection-vault-root/v1", pi = "bitlogin/connection-vault-signing/v1", vi = "bitlogin/connection-record-encryption/v1", wi = "bitlogin/connection-vault-personal/v1", At = "bitlogin:connection:";
function gi(e) {
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Ft(Un(fi), e);
}
function De(e) {
  return uo(e, pi).scalar;
}
function pr(e) {
  const t = De(e);
  try {
    return k(t);
  } finally {
    E(t);
  }
}
function bi(e, t) {
  if (t.length !== 32)
    throw new Error("vault_sudo_key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Ft(Un(wi), Oe(e, t));
}
function vr(e, t) {
  const n = gt(t);
  return Ye(e, Oe(te(vi), new Uint8Array([0]), n), 32);
}
function mi() {
  return x(ee(16));
}
function gt(e) {
  const t = ne(e);
  if (t.length !== 16)
    throw new Error("connection_id must decode to exactly 16 bytes (§CV7).");
  return t;
}
function wr(e) {
  return gt(e), `${At}${e}`;
}
function gr(e) {
  if (!e.startsWith(At))
    return null;
  const t = e.slice(At.length);
  try {
    return gt(t), t;
  } catch {
    return null;
  }
}
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function _i(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
function bn(e) {
  if (typeof e != "boolean")
    throw new TypeError(`boolean expected, not ${e}`);
}
function _t(e) {
  if (typeof e != "number")
    throw new TypeError("number expected, got " + typeof e);
  if (!Number.isSafeInteger(e) || e < 0)
    throw new RangeError("positive integer expected, got " + e);
}
function q(e, t, n = "") {
  const r = _i(e), o = e?.length, i = t !== void 0;
  if (!r || i && o !== t) {
    const a = n && `"${n}" `, s = i ? ` of length ${t}` : "", c = r ? `length=${o}` : `type=${typeof e}`, l = a + "expected Uint8Array" + s + ", got " + c;
    throw r ? new RangeError(l) : new TypeError(l);
  }
  return e;
}
function L(e) {
  return new Uint32Array(e.buffer, e.byteOffset, Math.floor(e.byteLength / 4));
}
function Ee(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
const re = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68, ki = (e) => e << 24 & 4278190080 | e << 8 & 16711680 | e >>> 8 & 65280 | e >>> 24 & 255, Ei = (e) => {
  for (let t = 0; t < e.length; t++)
    e[t] = ki(e[t]);
  return e;
}, B = re ? (e) => e : Ei;
function Pi(e, t) {
  return !e.byteLength || !t.byteLength ? !1 : e.buffer === t.buffer && // best we can do, may fail with an obscure Proxy
  e.byteOffset < t.byteOffset + t.byteLength && // a starts before b end
  t.byteOffset < e.byteOffset + e.byteLength;
}
function br(e, t) {
  if (Pi(e, t) && e.byteOffset < t.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function Ki(e, t) {
  if (t == null || typeof t != "object")
    throw new Error("options must be defined");
  return Object.assign(e, t);
}
const Ri = /* @__NO_SIDE_EFFECTS__ */ (e, t) => {
  function n(r, ...o) {
    if (q(r, void 0, "key"), e.nonceLength !== void 0) {
      const u = o[0];
      q(u, e.varSizeNonce ? void 0 : e.nonceLength, "nonce");
    }
    const i = e.tagLength;
    i && o[1] !== void 0 && q(o[1], void 0, "AAD");
    const a = t(r, ...o), s = (u, y) => {
      if (y !== void 0) {
        if (u !== 2)
          throw new Error("cipher output not supported");
        q(y, void 0, "output");
      }
    };
    let c = !1;
    return {
      encrypt(u, y) {
        if (c)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return c = !0, q(u), s(a.encrypt.length, y), a.encrypt(u, y);
      },
      decrypt(u, y) {
        if (q(u), i && u.length < i)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + i);
        return s(a.decrypt.length, y), a.decrypt(u, y);
      }
    };
  }
  return Object.assign(n, e), n;
};
function rn(e, t, n = !0) {
  if (t === void 0)
    return new Uint8Array(e);
  if (q(t, void 0, "output"), t.length !== e)
    throw new Error('"output" expected Uint8Array of length ' + e + ", got: " + t.length);
  if (n && !ce(t))
    throw new Error("invalid output, must be aligned");
  return t;
}
function ce(e) {
  return e.byteOffset % 4 === 0;
}
function be(e) {
  return Uint8Array.from(q(e));
}
const mr = (e) => Uint8Array.from(e.split(""), (t) => t.charCodeAt(0)), Ai = B(L(mr("expand 16-byte k"))), Si = B(L(mr("expand 32-byte k")));
function _(e, t) {
  return e << t | e >>> 32 - t;
}
const Ve = 64, Ni = 16, St = 2 ** 32 - 1, mn = /* @__PURE__ */ Uint32Array.of();
function Ci(e, t, n, r, o, i, a, s) {
  const c = o.length, l = new Uint8Array(Ve), u = L(l), y = re && ce(o) && ce(i), w = y ? L(o) : mn, f = y ? L(i) : mn;
  if (!re) {
    for (let g = 0; g < c; a++) {
      if (e(t, n, r, u, a, s), B(u), a >= St)
        throw new Error("arx: counter overflow");
      const p = Math.min(Ve, c - g);
      for (let v = 0, h; v < p; v++)
        h = g + v, i[h] = o[h] ^ l[v];
      g += p;
    }
    return;
  }
  for (let g = 0; g < c; a++) {
    if (e(t, n, r, u, a, s), a >= St)
      throw new Error("arx: counter overflow");
    const p = Math.min(Ve, c - g);
    if (y && p === Ve) {
      const v = g / 4;
      if (g % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let h = 0, b; h < Ni; h++)
        b = v + h, f[b] = w[b] ^ u[h];
      g += Ve;
      continue;
    }
    for (let v = 0, h; v < p; v++)
      h = g + v, i[h] = o[h] ^ l[v];
    g += p;
  }
}
function xi(e, t) {
  const { allowShortKeys: n, extendNonceFn: r, counterLength: o, counterRight: i, rounds: a } = Ki({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, t);
  if (typeof e != "function")
    throw new Error("core must be a function");
  return _t(o), _t(a), bn(i), bn(n), (s, c, l, u, y = 0) => {
    q(s, void 0, "key"), q(c, void 0, "nonce"), q(l, void 0, "data");
    const w = l.length;
    if (u = rn(w, u, !1), _t(y), y < 0 || y >= St)
      throw new Error("arx: counter overflow");
    const f = [];
    let g = s.length, p, v;
    if (g === 32)
      f.push(p = be(s)), v = Si;
    else if (g === 16 && n)
      p = new Uint8Array(32), p.set(s), p.set(s, 16), v = Ai, f.push(p);
    else
      throw q(s, 32, "arx key"), new Error("invalid key size");
    (!re || !ce(c)) && f.push(c = be(c));
    let h = L(p);
    if (r) {
      if (c.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const P = c.subarray(0, 16);
      if (re)
        r(v, h, L(P), h);
      else {
        const U = B(Uint32Array.from(v));
        r(U, h, L(P), h), Ee(U), B(h);
      }
      c = c.subarray(16);
    } else re || B(h);
    const b = 16 - o;
    if (b !== c.length)
      throw new Error(`arx: nonce must be ${b} or 16 bytes`);
    if (b !== 12) {
      const P = new Uint8Array(12);
      P.set(c, i ? 0 : 12 - c.length), c = P, f.push(c);
    }
    const m = B(L(c));
    try {
      return Ci(e, v, h, m, l, u, y, a), u;
    } finally {
      Ee(...f);
    }
  };
}
function Ti(e, t, n, r, o, i = 20) {
  let a = e[0], s = e[1], c = e[2], l = e[3], u = t[0], y = t[1], w = t[2], f = t[3], g = t[4], p = t[5], v = t[6], h = t[7], b = o, m = n[0], P = n[1], U = n[2], R = a, N = s, S = c, T = l, M = u, O = y, I = w, j = f, F = g, z = p, H = v, G = h, J = b, Y = m, X = P, Q = U;
  for (let yn = 0; yn < i; yn += 2)
    R = R + M | 0, J = _(J ^ R, 16), F = F + J | 0, M = _(M ^ F, 12), R = R + M | 0, J = _(J ^ R, 8), F = F + J | 0, M = _(M ^ F, 7), N = N + O | 0, Y = _(Y ^ N, 16), z = z + Y | 0, O = _(O ^ z, 12), N = N + O | 0, Y = _(Y ^ N, 8), z = z + Y | 0, O = _(O ^ z, 7), S = S + I | 0, X = _(X ^ S, 16), H = H + X | 0, I = _(I ^ H, 12), S = S + I | 0, X = _(X ^ S, 8), H = H + X | 0, I = _(I ^ H, 7), T = T + j | 0, Q = _(Q ^ T, 16), G = G + Q | 0, j = _(j ^ G, 12), T = T + j | 0, Q = _(Q ^ T, 8), G = G + Q | 0, j = _(j ^ G, 7), R = R + O | 0, Q = _(Q ^ R, 16), H = H + Q | 0, O = _(O ^ H, 12), R = R + O | 0, Q = _(Q ^ R, 8), H = H + Q | 0, O = _(O ^ H, 7), N = N + I | 0, J = _(J ^ N, 16), G = G + J | 0, I = _(I ^ G, 12), N = N + I | 0, J = _(J ^ N, 8), G = G + J | 0, I = _(I ^ G, 7), S = S + j | 0, Y = _(Y ^ S, 16), F = F + Y | 0, j = _(j ^ F, 12), S = S + j | 0, Y = _(Y ^ S, 8), F = F + Y | 0, j = _(j ^ F, 7), T = T + M | 0, X = _(X ^ T, 16), z = z + X | 0, M = _(M ^ z, 12), T = T + M | 0, X = _(X ^ T, 8), z = z + X | 0, M = _(M ^ z, 7);
  let D = 0;
  r[D++] = a + R | 0, r[D++] = s + N | 0, r[D++] = c + S | 0, r[D++] = l + T | 0, r[D++] = u + M | 0, r[D++] = y + O | 0, r[D++] = w + I | 0, r[D++] = f + j | 0, r[D++] = g + F | 0, r[D++] = p + z | 0, r[D++] = v + H | 0, r[D++] = h + G | 0, r[D++] = b + J | 0, r[D++] = m + Y | 0, r[D++] = P + X | 0, r[D++] = U + Q | 0;
}
const _r = /* @__PURE__ */ xi(Ti, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
}), kr = 2, Nt = 1, Er = 65536, Ii = 4294967295, Li = 132, Ui = 99, Ct = 1024 * 1024;
function yt(e, t) {
  const n = Oe(new Uint8Array([2]), Wt(t)), o = Mn.getSharedSecret(e, n, !0).slice(1, 33);
  return Ft(te("nip44-v2"), o);
}
function Pr(e, t) {
  if (e.length !== 32)
    throw new Error("NIP-44 conversation key must be exactly 32 bytes.");
  if (t.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const n = Ye(e, t, 76);
  return {
    chachaKey: n.slice(0, 32),
    chachaNonce: n.slice(32, 44),
    hmacKey: n.slice(44, 76)
  };
}
function on(e) {
  if (e <= 32)
    return 32;
  const t = 2 ** Math.floor(Math.log2(e - 1) + 1), n = t <= 256 ? 32 : t / 8;
  return n * (Math.floor((e - 1) / n) + 1);
}
const Kr = 39 + on(Ct) + 32, Mi = Math.ceil(Kr / 3) * 4;
function Oi(e) {
  if (e < Er) {
    const n = new Uint8Array(2);
    return new DataView(n.buffer).setUint16(0, e, !1), n;
  }
  const t = new Uint8Array(6);
  return new DataView(t.buffer).setUint32(2, e, !1), t;
}
function Di(e) {
  const t = e.length;
  if (t < Nt || t > Ct)
    throw new Error(`NIP-44 plaintext length must be between ${Nt} and ${Ct} bytes on this platform.`);
  const n = Oi(t), r = on(t), o = new Uint8Array(n.length + r);
  return o.set(n, 0), o.set(e, n.length), o;
}
function Vi(e) {
  const t = new DataView(e.buffer, e.byteOffset, e.byteLength), n = t.getUint16(0, !1);
  let r, o;
  if (n === 0) {
    if (r = t.getUint32(2, !1), o = 6, r < Er)
      throw new Error("NIP-44 payload has inconsistent padding.");
  } else
    r = n, o = 2;
  if (r < Nt || r > Ii || e.length !== o + on(r))
    throw new Error("NIP-44 payload has inconsistent padding.");
  return e.slice(o, o + r);
}
function Rr(e, t, n) {
  return qt(Bt, e, Oe(t, n));
}
function xt(e, t) {
  return qi(e, t, ee(32));
}
function qi(e, t, n) {
  if (n.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const { chachaKey: r, chachaNonce: o, hmacKey: i } = Pr(e, n), a = Di(te(t)), s = _r(r, o, a), c = Rr(i, n, s);
  return Ce.encode(Oe(new Uint8Array([kr]), n, s, c));
}
function an(e, t) {
  if (t.startsWith("#"))
    throw new Error("Unsupported NIP-44 non-base64 encoding.");
  if (t.length < Li || t.length > Mi)
    throw new Error("NIP-44 payload size is outside this platform's supported range.");
  const n = Ce.decode(t);
  if (n.length < Ui || n.length > Kr)
    throw new Error("NIP-44 decoded payload size is outside this platform's supported range.");
  if (n[0] !== kr)
    throw new Error(`Unsupported NIP-44 version: ${n[0]}`);
  const r = n.slice(1, 33);
  if (r.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const o = n.slice(n.length - 32), i = n.slice(33, n.length - 32), { chachaKey: a, chachaNonce: s, hmacKey: c } = Pr(e, r), l = Rr(c, r, i);
  if (!yo(o, l))
    throw new Error("NIP-44 MAC verification failed: payload is corrupted, tampered, or uses the wrong key.");
  const u = _r(a, s, i);
  return ft(Vi(u));
}
const pe = 16, Bi = 283;
function Wi(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function sn(e) {
  return e << 1 ^ Bi & -(e >> 7);
}
function Se(e, t) {
  let n = 0;
  for (; t > 0; t >>= 1)
    n ^= e & -(t & 1), e = sn(e);
  return n;
}
const Tt = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let n = 0, r = 1; n < 256; n++, r ^= sn(r))
    e[n] = r;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let n = 0; n < 255; n++) {
    let r = e[255 - n];
    r |= r << 8, t[e[n]] = (r ^ r >> 4 ^ r >> 5 ^ r >> 6 ^ r >> 7 ^ 99) & 255;
  }
  return Ee(e), t;
})(), $i = /* @__PURE__ */ Tt.map((e, t) => Tt.indexOf(t)), ji = (e) => e << 24 | e >>> 8, kt = (e) => e << 8 | e >>> 24;
function Ar(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const n = new Uint32Array(256).map((l, u) => t(e[u])), r = n.map(kt), o = r.map(kt), i = o.map(kt), a = new Uint32Array(256 * 256), s = new Uint32Array(256 * 256), c = new Uint16Array(256 * 256);
  for (let l = 0; l < 256; l++)
    for (let u = 0; u < 256; u++) {
      const y = l * 256 + u;
      a[y] = n[l] ^ r[u], s[y] = o[l] ^ i[u], c[y] = e[l] << 8 | e[u];
    }
  return { sbox: e, sbox2: c, T0: n, T1: r, T2: o, T3: i, T01: a, T23: s };
}
const cn = /* @__PURE__ */ Ar(Tt, (e) => Se(e, 3) << 24 | e << 16 | e << 8 | Se(e, 2)), Sr = /* @__PURE__ */ Ar($i, (e) => Se(e, 11) << 24 | Se(e, 13) << 16 | Se(e, 9) << 8 | Se(e, 14)), Fi = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, n = 1; t < 16; t++, n = sn(n))
    e[t] = n;
  return e;
})();
function Nr(e) {
  q(e);
  const t = e.length;
  Wi(e);
  const { sbox2: n } = cn, r = [];
  (!re || !ce(e)) && r.push(e = be(e));
  const o = B(L(e)), i = o.length, a = (c) => ae(n, c, c, c, c), s = new Uint32Array(t + 28);
  s.set(o);
  for (let c = i; c < s.length; c++) {
    let l = s[c - 1];
    c % i === 0 ? l = a(ji(l)) ^ Fi[c / i - 1] : i > 6 && c % i === 4 && (l = a(l)), s[c] = s[c - i] ^ l;
  }
  return Ee(...r), s;
}
function zi(e) {
  const t = Nr(e), n = t.slice(), r = t.length, { sbox2: o } = cn, { T0: i, T1: a, T2: s, T3: c } = Sr;
  for (let l = 0; l < r; l += 4)
    for (let u = 0; u < 4; u++)
      n[l + u] = t[r - l - 4 + u];
  Ee(t);
  for (let l = 4; l < r - 4; l++) {
    const u = n[l], y = ae(o, u, u, u, u);
    n[l] = i[y & 255] ^ a[y >>> 8 & 255] ^ s[y >>> 16 & 255] ^ c[y >>> 24];
  }
  return n;
}
function he(e, t, n, r, o, i) {
  return e[n << 8 & 65280 | r >>> 8 & 255] ^ t[o >>> 8 & 65280 | i >>> 24 & 255];
}
function ae(e, t, n, r, o) {
  return e[t & 255 | n & 65280] | e[r >>> 16 & 255 | o >>> 16 & 65280] << 16;
}
function _n(e, t, n, r, o) {
  const { sbox2: i, T01: a, T23: s } = cn;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const l = e.length / 4 - 2;
  for (let g = 0; g < l; g++) {
    const p = e[c++] ^ he(a, s, t, n, r, o), v = e[c++] ^ he(a, s, n, r, o, t), h = e[c++] ^ he(a, s, r, o, t, n), b = e[c++] ^ he(a, s, o, t, n, r);
    t = p, n = v, r = h, o = b;
  }
  const u = e[c++] ^ ae(i, t, n, r, o), y = e[c++] ^ ae(i, n, r, o, t), w = e[c++] ^ ae(i, r, o, t, n), f = e[c++] ^ ae(i, o, t, n, r);
  return { s0: u, s1: y, s2: w, s3: f };
}
function Hi(e, t, n, r, o) {
  const { sbox2: i, T01: a, T23: s } = Sr;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const l = e.length / 4 - 2;
  for (let g = 0; g < l; g++) {
    const p = e[c++] ^ he(a, s, t, o, r, n), v = e[c++] ^ he(a, s, n, t, o, r), h = e[c++] ^ he(a, s, r, n, t, o), b = e[c++] ^ he(a, s, o, r, n, t);
    t = p, n = v, r = h, o = b;
  }
  const u = e[c++] ^ ae(i, t, o, r, n), y = e[c++] ^ ae(i, n, t, o, r), w = e[c++] ^ ae(i, r, n, t, o), f = e[c++] ^ ae(i, o, r, n, t);
  return { s0: u, s1: y, s2: w, s3: f };
}
function Gi(e) {
  if (q(e), e.length % pe !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + pe);
}
function Ji(e, t, n) {
  q(e);
  let r = e.length;
  const o = r % pe;
  if (!t && o !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (t) {
    let s = pe - o;
    s || (s = pe), r = r + s;
  }
  n = rn(r, n), br(e, n), (!re || !ce(e)) && (e = be(e));
  const i = L(e);
  B(i);
  const a = L(n);
  return { b: i, o: a, out: n };
}
function Yi(e, t) {
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
function Xi(e) {
  const t = new Uint8Array(16), n = L(t);
  t.set(e);
  const r = pe - e.length;
  for (let o = pe - r; o < pe; o++)
    t[o] = r;
  return n;
}
const Cr = /* @__PURE__ */ Ri({ blockSize: 16, nonceLength: 16 }, function(t, n, r = {}) {
  const o = !r.disablePadding;
  return {
    encrypt(i, a) {
      const s = Nr(t), { b: c, o: l, out: u } = Ji(i, o, a);
      let y = n;
      const w = [s];
      (!re || !ce(y)) && w.push(y = be(y));
      const f = L(y);
      B(f);
      let g = f[0], p = f[1], v = f[2], h = f[3], b = 0;
      for (; b + 4 <= c.length; )
        g ^= c[b + 0], p ^= c[b + 1], v ^= c[b + 2], h ^= c[b + 3], { s0: g, s1: p, s2: v, s3: h } = _n(s, g, p, v, h), l[b++] = g, l[b++] = p, l[b++] = v, l[b++] = h;
      if (o) {
        const m = Xi(i.subarray(b * 4));
        B(m), g ^= m[0], p ^= m[1], v ^= m[2], h ^= m[3], { s0: g, s1: p, s2: v, s3: h } = _n(s, g, p, v, h), l[b++] = g, l[b++] = p, l[b++] = v, l[b++] = h;
      }
      return B(l), Ee(...w), u;
    },
    decrypt(i, a) {
      Gi(i);
      const s = zi(t);
      let c = n;
      const l = [s];
      (!re || !ce(c)) && l.push(c = be(c));
      const u = L(c);
      B(u), a = rn(i.length, a), br(i, a), (!re || !ce(i)) && l.push(i = be(i));
      const y = L(i), w = L(a);
      B(y);
      let f = u[0], g = u[1], p = u[2], v = u[3];
      for (let h = 0; h + 4 <= y.length; ) {
        const b = f, m = g, P = p, U = v;
        f = y[h + 0], g = y[h + 1], p = y[h + 2], v = y[h + 3];
        const { s0: R, s1: N, s2: S, s3: T } = Hi(s, f, g, p, v);
        w[h++] = R ^ b, w[h++] = N ^ m, w[h++] = S ^ P, w[h++] = T ^ U;
      }
      return B(w), Ee(...l), Yi(a, o);
    }
  };
});
function xr(e, t) {
  const n = Oe(new Uint8Array([2]), Wt(t));
  return Mn.getSharedSecret(e, n, !0).slice(1, 33);
}
function Qi(e, t, n) {
  return Zi(e, t, n, ee(16));
}
function Zi(e, t, n, r) {
  if (r.length !== 16)
    throw new Error("NIP-04 iv must be exactly 16 bytes.");
  const o = xr(e, t), i = Cr(o, r).encrypt(te(n));
  return `${Ce.encode(i)}?iv=${Ce.encode(r)}`;
}
function ea(e, t, n) {
  const r = n.indexOf("?iv=");
  if (r === -1)
    throw new Error('NIP-04 payload is missing its "?iv=" suffix.');
  const o = Ce.decode(n.slice(0, r)), i = Ce.decode(n.slice(r + 4)), a = xr(e, t), s = Cr(a, i).decrypt(o);
  return ft(s);
}
class ge {
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
    return this.assertAlive(), Z({
      pubkey: this.publicKeyHex,
      created_at: t.created_at ?? Math.floor(Date.now() / 1e3),
      kind: t.kind,
      tags: t.tags ?? [],
      content: t.content
    }, this.privateKey);
  }
  nip44Encrypt(t, n) {
    return this.assertAlive(), xt(yt(this.privateKey, t), n);
  }
  nip44Decrypt(t, n) {
    return this.assertAlive(), an(yt(this.privateKey, t), n);
  }
  /** Legacy relative to nip44Encrypt above, but still what a real NIP-07 extension exposes as
   * window.nostr.nip04.encrypt -- implemented for drop-in parity. */
  nip04Encrypt(t, n) {
    return this.assertAlive(), Qi(this.privateKey, t, n);
  }
  nip04Decrypt(t, n) {
    return this.assertAlive(), ea(this.privateKey, t, n);
  }
  /** Best-practical secret wipe (§11.10, §21.4): overwrites the private key buffer in place. */
  destroy() {
    E(this.privateKey), this.destroyed = !0;
  }
}
const Qe = null, Tr = [
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
], Ir = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  // Added 2026-11-18: relay.nostr.band timed out and nostr-pub.wellorder.net
  // never connected in the same measurement, leaving two working lookups.
  "wss://nos.lol"
], ta = [], na = /^[0-9a-f]{64}$/u, ra = 64;
function Et(e) {
  return Array.isArray(e) && e.length <= ra && e.every((t) => typeof t == "string" && Xe(t)) && new Set(e).size === e.length;
}
function bt(e, t = Qe, n = -1) {
  if (!t || !na.test(t) || /^0{64}$/u.test(t) || !V(e) || e.pubkey !== t || e.kind !== W || Me(e, "d") !== On)
    return null;
  try {
    const r = JSON.parse(e.content);
    if (typeof r != "object" || r === null || Array.isArray(r))
      return null;
    const o = r;
    return !Number.isSafeInteger(o.version) || o.version < 1 || o.version <= n || !Et(o.vaultRelays) || !Et(o.discoveryRelays) || o.deprecated !== void 0 && !Et(o.deprecated) ? null : {
      version: o.version,
      vaultRelays: o.vaultRelays,
      discoveryRelays: o.discoveryRelays,
      ...o.deprecated === void 0 ? {} : { deprecated: o.deprecated }
    };
  } catch {
    return null;
  }
}
function oa(e) {
  return Math.max(0, e - 1);
}
function kn(e, t, n) {
  const r = t ? n === "vault" ? t.vaultRelays : t.discoveryRelays : [], o = new Set(t?.deprecated ?? []), i = new Set(e), a = [...new Set(r)].filter((s) => !o.has(s) && !i.has(s)).slice(0, oa(e.length));
  return [...e, ...a];
}
async function ia(e, t = Qe, n = -1, r = 6e3) {
  if (!t || e.length === 0)
    return null;
  const o = new K([...e]);
  let i;
  try {
    i = (await o.queryQuorum({ kinds: [W], authors: [t], "#d": [On], limit: 3 }, r)).outcomes.flatMap((c) => c.events);
  } finally {
    o.closeAll();
  }
  let a = null;
  for (const s of i) {
    const c = bt(s, t, n);
    c && (!a || c.version > a.list.version) && (a = { event: s, list: c });
  }
  return a;
}
const Lr = "bitlogin:bootstrap-relays:v1";
async function Ur(e, t = Qe) {
  if (!t)
    return null;
  try {
    const n = await e.get(Lr);
    return n ? bt(JSON.parse(n), t) : null;
  } catch {
    return null;
  }
}
function at(e) {
  return {
    vaultRelays: kn(Tr, e, "vault"),
    discoveryRelays: kn(Ir, e, "discovery"),
    listVersion: e?.version ?? null
  };
}
async function aa(e, t = {}) {
  const n = t.maintainerPubkeyHex === void 0 ? Qe : t.maintainerPubkeyHex, r = await Ur(e, n);
  if (!n)
    return at(null);
  const o = at(r), i = r?.version ?? -1;
  try {
    let a = await ia(t.queryRelayUrls ?? [.../* @__PURE__ */ new Set([...o.vaultRelays, ...o.discoveryRelays])], n, i, t.timeoutMs);
    if (!a) {
      const s = await sa(t.httpsFallbackUrls ?? ta, n, i), c = s ? bt(s, n, i) : null;
      s && c && (a = { event: s, list: c });
    }
    return a ? (await e.set(Lr, JSON.stringify(a.event)), at(a.list)) : o;
  } catch {
    return o;
  }
}
async function sa(e, t = Qe, n = -1) {
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
      if (V(s) && bt(s, t, n))
        return s;
    } catch {
    }
  return null;
}
const ln = /^[0-9a-f]{64}$/u, ca = 8, la = 4096, ua = 256, da = 512;
class Pe extends Error {
  name = "BunkerUriParseError";
}
class ya extends Error {
  name = "Nip46RequestTimeoutError";
  constructor(t, n) {
    super(`The remote signer did not answer ${t} within ${Math.round(n / 1e3)}s. It may be offline, or waiting for your approval on another device -- check your signer and try again.`);
  }
}
class ha extends Error {
  name = "Nip46ErrorResponse";
}
function fa(e) {
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return null;
  }
  const n = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol === "https:" || t.protocol === "http:" && n ? t.toString() : null;
}
function pa(e) {
  if (e.length > la)
    throw new Pe("That bunker URI is unreasonably long.");
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    throw new Pe("That doesn't look like a valid URI.");
  }
  if (t.protocol !== "bunker:")
    throw new Pe("A remote-signer URI must start with bunker://");
  const n = (t.host || t.pathname.replace(/^\/+/u, "")).toLowerCase();
  if (!ln.test(n))
    throw new Pe("The bunker URI does not name a valid signer public key.");
  const r = [
    ...new Set(t.searchParams.getAll("relay").map((i) => i.trim()).filter((i) => i.length > 0 && i.length <= da))
  ].slice(0, ca);
  if (r.length === 0)
    throw new Pe("The bunker URI names no relays -- without at least one relay= parameter there is no way to reach the signer.");
  const o = t.searchParams.get("secret") ?? void 0;
  if (o && o.length > ua)
    throw new Pe("The bunker URI's secret is unreasonably long.");
  return { signerPubkey: n, relayUrls: r, secret: o || void 0 };
}
function va(e) {
  if (!ln.test(e.clientPubkey))
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
const wa = 12e4;
class En {
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
    this.clientSecretKey = t.clientSecretKey, this.clientPubkey = k(t.clientSecretKey), this.pointer = t.pointer, this.conversationKey = yt(t.clientSecretKey, t.pointer.signerPubkey), this.onAuthUrl = t.onAuthUrl, this.requestTimeoutMs = t.requestTimeoutMs ?? wa, this.conns = t.pointer.relayUrls.map((n) => new Gt(n, { authPrivateKey: t.clientSecretKey }));
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
        kinds: [rt],
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
      n = JSON.parse(an(this.conversationKey, t.content));
    } catch {
      return;
    }
    if (typeof n.id != "string")
      return;
    const r = this.pending.get(n.id);
    if (r) {
      if (n.result === "auth_url") {
        if (!r.authUrlSeen && typeof n.error == "string" && n.error) {
          const o = fa(n.error);
          o && (r.authUrlSeen = !0, this.onAuthUrl?.(o));
        }
        return;
      }
      if (this.pending.delete(n.id), clearTimeout(r.timer), typeof n.error == "string" && n.error) {
        r.reject(new ha(n.error));
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
    const r = $e(ee(8)), o = xt(this.conversationKey, JSON.stringify({ id: r, method: t, params: n })), i = [["p", this.pointer.signerPubkey]], a = Z({
      pubkey: this.clientPubkey,
      created_at: Math.floor(Date.now() / 1e3),
      kind: rt,
      tags: i,
      content: o
    }, this.clientSecretKey), s = new Promise((u, y) => {
      const w = setTimeout(() => {
        this.pending.delete(r), y(new ya(t, this.requestTimeoutMs));
      }, this.requestTimeoutMs);
      this.pending.set(r, { resolve: u, reject: y, timer: w, authUrlSeen: !1 });
    });
    if (s.catch(() => {
    }), !(await Promise.allSettled(this.conns.map((u) => u.publish(a)))).some((u) => u.status === "fulfilled" && u.value.ok)) {
      const u = this.pending.get(r);
      throw u && (this.pending.delete(r), clearTimeout(u.timer)), new Error("No relay accepted the request to the signer.");
    }
    return s;
  }
  /** bunker:// flow: announce ourselves; any non-error answer is acceptance. */
  async connect() {
    await this.rpc("connect", [this.pointer.signerPubkey, this.pointer.secret ?? ""]);
  }
  async getUserPublicKey() {
    const t = (await this.rpc("get_public_key", [])).trim().toLowerCase();
    if (!ln.test(t))
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
    if (!V(o))
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
      const t = $e(ee(8)), n = xt(this.conversationKey, JSON.stringify({ id: t, method: "logout", params: [] }));
      return Z({
        pubkey: this.clientPubkey,
        created_at: Math.floor(Date.now() / 1e3),
        kind: rt,
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
    this.pending.clear(), E(this.clientSecretKey), E(this.conversationKey);
  }
}
async function ga(e) {
  const t = k(e.clientSecretKey), n = e.timeoutMs, r = e.relayUrls.map((i) => new Gt(i, { authPrivateKey: e.clientSecretKey })), o = () => {
    for (const i of r)
      i.close();
  };
  return new Promise((i, a) => {
    let s = !1;
    const c = () => l(new Error("The signer-connection attempt was cancelled.")), l = (f) => {
      s || (s = !0, clearTimeout(u), e.signal?.removeEventListener("abort", c), o(), f instanceof Error ? a(f) : i(f));
    }, u = setTimeout(() => l(new Error(`No signer connected within ${Math.round(n / 1e3)}s. Scan or paste the connection code in your signer app, then try again.`)), n);
    if (e.signal?.aborted) {
      c();
      return;
    }
    e.signal?.addEventListener("abort", c, { once: !0 });
    const y = { kinds: [rt], "#p": [t] }, w = (f) => {
      let g, p = null;
      try {
        p = yt(e.clientSecretKey, f.pubkey), g = JSON.parse(an(p, f.content));
      } catch {
        return;
      } finally {
        p && E(p);
      }
      g.result === e.secret && l({ signerPubkey: f.pubkey });
    };
    Promise.allSettled(r.map((f) => f.subscribeLive(y, w))).then((f) => {
      f.some((g) => g.status === "fulfilled") || l(new Error("Could not reach any relay to listen for the signer."));
    });
  });
}
const Mr = "bitlogin.connection.v1", Or = "bitlogin.connection.nwc.v1", Pn = 120, ba = /* @__PURE__ */ new Set(["active", "suspended", "deleted"]), ma = /* @__PURE__ */ new Set(["connectable", "personal"]);
class Ke extends Error {
  constructor(t) {
    super(t), this.name = "ConnectionRecordError";
  }
}
function Dr(e, t) {
  return te(`bitlogin|connection-record|v1|${e}|30078|${t}`);
}
function Vr(e) {
  const t = e, n = (i) => {
    throw new Ke(i);
  };
  (!t || typeof t != "object") && n("Connection record must be an object."), t.schema !== Mr && n("Unsupported connection record schema (§CV8.3)."), typeof t.connection_id != "string" && n("connection_id must be a string (§CV7)."), (typeof t.connection_type != "string" || t.connection_type.length === 0) && n("connection_type must be a non-empty string (§CV8.3)."), ma.has(t.tier) || n("tier must be connectable or personal."), ba.has(t.state) || n("state must be active, suspended, or deleted (§CV8.3)."), (typeof t.label != "string" || t.label.length > Pn) && n(`label must be a string of at most ${Pn} characters.`), (!Number.isInteger(t.created_at) || !Number.isInteger(t.updated_at)) && n("created_at and updated_at must be integers (§CV8.3).");
  const r = t.credential;
  (!r || typeof r != "object" || typeof r.schema != "string") && n("credential must be an object naming its profile schema (§CV8.3).");
  const o = t.application_binding;
  (!o || typeof o != "object" || o.origin !== null && typeof o.origin != "string" || o.app_pubkey !== null && typeof o.app_pubkey != "string") && n("application_binding must carry origin and app_pubkey (string or null)."), t.notes !== null && typeof t.notes != "string" && n("notes must be a string or null.");
}
async function Pt(e) {
  Vr(e.record);
  const t = De(e.vaultPrk), n = k(t), r = wr(e.record.connection_id), o = vr(e.recordPrk, e.record.connection_id), i = await Yt(e.record, o, Dr(n, r));
  return Z({
    pubkey: n,
    created_at: ze(e.previousCreatedAt, e.now),
    kind: W,
    tags: [["d", r]],
    content: JSON.stringify(i)
  }, t);
}
async function _a(e, t, n) {
  if (!V(e))
    throw new Ke("Connection record event has an invalid id or signature.");
  const r = k(De(t));
  if (e.pubkey !== r)
    throw new Ke("Connection record event is not signed by this vault's identity.");
  const o = Me(e, "d") ?? "", i = gr(o);
  if (i === null)
    throw new Ke("Connection record event has a malformed d tag.");
  const a = JSON.parse(e.content), s = Dr(e.pubkey, o), c = [
    { prk: t, tier: "connectable" },
    ...n ? [{ prk: n, tier: "personal" }] : []
  ];
  for (const l of c) {
    let u;
    try {
      u = await Xt(a, vr(l.prk, i), s);
    } catch {
      continue;
    }
    if (Vr(u), u.connection_id !== i)
      throw new Ke("Connection record id does not match its d tag.");
    if (u.tier !== l.tier)
      throw new Ke("Connection record tier does not match the key that decrypted it.");
    return { record: u, tier: l.tier, event: e };
  }
  return null;
}
function ka(e, t) {
  return {
    ...e,
    state: "deleted",
    credential: { schema: e.credential.schema },
    notes: null,
    updated_at: t
  };
}
const ht = /^[0-9a-f]{64}$/u;
class le extends Error {
  constructor(t) {
    super(t), this.name = "NwcParseError";
  }
}
function Kn(e) {
  const t = e.trim();
  if (!/^nostr\+walletconnect:\/\//iu.test(t))
    throw new le("Not an NWC URI: it must start with nostr+walletconnect://");
  let n;
  try {
    n = new URL(t.replace(/^nostr\+walletconnect:\/\//iu, "http://"));
  } catch {
    throw new le("The NWC URI is malformed.");
  }
  const r = n.hostname.toLowerCase();
  if (!ht.test(r))
    throw new le("The NWC URI's wallet service pubkey is not 64-char hex.");
  const o = [], i = [];
  let a = null, s = null;
  for (const [c, l] of n.searchParams.entries())
    if (c === "relay") {
      if (!Xe(l))
        throw new le("An NWC relay must use secure WebSockets, except for an explicit loopback development endpoint.");
      o.push(l);
    } else if (c === "secret") {
      const u = l.toLowerCase();
      if (!ht.test(u))
        throw new le("The NWC URI's secret is not a 64-char hex client key.");
      a = u;
    } else c === "lud16" ? s = l : i.push([c, l]);
  if (o.length === 0)
    throw new le("The NWC URI names no relay.");
  if (a === null)
    throw new le("The NWC URI carries no secret.");
  return {
    schema: Or,
    wallet_pubkey: r,
    relays: o,
    secret: a,
    lud16: s,
    extra_params: i
  };
}
function Ea(e) {
  qr(e);
  const t = new URLSearchParams();
  for (const n of e.relays)
    t.append("relay", n);
  t.append("secret", e.secret), e.lud16 !== null && t.append("lud16", e.lud16);
  for (const [n, r] of e.extra_params)
    t.append(n, r);
  return `nostr+walletconnect://${e.wallet_pubkey}?${t.toString()}`;
}
function Pa(e, t) {
  return e.wallet_pubkey === t.wallet_pubkey && e.secret === t.secret;
}
function qr(e) {
  const t = e, n = (r) => {
    throw new le(r);
  };
  (!t || typeof t != "object") && n("NWC credential must be an object."), t.schema !== Or && n("NWC credential has the wrong schema."), (typeof t.wallet_pubkey != "string" || !ht.test(t.wallet_pubkey)) && n("NWC credential wallet_pubkey must be 64-char lowercase hex."), (!Array.isArray(t.relays) || t.relays.length === 0 || t.relays.some((r) => typeof r != "string")) && n("NWC credential must name at least one relay."), t.relays.some((r) => !Xe(r)) && n("NWC relays must use secure WebSockets, except for explicit loopback development endpoints."), (typeof t.secret != "string" || !ht.test(t.secret)) && n("NWC credential secret must be 64-char lowercase hex."), t.lud16 !== null && typeof t.lud16 != "string" && n("NWC credential lud16 must be a string or null."), (!Array.isArray(t.extra_params) || t.extra_params.some((r) => !Array.isArray(r) || r.length !== 2 || typeof r[0] != "string" || typeof r[1] != "string")) && n("NWC credential extra_params must be [key, value] string pairs.");
}
const Ka = "bitlogin:vault-hwm:v2:", Ra = "bitlogin/vault-hwm-index/v2", Br = "bitlogin/vault-hwm-encryption/v2", Aa = /^[0-9a-f]{64}$/u;
class fe extends Error {
  constructor() {
    super("The local Connection Vault rollback marker is invalid or has been tampered with."), this.name = "RecordHighWaterMarkError";
  }
}
function un(e) {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return Number.isInteger(t.createdAt) && (t.createdAt ?? -1) >= 0 && typeof t.eventId == "string" && Aa.test(t.eventId);
}
function Wr(e, t) {
  gt(t);
  const n = Ye(e, Ra, 32), r = te(t);
  try {
    return `${Ka}${x(qt(Bt, n, r))}`;
  } finally {
    E(n, r);
  }
}
function Sa(e, t) {
  return `bitlogin:vault-hwm:${pr(e)}:${t}`;
}
async function Na(e, t, n) {
  const r = Ye(e, Br, 32), o = te(JSON.stringify(n)), i = te(t);
  try {
    const a = await Wn(r, o, i), s = {
      v: 2,
      nonce: x(a.nonce),
      ciphertext: x(a.ciphertext)
    };
    return JSON.stringify(s);
  } finally {
    E(r, o, i);
  }
}
async function Ca(e, t, n) {
  const r = Ye(e, Br, 32), o = te(t);
  let i;
  try {
    const a = JSON.parse(n);
    if (a.v !== 2 || typeof a.nonce != "string" || typeof a.ciphertext != "string")
      throw new fe();
    i = await $n(r, ne(a.nonce), ne(a.ciphertext), o);
    const s = JSON.parse(ft(i));
    if (!un(s))
      throw new fe();
    return s;
  } catch (a) {
    throw a instanceof fe ? a : new fe();
  } finally {
    E(r, o), i && E(i);
  }
}
async function $r(e, t, n, r) {
  const o = Wr(t, n);
  await e.set(o, await Na(t, o, r));
}
async function jr(e, t, n) {
  const r = Wr(t, n), o = await e.get(r);
  if (o !== void 0)
    return Ca(t, r, o);
  const i = Sa(t, n), a = await e.get(i);
  if (a === void 0)
    return null;
  try {
    const s = JSON.parse(a);
    if (!un(s))
      throw new fe();
    return await $r(e, t, n, s), await e.delete(i), s;
  } catch (s) {
    throw s instanceof fe ? s : new fe();
  }
}
async function Fr(e, t, n, r) {
  if (!un(r))
    throw new fe();
  const o = await jr(e, t, n);
  o && Rt({ created_at: r.createdAt, id: r.eventId }, { created_at: o.createdAt, id: o.eventId }) <= 0 || await $r(e, t, n, r);
}
async function xa(e) {
  const t = De(e.vaultPrk), n = new K(e.relayUrls, { authPrivateKey: t });
  let r;
  try {
    r = await ke(n, e.event, {
      dTag: wr(e.connectionId),
      minAcks: e.minAcknowledgements,
      // The readback bar follows the ack bar: a caller publishing to fewer
      // relays (a targeted repair, a test) has already lowered its quorum.
      minReadbacks: e.minAcknowledgements,
      timeoutMs: e.timeoutMs
    });
  } finally {
    n.closeAll(), E(t);
  }
  return r.success && await Fr(e.store, e.vaultPrk, e.connectionId, {
    createdAt: e.event.created_at,
    eventId: e.event.id
  }), r;
}
const Rn = 500;
async function Ta(e) {
  const t = De(e.vaultPrk), n = k(t), r = new K(e.relayUrls, { authPrivateKey: t });
  let o;
  try {
    o = await r.queryQuorum({ kinds: [W], authors: [n], limit: Rn }, e.timeoutMs);
  } finally {
    r.closeAll(), E(t);
  }
  const i = o.outcomes.some((l) => l.events.length >= Rn), a = /* @__PURE__ */ new Map();
  for (const l of o.outcomes.flatMap((u) => u.events)) {
    if (!V(l) || l.pubkey !== n)
      continue;
    const u = gr(Me(l, "d") ?? "");
    if (u === null)
      continue;
    const y = a.get(u);
    (!y || Rt(l, y) > 0) && a.set(u, l);
  }
  const s = /* @__PURE__ */ new Map(), c = [];
  for (const [l, u] of a) {
    const y = await jr(e.store, e.vaultPrk, l);
    if (y !== null && Rt(u, {
      created_at: y.createdAt,
      id: y.eventId
    }) < 0) {
      c.push(l);
      continue;
    }
    s.set(l, u), await Fr(e.store, e.vaultPrk, l, {
      createdAt: u.created_at,
      eventId: u.id
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
class Ia {
  vaultPrk;
  personalPrk = null;
  destroyed = !1;
  connectionVaultRoot;
  vaultPublicKey;
  constructor(t) {
    this.connectionVaultRoot = t.slice(), this.vaultPrk = gi(this.connectionVaultRoot), this.vaultPublicKey = pr(this.vaultPrk);
  }
  get sudoActive() {
    return this.personalPrk !== null;
  }
  /** Opens a sudo window. Consumes (wipes) the caller's sudo key copy. */
  enableSudo(t) {
    this.endSudo(), this.personalPrk = bi(this.connectionVaultRoot, t), E(t);
  }
  /** Closes the sudo window and wipes the personal-tier key material. */
  endSudo() {
    this.personalPrk && E(this.personalPrk), this.personalPrk = null;
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
    this.endSudo(), E(this.vaultPrk, this.connectionVaultRoot), this.destroyed = !0;
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
      schema: Mr,
      connection_id: mi(),
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
    }, o = await Pt({
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
    }, a = await Pt({
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
    const r = n ?? Math.floor(Date.now() / 1e3), o = ka(t.record, r), i = await Pt({
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
    return this.destroyed ? Promise.reject(new Error("This vault session was destroyed; create a new one from the account's root.")) : _a(t, this.vaultPrk, this.personalPrk ?? void 0);
  }
  /** §CV11 step 3: a NIP-09 deletion request for a replaced record event,
   *  signed by the vault identity. Best-effort by contract — the encrypted
   *  tombstone is the durable part of a deletion, this is the courtesy ask. */
  buildDeletionRequest(t, n) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    return fr({
      privateKey: De(this.vaultPrk),
      eventIdToDelete: t,
      deletedEventKind: W,
      createdAt: n ?? Math.floor(Date.now() / 1e3)
    });
  }
  publish(t) {
    return xa({ vaultPrk: this.vaultPrk, ...t });
  }
  fetchEvents(t) {
    return Ta({ vaultPrk: this.vaultPrk, ...t });
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
const La = "bitlogin", ue = "kv", ie = "device-keys", Ua = 2;
function Ma() {
  return new Promise((e, t) => {
    const n = indexedDB.open(La, Ua);
    n.onupgradeneeded = () => {
      const r = n.result;
      r.objectStoreNames.contains(ue) || r.createObjectStore(ue), r.objectStoreNames.contains(ie) || r.createObjectStore(ie);
    }, n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
  });
}
class Oa {
  dbPromise = null;
  db() {
    return this.dbPromise || (this.dbPromise = Ma()), this.dbPromise;
  }
  async get(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const a = n.transaction(ue, "readonly").objectStore(ue).get(t);
      a.onsuccess = () => r(a.result), a.onerror = () => o(a.error);
    });
  }
  async set(t, n) {
    const r = await this.db();
    return new Promise((o, i) => {
      const a = r.transaction(ue, "readwrite");
      a.objectStore(ue).put(n, t), a.oncomplete = () => o(), a.onerror = () => i(a.error);
    });
  }
  async delete(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const i = n.transaction(ue, "readwrite");
      i.objectStore(ue).delete(t), i.oncomplete = () => r(), i.onerror = () => o(i.error);
    });
  }
  /**
   * Returns a non-extractable AES-GCM key kept by the browser's IndexedDB
   * implementation. The key is deliberately separate from the string-only KV
   * API so callers cannot accidentally serialize it as application data.
   */
  async getOrCreateDeviceKey(t) {
    const n = await this.db(), r = await new Promise((i, a) => {
      const s = n.transaction(ie, "readonly").objectStore(ie).get(t);
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
        const s = n.transaction(ie, "readwrite");
        s.objectStore(ie).add(o, t), s.oncomplete = () => i(), s.onerror = () => a(s.error);
      }), o;
    } catch {
      const i = await new Promise((a, s) => {
        const c = n.transaction(ie, "readonly").objectStore(ie).get(t);
        c.onsuccess = () => a(c.result), c.onerror = () => s(c.error);
      });
      if (i) return i;
      throw new Error("Unable to create the browser-bound session key.");
    }
  }
  async deleteDeviceKey(t) {
    const n = await this.db();
    return new Promise((r, o) => {
      const i = n.transaction(ie, "readwrite");
      i.objectStore(ie).delete(t), i.oncomplete = () => r(), i.onerror = () => o(i.error);
    });
  }
}
const Ge = "bitlogin:session:v1", dn = "bitlogin:session-device-key:v1";
function An(e) {
  let t = "";
  for (const n of e) t += String.fromCharCode(n);
  return btoa(t);
}
function Sn(e) {
  const t = atob(e);
  return Uint8Array.from(t, (n) => n.charCodeAt(0));
}
function Nn(e) {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}
function Da(e) {
  return !!(e && typeof e == "object" && e.v === 2 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function Va(e, t) {
  const n = {
    everydayPrivateKeyHex: Array.from(t.everydayPrivateKey, (r) => r.toString(16).padStart(2, "0")).join(""),
    accountId: t.accountId,
    recoveryPublicKey: t.recoveryPublicKey,
    activeCredentialEvent: t.activeCredentialEvent,
    activeRecoveryEvent: t.activeRecoveryEvent,
    ...t.connectionVaultRoot ? {
      connectionVaultRootHex: Array.from(
        t.connectionVaultRoot,
        (r) => r.toString(16).padStart(2, "0")
      ).join("")
    } : {},
    ...t.vaultEnabled !== void 0 ? { vaultEnabled: t.vaultEnabled } : {},
    ...t.everydayKeyDerived !== void 0 ? { everydayKeyDerived: t.everydayKeyDerived } : {}
  };
  try {
    if (typeof e.getOrCreateDeviceKey != "function") {
      await e.delete(Ge);
      return;
    }
    const r = await e.getOrCreateDeviceKey(dn), o = crypto.getRandomValues(new Uint8Array(12)), i = new TextEncoder().encode(JSON.stringify(n)), a = await crypto.subtle.encrypt({ name: "AES-GCM", iv: o }, r, i), s = {
      v: 2,
      iv: An(o),
      ciphertext: An(new Uint8Array(a))
    };
    await e.set(Ge, JSON.stringify(s));
  } catch {
  }
}
async function qa(e) {
  let t;
  try {
    t = await e.get(Ge);
  } catch {
    return null;
  }
  if (!t) return null;
  try {
    const n = JSON.parse(t);
    if (!Da(n) || typeof e.getOrCreateDeviceKey != "function")
      return await e.delete(Ge), null;
    const r = await e.getOrCreateDeviceKey(dn), o = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: Nn(Sn(n.iv)) },
      r,
      Nn(Sn(n.ciphertext))
    ), i = JSON.parse(new TextDecoder().decode(o));
    return typeof i.everydayPrivateKeyHex != "string" || typeof i.accountId != "string" || typeof i.recoveryPublicKey != "string" || !i.activeCredentialEvent || !i.activeRecoveryEvent ? null : {
      everydayPrivateKey: Uint8Array.from(
        i.everydayPrivateKeyHex.match(/.{1,2}/g) || [],
        (a) => Number.parseInt(a, 16)
      ),
      accountId: i.accountId,
      recoveryPublicKey: i.recoveryPublicKey,
      activeCredentialEvent: i.activeCredentialEvent,
      activeRecoveryEvent: i.activeRecoveryEvent,
      ...typeof i.connectionVaultRootHex == "string" ? {
        connectionVaultRoot: Uint8Array.from(
          i.connectionVaultRootHex.match(/.{1,2}/g) || [],
          (a) => Number.parseInt(a, 16)
        )
      } : {},
      ...typeof i.vaultEnabled == "boolean" ? { vaultEnabled: i.vaultEnabled } : {},
      ...typeof i.everydayKeyDerived == "boolean" ? { everydayKeyDerived: i.everydayKeyDerived } : {}
    };
  } catch {
    return null;
  }
}
async function Ba(e) {
  try {
    await e.delete(Ge), typeof e.deleteDeviceKey == "function" && await e.deleteDeviceKey(dn);
  } catch {
  }
}
const zr = "bitlogin:signer-handoff:v1", Wa = /* @__PURE__ */ new Set([
  "configure",
  "getPublicKey",
  "signEvent",
  "getSessionStatus",
  "logout",
  "handoffBegin",
  "handoffAccept"
]), It = /^[0-9a-f]{64}$/;
function $a(e) {
  return Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
}
function ja(e) {
  return Uint8Array.from(e.match(/.{2}/g) ?? [], (t) => Number.parseInt(t, 16));
}
function Fa(e, t, n) {
  if (!It.test(t)) throw new Error("The hand-off has no usable recipient key.");
  if (e.length !== 32) throw new Error("No identity is unlocked in this session.");
  const r = new ge(n.slice());
  try {
    const o = JSON.stringify({ v: 1, purpose: zr, key: $a(e) });
    return { senderPublicKey: r.getPublicKey(), payload: r.nip44Encrypt(t, o) };
  } finally {
    r.destroy();
  }
}
function za(e, t) {
  if (!e || !It.test(e.senderPublicKey) || typeof e.payload != "string")
    throw new Error("That is not a signer hand-off.");
  const n = new ge(t.slice());
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
  if (o.v !== 1 || o.purpose !== zr || typeof o.key != "string" || !It.test(o.key))
    throw new Error("That is not a signer hand-off.");
  const i = ja(o.key);
  try {
    k(i);
  } catch {
    throw i.fill(0), new Error("The hand-off carried an unusable key.");
  }
  return i;
}
const Hr = "bitlogin:session-public:v1";
async function Ha(e, t) {
  try {
    const n = {
      pubkey: t.pubkey,
      npub: t.npub,
      ...t.name ? { name: t.name } : {}
    };
    await e.set(Hr, JSON.stringify(n));
  } catch {
  }
}
async function Ga(e) {
  try {
    await e.delete(Hr);
  } catch {
  }
}
class Ja {
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
const d = {
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
  signerOnly: !1
};
let ve = null, C = [...Tr], Re = [...Ir];
const $ = new Oa();
let Lt = !1, Ut = !1;
function Cn(e) {
  Lt || (C = e.vaultRelays), Ut || (Re = e.discoveryRelays);
}
const Ya = new Ja();
function oe() {
  if (!d.signer || !d.everydayPrivateKey)
    throw new Error("No identity is unlocked in this session.");
  return { signer: d.signer, everydayPrivateKey: d.everydayPrivateKey };
}
function Ae() {
  d.signer?.destroy(), d.everydayPrivateKey && d.everydayPrivateKey.fill(0), d.signer = null, d.everydayPrivateKey = null, d.accountId = null, d.recoveryPublicKey = null, d.activeCredentialEvent = null, d.activeRecoveryEvent = null, d.everydayKeyDerived = !1, d.vault?.destroy(), d.vault = null, d.connectionVaultRoot && d.connectionVaultRoot.fill(0), d.connectionVaultRoot = null, d.vaultKnown = !1, d.signerOnly = !1, d.pendingRecovery && (d.pendingRecovery.recoveryPrivateKey.fill(0), d.pendingRecovery.everydayPrivateKey.fill(0), d.pendingRecovery = null);
}
function xn(e) {
  return Ae(), d.pendingRecovery = e, d.signer = new ge(e.everydayPrivateKey), d.everydayPrivateKey = e.everydayPrivateKey, d.accountId = e.accountId, d.recoveryPublicKey = e.recoveryPublicKey, d.activeRecoveryEvent = e.currentRecoveryEvent, d.everydayKeyDerived = e.everydayKeyDerived, Mt(
    e.currentRecoveryPayload.connection_vault_root ? ne(e.currentRecoveryPayload.connection_vault_root) : void 0
  ), {
    everydayPublicKey: e.everydayPublicKey,
    accountId: e.accountId,
    generalRelays: e.generalRelays,
    dmRelays: e.dmRelays,
    chainWarning: e.chainWarning,
    everydayKeyDerived: e.everydayKeyDerived
  };
}
function Mt(e, t) {
  d.connectionVaultRoot = e ?? null, d.vaultKnown = !0, d.vault = null, t && E(t);
}
async function tt() {
  !d.everydayPrivateKey || !d.accountId || !d.recoveryPublicKey || !d.activeCredentialEvent || !d.activeRecoveryEvent || (await Va($, {
    everydayPrivateKey: d.everydayPrivateKey,
    accountId: d.accountId,
    recoveryPublicKey: d.recoveryPublicKey,
    activeCredentialEvent: d.activeCredentialEvent,
    activeRecoveryEvent: d.activeRecoveryEvent,
    ...d.connectionVaultRoot ? { connectionVaultRoot: d.connectionVaultRoot } : {},
    ...d.vaultKnown ? { vaultEnabled: d.connectionVaultRoot !== null } : {},
    everydayKeyDerived: d.everydayKeyDerived
  }), await Gr());
}
async function Gr() {
  if (!d.signer) return;
  const e = d.signer.getPublicKey();
  await Ha($, { pubkey: e, npub: ot(e) });
}
function qe() {
  try {
    return new URL(self.location.href).origin;
  } catch {
    return "";
  }
}
function Ot() {
  if (!d.signer) throw new Error("No identity is unlocked in this session.");
  if (!d.connectionVaultRoot)
    throw new Error(
      d.vaultKnown ? "This account predates the Connection Vault. Enable it from your BitLogin account manager (recovery phrase required)." : "Sign in again to use wallet connections on this device."
    );
  return d.vault ??= new Ia(d.connectionVaultRoot.slice()), d.vault;
}
function Be(e) {
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
async function st() {
  const e = Ot(), t = await e.listConnections({ relayUrls: C, store: $ });
  return {
    vault: e,
    connections: t.connections.filter((n) => n.record.state !== "deleted"),
    rollbackWarnings: t.rollbackWarnings,
    unreadable: t.unreadable,
    truncated: t.truncated,
    quorumMet: t.quorumMet
  };
}
async function Kt(e) {
  const { vault: t, connections: n } = await st(), r = n.find((o) => o.record.connection_id === e);
  if (!r) throw new Error("That connection no longer exists.");
  return { vault: t, connection: r };
}
let me = null, se = null;
function Tn(e) {
  self.postMessage({ notify: "nip46-auth-url", url: e });
}
function We() {
  if (!me) throw new Error("No remote signer is connected.");
  return me;
}
function nt() {
  se && (se.abort.abort(), E(se.clientSecretKey), se = null);
}
function Jr(e) {
  const t = e.buildLogoutEvent();
  e.close(), t && e.publishCourtesy(t);
}
function In(e, t) {
  me && Jr(me.client), me = { client: e, userPubkey: t };
}
async function Xa(e, t) {
  if (d.signerOnly && !Wa.has(e))
    throw new Error("This session can only sign. Sign in at your own BitLogin page for anything else.");
  switch (e) {
    // ---- Signer hand-off (docs/sign-in-window.md) ----
    // The receiving side, first: a throwaway key for the hand-off to be sealed to.
    case "handoffBegin":
      return ve && E(ve), ve = et(), { recipientPublicKey: k(ve) };
    // The sending side: this worker has the session, and seals the everyday
    // key (only that) to the receiving worker's throwaway key.
    case "handoffExport": {
      const { everydayPrivateKey: n } = oe(), r = et();
      try {
        return Fa(n, t.recipientPublicKey, r);
      } finally {
        E(r);
      }
    }
    // The receiving side, last: open it with the throwaway key, which is
    // then gone. What results is a signer-only session, in memory. It is
    // never written to the session cache or the public record.
    case "handoffAccept": {
      if (!ve) throw new Error("No hand-off was begun here.");
      const n = ve;
      ve = null;
      let r;
      try {
        r = za(t, n);
      } finally {
        E(n);
      }
      return Ae(), d.signer = new ge(r), d.everydayPrivateKey = r, d.signerOnly = !0, { everydayPublicKey: d.signer.getPublicKey() };
    }
    case "nip46Connect": {
      const r = pa(t.uri), o = new En({
        clientSecretKey: et(),
        pointer: r,
        onAuthUrl: Tn
      });
      try {
        await o.connect();
        const i = await o.getUserPublicKey();
        return In(o, i), nt(), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46NostrconnectStart": {
      const n = t, r = C.slice(0, 2);
      nt();
      const o = et(), i = $e(ee(16));
      return se = { clientSecretKey: o, relayUrls: r, secret: i, abort: new AbortController() }, { uri: va({
        clientPubkey: k(o),
        relayUrls: r,
        secret: i,
        name: n.appName?.trim() || "BitLogin",
        perms: ["sign_event", "nip44_encrypt", "nip44_decrypt", "nip04_encrypt", "nip04_decrypt"]
      }) };
    }
    case "nip46NostrconnectAwait": {
      const n = se;
      if (!n) throw new Error("No signer-connection attempt is in progress.");
      let r;
      try {
        ({ signerPubkey: r } = await ga({
          clientSecretKey: n.clientSecretKey,
          relayUrls: n.relayUrls,
          secret: n.secret,
          timeoutMs: 18e4,
          signal: n.abort.signal
        }));
      } catch (i) {
        throw se === n && nt(), i;
      }
      if (se !== n) throw new Error("This signer-connection attempt was superseded.");
      se = null;
      const o = new En({
        clientSecretKey: n.clientSecretKey,
        pointer: { signerPubkey: r, relayUrls: n.relayUrls },
        onAuthUrl: Tn
      });
      try {
        const i = await o.getUserPublicKey();
        return In(o, i), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46SignEvent": {
      const n = t;
      return We().client.signEvent({
        kind: n.kind,
        content: n.content,
        tags: n.tags ?? [],
        created_at: n.created_at ?? Math.floor(Date.now() / 1e3)
      });
    }
    case "nip46Nip44Encrypt": {
      const n = t;
      return { ciphertext: await We().client.nip44Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip44Decrypt": {
      const n = t;
      return { plaintext: await We().client.nip44Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Nip04Encrypt": {
      const n = t;
      return { ciphertext: await We().client.nip04Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip04Decrypt": {
      const n = t;
      return { plaintext: await We().client.nip04Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Disconnect": {
      const n = me;
      return me = null, nt(), n && Jr(n.client), {};
    }
    case "configure": {
      const n = t;
      return Lt = !!n.vaultRelayUrls?.length, Ut = !!n.discoveryRelayUrls?.length, n.vaultRelayUrls?.length && (C = n.vaultRelayUrls), n.discoveryRelayUrls?.length && (Re = n.discoveryRelayUrls), Cn(at(await Ur($))), (!Lt || !Ut) && aa($).then(Cn, () => {
      }), {};
    }
    case "register": {
      const n = t, r = n.importKey ? await si({ nsecOrHex: n.importKey, loginName: n.loginName, password: n.password, vaultRelayUrls: C }) : await cr({ loginName: n.loginName, password: n.password, vaultRelayUrls: C });
      return Ae(), d.signer = new ge(r.everydayPrivateKey), d.everydayPrivateKey = r.everydayPrivateKey, d.accountId = r.accountId, d.recoveryPublicKey = r.recoveryPublicKey, d.activeCredentialEvent = r.credentialEvent, d.activeRecoveryEvent = r.recoveryEvent, d.everydayKeyDerived = r.everydayKeyDerived, Mt(r.connectionVaultRoot, r.vaultSudoKey), await tt(), {
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
      const r = lr(t.nsecOrHex), o = k(r), i = { everydayPublicKey: o, npub: ot(o) };
      return r.fill(0), i;
    }
    case "login": {
      const n = t, r = await ci({
        loginName: n.loginName,
        password: n.password,
        vaultRelayUrls: C,
        store: $,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return Ae(), d.signer = new ge(r.everydayPrivateKey), d.everydayPrivateKey = r.everydayPrivateKey, d.accountId = r.accountId, d.recoveryPublicKey = r.recoveryPublicKey, d.activeCredentialEvent = r.credentialEvent, d.activeRecoveryEvent = r.recoveryCapsuleEvent, d.everydayKeyDerived = r.everydayKeyDerived, Mt(r.connectionVaultRoot, r.vaultSudoKey), await tt(), !r.rollbackWarning && !r.relayDisagreementWarning && vn({
        relayUrls: C,
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
      const n = t, r = await li({
        phrase: n.phrase,
        vaultRelayUrls: C,
        discoveryRelayUrls: Re,
        offlineRecoveryCapsuleEvents: n.offlineExportFile?.recovery_capsule_events
      });
      return xn(r);
    }
    case "previewPhraseRebuild": {
      const r = await ui({ phrase: t.phrase, vaultRelayUrls: C, discoveryRelayUrls: Re });
      return { ...r, npub: ot(r.everydayPublicKey) };
    }
    case "rebuildFromPhrase": {
      const r = await di({ phrase: t.phrase, vaultRelayUrls: C, discoveryRelayUrls: Re });
      return xn(r);
    }
    case "completeRecovery": {
      const n = t;
      if (!d.pendingRecovery) throw new Error("No recovery is in progress in this session.");
      const r = await yi({
        recovered: d.pendingRecovery,
        newLoginName: n.newLoginName,
        newPassword: n.newPassword,
        vaultRelayUrls: C,
        store: $
      });
      return d.activeCredentialEvent = r.credentialEvent, d.activeRecoveryEvent = r.refreshedRecoveryEvent, d.pendingRecovery.recoveryPrivateKey.fill(0), d.pendingRecovery = null, await tt(), {
        locatorPublicKey: r.locatorPublicKey,
        credentialEventId: r.credentialEvent.id,
        refreshedRecoveryEventId: r.refreshedRecoveryEvent.id
      };
    }
    case "changePassword": {
      const n = t, r = await hi({
        loginName: n.loginName,
        oldPassword: n.oldPassword,
        newPassword: n.newPassword,
        vaultRelayUrls: C,
        store: $,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return d.activeCredentialEvent = r.newCredentialEvent, d.recoveryPublicKey = r.recoveryPublicKey, d.activeRecoveryEvent = r.recoveryCapsuleEvent, await tt(), {
        newLocatorPublicKey: r.newLocatorPublicKey,
        newGeneration: r.newGeneration,
        tombstoneAcknowledgedCount: r.tombstoneAcknowledgedCount,
        deletionAcknowledgedCount: r.deletionAcknowledgedCount
      };
    }
    case "publishProfileAndRelayLists": {
      const n = t, { everydayPrivateKey: r } = oe();
      return Co({
        everydayPrivateKey: r,
        name: n.name,
        about: n.about,
        picture: n.picture,
        generalRelays: n.generalRelays,
        dmRelays: n.dmRelays,
        discoveryRelays: Re
      });
    }
    case "getPublicKey": {
      const { signer: n } = oe();
      return { publicKey: n.getPublicKey() };
    }
    case "signEvent": {
      const { signer: n } = oe(), r = t;
      return n.signEvent({ kind: r.kind, tags: r.tags, content: r.content, created_at: r.created_at });
    }
    case "nip44Encrypt": {
      const { signer: n } = oe(), r = t;
      return { ciphertext: n.nip44Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip44Decrypt": {
      const { signer: n } = oe(), r = t;
      return { plaintext: n.nip44Decrypt(r.peerPublicKey, r.payload) };
    }
    case "nip04Encrypt": {
      const { signer: n } = oe(), r = t;
      return { ciphertext: n.nip04Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip04Decrypt": {
      const { signer: n } = oe(), r = t;
      return { plaintext: n.nip04Decrypt(r.peerPublicKey, r.payload) };
    }
    case "exportIdentity": {
      const { everydayPrivateKey: n, signer: r } = oe();
      return { nsec: fo(n), npub: ot(r.getPublicKey()) };
    }
    case "buildRecoveryExport": {
      if (oe(), !d.recoveryPublicKey || !d.activeRecoveryEvent)
        throw new Error("No recovery capsule is known in this session yet.");
      return ho({
        recoveryPublicKeyHex: d.recoveryPublicKey,
        vaultRelayUrls: C,
        recoveryCapsuleEvents: [d.activeRecoveryEvent],
        relayListEvents: []
      });
    }
    case "repairReplicas": {
      if (!d.activeCredentialEvent || !d.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return vn({
        relayUrls: C,
        credentialEvent: d.activeCredentialEvent,
        recoveryEvent: d.activeRecoveryEvent
      });
    }
    case "checkReplicaHealth": {
      if (!d.activeCredentialEvent || !d.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return Ho({
        relayUrls: C,
        credentialEvent: d.activeCredentialEvent,
        recoveryEvent: d.activeRecoveryEvent
      });
    }
    case "getSessionStatus":
      return { unlocked: !!d.signer, everydayPublicKey: d.signer?.getPublicKey(), signerOnly: d.signerOnly };
    // Called once, right after "configure", before the widget renders its welcome
    // screen -- restores whatever persistSession() last cached for this origin, so
    // a page reload doesn't ask for the login name + password again. A missing or
    // corrupt cache is not an error: it just means the widget falls through to its
    // normal welcome screen, exactly like it always has.
    case "restoreSession": {
      const n = await qa($);
      return n ? (Ae(), d.signer = new ge(n.everydayPrivateKey), d.everydayPrivateKey = n.everydayPrivateKey, d.accountId = n.accountId, d.recoveryPublicKey = n.recoveryPublicKey, d.activeCredentialEvent = n.activeCredentialEvent, d.activeRecoveryEvent = n.activeRecoveryEvent, d.everydayKeyDerived = n.everydayKeyDerived ?? !1, d.connectionVaultRoot = n.connectionVaultRoot ?? null, d.vaultKnown = n.vaultEnabled !== void 0, await Gr(), {
        restored: !0,
        everydayPublicKey: d.signer.getPublicKey(),
        accountId: n.accountId,
        everydayKeyDerived: d.everydayKeyDerived
      }) : { restored: !1 };
    }
    case "logout":
      return Ae(), await Ba($), await Ga($), {};
    // ---- Connection Vault (connection-vault.md §12, reveal mode) ----
    case "vaultStatus":
      return d.signer ? d.connectionVaultRoot ? { enabled: !0, vaultPublicKey: Ot().vaultPublicKey } : { enabled: !1, reason: d.vaultKnown ? "no-vault" : "stale-cache" } : { enabled: !1 };
    case "vaultList": {
      const { connections: n, rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: a } = await st();
      return { connections: n.map(Be), rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: a };
    }
    case "vaultSaveNwc": {
      const n = t, r = qe(), o = Ot(), i = Kn(n.uri), a = n.label.trim().slice(0, 120) || "Wallet connection", { record: s, event: c } = await o.createConnection({
        connection_type: "nwc",
        tier: "connectable",
        label: a,
        credential: i,
        application_binding: { origin: r, app_pubkey: null }
      });
      if (!(await o.publish({
        event: c,
        connectionId: s.connection_id,
        relayUrls: C,
        store: $
      })).success)
        throw new Error("The connection could not be saved to enough relays. Please try again.");
      const u = await o.decryptEvent(c);
      return Be(u);
    }
    case "vaultFindForOrigin": {
      const n = qe(), { connections: r } = await st(), o = r.find(
        (i) => i.record.connection_type === "nwc" && i.record.state === "active" && i.record.application_binding.origin === n
      );
      return { connection: o ? Be(o) : null };
    }
    case "vaultRevealNwc": {
      const n = t, { connection: r } = await Kt(n.connectionId);
      if (r.record.connection_type !== "nwc" || r.record.state !== "active")
        throw new Error("That connection is not an active wallet connection.");
      const o = r.record.application_binding.origin;
      if (o !== null && o !== qe())
        throw new Error("That connection belongs to a different site.");
      const i = r.record.credential;
      return qr(i), { uri: Ea(i) };
    }
    case "vaultSetBinding": {
      const n = t, { vault: r, connection: o } = await Kt(n.connectionId), i = n.origin === null ? null : qe(), { record: a, event: s } = await r.updateConnection(o, {
        application_binding: { origin: i, app_pubkey: null }
      });
      if (!(await r.publish({
        event: s,
        connectionId: a.connection_id,
        relayUrls: C,
        store: $
      })).success) throw new Error("The change could not reach enough relays. Please try again.");
      const l = await r.decryptEvent(s);
      return Be(l);
    }
    case "vaultDelete": {
      const n = t, { vault: r, connection: o } = await Kt(n.connectionId), { record: i, event: a } = await r.deleteConnection(o);
      if (!(await r.publish({
        event: a,
        connectionId: i.connection_id,
        relayUrls: C,
        store: $
      })).success) throw new Error("The deletion could not reach enough relays. Please try again.");
      try {
        const c = r.buildDeletionRequest(o.event.id), l = new K(C);
        await l.publishAll(c), l.closeAll();
      } catch {
      }
      return {};
    }
    case "vaultOfferCheck": {
      const n = t, r = qe(), o = Kn(n.uri), { connections: i } = await st(), a = i.find(
        (s) => s.record.connection_type === "nwc" && Pa(s.record.credential, o)
      );
      return a ? a.record.application_binding.origin !== r ? { duplicate: !1 } : { duplicate: !0, connection: Be(a) } : { duplicate: !1 };
    }
    default:
      throw new Error(`Unknown worker action: ${e}`);
  }
}
const Qa = /* @__PURE__ */ new Set([
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
  if (typeof t.action != "string" || !Qa.has(t.action)) {
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
  (r.startsWith("nip46") ? (a) => a() : (a) => Ya.run(a))(() => Xa(r, o)).then(
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
