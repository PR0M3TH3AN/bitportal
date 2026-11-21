import { j as G, n as O, H as D, l as X, o as j, u as S, t as C, z as ee, x as re } from "./bitlogin-shared-CvPtgHf2.js";
/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function E(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function ne(e, ...r) {
  if (!E(e))
    throw new Error("Uint8Array expected");
  if (r.length > 0 && !r.includes(e.length))
    throw new Error("Uint8Array expected of length " + r + ", got length=" + e.length);
}
function Y(e, r) {
  return Array.isArray(r) ? r.length === 0 ? !0 : e ? r.every((n) => typeof n == "string") : r.every((n) => Number.isSafeInteger(n)) : !1;
}
function K(e) {
  if (typeof e != "function")
    throw new Error("function expected");
  return !0;
}
function p(e, r) {
  if (typeof r != "string")
    throw new Error(`${e}: string expected`);
  return !0;
}
function g(e) {
  if (!Number.isSafeInteger(e))
    throw new Error(`invalid integer: ${e}`);
}
function v(e) {
  if (!Array.isArray(e))
    throw new Error("array expected");
}
function b(e, r) {
  if (!Y(!0, r))
    throw new Error(`${e}: array of strings expected`);
}
function T(e, r) {
  if (!Y(!1, r))
    throw new Error(`${e}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function L(...e) {
  const r = (t) => t, n = (t, s) => (i) => t(s(i)), c = e.map((t) => t.encode).reduceRight(n, r), o = e.map((t) => t.decode).reduce(n, r);
  return { encode: c, decode: o };
}
// @__NO_SIDE_EFFECTS__
function _(e) {
  const r = typeof e == "string" ? e.split("") : e, n = r.length;
  b("alphabet", r);
  const c = new Map(r.map((o, t) => [o, t]));
  return {
    encode: (o) => (v(o), o.map((t) => {
      if (!Number.isSafeInteger(t) || t < 0 || t >= n)
        throw new Error(`alphabet.encode: digit index outside alphabet "${t}". Allowed: ${e}`);
      return r[t];
    })),
    decode: (o) => (v(o), o.map((t) => {
      p("alphabet.decode", t);
      const s = c.get(t);
      if (s === void 0)
        throw new Error(`Unknown letter: "${t}". Allowed: ${e}`);
      return s;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function z(e = "") {
  return p("join", e), {
    encode: (r) => (b("join.decode", r), r.join(e)),
    decode: (r) => (p("join.decode", r), r.split(e))
  };
}
// @__NO_SIDE_EFFECTS__
function Z(e, r = "=") {
  return g(e), p("padding", r), {
    encode(n) {
      for (b("padding.encode", n); n.length * e % 8; )
        n.push(r);
      return n;
    },
    decode(n) {
      b("padding.decode", n);
      let c = n.length;
      if (c * e % 8)
        throw new Error("padding: invalid, string should have whole number of bytes");
      for (; c > 0 && n[c - 1] === r; c--)
        if ((c - 1) * e % 8 === 0)
          throw new Error("padding: invalid, string has too much padding");
      return n.slice(0, c);
    }
  };
}
function I(e, r, n) {
  if (r < 2)
    throw new Error(`convertRadix: invalid from=${r}, base cannot be less than 2`);
  if (n < 2)
    throw new Error(`convertRadix: invalid to=${n}, base cannot be less than 2`);
  if (v(e), !e.length)
    return [];
  let c = 0;
  const o = [], t = Array.from(e, (i) => {
    if (g(i), i < 0 || i >= r)
      throw new Error(`invalid integer: ${i}`);
    return i;
  }), s = t.length;
  for (; ; ) {
    let i = 0, d = !0;
    for (let f = c; f < s; f++) {
      const l = t[f], u = r * i, a = u + l;
      if (!Number.isSafeInteger(a) || u / r !== i || a - l !== u)
        throw new Error("convertRadix: carry overflow");
      const w = a / n;
      i = a % n;
      const h = Math.floor(w);
      if (t[f] = h, !Number.isSafeInteger(h) || h * n + i !== a)
        throw new Error("convertRadix: carry overflow");
      if (d)
        h ? d = !1 : c = f;
      else continue;
    }
    if (o.push(i), d)
      break;
  }
  for (let i = 0; i < e.length - 1 && e[i] === 0; i++)
    o.push(0);
  return o.reverse();
}
const Q = (e, r) => r === 0 ? e : Q(r, e % r), U = /* @__NO_SIDE_EFFECTS__ */ (e, r) => e + (r - Q(e, r)), $ = /* @__PURE__ */ (() => {
  let e = [];
  for (let r = 0; r < 40; r++)
    e.push(2 ** r);
  return e;
})();
function B(e, r, n, c) {
  if (v(e), r <= 0 || r > 32)
    throw new Error(`convertRadix2: wrong from=${r}`);
  if (n <= 0 || n > 32)
    throw new Error(`convertRadix2: wrong to=${n}`);
  if (/* @__PURE__ */ U(r, n) > 32)
    throw new Error(`convertRadix2: carry overflow from=${r} to=${n} carryBits=${/* @__PURE__ */ U(r, n)}`);
  let o = 0, t = 0;
  const s = $[r], i = $[n] - 1, d = [];
  for (const f of e) {
    if (g(f), f >= s)
      throw new Error(`convertRadix2: invalid data word=${f} from=${r}`);
    if (o = o << r | f, t + r > 32)
      throw new Error(`convertRadix2: carry overflow pos=${t} from=${r}`);
    for (t += r; t >= n; t -= n)
      d.push((o >> t - n & i) >>> 0);
    const l = $[t];
    if (l === void 0)
      throw new Error("invalid carry");
    o &= l - 1;
  }
  if (o = o << n - t & i, !c && t >= r)
    throw new Error("Excess padding");
  if (!c && o > 0)
    throw new Error(`Non-zero padding: ${o}`);
  return c && t > 0 && d.push(o >>> 0), d;
}
// @__NO_SIDE_EFFECTS__
function te(e) {
  g(e);
  const r = 2 ** 8;
  return {
    encode: (n) => {
      if (!E(n))
        throw new Error("radix.encode input should be Uint8Array");
      return I(Array.from(n), r, e);
    },
    decode: (n) => (T("radix.decode", n), Uint8Array.from(I(n, e, r)))
  };
}
// @__NO_SIDE_EFFECTS__
function H(e, r = !1) {
  if (g(e), e <= 0 || e > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ U(8, e) > 32 || /* @__PURE__ */ U(e, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (n) => {
      if (!E(n))
        throw new Error("radix2.encode input should be Uint8Array");
      return B(Array.from(n), 8, e, !r);
    },
    decode: (n) => (T("radix2.decode", n), Uint8Array.from(B(n, e, 8, r)))
  };
}
function W(e) {
  return K(e), function(...r) {
    try {
      return e.apply(null, r);
    } catch {
    }
  };
}
function oe(e, r) {
  return g(e), K(r), {
    encode(n) {
      if (!E(n))
        throw new Error("checksum.encode: input should be Uint8Array");
      const c = r(n).slice(0, e), o = new Uint8Array(n.length + e);
      return o.set(n), o.set(c, n.length), o;
    },
    decode(n) {
      if (!E(n))
        throw new Error("checksum.decode: input should be Uint8Array");
      const c = n.slice(0, -e), o = n.slice(-e), t = r(c).slice(0, e);
      for (let s = 0; s < e; s++)
        if (t[s] !== o[s])
          throw new Error("Invalid checksum");
      return c;
    }
  };
}
const ge = {
  alphabet: _,
  chain: L,
  checksum: oe,
  convertRadix: I,
  convertRadix2: B,
  radix: te,
  radix2: H,
  join: z,
  padding: Z
}, ce = typeof Uint8Array.from([]).toBase64 == "function" && typeof Uint8Array.fromBase64 == "function", ie = (e, r) => {
  p("base64", e);
  const n = /^[A-Za-z0-9=+/]+$/, c = "base64";
  if (e.length > 0 && !n.test(e))
    throw new Error("invalid base64");
  return Uint8Array.fromBase64(e, { alphabet: c, lastChunkHandling: "strict" });
}, xe = ce ? {
  encode(e) {
    return ne(e), e.toBase64();
  },
  decode(e) {
    return ie(e);
  }
} : /* @__PURE__ */ L(/* @__PURE__ */ H(6), /* @__PURE__ */ _("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), /* @__PURE__ */ Z(6), /* @__PURE__ */ z("")), N = /* @__PURE__ */ L(/* @__PURE__ */ _("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), /* @__PURE__ */ z("")), P = [996825010, 642813549, 513874426, 1027748829, 705979059];
function A(e) {
  const r = e >> 25;
  let n = (e & 33554431) << 5;
  for (let c = 0; c < P.length; c++)
    (r >> c & 1) === 1 && (n ^= P[c]);
  return n;
}
function q(e, r, n = 1) {
  const c = e.length;
  let o = 1;
  for (let t = 0; t < c; t++) {
    const s = e.charCodeAt(t);
    if (s < 33 || s > 126)
      throw new Error(`Invalid prefix (${e})`);
    o = A(o) ^ s >> 5;
  }
  o = A(o);
  for (let t = 0; t < c; t++)
    o = A(o) ^ e.charCodeAt(t) & 31;
  for (let t of r)
    o = A(o) ^ t;
  for (let t = 0; t < 6; t++)
    o = A(o);
  return o ^= n, N.encode(B([o % $[30]], 30, 5, !1));
}
// @__NO_SIDE_EFFECTS__
function se(e) {
  const r = e === "bech32" ? 1 : 734539939, n = /* @__PURE__ */ H(5), c = n.decode, o = n.encode, t = W(c);
  function s(u, a, w = 90) {
    p("bech32.encode prefix", u), E(a) && (a = Array.from(a)), T("bech32.encode", a);
    const h = u.length;
    if (h === 0)
      throw new TypeError(`Invalid prefix length ${h}`);
    const y = h + 7 + a.length;
    if (w !== !1 && y > w)
      throw new TypeError(`Length ${y} exceeds limit ${w}`);
    const x = u.toLowerCase(), m = q(x, a, r);
    return `${x}1${N.encode(a)}${m}`;
  }
  function i(u, a = 90) {
    p("bech32.decode input", u);
    const w = u.length;
    if (w < 8 || a !== !1 && w > a)
      throw new TypeError(`invalid string length: ${w} (${u}). Expected (8..${a})`);
    const h = u.toLowerCase();
    if (u !== h && u !== u.toUpperCase())
      throw new Error("String must be lowercase or uppercase");
    const y = h.lastIndexOf("1");
    if (y === 0 || y === -1)
      throw new Error('Letter "1" must be present between prefix and data only');
    const x = h.slice(0, y), m = h.slice(y + 1);
    if (m.length < 6)
      throw new Error("Data must be at least 6 characters long");
    const M = N.decode(m).slice(0, -6), F = q(x, M, r);
    if (!m.endsWith(F))
      throw new Error(`Invalid checksum in ${u}: expected "${F}"`);
    return { prefix: x, words: M };
  }
  const d = W(i);
  function f(u) {
    const { prefix: a, words: w } = i(u, !1);
    return { prefix: a, words: w, bytes: c(w) };
  }
  function l(u, a) {
    return s(u, o(a));
  }
  return {
    encode: s,
    decode: i,
    encodeFromBytes: l,
    decodeToBytes: f,
    decodeUnsafe: d,
    fromWords: c,
    fromWordsUnsafe: t,
    toWords: o
  };
}
const me = /* @__PURE__ */ se("bech32");
function ae(e, r, n) {
  return G(e), n === void 0 && (n = new Uint8Array(e.outputLen)), O(e, D(n), D(r));
}
const k = /* @__PURE__ */ Uint8Array.from([0]), J = /* @__PURE__ */ Uint8Array.of();
function ue(e, r, n, c = 32) {
  G(e), X(c);
  const o = e.outputLen;
  if (c > 255 * o)
    throw new Error("Length should be <= 255*HashLen");
  const t = Math.ceil(c / o);
  n === void 0 && (n = J);
  const s = new Uint8Array(t * o), i = O.create(e, r), d = i._cloneInto(), f = new Uint8Array(i.outputLen);
  for (let l = 0; l < t; l++)
    k[0] = l + 1, d.update(l === 0 ? J : f).update(n).update(k).digestInto(f), s.set(f, o * l), i._cloneInto(d);
  return i.destroy(), d.destroy(), j(f, k), s.slice(0, c);
}
function Ae(e, r) {
  return ae(C, r, e);
}
function fe(e, r, n) {
  const c = typeof r == "string" ? S(r) : r;
  return ue(C, e, c, n);
}
function $e(e) {
  return C(S(e));
}
function ve(e, r) {
  return O(C, e, r);
}
const de = ee.CURVE.n;
function le(e) {
  let r = 0n;
  for (const n of e)
    r = r << 8n | BigInt(n);
  return r;
}
function he(e) {
  const r = new Uint8Array(32);
  let n = e;
  for (let c = 31; c >= 0; c--)
    r[c] = Number(n & 0xffn), n >>= 8n;
  return r;
}
function be(e, r) {
  const n = S(r);
  for (let c = 0; c <= 255; c++) {
    const o = re(n, new Uint8Array([0, c])), t = fe(e, o, 32), s = le(t);
    if (s >= 1n && s < de)
      return { scalar: he(s), counter: c };
  }
  throw new Error("ScalarExpand: exhausted 256 counters without a valid scalar (should not happen in practice).");
}
function we(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var R, V;
function ye() {
  return V || (V = 1, R = function e(r) {
    if (typeof r == "number" && isNaN(r))
      throw new Error("NaN is not allowed");
    if (typeof r == "number" && !isFinite(r))
      throw new Error("Infinity is not allowed");
    return r === null || typeof r != "object" ? JSON.stringify(r) : r.toJSON instanceof Function ? e(r.toJSON()) : Array.isArray(r) ? `[${r.reduce((o, t, s) => `${o}${s === 0 ? "" : ","}${e(t === void 0 || typeof t == "symbol" ? null : t)}`, "")}]` : `{${Object.keys(r).sort().reduce((c, o) => {
      if (r[o] === void 0 || typeof r[o] == "symbol")
        return c;
      const t = c.length === 0 ? "" : ",";
      return `${c}${t}${e(o)}:${e(r[o])}`;
    }, "")}}`;
  }), R;
}
var pe = ye();
const Ue = /* @__PURE__ */ we(pe);
export {
  fe as a,
  xe as b,
  Ue as c,
  ve as d,
  me as e,
  we as g,
  Ae as h,
  $e as l,
  be as s,
  ge as u
};
