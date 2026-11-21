import { C as Gt, D as Ge, E as Ve, h as Je, u as Et, a as Ye, A as be, M as qe, B as Ze, c as Qe, p as tn, y as en, v as ft, b as nn, N as rn, O as Ae } from "./bitlogin-shared-Cj9s0_W_.js";
import { d as kt } from "./bitlogin-shared-PwbHDYud.js";
const Tr = 17375, Mr = 7375, Pr = 7376, Vt = "sat", Jt = {
  mints: 5,
  proofsPerToken: 500,
  tokens: 500,
  /**
   * How many proofs this wallet writes into one token record. Kept small so that a record is well under the
   * 64 KB an ordinary NIP-44 message may hold, and under what relays take: another NIP-60 wallet can read it.
   */
  proofsWritten: 100
}, ie = /^[0-9a-f]+$/u, ve = /^[0-9a-f]{64}$/u;
function yt(e) {
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
function sn(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.id != "string" || t.id.length < 2 || t.id.length > 66 || !ie.test(t.id) || typeof t.amount != "number" || !Number.isSafeInteger(t.amount) || t.amount <= 0 || typeof t.secret != "string" || t.secret.length === 0 || t.secret.length > 2048 || typeof t.C != "string" || t.C.length !== 66 || !ie.test(t.C) ? null : { id: t.id, amount: t.amount, secret: t.secret, C: t.C };
}
function on(e, t = Jt.proofsPerToken) {
  if (!Array.isArray(e) || e.length > t) return null;
  const n = [], r = /* @__PURE__ */ new Set();
  for (const s of e) {
    const o = sn(s);
    if (!o || r.has(o.secret)) return null;
    r.add(o.secret), n.push(o);
  }
  return n;
}
const Dr = (e) => e.reduce((t, n) => t + n.amount, 0);
function Rr(e) {
  return JSON.stringify([["privkey", e.privkey], ...e.mints.map((t) => ["mint", t])]);
}
function $r(e) {
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
    !Array.isArray(s) || typeof s[0] != "string" || (s[0] === "privkey" && typeof s[1] == "string" && ve.test(s[1]) && (n ||= s[1]), s[0] === "mint" && yt(s[1]) && !r.includes(yt(s[1])) && r.length < Jt.mints && r.push(yt(s[1])));
  return n ? { privkey: n, mints: r } : null;
}
function Cr(e) {
  return JSON.stringify({ mint: e.mint, unit: Vt, proofs: e.proofs.map(({ id: t, amount: n, secret: r, C: s }) => ({ id: t, amount: n, secret: r, C: s })), ...e.del?.length ? { del: [...e.del] } : {} });
}
function jr(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = t, r = yt(n.mint), s = on(n.proofs);
  if (!r || !s || n.unit !== void 0 && n.unit !== Vt) return null;
  const o = Array.isArray(n.del) ? n.del.filter((a) => typeof a == "string" && ve.test(a)).slice(0, 200) : [];
  return { mint: r, proofs: s, del: o };
}
function Kr(e, t) {
  const n = new Set(e.flatMap((o) => o.del)), r = /* @__PURE__ */ new Set(), s = [];
  for (const o of [...e].sort((a, c) => c.created_at - a.created_at || a.event.localeCompare(c.event))) {
    if (n.has(o.event) || t.has(o.event)) continue;
    const a = o.proofs.filter((c) => !r.has(c.secret));
    for (const c of a) r.add(c.secret);
    a.length && s.length < Jt.tokens && s.push({ event: o.event, mint: o.mint, proofs: a });
  }
  return s;
}
function Ur(e) {
  return JSON.stringify([
    ["direction", e.direction],
    ["amount", String(e.amount)],
    ["unit", Vt],
    ...(e.created ?? []).map((t) => ["e", t, "", "created"]),
    ...(e.destroyed ?? []).map((t) => ["e", t, "", "destroyed"])
  ]);
}
const Q = (e) => {
  if (typeof e != "string") return "";
  const t = e.trim().toLowerCase().replace(/^lightning:/u, "");
  return t.length <= 2e3 && /^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(t) ? t : "";
};
class V extends Error {
  constructor(t, n) {
    super(n), this.code = t, this.name = "TipError";
  }
}
const ae = { min: 1, max: 1e6 }, X = (e) => typeof e == "number" && Number.isSafeInteger(e) && e >= ae.min && e <= ae.max ? e : 0, ce = { default: 1e3, steps: [1e3, 1e4, 1e5, 0] }, Fr = (e) => ce.steps.includes(e) ? e : ce.default, Br = (e, t) => t !== 0 && e > t;
function an(e) {
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
const Yt = /^(?:localhost|127\.0\.0\.1)(?::[0-9]{1,5})?$/u, cn = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/u;
function qt(e, t = {}) {
  if (typeof e != "string" || e.length > 200) return "";
  const n = e.trim().toLowerCase(), r = n.lastIndexOf("@");
  if (r < 1) return "";
  const s = n.slice(0, r), o = n.slice(r + 1);
  return /^[a-z0-9._+-]{1,64}$/u.test(s) && (cn.test(o) || t.local && Yt.test(o)) ? n : "";
}
function Wr(e, t = {}) {
  try {
    const n = typeof e == "string" ? JSON.parse(e) : null;
    return n && typeof n == "object" ? qt(n.lud16, t) : "";
  } catch {
    return "";
  }
}
const ln = 8e3;
async function Ot(e, t) {
  const n = new AbortController(), r = setTimeout(() => n.abort(), ln);
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
const Se = (e, t) => {
  try {
    const n = new URL(String(e));
    return typeof e != "string" || e.length > 2e3 || n.username || n.password ? null : n.protocol === "https:" || t && n.protocol === "http:" && Yt.test(n.host) ? n : null;
  } catch {
    return null;
  }
};
async function zr(e, t = {}) {
  const n = Se(e, t.local === !0);
  if (!n || n.origin !== e) return { tip: "", publishers: [], share: "" };
  const r = await Ot(t.fetch ?? ((o, a) => fetch(o, a)), `${n.origin}/.well-known/nswp.json`), s = r?.publishers && typeof r.publishers == "object" && !Array.isArray(r.publishers) ? Object.keys(r.publishers) : [];
  return { tip: qt(r?.tip, t), publishers: s.filter((o) => /^[0-9a-f]{64}$/u.test(o)).slice(0, 16), share: typeof r?.share == "string" && /^[0-9a-f]{64}$/u.test(r.share) ? r.share : "" };
}
async function Hr(e, t, n = {}) {
  const r = n.local === !0, s = qt(e, { local: r }), o = X(t);
  if (!s || !o) throw new V("no-address", "That is not a lightning address and an amount.");
  const a = n.fetch ?? ((G, U) => fetch(G, U)), [c, l] = [s.slice(0, s.lastIndexOf("@")), s.slice(s.lastIndexOf("@") + 1)], f = r && Yt.test(l) ? "http" : "https", i = await Ot(a, `${f}://${l}/.well-known/lnurlp/${encodeURIComponent(c)}`);
  if (!i) throw new V("unreachable", "That lightning address didn't answer. Nothing was spent.");
  const u = Se(i.callback, r);
  if (i.tag !== "payRequest" || !u) throw new V("unreachable", "That lightning address didn't answer as one. Nothing was spent.");
  const d = o * 1e3, [h, y] = [Number(i.minSendable), Number(i.maxSendable)];
  if (!(Number.isFinite(h) && Number.isFinite(y) && h <= d && d <= y))
    throw new V("refused-amount", "That lightning address doesn't take a payment of this size. Nothing was spent.");
  u.searchParams.set("amount", String(d));
  const b = typeof i.commentAllowed == "number" && Number.isSafeInteger(i.commentAllowed) ? Math.min(i.commentAllowed, 280) : 0, w = b >= 8 ? Lt(n.note).slice(0, b) : "";
  w && u.searchParams.set("comment", w);
  const g = await Ot(a, u.href), A = typeof g?.pr == "string" ? g.pr.trim().toLowerCase() : "";
  if (!A || A.length > 2e3 || !/^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(A)) throw new V("unreachable", "That lightning address gave no invoice. Nothing was spent.");
  if (an(A) !== o) throw new V("wrong-invoice", "That lightning address answered with an invoice for a different amount. Nothing was spent.");
  return { invoice: A, note: w };
}
function Lt(e) {
  return typeof e == "string" ? Array.from(e.normalize("NFC")).filter((t) => {
    const n = t.codePointAt(0);
    return n >= 32 && n !== 127 && !(n >= 8203 && n <= 8207) && !(n >= 8234 && n <= 8238) && !(n >= 8294 && n <= 8297);
  }).join("").trim().slice(0, 280) : "";
}
function Xr(e, t) {
  let n = "";
  try {
    n = new URL(t).host;
  } catch {
    n = "";
  }
  const r = Lt(e).slice(0, 60);
  return Lt(`${r ? `A tip from ${r}` : "A tip"}${n ? `, in ${n}` : ""}`);
}
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function un(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
function le(e) {
  if (typeof e != "boolean")
    throw new TypeError(`boolean expected, not ${e}`);
}
function It(e) {
  if (typeof e != "number")
    throw new TypeError("number expected, got " + typeof e);
  if (!Number.isSafeInteger(e) || e < 0)
    throw new RangeError("positive integer expected, got " + e);
}
function j(e, t, n = "") {
  const r = un(e), s = e?.length, o = t !== void 0;
  if (!r || o && s !== t) {
    const a = n && `"${n}" `, c = o ? ` of length ${t}` : "", l = r ? `length=${s}` : `type=${typeof e}`, f = a + "expected Uint8Array" + c + ", got " + l;
    throw r ? new RangeError(f) : new TypeError(f);
  }
  return e;
}
function B(e) {
  return new Uint32Array(e.buffer, e.byteOffset, Math.floor(e.byteLength / 4));
}
function ue(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
const Z = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68, fn = (e) => e << 24 & 4278190080 | e << 8 & 16711680 | e >>> 8 & 65280 | e >>> 24 & 255, dn = (e) => {
  for (let t = 0; t < e.length; t++)
    e[t] = fn(e[t]);
  return e;
}, W = Z ? (e) => e : dn;
function pn(e, t) {
  return !e.byteLength || !t.byteLength ? !1 : e.buffer === t.buffer && // best we can do, may fail with an obscure Proxy
  e.byteOffset < t.byteOffset + t.byteLength && // a starts before b end
  t.byteOffset < e.byteOffset + e.byteLength;
}
function Gr(e, t) {
  if (pn(e, t) && e.byteOffset < t.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function hn(e, t) {
  if (t == null || typeof t != "object")
    throw new Error("options must be defined");
  return Object.assign(e, t);
}
const Vr = /* @__NO_SIDE_EFFECTS__ */ (e, t) => {
  function n(r, ...s) {
    if (j(r, void 0, "key"), e.nonceLength !== void 0) {
      const i = s[0];
      j(i, e.varSizeNonce ? void 0 : e.nonceLength, "nonce");
    }
    const o = e.tagLength;
    o && s[1] !== void 0 && j(s[1], void 0, "AAD");
    const a = t(r, ...s), c = (i, u) => {
      if (u !== void 0) {
        if (i !== 2)
          throw new Error("cipher output not supported");
        j(u, void 0, "output");
      }
    };
    let l = !1;
    return {
      encrypt(i, u) {
        if (l)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return l = !0, j(i), c(a.encrypt.length, u), a.encrypt(i, u);
      },
      decrypt(i, u) {
        if (j(i), o && i.length < o)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + o);
        return c(a.decrypt.length, u), a.decrypt(i, u);
      }
    };
  }
  return Object.assign(n, e), n;
};
function yn(e, t, n = !0) {
  if (t === void 0)
    return new Uint8Array(e);
  if (j(t, void 0, "output"), t.length !== e)
    throw new Error('"output" expected Uint8Array of length ' + e + ", got: " + t.length);
  if (n && !gt(t))
    throw new Error("invalid output, must be aligned");
  return t;
}
function gt(e) {
  return e.byteOffset % 4 === 0;
}
function fe(e) {
  return Uint8Array.from(j(e));
}
const Ee = (e) => Uint8Array.from(e.split(""), (t) => t.charCodeAt(0)), gn = W(B(Ee("expand 16-byte k"))), wn = W(B(Ee("expand 32-byte k")));
function p(e, t) {
  return e << t | e >>> 32 - t;
}
const rt = 64, mn = 16, xt = 2 ** 32 - 1, de = /* @__PURE__ */ Uint32Array.of();
function bn(e, t, n, r, s, o, a, c) {
  const l = s.length, f = new Uint8Array(rt), i = B(f), u = Z && gt(s) && gt(o), d = u ? B(s) : de, h = u ? B(o) : de;
  if (!Z) {
    for (let y = 0; y < l; a++) {
      if (e(t, n, r, i, a, c), W(i), a >= xt)
        throw new Error("arx: counter overflow");
      const b = Math.min(rt, l - y);
      for (let w = 0, g; w < b; w++)
        g = y + w, o[g] = s[g] ^ f[w];
      y += b;
    }
    return;
  }
  for (let y = 0; y < l; a++) {
    if (e(t, n, r, i, a, c), a >= xt)
      throw new Error("arx: counter overflow");
    const b = Math.min(rt, l - y);
    if (u && b === rt) {
      const w = y / 4;
      if (y % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let g = 0, A; g < mn; g++)
        A = w + g, h[A] = d[A] ^ i[g];
      y += rt;
      continue;
    }
    for (let w = 0, g; w < b; w++)
      g = y + w, o[g] = s[g] ^ f[w];
    y += b;
  }
}
function An(e, t) {
  const { allowShortKeys: n, extendNonceFn: r, counterLength: s, counterRight: o, rounds: a } = hn({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, t);
  if (typeof e != "function")
    throw new Error("core must be a function");
  return It(s), It(a), le(o), le(n), (c, l, f, i, u = 0) => {
    j(c, void 0, "key"), j(l, void 0, "nonce"), j(f, void 0, "data");
    const d = f.length;
    if (i = yn(d, i, !1), It(u), u < 0 || u >= xt)
      throw new Error("arx: counter overflow");
    const h = [];
    let y = c.length, b, w;
    if (y === 32)
      h.push(b = fe(c)), w = wn;
    else if (y === 16 && n)
      b = new Uint8Array(32), b.set(c), b.set(c, 16), w = gn, h.push(b);
    else
      throw j(c, 32, "arx key"), new Error("invalid key size");
    (!Z || !gt(l)) && h.push(l = fe(l));
    let g = B(b);
    if (r) {
      if (l.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const U = l.subarray(0, 16);
      if (Z)
        r(w, g, B(U), g);
      else {
        const nt = W(Uint32Array.from(w));
        r(nt, g, B(U), g), ue(nt), W(g);
      }
      l = l.subarray(16);
    } else Z || W(g);
    const A = 16 - s;
    if (A !== l.length)
      throw new Error(`arx: nonce must be ${A} or 16 bytes`);
    if (A !== 12) {
      const U = new Uint8Array(12);
      U.set(l, o ? 0 : 12 - l.length), l = U, h.push(l);
    }
    const G = W(B(l));
    try {
      return bn(e, w, g, G, f, i, u, a), i;
    } finally {
      ue(...h);
    }
  };
}
function vn(e, t, n, r, s, o = 20) {
  let a = e[0], c = e[1], l = e[2], f = e[3], i = t[0], u = t[1], d = t[2], h = t[3], y = t[4], b = t[5], w = t[6], g = t[7], A = s, G = n[0], U = n[1], nt = n[2], S = a, E = c, N = l, I = f, _ = i, k = u, O = d, L = h, x = y, T = b, M = w, P = g, D = A, R = G, $ = U, C = nt;
  for (let oe = 0; oe < o; oe += 2)
    S = S + _ | 0, D = p(D ^ S, 16), x = x + D | 0, _ = p(_ ^ x, 12), S = S + _ | 0, D = p(D ^ S, 8), x = x + D | 0, _ = p(_ ^ x, 7), E = E + k | 0, R = p(R ^ E, 16), T = T + R | 0, k = p(k ^ T, 12), E = E + k | 0, R = p(R ^ E, 8), T = T + R | 0, k = p(k ^ T, 7), N = N + O | 0, $ = p($ ^ N, 16), M = M + $ | 0, O = p(O ^ M, 12), N = N + O | 0, $ = p($ ^ N, 8), M = M + $ | 0, O = p(O ^ M, 7), I = I + L | 0, C = p(C ^ I, 16), P = P + C | 0, L = p(L ^ P, 12), I = I + L | 0, C = p(C ^ I, 8), P = P + C | 0, L = p(L ^ P, 7), S = S + k | 0, C = p(C ^ S, 16), M = M + C | 0, k = p(k ^ M, 12), S = S + k | 0, C = p(C ^ S, 8), M = M + C | 0, k = p(k ^ M, 7), E = E + O | 0, D = p(D ^ E, 16), P = P + D | 0, O = p(O ^ P, 12), E = E + O | 0, D = p(D ^ E, 8), P = P + D | 0, O = p(O ^ P, 7), N = N + L | 0, R = p(R ^ N, 16), x = x + R | 0, L = p(L ^ x, 12), N = N + L | 0, R = p(R ^ N, 8), x = x + R | 0, L = p(L ^ x, 7), I = I + _ | 0, $ = p($ ^ I, 16), T = T + $ | 0, _ = p(_ ^ T, 12), I = I + _ | 0, $ = p($ ^ I, 8), T = T + $ | 0, _ = p(_ ^ T, 7);
  let v = 0;
  r[v++] = a + S | 0, r[v++] = c + E | 0, r[v++] = l + N | 0, r[v++] = f + I | 0, r[v++] = i + _ | 0, r[v++] = u + k | 0, r[v++] = d + O | 0, r[v++] = h + L | 0, r[v++] = y + x | 0, r[v++] = b + T | 0, r[v++] = w + M | 0, r[v++] = g + P | 0, r[v++] = A + D | 0, r[v++] = G + R | 0, r[v++] = U + $ | 0, r[v++] = nt + C | 0;
}
const Ne = /* @__PURE__ */ An(vn, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
}), Ie = 2, Tt = 1, _e = 65536, Sn = 4294967295, En = 132, Nn = 99, Mt = 1024 * 1024;
function Jr(e, t) {
  const n = Gt(new Uint8Array([2]), Ge(t)), s = Ve.getSharedSecret(e, n, !0).slice(1, 33);
  return Je(Et("nip44-v2"), s);
}
function ke(e, t) {
  if (e.length !== 32)
    throw new Error("NIP-44 conversation key must be exactly 32 bytes.");
  if (t.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const n = Qe(e, t, 76);
  return {
    chachaKey: n.slice(0, 32),
    chachaNonce: n.slice(32, 44),
    hmacKey: n.slice(44, 76)
  };
}
function Zt(e) {
  if (e <= 32)
    return 32;
  const t = 2 ** Math.floor(Math.log2(e - 1) + 1), n = t <= 256 ? 32 : t / 8;
  return n * (Math.floor((e - 1) / n) + 1);
}
const Oe = 39 + Zt(Mt) + 32, In = Math.ceil(Oe / 3) * 4;
function _n(e) {
  if (e < _e) {
    const n = new Uint8Array(2);
    return new DataView(n.buffer).setUint16(0, e, !1), n;
  }
  const t = new Uint8Array(6);
  return new DataView(t.buffer).setUint32(2, e, !1), t;
}
function kn(e) {
  const t = e.length;
  if (t < Tt || t > Mt)
    throw new Error(`NIP-44 plaintext length must be between ${Tt} and ${Mt} bytes on this platform.`);
  const n = _n(t), r = Zt(t), s = new Uint8Array(n.length + r);
  return s.set(n, 0), s.set(e, n.length), s;
}
function On(e) {
  const t = new DataView(e.buffer, e.byteOffset, e.byteLength), n = t.getUint16(0, !1);
  let r, s;
  if (n === 0) {
    if (r = t.getUint32(2, !1), s = 6, r < _e)
      throw new Error("NIP-44 payload has inconsistent padding.");
  } else
    r = n, s = 2;
  if (r < Tt || r > Sn || e.length !== s + Zt(r))
    throw new Error("NIP-44 payload has inconsistent padding.");
  return e.slice(s, s + r);
}
function Le(e, t, n) {
  return tn(en, e, Gt(t, n));
}
function Ln(e, t) {
  return xn(e, t, Ye(32));
}
function xn(e, t, n) {
  if (n.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const { chachaKey: r, chachaNonce: s, hmacKey: o } = ke(e, n), a = kn(Et(t)), c = Ne(r, s, a), l = Le(o, n, c);
  return be.encode(Gt(new Uint8Array([Ie]), n, c, l));
}
function Tn(e, t) {
  if (t.startsWith("#"))
    throw new Error("Unsupported NIP-44 non-base64 encoding.");
  if (t.length < En || t.length > In)
    throw new Error("NIP-44 payload size is outside this platform's supported range.");
  const n = be.decode(t);
  if (n.length < Nn || n.length > Oe)
    throw new Error("NIP-44 decoded payload size is outside this platform's supported range.");
  if (n[0] !== Ie)
    throw new Error(`Unsupported NIP-44 version: ${n[0]}`);
  const r = n.slice(1, 33);
  if (r.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const s = n.slice(n.length - 32), o = n.slice(33, n.length - 32), { chachaKey: a, chachaNonce: c, hmacKey: l } = ke(e, r), f = Le(l, r, o);
  if (!qe(s, f))
    throw new Error("NIP-44 MAC verification failed: payload is corrupted, tampered, or uses the wrong key.");
  const i = Ne(a, c, o);
  return Ze(On(i));
}
const wt = /^[0-9a-f]{64}$/u, Mn = "nswp:share", Pt = "client", H = { most: 4, whole: 1e4, least: 10, label: 32 };
function Pn(e) {
  if (typeof e != "string") return "";
  const t = e.trim();
  if (!t || t.length > H.label) return "";
  for (const n of t) {
    const r = n.codePointAt(0);
    if (r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279) return "";
  }
  return t;
}
function Dn(e, t) {
  const n = (o) => ({ ok: !1, why: o });
  if (!Array.isArray(e)) return n("not-a-share");
  const r = e.filter((o) => Array.isArray(o) && o[0] === Mn);
  if (r.length === 0) return { ok: !0, shares: [] };
  if (typeof t != "string" || !wt.test(t)) return n("no-seller");
  if (r.length > H.most) return n("too-many");
  const s = [];
  for (const o of r) {
    const [, a, c, l] = o;
    if (o.length < 3 || o.length > 4 || typeof a != "string" || a !== Pt && !wt.test(a) || typeof c != "string" || !/^[1-9][0-9]{0,4}$/u.test(c) || Number(c) > H.whole) return n("not-a-share");
    const f = l === void 0 ? a === Pt ? "client" : a === t ? "seller" : "share" : Pn(l);
    if (!f) return n("not-a-share");
    if (s.some((i) => i.to === a)) return n("twice");
    s.push({ to: a, parts: Number(c), label: f });
  }
  return s.some((o) => o.to === t) ? s.reduce((o, a) => o + a.parts, 0) !== H.whole ? n("not-whole") : { ok: !0, shares: s } : n("no-seller");
}
function Yr(e, t, n, r = {}) {
  const s = (i) => ({ ok: !1, why: i }), o = r.charge ?? 0;
  if (typeof e != "number" || !Number.isSafeInteger(e) || e < 1 || !Number.isSafeInteger(e * H.whole) || !Number.isSafeInteger(o) || o < 0) return s("not-a-price");
  if (typeof n != "string" || !wt.test(n) || t.length > 0 && !t.some((i) => i.to === n)) return s("no-seller");
  const a = typeof r.client == "string" && wt.test(r.client) && r.client !== n ? r.client : null, c = /* @__PURE__ */ new Map();
  for (const i of t) {
    if (i.to === n) continue;
    const u = i.to === Pt ? a : i.to;
    if (!u) continue;
    const d = Math.floor(e * i.parts / H.whole), h = c.get(u);
    c.set(u, h ? { sats: h.sats + d, label: h.label } : { sats: d, label: i.label });
  }
  const l = [...c.values()].reduce((i, u) => i + u.sats, 0), f = [...c].map(([i, u]) => ({ to: i, sats: u.sats, label: u.label, seller: !1 }));
  return f.sort((i, u) => i.sats - u.sats || (i.to < u.to ? -1 : 1)), f.push({ to: n, sats: e - l - o, label: t.find((i) => i.to === n)?.label ?? "seller", seller: !0 }), f.some((i) => i.sats < H.least) ? s("too-small") : { ok: !0, parts: f };
}
const Dt = /^[0-9a-f]{64}$/u, Rn = 30078, $n = 30078, Cn = "bitunlock:entitlement:v1:", xe = "seller-unlock-service-v1", Te = [{ endpoint: "https://api.bitunlock.network", pubkey: "66be61cf5b8d286391f7b1a72ffa7c799ec2dc49eff0830c40df1cc964e6787d" }], jn = /^(?:localhost|127(?:\.[0-9]{1,3}){3}|10(?:\.[0-9]{1,3}){3}|192\.168(?:\.[0-9]{1,3}){2}|172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})$/u;
function qr(e) {
  if (typeof e != "string" || e.length > 300) return null;
  const [t, n] = e.split("|");
  try {
    const r = new URL(t ?? "");
    return r.protocol !== "http:" && r.protocol !== "https:" || !jn.test(r.hostname) || r.origin !== t ? null : n && Dt.test(n) ? { endpoint: r.origin, pubkey: n } : null;
  } catch {
    return null;
  }
}
function tt(e) {
  return typeof e == "string" && /^30078:[0-9a-f]{64}:[^:\r\n][^\r\n]{0,255}$/u.test(e) ? e : "";
}
const Qt = (e) => e.slice(6, 70), Kn = 500, Zr = (e) => e.nswp && e.priceSats < Kn, K = (e, t) => {
  const n = e.tags.find((r) => r[0] === t);
  return typeof n?.[1] == "string" ? n[1] : "";
}, pe = (e, t) => typeof e == "string" ? Array.from(e.normalize("NFC")).filter((n) => {
  const r = n.codePointAt(0);
  return r >= 32 && r !== 127 && !(r >= 8203 && r <= 8207) && !(r >= 8234 && r <= 8238) && !(r >= 8294 && r <= 8297);
}).join("").trim().slice(0, t) : "";
function Qr(e, t, n = Te) {
  const r = tt(t), s = e;
  if (!r || !s || typeof s != "object" || !Array.isArray(s.tags) || !ft(s) || s.kind !== Rn || s.pubkey !== Qt(r) || `30078:${s.pubkey}:${K(s, "d")}` !== r || K(s, "status") !== "active" || K(s, "br:delivery") !== xe) return null;
  const o = s.tags.find((i) => i[0] === "price"), a = o && o[2] === "SAT" && /^[1-9][0-9]{0,11}$/u.test(o[1] ?? "") ? Number(o[1]) : 0, c = n.find((i) => i.endpoint === K(s, "br:unlock-service") && i.pubkey === K(s, "br:unlock-service-pubkey"));
  if (!a || !c) return null;
  let l = {};
  try {
    const i = JSON.parse(s.content || "{}");
    i && typeof i == "object" && (l = i);
  } catch {
    l = {};
  }
  const f = K(s, "nswp:term");
  return {
    coordinate: r,
    seller: s.pubkey,
    title: pe(K(s, "title") || l.title || l.name, 80) || pe(K(s, "d"), 80),
    priceSats: a,
    service: { ...c },
    for: /^3730[0-9]:[0-9a-f]{64}:[^\s]{1,200}$/u.test(K(s, "nswp:for")) ? K(s, "nswp:for") : "",
    termSeconds: /^[1-9][0-9]{0,9}$/u.test(f) ? Number(f) : 0,
    nswp: s.tags.some((i) => typeof i[0] == "string" && i[0].startsWith("nswp:")),
    shared: s.tags.some((i) => i[0] === "nswp:share"),
    shares: ((i) => i.ok ? i.shares : null)(Dn(s.tags, s.pubkey))
  };
}
function Un(e, t = Te) {
  const n = e;
  if (!n || typeof n != "object" || !Array.isArray(n.tags) || typeof n.content != "string" || n.content.length > 8e3 || n.kind !== $n || !t.some((d) => d.pubkey === n.pubkey) || !ft(n)) return null;
  let r;
  try {
    r = JSON.parse(n.content);
  } catch {
    return null;
  }
  if (!r || typeof r != "object" || r.schemaVersion !== 1 || r.protocolVersion !== xe || r.status !== "active") return null;
  const s = (d) => typeof d == "string" && d.length > 0 && d.length <= 200 ? d : "", o = tt(r.productCoordinate), [a, c, l, f] = [s(r.buyerPubkey), s(r.sellerPubkey), s(r.orderId), s(r.fulfillmentId)], i = typeof r.issuedAt == "number" && Number.isSafeInteger(r.issuedAt) && r.issuedAt > 0 ? r.issuedAt : 0;
  if (!o || !Dt.test(a) || !Dt.test(c) || c !== Qt(o) || !l || !f || !i || K(n, "d") !== Cn + f) return null;
  let u = 0;
  if (r.accessPolicy !== "perpetual-v1") {
    const d = r.accessPolicy;
    if (!d || typeof d != "object" || d.kind !== "term-v1" || typeof d.expiresAt != "number" || !Number.isSafeInteger(d.expiresAt) || d.expiresAt <= i) return null;
    u = d.expiresAt;
  }
  return { event: { id: n.id, pubkey: n.pubkey, created_at: n.created_at, kind: n.kind, tags: n.tags.map((d) => [...d]), content: n.content, sig: n.sig }, listing: o, seller: c, buyer: a, order: l, fulfillment: f, issuedAt: i, expiresAt: u, service: n.pubkey };
}
function Fn(e, t) {
  return !!e && e.buyer === t.buyer && e.listing === t.listing && (e.expiresAt === 0 || t.now < e.expiresAt);
}
function ts(e, t) {
  const n = e.filter((r) => Fn(r, t));
  return n.sort((r, s) => r.expiresAt === 0 ? -1 : s.expiresAt === 0 ? 1 : s.expiresAt - r.expiresAt), n[0] ?? null;
}
function es(e, t, n) {
  return t.publishers.includes(Qt(e)) || !!n && n === t.site;
}
const Me = 37304, Rt = {
  /** The most a save may hold, in bytes of UTF-8. It has to fit in one note that any relay will take. */
  dataBytes: 32768,
  /** No more saves than this for one world in `perMs`, and in an hour. Counted apart from notes and passes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** A save handed over to be opened is not read past this many characters of content. */
  contentChars: 7e4
}, Bn = /^[a-z0-9][a-z0-9-]{0,31}$/u, Wn = /^[0-9a-f]{64}$/u, zn = "Something a world keeps for its visitor. Only they can read it.";
function z(e) {
  return typeof e == "string" && Bn.test(e) ? e : "";
}
function te(e) {
  return typeof e == "string" && e.length <= Rt.dataBytes && Et(e).length <= Rt.dataBytes;
}
function Pe(e, t, n) {
  const r = m(t), s = z(n);
  return !r || !s ? "" : nn(rn(e, Et(`nswp-save
${r}
${s}`)));
}
function ns(e) {
  const t = m(e.world), n = z(e.slot), r = Pe(e.conversationKey, t, n);
  if (!r || !te(e.data)) return null;
  const s = JSON.stringify({ v: 1, world: t, slot: n, data: e.data });
  return {
    kind: Me,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", r],
      ["alt", zn]
    ],
    content: Ln(e.conversationKey, s)
  };
}
function rs(e, t) {
  const n = m(t.world);
  if (!n || !e || typeof e != "object" || !Wn.test(t.pubkey)) return null;
  const r = e;
  if (r.kind !== Me || r.pubkey !== t.pubkey || typeof r.content != "string" || r.content.length > Rt.contentChars || !Array.isArray(r.tags)) return null;
  let s;
  try {
    s = JSON.parse(Tn(t.conversationKey, r.content));
  } catch {
    return null;
  }
  if (!s || typeof s != "object" || s.v !== 1 || s.world !== n) return null;
  const o = z(s.slot);
  if (!o || !te(s.data)) return null;
  const a = r.tags.find((c) => Array.isArray(c) && c[0] === "d");
  return !a || a[1] !== Pe(t.conversationKey, n, o) ? null : { slot: o, data: s.data, at: typeof r.created_at == "number" && Number.isInteger(r.created_at) ? r.created_at : 0 };
}
const $t = 3, ss = { burst: 6, perMs: 6e4, hourly: 60 }, pt = {
  /** A list handed over to be changed is not read past this many tags, or this much content. */
  tags: 2e4,
  contentChars: 1e5,
  tagItems: 16,
  tagChars: 1e3
}, Hn = ["follows", "messages"];
function ot(e) {
  return Array.isArray(e) ? Hn.filter((t) => e.includes(t)) : [];
}
const Xn = ["nswp:world", "bitlogin:site"], Gn = /^[0-9a-f]{64}$/u;
function he(e, t) {
  if (e && (e.kind !== $t || !Array.isArray(e.tags)) || !e && !t.fromNothing) return null;
  const n = typeof t.add == "string" ? t.add.toLowerCase() : "", r = typeof t.remove == "string" ? t.remove.toLowerCase() : "";
  if (n === "" == (r === "")) return null;
  const s = n || r;
  if (!Gn.test(s) || n && (e?.pubkey ?? t.pubkey) === n) return null;
  const o = e ? e.tags.filter((i) => Array.isArray(i) && i.every((u) => typeof u == "string") && !Xn.includes(i[0] ?? "")) : [], a = (i) => i[0] === "p" && typeof i[1] == "string" && i[1].toLowerCase() === s, c = o.some(a);
  if (n ? c : !c) return null;
  const l = n ? [...o.map((i) => [...i]), ["p", n]] : o.filter((i) => !a(i)).map((i) => [...i]), f = Math.max(Math.floor(t.nowSeconds), e ? e.created_at + 1 : 0);
  return { kind: $t, created_at: f, tags: l, content: typeof e?.content == "string" ? e.content : "" };
}
function Vn(e, t) {
  if (!e || typeof e != "object") return null;
  const n = e;
  if (n.kind !== $t || n.pubkey !== t || !Array.isArray(n.tags) || n.tags.length > pt.tags || typeof n.content != "string" || n.content.length > pt.contentChars) return null;
  for (const r of n.tags)
    if (!Array.isArray(r) || r.length > pt.tagItems || !r.every((s) => typeof s == "string" && s.length <= pt.tagChars)) return null;
  return ft(e) ? e : null;
}
function os(e) {
  const t = { add: e.add, remove: e.remove, nowSeconds: e.nowSeconds, pubkey: e.pubkey };
  if (e.list === null || e.list === void 0) return e.seen ? null : he(null, { ...t, fromNothing: !0 });
  const n = Vn(e.list, e.pubkey);
  return !n || e.seen && n.created_at < e.seen ? null : he(n, t);
}
function is(e, t) {
  return e === null ? t.answered > 0 && t.newestAt === 0 : e.created_at >= t.newestAt;
}
const Ct = 14, De = 13, Jn = 1059, Yn = 10050, mt = {
  /** The most characters in one message. */
  chars: 2e3,
  /** No more than this many relays are put in a list of where messages reach someone. */
  relays: 4,
  /** A wrap handed over to be opened is not read past this many characters of content. */
  wrapChars: 6e4
}, as = { burst: 10, perMs: 6e4, hourly: 200 }, cs = { burst: 600, perMs: 6e4, hourly: 12e3 }, ls = { burst: 3, perMs: 6e4, hourly: 12 }, bt = /^[0-9a-f]{64}$/u, qn = [
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
function At(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, mt.chars * 8).normalize("NFC")) {
    const r = n.codePointAt(0);
    t += qn.some(([s, o]) => r >= s && r <= o) ? " " : n;
  }
  return t = t.replace(/[^\S\n]+/gu, " ").replace(/ ?\n ?/gu, `
`).replace(/\n{3,}/gu, `

`).trim(), [...t].slice(0, mt.chars).join("").trim();
}
function Zn(e) {
  const t = At(e.text);
  if (!bt.test(e.from) || typeof e.to != "string" || !bt.test(e.to) || e.from === e.to || !t) return null;
  const n = { kind: Ct, pubkey: e.from, created_at: Math.floor(e.nowSeconds), tags: [["p", e.to]], content: t };
  return { ...n, id: Ae(n) };
}
function us(e, t) {
  const n = e.getPublicKey(), r = Zn({ from: n, to: t.to, text: t.text, nowSeconds: t.nowSeconds });
  if (!r) return null;
  const s = JSON.stringify(r), o = (a) => e.signEvent({ kind: De, created_at: Math.floor(t.nowSeconds), tags: [], content: e.nip44Encrypt(a, s) });
  return { message: r, seals: [o(r.tags[0][1]), o(n)] };
}
function Qn(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  return !ft(t) || t.kind !== De || t.tags.length !== 0 ? null : t;
}
function tr(e, t, n) {
  let r;
  try {
    r = JSON.parse(e);
  } catch {
    return null;
  }
  if (!r || typeof r != "object" || r.kind !== Ct || r.pubkey !== t || typeof r.pubkey != "string" || !bt.test(r.pubkey) || typeof r.content != "string" || typeof r.created_at != "number" || !Number.isInteger(r.created_at) || !Array.isArray(r.tags) || !r.tags.every((c) => Array.isArray(c) && c.every((l) => typeof l == "string"))) return null;
  const s = [...new Set(r.tags.filter((c) => c[0] === "p" && typeof c[1] == "string" && bt.test(c[1])).map((c) => c[1]))], o = At(r.content);
  return s.length === 0 || !o || r.pubkey !== n && !s.includes(n) ? null : { id: Ae({ kind: Ct, pubkey: r.pubkey, created_at: r.created_at, tags: r.tags, content: r.content }), from: r.pubkey, to: s, text: o, at: r.created_at };
}
function fs(e, t) {
  const n = e.getPublicKey();
  if (!t || typeof t != "object") return null;
  const r = t;
  if (r.kind !== Jn || typeof r.content != "string" || r.content.length > mt.wrapChars || !Array.isArray(r.tags) || r.tags.length > 20 || !ft(t) || !t.tags.some((s) => s[0] === "p" && s[1] === n)) return null;
  try {
    const s = Qn(e.nip44Decrypt(t.pubkey, t.content));
    return s ? tr(e.nip44Decrypt(s.pubkey, s.content), s.pubkey, n) : null;
  } catch {
    return null;
  }
}
function er(e) {
  if (typeof e != "string" || e.length > 200) return "";
  try {
    const t = new URL(e.trim()), n = t.hostname;
    return t.protocol !== "wss:" || t.username || t.password || !n.includes(".") || n.startsWith("[") || /^[0-9.]+$/u.test(n) || /\.(local|localhost|internal|lan|home)$/iu.test(n) ? "" : (t.hash = "", t.href.replace(/\/$/u, ""));
  } catch {
    return "";
  }
}
function ds(e, t) {
  if (!Array.isArray(e) || e.length > 8) return null;
  const n = [...new Set(e.map(er).filter(Boolean))].slice(0, mt.relays);
  return n.length === 0 ? null : { kind: Yn, created_at: Math.floor(t), tags: n.map((r) => ["relay", r]), content: "" };
}
const nr = 37306, ye = 37300, jt = {
  /** No more scores than this for one world in `perMs`, and in an hour. Counted apart from notes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** The most a score may be. */
  most: 9007199254740991,
  /** The longest a board's title may be, in characters. */
  title: 60
}, rr = /^[a-z0-9][a-z0-9-]{0,31}$/u, sr = /^(\d+):([0-9a-f]{64}):(.*)$/su;
function q(e) {
  if (typeof e != "string" || e.length > 200) return "";
  const t = sr.exec(e);
  return t && Number(t[1]) === ye && t[3] !== "" ? `${ye}:${t[2]}:${t[3]}` : "";
}
function Kt(e) {
  return typeof e == "string" && rr.test(e) ? e : "";
}
function Ut(e) {
  const t = typeof e == "string" && /^\d{1,16}$/u.test(e) ? Number(e) : e;
  return typeof t == "number" && Number.isSafeInteger(t) && t >= 0 && t <= jt.most ? t : null;
}
function Ft(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, jt.title * 8).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    t += s ? " " : n;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, jt.title).join("").trim();
}
function or(e, t) {
  if (e !== "time") return String(t).replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
  const n = Math.round(t / 100), r = Math.floor(n / 600), s = n % 600 / 10;
  return r ? `${r} min ${s.toFixed(1)} s` : `${s.toFixed(1)} s`;
}
function ps(e) {
  const t = m(e.origin), n = q(e.world), r = Kt(e.board), s = Ut(e.score);
  if (!t || !n || !r || s === null) return null;
  const o = Ft(e.title), a = e.format === "time" ? "time" : "number";
  return {
    kind: nr,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", `${n}/${r}`],
      ["a", n],
      ["board", r, ...o ? [o] : []],
      ["score", String(s), ...a === "time" ? ["time"] : []],
      ["alt", `A score in a world: ${o ? `${o}: ` : ""}${or(a, s)}`],
      [vt, t]
    ],
    content: ""
  };
}
const ir = 37307, ge = {
  /** No more than this many for one world in `perMs`, and in an hour. Counted apart from notes and scores. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** The longest a title may be, in characters. */
  title: 60
}, ar = /^[a-z0-9][a-z0-9-]{0,31}$/u;
function Bt(e) {
  return typeof e == "string" && ar.test(e) ? e : "";
}
function Wt(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, ge.title * 8).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    t += s ? " " : n;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, ge.title).join("").trim();
}
function hs(e) {
  const t = m(e.origin), n = q(e.world), r = Bt(e.id), s = Wt(e.title);
  return !t || !n || !r || !s ? null : {
    kind: ir,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", `${n}/${r}`],
      ["a", n],
      ["achievement", r],
      ["title", s],
      ["alt", `An achievement in a world: ${s}`],
      [vt, t]
    ],
    content: ""
  };
}
const Re = "nswp-signer", $e = "nswp-handoff", Nt = 1, it = {
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
}, cr = [1, 7], lr = [4, 13, 14, 15, 1059, 1060, 13194, 22242, 23194, 23195, 24133, 27235, 27300, 27301, 30078], ur = [0, 5, 10002], ys = { burst: 2, perMs: 6e4, hourly: 10 }, gs = 5 * 6e4;
function Ce(e) {
  return typeof e != "number" || !Number.isInteger(e) || e < 0 || e > 65535 || lr.includes(e) ? "never" : cr.includes(e) ? "ordinary" : "careful";
}
const vt = "nswp:world";
function m(e) {
  if (typeof e != "string" || e.length > 300) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin !== "null" ? t.origin : "";
  } catch {
    return "";
  }
}
function zt(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, 400).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    t += s ? " " : n;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, 48).join("").trim();
}
function ws(e, t, n) {
  return je(e, t, n, (r) => Ce(r) === "ordinary");
}
function fr(e, t, n) {
  return je(e, t, n, (r) => Ce(r) === "careful" && ur.includes(r));
}
function je(e, t, n, r) {
  const s = m(t);
  if (!s || !e || typeof e != "object") return null;
  const o = e;
  if (!r(o.kind) || typeof o.content != "string" || [...o.content].length > it.contentChars || !Array.isArray(o.tags) || o.tags.length > it.tags) return null;
  const a = [];
  for (const c of o.tags) {
    if (!Array.isArray(c) || c.length === 0 || c.length > it.tagItems || !c.every((l) => typeof l == "string" && l.length <= it.tagChars)) return null;
    c[0] !== vt && a.push([...c]);
  }
  return a.push([vt, s]), { kind: o.kind, created_at: Math.floor(n), tags: a, content: o.content };
}
function ms(e = it, t = []) {
  let n = t.filter((r) => typeof r == "number" && Number.isFinite(r));
  return {
    times: () => [...n],
    take(r) {
      return n = n.filter((s) => r - s < 36e5), n.length >= e.hourly || n.filter((s) => r - s < e.perMs).length >= e.burst ? !1 : (n.push(r), !0);
    }
  };
}
const Ke = /^[0-9a-z-]{1,40}$/iu, F = /^[0-9a-f]{64}$/u, bs = (e) => ({ nswp: Re, v: Nt, ...e });
function As(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.nswp !== Re || t.v !== Nt || typeof t.id != "string" || !Ke.test(t.id)) return null;
  if (t.t === "state") return { t: "state", id: t.id };
  if (t.t === "lock") return { t: "lock", id: t.id };
  if (t.t === "sign" && t.event && typeof t.event == "object") return { t: "sign", id: t.id, event: t.event };
  if (t.t === "propose" && t.event && typeof t.event == "object") return { t: "propose", id: t.id, event: t.event };
  if (t.t === "wallet") return { t: "wallet", id: t.id };
  if (t.t === "pay" && Q(t.invoice)) return { t: "pay", id: t.id, invoice: Q(t.invoice) };
  if (t.t === "tip" && X(t.sats) && (t.to === void 0 || typeof t.to == "string" && F.test(t.to))) return { t: "tip", id: t.id, sats: X(t.sats), ...typeof t.to == "string" ? { to: t.to } : {} };
  if ((t.t === "buy" || t.t === "have") && tt(t.listing)) return { t: t.t, id: t.id, listing: tt(t.listing) };
  if (t.t === "file-pick") return { t: "file-pick", id: t.id };
  if (t.t === "file-save") {
    const n = ee(t);
    return n ? { t: "file-save", id: t.id, ...n, private: t.private !== !1 } : null;
  }
  if (t.t === "pass" && typeof t.session == "string" && F.test(t.session)) return { t: "pass", id: t.id, session: t.session };
  if (t.t === "save" && z(t.slot) && te(t.data)) return { t: "save", id: t.id, slot: z(t.slot), data: t.data };
  if (t.t === "find" && z(t.slot)) return { t: "find", id: t.id, slot: z(t.slot) };
  if (t.t === "open" && t.event && typeof t.event == "object") return { t: "open", id: t.id, event: t.event };
  if (t.t === "want" && t.permissions === void 0 && Array.isArray(t.more)) return { t: "wantMore", id: t.id, more: ot(t.more) };
  if (t.t === "follow" && (t.list === null || t.list && typeof t.list == "object")) {
    const n = typeof t.add == "string" && F.test(t.add), r = typeof t.remove == "string" && F.test(t.remove);
    return n === r ? null : { t: "follow", id: t.id, list: t.list, ...n ? { add: t.add } : { remove: t.remove } };
  }
  if (t.t === "score" && q(t.world) && Kt(t.board) && Ut(t.score) !== null) return { t: "score", id: t.id, world: q(t.world), board: Kt(t.board), score: Ut(t.score), ...Ft(t.title) ? { title: Ft(t.title) } : {}, ...t.format === "time" ? { format: "time" } : {} };
  if (t.t === "achieve" && q(t.world) && Bt(t.achievement) && Wt(t.title))
    return { t: "achieve", id: t.id, world: q(t.world), achievement: Bt(t.achievement), title: Wt(t.title) };
  if (t.t === "seal" && typeof t.to == "string" && F.test(t.to) && At(t.text)) return { t: "seal", id: t.id, to: t.to, text: At(t.text) };
  if (t.t === "unwrap" && t.event && typeof t.event == "object") return { t: "unwrap", id: t.id, event: t.event };
  if (t.t === "reach" && Array.isArray(t.relays) && t.relays.length <= 8 && t.relays.every((n) => typeof n == "string" && n.length <= 200)) return { t: "reach", id: t.id, relays: t.relays };
  if (t.t === "want") {
    const n = He(t.permissions);
    return n ? { t: "want", id: t.id, permissions: n } : null;
  }
  return (t.t === "encrypt" || t.t === "decrypt") && typeof t.peer == "string" && F.test(t.peer) && typeof t.text == "string" && t.text.length <= 2e5 ? { t: t.t, id: t.id, peer: t.peer, text: t.text, scheme: t.scheme === "nip04" ? "nip04" : "nip44" } : t.t === "read" && t.event && typeof t.event == "object" ? { t: "read", id: t.id, event: t.event } : null;
}
const dr = 2e4, Ue = 60, pr = 25 * 1024 * 1024;
function ee(e) {
  if (!e || typeof e != "object") return null;
  const t = e, n = kt(t.name), r = t.bytes instanceof Uint8Array ? t.bytes : t.bytes instanceof ArrayBuffer ? new Uint8Array(t.bytes) : null;
  return !n || !r || r.length === 0 || r.length > pr ? null : { name: n, type: typeof t.type == "string" && /^[\x21-\x7e]{3,120}$/u.test(t.type) && t.type.includes("/") ? t.type.toLowerCase() : "application/octet-stream", bytes: r };
}
const ht = (e) => {
  try {
    const t = new URL(String(e));
    return typeof e == "string" && e.length <= 400 && (t.protocol === "https:" || t.protocol === "http:") ? t.href : "";
  } catch {
    return "";
  }
}, hr = (e) => typeof e == "string" && e.length <= 2e3 && /^nostr\+walletconnect:\/\/[0-9a-f]{64}\?[\x21-\x7e]+$/u.test(e) ? e : "";
function _t(e, t) {
  if (!e || typeof e != "object") return null;
  const n = e;
  if (n.what === "wallet") return { what: "wallet" };
  if (n.what === "pick") return { what: "pick" };
  if (n.what === "save") {
    const s = ee(n);
    return s ? { what: "save", ...s, private: n.private !== !1 } : null;
  }
  if (n.what === "tip") {
    const s = n;
    return !X(s.sats) || s.to !== void 0 && !(typeof s.to == "string" && F.test(s.to)) ? null : { what: "tip", sats: X(s.sats), ...typeof s.to == "string" ? { to: s.to } : {} };
  }
  if (n.what === "buy") return tt(n.listing) ? { what: "buy", listing: tt(n.listing) } : null;
  if (n.what === "pay") return Q(n.invoice) ? { what: "pay", invoice: Q(n.invoice) } : null;
  if (n.what !== "sign") return null;
  const r = fr(n.event, t, n.event?.created_at ?? 0);
  return r && JSON.stringify(r.tags) === JSON.stringify(n.event.tags) ? { what: "sign", event: r } : null;
}
const vs = (e) => ({ nswp: $e, v: Nt, ...e });
function Ss(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.nswp !== $e || t.v !== Nt || typeof t.nonce != "string" || !Ke.test(t.nonce)) return null;
  const n = (r) => typeof r == "string" && F.test(r);
  if (t.t === "hello") return { t: "hello", nonce: t.nonce };
  if (t.t === "frame" && m(t.world) && n(t.recipient)) {
    const r = t.wants === void 0 ? void 0 : He(t.wants);
    return r === null ? null : { t: "frame", nonce: t.nonce, world: m(t.world), recipient: t.recipient, ...r ? { wants: r } : {}, ...t.turnedDown === !0 ? { turnedDown: !0 } : {}, ...!r && ot(t.more).length ? { more: ot(t.more) } : {}, ...!r && ot(t.has).length ? { has: ot(t.has) } : {}, ..._t(t.ask, m(t.world)) && n(t.pubkey) && !(r && _t(t.ask, m(t.world)).what === "wallet") ? { ask: _t(t.ask, m(t.world)), pubkey: t.pubkey } : {} };
  }
  if (t.t === "answer" && m(t.world)) {
    const r = t.wallet === void 0 ? "" : hr(t.wallet);
    if (t.wallet !== void 0 && !r) return null;
    const s = t.event && typeof t.event == "object" ? t.event : void 0, o = t.paid && typeof t.paid == "object" ? t.paid : null, a = o && Q(o.invoice) ? { invoice: Q(o.invoice), ...typeof o.preimage == "string" && F.test(o.preimage) ? { preimage: o.preimage } : {} } : null;
    if (t.paid !== void 0 && !a) return null;
    const c = t.saved && typeof t.saved == "object" ? t.saved : null, l = c && kt(c.name) && typeof c.size == "number" && Number.isSafeInteger(c.size) && c.size >= 0 ? { name: kt(c.name), size: c.size, private: c.private !== !1, ...c.private === !1 && ht(c.url) ? { url: ht(c.url) } : {} } : null;
    if (t.saved !== void 0 && !l) return null;
    const f = t.file === void 0 ? null : ee(t.file);
    if (t.file !== void 0 && !f) return null;
    const i = f ? { ...f, ...ht(t.file.url) ? { url: ht(t.file.url) } : {} } : null, u = t.tipped && typeof t.tipped == "object" ? t.tipped : null, d = u && X(u.sats) ? { sats: X(u.sats), ...typeof u.preimage == "string" && F.test(u.preimage) ? { preimage: u.preimage } : {} } : null;
    if (t.tipped !== void 0 && !d) return null;
    const h = t.bought && typeof t.bought == "object" ? t.bought : null, y = h && h.receipt && typeof h.receipt == "object" ? { receipt: h.receipt, ...typeof h.delivery == "string" && h.delivery.length > 0 && h.delivery.length <= dr ? { delivery: h.delivery } : {} } : null;
    return t.bought !== void 0 && !y || [s, r, a, l, i, d, y].filter(Boolean).length > 1 ? null : { t: "answer", nonce: t.nonce, world: m(t.world), ...s ? { event: s } : {}, ...r ? { wallet: r } : {}, ...a ? { paid: a } : {}, ...l ? { saved: l } : {}, ...i ? { file: i } : {}, ...d ? { tipped: d } : {}, ...y ? { bought: y } : {} };
  }
  if (t.t === "held" && m(t.world) && Array.isArray(t.receipts) && t.receipts.length <= Ue && t.receipts.every((r) => r && typeof r == "object"))
    return { t: "held", nonce: t.nonce, world: m(t.world), receipts: t.receipts };
  if (t.t === "grant" && m(t.world) && t.sealed && typeof t.sealed == "object") {
    const r = t.sealed;
    if (!n(r.senderPublicKey) || typeof r.payload != "string" || r.payload.length > 12e3) return null;
    const s = zt(t.name);
    return { t: "grant", nonce: t.nonce, world: m(t.world), sealed: { senderPublicKey: r.senderPublicKey, payload: r.payload }, ...s ? { name: s } : {} };
  }
  return t.t === "done" && typeof t.ok == "boolean" ? { t: "done", nonce: t.nonce, ok: t.ok } : null;
}
function Es(e, t, n) {
  const r = [];
  for (const s of e.slice(0, Ue)) {
    const o = Un(s, n);
    o && o.buyer === t && r.push(o.event);
  }
  return r;
}
const J = { kinds: 64, prefixes: 8, origins: 8, peers: 8, prefixChars: 64 }, et = 30078, at = 27235, Fe = 24242, ne = 22242, Be = 13, yr = 37304, Ht = "bitlogin:", We = [13194, 23194, 23195, 24133, 27301, 37304], ct = {
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
}, dt = [27300, 27302, 27303], gr = 27303;
function Ns(e) {
  return Object.hasOwn(ct, e) ? ct[e].name : null;
}
function lt(e) {
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
const wr = ["https://bitlogin.network", "https://bitlogin-beta.vercel.app"], Is = (e) => typeof e == "string" && (wr.includes(e) || lt(e)), mr = ["https://bitlogin-beta.vercel.app"], _s = (e) => typeof e == "string" && (mr.includes(e) || lt(e)), br = [], ks = (e) => typeof e == "string" && (br.includes(e) || lt(e));
function Ar(e, t) {
  return Object.hasOwn(ct, e) ? ct[e].reserved ?? [] : lt(t) && lt(e) ? dt : [];
}
const vr = () => {
  try {
    return globalThis.location?.origin ?? "";
  } catch {
    return "";
  }
}, re = (e) => Ar(e, vr()), Os = (e) => !Object.hasOwn(ct, e) && re(e).length > 0;
function Ls(e, t) {
  const n = re(e);
  return [...t.sign, ...t.read].every((r) => !dt.includes(r) || n.includes(r));
}
const ze = [0, 3, 5, 1e4, 10002, 10050, ne], Sr = [...ze, Fe, ...dt], Er = [4, Be, 1059], Nr = [at, Fe, ne], ut = /^[0-9a-f]{64}$/u, St = (e) => typeof e == "number" && Number.isInteger(e) && e >= 0 && e <= 65535, st = (e) => [...new Set(e)];
function He(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, n = (i) => i === void 0 ? [] : Array.isArray(i) ? i : null, r = n(t.sign), s = n(t.appData), o = n(t.proofs), a = n(t.read), c = n(t.peers);
  if (!r || !s || !o || !a || !c || r.length > J.kinds || a.length > J.kinds || s.length > J.prefixes || o.length > J.origins || c.length > J.peers || !r.every(St) || !a.every(St) || r.some((i) => We.includes(i)) || a.includes(yr) || r.length === 0 && a.length === 0 && c.length === 0) return null;
  for (const i of s)
    if (typeof i != "string" || i.length === 0 || i.length > J.prefixChars || i !== "*" && (i.startsWith(Ht) || Ht.startsWith(i)) || zt(i) !== i) return null;
  if ((r.includes(et) || a.includes(et)) !== s.length > 0) return null;
  const l = [];
  for (const i of o) {
    const u = m(i);
    if (!u || u !== i || !u.startsWith("https://")) return null;
    l.push(u);
  }
  if (l.length > 0 && !r.includes(at) || !c.every((i) => typeof i == "string" && ut.test(i))) return null;
  const f = zt(t.name);
  return {
    ...f ? { name: f } : {},
    sign: st(r).sort((i, u) => i - u),
    appData: st(s),
    proofs: st(l),
    read: st(a).sort((i, u) => i - u),
    peers: st(c)
  };
}
const xs = {
  /** Proofs, and the application's own data: what applications sign on timers. */
  quiet: { burst: 300, perMs: 6e4, hourly: 6e3 },
  public: { burst: 60, perMs: 6e4, hourly: 1200 },
  sensitive: { burst: 30, perMs: 6e4, hourly: 300 },
  read: { burst: 600, perMs: 6e4, hourly: 12e3 }
}, Y = {
  contentChars: 1e5,
  tags: 2500,
  /** Who someone follows (kind 3) is one note with a tag for each person: more are let through. */
  followTags: 2e4,
  tagItems: 16,
  tagChars: 1e3,
  clockSlackSec: 600
}, Xt = (e) => e >= 3e4 && e < 4e4;
function Ts(e) {
  return ze.includes(e) && e !== ne || dt.includes(e) ? "sensitive" : Nr.includes(e) || Xt(e) ? "quiet" : "public";
}
const we = "bitlogin:site", se = (e, t) => e.filter((n) => n[0] === t && typeof n[1] == "string").map((n) => n[1]);
function Xe(e, t) {
  const n = se(t, "d")[0];
  return n === void 0 || n.startsWith(Ht) ? !1 : e.appData.some((r) => r === "*" || n.startsWith(r));
}
function Ir(e, t, n) {
  const r = se(n, "u");
  return r.length === 0 ? !1 : r.every((s) => {
    const o = m(s);
    return o !== "" && (o === t || e.proofs.includes(o));
  });
}
function Ms(e, t, n, r) {
  const s = m(n);
  if (!s || !t || typeof t != "object") return null;
  const o = t;
  if (!St(o.kind) || We.includes(o.kind) || !e.sign.includes(o.kind) || dt.includes(o.kind) && !re(s).includes(o.kind) || typeof o.content != "string" || o.content.length > Y.contentChars || !Array.isArray(o.tags) || o.tags.length > (o.kind === 3 ? Y.followTags : Y.tags)) return null;
  const a = [];
  for (const i of o.tags) {
    if (!Array.isArray(i) || i.length === 0 || i.length > Y.tagItems || !i.every((u) => typeof u == "string" && u.length <= Y.tagChars)) return null;
    if (i[0] !== we) {
      if (i[0] === "nswp:world") {
        if (o.kind !== gr) continue;
        if (i.length !== 2 || m(i[1]) !== i[1] || a.some((u) => u[0] === "nswp:world")) return null;
      }
      a.push([...i]);
    }
  }
  if (o.kind === et && !Xe(e, a) || o.kind === at && !Ir(e, s, a)) return null;
  if (o.kind === Be) {
    if (a.length > 0) return null;
  } else
    a.push([we, s]);
  const c = Math.floor(r), l = typeof o.created_at == "number" && Number.isInteger(o.created_at) ? o.created_at : c, f = Math.abs(l - c) <= Y.clockSlackSec ? l : c;
  return { kind: o.kind, created_at: f, tags: a, content: o.content };
}
function Ps(e, t, n) {
  return typeof n == "string" && ut.test(n) && (n === t || e.peers.includes(n));
}
function Ds(e, t) {
  return typeof t == "string" && ut.test(t) && e.peers.includes(t);
}
function _r(e, t, n) {
  if (!St(n.kind) || !e.read.includes(n.kind) || typeof n.pubkey != "string" || !ut.test(n.pubkey) || !Array.isArray(n.tags)) return null;
  const r = n.tags.filter((o) => Array.isArray(o) && o.every((a) => typeof a == "string"));
  if (n.kind === et && !Xe(e, r)) return null;
  if (n.pubkey !== t) return n.pubkey;
  const s = se(r, "p")[0];
  return s !== void 0 && ut.test(s) ? s : t;
}
function Rs(e, t, n) {
  const r = _r(e, t, n);
  return r ? n.pubkey === t && r !== t ? [r, t] : [r] : [];
}
const kr = {
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
}, Or = {
  4: "read your private messages (older kind)",
  13: "read your private messages",
  1059: "read your private messages",
  1573: "read orders sent to you",
  7375: "read the money in your Cashu wallet",
  7376: "read what your Cashu wallet spent",
  1e4: "read who you have muted",
  3e4: "read your private lists"
}, me = (e) => {
  try {
    return new URL(e).host;
  } catch {
    return e;
  }
};
function $s(e, t) {
  const n = [], r = [], s = [], o = (a, c) => {
    a.includes(c) || a.push(c);
  };
  e.sign.includes(at) && o(n, `prove who you are to ${[me(t), ...e.proofs.map(me)].join(", ")}`);
  for (const a of e.sign) {
    if (a === at) continue;
    if (a === et) {
      e.appData.includes("*") ? o(r, "save application data under any name, including other applications' data") : o(n, `save its own data (${e.appData.join(", ")})`);
      continue;
    }
    const c = kr[a];
    if (!c) {
      Xt(a) ? o(n, `save its own kind of data (kind ${a})`) : s.push(a);
      continue;
    }
    o(Sr.includes(a) ? r : n, c);
  }
  s.length > 0 && o(n, `sign kinds BitLogin has no words for: ${s.join(", ")}`);
  for (const a of e.read) {
    if (a === et) {
      e.appData.includes("*") ? o(r, "read application data saved under any name") : o(n, "read its own saved data");
      continue;
    }
    const c = Or[a];
    c ? o(Er.includes(a) || a === 7375 ? r : n, c) : o(n, Xt(a) ? `read its own kind of data (kind ${a})` : `read what is encrypted in kind ${a}`);
  }
  return e.peers.length > 0 && o(n, `exchange encrypted messages with ${e.peers.length === 1 ? "one service" : `${e.peers.length} services`} it names (${e.peers.map((a) => `${a.slice(0, 8)}…`).join(", ")})`), { ordinary: n, sensitive: r };
}
export {
  Hn as $,
  lt as A,
  _s as B,
  ur as C,
  Re as D,
  Nt as E,
  vt as F,
  gs as G,
  ms as H,
  it as I,
  xs as J,
  ys as K,
  Kn as L,
  bs as M,
  As as N,
  Ls as O,
  ce as P,
  fr as Q,
  Ms as R,
  H as S,
  V as T,
  Te as U,
  ws as V,
  Ts as W,
  Ss as X,
  hr as Y,
  Es as Z,
  Ns as _,
  yt as a,
  vs as a0,
  zt as a1,
  Os as a2,
  dt as a3,
  $s as a4,
  Jr as a5,
  Tn as a6,
  Ln as a7,
  Vr as a8,
  Z as a9,
  ds as aA,
  fs as aB,
  us as aC,
  hs as aD,
  ps as aE,
  Vn as aF,
  is as aG,
  os as aH,
  rs as aI,
  Pe as aJ,
  ns as aK,
  Rt as aL,
  Is as aM,
  Ce as aN,
  ls as aO,
  cs as aP,
  as as aQ,
  ge as aR,
  jt as aS,
  ss as aT,
  Ue as aU,
  gt as aa,
  fe as ab,
  B as ac,
  W as ad,
  yn as ae,
  Gr as af,
  ue as ag,
  j as ah,
  ot as ai,
  Tr as aj,
  Jt as ak,
  Mr as al,
  $r as am,
  jr as an,
  Kr as ao,
  Rr as ap,
  on as aq,
  Pr as ar,
  Ur as as,
  Cr as at,
  $t as au,
  Wr as av,
  Rs as aw,
  Ds as ax,
  Er as ay,
  Ps as az,
  tt as b,
  Q as c,
  Yr as d,
  Pn as e,
  Un as f,
  es as g,
  ts as h,
  an as i,
  qt as j,
  Fr as k,
  X as l,
  Hr as m,
  qr as n,
  Br as o,
  Qr as p,
  Dn as q,
  Fn as r,
  Dr as s,
  zr as t,
  Qt as u,
  ks as v,
  Xr as w,
  Zr as x,
  m as y,
  He as z
};
