const fn = BigInt(4294967295), Ii = /* @__PURE__ */ BigInt(32);
function hu(e, t = !1) {
  return t ? { h: Number(e & fn), l: Number(e >> Ii & fn) } : { h: Number(e >> Ii & fn) | 0, l: Number(e & fn) | 0 };
}
function du(e, t = !1) {
  const n = e.length;
  let r = new Uint32Array(n), i = new Uint32Array(n);
  for (let s = 0; s < n; s++) {
    const { h: o, l: a } = hu(e[s], t);
    [r[s], i[s]] = [o, a];
  }
  return [r, i];
}
const fu = (e) => e / 2 ** 32 | 0, pu = (e) => e >>> 0;
function gu(e, t, n, r) {
  const i = fu(n), s = pu(n);
  e.setUint32(t, r ? s : i, r), e.setUint32(t + 4, r ? i : s, r);
}
const Ai = (e, t, n) => e >>> n, Ei = (e, t, n) => e << 32 - n | t >>> n, he = (e, t, n) => e >>> n | t << 32 - n, de = (e, t, n) => e << 32 - n | t >>> n, pn = (e, t, n) => e << 64 - n | t >>> n - 32, gn = (e, t, n) => e >>> n - 32 | t << 64 - n;
function Kt(e, t, n, r) {
  const i = (t >>> 0) + (r >>> 0);
  return { h: e + n + (i / 2 ** 32 | 0) | 0, l: i | 0 };
}
const mu = (e, t, n) => (e >>> 0) + (t >>> 0) + (n >>> 0), yu = (e, t, n, r) => t + n + r + (e / 2 ** 32 | 0) | 0, wu = (e, t, n, r) => (e >>> 0) + (t >>> 0) + (n >>> 0) + (r >>> 0), bu = (e, t, n, r, i) => t + n + r + i + (e / 2 ** 32 | 0) | 0, vu = (e, t, n, r, i) => (e >>> 0) + (t >>> 0) + (n >>> 0) + (r >>> 0) + (i >>> 0), ku = (e, t, n, r, i, s) => t + n + r + i + s + (e / 2 ** 32 | 0) | 0;
function wr(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
const br = (e) => e ? `"${e}" ` : "";
function Bt(e, t = "") {
  if (typeof e != "number")
    throw new TypeError(br(t) + "expected number, got " + typeof e);
  if (!Number.isSafeInteger(e) || e < 0)
    throw new RangeError(br(t) + "expected integer >= 0, got " + e);
  return e;
}
function ft(e, t, n = "") {
  if (wr(e) && (t === void 0 || e.length === t))
    return e;
  t !== void 0 && Bt(t, "length");
  const r = wr(e), i = t !== void 0 ? ` of length ${t}` : "", s = r ? `length=${e.length}` : `type=${typeof e}`, o = br(n) + "expected Uint8Array" + i + ", got " + s;
  throw r ? new RangeError(o) : new TypeError(o);
}
function Ur(e) {
  if (typeof e != "function" || typeof e.create != "function")
    throw new TypeError("expected hash wrapped by utils.createHasher");
  if (Bt(e.outputLen), Bt(e.blockLen), e.outputLen < 1 || e.blockLen < 1)
    throw new Error("hash blockLen / outputLen must be >= 1");
}
const _u = (e, t) => {
  if (e === null || typeof e != "object" || Array.isArray(e))
    throw new TypeError((t === "object" ? "" : `"${t}" `) + "expected object, got type=" + typeof e);
}, Mi = (e, t) => {
  _u(e, t);
  const n = Object.getPrototypeOf(e);
  if (n !== Object.prototype && n !== null)
    throw new TypeError(`"${t}" expected plain object`);
  if (Object.hasOwn(e, "__proto__"))
    throw new TypeError(`"${t}.__proto__" is not allowed`);
};
function In(e, t = !0) {
  if (e.destroyed)
    throw new Error("hash was destroyed");
  if (t && e.finished)
    throw new Error("digest() was already called");
}
function Ms(e, t) {
  ft(e, void 0, "output");
  const n = t.outputLen;
  if (!(e.length >= n))
    throw new RangeError('"output" expected length >= ' + n);
}
function qt(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
function oe(e) {
  return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function Ot(e, t) {
  return e << 32 - t | e >>> t;
}
function mn(e, t) {
  return e << t | e >>> 32 - t >>> 0;
}
const Ts = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", Su = /* @__PURE__ */ Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
function Z(e) {
  if (ft(e), Ts)
    return e.toHex();
  let t = "";
  for (let n = 0; n < e.length; n++)
    t += Su[e[n]];
  return t;
}
function Ti(e) {
  return e >= 48 && e <= 57 ? e - 48 : e >= 65 && e <= 70 ? e - 55 : e >= 97 && e <= 102 ? e - 87 : void 0;
}
function F(e) {
  if (typeof e != "string")
    throw new TypeError("hex string expected, got " + typeof e);
  if (Ts)
    try {
      return Uint8Array.fromHex(e);
    } catch (i) {
      throw i instanceof SyntaxError ? new RangeError(i.message) : i;
    }
  const t = e.length, n = t / 2;
  if (t % 2)
    throw new RangeError("hex string expected, got unpadded hex of length " + t);
  const r = new Uint8Array(n);
  for (let i = 0, s = 0; i < n; i++, s += 2) {
    const o = Ti(e.charCodeAt(s)), a = Ti(e.charCodeAt(s + 1));
    if (o === void 0 || a === void 0) {
      const u = e[s] + e[s + 1];
      throw new RangeError('hex string expected, got non-hex character "' + u + '" at index ' + s);
    }
    r[i] = o * 16 + a;
  }
  return r;
}
function St(e) {
  if (typeof e != "string")
    throw new TypeError("string expected");
  const t = new TextEncoder().encode(e);
  try {
    return new Uint8Array(t);
  } finally {
    qt(t);
  }
}
function Bi(e, t = "") {
  return typeof e == "string" ? St(e) : ft(e, void 0, t);
}
function mt(...e) {
  let t = 0;
  for (let r = 0; r < e.length; r++) {
    const i = e[r];
    ft(i), t += i.length;
  }
  const n = new Uint8Array(t);
  for (let r = 0, i = 0; r < e.length; r++) {
    const s = e[r];
    n.set(s, i), i += s.length;
  }
  return n;
}
function Bs(e, t, n = "opts") {
  return Mi(e, "defaults"), t !== void 0 && Mi(t, n), Object.assign(/* @__PURE__ */ Object.create(null), e, t);
}
function Dr(e, t = {}) {
  if (typeof e != "function")
    throw new TypeError('"hashCons" expected function, got type=' + typeof e);
  t = Bs({}, t, "info");
  const n = (i, s) => e(s).update(i).digest(), r = e(void 0);
  return n.outputLen = r.outputLen, n.blockLen = r.blockLen, n.canXOF = r.canXOF, n.create = (i) => e(i), Object.assign(n, t), Object.freeze(n);
}
function zt(e = 32) {
  Bt(e, "bytesLength");
  const t = typeof globalThis == "object" ? globalThis.crypto : null;
  if (typeof t?.getRandomValues != "function")
    throw new Error("crypto.getRandomValues must be defined");
  if (e > 65536)
    throw new RangeError(`"bytesLength" expected <= 65536, got ${e}`);
  return t.getRandomValues(new Uint8Array(e));
}
const qs = (e) => ({
  // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
  // Larger suffix values would need base-128 OID encoding and a different length byte.
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, e])
});
function xu(e, t, n) {
  return e & t ^ ~e & n;
}
function Iu(e, t, n) {
  return e & t ^ e & n ^ t & n;
}
class Fr {
  blockLen;
  outputLen;
  canXOF = !1;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = !1;
  length = 0;
  pos = 0;
  destroyed = !1;
  constructor(t, n, r, i) {
    this.blockLen = t, this.outputLen = n, this.padOffset = r, this.isLE = i, this.buffer = new Uint8Array(t), this.view = oe(this.buffer);
  }
  update(t) {
    In(this), ft(t);
    const { view: n, buffer: r, blockLen: i } = this, s = t.length;
    let o = !1;
    for (let a = 0; a < s; ) {
      const u = Math.min(i - this.pos, s - a);
      if (u === i) {
        const l = oe(t);
        for (; i <= s - a; a += i)
          this.process(l, a);
        o = !0;
        continue;
      }
      r.set(a === 0 && u === s ? t : t.subarray(a, a + u), this.pos), this.pos += u, a += u, this.pos === i && (this.process(n, 0), this.pos = 0, o = !0);
    }
    return this.length += t.length, o && this.roundClean(), this;
  }
  digestInto(t) {
    In(this), Ms(t, this), this.finished = !0;
    const { buffer: n, view: r, blockLen: i, isLE: s } = this;
    let { pos: o } = this;
    n[o++] = 128, n.fill(0, o), this.padOffset > i - o && (this.process(r, 0), n.fill(0)), gu(r, i - 8, this.length * 8, s), this.process(r, 0), this.roundClean();
    const a = t === n ? r : oe(t), u = this.outputLen, l = u / 4, c = this.get();
    if (u % 4 || l > c.length)
      throw new Error("invalid outputLen");
    for (let d = 0; d < l; d++)
      a.setUint32(4 * d, c[d], s);
  }
  digest() {
    const { buffer: t, outputLen: n } = this;
    this.digestInto(t);
    const r = t.slice(0, n);
    return this.destroy(), r;
  }
  _cloneIntoMeta(t) {
    const { buffer: n, length: r, finished: i, destroyed: s, pos: o } = this;
    return t.destroyed = s, t.finished = i, t.length = r, t.pos = o, o && t.buffer.set(n), t;
  }
  clone() {
    return this._cloneInto();
  }
}
const Au = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]), Eu = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]), Mu = /* @__PURE__ */ Uint32Array.from([
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
]), Wt = /* @__PURE__ */ new Uint32Array(64);
class Tu extends Fr {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  // Numeric initializers matter: starting the fields as `undefined` changes
  // V8's field representation and makes sha256 3x slower (measured).
  A = 0;
  B = 0;
  C = 0;
  D = 0;
  E = 0;
  F = 0;
  G = 0;
  H = 0;
  constructor(t, n) {
    super(64, t, 8, !1), this.A = n[0] | 0, this.B = n[1] | 0, this.C = n[2] | 0, this.D = n[3] | 0, this.E = n[4] | 0, this.F = n[5] | 0, this.G = n[6] | 0, this.H = n[7] | 0;
  }
  get() {
    const { A: t, B: n, C: r, D: i, E: s, F: o, G: a, H: u } = this;
    return [t, n, r, i, s, o, a, u];
  }
  // prettier-ignore
  set(t, n, r, i, s, o, a, u) {
    this.A = t | 0, this.B = n | 0, this.C = r | 0, this.D = i | 0, this.E = s | 0, this.F = o | 0, this.G = a | 0, this.H = u | 0;
  }
  _cloneInto(t) {
    return (t ||= new this.constructor()).set(...this.get()), this._cloneIntoMeta(t);
  }
  process(t, n) {
    for (let d = 0; d < 16; d++, n += 4)
      Wt[d] = t.getUint32(n, !1);
    for (let d = 16; d < 64; d++) {
      const f = Wt[d - 15], p = Wt[d - 2], g = Ot(f, 7) ^ Ot(f, 18) ^ f >>> 3, m = Ot(p, 17) ^ Ot(p, 19) ^ p >>> 10;
      Wt[d] = m + Wt[d - 7] + g + Wt[d - 16] | 0;
    }
    let { A: r, B: i, C: s, D: o, E: a, F: u, G: l, H: c } = this;
    for (let d = 0; d < 64; d++) {
      const f = Ot(a, 6) ^ Ot(a, 11) ^ Ot(a, 25), p = c + f + xu(a, u, l) + Mu[d] + Wt[d] | 0, m = (Ot(r, 2) ^ Ot(r, 13) ^ Ot(r, 22)) + Iu(r, i, s) | 0;
      c = l, l = u, u = a, a = o + p | 0, o = s, s = i, i = r, r = p + m | 0;
    }
    r = r + this.A | 0, i = i + this.B | 0, s = s + this.C | 0, o = o + this.D | 0, a = a + this.E | 0, u = u + this.F | 0, l = l + this.G | 0, c = c + this.H | 0, this.set(r, i, s, o, a, u, l, c);
  }
  roundClean() {
    qt(Wt);
  }
  destroy() {
    this.destroyed = !0, this.set(0, 0, 0, 0, 0, 0, 0, 0), qt(this.buffer);
  }
}
class Bu extends Tu {
  constructor() {
    super(32, Au);
  }
}
const Os = du([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((e) => BigInt(e))), qu = Os[0], Ou = Os[1], Gt = /* @__PURE__ */ new Uint32Array(80), Zt = /* @__PURE__ */ new Uint32Array(80);
class Pu extends Fr {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  // h -- high 32 bits, l -- low 32 bits
  // Numeric initializers matter: starting the fields as `undefined` changes
  // V8's field representation and slows hashing down (measured on sha256).
  Ah = 0;
  Al = 0;
  Bh = 0;
  Bl = 0;
  Ch = 0;
  Cl = 0;
  Dh = 0;
  Dl = 0;
  Eh = 0;
  El = 0;
  Fh = 0;
  Fl = 0;
  Gh = 0;
  Gl = 0;
  Hh = 0;
  Hl = 0;
  constructor(t, n) {
    super(128, t, 16, !1), this.Ah = n[0] | 0, this.Al = n[1] | 0, this.Bh = n[2] | 0, this.Bl = n[3] | 0, this.Ch = n[4] | 0, this.Cl = n[5] | 0, this.Dh = n[6] | 0, this.Dl = n[7] | 0, this.Eh = n[8] | 0, this.El = n[9] | 0, this.Fh = n[10] | 0, this.Fl = n[11] | 0, this.Gh = n[12] | 0, this.Gl = n[13] | 0, this.Hh = n[14] | 0, this.Hl = n[15] | 0;
  }
  // prettier-ignore
  get() {
    const { Ah: t, Al: n, Bh: r, Bl: i, Ch: s, Cl: o, Dh: a, Dl: u, Eh: l, El: c, Fh: d, Fl: f, Gh: p, Gl: g, Hh: m, Hl: w } = this;
    return [t, n, r, i, s, o, a, u, l, c, d, f, p, g, m, w];
  }
  // prettier-ignore
  set(t, n, r, i, s, o, a, u, l, c, d, f, p, g, m, w) {
    this.Ah = t | 0, this.Al = n | 0, this.Bh = r | 0, this.Bl = i | 0, this.Ch = s | 0, this.Cl = o | 0, this.Dh = a | 0, this.Dl = u | 0, this.Eh = l | 0, this.El = c | 0, this.Fh = d | 0, this.Fl = f | 0, this.Gh = p | 0, this.Gl = g | 0, this.Hh = m | 0, this.Hl = w | 0;
  }
  _cloneInto(t) {
    return (t ||= new this.constructor()).set(...this.get()), this._cloneIntoMeta(t);
  }
  process(t, n) {
    for (let b = 0; b < 16; b++, n += 4)
      Gt[b] = t.getUint32(n), Zt[b] = t.getUint32(n += 4);
    for (let b = 16; b < 80; b++) {
      const E = Gt[b - 15] | 0, M = Zt[b - 15] | 0, A = he(E, M, 1) ^ he(E, M, 8) ^ Ai(E, M, 7), H = de(E, M, 1) ^ de(E, M, 8) ^ Ei(E, M, 7), C = Gt[b - 2] | 0, D = Zt[b - 2] | 0, W = he(C, D, 19) ^ pn(C, D, 61) ^ Ai(C, D, 6), T = de(C, D, 19) ^ gn(C, D, 61) ^ Ei(C, D, 6), B = wu(H, T, Zt[b - 7], Zt[b - 16]), $ = bu(B, A, W, Gt[b - 7], Gt[b - 16]);
      Gt[b] = $ | 0, Zt[b] = B | 0;
    }
    let { Ah: r, Al: i, Bh: s, Bl: o, Ch: a, Cl: u, Dh: l, Dl: c, Eh: d, El: f, Fh: p, Fl: g, Gh: m, Gl: w, Hh: v, Hl: x } = this;
    for (let b = 0; b < 80; b++) {
      const E = he(d, f, 14) ^ he(d, f, 18) ^ pn(d, f, 41), M = de(d, f, 14) ^ de(d, f, 18) ^ gn(d, f, 41), A = d & p ^ ~d & m, H = f & g ^ ~f & w, C = vu(x, M, H, Ou[b], Zt[b]), D = ku(C, v, E, A, qu[b], Gt[b]), W = C | 0, T = he(r, i, 28) ^ pn(r, i, 34) ^ pn(r, i, 39), B = de(r, i, 28) ^ gn(r, i, 34) ^ gn(r, i, 39), $ = r & s ^ r & a ^ s & a, R = i & o ^ i & u ^ o & u;
      v = m | 0, x = w | 0, m = p | 0, w = g | 0, p = d | 0, g = f | 0, { h: d, l: f } = Kt(l | 0, c | 0, D | 0, W | 0), l = a | 0, c = u | 0, a = s | 0, u = o | 0, s = r | 0, o = i | 0;
      const X = mu(W, B, R);
      r = yu(X, D, T, $), i = X | 0;
    }
    ({ h: r, l: i } = Kt(this.Ah | 0, this.Al | 0, r | 0, i | 0)), { h: s, l: o } = Kt(this.Bh | 0, this.Bl | 0, s | 0, o | 0), { h: a, l: u } = Kt(this.Ch | 0, this.Cl | 0, a | 0, u | 0), { h: l, l: c } = Kt(this.Dh | 0, this.Dl | 0, l | 0, c | 0), { h: d, l: f } = Kt(this.Eh | 0, this.El | 0, d | 0, f | 0), { h: p, l: g } = Kt(this.Fh | 0, this.Fl | 0, p | 0, g | 0), { h: m, l: w } = Kt(this.Gh | 0, this.Gl | 0, m | 0, w | 0), { h: v, l: x } = Kt(this.Hh | 0, this.Hl | 0, v | 0, x | 0), this.set(r, i, s, o, a, u, l, c, d, f, p, g, m, w, v, x);
  }
  roundClean() {
    qt(Gt, Zt);
  }
  destroy() {
    this.destroyed = !0, qt(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
class Cu extends Pu {
  constructor() {
    super(64, Eu);
  }
}
const at = /* @__PURE__ */ Dr(
  () => new Bu(),
  /* @__PURE__ */ qs(1)
), vr = /* @__PURE__ */ Dr(
  () => new Cu(),
  /* @__PURE__ */ qs(3)
);
/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const jt = (e) => Object.freeze(e());
function Ps(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
function Qt(e) {
  if (!Ps(e))
    throw new TypeError("Uint8Array expected");
}
function Ru(e, t) {
  return Array.isArray(t) ? t.length === 0 ? !0 : t.every((n) => Number.isSafeInteger(n)) : !1;
}
function zr(e) {
  if (typeof e != "function")
    throw new TypeError("function expected");
  return !0;
}
function ue(e, t) {
  if (typeof t != "string")
    throw new TypeError(`${e}: string expected`);
  return !0;
}
function Ze(e, t = "number") {
  if (typeof e != "number")
    throw new TypeError(`${t}: expected number, got ${typeof e}`);
  if (!Number.isSafeInteger(e))
    throw new RangeError(`${t}: expected safe integer, got ${e}`);
}
function qi(e, t) {
  if (!Ru(!1, t))
    throw new TypeError(`${e}: array of numbers expected`);
}
function on(...e) {
  const t = (s) => s, n = (s, o) => (a) => s(o(a)), r = e.map((s) => s.encode).reduceRight(n, t), i = e.map((s) => s.decode).reduce(n, t);
  return { encode: r, decode: i };
}
const $u = /* @__PURE__ */ (() => {
  let e = [];
  for (let t = 0; t < 40; t++)
    e.push(2 ** t);
  return e;
})();
function Oi(e, t = e.length) {
  const n = new Array(t);
  for (let r = 0; r < t; r++)
    n[r] = e[r];
  return n;
}
const Pi = /* @__PURE__ */ (() => {
  try {
    const e = new TextDecoder();
    return e.decode(Uint8Array.of(65, 48, 43, 127)) === "A0+" ? e : void 0;
  } catch {
    return;
  }
})(), nr = 8192;
function Lu(e) {
  const t = e.length;
  if (Pi !== void 0 && t >= 12)
    return Pi.decode(e);
  if (t <= nr)
    return String.fromCharCode.apply(null, e);
  let n = "";
  for (let r = 0; r < t; r += nr)
    n += String.fromCharCode.apply(null, e.subarray(r, r + nr));
  return n;
}
function an(e) {
  if (Ze(e), e <= 0 || e > 8)
    throw new RangeError("radix2: bits should be in (0..8]");
  const t = $u[e] - 1;
  return {
    encode: (n) => {
      Qt(n);
      const r = n.length, i = new Uint8Array(Math.ceil(r * 8 / e));
      let s = 0, o = 0, a = 0;
      for (let u = 0; u < r; )
        for (u + 2 < r ? (s = s << 24 | n[u] << 16 | n[u + 1] << 8 | n[u + 2], o += 24, u += 3) : (s = (s << 8 | n[u]) & 65535, o += 8, u++); o -= e, i[a++] = s >> o & t, !(o < e); )
          ;
      return o > 0 && (i[a] = s << e - o & t), i;
    },
    decode: (n) => {
      const r = n.length, i = new Uint8Array(Math.floor(r * e / 8));
      let s = 0, o = 0, a = 0;
      for (let u = 0; u < r; u++)
        for (s = (s << e | n[u]) & 65535, o += e; o >= 8; o -= 8)
          i[a++] = s >> o - 8 & 255;
      if (s = s << 8 - o & 255, o >= e)
        throw new Error("Excess padding");
      if (s > 0)
        throw new Error(`Non-zero padding: ${s}`);
      return i;
    }
  };
}
function Be(e, t) {
  const n = e.length;
  if (n > 128)
    throw new Error("alphabet: max 128 letters");
  const r = new Uint8Array(n), i = new Int8Array(128).fill(-1);
  for (let s = 0; s < n; s++) {
    const o = e.charCodeAt(s);
    if (e.codePointAt(s) !== o || o > 127)
      throw new Error("alphabet: single-char ASCII letters only");
    r[s] = o, i[o] = s;
  }
  if (t !== void 0)
    for (const s of Object.keys(t)) {
      const o = s.charCodeAt(0), a = i[t[s].charCodeAt(0)];
      if (s.length !== 1 || o > 127 || a === void 0 || a === -1)
        throw new Error(`alphabet: invalid alias ${s}`);
      i[o] = a;
    }
  return {
    encode: (s) => {
      const o = new Uint8Array(s.length);
      for (let a = 0; a < s.length; a++) {
        const u = s[a], l = r[u];
        if (l === void 0)
          throw new Error(`alphabet.encode: invalid digit ${u}`);
        o[a] = l;
      }
      return Lu(o);
    },
    decode: (s) => {
      ue("decode", s);
      const o = s.length, a = new Uint8Array(o);
      for (let u = 0; u < o; u++) {
        const l = s.charCodeAt(u), c = l < 128 ? i[l] : -1;
        if (c === -1)
          throw new Error(`Unknown letter "${s[u]}". Allowed: ${e}`);
        a[u] = c;
      }
      return a;
    }
  };
}
function Cs(e, t = "=") {
  return Ze(e), ue("padding", t), {
    encode(n) {
      for (; n.length * e % 8; )
        n += t;
      return n;
    },
    decode(n) {
      ue("decode", n);
      let r = n.length;
      if (r * e % 8)
        throw new Error("padding: invalid length");
      for (; r > 0 && n[r - 1] === t; r--)
        if ((r - 1) * e % 8 === 0)
          throw new Error("padding: excess padding");
      return n.slice(0, r);
    }
  };
}
function Ci(e) {
  return zr(e), function(...t) {
    try {
      return e.apply(null, t);
    } catch {
    }
  };
}
function Ku(e, t) {
  if (Ze(e), e <= 0)
    throw new RangeError(`checksum length must be positive: ${e}`);
  zr(t);
  const n = t;
  return {
    encode(r) {
      Qt(r);
      const i = n(r).slice(0, e), s = new Uint8Array(r.length + e);
      return s.set(r), s.set(i, r.length), s;
    },
    decode(r) {
      Qt(r);
      const i = r.slice(0, -e), s = r.slice(-e), o = n(i).slice(0, e);
      for (let a = 0; a < e; a++)
        if (o[a] !== s[a])
          throw new Error("Invalid checksum");
      return i;
    }
  };
}
const Rs = typeof Uint8Array.from([]).toBase64 == "function" && typeof Uint8Array.fromBase64 == "function", Nu = /[\t\n\f\r ]/, $s = (e, t) => {
  ue("base64", e);
  const n = t ? "base64url" : "base64";
  if (e.length > 0 && Nu.test(e))
    throw new Error("invalid base64");
  return Uint8Array.fromBase64(e, { alphabet: n, lastChunkHandling: "strict" });
}, Uu = /* @__PURE__ */ jt(() => on(an(6), Be("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), Cs(6))), Du = /* @__PURE__ */ jt(() => on(an(6), Be("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), Cs(6))), Fu = /* @__PURE__ */ jt(() => Rs ? {
  encode(e) {
    return Qt(e), e.toBase64();
  },
  decode(e) {
    return $s(e, !1);
  }
} : Uu), Ls = /* @__PURE__ */ jt(() => on(an(6), Be("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"))), zu = /* @__PURE__ */ jt(() => Rs ? {
  encode(e) {
    return Qt(e), e.toBase64({ alphabet: "base64url" });
  },
  decode(e) {
    return $s(e, !0);
  }
} : Du), Qr = /* @__PURE__ */ jt(() => on(an(6), Be("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"))), Qu = 656356768, Ri = 65536, Hu = 2048, ju = 4096, Wu = (e, t) => ({
  encode: (n) => {
    Qt(n);
    const r = n.length;
    if (r === 0)
      return new Uint8Array(0);
    if (r >= Ri)
      throw new Error("invalid length");
    let i = 0;
    for (; i < r - 1 && n[i] === 0; )
      i++;
    const s = Math.ceil(r / 2), o = new Uint16Array(s), a = r & 1;
    a && (o[0] = n[0]);
    for (let g = a, m = a; g < r; g += 2, m++)
      o[m] = n[g] << 8 | n[g + 1];
    const u = [];
    let l = 0;
    for (; l < s; ) {
      let g = 0;
      for (let m = l; m < s; m++) {
        const w = g * 65536 + o[m], v = Math.floor(w / t);
        g = w - v * t, o[m] = v, v === 0 && m === l && l++;
      }
      u.push(g);
    }
    const c = u.length - 1;
    let d = c * 5;
    for (let g = u[c]; d++, !(g < e); g = Math.floor(g / e))
      ;
    const f = new Uint8Array(i + d);
    let p = f.length - 1;
    for (let g = 0; g < c; g++) {
      let m = u[g];
      for (let w = 0; w < 5; w++)
        f[p--] = m % e, m = Math.floor(m / e);
    }
    for (let g = u[c]; p >= i; g = Math.floor(g / e))
      f[p--] = g % e;
    return f;
  },
  decode: (n) => {
    Qt(n);
    const r = n.length;
    if (r === 0)
      return new Uint8Array(0);
    if (r >= Ri)
      throw new Error("invalid length");
    let i = 0;
    for (; i < r - 1 && n[i] === 0; )
      i++;
    const s = new Uint16Array(Math.ceil(r * 6 / 16) + 1);
    let o = 0, a = 0, u = r % 5 || 5;
    for (; a < r; ) {
      let f = 0, p = 1;
      for (const m = a + u; a < m; a++) {
        const w = n[a];
        if (w >= e)
          throw new Error(`invalid integer: ${w}`);
        f = f * e + w, p *= e;
      }
      u = 5;
      let g = f;
      for (let m = 0; m < o; m++) {
        const w = s[m] * p + g;
        g = Math.floor(w / 65536), s[m] = w - g * 65536;
      }
      for (; g > 0; g = Math.floor(g / 65536))
        s[o++] = g % 65536;
    }
    const l = o === 0 ? 1 : o * 2 - (s[o - 1] < 256 ? 1 : 0), c = new Uint8Array(i + l);
    let d = c.length - 1;
    for (let f = 0; f < o; f++) {
      const p = s[f];
      c[d--] = p & 255, d >= i && (c[d--] = p >> 8);
    }
    return c;
  }
}), Gu = (e, t) => {
  const n = Be(t);
  return {
    encode(r) {
      if (Qt(r), r.length > Hu)
        throw new Error("invalid length");
      return n.encode(e.encode(r));
    },
    decode(r) {
      if (ue("baseN.decode", r), r.length > ju)
        throw new Error("invalid length");
      return e.decode(n.decode(r));
    }
  };
}, Zu = /* @__PURE__ */ Wu(58, Qu), Vu = (e) => Gu(Zu, e), Yu = /* @__PURE__ */ jt(() => Vu("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")), Ju = (e) => {
  zr(e);
  const t = e;
  return on(Ku(4, (n) => t(t(n))), Yu);
}, kr = /* @__PURE__ */ Be("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), Xu = /^[\x21-\x60\x7b-\x7e]+$/;
function $i(e, t) {
  for (let n = 0; n < t.length; n++) {
    const r = t.charCodeAt(n);
    if (r < 33 || r > 126)
      throw new Error(`${e}: printable ASCII expected`);
  }
}
function tl(e) {
  const t = e.length, n = new Uint8Array(t);
  for (let r = 0; r < t; r++) {
    const i = e[r];
    if (i < 0 || i >= 32)
      throw new Error(`alphabet.encode: invalid digit ${i}`);
    n[r] = i;
  }
  return n;
}
const Li = [996825010, 642813549, 513874426, 1027748829, 705979059];
function Pe(e) {
  const t = e >> 25;
  let n = (e & 33554431) << 5;
  for (let r = 0; r < Li.length; r++)
    (t >> r & 1) === 1 && (n ^= Li[r]);
  return n;
}
function Ki(e, t, n = 1) {
  const r = e.length;
  let i = 1;
  for (let o = 0; o < r; o++) {
    const a = e.charCodeAt(o);
    if (a < 33 || a > 126)
      throw new Error(`Invalid prefix (${e})`);
    i = Pe(i) ^ a >> 5;
  }
  i = Pe(i);
  for (let o = 0; o < r; o++)
    i = Pe(i) ^ e.charCodeAt(o) & 31;
  for (let o of t)
    i = Pe(i) ^ o;
  for (let o = 0; o < 6; o++)
    i = Pe(i);
  i ^= n;
  const s = new Uint8Array(6);
  for (let o = 0; o < 6; o++)
    s[o] = i >>> 5 * (5 - o) & 31;
  return kr.encode(s);
}
function Ks(e) {
  const t = e === "bech32" ? 1 : 734539939, n = an(5), r = (d) => {
    Qt(d);
    const f = d.length, p = new Array(Math.ceil(f * 8 / 5));
    let g = 0, m = 0, w = 0;
    for (let v = 0; v < f; v++)
      for (g = g << 8 | d[v], m += 8; m >= 5; m -= 5)
        p[w++] = g >> m - 5 & 31;
    return m > 0 && (p[w] = g << 5 - m & 31), p;
  }, i = (d) => {
    qi("radix2.decode", d);
    const f = d.length, p = new Uint8Array(f);
    for (let g = 0; g < f; g++) {
      const m = d[g];
      if (m < 0 || m >= 32)
        throw new Error(`convertRadix2: invalid word=${m}`);
      p[g] = m;
    }
    return n.decode(p);
  }, s = Ci(i);
  function o(d, f, p = 90) {
    ue("bech32.encode prefix", d), p !== !1 && Ze(p, "limit"), Ps(f) && (f = Oi(f)), qi("bech32.encode", f);
    const g = d.length;
    if (g === 0)
      throw new TypeError(`Invalid prefix length ${g}`);
    const m = g + 7 + f.length;
    if (p !== !1 && m > p)
      throw new TypeError(`Length ${m} exceeds limit ${p}`);
    $i("bech32.encode prefix", d);
    const w = d.toLowerCase(), v = Ki(w, f, t);
    return `${w}1${kr.encode(tl(f))}${v}`;
  }
  function a(d, f = 90) {
    ue("bech32.decode input", d), f !== !1 && Ze(f, "limit");
    const p = d.length;
    if (p < 8 || f !== !1 && p > f)
      throw new TypeError(`invalid string length ${p}, expected (8..${f})`);
    const g = d.toLowerCase();
    if (d !== g && !Xu.test(d))
      throw $i("bech32.decode input", d), new Error("mixed-case string not allowed");
    const m = g.lastIndexOf("1");
    if (m === 0 || m === -1)
      throw new Error('invalid separator "1"');
    const w = g.slice(0, m), v = g.slice(m + 1);
    if (v.length < 6)
      throw new Error("invalid data length");
    const x = kr.decode(v), b = Oi(x, x.length - 6), E = Ki(w, b, t);
    if (!v.endsWith(E))
      throw new Error(`Invalid checksum in ${d}`);
    return { prefix: w, words: b };
  }
  const u = Ci(a);
  function l(d, f = 90) {
    const { prefix: p, words: g } = a(d, f);
    return {
      prefix: p,
      words: g,
      bytes: i(g)
    };
  }
  function c(d, f) {
    return o(d, r(f));
  }
  return {
    encode: o,
    decode: a,
    encodeFromBytes: c,
    decodeToBytes: l,
    decodeUnsafe: u,
    fromWords: i,
    fromWordsUnsafe: s,
    toWords: r
  };
}
const xe = /* @__PURE__ */ jt(() => Ks("bech32")), An = /* @__PURE__ */ jt(() => Ks("bech32m"));
class Ni {
  oHash;
  iHash;
  blockLen;
  outputLen;
  canXOF = !1;
  finished = !1;
  destroyed = !1;
  constructor(t, n) {
    if (Ur(t), ft(n, void 0, "key"), this.iHash = t.create(), typeof this.iHash.update != "function")
      throw new Error("expected Hash instance");
    this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
    const r = this.blockLen, i = new Uint8Array(r);
    i.set(n.length > r ? t.create().update(n).digest() : n);
    for (let s = 0; s < i.length; s++)
      i[s] ^= 54;
    this.iHash.update(i), this.oHash = t.create();
    for (let s = 0; s < i.length; s++)
      i[s] ^= 106;
    this.oHash.update(i), qt(i);
  }
  update(t) {
    return In(this), this.iHash.update(t), this;
  }
  digestInto(t) {
    In(this), Ms(t, this), this.finished = !0;
    const n = t.subarray(0, this.outputLen);
    this.iHash.digestInto(n), this.oHash.update(n), this.oHash.digestInto(n), this.destroy();
  }
  digest() {
    const t = new Uint8Array(this.oHash.outputLen);
    return this.digestInto(t), t;
  }
  _cloneInto(t) {
    t ||= Object.create(Object.getPrototypeOf(this), {});
    const { oHash: n, iHash: r, finished: i, destroyed: s, blockLen: o, outputLen: a, canXOF: u } = this;
    return t = t, t.finished = i, t.destroyed = s, t.blockLen = o, t.outputLen = a, t.canXOF = u, t.oHash = n._cloneInto(t.oHash), t.iHash = r._cloneInto(t.iHash), t;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = !0, this.oHash.destroy(), this.iHash.destroy();
  }
}
const Ie = /* @__PURE__ */ (() => {
  const e = ((t, n, r) => new Ni(t, n).update(r).digest());
  return e.create = (t, n) => new Ni(t, n), e;
})();
function el(e, t, n, r) {
  Ur(e);
  const i = Bs({ dkLen: 32, asyncTick: 10 }, r), { c: s, dkLen: o, asyncTick: a } = i;
  if (Bt(s, "c"), Bt(o, "dkLen"), Bt(a, "asyncTick"), s < 1)
    throw new Error('"c" (iterations) must be >= 1');
  if (o < 1)
    throw new Error('"dkLen" must be >= 1');
  if (o > (2 ** 32 - 1) * e.outputLen)
    throw new Error("derived key too long");
  const u = Bi(t, "password");
  try {
    const l = Bi(n, "salt");
    try {
      const c = new Uint8Array(o), { iHash: d, oHash: f, outputLen: p } = Ie.create(e, u), g = new Uint8Array(p), m = nl(d, f, l, g);
      return { c: s, dkLen: o, asyncTick: a, DK: c, outputLen: p, eng: m };
    } finally {
      typeof n == "string" && qt(l);
    }
  } finally {
    typeof t == "string" && qt(u);
  }
}
function nl(e, t, n, r) {
  const i = new Uint8Array(4), s = oe(i), o = e._cloneInto().update(n), a = t._cloneInto(), u = e._cloneInto, l = t._cloneInto;
  return {
    u1: (c, d) => {
      s.setInt32(0, c, !1), o._cloneInto(a).update(i).digestInto(r), t._cloneInto(a).update(r).digestInto(r), d.set(r.subarray(0, d.length));
    },
    // Whole `F` inner loop for the sync variant: one optimized function owns the hot loop.
    rounds: (c, d) => {
      for (let f = 1; f < c; f++) {
        u.call(e, a).update(r).digestInto(r), l.call(t, a).update(r).digestInto(r);
        for (let p = 0; p < d.length; p++)
          d[p] ^= r[p];
      }
    },
    output: (c) => (e.destroy(), t.destroy(), o.destroy(), a.destroy(), qt(r), c)
  };
}
function rl(e, t, n, r) {
  const { c: i, dkLen: s, DK: o, outputLen: a, eng: u } = el(e, t, n, r);
  for (let l = 1, c = 0; c < s; l++, c += a) {
    const d = o.subarray(c, c + a);
    u.u1(l, d), u.rounds(i, d);
  }
  return u.output(o);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function Ns(e, t, n = () => {
}) {
  if (!Array.isArray(e))
    throw new TypeError(`"${t}" expected array, got type=${typeof e}`);
  for (let r = 0; r < e.length; r++)
    n(e[r], `${t}[${r}]`);
  return e;
}
const J = (e, t, n) => ft(e, t, n), Us = Bt;
function il(e, t = "") {
  if (typeof e != "string") {
    const n = t && `"${t}" `;
    throw new TypeError(n + "expected string, got type=" + typeof e);
  }
  return e;
}
function we(e, t = "object") {
  if (e === null || typeof e != "object" || Array.isArray(e))
    throw new TypeError(t === "object" ? "expected valid options object" : `"${t}" expected object, got type=${typeof e}`);
  return e;
}
function je(e, t) {
  if (typeof e != "function")
    throw new TypeError(`"${t}" is invalid: expected function, got ${typeof e}`);
  return e;
}
const Ds = Z, $t = (...e) => mt(...e), _r = (e) => F(e), Dn = wr, Hr = (e) => zt(e), En = /* @__PURE__ */ BigInt(0), Ui = /* @__PURE__ */ BigInt(1), sl = (e) => e ? `"${e}" ` : "";
function le(e, t = "") {
  if (typeof e != "boolean")
    throw new TypeError(sl(t) + "expected boolean, got type=" + typeof e);
  return e;
}
function jr(e) {
  if (typeof e == "bigint") {
    if (!ae(e))
      throw new RangeError("positive bigint expected, got " + e);
  } else
    Us(e);
  return e;
}
function Ve(e, t = "") {
  if (typeof e != "number") {
    const n = t && `"${t}" `;
    throw new TypeError(n + "expected number, got type=" + typeof e);
  }
  if (!Number.isSafeInteger(e)) {
    const n = t && `"${t}" `;
    throw new RangeError(n + "expected safe integer, got " + e);
  }
}
function yn(e) {
  const t = jr(e).toString(16);
  return t.length & 1 ? "0" + t : t;
}
function Fs(e) {
  if (typeof e != "string")
    throw new TypeError("hex string expected, got " + typeof e);
  return e === "" ? En : BigInt("0x" + e);
}
function xt(e) {
  return Fs(Z(e));
}
function zs(e) {
  return Fs(Z(js(ft(e)).reverse()));
}
function Ft(e, t) {
  if (Bt(t), t === 0)
    throw new Error("zero output length is invalid");
  e = jr(e);
  const n = t * 2, r = e.toString(16);
  if (r.length > n)
    throw new RangeError("number is too large");
  return F(r.padStart(n, "0"));
}
function Qs(e, t) {
  return Ft(e, t).reverse();
}
function Hs(e, t) {
  if (e = J(e), t = J(t), e.length !== t.length)
    return !1;
  let n = 0;
  for (let r = 0; r < e.length; r++)
    n |= e[r] ^ t[r];
  return n === 0;
}
function js(e) {
  return Uint8Array.from(J(e));
}
function ol(e) {
  if (typeof e != "string")
    throw new TypeError("ascii string expected, got " + typeof e);
  return Uint8Array.from(e, (t, n) => {
    const r = t.charCodeAt(0);
    if (t.length !== 1 || r > 127)
      throw new RangeError(`string contains non-ASCII character "${e[n]}" with code ${r} at position ${n}`);
    return r;
  });
}
function ae(e) {
  return typeof e == "bigint" && En <= e;
}
function Ws(e, t, n) {
  return ae(e) && ae(t) && ae(n) && t <= e && e < n;
}
function Gs(e, t, n, r) {
  if (!Ws(t, n, r))
    throw new RangeError("expected valid " + e + ": " + n + " <= n < " + r + ", got " + t);
}
function Wr(e) {
  if (e < En)
    throw new Error("expected non-negative bigint, got " + e);
  return e === En ? 0 : e.toString(2).length;
}
const Gr = (e) => (Ve(e, "n"), (Ui << BigInt(e)) - Ui);
function al(e, t, n) {
  if (Bt(e, "hashLen"), Bt(t, "qByteLen"), typeof n != "function")
    throw new TypeError("hmacFn must be a function");
  const r = (w) => new Uint8Array(w), i = Uint8Array.of(), s = Uint8Array.of(0), o = Uint8Array.of(1), a = 1e3;
  let u = r(e), l = r(e), c = 0;
  const d = () => {
    u.fill(1), l.fill(0), c = 0;
  }, f = (...w) => n(l, $t(u, ...w)), p = (w = i) => {
    l = f(s, w), u = f(), w.length !== 0 && (l = f(o, w), u = f());
  }, g = () => {
    if (c++ >= a)
      throw new Error("drbg: tried max amount of iterations");
    let w = 0;
    const v = [];
    for (; w < t; ) {
      u = f();
      const x = u.slice();
      v.push(x), w += u.length;
    }
    return $t(...v);
  };
  return (w, v) => {
    d(), p(w);
    let x;
    for (; (x = v(g())) === void 0; )
      p();
    return d(), x;
  };
}
function un(e, t = {}, n = {}, r = "object") {
  we(e, r), we(t, "fields"), we(n, "optFields");
  function i(o, a, u) {
    const l = r === "object" ? `param "${String(o)}"` : `"${r}.${String(o)}"`, c = e[o];
    if (!Object.hasOwn(e, o) && (u ? c !== void 0 : a !== "function"))
      throw new TypeError(`${l} is invalid: expected own property`);
    if (u && c === void 0)
      return;
    const d = typeof c;
    if (d !== a || c === null)
      throw new TypeError(`${l} is invalid: expected ${a}, got ${d}`);
  }
  const s = (o, a) => Object.entries(o).forEach(([u, l]) => i(u, l, a));
  s(t, !1), s(n, !0);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const ct = /* @__PURE__ */ BigInt(0), V = /* @__PURE__ */ BigInt(1), Jt = /* @__PURE__ */ BigInt(2), Zs = /* @__PURE__ */ BigInt(3), Zr = /* @__PURE__ */ BigInt(4), Vs = /* @__PURE__ */ BigInt(5), ul = /* @__PURE__ */ BigInt(7), Ys = /* @__PURE__ */ BigInt(8), ll = /* @__PURE__ */ BigInt(9), cl = /* @__PURE__ */ BigInt(15), Js = /* @__PURE__ */ BigInt(16), hl = /* @__PURE__ */ BigInt("0x10000000000000000");
function kt(e, t) {
  if (t <= ct)
    throw new Error("mod: expected positive modulus, got " + t);
  const n = e % t;
  return n >= ct ? n : t + n;
}
function Xs(e, t, n) {
  if (n <= V)
    throw new Error("pow: expected modulus > 1, got " + n);
  if (typeof t != "bigint")
    throw new TypeError("invalid exponent: expected bigint, got " + typeof t);
  if (t < ct)
    throw new Error("invalid exponent, negatives unsupported");
  if (t === ct)
    return V;
  if (t === V)
    return e;
  let r = e % n;
  if (r < ct && (r += n), t < hl) {
    let a = V;
    for (; t > ct; )
      t & V && (a = a * r % n), r = r * r % n, t >>= V;
    return a;
  }
  const i = [];
  for (; t > ct; )
    i.push(Number(t & cl)), t >>= Zr;
  const s = new Array(16);
  s[0] = V, s[1] = r;
  for (let a = 2; a < 16; a++)
    s[a] = s[a - 1] * r % n;
  let o = s[i[i.length - 1]];
  for (let a = i.length - 2; a >= 0; a--) {
    o = o * o % n, o = o * o % n, o = o * o % n, o = o * o % n;
    const u = i[a];
    u !== 0 && (o = o * s[u] % n);
  }
  return o;
}
function At(e, t, n) {
  if (n <= V)
    throw new Error("pow2: expected modulus > 1, got " + n);
  if (t < ct)
    throw new Error("pow2: expected non-negative exponent, got " + t);
  let r = e;
  for (; t-- > ct; )
    r *= r, r %= n;
  return r;
}
function Di(e, t) {
  if (e === ct)
    throw new Error("invert: expected non-zero number");
  if (t <= V)
    throw new Error("invert: expected modulus > 1, got " + t);
  let n = kt(e, t), r = t, i = ct, s = V;
  for (; n !== ct; ) {
    const a = r / n, u = r - n * a, l = i - s * a;
    r = n, n = u, i = s, s = l;
  }
  if (r !== V)
    throw new Error("invert: does not exist");
  return kt(i, t);
}
function dl(e, t) {
  if (t <= V)
    throw new Error("invertCt: expected prime modulus > 1, got " + t);
  const n = kt(e, t);
  if (n === ct)
    throw new Error("invertCt: expected non-zero number");
  const r = Xs(n, t - Jt, t);
  if (kt(n * r, t) !== V)
    throw new Error("invertCt: does not exist");
  return r;
}
function Vr(e, t, n) {
  const r = e;
  if (!r.eql(r.sqr(t), n))
    throw new Error("Cannot find square root");
}
function Yr(e, t) {
  if ((e & V) === ct)
    throw new Error(t + ": expected odd modulus, got " + e);
}
function to(e, t) {
  const n = e, r = (n.ORDER + V) / Zr, i = n.pow(t, r);
  return Vr(n, i, t), i;
}
function fl(e, t) {
  const n = e, r = (n.ORDER - Vs) / Ys, i = n.mul(t, Jt), s = n.pow(i, r), o = n.mul(t, s), a = n.mul(n.mul(o, Jt), s), u = n.mul(o, n.sub(a, n.ONE));
  return Vr(n, u, t), u;
}
function pl(e) {
  const t = Fn(e), n = eo(e), r = n(t, t.neg(t.ONE)), i = n(t, r), s = n(t, t.neg(r)), o = (e + ul) / Js;
  return ((a, u) => {
    const l = a;
    let c = l.pow(u, o), d = l.mul(c, r);
    const f = l.mul(c, i), p = l.mul(c, s), g = l.eql(l.sqr(d), u), m = l.eql(l.sqr(f), u);
    c = l.cmov(c, d, g), d = l.cmov(p, f, m);
    const w = l.eql(l.sqr(d), u), v = l.cmov(c, d, w);
    return Vr(l, v, u), v;
  });
}
function eo(e) {
  if (e < Zs)
    throw new Error("sqrt is not defined for small field");
  Yr(e, "tonelliShanks");
  let t = e - V, n = 0;
  for (; t % Jt === ct; )
    t /= Jt, n++;
  let r = Jt;
  const i = Fn(e);
  for (; Fi(i, r) === 1; )
    if (r++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  if (n === 1)
    return to;
  let s = i.pow(r, t);
  const o = (t + V) / Jt;
  return function(u, l) {
    const c = u;
    if (c.is0(l))
      return l;
    if (Fi(c, l) !== 1)
      throw new Error("Cannot find square root");
    let d = n, f = c.mul(c.ONE, s), p = c.pow(l, t), g = c.pow(l, o);
    for (; !c.eql(p, c.ONE); ) {
      if (c.is0(p))
        throw new Error("Cannot find square root: probably non-prime P");
      let m = 1, w = c.sqr(p);
      for (; !c.eql(w, c.ONE); )
        if (m++, w = c.sqr(w), m === d)
          throw new Error("Cannot find square root");
      const v = V << BigInt(d - m - 1), x = c.pow(f, v);
      d = m, f = c.sqr(x), p = c.mul(p, f), g = c.mul(g, x);
    }
    return g;
  };
}
function gl(e) {
  return Yr(e, "Fp.sqrt"), e % Zr === Zs ? to : e % Ys === Vs ? fl : e % Js === ll ? pl(e) : eo(e);
}
const ml = [
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
function Ye(e) {
  if (we(e, "field"), typeof e.ORDER != "bigint")
    throw new TypeError('param "ORDER" is invalid: expected bigint, got ' + typeof e.ORDER);
  Ve(e.BYTES, "BYTES"), Ve(e.BITS, "BITS");
  for (const t of ml)
    je(e[t], "field." + t);
  if (e.BYTES < 1 || e.BITS < 1)
    throw new Error("invalid field: expected BYTES/BITS > 0");
  if (e.ORDER <= V)
    throw new Error("invalid field: expected ORDER > 1, got " + e.ORDER);
  return e;
}
function no(e, t, n = !1) {
  Ye(e), Ns(t, "nums"), le(n, "passZero");
  const r = e, i = new Array(t.length).fill(n ? r.ZERO : void 0), s = t.reduce((a, u, l) => r.is0(u) ? a : (i[l] = a, r.mul(a, u)), r.ONE), o = r.inv(s);
  return t.reduceRight((a, u, l) => r.is0(u) ? a : (i[l] = r.mul(a, i[l]), r.mul(a, u)), o), i;
}
function Fi(e, t) {
  Ye(e);
  const n = e;
  Yr(n.ORDER, "FpLegendre");
  const r = (n.ORDER - V) / Jt, i = n.pow(t, r), s = n.eql(i, n.ONE), o = n.eql(i, n.ZERO), a = n.eql(i, n.neg(n.ONE));
  if (!s && !o && !a)
    throw new Error("invalid Legendre symbol result");
  return s ? 1 : o ? 0 : -1;
}
function yl(e, t) {
  if (t !== void 0 && Us(t), e <= ct)
    throw new Error("invalid n length: expected positive n, got " + e);
  if (t !== void 0 && t < 1)
    throw new Error("invalid n length: expected positive bit length, got " + t);
  const n = Wr(e);
  if (t !== void 0 && t < n)
    throw new Error(`invalid n length: expected nBitLength (${t}) >= bitLen(n) (${n})`);
  const r = t !== void 0 ? t : n, i = Math.ceil(r / 8);
  return { nBitLength: r, nByteLength: i };
}
const zi = /* @__PURE__ */ new WeakMap();
class Qi {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = ct;
  ONE = V;
  _lengths;
  _mod;
  constructor(t, n = {}) {
    if (t <= V)
      throw new Error("invalid field: expected ORDER > 1, got " + t);
    let r;
    this.isLE = !1, n != null && typeof n == "object" && (typeof n.BITS == "number" && (r = n.BITS), typeof n.sqrt == "function" && Object.defineProperty(this, "sqrt", { value: n.sqrt, enumerable: !0 }), typeof n.isLE == "boolean" && (this.isLE = n.isLE), n.allowedLengths && (this._lengths = Object.freeze(n.allowedLengths.slice())), typeof n.modFromBytes == "boolean" && (this._mod = n.modFromBytes));
    const { nBitLength: i, nByteLength: s } = yl(t, r);
    if (s > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = t, this.BITS = i, this.BYTES = s, Object.freeze(this);
  }
  create(t) {
    return kt(t, this.ORDER);
  }
  isValid(t) {
    if (typeof t != "bigint")
      throw new TypeError("invalid field element: expected bigint, got " + typeof t);
    return ct <= t && t < this.ORDER;
  }
  is0(t) {
    return t === ct;
  }
  // is valid and invertible
  isValidNot0(t) {
    return !this.is0(t) && this.isValid(t);
  }
  isOdd(t) {
    return (t & V) === V;
  }
  neg(t) {
    return kt(-t, this.ORDER);
  }
  eql(t, n) {
    return t === n;
  }
  sqr(t) {
    return kt(t * t, this.ORDER);
  }
  add(t, n) {
    return kt(t + n, this.ORDER);
  }
  sub(t, n) {
    return kt(t - n, this.ORDER);
  }
  mul(t, n) {
    return kt(t * n, this.ORDER);
  }
  pow(t, n) {
    return Xs(t, n, this.ORDER);
  }
  div(t, n) {
    return kt(t * Di(n, this.ORDER), this.ORDER);
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
    return Di(t, this.ORDER);
  }
  sqrt(t) {
    let n = zi.get(this);
    return n || zi.set(this, n = gl(this.ORDER)), n(this, t);
  }
  toBytes(t) {
    return this.isLE ? Qs(t, this.BYTES) : Ft(t, this.BYTES);
  }
  fromBytes(t, n = !1) {
    J(t);
    const { _lengths: r, BYTES: i, isLE: s, ORDER: o, _mod: a } = this;
    if (r) {
      if (t.length < 1 || !r.includes(t.length) || t.length > i)
        throw new Error("Field.fromBytes: expected " + r + " bytes, got " + t.length);
      const l = new Uint8Array(i);
      l.set(t, s ? 0 : l.length - t.length), t = l;
    }
    if (t.length !== i)
      throw new Error("Field.fromBytes: expected " + i + " bytes, got " + t.length);
    let u = s ? zs(t) : xt(t);
    if (a && (u = kt(u, o)), !n && !this.isValid(u))
      throw new Error("invalid field element: outside of range 0..ORDER");
    return u;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(t) {
    return no(this, t, !0);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(t, n, r) {
    return le(r, "condition"), r ? n : t;
  }
}
function Fn(e, t = {}) {
  return Object.freeze(Qi.prototype), new Qi(e, t);
}
function ro(e) {
  if (typeof e != "bigint")
    throw new Error("field order must be bigint");
  if (e <= V)
    throw new Error("field order must be greater than 1");
  const t = Wr(e - V);
  return Math.ceil(t / 8);
}
function Jr(e) {
  const t = ro(e);
  return t + Math.ceil(t / 2);
}
function Xr(e, t, n = !1) {
  J(e);
  const r = e.length, i = ro(t), s = Math.max(Jr(t), 16);
  if (r < s || r > 1024)
    throw new Error("expected " + s + "-1024 bytes of input, got " + r);
  const o = n ? zs(e) : xt(e), a = kt(o, t - V) + V;
  return n ? Qs(a, i) : Ft(a, i);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const ti = /* @__PURE__ */ BigInt(0), Je = /* @__PURE__ */ BigInt(1), wl = /* @__PURE__ */ BigInt(4), rr = 16, Hi = 128, bl = 5, ji = 2 ** 31;
function ln(e) {
  const t = e;
  if (typeof t != "function")
    throw new TypeError('"Point" expected constructor, got type=' + typeof e);
  je(t.fromAffine, "Point.fromAffine"), je(t.fromBytes, "Point.fromBytes"), je(t.fromHex, "Point.fromHex"), we(t.BASE, "Point.BASE"), we(t.ZERO, "Point.ZERO"), Ye(t.Fp), Ye(t.Fn);
}
function vl(e, t) {
  ln(e), so(t, e);
  const n = no(e.Fp, t.map((r) => r.Z));
  return t.map((r, i) => e.fromAffine(r.toAffine(n[i])));
}
function kl(e, t, n = 1) {
  if (!Number.isSafeInteger(e) || e < n || e > t)
    throw new Error("invalid window size, expected [" + n + ".." + t + "], got W=" + e);
}
function _l(e, t) {
  const n = e * (4 * t + 128);
  if (n > ji)
    throw new Error("invalid window size: table would need ~" + Math.ceil(n / 2 ** 20) + " MiB, max " + ji / 2 ** 20 + " MiB");
}
function io(e, t) {
  if (e !== void 0) {
    je(e, "randomBytes");
    try {
      const n = e(t);
      if (!Dn(n) || n.length !== t)
        return;
    } catch {
      return;
    }
    return e;
  }
}
function so(e, t) {
  Ns(e, "points"), e.forEach((n, r) => {
    if (!(n instanceof t))
      throw new Error("invalid point at index " + r);
  });
}
function Sl(e, t, n) {
  if (!Array.isArray(e))
    throw new Error("array of scalars expected");
  e.forEach((r, i) => {
    if (!(n === void 0 ? t.isValid(r) : ae(r) && r < n))
      throw new Error("invalid scalar at index " + i);
  });
}
const oo = /* @__PURE__ */ new WeakMap();
function ir(e) {
  return oo.get(e) || 1;
}
function xl(e, t) {
  const n = e.double(), r = [e];
  for (let i = 1; i < t; i++)
    r.push(r[i - 1].add(n));
  return r;
}
function Il(e, t) {
  const n = 2 ** t, r = n / 2, i = BigInt(n - 1), s = [];
  for (; e > ti; ) {
    let o = 0;
    e & Je && (o = Number(e & i), o >= r && (o -= n), e -= BigInt(o)), s.push(o), e >>= Je;
  }
  return s;
}
function Al(e, t, n) {
  const r = 2 ** t, i = r / 2, s = BigInt(r - 1), o = BigInt(t), a = [];
  for (let u = 0; u < n; u++) {
    let l = Number(e & s);
    e >>= o, l > i && (l -= r, e += Je), a.push(l);
  }
  if (e !== ti)
    throw new Error("invalid wnaf");
  return a;
}
function El(e, t, n) {
  let r = 0;
  for (const s of n)
    r = Math.max(r, s.length);
  let i = e;
  for (let s = r - 1; s >= 0; s--) {
    s !== r - 1 && (i = i.double());
    for (let o = 0; o < n.length; o++) {
      const a = n[o][s];
      if (a) {
        const u = t[o][Math.abs(a) - 1 >> 1];
        i = i.add(a < 0 ? u.negate() : u);
      }
    }
  }
  return i;
}
class Ml {
  Point;
  BASE;
  ZERO;
  randomBytes;
  wnafPrecomputes = /* @__PURE__ */ new WeakMap();
  baseCanBeBlinded;
  bits;
  // Parametrized with a given Point class (not individual point)
  constructor(t, n) {
    ln(t), this.randomBytes = io(n, rr), this.Point = t, this.BASE = t.BASE, this.ZERO = t.ZERO, this.bits = t.Fn.BITS;
  }
  /**
   * Creates a signed fixed-window wNAF precomputation table: for every window w, the
   * multiples `[1..2^(W−1)]⋅2^(w⋅W)⋅P`, flattened. All doublings are baked into the table,
   * so cached multiplication is additions-only. `windows = ceil(bits/W) + 1`: the extra
   * window absorbs the final carry of signed-digit recoding.
   * For a 256-bit curve and W=6, the table is 44⋅32 = 1408 points.
   * @param point - Point instance
   * @param W - window size
   * @param bits - scalar bitlength the table must cover
   */
  buildWnafTable(t, n, r) {
    const i = Math.ceil(r / n) + 1, s = 2 ** (n - 1), o = [];
    let a = t;
    for (let u = 0; u < i; u++) {
      let l = a;
      for (let c = 0; c < s; c++)
        o.push(l), l = l.add(a);
      a = o[o.length - 1].double();
    }
    return { W: n, bits: r, windows: i, comp: o };
  }
  /**
   * Implements ec multiplication using precomputed signed fixed-window wNAF tables.
   * Constant-time: fixed window count with one table addition per window — zero digits feed
   * the fake accumulator — and no doublings; the lookup scans the whole window slice.
   * Scalar bounds are validated by the public entry points ({@link ScalarMultiplier.mulCT},
   * {@link ScalarMultiplier.mulCTBlinded}, {@link ScalarMultiplier.mulUnsafe});
   * signedWindowDigits throws if `n` exceeds the table.
   * @returns real and fake (for const-time) points
   */
  wnafCachedCT(t, n) {
    const { W: r, windows: i, comp: s } = t, o = 2 ** (r - 1), a = Al(n, r, i);
    let u = this.ZERO, l = this.BASE;
    for (let c = 0; c < i; c++) {
      const d = a[c], f = c * o, p = Math.abs(d) - 1;
      let g = s[f];
      for (let w = 1; w < o; w++)
        g = w === p ? s[f + w] : g;
      const m = g.negate();
      d === 0 ? l = l.add(s[f]) : u = u.add(d < 0 ? m : g);
    }
    return { p: u, f: l };
  }
  // Cache key is point identity plus (W, bits); at most two entries exist per point (public-width
  // `Fn.BITS` and blinded `Fn.BITS + BLIND_BITS`). Callers must not reuse the same point with
  // incompatible `transform(...)` layouts and expect a separate cache entry.
  getWnafPrecomputes(t, n, r, i) {
    let s = this.wnafPrecomputes.get(n), o = s?.find((a) => a.W === t && a.bits === r);
    return o || (o = this.buildWnafTable(n, t, r), typeof i == "function" && (o = { ...o, comp: i(o.comp) }), s || (s = [], this.wnafPrecomputes.set(n, s)), s.push(o)), o;
  }
  assertPoint(t) {
    if (!(t instanceof this.Point))
      throw new TypeError('"point" expected Point instance, got type=' + typeof t);
  }
  // Shared prologue of the constant-time entry points. Rejects scalar 0: in key/signature-style
  // callers a zero scalar means broken upstream plumbing, and concrete Points already reject it.
  // Uses inRange instead of Fn.isValidNot0: validateField() only certifies the arithmetic subset.
  validateMulInput(t, n) {
    if (this.assertPoint(t), !Ws(n, Je, this.Point.Fn.ORDER))
      throw new Error("invalid scalar");
  }
  // Constant-time dispatch shared by mulCT / mulCTBlinded. Un-precomputed points (W===1, e.g.
  // ECDH peer keys) skip building a throwaway cached table in favor of a small fixed-window
  // multiply. `n` must be < 2^bits.
  runCT(t, n, r, i) {
    const s = ir(t);
    return s === 1 ? this.fixedWindowCT(t, n, r) : this.wnafCachedCT(this.getWnafPrecomputes(s, t, r, i), n);
  }
  mulCT(t, n, r) {
    return this.validateMulInput(t, n), this.runCT(t, n, this.bits, r);
  }
  mulCTBlinded(t, n, r) {
    if (this.validateMulInput(t, n), this.randomBytes === void 0)
      throw new Error("randomBytes is required for scalar blinding");
    const i = this.Point.Fn.BITS + Hi, s = this.randomBytes(rr);
    if (!Dn(s) || s.length !== rr)
      throw new Error("randomBytes returned invalid byte array");
    s[0] = s[0] & 63 | 128;
    const o = n + xt(s) * this.Point.Fn.ORDER;
    return this.runCT(t, o, i, r);
  }
  /**
   * Constant-time multiplication `n*point` for an un-precomputed point, via a small fixed window.
   * A cached wNAF table only pays off when reused; a flat 2^FW_WINDOW table (`size-1` adds) is
   * far cheaper to build for a single use. The point-operation sequence is independent of `n`:
   * build the table, then per window exactly FW_WINDOW doublings, a data-oblivious scan over
   * every table entry, and one addition (adds the identity when the window digit is 0 — never
   * skipped).
   *
   * `n` must be `< 2^bits`. Assumes complete addition (adding the identity costs the same as any
   * add), which holds for the Weierstrass/Edwards point types used here. The table is left in
   * projective form (no normalizeZ): normalizing this small a table costs more than the
   * mixed-add savings it would buy for a single multiply.
   * @returns real point `p`; `f` duplicates it only to match {@link wnafCachedCT}'s return shape
   * (this path needs no fake accumulator — its op-count is already scalar-independent).
   */
  fixedWindowCT(t, n, r) {
    const i = bl, s = 1 << i, o = Gr(i), a = new Array(s);
    a[0] = this.ZERO;
    for (let c = 1; c < s; c++)
      a[c] = a[c - 1].add(t);
    const u = Math.ceil(r / i);
    let l = this.ZERO;
    for (let c = u - 1; c >= 0; c--) {
      if (c !== u - 1)
        for (let p = 0; p < i; p++)
          l = l.double();
      const d = Number(n >> BigInt(c * i) & o);
      let f = a[0];
      for (let p = 1; p < s; p++)
        f = p === d ? a[p] : f;
      l = l.add(f);
    }
    return { p: l, f: l };
  }
  shouldBlind(t, n) {
    return this.randomBytes === void 0 ? !1 : n === Je ? !0 : t !== this.BASE ? !1 : (this.baseCanBeBlinded === void 0 && (this.baseCanBeBlinded = this.mulUnsafe(this.BASE, this.Point.Fn.ORDER).is0()), this.baseCanBeBlinded);
  }
  mulSecret(t, n, r, i) {
    return this.shouldBlind(t, r) ? this.mulCTBlinded(t, n, i) : this.mulCT(t, n, i);
  }
  mulUnsafe(t, n, r) {
    if (this.assertPoint(t), !ae(n))
      throw new Error("invalid scalar");
    const i = ir(t);
    if (i === 1 || n >= this.Point.Fn.ORDER)
      return Sr(this.Point, [t], [n], !0);
    const s = this.getWnafPrecomputes(i, t, this.bits, r);
    return this.wnafCachedCT(s, n).p;
  }
  // Remembers the window size used for precomputed wNAF multiplication of the given point
  // and drops any previously built tables. Usually only the base point is precomputed.
  // W=1 resets the point to the un-precomputed (table-less) paths.
  // W is additionally capped so tables stay under ~2 GiB ({@link TABLE_BYTES_MAX}).
  setWindowSize(t, n) {
    this.assertPoint(t), kl(n, this.bits);
    const r = Math.ceil((this.bits + Hi) / n) + 1;
    _l(r * 2 ** (n - 1), this.Point.Fp.BYTES), oo.set(t, n), this.wnafPrecomputes.delete(t);
  }
  // True when a window size is set: tables themselves are built lazily on first multiply.
  hasWindowSize(t) {
    return ir(t) !== 1;
  }
}
function Sr(e, t, n, r = !1) {
  if (ln(e), so(t, e), le(r, "allowOversized"), Sl(n, e.Fn, r ? e.Fn.ORDER ** wl : void 0), t.length !== n.length)
    throw new Error("arrays of points and scalars must have equal length");
  const i = t.map((o) => xl(o, 4)), s = n.map((o) => Il(o, 4));
  return El(e.ZERO, i, s);
}
function Wi(e, t, n) {
  if (t) {
    if (t.ORDER !== e)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    return Ye(t), t;
  } else
    return Fn(e, { isLE: n });
}
function Tl(e, t, n = {}, r) {
  if (r === void 0 && (r = e === "edwards"), !t || typeof t != "object")
    throw new Error(`expected valid ${e} CURVE object`);
  un(n);
  for (const u of ["p", "n", "h"]) {
    const l = t[u];
    if (!(ae(l) && l !== ti))
      throw new Error(`CURVE.${u} must be positive bigint`);
  }
  const i = Wi(t.p, n.Fp, r), s = Wi(t.n, n.Fn, r), a = ["Gx", "Gy", "a", "b"];
  for (const u of a)
    if (!i.isValid(t[u]))
      throw new Error(`CURVE.${u} must be valid field element of CURVE.Fp`);
  return t = Object.freeze(Object.assign({}, t)), { CURVE: t, Fp: i, Fn: s };
}
function ao(e, t) {
  return function(r) {
    const i = e(r);
    return { secretKey: i, publicKey: t(i) };
  };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Bl = /* @__PURE__ */ BigInt(0);
class ql extends Error {
  constructor(t = "") {
    super(t);
  }
}
const Ut = {
  // asn.1 DER encoding utils
  Err: ql,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (e, t) => {
      const { Err: n } = Ut;
      if (Ve(e, "tag"), e < 0 || e > 255)
        throw new n("tlv.encode: wrong tag");
      if (il(t, "data"), t.length & 1)
        throw new n("tlv.encode: unpadded data");
      const r = t.length / 2, i = yn(r);
      if (i.length / 2 & 128)
        throw new n("tlv.encode: long form length too big");
      const s = r > 127 ? yn(i.length / 2 | 128) : "";
      return yn(e) + s + i + t;
    },
    // v - value, l - left bytes (unparsed)
    decode(e, t) {
      const { Err: n } = Ut;
      t = J(t, void 0, "DER data");
      let r = 0;
      if (e < 0 || e > 255)
        throw new n("tlv.decode: wrong tag");
      if (t.length < 2 || t[r++] !== e)
        throw new n("tlv.decode: wrong tlv");
      const i = t[r++], s = !!(i & 128);
      let o = 0;
      if (!s)
        o = i;
      else {
        const u = i & 127;
        if (!u)
          throw new n("tlv.decode(long): indefinite length not supported");
        if (u > 4)
          throw new n("tlv.decode(long): byte length is too big");
        const l = t.subarray(r, r + u);
        if (l.length !== u)
          throw new n("tlv.decode: length bytes not complete");
        if (l[0] === 0)
          throw new n("tlv.decode(long): zero leftmost byte");
        for (const c of l)
          o = o << 8 | c;
        if (r += u, o < 128)
          throw new n("tlv.decode(long): not minimal encoding");
      }
      const a = t.subarray(r, r + o);
      if (a.length !== o)
        throw new n("tlv.decode: wrong value length");
      return { v: a, l: t.subarray(r + o) };
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode(e) {
      const { Err: t } = Ut;
      if (jr(e), e < Bl)
        throw new t("integer: negative integers are not allowed");
      let n = yn(e);
      if (Number.parseInt(n[0], 16) & 8 && (n = "00" + n), n.length & 1)
        throw new t("unexpected DER parsing assertion: unpadded hex");
      return n;
    },
    decode(e) {
      const { Err: t } = Ut;
      if (e.length < 1)
        throw new t("invalid signature integer: empty");
      if (e[0] & 128)
        throw new t("invalid signature integer: negative");
      if (e.length > 1 && e[0] === 0 && !(e[1] & 128))
        throw new t("invalid signature integer: unnecessary leading zero");
      return xt(e);
    }
  },
  toSig(e, t) {
    const { Err: n, _int: r, _tlv: i } = Ut;
    if (t !== void 0 && (Ve(t, "maxScalarBytes"), t < 1))
      throw new n("invalid signature: maxScalarBytes must be positive");
    const s = J(e, void 0, "signature"), { v: o, l: a } = i.decode(48, s);
    if (a.length)
      throw new n("invalid signature: left bytes after parsing");
    const { v: u, l } = i.decode(2, o), { v: c, l: d } = i.decode(2, l);
    if (d.length)
      throw new n("invalid signature: left bytes after parsing");
    if (t !== void 0 && (u.length > t || c.length > t))
      throw new n("invalid signature: integer too large");
    return { r: r.decode(u), s: r.decode(c) };
  },
  hexFromSig(e) {
    const { _tlv: t, _int: n } = Ut;
    un(e, { r: "bigint", s: "bigint" }, {}, "sig");
    const r = t.encode(2, n.encode(e.r)), i = t.encode(2, n.encode(e.s)), s = r + i;
    return t.encode(48, s);
  }
}, sr = (Object.freeze(Ut._tlv), Object.freeze(Ut._int), Object.freeze(Ut));
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const Gi = (e, t) => (e + (e >= 0 ? t : -t) / uo) / t;
function Ol(e, t, n) {
  Gs("scalar", e, Dt, n);
  const [[r, i], [s, o]] = t, a = Gi(o * e, n), u = Gi(-i * e, n);
  let l = e - a * r - u * s, c = -a * i - u * o;
  const d = l < Dt, f = c < Dt;
  d && (l = -l), f && (c = -c);
  const p = Gr(Math.ceil(Wr(n) / 2)) + ne;
  if (l < Dt || l >= p || c < Dt || c >= p)
    throw new Error("splitScalar (endomorphism): failed for k");
  return { k1neg: d, k1: l, k2neg: f, k2: c };
}
function xr(e) {
  if (!["compact", "recovered", "der"].includes(e))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return e;
}
function or(e, t) {
  un(e);
  const n = {};
  for (let r of Object.keys(t))
    n[r] = e[r] === void 0 ? t[r] : e[r];
  return le(n.lowS, "lowS"), le(n.prehash, "prehash"), n.format !== void 0 && xr(n.format), n;
}
const Dt = /* @__PURE__ */ BigInt(0), ne = /* @__PURE__ */ BigInt(1), uo = /* @__PURE__ */ BigInt(2), ar = /* @__PURE__ */ BigInt(3), Pl = /* @__PURE__ */ BigInt(4);
function Cl(e, t = {}) {
  const n = Tl("weierstrass", e, t), r = n.Fp, i = n.Fn;
  let s = n.CURVE;
  const { h: o, n: a } = s;
  un(t, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object",
    randomBytes: "function"
  });
  const { endo: u, allowInfinityPoint: l, clearCofactor: c, isTorsionFree: d, fromBytes: f, toBytes: p } = t, g = t.randomBytes === void 0 ? Hr : t.randomBytes;
  if (u && (!r.is0(s.a) || typeof u.beta != "bigint" || !Array.isArray(u.basises)))
    throw new Error('invalid endo: expected "beta": bigint and "basises": array');
  const m = u ? {
    beta: u.beta,
    basises: u.basises.map((I) => [...I])
  } : void 0, w = co(r, i);
  function v() {
    if (!r.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function x(I, y, _) {
    if (y.is0()) {
      if (!l)
        throw new Error("bad point: ZERO");
      return Uint8Array.of(0);
    }
    const { x: S, y: O } = y.toAffine(), P = r.toBytes(S);
    if (le(_, "isCompressed"), _) {
      v();
      const q = !r.isOdd(O);
      return $t(lo(q), P);
    } else
      return $t(Uint8Array.of(4), P, r.toBytes(O));
  }
  function b(I) {
    J(I, void 0, "Point");
    const { publicKey: y, publicKeyUncompressed: _ } = w, S = I.length, O = I[0], P = I.subarray(1);
    if (l && S === 1 && O === 0)
      return { x: r.ZERO, y: r.ZERO };
    if (S === y && (O === 2 || O === 3)) {
      const q = r.fromBytes(P);
      if (!r.isValid(q))
        throw new Error("bad point: is not on curve, wrong x");
      const L = C(q);
      let K;
      try {
        K = r.sqrt(L);
      } catch (it) {
        const tt = it instanceof Error ? ": " + it.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + tt);
      }
      v();
      const G = r.isOdd(K);
      return (O & 1) === 1 !== G && (K = r.neg(K)), { x: q, y: K };
    } else if (S === _ && O === 4) {
      const q = r.BYTES, L = r.fromBytes(P.subarray(0, q)), K = r.fromBytes(P.subarray(q, q * 2));
      if (!D(L, K))
        throw new Error("bad point: is not on curve");
      return { x: L, y: K };
    } else
      throw new Error(`bad point: got length ${S}, expected compressed=${y} or uncompressed=${_}`);
  }
  const E = p === void 0 ? x : p, M = f === void 0 ? b : f, A = r.mul(s.b, ar), H = r.is0(s.a) ? (I) => r.ZERO : (I) => r.mul(s.a, I);
  function C(I) {
    const y = r.sqr(I), _ = r.mul(y, I);
    return r.add(r.add(_, r.mul(I, s.a)), s.b);
  }
  function D(I, y) {
    const _ = r.sqr(y), S = C(I);
    return r.eql(_, S);
  }
  if (!D(s.Gx, s.Gy))
    throw new Error("bad curve params: generator point");
  const W = r.mul(r.pow(s.a, ar), Pl), T = r.mul(r.sqr(s.b), BigInt(27));
  if (r.is0(r.add(W, T)))
    throw new Error("bad curve params: a or b");
  function B(I, y, _ = !1) {
    if (!r.isValid(y) || _ && r.is0(y))
      throw new Error(`bad point coordinate ${I}`);
    return typeof y == "object" && y !== null ? r.create(y) : y;
  }
  function $(I) {
    if (!(I instanceof Q))
      throw new Error("Weierstrass Point expected");
  }
  function R(I) {
    if (!m || !m.basises)
      throw new Error("no endo");
    return Ol(I, m.basises, i.ORDER);
  }
  function X(I, y, _, S) {
    if (!i.isValid(S))
      throw new RangeError("invalid scalar: out of range");
    if (m) {
      const { k1neg: O, k1: P, k2neg: q, k2: L } = R(S), K = new Q(r.mul(_.X, m.beta), _.Y, _.Z);
      I.push(O ? _.negate() : _, q ? K.negate() : K), y.push(P, L);
    } else
      I.push(_), y.push(S);
  }
  const ht = /* @__PURE__ */ new WeakSet();
  class Q {
    static BASE = new Q(s.Gx, s.Gy, r.ONE);
    static ZERO = new Q(r.ZERO, r.ONE, r.ZERO);
    static Fp = r;
    static Fn = i;
    X;
    Y;
    Z;
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(y, _, S) {
      this.X = B("x", y), this.Y = B("y", _, !0), this.Z = B("z", S), Object.freeze(this);
    }
    static CURVE() {
      return s;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(y) {
      const { x: _, y: S } = y || {};
      if (!y || !r.isValid(_) || !r.isValid(S))
        throw new Error("invalid affine point");
      if (y instanceof Q)
        throw new Error("projective point not allowed");
      return r.is0(_) && r.is0(S) ? Q.ZERO : new Q(_, S, r.ONE);
    }
    static fromBytes(y) {
      const _ = Q.fromAffine(M(J(y, void 0, "point")));
      return _.assertValidity(), _;
    }
    static fromHex(y) {
      return Q.fromBytes(_r(y));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     * @param isLazy - true will defer table computation until the first multiplication
     */
    precompute(y = 6, _ = !0) {
      return Y.setWindowSize(this, y), _ || this.multiply(ar), this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      const y = this;
      if (y.is0()) {
        if (l && r.is0(y.X) && r.eql(y.Y, r.ONE) && r.is0(y.Z))
          return;
        throw new Error("bad point: ZERO");
      }
      if (ht.has(y))
        return;
      const { x: _, y: S } = y.toAffine();
      if (!r.isValid(_) || !r.isValid(S))
        throw new Error("bad point: x or y not field elements");
      if (!D(_, S))
        throw new Error("bad point: equation left != right");
      if (!y.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
      ht.add(y);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (!r.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !r.isOdd(y);
    }
    /** Compare one point to another. */
    equals(y) {
      $(y);
      const { X: _, Y: S, Z: O } = this, { X: P, Y: q, Z: L } = y, K = r.eql(r.mul(_, L), r.mul(P, O)), G = r.eql(r.mul(S, L), r.mul(q, O));
      return K && G;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new Q(this.X, r.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { X: y, Y: _, Z: S } = this;
      let O = r.ZERO, P = r.ZERO, q = r.ZERO, L = r.mul(y, y), K = r.mul(_, _), G = r.mul(S, S), j = r.mul(y, _);
      return j = r.add(j, j), q = r.mul(y, S), q = r.add(q, q), O = H(q), P = r.mul(A, G), P = r.add(O, P), O = r.sub(K, P), P = r.add(K, P), P = r.mul(O, P), O = r.mul(j, O), q = r.mul(A, q), G = H(G), j = r.sub(L, G), j = H(j), j = r.add(j, q), q = r.add(L, L), L = r.add(q, L), L = r.add(L, G), L = r.mul(L, j), P = r.add(P, L), G = r.mul(_, S), G = r.add(G, G), L = r.mul(G, j), O = r.sub(O, L), q = r.mul(G, K), q = r.add(q, q), q = r.add(q, q), new Q(O, P, q);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(y) {
      $(y);
      const { X: _, Y: S, Z: O } = this, { X: P, Y: q, Z: L } = y;
      let K = r.ZERO, G = r.ZERO, j = r.ZERO, it = r.mul(_, P), tt = r.mul(S, q), dt = r.mul(O, L), It = r.add(_, S), et = r.add(P, q);
      It = r.mul(It, et), et = r.add(it, tt), It = r.sub(It, et), et = r.add(_, O);
      let st = r.add(P, L);
      return et = r.mul(et, st), st = r.add(it, dt), et = r.sub(et, st), st = r.add(S, O), K = r.add(q, L), st = r.mul(st, K), K = r.add(tt, dt), st = r.sub(st, K), j = H(et), K = r.mul(A, dt), j = r.add(K, j), K = r.sub(tt, j), j = r.add(tt, j), G = r.mul(K, j), tt = r.add(it, it), tt = r.add(tt, it), dt = H(dt), et = r.mul(A, et), tt = r.add(tt, dt), dt = r.sub(it, dt), dt = H(dt), et = r.add(et, dt), it = r.mul(tt, et), G = r.add(G, it), it = r.mul(st, et), K = r.mul(It, K), K = r.sub(K, it), it = r.mul(It, tt), j = r.mul(st, j), j = r.add(j, it), new Q(K, G, j);
    }
    subtract(y) {
      return $(y), this.add(y.negate());
    }
    is0() {
      return this.equals(Q.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses precomputed tables (signed fixed-window wNAF) when available.
     * Uses scalar blinding and avoids endomorphism splitting in the secret-scalar path.
     * @param scalar - by which the point would be multiplied
     * @returns New point
     */
    multiply(y) {
      if (!i.isValidNot0(y))
        throw new RangeError("invalid scalar: out of range");
      const { p: _, f: S } = Y.mulSecret(this, y, o, bt);
      return bt([_, S])[0];
    }
    /**
     * Non-constant-time multiplication. Uses width-4 wNAF with GLV endomorphism splitting
     * when available (two half-width scalars sharing one halved doubling chain).
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(y) {
      const _ = this, S = y;
      if (!i.isValid(S))
        throw new RangeError("invalid scalar: out of range");
      if (S === Dt || _.is0())
        return Q.ZERO;
      if (S === ne)
        return _;
      if (Y.hasWindowSize(this))
        return Y.mulUnsafe(_, S, bt);
      const O = [], P = [];
      return X(O, P, _, S), Sr(Q, O, P);
    }
    /**
     * Non-constant-time double-scalar multiplication `a⋅this + b⋅other` (Strauss–Shamir).
     * Both walks share one doubling chain via {@link mulAddUnsafe}, and GLV endomorphism
     * (when available) halves the chain again by splitting each scalar into two half-width
     * parts. Used by ECDSA verification and public-key recovery for `R = u1⋅G + u2⋅P`.
     * Only for public scalars.
     */
    mulAddUnsafe(y, _, S) {
      $(_);
      const O = [], P = [];
      return X(O, P, this, y), X(O, P, _, S), Sr(Q, O, P);
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * (X, Y, Z) ∋ (x=X/Z, y=Y/Z).
     * @param invertedZ - Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(y) {
      const _ = this;
      let S = y;
      if (S != null && !r.isValid(S))
        throw new RangeError('"invertedZ" expected valid field element');
      const { X: O, Y: P, Z: q } = _;
      if (r.eql(q, r.ONE))
        return { x: O, y: P };
      const L = _.is0();
      S == null && (S = L ? r.ONE : r.inv(q));
      const K = r.mul(O, S), G = r.mul(P, S), j = r.mul(q, S);
      if (L)
        return { x: r.ZERO, y: r.ZERO };
      if (!r.eql(j, r.ONE))
        throw new Error("invZ was invalid");
      return { x: K, y: G };
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      return o === ne ? !0 : d ? d(Q, this) : Y.mulUnsafe(this, a).is0();
    }
    clearCofactor() {
      return o === ne ? this : c ? c(Q, this) : this.multiplyUnsafe(o);
    }
    isSmallOrder() {
      return o === ne ? this.is0() : this.clearCofactor().is0();
    }
    toBytes(y = !0) {
      return le(y, "isCompressed"), this.assertValidity(), E(Q, this, y);
    }
    toHex(y = !0) {
      return Ds(this.toBytes(y));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const bt = (I) => vl(Q, I), Y = new Ml(Q, g);
  return Y.bits >= 6 && Q.BASE.precompute(6), Object.freeze(Q.prototype), Object.freeze(Q), Q;
}
function lo(e) {
  return Uint8Array.of(e ? 2 : 3);
}
function co(e, t) {
  return {
    secretKey: t.BYTES,
    publicKey: 1 + e.BYTES,
    publicKeyUncompressed: 1 + 2 * e.BYTES,
    publicKeyHasPrefix: !0,
    // Raw compact `(r || s)` signature width; DER and recovered signatures use
    // different lengths outside this helper.
    signature: 2 * t.BYTES
  };
}
function Rl(e, t = {}) {
  ln(e);
  const { Fn: n } = e, r = t.randomBytes === void 0 ? Hr : t.randomBytes, i = Object.assign(co(e.Fp, n), {
    seed: Math.max(Jr(n.ORDER), 16)
  });
  function s(p) {
    try {
      const g = n.fromBytes(p);
      return n.isValidNot0(g);
    } catch {
      return !1;
    }
  }
  function o(p, g) {
    const { publicKey: m, publicKeyUncompressed: w } = i;
    try {
      const v = p.length;
      return g === !0 && v !== m || g === !1 && v !== w ? !1 : !e.fromBytes(p).is0();
    } catch {
      return !1;
    }
  }
  function a(p) {
    return p = p === void 0 ? r(i.seed) : p, Xr(J(p, i.seed, "seed"), n.ORDER);
  }
  function u(p, g = !0) {
    return e.BASE.multiply(n.fromBytes(p)).toBytes(g);
  }
  function l(p) {
    const { secretKey: g, publicKey: m, publicKeyUncompressed: w } = i, v = n._lengths;
    if (!Dn(p))
      return;
    const x = J(p, void 0, "key").length, b = x === m || x === w, E = x === g || !!v?.includes(x);
    if (!(b && E))
      return b;
  }
  function c(p, g, m = !0) {
    if (l(p) === !0)
      throw new Error("first arg must be private key");
    if (l(g) === !1)
      throw new Error("second arg must be public key");
    const w = n.fromBytes(p), v = e.fromBytes(g);
    if (v.is0())
      throw new Error("invalid public key: point at infinity");
    return v.multiply(w).toBytes(m);
  }
  const d = {
    isValidSecretKey: s,
    isValidPublicKey: o,
    randomSecretKey: a
  }, f = ao(a, u);
  return Object.freeze(d), Object.freeze(i), Object.freeze({ getPublicKey: u, getSharedSecret: c, keygen: f, Point: e, utils: d, lengths: i });
}
function $l(e, t, n = {}) {
  ln(e);
  const r = t;
  Ur(r), un(n, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  const i = Object.assign({}, n), s = i.randomBytes === void 0 ? Hr : i.randomBytes, o = i.hmac === void 0 ? (I, y) => Ie(r, I, y) : i.hmac, { Fp: a, Fn: u } = e, { ORDER: l, BITS: c } = u, d = Jr(l), f = io(s, d), { keygen: p, getPublicKey: g, getSharedSecret: m, utils: w, lengths: v } = Rl(e, i), x = {
    prehash: !0,
    lowS: typeof i.lowS == "boolean" ? i.lowS : !0,
    format: "compact",
    extraEntropy: !1
  }, b = l * uo + ne < a.ORDER;
  function E(I) {
    const y = l >> ne;
    return I > y;
  }
  function M(I, y) {
    if (!u.isValidNot0(y))
      throw new Error(`invalid signature ${I}: out of range 1..Point.Fn.ORDER`);
    return y;
  }
  function A() {
    if (!a.isOdd)
      throw new Error("Field doesn't support isOdd");
  }
  function H(I, y, _) {
    return A(), (I === _ ? 0 : 2) | Number(a.isOdd(y));
  }
  function C() {
    if (b)
      throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
  }
  function D(I, y) {
    xr(y);
    const _ = v.signature, S = y === "compact" ? _ : y === "recovered" ? _ + 1 : void 0;
    return J(I, S);
  }
  class W {
    r;
    s;
    recovery;
    constructor(y, _, S) {
      if (this.r = M("r", y), this.s = M("s", _), S != null) {
        if (C(), ![0, 1, 2, 3].includes(S))
          throw new Error("invalid recovery id");
        this.recovery = S;
      }
      Object.freeze(this);
    }
    static fromBytes(y, _ = x.format) {
      D(y, _);
      let S;
      if (_ === "der") {
        if (y.length > 2 * u.BYTES + 16)
          throw new sr.Err("invalid signature: DER signature too long");
        const { r: L, s: K } = sr.toSig(J(y), u.BYTES + 1);
        return new W(L, K);
      }
      _ === "recovered" && (S = y[0], _ = "compact", y = y.subarray(1));
      const O = v.signature / 2, P = y.subarray(0, O), q = y.subarray(O, O * 2);
      return new W(u.fromBytes(P), u.fromBytes(q), S);
    }
    static fromHex(y, _) {
      return this.fromBytes(_r(y), _);
    }
    assertRecovery() {
      const { recovery: y } = this;
      if (y == null)
        throw new Error("invalid recovery id: must be present");
      return y;
    }
    addRecoveryBit(y) {
      return new W(this.r, this.s, y);
    }
    // Unlike the top-level helper below, this method expects a digest that has
    // already been hashed to the curve's message representative.
    recoverPublicKey(y) {
      const { r: _, s: S } = this, O = this.assertRecovery(), P = O === 2 || O === 3 ? _ + l : _;
      if (!a.isValid(P))
        throw new Error("invalid recovery id: sig.r+curve.n != R.x");
      const q = a.toBytes(P), L = e.fromBytes($t(lo((O & 1) === 0), q)), K = u.inv(P), G = B(J(y, void 0, "msgHash")), j = u.create(-G * K), it = u.create(S * K), tt = e.BASE.mulAddUnsafe(j, L, it);
      if (tt.is0())
        throw new Error("invalid recovery: point at infinify");
      return tt.assertValidity(), tt;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return E(this.s);
    }
    toBytes(y = x.format) {
      if (xr(y), y === "der")
        return _r(sr.hexFromSig(this));
      const { r: _, s: S } = this, O = u.toBytes(_), P = u.toBytes(S);
      return y === "recovered" ? (C(), $t(Uint8Array.of(this.assertRecovery()), O, P)) : $t(O, P);
    }
    toHex(y) {
      return Ds(this.toBytes(y));
    }
  }
  Object.freeze(W.prototype), Object.freeze(W);
  const T = i.bits2int === void 0 ? function(y) {
    if (y.length > 8192)
      throw new Error("input is too large");
    const _ = xt(y), S = y.length * 8 - c;
    return S > 0 ? _ >> BigInt(S) : _;
  } : i.bits2int, B = i.bits2int_modN === void 0 ? function(y) {
    return u.create(T(y));
  } : i.bits2int_modN, $ = Gr(c);
  function R(I) {
    return Gs("num < 2^" + c, I, Dt, $), u.toBytes(I);
  }
  function X(I, y) {
    return J(I, void 0, "message"), y ? J(r(I), void 0, "prehashed message") : I;
  }
  function ht(I, y, _) {
    const { lowS: S, prehash: O, extraEntropy: P } = or(_, x);
    I = X(I, O);
    const q = B(I), L = u.fromBytes(y);
    if (!u.isValidNot0(L))
      throw new Error("invalid private key");
    const K = [R(L), R(q)];
    if (P != null && P !== !1) {
      const tt = P === !0 ? s(v.secretKey) : P;
      K.push(J(tt, void 0, "extraEntropy"));
    }
    const G = $t(...K), j = q;
    function it(tt) {
      const dt = T(tt);
      if (!u.isValidNot0(dt))
        return;
      const It = e.BASE.multiply(dt).toAffine(), et = u.create(It.x);
      if (et === Dt)
        return;
      let st;
      if (f !== void 0) {
        const Oe = xt(Xr(f(d), l)), uu = u.inv(u.mul(Oe, dt)), lu = u.mul(Oe, j), cu = u.mul(Oe, L);
        st = u.create(uu * u.create(lu + cu * et));
      } else {
        const Oe = dl(dt, l);
        st = u.create(Oe * u.create(j + et * L));
      }
      if (st === Dt)
        return;
      let er = H(It.x, It.y, et), xi = st;
      return S && E(st) && (xi = u.neg(st), er ^= 1), new W(et, xi, b ? void 0 : er);
    }
    return { seed: G, k2sig: it };
  }
  function Q(I, y, _ = {}) {
    const { seed: S, k2sig: O } = ht(I, y, _);
    return al(r.outputLen, u.BYTES, o)(S, O).toBytes(_.format);
  }
  function bt(I, y, _, S = {}) {
    const { lowS: O, prehash: P, format: q } = or(S, x);
    if (_ = J(_, void 0, "publicKey"), y = X(y, P), !Dn(I)) {
      const L = I instanceof W ? ", use sig.toBytes()" : "";
      throw new Error("verify expects Uint8Array signature" + L);
    }
    D(I, q);
    try {
      const L = W.fromBytes(I, q), K = e.fromBytes(_);
      if (K.is0() || O && L.hasHighS())
        return !1;
      const { r: G, s: j } = L, it = B(y), tt = u.inv(j), dt = u.create(it * tt), It = u.create(G * tt), et = e.BASE.mulAddUnsafe(dt, K, It);
      if (et.is0())
        return !1;
      const st = et.toAffine();
      return !(u.create(st.x) !== G || q === "recovered" && L.recovery !== H(st.x, st.y, G));
    } catch {
      return !1;
    }
  }
  function Y(I, y, _ = {}) {
    const { prehash: S } = or(_, x);
    return y = X(y, S), W.fromBytes(I, "recovered").recoverPublicKey(y).toBytes();
  }
  return Object.freeze({
    keygen: p,
    getPublicKey: g,
    getSharedSecret: m,
    utils: w,
    lengths: v,
    Point: e,
    sign: Q,
    verify: bt,
    recoverPublicKey: Y,
    Signature: W,
    hash: r
  });
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const zn = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: BigInt(1),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
  Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
}, Ll = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  basises: [
    [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
    [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
  ]
}, Kl = /* @__PURE__ */ BigInt(0), Zi = /* @__PURE__ */ BigInt(2);
function Nl(e) {
  const t = zn.p, n = BigInt(3), r = BigInt(6), i = BigInt(11), s = BigInt(22), o = BigInt(23), a = BigInt(44), u = BigInt(88), l = e * e * e % t, c = l * l * e % t, d = At(c, n, t) * c % t, f = At(d, n, t) * c % t, p = At(f, Zi, t) * l % t, g = At(p, i, t) * p % t, m = At(g, s, t) * g % t, w = At(m, a, t) * m % t, v = At(w, u, t) * w % t, x = At(v, a, t) * m % t, b = At(x, n, t) * c % t, E = At(b, o, t) * g % t, M = At(E, r, t) * l % t, A = At(M, Zi, t);
  if (!Ae.eql(Ae.sqr(A), e))
    throw new Error("Cannot find square root");
  return A;
}
const Ae = /* @__PURE__ */ Fn(zn.p, { sqrt: Nl }), ce = /* @__PURE__ */ Cl(zn, {
  Fp: Ae,
  endo: Ll
}), N = /* @__PURE__ */ $l(ce, at), Vi = /* @__PURE__ */ Object.create(null);
function Mn(e, ...t) {
  let n = Vi[e];
  if (n === void 0) {
    const r = at(ol(e));
    n = $t(r, r), Vi[e] = n;
  }
  return at($t(n, ...t));
}
const ho = (e) => e.toBytes(!0).slice(1), fo = ({ x: e }) => Ae.toBytes(e), Qn = (e) => !Ae.isOdd(e);
function po(e) {
  const { Fn: t, BASE: n } = ce, r = t.fromBytes(J(e, 32, "secretKey")), s = n.multiply(r).toAffine();
  return { scalar: Qn(s.y) ? r : t.neg(r), bytes: fo(s) };
}
function go(e) {
  const t = Ae;
  if (!t.isValidNot0(e))
    throw new Error("invalid x: Fail if x ≥ p");
  const n = t.sqr(e), r = t.add(t.mulN(n, e), BigInt(7));
  let i = t.sqrt(r);
  Qn(i) || (i = t.neg(i));
  const s = ce.fromAffine({ x: e, y: i });
  return s.assertValidity(), s;
}
const be = xt;
function mo(...e) {
  return ce.Fn.create(be(Mn("BIP0340/challenge", ...e)));
}
function Yi(e) {
  return po(e).bytes;
}
function Ul(e, t, n = zt(32)) {
  const { Fn: r, BASE: i } = ce, s = js(J(e, void 0, "message")), { bytes: o, scalar: a } = po(t), u = J(n, 32, "auxRand"), l = r.toBytes(a ^ be(Mn("BIP0340/aux", u))), c = Mn("BIP0340/nonce", l, o, s), d = r.create(be(c));
  if (d === Kl)
    throw new Error("sign failed: k is zero");
  const p = i.multiply(d).toAffine(), g = Qn(p.y) ? d : r.neg(d), m = fo(p), w = mo(m, o, s), v = new Uint8Array(64);
  if (v.set(m, 0), v.set(r.toBytes(r.create(g + w * a)), 32), !yo(v, s, o))
    throw new Error("sign: Invalid signature produced");
  return v;
}
function yo(e, t, n) {
  const { Fp: r, Fn: i, BASE: s } = ce, o = J(e, 64, "signature"), a = J(t, void 0, "message"), u = J(n, 32, "publicKey");
  try {
    const l = go(be(u)), c = o.subarray(0, 32), d = be(c);
    if (!r.isValidNot0(d))
      return !1;
    const f = be(o.subarray(32, 64));
    if (!i.isValidNot0(f))
      return !1;
    const p = mo(c, ho(l), a), g = s.mulAddUnsafe(f, l, i.neg(p)), { x: m, y: w } = g.toAffine();
    return !(g.is0() || !Qn(w) || !r.eql(m, d));
  } catch {
    return !1;
  }
}
const ei = /* @__PURE__ */ (() => {
  const n = (r) => (r = r === void 0 ? zt(48) : r, Xr(J(r, 48, "seed"), zn.n));
  return Object.freeze({
    keygen: ao(n, Yi),
    getPublicKey: Yi,
    sign: Ul,
    verify: yo,
    Point: ce,
    utils: Object.freeze({
      randomSecretKey: n,
      taggedHash: Mn,
      lift_x: go,
      pointToBytes: ho
    }),
    lengths: Object.freeze({
      secretKey: 32,
      publicKey: 32,
      publicKeyHasPrefix: !1,
      signature: 64,
      seed: 48
    })
  });
})(), Dl = /* @__PURE__ */ Uint8Array.from([
  7,
  4,
  13,
  1,
  10,
  6,
  15,
  3,
  12,
  0,
  9,
  5,
  2,
  14,
  11,
  8
]), wo = Uint8Array.from(new Array(16).fill(0).map((e, t) => t)), Fl = wo.map((e) => (9 * e + 5) % 16), bo = /* @__PURE__ */ (() => {
  const n = [[wo], [Fl]];
  for (let r = 0; r < 4; r++)
    for (let i of n)
      i.push(i[r].map((s) => Dl[s]));
  return n;
})(), vo = bo[0], ko = bo[1], _o = /* @__PURE__ */ [
  [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
  [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7],
  [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9],
  [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6],
  [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]
].map((e) => Uint8Array.from(e)), zl = /* @__PURE__ */ vo.map((e, t) => e.map((n) => _o[t][n])), Ql = /* @__PURE__ */ ko.map((e, t) => e.map((n) => _o[t][n])), Hl = /* @__PURE__ */ Uint32Array.from([
  0,
  1518500249,
  1859775393,
  2400959708,
  2840853838
]), jl = /* @__PURE__ */ Uint32Array.from([
  1352829926,
  1548603684,
  1836072691,
  2053994217,
  0
]);
function Ji(e, t, n, r) {
  return e === 0 ? t ^ n ^ r : e === 1 ? t & n | ~t & r : e === 2 ? (t | ~n) ^ r : e === 3 ? t & r | n & ~r : t ^ (n | ~r);
}
const wn = /* @__PURE__ */ new Uint32Array(16);
class Wl extends Fr {
  h0 = 1732584193;
  h1 = -271733879;
  h2 = -1732584194;
  h3 = 271733878;
  h4 = -1009589776;
  constructor() {
    super(64, 20, 8, !0);
  }
  get() {
    const { h0: t, h1: n, h2: r, h3: i, h4: s } = this;
    return [t, n, r, i, s];
  }
  set(t, n, r, i, s) {
    this.h0 = t | 0, this.h1 = n | 0, this.h2 = r | 0, this.h3 = i | 0, this.h4 = s | 0;
  }
  _cloneInto(t) {
    return (t ||= new this.constructor()).set(...this.get()), this._cloneIntoMeta(t);
  }
  process(t, n) {
    for (let p = 0; p < 16; p++, n += 4)
      wn[p] = t.getUint32(n, !0);
    let r = this.h0 | 0, i = r, s = this.h1 | 0, o = s, a = this.h2 | 0, u = a, l = this.h3 | 0, c = l, d = this.h4 | 0, f = d;
    for (let p = 0; p < 5; p++) {
      const g = 4 - p, m = Hl[p], w = jl[p], v = vo[p], x = ko[p], b = zl[p], E = Ql[p];
      for (let M = 0; M < 16; M++) {
        const A = mn(r + Ji(p, s, a, l) + wn[v[M]] + m, b[M]) + d | 0;
        r = d, d = l, l = mn(a, 10) | 0, a = s, s = A;
      }
      for (let M = 0; M < 16; M++) {
        const A = mn(i + Ji(g, o, u, c) + wn[x[M]] + w, E[M]) + f | 0;
        i = f, f = c, c = mn(u, 10) | 0, u = o, o = A;
      }
    }
    this.set(this.h1 + a + c | 0, this.h2 + l + f | 0, this.h3 + d + i | 0, this.h4 + r + o | 0, this.h0 + s + u | 0);
  }
  roundClean() {
    qt(wn);
  }
  destroy() {
    this.destroyed = !0, qt(this.buffer), this.set(0, 0, 0, 0, 0);
  }
}
const Gl = /* @__PURE__ */ Dr(() => new Wl());
/*! scure-bip32 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
const Fe = N.Point, fe = Fe.Fn, ur = /* @__PURE__ */ Ju(at), Zl = Uint8Array.from("Bitcoin seed".split(""), (e) => e.charCodeAt(0)), lr = { private: 76066276, public: 76067358 }, ze = 2147483648, cr = 255, Vl = (e) => Gl(at(e)), Yl = (e) => oe(e).getUint32(0, !1), Vt = (e, t = "number") => {
  if (typeof e != "number")
    throw new TypeError(`"${t}" expected number, got type=${typeof e}`);
  if (!Number.isSafeInteger(e) || e < 0 || e > 2 ** 32 - 1)
    throw new RangeError(`"${t}" expected integer in range 0..2**32-1, got ${e}`);
  const n = new Uint8Array(4);
  return oe(n).setUint32(0, e, !1), n;
}, hr = (e, t = "versions") => {
  if (!(typeof e == "object" && e !== null))
    throw new Error("versions must be an object");
  return Vt(e.private, `${t}.private`), Vt(e.public, `${t}.public`), e;
};
class Yt {
  get fingerprint() {
    if (!this._pubHash)
      throw new Error("No publicKey set!");
    return Yl(this._pubHash);
  }
  get identifier() {
    return this._pubHash ? Uint8Array.from(this._pubHash) : void 0;
  }
  get pubKeyHash() {
    return this._pubHash ? Uint8Array.from(this._pubHash) : void 0;
  }
  get privateKey() {
    return this._privateKey ? Uint8Array.from(this._privateKey) : null;
  }
  get publicKey() {
    return this._publicKey ? Uint8Array.from(this._publicKey) : null;
  }
  get chainCode() {
    return this._chainCode ? Uint8Array.from(this._chainCode) : null;
  }
  get privateExtendedKey() {
    const t = this._privateKey;
    if (!t)
      throw new Error("No private key");
    return ur.encode(this.serialize(this.versions.private, mt(Uint8Array.of(0), t)));
  }
  get publicExtendedKey() {
    if (!this._publicKey)
      throw new Error("No public key");
    return ur.encode(this.serialize(this.versions.public, this._publicKey));
  }
  static fromMasterSeed(t, n = lr) {
    if (ft(t), n = hr(n), 8 * t.length < 128 || 8 * t.length > 512)
      throw new RangeError("HDKey: seed length must be between 128 and 512 bits; 256 bits is advised, got " + t.length);
    const r = Ie(vr, Zl, t), i = r.slice(0, 32), s = r.slice(32);
    return new Yt({ versions: n, chainCode: s, privateKey: i });
  }
  static fromExtendedKey(t, n = lr) {
    n = hr(n);
    const r = ur.decode(t);
    if (r.length !== 78)
      throw new Error(`HDKey: invalid extended key length: expected 78 bytes, got ${r.length}`);
    const i = oe(r), s = i.getUint32(0, !1), o = {
      versions: n,
      depth: r[4],
      parentFingerprint: i.getUint32(5, !1),
      index: i.getUint32(9, !1),
      chainCode: r.slice(13, 45)
    }, a = r.slice(45), u = a[0] === 0;
    if (s !== n[u ? "private" : "public"])
      throw new Error("Version mismatch");
    return u ? new Yt({ ...o, privateKey: a.slice(1) }) : new Yt({ ...o, publicKey: a });
  }
  static fromJSON(t) {
    return Yt.fromExtendedKey("xpriv" in t ? t.xpriv : t.xpub);
  }
  versions;
  depth = 0;
  index = 0;
  parentFingerprint = 0;
  _chainCode = null;
  _privateKey;
  _publicKey;
  _pubHash;
  constructor(t) {
    if (!t || typeof t != "object")
      throw new Error("HDKey.constructor must not be called directly");
    const n = t.depth ?? 0, r = t.index ?? 0, i = t.parentFingerprint ?? 0;
    if (!Number.isSafeInteger(n) || n < 0 || n > cr)
      throw new RangeError("HDKey: depth must be an integer in range 0..255");
    if (Vt(r, "index"), Vt(i, "parentFingerprint"), n === 0 && (r !== 0 || i !== 0))
      throw new Error("HDKey: zero depth with non-zero index/parent fingerprint");
    if (this.versions = t.versions ? hr(t.versions) : lr, this.depth = n, t.chainCode && ft(t.chainCode, 32), this._chainCode = t.chainCode ? Uint8Array.from(t.chainCode) : null, this.index = r, this.parentFingerprint = i, t.publicKey && t.privateKey)
      throw new Error("HDKey: publicKey and privateKey at same time.");
    if (t.privateKey) {
      if (!N.utils.isValidSecretKey(t.privateKey))
        throw new Error("Invalid private key");
      this._privateKey = Uint8Array.from(t.privateKey), this._publicKey = N.getPublicKey(this._privateKey, !0);
    } else if (t.publicKey)
      this._publicKey = Fe.fromBytes(t.publicKey).toBytes(!0);
    else
      throw new Error("HDKey: no public or private key provided");
    this._pubHash = Vl(this._publicKey);
  }
  derive(t) {
    if (!/^[mM]'?/.test(t))
      throw new Error('Path must start with "m" or "M"');
    if (/^[mM]'?$/.test(t))
      return this;
    const n = t.replace(/^[mM]'?\//, "").split("/");
    if (n.length > cr - this.depth)
      throw new Error("HDKey: path exceeds the serializable depth 255");
    let r = this;
    for (const i of n) {
      const s = /^(\d+)('?)$/.exec(i), o = s && s[1];
      if (!s || s.length !== 3 || typeof o != "string")
        throw new Error("invalid child index: " + i);
      let a = +o;
      if (!Number.isSafeInteger(a) || a >= ze)
        throw new Error("Invalid index");
      s[2] === "'" && (a += ze), r = r.deriveChild(a);
    }
    return r;
  }
  deriveChild(t) {
    return this._deriveChild(t);
  }
  /** Test-only implementation seam. Production callers must use deriveChild(). */
  _deriveChild(t, n) {
    if (!this._publicKey || !this._chainCode)
      throw new Error("No publicKey or chainCode set");
    let r = Vt(t, "index");
    if (t >= ze) {
      const c = this._privateKey;
      if (!c)
        throw new Error("Could not derive hardened child key");
      r = mt(Uint8Array.of(0), c, r);
    } else
      r = mt(this._publicKey, r);
    const i = n || Ie(vr, this._chainCode, r);
    ft(i, 64);
    const s = i.slice(0, 32), o = i.slice(32), a = {
      versions: this.versions,
      chainCode: o,
      depth: this.depth + 1,
      parentFingerprint: this.fingerprint,
      index: t
    };
    if (a.depth > cr)
      throw new Error("HDKey: depth exceeds the serializable value 255");
    const u = () => {
      const c = this._privateKey ? 4294967295 : ze - 1;
      if (t >= c)
        throw new Error(`HDKey: cannot retry child derivation at index ${t}`);
      return this.deriveChild(t + 1);
    }, l = fe.fromBytes(s, !0);
    if (!fe.isValid(l))
      return u();
    if (this._privateKey) {
      const c = fe.create(fe.fromBytes(this._privateKey) + l);
      if (!fe.isValidNot0(c))
        return u();
      a.privateKey = fe.toBytes(c);
    } else {
      const c = Fe.fromBytes(this._publicKey), d = l === 0n ? c : c.add(Fe.BASE.multiply(l));
      if (d.equals(Fe.ZERO))
        return u();
      a.publicKey = d.toBytes(!0);
    }
    return new Yt(a);
  }
  sign(t) {
    if (!this._privateKey)
      throw new Error("No privateKey set!");
    return ft(t, 32), N.sign(t, this._privateKey, { prehash: !1 });
  }
  verify(t, n) {
    if (ft(t, 32), ft(n, 64), !this._publicKey)
      throw new Error("No publicKey set!");
    return N.verify(n, t, this._publicKey, { prehash: !1 });
  }
  wipePrivateData() {
    return this._privateKey && (this._privateKey.fill(0), this._privateKey = void 0), this;
  }
  // TODO(v3): Make automatic JSON serialization public-only so JSON.stringify cannot expose xpriv.
  toJSON() {
    return this.toPrivateJSON();
  }
  /**
   * Explicitly exports private key material. Treat the returned value as a secret.
   */
  toPrivateJSON() {
    return {
      xpriv: this.privateExtendedKey,
      xpub: this.publicExtendedKey
    };
  }
  serialize(t, n) {
    if (!this._chainCode)
      throw new Error("No chainCode set");
    return ft(n, 33), mt(Vt(t, "version"), new Uint8Array([this.depth]), Vt(this.parentFingerprint, "parentFingerprint"), Vt(this.index, "index"), this._chainCode, n);
  }
}
var h = class So extends Error {
  constructor(t, n) {
    super(t), this.name = "CTSError", n?.cause !== void 0 && Object.defineProperty(this, "cause", {
      configurable: !0,
      enumerable: !1,
      value: n.cause,
      writable: !0
    }), Object.setPrototypeOf(this, So.prototype);
  }
}, ve = class xo extends h {
  constructor(t, n, r) {
    super(t, r), this.status = n, this.name = "HttpResponseError", Object.setPrototypeOf(this, xo.prototype);
  }
}, ke = class Io extends h {
  constructor(t, n) {
    super(t, n), this.name = "NetworkError", Object.setPrototypeOf(this, Io.prototype);
  }
}, Ht = class Ao extends ke {
  constructor(t) {
    super(t), this.name = "CallerAbortError", Object.setPrototypeOf(this, Ao.prototype);
  }
}, Eo = class Mo extends ke {
  constructor(t, n) {
    super(t, n), this.name = "UncancellableReadError", Object.setPrototypeOf(this, Mo.prototype);
  }
}, ot = class To extends h {
  constructor(t) {
    super(t), this.name = "AmountError", Object.setPrototypeOf(this, To.prototype);
  }
}, Ce = class Bo extends h {
  constructor(t) {
    super(t), this.name = "AmountWithUnitError", Object.setPrototypeOf(this, Bo.prototype);
  }
}, Re = class qo extends h {
  constructor(t, n) {
    let r = n?.refreshed ?? !1, i = n?.cause === void 0 ? r ? `Keyset '${t}' is not a keyset of this mint` : `Keyset '${t}' is not in the wallet snapshot and no refresh was attempted; call loadMint(true), or retry once the repair cooldown clears` : `Could not resolve unknown keyset '${t}': mint refresh failed`;
    super(i, n), this.keysetId = t, this.refreshed = r, this.name = "UnknownKeysetError", Object.setPrototypeOf(this, qo.prototype);
  }
}, Jl = class Oo extends h {
  constructor(t, n, r) {
    super("Melt completed but its change could not be reconstructed; recover the proofs with this error's outputData and createMeltChangeProofs()", r), this.outputData = t, this.quote = n, this.name = "MeltChangeError", Object.setPrototypeOf(this, Oo.prototype);
  }
}, Xl = class Po extends h {
  constructor(t, n) {
    super(t ? "Mint rejected a stale keyset; the snapshot has been refreshed, re-prepare the operation" : "Mint rejected a stale keyset; refresh the snapshot (loadMint(true)) and re-prepare", n), this.repaired = t, this.name = "StaleKeysetError", Object.setPrototypeOf(this, Po.prototype);
  }
}, tc = class Co extends ve {
  constructor(t, n) {
    super(t, 429), this.retryAfterMs = n, this.name = "RateLimitError", Object.setPrototypeOf(this, Co.prototype);
  }
}, Ro = class $o extends ve {
  constructor(t, n) {
    super(n || "Unknown mint operation error", 400), this.code = t, this.name = "MintOperationError", Object.setPrototypeOf(this, $o.prototype);
  }
};
function Xi(e) {
  return e instanceof Ro || e instanceof Error && e.name === "MintOperationError" && "code" in e;
}
var ut = {
  error() {
  },
  warn() {
  },
  info() {
  },
  debug() {
  },
  trace() {
  },
  log() {
  }
};
function Xe(e, t = ut, n) {
  throw t.error(e, n), new h(e);
}
function nt(e, t, n = ut, r) {
  e && Xe(t, n, r);
}
function We(e, t, n = ut, r) {
  e ?? Xe(t, n, r);
}
function rt(e, t, n = ut, r) {
  if (e) try {
    let i = e(t);
    i && typeof i.then == "function" && i.catch((s) => {
      try {
        n.warn("callback failed", {
          ...r ?? {},
          error: s,
          cb: e.name ?? ""
        });
      } catch {
      }
    });
  } catch (i) {
    try {
      n.warn("callback failed", {
        ...r ?? {},
        error: i,
        cb: e.name ?? ""
      });
    } catch {
    }
  }
}
var bn = 8192, Tn = 1e4, ts = 1024, Lo = 1024, ec = 16384, nc = 2147483647, rc = 2n ** 64n - 1n, ic = 1048576, es = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
}, sc = {
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
}, oc = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g;
function vn(e) {
  return String(e).replace(oc, (t) => sc[t] ?? "\\x" + t.charCodeAt(0).toString(16).padStart(2, "0"));
}
function Ir(e, t) {
  if (typeof e == "string") return vn(e);
  if (e instanceof Error) return {
    message: vn(e.message),
    stack: e.stack === void 0 ? void 0 : vn(e.stack)
  };
  if (t >= 8 || typeof e != "object" || !e) return e;
  if (Array.isArray(e)) return e.map((i) => Ir(i, t + 1));
  let n = Object.getPrototypeOf(e);
  if (n !== Object.prototype && n !== null) return e;
  let r = {};
  for (let [i, s] of Object.entries(e)) Object.defineProperty(r, i, {
    value: Ir(s, t + 1),
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
  return r;
}
var ff = class {
  constructor(e = "info") {
    this.minLevel = e;
  }
  should(e) {
    return es[e] <= es[this.minLevel];
  }
  method(e) {
    switch (e) {
      case "error":
        return console.error;
      case "warn":
        return console.warn;
      case "info":
        return console.info;
      case "debug":
        return console.debug;
      case "trace":
        return console.trace;
      default:
        return console.log;
    }
  }
  header(e, t) {
    return `[${e.toUpperCase()}] ${vn(t)}`;
  }
  flattenContext(e) {
    return e ? Ir(e, 0) : void 0;
  }
  emit(e, t, n) {
    if (!this.should(e)) return;
    let r = this.header(e, t), i = this.flattenContext(n), s = this.method(e);
    i && Object.keys(i).length ? s(r, i) : s(r);
  }
  error(e, t) {
    this.emit("error", e, t);
  }
  warn(e, t) {
    this.emit("warn", e, t);
  }
  info(e, t) {
    this.emit("info", e, t);
  }
  debug(e, t) {
    this.emit("debug", e, t);
  }
  trace(e, t) {
    this.emit("trace", e, t);
  }
  log(e, t, n) {
    this.emit(e, t, n);
  }
};
function ac() {
  let e = Date.now();
  return { elapsed: () => Date.now() - e };
}
var uc = new TextDecoder("utf-8", {
  ignoreBOM: !0,
  fatal: !0
});
function tn(e) {
  try {
    return uc.decode(e);
  } catch (t) {
    throw new h("Malformed UTF-8 sequence", { cause: t });
  }
}
var lc = new TextDecoder("utf-8", { fatal: !0 });
function ni(e) {
  let t;
  try {
    t = lc.decode(e);
  } catch (n) {
    throw new h("Malformed UTF-8 sequence", { cause: n });
  }
  return t.charCodeAt(0) === 65279 ? t.slice(1) : t;
}
var cc = /[\uD800-\uDFFF]/u;
function Hn(e) {
  return cc.test(e);
}
function hc(e, t) {
  if (t.has(e)) throw TypeError("Cannot initialize the same private elements twice on an object");
}
function dc(e, t, n) {
  hc(e, t), t.set(e, n);
}
function Ar(e) {
  "@babel/helpers - typeof";
  return Ar = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, Ar(e);
}
function fc(e) {
  if (Object(e) !== e) throw TypeError("right-hand side of 'in' should be an object, got " + (e === null ? "null" : Ar(e)));
  return e;
}
var Ko, ns = !1, rs = /* @__PURE__ */ new WeakMap();
Ko = Symbol.toPrimitive;
var k = class z {
  constructor(t) {
    if (dc(this, rs, !0), t < 0n) throw new ot(`Amount must be >= 0, got ${t}`);
    if (t > rc) throw new ot(`Amount exceeds u64 max, got ${t}`);
    this.value = t, Object.freeze(this);
  }
  static from(t) {
    if (t instanceof z) {
      if (!rs.has(fc(t))) throw new ot("Invalid Amount instance");
      return t;
    }
    if (typeof t == "bigint") {
      if (t < 0n) throw new ot(`Amount must be >= 0, got ${t}`);
      return new z(t);
    }
    if (typeof t == "number") {
      if (!Number.isFinite(t) || !Number.isInteger(t)) throw new ot(`Invalid number amount: ${t}`);
      if (t < 0) throw new ot(`Amount must be >= 0, got ${t}`);
      if (!Number.isSafeInteger(t)) throw new ot(`Unsafe integer amount: ${t}. Use bigint or decimal string.`);
      return new z(BigInt(t));
    }
    if (typeof t == "string") {
      if (t.length > 20) throw new ot(`Amount exceeds u64 max: "${t.slice(0, 20)}..."`);
      if (!/^(0|[1-9]\d*)$/.test(t)) throw new ot(`Invalid amount string "${t}". Expected non-negative decimal integer.`);
      return new z(BigInt(t));
    }
    if (typeof t == "object" && t && typeof t.value == "bigint") return new z(t.value);
    throw new ot("Unsupported amount input type");
  }
  static zero() {
    return new z(0n);
  }
  static one() {
    return new z(1n);
  }
  toBigInt() {
    return this.value;
  }
  toNumber() {
    if (!this.isSafeNumber()) throw new ot(`Amount ${this.value} exceeds Number.MAX_SAFE_INTEGER; use toBigInt/toString/toJSON.`);
    return Number(this.value);
  }
  toNumberUnsafe() {
    return Number(this.value);
  }
  toString() {
    return this.value.toString(10);
  }
  toJSON() {
    return this.toString();
  }
  [Ko](t) {
    return t === "string" ? this.toString() : (ns || (ns = !0, console.warn("Implicit numeric coercion of Amount is deprecated and throws in cashu-ts v5; use .add()/.subtract()/.compareTo(), .toBigInt() or .toNumber(), or .toString() for display.")), this.toNumberUnsafe());
  }
  add(t) {
    let n = z.from(t);
    return new z(this.value + n.value);
  }
  subtract(t) {
    let n = z.from(t), r = this.value - n.value;
    if (r < 0n) throw new ot(`Amount underflow: ${this.value} - ${n.value} would be negative`);
    return new z(r);
  }
  multiplyBy(t) {
    let n = z.from(t).value;
    return new z(this.value * n);
  }
  divideBy(t) {
    let n = z.from(t).value;
    if (n <= 0n) throw new ot(`Divisor must be > 0, got ${n}`);
    return new z(this.value / n);
  }
  modulo(t) {
    let n = z.from(t).value;
    if (n <= 0n) throw new ot(`Divisor must be > 0, got ${n}`);
    return new z(this.value % n);
  }
  ceilPercent(t, n = 100) {
    if (!Number.isSafeInteger(t) || t < 0) throw new ot(`ceilPercent: numerator must be a non-negative integer, got ${t}`);
    if (!Number.isSafeInteger(n) || n <= 0) throw new ot(`ceilPercent: denominator must be a positive integer, got ${n}`);
    let r = BigInt(t), i = BigInt(n);
    return new z((this.value * r + (i - 1n)) / i);
  }
  floorPercent(t, n = 100) {
    if (!Number.isSafeInteger(t) || t < 0) throw new ot(`floorPercent: numerator must be a non-negative integer, got ${t}`);
    if (!Number.isSafeInteger(n) || n <= 0) throw new ot(`floorPercent: denominator must be a positive integer, got ${n}`);
    let r = BigInt(t), i = BigInt(n);
    return new z(this.value * r / i);
  }
  inRange(t, n) {
    let r = z.from(t), i = z.from(n);
    if (r.greaterThan(i)) throw new ot(`inRange: min (${r.toString()}) must be <= max (${i.toString()})`);
    return this.greaterThanOrEqual(r) && this.lessThanOrEqual(i);
  }
  clamp(t, n) {
    let r = z.from(t), i = z.from(n);
    if (r.greaterThan(i)) throw new ot(`clamp: min (${r.toString()}) must be <= max (${i.toString()})`);
    return z.max(r, z.min(i, this));
  }
  scaledBy(t, n) {
    let r = z.from(t).value, i = z.from(n).value;
    if (i === 0n) throw new ot("scaledBy: denominator must be > 0");
    return r === 0n ? z.zero() : new z((2n * this.value * r + i) / (2n * i));
  }
  isSafeNumber() {
    let t = BigInt(9007199254740991);
    return this.value <= t;
  }
  isZero() {
    return this.value === 0n;
  }
  equals(t) {
    return this.value === z.from(t).value;
  }
  compareTo(t) {
    let n = z.from(t).value;
    return this.value < n ? -1 : +(this.value > n);
  }
  lessThan(t) {
    return this.compareTo(t) < 0;
  }
  lessThanOrEqual(t) {
    return this.compareTo(t) <= 0;
  }
  greaterThan(t) {
    return this.compareTo(t) > 0;
  }
  greaterThanOrEqual(t) {
    return this.compareTo(t) >= 0;
  }
  static min(t, n) {
    let r = z.from(t), i = z.from(n);
    return r.compareTo(i) <= 0 ? r : i;
  }
  static max(t, n) {
    let r = z.from(t), i = z.from(n);
    return r.compareTo(i) >= 0 ? r : i;
  }
  static sum(t) {
    let n = 0n;
    for (let r of t) n += z.from(r).value;
    return new z(n);
  }
  withUnit(t) {
    return new pc(this, t);
  }
}, pc = class yt {
  constructor(t, n) {
    if (typeof n != "string" || n.length === 0) throw new Ce("unit required");
    this._amount = t, this.unit = n, Object.freeze(this);
  }
  static from(t, n) {
    return new yt(k.from(t), n);
  }
  static zero(t) {
    return new yt(k.zero(), t);
  }
  static one(t) {
    return new yt(k.one(), t);
  }
  toAmount() {
    return this._amount;
  }
  toBigInt() {
    return this._amount.toBigInt();
  }
  toNumber() {
    return this._amount.toNumber();
  }
  toString() {
    return `[${this.unit}]: ${this._amount.toString()}`;
  }
  toJSON() {
    return {
      amount: this._amount.toString(),
      unit: this.unit
    };
  }
  [Symbol.toPrimitive](t) {
    if (t === "string") return this.toString();
    throw new Ce(`Implicit ${t === "number" ? "numeric" : "default"} coercion of AmountWithUnit is unsafe; use .toAmount() then explicit arithmetic, or .toString() for display.`);
  }
  isZero() {
    return this._amount.isZero();
  }
  isSafeNumber() {
    return this._amount.isSafeNumber();
  }
  requireSameUnit(t) {
    if (this.unit !== t.unit) throw new Ce(`unit mismatch: ${this.unit} vs ${t.unit}`);
  }
  add(t) {
    return this.requireSameUnit(t), new yt(this._amount.add(t._amount), this.unit);
  }
  subtract(t) {
    return this.requireSameUnit(t), new yt(this._amount.subtract(t._amount), this.unit);
  }
  equals(t) {
    return this.requireSameUnit(t), this._amount.equals(t._amount);
  }
  compareTo(t) {
    return this.requireSameUnit(t), this._amount.compareTo(t._amount);
  }
  lessThan(t) {
    return this.compareTo(t) < 0;
  }
  lessThanOrEqual(t) {
    return this.compareTo(t) <= 0;
  }
  greaterThan(t) {
    return this.compareTo(t) > 0;
  }
  greaterThanOrEqual(t) {
    return this.compareTo(t) >= 0;
  }
  inRange(t, n) {
    return this.requireSameUnit(t), this.requireSameUnit(n), this._amount.inRange(t._amount, n._amount);
  }
  clamp(t, n) {
    return this.requireSameUnit(t), this.requireSameUnit(n), new yt(this._amount.clamp(t._amount, n._amount), this.unit);
  }
  multiplyBy(t) {
    return new yt(this._amount.multiplyBy(t), this.unit);
  }
  divideBy(t) {
    return new yt(this._amount.divideBy(t), this.unit);
  }
  modulo(t) {
    return new yt(this._amount.modulo(t), this.unit);
  }
  ceilPercent(t, n) {
    return new yt(this._amount.ceilPercent(t, n), this.unit);
  }
  floorPercent(t, n) {
    return new yt(this._amount.floorPercent(t, n), this.unit);
  }
  scaledBy(t, n) {
    return new yt(this._amount.scaledBy(t, n), this.unit);
  }
  static min(t, n) {
    return t.requireSameUnit(n), t.compareTo(n) <= 0 ? t : n;
  }
  static max(t, n) {
    return t.requireSameUnit(n), t.compareTo(n) >= 0 ? t : n;
  }
  static sum(t, n) {
    let r = n, i = 0n, s = !1;
    for (let o of t) {
      if (r === void 0) r = o.unit;
      else if (o.unit !== r) throw new Ce(`unit mismatch: ${r} vs ${o.unit}`);
      i += o._amount.toBigInt(), s = !0;
    }
    if (r === void 0) throw new Ce("cannot infer unit from empty sum");
    return new yt(s ? k.from(i) : k.zero(), r);
  }
}, Mt = Object.freeze({
  parse: vc,
  stringify: Sc
}), gc = 64, dr;
function mc(e) {
  return typeof e == "object" && !!e && !Array.isArray(e);
}
function yc() {
  let e = globalThis.BigInt;
  return typeof e == "function" ? e : void 0;
}
function wc(e) {
  if (!dr) {
    let t = e(String(9007199254740991));
    dr = {
      max: t,
      min: -t
    };
  }
  return dr;
}
var bc = class {
  constructor(e, t, n, r) {
    this.src = e, this.strict = t, this.fallbackTo = n, this.bigIntCtor = r, this.i = 0;
  }
  parse() {
    let e = this.parseValue(0);
    if (this.skipWhitespace(), !this.isEnd()) throw this.syntaxError("Unexpected trailing input");
    return e;
  }
  parseValue(e) {
    if (e > gc) throw this.syntaxError("JSON nesting exceeds the maximum depth");
    this.skipWhitespace();
    let t = this.peek();
    if (t === "{") return this.parseObject(e);
    if (t === "[") return this.parseArray(e);
    if (t === '"') return this.parseString();
    if (t === "-" || this.isDigit(t)) return this.parseNumber();
    if (t === "t") return this.parseLiteral("true", !0);
    if (t === "f") return this.parseLiteral("false", !1);
    if (t === "n") return this.parseLiteral("null", null);
    throw this.syntaxError(`Unexpected token '${t || "EOF"}'`);
  }
  parseObject(e) {
    this.expect("{"), this.skipWhitespace();
    let t = {}, n = /* @__PURE__ */ new Set();
    if (this.peek() === "}") return this.expect("}"), t;
    for (; !this.isEnd(); ) {
      let r = this.parseString();
      if (this.strict && n.has(r)) throw this.syntaxError(`Duplicate key "${r}"`);
      if (n.add(r), this.skipWhitespace(), this.expect(":"), Object.defineProperty(t, r, {
        value: this.parseValue(e + 1),
        writable: !0,
        enumerable: !0,
        configurable: !0
      }), this.skipWhitespace(), this.peek() === "}") return this.expect("}"), t;
      this.expect(","), this.skipWhitespace();
    }
    throw this.syntaxError("Unterminated object");
  }
  parseArray(e) {
    this.expect("["), this.skipWhitespace();
    let t = [];
    if (this.peek() === "]") return this.expect("]"), t;
    for (; !this.isEnd(); ) {
      if (t.push(this.parseValue(e + 1)), this.skipWhitespace(), this.peek() === "]") return this.expect("]"), t;
      this.expect(","), this.skipWhitespace();
    }
    throw this.syntaxError("Unterminated array");
  }
  parseString() {
    this.expect('"');
    let e = "";
    for (; !this.isEnd(); ) {
      let t = this.next();
      if (t === '"') return e;
      if (t === "\\") {
        let n = this.next();
        switch (n) {
          case '"':
          case "\\":
          case "/":
            e += n;
            break;
          case "b":
            e += "\b";
            break;
          case "f":
            e += "\f";
            break;
          case "n":
            e += `
`;
            break;
          case "r":
            e += "\r";
            break;
          case "t":
            e += "	";
            break;
          case "u": {
            let r = this.src.slice(this.i, this.i + 4);
            if (!/^[0-9a-fA-F]{4}$/.test(r)) throw this.syntaxError("Invalid unicode escape");
            this.i += 4, e += String.fromCharCode(parseInt(r, 16));
            break;
          }
          default:
            throw this.syntaxError(`Invalid escape '\\${n}'`);
        }
        continue;
      }
      if (t < " ") throw this.syntaxError("Invalid control character in string");
      e += t;
    }
    throw this.syntaxError("Unterminated string");
  }
  parseNumber() {
    let e = this.i;
    this.peek() === "-" && (this.i += 1), this.peek() === "0" ? this.i += 1 : this.readDigits(), this.peek() === "." && (this.i += 1, this.readDigits());
    let t = this.peek();
    if (t === "e" || t === "E") {
      this.i += 1;
      let o = this.peek();
      (o === "+" || o === "-") && (this.i += 1), this.readDigits();
    }
    let n = this.src.slice(e, this.i);
    if (!(n.indexOf(".") === -1 && n.indexOf("e") === -1 && n.indexOf("E") === -1)) {
      let o = Number(n);
      if (!Number.isFinite(o)) throw this.syntaxError("Bad number");
      return o;
    }
    if (!this.bigIntCtor) switch (this.fallbackTo) {
      case "number": {
        let o = Number(n);
        if (!Number.isFinite(o)) throw this.syntaxError("Bad number");
        return o;
      }
      case "string":
        return n;
      case "error":
        throw new h("BigInt is not available in this runtime");
    }
    let r = this.bigIntCtor(n), { max: i, min: s } = wc(this.bigIntCtor);
    return r > i || r < s ? r : Number(n);
  }
  parseLiteral(e, t) {
    if (this.src.slice(this.i, this.i + e.length) !== e) throw this.syntaxError(`Unexpected token near '${this.src.slice(this.i, this.i + 8)}'`);
    return this.i += e.length, t;
  }
  readDigits() {
    let e = this.i;
    for (; this.isDigit(this.peek()); ) this.i += 1;
    if (this.i === e) throw this.syntaxError("Bad number");
  }
  skipWhitespace() {
    for (; !this.isEnd(); ) {
      let e = this.peek();
      if (e === " " || e === `
` || e === "\r" || e === "	") {
        this.i += 1;
        continue;
      }
      break;
    }
  }
  expect(e) {
    if (this.next() !== e) throw this.syntaxError(`Expected '${e}'`);
  }
  peek() {
    return this.src.charAt(this.i);
  }
  next() {
    let e = this.src.charAt(this.i);
    return this.i += 1, e;
  }
  isDigit(e) {
    return e >= "0" && e <= "9";
  }
  isEnd() {
    return this.i >= this.src.length;
  }
  syntaxError(e) {
    return /* @__PURE__ */ SyntaxError(`${e} at position ${this.i}`);
  }
};
function is(e, t, n) {
  Reflect.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function Er(e, t, n) {
  let r = Array.isArray(e) ? e[Number(t)] : e[t];
  if (Array.isArray(r)) for (let i = 0; i < r.length; i += 1) {
    let s = Er(r, String(i), n);
    s === void 0 ? Reflect.deleteProperty(r, i) : is(r, String(i), s);
  }
  else if (mc(r)) for (let i of Object.keys(r)) {
    let s = Er(r, i, n);
    s === void 0 ? delete r[i] : is(r, i, s);
  }
  return n.call(e, t, r);
}
function vc(e, t, n) {
  let r = n?.strict === !0, i = n?.fallbackTo ?? "number";
  if (i !== "number" && i !== "string" && i !== "error") throw new h(`Incorrect value for fallbackTo option, must be "number", "string", "error" or undefined but passed ${String(n?.fallbackTo)}`);
  let s = new bc(String(e), r, i, yc()).parse();
  return typeof t == "function" ? Er({ "": s }, "", t) : s;
}
function ss(e) {
  let t = JSON.stringify(e);
  if (typeof t != "string") throw new h("Failed to stringify string value");
  return t;
}
function kc(e) {
  return typeof e == "object" && !!e && "toJSON" in e && typeof e.toJSON == "function";
}
function _c(e) {
  return e instanceof Number || e instanceof String || e instanceof Boolean ? e.valueOf() : e;
}
function Sc(e, t, n) {
  let r = "", i = "", s = /* @__PURE__ */ new WeakSet();
  if (typeof n == "number" ? i = " ".repeat(Math.min(10, Math.max(0, Math.floor(n)))) : typeof n == "string" && (i = n.slice(0, 10)), t && typeof t != "function" && !Array.isArray(t)) throw new h("stringify: replacer must be a function or array");
  let o = Array.isArray(t) ? Array.from(new Set(t.filter((u) => typeof u == "string" || typeof u == "number").map((u) => String(u)))) : void 0, a = (u, l) => {
    let c = u[l];
    switch (c instanceof k ? c = c.toBigInt() : kc(c) && (c = c.toJSON(l)), typeof t == "function" && (c = t.call(u, l, c)), c = _c(c), typeof c) {
      case "string":
        return ss(c);
      case "number":
        return Number.isFinite(c) ? String(c) : "null";
      case "boolean":
        return c ? "true" : "false";
      case "bigint":
        return String(c);
      case "undefined":
        return;
      case "object": {
        if (c === null) return "null";
        if (s.has(c)) throw TypeError("Converting circular structure to JSON");
        s.add(c);
        let d = r;
        r += i;
        try {
          if (Array.isArray(c)) {
            let w = [], v = c;
            for (let b = 0; b < c.length; b += 1) {
              let E = a(v, String(b));
              w.push(E ?? "null");
            }
            let x = w.length === 0 ? "[]" : r ? `[
${r}${w.join(`,
${r}`)}
${d}]` : `[${w.join(",")}]`;
            return r = d, x;
          }
          let f = c, p = o ?? Object.keys(f), g = [];
          for (let w of p) {
            let v = a(f, w);
            v !== void 0 && g.push(`${ss(w)}${r ? ": " : ":"}${v}`);
          }
          let m = g.length === 0 ? "{}" : r ? `{
${r}${g.join(`,
${r}`)}
${d}}` : `{${g.join(",")}}`;
          return r = d, m;
        } finally {
          s.delete(c);
        }
      }
      default:
        return;
    }
  };
  return a({ "": e }, "");
}
function ri(e) {
  return e.trim().replace(/[\t\n\f\r ]+/g, "").replace(/={1,2}$/, "");
}
function xc(e) {
  return Fu.encode(e);
}
function Bn(e) {
  return Qr.encode(e);
}
function No(e) {
  return zu.encode(e);
}
function ii(e) {
  try {
    return Qr.decode(ri(e));
  } catch (t) {
    throw new h("Invalid base64url string", { cause: t });
  }
}
function Ic(e) {
  try {
    return Ls.decode(ri(e));
  } catch (t) {
    throw new h("Invalid base64 string", { cause: t });
  }
}
function jn(e) {
  try {
    return ii(e);
  } catch (t) {
    try {
      return Ic(e);
    } catch {
      throw t;
    }
  }
}
function Ac(e) {
  let t = ni(jn(e));
  return Mt.parse(t, void 0, { strict: !0 });
}
function en(e) {
  if (typeof e != "string" || e.length === 0) return !1;
  let t = ri(e);
  if (t.length === 0) return !1;
  let n = /[-_]/.test(t) ? Qr : Ls;
  try {
    return n.encode(n.decode(t)) === t;
  } catch {
    return !1;
  }
}
var si = 1023;
function Ec(e) {
  let t = e.lastIndexOf("1");
  if (t < 1 || t === e.length - 1) throw new h("Invalid bech32m string: missing or misplaced separator");
}
function Mc(e, t, n = si) {
  let r = An.toWords(t);
  return An.encode(e, r, n);
}
function Tc(e, t = si) {
  Ec(e);
  let { prefix: n, words: r } = An.decode(e, t);
  return {
    hrp: n,
    data: An.fromWords(r)
  };
}
function Bc(e, t = si) {
  return Tc(e, t).data;
}
function qc(e) {
  return typeof e == "number" || typeof e == "bigint" || typeof e == "string";
}
function oi(e) {
  let t = [];
  return ai(e, t), new Uint8Array(t);
}
function ai(e, t) {
  if (e === null) t.push(246);
  else if (e === void 0) t.push(247);
  else if (typeof e == "boolean") t.push(e ? 245 : 244);
  else if (typeof e == "number") Rc(e, t);
  else if (typeof e == "bigint") ui(e, t);
  else if (typeof e == "string") Uo(e, t);
  else if (Array.isArray(e)) Lc(e, t);
  else if (e instanceof Uint8Array) $c(e, t);
  else if (typeof e == "object" && e && !Array.isArray(e)) Kc(e, t);
  else throw new h("Unsupported type");
}
function Oc(e, t) {
  e < 24 ? t.push(e) : e < 256 ? t.push(24, e) : e < 65536 ? t.push(25, e >>> 8 & 255, e & 255) : e < 4294967296 ? t.push(26, e >>> 24 & 255, e >>> 16 & 255, e >>> 8 & 255, e & 255) : ui(BigInt(e), t);
}
function ui(e, t) {
  e >= 0n ? os(0, e, t) : os(1, -1n - e, t);
}
function os(e, t, n) {
  let r = e << 5;
  if (t < 24n) n.push(r | Number(t));
  else if (t < 256n) n.push(r | 24, Number(t));
  else if (t < 65536n) {
    let i = Number(t);
    n.push(r | 25, i >>> 8 & 255, i & 255);
  } else if (t < 4294967296n) {
    let i = Number(t);
    n.push(r | 26, i >>> 24 & 255, i >>> 16 & 255, i >>> 8 & 255, i & 255);
  } else if (t < 18446744073709551616n) {
    let i = Number(t >> 32n), s = Number(t & 4294967295n);
    n.push(r | 27, i >>> 24 & 255, i >>> 16 & 255, i >>> 8 & 255, i & 255, s >>> 24 & 255, s >>> 16 & 255, s >>> 8 & 255, s & 255);
  } else throw new h("BigInt value out of uint64 range");
}
function Pc(e, t) {
  let n = -1 - e;
  n < 24 ? t.push(32 | n) : n < 256 ? t.push(56, n & 255) : n < 65536 ? t.push(57, n >>> 8 & 255, n & 255) : n < 4294967296 ? t.push(58, n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255) : ui(BigInt(e), t);
}
function Cc(e, t) {
  let n = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(8));
  n.setFloat64(0, e, !1), t.push(251);
  for (let r = 0; r < 8; r++) t.push(n.getUint8(r));
}
function Rc(e, t) {
  Number.isInteger(e) ? e >= 0 ? Oc(e, t) : Pc(e, t) : Cc(e, t);
}
function $c(e, t) {
  let n = e.length;
  if (n < 24) t.push(64 + n);
  else if (n < 256) t.push(88, n);
  else if (n < 65536) t.push(89, n >> 8 & 255, n & 255);
  else if (n < 4294967296) t.push(90, n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255);
  else throw new h("Byte string too long to encode");
  for (let r = 0; r < e.length; r++) t.push(e[r]);
}
function Uo(e, t) {
  if (Hn(e)) throw new h("CBOR text must be well-formed UTF-16");
  let n = new TextEncoder().encode(e), r = n.length;
  if (r < 24) t.push(96 + r);
  else if (r < 256) t.push(120, r);
  else if (r < 65536) t.push(121, r >>> 8 & 255, r & 255);
  else if (r < 4294967296) t.push(122, r >>> 24 & 255, r >>> 16 & 255, r >>> 8 & 255, r & 255);
  else throw new h("String too long to encode");
  for (let i = 0; i < n.length; i++) t.push(n[i]);
}
function Lc(e, t) {
  let n = e.length;
  if (n < 24) t.push(128 | n);
  else if (n < 256) t.push(152, n);
  else if (n < 65536) t.push(153, n >>> 8 & 255, n & 255);
  else throw new h("Unsupported array length");
  for (let r of e) ai(r, t);
}
function Kc(e, t) {
  let n = Object.keys(e), r = n.length;
  if (r >= 4294967296) throw new h("Object has too many keys to encode");
  r < 24 ? t.push(160 | r) : r < 256 ? t.push(184, r) : r < 65536 ? t.push(185, r >> 8 & 255, r & 255) : t.push(186, r >> 24 & 255, r >> 16 & 255, r >> 8 & 255, r & 255);
  for (let i of n) Uo(i, t), ai(e[i], t);
}
function li(e) {
  return qn(new DataView(e.buffer, e.byteOffset, e.byteLength), 0).value;
}
var Nc = 64;
function qn(e, t, n = 0, r = { nodes: 0 }) {
  if (n > Nc) throw new h("CBOR nesting exceeds the maximum depth");
  if (t >= e.byteLength) throw new h("Unexpected end of data");
  let i = e.getUint8(t++), s = i >> 5, o = i & 31;
  switch (s) {
    case 0:
      return Uc(e, t, o);
    case 1:
      return Dc(e, t, o);
    case 2:
      return Fc(e, t, o);
    case 3:
      return zc(e, t, o);
    case 4:
      return Qc(e, t, o, n, r);
    case 5:
      return Hc(e, t, o, n, r);
    case 7:
      return Wc(e, t, o);
    default:
      throw new h(`Unsupported major type: ${s}`);
  }
}
function Xt(e, t, n) {
  if (t + n > e.byteLength) throw new h("Unexpected end of data");
}
function qe(e, t, n) {
  if (n < 24) return {
    value: n,
    offset: t
  };
  if (n === 24) return Xt(e, t, 1), {
    value: e.getUint8(t++),
    offset: t
  };
  if (n === 25) {
    Xt(e, t, 2);
    let r = e.getUint16(t, !1);
    return t += 2, {
      value: r,
      offset: t
    };
  }
  if (n === 26) {
    Xt(e, t, 4);
    let r = e.getUint32(t, !1);
    return t += 4, {
      value: r,
      offset: t
    };
  }
  if (n === 27) {
    Xt(e, t, 8);
    let r = e.getUint32(t, !1), i = e.getUint32(t + 4, !1);
    t += 8;
    let s = r * 2 ** 32 + i;
    return s > 2 ** 53 - 1 ? {
      value: BigInt(r) << 32n | BigInt(i),
      offset: t
    } : {
      value: s,
      offset: t
    };
  }
  throw new h(`Unsupported length: ${n}`);
}
function Uc(e, t, n) {
  let { value: r, offset: i } = qe(e, t, n);
  return {
    value: r,
    offset: i
  };
}
function Dc(e, t, n) {
  let { value: r, offset: i } = qe(e, t, n);
  if (typeof r == "bigint") return {
    value: -1n - r,
    offset: i
  };
  let s = -1 - r;
  return Number.isSafeInteger(s) ? {
    value: s,
    offset: i
  } : {
    value: -1n - BigInt(r),
    offset: i
  };
}
function Fc(e, t, n) {
  let { value: r, offset: i } = qe(e, t, n), s = Number(r);
  if (i + s > e.byteLength) throw new h("Byte string length exceeds data length");
  return {
    value: new Uint8Array(e.buffer, e.byteOffset + i, s),
    offset: i + s
  };
}
function zc(e, t, n) {
  let { value: r, offset: i } = qe(e, t, n), s = Number(r);
  if (i + s > e.byteLength) throw new h("String length exceeds data length");
  return {
    value: tn(new Uint8Array(e.buffer, e.byteOffset + i, s)),
    offset: i + s
  };
}
function Do(e) {
  if (e.nodes++, e.nodes > 262144) throw new h("CBOR payload exceeds the maximum item/entry budget");
}
function Qc(e, t, n, r, i) {
  let { value: s, offset: o } = qe(e, t, n), a = Number(s), u = [], l = o;
  for (let c = 0; c < a; c++) {
    Do(i);
    let d = qn(e, l, r + 1, i);
    u.push(d.value), l = d.offset;
  }
  return {
    value: u,
    offset: l
  };
}
function Hc(e, t, n, r, i) {
  let { value: s, offset: o } = qe(e, t, n), a = Number(s), u = {}, l = o;
  for (let c = 0; c < a; c++) {
    Do(i);
    let d = qn(e, l, r + 1, i);
    if (!qc(d.value)) throw new h("Invalid key type");
    let f = String(d.value);
    if (Object.prototype.hasOwnProperty.call(u, f)) throw new h(`Duplicate map key "${f}"`);
    let p = qn(e, d.offset, r + 1, i);
    Object.defineProperty(u, f, {
      value: p.value,
      writable: !0,
      enumerable: !0,
      configurable: !0
    }), l = p.offset;
  }
  return {
    value: u,
    offset: l
  };
}
function jc(e) {
  let t = (e & 31744) >> 10, n = e & 1023, r = e & 32768 ? -1 : 1;
  return t === 0 ? r * 2 ** -14 * (n / 1024) : t === 31 ? n ? NaN : r * (1 / 0) : r * 2 ** (t - 15) * (1 + n / 1024);
}
function Wc(e, t, n) {
  if (n < 24) switch (n) {
    case 20:
      return {
        value: !1,
        offset: t
      };
    case 21:
      return {
        value: !0,
        offset: t
      };
    case 22:
      return {
        value: null,
        offset: t
      };
    case 23:
      return {
        value: void 0,
        offset: t
      };
    default:
      throw new h(`Unknown simple value: ${n}`);
  }
  if (n === 24) {
    Xt(e, t, 1);
    let r = e.getUint8(t++);
    if (r < 32) throw new h(`Invalid extended simple value: ${r}`);
    return {
      value: r,
      offset: t
    };
  }
  if (n === 25) {
    Xt(e, t, 2);
    let r = jc(e.getUint16(t, !1));
    return t += 2, {
      value: r,
      offset: t
    };
  }
  if (n === 26) {
    Xt(e, t, 4);
    let r = e.getFloat32(t, !1);
    return t += 4, {
      value: r,
      offset: t
    };
  }
  if (n === 27) {
    Xt(e, t, 8);
    let r = e.getFloat64(t, !1);
    return t += 8, {
      value: r,
      offset: t
    };
  }
  throw new h(`Unknown simple or float value: ${n}`);
}
var Gc = [
  12,
  15,
  18,
  21,
  24
];
function pf(e, t = "") {
  if (typeof e != "string" || typeof t != "string") throw new h("mnemonicToSeedSync: mnemonic and passphrase must be strings");
  let n = e.normalize("NFKD");
  if (!Gc.includes(n.split(" ").length)) throw new h("mnemonicToSeedSync: a mnemonic has 12, 15, 18, 21 or 24 words");
  return rl(vr, n, ("mnemonic" + t).normalize("NFKD"), {
    c: 2048,
    dkLen: 64
  });
}
var Zc = St("Secp256k1_HashToCurve_Cashu_");
function cn(e) {
  let t = at(mt(Zc, e)), n = 0, r = new Uint8Array(4), i = new DataView(r.buffer), s = 2 ** 16;
  for (let o = 0; o < s; o++) {
    i.setUint32(0, n, !0);
    let a = at(mt(t, r));
    try {
      return wt(Z(mt(new Uint8Array([2]), a)));
    } catch {
      n++;
    }
  }
  throw new h("No valid point found");
}
function Fo(e) {
  let t = e.map((n) => n.toHex(!1)).join("");
  return at(new TextEncoder().encode(t));
}
function gf(e) {
  return N.Point.fromHex(Z(e));
}
function wt(e) {
  return N.Point.fromHex(e);
}
function zo(e) {
  try {
    return wt(e.toHex(!0));
  } catch (t) {
    throw new h("Invalid point: not a valid secp256k1 point", { cause: t });
  }
}
var mf = 12;
function On(e) {
  return e.length === 12 && en(e);
}
var Vc = (e) => {
  let t, n = (r) => xt(jn(r)) % BigInt(2147483647);
  if (e.length === 12 && en(e)) t = n(e);
  else if (Me(e)) t = rn(e) % BigInt(2 ** 31 - 1);
  else if (en(e)) t = n(e);
  else throw new h("Invalid keyset id: neither hex nor base64");
  return t;
};
function Wn() {
  return N.utils.randomSecretKey();
}
function yf(e, t, n) {
  let r = N.Point.Fn.fromBytes(t);
  return {
    C_: zo(e).multiply(r),
    id: n
  };
}
function wf() {
  let e = Z(zt(32));
  return Ge(new TextEncoder().encode(e));
}
function Ge(e, t) {
  let n = cn(e);
  if (t === void 0) t = N.Point.Fn.fromBytes(Wn());
  else if (t === 0n) throw new h("Blinding factor r must be non-zero");
  let r = N.Point.BASE.multiply(t);
  return {
    B_: n.add(r),
    r: t,
    secret: e
  };
}
function Yc(e, t, n) {
  return e.subtract(n.multiply(t));
}
function Jc(e, t, n, r) {
  let i = Yc(e.C_, t, r);
  return {
    id: e.id,
    secret: n,
    C: i
  };
}
function ci(e, t = !1) {
  if (Hn(e)) throw new h("Message must be well-formed UTF-16");
  let n = at(new TextEncoder().encode(e));
  return t ? Z(n) : n;
}
var hn = (e, t) => {
  let n = typeof e == "string" ? F(e) : e, r = typeof t == "string" ? F(t) : t;
  return Z(ei.sign(n, r));
}, Xc = (e, t) => hn(ci(e), t), hi = (e, t, n, r = !1) => {
  try {
    return Qo(e, ci(t), n, r);
  } catch (i) {
    if (r) throw i;
  }
  return !1;
}, Qo = (e, t, n, r = !1) => {
  try {
    let i = typeof t == "string" ? F(t) : t;
    return ei.verify(F(e), i, F(Ho(n)));
  } catch (i) {
    if (r) throw i;
  }
  return !1;
};
function Ho(e) {
  if (typeof e != "string") return e;
  let t = e.toLowerCase();
  return t.length === 66 && (t.startsWith("02") || t.startsWith("03")) ? t.slice(2) : t;
}
function as(e, t) {
  let n = Array.isArray(t) ? t : [t], r = e.toLowerCase();
  for (let i of n) {
    let s = Z(N.getPublicKey(F(i), !0));
    if (s === r) return i;
    if (s.slice(2) === r.slice(2)) {
      let o = N.Point.Fn.fromBytes(F(i));
      return Z(N.Point.Fn.toBytes(N.Point.Fn.neg(o)));
    }
  }
  throw new h(`No private key matches quote pubkey ${e}`);
}
function Mr(e, t, n) {
  let r = /* @__PURE__ */ new Map();
  for (let i of n) {
    let s = Ho(i);
    r.has(s) || r.set(s, i);
  }
  return Array.from(r.values()).filter((i) => e.some((s) => hi(s, t, i)));
}
var bf = (e, t, n, r = 1) => !Number.isInteger(r) || r < 1 ? !1 : Mr(e, t, n).length >= r, us = "m/0'/0'/0'";
function th(e) {
  let t = {};
  return Object.keys(e).forEach((n) => {
    t[n] = Z(e[n]);
  }), t;
}
function vf(e) {
  let t = {};
  return Object.keys(e).forEach((n) => {
    t[n] = F(e[n]);
  }), t;
}
function jo(e) {
  return N.getPublicKey(e, !0);
}
function kf(e, t, n) {
  if (!Number.isInteger(e) || e < 0 || e > 64) throw new h("createNewMintKeys: pow2height must be an integer in [0, 64]");
  let { expiry: r, input_fee_ppk: i, unit: s = "sat", versionByte: o = 1 } = n || {}, a = 0n, u = {}, l = {}, c;
  for (t && (c = Yt.fromMasterSeed(t)); a < e; ) {
    let d = (2n ** a).toString();
    if (c) {
      let f = c.derive(`${us}/${a}`).privateKey;
      if (f) l[d] = f;
      else throw new h(`Could not derive Private key from: ${us}/${a}`);
    } else l[d] = Wn();
    u[d] = jo(l[d]), a++;
  }
  return {
    pubKeys: u,
    privKeys: l,
    keysetId: Da(th(u), {
      expiry: r,
      input_fee_ppk: i,
      unit: s,
      versionByte: o
    })
  };
}
function _f(e, t) {
  let n = cn(e.secret), r = N.Point.Fn.fromBytes(t);
  return n.multiply(r).equals(e.C);
}
function Wo(e, t, n) {
  let r = [e, {
    nonce: Z(zt(32)),
    data: t,
    tags: n
  }];
  return JSON.stringify(r);
}
function re(e) {
  let t;
  if (typeof e == "string" && Hn(e)) throw new h("Invalid NUT-10 secret Unicode");
  try {
    t = typeof e == "string" ? JSON.parse(e) : e;
  } catch (i) {
    throw new h("Can't parse secret", { cause: i });
  }
  if (!Array.isArray(t) || t.length !== 2 || typeof t[0] != "string" || typeof t[1] != "object" || t[0].trim().length === 0 || t[1] === null) throw new h("Invalid NUT-10 secret");
  let [n, r] = t;
  if (typeof r.nonce != "string" || typeof r.data != "string") throw new h("Invalid NUT-10 secret nonce / data");
  if (r.tags != null) {
    if (!Array.isArray(r.tags)) throw new h("Invalid NUT-10 secret tags");
    if (r.tags.some((i) => !Array.isArray(i) || i.length === 0 || i.some((s) => typeof s != "string" || !s.length))) throw new h("Invalid NUT-10 tag(s)");
  }
  return [n, {
    nonce: r.nonce,
    data: r.data,
    tags: r.tags ?? void 0
  }];
}
function Go(e, t) {
  let n = Array.isArray(e) ? e : [e], r = re(t), i = r[0];
  if (!n.includes(i)) throw new h(`Invalid secret kind: ${i} Allowed: ${n.join(", ")}`);
  return r;
}
function Gn(e) {
  return re(e)[0];
}
function Zo(e) {
  return re(e)[1];
}
function Vo(e) {
  let { data: t } = Zo(e);
  return t;
}
function di(e) {
  let { tags: t } = Zo(e);
  return t ?? [];
}
function eh(e, t) {
  return di(e).some((n) => n[0] === t);
}
function nn(e, t) {
  let n = di(e).find((r) => r[0] === t);
  if (!(!n || n.length <= 1)) return n.slice(1);
}
function dn(e, t) {
  let n = nn(e, t);
  if (n !== void 0) {
    if (n.length !== 1) throw new h(`Invalid NUT-10 tag "${t}": must carry a single value`);
    return n[0];
  }
}
function Lt(e, t) {
  let n = dn(e, t);
  if (n === void 0) {
    if (!eh(e, t)) return;
    throw new h(`Invalid NUT-10 tag "${t}": must carry a single value`);
  }
  let r = /^-?\d+$/.test(n) ? Number(n) : NaN;
  if (!Number.isSafeInteger(r)) throw new h(`Invalid NUT-10 tag "${t}": must be an integer`);
  return r;
}
var Tr = St("Cashu_P2BK_v1"), Sf = Tr.slice();
function nh(e, t, n = !0) {
  let r = +!n, i = e.length + r;
  if (i > 11) throw new h(`Too many pubkeys, ${i} slots provided, maximum allowed is 11 in total`);
  if (!e.length) return {
    blinded: [],
    Ehex: ""
  };
  t = t ?? N.utils.randomSecretKey();
  let s = N.Point.Fn.fromBytes(t), o = N.getPublicKey(t, !0);
  return {
    blinded: e.map((a, u) => {
      let l = wt(a), c = Yo(l, s, u + r), d = l.add(N.Point.BASE.multiply(c));
      if (d.equals(N.Point.ZERO)) throw new h("Blinded key at infinity");
      return d.toHex(!0);
    }),
    Ehex: Z(o)
  };
}
function ls(e, t, n, r = !0) {
  let i = +!r, s = Array.isArray(t) ? t : [t], o = Array.isArray(n) ? n : [n], a = /* @__PURE__ */ new Set(), u = N.Point.fromHex(e);
  for (let l of s) {
    let c = N.Point.Fn.fromBytes(F(l)), d = N.getPublicKey(F(l), !0);
    o.forEach((f, p) => {
      let g = rh(l, Yo(u, c, p + i), F(f), d);
      g && a.add(g);
    });
  }
  return Array.from(a);
}
function rh(e, t, n, r) {
  let i = N.Point.CURVE().n, s = typeof e == "string" ? rn(e) : e, o = typeof t == "string" ? rn(t) : t;
  if (s <= 0n || s >= i) throw new h("Invalid private key");
  if (o <= 0n || o >= i) throw new h("Invalid scalar r");
  if (r = r ?? N.Point.BASE.multiply(s).toBytes(!0), r.length !== 33) throw new h("naturalPub must be 33 bytes");
  let a = (s + o) % i, u = (i - s + o) % i;
  if (!n) {
    if (a === 0n) throw new h("Derived secret key is zero");
    return Cr(a);
  }
  if (n.length !== 33) throw new h("blindPubkey must be 33 bytes");
  let l = N.Point.fromHex(Z(n)), c = N.Point.BASE.multiply(o), d = l.subtract(c);
  if (d.equals(N.Point.ZERO) || !Hs(d.toBytes(!0).slice(1), r.slice(1))) return null;
  let f = (d.toBytes(!0)[0] & 1) == (r[0] & 1) ? a : u;
  if (f === 0n) throw new h("Derived secret key is zero");
  return Cr(f);
}
function Yo(e, t, n) {
  if (!Number.isInteger(n) || n < 0 || n > 255) throw new h("P2BK: slot index must be an integer in [0, 255]");
  let r = e.multiply(t).toBytes(!0).slice(1), i = new Uint8Array([n & 255]), s = xt(at(mt(Tr, r, i)));
  if ((s === 0n || s >= N.Point.CURVE().n) && (s = xt(at(mt(Tr, r, i, new Uint8Array([255])))), s === 0n || s >= N.Point.CURVE().n)) throw new h("P2BK: tweak derivation failed");
  return s;
}
var ih = {
  SIG_INPUTS: "SIG_INPUTS",
  SIG_ALL: "SIG_ALL"
}, sh = new Set(Object.values(ih)), oh = /* @__PURE__ */ new Set([
  "locktime",
  "pubkeys",
  "n_sigs",
  "refund",
  "n_sigs_refund",
  "sigflag"
]);
function Jo(e) {
  return oh.has(e);
}
function xf(e, t) {
  let n = Wo("P2PK", e, t);
  return Tt(n), n;
}
function Tt(e) {
  if (typeof e == "string" && e.length > 1024) throw new h(`Secret too long (${e.length} characters), maximum is ${Lo}`);
  let t = Go(["P2PK", "HTLC"], e);
  lh(di(t));
  let n = dn(t, "sigflag");
  return n !== void 0 && sa(n), t;
}
function fi(e) {
  let t = e.toLowerCase();
  if (t.length === 66 && (t.startsWith("02") || t.startsWith("03"))) return t;
  if (t.length === 64) return `02${t}`;
  throw new h(`Invalid pubkey, expected 33 byte compressed or 32 byte x only, got length ${t.length}`);
}
function Ee(e) {
  let t = /* @__PURE__ */ new Set(), n = [];
  for (let r of e) {
    let i = fi(r), s = i.slice(-64);
    t.has(s) || (t.add(s), n.push(i));
  }
  return n;
}
function Pn(e) {
  let t = Ee(Array.isArray(e.pubkey) ? e.pubkey : [e.pubkey]), n = Ee(e.refundKeys ?? []), r = typeof e.hashlock == "string" && e.hashlock.length > 0;
  if (t.length === 0 && !r) throw new h("P2PK requires at least one pubkey");
  let i = +!!r + t.length + n.length;
  if (i > 11) throw new h(`Too many pubkeys, ${i} slots provided, maximum allowed is 11 in total`);
  e.sigFlag !== void 0 && sa(e.sigFlag);
  let s = t.length > 0 ? e.requiredSignatures ?? 1 : e.requiredSignatures, o = e.requiredRefundSignatures;
  return gi({
    mainKeyCount: t.length,
    refundKeyCount: n.length,
    nSigs: s,
    nSigsRefund: o,
    hasLocktime: e.locktime !== void 0
  }), {
    pubkey: t.length === 1 ? t[0] : t,
    ...e.locktime === void 0 ? {} : { locktime: e.locktime },
    ...n.length > 0 ? { refundKeys: n } : {},
    ...s !== void 0 && s > 1 ? { requiredSignatures: s } : {},
    ...o !== void 0 && o > 1 ? { requiredRefundSignatures: o } : {},
    ...e.additionalTags?.length ? { additionalTags: e.additionalTags } : {},
    ...e.blindKeys ? { blindKeys: !0 } : {},
    ...e.sigFlag === void 0 ? {} : { sigFlag: e.sigFlag },
    ...e.hashlock ? { hashlock: e.hashlock } : {}
  };
}
function Xo(e) {
  let t = Tt(e), n = oa($n(t)), r = Vn(t), i = Yn(t);
  return n === "ACTIVE" || n === "PERMANENT" ? r : n === "EXPIRED" && i.length ? Array.from(/* @__PURE__ */ new Set([...r, ...i])) : [];
}
function ah(e, t, n = Math.floor(Date.now() / 1e3)) {
  let r = Tt(e.secret), i = Vn(r), s = Yn(r), o = $n(r);
  gi({
    mainKeyCount: i.length,
    refundKeyCount: s.length,
    nSigs: Lt(r, "n_sigs"),
    nSigsRefund: Lt(r, "n_sigs_refund"),
    hasLocktime: Number.isFinite(o)
  });
  let a = e.p2pk_e === void 0 ? t : na(t, e), u = new Set(a.map((d) => Z(jo(F(d))).slice(2))), l = (d) => d.filter((f) => u.has(f.slice(2))).length, c = (d, f) => f.length ? Math.max(Lt(r, d) ?? 1, 1) : 0;
  return Gn(r) !== "HTLC" && l(i) >= c("n_sigs", i) ? !0 : Number.isFinite(o) && n > o && l(s) >= c("n_sigs_refund", s);
}
function Cn(e) {
  return dn(Tt(e), "sigflag") ?? "SIG_INPUTS";
}
function pi(e) {
  let t = Zn(e)?.signatures ?? [];
  if (t.length > 64) throw new h(`Too many witness signatures: ${t.length}`);
  return t;
}
function Zn(e) {
  if (!e) return;
  if (typeof e == "string" && e.length > 16384) throw new h(`Witness too long (${e.length} characters), maximum is ${ec}`);
  let t;
  try {
    t = typeof e == "string" ? JSON.parse(e) : e;
  } catch {
    return;
  }
  if (!t || typeof t != "object") return;
  let n = { signatures: Array.isArray(t.signatures) ? t.signatures : [] };
  return typeof t.preimage == "string" && t.preimage.length > 0 && (n.preimage = t.preimage), n;
}
function cs(e, t, n = ut, r) {
  let i = (o) => typeof o == "string" ? o : Z(o), s = Array.isArray(t) ? t.map(i) : i(t);
  return e.map((o, a) => {
    let u = na(s, o), l = o;
    for (let c of u) try {
      l = uh(l, c, r);
    } catch (d) {
      let f = d instanceof Error ? d.message : "Unknown error";
      n.warn(`Proof #${a + 1}: ${f}`);
    }
    return l;
  });
}
function ta(e, t) {
  let n = typeof t == "string" ? F(t) : t, r = Z(ei.getPublicKey(n));
  if (!Xo(e).some((i) => i.slice(2) === r)) throw new h(`Signature not required from [02|03]${r}`);
  return r;
}
function uh(e, t, n) {
  let r = Tt(e.secret), i = Cn(r) === "SIG_ALL";
  if (i && n === void 0) throw new h("Cannot sign a SIG_ALL proof without the message to sign");
  if (!i && n !== void 0) throw new h("A message override is only valid for SIG_ALL proofs");
  n = n ?? e.secret;
  let s = ta(r, t), o = pi(e.witness);
  if (o.some((c) => hi(c, n, s))) throw new h(`Proof already signed by [02|03]${s}`);
  if (o.length >= 64) throw new h("Cannot sign: witness already at the 64-signature limit");
  let a = Xc(n, t), u = Zn(e.witness), l = {
    ...u && u.preimage !== void 0 ? { preimage: u.preimage } : {},
    signatures: [...u?.signatures ?? [], a]
  };
  return {
    ...e,
    witness: l
  };
}
function If(e, t, n) {
  if (!t.witness) return !1;
  if (!Rn([t])) n = t.secret;
  else if (!n) throw new h("Cannot verify a SIG_ALL proof without the message to sign");
  return pi(t.witness).some((r) => hi(r, n, e));
}
function ea(e, t = ut, n) {
  if (!Rn([e])) n = e.secret;
  else if (!n) throw t.error("Cannot verify a SIG_ALL proof without the message to sign"), new h("Cannot verify a SIG_ALL proof without the message to sign");
  let r = Tt(e.secret), i = Vn(r), s = Yn(r);
  gi({
    mainKeyCount: i.length,
    refundKeyCount: s.length,
    nSigs: Lt(r, "n_sigs"),
    nSigsRefund: Lt(r, "n_sigs_refund"),
    hasLocktime: Number.isFinite($n(r))
  });
  let o = pi(e.witness), a = $n(r), u = oa(a), l = i.length === 0 ? 0 : ch(r, u, s), c = hh(r, u, s), d = Mr(o, n, i), f = s.length ? Mr(o, n, s) : [], p = {
    locktime: a,
    lockState: u,
    main: {
      pubkeys: i,
      requiredSigners: l,
      receivedSigners: d
    },
    refund: {
      pubkeys: s,
      requiredSigners: c,
      receivedSigners: f
    }
  };
  if (i.length && l > 0 && d.length >= l) {
    let m = {
      ...p,
      success: !0,
      path: "MAIN"
    };
    return t.debug("Spending condition satisfied via main pubkeys", { result: m }), m;
  }
  if (u !== "EXPIRED") {
    let m = {
      ...p,
      success: !1,
      path: "FAILED"
    };
    return t.debug("P2PK lock enabled, but threshold not met by main pubkeys", { result: m }), m;
  }
  if (t.debug("P2PK lock expired. Checking refund path.", { lockState: u }), s.length) {
    if (c > 0 && f.length >= c) {
      let w = {
        ...p,
        success: !0,
        path: "REFUND"
      };
      return t.debug("Spending condition satisfied via refund pubkeys", { result: w }), w;
    }
    let m = {
      ...p,
      success: !1,
      path: "FAILED"
    };
    return t.debug("Spending threshold not met by either pathway", { result: m }), m;
  }
  let g = {
    ...p,
    success: !0,
    path: "UNLOCKED"
  };
  return t.debug("No refund pubkeys, anyone can spend.", { result: g }), g;
}
function Af(e, t = ut, n) {
  return ea(e, t, n).success;
}
function na(e, t) {
  let n = Array.isArray(e) ? e : [e], r = t?.p2pk_e;
  if (!r) return Array.from(new Set(n));
  let i = Tt(t.secret), s = [...Vn(i), ...Yn(i)], o = Gn(i) === "P2PK", a = ls(r, n, s, o);
  return !o && !a.length ? ls(r, n, s) : a;
}
function ra(e) {
  if (e.length === 0) throw new h("No proofs");
  let t = Tt(e[0].secret);
  if (Cn(t) !== "SIG_ALL") throw new h("First proof is not SIG_ALL");
  let n = t[1].data, r = JSON.stringify(t[1].tags ?? []);
  for (let i = 1; i < e.length; i++) {
    let s = Tt(e[i].secret);
    if (s[0] !== t[0]) throw new h(`Proof #${i + 1} is not ${t[0]}`);
    if (Cn(s) !== "SIG_ALL") throw new h(`Proof #${i + 1} is not SIG_ALL`);
    if (s[1].data !== n) throw new h("SIG_ALL inputs must share identical Secret.data");
    if (JSON.stringify(s[1].tags ?? []) !== r) throw new h("SIG_ALL inputs must share identical Secret.tags");
  }
}
function ia(e, t, n) {
  let r = [];
  for (let i of e) r.push(i.secret, i.C);
  for (let i of t) r.push(String(i.blindedMessage.amount), i.blindedMessage.B_);
  return n && r.push(n), r.join("");
}
function Rn(e) {
  return e.some((t) => {
    try {
      return Cn(t.secret) === "SIG_ALL";
    } catch {
      return !1;
    }
  });
}
function lh(e) {
  let t = /* @__PURE__ */ new Set();
  for (let n of e) {
    let r = n[0];
    if (Jo(r)) {
      if (t.has(r)) throw new h(`Duplicate P2PK tag "${r}"`);
      t.add(r);
    }
  }
}
function sa(e) {
  if (!sh.has(e)) throw new h(`Invalid sigflag "${e}": must be "SIG_INPUTS" or "SIG_ALL"`);
}
function hs(e, t) {
  if (!Number.isInteger(e) || e < 1) throw new h(`${t} must be a positive integer, got ${e}`);
  return e;
}
function gi(e) {
  let { mainKeyCount: t, refundKeyCount: n, nSigs: r, nSigsRefund: i, hasLocktime: s } = e;
  if (r !== void 0 && (hs(r, "requiredSignatures (n_sigs)"), r > t)) throw new h(`requiredSignatures (n_sigs) (${r}) exceeds available pubkeys (${t})`);
  if (i !== void 0) {
    if (hs(i, "requiredRefundSignatures (n_sigs_refund)"), n === 0) throw new h("requiredRefundSignatures (n_sigs_refund) requires refund keys");
    if (i > n) throw new h(`requiredRefundSignatures (n_sigs_refund) (${i}) exceeds available refund keys (${n})`);
  }
  if (n > 0 && !s) throw new h("refund keys require a locktime");
}
function Vn(e) {
  let t = nn(e, "pubkeys") ?? [];
  if (t.length > 16) throw new h(`Too many pubkeys: ${t.length}`);
  let n = (Gn(e) === "P2PK" ? [Vo(e), ...t] : t).map((r) => fi(r));
  if (Ee(n).length !== n.length) throw new h("Duplicate main pubkeys are not allowed");
  return n;
}
function Yn(e) {
  let t = nn(e, "refund") ?? [];
  if (t.length > 16) throw new h(`Too many refund pubkeys: ${t.length}`);
  let n = t.map((r) => fi(r));
  if (Ee(n).length !== n.length) throw new h("Duplicate refund pubkeys are not allowed");
  return n;
}
function $n(e) {
  let t = dn(e, "locktime"), n = t !== void 0 && /^\d+$/.test(t) ? Number(t) : NaN;
  return Number.isSafeInteger(n) ? n : 1 / 0;
}
function oa(e, t = Math.floor(Date.now() / 1e3)) {
  return Number.isFinite(e) ? t <= e ? "ACTIVE" : "EXPIRED" : "PERMANENT";
}
function ch(e, t, n) {
  return !n.length && t === "EXPIRED" ? 0 : Math.max(Lt(e, "n_sigs") ?? 1, 1);
}
function hh(e, t, n) {
  return n.length && t === "EXPIRED" ? Math.max(Lt(e, "n_sigs_refund") ?? 1, 1) : 0;
}
var dh = St("Cashu_DLEQ_R_v1");
function fh(e, t, n, r) {
  let i = mt(dh, t.toBytes(!1), n.toBytes(!1), r.toBytes(!1));
  for (let s = 0; s < 256; s++) {
    let o = xt(Ie(at, e, mt(i, new Uint8Array([s]))));
    if (o > 0n && o < N.Point.CURVE().n) return o;
  }
  throw new h("DLEQ nonce derivation failed");
}
var aa = (e, t, n, r) => {
  let i = N.Point.Fn.fromBytes(e.s), s = N.Point.Fn.fromBytes(e.e), o = N.Point.BASE.multiply(i), a = r.multiply(s), u = t.multiply(i), l = n.multiply(s);
  return Hs(Fo([
    o.subtract(a),
    u.subtract(l),
    r,
    n
  ]), e.e);
}, ua = (e, t, n, r) => {
  if (t.r === void 0) throw new h("verifyDLEQProof_reblind: Undefined blinding factor");
  let i = cn(e), s = n.add(r.multiply(t.r)), o = N.Point.BASE.multiply(t.r);
  return aa(t, i.add(o), s, r);
}, Ef = (e, t) => {
  e = zo(e);
  let n = N.Point.Fn.fromBytes(t), r = N.Point.BASE.multiply(n), i = e.multiply(n), s = fh(t, r, e, i), o = Fo([
    N.Point.BASE.multiply(s),
    e.multiply(s),
    r,
    i
  ]), a = N.Point.Fn.fromBytes(o);
  return {
    s: Ft(N.Point.Fn.add(s, N.Point.Fn.mul(a, n)), 32),
    e: o
  };
}, ph = "m/129372'/0'", ds = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141"), _e = /* @__PURE__ */ (function(e) {
  return e[e.SECRET = 0] = "SECRET", e[e.BLINDING_FACTOR = 1] = "BLINDING_FACTOR", e;
})(_e || {}), Se = /* @__PURE__ */ (function(e) {
  return e[e.DEPRECATED_BIP32 = 0] = "DEPRECATED_BIP32", e[e.HMAC_SHA256 = 1] = "HMAC_SHA256", e;
})(Se || {}), Mf = (e, t, n) => mi(e, t, n).secret, Tf = (e, t, n) => mi(e, t, n).blindingFactor;
function mi(e, t, n) {
  return la(e, t)(n);
}
function la(e, t) {
  switch (mh(e), gh(t)) {
    case Se.DEPRECATED_BIP32: {
      let n = Vc(t), r = Yt.fromMasterSeed(e).derive(`${ph}/${n}'`);
      return (i) => yh(r, i);
    }
    case Se.HMAC_SHA256:
      return (n) => wh(e, t, n);
  }
}
function gh(e) {
  if (e.length === 12 && en(e)) return Se.DEPRECATED_BIP32;
  let t = /^[a-fA-F0-9]+$/.test(e), n = e.startsWith("01");
  if (t && n && e.length % 2 != 0) throw new h("Invalid hex string: odd length.");
  if (!t && en(e) || t && e.startsWith("00")) return Se.DEPRECATED_BIP32;
  if (t && n) return Se.HMAC_SHA256;
  throw new h(`Unrecognized keyset ID version ${e.slice(0, 2)}`);
}
function mh(e) {
  if (!(e instanceof Uint8Array) || e.length < 16 || e.length > 64) throw new h("seed must be a 16 to 64 byte Uint8Array");
}
function yh(e, t) {
  if (!Number.isInteger(t) || t < 0 || t >= 2147483648) throw new h("Counter must be an integer in the range 0 <= counter < 2^31");
  let n = e.deriveChild(ze + t), r = n.deriveChild(0).privateKey, i = n.deriveChild(1).privateKey;
  if (r === null || i === null) throw new h("Could not derive private key");
  return {
    secret: r,
    blindingFactor: i
  };
}
function wh(e, t, n) {
  if (!Number.isSafeInteger(n) || n < 0) throw new h("Counter must be an integer in the range 0 <= counter <= 2^53 - 1");
  return {
    secret: fs(e, t, n, _e.SECRET),
    blindingFactor: fs(e, t, n, _e.BLINDING_FACTOR)
  };
}
function fs(e, t, n, r) {
  let i = mt(St("Cashu_KDF_HMAC_SHA256"), F(t), Ft(n, 8));
  switch (r) {
    case _e.SECRET:
      i = mt(i, F("00"));
      break;
    case _e.BLINDING_FACTOR:
      i = mt(i, F("01"));
  }
  let s = Ie(at, e, i);
  if (r === _e.BLINDING_FACTOR) {
    let o = xt(s), a = o >= ds ? o - ds : o;
    if (a === 0n) throw new h("Derived invalid blinding scalar r == 0");
    return Ft(a, 32);
  }
  return s;
}
function Bf(e, t) {
  if (!/^[0-9a-f]{64}$/i.test(e)) throw new h("Hashlock must be a 64-character hex string (32 bytes).");
  return Wo("HTLC", e.toLowerCase(), t);
}
function qf(e) {
  return Go("HTLC", Tt(e));
}
function bh(e) {
  let t = e !== void 0;
  if (t && !/^[0-9a-f]{64}$/i.test(e)) throw new h("Preimage must be a 64 character hexadecimal string (32 bytes).");
  let n = t ? F(e) : zt(32);
  return {
    hash: Z(at(n)),
    preimage: Z(n)
  };
}
function vh(e, t) {
  try {
    return bh(e).hash === t.toLowerCase();
  } catch {
    return !1;
  }
}
function kh(e, t = ut, n) {
  let r, i = Tt(e.secret), s = Gn(i) === "HTLC", o = s ? Vo(i) : "", a = ea(e, t, n);
  if (!s) return a;
  let u = a.main.pubkeys.length === 0;
  if (!u && a.path !== "MAIN" || u && a.success) return a;
  let l = _h(e.witness);
  if (l && vh(l, o)) return r = {
    ...a,
    success: !0,
    path: "MAIN"
  }, t.debug("Spending condition satisfied via hashlock (receiver) pathway", { result: r }), r;
  let { refund: c } = a;
  return c.requiredSigners > 0 && c.receivedSigners.length >= c.requiredSigners ? (r = {
    ...a,
    success: !0,
    path: "REFUND"
  }, t.debug("Spending condition satisfied via refund pubkeys", { result: r }), r) : l ? (r = {
    ...a,
    success: !1,
    path: "FAILED"
  }, t.debug("Hashlock spend failed, wrong preimage for hash", { result: r }), r) : (r = {
    ...a,
    success: !1,
    path: "FAILED"
  }, t.debug("Hashlock spend failed, no preimage found", { result: r }), r);
}
function Of(e, t = ut, n) {
  return kh(e, t, n).success;
}
function _h(e) {
  return Zn(e)?.preimage;
}
var Sh = St("Cashu_MintQuoteSig_v1");
function xh(e) {
  let t = k.from(e.amount).toBigInt();
  if (t === 0n) return new Uint8Array();
  let n = t.toString(16);
  return F(n.length % 2 == 1 ? "0" + n : n);
}
function Ih(e, t) {
  let n = at.create();
  n.update(Sh);
  let r = St(e);
  n.update(Ft(r.length, 4)), n.update(r);
  for (let i of t) {
    let s = xh(i);
    n.update(Ft(s.length, 4)), n.update(s);
    let o = F(i.B_);
    n.update(Ft(o.length, 4)), n.update(o);
  }
  return n.digest();
}
function ca(e, t) {
  let n = e;
  for (let r of t) n += r.B_;
  return at(St(n));
}
function Ah(e) {
  return typeof e == "string" && e.length === 66;
}
function ps(e, t, n) {
  return hn(ca(t, n), e);
}
function Pf(e, t, n, r) {
  if (!Ah(e)) return !1;
  try {
    return Qo(r, ca(t, n), e);
  } catch {
    return !1;
  }
}
function gs(e, t, n) {
  return hn(Ih(t, n), e);
}
var Br = /* @__PURE__ */ (function(e) {
  return e.POST = "post", e.NOSTR = "nostr", e;
})({}), ha = 1, da = 2, qr = 3, fa = 4, pa = 5, ga = 6, ma = 7, ya = 8, wa = 9, ba = 10, va = 1, ka = 2, _a = 1, Sa = 2, xa = 3, yi = 0, Ia = 1, Aa = 1, Ea = 2, Ma = 3, Ta = 0, Ba = 1;
function Eh(e) {
  let t = Jn(e), n = {};
  for (let r of t) switch (r.tag) {
    case ha:
      if (n.id !== void 0) throw new h("invalid pr: multiple id fields");
      n.id = te(r.value);
      break;
    case da:
      if (n.amount !== void 0) throw new h("invalid pr: multiple amount fields");
      n.amount = qa(r.value);
      break;
    case qr:
      if (n.unit !== void 0) throw new h("invalid pr: multiple unit fields");
      r.value.length === 1 && r.value[0] === 0 ? n.unit = "sat" : n.unit = te(r.value);
      break;
    case fa:
      if (n.singleUse !== void 0) throw new h("invalid pr: multiple single_use fields");
      n.singleUse = Ln(r.value) === 1;
      break;
    case pa:
      n.mints || (n.mints = []), n.mints.push(te(r.value));
      break;
    case ga:
      if (n.description !== void 0) throw new h("invalid pr: multiple description fields");
      n.description = te(r.value);
      break;
    case ma:
      n.transports || (n.transports = []), n.transports.push(qh(r.value));
      break;
    case ya:
      if (n.nut10) throw new h("invalid pr: multiple nut10 spending conditions");
      n.nut10 = Ph(r.value);
      break;
    case wa:
      if (n.mintsPreferred !== void 0) throw new h("invalid pr: multiple mint_preferred fields");
      n.mintsPreferred = Ln(r.value) === 1;
      break;
    case ba:
      n.supportedMethods || (n.supportedMethods = []), n.supportedMethods.push(Oh(r.value));
      break;
  }
  return n;
}
function Jn(e) {
  let t = [], n = 0;
  for (; n < e.length; ) {
    let r = Mh(e.subarray(n));
    t.push(r), n += 3 + r.length;
  }
  return t;
}
function Mh(e) {
  if (e.length < 3) throw new h("TLV data too short: need at least 3 bytes for tag and length");
  let t = new DataView(e.buffer, e.byteOffset, e.byteLength), n = t.getUint8(0), r = t.getUint16(1, !1);
  if (e.length < 3 + r) throw new h(`TLV data too short: expected ${3 + r} bytes, got ${e.length}`);
  return {
    tag: n,
    length: r,
    value: e.subarray(3, 3 + r)
  };
}
function te(e) {
  return tn(e);
}
function qa(e) {
  if (e.length !== 8) throw new h(`Invalid u64: expected 8 bytes, got ${e.length}`);
  return new DataView(e.buffer, e.byteOffset, e.byteLength).getBigUint64(0, !1);
}
function Ln(e) {
  if (e.length !== 1) throw new h(`Invalid u8: expected 1 byte, got ${e.length}`);
  return e[0];
}
function Th(e) {
  switch (e) {
    case yi:
      return "nostr";
    case Ia:
      return "post";
    default:
      throw new h(`Unsupported transport kind: ${e}`);
  }
}
function Bh(e) {
  switch (e) {
    case Ta:
      return "P2PK";
    case Ba:
      return "HTLC";
    default:
      throw new h(`Unsupported NUT-10 kind: ${e}`);
  }
}
function qh(e) {
  let t = Jn(e), n, r, i;
  for (let a of t) switch (a.tag) {
    case _a:
      if (n !== void 0) throw new h("invalid pr: multiple transport kind fields");
      n = Ln(a.value);
      break;
    case Sa:
      if (r !== void 0) throw new h("invalid pr: multiple transport target fields");
      r = a.value;
      break;
    case xa:
      i || (i = []), i.push(Oa(a.value));
      break;
  }
  if (n === void 0) throw new h("Transport missing required kind field");
  if (r === void 0) throw new h("Transport missing required target field");
  let s;
  if (n === yi) {
    let a = i?.filter((u) => u[0] === "r").flatMap((u) => u.slice(1)) ?? [];
    s = Dh(r, a), i = i?.filter((u) => u[0] !== "r");
  } else s = te(r);
  let o = i && i.length > 0 ? i : void 0;
  return {
    type: Th(n),
    target: s,
    tags: o
  };
}
function Oh(e) {
  let t = Jn(e), n, r;
  for (let i of t) switch (i.tag) {
    case va:
      if (n !== void 0) throw new h("invalid pr: multiple supported_method method fields");
      n = te(i.value);
      break;
    case ka:
      if (r !== void 0) throw new h("invalid pr: multiple supported_method fee fields");
      r = qa(i.value);
      break;
  }
  if (n === void 0) throw new h("supported_method missing required method field");
  return r === void 0 ? { method: n } : {
    method: n,
    fee: r
  };
}
function Ph(e) {
  let t = Jn(e), n, r, i;
  for (let o of t) switch (o.tag) {
    case Aa:
      if (n !== void 0) throw new h("invalid pr: multiple nut10 kind fields");
      n = Ln(o.value);
      break;
    case Ea:
      if (r !== void 0) throw new h("invalid pr: multiple nut10 data fields");
      r = te(o.value);
      break;
    case Ma:
      i || (i = []), i.push(Oa(o.value));
      break;
  }
  if (n === void 0) throw new h("NUT-10 spending condition missing required kind field");
  if (r === void 0) throw new h("NUT-10 spending condition missing required data field");
  let s = i && i.length > 0 ? i : void 0;
  return {
    kind: Bh(n),
    data: r,
    tags: s
  };
}
function Oa(e) {
  let t = [], n = 0;
  for (; n < e.length; ) {
    let r = e[n];
    if (n += 1, e.length - n < r) throw new h(`Tag tuple data too short: expected ${r} bytes, got ${e.length - n}`);
    let i = te(e.subarray(n, n + r));
    t.push(i), n += r;
  }
  return t;
}
function Ch(e) {
  let t = [];
  if (e.id && t.push(lt(ha, ie(e.id))), e.amount !== void 0 && t.push(lt(da, Pa(e.amount))), e.unit) if (e.unit === "sat") t.push(lt(qr, new Uint8Array([0])));
  else {
    let s = ie(e.unit);
    if (s.length === 1 && s[0] === 0) throw new h("invalid pr: unit encoding is reserved for sat");
    t.push(lt(qr, s));
  }
  if (e.singleUse !== void 0 && t.push(lt(fa, Kn(+!!e.singleUse))), e.mints && e.mints.length > 0) for (let s of e.mints) t.push(lt(pa, ie(s)));
  if (e.description && t.push(lt(ga, ie(e.description))), e.transports && e.transports.length > 0) for (let s of e.transports) t.push(lt(ma, Lh(s)));
  if (e.nut10 && t.push(lt(ya, Nh(e.nut10))), e.mintsPreferred !== void 0 && t.push(lt(wa, Kn(+!!e.mintsPreferred))), e.supportedMethods && e.supportedMethods.length > 0) for (let s of e.supportedMethods) t.push(lt(ba, Kh(s)));
  let n = t.reduce((s, o) => s + o.length, 0), r = new Uint8Array(n), i = 0;
  for (let s of t) r.set(s, i), i += s.length;
  return r;
}
function lt(e, t) {
  let n = t.length;
  if (n > 65535) throw new h(`TLV value too long: ${n} bytes (max 65535)`);
  let r = new Uint8Array(3 + n);
  return r[0] = e, r[1] = n >> 8 & 255, r[2] = n & 255, r.set(t, 3), r;
}
function ie(e) {
  if (Hn(e)) throw new h("TLV text must be well-formed UTF-16");
  return new TextEncoder().encode(e);
}
function Pa(e) {
  let t = /* @__PURE__ */ new ArrayBuffer(8);
  return new DataView(t).setBigUint64(0, e, !1), new Uint8Array(t);
}
function Kn(e) {
  return new Uint8Array([e]);
}
function Rh(e) {
  switch (e) {
    case Br.NOSTR:
      return yi;
    case Br.POST:
      return Ia;
    default:
      throw new h(`Unsupported transport type: ${e}`);
  }
}
function $h(e) {
  switch (e) {
    case "P2PK":
      return Ta;
    case "HTLC":
      return Ba;
    default:
      throw new h(`Unsupported NUT-10 type: ${e}`);
  }
}
function Lh(e) {
  let t = [], n = Rh(e.type);
  t.push(lt(_a, Kn(n)));
  let r, i = [];
  if (e.type === Br.NOSTR) {
    let { pubkey: l, relays: c } = Uh(e.target);
    r = l, i = c.map((d) => ["r", d]);
  } else r = ie(e.target);
  t.push(lt(Sa, r));
  let s = [...i, ...e.tags || []];
  if (s.length > 0) for (let l of s) t.push(lt(xa, Ca(l)));
  let o = t.reduce((l, c) => l + c.length, 0), a = new Uint8Array(o), u = 0;
  for (let l of t) a.set(l, u), u += l.length;
  return a;
}
function Kh(e) {
  let t = [];
  t.push(lt(va, ie(e.method))), e.fee !== void 0 && t.push(lt(ka, Pa(e.fee)));
  let n = t.reduce((s, o) => s + o.length, 0), r = new Uint8Array(n), i = 0;
  for (let s of t) r.set(s, i), i += s.length;
  return r;
}
function Nh(e) {
  let t = [], n = $h(e.kind);
  if (t.push(lt(Aa, Kn(n))), t.push(lt(Ea, ie(e.data))), e.tags && e.tags.length > 0) for (let o of e.tags) t.push(lt(Ma, Ca(o)));
  let r = t.reduce((o, a) => o + a.length, 0), i = new Uint8Array(r), s = 0;
  for (let o of t) i.set(o, s), s += o.length;
  return i;
}
function Ca(e) {
  let t = new TextEncoder(), n = [];
  for (let o of e) {
    let a = t.encode(o);
    if (a.length > 255) throw new h(`Tag tuple string too long: ${o} (max 255 bytes)`);
    let u = new Uint8Array(1 + a.length);
    u[0] = a.length, u.set(a, 1), n.push(u);
  }
  let r = n.reduce((o, a) => o + a.length, 0), i = new Uint8Array(r), s = 0;
  for (let o of n) i.set(o, s), s += o.length;
  return i;
}
function Uh(e) {
  let t = xe.decode(e, 1024);
  if (t.prefix !== "nprofile") throw new h(`Invalid nprofile: expected prefix 'nprofile', got '${t.prefix}'`);
  let n = xe.fromWords(t.words), r = new Uint8Array(n), i, s = [], o = 0;
  for (; o < r.length; ) {
    if (o + 2 > r.length) throw new h("Nprofile TLV data too short");
    let a = r[o], u = r[o + 1];
    if (o += 2, o + u > r.length) throw new h(`Nprofile TLV value too short: expected ${u} bytes`);
    let l = r.subarray(o, o + u);
    if (o += u, a === 0) {
      if (i !== void 0) throw new h("Nprofile contains multiple pubkeys");
      if (l.length !== 32) throw new h(`Invalid pubkey length: expected 32 bytes, got ${l.length}`);
      i = l;
    } else a === 1 && s.push(tn(l));
  }
  if (!i) throw new h("Nprofile missing required pubkey");
  return {
    pubkey: i,
    relays: s
  };
}
function Dh(e, t) {
  let n = Fh(e, t), r = xe.toWords(n);
  return xe.encode("nprofile", r, 1024);
}
function Fh(e, t) {
  if (e.length !== 32) throw new h(`Invalid pubkey: expected 32 bytes, got ${e.length}`);
  let n = new TextEncoder(), r = t.map((a) => n.encode(a));
  for (let a = 0; a < r.length; a++) if (r[a].length > 255) throw new h(`Relay URL too long: ${t[a]} (max 255 bytes)`);
  let i = 34 + r.reduce((a, u) => a + 2 + u.length, 0), s = new Uint8Array(i), o = 0;
  s[o++] = 0, s[o++] = 32, s.set(e, o), o += 32;
  for (let a of r) s[o++] = 1, s[o++] = a.length, s.set(a, o), o += a.length;
  return s;
}
function zh(e, t) {
  if (e != null) {
    if (e === !0 || e === 1) return !0;
    if (e === !1 || e === 0) return !1;
    throw new h(`invalid payment request: ${t} must be a boolean (or 0/1)`);
  }
}
function Qh(e) {
  if (e != null) {
    if (!Array.isArray(e)) throw new h("invalid payment request: sm must be a list");
    return e.map((t, n) => {
      if (typeof t != "object" || !t || typeof t.mn != "string") throw new h(`invalid payment request: malformed sm entry at index ${n}`);
      let { mn: r, mf: i } = t;
      return {
        method: r,
        fee: i ?? void 0
      };
    });
  }
}
var Hh = class Or {
  constructor(t, n, r, i, s, o, a = !1, u, l, c) {
    this.transport = t, this.id = n, this.unit = i, this.mints = s, this.description = o, this.singleUse = a, this.nut10 = u, this.mintsPreferred = l, this.amount = r === void 0 ? void 0 : k.from(r), this.mintsPreferred = zh(l, "mp"), this.supportedMethods = c?.map((d) => ({
      method: d.method,
      fee: d.fee === void 0 ? void 0 : k.from(d.fee)
    }));
  }
  assertUnitRule() {
    if (!this.unit && (this.amount !== void 0 || this.supportedMethods?.length)) throw new h("invalid payment request: unit (u) is required when an amount (a) or supported methods (sm) are set");
  }
  feesFor(t, n) {
    if (this.assertUnitRule(), !this.supportedMethods?.length || this.includesMint(t)) return k.zero();
    let r = this.supportedMethods.filter((i) => n?.includes(i.method)).map((i) => i.fee ?? k.zero());
    return r.length ? r.reduce((i, s) => k.min(i, s)) : k.zero();
  }
  amountToSend(t, n) {
    if (!this.amount) throw new h("cannot compute amount to send: request has no amount; use feesFor() and add the payer-chosen amount");
    return this.amount.add(this.feesFor(t, n));
  }
  get isMintListStrict() {
    if (this.mints?.length) return this.mintsPreferred !== !0;
  }
  includesMint(t) {
    let n = (i) => {
      try {
        return Xn(i);
      } catch {
        return i;
      }
    }, r = n(t);
    return this.mints?.some((i) => n(i) === r) ?? !1;
  }
  encodePayload(t, n, r) {
    if (this.isMintListStrict && !this.includesMint(t)) throw new h("mint is not in the request's strict mint list");
    let i = {
      ...this.id !== void 0 && { id: this.id },
      ...r?.memo !== void 0 && { memo: r.memo },
      unit: this.unit ?? r?.unit ?? "sat",
      mint: t,
      proofs: n
    };
    return Mt.stringify(i);
  }
  static decodePayload(t) {
    let n;
    try {
      n = Mt.parse(t, void 0, { strict: !0 });
    } catch (l) {
      throw new h("invalid payment payload: not valid JSON", { cause: l });
    }
    if (typeof n != "object" || !n || Array.isArray(n)) throw new h("invalid payment payload: expected a JSON object");
    let { id: r, memo: i, unit: s, mint: o, proofs: a } = n;
    if (typeof o != "string" || !o) throw new h("invalid payment payload: missing mint");
    if (typeof s != "string" || !s) throw new h("invalid payment payload: missing unit");
    if (r !== void 0 && typeof r != "string") throw new h("invalid payment payload: id must be a string");
    if (i !== void 0 && typeof i != "string") throw new h("invalid payment payload: memo must be a string");
    if (!Array.isArray(a) || a.length === 0) throw new h("invalid payment payload: missing proofs");
    let u = a.map((l, c) => {
      if (typeof l != "object" || !l || Array.isArray(l) || typeof l.id != "string" || typeof l.secret != "string" || typeof l.C != "string") throw new h(`invalid payment payload: malformed proof at index ${c}`);
      let d = l.amount;
      if (typeof d != "number" && typeof d != "bigint" && typeof d != "string") throw new h(`invalid payment payload: malformed proof amount at index ${c}`);
      let { dleq: f, ...p } = l;
      return {
        ...p,
        amount: k.from(d),
        ...f?.r && f.s && f.e && { dleq: f }
      };
    });
    return {
      ...r !== void 0 && { id: r },
      ...i !== void 0 && { memo: i },
      unit: s,
      mint: o,
      proofs: u
    };
  }
  toRawRequest() {
    let t = {};
    return this.transport && (t.t = this.transport.map((n) => ({
      t: n.type,
      a: n.target,
      g: n.tags
    }))), this.id && (t.i = this.id), this.amount && (t.a = this.amount.toBigInt()), this.unit && (t.u = this.unit), this.mints && (t.m = this.mints), this.description && (t.d = this.description), this.singleUse && (t.s = this.singleUse), this.nut10 && (t.nut10 = {
      k: this.nut10.kind,
      d: this.nut10.data,
      t: this.nut10.tags
    }), this.mintsPreferred !== void 0 && (t.mp = this.mintsPreferred), this.supportedMethods && this.supportedMethods.length > 0 && (t.sm = this.supportedMethods.map((n) => n.fee === void 0 ? { mn: n.method } : {
      mn: n.method,
      mf: n.fee.toBigInt()
    })), t;
  }
  toEncodedRequest() {
    return "creqA" + No(oi(this.toRawRequest()));
  }
  toEncodedCreqA() {
    return this.toEncodedRequest();
  }
  toEncodedCreqB() {
    return Mc("creqb", Ch({
      id: this.id,
      amount: this.amount === void 0 ? void 0 : this.amount.toBigInt(),
      unit: this.unit,
      singleUse: this.singleUse,
      mints: this.mints,
      description: this.description,
      transports: this.transport,
      nut10: this.nut10 ? {
        kind: this.nut10.kind,
        data: this.nut10.data,
        tags: this.nut10.tags
      } : void 0,
      mintsPreferred: this.mintsPreferred,
      supportedMethods: this.supportedMethods?.map((t) => ({
        method: t.method,
        fee: t.fee === void 0 ? void 0 : t.fee.toBigInt()
      }))
    })).toUpperCase();
  }
  getTransport(t) {
    return this.transport?.find((n) => n.type === t);
  }
  toP2PKOptions() {
    return Ra(this.nut10);
  }
  static fromRawRequest(t) {
    let n = t.t ? t.t.map((i) => ({
      type: i.t,
      target: i.a,
      tags: i.g
    })) : void 0, r = t.nut10 ? {
      kind: t.nut10.k,
      data: t.nut10.d,
      tags: t.nut10.t
    } : void 0;
    return new Or(n, t.i, t.a, t.u, t.m, t.d, t.s, r, t.mp, Qh(t.sm));
  }
  static fromEncodedRequest(t) {
    let n = t.toLowerCase();
    if (n.startsWith("creqb")) {
      let i = Eh(Bc(n)), s = i.nut10 ? {
        kind: i.nut10.kind,
        data: i.nut10.data,
        tags: i.nut10.tags ?? []
      } : void 0;
      return new Or(i.transports, i.id, i.amount, i.unit, i.mints, i.description, i.singleUse ?? !1, s, i.mintsPreferred, i.supportedMethods);
    }
    if (!t.startsWith("creq")) throw new h("unsupported pr: invalid prefix");
    if (t[4] !== "A") throw new h("unsupported pr version");
    let r = li(jn(t.slice(5)));
    return this.fromRawRequest(r);
  }
};
function Ra(e) {
  let t = e?.kind === "HTLC";
  if (!e || e.kind !== "P2PK" && !t) return;
  if (!e.data) throw new h(`NUT-10 ${e.kind} option is missing its data field`);
  let n = Tt([e.kind, {
    nonce: "",
    data: e.data,
    tags: e.tags ?? []
  }]), r = nn(n, "pubkeys") ?? [], i = [e.data, ...r], s = t ? {
    hashlock: e.data.toLowerCase(),
    pubkey: r
  } : { pubkey: i.length === 1 ? i[0] : i };
  s.locktime = Lt(n, "locktime"), s.refundKeys = nn(n, "refund"), s.requiredSignatures = Lt(n, "n_sigs"), s.requiredRefundSignatures = Lt(n, "n_sigs_refund"), dn(n, "sigflag") === "SIG_ALL" && (s.sigFlag = "SIG_ALL");
  let o = (e.tags ?? []).filter((a) => a.length > 0 && !Jo(a[0]));
  return o.length > 0 && (s.additionalTags = o), s;
}
function Et(e, t, n, r) {
  let i = Pr(e, "splitAmount.value", !0), s = n?.map((a) => Pr(a, "splitAmount.split", !0));
  if (s) {
    if (s.length > 8192) throw new h(`Cannot split amount: split would exceed ${bn} outputs`);
    let a = k.sum(s);
    if (i.isZero() && a.isZero()) return s;
    let u = s.filter((c) => !c.isZero()), l = k.sum(u);
    if (l.greaterThan(i)) throw new h(`Split is greater than total amount: ${l.toString()} > ${i.toString()}`);
    if (u.some((c) => !La(c, t))) throw new h("Provided amount preferences do not match the amounts of the mint keyset.");
    if (l.equals(i)) return u;
    s = u, i = i.subtract(l);
  } else s = [];
  let o = $a(t, "desc");
  if (o.length === 0) throw new h("Cannot split amount, keyset is inactive or contains no keys");
  for (let a of o) {
    if (a.isZero()) continue;
    let u = i.divideBy(a), l = bn - s.length;
    if (l <= 0 || u.greaterThan(l)) throw new h(`Cannot split amount: fill would exceed ${bn} outputs`);
    let c = u.toNumber();
    for (let d = 0; d < c; d++) s.push(a);
    if (i = i.subtract(a.multiplyBy(u)), i.isZero()) break;
  }
  if (!i.isZero()) throw new h(`Unable to split remaining amount: ${i.toString()}`);
  return r && (s = s.sort((a, u) => r === "desc" ? u.compareTo(a) : a.compareTo(u))), s;
}
function Cf(e, t = "desc") {
  return $a(e, t);
}
function $a(e, t) {
  let n = Object.keys(e).map((r) => k.from(r));
  return n.sort((r, i) => t === "desc" ? i.compareTo(r) : r.compareTo(i)), n;
}
function La(e, t) {
  let n = Pr(e, "hasCorrespondingKey.amount", !0).toString();
  return Object.prototype.hasOwnProperty.call(t, n);
}
function Pr(e, t, n = !1) {
  let r = k.from(e);
  if (!n && r.isZero()) throw new h(`Amount must be positive: ${r.toString()}, op: ${t}`);
  return r;
}
function rn(e) {
  return e ? BigInt(`0x${e}`) : 0n;
}
function Cr(e) {
  return e.toString(16).padStart(64, "0");
}
function Me(e) {
  return typeof e == "string" && e.length % 2 == 0 && /^[a-f0-9]+$/i.test(e);
}
function wi(e) {
  return e.some((t) => !Me(t.id) || On(t.id));
}
function Rf(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function jh(e) {
  return e.map((t) => {
    let n = { ...t };
    return n.id = n.id.slice(0, 16), n;
  });
}
function $f(e, t) {
  let n = _t(e.proofs);
  if (wi(n)) throw new h("Proofs contain a legacy keyset ID and cannot be encoded. Swap them at the mint first.");
  return Wh({
    ...e,
    proofs: n
  }, t?.removeDleq);
}
function Wh(e, t) {
  let n = e.proofs;
  if (t && (n = Jh(n)), wi(n)) throw new h("can not encode to v4 token if proofs contain non-hex keyset id");
  return n = jh(n), "cashuB" + Bn(oi(Ka({
    ...e,
    proofs: n
  })));
}
function Gh(e) {
  if (e.r == null) throw new h("Missing blinding factor in included DLEQ proof");
  return {
    e: F(e.e),
    s: F(e.s),
    r: F(e.r)
  };
}
function Ka(e) {
  let t = /* @__PURE__ */ Object.create(null), n = e.mint;
  for (let i = 0; i < e.proofs.length; i++) {
    let s = e.proofs[i];
    t[s.id] ? t[s.id].push(s) : t[s.id] = [s];
  }
  let r = {
    m: n,
    u: e.unit || "sat",
    t: Object.keys(t).map((i) => ({
      i: F(i),
      p: t[i].map((s) => ({
        a: s.amount.toBigInt(),
        s: s.secret,
        c: F(s.C),
        ...s.dleq && { d: Gh(s.dleq) },
        ...s.p2pk_e && { pe: F(s.p2pk_e) },
        ...s.witness && { w: typeof s.witness == "string" ? s.witness : JSON.stringify(s.witness) }
      }))
    }))
  };
  return e.memo && (r.d = e.memo), r;
}
function pe(e, t) {
  if (!(e instanceof Uint8Array) || e.length === 0) throw new h(`Invalid token: ${t} must be a non-empty byte string`);
  return Z(e);
}
function $e(e, t) {
  if (typeof e != "string" || e.length === 0) throw new h(`Invalid token: ${t} must be a non-empty string`);
  return e;
}
function Zh(e) {
  return e != null && e.e != null && e.s != null && e.r != null;
}
function Na(e) {
  if (!e || !Array.isArray(e.t)) throw new h("Invalid token");
  let t = $e(e.m, "mint"), n = e.u ? $e(e.u, "unit") : "sat", r = e.d ? $e(e.d, "memo") : void 0, i = [];
  return e.t.forEach((s) => {
    if (!s || !Array.isArray(s.p)) throw new h("Invalid token");
    s.p.forEach((o) => {
      let a = pe(s.i, "keyset id"), u = $e(o.s, "secret"), l = o.w ? $e(o.w, "witness") : void 0;
      i.push({
        secret: u,
        C: pe(o.c, "proof C"),
        amount: k.from(o.a),
        id: a,
        ...Zh(o.d) && { dleq: {
          r: pe(o.d.r, "dleq r"),
          s: pe(o.d.s, "dleq s"),
          e: pe(o.d.e, "dleq e")
        } },
        ...o.pe && { p2pk_e: pe(o.pe, "p2pk_e") },
        ...l && { witness: l }
      });
    });
  }), {
    mint: t,
    proofs: i,
    unit: n,
    ...r && { memo: r }
  };
}
function Vh(e, t) {
  if (!Array.isArray(t)) throw new h("getDecodedToken requires keysetIds (the wallet keyset id list) as its second argument; see the v4 migration guide, or use wallet.decodeToken()");
  let n = Ua(Qa(e));
  return n.proofs = za(n.proofs, t), n;
}
function Lf(e) {
  e = Qa(e);
  let t = Ua(e);
  return {
    unit: t.unit || "sat",
    mint: t.mint,
    amount: Ct(t.proofs),
    ...t.memo && { memo: t.memo },
    incompleteProofs: t.proofs.map((n) => {
      let { id: r, ...i } = n;
      return i;
    }),
    proofAmounts: t.proofs.map((n) => n.amount)
  };
}
function Ua(e) {
  let t = e.slice(0, 1), n = e.slice(1);
  if (t === "A") {
    let r = Ac(n);
    if (!r || !Array.isArray(r.token)) throw new h("Invalid token");
    if (r.token.length > 1) throw new h("Multi entry token are not supported");
    let i = r.token[0];
    if (!i || !Array.isArray(i.proofs)) throw new h("Invalid token");
    let s = i.proofs.map((a) => {
      let { dleq: u, ...l } = a;
      return {
        ...l,
        amount: k.from(a.amount),
        ...u?.r && u.s && u.e && { dleq: u }
      };
    }), o = {
      mint: i.mint,
      proofs: s,
      unit: r.unit || "sat"
    };
    return r.memo && (o.memo = r.memo), o;
  } else if (t === "B") return Na(li(jn(n)));
  throw new h("Token version is not supported");
}
var Yh = /^[a-z0-9_-]+$/, Kf = 1, Nn = (e) => `v${e + 1}`;
function me(e, t) {
  let n = Me(e) && !On(e) ? Number.parseInt(e.slice(0, 2), 16) : -1;
  nt(n > 1, `Keyset '${e}' is a ${Nn(n)} keyset; this build of cashu-ts supports up to ${Nn(1)}. Upgrade to use this keyset.`, t, {
    keysetId: e,
    versionByte: n,
    supported: 1
  });
}
function Da(e, t) {
  for (let o of Object.keys(e)) if (o.length > 20) throw new h("Invalid keyset denomination: exceeds 20 digits");
  let n = t?.unit ?? "sat", r = t?.expiry, i = t?.versionByte ?? 1, s = t?.input_fee_ppk;
  if (t?.isDeprecatedBase64 ?? !1) return xc(at(St(Object.entries(e).sort(([o], [a]) => k.from(o).compareTo(a)).map(([, o]) => o).reduce((o, a) => o + a, "")))).slice(0, 12);
  switch (i) {
    case 0:
      return "00" + Z(at(Fa(...Object.entries(e).sort(([o], [a]) => k.from(o).compareTo(a)).map(([, o]) => F(o))))).slice(0, 14);
    case 1: {
      if (!n) throw new h("Cannot compute keyset ID version 01: unit is required.");
      if (!Yh.test(n.toLowerCase())) throw new h(`Invalid keyset unit: ${n}`);
      let o = Object.entries(e).sort(([a], [u]) => k.from(a).compareTo(u)).map(([a, u]) => `${a}:${u}`).join(",");
      return o += `|unit:${n}`, s && (o += `|input_fee_ppk:${s}`), r && (o += `|final_expiry:${r}`), "01" + Z(at(St(o)));
    }
    default:
      throw new h(`Unrecognized keyset ID version: ${i}`);
  }
}
function Fa(...e) {
  let t = e.reduce((i, s) => i + s.length, 0), n = new Uint8Array(t), r = 0;
  for (let i of e) n.set(i, r), r += i.length;
  return n;
}
function Nf(e) {
  return [...e].sort((t, n) => t.id.localeCompare(n.id));
}
function Nt(e) {
  return typeof e == "object" && !!e;
}
function vt(e) {
  return Nt(e) && !Array.isArray(e);
}
function Qe(e, ...t) {
  for (let n of t) e[n] === void 0 && (e[n] = null);
}
function Rt(...e) {
  return e.map((t) => t.replace(/(^\/+|\/+$)/g, "")).join("/");
}
function Xn(e) {
  let t;
  try {
    t = new URL(e);
  } catch (n) {
    throw new h(`Invalid mint URL: ${e}`, { cause: n });
  }
  if (t.protocol !== "http:" && t.protocol !== "https:") throw new h(`Invalid mint URL scheme: ${t.protocol}`);
  if (t.username || t.password) throw new h("Mint URL must not contain credentials");
  if (t.search || t.href.includes("?")) throw new h("Mint URL must not contain query parameters");
  if (t.hash || t.href.includes("#")) throw new h("Mint URL must not contain a fragment");
  if (/%[0-9a-f]{2}/i.test(t.pathname)) throw new h("Mint URL path must not contain percent-encoded characters");
  return t.href.replace(/\/+$/, "");
}
function Ct(e) {
  return k.sum(e.map((t) => t.amount));
}
function _t(e) {
  return e.map((t) => ({
    ...t,
    amount: k.from(t.amount)
  }));
}
function Uf(e) {
  return (Array.isArray(e) ? e : [e]).map((t) => Mt.stringify(t));
}
function Df(e) {
  if (!Array.isArray(e)) {
    let t = Mt.parse(e);
    if (!Array.isArray(t)) throw TypeError("deserializeProofs: expected a JSON array of proofs");
    e = t;
  }
  return _t(e.map((t) => typeof t == "string" ? Mt.parse(t) : t));
}
function Ff(e) {
  return Hh.fromEncodedRequest(e);
}
function Jh(e) {
  return e.map((t) => {
    let { dleq: n, ...r } = t;
    return r;
  });
}
function za(e, t) {
  let n = [...new Set(t.map((i) => i.toLowerCase()))], r = [];
  for (let i of e) {
    let s;
    try {
      s = F(i.id);
    } catch {
      r.push(i);
      continue;
    }
    if (s[0] === 0) r.push(i);
    else if (s[0] === 1) {
      if (!n.length) throw new h("A short keyset ID v2 was encountered, but got no keysets to map it to.");
      let o = i.id.toLowerCase(), a = n.filter((u) => o === u.slice(0, o.length));
      if (a.length > 1) throw new h(`Short keyset ID ${i.id} is ambiguous.`);
      if (a.length === 0) throw new h(`Couldn't map short keyset ID ${i.id} to any known keysets of the current Mint`);
      i.id = a[0], r.push(i);
    } else throw new h(`Unknown keyset ID version: ${s[0]}`);
  }
  return r;
}
function bi(e, t, n) {
  let r = n?.require ?? !0;
  if (!La(e.amount, t.keys)) throw new h(Object.keys(t.keys).length === 0 ? `No keys loaded for keyset ${t.id}` : `Undefined key for amount ${e.amount.toString()} in keyset ${t.id}`);
  if (e?.dleq == null) return !r;
  if (e.dleq.r == null) return !1;
  let i = t.keys[e.amount.toString()];
  try {
    let s = {
      e: F(e.dleq.e),
      s: F(e.dleq.s),
      r: rn(e.dleq.r)
    };
    return ua(new TextEncoder().encode(e.secret), s, wt(e.C), wt(i));
  } catch {
    return !1;
  }
}
function Xh(e, t) {
  return bi(e, t, { require: !1 });
}
function zf(e) {
  let t = new TextEncoder(), n = _t(e.proofs);
  if (wi(n)) throw new h("Proofs contain a legacy keyset ID and cannot be encoded. Swap them at the mint first.");
  let r = oi(Ka({
    ...e,
    proofs: n
  }));
  return Fa(t.encode("craw"), t.encode("B"), r);
}
function Qf(e, t) {
  if (e.length < 5 || [
    99,
    114,
    97,
    119,
    66
  ].some((r, i) => e[i] !== r)) throw new h("not a valid binary token");
  let n = Na(li(e.slice(5)));
  return Array.isArray(t) && (n.proofs = za(n.proofs, t)), n;
}
function Qa(e) {
  for (let t of [
    "web+cashu://",
    "cashu://",
    "cashu:"
  ]) if (e.startsWith(t)) {
    e = e.slice(t.length);
    break;
  }
  return e.startsWith("cashu") && (e = e.slice(5)), e;
}
function td(e) {
  try {
    return kn(e) !== null;
  } catch {
    return !1;
  }
}
var ed = {
  m: 100000000n,
  u: 100000n,
  n: 100n
}, nd = 100000000000n;
function kn(e) {
  if (typeof e != "string") throw new h("BOLT11 invoice must be a string");
  let t = e.toLowerCase(), n = t.lastIndexOf("1");
  if (!t.startsWith("ln") || n < 3 || n > 100 || n === t.length - 1) throw new h("Invalid BOLT11 invoice");
  let r = /^ln[a-z]+?(\d*)([munp]?)$/.exec(t.slice(0, n));
  if (!r) throw new h("Invalid BOLT11 invoice");
  let [, i, s] = r;
  if (i === "") return null;
  if (i.startsWith("0")) throw new h("Invalid BOLT11 amount");
  let o = BigInt(i);
  if (s === "") return o * nd;
  if (s === "p") {
    if (o % 10n != 0n) throw new h("Invalid BOLT11 amount");
    return o / 10n;
  }
  return o * ed[s];
}
function rd(e) {
  if (typeof e != "string") throw new h("BOLT11 invoice must be a string");
  let t;
  try {
    ({ words: t } = xe.decode(e.toLowerCase(), !1));
  } catch (r) {
    throw new h("Invalid BOLT11 invoice", { cause: r });
  }
  let n = t.length - 104;
  for (let r = 7; r + 3 <= n; ) {
    let i = t[r], s = t[r + 1] << 5 | t[r + 2], o = r + 3 + s;
    if (o > n) break;
    if (i === 1 && s === 52) try {
      return Z(xe.fromWords(t.slice(r + 3, o)));
    } catch (a) {
      throw new h("Invalid BOLT11 payment hash", { cause: a });
    }
    r = o;
  }
  throw new h("BOLT11 invoice has no payment hash");
}
function id(e, t) {
  let n = rd(e);
  return /^[0-9a-fA-F]{64}$/.test(t) && Z(at(F(t))) === n;
}
function Ha(e) {
  let t = e ?? 32;
  if (!Number.isSafeInteger(t) || t < 1) throw new h("chunkSize must be a positive safe integer");
  return t;
}
function ja(e) {
  let t = e ?? 50;
  if (!Number.isFinite(t) || t < 0) throw new h("budgetMs must be a finite, non-negative number");
  return t;
}
async function sd() {
  let e = globalThis;
  if (typeof e.scheduler?.yield == "function") return e.scheduler.yield();
  if (typeof e.MessageChannel == "function") {
    await new Promise((t) => {
      let { port1: n, port2: r } = new e.MessageChannel();
      n.onmessage = () => {
        n.close(), t();
      }, r.postMessage(null);
    });
    return;
  }
  await new Promise((t) => setTimeout(t, 0));
}
async function od(e, t, n) {
  let r = Ha(n?.chunkSize), i = ja(n?.budgetMs), s = e.length, o = Array(s), a = () => {
    if (n?.signal?.aborted) throw new Ht("Operation aborted by caller");
  };
  a();
  let u = performance.now(), l = 0;
  for (let c = 0; c < s; c++) o[c] = t(e[c], c), l++, c + 1 !== s && (l >= r || performance.now() - u >= i) && (n?.onProgress?.(c + 1, s), await sd(), a(), u = performance.now(), l = 0);
  return n?.onProgress?.(s, s), o;
}
function ad(e) {
  return e instanceof Error ? e.message : String(e);
}
function ud(e, t, n) {
  let r;
  try {
    r = {
      ...e,
      amount: k.from(e.amount)
    };
  } catch (a) {
    return new h(`Invalid amount ${String(e.amount)} in keyset ${e.id}`, { cause: a });
  }
  let i;
  try {
    i = t(r.id);
  } catch (a) {
    return new h(ad(a), { cause: a });
  }
  if (Object.keys(i.keys).length === 0) return new h(`No keys loaded for keyset ${i.id}`);
  let s = i.keys[r.amount.toString()];
  if (!s) return new h(`Undefined key for amount ${r.amount.toString()} in keyset ${i.id}`);
  let o = () => new h(`${n ? "Token contains proofs with invalid or missing DLEQ" : "Token contains a proof with an invalid DLEQ"} (keyset ${r.id}, amount ${r.amount.toString()})`);
  if (r.dleq == null) return n ? o() : void 0;
  if (r.dleq.r == null) return o();
  try {
    return ua(new TextEncoder().encode(r.secret), {
      e: F(r.dleq.e),
      s: F(r.dleq.s),
      r: rn(r.dleq.r)
    }, wt(r.C), wt(s)) ? void 0 : o();
  } catch {
    return o();
  }
}
async function Wa(e, t, n) {
  if (e.length > 1e4) throw new h(`Token contains too many proofs: ${e.length}, maximum is ${Tn}`);
  let r = n?.require ?? !1, i = await od(e, (o) => ud(o, t, r), {
    chunkSize: Ha(n?.chunkSize),
    budgetMs: ja(n?.budgetMs),
    signal: n?.signal,
    onProgress: (o, a) => rt(() => n?.onProgress?.(o, a), void 0)
  }), s = {
    valid: [],
    invalid: []
  };
  return i.forEach((o, a) => {
    o ? s.invalid.push({
      proof: e[a],
      error: o
    }) : s.valid.push(e[a]);
  }), s;
}
function ld(e, t, n) {
  return Wa(e, t, n);
}
function Hf(e, t, n) {
  return Wa(e, t, n);
}
function Ga(e, t, n, r) {
  let i = e.payment_preimage ?? null;
  if (typeof i != "string") {
    i !== null && n.warn("Mint returned a payment_preimage that is not a string", { op: r }), e.payment_preimage = null;
    return;
  }
  e.payment_preimage = t === "bolt11" && typeof e.request == "string" ? cd(e.request, i, n, r) : i;
}
function cd(e, t, n, r) {
  let i;
  try {
    i = id(e, t);
  } catch (s) {
    return n.debug("Melt quote request is not a parseable BOLT11 invoice", {
      op: r,
      err: s
    }), t;
  }
  return i ? t : (n.warn("Mint returned a payment_preimage that does not match the invoice", { op: r }), null);
}
function pt(e, t, n) {
  if (e == null) {
    if (arguments.length >= 3) return n;
    throw new h(`Invalid ${t}: missing value`);
  }
  try {
    return k.from(e).toNumber();
  } catch (r) {
    throw new h(`Invalid ${t}: ${r instanceof Error ? r.message : String(r)}`, { cause: r });
  }
}
function vi(e) {
  return {
    ...e,
    input_fee_ppk: pt(e.input_fee_ppk, "keyset.input_fee_ppk", void 0),
    final_expiry: pt(e.final_expiry, "keyset.final_expiry", void 0)
  };
}
function ki(e) {
  return {
    ...e,
    input_fee_ppk: pt(e.input_fee_ppk, "keys.input_fee_ppk", void 0),
    final_expiry: pt(e.final_expiry, "keys.final_expiry", void 0)
  };
}
function hd(e, t) {
  let n;
  try {
    n = new URL(e).protocol;
  } catch {
    throw new h(`OIDCAuth: ${t} is not a valid URL`);
  }
  if (n !== "https:" && n !== "http:") throw new h(`OIDCAuth: ${t} must be an http(s) URL`);
  return n;
}
var dd = class Za {
  static fromMintInfo(t, n) {
    let r = t?.nuts?.["21"];
    if (!r?.openid_discovery) throw new h("OIDCAuth: mint does not advertise NUT-21 openid_discovery");
    let i = n?.clientId ?? r.client_id ?? "cashu-client";
    return new Za(r.openid_discovery, {
      ...n,
      clientId: i
    });
  }
  constructor(t, n) {
    this.tokenListeners = [], this.inflightRefreshes = /* @__PURE__ */ new Map(), this.discoveryUrl = t, this.secureDiscovery = t.startsWith("https:"), this.logger = n?.logger ?? ut, this.clientId = n?.clientId ?? "cashu-client", this.scope = n?.scope ?? "openid", this.onTokens = n?.onTokens;
  }
  setClient(t) {
    this.clientId = t;
  }
  setScope(t) {
    this.scope = t ?? "openid";
  }
  addTokenListener(t) {
    this.tokenListeners = [...this.tokenListeners, t];
  }
  removeTokenListener(t) {
    this.tokenListeners = this.tokenListeners.filter((n) => n !== t);
  }
  async loadConfig() {
    if (this.config) return this.config;
    let t = await fetch(this.discoveryUrl, {
      method: "GET",
      headers: { Accept: "application/json" }
    }), n = await t.text(), r, i;
    try {
      r = n ? JSON.parse(n) : void 0;
    } catch (o) {
      i = o, this.logger.warn("OIDCAuth: bad discovery JSON", { err: o });
    }
    if (!t.ok || !r) throw new h("OIDCAuth: invalid discovery document", { cause: i });
    let s = r;
    if (typeof s.token_endpoint != "string" || s.token_endpoint.length === 0) throw new h("OIDCAuth: invalid discovery document, missing token_endpoint");
    return this.assertEndpoint(s.token_endpoint, "token_endpoint"), this.config = s, s;
  }
  assertEndpoint(t, n) {
    let r = hd(t, n);
    this.secureDiscovery && r !== "https:" && this.logger.warn(`OIDCAuth: ${n} is not https although discovery is; v5 rejects this`, { label: n });
  }
  generatePKCE() {
    let t = Bn(zt(48));
    return {
      verifier: t,
      challenge: Bn(at(St(t)))
    };
  }
  async buildAuthCodeUrl(t) {
    let n = await this.loadConfig(), r = t.scope ?? this.scope, i = t.codeChallengeMethod;
    i !== void 0 && i !== "S256" && this.logger.warn(`OIDCAuth: codeChallengeMethod '${typeof i == "string" ? i : typeof i}' is not supported by cashu-ts v5, which accepts S256 only.`);
    let s = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: t.redirectUri,
      scope: r,
      code_challenge_method: t.codeChallengeMethod ?? "S256",
      code_challenge: t.codeChallenge
    });
    if (t.state && s.set("state", t.state), !n.authorization_endpoint) throw new h("OIDCAuth: discovery lacks authorization_endpoint");
    return this.assertEndpoint(n.authorization_endpoint, "authorization_endpoint"), `${n.authorization_endpoint}?${s.toString()}`;
  }
  async exchangeAuthCode(t) {
    let n = await this.loadConfig(), r = this.toForm({
      grant_type: "authorization_code",
      code: t.code,
      redirect_uri: t.redirectUri,
      client_id: this.clientId,
      code_verifier: t.codeVerifier
    }), i = await this.postFormStrict(n.token_endpoint, r);
    return this.handleTokens(i, "signin"), i;
  }
  async deviceStart() {
    let t = (await this.loadConfig()).device_authorization_endpoint;
    if (!t) throw new h("OIDCAuth: provider lacks device_authorization_endpoint");
    this.assertEndpoint(t, "device_authorization_endpoint");
    let n = this.toForm({
      client_id: this.clientId,
      scope: this.scope
    }), r = await this.postFormStrict(t, n);
    return this.assertEndpoint(r.verification_uri, "verification_uri"), r.verification_uri_complete !== void 0 && this.assertEndpoint(r.verification_uri_complete, "verification_uri_complete"), r;
  }
  async devicePoll(t, n = 5) {
    let r = await this.loadConfig(), i = Number(n), s = Number.isFinite(i) ? Math.max(1, i) : 5;
    for (; ; ) {
      await this.sleep(s * 1e3);
      let o = this.toForm({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code: t,
        client_id: this.clientId
      }), a = await this.postFormLoose(r.token_endpoint, o);
      if (a.access_token) return this.handleTokens(a, "signin", this.tokenListeners), a;
      let u = (a.error ?? "").toString();
      if (u !== "authorization_pending") {
        if (u === "slow_down") {
          s = Math.max(s + 5, s * 2);
          continue;
        }
        throw new h(`OIDCAuth: ${a.error_description || u || "device authorization failed"}`);
      }
    }
  }
  async startDeviceAuth(t = 5) {
    let n = await this.deviceStart(), r = Number(n.interval), i = Number.isFinite(r) && r > 0 ? r : 1, s = Number(t), o = Math.max(i, Number.isFinite(s) ? s : 5), a = new AbortController(), u, l = new Promise((g) => {
      u = g;
    }), c = /* @__PURE__ */ new Set(), d = () => {
      if (a.signal.aborted) throw new h("OIDCAuth: device polling cancelled");
    }, f = async () => {
      let g = await this.loadConfig(), m = Math.max(1, o);
      for (; ; ) {
        d();
        let w;
        await this.sleep(m * 1e3, (E) => {
          w = E, c.add(E);
        }), c.delete(w), d();
        let v = this.toForm({
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          device_code: n.device_code,
          client_id: this.clientId
        }), x = await this.postFormLoose(g.token_endpoint, v, a.signal);
        if (d(), x.access_token) return this.handleTokens(x, "signin"), x;
        let b = (x.error ?? "").toString();
        if (b !== "authorization_pending") {
          if (b === "slow_down") {
            m = Math.max(m + 5, m * 2);
            continue;
          }
          throw new h(`OIDCAuth: ${x.error_description || b || "device authorization failed"}`);
        }
      }
    };
    return {
      ...n,
      poll: () => Promise.race([f(), l.then(() => {
        throw new h("OIDCAuth: device polling cancelled");
      })]),
      cancel: () => {
        a.abort(), u();
        for (let g of c) g();
        c.clear();
      }
    };
  }
  async refresh(t) {
    let n = this.clientId, r = this.tokenListeners, i = this.inflightRefreshes.get(t);
    if (i?.listeners === r && i.clientId === n) return i.promise;
    let s = (async () => {
      let o = await this.loadConfig(), a = this.toForm({
        grant_type: "refresh_token",
        refresh_token: t,
        client_id: n
      }), u = await this.postFormStrict(o.token_endpoint, a);
      return u.refresh_token || (u.refresh_token = t), this.handleTokens(u, "refresh", r), u;
    })();
    this.inflightRefreshes.set(t, {
      clientId: n,
      listeners: r,
      promise: s
    });
    try {
      return await s;
    } finally {
      this.inflightRefreshes.get(t)?.promise === s && this.inflightRefreshes.delete(t);
    }
  }
  async passwordGrant(t, n) {
    let r = await this.loadConfig(), i = this.toForm({
      grant_type: "password",
      client_id: this.clientId,
      username: t,
      password: n,
      scope: this.scope
    }), s = await this.postFormStrict(r.token_endpoint, i);
    return this.handleTokens(s, "signin"), s;
  }
  handleTokens(t, n, r = this.tokenListeners) {
    if (!t.access_token) throw new h(`OIDCAuth: ${t.error_description || t.error || "token response missing access_token"}`);
    queueMicrotask(() => rt((s) => this.onTokens?.(s, n), t, this.logger, { where: "OIDCAuth.handleTokens" }));
    let i = new Set(this.tokenListeners);
    for (let s of r) i.has(s) && queueMicrotask(() => rt((o) => s(o, n), t, this.logger, { where: "OIDCAuth.handleTokens.listener" }));
  }
  toForm(t) {
    let n = (r) => encodeURIComponent(r).replace(/%20/g, "+");
    return Object.entries(t).map(([r, i]) => `${n(r)}=${n(i)}`).join("&");
  }
  async postFormStrict(t, n) {
    try {
      let r = await fetch(t, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        },
        body: n,
        redirect: "error"
      }), i = await r.text(), s, o;
      try {
        s = i ? JSON.parse(i) : void 0;
      } catch (a) {
        o = a, this.logger.warn("OIDCAuth: bad JSON (strict)", { err: a });
      }
      if (!r.ok) {
        let a = s ?? {};
        throw new h(`OIDCAuth: ${a.error_description || a.error || `HTTP ${r.status}`}`, { cause: o });
      }
      return this.logger.debug("OIDCAuth Response", { status: r.status }), s ?? {};
    } catch (r) {
      throw this.logger.error("OIDCAuth: postFormStrict failed", { err: r }), r;
    }
  }
  async postFormLoose(t, n, r) {
    try {
      let i = await fetch(t, {
        method: "POST",
        signal: r,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        },
        body: n,
        redirect: "error"
      }), s = await i.text(), o;
      try {
        o = s ? JSON.parse(s) : void 0;
      } catch (a) {
        this.logger.warn("OIDCAuth: bad JSON (loose)", { err: a });
      }
      return this.logger.debug("OIDCAuth Response", { status: i.status }), o ?? {};
    } catch (i) {
      return this.logger.error("OIDCAuth: postFormLoose network error", { err: i }), {
        error: "network_error",
        error_description: String(i)
      };
    }
  }
  sleep(t, n) {
    let r = Math.min(t, nc);
    return new Promise((i) => {
      let s = setTimeout(i, r);
      n?.(() => {
        clearTimeout(s), i();
      });
    });
  }
}, se = class U {
  constructor(t, n) {
    let r = n ?? ut;
    this._mintInfo = U.normalizeInfo(t, r), this._maxArrayLength = U.resolveMaxArrayLength(t.max_array_length, r);
    let i = this.toEndpoints(this._mintInfo?.nuts?.[22]?.protected_endpoints, r);
    this._protected22 = this.buildIndex(i);
    let s = this.toEndpoints(this._mintInfo?.nuts?.[21]?.protected_endpoints, r);
    this._protected21 = this.buildIndex(s);
  }
  static normalizeInfo(t, n = ut) {
    if (!vt(t) || !vt(t.nuts)) throw n.error("MintInfo: malformed info response", { op: "normalizeInfo" }), new h("Invalid response from mint");
    return {
      ...t,
      ...Array.isArray(t.contact) ? { contact: U.capList(t.contact, "contact", n) } : {},
      ...Array.isArray(t.urls) ? { urls: U.capList(t.urls, "urls", n) } : {},
      nuts: {
        ...t.nuts,
        ...t.nuts[4] ? { 4: U.normalizeSwapSection(t.nuts[4], "nuts.4", n) } : {},
        ...t.nuts[5] ? { 5: U.normalizeSwapSection(t.nuts[5], "nuts.5", n) } : {},
        ...t.nuts[15] ? { 15: U.normalizeNut15(t.nuts[15], n) } : {},
        ...t.nuts[17] ? { 17: U.normalizeNut17(t.nuts[17], n) } : {},
        ...t.nuts[19] ? { 19: U.normalizeNut19(t.nuts[19], n) } : {},
        ...t.nuts[21] ? { 21: U.normalizeNut21(t.nuts[21], n) } : {},
        ...t.nuts[22] ? { 22: U.normalizeNut22(t.nuts[22], n) } : {},
        ...t.nuts[29] ? { 29: U.normalizeNut29(t.nuts[29], n) } : {}
      }
    };
  }
  static dropSection(t, n) {
    n.warn(`MintInfo: ${t} is malformed and was omitted`);
  }
  static normalizeSwapSection(t, n, r) {
    if (!vt(t)) throw r.error("MintInfo: malformed info response", { op: n }), new h("Invalid response from mint");
    return {
      ...t,
      methods: U.normalizeSwapMethods(t.methods, r)
    };
  }
  static normalizeSwapMethods(t, n) {
    return Array.isArray(t) ? U.capList(t, "nuts.4/5.methods", n).filter((r) => vt(r)).map((r) => {
      let i = { ...r };
      return Qe(i, "min_amount", "max_amount"), i;
    }) : (n.warn("MintInfo: nuts.4/5.methods is malformed and was omitted"), []);
  }
  static resolveMaxArrayLength(t, n) {
    if (t == null) return 500;
    let r;
    try {
      r = pt(t, "max_array_length");
    } catch {
      return n.warn("MintInfo: max_array_length is malformed, defaulting to internal default", { value: t }), 500;
    }
    if (r < 1 || r > 1e4) {
      let i = Math.min(Math.max(r, 1), Tn);
      return n.warn("MintInfo: max_array_length is out of range and was clamped", {
        advertised: r,
        clampedTo: i
      }), i;
    }
    return r;
  }
  static normalizeNut15(t, n) {
    return vt(t) ? Array.isArray(t.methods) ? {
      ...t,
      methods: U.capList(t.methods, "nuts.15.methods", n)
    } : t : U.dropSection("nuts.15", n);
  }
  static normalizeNut17(t, n) {
    return vt(t) ? Array.isArray(t.supported) ? {
      ...t,
      supported: U.capList(t.supported, "nuts.17.supported", n)
    } : t : U.dropSection("nuts.17", n);
  }
  static normalizeNut19(t, n) {
    return vt(t) ? {
      ...t,
      ...Array.isArray(t.cached_endpoints) ? { cached_endpoints: U.capList(t.cached_endpoints, "nuts.19.cached_endpoints", n) } : {},
      ttl: pt(t.ttl, "nuts.19.ttl", null)
    } : U.dropSection("nuts.19", n);
  }
  static normalizeNut21(t, n) {
    return vt(t) ? Array.isArray(t.protected_endpoints) ? {
      ...t,
      protected_endpoints: U.capList(t.protected_endpoints, "nuts.21.protected_endpoints", n)
    } : t : U.dropSection("nuts.21", n);
  }
  static normalizeNut22(t, n) {
    if (!vt(t)) return U.dropSection("nuts.22", n);
    let r = 100;
    try {
      r = pt(t.bat_max_mint, "nuts.22.bat_max_mint", 100);
    } catch {
      n.warn("MintInfo: nuts.22.bat_max_mint is malformed, defaulting to internal cap", { value: t.bat_max_mint });
    }
    return r > 100 && (n.warn("MintInfo: nuts.22.bat_max_mint exceeds internal cap and was clamped", {
      advertised: r,
      clampedTo: 100
    }), r = 100), {
      ...t,
      ...Array.isArray(t.protected_endpoints) ? { protected_endpoints: U.capList(t.protected_endpoints, "nuts.22.protected_endpoints", n) } : {},
      bat_max_mint: r
    };
  }
  static normalizeNut29(t, n) {
    if (!vt(t)) return U.dropSection("nuts.29", n);
    let r = 100;
    try {
      r = pt(t.max_batch_size, "nuts.29.max_batch_size", 100);
    } catch {
      n.warn("MintInfo: nuts.29.max_batch_size is malformed, defaulting to internal cap", { value: t.max_batch_size });
    }
    return r > 100 && (n.warn("MintInfo: nuts.29.max_batch_size exceeds internal cap and was clamped", {
      advertised: r,
      clampedTo: 100
    }), r = 100), {
      methods: Array.isArray(t.methods) ? U.capList(t.methods, "nuts.29.methods", n) : t.methods,
      max_batch_size: r
    };
  }
  isSupported(t) {
    switch (t) {
      case 4:
      case 5:
        return this.checkMintMelt(t);
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 14:
      case 20:
        return this.checkGenericNut(t);
      case 17:
        return this.checkNut17();
      case 15:
        return this.checkNut15();
      case 19:
        return this.checkNut19();
      case 29:
        return this.checkNut29();
      default:
        throw new h("nut is not supported by cashu-ts");
    }
  }
  requiresBlindAuthToken(t, n) {
    return this.matchesProtected(this._protected22, t, n);
  }
  requiresClearAuthToken(t, n) {
    return this.matchesProtected(this._protected21, t, n);
  }
  matchesProtected(t, n, r) {
    if (!t) return !1;
    let i = t.exact[n], s = t.prefix[n];
    if (!i || !s) return !1;
    if (t.exact[n].has(r)) return !0;
    for (let o of t.prefix[n]) if (r.startsWith(o)) return !0;
    return !1;
  }
  checkGenericNut(t) {
    return { supported: this._mintInfo.nuts[t]?.supported === !0 };
  }
  checkMintMelt(t) {
    let n = this._mintInfo.nuts[t];
    return n && n.methods.length > 0 && !n.disabled ? {
      disabled: !1,
      params: U.snapshot(n.methods)
    } : {
      disabled: !0,
      params: U.snapshot(n?.methods ?? [])
    };
  }
  checkNut17() {
    return this._mintInfo.nuts[17] && this._mintInfo.nuts[17].supported.length > 0 ? {
      supported: !0,
      params: U.snapshot(this._mintInfo.nuts[17].supported)
    } : { supported: !1 };
  }
  checkNut15() {
    return this._mintInfo.nuts[15] && this._mintInfo.nuts[15].methods.length > 0 ? {
      supported: !0,
      params: U.snapshot(this._mintInfo.nuts[15].methods)
    } : { supported: !1 };
  }
  checkNut19() {
    let t = this._mintInfo.nuts?.[19];
    if (t && (t?.cached_endpoints?.length || 0) > 0) {
      let n = pt(t.ttl, "nuts.19.ttl", null);
      return {
        supported: !0,
        params: {
          ttl: n === null ? 1 / 0 : Math.max(n, 0) * 1e3,
          cached_endpoints: U.snapshot(t.cached_endpoints)
        }
      };
    }
    return { supported: !1 };
  }
  checkNut29() {
    let t = this._mintInfo.nuts?.[29];
    return t ? {
      supported: !0,
      params: U.snapshot(t)
    } : { supported: !1 };
  }
  static capList(t, n, r) {
    return t.length <= 1024 ? t : (r.warn(`MintInfo: ${n} exceeds internal cap and was truncated`, {
      advertised: t.length,
      cap: ts
    }), t.slice(0, ts));
  }
  toEndpoints(t, n) {
    if (!Array.isArray(t)) return [];
    let r = U.capList(t, "nuts.21/22.protected_endpoints", n), i = [];
    for (let s of r) if (s && typeof s == "object") {
      let o = s, a = o.method, u = o.path;
      if (typeof a == "string" && typeof u == "string") {
        let l = a.toUpperCase();
        (l === "GET" || l === "POST") && i.push({
          method: l,
          path: u
        });
      }
    }
    return i;
  }
  buildIndex(t) {
    if (!t?.length) return;
    let n = {
      GET: /* @__PURE__ */ new Set(),
      POST: /* @__PURE__ */ new Set()
    }, r = {
      GET: [],
      POST: []
    };
    for (let i of t) {
      let s = i.path;
      if (s.startsWith("^") && (s = s.slice(1)), s.endsWith("$") && (s = s.slice(0, -1)), s.endsWith(".*")) {
        r[i.method].push(s.slice(0, -2));
        continue;
      }
      if (s.endsWith("*")) {
        r[i.method].push(s.slice(0, -1));
        continue;
      }
      n[i.method].add(s);
    }
    return r.GET.sort((i, s) => s.length - i.length), r.POST.sort((i, s) => s.length - i.length), {
      exact: n,
      prefix: r
    };
  }
  static snapshot(t, n = 0) {
    if (typeof t != "object" || !t || t instanceof k) return t;
    if (n > 64) throw new h("Mint info nesting exceeds 64 levels");
    if (Array.isArray(t)) return t.map((i) => U.snapshot(i, n + 1));
    let r = {};
    for (let [i, s] of Object.entries(t)) r[i] = U.snapshot(s, n + 1);
    return r;
  }
  get cache() {
    return U.snapshot(this._mintInfo);
  }
  get contact() {
    return U.snapshot(this._mintInfo.contact);
  }
  get description() {
    return this._mintInfo.description;
  }
  get description_long() {
    return this._mintInfo.description_long;
  }
  get name() {
    return this._mintInfo.name;
  }
  get pubkey() {
    return this._mintInfo.pubkey;
  }
  get nuts() {
    return U.snapshot(this._mintInfo.nuts);
  }
  get version() {
    return this._mintInfo.version;
  }
  get motd() {
    return this._mintInfo.motd;
  }
  get icon_url() {
    return this._mintInfo.icon_url;
  }
  get urls() {
    return U.snapshot(this._mintInfo.urls);
  }
  get time() {
    return this._mintInfo.time;
  }
  get tos_url() {
    return this._mintInfo.tos_url;
  }
  get maxArrayLength() {
    return this._maxArrayLength;
  }
  supportsNut04Description(t, n) {
    return this._mintInfo.nuts[4]?.methods.some((r) => r.method === t && (n ? r.unit === n : !0) && (r.options?.description === !0 || r.description === !0));
  }
  supportsMintMeltMethod(t, n, r) {
    let { disabled: i, params: s } = this.isSupported(t === "mint" ? 4 : 5);
    return i ? !1 : s.some((o) => o.method === n && o.unit === r);
  }
  supportsAmountless(t = "bolt11", n = "sat") {
    let r = this._mintInfo?.nuts?.[5]?.methods ?? [];
    return Array.isArray(r) ? r.some((i) => i.method === t && i.unit === n && i.options?.amountless === !0) : !1;
  }
}, He = {
  UNPAID: "UNPAID",
  PAID: "PAID",
  ISSUED: "ISSUED"
}, Va = {
  UNPAID: "UNPAID",
  PENDING: "PENDING",
  PAID: "PAID"
}, fr = {
  UNSPENT: "UNSPENT",
  PENDING: "PENDING",
  SPENT: "SPENT"
};
function fd(e) {
  return e.window !== void 0 && e.window.document !== void 0 ? !0 : e.WorkerGlobalScope !== void 0 && e.self !== void 0 && e.self instanceof e.WorkerGlobalScope;
}
var pd = fd(globalThis);
function gd(e, t, n = pd) {
  return Ya({
    Accept: "application/json, text/plain, */*",
    ...e ? { "Content-Type": "application/json" } : void 0,
    ...n ? void 0 : { "User-Agent": "Mozilla/5.0" }
  }, t);
}
function _i(e, t) {
  return e instanceof Error ? e.message : t;
}
function ms(e, t, n) {
  let r = e;
  for (; ; ) {
    let s = r.cause;
    if (!(s instanceof Error) || s === r) break;
    r = s;
  }
  let i = "";
  if (r instanceof Error && r !== e && r.message) {
    let s = r.code;
    i = ` (${r.message}${typeof s == "string" ? `, ${s}` : ""})`;
  }
  return `${_i(e, t)}${i} at ${sn(n)}`;
}
function sn(e) {
  try {
    return new URL(e).origin;
  } catch {
    return e;
  }
}
function ys(e, t, n, r) {
  if (t?.signal.aborted) return new Eo(`Request timed out after ${n}ms`, { cause: e });
  if (r?.aborted) return new Ht(_i(e, "Request aborted by caller"));
}
async function ws(e, t) {
  if (t?.aborted) throw new h("response body read aborted");
  let n = e.text();
  if (!t) return n;
  n.catch(() => {
  });
  let r, i = new Promise((s, o) => {
    r = () => o(new h("response body read aborted")), t.aborted ? r() : t.addEventListener("abort", r, { once: !0 });
  });
  i.catch(() => {
  });
  try {
    return await Promise.race([n, i]);
  } finally {
    r && t.removeEventListener("abort", r);
  }
}
function md(e) {
  if (e === null) return;
  let t = e.trim();
  if (t !== "") {
    if (/^\d+$/.test(t)) return Math.max(Number(t) * 1e3, 0);
    if (/[a-zA-Z]/.test(t)) {
      let n = new Date(t).getTime();
      if (!Number.isNaN(n)) return Math.max(n - Date.now(), 0);
    }
  }
}
var yd = {
  endpoint: !0,
  requestBody: !0,
  logger: !0,
  ttl: !0,
  cached_endpoints: !0,
  requestTimeout: !0,
  onResponseMeta: !0
}, _n = {}, tr = ut;
function jf(e) {
  _n = e;
}
function wd(e) {
  tr = e;
}
var bd = 9, vd = 1e3, kd = 3e5, _d = 100, Sd = ["blind-auth", "clear-auth"];
function xd(e) {
  return e instanceof Ht || e instanceof Eo ? !1 : e instanceof ke ? !0 : e instanceof ve && e.status >= 500;
}
function Id(e, t) {
  return t ? new Promise((n, r) => {
    if (t.aborted) {
      r(new Ht("Request aborted by caller"));
      return;
    }
    let i = () => {
      clearTimeout(s), t.removeEventListener("abort", i), r(new Ht("Request aborted by caller"));
    };
    t.addEventListener("abort", i, { once: !0 });
    let s = setTimeout(() => {
      t.removeEventListener("abort", i), n();
    }, e);
  }) : new Promise((n) => setTimeout(n, e));
}
function Ad(e) {
  try {
    return new URL(e).pathname;
  } catch {
    return e.startsWith("/") ? e.split(/[?#]/, 1)[0] : void 0;
  }
}
function Ed(e, t) {
  return e === t ? !0 : e.endsWith(t);
}
async function Md(e) {
  let { ttl: t, cached_endpoints: n, endpoint: r } = e, i = e.logger ?? tr;
  if (Object.keys(e.headers ?? {}).some((c) => c.toLowerCase() === "blind-auth")) return await pr(e);
  let s = Ad(r), o = e.method?.toUpperCase() ?? "GET";
  if (!(s !== void 0 && n?.some((c) => Ed(s, c.path) && c.method === o) && t)) return await pr(e);
  let a = 0, u = Date.now(), l = async () => {
    try {
      return await pr(e);
    } catch (c) {
      if (xd(c)) {
        let d = Date.now() - u;
        if (a < bd && (!t || d < t)) {
          let f = Math.min(2 ** a * _d, vd) / 2, p = f + Math.random() * f;
          if (d + p > t) throw i.warn(`Network Error: request abandoned after ${a} retries`, {
            e: c,
            retries: a
          }), c;
          return a++, i.info(`Network Error: attempting retry ${a} in ${p}ms`, {
            e: c,
            retries: a,
            delay: p
          }), await Id(p, e.signal), l();
        }
      }
      throw i.debug("Request failed and could not be retried", { e: c }), c;
    }
  };
  return l();
}
async function pr(e) {
  let { endpoint: t, requestBody: n, headers: r, requestTimeout: i, onResponseMeta: s, cached_endpoints: o, ttl: a, logger: u, ...l } = e, c = u ?? tr, d = n ? Mt.stringify(n) : void 0, f = gd(d, r), p = Object.keys(f).some((b) => Sd.includes(b.toLowerCase())), g = e.signal ?? void 0;
  if (g?.aborted) throw new Ht("Request aborted by caller");
  let m = i !== void 0 && Number.isFinite(i) ? new AbortController() : void 0, w = g, v, x;
  if (m) if (v = setTimeout(() => m.abort(), i), !g) w = m.signal;
  else {
    let b = new AbortController(), E = () => b.abort();
    g.addEventListener("abort", E, { once: !0 }), m.signal.addEventListener("abort", E, { once: !0 }), x = () => {
      g.removeEventListener("abort", E), m.signal.removeEventListener("abort", E);
    }, w = b.signal;
  }
  try {
    let b;
    try {
      b = await fetch(t, {
        body: d,
        headers: f,
        cache: "no-store",
        credentials: "omit",
        referrer: "",
        referrerPolicy: "no-referrer",
        ...d === void 0 ? void 0 : { redirect: "error" },
        ...l,
        ...p ? { redirect: "error" } : void 0,
        signal: w
      });
    } catch (A) {
      let H = !!m?.signal.aborted, C = !!g?.aborted;
      throw H ? new ke(`Request timed out after ${i}ms at ${sn(t)}`, { cause: A }) : C ? new Ht(_i(A, "Request aborted by caller")) : A instanceof Error && (A.name === "AbortError" || A.name === "TimeoutError") ? new ke(ms(A, A.message, t), { cause: A }) : new ke(ms(A, "Network request failed", t), { cause: A });
    }
    let E = md(b.headers.get("Retry-After"));
    if (s && b.headers && rt(s, {
      endpoint: t,
      status: b.status,
      retryAfterMs: E,
      rateLimit: b.headers.get("RateLimit") ?? void 0,
      rateLimitPolicy: b.headers.get("RateLimit-Policy") ?? void 0,
      headers: b.headers
    }, c, {
      op: "request.onResponseMeta",
      status: b.status,
      endpoint: sn(t)
    }), !b.ok) {
      if (b.status === 429) {
        let D = b.body;
        throw D && typeof D.cancel == "function" && D.cancel().catch(() => {
        }), new tc("429 Too Many Requests", E);
      }
      let A, H;
      try {
        A = Td(await ws(b, w));
      } catch (D) {
        let W = ys(D, m, i, g);
        if (W) throw W;
        H = D, A = { error: "bad response" };
      }
      if (b.status === 400 && "code" in A && typeof A.code == "number" && "detail" in A && typeof A.detail == "string") throw new Ro(A.code, A.detail);
      let C = "HTTP request failed";
      throw "error" in A && typeof A.error == "string" ? C = A.error : "detail" in A && typeof A.detail == "string" && (C = A.detail), new ve(C, b.status, { cause: H });
    }
    let M;
    try {
      M = await ws(b, w);
    } catch (A) {
      throw ys(A, m, i, g) || (c.error("Failed to read HTTP response", { err: A }), new ve("bad response", b.status, { cause: A }));
    }
    try {
      if (!M) throw new h("Empty response body");
      return Mt.parse(M, void 0, { strict: !0 });
    } catch (A) {
      throw c.error("Failed to parse HTTP response", { err: A }), new ve("bad response", b.status, { cause: A });
    }
  } finally {
    clearTimeout(v), x?.();
  }
}
function Td(e) {
  if (!e) return { detail: "bad response" };
  let t;
  try {
    t = Mt.parse(e, void 0, { strict: !0 });
  } catch {
    return { detail: e };
  }
  return typeof t == "object" && t && ("detail" in t || "code" in t || "error" in t) ? t : { detail: t };
}
function Ya(e, t) {
  let n = /* @__PURE__ */ new Map();
  for (let r of [e, t]) for (let [i, s] of Object.entries(r ?? {})) n.set(i.toLowerCase(), [i, s]);
  return Object.fromEntries(n.values());
}
async function Ja(e) {
  let t = e.onResponseMeta, n = _n.onResponseMeta, r = {
    ...e,
    ..._n
  };
  for (let i of Object.keys(yd)) e[i] !== void 0 && (r[i] = e[i]);
  if (r.requestTimeout === void 0 && (r.requestTimeout = kd), r.headers = Ya(_n.headers, e.headers), t && n && t !== n) {
    let i = r.logger ?? tr;
    r.onResponseMeta = (s) => {
      rt(t, s, i, {
        op: "request.onResponseMeta",
        scope: "per-request",
        endpoint: sn(e.endpoint)
      }), rt(n, s, i, {
        op: "request.onResponseMeta",
        scope: "global",
        endpoint: sn(e.endpoint)
      });
    };
  }
  return await Md(r);
}
var Un;
typeof WebSocket < "u" && (Un = WebSocket);
function Wf(e) {
  Un = e;
}
function Bd() {
  if (Un === void 0) throw new h("WebSocket implementation not initialized");
  return Un;
}
var qd = 1006, Od = class {
  constructor(e) {
    this.next = null, this.value = e;
  }
}, Pd = class {
  constructor() {
    this._first = null, this._last = null, this.size = 0;
  }
  enqueue(e) {
    let t = new Od(e);
    return this._last ? this._last.next = t : this._first = t, this._last = t, this.size++, !0;
  }
  dequeue() {
    if (!this._first) return null;
    let e = this._first;
    return this._first = e.next, this._first || (this._last = null), this.size--, e.value;
  }
}, Cd = class {
  constructor(e, t) {
    this.subListeners = {}, this.rpcListeners = {}, this.rpcId = 0, this.onCloseCallbacks = [], this._WS = Bd(), this.url = new URL(e), this.messageQueue = new Pd(), this._logger = t ?? ut;
  }
  setLogger(e) {
    this._logger = e;
  }
  connect(e = 1e4) {
    return this.connectionPromise || (this.connectionPromise = new Promise((t, n) => {
      let r = !1, i = !1, s = null, o = (d) => {
        i || (i = !0, s && clearTimeout(s), this.abandonConnect = void 0, d());
      };
      this.abandonConnect = (d) => o(() => n(d));
      let a = (d) => {
        if (this.ws) {
          try {
            this.ws.onopen = null, this.ws.onerror = null, this.ws.onmessage = null, this.ws.onclose = null;
          } catch {
          }
          try {
            this.ws.close();
          } catch {
          }
          this.ws = void 0, this.stopMessageHandling(d);
        }
      }, u = (d) => {
        this.connectionPromise = void 0;
        let f = d instanceof Error ? d : new h(String(d), { cause: d });
        a(f), this.failPendingRpc(f), o(() => n(f));
      }, l;
      try {
        l = new this._WS(this.url.toString()), this.ws = l;
      } catch (d) {
        u(d);
        return;
      }
      let c = () => this.ws === l;
      s = setTimeout(() => {
        u(new h(`WebSocket connect timeout after ${e}ms`));
      }, e), l.onopen = () => {
        c() && (r = !0, o(t));
      }, l.onerror = (d) => {
        if (c()) {
          if (!r) {
            u(new h("Failed to open WebSocket"));
            return;
          }
          this._logger.error("WebSocket error after open", { ev: d });
        }
      }, l.onmessage = (d) => {
        if (c()) {
          if (this.messageQueue.size >= 1e4) {
            this._logger.error("WebSocket message queue exceeded its bound, closing connection", { size: this.messageQueue.size });
            let f = new h("WebSocket message queue exceeded its bound");
            u(f);
            let p = {
              code: qd,
              reason: f.message,
              wasClean: !1
            };
            this.onCloseCallbacks.forEach((g) => rt(g, p, this._logger));
            return;
          }
          this.messageQueue.enqueue(d.data), this.handlingInterval || (this.handlingInterval = setInterval(this.handleNextMessage.bind(this), 0));
        }
      }, l.onclose = (d) => {
        if (this.ws && this.ws !== l) return;
        if (this.connectionPromise = void 0, !r) {
          let w = d?.reason ? `, ${d.reason}` : "";
          u(new h(`WebSocket closed before open (code ${d?.code ?? 0}${w})`));
          return;
        }
        let f = d?.reason ? `, ${d.reason}` : "", p = d?.code ?? 0, g = typeof d.wasClean == "boolean" ? d.wasClean : !0, m = new h(`WebSocket closed (code ${p}${f})`);
        this.stopMessageHandling(m), !g || p !== 1e3 && p !== 1001 ? this.failPendingRpc(m) : this.rpcListeners = {}, this.onCloseCallbacks.forEach((w) => rt(w, d, this._logger));
      };
    })), this.connectionPromise;
  }
  sendRequest(e, t) {
    if (this.ws?.readyState !== this._WS.OPEN) {
      if (e === "unsubscribe") return;
      throw this._logger.error("Attempted sendRequest, but socket was not open"), new h("Socket not open");
    }
    let n = this.rpcId;
    this.rpcId++, this.sendRpcMessage(e, t, n);
  }
  addSubListener(e, t, n) {
    (this.subListeners[e] = this.subListeners[e] || []).push({
      callback: t,
      errorCallback: n
    });
  }
  stopMessageHandling(e) {
    for (this.handlingInterval && (clearInterval(this.handlingInterval), this.handlingInterval = void 0); this.messageQueue.size > 0; ) this.messageQueue.dequeue();
    let t = this.subListeners;
    this.subListeners = {};
    for (let n of Object.values(t)) for (let { errorCallback: r } of n) rt(r, e, this._logger);
  }
  failPendingRpc(e) {
    let t = this.rpcListeners;
    this.rpcListeners = {};
    for (let n of Object.keys(t)) rt(t[n].errorCallback, e, this._logger);
  }
  sendRpcMessage(e, t, n) {
    if (this.ws?.readyState !== this._WS.OPEN) throw new h("Socket not open");
    let r = JSON.stringify({
      jsonrpc: "2.0",
      method: e,
      params: t,
      id: n
    });
    try {
      this.ws.send(r);
    } catch (i) {
      this._logger.error("WebSocket send failed", { e: i }), this.connectionPromise = void 0;
      try {
        this.ws.close();
      } catch {
      }
      this.ws = void 0;
      let s = i instanceof Error ? i : new h(String(i), { cause: i });
      throw this.stopMessageHandling(s), this.failPendingRpc(s), s;
    }
  }
  addRpcListener(e, t, n) {
    this.rpcListeners[n] = {
      callback: e,
      errorCallback: t
    };
  }
  removeRpcListener(e) {
    delete this.rpcListeners[e];
  }
  removeListener(e, t) {
    if (this.subListeners[e]) {
      if (this.subListeners[e].length === 1) {
        delete this.subListeners[e];
        return;
      }
      this.subListeners[e] = this.subListeners[e].filter((n) => n.callback !== t);
    }
  }
  async ensureConnection(e) {
    this.ws?.readyState !== this._WS.OPEN && await this.connect(e);
  }
  handleNextMessage() {
    for (; this.messageQueue.size > 0; ) {
      let e = this.messageQueue.dequeue();
      try {
        let t = Mt.parse(e, void 0, { strict: !0 });
        if ("result" in t && t.id != null) this.rpcListeners[t.id] && (this.rpcListeners[t.id].callback(), this.removeRpcListener(t.id));
        else if ("error" in t && t.id != null) {
          if (this.rpcListeners[t.id]) {
            let { errorCallback: n } = this.rpcListeners[t.id];
            rt(n, new h(t.error.message), this._logger), this.removeRpcListener(t.id);
          }
        } else if ("method" in t && !("id" in t)) {
          let n = t.params?.subId;
          if (!n) continue;
          if (this.subListeners[n]?.length > 0) {
            let r = t;
            this.subListeners[n].forEach(({ callback: i }) => {
              try {
                let s = i(r.params?.payload);
                s && typeof s.then == "function" && Promise.resolve(s).catch((o) => {
                  this._logger.error("Subscription handler threw", { e: o });
                });
              } catch (s) {
                this._logger.error("Subscription handler threw", { e: s });
              }
            });
          }
        }
      } catch (t) {
        this._logger.error("Error doing handleNextMessage", { e: t });
      }
    }
    this.handlingInterval && (clearInterval(this.handlingInterval), this.handlingInterval = void 0);
  }
  createSubscription(e, t, n) {
    if (this.ws?.readyState !== this._WS.OPEN) throw this._logger.error("Attempted createSubscription, but socket was not open"), new h("Socket is not open");
    let r = (Math.random() + 1).toString(36).substring(7), i = this.rpcId;
    this.addRpcListener(() => {
      this.addSubListener(r, t, n);
    }, n, i);
    try {
      this.sendRequest("subscribe", {
        ...e,
        subId: r
      });
    } catch (s) {
      throw this.removeRpcListener(i), s;
    }
    return r;
  }
  cancelSubscription(e, t, n) {
    if (this.removeListener(e, t), this.ws?.readyState !== this._WS.OPEN) {
      this._logger.info("Socket not open, removed listener locally {subId}", { subId: e });
      return;
    }
    let r = this.rpcId;
    this.rpcId++, this.addRpcListener(() => {
      this._logger.info("Unsubscribed {subId}", { subId: e });
    }, n || ((i) => this._logger.info("Unsubscribe failed", { e: i })), r);
    try {
      this.sendRpcMessage("unsubscribe", { subId: e }, r);
    } catch (i) {
      throw this.removeRpcListener(r), i;
    }
  }
  get activeSubscriptions() {
    return Object.keys(this.subListeners);
  }
  close() {
    let e = new h("WebSocket closed");
    if (this.abandonConnect?.(e), this.ws) {
      try {
        this.ws.close();
      } catch {
      }
      this.ws = void 0;
    }
    this.connectionPromise = void 0, this.failPendingRpc(e), this.stopMessageHandling(e);
  }
  onClose(e) {
    this.onCloseCallbacks.push(e);
  }
};
function Pt(e) {
  return Array.isArray(e) ? "array" : typeof e;
}
function ge(e) {
  return typeof e != "string" || e.length < 16 ? "(hidden)" : `${e.slice(0, 4)}...${e.slice(-4)}`;
}
var Si = class {
  constructor(e, t) {
    this._lastResponseMetadata = void 0, this._captureResponseMetadata = (n) => {
      this._lastResponseMetadata = n;
    }, this._mintUrl = Xn(e), this._request = t?.customRequest ?? Ja, this._authProvider = t?.authProvider, this._logger = t?.logger ?? ut, wd(this._logger);
  }
  get mintUrl() {
    return this._mintUrl;
  }
  get lastResponseMetadata() {
    return this._lastResponseMetadata;
  }
  async oidcAuth(e) {
    let t = (await this.getLazyMintInfo()).nuts[21];
    if (!t?.openid_discovery) throw new h("Mint: no NUT-21 openid_discovery");
    return new dd(t.openid_discovery, {
      ...e,
      clientId: e?.clientId ?? t.client_id ?? "cashu-client"
    });
  }
  async getInfo(e) {
    let t = await (e ?? this._request)({
      endpoint: Rt(this._mintUrl, "/v1/info"),
      onResponseMeta: this._captureResponseMetadata,
      logger: this._logger
    });
    return se.normalizeInfo(t, this._logger);
  }
  async getLazyMintInfo(e) {
    if (this._mintInfo) return this._mintInfo;
    let t = await this.getInfo(e);
    return this._mintInfo = new se(t, this._logger), this._mintInfo;
  }
  setMintInfo(e) {
    this._mintInfo = e instanceof se ? e : new se(e, this._logger);
  }
  async swap(e, t) {
    nt(!Array.isArray(e?.inputs), "swap: inputs must be an array of proofs", this._logger);
    let n = await this.requestWithAuth("POST", "/v1/swap", { requestBody: {
      ...e,
      inputs: this.stripWalletFields(e.inputs)
    } }, t);
    if (!Nt(n) || !Array.isArray(n?.signatures)) throw this._logger.error("Invalid response from mint...", {
      type: Pt(n),
      op: "swap"
    }), new h("Invalid response from mint");
    return this.assertSignatureCount(n.signatures, e.outputs, "swap"), n.signatures = this.normalizeSignatureAmounts(n.signatures), n;
  }
  async createMintQuote(e, t, n) {
    nt(!this.isValidMethodString(e), `Invalid mint quote method: ${e}`, this._logger);
    let r = await this.requestWithAuth("POST", `/v1/mint/quote/${e}`, { requestBody: t }, n?.customRequest);
    return this.normalizeMintQuoteResponse(e, r, n?.normalize);
  }
  async createMintQuoteBolt11(e, t) {
    return this.createMintQuote("bolt11", {
      ...e,
      amount: k.from(e.amount).toBigInt()
    }, { customRequest: t });
  }
  async createMintQuoteBolt12(e, t) {
    let n = { ...e };
    return e.amount !== void 0 && (n.amount = k.from(e.amount).toBigInt()), this.createMintQuote("bolt12", n, { customRequest: t });
  }
  async createMintQuoteOnchain(e, t) {
    return this.createMintQuote("onchain", e, { customRequest: t });
  }
  async checkMintQuote(e, t, n) {
    nt(!this.isValidMethodString(e), `Invalid mint quote method: ${e}`, this._logger);
    let r = await this.requestWithAuth("GET", `/v1/mint/quote/${e}/${t}`, {}, n?.customRequest), i = this.normalizeMintQuoteResponse(e, r, n?.normalize);
    if (i.quote !== t) throw this._logger.error("Invalid response from mint...", {
      op: `checkMintQuote.${e}`,
      expected: ge(t),
      received: ge(i.quote)
    }), new h("Mint quote response is for a different quote");
    return i;
  }
  async checkMintQuoteBolt11(e, t) {
    return this.checkMintQuote("bolt11", e, { customRequest: t });
  }
  async checkMintQuoteBolt12(e, t) {
    return this.checkMintQuote("bolt12", e, { customRequest: t });
  }
  async checkMintQuoteOnchain(e, t) {
    return this.checkMintQuote("onchain", e, { customRequest: t });
  }
  async checkMintQuoteBatch(e, t, n) {
    nt(!this.isValidMethodString(e), `Invalid mint quote method: ${e}`, this._logger), nt(t.length === 0, "checkMintQuoteBatch: no quote ids provided", this._logger), nt(new Set(t).size !== t.length, "checkMintQuoteBatch: duplicate quote ids provided", this._logger);
    let r = await this.requestWithAuth("POST", `/v1/mint/quote/${e}/check`, { requestBody: { quotes: t } }, n?.customRequest);
    if (!Array.isArray(r) || r.length !== t.length) throw this._logger.error("Invalid response from mint...", {
      expectedCount: t.length,
      actualCount: Array.isArray(r) ? r.length : void 0,
      op: `checkMintQuoteBatch.${e}`
    }), new h("Invalid response from mint");
    return r.map((i, s) => {
      if (i.quote !== t[s]) throw this._logger.error("Invalid response from mint...", {
        index: s,
        op: `checkMintQuoteBatch.${e}`
      }), new h("Invalid response from mint");
      return this.normalizeMintQuoteResponse(e, i, n?.normalize);
    });
  }
  async checkMintQuoteBatchBolt11(e, t) {
    return this.checkMintQuoteBatch("bolt11", e, { customRequest: t });
  }
  async checkMintQuoteBatchBolt12(e, t) {
    return this.checkMintQuoteBatch("bolt12", e, { customRequest: t });
  }
  async mintBolt11(e, t) {
    return this.mint("bolt11", e, { customRequest: t });
  }
  async mintBolt12(e, t) {
    return this.mint("bolt12", e, { customRequest: t });
  }
  async mintOnchain(e, t) {
    return this.mint("onchain", e, { customRequest: t });
  }
  async mint(e, t, n) {
    nt(!this.isValidMethodString(e), `Invalid mint method: ${e}`, this._logger);
    let r = await this.requestWithAuth("POST", `/v1/mint/${e}`, { requestBody: t }, n?.customRequest);
    if (!Nt(r) || !Array.isArray(r?.signatures)) throw this._logger.error("Invalid response from mint...", {
      type: Pt(r),
      op: `mint.${e}`
    }), new h("Invalid response from mint");
    return this.assertSignatureCount(r.signatures, t.outputs, `mint.${e}`), r.signatures = this.normalizeSignatureAmounts(r.signatures), n?.normalize ? n.normalize(r) : r;
  }
  async mintBatchBolt11(e, t) {
    return this.mintBatch("bolt11", e, { customRequest: t });
  }
  async mintBatchBolt12(e, t) {
    return this.mintBatch("bolt12", e, { customRequest: t });
  }
  async mintBatch(e, t, n) {
    nt(!this.isValidMethodString(e), `Invalid mint method: ${e}`, this._logger);
    let r = {
      ...t,
      quote_amounts: t.quote_amounts.map((s) => k.from(s).toBigInt())
    }, i = await this.requestWithAuth("POST", `/v1/mint/${e}/batch`, { requestBody: r }, n?.customRequest);
    if (!Nt(i) || !Array.isArray(i?.signatures)) throw this._logger.error("Invalid response from mint...", {
      type: Pt(i),
      op: `mintBatch.${e}`
    }), new h("Invalid response from mint");
    return this.assertSignatureCount(i.signatures, t.outputs, `mintBatch.${e}`), i.signatures = this.normalizeSignatureAmounts(i.signatures), n?.normalize ? n.normalize(i) : i;
  }
  async createMeltQuote(e, t, n) {
    nt(!this.isValidMethodString(e), `Invalid melt quote method: ${e}`, this._logger);
    let r = await this.requestWithAuth("POST", `/v1/melt/quote/${e}`, { requestBody: t }, n?.customRequest);
    return this.normalizeMeltQuoteResponse(e, r, n?.normalize);
  }
  async createMeltQuoteBolt11(e, t) {
    let n = await this.createMeltQuote("bolt11", this.normalizeMeltQuoteRequestOptions(e), { customRequest: t });
    return nt(n.request !== "" && n.request.toLowerCase() !== e.request.toLowerCase(), "Melt quote is for a different payment request", this._logger), n;
  }
  async createMeltQuoteBolt12(e, t) {
    return this.createMeltQuote("bolt12", this.normalizeMeltQuoteRequestOptions(e), { customRequest: t });
  }
  async createMeltQuoteOnchain(e, t) {
    return this.createMeltQuote("onchain", {
      ...e,
      amount: k.from(e.amount).toBigInt()
    }, { customRequest: t });
  }
  async checkMeltQuote(e, t, n) {
    nt(!this.isValidMethodString(e), `Invalid melt quote method: ${e}`, this._logger);
    let r = await this.requestWithAuth("GET", `/v1/melt/quote/${e}/${t}`, {}, n?.customRequest), i = this.normalizeMeltQuoteResponse(e, r, n?.normalize);
    if (i.quote !== t) throw this._logger.error("Invalid response from mint...", {
      op: `checkMeltQuote.${e}`,
      expected: ge(t),
      received: ge(i.quote)
    }), new h("Melt quote response is for a different quote");
    return i;
  }
  async checkMeltQuoteBolt11(e, t) {
    return this.checkMeltQuote("bolt11", e, { customRequest: t });
  }
  async checkMeltQuoteBolt12(e, t) {
    return this.checkMeltQuote("bolt12", e, { customRequest: t });
  }
  async checkMeltQuoteOnchain(e, t) {
    return this.checkMeltQuote("onchain", e, { customRequest: t });
  }
  async melt(e, t, n) {
    nt(!this.isValidMethodString(e), `Invalid melt method: ${e}`, this._logger), nt(!Array.isArray(t?.inputs), "melt: inputs must be an array of proofs", this._logger);
    let r = await this.requestWithAuth("POST", `/v1/melt/${e}`, { requestBody: {
      ...t,
      inputs: this.stripWalletFields(t.inputs)
    } }, n?.customRequest), i = this.normalizeMeltQuoteResponse(e, r, n?.normalize, !0);
    return i.quote !== t.quote && (this._logger.warn("Melt response reports a different quote id", {
      op: `melt.${e}`,
      expected: ge(t.quote),
      received: ge(i.quote)
    }), i.quote = t.quote), i;
  }
  async meltBolt11(e, t) {
    return this.melt("bolt11", e, t);
  }
  async meltBolt12(e, t) {
    return this.melt("bolt12", e, t);
  }
  async meltOnchain(e, t) {
    return this.melt("onchain", e, t);
  }
  async check(e, t) {
    let n = await this.requestWithAuth("POST", "/v1/checkstate", { requestBody: e }, t);
    if (!Nt(n) || !Array.isArray(n?.states) || n.states.length > e.Ys.length) throw this._logger.error("Invalid response from mint...", {
      type: Pt(n),
      op: "check"
    }), new h("Invalid response from mint");
    this.assertRecordEntries(n.states, "check");
    for (let r of n.states) Qe(r, "witness");
    return n;
  }
  async getKeys(e, t, n) {
    let r = t || this._mintUrl;
    e && (e = e.replace(/\//g, "_").replace(/\+/g, "-"));
    let i = await (n ?? this._request)({
      endpoint: e ? Rt(r, "/v1/keys", e) : Rt(r, "/v1/keys"),
      onResponseMeta: this._captureResponseMetadata,
      logger: this._logger
    });
    if (!Nt(i) || !Array.isArray(i.keysets)) throw this._logger.error("Invalid response from mint...", {
      type: Pt(i),
      op: "getKeys"
    }), new h("Invalid response from mint");
    return this.assertKeysetList(i.keysets, "getKeys"), {
      ...i,
      keysets: i.keysets.map((s) => ki(s))
    };
  }
  async getKeySets(e) {
    let t = await (e ?? this._request)({
      endpoint: Rt(this._mintUrl, "/v1/keysets"),
      onResponseMeta: this._captureResponseMetadata,
      logger: this._logger
    });
    if (!Nt(t) || !Array.isArray(t.keysets)) throw this._logger.error("Invalid response from mint...", {
      type: Pt(t),
      op: "getKeySets"
    }), new h("Invalid response from mint");
    return this.assertKeysetList(t.keysets, "getKeySets"), {
      ...t,
      keysets: t.keysets.map((n) => vi(n))
    };
  }
  async restore(e, t) {
    let n = await (t ?? this._request)({
      endpoint: Rt(this._mintUrl, "/v1/restore"),
      method: "POST",
      requestBody: e,
      onResponseMeta: this._captureResponseMetadata,
      logger: this._logger
    });
    if (!Nt(n) || !Array.isArray(n?.outputs) || !Array.isArray(n?.signatures) || n.outputs.length !== n.signatures.length || n.outputs.length > e.outputs.length) throw this._logger.error("Invalid response from mint...", {
      type: Pt(n),
      op: "restore"
    }), new h("Invalid response from mint");
    return n.outputs = this.normalizeMessageAmounts(n.outputs), n.signatures = this.normalizeSignatureAmounts(n.signatures), n;
  }
  async connectWebSocket() {
    try {
      let e = new URL(this._mintUrl), t = "v1/ws";
      e.pathname.endsWith("/") ? e.pathname += t : e.pathname += "/" + t, e.protocol = e.protocol === "https:" ? "wss:" : "ws:";
      let n = e.toString();
      this.ws || (this.ws = new Cd(n, this._logger)), await this.ws.ensureConnection();
    } catch (e) {
      this._logger.error("Failed to connect to WebSocket...", { e });
      try {
        this.ws?.close();
      } catch {
      }
      throw this.ws = void 0, new h("Failed to connect to WebSocket...", { cause: e });
    }
  }
  disconnectWebSocket() {
    this.ws && this.ws.close();
  }
  get webSocketConnection() {
    return this.ws;
  }
  async handleClearAuth(e, t, n) {
    if (this._authProvider && (n ?? await this.getLazyMintInfo()).requiresClearAuthToken(e, t)) return this._authProvider.ensureCAT ? this._authProvider.ensureCAT() : this._authProvider.getCAT();
  }
  async handleBlindAuth(e, t, n) {
    if (this._authProvider && (n ?? await this.getLazyMintInfo()).requiresBlindAuthToken(e, t)) return await this._authProvider.getBlindAuthToken({
      method: e,
      path: t
    });
  }
  async requestWithAuth(e, t, n = {}, r) {
    let i = r ?? this._request, s = this._mintInfo;
    this._authProvider && (s = await this.getLazyMintInfo(r));
    let o = await this.handleBlindAuth(e, t, s), a = await this.handleClearAuth(e, t, s), u = {
      ...n.headers ?? {},
      ...o ? { "Blind-auth": o } : {},
      ...a ? { "Clear-auth": a } : {}
    }, l = s?.isSupported(19);
    return i({
      ...n,
      endpoint: Rt(this._mintUrl, t),
      method: e,
      headers: u,
      ...o || a || n.requestBody ? { redirect: "error" } : {},
      ...l?.supported && l.params ? l.params : {},
      onResponseMeta: this._captureResponseMetadata,
      logger: n.logger ?? this._logger
    });
  }
  normalizeMeltQuoteRequestOptions(e) {
    if (!e.options) return { ...e };
    let t = { ...e.options };
    return e.options.amountless && (t.amountless = { amount_msat: k.from(e.options.amountless.amount_msat).toBigInt() }), "mpp" in e.options && e.options.mpp && (t.mpp = { amount: k.from(e.options.mpp.amount).toBigInt() }), {
      ...e,
      options: t
    };
  }
  isValidMethodString(e) {
    return !!(typeof e == "string" && /^[a-z0-9_-]+$/.test(e));
  }
  normalizeSignatureAmounts(e) {
    return this.assertRecordEntries(e, "signatures"), e.map((t) => ({
      ...t,
      amount: k.from(t.amount)
    }));
  }
  normalizeMessageAmounts(e) {
    return this.assertRecordEntries(e, "outputs"), e.map((t) => ({
      ...t,
      amount: k.from(t.amount)
    }));
  }
  stripWalletFields(e) {
    return e.map((t) => {
      let { dleq: n, p2pk_e: r, ...i } = t;
      return i;
    });
  }
  assertRecordEntries(e, t) {
    if (!e.every((n) => vt(n))) throw this._logger.error("Invalid response from mint...", {
      entries: e.length,
      op: t
    }), new h("Invalid response from mint");
  }
  assertSignatureCount(e, t, n) {
    if (!(e.length <= t.length)) throw this._logger.error("Invalid response from mint...", {
      signatures: e.length,
      outputs: t.length,
      op: n
    }), new h(`Invalid response from mint: ${e.length} signatures, expected ${t.length}. The operation may already have been applied; if the wallet is seeded, try restoring (NUT-09) to recover.`);
  }
  assertKeysetList(e, t) {
    if (e.length > 1e4) throw this._logger.error("Invalid response from mint...", {
      keysets: e.length,
      op: t
    }), new h("Invalid response from mint");
    this.assertRecordEntries(e, t);
  }
  normalizeMintQuoteResponse(e, t, n) {
    let r = `${e} mint quote`;
    if (!vt(t)) throw this._logger.error("Invalid response from mint...", {
      type: Pt(t),
      op: r
    }), new h("Invalid response from mint");
    let i = { ...t };
    return this.normalizeMintBaseFields(i), e === "bolt11" ? this.normalizeMintQuoteBolt11Fields(i) : e === "bolt12" ? this.normalizeMintQuoteBolt12Fields(i) : e === "onchain" && this.normalizeMintQuoteOnchainFields(i), n ? n(i) : i;
  }
  normalizeMintBaseFields(e) {
    e.amount_paid != null && e.amount_issued != null && (e.amount_paid = k.from(e.amount_paid), e.amount_issued = k.from(e.amount_issued)), e.updated_at = pt(e.updated_at, "mintQuote.updated_at", null);
  }
  deriveMintQuoteState(e, t) {
    return e.isZero() && t.isZero() ? He.UNPAID : e.greaterThan(t) ? He.PAID : He.ISSUED;
  }
  normalizeMintQuoteBolt11Fields(e) {
    e.amount = k.from(e.amount), e.expiry = pt(e.expiry, "mintQuoteBolt11.expiry", null), (typeof e.state != "string" || !Object.values(He).includes(e.state)) && e.amount_paid instanceof k && e.amount_issued instanceof k && (e.state = this.deriveMintQuoteState(e.amount_paid, e.amount_issued));
  }
  normalizeMintQuoteBolt12Fields(e) {
    Qe(e, "amount"), e.amount = e.amount === null ? null : k.from(e.amount), e.expiry = pt(e.expiry, "mintQuoteBolt12.expiry", null), e.amount_paid = k.from(e.amount_paid), e.amount_issued = k.from(e.amount_issued);
  }
  normalizeMintQuoteOnchainFields(e) {
    e.expiry = pt(e.expiry, "mintQuoteOnchain.expiry", null), e.amount_paid = k.from(e.amount_paid), e.amount_issued = k.from(e.amount_issued);
  }
  normalizeMeltQuoteResponse(e, t, n, r = !1) {
    let i = `${e} melt quote`;
    if (!vt(t)) throw this._logger.error("Invalid response from mint...", {
      type: Pt(t),
      op: i
    }), new h("Invalid response from mint");
    let s = { ...t };
    return r && ((s.request == null || s.request === "") && delete s.request, s.fee_reserve ?? delete s.fee_reserve), this.normalizeMeltBaseFields(s, i), e === "bolt11" || e === "bolt12" ? this.normalizeMeltBoltFields(s, e, i, r) : e === "onchain" && this.normalizeMeltOnchainFields(s, r), n ? n(s) : s;
  }
  normalizeMeltBaseFields(e, t) {
    if (e.amount = k.from(e.amount), e.expiry = pt(e.expiry, "meltQuote.expiry", void 0), e.change) {
      if (!Array.isArray(e.change) || e.change.length > 1024) throw this._logger.error("Invalid response from mint...", {
        type: Pt(e.change),
        op: t
      }), new h("Invalid response from mint");
      e.change = this.normalizeSignatureAmounts(e.change);
    }
    if (!Nt(e) || typeof e.quote != "string" || !(e.amount instanceof k) || typeof e.unit != "string" || typeof e.state != "string" || typeof e.expiry != "number" || !Object.values(Va).includes(e.state)) throw this._logger.error("Invalid response from mint...", { op: t }), new h("Invalid response from mint");
  }
  normalizeMeltBoltFields(e, t, n, r) {
    let i = (s) => r && e[s] === void 0;
    if (!i("fee_reserve") && e.fee_reserve != null && (e.fee_reserve = k.from(e.fee_reserve)), typeof e.request != "string" && !i("request") || !(e.fee_reserve instanceof k) && !i("fee_reserve")) throw this._logger.error("Invalid response from mint...", { op: n }), new h("Invalid response from mint");
    Ga(e, t, this._logger, n);
  }
  normalizeMeltOnchainFields(e, t) {
    if (t && e.fee_options === void 0) {
      Qe(e, "selected_fee_index", "outpoint");
      return;
    }
    if (!Array.isArray(e.fee_options) || e.fee_options.length === 0 || e.fee_options.length > 1024 || (e.fee_options = e.fee_options.map((n) => {
      let r = n;
      if (!Number.isSafeInteger(r.fee_index)) throw this._logger.error("Invalid response from mint...", { op: "onchain melt quote" }), new h("Invalid response from mint");
      return {
        ...r,
        fee_index: r.fee_index,
        fee_reserve: k.from(r.fee_reserve),
        estimated_blocks: r.estimated_blocks
      };
    }), Qe(e, "selected_fee_index", "outpoint"), typeof e.request != "string" || e.selected_fee_index !== null && !Number.isSafeInteger(e.selected_fee_index) || e.outpoint !== null && typeof e.outpoint != "string")) throw this._logger.error("Invalid response from mint...", { op: "onchain melt quote" }), new h("Invalid response from mint");
  }
}, gr = class Rr {
  constructor(t, n, r, i, s) {
    this._keys = {}, this._id = t, this._unit = n, this._active = r, this._input_fee_ppk = i, this._final_expiry = s;
  }
  get id() {
    return this._id;
  }
  get unit() {
    return this._unit;
  }
  get isActive() {
    return this._active;
  }
  get fee() {
    return this._input_fee_ppk ?? 0;
  }
  get expiry() {
    return this._final_expiry;
  }
  get hasKeys() {
    return Object.keys(this._keys).length > 0;
  }
  get hasHexId() {
    return Me(this._id) && !On(this._id);
  }
  get version() {
    return this.hasHexId ? F(this._id)[0] : -1;
  }
  get keys() {
    return this._keys;
  }
  set keys(t) {
    this._keys = t;
  }
  toMintKeyset() {
    return {
      id: this._id,
      unit: this._unit,
      active: this._active,
      input_fee_ppk: this._input_fee_ppk,
      final_expiry: this._final_expiry
    };
  }
  toMintKeys() {
    return this.hasKeys ? {
      id: this._id,
      unit: this._unit,
      active: this._active,
      input_fee_ppk: this._input_fee_ppk,
      final_expiry: this._final_expiry,
      keys: this._keys
    } : null;
  }
  verify() {
    return this.hasKeys ? Rr.verifyKeysetId(this.toMintKeys()) : !1;
  }
  static verifyKeysetId(t) {
    try {
      let n = t.keys ? Object.keys(t.keys).length : 0;
      if (n === 0 || n > 256 || new Set(Object.values(t.keys).map((s) => s.toLowerCase())).size !== n) return !1;
      let r = On(t.id), i = !r && Me(t.id) ? F(t.id)[0] : 0;
      return Da(t.keys, {
        input_fee_ppk: t.input_fee_ppk,
        expiry: t.final_expiry,
        unit: t.unit,
        versionByte: i,
        isDeprecatedBase64: r
      }) === t.id;
    } catch {
      return !1;
    }
  }
  static fromMintApi(t, n) {
    let r = vi(t), i = n ? ki(n) : void 0, s = new Rr(r.id, r.unit, r.active, r.input_fee_ppk, r.final_expiry);
    if (i) {
      if (i.id !== r.id) throw new h(`Mismatched keyset ids: meta=${r.id}, keys=${i.id}`);
      if (i.unit !== r.unit) throw new h(`Mismatched keyset units: meta=${r.unit}, keys=${i.unit}`);
      if (i.final_expiry !== void 0 && r.final_expiry !== void 0 && i.final_expiry !== r.final_expiry) throw new h(`Mismatched keyset expiry for id=${r.id}`);
      s.keys = i.keys;
    }
    return s;
  }
}, $r = class Sn {
  assertInitialized() {
    nt(Object.keys(this.keysets).length === 0, "KeyChain not initialized", this._logger);
  }
  constructor(t, n, r = ut) {
    this.keysets = /* @__PURE__ */ Object.create(null), this.pendingKeyFetches = /* @__PURE__ */ new Map(), this.generation = 0, this.refreshSeq = 0, this.mint = typeof t == "string" ? new Si(t) : t, this.unit = n, this._logger = r;
  }
  static fromCache(t, n, r, i) {
    let s = new Sn(t, n, i);
    return s.loadFromCache(r), s;
  }
  static mintToCacheDTO(t, n, r) {
    let i = new Map(r.map((s) => [s.id, s]));
    return {
      keysets: n.map((s) => {
        let o = i.get(s.id), a = { ...s };
        return o && (a.keys = { ...o.keys }), a;
      }),
      mintUrl: t,
      savedAt: Date.now()
    };
  }
  static cacheToMintDTO(t) {
    return {
      keysets: t.keysets.map((n) => ({
        id: n.id,
        unit: n.unit,
        active: n.active,
        input_fee_ppk: n.input_fee_ppk,
        final_expiry: n.final_expiry
      })),
      keys: t.keysets.filter((n) => !!n.keys).map((n) => ({
        id: n.id,
        unit: n.unit,
        active: n.active,
        input_fee_ppk: n.input_fee_ppk,
        final_expiry: n.final_expiry,
        keys: { ...n.keys }
      }))
    };
  }
  async init(t) {
    if (Object.keys(this.keysets).length > 0 && !t) return;
    let n = ++this.refreshSeq, [r, i] = await Promise.all([this.mint.getKeySets(), this.mint.getKeys()]);
    if (n !== this.refreshSeq) {
      this._logger.debug("Discarding keychain refresh superseded by a later one", { seq: n });
      return;
    }
    this.buildKeychain(r.keysets, i.keysets), this.savedAt = Date.now();
  }
  loadFromCache(t) {
    let n;
    try {
      n = Xn(String(t.mintUrl));
    } catch {
      n = void 0;
    }
    n !== this.mint.mintUrl && this._logger.warn(`KeyChain cache is for a different mint: ${n ?? "unknown"} (expected ${this.mint.mintUrl}). This will become an error in cashu-ts v5.`, {
      cacheMintUrl: t.mintUrl,
      mintUrl: this.mint.mintUrl
    });
    let { keysets: r, keys: i } = Sn.cacheToMintDTO(t);
    this.buildKeychain(r, i), this.savedAt = t.savedAt;
  }
  buildKeychain(t, n) {
    let r = this.keysets, i = /* @__PURE__ */ Object.create(null), s = new Map(n.map((o) => [o.id, o]));
    for (let o of t) {
      let a = s.get(o.id), u = a ? gr.fromMintApi(o, a) : gr.fromMintApi(o);
      u.verify() || (u.hasKeys && this._logger.warn("Discarding keys that do not derive their keyset id", { id: u.id }), u.keys = {});
      let l = r[o.id];
      !u.hasKeys && l?.hasKeys && l.unit === u.unit && (u.keys = { ...l.keys }, u.verify() || (this._logger.warn("Dropping carried keys: fresh metadata no longer derives the keyset id", { id: u.id }), u.keys = {})), i[u.id] = u;
    }
    this.keysets = i, this.generation++;
  }
  getKeyset(t) {
    let n = t ? this.keysets[t] : this.getCheapestKeyset();
    return We(n, `Keyset '${t}' not found`, this._logger, { keysetId: t }), n;
  }
  getCheapestKeyset() {
    this.assertInitialized();
    let t = Object.values(this.keysets).filter((i) => i.unit === this.unit && i.isActive && i.hasHexId), n = t.filter((i) => i.hasKeys && i.version <= 1);
    if (n.length === 0) {
      let i = t.filter((s) => s.version > 1);
      if (i.length > 0) {
        let s = Math.min(...i.map((o) => o.version));
        Xe(`No supported keyset for unit: ${this.unit}. The mint's active keysets are ${Nn(s)} or later; this build of cashu-ts supports up to ${Nn(1)}. Upgrade to spend on this mint.`, this._logger, {
          unit: this.unit,
          lowestVersionByte: s,
          supported: 1
        });
      }
      Xe(`No active keyset found for unit: ${this.unit}`, this._logger, { unit: this.unit });
    }
    let r = 2 ** 53 - 1;
    return n.sort((i, s) => s.version - i.version || i.fee - s.fee || (s.expiry ?? r) - (i.expiry ?? r))[0];
  }
  async ensureKeysetKeys(t) {
    let n = this.keysets[t];
    if (We(n, `Keyset '${t}' not found`, this._logger, { keysetId: t }), me(n.id, this._logger), n.hasKeys) return n;
    let r = this.pendingKeyFetches.get(t);
    if (r) return await r;
    let i = (async () => {
      let s = this.generation, o = (await this.mint.getKeys(t)).keysets.find((l) => l.id === t);
      nt(!o || !o.keys || Object.keys(o.keys).length === 0, `Mint returned no keys for keyset '${t}'`, this._logger, { keysetId: t });
      let a = n.toMintKeyset(), u = gr.fromMintApi(a, o);
      if (nt(!u.verify(), `Keyset verification failed for ID ${t}`, this._logger, { keysetId: t }), this.generation !== s) {
        this._logger.debug("Keychain refreshed during key fetch; returning the live keyset", { id: t });
        let l = this.keysets[t];
        return We(l, `Keyset '${t}' not found`, this._logger, { keysetId: t }), l;
      }
      return this.keysets[t] = u, u;
    })();
    this.pendingKeyFetches.set(t, i);
    try {
      return await i;
    } finally {
      this.pendingKeyFetches.delete(t);
    }
  }
  getKeysets() {
    this.assertInitialized();
    let t = Object.values(this.keysets).filter((n) => n.unit === this.unit);
    return nt(t.length === 0, `No keysets found for unit: ${this.unit}`, this._logger, { unit: this.unit }), t;
  }
  isUnitKeyset(t) {
    if (!t) return !1;
    let n = this.keysets[t];
    return n !== void 0 && n.unit === this.unit;
  }
  hasKeyset(t) {
    return !!t && this.keysets[t] !== void 0;
  }
  getAllKeys() {
    return this.assertInitialized(), Object.values(this.keysets).map((t) => t.toMintKeys()).filter((t) => t !== null);
  }
  getAllKeysetIds() {
    return this.assertInitialized(), Object.keys(this.keysets);
  }
  get cache() {
    let t = Object.values(this.keysets), n = t.map((s) => s.toMintKeyset()), r = t.map((s) => s.toMintKeys()).filter((s) => s !== null), i = Sn.mintToCacheDTO(this.mint.mintUrl, n, r);
    return i.savedAt = this.savedAt, i;
  }
}, Lr = class {
  constructor(e, t, n) {
    this.amountValue = k.from(e), this.B_ = t, this.id = n;
  }
  get amount() {
    return this.amountValue;
  }
  getSerializedBlindedMessage() {
    return {
      amount: this.amountValue,
      B_: this.B_.toHex(!0),
      id: this.id
    };
  }
}, Rd = /* @__PURE__ */ new Set([
  "locktime",
  "pubkeys",
  "n_sigs",
  "refund",
  "n_sigs_refund",
  "sigflag"
]);
function Xa(e) {
  if (!e || typeof e != "string") throw new h("tag key must be a non empty string");
  if (Rd.has(e)) throw new h(`additionalTags must not use reserved key "${e}"`);
}
var gt = class xn {
  constructor(t, n, r, i) {
    if (typeof n != "bigint" || n <= 0n) throw new h("OutputData: blindingFactor must be a positive bigint");
    if (!(r instanceof Uint8Array) || r.length === 0) throw new h("OutputData: secret must be a non-empty Uint8Array");
    if (t == null) throw new h("OutputData: blindedMessage is required");
    this.secret = r, this.blindingFactor = n, this.blindedMessage = t, this.ephemeralE = i;
  }
  toProof(t, n) {
    if (t == null) throw new h("Mint response is missing a signature for one of the outputs. Inputs may already be spent; if the wallet is seeded, try restoring (NUT-09) to recover.");
    if (!this.blindedMessage.amount.isZero() && t.id !== this.blindedMessage.id) throw new h(`Mint signature keyset id ${t.id} does not match output ${this.blindedMessage.id}`);
    let r;
    t.dleq && (r = {
      s: F(t.dleq.s),
      e: F(t.dleq.e),
      r: this.blindingFactor
    });
    let i = t.amount.toString(), s = wt(n.keys[i]);
    if (r) {
      let u = wt(this.blindedMessage.B_), l = wt(t.C_);
      if (!aa(r, u, l, s)) throw new h("DLEQ verification failed on mint response");
    }
    let o = Jc({
      id: t.id,
      C_: wt(t.C_)
    }, this.blindingFactor, this.secret, s), a = {
      id: t.id,
      amount: t.amount,
      C: o.C.toHex(!0),
      secret: tn(o.secret),
      ...r && { dleq: {
        s: Z(r.s),
        e: Z(r.e),
        r: Cr(this.blindingFactor)
      } }
    };
    return this.ephemeralE && (a.p2pk_e = this.ephemeralE), a;
  }
  static createP2PKData(t, n, r, i) {
    let s = Et(n, r.keys, i), o = t.blindKeys && t.sigFlag === "SIG_ALL" ? Wn() : void 0;
    return s.map((a) => this.createSingleP2PKData(t, a, r.id, o));
  }
  static createSingleP2PKData(t, n, r, i) {
    let s = k.from(n), o = Pn(t), a = Array.isArray(o.pubkey) ? o.pubkey : [o.pubkey], u = o.refundKeys ?? [], l = o.requiredSignatures ?? 1, c = o.requiredRefundSignatures ?? 1, d = o.hashlock, f = typeof d == "string" && d.length > 0, p = f ? d : a[0], g = f ? a : a.slice(1), m = u, w;
    if (t.blindKeys) {
      let { blinded: D, Ehex: W } = nh([...a, ...u], i, !f);
      f ? g = D.slice(0, a.length) : (p = D[0], g = D.slice(1, a.length)), m = D.slice(a.length), w = W;
    }
    let v = [], x = o.locktime ?? NaN;
    if (Number.isSafeInteger(x) && x >= 0 && v.push(["locktime", String(x)]), g.length > 0 && (v.push(["pubkeys", ...g]), l > 1 && v.push(["n_sigs", String(l)])), m.length > 0 && (v.push(["refund", ...m]), c > 1 && v.push(["n_sigs_refund", String(c)])), o.sigFlag == "SIG_ALL" && v.push(["sigflag", "SIG_ALL"]), o.additionalTags?.length) {
      let D = o.additionalTags.map(([W, ...T]) => (Xa(W), [W, ...T.map(String)]));
      v.push(...D);
    }
    let b = [f ? "HTLC" : "P2PK", {
      nonce: Z(zt(32)),
      data: p,
      tags: v
    }], E = JSON.stringify(b), M = [...E].length;
    if (M > 1024) throw new h(`Secret too long (${M} characters), maximum is ${Lo}`);
    let A = new TextEncoder().encode(E), { r: H, B_: C } = Ge(A);
    return new xn(new Lr(s, C, r).getSerializedBlindedMessage(), H, A, w);
  }
  static createRandomData(t, n, r) {
    return Et(t, n.keys, r).map((i) => this.createSingleRandomData(i, n.id));
  }
  static createSingleRandomData(t, n) {
    let r = k.from(t), i = Z(zt(32)), s = new TextEncoder().encode(i), { r: o, B_: a } = Ge(s);
    return new xn(new Lr(r, a, n).getSerializedBlindedMessage(), o, s);
  }
  static createDeterministicData(t, n, r, i, s) {
    let o = Et(t, i.keys, s), a = la(n, i.id);
    return o.map((u, l) => bs(u, i.id, a(r + l)));
  }
  static createSingleDeterministicData(t, n, r, i) {
    return bs(t, i, mi(n, i, r));
  }
  static sumOutputAmounts(t) {
    return k.sum(t.map((n) => n.blindedMessage.amount));
  }
  static serialize(t) {
    return {
      blindedMessage: {
        amount: t.blindedMessage.amount.toString(),
        B_: t.blindedMessage.B_,
        id: t.blindedMessage.id
      },
      blindingFactor: t.blindingFactor.toString(),
      secret: Z(t.secret),
      ...t.ephemeralE && { ephemeralE: t.ephemeralE }
    };
  }
  static deserialize(t) {
    try {
      if (!/^(0|[1-9]\d*)$/.test(t.blindingFactor)) throw new h("blindingFactor must be a canonical decimal integer");
      let n = F(t.secret);
      tn(n);
      let r = BigInt(t.blindingFactor), { B_: i } = Ge(n, r);
      if (i.toHex(!0) !== t.blindedMessage.B_.toLowerCase()) throw new h("stored output does not match its secret. Inputs may already be spent; if the wallet is seeded, try restoring (NUT-09) to recover.");
      return new xn({
        amount: k.from(t.blindedMessage.amount),
        B_: t.blindedMessage.B_,
        id: t.blindedMessage.id
      }, r, n, t.ephemeralE ? wt(t.ephemeralE).toHex(!0) : void 0);
    } catch (n) {
      throw new h(`Invalid SerializedOutputData: ${n instanceof Error ? n.message : String(n)}`, { cause: n });
    }
  }
};
function bs(e, t, n) {
  let r = k.from(e), i = Z(n.secret), s = new TextEncoder().encode(i), { r: o, B_: a } = Ge(s, xt(n.blindingFactor));
  return new gt(new Lr(r, a, t).getSerializedBlindedMessage(), o, s);
}
function $d(e) {
  return e instanceof Date ? Math.floor(e.getTime() / 1e3) : Math.floor(e < 1e12 ? e : e / 1e3);
}
var Te = class tu {
  constructor() {
    this.lockKeys = [], this.refundKeys = [], this.extraTags = [];
  }
  addMainPubkey(t) {
    let n = Array.isArray(t) ? t : [t];
    return this.lockKeys = Ee([...this.lockKeys, ...n]), this;
  }
  addLockPubkey(t) {
    return this.addMainPubkey(t);
  }
  addRefundPubkey(t) {
    let n = Array.isArray(t) ? t : [t];
    return this.refundKeys = Ee([...this.refundKeys, ...n]), this;
  }
  lockUntil(t) {
    return this.locktime = $d(t), this;
  }
  requireMainSignatures(t) {
    if (!Number.isInteger(t) || t < 1) throw new h(`requiredSignatures (n_sigs) must be a positive integer, got ${t}`);
    return this.nSigs = t, this;
  }
  requireLockSignatures(t) {
    return this.requireMainSignatures(t);
  }
  requireRefundSignatures(t) {
    if (!Number.isInteger(t) || t < 1) throw new h(`requiredRefundSignatures (n_sigs_refund) must be a positive integer, got ${t}`);
    return this.nSigsRefund = t, this;
  }
  addTag(t, n) {
    Xa(t);
    let r = n === void 0 ? [] : Array.isArray(n) ? n : [n];
    return this.extraTags.push([t, ...r.map(String)]), this;
  }
  addTags(t) {
    for (let [n, ...r] of t) this.addTag(n, r);
    return this;
  }
  blindKeys() {
    return this._blindKeys = !0, this;
  }
  sigAll() {
    return this.sigFlag = "SIG_ALL", this;
  }
  addHashlock(t) {
    return this.hashlock = t, this;
  }
  toOptions() {
    let t = this.lockKeys, n = this.refundKeys;
    if (t.length === 0 && !this.hashlock) throw new h("At least one lock pubkey is required");
    let r = {
      pubkey: t.length === 1 ? t[0] : t,
      ...this.locktime === void 0 ? {} : { locktime: this.locktime },
      ...n.length ? { refundKeys: n } : {},
      ...this.nSigs !== void 0 && (this.nSigs > 1 || t.length === 0) ? { requiredSignatures: this.nSigs } : {},
      ...this.nSigsRefund !== void 0 && (this.nSigsRefund > 1 || n.length === 0) ? { requiredRefundSignatures: this.nSigsRefund } : {},
      ...this.extraTags.length ? { additionalTags: this.extraTags.slice() } : {},
      ...this._blindKeys ? { blindKeys: !0 } : {},
      ...this.sigFlag == "SIG_ALL" ? { sigFlag: "SIG_ALL" } : {},
      ...this.hashlock ? { hashlock: this.hashlock } : {}
    };
    return gt.createSingleP2PKData(r, 1, "deedbeef"), r;
  }
  static fromOptions(t) {
    let n = new tu();
    if (t.refundKeys !== void 0 && !Array.isArray(t.refundKeys)) throw new h("refundKeys must be an array of pubkeys");
    if (t.blindKeys !== void 0 && typeof t.blindKeys != "boolean") throw new h("blindKeys must be a boolean");
    let r = Array.isArray(t.pubkey) ? t.pubkey : [t.pubkey];
    return n.addMainPubkey(r), t.locktime !== void 0 && n.lockUntil(t.locktime), t.refundKeys?.length && n.addRefundPubkey(t.refundKeys), t.requiredSignatures !== void 0 && n.requireMainSignatures(t.requiredSignatures), t.requiredRefundSignatures !== void 0 && n.requireRefundSignatures(t.requiredRefundSignatures), t.additionalTags?.length && n.addTags(t.additionalTags), t.blindKeys && n.blindKeys(), t.sigFlag == "SIG_ALL" && n.sigAll(), t.hashlock && n.addHashlock(t.hashlock), n;
  }
}, Gf = Te;
function mr(e, t, n, r = !1, i = !1, s = ut) {
  let o = _t(e), a = k.from(t), u = a.toBigInt(), l = ac(), c = null, d = null, f = 0n, p = 0n, g = (T) => {
    let B;
    try {
      B = n.getKeyset(T.id).fee;
    } catch ($) {
      let R = `Could not get fee. No keyset found for keyset id: ${T.id}`;
      throw s.error(R, {
        error: $,
        keychain: n.getKeysets()
      }), new h(R, { cause: $ });
    }
    return nt(!n.isUnitKeyset(T.id), `Proof has unrecognised keyset. '${T.id}' is not a keyset for this wallet unit`, s, { id: T.id }), BigInt(B);
  }, m = (T, B) => T - (r ? (B + 999n) / 1000n : 0n), w = (T) => {
    let B = [...T];
    for (let $ = B.length - 1; $ > 0; $--) {
      let R = Math.floor(Math.random() * ($ + 1));
      [B[$], B[R]] = [B[R], B[$]];
    }
    return B;
  }, v = (T, B, $) => {
    let R = 0, X = T.length - 1, ht = null;
    for (; R <= X; ) {
      let Q = Math.floor((R + X) / 2), bt = T[Q].exFee;
      ($ ? bt <= B : bt >= B) ? (ht = Q, $ ? R = Q + 1 : X = Q - 1) : $ ? X = Q - 1 : R = Q + 1;
    }
    return $ ? ht : R < T.length ? R : null;
  }, x = (T, B) => {
    let $ = B.exFee, R = 0, X = T.length;
    for (; R < X; ) {
      let ht = Math.floor((R + X) / 2);
      T[ht].exFee < $ ? R = ht + 1 : X = ht;
    }
    T.splice(R, 0, B);
  }, b = (T, B) => m(T, B) < u ? null : 1000n * T + B - 1000n * u, E = 0n, M = 0n, A = /* @__PURE__ */ new Set(), H = o.map((T, B) => {
    nt(A.has(T.secret), `Duplicate proof at index ${B}: each proof may appear only once`, s, { index: B }), A.add(T.secret);
    let $ = g(T), R = T.amount.toBigInt(), X = r ? R - $ / 1000n : R, ht = {
      proof: T,
      amountBig: R,
      exFee: X,
      ppkfee: $
    };
    return (!r || X > 0n) && (E += R, M += $), ht;
  }), C = r ? H.filter((T) => T.exFee > 0n) : H;
  if (C.sort((T, B) => T.exFee < B.exFee ? -1 : +(T.exFee > B.exFee)), C.length > 0) {
    let T;
    if (i) {
      let B = v(C, u + 1n, !0);
      T = B === null ? 0 : B + 1;
    } else {
      let B = v(C, u + 1n, !1);
      if (B !== null) {
        let $ = C[B].exFee, R = v(C, $, !0);
        We(R, "Unexpected null rightIndex in binary search", s), T = R + 1;
      } else T = C.length;
    }
    for (let B = T; B < C.length; B++) E -= C[B].amountBig, M -= C[B].ppkfee;
    C = C.slice(0, T);
  }
  let D = m(E, M);
  if (a.isZero() || u > D) return {
    keep: o,
    send: []
  };
  let W = u < D ? u : D;
  for (let T = 0; T < 60; T++) {
    let B = [], $ = 0n, R = 0n;
    for (let Y of w(C)) {
      let I = $ + Y.amountBig, y = R + Y.ppkfee, _ = m(I, y);
      if (i && _ > u || (B.push(Y), $ = I, R = y, _ >= u)) break;
    }
    let X = new Set(B), ht = C.filter((Y) => !X.has(Y)), Q = w(Array.from({ length: B.length }, (Y, I) => I)).slice(0, 5e3);
    for (let Y of Q) {
      let I = m($, R);
      if (I === u || !i && I >= u && I <= W) break;
      let y = B[Y], _ = $ - y.amountBig, S = R - y.ppkfee, O = u - m(_, S), P = v(ht, O, i);
      if (P !== null) {
        let q = ht[P];
        (!i || q.exFee > y.exFee) && (O >= 0n || q.exFee <= y.exFee) && (B[Y] = q, $ = _ + q.amountBig, R = S + q.ppkfee, ht.splice(P, 1), x(ht, y));
      }
    }
    let bt = b($, R);
    if (bt !== null && (d === null || bt < d)) {
      s.debug(`selectProofsToSend: best solution found in trial #${T} - amount: ${$}, delta: ${bt}`), c = [...B].sort((I, y) => y.exFee < I.exFee ? -1 : +(y.exFee > I.exFee)), d = bt, f = $, p = R;
      let Y = [...c];
      for (; Y.length > 1 && d > 0n; ) {
        let I = Y.pop(), y = $ - I.amountBig, _ = R - I.ppkfee, S = b(y, _);
        if (S === null) break;
        S < d && (c = [...Y], d = S, f = y, p = _, $ = y, R = _);
      }
    }
    if (c && d !== null) {
      let Y = m(f, p);
      if (Y === u || !i && Y >= u && Y <= W) break;
    }
    if (l.elapsed() > 1e3) {
      nt(i, "Proof selection took too long. Try again with a smaller proof set.", s), s.warn("Proof selection took too long. Returning best selection so far.");
      break;
    }
  }
  if (c && d !== null) {
    let T = c.map((R) => R.proof), B = new Set(T), $ = o.filter((R) => !B.has(R));
    return s.info(`Proof selection took ${l.elapsed()}ms`), {
      keep: $,
      send: T
    };
  }
  return {
    keep: o,
    send: []
  };
}
function Ld(e, t, n, r = !1, i = !1, s = ut) {
  let o = _t(e), a = k.from(t), u = a.toBigInt(), l = (x, b) => x - (r ? (b + 999n) / 1000n : 0n), c = (x) => {
    let b = new Set(x.map((E) => E.secret));
    return {
      keep: o.filter((E) => !b.has(E.secret)),
      send: x
    };
  }, d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
  for (let [x, b] of o.entries()) {
    nt(d.has(b.secret), `Duplicate proof at index ${x}: each proof may appear only once`, s, { index: x }), d.add(b.secret);
    let E = n.getKeyset(b.id);
    nt(!n.isUnitKeyset(b.id), `Proof has unrecognised keyset. '${b.id}' is not a keyset for this wallet unit`, s, { id: b.id });
    let M = (E.hasHexId ? parseInt(b.id.slice(0, 2), 16) + 1 : 0) * 2 + +!!E.isActive, A = f.get(M) ?? {
      proofs: [],
      gross: 0n,
      ppk: 0n
    };
    A.proofs.push(b), A.gross += b.amount.toBigInt(), A.ppk += BigInt(E.fee), f.set(M, A);
  }
  let p = [...f.keys()].sort((x, b) => x - b);
  if (a.isZero() || p.length <= 1) return mr(o, a, n, r, i, s);
  let g = [], m = 0n, w = 0n, v = 0;
  for (; v < p.length; v++) {
    let x = f.get(p[v]), b = l(m + x.gross, w + x.ppk);
    if (b > u) break;
    for (let E of x.proofs) g.push(E);
    if (m += x.gross, w += x.ppk, b === u) return c(g);
  }
  if (v < p.length) {
    let x = u - l(m, w), b = f.get(p[v]).proofs, E = p.slice(v + 1).flatMap((A) => f.get(A).proofs), M = E.length ? [b, b.concat(E)] : [b];
    for (let A of M) {
      let H;
      try {
        H = mr(A, x, n, r, i, s);
      } catch (T) {
        s.debug("selectProofsRotating: biased attempt failed", { error: T });
        continue;
      }
      if (H.send.length === 0) continue;
      let C = m, D = w;
      for (let T of H.send) C += T.amount.toBigInt(), D += BigInt(n.getKeyset(T.id).fee);
      let W = l(C, D);
      if (i ? W === u : W >= u) return c(g.concat(H.send));
    }
  }
  return mr(o, a, n, r, i, s);
}
function Kd(e) {
  return {
    ...e,
    amount: e.amount.toString()
  };
}
function Zf(e) {
  return {
    amount: e.amount.toString(),
    fees: e.fees.toString(),
    keysetId: e.keysetId,
    inputs: e.inputs.map(Kd),
    ...e.sendOutputs && { sendOutputs: e.sendOutputs.map((t) => gt.serialize(t)) },
    ...e.keepOutputs && { keepOutputs: e.keepOutputs.map((t) => gt.serialize(t)) }
  };
}
function Vf(e) {
  try {
    return {
      amount: k.from(e.amount),
      fees: k.from(e.fees),
      keysetId: e.keysetId,
      inputs: _t(e.inputs),
      ...e.sendOutputs && { sendOutputs: e.sendOutputs.map((t) => gt.deserialize(t)) },
      ...e.keepOutputs && { keepOutputs: e.keepOutputs.map((t) => gt.deserialize(t)) }
    };
  } catch (t) {
    throw new h(`Invalid SerializedSwapPreview: ${t instanceof Error ? t.message : String(t)}`, { cause: t });
  }
}
var Nd = class Kr {
  createP2PKData(t, n, r, i) {
    if (this.createSingleP2PKData === Kr.prototype.createSingleP2PKData) return gt.createP2PKData(t, n, r, i);
    let s = Et(n, r.keys, i), o = t.blindKeys && t.sigFlag === "SIG_ALL" ? Wn() : void 0, a = s.map((u) => this.createSingleP2PKData(t, u, r.id, o));
    if (o && new Set(a.map((u) => u.ephemeralE)).size > 1) throw new h("createSingleP2PKData override must reuse the shared eBytes ephemeral key for a SIG_ALL split");
    return a;
  }
  createSingleP2PKData(t, n, r, i) {
    return gt.createSingleP2PKData(t, n, r, i);
  }
  createRandomData(t, n, r) {
    return Et(t, n.keys, r).map((i) => this.createSingleRandomData(i, n.id));
  }
  createSingleRandomData(t, n) {
    return gt.createSingleRandomData(t, n);
  }
  createDeterministicData(t, n, r, i, s) {
    if (this.createSingleDeterministicData === Kr.prototype.createSingleDeterministicData) return gt.createDeterministicData(t, n, r, i, s);
    let o = Et(t, i.keys, s), a = r + (o.length - 1);
    if (!Number.isSafeInteger(r) || r < 0 || o.length > 0 && !Number.isSafeInteger(a)) throw new h("Counter must be an integer in the range 0 <= counter <= 2^53 - 1");
    return o.map((u, l) => this.createSingleDeterministicData(u, n, r + l, i.id));
  }
  createSingleDeterministicData(t, n, r, i) {
    return gt.createSingleDeterministicData(t, n, r, i);
  }
};
function Ud(e) {
  return e <= 1n ? 0 : (e - 1n).toString(2).length;
}
function Dd(e) {
  let t = Object.keys(e).map((n) => k.from(n));
  return t.sort((n, r) => n.compareTo(r)), t;
}
function vs(e) {
  if (e > 8192) throw new h(`Cannot split amount: optimized split would exceed ${bn} outputs`);
}
function Fd(e, t, n, r) {
  let i = k.from(t), s = [], o = k.zero(), a = e.map((l) => l.amount);
  for (let l of Dd(n)) {
    let c = a.filter((f) => l.equals(f)).length, d = Math.max(r - c, 0);
    for (let f = 0; f < d; ++f) {
      let p = o.add(l);
      if (p.greaterThan(i)) break;
      vs(s.length + 1), s.push(l), o = p;
    }
  }
  let u = i.subtract(o);
  if (!u.isZero()) {
    let l = Et(u, n);
    vs(s.length + l.length);
    for (let c of l) s.push(c), o = o.add(c);
  }
  return s.sort((l, c) => l.compareTo(c));
}
function Le(e) {
  switch (e.type) {
    case "custom":
      return JSON.stringify({
        type: "custom",
        outputs: e.data.length,
        amounts: e.data.map((t) => t.blindedMessage.amount.toString())
      });
    case "factory":
      return JSON.stringify({
        type: "factory",
        denominations: (e.denominations ?? []).map((t) => k.from(t).toString())
      });
    case "deterministic":
      return JSON.stringify({
        type: "deterministic",
        counter: e.counter,
        denominations: (e.denominations ?? []).map((t) => k.from(t).toString())
      });
    case "p2pk": {
      let t = e.options, n = t.blindKeys ? {
        ...t,
        pubkey: Array.isArray(t.pubkey) ? t.pubkey.map(() => "[redacted]") : "[redacted]",
        refundKeys: t.refundKeys?.map(() => "[redacted]")
      } : t;
      return JSON.stringify({
        type: "p2pk",
        options: n,
        denominations: (e.denominations ?? []).map((r) => k.from(r).toString())
      });
    }
    case "random":
      return JSON.stringify({
        type: "random",
        denominations: (e.denominations ?? []).map((t) => k.from(t).toString())
      });
    default:
      return "Unknown";
  }
}
function ks(e) {
  return e.length === 12 ? e : Me(e) ? e.toLowerCase() : e;
}
function Ke(e, t) {
  if (!Number.isSafeInteger(t)) throw new h(`Reservation for counter key ${e} would take the cursor to ${t}, outside the safe integer range`);
}
var eu = class {
  constructor(e) {
    if (this.next = /* @__PURE__ */ new Map(), this.locks = /* @__PURE__ */ new Map(), e) for (let [t, n] of Object.entries(e)) {
      let r = ks(t);
      Ke(r, n), this.next.set(r, Math.max(this.next.get(r) ?? 0, n));
    }
  }
  async withLock(e, t) {
    let n = ks(e), r = this.locks.get(n) ?? Promise.resolve(), i, s = new Promise((a) => i = a), o = r.then(() => s);
    this.locks.set(n, o);
    try {
      return await r, await t(n);
    } finally {
      i(), this.locks.get(n) === o && this.locks.delete(n);
    }
  }
  async reserve(e, t) {
    if (t < 0) throw new h("reserve called with negative count");
    return this.withLock(e, (n) => {
      let r = this.next.get(n) ?? 0;
      return t === 0 ? {
        start: r,
        count: 0
      } : (Ke(n, r + t), this.next.set(n, r + t), {
        start: r,
        count: t
      });
    });
  }
  async reserveAt(e, t, n) {
    if (t < 0 || n < 0) throw new h("reserveAt called with a negative start or count");
    return this.withLock(e, (r) => {
      let i = this.next.get(r) ?? 0;
      if (t < i) throw new h(`Counter ${t} for counter key ${r} was already issued (next is ${i})`);
      return Ke(r, t + n), this.next.set(r, t + n), {
        start: t,
        count: n
      };
    });
  }
  async advanceToAtLeast(e, t) {
    await this.withLock(e, (n) => {
      t > (this.next.get(n) ?? 0) && (Ke(n, t), this.next.set(n, t));
    });
  }
  async setNext(e, t) {
    await this.withLock(e, (n) => {
      if (t < 0) throw new h("setNext: negative next not allowed");
      Ke(n, t), this.next.set(n, t);
    });
  }
  snapshot() {
    return Promise.resolve(Object.fromEntries(this.next.entries()));
  }
};
function Yf(e) {
  return new eu(e);
}
var zd = class {
  constructor(e) {
    this.src = e;
  }
  async peekNext(e) {
    return (await this.src.reserve(e, 0)).start;
  }
  async advanceToAtLeast(e, t) {
    await this.src.advanceToAtLeast(e, t);
  }
  async setNext(e, t) {
    if (typeof this.src.setNext == "function") {
      await this.src.setNext(e, t);
      return;
    }
    throw new h("CounterSource does not support setNext()");
  }
  async snapshot() {
    if (typeof this.src.snapshot == "function") return await this.src.snapshot();
    throw new h("CounterSource does not support snapshot()");
  }
};
function Ne() {
}
function Qd(e) {
  let t = /* @__PURE__ */ new WeakSet();
  try {
    return JSON.stringify(e, (n, r) => {
      if (typeof r == "object" && r) {
        if (t.has(r)) return "[Circular]";
        t.add(r);
      }
      return r;
    });
  } catch {
    return Object.prototype.toString.call(e);
  }
}
function Hd(e) {
  return {
    ...e,
    ...e.amount != null && { amount: k.from(e.amount) },
    ...e.amount_paid != null && { amount_paid: k.from(e.amount_paid) },
    ...e.amount_issued != null && { amount_issued: k.from(e.amount_issued) }
  };
}
function jd(e, t) {
  let n = {
    ...e,
    ...e.amount != null && { amount: k.from(e.amount) },
    ...e.fee_reserve != null && { fee_reserve: k.from(e.fee_reserve) },
    ...e.change && { change: e.change.map((r) => ({
      ...r,
      amount: k.from(r.amount)
    })) }
  };
  return Ga(n, "bolt11", t, "bolt11 melt quote update"), n;
}
function Ue(e) {
  return e instanceof Error ? e : new h(typeof e == "string" ? e : Qd(e), { cause: e });
}
function _s() {
  let e = /* @__PURE__ */ Error("Aborted");
  return Object.defineProperty(e, "name", { value: "AbortError" }), e;
}
function ee(e) {
  e && Promise.resolve(e).then((t) => {
    try {
      t();
    } catch {
    }
  }).catch(() => {
  });
}
var Wd = class {
  constructor(e) {
    this.wallet = e, this.countersReservedHandlers = /* @__PURE__ */ new Set(), this.keychainUpdatedHandlers = /* @__PURE__ */ new Set();
  }
  withAbort(e, t) {
    if (!e) return t;
    if (e.aborted) return t(), Ne;
    let n = () => t();
    return e.addEventListener("abort", n, { once: !0 }), () => {
      e.removeEventListener("abort", n), t();
    };
  }
  waitUntilPaid(e, t, n, r = "Timeout waiting for paid") {
    return new Promise((i, s) => {
      let o = null, a = null, u = !1, l = (d) => {
        u || (u = !0, ee(o), a && (clearTimeout(a), a = null), n?.signal && n.signal.removeEventListener("abort", c), d && s(Ue(d)));
      }, c = () => l(_s());
      if (n?.signal) {
        if (n.signal.aborted) return c();
        n.signal.addEventListener("abort", c, { once: !0 });
      }
      n?.timeoutMs && n.timeoutMs > 0 && (a = setTimeout(() => l(new h(r)), n.timeoutMs)), o = e(t, (d) => {
        l(), i(d);
      }, (d) => l(d), { signal: n?.signal }), o.catch((d) => l(d));
    });
  }
  countersReserved(e, t) {
    return this.countersReservedHandlers.add(e), this.withAbort(t?.signal, () => this.countersReservedHandlers.delete(e));
  }
  _emitCountersReserved(e) {
    for (let t of this.countersReservedHandlers) rt(t, e, this.wallet.logger, { event: "countersReserved" });
  }
  keychainUpdated(e, t) {
    return this.keychainUpdatedHandlers.add(e), this.withAbort(t?.signal, () => this.keychainUpdatedHandlers.delete(e));
  }
  _emitKeychainUpdated() {
    if (this.keychainUpdatedHandlers.size === 0) return;
    let e = { cache: this.wallet.keyChain.cache };
    for (let t of this.keychainUpdatedHandlers) rt(t, e, this.wallet.logger, { event: "keychainUpdated" });
  }
  async mintQuoteUpdates(e, t, n, r) {
    if (r?.signal?.aborted || (await this.wallet.mint.connectWebSocket(), r?.signal?.aborted)) return Ne;
    let i = this.wallet.mint.webSocketConnection;
    if (!i) throw new h("Failed to establish WebSocket connection.");
    let s = Array.from(new Set(e)), o = (u) => {
      let l;
      try {
        l = Hd(u);
      } catch (c) {
        rt(n, Ue(c), this.wallet.logger);
        return;
      }
      rt(t, l, this.wallet.logger, { event: "bolt11_mint_quote" });
    }, a = i.createSubscription({
      kind: "bolt11_mint_quote",
      filters: s
    }, o, n);
    return this.withAbort(r?.signal, () => i.cancelSubscription(a, o));
  }
  async mintQuotePaid(e, t, n, r) {
    return this.mintQuoteUpdates([e], (i) => {
      i.state === He.PAID && rt(t, i, this.wallet.logger);
    }, n, r);
  }
  async meltQuoteUpdates(e, t, n, r) {
    if (r?.signal?.aborted || (await this.wallet.mint.connectWebSocket(), r?.signal?.aborted)) return Ne;
    let i = this.wallet.mint.webSocketConnection;
    if (!i) throw new h("Failed to establish WebSocket connection.");
    let s = Array.from(new Set(e)), o = (u) => {
      let l;
      try {
        l = jd(u, this.wallet.logger);
      } catch (c) {
        rt(n, Ue(c), this.wallet.logger);
        return;
      }
      rt(t, l, this.wallet.logger, { event: "bolt11_melt_quote" });
    }, a = i.createSubscription({
      kind: "bolt11_melt_quote",
      filters: s
    }, o, n);
    return this.withAbort(r?.signal, () => i.cancelSubscription(a, o));
  }
  async meltQuotePaid(e, t, n, r) {
    return this.meltQuoteUpdates([e], (i) => {
      i.state === Va.PAID && rt(t, i, this.wallet.logger);
    }, n, r);
  }
  async proofStateUpdates(e, t, n, r) {
    if (r?.signal?.aborted) return Ne;
    for (let c of e) me(c.id, this.wallet.logger);
    if (await this.wallet.mint.connectWebSocket(), r?.signal?.aborted) return Ne;
    let i = this.wallet.mint.webSocketConnection;
    if (!i) throw new h("Failed to establish WebSocket connection.");
    let s = new TextEncoder(), o = /* @__PURE__ */ Object.create(null);
    for (let c of e) {
      let d = cn(s.encode(c.secret)).toHex(!0);
      if (o[d]) throw new h("Duplicate proof secret in proofStateUpdates input");
      o[d] = c;
    }
    let a = Object.keys(o), u = (c) => {
      let d = o[c.Y];
      d && rt(t, {
        ...c,
        proof: d
      }, this.wallet.logger, { event: "proof_state" });
    }, l = i.createSubscription({
      kind: "proof_state",
      filters: a
    }, u, n);
    return this.withAbort(r?.signal, () => i.cancelSubscription(l, u));
  }
  onceMintPaid(e, t) {
    return this.waitUntilPaid(this.mintQuotePaid.bind(this), e, t, "Timeout waiting for mint paid");
  }
  onceAnyMintPaid(e, t) {
    return new Promise((n, r) => {
      let i = Array.from(new Set(e)), s = /* @__PURE__ */ new Map(), o = null, a = null, u = !1, l = !1, c = (f) => {
        if (!l) {
          l = !0;
          for (let p of s.values()) ee(p);
          s.clear(), o && (clearTimeout(o), o = null), t?.signal && t.signal.removeEventListener("abort", d), f && r(Ue(f));
        }
      }, d = () => c(_s());
      if (t?.signal) {
        if (t.signal.aborted) return d();
        t.signal.addEventListener("abort", d, { once: !0 });
      }
      if (t?.timeoutMs && t.timeoutMs > 0 && (o = setTimeout(() => c(new h("Timeout waiting for any mint paid")), t.timeoutMs)), i.length === 0) return c(new h("No quote ids provided"));
      for (let f of i) {
        let p = this.mintQuotePaid(f, (g) => {
          c(), n({
            id: f,
            quote: g
          });
        }, (g) => {
          if (t?.failOnError) {
            c(g);
            return;
          }
          a = g;
          let m = s.get(f);
          m && (ee(m), s.delete(f)), u && s.size === 0 && c(a ?? new h("No subscriptions remaining"));
        });
        s.set(f, p), p.catch((g) => {
          if (t?.failOnError) {
            c(g);
            return;
          }
          a = g;
          let m = s.get(f);
          m && (ee(m), s.delete(f)), u && s.size === 0 && c(a ?? new h("No subscriptions remaining"));
        });
      }
      u = !0;
    });
  }
  onceMeltPaid(e, t) {
    return this.waitUntilPaid(this.meltQuotePaid.bind(this), e, t, "Timeout waiting for melt paid");
  }
  proofStatesStream(e, t) {
    return async function* () {
      let n = [], r = !1, i = null, s = t?.maxBuffer && t.maxBuffer > 0 ? t.maxBuffer : 1 / 0, o = t?.drop ?? "oldest", a = () => {
        let f = i;
        i = null, f && f();
      }, u = (f) => {
        if (n.length >= s) if (o === "oldest") {
          let p = n.shift();
          p !== void 0 && rt(t?.onDrop, p, this.wallet.logger, { event: "onDrop" }), n.push(f);
        } else {
          rt(t?.onDrop, f, this.wallet.logger, { event: "onDrop" });
          return;
        }
        else n.push(f);
        a();
      }, l = null, c = this.proofStateUpdates(e, u, () => {
        r = !0, a();
      }, { signal: t?.signal });
      c.catch((f) => {
        l = Ue(f), r = !0, a();
      });
      let d = () => {
        r = !0, a();
      };
      try {
        for (t?.signal && (t.signal.aborted ? d() : t.signal.addEventListener("abort", d, { once: !0 })); !r || n.length; ) {
          for (; n.length; ) yield n.shift();
          if (r) break;
          await new Promise((f) => i = f);
        }
        if (l) throw l;
      } finally {
        ee(c), t?.signal && t.signal.removeEventListener("abort", d);
      }
    }.call(this);
  }
  group() {
    let e = [], t = !1, n = (() => {
      if (!t) for (t = !0; e.length; ) ee(e.pop());
    });
    return n.add = (r) => t ? (ee(r), r) : (rt(async () => {
      await r;
    }, void 0, this.wallet.logger, {
      event: "group.add",
      reason: "subscription setup failed"
    }), e.push(r), r), Object.defineProperty(n, "cancelled", {
      get: () => t,
      enumerable: !0
    }), n;
  }
}, Nr = /* @__PURE__ */ new WeakSet();
function Gd(e) {
  let { pubkey: t, refundKeys: n = [], hashlock: r } = Pn(e);
  for (let i of [t, n].flat()) try {
    wt(i);
  } catch (s) {
    throw new h("payment request lock key is not a valid secp256k1 point", { cause: s });
  }
  if (r !== void 0 && !/^[0-9a-f]{64}$/.test(r)) throw new h("payment request hashlock must be a 64-character hex string");
}
var Zd = class {
  constructor(e) {
    this.wallet = e;
  }
  send(e, t) {
    return new Ss(this.wallet, e, t);
  }
  sendToRequest(e, t, n) {
    let r = this.wallet;
    if (e.amount && n !== void 0) throw new h("the request specifies its amount; omit the amount argument");
    let i = e.amount ?? (n === void 0 ? void 0 : k.from(n));
    if (!i) throw new h("amountless payment request: pass the chosen amount");
    if (!e.unit && (e.amount !== void 0 || e.supportedMethods?.length)) throw new h("invalid payment request: unit (u) is required when an amount (a) or supported methods (sm) are set");
    if (e.unit && e.unit !== r.unit) throw new h(`request unit '${e.unit}' does not match wallet unit '${r.unit}'`);
    let s = e.includesMint(r.mint.mintUrl);
    if (e.isMintListStrict && !s) throw new h("this wallet's mint is not in the request's strict mint list");
    let o = k.zero();
    if (e.supportedMethods?.length) {
      let { disabled: l, params: c } = r.getMintInfo().isSupported(5), d = l ? [] : c.filter((f) => f.unit === r.unit).map((f) => f.method);
      if (!e.supportedMethods.some((f) => d.includes(f.method))) throw new h(`mint cannot melt ${r.unit} via any method the request accepts`);
      o = s ? k.zero() : e.feesFor(r.mint.mintUrl, d);
    }
    let a = e.toP2PKOptions();
    if (e.nut10 && !a) throw new h(`cannot honour the request's nut10 lock kind '${e.nut10.kind}'`);
    a && Gd(a);
    let u = new Ss(r, i.add(o), t);
    return Nr.add(u), u.includeFees(!0), a ? u.asLocked(a) : u;
  }
  receive(e) {
    return new Vd(this.wallet, e);
  }
  mintBolt11(e, t) {
    return new yr(this.wallet, "bolt11", e, t);
  }
  mintBolt12(e, t) {
    return new yr(this.wallet, "bolt12", e, t);
  }
  mintOnchain(e, t) {
    return new yr(this.wallet, "onchain", e, t);
  }
  meltBolt11(e, t) {
    return new xs(this.wallet, "bolt11", e, t);
  }
  meltBolt12(e, t) {
    return new xs(this.wallet, "bolt12", e, t);
  }
  meltOnchain(e, t) {
    return new Yd(this.wallet, e, t);
  }
}, Ss = class {
  constructor(e, t, n) {
    this.wallet = e, this.proofs = n, this.config = {}, this.amount = k.from(t);
  }
  assertSendOutputMutable() {
    if (Nr.has(this) && this.sendOT) throw new h("the payment request mandates this send output; it cannot be replaced by chaining");
  }
  asRandom(e) {
    return this.assertSendOutputMutable(), this.sendOT = {
      type: "random",
      denominations: e
    }, this;
  }
  asDeterministic(e = 0, t) {
    return this.assertSendOutputMutable(), this.sendOT = {
      type: "deterministic",
      counter: e,
      denominations: t
    }, this;
  }
  asLocked(e, t) {
    this.assertSendOutputMutable();
    let n = e instanceof Te ? e.toOptions() : e;
    return this.sendOT = {
      type: "p2pk",
      options: n,
      denominations: t
    }, this;
  }
  asP2PK(e, t) {
    return this.asLocked(e, t);
  }
  asFactory(e, t) {
    return this.assertSendOutputMutable(), this.sendOT = {
      type: "factory",
      factory: e,
      denominations: t
    }, this;
  }
  asCustom(e) {
    return this.assertSendOutputMutable(), this.sendOT = {
      type: "custom",
      data: e
    }, this;
  }
  keepAsRandom(e) {
    return this.keepOT = {
      type: "random",
      denominations: e
    }, this;
  }
  keepAsDeterministic(e = 0, t) {
    return this.keepOT = {
      type: "deterministic",
      counter: e,
      denominations: t
    }, this;
  }
  keepAsLocked(e, t) {
    let n = e instanceof Te ? e.toOptions() : e;
    return this.keepOT = {
      type: "p2pk",
      options: n,
      denominations: t
    }, this;
  }
  keepAsP2PK(e, t) {
    return this.keepAsLocked(e, t);
  }
  keepAsFactory(e, t) {
    return this.keepOT = {
      type: "factory",
      factory: e,
      denominations: t
    }, this;
  }
  keepAsCustom(e) {
    return this.keepOT = {
      type: "custom",
      data: e
    }, this;
  }
  includeFees(e = !0) {
    if (Nr.has(this) && !e) throw new h("a payment request is sent net of input fees; includeFees cannot be disabled");
    return this.config.includeFees = e, this;
  }
  keyset(e) {
    return this.config.keysetId = e, this;
  }
  privkey(e) {
    return this.config.privkey = e, this;
  }
  proofsWeHave(e) {
    return this.config.proofsWeHave = e, this;
  }
  onCountersReserved(e) {
    return this.config.onCountersReserved = e, this;
  }
  offlineExactOnly(e = !1) {
    return this.offlineExact = { requireDleq: e }, this;
  }
  offlineCloseMatch(e = !1) {
    return this.offlineClose = { requireDleq: e }, this;
  }
  async prepare() {
    if (this.offlineExact || this.offlineClose) throw new h("Offline selection has nothing to prepare; call run() instead, or drop the offline mode for an online swap.");
    let e = {
      send: this.sendOT ?? this.wallet.defaultOutputType(),
      ...this.keepOT ? { keep: this.keepOT } : {}
    };
    return this.wallet.prepareSwapToSend(this.amount, this.proofs, this.config, e);
  }
  async run() {
    if ((this.offlineExact || this.offlineClose) && (this.sendOT || this.keepOT)) throw new h("Offline selection cannot be combined with custom output types. Remove send/keep output configuration, or use an online swap.");
    if (this.offlineExact) return this.config.privkey && (this.proofs = this.wallet.signP2PKProofs(this.proofs, this.config.privkey)), this.wallet.sendOffline(this.amount, this.proofs, {
      includeFees: this.config.includeFees,
      exactMatch: !0,
      requireDleq: this.offlineExact.requireDleq
    });
    if (this.offlineClose) return this.config.privkey && (this.proofs = this.wallet.signP2PKProofs(this.proofs, this.config.privkey)), this.wallet.sendOffline(this.amount, this.proofs, {
      includeFees: this.config.includeFees,
      exactMatch: !1,
      requireDleq: this.offlineClose.requireDleq
    });
    let e = {
      send: this.sendOT ?? this.wallet.defaultOutputType(),
      ...this.keepOT ? { keep: this.keepOT } : {}
    };
    return this.wallet.send(this.amount, this.proofs, this.config, e);
  }
}, Vd = class {
  constructor(e, t) {
    this.wallet = e, this.token = t, this.config = {};
  }
  asRandom(e) {
    return this.outputType = {
      type: "random",
      denominations: e
    }, this;
  }
  asDeterministic(e = 0, t) {
    return this.outputType = {
      type: "deterministic",
      counter: e,
      denominations: t
    }, this;
  }
  asLocked(e, t) {
    let n = e instanceof Te ? e.toOptions() : e;
    return this.outputType = {
      type: "p2pk",
      options: n,
      denominations: t
    }, this;
  }
  asP2PK(e, t) {
    return this.asLocked(e, t);
  }
  asFactory(e, t) {
    return this.outputType = {
      type: "factory",
      factory: e,
      denominations: t
    }, this;
  }
  asCustom(e) {
    return this.outputType = {
      type: "custom",
      data: e
    }, this;
  }
  keyset(e) {
    return this.config.keysetId = e, this;
  }
  requireDleq(e = !0) {
    return this.config.requireDleq = e, this;
  }
  privkey(e) {
    return this.config.privkey = e, this;
  }
  proofsWeHave(e) {
    return this.config.proofsWeHave = e, this;
  }
  onCountersReserved(e) {
    return this.config.onCountersReserved = e, this;
  }
  async prepare() {
    return this.wallet.prepareSwapToReceive(this.token, this.config, this.outputType);
  }
  async run() {
    return this.wallet.receive(this.token, this.config, this.outputType);
  }
}, yr = class {
  constructor(e, t, n, r) {
    this.wallet = e, this.method = t, this.quote = r, this.config = {}, this.amount = k.from(n), this._hasPrivkey;
  }
  asRandom(e) {
    return this.outputType = {
      type: "random",
      denominations: e
    }, this;
  }
  asDeterministic(e = 0, t) {
    return this.outputType = {
      type: "deterministic",
      counter: e,
      denominations: t
    }, this;
  }
  asLocked(e, t) {
    let n = e instanceof Te ? e.toOptions() : e;
    return this.outputType = {
      type: "p2pk",
      options: n,
      denominations: t
    }, this;
  }
  asP2PK(e, t) {
    return this.asLocked(e, t);
  }
  asFactory(e, t) {
    return this.outputType = {
      type: "factory",
      factory: e,
      denominations: t
    }, this;
  }
  asCustom(e) {
    return this.outputType = {
      type: "custom",
      data: e
    }, this;
  }
  keyset(e) {
    return this.config.keysetId = e, this;
  }
  privkey(e) {
    return this.config.privkey = e, this;
  }
  proofsWeHave(e) {
    return this.config.proofsWeHave = e, this;
  }
  onCountersReserved(e) {
    return this.config.onCountersReserved = e, this;
  }
  async prepare() {
    if (this.method === "bolt11") {
      let t = this.quote, n = typeof t == "string" ? await this.wallet.checkMintQuoteBolt11(t) : t;
      if (this.wallet.validateMintQuote(n), n.pubkey && !this.config.privkey) throw new h("privkey is required for locked BOLT11 mint quotes");
      return this.wallet.prepareMint(this.method, this.amount, n, this.config, this.outputType);
    }
    if (this.method === "bolt12") {
      let t = this.quote;
      if (this.wallet.validateMintQuote(t), !this.config.privkey) throw new h("privkey is required for BOLT12 mint quotes");
      return this.wallet.prepareMint(this.method, this.amount, t, this.config, this.outputType);
    }
    let e = this.quote;
    if (this.wallet.validateMintQuote(e), !this.config.privkey) throw new h("privkey is required for onchain mint quotes");
    return this.wallet.prepareMint(this.method, this.amount, e, this.config, this.outputType);
  }
  async run() {
    let e = await this.prepare();
    return this.wallet.completeMint(e);
  }
}, xs = class {
  constructor(e, t, n, r) {
    this.wallet = e, this.method = t, this.quote = n, this.proofs = r, this.config = {};
  }
  asRandom(e) {
    return this.outputType = {
      type: "random",
      denominations: e
    }, this;
  }
  asDeterministic(e = 0, t) {
    return this.outputType = {
      type: "deterministic",
      counter: e,
      denominations: t
    }, this;
  }
  asLocked(e, t) {
    let n = e instanceof Te ? e.toOptions() : e;
    return this.outputType = {
      type: "p2pk",
      options: n,
      denominations: t
    }, this;
  }
  asP2PK(e, t) {
    return this.asLocked(e, t);
  }
  asFactory(e, t) {
    return this.outputType = {
      type: "factory",
      factory: e,
      denominations: t
    }, this;
  }
  asCustom(e) {
    return this.outputType = {
      type: "custom",
      data: e
    }, this;
  }
  keyset(e) {
    return this.config.keysetId = e, this;
  }
  privkey(e) {
    return this.config.privkey = e, this;
  }
  onCountersReserved(e) {
    return this.config.onCountersReserved = e, this;
  }
  async prepare() {
    return await this.wallet.prepareMelt(this.method, this.quote, this.proofs, this.config, this.outputType);
  }
  async run() {
    let e = await this.wallet.prepareMelt(this.method, this.quote, this.proofs, this.config, this.outputType);
    return this.wallet.completeMelt(e, this.config.privkey);
  }
}, Yd = class {
  constructor(e, t, n) {
    this.wallet = e, this.quote = t, this.proofs = n, this.config = {};
  }
  keyset(e) {
    return this.config.keysetId = e, this;
  }
  privkey(e) {
    return this.config.privkey = e, this;
  }
  feeIndex(e) {
    return this.selectedFeeIndex = e, this;
  }
  async run() {
    if (this.selectedFeeIndex === void 0 && this.quote.fee_options.length === 1 && (this.selectedFeeIndex = this.quote.fee_options[0].fee_index), this.selectedFeeIndex === void 0) throw new h("feeIndex is required when an onchain melt quote has multiple fee options");
    return this.wallet.meltProofsOnchain(this.quote, this.proofs, this.selectedFeeIndex, this.config);
  }
}, De = "__PENDING__", Jd = 20008;
function Is(e) {
  return !!(e.dleq?.r && e.dleq.s && e.dleq.e);
}
var Xd = class nu {
  constructor(t, n) {
    this._seed = void 0, this._unit = "sat", this._mintInfo = void 0, this._denominationTarget = 3, this._secretsPolicy = "auto", this._boundKeysetId = De, this._pendingRepair = null, this._lastRepairAt = 0, this._explicitBind = !1, this._requireSigDleq = !1, this._strictCachedKeysets = !1, this.ops = new Zd(this), this.on = new Wd(this), this._logger = n?.logger ?? ut, this._selectProofs = n?.selectProofs ?? Ld, this._outputDataCreator = n?.outputDataCreator ?? new Nd(), this.mint = typeof t == "string" ? new Si(t, {
      authProvider: n?.authProvider,
      logger: this._logger
    }) : t, this._unit = n?.unit ?? this._unit, this._boundKeysetId = n?.keysetId ?? this._boundKeysetId, this._explicitBind = n?.keysetId !== void 0, n?.bip39seed && (this.failIf(!(n.bip39seed instanceof Uint8Array), "bip39seed must be a valid Uint8Array", { received: typeof n.bip39seed }), this.failIf(n.bip39seed.length < 16 || n.bip39seed.length > 64, "bip39seed must be 16 to 64 bytes", { length: n.bip39seed.length }), this._seed = n.bip39seed), this._secretsPolicy = n?.secretsPolicy ?? this._secretsPolicy, n?.counterSource ? this._counterSource = n.counterSource : this._counterSource = new eu(n?.counterInit), this.counters = new zd(this._counterSource), this._keyChain = new $r(this.mint, this._unit, this._logger), this._denominationTarget = n?.denominationTarget ?? this._denominationTarget, this._requireSigDleq = n?.requireSigDleq ?? this._requireSigDleq, this._strictCachedKeysets = n?.strictCachedKeysets ?? this._strictCachedKeysets;
  }
  fail(t, n) {
    return Xe(t, this._logger, n);
  }
  failIf(t, n, r) {
    return nt(t, n, this._logger, r);
  }
  failIfNullish(t, n, r) {
    return We(t, n, this._logger, r);
  }
  requireNut29(t, n, r) {
    let i = this._mintInfo?.isSupported(29);
    if (i === void 0) return;
    let s = i.params?.methods;
    return this.failIf(!i.supported || Array.isArray(s) && !s.includes(t), `${n}: mint does not advertise NUT-29 for ${t}; use ${r} per quote`), i.params;
  }
  requireSupport(t, n) {
    this.failIf(!this.getMintInfo().supportsMintMeltMethod(t, n, this._unit), `Mint does not support ${n} ${t} for unit '${this._unit}'`);
  }
  safeCallback(t, n, r) {
    rt(t, n, this._logger, r);
  }
  parseAmount(t, n, r = !1) {
    try {
      let i = k.from(t);
      return r || this.failIf(i.isZero(), `Amount must be positive: ${i.toString()}`, {
        op: n,
        amount: t
      }), i;
    } catch (i) {
      let s = i instanceof Error ? i.message : String(i);
      throw this._logger.error(s, {
        op: n,
        amount: t
      }), new h(s, { cause: i });
    }
  }
  async loadMint(t) {
    let n = [];
    (!this._mintInfo || t) && n.push(this.mint.getInfo().then((r) => (this._mintInfo = new se(r, this._logger), this.mint.setMintInfo(this._mintInfo), null))), n.push(this._keyChain.init(t)), await Promise.all(n), this.finishInit();
  }
  loadMintFromCache(t, n) {
    this._mintInfo = new se(t, this._logger), this.mint.setMintInfo(this._mintInfo), this._keyChain.loadFromCache(n), this.finishInit();
  }
  finishInit() {
    let { keysets: t, mintUrl: n, savedAt: r } = this._keyChain.cache;
    if (this._logger.debug("KeyChain loaded", {
      mintUrl: n,
      savedAt: r,
      keysets: t.map((i) => ({
        id: i.id,
        unit: i.unit,
        active: i.active,
        fee: i.input_fee_ppk,
        keys: i.keys ? Object.keys(i.keys).length : 0
      }))
    }), this._boundKeysetId === De) try {
      this._boundKeysetId = this._keyChain.getCheapestKeyset().id;
    } catch (i) {
      this._logger.warn("No active keyset available, wallet remains unbound", {
        unit: this._unit,
        err: i.message
      });
    }
    else if (this._explicitBind) {
      let i = this._keyChain.getKeyset(this._boundKeysetId);
      this.failIf(i.unit !== this._unit, "Keyset unit does not match wallet unit", {
        keyset: i.id,
        unit: i.unit,
        walletUnit: this._unit
      }), me(i.id, this._logger);
    } else {
      let i = this._keyChain.hasKeyset(this._boundKeysetId) ? this._keyChain.getKeyset(this._boundKeysetId) : void 0;
      try {
        let s = this._keyChain.getCheapestKeyset().id;
        s !== this._boundKeysetId && (this._boundKeysetId = s, this._logger.info("Wallet rebound to cheapest active keyset after refresh", { keysetId: s }));
      } catch (s) {
        i || (this._boundKeysetId = De), this._logger.warn("No active keyset available after refresh", {
          unit: this._unit,
          err: s.message
        });
      }
    }
    this.getMintInfo();
  }
  get keyChain() {
    return this._keyChain;
  }
  get unit() {
    return this._unit;
  }
  getMintInfo() {
    return this.failIfNullish(this._mintInfo, "Mint info not initialized; call loadMint or loadMintFromCache first"), this._mintInfo;
  }
  get maxArrayLength() {
    return this._mintInfo?.maxArrayLength ?? 500;
  }
  get keysetId() {
    if (this._boundKeysetId === De && this._mintInfo) try {
      this._keyChain.getCheapestKeyset();
    } catch (t) {
      this.fail(`Wallet has no bound keyset: ${t.message}`);
    }
    return this.failIf(this._boundKeysetId === De, "Wallet has no bound keyset. The mint may have no active keysets, or wallet was not initialized via loadMint or loadMintFromCache"), this._boundKeysetId;
  }
  getKeyset(t) {
    let n = this._keyChain.getKeyset(t ?? this.keysetId);
    return this.failIf(n.unit !== this._unit, "Keyset unit does not match wallet unit", {
      keyset: n.id,
      unit: n.unit,
      walletUnit: this._unit
    }), me(n.id, this._logger), this.failIf(!n.hasKeys, "Keyset has no keys loaded", { keyset: n.id }), n;
  }
  getOutputKeyset(t) {
    let n = this.getKeyset(t);
    return this.failIf(!n.hasHexId, "Legacy keyset cannot be used to create new proofs", { keyset: n.id }), this.failIf(!n.isActive, "Inactive keyset cannot be used to create new proofs", { keyset: n.id }), n;
  }
  async ensureOperableKeysets(t) {
    return this.failIf(!Array.isArray(t), "ensureOperableKeysets: ids must be an array"), this.failIf(!this._mintInfo, "Mint info not initialized; call loadMint or loadMintFromCache first"), this._ensureOperableKeysets(t, { implicit: !1 });
  }
  startRepair(t) {
    if (this._pendingRepair) return this._pendingRepair;
    if (t) {
      if (Date.now() - this._lastRepairAt < 6e4) return null;
      this._lastRepairAt = Date.now();
    }
    return this._pendingRepair = this.loadMint(!0).finally(() => {
      this._pendingRepair = null;
    }), this._pendingRepair;
  }
  async _ensureOperableKeysets(t, n) {
    if (!this._mintInfo) return;
    let r = [...new Set(t.filter((a) => !!a))];
    if (n.implicit && this._strictCachedKeysets) {
      let a = r.filter((u) => !this._keyChain.hasKeyset(u));
      if (a.length > 0) throw new Re(a[0]);
      return;
    }
    let i = r.filter((a) => !this._keyChain.hasKeyset(a)), s = !1;
    if (i.length > 0) {
      let a = this.startRepair(n.implicit);
      if (!a) throw new Re(i[0]);
      try {
        await a;
      } catch (l) {
        throw new Re(i[0], { cause: l });
      }
      s = !0;
      let u = i.filter((l) => !this._keyChain.hasKeyset(l));
      if (u.length > 0) throw n.implicit && this.on._emitKeychainUpdated(), new Re(u[0], { refreshed: !0 });
    }
    let o = n.fetchKeys === !1 ? [] : r.filter((a) => this._keyChain.isUnitKeyset(a) && !this._keyChain.getKeyset(a).hasKeys);
    if (o.length > 0) {
      let a = await Promise.allSettled(o.map((l) => this._keyChain.ensureKeysetKeys(l))), u = a.filter((l) => l.status === "rejected");
      if (u.length < a.length && (s = !0), u.length > 0) throw s && n.implicit && this.on._emitKeychainUpdated(), u.length === 1 ? u[0].reason : new h(`Could not load keys for ${u.length} keysets`, { cause: u.map((l) => l.reason) });
    }
    s && n.implicit && this.on._emitKeychainUpdated();
  }
  async repairStaleSnapshot() {
    if (this._strictCachedKeysets) return !1;
    let t = this.startRepair(!0);
    if (!t) return !1;
    try {
      await t;
    } catch (n) {
      return this._logger.warn("Snapshot refresh after a mint keyset rejection failed", { err: n.message }), !1;
    }
    return this.on._emitKeychainUpdated(), !0;
  }
  async withStaleKeysetRepair(t) {
    try {
      return await t();
    } catch (n) {
      throw !Xi(n) || !Number.isFinite(n.code) || n.code < 12e3 || n.code >= 13e3 ? n : new Xl(await this.repairStaleSnapshot(), { cause: n });
    }
  }
  requireMintableKeyset(t) {
    try {
      this._keyChain.getCheapestKeyset();
    } catch (n) {
      this.fail(`${t}: no active keyset for unit '${this._unit}' — a paid mint quote could not be redeemed. ${n.message}`, { reason: n.message });
    }
  }
  get logger() {
    return this._logger;
  }
  async reserveFor(t, n) {
    return n <= 0 ? {
      start: 0,
      count: 0
    } : this._counterSource.reserve(t, n);
  }
  countersNeeded(t) {
    return t.type !== "deterministic" || t.counter !== 0 ? 0 : (t.denominations ?? []).length;
  }
  async addCountersToOutputTypes(t, ...n) {
    let r = n.filter((l) => l.type === "deterministic" && l.counter > 0 && (l.denominations?.length ?? 0) > 0);
    if (r.length > 1) {
      let l = r.map((c) => ({
        start: c.counter,
        end: c.counter + c.denominations.length
      })).sort((c, d) => c.start - d.start);
      for (let c = 1; c < l.length; c++) this.failIf(l[c].start < l[c - 1].end, "Manual counter ranges overlap", {
        keysetId: t,
        prev: l[c - 1],
        cur: l[c]
      });
    }
    if (r.length > 0) {
      let l = Math.min(...r.map((d) => d.counter)), c = Math.max(...r.map((d) => d.counter + d.denominations.length));
      if (this._counterSource.reserveAt) try {
        await this._counterSource.reserveAt(t, l, c - l);
      } catch {
        this._logger.warn("Manual deterministic counter range was already issued", {
          keysetId: t,
          minManualStart: l,
          maxManualEnd: c
        }), await this._counterSource.advanceToAtLeast(t, c);
      }
      else {
        let { start: d } = await this._counterSource.reserve(t, 0);
        d > l && this._logger.warn("Manual deterministic counter range was already issued", {
          keysetId: t,
          minManualStart: l,
          maxManualEnd: c
        }), await this._counterSource.advanceToAtLeast(t, c);
      }
      this._logger.debug("Counter source advanced to respect manual deterministic counters", {
        keysetId: t,
        maxManualEnd: c
      });
    }
    let i = n.reduce((l, c) => l + this.countersNeeded(c), 0);
    if (i === 0) return { outputTypes: n };
    let s = await this.reserveFor(t, i), o = s.start, a = n.map((l) => {
      if (l.type === "deterministic" && l.counter === 0) {
        let c = l.denominations?.length ?? 0;
        if (c > 0) {
          let d = {
            ...l,
            counter: o
          };
          return o += c, d;
        }
      }
      return l;
    }), u = {
      keysetId: t,
      start: s.start,
      count: s.count,
      next: s.start + s.count
    };
    return this.on._emitCountersReserved(u), {
      outputTypes: a,
      used: u
    };
  }
  bindKeyset(t) {
    let n = this._keyChain.getKeyset(t);
    this.failIf(n.unit !== this._unit, "Keyset unit does not match wallet unit", {
      keyset: n.id,
      unit: n.unit,
      walletUnit: this._unit
    }), me(n.id, this._logger), this.failIf(!n.hasKeys, "Keyset has no keys loaded", { keyset: n.id }), this._boundKeysetId = n.id, this._explicitBind = !0, this._logger.debug("Wallet bound to keyset", {
      keysetId: n.id,
      unit: n.unit,
      feePPK: n.fee
    });
  }
  withKeyset(t, n) {
    let r = new nu(this.mint, {
      keysetId: t,
      bip39seed: this._seed,
      secretsPolicy: this._secretsPolicy,
      outputDataCreator: this._outputDataCreator,
      requireSigDleq: this._requireSigDleq,
      logger: this._logger,
      counterSource: n?.counterSource ?? this._counterSource,
      strictCachedKeysets: this._strictCachedKeysets
    });
    return r.loadMintFromCache(this.getMintInfo().cache, this._keyChain.cache), r;
  }
  defaultOutputType() {
    return this._secretsPolicy === "random" ? { type: "random" } : this._secretsPolicy === "deterministic" ? (this.failIfNullish(this._seed, "Deterministic policy requires a seed"), {
      type: "deterministic",
      counter: 0
    }) : this._seed ? {
      type: "deterministic",
      counter: 0
    } : { type: "random" };
  }
  configureOutputs(t, n, r, i = !1, s = []) {
    let o = this.parseAmount(t, "configureOutputs", !0), a = s.map((l) => ({ amount: k.from(l.amount) }));
    if (r.type === "custom") {
      this.failIf(i, "The custom OutputType does not support automatic fee inclusion");
      let l = this.parseAmount(gt.sumOutputAmounts(r.data), "configureOutputs.customTotal", !0);
      this.failIf(!l.equals(o), `Custom output data total (${l.toString()}) does not match amount (${o.toString()})`);
      for (let c of r.data) this.getOutputKeyset(c.blindedMessage.id);
      return r;
    }
    let u = r.denominations ?? [];
    if (u.length === 0 && a.length > 0 && (u = Fd(a, o, n.keys, this._denominationTarget)), u = Et(o, n.keys, u), i) {
      let l = this.receiveFeeAmounts(u.length, n);
      o = o.add(k.sum(l)), u = [...u, ...l];
    }
    return {
      ...r,
      denominations: u
    };
  }
  receiveFeeAmounts(t, n) {
    let r = this.getFeesForKeyset(t, n.id), i = Et(r, n.keys), s = 0;
    for (; this.getFeesForKeyset(t + i.length, n.id).greaterThan(r); ) {
      if (s++ > 4096) throw new h(`Fee calculation for keyset ${n.id} did not converge (input_fee_ppk too high for its denominations)`);
      r = r.add(1), i = Et(r, n.keys);
    }
    return i;
  }
  preparedTotal(t) {
    if (t.type === "custom") return gt.sumOutputAmounts(t.data);
    let n = t.denominations ?? [];
    return k.sum(n);
  }
  createOutputData(t, n, r) {
    let i = this.parseAmount(t, "createOutputData", !0);
    if (r.type != "custom" && r.denominations && r.denominations.length > 0) {
      let o = k.sum(r.denominations);
      this.failIf(!o.equals(i), "Denominations do not sum to the expected amount", {
        splitSum: o.toString(),
        expected: i.toString()
      });
    }
    let s;
    switch (r.type) {
      case "random":
        s = this._outputDataCreator.createRandomData(i, n, r.denominations);
        break;
      case "deterministic":
        this.failIfNullish(this._seed, "Deterministic outputs require a seed configured in the wallet"), s = this._outputDataCreator.createDeterministicData(i, this._seed, r.counter, n, r.denominations);
        break;
      case "p2pk":
        {
          let o = this.getMintInfo();
          this.failIf(!o.isSupported(11).supported, "Mint does not support NUT-11: the lock would be spendable by anyone"), this.failIf(r.options.hashlock !== void 0 && !o.isSupported(14).supported, "Mint does not support NUT-14: the hashlock would be spendable by anyone");
        }
        r.options.locktime !== void 0 && r.options.locktime <= Math.floor(Date.now() / 1e3) && this._logger.warn("Lock locktime is not in the future", { locktime: r.options.locktime }), s = this._outputDataCreator.createP2PKData(r.options, i, n, r.denominations);
        break;
      case "factory":
        s = Et(i, n.keys, r.denominations).map((o) => r.factory(o, n));
        break;
      case "custom": {
        s = r.data;
        let o = this.parseAmount(gt.sumOutputAmounts(s), "createOutputData.customTotal", !0);
        this.failIf(!o.equals(i), `Custom output data total (${o.toString()}) does not match amount (${i.toString()})`);
        break;
      }
      default:
        this.fail("Invalid OutputType");
    }
    return s;
  }
  createSwapTransaction(t, n, r = []) {
    t = this._prepareInputsForMint(t);
    let i = [...n, ...r], s = i.map((c, d) => d);
    Rn(t) || s.sort((c, d) => i[c].blindedMessage.amount.compareTo(i[d].blindedMessage.amount));
    let o = [...Array.from({ length: n.length }, () => !0), ...Array.from({ length: r.length }, () => !1)], a = s.map((c) => i[c]), u = s.map((c) => o[c]), l = a.map((c) => c.blindedMessage);
    return {
      payload: {
        inputs: t,
        outputs: l
      },
      outputData: a,
      keepVector: u,
      sortedIndices: s
    };
  }
  async receive(t, n, r) {
    let i = await this.prepareSwapToReceive(t, n, r), { keep: s } = await this.completeSwap(i, n?.privkey);
    return s;
  }
  async prepareSwapToReceive(t, n, r) {
    let { keysetId: i, requireDleq: s, proofsWeHave: o, onCountersReserved: a } = n || {};
    r = r ?? this.defaultOutputType();
    let u;
    if (Array.isArray(t)) u = _t(t);
    else {
      let w = typeof t == "string" ? this.decodeToken(t) : t, v = Xn(w.mint);
      this.failIf(v !== this.mint.mintUrl, "Token belongs to a different mint", {
        token: v,
        wallet: this.mint.mintUrl
      }), this.failIf(w.unit !== this._unit, "Token is not in wallet unit", {
        token: w.unit,
        wallet: this._unit
      }), u = _t(w.proofs);
    }
    await this._ensureOperableKeysets(u.map((w) => w.id), { implicit: !0 }), this.assertProofsInWalletUnit(u);
    let l = this.parseAmount(Ct(u), "prepareSwapToReceive", !0);
    this.failIf(l.isZero(), "Token contains no proofs");
    for (let w of u) {
      let v = this._keyChain.getKeyset(w.id);
      s ? this.failIf(!bi(w, v), "Token contains proofs with invalid or missing DLEQ") : this.failIf(!Xh(w, v), "Token contains a proof with an invalid DLEQ");
    }
    let c = this.getOutputKeyset(i), d = this.getFeesForProofs(u), f = l.subtract(d), p = this.configureOutputs(f, c, r, !1, o), g = await this.addCountersToOutputTypes(c.id, p);
    [p] = g.outputTypes, g.used && this.safeCallback(a, g.used, { op: "receive" }), this._logger.debug("receive counter", {
      counter: g.used,
      receiveOT: Le(p)
    });
    let m = this.createOutputData(this.preparedTotal(p), c, p);
    return {
      amount: f,
      fees: d,
      keysetId: c.id,
      inputs: u,
      keepOutputs: m
    };
  }
  sendOffline(t, n, r) {
    let i = this.parseAmount(t, "sendOffline"), s = _t(n), { requireDleq: o = !1, includeFees: a = !1, exactMatch: u = !0 } = r || {};
    o && (s = s.filter((d) => Is(d))), this.failIf(Ct(s).lessThan(i), "Not enough funds available to send");
    let { keep: l, send: c } = this.selectProofsToSend(s, i, a, u);
    return {
      keep: l,
      send: this._prepareInputsForMint(c, !0, !0)
    };
  }
  async send(t, n, r, i) {
    let s = this.parseAmount(t, "send"), { keysetId: o, includeFees: a = !1 } = r || {};
    i = i ?? {
      send: this.defaultOutputType(),
      keep: this.defaultOutputType()
    };
    try {
      let l = this.defaultOutputType().type === "deterministic", c = (g) => !g || g.type === "random" && (!g.denominations || g.denominations.length === 0);
      if (o || l || !c(i.send) || i.keep && !c(i.keep)) {
        let g = [];
        throw o && g.push("keysetId override"), l && g.push("wallet default is deterministic"), c(i.send) || g.push("non-default send output type"), i.keep && !c(i.keep) && g.push("non-default keep output type"), new h(`Options require a swap: ${g.join(", ")}`);
      }
      let { keep: d, send: f } = this.sendOffline(s, n, {
        includeFees: a,
        exactMatch: !0,
        requireDleq: !1
      });
      for (let g of f) {
        try {
          re(g.secret);
        } catch (m) {
          if (g.secret.trimStart().startsWith("[")) throw m;
          continue;
        }
        throw new h("A locked legacy proof requires a swap");
      }
      let p = a ? this.getFeesForProofs(f) : k.zero();
      if (Ct(f).equals(s.add(p))) return this._logger.info("Successful exactMatch offline selection!"), {
        keep: d,
        send: f
      };
    } catch (l) {
      let c = l instanceof Error ? l.message : "Unknown error";
      this._logger.debug("ExactMatch offline selection failed.", { e: c });
    }
    let u = await this.prepareSwapToSend(s, n, r, i);
    return await this.completeSwap(u, r?.privkey);
  }
  async prepareSwapToSend(t, n, r, i) {
    let s = this.parseAmount(t, "prepareSwapToSend"), o = _t(n), { keysetId: a, includeFees: u = !1, onCountersReserved: l } = r || {};
    await this._ensureOperableKeysets(o.map((C) => C.id), {
      implicit: !0,
      fetchKeys: !1
    }), i = i ?? {
      send: this.defaultOutputType(),
      keep: this.defaultOutputType()
    };
    let c = this.getOutputKeyset(a), d = this.configureOutputs(s, c, i.send ?? this.defaultOutputType(), u), f = this.preparedTotal(d), { keep: p, send: g } = this.selectProofsToSend(o, f, !0);
    if (g.length === 0) {
      let C = Ct(o).toString(), D = this.getFeesForProofs(o).toString();
      this.fail(`Not enough funds available to send: ${C} available, ${f.toString()} required plus up to ${D} input fee`);
    }
    let m = Ct(g), w = this.getFeesForProofs(g), v = f.add(w);
    m.lessThan(v) && this.failIf(!0, "Not enough funds available for swap", {
      selectedSum: m.toString(),
      required: v.toString()
    });
    let x = m.subtract(v), b = this.configureOutputs(x, c, i.keep ?? this.defaultOutputType(), !1, r?.proofsWeHave), E = this.preparedTotal(b), M = await this.addCountersToOutputTypes(c.id, d, b);
    [d, b] = M.outputTypes, M.used && this.safeCallback(l, M.used, { op: "send" }), this._logger.debug("send counters", {
      counter: M.used,
      sendOT: Le(d),
      keepOT: Le(b)
    });
    let A = this.createOutputData(f, c, d), H = this.createOutputData(E, c, b);
    return {
      amount: s,
      fees: w,
      keysetId: c.id,
      inputs: g,
      sendOutputs: A,
      keepOutputs: H,
      unselectedProofs: p
    };
  }
  async completeSwap(t, n) {
    let r = t?.keepOutputs ? t.keepOutputs : [], i = t.sendOutputs ? t.sendOutputs : [], s = t.unselectedProofs ? t.unselectedProofs : [];
    n && (t.inputs = this.signP2PKProofs(t.inputs, n, [...r, ...i]));
    let o = this.createSwapTransaction(t.inputs, r, i), { signatures: a } = await this.withStaleKeysetRepair(() => this.mint.swap(o.payload));
    this.failIf(a.length !== o.outputData.length, `Mint returned ${a.length} signatures, expected ${o.outputData.length}. Inputs may already be spent; if the wallet is seeded, try restoring (NUT-09) to recover.`), this.validateReturnedSignatures(a, o.outputData), await this._ensureKeysetsForSignatures(a);
    let u = o.outputData.map((p, g) => p.toProof(a[g], this.keysetForSignature(a[g].id))), l = Array(u.length), c = Array(o.keepVector.length);
    o.sortedIndices.forEach((p, g) => {
      c[p] = o.keepVector[g], l[p] = u[g];
    });
    let d = [], f = [];
    return l.forEach((p, g) => {
      c[g] ? d.push(p) : f.push(p);
    }), this._logger.debug("SEND COMPLETED", {
      unselectedProofs: s.map((p) => p.amount.toString()),
      keepProofs: d.map((p) => p.amount.toString()),
      sendProofs: f.map((p) => p.amount.toString())
    }), {
      keep: [...d, ...s],
      send: f
    };
  }
  selectProofsToSend(t, n, r = !1, i = !1) {
    let s = this.parseAmount(n, "selectProofsToSend"), { keep: o, send: a } = this._selectProofs(t, s, this._keyChain, r, i);
    return {
      keep: o,
      send: a
    };
  }
  signP2PKProofs(t, n, r, i) {
    let s = _t(t);
    if (!Rn(s)) return cs(s, n, this._logger);
    this.failIfNullish(r, "OutputData is required for SIG_ALL proof signing."), ra(s);
    let [o, ...a] = s, u = o, l = [ia(s, r, i)];
    for (let c of l) u = cs([u], n, this._logger, c)[0];
    return [u, ...a];
  }
  getFeesForProofs(t) {
    let n = k.sum(t.map((r) => this.getProofFeePPK(r))).toBigInt();
    return k.from((n + 999n) / 1000n);
  }
  isPaymentRequestSatisfied(t, n, r, i) {
    let s = t.amount ?? (r === void 0 ? void 0 : k.from(r));
    if (!s) throw new h("amountless payment request: pass the expected amount to check against");
    if (t.unit && t.unit !== this._unit) throw new h(`request unit '${t.unit}' does not match wallet unit '${this._unit}'`);
    if (this.assertProofsInWalletUnit(n), this.assertNoDuplicateProofs(n), t.nut10) {
      let l = t.toP2PKOptions();
      this.failIfNullish(l, `cannot check the request's nut10 lock kind '${t.nut10.kind}'`);
      for (let c of n) this.assertNut10Lock(l, c.secret);
    } else {
      let l = i?.privkeys === void 0 ? [] : [i.privkeys].flat();
      for (let c of n) this.failIf(!this.canPayeeSpend(c, l), "unlocked request: the payee cannot spend a proof");
    }
    let o = t.includesMint(this.mint.mintUrl);
    this.failIf(t.isMintListStrict === !0 && !o, "this wallet's mint is not in the request's strict mint list");
    let a = k.zero();
    if (t.supportedMethods?.length) {
      let { disabled: l, params: c } = this.getMintInfo().isSupported(5), d = l ? [] : c.filter((f) => f.unit === this._unit).map((f) => f.method);
      this.failIf(!t.supportedMethods.some((f) => d.includes(f.method)), `mint cannot melt ${this._unit} via any method the request accepts`), a = o ? k.zero() : t.feesFor(this.mint.mintUrl, d);
    }
    let u = s.add(a).add(this.getFeesForProofs(n));
    return Ct(n).compareTo(u) >= 0;
  }
  assertNut10Lock(t, n) {
    let r;
    try {
      Xo(n);
      let [i, s] = re(n), o = Ra({
        kind: i,
        data: s.data,
        tags: s.tags
      });
      r = o && JSON.stringify(Pn(o));
    } catch {
      r = void 0;
    }
    this.failIfNullish(r, "nut10 request: proof does not carry a valid NUT-10 lock of the requested kind"), this.failIf(r !== JSON.stringify(Pn(t)), "nut10 request: proof lock is not the requested spending condition");
  }
  canPayeeSpend(t, n) {
    try {
      re(t.secret);
    } catch (r) {
      if (typeof t.secret != "string" || t.secret.trimStart().startsWith("[")) throw r;
      return !0;
    }
    return ah(t, n);
  }
  assertNoDuplicateProofs(t) {
    let n = /* @__PURE__ */ new Set();
    for (let [r, i] of t.entries()) this.failIf(n.has(i.secret), `Duplicate proof at index ${r}: each proof may appear only once`, { index: r }), n.add(i.secret);
  }
  assertProofsInWalletUnit(t) {
    let n = t.find((r) => !this._keyChain.isUnitKeyset(r.id));
    this.failIf(!!n, `Proof has unrecognised keyset. '${n?.id}' is not a ${this._unit} keyset from this mint`, { id: n?.id });
  }
  getProofFeePPK(t) {
    try {
      return this._keyChain.getKeyset(t.id).fee;
    } catch (n) {
      let r = `Could not get fee. No keyset found for keyset id: ${t.id}`;
      throw this._logger.error(r, {
        e: n,
        keychain: this._keyChain.getKeysets()
      }), new h(r, { cause: n });
    }
  }
  getFeesForKeyset(t, n) {
    let r;
    try {
      r = this._keyChain.getKeyset(n).fee;
    } catch (i) {
      let s = `No keyset found with ID ${n}`;
      throw this._logger.error(s, { e: i }), new h(s, { cause: i });
    }
    return k.from(t).ceilPercent(r, 1e3);
  }
  getFeesToInclude(t, n) {
    let r = this.getKeyset(n?.keysetId), i = this.parseAmount(t, "getFeesToInclude", !0), s = n?.nOutputs ?? Et(i, r.keys).length;
    return k.sum(this.receiveFeeAmounts(s, r));
  }
  maxSpendableAfterFees(t, n = 0) {
    let r = Ct(t), i = this.getFeesForProofs(t).add(n);
    return i.greaterThanOrEqual(r) ? k.zero() : r.subtract(i);
  }
  _prepareInputsForMint(t, n = !1, r = !1) {
    return t.map((i) => {
      let s = this._normalizeWitness(i), { dleq: o, p2pk_e: a, ...u } = i, l = {
        ...u,
        witness: s
      };
      return r && a && (l = {
        ...l,
        p2pk_e: a
      }), n && Is(i) && (l = {
        ...l,
        dleq: o
      }), l;
    });
  }
  _normalizeWitness(t) {
    if (t.witness) {
      try {
        re(t.secret);
      } catch {
        return;
      }
      return typeof t.witness == "string" ? t.witness : JSON.stringify(t.witness);
    }
  }
  decodeToken(t) {
    return Vh(t, this._keyChain.getAllKeysetIds());
  }
  async batchRestore(t = 300, n, r = 0, i) {
    let s = n ?? this.maxArrayLength, o = Math.ceil(t / s), a = i ?? this.keysetId, u = [], l, c = 0;
    for (; c < o; ) {
      let d = await this.restore(r, s, { keysetId: a });
      d.proofs.length > 0 || d.lastCounterWithSignature !== void 0 ? (c = 0, u.push(...d.proofs), l = d.lastCounterWithSignature) : c++, r += s;
    }
    return {
      proofs: u,
      lastCounterWithSignature: l
    };
  }
  async restore(t, n, r) {
    this.failIfNullish(this._seed, "Cashu Wallet must be initialized with a seed to use restore");
    let { keysetId: i } = r || {}, s = i ?? this.keysetId;
    this._strictCachedKeysets || await this._keyChain.ensureKeysetKeys(s);
    let o = this.getKeyset(s), a = Array(n).fill(0), u = this._outputDataCreator.createDeterministicData(0, this._seed, t, o, a), { outputs: l, signatures: c } = await this.mint.restore({ outputs: u.map((g) => g.blindedMessage) });
    await this._ensureKeysetsForSignatures(c);
    let d = {};
    l.forEach((g, m) => d[g.B_] = c[m]);
    let f = [], p;
    for (let g = 0; g < u.length; g++) {
      let m = d[u[g].blindedMessage.B_];
      m && (p = t + g, !m.amount.isZero() && f.push(u[g].toProof(m, this.keysetForSignature(m.id))));
    }
    return {
      proofs: f,
      lastCounterWithSignature: p
    };
  }
  async createMintQuote(t, n, r) {
    try {
      this._keyChain.getCheapestKeyset();
    } catch (o) {
      this._logger.warn(`createMintQuote: no active keyset for unit '${this._unit}' — a paid mint quote could not be redeemed. This will become an error in cashu-ts v5.`, { reason: o.message });
    }
    let i = {
      ...n,
      unit: this._unit
    }, s = await this.mint.createMintQuote(t, i, { normalize: r?.normalize });
    return this.warnQuoteUnit(s, `createMintQuote: ${t}`), {
      ...s,
      unit: s.unit || this._unit
    };
  }
  warnQuoteUnit(t, n) {
    typeof t.unit != "string" || t.unit === "" || t.unit === this._unit || this._logger.warn(`${n}: the mint quoted unit '${t.unit}' but this wallet uses '${this._unit}'. This will become an error in cashu-ts v5.`, {
      quoted: t.unit,
      wallet: this._unit
    });
  }
  warnQuoteAmount(t, n, r) {
    n !== r && this._logger.warn(`${t}: the mint quoted ${r ?? "no amount"} but ${n ?? "no amount"} was requested. This will become an error in cashu-ts v5.`, {
      expected: n,
      quoted: r
    });
  }
  assertBolt11MintQuoteAmount(t, n) {
    if (this.failIf(!t.amount.equals(n), "Mint quote amount does not match", {
      expected: n.toString(),
      quoted: t.amount.toString()
    }), this._unit !== "sat" && this._unit !== "msat") return;
    let r = null;
    try {
      r = kn(t.request);
    } catch {
    }
    let i = this._unit === "sat" ? n.multiplyBy(1e3) : n, s = r !== null && i.equals(r);
    this.failIf(!s, "Mint quote invoice amount does not match the quote", {
      expected: n.toString(),
      invoiceMsat: r
    });
  }
  async createMintQuoteBolt11(t, n) {
    this.requireSupport("mint", "bolt11"), this.requireMintableKeyset("createMintQuoteBolt11");
    let r = this.parseAmount(t, "createMintQuoteBolt11");
    n && (this.getMintInfo().supportsNut04Description("bolt11", this._unit) || this.fail("Mint does not support description for bolt11"));
    let i = {
      unit: this._unit,
      amount: r,
      description: n
    }, s = await this.mint.createMintQuoteBolt11(i);
    return this.warnQuoteUnit(s, "createMintQuoteBolt11"), this.assertBolt11MintQuoteAmount(s, r), {
      ...s,
      unit: s.unit || this._unit
    };
  }
  async createLockedMintQuote(t, n, r) {
    this.requireSupport("mint", "bolt11"), this.requireMintableKeyset("createLockedMintQuote"), this.failIf(typeof n != "string" || n.length === 0, "A pubkey is required to lock the mint quote");
    let i = this.parseAmount(t, "createLockedMintQuote"), { supported: s } = this.getMintInfo().isSupported(20);
    this.failIf(!s, "Mint does not support NUT-20");
    let o = {
      unit: this._unit,
      amount: i,
      description: r,
      pubkey: n
    }, a = await this.mint.createMintQuoteBolt11(o);
    this.warnQuoteUnit(a, "createLockedMintQuote"), this.assertBolt11MintQuoteAmount(a, i), this.failIf(typeof a.pubkey != "string", "Mint returned unlocked mint quote");
    let u = a.pubkey;
    return this.failIf(u.toLowerCase() !== n.toLowerCase(), "Mint quote is not locked to the requested pubkey"), {
      ...a,
      pubkey: u,
      unit: a.unit || this._unit
    };
  }
  async createMintQuoteBolt12(t, n) {
    this.requireSupport("mint", "bolt12"), this.requireMintableKeyset("createMintQuoteBolt12"), this.failIf(typeof t != "string" || t.length === 0, "A pubkey is required to lock the mint quote");
    let r = this.getMintInfo();
    n?.description && !r.supportsNut04Description("bolt12", this._unit) && this.fail("Mint does not support description for bolt12");
    let i = n?.amount === void 0 ? void 0 : this.parseAmount(n.amount, "createMintQuoteBolt12"), s = {
      pubkey: t,
      unit: this._unit,
      amount: i,
      description: n?.description
    }, o = await this.mint.createMintQuoteBolt12(s);
    return this.warnQuoteUnit(o, "createMintQuoteBolt12"), this.warnQuoteAmount("createMintQuoteBolt12", i?.toString() ?? null, o.amount?.toString() ?? null), this.failIf(typeof o.pubkey != "string" || o.pubkey.toLowerCase() !== t.toLowerCase(), "Mint quote is not locked to the requested pubkey"), o;
  }
  async createMintQuoteOnchain(t) {
    this.requireSupport("mint", "onchain"), this.requireMintableKeyset("createMintQuoteOnchain"), this.failIf(typeof t != "string" || t.length === 0, "A pubkey is required to lock the mint quote");
    let n = await this.mint.createMintQuoteOnchain({
      unit: this._unit,
      pubkey: t
    });
    return this.warnQuoteUnit(n, "createMintQuoteOnchain"), this.failIf(typeof n.pubkey != "string" || n.pubkey.toLowerCase() !== t.toLowerCase(), "Mint quote is not locked to the requested pubkey"), {
      ...n,
      unit: n.unit || this._unit
    };
  }
  async checkMintQuote(t, n, r) {
    let i = typeof n == "string" ? n : n.quote;
    return this.mint.checkMintQuote(t, i, { normalize: r?.normalize });
  }
  async checkMintQuoteBolt11(t) {
    let n = typeof t == "string" ? t : t.quote, r = await this.mint.checkMintQuoteBolt11(n);
    return this.assertBolt11MintQuoteAmount(r, r.amount), r;
  }
  async checkMintQuoteBolt12(t) {
    return this.mint.checkMintQuoteBolt12(t);
  }
  async checkMintQuoteOnchain(t) {
    return this.mint.checkMintQuoteOnchain(t);
  }
  async checkMintQuoteBatch(t, n, r) {
    this.requireNut29(t, "checkMintQuoteBatch", "checkMintQuote");
    let i = n.map((s) => typeof s == "string" ? s : s.quote);
    return this.mint.checkMintQuoteBatch(t, i, { normalize: r?.normalize });
  }
  async checkMintQuoteBatchBolt11(t) {
    this.requireNut29("bolt11", "checkMintQuoteBatchBolt11", "checkMintQuoteBolt11");
    let n = t.map((i) => typeof i == "string" ? i : i.quote), r = await this.mint.checkMintQuoteBatchBolt11(n);
    for (let i of r) this.assertBolt11MintQuoteAmount(i, i.amount);
    return r;
  }
  async checkMintQuoteBatchBolt12(t) {
    this.requireNut29("bolt12", "checkMintQuoteBatchBolt12", "checkMintQuoteBolt12");
    let n = t.map((r) => typeof r == "string" ? r : r.quote);
    return this.mint.checkMintQuoteBatchBolt12(n);
  }
  validateReturnedSignatures(t, n) {
    let r = this._requireSigDleq && (this._mintInfo?.isSupported(12).supported ?? !1);
    for (let i = 0; i < t.length; i++) {
      this.failIf(t[i] == null, `Mint response is missing a signature at index ${i}. Inputs may already be spent; if the wallet is seeded, try restoring (NUT-09) to recover.`);
      let s = n[i].blindedMessage.amount.isZero();
      s && t[i].amount.isZero() || (this.failIf(!s && t[i].id !== n[i].blindedMessage.id, `Mint signature keyset id at index ${i} does not match output: expected ${n[i].blindedMessage.id}, got ${t[i].id}. Inputs may already be spent; if the wallet is seeded, try restoring (NUT-09) to recover.`), this.failIf(!s && !t[i].amount.equals(n[i].blindedMessage.amount), `Mint returned signature with wrong amount at index ${i}: expected ${n[i].blindedMessage.amount.toString()}, got ${t[i].amount.toString()}. Inputs may already be spent; if the wallet is seeded, try restoring (NUT-09) to recover.`), this.failIf(r && !t[i].dleq, `Mint supports NUT-12, but returned a signature without DLEQ proof at index ${i}. Inputs may already be spent; if the wallet is seeded, try restoring (NUT-09) to recover.`));
    }
  }
  validateMintQuoteAvailableAmount(t, n, r) {
    if (t !== "bolt12" && t !== "onchain" || !("amount_paid" in n) || !("amount_issued" in n)) return;
    let i = k.from(n.amount_paid), s = k.from(n.amount_issued), o = i.subtract(s);
    this.failIf(r.greaterThan(o), `Mint quote has only ${o.toString()} available to mint; requested ${r.toString()}`, {
      method: t,
      amount_paid: i.toString(),
      amount_issued: s.toString(),
      requestedAmount: r.toString()
    });
  }
  validateMintQuote(t) {
    this.failIf("unit" in t && typeof t.unit == "string" && t.unit !== this.unit, `Quote unit '${t.unit}' does not match wallet unit '${this.unit}'`);
  }
  validateMeltQuote(t) {
    this.failIf("unit" in t && typeof t.unit == "string" && t.unit !== this.unit, `Quote unit '${t.unit}' does not match wallet unit '${this.unit}'`);
  }
  async mintProofs(t, n, r, i, s) {
    let o = await this.prepareMint(t, n, r, i, s);
    return this.completeMint(o);
  }
  async mintProofsBolt11(t, n, r, i) {
    if (this.requireSupport("mint", "bolt11"), typeof n == "string") {
      let o = { quote: n }, a = await this.prepareMint("bolt11", t, o, r, i);
      return this.completeMint(a);
    }
    this.validateMintQuote(n);
    let s = await this.prepareMint("bolt11", t, n, r, i);
    return this.completeMint(s);
  }
  async mintProofsBolt12(t, n, r, i, s) {
    this.requireSupport("mint", "bolt12");
    let o = await this.prepareMint("bolt12", t, n, {
      ...i,
      privkey: r
    }, s);
    return this.completeMint(o);
  }
  async mintProofsOnchain(t, n, r, i, s) {
    this.requireSupport("mint", "onchain");
    let o = await this.prepareMint("onchain", t, n, {
      ...i,
      privkey: r
    }, s);
    return this.completeMint(o);
  }
  async prepareMint(t, n, r, i, s) {
    this.failIf(typeof r == "string", "prepareMint: expected a quote object, not a string ID. Use mintBolt11() which accepts string quote IDs."), this.validateMintQuote(r);
    let o = this.parseAmount(n, `prepareMint: ${t}`);
    this.validateMintQuoteAvailableAmount(t, r, o), s = s ?? this.defaultOutputType();
    let { privkey: a, keysetId: u, proofsWeHave: l, onCountersReserved: c } = i ?? {}, d = this.getOutputKeyset(u), f = this.configureOutputs(o, d, s, !1, l), p = this.preparedTotal(f), g = await this.addCountersToOutputTypes(d.id, f);
    [f] = g.outputTypes, g.used && this.safeCallback(c, g.used, { op: "mintProofs" }), this._logger.debug("mint counter", {
      counter: g.used,
      mintOT: Le(f)
    });
    let m = this.createOutputData(p, d, f), w = m.map((b) => b.blindedMessage), v = {
      outputs: w,
      quote: r.quote
    };
    "pubkey" in r && r.pubkey && this.failIf(!a, "Can not sign locked quote without private key");
    let x;
    if (a) {
      let b = "pubkey" in r ? r.pubkey : void 0;
      this.failIf(!b && Array.isArray(a), "prepareMint: multiple privkeys supplied for a quote without pubkey");
      let E = b ? as(b, a) : Array.isArray(a) ? a[0] : a;
      this.failIf(!E, "prepareMint: privkey is empty or correct privkey not provided"), v.signature = gs(E, r.quote, w), x = ps(E, r.quote, w);
    }
    return {
      method: t,
      payload: v,
      outputData: m,
      keysetId: d.id,
      quote: r,
      legacySignature: x
    };
  }
  async withLegacyQuoteSigFallback(t, n, r) {
    try {
      return await n();
    } catch (i) {
      if (t && Xi(i) && i.code === Jd) return this._logger.warn("Mint rejected the amended NUT-20 quote signature (20008); retrying with the legacy message."), r();
      throw i;
    }
  }
  async completeMint(t) {
    let { payload: n, outputData: r, method: i, legacySignature: s } = t, o = {
      ...n,
      outputs: r.map((u) => u.blindedMessage)
    }, { signatures: a } = await this.withStaleKeysetRepair(() => this.withLegacyQuoteSigFallback(s !== void 0, () => this.mint.mint(i, o), () => this.mint.mint(i, {
      ...o,
      signature: s
    })));
    return this.failIf(a.length !== r.length, `Mint returned ${a.length} signatures, expected ${r.length}. The mint quote may already be marked issued; if the wallet is seeded, try restoring (NUT-09) to recover.`), this.validateReturnedSignatures(a, r), await this._ensureKeysetsForSignatures(a), this._logger.debug("MINT COMPLETED", { amounts: r.map((u) => u.blindedMessage.amount.toString()) }), r.map((u, l) => u.toProof(a[l], this.keysetForSignature(a[l].id)));
  }
  async prepareBatchMint(t, n, r, i) {
    this.failIf(n.length === 0, "prepareBatchMint: no entries provided");
    let s = this.requireNut29(t, "prepareBatchMint", "prepareMint"), o = s?.max_batch_size ?? 100;
    if (n.length > o) {
      let M = s?.max_batch_size == null ? "cashu-ts internal cap" : "mint's advertised limit";
      this.failIf(!0, `prepareBatchMint: batch size ${n.length} exceeds ${M} of ${o}`);
    }
    let { privkey: a, keysetId: u, proofsWeHave: l, onCountersReserved: c } = r ?? {};
    for (let M of n) this.failIf(typeof M.quote == "string", "prepareBatchMint: expected a quote object, not a string ID"), this.validateMintQuote(M.quote);
    n.some((M) => "pubkey" in M.quote && M.quote.pubkey) && this.failIf(!a, "Can not sign locked quotes without private key");
    let d = this.getOutputKeyset(u), f = n.map((M) => this.parseAmount(M.amount, `prepareBatchMint: ${t}`)), p = k.sum(f);
    i = i ?? this.defaultOutputType();
    let g = this.configureOutputs(p, d, i, !1, l), m = await this.addCountersToOutputTypes(d.id, g);
    [g] = m.outputTypes, m.used && this.safeCallback(c, m.used, { op: "mintProofs" });
    let w = this.createOutputData(p, d, g), v = w.map((M) => M.blindedMessage), x = [], b = [], E = !1;
    for (let [M, A] of n.entries()) {
      let H = "pubkey" in A.quote ? A.quote.pubkey : void 0;
      if (H && a) {
        let C = as(H, a);
        x.push(gs(C, A.quote.quote, v)), b.push(ps(C, A.quote.quote, v)), E = !0;
      } else a && !H && this._logger.warn(`prepareBatchMint: privkey supplied but quote #${M + 1} has no pubkey; treating as unlocked`), x.push(null), b.push(null);
    }
    return {
      method: t,
      payload: {
        quotes: n.map((M) => M.quote.quote),
        quote_amounts: f,
        outputs: v,
        ...E ? { signatures: x } : {}
      },
      outputData: w,
      keysetId: d.id,
      quotes: n.map((M) => M.quote),
      ...E ? { legacySignatures: b } : {}
    };
  }
  async completeBatchMint(t) {
    let { method: n, payload: r, outputData: i, legacySignatures: s } = t, o = {
      ...r,
      outputs: i.map((u) => u.blindedMessage)
    }, { signatures: a } = await this.withStaleKeysetRepair(() => this.withLegacyQuoteSigFallback(s !== void 0, () => this.mint.mintBatch(n, o), () => this.mint.mintBatch(n, {
      ...o,
      signatures: s
    })));
    return this.failIf(a.length !== i.length, `Mint returned ${a.length} signatures, expected ${i.length}. The mint quote may already be marked issued; if the wallet is seeded, try restoring (NUT-09) to recover.`), this.validateReturnedSignatures(a, i), await this._ensureKeysetsForSignatures(a), this._logger.debug("BATCH MINT COMPLETED", {
      quotes: r.quotes.length,
      amounts: i.map((u) => u.blindedMessage.amount.toString())
    }), i.map((u, l) => u.toProof(a[l], this.keysetForSignature(a[l].id)));
  }
  async createMeltQuote(t, n, r) {
    let i = {
      ...n,
      unit: this._unit
    }, s = await this.mint.createMeltQuote(t, i, { normalize: r?.normalize });
    return this.warnQuoteUnit(s, `createMeltQuote: ${t}`), {
      ...s,
      unit: s.unit || this._unit
    };
  }
  assertBolt11MeltQuoteAmount(t, n) {
    this.meltQuoteExceeds(t, n) && this.fail("Melt quote amount exceeds the invoice amount", {
      quoted: t.amount.toString(),
      invoiceMsat: k.from(n).toString()
    });
  }
  meltQuoteExceeds(t, n) {
    if (this._unit !== "sat" && this._unit !== "msat" || n === null) return !1;
    let r = k.from(n), i = this._unit === "sat" ? r.ceilPercent(1, 1e3) : r;
    return t.amount.greaterThan(i);
  }
  async createMeltQuoteBolt11(t, n) {
    this.requireSupport("melt", "bolt11");
    let r = n === void 0 ? void 0 : this.parseAmount(n, "createMeltQuoteBolt11");
    n !== void 0 && this.failIf(td(t), "amountMsat supplied but invoice already contains an amount. Leave amountMsat undefined for non-zero invoices.");
    let i = this._mintInfo?.supportsAmountless?.("bolt11", this._unit) ?? !1, s = {
      unit: this._unit,
      request: t,
      ...i && r !== void 0 ? { options: { amountless: { amount_msat: r } } } : {}
    }, o = await this.mint.createMeltQuoteBolt11(s), a = null;
    try {
      a = kn(t);
    } catch {
    }
    return a === null && r !== void 0 && (a = r), this.warnQuoteUnit(o, "createMeltQuoteBolt11"), this.assertBolt11MeltQuoteAmount(o, a), {
      ...o,
      unit: o.unit || this._unit,
      request: o.request || t
    };
  }
  async createMeltQuoteBolt12(t, n) {
    this.requireSupport("melt", "bolt12");
    let r = n === void 0 ? void 0 : this.parseAmount(n, "createMeltQuoteBolt12"), i = await this.mint.createMeltQuoteBolt12({
      unit: this._unit,
      request: t,
      options: r ? { amountless: { amount_msat: r } } : void 0
    });
    return this.warnQuoteUnit(i, "createMeltQuoteBolt12"), this.meltQuoteExceeds(i, r ?? null) && this.warnQuoteAmount("createMeltQuoteBolt12", `at most ${r.toString()} msat`, i.amount.toString()), i;
  }
  async createMeltQuoteOnchain(t, n) {
    this.requireSupport("melt", "onchain");
    let r = this.parseAmount(n, "createMeltQuoteOnchain"), i = await this.mint.createMeltQuoteOnchain({
      unit: this._unit,
      request: t,
      amount: r
    });
    return this.warnQuoteUnit(i, "createMeltQuoteOnchain"), this.warnQuoteAmount("createMeltQuoteOnchain", r.toString(), i.amount.toString()), {
      ...i,
      unit: i.unit || this._unit
    };
  }
  async createMultiPathMeltQuote(t, n) {
    let r = this.parseAmount(n, "createMultiPathMeltQuote"), { supported: i, params: s } = this.getMintInfo().isSupported(15);
    this.failIf(!i, "Mint does not support NUT-15"), this.failIf(!s?.some((u) => u.method === "bolt11" && u.unit === this._unit), `Mint does not support MPP for bolt11 and ${this._unit}`);
    let o = {
      unit: this._unit,
      request: t,
      options: { mpp: { amount: r } }
    }, a = await this.mint.createMeltQuoteBolt11(o);
    return this.warnQuoteUnit(a, "createMultiPathMeltQuote"), this.assertBolt11MeltQuoteAmount(a, r), {
      ...a,
      request: t,
      unit: this._unit
    };
  }
  async checkMeltQuote(t, n, r) {
    let i = typeof n == "string" ? n : n.quote;
    return this.mint.checkMeltQuote(t, i, { normalize: r?.normalize });
  }
  async checkMeltQuoteBolt11(t) {
    let n = typeof t == "string" ? t : t.quote, r = await this.mint.checkMeltQuoteBolt11(n);
    if (this._unit === "sat" || this._unit === "msat") {
      let i = null;
      try {
        i = kn(r.request);
      } catch {
        this.fail("Melt quote request is not a valid bolt11 invoice");
      }
      this.assertBolt11MeltQuoteAmount(r, i);
    }
    return r;
  }
  async checkMeltQuoteBolt12(t) {
    return this.mint.checkMeltQuoteBolt12(t);
  }
  async checkMeltQuoteOnchain(t) {
    return this.mint.checkMeltQuoteOnchain(t);
  }
  async meltProofs(t, n, r, i, s) {
    let o = await this.prepareMelt(t, n, r, i, s);
    return this.completeMelt(o, i?.privkey);
  }
  async meltProofsBolt11(t, n, r, i) {
    this.requireSupport("melt", "bolt11");
    let s = await this.prepareMelt("bolt11", t, n, r, i);
    return this.completeMelt(s, r?.privkey);
  }
  async meltProofsBolt12(t, n, r, i) {
    this.requireSupport("melt", "bolt12");
    let s = await this.prepareMelt("bolt12", t, n, r, i);
    return this.completeMelt(s, r?.privkey);
  }
  async meltProofsOnchain(t, n, r, i) {
    this.requireSupport("melt", "onchain"), this.validateMeltQuote(t);
    let s = t.fee_options.find((d) => d.fee_index === r);
    this.failIfNullish(s, "feeIndex must match an onchain melt quote fee option", {
      feeIndex: r,
      feeOptions: t.fee_options.map((d) => d.fee_index)
    });
    let o = _t(n);
    await this._ensureOperableKeysets(o.map((d) => d.id), {
      implicit: !0,
      fetchKeys: !1
    });
    let a = this.getFeesForProofs(o), u = Ct(o), l = t.amount.add(s.fee_reserve).add(a);
    this.failIf(u.lessThan(l), "Not enough proofs to cover amount + fee", {
      sendAmount: u.toString(),
      totalRequired: l.toString(),
      amount: t.amount.toString(),
      fee_reserve: s.fee_reserve.toString(),
      inputFee: a.toString()
    });
    let c = await this.prepareMelt("onchain", t, o, i);
    return await this.completeMelt(c, i?.privkey, { extraPayload: { fee_index: r } });
  }
  async prepareMelt(t, n, r, i, s) {
    this.validateMeltQuote(n), s = s ?? this.defaultOutputType();
    let { keysetId: o, onCountersReserved: a, nut08Change: u = !0 } = i || {};
    try {
      await this._ensureOperableKeysets(r.map((g) => g.id), {
        implicit: !0,
        fetchKeys: !1
      });
    } catch (g) {
      if (this._strictCachedKeysets || !(g instanceof Re)) throw g;
      this._logger.warn("Melt input keyset is not listed by the mint; proceeding anyway", { keyset: g.keysetId });
    }
    let l = this.getKeyset(o), c = _t(r), d = Ct(c), f = [];
    this.failIf(d.lessThan(n.amount), "Not enough proofs to cover amount + fee reserve", {
      sendAmount: d.toString(),
      quoteAmount: n.amount.toString()
    });
    let p = d.subtract(n.amount);
    if (s.type === "custom") f = s.data;
    else if (u && p.greaterThan(0)) {
      this.failIf(!l.isActive, "Melt change keyset is inactive. Use an active keyset or set nut08Change: false to forfeit it", { keyset: l.id }), l = this.getOutputKeyset(o);
      let g = Math.max(Ud(p.toBigInt()), 1), m = Array(g).fill(0);
      this._logger.debug("Creating NUT-08 blanks for fee reserve", {
        feeReserve: p,
        denominations: m
      });
      let w = {
        ...s,
        denominations: m
      }, v = await this.addCountersToOutputTypes(l.id, w);
      [w] = v.outputTypes, v.used && this.safeCallback(a, v.used, { op: "meltProofs" }), this._logger.debug("melt counter", {
        counter: v.used,
        meltOT: Le(w)
      }), f = this.createOutputData(0, l, w);
    }
    return {
      method: t,
      inputs: c,
      outputData: f,
      keysetId: l.id,
      quote: n
    };
  }
  async completeMelt(t, n, r) {
    let i = typeof r == "boolean" ? { preferAsync: r } : r ?? {}, s = t.inputs, o = t.outputData.map((m) => m.blindedMessage), a = t.quote.quote;
    n && (s = this.signP2PKProofs(s, n, t.outputData, a)), s = this._prepareInputsForMint(s);
    let u = i.extraPayload;
    if (u) {
      let m = [
        "quote",
        "inputs",
        "outputs",
        "prefer_async"
      ], w = Object.keys(u).filter((v) => m.includes(v));
      this.failIf(w.length > 0, "extraPayload cannot override reserved melt fields", { reserved: w });
    }
    let l = {
      quote: a,
      inputs: s,
      outputs: o,
      ...i.preferAsync ? { prefer_async: !0 } : {},
      ...u
    }, c = await this.withStaleKeysetRepair(() => this.mint.melt(t.method, l)), d = {
      ...t.quote,
      ...c
    }, f = c.change ?? [], p;
    try {
      f.length > 0 && await this._ensureOperableKeysets(f.filter((m) => !m.amount.isZero()).map((m) => m.id), { implicit: !0 }), p = this.createMeltChangeProofs(t.outputData, f);
    } catch (m) {
      throw new Jl(t.outputData, d, { cause: m });
    }
    let g = p.map((m) => m.amount.toString());
    return i.preferAsync ? this._logger.debug("ASYNC MELT REQUESTED", {
      state: c.state,
      changeAmounts: g
    }) : this._logger.debug("MELT COMPLETED", { changeAmounts: g }), {
      quote: d,
      change: p,
      outputData: p.length > 0 ? [] : t.outputData
    };
  }
  createMeltChangeProofs(t, n) {
    this.failIf(n.length > t.length, `Mint returned ${n.length} signatures, but only ${t.length} blanks were provided. Inputs may already be spent; if the wallet is seeded, try restoring (NUT-09) to recover.`);
    let r = n.map((o) => o && {
      ...o,
      amount: k.from(o.amount)
    });
    this.validateReturnedSignatures(r, t);
    let i = r.filter((o) => o.amount.isZero()).length;
    i > 0 && this._logger.warn("Mint returned zero-value change signatures, which NUT-08 requires it to omit", {
      mintUrl: this.mint.mintUrl,
      count: i
    });
    let s = [];
    return r.forEach((o, a) => {
      o.amount.isZero() || s.push(t[a].toProof(o, this.keysetForSignature(o.id)));
    }), s;
  }
  _ensureKeysetsForSignatures(t) {
    return this._ensureOperableKeysets(t.map((n) => n?.amount.isZero() ? void 0 : n?.id), { implicit: !0 });
  }
  keysetForSignature(t) {
    try {
      return this.getKeyset(t);
    } catch (n) {
      throw new h(`Cannot reconstruct proof: keyset ${t} is not loaded in this wallet (may be inactive after rotation). If the wallet is seeded, try restoring (NUT-09) to recover.`, { cause: n });
    }
  }
  async checkProofsStates(t) {
    let n = new TextEncoder(), r = t.map((o) => (o.id !== void 0 && me(o.id, this._logger), cn(n.encode(o.secret)).toHex(!0))), i = this.maxArrayLength, s = [];
    for (let o = 0; o < r.length; o += i) {
      let a = r.slice(o, o + i), { states: u } = await this.mint.check({ Ys: a }), l = {};
      u.forEach((c) => {
        l[c.Y] = c;
      });
      for (let c = 0; c < a.length; c++) {
        let d = l[a[c]];
        this.failIfNullish(d, "Could not find state for proof with Y: " + a[c]), s.push(d);
      }
    }
    return s;
  }
  async verifyMintSignatures(t, n) {
    if (n?.signal?.aborted) throw new Ht("Operation aborted by caller");
    if (this.failIf(t.length > Tn, `Token contains too many proofs: ${t.length}, maximum is ${Tn}`), !this._strictCachedKeysets) for (let r of new Set(t.map((i) => i.id))) {
      if (n?.signal?.aborted) throw new Ht("Operation aborted by caller");
      try {
        await this._keyChain.ensureKeysetKeys(r);
      } catch {
      }
    }
    return ld(t, (r) => this._keyChain.getKeyset(r), n);
  }
  async groupProofsByState(t) {
    let n = await this.checkProofsStates(t), r = {
      unspent: [],
      pending: [],
      spent: []
    };
    for (let i = 0; i < n.length; i++) {
      let s = t[i];
      switch (n[i].state) {
        case fr.UNSPENT:
          r.unspent.push(s);
          break;
        case fr.PENDING:
          r.pending.push(s);
          break;
        case fr.SPENT:
          r.spent.push(s);
          break;
      }
    }
    return r;
  }
}, As, ru = class iu {
  constructor(t, n) {
    this.tokenGeneration = 0, this.sessionGeneration = 0, this.tokens = {}, this.pool = [], this.desiredPoolSize = 100, this.maxPerMint = 100, this.mintUrl = t, this.req = n?.request ?? Ja, this.logger = n?.logger ?? ut;
    let r = Math.max(1, n?.desiredPoolSize ?? this.desiredPoolSize), i = Math.max(1, n?.maxPerMint ?? this.maxPerMint);
    this.desiredPoolSize = Math.min(r, 100), this.maxPerMint = Math.min(i, 100), this.desiredPoolSize !== r && this.logger.warn("AuthManager: desiredPoolSize exceeds internal cap and was clamped", {
      configured: r,
      clampedTo: this.desiredPoolSize
    }), this.maxPerMint !== i && this.logger.warn("AuthManager: maxPerMint exceeds internal cap and was clamped", {
      configured: i,
      clampedTo: this.maxPerMint
    });
  }
  attachOIDC(t) {
    return this.oidc && this.oidcListener && this.oidc.removeTokenListener(this.oidcListener), this.oidc && this.oidc !== t && (this.tokens = {}), this.tokenGeneration++, this.sessionGeneration++, this.oidc = t, this.bindOIDC(), this;
  }
  bindOIDC() {
    let t = this.oidc;
    if (!t) return;
    this.oidcListener && t.removeTokenListener(this.oidcListener);
    let n = (r, i) => {
      if (this.oidc !== t || i === "refresh" && this.oidcListener !== n) {
        this.logger.warn("AuthManager: ignoring tokens from an earlier session");
        return;
      }
      this.updateFromOIDC(r, i);
    };
    this.oidcListener = n, t.addTokenListener(n);
  }
  get poolSize() {
    return this.pool.length;
  }
  get poolTarget() {
    return this.desiredPoolSize;
  }
  get activeAuthKeysetId() {
    try {
      return this.keychain?.getCheapestKeyset().id;
    } catch {
      return;
    }
  }
  get hasCAT() {
    return !!this.tokens.accessToken;
  }
  getCAT() {
    return this.tokens.accessToken;
  }
  setCAT(t) {
    this.tokenGeneration++, this.sessionGeneration++, this.tokens = { accessToken: t }, this.bindOIDC();
  }
  async ensureCAT(t) {
    if (this.validForAtLeast(t) || !this.oidc || !this.tokens.refreshToken) return this.tokens.accessToken;
    if (this.inflightRefresh?.session !== this.sessionGeneration) {
      let r = this.tokenGeneration, i = this.sessionGeneration, s = (async () => {
        try {
          let o = await this.oidc.refresh(this.tokens.refreshToken);
          this.tokenGeneration === r && this.updateFromOIDC(o, "refresh");
        } catch (o) {
          this.logger.warn("AuthManager: CAT refresh failed", { err: o });
        }
      })();
      this.inflightRefresh = {
        session: i,
        promise: s
      };
    }
    let n = this.inflightRefresh;
    try {
      await n.promise;
    } finally {
      this.inflightRefresh === n && (this.inflightRefresh = void 0);
    }
    return this.validForAtLeast(0) ? this.tokens.accessToken : void 0;
  }
  validForAtLeast(t = iu.MIN_VALID_SECS) {
    let { accessToken: n, expiresAt: r } = this.tokens;
    return n ? r ? Date.now() + t * 1e3 < r : !0 : !1;
  }
  updateFromOIDC(t, n) {
    if (!t.access_token) return;
    this.tokenGeneration++, n === "signin" && this.sessionGeneration++;
    let r = Date.now();
    if (this.tokens.accessToken = t.access_token, this.tokens.refreshToken = t.refresh_token || (n === "refresh" ? this.tokens.refreshToken : void 0), typeof t.expires_in == "number" && t.expires_in > 0) this.tokens.expiresAt = r + t.expires_in * 1e3;
    else {
      let i = this.parseJwtExpSec(t.access_token);
      this.tokens.expiresAt = i ? i * 1e3 : void 0;
    }
    this.bindOIDC(), this.logger.debug("AuthManager: OIDC tokens updated", { expiresAt: this.tokens.expiresAt });
  }
  async ensure(t) {
    if (await this.init(), this.pool.length >= t) return;
    let n = Math.max(this.desiredPoolSize, t), r = this.getBatMaxMint(), i = Math.min(n - this.pool.length, r);
    i <= 0 || await this.topUp(i);
  }
  async getBlindAuthToken({ method: t, path: n }) {
    return this.info && !this.info.requiresBlindAuthToken(t, n) && this.logger.warn("Endpoint is not marked as protected by NUT-22; still issuing BAT", { method: t }), this.withLock(async () => {
      if (await this.ensure(1), this.pool.length === 0) throw new h("AuthManager: no BATs available and minting failed");
      let r = this.pool.pop();
      return this.logger.debug("AuthManager: BAT requested", {
        method: t,
        remaining: this.pool.length
      }), tf(r);
    });
  }
  importPool(t, n = "replace") {
    n === "replace" && (this.pool = []);
    let r = new Map(this.pool.map((i) => [i.secret, i]));
    for (let i of t) !i || !i.secret || !i.C || !i.id || r.has(i.secret) || (this.pool.push(i), r.set(i.secret, i));
  }
  exportPool() {
    return this.pool.map((t) => ({
      ...t,
      dleq: t.dleq ? { ...t.dleq } : void 0
    }));
  }
  parseJwtExpSec(t) {
    if (!t) return;
    let n = t.split(".");
    if (n.length === 3) try {
      let r = ni(ii(n[1])), i = JSON.parse(r), s = typeof i.exp == "number" ? i.exp : Number(i.exp);
      if (Number.isFinite(s) && s > 0) return s;
    } catch {
      this.logger.warn("JWT access token was malformed.");
    }
  }
  async withLock(t) {
    let n = this.lockChain ?? Promise.resolve(), r, i = new Promise((o) => {
      r = o;
    }), s = n.then(() => i);
    this.lockChain = s;
    try {
      return await n, await t();
    } finally {
      r(), this.lockChain === s && (this.lockChain = void 0);
    }
  }
  async init() {
    if (!this.info) {
      let t = await this.req({
        endpoint: Rt(this.mintUrl, "/v1/info"),
        method: "GET",
        logger: this.logger
      });
      this.info = new se(t, this.logger);
    }
    if (!this.keychain) {
      let [t, n] = await Promise.all([this.req({
        endpoint: Rt(this.mintUrl, "/v1/auth/blind/keysets"),
        method: "GET",
        logger: this.logger
      }), this.req({
        endpoint: Rt(this.mintUrl, "/v1/auth/blind/keys"),
        method: "GET",
        logger: this.logger
      })]);
      if (!Array.isArray(t.keysets) || !Array.isArray(n.keysets)) throw new h("AuthManager: mint returned malformed auth keysets");
      if (t.keysets.length > 1e4 || n.keysets.length > 1e4) throw new h("AuthManager: mint returned more auth keysets than can be processed");
      let r = t.keysets.map((o) => vi(o)), i = n.keysets.map((o) => ki(o)), s = $r.mintToCacheDTO(this.mintUrl, r, i);
      this.keychain = $r.fromCache(this.mintUrl, "auth", s), this.keychain.getCheapestKeyset();
    }
  }
  getBatMaxMint() {
    if (!this.info) throw new h("AuthManager: mint info not loaded");
    let t = this.info.nuts[22], n = pt(t?.bat_max_mint, "nuts.22.bat_max_mint", this.maxPerMint);
    return Math.max(1, Math.min(this.maxPerMint, n));
  }
  getActiveKeys() {
    if (!this.keychain) throw new h("AuthManager: keyset not loaded for active keyset");
    return this.keychain.getCheapestKeyset();
  }
  async topUp(t) {
    if (!this.info) throw new h("AuthManager: mint info not loaded");
    let n = this.info.requiresClearAuthToken("POST", "/v1/auth/blind/mint"), r = this.sessionGeneration, i;
    if (n) {
      if (i = await this.ensureCAT(), this.sessionGeneration !== r) throw new h("AuthManager: session changed while obtaining BATs");
      if (!i) throw new h("AuthManager: Clear-auth token required for /v1/auth/blind/mint but not available. Authenticate with the mint to obtain a CAT first.");
    }
    let s = this.getActiveKeys(), o = gt.createRandomData(t, s), a = { outputs: o.map((f) => f.blindedMessage) }, u = {};
    i && (u["Clear-auth"] = i);
    let l = await this.req({
      endpoint: Rt(this.mintUrl, "/v1/auth/blind/mint"),
      method: "POST",
      headers: u,
      ...i ? { redirect: "error" } : {},
      requestBody: a,
      logger: this.logger
    });
    if (!Array.isArray(l?.signatures) || l.signatures.length !== o.length) throw new h("AuthManager: bad BAT mint response");
    let c = l.signatures.map((f) => ({
      ...f,
      amount: k.from(f.amount)
    })), d = o.map((f, p) => f.toProof(c[p], s));
    for (let f of d) if (!bi(f, s)) throw new h("AuthManager: mint returned BAT with invalid DLEQ");
    if (n && this.sessionGeneration !== r) throw new h("AuthManager: session changed while obtaining BATs");
    this.pool.push(...d), this.logger.debug("AuthManager: performed topUp", {
      minted: d.length,
      pool: this.pool.length
    });
  }
};
As = ru, As.MIN_VALID_SECS = 30;
function tf(e) {
  return `authA${No(St(JSON.stringify({
    id: e.id,
    secret: e.secret,
    C: e.C
  })))}`;
}
async function Jf(e, t) {
  let n = new ru(e, {
    desiredPoolSize: t?.authPool ?? 10,
    maxPerMint: t?.authPool ?? 10,
    logger: t?.logger
  }), r = new Si(e, {
    authProvider: n,
    logger: t?.logger
  }), i = await r.oidcAuth({
    ...t?.oidc,
    logger: t?.logger
  });
  n.attachOIDC(i);
  let s = new Xd(r, {
    authProvider: n,
    logger: t?.logger
  });
  return await s.loadMint(), {
    mint: r,
    auth: n,
    oidc: i,
    wallet: s
  };
}
var ye = "sigallA";
function su(e, t, n) {
  return { v0: ci(ia(e, t.map((r) => ({ blindedMessage: r })), n), !0) };
}
function ef(e) {
  let t = {
    version: e.version,
    type: e.type
  };
  return e.quote && (t.quote = e.quote), t.inputs = e.inputs, t.outputs = e.outputs, e.witness && (t.witness = e.witness), `${ye}${Bn(St(Mt.stringify(t) ?? "{}"))}`;
}
function nf(e) {
  if (!e.startsWith(ye)) throw new h(`Invalid signing package: must start with "${ye}"`);
  if (e.length - 7 > 1048576) throw new h(`Signing package exceeds ${ic} characters`);
  let t = e.slice(7), n;
  try {
    n = ni(ii(t));
  } catch (a) {
    throw new h(`Failed to parse signing package: ${a instanceof Error ? a.message : String(a)}`, { cause: a });
  }
  let r;
  try {
    r = Mt.parse(n, void 0, { strict: !0 });
  } catch (a) {
    throw new h(`Failed to parse signing package JSON: ${a instanceof Error ? a.message : String(a)}`, { cause: a });
  }
  if (!r || typeof r != "object") throw new h("Signing package must be a JSON object");
  let i = r, s = i.version;
  if (s !== ye) throw new h(`Invalid signing package version: ${s}`);
  let o = i.type;
  if (o !== "swap" && o !== "melt") throw new h(`Invalid signing package type: ${o}`);
  if (o === "melt" && (typeof i.quote != "string" || i.quote.length === 0)) throw new h("Melt signing package requires a quote");
  if (!Array.isArray(i.inputs)) throw new h("Signing package inputs must be an array");
  for (let a = 0; a < i.inputs.length; a++) {
    let u = i.inputs[a];
    if (!u || typeof u != "object") throw new h(`Invalid input at index ${a}`);
    if (typeof u.secret != "string") throw new h(`Input ${a}: secret must be string`);
    if (typeof u.C != "string") throw new h(`Input ${a}: C must be string`);
  }
  if (!Array.isArray(i.outputs)) throw new h("Signing package outputs must be an array");
  for (let a = 0; a < i.outputs.length; a++) {
    let u = i.outputs[a];
    if (!u || typeof u != "object") throw new h(`Invalid output at index ${a}`);
    if (typeof u.amount != "number" && typeof u.amount != "bigint") throw new h(`Output ${a}: amount must be a number or bigint`);
    if (!u.B_ || typeof u.B_ != "string") throw new h(`Output ${a}: B_ invalid`);
    if (!u.id || typeof u.id != "string") throw new h(`Output ${a}: id invalid`);
    u.amount = k.from(u.amount);
  }
  if (i.witness !== void 0) {
    let a = i.witness;
    if (!a || typeof a != "object" || !Array.isArray(a.signatures) || a.signatures.some((u) => typeof u != "string")) throw new h("Signing package witness.signatures must be a string array");
  }
  return {
    version: ye,
    type: o,
    ...o === "melt" ? { quote: i.quote } : {},
    inputs: i.inputs.map((a) => ({
      secret: a.secret,
      C: a.C
    })),
    outputs: i.outputs.map((a) => ({
      amount: a.amount,
      id: a.id,
      B_: a.B_
    })),
    ...i.witness ? { witness: { signatures: i.witness.signatures } } : {}
  };
}
var rf = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, sf = /^[0-9a-f]{64}$/i, of = /^0[23][0-9a-f]{64}$/i;
function Es(e) {
  if (!of.test(e)) return !1;
  try {
    return wt(e), !0;
  } catch {
    return !1;
  }
}
function af(e, t) {
  if (!sf.test(t)) throw new h("Private key must be 64 hex characters");
  if ((e.witness?.signatures.length ?? 0) >= 64) throw new h("Witness already at the 64-signature limit");
  if (ra(e.inputs), e.inputs.forEach((n, r) => {
    if (!Es(n.C)) throw new h(`Input ${r}: C must be a compressed secp256k1 point`);
  }), e.outputs.forEach((n, r) => {
    if (!Es(n.B_)) throw new h(`Output ${r}: B_ must be a compressed secp256k1 point`);
  }), e.quote !== void 0 && !rf.test(e.quote)) throw new h("Melt quote id must be a UUID");
  ta(e.inputs[0].secret, t);
}
function uf(e, t) {
  af(e, t);
  let n = [hn(su(e.inputs, e.outputs, e.quote).v0, t)];
  return {
    ...e,
    witness: { signatures: [...e.witness?.signatures || [], ...n] }
  };
}
function lf(e) {
  let t = [...e.keepOutputs || [], ...e.sendOutputs || []];
  return ou("swap", e.inputs, t.map((n) => n.blindedMessage));
}
function cf(e) {
  return ou("melt", e.inputs, e.outputData.map((t) => t.blindedMessage), e.quote.quote);
}
function ou(e, t, n, r) {
  return {
    version: ye,
    type: e,
    ...r ? { quote: r } : {},
    inputs: t.map((i) => ({
      secret: i.secret,
      C: i.C
    })),
    outputs: n
  };
}
function hf(e, t) {
  let n = au(t.inputs, e);
  return {
    ...t,
    inputs: n
  };
}
function df(e, t) {
  let n = au(t.inputs, e);
  return {
    ...t,
    inputs: n
  };
}
function au(e, t) {
  if (!t.witness?.signatures.length) throw new h("No signatures to merge");
  if (e.length === 0) return e;
  let [n, ...r] = e, i = Zn(n.witness), s = i?.signatures ?? [];
  return [{
    ...n,
    witness: {
      ...i ?? {},
      signatures: [...s, ...t.witness.signatures]
    }
  }, ...r];
}
var Xf = {
  computeDigests: su,
  extractSwapPackage: lf,
  extractMeltPackage: cf,
  serializePackage: ef,
  deserializePackage: nf,
  signPackage: uf,
  signDigest: hn,
  mergeSwapPackage: hf,
  mergeMeltPackage: df
};
export {
  k as Amount,
  ot as AmountError,
  pc as AmountWithUnit,
  Ce as AmountWithUnitError,
  ru as AuthManager,
  h as CTSError,
  Ht as CallerAbortError,
  fr as CheckStateEnum,
  ff as ConsoleLogger,
  ve as HttpResponseError,
  Mt as JSONInt,
  $r as KeyChain,
  gr as Keyset,
  mf as LEGACY_KEYSET_ID_LENGTH,
  Te as LockBuilder,
  Kf as MAX_SUPPORTED_KEYSET_VERSION_BYTE,
  xs as MeltBuilder,
  Jl as MeltChangeError,
  Yd as MeltOnchainBuilder,
  Va as MeltQuoteState,
  Si as Mint,
  yr as MintBuilder,
  se as MintInfo,
  Ro as MintOperationError,
  He as MintQuoteState,
  ke as NetworkError,
  dd as OIDCAuth,
  gt as OutputData,
  Sf as P2BK_DST,
  Gf as P2PKBuilder,
  Hh as PaymentRequest,
  Br as PaymentRequestTransportType,
  tc as RateLimitError,
  Vd as ReceiveBuilder,
  Ss as SendBuilder,
  Xf as SigAll,
  ih as SigFlags,
  Xl as StaleKeysetError,
  Eo as UncancellableReadError,
  Re as UnknownKeysetError,
  Cd as WSConnection,
  Xd as Wallet,
  zd as WalletCounters,
  Wd as WalletEvents,
  Zd as WalletOps,
  zo as assertSecpPoint,
  Go as assertSecretKind,
  ra as assertSigAllInputs,
  ta as assertSignerAuthorised,
  me as assertSpendableVersion,
  Rf as bigIntStringify,
  Ge as blindMessage,
  kn as bolt11AmountMsat,
  rd as bolt11PaymentHash,
  id as bolt11PreimageMatches,
  ia as buildP2PKSigAllMessageV0,
  ah as canSpendP2PKWithKeys,
  ci as computeMessageDigest,
  Jc as constructUnblindedSignature,
  Jf as createAuthWallet,
  yf as createBlindSignature,
  Ef as createDLEQProof,
  Yf as createEphemeralCounterSource,
  bh as createHTLCHash,
  Bf as createHTLCsecret,
  kf as createNewMintKeys,
  xf as createP2PKsecret,
  wf as createRandomRawBlindedMessage,
  Wn as createRandomSecretKey,
  Wo as createSecret,
  la as createSecretAndBlindingFactorDeriver,
  Ff as decodePaymentRequest,
  Ee as dedupeP2PKPubkeys,
  Tf as deriveBlindingFactor,
  Da as deriveKeysetId,
  nh as deriveP2BKBlindedPubkeys,
  rh as deriveP2BKSecretKey,
  ls as deriveP2BKSecretKeys,
  Mf as deriveSecret,
  mi as deriveSecretAndBlindingFactor,
  vf as deserializeMintKeys,
  Df as deserializeProofs,
  Vf as deserializeSwapPreview,
  as as findSigningKey,
  Vo as getDataField,
  Vh as getDecodedToken,
  Qf as getDecodedTokenBinary,
  $f as getEncodedToken,
  zf as getEncodedTokenBinary,
  _h as getHTLCWitnessPreimage,
  Cf as getKeysetAmounts,
  Vc as getKeysetIdInt,
  Xo as getP2PKExpectedWitnessPubkeys,
  Cn as getP2PKSigFlag,
  pi as getP2PKWitnessSignatures,
  jo as getPubKeyFromPrivKey,
  Zo as getSecretData,
  Gn as getSecretKind,
  nn as getTag,
  Lt as getTagInt,
  dn as getTagScalar,
  di as getTags,
  Lf as getTokenMetadata,
  Mr as getValidSigners,
  La as hasCorrespondingKey,
  If as hasP2PKSignedProof,
  eh as hasTag,
  bi as hasValidDleq,
  cn as hashToCurve,
  Fo as hash_e,
  rn as hexToNumber,
  Wf as injectWebSocketImpl,
  td as invoiceHasAmountInHRP,
  Of as isHTLCSpendAuthorised,
  On as isLegacyKeysetId,
  Xi as isMintOperationError,
  Nt as isObj,
  Jo as isP2PKKnownTagKey,
  Rn as isP2PKSigAll,
  Af as isP2PKSpendAuthorised,
  vt as isRecord,
  Me as isValidHex,
  Rt as joinUrls,
  na as maybeDeriveP2BKPrivateKeys,
  bf as meetsSignerThreshold,
  pf as mnemonicToSeedSync,
  Xn as normalizeMintUrl,
  Pn as normalizeP2PKOptions,
  _t as normalizeProofAmounts,
  Qe as nullIfUndefined,
  Cr as numberToHexPadded64,
  qf as parseHTLCSecret,
  Tt as parseP2PKSecret,
  re as parseSecret,
  Zn as parseWitnessData,
  gf as pointFromBytes,
  wt as pointFromHex,
  hn as schnorrSignDigest,
  Xc as schnorrSignMessage,
  Qo as schnorrVerifyDigest,
  hi as schnorrVerifyMessage,
  mr as selectProofsRGLI,
  Ld as selectProofsRotating,
  th as serializeMintKeys,
  Uf as serializeProofs,
  Zf as serializeSwapPreview,
  jf as setGlobalRequestOptions,
  ps as signMintQuote,
  uh as signP2PKProof,
  cs as signP2PKProofs,
  Nf as sortProofsById,
  Et as splitAmount,
  Jh as stripDleq,
  Ct as sumProofs,
  Yc as unblindSignature,
  aa as verifyDLEQProof,
  ua as verifyDLEQProof_reblind,
  Xh as verifyDleqIfPresent,
  vh as verifyHTLCHash,
  kh as verifyHTLCSpendingConditions,
  Pf as verifyMintQuoteSignature,
  ld as verifyMintSignatures,
  ea as verifyP2PKSpendingConditions,
  Hf as verifyReceivedProofs,
  _f as verifyUnblindedSignature,
  Nn as versionName
};
