import { D as Zt, E as sn, F as on, h as an, u as It, a as cn, B as Ne, N as ln, C as un, c as fn, q as dn, z as pn, v as st, b as hn, O as yn, P as Ie } from "./bitlogin-shared-8bKMreA1.js";
import { d as xt } from "./bitlogin-shared-PwbHDYud.js";
const Vr = 17375, Jr = 7375, Yr = 7376, Qt = "sat", qt = {
  mints: 5,
  proofsPerToken: 500,
  tokens: 500,
  /**
   * How many proofs this wallet writes into one token record. Kept small so that a record is well under the
   * 64 KB an ordinary NIP-44 message may hold, and under what relays take: another NIP-60 wallet can read it.
   */
  proofsWritten: 100
}, fe = /^[0-9a-f]+$/u, ke = /^[0-9a-f]{64}$/u;
function bt(e) {
  if (typeof e != "string" || e.length > 200) return "";
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return "";
  }
  const n = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol !== "https:" && !(t.protocol === "http:" && n) || t.username || t.password || t.search || t.hash ? "" : `${t.origin}${t.pathname.replace(/\/+$/u, "")}`;
}
function gn(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.id != "string" || t.id.length < 2 || t.id.length > 66 || !fe.test(t.id) || typeof t.amount != "number" || !Number.isSafeInteger(t.amount) || t.amount <= 0 || typeof t.secret != "string" || t.secret.length === 0 || t.secret.length > 2048 || typeof t.C != "string" || t.C.length !== 66 || !fe.test(t.C) ? null : { id: t.id, amount: t.amount, secret: t.secret, C: t.C };
}
function wn(e, t = qt.proofsPerToken) {
  if (!Array.isArray(e) || e.length > t) return null;
  const n = [], r = /* @__PURE__ */ new Set();
  for (const s of e) {
    const o = gn(s);
    if (!o || r.has(o.secret)) return null;
    r.add(o.secret), n.push(o);
  }
  return n;
}
const Zr = (e) => e.reduce((t, n) => t + n.amount, 0);
function Qr(e) {
  return JSON.stringify([["privkey", e.privkey], ...e.mints.map((t) => ["mint", t])]);
}
function qr(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  if (!Array.isArray(t)) return null;
  let n = "";
  const r = [];
  for (const s of t)
    !Array.isArray(s) || typeof s[0] != "string" || (s[0] === "privkey" && typeof s[1] == "string" && ke.test(s[1]) && (n ||= s[1]), s[0] === "mint" && bt(s[1]) && !r.includes(bt(s[1])) && r.length < qt.mints && r.push(bt(s[1])));
  return n ? { privkey: n, mints: r } : null;
}
function ts(e) {
  return JSON.stringify({ mint: e.mint, unit: Qt, proofs: e.proofs.map(({ id: t, amount: n, secret: r, C: s }) => ({ id: t, amount: n, secret: r, C: s })), ...e.del?.length ? { del: [...e.del] } : {} });
}
function es(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = t, r = bt(n.mint), s = wn(n.proofs);
  if (!r || !s || n.unit !== void 0 && n.unit !== Qt) return null;
  const o = Array.isArray(n.del) ? n.del.filter((a) => typeof a == "string" && ke.test(a)).slice(0, 200) : [];
  return { mint: r, proofs: s, del: o };
}
function ns(e, t) {
  const n = new Set(e.flatMap((o) => o.del)), r = /* @__PURE__ */ new Set(), s = [];
  for (const o of [...e].sort((a, c) => c.created_at - a.created_at || a.event.localeCompare(c.event))) {
    if (n.has(o.event) || t.has(o.event)) continue;
    const a = o.proofs.filter((c) => !r.has(c.secret));
    for (const c of a) r.add(c.secret);
    a.length && s.length < qt.tokens && s.push({ event: o.event, mint: o.mint, proofs: a });
  }
  return s;
}
function rs(e) {
  return JSON.stringify([
    ["direction", e.direction],
    ["amount", String(e.amount)],
    ["unit", Qt],
    ...(e.created ?? []).map((t) => ["e", t, "", "created"]),
    ...(e.destroyed ?? []).map((t) => ["e", t, "", "destroyed"])
  ]);
}
const et = (e) => {
  if (typeof e != "string") return "";
  const t = e.trim().toLowerCase().replace(/^lightning:/u, "");
  return t.length <= 2e3 && /^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(t) ? t : "";
};
class Y extends Error {
  constructor(t, n) {
    super(n), this.code = t, this.name = "TipError";
  }
}
const de = { min: 1, max: 1e6 }, X = (e) => typeof e == "number" && Number.isSafeInteger(e) && e >= de.min && e <= de.max ? e : 0, pe = { default: 1e3, steps: [1e3, 1e4, 1e5, 0] }, ss = (e) => pe.steps.includes(e) ? e : pe.default, os = (e, t) => t !== 0 && e > t;
function bn(e) {
  if (typeof e != "string") return null;
  const t = e.trim().toLowerCase(), n = t.lastIndexOf("1");
  if (n < 4) return null;
  const r = /^ln(?:bcrt|tbs|bc|tb)([1-9][0-9]{0,11})([munp]?)$/u.exec(t.slice(0, n));
  if (!r) return null;
  const s = { "": 100000000000n, m: 100000000n, u: 100000n, n: 100n }, o = r[2] === "p" ? BigInt(r[1]) % 10n === 0n ? BigInt(r[1]) / 10n : -1n : BigInt(r[1]) * s[r[2]];
  if (o <= 0n || o % 1000n !== 0n) return null;
  const a = o / 1000n;
  return a <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(a) : null;
}
const te = /^(?:localhost|127\.0\.0\.1)(?::[0-9]{1,5})?$/u, mn = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/u;
function ee(e, t = {}) {
  if (typeof e != "string" || e.length > 200) return "";
  const n = e.trim().toLowerCase(), r = n.lastIndexOf("@");
  if (r < 1) return "";
  const s = n.slice(0, r), o = n.slice(r + 1);
  return /^[a-z0-9._+-]{1,64}$/u.test(s) && (mn.test(o) || t.local && te.test(o)) ? n : "";
}
function is(e, t = {}) {
  try {
    const n = typeof e == "string" ? JSON.parse(e) : null;
    return n && typeof n == "object" ? ee(n.lud16, t) : "";
  } catch {
    return "";
  }
}
const An = 8e3;
async function Tt(e, t) {
  const n = new AbortController(), r = setTimeout(() => n.abort(), An);
  try {
    const s = await e(t, { method: "GET", credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", headers: { accept: "application/json" }, signal: n.signal });
    if (!s.ok) return null;
    const o = await s.text();
    if (o.length > 1e5) return null;
    const a = JSON.parse(o);
    return a && typeof a == "object" && !Array.isArray(a) ? a : null;
  } catch {
    return null;
  } finally {
    clearTimeout(r);
  }
}
const Oe = (e, t) => {
  try {
    const n = new URL(String(e));
    return typeof e != "string" || e.length > 2e3 || n.username || n.password ? null : n.protocol === "https:" || t && n.protocol === "http:" && te.test(n.host) ? n : null;
  } catch {
    return null;
  }
};
async function as(e, t = {}) {
  const n = Oe(e, t.local === !0);
  if (!n || n.origin !== e) return { tip: "", publishers: [], share: "" };
  const r = await Tt(t.fetch ?? ((o, a) => fetch(o, a)), `${n.origin}/.well-known/nswp.json`), s = r?.publishers && typeof r.publishers == "object" && !Array.isArray(r.publishers) ? Object.keys(r.publishers) : [];
  return { tip: ee(r?.tip, t), publishers: s.filter((o) => /^[0-9a-f]{64}$/u.test(o)).slice(0, 16), share: typeof r?.share == "string" && /^[0-9a-f]{64}$/u.test(r.share) ? r.share : "" };
}
async function cs(e, t, n = {}) {
  const r = n.local === !0, s = ee(e, { local: r }), o = X(t);
  if (!s || !o) throw new Y("no-address", "That is not a lightning address and an amount.");
  const a = n.fetch ?? ((J, B) => fetch(J, B)), [c, l] = [s.slice(0, s.lastIndexOf("@")), s.slice(s.lastIndexOf("@") + 1)], f = r && te.test(l) ? "http" : "https", i = await Tt(a, `${f}://${l}/.well-known/lnurlp/${encodeURIComponent(c)}`);
  if (!i) throw new Y("unreachable", "That lightning address didn't answer. Nothing was spent.");
  const u = Oe(i.callback, r);
  if (i.tag !== "payRequest" || !u) throw new Y("unreachable", "That lightning address didn't answer as one. Nothing was spent.");
  const d = o * 1e3, [h, g] = [Number(i.minSendable), Number(i.maxSendable)];
  if (!(Number.isFinite(h) && Number.isFinite(g) && h <= d && d <= g))
    throw new Y("refused-amount", "That lightning address doesn't take a payment of this size. Nothing was spent.");
  u.searchParams.set("amount", String(d));
  const p = typeof i.commentAllowed == "number" && Number.isSafeInteger(i.commentAllowed) ? Math.min(i.commentAllowed, 280) : 0, b = p >= 8 ? Mt(n.note).slice(0, p) : "";
  b && u.searchParams.set("comment", b);
  const w = await Tt(a, u.href), A = typeof w?.pr == "string" ? w.pr.trim().toLowerCase() : "";
  if (!A || A.length > 2e3 || !/^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(A)) throw new Y("unreachable", "That lightning address gave no invoice. Nothing was spent.");
  if (bn(A) !== o) throw new Y("wrong-invoice", "That lightning address answered with an invoice for a different amount. Nothing was spent.");
  return { invoice: A, note: b };
}
function Mt(e) {
  return typeof e == "string" ? Array.from(e.normalize("NFC")).filter((t) => {
    const n = t.codePointAt(0);
    return n >= 32 && n !== 127 && !(n >= 8203 && n <= 8207) && !(n >= 8234 && n <= 8238) && !(n >= 8294 && n <= 8297);
  }).join("").trim().slice(0, 280) : "";
}
function ls(e, t) {
  let n = "";
  try {
    n = new URL(t).host;
  } catch {
    n = "";
  }
  const r = Mt(e).slice(0, 60);
  return Mt(`${r ? `A tip from ${r}` : "A tip"}${n ? `, in ${n}` : ""}`);
}
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function vn(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
function he(e) {
  if (typeof e != "boolean")
    throw new TypeError(`boolean expected, not ${e}`);
}
function Ot(e) {
  if (typeof e != "number")
    throw new TypeError("number expected, got " + typeof e);
  if (!Number.isSafeInteger(e) || e < 0)
    throw new RangeError("positive integer expected, got " + e);
}
function K(e, t, n = "") {
  const r = vn(e), s = e?.length, o = t !== void 0;
  if (!r || o && s !== t) {
    const a = n && `"${n}" `, c = o ? ` of length ${t}` : "", l = r ? `length=${s}` : `type=${typeof e}`, f = a + "expected Uint8Array" + c + ", got " + l;
    throw r ? new RangeError(f) : new TypeError(f);
  }
  return e;
}
function F(e) {
  return new Uint32Array(e.buffer, e.byteOffset, Math.floor(e.byteLength / 4));
}
function ye(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
const tt = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68, Sn = (e) => e << 24 & 4278190080 | e << 8 & 16711680 | e >>> 8 & 65280 | e >>> 24 & 255, _n = (e) => {
  for (let t = 0; t < e.length; t++)
    e[t] = Sn(e[t]);
  return e;
}, W = tt ? (e) => e : _n;
function En(e, t) {
  return !e.byteLength || !t.byteLength ? !1 : e.buffer === t.buffer && // best we can do, may fail with an obscure Proxy
  e.byteOffset < t.byteOffset + t.byteLength && // a starts before b end
  t.byteOffset < e.byteOffset + e.byteLength;
}
function us(e, t) {
  if (En(e, t) && e.byteOffset < t.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function Nn(e, t) {
  if (t == null || typeof t != "object")
    throw new Error("options must be defined");
  return Object.assign(e, t);
}
const fs = /* @__NO_SIDE_EFFECTS__ */ (e, t) => {
  function n(r, ...s) {
    if (K(r, void 0, "key"), e.nonceLength !== void 0) {
      const i = s[0];
      K(i, e.varSizeNonce ? void 0 : e.nonceLength, "nonce");
    }
    const o = e.tagLength;
    o && s[1] !== void 0 && K(s[1], void 0, "AAD");
    const a = t(r, ...s), c = (i, u) => {
      if (u !== void 0) {
        if (i !== 2)
          throw new Error("cipher output not supported");
        K(u, void 0, "output");
      }
    };
    let l = !1;
    return {
      encrypt(i, u) {
        if (l)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return l = !0, K(i), c(a.encrypt.length, u), a.encrypt(i, u);
      },
      decrypt(i, u) {
        if (K(i), o && i.length < o)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + o);
        return c(a.decrypt.length, u), a.decrypt(i, u);
      }
    };
  }
  return Object.assign(n, e), n;
};
function In(e, t, n = !0) {
  if (t === void 0)
    return new Uint8Array(e);
  if (K(t, void 0, "output"), t.length !== e)
    throw new Error('"output" expected Uint8Array of length ' + e + ", got: " + t.length);
  if (n && !mt(t))
    throw new Error("invalid output, must be aligned");
  return t;
}
function mt(e) {
  return e.byteOffset % 4 === 0;
}
function ge(e) {
  return Uint8Array.from(K(e));
}
const Le = (e) => Uint8Array.from(e.split(""), (t) => t.charCodeAt(0)), kn = W(F(Le("expand 16-byte k"))), On = W(F(Le("expand 32-byte k")));
function y(e, t) {
  return e << t | e >>> 32 - t;
}
const it = 64, Ln = 16, Pt = 2 ** 32 - 1, we = /* @__PURE__ */ Uint32Array.of();
function xn(e, t, n, r, s, o, a, c) {
  const l = s.length, f = new Uint8Array(it), i = F(f), u = tt && mt(s) && mt(o), d = u ? F(s) : we, h = u ? F(o) : we;
  if (!tt) {
    for (let g = 0; g < l; a++) {
      if (e(t, n, r, i, a, c), W(i), a >= Pt)
        throw new Error("arx: counter overflow");
      const p = Math.min(it, l - g);
      for (let b = 0, w; b < p; b++)
        w = g + b, o[w] = s[w] ^ f[b];
      g += p;
    }
    return;
  }
  for (let g = 0; g < l; a++) {
    if (e(t, n, r, i, a, c), a >= Pt)
      throw new Error("arx: counter overflow");
    const p = Math.min(it, l - g);
    if (u && p === it) {
      const b = g / 4;
      if (g % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let w = 0, A; w < Ln; w++)
        A = b + w, h[A] = d[A] ^ i[w];
      g += it;
      continue;
    }
    for (let b = 0, w; b < p; b++)
      w = g + b, o[w] = s[w] ^ f[b];
    g += p;
  }
}
function Tn(e, t) {
  const { allowShortKeys: n, extendNonceFn: r, counterLength: s, counterRight: o, rounds: a } = Nn({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, t);
  if (typeof e != "function")
    throw new Error("core must be a function");
  return Ot(s), Ot(a), he(o), he(n), (c, l, f, i, u = 0) => {
    K(c, void 0, "key"), K(l, void 0, "nonce"), K(f, void 0, "data");
    const d = f.length;
    if (i = In(d, i, !1), Ot(u), u < 0 || u >= Pt)
      throw new Error("arx: counter overflow");
    const h = [];
    let g = c.length, p, b;
    if (g === 32)
      h.push(p = ge(c)), b = On;
    else if (g === 16 && n)
      p = new Uint8Array(32), p.set(c), p.set(c, 16), b = kn, h.push(p);
    else
      throw K(c, 32, "arx key"), new Error("invalid key size");
    (!tt || !mt(l)) && h.push(l = ge(l));
    let w = F(p);
    if (r) {
      if (l.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const B = l.subarray(0, 16);
      if (tt)
        r(b, w, F(B), w);
      else {
        const ot = W(Uint32Array.from(b));
        r(ot, w, F(B), w), ye(ot), W(w);
      }
      l = l.subarray(16);
    } else tt || W(w);
    const A = 16 - s;
    if (A !== l.length)
      throw new Error(`arx: nonce must be ${A} or 16 bytes`);
    if (A !== 12) {
      const B = new Uint8Array(12);
      B.set(l, o ? 0 : 12 - l.length), l = B, h.push(l);
    }
    const J = W(F(l));
    try {
      return xn(e, b, w, J, f, i, u, a), i;
    } finally {
      ye(...h);
    }
  };
}
function Mn(e, t, n, r, s, o = 20) {
  let a = e[0], c = e[1], l = e[2], f = e[3], i = t[0], u = t[1], d = t[2], h = t[3], g = t[4], p = t[5], b = t[6], w = t[7], A = s, J = n[0], B = n[1], ot = n[2], S = a, _ = c, E = l, N = f, I = i, k = u, O = d, L = h, x = g, T = p, M = b, P = w, $ = A, D = J, R = B, C = ot;
  for (let ue = 0; ue < o; ue += 2)
    S = S + I | 0, $ = y($ ^ S, 16), x = x + $ | 0, I = y(I ^ x, 12), S = S + I | 0, $ = y($ ^ S, 8), x = x + $ | 0, I = y(I ^ x, 7), _ = _ + k | 0, D = y(D ^ _, 16), T = T + D | 0, k = y(k ^ T, 12), _ = _ + k | 0, D = y(D ^ _, 8), T = T + D | 0, k = y(k ^ T, 7), E = E + O | 0, R = y(R ^ E, 16), M = M + R | 0, O = y(O ^ M, 12), E = E + O | 0, R = y(R ^ E, 8), M = M + R | 0, O = y(O ^ M, 7), N = N + L | 0, C = y(C ^ N, 16), P = P + C | 0, L = y(L ^ P, 12), N = N + L | 0, C = y(C ^ N, 8), P = P + C | 0, L = y(L ^ P, 7), S = S + k | 0, C = y(C ^ S, 16), M = M + C | 0, k = y(k ^ M, 12), S = S + k | 0, C = y(C ^ S, 8), M = M + C | 0, k = y(k ^ M, 7), _ = _ + O | 0, $ = y($ ^ _, 16), P = P + $ | 0, O = y(O ^ P, 12), _ = _ + O | 0, $ = y($ ^ _, 8), P = P + $ | 0, O = y(O ^ P, 7), E = E + L | 0, D = y(D ^ E, 16), x = x + D | 0, L = y(L ^ x, 12), E = E + L | 0, D = y(D ^ E, 8), x = x + D | 0, L = y(L ^ x, 7), N = N + I | 0, R = y(R ^ N, 16), T = T + R | 0, I = y(I ^ T, 12), N = N + I | 0, R = y(R ^ N, 8), T = T + R | 0, I = y(I ^ T, 7);
  let v = 0;
  r[v++] = a + S | 0, r[v++] = c + _ | 0, r[v++] = l + E | 0, r[v++] = f + N | 0, r[v++] = i + I | 0, r[v++] = u + k | 0, r[v++] = d + O | 0, r[v++] = h + L | 0, r[v++] = g + x | 0, r[v++] = p + T | 0, r[v++] = b + M | 0, r[v++] = w + P | 0, r[v++] = A + $ | 0, r[v++] = J + D | 0, r[v++] = B + R | 0, r[v++] = ot + C | 0;
}
const xe = /* @__PURE__ */ Tn(Mn, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
}), Te = 2, $t = 1, Me = 65536, Pn = 4294967295, $n = 132, Dn = 99, Dt = 1024 * 1024;
function ds(e, t) {
  const n = Zt(new Uint8Array([2]), sn(t)), s = on.getSharedSecret(e, n, !0).slice(1, 33);
  return an(It("nip44-v2"), s);
}
function Pe(e, t) {
  if (e.length !== 32)
    throw new Error("NIP-44 conversation key must be exactly 32 bytes.");
  if (t.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const n = fn(e, t, 76);
  return {
    chachaKey: n.slice(0, 32),
    chachaNonce: n.slice(32, 44),
    hmacKey: n.slice(44, 76)
  };
}
function ne(e) {
  if (e <= 32)
    return 32;
  const t = 2 ** Math.floor(Math.log2(e - 1) + 1), n = t <= 256 ? 32 : t / 8;
  return n * (Math.floor((e - 1) / n) + 1);
}
const $e = 39 + ne(Dt) + 32, Rn = Math.ceil($e / 3) * 4;
function Cn(e) {
  if (e < Me) {
    const n = new Uint8Array(2);
    return new DataView(n.buffer).setUint16(0, e, !1), n;
  }
  const t = new Uint8Array(6);
  return new DataView(t.buffer).setUint32(2, e, !1), t;
}
function jn(e) {
  const t = e.length;
  if (t < $t || t > Dt)
    throw new Error(`NIP-44 plaintext length must be between ${$t} and ${Dt} bytes on this platform.`);
  const n = Cn(t), r = ne(t), s = new Uint8Array(n.length + r);
  return s.set(n, 0), s.set(e, n.length), s;
}
function Kn(e) {
  const t = new DataView(e.buffer, e.byteOffset, e.byteLength), n = t.getUint16(0, !1);
  let r, s;
  if (n === 0) {
    if (r = t.getUint32(2, !1), s = 6, r < Me)
      throw new Error("NIP-44 payload has inconsistent padding.");
  } else
    r = n, s = 2;
  if (r < $t || r > Pn || e.length !== s + ne(r))
    throw new Error("NIP-44 payload has inconsistent padding.");
  return e.slice(s, s + r);
}
function De(e, t, n) {
  return dn(pn, e, Zt(t, n));
}
function Un(e, t) {
  return Bn(e, t, cn(32));
}
function Bn(e, t, n) {
  if (n.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const { chachaKey: r, chachaNonce: s, hmacKey: o } = Pe(e, n), a = jn(It(t)), c = xe(r, s, a), l = De(o, n, c);
  return Ne.encode(Zt(new Uint8Array([Te]), n, c, l));
}
function Fn(e, t) {
  if (t.startsWith("#"))
    throw new Error("Unsupported NIP-44 non-base64 encoding.");
  if (t.length < $n || t.length > Rn)
    throw new Error("NIP-44 payload size is outside this platform's supported range.");
  const n = Ne.decode(t);
  if (n.length < Dn || n.length > $e)
    throw new Error("NIP-44 decoded payload size is outside this platform's supported range.");
  if (n[0] !== Te)
    throw new Error(`Unsupported NIP-44 version: ${n[0]}`);
  const r = n.slice(1, 33);
  if (r.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const s = n.slice(n.length - 32), o = n.slice(33, n.length - 32), { chachaKey: a, chachaNonce: c, hmacKey: l } = Pe(e, r), f = De(l, r, o);
  if (!ln(s, f))
    throw new Error("NIP-44 MAC verification failed: payload is corrupted, tampered, or uses the wrong key.");
  const i = xe(a, c, o);
  return un(Kn(i));
}
const At = /^[0-9a-f]{64}$/u, Wn = "nswp:share", Rt = "client", H = { most: 4, whole: 1e4, least: 10, label: 32 };
function zn(e) {
  if (typeof e != "string") return "";
  const t = e.trim();
  if (!t || t.length > H.label) return "";
  for (const n of t) {
    const r = n.codePointAt(0);
    if (r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279) return "";
  }
  return t;
}
function Hn(e, t) {
  const n = (o) => ({ ok: !1, why: o });
  if (!Array.isArray(e)) return n("not-a-share");
  const r = e.filter((o) => Array.isArray(o) && o[0] === Wn);
  if (r.length === 0) return { ok: !0, shares: [] };
  if (typeof t != "string" || !At.test(t)) return n("no-seller");
  if (r.length > H.most) return n("too-many");
  const s = [];
  for (const o of r) {
    const [, a, c, l] = o;
    if (o.length < 3 || o.length > 4 || typeof a != "string" || a !== Rt && !At.test(a) || typeof c != "string" || !/^[1-9][0-9]{0,4}$/u.test(c) || Number(c) > H.whole) return n("not-a-share");
    const f = l === void 0 ? a === Rt ? "client" : a === t ? "seller" : "share" : zn(l);
    if (!f) return n("not-a-share");
    if (s.some((i) => i.to === a)) return n("twice");
    s.push({ to: a, parts: Number(c), label: f });
  }
  return s.some((o) => o.to === t) ? s.reduce((o, a) => o + a.parts, 0) !== H.whole ? n("not-whole") : { ok: !0, shares: s } : n("no-seller");
}
function ps(e, t, n, r = {}) {
  const s = (i) => ({ ok: !1, why: i }), o = r.charge ?? 0;
  if (typeof e != "number" || !Number.isSafeInteger(e) || e < 1 || !Number.isSafeInteger(e * H.whole) || !Number.isSafeInteger(o) || o < 0) return s("not-a-price");
  if (typeof n != "string" || !At.test(n) || t.length > 0 && !t.some((i) => i.to === n)) return s("no-seller");
  const a = typeof r.client == "string" && At.test(r.client) && r.client !== n ? r.client : null, c = /* @__PURE__ */ new Map();
  for (const i of t) {
    if (i.to === n) continue;
    const u = i.to === Rt ? a : i.to;
    if (!u) continue;
    const d = Math.floor(e * i.parts / H.whole), h = c.get(u);
    c.set(u, h ? { sats: h.sats + d, label: h.label } : { sats: d, label: i.label });
  }
  const l = [...c.values()].reduce((i, u) => i + u.sats, 0), f = [...c].map(([i, u]) => ({ to: i, sats: u.sats, label: u.label, seller: !1 }));
  return f.sort((i, u) => i.sats - u.sats || (i.to < u.to ? -1 : 1)), f.push({ to: n, sats: e - l - o, label: t.find((i) => i.to === n)?.label ?? "seller", seller: !0 }), f.some((i) => i.sats < H.least) ? s("too-small") : { ok: !0, parts: f };
}
const Ct = /^[0-9a-f]{64}$/u, Xn = 30078, Gn = 30078, Vn = "bitunlock:entitlement:v1:", Re = "seller-unlock-service-v1", Ce = [{ endpoint: "https://api.bitunlock.network", pubkey: "66be61cf5b8d286391f7b1a72ffa7c799ec2dc49eff0830c40df1cc964e6787d" }], Jn = /^(?:localhost|127(?:\.[0-9]{1,3}){3}|10(?:\.[0-9]{1,3}){3}|192\.168(?:\.[0-9]{1,3}){2}|172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})$/u;
function hs(e) {
  if (typeof e != "string" || e.length > 300) return null;
  const [t, n] = e.split("|");
  try {
    const r = new URL(t ?? "");
    return r.protocol !== "http:" && r.protocol !== "https:" || !Jn.test(r.hostname) || r.origin !== t ? null : n && Ct.test(n) ? { endpoint: r.origin, pubkey: n } : null;
  } catch {
    return null;
  }
}
function nt(e) {
  return typeof e == "string" && /^30078:[0-9a-f]{64}:[^:\r\n][^\r\n]{0,255}$/u.test(e) ? e : "";
}
const re = (e) => e.slice(6, 70), Yn = 500, ys = (e) => e.nswp && e.priceSats < Yn, U = (e, t) => {
  const n = e.tags.find((r) => r[0] === t);
  return typeof n?.[1] == "string" ? n[1] : "";
}, be = (e, t) => typeof e == "string" ? Array.from(e.normalize("NFC")).filter((n) => {
  const r = n.codePointAt(0);
  return r >= 32 && r !== 127 && !(r >= 8203 && r <= 8207) && !(r >= 8234 && r <= 8238) && !(r >= 8294 && r <= 8297);
}).join("").trim().slice(0, t) : "";
function gs(e, t, n = Ce) {
  const r = nt(t), s = e;
  if (!r || !s || typeof s != "object" || !Array.isArray(s.tags) || !st(s) || s.kind !== Xn || s.pubkey !== re(r) || `30078:${s.pubkey}:${U(s, "d")}` !== r || U(s, "status") !== "active" || U(s, "br:delivery") !== Re) return null;
  const o = s.tags.find((i) => i[0] === "price"), a = o && o[2] === "SAT" && /^[1-9][0-9]{0,11}$/u.test(o[1] ?? "") ? Number(o[1]) : 0, c = n.find((i) => i.endpoint === U(s, "br:unlock-service") && i.pubkey === U(s, "br:unlock-service-pubkey"));
  if (!a || !c) return null;
  let l = {};
  try {
    const i = JSON.parse(s.content || "{}");
    i && typeof i == "object" && (l = i);
  } catch {
    l = {};
  }
  const f = U(s, "nswp:term");
  return {
    coordinate: r,
    seller: s.pubkey,
    title: be(U(s, "title") || l.title || l.name, 80) || be(U(s, "d"), 80),
    priceSats: a,
    service: { ...c },
    for: /^3730[0-9]:[0-9a-f]{64}:[^\s]{1,200}$/u.test(U(s, "nswp:for")) ? U(s, "nswp:for") : "",
    termSeconds: /^[1-9][0-9]{0,9}$/u.test(f) ? Number(f) : 0,
    nswp: s.tags.some((i) => typeof i[0] == "string" && i[0].startsWith("nswp:")),
    shared: s.tags.some((i) => i[0] === "nswp:share"),
    shares: ((i) => i.ok ? i.shares : null)(Hn(s.tags, s.pubkey))
  };
}
function Zn(e, t = Ce) {
  const n = e;
  if (!n || typeof n != "object" || !Array.isArray(n.tags) || typeof n.content != "string" || n.content.length > 8e3 || n.kind !== Gn || !t.some((d) => d.pubkey === n.pubkey) || !st(n)) return null;
  let r;
  try {
    r = JSON.parse(n.content);
  } catch {
    return null;
  }
  if (!r || typeof r != "object" || r.schemaVersion !== 1 || r.protocolVersion !== Re || r.status !== "active") return null;
  const s = (d) => typeof d == "string" && d.length > 0 && d.length <= 200 ? d : "", o = nt(r.productCoordinate), [a, c, l, f] = [s(r.buyerPubkey), s(r.sellerPubkey), s(r.orderId), s(r.fulfillmentId)], i = typeof r.issuedAt == "number" && Number.isSafeInteger(r.issuedAt) && r.issuedAt > 0 ? r.issuedAt : 0;
  if (!o || !Ct.test(a) || !Ct.test(c) || c !== re(o) || !l || !f || !i || U(n, "d") !== Vn + f) return null;
  let u = 0;
  if (r.accessPolicy !== "perpetual-v1") {
    const d = r.accessPolicy;
    if (!d || typeof d != "object" || d.kind !== "term-v1" || typeof d.expiresAt != "number" || !Number.isSafeInteger(d.expiresAt) || d.expiresAt <= i) return null;
    u = d.expiresAt;
  }
  return { event: { id: n.id, pubkey: n.pubkey, created_at: n.created_at, kind: n.kind, tags: n.tags.map((d) => [...d]), content: n.content, sig: n.sig }, listing: o, seller: c, buyer: a, order: l, fulfillment: f, issuedAt: i, expiresAt: u, service: n.pubkey };
}
function Qn(e, t) {
  return !!e && e.buyer === t.buyer && e.listing === t.listing && (e.expiresAt === 0 || t.now < e.expiresAt);
}
function ws(e, t) {
  const n = e.filter((r) => Qn(r, t));
  return n.sort((r, s) => r.expiresAt === 0 ? -1 : s.expiresAt === 0 ? 1 : s.expiresAt - r.expiresAt), n[0] ?? null;
}
function bs(e, t, n) {
  return t.publishers.includes(re(e)) || !!n && n === t.site;
}
const je = 37304, jt = {
  /** The most a save may hold, in bytes of UTF-8. It has to fit in one note that any relay will take. */
  dataBytes: 32768,
  /** No more saves than this for one world in `perMs`, and in an hour. Counted apart from notes and passes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** A save handed over to be opened is not read past this many characters of content. */
  contentChars: 7e4
}, qn = /^[a-z0-9][a-z0-9-]{0,31}$/u, tr = /^[0-9a-f]{64}$/u, er = "Something a world keeps for its visitor. Only they can read it.";
function z(e) {
  return typeof e == "string" && qn.test(e) ? e : "";
}
function se(e) {
  return typeof e == "string" && e.length <= jt.dataBytes && It(e).length <= jt.dataBytes;
}
function Ke(e, t, n) {
  const r = m(t), s = z(n);
  return !r || !s ? "" : hn(yn(e, It(`nswp-save
${r}
${s}`)));
}
function ms(e) {
  const t = m(e.world), n = z(e.slot), r = Ke(e.conversationKey, t, n);
  if (!r || !se(e.data)) return null;
  const s = JSON.stringify({ v: 1, world: t, slot: n, data: e.data });
  return {
    kind: je,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", r],
      ["alt", er]
    ],
    content: Un(e.conversationKey, s)
  };
}
function As(e, t) {
  const n = m(t.world);
  if (!n || !e || typeof e != "object" || !tr.test(t.pubkey)) return null;
  const r = e;
  if (r.kind !== je || r.pubkey !== t.pubkey || typeof r.content != "string" || r.content.length > jt.contentChars || !Array.isArray(r.tags)) return null;
  let s;
  try {
    s = JSON.parse(Fn(t.conversationKey, r.content));
  } catch {
    return null;
  }
  if (!s || typeof s != "object" || s.v !== 1 || s.world !== n) return null;
  const o = z(s.slot);
  if (!o || !se(s.data)) return null;
  const a = r.tags.find((c) => Array.isArray(c) && c[0] === "d");
  return !a || a[1] !== Ke(t.conversationKey, n, o) ? null : { slot: o, data: s.data, at: typeof r.created_at == "number" && Number.isInteger(r.created_at) ? r.created_at : 0 };
}
const oe = 30078, Ue = "nswp", G = { read: 2e3, write: 500, ahead: 600, root: 4 }, nr = /^[0-9a-f]{64}$/u, rr = /^[0-9a-f]{128}$/u, sr = /^[a-z0-9][a-z0-9._-]{0,63}$/u, or = /^([^:]*):governance:([^:]*):v([^:]*):([\s\S]*)$/u, V = (e) => typeof e == "string" && nr.test(e);
function ht(e) {
  if (typeof e != "string") return !1;
  const t = /^(0|[1-9][0-9]{0,4}):([0-9a-f]{64}):([\s\S]*)$/u.exec(e);
  if (!t || Number(t[1]) > 65535) return !1;
  const n = t[3];
  if (!n || new TextEncoder().encode(n).length > 512) return !1;
  for (const r of n) {
    const s = r.codePointAt(0);
    if (s <= 31 || s === 127) return !1;
  }
  return !0;
}
const ir = (e, t) => `${Ue}:governance:${e}:v1:${t}`, Be = (e) => {
  const t = e;
  return !!t && typeof t == "object" && V(t.id) && V(t.pubkey) && typeof t.sig == "string" && rr.test(t.sig) && Number.isInteger(t.kind) && Number.isInteger(t.created_at) && typeof t.content == "string" && Array.isArray(t.tags) && t.tags.every((n) => Array.isArray(n) && n.every((r) => typeof r == "string"));
}, Fe = (e) => {
  const t = Array.isArray(e) ? e : [e];
  return t.length >= 1 && t.length <= G.root && t.every(V) ? [...new Set(t)] : null;
}, We = (e) => {
  try {
    return st({ ...e, tags: e.tags.map((t) => [...t]) });
  } catch {
    return !1;
  }
};
function Kt(e, t = {}) {
  const n = (p) => ({ ok: !1, reason: p }), r = t.now ?? Math.floor(Date.now() / 1e3);
  if (!Be(e)) return n("not_an_event");
  const s = e;
  if (s.kind !== oe) return n("wrong_kind");
  const o = s.tags.filter((p) => p[0] === "d"), a = o.length === 1 ? or.exec(o[0][1] ?? "") : null;
  if (!a || !sr.test(a[1]) || !/^[0-9]+$/u.test(a[3])) return n("bad_d");
  const [, , c, l, f] = a;
  if (l !== "1") return n("unsupported_version");
  if (c !== "user-allow" && c !== "user-deny") return n("unsupported_scope");
  if (!ht(f)) return n("bad_subject");
  const i = (p, b) => {
    const w = s.tags.filter((A) => A[0] === p);
    return w.length === 1 && w[0][1] === b;
  };
  if (!i("v", l) || !i("scope", c) || !i("subject", f)) return n("tag_mismatch");
  const u = t.root === void 0 ? [f.slice(f.indexOf(":") + 1, f.indexOf(":") + 65)] : Fe(t.root);
  if (!u || !u.includes(s.pubkey)) return n("wrong_signer");
  if (s.content !== "") return n("content_not_empty");
  const d = s.tags.filter((p) => p[0] === "p");
  if (d.length > G.read) return n("too_many_entries");
  if (s.created_at > r + G.ahead) return n("from_the_future");
  if (!We(s)) return n("bad_signature");
  const h = [];
  let g = 0;
  for (const p of d)
    V(p[1]) ? h.includes(p[1]) || h.push(p[1]) : g++;
  return h.sort(), { ok: !0, scope: c, subject: f, signer: s.pubkey, entries: h, skipped: g };
}
function vs(e, t) {
  const n = t.now ?? Math.floor(Date.now() / 1e3), r = `${t.namespace ?? Ue}:governance:${t.scope}:v1:${t.subject}`, s = t.root === void 0 ? ht(t.subject) ? [t.subject.split(":")[1]] : null : Fe(t.root);
  if (!s) return { ok: !1, reason: "wrong_signer", futureDated: [] };
  const o = [], a = [], c = /* @__PURE__ */ new Set();
  for (const l of e) {
    if (!Be(l) || l.kind !== oe || !s.includes(l.pubkey) || c.has(l.id)) continue;
    const f = l.tags.filter((i) => i[0] === "d");
    f.length !== 1 || f[0][1] !== r || !We(l) || (c.add(l.id), l.created_at > n + G.ahead ? a.push(l.id) : o.push(l));
  }
  return o.length ? (o.sort((l, f) => f.created_at - l.created_at || (l.id < f.id ? -1 : 1)), { ...Kt(o[0], { root: s, now: n }), futureDated: a }) : { ok: !1, reason: "not_found", futureDated: a };
}
function Ss(e) {
  const t = [...new Set(e.people)].sort();
  if (!ht(e.subject) || t.length > G.write || !t.every(V) || !Number.isSafeInteger(e.createdAt)) return null;
  const n = Number.isSafeInteger(e.notBefore) && e.notBefore + 1 > e.createdAt ? e.notBefore + 1 : e.createdAt;
  return { kind: oe, created_at: n, content: "", tags: [["d", ir(e.scope, e.subject)], ["v", "1"], ["scope", e.scope], ["subject", e.subject], ...t.map((r) => ["p", r])] };
}
const ze = ["allow", "unallow", "block", "unblock"], me = (e) => e === "allow" || e === "unallow" ? "user-allow" : "user-deny";
function ar(e, t, n) {
  const r = e.includes(n);
  return t === "allow" || t === "block" ? r ? null : [...e, n].sort() : r ? e.filter((s) => s !== n) : null;
}
function _s(e, t, n) {
  const r = /^37300:([0-9a-f]{64}):([\s\S]{1,128})$/u.exec(n), s = e;
  if (!r || !s || typeof s != "object" || !s.publishers || !s.worlds || typeof s.publishers != "object" || typeof s.worlds != "object") return null;
  const [, o, a] = r, c = (d) => {
    const h = s.publishers[d]?.worlds;
    return Array.isArray(h) && h.includes(a);
  };
  if (!Object.prototype.hasOwnProperty.call(s.worlds, a) || !c(o)) return null;
  const l = s.worlds[a];
  let f = "";
  try {
    f = new URL(String(l.entry?.url)).origin;
  } catch {
    return null;
  }
  if (f !== t) return null;
  const i = Array.isArray(l.keepers) ? [...new Set(l.keepers.filter(V))] : [], u = i.length ? i.slice(0, G.root) : Object.keys(s.publishers).filter((d) => V(d) && c(d)).slice(0, G.root);
  return u.length ? { coordinate: n, keepers: u, d: a } : null;
}
function Es(e, t) {
  const n = Kt(e, { root: [t.pubkey], now: t.now });
  if (!n.ok || n.subject !== t.world || n.scope !== me(t.change) || n.skipped !== 0) return !1;
  const r = t.list === null ? [] : ((o) => o.ok && o.subject === t.world && o.scope === me(t.change) ? o.entries : null)(Kt(t.list, { root: [t.pubkey], now: t.now }));
  if (!r) return !1;
  const s = ar(r, t.change, t.key);
  return !!s && JSON.stringify(s) === JSON.stringify(n.entries) && Math.abs(e.created_at - t.now) < 600;
}
const Ut = 3, Ns = { burst: 6, perMs: 6e4, hourly: 60 }, gt = {
  /** A list handed over to be changed is not read past this many tags, or this much content. */
  tags: 2e4,
  contentChars: 1e5,
  tagItems: 16,
  tagChars: 1e3
}, cr = ["follows", "messages"];
function ct(e) {
  return Array.isArray(e) ? cr.filter((t) => e.includes(t)) : [];
}
const lr = ["nswp:world", "bitlogin:site"], ur = /^[0-9a-f]{64}$/u;
function Ae(e, t) {
  if (e && (e.kind !== Ut || !Array.isArray(e.tags)) || !e && !t.fromNothing) return null;
  const n = typeof t.add == "string" ? t.add.toLowerCase() : "", r = typeof t.remove == "string" ? t.remove.toLowerCase() : "";
  if (n === "" == (r === "")) return null;
  const s = n || r;
  if (!ur.test(s) || n && (e?.pubkey ?? t.pubkey) === n) return null;
  const o = e ? e.tags.filter((i) => Array.isArray(i) && i.every((u) => typeof u == "string") && !lr.includes(i[0] ?? "")) : [], a = (i) => i[0] === "p" && typeof i[1] == "string" && i[1].toLowerCase() === s, c = o.some(a);
  if (n ? c : !c) return null;
  const l = n ? [...o.map((i) => [...i]), ["p", n]] : o.filter((i) => !a(i)).map((i) => [...i]), f = Math.max(Math.floor(t.nowSeconds), e ? e.created_at + 1 : 0);
  return { kind: Ut, created_at: f, tags: l, content: typeof e?.content == "string" ? e.content : "" };
}
function fr(e, t) {
  if (!e || typeof e != "object") return null;
  const n = e;
  if (n.kind !== Ut || n.pubkey !== t || !Array.isArray(n.tags) || n.tags.length > gt.tags || typeof n.content != "string" || n.content.length > gt.contentChars) return null;
  for (const r of n.tags)
    if (!Array.isArray(r) || r.length > gt.tagItems || !r.every((s) => typeof s == "string" && s.length <= gt.tagChars)) return null;
  return st(e) ? e : null;
}
function Is(e) {
  const t = { add: e.add, remove: e.remove, nowSeconds: e.nowSeconds, pubkey: e.pubkey };
  if (e.list === null || e.list === void 0) return e.seen ? null : Ae(null, { ...t, fromNothing: !0 });
  const n = fr(e.list, e.pubkey);
  return !n || e.seen && n.created_at < e.seen ? null : Ae(n, t);
}
function ks(e, t) {
  return e === null ? t.answered > 0 && t.newestAt === 0 : e.created_at >= t.newestAt;
}
const Bt = 14, He = 13, dr = 1059, pr = 10050, vt = {
  /** The most characters in one message. */
  chars: 2e3,
  /** No more than this many relays are put in a list of where messages reach someone. */
  relays: 4,
  /** A wrap handed over to be opened is not read past this many characters of content. */
  wrapChars: 6e4
}, Os = { burst: 10, perMs: 6e4, hourly: 200 }, Ls = { burst: 600, perMs: 6e4, hourly: 12e3 }, xs = { burst: 3, perMs: 6e4, hourly: 12 }, St = /^[0-9a-f]{64}$/u, hr = [
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
function _t(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, vt.chars * 8).normalize("NFC")) {
    const r = n.codePointAt(0);
    t += hr.some(([s, o]) => r >= s && r <= o) ? " " : n;
  }
  return t = t.replace(/[^\S\n]+/gu, " ").replace(/ ?\n ?/gu, `
`).replace(/\n{3,}/gu, `

`).trim(), [...t].slice(0, vt.chars).join("").trim();
}
function yr(e) {
  const t = _t(e.text);
  if (!St.test(e.from) || typeof e.to != "string" || !St.test(e.to) || e.from === e.to || !t) return null;
  const n = { kind: Bt, pubkey: e.from, created_at: Math.floor(e.nowSeconds), tags: [["p", e.to]], content: t };
  return { ...n, id: Ie(n) };
}
function Ts(e, t) {
  const n = e.getPublicKey(), r = yr({ from: n, to: t.to, text: t.text, nowSeconds: t.nowSeconds });
  if (!r) return null;
  const s = JSON.stringify(r), o = (a) => e.signEvent({ kind: He, created_at: Math.floor(t.nowSeconds), tags: [], content: e.nip44Encrypt(a, s) });
  return { message: r, seals: [o(r.tags[0][1]), o(n)] };
}
function gr(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  return !st(t) || t.kind !== He || t.tags.length !== 0 ? null : t;
}
function wr(e, t, n) {
  let r;
  try {
    r = JSON.parse(e);
  } catch {
    return null;
  }
  if (!r || typeof r != "object" || r.kind !== Bt || r.pubkey !== t || typeof r.pubkey != "string" || !St.test(r.pubkey) || typeof r.content != "string" || typeof r.created_at != "number" || !Number.isInteger(r.created_at) || !Array.isArray(r.tags) || !r.tags.every((c) => Array.isArray(c) && c.every((l) => typeof l == "string"))) return null;
  const s = [...new Set(r.tags.filter((c) => c[0] === "p" && typeof c[1] == "string" && St.test(c[1])).map((c) => c[1]))], o = _t(r.content);
  return s.length === 0 || !o || r.pubkey !== n && !s.includes(n) ? null : { id: Ie({ kind: Bt, pubkey: r.pubkey, created_at: r.created_at, tags: r.tags, content: r.content }), from: r.pubkey, to: s, text: o, at: r.created_at };
}
function Ms(e, t) {
  const n = e.getPublicKey();
  if (!t || typeof t != "object") return null;
  const r = t;
  if (r.kind !== dr || typeof r.content != "string" || r.content.length > vt.wrapChars || !Array.isArray(r.tags) || r.tags.length > 20 || !st(t) || !t.tags.some((s) => s[0] === "p" && s[1] === n)) return null;
  try {
    const s = gr(e.nip44Decrypt(t.pubkey, t.content));
    return s ? wr(e.nip44Decrypt(s.pubkey, s.content), s.pubkey, n) : null;
  } catch {
    return null;
  }
}
function br(e) {
  if (typeof e != "string" || e.length > 200) return "";
  try {
    const t = new URL(e.trim()), n = t.hostname;
    return t.protocol !== "wss:" || t.username || t.password || !n.includes(".") || n.startsWith("[") || /^[0-9.]+$/u.test(n) || /\.(local|localhost|internal|lan|home)$/iu.test(n) ? "" : (t.hash = "", t.href.replace(/\/$/u, ""));
  } catch {
    return "";
  }
}
function Ps(e, t) {
  if (!Array.isArray(e) || e.length > 8) return null;
  const n = [...new Set(e.map(br).filter(Boolean))].slice(0, vt.relays);
  return n.length === 0 ? null : { kind: pr, created_at: Math.floor(t), tags: n.map((r) => ["relay", r]), content: "" };
}
const mr = 37306, ve = 37300, Ft = {
  /** No more scores than this for one world in `perMs`, and in an hour. Counted apart from notes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** The most a score may be. */
  most: 9007199254740991,
  /** The longest a board's title may be, in characters. */
  title: 60
}, Ar = /^[a-z0-9][a-z0-9-]{0,31}$/u, vr = /^(\d+):([0-9a-f]{64}):(.*)$/su;
function q(e) {
  if (typeof e != "string" || e.length > 200) return "";
  const t = vr.exec(e);
  return t && Number(t[1]) === ve && t[3] !== "" ? `${ve}:${t[2]}:${t[3]}` : "";
}
function Wt(e) {
  return typeof e == "string" && Ar.test(e) ? e : "";
}
function zt(e) {
  const t = typeof e == "string" && /^\d{1,16}$/u.test(e) ? Number(e) : e;
  return typeof t == "number" && Number.isSafeInteger(t) && t >= 0 && t <= Ft.most ? t : null;
}
function Ht(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, Ft.title * 8).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    t += s ? " " : n;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, Ft.title).join("").trim();
}
function Sr(e, t) {
  if (e !== "time") return String(t).replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
  const n = Math.round(t / 100), r = Math.floor(n / 600), s = n % 600 / 10;
  return r ? `${r} min ${s.toFixed(1)} s` : `${s.toFixed(1)} s`;
}
function $s(e) {
  const t = m(e.origin), n = q(e.world), r = Wt(e.board), s = zt(e.score);
  if (!t || !n || !r || s === null) return null;
  const o = Ht(e.title), a = e.format === "time" ? "time" : "number";
  return {
    kind: mr,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", `${n}/${r}`],
      ["a", n],
      ["board", r, ...o ? [o] : []],
      ["score", String(s), ...a === "time" ? ["time"] : []],
      ["alt", `A score in a world: ${o ? `${o}: ` : ""}${Sr(a, s)}`],
      [Et, t]
    ],
    content: ""
  };
}
const _r = 37307, Se = {
  /** No more than this many for one world in `perMs`, and in an hour. Counted apart from notes and scores. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** The longest a title may be, in characters. */
  title: 60
}, Er = /^[a-z0-9][a-z0-9-]{0,31}$/u;
function Xt(e) {
  return typeof e == "string" && Er.test(e) ? e : "";
}
function Gt(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, Se.title * 8).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    t += s ? " " : n;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, Se.title).join("").trim();
}
function Ds(e) {
  const t = m(e.origin), n = q(e.world), r = Xt(e.id), s = Gt(e.title);
  return !t || !n || !r || !s ? null : {
    kind: _r,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", `${n}/${r}`],
      ["a", n],
      ["achievement", r],
      ["title", s],
      ["alt", `An achievement in a world: ${s}`],
      [Et, t]
    ],
    content: ""
  };
}
const Xe = "nswp-signer", Ge = "nswp-handoff", kt = 1, lt = {
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
}, Nr = [1, 7], Ir = [4, 13, 14, 15, 1059, 1060, 13194, 22242, 23194, 23195, 24133, 27235, 27300, 27301, 30078], kr = [0, 5, 10002], Rs = { burst: 2, perMs: 6e4, hourly: 10 }, Cs = 5 * 6e4;
function Ve(e) {
  return typeof e != "number" || !Number.isInteger(e) || e < 0 || e > 65535 || Ir.includes(e) ? "never" : Nr.includes(e) ? "ordinary" : "careful";
}
const Et = "nswp:world";
function m(e) {
  if (typeof e != "string" || e.length > 300) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin !== "null" ? t.origin : "";
  } catch {
    return "";
  }
}
function Vt(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, 400).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    t += s ? " " : n;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, 48).join("").trim();
}
function js(e, t, n) {
  return Je(e, t, n, (r) => Ve(r) === "ordinary");
}
function Or(e, t, n) {
  return Je(e, t, n, (r) => Ve(r) === "careful" && kr.includes(r));
}
function Je(e, t, n, r) {
  const s = m(t);
  if (!s || !e || typeof e != "object") return null;
  const o = e;
  if (!r(o.kind) || typeof o.content != "string" || [...o.content].length > lt.contentChars || !Array.isArray(o.tags) || o.tags.length > lt.tags) return null;
  const a = [];
  for (const c of o.tags) {
    if (!Array.isArray(c) || c.length === 0 || c.length > lt.tagItems || !c.every((l) => typeof l == "string" && l.length <= lt.tagChars)) return null;
    c[0] !== Et && a.push([...c]);
  }
  return a.push([Et, s]), { kind: o.kind, created_at: Math.floor(n), tags: a, content: o.content };
}
function Ks(e = lt, t = []) {
  let n = t.filter((r) => typeof r == "number" && Number.isFinite(r));
  return {
    times: () => [...n],
    take(r) {
      return n = n.filter((s) => r - s < 36e5), n.length >= e.hourly || n.filter((s) => r - s < e.perMs).length >= e.burst ? !1 : (n.push(r), !0);
    }
  };
}
const Ye = /^[0-9a-z-]{1,40}$/iu, j = /^[0-9a-f]{64}$/u, Us = (e) => ({ nswp: Xe, v: kt, ...e });
function Bs(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.nswp !== Xe || t.v !== kt || typeof t.id != "string" || !Ye.test(t.id)) return null;
  if (t.t === "state") return { t: "state", id: t.id };
  if (t.t === "lock") return { t: "lock", id: t.id };
  if (t.t === "sign" && t.event && typeof t.event == "object") return { t: "sign", id: t.id, event: t.event };
  if (t.t === "propose" && t.event && typeof t.event == "object") return { t: "propose", id: t.id, event: t.event };
  if (t.t === "wallet") return { t: "wallet", id: t.id };
  if (t.t === "pay" && et(t.invoice)) return { t: "pay", id: t.id, invoice: et(t.invoice) };
  if (t.t === "tip" && X(t.sats) && (t.to === void 0 || typeof t.to == "string" && j.test(t.to))) return { t: "tip", id: t.id, sats: X(t.sats), ...typeof t.to == "string" ? { to: t.to } : {} };
  if (t.t === "guests" && typeof t.world == "string" && t.world.startsWith("37300:") && ht(t.world) && ze.includes(t.change) && typeof t.key == "string" && j.test(t.key) && (t.list === null || t.list && typeof t.list == "object"))
    return { t: "guests", id: t.id, world: t.world, list: t.list, change: t.change, key: t.key, none: t.none === !0 };
  if ((t.t === "buy" || t.t === "have") && nt(t.listing)) return { t: t.t, id: t.id, listing: nt(t.listing) };
  if (t.t === "file-pick") return { t: "file-pick", id: t.id };
  if (t.t === "file-save") {
    const n = ie(t);
    return n ? { t: "file-save", id: t.id, ...n, private: t.private !== !1 } : null;
  }
  if (t.t === "pass" && typeof t.session == "string" && j.test(t.session)) return { t: "pass", id: t.id, session: t.session };
  if (t.t === "save" && z(t.slot) && se(t.data)) return { t: "save", id: t.id, slot: z(t.slot), data: t.data };
  if (t.t === "find" && z(t.slot)) return { t: "find", id: t.id, slot: z(t.slot) };
  if (t.t === "open" && t.event && typeof t.event == "object") return { t: "open", id: t.id, event: t.event };
  if (t.t === "want" && t.permissions === void 0 && Array.isArray(t.more)) return { t: "wantMore", id: t.id, more: ct(t.more) };
  if (t.t === "follow" && (t.list === null || t.list && typeof t.list == "object")) {
    const n = typeof t.add == "string" && j.test(t.add), r = typeof t.remove == "string" && j.test(t.remove);
    return n === r ? null : { t: "follow", id: t.id, list: t.list, ...n ? { add: t.add } : { remove: t.remove } };
  }
  if (t.t === "score" && q(t.world) && Wt(t.board) && zt(t.score) !== null) return { t: "score", id: t.id, world: q(t.world), board: Wt(t.board), score: zt(t.score), ...Ht(t.title) ? { title: Ht(t.title) } : {}, ...t.format === "time" ? { format: "time" } : {} };
  if (t.t === "achieve" && q(t.world) && Xt(t.achievement) && Gt(t.title))
    return { t: "achieve", id: t.id, world: q(t.world), achievement: Xt(t.achievement), title: Gt(t.title) };
  if (t.t === "seal" && typeof t.to == "string" && j.test(t.to) && _t(t.text)) return { t: "seal", id: t.id, to: t.to, text: _t(t.text) };
  if (t.t === "unwrap" && t.event && typeof t.event == "object") return { t: "unwrap", id: t.id, event: t.event };
  if (t.t === "reach" && Array.isArray(t.relays) && t.relays.length <= 8 && t.relays.every((n) => typeof n == "string" && n.length <= 200)) return { t: "reach", id: t.id, relays: t.relays };
  if (t.t === "want") {
    const n = nn(t.permissions);
    return n ? { t: "want", id: t.id, permissions: n } : null;
  }
  return (t.t === "encrypt" || t.t === "decrypt") && typeof t.peer == "string" && j.test(t.peer) && typeof t.text == "string" && t.text.length <= 2e5 ? { t: t.t, id: t.id, peer: t.peer, text: t.text, scheme: t.scheme === "nip04" ? "nip04" : "nip44" } : t.t === "read" && t.event && typeof t.event == "object" ? { t: "read", id: t.id, event: t.event } : null;
}
const Lr = 2e4, Ze = 60, xr = 25 * 1024 * 1024;
function ie(e) {
  if (!e || typeof e != "object") return null;
  const t = e, n = xt(t.name), r = t.bytes instanceof Uint8Array ? t.bytes : t.bytes instanceof ArrayBuffer ? new Uint8Array(t.bytes) : null;
  return !n || !r || r.length === 0 || r.length > xr ? null : { name: n, type: typeof t.type == "string" && /^[\x21-\x7e]{3,120}$/u.test(t.type) && t.type.includes("/") ? t.type.toLowerCase() : "application/octet-stream", bytes: r };
}
const wt = (e) => {
  try {
    const t = new URL(String(e));
    return typeof e == "string" && e.length <= 400 && (t.protocol === "https:" || t.protocol === "http:") ? t.href : "";
  } catch {
    return "";
  }
}, Tr = (e) => typeof e == "string" && e.length <= 2e3 && /^nostr\+walletconnect:\/\/[0-9a-f]{64}\?[\x21-\x7e]+$/u.test(e) ? e : "";
function Lt(e, t) {
  if (!e || typeof e != "object") return null;
  const n = e;
  if (n.what === "wallet") return { what: "wallet" };
  if (n.what === "pick") return { what: "pick" };
  if (n.what === "save") {
    const s = ie(n);
    return s ? { what: "save", ...s, private: n.private !== !1 } : null;
  }
  if (n.what === "tip") {
    const s = n;
    return !X(s.sats) || s.to !== void 0 && !(typeof s.to == "string" && j.test(s.to)) ? null : { what: "tip", sats: X(s.sats), ...typeof s.to == "string" ? { to: s.to } : {} };
  }
  if (n.what === "guests") {
    const s = n;
    return typeof s.world != "string" || !s.world.startsWith("37300:") || !ht(s.world) || !ze.includes(s.change) || typeof s.key != "string" || !j.test(s.key) || s.list !== null && !(s.list && typeof s.list == "object") ? null : { what: "guests", world: s.world, list: s.list ?? null, change: s.change, key: s.key, none: s.none === !0 };
  }
  if (n.what === "buy") return nt(n.listing) ? { what: "buy", listing: nt(n.listing) } : null;
  if (n.what === "pay") return et(n.invoice) ? { what: "pay", invoice: et(n.invoice) } : null;
  if (n.what !== "sign") return null;
  const r = Or(n.event, t, n.event?.created_at ?? 0);
  return r && JSON.stringify(r.tags) === JSON.stringify(n.event.tags) ? { what: "sign", event: r } : null;
}
const Fs = (e) => ({ nswp: Ge, v: kt, ...e });
function Ws(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.nswp !== Ge || t.v !== kt || typeof t.nonce != "string" || !Ye.test(t.nonce)) return null;
  const n = (r) => typeof r == "string" && j.test(r);
  if (t.t === "hello") return { t: "hello", nonce: t.nonce };
  if (t.t === "frame" && m(t.world) && n(t.recipient)) {
    const r = t.wants === void 0 ? void 0 : nn(t.wants);
    return r === null ? null : { t: "frame", nonce: t.nonce, world: m(t.world), recipient: t.recipient, ...r ? { wants: r } : {}, ...t.turnedDown === !0 ? { turnedDown: !0 } : {}, ...!r && ct(t.more).length ? { more: ct(t.more) } : {}, ...!r && ct(t.has).length ? { has: ct(t.has) } : {}, ...Lt(t.ask, m(t.world)) && n(t.pubkey) && !(r && Lt(t.ask, m(t.world)).what === "wallet") ? { ask: Lt(t.ask, m(t.world)), pubkey: t.pubkey } : {} };
  }
  if (t.t === "answer" && m(t.world)) {
    const r = t.wallet === void 0 ? "" : Tr(t.wallet);
    if (t.wallet !== void 0 && !r) return null;
    const s = t.event && typeof t.event == "object" ? t.event : void 0, o = t.paid && typeof t.paid == "object" ? t.paid : null, a = o && et(o.invoice) ? { invoice: et(o.invoice), ...typeof o.preimage == "string" && j.test(o.preimage) ? { preimage: o.preimage } : {} } : null;
    if (t.paid !== void 0 && !a) return null;
    const c = t.saved && typeof t.saved == "object" ? t.saved : null, l = c && xt(c.name) && typeof c.size == "number" && Number.isSafeInteger(c.size) && c.size >= 0 ? { name: xt(c.name), size: c.size, private: c.private !== !1, ...c.private === !1 && wt(c.url) ? { url: wt(c.url) } : {} } : null;
    if (t.saved !== void 0 && !l) return null;
    const f = t.file === void 0 ? null : ie(t.file);
    if (t.file !== void 0 && !f) return null;
    const i = f ? { ...f, ...wt(t.file.url) ? { url: wt(t.file.url) } : {} } : null, u = t.tipped && typeof t.tipped == "object" ? t.tipped : null, d = u && X(u.sats) ? { sats: X(u.sats), ...typeof u.preimage == "string" && j.test(u.preimage) ? { preimage: u.preimage } : {} } : null;
    if (t.tipped !== void 0 && !d) return null;
    const h = t.bought && typeof t.bought == "object" ? t.bought : null, g = h && h.receipt && typeof h.receipt == "object" ? { receipt: h.receipt, ...typeof h.delivery == "string" && h.delivery.length > 0 && h.delivery.length <= Lr ? { delivery: h.delivery } : {} } : null;
    if (t.bought !== void 0 && !g) return null;
    const p = t.listed && typeof t.listed == "object" ? t.listed : void 0;
    return t.listed !== void 0 && !p || [s, r, a, l, i, d, g, p].filter(Boolean).length > 1 ? null : { t: "answer", nonce: t.nonce, world: m(t.world), ...s ? { event: s } : {}, ...p ? { listed: p } : {}, ...r ? { wallet: r } : {}, ...a ? { paid: a } : {}, ...l ? { saved: l } : {}, ...i ? { file: i } : {}, ...d ? { tipped: d } : {}, ...g ? { bought: g } : {} };
  }
  if (t.t === "held" && m(t.world) && Array.isArray(t.receipts) && t.receipts.length <= Ze && t.receipts.every((r) => r && typeof r == "object"))
    return { t: "held", nonce: t.nonce, world: m(t.world), receipts: t.receipts };
  if (t.t === "grant" && m(t.world) && t.sealed && typeof t.sealed == "object") {
    const r = t.sealed;
    if (!n(r.senderPublicKey) || typeof r.payload != "string" || r.payload.length > 12e3) return null;
    const s = Vt(t.name);
    return { t: "grant", nonce: t.nonce, world: m(t.world), sealed: { senderPublicKey: r.senderPublicKey, payload: r.payload }, ...s ? { name: s } : {} };
  }
  return t.t === "done" && typeof t.ok == "boolean" ? { t: "done", nonce: t.nonce, ok: t.ok } : null;
}
function zs(e, t, n) {
  const r = [];
  for (const s of e.slice(0, Ze)) {
    const o = Zn(s, n);
    o && o.buyer === t && r.push(o.event);
  }
  return r;
}
const Z = { kinds: 64, prefixes: 8, origins: 8, peers: 8, prefixChars: 64 }, rt = 30078, ut = 27235, Qe = 24242, ae = 22242, qe = 13, Mr = 37304, Jt = "bitlogin:", tn = [13194, 23194, 23195, 24133, 27301, 37304], ft = {
  "https://bitvid.network": { name: "Bitvid" },
  "https://beta.bitvid.network": { name: "Bitvid (beta)" },
  "https://unstable.bitvid.network": { name: "Bitvid (unstable)" },
  "https://bitunlock.network": { name: "BitUnlock" },
  "https://portal.bitblocks.network": { name: "BitPortal", reserved: [27300, 27302, 27303] },
  "https://imsatisfied.app": { name: "Satisfied" },
  "https://adzaps.net": { name: "AdZap" },
  "https://www.adzaps.net": { name: "AdZap" },
  "https://tessera.bitblocks.network": { name: "Tessera" },
  "https://bitroad.network": { name: "BitRoad" },
  "https://www.bitroad.network": { name: "BitRoad" }
}, yt = [27300, 27302, 27303], Pr = 27303;
function Hs(e) {
  return Object.hasOwn(ft, e) ? ft[e].name : null;
}
function dt(e) {
  if (typeof e != "string" || e.length > 300) return !1;
  let t;
  try {
    const o = new URL(e);
    if (o.protocol !== "https:" && o.protocol !== "http:") return !1;
    t = o.hostname.toLowerCase();
  } catch {
    return !1;
  }
  if (t === "localhost" || t.endsWith(".localhost") || t === "[::1]") return !0;
  const n = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/u.exec(t)?.slice(1).map(Number);
  if (!n || n.some((o) => o > 255)) return !1;
  const [r, s] = n;
  return r === 127 || r === 10 || r === 192 && s === 168 || r === 172 && s >= 16 && s <= 31;
}
const $r = ["https://bitlogin.network", "https://bitlogin-beta.vercel.app"], Xs = (e) => typeof e == "string" && ($r.includes(e) || dt(e)), Dr = ["https://bitlogin-beta.vercel.app"], Gs = (e) => typeof e == "string" && (Dr.includes(e) || dt(e)), Rr = [], Vs = (e) => typeof e == "string" && (Rr.includes(e) || dt(e));
function Cr(e, t) {
  return Object.hasOwn(ft, e) ? ft[e].reserved ?? [] : dt(t) && dt(e) ? yt : [];
}
const jr = () => {
  try {
    return globalThis.location?.origin ?? "";
  } catch {
    return "";
  }
}, ce = (e) => Cr(e, jr()), Js = (e) => !Object.hasOwn(ft, e) && ce(e).length > 0;
function Ys(e, t) {
  const n = ce(e);
  return [...t.sign, ...t.read].every((r) => !yt.includes(r) || n.includes(r));
}
const en = [0, 3, 5, 1e4, 10002, 10050, ae], Kr = [...en, Qe, ...yt], Ur = [4, qe, 1059], Br = [ut, Qe, ae], pt = /^[0-9a-f]{64}$/u, Nt = (e) => typeof e == "number" && Number.isInteger(e) && e >= 0 && e <= 65535, at = (e) => [...new Set(e)];
function nn(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, n = (i) => i === void 0 ? [] : Array.isArray(i) ? i : null, r = n(t.sign), s = n(t.appData), o = n(t.proofs), a = n(t.read), c = n(t.peers);
  if (!r || !s || !o || !a || !c || r.length > Z.kinds || a.length > Z.kinds || s.length > Z.prefixes || o.length > Z.origins || c.length > Z.peers || !r.every(Nt) || !a.every(Nt) || r.some((i) => tn.includes(i)) || a.includes(Mr) || r.length === 0 && a.length === 0 && c.length === 0) return null;
  for (const i of s)
    if (typeof i != "string" || i.length === 0 || i.length > Z.prefixChars || i !== "*" && (i.startsWith(Jt) || Jt.startsWith(i)) || Vt(i) !== i) return null;
  if ((r.includes(rt) || a.includes(rt)) !== s.length > 0) return null;
  const l = [];
  for (const i of o) {
    const u = m(i);
    if (!u || u !== i || !u.startsWith("https://")) return null;
    l.push(u);
  }
  if (l.length > 0 && !r.includes(ut) || !c.every((i) => typeof i == "string" && pt.test(i))) return null;
  const f = Vt(t.name);
  return {
    ...f ? { name: f } : {},
    sign: at(r).sort((i, u) => i - u),
    appData: at(s),
    proofs: at(l),
    read: at(a).sort((i, u) => i - u),
    peers: at(c)
  };
}
const Zs = {
  /** Proofs, and the application's own data: what applications sign on timers. */
  quiet: { burst: 300, perMs: 6e4, hourly: 6e3 },
  public: { burst: 60, perMs: 6e4, hourly: 1200 },
  sensitive: { burst: 30, perMs: 6e4, hourly: 300 },
  read: { burst: 600, perMs: 6e4, hourly: 12e3 }
}, Q = {
  contentChars: 1e5,
  tags: 2500,
  /** Who someone follows (kind 3) is one note with a tag for each person: more are let through. */
  followTags: 2e4,
  tagItems: 16,
  tagChars: 1e3,
  clockSlackSec: 600
}, Yt = (e) => e >= 3e4 && e < 4e4;
function Qs(e) {
  return en.includes(e) && e !== ae || yt.includes(e) ? "sensitive" : Br.includes(e) || Yt(e) ? "quiet" : "public";
}
const _e = "bitlogin:site", le = (e, t) => e.filter((n) => n[0] === t && typeof n[1] == "string").map((n) => n[1]);
function rn(e, t) {
  const n = le(t, "d")[0];
  return n === void 0 || n.startsWith(Jt) ? !1 : e.appData.some((r) => r === "*" || n.startsWith(r));
}
function Fr(e, t, n) {
  const r = le(n, "u");
  return r.length === 0 ? !1 : r.every((s) => {
    const o = m(s);
    return o !== "" && (o === t || e.proofs.includes(o));
  });
}
function qs(e, t, n, r) {
  const s = m(n);
  if (!s || !t || typeof t != "object") return null;
  const o = t;
  if (!Nt(o.kind) || tn.includes(o.kind) || !e.sign.includes(o.kind) || yt.includes(o.kind) && !ce(s).includes(o.kind) || typeof o.content != "string" || o.content.length > Q.contentChars || !Array.isArray(o.tags) || o.tags.length > (o.kind === 3 ? Q.followTags : Q.tags)) return null;
  const a = [];
  for (const i of o.tags) {
    if (!Array.isArray(i) || i.length === 0 || i.length > Q.tagItems || !i.every((u) => typeof u == "string" && u.length <= Q.tagChars)) return null;
    if (i[0] !== _e) {
      if (i[0] === "nswp:world") {
        if (o.kind !== Pr) continue;
        if (i.length !== 2 || m(i[1]) !== i[1] || a.some((u) => u[0] === "nswp:world")) return null;
      }
      a.push([...i]);
    }
  }
  if (o.kind === rt && !rn(e, a) || o.kind === ut && !Fr(e, s, a)) return null;
  if (o.kind === qe) {
    if (a.length > 0) return null;
  } else
    a.push([_e, s]);
  const c = Math.floor(r), l = typeof o.created_at == "number" && Number.isInteger(o.created_at) ? o.created_at : c, f = Math.abs(l - c) <= Q.clockSlackSec ? l : c;
  return { kind: o.kind, created_at: f, tags: a, content: o.content };
}
function to(e, t, n) {
  return typeof n == "string" && pt.test(n) && (n === t || e.peers.includes(n));
}
function eo(e, t) {
  return typeof t == "string" && pt.test(t) && e.peers.includes(t);
}
function Wr(e, t, n) {
  if (!Nt(n.kind) || !e.read.includes(n.kind) || typeof n.pubkey != "string" || !pt.test(n.pubkey) || !Array.isArray(n.tags)) return null;
  const r = n.tags.filter((o) => Array.isArray(o) && o.every((a) => typeof a == "string"));
  if (n.kind === rt && !rn(e, r)) return null;
  if (n.pubkey !== t) return n.pubkey;
  const s = le(r, "p")[0];
  return s !== void 0 && pt.test(s) ? s : t;
}
function no(e, t, n) {
  const r = Wr(e, t, n);
  return r ? n.pubkey === t && r !== t ? [r, t] : [r] : [];
}
const zr = {
  0: "change your profile",
  1: "post notes",
  3: "change who you follow",
  4: "send private messages (older kind)",
  5: "delete what you have posted",
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
}, Hr = {
  4: "read your private messages (older kind)",
  13: "read your private messages",
  1059: "read your private messages",
  1573: "read orders sent to you",
  7375: "read the money in your Cashu wallet",
  7376: "read what your Cashu wallet spent",
  1e4: "read who you have muted",
  3e4: "read your private lists"
}, Ee = (e) => {
  try {
    return new URL(e).host;
  } catch {
    return e;
  }
};
function ro(e, t) {
  const n = [], r = [], s = [], o = (a, c) => {
    a.includes(c) || a.push(c);
  };
  e.sign.includes(ut) && o(n, `prove who you are to ${[Ee(t), ...e.proofs.map(Ee)].join(", ")}`);
  for (const a of e.sign) {
    if (a === ut) continue;
    if (a === rt) {
      e.appData.includes("*") ? o(r, "save application data under any name, including other applications' data") : o(n, `save its own data (${e.appData.join(", ")})`);
      continue;
    }
    const c = zr[a];
    if (!c) {
      Yt(a) ? o(n, `save its own kind of data (kind ${a})`) : s.push(a);
      continue;
    }
    o(Kr.includes(a) ? r : n, c);
  }
  s.length > 0 && o(n, `sign kinds BitLogin has no words for: ${s.join(", ")}`);
  for (const a of e.read) {
    if (a === rt) {
      e.appData.includes("*") ? o(r, "read application data saved under any name") : o(n, "read its own saved data");
      continue;
    }
    const c = Hr[a];
    c ? o(Ur.includes(a) || a === 7375 ? r : n, c) : o(n, Yt(a) ? `read its own kind of data (kind ${a})` : `read what is encrypted in kind ${a}`);
  }
  return e.peers.length > 0 && o(n, `exchange encrypted messages with ${e.peers.length === 1 ? "one service" : `${e.peers.length} services`} it names (${e.peers.map((a) => `${a.slice(0, 8)}…`).join(", ")})`), { ordinary: n, sensitive: r };
}
export {
  Hs as $,
  dt as A,
  Gs as B,
  kr as C,
  Xe as D,
  kt as E,
  Et as F,
  Cs as G,
  Ks as H,
  lt as I,
  Zs as J,
  Rs as K,
  Yn as L,
  Us as M,
  Bs as N,
  Ys as O,
  pe as P,
  Or as Q,
  qs as R,
  H as S,
  Y as T,
  Ce as U,
  js as V,
  Qs as W,
  Ws as X,
  Tr as Y,
  zs as Z,
  Es as _,
  bt as a,
  Ft as a$,
  cr as a0,
  Fs as a1,
  Vt as a2,
  Js as a3,
  yt as a4,
  ar as a5,
  ro as a6,
  _s as a7,
  Kt as a8,
  vs as a9,
  Ut as aA,
  Ss as aB,
  ht as aC,
  ir as aD,
  is as aE,
  no as aF,
  eo as aG,
  Ur as aH,
  to as aI,
  Ps as aJ,
  Ms as aK,
  Ts as aL,
  Ds as aM,
  $s as aN,
  fr as aO,
  ks as aP,
  Is as aQ,
  As as aR,
  Ke as aS,
  ms as aT,
  jt as aU,
  Xs as aV,
  Ve as aW,
  xs as aX,
  Ls as aY,
  Os as aZ,
  Se as a_,
  me as aa,
  ds as ab,
  Fn as ac,
  Un as ad,
  fs as ae,
  tt as af,
  mt as ag,
  ge as ah,
  F as ai,
  W as aj,
  In as ak,
  us as al,
  ye as am,
  K as an,
  ct as ao,
  Vr as ap,
  qt as aq,
  Jr as ar,
  qr as as,
  es as at,
  ns as au,
  Qr as av,
  wn as aw,
  Yr as ax,
  rs as ay,
  ts as az,
  nt as b,
  Ns as b0,
  Ze as b1,
  et as c,
  ps as d,
  zn as e,
  Zn as f,
  bs as g,
  ws as h,
  bn as i,
  ee as j,
  ss as k,
  X as l,
  cs as m,
  hs as n,
  os as o,
  gs as p,
  Hn as q,
  Qn as r,
  Zr as s,
  as as t,
  re as u,
  Vs as v,
  ls as w,
  ys as x,
  m as y,
  nn as z
};
