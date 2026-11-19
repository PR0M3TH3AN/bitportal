import { v as q, g as k, s as ee, b as We, a as te, K as io, j as ct, k as je, l as qt, m as W, u as ne, n as ao, o as so, d as T, q as re, t as vt, S as gt, w as Bt, x as wt, D as Ue, y as Je, z as Oe, A as co, B as lo, C as uo, F as yo, G as _t, H as vn, I as $t, J as ho, L as fo, M as po, N as Ze, O as Wt, P as vo, Q as go, T as jt, U as bt, V as Fe, W as wo, X as Ft, Y as Gt, Z as E, _ as $n, $ as bo, h as Ht, a0 as Wn, a1 as Me, a2 as mo, c as Ye, a3 as jn, a4 as Ce, a5 as ko, a6 as Fn, a7 as rt, a8 as St, a9 as _o, f as ot, aa as Eo, ab as et } from "./bitlogin-shared-DDWBXFUP.js";
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
class Gn extends Error {
  constructor(t = "An account already exists with this login name and password. Sign in instead, or choose different credentials.") {
    super(t), this.name = "AccountAlreadyExistsError";
  }
}
class he extends Error {
  constructor(t) {
    super(t), this.name = "RecoveryFailedError";
  }
}
class Hn extends Error {
  seenGeneration;
  capsuleGeneration;
  constructor(t, n) {
    super(`This credential capsule reports generation ${n}, but this device has already seen generation ${t}. Refusing to log in with older, possibly-revoked credentials.`), this.name = "RollbackDetectedError", this.seenGeneration = t, this.capsuleGeneration = n;
  }
}
function Ge(e, t) {
  const n = t ?? Math.floor(Date.now() / 1e3);
  return e == null ? n : Math.max(n, e + 1);
}
const Po = { generation: -1, recoveryGeneration: -1 };
function zt(e) {
  return `bitlogin:hwm:${e}`;
}
async function Jt(e, t) {
  const n = await e.get(zt(t));
  return n ? JSON.parse(n) : Po;
}
async function zn(e, t, n) {
  const r = await Jt(e, t), o = {
    generation: Math.max(r.generation, n.generation ?? -1),
    recoveryGeneration: Math.max(r.recoveryGeneration, n.recoveryGeneration ?? -1)
  };
  return await e.set(zt(t), JSON.stringify(o)), o;
}
async function Ko(e, t, n = { generation: 0, recoveryGeneration: -1 }) {
  await e.set(zt(t), JSON.stringify(n));
}
function Ro(e) {
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
  return t.username || t.password || t.hash ? !1 : t.protocol === "wss:" ? !0 : t.protocol !== "ws:" ? !1 : t.hostname === "localhost" || t.hostname === "[::1]" || Ro(t.hostname);
}
function Ao() {
  const e = globalThis.WebSocket;
  if (!e)
    throw new Error("No global WebSocket implementation is available in this environment.");
  return e;
}
const lt = 1e3, So = 262144;
function No(e) {
  const t = Math.min(e.limit ?? lt, lt);
  return Math.max(50, t * 3);
}
const Co = 2048, xo = 1e4, To = 100;
function Io(e, t) {
  if (e.size >= Co) {
    const n = e.values().next().value;
    n !== void 0 && e.delete(n);
  }
  e.add(t);
}
class Yt {
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
      const r = Ao(), o = new r(this.url);
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
    if (t.length > So)
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
        if (u - s.liveWindowStart >= xo && (s.liveWindowStart = u, s.liveVerifies = 0), s.liveVerifies >= To || (s.liveVerifies++, !q(a) || !gn(a, s.filter)))
          return;
        Io(s.seenIds, a.id), s.onEvent(a);
        return;
      }
      const l = Math.min(s.filter.limit ?? lt, lt);
      if (s.events.length >= l || s.verifyBudget <= 0 || (s.verifyBudget--, !q(a) || !gn(a, s.filter)))
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
    const n = k(this.authPrivateKey), r = ee({
      pubkey: n,
      created_at: Math.floor(Date.now() / 1e3),
      kind: io,
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
    const r = We(te(8));
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
    const r = We(te(8));
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
        verifyBudget: No(t),
        liveWindowStart: 0,
        liveVerifies: 0,
        filter: t,
        onEose: () => s()
      }), this.send(["REQ", r, t]);
    });
  }
}
function gn(e, t) {
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
      this.connections.set(r, new Yt(r, n));
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
function Lo(e, t, n) {
  return ee({ pubkey: k(e), created_at: n, kind: ct, tags: [], content: JSON.stringify(t) }, e);
}
function Uo(e, t, n) {
  const r = t.map((o) => {
    const i = ["r", o.url];
    return o.read && !o.write && i.push("read"), o.write && !o.read && i.push("write"), i;
  });
  return ee({ pubkey: k(e), created_at: n, kind: je, tags: r, content: "" }, e);
}
function Oo(e, t, n) {
  return ee({
    pubkey: k(e),
    created_at: n,
    kind: qt,
    tags: t.map((r) => ["relay", r]),
    content: ""
  }, e);
}
function Mo(e) {
  return e.tags.filter((t) => t[0] === "r" && t[1]).map((t) => t[1]);
}
function Do(e) {
  return e.tags.filter((t) => t[0] === "relay" && t[1]).map((t) => t[1]);
}
async function Vo(e) {
  const t = k(e.everydayPrivateKey), n = Math.floor(Date.now() / 1e3), r = [.../* @__PURE__ */ new Set([...e.generalRelays, ...e.dmRelays, ...e.discoveryRelays])], o = new K(r), [i, a, s] = await Promise.all([
    o.queryQuorum({ authors: [t], kinds: [ct] }),
    o.queryQuorum({ authors: [t], kinds: [je] }),
    o.queryQuorum({ authors: [t], kinds: [qt] })
  ]);
  o.closeAll();
  const c = i.outcomes.some((v) => v.events.length > 0), l = a.outcomes.some((v) => v.events.length > 0), u = s.outcomes.some((v) => v.events.length > 0), d = new K(r);
  let g = null, f = null, w = null;
  const p = [];
  if (!c && (e.name || e.about || e.picture)) {
    const v = Lo(e.everydayPrivateKey, { name: e.name, about: e.about, picture: e.picture }, n);
    p.push(d.publishAll(v).then((h) => void (g = h)));
  }
  if (!l) {
    const v = Uo(e.everydayPrivateKey, e.generalRelays.map((h) => ({ url: h, read: !0, write: !0 })), n);
    p.push(d.publishAll(v).then((h) => void (f = h)));
  }
  if (!u) {
    const v = Oo(e.everydayPrivateKey, e.dmRelays, n);
    p.push(d.publishAll(v).then((h) => void (w = h)));
  }
  return await Promise.all(p), d.closeAll(), {
    profilePublished: g !== null && Ne(g) > 0,
    relayListAcknowledgedCount: f !== null ? Ne(f) : 0,
    dmRelayListAcknowledgedCount: w !== null ? Ne(w) : 0,
    profileSkippedExisting: c,
    relayListSkippedExisting: l,
    dmRelayListSkippedExisting: u
  };
}
async function Ee(e, t, n) {
  const r = n.minAcks ?? 2, o = n.minReadbacks ?? 2, i = await e.publishAll(t, n.timeoutMs), a = Ne(i), c = (await e.queryQuorum({ kinds: [W], authors: [t.pubkey], "#d": [n.dTag], limit: 5 }, n.timeoutMs)).outcomes.filter((l) => l.events.some((u) => u.id === t.id)).length;
  return {
    acknowledgedCount: a,
    readbackVerifiedCount: c,
    success: a >= r && c >= o
  };
}
function qo(e) {
  const t = ao(e);
  if (t === void 0)
    throw new Error("Value is not JSON-serializable for canonicalization.");
  return t;
}
function Bo(e) {
  return ne(qo(e));
}
const it = [1024, 2048, 4096], be = 4;
function $o(e) {
  const t = be + e.length, n = it.find((i) => i >= t);
  if (n === void 0)
    throw new Error(`Payload of ${e.length} bytes exceeds the largest padding bucket (${it[it.length - 1]} bytes minus ${be}-byte length prefix).`);
  const r = new Uint8Array(n);
  return new DataView(r.buffer).setUint32(0, e.length, !1), r.set(e, be), r;
}
function Wo(e) {
  if (!it.includes(e.length))
    throw new Error(`Padded plaintext length ${e.length} does not match a known bucket.`);
  const n = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !1);
  if (n > e.length - be)
    throw new Error("Declared payload length exceeds the padded bucket size.");
  const r = e.slice(be, be + n), o = e.slice(be + n);
  for (const i of o)
    if (i !== 0)
      throw new Error("Padding bytes are not all zero; capsule plaintext is malformed.");
  return r;
}
function Xt() {
  const e = globalThis.crypto;
  if (!e || !e.subtle)
    throw new Error("WebCrypto SubtleCrypto is not available in this environment.");
  return e;
}
async function Jn(e) {
  if (e.length !== 32)
    throw new Error("AES-256-GCM key must be exactly 32 bytes.");
  return Xt().subtle.importKey("raw", e, "AES-GCM", !1, ["encrypt", "decrypt"]);
}
async function Yn(e, t, n) {
  const r = so(), o = await Jn(e), i = await Xt().subtle.encrypt({ name: "AES-GCM", iv: r, additionalData: n, tagLength: 128 }, o, t);
  return { nonce: r, ciphertext: new Uint8Array(i) };
}
async function Xn(e, t, n, r) {
  const o = await Jn(e);
  try {
    const i = await Xt().subtle.decrypt({ name: "AES-GCM", iv: t, additionalData: r, tagLength: 128 }, o, n);
    return new Uint8Array(i);
  } catch {
    throw new Error("AES-256-GCM authentication failed: capsule is corrupted, tampered, or the wrong key was used.");
  }
}
function Qn(e) {
  return ne(`bitlogin|password-capsule|v1|${e}|30078|bitlogin:password:v1`);
}
function Zn(e) {
  return ne(`bitlogin|recovery-capsule|v1|${e}|30078|bitlogin:recovery:v1`);
}
async function Qt(e, t, n) {
  const r = Bo(e), o = $o(r), i = await Yn(t, o, n);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    nonce: T(i.nonce),
    ciphertext: T(i.ciphertext)
  };
}
async function Zt(e, t, n) {
  if (e.version !== 1 || e.algorithm !== "aes-256-gcm")
    throw new Error(`Unsupported capsule envelope version/algorithm: ${e.version}/${e.algorithm}`);
  const r = re(e.nonce), o = re(e.ciphertext), i = await Xn(t, r, o, n), a = Wo(i);
  return JSON.parse(vt(a));
}
class en extends Error {
  constructor(t) {
    super(t), this.name = "CapsuleValidationError";
  }
}
const jo = 1e6, Fo = /^[0-9a-f]{64}$/u;
function A(e, t) {
  if (!e)
    throw new en(t);
}
function ut(e) {
  return typeof e == "string" && Fo.test(e);
}
function er(e) {
  A(Array.isArray(e), "vault_relay_hints must be an array (§12.4.7).");
  for (const t of e)
    A(typeof t == "string", "Each relay hint must be a string (§12.4.7)."), A(Xe(t), `Relay URL must use secure WebSockets, except for an explicit loopback development endpoint (§12.4.7): ${t}`);
}
function tr(e) {
  A(typeof e == "string", "account_id must be a string (§12.4.2).");
  let t;
  try {
    t = re(e);
  } catch {
    throw new en("account_id is not valid base64url (§12.4.2).");
  }
  A(t.length === 16, "account_id must decode to exactly 128 bits (§12.4.2).");
}
function nr(e, t) {
  A(typeof e == "string", "operational_private_key must be a string (§12.4.3).");
  const n = re(e);
  A(n.length === 32, "operational_private_key must be exactly 32 bytes (§12.4.3)."), A(Bt(n), "operational_private_key is not a valid secp256k1 scalar (§12.4.3)."), A(ut(t), "operational_public_key must be lowercase 64-char hex (§12.4.4).");
  const r = k(n);
  A(r === t, "operational_public_key does not match the derived public key (§12.4.4).");
}
function yt(e, t) {
  A(typeof t == "string", `${e} must be a string (§CV5.2).`);
  let n;
  try {
    n = re(t);
  } catch {
    throw new en(`${e} is not valid base64url (§CV5.2).`);
  }
  A(n.length === 32, `${e} must decode to exactly 32 bytes (§CV5.2).`);
}
function Go(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (A(t !== void 0 && n !== void 0, "connection_vault_root and vault_sudo_key must appear together (§CV5.2)."), yt("connection_vault_root", t), yt("vault_sudo_key", n));
}
function Ho(e) {
  const t = e.connection_vault_root, n = e.vault_sudo_key;
  t === void 0 && n === void 0 || (A(t !== void 0, "vault_sudo_key cannot appear without connection_vault_root (§CV5.2)."), yt("connection_vault_root", t), n !== void 0 && yt("vault_sudo_key", n));
}
function rr(e, t) {
  A(Number.isInteger(e) && e >= 0 && e <= jo, `${t} is out of supported bounds (§12.4.8).`);
}
function zo(e) {
  A(e.schema === wt, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), tr(e.account_id), rr(e.generation, "generation"), nr(e.operational_private_key, e.operational_public_key), A(ut(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex (§12.4.5)."), er(e.vault_relay_hints), Ho(e);
  const t = e.recovery_capsule_event;
  A(!!t && typeof t == "object", "recovery_capsule_event must be present (§12.4.6)."), A(q(t), "Embedded recovery_capsule_event has an invalid event id or signature (§12.4.6)."), A(t.pubkey === e.recovery_public_key, "Embedded recovery_capsule_event author does not match recovery_public_key (§12.4.5).");
}
function Jo(e) {
  A(e.schema === gt, `Unsupported or unknown schema: ${String(e.schema)} (§12.4.1)`), tr(e.account_id), rr(e.recovery_generation, "recovery_generation"), A(e.previous_recovery_event_id === null || ut(e.previous_recovery_event_id), "previous_recovery_event_id must be null or lowercase 64-char hex (§12.3)."), nr(e.operational_private_key, e.operational_public_key), A(ut(e.recovery_public_key), "recovery_public_key must be lowercase 64-char hex."), er(e.vault_relay_hints), Go(e);
}
function Yo(e) {
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
async function tn(e) {
  const t = k(e.locatorPrivateKey), n = await Qt(e.payload, e.capsuleKey, Qn(t));
  return ee({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: W,
    tags: [["d", Ue]],
    content: JSON.stringify(n)
  }, e.locatorPrivateKey);
}
function Xo(e) {
  const t = k(e.oldLocatorPrivateKey);
  return ee({
    pubkey: t,
    created_at: e.createdAt,
    kind: W,
    tags: [["d", Ue]],
    content: ""
  }, e.oldLocatorPrivateKey);
}
async function Qo(e, t) {
  if (!q(e))
    throw new Error("Credential capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await Zt(n, t, Qn(e.pubkey));
  return zo(r), r;
}
async function nn(e) {
  const t = k(e.recoveryPrivateKey), n = await Qt(e.payload, e.capsuleKey, Zn(t));
  return ee({
    pubkey: t,
    created_at: e.payload.created_at,
    kind: W,
    tags: [["d", Je]],
    content: JSON.stringify(n)
  }, e.recoveryPrivateKey);
}
async function or(e, t) {
  if (!q(e))
    throw new Error("Recovery capsule event has an invalid id or signature.");
  const n = JSON.parse(e.content), r = await Zt(n, t, Zn(e.pubkey));
  return Jo(r), r;
}
function wn(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  for (const o of e)
    o.pubkey === t && o.kind === W && Oe(o, "d") === n && q(o) && r.set(o.id, o);
  return [...r.values()].sort((o, i) => i.created_at - o.created_at);
}
async function ir(e, t, n, r, o) {
  const i = await e.queryQuorum({ kinds: [W], authors: [t], "#d": [n], limit: 5 }, o), a = i.outcomes.flatMap((g) => g.events), s = wn(a, t, n), c = [];
  for (const g of s)
    try {
      const f = await r(g);
      c.push({ event: g, payload: f });
    } catch (f) {
      c.push({ event: g, payload: null, error: f.message });
    }
  const l = c.find((g) => g.payload !== null) ?? null, u = i.outcomes.map((g) => ({
    responded: g.responded,
    events: wn(g.events, t, n)
  })).filter((g) => g.responded && g.events.length > 0).map((g) => g.events[0].id), d = new Set(u).size > 1;
  return {
    quorumMet: i.quorumMet,
    respondedCount: i.respondedCount,
    totalCount: i.totalCount,
    candidates: c,
    best: l,
    relayDisagreement: d
  };
}
async function He(e, t, n, r = 8e3) {
  return ir(e, t, Ue, (o) => Qo(o, n), r);
}
async function ar(e, t, n, r = 8e3) {
  return ir(e, t, Je, (o) => or(o, n), r);
}
function Zo(e) {
  const t = e.filter((n) => n.payload !== null);
  return t.length < 2 ? { consistent: !0 } : Yo(t.map((n) => ({
    eventId: n.event.id,
    recoveryGeneration: n.payload.recovery_generation,
    previousRecoveryEventId: n.payload.previous_recovery_event_id
  })));
}
async function bn(e) {
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
function ei(e) {
  const t = Oe(e, "d");
  if (e.kind !== W || t === void 0 || !q(e))
    throw new Error("This session's capsule event is not a valid capsule.");
  return { pubkey: e.pubkey, dTag: t };
}
function ti(e, t, n) {
  const r = e.filter((i) => i.pubkey === n.pubkey && i.kind === W && Oe(i, "d") === n.dTag && q(i));
  return r.some((i) => i.id === t.id) ? "current" : r.length === 0 ? "missing" : Math.max(...r.map((i) => i.created_at)) >= t.created_at ? "newer" : "older";
}
async function mn(e, t, n) {
  const r = ei(t), o = new K(e);
  try {
    const i = await o.queryQuorum({
      kinds: [W],
      authors: [r.pubkey],
      "#d": [r.dTag],
      limit: 5
    }, n);
    return new Map(i.outcomes.map((a) => [
      a.relayUrl,
      a.responded ? { status: ti(a.events, t, r) } : { status: "unreachable", error: a.error }
    ]));
  } finally {
    o.closeAll();
  }
}
async function ni(e) {
  const t = [...new Set(e.relayUrls)], [n, r] = await Promise.all([
    mn(t, e.credentialEvent, e.timeoutMs),
    mn(t, e.recoveryEvent, e.timeoutMs)
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
const sr = `abandon
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
function ri(e, t, n, r) {
  uo(e);
  const o = yo({ dkLen: 32, asyncTick: 10 }, r), { c: i, dkLen: a, asyncTick: s } = o;
  if (_t(i), _t(a), _t(s), i < 1)
    throw new Error("iterations (c) should be >= 1");
  const c = vn(t), l = vn(n), u = new Uint8Array(a), d = $t.create(e, c), g = d._cloneInto().update(l);
  return { c: i, dkLen: a, asyncTick: s, DK: u, PRF: d, PRFSalt: g };
}
function oi(e, t, n, r, o) {
  return e.destroy(), t.destroy(), r && r.destroy(), ho(o), n;
}
async function ii(e, t, n, r) {
  const { c: o, dkLen: i, asyncTick: a, DK: s, PRF: c, PRFSalt: l } = ri(e, t, n, r);
  let u;
  const d = new Uint8Array(4), g = co(d), f = new Uint8Array(c.outputLen);
  for (let w = 1, p = 0; p < i; w++, p += c.outputLen) {
    const v = s.subarray(p, p + c.outputLen);
    g.setInt32(0, w, !1), (u = l._cloneInto(u)).update(d).digestInto(f), v.set(f.subarray(0, v.length)), await lo(o - 1, a, () => {
      c._cloneInto(u).update(f).digestInto(f);
      for (let h = 0; h < v.length; h++)
        v[h] ^= f[h];
    });
  }
  return oi(c, l, s, u, f);
}
/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const ai = (e) => e[0] === "あいこくしん";
function cr(e) {
  if (typeof e != "string")
    throw new TypeError("invalid mnemonic type: " + typeof e);
  return e.normalize("NFKD");
}
function lr(e) {
  const t = cr(e), n = t.split(" ");
  if (![12, 15, 18, 21, 24].includes(n.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: t, words: n };
}
function ur(e) {
  po(e, 16, 20, 24, 28, 32);
}
const si = (e) => {
  const t = 8 - e.length / 4;
  return new Uint8Array([Wt(e)[0] >> t << t]);
};
function yr(e) {
  if (!Array.isArray(e) || e.length !== 2048 || typeof e[0] != "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  return e.forEach((t) => {
    if (typeof t != "string")
      throw new Error("wordlist: non-string element: " + t);
  }), Ze.chain(Ze.checksum(1, si), Ze.radix2(11, !0), Ze.alphabet(e));
}
function ci(e, t) {
  const { words: n } = lr(e), r = yr(t).decode(n);
  return ur(r), r;
}
function li(e, t) {
  return ur(e), yr(t).encode(e).join(ai(t) ? "　" : " ");
}
function ui(e, t) {
  try {
    ci(e, t);
  } catch {
    return !1;
  }
  return !0;
}
const yi = (e) => cr("mnemonic" + e);
function di(e, t = "") {
  return ii(fo, lr(e).nfkd, yi(t), { c: 2048, dkLen: 64 });
}
function hi(e) {
  if (e.length !== 16)
    throw new Error("Recovery phrase entropy must be exactly 128 bits (16 bytes).");
  return li(e, sr);
}
function dr(e) {
  try {
    return ui(hr(e), sr);
  } catch {
    return !1;
  }
}
function hr(e) {
  return e.trim().normalize("NFKD").split(/\s+/u).join(" ");
}
async function rn(e) {
  return di(hr(e), "");
}
const on = vo.id, xe = "aes-256-gcm-v1", Te = "bitlogin-bip39-hkdf-v1", fr = "bitlogin-recovery-hkdf-v1", fi = 4, pi = 64;
function Ie(e) {
  return [...new Set(e)].filter((t) => t.length <= pi).slice(0, fi);
}
function Le(e) {
  return e ? { everyday_derivation: fr } : {};
}
function pr(e) {
  return e.protocol?.everyday_derivation === fr;
}
async function vr(e) {
  const t = bt(e.loginName), n = e.now ?? Math.floor(Date.now() / 1e3), { locatorPrivateKey: r, capsuleKey: o } = await Fe(e.password, t);
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
      throw new Gn();
    const c = e.everydayPrivateKey !== void 0;
    if (c && !Bt(e.everydayPrivateKey))
      throw new de("The provided key is not a valid secp256k1 private key.");
    const l = hi(wo()), u = await rn(l);
    let d, g, f;
    try {
      ({ recoveryPrivateKey: d, capsuleKey: g } = Ft(u)), f = c ? e.everydayPrivateKey : Gt(u);
    } finally {
      E(u);
    }
    const w = !c, p = te(32), v = te(32);
    let h = !1;
    try {
      const b = k(d), m = k(f), P = T($n()), O = {
        schema: gt,
        account_id: P,
        recovery_generation: 0,
        previous_recovery_event_id: null,
        operational_private_key: T(f),
        operational_public_key: m,
        recovery_public_key: b,
        connection_vault_root: T(p),
        vault_sudo_key: T(v),
        created_at: n,
        vault_relay_hints: Ie(e.vaultRelayUrls),
        protocol: {
          capsule_encryption: xe,
          recovery_derivation: Te,
          ...Le(w)
        }
      }, R = await nn({
        recoveryPrivateKey: d,
        capsuleKey: g,
        payload: O
      }), N = new K(e.vaultRelayUrls, {
        authPrivateKey: d
      });
      let S;
      try {
        S = await Ee(N, R, {
          dTag: Je,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        N.closeAll();
      }
      if (!S.success)
        throw new de("The recovery capsule did not reach the required relay acknowledgement and readback quorum. No login credential was published. Please retry, or add more vault relays.");
      const I = {
        schema: wt,
        account_id: P,
        generation: 0,
        operational_private_key: T(f),
        operational_public_key: m,
        recovery_public_key: b,
        recovery_capsule_event: R,
        connection_vault_root: T(p),
        created_at: n,
        vault_relay_hints: Ie(e.vaultRelayUrls),
        protocol: {
          password_kdf: on,
          capsule_encryption: xe,
          recovery_derivation: Te,
          ...Le(w)
        }
      }, M = await tn({
        locatorPrivateKey: r,
        capsuleKey: o,
        payload: I
      }), D = new K(e.vaultRelayUrls, {
        authPrivateKey: r
      });
      let L;
      try {
        L = await Ee(D, M, {
          dTag: Ue,
          minAcks: e.minAcknowledgements,
          timeoutMs: e.timeoutMs
        });
      } finally {
        D.closeAll();
      }
      if (!L.success)
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
        everydayKeyDerived: w,
        connectionVaultRoot: p,
        vaultSudoKey: v,
        credentialEvent: M,
        recoveryEvent: R,
        credentialPublish: L,
        recoveryPublish: S
      };
    } finally {
      E(d, g), h || (c || E(f), E(p, v));
    }
  } finally {
    E(r, o);
  }
}
async function vi(e) {
  const { nsecOrHex: t, ...n } = e, r = gr(t);
  return vr({ ...n, everydayPrivateKey: r });
}
function gr(e) {
  const t = e.trim();
  let n;
  if (t.startsWith("nsec1"))
    n = go(t);
  else if (/^[0-9a-fA-F]{64}$/u.test(t))
    n = jt(t.toLowerCase());
  else
    throw new de("Enter a valid nsec (nsec1…) or a 64-character hex private key.");
  if (!Bt(n))
    throw new de("The provided key is not a valid secp256k1 private key.");
  return n;
}
class wr {
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
async function gi(e) {
  const t = bt(e.loginName), { locatorPrivateKey: n, capsuleKey: r } = await Fe(e.password, t), o = k(n), i = new K(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  try {
    const a = await He(i, o, r, e.timeoutMs);
    if (!a.quorumMet)
      throw new _e("quorum-not-met");
    if (!a.best)
      throw new _e(a.candidates.length > 0 ? "no-valid-candidate" : "no-matching-event");
    const s = a.best.payload, c = e.store ?? new wr(), l = await Jt(c, s.operational_public_key), u = s.generation < l.generation;
    if (u && !e.acknowledgeRollback)
      throw new Hn(l.generation, s.generation);
    const d = u ? `This device previously saw credential generation ${l.generation}, but the accepted capsule is generation ${s.generation}. Relays may be serving stale data, or an old capsule is being replayed.` : void 0;
    await zn(c, s.operational_public_key, {
      generation: s.generation
    });
    const g = a.relayDisagreement ? 'Configured relays returned different credential capsules as "latest" for this account. Some relays may be stale, censored, or malicious.' : void 0;
    return {
      everydayPrivateKey: re(s.operational_private_key),
      everydayPublicKey: s.operational_public_key,
      recoveryPublicKey: s.recovery_public_key,
      accountId: s.account_id,
      generation: s.generation,
      everydayKeyDerived: pr(s),
      credentialEvent: a.best.event,
      recoveryCapsuleEvent: s.recovery_capsule_event,
      connectionVaultRoot: s.connection_vault_root ? re(s.connection_vault_root) : void 0,
      rollbackWarning: d,
      relayDisagreementWarning: g
    };
  } finally {
    i.closeAll();
  }
}
function kn(e) {
  return e.filter((t) => q(t)).sort((t, n) => n.created_at - t.created_at)[0];
}
async function wi(e) {
  if (!dr(e.phrase))
    throw new he("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await rn(e.phrase), { recoveryPrivateKey: n, capsuleKey: r } = Ft(t), o = Gt(t), i = k(o);
  E(t, o);
  const a = k(n), s = new K(e.vaultRelayUrls, {
    authPrivateKey: n
  });
  let c;
  try {
    c = await ar(s, a, r, e.timeoutMs);
  } finally {
    s.closeAll();
  }
  if (e.offlineRecoveryCapsuleEvents?.length) {
    const p = [];
    for (const m of e.offlineRecoveryCapsuleEvents)
      if (q(m))
        try {
          p.push({
            event: m,
            payload: await or(m, r)
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
  const l = c.best.payload, u = Zo(c.candidates), d = re(l.operational_private_key), g = l.operational_public_key, { generalRelays: f, dmRelays: w } = await br(g, [...e.discoveryRelayUrls, ...l.vault_relay_hints], e.timeoutMs);
  return {
    everydayPrivateKey: d,
    everydayPublicKey: g,
    recoveryPrivateKey: n,
    recoveryPublicKey: a,
    recoveryCapsuleKey: r,
    accountId: l.account_id,
    currentRecoveryEvent: c.best.event,
    currentRecoveryPayload: l,
    generalRelays: f,
    dmRelays: w,
    chainWarning: u.consistent ? void 0 : u.warning,
    everydayKeyDerived: g === i
  };
}
async function br(e, t, n) {
  const r = new K([...new Set(t)]);
  let o = [], i = [];
  try {
    const a = await r.queryQuorum({ kinds: [je], authors: [e], limit: 5 }, n), s = kn(a.outcomes.flatMap((u) => u.events));
    s && (o = Mo(s));
    const c = await r.queryQuorum({ kinds: [qt], authors: [e], limit: 5 }, n), l = kn(c.outcomes.flatMap((u) => u.events));
    l && (i = Do(l));
  } finally {
    r.closeAll();
  }
  return { generalRelays: o, dmRelays: i };
}
async function mr(e) {
  if (!dr(e))
    throw new he("This does not look like a valid 12-word BitLogin recovery phrase.");
  const t = await rn(e);
  try {
    const { recoveryPrivateKey: n, capsuleKey: r } = Ft(t), o = Gt(t);
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
async function kr(e, t, n) {
  const r = new K(t, {
    authPrivateKey: e.recoveryPrivateKey
  });
  let o;
  try {
    o = await ar(r, e.recoveryPublicKey, e.capsuleKey, n);
  } finally {
    r.closeAll();
  }
  if (!o.quorumMet)
    throw new _e("quorum-not-met");
  if (o.best)
    throw new he("This account's recovery capsule is still on the relays. Use normal recovery instead of a rebuild.");
  return o.candidates.length > 0 ? Math.max(...o.candidates.map((i) => i.event.created_at)) : null;
}
async function bi(e) {
  const t = await mr(e.phrase);
  try {
    await kr(t, e.vaultRelayUrls, e.timeoutMs);
    const n = new K([
      .../* @__PURE__ */ new Set([...e.discoveryRelayUrls, ...e.vaultRelayUrls])
    ]);
    try {
      const o = (await n.queryQuorum({
        kinds: [ct, je],
        authors: [t.everydayPublicKey],
        limit: 10
      }, e.timeoutMs)).outcomes.flatMap((i) => i.events).filter((i) => i.pubkey === t.everydayPublicKey && q(i));
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
async function mi(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = await mr(e.phrase);
  let r = !1;
  try {
    const o = await kr(n, e.vaultRelayUrls, e.timeoutMs), i = {
      schema: gt,
      account_id: T($n()),
      recovery_generation: 0,
      previous_recovery_event_id: null,
      operational_private_key: T(n.everydayPrivateKey),
      operational_public_key: n.everydayPublicKey,
      recovery_public_key: n.recoveryPublicKey,
      connection_vault_root: T(te(32)),
      vault_sudo_key: T(te(32)),
      created_at: o === null ? t : Ge(o, t),
      vault_relay_hints: Ie(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: xe,
        recovery_derivation: Te,
        ...Le(!0)
      }
    }, a = await nn({
      recoveryPrivateKey: n.recoveryPrivateKey,
      capsuleKey: n.capsuleKey,
      payload: i
    }), s = new K(e.vaultRelayUrls, {
      authPrivateKey: n.recoveryPrivateKey
    });
    let c;
    try {
      c = await Ee(s, a, {
        dTag: Je,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      s.closeAll();
    }
    if (!c.success)
      throw new he("Could not publish the rebuilt recovery capsule to enough relays. Nothing else was changed; please retry.");
    const { generalRelays: l, dmRelays: u } = await br(n.everydayPublicKey, [...e.discoveryRelayUrls, ...e.vaultRelayUrls], e.timeoutMs);
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
async function ki(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = bt(e.newLoginName), { recovered: r } = e, o = r.currentRecoveryPayload.connection_vault_root !== void 0 ? {
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
      throw new he("Couldn't verify the new login name and password aren't already registered. Please retry, or add more vault relays.");
    const d = u.best?.payload ?? null, g = d !== null && d.account_id === r.accountId && d.operational_public_key === r.everydayPublicKey && d.recovery_public_key === r.recoveryPublicKey && d.generation === 0 && d.recovery_capsule_event.id === r.currentRecoveryEvent.id;
    if (u.candidates.length > 0 && !g)
      throw new he("Another account is already registered with that login name and password. Pick a different one.");
    const f = r.currentRecoveryPayload.recovery_generation + 1, w = {
      schema: gt,
      account_id: r.accountId,
      recovery_generation: f,
      previous_recovery_event_id: r.currentRecoveryEvent.id,
      operational_private_key: T(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      ...o,
      created_at: Ge(r.currentRecoveryEvent.created_at, t),
      vault_relay_hints: Ie(e.vaultRelayUrls),
      protocol: {
        capsule_encryption: xe,
        recovery_derivation: Te,
        ...Le(r.everydayKeyDerived)
      }
    }, p = await nn({
      recoveryPrivateKey: r.recoveryPrivateKey,
      capsuleKey: r.recoveryCapsuleKey,
      payload: w
    }), v = new K(e.vaultRelayUrls, {
      authPrivateKey: r.recoveryPrivateKey
    });
    let h;
    try {
      h = await Ee(v, p, {
        dTag: Je,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      v.closeAll();
    }
    if (!h.success)
      throw new he("Could not publish the refreshed recovery capsule to enough relays. No new credential was published; please retry.");
    r.currentRecoveryEvent = p, r.currentRecoveryPayload = w;
    const b = {
      schema: wt,
      account_id: r.accountId,
      generation: 0,
      operational_private_key: T(r.everydayPrivateKey),
      operational_public_key: r.everydayPublicKey,
      recovery_public_key: r.recoveryPublicKey,
      recovery_capsule_event: p,
      ...i,
      // A retry may be repairing a credential that reached only one relay.
      // It must replace that partial event deterministically on every relay.
      created_at: u.best ? Ge(u.best.event.created_at, t) : t,
      vault_relay_hints: Ie(e.vaultRelayUrls),
      protocol: {
        password_kdf: on,
        capsule_encryption: xe,
        recovery_derivation: Te,
        ...Le(r.everydayKeyDerived)
      }
    }, m = await tn({
      locatorPrivateKey: a,
      capsuleKey: s,
      payload: b
    }), P = new K(e.vaultRelayUrls, {
      authPrivateKey: a
    });
    let O;
    try {
      O = await Ee(P, m, {
        dTag: Ue,
        minAcks: e.minAcknowledgements,
        timeoutMs: e.timeoutMs
      });
    } finally {
      P.closeAll();
    }
    if (!O.success)
      throw new he("Could not publish the new credential capsule to enough relays. Please retry.");
    return e.store && await Ko(e.store, r.everydayPublicKey, {
      generation: 0,
      recoveryGeneration: f
    }), {
      normalizedLoginName: n,
      locatorPublicKey: c,
      credentialEvent: m,
      refreshedRecoveryEvent: p,
      credentialPublish: O,
      recoveryPublish: h
    };
  } finally {
    E(a, s);
  }
}
function _r(e) {
  const t = k(e.privateKey);
  return ee({
    pubkey: t,
    created_at: e.createdAt,
    kind: bo,
    tags: [
      ["e", e.eventIdToDelete],
      ["k", String(e.deletedEventKind)]
    ],
    content: e.reason ?? ""
  }, e.privateKey);
}
async function _i(e) {
  const t = e.now ?? Math.floor(Date.now() / 1e3), n = bt(e.loginName), r = await Fe(e.oldPassword, n), o = k(r.locatorPrivateKey), i = new K(e.vaultRelayUrls, {
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
  const s = a.best.payload, c = a.best.event, l = e.store ?? new wr(), u = await Jt(l, s.operational_public_key);
  if (s.generation < u.generation && !e.acknowledgeRollback)
    throw new Hn(u.generation, s.generation);
  const d = await Fe(e.newPassword, n), g = k(d.locatorPrivateKey), f = new K(e.vaultRelayUrls, {
    authPrivateKey: d.locatorPrivateKey
  });
  let w;
  try {
    w = await He(f, g, d.capsuleKey, e.timeoutMs);
  } finally {
    f.closeAll();
  }
  if (!w.quorumMet)
    throw new de("Couldn't verify the new password isn't already registered under this login name. Please retry, or add more vault relays.");
  if (w.candidates.length > 0)
    throw new Gn("Another account is already registered with this login name and the new password you chose. Pick a different new password.");
  const p = s.generation + 1, v = {
    schema: wt,
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
      password_kdf: on,
      capsule_encryption: xe,
      recovery_derivation: Te,
      ...Le(pr(s))
    }
  }, h = await tn({
    locatorPrivateKey: d.locatorPrivateKey,
    capsuleKey: d.capsuleKey,
    payload: v
  }), b = new K(e.vaultRelayUrls, {
    authPrivateKey: d.locatorPrivateKey
  }), m = await Ee(b, h, {
    dTag: Ue,
    minAcks: e.minAcknowledgements,
    timeoutMs: e.timeoutMs
  });
  if (b.closeAll(), !m.success)
    throw new de("The new credential capsule did not reach the required relay acknowledgement and readback quorum. Your existing password still works; nothing was changed. Please retry.");
  const P = Xo({
    oldLocatorPrivateKey: r.locatorPrivateKey,
    createdAt: Ge(c.created_at, t)
  }), O = _r({
    privateKey: r.locatorPrivateKey,
    eventIdToDelete: c.id,
    deletedEventKind: W,
    createdAt: t
  }), R = new K(e.vaultRelayUrls, {
    authPrivateKey: r.locatorPrivateKey
  }), [N, S] = await Promise.all([
    R.publishAll(P, e.timeoutMs),
    R.publishAll(O, e.timeoutMs)
  ]);
  return R.closeAll(), await zn(l, s.operational_public_key, {
    generation: p
  }), {
    normalizedLoginName: n,
    oldLocatorPublicKey: o,
    newLocatorPublicKey: g,
    newGeneration: p,
    recoveryPublicKey: s.recovery_public_key,
    recoveryCapsuleEvent: s.recovery_capsule_event,
    newCredentialEvent: h,
    tombstoneEvent: P,
    deletionRequestEvent: O,
    newCredentialPublish: m,
    tombstoneAcknowledgedCount: Ne(N),
    deletionAcknowledgedCount: Ne(S)
  };
}
const Ei = "bitlogin/connection-vault-root/v1", Pi = "bitlogin/connection-vault-signing/v1", Ki = "bitlogin/connection-record-encryption/v1", Ri = "bitlogin/connection-vault-personal/v1", Nt = "bitlogin:connection:";
function Ai(e) {
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Ht(Wn(Ei), e);
}
function De(e) {
  return mo(e, Pi).scalar;
}
function Er(e) {
  const t = De(e);
  try {
    return k(t);
  } finally {
    E(t);
  }
}
function Si(e, t) {
  if (t.length !== 32)
    throw new Error("vault_sudo_key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("connection_vault_root must be exactly 32 bytes.");
  return Ht(Wn(Ri), Me(e, t));
}
function Pr(e, t) {
  const n = mt(t);
  return Ye(e, Me(ne(Ki), new Uint8Array([0]), n), 32);
}
function Ni() {
  return T(te(16));
}
function mt(e) {
  const t = re(e);
  if (t.length !== 16)
    throw new Error("connection_id must decode to exactly 16 bytes (§CV7).");
  return t;
}
function Kr(e) {
  return mt(e), `${Nt}${e}`;
}
function Rr(e) {
  if (!e.startsWith(Nt))
    return null;
  const t = e.slice(Nt.length);
  try {
    return mt(t), t;
  } catch {
    return null;
  }
}
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function Ci(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
function _n(e) {
  if (typeof e != "boolean")
    throw new TypeError(`boolean expected, not ${e}`);
}
function Et(e) {
  if (typeof e != "number")
    throw new TypeError("number expected, got " + typeof e);
  if (!Number.isSafeInteger(e) || e < 0)
    throw new RangeError("positive integer expected, got " + e);
}
function B(e, t, n = "") {
  const r = Ci(e), o = e?.length, i = t !== void 0;
  if (!r || i && o !== t) {
    const a = n && `"${n}" `, s = i ? ` of length ${t}` : "", c = r ? `length=${o}` : `type=${typeof e}`, l = a + "expected Uint8Array" + s + ", got " + c;
    throw r ? new RangeError(l) : new TypeError(l);
  }
  return e;
}
function U(e) {
  return new Uint32Array(e.buffer, e.byteOffset, Math.floor(e.byteLength / 4));
}
function Pe(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
const oe = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68, xi = (e) => e << 24 & 4278190080 | e << 8 & 16711680 | e >>> 8 & 65280 | e >>> 24 & 255, Ti = (e) => {
  for (let t = 0; t < e.length; t++)
    e[t] = xi(e[t]);
  return e;
}, $ = oe ? (e) => e : Ti;
function Ii(e, t) {
  return !e.byteLength || !t.byteLength ? !1 : e.buffer === t.buffer && // best we can do, may fail with an obscure Proxy
  e.byteOffset < t.byteOffset + t.byteLength && // a starts before b end
  t.byteOffset < e.byteOffset + e.byteLength;
}
function Ar(e, t) {
  if (Ii(e, t) && e.byteOffset < t.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function Li(e, t) {
  if (t == null || typeof t != "object")
    throw new Error("options must be defined");
  return Object.assign(e, t);
}
const Ui = /* @__NO_SIDE_EFFECTS__ */ (e, t) => {
  function n(r, ...o) {
    if (B(r, void 0, "key"), e.nonceLength !== void 0) {
      const u = o[0];
      B(u, e.varSizeNonce ? void 0 : e.nonceLength, "nonce");
    }
    const i = e.tagLength;
    i && o[1] !== void 0 && B(o[1], void 0, "AAD");
    const a = t(r, ...o), s = (u, d) => {
      if (d !== void 0) {
        if (u !== 2)
          throw new Error("cipher output not supported");
        B(d, void 0, "output");
      }
    };
    let c = !1;
    return {
      encrypt(u, d) {
        if (c)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return c = !0, B(u), s(a.encrypt.length, d), a.encrypt(u, d);
      },
      decrypt(u, d) {
        if (B(u), i && u.length < i)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + i);
        return s(a.decrypt.length, d), a.decrypt(u, d);
      }
    };
  }
  return Object.assign(n, e), n;
};
function an(e, t, n = !0) {
  if (t === void 0)
    return new Uint8Array(e);
  if (B(t, void 0, "output"), t.length !== e)
    throw new Error('"output" expected Uint8Array of length ' + e + ", got: " + t.length);
  if (n && !ce(t))
    throw new Error("invalid output, must be aligned");
  return t;
}
function ce(e) {
  return e.byteOffset % 4 === 0;
}
function me(e) {
  return Uint8Array.from(B(e));
}
const Sr = (e) => Uint8Array.from(e.split(""), (t) => t.charCodeAt(0)), Oi = $(U(Sr("expand 16-byte k"))), Mi = $(U(Sr("expand 32-byte k")));
function _(e, t) {
  return e << t | e >>> 32 - t;
}
const Ve = 64, Di = 16, Ct = 2 ** 32 - 1, En = /* @__PURE__ */ Uint32Array.of();
function Vi(e, t, n, r, o, i, a, s) {
  const c = o.length, l = new Uint8Array(Ve), u = U(l), d = oe && ce(o) && ce(i), g = d ? U(o) : En, f = d ? U(i) : En;
  if (!oe) {
    for (let w = 0; w < c; a++) {
      if (e(t, n, r, u, a, s), $(u), a >= Ct)
        throw new Error("arx: counter overflow");
      const p = Math.min(Ve, c - w);
      for (let v = 0, h; v < p; v++)
        h = w + v, i[h] = o[h] ^ l[v];
      w += p;
    }
    return;
  }
  for (let w = 0; w < c; a++) {
    if (e(t, n, r, u, a, s), a >= Ct)
      throw new Error("arx: counter overflow");
    const p = Math.min(Ve, c - w);
    if (d && p === Ve) {
      const v = w / 4;
      if (w % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let h = 0, b; h < Di; h++)
        b = v + h, f[b] = g[b] ^ u[h];
      w += Ve;
      continue;
    }
    for (let v = 0, h; v < p; v++)
      h = w + v, i[h] = o[h] ^ l[v];
    w += p;
  }
}
function qi(e, t) {
  const { allowShortKeys: n, extendNonceFn: r, counterLength: o, counterRight: i, rounds: a } = Li({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, t);
  if (typeof e != "function")
    throw new Error("core must be a function");
  return Et(o), Et(a), _n(i), _n(n), (s, c, l, u, d = 0) => {
    B(s, void 0, "key"), B(c, void 0, "nonce"), B(l, void 0, "data");
    const g = l.length;
    if (u = an(g, u, !1), Et(d), d < 0 || d >= Ct)
      throw new Error("arx: counter overflow");
    const f = [];
    let w = s.length, p, v;
    if (w === 32)
      f.push(p = me(s)), v = Mi;
    else if (w === 16 && n)
      p = new Uint8Array(32), p.set(s), p.set(s, 16), v = Oi, f.push(p);
    else
      throw B(s, 32, "arx key"), new Error("invalid key size");
    (!oe || !ce(c)) && f.push(c = me(c));
    let h = U(p);
    if (r) {
      if (c.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const P = c.subarray(0, 16);
      if (oe)
        r(v, h, U(P), h);
      else {
        const O = $(Uint32Array.from(v));
        r(O, h, U(P), h), Pe(O), $(h);
      }
      c = c.subarray(16);
    } else oe || $(h);
    const b = 16 - o;
    if (b !== c.length)
      throw new Error(`arx: nonce must be ${b} or 16 bytes`);
    if (b !== 12) {
      const P = new Uint8Array(12);
      P.set(c, i ? 0 : 12 - c.length), c = P, f.push(c);
    }
    const m = $(U(c));
    try {
      return Vi(e, v, h, m, l, u, d, a), u;
    } finally {
      Pe(...f);
    }
  };
}
function Bi(e, t, n, r, o, i = 20) {
  let a = e[0], s = e[1], c = e[2], l = e[3], u = t[0], d = t[1], g = t[2], f = t[3], w = t[4], p = t[5], v = t[6], h = t[7], b = o, m = n[0], P = n[1], O = n[2], R = a, N = s, S = c, I = l, M = u, D = d, L = g, j = f, F = w, G = p, H = v, z = h, J = b, Y = m, X = P, Q = O;
  for (let pn = 0; pn < i; pn += 2)
    R = R + M | 0, J = _(J ^ R, 16), F = F + J | 0, M = _(M ^ F, 12), R = R + M | 0, J = _(J ^ R, 8), F = F + J | 0, M = _(M ^ F, 7), N = N + D | 0, Y = _(Y ^ N, 16), G = G + Y | 0, D = _(D ^ G, 12), N = N + D | 0, Y = _(Y ^ N, 8), G = G + Y | 0, D = _(D ^ G, 7), S = S + L | 0, X = _(X ^ S, 16), H = H + X | 0, L = _(L ^ H, 12), S = S + L | 0, X = _(X ^ S, 8), H = H + X | 0, L = _(L ^ H, 7), I = I + j | 0, Q = _(Q ^ I, 16), z = z + Q | 0, j = _(j ^ z, 12), I = I + j | 0, Q = _(Q ^ I, 8), z = z + Q | 0, j = _(j ^ z, 7), R = R + D | 0, Q = _(Q ^ R, 16), H = H + Q | 0, D = _(D ^ H, 12), R = R + D | 0, Q = _(Q ^ R, 8), H = H + Q | 0, D = _(D ^ H, 7), N = N + L | 0, J = _(J ^ N, 16), z = z + J | 0, L = _(L ^ z, 12), N = N + L | 0, J = _(J ^ N, 8), z = z + J | 0, L = _(L ^ z, 7), S = S + j | 0, Y = _(Y ^ S, 16), F = F + Y | 0, j = _(j ^ F, 12), S = S + j | 0, Y = _(Y ^ S, 8), F = F + Y | 0, j = _(j ^ F, 7), I = I + M | 0, X = _(X ^ I, 16), G = G + X | 0, M = _(M ^ G, 12), I = I + M | 0, X = _(X ^ I, 8), G = G + X | 0, M = _(M ^ G, 7);
  let V = 0;
  r[V++] = a + R | 0, r[V++] = s + N | 0, r[V++] = c + S | 0, r[V++] = l + I | 0, r[V++] = u + M | 0, r[V++] = d + D | 0, r[V++] = g + L | 0, r[V++] = f + j | 0, r[V++] = w + F | 0, r[V++] = p + G | 0, r[V++] = v + H | 0, r[V++] = h + z | 0, r[V++] = b + J | 0, r[V++] = m + Y | 0, r[V++] = P + X | 0, r[V++] = O + Q | 0;
}
const Nr = /* @__PURE__ */ qi(Bi, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
}), Cr = 2, xt = 1, xr = 65536, $i = 4294967295, Wi = 132, ji = 99, Tt = 1024 * 1024;
function dt(e, t) {
  const n = Me(new Uint8Array([2]), jt(t)), o = jn.getSharedSecret(e, n, !0).slice(1, 33);
  return Ht(ne("nip44-v2"), o);
}
function Tr(e, t) {
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
function sn(e) {
  if (e <= 32)
    return 32;
  const t = 2 ** Math.floor(Math.log2(e - 1) + 1), n = t <= 256 ? 32 : t / 8;
  return n * (Math.floor((e - 1) / n) + 1);
}
const Ir = 39 + sn(Tt) + 32, Fi = Math.ceil(Ir / 3) * 4;
function Gi(e) {
  if (e < xr) {
    const n = new Uint8Array(2);
    return new DataView(n.buffer).setUint16(0, e, !1), n;
  }
  const t = new Uint8Array(6);
  return new DataView(t.buffer).setUint32(2, e, !1), t;
}
function Hi(e) {
  const t = e.length;
  if (t < xt || t > Tt)
    throw new Error(`NIP-44 plaintext length must be between ${xt} and ${Tt} bytes on this platform.`);
  const n = Gi(t), r = sn(t), o = new Uint8Array(n.length + r);
  return o.set(n, 0), o.set(e, n.length), o;
}
function zi(e) {
  const t = new DataView(e.buffer, e.byteOffset, e.byteLength), n = t.getUint16(0, !1);
  let r, o;
  if (n === 0) {
    if (r = t.getUint32(2, !1), o = 6, r < xr)
      throw new Error("NIP-44 payload has inconsistent padding.");
  } else
    r = n, o = 2;
  if (r < xt || r > $i || e.length !== o + sn(r))
    throw new Error("NIP-44 payload has inconsistent padding.");
  return e.slice(o, o + r);
}
function Lr(e, t, n) {
  return $t(Wt, e, Me(t, n));
}
function It(e, t) {
  return Ji(e, t, te(32));
}
function Ji(e, t, n) {
  if (n.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const { chachaKey: r, chachaNonce: o, hmacKey: i } = Tr(e, n), a = Hi(ne(t)), s = Nr(r, o, a), c = Lr(i, n, s);
  return Ce.encode(Me(new Uint8Array([Cr]), n, s, c));
}
function cn(e, t) {
  if (t.startsWith("#"))
    throw new Error("Unsupported NIP-44 non-base64 encoding.");
  if (t.length < Wi || t.length > Fi)
    throw new Error("NIP-44 payload size is outside this platform's supported range.");
  const n = Ce.decode(t);
  if (n.length < ji || n.length > Ir)
    throw new Error("NIP-44 decoded payload size is outside this platform's supported range.");
  if (n[0] !== Cr)
    throw new Error(`Unsupported NIP-44 version: ${n[0]}`);
  const r = n.slice(1, 33);
  if (r.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const o = n.slice(n.length - 32), i = n.slice(33, n.length - 32), { chachaKey: a, chachaNonce: s, hmacKey: c } = Tr(e, r), l = Lr(c, r, i);
  if (!ko(o, l))
    throw new Error("NIP-44 MAC verification failed: payload is corrupted, tampered, or uses the wrong key.");
  const u = Nr(a, s, i);
  return vt(zi(u));
}
const ve = 16, Yi = 283;
function Xi(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function ln(e) {
  return e << 1 ^ Yi & -(e >> 7);
}
function Se(e, t) {
  let n = 0;
  for (; t > 0; t >>= 1)
    n ^= e & -(t & 1), e = ln(e);
  return n;
}
const Lt = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let n = 0, r = 1; n < 256; n++, r ^= ln(r))
    e[n] = r;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let n = 0; n < 255; n++) {
    let r = e[255 - n];
    r |= r << 8, t[e[n]] = (r ^ r >> 4 ^ r >> 5 ^ r >> 6 ^ r >> 7 ^ 99) & 255;
  }
  return Pe(e), t;
})(), Qi = /* @__PURE__ */ Lt.map((e, t) => Lt.indexOf(t)), Zi = (e) => e << 24 | e >>> 8, Pt = (e) => e << 8 | e >>> 24;
function Ur(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const n = new Uint32Array(256).map((l, u) => t(e[u])), r = n.map(Pt), o = r.map(Pt), i = o.map(Pt), a = new Uint32Array(256 * 256), s = new Uint32Array(256 * 256), c = new Uint16Array(256 * 256);
  for (let l = 0; l < 256; l++)
    for (let u = 0; u < 256; u++) {
      const d = l * 256 + u;
      a[d] = n[l] ^ r[u], s[d] = o[l] ^ i[u], c[d] = e[l] << 8 | e[u];
    }
  return { sbox: e, sbox2: c, T0: n, T1: r, T2: o, T3: i, T01: a, T23: s };
}
const un = /* @__PURE__ */ Ur(Lt, (e) => Se(e, 3) << 24 | e << 16 | e << 8 | Se(e, 2)), Or = /* @__PURE__ */ Ur(Qi, (e) => Se(e, 11) << 24 | Se(e, 13) << 16 | Se(e, 9) << 8 | Se(e, 14)), ea = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, n = 1; t < 16; t++, n = ln(n))
    e[t] = n;
  return e;
})();
function Mr(e) {
  B(e);
  const t = e.length;
  Xi(e);
  const { sbox2: n } = un, r = [];
  (!oe || !ce(e)) && r.push(e = me(e));
  const o = $(U(e)), i = o.length, a = (c) => ae(n, c, c, c, c), s = new Uint32Array(t + 28);
  s.set(o);
  for (let c = i; c < s.length; c++) {
    let l = s[c - 1];
    c % i === 0 ? l = a(Zi(l)) ^ ea[c / i - 1] : i > 6 && c % i === 4 && (l = a(l)), s[c] = s[c - i] ^ l;
  }
  return Pe(...r), s;
}
function ta(e) {
  const t = Mr(e), n = t.slice(), r = t.length, { sbox2: o } = un, { T0: i, T1: a, T2: s, T3: c } = Or;
  for (let l = 0; l < r; l += 4)
    for (let u = 0; u < 4; u++)
      n[l + u] = t[r - l - 4 + u];
  Pe(t);
  for (let l = 4; l < r - 4; l++) {
    const u = n[l], d = ae(o, u, u, u, u);
    n[l] = i[d & 255] ^ a[d >>> 8 & 255] ^ s[d >>> 16 & 255] ^ c[d >>> 24];
  }
  return n;
}
function fe(e, t, n, r, o, i) {
  return e[n << 8 & 65280 | r >>> 8 & 255] ^ t[o >>> 8 & 65280 | i >>> 24 & 255];
}
function ae(e, t, n, r, o) {
  return e[t & 255 | n & 65280] | e[r >>> 16 & 255 | o >>> 16 & 65280] << 16;
}
function Pn(e, t, n, r, o) {
  const { sbox2: i, T01: a, T23: s } = un;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const l = e.length / 4 - 2;
  for (let w = 0; w < l; w++) {
    const p = e[c++] ^ fe(a, s, t, n, r, o), v = e[c++] ^ fe(a, s, n, r, o, t), h = e[c++] ^ fe(a, s, r, o, t, n), b = e[c++] ^ fe(a, s, o, t, n, r);
    t = p, n = v, r = h, o = b;
  }
  const u = e[c++] ^ ae(i, t, n, r, o), d = e[c++] ^ ae(i, n, r, o, t), g = e[c++] ^ ae(i, r, o, t, n), f = e[c++] ^ ae(i, o, t, n, r);
  return { s0: u, s1: d, s2: g, s3: f };
}
function na(e, t, n, r, o) {
  const { sbox2: i, T01: a, T23: s } = Or;
  let c = 0;
  t ^= e[c++], n ^= e[c++], r ^= e[c++], o ^= e[c++];
  const l = e.length / 4 - 2;
  for (let w = 0; w < l; w++) {
    const p = e[c++] ^ fe(a, s, t, o, r, n), v = e[c++] ^ fe(a, s, n, t, o, r), h = e[c++] ^ fe(a, s, r, n, t, o), b = e[c++] ^ fe(a, s, o, r, n, t);
    t = p, n = v, r = h, o = b;
  }
  const u = e[c++] ^ ae(i, t, o, r, n), d = e[c++] ^ ae(i, n, t, o, r), g = e[c++] ^ ae(i, r, n, t, o), f = e[c++] ^ ae(i, o, r, n, t);
  return { s0: u, s1: d, s2: g, s3: f };
}
function ra(e) {
  if (B(e), e.length % ve !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + ve);
}
function oa(e, t, n) {
  B(e);
  let r = e.length;
  const o = r % ve;
  if (!t && o !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (t) {
    let s = ve - o;
    s || (s = ve), r = r + s;
  }
  n = an(r, n), Ar(e, n), (!oe || !ce(e)) && (e = me(e));
  const i = U(e);
  $(i);
  const a = U(n);
  return { b: i, o: a, out: n };
}
function ia(e, t) {
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
function aa(e) {
  const t = new Uint8Array(16), n = U(t);
  t.set(e);
  const r = ve - e.length;
  for (let o = ve - r; o < ve; o++)
    t[o] = r;
  return n;
}
const Dr = /* @__PURE__ */ Ui({ blockSize: 16, nonceLength: 16 }, function(t, n, r = {}) {
  const o = !r.disablePadding;
  return {
    encrypt(i, a) {
      const s = Mr(t), { b: c, o: l, out: u } = oa(i, o, a);
      let d = n;
      const g = [s];
      (!oe || !ce(d)) && g.push(d = me(d));
      const f = U(d);
      $(f);
      let w = f[0], p = f[1], v = f[2], h = f[3], b = 0;
      for (; b + 4 <= c.length; )
        w ^= c[b + 0], p ^= c[b + 1], v ^= c[b + 2], h ^= c[b + 3], { s0: w, s1: p, s2: v, s3: h } = Pn(s, w, p, v, h), l[b++] = w, l[b++] = p, l[b++] = v, l[b++] = h;
      if (o) {
        const m = aa(i.subarray(b * 4));
        $(m), w ^= m[0], p ^= m[1], v ^= m[2], h ^= m[3], { s0: w, s1: p, s2: v, s3: h } = Pn(s, w, p, v, h), l[b++] = w, l[b++] = p, l[b++] = v, l[b++] = h;
      }
      return $(l), Pe(...g), u;
    },
    decrypt(i, a) {
      ra(i);
      const s = ta(t);
      let c = n;
      const l = [s];
      (!oe || !ce(c)) && l.push(c = me(c));
      const u = U(c);
      $(u), a = an(i.length, a), Ar(i, a), (!oe || !ce(i)) && l.push(i = me(i));
      const d = U(i), g = U(a);
      $(d);
      let f = u[0], w = u[1], p = u[2], v = u[3];
      for (let h = 0; h + 4 <= d.length; ) {
        const b = f, m = w, P = p, O = v;
        f = d[h + 0], w = d[h + 1], p = d[h + 2], v = d[h + 3];
        const { s0: R, s1: N, s2: S, s3: I } = na(s, f, w, p, v);
        g[h++] = R ^ b, g[h++] = N ^ m, g[h++] = S ^ P, g[h++] = I ^ O;
      }
      return $(g), Pe(...l), ia(a, o);
    }
  };
});
function Vr(e, t) {
  const n = Me(new Uint8Array([2]), jt(t));
  return jn.getSharedSecret(e, n, !0).slice(1, 33);
}
function sa(e, t, n) {
  return ca(e, t, n, te(16));
}
function ca(e, t, n, r) {
  if (r.length !== 16)
    throw new Error("NIP-04 iv must be exactly 16 bytes.");
  const o = Vr(e, t), i = Dr(o, r).encrypt(ne(n));
  return `${Ce.encode(i)}?iv=${Ce.encode(r)}`;
}
function la(e, t, n) {
  const r = n.indexOf("?iv=");
  if (r === -1)
    throw new Error('NIP-04 payload is missing its "?iv=" suffix.');
  const o = Ce.decode(n.slice(0, r)), i = Ce.decode(n.slice(r + 4)), a = Vr(e, t), s = Dr(a, i).decrypt(o);
  return vt(s);
}
class ye {
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
    return this.assertAlive(), ee({
      pubkey: this.publicKeyHex,
      created_at: t.created_at ?? Math.floor(Date.now() / 1e3),
      kind: t.kind,
      tags: t.tags ?? [],
      content: t.content
    }, this.privateKey);
  }
  nip44Encrypt(t, n) {
    return this.assertAlive(), It(dt(this.privateKey, t), n);
  }
  nip44Decrypt(t, n) {
    return this.assertAlive(), cn(dt(this.privateKey, t), n);
  }
  /** Legacy relative to nip44Encrypt above, but still what a real NIP-07 extension exposes as
   * window.nostr.nip04.encrypt -- implemented for drop-in parity. */
  nip04Encrypt(t, n) {
    return this.assertAlive(), sa(this.privateKey, t, n);
  }
  nip04Decrypt(t, n) {
    return this.assertAlive(), la(this.privateKey, t, n);
  }
  /** Best-practical secret wipe (§11.10, §21.4): overwrites the private key buffer in place. */
  destroy() {
    E(this.privateKey), this.destroyed = !0;
  }
}
const Qe = null, qr = [
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
], Br = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.primal.net",
  // Added 2026-11-18: relay.nostr.band timed out and nostr-pub.wellorder.net
  // never connected in the same measurement, leaving two working lookups.
  "wss://nos.lol"
], ua = [], ya = /^[0-9a-f]{64}$/u, da = 64;
function Kt(e) {
  return Array.isArray(e) && e.length <= da && e.every((t) => typeof t == "string" && Xe(t)) && new Set(e).size === e.length;
}
function kt(e, t = Qe, n = -1) {
  if (!t || !ya.test(t) || /^0{64}$/u.test(t) || !q(e) || e.pubkey !== t || e.kind !== W || Oe(e, "d") !== Fn)
    return null;
  try {
    const r = JSON.parse(e.content);
    if (typeof r != "object" || r === null || Array.isArray(r))
      return null;
    const o = r;
    return !Number.isSafeInteger(o.version) || o.version < 1 || o.version <= n || !Kt(o.vaultRelays) || !Kt(o.discoveryRelays) || o.deprecated !== void 0 && !Kt(o.deprecated) ? null : {
      version: o.version,
      vaultRelays: o.vaultRelays,
      discoveryRelays: o.discoveryRelays,
      ...o.deprecated === void 0 ? {} : { deprecated: o.deprecated }
    };
  } catch {
    return null;
  }
}
function ha(e) {
  return Math.max(0, e - 1);
}
function Kn(e, t, n) {
  const r = t ? n === "vault" ? t.vaultRelays : t.discoveryRelays : [], o = new Set(t?.deprecated ?? []), i = new Set(e), a = [...new Set(r)].filter((s) => !o.has(s) && !i.has(s)).slice(0, ha(e.length));
  return [...e, ...a];
}
async function fa(e, t = Qe, n = -1, r = 6e3) {
  if (!t || e.length === 0)
    return null;
  const o = new K([...e]);
  let i;
  try {
    i = (await o.queryQuorum({ kinds: [W], authors: [t], "#d": [Fn], limit: 3 }, r)).outcomes.flatMap((c) => c.events);
  } finally {
    o.closeAll();
  }
  let a = null;
  for (const s of i) {
    const c = kt(s, t, n);
    c && (!a || c.version > a.list.version) && (a = { event: s, list: c });
  }
  return a;
}
const $r = "bitlogin:bootstrap-relays:v1";
async function Wr(e, t = Qe) {
  if (!t)
    return null;
  try {
    const n = await e.get($r);
    return n ? kt(JSON.parse(n), t) : null;
  } catch {
    return null;
  }
}
function at(e) {
  return {
    vaultRelays: Kn(qr, e, "vault"),
    discoveryRelays: Kn(Br, e, "discovery"),
    listVersion: e?.version ?? null
  };
}
async function pa(e, t = {}) {
  const n = t.maintainerPubkeyHex === void 0 ? Qe : t.maintainerPubkeyHex, r = await Wr(e, n);
  if (!n)
    return at(null);
  const o = at(r), i = r?.version ?? -1;
  try {
    let a = await fa(t.queryRelayUrls ?? [.../* @__PURE__ */ new Set([...o.vaultRelays, ...o.discoveryRelays])], n, i, t.timeoutMs);
    if (!a) {
      const s = await va(t.httpsFallbackUrls ?? ua, n, i), c = s ? kt(s, n, i) : null;
      s && c && (a = { event: s, list: c });
    }
    return a ? (await e.set($r, JSON.stringify(a.event)), at(a.list)) : o;
  } catch {
    return o;
  }
}
async function va(e, t = Qe, n = -1) {
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
      if (q(s) && kt(s, t, n))
        return s;
    } catch {
    }
  return null;
}
const yn = /^[0-9a-f]{64}$/u, ga = 8, wa = 4096, ba = 256, ma = 512;
class Ke extends Error {
  name = "BunkerUriParseError";
}
class ka extends Error {
  name = "Nip46RequestTimeoutError";
  constructor(t, n) {
    super(`The remote signer did not answer ${t} within ${Math.round(n / 1e3)}s. It may be offline, or waiting for your approval on another device -- check your signer and try again.`);
  }
}
class _a extends Error {
  name = "Nip46ErrorResponse";
}
function Ea(e) {
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return null;
  }
  const n = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol === "https:" || t.protocol === "http:" && n ? t.toString() : null;
}
function Pa(e) {
  if (e.length > wa)
    throw new Ke("That bunker URI is unreasonably long.");
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    throw new Ke("That doesn't look like a valid URI.");
  }
  if (t.protocol !== "bunker:")
    throw new Ke("A remote-signer URI must start with bunker://");
  const n = (t.host || t.pathname.replace(/^\/+/u, "")).toLowerCase();
  if (!yn.test(n))
    throw new Ke("The bunker URI does not name a valid signer public key.");
  const r = [
    ...new Set(t.searchParams.getAll("relay").map((i) => i.trim()).filter((i) => i.length > 0 && i.length <= ma))
  ].slice(0, ga);
  if (r.length === 0)
    throw new Ke("The bunker URI names no relays -- without at least one relay= parameter there is no way to reach the signer.");
  const o = t.searchParams.get("secret") ?? void 0;
  if (o && o.length > ba)
    throw new Ke("The bunker URI's secret is unreasonably long.");
  return { signerPubkey: n, relayUrls: r, secret: o || void 0 };
}
function Ka(e) {
  if (!yn.test(e.clientPubkey))
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
const Ra = 12e4;
class Rn {
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
    this.clientSecretKey = t.clientSecretKey, this.clientPubkey = k(t.clientSecretKey), this.pointer = t.pointer, this.conversationKey = dt(t.clientSecretKey, t.pointer.signerPubkey), this.onAuthUrl = t.onAuthUrl, this.requestTimeoutMs = t.requestTimeoutMs ?? Ra, this.conns = t.pointer.relayUrls.map((n) => new Yt(n, { authPrivateKey: t.clientSecretKey }));
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
      n = JSON.parse(cn(this.conversationKey, t.content));
    } catch {
      return;
    }
    if (typeof n.id != "string")
      return;
    const r = this.pending.get(n.id);
    if (r) {
      if (n.result === "auth_url") {
        if (!r.authUrlSeen && typeof n.error == "string" && n.error) {
          const o = Ea(n.error);
          o && (r.authUrlSeen = !0, this.onAuthUrl?.(o));
        }
        return;
      }
      if (this.pending.delete(n.id), clearTimeout(r.timer), typeof n.error == "string" && n.error) {
        r.reject(new _a(n.error));
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
    const r = We(te(8)), o = It(this.conversationKey, JSON.stringify({ id: r, method: t, params: n })), i = [["p", this.pointer.signerPubkey]], a = ee({
      pubkey: this.clientPubkey,
      created_at: Math.floor(Date.now() / 1e3),
      kind: rt,
      tags: i,
      content: o
    }, this.clientSecretKey), s = new Promise((u, d) => {
      const g = setTimeout(() => {
        this.pending.delete(r), d(new ka(t, this.requestTimeoutMs));
      }, this.requestTimeoutMs);
      this.pending.set(r, { resolve: u, reject: d, timer: g, authUrlSeen: !1 });
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
    if (!yn.test(t))
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
    if (!q(o))
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
      const t = We(te(8)), n = It(this.conversationKey, JSON.stringify({ id: t, method: "logout", params: [] }));
      return ee({
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
async function Aa(e) {
  const t = k(e.clientSecretKey), n = e.timeoutMs, r = e.relayUrls.map((i) => new Yt(i, { authPrivateKey: e.clientSecretKey })), o = () => {
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
    const d = { kinds: [rt], "#p": [t] }, g = (f) => {
      let w, p = null;
      try {
        p = dt(e.clientSecretKey, f.pubkey), w = JSON.parse(cn(p, f.content));
      } catch {
        return;
      } finally {
        p && E(p);
      }
      w.result === e.secret && l({ signerPubkey: f.pubkey });
    };
    Promise.allSettled(r.map((f) => f.subscribeLive(d, g))).then((f) => {
      f.some((w) => w.status === "fulfilled") || l(new Error("Could not reach any relay to listen for the signer."));
    });
  });
}
const jr = "bitlogin.connection.v1", Fr = "bitlogin.connection.nwc.v1", An = 120, Sa = /* @__PURE__ */ new Set(["active", "suspended", "deleted"]), Na = /* @__PURE__ */ new Set(["connectable", "personal"]);
class Re extends Error {
  constructor(t) {
    super(t), this.name = "ConnectionRecordError";
  }
}
function Gr(e, t) {
  return ne(`bitlogin|connection-record|v1|${e}|30078|${t}`);
}
function Hr(e) {
  const t = e, n = (i) => {
    throw new Re(i);
  };
  (!t || typeof t != "object") && n("Connection record must be an object."), t.schema !== jr && n("Unsupported connection record schema (§CV8.3)."), typeof t.connection_id != "string" && n("connection_id must be a string (§CV7)."), (typeof t.connection_type != "string" || t.connection_type.length === 0) && n("connection_type must be a non-empty string (§CV8.3)."), Na.has(t.tier) || n("tier must be connectable or personal."), Sa.has(t.state) || n("state must be active, suspended, or deleted (§CV8.3)."), (typeof t.label != "string" || t.label.length > An) && n(`label must be a string of at most ${An} characters.`), (!Number.isInteger(t.created_at) || !Number.isInteger(t.updated_at)) && n("created_at and updated_at must be integers (§CV8.3).");
  const r = t.credential;
  (!r || typeof r != "object" || typeof r.schema != "string") && n("credential must be an object naming its profile schema (§CV8.3).");
  const o = t.application_binding;
  (!o || typeof o != "object" || o.origin !== null && typeof o.origin != "string" || o.app_pubkey !== null && typeof o.app_pubkey != "string") && n("application_binding must carry origin and app_pubkey (string or null)."), t.notes !== null && typeof t.notes != "string" && n("notes must be a string or null.");
}
async function Rt(e) {
  Hr(e.record);
  const t = De(e.vaultPrk), n = k(t), r = Kr(e.record.connection_id), o = Pr(e.recordPrk, e.record.connection_id), i = await Qt(e.record, o, Gr(n, r));
  return ee({
    pubkey: n,
    created_at: Ge(e.previousCreatedAt, e.now),
    kind: W,
    tags: [["d", r]],
    content: JSON.stringify(i)
  }, t);
}
async function Ca(e, t, n) {
  if (!q(e))
    throw new Re("Connection record event has an invalid id or signature.");
  const r = k(De(t));
  if (e.pubkey !== r)
    throw new Re("Connection record event is not signed by this vault's identity.");
  const o = Oe(e, "d") ?? "", i = Rr(o);
  if (i === null)
    throw new Re("Connection record event has a malformed d tag.");
  const a = JSON.parse(e.content), s = Gr(e.pubkey, o), c = [
    { prk: t, tier: "connectable" },
    ...n ? [{ prk: n, tier: "personal" }] : []
  ];
  for (const l of c) {
    let u;
    try {
      u = await Zt(a, Pr(l.prk, i), s);
    } catch {
      continue;
    }
    if (Hr(u), u.connection_id !== i)
      throw new Re("Connection record id does not match its d tag.");
    if (u.tier !== l.tier)
      throw new Re("Connection record tier does not match the key that decrypted it.");
    return { record: u, tier: l.tier, event: e };
  }
  return null;
}
function xa(e, t) {
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
function Sn(e) {
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
    schema: Fr,
    wallet_pubkey: r,
    relays: o,
    secret: a,
    lud16: s,
    extra_params: i
  };
}
function Ta(e) {
  zr(e);
  const t = new URLSearchParams();
  for (const n of e.relays)
    t.append("relay", n);
  t.append("secret", e.secret), e.lud16 !== null && t.append("lud16", e.lud16);
  for (const [n, r] of e.extra_params)
    t.append(n, r);
  return `nostr+walletconnect://${e.wallet_pubkey}?${t.toString()}`;
}
function Ia(e, t) {
  return e.wallet_pubkey === t.wallet_pubkey && e.secret === t.secret;
}
function zr(e) {
  const t = e, n = (r) => {
    throw new le(r);
  };
  (!t || typeof t != "object") && n("NWC credential must be an object."), t.schema !== Fr && n("NWC credential has the wrong schema."), (typeof t.wallet_pubkey != "string" || !ht.test(t.wallet_pubkey)) && n("NWC credential wallet_pubkey must be 64-char lowercase hex."), (!Array.isArray(t.relays) || t.relays.length === 0 || t.relays.some((r) => typeof r != "string")) && n("NWC credential must name at least one relay."), t.relays.some((r) => !Xe(r)) && n("NWC relays must use secure WebSockets, except for explicit loopback development endpoints."), (typeof t.secret != "string" || !ht.test(t.secret)) && n("NWC credential secret must be 64-char lowercase hex."), t.lud16 !== null && typeof t.lud16 != "string" && n("NWC credential lud16 must be a string or null."), (!Array.isArray(t.extra_params) || t.extra_params.some((r) => !Array.isArray(r) || r.length !== 2 || typeof r[0] != "string" || typeof r[1] != "string")) && n("NWC credential extra_params must be [key, value] string pairs.");
}
const La = "bitlogin:vault-hwm:v2:", Ua = "bitlogin/vault-hwm-index/v2", Jr = "bitlogin/vault-hwm-encryption/v2", Oa = /^[0-9a-f]{64}$/u;
class pe extends Error {
  constructor() {
    super("The local Connection Vault rollback marker is invalid or has been tampered with."), this.name = "RecordHighWaterMarkError";
  }
}
function dn(e) {
  if (!e || typeof e != "object")
    return !1;
  const t = e;
  return Number.isInteger(t.createdAt) && (t.createdAt ?? -1) >= 0 && typeof t.eventId == "string" && Oa.test(t.eventId);
}
function Yr(e, t) {
  mt(t);
  const n = Ye(e, Ua, 32), r = ne(t);
  try {
    return `${La}${T($t(Wt, n, r))}`;
  } finally {
    E(n, r);
  }
}
function Ma(e, t) {
  return `bitlogin:vault-hwm:${Er(e)}:${t}`;
}
async function Da(e, t, n) {
  const r = Ye(e, Jr, 32), o = ne(JSON.stringify(n)), i = ne(t);
  try {
    const a = await Yn(r, o, i), s = {
      v: 2,
      nonce: T(a.nonce),
      ciphertext: T(a.ciphertext)
    };
    return JSON.stringify(s);
  } finally {
    E(r, o, i);
  }
}
async function Va(e, t, n) {
  const r = Ye(e, Jr, 32), o = ne(t);
  let i;
  try {
    const a = JSON.parse(n);
    if (a.v !== 2 || typeof a.nonce != "string" || typeof a.ciphertext != "string")
      throw new pe();
    i = await Xn(r, re(a.nonce), re(a.ciphertext), o);
    const s = JSON.parse(vt(i));
    if (!dn(s))
      throw new pe();
    return s;
  } catch (a) {
    throw a instanceof pe ? a : new pe();
  } finally {
    E(r, o), i && E(i);
  }
}
async function Xr(e, t, n, r) {
  const o = Yr(t, n);
  await e.set(o, await Da(t, o, r));
}
async function Qr(e, t, n) {
  const r = Yr(t, n), o = await e.get(r);
  if (o !== void 0)
    return Va(t, r, o);
  const i = Ma(t, n), a = await e.get(i);
  if (a === void 0)
    return null;
  try {
    const s = JSON.parse(a);
    if (!dn(s))
      throw new pe();
    return await Xr(e, t, n, s), await e.delete(i), s;
  } catch (s) {
    throw s instanceof pe ? s : new pe();
  }
}
async function Zr(e, t, n, r) {
  if (!dn(r))
    throw new pe();
  const o = await Qr(e, t, n);
  o && St({ created_at: r.createdAt, id: r.eventId }, { created_at: o.createdAt, id: o.eventId }) <= 0 || await Xr(e, t, n, r);
}
async function qa(e) {
  const t = De(e.vaultPrk), n = new K(e.relayUrls, { authPrivateKey: t });
  let r;
  try {
    r = await Ee(n, e.event, {
      dTag: Kr(e.connectionId),
      minAcks: e.minAcknowledgements,
      // The readback bar follows the ack bar: a caller publishing to fewer
      // relays (a targeted repair, a test) has already lowered its quorum.
      minReadbacks: e.minAcknowledgements,
      timeoutMs: e.timeoutMs
    });
  } finally {
    n.closeAll(), E(t);
  }
  return r.success && await Zr(e.store, e.vaultPrk, e.connectionId, {
    createdAt: e.event.created_at,
    eventId: e.event.id
  }), r;
}
const Nn = 500;
async function Ba(e) {
  const t = De(e.vaultPrk), n = k(t), r = new K(e.relayUrls, { authPrivateKey: t });
  let o;
  try {
    o = await r.queryQuorum({ kinds: [W], authors: [n], limit: Nn }, e.timeoutMs);
  } finally {
    r.closeAll(), E(t);
  }
  const i = o.outcomes.some((l) => l.events.length >= Nn), a = /* @__PURE__ */ new Map();
  for (const l of o.outcomes.flatMap((u) => u.events)) {
    if (!q(l) || l.pubkey !== n)
      continue;
    const u = Rr(Oe(l, "d") ?? "");
    if (u === null)
      continue;
    const d = a.get(u);
    (!d || St(l, d) > 0) && a.set(u, l);
  }
  const s = /* @__PURE__ */ new Map(), c = [];
  for (const [l, u] of a) {
    const d = await Qr(e.store, e.vaultPrk, l);
    if (d !== null && St(u, {
      created_at: d.createdAt,
      id: d.eventId
    }) < 0) {
      c.push(l);
      continue;
    }
    s.set(l, u), await Zr(e.store, e.vaultPrk, l, {
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
class $a {
  vaultPrk;
  personalPrk = null;
  destroyed = !1;
  connectionVaultRoot;
  vaultPublicKey;
  constructor(t) {
    this.connectionVaultRoot = t.slice(), this.vaultPrk = Ai(this.connectionVaultRoot), this.vaultPublicKey = Er(this.vaultPrk);
  }
  get sudoActive() {
    return this.personalPrk !== null;
  }
  /** Opens a sudo window. Consumes (wipes) the caller's sudo key copy. */
  enableSudo(t) {
    this.endSudo(), this.personalPrk = Si(this.connectionVaultRoot, t), E(t);
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
      schema: jr,
      connection_id: Ni(),
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
    }, o = await Rt({
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
    }, a = await Rt({
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
    const r = n ?? Math.floor(Date.now() / 1e3), o = xa(t.record, r), i = await Rt({
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
    return this.destroyed ? Promise.reject(new Error("This vault session was destroyed; create a new one from the account's root.")) : Ca(t, this.vaultPrk, this.personalPrk ?? void 0);
  }
  /** §CV11 step 3: a NIP-09 deletion request for a replaced record event,
   *  signed by the vault identity. Best-effort by contract — the encrypted
   *  tombstone is the durable part of a deletion, this is the courtesy ask. */
  buildDeletionRequest(t, n) {
    if (this.destroyed)
      throw new Error("This vault session was destroyed; create a new one from the account's root.");
    return _r({
      privateKey: De(this.vaultPrk),
      eventIdToDelete: t,
      deletedEventKind: W,
      createdAt: n ?? Math.floor(Date.now() / 1e3)
    });
  }
  publish(t) {
    return qa({ vaultPrk: this.vaultPrk, ...t });
  }
  fetchEvents(t) {
    return Ba({ vaultPrk: this.vaultPrk, ...t });
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
const Wa = "bitlogin", ue = "kv", ie = "device-keys", ja = 2;
function Fa() {
  return new Promise((e, t) => {
    const n = indexedDB.open(Wa, ja);
    n.onupgradeneeded = () => {
      const r = n.result;
      r.objectStoreNames.contains(ue) || r.createObjectStore(ue), r.objectStoreNames.contains(ie) || r.createObjectStore(ie);
    }, n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
  });
}
class Ga {
  dbPromise = null;
  db() {
    return this.dbPromise || (this.dbPromise = Fa()), this.dbPromise;
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
const ze = "bitlogin:session:v1", hn = "bitlogin:session-device-key:v1";
function Cn(e) {
  let t = "";
  for (const n of e) t += String.fromCharCode(n);
  return btoa(t);
}
function xn(e) {
  const t = atob(e);
  return Uint8Array.from(t, (n) => n.charCodeAt(0));
}
function Tn(e) {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}
function Ha(e) {
  return !!(e && typeof e == "object" && e.v === 2 && typeof e.iv == "string" && typeof e.ciphertext == "string");
}
async function za(e, t) {
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
      await e.delete(ze);
      return;
    }
    const r = await e.getOrCreateDeviceKey(hn), o = crypto.getRandomValues(new Uint8Array(12)), i = new TextEncoder().encode(JSON.stringify(n)), a = await crypto.subtle.encrypt({ name: "AES-GCM", iv: o }, r, i), s = {
      v: 2,
      iv: Cn(o),
      ciphertext: Cn(new Uint8Array(a))
    };
    await e.set(ze, JSON.stringify(s));
  } catch {
  }
}
async function Ja(e) {
  let t;
  try {
    t = await e.get(ze);
  } catch {
    return null;
  }
  if (!t) return null;
  try {
    const n = JSON.parse(t);
    if (!Ha(n) || typeof e.getOrCreateDeviceKey != "function")
      return await e.delete(ze), null;
    const r = await e.getOrCreateDeviceKey(hn), o = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: Tn(xn(n.iv)) },
      r,
      Tn(xn(n.ciphertext))
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
async function Ya(e) {
  try {
    await e.delete(ze), typeof e.deleteDeviceKey == "function" && await e.deleteDeviceKey(hn);
  } catch {
  }
}
const eo = "bitlogin:signer-handoff:v1", Xa = /* @__PURE__ */ new Set([
  "configure",
  "getPublicKey",
  "signEvent",
  "getSessionStatus",
  "logout",
  "handoffBegin",
  "handoffAccept",
  // Remembering a site, so the user is not asked on every page load (signerGrant.ts).
  "signerKeep",
  "signerRestore",
  "signerTouch",
  "signerForget"
]), Ut = /^[0-9a-f]{64}$/;
function Qa(e) {
  return Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
}
function Za(e) {
  return Uint8Array.from(e.match(/.{2}/g) ?? [], (t) => Number.parseInt(t, 16));
}
function es(e, t, n) {
  if (!Ut.test(t)) throw new Error("The hand-off has no usable recipient key.");
  if (e.length !== 32) throw new Error("No identity is unlocked in this session.");
  const r = new ye(n.slice());
  try {
    const o = JSON.stringify({ v: 1, purpose: eo, key: Qa(e) });
    return { senderPublicKey: r.getPublicKey(), payload: r.nip44Encrypt(t, o) };
  } finally {
    r.destroy();
  }
}
function ts(e, t) {
  if (!e || !Ut.test(e.senderPublicKey) || typeof e.payload != "string")
    throw new Error("That is not a signer hand-off.");
  const n = new ye(t.slice());
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
  if (o.v !== 1 || o.purpose !== eo || typeof o.key != "string" || !Ut.test(o.key))
    throw new Error("That is not a signer hand-off.");
  const i = Za(o.key);
  try {
    k(i);
  } catch {
    throw i.fill(0), new Error("The hand-off carried an unusable key.");
  }
  return i;
}
const ft = "bitlogin:signer-grant:v1:", to = "bitlogin:signer-grant-device-key:v1", pt = {
  /** The longest a site is remembered, in seconds: thirty days from Allow. */
  keepSec: 720 * 3600,
  /** How many recent signatures are remembered, to count them across page loads. */
  signedKept: 60
}, ns = /^[0-9a-f]{64}$/u;
function fn(e) {
  if (typeof e != "string" || e.length > 300) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin === e ? t.origin : "";
  } catch {
    return "";
  }
}
const In = (e) => btoa(Array.from(e, (t) => String.fromCharCode(t)).join("")), Ln = (e) => Uint8Array.from(atob(e), (t) => t.charCodeAt(0)), Un = (e) => {
  const t = new Uint8Array(e.byteLength);
  return t.set(e), t.buffer;
}, rs = (e) => Array.from(e, (t) => t.toString(16).padStart(2, "0")).join("");
async function On(e, t, n) {
  const r = fn(t.site);
  if (!r || t.everydayPrivateKey.length !== 32 || typeof e.getOrCreateDeviceKey != "function") return !1;
  const o = Math.min(Math.floor(t.until), Math.floor(n) + pt.keepSec);
  if (!(o > n)) return !1;
  const i = crypto.getRandomValues(new Uint8Array(12));
  try {
    const a = await e.getOrCreateDeviceKey(to), s = JSON.stringify({
      site: r,
      key: rs(t.everydayPrivateKey),
      until: o,
      ...t.name ? { name: t.name.slice(0, 48) } : {},
      signed: t.signed.filter((u) => Number.isFinite(u)).slice(-pt.signedKept)
    }), c = await crypto.subtle.encrypt({ name: "AES-GCM", iv: i }, a, new TextEncoder().encode(s)), l = { v: 1, iv: In(i), ciphertext: In(new Uint8Array(c)) };
    return await e.set(ft + r, JSON.stringify(l)), !0;
  } catch {
    return !1;
  }
}
async function Mn(e, t, n) {
  const r = fn(t);
  if (!r || typeof e.getOrCreateDeviceKey != "function") return null;
  try {
    const o = await e.get(ft + r);
    if (!o) return null;
    const i = JSON.parse(o);
    if (i.v !== 1 || typeof i.iv != "string" || typeof i.ciphertext != "string") return null;
    const a = await e.getOrCreateDeviceKey(to), s = await crypto.subtle.decrypt({ name: "AES-GCM", iv: Un(Ln(i.iv)) }, a, Un(Ln(i.ciphertext))), c = JSON.parse(new TextDecoder().decode(s));
    return c.site !== r || typeof c.key != "string" || !ns.test(c.key) || typeof c.until != "number" ? null : !(c.until > n) || c.until > n + pt.keepSec ? (await e.delete(ft + r), null) : {
      site: r,
      everydayPrivateKey: Uint8Array.from(c.key.match(/.{2}/gu) ?? [], (l) => Number.parseInt(l, 16)),
      until: c.until,
      ...typeof c.name == "string" && c.name ? { name: c.name.slice(0, 48) } : {},
      signed: Array.isArray(c.signed) ? c.signed.filter((l) => typeof l == "number" && Number.isFinite(l)).slice(-pt.signedKept) : []
    };
  } catch {
    return null;
  }
}
async function os(e, t) {
  const n = fn(t);
  if (n)
    try {
      await e.delete(ft + n);
    } catch {
    }
}
const no = "bitlogin:session-public:v1";
async function is(e, t) {
  try {
    const n = {
      pubkey: t.pubkey,
      npub: t.npub,
      ...t.name ? { name: t.name } : {}
    };
    await e.set(no, JSON.stringify(n));
  } catch {
  }
}
async function as(e) {
  try {
    await e.delete(no);
  } catch {
  }
}
class ss {
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
const y = {
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
let ge = null, C = [...qr], Ae = [...Br];
const x = new Ga();
let Ot = !1, Mt = !1;
function Dn(e) {
  Ot || (C = e.vaultRelays), Mt || (Ae = e.discoveryRelays);
}
const cs = new ss();
function Z() {
  if (!y.signer || !y.everydayPrivateKey)
    throw new Error("No identity is unlocked in this session.");
  return { signer: y.signer, everydayPrivateKey: y.everydayPrivateKey };
}
function we() {
  y.signer?.destroy(), y.everydayPrivateKey && y.everydayPrivateKey.fill(0), y.signer = null, y.everydayPrivateKey = null, y.accountId = null, y.recoveryPublicKey = null, y.activeCredentialEvent = null, y.activeRecoveryEvent = null, y.everydayKeyDerived = !1, y.vault?.destroy(), y.vault = null, y.connectionVaultRoot && y.connectionVaultRoot.fill(0), y.connectionVaultRoot = null, y.vaultKnown = !1, y.signerOnly = !1, y.pendingRecovery && (y.pendingRecovery.recoveryPrivateKey.fill(0), y.pendingRecovery.everydayPrivateKey.fill(0), y.pendingRecovery = null);
}
function Vn(e) {
  return we(), y.pendingRecovery = e, y.signer = new ye(e.everydayPrivateKey), y.everydayPrivateKey = e.everydayPrivateKey, y.accountId = e.accountId, y.recoveryPublicKey = e.recoveryPublicKey, y.activeRecoveryEvent = e.currentRecoveryEvent, y.everydayKeyDerived = e.everydayKeyDerived, Dt(
    e.currentRecoveryPayload.connection_vault_root ? re(e.currentRecoveryPayload.connection_vault_root) : void 0
  ), {
    everydayPublicKey: e.everydayPublicKey,
    accountId: e.accountId,
    generalRelays: e.generalRelays,
    dmRelays: e.dmRelays,
    chainWarning: e.chainWarning,
    everydayKeyDerived: e.everydayKeyDerived
  };
}
function Dt(e, t) {
  y.connectionVaultRoot = e ?? null, y.vaultKnown = !0, y.vault = null, t && E(t);
}
async function tt() {
  !y.everydayPrivateKey || !y.accountId || !y.recoveryPublicKey || !y.activeCredentialEvent || !y.activeRecoveryEvent || (await za(x, {
    everydayPrivateKey: y.everydayPrivateKey,
    accountId: y.accountId,
    recoveryPublicKey: y.recoveryPublicKey,
    activeCredentialEvent: y.activeCredentialEvent,
    activeRecoveryEvent: y.activeRecoveryEvent,
    ...y.connectionVaultRoot ? { connectionVaultRoot: y.connectionVaultRoot } : {},
    ...y.vaultKnown ? { vaultEnabled: y.connectionVaultRoot !== null } : {},
    everydayKeyDerived: y.everydayKeyDerived
  }), await ro());
}
async function ro() {
  if (!y.signer) return;
  const e = y.signer.getPublicKey();
  await is(x, { pubkey: e, npub: ot(e) });
}
function qe() {
  try {
    return new URL(self.location.href).origin;
  } catch {
    return "";
  }
}
function Vt() {
  if (!y.signer) throw new Error("No identity is unlocked in this session.");
  if (!y.connectionVaultRoot)
    throw new Error(
      y.vaultKnown ? "This account predates the Connection Vault. Enable it from your BitLogin account manager (recovery phrase required)." : "Sign in again to use wallet connections on this device."
    );
  return y.vault ??= new $a(y.connectionVaultRoot.slice()), y.vault;
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
  const e = Vt(), t = await e.listConnections({ relayUrls: C, store: x });
  return {
    vault: e,
    connections: t.connections.filter((n) => n.record.state !== "deleted"),
    rollbackWarnings: t.rollbackWarnings,
    unreadable: t.unreadable,
    truncated: t.truncated,
    quorumMet: t.quorumMet
  };
}
async function At(e) {
  const { vault: t, connections: n } = await st(), r = n.find((o) => o.record.connection_id === e);
  if (!r) throw new Error("That connection no longer exists.");
  return { vault: t, connection: r };
}
let ke = null, se = null;
function qn(e) {
  self.postMessage({ notify: "nip46-auth-url", url: e });
}
function $e() {
  if (!ke) throw new Error("No remote signer is connected.");
  return ke;
}
function nt() {
  se && (se.abort.abort(), E(se.clientSecretKey), se = null);
}
function oo(e) {
  const t = e.buildLogoutEvent();
  e.close(), t && e.publishCourtesy(t);
}
function Bn(e, t) {
  ke && oo(ke.client), ke = { client: e, userPubkey: t };
}
async function ls(e, t) {
  if (y.signerOnly && !Xa.has(e))
    throw new Error("This session can only sign. Sign in at your own BitLogin page for anything else.");
  switch (e) {
    // ---- Signer hand-off (docs/sign-in-window.md) ----
    // The receiving side, first: a throwaway key for the hand-off to be sealed to.
    case "handoffBegin":
      return ge && E(ge), ge = et(), { recipientPublicKey: k(ge) };
    // The sending side: this worker has the session, and seals the everyday
    // key (only that) to the receiving worker's throwaway key.
    case "handoffExport": {
      const { everydayPrivateKey: n } = Z(), r = et();
      try {
        return es(n, t.recipientPublicKey, r);
      } finally {
        E(r);
      }
    }
    // The receiving side, last: open it with the throwaway key, which is
    // then gone. What results is a signer-only session, in memory. It is
    // never written to the session cache or the public record.
    // ---- What the embedded signer remembers for a site (signerGrant.ts) ----
    // Keep this hand-off for the site that asked, so the user is not asked again on its next page load. Only a
    // session that arrived by a hand-off is ever kept this way: a full session is never written as a grant.
    case "signerKeep": {
      const { everydayPrivateKey: n } = Z();
      if (!y.signerOnly) throw new Error("Only a signer-only session can be remembered for a site.");
      const r = t, o = Date.now() / 1e3;
      return { kept: await On(x, { site: r.site, everydayPrivateKey: n, until: r.until, ...r.name ? { name: r.name } : {}, signed: [] }, o) };
    }
    // The site's page was loaded again: what was kept for that site, if it is still in date, becomes a
    // signer-only session. It touches nothing a full session uses.
    case "signerRestore": {
      const r = await Mn(x, t.site, Date.now() / 1e3);
      return r ? (we(), y.signer = new ye(r.everydayPrivateKey), y.everydayPrivateKey = r.everydayPrivateKey, y.signerOnly = !0, { restored: !0, everydayPublicKey: y.signer.getPublicKey(), until: r.until, ...r.name ? { name: r.name } : {}, signed: r.signed }) : { restored: !1 };
    }
    // Count a signature against the site, where reloading the page can't lose the count.
    case "signerTouch": {
      const { everydayPrivateKey: n } = Z();
      if (!y.signerOnly) throw new Error("Only a signer-only session is counted for a site.");
      const r = t, o = Date.now() / 1e3, i = await Mn(x, r.site, o);
      return i && k(i.everydayPrivateKey) === k(n) && await On(x, { ...i, signed: Array.isArray(r.signed) ? r.signed : [] }, o), {};
    }
    case "signerForget":
      return await os(x, t.site), {};
    case "handoffAccept": {
      if (!ge) throw new Error("No hand-off was begun here.");
      const n = ge;
      ge = null;
      let r;
      try {
        r = ts(t, n);
      } finally {
        E(n);
      }
      return we(), y.signer = new ye(r), y.everydayPrivateKey = r, y.signerOnly = !0, { everydayPublicKey: y.signer.getPublicKey() };
    }
    case "nip46Connect": {
      const r = Pa(t.uri), o = new Rn({
        clientSecretKey: et(),
        pointer: r,
        onAuthUrl: qn
      });
      try {
        await o.connect();
        const i = await o.getUserPublicKey();
        return Bn(o, i), nt(), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46NostrconnectStart": {
      const n = t, r = C.slice(0, 2);
      nt();
      const o = et(), i = We(te(16));
      return se = { clientSecretKey: o, relayUrls: r, secret: i, abort: new AbortController() }, { uri: Ka({
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
        ({ signerPubkey: r } = await Aa({
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
      const o = new Rn({
        clientSecretKey: n.clientSecretKey,
        pointer: { signerPubkey: r, relayUrls: n.relayUrls },
        onAuthUrl: qn
      });
      try {
        const i = await o.getUserPublicKey();
        return Bn(o, i), { userPubkey: i };
      } catch (i) {
        throw o.close(), i;
      }
    }
    case "nip46SignEvent": {
      const n = t;
      return $e().client.signEvent({
        kind: n.kind,
        content: n.content,
        tags: n.tags ?? [],
        created_at: n.created_at ?? Math.floor(Date.now() / 1e3)
      });
    }
    case "nip46Nip44Encrypt": {
      const n = t;
      return { ciphertext: await $e().client.nip44Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip44Decrypt": {
      const n = t;
      return { plaintext: await $e().client.nip44Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Nip04Encrypt": {
      const n = t;
      return { ciphertext: await $e().client.nip04Encrypt(n.peerPublicKey, n.plaintext) };
    }
    case "nip46Nip04Decrypt": {
      const n = t;
      return { plaintext: await $e().client.nip04Decrypt(n.peerPublicKey, n.payload) };
    }
    case "nip46Disconnect": {
      const n = ke;
      return ke = null, nt(), n && oo(n.client), {};
    }
    case "configure": {
      const n = t;
      return Ot = !!n.vaultRelayUrls?.length, Mt = !!n.discoveryRelayUrls?.length, n.vaultRelayUrls?.length && (C = n.vaultRelayUrls), n.discoveryRelayUrls?.length && (Ae = n.discoveryRelayUrls), Dn(at(await Wr(x))), (!Ot || !Mt) && pa(x).then(Dn, () => {
      }), {};
    }
    case "register": {
      const n = t, r = n.importKey ? await vi({ nsecOrHex: n.importKey, loginName: n.loginName, password: n.password, vaultRelayUrls: C }) : await vr({ loginName: n.loginName, password: n.password, vaultRelayUrls: C });
      return we(), y.signer = new ye(r.everydayPrivateKey), y.everydayPrivateKey = r.everydayPrivateKey, y.accountId = r.accountId, y.recoveryPublicKey = r.recoveryPublicKey, y.activeCredentialEvent = r.credentialEvent, y.activeRecoveryEvent = r.recoveryEvent, y.everydayKeyDerived = r.everydayKeyDerived, Dt(r.connectionVaultRoot, r.vaultSudoKey), await tt(), {
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
      const r = gr(t.nsecOrHex), o = k(r), i = { everydayPublicKey: o, npub: ot(o) };
      return r.fill(0), i;
    }
    case "login": {
      const n = t, r = await gi({
        loginName: n.loginName,
        password: n.password,
        vaultRelayUrls: C,
        store: x,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return we(), y.signer = new ye(r.everydayPrivateKey), y.everydayPrivateKey = r.everydayPrivateKey, y.accountId = r.accountId, y.recoveryPublicKey = r.recoveryPublicKey, y.activeCredentialEvent = r.credentialEvent, y.activeRecoveryEvent = r.recoveryCapsuleEvent, y.everydayKeyDerived = r.everydayKeyDerived, Dt(r.connectionVaultRoot, r.vaultSudoKey), await tt(), !r.rollbackWarning && !r.relayDisagreementWarning && bn({
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
      const n = t, r = await wi({
        phrase: n.phrase,
        vaultRelayUrls: C,
        discoveryRelayUrls: Ae,
        offlineRecoveryCapsuleEvents: n.offlineExportFile?.recovery_capsule_events
      });
      return Vn(r);
    }
    case "previewPhraseRebuild": {
      const r = await bi({ phrase: t.phrase, vaultRelayUrls: C, discoveryRelayUrls: Ae });
      return { ...r, npub: ot(r.everydayPublicKey) };
    }
    case "rebuildFromPhrase": {
      const r = await mi({ phrase: t.phrase, vaultRelayUrls: C, discoveryRelayUrls: Ae });
      return Vn(r);
    }
    case "completeRecovery": {
      const n = t;
      if (!y.pendingRecovery) throw new Error("No recovery is in progress in this session.");
      const r = await ki({
        recovered: y.pendingRecovery,
        newLoginName: n.newLoginName,
        newPassword: n.newPassword,
        vaultRelayUrls: C,
        store: x
      });
      return y.activeCredentialEvent = r.credentialEvent, y.activeRecoveryEvent = r.refreshedRecoveryEvent, y.pendingRecovery.recoveryPrivateKey.fill(0), y.pendingRecovery = null, await tt(), {
        locatorPublicKey: r.locatorPublicKey,
        credentialEventId: r.credentialEvent.id,
        refreshedRecoveryEventId: r.refreshedRecoveryEvent.id
      };
    }
    case "changePassword": {
      const n = t, r = await _i({
        loginName: n.loginName,
        oldPassword: n.oldPassword,
        newPassword: n.newPassword,
        vaultRelayUrls: C,
        store: x,
        acknowledgeRollback: n.acknowledgeRollback
      });
      return y.activeCredentialEvent = r.newCredentialEvent, y.recoveryPublicKey = r.recoveryPublicKey, y.activeRecoveryEvent = r.recoveryCapsuleEvent, await tt(), {
        newLocatorPublicKey: r.newLocatorPublicKey,
        newGeneration: r.newGeneration,
        tombstoneAcknowledgedCount: r.tombstoneAcknowledgedCount,
        deletionAcknowledgedCount: r.deletionAcknowledgedCount
      };
    }
    case "publishProfileAndRelayLists": {
      const n = t, { everydayPrivateKey: r } = Z();
      return Vo({
        everydayPrivateKey: r,
        name: n.name,
        about: n.about,
        picture: n.picture,
        generalRelays: n.generalRelays,
        dmRelays: n.dmRelays,
        discoveryRelays: Ae
      });
    }
    case "getPublicKey": {
      const { signer: n } = Z();
      return { publicKey: n.getPublicKey() };
    }
    case "signEvent": {
      const { signer: n } = Z(), r = t;
      return n.signEvent({ kind: r.kind, tags: r.tags, content: r.content, created_at: r.created_at });
    }
    case "nip44Encrypt": {
      const { signer: n } = Z(), r = t;
      return { ciphertext: n.nip44Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip44Decrypt": {
      const { signer: n } = Z(), r = t;
      return { plaintext: n.nip44Decrypt(r.peerPublicKey, r.payload) };
    }
    case "nip04Encrypt": {
      const { signer: n } = Z(), r = t;
      return { ciphertext: n.nip04Encrypt(r.peerPublicKey, r.plaintext) };
    }
    case "nip04Decrypt": {
      const { signer: n } = Z(), r = t;
      return { plaintext: n.nip04Decrypt(r.peerPublicKey, r.payload) };
    }
    case "exportIdentity": {
      const { everydayPrivateKey: n, signer: r } = Z();
      return { nsec: Eo(n), npub: ot(r.getPublicKey()) };
    }
    case "buildRecoveryExport": {
      if (Z(), !y.recoveryPublicKey || !y.activeRecoveryEvent)
        throw new Error("No recovery capsule is known in this session yet.");
      return _o({
        recoveryPublicKeyHex: y.recoveryPublicKey,
        vaultRelayUrls: C,
        recoveryCapsuleEvents: [y.activeRecoveryEvent],
        relayListEvents: []
      });
    }
    case "repairReplicas": {
      if (!y.activeCredentialEvent || !y.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return bn({
        relayUrls: C,
        credentialEvent: y.activeCredentialEvent,
        recoveryEvent: y.activeRecoveryEvent
      });
    }
    case "checkReplicaHealth": {
      if (!y.activeCredentialEvent || !y.activeRecoveryEvent)
        throw new Error("No active capsule events are known in this session yet.");
      return ni({
        relayUrls: C,
        credentialEvent: y.activeCredentialEvent,
        recoveryEvent: y.activeRecoveryEvent
      });
    }
    case "getSessionStatus":
      return { unlocked: !!y.signer, everydayPublicKey: y.signer?.getPublicKey(), signerOnly: y.signerOnly };
    // Called once, right after "configure", before the widget renders its welcome
    // screen -- restores whatever persistSession() last cached for this origin, so
    // a page reload doesn't ask for the login name + password again. A missing or
    // corrupt cache is not an error: it just means the widget falls through to its
    // normal welcome screen, exactly like it always has.
    case "restoreSession": {
      const n = await Ja(x);
      return n ? (we(), y.signer = new ye(n.everydayPrivateKey), y.everydayPrivateKey = n.everydayPrivateKey, y.accountId = n.accountId, y.recoveryPublicKey = n.recoveryPublicKey, y.activeCredentialEvent = n.activeCredentialEvent, y.activeRecoveryEvent = n.activeRecoveryEvent, y.everydayKeyDerived = n.everydayKeyDerived ?? !1, y.connectionVaultRoot = n.connectionVaultRoot ?? null, y.vaultKnown = n.vaultEnabled !== void 0, await ro(), {
        restored: !0,
        everydayPublicKey: y.signer.getPublicKey(),
        accountId: n.accountId,
        everydayKeyDerived: y.everydayKeyDerived
      }) : { restored: !1 };
    }
    case "logout":
      return we(), await Ya(x), await as(x), {};
    // ---- Connection Vault (connection-vault.md §12, reveal mode) ----
    case "vaultStatus":
      return y.signer ? y.connectionVaultRoot ? { enabled: !0, vaultPublicKey: Vt().vaultPublicKey } : { enabled: !1, reason: y.vaultKnown ? "no-vault" : "stale-cache" } : { enabled: !1 };
    case "vaultList": {
      const { connections: n, rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: a } = await st();
      return { connections: n.map(Be), rollbackWarnings: r, unreadable: o, truncated: i, quorumMet: a };
    }
    case "vaultSaveNwc": {
      const n = t, r = qe(), o = Vt(), i = Sn(n.uri), a = n.label.trim().slice(0, 120) || "Wallet connection", { record: s, event: c } = await o.createConnection({
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
        store: x
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
      const n = t, { connection: r } = await At(n.connectionId);
      if (r.record.connection_type !== "nwc" || r.record.state !== "active")
        throw new Error("That connection is not an active wallet connection.");
      const o = r.record.application_binding.origin;
      if (o !== null && o !== qe())
        throw new Error("That connection belongs to a different site.");
      const i = r.record.credential;
      return zr(i), { uri: Ta(i) };
    }
    case "vaultSetBinding": {
      const n = t, { vault: r, connection: o } = await At(n.connectionId), i = n.origin === null ? null : qe(), { record: a, event: s } = await r.updateConnection(o, {
        application_binding: { origin: i, app_pubkey: null }
      });
      if (!(await r.publish({
        event: s,
        connectionId: a.connection_id,
        relayUrls: C,
        store: x
      })).success) throw new Error("The change could not reach enough relays. Please try again.");
      const l = await r.decryptEvent(s);
      return Be(l);
    }
    case "vaultDelete": {
      const n = t, { vault: r, connection: o } = await At(n.connectionId), { record: i, event: a } = await r.deleteConnection(o);
      if (!(await r.publish({
        event: a,
        connectionId: i.connection_id,
        relayUrls: C,
        store: x
      })).success) throw new Error("The deletion could not reach enough relays. Please try again.");
      try {
        const c = r.buildDeletionRequest(o.event.id), l = new K(C);
        await l.publishAll(c), l.closeAll();
      } catch {
      }
      return {};
    }
    case "vaultOfferCheck": {
      const n = t, r = qe(), o = Sn(n.uri), { connections: i } = await st(), a = i.find(
        (s) => s.record.connection_type === "nwc" && Ia(s.record.credential, o)
      );
      return a ? a.record.application_binding.origin !== r ? { duplicate: !1 } : { duplicate: !0, connection: Be(a) } : { duplicate: !1 };
    }
    default:
      throw new Error(`Unknown worker action: ${e}`);
  }
}
const us = /* @__PURE__ */ new Set([
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
  if (typeof t.action != "string" || !us.has(t.action)) {
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
  (r.startsWith("nip46") ? (a) => a() : (a) => cs.run(a))(() => ls(r, o)).then(
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
