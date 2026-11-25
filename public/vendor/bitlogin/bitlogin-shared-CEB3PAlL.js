import { C as te, D as mn, E as An, h as vn, u as Lt, a as Sn, A as De, M as _n, B as kn, c as En, p as Nn, y as In, v as z, b as Ln, N as On, O as Pe } from "./bitlogin-shared-Cj9s0_W_.js";
import { d as $t } from "./bitlogin-shared-PwbHDYud.js";
const gs = 17375, ws = 7375, bs = 7376, ee = "sat", ne = {
  mints: 5,
  proofsPerToken: 500,
  tokens: 500,
  /**
   * How many proofs this wallet writes into one token record. Kept small so that a record is well under the
   * 64 KB an ordinary NIP-44 message may hold, and under what relays take: another NIP-60 wallet can read it.
   */
  proofsWritten: 100
}, ge = /^[0-9a-f]+$/u, Re = /^[0-9a-f]{64}$/u;
function At(e) {
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
function Tn(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.id != "string" || t.id.length < 2 || t.id.length > 66 || !ge.test(t.id) || typeof t.amount != "number" || !Number.isSafeInteger(t.amount) || t.amount <= 0 || typeof t.secret != "string" || t.secret.length === 0 || t.secret.length > 2048 || typeof t.C != "string" || t.C.length !== 66 || !ge.test(t.C) ? null : { id: t.id, amount: t.amount, secret: t.secret, C: t.C };
}
function xn(e, t = ne.proofsPerToken) {
  if (!Array.isArray(e) || e.length > t) return null;
  const n = [], r = /* @__PURE__ */ new Set();
  for (const s of e) {
    const o = Tn(s);
    if (!o || r.has(o.secret)) return null;
    r.add(o.secret), n.push(o);
  }
  return n;
}
const ms = (e) => e.reduce((t, n) => t + n.amount, 0);
function As(e) {
  return JSON.stringify([["privkey", e.privkey], ...e.mints.map((t) => ["mint", t])]);
}
function vs(e) {
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
    !Array.isArray(s) || typeof s[0] != "string" || (s[0] === "privkey" && typeof s[1] == "string" && Re.test(s[1]) && (n ||= s[1]), s[0] === "mint" && At(s[1]) && !r.includes(At(s[1])) && r.length < ne.mints && r.push(At(s[1])));
  return n ? { privkey: n, mints: r } : null;
}
function Ss(e) {
  return JSON.stringify({ mint: e.mint, unit: ee, proofs: e.proofs.map(({ id: t, amount: n, secret: r, C: s }) => ({ id: t, amount: n, secret: r, C: s })), ...e.del?.length ? { del: [...e.del] } : {} });
}
function _s(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = t, r = At(n.mint), s = xn(n.proofs);
  if (!r || !s || n.unit !== void 0 && n.unit !== ee) return null;
  const o = Array.isArray(n.del) ? n.del.filter((i) => typeof i == "string" && Re.test(i)).slice(0, 200) : [];
  return { mint: r, proofs: s, del: o };
}
function ks(e, t) {
  const n = new Set(e.flatMap((o) => o.del)), r = /* @__PURE__ */ new Set(), s = [];
  for (const o of [...e].sort((i, c) => c.created_at - i.created_at || i.event.localeCompare(c.event))) {
    if (n.has(o.event) || t.has(o.event)) continue;
    const i = o.proofs.filter((c) => !r.has(c.secret));
    for (const c of i) r.add(c.secret);
    i.length && s.length < ne.tokens && s.push({ event: o.event, mint: o.mint, proofs: i });
  }
  return s;
}
function Es(e) {
  return JSON.stringify([
    ["direction", e.direction],
    ["amount", String(e.amount)],
    ["unit", ee],
    ...(e.created ?? []).map((t) => ["e", t, "", "created"]),
    ...(e.destroyed ?? []).map((t) => ["e", t, "", "destroyed"])
  ]);
}
const ot = (e) => {
  if (typeof e != "string") return "";
  const t = e.trim().toLowerCase().replace(/^lightning:/u, "");
  return t.length <= 2e3 && /^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(t) ? t : "";
};
class tt extends Error {
  constructor(t, n) {
    super(n), this.code = t, this.name = "TipError";
  }
}
const we = { min: 1, max: 1e6 }, V = (e) => typeof e == "number" && Number.isSafeInteger(e) && e >= we.min && e <= we.max ? e : 0, be = { default: 1e3, steps: [1e3, 1e4, 1e5, 0] }, Ns = (e) => be.steps.includes(e) ? e : be.default, Is = (e, t) => t !== 0 && e > t;
function Mn(e) {
  if (typeof e != "string") return null;
  const t = e.trim().toLowerCase(), n = t.lastIndexOf("1");
  if (n < 4) return null;
  const r = /^ln(?:bcrt|tbs|bc|tb)([1-9][0-9]{0,11})([munp]?)$/u.exec(t.slice(0, n));
  if (!r) return null;
  const s = { "": 100000000000n, m: 100000000n, u: 100000n, n: 100n }, o = r[2] === "p" ? BigInt(r[1]) % 10n === 0n ? BigInt(r[1]) / 10n : -1n : BigInt(r[1]) * s[r[2]];
  if (o <= 0n || o % 1000n !== 0n) return null;
  const i = o / 1000n;
  return i <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(i) : null;
}
const re = /^(?:localhost|127\.0\.0\.1)(?::[0-9]{1,5})?$/u, $n = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/u;
function se(e, t = {}) {
  if (typeof e != "string" || e.length > 200) return "";
  const n = e.trim().toLowerCase(), r = n.lastIndexOf("@");
  if (r < 1) return "";
  const s = n.slice(0, r), o = n.slice(r + 1);
  return /^[a-z0-9._+-]{1,64}$/u.test(s) && ($n.test(o) || t.local && re.test(o)) ? n : "";
}
function Ls(e, t = {}) {
  try {
    const n = typeof e == "string" ? JSON.parse(e) : null;
    return n && typeof n == "object" ? se(n.lud16, t) : "";
  } catch {
    return "";
  }
}
const Dn = 8e3;
async function Dt(e, t) {
  const n = new AbortController(), r = setTimeout(() => n.abort(), Dn);
  try {
    const s = await e(t, { method: "GET", credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", headers: { accept: "application/json" }, signal: n.signal });
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
const Ce = (e, t) => {
  try {
    const n = new URL(String(e));
    return typeof e != "string" || e.length > 2e3 || n.username || n.password ? null : n.protocol === "https:" || t && n.protocol === "http:" && re.test(n.host) ? n : null;
  } catch {
    return null;
  }
};
async function Os(e, t = {}) {
  const n = Ce(e, t.local === !0);
  if (!n || n.origin !== e) return { tip: "", publishers: [], share: "" };
  const r = await Dt(t.fetch ?? ((o, i) => fetch(o, i)), `${n.origin}/.well-known/nswp.json`), s = r?.publishers && typeof r.publishers == "object" && !Array.isArray(r.publishers) ? Object.keys(r.publishers) : [];
  return { tip: se(r?.tip, t), publishers: s.filter((o) => /^[0-9a-f]{64}$/u.test(o)).slice(0, 16), share: typeof r?.share == "string" && /^[0-9a-f]{64}$/u.test(r.share) ? r.share : "" };
}
async function Ts(e, t, n = {}) {
  const r = n.local === !0, s = se(e, { local: r }), o = V(t);
  if (!s || !o) throw new tt("no-address", "That is not a lightning address and an amount.");
  const i = n.fetch ?? ((q, U) => fetch(q, U)), [c, l] = [s.slice(0, s.lastIndexOf("@")), s.slice(s.lastIndexOf("@") + 1)], f = r && re.test(l) ? "http" : "https", a = await Dt(i, `${f}://${l}/.well-known/lnurlp/${encodeURIComponent(c)}`);
  if (!a) throw new tt("unreachable", "That lightning address didn't answer. Nothing was spent.");
  const u = Ce(a.callback, r);
  if (a.tag !== "payRequest" || !u) throw new tt("unreachable", "That lightning address didn't answer as one. Nothing was spent.");
  const d = o * 1e3, [h, g] = [Number(a.minSendable), Number(a.maxSendable)];
  if (!(Number.isFinite(h) && Number.isFinite(g) && h <= d && d <= g))
    throw new tt("refused-amount", "That lightning address doesn't take a payment of this size. Nothing was spent.");
  u.searchParams.set("amount", String(d));
  const p = typeof a.commentAllowed == "number" && Number.isSafeInteger(a.commentAllowed) ? Math.min(a.commentAllowed, 280) : 0, b = p >= 8 ? Pt(n.note).slice(0, p) : "";
  b && u.searchParams.set("comment", b);
  const w = await Dt(i, u.href), A = typeof w?.pr == "string" ? w.pr.trim().toLowerCase() : "";
  if (!A || A.length > 2e3 || !/^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(A)) throw new tt("unreachable", "That lightning address gave no invoice. Nothing was spent.");
  if (Mn(A) !== o) throw new tt("wrong-invoice", "That lightning address answered with an invoice for a different amount. Nothing was spent.");
  return { invoice: A, note: b };
}
function Pt(e) {
  return typeof e == "string" ? Array.from(e.normalize("NFC")).filter((t) => {
    const n = t.codePointAt(0);
    return n >= 32 && n !== 127 && !(n >= 8203 && n <= 8207) && !(n >= 8234 && n <= 8238) && !(n >= 8294 && n <= 8297);
  }).join("").trim().slice(0, 280) : "";
}
function xs(e, t) {
  let n = "";
  try {
    n = new URL(t).host;
  } catch {
    n = "";
  }
  const r = Pt(e).slice(0, 60);
  return Pt(`${r ? `A tip from ${r}` : "A tip"}${n ? `, in ${n}` : ""}`);
}
function Pn(e) {
  const t = e.split(".");
  if (t.length !== 4 || t.some((r) => !/^\d{1,3}$/u.test(r)))
    return !1;
  const n = t.map(Number);
  return n.every((r) => r >= 0 && r <= 255) && n[0] === 127;
}
function Rn(e) {
  let t;
  try {
    t = new URL(e);
  } catch {
    return !1;
  }
  return t.username || t.password || t.hash ? !1 : t.protocol === "wss:" ? !0 : t.protocol !== "ws:" ? !1 : t.hostname === "localhost" || t.hostname === "[::1]" || Pn(t.hostname);
}
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function Cn(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
function me(e) {
  if (typeof e != "boolean")
    throw new TypeError(`boolean expected, not ${e}`);
}
function xt(e) {
  if (typeof e != "number")
    throw new TypeError("number expected, got " + typeof e);
  if (!Number.isSafeInteger(e) || e < 0)
    throw new RangeError("positive integer expected, got " + e);
}
function K(e, t, n = "") {
  const r = Cn(e), s = e?.length, o = t !== void 0;
  if (!r || o && s !== t) {
    const i = n && `"${n}" `, c = o ? ` of length ${t}` : "", l = r ? `length=${s}` : `type=${typeof e}`, f = i + "expected Uint8Array" + c + ", got " + l;
    throw r ? new RangeError(f) : new TypeError(f);
  }
  return e;
}
function W(e) {
  return new Uint32Array(e.buffer, e.byteOffset, Math.floor(e.byteLength / 4));
}
function Ae(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
const st = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68, jn = (e) => e << 24 & 4278190080 | e << 8 & 16711680 | e >>> 8 & 65280 | e >>> 24 & 255, Kn = (e) => {
  for (let t = 0; t < e.length; t++)
    e[t] = jn(e[t]);
  return e;
}, H = st ? (e) => e : Kn;
function Bn(e, t) {
  return !e.byteLength || !t.byteLength ? !1 : e.buffer === t.buffer && // best we can do, may fail with an obscure Proxy
  e.byteOffset < t.byteOffset + t.byteLength && // a starts before b end
  t.byteOffset < e.byteOffset + e.byteLength;
}
function Ms(e, t) {
  if (Bn(e, t) && e.byteOffset < t.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function Un(e, t) {
  if (t == null || typeof t != "object")
    throw new Error("options must be defined");
  return Object.assign(e, t);
}
const $s = /* @__NO_SIDE_EFFECTS__ */ (e, t) => {
  function n(r, ...s) {
    if (K(r, void 0, "key"), e.nonceLength !== void 0) {
      const a = s[0];
      K(a, e.varSizeNonce ? void 0 : e.nonceLength, "nonce");
    }
    const o = e.tagLength;
    o && s[1] !== void 0 && K(s[1], void 0, "AAD");
    const i = t(r, ...s), c = (a, u) => {
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
  return Object.assign(n, e), n;
};
function Wn(e, t, n = !0) {
  if (t === void 0)
    return new Uint8Array(e);
  if (K(t, void 0, "output"), t.length !== e)
    throw new Error('"output" expected Uint8Array of length ' + e + ", got: " + t.length);
  if (n && !vt(t))
    throw new Error("invalid output, must be aligned");
  return t;
}
function vt(e) {
  return e.byteOffset % 4 === 0;
}
function ve(e) {
  return Uint8Array.from(K(e));
}
const je = (e) => Uint8Array.from(e.split(""), (t) => t.charCodeAt(0)), Fn = H(W(je("expand 16-byte k"))), zn = H(W(je("expand 32-byte k")));
function y(e, t) {
  return e << t | e >>> 32 - t;
}
const lt = 64, Hn = 16, Rt = 2 ** 32 - 1, Se = /* @__PURE__ */ Uint32Array.of();
function Gn(e, t, n, r, s, o, i, c) {
  const l = s.length, f = new Uint8Array(lt), a = W(f), u = st && vt(s) && vt(o), d = u ? W(s) : Se, h = u ? W(o) : Se;
  if (!st) {
    for (let g = 0; g < l; i++) {
      if (e(t, n, r, a, i, c), H(a), i >= Rt)
        throw new Error("arx: counter overflow");
      const p = Math.min(lt, l - g);
      for (let b = 0, w; b < p; b++)
        w = g + b, o[w] = s[w] ^ f[b];
      g += p;
    }
    return;
  }
  for (let g = 0; g < l; i++) {
    if (e(t, n, r, a, i, c), i >= Rt)
      throw new Error("arx: counter overflow");
    const p = Math.min(lt, l - g);
    if (u && p === lt) {
      const b = g / 4;
      if (g % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let w = 0, A; w < Hn; w++)
        A = b + w, h[A] = d[A] ^ a[w];
      g += lt;
      continue;
    }
    for (let b = 0, w; b < p; b++)
      w = g + b, o[w] = s[w] ^ f[b];
    g += p;
  }
}
function Xn(e, t) {
  const { allowShortKeys: n, extendNonceFn: r, counterLength: s, counterRight: o, rounds: i } = Un({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, t);
  if (typeof e != "function")
    throw new Error("core must be a function");
  return xt(s), xt(i), me(o), me(n), (c, l, f, a, u = 0) => {
    K(c, void 0, "key"), K(l, void 0, "nonce"), K(f, void 0, "data");
    const d = f.length;
    if (a = Wn(d, a, !1), xt(u), u < 0 || u >= Rt)
      throw new Error("arx: counter overflow");
    const h = [];
    let g = c.length, p, b;
    if (g === 32)
      h.push(p = ve(c)), b = zn;
    else if (g === 16 && n)
      p = new Uint8Array(32), p.set(c), p.set(c, 16), b = Fn, h.push(p);
    else
      throw K(c, 32, "arx key"), new Error("invalid key size");
    (!st || !vt(l)) && h.push(l = ve(l));
    let w = W(p);
    if (r) {
      if (l.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const U = l.subarray(0, 16);
      if (st)
        r(b, w, W(U), w);
      else {
        const ct = H(Uint32Array.from(b));
        r(ct, w, W(U), w), Ae(ct), H(w);
      }
      l = l.subarray(16);
    } else st || H(w);
    const A = 16 - s;
    if (A !== l.length)
      throw new Error(`arx: nonce must be ${A} or 16 bytes`);
    if (A !== 12) {
      const U = new Uint8Array(12);
      U.set(l, o ? 0 : 12 - l.length), l = U, h.push(l);
    }
    const q = H(W(l));
    try {
      return Gn(e, b, w, q, f, a, u, i), a;
    } finally {
      Ae(...h);
    }
  };
}
function Vn(e, t, n, r, s, o = 20) {
  let i = e[0], c = e[1], l = e[2], f = e[3], a = t[0], u = t[1], d = t[2], h = t[3], g = t[4], p = t[5], b = t[6], w = t[7], A = s, q = n[0], U = n[1], ct = n[2], S = i, _ = c, k = l, E = f, N = a, I = u, L = d, O = h, T = g, x = p, M = b, $ = w, D = A, P = q, R = U, C = ct;
  for (let ye = 0; ye < o; ye += 2)
    S = S + N | 0, D = y(D ^ S, 16), T = T + D | 0, N = y(N ^ T, 12), S = S + N | 0, D = y(D ^ S, 8), T = T + D | 0, N = y(N ^ T, 7), _ = _ + I | 0, P = y(P ^ _, 16), x = x + P | 0, I = y(I ^ x, 12), _ = _ + I | 0, P = y(P ^ _, 8), x = x + P | 0, I = y(I ^ x, 7), k = k + L | 0, R = y(R ^ k, 16), M = M + R | 0, L = y(L ^ M, 12), k = k + L | 0, R = y(R ^ k, 8), M = M + R | 0, L = y(L ^ M, 7), E = E + O | 0, C = y(C ^ E, 16), $ = $ + C | 0, O = y(O ^ $, 12), E = E + O | 0, C = y(C ^ E, 8), $ = $ + C | 0, O = y(O ^ $, 7), S = S + I | 0, C = y(C ^ S, 16), M = M + C | 0, I = y(I ^ M, 12), S = S + I | 0, C = y(C ^ S, 8), M = M + C | 0, I = y(I ^ M, 7), _ = _ + L | 0, D = y(D ^ _, 16), $ = $ + D | 0, L = y(L ^ $, 12), _ = _ + L | 0, D = y(D ^ _, 8), $ = $ + D | 0, L = y(L ^ $, 7), k = k + O | 0, P = y(P ^ k, 16), T = T + P | 0, O = y(O ^ T, 12), k = k + O | 0, P = y(P ^ k, 8), T = T + P | 0, O = y(O ^ T, 7), E = E + N | 0, R = y(R ^ E, 16), x = x + R | 0, N = y(N ^ x, 12), E = E + N | 0, R = y(R ^ E, 8), x = x + R | 0, N = y(N ^ x, 7);
  let v = 0;
  r[v++] = i + S | 0, r[v++] = c + _ | 0, r[v++] = l + k | 0, r[v++] = f + E | 0, r[v++] = a + N | 0, r[v++] = u + I | 0, r[v++] = d + L | 0, r[v++] = h + O | 0, r[v++] = g + T | 0, r[v++] = p + x | 0, r[v++] = b + M | 0, r[v++] = w + $ | 0, r[v++] = A + D | 0, r[v++] = q + P | 0, r[v++] = U + R | 0, r[v++] = ct + C | 0;
}
const Ke = /* @__PURE__ */ Xn(Vn, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
}), Be = 2, Ct = 1, Ue = 65536, Jn = 4294967295, Yn = 132, Zn = 99, jt = 1024 * 1024;
function Ds(e, t) {
  const n = te(new Uint8Array([2]), mn(t)), s = An.getSharedSecret(e, n, !0).slice(1, 33);
  return vn(Lt("nip44-v2"), s);
}
function We(e, t) {
  if (e.length !== 32)
    throw new Error("NIP-44 conversation key must be exactly 32 bytes.");
  if (t.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const n = En(e, t, 76);
  return {
    chachaKey: n.slice(0, 32),
    chachaNonce: n.slice(32, 44),
    hmacKey: n.slice(44, 76)
  };
}
function oe(e) {
  if (e <= 32)
    return 32;
  const t = 2 ** Math.floor(Math.log2(e - 1) + 1), n = t <= 256 ? 32 : t / 8;
  return n * (Math.floor((e - 1) / n) + 1);
}
const Fe = 39 + oe(jt) + 32, Qn = Math.ceil(Fe / 3) * 4;
function qn(e) {
  if (e < Ue) {
    const n = new Uint8Array(2);
    return new DataView(n.buffer).setUint16(0, e, !1), n;
  }
  const t = new Uint8Array(6);
  return new DataView(t.buffer).setUint32(2, e, !1), t;
}
function tr(e) {
  const t = e.length;
  if (t < Ct || t > jt)
    throw new Error(`NIP-44 plaintext length must be between ${Ct} and ${jt} bytes on this platform.`);
  const n = qn(t), r = oe(t), s = new Uint8Array(n.length + r);
  return s.set(n, 0), s.set(e, n.length), s;
}
function er(e) {
  const t = new DataView(e.buffer, e.byteOffset, e.byteLength), n = t.getUint16(0, !1);
  let r, s;
  if (n === 0) {
    if (r = t.getUint32(2, !1), s = 6, r < Ue)
      throw new Error("NIP-44 payload has inconsistent padding.");
  } else
    r = n, s = 2;
  if (r < Ct || r > Jn || e.length !== s + oe(r))
    throw new Error("NIP-44 payload has inconsistent padding.");
  return e.slice(s, s + r);
}
function ze(e, t, n) {
  return Nn(In, e, te(t, n));
}
function nr(e, t) {
  return rr(e, t, Sn(32));
}
function rr(e, t, n) {
  if (n.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const { chachaKey: r, chachaNonce: s, hmacKey: o } = We(e, n), i = tr(Lt(t)), c = Ke(r, s, i), l = ze(o, n, c);
  return De.encode(te(new Uint8Array([Be]), n, c, l));
}
function sr(e, t) {
  if (t.startsWith("#"))
    throw new Error("Unsupported NIP-44 non-base64 encoding.");
  if (t.length < Yn || t.length > Qn)
    throw new Error("NIP-44 payload size is outside this platform's supported range.");
  const n = De.decode(t);
  if (n.length < Zn || n.length > Fe)
    throw new Error("NIP-44 decoded payload size is outside this platform's supported range.");
  if (n[0] !== Be)
    throw new Error(`Unsupported NIP-44 version: ${n[0]}`);
  const r = n.slice(1, 33);
  if (r.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const s = n.slice(n.length - 32), o = n.slice(33, n.length - 32), { chachaKey: i, chachaNonce: c, hmacKey: l } = We(e, r), f = ze(l, r, o);
  if (!_n(s, f))
    throw new Error("NIP-44 MAC verification failed: payload is corrupted, tampered, or uses the wrong key.");
  const a = Ke(i, c, o);
  return kn(er(a));
}
const St = /^[0-9a-f]{64}$/u, or = "nswp:share", Kt = "client", X = { most: 4, whole: 1e4, least: 10, label: 32 };
function ir(e) {
  if (typeof e != "string") return "";
  const t = e.trim();
  if (!t || t.length > X.label) return "";
  for (const n of t) {
    const r = n.codePointAt(0);
    if (r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279) return "";
  }
  return t;
}
function ar(e, t) {
  const n = (o) => ({ ok: !1, why: o });
  if (!Array.isArray(e)) return n("not-a-share");
  const r = e.filter((o) => Array.isArray(o) && o[0] === or);
  if (r.length === 0) return { ok: !0, shares: [] };
  if (typeof t != "string" || !St.test(t)) return n("no-seller");
  if (r.length > X.most) return n("too-many");
  const s = [];
  for (const o of r) {
    const [, i, c, l] = o;
    if (o.length < 3 || o.length > 4 || typeof i != "string" || i !== Kt && !St.test(i) || typeof c != "string" || !/^[1-9][0-9]{0,4}$/u.test(c) || Number(c) > X.whole) return n("not-a-share");
    const f = l === void 0 ? i === Kt ? "client" : i === t ? "seller" : "share" : ir(l);
    if (!f) return n("not-a-share");
    if (s.some((a) => a.to === i)) return n("twice");
    s.push({ to: i, parts: Number(c), label: f });
  }
  return s.some((o) => o.to === t) ? s.reduce((o, i) => o + i.parts, 0) !== X.whole ? n("not-whole") : { ok: !0, shares: s } : n("no-seller");
}
function Ps(e, t, n, r = {}) {
  const s = (a) => ({ ok: !1, why: a }), o = r.charge ?? 0;
  if (typeof e != "number" || !Number.isSafeInteger(e) || e < 1 || !Number.isSafeInteger(e * X.whole) || !Number.isSafeInteger(o) || o < 0) return s("not-a-price");
  if (typeof n != "string" || !St.test(n) || t.length > 0 && !t.some((a) => a.to === n)) return s("no-seller");
  const i = typeof r.client == "string" && St.test(r.client) && r.client !== n ? r.client : null, c = /* @__PURE__ */ new Map();
  for (const a of t) {
    if (a.to === n) continue;
    const u = a.to === Kt ? i : a.to;
    if (!u) continue;
    const d = Math.floor(e * a.parts / X.whole), h = c.get(u);
    c.set(u, h ? { sats: h.sats + d, label: h.label } : { sats: d, label: a.label });
  }
  const l = [...c.values()].reduce((a, u) => a + u.sats, 0), f = [...c].map(([a, u]) => ({ to: a, sats: u.sats, label: u.label, seller: !1 }));
  return f.sort((a, u) => a.sats - u.sats || (a.to < u.to ? -1 : 1)), f.push({ to: n, sats: e - l - o, label: t.find((a) => a.to === n)?.label ?? "seller", seller: !0 }), f.some((a) => a.sats < X.least) ? s("too-small") : { ok: !0, parts: f };
}
const Bt = /^[0-9a-f]{64}$/u, cr = 30078, lr = 30078, ur = "bitunlock:entitlement:v1:", He = "seller-unlock-service-v1", Ge = [{ endpoint: "https://api.bitunlock.network", pubkey: "66be61cf5b8d286391f7b1a72ffa7c799ec2dc49eff0830c40df1cc964e6787d" }], fr = /^(?:localhost|127(?:\.[0-9]{1,3}){3}|10(?:\.[0-9]{1,3}){3}|192\.168(?:\.[0-9]{1,3}){2}|172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})$/u;
function Rs(e) {
  if (typeof e != "string" || e.length > 300) return null;
  const [t, n] = e.split("|");
  try {
    const r = new URL(t ?? "");
    return r.protocol !== "http:" && r.protocol !== "https:" || !fr.test(r.hostname) || r.origin !== t ? null : n && Bt.test(n) ? { endpoint: r.origin, pubkey: n } : null;
  } catch {
    return null;
  }
}
function it(e) {
  return typeof e == "string" && /^30078:[0-9a-f]{64}:[^:\r\n][^\r\n]{0,255}$/u.test(e) ? e : "";
}
const ie = (e) => e.slice(6, 70), dr = 500, Cs = (e) => e.nswp && e.priceSats < dr, B = (e, t) => {
  const n = e.tags.find((r) => r[0] === t);
  return typeof n?.[1] == "string" ? n[1] : "";
}, _e = (e, t) => typeof e == "string" ? Array.from(e.normalize("NFC")).filter((n) => {
  const r = n.codePointAt(0);
  return r >= 32 && r !== 127 && !(r >= 8203 && r <= 8207) && !(r >= 8234 && r <= 8238) && !(r >= 8294 && r <= 8297);
}).join("").trim().slice(0, t) : "";
function js(e, t, n = Ge) {
  const r = it(t), s = e;
  if (!r || !s || typeof s != "object" || !Array.isArray(s.tags) || !z(s) || s.kind !== cr || s.pubkey !== ie(r) || `30078:${s.pubkey}:${B(s, "d")}` !== r || B(s, "status") !== "active" || B(s, "br:delivery") !== He) return null;
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
    title: _e(B(s, "title") || l.title || l.name, 80) || _e(B(s, "d"), 80),
    priceSats: i,
    service: { ...c },
    for: /^3730[0-9]:[0-9a-f]{64}:[^\s]{1,200}$/u.test(B(s, "nswp:for")) ? B(s, "nswp:for") : "",
    termSeconds: /^[1-9][0-9]{0,9}$/u.test(f) ? Number(f) : 0,
    nswp: s.tags.some((a) => typeof a[0] == "string" && a[0].startsWith("nswp:")),
    shared: s.tags.some((a) => a[0] === "nswp:share"),
    shares: ((a) => a.ok ? a.shares : null)(ar(s.tags, s.pubkey))
  };
}
function pr(e, t = Ge) {
  const n = e;
  if (!n || typeof n != "object" || !Array.isArray(n.tags) || typeof n.content != "string" || n.content.length > 8e3 || n.kind !== lr || !t.some((d) => d.pubkey === n.pubkey) || !z(n)) return null;
  let r;
  try {
    r = JSON.parse(n.content);
  } catch {
    return null;
  }
  if (!r || typeof r != "object" || r.schemaVersion !== 1 || r.protocolVersion !== He || r.status !== "active") return null;
  const s = (d) => typeof d == "string" && d.length > 0 && d.length <= 200 ? d : "", o = it(r.productCoordinate), [i, c, l, f] = [s(r.buyerPubkey), s(r.sellerPubkey), s(r.orderId), s(r.fulfillmentId)], a = typeof r.issuedAt == "number" && Number.isSafeInteger(r.issuedAt) && r.issuedAt > 0 ? r.issuedAt : 0;
  if (!o || !Bt.test(i) || !Bt.test(c) || c !== ie(o) || !l || !f || !a || B(n, "d") !== ur + f) return null;
  let u = 0;
  if (r.accessPolicy !== "perpetual-v1") {
    const d = r.accessPolicy;
    if (!d || typeof d != "object" || d.kind !== "term-v1" || typeof d.expiresAt != "number" || !Number.isSafeInteger(d.expiresAt) || d.expiresAt <= a) return null;
    u = d.expiresAt;
  }
  return { event: { id: n.id, pubkey: n.pubkey, created_at: n.created_at, kind: n.kind, tags: n.tags.map((d) => [...d]), content: n.content, sig: n.sig }, listing: o, seller: c, buyer: i, order: l, fulfillment: f, issuedAt: a, expiresAt: u, service: n.pubkey };
}
function hr(e, t) {
  return !!e && e.buyer === t.buyer && e.listing === t.listing && (e.expiresAt === 0 || t.now < e.expiresAt);
}
function Ks(e, t) {
  const n = e.filter((r) => hr(r, t));
  return n.sort((r, s) => r.expiresAt === 0 ? -1 : s.expiresAt === 0 ? 1 : s.expiresAt - r.expiresAt), n[0] ?? null;
}
function Bs(e, t, n) {
  return t.publishers.includes(ie(e)) || !!n && n === t.site;
}
const Xe = 37304, Ut = {
  /** The most a save may hold, in bytes of UTF-8. It has to fit in one note that any relay will take. */
  dataBytes: 32768,
  /** No more saves than this for one world in `perMs`, and in an hour. Counted apart from notes and passes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** A save handed over to be opened is not read past this many characters of content. */
  contentChars: 7e4
}, yr = /^[a-z0-9][a-z0-9-]{0,31}$/u, gr = /^[0-9a-f]{64}$/u, wr = "Something a world keeps for its visitor. Only they can read it.";
function G(e) {
  return typeof e == "string" && yr.test(e) ? e : "";
}
function ae(e) {
  return typeof e == "string" && e.length <= Ut.dataBytes && Lt(e).length <= Ut.dataBytes;
}
function Ve(e, t, n) {
  const r = m(t), s = G(n);
  return !r || !s ? "" : Ln(On(e, Lt(`nswp-save
${r}
${s}`)));
}
function Us(e) {
  const t = m(e.world), n = G(e.slot), r = Ve(e.conversationKey, t, n);
  if (!r || !ae(e.data)) return null;
  const s = JSON.stringify({ v: 1, world: t, slot: n, data: e.data });
  return {
    kind: Xe,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", r],
      ["alt", wr]
    ],
    content: nr(e.conversationKey, s)
  };
}
function Ws(e, t) {
  const n = m(t.world);
  if (!n || !e || typeof e != "object" || !gr.test(t.pubkey)) return null;
  const r = e;
  if (r.kind !== Xe || r.pubkey !== t.pubkey || typeof r.content != "string" || r.content.length > Ut.contentChars || !Array.isArray(r.tags)) return null;
  let s;
  try {
    s = JSON.parse(sr(t.conversationKey, r.content));
  } catch {
    return null;
  }
  if (!s || typeof s != "object" || s.v !== 1 || s.world !== n) return null;
  const o = G(s.slot);
  if (!o || !ae(s.data)) return null;
  const i = r.tags.find((c) => Array.isArray(c) && c[0] === "d");
  return !i || i[1] !== Ve(t.conversationKey, n, o) ? null : { slot: o, data: s.data, at: typeof r.created_at == "number" && Number.isInteger(r.created_at) ? r.created_at : 0 };
}
const ce = 30078, Je = "nswp", J = { read: 2e3, write: 500, ahead: 600, root: 4 }, br = /^[0-9a-f]{64}$/u, mr = /^[0-9a-f]{128}$/u, Ar = /^[a-z0-9][a-z0-9._-]{0,63}$/u, vr = /^([^:]*):governance:([^:]*):v([^:]*):([\s\S]*)$/u, Y = (e) => typeof e == "string" && br.test(e);
function gt(e) {
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
const Sr = (e, t) => `${Je}:governance:${e}:v1:${t}`, Ye = (e) => {
  const t = e;
  return !!t && typeof t == "object" && Y(t.id) && Y(t.pubkey) && typeof t.sig == "string" && mr.test(t.sig) && Number.isInteger(t.kind) && Number.isInteger(t.created_at) && typeof t.content == "string" && Array.isArray(t.tags) && t.tags.every((n) => Array.isArray(n) && n.every((r) => typeof r == "string"));
}, Ze = (e) => {
  const t = Array.isArray(e) ? e : [e];
  return t.length >= 1 && t.length <= J.root && t.every(Y) ? [...new Set(t)] : null;
}, Qe = (e) => {
  try {
    return z({ ...e, tags: e.tags.map((t) => [...t]) });
  } catch {
    return !1;
  }
};
function Wt(e, t = {}) {
  const n = (p) => ({ ok: !1, reason: p }), r = t.now ?? Math.floor(Date.now() / 1e3);
  if (!Ye(e)) return n("not_an_event");
  const s = e;
  if (s.kind !== ce) return n("wrong_kind");
  const o = s.tags.filter((p) => p[0] === "d"), i = o.length === 1 ? vr.exec(o[0][1] ?? "") : null;
  if (!i || !Ar.test(i[1]) || !/^[0-9]+$/u.test(i[3])) return n("bad_d");
  const [, , c, l, f] = i;
  if (l !== "1") return n("unsupported_version");
  if (c !== "user-allow" && c !== "user-deny") return n("unsupported_scope");
  if (!gt(f)) return n("bad_subject");
  const a = (p, b) => {
    const w = s.tags.filter((A) => A[0] === p);
    return w.length === 1 && w[0][1] === b;
  };
  if (!a("v", l) || !a("scope", c) || !a("subject", f)) return n("tag_mismatch");
  const u = t.root === void 0 ? [f.slice(f.indexOf(":") + 1, f.indexOf(":") + 65)] : Ze(t.root);
  if (!u || !u.includes(s.pubkey)) return n("wrong_signer");
  if (s.content !== "") return n("content_not_empty");
  const d = s.tags.filter((p) => p[0] === "p");
  if (d.length > J.read) return n("too_many_entries");
  if (s.created_at > r + J.ahead) return n("from_the_future");
  if (!Qe(s)) return n("bad_signature");
  const h = [];
  let g = 0;
  for (const p of d)
    Y(p[1]) ? h.includes(p[1]) || h.push(p[1]) : g++;
  return h.sort(), { ok: !0, scope: c, subject: f, signer: s.pubkey, entries: h, skipped: g };
}
function Fs(e, t) {
  const n = t.now ?? Math.floor(Date.now() / 1e3), r = `${t.namespace ?? Je}:governance:${t.scope}:v1:${t.subject}`, s = t.root === void 0 ? gt(t.subject) ? [t.subject.split(":")[1]] : null : Ze(t.root);
  if (!s) return { ok: !1, reason: "wrong_signer", futureDated: [] };
  const o = [], i = [], c = /* @__PURE__ */ new Set();
  for (const l of e) {
    if (!Ye(l) || l.kind !== ce || !s.includes(l.pubkey) || c.has(l.id)) continue;
    const f = l.tags.filter((a) => a[0] === "d");
    f.length !== 1 || f[0][1] !== r || !Qe(l) || (c.add(l.id), l.created_at > n + J.ahead ? i.push(l.id) : o.push(l));
  }
  return o.length ? (o.sort((l, f) => f.created_at - l.created_at || (l.id < f.id ? -1 : 1)), { ...Wt(o[0], { root: s, now: n }), futureDated: i }) : { ok: !1, reason: "not_found", futureDated: i };
}
function zs(e) {
  const t = [...new Set(e.people)].sort();
  if (!gt(e.subject) || t.length > J.write || !t.every(Y) || !Number.isSafeInteger(e.createdAt)) return null;
  const n = Number.isSafeInteger(e.notBefore) && e.notBefore + 1 > e.createdAt ? e.notBefore + 1 : e.createdAt;
  return { kind: ce, created_at: n, content: "", tags: [["d", Sr(e.scope, e.subject)], ["v", "1"], ["scope", e.scope], ["subject", e.subject], ...t.map((r) => ["p", r])] };
}
const qe = ["allow", "unallow", "block", "unblock"], ke = (e) => e === "allow" || e === "unallow" ? "user-allow" : "user-deny";
function _r(e, t, n) {
  const r = e.includes(n);
  return t === "allow" || t === "block" ? r ? null : [...e, n].sort() : r ? e.filter((s) => s !== n) : null;
}
function Hs(e, t, n) {
  const r = /^37300:([0-9a-f]{64}):([\s\S]{1,128})$/u.exec(n), s = e;
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
  if (f !== t) return null;
  const a = Array.isArray(l.keepers) ? [...new Set(l.keepers.filter(Y))] : [], u = a.length ? a.slice(0, J.root) : Object.keys(s.publishers).filter((d) => Y(d) && c(d)).slice(0, J.root);
  return u.length ? { coordinate: n, keepers: u, d: i } : null;
}
function Gs(e, t) {
  const n = Wt(e, { root: [t.pubkey], now: t.now });
  if (!n.ok || n.subject !== t.world || n.scope !== ke(t.change) || n.skipped !== 0) return !1;
  const r = t.list === null ? [] : ((o) => o.ok && o.subject === t.world && o.scope === ke(t.change) ? o.entries : null)(Wt(t.list, { root: [t.pubkey], now: t.now }));
  if (!r) return !1;
  const s = _r(r, t.change, t.key);
  return !!s && JSON.stringify(s) === JSON.stringify(n.entries) && Math.abs(e.created_at - t.now) < 600;
}
const Ft = 3, Xs = { burst: 6, perMs: 6e4, hourly: 60 }, bt = {
  /** A list handed over to be changed is not read past this many tags, or this much content. */
  tags: 2e4,
  contentChars: 1e5,
  tagItems: 16,
  tagChars: 1e3
}, kr = ["follows", "messages"];
function ft(e) {
  return Array.isArray(e) ? kr.filter((t) => e.includes(t)) : [];
}
const Er = ["nswp:world", "bitlogin:site"], Nr = /^[0-9a-f]{64}$/u;
function Ee(e, t) {
  if (e && (e.kind !== Ft || !Array.isArray(e.tags)) || !e && !t.fromNothing) return null;
  const n = typeof t.add == "string" ? t.add.toLowerCase() : "", r = typeof t.remove == "string" ? t.remove.toLowerCase() : "";
  if (n === "" == (r === "")) return null;
  const s = n || r;
  if (!Nr.test(s) || n && (e?.pubkey ?? t.pubkey) === n) return null;
  const o = e ? e.tags.filter((a) => Array.isArray(a) && a.every((u) => typeof u == "string") && !Er.includes(a[0] ?? "")) : [], i = (a) => a[0] === "p" && typeof a[1] == "string" && a[1].toLowerCase() === s, c = o.some(i);
  if (n ? c : !c) return null;
  const l = n ? [...o.map((a) => [...a]), ["p", n]] : o.filter((a) => !i(a)).map((a) => [...a]), f = Math.max(Math.floor(t.nowSeconds), e ? e.created_at + 1 : 0);
  return { kind: Ft, created_at: f, tags: l, content: typeof e?.content == "string" ? e.content : "" };
}
function Ir(e, t) {
  if (!e || typeof e != "object") return null;
  const n = e;
  if (n.kind !== Ft || n.pubkey !== t || !Array.isArray(n.tags) || n.tags.length > bt.tags || typeof n.content != "string" || n.content.length > bt.contentChars) return null;
  for (const r of n.tags)
    if (!Array.isArray(r) || r.length > bt.tagItems || !r.every((s) => typeof s == "string" && s.length <= bt.tagChars)) return null;
  return z(e) ? e : null;
}
function Vs(e) {
  const t = { add: e.add, remove: e.remove, nowSeconds: e.nowSeconds, pubkey: e.pubkey };
  if (e.list === null || e.list === void 0) return e.seen ? null : Ee(null, { ...t, fromNothing: !0 });
  const n = Ir(e.list, e.pubkey);
  return !n || e.seen && n.created_at < e.seen ? null : Ee(n, t);
}
function Js(e, t) {
  return e === null ? t.answered > 0 && t.newestAt === 0 : e.created_at >= t.newestAt;
}
const tn = (e) => typeof e == "string" && e.includes("*") ? pt(e) : m(e), Lr = 30078, Or = "bitlogin:taken-back:v1", Tr = 10002, F = {
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
}, Ys = { allBefore: 0, sites: [] }, Ne = (e) => typeof e == "number" && Number.isFinite(e) && e > 0 ? Math.floor(e) : 0;
function Zs(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e;
  if (t.v !== 1 || !Array.isArray(t.sites)) return null;
  const n = /* @__PURE__ */ new Map();
  for (const r of t.sites.slice(0, F.sites * 2)) {
    if (!r || typeof r != "object") continue;
    const s = r, o = tn(s.site), i = Ne(s.before);
    !o || o !== s.site || !i || n.set(o, Math.max(n.get(o) ?? 0, i));
  }
  return { allBefore: Ne(t.all_before), sites: [...n].map(([r, s]) => ({ site: r, before: s })) };
}
const Qs = (e) => JSON.stringify({ v: 1, all_before: e.allBefore, sites: e.sites });
function Ie(e, t, n) {
  const r = Math.max(e.allBefore, t.allBefore), s = /* @__PURE__ */ new Map();
  for (const { site: i, before: c } of [...e.sites, ...t.sites]) s.set(i, Math.max(s.get(i) ?? 0, c));
  const o = [...s].map(([i, c]) => ({ site: i, before: c })).filter((i) => i.before > r && i.before + F.entrySec > n).sort((i, c) => c.before - i.before).slice(0, F.sites);
  return { allBefore: r, sites: o };
}
function qs(e, t, n) {
  const r = Math.floor(n);
  if ("all" in t) return Ie(e, { allBefore: r, sites: [] }, r);
  const s = tn(t.site);
  return s ? Ie(e, { allBefore: 0, sites: [{ site: s, before: r }] }, r) : e;
}
function to(e, t, n) {
  if (e.allBefore >= n) return !0;
  const r = pt(t);
  return e.sites.some(
    (s) => s.before >= n && (s.site === t || (r ? Le(s.site, r) : !!pt(s.site) && Le(t, s.site)))
  );
}
function eo(e, t, n) {
  let r = null;
  for (const s of e)
    !z(s) || s.kind !== Lr || s.pubkey !== t || s.tags.some((o) => o[0] === "d" && o[1] === Or) && (s.created_at > n + F.skewSec || (!r || s.created_at > r.created_at) && (r = s));
  return r;
}
function le(e) {
  const t = e.toLowerCase().replace(/\.$/u, "");
  if (!t.includes(".") || t.startsWith("[") || t.includes(":") || /^[0-9.]+$/u.test(t) || /^0x/u.test(t)) return !1;
  const n = t.split(".");
  return !n.every((r) => /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/u.test(r)) || /^[0-9]+$/u.test(n[n.length - 1]) ? !1 : !["localhost", "local", "internal", "lan", "home", "intranet", "private", "corp", "test", "invalid", "onion"].includes(n[n.length - 1]);
}
function xr(e, t = F.relays) {
  if (!Array.isArray(e)) return [];
  const n = [];
  for (const r of e) {
    if (typeof r != "string" || r.length > 200 || !Rn(r)) continue;
    let s;
    try {
      s = new URL(r);
    } catch {
      continue;
    }
    if (s.protocol !== "wss:" || s.search || !le(s.hostname)) continue;
    const o = `${s.protocol}//${s.host}${s.pathname === "/" ? "" : s.pathname}`;
    if (n.includes(o) || n.push(o), n.length >= t) break;
  }
  return n;
}
function no(e, t, n = F.relays) {
  let r = null;
  for (const s of e)
    !z(s) || s.kind !== Tr || s.pubkey !== t || (!r || s.created_at > r.created_at) && (r = s);
  return r ? xr(
    r.tags.filter((s) => s[0] === "r" && (s[2] === void 0 || s[2] === "write")).map((s) => s[1]),
    n
  ) : [];
}
function ro(e) {
  return e.answered < Math.min(2, e.asked) || e.answered === 0 ? !1 : e.newestAt === null ? e.seenAt === 0 : e.readable && e.newestAt >= e.seenAt;
}
function so(e, t, n) {
  const r = Math.max(n, 0);
  return r && e - r < F.checkEverySec ? "fresh" : e - Math.max(r, t) >= F.staleSec ? "overdue" : "due";
}
const zt = "https://*.", Mr = ["bitblocks.network"];
function pt(e) {
  if (typeof e != "string" || e.length > 260 || !e.startsWith(zt)) return "";
  const t = e.slice(zt.length);
  return t !== t.toLowerCase() || t.endsWith(".") || !le(t) ? "" : e;
}
const en = (e) => pt(e) ? e.slice(zt.length) : "";
function Le(e, t) {
  const n = en(t);
  if (!n || typeof e != "string") return !1;
  try {
    const r = new URL(e);
    return r.protocol !== "https:" || r.port || r.origin !== e || !le(r.hostname) ? !1 : r.hostname === n || r.hostname.endsWith(`.${n}`);
  } catch {
    return !1;
  }
}
const oo = (e) => Mr.includes(en(e)), Ht = 14, nn = 13, $r = 1059, Dr = 10050, _t = {
  /** The most characters in one message. */
  chars: 2e3,
  /** No more than this many relays are put in a list of where messages reach someone. */
  relays: 4,
  /** A wrap handed over to be opened is not read past this many characters of content. */
  wrapChars: 6e4
}, io = { burst: 10, perMs: 6e4, hourly: 200 }, ao = { burst: 600, perMs: 6e4, hourly: 12e3 }, co = { burst: 3, perMs: 6e4, hourly: 12 }, kt = /^[0-9a-f]{64}$/u, Pr = [
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
function Et(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, _t.chars * 8).normalize("NFC")) {
    const r = n.codePointAt(0);
    t += Pr.some(([s, o]) => r >= s && r <= o) ? " " : n;
  }
  return t = t.replace(/[^\S\n]+/gu, " ").replace(/ ?\n ?/gu, `
`).replace(/\n{3,}/gu, `

`).trim(), [...t].slice(0, _t.chars).join("").trim();
}
function Rr(e) {
  const t = Et(e.text);
  if (!kt.test(e.from) || typeof e.to != "string" || !kt.test(e.to) || e.from === e.to || !t) return null;
  const n = { kind: Ht, pubkey: e.from, created_at: Math.floor(e.nowSeconds), tags: [["p", e.to]], content: t };
  return { ...n, id: Pe(n) };
}
function lo(e, t) {
  const n = e.getPublicKey(), r = Rr({ from: n, to: t.to, text: t.text, nowSeconds: t.nowSeconds });
  if (!r) return null;
  const s = JSON.stringify(r), o = (i) => e.signEvent({ kind: nn, created_at: Math.floor(t.nowSeconds), tags: [], content: e.nip44Encrypt(i, s) });
  return { message: r, seals: [o(r.tags[0][1]), o(n)] };
}
function Cr(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  return !z(t) || t.kind !== nn || t.tags.length !== 0 ? null : t;
}
function jr(e, t, n) {
  let r;
  try {
    r = JSON.parse(e);
  } catch {
    return null;
  }
  if (!r || typeof r != "object" || r.kind !== Ht || r.pubkey !== t || typeof r.pubkey != "string" || !kt.test(r.pubkey) || typeof r.content != "string" || typeof r.created_at != "number" || !Number.isInteger(r.created_at) || !Array.isArray(r.tags) || !r.tags.every((c) => Array.isArray(c) && c.every((l) => typeof l == "string"))) return null;
  const s = [...new Set(r.tags.filter((c) => c[0] === "p" && typeof c[1] == "string" && kt.test(c[1])).map((c) => c[1]))], o = Et(r.content);
  return s.length === 0 || !o || r.pubkey !== n && !s.includes(n) ? null : { id: Pe({ kind: Ht, pubkey: r.pubkey, created_at: r.created_at, tags: r.tags, content: r.content }), from: r.pubkey, to: s, text: o, at: r.created_at };
}
function uo(e, t) {
  const n = e.getPublicKey();
  if (!t || typeof t != "object") return null;
  const r = t;
  if (r.kind !== $r || typeof r.content != "string" || r.content.length > _t.wrapChars || !Array.isArray(r.tags) || r.tags.length > 20 || !z(t) || !t.tags.some((s) => s[0] === "p" && s[1] === n)) return null;
  try {
    const s = Cr(e.nip44Decrypt(t.pubkey, t.content));
    return s ? jr(e.nip44Decrypt(s.pubkey, s.content), s.pubkey, n) : null;
  } catch {
    return null;
  }
}
function Kr(e) {
  if (typeof e != "string" || e.length > 200) return "";
  try {
    const t = new URL(e.trim()), n = t.hostname;
    return t.protocol !== "wss:" || t.username || t.password || !n.includes(".") || n.startsWith("[") || /^[0-9.]+$/u.test(n) || /\.(local|localhost|internal|lan|home)$/iu.test(n) ? "" : (t.hash = "", t.href.replace(/\/$/u, ""));
  } catch {
    return "";
  }
}
function fo(e, t) {
  if (!Array.isArray(e) || e.length > 8) return null;
  const n = [...new Set(e.map(Kr).filter(Boolean))].slice(0, _t.relays);
  return n.length === 0 ? null : { kind: Dr, created_at: Math.floor(t), tags: n.map((r) => ["relay", r]), content: "" };
}
const Br = 37306, Oe = 37300, Gt = {
  /** No more scores than this for one world in `perMs`, and in an hour. Counted apart from notes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** The most a score may be. */
  most: 9007199254740991,
  /** The longest a board's title may be, in characters. */
  title: 60
}, Ur = /^[a-z0-9][a-z0-9-]{0,31}$/u, Wr = /^(\d+):([0-9a-f]{64}):(.*)$/su;
function rt(e) {
  if (typeof e != "string" || e.length > 200) return "";
  const t = Wr.exec(e);
  return t && Number(t[1]) === Oe && t[3] !== "" ? `${Oe}:${t[2]}:${t[3]}` : "";
}
function Xt(e) {
  return typeof e == "string" && Ur.test(e) ? e : "";
}
function Vt(e) {
  const t = typeof e == "string" && /^\d{1,16}$/u.test(e) ? Number(e) : e;
  return typeof t == "number" && Number.isSafeInteger(t) && t >= 0 && t <= Gt.most ? t : null;
}
function Jt(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, Gt.title * 8).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    t += s ? " " : n;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, Gt.title).join("").trim();
}
function Fr(e, t) {
  if (e !== "time") return String(t).replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
  const n = Math.round(t / 100), r = Math.floor(n / 600), s = n % 600 / 10;
  return r ? `${r} min ${s.toFixed(1)} s` : `${s.toFixed(1)} s`;
}
function po(e) {
  const t = m(e.origin), n = rt(e.world), r = Xt(e.board), s = Vt(e.score);
  if (!t || !n || !r || s === null) return null;
  const o = Jt(e.title), i = e.format === "time" ? "time" : "number";
  return {
    kind: Br,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", `${n}/${r}`],
      ["a", n],
      ["board", r, ...o ? [o] : []],
      ["score", String(s), ...i === "time" ? ["time"] : []],
      ["alt", `A score in a world: ${o ? `${o}: ` : ""}${Fr(i, s)}`],
      [Nt, t]
    ],
    content: ""
  };
}
const zr = 37307, Te = {
  /** No more than this many for one world in `perMs`, and in an hour. Counted apart from notes and scores. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** The longest a title may be, in characters. */
  title: 60
}, Hr = /^[a-z0-9][a-z0-9-]{0,31}$/u;
function Yt(e) {
  return typeof e == "string" && Hr.test(e) ? e : "";
}
function Zt(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, Te.title * 8).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    t += s ? " " : n;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, Te.title).join("").trim();
}
function ho(e) {
  const t = m(e.origin), n = rt(e.world), r = Yt(e.id), s = Zt(e.title);
  return !t || !n || !r || !s ? null : {
    kind: zr,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", `${n}/${r}`],
      ["a", n],
      ["achievement", r],
      ["title", s],
      ["alt", `An achievement in a world: ${s}`],
      [Nt, t]
    ],
    content: ""
  };
}
const rn = "nswp-signer", sn = "nswp-handoff", Ot = 1, dt = {
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
}, Gr = [1, 7], Xr = [4, 13, 14, 15, 1059, 1060, 13194, 22242, 23194, 23195, 24133, 27235, 27300, 27301, 30078], Vr = [0, 5, 10002], yo = { burst: 2, perMs: 6e4, hourly: 10 }, go = 5 * 6e4;
function ue(e) {
  return typeof e != "number" || !Number.isInteger(e) || e < 0 || e > 65535 || Xr.includes(e) ? "never" : Gr.includes(e) ? "ordinary" : "careful";
}
const Nt = "nswp:world";
function m(e) {
  if (typeof e != "string" || e.length > 300) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin !== "null" ? t.origin : "";
  } catch {
    return "";
  }
}
function Qt(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, 400).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    t += s ? " " : n;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, 48).join("").trim();
}
function wo(e, t, n) {
  return fe(e, t, n, (r) => ue(r) === "ordinary");
}
const xe = 37308;
function bo(e, t, n) {
  const r = e, s = r?.kind === xe && Array.isArray(r.tags) && r.tags.some((o) => Array.isArray(o) && o[0] === "d") && r.tags.filter((o) => Array.isArray(o) && o[0] === "d").every((o) => o[1] === "bag" && o.length === 2);
  return fe(e, t, n, (o) => ue(o) === "ordinary" || o === xe && s);
}
function Jr(e, t, n) {
  return fe(e, t, n, (r) => ue(r) === "careful" && Vr.includes(r));
}
function fe(e, t, n, r) {
  const s = m(t);
  if (!s || !e || typeof e != "object") return null;
  const o = e;
  if (!r(o.kind) || typeof o.content != "string" || [...o.content].length > dt.contentChars || !Array.isArray(o.tags) || o.tags.length > dt.tags) return null;
  const i = [];
  for (const c of o.tags) {
    if (!Array.isArray(c) || c.length === 0 || c.length > dt.tagItems || !c.every((l) => typeof l == "string" && l.length <= dt.tagChars)) return null;
    c[0] !== Nt && i.push([...c]);
  }
  return i.push([Nt, s]), { kind: o.kind, created_at: Math.floor(n), tags: i, content: o.content };
}
function mo(e = dt, t = []) {
  let n = t.filter((r) => typeof r == "number" && Number.isFinite(r));
  return {
    times: () => [...n],
    take(r) {
      return n = n.filter((s) => r - s < 36e5), n.length >= e.hourly || n.filter((s) => r - s < e.perMs).length >= e.burst ? !1 : (n.push(r), !0);
    }
  };
}
const on = /^[0-9a-z-]{1,40}$/iu, j = /^[0-9a-f]{64}$/u, Ao = (e) => ({ nswp: rn, v: Ot, ...e });
function vo(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.nswp !== rn || t.v !== Ot || typeof t.id != "string" || !on.test(t.id)) return null;
  if (t.t === "state") return { t: "state", id: t.id };
  if (t.t === "lock") return { t: "lock", id: t.id };
  if (t.t === "sign" && t.event && typeof t.event == "object") return { t: "sign", id: t.id, event: t.event };
  if (t.t === "propose" && t.event && typeof t.event == "object") return { t: "propose", id: t.id, event: t.event };
  if (t.t === "wallet") return { t: "wallet", id: t.id };
  if (t.t === "pay" && ot(t.invoice)) return { t: "pay", id: t.id, invoice: ot(t.invoice) };
  if (t.t === "tip" && V(t.sats) && (t.to === void 0 || typeof t.to == "string" && j.test(t.to))) return { t: "tip", id: t.id, sats: V(t.sats), ...typeof t.to == "string" ? { to: t.to } : {} };
  if (t.t === "guests" && typeof t.world == "string" && t.world.startsWith("37300:") && gt(t.world) && qe.includes(t.change) && typeof t.key == "string" && j.test(t.key) && (t.list === null || t.list && typeof t.list == "object"))
    return { t: "guests", id: t.id, world: t.world, list: t.list, change: t.change, key: t.key, none: t.none === !0 };
  if ((t.t === "buy" || t.t === "have") && it(t.listing)) return { t: t.t, id: t.id, listing: it(t.listing) };
  if (t.t === "file-pick") return { t: "file-pick", id: t.id };
  if (t.t === "file-save") {
    const n = de(t);
    return n ? { t: "file-save", id: t.id, ...n, private: t.private !== !1 } : null;
  }
  if (t.t === "pass" && typeof t.session == "string" && j.test(t.session)) return { t: "pass", id: t.id, session: t.session };
  if (t.t === "save" && G(t.slot) && ae(t.data)) return { t: "save", id: t.id, slot: G(t.slot), data: t.data };
  if (t.t === "find" && G(t.slot)) return { t: "find", id: t.id, slot: G(t.slot) };
  if (t.t === "open" && t.event && typeof t.event == "object") return { t: "open", id: t.id, event: t.event };
  if (t.t === "want" && t.permissions === void 0 && Array.isArray(t.more)) return { t: "wantMore", id: t.id, more: ft(t.more) };
  if (t.t === "want" && t.permissions === void 0 && t.more === void 0 && t.family !== void 0) return { t: "wantFamily", id: t.id, family: pt(t.family), ...t.guest === !0 ? { guest: !0 } : {} };
  if (t.t === "follow" && (t.list === null || t.list && typeof t.list == "object")) {
    const n = typeof t.add == "string" && j.test(t.add), r = typeof t.remove == "string" && j.test(t.remove);
    return n === r ? null : { t: "follow", id: t.id, list: t.list, ...n ? { add: t.add } : { remove: t.remove } };
  }
  if (t.t === "score" && rt(t.world) && Xt(t.board) && Vt(t.score) !== null) return { t: "score", id: t.id, world: rt(t.world), board: Xt(t.board), score: Vt(t.score), ...Jt(t.title) ? { title: Jt(t.title) } : {}, ...t.format === "time" ? { format: "time" } : {} };
  if (t.t === "achieve" && rt(t.world) && Yt(t.achievement) && Zt(t.title))
    return { t: "achieve", id: t.id, world: rt(t.world), achievement: Yt(t.achievement), title: Zt(t.title) };
  if (t.t === "seal" && typeof t.to == "string" && j.test(t.to) && Et(t.text)) return { t: "seal", id: t.id, to: t.to, text: Et(t.text) };
  if (t.t === "unwrap" && t.event && typeof t.event == "object") return { t: "unwrap", id: t.id, event: t.event };
  if (t.t === "reach" && Array.isArray(t.relays) && t.relays.length <= 8 && t.relays.every((n) => typeof n == "string" && n.length <= 200)) return { t: "reach", id: t.id, relays: t.relays };
  if (t.t === "want") {
    const n = wn(t.permissions);
    return n ? { t: "want", id: t.id, permissions: n } : null;
  }
  return (t.t === "encrypt" || t.t === "decrypt") && typeof t.peer == "string" && j.test(t.peer) && typeof t.text == "string" && t.text.length <= 2e5 ? { t: t.t, id: t.id, peer: t.peer, text: t.text, scheme: t.scheme === "nip04" ? "nip04" : "nip44" } : t.t === "read" && t.event && typeof t.event == "object" ? { t: "read", id: t.id, event: t.event } : null;
}
const Yr = 2e4, an = 60, Zr = 25 * 1024 * 1024;
function de(e) {
  if (!e || typeof e != "object") return null;
  const t = e, n = $t(t.name), r = t.bytes instanceof Uint8Array ? t.bytes : t.bytes instanceof ArrayBuffer ? new Uint8Array(t.bytes) : null;
  return !n || !r || r.length === 0 || r.length > Zr ? null : { name: n, type: typeof t.type == "string" && /^[\x21-\x7e]{3,120}$/u.test(t.type) && t.type.includes("/") ? t.type.toLowerCase() : "application/octet-stream", bytes: r };
}
const mt = (e) => {
  try {
    const t = new URL(String(e));
    return typeof e == "string" && e.length <= 400 && (t.protocol === "https:" || t.protocol === "http:") ? t.href : "";
  } catch {
    return "";
  }
}, Qr = (e) => typeof e == "string" && e.length <= 2e3 && /^nostr\+walletconnect:\/\/[0-9a-f]{64}\?[\x21-\x7e]+$/u.test(e) ? e : "";
function Mt(e, t) {
  if (!e || typeof e != "object") return null;
  const n = e;
  if (n.what === "wallet") return { what: "wallet" };
  if (n.what === "pick") return { what: "pick" };
  if (n.what === "save") {
    const s = de(n);
    return s ? { what: "save", ...s, private: n.private !== !1 } : null;
  }
  if (n.what === "tip") {
    const s = n;
    return !V(s.sats) || s.to !== void 0 && !(typeof s.to == "string" && j.test(s.to)) ? null : { what: "tip", sats: V(s.sats), ...typeof s.to == "string" ? { to: s.to } : {} };
  }
  if (n.what === "guests") {
    const s = n;
    return typeof s.world != "string" || !s.world.startsWith("37300:") || !gt(s.world) || !qe.includes(s.change) || typeof s.key != "string" || !j.test(s.key) || s.list !== null && !(s.list && typeof s.list == "object") ? null : { what: "guests", world: s.world, list: s.list ?? null, change: s.change, key: s.key, none: s.none === !0 };
  }
  if (n.what === "buy") return it(n.listing) ? { what: "buy", listing: it(n.listing) } : null;
  if (n.what === "pay") return ot(n.invoice) ? { what: "pay", invoice: ot(n.invoice) } : null;
  if (n.what !== "sign") return null;
  const r = Jr(n.event, t, n.event?.created_at ?? 0);
  return r && JSON.stringify(r.tags) === JSON.stringify(n.event.tags) ? { what: "sign", event: r } : null;
}
const So = (e) => ({ nswp: sn, v: Ot, ...e });
function _o(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.nswp !== sn || t.v !== Ot || typeof t.nonce != "string" || !on.test(t.nonce)) return null;
  const n = (r) => typeof r == "string" && j.test(r);
  if (t.t === "hello") return { t: "hello", nonce: t.nonce };
  if (t.t === "frame" && m(t.world) && n(t.recipient)) {
    const r = t.wants === void 0 ? void 0 : wn(t.wants);
    return r === null ? null : { t: "frame", nonce: t.nonce, world: m(t.world), recipient: t.recipient, ...r ? { wants: r } : {}, ...t.turnedDown === !0 ? { turnedDown: !0 } : {}, ...!r && ft(t.more).length ? { more: ft(t.more) } : {}, ...!r && ft(t.has).length ? { has: ft(t.has) } : {}, ...t.family === !0 ? { family: !0 } : {}, ...Mt(t.ask, m(t.world)) && n(t.pubkey) && !(r && Mt(t.ask, m(t.world)).what === "wallet") ? { ask: Mt(t.ask, m(t.world)), pubkey: t.pubkey } : {} };
  }
  if (t.t === "answer" && m(t.world)) {
    const r = t.wallet === void 0 ? "" : Qr(t.wallet);
    if (t.wallet !== void 0 && !r) return null;
    const s = t.event && typeof t.event == "object" ? t.event : void 0, o = t.paid && typeof t.paid == "object" ? t.paid : null, i = o && ot(o.invoice) ? { invoice: ot(o.invoice), ...typeof o.preimage == "string" && j.test(o.preimage) ? { preimage: o.preimage } : {} } : null;
    if (t.paid !== void 0 && !i) return null;
    const c = t.saved && typeof t.saved == "object" ? t.saved : null, l = c && $t(c.name) && typeof c.size == "number" && Number.isSafeInteger(c.size) && c.size >= 0 ? { name: $t(c.name), size: c.size, private: c.private !== !1, ...c.private === !1 && mt(c.url) ? { url: mt(c.url) } : {} } : null;
    if (t.saved !== void 0 && !l) return null;
    const f = t.file === void 0 ? null : de(t.file);
    if (t.file !== void 0 && !f) return null;
    const a = f ? { ...f, ...mt(t.file.url) ? { url: mt(t.file.url) } : {} } : null, u = t.tipped && typeof t.tipped == "object" ? t.tipped : null, d = u && V(u.sats) ? { sats: V(u.sats), ...typeof u.preimage == "string" && j.test(u.preimage) ? { preimage: u.preimage } : {} } : null;
    if (t.tipped !== void 0 && !d) return null;
    const h = t.bought && typeof t.bought == "object" ? t.bought : null, g = h && h.receipt && typeof h.receipt == "object" ? { receipt: h.receipt, ...typeof h.delivery == "string" && h.delivery.length > 0 && h.delivery.length <= Yr ? { delivery: h.delivery } : {} } : null;
    if (t.bought !== void 0 && !g) return null;
    const p = t.listed && typeof t.listed == "object" ? t.listed : void 0;
    return t.listed !== void 0 && !p || [s, r, i, l, a, d, g, p].filter(Boolean).length > 1 ? null : { t: "answer", nonce: t.nonce, world: m(t.world), ...s ? { event: s } : {}, ...p ? { listed: p } : {}, ...r ? { wallet: r } : {}, ...i ? { paid: i } : {}, ...l ? { saved: l } : {}, ...a ? { file: a } : {}, ...d ? { tipped: d } : {}, ...g ? { bought: g } : {} };
  }
  if (t.t === "held" && m(t.world) && Array.isArray(t.receipts) && t.receipts.length <= an && t.receipts.every((r) => r && typeof r == "object"))
    return { t: "held", nonce: t.nonce, world: m(t.world), receipts: t.receipts };
  if (t.t === "grant" && m(t.world) && t.sealed && typeof t.sealed == "object") {
    const r = t.sealed;
    if (!n(r.senderPublicKey) || typeof r.payload != "string" || r.payload.length > 12e3) return null;
    const s = Qt(t.name);
    return { t: "grant", nonce: t.nonce, world: m(t.world), sealed: { senderPublicKey: r.senderPublicKey, payload: r.payload }, ...s ? { name: s } : {} };
  }
  return t.t === "done" && typeof t.ok == "boolean" ? { t: "done", nonce: t.nonce, ok: t.ok } : null;
}
function ko(e, t, n) {
  const r = [];
  for (const s of e.slice(0, an)) {
    const o = pr(s, n);
    o && o.buyer === t && r.push(o.event);
  }
  return r;
}
const et = { kinds: 64, prefixes: 8, origins: 8, peers: 8, prefixChars: 64 }, Z = 30078, ht = 27235, cn = 24242, pe = 22242, ln = 13, qr = 37304, un = ["bitlogin", "nswp:governance:"];
function fn(e) {
  return un.some((t) => e.startsWith(t));
}
const ts = { leastChars: 8 };
function es(e) {
  const t = typeof e == "string" ? /^30078:[0-9a-f]{64}:(.*)$/su.exec(e) : null;
  return !!t && fn(t[1]);
}
function dn(e) {
  return e.length < ts.leastChars || !(e.endsWith("/") || e.endsWith(":")) ? !1 : !un.some((t) => e.startsWith(t) || t.startsWith(e));
}
const pn = [13194, 23194, 23195, 24133, 27301, 37304], at = {
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
}, wt = [27300, 27302, 27303], ns = 27303;
function Eo(e) {
  return Object.hasOwn(at, e) ? at[e].name : null;
}
function Q(e) {
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
const rs = ["https://bitlogin.network", "https://bitlogin-beta.vercel.app"], No = (e) => typeof e == "string" && (rs.includes(e) || Q(e)), ss = ["https://bitlogin-beta.vercel.app"], Io = (e) => typeof e == "string" && (ss.includes(e) || Q(e)), os = [], Lo = (e) => typeof e == "string" && (os.includes(e) || Q(e));
function is(e, t) {
  return Object.hasOwn(at, e) ? at[e].reserved ?? [] : Q(t) && Q(e) ? wt : [];
}
const hn = () => {
  try {
    return globalThis.location?.origin ?? "";
  } catch {
    return "";
  }
}, he = (e) => is(e, hn()), Oo = (e) => !Object.hasOwn(at, e) && he(e).length > 0;
function To(e, t) {
  const n = he(e);
  if (![...t.sign, ...t.read].every((s) => !wt.includes(s) || n.includes(s))) return !1;
  const r = yn(e);
  return t.appData.every((s) => !r.some((o) => s.startsWith(o) || o.startsWith(s)));
}
function yn(e) {
  return Q(hn()) && Q(e) ? [] : Object.entries(at).filter(([t]) => t !== e).flatMap(([, t]) => t.names ?? []);
}
const gn = [0, 3, 5, 1e4, 10002, 10050, pe], as = [...gn, cn, ...wt], cs = [4, ln, 1059], ls = [ht, cn, pe], yt = /^[0-9a-f]{64}$/u, It = (e) => typeof e == "number" && Number.isInteger(e) && e >= 0 && e <= 65535, ut = (e) => [...new Set(e)];
function wn(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, n = (a) => a === void 0 ? [] : Array.isArray(a) ? a : null, r = n(t.sign), s = n(t.appData), o = n(t.proofs), i = n(t.read), c = n(t.peers);
  if (!r || !s || !o || !i || !c || r.length > et.kinds || i.length > et.kinds || s.length > et.prefixes || o.length > et.origins || c.length > et.peers || !r.every(It) || !i.every(It) || r.some((a) => pn.includes(a)) || i.includes(qr) || r.length === 0 && i.length === 0 && c.length === 0) return null;
  for (const a of s)
    if (typeof a != "string" || a.length === 0 || a.length > et.prefixChars || !dn(a) || Qt(a) !== a) return null;
  if ((r.includes(Z) || i.includes(Z)) !== s.length > 0) return null;
  const l = [];
  for (const a of o) {
    const u = m(a);
    if (!u || u !== a || !u.startsWith("https://")) return null;
    l.push(u);
  }
  if (l.length > 0 && !r.includes(ht) || !c.every((a) => typeof a == "string" && yt.test(a))) return null;
  const f = Qt(t.name);
  return {
    ...f ? { name: f } : {},
    sign: ut(r).sort((a, u) => a - u),
    appData: ut(s),
    proofs: ut(l),
    read: ut(i).sort((a, u) => a - u),
    peers: ut(c)
  };
}
const xo = {
  /** Proofs, and the application's own data: what applications sign on timers. */
  quiet: { burst: 300, perMs: 6e4, hourly: 6e3 },
  public: { burst: 60, perMs: 6e4, hourly: 1200 },
  sensitive: { burst: 30, perMs: 6e4, hourly: 300 },
  read: { burst: 600, perMs: 6e4, hourly: 12e3 }
}, nt = {
  contentChars: 1e5,
  tags: 2500,
  /** Who someone follows (kind 3) is one note with a tag for each person: more are let through. */
  followTags: 2e4,
  tagItems: 16,
  tagChars: 1e3,
  clockSlackSec: 600
}, qt = (e) => e >= 3e4 && e < 4e4;
function Mo(e) {
  return gn.includes(e) && e !== pe || wt.includes(e) ? "sensitive" : ls.includes(e) || qt(e) ? "quiet" : "public";
}
const Me = "bitlogin:site", Tt = (e, t) => e.filter((n) => n[0] === t && typeof n[1] == "string").map((n) => n[1]);
function bn(e, t) {
  const n = Tt(t, "d");
  return n[0] === void 0 || n.some(fn) ? !1 : e.appData.some((s) => dn(s) && n.every((o) => o.startsWith(s)));
}
function us(e, t, n) {
  const r = Tt(n, "u");
  return r.length === 0 ? !1 : r.every((s) => {
    const o = m(s);
    return o !== "" && (o === t || e.proofs.includes(o));
  });
}
function $o(e, t, n, r) {
  const s = m(n);
  if (!s || !t || typeof t != "object") return null;
  const o = t;
  if (!It(o.kind) || pn.includes(o.kind) || !e.sign.includes(o.kind) || wt.includes(o.kind) && !he(s).includes(o.kind) || typeof o.content != "string" || o.content.length > nt.contentChars || !Array.isArray(o.tags) || o.tags.length > (o.kind === 3 ? nt.followTags : nt.tags)) return null;
  const i = [];
  for (const a of o.tags) {
    if (!Array.isArray(a) || a.length === 0 || a.length > nt.tagItems || !a.every((u) => typeof u == "string" && u.length <= nt.tagChars)) return null;
    if (a[0] !== Me) {
      if (a[0] === "nswp:world") {
        if (o.kind !== ns) continue;
        if (a.length !== 2 || m(a[1]) !== a[1] || i.some((u) => u[0] === "nswp:world")) return null;
      }
      i.push([...a]);
    }
  }
  if (o.kind === Z && !bn(e, i) || o.kind === Z && Tt(i, "d").some((a) => yn(s).some((u) => a.startsWith(u))) || o.kind === 5 && i.some((a) => a[0] === "a" && es(a[1])) || o.kind === ht && !us(e, s, i)) return null;
  if (o.kind === ln) {
    if (i.length > 0) return null;
  } else
    i.push([Me, s]);
  const c = Math.floor(r), l = typeof o.created_at == "number" && Number.isInteger(o.created_at) ? o.created_at : c, f = Math.abs(l - c) <= nt.clockSlackSec ? l : c;
  return { kind: o.kind, created_at: f, tags: i, content: o.content };
}
function Do(e, t, n) {
  return typeof n == "string" && yt.test(n) && (n === t || e.peers.includes(n));
}
function Po(e, t) {
  return typeof t == "string" && yt.test(t) && e.peers.includes(t);
}
function fs(e, t, n) {
  if (!It(n.kind) || !e.read.includes(n.kind) || typeof n.pubkey != "string" || !yt.test(n.pubkey) || !Array.isArray(n.tags)) return null;
  const r = n.tags.filter((o) => Array.isArray(o) && o.every((i) => typeof i == "string"));
  if (n.kind === Z && !bn(e, r)) return null;
  if (n.pubkey !== t) return n.pubkey;
  const s = Tt(r, "p")[0];
  return s !== void 0 && yt.test(s) ? s : t;
}
function Ro(e, t, n) {
  const r = fs(e, t, n);
  return r ? n.pubkey === t && r !== t ? [r, t] : [r] : [];
}
const ds = {
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
}, ps = {
  4: "read your private messages (older kind)",
  13: "read your private messages",
  1059: "read your private messages",
  1573: "read orders sent to you",
  7375: "read the money in your Cashu wallet",
  7376: "read what your Cashu wallet spent",
  1e4: "read who you have muted",
  3e4: "read your private lists"
}, $e = (e) => {
  try {
    return new URL(e).host;
  } catch {
    return e;
  }
};
function Co(e, t) {
  const n = [], r = [], s = [], o = (i, c) => {
    i.includes(c) || i.push(c);
  };
  e.sign.includes(ht) && o(n, `prove who you are to ${[$e(t), ...e.proofs.map($e)].join(", ")}`);
  for (const i of e.sign) {
    if (i === ht) continue;
    if (i === Z) {
      o(n, `save its own data (${e.appData.join(", ")})`);
      continue;
    }
    const c = ds[i];
    if (!c) {
      qt(i) ? o(n, `save its own kind of data (kind ${i})`) : s.push(i);
      continue;
    }
    o(as.includes(i) ? r : n, c);
  }
  s.length > 0 && o(n, `sign kinds BitLogin has no words for: ${s.join(", ")}`);
  for (const i of e.read) {
    if (i === Z) {
      o(n, `read its own saved data (${e.appData.join(", ")})`);
      continue;
    }
    const c = ps[i];
    c ? o(cs.includes(i) || i === 7375 ? r : n, c) : o(n, qt(i) ? `read its own kind of data (kind ${i})` : `read what is encrypted in kind ${i}`);
  }
  return e.peers.length > 0 && o(n, `exchange encrypted messages with ${e.peers.length === 1 ? "one service" : `${e.peers.length} services`} it names (${e.peers.map((i) => `${i.slice(0, 8)}…`).join(", ")})`), { ordinary: n, sensitive: r };
}
export {
  ko as $,
  Q as A,
  Io as B,
  Vr as C,
  rn as D,
  Ot as E,
  Nt as F,
  go as G,
  mo as H,
  dt as I,
  xo as J,
  yo as K,
  dr as L,
  Ao as M,
  vo as N,
  oo as O,
  be as P,
  To as Q,
  Jr as R,
  X as S,
  tt as T,
  Ge as U,
  $o as V,
  bo as W,
  wo as X,
  Mo as Y,
  _o as Z,
  Qr as _,
  At as a,
  Vs as a$,
  Gs as a0,
  Eo as a1,
  kr as a2,
  So as a3,
  pt as a4,
  en as a5,
  Le as a6,
  Qt as a7,
  Oo as a8,
  wt as a9,
  ws as aA,
  vs as aB,
  _s as aC,
  ks as aD,
  As as aE,
  xn as aF,
  bs as aG,
  Es as aH,
  Ss as aI,
  Tr as aJ,
  no as aK,
  Ft as aL,
  zs as aM,
  gt as aN,
  Sr as aO,
  Ls as aP,
  Ro as aQ,
  Po as aR,
  cs as aS,
  Do as aT,
  fo as aU,
  uo as aV,
  lo as aW,
  ho as aX,
  po as aY,
  Ir as aZ,
  Js as a_,
  _r as aa,
  Co as ab,
  Hs as ac,
  Wt as ad,
  Fs as ae,
  ke as af,
  le as ag,
  zt as ah,
  Rn as ai,
  Ds as aj,
  sr as ak,
  nr as al,
  $s as am,
  st as an,
  vt as ao,
  ve as ap,
  W as aq,
  H as ar,
  Wn as as,
  Ms as at,
  Ae as au,
  K as av,
  xr as aw,
  ft as ax,
  gs as ay,
  ne as az,
  it as b,
  Ws as b0,
  Ve as b1,
  Us as b2,
  Ut as b3,
  Or as b4,
  Lr as b5,
  eo as b6,
  qs as b7,
  Ie as b8,
  Ys as b9,
  Qs as ba,
  so as bb,
  No as bc,
  Zs as bd,
  ue as be,
  co as bf,
  ao as bg,
  io as bh,
  Te as bi,
  Gt as bj,
  Xs as bk,
  to as bl,
  ro as bm,
  an as bn,
  ot as c,
  Ps as d,
  ir as e,
  pr as f,
  Bs as g,
  Ks as h,
  Mn as i,
  se as j,
  Ns as k,
  V as l,
  Ts as m,
  Rs as n,
  Is as o,
  js as p,
  ar as q,
  hr as r,
  ms as s,
  Os as t,
  ie as u,
  Lo as v,
  xs as w,
  Cs as x,
  m as y,
  wn as z
};
