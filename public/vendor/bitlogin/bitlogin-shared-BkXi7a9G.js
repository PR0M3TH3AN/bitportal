import { C as rt, D as xn, E as Tn, h as Mn, u as Le, a as $n, A as Dt, M as Rn, B as Dn, c as Pn, p as Cn, y as jn, v as z, b as Kn, N as Bn, O as Pt } from "./bitlogin-shared-Cj9s0_W_.js";
import { d as De } from "./bitlogin-shared-PwbHDYud.js";
const Ct = 32, jt = 2 ** 26, Ts = 100, Kt = (t) => t === 0 ? 1 : t * jt, Bt = (t) => (t + 1) * jt - 1;
function Ut(t) {
  return Number.isSafeInteger(t) && t >= 0 && t < Ct;
}
function Ms(t) {
  const e = t;
  return !e || !Ut(e.lane) || !Number.isSafeInteger(e.next) || e.next < Kt(e.lane) || e.next > Bt(e.lane) ? null : { lane: e.lane, next: e.next };
}
async function $s(t, e = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) {
  const n = Array.from({ length: Ct }, (r, s) => s);
  for (; n.length; ) {
    const r = n.splice(Math.min(n.length - 1, Math.floor(e() * n.length)), 1)[0];
    if (!await t(r)) return r;
  }
  return null;
}
const Rs = "This browser can't keep two tabs from using the same counters, so the seed isn't used in it. Your sats are kept on relays as before.", Ds = "If a crash left a long gap in a lane and BitLogin's record of the counter is gone from every relay too, restore can miss what came after the gap. Those sats are still at the mint, but this wallet can't find them.", Ps = 2 ** 31 - 1 - 4096, Cs = 2 ** 31 - 2, js = 17375, Ks = 7375, Bs = 7376, st = "sat", ot = {
  mints: 5,
  proofsPerToken: 500,
  tokens: 500,
  /**
   * How many proofs this wallet writes into one token record. Kept small so that a record is well under the
   * 64 KB an ordinary NIP-44 message may hold, and under what relays take: another NIP-60 wallet can read it.
   */
  proofsWritten: 100
}, wt = /^[0-9a-f]+$/u, Wt = /^[0-9a-f]{64}$/u;
function pe(t) {
  if (typeof t != "string" || t.length > 200) return "";
  let e;
  try {
    e = new URL(t.trim());
  } catch {
    return "";
  }
  const n = e.hostname === "localhost" || e.hostname === "127.0.0.1";
  return e.protocol !== "https:" && !(e.protocol === "http:" && n) || e.username || e.password || e.search || e.hash ? "" : `${e.origin}${e.pathname.replace(/\/+$/u, "")}`;
}
function Un(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  return typeof e.id != "string" || e.id.length < 2 || e.id.length > 66 || !wt.test(e.id) || typeof e.amount != "number" || !Number.isSafeInteger(e.amount) || e.amount <= 0 || typeof e.secret != "string" || e.secret.length === 0 || e.secret.length > 2048 || typeof e.C != "string" || e.C.length !== 66 || !wt.test(e.C) ? null : { id: e.id, amount: e.amount, secret: e.secret, C: e.C };
}
function Wn(t, e = ot.proofsPerToken) {
  if (!Array.isArray(t) || t.length > e) return null;
  const n = [], r = /* @__PURE__ */ new Set();
  for (const s of t) {
    const o = Un(s);
    if (!o || r.has(o.secret)) return null;
    r.add(o.secret), n.push(o);
  }
  return n;
}
const Us = (t) => t.reduce((e, n) => e + n.amount, 0), Ft = "bitlogin-trial", zt = "bitlogin-counter", Ht = "bitlogin-keys";
function Fn(...t) {
  const e = /* @__PURE__ */ new Map();
  for (const n of t.flatMap((r) => r ?? [])) (!e.has(n.keysetId) || (n.at ?? 0) > (e.get(n.keysetId).at ?? 0)) && e.set(n.keysetId, { keysetId: n.keysetId, hash: n.hash, ...n.at ? { at: n.at } : {} });
  return [...e.values()].slice(0, 200);
}
function zn(...t) {
  const e = /* @__PURE__ */ new Map();
  for (const n of t.flatMap((r) => r ?? [])) {
    const r = `${n.keysetId}:${n.lane}`;
    (e.get(r)?.next ?? 0) < n.next && e.set(r, { keysetId: n.keysetId, lane: n.lane, next: n.next });
  }
  return [...e.values()].slice(-200);
}
function Ws(...t) {
  let e = [];
  for (const n of t.flatMap((r) => r ?? [])) {
    const r = e.find((s) => s.mint === n.mint && s.keysetId === n.keysetId);
    (!r || r.at < n.at) && (e = Gt(e, n));
  }
  return e;
}
const Pe = /^[0-9a-f]{16}$|^[0-9a-f]{66}$/u;
function Fs(t) {
  return JSON.stringify([
    ["privkey", t.privkey],
    ...t.mints.map((e) => ["mint", e]),
    ...(t.trials ?? []).map((e) => [Ft, e.mint, e.keysetId, e.outcome, String(e.at)]),
    ...(t.counters ?? []).map((e) => [zt, e.keysetId, String(e.lane), String(e.next)]),
    ...(t.pins ?? []).map((e) => [Ht, e.keysetId, e.hash, ...e.at ? [String(e.at)] : []])
  ]);
}
function Hn(t) {
  const [, e, n, r, s] = t, o = pe(e), i = Number(s);
  return !o || typeof n != "string" || !Pe.test(n) || r !== "passed" && r !== "failed" || !Number.isSafeInteger(i) || i <= 0 ? null : { mint: o, keysetId: n, outcome: r, at: i };
}
function Gt(t, e) {
  return [...(t ?? []).filter((r) => !(r.mint === e.mint && r.keysetId === e.keysetId)), e].slice(-50);
}
function zs(t) {
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    return null;
  }
  if (!Array.isArray(e)) return null;
  let n = "";
  const r = [];
  let s = [], o = [], i = [];
  for (const c of e)
    if (c[0] === Ht && typeof c[1] == "string" && Pe.test(c[1]) && typeof c[2] == "string" && /^[0-9a-f]{64}$/u.test(c[2]) && (i = Fn(i, [{ keysetId: c[1], hash: c[2], ...Number.isSafeInteger(Number(c[3])) && Number(c[3]) > 0 ? { at: Number(c[3]) } : {} }])), !(!Array.isArray(c) || typeof c[0] != "string")) {
      if (c[0] === "privkey" && typeof c[1] == "string" && Wt.test(c[1]) && (n ||= c[1]), c[0] === "mint" && pe(c[1]) && !r.includes(pe(c[1])) && r.length < ot.mints && r.push(pe(c[1])), c[0] === zt) {
        const [, l, f, a] = c, u = { keysetId: l, lane: Number(f), next: Number(a) };
        typeof l == "string" && Pe.test(l) && Ut(u.lane) && Number.isSafeInteger(u.next) && u.next >= Kt(u.lane) && u.next <= Bt(u.lane) + 1 && (o = zn(o, [u]));
      }
      if (c[0] === Ft) {
        const l = Hn(c);
        if (l) {
          const f = s.find((a) => a.mint === l.mint && a.keysetId === l.keysetId);
          (!f || f.at < l.at) && (s = Gt(s, l));
        }
      }
    }
  return n ? { privkey: n, mints: r, ...s.length ? { trials: s } : {}, ...o.length ? { counters: o } : {}, ...i.length ? { pins: i } : {} } : null;
}
function Hs(t) {
  return JSON.stringify({ mint: t.mint, unit: st, proofs: t.proofs.map(({ id: e, amount: n, secret: r, C: s }) => ({ id: e, amount: n, secret: r, C: s })), ...t.del?.length ? { del: [...t.del] } : {} });
}
function Gs(t) {
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    return null;
  }
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const n = e, r = pe(n.mint), s = Wn(n.proofs);
  if (!r || !s || n.unit !== void 0 && n.unit !== st) return null;
  const o = Array.isArray(n.del) ? n.del.filter((i) => typeof i == "string" && Wt.test(i)).slice(0, 200) : [];
  return { mint: r, proofs: s, del: o };
}
function Xs(t, e) {
  const n = new Set(t.flatMap((o) => o.del)), r = /* @__PURE__ */ new Set(), s = [];
  for (const o of [...t].sort((i, c) => c.created_at - i.created_at || i.event.localeCompare(c.event))) {
    if (n.has(o.event) || e.has(o.event)) continue;
    const i = o.proofs.filter((c) => !r.has(c.secret));
    for (const c of i) r.add(c.secret);
    i.length && s.length < ot.tokens && s.push({ event: o.event, mint: o.mint, proofs: i });
  }
  return s;
}
function Vs(t) {
  return JSON.stringify([
    ["direction", t.direction],
    ["amount", String(t.amount)],
    ["unit", st],
    ...(t.created ?? []).map((e) => ["e", e, "", "created"]),
    ...(t.destroyed ?? []).map((e) => ["e", e, "", "destroyed"])
  ]);
}
const oe = (t) => {
  if (typeof t != "string") return "";
  const e = t.trim().toLowerCase().replace(/^lightning:/u, "");
  return e.length <= 2e3 && /^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(e) ? e : "";
};
class ee extends Error {
  constructor(e, n) {
    super(n), this.code = e, this.name = "TipError";
  }
}
const At = { min: 1, max: 1e6 }, V = (t) => typeof t == "number" && Number.isSafeInteger(t) && t >= At.min && t <= At.max ? t : 0, vt = { default: 1e3, steps: [1e3, 1e4, 1e5, 0] }, Js = (t) => vt.steps.includes(t) ? t : vt.default, Ys = (t, e) => e !== 0 && t > e;
function Gn(t) {
  if (typeof t != "string") return null;
  const e = t.trim().toLowerCase(), n = e.lastIndexOf("1");
  if (n < 4) return null;
  const r = /^ln(?:bcrt|tbs|bc|tb)([1-9][0-9]{0,11})([munp]?)$/u.exec(e.slice(0, n));
  if (!r) return null;
  const s = { "": 100000000000n, m: 100000000n, u: 100000n, n: 100n }, o = r[2] === "p" ? BigInt(r[1]) % 10n === 0n ? BigInt(r[1]) / 10n : -1n : BigInt(r[1]) * s[r[2]];
  if (o <= 0n || o % 1000n !== 0n) return null;
  const i = o / 1000n;
  return i <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(i) : null;
}
const it = /^(?:localhost|127\.0\.0\.1)(?::[0-9]{1,5})?$/u, Xn = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/u;
function at(t, e = {}) {
  if (typeof t != "string" || t.length > 200) return "";
  const n = t.trim().toLowerCase(), r = n.lastIndexOf("@");
  if (r < 1) return "";
  const s = n.slice(0, r), o = n.slice(r + 1);
  return /^[a-z0-9._+-]{1,64}$/u.test(s) && (Xn.test(o) || e.local && it.test(o)) ? n : "";
}
function Zs(t, e = {}) {
  try {
    const n = typeof t == "string" ? JSON.parse(t) : null;
    return n && typeof n == "object" ? at(n.lud16, e) : "";
  } catch {
    return "";
  }
}
const Vn = 8e3;
async function Ce(t, e) {
  const n = new AbortController(), r = setTimeout(() => n.abort(), Vn);
  try {
    const s = await t(e, { method: "GET", credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", headers: { accept: "application/json" }, signal: n.signal });
    if (!s.ok) return null;
    const o = await s.text();
    if (o.length > 1e5) return null;
    const i = JSON.parse(o);
    return i && typeof i == "object" && !Array.isArray(i) ? i : null;
  } catch {
    return null;
  } finally {
    clearTimeout(r);
  }
}
const Xt = (t, e) => {
  try {
    const n = new URL(String(t));
    return typeof t != "string" || t.length > 2e3 || n.username || n.password ? null : n.protocol === "https:" || e && n.protocol === "http:" && it.test(n.host) ? n : null;
  } catch {
    return null;
  }
};
async function Qs(t, e = {}) {
  const n = Xt(t, e.local === !0);
  if (!n || n.origin !== t) return { tip: "", publishers: [], share: "" };
  const r = await Ce(e.fetch ?? ((o, i) => fetch(o, i)), `${n.origin}/.well-known/nswp.json`), s = r?.publishers && typeof r.publishers == "object" && !Array.isArray(r.publishers) ? Object.keys(r.publishers) : [];
  return { tip: at(r?.tip, e), publishers: s.filter((o) => /^[0-9a-f]{64}$/u.test(o)).slice(0, 16), share: typeof r?.share == "string" && /^[0-9a-f]{64}$/u.test(r.share) ? r.share : "" };
}
async function qs(t, e, n = {}) {
  const r = n.local === !0, s = at(t, { local: r }), o = V(e);
  if (!s || !o) throw new ee("no-address", "That is not a lightning address and an amount.");
  const i = n.fetch ?? ((q, W) => fetch(q, W)), [c, l] = [s.slice(0, s.lastIndexOf("@")), s.slice(s.lastIndexOf("@") + 1)], f = r && it.test(l) ? "http" : "https", a = await Ce(i, `${f}://${l}/.well-known/lnurlp/${encodeURIComponent(c)}`);
  if (!a) throw new ee("unreachable", "That lightning address didn't answer. Nothing was spent.");
  const u = Xt(a.callback, r);
  if (a.tag !== "payRequest" || !u) throw new ee("unreachable", "That lightning address didn't answer as one. Nothing was spent.");
  const d = o * 1e3, [h, g] = [Number(a.minSendable), Number(a.maxSendable)];
  if (!(Number.isFinite(h) && Number.isFinite(g) && h <= d && d <= g))
    throw new ee("refused-amount", "That lightning address doesn't take a payment of this size. Nothing was spent.");
  u.searchParams.set("amount", String(d));
  const p = typeof a.commentAllowed == "number" && Number.isSafeInteger(a.commentAllowed) ? Math.min(a.commentAllowed, 280) : 0, m = p >= 8 ? je(n.note).slice(0, p) : "";
  m && u.searchParams.set("comment", m);
  const b = await Ce(i, u.href), A = typeof b?.pr == "string" ? b.pr.trim().toLowerCase() : "";
  if (!A || A.length > 2e3 || !/^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(A)) throw new ee("unreachable", "That lightning address gave no invoice. Nothing was spent.");
  if (Gn(A) !== o) throw new ee("wrong-invoice", "That lightning address answered with an invoice for a different amount. Nothing was spent.");
  return { invoice: A, note: m };
}
function je(t) {
  return typeof t == "string" ? Array.from(t.normalize("NFC")).filter((e) => {
    const n = e.codePointAt(0);
    return n >= 32 && n !== 127 && !(n >= 8203 && n <= 8207) && !(n >= 8234 && n <= 8238) && !(n >= 8294 && n <= 8297);
  }).join("").trim().slice(0, 280) : "";
}
function eo(t, e) {
  let n = "";
  try {
    n = new URL(e).host;
  } catch {
    n = "";
  }
  const r = je(t).slice(0, 60);
  return je(`${r ? `A tip from ${r}` : "A tip"}${n ? `, in ${n}` : ""}`);
}
function Jn(t) {
  const e = t.split(".");
  if (e.length !== 4 || e.some((r) => !/^\d{1,3}$/u.test(r)))
    return !1;
  const n = e.map(Number);
  return n.every((r) => r >= 0 && r <= 255) && n[0] === 127;
}
function Yn(t) {
  let e;
  try {
    e = new URL(t);
  } catch {
    return !1;
  }
  return e.username || e.password || e.hash ? !1 : e.protocol === "wss:" ? !0 : e.protocol !== "ws:" ? !1 : e.hostname === "localhost" || e.hostname === "[::1]" || Jn(e.hostname);
}
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function Zn(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in t && t.BYTES_PER_ELEMENT === 1;
}
function St(t) {
  if (typeof t != "boolean")
    throw new TypeError(`boolean expected, not ${t}`);
}
function Te(t) {
  if (typeof t != "number")
    throw new TypeError("number expected, got " + typeof t);
  if (!Number.isSafeInteger(t) || t < 0)
    throw new RangeError("positive integer expected, got " + t);
}
function K(t, e, n = "") {
  const r = Zn(t), s = t?.length, o = e !== void 0;
  if (!r || o && s !== e) {
    const i = n && `"${n}" `, c = o ? ` of length ${e}` : "", l = r ? `length=${s}` : `type=${typeof t}`, f = i + "expected Uint8Array" + c + ", got " + l;
    throw r ? new RangeError(f) : new TypeError(f);
  }
  return t;
}
function F(t) {
  return new Uint32Array(t.buffer, t.byteOffset, Math.floor(t.byteLength / 4));
}
function kt(...t) {
  for (let e = 0; e < t.length; e++)
    t[e].fill(0);
}
const se = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68, Qn = (t) => t << 24 & 4278190080 | t << 8 & 16711680 | t >>> 8 & 65280 | t >>> 24 & 255, qn = (t) => {
  for (let e = 0; e < t.length; e++)
    t[e] = Qn(t[e]);
  return t;
}, H = se ? (t) => t : qn;
function er(t, e) {
  return !t.byteLength || !e.byteLength ? !1 : t.buffer === e.buffer && // best we can do, may fail with an obscure Proxy
  t.byteOffset < e.byteOffset + e.byteLength && // a starts before b end
  e.byteOffset < t.byteOffset + t.byteLength;
}
function to(t, e) {
  if (er(t, e) && t.byteOffset < e.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function tr(t, e) {
  if (e == null || typeof e != "object")
    throw new Error("options must be defined");
  return Object.assign(t, e);
}
const no = /* @__NO_SIDE_EFFECTS__ */ (t, e) => {
  function n(r, ...s) {
    if (K(r, void 0, "key"), t.nonceLength !== void 0) {
      const a = s[0];
      K(a, t.varSizeNonce ? void 0 : t.nonceLength, "nonce");
    }
    const o = t.tagLength;
    o && s[1] !== void 0 && K(s[1], void 0, "AAD");
    const i = e(r, ...s), c = (a, u) => {
      if (u !== void 0) {
        if (a !== 2)
          throw new Error("cipher output not supported");
        K(u, void 0, "output");
      }
    };
    let l = !1;
    return {
      encrypt(a, u) {
        if (l)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return l = !0, K(a), c(i.encrypt.length, u), i.encrypt(a, u);
      },
      decrypt(a, u) {
        if (K(a), o && a.length < o)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + o);
        return c(i.decrypt.length, u), i.decrypt(a, u);
      }
    };
  }
  return Object.assign(n, t), n;
};
function nr(t, e, n = !0) {
  if (e === void 0)
    return new Uint8Array(t);
  if (K(e, void 0, "output"), e.length !== t)
    throw new Error('"output" expected Uint8Array of length ' + t + ", got: " + e.length);
  if (n && !ve(e))
    throw new Error("invalid output, must be aligned");
  return e;
}
function ve(t) {
  return t.byteOffset % 4 === 0;
}
function _t(t) {
  return Uint8Array.from(K(t));
}
const Vt = (t) => Uint8Array.from(t.split(""), (e) => e.charCodeAt(0)), rr = H(F(Vt("expand 16-byte k"))), sr = H(F(Vt("expand 32-byte k")));
function y(t, e) {
  return t << e | t >>> 32 - e;
}
const le = 64, or = 16, Ke = 2 ** 32 - 1, Et = /* @__PURE__ */ Uint32Array.of();
function ir(t, e, n, r, s, o, i, c) {
  const l = s.length, f = new Uint8Array(le), a = F(f), u = se && ve(s) && ve(o), d = u ? F(s) : Et, h = u ? F(o) : Et;
  if (!se) {
    for (let g = 0; g < l; i++) {
      if (t(e, n, r, a, i, c), H(a), i >= Ke)
        throw new Error("arx: counter overflow");
      const p = Math.min(le, l - g);
      for (let m = 0, b; m < p; m++)
        b = g + m, o[b] = s[b] ^ f[m];
      g += p;
    }
    return;
  }
  for (let g = 0; g < l; i++) {
    if (t(e, n, r, a, i, c), i >= Ke)
      throw new Error("arx: counter overflow");
    const p = Math.min(le, l - g);
    if (u && p === le) {
      const m = g / 4;
      if (g % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let b = 0, A; b < or; b++)
        A = m + b, h[A] = d[A] ^ a[b];
      g += le;
      continue;
    }
    for (let m = 0, b; m < p; m++)
      b = g + m, o[b] = s[b] ^ f[m];
    g += p;
  }
}
function ar(t, e) {
  const { allowShortKeys: n, extendNonceFn: r, counterLength: s, counterRight: o, rounds: i } = tr({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, e);
  if (typeof t != "function")
    throw new Error("core must be a function");
  return Te(s), Te(i), St(o), St(n), (c, l, f, a, u = 0) => {
    K(c, void 0, "key"), K(l, void 0, "nonce"), K(f, void 0, "data");
    const d = f.length;
    if (a = nr(d, a, !1), Te(u), u < 0 || u >= Ke)
      throw new Error("arx: counter overflow");
    const h = [];
    let g = c.length, p, m;
    if (g === 32)
      h.push(p = _t(c)), m = sr;
    else if (g === 16 && n)
      p = new Uint8Array(32), p.set(c), p.set(c, 16), m = rr, h.push(p);
    else
      throw K(c, 32, "arx key"), new Error("invalid key size");
    (!se || !ve(l)) && h.push(l = _t(l));
    let b = F(p);
    if (r) {
      if (l.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const W = l.subarray(0, 16);
      if (se)
        r(m, b, F(W), b);
      else {
        const ce = H(Uint32Array.from(m));
        r(ce, b, F(W), b), kt(ce), H(b);
      }
      l = l.subarray(16);
    } else se || H(b);
    const A = 16 - s;
    if (A !== l.length)
      throw new Error(`arx: nonce must be ${A} or 16 bytes`);
    if (A !== 12) {
      const W = new Uint8Array(12);
      W.set(l, o ? 0 : 12 - l.length), l = W, h.push(l);
    }
    const q = H(F(l));
    try {
      return ir(t, m, b, q, f, a, u, i), a;
    } finally {
      kt(...h);
    }
  };
}
function cr(t, e, n, r, s, o = 20) {
  let i = t[0], c = t[1], l = t[2], f = t[3], a = e[0], u = e[1], d = e[2], h = e[3], g = e[4], p = e[5], m = e[6], b = e[7], A = s, q = n[0], W = n[1], ce = n[2], S = i, k = c, _ = l, E = f, I = a, N = u, L = d, O = h, x = g, T = p, M = m, $ = b, R = A, D = q, P = W, C = ce;
  for (let mt = 0; mt < o; mt += 2)
    S = S + I | 0, R = y(R ^ S, 16), x = x + R | 0, I = y(I ^ x, 12), S = S + I | 0, R = y(R ^ S, 8), x = x + R | 0, I = y(I ^ x, 7), k = k + N | 0, D = y(D ^ k, 16), T = T + D | 0, N = y(N ^ T, 12), k = k + N | 0, D = y(D ^ k, 8), T = T + D | 0, N = y(N ^ T, 7), _ = _ + L | 0, P = y(P ^ _, 16), M = M + P | 0, L = y(L ^ M, 12), _ = _ + L | 0, P = y(P ^ _, 8), M = M + P | 0, L = y(L ^ M, 7), E = E + O | 0, C = y(C ^ E, 16), $ = $ + C | 0, O = y(O ^ $, 12), E = E + O | 0, C = y(C ^ E, 8), $ = $ + C | 0, O = y(O ^ $, 7), S = S + N | 0, C = y(C ^ S, 16), M = M + C | 0, N = y(N ^ M, 12), S = S + N | 0, C = y(C ^ S, 8), M = M + C | 0, N = y(N ^ M, 7), k = k + L | 0, R = y(R ^ k, 16), $ = $ + R | 0, L = y(L ^ $, 12), k = k + L | 0, R = y(R ^ k, 8), $ = $ + R | 0, L = y(L ^ $, 7), _ = _ + O | 0, D = y(D ^ _, 16), x = x + D | 0, O = y(O ^ x, 12), _ = _ + O | 0, D = y(D ^ _, 8), x = x + D | 0, O = y(O ^ x, 7), E = E + I | 0, P = y(P ^ E, 16), T = T + P | 0, I = y(I ^ T, 12), E = E + I | 0, P = y(P ^ E, 8), T = T + P | 0, I = y(I ^ T, 7);
  let v = 0;
  r[v++] = i + S | 0, r[v++] = c + k | 0, r[v++] = l + _ | 0, r[v++] = f + E | 0, r[v++] = a + I | 0, r[v++] = u + N | 0, r[v++] = d + L | 0, r[v++] = h + O | 0, r[v++] = g + x | 0, r[v++] = p + T | 0, r[v++] = m + M | 0, r[v++] = b + $ | 0, r[v++] = A + R | 0, r[v++] = q + D | 0, r[v++] = W + P | 0, r[v++] = ce + C | 0;
}
const Jt = /* @__PURE__ */ ar(cr, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
}), Yt = 2, Be = 1, Zt = 65536, lr = 4294967295, ur = 132, fr = 99, Ue = 1024 * 1024;
function ro(t, e) {
  const n = rt(new Uint8Array([2]), xn(e)), s = Tn.getSharedSecret(t, n, !0).slice(1, 33);
  return Mn(Le("nip44-v2"), s);
}
function Qt(t, e) {
  if (t.length !== 32)
    throw new Error("NIP-44 conversation key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const n = Pn(t, e, 76);
  return {
    chachaKey: n.slice(0, 32),
    chachaNonce: n.slice(32, 44),
    hmacKey: n.slice(44, 76)
  };
}
function ct(t) {
  if (t <= 32)
    return 32;
  const e = 2 ** Math.floor(Math.log2(t - 1) + 1), n = e <= 256 ? 32 : e / 8;
  return n * (Math.floor((t - 1) / n) + 1);
}
const qt = 39 + ct(Ue) + 32, dr = Math.ceil(qt / 3) * 4;
function pr(t) {
  if (t < Zt) {
    const n = new Uint8Array(2);
    return new DataView(n.buffer).setUint16(0, t, !1), n;
  }
  const e = new Uint8Array(6);
  return new DataView(e.buffer).setUint32(2, t, !1), e;
}
function hr(t) {
  const e = t.length;
  if (e < Be || e > Ue)
    throw new Error(`NIP-44 plaintext length must be between ${Be} and ${Ue} bytes on this platform.`);
  const n = pr(e), r = ct(e), s = new Uint8Array(n.length + r);
  return s.set(n, 0), s.set(t, n.length), s;
}
function yr(t) {
  const e = new DataView(t.buffer, t.byteOffset, t.byteLength), n = e.getUint16(0, !1);
  let r, s;
  if (n === 0) {
    if (r = e.getUint32(2, !1), s = 6, r < Zt)
      throw new Error("NIP-44 payload has inconsistent padding.");
  } else
    r = n, s = 2;
  if (r < Be || r > lr || t.length !== s + ct(r))
    throw new Error("NIP-44 payload has inconsistent padding.");
  return t.slice(s, s + r);
}
function en(t, e, n) {
  return Cn(jn, t, rt(e, n));
}
function gr(t, e) {
  return br(t, e, $n(32));
}
function br(t, e, n) {
  if (n.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const { chachaKey: r, chachaNonce: s, hmacKey: o } = Qt(t, n), i = hr(Le(e)), c = Jt(r, s, i), l = en(o, n, c);
  return Dt.encode(rt(new Uint8Array([Yt]), n, c, l));
}
function mr(t, e) {
  if (e.startsWith("#"))
    throw new Error("Unsupported NIP-44 non-base64 encoding.");
  if (e.length < ur || e.length > dr)
    throw new Error("NIP-44 payload size is outside this platform's supported range.");
  const n = Dt.decode(e);
  if (n.length < fr || n.length > qt)
    throw new Error("NIP-44 decoded payload size is outside this platform's supported range.");
  if (n[0] !== Yt)
    throw new Error(`Unsupported NIP-44 version: ${n[0]}`);
  const r = n.slice(1, 33);
  if (r.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const s = n.slice(n.length - 32), o = n.slice(33, n.length - 32), { chachaKey: i, chachaNonce: c, hmacKey: l } = Qt(t, r), f = en(l, r, o);
  if (!Rn(s, f))
    throw new Error("NIP-44 MAC verification failed: payload is corrupted, tampered, or uses the wrong key.");
  const a = Jt(i, c, o);
  return Dn(yr(a));
}
const Se = /^[0-9a-f]{64}$/u, wr = "nswp:share", We = "client", X = { most: 4, whole: 1e4, least: 10, label: 32 };
function Ar(t) {
  if (typeof t != "string") return "";
  const e = t.trim();
  if (!e || e.length > X.label) return "";
  for (const n of e) {
    const r = n.codePointAt(0);
    if (r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279) return "";
  }
  return e;
}
function vr(t, e) {
  const n = (o) => ({ ok: !1, why: o });
  if (!Array.isArray(t)) return n("not-a-share");
  const r = t.filter((o) => Array.isArray(o) && o[0] === wr);
  if (r.length === 0) return { ok: !0, shares: [] };
  if (typeof e != "string" || !Se.test(e)) return n("no-seller");
  if (r.length > X.most) return n("too-many");
  const s = [];
  for (const o of r) {
    const [, i, c, l] = o;
    if (o.length < 3 || o.length > 4 || typeof i != "string" || i !== We && !Se.test(i) || typeof c != "string" || !/^[1-9][0-9]{0,4}$/u.test(c) || Number(c) > X.whole) return n("not-a-share");
    const f = l === void 0 ? i === We ? "client" : i === e ? "seller" : "share" : Ar(l);
    if (!f) return n("not-a-share");
    if (s.some((a) => a.to === i)) return n("twice");
    s.push({ to: i, parts: Number(c), label: f });
  }
  return s.some((o) => o.to === e) ? s.reduce((o, i) => o + i.parts, 0) !== X.whole ? n("not-whole") : { ok: !0, shares: s } : n("no-seller");
}
function so(t, e, n, r = {}) {
  const s = (a) => ({ ok: !1, why: a }), o = r.charge ?? 0;
  if (typeof t != "number" || !Number.isSafeInteger(t) || t < 1 || !Number.isSafeInteger(t * X.whole) || !Number.isSafeInteger(o) || o < 0) return s("not-a-price");
  if (typeof n != "string" || !Se.test(n) || e.length > 0 && !e.some((a) => a.to === n)) return s("no-seller");
  const i = typeof r.client == "string" && Se.test(r.client) && r.client !== n ? r.client : null, c = /* @__PURE__ */ new Map();
  for (const a of e) {
    if (a.to === n) continue;
    const u = a.to === We ? i : a.to;
    if (!u) continue;
    const d = Math.floor(t * a.parts / X.whole), h = c.get(u);
    c.set(u, h ? { sats: h.sats + d, label: h.label } : { sats: d, label: a.label });
  }
  const l = [...c.values()].reduce((a, u) => a + u.sats, 0), f = [...c].map(([a, u]) => ({ to: a, sats: u.sats, label: u.label, seller: !1 }));
  return f.sort((a, u) => a.sats - u.sats || (a.to < u.to ? -1 : 1)), f.push({ to: n, sats: t - l - o, label: e.find((a) => a.to === n)?.label ?? "seller", seller: !0 }), f.some((a) => a.sats < X.least) ? s("too-small") : { ok: !0, parts: f };
}
const Fe = /^[0-9a-f]{64}$/u, Sr = 30078, kr = 30078, _r = "bitunlock:entitlement:v1:", tn = "seller-unlock-service-v1", nn = [{ endpoint: "https://api.bitunlock.network", pubkey: "66be61cf5b8d286391f7b1a72ffa7c799ec2dc49eff0830c40df1cc964e6787d" }], Er = /^(?:localhost|127(?:\.[0-9]{1,3}){3}|10(?:\.[0-9]{1,3}){3}|192\.168(?:\.[0-9]{1,3}){2}|172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})$/u;
function oo(t) {
  if (typeof t != "string" || t.length > 300) return null;
  const [e, n] = t.split("|");
  try {
    const r = new URL(e ?? "");
    return r.protocol !== "http:" && r.protocol !== "https:" || !Er.test(r.hostname) || r.origin !== e ? null : n && Fe.test(n) ? { endpoint: r.origin, pubkey: n } : null;
  } catch {
    return null;
  }
}
function ie(t) {
  return typeof t == "string" && /^30078:[0-9a-f]{64}:[^:\r\n][^\r\n]{0,255}$/u.test(t) ? t : "";
}
const lt = (t) => t.slice(6, 70), Ir = 500, io = (t) => t.nswp && t.priceSats < Ir, B = (t, e) => {
  const n = t.tags.find((r) => r[0] === e);
  return typeof n?.[1] == "string" ? n[1] : "";
}, It = (t, e) => typeof t == "string" ? Array.from(t.normalize("NFC")).filter((n) => {
  const r = n.codePointAt(0);
  return r >= 32 && r !== 127 && !(r >= 8203 && r <= 8207) && !(r >= 8234 && r <= 8238) && !(r >= 8294 && r <= 8297);
}).join("").trim().slice(0, e) : "";
function ao(t, e, n = nn) {
  const r = ie(e), s = t;
  if (!r || !s || typeof s != "object" || !Array.isArray(s.tags) || !z(s) || s.kind !== Sr || s.pubkey !== lt(r) || `30078:${s.pubkey}:${B(s, "d")}` !== r || B(s, "status") !== "active" || B(s, "br:delivery") !== tn) return null;
  const o = s.tags.find((a) => a[0] === "price"), i = o && o[2] === "SAT" && /^[1-9][0-9]{0,11}$/u.test(o[1] ?? "") ? Number(o[1]) : 0, c = n.find((a) => a.endpoint === B(s, "br:unlock-service") && a.pubkey === B(s, "br:unlock-service-pubkey"));
  if (!i || !c) return null;
  let l = {};
  try {
    const a = JSON.parse(s.content || "{}");
    a && typeof a == "object" && (l = a);
  } catch {
    l = {};
  }
  const f = B(s, "nswp:term");
  return {
    coordinate: r,
    seller: s.pubkey,
    title: It(B(s, "title") || l.title || l.name, 80) || It(B(s, "d"), 80),
    priceSats: i,
    service: { ...c },
    for: /^3730[0-9]:[0-9a-f]{64}:[^\s]{1,200}$/u.test(B(s, "nswp:for")) ? B(s, "nswp:for") : "",
    termSeconds: /^[1-9][0-9]{0,9}$/u.test(f) ? Number(f) : 0,
    nswp: s.tags.some((a) => typeof a[0] == "string" && a[0].startsWith("nswp:")),
    shared: s.tags.some((a) => a[0] === "nswp:share"),
    shares: ((a) => a.ok ? a.shares : null)(vr(s.tags, s.pubkey))
  };
}
function Nr(t, e = nn) {
  const n = t;
  if (!n || typeof n != "object" || !Array.isArray(n.tags) || typeof n.content != "string" || n.content.length > 8e3 || n.kind !== kr || !e.some((d) => d.pubkey === n.pubkey) || !z(n)) return null;
  let r;
  try {
    r = JSON.parse(n.content);
  } catch {
    return null;
  }
  if (!r || typeof r != "object" || r.schemaVersion !== 1 || r.protocolVersion !== tn || r.status !== "active") return null;
  const s = (d) => typeof d == "string" && d.length > 0 && d.length <= 200 ? d : "", o = ie(r.productCoordinate), [i, c, l, f] = [s(r.buyerPubkey), s(r.sellerPubkey), s(r.orderId), s(r.fulfillmentId)], a = typeof r.issuedAt == "number" && Number.isSafeInteger(r.issuedAt) && r.issuedAt > 0 ? r.issuedAt : 0;
  if (!o || !Fe.test(i) || !Fe.test(c) || c !== lt(o) || !l || !f || !a || B(n, "d") !== _r + f) return null;
  let u = 0;
  if (r.accessPolicy !== "perpetual-v1") {
    const d = r.accessPolicy;
    if (!d || typeof d != "object" || d.kind !== "term-v1" || typeof d.expiresAt != "number" || !Number.isSafeInteger(d.expiresAt) || d.expiresAt <= a) return null;
    u = d.expiresAt;
  }
  return { event: { id: n.id, pubkey: n.pubkey, created_at: n.created_at, kind: n.kind, tags: n.tags.map((d) => [...d]), content: n.content, sig: n.sig }, listing: o, seller: c, buyer: i, order: l, fulfillment: f, issuedAt: a, expiresAt: u, service: n.pubkey };
}
function Lr(t, e) {
  return !!t && t.buyer === e.buyer && t.listing === e.listing && (t.expiresAt === 0 || e.now < t.expiresAt);
}
function co(t, e) {
  const n = t.filter((r) => Lr(r, e));
  return n.sort((r, s) => r.expiresAt === 0 ? -1 : s.expiresAt === 0 ? 1 : s.expiresAt - r.expiresAt), n[0] ?? null;
}
function lo(t, e, n) {
  return e.publishers.includes(lt(t)) || !!n && n === e.site;
}
const rn = 37304, ze = {
  /** The most a save may hold, in bytes of UTF-8. It has to fit in one note that any relay will take. */
  dataBytes: 32768,
  /** No more saves than this for one world in `perMs`, and in an hour. Counted apart from notes and passes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** A save handed over to be opened is not read past this many characters of content. */
  contentChars: 7e4
}, Or = /^[a-z0-9][a-z0-9-]{0,31}$/u, xr = /^[0-9a-f]{64}$/u, Tr = "Something a world keeps for its visitor. Only they can read it.";
function G(t) {
  return typeof t == "string" && Or.test(t) ? t : "";
}
function ut(t) {
  return typeof t == "string" && t.length <= ze.dataBytes && Le(t).length <= ze.dataBytes;
}
function sn(t, e, n) {
  const r = w(e), s = G(n);
  return !r || !s ? "" : Kn(Bn(t, Le(`nswp-save
${r}
${s}`)));
}
function uo(t) {
  const e = w(t.world), n = G(t.slot), r = sn(t.conversationKey, e, n);
  if (!r || !ut(t.data)) return null;
  const s = JSON.stringify({ v: 1, world: e, slot: n, data: t.data });
  return {
    kind: rn,
    created_at: Math.floor(t.nowSeconds),
    tags: [
      ["d", r],
      ["alt", Tr]
    ],
    content: gr(t.conversationKey, s)
  };
}
function fo(t, e) {
  const n = w(e.world);
  if (!n || !t || typeof t != "object" || !xr.test(e.pubkey)) return null;
  const r = t;
  if (r.kind !== rn || r.pubkey !== e.pubkey || typeof r.content != "string" || r.content.length > ze.contentChars || !Array.isArray(r.tags)) return null;
  let s;
  try {
    s = JSON.parse(mr(e.conversationKey, r.content));
  } catch {
    return null;
  }
  if (!s || typeof s != "object" || s.v !== 1 || s.world !== n) return null;
  const o = G(s.slot);
  if (!o || !ut(s.data)) return null;
  const i = r.tags.find((c) => Array.isArray(c) && c[0] === "d");
  return !i || i[1] !== sn(e.conversationKey, n, o) ? null : { slot: o, data: s.data, at: typeof r.created_at == "number" && Number.isInteger(r.created_at) ? r.created_at : 0 };
}
const ft = 30078, on = "nswp", J = { read: 2e3, write: 500, ahead: 600, root: 4 }, Mr = /^[0-9a-f]{64}$/u, $r = /^[0-9a-f]{128}$/u, Rr = /^[a-z0-9][a-z0-9._-]{0,63}$/u, Dr = /^([^:]*):governance:([^:]*):v([^:]*):([\s\S]*)$/u, Y = (t) => typeof t == "string" && Mr.test(t);
function be(t) {
  if (typeof t != "string") return !1;
  const e = /^(0|[1-9][0-9]{0,4}):([0-9a-f]{64}):([\s\S]*)$/u.exec(t);
  if (!e || Number(e[1]) > 65535) return !1;
  const n = e[3];
  if (!n || new TextEncoder().encode(n).length > 512) return !1;
  for (const r of n) {
    const s = r.codePointAt(0);
    if (s <= 31 || s === 127) return !1;
  }
  return !0;
}
const Pr = (t, e) => `${on}:governance:${t}:v1:${e}`, an = (t) => {
  const e = t;
  return !!e && typeof e == "object" && Y(e.id) && Y(e.pubkey) && typeof e.sig == "string" && $r.test(e.sig) && Number.isInteger(e.kind) && Number.isInteger(e.created_at) && typeof e.content == "string" && Array.isArray(e.tags) && e.tags.every((n) => Array.isArray(n) && n.every((r) => typeof r == "string"));
}, cn = (t) => {
  const e = Array.isArray(t) ? t : [t];
  return e.length >= 1 && e.length <= J.root && e.every(Y) ? [...new Set(e)] : null;
}, ln = (t) => {
  try {
    return z({ ...t, tags: t.tags.map((e) => [...e]) });
  } catch {
    return !1;
  }
};
function He(t, e = {}) {
  const n = (p) => ({ ok: !1, reason: p }), r = e.now ?? Math.floor(Date.now() / 1e3);
  if (!an(t)) return n("not_an_event");
  const s = t;
  if (s.kind !== ft) return n("wrong_kind");
  const o = s.tags.filter((p) => p[0] === "d"), i = o.length === 1 ? Dr.exec(o[0][1] ?? "") : null;
  if (!i || !Rr.test(i[1]) || !/^[0-9]+$/u.test(i[3])) return n("bad_d");
  const [, , c, l, f] = i;
  if (l !== "1") return n("unsupported_version");
  if (c !== "user-allow" && c !== "user-deny") return n("unsupported_scope");
  if (!be(f)) return n("bad_subject");
  const a = (p, m) => {
    const b = s.tags.filter((A) => A[0] === p);
    return b.length === 1 && b[0][1] === m;
  };
  if (!a("v", l) || !a("scope", c) || !a("subject", f)) return n("tag_mismatch");
  const u = e.root === void 0 ? [f.slice(f.indexOf(":") + 1, f.indexOf(":") + 65)] : cn(e.root);
  if (!u || !u.includes(s.pubkey)) return n("wrong_signer");
  if (s.content !== "") return n("content_not_empty");
  const d = s.tags.filter((p) => p[0] === "p");
  if (d.length > J.read) return n("too_many_entries");
  if (s.created_at > r + J.ahead) return n("from_the_future");
  if (!ln(s)) return n("bad_signature");
  const h = [];
  let g = 0;
  for (const p of d)
    Y(p[1]) ? h.includes(p[1]) || h.push(p[1]) : g++;
  return h.sort(), { ok: !0, scope: c, subject: f, signer: s.pubkey, entries: h, skipped: g };
}
function po(t, e) {
  const n = e.now ?? Math.floor(Date.now() / 1e3), r = `${e.namespace ?? on}:governance:${e.scope}:v1:${e.subject}`, s = e.root === void 0 ? be(e.subject) ? [e.subject.split(":")[1]] : null : cn(e.root);
  if (!s) return { ok: !1, reason: "wrong_signer", futureDated: [] };
  const o = [], i = [], c = /* @__PURE__ */ new Set();
  for (const l of t) {
    if (!an(l) || l.kind !== ft || !s.includes(l.pubkey) || c.has(l.id)) continue;
    const f = l.tags.filter((a) => a[0] === "d");
    f.length !== 1 || f[0][1] !== r || !ln(l) || (c.add(l.id), l.created_at > n + J.ahead ? i.push(l.id) : o.push(l));
  }
  return o.length ? (o.sort((l, f) => f.created_at - l.created_at || (l.id < f.id ? -1 : 1)), { ...He(o[0], { root: s, now: n }), futureDated: i }) : { ok: !1, reason: "not_found", futureDated: i };
}
function ho(t) {
  const e = [...new Set(t.people)].sort();
  if (!be(t.subject) || e.length > J.write || !e.every(Y) || !Number.isSafeInteger(t.createdAt)) return null;
  const n = Number.isSafeInteger(t.notBefore) && t.notBefore + 1 > t.createdAt ? t.notBefore + 1 : t.createdAt;
  return { kind: ft, created_at: n, content: "", tags: [["d", Pr(t.scope, t.subject)], ["v", "1"], ["scope", t.scope], ["subject", t.subject], ...e.map((r) => ["p", r])] };
}
const un = ["allow", "unallow", "block", "unblock"], Nt = (t) => t === "allow" || t === "unallow" ? "user-allow" : "user-deny";
function Cr(t, e, n) {
  const r = t.includes(n);
  return e === "allow" || e === "block" ? r ? null : [...t, n].sort() : r ? t.filter((s) => s !== n) : null;
}
function yo(t, e, n) {
  const r = /^37300:([0-9a-f]{64}):([\s\S]{1,128})$/u.exec(n), s = t;
  if (!r || !s || typeof s != "object" || !s.publishers || !s.worlds || typeof s.publishers != "object" || typeof s.worlds != "object") return null;
  const [, o, i] = r, c = (d) => {
    const h = s.publishers[d]?.worlds;
    return Array.isArray(h) && h.includes(i);
  };
  if (!Object.prototype.hasOwnProperty.call(s.worlds, i) || !c(o)) return null;
  const l = s.worlds[i];
  let f = "";
  try {
    f = new URL(String(l.entry?.url)).origin;
  } catch {
    return null;
  }
  if (f !== e) return null;
  const a = Array.isArray(l.keepers) ? [...new Set(l.keepers.filter(Y))] : [], u = a.length ? a.slice(0, J.root) : Object.keys(s.publishers).filter((d) => Y(d) && c(d)).slice(0, J.root);
  return u.length ? { coordinate: n, keepers: u, d: i } : null;
}
function go(t, e) {
  const n = He(t, { root: [e.pubkey], now: e.now });
  if (!n.ok || n.subject !== e.world || n.scope !== Nt(e.change) || n.skipped !== 0) return !1;
  const r = e.list === null ? [] : ((o) => o.ok && o.subject === e.world && o.scope === Nt(e.change) ? o.entries : null)(He(e.list, { root: [e.pubkey], now: e.now }));
  if (!r) return !1;
  const s = Cr(r, e.change, e.key);
  return !!s && JSON.stringify(s) === JSON.stringify(n.entries) && Math.abs(t.created_at - e.now) < 600;
}
const Ge = 3, bo = { burst: 6, perMs: 6e4, hourly: 60 }, we = {
  /** A list handed over to be changed is not read past this many tags, or this much content. */
  tags: 2e4,
  contentChars: 1e5,
  tagItems: 16,
  tagChars: 1e3
}, jr = ["follows", "messages"];
function fe(t) {
  return Array.isArray(t) ? jr.filter((e) => t.includes(e)) : [];
}
const Kr = ["nswp:world", "bitlogin:site"], Br = /^[0-9a-f]{64}$/u;
function Lt(t, e) {
  if (t && (t.kind !== Ge || !Array.isArray(t.tags)) || !t && !e.fromNothing) return null;
  const n = typeof e.add == "string" ? e.add.toLowerCase() : "", r = typeof e.remove == "string" ? e.remove.toLowerCase() : "";
  if (n === "" == (r === "")) return null;
  const s = n || r;
  if (!Br.test(s) || n && (t?.pubkey ?? e.pubkey) === n) return null;
  const o = t ? t.tags.filter((a) => Array.isArray(a) && a.every((u) => typeof u == "string") && !Kr.includes(a[0] ?? "")) : [], i = (a) => a[0] === "p" && typeof a[1] == "string" && a[1].toLowerCase() === s, c = o.some(i);
  if (n ? c : !c) return null;
  const l = n ? [...o.map((a) => [...a]), ["p", n]] : o.filter((a) => !i(a)).map((a) => [...a]), f = Math.max(Math.floor(e.nowSeconds), t ? t.created_at + 1 : 0);
  return { kind: Ge, created_at: f, tags: l, content: typeof t?.content == "string" ? t.content : "" };
}
function Ur(t, e) {
  if (!t || typeof t != "object") return null;
  const n = t;
  if (n.kind !== Ge || n.pubkey !== e || !Array.isArray(n.tags) || n.tags.length > we.tags || typeof n.content != "string" || n.content.length > we.contentChars) return null;
  for (const r of n.tags)
    if (!Array.isArray(r) || r.length > we.tagItems || !r.every((s) => typeof s == "string" && s.length <= we.tagChars)) return null;
  return z(t) ? t : null;
}
function mo(t) {
  const e = { add: t.add, remove: t.remove, nowSeconds: t.nowSeconds, pubkey: t.pubkey };
  if (t.list === null || t.list === void 0) return t.seen ? null : Lt(null, { ...e, fromNothing: !0 });
  const n = Ur(t.list, t.pubkey);
  return !n || t.seen && n.created_at < t.seen ? null : Lt(n, e);
}
function wo(t, e) {
  return t === null ? e.answered > 0 && e.newestAt === 0 : t.created_at >= e.newestAt;
}
const fn = (t) => typeof t == "string" && t.includes("*") ? he(t) : w(t), Wr = 30078, Fr = "bitlogin:taken-back:v1", zr = 10002, U = {
  /** No more sites than this are listed. */
  sites: 200,
  /** An entry older than the longest a grant can live ends nothing that is left, and may be dropped. In seconds. */
  entrySec: 744 * 3600,
  /** A grant is checked when its last check is older than this. In seconds. */
  checkEverySec: 24 * 3600,
  /** A grant that has gone this long without a check that succeeded is locked until one does. In seconds. */
  staleSec: 72 * 3600,
  /** How many of the user's own write relays are carried to a signer. */
  relays: 4,
  /** How far ahead of this clock a record may be dated and still be believed. In seconds. */
  skewSec: 600
}, Ao = { allBefore: 0, sites: [] }, dn = /^[0-9a-f]{32}$/u, Me = (t) => typeof t == "number" && Number.isFinite(t) && t > 0 ? Math.floor(t) : 0;
function vo(t) {
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const e = t;
  if (e.v !== 1 || !Array.isArray(e.sites)) return null;
  const n = /* @__PURE__ */ new Map();
  for (const s of e.sites.slice(0, U.sites * 2)) {
    if (!s || typeof s != "object") continue;
    const o = s, i = fn(o.site), c = Me(o.before);
    !i || i !== o.site || !c || n.set(i, Math.max(n.get(i) ?? 0, c));
  }
  const r = /* @__PURE__ */ new Map();
  for (const s of Array.isArray(e.devices) ? e.devices.slice(0, U.sites * 2) : []) {
    const o = s ?? {}, i = Me(o.before);
    typeof o.device != "string" || !dn.test(o.device) || !i || r.set(o.device, Math.max(r.get(o.device) ?? 0, i));
  }
  return { allBefore: Me(e.all_before), sites: [...n].map(([s, o]) => ({ site: s, before: o })), ...r.size ? { devices: [...r].map(([s, o]) => ({ device: s, before: o })) } : {} };
}
const So = (t) => JSON.stringify({ v: 1, all_before: t.allBefore, sites: t.sites, ...t.devices?.length ? { devices: t.devices } : {} });
function $e(t, e, n) {
  const r = Math.max(t.allBefore, e.allBefore), s = /* @__PURE__ */ new Map();
  for (const { site: l, before: f } of [...t.sites, ...e.sites]) s.set(l, Math.max(s.get(l) ?? 0, f));
  const o = [...s].map(([l, f]) => ({ site: l, before: f })).filter((l) => l.before > r && l.before + U.entrySec > n).sort((l, f) => f.before - l.before).slice(0, U.sites), i = /* @__PURE__ */ new Map();
  for (const { device: l, before: f } of [...t.devices ?? [], ...e.devices ?? []]) i.set(l, Math.max(i.get(l) ?? 0, f));
  const c = [...i].map(([l, f]) => ({ device: l, before: f })).filter((l) => l.before > r && l.before + U.entrySec > n).sort((l, f) => f.before - l.before).slice(0, U.sites);
  return { allBefore: r, sites: o, ...c.length ? { devices: c } : {} };
}
function ko(t, e, n) {
  const r = Math.floor(n);
  if ("all" in e) return $e(t, { allBefore: r, sites: [] }, r);
  if ("device" in e) return dn.test(e.device) ? $e(t, { allBefore: 0, sites: [], devices: [{ device: e.device, before: r }] }, r) : t;
  const s = fn(e.site);
  return s ? $e(t, { allBefore: 0, sites: [{ site: s, before: r }] }, r) : t;
}
function _o(t, e, n, r) {
  if (t.allBefore >= n || r && (t.devices ?? []).some((o) => o.device === r && o.before >= n)) return !0;
  const s = he(e);
  return t.sites.some(
    (o) => o.before >= n && (o.site === e || (s ? Ot(o.site, s) : !!he(o.site) && Ot(e, o.site)))
  );
}
function Eo(t, e, n) {
  let r = null;
  for (const s of t)
    !z(s) || s.kind !== Wr || s.pubkey !== e || s.tags.some((o) => o[0] === "d" && o[1] === Fr) && (s.created_at > n + U.skewSec || (!r || s.created_at > r.created_at) && (r = s));
  return r;
}
function dt(t) {
  const e = t.toLowerCase().replace(/\.$/u, "");
  if (!e.includes(".") || e.startsWith("[") || e.includes(":") || /^[0-9.]+$/u.test(e) || /^0x/u.test(e)) return !1;
  const n = e.split(".");
  return !n.every((r) => /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/u.test(r)) || /^[0-9]+$/u.test(n[n.length - 1]) ? !1 : !["localhost", "local", "internal", "lan", "home", "intranet", "private", "corp", "test", "invalid", "onion"].includes(n[n.length - 1]);
}
function Hr(t, e = U.relays) {
  if (!Array.isArray(t)) return [];
  const n = [];
  for (const r of t) {
    if (typeof r != "string" || r.length > 200 || !Yn(r)) continue;
    let s;
    try {
      s = new URL(r);
    } catch {
      continue;
    }
    if (s.protocol !== "wss:" || s.search || !dt(s.hostname)) continue;
    const o = `${s.protocol}//${s.host}${s.pathname === "/" ? "" : s.pathname}`;
    if (n.includes(o) || n.push(o), n.length >= e) break;
  }
  return n;
}
function Io(t, e, n = U.relays) {
  let r = null;
  for (const s of t)
    !z(s) || s.kind !== zr || s.pubkey !== e || (!r || s.created_at > r.created_at) && (r = s);
  return r ? Hr(
    r.tags.filter((s) => s[0] === "r" && (s[2] === void 0 || s[2] === "write")).map((s) => s[1]),
    n
  ) : [];
}
function No(t) {
  return t.answered < Math.min(2, t.asked) || t.answered === 0 ? !1 : t.newestAt === null ? t.seenAt === 0 : t.readable && t.newestAt >= t.seenAt;
}
function Lo(t, e, n) {
  const r = Math.max(n, 0);
  return r && t - r < U.checkEverySec ? "fresh" : t - Math.max(r, e) >= U.staleSec ? "overdue" : "due";
}
const Xe = "https://*.", Gr = ["bitblocks.network"];
function he(t) {
  if (typeof t != "string" || t.length > 260 || !t.startsWith(Xe)) return "";
  const e = t.slice(Xe.length);
  return e !== e.toLowerCase() || e.endsWith(".") || !dt(e) ? "" : t;
}
const pn = (t) => he(t) ? t.slice(Xe.length) : "";
function Ot(t, e) {
  const n = pn(e);
  if (!n || typeof t != "string") return !1;
  try {
    const r = new URL(t);
    return r.protocol !== "https:" || r.port || r.origin !== t || !dt(r.hostname) ? !1 : r.hostname === n || r.hostname.endsWith(`.${n}`);
  } catch {
    return !1;
  }
}
const Oo = (t) => Gr.includes(pn(t)), Ve = 14, hn = 13, Xr = 1059, Vr = 10050, ke = {
  /** The most characters in one message. */
  chars: 2e3,
  /** No more than this many relays are put in a list of where messages reach someone. */
  relays: 4,
  /** A wrap handed over to be opened is not read past this many characters of content. */
  wrapChars: 6e4
}, xo = { burst: 10, perMs: 6e4, hourly: 200 }, To = { burst: 600, perMs: 6e4, hourly: 12e3 }, Mo = { burst: 3, perMs: 6e4, hourly: 12 }, _e = /^[0-9a-f]{64}$/u, Jr = [
  [0, 9],
  [11, 31],
  [127, 159],
  [8203, 8204],
  [8206, 8207],
  [8232, 8239],
  [8288, 8303],
  [65279, 65279],
  [65529, 65531]
];
function Ee(t) {
  if (typeof t != "string") return "";
  let e = "";
  for (const n of t.slice(0, ke.chars * 8).normalize("NFC")) {
    const r = n.codePointAt(0);
    e += Jr.some(([s, o]) => r >= s && r <= o) ? " " : n;
  }
  return e = e.replace(/[^\S\n]+/gu, " ").replace(/ ?\n ?/gu, `
`).replace(/\n{3,}/gu, `

`).trim(), [...e].slice(0, ke.chars).join("").trim();
}
function Yr(t) {
  const e = Ee(t.text);
  if (!_e.test(t.from) || typeof t.to != "string" || !_e.test(t.to) || t.from === t.to || !e) return null;
  const n = { kind: Ve, pubkey: t.from, created_at: Math.floor(t.nowSeconds), tags: [["p", t.to]], content: e };
  return { ...n, id: Pt(n) };
}
function $o(t, e) {
  const n = t.getPublicKey(), r = Yr({ from: n, to: e.to, text: e.text, nowSeconds: e.nowSeconds });
  if (!r) return null;
  const s = JSON.stringify(r), o = (i) => t.signEvent({ kind: hn, created_at: Math.floor(e.nowSeconds), tags: [], content: t.nip44Encrypt(i, s) });
  return { message: r, seals: [o(r.tags[0][1]), o(n)] };
}
function Zr(t) {
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    return null;
  }
  return !z(e) || e.kind !== hn || e.tags.length !== 0 ? null : e;
}
function Qr(t, e, n) {
  let r;
  try {
    r = JSON.parse(t);
  } catch {
    return null;
  }
  if (!r || typeof r != "object" || r.kind !== Ve || r.pubkey !== e || typeof r.pubkey != "string" || !_e.test(r.pubkey) || typeof r.content != "string" || typeof r.created_at != "number" || !Number.isInteger(r.created_at) || !Array.isArray(r.tags) || !r.tags.every((c) => Array.isArray(c) && c.every((l) => typeof l == "string"))) return null;
  const s = [...new Set(r.tags.filter((c) => c[0] === "p" && typeof c[1] == "string" && _e.test(c[1])).map((c) => c[1]))], o = Ee(r.content);
  return s.length === 0 || !o || r.pubkey !== n && !s.includes(n) ? null : { id: Pt({ kind: Ve, pubkey: r.pubkey, created_at: r.created_at, tags: r.tags, content: r.content }), from: r.pubkey, to: s, text: o, at: r.created_at };
}
function Ro(t, e) {
  const n = t.getPublicKey();
  if (!e || typeof e != "object") return null;
  const r = e;
  if (r.kind !== Xr || typeof r.content != "string" || r.content.length > ke.wrapChars || !Array.isArray(r.tags) || r.tags.length > 20 || !z(e) || !e.tags.some((s) => s[0] === "p" && s[1] === n)) return null;
  try {
    const s = Zr(t.nip44Decrypt(e.pubkey, e.content));
    return s ? Qr(t.nip44Decrypt(s.pubkey, s.content), s.pubkey, n) : null;
  } catch {
    return null;
  }
}
function qr(t) {
  if (typeof t != "string" || t.length > 200) return "";
  try {
    const e = new URL(t.trim()), n = e.hostname;
    return e.protocol !== "wss:" || e.username || e.password || !n.includes(".") || n.startsWith("[") || /^[0-9.]+$/u.test(n) || /\.(local|localhost|internal|lan|home)$/iu.test(n) ? "" : (e.hash = "", e.href.replace(/\/$/u, ""));
  } catch {
    return "";
  }
}
function Do(t, e) {
  if (!Array.isArray(t) || t.length > 8) return null;
  const n = [...new Set(t.map(qr).filter(Boolean))].slice(0, ke.relays);
  return n.length === 0 ? null : { kind: Vr, created_at: Math.floor(e), tags: n.map((r) => ["relay", r]), content: "" };
}
const es = 37306, xt = 37300, Je = {
  /** No more scores than this for one world in `perMs`, and in an hour. Counted apart from notes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** The most a score may be. */
  most: 9007199254740991,
  /** The longest a board's title may be, in characters. */
  title: 60
}, ts = /^[a-z0-9][a-z0-9-]{0,31}$/u, ns = /^(\d+):([0-9a-f]{64}):(.*)$/su;
function re(t) {
  if (typeof t != "string" || t.length > 200) return "";
  const e = ns.exec(t);
  return e && Number(e[1]) === xt && e[3] !== "" ? `${xt}:${e[2]}:${e[3]}` : "";
}
function Ye(t) {
  return typeof t == "string" && ts.test(t) ? t : "";
}
function Ze(t) {
  const e = typeof t == "string" && /^\d{1,16}$/u.test(t) ? Number(t) : t;
  return typeof e == "number" && Number.isSafeInteger(e) && e >= 0 && e <= Je.most ? e : null;
}
function Qe(t) {
  if (typeof t != "string") return "";
  let e = "";
  for (const n of t.slice(0, Je.title * 8).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    e += s ? " " : n;
  }
  return [...e.replace(/\s+/gu, " ").trim()].slice(0, Je.title).join("").trim();
}
function rs(t, e) {
  if (t !== "time") return String(e).replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
  const n = Math.round(e / 100), r = Math.floor(n / 600), s = n % 600 / 10;
  return r ? `${r} min ${s.toFixed(1)} s` : `${s.toFixed(1)} s`;
}
function Po(t) {
  const e = w(t.origin), n = re(t.world), r = Ye(t.board), s = Ze(t.score);
  if (!e || !n || !r || s === null) return null;
  const o = Qe(t.title), i = t.format === "time" ? "time" : "number";
  return {
    kind: es,
    created_at: Math.floor(t.nowSeconds),
    tags: [
      ["d", `${n}/${r}`],
      ["a", n],
      ["board", r, ...o ? [o] : []],
      ["score", String(s), ...i === "time" ? ["time"] : []],
      ["alt", `A score in a world: ${o ? `${o}: ` : ""}${rs(i, s)}`],
      [Ie, e]
    ],
    content: ""
  };
}
const ss = 37307, Tt = {
  /** No more than this many for one world in `perMs`, and in an hour. Counted apart from notes and scores. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** The longest a title may be, in characters. */
  title: 60
}, os = /^[a-z0-9][a-z0-9-]{0,31}$/u;
function qe(t) {
  return typeof t == "string" && os.test(t) ? t : "";
}
function et(t) {
  if (typeof t != "string") return "";
  let e = "";
  for (const n of t.slice(0, Tt.title * 8).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    e += s ? " " : n;
  }
  return [...e.replace(/\s+/gu, " ").trim()].slice(0, Tt.title).join("").trim();
}
function Co(t) {
  const e = w(t.origin), n = re(t.world), r = qe(t.id), s = et(t.title);
  return !e || !n || !r || !s ? null : {
    kind: ss,
    created_at: Math.floor(t.nowSeconds),
    tags: [
      ["d", `${n}/${r}`],
      ["a", n],
      ["achievement", r],
      ["title", s],
      ["alt", `An achievement in a world: ${s}`],
      [Ie, e]
    ],
    content: ""
  };
}
const yn = "nswp-signer", gn = "nswp-handoff", Oe = 1, de = {
  /** The longest a note's content may be, in characters. */
  contentChars: 8e3,
  tags: 60,
  tagItems: 8,
  tagChars: 400,
  /** How long a remembered site BitLogin knows stays allowed, in seconds: thirty days from Allow, unless the user signs out of it sooner. */
  grantSec: 720 * 3600,
  /** The same for a site BitLogin does not know: seven days (§SW11). */
  unknownGrantSec: 168 * 3600,
  /** How long a site that is not remembered stays allowed while its page stays open, in seconds (§SW11). */
  visitSec: 12 * 3600,
  /** No more than this many signatures for one site in `perMs`. The same numbers as NSWP's own (kit 0.28.0). */
  burst: 3,
  perMs: 6e4,
  /** And no more than this many in an hour. */
  hourly: 20,
  /** Room passes are counted apart from notes (§SW16), so signing in does not use up a post: this many in `perMs`. */
  passBurst: 2,
  /** And this many in an hour. */
  passHourly: 10
}, is = [1, 7], as = [4, 13, 14, 15, 1059, 1060, 13194, 22242, 23194, 23195, 24133, 27235, 27300, 27301, 30078], cs = [0, 5, 10002], jo = { burst: 2, perMs: 6e4, hourly: 10 }, Ko = 5 * 6e4;
function pt(t) {
  return typeof t != "number" || !Number.isInteger(t) || t < 0 || t > 65535 || as.includes(t) ? "never" : is.includes(t) ? "ordinary" : "careful";
}
const Ie = "nswp:world";
function w(t) {
  if (typeof t != "string" || t.length > 300) return "";
  try {
    const e = new URL(t);
    return (e.protocol === "https:" || e.protocol === "http:") && e.origin !== "null" ? e.origin : "";
  } catch {
    return "";
  }
}
function tt(t) {
  if (typeof t != "string") return "";
  let e = "";
  for (const n of t.slice(0, 400).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    e += s ? " " : n;
  }
  return [...e.replace(/\s+/gu, " ").trim()].slice(0, 48).join("").trim();
}
function Bo(t, e, n) {
  return ht(t, e, n, (r) => pt(r) === "ordinary");
}
const ls = 27300;
function Uo(t) {
  return !t || t.sign.includes(ls);
}
const Mt = 37308;
function Wo(t, e, n) {
  const r = t, s = r?.kind === Mt && Array.isArray(r.tags) && r.tags.some((o) => Array.isArray(o) && o[0] === "d") && r.tags.filter((o) => Array.isArray(o) && o[0] === "d").every((o) => o[1] === "bag" && o.length === 2);
  return ht(t, e, n, (o) => pt(o) === "ordinary" || o === Mt && s);
}
function us(t, e, n) {
  return ht(t, e, n, (r) => pt(r) === "careful" && cs.includes(r));
}
function ht(t, e, n, r) {
  const s = w(e);
  if (!s || !t || typeof t != "object") return null;
  const o = t;
  if (!r(o.kind) || typeof o.content != "string" || [...o.content].length > de.contentChars || !Array.isArray(o.tags) || o.tags.length > de.tags) return null;
  const i = [];
  for (const c of o.tags) {
    if (!Array.isArray(c) || c.length === 0 || c.length > de.tagItems || !c.every((l) => typeof l == "string" && l.length <= de.tagChars)) return null;
    c[0] !== Ie && i.push([...c]);
  }
  return i.push([Ie, s]), { kind: o.kind, created_at: Math.floor(n), tags: i, content: o.content };
}
function Fo(t = de, e = []) {
  let n = e.filter((r) => typeof r == "number" && Number.isFinite(r));
  return {
    times: () => [...n],
    take(r) {
      return n = n.filter((s) => r - s < 36e5), n.length >= t.hourly || n.filter((s) => r - s < t.perMs).length >= t.burst ? !1 : (n.push(r), !0);
    }
  };
}
const bn = /^[0-9a-z-]{1,40}$/iu, j = /^[0-9a-f]{64}$/u, zo = (t) => ({ nswp: yn, v: Oe, ...t });
function Ho(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.nswp !== yn || e.v !== Oe || typeof e.id != "string" || !bn.test(e.id)) return null;
  if (e.t === "state") return { t: "state", id: e.id };
  if (e.t === "pair") return { t: "pair", id: e.id };
  if (e.t === "pairCancel") return { t: "pairCancel", id: e.id };
  if (e.t === "lock") return { t: "lock", id: e.id };
  if (e.t === "sign" && e.event && typeof e.event == "object") return { t: "sign", id: e.id, event: e.event };
  if (e.t === "propose" && e.event && typeof e.event == "object") return { t: "propose", id: e.id, event: e.event };
  if (e.t === "wallet") return { t: "wallet", id: e.id };
  if (e.t === "pay" && oe(e.invoice)) return { t: "pay", id: e.id, invoice: oe(e.invoice) };
  if (e.t === "tip" && V(e.sats) && (e.to === void 0 || typeof e.to == "string" && j.test(e.to))) return { t: "tip", id: e.id, sats: V(e.sats), ...typeof e.to == "string" ? { to: e.to } : {} };
  if (e.t === "guests" && typeof e.world == "string" && e.world.startsWith("37300:") && be(e.world) && un.includes(e.change) && typeof e.key == "string" && j.test(e.key) && (e.list === null || e.list && typeof e.list == "object"))
    return { t: "guests", id: e.id, world: e.world, list: e.list, change: e.change, key: e.key, none: e.none === !0 };
  if ((e.t === "buy" || e.t === "have") && ie(e.listing)) return { t: e.t, id: e.id, listing: ie(e.listing) };
  if (e.t === "file-pick") return { t: "file-pick", id: e.id };
  if (e.t === "file-save") {
    const n = yt(e);
    return n ? { t: "file-save", id: e.id, ...n, private: e.private !== !1 } : null;
  }
  if (e.t === "pass" && typeof e.session == "string" && j.test(e.session)) return { t: "pass", id: e.id, session: e.session };
  if (e.t === "save" && G(e.slot) && ut(e.data)) return { t: "save", id: e.id, slot: G(e.slot), data: e.data };
  if (e.t === "find" && G(e.slot)) return { t: "find", id: e.id, slot: G(e.slot) };
  if (e.t === "open" && e.event && typeof e.event == "object") return { t: "open", id: e.id, event: e.event };
  if (e.t === "want" && e.permissions === void 0 && Array.isArray(e.more)) return { t: "wantMore", id: e.id, more: fe(e.more) };
  if (e.t === "want" && e.permissions === void 0 && e.more === void 0 && e.family !== void 0) return { t: "wantFamily", id: e.id, family: he(e.family), ...e.guest === !0 ? { guest: !0 } : {} };
  if (e.t === "follow" && (e.list === null || e.list && typeof e.list == "object")) {
    const n = typeof e.add == "string" && j.test(e.add), r = typeof e.remove == "string" && j.test(e.remove);
    return n === r ? null : { t: "follow", id: e.id, list: e.list, ...n ? { add: e.add } : { remove: e.remove } };
  }
  if (e.t === "score" && re(e.world) && Ye(e.board) && Ze(e.score) !== null) return { t: "score", id: e.id, world: re(e.world), board: Ye(e.board), score: Ze(e.score), ...Qe(e.title) ? { title: Qe(e.title) } : {}, ...e.format === "time" ? { format: "time" } : {} };
  if (e.t === "achieve" && re(e.world) && qe(e.achievement) && et(e.title))
    return { t: "achieve", id: e.id, world: re(e.world), achievement: qe(e.achievement), title: et(e.title) };
  if (e.t === "seal" && typeof e.to == "string" && j.test(e.to) && Ee(e.text)) return { t: "seal", id: e.id, to: e.to, text: Ee(e.text) };
  if (e.t === "unwrap" && e.event && typeof e.event == "object") return { t: "unwrap", id: e.id, event: e.event };
  if (e.t === "reach" && Array.isArray(e.relays) && e.relays.length <= 8 && e.relays.every((n) => typeof n == "string" && n.length <= 200)) return { t: "reach", id: e.id, relays: e.relays };
  if (e.t === "want") {
    const n = Ln(e.permissions);
    return n ? { t: "want", id: e.id, permissions: n } : null;
  }
  return (e.t === "encrypt" || e.t === "decrypt") && typeof e.peer == "string" && j.test(e.peer) && typeof e.text == "string" && e.text.length <= 2e5 ? { t: e.t, id: e.id, peer: e.peer, text: e.text, scheme: e.scheme === "nip04" ? "nip04" : "nip44" } : e.t === "read" && e.event && typeof e.event == "object" ? { t: "read", id: e.id, event: e.event } : null;
}
const fs = 2e4, mn = 60, ds = 25 * 1024 * 1024;
function yt(t) {
  if (!t || typeof t != "object") return null;
  const e = t, n = De(e.name), r = e.bytes instanceof Uint8Array ? e.bytes : e.bytes instanceof ArrayBuffer ? new Uint8Array(e.bytes) : null;
  return !n || !r || r.length === 0 || r.length > ds ? null : { name: n, type: typeof e.type == "string" && /^[\x21-\x7e]{3,120}$/u.test(e.type) && e.type.includes("/") ? e.type.toLowerCase() : "application/octet-stream", bytes: r };
}
const Ae = (t) => {
  try {
    const e = new URL(String(t));
    return typeof t == "string" && t.length <= 400 && (e.protocol === "https:" || e.protocol === "http:") ? e.href : "";
  } catch {
    return "";
  }
}, ps = (t) => typeof t == "string" && t.length <= 2e3 && /^nostr\+walletconnect:\/\/[0-9a-f]{64}\?[\x21-\x7e]+$/u.test(t) ? t : "";
function Re(t, e) {
  if (!t || typeof t != "object") return null;
  const n = t;
  if (n.what === "wallet") return { what: "wallet" };
  if (n.what === "pick") return { what: "pick" };
  if (n.what === "save") {
    const s = yt(n);
    return s ? { what: "save", ...s, private: n.private !== !1 } : null;
  }
  if (n.what === "tip") {
    const s = n;
    return !V(s.sats) || s.to !== void 0 && !(typeof s.to == "string" && j.test(s.to)) ? null : { what: "tip", sats: V(s.sats), ...typeof s.to == "string" ? { to: s.to } : {} };
  }
  if (n.what === "guests") {
    const s = n;
    return typeof s.world != "string" || !s.world.startsWith("37300:") || !be(s.world) || !un.includes(s.change) || typeof s.key != "string" || !j.test(s.key) || s.list !== null && !(s.list && typeof s.list == "object") ? null : { what: "guests", world: s.world, list: s.list ?? null, change: s.change, key: s.key, none: s.none === !0 };
  }
  if (n.what === "buy") return ie(n.listing) ? { what: "buy", listing: ie(n.listing) } : null;
  if (n.what === "pay") return oe(n.invoice) ? { what: "pay", invoice: oe(n.invoice) } : null;
  if (n.what !== "sign") return null;
  const r = us(n.event, e, n.event?.created_at ?? 0);
  return r && JSON.stringify(r.tags) === JSON.stringify(n.event.tags) ? { what: "sign", event: r } : null;
}
const Go = (t) => ({ nswp: gn, v: Oe, ...t });
function Xo(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.nswp !== gn || e.v !== Oe || typeof e.nonce != "string" || !bn.test(e.nonce)) return null;
  const n = (r) => typeof r == "string" && j.test(r);
  if (e.t === "hello") return { t: "hello", nonce: e.nonce };
  if (e.t === "frame" && w(e.world) && n(e.recipient)) {
    const r = e.wants === void 0 ? void 0 : Ln(e.wants);
    return r === null ? null : { t: "frame", nonce: e.nonce, world: w(e.world), recipient: e.recipient, ...r ? { wants: r } : {}, ...e.turnedDown === !0 ? { turnedDown: !0 } : {}, ...!r && fe(e.more).length ? { more: fe(e.more) } : {}, ...!r && fe(e.has).length ? { has: fe(e.has) } : {}, ...e.family === !0 ? { family: !0 } : {}, ...Re(e.ask, w(e.world)) && n(e.pubkey) && !(r && Re(e.ask, w(e.world)).what === "wallet") ? { ask: Re(e.ask, w(e.world)), pubkey: e.pubkey } : {} };
  }
  if (e.t === "answer" && w(e.world)) {
    const r = e.wallet === void 0 ? "" : ps(e.wallet);
    if (e.wallet !== void 0 && !r) return null;
    const s = e.event && typeof e.event == "object" ? e.event : void 0, o = e.paid && typeof e.paid == "object" ? e.paid : null, i = o && oe(o.invoice) ? { invoice: oe(o.invoice), ...typeof o.preimage == "string" && j.test(o.preimage) ? { preimage: o.preimage } : {} } : null;
    if (e.paid !== void 0 && !i) return null;
    const c = e.saved && typeof e.saved == "object" ? e.saved : null, l = c && De(c.name) && typeof c.size == "number" && Number.isSafeInteger(c.size) && c.size >= 0 ? { name: De(c.name), size: c.size, private: c.private !== !1, ...c.private === !1 && Ae(c.url) ? { url: Ae(c.url) } : {} } : null;
    if (e.saved !== void 0 && !l) return null;
    const f = e.file === void 0 ? null : yt(e.file);
    if (e.file !== void 0 && !f) return null;
    const a = f ? { ...f, ...Ae(e.file.url) ? { url: Ae(e.file.url) } : {} } : null, u = e.tipped && typeof e.tipped == "object" ? e.tipped : null, d = u && V(u.sats) ? { sats: V(u.sats), ...typeof u.preimage == "string" && j.test(u.preimage) ? { preimage: u.preimage } : {} } : null;
    if (e.tipped !== void 0 && !d) return null;
    const h = e.bought && typeof e.bought == "object" ? e.bought : null, g = h && h.receipt && typeof h.receipt == "object" ? { receipt: h.receipt, ...typeof h.delivery == "string" && h.delivery.length > 0 && h.delivery.length <= fs ? { delivery: h.delivery } : {} } : null;
    if (e.bought !== void 0 && !g) return null;
    const p = e.listed && typeof e.listed == "object" ? e.listed : void 0;
    return e.listed !== void 0 && !p || [s, r, i, l, a, d, g, p].filter(Boolean).length > 1 ? null : { t: "answer", nonce: e.nonce, world: w(e.world), ...s ? { event: s } : {}, ...p ? { listed: p } : {}, ...r ? { wallet: r } : {}, ...i ? { paid: i } : {}, ...l ? { saved: l } : {}, ...a ? { file: a } : {}, ...d ? { tipped: d } : {}, ...g ? { bought: g } : {} };
  }
  if (e.t === "held" && w(e.world) && Array.isArray(e.receipts) && e.receipts.length <= mn && e.receipts.every((r) => r && typeof r == "object"))
    return { t: "held", nonce: e.nonce, world: w(e.world), receipts: e.receipts };
  if (e.t === "grant" && w(e.world) && e.sealed && typeof e.sealed == "object") {
    const r = e.sealed;
    if (!n(r.senderPublicKey) || typeof r.payload != "string" || r.payload.length > 12e3) return null;
    const s = tt(e.name);
    return { t: "grant", nonce: e.nonce, world: w(e.world), sealed: { senderPublicKey: r.senderPublicKey, payload: r.payload }, ...s ? { name: s } : {} };
  }
  return e.t === "done" && typeof e.ok == "boolean" ? { t: "done", nonce: e.nonce, ok: e.ok } : null;
}
function Vo(t, e, n) {
  const r = [];
  for (const s of t.slice(0, mn)) {
    const o = Nr(s, n);
    o && o.buyer === e && r.push(o.event);
  }
  return r;
}
const te = { kinds: 64, prefixes: 8, origins: 8, peers: 8, prefixChars: 64 }, Z = 30078, ye = 27235, wn = 24242, gt = 22242, An = 13, hs = 37304, vn = ["bitlogin", "nswp:governance:"];
function Sn(t) {
  return vn.some((e) => t.startsWith(e));
}
const ys = { leastChars: 8 };
function gs(t) {
  const e = typeof t == "string" ? /^30078:[0-9a-f]{64}:(.*)$/su.exec(t) : null;
  return !!e && Sn(e[1]);
}
function kn(t) {
  return t.length < ys.leastChars || !(t.endsWith("/") || t.endsWith(":")) ? !1 : !vn.some((e) => t.startsWith(e) || e.startsWith(t));
}
const _n = [13194, 23194, 23195, 24133, 27301, 37304], ae = {
  "https://bitvid.network": { name: "Bitvid" },
  "https://beta.bitvid.network": { name: "Bitvid (beta)" },
  "https://unstable.bitvid.network": { name: "Bitvid (unstable)" },
  "https://bitunlock.network": { name: "BitUnlock" },
  // `bitportal/settings` is a visitor's BitPortal settings, sealed to their own key: BitPortal's to write, no one else's.
  "https://portal.bitblocks.network": { name: "BitPortal", reserved: [27300, 27302, 27303], names: ["bitportal/"] },
  "https://imsatisfied.app": { name: "Satisfied" },
  "https://adzaps.net": { name: "AdZap" },
  "https://www.adzaps.net": { name: "AdZap" },
  "https://tessera.bitblocks.network": { name: "Tessera" },
  "https://bitroad.network": { name: "BitRoad" },
  "https://www.bitroad.network": { name: "BitRoad" }
}, me = [27300, 27302, 27303], bs = 27303;
function Jo(t) {
  return Object.hasOwn(ae, t) ? ae[t].name : null;
}
function Q(t) {
  if (typeof t != "string" || t.length > 300) return !1;
  let e;
  try {
    const o = new URL(t);
    if (o.protocol !== "https:" && o.protocol !== "http:") return !1;
    e = o.hostname.toLowerCase();
  } catch {
    return !1;
  }
  if (e === "localhost" || e.endsWith(".localhost") || e === "[::1]") return !0;
  const n = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/u.exec(e)?.slice(1).map(Number);
  if (!n || n.some((o) => o > 255)) return !1;
  const [r, s] = n;
  return r === 127 || r === 10 || r === 192 && s === 168 || r === 172 && s >= 16 && s <= 31;
}
const ms = ["https://bitlogin.network", "https://bitlogin-beta.vercel.app"], Yo = (t) => typeof t == "string" && (ms.includes(t) || Q(t)), ws = ["https://bitlogin-beta.vercel.app"], Zo = (t) => typeof t == "string" && (ws.includes(t) || Q(t)), As = [], Qo = (t) => typeof t == "string" && (As.includes(t) || Q(t));
function vs(t, e) {
  return Object.hasOwn(ae, t) ? ae[t].reserved ?? [] : Q(e) && Q(t) ? me : [];
}
const En = () => {
  try {
    return globalThis.location?.origin ?? "";
  } catch {
    return "";
  }
}, bt = (t) => vs(t, En()), qo = (t) => !Object.hasOwn(ae, t) && bt(t).length > 0;
function ei(t, e) {
  const n = bt(t);
  if (![...e.sign, ...e.read].every((s) => !me.includes(s) || n.includes(s))) return !1;
  const r = In(t);
  return e.appData.every((s) => !r.some((o) => s.startsWith(o) || o.startsWith(s)));
}
function In(t) {
  return Q(En()) && Q(t) ? [] : Object.entries(ae).filter(([e]) => e !== t).flatMap(([, e]) => e.names ?? []);
}
const Nn = [0, 3, 5, 1e4, 10002, 10050, gt], Ss = [...Nn, wn, ...me], ks = [4, An, 1059], _s = [ye, wn, gt], ge = /^[0-9a-f]{64}$/u, Ne = (t) => typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 65535, ue = (t) => [...new Set(t)];
function Ln(t) {
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const e = t, n = (a) => a === void 0 ? [] : Array.isArray(a) ? a : null, r = n(e.sign), s = n(e.appData), o = n(e.proofs), i = n(e.read), c = n(e.peers);
  if (!r || !s || !o || !i || !c || r.length > te.kinds || i.length > te.kinds || s.length > te.prefixes || o.length > te.origins || c.length > te.peers || !r.every(Ne) || !i.every(Ne) || r.some((a) => _n.includes(a)) || i.includes(hs) || r.length === 0 && i.length === 0 && c.length === 0) return null;
  for (const a of s)
    if (typeof a != "string" || a.length === 0 || a.length > te.prefixChars || !kn(a) || tt(a) !== a) return null;
  if ((r.includes(Z) || i.includes(Z)) !== s.length > 0) return null;
  const l = [];
  for (const a of o) {
    const u = w(a);
    if (!u || u !== a || !u.startsWith("https://")) return null;
    l.push(u);
  }
  if (l.length > 0 && !r.includes(ye) || !c.every((a) => typeof a == "string" && ge.test(a))) return null;
  const f = tt(e.name);
  return {
    ...f ? { name: f } : {},
    sign: ue(r).sort((a, u) => a - u),
    appData: ue(s),
    proofs: ue(l),
    read: ue(i).sort((a, u) => a - u),
    peers: ue(c)
  };
}
const ti = {
  /** Proofs, and the application's own data: what applications sign on timers. */
  quiet: { burst: 300, perMs: 6e4, hourly: 6e3 },
  public: { burst: 60, perMs: 6e4, hourly: 1200 },
  sensitive: { burst: 30, perMs: 6e4, hourly: 300 },
  read: { burst: 600, perMs: 6e4, hourly: 12e3 }
}, ne = {
  contentChars: 1e5,
  tags: 2500,
  /** Who someone follows (kind 3) is one note with a tag for each person: more are let through. */
  followTags: 2e4,
  tagItems: 16,
  tagChars: 1e3,
  clockSlackSec: 600
}, nt = (t) => t >= 3e4 && t < 4e4;
function ni(t) {
  return Nn.includes(t) && t !== gt || me.includes(t) ? "sensitive" : _s.includes(t) || nt(t) ? "quiet" : "public";
}
const $t = "bitlogin:site", xe = (t, e) => t.filter((n) => n[0] === e && typeof n[1] == "string").map((n) => n[1]);
function On(t, e) {
  const n = xe(e, "d");
  return n[0] === void 0 || n.some(Sn) ? !1 : t.appData.some((s) => kn(s) && n.every((o) => o.startsWith(s)));
}
function Es(t, e, n) {
  const r = xe(n, "u");
  return r.length === 0 ? !1 : r.every((s) => {
    const o = w(s);
    return o !== "" && (o === e || t.proofs.includes(o));
  });
}
function ri(t, e, n, r) {
  const s = w(n);
  if (!s || !e || typeof e != "object") return null;
  const o = e;
  if (!Ne(o.kind) || _n.includes(o.kind) || !t.sign.includes(o.kind) || me.includes(o.kind) && !bt(s).includes(o.kind) || typeof o.content != "string" || o.content.length > ne.contentChars || !Array.isArray(o.tags) || o.tags.length > (o.kind === 3 ? ne.followTags : ne.tags)) return null;
  const i = [];
  for (const a of o.tags) {
    if (!Array.isArray(a) || a.length === 0 || a.length > ne.tagItems || !a.every((u) => typeof u == "string" && u.length <= ne.tagChars)) return null;
    if (a[0] !== $t) {
      if (a[0] === "nswp:world") {
        if (o.kind !== bs) continue;
        if (a.length !== 2 || w(a[1]) !== a[1] || i.some((u) => u[0] === "nswp:world")) return null;
      }
      i.push([...a]);
    }
  }
  if (o.kind === Z && !On(t, i) || o.kind === Z && xe(i, "d").some((a) => In(s).some((u) => a.startsWith(u))) || o.kind === 5 && i.some((a) => a[0] === "a" && gs(a[1])) || o.kind === ye && !Es(t, s, i)) return null;
  if (o.kind === An) {
    if (i.length > 0) return null;
  } else
    i.push([$t, s]);
  const c = Math.floor(r), l = typeof o.created_at == "number" && Number.isInteger(o.created_at) ? o.created_at : c, f = Math.abs(l - c) <= ne.clockSlackSec ? l : c;
  return { kind: o.kind, created_at: f, tags: i, content: o.content };
}
function si(t, e, n) {
  return typeof n == "string" && ge.test(n) && (n === e || t.peers.includes(n));
}
function oi(t, e) {
  return typeof e == "string" && ge.test(e) && t.peers.includes(e);
}
function Is(t, e, n) {
  if (!Ne(n.kind) || !t.read.includes(n.kind) || typeof n.pubkey != "string" || !ge.test(n.pubkey) || !Array.isArray(n.tags)) return null;
  const r = n.tags.filter((o) => Array.isArray(o) && o.every((i) => typeof i == "string"));
  if (n.kind === Z && !On(t, r)) return null;
  if (n.pubkey !== e) return n.pubkey;
  const s = xe(r, "p")[0];
  return s !== void 0 && ge.test(s) ? s : e;
}
function ii(t, e, n) {
  const r = Is(t, e, n);
  return r ? n.pubkey === e && r !== e ? [r, e] : [r] : [];
}
const Ns = {
  0: "change your profile",
  1: "post notes",
  3: "change who you follow",
  4: "send private messages (older kind)",
  5: "delete what you have posted, which can include records BitLogin keeps for you on relays",
  6: "repost notes",
  7: "post reactions",
  13: "send private messages",
  15: "send files in private messages",
  16: "repost other things",
  21: "post videos",
  22: "post short videos",
  1063: "post file details",
  1111: "post comments",
  1573: "place orders",
  1984: "report content",
  7376: "record what your Cashu wallet spent",
  9734: "ask for zaps",
  1e4: "change who you have muted",
  10002: "change which relays you use",
  10050: "change where private messages reach you",
  20001: "send read receipts",
  20002: "show when you are typing",
  22242: "sign in to relays as you",
  24242: "upload, list and delete your files at file hosts",
  27300: "give worlds a pass that says who you are",
  27302: "let a world open a terminal on a computer of yours",
  27303: "give a world access you have granted it",
  3e4: "change your lists",
  30004: "change your lists of worlds",
  30015: "change your interests",
  34235: "post videos",
  34236: "post short videos",
  37300: "announce a world as yours",
  37305: "rate worlds, from one to five stars",
  37306: "post your scores on worlds' boards",
  37307: "show which achievements you hold in worlds",
  37308: "change what is in your bag: the items you carry between worlds"
}, Ls = {
  4: "read your private messages (older kind)",
  13: "read your private messages",
  1059: "read your private messages",
  1573: "read orders sent to you",
  7375: "read the money in your Cashu wallet",
  7376: "read what your Cashu wallet spent",
  1e4: "read who you have muted",
  3e4: "read your private lists"
}, Rt = (t) => {
  try {
    return new URL(t).host;
  } catch {
    return t;
  }
};
function ai(t, e) {
  const n = [], r = [], s = [], o = (i, c) => {
    i.includes(c) || i.push(c);
  };
  t.sign.includes(ye) && o(n, `prove who you are to ${[Rt(e), ...t.proofs.map(Rt)].join(", ")}`);
  for (const i of t.sign) {
    if (i === ye) continue;
    if (i === Z) {
      o(n, `save its own data (${t.appData.join(", ")})`);
      continue;
    }
    const c = Ns[i];
    if (!c) {
      nt(i) ? o(n, `save its own kind of data (kind ${i})`) : s.push(i);
      continue;
    }
    o(Ss.includes(i) ? r : n, c);
  }
  s.length > 0 && o(n, `sign kinds BitLogin has no words for: ${s.join(", ")}`);
  for (const i of t.read) {
    if (i === Z) {
      o(n, `read its own saved data (${t.appData.join(", ")})`);
      continue;
    }
    const c = Ls[i];
    c ? o(ks.includes(i) || i === 7375 ? r : n, c) : o(n, nt(i) ? `read its own kind of data (kind ${i})` : `read what is encrypted in kind ${i}`);
  }
  return t.peers.length > 0 && o(n, `exchange encrypted messages with ${t.peers.length === 1 ? "one service" : `${t.peers.length} services`} it names (${t.peers.map((i) => `${i.slice(0, 8)}…`).join(", ")})`), { ordinary: n, sensitive: r };
}
export {
  ni as $,
  Q as A,
  Zo as B,
  cs as C,
  yn as D,
  Oe as E,
  Ie as F,
  Ko as G,
  Fo as H,
  de as I,
  ti as J,
  jo as K,
  Ir as L,
  zo as M,
  Rs as N,
  Ho as O,
  vt as P,
  Oo as Q,
  Ds as R,
  X as S,
  ee as T,
  nn as U,
  ei as V,
  us as W,
  Uo as X,
  ri as Y,
  Wo as Z,
  Bo as _,
  pe as a,
  Pr as a$,
  Xo as a0,
  ps as a1,
  Vo as a2,
  go as a3,
  jr as a4,
  Go as a5,
  Jo as a6,
  he as a7,
  pn as a8,
  Ot as a9,
  fe as aA,
  Ut as aB,
  Ms as aC,
  Kt as aD,
  Bt as aE,
  Ps as aF,
  Cs as aG,
  js as aH,
  ot as aI,
  Ks as aJ,
  zs as aK,
  Gs as aL,
  Xs as aM,
  Wn as aN,
  Bs as aO,
  Vs as aP,
  Ws as aQ,
  zn as aR,
  Fn as aS,
  Fs as aT,
  Hs as aU,
  Gt as aV,
  zr as aW,
  Io as aX,
  Ge as aY,
  ho as aZ,
  be as a_,
  tt as aa,
  qo as ab,
  me as ac,
  Cr as ad,
  ai as ae,
  yo as af,
  He as ag,
  po as ah,
  Nt as ai,
  dt as aj,
  Xe as ak,
  Yn as al,
  ro as am,
  mr as an,
  gr as ao,
  no as ap,
  se as aq,
  ve as ar,
  _t as as,
  F as at,
  H as au,
  nr as av,
  to as aw,
  kt as ax,
  K as ay,
  Hr as az,
  ie as b,
  Zs as b0,
  ii as b1,
  oi as b2,
  ks as b3,
  si as b4,
  Do as b5,
  Ro as b6,
  $o as b7,
  Co as b8,
  Po as b9,
  No as bA,
  Ct as bB,
  $s as bC,
  Ts as bD,
  Ur as ba,
  wo as bb,
  mo as bc,
  fo as bd,
  sn as be,
  uo as bf,
  ze as bg,
  Fr as bh,
  Wr as bi,
  Eo as bj,
  ko as bk,
  $e as bl,
  Ao as bm,
  So as bn,
  mn as bo,
  Lo as bp,
  Yo as bq,
  vo as br,
  pt as bs,
  Mo as bt,
  To as bu,
  xo as bv,
  Tt as bw,
  Je as bx,
  bo as by,
  _o as bz,
  oe as c,
  so as d,
  Ar as e,
  Nr as f,
  lo as g,
  co as h,
  Gn as i,
  at as j,
  Js as k,
  V as l,
  qs as m,
  oo as n,
  Ys as o,
  ao as p,
  vr as q,
  Lr as r,
  Us as s,
  Qs as t,
  lt as u,
  Qo as v,
  eo as w,
  io as x,
  w as y,
  Ln as z
};
