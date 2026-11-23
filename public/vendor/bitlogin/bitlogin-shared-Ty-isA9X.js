import { s as Po } from "./bitlogin-shared-B1xnBpIf.js";
const n1 = {
  debug() {
  }
}, S2 = (e) => e.reduce((t, n) => t + n.toString(16).padStart(2, "0"), "");
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function Ho(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function ct(e, t = "") {
  if (!Number.isSafeInteger(e) || e < 0) {
    const n = t && `"${t}" `;
    throw new Error(`${n}expected integer >= 0, got ${e}`);
  }
}
function oe(e, t, n = "") {
  const r = Ho(e), o = e?.length, i = t !== void 0;
  if (!r || i && o !== t) {
    const s = n && `"${n}" `, c = i ? ` of length ${t}` : "", a = r ? `length=${o}` : `type=${typeof e}`;
    throw new Error(s + "expected Uint8Array" + c + ", got " + a);
  }
  return e;
}
function or(e) {
  if (typeof e != "function" || typeof e.create != "function")
    throw new Error("Hash must wrapped by utils.createHasher");
  ct(e.outputLen), ct(e.blockLen);
}
function Fn(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function _2(e, t) {
  oe(e, void 0, "digestInto() output");
  const n = t.outputLen;
  if (e.length < n)
    throw new Error('"digestInto() output" expected to be of length >=' + n);
}
function ln(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function Cr(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function Ue(e, t) {
  return e << 32 - t | e >>> t;
}
const r1 = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", L2 = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function ie(e) {
  if (oe(e), r1)
    return e.toHex();
  let t = "";
  for (let n = 0; n < e.length; n++)
    t += L2[e[n]];
  return t;
}
const We = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function Wi(e) {
  if (e >= We._0 && e <= We._9)
    return e - We._0;
  if (e >= We.A && e <= We.F)
    return e - (We.A - 10);
  if (e >= We.a && e <= We.f)
    return e - (We.a - 10);
}
function ne(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  if (r1)
    return Uint8Array.fromHex(e);
  const t = e.length, n = t / 2;
  if (t % 2)
    throw new Error("hex string expected, got unpadded hex of length " + t);
  const r = new Uint8Array(n);
  for (let o = 0, i = 0; o < n; o++, i += 2) {
    const s = Wi(e.charCodeAt(i)), c = Wi(e.charCodeAt(i + 1));
    if (s === void 0 || c === void 0) {
      const a = e[i] + e[i + 1];
      throw new Error('hex string expected, got non-hex character "' + a + '" at index ' + i);
    }
    r[o] = s * 16 + c;
  }
  return r;
}
function Ee(...e) {
  let t = 0;
  for (let r = 0; r < e.length; r++) {
    const o = e[r];
    oe(o), t += o.length;
  }
  const n = new Uint8Array(t);
  for (let r = 0, o = 0; r < e.length; r++) {
    const i = e[r];
    n.set(i, o), o += i.length;
  }
  return n;
}
function T2(e, t = {}) {
  const n = (o, i) => e(i).update(o).digest(), r = e(void 0);
  return n.outputLen = r.outputLen, n.blockLen = r.blockLen, n.create = (o) => e(o), Object.assign(n, t), Object.freeze(n);
}
function jt(e = 32) {
  const t = typeof globalThis == "object" ? globalThis.crypto : null;
  if (typeof t?.getRandomValues != "function")
    throw new Error("crypto.getRandomValues must be defined");
  return t.getRandomValues(new Uint8Array(e));
}
const M2 = (e) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, e])
});
function R2(e, t, n) {
  return e & t ^ ~e & n;
}
function $2(e, t, n) {
  return e & t ^ e & n ^ t & n;
}
class N2 {
  blockLen;
  outputLen;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = !1;
  length = 0;
  pos = 0;
  destroyed = !1;
  constructor(t, n, r, o) {
    this.blockLen = t, this.outputLen = n, this.padOffset = r, this.isLE = o, this.buffer = new Uint8Array(t), this.view = Cr(this.buffer);
  }
  update(t) {
    Fn(this), oe(t);
    const { view: n, buffer: r, blockLen: o } = this, i = t.length;
    for (let s = 0; s < i; ) {
      const c = Math.min(o - this.pos, i - s);
      if (c === o) {
        const a = Cr(t);
        for (; o <= i - s; s += o)
          this.process(a, s);
        continue;
      }
      r.set(t.subarray(s, s + c), this.pos), this.pos += c, s += c, this.pos === o && (this.process(n, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    Fn(this), _2(t, this), this.finished = !0;
    const { buffer: n, view: r, blockLen: o, isLE: i } = this;
    let { pos: s } = this;
    n[s++] = 128, ln(this.buffer.subarray(s)), this.padOffset > o - s && (this.process(r, 0), s = 0);
    for (let u = s; u < o; u++)
      n[u] = 0;
    r.setBigUint64(o - 8, BigInt(this.length * 8), i), this.process(r, 0);
    const c = Cr(t), a = this.outputLen;
    if (a % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const l = a / 4, p = this.get();
    if (l > p.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let u = 0; u < l; u++)
      c.setUint32(4 * u, p[u], i);
  }
  digest() {
    const { buffer: t, outputLen: n } = this;
    this.digestInto(t);
    const r = t.slice(0, n);
    return this.destroy(), r;
  }
  _cloneInto(t) {
    t ||= new this.constructor(), t.set(...this.get());
    const { blockLen: n, buffer: r, length: o, finished: i, destroyed: s, pos: c } = this;
    return t.destroyed = s, t.finished = i, t.length = o, t.pos = c, o % n && t.buffer.set(r), t;
  }
  clone() {
    return this._cloneInto();
  }
}
const qe = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), B2 = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]), Ke = /* @__PURE__ */ new Uint32Array(64);
class U2 extends N2 {
  constructor(t) {
    super(64, t, 8, !1);
  }
  get() {
    const { A: t, B: n, C: r, D: o, E: i, F: s, G: c, H: a } = this;
    return [t, n, r, o, i, s, c, a];
  }
  // prettier-ignore
  set(t, n, r, o, i, s, c, a) {
    this.A = t | 0, this.B = n | 0, this.C = r | 0, this.D = o | 0, this.E = i | 0, this.F = s | 0, this.G = c | 0, this.H = a | 0;
  }
  process(t, n) {
    for (let u = 0; u < 16; u++, n += 4)
      Ke[u] = t.getUint32(n, !1);
    for (let u = 16; u < 64; u++) {
      const y = Ke[u - 15], w = Ke[u - 2], b = Ue(y, 7) ^ Ue(y, 18) ^ y >>> 3, C = Ue(w, 17) ^ Ue(w, 19) ^ w >>> 10;
      Ke[u] = C + Ke[u - 7] + b + Ke[u - 16] | 0;
    }
    let { A: r, B: o, C: i, D: s, E: c, F: a, G: l, H: p } = this;
    for (let u = 0; u < 64; u++) {
      const y = Ue(c, 6) ^ Ue(c, 11) ^ Ue(c, 25), w = p + y + R2(c, a, l) + B2[u] + Ke[u] | 0, C = (Ue(r, 2) ^ Ue(r, 13) ^ Ue(r, 22)) + $2(r, o, i) | 0;
      p = l, l = a, a = c, c = s + w | 0, s = i, i = o, o = r, r = w + C | 0;
    }
    r = r + this.A | 0, o = o + this.B | 0, i = i + this.C | 0, s = s + this.D | 0, c = c + this.E | 0, a = a + this.F | 0, l = l + this.G | 0, p = p + this.H | 0, this.set(r, o, i, s, c, a, l, p);
  }
  roundClean() {
    ln(Ke);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), ln(this.buffer);
  }
}
class I2 extends U2 {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  A = qe[0] | 0;
  B = qe[1] | 0;
  C = qe[2] | 0;
  D = qe[3] | 0;
  E = qe[4] | 0;
  F = qe[5] | 0;
  G = qe[6] | 0;
  H = qe[7] | 0;
  constructor() {
    super(32);
  }
}
const He = /* @__PURE__ */ T2(
  () => new I2(),
  /* @__PURE__ */ M2(1)
);
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Zo = /* @__PURE__ */ BigInt(0), co = /* @__PURE__ */ BigInt(1);
function Vn(e, t = "") {
  if (typeof e != "boolean") {
    const n = t && `"${t}" `;
    throw new Error(n + "expected boolean, got type=" + typeof e);
  }
  return e;
}
function o1(e) {
  if (typeof e == "bigint") {
    if (!In(e))
      throw new Error("positive bigint expected, got " + e);
  } else
    ct(e);
  return e;
}
function xn(e) {
  const t = o1(e).toString(16);
  return t.length & 1 ? "0" + t : t;
}
function i1(e) {
  if (typeof e != "string")
    throw new Error("hex string expected, got " + typeof e);
  return e === "" ? Zo : BigInt("0x" + e);
}
function yn(e) {
  return i1(ie(e));
}
function s1(e) {
  return i1(ie(O2(oe(e)).reverse()));
}
function Wo(e, t) {
  ct(t), e = o1(e);
  const n = ne(e.toString(16).padStart(t * 2, "0"));
  if (n.length !== t)
    throw new Error("number too large");
  return n;
}
function a1(e, t) {
  return Wo(e, t).reverse();
}
function O2(e) {
  return Uint8Array.from(e);
}
function P2(e) {
  return Uint8Array.from(e, (t, n) => {
    const r = t.charCodeAt(0);
    if (t.length !== 1 || r > 127)
      throw new Error(`string contains non-ASCII character "${e[n]}" with code ${r} at position ${n}`);
    return r;
  });
}
const In = (e) => typeof e == "bigint" && Zo <= e;
function H2(e, t, n) {
  return In(e) && In(t) && In(n) && t <= e && e < n;
}
function Z2(e, t, n, r) {
  if (!H2(t, n, r))
    throw new Error("expected valid " + e + ": " + n + " <= n < " + r + ", got " + t);
}
function W2(e) {
  let t;
  for (t = 0; e > Zo; e >>= co, t += 1)
    ;
  return t;
}
const Do = (e) => (co << BigInt(e)) - co;
function D2(e, t, n) {
  if (ct(e, "hashLen"), ct(t, "qByteLen"), typeof n != "function")
    throw new Error("hmacFn must be a function");
  const r = (A) => new Uint8Array(A), o = Uint8Array.of(), i = Uint8Array.of(0), s = Uint8Array.of(1), c = 1e3;
  let a = r(e), l = r(e), p = 0;
  const u = () => {
    a.fill(1), l.fill(0), p = 0;
  }, y = (...A) => n(l, Ee(a, ...A)), w = (A = o) => {
    l = y(i, A), a = y(), A.length !== 0 && (l = y(s, A), a = y());
  }, b = () => {
    if (p++ >= c)
      throw new Error("drbg: tried max amount of iterations");
    let A = 0;
    const k = [];
    for (; A < t; ) {
      a = y();
      const _ = a.slice();
      k.push(_), A += a.length;
    }
    return Ee(...k);
  };
  return (A, k) => {
    u(), w(A);
    let _;
    for (; !(_ = k(b())); )
      w();
    return u(), _;
  };
}
function Fo(e, t = {}, n = {}) {
  if (!e || typeof e != "object")
    throw new Error("expected valid options object");
  function r(i, s, c) {
    const a = e[i];
    if (c && a === void 0)
      return;
    const l = typeof a;
    if (l !== s || a === null)
      throw new Error(`param "${i}" is invalid: expected ${s}, got ${l}`);
  }
  const o = (i, s) => Object.entries(i).forEach(([c, a]) => r(c, a, s));
  o(t, !1), o(n, !0);
}
function Di(e) {
  const t = /* @__PURE__ */ new WeakMap();
  return (n, ...r) => {
    const o = t.get(n);
    if (o !== void 0)
      return o;
    const i = e(n, ...r);
    return t.set(n, i), i;
  };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Ae = /* @__PURE__ */ BigInt(0), Ce = /* @__PURE__ */ BigInt(1), yt = /* @__PURE__ */ BigInt(2), c1 = /* @__PURE__ */ BigInt(3), l1 = /* @__PURE__ */ BigInt(4), d1 = /* @__PURE__ */ BigInt(5), F2 = /* @__PURE__ */ BigInt(7), u1 = /* @__PURE__ */ BigInt(8), V2 = /* @__PURE__ */ BigInt(9), h1 = /* @__PURE__ */ BigInt(16);
function $e(e, t) {
  const n = e % t;
  return n >= Ae ? n : t + n;
}
function Le(e, t, n) {
  let r = e;
  for (; t-- > Ae; )
    r *= r, r %= n;
  return r;
}
function Fi(e, t) {
  if (e === Ae)
    throw new Error("invert: expected non-zero number");
  if (t <= Ae)
    throw new Error("invert: expected positive modulus, got " + t);
  let n = $e(e, t), r = t, o = Ae, i = Ce;
  for (; n !== Ae; ) {
    const c = r / n, a = r % n, l = o - i * c;
    r = n, n = a, o = i, i = l;
  }
  if (r !== Ce)
    throw new Error("invert: does not exist");
  return $e(o, t);
}
function Vo(e, t, n) {
  if (!e.eql(e.sqr(t), n))
    throw new Error("Cannot find square root");
}
function f1(e, t) {
  const n = (e.ORDER + Ce) / l1, r = e.pow(t, n);
  return Vo(e, r, t), r;
}
function G2(e, t) {
  const n = (e.ORDER - d1) / u1, r = e.mul(t, yt), o = e.pow(r, n), i = e.mul(t, o), s = e.mul(e.mul(i, yt), o), c = e.mul(i, e.sub(s, e.ONE));
  return Vo(e, c, t), c;
}
function j2(e) {
  const t = ir(e), n = p1(e), r = n(t, t.neg(t.ONE)), o = n(t, r), i = n(t, t.neg(r)), s = (e + F2) / h1;
  return (c, a) => {
    let l = c.pow(a, s), p = c.mul(l, r);
    const u = c.mul(l, o), y = c.mul(l, i), w = c.eql(c.sqr(p), a), b = c.eql(c.sqr(u), a);
    l = c.cmov(l, p, w), p = c.cmov(y, u, b);
    const C = c.eql(c.sqr(p), a), A = c.cmov(l, p, C);
    return Vo(c, A, a), A;
  };
}
function p1(e) {
  if (e < c1)
    throw new Error("sqrt is not defined for small field");
  let t = e - Ce, n = 0;
  for (; t % yt === Ae; )
    t /= yt, n++;
  let r = yt;
  const o = ir(e);
  for (; Vi(o, r) === 1; )
    if (r++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (n === 1)
    return f1;
  let i = o.pow(r, t);
  const s = (t + Ce) / yt;
  return function(a, l) {
    if (a.is0(l))
      return l;
    if (Vi(a, l) !== 1)
      throw new Error("Cannot find square root");
    let p = n, u = a.mul(a.ONE, i), y = a.pow(l, t), w = a.pow(l, s);
    for (; !a.eql(y, a.ONE); ) {
      if (a.is0(y))
        return a.ZERO;
      let b = 1, C = a.sqr(y);
      for (; !a.eql(C, a.ONE); )
        if (b++, C = a.sqr(C), b === p)
          throw new Error("Cannot find square root");
      const A = Ce << BigInt(p - b - 1), k = a.pow(u, A);
      p = b, u = a.sqr(k), y = a.mul(y, u), w = a.mul(w, k);
    }
    return w;
  };
}
function z2(e) {
  return e % l1 === c1 ? f1 : e % u1 === d1 ? G2 : e % h1 === V2 ? j2(e) : p1(e);
}
const q2 = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function K2(e) {
  const t = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  }, n = q2.reduce((r, o) => (r[o] = "function", r), t);
  return Fo(e, n), e;
}
function Q2(e, t, n) {
  if (n < Ae)
    throw new Error("invalid exponent, negatives unsupported");
  if (n === Ae)
    return e.ONE;
  if (n === Ce)
    return t;
  let r = e.ONE, o = t;
  for (; n > Ae; )
    n & Ce && (r = e.mul(r, o)), o = e.sqr(o), n >>= Ce;
  return r;
}
function g1(e, t, n = !1) {
  const r = new Array(t.length).fill(n ? e.ZERO : void 0), o = t.reduce((s, c, a) => e.is0(c) ? s : (r[a] = s, e.mul(s, c)), e.ONE), i = e.inv(o);
  return t.reduceRight((s, c, a) => e.is0(c) ? s : (r[a] = e.mul(s, r[a]), e.mul(s, c)), i), r;
}
function Vi(e, t) {
  const n = (e.ORDER - Ce) / yt, r = e.pow(t, n), o = e.eql(r, e.ONE), i = e.eql(r, e.ZERO), s = e.eql(r, e.neg(e.ONE));
  if (!o && !i && !s)
    throw new Error("invalid Legendre symbol result");
  return o ? 1 : i ? 0 : -1;
}
function J2(e, t) {
  t !== void 0 && ct(t);
  const n = t !== void 0 ? t : e.toString(2).length, r = Math.ceil(n / 8);
  return { nBitLength: n, nByteLength: r };
}
class Y2 {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = Ae;
  ONE = Ce;
  _lengths;
  _sqrt;
  // cached sqrt
  _mod;
  constructor(t, n = {}) {
    if (t <= Ae)
      throw new Error("invalid field: expected ORDER > 0, got " + t);
    let r;
    this.isLE = !1, n != null && typeof n == "object" && (typeof n.BITS == "number" && (r = n.BITS), typeof n.sqrt == "function" && (this.sqrt = n.sqrt), typeof n.isLE == "boolean" && (this.isLE = n.isLE), n.allowedLengths && (this._lengths = n.allowedLengths?.slice()), typeof n.modFromBytes == "boolean" && (this._mod = n.modFromBytes));
    const { nBitLength: o, nByteLength: i } = J2(t, r);
    if (i > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = t, this.BITS = o, this.BYTES = i, this._sqrt = void 0, Object.preventExtensions(this);
  }
  create(t) {
    return $e(t, this.ORDER);
  }
  isValid(t) {
    if (typeof t != "bigint")
      throw new Error("invalid field element: expected bigint, got " + typeof t);
    return Ae <= t && t < this.ORDER;
  }
  is0(t) {
    return t === Ae;
  }
  // is valid and invertible
  isValidNot0(t) {
    return !this.is0(t) && this.isValid(t);
  }
  isOdd(t) {
    return (t & Ce) === Ce;
  }
  neg(t) {
    return $e(-t, this.ORDER);
  }
  eql(t, n) {
    return t === n;
  }
  sqr(t) {
    return $e(t * t, this.ORDER);
  }
  add(t, n) {
    return $e(t + n, this.ORDER);
  }
  sub(t, n) {
    return $e(t - n, this.ORDER);
  }
  mul(t, n) {
    return $e(t * n, this.ORDER);
  }
  pow(t, n) {
    return Q2(this, t, n);
  }
  div(t, n) {
    return $e(t * Fi(n, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(t) {
    return t * t;
  }
  addN(t, n) {
    return t + n;
  }
  subN(t, n) {
    return t - n;
  }
  mulN(t, n) {
    return t * n;
  }
  inv(t) {
    return Fi(t, this.ORDER);
  }
  sqrt(t) {
    return this._sqrt || (this._sqrt = z2(this.ORDER)), this._sqrt(this, t);
  }
  toBytes(t) {
    return this.isLE ? a1(t, this.BYTES) : Wo(t, this.BYTES);
  }
  fromBytes(t, n = !1) {
    oe(t);
    const { _lengths: r, BYTES: o, isLE: i, ORDER: s, _mod: c } = this;
    if (r) {
      if (!r.includes(t.length) || t.length > o)
        throw new Error("Field.fromBytes: expected " + r + " bytes, got " + t.length);
      const l = new Uint8Array(o);
      l.set(t, i ? 0 : l.length - t.length), t = l;
    }
    if (t.length !== o)
      throw new Error("Field.fromBytes: expected " + o + " bytes, got " + t.length);
    let a = i ? s1(t) : yn(t);
    if (c && (a = $e(a, s)), !n && !this.isValid(a))
      throw new Error("invalid field element: outside of range 0..ORDER");
    return a;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(t) {
    return g1(this, t);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(t, n, r) {
    return r ? n : t;
  }
}
function ir(e, t = {}) {
  return new Y2(e, t);
}
function w1(e) {
  if (typeof e != "bigint")
    throw new Error("field order must be bigint");
  const t = e.toString(2).length;
  return Math.ceil(t / 8);
}
function m1(e) {
  const t = w1(e);
  return t + Math.ceil(t / 2);
}
function y1(e, t, n = !1) {
  oe(e);
  const r = e.length, o = w1(t), i = m1(t);
  if (r < 16 || r < i || r > 1024)
    throw new Error("expected " + i + "-1024 bytes of input, got " + r);
  const s = n ? s1(e) : yn(e), c = $e(s, t - Ce) + Ce;
  return n ? a1(c, o) : Wo(c, o);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Ht = /* @__PURE__ */ BigInt(0), bt = /* @__PURE__ */ BigInt(1);
function Gn(e, t) {
  const n = t.negate();
  return e ? n : t;
}
function Gi(e, t) {
  const n = g1(e.Fp, t.map((r) => r.Z));
  return t.map((r, o) => e.fromAffine(r.toAffine(n[o])));
}
function b1(e, t) {
  if (!Number.isSafeInteger(e) || e <= 0 || e > t)
    throw new Error("invalid window size, expected [1.." + t + "], got W=" + e);
}
function xr(e, t) {
  b1(e, t);
  const n = Math.ceil(t / e) + 1, r = 2 ** (e - 1), o = 2 ** e, i = Do(e), s = BigInt(e);
  return { windows: n, windowSize: r, mask: i, maxNumber: o, shiftBy: s };
}
function ji(e, t, n) {
  const { windowSize: r, mask: o, maxNumber: i, shiftBy: s } = n;
  let c = Number(e & o), a = e >> s;
  c > r && (c -= i, a += bt);
  const l = t * r, p = l + Math.abs(c) - 1, u = c === 0, y = c < 0, w = t % 2 !== 0;
  return { nextN: a, offset: p, isZero: u, isNeg: y, isNegF: w, offsetF: l };
}
const Er = /* @__PURE__ */ new WeakMap(), v1 = /* @__PURE__ */ new WeakMap();
function Ar(e) {
  return v1.get(e) || 1;
}
function zi(e) {
  if (e !== Ht)
    throw new Error("invalid wNAF");
}
class X2 {
  BASE;
  ZERO;
  Fn;
  bits;
  // Parametrized with a given Point class (not individual point)
  constructor(t, n) {
    this.BASE = t.BASE, this.ZERO = t.ZERO, this.Fn = t.Fn, this.bits = n;
  }
  // non-const time multiplication ladder
  _unsafeLadder(t, n, r = this.ZERO) {
    let o = t;
    for (; n > Ht; )
      n & bt && (r = r.add(o)), o = o.double(), n >>= bt;
    return r;
  }
  /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point Point instance
   * @param W window size
   * @returns precomputed point tables flattened to a single array
   */
  precomputeWindow(t, n) {
    const { windows: r, windowSize: o } = xr(n, this.bits), i = [];
    let s = t, c = s;
    for (let a = 0; a < r; a++) {
      c = s, i.push(c);
      for (let l = 1; l < o; l++)
        c = c.add(s), i.push(c);
      s = c.double();
    }
    return i;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(t, n, r) {
    if (!this.Fn.isValid(r))
      throw new Error("invalid scalar");
    let o = this.ZERO, i = this.BASE;
    const s = xr(t, this.bits);
    for (let c = 0; c < s.windows; c++) {
      const { nextN: a, offset: l, isZero: p, isNeg: u, isNegF: y, offsetF: w } = ji(r, c, s);
      r = a, p ? i = i.add(Gn(y, n[w])) : o = o.add(Gn(u, n[l]));
    }
    return zi(r), { p: o, f: i };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(t, n, r, o = this.ZERO) {
    const i = xr(t, this.bits);
    for (let s = 0; s < i.windows && r !== Ht; s++) {
      const { nextN: c, offset: a, isZero: l, isNeg: p } = ji(r, s, i);
      if (r = c, !l) {
        const u = n[a];
        o = o.add(p ? u.negate() : u);
      }
    }
    return zi(r), o;
  }
  getPrecomputes(t, n, r) {
    let o = Er.get(n);
    return o || (o = this.precomputeWindow(n, t), t !== 1 && (typeof r == "function" && (o = r(o)), Er.set(n, o))), o;
  }
  cached(t, n, r) {
    const o = Ar(t);
    return this.wNAF(o, this.getPrecomputes(o, t, r), n);
  }
  unsafe(t, n, r, o) {
    const i = Ar(t);
    return i === 1 ? this._unsafeLadder(t, n, o) : this.wNAFUnsafe(i, this.getPrecomputes(i, t, r), n, o);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(t, n) {
    b1(n, this.bits), v1.set(t, n), Er.delete(t);
  }
  hasCache(t) {
    return Ar(t) !== 1;
  }
}
function ed(e, t, n, r) {
  let o = t, i = e.ZERO, s = e.ZERO;
  for (; n > Ht || r > Ht; )
    n & bt && (i = i.add(o)), r & bt && (s = s.add(o)), o = o.double(), n >>= bt, r >>= bt;
  return { p1: i, p2: s };
}
function qi(e, t, n) {
  if (t) {
    if (t.ORDER !== e)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return K2(t), t;
  } else
    return ir(e, { isLE: n });
}
function td(e, t, n = {}, r) {
  if (r === void 0 && (r = e === "edwards"), !t || typeof t != "object")
    throw new Error(`expected valid ${e} CURVE object`);
  for (const a of ["p", "n", "h"]) {
    const l = t[a];
    if (!(typeof l == "bigint" && l > Ht))
      throw new Error(`CURVE.${a} must be positive bigint`);
  }
  const o = qi(t.p, n.Fp, r), i = qi(t.n, n.Fn, r), c = ["Gx", "Gy", "a", "b"];
  for (const a of c)
    if (!o.isValid(t[a]))
      throw new Error(`CURVE.${a} must be valid field element of CURVE.Fp`);
  return t = Object.freeze(Object.assign({}, t)), { CURVE: t, Fp: o, Fn: i };
}
function C1(e, t) {
  return function(r) {
    const o = e(r);
    return { secretKey: o, publicKey: t(o) };
  };
}
class x1 {
  oHash;
  iHash;
  blockLen;
  outputLen;
  finished = !1;
  destroyed = !1;
  constructor(t, n) {
    if (or(t), oe(n, void 0, "key"), this.iHash = t.create(), typeof this.iHash.update != "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
    const r = this.blockLen, o = new Uint8Array(r);
    o.set(n.length > r ? t.create().update(n).digest() : n);
    for (let i = 0; i < o.length; i++)
      o[i] ^= 54;
    this.iHash.update(o), this.oHash = t.create();
    for (let i = 0; i < o.length; i++)
      o[i] ^= 106;
    this.oHash.update(o), ln(o);
  }
  update(t) {
    return Fn(this), this.iHash.update(t), this;
  }
  digestInto(t) {
    Fn(this), oe(t, this.outputLen, "output"), this.finished = !0, this.iHash.digestInto(t), this.oHash.update(t), this.oHash.digestInto(t), this.destroy();
  }
  digest() {
    const t = new Uint8Array(this.oHash.outputLen);
    return this.digestInto(t), t;
  }
  _cloneInto(t) {
    t ||= Object.create(Object.getPrototypeOf(this), {});
    const { oHash: n, iHash: r, finished: o, destroyed: i, blockLen: s, outputLen: c } = this;
    return t = t, t.finished = o, t.destroyed = i, t.blockLen = s, t.outputLen = c, t.oHash = n._cloneInto(t.oHash), t.iHash = r._cloneInto(t.iHash), t;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = !0, this.oHash.destroy(), this.iHash.destroy();
  }
}
const bn = (e, t, n) => new x1(e, t).update(n).digest();
bn.create = (e, t) => new x1(e, t);
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Ki = (e, t) => (e + (e >= 0 ? t : -t) / E1) / t;
function nd(e, t, n) {
  const [[r, o], [i, s]] = t, c = Ki(s * e, n), a = Ki(-o * e, n);
  let l = e - c * r - a * i, p = -c * o - a * s;
  const u = l < Ge, y = p < Ge;
  u && (l = -l), y && (p = -p);
  const w = Do(Math.ceil(W2(n) / 2)) + Ut;
  if (l < Ge || l >= w || p < Ge || p >= w)
    throw new Error("splitScalar (endomorphism): failed, k=" + e);
  return { k1neg: u, k1: l, k2neg: y, k2: p };
}
function lo(e) {
  if (!["compact", "recovered", "der"].includes(e))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return e;
}
function kr(e, t) {
  const n = {};
  for (let r of Object.keys(t))
    n[r] = e[r] === void 0 ? t[r] : e[r];
  return Vn(n.lowS, "lowS"), Vn(n.prehash, "prehash"), n.format !== void 0 && lo(n.format), n;
}
class rd extends Error {
  constructor(t = "") {
    super(t);
  }
}
const tt = {
  // asn.1 DER encoding utils
  Err: rd,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (e, t) => {
      const { Err: n } = tt;
      if (e < 0 || e > 256)
        throw new n("tlv.encode: wrong tag");
      if (t.length & 1)
        throw new n("tlv.encode: unpadded data");
      const r = t.length / 2, o = xn(r);
      if (o.length / 2 & 128)
        throw new n("tlv.encode: long form length too big");
      const i = r > 127 ? xn(o.length / 2 | 128) : "";
      return xn(e) + i + o + t;
    },
    // v - value, l - left bytes (unparsed)
    decode(e, t) {
      const { Err: n } = tt;
      let r = 0;
      if (e < 0 || e > 256)
        throw new n("tlv.encode: wrong tag");
      if (t.length < 2 || t[r++] !== e)
        throw new n("tlv.decode: wrong tlv");
      const o = t[r++], i = !!(o & 128);
      let s = 0;
      if (!i)
        s = o;
      else {
        const a = o & 127;
        if (!a)
          throw new n("tlv.decode(long): indefinite length not supported");
        if (a > 4)
          throw new n("tlv.decode(long): byte length is too big");
        const l = t.subarray(r, r + a);
        if (l.length !== a)
          throw new n("tlv.decode: length bytes not complete");
        if (l[0] === 0)
          throw new n("tlv.decode(long): zero leftmost byte");
        for (const p of l)
          s = s << 8 | p;
        if (r += a, s < 128)
          throw new n("tlv.decode(long): not minimal encoding");
      }
      const c = t.subarray(r, r + s);
      if (c.length !== s)
        throw new n("tlv.decode: wrong value length");
      return { v: c, l: t.subarray(r + s) };
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode(e) {
      const { Err: t } = tt;
      if (e < Ge)
        throw new t("integer: negative integers are not allowed");
      let n = xn(e);
      if (Number.parseInt(n[0], 16) & 8 && (n = "00" + n), n.length & 1)
        throw new t("unexpected DER parsing assertion: unpadded hex");
      return n;
    },
    decode(e) {
      const { Err: t } = tt;
      if (e[0] & 128)
        throw new t("invalid signature integer: negative");
      if (e[0] === 0 && !(e[1] & 128))
        throw new t("invalid signature integer: unnecessary leading zero");
      return yn(e);
    }
  },
  toSig(e) {
    const { Err: t, _int: n, _tlv: r } = tt, o = oe(e, void 0, "signature"), { v: i, l: s } = r.decode(48, o);
    if (s.length)
      throw new t("invalid signature: left bytes after parsing");
    const { v: c, l: a } = r.decode(2, i), { v: l, l: p } = r.decode(2, a);
    if (p.length)
      throw new t("invalid signature: left bytes after parsing");
    return { r: n.decode(c), s: n.decode(l) };
  },
  hexFromSig(e) {
    const { _tlv: t, _int: n } = tt, r = t.encode(2, n.encode(e.r)), o = t.encode(2, n.encode(e.s)), i = r + o;
    return t.encode(48, i);
  }
}, Ge = BigInt(0), Ut = BigInt(1), E1 = BigInt(2), En = BigInt(3), od = BigInt(4);
function id(e, t = {}) {
  const n = td("weierstrass", e, t), { Fp: r, Fn: o } = n;
  let i = n.CURVE;
  const { h: s, n: c } = i;
  Fo(t, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object"
  });
  const { endo: a } = t;
  if (a && (!r.is0(i.a) || typeof a.beta != "bigint" || !Array.isArray(a.basises)))
    throw new Error('invalid endo: expected "beta": bigint and "basises": array');
  const l = k1(r, o);
  function p() {
    if (!r.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function u(f, d, m) {
    const { x: g, y: v } = d.toAffine(), x = r.toBytes(g);
    if (Vn(m, "isCompressed"), m) {
      p();
      const U = !r.isOdd(v);
      return Ee(A1(U), x);
    } else
      return Ee(Uint8Array.of(4), x, r.toBytes(v));
  }
  function y(f) {
    oe(f, void 0, "Point");
    const { publicKey: d, publicKeyUncompressed: m } = l, g = f.length, v = f[0], x = f.subarray(1);
    if (g === d && (v === 2 || v === 3)) {
      const U = r.fromBytes(x);
      if (!r.isValid(U))
        throw new Error("bad point: is not on curve, wrong x");
      const L = C(U);
      let N;
      try {
        N = r.sqrt(L);
      } catch (j) {
        const G = j instanceof Error ? ": " + j.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + G);
      }
      p();
      const E = r.isOdd(N);
      return (v & 1) === 1 !== E && (N = r.neg(N)), { x: U, y: N };
    } else if (g === m && v === 4) {
      const U = r.BYTES, L = r.fromBytes(x.subarray(0, U)), N = r.fromBytes(x.subarray(U, U * 2));
      if (!A(L, N))
        throw new Error("bad point: is not on curve");
      return { x: L, y: N };
    } else
      throw new Error(`bad point: got length ${g}, expected compressed=${d} or uncompressed=${m}`);
  }
  const w = t.toBytes || u, b = t.fromBytes || y;
  function C(f) {
    const d = r.sqr(f), m = r.mul(d, f);
    return r.add(r.add(m, r.mul(f, i.a)), i.b);
  }
  function A(f, d) {
    const m = r.sqr(d), g = C(f);
    return r.eql(m, g);
  }
  if (!A(i.Gx, i.Gy))
    throw new Error("bad curve params: generator point");
  const k = r.mul(r.pow(i.a, En), od), _ = r.mul(r.sqr(i.b), BigInt(27));
  if (r.is0(r.add(k, _)))
    throw new Error("bad curve params: a or b");
  function F(f, d, m = !1) {
    if (!r.isValid(d) || m && r.is0(d))
      throw new Error(`bad point coordinate ${f}`);
    return d;
  }
  function V(f) {
    if (!(f instanceof $))
      throw new Error("Weierstrass Point expected");
  }
  function S(f) {
    if (!a || !a.basises)
      throw new Error("no endo");
    return nd(f, a.basises, o.ORDER);
  }
  const M = Di((f, d) => {
    const { X: m, Y: g, Z: v } = f;
    if (r.eql(v, r.ONE))
      return { x: m, y: g };
    const x = f.is0();
    d == null && (d = x ? r.ONE : r.inv(v));
    const U = r.mul(m, d), L = r.mul(g, d), N = r.mul(v, d);
    if (x)
      return { x: r.ZERO, y: r.ZERO };
    if (!r.eql(N, r.ONE))
      throw new Error("invZ was invalid");
    return { x: U, y: L };
  }), R = Di((f) => {
    if (f.is0()) {
      if (t.allowInfinityPoint && !r.is0(f.Y))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x: d, y: m } = f.toAffine();
    if (!r.isValid(d) || !r.isValid(m))
      throw new Error("bad point: x or y not field elements");
    if (!A(d, m))
      throw new Error("bad point: equation left != right");
    if (!f.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return !0;
  });
  function D(f, d, m, g, v) {
    return m = new $(r.mul(m.X, f), m.Y, m.Z), d = Gn(g, d), m = Gn(v, m), d.add(m);
  }
  class $ {
    // base / generator point
    static BASE = new $(i.Gx, i.Gy, r.ONE);
    // zero / infinity / identity point
    static ZERO = new $(r.ZERO, r.ONE, r.ZERO);
    // 0, 1, 0
    // math field
    static Fp = r;
    // scalar field
    static Fn = o;
    X;
    Y;
    Z;
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(d, m, g) {
      this.X = F("x", d), this.Y = F("y", m, !0), this.Z = F("z", g), Object.freeze(this);
    }
    static CURVE() {
      return i;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(d) {
      const { x: m, y: g } = d || {};
      if (!d || !r.isValid(m) || !r.isValid(g))
        throw new Error("invalid affine point");
      if (d instanceof $)
        throw new Error("projective point not allowed");
      return r.is0(m) && r.is0(g) ? $.ZERO : new $(m, g, r.ONE);
    }
    static fromBytes(d) {
      const m = $.fromAffine(b(oe(d, void 0, "point")));
      return m.assertValidity(), m;
    }
    static fromHex(d) {
      return $.fromBytes(ne(d));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     *
     * @param windowSize
     * @param isLazy true will defer table computation until the first multiplication
     * @returns
     */
    precompute(d = 8, m = !0) {
      return h.createCache(this, d), m || this.multiply(En), this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      R(this);
    }
    hasEvenY() {
      const { y: d } = this.toAffine();
      if (!r.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !r.isOdd(d);
    }
    /** Compare one point to another. */
    equals(d) {
      V(d);
      const { X: m, Y: g, Z: v } = this, { X: x, Y: U, Z: L } = d, N = r.eql(r.mul(m, L), r.mul(x, v)), E = r.eql(r.mul(g, L), r.mul(U, v));
      return N && E;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new $(this.X, r.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a: d, b: m } = i, g = r.mul(m, En), { X: v, Y: x, Z: U } = this;
      let L = r.ZERO, N = r.ZERO, E = r.ZERO, B = r.mul(v, v), j = r.mul(x, x), G = r.mul(U, U), H = r.mul(v, x);
      return H = r.add(H, H), E = r.mul(v, U), E = r.add(E, E), L = r.mul(d, E), N = r.mul(g, G), N = r.add(L, N), L = r.sub(j, N), N = r.add(j, N), N = r.mul(L, N), L = r.mul(H, L), E = r.mul(g, E), G = r.mul(d, G), H = r.sub(B, G), H = r.mul(d, H), H = r.add(H, E), E = r.add(B, B), B = r.add(E, B), B = r.add(B, G), B = r.mul(B, H), N = r.add(N, B), G = r.mul(x, U), G = r.add(G, G), B = r.mul(G, H), L = r.sub(L, B), E = r.mul(G, j), E = r.add(E, E), E = r.add(E, E), new $(L, N, E);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(d) {
      V(d);
      const { X: m, Y: g, Z: v } = this, { X: x, Y: U, Z: L } = d;
      let N = r.ZERO, E = r.ZERO, B = r.ZERO;
      const j = i.a, G = r.mul(i.b, En);
      let H = r.mul(m, x), z = r.mul(g, U), Q = r.mul(v, L), le = r.add(m, g), ce = r.add(x, U);
      le = r.mul(le, ce), ce = r.add(H, z), le = r.sub(le, ce), ce = r.add(m, v);
      let me = r.add(x, L);
      return ce = r.mul(ce, me), me = r.add(H, Q), ce = r.sub(ce, me), me = r.add(g, v), N = r.add(U, L), me = r.mul(me, N), N = r.add(z, Q), me = r.sub(me, N), B = r.mul(j, ce), N = r.mul(G, Q), B = r.add(N, B), N = r.sub(z, B), B = r.add(z, B), E = r.mul(N, B), z = r.add(H, H), z = r.add(z, H), Q = r.mul(j, Q), ce = r.mul(G, ce), z = r.add(z, Q), Q = r.sub(H, Q), Q = r.mul(j, Q), ce = r.add(ce, Q), H = r.mul(z, ce), E = r.add(E, H), H = r.mul(me, ce), N = r.mul(le, N), N = r.sub(N, H), H = r.mul(le, z), B = r.mul(me, B), B = r.add(B, H), new $(N, E, B);
    }
    subtract(d) {
      return this.add(d.negate());
    }
    is0() {
      return this.equals($.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(d) {
      const { endo: m } = t;
      if (!o.isValidNot0(d))
        throw new Error("invalid scalar: out of range");
      let g, v;
      const x = (U) => h.cached(this, U, (L) => Gi($, L));
      if (m) {
        const { k1neg: U, k1: L, k2neg: N, k2: E } = S(d), { p: B, f: j } = x(L), { p: G, f: H } = x(E);
        v = j.add(H), g = D(m.beta, B, G, U, N);
      } else {
        const { p: U, f: L } = x(d);
        g = U, v = L;
      }
      return Gi($, [g, v])[0];
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(d) {
      const { endo: m } = t, g = this;
      if (!o.isValid(d))
        throw new Error("invalid scalar: out of range");
      if (d === Ge || g.is0())
        return $.ZERO;
      if (d === Ut)
        return g;
      if (h.hasCache(this))
        return this.multiply(d);
      if (m) {
        const { k1neg: v, k1: x, k2neg: U, k2: L } = S(d), { p1: N, p2: E } = ed($, g, x, L);
        return D(m.beta, N, E, v, U);
      } else
        return h.unsafe(g, d);
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(d) {
      return M(this, d);
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      const { isTorsionFree: d } = t;
      return s === Ut ? !0 : d ? d($, this) : h.unsafe(this, c).is0();
    }
    clearCofactor() {
      const { clearCofactor: d } = t;
      return s === Ut ? this : d ? d($, this) : this.multiplyUnsafe(s);
    }
    isSmallOrder() {
      return this.multiplyUnsafe(s).is0();
    }
    toBytes(d = !0) {
      return Vn(d, "isCompressed"), this.assertValidity(), w($, this, d);
    }
    toHex(d = !0) {
      return ie(this.toBytes(d));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const P = o.BITS, h = new X2($, t.endo ? Math.ceil(P / 2) : P);
  return $.BASE.precompute(8), $;
}
function A1(e) {
  return Uint8Array.of(e ? 2 : 3);
}
function k1(e, t) {
  return {
    secretKey: t.BYTES,
    publicKey: 1 + e.BYTES,
    publicKeyUncompressed: 1 + 2 * e.BYTES,
    publicKeyHasPrefix: !0,
    signature: 2 * t.BYTES
  };
}
function sd(e, t = {}) {
  const { Fn: n } = e, r = t.randomBytes || jt, o = Object.assign(k1(e.Fp, n), { seed: m1(n.ORDER) });
  function i(w) {
    try {
      const b = n.fromBytes(w);
      return n.isValidNot0(b);
    } catch {
      return !1;
    }
  }
  function s(w, b) {
    const { publicKey: C, publicKeyUncompressed: A } = o;
    try {
      const k = w.length;
      return b === !0 && k !== C || b === !1 && k !== A ? !1 : !!e.fromBytes(w);
    } catch {
      return !1;
    }
  }
  function c(w = r(o.seed)) {
    return y1(oe(w, o.seed, "seed"), n.ORDER);
  }
  function a(w, b = !0) {
    return e.BASE.multiply(n.fromBytes(w)).toBytes(b);
  }
  function l(w) {
    const { secretKey: b, publicKey: C, publicKeyUncompressed: A } = o;
    if (!Ho(w) || "_lengths" in n && n._lengths || b === C)
      return;
    const k = oe(w, void 0, "key").length;
    return k === C || k === A;
  }
  function p(w, b, C = !0) {
    if (l(w) === !0)
      throw new Error("first arg must be private key");
    if (l(b) === !1)
      throw new Error("second arg must be public key");
    const A = n.fromBytes(w);
    return e.fromBytes(b).multiply(A).toBytes(C);
  }
  const u = {
    isValidSecretKey: i,
    isValidPublicKey: s,
    randomSecretKey: c
  }, y = C1(c, a);
  return Object.freeze({ getPublicKey: a, getSharedSecret: p, keygen: y, Point: e, utils: u, lengths: o });
}
function ad(e, t, n = {}) {
  or(t), Fo(n, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  }), n = Object.assign({}, n);
  const r = n.randomBytes || jt, o = n.hmac || ((m, g) => bn(t, m, g)), { Fp: i, Fn: s } = e, { ORDER: c, BITS: a } = s, { keygen: l, getPublicKey: p, getSharedSecret: u, utils: y, lengths: w } = sd(e, n), b = {
    prehash: !0,
    lowS: typeof n.lowS == "boolean" ? n.lowS : !0,
    format: "compact",
    extraEntropy: !1
  }, C = c * E1 < i.ORDER;
  function A(m) {
    const g = c >> Ut;
    return m > g;
  }
  function k(m, g) {
    if (!s.isValidNot0(g))
      throw new Error(`invalid signature ${m}: out of range 1..Point.Fn.ORDER`);
    return g;
  }
  function _() {
    if (C)
      throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
  }
  function F(m, g) {
    lo(g);
    const v = w.signature, x = g === "compact" ? v : g === "recovered" ? v + 1 : void 0;
    return oe(m, x);
  }
  class V {
    r;
    s;
    recovery;
    constructor(g, v, x) {
      if (this.r = k("r", g), this.s = k("s", v), x != null) {
        if (_(), ![0, 1, 2, 3].includes(x))
          throw new Error("invalid recovery id");
        this.recovery = x;
      }
      Object.freeze(this);
    }
    static fromBytes(g, v = b.format) {
      F(g, v);
      let x;
      if (v === "der") {
        const { r: E, s: B } = tt.toSig(oe(g));
        return new V(E, B);
      }
      v === "recovered" && (x = g[0], v = "compact", g = g.subarray(1));
      const U = w.signature / 2, L = g.subarray(0, U), N = g.subarray(U, U * 2);
      return new V(s.fromBytes(L), s.fromBytes(N), x);
    }
    static fromHex(g, v) {
      return this.fromBytes(ne(g), v);
    }
    assertRecovery() {
      const { recovery: g } = this;
      if (g == null)
        throw new Error("invalid recovery id: must be present");
      return g;
    }
    addRecoveryBit(g) {
      return new V(this.r, this.s, g);
    }
    recoverPublicKey(g) {
      const { r: v, s: x } = this, U = this.assertRecovery(), L = U === 2 || U === 3 ? v + c : v;
      if (!i.isValid(L))
        throw new Error("invalid recovery id: sig.r+curve.n != R.x");
      const N = i.toBytes(L), E = e.fromBytes(Ee(A1((U & 1) === 0), N)), B = s.inv(L), j = M(oe(g, void 0, "msgHash")), G = s.create(-j * B), H = s.create(x * B), z = e.BASE.multiplyUnsafe(G).add(E.multiplyUnsafe(H));
      if (z.is0())
        throw new Error("invalid recovery: point at infinify");
      return z.assertValidity(), z;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return A(this.s);
    }
    toBytes(g = b.format) {
      if (lo(g), g === "der")
        return ne(tt.hexFromSig(this));
      const { r: v, s: x } = this, U = s.toBytes(v), L = s.toBytes(x);
      return g === "recovered" ? (_(), Ee(Uint8Array.of(this.assertRecovery()), U, L)) : Ee(U, L);
    }
    toHex(g) {
      return ie(this.toBytes(g));
    }
  }
  const S = n.bits2int || function(g) {
    if (g.length > 8192)
      throw new Error("input is too large");
    const v = yn(g), x = g.length * 8 - a;
    return x > 0 ? v >> BigInt(x) : v;
  }, M = n.bits2int_modN || function(g) {
    return s.create(S(g));
  }, R = Do(a);
  function D(m) {
    return Z2("num < 2^" + a, m, Ge, R), s.toBytes(m);
  }
  function $(m, g) {
    return oe(m, void 0, "message"), g ? oe(t(m), void 0, "prehashed message") : m;
  }
  function P(m, g, v) {
    const { lowS: x, prehash: U, extraEntropy: L } = kr(v, b);
    m = $(m, U);
    const N = M(m), E = s.fromBytes(g);
    if (!s.isValidNot0(E))
      throw new Error("invalid private key");
    const B = [D(E), D(N)];
    if (L != null && L !== !1) {
      const z = L === !0 ? r(w.secretKey) : L;
      B.push(oe(z, void 0, "extraEntropy"));
    }
    const j = Ee(...B), G = N;
    function H(z) {
      const Q = S(z);
      if (!s.isValidNot0(Q))
        return;
      const le = s.inv(Q), ce = e.BASE.multiply(Q).toAffine(), me = s.create(ce.x);
      if (me === Ge)
        return;
      const Cn = s.create(le * s.create(G + me * E));
      if (Cn === Ge)
        return;
      let Hi = (ce.x === me ? 0 : 2) | Number(ce.y & Ut), Zi = Cn;
      return x && A(Cn) && (Zi = s.neg(Cn), Hi ^= 1), new V(me, Zi, C ? void 0 : Hi);
    }
    return { seed: j, k2sig: H };
  }
  function h(m, g, v = {}) {
    const { seed: x, k2sig: U } = P(m, g, v);
    return D2(t.outputLen, s.BYTES, o)(x, U).toBytes(v.format);
  }
  function f(m, g, v, x = {}) {
    const { lowS: U, prehash: L, format: N } = kr(x, b);
    if (v = oe(v, void 0, "publicKey"), g = $(g, L), !Ho(m)) {
      const E = m instanceof V ? ", use sig.toBytes()" : "";
      throw new Error("verify expects Uint8Array signature" + E);
    }
    F(m, N);
    try {
      const E = V.fromBytes(m, N), B = e.fromBytes(v);
      if (U && E.hasHighS())
        return !1;
      const { r: j, s: G } = E, H = M(g), z = s.inv(G), Q = s.create(H * z), le = s.create(j * z), ce = e.BASE.multiplyUnsafe(Q).add(B.multiplyUnsafe(le));
      return ce.is0() ? !1 : s.create(ce.x) === j;
    } catch {
      return !1;
    }
  }
  function d(m, g, v = {}) {
    const { prehash: x } = kr(v, b);
    return g = $(g, x), V.fromBytes(m, "recovered").recoverPublicKey(g).toBytes();
  }
  return Object.freeze({
    keygen: l,
    getPublicKey: p,
    getSharedSecret: u,
    utils: y,
    lengths: w,
    Point: e,
    sign: h,
    verify: f,
    recoverPublicKey: d,
    Signature: V,
    hash: t
  });
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const sr = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: BigInt(1),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
  Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
}, cd = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  basises: [
    [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
    [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
  ]
}, ld = /* @__PURE__ */ BigInt(0), uo = /* @__PURE__ */ BigInt(2);
function dd(e) {
  const t = sr.p, n = BigInt(3), r = BigInt(6), o = BigInt(11), i = BigInt(22), s = BigInt(23), c = BigInt(44), a = BigInt(88), l = e * e * e % t, p = l * l * e % t, u = Le(p, n, t) * p % t, y = Le(u, n, t) * p % t, w = Le(y, uo, t) * l % t, b = Le(w, o, t) * w % t, C = Le(b, i, t) * b % t, A = Le(C, c, t) * C % t, k = Le(A, a, t) * A % t, _ = Le(k, c, t) * C % t, F = Le(_, n, t) * p % t, V = Le(F, s, t) * b % t, S = Le(V, r, t) * l % t, M = Le(S, uo, t);
  if (!jn.eql(jn.sqr(M), e))
    throw new Error("Cannot find square root");
  return M;
}
const jn = ir(sr.p, { sqrt: dd }), Lt = /* @__PURE__ */ id(sr, {
  Fp: jn,
  endo: cd
}), Go = /* @__PURE__ */ ad(Lt, He), Qi = {};
function zn(e, ...t) {
  let n = Qi[e];
  if (n === void 0) {
    const r = He(P2(e));
    n = Ee(r, r), Qi[e] = n;
  }
  return He(Ee(n, ...t));
}
const jo = (e) => e.toBytes(!0).slice(1), zo = (e) => e % uo === ld;
function ho(e) {
  const { Fn: t, BASE: n } = Lt, r = t.fromBytes(e), o = n.multiply(r);
  return { scalar: zo(o.y) ? r : t.neg(r), bytes: jo(o) };
}
function S1(e) {
  const t = jn;
  if (!t.isValidNot0(e))
    throw new Error("invalid x: Fail if x ≥ p");
  const n = t.create(e * e), r = t.create(n * e + BigInt(7));
  let o = t.sqrt(r);
  zo(o) || (o = t.neg(o));
  const i = Lt.fromAffine({ x: e, y: o });
  return i.assertValidity(), i;
}
const rn = yn;
function _1(...e) {
  return Lt.Fn.create(rn(zn("BIP0340/challenge", ...e)));
}
function Ji(e) {
  return ho(e).bytes;
}
function ud(e, t, n = jt(32)) {
  const { Fn: r } = Lt, o = oe(e, void 0, "message"), { bytes: i, scalar: s } = ho(t), c = oe(n, 32, "auxRand"), a = r.toBytes(s ^ rn(zn("BIP0340/aux", c))), l = zn("BIP0340/nonce", a, i, o), { bytes: p, scalar: u } = ho(l), y = _1(p, i, o), w = new Uint8Array(64);
  if (w.set(p, 0), w.set(r.toBytes(r.create(u + y * s)), 32), !L1(w, o, i))
    throw new Error("sign: Invalid signature produced");
  return w;
}
function L1(e, t, n) {
  const { Fp: r, Fn: o, BASE: i } = Lt, s = oe(e, 64, "signature"), c = oe(t, void 0, "message"), a = oe(n, 32, "publicKey");
  try {
    const l = S1(rn(a)), p = rn(s.subarray(0, 32));
    if (!r.isValidNot0(p))
      return !1;
    const u = rn(s.subarray(32, 64));
    if (!o.isValidNot0(u))
      return !1;
    const y = _1(o.toBytes(p), jo(l), c), w = i.multiplyUnsafe(u).add(l.multiplyUnsafe(o.neg(y))), { x: b, y: C } = w.toAffine();
    return !(w.is0() || !zo(C) || b !== p);
  } catch {
    return !1;
  }
}
const zt = /* @__PURE__ */ (() => {
  const n = (r = jt(48)) => y1(r, sr.n);
  return {
    keygen: C1(n, Ji),
    getPublicKey: Ji,
    sign: ud,
    verify: L1,
    Point: Lt,
    utils: {
      randomSecretKey: n,
      taggedHash: zn,
      lift_x: S1,
      pointToBytes: jo
    },
    lengths: {
      secretKey: 32,
      publicKey: 32,
      publicKeyHasPrefix: !1,
      signature: 64,
      seed: 48
    }
  };
})();
/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function qo(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function hd(e) {
  if (!qo(e))
    throw new Error("Uint8Array expected");
}
function T1(e, t) {
  return Array.isArray(t) ? t.length === 0 ? !0 : e ? t.every((n) => typeof n == "string") : t.every((n) => Number.isSafeInteger(n)) : !1;
}
function fd(e) {
  if (typeof e != "function")
    throw new Error("function expected");
  return !0;
}
function Et(e, t) {
  if (typeof t != "string")
    throw new Error(`${e}: string expected`);
  return !0;
}
function Ko(e) {
  if (!Number.isSafeInteger(e))
    throw new Error(`invalid integer: ${e}`);
}
function fo(e) {
  if (!Array.isArray(e))
    throw new Error("array expected");
}
function qn(e, t) {
  if (!T1(!0, t))
    throw new Error(`${e}: array of strings expected`);
}
function M1(e, t) {
  if (!T1(!1, t))
    throw new Error(`${e}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function R1(...e) {
  const t = (i) => i, n = (i, s) => (c) => i(s(c)), r = e.map((i) => i.encode).reduceRight(n, t), o = e.map((i) => i.decode).reduce(n, t);
  return { encode: r, decode: o };
}
// @__NO_SIDE_EFFECTS__
function $1(e) {
  const t = typeof e == "string" ? e.split("") : e, n = t.length;
  qn("alphabet", t);
  const r = new Map(t.map((o, i) => [o, i]));
  return {
    encode: (o) => (fo(o), o.map((i) => {
      if (!Number.isSafeInteger(i) || i < 0 || i >= n)
        throw new Error(`alphabet.encode: digit index outside alphabet "${i}". Allowed: ${e}`);
      return t[i];
    })),
    decode: (o) => (fo(o), o.map((i) => {
      Et("alphabet.decode", i);
      const s = r.get(i);
      if (s === void 0)
        throw new Error(`Unknown letter: "${i}". Allowed: ${e}`);
      return s;
    }))
  };
}
// @__NO_SIDE_EFFECTS__
function N1(e = "") {
  return Et("join", e), {
    encode: (t) => (qn("join.decode", t), t.join(e)),
    decode: (t) => (Et("join.decode", t), t.split(e))
  };
}
// @__NO_SIDE_EFFECTS__
function pd(e, t = "=") {
  return Ko(e), Et("padding", t), {
    encode(n) {
      for (qn("padding.encode", n); n.length * e % 8; )
        n.push(t);
      return n;
    },
    decode(n) {
      qn("padding.decode", n);
      let r = n.length;
      if (r * e % 8)
        throw new Error("padding: invalid, string should have whole number of bytes");
      for (; r > 0 && n[r - 1] === t; r--)
        if ((r - 1) * e % 8 === 0)
          throw new Error("padding: invalid, string has too much padding");
      return n.slice(0, r);
    }
  };
}
const B1 = (e, t) => t === 0 ? e : B1(t, e % t), Kn = /* @__NO_SIDE_EFFECTS__ */ (e, t) => e + (t - B1(e, t)), On = /* @__PURE__ */ (() => {
  let e = [];
  for (let t = 0; t < 40; t++)
    e.push(2 ** t);
  return e;
})();
function po(e, t, n, r) {
  if (fo(e), t <= 0 || t > 32)
    throw new Error(`convertRadix2: wrong from=${t}`);
  if (n <= 0 || n > 32)
    throw new Error(`convertRadix2: wrong to=${n}`);
  if (/* @__PURE__ */ Kn(t, n) > 32)
    throw new Error(`convertRadix2: carry overflow from=${t} to=${n} carryBits=${/* @__PURE__ */ Kn(t, n)}`);
  let o = 0, i = 0;
  const s = On[t], c = On[n] - 1, a = [];
  for (const l of e) {
    if (Ko(l), l >= s)
      throw new Error(`convertRadix2: invalid data word=${l} from=${t}`);
    if (o = o << t | l, i + t > 32)
      throw new Error(`convertRadix2: carry overflow pos=${i} from=${t}`);
    for (i += t; i >= n; i -= n)
      a.push((o >> i - n & c) >>> 0);
    const p = On[i];
    if (p === void 0)
      throw new Error("invalid carry");
    o &= p - 1;
  }
  if (o = o << n - i & c, !r && i >= t)
    throw new Error("Excess padding");
  if (!r && o > 0)
    throw new Error(`Non-zero padding: ${o}`);
  return r && i > 0 && a.push(o >>> 0), a;
}
// @__NO_SIDE_EFFECTS__
function U1(e, t = !1) {
  if (Ko(e), e <= 0 || e > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ Kn(8, e) > 32 || /* @__PURE__ */ Kn(e, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (n) => {
      if (!qo(n))
        throw new Error("radix2.encode input should be Uint8Array");
      return po(Array.from(n), 8, e, !t);
    },
    decode: (n) => (M1("radix2.decode", n), Uint8Array.from(po(n, e, 8, t)))
  };
}
function Yi(e) {
  return fd(e), function(...t) {
    try {
      return e.apply(null, t);
    } catch {
    }
  };
}
const gd = typeof Uint8Array.from([]).toBase64 == "function" && typeof Uint8Array.fromBase64 == "function", wd = (e, t) => {
  Et("base64", e);
  const n = /^[A-Za-z0-9=+/]+$/, r = "base64";
  if (e.length > 0 && !n.test(e))
    throw new Error("invalid base64");
  return Uint8Array.fromBase64(e, { alphabet: r, lastChunkHandling: "strict" });
}, lt = gd ? {
  encode(e) {
    return hd(e), e.toBase64();
  },
  decode(e) {
    return wd(e);
  }
} : /* @__PURE__ */ R1(/* @__PURE__ */ U1(6), /* @__PURE__ */ $1("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), /* @__PURE__ */ pd(6), /* @__PURE__ */ N1("")), go = /* @__PURE__ */ R1(/* @__PURE__ */ $1("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), /* @__PURE__ */ N1("")), Xi = [996825010, 642813549, 513874426, 1027748829, 705979059];
function qt(e) {
  const t = e >> 25;
  let n = (e & 33554431) << 5;
  for (let r = 0; r < Xi.length; r++)
    (t >> r & 1) === 1 && (n ^= Xi[r]);
  return n;
}
function es(e, t, n = 1) {
  const r = e.length;
  let o = 1;
  for (let i = 0; i < r; i++) {
    const s = e.charCodeAt(i);
    if (s < 33 || s > 126)
      throw new Error(`Invalid prefix (${e})`);
    o = qt(o) ^ s >> 5;
  }
  o = qt(o);
  for (let i = 0; i < r; i++)
    o = qt(o) ^ e.charCodeAt(i) & 31;
  for (let i of t)
    o = qt(o) ^ i;
  for (let i = 0; i < 6; i++)
    o = qt(o);
  return o ^= n, go.encode(po([o % On[30]], 30, 5, !1));
}
// @__NO_SIDE_EFFECTS__
function md(e) {
  const n = /* @__PURE__ */ U1(5), r = n.decode, o = n.encode, i = Yi(r);
  function s(u, y, w = 90) {
    Et("bech32.encode prefix", u), qo(y) && (y = Array.from(y)), M1("bech32.encode", y);
    const b = u.length;
    if (b === 0)
      throw new TypeError(`Invalid prefix length ${b}`);
    const C = b + 7 + y.length;
    if (w !== !1 && C > w)
      throw new TypeError(`Length ${C} exceeds limit ${w}`);
    const A = u.toLowerCase(), k = es(A, y, 1);
    return `${A}1${go.encode(y)}${k}`;
  }
  function c(u, y = 90) {
    Et("bech32.decode input", u);
    const w = u.length;
    if (w < 8 || y !== !1 && w > y)
      throw new TypeError(`invalid string length: ${w} (${u}). Expected (8..${y})`);
    const b = u.toLowerCase();
    if (u !== b && u !== u.toUpperCase())
      throw new Error("String must be lowercase or uppercase");
    const C = b.lastIndexOf("1");
    if (C === 0 || C === -1)
      throw new Error('Letter "1" must be present between prefix and data only');
    const A = b.slice(0, C), k = b.slice(C + 1);
    if (k.length < 6)
      throw new Error("Data must be at least 6 characters long");
    const _ = go.decode(k).slice(0, -6), F = es(A, _, 1);
    if (!k.endsWith(F))
      throw new Error(`Invalid checksum in ${u}: expected "${F}"`);
    return { prefix: A, words: _ };
  }
  const a = Yi(c);
  function l(u) {
    const { prefix: y, words: w } = c(u, !1);
    return { prefix: y, words: w, bytes: r(w) };
  }
  function p(u, y) {
    return s(u, o(y));
  }
  return {
    encode: s,
    decode: c,
    encodeFromBytes: p,
    decodeToBytes: l,
    decodeUnsafe: a,
    fromWords: r,
    fromWordsUnsafe: i,
    toWords: o
  };
}
const Zt = /* @__PURE__ */ md();
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function yd(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function ts(e) {
  if (typeof e != "boolean")
    throw new Error(`boolean expected, not ${e}`);
}
function Sr(e) {
  if (!Number.isSafeInteger(e) || e < 0)
    throw new Error("positive integer expected, got " + e);
}
function xe(e, t, n = "") {
  const r = yd(e), o = e?.length, i = t !== void 0;
  if (!r || i && o !== t) {
    const s = n && `"${n}" `, c = i ? ` of length ${t}` : "", a = r ? `length=${o}` : `type=${typeof e}`;
    throw new Error(s + "expected Uint8Array" + c + ", got " + a);
  }
  return e;
}
function be(e) {
  return new Uint32Array(e.buffer, e.byteOffset, Math.floor(e.byteLength / 4));
}
function Wt(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
const bd = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
function vd(e, t) {
  return e.buffer === t.buffer && // best we can do, may fail with an obscure Proxy
  e.byteOffset < t.byteOffset + t.byteLength && // a starts before b end
  t.byteOffset < e.byteOffset + e.byteLength;
}
function I1(e, t) {
  if (vd(e, t) && e.byteOffset < t.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function Cd(e, t) {
  if (t == null || typeof t != "object")
    throw new Error("options must be defined");
  return Object.assign(e, t);
}
function xd(e, t) {
  if (e.length !== t.length)
    return !1;
  let n = 0;
  for (let r = 0; r < e.length; r++)
    n |= e[r] ^ t[r];
  return n === 0;
}
const Ed = /* @__NO_SIDE_EFFECTS__ */ (e, t) => {
  function n(r, ...o) {
    if (xe(r, void 0, "key"), !bd)
      throw new Error("Non little-endian hardware is not yet supported");
    if (e.nonceLength !== void 0) {
      const p = o[0];
      xe(p, e.varSizeNonce ? void 0 : e.nonceLength, "nonce");
    }
    const i = e.tagLength;
    i && o[1] !== void 0 && xe(o[1], void 0, "AAD");
    const s = t(r, ...o), c = (p, u) => {
      if (u !== void 0) {
        if (p !== 2)
          throw new Error("cipher output not supported");
        xe(u, void 0, "output");
      }
    };
    let a = !1;
    return {
      encrypt(p, u) {
        if (a)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return a = !0, xe(p), c(s.encrypt.length, u), s.encrypt(p, u);
      },
      decrypt(p, u) {
        if (xe(p), i && p.length < i)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + i);
        return c(s.decrypt.length, u), s.decrypt(p, u);
      }
    };
  }
  return Object.assign(n, e), n;
};
function O1(e, t, n = !0) {
  if (t === void 0)
    return new Uint8Array(e);
  if (t.length !== e)
    throw new Error('"output" expected Uint8Array of length ' + e + ", got: " + t.length);
  if (n && !It(t))
    throw new Error("invalid output, must be aligned");
  return t;
}
function It(e) {
  return e.byteOffset % 4 === 0;
}
function xt(e) {
  return Uint8Array.from(e);
}
const at = 16, Ad = 283;
function kd(e) {
  if (![16, 24, 32].includes(e.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + e.length);
}
function Qo(e) {
  return e << 1 ^ Ad & -(e >> 7);
}
function Bt(e, t) {
  let n = 0;
  for (; t > 0; t >>= 1)
    n ^= e & -(t & 1), e = Qo(e);
  return n;
}
const wo = /* @__PURE__ */ (() => {
  const e = new Uint8Array(256);
  for (let n = 0, r = 1; n < 256; n++, r ^= Qo(r))
    e[n] = r;
  const t = new Uint8Array(256);
  t[0] = 99;
  for (let n = 0; n < 255; n++) {
    let r = e[255 - n];
    r |= r << 8, t[e[n]] = (r ^ r >> 4 ^ r >> 5 ^ r >> 6 ^ r >> 7 ^ 99) & 255;
  }
  return Wt(e), t;
})(), Sd = /* @__PURE__ */ wo.map((e, t) => wo.indexOf(t)), _d = (e) => e << 24 | e >>> 8, _r = (e) => e << 8 | e >>> 24;
function P1(e, t) {
  if (e.length !== 256)
    throw new Error("Wrong sbox length");
  const n = new Uint32Array(256).map((l, p) => t(e[p])), r = n.map(_r), o = r.map(_r), i = o.map(_r), s = new Uint32Array(256 * 256), c = new Uint32Array(256 * 256), a = new Uint16Array(256 * 256);
  for (let l = 0; l < 256; l++)
    for (let p = 0; p < 256; p++) {
      const u = l * 256 + p;
      s[u] = n[l] ^ r[p], c[u] = o[l] ^ i[p], a[u] = e[l] << 8 | e[p];
    }
  return { sbox: e, sbox2: a, T0: n, T1: r, T2: o, T3: i, T01: s, T23: c };
}
const Jo = /* @__PURE__ */ P1(wo, (e) => Bt(e, 3) << 24 | e << 16 | e << 8 | Bt(e, 2)), H1 = /* @__PURE__ */ P1(Sd, (e) => Bt(e, 11) << 24 | Bt(e, 13) << 16 | Bt(e, 9) << 8 | Bt(e, 14)), Ld = /* @__PURE__ */ (() => {
  const e = new Uint8Array(16);
  for (let t = 0, n = 1; t < 16; t++, n = Qo(n))
    e[t] = n;
  return e;
})();
function Z1(e) {
  xe(e);
  const t = e.length;
  kd(e);
  const { sbox2: n } = Jo, r = [];
  It(e) || r.push(e = xt(e));
  const o = be(e), i = o.length, s = (a) => Oe(n, a, a, a, a), c = new Uint32Array(t + 28);
  c.set(o);
  for (let a = i; a < c.length; a++) {
    let l = c[a - 1];
    a % i === 0 ? l = s(_d(l)) ^ Ld[a / i - 1] : i > 6 && a % i === 4 && (l = s(l)), c[a] = c[a - i] ^ l;
  }
  return Wt(...r), c;
}
function Td(e) {
  const t = Z1(e), n = t.slice(), r = t.length, { sbox2: o } = Jo, { T0: i, T1: s, T2: c, T3: a } = H1;
  for (let l = 0; l < r; l += 4)
    for (let p = 0; p < 4; p++)
      n[l + p] = t[r - l - 4 + p];
  Wt(t);
  for (let l = 4; l < r - 4; l++) {
    const p = n[l], u = Oe(o, p, p, p, p);
    n[l] = i[u & 255] ^ s[u >>> 8 & 255] ^ c[u >>> 16 & 255] ^ a[u >>> 24];
  }
  return n;
}
function ot(e, t, n, r, o, i) {
  return e[n << 8 & 65280 | r >>> 8 & 255] ^ t[o >>> 8 & 65280 | i >>> 24 & 255];
}
function Oe(e, t, n, r, o) {
  return e[t & 255 | n & 65280] | e[r >>> 16 & 255 | o >>> 16 & 65280] << 16;
}
function ns(e, t, n, r, o) {
  const { sbox2: i, T01: s, T23: c } = Jo;
  let a = 0;
  t ^= e[a++], n ^= e[a++], r ^= e[a++], o ^= e[a++];
  const l = e.length / 4 - 2;
  for (let b = 0; b < l; b++) {
    const C = e[a++] ^ ot(s, c, t, n, r, o), A = e[a++] ^ ot(s, c, n, r, o, t), k = e[a++] ^ ot(s, c, r, o, t, n), _ = e[a++] ^ ot(s, c, o, t, n, r);
    t = C, n = A, r = k, o = _;
  }
  const p = e[a++] ^ Oe(i, t, n, r, o), u = e[a++] ^ Oe(i, n, r, o, t), y = e[a++] ^ Oe(i, r, o, t, n), w = e[a++] ^ Oe(i, o, t, n, r);
  return { s0: p, s1: u, s2: y, s3: w };
}
function Md(e, t, n, r, o) {
  const { sbox2: i, T01: s, T23: c } = H1;
  let a = 0;
  t ^= e[a++], n ^= e[a++], r ^= e[a++], o ^= e[a++];
  const l = e.length / 4 - 2;
  for (let b = 0; b < l; b++) {
    const C = e[a++] ^ ot(s, c, t, o, r, n), A = e[a++] ^ ot(s, c, n, t, o, r), k = e[a++] ^ ot(s, c, r, n, t, o), _ = e[a++] ^ ot(s, c, o, r, n, t);
    t = C, n = A, r = k, o = _;
  }
  const p = e[a++] ^ Oe(i, t, o, r, n), u = e[a++] ^ Oe(i, n, t, o, r), y = e[a++] ^ Oe(i, r, n, t, o), w = e[a++] ^ Oe(i, o, r, n, t);
  return { s0: p, s1: u, s2: y, s3: w };
}
function Rd(e) {
  if (xe(e), e.length % at !== 0)
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + at);
}
function $d(e, t, n) {
  xe(e);
  let r = e.length;
  const o = r % at;
  if (!t && o !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  It(e) || (e = xt(e));
  const i = be(e);
  if (t) {
    let c = at - o;
    c || (c = at), r = r + c;
  }
  n = O1(r, n), I1(e, n);
  const s = be(n);
  return { b: i, o: s, out: n };
}
function Nd(e, t) {
  if (!t)
    return e;
  const n = e.length;
  if (!n)
    throw new Error("aes/pcks5: empty ciphertext not allowed");
  const r = e[n - 1];
  if (r <= 0 || r > 16)
    throw new Error("aes/pcks5: wrong padding");
  const o = e.subarray(0, -r);
  for (let i = 0; i < r; i++)
    if (e[n - i - 1] !== r)
      throw new Error("aes/pcks5: wrong padding");
  return o;
}
function Bd(e) {
  const t = new Uint8Array(16), n = be(t);
  t.set(e);
  const r = at - e.length;
  for (let o = at - r; o < at; o++)
    t[o] = r;
  return n;
}
const W1 = /* @__PURE__ */ Ed({ blockSize: 16, nonceLength: 16 }, function(t, n, r = {}) {
  const o = !r.disablePadding;
  return {
    encrypt(i, s) {
      const c = Z1(t), { b: a, o: l, out: p } = $d(i, o, s);
      let u = n;
      const y = [c];
      It(u) || y.push(u = xt(u));
      const w = be(u);
      let b = w[0], C = w[1], A = w[2], k = w[3], _ = 0;
      for (; _ + 4 <= a.length; )
        b ^= a[_ + 0], C ^= a[_ + 1], A ^= a[_ + 2], k ^= a[_ + 3], { s0: b, s1: C, s2: A, s3: k } = ns(c, b, C, A, k), l[_++] = b, l[_++] = C, l[_++] = A, l[_++] = k;
      if (o) {
        const F = Bd(i.subarray(_ * 4));
        b ^= F[0], C ^= F[1], A ^= F[2], k ^= F[3], { s0: b, s1: C, s2: A, s3: k } = ns(c, b, C, A, k), l[_++] = b, l[_++] = C, l[_++] = A, l[_++] = k;
      }
      return Wt(...y), p;
    },
    decrypt(i, s) {
      Rd(i);
      const c = Td(t);
      let a = n;
      const l = [c];
      It(a) || l.push(a = xt(a));
      const p = be(a);
      s = O1(i.length, s), It(i) || l.push(i = xt(i)), I1(i, s);
      const u = be(i), y = be(s);
      let w = p[0], b = p[1], C = p[2], A = p[3];
      for (let k = 0; k + 4 <= u.length; ) {
        const _ = w, F = b, V = C, S = A;
        w = u[k + 0], b = u[k + 1], C = u[k + 2], A = u[k + 3];
        const { s0: M, s1: R, s2: D, s3: $ } = Md(c, w, b, C, A);
        y[k++] = M ^ _, y[k++] = R ^ F, y[k++] = D ^ V, y[k++] = $ ^ S;
      }
      return Wt(...l), Nd(s, o);
    }
  };
}), D1 = (e) => Uint8Array.from(e.split(""), (t) => t.charCodeAt(0)), Ud = D1("expand 16-byte k"), Id = D1("expand 32-byte k"), Od = be(Ud), Pd = be(Id);
function ee(e, t) {
  return e << t | e >>> 32 - t;
}
function mo(e) {
  return e.byteOffset % 4 === 0;
}
const An = 64, Hd = 16, F1 = 2 ** 32 - 1, rs = Uint32Array.of();
function Zd(e, t, n, r, o, i, s, c) {
  const a = o.length, l = new Uint8Array(An), p = be(l), u = mo(o) && mo(i), y = u ? be(o) : rs, w = u ? be(i) : rs;
  for (let b = 0; b < a; s++) {
    if (e(t, n, r, p, s, c), s >= F1)
      throw new Error("arx: counter overflow");
    const C = Math.min(An, a - b);
    if (u && C === An) {
      const A = b / 4;
      if (b % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let k = 0, _; k < Hd; k++)
        _ = A + k, w[_] = y[_] ^ p[k];
      b += An;
      continue;
    }
    for (let A = 0, k; A < C; A++)
      k = b + A, i[k] = o[k] ^ l[A];
    b += C;
  }
}
function Wd(e, t) {
  const { allowShortKeys: n, extendNonceFn: r, counterLength: o, counterRight: i, rounds: s } = Cd({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, t);
  if (typeof e != "function")
    throw new Error("core must be a function");
  return Sr(o), Sr(s), ts(i), ts(n), (c, a, l, p, u = 0) => {
    xe(c, void 0, "key"), xe(a, void 0, "nonce"), xe(l, void 0, "data");
    const y = l.length;
    if (p === void 0 && (p = new Uint8Array(y)), xe(p, void 0, "output"), Sr(u), u < 0 || u >= F1)
      throw new Error("arx: counter overflow");
    if (p.length < y)
      throw new Error(`arx: output (${p.length}) is shorter than data (${y})`);
    const w = [];
    let b = c.length, C, A;
    if (b === 32)
      w.push(C = xt(c)), A = Pd;
    else if (b === 16 && n)
      C = new Uint8Array(32), C.set(c), C.set(c, 16), A = Od, w.push(C);
    else
      throw xe(c, 32, "arx key"), new Error("invalid key size");
    mo(a) || w.push(a = xt(a));
    const k = be(C);
    if (r) {
      if (a.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      r(A, k, be(a.subarray(0, 16)), k), a = a.subarray(16);
    }
    const _ = 16 - o;
    if (_ !== a.length)
      throw new Error(`arx: nonce must be ${_} or 16 bytes`);
    if (_ !== 12) {
      const V = new Uint8Array(12);
      V.set(a, i ? 0 : 12 - a.length), a = V, w.push(a);
    }
    const F = be(a);
    return Zd(e, A, k, F, l, p, u, s), Wt(...w), p;
  };
}
function Dd(e, t, n, r, o, i = 20) {
  let s = e[0], c = e[1], a = e[2], l = e[3], p = t[0], u = t[1], y = t[2], w = t[3], b = t[4], C = t[5], A = t[6], k = t[7], _ = o, F = n[0], V = n[1], S = n[2], M = s, R = c, D = a, $ = l, P = p, h = u, f = y, d = w, m = b, g = C, v = A, x = k, U = _, L = F, N = V, E = S;
  for (let j = 0; j < i; j += 2)
    M = M + P | 0, U = ee(U ^ M, 16), m = m + U | 0, P = ee(P ^ m, 12), M = M + P | 0, U = ee(U ^ M, 8), m = m + U | 0, P = ee(P ^ m, 7), R = R + h | 0, L = ee(L ^ R, 16), g = g + L | 0, h = ee(h ^ g, 12), R = R + h | 0, L = ee(L ^ R, 8), g = g + L | 0, h = ee(h ^ g, 7), D = D + f | 0, N = ee(N ^ D, 16), v = v + N | 0, f = ee(f ^ v, 12), D = D + f | 0, N = ee(N ^ D, 8), v = v + N | 0, f = ee(f ^ v, 7), $ = $ + d | 0, E = ee(E ^ $, 16), x = x + E | 0, d = ee(d ^ x, 12), $ = $ + d | 0, E = ee(E ^ $, 8), x = x + E | 0, d = ee(d ^ x, 7), M = M + h | 0, E = ee(E ^ M, 16), v = v + E | 0, h = ee(h ^ v, 12), M = M + h | 0, E = ee(E ^ M, 8), v = v + E | 0, h = ee(h ^ v, 7), R = R + f | 0, U = ee(U ^ R, 16), x = x + U | 0, f = ee(f ^ x, 12), R = R + f | 0, U = ee(U ^ R, 8), x = x + U | 0, f = ee(f ^ x, 7), D = D + d | 0, L = ee(L ^ D, 16), m = m + L | 0, d = ee(d ^ m, 12), D = D + d | 0, L = ee(L ^ D, 8), m = m + L | 0, d = ee(d ^ m, 7), $ = $ + P | 0, N = ee(N ^ $, 16), g = g + N | 0, P = ee(P ^ g, 12), $ = $ + P | 0, N = ee(N ^ $, 8), g = g + N | 0, P = ee(P ^ g, 7);
  let B = 0;
  r[B++] = s + M | 0, r[B++] = c + R | 0, r[B++] = a + D | 0, r[B++] = l + $ | 0, r[B++] = p + P | 0, r[B++] = u + h | 0, r[B++] = y + f | 0, r[B++] = w + d | 0, r[B++] = b + m | 0, r[B++] = C + g | 0, r[B++] = A + v | 0, r[B++] = k + x | 0, r[B++] = _ + U | 0, r[B++] = F + L | 0, r[B++] = V + N | 0, r[B++] = S + E | 0;
}
const V1 = /* @__PURE__ */ Wd(Dd, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
});
function Fd(e, t, n) {
  return or(e), n === void 0 && (n = new Uint8Array(e.outputLen)), bn(e, n, t);
}
const Lr = /* @__PURE__ */ Uint8Array.of(0), os = /* @__PURE__ */ Uint8Array.of();
function Vd(e, t, n, r = 32) {
  or(e), ct(r, "length");
  const o = e.outputLen;
  if (r > 255 * o)
    throw new Error("Length must be <= 255*HashLen");
  const i = Math.ceil(r / o);
  n === void 0 ? n = os : oe(n, void 0, "info");
  const s = new Uint8Array(i * o), c = bn.create(e, t), a = c._cloneInto(), l = new Uint8Array(c.outputLen);
  for (let p = 0; p < i; p++)
    Lr[0] = p + 1, a.update(p === 0 ? os : l).update(n).update(Lr).digestInto(l), s.set(l, o * p), c._cloneInto(a);
  return c.destroy(), a.destroy(), ln(l, Lr), s.slice(0, r);
}
var Gd = Object.defineProperty, ae = (e, t) => {
  for (var n in t)
    Gd(e, n, { get: t[n], enumerable: !0 });
}, Tt = Symbol("verified"), jd = (e) => e instanceof Object;
function Yo(e) {
  if (!jd(e) || typeof e.kind != "number" || typeof e.content != "string" || typeof e.created_at != "number" || typeof e.pubkey != "string" || !e.pubkey.match(/^[a-f0-9]{64}$/) || !Array.isArray(e.tags))
    return !1;
  for (let t = 0; t < e.tags.length; t++) {
    let n = e.tags[t];
    if (!Array.isArray(n))
      return !1;
    for (let r = 0; r < n.length; r++)
      if (typeof n[r] != "string")
        return !1;
  }
  return !0;
}
var zd = {};
ae(zd, {
  binarySearch: () => Xo,
  bytesToHex: () => ie,
  hexToBytes: () => ne,
  insertEventIntoAscendingList: () => Kd,
  insertEventIntoDescendingList: () => qd,
  mergeReverseSortedLists: () => Qd,
  normalizeURL: () => G1,
  utf8Decoder: () => je,
  utf8Encoder: () => Me
});
var je = new TextDecoder("utf-8"), Me = new TextEncoder();
function G1(e) {
  try {
    e.indexOf("://") === -1 && (e = "wss://" + e);
    let t = new URL(e);
    return t.protocol === "http:" ? t.protocol = "ws:" : t.protocol === "https:" && (t.protocol = "wss:"), t.pathname = t.pathname.replace(/\/+/g, "/"), t.pathname.endsWith("/") && (t.pathname = t.pathname.slice(0, -1)), (t.port === "80" && t.protocol === "ws:" || t.port === "443" && t.protocol === "wss:") && (t.port = ""), t.searchParams.sort(), t.hash = "", t.toString();
  } catch {
    throw new Error(`Invalid URL: ${e}`);
  }
}
function qd(e, t) {
  const [n, r] = Xo(e, (o) => t.id === o.id ? 0 : t.created_at === o.created_at ? -1 : o.created_at - t.created_at);
  return r || e.splice(n, 0, t), e;
}
function Kd(e, t) {
  const [n, r] = Xo(e, (o) => t.id === o.id ? 0 : t.created_at === o.created_at ? -1 : t.created_at - o.created_at);
  return r || e.splice(n, 0, t), e;
}
function Xo(e, t) {
  let n = 0, r = e.length - 1;
  for (; n <= r; ) {
    const o = Math.floor((n + r) / 2), i = t(e[o]);
    if (i === 0)
      return [o, !0];
    i < 0 ? r = o - 1 : n = o + 1;
  }
  return [n, !1];
}
function Qd(e, t) {
  const n = new Array(e.length + t.length);
  n.length = 0;
  let r = 0, o = 0, i = [];
  for (; r < e.length && o < t.length; ) {
    let s;
    if (e[r]?.created_at > t[o]?.created_at ? (s = e[r], r++) : (s = t[o], o++), n.length > 0 && n[n.length - 1].created_at === s.created_at) {
      if (i.includes(s.id))
        continue;
    } else
      i.length = 0;
    n.push(s), i.push(s.id);
  }
  for (; r < e.length; ) {
    const s = e[r];
    if (r++, n.length > 0 && n[n.length - 1].created_at === s.created_at) {
      if (i.includes(s.id))
        continue;
    } else
      i.length = 0;
    n.push(s), i.push(s.id);
  }
  for (; o < t.length; ) {
    const s = t[o];
    if (o++, n.length > 0 && n[n.length - 1].created_at === s.created_at) {
      if (i.includes(s.id))
        continue;
    } else
      i.length = 0;
    n.push(s), i.push(s.id);
  }
  return n;
}
var Jd = class {
  generateSecretKey() {
    return zt.utils.randomSecretKey();
  }
  getPublicKey(e) {
    return ie(zt.getPublicKey(e));
  }
  finalizeEvent(e, t) {
    const n = e;
    return n.pubkey = ie(zt.getPublicKey(t)), n.id = on(n), n.sig = ie(zt.sign(ne(on(n)), t)), n[Tt] = !0, n;
  }
  verifyEvent(e) {
    if (typeof e[Tt] == "boolean")
      return e[Tt];
    try {
      const t = on(e);
      if (t !== e.id)
        return e[Tt] = !1, !1;
      const n = zt.verify(ne(e.sig), ne(t), ne(e.pubkey));
      return e[Tt] = n, n;
    } catch {
      return e[Tt] = !1, !1;
    }
  }
};
function Yd(e) {
  if (!Yo(e))
    throw new Error("can't serialize event with wrong or missing properties");
  return JSON.stringify([0, e.pubkey, e.created_at, e.kind, e.tags, e.content]);
}
function on(e) {
  let t = He(Me.encode(Yd(e)));
  return ie(t);
}
var ar = new Jd(), ei = ar.generateSecretKey, Dt = ar.getPublicKey, Ne = ar.finalizeEvent, cr = ar.verifyEvent, Xd = {};
ae(Xd, {
  Application: () => uh,
  BadgeAward: () => au,
  BadgeDefinition: () => oh,
  BlockedRelaysList: () => Zu,
  BlossomServerList: () => zu,
  BookmarkList: () => Ou,
  Bookmarksets: () => th,
  Calendar: () => yh,
  CalendarEventRSVP: () => bh,
  ChannelCreation: () => J1,
  ChannelHideMessage: () => e0,
  ChannelMessage: () => X1,
  ChannelMetadata: () => Y1,
  ChannelMuteUser: () => t0,
  ChatMessage: () => cu,
  ClassifiedListing: () => ph,
  ClientAuth: () => r0,
  Comment: () => mu,
  CommunitiesList: () => Pu,
  CommunityDefinition: () => Eh,
  CommunityPostApproval: () => ku,
  Contacts: () => ou,
  CreateOrUpdateProduct: () => ah,
  CreateOrUpdateStall: () => sh,
  Curationsets: () => nh,
  Date: () => wh,
  DirectMessageRelaysList: () => Gu,
  DraftClassifiedListing: () => gh,
  DraftLong: () => lh,
  Emojisets: () => dh,
  EncryptedDirectMessage: () => iu,
  EventDeletion: () => su,
  FavoriteRelays: () => Du,
  FileMessage: () => du,
  FileMetadata: () => wu,
  FileServerPreference: () => ju,
  Followsets: () => Yu,
  ForumThread: () => lu,
  GenericRepost: () => ii,
  Genericlists: () => Xu,
  GiftWrap: () => n0,
  GroupMetadata: () => Ah,
  HTTPAuth: () => si,
  Handlerinformation: () => xh,
  Handlerrecommendation: () => Ch,
  Highlights: () => $u,
  InterestsList: () => Fu,
  Interestsets: () => ih,
  JobFeedback: () => Lu,
  JobRequest: () => Su,
  JobResult: () => _u,
  Label: () => Au,
  LightningPubRPC: () => Ku,
  LiveChatMessage: () => yu,
  LiveEvent: () => hh,
  LongFormArticle: () => ch,
  Metadata: () => nu,
  Mutelist: () => Bu,
  NWCWalletInfo: () => qu,
  NWCWalletRequest: () => o0,
  NWCWalletResponse: () => Qu,
  NormalVideo: () => hu,
  NostrConnect: () => Ju,
  OpenTimestamps: () => pu,
  Photo: () => uu,
  Pinlist: () => Uu,
  Poll: () => gu,
  PollResponse: () => Nu,
  PrivateDirectMessage: () => Q1,
  ProblemTracker: () => Cu,
  ProfileBadges: () => rh,
  PublicChatsList: () => Hu,
  Reaction: () => oi,
  RecommendRelay: () => ru,
  RelayList: () => Iu,
  RelayReview: () => vh,
  Relaysets: () => eh,
  Report: () => xu,
  Reporting: () => Eu,
  Repost: () => ri,
  Seal: () => K1,
  SearchRelaysList: () => Wu,
  ShortTextNote: () => q1,
  ShortVideo: () => fu,
  Time: () => mh,
  UserEmojiList: () => Vu,
  UserStatuses: () => fh,
  Voice: () => bu,
  VoiceComment: () => vu,
  Zap: () => Ru,
  ZapGoal: () => Tu,
  ZapRequest: () => Mu,
  classifyKind: () => eu,
  isAddressableKind: () => ni,
  isEphemeralKind: () => z1,
  isKind: () => tu,
  isRegularKind: () => j1,
  isReplaceableKind: () => ti
});
function j1(e) {
  return e < 1e4 && e !== 0 && e !== 3;
}
function ti(e) {
  return e === 0 || e === 3 || 1e4 <= e && e < 2e4;
}
function z1(e) {
  return 2e4 <= e && e < 3e4;
}
function ni(e) {
  return 3e4 <= e && e < 4e4;
}
function eu(e) {
  return j1(e) ? "regular" : ti(e) ? "replaceable" : z1(e) ? "ephemeral" : ni(e) ? "parameterized" : "unknown";
}
function tu(e, t) {
  const n = t instanceof Array ? t : [t];
  return Yo(e) && n.includes(e.kind) || !1;
}
var nu = 0, q1 = 1, ru = 2, ou = 3, iu = 4, su = 5, ri = 6, oi = 7, au = 8, cu = 9, lu = 11, K1 = 13, Q1 = 14, du = 15, ii = 16, uu = 20, hu = 21, fu = 22, J1 = 40, Y1 = 41, X1 = 42, e0 = 43, t0 = 44, pu = 1040, n0 = 1059, gu = 1068, wu = 1063, mu = 1111, yu = 1311, bu = 1222, vu = 1244, Cu = 1971, xu = 1984, Eu = 1984, Au = 1985, ku = 4550, Su = 5999, _u = 6999, Lu = 7e3, Tu = 9041, Mu = 9734, Ru = 9735, $u = 9802, Nu = 1018, Bu = 1e4, Uu = 10001, Iu = 10002, Ou = 10003, Pu = 10004, Hu = 10005, Zu = 10006, Wu = 10007, Du = 10012, Fu = 10015, Vu = 10030, Gu = 10050, ju = 10096, zu = 10063, qu = 13194, Ku = 21e3, r0 = 22242, o0 = 23194, Qu = 23195, Ju = 24133, si = 27235, Yu = 3e4, Xu = 30001, eh = 30002, th = 30003, nh = 30004, rh = 30008, oh = 30009, ih = 30015, sh = 30017, ah = 30018, ch = 30023, lh = 30024, dh = 30030, uh = 30078, hh = 30311, fh = 30315, ph = 30402, gh = 30403, wh = 31922, mh = 31923, yh = 31924, bh = 31925, vh = 31987, Ch = 31989, xh = 31990, Eh = 34550, Ah = 39e3;
function kh(e, t) {
  if (e.ids && e.ids.indexOf(t.id) === -1 || e.kinds && e.kinds.indexOf(t.kind) === -1 || e.authors && e.authors.indexOf(t.pubkey) === -1)
    return !1;
  for (let n in e)
    if (n[0] === "#") {
      let r = n.slice(1), o = e[`#${r}`];
      if (o && !t.tags.find(([i, s]) => i === n.slice(1) && o.indexOf(s) !== -1))
        return !1;
    }
  return !(e.since && t.created_at < e.since || e.until && t.created_at > e.until);
}
function Sh(e, t) {
  for (let n = 0; n < e.length; n++)
    if (kh(e[n], t))
      return !0;
  return !1;
}
var _h = {};
ae(_h, {
  getHex64: () => lr,
  getInt: () => i0,
  getSubscriptionId: () => s0,
  matchEventId: () => Lh,
  matchEventKind: () => Mh,
  matchEventPubkey: () => Th
});
function lr(e, t) {
  let n = t.length + 3, r = e.indexOf(`"${t}":`) + n, o = e.slice(r).indexOf('"') + r + 1;
  return e.slice(o, o + 64);
}
function i0(e, t) {
  let n = t.length, r = e.indexOf(`"${t}":`) + n + 3, o = e.slice(r), i = Math.min(o.indexOf(","), o.indexOf("}"));
  return parseInt(o.slice(0, i), 10);
}
function s0(e) {
  let t = e.slice(0, 22).indexOf('"EVENT"');
  if (t === -1)
    return null;
  let n = e.slice(t + 7 + 1).indexOf('"');
  if (n === -1)
    return null;
  let r = t + 7 + 1 + n, o = e.slice(r + 1, 80).indexOf('"');
  if (o === -1)
    return null;
  let i = r + 1 + o;
  return e.slice(r + 1, i);
}
function Lh(e, t) {
  return t === lr(e, "id");
}
function Th(e, t) {
  return t === lr(e, "pubkey");
}
function Mh(e, t) {
  return t === i0(e, "kind");
}
var Rh = {};
ae(Rh, {
  makeAuthEvent: () => a0
});
function a0(e, t) {
  return {
    kind: r0,
    created_at: Math.floor(Date.now() / 1e3),
    tags: [
      ["relay", e],
      ["challenge", t]
    ],
    content: ""
  };
}
var c0 = class extends Error {
  constructor(e, t) {
    super(`Tried to send message '${e} on a closed connection to ${t}.`), this.name = "SendingOnClosedConnection";
  }
}, l0 = class {
  url;
  _connected = !1;
  onclose = null;
  onnotice = (e) => console.debug(`NOTICE from ${this.url}: ${e}`);
  onauth;
  baseEoseTimeout = 4400;
  publishTimeout = 4400;
  pingFrequency = 29e3;
  pingTimeout = 2e4;
  resubscribeBackoff = [1e4, 1e4, 1e4, 2e4, 2e4, 3e4, 6e4];
  openSubs = /* @__PURE__ */ new Map();
  enablePing;
  enableReconnect;
  idleSince = Date.now();
  ongoingOperations = 0;
  reconnectTimeoutHandle;
  pingIntervalHandle;
  reconnectAttempts = 0;
  skipReconnection = !1;
  connectionPromise;
  openCountRequests = /* @__PURE__ */ new Map();
  openEventPublishes = /* @__PURE__ */ new Map();
  ws;
  challenge;
  authPromise;
  serial = 0;
  verifyEvent;
  _WebSocket;
  constructor(e, t) {
    this.url = G1(e), this.verifyEvent = t.verifyEvent, this._WebSocket = t.websocketImplementation || WebSocket, this.enablePing = t.enablePing, this.enableReconnect = t.enableReconnect || !1;
  }
  static async connect(e, t) {
    const n = new l0(e, t);
    return await n.connect(t), n;
  }
  closeAllSubscriptions(e) {
    for (let [t, n] of this.openSubs)
      n.close(e);
    this.openSubs.clear();
    for (let [t, n] of this.openEventPublishes)
      n.reject(new Error(e));
    this.openEventPublishes.clear();
    for (let [t, n] of this.openCountRequests)
      n.reject(new Error(e));
    this.openCountRequests.clear();
  }
  get connected() {
    return this._connected;
  }
  async reconnect() {
    const e = this.resubscribeBackoff[Math.min(this.reconnectAttempts, this.resubscribeBackoff.length - 1)];
    this.reconnectAttempts++, this.reconnectTimeoutHandle = setTimeout(async () => {
      try {
        await this.connect();
      } catch {
      }
    }, e);
  }
  handleHardClose(e) {
    this.pingIntervalHandle && (clearInterval(this.pingIntervalHandle), this.pingIntervalHandle = void 0), this._connected = !1, this.connectionPromise = void 0, this.idleSince = void 0, this.enableReconnect && !this.skipReconnection ? this.reconnect() : (this.onclose?.(), this.closeAllSubscriptions(e));
  }
  async connect(e) {
    let t;
    return this.connectionPromise ? this.connectionPromise : (this.challenge = void 0, this.authPromise = void 0, this.skipReconnection = !1, this.connectionPromise = new Promise((n, r) => {
      e?.timeout && (t = setTimeout(() => {
        r("connection timed out"), this.connectionPromise = void 0, this.skipReconnection = !0, this.onclose?.(), this.handleHardClose("relay connection timed out");
      }, e.timeout)), e?.abort && (e.abort.onabort = r);
      try {
        this.ws = new this._WebSocket(this.url);
      } catch (o) {
        clearTimeout(t), r(o);
        return;
      }
      this.ws.onopen = () => {
        this.reconnectTimeoutHandle && (clearTimeout(this.reconnectTimeoutHandle), this.reconnectTimeoutHandle = void 0), clearTimeout(t), this._connected = !0;
        const o = this.reconnectAttempts > 0;
        this.reconnectAttempts = 0;
        for (const i of this.openSubs.values()) {
          if (i.eosed = !1, o)
            for (let s = 0; s < i.filters.length; s++)
              i.lastEmitted && (i.filters[s].since = i.lastEmitted + 1);
          i.fire();
        }
        this.enablePing && (this.pingIntervalHandle = setInterval(() => this.pingpong(), this.pingFrequency)), n();
      }, this.ws.onerror = () => {
        clearTimeout(t), r("connection failed"), this.connectionPromise = void 0, this.skipReconnection = !0, this.onclose?.(), this.handleHardClose("relay connection failed");
      }, this.ws.onclose = (o) => {
        clearTimeout(t), r(o.message || "websocket closed"), this.handleHardClose("relay connection closed");
      }, this.ws.onmessage = this._onmessage.bind(this);
    }), this.connectionPromise);
  }
  waitForPingPong() {
    return new Promise((e) => {
      this.ws.once("pong", () => e(!0)), this.ws.ping();
    });
  }
  waitForDummyReq() {
    return new Promise((e, t) => {
      if (!this.connectionPromise)
        return t(new Error(`no connection to ${this.url}, can't ping`));
      try {
        const n = this.subscribe(
          [{ ids: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"], limit: 0 }],
          {
            label: "<forced-ping>",
            oneose: () => {
              e(!0), n.close();
            },
            onclose() {
              e(!0);
            },
            eoseTimeout: this.pingTimeout + 1e3
          }
        );
      } catch (n) {
        t(n);
      }
    });
  }
  async pingpong() {
    this.ws?.readyState === 1 && (await Promise.any([
      this.ws && this.ws.ping && this.ws.once ? this.waitForPingPong() : this.waitForDummyReq(),
      new Promise((t) => setTimeout(() => t(!1), this.pingTimeout))
    ]) || this.ws?.readyState === this._WebSocket.OPEN && this.ws?.close());
  }
  async send(e) {
    if (!this.connectionPromise)
      throw new c0(e, this.url);
    this.connectionPromise.then(() => {
      this.ws?.send(e);
    });
  }
  async auth(e) {
    const t = this.challenge;
    if (!t)
      throw new Error("can't perform auth, no challenge was received");
    return this.authPromise ? this.authPromise : (this.authPromise = new Promise(async (n, r) => {
      try {
        let o = await e(a0(this.url, t)), i = setTimeout(() => {
          let s = this.openEventPublishes.get(o.id);
          s && (s.reject(new Error("auth timed out")), this.openEventPublishes.delete(o.id));
        }, this.publishTimeout);
        this.openEventPublishes.set(o.id, { resolve: n, reject: r, timeout: i }), this.send('["AUTH",' + JSON.stringify(o) + "]");
      } catch (o) {
        console.warn("subscribe auth function failed:", o);
      }
    }), this.authPromise);
  }
  async publish(e) {
    this.idleSince = void 0, this.ongoingOperations++;
    const t = new Promise((n, r) => {
      const o = setTimeout(() => {
        const i = this.openEventPublishes.get(e.id);
        i && (i.reject(new Error("publish timed out")), this.openEventPublishes.delete(e.id));
      }, this.publishTimeout);
      this.openEventPublishes.set(e.id, { resolve: n, reject: r, timeout: o });
    });
    return this.send('["EVENT",' + JSON.stringify(e) + "]"), this.ongoingOperations--, this.ongoingOperations === 0 && (this.idleSince = Date.now()), t;
  }
  async count(e, t) {
    this.serial++;
    const n = t?.id || "count:" + this.serial, r = new Promise((o, i) => {
      this.openCountRequests.set(n, { resolve: o, reject: i });
    });
    return this.send('["COUNT","' + n + '",' + JSON.stringify(e).substring(1)), r;
  }
  subscribe(e, t) {
    t.label !== "<forced-ping>" && (this.idleSince = void 0, this.ongoingOperations++);
    const n = this.prepareSubscription(e, t);
    return n.fire(), t.abort && (t.abort.onabort = () => n.close(String(t.abort.reason || "<aborted>"))), n;
  }
  prepareSubscription(e, t) {
    this.serial++;
    const n = t.id || (t.label ? t.label + ":" : "sub:") + this.serial, r = new $h(this, n, e, t);
    return this.openSubs.set(n, r), r;
  }
  close() {
    this.skipReconnection = !0, this.reconnectTimeoutHandle && (clearTimeout(this.reconnectTimeoutHandle), this.reconnectTimeoutHandle = void 0), this.pingIntervalHandle && (clearInterval(this.pingIntervalHandle), this.pingIntervalHandle = void 0), this.closeAllSubscriptions("relay connection closed by us"), this._connected = !1, this.idleSince = void 0, this.onclose?.(), this.ws?.readyState === this._WebSocket.OPEN && this.ws?.close();
  }
  _onmessage(e) {
    const t = e.data;
    if (!t)
      return;
    const n = s0(t);
    if (n) {
      const r = this.openSubs.get(n);
      if (!r)
        return;
      const o = lr(t, "id"), i = r.alreadyHaveEvent?.(o);
      if (r.receivedEvent?.(this, o), i)
        return;
    }
    try {
      let r = JSON.parse(t);
      switch (r[0]) {
        case "EVENT": {
          const o = this.openSubs.get(r[1]), i = r[2];
          this.verifyEvent(i) && Sh(o.filters, i) ? o.onevent(i) : o.oninvalidevent?.(i), (!o.lastEmitted || o.lastEmitted < i.created_at) && (o.lastEmitted = i.created_at);
          return;
        }
        case "COUNT": {
          const o = r[1], i = r[2], s = this.openCountRequests.get(o);
          s && (s.resolve(i.count), this.openCountRequests.delete(o));
          return;
        }
        case "EOSE": {
          const o = this.openSubs.get(r[1]);
          if (!o)
            return;
          o.receivedEose();
          return;
        }
        case "OK": {
          const o = r[1], i = r[2], s = r[3], c = this.openEventPublishes.get(o);
          c && (clearTimeout(c.timeout), i ? c.resolve(s) : c.reject(new Error(s)), this.openEventPublishes.delete(o));
          return;
        }
        case "CLOSED": {
          const o = r[1], i = this.openSubs.get(o);
          if (!i)
            return;
          i.closed = !0, i.close(r[2]);
          return;
        }
        case "NOTICE": {
          this.onnotice(r[1]);
          return;
        }
        case "AUTH": {
          this.challenge = r[1], this.onauth && this.auth(this.onauth);
          return;
        }
        default: {
          this.openSubs.get(r[1])?.oncustom?.(r);
          return;
        }
      }
    } catch (r) {
      try {
        const [o, i, s] = JSON.parse(t);
        console.warn(`[nostr] relay ${this.url} error processing message:`, r, s);
      } catch {
        console.warn(`[nostr] relay ${this.url} error processing message:`, r);
      }
      return;
    }
  }
}, $h = class {
  relay;
  id;
  lastEmitted;
  closed = !1;
  eosed = !1;
  filters;
  alreadyHaveEvent;
  receivedEvent;
  onevent;
  oninvalidevent;
  oneose;
  onclose;
  oncustom;
  eoseTimeout;
  eoseTimeoutHandle;
  constructor(e, t, n, r) {
    if (n.length === 0)
      throw new Error("subscription can't be created with zero filters");
    this.relay = e, this.filters = n, this.id = t, this.alreadyHaveEvent = r.alreadyHaveEvent, this.receivedEvent = r.receivedEvent, this.eoseTimeout = r.eoseTimeout || e.baseEoseTimeout, this.oneose = r.oneose, this.onclose = r.onclose, this.oninvalidevent = r.oninvalidevent, this.onevent = r.onevent || ((o) => {
      console.warn(
        `onevent() callback not defined for subscription '${this.id}' in relay ${this.relay.url}. event received:`,
        o
      );
    });
  }
  fire() {
    this.relay.send('["REQ","' + this.id + '",' + JSON.stringify(this.filters).substring(1)), this.eoseTimeoutHandle = setTimeout(this.receivedEose.bind(this), this.eoseTimeout);
  }
  receivedEose() {
    this.eosed || (clearTimeout(this.eoseTimeoutHandle), this.eosed = !0, this.oneose?.());
  }
  close(e = "closed by caller") {
    if (!this.closed && this.relay.connected) {
      try {
        this.relay.send('["CLOSE",' + JSON.stringify(this.id) + "]");
      } catch (t) {
        if (!(t instanceof c0)) throw t;
      }
      this.closed = !0;
    }
    this.relay.openSubs.delete(this.id), this.relay.ongoingOperations--, this.relay.ongoingOperations === 0 && (this.relay.idleSince = Date.now()), this.onclose?.(e);
  }
}, d0;
try {
  d0 = WebSocket;
} catch {
}
var u0 = class extends l0 {
  constructor(e, t) {
    super(e, { verifyEvent: cr, websocketImplementation: d0, ...t });
  }
  static async connect(e, t) {
    const n = new u0(e, t);
    return await n.connect(), n;
  }
}, Nh;
try {
  Nh = WebSocket;
} catch {
}
var yo = {};
ae(yo, {
  BECH32_REGEX: () => h0,
  Bech32MaxSize: () => ai,
  NostrTypeGuard: () => Bh,
  decode: () => dr,
  decodeNostrURI: () => Ih,
  encodeBytes: () => hr,
  naddrEncode: () => Dh,
  neventEncode: () => Wh,
  noteEncode: () => Hh,
  nprofileEncode: () => Zh,
  npubEncode: () => Ph,
  nsecEncode: () => Oh
});
var Bh = {
  isNProfile: (e) => /^nprofile1[a-z\d]+$/.test(e || ""),
  isNEvent: (e) => /^nevent1[a-z\d]+$/.test(e || ""),
  isNAddr: (e) => /^naddr1[a-z\d]+$/.test(e || ""),
  isNSec: (e) => /^nsec1[a-z\d]{58}$/.test(e || ""),
  isNPub: (e) => /^npub1[a-z\d]{58}$/.test(e || ""),
  isNote: (e) => /^note1[a-z\d]+$/.test(e || ""),
  isNcryptsec: (e) => /^ncryptsec1[a-z\d]+$/.test(e || "")
}, ai = 5e3, h0 = /[\x21-\x7E]{1,83}1[023456789acdefghjklmnpqrstuvwxyz]{6,}/;
function Uh(e) {
  const t = new Uint8Array(4);
  return t[0] = e >> 24 & 255, t[1] = e >> 16 & 255, t[2] = e >> 8 & 255, t[3] = e & 255, t;
}
function Ih(e) {
  try {
    return e.startsWith("nostr:") && (e = e.substring(6)), dr(e);
  } catch {
    return { type: "invalid", data: null };
  }
}
function dr(e) {
  let { prefix: t, words: n } = Zt.decode(e, ai), r = new Uint8Array(Zt.fromWords(n));
  switch (t) {
    case "nprofile": {
      let o = Tr(r);
      if (!o[0]?.[0])
        throw new Error("missing TLV 0 for nprofile");
      if (o[0][0].length !== 32)
        throw new Error("TLV 0 should be 32 bytes");
      return {
        type: "nprofile",
        data: {
          pubkey: ie(o[0][0]),
          relays: o[1] ? o[1].map((i) => je.decode(i)) : []
        }
      };
    }
    case "nevent": {
      let o = Tr(r);
      if (!o[0]?.[0])
        throw new Error("missing TLV 0 for nevent");
      if (o[0][0].length !== 32)
        throw new Error("TLV 0 should be 32 bytes");
      if (o[2] && o[2][0].length !== 32)
        throw new Error("TLV 2 should be 32 bytes");
      if (o[3] && o[3][0].length !== 4)
        throw new Error("TLV 3 should be 4 bytes");
      return {
        type: "nevent",
        data: {
          id: ie(o[0][0]),
          relays: o[1] ? o[1].map((i) => je.decode(i)) : [],
          author: o[2]?.[0] ? ie(o[2][0]) : void 0,
          kind: o[3]?.[0] ? parseInt(ie(o[3][0]), 16) : void 0
        }
      };
    }
    case "naddr": {
      let o = Tr(r);
      if (!o[0]?.[0])
        throw new Error("missing TLV 0 for naddr");
      if (!o[2]?.[0])
        throw new Error("missing TLV 2 for naddr");
      if (o[2][0].length !== 32)
        throw new Error("TLV 2 should be 32 bytes");
      if (!o[3]?.[0])
        throw new Error("missing TLV 3 for naddr");
      if (o[3][0].length !== 4)
        throw new Error("TLV 3 should be 4 bytes");
      return {
        type: "naddr",
        data: {
          identifier: je.decode(o[0][0]),
          pubkey: ie(o[2][0]),
          kind: parseInt(ie(o[3][0]), 16),
          relays: o[1] ? o[1].map((i) => je.decode(i)) : []
        }
      };
    }
    case "nsec":
      return { type: t, data: r };
    case "npub":
    case "note":
      return { type: t, data: ie(r) };
    default:
      throw new Error(`unknown prefix ${t}`);
  }
}
function Tr(e) {
  let t = {}, n = e;
  for (; n.length > 0; ) {
    let r = n[0], o = n[1], i = n.slice(2, 2 + o);
    if (n = n.slice(2 + o), i.length < o)
      throw new Error(`not enough data to read on TLV ${r}`);
    t[r] = t[r] || [], t[r].push(i);
  }
  return t;
}
function Oh(e) {
  return hr("nsec", e);
}
function Ph(e) {
  return hr("npub", ne(e));
}
function Hh(e) {
  return hr("note", ne(e));
}
function ur(e, t) {
  let n = Zt.toWords(t);
  return Zt.encode(e, n, ai);
}
function hr(e, t) {
  return ur(e, t);
}
function Zh(e) {
  let t = ci({
    0: [ne(e.pubkey)],
    1: (e.relays || []).map((n) => Me.encode(n))
  });
  return ur("nprofile", t);
}
function Wh(e) {
  let t;
  e.kind !== void 0 && (t = Uh(e.kind));
  let n = ci({
    0: [ne(e.id)],
    1: (e.relays || []).map((r) => Me.encode(r)),
    2: e.author ? [ne(e.author)] : [],
    3: t ? [new Uint8Array(t)] : []
  });
  return ur("nevent", n);
}
function Dh(e) {
  let t = new ArrayBuffer(4);
  new DataView(t).setUint32(0, e.kind, !1);
  let n = ci({
    0: [Me.encode(e.identifier)],
    1: (e.relays || []).map((r) => Me.encode(r)),
    2: [ne(e.pubkey)],
    3: [new Uint8Array(t)]
  });
  return ur("naddr", n);
}
function ci(e) {
  let t = [];
  return Object.entries(e).reverse().forEach(([n, r]) => {
    r.forEach((o) => {
      let i = new Uint8Array(o.length + 2);
      i.set([parseInt(n)], 0), i.set([o.length], 1), i.set(o, 2), t.push(i);
    });
  }), Ee(...t);
}
var bo = {};
ae(bo, {
  decrypt: () => Fh,
  encrypt: () => f0
});
function f0(e, t, n) {
  const r = e instanceof Uint8Array ? e : ne(e), o = Go.getSharedSecret(r, ne("02" + t)), i = p0(o);
  let s = Uint8Array.from(jt(16)), c = Me.encode(n), a = W1(i, s).encrypt(c), l = lt.encode(new Uint8Array(a)), p = lt.encode(new Uint8Array(s.buffer));
  return `${l}?iv=${p}`;
}
function Fh(e, t, n) {
  const r = e instanceof Uint8Array ? e : ne(e);
  let [o, i] = n.split("?iv="), s = Go.getSharedSecret(r, ne("02" + t)), c = p0(s), a = lt.decode(i), l = lt.decode(o), p = W1(c, a).decrypt(l);
  return je.decode(p);
}
function p0(e) {
  return e.slice(1, 33);
}
var Vh = {};
ae(Vh, {
  NIP05_REGEX: () => li,
  isNip05: () => Gh,
  isValid: () => qh,
  queryProfile: () => g0,
  searchDomain: () => zh,
  useFetchImplementation: () => jh
});
var li = /^(?:([\w.+-]+)@)?([\w_-]+(\.[\w_-]+)+)$/, Gh = (e) => li.test(e || ""), fr;
try {
  fr = fetch;
} catch {
}
function jh(e) {
  fr = e;
}
async function zh(e, t = "") {
  try {
    const n = `https://${e}/.well-known/nostr.json?name=${t}`, r = await fr(n, { redirect: "manual" });
    if (r.status !== 200)
      throw Error("Wrong response code");
    return (await r.json()).names;
  } catch {
    return {};
  }
}
async function g0(e) {
  const t = e.match(li);
  if (!t)
    return null;
  const [, n = "_", r] = t;
  try {
    const o = `https://${r}/.well-known/nostr.json?name=${n}`, i = await fr(o, { redirect: "manual" });
    if (i.status !== 200)
      throw Error("Wrong response code");
    const s = await i.json(), c = s.names[n];
    return c ? { pubkey: c, relays: s.relays?.[c] } : null;
  } catch {
    return null;
  }
}
async function qh(e, t) {
  const n = await g0(t);
  return n ? n.pubkey === e : !1;
}
var Kh = {};
ae(Kh, {
  parse: () => Qh
});
function Qh(e) {
  const t = {
    reply: void 0,
    root: void 0,
    mentions: [],
    profiles: [],
    quotes: []
  };
  let n, r;
  for (let o = e.tags.length - 1; o >= 0; o--) {
    const i = e.tags[o];
    if (i[0] === "e" && i[1]) {
      const [s, c, a, l, p] = i, u = {
        id: c,
        relays: a ? [a] : [],
        author: p
      };
      if (l === "root") {
        t.root = u;
        continue;
      }
      if (l === "reply") {
        t.reply = u;
        continue;
      }
      if (l === "mention") {
        t.mentions.push(u);
        continue;
      }
      n ? r = u : n = u, t.mentions.push(u);
      continue;
    }
    if (i[0] === "q" && i[1]) {
      const [s, c, a] = i;
      t.quotes.push({
        id: c,
        relays: a ? [a] : []
      });
    }
    if (i[0] === "p" && i[1]) {
      t.profiles.push({
        pubkey: i[1],
        relays: i[2] ? [i[2]] : []
      });
      continue;
    }
  }
  return t.root || (t.root = r || n || t.reply), t.reply || (t.reply = n || t.root), [t.reply, t.root].forEach((o) => {
    if (!o)
      return;
    let i = t.mentions.indexOf(o);
    if (i !== -1 && t.mentions.splice(i, 1), o.author) {
      let s = t.profiles.find((c) => c.pubkey === o.author);
      s && s.relays && (o.relays || (o.relays = []), s.relays.forEach((c) => {
        o.relays?.indexOf(c) === -1 && o.relays.push(c);
      }), s.relays = o.relays);
    }
  }), t.mentions.forEach((o) => {
    if (o.author) {
      let i = t.profiles.find((s) => s.pubkey === o.author);
      i && i.relays && (o.relays || (o.relays = []), i.relays.forEach((s) => {
        o.relays.indexOf(s) === -1 && o.relays.push(s);
      }), i.relays = o.relays);
    }
  }), t;
}
var Jh = {};
ae(Jh, {
  fetchRelayInformation: () => Xh,
  useFetchImplementation: () => Yh
});
var w0;
try {
  w0 = fetch;
} catch {
}
function Yh(e) {
  w0 = e;
}
async function Xh(e) {
  return await (await fetch(e.replace("ws://", "http://").replace("wss://", "https://"), {
    headers: { Accept: "application/nostr+json" }
  })).json();
}
var e3 = {};
ae(e3, {
  getPow: () => t3,
  minePow: () => r3
});
function t3(e) {
  let t = 0;
  for (let n = 0; n < 64; n += 8) {
    const r = parseInt(e.substring(n, n + 8), 16);
    if (r === 0)
      t += 32;
    else {
      t += Math.clz32(r);
      break;
    }
  }
  return t;
}
function n3(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    const r = e[n];
    if (r === 0)
      t += 8;
    else {
      t += Math.clz32(r) - 24;
      break;
    }
  }
  return t;
}
function r3(e, t) {
  let n = 0;
  const r = e, o = ["nonce", n.toString(), t.toString()];
  for (r.tags.push(o); ; ) {
    const i = Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
    i !== r.created_at && (n = 0, r.created_at = i), o[1] = (++n).toString();
    const s = He(
      Me.encode(JSON.stringify([0, r.pubkey, r.created_at, r.kind, r.tags, r.content]))
    );
    if (n3(s) >= t) {
      r.id = ie(s);
      break;
    }
  }
  return r;
}
var o3 = {};
ae(o3, {
  unwrapEvent: () => g3,
  unwrapManyEvents: () => w3,
  wrapEvent: () => T0,
  wrapManyEvents: () => p3
});
var i3 = {};
ae(i3, {
  createRumor: () => k0,
  createSeal: () => S0,
  createWrap: () => _0,
  unwrapEvent: () => pi,
  unwrapManyEvents: () => L0,
  wrapEvent: () => Qn,
  wrapManyEvents: () => h3
});
var nn = {};
ae(nn, {
  decrypt: () => fi,
  encrypt: () => hi,
  getConversationKey: () => di,
  v2: () => d3
});
var m0 = 1, y0 = 65535;
function di(e, t) {
  const n = Go.getSharedSecret(e, ne("02" + t)).subarray(1, 33);
  return Fd(He, n, Me.encode("nip44-v2"));
}
function b0(e, t) {
  const n = Vd(He, e, t, 76);
  return {
    chacha_key: n.subarray(0, 32),
    chacha_nonce: n.subarray(32, 44),
    hmac_key: n.subarray(44, 76)
  };
}
function ui(e) {
  if (!Number.isSafeInteger(e) || e < 1)
    throw new Error("expected positive integer");
  if (e <= 32)
    return 32;
  const t = 1 << Math.floor(Math.log2(e - 1)) + 1, n = t <= 256 ? 32 : t / 8;
  return n * (Math.floor((e - 1) / n) + 1);
}
function s3(e) {
  if (!Number.isSafeInteger(e) || e < m0 || e > y0)
    throw new Error("invalid plaintext size: must be between 1 and 65535 bytes");
  const t = new Uint8Array(2);
  return new DataView(t.buffer).setUint16(0, e, !1), t;
}
function a3(e) {
  const t = Me.encode(e), n = t.length, r = s3(n), o = new Uint8Array(ui(n) - n);
  return Ee(r, t, o);
}
function c3(e) {
  const t = new DataView(e.buffer).getUint16(0), n = e.subarray(2, 2 + t);
  if (t < m0 || t > y0 || n.length !== t || e.length !== 2 + ui(t))
    throw new Error("invalid padding");
  return je.decode(n);
}
function v0(e, t, n) {
  if (n.length !== 32)
    throw new Error("AAD associated data must be 32 bytes");
  const r = Ee(n, t);
  return bn(He, e, r);
}
function l3(e) {
  if (typeof e != "string")
    throw new Error("payload must be a valid string");
  const t = e.length;
  if (t < 132 || t > 87472)
    throw new Error("invalid payload length: " + t);
  if (e[0] === "#")
    throw new Error("unknown encryption version");
  let n;
  try {
    n = lt.decode(e);
  } catch (i) {
    throw new Error("invalid base64: " + i.message);
  }
  const r = n.length;
  if (r < 99 || r > 65603)
    throw new Error("invalid data length: " + r);
  const o = n[0];
  if (o !== 2)
    throw new Error("unknown encryption version " + o);
  return {
    nonce: n.subarray(1, 33),
    ciphertext: n.subarray(33, -32),
    mac: n.subarray(-32)
  };
}
function hi(e, t, n = jt(32)) {
  const { chacha_key: r, chacha_nonce: o, hmac_key: i } = b0(t, n), s = a3(e), c = V1(r, o, s), a = v0(i, c, n);
  return lt.encode(Ee(new Uint8Array([2]), n, c, a));
}
function fi(e, t) {
  const { nonce: n, ciphertext: r, mac: o } = l3(e), { chacha_key: i, chacha_nonce: s, hmac_key: c } = b0(t, n), a = v0(c, r, n);
  if (!xd(a, o))
    throw new Error("invalid MAC");
  const l = V1(i, s, r);
  return c3(l);
}
var d3 = {
  utils: {
    getConversationKey: di,
    calcPaddedLen: ui
  },
  encrypt: hi,
  decrypt: fi
}, u3 = 2880 * 60, C0 = () => Math.round(Date.now() / 1e3), x0 = () => Math.round(C0() - Math.random() * u3), E0 = (e, t) => di(e, t), A0 = (e, t, n) => hi(JSON.stringify(e), E0(t, n)), is = (e, t) => JSON.parse(fi(e.content, E0(t, e.pubkey)));
function k0(e, t) {
  const n = {
    created_at: C0(),
    content: "",
    tags: [],
    ...e,
    pubkey: Dt(t)
  };
  return n.id = on(n), n;
}
function S0(e, t, n) {
  return Ne(
    {
      kind: K1,
      content: A0(e, t, n),
      created_at: x0(),
      tags: []
    },
    t
  );
}
function _0(e, t) {
  const n = ei();
  return Ne(
    {
      kind: n0,
      content: A0(e, n, t),
      created_at: x0(),
      tags: [["p", t]]
    },
    n
  );
}
function Qn(e, t, n) {
  const r = k0(e, t), o = S0(r, t, n);
  return _0(o, n);
}
function h3(e, t, n) {
  if (!n || n.length === 0)
    throw new Error("At least one recipient is required.");
  const r = Dt(t), o = [Qn(e, t, r)];
  return n.forEach((i) => {
    o.push(Qn(e, t, i));
  }), o;
}
function pi(e, t) {
  const n = is(e, t);
  return is(n, t);
}
function L0(e, t) {
  let n = [];
  return e.forEach((r) => {
    n.push(pi(r, t));
  }), n.sort((r, o) => r.created_at - o.created_at), n;
}
function f3(e, t, n, r) {
  const o = {
    created_at: Math.ceil(Date.now() / 1e3),
    kind: Q1,
    tags: [],
    content: t
  };
  return (Array.isArray(e) ? e : [e]).forEach(({ publicKey: s, relayUrl: c }) => {
    o.tags.push(c ? ["p", s, c] : ["p", s]);
  }), r && o.tags.push(["e", r.eventId, r.relayUrl || "", "reply"]), n && o.tags.push(["subject", n]), o;
}
function T0(e, t, n, r, o) {
  const i = f3(t, n, r, o);
  return Qn(i, e, t.publicKey);
}
function p3(e, t, n, r, o) {
  if (!t || t.length === 0)
    throw new Error("At least one recipient is required.");
  return [{ publicKey: Dt(e) }, ...t].map(
    (s) => T0(e, s, n, r, o)
  );
}
var g3 = pi, w3 = L0, m3 = {};
ae(m3, {
  finishRepostEvent: () => y3,
  getRepostedEvent: () => b3,
  getRepostedEventPointer: () => M0
});
function y3(e, t, n, r) {
  let o;
  const i = [...e.tags ?? [], ["e", t.id, n], ["p", t.pubkey]];
  return t.kind === q1 ? o = ri : (o = ii, i.push(["k", String(t.kind)])), Ne(
    {
      kind: o,
      tags: i,
      content: e.content === "" || t.tags?.find((s) => s[0] === "-") ? "" : JSON.stringify(t),
      created_at: e.created_at
    },
    r
  );
}
function M0(e) {
  if (![ri, ii].includes(e.kind))
    return;
  let t, n;
  for (let r = e.tags.length - 1; r >= 0 && (t === void 0 || n === void 0); r--) {
    const o = e.tags[r];
    o.length >= 2 && (o[0] === "e" && t === void 0 ? t = o : o[0] === "p" && n === void 0 && (n = o));
  }
  if (t !== void 0)
    return {
      id: t[1],
      relays: [t[2], n?.[2]].filter((r) => typeof r == "string"),
      author: n?.[1]
    };
}
function b3(e, { skipVerification: t } = {}) {
  const n = M0(e);
  if (n === void 0 || e.content === "")
    return;
  let r;
  try {
    r = JSON.parse(e.content);
  } catch {
    return;
  }
  if (r.id === n.id && !(!t && !cr(r)))
    return r;
}
var v3 = {};
ae(v3, {
  NOSTR_URI_REGEX: () => gi,
  parse: () => x3,
  test: () => C3
});
var gi = new RegExp(`nostr:(${h0.source})`);
function C3(e) {
  return typeof e == "string" && new RegExp(`^${gi.source}$`).test(e);
}
function x3(e) {
  const t = e.match(new RegExp(`^${gi.source}$`));
  if (!t)
    throw new Error(`Invalid Nostr URI: ${e}`);
  return {
    uri: t[0],
    value: t[1],
    decoded: dr(t[1])
  };
}
var E3 = {};
ae(E3, {
  finishReactionEvent: () => A3,
  getReactedEventPointer: () => k3
});
function A3(e, t, n) {
  const r = t.tags.filter((o) => o.length >= 2 && (o[0] === "e" || o[0] === "p"));
  return Ne(
    {
      ...e,
      kind: oi,
      tags: [...e.tags ?? [], ...r, ["e", t.id], ["p", t.pubkey]],
      content: e.content ?? "+"
    },
    n
  );
}
function k3(e) {
  if (e.kind !== oi)
    return;
  let t, n;
  for (let r = e.tags.length - 1; r >= 0 && (t === void 0 || n === void 0); r--) {
    const o = e.tags[r];
    o.length >= 2 && (o[0] === "e" && t === void 0 ? t = o : o[0] === "p" && n === void 0 && (n = o));
  }
  if (!(t === void 0 || n === void 0))
    return {
      id: t[1],
      relays: [t[2], n[2]].filter((r) => r !== void 0),
      author: n[1]
    };
}
var S3 = {};
ae(S3, {
  parse: () => L3
});
var Mr = /\W/m, ss = /[^\w\/] |[^\w\/]$|$|,| /m, _3 = 42;
function* L3(e) {
  let t = [];
  if (typeof e != "string") {
    for (let i = 0; i < e.tags.length; i++) {
      const s = e.tags[i];
      s[0] === "emoji" && s.length >= 3 && t.push({ type: "emoji", shortcode: s[1], url: s[2] });
    }
    e = e.content;
  }
  const n = e.length;
  let r = 0, o = 0;
  e:
    for (; o < n; ) {
      const i = e.indexOf(":", o), s = e.indexOf("#", o);
      if (i === -1 && s === -1)
        break e;
      if (i === -1 || s >= 0 && s < i) {
        if (s === 0 || e[s - 1].match(Mr)) {
          const c = e.slice(s + 1, s + _3).match(Mr), a = c ? s + 1 + c.index : n;
          yield { type: "text", text: e.slice(r, s) }, yield { type: "hashtag", value: e.slice(s + 1, a) }, o = a, r = o;
          continue e;
        }
        o = s + 1;
        continue e;
      }
      if (e.slice(i - 5, i) === "nostr") {
        const c = e.slice(i + 60).match(Mr), a = c ? i + 60 + c.index : n;
        try {
          let l, { data: p, type: u } = dr(e.slice(i + 1, a));
          switch (u) {
            case "npub":
              l = { pubkey: p };
              break;
            case "note":
              l = { id: p };
              break;
            case "nsec":
              o = a + 1;
              continue;
            default:
              l = p;
          }
          r !== i - 5 && (yield { type: "text", text: e.slice(r, i - 5) }), yield { type: "reference", pointer: l }, o = a, r = o;
          continue e;
        } catch {
          o = i + 1;
          continue e;
        }
      } else if (e.slice(i - 5, i) === "https" || e.slice(i - 4, i) === "http") {
        const c = e.slice(i + 4).match(ss), a = c ? i + 4 + c.index : n, l = e[i - 1] === "s" ? 5 : 4;
        try {
          let p = new URL(e.slice(i - l, a));
          if (p.hostname.indexOf(".") === -1)
            throw new Error("invalid url");
          if (r !== i - l && (yield { type: "text", text: e.slice(r, i - l) }), /\.(png|jpe?g|gif|webp|heic|svg)$/i.test(p.pathname)) {
            yield { type: "image", url: p.toString() }, o = a, r = o;
            continue e;
          }
          if (/\.(mp4|avi|webm|mkv|mov)$/i.test(p.pathname)) {
            yield { type: "video", url: p.toString() }, o = a, r = o;
            continue e;
          }
          if (/\.(mp3|aac|ogg|opus|wav|flac)$/i.test(p.pathname)) {
            yield { type: "audio", url: p.toString() }, o = a, r = o;
            continue e;
          }
          yield { type: "url", url: p.toString() }, o = a, r = o;
          continue e;
        } catch {
          o = a + 1;
          continue e;
        }
      } else if (e.slice(i - 3, i) === "wss" || e.slice(i - 2, i) === "ws") {
        const c = e.slice(i + 4).match(ss), a = c ? i + 4 + c.index : n, l = e[i - 1] === "s" ? 3 : 2;
        try {
          let p = new URL(e.slice(i - l, a));
          if (p.hostname.indexOf(".") === -1)
            throw new Error("invalid ws url");
          r !== i - l && (yield { type: "text", text: e.slice(r, i - l) }), yield { type: "relay", url: p.toString() }, o = a, r = o;
          continue e;
        } catch {
          o = a + 1;
          continue e;
        }
      } else {
        for (let c = 0; c < t.length; c++) {
          const a = t[c];
          if (e[i + a.shortcode.length + 1] === ":" && e.slice(i + 1, i + a.shortcode.length + 1) === a.shortcode) {
            r !== i && (yield { type: "text", text: e.slice(r, i) }), yield a, o = i + a.shortcode.length + 2, r = o;
            continue e;
          }
        }
        o = i + 1;
        continue e;
      }
    }
  r !== n && (yield { type: "text", text: e.slice(r) });
}
var T3 = {};
ae(T3, {
  channelCreateEvent: () => M3,
  channelHideMessageEvent: () => N3,
  channelMessageEvent: () => $3,
  channelMetadataEvent: () => R3,
  channelMuteUserEvent: () => B3
});
var M3 = (e, t) => {
  let n;
  if (typeof e.content == "object")
    n = JSON.stringify(e.content);
  else if (typeof e.content == "string")
    n = e.content;
  else
    return;
  return Ne(
    {
      kind: J1,
      tags: [...e.tags ?? []],
      content: n,
      created_at: e.created_at
    },
    t
  );
}, R3 = (e, t) => {
  let n;
  if (typeof e.content == "object")
    n = JSON.stringify(e.content);
  else if (typeof e.content == "string")
    n = e.content;
  else
    return;
  return Ne(
    {
      kind: Y1,
      tags: [["e", e.channel_create_event_id], ...e.tags ?? []],
      content: n,
      created_at: e.created_at
    },
    t
  );
}, $3 = (e, t) => {
  const n = [["e", e.channel_create_event_id, e.relay_url, "root"]];
  return e.reply_to_channel_message_event_id && n.push(["e", e.reply_to_channel_message_event_id, e.relay_url, "reply"]), Ne(
    {
      kind: X1,
      tags: [...n, ...e.tags ?? []],
      content: e.content,
      created_at: e.created_at
    },
    t
  );
}, N3 = (e, t) => {
  let n;
  if (typeof e.content == "object")
    n = JSON.stringify(e.content);
  else if (typeof e.content == "string")
    n = e.content;
  else
    return;
  return Ne(
    {
      kind: e0,
      tags: [["e", e.channel_message_event_id], ...e.tags ?? []],
      content: n,
      created_at: e.created_at
    },
    t
  );
}, B3 = (e, t) => {
  let n;
  if (typeof e.content == "object")
    n = JSON.stringify(e.content);
  else if (typeof e.content == "string")
    n = e.content;
  else
    return;
  return Ne(
    {
      kind: t0,
      tags: [["p", e.pubkey_to_mute], ...e.tags ?? []],
      content: n,
      created_at: e.created_at
    },
    t
  );
}, U3 = {};
ae(U3, {
  EMOJI_SHORTCODE_REGEX: () => R0,
  matchAll: () => I3,
  regex: () => wi,
  replaceAll: () => O3
});
var R0 = /:(\w+):/, wi = () => new RegExp(`\\B${R0.source}\\B`, "g");
function* I3(e) {
  const t = e.matchAll(wi());
  for (const n of t)
    try {
      const [r, o] = n;
      yield {
        shortcode: r,
        name: o,
        start: n.index,
        end: n.index + r.length
      };
    } catch {
    }
}
function O3(e, t) {
  return e.replaceAll(wi(), (n, r) => t({
    shortcode: n,
    name: r
  }));
}
var P3 = {};
ae(P3, {
  useFetchImplementation: () => H3,
  validateGithub: () => Z3
});
var mi;
try {
  mi = fetch;
} catch {
}
function H3(e) {
  mi = e;
}
async function Z3(e, t, n) {
  try {
    return await (await mi(`https://gist.github.com/${t}/${n}/raw`)).text() === `Verifying that I control the following Nostr public key: ${e}`;
  } catch {
    return !1;
  }
}
var W3 = {};
ae(W3, {
  makeNwcRequestEvent: () => F3,
  parseConnectionString: () => D3
});
function D3(e) {
  const { host: t, pathname: n, searchParams: r } = new URL(e), o = n || t, i = r.get("relay"), s = r.get("secret");
  if (!o || !i || !s)
    throw new Error("invalid connection string");
  return { pubkey: o, relay: i, secret: s };
}
async function F3(e, t, n) {
  const o = f0(t, e, JSON.stringify({
    method: "pay_invoice",
    params: {
      invoice: n
    }
  })), i = {
    kind: o0,
    created_at: Math.round(Date.now() / 1e3),
    content: o,
    tags: [["p", e]]
  };
  return Ne(i, t);
}
var V3 = {};
ae(V3, {
  normalizeIdentifier: () => G3
});
function G3(e) {
  return e = e.trim().toLowerCase(), e = e.normalize("NFKC"), Array.from(e).map((t) => /\p{Letter}/u.test(t) || /\p{Number}/u.test(t) ? t : "-").join("");
}
var j3 = {};
ae(j3, {
  getSatoshisAmountFromBolt11: () => Y3,
  getZapEndpoint: () => q3,
  makeZapReceipt: () => J3,
  makeZapRequest: () => K3,
  useFetchImplementation: () => z3,
  validateZapRequest: () => Q3
});
var yi;
try {
  yi = fetch;
} catch {
}
function z3(e) {
  yi = e;
}
async function q3(e) {
  try {
    let t = "", { lud06: n, lud16: r } = JSON.parse(e.content);
    if (r) {
      let [s, c] = r.split("@");
      t = new URL(`/.well-known/lnurlp/${s}`, `https://${c}`).toString();
    } else if (n) {
      let { words: s } = Zt.decode(n, 1e3), c = Zt.fromWords(s);
      t = je.decode(c);
    } else
      return null;
    let i = await (await yi(t)).json();
    if (i.allowsNostr && i.nostrPubkey)
      return i.callback;
  } catch {
  }
  return null;
}
function K3(e) {
  let t = {
    kind: 9734,
    created_at: Math.round(Date.now() / 1e3),
    content: e.comment || "",
    tags: [
      ["p", "pubkey" in e ? e.pubkey : e.event.pubkey],
      ["amount", e.amount.toString()],
      ["relays", ...e.relays]
    ]
  };
  if ("event" in e) {
    if (t.tags.push(["e", e.event.id]), ti(e.event.kind)) {
      const n = ["a", `${e.event.kind}:${e.event.pubkey}:`];
      t.tags.push(n);
    } else if (ni(e.event.kind)) {
      let n = e.event.tags.find(([o, i]) => o === "d" && i);
      if (!n)
        throw new Error("d tag not found or is empty");
      const r = ["a", `${e.event.kind}:${e.event.pubkey}:${n[1]}`];
      t.tags.push(r);
    }
    t.tags.push(["k", e.event.kind.toString()]);
  }
  return t;
}
function Q3(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return "Invalid zap request JSON.";
  }
  if (!Yo(t))
    return "Zap request is not a valid Nostr event.";
  if (!cr(t))
    return "Invalid signature on zap request.";
  let n = t.tags.find(([i, s]) => i === "p" && s);
  if (!n)
    return "Zap request doesn't have a 'p' tag.";
  if (!n[1].match(/^[a-f0-9]{64}$/))
    return "Zap request 'p' tag is not valid hex.";
  let r = t.tags.find(([i, s]) => i === "e" && s);
  return r && !r[1].match(/^[a-f0-9]{64}$/) ? "Zap request 'e' tag is not valid hex." : t.tags.find(([i, s]) => i === "relays" && s) ? null : "Zap request doesn't have a 'relays' tag.";
}
function J3({
  zapRequest: e,
  preimage: t,
  bolt11: n,
  paidAt: r
}) {
  let o = JSON.parse(e), i = o.tags.filter(([c]) => c === "e" || c === "p" || c === "a"), s = {
    kind: 9735,
    created_at: Math.round(r.getTime() / 1e3),
    content: "",
    tags: [...i, ["P", o.pubkey], ["bolt11", n], ["description", e]]
  };
  return t && s.tags.push(["preimage", t]), s;
}
function Y3(e) {
  if (e.length < 50)
    return 0;
  e = e.substring(0, 50);
  const t = e.lastIndexOf("1");
  if (t === -1)
    return 0;
  const n = e.substring(0, t);
  if (!n.startsWith("lnbc"))
    return 0;
  const r = n.substring(4);
  if (r.length < 1)
    return 0;
  const o = r[r.length - 1], i = o.charCodeAt(0) - 48, s = i >= 0 && i <= 9;
  let c = r.length - 1;
  if (s && c++, c < 1)
    return 0;
  const a = parseInt(r.substring(0, c));
  switch (o) {
    case "m":
      return a * 1e5;
    case "u":
      return a * 100;
    case "n":
      return a / 10;
    case "p":
      return a / 1e4;
    default:
      return a * 1e8;
  }
}
var X3 = {};
ae(X3, {
  Negentropy: () => N0,
  NegentropyStorageVector: () => n5,
  NegentropySync: () => r5
});
var Rr = 97, Ot = 32, $0 = 16, ht = {
  Skip: 0,
  Fingerprint: 1,
  IdList: 2
}, Ve = class {
  _raw;
  length;
  constructor(e) {
    typeof e == "number" ? (this._raw = new Uint8Array(e), this.length = 0) : e instanceof Uint8Array ? (this._raw = new Uint8Array(e), this.length = e.length) : (this._raw = new Uint8Array(512), this.length = 0);
  }
  unwrap() {
    return this._raw.subarray(0, this.length);
  }
  get capacity() {
    return this._raw.byteLength;
  }
  extend(e) {
    if (e instanceof Ve && (e = e.unwrap()), typeof e.length != "number")
      throw Error("bad length");
    const t = e.length + this.length;
    if (this.capacity < t) {
      const n = this._raw, r = Math.max(this.capacity * 2, t);
      this._raw = new Uint8Array(r), this._raw.set(n);
    }
    this._raw.set(e, this.length), this.length += e.length;
  }
  shift() {
    const e = this._raw[0];
    return this._raw = this._raw.subarray(1), this.length--, e;
  }
  shiftN(e = 1) {
    const t = this._raw.subarray(0, e);
    return this._raw = this._raw.subarray(e), this.length -= e, t;
  }
};
function kn(e) {
  let t = 0;
  for (; ; ) {
    if (e.length === 0)
      throw Error("parse ends prematurely");
    let n = e.shift();
    if (t = t << 7 | n & 127, (n & 128) === 0)
      break;
  }
  return t;
}
function Fe(e) {
  if (e === 0)
    return new Ve(new Uint8Array([0]));
  let t = [];
  for (; e !== 0; )
    t.push(e & 127), e >>>= 7;
  t.reverse();
  for (let n = 0; n < t.length - 1; n++)
    t[n] |= 128;
  return new Ve(new Uint8Array(t));
}
function e5(e) {
  return Pn(e, 1)[0];
}
function Pn(e, t) {
  if (e.length < t)
    throw Error("parse ends prematurely");
  return e.shiftN(t);
}
var t5 = class {
  buf;
  constructor() {
    this.setToZero();
  }
  setToZero() {
    this.buf = new Uint8Array(Ot);
  }
  add(e) {
    let t = 0, n = 0, r = new DataView(this.buf.buffer), o = new DataView(e.buffer);
    for (let i = 0; i < 8; i++) {
      let s = i * 4, c = r.getUint32(s, !0), a = o.getUint32(s, !0), l = c;
      l += t, l += a, l > 4294967295 && (n = 1), r.setUint32(s, l & 4294967295, !0), t = n, n = 0;
    }
  }
  negate() {
    let e = new DataView(this.buf.buffer);
    for (let n = 0; n < 8; n++) {
      let r = n * 4;
      e.setUint32(r, ~e.getUint32(r, !0));
    }
    let t = new Uint8Array(Ot);
    t[0] = 1, this.add(t);
  }
  getFingerprint(e) {
    let t = new Ve();
    return t.extend(this.buf), t.extend(Fe(e)), He(t.unwrap()).subarray(0, $0);
  }
}, n5 = class {
  items;
  sealed;
  constructor() {
    this.items = [], this.sealed = !1;
  }
  insert(e, t) {
    if (this.sealed)
      throw Error("already sealed");
    const n = ne(t);
    if (n.byteLength !== Ot)
      throw Error("bad id size for added item");
    this.items.push({ timestamp: e, id: n });
  }
  seal() {
    if (this.sealed)
      throw Error("already sealed");
    this.sealed = !0, this.items.sort($r);
    for (let e = 1; e < this.items.length; e++)
      if ($r(this.items[e - 1], this.items[e]) === 0)
        throw Error("duplicate item inserted");
  }
  unseal() {
    this.sealed = !1;
  }
  size() {
    return this._checkSealed(), this.items.length;
  }
  getItem(e) {
    if (this._checkSealed(), e >= this.items.length)
      throw Error("out of range");
    return this.items[e];
  }
  iterate(e, t, n) {
    this._checkSealed(), this._checkBounds(e, t);
    for (let r = e; r < t && n(this.items[r], r); ++r)
      ;
  }
  findLowerBound(e, t, n) {
    return this._checkSealed(), this._checkBounds(e, t), this._binarySearch(this.items, e, t, (r) => $r(r, n) < 0);
  }
  fingerprint(e, t) {
    let n = new t5();
    return n.setToZero(), this.iterate(e, t, (r) => (n.add(r.id), !0)), n.getFingerprint(t - e);
  }
  _checkSealed() {
    if (!this.sealed)
      throw Error("not sealed");
  }
  _checkBounds(e, t) {
    if (e > t || t > this.items.length)
      throw Error("bad range");
  }
  _binarySearch(e, t, n, r) {
    let o = n - t;
    for (; o > 0; ) {
      let i = t, s = Math.floor(o / 2);
      i += s, r(e[i]) ? (t = ++i, o -= s + 1) : o = s;
    }
    return t;
  }
}, N0 = class {
  storage;
  frameSizeLimit;
  lastTimestampIn;
  lastTimestampOut;
  constructor(e, t = 6e4) {
    if (t < 4096)
      throw Error("frameSizeLimit too small");
    this.storage = e, this.frameSizeLimit = t, this.lastTimestampIn = 0, this.lastTimestampOut = 0;
  }
  _bound(e, t) {
    return { timestamp: e, id: t || new Uint8Array(0) };
  }
  initiate() {
    let e = new Ve();
    return e.extend(new Uint8Array([Rr])), this.splitRange(0, this.storage.size(), this._bound(Number.MAX_VALUE), e), ie(e.unwrap());
  }
  reconcile(e, t, n) {
    const r = new Ve(ne(e));
    this.lastTimestampIn = this.lastTimestampOut = 0;
    let o = new Ve();
    o.extend(new Uint8Array([Rr]));
    let i = e5(r);
    if (i < 96 || i > 111)
      throw Error("invalid negentropy protocol version byte");
    if (i !== Rr)
      throw Error("unsupported negentropy protocol version requested: " + (i - 96));
    let s = this.storage.size(), c = this._bound(0), a = 0, l = !1;
    for (; r.length !== 0; ) {
      let p = new Ve(), u = () => {
        l && (l = !1, p.extend(this.encodeBound(c)), p.extend(Fe(ht.Skip)));
      }, y = this.decodeBound(r), w = kn(r), b = a, C = this.storage.findLowerBound(a, s, y);
      if (w === ht.Skip)
        l = !0;
      else if (w === ht.Fingerprint) {
        let A = Pn(r, $0), k = this.storage.fingerprint(b, C);
        B0(A, k) !== 0 ? (u(), this.splitRange(b, C, y, p)) : l = !0;
      } else if (w === ht.IdList) {
        let A = kn(r), k = {};
        for (let _ = 0; _ < A; _++) {
          let F = Pn(r, Ot);
          k[ie(F)] = F;
        }
        if (l = !0, this.storage.iterate(b, C, (_) => {
          let F = _.id;
          const V = ie(F);
          return k[V] ? delete k[ie(F)] : t?.(V), !0;
        }), n)
          for (let _ of Object.values(k))
            n(ie(_));
      } else
        throw Error("unexpected mode");
      if (this.exceededFrameSizeLimit(o.length + p.length)) {
        let A = this.storage.fingerprint(C, s);
        o.extend(this.encodeBound(this._bound(Number.MAX_VALUE))), o.extend(Fe(ht.Fingerprint)), o.extend(A);
        break;
      } else
        o.extend(p);
      a = C, c = y;
    }
    return o.length === 1 ? null : ie(o.unwrap());
  }
  splitRange(e, t, n, r) {
    let o = t - e, i = 16;
    if (o < i * 2)
      r.extend(this.encodeBound(n)), r.extend(Fe(ht.IdList)), r.extend(Fe(o)), this.storage.iterate(e, t, (s) => (r.extend(s.id), !0));
    else {
      let s = Math.floor(o / i), c = o % i, a = e;
      for (let l = 0; l < i; l++) {
        let p = s + (l < c ? 1 : 0), u = this.storage.fingerprint(a, a + p);
        a += p;
        let y;
        if (a === t)
          y = n;
        else {
          let w, b;
          this.storage.iterate(a - 1, a + 1, (C, A) => (A === a - 1 ? w = C : b = C, !0)), y = this.getMinimalBound(w, b);
        }
        r.extend(this.encodeBound(y)), r.extend(Fe(ht.Fingerprint)), r.extend(u);
      }
    }
  }
  exceededFrameSizeLimit(e) {
    return e > this.frameSizeLimit - 200;
  }
  decodeTimestampIn(e) {
    let t = kn(e);
    return t = t === 0 ? Number.MAX_VALUE : t - 1, this.lastTimestampIn === Number.MAX_VALUE || t === Number.MAX_VALUE ? (this.lastTimestampIn = Number.MAX_VALUE, Number.MAX_VALUE) : (t += this.lastTimestampIn, this.lastTimestampIn = t, t);
  }
  decodeBound(e) {
    let t = this.decodeTimestampIn(e), n = kn(e);
    if (n > Ot)
      throw Error("bound key too long");
    let r = Pn(e, n);
    return { timestamp: t, id: r };
  }
  encodeTimestampOut(e) {
    if (e === Number.MAX_VALUE)
      return this.lastTimestampOut = Number.MAX_VALUE, Fe(0);
    let t = e;
    return e -= this.lastTimestampOut, this.lastTimestampOut = t, Fe(e + 1);
  }
  encodeBound(e) {
    let t = new Ve();
    return t.extend(this.encodeTimestampOut(e.timestamp)), t.extend(Fe(e.id.length)), t.extend(e.id), t;
  }
  getMinimalBound(e, t) {
    if (t.timestamp !== e.timestamp)
      return this._bound(t.timestamp);
    {
      let n = 0, r = t.id, o = e.id;
      for (let i = 0; i < Ot && r[i] === o[i]; i++)
        n++;
      return this._bound(t.timestamp, t.id.subarray(0, n + 1));
    }
  }
};
function B0(e, t) {
  for (let n = 0; n < e.byteLength; n++) {
    if (e[n] < t[n])
      return -1;
    if (e[n] > t[n])
      return 1;
  }
  return e.byteLength > t.byteLength ? 1 : e.byteLength < t.byteLength ? -1 : 0;
}
function $r(e, t) {
  return e.timestamp === t.timestamp ? B0(e.id, t.id) : e.timestamp - t.timestamp;
}
var r5 = class {
  relay;
  storage;
  neg;
  filter;
  subscription;
  onhave;
  onneed;
  constructor(e, t, n, r = {}) {
    this.relay = e, this.storage = t, this.neg = new N0(t), this.onhave = r.onhave, this.onneed = r.onneed, this.filter = n, this.subscription = this.relay.prepareSubscription([{}], { label: r.label || "negentropy" }), this.subscription.oncustom = (o) => {
      switch (o[0]) {
        case "NEG-MSG": {
          o.length < 3 && console.warn(`got invalid NEG-MSG from ${this.relay.url}: ${o}`);
          try {
            const i = this.neg.reconcile(o[2], this.onhave, this.onneed);
            i ? this.relay.send(`["NEG-MSG", "${this.subscription.id}", "${i}"]`) : (this.close(), r.onclose?.());
          } catch (i) {
            console.error("negentropy reconcile error:", i), r?.onclose?.(`reconcile error: ${i}`);
          }
          break;
        }
        case "NEG-CLOSE": {
          const i = o[2];
          console.warn("negentropy error:", i), r.onclose?.(i);
          break;
        }
        case "NEG-ERR":
          r.onclose?.();
      }
    };
  }
  async start() {
    const e = this.neg.initiate();
    this.relay.send(`["NEG-OPEN","${this.subscription.id}",${JSON.stringify(this.filter)},"${e}"]`);
  }
  close() {
    this.relay.send(`["NEG-CLOSE","${this.subscription.id}"]`), this.subscription.close();
  }
}, o5 = {};
ae(o5, {
  getToken: () => i5,
  hashPayload: () => bi,
  unpackEventFromToken: () => I0,
  validateEvent: () => D0,
  validateEventKind: () => P0,
  validateEventMethodTag: () => Z0,
  validateEventPayloadTag: () => W0,
  validateEventTimestamp: () => O0,
  validateEventUrlTag: () => H0,
  validateToken: () => s5
});
var U0 = "Nostr ";
async function i5(e, t, n, r = !1, o) {
  const i = {
    kind: si,
    tags: [
      ["u", e],
      ["method", t]
    ],
    created_at: Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3),
    content: ""
  };
  o && i.tags.push(["payload", bi(o)]);
  const s = await n(i);
  return (r ? U0 : "") + lt.encode(Me.encode(JSON.stringify(s)));
}
async function s5(e, t, n) {
  const r = await I0(e).catch((i) => {
    throw i;
  });
  return await D0(r, t, n).catch((i) => {
    throw i;
  });
}
async function I0(e) {
  if (!e)
    throw new Error("Missing token");
  e = e.replace(U0, "");
  const t = je.decode(lt.decode(e));
  if (!t || t.length === 0 || !t.startsWith("{"))
    throw new Error("Invalid token");
  return JSON.parse(t);
}
function O0(e) {
  return e.created_at ? Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3) - e.created_at < 60 : !1;
}
function P0(e) {
  return e.kind === si;
}
function H0(e, t) {
  const n = e.tags.find((r) => r[0] === "u");
  return n ? n.length > 0 && n[1] === t : !1;
}
function Z0(e, t) {
  const n = e.tags.find((r) => r[0] === "method");
  return n ? n.length > 0 && n[1].toLowerCase() === t.toLowerCase() : !1;
}
function bi(e) {
  const t = He(Me.encode(JSON.stringify(e)));
  return ie(t);
}
function W0(e, t) {
  const n = e.tags.find((o) => o[0] === "payload");
  if (!n)
    return !1;
  const r = bi(t);
  return n.length > 0 && n[1] === r;
}
async function D0(e, t, n, r) {
  if (!cr(e))
    throw new Error("Invalid nostr event, signature invalid");
  if (!P0(e))
    throw new Error("Invalid nostr event, kind invalid");
  if (!O0(e))
    throw new Error("Invalid nostr event, created_at timestamp invalid");
  if (!H0(e, t))
    throw new Error("Invalid nostr event, url tag invalid");
  if (!Z0(e, n))
    throw new Error("Invalid nostr event, method tag invalid");
  if (r && typeof r == "object" && Object.keys(r).length > 0 && !W0(e, r))
    throw new Error("Invalid nostr event, payload tag does not match request body hash");
  return !0;
}
class ut extends Error {
  constructor(t, n) {
    super(t), this.code = n;
  }
}
class F0 extends ut {
}
class a5 extends ut {
}
class V0 extends ut {
}
class as extends V0 {
}
class cs extends V0 {
}
class ls extends ut {
}
class ds extends ut {
}
class Nr extends ut {
}
class c5 extends ut {
}
class l5 extends ut {
}
function Sn(e) {
  try {
    e.indexOf("://") === -1 && (e = "wss://" + e);
    const t = new URL(e);
    return t.protocol === "http:" ? t.protocol = "ws:" : t.protocol === "https:" && (t.protocol = "wss:"), t.pathname = t.pathname.replace(/\/+/g, "/"), t.pathname.endsWith("/") && (t.pathname = t.pathname.slice(0, -1)), (t.port === "80" && t.protocol === "ws:" || t.port === "443" && t.protocol === "wss:") && (t.port = ""), t.searchParams.sort(), t.hash = "", t.toString();
  } catch {
    throw new Error(`Invalid URL: ${e}`);
  }
}
const d5 = 1e3, u5 = 300 * 1e3, h5 = 1e3;
class G0 {
  constructor() {
    this.relays = /* @__PURE__ */ new Map(), this.enablePing = !1, this.maxWaitForConnection = 3e3;
  }
  async ensureRelay(t, n) {
    t = Sn(t);
    let r = this.relays.get(t);
    r || (r = new u0(t, {
      enablePing: this.enablePing,
      enableReconnect: !1
    }), r.onclose = () => {
      this.relays.delete(t);
    }, this.relays.set(t, r));
    try {
      await r.connect({
        timeout: n?.connectionTimeout,
        abort: n?.abort
      });
    } catch (o) {
      throw this.relays.delete(t), o;
    }
    return r;
  }
  close(t) {
    t.map(Sn).forEach((n) => {
      this.relays.get(n)?.close(), this.relays.delete(n);
    });
  }
  subscribe(t, n, r) {
    const o = [], i = /* @__PURE__ */ new Set();
    for (const w of t) {
      const b = Sn(w);
      i.has(b) || (i.add(b), o.push(b));
    }
    let s = !1;
    const c = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), p = (w) => {
      if (l.has(w))
        return !0;
      if (l.add(w), l.size > h5) {
        const b = l.values().next().value;
        b !== void 0 && l.delete(b);
      }
      return !1;
    }, u = (w) => {
      if (s)
        return Promise.resolve();
      const b = Math.min(d5 * 2 ** w, u5);
      return new Promise((C) => {
        const A = setTimeout(() => {
          a.delete(k), C();
        }, b), k = () => {
          clearTimeout(A), a.delete(k), C();
        };
        a.add(k);
      });
    }, y = async (w) => {
      let b = 0;
      for (; !s; ) {
        let C;
        try {
          C = await this.ensureRelay(w, {
            connectionTimeout: this.maxWaitForConnection,
            abort: r.abort
          });
        } catch (k) {
          if (s)
            return;
          const _ = k?.message || String(k);
          r.ondisconnect?.(w, _), await u(b++);
          continue;
        }
        if (s)
          return;
        r.onconnect?.(w), b = 0;
        const A = await new Promise((k) => {
          const _ = C.subscribe([n], {
            eoseTimeout: 1,
            // 1ms (if 0 is provided, uses default of 4400ms)
            onevent: r.onevent,
            onclose: k,
            abort: r.abort,
            alreadyHaveEvent: p
          });
          c.set(w, _);
        });
        if (c.delete(w), s)
          return;
        r.ondisconnect?.(w, A), await u(b++);
      }
    };
    return o.forEach((w) => {
      y(w);
    }), {
      close(w) {
        s || (s = !0, a.forEach((b) => b()), a.clear(), c.forEach((b) => b.close(w)), c.clear());
      }
    };
  }
  publish(t, n, r) {
    return t.map(Sn).map(async (o, i, s) => {
      if (s.indexOf(o) !== i)
        return Promise.reject("duplicate url");
      let c;
      try {
        c = await this.ensureRelay(o, {
          connectionTimeout: this.maxWaitForConnection,
          abort: r?.abort
        });
      } catch (a) {
        return "connection failure: " + String(a);
      }
      return c.publish(n);
    });
  }
  listConnectionStatus() {
    const t = /* @__PURE__ */ new Map();
    return this.relays.forEach((n, r) => t.set(r, n.connected)), t;
  }
  destroy() {
    this.relays.forEach((t) => t.close()), this.relays = /* @__PURE__ */ new Map();
  }
}
const us = /^[0-9a-f]{64}$/;
class dt {
  static parseWalletConnectUrl(t, n = !1) {
    t = t.replace("nostrwalletconnect://", "http://").replace("nostr+walletconnect://", "http://").replace("nostrwalletconnect:", "http://").replace("nostr+walletconnect:", "http://");
    const r = new URL(t), o = r.searchParams.getAll("relay"), i = {
      walletPubkey: r.host,
      relayUrls: o
    }, s = r.searchParams.get("secret");
    s && (i.secret = s);
    const c = r.searchParams.get("lud16");
    if (c && (i.lud16 = c), !i.walletPubkey)
      throw new Error("Invalid NWC URL: missing wallet pubkey");
    if (!us.test(i.walletPubkey))
      throw new Error("Invalid NWC URL: invalid wallet pubkey");
    if (!i.relayUrls?.length)
      throw new Error("Invalid NWC URL: no relay URLs provided");
    for (const a of i.relayUrls)
      try {
        new URL(a);
      } catch {
        throw new Error(`Invalid relay URL: ${a}`);
      }
    if (n && !i.secret)
      throw new Error("Invalid NWC URL: missing secret parameter");
    if (i.secret && !us.test(i.secret))
      throw new Error("Invalid NWC URL: invalid secret");
    return i;
  }
  constructor(t) {
    t && t.nostrWalletConnectUrl && (t = {
      ...dt.parseWalletConnectUrl(t.nostrWalletConnectUrl, t.requireSecret),
      ...t
    }), this.options = {
      ...t || {}
    }, this.relayUrls = this.options.relayUrls, this.logger = t?.logger || n1, this.pool = new G0(), this.options.secret && (this.secret = this.options.secret.toLowerCase().startsWith("nsec") ? yo.decode(this.options.secret).data : this.options.secret), this.lud16 = this.options.lud16, this.walletPubkey = this.options.walletPubkey.toLowerCase().startsWith("npub") ? yo.decode(this.options.walletPubkey).data : this.options.walletPubkey;
  }
  get nostrWalletConnectUrl() {
    return this.getNostrWalletConnectUrl();
  }
  getNostrWalletConnectUrl(t = !0) {
    let n = `nostr+walletconnect://${this.walletPubkey}?relay=${this.relayUrls.join("&relay=")}&pubkey=${this.publicKey}`;
    return t && (n = `${n}&secret=${this.secret}`), this.lud16 && (n = `${n}&lud16=${this.lud16}`), n;
  }
  get connected() {
    const t = Array.from(this.pool.listConnectionStatus().values());
    return !!t.length && t.includes(!0);
  }
  get publicKey() {
    if (!this.secret)
      throw new Error("Missing secret key");
    return Dt(ne(this.secret));
  }
  get encryptionType() {
    if (!this._encryptionType)
      throw new Error("Missing encryption or version");
    return this._encryptionType;
  }
  getPublicKey() {
    return Promise.resolve(this.publicKey);
  }
  signEvent(t) {
    if (!this.secret)
      throw new Error("Missing secret key");
    return Promise.resolve(Ne(t, ne(this.secret)));
  }
  getEventHash(t) {
    return on(t);
  }
  close() {
    return this.pool.close(this.relayUrls);
  }
  async encrypt(t, n) {
    if (!this.secret)
      throw new Error("Missing secret");
    let r;
    if (this.encryptionType === "nip04")
      r = await bo.encrypt(this.secret, t, n);
    else {
      const o = nn.getConversationKey(ne(this.secret), t);
      r = nn.encrypt(n, o);
    }
    return r;
  }
  async decrypt(t, n) {
    if (!this.secret)
      throw new Error("Missing secret");
    let r;
    if (this.encryptionType === "nip04")
      r = await bo.decrypt(this.secret, t, n);
    else {
      const o = nn.getConversationKey(ne(this.secret), t);
      r = nn.decrypt(n, o);
    }
    return r;
  }
  static getAuthorizationUrl(t, n = {}, r) {
    if (t.indexOf("/#/") > -1)
      throw new Error("hash router paths not supported");
    const o = new URL(t);
    return n.name && o.searchParams.set("name", n.name), o.searchParams.set("pubkey", r), n.returnTo && o.searchParams.set("return_to", n.returnTo), n.budgetRenewal && o.searchParams.set("budget_renewal", n.budgetRenewal), n.expiresAt && o.searchParams.set("expires_at", Math.floor(n.expiresAt.getTime() / 1e3).toString()), n.maxAmount && o.searchParams.set("max_amount", n.maxAmount.toString()), n.requestMethods && o.searchParams.set("request_methods", n.requestMethods.join(" ")), n.notificationTypes && o.searchParams.set("notification_types", n.notificationTypes.join(" ")), n.isolated && o.searchParams.set("isolated", "true"), n.metadata && o.searchParams.set("metadata", JSON.stringify(n.metadata)), o;
  }
  /**
   * create a new client-initiated NWC connection via HTTP deeplink
   *
   * @param authorizationBasePath the deeplink path e.g. https://my.albyhub.com/apps/new
   * @param options configure the created app (e.g. the name, budget, expiration)
   * @param secret optionally pass a secret, otherwise one will be generated.
   */
  static fromAuthorizationUrl(t, n = {}, r) {
    r = r || ie(ei()), n.name || (n.name = document.location.host);
    const o = this.getAuthorizationUrl(t, n, Dt(ne(r))), i = 600, s = 400, c = window.outerHeight / 2 + window.screenY - i / 2, a = window.outerWidth / 2 + window.screenX - s / 2;
    return new Promise((l, p) => {
      const u = window.open(o.toString(), `${document.title} - Wallet Connect`, `height=${i},width=${s},top=${c},left=${a}`);
      if (!u) {
        p(new Error("failed to execute window.open"));
        return;
      }
      const y = () => {
        u && u.closed && (clearInterval(b), window.removeEventListener("message", w), p(new Error("Popup closed")));
      }, w = (C) => {
        const A = C.data;
        if (A && A.type === "nwc:success" && C.origin === `${o.protocol}//${o.host}`) {
          if (!A.relayUrls && A.relayUrl && (A.relayUrls = [A.relayUrl]), !A.relayUrls) {
            p(new Error("no relayUrls or relayUrl in response"));
            return;
          }
          if (!A.walletPubkey) {
            p(new Error("no walletPubkey in response"));
            return;
          }
          l(new dt({
            relayUrls: A.relayUrls,
            walletPubkey: A.walletPubkey,
            secret: r,
            lud16: A.lud16
          })), clearInterval(b), window.removeEventListener("message", w), u && u.close();
        }
      }, b = setInterval(y, 500);
      window.addEventListener("message", w);
    });
  }
  async getWalletServiceInfo() {
    await this._checkConnected();
    const t = await new Promise((c, a) => {
      let l = !1;
      const p = setTimeout(() => {
        l || (l = !0, u.close(), a(new Error("no info event (kind 13194) returned from relay")));
      }, 1e4), u = this.pool.subscribe(this.relayUrls, {
        kinds: [13194],
        limit: 1,
        authors: [this.walletPubkey]
      }, {
        onevent: (y) => {
          l || (l = !0, clearTimeout(p), u.close(), c(y));
        }
      });
    }), n = t.content, r = t.tags.find((c) => c[0] === "notifications"), o = t.tags.find((c) => c[0] === "v"), i = t.tags.find((c) => c[0] === "encryption");
    let s = ["nip04"];
    return o && o[1].includes("1.0") && s.push("nip44_v2"), i && (s = i[1].split(" ")), {
      encryptions: s,
      // delimiter is " " per spec, but Alby NWC originally returned ","
      capabilities: n.split(/[ |,]/g),
      notifications: r?.[1]?.split(" ") || []
    };
  }
  async getInfo() {
    try {
      return await this.executeNip47Request("get_info", {}, (n) => !!n.methods, { replyTimeout: 1e4 });
    } catch (t) {
      throw console.error("Failed to request get_info", t), t;
    }
  }
  async getBudget() {
    try {
      return await this.executeNip47Request("get_budget", {}, (n) => n !== void 0, { replyTimeout: 1e4 });
    } catch (t) {
      throw console.error("Failed to request get_budget", t), t;
    }
  }
  async getBalance() {
    try {
      return await this.executeNip47Request("get_balance", {}, (n) => n.balance !== void 0, { replyTimeout: 1e4 });
    } catch (t) {
      throw console.error("Failed to request get_balance", t), t;
    }
  }
  async payInvoice(t) {
    try {
      return await this.executeNip47Request("pay_invoice", t, (r) => !!r);
    } catch (n) {
      throw console.error("Failed to request pay_invoice", n), n;
    }
  }
  async payKeysend(t) {
    try {
      return await this.executeNip47Request("pay_keysend", t, (r) => !!r.preimage);
    } catch (n) {
      throw console.error("Failed to request pay_keysend", n), n;
    }
  }
  async signMessage(t) {
    try {
      return await this.executeNip47Request("sign_message", t, (r) => r.message === t.message && !!r.signature);
    } catch (n) {
      throw console.error("Failed to request sign_message", n), n;
    }
  }
  async createConnection(t) {
    try {
      return await this.executeNip47Request("create_connection", t, (r) => !!r.wallet_pubkey);
    } catch (n) {
      throw console.error("Failed to request create_connection", n), n;
    }
  }
  async multiPayInvoice(t) {
    try {
      return {
        invoices: await this.executeMultiNip47Request("multi_pay_invoice", t, t.invoices.length, (r) => !!r.preimage),
        // TODO: error handling
        errors: []
      };
    } catch (n) {
      throw console.error("Failed to request multi_pay_invoice", n), n;
    }
  }
  async multiPayKeysend(t) {
    try {
      return {
        keysends: await this.executeMultiNip47Request("multi_pay_keysend", t, t.keysends.length, (r) => !!r.preimage),
        // TODO: error handling
        errors: []
      };
    } catch (n) {
      throw console.error("Failed to request multi_pay_keysend", n), n;
    }
  }
  async makeInvoice(t) {
    try {
      if (!t.amount)
        throw new Error("No amount specified");
      return await this.executeNip47Request("make_invoice", t, (r) => !!r.invoice);
    } catch (n) {
      throw console.error("Failed to request make_invoice", n), n;
    }
  }
  async makeHoldInvoice(t) {
    try {
      if (!t.amount)
        throw new Error("No amount specified");
      if (!t.payment_hash)
        throw new Error("No payment hash specified");
      return await this.executeNip47Request("make_hold_invoice", t, (r) => !!r.invoice);
    } catch (n) {
      throw console.error("Failed to request make_hold_invoice", n), n;
    }
  }
  async settleHoldInvoice(t) {
    try {
      return await this.executeNip47Request("settle_hold_invoice", t, (r) => !!r);
    } catch (n) {
      throw console.error("Failed to request settle_hold_invoice", n), n;
    }
  }
  async cancelHoldInvoice(t) {
    try {
      return await this.executeNip47Request("cancel_hold_invoice", t, (r) => !!r);
    } catch (n) {
      throw console.error("Failed to request cancel_hold_invoice", n), n;
    }
  }
  async lookupInvoice(t) {
    try {
      return await this.executeNip47Request("lookup_invoice", t, (r) => !!r.invoice);
    } catch (n) {
      throw console.error("Failed to request lookup_invoice", n), n;
    }
  }
  async listTransactions(t) {
    try {
      return await this.executeNip47Request("list_transactions", t, (r) => !!r.transactions, { replyTimeout: 1e4 });
    } catch (n) {
      throw console.error("Failed to request list_transactions", n), n;
    }
  }
  async subscribeNotifications(t, n) {
    this.logger.debug("checking connection to relays"), await this._checkConnected(), await this._selectEncryptionType(), this.logger.debug("subscribing to relays");
    const r = this.pool.subscribe(this.relayUrls, {
      kinds: [...this.encryptionType === "nip04" ? [23196] : [23197]],
      authors: [this.walletPubkey],
      "#p": [this.publicKey]
    }, {
      onevent: async (o) => {
        let i;
        try {
          i = await this.decrypt(this.walletPubkey, o.content);
        } catch (c) {
          console.error("failed to decrypt request event content", c);
          return;
        }
        let s;
        try {
          s = JSON.parse(i);
        } catch (c) {
          console.error("Failed to parse decrypted event content", c);
          return;
        }
        s.notification ? (!n || n.indexOf(s.notification_type) > -1) && t(s) : console.error("No notification in response", s);
      },
      onconnect: (o) => {
        this.logger.debug("relay connected", o);
      },
      ondisconnect: (o, i) => {
        this.logger.debug("relay disconnected", o, i);
      }
    });
    return this.logger.debug("subscribed to relays"), () => {
      r?.close();
    };
  }
  async executeNip47Request(t, n, r, o) {
    return await this._checkConnected(), await this._selectEncryptionType(), new Promise((i, s) => {
      (async () => {
        const c = {
          method: t,
          params: n
        }, a = await this.encrypt(this.walletPubkey, JSON.stringify(c)), l = {
          kind: 23194,
          created_at: Math.floor(Date.now() / 1e3),
          tags: [
            ["p", this.walletPubkey],
            // TODO: Remove version tag after 01-06-2025
            ["v", this.encryptionType === "nip44_v2" ? "1.0" : "0.0"],
            ["encryption", this.encryptionType]
          ],
          content: a
        }, p = await this.signEvent(l), u = this.pool.subscribe(this.relayUrls, {
          kinds: [23195],
          authors: [this.walletPubkey],
          "#e": [p.id]
        }, {
          onevent: async (A) => {
            clearTimeout(w), u.close();
            const k = await this.decrypt(this.walletPubkey, A.content);
            let _;
            try {
              _ = JSON.parse(k);
            } catch {
              clearTimeout(w), u.close(), s(new ds("failed to deserialize response", "INTERNAL"));
              return;
            }
            _.result ? r(_.result) ? i(_.result) : (clearTimeout(w), u.close(), s(new Nr("response from NWC failed validation: " + JSON.stringify(_.result), "INTERNAL"))) : (clearTimeout(w), u.close(), s(new a5(_.error?.message || "unknown Error", _.error?.code || "INTERNAL")));
          }
        });
        function y() {
          u.close(), s(new cs(`reply timeout: event ${p.id}`, "INTERNAL"));
        }
        const w = setTimeout(y, o?.replyTimeout || 6e4);
        function b() {
          u.close(), s(new as(`publish timeout: ${p.id}`, "INTERNAL"));
        }
        const C = setTimeout(b, o?.publishTimeout || 5e3);
        try {
          await Promise.any(this.pool.publish(this.relayUrls, p)), clearTimeout(C);
        } catch (A) {
          clearTimeout(C), s(new ls(`failed to publish: ${A}`, "INTERNAL"));
        }
      })();
    });
  }
  /**
   * @deprecated
   * multi- methods were removed from NIP-47.
   */
  async executeMultiNip47Request(t, n, r, o, i) {
    await this._checkConnected(), await this._selectEncryptionType();
    const s = [];
    return new Promise((c, a) => {
      (async () => {
        const l = {
          method: t,
          params: n
        }, p = await this.encrypt(this.walletPubkey, JSON.stringify(l)), u = {
          kind: 23194,
          created_at: Math.floor(Date.now() / 1e3),
          tags: [
            ["p", this.walletPubkey],
            // TODO: Remove version tag after 01-06-2025
            ["v", this.encryptionType === "nip44_v2" ? "1.0" : "0.0"],
            ["encryption", this.encryptionType]
          ],
          content: p
        }, y = await this.signEvent(u), w = this.pool.subscribe(this.relayUrls, {
          kinds: [23195],
          authors: [this.walletPubkey],
          "#e": [y.id]
        }, {
          onevent: async (_) => {
            const F = await this.decrypt(this.walletPubkey, _.content);
            let V;
            try {
              V = JSON.parse(F);
            } catch {
              clearTimeout(C), w.close(), a(new ds("failed to deserialize response", "INTERNAL"));
            }
            if (V.result) {
              if (!o(V.result)) {
                clearTimeout(C), w.close(), a(new Nr("Response from NWC failed validation: " + JSON.stringify(V.result), "INTERNAL"));
                return;
              }
              const S = _.tags.find((M) => M[0] === "d")?.[1];
              if (S === void 0) {
                clearTimeout(C), w.close(), a(new Nr("No d tag found in response event", "INTERNAL"));
                return;
              }
              s.push({
                ...V.result,
                dTag: S
              }), s.length === r && (clearTimeout(C), w.close(), c(s));
            } else
              clearTimeout(C), w.close(), a(new c5(V.error?.message, V.error?.code));
          }
        });
        function b() {
          w.close(), a(new cs(`reply timeout: event ${y.id}`, "INTERNAL"));
        }
        const C = setTimeout(b, i?.replyTimeout || 6e4);
        function A() {
          w.close(), a(new as(`Publish timeout: ${y.id}`, "INTERNAL"));
        }
        const k = setTimeout(A, i?.publishTimeout || 5e3);
        try {
          await Promise.any(this.pool.publish(this.relayUrls, y)), clearTimeout(k);
        } catch (_) {
          clearTimeout(k), a(new ls(`Failed to publish: ${_}`, "INTERNAL"));
        }
      })();
    });
  }
  async _checkConnected() {
    if (!this.secret)
      throw new Error("Missing secret key");
    if (!this.relayUrls)
      throw new Error("Missing relay url");
    try {
      await Promise.any(this.relayUrls.map((t) => this.pool.ensureRelay(t)));
    } catch (t) {
      throw console.error("failed to connect to any relay", t), new F0("Failed to connect to " + this.relayUrls.join(","), "OTHER");
    }
  }
  async _selectEncryptionType() {
    if (!this._encryptionType) {
      const t = await this.getWalletServiceInfo(), n = this._findPreferredEncryptionType(t.encryptions);
      if (!n)
        throw new l5("no compatible encryption or version found between wallet and client", "UNSUPPORTED_ENCRYPTION");
      n === "nip04" && console.warn("NIP-04 encryption is about to be deprecated. Please upgrade your wallet service to use NIP-44 instead."), this._encryptionType = n;
    }
  }
  _findPreferredEncryptionType(t) {
    return t.includes("nip44_v2") ? "nip44_v2" : t.includes("nip04") ? "nip04" : null;
  }
}
const f5 = {
  get_info: "getInfo",
  get_balance: "getBalance",
  make_invoice: "makeInvoice",
  pay_invoice: "sendPayment",
  pay_keysend: "payKeysend",
  lookup_invoice: "lookupInvoice",
  list_transactions: "listTransactions",
  multi_pay_invoice: "sendMultiPayment",
  multi_pay_keysend: "multiKeysend",
  sign_message: "signMessage"
};
class pr {
  get options() {
    return this.client.options;
  }
  static async fromAuthorizationUrl(t, n = {}, r) {
    const o = await dt.fromAuthorizationUrl(t, n, r);
    return new pr({
      client: o
    });
  }
  constructor(t) {
    this._enabled = !1, this.client = t?.client || new dt(t), this.subscribers = {};
  }
  on(t, n) {
    this.subscribers[t] = n;
  }
  notify(t, n) {
    const r = this.subscribers[t];
    r && r(n);
  }
  getPublicKey() {
    return this.client.getPublicKey();
  }
  signEvent(t) {
    return this.client.signEvent(t);
  }
  async enable() {
    this._enabled = !0;
  }
  close() {
    return this.client.close();
  }
  async getInfo() {
    await this.checkEnabled();
    const t = ["lightning", "nostr"], n = "Alby JS SDK";
    try {
      const r = await this.client.getInfo(), o = {
        methods: r.methods.map((i) => f5[i]),
        node: {
          alias: r.alias,
          pubkey: r.pubkey,
          color: r.color
        },
        supports: t,
        version: n
      };
      return this.notify("getInfo", o), o;
    } catch (r) {
      return console.error("Using minimal getInfo", r), {
        methods: ["sendPayment"],
        node: {},
        supports: t,
        version: n
      };
    }
  }
  async getBalance() {
    await this.checkEnabled();
    const t = await this.client.getBalance(), n = {
      // NWC uses msats - convert to sats for webln
      balance: Math.floor(t.balance / 1e3),
      currency: "sats"
    };
    return this.notify("getBalance", n), n;
  }
  async sendPayment(t) {
    await this.checkEnabled();
    const r = { preimage: (await this.client.payInvoice({ invoice: t })).preimage };
    return this.notify("sendPayment", r), r;
  }
  async sendPaymentAsync(t) {
    return await this.checkEnabled(), this.client.payInvoice({ invoice: t }), this.notify("sendPaymentAsync", {}), {};
  }
  async keysend(t) {
    await this.checkEnabled();
    const r = { preimage: (await this.client.payKeysend(hs(t))).preimage };
    return this.notify("keysend", r), r;
  }
  async signMessage(t) {
    await this.checkEnabled();
    const n = await this.client.signMessage({
      message: t
    }), r = {
      message: n.message,
      signature: n.signature
    };
    return this.notify("keysend", r), r;
  }
  async makeInvoice(t) {
    await this.checkEnabled();
    const n = typeof t == "object" ? t : void 0, r = +(n?.amount ?? t);
    if (!r)
      throw new Error("No amount specified");
    const i = { paymentRequest: (await this.client.makeInvoice({
      amount: r * 1e3,
      // NIP-47 uses msat
      description: n?.defaultMemo
      // TODO: support additional fields below
      //expiry: 86500,
      //description_hash: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    })).invoice };
    return this.notify("makeInvoice", i), i;
  }
  async lookupInvoice(t) {
    await this.checkEnabled();
    const n = await this.client.lookupInvoice({
      invoice: t.paymentRequest,
      payment_hash: t.paymentHash
    }), r = {
      preimage: n.preimage,
      paymentRequest: n.invoice,
      paid: !!n.settled_at
    };
    return this.notify("lookupInvoice", r), r;
  }
  async listTransactions(t) {
    await this.checkEnabled();
    const r = {
      transactions: (await this.client.listTransactions(t)).transactions.map(p5)
    };
    return this.notify("listTransactions", r), r;
  }
  // NOTE: this method may change - it has not been proposed to be added to the WebLN spec yet.
  async sendMultiPayment(t) {
    await this.checkEnabled();
    const r = {
      payments: (await this.client.multiPayInvoice({
        invoices: t.map((o, i) => ({
          invoice: o,
          id: i.toString()
        }))
      })).invoices.map((o) => {
        const i = t[parseInt(o.dTag)];
        if (!i)
          throw new Error("Could not find paymentRequest matching response d tag");
        return {
          paymentRequest: i,
          preimage: o.preimage
        };
      }),
      // TODO: error handling
      errors: []
    };
    return this.notify("sendMultiPayment", r), r;
  }
  // NOTE: this method may change - it has not been proposed to be added to the WebLN spec yet.
  async multiKeysend(t) {
    await this.checkEnabled();
    const r = {
      keysends: (await this.client.multiPayKeysend({
        keysends: t.map((o, i) => ({
          ...hs(o),
          id: i.toString()
        }))
      })).keysends.map((o) => {
        const i = t[parseInt(o.dTag)];
        if (!i)
          throw new Error("Could not find keysend matching response d tag");
        return {
          keysend: i,
          preimage: o.preimage
        };
      }),
      // TODO: error handling
      errors: []
    };
    return this.notify("multiKeysend", r), r;
  }
  // not-yet implemented WebLN interface methods
  lnurl(t) {
    throw new Error("Method not implemented.");
  }
  request(t, n) {
    throw new Error("Method not implemented.");
  }
  verifyMessage(t, n) {
    throw new Error("Method not implemented.");
  }
  async checkEnabled() {
    if (!this._enabled)
      throw new Error("please call enable() and await the promise before calling this function");
  }
}
function p5(e) {
  return {
    ...e,
    // NWC uses msats - convert to sats for webln
    amount: Math.floor(e.amount / 1e3),
    fees_paid: e.fees_paid ? Math.floor(e.fees_paid / 1e3) : 0
  };
}
function hs(e) {
  return {
    amount: +e.amount * 1e3,
    // NIP-47 uses msat
    pubkey: e.destination,
    tlv_records: e.customRecords ? Object.entries(e.customRecords).map((t) => ({
      type: parseInt(t[0]),
      value: S2(new TextEncoder().encode(t[1]))
    })) : []
    // TODO: support optional preimage
    // preimage?: "123",
  };
}
class j0 {
  constructor(t) {
    if (this.appSecretKey = t.appSecretKey || ie(ei()), this.options = {
      ...t,
      appPubkey: Dt(ne(this.appSecretKey))
    }, !this.options.relayUrls)
      throw new Error("Missing relay urls");
    if (!this.options.requestMethods)
      throw new Error("Missing request methods");
    this.pool = new G0(), this.logger = t.logger || n1;
  }
  /**
   * returns the NWA connection URI which should be given to the wallet
   */
  get connectionUri() {
    return this.getConnectionUri();
  }
  /**
   * returns the NWA connection URI which should be given to the wallet
   * @param nwaSchemeSuffix open a specific wallet. e.g. "alby" will set the scheme to
   * nostr+walletauth+alby to ensure the link will be opened in an Alby wallet
   */
  getConnectionUri(t = "") {
    const n = new URLSearchParams({
      request_methods: this.options.requestMethods.join(" "),
      ...this.options.name ? { name: this.options.name } : {},
      ...this.options.icon ? { icon: this.options.icon } : {},
      ...this.options.returnTo ? { return_to: this.options.returnTo } : {},
      ...this.options.notificationTypes ? {
        notification_types: this.options.notificationTypes.join(" ")
      } : {},
      ...this.options.maxAmount ? { max_amount: this.options.maxAmount.toString() } : {},
      ...this.options.budgetRenewal ? { budget_renewal: this.options.budgetRenewal } : {},
      ...this.options.expiresAt ? { expires_at: this.options.expiresAt.toString() } : {},
      ...this.options.isolated ? { isolated: this.options.isolated.toString() } : {},
      ...this.options.metadata ? { metadata: JSON.stringify(this.options.metadata) } : {}
    });
    for (const r of this.options.relayUrls)
      n.append("relay", r);
    return `nostr+walletauth${t ? `+${t}` : ""}://${this.options.appPubkey}?${n.toString().replace(/\+/g, "%20")}`;
  }
  static parseWalletAuthUrl(t) {
    if (!t.startsWith("nostr+walletauth"))
      throw new Error("Unexpected scheme. Should be nostr+walletauth:// or nostr+walletauth+specificapp://");
    const n = t.indexOf(":");
    t = t.substring(n + 1), t.startsWith("//") && (t = t.substring(2)), t = "http://" + t;
    const r = new URL(t), o = r.host;
    if (o?.length !== 64)
      throw new Error("Incorrect app pubkey found in auth string");
    const i = r.searchParams.getAll("relay");
    if (!i)
      throw new Error("No relay URL found in auth string");
    const s = r.searchParams.get("request_methods")?.split(" ");
    if (!s?.length)
      throw new Error("No request methods found in auth string");
    const c = r.searchParams.get("notification_types")?.split(" "), a = r.searchParams.get("max_amount"), l = r.searchParams.get("expires_at"), p = r.searchParams.get("metadata");
    return {
      name: r.searchParams.get("name") || void 0,
      icon: r.searchParams.get("icon") || void 0,
      returnTo: r.searchParams.get("return_to") || void 0,
      relayUrls: i,
      appPubkey: o,
      requestMethods: s,
      notificationTypes: c,
      budgetRenewal: r.searchParams.get("budget_renewal"),
      expiresAt: l ? parseInt(l) : void 0,
      maxAmount: a ? parseInt(a) : void 0,
      isolated: r.searchParams.get("isolated") === "true",
      metadata: p ? JSON.parse(p) : void 0
    };
  }
  /**
   * Waits for a new app connection to be created via NWA (https://github.com/nostr-protocol/nips/pull/851)
   *
   * @returns a new NWCClient
   */
  async subscribe(t) {
    this.logger.debug("checking connection to relays"), await this._checkConnected(), this.logger.debug("subscribing to info event");
    const n = this.pool.subscribe(this.options.relayUrls, {
      kinds: [13194],
      // NIP-47 info event
      "#p": [this.options.appPubkey]
    }, {
      onevent: async (r) => {
        const o = new dt({
          relayUrls: this.options.relayUrls,
          secret: this.appSecretKey,
          walletPubkey: r.pubkey
        });
        try {
          const i = await o.getInfo();
          o.options.lud16 = i.lud16, o.lud16 = i.lud16;
        } catch (i) {
          console.error("failed to fetch get_info", i);
        }
        t.onSuccess(o), n?.close();
      },
      onconnect: (r) => {
        this.logger.debug("relay connected", r);
      },
      ondisconnect: (r, o) => {
        this.logger.debug("relay disconnected", r, o);
      }
    });
    return {
      unsub: () => {
        n?.close();
      }
    };
  }
  close() {
    return this.pool.close(this.options.relayUrls);
  }
  async _checkConnected() {
    if (!this.appSecretKey)
      throw new Error("Missing secret key");
    if (!this.options.relayUrls)
      throw new Error("Missing relay urls");
    try {
      await Promise.any(this.options.relayUrls.map((t) => this.pool.ensureRelay(t)));
    } catch (t) {
      throw console.error("failed to connect to any relay", t), new F0("Failed to connect to " + this.options.relayUrls.join(","), "OTHER");
    }
  }
}
const g5 = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
if (!g5)
  throw new Error("Non little-endian hardware is not supported");
var Br = {}, fs;
function w5() {
  return fs || (fs = 1, (function(e) {
    /*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
    Object.defineProperty(e, "__esModule", { value: !0 }), e.bytes = e.stringToBytes = e.str = e.bytesToString = e.hex = e.utf8 = e.bech32m = e.bech32 = e.base58check = e.base58xmr = e.base58xrp = e.base58flickr = e.base58 = e.base64url = e.base64 = e.base32crockford = e.base32hex = e.base32 = e.base16 = e.utils = e.assertNumber = void 0;
    function t(h) {
      if (!Number.isSafeInteger(h))
        throw new Error(`Wrong integer: ${h}`);
    }
    e.assertNumber = t;
    function n(...h) {
      const f = (g, v) => (x) => g(v(x)), d = Array.from(h).reverse().reduce((g, v) => g ? f(g, v.encode) : v.encode, void 0), m = h.reduce((g, v) => g ? f(g, v.decode) : v.decode, void 0);
      return { encode: d, decode: m };
    }
    function r(h) {
      return {
        encode: (f) => {
          if (!Array.isArray(f) || f.length && typeof f[0] != "number")
            throw new Error("alphabet.encode input should be an array of numbers");
          return f.map((d) => {
            if (t(d), d < 0 || d >= h.length)
              throw new Error(`Digit index outside alphabet: ${d} (alphabet: ${h.length})`);
            return h[d];
          });
        },
        decode: (f) => {
          if (!Array.isArray(f) || f.length && typeof f[0] != "string")
            throw new Error("alphabet.decode input should be array of strings");
          return f.map((d) => {
            if (typeof d != "string")
              throw new Error(`alphabet.decode: not string element=${d}`);
            const m = h.indexOf(d);
            if (m === -1)
              throw new Error(`Unknown letter: "${d}". Allowed: ${h}`);
            return m;
          });
        }
      };
    }
    function o(h = "") {
      if (typeof h != "string")
        throw new Error("join separator should be string");
      return {
        encode: (f) => {
          if (!Array.isArray(f) || f.length && typeof f[0] != "string")
            throw new Error("join.encode input should be array of strings");
          for (let d of f)
            if (typeof d != "string")
              throw new Error(`join.encode: non-string input=${d}`);
          return f.join(h);
        },
        decode: (f) => {
          if (typeof f != "string")
            throw new Error("join.decode input should be string");
          return f.split(h);
        }
      };
    }
    function i(h, f = "=") {
      if (t(h), typeof f != "string")
        throw new Error("padding chr should be string");
      return {
        encode(d) {
          if (!Array.isArray(d) || d.length && typeof d[0] != "string")
            throw new Error("padding.encode input should be array of strings");
          for (let m of d)
            if (typeof m != "string")
              throw new Error(`padding.encode: non-string input=${m}`);
          for (; d.length * h % 8; )
            d.push(f);
          return d;
        },
        decode(d) {
          if (!Array.isArray(d) || d.length && typeof d[0] != "string")
            throw new Error("padding.encode input should be array of strings");
          for (let g of d)
            if (typeof g != "string")
              throw new Error(`padding.decode: non-string input=${g}`);
          let m = d.length;
          if (m * h % 8)
            throw new Error("Invalid padding: string should have whole number of bytes");
          for (; m > 0 && d[m - 1] === f; m--)
            if (!((m - 1) * h % 8))
              throw new Error("Invalid padding: string has too much padding");
          return d.slice(0, m);
        }
      };
    }
    function s(h) {
      if (typeof h != "function")
        throw new Error("normalize fn should be function");
      return { encode: (f) => f, decode: (f) => h(f) };
    }
    function c(h, f, d) {
      if (f < 2)
        throw new Error(`convertRadix: wrong from=${f}, base cannot be less than 2`);
      if (d < 2)
        throw new Error(`convertRadix: wrong to=${d}, base cannot be less than 2`);
      if (!Array.isArray(h))
        throw new Error("convertRadix: data should be array");
      if (!h.length)
        return [];
      let m = 0;
      const g = [], v = Array.from(h);
      for (v.forEach((x) => {
        if (t(x), x < 0 || x >= f)
          throw new Error(`Wrong integer: ${x}`);
      }); ; ) {
        let x = 0, U = !0;
        for (let L = m; L < v.length; L++) {
          const N = v[L], E = f * x + N;
          if (!Number.isSafeInteger(E) || f * x / f !== x || E - N !== f * x)
            throw new Error("convertRadix: carry overflow");
          if (x = E % d, v[L] = Math.floor(E / d), !Number.isSafeInteger(v[L]) || v[L] * d + x !== E)
            throw new Error("convertRadix: carry overflow");
          if (U)
            v[L] ? U = !1 : m = L;
          else continue;
        }
        if (g.push(x), U)
          break;
      }
      for (let x = 0; x < h.length - 1 && h[x] === 0; x++)
        g.push(0);
      return g.reverse();
    }
    const a = (h, f) => f ? a(f, h % f) : h, l = (h, f) => h + (f - a(h, f));
    function p(h, f, d, m) {
      if (!Array.isArray(h))
        throw new Error("convertRadix2: data should be array");
      if (f <= 0 || f > 32)
        throw new Error(`convertRadix2: wrong from=${f}`);
      if (d <= 0 || d > 32)
        throw new Error(`convertRadix2: wrong to=${d}`);
      if (l(f, d) > 32)
        throw new Error(`convertRadix2: carry overflow from=${f} to=${d} carryBits=${l(f, d)}`);
      let g = 0, v = 0;
      const x = 2 ** d - 1, U = [];
      for (const L of h) {
        if (t(L), L >= 2 ** f)
          throw new Error(`convertRadix2: invalid data word=${L} from=${f}`);
        if (g = g << f | L, v + f > 32)
          throw new Error(`convertRadix2: carry overflow pos=${v} from=${f}`);
        for (v += f; v >= d; v -= d)
          U.push((g >> v - d & x) >>> 0);
        g &= 2 ** v - 1;
      }
      if (g = g << d - v & x, !m && v >= f)
        throw new Error("Excess padding");
      if (!m && g)
        throw new Error(`Non-zero padding: ${g}`);
      return m && v > 0 && U.push(g >>> 0), U;
    }
    function u(h) {
      return t(h), {
        encode: (f) => {
          if (!(f instanceof Uint8Array))
            throw new Error("radix.encode input should be Uint8Array");
          return c(Array.from(f), 2 ** 8, h);
        },
        decode: (f) => {
          if (!Array.isArray(f) || f.length && typeof f[0] != "number")
            throw new Error("radix.decode input should be array of strings");
          return Uint8Array.from(c(f, h, 2 ** 8));
        }
      };
    }
    function y(h, f = !1) {
      if (t(h), h <= 0 || h > 32)
        throw new Error("radix2: bits should be in (0..32]");
      if (l(8, h) > 32 || l(h, 8) > 32)
        throw new Error("radix2: carry overflow");
      return {
        encode: (d) => {
          if (!(d instanceof Uint8Array))
            throw new Error("radix2.encode input should be Uint8Array");
          return p(Array.from(d), 8, h, !f);
        },
        decode: (d) => {
          if (!Array.isArray(d) || d.length && typeof d[0] != "number")
            throw new Error("radix2.decode input should be array of strings");
          return Uint8Array.from(p(d, h, 8, f));
        }
      };
    }
    function w(h) {
      if (typeof h != "function")
        throw new Error("unsafeWrapper fn should be function");
      return function(...f) {
        try {
          return h.apply(null, f);
        } catch {
        }
      };
    }
    function b(h, f) {
      if (t(h), typeof f != "function")
        throw new Error("checksum fn should be function");
      return {
        encode(d) {
          if (!(d instanceof Uint8Array))
            throw new Error("checksum.encode: input should be Uint8Array");
          const m = f(d).slice(0, h), g = new Uint8Array(d.length + h);
          return g.set(d), g.set(m, d.length), g;
        },
        decode(d) {
          if (!(d instanceof Uint8Array))
            throw new Error("checksum.decode: input should be Uint8Array");
          const m = d.slice(0, -h), g = f(m).slice(0, h), v = d.slice(-h);
          for (let x = 0; x < h; x++)
            if (g[x] !== v[x])
              throw new Error("Invalid checksum");
          return m;
        }
      };
    }
    e.utils = { alphabet: r, chain: n, checksum: b, radix: u, radix2: y, join: o, padding: i }, e.base16 = n(y(4), r("0123456789ABCDEF"), o("")), e.base32 = n(y(5), r("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), i(5), o("")), e.base32hex = n(y(5), r("0123456789ABCDEFGHIJKLMNOPQRSTUV"), i(5), o("")), e.base32crockford = n(y(5), r("0123456789ABCDEFGHJKMNPQRSTVWXYZ"), o(""), s((h) => h.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1"))), e.base64 = n(y(6), r("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), i(6), o("")), e.base64url = n(y(6), r("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), i(6), o(""));
    const C = (h) => n(u(58), r(h), o(""));
    e.base58 = C("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"), e.base58flickr = C("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"), e.base58xrp = C("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz");
    const A = [0, 2, 3, 5, 6, 7, 9, 10, 11];
    e.base58xmr = {
      encode(h) {
        let f = "";
        for (let d = 0; d < h.length; d += 8) {
          const m = h.subarray(d, d + 8);
          f += e.base58.encode(m).padStart(A[m.length], "1");
        }
        return f;
      },
      decode(h) {
        let f = [];
        for (let d = 0; d < h.length; d += 11) {
          const m = h.slice(d, d + 11), g = A.indexOf(m.length), v = e.base58.decode(m);
          for (let x = 0; x < v.length - g; x++)
            if (v[x] !== 0)
              throw new Error("base58xmr: wrong padding");
          f = f.concat(Array.from(v.slice(v.length - g)));
        }
        return Uint8Array.from(f);
      }
    };
    const k = (h) => n(b(4, (f) => h(h(f))), e.base58);
    e.base58check = k;
    const _ = n(r("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), o("")), F = [996825010, 642813549, 513874426, 1027748829, 705979059];
    function V(h) {
      const f = h >> 25;
      let d = (h & 33554431) << 5;
      for (let m = 0; m < F.length; m++)
        (f >> m & 1) === 1 && (d ^= F[m]);
      return d;
    }
    function S(h, f, d = 1) {
      const m = h.length;
      let g = 1;
      for (let v = 0; v < m; v++) {
        const x = h.charCodeAt(v);
        if (x < 33 || x > 126)
          throw new Error(`Invalid prefix (${h})`);
        g = V(g) ^ x >> 5;
      }
      g = V(g);
      for (let v = 0; v < m; v++)
        g = V(g) ^ h.charCodeAt(v) & 31;
      for (let v of f)
        g = V(g) ^ v;
      for (let v = 0; v < 6; v++)
        g = V(g);
      return g ^= d, _.encode(p([g % 2 ** 30], 30, 5, !1));
    }
    function M(h) {
      const f = h === "bech32" ? 1 : 734539939, d = y(5), m = d.decode, g = d.encode, v = w(m);
      function x(E, B, j = 90) {
        if (typeof E != "string")
          throw new Error(`bech32.encode prefix should be string, not ${typeof E}`);
        if (!Array.isArray(B) || B.length && typeof B[0] != "number")
          throw new Error(`bech32.encode words should be array of numbers, not ${typeof B}`);
        const G = E.length + 7 + B.length;
        if (j !== !1 && G > j)
          throw new TypeError(`Length ${G} exceeds limit ${j}`);
        return E = E.toLowerCase(), `${E}1${_.encode(B)}${S(E, B, f)}`;
      }
      function U(E, B = 90) {
        if (typeof E != "string")
          throw new Error(`bech32.decode input should be string, not ${typeof E}`);
        if (E.length < 8 || B !== !1 && E.length > B)
          throw new TypeError(`Wrong string length: ${E.length} (${E}). Expected (8..${B})`);
        const j = E.toLowerCase();
        if (E !== j && E !== E.toUpperCase())
          throw new Error("String must be lowercase or uppercase");
        E = j;
        const G = E.lastIndexOf("1");
        if (G === 0 || G === -1)
          throw new Error('Letter "1" must be present between prefix and data only');
        const H = E.slice(0, G), z = E.slice(G + 1);
        if (z.length < 6)
          throw new Error("Data must be at least 6 characters long");
        const Q = _.decode(z).slice(0, -6), le = S(H, Q, f);
        if (!z.endsWith(le))
          throw new Error(`Invalid checksum in ${E}: expected "${le}"`);
        return { prefix: H, words: Q };
      }
      const L = w(U);
      function N(E) {
        const { prefix: B, words: j } = U(E, !1);
        return { prefix: B, words: j, bytes: m(j) };
      }
      return { encode: x, decode: U, decodeToBytes: N, decodeUnsafe: L, fromWords: m, fromWordsUnsafe: v, toWords: g };
    }
    e.bech32 = M("bech32"), e.bech32m = M("bech32m"), e.utf8 = {
      encode: (h) => new TextDecoder().decode(h),
      decode: (h) => new TextEncoder().encode(h)
    }, e.hex = n(y(4), r("0123456789abcdef"), o(""), s((h) => {
      if (typeof h != "string" || h.length % 2)
        throw new TypeError(`hex.decode: expected string, got ${typeof h} with length ${h.length}`);
      return h.toLowerCase();
    }));
    const R = {
      utf8: e.utf8,
      hex: e.hex,
      base16: e.base16,
      base32: e.base32,
      base64: e.base64,
      base64url: e.base64url,
      base58: e.base58,
      base58xmr: e.base58xmr
    }, D = `Invalid encoding type. Available types: ${Object.keys(R).join(", ")}`, $ = (h, f) => {
      if (typeof h != "string" || !R.hasOwnProperty(h))
        throw new TypeError(D);
      if (!(f instanceof Uint8Array))
        throw new TypeError("bytesToString() expects Uint8Array");
      return R[h].encode(f);
    };
    e.bytesToString = $, e.str = e.bytesToString;
    const P = (h, f) => {
      if (!R.hasOwnProperty(h))
        throw new TypeError(D);
      if (typeof f != "string")
        throw new TypeError("stringToBytes() expects string");
      return R[h].decode(f);
    };
    e.stringToBytes = P, e.bytes = e.stringToBytes;
  })(Br)), Br;
}
var Ur, ps;
function m5() {
  if (ps) return Ur;
  ps = 1;
  const { bech32: e, hex: t, utf8: n } = w5(), r = {
    // default network is bitcoin
    bech32: "bc",
    pubKeyHash: 0,
    scriptHash: 5,
    validWitnessVersions: [0]
  }, o = {
    bech32: "tb",
    pubKeyHash: 111,
    scriptHash: 196,
    validWitnessVersions: [0]
  }, i = {
    bech32: "tbs",
    pubKeyHash: 111,
    scriptHash: 196,
    validWitnessVersions: [0]
  }, s = {
    bech32: "bcrt",
    pubKeyHash: 111,
    scriptHash: 196,
    validWitnessVersions: [0]
  }, c = {
    bech32: "sb",
    pubKeyHash: 63,
    scriptHash: 123,
    validWitnessVersions: [0]
  }, a = [
    "option_data_loss_protect",
    "initial_routing_sync",
    "option_upfront_shutdown_script",
    "gossip_queries",
    "var_onion_optin",
    "gossip_queries_ex",
    "option_static_remotekey",
    "payment_secret",
    "basic_mpp",
    "option_support_large_channel"
  ], l = {
    m: BigInt(1e3),
    u: BigInt(1e6),
    n: BigInt(1e9),
    p: BigInt(1e12)
  }, p = BigInt("2100000000000000000"), u = BigInt(1e11), y = {
    payment_hash: 1,
    payment_secret: 16,
    description: 13,
    payee: 19,
    description_hash: 23,
    // commit to longer descriptions (used by lnurl-pay)
    expiry: 6,
    // default: 3600 (1 hour)
    min_final_cltv_expiry: 24,
    // default: 9
    fallback_address: 9,
    route_hint: 3,
    // for extra routing info (private etc.)
    feature_bits: 5,
    metadata: 27
  }, w = {};
  for (let S = 0, M = Object.keys(y); S < M.length; S++) {
    const R = M[S], D = y[M[S]].toString();
    w[D] = R;
  }
  const b = {
    1: (S) => t.encode(e.fromWordsUnsafe(S)),
    // 256 bits
    16: (S) => t.encode(e.fromWordsUnsafe(S)),
    // 256 bits
    13: (S) => n.encode(e.fromWordsUnsafe(S)),
    // string variable length
    19: (S) => t.encode(e.fromWordsUnsafe(S)),
    // 264 bits
    23: (S) => t.encode(e.fromWordsUnsafe(S)),
    // 256 bits
    27: (S) => t.encode(e.fromWordsUnsafe(S)),
    // variable
    6: A,
    // default: 3600 (1 hour)
    24: A,
    // default: 9
    3: k,
    // for extra routing info (private etc.)
    5: _
    // keep feature bits as array of 5 bit words
  };
  function C(S) {
    return (M) => ({
      tagCode: parseInt(S),
      words: e.encode("unknown", M, Number.MAX_SAFE_INTEGER)
    });
  }
  function A(S) {
    return S.reverse().reduce((M, R, D) => M + R * Math.pow(32, D), 0);
  }
  function k(S) {
    const M = [];
    let R, D, $, P, h, f = e.fromWordsUnsafe(S);
    for (; f.length > 0; )
      R = t.encode(f.slice(0, 33)), D = t.encode(f.slice(33, 41)), $ = parseInt(t.encode(f.slice(41, 45)), 16), P = parseInt(
        t.encode(f.slice(45, 49)),
        16
      ), h = parseInt(t.encode(f.slice(49, 51)), 16), f = f.slice(51), M.push({
        pubkey: R,
        short_channel_id: D,
        fee_base_msat: $,
        fee_proportional_millionths: P,
        cltv_expiry_delta: h
      });
    return M;
  }
  function _(S) {
    const M = S.slice().reverse().map(($) => [
      !!($ & 1),
      !!($ & 2),
      !!($ & 4),
      !!($ & 8),
      !!($ & 16)
    ]).reduce(($, P) => $.concat(P), []);
    for (; M.length < a.length * 2; )
      M.push(!1);
    const R = {};
    a.forEach(($, P) => {
      let h;
      M[P * 2] ? h = "required" : M[P * 2 + 1] ? h = "supported" : h = "unsupported", R[$] = h;
    });
    const D = M.slice(a.length * 2);
    return R.extra_bits = {
      start_bit: a.length * 2,
      bits: D,
      has_required: D.reduce(
        ($, P, h) => h % 2 !== 0 ? $ || !1 : $ || P,
        !1
      )
    }, R;
  }
  function F(S, M) {
    let R, D;
    if (S.slice(-1).match(/^[munp]$/))
      R = S.slice(-1), D = S.slice(0, -1);
    else {
      if (S.slice(-1).match(/^[^munp0-9]$/))
        throw new Error("Not a valid multiplier for the amount");
      D = S;
    }
    if (!D.match(/^\d+$/))
      throw new Error("Not a valid human readable amount");
    const $ = BigInt(D), P = R ? $ * u / l[R] : $ * u;
    if (R === "p" && $ % BigInt(10) !== BigInt(0) || P > p)
      throw new Error("Amount is outside of valid range");
    return M ? P.toString() : P;
  }
  function V(S, M) {
    if (typeof S != "string")
      throw new Error("Lightning Payment Request must be string");
    if (S.slice(0, 2).toLowerCase() !== "ln")
      throw new Error("Not a proper lightning payment request");
    const R = [], D = e.decode(S, Number.MAX_SAFE_INTEGER);
    S = S.toLowerCase();
    const $ = D.prefix;
    let P = D.words, h = S.slice($.length + 1), f = P.slice(-104);
    P = P.slice(0, -104);
    let d = $.match(/^ln(\S+?)(\d*)([a-zA-Z]?)$/);
    if (d && !d[2] && (d = $.match(/^ln(\S+)$/)), !d)
      throw new Error("Not a proper lightning payment request");
    R.push({
      name: "lightning_network",
      letters: "ln"
    });
    const m = d[1];
    let g;
    if (M) {
      if (M.bech32 === void 0 || M.pubKeyHash === void 0 || M.scriptHash === void 0 || !Array.isArray(M.validWitnessVersions))
        throw new Error("Invalid network");
      g = M;
    } else
      switch (m) {
        case r.bech32:
          g = r;
          break;
        case o.bech32:
          g = o;
          break;
        case i.bech32:
          g = i;
          break;
        case s.bech32:
          g = s;
          break;
        case c.bech32:
          g = c;
          break;
      }
    if (!g || g.bech32 !== m)
      throw new Error("Unknown coin bech32 prefix");
    R.push({
      name: "coin_network",
      letters: m,
      value: g
    });
    const v = d[2];
    let x;
    if (v) {
      const H = d[3];
      x = F(v + H, !0), R.push({
        name: "amount",
        letters: d[2] + d[3],
        value: x
      });
    } else
      x = null;
    R.push({
      name: "separator",
      letters: "1"
    });
    const U = A(P.slice(0, 7));
    P = P.slice(7), R.push({
      name: "timestamp",
      letters: h.slice(0, 7),
      value: U
    }), h = h.slice(7);
    let L, N, E, B;
    for (; P.length > 0; ) {
      const H = P[0].toString();
      L = w[H] || "unknown_tag", N = b[H] || C(H), P = P.slice(1), E = A(P.slice(0, 2)), P = P.slice(2), B = P.slice(0, E), P = P.slice(E), R.push({
        name: L,
        tag: h[0],
        letters: h.slice(0, 3 + E),
        value: N(B)
        // see: parsers for more comments
      }), h = h.slice(3 + E);
    }
    R.push({
      name: "signature",
      letters: h.slice(0, 104),
      value: t.encode(e.fromWordsUnsafe(f))
    }), h = h.slice(104), R.push({
      name: "checksum",
      letters: h
    });
    let j = {
      paymentRequest: S,
      sections: R,
      get expiry() {
        let H = R.find((z) => z.name === "expiry");
        if (H) return G("timestamp") + H.value;
      },
      get route_hints() {
        return R.filter((H) => H.name === "route_hint").map((H) => H.value);
      }
    };
    for (let H in y)
      H !== "route_hint" && Object.defineProperty(j, H, {
        get() {
          return G(H);
        }
      });
    return j;
    function G(H) {
      let z = R.find((Q) => Q.name === H);
      return z ? z.value : void 0;
    }
  }
  return Ur = {
    decode: V,
    hrpToMillisat: F
  }, Ur;
}
m5();
const gs = (e) => {
  let t;
  const n = /* @__PURE__ */ new Set(), r = (l, p) => {
    const u = typeof l == "function" ? l(t) : l;
    if (!Object.is(u, t)) {
      const y = t;
      t = p ?? (typeof u != "object" || u === null) ? u : Object.assign({}, t, u), n.forEach((w) => w(t, y));
    }
  }, o = () => t, c = { setState: r, getState: o, getInitialState: () => a, subscribe: (l) => (n.add(l), () => n.delete(l)) }, a = t = e(r, o, c);
  return c;
}, y5 = ((e) => e ? gs(e) : gs);
function b5(e, ...t) {
  if (!(e instanceof Uint8Array))
    throw new Error("Expected Uint8Array");
  if (t.length > 0 && !t.includes(e.length))
    throw new Error(`Expected Uint8Array of length ${t}, not of length=${e.length}`);
}
function ws(e, t = !0) {
  if (e.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (t && e.finished)
    throw new Error("Hash#digest() has already been called");
}
function v5(e, t) {
  b5(e);
  const n = t.outputLen;
  if (e.length < n)
    throw new Error(`digestInto() expects output buffer of length at least ${n}`);
}
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const z0 = (e) => e instanceof Uint8Array, Ir = (e) => new DataView(e.buffer, e.byteOffset, e.byteLength), Ie = (e, t) => e << 32 - t | e >>> t, C5 = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
if (!C5)
  throw new Error("Non little-endian hardware is not supported");
const x5 = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function E5(e) {
  if (!z0(e))
    throw new Error("Uint8Array expected");
  let t = "";
  for (let n = 0; n < e.length; n++)
    t += x5[e[n]];
  return t;
}
function A5(e) {
  if (typeof e != "string")
    throw new Error(`utf8ToBytes expected string, got ${typeof e}`);
  return new Uint8Array(new TextEncoder().encode(e));
}
function q0(e) {
  if (typeof e == "string" && (e = A5(e)), !z0(e))
    throw new Error(`expected Uint8Array, got ${typeof e}`);
  return e;
}
class k5 {
  // Safe version that clones internal state
  clone() {
    return this._cloneInto();
  }
}
function S5(e) {
  const t = (r) => e().update(q0(r)).digest(), n = e();
  return t.outputLen = n.outputLen, t.blockLen = n.blockLen, t.create = () => e(), t;
}
function _5(e, t, n, r) {
  if (typeof e.setBigUint64 == "function")
    return e.setBigUint64(t, n, r);
  const o = BigInt(32), i = BigInt(4294967295), s = Number(n >> o & i), c = Number(n & i), a = r ? 4 : 0, l = r ? 0 : 4;
  e.setUint32(t + a, s, r), e.setUint32(t + l, c, r);
}
class L5 extends k5 {
  constructor(t, n, r, o) {
    super(), this.blockLen = t, this.outputLen = n, this.padOffset = r, this.isLE = o, this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.buffer = new Uint8Array(t), this.view = Ir(this.buffer);
  }
  update(t) {
    ws(this);
    const { view: n, buffer: r, blockLen: o } = this;
    t = q0(t);
    const i = t.length;
    for (let s = 0; s < i; ) {
      const c = Math.min(o - this.pos, i - s);
      if (c === o) {
        const a = Ir(t);
        for (; o <= i - s; s += o)
          this.process(a, s);
        continue;
      }
      r.set(t.subarray(s, s + c), this.pos), this.pos += c, s += c, this.pos === o && (this.process(n, 0), this.pos = 0);
    }
    return this.length += t.length, this.roundClean(), this;
  }
  digestInto(t) {
    ws(this), v5(t, this), this.finished = !0;
    const { buffer: n, view: r, blockLen: o, isLE: i } = this;
    let { pos: s } = this;
    n[s++] = 128, this.buffer.subarray(s).fill(0), this.padOffset > o - s && (this.process(r, 0), s = 0);
    for (let u = s; u < o; u++)
      n[u] = 0;
    _5(r, o - 8, BigInt(this.length * 8), i), this.process(r, 0);
    const c = Ir(t), a = this.outputLen;
    if (a % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const l = a / 4, p = this.get();
    if (l > p.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let u = 0; u < l; u++)
      c.setUint32(4 * u, p[u], i);
  }
  digest() {
    const { buffer: t, outputLen: n } = this;
    this.digestInto(t);
    const r = t.slice(0, n);
    return this.destroy(), r;
  }
  _cloneInto(t) {
    t || (t = new this.constructor()), t.set(...this.get());
    const { blockLen: n, buffer: r, length: o, finished: i, destroyed: s, pos: c } = this;
    return t.length = o, t.pos = c, t.finished = i, t.destroyed = s, o % n && t.buffer.set(r), t;
  }
}
const T5 = (e, t, n) => e & t ^ ~e & n, M5 = (e, t, n) => e & t ^ e & n ^ t & n, R5 = /* @__PURE__ */ new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]), Qe = /* @__PURE__ */ new Uint32Array([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), Je = /* @__PURE__ */ new Uint32Array(64);
class $5 extends L5 {
  constructor() {
    super(64, 32, 8, !1), this.A = Qe[0] | 0, this.B = Qe[1] | 0, this.C = Qe[2] | 0, this.D = Qe[3] | 0, this.E = Qe[4] | 0, this.F = Qe[5] | 0, this.G = Qe[6] | 0, this.H = Qe[7] | 0;
  }
  get() {
    const { A: t, B: n, C: r, D: o, E: i, F: s, G: c, H: a } = this;
    return [t, n, r, o, i, s, c, a];
  }
  // prettier-ignore
  set(t, n, r, o, i, s, c, a) {
    this.A = t | 0, this.B = n | 0, this.C = r | 0, this.D = o | 0, this.E = i | 0, this.F = s | 0, this.G = c | 0, this.H = a | 0;
  }
  process(t, n) {
    for (let u = 0; u < 16; u++, n += 4)
      Je[u] = t.getUint32(n, !1);
    for (let u = 16; u < 64; u++) {
      const y = Je[u - 15], w = Je[u - 2], b = Ie(y, 7) ^ Ie(y, 18) ^ y >>> 3, C = Ie(w, 17) ^ Ie(w, 19) ^ w >>> 10;
      Je[u] = C + Je[u - 7] + b + Je[u - 16] | 0;
    }
    let { A: r, B: o, C: i, D: s, E: c, F: a, G: l, H: p } = this;
    for (let u = 0; u < 64; u++) {
      const y = Ie(c, 6) ^ Ie(c, 11) ^ Ie(c, 25), w = p + y + T5(c, a, l) + R5[u] + Je[u] | 0, C = (Ie(r, 2) ^ Ie(r, 13) ^ Ie(r, 22)) + M5(r, o, i) | 0;
      p = l, l = a, a = c, c = s + w | 0, s = i, i = o, o = r, r = w + C | 0;
    }
    r = r + this.A | 0, o = o + this.B | 0, i = i + this.C | 0, s = s + this.D | 0, c = c + this.E | 0, a = a + this.F | 0, l = l + this.G | 0, p = p + this.H | 0, this.set(r, o, i, s, c, a, l, p);
  }
  roundClean() {
    Je.fill(0);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0), this.buffer.fill(0);
  }
}
const N5 = /* @__PURE__ */ S5(() => new $5());
var Or = {}, ms;
function B5() {
  return ms || (ms = 1, (function(e) {
    /*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
    Object.defineProperty(e, "__esModule", { value: !0 }), e.bytes = e.stringToBytes = e.str = e.bytesToString = e.hex = e.utf8 = e.bech32m = e.bech32 = e.base58check = e.base58xmr = e.base58xrp = e.base58flickr = e.base58 = e.base64url = e.base64 = e.base32crockford = e.base32hex = e.base32 = e.base16 = e.utils = e.assertNumber = void 0;
    function t(h) {
      if (!Number.isSafeInteger(h))
        throw new Error(`Wrong integer: ${h}`);
    }
    e.assertNumber = t;
    function n(...h) {
      const f = (g, v) => (x) => g(v(x)), d = Array.from(h).reverse().reduce((g, v) => g ? f(g, v.encode) : v.encode, void 0), m = h.reduce((g, v) => g ? f(g, v.decode) : v.decode, void 0);
      return { encode: d, decode: m };
    }
    function r(h) {
      return {
        encode: (f) => {
          if (!Array.isArray(f) || f.length && typeof f[0] != "number")
            throw new Error("alphabet.encode input should be an array of numbers");
          return f.map((d) => {
            if (t(d), d < 0 || d >= h.length)
              throw new Error(`Digit index outside alphabet: ${d} (alphabet: ${h.length})`);
            return h[d];
          });
        },
        decode: (f) => {
          if (!Array.isArray(f) || f.length && typeof f[0] != "string")
            throw new Error("alphabet.decode input should be array of strings");
          return f.map((d) => {
            if (typeof d != "string")
              throw new Error(`alphabet.decode: not string element=${d}`);
            const m = h.indexOf(d);
            if (m === -1)
              throw new Error(`Unknown letter: "${d}". Allowed: ${h}`);
            return m;
          });
        }
      };
    }
    function o(h = "") {
      if (typeof h != "string")
        throw new Error("join separator should be string");
      return {
        encode: (f) => {
          if (!Array.isArray(f) || f.length && typeof f[0] != "string")
            throw new Error("join.encode input should be array of strings");
          for (let d of f)
            if (typeof d != "string")
              throw new Error(`join.encode: non-string input=${d}`);
          return f.join(h);
        },
        decode: (f) => {
          if (typeof f != "string")
            throw new Error("join.decode input should be string");
          return f.split(h);
        }
      };
    }
    function i(h, f = "=") {
      if (t(h), typeof f != "string")
        throw new Error("padding chr should be string");
      return {
        encode(d) {
          if (!Array.isArray(d) || d.length && typeof d[0] != "string")
            throw new Error("padding.encode input should be array of strings");
          for (let m of d)
            if (typeof m != "string")
              throw new Error(`padding.encode: non-string input=${m}`);
          for (; d.length * h % 8; )
            d.push(f);
          return d;
        },
        decode(d) {
          if (!Array.isArray(d) || d.length && typeof d[0] != "string")
            throw new Error("padding.encode input should be array of strings");
          for (let g of d)
            if (typeof g != "string")
              throw new Error(`padding.decode: non-string input=${g}`);
          let m = d.length;
          if (m * h % 8)
            throw new Error("Invalid padding: string should have whole number of bytes");
          for (; m > 0 && d[m - 1] === f; m--)
            if (!((m - 1) * h % 8))
              throw new Error("Invalid padding: string has too much padding");
          return d.slice(0, m);
        }
      };
    }
    function s(h) {
      if (typeof h != "function")
        throw new Error("normalize fn should be function");
      return { encode: (f) => f, decode: (f) => h(f) };
    }
    function c(h, f, d) {
      if (f < 2)
        throw new Error(`convertRadix: wrong from=${f}, base cannot be less than 2`);
      if (d < 2)
        throw new Error(`convertRadix: wrong to=${d}, base cannot be less than 2`);
      if (!Array.isArray(h))
        throw new Error("convertRadix: data should be array");
      if (!h.length)
        return [];
      let m = 0;
      const g = [], v = Array.from(h);
      for (v.forEach((x) => {
        if (t(x), x < 0 || x >= f)
          throw new Error(`Wrong integer: ${x}`);
      }); ; ) {
        let x = 0, U = !0;
        for (let L = m; L < v.length; L++) {
          const N = v[L], E = f * x + N;
          if (!Number.isSafeInteger(E) || f * x / f !== x || E - N !== f * x)
            throw new Error("convertRadix: carry overflow");
          if (x = E % d, v[L] = Math.floor(E / d), !Number.isSafeInteger(v[L]) || v[L] * d + x !== E)
            throw new Error("convertRadix: carry overflow");
          if (U)
            v[L] ? U = !1 : m = L;
          else continue;
        }
        if (g.push(x), U)
          break;
      }
      for (let x = 0; x < h.length - 1 && h[x] === 0; x++)
        g.push(0);
      return g.reverse();
    }
    const a = (h, f) => f ? a(f, h % f) : h, l = (h, f) => h + (f - a(h, f));
    function p(h, f, d, m) {
      if (!Array.isArray(h))
        throw new Error("convertRadix2: data should be array");
      if (f <= 0 || f > 32)
        throw new Error(`convertRadix2: wrong from=${f}`);
      if (d <= 0 || d > 32)
        throw new Error(`convertRadix2: wrong to=${d}`);
      if (l(f, d) > 32)
        throw new Error(`convertRadix2: carry overflow from=${f} to=${d} carryBits=${l(f, d)}`);
      let g = 0, v = 0;
      const x = 2 ** d - 1, U = [];
      for (const L of h) {
        if (t(L), L >= 2 ** f)
          throw new Error(`convertRadix2: invalid data word=${L} from=${f}`);
        if (g = g << f | L, v + f > 32)
          throw new Error(`convertRadix2: carry overflow pos=${v} from=${f}`);
        for (v += f; v >= d; v -= d)
          U.push((g >> v - d & x) >>> 0);
        g &= 2 ** v - 1;
      }
      if (g = g << d - v & x, !m && v >= f)
        throw new Error("Excess padding");
      if (!m && g)
        throw new Error(`Non-zero padding: ${g}`);
      return m && v > 0 && U.push(g >>> 0), U;
    }
    function u(h) {
      return t(h), {
        encode: (f) => {
          if (!(f instanceof Uint8Array))
            throw new Error("radix.encode input should be Uint8Array");
          return c(Array.from(f), 2 ** 8, h);
        },
        decode: (f) => {
          if (!Array.isArray(f) || f.length && typeof f[0] != "number")
            throw new Error("radix.decode input should be array of strings");
          return Uint8Array.from(c(f, h, 2 ** 8));
        }
      };
    }
    function y(h, f = !1) {
      if (t(h), h <= 0 || h > 32)
        throw new Error("radix2: bits should be in (0..32]");
      if (l(8, h) > 32 || l(h, 8) > 32)
        throw new Error("radix2: carry overflow");
      return {
        encode: (d) => {
          if (!(d instanceof Uint8Array))
            throw new Error("radix2.encode input should be Uint8Array");
          return p(Array.from(d), 8, h, !f);
        },
        decode: (d) => {
          if (!Array.isArray(d) || d.length && typeof d[0] != "number")
            throw new Error("radix2.decode input should be array of strings");
          return Uint8Array.from(p(d, h, 8, f));
        }
      };
    }
    function w(h) {
      if (typeof h != "function")
        throw new Error("unsafeWrapper fn should be function");
      return function(...f) {
        try {
          return h.apply(null, f);
        } catch {
        }
      };
    }
    function b(h, f) {
      if (t(h), typeof f != "function")
        throw new Error("checksum fn should be function");
      return {
        encode(d) {
          if (!(d instanceof Uint8Array))
            throw new Error("checksum.encode: input should be Uint8Array");
          const m = f(d).slice(0, h), g = new Uint8Array(d.length + h);
          return g.set(d), g.set(m, d.length), g;
        },
        decode(d) {
          if (!(d instanceof Uint8Array))
            throw new Error("checksum.decode: input should be Uint8Array");
          const m = d.slice(0, -h), g = f(m).slice(0, h), v = d.slice(-h);
          for (let x = 0; x < h; x++)
            if (g[x] !== v[x])
              throw new Error("Invalid checksum");
          return m;
        }
      };
    }
    e.utils = { alphabet: r, chain: n, checksum: b, radix: u, radix2: y, join: o, padding: i }, e.base16 = n(y(4), r("0123456789ABCDEF"), o("")), e.base32 = n(y(5), r("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), i(5), o("")), e.base32hex = n(y(5), r("0123456789ABCDEFGHIJKLMNOPQRSTUV"), i(5), o("")), e.base32crockford = n(y(5), r("0123456789ABCDEFGHJKMNPQRSTVWXYZ"), o(""), s((h) => h.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1"))), e.base64 = n(y(6), r("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), i(6), o("")), e.base64url = n(y(6), r("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), i(6), o(""));
    const C = (h) => n(u(58), r(h), o(""));
    e.base58 = C("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"), e.base58flickr = C("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"), e.base58xrp = C("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz");
    const A = [0, 2, 3, 5, 6, 7, 9, 10, 11];
    e.base58xmr = {
      encode(h) {
        let f = "";
        for (let d = 0; d < h.length; d += 8) {
          const m = h.subarray(d, d + 8);
          f += e.base58.encode(m).padStart(A[m.length], "1");
        }
        return f;
      },
      decode(h) {
        let f = [];
        for (let d = 0; d < h.length; d += 11) {
          const m = h.slice(d, d + 11), g = A.indexOf(m.length), v = e.base58.decode(m);
          for (let x = 0; x < v.length - g; x++)
            if (v[x] !== 0)
              throw new Error("base58xmr: wrong padding");
          f = f.concat(Array.from(v.slice(v.length - g)));
        }
        return Uint8Array.from(f);
      }
    };
    const k = (h) => n(b(4, (f) => h(h(f))), e.base58);
    e.base58check = k;
    const _ = n(r("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), o("")), F = [996825010, 642813549, 513874426, 1027748829, 705979059];
    function V(h) {
      const f = h >> 25;
      let d = (h & 33554431) << 5;
      for (let m = 0; m < F.length; m++)
        (f >> m & 1) === 1 && (d ^= F[m]);
      return d;
    }
    function S(h, f, d = 1) {
      const m = h.length;
      let g = 1;
      for (let v = 0; v < m; v++) {
        const x = h.charCodeAt(v);
        if (x < 33 || x > 126)
          throw new Error(`Invalid prefix (${h})`);
        g = V(g) ^ x >> 5;
      }
      g = V(g);
      for (let v = 0; v < m; v++)
        g = V(g) ^ h.charCodeAt(v) & 31;
      for (let v of f)
        g = V(g) ^ v;
      for (let v = 0; v < 6; v++)
        g = V(g);
      return g ^= d, _.encode(p([g % 2 ** 30], 30, 5, !1));
    }
    function M(h) {
      const f = h === "bech32" ? 1 : 734539939, d = y(5), m = d.decode, g = d.encode, v = w(m);
      function x(E, B, j = 90) {
        if (typeof E != "string")
          throw new Error(`bech32.encode prefix should be string, not ${typeof E}`);
        if (!Array.isArray(B) || B.length && typeof B[0] != "number")
          throw new Error(`bech32.encode words should be array of numbers, not ${typeof B}`);
        const G = E.length + 7 + B.length;
        if (j !== !1 && G > j)
          throw new TypeError(`Length ${G} exceeds limit ${j}`);
        return E = E.toLowerCase(), `${E}1${_.encode(B)}${S(E, B, f)}`;
      }
      function U(E, B = 90) {
        if (typeof E != "string")
          throw new Error(`bech32.decode input should be string, not ${typeof E}`);
        if (E.length < 8 || B !== !1 && E.length > B)
          throw new TypeError(`Wrong string length: ${E.length} (${E}). Expected (8..${B})`);
        const j = E.toLowerCase();
        if (E !== j && E !== E.toUpperCase())
          throw new Error("String must be lowercase or uppercase");
        E = j;
        const G = E.lastIndexOf("1");
        if (G === 0 || G === -1)
          throw new Error('Letter "1" must be present between prefix and data only');
        const H = E.slice(0, G), z = E.slice(G + 1);
        if (z.length < 6)
          throw new Error("Data must be at least 6 characters long");
        const Q = _.decode(z).slice(0, -6), le = S(H, Q, f);
        if (!z.endsWith(le))
          throw new Error(`Invalid checksum in ${E}: expected "${le}"`);
        return { prefix: H, words: Q };
      }
      const L = w(U);
      function N(E) {
        const { prefix: B, words: j } = U(E, !1);
        return { prefix: B, words: j, bytes: m(j) };
      }
      return { encode: x, decode: U, decodeToBytes: N, decodeUnsafe: L, fromWords: m, fromWordsUnsafe: v, toWords: g };
    }
    e.bech32 = M("bech32"), e.bech32m = M("bech32m"), e.utf8 = {
      encode: (h) => new TextDecoder().decode(h),
      decode: (h) => new TextEncoder().encode(h)
    }, e.hex = n(y(4), r("0123456789abcdef"), o(""), s((h) => {
      if (typeof h != "string" || h.length % 2)
        throw new TypeError(`hex.decode: expected string, got ${typeof h} with length ${h.length}`);
      return h.toLowerCase();
    }));
    const R = {
      utf8: e.utf8,
      hex: e.hex,
      base16: e.base16,
      base32: e.base32,
      base64: e.base64,
      base64url: e.base64url,
      base58: e.base58,
      base58xmr: e.base58xmr
    }, D = `Invalid encoding type. Available types: ${Object.keys(R).join(", ")}`, $ = (h, f) => {
      if (typeof h != "string" || !R.hasOwnProperty(h))
        throw new TypeError(D);
      if (!(f instanceof Uint8Array))
        throw new TypeError("bytesToString() expects Uint8Array");
      return R[h].encode(f);
    };
    e.bytesToString = $, e.str = e.bytesToString;
    const P = (h, f) => {
      if (!R.hasOwnProperty(h))
        throw new TypeError(D);
      if (typeof f != "string")
        throw new TypeError("stringToBytes() expects string");
      return R[h].decode(f);
    };
    e.stringToBytes = P, e.bytes = e.stringToBytes;
  })(Or)), Or;
}
var Pr, ys;
function U5() {
  if (ys) return Pr;
  ys = 1;
  const { bech32: e, hex: t, utf8: n } = B5(), r = {
    // default network is bitcoin
    bech32: "bc",
    pubKeyHash: 0,
    scriptHash: 5,
    validWitnessVersions: [0]
  }, o = {
    bech32: "tb",
    pubKeyHash: 111,
    scriptHash: 196,
    validWitnessVersions: [0]
  }, i = {
    bech32: "tbs",
    pubKeyHash: 111,
    scriptHash: 196,
    validWitnessVersions: [0]
  }, s = {
    bech32: "bcrt",
    pubKeyHash: 111,
    scriptHash: 196,
    validWitnessVersions: [0]
  }, c = {
    bech32: "sb",
    pubKeyHash: 63,
    scriptHash: 123,
    validWitnessVersions: [0]
  }, a = [
    "option_data_loss_protect",
    "initial_routing_sync",
    "option_upfront_shutdown_script",
    "gossip_queries",
    "var_onion_optin",
    "gossip_queries_ex",
    "option_static_remotekey",
    "payment_secret",
    "basic_mpp",
    "option_support_large_channel"
  ], l = {
    m: BigInt(1e3),
    u: BigInt(1e6),
    n: BigInt(1e9),
    p: BigInt(1e12)
  }, p = BigInt("2100000000000000000"), u = BigInt(1e11), y = {
    payment_hash: 1,
    payment_secret: 16,
    description: 13,
    payee: 19,
    description_hash: 23,
    // commit to longer descriptions (used by lnurl-pay)
    expiry: 6,
    // default: 3600 (1 hour)
    min_final_cltv_expiry: 24,
    // default: 9
    fallback_address: 9,
    route_hint: 3,
    // for extra routing info (private etc.)
    feature_bits: 5,
    metadata: 27
  }, w = {};
  for (let S = 0, M = Object.keys(y); S < M.length; S++) {
    const R = M[S], D = y[M[S]].toString();
    w[D] = R;
  }
  const b = {
    1: (S) => t.encode(e.fromWordsUnsafe(S)),
    // 256 bits
    16: (S) => t.encode(e.fromWordsUnsafe(S)),
    // 256 bits
    13: (S) => n.encode(e.fromWordsUnsafe(S)),
    // string variable length
    19: (S) => t.encode(e.fromWordsUnsafe(S)),
    // 264 bits
    23: (S) => t.encode(e.fromWordsUnsafe(S)),
    // 256 bits
    27: (S) => t.encode(e.fromWordsUnsafe(S)),
    // variable
    6: A,
    // default: 3600 (1 hour)
    24: A,
    // default: 9
    3: k,
    // for extra routing info (private etc.)
    5: _
    // keep feature bits as array of 5 bit words
  };
  function C(S) {
    return (M) => ({
      tagCode: parseInt(S),
      words: e.encode("unknown", M, Number.MAX_SAFE_INTEGER)
    });
  }
  function A(S) {
    return S.reverse().reduce((M, R, D) => M + R * Math.pow(32, D), 0);
  }
  function k(S) {
    const M = [];
    let R, D, $, P, h, f = e.fromWordsUnsafe(S);
    for (; f.length > 0; )
      R = t.encode(f.slice(0, 33)), D = t.encode(f.slice(33, 41)), $ = parseInt(t.encode(f.slice(41, 45)), 16), P = parseInt(
        t.encode(f.slice(45, 49)),
        16
      ), h = parseInt(t.encode(f.slice(49, 51)), 16), f = f.slice(51), M.push({
        pubkey: R,
        short_channel_id: D,
        fee_base_msat: $,
        fee_proportional_millionths: P,
        cltv_expiry_delta: h
      });
    return M;
  }
  function _(S) {
    const M = S.slice().reverse().map(($) => [
      !!($ & 1),
      !!($ & 2),
      !!($ & 4),
      !!($ & 8),
      !!($ & 16)
    ]).reduce(($, P) => $.concat(P), []);
    for (; M.length < a.length * 2; )
      M.push(!1);
    const R = {};
    a.forEach(($, P) => {
      let h;
      M[P * 2] ? h = "required" : M[P * 2 + 1] ? h = "supported" : h = "unsupported", R[$] = h;
    });
    const D = M.slice(a.length * 2);
    return R.extra_bits = {
      start_bit: a.length * 2,
      bits: D,
      has_required: D.reduce(
        ($, P, h) => h % 2 !== 0 ? $ || !1 : $ || P,
        !1
      )
    }, R;
  }
  function F(S, M) {
    let R, D;
    if (S.slice(-1).match(/^[munp]$/))
      R = S.slice(-1), D = S.slice(0, -1);
    else {
      if (S.slice(-1).match(/^[^munp0-9]$/))
        throw new Error("Not a valid multiplier for the amount");
      D = S;
    }
    if (!D.match(/^\d+$/))
      throw new Error("Not a valid human readable amount");
    const $ = BigInt(D), P = R ? $ * u / l[R] : $ * u;
    if (R === "p" && $ % BigInt(10) !== BigInt(0) || P > p)
      throw new Error("Amount is outside of valid range");
    return M ? P.toString() : P;
  }
  function V(S, M) {
    if (typeof S != "string")
      throw new Error("Lightning Payment Request must be string");
    if (S.slice(0, 2).toLowerCase() !== "ln")
      throw new Error("Not a proper lightning payment request");
    const R = [], D = e.decode(S, Number.MAX_SAFE_INTEGER);
    S = S.toLowerCase();
    const $ = D.prefix;
    let P = D.words, h = S.slice($.length + 1), f = P.slice(-104);
    P = P.slice(0, -104);
    let d = $.match(/^ln(\S+?)(\d*)([a-zA-Z]?)$/);
    if (d && !d[2] && (d = $.match(/^ln(\S+)$/)), !d)
      throw new Error("Not a proper lightning payment request");
    R.push({
      name: "lightning_network",
      letters: "ln"
    });
    const m = d[1];
    let g;
    if (M) {
      if (M.bech32 === void 0 || M.pubKeyHash === void 0 || M.scriptHash === void 0 || !Array.isArray(M.validWitnessVersions))
        throw new Error("Invalid network");
      g = M;
    } else
      switch (m) {
        case r.bech32:
          g = r;
          break;
        case o.bech32:
          g = o;
          break;
        case i.bech32:
          g = i;
          break;
        case s.bech32:
          g = s;
          break;
        case c.bech32:
          g = c;
          break;
      }
    if (!g || g.bech32 !== m)
      throw new Error("Unknown coin bech32 prefix");
    R.push({
      name: "coin_network",
      letters: m,
      value: g
    });
    const v = d[2];
    let x;
    if (v) {
      const H = d[3];
      x = F(v + H, !0), R.push({
        name: "amount",
        letters: d[2] + d[3],
        value: x
      });
    } else
      x = null;
    R.push({
      name: "separator",
      letters: "1"
    });
    const U = A(P.slice(0, 7));
    P = P.slice(7), R.push({
      name: "timestamp",
      letters: h.slice(0, 7),
      value: U
    }), h = h.slice(7);
    let L, N, E, B;
    for (; P.length > 0; ) {
      const H = P[0].toString();
      L = w[H] || "unknown_tag", N = b[H] || C(H), P = P.slice(1), E = A(P.slice(0, 2)), P = P.slice(2), B = P.slice(0, E), P = P.slice(E), R.push({
        name: L,
        tag: h[0],
        letters: h.slice(0, 3 + E),
        value: N(B)
        // see: parsers for more comments
      }), h = h.slice(3 + E);
    }
    R.push({
      name: "signature",
      letters: h.slice(0, 104),
      value: t.encode(e.fromWordsUnsafe(f))
    }), h = h.slice(104), R.push({
      name: "checksum",
      letters: h
    });
    let j = {
      paymentRequest: S,
      sections: R,
      get expiry() {
        let H = R.find((z) => z.name === "expiry");
        if (H) return G("timestamp") + H.value;
      },
      get route_hints() {
        return R.filter((H) => H.name === "route_hint").map((H) => H.value);
      }
    };
    for (let H in y)
      H !== "route_hint" && Object.defineProperty(j, H, {
        get() {
          return G(H);
        }
      });
    return j;
    function G(H) {
      let z = R.find((Q) => Q.name === H);
      return z ? z.value : void 0;
    }
  }
  return Pr = {
    decode: V,
    hrpToMillisat: F
  }, Pr;
}
var I5 = U5();
const O5 = (e) => Uint8Array.from(e.match(/.{1,2}/g).map((t) => parseInt(t, 16))), P5 = (e) => {
  if (!e)
    return null;
  try {
    const t = I5.decode(e);
    if (!t || !t.sections)
      return null;
    const n = t.sections.find((b) => b.name === "payment_hash");
    if (n?.name !== "payment_hash" || !n.value)
      return null;
    const r = n.value;
    let o = 0, i = 0, s = "0";
    const c = t.sections.find((b) => b.name === "amount");
    c?.name === "amount" && c.value && (s = c.value, i = parseInt(c.value), o = parseInt(c.value) / 1e3);
    const a = t.sections.find((b) => b.name === "timestamp");
    if (a?.name !== "timestamp" || !a.value)
      return null;
    const l = a.value;
    let p;
    const u = t.sections.find((b) => b.name === "expiry");
    u?.name === "expiry" && (p = u.value);
    const y = t.sections.find((b) => b.name === "description"), w = y?.name === "description" ? y?.value : void 0;
    return {
      paymentHash: r,
      satoshi: o,
      millisatoshi: i,
      amountRaw: s,
      timestamp: l,
      expiry: p,
      description: w
    };
  } catch {
    return null;
  }
};
function H5(e, t) {
  try {
    if (!/^[0-9a-fA-F]{64}$/.test(e) || !/^[0-9a-fA-F]{64}$/.test(t))
      return !1;
    const n = E5(N5(O5(e)));
    return t === n;
  } catch {
    return !1;
  }
}
class Z5 {
  constructor(t) {
    if (this.paymentRequest = t.pr, !this.paymentRequest)
      throw new Error("Invalid payment request");
    const n = P5(this.paymentRequest);
    if (!n)
      throw new Error("Failed to decode payment request");
    this.paymentHash = n.paymentHash, this.satoshi = n.satoshi, this.millisatoshi = n.millisatoshi, this.amountRaw = n.amountRaw, this.timestamp = n.timestamp, this.expiry = n.expiry, this.createdDate = new Date(this.timestamp * 1e3), this.expiryDate = this.expiry ? new Date((this.timestamp + this.expiry) * 1e3) : void 0, this.description = n.description ?? null, this.verify = t.verify ?? null, this.preimage = t.preimage ?? null, this.successAction = t.successAction ?? null;
  }
  async isPaid() {
    if (this.preimage)
      return this.validatePreimage(this.preimage);
    if (this.verify)
      return await this.verifyPayment();
    throw new Error("Could not verify payment");
  }
  validatePreimage(t) {
    return !t || !this.paymentHash ? !1 : H5(t, this.paymentHash);
  }
  async verifyPayment() {
    try {
      if (!this.verify)
        throw new Error("LNURL verify not available");
      const t = await fetch(this.verify);
      if (!t.ok)
        throw new Error(`Verification request failed: ${t.status} ${t.statusText}`);
      const n = await t.json();
      return n.preimage && (this.preimage = n.preimage), n.settled;
    } catch (t) {
      return console.error("Failed to check LNURL-verify", t), !1;
    }
  }
  hasExpired() {
    const { expiryDate: t } = this;
    return t ? t.getTime() < Date.now() : !1;
  }
}
const W5 = 1e8, D5 = async (e) => {
  const t = "https://getalby.com/api/rates/" + e.toLowerCase() + ".json", n = await fetch(t);
  if (!n.ok)
    throw new Error(`Failed to fetch rate: ${n.status} ${n.statusText}`);
  return (await n.json()).rate_float / W5;
}, F5 = async ({ satoshi: e, currency: t }) => {
  const n = await D5(t);
  return Number(e) * n;
};
class Hn {
  constructor(t) {
    this._config = t;
  }
  async unload() {
  }
}
const V5 = (e) => {
  const t = [];
  for (let n = 0, r = atob(e.replace(/[ \r\n]+$/, "")); n < r.length; ++n) {
    let o = r.charCodeAt(n).toString(16);
    o.length === 1 && (o = "0" + o), t[t.length] = o;
  }
  return t.join("");
};
let we;
async function K0() {
  try {
    if (we) return we;
    const e = (await import("./bitlogin-shared-kMkQuG5v.js").then((t) => t.i)).default;
    return we = new e(), we;
  } catch (e) {
    throw console.error(e), new Error("LNC is not available");
  }
}
const bs = "ONLY CONNECT TO TRUSTED WEBSITES";
class Q0 {
  constructor(t) {
    this.lnc = t;
  }
  enable() {
    return Promise.resolve();
  }
  async getInfo() {
    const t = await we.lnd.lightning.getInfo();
    return { methods: ["enable", "getBalance", "getInfo", "sendPayment"], version: "1.0", node: { alias: t.alias, pubkey: t.identityPubkey, color: t.color }, supports: ["lightning"] };
  }
  makeInvoice(t) {
    throw new Error("Method not implemented.");
  }
  async sendPayment(t) {
    const n = await we.lnd.lightning.sendPaymentSync({ paymentRequest: t });
    if (n.paymentError) throw new Error(n.paymentError);
    if (!n.paymentPreimage) throw new Error("No preimage in response");
    if (typeof n.paymentPreimage != "string") throw new Error("expected preimage as string");
    return { preimage: V5(n.paymentPreimage) };
  }
  async getBalance() {
    var t;
    const n = await we.lnd.lightning.channelBalance();
    return { balance: parseInt(((t = n.localBalance) == null ? void 0 : t.sat) || "0") };
  }
  keysend(t) {
    throw new Error("Method not implemented.");
  }
  lnurl(t) {
    throw new Error("Method not implemented.");
  }
  lookupInvoice(t) {
    throw new Error("Method not implemented.");
  }
  signMessage(t) {
    throw new Error("Method not implemented.");
  }
  verifyMessage(t, n) {
    throw new Error("Method not implemented.");
  }
}
class J0 {
  constructor(t, n) {
    this._instanceUrl = t, this._adminKey = n;
  }
  enable() {
    return Promise.resolve();
  }
  async getInfo() {
    return { node: { alias: (await this.requestLnbits("GET", "/api/v1/wallet")).name, pubkey: "" }, methods: ["getInfo", "getBalance", "sendPayment"], version: "1.0", supports: ["lightning"] };
  }
  async makeInvoice(t) {
    return { paymentRequest: (await this.requestLnbits("POST", "/api/v1/payments", { amount: t.amount || t.defaultAmount || +t, memo: t.defaultMemo, out: !1 })).payment_request };
  }
  async sendPayment(t) {
    const n = await this.requestLnbits("POST", "/api/v1/payments", { bolt11: t, out: !0 }), r = await this.requestLnbits("GET", `/api/v1/payments/${n.payment_hash}`);
    if (!r.preimage) throw new Error("No preimage");
    return { preimage: r.preimage };
  }
  async getBalance() {
    const t = await this.requestLnbits("GET", "/api/v1/wallet");
    return { balance: Math.floor(t.balance / 1e3) };
  }
  keysend(t) {
    throw new Error("Method not implemented.");
  }
  lnurl(t) {
    throw new Error("Method not implemented.");
  }
  lookupInvoice(t) {
    throw new Error("Method not implemented.");
  }
  signMessage(t) {
    throw new Error("Method not implemented.");
  }
  verifyMessage(t, n) {
    throw new Error("Method not implemented.");
  }
  async requestLnbits(t, n, r) {
    let o = null;
    const i = new Headers();
    if (i.append("Accept", "application/json"), i.append("Content-Type", "application/json"), i.append("X-Api-Key", this._adminKey), t === "POST") o = JSON.stringify(r);
    else if (r !== void 0) throw new Error("TODO: support args in GET");
    const s = await fetch(this._instanceUrl + n + "", { method: t, headers: i, body: o });
    if (!s.ok) {
      const c = await s.json();
      throw console.error("errBody", c), new Error(c.detail);
    }
    return await s.json();
  }
}
function Pe() {
  return Pe = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
    }
    return e;
  }, Pe.apply(this, arguments);
}
class De extends Hn {
  constructor(t) {
    super(t);
  }
  async init() {
    if (!this._config.nwcUrl) throw new Error("no nwc URL provided");
    return new pr({ nostrWalletConnectUrl: this._config.nwcUrl });
  }
}
const G5 = { "extension.generic": class extends Hn {
  constructor(e) {
    super(e);
  }
  init() {
    if (!window.webln) throw new Error("No WebLN provider available");
    return Promise.resolve(window.webln);
  }
}, "nwc.alby": De, "nwc.albyhub": De, "nwc.generic": De, "nwc.lnfi": De, "nwc.coinos": De, "nwc.flash": De, "nwc.cashume": De, "nwc.lnbits": De, "nwc.rizful": De, lnbits: class extends Hn {
  constructor(e) {
    super(e);
  }
  async init() {
    if (!this._config.lnbitsInstanceUrl) throw new Error("no lnbits URL provided");
    if (!this._config.lnbitsAdminKey) throw new Error("no lnbits admin key provided");
    return new J0(this._config.lnbitsInstanceUrl, this._config.lnbitsAdminKey);
  }
}, lnc: class extends Hn {
  constructor(e) {
    super(e);
  }
  async init() {
    await K0();
    const e = new Q0(we);
    try {
      const t = !we.credentials.pairingPhrase;
      for (t ? (console.log("Pairing phrase does not exist"), we.credentials.password = bs) : console.log("Pairing phrase set"), await we.connect(), t || (we.credentials.password = bs); !we.isConnected; ) console.log("Waiting to connect..."), await new Promise((n) => {
        setTimeout(n, 100);
      });
    } catch (t) {
      throw console.error(t), we.disconnect(), we.credentials.clear(), t;
    }
    return e;
  }
  async unload() {
    we.disconnect(), we.credentials.clear(), await super.unload();
  }
} }, vo = { showBalance: !0, appName: "Bitcoin Connect", persistConnection: !0 }, O = y5((e, t) => ({ route: "/start", routeHistory: [], modalOpen: !1, currency: void 0, connected: !1, connecting: !1, error: void 0, alias: void 0, balance: void 0, connectorName: void 0, invoice: void 0, provider: void 0, connector: void 0, connectorConfig: void 0, bitcoinConnectConfig: vo, info: void 0, connectNWC: (n) => t().connect({ connectorName: "NWC", connectorType: "nwc.generic", nwcUrl: n }), connect: async (n, r = { redirectTo: "/connected" }) => {
  e({ connecting: !0, error: void 0 });
  try {
    const o = new G5[n.connectorType](n), i = await o.init();
    let s;
    await i.enable();
    try {
      s = await i.getInfo();
    } catch {
      console.error("Failed to request wallet info");
    }
    if (!t().connecting) return;
    e({ connectorConfig: n, connector: o, connected: !0, connecting: !1, info: s, provider: i, connectorName: n.connectorName, route: r.redirectTo });
    const { bitcoinConnectConfig: c } = t();
    c.persistConnection !== !1 && window.localStorage.setItem("bc:config", JSON.stringify(n));
  } catch (o) {
    console.error(o), e({ error: o.toString(), connecting: !1 }), t().disconnect();
  }
}, disconnect: () => {
  var n;
  (n = t().connector) == null || n.unload(), e({ connectorConfig: void 0, connector: void 0, connected: !1, connecting: !1, connectorName: void 0, provider: void 0, modalOpen: !1 }), window.localStorage.removeItem("bc:config");
}, pushRoute: (n) => {
  t().route !== n && e({ route: n, routeHistory: [...t().routeHistory, t().route] });
}, popRoute() {
  const n = t().routeHistory, r = n.pop() || "/start";
  e({ route: r, routeHistory: n });
}, clearRouteHistory() {
  e({ route: "/start", routeHistory: [] });
}, setModalOpen: (n) => {
  e({ modalOpen: n });
}, setBitcoinConnectConfig: (n) => {
  e({ bitcoinConnectConfig: Pe({}, vo, n) });
  const r = t();
  r.bitcoinConnectConfig.autoConnect === !1 || r.connected || r.connecting || (function() {
    try {
      const { hash: o } = window.location;
      if (o) {
        const i = o.indexOf("?"), s = o.slice(i > 0 ? i : 1), c = new URLSearchParams(s), a = c.get("nwc");
        if (a && a.startsWith("nostr+walletconnect://")) {
          const { searchParams: l } = new URL(a);
          l.get("relay") && l.get("secret") && (c.delete("nwc"), window.location.hash = o.slice(0, i > 0 ? i + 1 : 1) + c.toString(), O.getState().connectNWC(a));
        }
      }
    } catch (o) {
      console.error(o);
    }
  })();
}, setError: (n) => {
  e({ error: n });
}, setCurrency: (n) => {
  n ? window.localStorage.setItem("bc:currency", n) : window.localStorage.removeItem("bc:currency"), e({ currency: n });
}, supports: (n) => {
  const { info: r, provider: o } = t();
  return !(r == null || !r.methods) && r.methods.indexOf(n) > -1 && !(o == null || !o.getBalance);
} }));
function I(e, t, n, r) {
  var o, i = arguments.length, s = i < 3 ? t : r;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function") s = Reflect.decorate(e, t, n, r);
  else for (var c = e.length - 1; c >= 0; c--) (o = e[c]) && (s = (i < 3 ? o(s) : i > 3 ? o(t, n, s) : o(t, n)) || s);
  return i > 3 && s && Object.defineProperty(t, n, s), s;
}
globalThis.window && ((function() {
  const e = window.localStorage.getItem("bc:config");
  if (e) {
    const n = JSON.parse(e);
    O.getState().connect(n, { redirectTo: "/start" });
  }
  const t = window.localStorage.getItem("bc:currency");
  t && O.getState().setCurrency(t);
})(), window.addEventListener("webln:enabled", () => {
  O.getState().connecting || O.getState().connect({ connectorName: "Extension", connectorType: "extension.generic" }, { redirectTo: "/start" });
})), typeof SuppressedError == "function" && SuppressedError;
const Zn = globalThis, vi = Zn.ShadowRoot && (Zn.ShadyCSS === void 0 || Zn.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Y0 = Symbol(), vs = /* @__PURE__ */ new WeakMap();
class j5 {
  constructor(t, n, r) {
    if (this._$cssResult$ = !0, r !== Y0) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = n;
  }
  get styleSheet() {
    let t = this.o;
    const n = this.t;
    if (vi && t === void 0) {
      const r = n !== void 0 && n.length === 1;
      r && (t = vs.get(n)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && vs.set(n, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
}
const Cs = vi ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let n = "";
  for (const r of t.cssRules) n += r.cssText;
  return ((r) => new j5(typeof r == "string" ? r : r + "", void 0, Y0))(n);
})(e) : e, { is: z5, defineProperty: q5, getOwnPropertyDescriptor: K5, getOwnPropertyNames: Q5, getOwnPropertySymbols: J5, getPrototypeOf: Y5 } = Object, gr = globalThis, xs = gr.trustedTypes, X5 = xs ? xs.emptyScript : "", e4 = gr.reactiveElementPolyfillSupport, sn = (e, t) => e, Jn = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? X5 : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let n = e;
  switch (t) {
    case Boolean:
      n = e !== null;
      break;
    case Number:
      n = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        n = JSON.parse(e);
      } catch {
        n = null;
      }
  }
  return n;
} }, Ci = (e, t) => !z5(e, t), Es = { attribute: !0, type: String, converter: Jn, reflect: !1, useDefault: !1, hasChanged: Ci };
Symbol.metadata ??= Symbol("metadata"), gr.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
class Kt extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, n = Es) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(t, n), !n.noAccessor) {
      const r = Symbol(), o = this.getPropertyDescriptor(t, r, n);
      o !== void 0 && q5(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, n, r) {
    const { get: o, set: i } = K5(this.prototype, t) ?? { get() {
      return this[n];
    }, set(s) {
      this[n] = s;
    } };
    return { get: o, set(s) {
      const c = o?.call(this);
      i?.call(this, s), this.requestUpdate(t, c, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Es;
  }
  static _$Ei() {
    if (this.hasOwnProperty(sn("elementProperties"))) return;
    const t = Y5(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(sn("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(sn("properties"))) {
      const n = this.properties, r = [...Q5(n), ...J5(n)];
      for (const o of r) this.createProperty(o, n[o]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const n = litPropertyMetadata.get(t);
      if (n !== void 0) for (const [r, o] of n) this.elementProperties.set(r, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [n, r] of this.elementProperties) {
      const o = this._$Eu(n, r);
      o !== void 0 && this._$Eh.set(o, n);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const n = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const o of r) n.unshift(Cs(o));
    } else t !== void 0 && n.push(Cs(t));
    return n;
  }
  static _$Eu(t, n) {
    const r = n.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), n = this.constructor.elementProperties;
    for (const r of n.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ((n, r) => {
      if (vi) n.adoptedStyleSheets = r.map((o) => o instanceof CSSStyleSheet ? o : o.styleSheet);
      else for (const o of r) {
        const i = document.createElement("style"), s = Zn.litNonce;
        s !== void 0 && i.setAttribute("nonce", s), i.textContent = o.cssText, n.appendChild(i);
      }
    })(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, n, r) {
    this._$AK(t, r);
  }
  _$ET(t, n) {
    const r = this.constructor.elementProperties.get(t), o = this.constructor._$Eu(t, r);
    if (o !== void 0 && r.reflect === !0) {
      const i = (r.converter?.toAttribute !== void 0 ? r.converter : Jn).toAttribute(n, r.type);
      this._$Em = t, i == null ? this.removeAttribute(o) : this.setAttribute(o, i), this._$Em = null;
    }
  }
  _$AK(t, n) {
    const r = this.constructor, o = r._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const i = r.getPropertyOptions(o), s = typeof i.converter == "function" ? { fromAttribute: i.converter } : i.converter?.fromAttribute !== void 0 ? i.converter : Jn;
      this._$Em = o, this[o] = s.fromAttribute(n, i.type) ?? this._$Ej?.get(o) ?? null, this._$Em = null;
    }
  }
  requestUpdate(t, n, r) {
    if (t !== void 0) {
      const o = this.constructor, i = this[t];
      if (r ??= o.getPropertyOptions(t), !((r.hasChanged ?? Ci)(i, n) || r.useDefault && r.reflect && i === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, r)))) return;
      this.C(t, n, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, n, { useDefault: r, reflect: o, wrapped: i }, s) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, s ?? n ?? this[t]), i !== !0 || s !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (n = void 0), this._$AL.set(t, n)), o === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (n) {
      Promise.reject(n);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [o, i] of this._$Ep) this[o] = i;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [o, i] of r) {
        const { wrapped: s } = i, c = this[o];
        s !== !0 || this._$AL.has(o) || c === void 0 || this.C(o, void 0, i, c);
      }
    }
    let t = !1;
    const n = this._$AL;
    try {
      t = this.shouldUpdate(n), t ? (this.willUpdate(n), this._$EO?.forEach((r) => r.hostUpdate?.()), this.update(n)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(n);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((n) => n.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((n) => this._$ET(n, this[n])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
}
Kt.elementStyles = [], Kt.shadowRootOptions = { mode: "open" }, Kt[sn("elementProperties")] = /* @__PURE__ */ new Map(), Kt[sn("finalized")] = /* @__PURE__ */ new Map(), e4?.({ ReactiveElement: Kt }), (gr.reactiveElementVersions ??= []).push("2.1.0");
const xi = globalThis, Yn = xi.trustedTypes, As = Yn ? Yn.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ks = "$lit$", et = `lit$${Math.random().toFixed(9).slice(2)}$`, X0 = "?" + et, t4 = `<${X0}>`, At = document, Xn = () => At.createComment(""), dn = (e) => e === null || typeof e != "object" && typeof e != "function", Co = Array.isArray, Hr = `[ 	
\f\r]`, Qt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ss = /-->/g, _s = />/g, ft = RegExp(`>|${Hr}(?:([^\\s"'>=/]+)(${Hr}*=${Hr}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ls = /'/g, Ts = /"/g, Ms = /^(?:script|style|textarea|title)$/i, un = Symbol.for("lit-noChange"), pe = Symbol.for("lit-nothing"), Rs = /* @__PURE__ */ new WeakMap(), vt = At.createTreeWalker(At, 129);
function e2(e, t) {
  if (!Co(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return As !== void 0 ? As.createHTML(t) : t;
}
class hn {
  constructor({ strings: t, _$litType$: n }, r) {
    let o;
    this.parts = [];
    let i = 0, s = 0;
    const c = t.length - 1, a = this.parts, [l, p] = ((u, y) => {
      const w = u.length - 1, b = [];
      let C, A = y === 2 ? "<svg>" : y === 3 ? "<math>" : "", k = Qt;
      for (let _ = 0; _ < w; _++) {
        const F = u[_];
        let V, S, M = -1, R = 0;
        for (; R < F.length && (k.lastIndex = R, S = k.exec(F), S !== null); ) R = k.lastIndex, k === Qt ? S[1] === "!--" ? k = Ss : S[1] !== void 0 ? k = _s : S[2] !== void 0 ? (Ms.test(S[2]) && (C = RegExp("</" + S[2], "g")), k = ft) : S[3] !== void 0 && (k = ft) : k === ft ? S[0] === ">" ? (k = C ?? Qt, M = -1) : S[1] === void 0 ? M = -2 : (M = k.lastIndex - S[2].length, V = S[1], k = S[3] === void 0 ? ft : S[3] === '"' ? Ts : Ls) : k === Ts || k === Ls ? k = ft : k === Ss || k === _s ? k = Qt : (k = ft, C = void 0);
        const D = k === ft && u[_ + 1].startsWith("/>") ? " " : "";
        A += k === Qt ? F + t4 : M >= 0 ? (b.push(V), F.slice(0, M) + ks + F.slice(M) + et + D) : F + et + (M === -2 ? _ : D);
      }
      return [e2(u, A + (u[w] || "<?>") + (y === 2 ? "</svg>" : y === 3 ? "</math>" : "")), b];
    })(t, n);
    if (this.el = hn.createElement(l, r), vt.currentNode = this.el.content, n === 2 || n === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (o = vt.nextNode()) !== null && a.length < c; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const u of o.getAttributeNames()) if (u.endsWith(ks)) {
          const y = p[s++], w = o.getAttribute(u).split(et), b = /([.?@])?(.*)/.exec(y);
          a.push({ type: 1, index: i, name: b[2], strings: w, ctor: b[1] === "." ? r4 : b[1] === "?" ? o4 : b[1] === "@" ? i4 : mr }), o.removeAttribute(u);
        } else u.startsWith(et) && (a.push({ type: 6, index: i }), o.removeAttribute(u));
        if (Ms.test(o.tagName)) {
          const u = o.textContent.split(et), y = u.length - 1;
          if (y > 0) {
            o.textContent = Yn ? Yn.emptyScript : "";
            for (let w = 0; w < y; w++) o.append(u[w], Xn()), vt.nextNode(), a.push({ type: 2, index: ++i });
            o.append(u[y], Xn());
          }
        }
      } else if (o.nodeType === 8) if (o.data === X0) a.push({ type: 2, index: i });
      else {
        let u = -1;
        for (; (u = o.data.indexOf(et, u + 1)) !== -1; ) a.push({ type: 7, index: i }), u += et.length - 1;
      }
      i++;
    }
  }
  static createElement(t, n) {
    const r = At.createElement("template");
    return r.innerHTML = t, r;
  }
}
function Ft(e, t, n = e, r) {
  if (t === un) return t;
  let o = r !== void 0 ? n._$Co?.[r] : n._$Cl;
  const i = dn(t) ? void 0 : t._$litDirective$;
  return o?.constructor !== i && (o?._$AO?.(!1), i === void 0 ? o = void 0 : (o = new i(e), o._$AT(e, n, r)), r !== void 0 ? (n._$Co ??= [])[r] = o : n._$Cl = o), o !== void 0 && (t = Ft(e, o._$AS(e, t.values), o, r)), t;
}
class n4 {
  constructor(t, n) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = n;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: n }, parts: r } = this._$AD, o = (t?.creationScope ?? At).importNode(n, !0);
    vt.currentNode = o;
    let i = vt.nextNode(), s = 0, c = 0, a = r[0];
    for (; a !== void 0; ) {
      if (s === a.index) {
        let l;
        a.type === 2 ? l = new wr(i, i.nextSibling, this, t) : a.type === 1 ? l = new a.ctor(i, a.name, a.strings, this, t) : a.type === 6 && (l = new s4(i, this, t)), this._$AV.push(l), a = r[++c];
      }
      s !== a?.index && (i = vt.nextNode(), s++);
    }
    return vt.currentNode = At, o;
  }
  p(t) {
    let n = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, n), n += r.strings.length - 2) : r._$AI(t[n])), n++;
  }
}
class wr {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, n, r, o) {
    this.type = 2, this._$AH = pe, this._$AN = void 0, this._$AA = t, this._$AB = n, this._$AM = r, this.options = o, this._$Cv = o?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const n = this._$AM;
    return n !== void 0 && t?.nodeType === 11 && (t = n.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, n = this) {
    t = Ft(this, t, n), dn(t) ? t === pe || t == null || t === "" ? (this._$AH !== pe && this._$AR(), this._$AH = pe) : t !== this._$AH && t !== un && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ((r) => Co(r) || typeof r?.[Symbol.iterator] == "function")(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== pe && dn(this._$AH) ? this._$AA.nextSibling.data = t : this.T(At.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: n, _$litType$: r } = t, o = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = hn.createElement(e2(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === o) this._$AH.p(n);
    else {
      const i = new n4(o, this), s = i.u(this.options);
      i.p(n), this.T(s), this._$AH = i;
    }
  }
  _$AC(t) {
    let n = Rs.get(t.strings);
    return n === void 0 && Rs.set(t.strings, n = new hn(t)), n;
  }
  k(t) {
    Co(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let r, o = 0;
    for (const i of t) o === n.length ? n.push(r = new wr(this.O(Xn()), this.O(Xn()), this, this.options)) : r = n[o], r._$AI(i), o++;
    o < n.length && (this._$AR(r && r._$AB.nextSibling, o), n.length = o);
  }
  _$AR(t = this._$AA.nextSibling, n) {
    for (this._$AP?.(!1, !0, n); t && t !== this._$AB; ) {
      const r = t.nextSibling;
      t.remove(), t = r;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class mr {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, n, r, o, i) {
    this.type = 1, this._$AH = pe, this._$AN = void 0, this.element = t, this.name = n, this._$AM = o, this.options = i, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = pe;
  }
  _$AI(t, n = this, r, o) {
    const i = this.strings;
    let s = !1;
    if (i === void 0) t = Ft(this, t, n, 0), s = !dn(t) || t !== this._$AH && t !== un, s && (this._$AH = t);
    else {
      const c = t;
      let a, l;
      for (t = i[0], a = 0; a < i.length - 1; a++) l = Ft(this, c[r + a], n, a), l === un && (l = this._$AH[a]), s ||= !dn(l) || l !== this._$AH[a], l === pe ? t = pe : t !== pe && (t += (l ?? "") + i[a + 1]), this._$AH[a] = l;
    }
    s && !o && this.j(t);
  }
  j(t) {
    t === pe ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class r4 extends mr {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === pe ? void 0 : t;
  }
}
class o4 extends mr {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== pe);
  }
}
class i4 extends mr {
  constructor(t, n, r, o, i) {
    super(t, n, r, o, i), this.type = 5;
  }
  _$AI(t, n = this) {
    if ((t = Ft(this, t, n, 0) ?? pe) === un) return;
    const r = this._$AH, o = t === pe && r !== pe || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, i = t !== pe && (r === pe || o);
    o && this.element.removeEventListener(this.name, this, r), i && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class s4 {
  constructor(t, n, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Ft(this, t);
  }
}
const a4 = xi.litHtmlPolyfillSupport;
a4?.(hn, wr), (xi.litHtmlVersions ??= []).push("3.3.0");
const Wn = globalThis, Ei = Wn.ShadowRoot && (Wn.ShadyCSS === void 0 || Wn.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ai = Symbol(), $s = /* @__PURE__ */ new WeakMap();
class t2 {
  constructor(t, n, r) {
    if (this._$cssResult$ = !0, r !== Ai) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = n;
  }
  get styleSheet() {
    let t = this.o;
    const n = this.t;
    if (Ei && t === void 0) {
      const r = n !== void 0 && n.length === 1;
      r && (t = $s.get(n)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && $s.set(n, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
}
const yr = (e, ...t) => {
  const n = e.length === 1 ? e[0] : t.reduce((r, o, i) => r + ((s) => {
    if (s._$cssResult$ === !0) return s.cssText;
    if (typeof s == "number") return s;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + s + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + e[i + 1], e[0]);
  return new t2(n, e, Ai);
}, Ns = Ei ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let n = "";
  for (const r of t.cssRules) n += r.cssText;
  return ((r) => new t2(typeof r == "string" ? r : r + "", void 0, Ai))(n);
})(e) : e, { is: c4, defineProperty: l4, getOwnPropertyDescriptor: d4, getOwnPropertyNames: u4, getOwnPropertySymbols: h4, getPrototypeOf: f4 } = Object, br = globalThis, Bs = br.trustedTypes, p4 = Bs ? Bs.emptyScript : "", g4 = br.reactiveElementPolyfillSupport, an = (e, t) => e, xo = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? p4 : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let n = e;
  switch (t) {
    case Boolean:
      n = e !== null;
      break;
    case Number:
      n = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        n = JSON.parse(e);
      } catch {
        n = null;
      }
  }
  return n;
} }, n2 = (e, t) => !c4(e, t), Us = { attribute: !0, type: String, converter: xo, reflect: !1, useDefault: !1, hasChanged: n2 };
Symbol.metadata ??= Symbol("metadata"), br.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
class Nt extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, n = Us) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(t, n), !n.noAccessor) {
      const r = Symbol(), o = this.getPropertyDescriptor(t, r, n);
      o !== void 0 && l4(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, n, r) {
    const { get: o, set: i } = d4(this.prototype, t) ?? { get() {
      return this[n];
    }, set(s) {
      this[n] = s;
    } };
    return { get: o, set(s) {
      const c = o?.call(this);
      i?.call(this, s), this.requestUpdate(t, c, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Us;
  }
  static _$Ei() {
    if (this.hasOwnProperty(an("elementProperties"))) return;
    const t = f4(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(an("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(an("properties"))) {
      const n = this.properties, r = [...u4(n), ...h4(n)];
      for (const o of r) this.createProperty(o, n[o]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const n = litPropertyMetadata.get(t);
      if (n !== void 0) for (const [r, o] of n) this.elementProperties.set(r, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [n, r] of this.elementProperties) {
      const o = this._$Eu(n, r);
      o !== void 0 && this._$Eh.set(o, n);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const n = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const o of r) n.unshift(Ns(o));
    } else t !== void 0 && n.push(Ns(t));
    return n;
  }
  static _$Eu(t, n) {
    const r = n.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), n = this.constructor.elementProperties;
    for (const r of n.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ((n, r) => {
      if (Ei) n.adoptedStyleSheets = r.map((o) => o instanceof CSSStyleSheet ? o : o.styleSheet);
      else for (const o of r) {
        const i = document.createElement("style"), s = Wn.litNonce;
        s !== void 0 && i.setAttribute("nonce", s), i.textContent = o.cssText, n.appendChild(i);
      }
    })(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, n, r) {
    this._$AK(t, r);
  }
  _$ET(t, n) {
    const r = this.constructor.elementProperties.get(t), o = this.constructor._$Eu(t, r);
    if (o !== void 0 && r.reflect === !0) {
      const i = (r.converter?.toAttribute !== void 0 ? r.converter : xo).toAttribute(n, r.type);
      this._$Em = t, i == null ? this.removeAttribute(o) : this.setAttribute(o, i), this._$Em = null;
    }
  }
  _$AK(t, n) {
    const r = this.constructor, o = r._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const i = r.getPropertyOptions(o), s = typeof i.converter == "function" ? { fromAttribute: i.converter } : i.converter?.fromAttribute !== void 0 ? i.converter : xo;
      this._$Em = o, this[o] = s.fromAttribute(n, i.type) ?? this._$Ej?.get(o) ?? null, this._$Em = null;
    }
  }
  requestUpdate(t, n, r) {
    if (t !== void 0) {
      const o = this.constructor, i = this[t];
      if (r ??= o.getPropertyOptions(t), !((r.hasChanged ?? n2)(i, n) || r.useDefault && r.reflect && i === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, r)))) return;
      this.C(t, n, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, n, { useDefault: r, reflect: o, wrapped: i }, s) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, s ?? n ?? this[t]), i !== !0 || s !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (n = void 0), this._$AL.set(t, n)), o === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (n) {
      Promise.reject(n);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [o, i] of this._$Ep) this[o] = i;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [o, i] of r) {
        const { wrapped: s } = i, c = this[o];
        s !== !0 || this._$AL.has(o) || c === void 0 || this.C(o, void 0, i, c);
      }
    }
    let t = !1;
    const n = this._$AL;
    try {
      t = this.shouldUpdate(n), t ? (this.willUpdate(n), this._$EO?.forEach((r) => r.hostUpdate?.()), this.update(n)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(n);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((n) => n.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((n) => this._$ET(n, this[n])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
}
Nt.elementStyles = [], Nt.shadowRootOptions = { mode: "open" }, Nt[an("elementProperties")] = /* @__PURE__ */ new Map(), Nt[an("finalized")] = /* @__PURE__ */ new Map(), g4?.({ ReactiveElement: Nt }), (br.reactiveElementVersions ??= []).push("2.1.0");
const ki = globalThis, er = ki.trustedTypes, Is = er ? er.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, r2 = "$lit$", rt = `lit$${Math.random().toFixed(9).slice(2)}$`, o2 = "?" + rt, w4 = `<${o2}>`, kt = document, fn = () => kt.createComment(""), pn = (e) => e === null || typeof e != "object" && typeof e != "function", Eo = Array.isArray, Zr = `[ 	
\f\r]`, Jt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Os = /-->/g, Ps = />/g, pt = RegExp(`>|${Zr}(?:([^\\s"'>=/]+)(${Zr}*=${Zr}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Hs = /'/g, Zs = /"/g, i2 = /^(?:script|style|textarea|title)$/i, s2 = (e) => (t, ...n) => ({ _$litType$: e, strings: t, values: n }), T = s2(1), te = s2(2), Vt = Symbol.for("lit-noChange"), ge = Symbol.for("lit-nothing"), Ws = /* @__PURE__ */ new WeakMap(), Ct = kt.createTreeWalker(kt, 129);
function a2(e, t) {
  if (!Eo(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Is !== void 0 ? Is.createHTML(t) : t;
}
const m4 = (e, t) => {
  const n = e.length - 1, r = [];
  let o, i = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", s = Jt;
  for (let c = 0; c < n; c++) {
    const a = e[c];
    let l, p, u = -1, y = 0;
    for (; y < a.length && (s.lastIndex = y, p = s.exec(a), p !== null); ) y = s.lastIndex, s === Jt ? p[1] === "!--" ? s = Os : p[1] !== void 0 ? s = Ps : p[2] !== void 0 ? (i2.test(p[2]) && (o = RegExp("</" + p[2], "g")), s = pt) : p[3] !== void 0 && (s = pt) : s === pt ? p[0] === ">" ? (s = o ?? Jt, u = -1) : p[1] === void 0 ? u = -2 : (u = s.lastIndex - p[2].length, l = p[1], s = p[3] === void 0 ? pt : p[3] === '"' ? Zs : Hs) : s === Zs || s === Hs ? s = pt : s === Os || s === Ps ? s = Jt : (s = pt, o = void 0);
    const w = s === pt && e[c + 1].startsWith("/>") ? " " : "";
    i += s === Jt ? a + w4 : u >= 0 ? (r.push(l), a.slice(0, u) + r2 + a.slice(u) + rt + w) : a + rt + (u === -2 ? c : w);
  }
  return [a2(e, i + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class gn {
  constructor({ strings: t, _$litType$: n }, r) {
    let o;
    this.parts = [];
    let i = 0, s = 0;
    const c = t.length - 1, a = this.parts, [l, p] = m4(t, n);
    if (this.el = gn.createElement(l, r), Ct.currentNode = this.el.content, n === 2 || n === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (o = Ct.nextNode()) !== null && a.length < c; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const u of o.getAttributeNames()) if (u.endsWith(r2)) {
          const y = p[s++], w = o.getAttribute(u).split(rt), b = /([.?@])?(.*)/.exec(y);
          a.push({ type: 1, index: i, name: b[2], strings: w, ctor: b[1] === "." ? b4 : b[1] === "?" ? v4 : b[1] === "@" ? C4 : vr }), o.removeAttribute(u);
        } else u.startsWith(rt) && (a.push({ type: 6, index: i }), o.removeAttribute(u));
        if (i2.test(o.tagName)) {
          const u = o.textContent.split(rt), y = u.length - 1;
          if (y > 0) {
            o.textContent = er ? er.emptyScript : "";
            for (let w = 0; w < y; w++) o.append(u[w], fn()), Ct.nextNode(), a.push({ type: 2, index: ++i });
            o.append(u[y], fn());
          }
        }
      } else if (o.nodeType === 8) if (o.data === o2) a.push({ type: 2, index: i });
      else {
        let u = -1;
        for (; (u = o.data.indexOf(rt, u + 1)) !== -1; ) a.push({ type: 7, index: i }), u += rt.length - 1;
      }
      i++;
    }
  }
  static createElement(t, n) {
    const r = kt.createElement("template");
    return r.innerHTML = t, r;
  }
}
function Gt(e, t, n = e, r) {
  if (t === Vt) return t;
  let o = r !== void 0 ? n._$Co?.[r] : n._$Cl;
  const i = pn(t) ? void 0 : t._$litDirective$;
  return o?.constructor !== i && (o?._$AO?.(!1), i === void 0 ? o = void 0 : (o = new i(e), o._$AT(e, n, r)), r !== void 0 ? (n._$Co ??= [])[r] = o : n._$Cl = o), o !== void 0 && (t = Gt(e, o._$AS(e, t.values), o, r)), t;
}
class y4 {
  constructor(t, n) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = n;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: n }, parts: r } = this._$AD, o = (t?.creationScope ?? kt).importNode(n, !0);
    Ct.currentNode = o;
    let i = Ct.nextNode(), s = 0, c = 0, a = r[0];
    for (; a !== void 0; ) {
      if (s === a.index) {
        let l;
        a.type === 2 ? l = new vn(i, i.nextSibling, this, t) : a.type === 1 ? l = new a.ctor(i, a.name, a.strings, this, t) : a.type === 6 && (l = new x4(i, this, t)), this._$AV.push(l), a = r[++c];
      }
      s !== a?.index && (i = Ct.nextNode(), s++);
    }
    return Ct.currentNode = kt, o;
  }
  p(t) {
    let n = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, n), n += r.strings.length - 2) : r._$AI(t[n])), n++;
  }
}
class vn {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, n, r, o) {
    this.type = 2, this._$AH = ge, this._$AN = void 0, this._$AA = t, this._$AB = n, this._$AM = r, this.options = o, this._$Cv = o?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const n = this._$AM;
    return n !== void 0 && t?.nodeType === 11 && (t = n.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, n = this) {
    t = Gt(this, t, n), pn(t) ? t === ge || t == null || t === "" ? (this._$AH !== ge && this._$AR(), this._$AH = ge) : t !== this._$AH && t !== Vt && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ((r) => Eo(r) || typeof r?.[Symbol.iterator] == "function")(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== ge && pn(this._$AH) ? this._$AA.nextSibling.data = t : this.T(kt.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: n, _$litType$: r } = t, o = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = gn.createElement(a2(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === o) this._$AH.p(n);
    else {
      const i = new y4(o, this), s = i.u(this.options);
      i.p(n), this.T(s), this._$AH = i;
    }
  }
  _$AC(t) {
    let n = Ws.get(t.strings);
    return n === void 0 && Ws.set(t.strings, n = new gn(t)), n;
  }
  k(t) {
    Eo(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let r, o = 0;
    for (const i of t) o === n.length ? n.push(r = new vn(this.O(fn()), this.O(fn()), this, this.options)) : r = n[o], r._$AI(i), o++;
    o < n.length && (this._$AR(r && r._$AB.nextSibling, o), n.length = o);
  }
  _$AR(t = this._$AA.nextSibling, n) {
    for (this._$AP?.(!1, !0, n); t && t !== this._$AB; ) {
      const r = t.nextSibling;
      t.remove(), t = r;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class vr {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, n, r, o, i) {
    this.type = 1, this._$AH = ge, this._$AN = void 0, this.element = t, this.name = n, this._$AM = o, this.options = i, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = ge;
  }
  _$AI(t, n = this, r, o) {
    const i = this.strings;
    let s = !1;
    if (i === void 0) t = Gt(this, t, n, 0), s = !pn(t) || t !== this._$AH && t !== Vt, s && (this._$AH = t);
    else {
      const c = t;
      let a, l;
      for (t = i[0], a = 0; a < i.length - 1; a++) l = Gt(this, c[r + a], n, a), l === Vt && (l = this._$AH[a]), s ||= !pn(l) || l !== this._$AH[a], l === ge ? t = ge : t !== ge && (t += (l ?? "") + i[a + 1]), this._$AH[a] = l;
    }
    s && !o && this.j(t);
  }
  j(t) {
    t === ge ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class b4 extends vr {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === ge ? void 0 : t;
  }
}
class v4 extends vr {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== ge);
  }
}
class C4 extends vr {
  constructor(t, n, r, o, i) {
    super(t, n, r, o, i), this.type = 5;
  }
  _$AI(t, n = this) {
    if ((t = Gt(this, t, n, 0) ?? ge) === Vt) return;
    const r = this._$AH, o = t === ge && r !== ge || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, i = t !== ge && (r === ge || o);
    o && this.element.removeEventListener(this.name, this, r), i && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class x4 {
  constructor(t, n, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Gt(this, t);
  }
}
const E4 = ki.litHtmlPolyfillSupport;
E4?.(gn, vn), (ki.litHtmlVersions ??= []).push("3.3.0");
const Si = globalThis;
class Pt extends Nt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ((r, o, i) => {
      const s = i?.renderBefore ?? o;
      let c = s._$litPart$;
      if (c === void 0) {
        const a = i?.renderBefore ?? null;
        s._$litPart$ = c = new vn(o.insertBefore(fn(), a), a, void 0, i ?? {});
      }
      return c._$AI(r), c;
    })(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return Vt;
  }
}
Pt._$litElement$ = !0, Pt.finalized = !0, Si.litElementHydrateSupport?.({ LitElement: Pt });
const A4 = Si.litElementPolyfillSupport;
A4?.({ LitElement: Pt }), (Si.litElementVersions ??= []).push("4.2.0");
const K = (e) => (t, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
}, k4 = { attribute: !0, type: String, converter: Jn, reflect: !1, hasChanged: Ci }, S4 = (e = k4, t, n) => {
  const { kind: r, metadata: o } = n;
  let i = globalThis.litPropertyMetadata.get(o);
  if (i === void 0 && globalThis.litPropertyMetadata.set(o, i = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), i.set(n.name, e), r === "accessor") {
    const { name: s } = n;
    return { set(c) {
      const a = t.get.call(this);
      t.set.call(this, c), this.requestUpdate(s, a, e);
    }, init(c) {
      return c !== void 0 && this.C(s, void 0, e, c), c;
    } };
  }
  if (r === "setter") {
    const { name: s } = n;
    return function(c) {
      const a = this[s];
      t.call(this, c), this.requestUpdate(s, a, e);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function ue(e) {
  return (t, n) => typeof n == "object" ? S4(e, t, n) : ((r, o, i) => {
    const s = o.hasOwnProperty(i);
    return o.constructor.createProperty(i, r), s ? Object.getOwnPropertyDescriptor(o, i) : void 0;
  })(e, t, n);
}
function J(e) {
  return ue({ ...e, state: !0, attribute: !1 });
}
let Ds, Fs;
class _i extends Pt {
  updated(t) {
    var n;
    if (super.updated(t), globalThis.document && globalThis.document.documentElement.classList.contains("dark") && (n = this.shadowRoot) != null && (n = n.children) != null && n.length) for (const r of this.shadowRoot.children) r.classList.contains("dark") || r.classList.add("dark");
  }
  _getBrandColorLuminance() {
    if (!globalThis.window) return 0;
    const t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    let n = window.getComputedStyle(this).getPropertyValue(t ? "--bc-color-brand-dark" : "--bc-color-brand") || window.getComputedStyle(this).getPropertyValue("--bc-color-brand") || "#196CE7";
    if (!n.match(/^#[0-9A-F]{6}$/i)) {
      const r = document.createElement("div");
      r.style.color = n, r.style.display = "none", document.body.appendChild(r), n = window.getComputedStyle(r).color, r.remove();
    }
    return (function(r) {
      if (r.startsWith("#")) return r = r.slice(1), (0.299 * parseInt(r.slice(0, 2), 16) + 0.587 * parseInt(r.slice(2, 4), 16) + 0.114 * parseInt(r.slice(4, 6), 16)) / 255;
      if (r.startsWith("rgb") || r.startsWith("rgba")) {
        const o = r.match(/\d+(\.\d+)?/g);
        return (0.299 * parseFloat(o[0]) + 0.587 * parseFloat(o[1]) + 0.114 * parseFloat(o[2])) / 255;
      }
      throw new Error("Unsupported luminance: " + r);
    })(n);
  }
}
_i.styles = [yr(Ds || (Ds = ((e) => e)`
      :host {
        // global css reset in shadow DOM
        all: initial;
        font-variant-numeric: slashed-zero;
      }
      // TODO: move to individual components - only needed by a couple of icons
      .hover-animation:hover .hover-right-up {
        transform: translateX(2px) translateY(-2px);
        transition: all 0.3s;
      }
      .hover-animation:hover .hover-right {
        transform: translateX(3px);
        transition: all 0.3s;
      }
    `))];
class Y extends _i {
  constructor() {
    super(), this._modalOpen = !1, this._connected = !1, this._connecting = !1, this._connectorName = void 0, this._appName = void 0, this._appIcon = void 0, this._filters = void 0, this._error = void 0, this._connected = O.getState().connected, this._connecting = O.getState().connecting, this._connectorName = O.getState().connectorName, this._appName = O.getState().bitcoinConnectConfig.appName, this._appIcon = O.getState().bitcoinConnectConfig.appIcon, this._filters = O.getState().bitcoinConnectConfig.filters, this._error = O.getState().error, this._route = O.getState().route, this._modalOpen = O.getState().modalOpen, O.subscribe((t) => {
      this._connected = t.connected, this._connecting = t.connecting, this._connectorName = t.connectorName, this._appName = t.bitcoinConnectConfig.appName, this._appIcon = t.bitcoinConnectConfig.appIcon, this._filters = t.bitcoinConnectConfig.filters, this._error = t.error, this._route = t.route, this._modalOpen = t.modalOpen;
    });
  }
}
I([J()], Y.prototype, "_modalOpen", void 0), I([J()], Y.prototype, "_connected", void 0), I([J()], Y.prototype, "_connecting", void 0), I([J()], Y.prototype, "_connectorName", void 0), I([J()], Y.prototype, "_appName", void 0), I([J()], Y.prototype, "_appIcon", void 0), I([J()], Y.prototype, "_filters", void 0), I([J()], Y.prototype, "_error", void 0), I([J()], Y.prototype, "_route", void 0);
const cn = te(Fs || (Fs = ((e) => e)`
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.4635 6.0794C17.4325 6.83684 18.8238 7.94315 18.5058 9.88813C18.3285 10.984 17.8283 11.6586 17.1374 12.0334C16.8767 12.1748 16.8191 12.6131 17.0507 12.7984C18.0431 13.592 18.4393 14.7164 17.8152 16.4238C16.9057 18.9138 14.8635 19.177 12.1521 18.6697C11.9858 18.6385 11.8223 18.7396 11.7792 18.9032L11.4563 20.1009C11.3343 20.5633 10.8605 20.8392 10.3981 20.7173C9.93541 20.5953 9.65932 20.1212 9.78149 19.6586L10.0909 18.5121C10.1354 18.3439 10.0349 18.1715 9.86676 18.1266C9.62998 18.0632 9.39019 17.9976 9.14679 17.9294C8.97646 17.8817 8.79964 17.9822 8.75452 18.1532L8.44373 19.3067C8.32182 19.7688 7.8483 20.0446 7.38616 19.9226C6.92422 19.8007 6.64851 19.3274 6.77026 18.8655L7.08988 17.677C7.13458 17.5073 7.03399 17.3333 6.86481 17.2869C6.81003 17.2718 6.75512 17.2567 6.70008 17.2415L6.69828 17.241C6.4604 17.1755 6.22001 17.1094 5.97667 17.0449L5.42127 16.8919C4.80739 16.7299 4.48576 16.0556 4.74625 15.4767C4.95488 15.013 5.47104 14.7734 5.96239 14.9043C5.97132 14.9067 5.98016 14.909 5.98891 14.9113C6.1066 14.9426 6.10094 14.9199 6.21958 14.8924C6.46112 14.8366 6.58893 14.6373 6.65055 14.4901L7.80952 10.0986L7.81254 10.0867L8.63176 6.98069C8.63683 6.96147 8.64021 6.94184 8.64116 6.92198C8.65547 6.62155 8.78957 6.31876 8.35166 6.11178C8.25682 6.06695 8.16354 6.02432 8.06217 5.99736C8.04539 5.9929 8.02808 5.98833 8.01032 5.98367C7.51444 5.85341 7.21198 5.34932 7.34263 4.85356C7.47162 4.36411 7.9731 4.07202 8.46248 4.2013L9.43668 4.47448C9.68634 4.54012 9.94146 4.60362 10.2006 4.66691C10.3681 4.70784 10.5375 4.60681 10.5815 4.44006L10.8668 3.39102C10.9889 2.9288 11.4625 2.65299 11.9247 2.77495C12.3871 2.89693 12.663 3.37062 12.541 3.83294L12.2715 4.82295C12.2273 4.99041 12.3292 5.16145 12.4975 5.20248C12.7444 5.26269 12.9911 5.32354 13.2353 5.38588C13.4 5.42795 13.5684 5.32988 13.6118 5.16547L13.8783 4.18608C14.0003 3.72357 14.4741 3.44751 14.9366 3.56948C15.3992 3.69145 15.6753 4.16533 15.5533 4.62789L15.2637 5.69461C15.2215 5.85461 15.3091 6.01999 15.4635 6.0794ZM11.2479 8.6805L11.4769 7.81121C11.5836 7.40644 11.9982 7.16477 12.403 7.27142C12.8077 7.37807 13.0494 7.79266 12.9428 8.19743L12.7137 9.06672L13.5829 9.29575C13.9877 9.4024 14.2294 9.81699 14.1227 10.2218C14.0161 10.6265 13.6015 10.8682 13.1967 10.7615L12.3275 10.5325L12.0984 11.4018C11.9918 11.8066 11.5772 12.0483 11.1724 11.9416C10.7676 11.835 10.5259 11.4204 10.6326 11.0156L10.8617 10.1463L9.99225 9.91722C9.58747 9.81056 9.34579 9.39598 9.45245 8.99121C9.5591 8.58644 9.9737 8.34477 10.3785 8.45142L11.2479 8.6805ZM13.2927 12.7001L13.0636 13.5693L12.1942 13.3403C11.7895 13.2336 11.3749 13.4753 11.2682 13.8801C11.1615 14.2848 11.4032 14.6994 11.808 14.8061L12.6774 15.0351L12.4484 15.9045C12.3417 16.3092 12.5834 16.7238 12.9882 16.8305C13.3929 16.9371 13.8075 16.6954 13.9142 16.2907L14.1432 15.4214L15.0125 15.6504C15.4172 15.757 15.8318 15.5154 15.9385 15.1106C16.0451 14.7058 15.8035 14.2912 15.3987 14.1846L14.5295 13.9556L14.7585 13.0863C14.8652 12.6815 14.6235 12.2669 14.2187 12.1603C13.8139 12.0536 13.3994 12.2953 13.2927 12.7001Z" fill="currentColor"/>
</svg>`));
function Li(e) {
  return [...e.v, (e.i ? "!" : "") + e.n].join(":");
}
function _4(e, t = ",") {
  return e.map(Li).join(t);
}
let c2 = typeof CSS < "u" && CSS.escape || ((e) => e.replace(/[!"'`*+.,;:\\/<=>?@#$%&^|~()[\]{}]/g, "\\$&").replace(/^\d/, "\\3$& "));
function tr(e) {
  for (var t = 9, n = e.length; n--; ) t = Math.imul(t ^ e.charCodeAt(n), 1597334677);
  return "#" + ((t ^ t >>> 9) >>> 0).toString(36);
}
function Ti(e, t = "@media ") {
  return t + se(e).map((n) => (typeof n == "string" && (n = { min: n }), n.raw || Object.keys(n).map((r) => `(${r}-width:${n[r]})`).join(" and "))).join(",");
}
function se(e = []) {
  return Array.isArray(e) ? e : e == null ? [] : [e];
}
function Vs(e) {
  return e;
}
function Ao() {
}
let ye = { d: 0, b: 134217728, c: 268435456, a: 671088640, u: 805306368, o: 939524096 };
function l2(e) {
  return e.match(/[-=:;]/g)?.length || 0;
}
function ko(e) {
  return Math.min(/(?:^|width[^\d]+)(\d+(?:.\d+)?)(p)?/.test(e) ? Math.max(0, 29.63 * (+RegExp.$1 / (RegExp.$2 ? 15 : 1)) ** 0.137 - 43) : 0, 15) << 22 | Math.min(l2(e), 15) << 18;
}
let L4 = ["rst-c", "st-ch", "h-chi", "y-lin", "nk", "sited", "ecked", "pty", "ad-on", "cus-w", "ver", "cus", "cus-v", "tive", "sable", "tiona", "quire"];
function Mi({ n: e, i: t, v: n = [] }, r, o, i) {
  e && (e = Li({ n: e, i: t, v: n })), i = [...se(i)];
  for (let s of n) {
    let c = r.theme("screens", s);
    for (let a of se(c && Ti(c) || r.v(s))) i.push(a), o |= c ? 67108864 | ko(a) : s == "dark" ? 1073741824 : a[0] == "@" ? ko(a) : 1 << ~(/:([a-z-]+)/.test(a) && ~L4.indexOf(RegExp.$1.slice(2, 7)) || -18);
  }
  return { n: e, p: o, r: i, i: t };
}
let d2 = /* @__PURE__ */ new Map();
function So(e) {
  if (e.d) {
    let t = [], n = Wr(e.r.reduce((r, o) => o[0] == "@" ? (t.push(o), r) : o ? Wr(r, (i) => Wr(o, (s) => {
      let c = /(:merge\(.+?\))(:[a-z-]+|\\[.+])/.exec(s);
      if (c) {
        let a = i.indexOf(c[1]);
        return ~a ? i.slice(0, a) + c[0] + i.slice(a + c[1].length) : Dr(i, s);
      }
      return Dr(s, i);
    })) : r, "&"), (r) => Dr(r, e.n ? "." + c2(e.n) : ""));
    return n && t.push(n.replace(/:merge\((.+?)\)/g, "$1")), t.reduceRight((r, o) => o + "{" + r + "}", e.d);
  }
}
function Wr(e, t) {
  return e.replace(/ *((?:\(.+?\)|\[.+?\]|[^,])+) *(,|$)/g, (n, r, o) => t(r) + o);
}
function Dr(e, t) {
  return e.replace(/&/g, t);
}
let Gs = new Intl.Collator("en", { numeric: !0 });
function u2(e, t) {
  for (var n = 0, r = e.length; n < r; ) {
    let o = r + n >> 1;
    0 >= h2(e[o], t) ? n = o + 1 : r = o;
  }
  return r;
}
function h2(e, t) {
  let n = e.p & ye.o;
  return n != (t.p & ye.o) || n != ye.b && n != ye.o ? e.p - t.p || e.o - t.o || Gs.compare(js(e.n), js(t.n)) || Gs.compare(zs(e.n), zs(t.n)) : 0;
}
function js(e) {
  return (e || "").split(/:/).pop().split("/").pop() || "\0";
}
function zs(e) {
  return (e || "").replace(/\W/g, (t) => String.fromCharCode(127 + t.charCodeAt(0))) + "\0";
}
function Fr(e, t) {
  return Math.round(parseInt(e, 16) * t);
}
function it(e, t = {}) {
  if (typeof e == "function") return e(t);
  let { opacityValue: n = "1", opacityVariable: r } = t, o = r ? `var(${r})` : n;
  if (e.includes("<alpha-value>")) return e.replace("<alpha-value>", o);
  if (e[0] == "#" && (e.length == 4 || e.length == 7)) {
    let i = (e.length - 1) / 3, s = [17, 1, 0.062272][i - 1];
    return `rgba(${[Fr(e.substr(1, i), s), Fr(e.substr(1 + i, i), s), Fr(e.substr(1 + 2 * i, i), s), o]})`;
  }
  return o == "1" ? e : o == "0" ? "#0000" : e.replace(/^(rgb|hsl)(\([^)]+)\)$/, `$1a$2,${o})`);
}
function f2(e, t, n, r, o = []) {
  return (function i(s, { n: c, p: a, r: l = [], i: p }, u) {
    let y = [], w = "", b = 0, C = 0;
    for (let _ in s || {}) {
      var A, k;
      let F = s[_];
      if (_[0] == "@") {
        if (!F) continue;
        if (_[1] == "a") {
          y.push(...$i(c, a, rr("" + F), u, a, l, p, !0));
          continue;
        }
        if (_[1] == "l") {
          for (let V of se(F)) y.push(...i(V, { n: c, p: (A = ye[_[7]], a & -939524097 | A), r: _[7] == "d" ? [] : l, i: p }, u));
          continue;
        }
        if (_[1] == "i") {
          y.push(...se(F).map((V) => ({ p: -1, o: 0, r: [], d: _ + " " + V })));
          continue;
        }
        if (_[1] == "k") {
          y.push({ p: ye.d, o: 0, r: [_], d: i(F, { p: ye.d }, u).map(So).join("") });
          continue;
        }
        if (_[1] == "f") {
          y.push(...se(F).map((V) => ({ p: ye.d, o: 0, r: [_], d: i(V, { p: ye.d }, u).map(So).join("") })));
          continue;
        }
      }
      if (typeof F != "object" || Array.isArray(F)) _ == "label" && F ? c = F + tr(JSON.stringify([a, p, s])) : (F || F === 0) && (_ = _.replace(/[A-Z]/g, (V) => "-" + V.toLowerCase()), C += 1, b = Math.max(b, (k = _)[0] == "-" ? 0 : l2(k) + (/^(?:(border-(?!w|c|sty)|[tlbr].{2,4}m?$|c.{7,8}$)|([fl].{5}l|g.{8}$|pl))/.test(k) ? +!!RegExp.$1 || -!!RegExp.$2 : 0) + 1), w += (w ? ";" : "") + se(F).map((V) => u.s(_, Ri("" + V, u.theme) + (p ? " !important" : ""))).join(";"));
      else if (_[0] == "@" || _.includes("&")) {
        let V = a;
        _[0] == "@" && (_ = _.replace(/\bscreen\(([^)]+)\)/g, (S, M) => {
          let R = u.theme("screens", M);
          return R ? (V |= 67108864, Ti(R, "")) : S;
        }), V |= ko(_)), y.push(...i(F, { n: c, p: V, r: [...l, _], i: p }, u));
      } else y.push(...i(F, { p: a, r: [...l, _] }, u));
    }
    return y.unshift({ n: c, p: a, o: Math.max(0, 15 - C) + 1.5 * Math.min(b || 15, 15), r: l, d: w }), y.sort(h2);
  })(e, Mi(t, n, r, o), n);
}
function Ri(e, t) {
  return e.replace(/theme\((["'`])?(.+?)\1(?:\s*,\s*(["'`])?(.+?)\3)?\)/g, (n, r, o, i, s = "") => {
    let c = t(o, s);
    return typeof c == "function" && /color|fill|stroke/i.test(o) ? it(c) : "" + se(c).filter((a) => Object(a) !== a);
  });
}
function p2(e, t) {
  let n, r = [];
  for (let o of e) o.d && o.n ? n?.p == o.p && "" + n.r == "" + o.r ? (n.c = [n.c, o.c].filter(Boolean).join(" "), n.d = n.d + ";" + o.d) : r.push(n = { ...o, n: o.n && t }) : r.push({ ...o, n: o.n && t });
  return r;
}
function nr(e, t, n = ye.u, r, o) {
  let i = [];
  for (let s of e) for (let c of (function(a, l, p, u, y) {
    let w = (function(b, C) {
      let A = d2.get(b.n);
      return A ? A(b, C) : C.r(b.n, b.v[0] == "dark");
    })(a = { ...a, i: a.i || y }, l);
    return w ? typeof w == "string" ? ({ r: u, p } = Mi(a, l, p, u), p2(nr(rr(w), l, p, u, a.i), a.n)) : Array.isArray(w) ? w.map((b) => {
      var C, A;
      return { o: 0, ...b, r: [...se(u), ...se(b.r)], p: (C = p, A = b.p ?? p, C & -939524097 | A) };
    }) : f2(w, a, l, p, u) : [{ c: Li(a), p: 0, o: 0, r: [] }];
  })(s, t, n, r, o)) i.splice(u2(i, c), 0, c);
  return i;
}
function $i(e, t, n, r, o, i, s, c) {
  return p2((c ? n.flatMap((a) => nr([a], r, o, i, s)) : nr(n, r, o, i, s)).map((a) => a.p & ye.o && (a.n || t == ye.b) ? { ...a, p: a.p & -939524097 | t, o: 0 } : a), e);
}
function T4(e, t, n, r) {
  return d2.set(e, (o, i) => {
    let { n: s, p: c, r: a, i: l } = Mi(o, i, t);
    return n && $i(s, t, n, i, c, a, l, r);
  }), e;
}
function Vr(e, t, n) {
  if (e[e.length - 1] != "(") {
    let r = [], o = !1, i = !1, s = "";
    for (let c of e) if (c != "(" && !/[~@]$/.test(c)) {
      if (c[0] == "!" && (c = c.slice(1), o = !o), c.endsWith(":")) {
        r[c == "dark:" ? "unshift" : "push"](c.slice(0, -1));
        continue;
      }
      c[0] == "-" && (c = c.slice(1), i = !i), c.endsWith("-") && (c = c.slice(0, -1)), c && c != "&" && (s += (s && "-") + c);
    }
    s && (i && (s = "-" + s), t[0].push({ n: s, v: r.filter(M4), i: o }));
  }
}
function M4(e, t, n) {
  return n.indexOf(e) == t;
}
let qs = /* @__PURE__ */ new Map();
function rr(e) {
  let t = qs.get(e);
  if (!t) {
    let n = [], r = [[]], o = 0, i = 0, s = null, c = 0, a = (l, p = 0) => {
      o != c && (n.push(e.slice(o, c + p)), l && Vr(n, r)), o = c + 1;
    };
    for (; c < e.length; c++) {
      let l = e[c];
      if (i) e[c - 1] != "\\" && (i += +(l == "[") || -(l == "]"));
      else if (l == "[") i += 1;
      else if (s) e[c - 1] != "\\" && s.test(e.slice(c)) && (s = null, o = c + RegExp.lastMatch.length);
      else if (l != "/" || e[c - 1] == "\\" || e[c + 1] != "*" && e[c + 1] != "/") if (l == "(") a(), n.push(l);
      else if (l == ":") e[c + 1] != ":" && a(!1, 1);
      else if (/[\s,)]/.test(l)) {
        a(!0);
        let p = n.lastIndexOf("(");
        if (l == ")") {
          let u = n[p - 1];
          if (/[~@]$/.test(u)) {
            let y = r.shift();
            n.length = p, Vr([...n, "#"], r);
            let { v: w } = r[0].pop();
            for (let b of y) b.v.splice(+(b.v[0] == "dark") - +(w[0] == "dark"), w.length);
            Vr([...n, T4(u.length > 1 ? u.slice(0, -1) + tr(JSON.stringify([u, y])) : u + "(" + _4(y) + ")", ye.a, y, /@$/.test(u))], r);
          }
          p = n.lastIndexOf("(", p - 1);
        }
        n.length = p + 1;
      } else /[~@]/.test(l) && e[c + 1] == "(" && r.unshift([]);
      else s = e[c + 1] == "*" ? /^\*\// : /^[\r\n]/;
    }
    a(!0), qs.set(e, t = r[0]);
  }
  return t;
}
function Z(e, t, n) {
  return [e, _o(t, n)];
}
function _o(e, t) {
  return typeof e == "function" ? e : typeof e == "string" && /^[\w-]+$/.test(e) ? (n, r) => ({ [e]: t ? t(n, r) : Lo(n, 1) }) : (n) => e || { [n[1]]: Lo(n, 2) };
}
function Lo(e, t, n = e.slice(t).find(Boolean) || e.$$ || e.input) {
  return e.input[0] == "-" ? `calc(${n} * -1)` : n;
}
function W(e, t, n, r) {
  return [e, R4(t, n, r)];
}
function R4(e, t, n) {
  let r = typeof t == "string" ? (o, i) => ({ [t]: n ? n(o, i) : o._ }) : t || (({ 1: o, _: i }, s, c) => ({ [o || c]: i }));
  return (o, i) => {
    let s = g2(e || o[1]), c = i.theme(s, o.$$) ?? st(o.$$, s, i);
    if (c != null) return o._ = Lo(o, 0, c), r(o, i, s);
  };
}
function he(e, t = {}, n) {
  return [e, $4(t, n)];
}
function $4(e = {}, t) {
  return (n, r) => {
    let { section: o = g2(n[0]).replace("-", "") + "Color" } = e, [i, s] = (n.$$.match(/^(\[[^\]]+]|[^/]+?)(?:\/(.+))?$/) || []).slice(1);
    if (!i) return;
    let c = r.theme(o, i) || st(i, o, r);
    if (!c || typeof c == "object") return;
    let { opacityVariable: a = `--tw-${n[0].replace(/-$/, "")}-opacity`, opacitySection: l = o.replace("Color", "Opacity"), property: p = o, selector: u } = e, y = r.theme(l, s || "DEFAULT") || s && st(s, l, r), w = t || (({ _: C }) => {
      let A = Dn(p, C);
      return u ? { [u]: A } : A;
    });
    n._ = { value: it(c, { opacityVariable: a || void 0, opacityValue: y || void 0 }), color: (C) => it(c, C), opacityVariable: a || void 0, opacityValue: y || void 0 };
    let b = w(n, r);
    if (!n.dark) {
      let C = r.d(o, i, c);
      C && C !== c && (n._ = { value: it(C, { opacityVariable: a || void 0, opacityValue: y || "1" }), color: (A) => it(C, A), opacityVariable: a || void 0, opacityValue: y || void 0 }, b = { "&": b, [r.v("dark")]: w(n, r) });
    }
    return b;
  };
}
function Dn(e, t) {
  let n = {};
  return typeof t == "string" ? n[e] = t : (t.opacityVariable && t.value.includes(t.opacityVariable) && (n[t.opacityVariable] = t.opacityValue || "1"), n[e] = t.value), n;
}
function st(e, t, n) {
  if (e[0] == "[" && e.slice(-1) == "]") {
    if (e = wn(Ri(e.slice(1, -1), n.theme)), !t) return e;
    if (!(/color|fill|stroke/i.test(t) && !/^color:/.test(e) && !/^(#|((hsl|rgb)a?|hwb|lab|lch|color)\(|[a-z]+$)/.test(e) || /image/i.test(t) && !/^image:/.test(e) && !/^[a-z-]+\(/.test(e) || /weight/i.test(t) && !/^(number|any):/.test(e) && !/^\d+$/.test(e) || /position/i.test(t) && /^(length|size):/.test(e))) return e.replace(/^[a-z-]+:/, "");
  }
}
function g2(e) {
  return e.replace(/-./g, (t) => t[1].toUpperCase());
}
function wn(e) {
  return e.includes("url(") ? e.replace(/(.*?)(url\(.*?\))(.*?)/g, (t, n = "", r, o = "") => wn(n) + r + wn(o)) : e.replace(/(^|[^\\])_+/g, (t, n) => n + " ".repeat(t.length - n.length)).replace(/\\_/g, "_").replace(/(calc|min|max|clamp)\(.+\)/g, (t) => t.replace(/(-?\d*\.?\d(?!\b-.+[,)](?![^+\-/*])\D)(?:%|[a-z]+)?|\))([+\-/*])/g, "$1 $2 "));
}
function Ks({ presets: e = [], ...t }) {
  let n = { darkMode: void 0, darkColor: void 0, preflight: t.preflight !== !1 && [], theme: {}, variants: se(t.variants), rules: se(t.rules), ignorelist: se(t.ignorelist), hash: void 0, stringify: (r, o) => r + ":" + o, finalize: [] };
  for (let r of se([...e, { darkMode: t.darkMode, darkColor: t.darkColor, preflight: t.preflight !== !1 && se(t.preflight), theme: t.theme, hash: t.hash, stringify: t.stringify, finalize: t.finalize }])) {
    let { preflight: o, darkMode: i = n.darkMode, darkColor: s = n.darkColor, theme: c, variants: a, rules: l, ignorelist: p, hash: u = n.hash, stringify: y = n.stringify, finalize: w } = typeof r == "function" ? r(n) : r;
    n = { preflight: n.preflight !== !1 && o !== !1 && [...n.preflight, ...se(o)], darkMode: i, darkColor: s, theme: { ...n.theme, ...c, extend: { ...n.theme.extend, ...c?.extend } }, variants: [...n.variants, ...se(a)], rules: [...n.rules, ...se(l)], ignorelist: [...n.ignorelist, ...se(p)], hash: u, stringify: y, finalize: [...n.finalize, ...se(w)] };
  }
  return n;
}
function Qs(e, t, n, r, o, i) {
  for (let s of t) {
    let c = n.get(s);
    c || n.set(s, c = r(s));
    let a = c(e, o, i);
    if (a) return a;
  }
}
function N4(e) {
  var t;
  return To(e[0], typeof (t = e[1]) == "function" ? t : () => t);
}
function B4(e) {
  return Array.isArray(e) ? To(e[0], _o(e[1], e[2])) : To(e, _o(void 0, void 0));
}
function To(e, t) {
  return w2(e, (n, r, o, i) => {
    let s = r.exec(n);
    if (s) return s.$$ = n.slice(s[0].length), s.dark = i, t(s, o);
  });
}
function w2(e, t) {
  let n = se(e).map(U4);
  return (r, o, i) => {
    for (let s of n) {
      let c = t(r, s, o, i);
      if (c) return c;
    }
  };
}
function U4(e) {
  return typeof e == "string" ? RegExp("^" + e + (e.includes("$") || e.slice(-1) == "-" ? "" : "$")) : e;
}
function Gr(e) {
  let t = e?.cssRules ? e : (e && typeof e != "string" ? e : (function(n) {
    let r = document.querySelector(n || 'style[data-twind=""]');
    return r && r.tagName == "STYLE" || (r = document.createElement("style"), document.head.prepend(r)), r.dataset.twind = "claimed", r;
  })(e)).sheet;
  return { target: t, snapshot() {
    let n = Array.from(t.cssRules, (r) => r.cssText);
    return () => {
      this.clear(), n.forEach(this.insert);
    };
  }, clear() {
    for (let n = t.cssRules.length; n--; ) t.deleteRule(n);
  }, destroy() {
    t.ownerNode?.remove();
  }, insert(n, r) {
    try {
      t.insertRule(n, r);
    } catch {
      t.insertRule(":root{}", r);
    }
  }, resume: Ao };
}
let Mo = { screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" }, columns: { auto: "auto", "3xs": "16rem", "2xs": "18rem", xs: "20rem", sm: "24rem", md: "28rem", lg: "32rem", xl: "36rem", "2xl": "42rem", "3xl": "48rem", "4xl": "56rem", "5xl": "64rem", "6xl": "72rem", "7xl": "80rem" }, spacing: { px: "1px", 0: "0px", .../* @__PURE__ */ ke(4, "rem", 4, 0.5, 0.5), .../* @__PURE__ */ ke(12, "rem", 4, 5), 14: "3.5rem", .../* @__PURE__ */ ke(64, "rem", 4, 16, 4), 72: "18rem", 80: "20rem", 96: "24rem" }, durations: { 75: "75ms", 100: "100ms", 150: "150ms", 200: "200ms", 300: "300ms", 500: "500ms", 700: "700ms", 1e3: "1000ms" }, animation: { none: "none", spin: "spin 1s linear infinite", ping: "ping 1s cubic-bezier(0,0,0.2,1) infinite", pulse: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite", bounce: "bounce 1s infinite" }, aspectRatio: { auto: "auto", square: "1/1", video: "16/9" }, backdropBlur: /* @__PURE__ */ X("blur"), backdropBrightness: /* @__PURE__ */ X("brightness"), backdropContrast: /* @__PURE__ */ X("contrast"), backdropGrayscale: /* @__PURE__ */ X("grayscale"), backdropHueRotate: /* @__PURE__ */ X("hueRotate"), backdropInvert: /* @__PURE__ */ X("invert"), backdropOpacity: /* @__PURE__ */ X("opacity"), backdropSaturate: /* @__PURE__ */ X("saturate"), backdropSepia: /* @__PURE__ */ X("sepia"), backgroundColor: /* @__PURE__ */ X("colors"), backgroundImage: { none: "none" }, backgroundOpacity: /* @__PURE__ */ X("opacity"), backgroundSize: { auto: "auto", cover: "cover", contain: "contain" }, blur: { none: "none", 0: "0", sm: "4px", DEFAULT: "8px", md: "12px", lg: "16px", xl: "24px", "2xl": "40px", "3xl": "64px" }, brightness: { .../* @__PURE__ */ ke(200, "", 100, 0, 50), .../* @__PURE__ */ ke(110, "", 100, 90, 5), 75: "0.75", 125: "1.25" }, borderColor: ({ theme: e }) => ({ DEFAULT: e("colors.gray.200", "currentColor"), ...e("colors") }), borderOpacity: /* @__PURE__ */ X("opacity"), borderRadius: { none: "0px", sm: "0.125rem", DEFAULT: "0.25rem", md: "0.375rem", lg: "0.5rem", xl: "0.75rem", "2xl": "1rem", "3xl": "1.5rem", "1/2": "50%", full: "9999px" }, borderSpacing: /* @__PURE__ */ X("spacing"), borderWidth: { DEFAULT: "1px", .../* @__PURE__ */ Te(8, "px") }, boxShadow: { sm: "0 1px 2px 0 rgba(0,0,0,0.05)", DEFAULT: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)", md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)", lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)", xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", "2xl": "0 25px 50px -12px rgba(0,0,0,0.25)", inner: "inset 0 2px 4px 0 rgba(0,0,0,0.05)", none: "0 0 #0000" }, boxShadowColor: X("colors"), caretColor: /* @__PURE__ */ X("colors"), accentColor: ({ theme: e }) => ({ auto: "auto", ...e("colors") }), contrast: { .../* @__PURE__ */ ke(200, "", 100, 0, 50), 75: "0.75", 125: "1.25" }, content: { none: "none" }, divideColor: /* @__PURE__ */ X("borderColor"), divideOpacity: /* @__PURE__ */ X("borderOpacity"), divideWidth: /* @__PURE__ */ X("borderWidth"), dropShadow: { sm: "0 1px 1px rgba(0,0,0,0.05)", DEFAULT: ["0 1px 2px rgba(0,0,0,0.1)", "0 1px 1px rgba(0,0,0,0.06)"], md: ["0 4px 3px rgba(0,0,0,0.07)", "0 2px 2px rgba(0,0,0,0.06)"], lg: ["0 10px 8px rgba(0,0,0,0.04)", "0 4px 3px rgba(0,0,0,0.1)"], xl: ["0 20px 13px rgba(0,0,0,0.03)", "0 8px 5px rgba(0,0,0,0.08)"], "2xl": "0 25px 25px rgba(0,0,0,0.15)", none: "0 0 #0000" }, fill: ({ theme: e }) => ({ ...e("colors"), none: "none" }), grayscale: { DEFAULT: "100%", 0: "0" }, hueRotate: { 0: "0deg", 15: "15deg", 30: "30deg", 60: "60deg", 90: "90deg", 180: "180deg" }, invert: { DEFAULT: "100%", 0: "0" }, flex: { 1: "1 1 0%", auto: "1 1 auto", initial: "0 1 auto", none: "none" }, flexBasis: ({ theme: e }) => ({ ...e("spacing"), ...Yt(2, 6), ...Yt(12, 12), auto: "auto", full: "100%" }), flexGrow: { DEFAULT: 1, 0: 0 }, flexShrink: { DEFAULT: 1, 0: 0 }, fontFamily: { sans: 'ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'.split(","), serif: 'ui-serif,Georgia,Cambria,"Times New Roman",Times,serif'.split(","), mono: 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace'.split(",") }, fontSize: { xs: ["0.75rem", "1rem"], sm: ["0.875rem", "1.25rem"], base: ["1rem", "1.5rem"], lg: ["1.125rem", "1.75rem"], xl: ["1.25rem", "1.75rem"], "2xl": ["1.5rem", "2rem"], "3xl": ["1.875rem", "2.25rem"], "4xl": ["2.25rem", "2.5rem"], "5xl": ["3rem", "1"], "6xl": ["3.75rem", "1"], "7xl": ["4.5rem", "1"], "8xl": ["6rem", "1"], "9xl": ["8rem", "1"] }, fontWeight: { thin: "100", extralight: "200", light: "300", normal: "400", medium: "500", semibold: "600", bold: "700", extrabold: "800", black: "900" }, gap: /* @__PURE__ */ X("spacing"), gradientColorStops: /* @__PURE__ */ X("colors"), gridAutoColumns: { auto: "auto", min: "min-content", max: "max-content", fr: "minmax(0,1fr)" }, gridAutoRows: { auto: "auto", min: "min-content", max: "max-content", fr: "minmax(0,1fr)" }, gridColumn: { auto: "auto", "span-full": "1 / -1" }, gridRow: { auto: "auto", "span-full": "1 / -1" }, gridTemplateColumns: { none: "none" }, gridTemplateRows: { none: "none" }, height: ({ theme: e }) => ({ ...e("spacing"), ...Yt(2, 6), min: "min-content", max: "max-content", fit: "fit-content", auto: "auto", full: "100%", screen: "100vh" }), inset: ({ theme: e }) => ({ ...e("spacing"), ...Yt(2, 4), auto: "auto", full: "100%" }), keyframes: { spin: { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } }, ping: { "0%": { transform: "scale(1)", opacity: "1" }, "75%,100%": { transform: "scale(2)", opacity: "0" } }, pulse: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".5" } }, bounce: { "0%, 100%": { transform: "translateY(-25%)", animationTimingFunction: "cubic-bezier(0.8,0,1,1)" }, "50%": { transform: "none", animationTimingFunction: "cubic-bezier(0,0,0.2,1)" } } }, letterSpacing: { tighter: "-0.05em", tight: "-0.025em", normal: "0em", wide: "0.025em", wider: "0.05em", widest: "0.1em" }, lineHeight: { .../* @__PURE__ */ ke(10, "rem", 4, 3), none: "1", tight: "1.25", snug: "1.375", normal: "1.5", relaxed: "1.625", loose: "2" }, margin: ({ theme: e }) => ({ auto: "auto", ...e("spacing") }), maxHeight: ({ theme: e }) => ({ full: "100%", min: "min-content", max: "max-content", fit: "fit-content", screen: "100vh", ...e("spacing") }), maxWidth: ({ theme: e, breakpoints: t }) => ({ ...t(e("screens")), none: "none", 0: "0rem", xs: "20rem", sm: "24rem", md: "28rem", lg: "32rem", xl: "36rem", "2xl": "42rem", "3xl": "48rem", "4xl": "56rem", "5xl": "64rem", "6xl": "72rem", "7xl": "80rem", full: "100%", min: "min-content", max: "max-content", fit: "fit-content", prose: "65ch" }), minHeight: { 0: "0px", full: "100%", min: "min-content", max: "max-content", fit: "fit-content", screen: "100vh" }, minWidth: { 0: "0px", full: "100%", min: "min-content", max: "max-content", fit: "fit-content" }, opacity: { .../* @__PURE__ */ ke(100, "", 100, 0, 10), 5: "0.05", 25: "0.25", 75: "0.75", 95: "0.95" }, order: { first: "-9999", last: "9999", none: "0" }, padding: /* @__PURE__ */ X("spacing"), placeholderColor: /* @__PURE__ */ X("colors"), placeholderOpacity: /* @__PURE__ */ X("opacity"), outlineColor: /* @__PURE__ */ X("colors"), outlineOffset: /* @__PURE__ */ Te(8, "px"), outlineWidth: /* @__PURE__ */ Te(8, "px"), ringColor: ({ theme: e }) => ({ ...e("colors"), DEFAULT: "#3b82f6" }), ringOffsetColor: /* @__PURE__ */ X("colors"), ringOffsetWidth: /* @__PURE__ */ Te(8, "px"), ringOpacity: ({ theme: e }) => ({ ...e("opacity"), DEFAULT: "0.5" }), ringWidth: { DEFAULT: "3px", .../* @__PURE__ */ Te(8, "px") }, rotate: { .../* @__PURE__ */ Te(2, "deg"), .../* @__PURE__ */ Te(12, "deg", 3), .../* @__PURE__ */ Te(180, "deg", 45) }, saturate: /* @__PURE__ */ ke(200, "", 100, 0, 50), scale: { .../* @__PURE__ */ ke(150, "", 100, 0, 50), .../* @__PURE__ */ ke(110, "", 100, 90, 5), 75: "0.75", 125: "1.25" }, scrollMargin: /* @__PURE__ */ X("spacing"), scrollPadding: /* @__PURE__ */ X("spacing"), sepia: { 0: "0", DEFAULT: "100%" }, skew: { .../* @__PURE__ */ Te(2, "deg"), .../* @__PURE__ */ Te(12, "deg", 3) }, space: /* @__PURE__ */ X("spacing"), stroke: ({ theme: e }) => ({ ...e("colors"), none: "none" }), strokeWidth: /* @__PURE__ */ ke(2), textColor: /* @__PURE__ */ X("colors"), textDecorationColor: /* @__PURE__ */ X("colors"), textDecorationThickness: { "from-font": "from-font", auto: "auto", .../* @__PURE__ */ Te(8, "px") }, textUnderlineOffset: { auto: "auto", .../* @__PURE__ */ Te(8, "px") }, textIndent: /* @__PURE__ */ X("spacing"), textOpacity: /* @__PURE__ */ X("opacity"), transitionDuration: ({ theme: e }) => ({ ...e("durations"), DEFAULT: "150ms" }), transitionDelay: /* @__PURE__ */ X("durations"), transitionProperty: { none: "none", all: "all", DEFAULT: "color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter", colors: "color,background-color,border-color,text-decoration-color,fill,stroke", opacity: "opacity", shadow: "box-shadow", transform: "transform" }, transitionTimingFunction: { DEFAULT: "cubic-bezier(0.4,0,0.2,1)", linear: "linear", in: "cubic-bezier(0.4,0,1,1)", out: "cubic-bezier(0,0,0.2,1)", "in-out": "cubic-bezier(0.4,0,0.2,1)" }, translate: ({ theme: e }) => ({ ...e("spacing"), ...Yt(2, 4), full: "100%" }), width: ({ theme: e }) => ({ min: "min-content", max: "max-content", fit: "fit-content", screen: "100vw", ...e("flexBasis") }), willChange: { scroll: "scroll-position" }, zIndex: { .../* @__PURE__ */ ke(50, "", 1, 0, 10), auto: "auto" } };
function Yt(e, t) {
  let n = {};
  do
    for (var r = 1; r < e; r++) n[`${r}/${e}`] = Number((r / e * 100).toFixed(6)) + "%";
  while (++e <= t);
  return n;
}
function Te(e, t, n = 0) {
  let r = {};
  for (; n <= e; n = 2 * n || 1) r[n] = n + t;
  return r;
}
function ke(e, t = "", n = 1, r = 0, o = 1, i = {}) {
  for (; r <= e; r += o) i[r] = r / n + t;
  return i;
}
function X(e) {
  return ({ theme: t }) => t(e);
}
let I4 = { "*,::before,::after": { boxSizing: "border-box", borderWidth: "0", borderStyle: "solid", borderColor: "theme(borderColor.DEFAULT, currentColor)" }, "::before,::after": { "--tw-content": "''" }, html: { lineHeight: 1.5, WebkitTextSizeAdjust: "100%", MozTabSize: "4", tabSize: 4, fontFamily: `theme(fontFamily.sans, ${Mo.fontFamily.sans})`, fontFeatureSettings: "theme(fontFamily.sans[1].fontFeatureSettings, normal)" }, body: { margin: "0", lineHeight: "inherit" }, hr: { height: "0", color: "inherit", borderTopWidth: "1px" }, "abbr:where([title])": { textDecoration: "underline dotted" }, "h1,h2,h3,h4,h5,h6": { fontSize: "inherit", fontWeight: "inherit" }, a: { color: "inherit", textDecoration: "inherit" }, "b,strong": { fontWeight: "bolder" }, "code,kbd,samp,pre": { fontFamily: `theme(fontFamily.mono, ${Mo.fontFamily.mono})`, fontFeatureSettings: "theme(fontFamily.mono[1].fontFeatureSettings, normal)", fontSize: "1em" }, small: { fontSize: "80%" }, "sub,sup": { fontSize: "75%", lineHeight: 0, position: "relative", verticalAlign: "baseline" }, sub: { bottom: "-0.25em" }, sup: { top: "-0.5em" }, table: { textIndent: "0", borderColor: "inherit", borderCollapse: "collapse" }, "button,input,optgroup,select,textarea": { fontFamily: "inherit", fontSize: "100%", lineHeight: "inherit", color: "inherit", margin: "0", padding: "0" }, "button,select": { textTransform: "none" }, "button,[type='button'],[type='reset'],[type='submit']": { WebkitAppearance: "button", backgroundColor: "transparent", backgroundImage: "none" }, ":-moz-focusring": { outline: "auto" }, ":-moz-ui-invalid": { boxShadow: "none" }, progress: { verticalAlign: "baseline" }, "::-webkit-inner-spin-button,::-webkit-outer-spin-button": { height: "auto" }, "[type='search']": { WebkitAppearance: "textfield", outlineOffset: "-2px" }, "::-webkit-search-decoration": { WebkitAppearance: "none" }, "::-webkit-file-upload-button": { WebkitAppearance: "button", font: "inherit" }, summary: { display: "list-item" }, "blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre": { margin: "0" }, fieldset: { margin: "0", padding: "0" }, legend: { padding: "0" }, "ol,ul,menu": { listStyle: "none", margin: "0", padding: "0" }, textarea: { resize: "vertical" }, "input::placeholder,textarea::placeholder": { opacity: 1, color: "theme(colors.gray.400, #9ca3af)" }, 'button,[role="button"]': { cursor: "pointer" }, ":disabled": { cursor: "default" }, "img,svg,video,canvas,audio,iframe,embed,object": { display: "block", verticalAlign: "middle" }, "img,video": { maxWidth: "100%", height: "auto" }, "[hidden]": { display: "none" } }, O4 = [Z("\\[([-\\w]+):(.+)]", ({ 1: e, 2: t }, n) => ({ "@layer overrides": { "&": { [e]: st(`[${t}]`, "", n) } } })), Z("(group|peer)([~/][^-[]+)?", ({ input: e }, { h: t }) => [{ c: t(e) }]), W("aspect-", "aspectRatio"), Z("container", (e, { theme: t }) => {
  let { screens: n = t("screens"), center: r, padding: o } = t("container"), i = { width: "100%", marginRight: r && "auto", marginLeft: r && "auto", ...s("xs") };
  for (let c in n) {
    let a = n[c];
    typeof a == "string" && (i[Ti(a)] = { "&": { maxWidth: a, ...s(c) } });
  }
  return i;
  function s(c) {
    let a = o && (typeof o == "string" ? o : o[c] || o.DEFAULT);
    if (a) return { paddingRight: a, paddingLeft: a };
  }
}), W("content-", "content", ({ _: e }) => ({ "--tw-content": e, content: "var(--tw-content)" })), Z("(?:box-)?decoration-(slice|clone)", "boxDecorationBreak"), Z("box-(border|content)", "boxSizing", ({ 1: e }) => e + "-box"), Z("hidden", { display: "none" }), Z("table-(auto|fixed)", "tableLayout"), Z(["(block|flex|table|grid|inline|contents|flow-root|list-item)", "(inline-(block|flex|table|grid))", "(table-(caption|cell|column|row|(column|row|footer|header)-group))"], "display"), "(float)-(left|right|none)", "(clear)-(left|right|none|both)", "(overflow(?:-[xy])?)-(auto|hidden|clip|visible|scroll)", "(isolation)-(auto)", Z("isolate", "isolation"), Z("object-(contain|cover|fill|none|scale-down)", "objectFit"), W("object-", "objectPosition"), Z("object-(top|bottom|center|(left|right)(-(top|bottom))?)", "objectPosition", _n), Z("overscroll(-[xy])?-(auto|contain|none)", ({ 1: e = "", 2: t }) => ({ ["overscroll-behavior" + e]: t })), Z("(static|fixed|absolute|relative|sticky)", "position"), W("-?inset(-[xy])?(?:$|-)", "inset", ({ 1: e, _: t }) => ({ top: e != "-x" && t, right: e != "-y" && t, bottom: e != "-x" && t, left: e != "-y" && t })), W("-?(top|bottom|left|right)(?:$|-)", "inset"), Z("(visible|collapse)", "visibility"), Z("invisible", { visibility: "hidden" }), W("-?z-", "zIndex"), Z("flex-((row|col)(-reverse)?)", "flexDirection", Js), Z("flex-(wrap|wrap-reverse|nowrap)", "flexWrap"), W("(flex-(?:grow|shrink))(?:$|-)"), W("(flex)-"), W("grow(?:$|-)", "flexGrow"), W("shrink(?:$|-)", "flexShrink"), W("basis-", "flexBasis"), W("-?(order)-"), "-?(order)-(\\d+)", W("grid-cols-", "gridTemplateColumns"), Z("grid-cols-(\\d+)", "gridTemplateColumns", ta), W("col-", "gridColumn"), Z("col-(span)-(\\d+)", "gridColumn", ea), W("col-start-", "gridColumnStart"), Z("col-start-(auto|\\d+)", "gridColumnStart"), W("col-end-", "gridColumnEnd"), Z("col-end-(auto|\\d+)", "gridColumnEnd"), W("grid-rows-", "gridTemplateRows"), Z("grid-rows-(\\d+)", "gridTemplateRows", ta), W("row-", "gridRow"), Z("row-(span)-(\\d+)", "gridRow", ea), W("row-start-", "gridRowStart"), Z("row-start-(auto|\\d+)", "gridRowStart"), W("row-end-", "gridRowEnd"), Z("row-end-(auto|\\d+)", "gridRowEnd"), Z("grid-flow-((row|col)(-dense)?)", "gridAutoFlow", (e) => _n(Js(e))), Z("grid-flow-(dense)", "gridAutoFlow"), W("auto-cols-", "gridAutoColumns"), W("auto-rows-", "gridAutoRows"), W("gap-x(?:$|-)", "gap", "columnGap"), W("gap-y(?:$|-)", "gap", "rowGap"), W("gap(?:$|-)", "gap"), "(justify-(?:items|self))-", Z("justify-", "justifyContent", Ys), Z("(content|items|self)-", (e) => ({ ["align-" + e[1]]: Ys(e) })), Z("(place-(content|items|self))-", ({ 1: e, $$: t }) => ({ [e]: ("wun".includes(t[3]) ? "space-" : "") + t })), W("p([xytrbl])?(?:$|-)", "padding", Mt("padding")), W("-?m([xytrbl])?(?:$|-)", "margin", Mt("margin")), W("-?space-(x|y)(?:$|-)", "space", ({ 1: e, _: t }) => ({ "&>:not([hidden])~:not([hidden])": { [`--tw-space-${e}-reverse`]: "0", ["margin-" + { y: "top", x: "left" }[e]]: `calc(${t} * calc(1 - var(--tw-space-${e}-reverse)))`, ["margin-" + { y: "bottom", x: "right" }[e]]: `calc(${t} * var(--tw-space-${e}-reverse))` } })), Z("space-(x|y)-reverse", ({ 1: e }) => ({ "&>:not([hidden])~:not([hidden])": { [`--tw-space-${e}-reverse`]: "1" } })), W("w-", "width"), W("min-w-", "minWidth"), W("max-w-", "maxWidth"), W("h-", "height"), W("min-h-", "minHeight"), W("max-h-", "maxHeight"), W("font-", "fontWeight"), W("font-", "fontFamily", ({ _: e }) => typeof (e = se(e))[1] == "string" ? { fontFamily: Re(e) } : { fontFamily: Re(e[0]), ...e[1] }), Z("antialiased", { WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }), Z("subpixel-antialiased", { WebkitFontSmoothing: "auto", MozOsxFontSmoothing: "auto" }), Z("italic", "fontStyle"), Z("not-italic", { fontStyle: "normal" }), Z("(ordinal|slashed-zero|(normal|lining|oldstyle|proportional|tabular)-nums|(diagonal|stacked)-fractions)", ({ 1: e, 2: t = "", 3: n }) => t == "normal" ? { fontVariantNumeric: "normal" } : { ["--tw-" + (n ? "numeric-fraction" : "pt".includes(t[0]) ? "numeric-spacing" : t ? "numeric-figure" : e)]: e, fontVariantNumeric: "var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction)", ...nt({ "--tw-ordinal": "var(--tw-empty,/*!*/ /*!*/)", "--tw-slashed-zero": "var(--tw-empty,/*!*/ /*!*/)", "--tw-numeric-figure": "var(--tw-empty,/*!*/ /*!*/)", "--tw-numeric-spacing": "var(--tw-empty,/*!*/ /*!*/)", "--tw-numeric-fraction": "var(--tw-empty,/*!*/ /*!*/)" }) }), W("tracking-", "letterSpacing"), W("leading-", "lineHeight"), Z("list-(inside|outside)", "listStylePosition"), W("list-", "listStyleType"), Z("list-", "listStyleType"), W("placeholder-opacity-", "placeholderOpacity", ({ _: e }) => ({ "&::placeholder": { "--tw-placeholder-opacity": e } })), he("placeholder-", { property: "color", selector: "&::placeholder" }), Z("text-(left|center|right|justify|start|end)", "textAlign"), Z("text-(ellipsis|clip)", "textOverflow"), W("text-opacity-", "textOpacity", "--tw-text-opacity"), he("text-", { property: "color" }), W("text-", "fontSize", ({ _: e }) => typeof e == "string" ? { fontSize: e } : { fontSize: e[0], ...typeof e[1] == "string" ? { lineHeight: e[1] } : e[1] }), W("indent-", "textIndent"), Z("(overline|underline|line-through)", "textDecorationLine"), Z("no-underline", { textDecorationLine: "none" }), W("underline-offset-", "textUnderlineOffset"), he("decoration-", { section: "textDecorationColor", opacityVariable: !1, opacitySection: "opacity" }), W("decoration-", "textDecorationThickness"), Z("decoration-", "textDecorationStyle"), Z("(uppercase|lowercase|capitalize)", "textTransform"), Z("normal-case", { textTransform: "none" }), Z("truncate", { overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }), Z("align-", "verticalAlign"), Z("whitespace-", "whiteSpace"), Z("break-normal", { wordBreak: "normal", overflowWrap: "normal" }), Z("break-words", { overflowWrap: "break-word" }), Z("break-all", { wordBreak: "break-all" }), Z("break-keep", { wordBreak: "keep-all" }), he("caret-", { opacityVariable: !1, opacitySection: "opacity" }), he("accent-", { opacityVariable: !1, opacitySection: "opacity" }), Z("bg-gradient-to-([trbl]|[tb][rl])", "backgroundImage", ({ 1: e }) => `linear-gradient(to ${mt(e, " ")},var(--tw-gradient-stops))`), he("from-", { section: "gradientColorStops", opacityVariable: !1, opacitySection: "opacity" }, ({ _: e }) => ({ "--tw-gradient-from": e.value, "--tw-gradient-to": e.color({ opacityValue: "0" }), "--tw-gradient-stops": "var(--tw-gradient-from),var(--tw-gradient-to)" })), he("via-", { section: "gradientColorStops", opacityVariable: !1, opacitySection: "opacity" }, ({ _: e }) => ({ "--tw-gradient-to": e.color({ opacityValue: "0" }), "--tw-gradient-stops": `var(--tw-gradient-from),${e.value},var(--tw-gradient-to)` })), he("to-", { section: "gradientColorStops", property: "--tw-gradient-to", opacityVariable: !1, opacitySection: "opacity" }), Z("bg-(fixed|local|scroll)", "backgroundAttachment"), Z("bg-origin-(border|padding|content)", "backgroundOrigin", ({ 1: e }) => e + "-box"), Z(["bg-(no-repeat|repeat(-[xy])?)", "bg-repeat-(round|space)"], "backgroundRepeat"), Z("bg-blend-", "backgroundBlendMode"), Z("bg-clip-(border|padding|content|text)", "backgroundClip", ({ 1: e }) => e + (e == "text" ? "" : "-box")), W("bg-opacity-", "backgroundOpacity", "--tw-bg-opacity"), he("bg-", { section: "backgroundColor" }), W("bg-", "backgroundImage"), W("bg-", "backgroundPosition"), Z("bg-(top|bottom|center|(left|right)(-(top|bottom))?)", "backgroundPosition", _n), W("bg-", "backgroundSize"), W("rounded(?:$|-)", "borderRadius"), W("rounded-([trbl]|[tb][rl])(?:$|-)", "borderRadius", ({ 1: e, _: t }) => {
  let n = { t: ["tl", "tr"], r: ["tr", "br"], b: ["bl", "br"], l: ["bl", "tl"] }[e] || [e, e];
  return { [`border-${mt(n[0])}-radius`]: t, [`border-${mt(n[1])}-radius`]: t };
}), Z("border-(collapse|separate)", "borderCollapse"), W("border-opacity(?:$|-)", "borderOpacity", "--tw-border-opacity"), Z("border-(solid|dashed|dotted|double|none)", "borderStyle"), W("border-spacing(-[xy])?(?:$|-)", "borderSpacing", ({ 1: e, _: t }) => ({ ...nt({ "--tw-border-spacing-x": "0", "--tw-border-spacing-y": "0" }), ["--tw-border-spacing" + (e || "-x")]: t, ["--tw-border-spacing" + (e || "-y")]: t, "border-spacing": "var(--tw-border-spacing-x) var(--tw-border-spacing-y)" })), he("border-([xytrbl])-", { section: "borderColor" }, Mt("border", "Color")), he("border-"), W("border-([xytrbl])(?:$|-)", "borderWidth", Mt("border", "Width")), W("border(?:$|-)", "borderWidth"), W("divide-opacity(?:$|-)", "divideOpacity", ({ _: e }) => ({ "&>:not([hidden])~:not([hidden])": { "--tw-divide-opacity": e } })), Z("divide-(solid|dashed|dotted|double|none)", ({ 1: e }) => ({ "&>:not([hidden])~:not([hidden])": { borderStyle: e } })), Z("divide-([xy]-reverse)", ({ 1: e }) => ({ "&>:not([hidden])~:not([hidden])": { ["--tw-divide-" + e]: "1" } })), W("divide-([xy])(?:$|-)", "divideWidth", ({ 1: e, _: t }) => {
  let n = { x: "lr", y: "tb" }[e];
  return { "&>:not([hidden])~:not([hidden])": { [`--tw-divide-${e}-reverse`]: "0", [`border-${mt(n[0])}Width`]: `calc(${t} * calc(1 - var(--tw-divide-${e}-reverse)))`, [`border-${mt(n[1])}Width`]: `calc(${t} * var(--tw-divide-${e}-reverse))` } };
}), he("divide-", { property: "borderColor", selector: "&>:not([hidden])~:not([hidden])" }), W("ring-opacity(?:$|-)", "ringOpacity", "--tw-ring-opacity"), he("ring-offset-", { property: "--tw-ring-offset-color", opacityVariable: !1 }), W("ring-offset(?:$|-)", "ringOffsetWidth", "--tw-ring-offset-width"), Z("ring-inset", { "--tw-ring-inset": "inset" }), he("ring-", { property: "--tw-ring-color" }), W("ring(?:$|-)", "ringWidth", ({ _: e }, { theme: t }) => ({ ...nt({ "--tw-ring-offset-shadow": "0 0 #0000", "--tw-ring-shadow": "0 0 #0000", "--tw-shadow": "0 0 #0000", "--tw-shadow-colored": "0 0 #0000", "&": { "--tw-ring-inset": "var(--tw-empty,/*!*/ /*!*/)", "--tw-ring-offset-width": t("ringOffsetWidth", "", "0px"), "--tw-ring-offset-color": it(t("ringOffsetColor", "", "#fff")), "--tw-ring-color": it(t("ringColor", "", "#93c5fd"), { opacityVariable: "--tw-ring-opacity" }), "--tw-ring-opacity": t("ringOpacity", "", "0.5") } }), "--tw-ring-offset-shadow": "var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)", "--tw-ring-shadow": `var(--tw-ring-inset) 0 0 0 calc(${e} + var(--tw-ring-offset-width)) var(--tw-ring-color)`, boxShadow: "var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)" })), he("shadow-", { section: "boxShadowColor", opacityVariable: !1, opacitySection: "opacity" }, ({ _: e }) => ({ "--tw-shadow-color": e.value, "--tw-shadow": "var(--tw-shadow-colored)" })), W("shadow(?:$|-)", "boxShadow", ({ _: e }) => ({ ...nt({ "--tw-ring-offset-shadow": "0 0 #0000", "--tw-ring-shadow": "0 0 #0000", "--tw-shadow": "0 0 #0000", "--tw-shadow-colored": "0 0 #0000" }), "--tw-shadow": Re(e), "--tw-shadow-colored": Re(e).replace(/([^,]\s+)(?:#[a-f\d]+|(?:(?:hsl|rgb)a?|hwb|lab|lch|color|var)\(.+?\)|[a-z]+)(,|$)/g, "$1var(--tw-shadow-color)$2"), boxShadow: "var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)" })), W("(opacity)-"), Z("mix-blend-", "mixBlendMode"), ...Xs(), ...Xs("backdrop-"), W("transition(?:$|-)", "transitionProperty", (e, { theme: t }) => ({ transitionProperty: Re(e), transitionTimingFunction: e._ == "none" ? void 0 : Re(t("transitionTimingFunction", "")), transitionDuration: e._ == "none" ? void 0 : Re(t("transitionDuration", "")) })), W("duration(?:$|-)", "transitionDuration", "transitionDuration", Re), W("ease(?:$|-)", "transitionTimingFunction", "transitionTimingFunction", Re), W("delay(?:$|-)", "transitionDelay", "transitionDelay", Re), W("animate(?:$|-)", "animation", (e, { theme: t, h: n, e: r }) => {
  let o = Re(e), i = o.split(" "), s = t("keyframes", i[0]);
  return s ? { ["@keyframes " + (i[0] = r(n(i[0])))]: s, animation: i.join(" ") } : { animation: o };
}), "(transform)-(none)", Z("transform", Ro), Z("transform-(cpu|gpu)", ({ 1: e }) => ({ "--tw-transform": m2(e == "gpu") })), W("scale(-[xy])?-", "scale", ({ 1: e, _: t }) => ({ ["--tw-scale" + (e || "-x")]: t, ["--tw-scale" + (e || "-y")]: t, ...Ro() })), W("-?(rotate)-", "rotate", jr), W("-?(translate-[xy])-", "translate", jr), W("-?(skew-[xy])-", "skew", jr), Z("origin-(center|((top|bottom)(-(left|right))?)|left|right)", "transformOrigin", _n), "(appearance)-", W("(columns)-"), "(columns)-(\\d+)", "(break-(?:before|after|inside))-", W("(cursor)-"), "(cursor)-", Z("snap-(none)", "scroll-snap-type"), Z("snap-(x|y|both)", ({ 1: e }) => ({ ...nt({ "--tw-scroll-snap-strictness": "proximity" }), "scroll-snap-type": e + " var(--tw-scroll-snap-strictness)" })), Z("snap-(mandatory|proximity)", "--tw-scroll-snap-strictness"), Z("snap-(?:(start|end|center)|align-(none))", "scroll-snap-align"), Z("snap-(normal|always)", "scroll-snap-stop"), Z("scroll-(auto|smooth)", "scroll-behavior"), W("scroll-p([xytrbl])?(?:$|-)", "padding", Mt("scroll-padding")), W("-?scroll-m([xytrbl])?(?:$|-)", "scroll-margin", Mt("scroll-margin")), Z("touch-(auto|none|manipulation)", "touch-action"), Z("touch-(pinch-zoom|pan-(?:(x|left|right)|(y|up|down)))", ({ 1: e, 2: t, 3: n }) => ({ ...nt({ "--tw-pan-x": "var(--tw-empty,/*!*/ /*!*/)", "--tw-pan-y": "var(--tw-empty,/*!*/ /*!*/)", "--tw-pinch-zoom": "var(--tw-empty,/*!*/ /*!*/)", "--tw-touch-action": "var(--tw-pan-x) var(--tw-pan-y) var(--tw-pinch-zoom)" }), [`--tw-${t ? "pan-x" : n ? "pan-y" : e}`]: e, "touch-action": "var(--tw-touch-action)" })), Z("outline-none", { outline: "2px solid transparent", "outline-offset": "2px" }), Z("outline", { outlineStyle: "solid" }), Z("outline-(dashed|dotted|double)", "outlineStyle"), W("-?(outline-offset)-"), he("outline-", { opacityVariable: !1, opacitySection: "opacity" }), W("outline-", "outlineWidth"), "(pointer-events)-", W("(will-change)-"), "(will-change)-", ["resize(?:-(none|x|y))?", "resize", ({ 1: e }) => ({ x: "horizontal", y: "vertical" })[e] || e || "both"], Z("select-(none|text|all|auto)", "userSelect"), he("fill-", { section: "fill", opacityVariable: !1, opacitySection: "opacity" }), he("stroke-", { section: "stroke", opacityVariable: !1, opacitySection: "opacity" }), W("stroke-", "strokeWidth"), Z("sr-only", { position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", whiteSpace: "nowrap", clip: "rect(0,0,0,0)", borderWidth: "0" }), Z("not-sr-only", { position: "static", width: "auto", height: "auto", padding: "0", margin: "0", overflow: "visible", whiteSpace: "normal", clip: "auto" })];
function _n(e) {
  return (typeof e == "string" ? e : e[1]).replace(/-/g, " ").trim();
}
function Js(e) {
  return (typeof e == "string" ? e : e[1]).replace("col", "column");
}
function mt(e, t = "-") {
  let n = [];
  for (let r of e) n.push({ t: "top", r: "right", b: "bottom", l: "left" }[r]);
  return n.join(t);
}
function Re(e) {
  return e && "" + (e._ || e);
}
function Ys({ $$: e }) {
  return ({ r: "flex-", "": "flex-", w: "space-", u: "space-", n: "space-" }[e[3] || ""] || "") + e;
}
function Mt(e, t = "") {
  return ({ 1: n, _: r }) => {
    let o = { x: "lr", y: "tb" }[n] || n + n;
    return o ? { ...Dn(e + "-" + mt(o[0]) + t, r), ...Dn(e + "-" + mt(o[1]) + t, r) } : Dn(e + t, r);
  };
}
function Xs(e = "") {
  let t = ["blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", e && "opacity", "saturate", "sepia", !e && "drop-shadow"].filter(Boolean), n = {};
  for (let r of t) n[`--tw-${e}${r}`] = "var(--tw-empty,/*!*/ /*!*/)";
  return n = { ...nt(n), [`${e}filter`]: t.map((r) => `var(--tw-${e}${r})`).join(" ") }, [`(${e}filter)-(none)`, Z(`${e}filter`, n), ...t.map((r) => W(`${r[0] == "h" ? "-?" : ""}(${e}${r})(?:$|-)`, r, ({ 1: o, _: i }) => ({ [`--tw-${o}`]: se(i).map((s) => `${r}(${s})`).join(" "), ...n })))];
}
function jr({ 1: e, _: t }) {
  return { ["--tw-" + e]: t, ...Ro() };
}
function Ro() {
  return { ...nt({ "--tw-translate-x": "0", "--tw-translate-y": "0", "--tw-rotate": "0", "--tw-skew-x": "0", "--tw-skew-y": "0", "--tw-scale-x": "1", "--tw-scale-y": "1", "--tw-transform": m2() }), transform: "var(--tw-transform)" };
}
function m2(e) {
  return [e ? "translate3d(var(--tw-translate-x),var(--tw-translate-y),0)" : "translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y))", "rotate(var(--tw-rotate))", "skewX(var(--tw-skew-x))", "skewY(var(--tw-skew-y))", "scaleX(var(--tw-scale-x))", "scaleY(var(--tw-scale-y))"].join(" ");
}
function ea({ 1: e, 2: t }) {
  return `${e} ${t} / ${e} ${t}`;
}
function ta({ 1: e }) {
  return `repeat(${e},minmax(0,1fr))`;
}
function nt(e) {
  return { "@layer defaults": { "*,::before,::after": e, "::backdrop": e } };
}
let P4 = [["sticky", "@supports ((position: -webkit-sticky) or (position:sticky))"], ["motion-reduce", "@media (prefers-reduced-motion:reduce)"], ["motion-safe", "@media (prefers-reduced-motion:no-preference)"], ["print", "@media print"], ["(portrait|landscape)", ({ 1: e }) => `@media (orientation:${e})`], ["contrast-(more|less)", ({ 1: e }) => `@media (prefers-contrast:${e})`], ["(first-(letter|line)|placeholder|backdrop|before|after)", ({ 1: e }) => `&::${e}`], ["(marker|selection)", ({ 1: e }) => `& *::${e},&::${e}`], ["file", "&::file-selector-button"], ["(first|last|only)", ({ 1: e }) => `&:${e}-child`], ["even", "&:nth-child(2n)"], ["odd", "&:nth-child(odd)"], ["open", "&[open]"], ["(aria|data)-", ({ 1: e, $$: t }, n) => t && `&[${e}-${n.theme(e, t) || st(t, "", n) || `${t}="true"`}]`], ["((group|peer)(~[^-[]+)?)(-\\[(.+)]|[-[].+?)(\\/.+)?", ({ 2: e, 3: t = "", 4: n, 5: r = "", 6: o = t }, { e: i, h: s, v: c }) => {
  let a = wn(r) || (n[0] == "[" ? n : c(n.slice(1)));
  return `${(a.includes("&") ? a : "&" + a).replace(/&/g, `:merge(.${i(s(e + o))})`)}${e[0] == "p" ? "~" : " "}&`;
}], ["(ltr|rtl)", ({ 1: e }) => `[dir="${e}"] &`], ["supports-", ({ $$: e }, t) => {
  if (e && (e = t.theme("supports", e) || st(e, "", t)), e) return e.includes(":") || (e += ":var(--tw)"), /^\w*\s*\(/.test(e) || (e = `(${e})`), `@supports ${e.replace(/\b(and|or|not)\b/g, " $1 ").trim()}`;
}], ["max-", ({ $$: e }, t) => {
  if (e && (e = t.theme("screens", e) || st(e, "", t)), typeof e == "string") return `@media not all and (min-width:${e})`;
}], ["min-", ({ $$: e }, t) => (e && (e = st(e, "", t)), e && `@media (min-width:${e})`)], [/^\[(.+)]$/, ({ 1: e }) => /[&@]/.test(e) && wn(e).replace(/[}]+$/, "").split("{")]], H4 = { __proto__: null, slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a" }, gray: { 50: "#f9fafb", 100: "#f3f4f6", 200: "#e5e7eb", 300: "#d1d5db", 400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151", 800: "#1f2937", 900: "#111827" }, zinc: { 50: "#fafafa", 100: "#f4f4f5", 200: "#e4e4e7", 300: "#d4d4d8", 400: "#a1a1aa", 500: "#71717a", 600: "#52525b", 700: "#3f3f46", 800: "#27272a", 900: "#18181b" }, neutral: { 50: "#fafafa", 100: "#f5f5f5", 200: "#e5e5e5", 300: "#d4d4d4", 400: "#a3a3a3", 500: "#737373", 600: "#525252", 700: "#404040", 800: "#262626", 900: "#171717" }, stone: { 50: "#fafaf9", 100: "#f5f5f4", 200: "#e7e5e4", 300: "#d6d3d1", 400: "#a8a29e", 500: "#78716c", 600: "#57534e", 700: "#44403c", 800: "#292524", 900: "#1c1917" }, red: { 50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5", 400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c", 800: "#991b1b", 900: "#7f1d1d" }, orange: { 50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74", 400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 800: "#9a3412", 900: "#7c2d12" }, amber: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f" }, yellow: { 50: "#fefce8", 100: "#fef9c3", 200: "#fef08a", 300: "#fde047", 400: "#facc15", 500: "#eab308", 600: "#ca8a04", 700: "#a16207", 800: "#854d0e", 900: "#713f12" }, lime: { 50: "#f7fee7", 100: "#ecfccb", 200: "#d9f99d", 300: "#bef264", 400: "#a3e635", 500: "#84cc16", 600: "#65a30d", 700: "#4d7c0f", 800: "#3f6212", 900: "#365314" }, green: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac", 400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d" }, emerald: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b" }, teal: { 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4", 400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e", 800: "#115e59", 900: "#134e4a" }, cyan: { 50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9", 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490", 800: "#155e75", 900: "#164e63" }, sky: { 50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc", 400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1", 800: "#075985", 900: "#0c4a6e" }, blue: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a" }, indigo: { 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81" }, violet: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95" }, purple: { 50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe", 400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce", 800: "#6b21a8", 900: "#581c87" }, fuchsia: { 50: "#fdf4ff", 100: "#fae8ff", 200: "#f5d0fe", 300: "#f0abfc", 400: "#e879f9", 500: "#d946ef", 600: "#c026d3", 700: "#a21caf", 800: "#86198f", 900: "#701a75" }, pink: { 50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 300: "#f9a8d4", 400: "#f472b6", 500: "#ec4899", 600: "#db2777", 700: "#be185d", 800: "#9d174d", 900: "#831843" }, rose: { 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337" } };
function Z4({ disablePreflight: e } = {}) {
  return (function({ colors: t, disablePreflight: n } = {}) {
    return { preflight: n ? void 0 : I4, theme: { ...Mo, colors: { inherit: "inherit", current: "currentColor", transparent: "transparent", black: "#000", white: "#fff", ...t } }, variants: P4, rules: O4, finalize: (r) => r.n && r.d && r.r.some((o) => /^&::(before|after)$/.test(o)) && !/(^|;)content:/.test(r.d) ? { ...r, d: "content:var(--tw-content);" + r.d } : r };
  })({ colors: H4, disablePreflight: e });
}
let W4 = typeof ShadowRoot < "u" && (typeof ShadyCSS > "u" || ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
function zr(e) {
  return e.shadowRoot || e.attachShadow({ mode: "open" });
}
const qr = { "brand-light": "var(--bc-color-brand, #196CE7)", "brand-dark": "var(--bc-color-brand-dark, var(--bc-color-brand, #3994FF))", "brand-button-text-light": "var(--bc-color-brand-button-text)", "brand-button-text-dark": "var(--bc-color-brand-button-text-dark, var(--bc-color-brand-button-text))", "brand-mixed-light": "color-mix(in srgb, var(--bc-color-brand, #196CE7) var(--bc-brand-mix, 100%), black)", "brand-mixed-dark": "color-mix(in srgb, var(--bc-color-brand-dark, var(--bc-color-brand, #3994FF)) var(--bc-brand-mix, 100%), white)", "foreground-light": "#000", "foreground-dark": "#fff", "background-light": "#fff", "background-dark": "#000", "neutral-primary-light": "#262626", "neutral-primary-dark": "#E4E4E4", "neutral-secondary-light": "#525252", "neutral-secondary-dark": "#A2A2A2", "neutral-tertiary-light": "#A2A2A2", "neutral-tertiary-dark": "#525252" }, D4 = { "glass-light": "linear-gradient(180deg, rgba(211, 211, 211, 0.20) 0%, rgba(255, 255, 255, 0.20) 50%);", "glass-dark": "linear-gradient(180deg, rgba(211, 211, 211, 0.10) 0%, rgba(0, 0, 0, 0.20) 50%)" }, re = () => globalThis.window ? (function(e, t = !0) {
  let n = (function() {
    if (W4) try {
      let a = Gr(new CSSStyleSheet());
      return a.connect = (l) => {
        let p = zr(l);
        p.adoptedStyleSheets = [...p.adoptedStyleSheets, a.target];
      }, a.disconnect = Ao, a;
    } catch {
    }
    let i = document.createElement("style");
    i.media = "not all", document.head.prepend(i);
    let s = [Gr(i)], c = /* @__PURE__ */ new WeakMap();
    return { get target() {
      return s[0].target;
    }, snapshot() {
      let a = s.map((l) => l.snapshot());
      return () => a.forEach((l) => l());
    }, clear() {
      s.forEach((a) => a.clear());
    }, destroy() {
      s.forEach((a) => a.destroy());
    }, insert(a, l, p) {
      s[0].insert(a, l, p);
      let u = this.target.cssRules[l];
      s.forEach((y, w) => w && y.target.insertRule(u.cssText, l));
    }, resume: (a, l) => s[0].resume(a, l), connect(a) {
      let l = document.createElement("style");
      zr(a).appendChild(l);
      let p = Gr(l), { cssRules: u } = this.target;
      for (let y = 0; y < u.length; y++) p.target.insertRule(u[y].cssText, y);
      s.push(p), c.set(a, p);
    }, disconnect(a) {
      let l = s.indexOf(c.get(a));
      l >= 0 && s.splice(l, 1);
    } };
  })(), r = (function(i, s) {
    let c = Ks(i), a = (function({ theme: w, darkMode: b, darkColor: C = Ao, variants: A, rules: k, hash: _, stringify: F, ignorelist: V, finalize: S }) {
      let M = /* @__PURE__ */ new Map(), R = /* @__PURE__ */ new Map(), D = /* @__PURE__ */ new Map(), $ = /* @__PURE__ */ new Map(), P = w2(V, (d, m) => m.test(d));
      A.push(["dark", Array.isArray(b) || b == "class" ? `${se(b)[1] || ".dark"} &` : typeof b == "string" && b != "media" ? b : "@media (prefers-color-scheme:dark)"]);
      let h = typeof _ == "function" ? (d) => _(d, tr) : _ ? tr : Vs;
      h !== Vs && S.push((d) => ({ ...d, n: d.n && h(d.n), d: d.d?.replace(/--(tw(?:-[\w-]+)?)\b/g, (m, g) => "--" + h(g).replace("#", "")) }));
      let f = { theme: (function({ extend: d = {}, ...m }) {
        let g = {}, v = { get colors() {
          return x("colors");
        }, theme: x, negative: () => ({}), breakpoints(L) {
          let N = {};
          for (let E in L) typeof L[E] == "string" && (N["screen-" + E] = L[E]);
          return N;
        } };
        return x;
        function x(L, N, E, B) {
          if (L) {
            if ({ 1: L, 2: B } = /^(\S+?)(?:\s*\/\s*([^/]+))?$/.exec(L) || [, L], /[.[]/.test(L)) {
              let z = [];
              L.replace(/\[([^\]]+)\]|([^.[]+)/g, (Q, le, ce = le) => z.push(ce)), L = z.shift(), E = N, N = z.join("-");
            }
            let G = g[L] || Object.assign(Object.assign(g[L] = {}, U(m, L)), U(d, L));
            if (N == null) return G;
            N || (N = "DEFAULT");
            let H = G[N] ?? N.split("-").reduce((z, Q) => z?.[Q], G) ?? E;
            return B ? it(H, { opacityValue: Ri(B, x) }) : H;
          }
          let j = {};
          for (let G of [...Object.keys(m), ...Object.keys(d)]) j[G] = x(G);
          return j;
        }
        function U(L, N) {
          let E = L[N];
          return typeof E == "function" && (E = E(v)), E && /color|fill|stroke/i.test(N) ? (function B(j, G = []) {
            let H = {};
            for (let z in j) {
              let Q = j[z], le = [...G, z];
              H[le.join("-")] = Q, z == "DEFAULT" && (le = G, H[G.join("-")] = Q), typeof Q == "object" && Object.assign(H, B(Q, le));
            }
            return H;
          })(E) : E;
        }
      })(w), e: c2, h, s: (d, m) => F(d, m, f), d: (d, m, g) => C(d, m, f, g), v: (d) => (M.has(d) || M.set(d, Qs(d, A, R, N4, f) || "&:" + d), M.get(d)), r(d, m) {
        let g = JSON.stringify([d, m]);
        return D.has(g) || D.set(g, !P(d, f) && Qs(d, k, $, B4, f, m)), D.get(g);
      }, f: (d) => S.reduce((m, g) => g(m, f), d) };
      return f;
    })(c), l = /* @__PURE__ */ new Map(), p = [], u = /* @__PURE__ */ new Set();
    function y(w) {
      let b = a.f(w), C = So(b);
      if (C && !u.has(C)) {
        u.add(C);
        let A = u2(p, w);
        s.insert(C, A, w), p.splice(A, 0, w);
      }
      return b.n;
    }
    return s.resume((w) => l.set(w, w), (w, b) => {
      s.insert(w, p.length, b), p.push(b), u.add(w);
    }), Object.defineProperties(function(w) {
      if (!l.size) for (let C of se(c.preflight)) typeof C == "function" && (C = C(a)), C && (typeof C == "string" ? $i("", ye.b, rr(C), a, ye.b, [], !1, !0) : f2(C, {}, a, ye.b)).forEach(y);
      let b = l.get(w = "" + w);
      if (!b) {
        let C = /* @__PURE__ */ new Set();
        for (let A of nr(rr(w), a)) C.add(A.c).add(y(A));
        b = [...C].filter(Boolean).join(" "), l.set(w, b).set(b, b);
      }
      return b;
    }, Object.getOwnPropertyDescriptors({ get target() {
      return s.target;
    }, theme: a.theme, config: c, snapshot() {
      let w = s.snapshot(), b = new Set(u), C = new Map(l), A = [...p];
      return () => {
        w(), u = b, l = C, p = A;
      };
    }, clear() {
      s.clear(), u = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map(), p = [];
    }, destroy() {
      this.clear(), s.destroy();
    } }));
  })({ ...e, hash: e.hash ?? t }, n), o = (function(i) {
    let s = new MutationObserver(c);
    return { observe(l) {
      s.observe(l, { attributeFilter: ["class"], subtree: !0, childList: !0 }), a(l), c([{ target: l, type: "" }]);
    }, disconnect() {
      s.disconnect();
    } };
    function c(l) {
      for (let { type: p, target: u } of l) if (p[0] == "a") a(u);
      else for (let y of u.querySelectorAll("[class]")) a(y);
      s.takeRecords();
    }
    function a(l) {
      let p, u = l.getAttribute?.("class");
      u && (function(y, w) {
        return y != w && "" + y.split(" ").sort() != "" + w.split(" ").sort();
      })(u, p = i(u)) && l.setAttribute("class", p);
    }
  })(r);
  return function(i) {
    return class extends i {
      connectedCallback() {
        super.connectedCallback?.(), n.connect(this), o.observe(zr(this));
      }
      disconnectedCallback() {
        n.disconnect(this), super.disconnectedCallback?.();
      }
      constructor(...s) {
        super(...s), this.tw = r;
      }
    };
  };
})(Ks({ darkMode: globalThis.bcDarkMode, theme: { fontFamily: { sans: ["Inter", "sans-serif"], mono: ["Roboto Mono", "monospace"] }, extend: { borderColor: Pe({}, qr), backgroundColor: Pe({}, qr), textColor: Pe({}, qr), backgroundImage: Pe({}, D4), animation: { darken: "darken 0.2s ease-out forwards", "fade-in": "fade-in 0.2s ease-out forwards", "slide-up": "slideUp 0.3s ease-out forwards" }, keyframes: { darken: { "0%": { opacity: 0 }, "100%": { opacity: 0.5 } }, lighten: { "0%": { opacity: 0.5 }, "100%": { opacity: 0 } }, "fade-in": { "0%": { opacity: 0 }, "100%": { opacity: 1 } }, "fade-out": { "0%": { opacity: 1 }, "100%": { opacity: 0 } }, slideUp: { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } } } } }, presets: [Z4({})], hash: !1 })) : F4;
function F4(e) {
  return e;
}
const ve = "transition-all hover:brightness-90 dark:hover:brightness-110 active:scale-95 cursor-pointer", $o = "hover-animation", de = "text-brand-mixed-light dark:text-brand-mixed-dark", ze = "text-foreground-light dark:text-foreground-dark", mn = "text-neutral-primary-light dark:text-neutral-primary-dark", q = "text-neutral-secondary-light dark:text-neutral-secondary-dark", Ze = "text-neutral-tertiary-light dark:text-neutral-tertiary-dark", St = "border-neutral-secondary-light dark:border-neutral-secondary-dark", Ni = "border-neutral-tertiary-light dark:border-neutral-tertiary-dark";
let na, ra, oa, No = (e) => e;
function y2() {
  return T(na || (na = No`<div
    class="absolute top-0 left-0 w-full h-full rounded-lg border-2 pointer-events-none ${0} opacity-5"
  ></div>`), Ni);
}
function V4(e) {
  O.getState().connected && e(O.getState().provider);
  const t = O.subscribe(async (n, r) => {
    if (n.connected && !r.connected) {
      if (!n.provider) throw new Error("No provider available");
      e(n.provider);
    }
  });
  return () => {
    t();
  };
}
function Hf(e) {
  O.getState().connecting && e();
  const t = O.subscribe(async (n, r) => {
    n.connecting && !r.connecting && e();
  });
  return () => {
    t();
  };
}
function Zf(e) {
  const t = O.subscribe(async (n, r) => {
    !n.connected && r.connected && e();
  });
  return () => {
    t();
  };
}
function Wf(e) {
  const t = O.subscribe(async (n, r) => {
    n.modalOpen && !r.modalOpen && e();
  });
  return () => {
    t();
  };
}
function b2(e) {
  const t = O.subscribe(async (n, r) => {
    !n.modalOpen && r.modalOpen && e();
  });
  return () => {
    t();
  };
}
async function Df() {
  let e = O.getState().provider;
  if (!e && (v2(), await new Promise((t, n) => {
    const r = b2(() => {
      r(), o(), e && t(), n("Modal closed without connecting");
    }), o = V4((i) => {
      e = i;
    });
  }), !e)) throw new Error("No WebLN provider available");
  return e;
}
function Ff() {
  return console.warn("Bitcoin Connect: isConnected is deprecated and will be removed in the next major version"), O.getState().connected;
}
function Vf(e = {}) {
  O.getState().setBitcoinConnectConfig(e);
}
function Gf() {
  window.dispatchEvent(new CustomEvent("bc:balancerefresh"));
}
function v2() {
  const e = document.createElement("bc-modal"), t = document.createElement("bc-connect");
  t.setAttribute("closable", "closable"), e.appendChild(t), document.body.appendChild(e), O.getState().setModalOpen(!0);
}
function G4({ invoice: e, paymentMethods: t, onPaid: n, onCancelled: r }) {
  if (document.querySelector("bc-modal")) throw new Error("bc-modal already in DOM");
  const o = document.createElement("bc-modal"), i = document.createElement("bc-payment");
  i.setAttribute("closable", "closable"), i.setAttribute("invoice", e), t && i.setAttribute("payment-methods", t), o.appendChild(i);
  let s = !1;
  const c = (l) => {
    s = !0, n?.(l.detail);
  };
  window.addEventListener("bc:onpaid", c);
  const a = b2(() => {
    a(), window.removeEventListener("bc:onpaid", c), s || r == null || r();
  });
  return document.body.appendChild(o), O.getState().setModalOpen(!0), { setPaid: (l) => {
    i.setAttribute("paid", "paid"), i.dispatchEvent(new CustomEvent("bc:onpaid", { bubbles: !0, composed: !0, detail: l }));
  } };
}
function Bi() {
  const e = document.querySelector("bc-modal");
  e && document.body.removeChild(e), O.getState().setModalOpen(!1), O.getState().clearRouteHistory(), O.getState().setError(void 0);
}
function jf(e) {
  O.getState().connect(e);
}
function zf(e) {
  O.getState().connectNWC(e);
}
function qf() {
  O.getState().disconnect();
}
function Kf() {
  return O.getState().connectorConfig;
}
let ia, j4 = (e) => e, Rt = class extends re()(Y) {
  constructor() {
    super(), this._loading = !1, this._loadBalance(), window.addEventListener("bc:balancerefresh", () => {
      this._loadBalance();
    }), this._selectedCurrency = O.getState().currency, O.subscribe((e, t) => {
      this._selectedCurrency = e.currency, e.currency !== t.currency && this._convertBalance(), e.connected !== t.connected && e.connected && this._loadBalance();
    });
  }
  render() {
    return T(ia || (ia = j4` <span
      class="font-medium font-sans mr-2 flex justify-center items-center gap-0.5 ${0}"
    >
      <span class="font-mono">${0} </span></span
    >`), de, this._balance || "Loading...");
  }
  async _convertBalance() {
    if (this._loading || this._balanceSats === void 0) return;
    const e = this._selectedCurrency || "sats";
    if (e === "BTC") this._balance = (this._balanceSats / 1e8).toLocaleString(void 0, { minimumFractionDigits: 8, useGrouping: !0 }) + " BTC";
    else if (e !== "sats") {
      try {
        this._loading = !0;
        const t = await F5({ satoshi: this._balanceSats, currency: e }), n = parseFloat(t.toFixed(2));
        this._balance = new Intl.NumberFormat(void 0, { style: "currency", currency: e }).format(n);
      } catch (t) {
        console.error(t);
      }
      this._loading = !1;
    } else this._balance = this._balanceSats.toLocaleString(void 0, { useGrouping: !0 }) + " sats";
  }
  _loadBalance() {
    var e = this;
    (async function() {
      try {
        const t = O.getState().provider;
        if (t == null || !t.getBalance) return;
        const n = await t.getBalance();
        n && (e._balanceSats = n.balance, e._convertBalance());
      } catch (t) {
        e._balance = "⚠️", console.error(t);
      }
    })();
  }
};
I([J()], Rt.prototype, "_balance", void 0), I([J()], Rt.prototype, "_balanceSats", void 0), I([J()], Rt.prototype, "_loading", void 0), I([J()], Rt.prototype, "_selectedCurrency", void 0), Rt = I([K("bc-balance")], Rt);
let sa, z4 = (e) => e;
const _t = (e) => te(sa || (sa = z4`
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100px" height="100px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class=${0}>
<g transform="rotate(0 50 50)">
  <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="currentColor">
    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.9166666666666666s" repeatCount="indefinite"></animate>
  </rect>
</g><g transform="rotate(30 50 50)">
  <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="currentColor">
    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.8333333333333334s" repeatCount="indefinite"></animate>
  </rect>
</g><g transform="rotate(60 50 50)">
  <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="currentColor">
    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.75s" repeatCount="indefinite"></animate>
  </rect>
</g><g transform="rotate(90 50 50)">
  <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="currentColor">
    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.6666666666666666s" repeatCount="indefinite"></animate>
  </rect>
</g><g transform="rotate(120 50 50)">
  <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="currentColor">
    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5833333333333334s" repeatCount="indefinite"></animate>
  </rect>
</g><g transform="rotate(150 50 50)">
  <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="currentColor">
    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5s" repeatCount="indefinite"></animate>
  </rect>
</g><g transform="rotate(180 50 50)">
  <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="currentColor">
    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.4166666666666667s" repeatCount="indefinite"></animate>
  </rect>
</g><g transform="rotate(210 50 50)">
  <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="currentColor">
    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.3333333333333333s" repeatCount="indefinite"></animate>
  </rect>
</g><g transform="rotate(240 50 50)">
  <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="currentColor">
    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.25s" repeatCount="indefinite"></animate>
  </rect>
</g><g transform="rotate(270 50 50)">
  <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="currentColor">
    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.16666666666666666s" repeatCount="indefinite"></animate>
  </rect>
</g><g transform="rotate(300 50 50)">
  <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="currentColor">
    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.08333333333333333s" repeatCount="indefinite"></animate>
  </rect>
</g><g transform="rotate(330 50 50)">
  <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="currentColor">
    <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animate>
  </rect>
</g>
</svg>`), e || "w-7 h-7");
let aa, ca, la, da, ua, ha, fa, pa, gt = (e) => e, Ln = class extends re()(Y) {
  constructor() {
    super(), this.title = "Connect Wallet", this._showBalance = void 0, this._showBalance = O.getState().bitcoinConnectConfig.showBalance && O.getState().supports("getBalance"), O.subscribe((e) => {
      this._showBalance = e.bitcoinConnectConfig.showBalance && e.supports("getBalance");
    });
  }
  render() {
    const e = this._connecting || !this._connected && this._modalOpen;
    return T(aa || (aa = gt`<div>
      <div
        class="relative inline-flex ${0} cursor-pointer 
          rounded-lg gap-2 justify-center items-center"
        @click=${0}
      >
        <div
          class="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none ${0}"
        ></div>
        ${0}
        <bci-button variant="primary">
          ${0}
          <span class="font-semibold">
            ${0}
          </span>
        </bci-button>
        ${0}
      </div>
    </div>`), ve, this._onClick, this._connected ? "bg-glass-light dark:bg-glass-dark" : "", this._connected ? y2() : "", e ? T(ca || (ca = gt` ${0} `), _t("w-11 h-11 -mr-2 mr-1 -ml-2.5")) : this._connected ? null : T(la || (la = gt`<span class="-ml-0.5">${0}</span>`), cn), e ? T(da || (da = gt`Connecting...`)) : this._connected ? T(ua || (ua = gt`Connected`)) : T(ha || (ha = gt`${0}`), this.title), this._connected && this._showBalance ? T(fa || (fa = gt`<bc-balance class="select-none cursor-pointer"></bc-balance> `)) : null);
  }
  _onClick() {
    v2();
  }
};
I([ue()], Ln.prototype, "title", void 0), I([J()], Ln.prototype, "_showBalance", void 0), Ln = I([K("bc-button")], Ln);
const q4 = te(pa || (pa = ((e) => e)`
<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6">
<path d="M7 16.5106L13.5511 22L23 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`));
let ga, wa, ma, ya, ba, va, $t = (e) => e, Ye = class extends re()(Y) {
  constructor() {
    super(...arguments), this.title = "Pay Now", this.paymentMethods = "all", this._waitingForInvoice = !1, this._paid = !1;
  }
  updated(e) {
    var t;
    super.updated(e), e.has("invoice") && this.invoice && this._waitingForInvoice && this._launchModal(), e.has("invoice") && !this.invoice && (this._waitingForInvoice = !1, this._paid = !1), e.has("preimage") && this.preimage && ((t = this._setPaid) == null || t.call(this, { preimage: this.preimage }));
  }
  render() {
    const e = !this._paid && (this._waitingForInvoice || this._modalOpen);
    return T(ga || (ga = $t` <div class="inline-flex" @click=${0}>
      <bci-button variant="primary">
        ${0}
        <span class="font-semibold">
          ${0}
        </span>
      </bci-button>
    </div>`), this._onClick, e ? T(wa || (wa = $t`${0}`), _t("w-11 h-11 -mr-2 -ml-2.5 ")) : this._paid ? T(ma || (ma = $t`<span class="-ml-0.5">${0}</span>`), q4) : T(ya || (ya = $t`<span class="-ml-0.5">${0}</span>`), cn), e ? T(ba || (ba = $t`Loading...`)) : T(va || (va = $t`${0}`), this._paid ? "Paid" : this.title));
  }
  _onClick() {
    this._paid || (this._waitingForInvoice = !0, this.invoice && this._launchModal());
  }
  _launchModal() {
    if (this._waitingForInvoice = !1, !this.invoice) throw new Error("No invoice available");
    const { setPaid: e } = G4({ onPaid: () => {
      this._paid = !0;
    }, invoice: this.invoice, paymentMethods: this.paymentMethods });
    this._setPaid = e;
  }
};
I([ue()], Ye.prototype, "title", void 0), I([ue()], Ye.prototype, "invoice", void 0), I([ue({ type: String, attribute: "payment-methods" })], Ye.prototype, "paymentMethods", void 0), I([ue({})], Ye.prototype, "preimage", void 0), I([J()], Ye.prototype, "_waitingForInvoice", void 0), I([J()], Ye.prototype, "_paid", void 0), Ye = I([K("bc-pay-button")], Ye);
let Ca, xa, K4 = (e) => e, Xt = class extends re()(_i) {
  constructor() {
    super(...arguments), this.variant = "secondary", this.ghost = !1, this.block = !1;
  }
  render() {
    const e = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches, t = window.getComputedStyle(this).getPropertyValue(e ? "--bc-color-brand-button-text-dark" : "--bc-color-brand-button-text") || window.getComputedStyle(this).getPropertyValue("--bc-color-brand-button-text");
    return T(Ca || (Ca = K4`<button
      class="w-full relative h-10 px-4 font-sans font-semibold rounded-lg flex justify-center items-center
        ${0} rounded-lg w-full ${0}
        ${0}
        ${0}
        "
    >
      ${0}
      <!-- TODO: why can the inner border not be conditionally rendered? -->

      <div
        class="flex gap-2  ${0} justify-center items-center"
      >
        <slot></slot>
      </div>
    </button>`), this.ghost ? "" : "shadow", ve, this.variant === "primary" ? "bg-brand-light dark:bg-brand-dark" : "", this.variant === "primary" ? t ? "text-brand-button-text-light dark:text-brand-button-text-dark" : this._getBrandColorLuminance() > 0.5 ? "text-black" : "text-white" : this.variant === "secondary" ? `${de}` : `${Ze}`, this.ghost ? null : this.variant === "primary" ? y2() : this.variant === "secondary" ? T(ra || (ra = No`<div
    class="absolute -z-10 top-0 left-0 w-full h-full border-2 rounded-lg ${0}"
  ></div>`), "border-brand-mixed-light dark:border-brand-mixed-dark") : T(oa || (oa = No`<div
    class="absolute -z-10 top-0 left-0 w-full h-full border-2 rounded-lg ${0}"
  ></div>`), Ni), this.block ? "w-full" : "");
  }
};
I([ue()], Xt.prototype, "variant", void 0), I([ue({ type: Boolean })], Xt.prototype, "ghost", void 0), I([ue({ type: Boolean })], Xt.prototype, "block", void 0), Xt = I([K("bci-button")], Xt);
const Q4 = te(xa || (xa = ((e) => e)`
<svg width="55" height="55" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

<rect x="34" y="6" width="24" height="24" rx="5.99998" fill="#34D14A"/>
<path d="M43.3358 10H47.2816V16.3676H44.8352V12.0498H42.6436L43.3358 10Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M46 26C48.4853 26 50.5 24.027 50.5 21.5932C50.5 19.1594 48.4853 17.1865 46 17.1865C43.5147 17.1865 41.5 19.1594 41.5 21.5932C41.5 24.027 43.5147 26 46 26ZM48.457 21.5932C48.457 22.9221 47.357 23.9994 46 23.9994C44.643 23.9994 43.5429 22.9221 43.5429 21.5932C43.5429 20.2643 44.643 19.187 46 19.187C47.357 19.187 48.457 20.2643 48.457 21.5932Z" fill="white"/>
<rect x="6" y="6" width="24" height="24" rx="5.99998" fill="white"/>
<g clip-path="url(#clip0_1455_976)">
<path d="M16.0072 25.2004C16.3321 25.2668 16.6642 25.3073 16.9979 25.3213C16.3121 25.5485 15.6308 25.7902 14.952 26.0365H14.9515C14.3197 26.2633 13.69 26.4964 13.0496 26.6985C12.5337 26.8585 12.0072 26.9977 11.469 27.0079C10.4279 27.0337 9.63614 26.4775 9.51127 25.4086C9.40844 24.4379 9.79297 23.4781 10.0985 22.5688C10.4263 21.645 10.7661 20.725 11.0811 19.7966C11.102 19.9872 11.1317 20.1764 11.17 20.3632C11.2516 20.7628 11.3738 21.1556 11.5327 21.5314C11.6886 21.8999 11.8814 22.2552 12.1057 22.5875C12.3278 22.9162 12.583 23.2256 12.864 23.5064C13.1448 23.7874 13.4542 24.0424 13.7829 24.2647C14.1152 24.4892 14.4705 24.682 14.839 24.8377C15.2146 24.9966 15.6076 25.1185 16.0072 25.2004Z" fill="#FFC802"/>
<path d="M12.8642 14.7179C12.6606 14.9216 12.4707 15.14 12.2968 15.37C12.5044 14.3843 12.6856 13.3925 12.8728 12.4029C13.1169 11.225 13.39 9.50918 14.6962 9.08685C15.397 8.87198 16.1159 9.1935 16.6638 9.6336C17.2983 10.1455 17.8194 10.791 18.3533 11.4048C18.7768 11.9048 19.2011 12.4045 19.6324 12.8979H17.2582C16.8373 12.8979 16.4163 12.9404 16.007 13.0241C15.6074 13.1058 15.2146 13.228 14.8388 13.3866C14.4703 13.5425 14.115 13.7354 13.7827 13.9599C13.4537 14.182 13.1446 14.4371 12.8638 14.7182L12.8642 14.7179Z" fill="#FFC802"/>
<path d="M26.9836 22.5092C26.4926 23.0008 25.812 23.2299 25.1456 23.4C24.9876 23.4398 24.829 23.476 24.6699 23.5105C23.3451 23.7868 22.0079 24.0064 20.6863 24.2964C20.702 24.2858 20.718 24.2752 20.7338 24.2647C21.0625 24.0426 21.3716 23.7874 21.6527 23.5064C21.9337 23.2254 22.1886 22.9162 22.4109 22.5875C22.6355 22.2552 22.8283 21.8999 22.9842 21.5314C23.1431 21.1558 23.265 20.7628 23.3469 20.3632C23.4306 19.9539 23.4731 19.5329 23.4731 19.1119V16.7548C24.2683 17.449 25.0814 18.1231 25.8723 18.8226C26.0525 18.9841 26.2303 19.1486 26.4013 19.3198C26.8373 19.7586 27.241 20.2498 27.4109 20.8453C27.5859 21.4506 27.4318 22.063 26.984 22.5092H26.9836Z" fill="#FFC802"/>
<path d="M21.2 19.2375C21.2 21.4121 19.4371 23.175 17.2625 23.175C15.0878 23.175 13.325 21.4121 13.325 19.2375C13.325 17.0628 15.0878 15.3 17.2625 15.3H21.2V19.2375Z" fill="#202020"/>
</g>
<g clip-path="url(#clip1_1455_976)">
<rect x="6" y="34.0806" width="24" height="24" rx="5.99998" fill="url(#paint0_linear_1455_976)"/>
<path d="M22.1146 53.6518C24.2167 53.6518 25.1736 48.9971 25.1736 47.2322C25.1736 45.8565 24.2243 45.0228 22.9764 45.0228C21.7363 45.0228 20.7296 45.5561 20.7171 46.2165C20.717 47.9592 20.4103 53.6518 22.1146 53.6518Z" fill="white" stroke="black" stroke-width="0.626014"/>
<path d="M14.4364 53.6518C12.3343 53.6518 11.3775 48.9971 11.3775 47.2322C11.3775 45.8565 12.3267 45.0228 13.5746 45.0228C14.8147 45.0228 15.8215 45.5561 15.834 46.2165C15.834 47.9592 16.1407 53.6518 14.4364 53.6518Z" fill="white" stroke="black" stroke-width="0.626014"/>
<path d="M23.5442 46.5772C23.5893 46.5504 23.6381 46.5536 23.6731 46.5733C23.6898 46.5827 23.7 46.5939 23.7053 46.6035C23.7098 46.6117 23.7142 46.6242 23.7122 46.6455C23.4691 49.0543 22.1626 51.0462 20.4065 51.9629C19.8161 52.2711 19.4127 52.8105 19.0579 53.2783C18.7734 53.6536 18.5149 53.9885 18.2004 54.2363C17.8861 53.9886 17.6273 53.6534 17.343 53.2783C16.9882 52.8105 16.5856 52.2711 15.9954 51.9629C14.2459 51.0498 12.943 49.07 12.6926 46.6729C12.6904 46.6517 12.6941 46.639 12.6985 46.6309C12.7038 46.6213 12.7139 46.6092 12.7307 46.5996C12.7654 46.5799 12.8143 46.5763 12.8596 46.6026C14.4209 47.5178 16.222 48.0429 18.1799 48.043C20.1382 48.043 21.9728 47.5083 23.5442 46.5772Z" fill="#FFDF6F" stroke="black" stroke-width="0.622835"/>
<ellipse cx="18.2128" cy="46.625" rx="5.50893" ry="1.83631" fill="black" stroke="black" stroke-width="0.626014"/>
<path d="M13.7889 49.7133C13.7889 49.7133 16.5062 50.6315 18.2545 50.6315C20.0028 50.6315 22.7201 49.7133 22.7201 49.7133" stroke="black" stroke-width="0.626014" stroke-linecap="round"/>
<circle cx="1.24567" cy="1.24567" r="1.24567" transform="matrix(-1 0 0 1 14.2769 37.5268)" fill="black"/>
<path d="M12.8236 38.5856L15.1488 40.9109" stroke="black" stroke-width="0.622835"/>
<circle cx="23.2044" cy="38.7725" r="1.24567" fill="black"/>
<path d="M23.4328 38.5856L21.1075 40.9109" stroke="black" stroke-width="0.622835"/>
<path d="M18.1597 38.9386C20.9689 38.9388 23.3127 41.3062 23.8669 44.4589C23.9959 45.1923 23.6018 45.9098 22.928 46.2269C21.4872 46.9049 19.8781 47.2843 18.1802 47.2843C16.4643 47.2843 14.8396 46.8963 13.3872 46.2045C12.7157 45.8847 12.3249 45.1667 12.456 44.4346C13.0181 41.2939 15.3575 38.9386 18.1597 38.9386Z" fill="#FFDF6F"/>
<path d="M18.1597 38.9386L18.1597 38.6272H18.1597V38.9386ZM18.1802 47.2843V47.5957H18.1802L18.1802 47.2843ZM13.3872 46.2045L13.2533 46.4857L13.3872 46.2045ZM23.8669 44.4589L24.1736 44.405L23.8669 44.4589ZM22.928 46.2269L22.7954 45.9451L22.928 46.2269ZM18.1597 38.9386L18.1596 39.25C20.7781 39.2502 23.0246 41.4662 23.5602 44.5128L23.8669 44.4589L24.1736 44.405C23.6007 41.1462 21.1598 38.6274 18.1597 38.6272L18.1597 38.9386ZM22.928 46.2269L22.7954 45.9451C21.3951 46.6041 19.8313 46.9729 18.1802 46.9729L18.1802 47.2843L18.1802 47.5957C19.925 47.5957 21.5792 47.2058 23.0606 46.5087L22.928 46.2269ZM18.1802 47.2843V46.9729C16.5117 46.9729 14.9327 46.5957 13.5211 45.9234L13.3872 46.2045L13.2533 46.4857C14.7465 47.1969 16.4169 47.5957 18.1802 47.5957V47.2843ZM12.456 44.4346L12.7625 44.4894C13.3056 41.4547 15.5478 39.25 18.1597 39.25V38.9386V38.6272C15.1672 38.6272 12.7305 41.1332 12.1494 44.3797L12.456 44.4346ZM13.3872 46.2045L13.5211 45.9234C12.9697 45.6607 12.6575 45.0764 12.7625 44.4894L12.456 44.4346L12.1494 44.3797C11.9924 45.257 12.4618 46.1086 13.2533 46.4857L13.3872 46.2045ZM23.8669 44.4589L23.5602 44.5128C23.6636 45.1008 23.3487 45.6848 22.7954 45.9451L22.928 46.2269L23.0606 46.5087C23.855 46.1349 24.3281 45.2838 24.1736 44.405L23.8669 44.4589Z" fill="black"/>
<path d="M18.1598 41.1393C20.1469 41.1394 21.8292 42.3718 22.4069 44.0749C22.5945 44.6277 22.2738 45.2031 21.7332 45.4235C20.6303 45.873 19.4243 46.1216 18.1598 46.1217C16.8951 46.1217 15.6886 45.8731 14.5854 45.4234C14.0448 45.2031 13.7241 44.6277 13.9117 44.0749C14.4896 42.3717 16.1725 41.1393 18.1598 41.1393Z" fill="black"/>
<ellipse cx="19.5919" cy="43.7967" rx="1.03806" ry="0.830447" fill="white"/>
<ellipse cx="16.6202" cy="43.7972" rx="1.03806" ry="0.830447" fill="white"/>
<g clip-path="url(#clip2_1455_976)">
<rect x="5" y="32.8384" width="26" height="26" fill="url(#pattern0_1455_976)"/>
</g>
</g>
<path d="M54.5 44.9997H53V40.9997C53 40.4693 52.7893 39.9606 52.4142 39.5855C52.0391 39.2104 51.5304 38.9997 51 38.9997H47V37.4997C47 36.8367 46.7366 36.2008 46.2678 35.732C45.7989 35.2631 45.163 34.9997 44.5 34.9997C43.837 34.9997 43.2011 35.2631 42.7322 35.732C42.2634 36.2008 42 36.8367 42 37.4997V38.9997H38C37.4696 38.9997 36.9609 39.2104 36.5858 39.5855C36.2107 39.9606 36 40.4693 36 40.9997V44.7997H37.5C39 44.7997 40.2 45.9997 40.2 47.4997C40.2 48.9997 39 50.1997 37.5 50.1997H36V53.9997C36 54.5302 36.2107 55.0389 36.5858 55.4139C36.9609 55.789 37.4696 55.9997 38 55.9997H41.8V54.4997C41.8 52.9997 43 51.7997 44.5 51.7997C46 51.7997 47.2 52.9997 47.2 54.4997V55.9997H51C51.5304 55.9997 52.0391 55.789 52.4142 55.4139C52.7893 55.0389 53 54.5302 53 53.9997V49.9997H54.5C55.163 49.9997 55.7989 49.7363 56.2678 49.2675C56.7366 48.7987 57 48.1628 57 47.4997C57 46.8367 56.7366 46.2008 56.2678 45.732C55.7989 45.2631 55.163 44.9997 54.5 44.9997Z" fill="#A2A2A2"/>
<defs>
<pattern id="pattern0_1455_976" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_1455_976" transform="scale(0.0078125)"/>
</pattern>
<linearGradient id="paint0_linear_1455_976" x1="18" y1="34.0806" x2="18" y2="56.9377" gradientUnits="userSpaceOnUse">
<stop offset="0.669102" stop-color="#FFDE6E"/>
<stop offset="1" stop-color="#F8C455"/>
</linearGradient>
<clipPath id="clip0_1455_976">
<rect width="18" height="18" fill="white" transform="translate(9.5 9)"/>
</clipPath>
<clipPath id="clip1_1455_976">
<rect x="6" y="34.0806" width="24" height="24" rx="5.99998" fill="white"/>
</clipPath>
<clipPath id="clip2_1455_976">
<rect width="26" height="26" fill="white" transform="translate(5 32.4443)"/>
</clipPath>
<image id="image0_1455_976" width="128" height="128" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>

`));
let Ea, J4 = (e) => e;
class Be extends re()(Y) {
  constructor(t, n, r, o) {
    super(), this._connectorType = t, this._title = n, this._background = r, this._icon = o;
  }
  render() {
    return T(Ea || (Ea = J4`<button
      class="flex flex-col justify-between items-center w-32 -mx-4 cursor-pointer ${0}"
      aria-label="Connect with ${0}"
      @click=${0}
    >
      <div
        class="w-16 h-16 drop-shadow-[0_10px_15px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_10px_15px_rgba(255,255,255,0.15)] rounded-2xl flex justify-center items-center overflow-hidden"
        style="background: ${0};"
      >
        ${0}
      </div>
      <span
        class="text-sm mt-3 font-sans font-medium text-center w-28 h-7 flex justify-center items-center ${0}"
      >
        ${0}
      </span>
    </button>`), ve, this._title, this._onClick, this._background, this._icon, q, this._title);
  }
  _connect(t) {
    O.getState().connect(Pe({}, t, { connectorName: this._title, connectorType: this._connectorType }));
  }
}
let Aa, ka = class extends Be {
  constructor() {
    super("extension.generic", "Browser Extensions", "#F4F4F4", Q4);
  }
  _onClick() {
    this._connect({});
  }
};
ka = I([K("bc-extension-connector")], ka);
const C2 = te(Aa || (Aa = ((e) => e)`<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8000 8000" width="40" height="40">
  <path d="M1404.94034,2404.75143c.19948.39893.416.79745.63896,1.19934-.21965-.3998-.4293-.7996-.63896-1.19934ZM1398.36987,2392.55825c.01.02001.01999.03996.01999.04996.01999.02001.03998.04996.04998.06997-.01999-.03996-.04998-.07997-.06997-.11993ZM7957.22848,6407.80899c-75.3022-453.82005-341.31246-1051.68618-631.76608-1536.83905-217.58172,280.41299-443.70125,543.12568-695.66263,796.78364,151.96083,272.22676,381.52012,831.33939,371.78586,1131.07073-3.34955,103.13742-84.59871,186.38404-187.48323,193.03587-323.69068,20.92769-761.15088-169.80941-1126.96417-352.01125-274.08918,250.36976-539.73074,478.97192-815.02811,690.20321,570.85548,338.56749,1305.54247,669.74202,1904.46573,668.08293,872.77622,46.26671,1378.68446-776.20339,1180.65263-1590.32607ZM5249.15884,5683.56479c1101.91285-1101.01171,2353.03599-2527.31198,2708.11113-4090.5697,253.93721-1273.80049-760.34667-1869.98142-1895.16006-1469.66567,211.65045,278.23428,364.22738,589.33979,457.73054,914.98744,86.80988-20.20216,196.93112-34.80914,289.99476-31.50156,103.33929,3.67279,186.93541,86.38156,191.60732,189.77353,13.96581,309.07109-235.73659,902.8025-402.1382,1193.8406,0,.01-.01.02001-.01.03001l-.04998.07991c-624.44753,1143.09071-1591.89389,2208.42396-2600.29743,3077.06633l-.22964-.19984c-263.64443,226.46298-526.16056,433.98687-804.2439,626.56893.39938.34966.79882.69956,1.19826,1.04946-509.31622,353.04862-1419.46673,925.33606-2012.13405,893.44541-103.82534-5.58671-186.23795-90.1864-188.67838-194.22674-6.97909-297.53161,215.6413-843.71786,363.83869-1111.11806-237.05325-259.94423-464.71032-529.69327-686.31643-814.38364-1228.33988,1900.32534-772.83666,3911.20697,1772.96127,2814.86279,1004.95316-454.63593,1968.00538-1208.05697,2803.81609-2000.0392ZM2528.2177,4000.38756c-468.17105-551.20508-806.89093-1020.88409-1125.16461-1599.13417h-.01c-.00197-.02709-.02111-.04517-.02999-.07997h-.01c-.00225-.03154-.04191-.05163-.03986-.08992,0,0-.01,0-.01-.01-1.46642-2.7001-3.08021-5.72568-4.5634-8.46529.01999.02001.03998.04996.04998.06997-165.01013-287.23702-415.64692-882.63022-403.53149-1193.46936,4.07951-104.66591,88.1281-188.31126,192.71288-192.04153,92.1143-3.28547,200.69379,10.46969,286.62767,30.61985,93.58312-325.69743,246.26999-636.85321,458.06014-915.09749C797.66386-275.84563-214.1867,319.25478,39.32792,1592.99819c208.75964,1126.24494,1140.55524,2354.14531,1865.30175,3206.20191-1.24817,1.76903,1.23818-1.76903,0,0,177.91975,202.67638,363.17881,406.52227,558.17368,604.08153,267.29912-191.50259,530.82373-396.10806,795.10723-617.7438-259.10108-257.46588-503.73334-520.6384-729.69288-785.15026ZM1420.59738,2433.86513c.84886,1.56913,1.71746,3.17821,2.5963,4.82725-.85885-1.58908-1.72745-3.19816-2.5963-4.82725ZM1457.40366,2502.26682c.92857,1.699,1.83716,3.39806,2.73599,5.07711-.89883-1.64904-1.80742-3.3481-2.73599-5.07711ZM1403.01311,2401.17342c-.01-.01-.01987-.02995-.02986-.03996.01.01.01987.02995.01987.03996.01999.03001.02999.04996.03998.06997-.01-.02001-.01999-.03996-.02999-.06997ZM1404.94034,2404.75143c.19948.39893.416.79745.63896,1.19934-.21965-.3998-.4293-.7996-.63896-1.19934Z" fill="#ffe480"/>
  <path d="M2762.56314,2987.43935c-683.41752-683.42045-683.41752-1791.46134,0-2474.87781,683.41752-683.41755,1791.45841-683.41755,2474.87885,0,683.41068,683.41648,683.41068,1791.45737,0,2474.87781l-1237.44089,1237.44089-1237.43796-1237.44089Z" fill="#fff"/>
</svg>`)), x2 = "Alby Hub";
let Sa, _a = class extends Be {
  constructor() {
    super("nwc.albyhub", x2, "#000000", C2);
  }
  async _onClick() {
    O.getState().pushRoute("/alby-hub");
  }
};
_a = I([K("bc-alby-hub-connector")], _a);
const Y4 = te(Sa || (Sa = ((e) => e)`<svg width="393" height="392" viewBox="0 0 393 392" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M179.272 99.0639C169.038 88.8691 152.419 88.9782 142.221 99.2091L76.2474 165.414C66.0488 175.646 66.1786 191.974 76.4095 202.17L184.58 310.34C194.813 320.534 211.4 320.449 221.597 310.218L253.749 278.066C244.372 287.443 236.656 280.701 227.512 271.595L209.578 253.662C195.964 259.051 180.052 256.374 169.022 245.365L155.356 231.699C154.896 231.243 154.542 230.767 154.292 230.17C154.043 229.572 153.914 228.931 153.914 228.284C153.913 227.637 154.041 226.995 154.289 226.398C154.537 225.8 154.926 225.293 155.385 224.837L163.119 217.103L146.284 200.268C143.648 197.638 143.218 193.391 145.575 190.522C148.269 187.228 153.153 187.053 156.108 190.002L173.171 207.051L184.728 195.494L167.853 178.661C165.216 176.03 164.787 171.784 167.164 168.895C167.794 168.128 168.578 167.501 169.465 167.054C170.353 166.608 171.323 166.352 172.315 166.303C173.307 166.254 174.298 166.413 175.225 166.77C176.152 167.127 176.994 167.673 177.697 168.375L194.829 185.393L202.089 178.132C202.545 177.673 202.994 177.259 203.592 177.01C204.189 176.761 204.83 176.632 205.478 176.632C206.125 176.631 206.766 176.758 207.364 177.006C207.962 177.254 208.505 177.618 208.962 178.077L222.65 191.738C233.542 202.609 236.39 218.431 231.298 231.943L249.235 249.88C258.379 258.985 266.03 265.785 275.408 256.408L315.979 215.836C306.227 225.588 298.215 218.075 288.578 208.446L179.272 99.0639Z" fill="url(#paint0_linear_1_280)"/>
<path d="M255.975 81.0273L221.487 115.487L298.115 192.116C305.45 199.419 311.825 205.239 318.899 202.417C322.988 200.787 325.795 196.351 324.228 192.238C287.561 96.0253 287.546 96.0238 282.682 85.507C277.818 74.9901 264.138 72.7602 255.975 81.0273Z" fill="#897FFF"/>
<path d="M255.975 81.0273L221.487 115.487L298.115 192.116C305.45 199.419 311.825 205.239 318.899 202.417C322.988 200.787 325.795 196.351 324.228 192.238C287.561 96.0253 287.546 96.0238 282.682 85.507C277.818 74.9901 264.138 72.7602 255.975 81.0273Z" fill="#897FFF"/>
<path d="M255.975 81.0273L221.487 115.487L298.115 192.116C305.45 199.419 311.825 205.239 318.899 202.417C322.988 200.787 325.795 196.351 324.228 192.238C287.561 96.0253 287.546 96.0238 282.682 85.507C277.818 74.9901 264.138 72.7602 255.975 81.0273Z" fill="#897FFF"/>
<path d="M255.975 81.0273L221.487 115.487L298.115 192.116C305.45 199.419 311.825 205.239 318.899 202.417C322.988 200.787 325.795 196.351 324.228 192.238C287.561 96.0253 287.546 96.0238 282.682 85.507C277.818 74.9901 264.138 72.7602 255.975 81.0273Z" fill="#897FFF"/>
<path d="M255.975 81.0273L221.487 115.487L298.115 192.116C305.45 199.419 311.825 205.239 318.899 202.417C322.988 200.787 325.795 196.351 324.228 192.238C287.561 96.0253 287.546 96.0238 282.682 85.507C277.818 74.9901 264.138 72.7602 255.975 81.0273Z" fill="#897FFF"/>
<defs>
<linearGradient id="paint0_linear_1_280" x1="192.323" y1="78.4384" x2="192.323" y2="317.939" gradientUnits="userSpaceOnUse">
<stop stop-color="#FFCA4A"/>
<stop offset="1" stop-color="#F7931A"/>
</linearGradient>
</defs>
</svg>`)), Ui = "NWC";
let La, Ta = class extends Be {
  constructor() {
    super("nwc.generic", Ui, "#ffffff", Y4);
  }
  async _onClick() {
    O.getState().pushRoute("/nwc");
  }
};
Ta = I([K("bc-nwc-connector")], Ta);
const X4 = te(La || (La = ((e) => e)`<svg class="w-10 h-10" width="28" height="55" viewBox="0 0 28 55" xmlns="http://www.w3.org/2000/svg"><g fill="#ffffff" fill-rule="nonzero"><path d="M27.25 30.506L11.354 53.692a.84.84 0 11-1.385-.954l15.896-23.185a.84.84 0 111.385.953zM25.16 26.374L9.629 49.082a.84.84 0 01-1.385-.954L23.776 25.42a.84.84 0 011.385.954zM20.438 1.576L2.43 27.895h16.895l-1.136 1.68H.363a.84.84 0 01-.227-1.158L19.006.622a.84.84 0 011.159-.227c.398.253.52.78.273 1.181z"></path><path d="M22.118 6.617L10.24 23.99h11.763l-1.158 1.68H7.062l1.136-1.68L20.733 5.686a.84.84 0 011.385.931z"></path></g></svg>`));
let Ma, Ra = class extends Be {
  constructor() {
    super("lnc", "Lightning Node Connect", "#101727", X4);
  }
  async _onClick() {
    const e = window.prompt("Enter pairing phrase");
    if (!e) return;
    const t = await K0();
    if (!t) throw new Error("LNC not supported");
    t.credentials.pairingPhrase = e, this._connect({});
  }
};
Ra = I([K("bc-lnc-connector")], Ra);
const E2 = te(Ma || (Ma = ((e) => e)`<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M256 0H0V256H256V0Z" fill="#673AB7"/>
<path d="M165 53H91V134.785H113.31V202L165 112.224H135.934L165 53Z" fill="white"/>
</svg>`)), Bo = "LNbits";
let $a = class extends Be {
  constructor() {
    super("lnbits", Bo, "#673ab7", E2);
  }
  async _onClick() {
    O.getState().pushRoute("/lnbits");
  }
};
$a = I([K("bc-lnbits-connector")], $a);
const Uo = "LNbits NWC Plugin";
let Na, Ba = class extends Be {
  constructor() {
    super("lnbits", Uo, "#673ab7", E2);
  }
  async _onClick() {
    O.getState().pushRoute("/lnbits-nwc");
  }
};
Ba = I([K("bc-lnbits-nwc-connector")], Ba);
const ef = te(Na || (Na = ((e) => e)`<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M40 17.5H34.4V23.1H40V17.5Z" fill="#041011"/>
<path d="M16.7 0V5.6L27.8 8.9L22.2 0H16.7Z" fill="#041011"/>
<path d="M29.4 35H35L36.7 25L29.4 29.4V35Z" fill="#041011"/>
<path d="M35 5H29.4V10.6L36.1 16.1L35 5Z" fill="#041011"/>
<path d="M16.7 40H22.2L27.8 29.4L16.7 34.4V40Z" fill="#041011"/>
<path d="M5 29.4V35H10.6L22.2 26.7L5 29.4Z" fill="#041011"/>
<path d="M18.9 18.6L5.6 17.5H0V23.1H5.6L18.9 18.6Z" fill="#041011"/>
<path d="M10.6 5H5V10.6L21.1 12.8L10.6 5Z" fill="#041011"/>
</svg>
`)), tf = "LN Link";
let Ua, Ia = class extends Be {
  constructor() {
    super("nwc.generic", tf, "#ffffff", ef);
  }
  async _onClick() {
    O.getState().pushRoute("/lnfi");
  }
};
Ia = I([K("bc-lnfi-nwc-connector")], Ia);
const nf = te(Ua || (Ua = ((e) => e)`<svg width="48" height="48" viewBox="0 0 19.05 19.05" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffffff"/><g transform="translate(46.987939,-145.34756)"><path fill-rule="evenodd" clip-rule="evenodd" d="m -37.462939,146.46815 c -4.641638,0 -8.404413,3.76277 -8.404413,8.40441 0,4.64164 3.762775,8.40441 8.404413,8.40441 4.641638,0 8.40441,-3.76277 8.40441,-8.40441 0,-4.64164 -3.762772,-8.40441 -8.40441,-8.40441 z m -9.525,8.40441 c 0,-5.26053 4.264475,-9.525 9.525,-9.525 5.260525,0 9.525,4.26447 9.525,9.525 0,5.26053 -4.264475,9.525 -9.525,9.525 -5.260525,0 -9.525,-4.26447 -9.525,-9.525 z" fill="#000000"/><path fill-rule="evenodd" clip-rule="evenodd" d="m -37.462939,160.84902 c 3.300703,0 5.976461,-2.67576 5.976461,-5.97646 0,-3.30073 -2.675758,-5.97649 -5.976461,-5.97649 -3.300704,0 -5.976461,2.67576 -5.976461,5.97649 0,3.3007 2.675757,5.97646 5.976461,5.97646 z m 0,-1.21396 c 2.630249,0 4.7625,-2.13225 4.7625,-4.7625 0,-2.63025 -2.132251,-4.7625 -4.7625,-4.7625 -2.630249,0 -4.7625,2.13225 -4.7625,4.7625 0,2.63025 2.132251,4.7625 4.7625,4.7625 z" fill="#000000"/><path fill-rule="evenodd" clip-rule="evenodd" d="m -37.462913,151.4062 c 0,0 -2.6e-5,0 -2.6e-5,0 -1.914419,0 -3.466359,1.55194 -3.466359,3.46636 0,1.91442 1.55194,3.46636 3.466359,3.46636 0,0 2.6e-5,0 2.6e-5,0 z" fill="#000000"/></g></svg>`)), rf = "Coinos";
let Oa, Pa = class extends Be {
  constructor() {
    super("nwc.coinos", rf, "#ffffff", nf);
  }
  async _onClick() {
    try {
      var e;
      const t = O.getState().bitcoinConnectConfig.providerConfig, n = await dt.fromAuthorizationUrl("https://coinos.io/apps/new", Pe({}, (t == null || (e = t.nwc) == null ? void 0 : e.authorizationUrlOptions) || {}, { name: this._appName }));
      n.close(), await O.getState().connect({ nwcUrl: n.nostrWalletConnectUrl, connectorName: "Coinos", connectorType: "nwc.coinos" });
    } catch (t) {
      console.error(t), alert("" + t);
    }
  }
};
Pa = I([K("bc-coinos-connector")], Pa);
const of = te(Oa || (Oa = ((e) => e)`<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 20630 20630" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,20630.000000) scale(1.000000,-1.000000)"><path fill="black" d="M5645 20623 c-856 -42 -1650 -251 -2395 -629 -502 -254 -897 -527 -1325 -915 -1015 -920 -1688 -2201 -1869 -3559 -54 -403 -51 -132 -51 -5210 0 -4938 -1 -4788 41 -5125 189 -1512 946 -2882 2129 -3850 353 -290 711 -519 1140 -730 714 -352 1468 -548 2295 -595 239 -13 9171 -13 9410 0 1083 62 2073 388 2960 975 885 585 1587 1388 2056 2350 323 662 507 1339 576 2115 19 216 19 9504 0 9730 -67 784 -266 1498 -606 2179 -566 1130 -1469 2042 -2591 2617 -701 359 -1348 545 -2205 636 -88 9 -1206 12 -4810 13 -2582 1 -4722 0 -4755 -2z"/><path fill="white" d="M13504 11628 l2333 -3 -3181 -3813 -3181 -3813 -3 2540 -2 2541 -2336 0 c-1285 0 -2334 4 -2332 8 2 4 1434 1723 3183 3820 l3180 3811 3 -2544 2 -2545 2334 -2z"/></g></svg>`)), sf = "Flash Wallet";
let Ha, Za = class extends Be {
  constructor() {
    super("nwc.flash", sf, "#000000", of);
  }
  async _onClick() {
    O.getState().pushRoute("/flash-wallet");
  }
};
Za = I([K("bc-flash-connector")], Za);
const af = te(Ha || (Ha = ((e) => e)`<svg class="w-12 h-12" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="17.2816" height="20" fill="url(#pattern0_6321_527)"/>
<defs>
<pattern id="pattern0_6321_527" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_6321_527" transform="matrix(0.00248348 0 0 0.00214592 0.08 0.05)"/>
</pattern>
<image id="image0_6321_527" width="404" height="404" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>
`)), Io = "Rizful";
let Wa = class extends Be {
  constructor() {
    super("nwc.rizful", Io, "#000000", af);
  }
  async _onClick() {
    O.getState().pushRoute("/rizful");
  }
};
Wa = I([K("bc-rizful-connector")], Wa);
let Da, Fa, Va, Ga, ja, za, qa, Ka, Qa, Ja, Ya, Xa, ec, tc, Se = (e) => e, Kr = class extends re()(Y) {
  constructor() {
    super(...arguments), this._showAll = !1;
  }
  render() {
    const e = [];
    return e.push({ order: 0, result: T(Da || (Da = Se`<bc-alby-hub-connector></bc-alby-hub-connector>`)) }), e.push({ order: 0, result: T(Fa || (Fa = Se`<bc-coinos-connector></bc-coinos-connector>`)) }), e.push({ order: 0, result: T(Va || (Va = Se`<bc-flash-connector></bc-flash-connector>`)) }), e.push({ order: 0, result: T(Ga || (Ga = Se`<bc-cashu-me-connector></bc-cashu-me-connector>`)) }), this._filters && this._filters.indexOf("nwc") > -1 && e.push({ order: 0, result: T(ja || (ja = Se`<bc-lnbits-nwc-connector></bc-lnbits-nwc-connector>`)) }), e.push({ order: 0, result: T(za || (za = Se`<bc-rizful-connector></bc-rizful-connector>`)) }), e.push({ order: 0, result: T(qa || (qa = Se`<bc-nwc-connector></bc-nwc-connector>`)) }), e.push({ order: 10, result: T(Ka || (Ka = Se`<bc-lnfi-nwc-connector></bc-lnfi-nwc-connector>`)) }), this._filters && this._filters.indexOf("nwc") !== -1 || (window.webln && e.push({ order: 0, result: T(Qa || (Qa = Se`<bc-extension-connector></bc-extension-connector>`)) }), e.push({ order: 7, result: T(Ja || (Ja = Se`<bc-lnbits-connector></bc-lnbits-connector>`)) }), e.push({ order: 9, result: T(Ya || (Ya = Se`<bc-lnc-connector></bc-lnc-connector>`)) })), e.sort((t, n) => t.order - n.order), T(Xa || (Xa = Se`
      <div>
        <div
          class="flex justify-center items-start flex-wrap gap-5 ${0}"
        >
          ${0}
        </div>
        ${0}
      </div>
    `), this._showAll ? "max-h-96 overflow-y-auto" : "", (this._showAll ? e : e.slice(0, 9)).map((t) => t.result), !this._showAll && e.length > 9 ? T(ec || (ec = Se`<div class="text-center">
              <button
                class="${0} text-xs font-medium mt-8 ${0}"
                aria-label="Show all ${0} wallet connectors"
                @click=${0}
              >
                show all (${0})
              </button>
            </div> `), ve, q, e.length, this._toggleShowAll, e.length) : null);
  }
  _toggleShowAll() {
    this._showAll = !0;
  }
};
I([J()], Kr.prototype, "_showAll", void 0), Kr = I([K("bc-connector-list")], Kr);
const cf = te(tc || (tc = ((e) => e)`
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6">
<path d="M11.25 20.25H4.75C4.19772 20.25 3.75 19.8023 3.75 19.25L3.75 4.75C3.75 4.19772 4.19772 3.75 4.75 3.75L11.25 3.75" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20.25 12L9 12M20.25 12L15.75 16.5M20.25 12L15.75 7.5" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="hover-right"/>
</svg>`));
let nc, rc, oc = (e) => e;
function Ii(e) {
  return T(nc || (nc = oc`<div class="mt-12">
    ${0}

    <bci-button
      @click=${0}
      ghost
      variant="neutral"
      class=${0}
    >
      ${0}
      <span class="text-sm ${0}"
        >Disconnect</span
      >
    </bci-button>
  </div>`), e ? T(rc || (rc = oc`<span class="text-xs mb-1 ${0}"
          >Connected through
          <span class="font-bold">${0}</span></span
        >`), q, e) : null, lf, $o, cf, Ze);
}
function lf() {
  O.getState().setModalOpen(!1), setTimeout(() => {
    O.getState().disconnect();
  }, 200);
}
const ic = (e) => String.fromCodePoint(...e.split("").map((t) => 127397 + t.toUpperCase().charCodeAt(0)));
let sc, Qr, ac, cc, lc, dc, Tn = (e) => e, Mn = (Qr = class extends (sc = re()(Y)) {
  constructor() {
    super(), this._isSwitchingCurrency = !1, this._selectedCurrency = O.getState().currency, O.subscribe((e) => {
      this._selectedCurrency = e.currency;
    });
  }
  render() {
    if (!this._isSwitchingCurrency) return T(ac || (ac = Tn`<div class="flex justify-center items-center gap-2">
        <button
          class="${0}"
          aria-label="Switch currency (current: ${0})"
          @click=${0}
        >
          <slot></slot>
        </button>
      </div>`), ve, this._selectedCurrency || "sats", this._showSelectVisibility);
    const e = (() => {
      const n = [{ name: "SATS", value: "sats", flag: "₿" }, { name: "BTC", value: "BTC", flag: "₿" }, { name: "USD", value: "USD", flag: ic("US") }, { name: "EUR", value: "EUR", flag: "🇪🇺" }];
      return n.push(...Object.entries({ JP: "JPY", CN: "CNY", GB: "GBP", CH: "CHF", IN: "INR", AE: "AED", AF: "AFN", AL: "ALL", DZ: "DZD", AO: "AOA", AR: "ARS", AM: "AMD", AW: "AWG", AU: "AUD", AZ: "AZN", BS: "BSD", BH: "BHD", BD: "BDT", BB: "BBD", BY: "BYN", BZ: "BZD", BM: "BMD", BT: "BTN", BO: "BOB", BA: "BAM", BW: "BWP", BR: "BRL", BN: "BND", BG: "BGN", BI: "BIF", CV: "CVE", KH: "KHR", CA: "CAD", KY: "KYD", CF: "XAF", CL: "CLP", CO: "COU", KM: "KMF", CD: "CDF", CR: "CRC", CU: "CUC", CW: "ANG", CZ: "CZK", DK: "DKK", DJ: "DJF", DM: "XCD", DO: "DOP", EG: "EGP", ER: "ERN", ET: "ETB", FJ: "FJD", PF: "XPF", GM: "GMD", GE: "GEL", GH: "GHS", GI: "GIP", GT: "GTQ", GN: "GNF", GY: "GYD", HN: "HNL", HK: "HKD", HU: "HUF", IS: "ISK", ID: "IDR", IR: "XDR", IQ: "IQD", IL: "ILS", JM: "JMD", JO: "JOD", KZ: "KZT", KE: "KES", KR: "KRW", KW: "KWD", KG: "KGS", LA: "LAK", LB: "LBP", LR: "LRD", LY: "LYD", MO: "MOP", MG: "MGA", MW: "MWK", MY: "MYR", MV: "MVR", MR: "MRU", MU: "MUR", MX: "MXN", MD: "MDL", MN: "MNT", MA: "MAD", MZ: "MZN", MM: "MMK", NP: "NPR", NZ: "NZD", NI: "NIO", NE: "XOF", NG: "NGN", MK: "MKD", NO: "NOK", OM: "OMR", PK: "PKR", PG: "PGK", PY: "PYG", PE: "PEN", PH: "PHP", PL: "PLN", QA: "QAR", RO: "RON", RU: "RUB", RW: "RWF", SH: "SHP", WS: "WST", ST: "STN", SA: "SAR", RS: "RSD", SC: "SCR", SL: "SLL", SG: "SGD", SB: "SBD", SO: "SOS", ZA: "ZAR", SS: "SSP", LK: "LKR", SD: "SDG", SR: "SRD", SE: "SEK", SY: "SYP", TW: "TWD", TJ: "TJS", TZ: "TZS", TH: "THB", TO: "TOP", TT: "TTD", TN: "TND", TR: "TRY", TM: "TMT", UG: "UGX", UA: "UAH", UY: "UYU", UZ: "UZS", VU: "VUV", VN: "VND", YE: "YER", ZM: "ZMW", ZW: "ZWL" }).map(([r, o]) => ({ name: r, value: o, flag: ic(r) }))), n;
    })(), t = this._selectedCurrency || "sats";
    return T(cc || (cc = Tn`<div
      class="h-48 overflow-y-scroll px-4 grid grid-cols-2 gap-3 currencies-list -mb-10"
      role="list"
      aria-label="Available currencies"
    >
      ${0}
    </div>`), e.map((n) => T(lc || (lc = Tn`
          <button
            class="${0} flex items-center justify-center py-2 px-4 hover:text-white hover:bg-blue-500 rounded-lg hover:border-blue-500 cursor-pointer"
            aria-label="Select ${0} currency"
            aria-pressed="${0}"
            @click=${0}
          >
            <span class="text-orange-400 inline-block mr-2 text-xl"
              >${0}</span
            ><span class="text-xl">${0}</span>
          </button>
        `), t === n.value ? "bg-blue-500 text-white" : "", n.value, t === n.value, () => this._selectCurrency(n.value), n.flag, n.value)));
  }
  _showSelectVisibility() {
    this._isSwitchingCurrency = !0;
  }
  _selectCurrency(e) {
    O.getState().setCurrency(e), this._isSwitchingCurrency = !1;
  }
}, Qr.styles = [...sc.styles, yr(dc || (dc = Tn`
      .currencies-list {
        mask-image: linear-gradient(
          to bottom,
          black calc(100% - 96px),
          transparent 100%
        );
      }
      /* width */
      ::-webkit-scrollbar {
        width: 6px;
        height: 18px;
      }

      /* Track */
      ::-webkit-scrollbar-track {
        background: #66666666;
      }

      /* Handle */
      ::-webkit-scrollbar-thumb {
        background: #888;
      }

      /* Handle on hover */
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `))], Qr);
I([J()], Mn.prototype, "_isSwitchingCurrency", void 0), I([J()], Mn.prototype, "_selectedCurrency", void 0), Mn = I([K("bc-currency-switcher")], Mn);
let uc, hc, fc, pc, gc, wc, en = (e) => e, Jr = class extends re()(Y) {
  constructor() {
    super(), this._showBalance = void 0, this._showBalance = O.getState().bitcoinConnectConfig.showBalance && O.getState().supports("getBalance"), O.subscribe((e) => {
      this._showBalance = e.bitcoinConnectConfig.showBalance && e.supports("getBalance");
    });
  }
  render() {
    return T(uc || (uc = en`<div
      class="flex flex-col justify-center items-center w-full font-sans"
    >
      ${0}
    </div>`), this._connected ? T(hc || (hc = en`
            ${0}
            ${0}
          `), T(this._showBalance ? fc || (fc = en`<span
                    class="text-xs font-medium mb-2 ${0}"
                    >Balance</span
                  >
                  <bc-currency-switcher>
                    <bc-balance class="text-2xl"></bc-balance>
                  </bc-currency-switcher>`) : pc || (pc = en` <span
                  class="text-lg font-medium mt-4 -mb-4 ${0}"
                  >Wallet Connected</span
                >`), q), Ii(this._connectorName)) : T(gc || (gc = en`
            <h1
              class="my-8 ${0} w-64 max-w-full text-center"
              role="heading"
              aria-level="1"
            >
              How would you like to
              connect${0}?
            </h1>

            <bc-connector-list></bc-connector-list>

            <div class="flex flex-col items-center w-full font-sans text-sm">
              <p class="mt-8 ${0} text-center">
                Don't have a bitcoin lightning wallet?
                <button
                  class="font-bold ${0} ${0}"
                  aria-label="Get a bitcoin lightning wallet"
                  @click=${0}
                >
                  Get one here
                </button>
              </p>
            </div>
          `), mn, this._appName && this._appName !== vo.appName ? `
to ${this._appName}` : "", mn, ve, de, () => O.getState().pushRoute("/new-wallet")));
  }
};
I([J()], Jr.prototype, "_showBalance", void 0), Jr = I([K("bc-start")], Jr);
const df = te(wc || (wc = ((e) => e)`<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7">
<path d="M14.2929 16L10.6464 12.3536C10.4512 12.1583 10.4512 11.8417 10.6464 11.6464L14.2929 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`));
let mc, yc, uf = (e) => e, Yr = class extends re()(Y) {
  constructor() {
    super(...arguments), this._goBack = () => {
      O.getState().popRoute(), O.getState().setError(void 0);
    };
  }
  render() {
    return T(mc || (mc = uf`<div
      class="flex justify-center items-center gap-2 w-full relative pb-4"
    >
      <div class="absolute left-8 h-full flex items-center justify-center">
        <button
          class="${0} ${0}"
          @click=${0}
          aria-label="Go back"
          title="Go back"
        >
          ${0}
        </button>
      </div>
      <div class="font-sans font-medium ${0}">
        ${0}
      </div>
    </div>`), ve, Ze, this._goBack, df, mn, this.heading);
  }
};
I([ue()], Yr.prototype, "heading", void 0), Yr = I([K("bc-navbar")], Yr);
const bc = te(yc || (yc = ((e) => e)`<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.5 6H6.1C5.53995 6 5.25992 6 5.04601 6.10899C4.85785 6.20487 4.70487 6.35785 4.60899 6.54601C4.5 6.75992 4.5 7.03995 4.5 7.6V18.4C4.5 18.9601 4.5 19.2401 4.60899 19.454C4.70487 19.6422 4.85785 19.7951 5.04601 19.891C5.25992 20 5.53995 20 6.1 20H16.9C17.4601 20 17.7401 20 17.954 19.891C18.1422 19.7951 18.2951 19.6422 18.391 19.454C18.5 19.2401 18.5 18.9601 18.5 18.4V15" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14.5 4H20.5M20.5 4V10M20.5 4L11.5 13" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="hover-right-up"/>
</svg>`));
let vc, Cc, xc, Ec = (e) => e;
function A2(e) {
  const t = `border-t ${Ni} ${e ? "w-24" : "w-full"}`;
  return T(vc || (vc = Ec`<div
    class="w-full px-8 flex gap-4 justify-center items-center opacity-60 dark:opacity-60"
  >
    <hr class=${0} />
    ${0}
  </div>`), t, e ? T(Cc || (Cc = Ec`
          <span class=${0}>${0}</span>
          <hr class=${0} />
        `), Ze, e, t) : null);
}
const hf = te(xc || (xc = ((e) => e)`<svg width="49" height="24" viewBox="0 0 49 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 -my-4">
<ellipse opacity="0.1" cx="7.70773" cy="21.5226" rx="3.4509" ry="0.637088" fill="black"/>
<path d="M11.0342 18.4211C12.817 18.4211 13.6285 14.4735 13.6285 12.9767C13.6285 11.8101 12.8235 11.103 11.7652 11.103C10.7135 11.103 9.85965 11.5553 9.84905 12.1153C9.84902 13.5933 9.5889 18.4211 11.0342 18.4211Z" fill="white" stroke="currentColor" stroke-width="0.530907"/>
<path d="M4.52264 18.4211C2.73985 18.4211 1.9284 14.4735 1.9284 12.9767C1.9284 11.8101 2.7334 11.103 3.79171 11.103C4.84341 11.103 5.69723 11.5553 5.70784 12.1153C5.70786 13.5933 5.96799 18.4211 4.52264 18.4211Z" fill="white" stroke="currentColor" stroke-width="0.530907"/>
<mask id="path-4-inside-1_362_874" fill="white">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.6445 12.5235C12.6735 12.2374 12.352 12.0646 12.1046 12.2113C10.8114 12.9776 9.30208 13.4175 7.68997 13.4175C6.09291 13.4175 4.59668 12.9858 3.31165 12.2326C3.06376 12.0873 2.74334 12.2612 2.77318 12.547C2.9933 14.6548 4.14156 16.4192 5.71508 17.2405C6.15438 17.4698 6.46173 17.8751 6.77033 18.282C7.0197 18.6108 7.26988 18.9407 7.59116 19.1797C7.62857 19.2075 7.66755 19.2222 7.70759 19.2222C7.74762 19.2222 7.78658 19.2075 7.82397 19.1797C8.14538 18.9407 8.39562 18.6108 8.64504 18.2819C8.9536 17.875 9.26091 17.4698 9.70016 17.2405C11.2796 16.4162 12.4305 14.6418 12.6445 12.5235Z"/>
</mask>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.6445 12.5235C12.6735 12.2374 12.352 12.0646 12.1046 12.2113C10.8114 12.9776 9.30208 13.4175 7.68997 13.4175C6.09291 13.4175 4.59668 12.9858 3.31165 12.2326C3.06376 12.0873 2.74334 12.2612 2.77318 12.547C2.9933 14.6548 4.14156 16.4192 5.71508 17.2405C6.15438 17.4698 6.46173 17.8751 6.77033 18.282C7.0197 18.6108 7.26988 18.9407 7.59116 19.1797C7.62857 19.2075 7.66755 19.2222 7.70759 19.2222C7.74762 19.2222 7.78658 19.2075 7.82397 19.1797C8.14538 18.9407 8.39562 18.6108 8.64504 18.2819C8.9536 17.875 9.26091 17.4698 9.70016 17.2405C11.2796 16.4162 12.4305 14.6418 12.6445 12.5235Z" fill="#FFDF6F"/>
<path d="M5.71508 17.2405L5.96074 16.7698L5.71508 17.2405ZM6.77033 18.282L6.34731 18.6028H6.34731L6.77033 18.282ZM7.59116 19.1797L7.27429 19.6057L7.27429 19.6057L7.59116 19.1797ZM7.82397 19.1797L8.14076 19.6058L8.14076 19.6058L7.82397 19.1797ZM8.64504 18.2819L8.22202 17.9611L8.22202 17.9611L8.64504 18.2819ZM9.70016 17.2405L9.94582 17.7112H9.94582L9.70016 17.2405ZM12.1046 12.2113L12.3752 12.668L12.1046 12.2113ZM12.6445 12.5235L12.1163 12.4702L12.6445 12.5235ZM11.8339 11.7545C10.6205 12.4737 9.20424 12.8866 7.68997 12.8866V13.9484C9.39992 13.9484 11.0024 13.4815 12.3752 12.668L11.8339 11.7545ZM7.68997 12.8866C6.18981 12.8866 4.78593 12.4813 3.5801 11.7746L3.0432 12.6907C4.40743 13.4902 5.996 13.9484 7.68997 13.9484V12.8866ZM2.24515 12.6022C2.48098 14.8605 3.71574 16.7958 5.46941 17.7111L5.96074 16.7698C4.56738 16.0426 3.50562 14.4492 3.30122 12.4919L2.24515 12.6022ZM5.46941 17.7111C5.78479 17.8758 6.0236 18.1759 6.34731 18.6028L7.19335 17.9612C6.89987 17.5742 6.52397 17.0638 5.96074 16.7698L5.46941 17.7111ZM6.34731 18.6028C6.58755 18.9196 6.88185 19.3137 7.27429 19.6057L7.90804 18.7537C7.65791 18.5676 7.45184 18.302 7.19335 17.9612L6.34731 18.6028ZM7.27429 19.6057C7.38246 19.6861 7.5299 19.7531 7.70759 19.7531V18.6913C7.80519 18.6913 7.87468 18.7289 7.90803 18.7537L7.27429 19.6057ZM7.70759 19.7531C7.8852 19.7531 8.03259 19.6862 8.14076 19.6058L7.50719 18.7537C7.54057 18.7289 7.61005 18.6913 7.70759 18.6913V19.7531ZM8.14076 19.6058C8.53339 19.3138 8.82778 18.9195 9.06806 18.6027L8.22202 17.9611C7.96346 18.302 7.75738 18.5677 7.50719 18.7537L8.14076 19.6058ZM9.06806 18.6027C9.39174 18.1759 9.6305 17.8758 9.94582 17.7112L9.45451 16.7699C8.89133 17.0638 8.51547 17.5741 8.22202 17.9611L9.06806 18.6027ZM9.94582 17.7112C11.706 16.7925 12.9435 14.8462 13.1728 12.5769L12.1163 12.4702C11.9176 14.4373 10.8531 16.0399 9.45451 16.7699L9.94582 17.7112ZM3.5801 11.7746C3.28427 11.6012 2.93961 11.6167 2.67587 11.7666C2.40507 11.9206 2.20605 12.2278 2.24515 12.6022L3.30122 12.4919C3.30493 12.5275 3.29778 12.5713 3.27544 12.6121C3.25447 12.6503 3.22616 12.6752 3.20065 12.6897C3.15164 12.7176 3.09113 12.7188 3.0432 12.6907L3.5801 11.7746ZM12.3752 12.668C12.3274 12.6963 12.2669 12.6954 12.2177 12.6677C12.1921 12.6533 12.1637 12.6286 12.1426 12.5903C12.12 12.5496 12.1127 12.5057 12.1163 12.4702L13.1728 12.5769C13.2106 12.2021 13.0103 11.8954 12.7386 11.7425C12.4741 11.5936 12.1291 11.5796 11.8339 11.7545L12.3752 12.668Z" fill="black" mask="url(#path-4-inside-1_362_874)"/>
<ellipse cx="7.72545" cy="12.4621" rx="4.67198" ry="1.55733" fill="black" stroke="black" stroke-width="0.530907"/>
<path d="M3.97363 15.0811C3.97363 15.0811 6.27807 15.8597 7.76077 15.8597C9.24347 15.8597 11.5479 15.0811 11.5479 15.0811" stroke="black" stroke-width="0.530907" stroke-linecap="round"/>
<circle cx="1.05642" cy="1.05642" r="1.05642" transform="matrix(-1 0 0 1 4.38745 4.74609)" fill="black"/>
<path d="M3.15497 5.64404L5.12695 7.61603" stroke="black" stroke-width="0.528211"/>
<circle cx="11.9585" cy="5.80252" r="1.05642" fill="black"/>
<path d="M12.1522 5.64404L10.1802 7.61603" stroke="black" stroke-width="0.528211"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M3.63088 12.1065C3.0615 11.8354 2.73014 11.2267 2.84114 10.606C3.31755 7.94167 5.303 5.94336 7.67995 5.94336C10.0627 5.94336 12.052 7.95136 12.5222 10.6253C12.6316 11.2472 12.2975 11.8556 11.7262 12.1245C10.5037 12.6998 9.13817 13.0214 7.69756 13.0214C6.24199 13.0214 4.86309 12.6931 3.63088 12.1065Z" fill="#FFDF6F"/>
<path d="M12.5222 10.6253L12.7823 10.5796L12.5222 10.6253ZM11.7262 12.1245L11.8386 12.3635L11.7262 12.1245ZM2.84114 10.606L3.10112 10.6525L2.84114 10.606ZM3.63088 12.1065L3.7444 11.868L3.63088 12.1065ZM3.10112 10.6525C3.56146 8.07803 5.46436 6.20746 7.67995 6.20746V5.67925C5.14164 5.67925 3.07364 7.8053 2.58115 10.5595L3.10112 10.6525ZM7.67995 6.20746C9.90088 6.20746 11.8077 8.08716 12.2621 10.6711L12.7823 10.5796C12.2962 7.81556 10.2244 5.67925 7.67995 5.67925V6.20746ZM11.6137 11.8855C10.4257 12.4446 9.09849 12.7573 7.69756 12.7573V13.2855C9.17785 13.2855 10.5817 12.955 11.8386 12.3635L11.6137 11.8855ZM7.69756 12.7573C6.28209 12.7573 4.9419 12.4381 3.7444 11.868L3.51736 12.3449C4.78428 12.9481 6.20189 13.2855 7.69756 13.2855V12.7573ZM12.2621 10.6711C12.3498 11.1697 12.0828 11.6648 11.6137 11.8855L11.8386 12.3635C12.5122 12.0465 12.9134 11.3248 12.7823 10.5796L12.2621 10.6711ZM2.58115 10.5595C2.44814 11.3033 2.84611 12.0254 3.51736 12.3449L3.7444 11.868C3.2769 11.6455 3.01213 11.1501 3.10112 10.6525L2.58115 10.5595Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.64674 11.4442C4.18843 11.2575 3.91656 10.7699 4.07537 10.3012C4.56513 8.8558 5.99378 7.80981 7.67991 7.80981C9.36604 7.80981 10.7947 8.8558 11.2845 10.3012C11.4433 10.7699 11.1714 11.2575 10.7131 11.4442C9.777 11.8254 8.75299 12.0355 7.67991 12.0355C6.60684 12.0355 5.58282 11.8254 4.64674 11.4442Z" fill="black"/>
<ellipse cx="8.895" cy="10.0634" rx="0.880351" ry="0.704281" fill="white"/>
<ellipse cx="6.37474" cy="10.0639" rx="0.880351" ry="0.704281" fill="white"/>
<path d="M25.3078 11.6284L24.3574 9.04272L23.4489 11.6284H25.3078ZM23.1274 5.99577H25.6712L29.2213 15.3882L26.7195 15.6398L26.0346 13.6271H22.75L22.0931 15.5H19.5633L23.1274 5.99577ZM32.463 15.5H29.9193V5.78612L32.463 5.63238V15.5ZM35.1432 15.5H33.8573V5.78612L36.4011 5.63238V14.2281L35.1432 15.5ZM35.5765 11.3629L34.8637 9.72758C35.0314 9.52259 35.2457 9.32691 35.5066 9.14055C35.7768 8.94488 36.075 8.78647 36.4011 8.66534C36.7272 8.54421 37.0627 8.48364 37.4074 8.48364C38.0783 8.48364 38.6747 8.60943 39.1965 8.86102C39.7183 9.1126 40.1283 9.49929 40.4264 10.0211C40.7339 10.5429 40.8877 11.2091 40.8877 12.0198C40.8877 12.8211 40.7339 13.492 40.4264 14.0324C40.1283 14.5729 39.709 14.9782 39.1685 15.2484C38.6374 15.5186 38.0131 15.6537 37.2956 15.6537C37.0161 15.6537 36.7366 15.6118 36.457 15.528C36.1868 15.4441 35.9166 15.3136 35.6464 15.1366C35.3855 14.9502 35.1246 14.708 34.8637 14.4098L35.5765 12.9143C35.8467 13.1659 36.1123 13.3615 36.3732 13.5013C36.6341 13.6318 36.8856 13.697 37.1279 13.697C37.3422 13.697 37.5332 13.6318 37.701 13.5013C37.8687 13.3709 38.0038 13.1799 38.1063 12.9283C38.2088 12.6767 38.26 12.3785 38.26 12.0338C38.26 11.689 38.2088 11.4001 38.1063 11.1672C38.0131 10.9249 37.8733 10.7432 37.687 10.6221C37.5099 10.501 37.2863 10.4404 37.0161 10.4404C36.7925 10.4404 36.5642 10.5243 36.3312 10.692C36.0983 10.8597 35.8467 11.0833 35.5765 11.3629ZM43.4036 15.528L43.4595 15.3742L41.0275 9.14055L43.3757 8.46967L44.7594 12.5509L46.0592 8.72125H48.589L45.6119 16.2967C45.4722 16.6601 45.2439 16.9955 44.9271 17.303C44.6103 17.6105 44.2422 17.8714 43.8229 18.0857C43.4036 18.3 42.9703 18.4584 42.5231 18.5609L41.6705 16.5902C41.8941 16.497 42.1271 16.3945 42.3693 16.2827C42.6209 16.1709 42.8445 16.0498 43.0402 15.9193C43.2359 15.7889 43.357 15.6584 43.4036 15.528Z" fill="currentColor"/>
</svg>
`));
let Ac, ff = (e) => e, kc = class extends re()(Y) {
  render() {
    return T(Ac || (Ac = ff`<div>
      <bc-navbar class="flex w-full" heading="About"></bc-navbar>
      <div class="font-sans text-sm w-full">
        <div class="px-8">
          <div class="font-bold mb-1 ${0}">
            How does it work?
          </div>
          <p class="mb-2 ${0}">
            Bitcoin Connect is a way to connect to your lightning wallet from
            any browser.
          </p>
          <div class="flex flex-col gap-3 ${0}">
            <p>
              💾 Your connection is saved in local storage, so next time you
              visit the site will connect automatically.
            </p>
            <p>
              💸 Make sure to set budgets and permissions for sites you do not
              trust.
            </p>
          </div>
        </div>

        <div class="flex gap-4 w-full my-6 px-8">
          <a
            href="https://bitcoin-connect.com"
            target="_blank"
            class="${0} flex-1"
            aria-label="Learn more about Bitcoin Connect (opens in new tab)"
          >
            <bci-button tabindex="-1">
              <span class="${0}">Learn more</span>
              ${0}
            </bci-button>
          </a>
          <a
            href="https://github.com/getAlby/bitcoin-connect"
            target="_blank"
            class="${0} flex-1"
            aria-label="Use Bitcoin Connect on GitHub (opens in new tab)"
          >
            <bci-button tabindex="-1">
              <span class="${0}">Use it</span>
              ${0}
            </bci-button>
          </a>
        </div>
        ${0}
        <div
          class="flex w-full justify-center items-center mt-4 gap-1 font-sans"
        >
          <span class="block ${0}"
            >Made with love by</span
          >
          <span class="${0}"> ${0} </span>
        </div>
      </div>
    </div>`), de, q, q, $o, de, bc, $o, de, bc, A2(), Ze, ze, hf);
  }
};
kc = I([K("bc-help")], kc);
let Sc, _c, pf = (e) => e, Xr = class extends re()(Y) {
  constructor() {
    super(...arguments), this._nwcUrl = "";
  }
  render() {
    return T(Sc || (Sc = pf`<div class="w-full">
      <bc-navbar class="flex w-full" heading="Nostr Wallet Connect"></bc-navbar>
      <div class="font-sans text-sm w-full">
        <div class="px-8 pt-4 w-full">
          <div class="mb-1 ${0}">
            Enter your
            <a
              href="https://nwc.getalby.com/about"
              target="_blank"
              class="font-bold"
              >Connection Secret
            </a>
            below
          </div>

          <input
            value=${0}
            @change=${0}
            placeholder="nostr+walletconnect://..."
            type="password"
            class="w-full mb-8 rounded-lg p-2 border-1 bg-transparent ${0} ${0}"
          />
          <bci-button variant="primary" @click=${0}>
            Connect
          </bci-button>
        </div>
      </div>
    </div>`), q, this._nwcUrl, this.nwcUrlChanged, St, ze, this.onConnect);
  }
  nwcUrlChanged(e) {
    this._nwcUrl = e.target.value;
  }
  async onConnect() {
    this._nwcUrl ? await O.getState().connect({ nwcUrl: this._nwcUrl, connectorName: Ui, connectorType: "nwc.generic" }) : O.getState().setError("Please enter a URL");
  }
};
I([J()], Xr.prototype, "_nwcUrl", void 0), Xr = I([K("bc-nwc")], Xr);
const gf = te(_c || (_c = ((e) => e)`<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 19C4.73858 19 2.5 16.7614 2.5 14C2.5 11.4673 4.38316 9.37436 6.82568 9.04508C7.63649 6.69118 9.87075 5 12.5 5C15.8137 5 18.5 7.68629 18.5 11C20.7091 11 22.5 12.7909 22.5 15C22.5 17.2091 20.7091 19 18.5 19H7.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`));
let Lc;
const wf = te(Lc || (Lc = ((e) => e)`<svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" fill="none"><path fill="currentColor" d="M18.048 15.842a4.588 4.588 0 0 0-1.202-4.359l-1.35-1.356c-.25-.251-.582-.39-.936-.39h-.003c-.352 0-.683.136-.932.383l-.534.529a.126.126 0 0 1-.178 0l-1.519-1.516a.834.834 0 0 0-1.42.588c0 .222.086.431.243.588l1.514 1.511c.05.05.05.13 0 .18l-.97.963a.127.127 0 0 1-.178 0l-1.52-1.517a.834.834 0 0 0-1.42.588c0 .222.086.431.244.588L9.4 14.134c.05.05.05.13 0 .18l-.442.437c-.251.25-.39.58-.391.933-.001.353.135.685.385.935l1.35 1.357a4.597 4.597 0 0 0 2.247 1.245 4.64 4.64 0 0 0 2.17-.031l2.266 2.262c.367.367.856.568 1.377.568.52 0 1.007-.2 1.373-.565l.59-.586c.369-.366.572-.855.572-1.374.001-.52-.201-1.008-.57-1.376l-2.28-2.277Zm-1.405.948 2.508 2.505a.279.279 0 0 1 0 .397l-.59.585a.283.283 0 0 1-.398 0l-2.495-2.492a1.109 1.109 0 0 0-.79-.326c-.123 0-.246.02-.365.06-.514.172-1.065.2-1.595.08a2.934 2.934 0 0 1-1.434-.794l-.885-.89a.316.316 0 0 1 .002-.448l.655-.65.42-.418 1.576-1.565.334-.334.745-.737a.316.316 0 0 1 .447.001l.886.891a2.93 2.93 0 0 1 .709 2.992c-.133.406-.03.844.27 1.143Z"/><path fill="currentColor" d="M14.96 21.397a.759.759 0 0 0-1.07-.001 1.829 1.829 0 0 1-2.584-.006L2.73 12.772a1.829 1.829 0 0 1 .006-2.583l6.295-6.271a1.814 1.814 0 0 1 1.288-.532h.004c.488 0 .946.192 1.29.538l7.538 7.544a.821.821 0 0 0 .585.242.827.827 0 0 0 .587-1.407l-7.658-7.72-.011-.011a3.51 3.51 0 0 0-2.432-.883 3.511 3.511 0 0 0-2.39 1.026L1.538 8.986A3.5 3.5 0 0 0 .5 11.476a3.501 3.501 0 0 0 1.026 2.493l8.576 8.618a3.502 3.502 0 0 0 2.49 1.038h.01c.938 0 1.82-.365 2.486-1.027a.752.752 0 0 0 .223-.535.752.752 0 0 0-.222-.537l-.13-.13Z"/><path fill="currentColor" d="m24.286 10.688-2.928-8.631-.006-.019-.023-.05A2.731 2.731 0 0 0 20.482.93a2.79 2.79 0 0 0-2.469-.442c-.44.132-.832.368-1.162.7l-1.224 1.23a.844.844 0 0 0-.248.593.844.844 0 0 0 .24.596c.16.165.375.256.605.258h.005a.843.843 0 0 0 .602-.25l1.224-1.23c.25-.252.595-.361.945-.298.345.061.627.276.777.59l2.912 8.588.003.01.004.01c.07.183.105.375.105.571 0 .427-.166.828-.469 1.13l-2.006 1.997a.843.843 0 0 0-.25.6.847.847 0 0 0 1.449.602l2.006-1.997a3.276 3.276 0 0 0 .969-2.332c0-.4-.072-.794-.214-1.168Z"/></svg>`));
let Tc;
const mf = te(Tc || (Tc = ((e) => e)`<svg width="25" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.432 0h.136c1.702 0 3.074 0 4.153.143 1.12.15 2.063.468 2.812 1.209.75.74 1.071 1.673 1.222 2.781.145 1.067.145 2.424.145 4.107v7.52c0 1.683 0 3.04-.145 4.107-.15 1.107-.473 2.04-1.222 2.781-.749.74-1.692 1.06-2.812 1.209-1.08.143-2.45.143-4.153.143h-.136c-1.702 0-3.074 0-4.153-.143-1.12-.15-2.063-.468-2.812-1.209-.75-.74-1.071-1.674-1.222-2.781C4.1 18.8 4.1 17.443 4.1 15.76V8.24c0-1.683 0-3.04.145-4.107.15-1.108.473-2.04 1.222-2.781C6.216.612 7.159.292 8.279.143 9.358 0 10.73 0 12.432 0ZM6.787 2.657c.344-.34.828-.562 1.74-.684.94-.125 2.187-.127 3.973-.127s3.032.002 3.972.127c.913.122 1.397.344 1.741.684.345.34.57.82.692 1.722.126.93.128 2.162.128 3.929v7.384c0 1.767-.002 3-.128 3.929-.123.903-.347 1.381-.692 1.722-.344.34-.828.562-1.74.684-.94.125-2.187.127-3.973.127s-3.032-.002-3.972-.127c-.913-.122-1.397-.344-1.741-.684-.345-.34-.57-.82-.692-1.722-.126-.93-.128-2.162-.128-3.929V8.308c0-1.767.002-3 .128-3.929.123-.903.347-1.381.692-1.722Z" fill="currentColor"/><path d="M9.078 19.361c0-.497.418-.9.933-.9h4.978c.515 0 .933.403.933.9s-.418.9-.933.9H10.01c-.515 0-.933-.403-.933-.9Z" fill="currentColor"/></svg>`));
let Mc, Rc, yf = (e) => e, $c = class extends re()(Y) {
  render() {
    return T(Mc || (Mc = yf`<div class="w-full">
      <bc-navbar
        class="flex w-full"
        heading=${0}
      ></bc-navbar>
      <div class="font-sans text-sm w-full">
        <div
          class="px-8 pt-4 w-full flex flex-col items-center justify-center gap-4"
        >
          <div class="mb-2 ${0}">
            Choose how to connect
          </div>

          <bci-button @click=${0} class="w-full">
            ${0}
            <span class="${0}">Alby Cloud</span>
          </bci-button>

          <bci-button @click=${0} class="w-full">
            ${0}
            <span class="${0}">Alby Go</span>
          </bci-button>

          <bci-button @click=${0} class="w-full">
            ${0}
            <span class="${0}"
              >Connection Secret</span
            >
          </bci-button>
        </div>
      </div>
    </div>`), "Connect " + x2, q, this.onClickAlbyCloud, gf, de, this.onClickAlbyGo, mf, de, this.onClickConnectionSecret, wf, de);
  }
  async onClickAlbyCloud() {
    try {
      var e;
      const t = O.getState().bitcoinConnectConfig.providerConfig, n = await dt.fromAuthorizationUrl("https://my.albyhub.com/apps/new", Pe({}, (t == null || (e = t.nwc) == null ? void 0 : e.authorizationUrlOptions) || {}, { name: this._appName }));
      n.close(), await O.getState().connect({ nwcUrl: n.nostrWalletConnectUrl, connectorName: "Alby Hub", connectorType: "nwc.albyhub" });
    } catch (t) {
      console.error(t), alert("" + t);
    }
  }
  async onClickConnectionSecret() {
    O.getState().pushRoute("/nwc");
  }
  async onClickAlbyGo() {
    O.getState().pushRoute("/alby-go");
  }
};
$c = I([K("bc-alby-hub")], $c);
const Oi = te(Rc || (Rc = ((e) => e)`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.4962 11.2367C11.7716 11.1782 12.0214 11.0339 12.2098 10.8247C12.424 10.5868 12.5206 10.2261 12.7139 9.50486L13.6802 5.89873C13.8734 5.17744 13.9701 4.81679 13.9035 4.50368C13.845 4.22827 13.7007 3.97845 13.4915 3.79004C13.2536 3.57585 12.893 3.47921 12.1717 3.28594L8.56554 2.31969C7.84425 2.12642 7.4836 2.02978 7.17049 2.09633C6.89507 2.15488 6.64525 2.29911 6.45684 2.50836C6.24265 2.74624 6.14602 3.10689 5.95275 3.82818L5.5 5.50024" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
<path d="M11.0135 10.1009L10.0473 6.49473C9.85398 5.77344 9.75735 5.41279 9.54316 5.17491C9.35475 4.96566 9.10493 4.82142 8.82951 4.76288C8.5164 4.69633 8.15576 4.79296 7.43447 4.98623L3.82834 5.95249C3.10705 6.14576 2.7464 6.2424 2.50852 6.45659C2.29927 6.645 2.15504 6.89481 2.0965 7.17023C2.02994 7.48334 2.12658 7.84399 2.31985 8.56528L3.28611 12.1714C3.47938 12.8927 3.57601 13.2533 3.7902 13.4912C3.97861 13.7005 4.22843 13.8447 4.50385 13.9032C4.81696 13.9698 5.1776 13.8732 5.89889 13.6799L9.50502 12.7136C10.2263 12.5204 10.587 12.4237 10.8248 12.2095C11.0341 12.0211 11.1783 11.7713 11.2369 11.4959C11.3034 11.1828 11.2068 10.8221 11.0135 10.1009Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`));
let Nc;
const Pi = te(Nc || (Nc = ((e) => e)`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.33341 5.33341V4.80008C5.33341 4.05334 5.33341 3.67998 5.47874 3.39476C5.60657 3.14388 5.81054 2.9399 6.06143 2.81207C6.34664 2.66675 6.72001 2.66675 7.46675 2.66675H11.2001C11.9468 2.66675 12.3202 2.66675 12.6054 2.81207C12.8563 2.9399 13.0603 3.14388 13.1881 3.39476C13.3334 3.67998 13.3334 4.05334 13.3334 4.80008V8.53342C13.3334 9.28015 13.3334 9.65352 13.1881 9.93874C13.0603 10.1896 12.8563 10.3936 12.6054 10.5214C12.3202 10.6667 11.9468 10.6667 11.2001 10.6667H10.6667M10.6667 7.46675V11.2001C10.6667 11.9468 10.6667 12.3202 10.5214 12.6054C10.3936 12.8563 10.1896 13.0603 9.93874 13.1881C9.65352 13.3334 9.28015 13.3334 8.53342 13.3334H4.80008C4.05334 13.3334 3.67998 13.3334 3.39476 13.1881C3.14388 13.0603 2.9399 12.8563 2.81207 12.6054C2.66675 12.3202 2.66675 11.9468 2.66675 11.2001V7.46675C2.66675 6.72001 2.66675 6.34664 2.81207 6.06143C2.9399 5.81054 3.14388 5.60657 3.39476 5.47874C3.67998 5.33341 4.05334 5.33341 4.80008 5.33341H8.53342C9.28015 5.33341 9.65352 5.33341 9.93874 5.47874C10.1896 5.60657 10.3936 5.81054 10.5214 6.06143C10.6667 6.34664 10.6667 6.72001 10.6667 7.46675Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`));
let Bc, Uc, Ic = (e) => e, Rn = class extends re()(Y) {
  constructor() {
    super(), this._hasCopiedAuthString = !1, this.initAlbyGo();
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._unsub) == null || e.call(this);
  }
  render() {
    return T(Bc || (Bc = Ic`<div class="w-full">
      <bc-navbar class="flex w-full" heading="Connect Alby Hub with Alby Go"></bc-navbar>
      <div class="font-sans text-sm w-full">
        <div
          class="px-8 pt-4 w-full flex flex-col items-center justify-center gap-4"
        >
          <div class="mb-2 text-center ${0}">
            Scan with your camera, QR code scanner app, or from Alby Go -> Send
          </div>

          <div class="flex justify-center items-center">
            ${0}
            <p class="${0}">Waiting for connection</p>
          </div>

          ${0}
          
          <bci-button
            @click=${0}
            class="
flex gap-1 w-full
mt-4
${0} ${0} font-semibold text-xs"
          >
            ${0}
            ${0}
          </bci-button>
        </div>
        </div>
      </div>
    </div>`), q, _t(`w-7 h-7 ${q}`), q, this.renderQR(), this._copyAuthString, de, ve, this._hasCopiedAuthString ? Oi : Pi, this._hasCopiedAuthString ? "Copied!" : "Copy");
  }
  renderQR() {
    if (!this._authString) return null;
    const e = this._authString;
    return setTimeout(() => {
      var t;
      const n = (t = this.shadowRoot) == null ? void 0 : t.getElementById("qr");
      if (!n) return void console.error("qr canvas not found");
      const r = n.getContext("2d");
      if (!r) return void console.error("could not get context for qr canvas");
      const o = Po(0, "L");
      o.addData(e), o.make();
      const i = o.getModuleCount();
      n.width = 4 * i, n.height = 4 * i, o.renderTo2dContext(r, 4);
    }, 100), T(Uc || (Uc = Ic`
      <!-- add margin only on dark mode because on dark mode the qr has a white border -->
      <canvas id="qr" class="dark:bg-white dark:p-4"></canvas>
    `));
  }
  _copyAuthString() {
    this._authString && (navigator.clipboard.writeText(this._authString), this._hasCopiedAuthString = !0, setTimeout(() => {
      this._hasCopiedAuthString = !1;
    }, 2e3));
  }
  async initAlbyGo() {
    try {
      var e;
      const t = (e = O.getState().bitcoinConnectConfig.providerConfig) == null || (e = e.nwc) == null ? void 0 : e.authorizationUrlOptions, n = t?.expiresAt;
      let r = t?.requestMethods;
      r || (r = ["get_info", "get_balance", "get_budget", "pay_invoice", "list_transactions", "lookup_invoice", "make_invoice"]);
      const o = new j0({ name: this._appName, icon: this._appIcon, relayUrls: ["wss://relay.getalby.com/v1"], requestMethods: r, notificationTypes: t?.notificationTypes, maxAmount: t?.maxAmount, budgetRenewal: t?.budgetRenewal, expiresAt: n ? Math.floor(n.getTime() / 1e3) : void 0, isolated: t?.isolated, metadata: t?.metadata, returnTo: t?.returnTo });
      this._authString = o.getConnectionUri("alby"), window.location.href = this._authString;
      const { unsub: i } = await o.subscribe({ onSuccess: async function(s) {
        s.close(), O.getState().connect({ nwcUrl: s.nostrWalletConnectUrl, connectorName: "Alby Hub", connectorType: "nwc.albyhub" });
      } });
      this._unsub = i;
    } catch (t) {
      console.error(t), alert("" + t);
    }
  }
};
I([J()], Rn.prototype, "_authString", void 0), I([J()], Rn.prototype, "_hasCopiedAuthString", void 0), Rn = I([K("bc-alby-go")], Rn);
let Oc, Pc, bf = (e) => e, $n = class extends re()(Y) {
  constructor() {
    super(...arguments), this._lnbitsAdminKey = "", this._lnbitsUrl = "";
  }
  render() {
    return T(Oc || (Oc = bf`<div class="w-full">
      <bc-navbar
        class="flex w-full"
        heading=${0}
      ></bc-navbar>
      <div class="font-sans text-sm w-full">
        <div class="px-8 pt-4 w-full">
          <div class="mb-4 ${0}">
            In LNbits, choose the wallet you want to connect, open it, click on
            API docs and copy the Admin Key. Paste it below:
          </div>

          <div class="mb-1 ${0}">
            LNbits Admin Key
          </div>
          <input
            value=${0}
            @change=${0}
            type="password"
            placeholder="Your 32 digit admin key"
            class="w-full mb-8 rounded-lg p-2 border-1 bg-transparent ${0} ${0}"
          />
          <div class="mb-1 ${0}">
            LNbits URL
          </div>

          <input
            value=${0}
            @change=${0}
            placeholder="https://legend.lnbits.com"
            class="w-full mb-8 rounded-lg p-2 border-1 bg-transparent ${0} ${0}"
          />
          <bci-button variant="primary" @click=${0}>
            Connect
          </bci-button>
        </div>
      </div>
    </div>`), Bo, mn, q, this._lnbitsAdminKey, this._lnbitsAdminKeyChanged, St, ze, q, this._lnbitsUrl, this._lnbitsUrlChanged, St, ze, this.onConnect);
  }
  _lnbitsAdminKeyChanged(e) {
    this._lnbitsAdminKey = e.target.value;
  }
  _lnbitsUrlChanged(e) {
    this._lnbitsUrl = e.target.value;
  }
  async onConnect() {
    if (!this._lnbitsAdminKey) return void O.getState().setError("Please enter your admin key");
    if (!this._lnbitsUrl) return void O.getState().setError("Please enter your LNbits instance URL");
    let e = this._lnbitsUrl;
    e.endsWith("/") && (e = e.substring(0, e.length - 1)), await O.getState().connect({ lnbitsAdminKey: this._lnbitsAdminKey, lnbitsInstanceUrl: e, connectorName: Bo, connectorType: "lnbits" });
  }
};
I([J()], $n.prototype, "_lnbitsAdminKey", void 0), I([J()], $n.prototype, "_lnbitsUrl", void 0), $n = I([K("bc-lnbits")], $n);
const k2 = te(Pc || (Pc = ((e) => e)`
<svg width="150" height="150" viewBox="0 0 150 150" version="1.1" xml:space="preserve"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:svg="http://www.w3.org/2000/svg"
  class="w-32 h-32 mt-4"
>
	<circle id="ring" cx="75" cy="75" r="48.5" fill="none" stroke="currentColor" stroke-width="5" transform="rotate(-90 75 75)" stroke-dasharray="400 400" stroke-dashoffset="400">
		<animate attributeName="stroke-dashoffset" begin="0.1s" dur="1.5s" values="500; 80; 0" fill="freeze" calcMode="spline" keyTimes="0; 0.99; 1" keySplines="0.28 0.4 0.38 1; 0 0 1 1"/>
		<animate attributeName="r" begin="1.8s" dur=".8s" values="47; 65" fill="freeze"/>
		<animate attributeName="stroke-width" begin="1.8s" dur=".8s" values="6; 0" fill="freeze"/>
	</circle>
	<circle id="circle" cx="75" cy="75" r="0" fill="currentColor" stroke="none">
		<animate attributeName="r" begin="1.4s" dur=".5s" fill="freeze" calcMode="spline" values="0; 60; 50" keyTimes="0; 0.75; 1" keySplines="0.25 0.1 0.25 1; 0.25 0.1 0.25 1"/>
	</circle>
	<path id="check" d="M 51.749354,79.542286 63.437424,91.567026 98.46891,58.494402" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-dasharray="65 65" stroke-dashoffset="65">
		<animate attributeName="stroke-dashoffset" begin="1.8s" dur=".5s" values="65; 0" fill="freeze" calcMode="spline" keyTimes="0; 1" keySplines="0.42 0 0.58 1"/>
	</path>
</svg>
`));
let Hc;
const vf = te(Hc || (Hc = ((e) => e)`<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.5 6.5V17C4.5 18.6569 5.84315 20 7.5 20H17.5C19.1569 20 20.5 18.6569 20.5 17V12C20.5 10.3431 19.1569 9 17.5 9H16.5M4.5 6.5C4.5 7.88071 5.61929 9 7 9H16.5M4.5 6.5C4.5 5.11929 5.61929 4 7 4H14.5C15.6046 4 16.5 4.89543 16.5 6V9" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
<path d="M16 15.375C16.4832 15.375 16.875 14.9832 16.875 14.5C16.875 14.0168 16.4832 13.625 16 13.625C15.5168 13.625 15.125 14.0168 15.125 14.5C15.125 14.9832 15.5168 15.375 16 15.375Z" fill="white" stroke="currentColor" stroke-width="0.75"/>
</svg>`));
let Zc;
const Cf = te(Zc || (Zc = ((e) => e)`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M3 6C3 4.34315 4.34315 3 6 3H8C9.65685 3 11 4.34315 11 6V8C11 9.65685 9.65685 11 8 11H6C4.34315 11 3 9.65685 3 8V6ZM6 5C5.44772 5 5 5.44772 5 6V8C5 8.55228 5.44772 9 6 9H8C8.55228 9 9 8.55228 9 8V6C9 5.44772 8.55228 5 8 5H6ZM13 6C13 4.34315 14.3431 3 16 3H18C19.6569 3 21 4.34315 21 6V8C21 9.65685 19.6569 11 18 11H16C14.3431 11 13 9.65685 13 8V6ZM16 5C15.4477 5 15 5.44772 15 6V8C15 8.55228 15.4477 9 16 9H18C18.5523 9 19 8.55228 19 8V6C19 5.44772 18.5523 5 18 5H16ZM3 16C3 14.3431 4.34315 13 6 13H8C9.65685 13 11 14.3431 11 16V18C11 19.6569 9.65685 21 8 21H6C4.34315 21 3 19.6569 3 18V16ZM6 15C5.44772 15 5 15.4477 5 16V18C5 18.5523 5.44772 19 6 19H8C8.55228 19 9 18.5523 9 18V16C9 15.4477 8.55228 15 8 15H6ZM14 13C14.5523 13 15 13.4477 15 14V15H16C16.5523 15 17 15.4477 17 16C17 16.5523 16.5523 17 16 17H14C13.4477 17 13 16.5523 13 16V14C13 13.4477 13.4477 13 14 13ZM17 14C17 13.4477 17.4477 13 18 13H20C20.5523 13 21 13.4477 21 14C21 14.5523 20.5523 15 20 15H18C17.4477 15 17 14.5523 17 14ZM17 18C17 17.4477 17.4477 17 18 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H19V20C19 20.5523 18.5523 21 18 21C17.4477 21 17 20.5523 17 20V18Z" fill="currentColor"/>
<path d="M15 20C15 20.5523 14.5523 21 14 21C13.4477 21 13 20.5523 13 20C13 19.4477 13.4477 19 14 19C14.5523 19 15 19.4477 15 20Z" fill="currentColor"/>
<path d="M8 17C8 17.5523 7.55228 18 7 18C6.44772 18 6 17.5523 6 17C6 16.4477 6.44772 16 7 16C7.55228 16 8 16.4477 8 17Z" fill="currentColor"/>
<path d="M8 7C8 7.55228 7.55228 8 7 8C6.44772 8 6 7.55228 6 7C6 6.44772 6.44772 6 7 6C7.55228 6 8 6.44772 8 7Z" fill="currentColor"/>
<path d="M18 7C18 7.55228 17.5523 8 17 8C16.4477 8 16 7.55228 16 7C16 6.44772 16.4477 6 17 6C17.5523 6 18 6.44772 18 7Z" fill="currentColor"/>
</svg>`));
let Wc, Dc, Fc, Vc, Gc, jc, zc, qc, Kc, Qc, Jc, Yc, Xc, el, tl, nl, rl, ol, il, fe = (e) => e, Xe = class extends re()(Y) {
  constructor() {
    super(...arguments), this._hasCopiedInvoice = !1, this._isPaying = !1, this._showQR = !1, this.paymentMethods = "all";
  }
  updated(e) {
    super.updated(e), e.has("paid") && this.paid && setTimeout(() => {
      Bi();
    }, 3e3);
  }
  renderHeading(e) {
    return T(Wc || (Wc = fe`
      <h2 class="text-2xl mb-6 ${0}">
        <span
          class="font-bold font-mono text-4xl align-bottom ${0}"
          >${0}</span
        >&nbsp;sats
      </h2>
    `), q, de, e.satoshi.toLocaleString(void 0, { useGrouping: !0 }));
  }
  renderPaidState() {
    return T(Dc || (Dc = fe`
      <div
        class="flex flex-col justify-center items-center ${0}"
      >
        <p class="font-bold">Paid!</p>
        ${0}
      </div>
    `), de, k2);
  }
  renderPayingState() {
    return T(Fc || (Fc = fe`
      <div class="flex flex-col justify-center items-center">
        <p class="${0} mb-5">Paying...</p>
        ${0}
      </div>
    `), q, _t(`w-48 h-48 ${de}`));
  }
  renderPaymentConfirmation() {
    return T(Vc || (Vc = fe`
      <bci-button variant="primary" @click=${0}>
        <span class="-ml-0.5">${0}</span>
        Confirm Payment
      </bci-button>
      ${0}
    `), this._payInvoice, cn, Ii(this._connectorName));
  }
  renderWaitingForPayment() {
    return T(Gc || (Gc = fe`
      <div class="flex justify-center items-center">
        ${0}
        <p class="${0}">Waiting for payment</p>
      </div>
    `), _t(`w-7 h-7 ${de}`), q);
  }
  renderConnectWalletMobile() {
    let e = null, t = null, n = null;
    return this.paymentMethods !== "all" && this.paymentMethods !== "internal" || (e = T(jc || (jc = fe`
        <bci-button block @click=${0}>
          <span class="-ml-0.5">${0}</span>Connect Wallet
        </bci-button>
      `), this._onClickConnectWallet, cn)), this.paymentMethods !== "all" && this.paymentMethods !== "external" || (this._showQR || (t = T(zc || (zc = fe`
          <bci-button block @click=${0}>
            ${0} Copy & Display Invoice
          </bci-button>
        `), this._copyAndDisplayInvoice, Cf)), this._showQR && (n = this.renderQR())), T(qc || (qc = fe`
      <div class="mt-8 w-full flex flex-col gap-4">
        ${0}
        ${0} ${0}
      </div>
      ${0}
    `), this.paymentMethods === "all" || this.paymentMethods === "external" ? T(Kc || (Kc = fe`<a href="lightning:${0}">
              <bci-button variant="primary" block>
                ${0} Open in a Bitcoin Wallet
              </bci-button>
            </a>`), this.invoice, vf) : null, e, t, n ? T(Qc || (Qc = fe`<div class="mt-4 flex flex-col items-center">${0}</div>`), n) : null);
  }
  renderConnectWalletDesktop() {
    let e = null;
    this.paymentMethods !== "all" && this.paymentMethods !== "internal" || (e = T(Jc || (Jc = fe`
        <div class="${0}">
          <bci-button variant="primary" @click=${0}>
            <span class="-ml-0.5">${0}</span>
            Connect Wallet to Pay
          </bci-button>
        </div>
      `), this.paymentMethods !== "internal" ? "mt-8" : "", this._onClickConnectWallet, cn));
    let t = null;
    this.paymentMethods === "all" && (t = T(Yc || (Yc = fe` <div class="w-full py-8">${0}</div> `), A2("or")));
    let n = null;
    return this.paymentMethods !== "all" && this.paymentMethods !== "external" || (n = T(Xc || (Xc = fe`
        <div
          class="flex flex-col items-center ${0}"
        >
          <p class="font-medium ${0}">
            Scan to Pay
          </p>
          ${0}
        </div>
      `), this.paymentMethods === "external" ? "mt-8" : "", q, this.renderQR())), T(el || (el = fe` ${0} ${0} ${0} `), e, t, n);
  }
  renderQR() {
    if (!this._showQR || !this.invoice) return null;
    const e = this.invoice;
    return setTimeout(() => {
      var t;
      const n = (t = this.shadowRoot) == null ? void 0 : t.getElementById("qr");
      if (!n) return void console.error("qr canvas not found");
      const r = n.getContext("2d");
      if (!r) return void console.error("could not get context for qr canvas");
      const o = Po(0, "L");
      o.addData(e), o.make();
      const i = o.getModuleCount();
      n.width = 2 * i, n.height = 2 * i, o.renderTo2dContext(r, 2);
    }, 100), T(tl || (tl = fe`
      <!-- add margin only on dark mode because on dark mode the qr has a white border -->
      <a href="lightning:${0}" class="dark:mt-2">
        <canvas id="qr" class="dark:bg-white dark:p-4"></canvas>
      </a>
      <button
        @click=${0}
        class="
        flex gap-1
        mt-4
        ${0} ${0}"
        aria-label="${0}"
      >
        ${0}
        ${0}
      </button>
    `), this.invoice, this._copyInvoice, de, ve, this._hasCopiedInvoice ? "Invoice copied to clipboard" : "Copy invoice to clipboard", this._hasCopiedInvoice ? Oi : Pi, this._hasCopiedInvoice ? "Copied!" : "Copy Invoice");
  }
  renderMemo(e) {
    return e.description ? T(nl || (nl = fe`
      <p class="text-center mb-6 ${0}">
        ${0}
      </p>
    `), Ze, e.description) : null;
  }
  render() {
    if (!this.invoice) return null;
    let e;
    try {
      e = new Z5({ pr: this.invoice });
    } catch (r) {
      return console.error(r), O.getState().setError(r.message), null;
    }
    const t = window.innerWidth < 600;
    let n;
    return t || (this._showQR = !0), n = this.paid ? this.renderPaidState() : this._isPaying ? this.renderPayingState() : this._connected ? this.renderPaymentConfirmation() : T(rl || (rl = fe`
        ${0}
        ${0}
      `), this.paymentMethods !== "internal" ? this.renderWaitingForPayment() : null, t ? this.renderConnectWalletMobile() : this.renderConnectWalletDesktop()), T(ol || (ol = fe`
      <div class="flex flex-col justify-center items-center font-sans w-full">
        ${0} ${0}
        ${0}
      </div>
    `), this.renderHeading(e), this.renderMemo(e), n);
  }
  _onClickConnectWallet() {
    this.dispatchEvent(new Event("onclickconnectwallet", { bubbles: !0, composed: !0 }));
  }
  _copyAndDisplayInvoice() {
    this._copyInvoice(), this._showQR = !0;
  }
  _copyInvoice() {
    this.invoice && (navigator.clipboard.writeText(this.invoice), this._hasCopiedInvoice = !0, setTimeout(() => {
      this._hasCopiedInvoice = !1;
    }, 2e3));
  }
  async _payInvoice() {
    this._isPaying = !0;
    try {
      const e = O.getState().provider;
      if (!e) throw new Error("No WebLN provider available");
      if (!this.invoice) throw new Error("No invoice to pay");
      const t = await e.sendPayment(this.invoice);
      if (!t.preimage) throw new Error("No preimage in result");
      this.dispatchEvent(new CustomEvent("bc:onpaid", { bubbles: !0, composed: !0, detail: t })), this.paid = !0;
    } catch (e) {
      console.error(e), O.getState().setError(e.message);
    }
    this._isPaying = !1;
  }
};
I([J()], Xe.prototype, "_hasCopiedInvoice", void 0), I([J()], Xe.prototype, "_isPaying", void 0), I([J()], Xe.prototype, "_showQR", void 0), I([ue({ type: String })], Xe.prototype, "invoice", void 0), I([ue({ type: Boolean })], Xe.prototype, "paid", void 0), I([ue({ type: String, attribute: "payment-methods" })], Xe.prototype, "paymentMethods", void 0), Xe = I([K("bc-send-payment")], Xe);
const xf = te(il || (il = ((e) => e)`<svg class="w-full h-full" width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M177.882 96.0013C177.882 114.714 162.712 129.884 144 129.884C125.287 129.884 110.117 114.714 110.117 96.0013C110.117 77.2886 125.287 62.1189 144 62.1189C162.712 62.1189 177.882 77.2886 177.882 96.0013Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M144 64.2353C126.457 64.2353 112.235 78.4568 112.235 96C112.235 113.543 126.457 127.765 144 127.765C161.543 127.765 175.765 113.543 175.765 96C175.765 78.4568 161.543 64.2353 144 64.2353ZM108 96C108 76.1177 124.118 60 144 60C163.882 60 180 76.1177 180 96C180 115.882 163.882 132 144 132C124.118 132 108 115.882 108 96Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M144 118.589C156.475 118.589 166.588 108.476 166.588 96.0011C166.588 83.5259 156.475 73.4128 144 73.4128C131.524 73.4128 121.411 83.5259 121.411 96.0011C121.411 108.476 131.524 118.589 144 118.589ZM144 114.001C153.941 114.001 162 105.942 162 96.0011C162 86.06 153.941 78.0011 144 78.0011C134.058 78.0011 126 86.06 126 96.0011C126 105.942 134.058 114.001 144 114.001Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M144 82.8984C136.765 82.8984 130.899 88.764 130.899 95.9996C130.899 103.235 136.765 109.101 144 109.101L144 82.8984Z" fill="black"/>
<path d="M55.7364 131.166C53.2442 131.712 50.6554 132 47.9994 132C40.7095 132 33.9257 129.833 28.2569 126.108C26.8497 124.095 26.2183 122.987 25.7577 122.179C25.5295 121.778 25.3433 121.452 25.1253 121.125C22.9779 117.671 21.8543 113.235 21.6093 108.023C20.8504 91.8729 30.6653 81.56 40.6919 79.8672C47.0478 78.7942 52.0988 79.8809 55.9729 81.9526C52.5479 81 48.465 80.9425 43.8103 82.275C32.5268 85.912 28.7654 96.9708 30.3776 109.217C33.1913 124.562 48.2372 130.062 55.7364 131.166Z" fill="url(#paint0_linear_1428_3405)"/>
<path d="M23.5983 122.469C21.4995 118.742 19.5989 113.182 19.3614 108.129C18.5557 90.9843 29.0332 79.5543 40.317 77.6493C55.698 75.0526 64.2491 84.1583 67.197 90.9166C67.3202 90.8336 67.3704 90.669 67.3053 90.5274C62.4584 79.9882 52.4338 72.7507 40.854 72.7507C27.7055 72.7507 15.9732 82.1827 12 96.2003C12.0564 106.587 16.512 115.933 23.5983 122.469Z" fill="url(#paint1_linear_1428_3405)"/>
<path d="M68.2493 125.768C65.6525 127.538 62.8124 128.977 59.7892 130.025C58.3376 129.772 56.7293 129.457 55.597 129.235C55.0604 129.13 54.6305 129.046 54.3751 128.999C47.5271 127.749 35.2831 123.336 32.6008 108.867C31.8428 103.049 32.3857 97.6932 34.3078 93.4449C36.2015 89.2598 39.4695 86.0514 44.4537 84.4316C50.2465 82.8534 55.0469 83.6356 58.6125 85.5507C57.7348 85.3655 56.8276 85.2684 55.8993 85.2684C48.1838 85.2684 41.9291 91.9698 41.9291 100.236C41.9291 103.537 42.9263 106.588 44.6156 109.063C44.6156 109.063 49.4514 118.198 62.6156 117.381C74.3533 116.653 80.4488 106.125 81.1752 102.236C81.5528 100.215 81.7502 98.1303 81.7502 95.9997C81.7502 77.3603 66.6399 62.25 48.0004 62.25C33.896 62.25 21.8122 70.9021 16.7672 83.1884C15.0631 85.4082 13.5958 87.8694 12.4135 90.5306C15.0482 73.244 29.9777 60 48.0004 60C67.8826 60 84.0001 76.1176 84.0001 95.9997C84.0001 108.374 77.7573 119.289 68.2493 125.768Z" fill="url(#paint2_linear_1428_3405)"/>
<defs>
<linearGradient id="paint0_linear_1428_3405" x1="34.4824" y1="89.8251" x2="34.4273" y2="121.82" gradientUnits="userSpaceOnUse">
<stop offset="0.0297309" stop-color="#FA3C3C"/>
<stop offset="1" stop-color="#BC1870"/>
</linearGradient>
<linearGradient id="paint1_linear_1428_3405" x1="29.5809" y1="74.6307" x2="27.7982" y2="106.635" gradientUnits="userSpaceOnUse">
<stop stop-color="#FF9F2F"/>
<stop offset="1" stop-color="#FA3C3C"/>
</linearGradient>
<linearGradient id="paint2_linear_1428_3405" x1="54.75" y1="131.25" x2="54.8489" y2="94.125" gradientUnits="userSpaceOnUse">
<stop stop-color="#5B09AD"/>
<stop offset="1" stop-color="#BC1870"/>
</linearGradient>
</defs>
</svg>`));
let sl, Ef = (e) => e, al = class extends re()(Y) {
  render() {
    return T(sl || (sl = Ef`<div>
      <bc-navbar
        class="flex w-full"
        heading="Get a bitcoin lightning wallet"
      ></bc-navbar>

      <div class="flex flex-col gap-5 w-full my-6 px-8 font-sans text-sm">
        <div class="flex flex-row justify-center items-center space-x-4">
          <div class="w-20 h-20 flex items-center justify-center">
            <div
              class="p-2 bg-black drop-shadow rounded-xl flex items-center justify-center"
            >
              ${0}
            </div>
          </div>
          <p class="flex-1 text-sm ${0}">
            To get the best self-custodial bitcoin lightning wallet that can
            connect to apps, try
            <a
              href="https://albyhub.com"
              target="_blank"
              class="no-underline font-bold ${0} ${0}"
              >Alby Hub</a
            >.
          </p>
        </div>
        <div class="flex flex-row items-center space-x-4">
          <div class="w-20 h-20">${0}</div>
          <p class="flex-1 text-sm ${0}">
            For a quick setup of a custodial wallet, you can choose between
            <a
              href="https://rizful.com"
              target="_blank"
              class="no-underline font-bold ${0} ${0}"
              >Rizful</a
            >
            and
            <a
              href="https://coinos.io"
              target="_blank"
              class="no-underline font-bold ${0} ${0}"
              >Coinos</a
            >.
          </p>
        </div>
      </div>
    </div>`), C2, q, ve, de, xf, q, ve, de, ve, de);
  }
};
al = I([K("bc-new-wallet")], al);
let cl, Af = (e) => e, eo = class extends re()(Y) {
  constructor() {
    super(...arguments), this._nwcUrl = "";
  }
  render() {
    return T(cl || (cl = Af`<div class="w-full">
      <bc-navbar class="flex w-full" heading="LN Link"> </bc-navbar>
      <div class="font-sans text-sm w-full">
        <div class="px-8 pt-4 w-full">
          <div class="mb-2 ${0}">
            1. Add a new
            <a
              href="https://github.com/lnfi-network/ln-node/tree/main/LNLink"
              target="_blank"
              class="font-bold"
              >Wallet Connection
            </a>
            from
            <span class="${0}"
              >LN Node => Generate NWC</span
            >
            and copy the Connection Secret.
          </div>
          <div class="mb-1 ${0}">
            2. Paste the Connection Secret below:
          </div>

          <input
            value=${0}
            @change=${0}
            placeholder="nostr+walletconnect://..."
            type="password"
            class="w-full mb-8 rounded-lg p-2 border-1 bg-transparent ${0} ${0}"
          />
          <bci-button variant="primary" @click=${0}>
            Connect
          </bci-button>
        </div>
      </div>
    </div>`), q, Ze, q, this._nwcUrl, this.nwcUrlChanged, St, ze, this.onConnect);
  }
  nwcUrlChanged(e) {
    this._nwcUrl = e.target.value;
  }
  async onConnect() {
    this._nwcUrl ? await O.getState().connect({ nwcUrl: this._nwcUrl, connectorName: Ui, connectorType: "nwc.generic" }) : O.getState().setError("Please enter a URL");
  }
};
I([J()], eo.prototype, "_nwcUrl", void 0), eo = I([K("bc-lnfi")], eo);
let ll, kf = (e) => e, dl = class extends re()(Y) {
  connectedCallback() {
    super.connectedCallback(), this._timeout = setTimeout(() => {
      Bi(), O.setState({ route: "/start" });
    }, 3e3);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._timeout && clearTimeout(this._timeout);
  }
  render() {
    return T(ll || (ll = kf`<div
      class="flex flex-col justify-center items-center w-full mt-8 ${0}"
    >
      <p class="font-bold">Connected!</p>
      ${0}
    </div>`), de, k2);
  }
};
dl = I([K("bc-connected")], dl);
let ul, hl, fl = (e) => e, Nn = class extends re()(Y) {
  constructor() {
    super(), this._hasCopiedAuthString = !1, this.initAlbyGo();
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._unsub) == null || e.call(this);
  }
  render() {
    return T(ul || (ul = fl`<div class="w-full">
      <bc-navbar class="flex w-full" heading="Connect Flash Wallet"></bc-navbar>
      <div class="font-sans text-sm w-full">
        <div
          class="px-8 pt-4 w-full flex flex-col items-center justify-center gap-4"
        >
          <div class="mb-2 text-center ${0}">
            Scan with your camera, or by clicking "Send" in the Flash Wallet
          </div>

          <div class="flex justify-center items-center">
            ${0}
            <p class="${0}">Waiting for connection</p>
          </div>

 
            ${0}

          
          <bci-button
            @click=${0}
            class="
            flex gap-1 w-full
            mt-4
        ${0} ${0} font-semibold text-xs"
          >
            ${0}
            ${0}
          </bci-button>
        </div>

        <div class="flex flex-col items-center w-full font-sans text-sm">
          <h1 class="mt-8 ${0} text-center">
            Don't have the Flash Wallet app?
            <a
              class="no-underline font-bold ${0} ${0}" 
              href="https://paywithflash.com/wallet" target="_blank"
            >Download one here</a>
          </h1>
        </div>
        </div>
      </div>
    </div>`), q, _t(`w-7 h-7 ${q}`), q, this.renderQR(), this._copyAuthString, de, ve, this._hasCopiedAuthString ? Oi : Pi, this._hasCopiedAuthString ? "Copied!" : "Copy", mn, ve, de);
  }
  renderQR() {
    if (!this._authString) return null;
    const e = this._authString;
    return setTimeout(() => {
      var t;
      const n = (t = this.shadowRoot) == null ? void 0 : t.getElementById("qr");
      if (!n) return void console.error("qr canvas not found");
      const r = n.getContext("2d");
      if (!r) return void console.error("could not get context for qr canvas");
      const o = Po(0, "L");
      o.addData(e), o.make();
      const i = o.getModuleCount();
      n.width = 4 * i, n.height = 4 * i, o.renderTo2dContext(r, 4);
    }, 100), T(hl || (hl = fl`
      <!-- add margin only on dark mode because on dark mode the qr has a white border -->
      <canvas id="qr" class="dark:bg-white dark:p-4"></canvas>
    `));
  }
  _copyAuthString() {
    this._authString && (navigator.clipboard.writeText(this._authString), this._hasCopiedAuthString = !0, setTimeout(() => {
      this._hasCopiedAuthString = !1;
    }, 2e3));
  }
  async initAlbyGo() {
    try {
      var e;
      const t = (e = O.getState().bitcoinConnectConfig.providerConfig) == null || (e = e.nwc) == null ? void 0 : e.authorizationUrlOptions, n = t?.expiresAt;
      let r = t?.requestMethods;
      r || (r = ["get_info", "get_balance", "get_budget", "pay_invoice", "list_transactions", "lookup_invoice", "make_invoice"]);
      const o = new j0({ name: this._appName, icon: this._appIcon, relayUrls: ["wss://nwclay.paywithflash.com"], requestMethods: r, notificationTypes: t?.notificationTypes, maxAmount: t?.maxAmount, budgetRenewal: t?.budgetRenewal, expiresAt: n ? Math.floor(n.getTime() / 1e3) : void 0, isolated: t?.isolated, metadata: t?.metadata, returnTo: t?.returnTo });
      this._authString = o.connectionUri, window.location.href = this._authString;
      const { unsub: i } = await o.subscribe({ onSuccess: async function(s) {
        s.close(), O.getState().connect({ nwcUrl: s.nostrWalletConnectUrl, connectorName: "Flash Wallet", connectorType: "nwc.flash" });
      } });
      this._unsub = i;
    } catch (t) {
      console.error(t), alert("" + t);
    }
  }
};
I([J()], Nn.prototype, "_authString", void 0), I([J()], Nn.prototype, "_hasCopiedAuthString", void 0), Nn = I([K("bc-flash-wallet")], Nn);
let pl, gl, Sf = (e) => e, to = class extends re()(Y) {
  constructor() {
    super(...arguments), this._nwcUrl = "";
  }
  render() {
    return T(pl || (pl = Sf`<div class="w-full">
      <bc-navbar
        class="flex w-full"
        heading=${0}
      ></bc-navbar>
      <div class="font-sans text-sm w-full">
        <div class="px-8 pt-4 w-full">
          <div class="mb-2 ${0}">
            1. In LNBits, go to Plugins and enable the NWC plugin.
          </div>
          <div class="mb-1 ${0}">
            2. Create a new connection and update the relay from "nostrclient"
            to <span class="font-semibold">wss://relay.getalby.com/v1</span>,
            then copy the connection secret.
          </div>
          <div class="mb-1 ${0}">
            3. Paste the Connection Secret below.
          </div>

          <div class="px-8 pt-4 w-full">
            <div class="mb-1 ${0}">
              Enter your
              <a
                href="https://nwc.getalby.com/about"
                target="_blank"
                class="font-bold"
                >Connection Secret
              </a>
              below
            </div>

            <input
              value=${0}
              @change=${0}
              placeholder="nostr+walletconnect://..."
              type="password"
              class="w-full mb-8 rounded-lg p-2 border-1 bg-transparent ${0} ${0}"
            />
            <bci-button variant="primary" @click=${0}>
              Connect
            </bci-button>
          </div>
        </div>
      </div>
    </div>`), Uo, q, q, q, q, this._nwcUrl, this.nwcUrlChanged, St, ze, this.onConnect);
  }
  nwcUrlChanged(e) {
    this._nwcUrl = e.target.value;
  }
  async onConnect() {
    this._nwcUrl ? await O.getState().connect({ nwcUrl: this._nwcUrl, connectorName: Uo, connectorType: "nwc.lnbits" }) : O.getState().setError("Please enter a URL");
  }
};
I([J()], to.prototype, "_nwcUrl", void 0), to = I([K("bc-lnbits-nwc")], to);
const _f = te(gl || (gl = ((e) => e)`<svg class="w-20 h-20" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="17.2816" height="20" fill="url(#pattern0_6321_527)"/>
<defs>
<pattern id="pattern0_6321_527" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_6321_527" transform="matrix(0.00248348 0 0 0.00214592 0.1 0.05)"/>
</pattern>
<image id="image0_6321_527" width="404" height="404" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>
`)), Oo = "Cashu.me";
let wl = class extends Be {
  constructor() {
    super("nwc.cashume", Oo, "#7f38ca", _f);
  }
  async _onClick() {
    O.getState().pushRoute("/cashu-me");
  }
};
wl = I([K("bc-cashu-me-connector")], wl);
let ml, Lf = (e) => e, no = class extends re()(Y) {
  constructor() {
    super(...arguments), this._nwcUrl = "";
  }
  render() {
    return T(ml || (ml = Lf`<div class="w-full">
      <bc-navbar
        class="flex w-full"
        heading=${0}
      ></bc-navbar>
      <div class="font-sans text-sm w-full">
        <div class="px-8 pt-4 w-full">
          <div class="mb-2 ${0}">
            1. Open
            <a href="https://wallet.cashu.me" target="_blank" class="font-bold"
              >Cashu.me
            </a>
            , click on the <span class="font-semibold">hamburger menu</span> on
            the top left, then click
            <span class="font-semibold">Settings</span>. Scroll down to
            <span class="font-semibold">Nostr Wallet Connect</span>
            and enable NWC, and then press the copy button.
          </div>
          <div class="mb-1 ${0}">
            2. Keep the Cashu.me browser tab open while using Bitcoin Connect.
          </div>
          <div class="mb-1 ${0}">
            3. Paste the Connection Secret below:
          </div>

          <div class="px-8 pt-4 w-full">
            <div class="mb-1 ${0}">
              Enter your
              <a
                href="https://nwc.getalby.com/about"
                target="_blank"
                class="font-bold"
                >Connection Secret
              </a>
              below
            </div>

            <input
              value=${0}
              @change=${0}
              placeholder="nostr+walletconnect://..."
              type="password"
              class="w-full mb-8 rounded-lg p-2 border-1 bg-transparent ${0} ${0}"
            />
            <bci-button variant="primary" @click=${0}>
              Connect
            </bci-button>
          </div>
        </div>
      </div>
    </div>`), Oo, q, q, q, q, this._nwcUrl, this.nwcUrlChanged, St, ze, this.onConnect);
  }
  nwcUrlChanged(e) {
    this._nwcUrl = e.target.value;
  }
  async onConnect() {
    this._nwcUrl ? await O.getState().connect({ nwcUrl: this._nwcUrl, connectorName: Oo, connectorType: "nwc.cashume" }) : O.getState().setError("Please enter a URL");
  }
};
I([J()], no.prototype, "_nwcUrl", void 0), no = I([K("bc-cashu-me")], no);
let yl, Tf = (e) => e, ro = class extends re()(Y) {
  constructor() {
    super(...arguments), this._nwcUrl = "";
  }
  render() {
    return T(yl || (yl = Tf`<div class="w-full">
      <bc-navbar
        class="flex w-full"
        heading=${0}
      ></bc-navbar>
      <div class="font-sans text-sm w-full">
        <div class="px-8 pt-4 w-full">
          <div class="mb-2 ${0}">
            1. Open
            <a href="https://rizful.com/w" target="_blank" class="font-bold"
              >Rizful Wallet
            </a>
          </div>
          <div class="mb-2 ${0}">
            2. Click on
            <span class="semibold"
              >Hamburger Menu -> NWC -> Get NWC codes -> New Connection</span
            >. Then click <span class="semibold">Get Connection Code</span> and
            click
            <span class="semibold">Copy Connection Code</span>
          </div>

          <div class="mb-1 ${0}">
            3. Paste the Connection Secret below:
          </div>

          <div class="px-8 pt-4 w-full">
            <div class="mb-1 ${0}">
              Enter your
              <a
                href="https://nwc.getalby.com/about"
                target="_blank"
                class="font-bold"
                >Connection Secret
              </a>
              below
            </div>

            <input
              value=${0}
              @change=${0}
              placeholder="nostr+walletconnect://..."
              type="password"
              class="w-full mb-8 rounded-lg p-2 border-1 bg-transparent ${0} ${0}"
            />
            <bci-button variant="primary" @click=${0}>
              Connect
            </bci-button>
          </div>
        </div>
      </div>
    </div>`), Io, q, q, q, q, this._nwcUrl, this.nwcUrlChanged, St, ze, this.onConnect);
  }
  nwcUrlChanged(e) {
    this._nwcUrl = e.target.value;
  }
  async onConnect() {
    this._nwcUrl ? await O.getState().connect({ nwcUrl: this._nwcUrl, connectorName: Io, connectorType: "nwc.rizful" }) : O.getState().setError("Please enter a URL");
  }
};
I([J()], ro.prototype, "_nwcUrl", void 0), ro = I([K("bc-rizful")], ro);
let bl, vl, Cl, xl, El, Al, kl, Sl, _l, Ll, Tl, Ml, Rl, _e = (e) => e;
const Mf = { "/start": T(bl || (bl = _e`<bc-start class="flex w-full"></bc-start>`)), "/help": T(vl || (vl = _e`<bc-help class="flex w-full"></bc-help>`)), "/nwc": T(Cl || (Cl = _e`<bc-nwc class="flex w-full"></bc-nwc>`)), "/lnfi": T(xl || (xl = _e`<bc-lnfi class="flex w-full"></bc-lnfi>`)), "/alby-hub": T(El || (El = _e`<bc-alby-hub class="flex w-full"></bc-alby-hub>`)), "/alby-go": T(Al || (Al = _e`<bc-alby-go class="flex w-full"></bc-alby-go>`)), "/lnbits": T(kl || (kl = _e`<bc-lnbits class="flex w-full"></bc-lnbits>`)), "/lnbits-nwc": T(Sl || (Sl = _e`<bc-lnbits-nwc class="flex w-full"></bc-lnbits-nwc>`)), "/flash-wallet": T(_l || (_l = _e`<bc-flash-wallet
    class="flex w-full"
  ></bc-flash-wallet>`)), "/cashu-me": T(Ll || (Ll = _e`<bc-cashu-me class="flex w-full"></bc-cashu-me>`)), "/rizful": T(Tl || (Tl = _e`<bc-rizful class="flex w-full"></bc-rizful>`)), "/new-wallet": T(Ml || (Ml = _e`<bc-new-wallet class="flex w-full"></bc-new-wallet>`)), "/connected": T(Rl || (Rl = _e`<bc-connected class="flex w-full"></bc-connected>`)) };
let $l, Nl, Rf = (e) => e, Bl = class extends re()(Y) {
  render() {
    return T($l || ($l = Rf`<div class="flex flex-col w-full">${0}</div>`), Mf[this._route]);
  }
};
Bl = I([K("bc-router-outlet")], Bl);
const $f = te(Nl || (Nl = ((e) => e)`<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.6665 7.16699L12.4998 12.0003M12.4998 12.0003L17.3332 16.8337M12.4998 12.0003L17.3332 7.16699M12.4998 12.0003L7.6665 16.8337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`));
let Ul;
const Nf = te(Ul || (Ul = ((e) => e)`<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.665 18.33C13.5404 18.3311 14.4074 18.1592 15.2162 17.8242C16.025 17.4892 16.7596 16.9977 17.3778 16.3778C17.9977 15.7596 18.4892 15.025 18.8242 14.2162C19.1592 13.4074 19.3311 12.5404 19.33 11.665C19.3311 10.7896 19.1592 9.92256 18.8242 9.11378C18.4892 8.305 17.9976 7.5704 17.3778 6.95218C16.7596 6.33235 16.025 5.84079 15.2162 5.50577C14.4074 5.17075 13.5404 4.99887 12.665 5.00001C11.7896 4.99889 10.9226 5.17078 10.1138 5.5058C9.305 5.84082 8.5704 6.33236 7.95218 6.95218C7.33236 7.5704 6.84082 8.305 6.5058 9.11378C6.17078 9.92256 5.99889 10.7896 6.00001 11.665C5.99887 12.5404 6.17075 13.4074 6.50577 14.2162C6.84079 15.025 7.33235 15.7596 7.95218 16.3778C8.5704 16.9976 9.305 17.4892 10.1138 17.8242C10.9226 18.1592 11.7896 18.3311 12.665 18.33Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M12.6649 12.9149V11.9152C12.9615 11.9152 13.2515 11.8272 13.4981 11.6625C13.7447 11.4977 13.9369 11.2635 14.0504 10.9895C14.1639 10.7155 14.1936 10.4139 14.1357 10.123C14.0779 9.83215 13.935 9.56495 13.7253 9.35523C13.5156 9.14551 13.2484 9.00269 12.9575 8.94483C12.6666 8.88697 12.3651 8.91667 12.091 9.03017C11.817 9.14366 11.5828 9.33587 11.418 9.58247C11.2532 9.82908 11.1653 10.119 11.1653 10.4156" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.6653 15.7497C12.8642 15.7497 13.055 15.6707 13.1956 15.5301C13.3363 15.3895 13.4153 15.1987 13.4153 14.9999C13.4153 14.801 13.3363 14.6103 13.1956 14.4696C13.055 14.329 12.8642 14.25 12.6653 14.25C12.4664 14.25 12.2756 14.329 12.135 14.4696C11.9943 14.6103 11.9153 14.801 11.9153 14.9999C11.9153 15.1987 11.9943 15.3895 12.135 15.5301C12.2756 15.6707 12.4664 15.7497 12.6653 15.7497Z" fill="currentColor"/>
</svg>
`));
let Il, Ol, Pl, oo = (e) => e, Bn = class extends re()(Y) {
  render() {
    return T(Il || (Il = oo`<div
      class="flex justify-center items-center gap-2 w-full relative"
    >
      <div
        class="absolute right-0 h-full flex items-center justify-center gap-2"
      >
        ${0}
        ${0}
      </div>
      <div class="flex items-center justify-center">
        <slot></slot>
      </div>
    </div>`), this.showHelp ? T(Ol || (Ol = oo`<button
              class="${0} ${0}"
              aria-label="Show help"
              @click=${0}
            >
              ${0}
            </button>`), ve, Ze, () => O.getState().pushRoute("/help"), Nf) : null, this.closable ? T(Pl || (Pl = oo`<button
              class="${0} ${0}"
              aria-label="Close modal"
              @click=${0}
            >
              ${0}
            </button>`), ve, Ze, this._handleClose, $f) : null);
  }
  _handleClose() {
    this.dispatchEvent(new Event("onclose", { bubbles: !0, composed: !0 }));
  }
};
I([ue({ type: Boolean })], Bn.prototype, "closable", void 0), I([ue({ type: Boolean, attribute: "show-help" })], Bn.prototype, "showHelp", void 0), Bn = I([K("bc-modal-header")], Bn);
let Hl, Bf = (e) => e, Zl = class extends re()(Y) {
  constructor() {
    super(...arguments), this._handleClose = () => {
      Bi();
    };
  }
  render() {
    return T(Hl || (Hl = Bf` <div
      class="fixed top-0 left-0 w-full h-full flex justify-center items-end sm:items-center z-[21000]"
    >
      <div
        class="absolute top-0 left-0 w-full h-full -z-10 bg-black animate-darken"
        @click=${0}
      ></div>
      <div
        class="transition-all p-4 pt-6 pb-8 rounded-2xl shadow-2xl flex flex-col w-full bg-white dark:bg-black max-w-md max-sm:rounded-b-none
        animate-fade-in max-sm:animate-slide-up max-h-[90vh] overflow-y-auto"
      >
        <slot @onclose=${0}></slot>
      </div>
    </div>`), this._handleClose, this._handleClose);
  }
};
Zl = I([K("bc-modal")], Zl);
let Wl, Dl, Uf = (e) => e, Fl = class extends re()(Pt) {
  render() {
    return T(Wl || (Wl = Uf`
      <div class="flex flex-col items-center justify-center w-full">
        ${0}
        <p class="text-center font-sans ${0}">
          Connecting to wallet...
        </p>
        ${0}
      </div>
    `), _t(`w-20 h-20 ${Ze} mb-4`), q, Ii(void 0));
  }
};
Fl = I([K("bci-connecting")], Fl);
const If = te(Dl || (Dl = ((e) => e)`<svg width="116" height="14" viewBox="0 0 116 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.88623 4.23009C7.4526 4.23009 7.94227 4.33038 8.35525 4.53097C8.76823 4.73156 9.11041 5.00295 9.3818 5.34513C9.65319 5.68732 9.85378 6.0885 9.98357 6.54867C10.1134 7.00885 10.1783 7.50443 10.1783 8.0354C10.1783 8.84956 10.0249 9.62242 9.71809 10.354C9.4231 11.0737 9.01602 11.705 8.49685 12.2478C7.97767 12.7788 7.3641 13.2035 6.65614 13.5221C5.94817 13.8289 5.18121 13.9823 4.35525 13.9823C4.24905 13.9823 4.06026 13.9764 3.78888 13.9646C3.52929 13.9646 3.2284 13.941 2.88622 13.8938C2.54404 13.8466 2.17826 13.7758 1.78888 13.6814C1.41129 13.587 1.05141 13.4572 0.709229 13.292L3.77118 0.424778L6.51454 0L5.4172 4.56637C5.65318 4.46018 5.88917 4.37758 6.12516 4.31858C6.36115 4.25959 6.61484 4.23009 6.88623 4.23009ZM4.58534 11.8053C4.99832 11.8053 5.3877 11.705 5.75348 11.5044C6.11926 11.3038 6.43195 11.0384 6.69153 10.708C6.96292 10.3658 7.17531 9.9823 7.3287 9.55752C7.4821 9.13274 7.55879 8.69027 7.55879 8.23009C7.55879 7.66372 7.4644 7.22124 7.27561 6.90266C7.08681 6.58407 6.73873 6.42478 6.23136 6.42478C6.06616 6.42478 5.84788 6.45428 5.57649 6.51328C5.3169 6.57227 5.08091 6.69617 4.86852 6.88496L3.70038 11.7345C3.77118 11.7463 3.83018 11.7581 3.87737 11.7699C3.93637 11.7817 3.99537 11.7935 4.05436 11.8053C4.11336 11.8053 4.18416 11.8053 4.26675 11.8053C4.34935 11.8053 4.45554 11.8053 4.58534 11.8053Z" fill="currentColor"/>
<path d="M13.1552 13.7345H10.5357L12.7481 4.42478H15.3853L13.1552 13.7345ZM14.4295 3.29204C14.0637 3.29204 13.7333 3.18584 13.4384 2.97345C13.1434 2.74926 12.9959 2.41298 12.9959 1.9646C12.9959 1.71681 13.0431 1.48673 13.1375 1.27434C13.2437 1.05015 13.3794 0.861357 13.5446 0.707964C13.7097 0.542772 13.8985 0.412979 14.1109 0.318584C14.3351 0.224189 14.5711 0.176991 14.8189 0.176991C15.1847 0.176991 15.5151 0.289086 15.81 0.513274C16.105 0.725664 16.2525 1.05605 16.2525 1.50442C16.2525 1.75221 16.1994 1.9882 16.0932 2.21239C15.9988 2.42478 15.869 2.61357 15.7038 2.77876C15.5387 2.93215 15.344 3.05605 15.1198 3.15044C14.9074 3.24484 14.6773 3.29204 14.4295 3.29204Z" fill="currentColor"/>
<path d="M17.7251 2.1062L20.4685 1.68142L19.7959 4.42478H22.734L22.203 6.58407H19.2827L18.5039 9.84071C18.4331 10.1121 18.3859 10.3658 18.3623 10.6018C18.3505 10.8378 18.38 11.0443 18.4508 11.2212C18.5334 11.3864 18.6691 11.5162 18.8579 11.6106C19.0467 11.705 19.3063 11.7522 19.6367 11.7522C19.9198 11.7522 20.1912 11.7286 20.4508 11.6814C20.7222 11.6224 20.9936 11.5457 21.265 11.4513L21.4597 13.469C21.1057 13.5988 20.7222 13.7109 20.3092 13.8053C19.8962 13.8997 19.4066 13.9469 18.8402 13.9469C18.026 13.9469 17.3948 13.8289 16.9464 13.5929C16.498 13.3451 16.1794 13.0148 15.9906 12.6018C15.8018 12.177 15.7192 11.6932 15.7428 11.1504C15.7664 10.6077 15.849 10.0354 15.9906 9.43363L17.7251 2.1062Z" fill="currentColor"/>
<path d="M22.475 10.0177C22.475 9.21534 22.6048 8.46018 22.8644 7.75221C23.124 7.04425 23.4957 6.42478 23.9794 5.89381C24.4632 5.36283 25.0473 4.94395 25.7316 4.63717C26.4278 4.33038 27.2007 4.17699 28.0502 4.17699C28.5812 4.17699 29.0532 4.23009 29.4662 4.33628C29.8909 4.43068 30.2744 4.56047 30.6166 4.72567L29.7139 6.77876C29.478 6.68437 29.2302 6.60177 28.9706 6.53097C28.7228 6.44838 28.416 6.40708 28.0502 6.40708C27.1653 6.40708 26.4691 6.70797 25.9617 7.30974C25.4544 7.89971 25.2007 8.70797 25.2007 9.73452C25.2007 10.3363 25.3305 10.826 25.5901 11.2035C25.8496 11.5693 26.3275 11.7522 27.0237 11.7522C27.3659 11.7522 27.6963 11.7168 28.0148 11.646C28.3334 11.5752 28.6166 11.4867 28.8644 11.3805L29.0591 13.4867C28.7287 13.6165 28.3629 13.7286 27.9617 13.823C27.5724 13.9292 27.0945 13.9823 26.5281 13.9823C25.7965 13.9823 25.1771 13.8761 24.6697 13.6637C24.1623 13.4513 23.7434 13.1681 23.4131 12.8142C23.0827 12.4484 22.8408 12.0236 22.6874 11.5398C22.5458 11.0561 22.475 10.5487 22.475 10.0177Z" fill="currentColor"/>
<path d="M33.8569 13.9823C33.2316 13.9823 32.6888 13.8879 32.2286 13.6991C31.7684 13.5103 31.385 13.2448 31.0782 12.9027C30.7832 12.5605 30.559 12.1593 30.4056 11.6991C30.2522 11.2271 30.1755 10.708 30.1755 10.1416C30.1755 9.43363 30.2876 8.72567 30.5118 8.0177C30.7478 7.30974 31.09 6.67257 31.5383 6.1062C31.9867 5.53982 32.5354 5.07965 33.1844 4.72567C33.8333 4.35988 34.5767 4.17699 35.4145 4.17699C36.028 4.17699 36.5649 4.27139 37.0251 4.46018C37.4971 4.64897 37.8805 4.91445 38.1755 5.25664C38.4823 5.59882 38.7124 6.0059 38.8658 6.47788C39.0192 6.93805 39.0959 7.45133 39.0959 8.0177C39.0959 8.72567 38.9838 9.43363 38.7596 10.1416C38.5354 10.8496 38.205 11.4867 37.7684 12.0531C37.3319 12.6195 36.7832 13.0855 36.1224 13.4513C35.4735 13.8053 34.7183 13.9823 33.8569 13.9823ZM35.1667 6.40708C34.7773 6.40708 34.4351 6.51918 34.1401 6.74336C33.8451 6.96755 33.5973 7.25074 33.3968 7.59292C33.1962 7.9351 33.0428 8.31269 32.9366 8.72567C32.8422 9.12685 32.795 9.51033 32.795 9.87611C32.795 10.4779 32.8894 10.944 33.0782 11.2743C33.267 11.5929 33.6091 11.7522 34.1047 11.7522C34.4941 11.7522 34.8363 11.6401 35.1313 11.4159C35.4263 11.1917 35.674 10.9086 35.8746 10.5664C36.0752 10.2242 36.2227 9.85251 36.3171 9.45133C36.4233 9.03835 36.4764 8.64897 36.4764 8.28319C36.4764 7.68142 36.382 7.22124 36.1932 6.90266C36.0044 6.57227 35.6622 6.40708 35.1667 6.40708Z" fill="currentColor"/>
<path d="M42.0732 13.7345H39.4537L41.6661 4.42478H44.3033L42.0732 13.7345ZM43.3475 3.29204C42.9818 3.29204 42.6514 3.18584 42.3564 2.97345C42.0614 2.74926 41.9139 2.41298 41.9139 1.9646C41.9139 1.71681 41.9611 1.48673 42.0555 1.27434C42.1617 1.05015 42.2974 0.861357 42.4626 0.707964C42.6278 0.542772 42.8166 0.412979 43.0289 0.318584C43.2531 0.224189 43.4891 0.176991 43.7369 0.176991C44.1027 0.176991 44.4331 0.289086 44.7281 0.513274C45.0231 0.725664 45.1705 1.05605 45.1705 1.50442C45.1705 1.75221 45.1174 1.9882 45.0113 2.21239C44.9169 2.42478 44.7871 2.61357 44.6219 2.77876C44.4567 2.93215 44.262 3.05605 44.0378 3.15044C43.8254 3.24484 43.5953 3.29204 43.3475 3.29204Z" fill="currentColor"/>
<path d="M46.2538 4.84956C46.4544 4.79056 46.6727 4.72566 46.9087 4.65487C47.1564 4.57227 47.4278 4.50148 47.7228 4.44248C48.0296 4.37168 48.3659 4.31859 48.7317 4.28319C49.1092 4.23599 49.534 4.21239 50.006 4.21239C51.3983 4.21239 52.3541 4.61357 52.8733 5.41593C53.3924 6.21829 53.4809 7.31564 53.1387 8.70797L51.9352 13.7345H49.298L50.4662 8.81416C50.537 8.50738 50.5901 8.21239 50.6255 7.92921C50.6727 7.63422 50.6727 7.38053 50.6255 7.16814C50.5783 6.94395 50.4662 6.76696 50.2892 6.63717C50.124 6.49558 49.8644 6.42478 49.5104 6.42478C49.1682 6.42478 48.8202 6.46018 48.4662 6.53097L46.7494 13.7345H44.1122L46.2538 4.84956Z" fill="currentColor"/>
<path d="M59.411 14C58.6441 14 57.9656 13.8879 57.3756 13.6637C56.7974 13.4395 56.3137 13.1209 55.9243 12.708C55.5349 12.295 55.2399 11.7994 55.0393 11.2212C54.8505 10.6313 54.7561 9.9705 54.7561 9.23894C54.7561 8.17699 54.9213 7.16224 55.2517 6.19469C55.5939 5.22714 56.0718 4.37168 56.6853 3.62832C57.3107 2.88496 58.06 2.29499 58.9331 1.85841C59.8063 1.41003 60.7798 1.18584 61.8535 1.18584C62.7739 1.18584 63.5054 1.28024 64.0482 1.46903C64.6028 1.65782 64.998 1.83481 65.234 2L64.5261 3.41593C64.2547 3.23894 63.883 3.07375 63.411 2.92035C62.9508 2.75516 62.4022 2.67257 61.765 2.67257C60.9508 2.67257 60.2193 2.86726 59.5703 3.25664C58.9213 3.63422 58.3727 4.1298 57.9243 4.74336C57.4759 5.34513 57.1337 6.0295 56.8977 6.79646C56.6617 7.55162 56.5438 8.30089 56.5438 9.04425C56.5438 11.3451 57.5408 12.4956 59.5349 12.4956C59.9597 12.4956 60.3373 12.4661 60.6677 12.4071C61.0098 12.3481 61.3107 12.2832 61.5703 12.2124C61.8299 12.1298 62.06 12.0413 62.2606 11.9469C62.4612 11.8525 62.6382 11.7699 62.7915 11.6991L63.0039 13.1858C62.8623 13.2684 62.6736 13.3569 62.4376 13.4513C62.2134 13.5457 61.9479 13.6342 61.6411 13.7168C61.3343 13.7994 60.9921 13.8643 60.6146 13.9115C60.237 13.9705 59.8358 14 59.411 14Z" fill="currentColor"/>
<path d="M67.2379 13.9646C66.2703 13.9646 65.5093 13.6814 64.9547 13.115C64.4119 12.5369 64.1406 11.7463 64.1406 10.7434C64.1406 10.059 64.235 9.33924 64.4237 8.58407C64.6243 7.82891 64.937 7.13274 65.3618 6.49558C65.7866 5.85841 66.3352 5.33333 67.0078 4.92035C67.6804 4.50737 68.4945 4.30089 69.4503 4.30089C70.4178 4.30089 71.173 4.58997 71.7158 5.16814C72.2704 5.73451 72.5476 6.51918 72.5476 7.52213C72.5476 8.20649 72.4473 8.92626 72.2468 9.68142C72.058 10.4366 71.7512 11.1327 71.3264 11.7699C70.9016 12.4071 70.353 12.9322 69.6804 13.3451C69.0078 13.7581 68.1937 13.9646 67.2379 13.9646ZM67.5211 12.5664C68.0521 12.5664 68.524 12.413 68.937 12.1062C69.3618 11.7994 69.7158 11.41 69.999 10.9381C70.294 10.4543 70.5181 9.92331 70.6715 9.34513C70.8249 8.76696 70.9016 8.20649 70.9016 7.66372C70.9016 7.06195 70.7718 6.58407 70.5122 6.23009C70.2527 5.87611 69.8043 5.69912 69.1671 5.69912C68.6361 5.69912 68.1583 5.85251 67.7335 6.15929C67.3205 6.46608 66.9665 6.86136 66.6715 7.34513C66.3883 7.81711 66.1701 8.34219 66.0167 8.92036C65.8633 9.49853 65.7866 10.059 65.7866 10.6018C65.7866 11.2035 65.9164 11.6814 66.176 12.0354C66.4355 12.3894 66.8839 12.5664 67.5211 12.5664Z" fill="currentColor"/>
<path d="M74.8253 13.7345H73.1793L75.3032 4.88496C75.8459 4.71977 76.43 4.58997 77.0554 4.49558C77.6926 4.38938 78.2589 4.33628 78.7545 4.33628C79.2855 4.33628 79.7398 4.41298 80.1173 4.56637C80.5067 4.70796 80.8194 4.90856 81.0554 5.16814C81.2914 5.41593 81.4625 5.72271 81.5687 6.0885C81.6867 6.44248 81.7457 6.83186 81.7457 7.25664C81.7457 7.52803 81.7221 7.81711 81.6749 8.1239C81.6277 8.41888 81.5687 8.71977 81.4979 9.02655L80.3651 13.7345H78.7191L79.7634 9.38053C79.8459 9.05015 79.9226 8.71387 79.9934 8.37168C80.076 8.0295 80.1173 7.70502 80.1173 7.39823C80.1173 6.92626 79.9875 6.53687 79.728 6.23009C79.4684 5.91151 78.9846 5.75221 78.2766 5.75221C77.9816 5.75221 77.6926 5.76991 77.4094 5.80531C77.1262 5.84071 76.8902 5.88791 76.7014 5.9469L74.8253 13.7345Z" fill="currentColor"/>
<path d="M84.2197 13.7345H82.5736L84.6975 4.88496C85.2403 4.71977 85.8244 4.58997 86.4498 4.49558C87.0869 4.38938 87.6533 4.33628 88.1489 4.33628C88.6798 4.33628 89.1341 4.41298 89.5117 4.56637C89.9011 4.70796 90.2138 4.90856 90.4498 5.16814C90.6857 5.41593 90.8568 5.72271 90.963 6.0885C91.081 6.44248 91.14 6.83186 91.14 7.25664C91.14 7.52803 91.1164 7.81711 91.0692 8.1239C91.022 8.41888 90.963 8.71977 90.8922 9.02655L89.7595 13.7345H88.1135L89.1577 9.38053C89.2403 9.05015 89.317 8.71387 89.3878 8.37168C89.4704 8.0295 89.5117 7.70502 89.5117 7.39823C89.5117 6.92626 89.3819 6.53687 89.1223 6.23009C88.8627 5.91151 88.379 5.75221 87.671 5.75221C87.376 5.75221 87.0869 5.76991 86.8037 5.80531C86.5206 5.84071 86.2846 5.88791 86.0958 5.9469L84.2197 13.7345Z" fill="currentColor"/>
<path d="M94.2335 8.90266C94.9179 8.87906 95.5432 8.83776 96.1096 8.77876C96.676 8.70797 97.1656 8.59587 97.5786 8.44248C97.9916 8.27729 98.3102 8.059 98.5344 7.78761C98.7704 7.51623 98.8884 7.16224 98.8884 6.72567C98.8884 6.61947 98.8648 6.50738 98.8176 6.38938C98.7822 6.27139 98.7114 6.16519 98.6052 6.0708C98.5108 5.9646 98.3751 5.88201 98.1981 5.82301C98.0211 5.75221 97.8028 5.71682 97.5432 5.71682C97.1302 5.71682 96.7409 5.80531 96.3751 5.9823C96.0211 6.15929 95.7025 6.39528 95.4193 6.69027C95.1361 6.97345 94.8943 7.30974 94.6937 7.69912C94.4931 8.0767 94.3397 8.47788 94.2335 8.90266ZM95.9149 13.9646C95.3131 13.9646 94.794 13.882 94.3574 13.7168C93.9208 13.5398 93.555 13.3038 93.26 13.0089C92.9651 12.7021 92.7468 12.3481 92.6052 11.9469C92.4636 11.5457 92.3928 11.1209 92.3928 10.6726C92.3928 9.84661 92.5167 9.05015 92.7645 8.28319C93.0123 7.51623 93.3662 6.83776 93.8264 6.24779C94.2866 5.65782 94.8471 5.19174 95.5078 4.84956C96.1686 4.49558 96.9179 4.31858 97.7556 4.31858C98.2394 4.31858 98.6524 4.38348 98.9946 4.51328C99.3485 4.63127 99.6317 4.79646 99.8441 5.00885C100.068 5.22124 100.234 5.46903 100.34 5.75221C100.446 6.0236 100.499 6.30679 100.499 6.60177C100.499 7.15634 100.399 7.62832 100.198 8.0177C99.9975 8.39528 99.732 8.71387 99.4016 8.97345C99.0713 9.23304 98.6819 9.43363 98.2335 9.57522C97.7969 9.71682 97.3367 9.82891 96.853 9.91151C96.381 9.9941 95.8972 10.0531 95.4016 10.0885C94.9179 10.1121 94.4577 10.1357 94.0211 10.1593C94.0093 10.2537 94.0034 10.3304 94.0034 10.3894C94.0034 10.4484 94.0034 10.4956 94.0034 10.531C94.0034 10.8024 94.0329 11.0619 94.0919 11.3097C94.1627 11.5457 94.2866 11.7581 94.4636 11.9469C94.6406 12.1239 94.8825 12.2655 95.1892 12.3717C95.5078 12.4779 95.9208 12.531 96.4282 12.531C96.6524 12.531 96.8825 12.5133 97.1185 12.4779C97.3662 12.4307 97.5963 12.3776 97.8087 12.3186C98.0329 12.2478 98.2276 12.1829 98.3928 12.1239C98.5698 12.0531 98.6937 11.9882 98.7645 11.9292L98.9061 13.3274C98.6701 13.4572 98.2866 13.5929 97.7556 13.7345C97.2364 13.8879 96.6229 13.9646 95.9149 13.9646Z" fill="currentColor"/>
<path d="M101.199 10.4425C101.199 9.64012 101.317 8.86726 101.553 8.1239C101.801 7.38053 102.161 6.72567 102.633 6.15929C103.105 5.59292 103.683 5.14454 104.368 4.81416C105.052 4.47198 105.837 4.30089 106.722 4.30089C107.111 4.30089 107.483 4.33038 107.837 4.38938C108.191 4.43658 108.527 4.53687 108.846 4.69027L108.226 6.0708C108.037 5.9646 107.813 5.88201 107.553 5.82301C107.306 5.76401 106.981 5.73451 106.58 5.73451C106.002 5.73451 105.483 5.86431 105.022 6.1239C104.562 6.37168 104.167 6.70797 103.837 7.13274C103.518 7.54572 103.27 8.0295 103.093 8.58407C102.928 9.12685 102.846 9.69322 102.846 10.2832C102.846 10.59 102.875 10.8791 102.934 11.1504C103.005 11.4218 103.123 11.6637 103.288 11.8761C103.453 12.0767 103.671 12.236 103.943 12.354C104.226 12.472 104.58 12.531 105.005 12.531C105.217 12.531 105.441 12.5133 105.677 12.4779C105.913 12.4307 106.132 12.3776 106.332 12.3186C106.533 12.2596 106.71 12.2006 106.863 12.1416C107.028 12.0708 107.146 12.0059 107.217 11.9469L107.359 13.3451C107.135 13.4867 106.787 13.6224 106.315 13.7522C105.843 13.8938 105.306 13.9646 104.704 13.9646C104.138 13.9646 103.636 13.882 103.199 13.7168C102.763 13.5398 102.397 13.2979 102.102 12.9912C101.807 12.6726 101.583 12.3009 101.43 11.8761C101.276 11.4395 101.199 10.9617 101.199 10.4425Z" fill="currentColor"/>
<path d="M111.557 13.9823C110.672 13.9823 110.023 13.7876 109.61 13.3982C109.197 13.0089 108.99 12.4425 108.99 11.6991C108.99 11.2153 109.073 10.5959 109.238 9.84071L111.132 1.9646L112.849 1.68142L112.158 4.53097H115.291L114.955 5.91151H111.822L110.849 9.9823C110.707 10.5369 110.636 11.0207 110.636 11.4336C110.636 11.823 110.742 12.1062 110.955 12.2832C111.167 12.4484 111.521 12.531 112.017 12.531C112.359 12.531 112.695 12.4779 113.026 12.3717C113.356 12.2537 113.61 12.1475 113.787 12.0531L113.91 13.4513C113.734 13.5575 113.433 13.6696 113.008 13.7876C112.583 13.9174 112.099 13.9823 111.557 13.9823Z" fill="currentColor"/>
</svg>

`));
let Vl;
const Of = te(Vl || (Vl = ((e) => e)`<svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.4996 8.6934C13.5646 12.4434 9.76602 14.7256 6.01514 13.7905C2.26579 12.8555 -0.0166852 9.05718 0.918793 5.30739C1.8534 1.55695 5.65197 -0.725474 9.40176 0.209458C13.1524 1.14439 15.4347 4.94318 14.4996 8.6934Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.52902 4.06707C10.5141 4.44605 11.2102 4.99957 11.0511 5.97269C10.9624 6.52101 10.7122 6.8585 10.3665 7.04603C10.236 7.1168 10.2072 7.33609 10.3231 7.42878C10.8196 7.82585 11.0179 8.38842 10.7056 9.24266C10.2505 10.4885 9.22882 10.6202 7.87222 10.3663C7.78904 10.3508 7.70726 10.4014 7.68566 10.4832L7.52414 11.0824C7.46306 11.3138 7.22603 11.4518 6.99467 11.3908C6.76319 11.3298 6.62506 11.0926 6.68618 10.8612L6.84101 10.2875C6.86324 10.2033 6.81295 10.1171 6.72884 10.0946C6.61038 10.0629 6.49041 10.0301 6.36863 9.99598C6.28341 9.9721 6.19494 10.0224 6.17237 10.108L6.01688 10.6851C5.95588 10.9163 5.71897 11.0543 5.48775 10.9932C5.25664 10.9322 5.11869 10.6955 5.17961 10.4643L5.33952 9.86967C5.36188 9.78479 5.31155 9.69775 5.22691 9.67449C5.1995 9.66696 5.17203 9.6594 5.1445 9.65182L5.1436 9.65157C5.02458 9.6188 4.90431 9.58569 4.78256 9.55341L4.50468 9.47686C4.19755 9.39585 4.03663 9.05848 4.16696 8.76881C4.27134 8.53681 4.52958 8.41694 4.77541 8.48242C4.77988 8.48361 4.7843 8.48479 4.78868 8.48595C4.84757 8.50157 4.84473 8.49023 4.90409 8.4765C5.02494 8.44855 5.08888 8.34885 5.11971 8.2752L5.69957 6.078L5.70108 6.07204L6.11095 4.51802C6.11349 4.5084 6.11518 4.49858 6.11565 4.48865C6.12282 4.33833 6.18991 4.18684 5.97081 4.08327C5.92336 4.06085 5.87669 4.03952 5.82597 4.02603C5.81758 4.0238 5.80892 4.02151 5.80003 4.01918C5.55193 3.954 5.40061 3.7018 5.46597 3.45375C5.53051 3.20887 5.78141 3.06273 6.02626 3.12741L6.51367 3.26409C6.63858 3.29693 6.76622 3.3287 6.89587 3.36037C6.97969 3.38084 7.06441 3.3303 7.08644 3.24687L7.22919 2.722C7.29025 2.49074 7.52721 2.35275 7.75848 2.41376C7.9898 2.47479 8.12784 2.71179 8.0668 2.94311L7.93196 3.43844C7.90985 3.52223 7.96087 3.6078 8.04506 3.62833C8.16859 3.65845 8.29203 3.6889 8.41417 3.72009C8.4966 3.74114 8.58086 3.69207 8.60256 3.60981L8.73588 3.11979C8.79692 2.88839 9.03398 2.75027 9.26539 2.81129C9.49683 2.87232 9.63496 3.10941 9.57392 3.34084L9.42905 3.87456C9.40794 3.95461 9.45175 4.03735 9.52902 4.06707ZM7.41985 5.36848L7.53445 4.93355C7.58781 4.73103 7.79524 4.61012 7.99776 4.66348C8.20028 4.71684 8.32119 4.92427 8.26783 5.12679L8.15323 5.56172L8.58812 5.67631C8.79064 5.72967 8.91155 5.9371 8.85819 6.13962C8.80483 6.34214 8.5974 6.46305 8.39488 6.40969L7.95999 6.2951L7.84539 6.73004C7.79203 6.93256 7.5846 7.05348 7.38208 7.00012C7.17956 6.94675 7.05865 6.73932 7.11201 6.53681L7.22661 6.10186L6.79163 5.98725C6.58911 5.93389 6.4682 5.72646 6.52156 5.52394C6.57492 5.32142 6.78235 5.20051 6.98487 5.25387L7.41985 5.36848ZM8.44291 7.37958L8.32831 7.81451L7.89332 7.6999C7.6908 7.64654 7.48337 7.76745 7.43001 7.96997C7.37665 8.17249 7.49757 8.37992 7.70008 8.43328L8.13507 8.54789L8.02046 8.98284C7.9671 9.18536 8.08802 9.39279 8.29054 9.44615C8.49305 9.49951 8.70048 9.37859 8.75385 9.17608L8.86845 8.74113L9.30334 8.85572C9.50585 8.90908 9.71328 8.78817 9.76665 8.58565C9.82001 8.38313 9.69909 8.1757 9.49658 8.12234L9.06169 8.00775L9.17629 7.57282C9.22965 7.3703 9.10873 7.16287 8.90621 7.10951C8.7037 7.05615 8.49627 7.17707 8.44291 7.37958Z" fill="white"/>
</svg>`));
let Gl, io, jl, zl, ql, Kl, Ql, tn = (e) => e, so = (io = class extends (Gl = re()(Y)) {
  render() {
    return T(jl || (jl = tn`<div class="w-full flex-col justify-center items-center">
      <bc-modal-header class="flex w-full" show-help ?closable=${0}>
        <div class="${0} mr-[2px]">
          ${0}
        </div>
        <div class="${0}">${0}</div>
      </bc-modal-header>
      <div class="flex w-full pt-8">
        ${0}
      </div>
      ${0}
    </div>`), this.closable, de, Of, ze, If, T(this._connecting ? zl || (zl = tn`<bci-connecting class="flex w-full"></bci-connecting>`) : ql || (ql = tn` <bc-router-outlet class="flex w-full"></bc-router-outlet>`)), this._error ? T(Kl || (Kl = tn`<p class="mt-4 text-center font-sans text-red-500">
            ${0}
          </p>`), this._error) : null);
  }
}, io.styles = [...Gl.styles, yr(Ql || (Ql = tn`
      :host {
        display: flex;
        justify-content: center;
        width: 100%;
      }
    `))], io);
I([ue({ type: Boolean })], so.prototype, "closable", void 0), so = I([K("bc-connect")], so);
let Jl, ao, Yl, Xl, e1, t1, Un = (e) => e, wt = (ao = class extends (Jl = re()(Y)) {
  constructor() {
    super(), this.paymentMethods = "all", this._showConnect = !1, O.subscribe((e, t) => {
      e.connected !== t.connected && e.connected && (this._showConnect = !1);
    });
  }
  render() {
    return this._showConnect && !this.paid ? T(Yl || (Yl = Un` <bc-connect ?closable=${0}></bc-connect>`), !0) : T(Xl || (Xl = Un`<div class="w-full flex-col justify-center items-center">
          <bc-modal-header class="flex w-full" ?closable=${0}>
            <p
              class="font-sans font-medium ${0}"
            >
              Payment Request
            </p>
          </bc-modal-header>
          <div class="flex flex-col justify-center items-center w-full pt-8">
            <bc-send-payment
              .invoice=${0}
              .paymentMethods=${0}
              ?paid=${0}
              @onclickconnectwallet=${0}
            ></bc-send-payment>
          </div>
          ${0}
        </div>`), this.closable, q, this.invoice, this.paymentMethods, this.paid, this._onClickConnectWallet, this._error ? T(e1 || (e1 = Un`<p class="mt-4 text-center font-sans text-red-500">
                ${0}
              </p>`), this._error) : null);
  }
  _onClickConnectWallet() {
    this._showConnect = !0;
  }
}, ao.styles = [...Jl.styles, yr(t1 || (t1 = Un`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }
    `))], ao);
I([ue({ type: Boolean })], wt.prototype, "closable", void 0), I([ue({ type: String })], wt.prototype, "invoice", void 0), I([ue({ type: String, attribute: "payment-methods" })], wt.prototype, "paymentMethods", void 0), I([ue({ type: Boolean })], wt.prototype, "paid", void 0), I([J()], wt.prototype, "_showConnect", void 0), wt = I([K("bc-payment")], wt);
const Qf = { NostrWebLNProvider: pr, LNCWebLNProvider: Q0, LnbitsWebLNProvider: J0 };
export {
  _a as AlbyHubConnector,
  Rt as Balance,
  Ln as Button,
  Pa as CoinosConnector,
  so as ConnectFlow,
  Kr as ConnectorList,
  Mn as CurrencySwitcher,
  ka as ExtensionConnector,
  Za as FlashConnector,
  Ta as GenericNWCConnector,
  $a as LNBitsConnector,
  Ra as LNCConnector,
  Ba as LNbitsNWCConnector,
  Ia as LnfiNWCConnector,
  Zl as Modal,
  Ye as PayButton,
  Wa as RizfulConnector,
  Xe as SendPayment,
  wt as SendPaymentFlow,
  Qf as WebLNProviders,
  x2 as albyHubConnectorTitle,
  Bi as closeModal,
  rf as coinosConnectorTitle,
  jf as connect,
  zf as connectNWC,
  qf as disconnect,
  sf as flashConnectorTitle,
  Ui as genericConnectorTitle,
  Kf as getConnectorConfig,
  Vf as init,
  Ff as isConnected,
  v2 as launchModal,
  G4 as launchPaymentModal,
  Bo as lnbitsConnectorTitle,
  Uo as lnbitsNWCConnectorTitle,
  tf as lnfiConnectorTitle,
  V4 as onConnected,
  Hf as onConnecting,
  Zf as onDisconnected,
  b2 as onModalClosed,
  Wf as onModalOpened,
  Gf as refreshBalance,
  Df as requestProvider,
  Io as rizfulConnectorTitle
};
