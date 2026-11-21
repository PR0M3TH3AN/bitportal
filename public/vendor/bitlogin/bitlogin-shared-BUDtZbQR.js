import { C as Pe, D as bt, E as At, h as vt, u as he, a as Et, A as Je, M as St, B as _t, c as Nt, p as It, y as kt, b as Ot, N as xt, v as Re, O as qe } from "./bitlogin-shared-Cj9s0_W_.js";
import { c as G } from "./bitlogin-shared-DkSVqQeC.js";
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function Lt(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in t && t.BYTES_PER_ELEMENT === 1;
}
function Be(t) {
  if (typeof t != "boolean")
    throw new TypeError(`boolean expected, not ${t}`);
}
function ye(t) {
  if (typeof t != "number")
    throw new TypeError("number expected, got " + typeof t);
  if (!Number.isSafeInteger(t) || t < 0)
    throw new RangeError("positive integer expected, got " + t);
}
function T(t, e, r = "") {
  const n = Lt(t), s = t?.length, o = e !== void 0;
  if (!n || o && s !== e) {
    const i = r && `"${r}" `, c = o ? ` of length ${e}` : "", l = n ? `length=${s}` : `type=${typeof t}`, d = i + "expected Uint8Array" + c + ", got " + l;
    throw n ? new RangeError(d) : new TypeError(d);
  }
  return t;
}
function K(t) {
  return new Uint32Array(t.buffer, t.byteOffset, Math.floor(t.byteLength / 4));
}
function Fe(...t) {
  for (let e = 0; e < t.length; e++)
    t[e].fill(0);
}
const H = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68, Mt = (t) => t << 24 & 4278190080 | t << 8 & 16711680 | t >>> 8 & 65280 | t >>> 24 & 255, Dt = (t) => {
  for (let e = 0; e < t.length; e++)
    t[e] = Mt(t[e]);
  return t;
}, B = H ? (t) => t : Dt;
function Pt(t, e) {
  return !t.byteLength || !e.byteLength ? !1 : t.buffer === e.buffer && // best we can do, may fail with an obscure Proxy
  t.byteOffset < e.byteOffset + e.byteLength && // a starts before b end
  e.byteOffset < t.byteOffset + t.byteLength;
}
function Kn(t, e) {
  if (Pt(t, e) && t.byteOffset < e.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function Rt(t, e) {
  if (e == null || typeof e != "object")
    throw new Error("options must be defined");
  return Object.assign(t, e);
}
const jn = /* @__NO_SIDE_EFFECTS__ */ (t, e) => {
  function r(n, ...s) {
    if (T(n, void 0, "key"), t.nonceLength !== void 0) {
      const a = s[0];
      T(a, t.varSizeNonce ? void 0 : t.nonceLength, "nonce");
    }
    const o = t.tagLength;
    o && s[1] !== void 0 && T(s[1], void 0, "AAD");
    const i = e(n, ...s), c = (a, u) => {
      if (u !== void 0) {
        if (a !== 2)
          throw new Error("cipher output not supported");
        T(u, void 0, "output");
      }
    };
    let l = !1;
    return {
      encrypt(a, u) {
        if (l)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return l = !0, T(a), c(i.encrypt.length, u), i.encrypt(a, u);
      },
      decrypt(a, u) {
        if (T(a), o && a.length < o)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + o);
        return c(i.decrypt.length, u), i.decrypt(a, u);
      }
    };
  }
  return Object.assign(r, t), r;
};
function Tt(t, e, r = !0) {
  if (e === void 0)
    return new Uint8Array(t);
  if (T(e, void 0, "output"), e.length !== t)
    throw new Error('"output" expected Uint8Array of length ' + t + ", got: " + e.length);
  if (r && !ae(e))
    throw new Error("invalid output, must be aligned");
  return e;
}
function ae(t) {
  return t.byteOffset % 4 === 0;
}
function We(t) {
  return Uint8Array.from(T(t));
}
const Ze = (t) => Uint8Array.from(t.split(""), (e) => e.charCodeAt(0)), Ct = B(K(Ze("expand 16-byte k"))), $t = B(K(Ze("expand 32-byte k")));
function f(t, e) {
  return t << e | t >>> 32 - e;
}
const q = 64, Kt = 16, we = 2 ** 32 - 1, ze = /* @__PURE__ */ Uint32Array.of();
function jt(t, e, r, n, s, o, i, c) {
  const l = s.length, d = new Uint8Array(q), a = K(d), u = H && ae(s) && ae(o), W = u ? K(s) : ze, C = u ? K(o) : ze;
  if (!H) {
    for (let g = 0; g < l; i++) {
      if (t(e, r, n, a, i, c), B(a), i >= we)
        throw new Error("arx: counter overflow");
      const w = Math.min(q, l - g);
      for (let p = 0, h; p < w; p++)
        h = g + p, o[h] = s[h] ^ d[p];
      g += w;
    }
    return;
  }
  for (let g = 0; g < l; i++) {
    if (t(e, r, n, a, i, c), i >= we)
      throw new Error("arx: counter overflow");
    const w = Math.min(q, l - g);
    if (u && w === q) {
      const p = g / 4;
      if (g % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let h = 0, $; h < Kt; h++)
        $ = p + h, C[$] = W[$] ^ a[h];
      g += q;
      continue;
    }
    for (let p = 0, h; p < w; p++)
      h = g + p, o[h] = s[h] ^ d[p];
    g += w;
  }
}
function Ut(t, e) {
  const { allowShortKeys: r, extendNonceFn: n, counterLength: s, counterRight: o, rounds: i } = Rt({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, e);
  if (typeof t != "function")
    throw new Error("core must be a function");
  return ye(s), ye(i), Be(o), Be(r), (c, l, d, a, u = 0) => {
    T(c, void 0, "key"), T(l, void 0, "nonce"), T(d, void 0, "data");
    const W = d.length;
    if (a = Tt(W, a, !1), ye(u), u < 0 || u >= we)
      throw new Error("arx: counter overflow");
    const C = [];
    let g = c.length, w, p;
    if (g === 32)
      C.push(w = We(c)), p = $t;
    else if (g === 16 && r)
      w = new Uint8Array(32), w.set(c), w.set(c, 16), p = Ct, C.push(w);
    else
      throw T(c, 32, "arx key"), new Error("invalid key size");
    (!H || !ae(l)) && C.push(l = We(l));
    let h = K(w);
    if (n) {
      if (l.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const j = l.subarray(0, 16);
      if (H)
        n(p, h, K(j), h);
      else {
        const J = B(Uint32Array.from(p));
        n(J, h, K(j), h), Fe(J), B(h);
      }
      l = l.subarray(16);
    } else H || B(h);
    const $ = 16 - s;
    if ($ !== l.length)
      throw new Error(`arx: nonce must be ${$} or 16 bytes`);
    if ($ !== 12) {
      const j = new Uint8Array(12);
      j.set(l, o ? 0 : 12 - l.length), l = j, C.push(l);
    }
    const oe = B(K(l));
    try {
      return jt(t, p, h, oe, d, a, u, i), a;
    } finally {
      Fe(...C);
    }
  };
}
function Bt(t, e, r, n, s, o = 20) {
  let i = t[0], c = t[1], l = t[2], d = t[3], a = e[0], u = e[1], W = e[2], C = e[3], g = e[4], w = e[5], p = e[6], h = e[7], $ = s, oe = r[0], j = r[1], J = r[2], b = i, A = c, v = l, E = d, S = a, _ = u, N = W, I = C, k = g, O = w, x = p, L = h, M = $, D = oe, P = j, R = J;
  for (let Ue = 0; Ue < o; Ue += 2)
    b = b + S | 0, M = f(M ^ b, 16), k = k + M | 0, S = f(S ^ k, 12), b = b + S | 0, M = f(M ^ b, 8), k = k + M | 0, S = f(S ^ k, 7), A = A + _ | 0, D = f(D ^ A, 16), O = O + D | 0, _ = f(_ ^ O, 12), A = A + _ | 0, D = f(D ^ A, 8), O = O + D | 0, _ = f(_ ^ O, 7), v = v + N | 0, P = f(P ^ v, 16), x = x + P | 0, N = f(N ^ x, 12), v = v + N | 0, P = f(P ^ v, 8), x = x + P | 0, N = f(N ^ x, 7), E = E + I | 0, R = f(R ^ E, 16), L = L + R | 0, I = f(I ^ L, 12), E = E + I | 0, R = f(R ^ E, 8), L = L + R | 0, I = f(I ^ L, 7), b = b + _ | 0, R = f(R ^ b, 16), x = x + R | 0, _ = f(_ ^ x, 12), b = b + _ | 0, R = f(R ^ b, 8), x = x + R | 0, _ = f(_ ^ x, 7), A = A + N | 0, M = f(M ^ A, 16), L = L + M | 0, N = f(N ^ L, 12), A = A + N | 0, M = f(M ^ A, 8), L = L + M | 0, N = f(N ^ L, 7), v = v + I | 0, D = f(D ^ v, 16), k = k + D | 0, I = f(I ^ k, 12), v = v + I | 0, D = f(D ^ v, 8), k = k + D | 0, I = f(I ^ k, 7), E = E + S | 0, P = f(P ^ E, 16), O = O + P | 0, S = f(S ^ O, 12), E = E + S | 0, P = f(P ^ E, 8), O = O + P | 0, S = f(S ^ O, 7);
  let m = 0;
  n[m++] = i + b | 0, n[m++] = c + A | 0, n[m++] = l + v | 0, n[m++] = d + E | 0, n[m++] = a + S | 0, n[m++] = u + _ | 0, n[m++] = W + N | 0, n[m++] = C + I | 0, n[m++] = g + k | 0, n[m++] = w + O | 0, n[m++] = p + x | 0, n[m++] = h + L | 0, n[m++] = $ + M | 0, n[m++] = oe + D | 0, n[m++] = j + P | 0, n[m++] = J + R | 0;
}
const Qe = /* @__PURE__ */ Ut(Bt, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
}), et = 2, me = 1, tt = 65536, Ft = 4294967295, Wt = 132, zt = 99, be = 1024 * 1024;
function Un(t, e) {
  const r = Pe(new Uint8Array([2]), bt(e)), s = At.getSharedSecret(t, r, !0).slice(1, 33);
  return vt(he("nip44-v2"), s);
}
function nt(t, e) {
  if (t.length !== 32)
    throw new Error("NIP-44 conversation key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const r = Nt(t, e, 76);
  return {
    chachaKey: r.slice(0, 32),
    chachaNonce: r.slice(32, 44),
    hmacKey: r.slice(44, 76)
  };
}
function Te(t) {
  if (t <= 32)
    return 32;
  const e = 2 ** Math.floor(Math.log2(t - 1) + 1), r = e <= 256 ? 32 : e / 8;
  return r * (Math.floor((t - 1) / r) + 1);
}
const rt = 39 + Te(be) + 32, Vt = Math.ceil(rt / 3) * 4;
function Xt(t) {
  if (t < tt) {
    const r = new Uint8Array(2);
    return new DataView(r.buffer).setUint16(0, t, !1), r;
  }
  const e = new Uint8Array(6);
  return new DataView(e.buffer).setUint32(2, t, !1), e;
}
function Ht(t) {
  const e = t.length;
  if (e < me || e > be)
    throw new Error(`NIP-44 plaintext length must be between ${me} and ${be} bytes on this platform.`);
  const r = Xt(e), n = Te(e), s = new Uint8Array(r.length + n);
  return s.set(r, 0), s.set(t, r.length), s;
}
function Gt(t) {
  const e = new DataView(t.buffer, t.byteOffset, t.byteLength), r = e.getUint16(0, !1);
  let n, s;
  if (r === 0) {
    if (n = e.getUint32(2, !1), s = 6, n < tt)
      throw new Error("NIP-44 payload has inconsistent padding.");
  } else
    n = r, s = 2;
  if (n < me || n > Ft || t.length !== s + Te(n))
    throw new Error("NIP-44 payload has inconsistent padding.");
  return t.slice(s, s + n);
}
function st(t, e, r) {
  return It(kt, t, Pe(e, r));
}
function Yt(t, e) {
  return Jt(t, e, Et(32));
}
function Jt(t, e, r) {
  if (r.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const { chachaKey: n, chachaNonce: s, hmacKey: o } = nt(t, r), i = Ht(he(e)), c = Qe(n, s, i), l = st(o, r, c);
  return Je.encode(Pe(new Uint8Array([et]), r, c, l));
}
function qt(t, e) {
  if (e.startsWith("#"))
    throw new Error("Unsupported NIP-44 non-base64 encoding.");
  if (e.length < Wt || e.length > Vt)
    throw new Error("NIP-44 payload size is outside this platform's supported range.");
  const r = Je.decode(e);
  if (r.length < zt || r.length > rt)
    throw new Error("NIP-44 decoded payload size is outside this platform's supported range.");
  if (r[0] !== et)
    throw new Error(`Unsupported NIP-44 version: ${r[0]}`);
  const n = r.slice(1, 33);
  if (n.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const s = r.slice(r.length - 32), o = r.slice(33, r.length - 32), { chachaKey: i, chachaNonce: c, hmacKey: l } = nt(t, n), d = st(l, n, o);
  if (!St(s, d))
    throw new Error("NIP-44 MAC verification failed: payload is corrupted, tampered, or uses the wrong key.");
  const a = Qe(i, c, o);
  return _t(Gt(a));
}
const ot = 37304, Ae = {
  /** The most a save may hold, in bytes of UTF-8. It has to fit in one note that any relay will take. */
  dataBytes: 32768,
  /** No more saves than this for one world in `perMs`, and in an hour. Counted apart from notes and passes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** A save handed over to be opened is not read past this many characters of content. */
  contentChars: 7e4
}, Zt = /^[a-z0-9][a-z0-9-]{0,31}$/u, Qt = /^[0-9a-f]{64}$/u, en = "Something a world keeps for its visitor. Only they can read it.";
function F(t) {
  return typeof t == "string" && Zt.test(t) ? t : "";
}
function Ce(t) {
  return typeof t == "string" && t.length <= Ae.dataBytes && he(t).length <= Ae.dataBytes;
}
function it(t, e, r) {
  const n = y(e), s = F(r);
  return !n || !s ? "" : Ot(xt(t, he(`nswp-save
${n}
${s}`)));
}
function Bn(t) {
  const e = y(t.world), r = F(t.slot), n = it(t.conversationKey, e, r);
  if (!n || !Ce(t.data)) return null;
  const s = JSON.stringify({ v: 1, world: e, slot: r, data: t.data });
  return {
    kind: ot,
    created_at: Math.floor(t.nowSeconds),
    tags: [
      ["d", n],
      ["alt", en]
    ],
    content: Yt(t.conversationKey, s)
  };
}
function Fn(t, e) {
  const r = y(e.world);
  if (!r || !t || typeof t != "object" || !Qt.test(e.pubkey)) return null;
  const n = t;
  if (n.kind !== ot || n.pubkey !== e.pubkey || typeof n.content != "string" || n.content.length > Ae.contentChars || !Array.isArray(n.tags)) return null;
  let s;
  try {
    s = JSON.parse(qt(e.conversationKey, n.content));
  } catch {
    return null;
  }
  if (!s || typeof s != "object" || s.v !== 1 || s.world !== r) return null;
  const o = F(s.slot);
  if (!o || !Ce(s.data)) return null;
  const i = n.tags.find((c) => Array.isArray(c) && c[0] === "d");
  return !i || i[1] !== it(e.conversationKey, r, o) ? null : { slot: o, data: s.data, at: typeof n.created_at == "number" && Number.isInteger(n.created_at) ? n.created_at : 0 };
}
const ve = 3, Wn = { burst: 6, perMs: 6e4, hourly: 60 }, ie = {
  /** A list handed over to be changed is not read past this many tags, or this much content. */
  tags: 2e4,
  contentChars: 1e5,
  tagItems: 16,
  tagChars: 1e3
}, tn = ["follows", "messages"];
function Q(t) {
  return Array.isArray(t) ? tn.filter((e) => t.includes(e)) : [];
}
const nn = ["nswp:world", "bitlogin:site"], rn = /^[0-9a-f]{64}$/u;
function Ve(t, e) {
  if (t && (t.kind !== ve || !Array.isArray(t.tags)) || !t && !e.fromNothing) return null;
  const r = typeof e.add == "string" ? e.add.toLowerCase() : "", n = typeof e.remove == "string" ? e.remove.toLowerCase() : "";
  if (r === "" == (n === "")) return null;
  const s = r || n;
  if (!rn.test(s) || r && (t?.pubkey ?? e.pubkey) === r) return null;
  const o = t ? t.tags.filter((a) => Array.isArray(a) && a.every((u) => typeof u == "string") && !nn.includes(a[0] ?? "")) : [], i = (a) => a[0] === "p" && typeof a[1] == "string" && a[1].toLowerCase() === s, c = o.some(i);
  if (r ? c : !c) return null;
  const l = r ? [...o.map((a) => [...a]), ["p", r]] : o.filter((a) => !i(a)).map((a) => [...a]), d = Math.max(Math.floor(e.nowSeconds), t ? t.created_at + 1 : 0);
  return { kind: ve, created_at: d, tags: l, content: typeof t?.content == "string" ? t.content : "" };
}
function sn(t, e) {
  if (!t || typeof t != "object") return null;
  const r = t;
  if (r.kind !== ve || r.pubkey !== e || !Array.isArray(r.tags) || r.tags.length > ie.tags || typeof r.content != "string" || r.content.length > ie.contentChars) return null;
  for (const n of r.tags)
    if (!Array.isArray(n) || n.length > ie.tagItems || !n.every((s) => typeof s == "string" && s.length <= ie.tagChars)) return null;
  return Re(t) ? t : null;
}
function zn(t) {
  const e = { add: t.add, remove: t.remove, nowSeconds: t.nowSeconds, pubkey: t.pubkey };
  if (t.list === null || t.list === void 0) return t.seen ? null : Ve(null, { ...e, fromNothing: !0 });
  const r = sn(t.list, t.pubkey);
  return !r || t.seen && r.created_at < t.seen ? null : Ve(r, e);
}
function Vn(t, e) {
  return t === null ? e.answered > 0 && e.newestAt === 0 : t.created_at >= e.newestAt;
}
const Ee = 14, at = 13, on = 1059, an = 10050, ce = {
  /** The most characters in one message. */
  chars: 2e3,
  /** No more than this many relays are put in a list of where messages reach someone. */
  relays: 4,
  /** A wrap handed over to be opened is not read past this many characters of content. */
  wrapChars: 6e4
}, Xn = { burst: 10, perMs: 6e4, hourly: 200 }, Hn = { burst: 600, perMs: 6e4, hourly: 12e3 }, Gn = { burst: 3, perMs: 6e4, hourly: 12 }, le = /^[0-9a-f]{64}$/u, cn = [
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
function ue(t) {
  if (typeof t != "string") return "";
  let e = "";
  for (const r of t.slice(0, ce.chars * 8).normalize("NFC")) {
    const n = r.codePointAt(0);
    e += cn.some(([s, o]) => n >= s && n <= o) ? " " : r;
  }
  return e = e.replace(/[^\S\n]+/gu, " ").replace(/ ?\n ?/gu, `
`).replace(/\n{3,}/gu, `

`).trim(), [...e].slice(0, ce.chars).join("").trim();
}
function ln(t) {
  const e = ue(t.text);
  if (!le.test(t.from) || typeof t.to != "string" || !le.test(t.to) || t.from === t.to || !e) return null;
  const r = { kind: Ee, pubkey: t.from, created_at: Math.floor(t.nowSeconds), tags: [["p", t.to]], content: e };
  return { ...r, id: qe(r) };
}
function Yn(t, e) {
  const r = t.getPublicKey(), n = ln({ from: r, to: e.to, text: e.text, nowSeconds: e.nowSeconds });
  if (!n) return null;
  const s = JSON.stringify(n), o = (i) => t.signEvent({ kind: at, created_at: Math.floor(e.nowSeconds), tags: [], content: t.nip44Encrypt(i, s) });
  return { message: n, seals: [o(n.tags[0][1]), o(r)] };
}
function un(t) {
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    return null;
  }
  return !Re(e) || e.kind !== at || e.tags.length !== 0 ? null : e;
}
function fn(t, e, r) {
  let n;
  try {
    n = JSON.parse(t);
  } catch {
    return null;
  }
  if (!n || typeof n != "object" || n.kind !== Ee || n.pubkey !== e || typeof n.pubkey != "string" || !le.test(n.pubkey) || typeof n.content != "string" || typeof n.created_at != "number" || !Number.isInteger(n.created_at) || !Array.isArray(n.tags) || !n.tags.every((c) => Array.isArray(c) && c.every((l) => typeof l == "string"))) return null;
  const s = [...new Set(n.tags.filter((c) => c[0] === "p" && typeof c[1] == "string" && le.test(c[1])).map((c) => c[1]))], o = ue(n.content);
  return s.length === 0 || !o || n.pubkey !== r && !s.includes(r) ? null : { id: qe({ kind: Ee, pubkey: n.pubkey, created_at: n.created_at, tags: n.tags, content: n.content }), from: n.pubkey, to: s, text: o, at: n.created_at };
}
function Jn(t, e) {
  const r = t.getPublicKey();
  if (!e || typeof e != "object") return null;
  const n = e;
  if (n.kind !== on || typeof n.content != "string" || n.content.length > ce.wrapChars || !Array.isArray(n.tags) || n.tags.length > 20 || !Re(e) || !e.tags.some((s) => s[0] === "p" && s[1] === r)) return null;
  try {
    const s = un(t.nip44Decrypt(e.pubkey, e.content));
    return s ? fn(t.nip44Decrypt(s.pubkey, s.content), s.pubkey, r) : null;
  } catch {
    return null;
  }
}
function dn(t) {
  if (typeof t != "string" || t.length > 200) return "";
  try {
    const e = new URL(t.trim()), r = e.hostname;
    return e.protocol !== "wss:" || e.username || e.password || !r.includes(".") || r.startsWith("[") || /^[0-9.]+$/u.test(r) || /\.(local|localhost|internal|lan|home)$/iu.test(r) ? "" : (e.hash = "", e.href.replace(/\/$/u, ""));
  } catch {
    return "";
  }
}
function qn(t, e) {
  if (!Array.isArray(t) || t.length > 8) return null;
  const r = [...new Set(t.map(dn).filter(Boolean))].slice(0, ce.relays);
  return r.length === 0 ? null : { kind: an, created_at: Math.floor(e), tags: r.map((n) => ["relay", n]), content: "" };
}
const hn = 37306, Xe = 37300, Se = {
  /** No more scores than this for one world in `perMs`, and in an hour. Counted apart from notes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** The most a score may be. */
  most: 9007199254740991,
  /** The longest a board's title may be, in characters. */
  title: 60
}, pn = /^[a-z0-9][a-z0-9-]{0,31}$/u, yn = /^(\d+):([0-9a-f]{64}):(.*)$/su;
function X(t) {
  if (typeof t != "string" || t.length > 200) return "";
  const e = yn.exec(t);
  return e && Number(e[1]) === Xe && e[3] !== "" ? `${Xe}:${e[2]}:${e[3]}` : "";
}
function _e(t) {
  return typeof t == "string" && pn.test(t) ? t : "";
}
function Ne(t) {
  const e = typeof t == "string" && /^\d{1,16}$/u.test(t) ? Number(t) : t;
  return typeof e == "number" && Number.isSafeInteger(e) && e >= 0 && e <= Se.most ? e : null;
}
function Ie(t) {
  if (typeof t != "string") return "";
  let e = "";
  for (const r of t.slice(0, Se.title * 8).normalize("NFC")) {
    const n = r.codePointAt(0), s = n <= 31 || n >= 127 && n <= 159 || n >= 8203 && n <= 8207 || n >= 8232 && n <= 8239 || n >= 8288 && n <= 8303 || n === 65279;
    e += s ? " " : r;
  }
  return [...e.replace(/\s+/gu, " ").trim()].slice(0, Se.title).join("").trim();
}
function gn(t, e) {
  if (t !== "time") return String(e).replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
  const r = Math.round(e / 100), n = Math.floor(r / 600), s = r % 600 / 10;
  return n ? `${n} min ${s.toFixed(1)} s` : `${s.toFixed(1)} s`;
}
function Zn(t) {
  const e = y(t.origin), r = X(t.world), n = _e(t.board), s = Ne(t.score);
  if (!e || !r || !n || s === null) return null;
  const o = Ie(t.title), i = t.format === "time" ? "time" : "number";
  return {
    kind: hn,
    created_at: Math.floor(t.nowSeconds),
    tags: [
      ["d", `${r}/${n}`],
      ["a", r],
      ["board", n, ...o ? [o] : []],
      ["score", String(s), ...i === "time" ? ["time"] : []],
      ["alt", `A score in a world: ${o ? `${o}: ` : ""}${gn(i, s)}`],
      [fe, e]
    ],
    content: ""
  };
}
const wn = 37307, He = {
  /** No more than this many for one world in `perMs`, and in an hour. Counted apart from notes and scores. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** The longest a title may be, in characters. */
  title: 60
}, mn = /^[a-z0-9][a-z0-9-]{0,31}$/u;
function ke(t) {
  return typeof t == "string" && mn.test(t) ? t : "";
}
function Oe(t) {
  if (typeof t != "string") return "";
  let e = "";
  for (const r of t.slice(0, He.title * 8).normalize("NFC")) {
    const n = r.codePointAt(0), s = n <= 31 || n >= 127 && n <= 159 || n >= 8203 && n <= 8207 || n >= 8232 && n <= 8239 || n >= 8288 && n <= 8303 || n === 65279;
    e += s ? " " : r;
  }
  return [...e.replace(/\s+/gu, " ").trim()].slice(0, He.title).join("").trim();
}
function Qn(t) {
  const e = y(t.origin), r = X(t.world), n = ke(t.id), s = Oe(t.title);
  return !e || !r || !n || !s ? null : {
    kind: wn,
    created_at: Math.floor(t.nowSeconds),
    tags: [
      ["d", `${r}/${n}`],
      ["a", r],
      ["achievement", n],
      ["title", s],
      ["alt", `An achievement in a world: ${s}`],
      [fe, e]
    ],
    content: ""
  };
}
const ct = "nswp-signer", lt = "nswp-handoff", pe = 1, ee = {
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
}, bn = [1, 7], An = [4, 13, 14, 15, 1059, 1060, 13194, 22242, 23194, 23195, 24133, 27235, 27300, 27301, 30078], vn = [0, 5, 10002], er = { burst: 2, perMs: 6e4, hourly: 10 }, tr = 5 * 6e4;
function ut(t) {
  return typeof t != "number" || !Number.isInteger(t) || t < 0 || t > 65535 || An.includes(t) ? "never" : bn.includes(t) ? "ordinary" : "careful";
}
const fe = "nswp:world";
function y(t) {
  if (typeof t != "string" || t.length > 300) return "";
  try {
    const e = new URL(t);
    return (e.protocol === "https:" || e.protocol === "http:") && e.origin !== "null" ? e.origin : "";
  } catch {
    return "";
  }
}
function xe(t) {
  if (typeof t != "string") return "";
  let e = "";
  for (const r of t.slice(0, 400).normalize("NFC")) {
    const n = r.codePointAt(0), s = n <= 31 || n >= 127 && n <= 159 || n >= 8203 && n <= 8207 || n >= 8232 && n <= 8239 || n >= 8288 && n <= 8303 || n === 65279;
    e += s ? " " : r;
  }
  return [...e.replace(/\s+/gu, " ").trim()].slice(0, 48).join("").trim();
}
function nr(t, e, r) {
  return ft(t, e, r, (n) => ut(n) === "ordinary");
}
function En(t, e, r) {
  return ft(t, e, r, (n) => ut(n) === "careful" && vn.includes(n));
}
function ft(t, e, r, n) {
  const s = y(e);
  if (!s || !t || typeof t != "object") return null;
  const o = t;
  if (!n(o.kind) || typeof o.content != "string" || [...o.content].length > ee.contentChars || !Array.isArray(o.tags) || o.tags.length > ee.tags) return null;
  const i = [];
  for (const c of o.tags) {
    if (!Array.isArray(c) || c.length === 0 || c.length > ee.tagItems || !c.every((l) => typeof l == "string" && l.length <= ee.tagChars)) return null;
    c[0] !== fe && i.push([...c]);
  }
  return i.push([fe, s]), { kind: o.kind, created_at: Math.floor(r), tags: i, content: o.content };
}
function rr(t = ee, e = []) {
  let r = e.filter((n) => typeof n == "number" && Number.isFinite(n));
  return {
    times: () => [...r],
    take(n) {
      return r = r.filter((s) => n - s < 36e5), r.length >= t.hourly || r.filter((s) => n - s < t.perMs).length >= t.burst ? !1 : (r.push(n), !0);
    }
  };
}
const dt = /^[0-9a-z-]{1,40}$/iu, U = /^[0-9a-f]{64}$/u, sr = (t) => ({ nswp: ct, v: pe, ...t });
function or(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.nswp !== ct || e.v !== pe || typeof e.id != "string" || !dt.test(e.id)) return null;
  if (e.t === "state") return { t: "state", id: e.id };
  if (e.t === "lock") return { t: "lock", id: e.id };
  if (e.t === "sign" && e.event && typeof e.event == "object") return { t: "sign", id: e.id, event: e.event };
  if (e.t === "propose" && e.event && typeof e.event == "object") return { t: "propose", id: e.id, event: e.event };
  if (e.t === "wallet") return { t: "wallet", id: e.id };
  if (e.t === "pay" && G(e.invoice)) return { t: "pay", id: e.id, invoice: G(e.invoice) };
  if (e.t === "pass" && typeof e.session == "string" && U.test(e.session)) return { t: "pass", id: e.id, session: e.session };
  if (e.t === "save" && F(e.slot) && Ce(e.data)) return { t: "save", id: e.id, slot: F(e.slot), data: e.data };
  if (e.t === "find" && F(e.slot)) return { t: "find", id: e.id, slot: F(e.slot) };
  if (e.t === "open" && e.event && typeof e.event == "object") return { t: "open", id: e.id, event: e.event };
  if (e.t === "want" && e.permissions === void 0 && Array.isArray(e.more)) return { t: "wantMore", id: e.id, more: Q(e.more) };
  if (e.t === "follow" && (e.list === null || e.list && typeof e.list == "object")) {
    const r = typeof e.add == "string" && U.test(e.add), n = typeof e.remove == "string" && U.test(e.remove);
    return r === n ? null : { t: "follow", id: e.id, list: e.list, ...r ? { add: e.add } : { remove: e.remove } };
  }
  if (e.t === "score" && X(e.world) && _e(e.board) && Ne(e.score) !== null) return { t: "score", id: e.id, world: X(e.world), board: _e(e.board), score: Ne(e.score), ...Ie(e.title) ? { title: Ie(e.title) } : {}, ...e.format === "time" ? { format: "time" } : {} };
  if (e.t === "achieve" && X(e.world) && ke(e.achievement) && Oe(e.title))
    return { t: "achieve", id: e.id, world: X(e.world), achievement: ke(e.achievement), title: Oe(e.title) };
  if (e.t === "seal" && typeof e.to == "string" && U.test(e.to) && ue(e.text)) return { t: "seal", id: e.id, to: e.to, text: ue(e.text) };
  if (e.t === "unwrap" && e.event && typeof e.event == "object") return { t: "unwrap", id: e.id, event: e.event };
  if (e.t === "reach" && Array.isArray(e.relays) && e.relays.length <= 8 && e.relays.every((r) => typeof r == "string" && r.length <= 200)) return { t: "reach", id: e.id, relays: e.relays };
  if (e.t === "want") {
    const r = wt(e.permissions);
    return r ? { t: "want", id: e.id, permissions: r } : null;
  }
  return (e.t === "encrypt" || e.t === "decrypt") && typeof e.peer == "string" && U.test(e.peer) && typeof e.text == "string" && e.text.length <= 2e5 ? { t: e.t, id: e.id, peer: e.peer, text: e.text, scheme: e.scheme === "nip04" ? "nip04" : "nip44" } : e.t === "read" && e.event && typeof e.event == "object" ? { t: "read", id: e.id, event: e.event } : null;
}
const Sn = (t) => typeof t == "string" && t.length <= 2e3 && /^nostr\+walletconnect:\/\/[0-9a-f]{64}\?[\x21-\x7e]+$/u.test(t) ? t : "";
function ge(t, e) {
  if (!t || typeof t != "object") return null;
  const r = t;
  if (r.what === "wallet") return { what: "wallet" };
  if (r.what === "pay") return G(r.invoice) ? { what: "pay", invoice: G(r.invoice) } : null;
  if (r.what !== "sign") return null;
  const n = En(r.event, e, r.event?.created_at ?? 0);
  return n && JSON.stringify(n.tags) === JSON.stringify(r.event.tags) ? { what: "sign", event: n } : null;
}
const ir = (t) => ({ nswp: lt, v: pe, ...t });
function ar(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.nswp !== lt || e.v !== pe || typeof e.nonce != "string" || !dt.test(e.nonce)) return null;
  const r = (n) => typeof n == "string" && U.test(n);
  if (e.t === "hello") return { t: "hello", nonce: e.nonce };
  if (e.t === "frame" && y(e.world) && r(e.recipient)) {
    const n = e.wants === void 0 ? void 0 : wt(e.wants);
    return n === null ? null : { t: "frame", nonce: e.nonce, world: y(e.world), recipient: e.recipient, ...n ? { wants: n } : {}, ...e.turnedDown === !0 ? { turnedDown: !0 } : {}, ...!n && Q(e.more).length ? { more: Q(e.more) } : {}, ...!n && Q(e.has).length ? { has: Q(e.has) } : {}, ...ge(e.ask, y(e.world)) && r(e.pubkey) && !(n && ge(e.ask, y(e.world)).what === "wallet") ? { ask: ge(e.ask, y(e.world)), pubkey: e.pubkey } : {} };
  }
  if (e.t === "answer" && y(e.world)) {
    const n = e.wallet === void 0 ? "" : Sn(e.wallet);
    if (e.wallet !== void 0 && !n) return null;
    const s = e.event && typeof e.event == "object" ? e.event : void 0, o = e.paid && typeof e.paid == "object" ? e.paid : null, i = o && G(o.invoice) ? { invoice: G(o.invoice), ...typeof o.preimage == "string" && U.test(o.preimage) ? { preimage: o.preimage } : {} } : null;
    return e.paid !== void 0 && !i || [s, n, i].filter(Boolean).length > 1 ? null : { t: "answer", nonce: e.nonce, world: y(e.world), ...s ? { event: s } : {}, ...n ? { wallet: n } : {}, ...i ? { paid: i } : {} };
  }
  if (e.t === "grant" && y(e.world) && e.sealed && typeof e.sealed == "object") {
    const n = e.sealed;
    if (!r(n.senderPublicKey) || typeof n.payload != "string" || n.payload.length > 12e3) return null;
    const s = xe(e.name);
    return { t: "grant", nonce: e.nonce, world: y(e.world), sealed: { senderPublicKey: n.senderPublicKey, payload: n.payload }, ...s ? { name: s } : {} };
  }
  return e.t === "done" && typeof e.ok == "boolean" ? { t: "done", nonce: e.nonce, ok: e.ok } : null;
}
const z = { kinds: 64, prefixes: 8, origins: 8, peers: 8, prefixChars: 64 }, Y = 30078, te = 27235, ht = 24242, $e = 22242, pt = 13, _n = 37304, Le = "bitlogin:", yt = [13194, 23194, 23195, 24133, 27301, 37304], ne = {
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
}, se = [27300, 27302, 27303], Nn = 27303;
function cr(t) {
  return Object.hasOwn(ne, t) ? ne[t].name : null;
}
function Me(t) {
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
  const r = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/u.exec(e)?.slice(1).map(Number);
  if (!r || r.some((o) => o > 255)) return !1;
  const [n, s] = r;
  return n === 127 || n === 10 || n === 192 && s === 168 || n === 172 && s >= 16 && s <= 31;
}
const In = ["https://bitlogin.network", "https://bitlogin-beta.vercel.app"], lr = (t) => typeof t == "string" && (In.includes(t) || Me(t));
function kn(t, e) {
  return Object.hasOwn(ne, t) ? ne[t].reserved ?? [] : Me(e) && Me(t) ? se : [];
}
const On = () => {
  try {
    return globalThis.location?.origin ?? "";
  } catch {
    return "";
  }
}, Ke = (t) => kn(t, On()), ur = (t) => !Object.hasOwn(ne, t) && Ke(t).length > 0;
function fr(t, e) {
  const r = Ke(t);
  return [...e.sign, ...e.read].every((n) => !se.includes(n) || r.includes(n));
}
const gt = [0, 3, 5, 1e4, 10002, 10050, $e], xn = [...gt, ht, ...se], Ln = [4, pt, 1059], Mn = [te, ht, $e], re = /^[0-9a-f]{64}$/u, de = (t) => typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 65535, Z = (t) => [...new Set(t)];
function wt(t) {
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const e = t, r = (a) => a === void 0 ? [] : Array.isArray(a) ? a : null, n = r(e.sign), s = r(e.appData), o = r(e.proofs), i = r(e.read), c = r(e.peers);
  if (!n || !s || !o || !i || !c || n.length > z.kinds || i.length > z.kinds || s.length > z.prefixes || o.length > z.origins || c.length > z.peers || !n.every(de) || !i.every(de) || n.some((a) => yt.includes(a)) || i.includes(_n) || n.length === 0 && i.length === 0 && c.length === 0) return null;
  for (const a of s)
    if (typeof a != "string" || a.length === 0 || a.length > z.prefixChars || a !== "*" && (a.startsWith(Le) || Le.startsWith(a)) || xe(a) !== a) return null;
  if ((n.includes(Y) || i.includes(Y)) !== s.length > 0) return null;
  const l = [];
  for (const a of o) {
    const u = y(a);
    if (!u || u !== a || !u.startsWith("https://")) return null;
    l.push(u);
  }
  if (l.length > 0 && !n.includes(te) || !c.every((a) => typeof a == "string" && re.test(a))) return null;
  const d = xe(e.name);
  return {
    ...d ? { name: d } : {},
    sign: Z(n).sort((a, u) => a - u),
    appData: Z(s),
    proofs: Z(l),
    read: Z(i).sort((a, u) => a - u),
    peers: Z(c)
  };
}
const dr = {
  /** Proofs, and the application's own data: what applications sign on timers. */
  quiet: { burst: 300, perMs: 6e4, hourly: 6e3 },
  public: { burst: 60, perMs: 6e4, hourly: 1200 },
  sensitive: { burst: 30, perMs: 6e4, hourly: 300 },
  read: { burst: 600, perMs: 6e4, hourly: 12e3 }
}, V = {
  contentChars: 1e5,
  tags: 2500,
  /** Who someone follows (kind 3) is one note with a tag for each person: more are let through. */
  followTags: 2e4,
  tagItems: 16,
  tagChars: 1e3,
  clockSlackSec: 600
}, De = (t) => t >= 3e4 && t < 4e4;
function hr(t) {
  return gt.includes(t) && t !== $e || se.includes(t) ? "sensitive" : Mn.includes(t) || De(t) ? "quiet" : "public";
}
const Ge = "bitlogin:site", je = (t, e) => t.filter((r) => r[0] === e && typeof r[1] == "string").map((r) => r[1]);
function mt(t, e) {
  const r = je(e, "d")[0];
  return r === void 0 || r.startsWith(Le) ? !1 : t.appData.some((n) => n === "*" || r.startsWith(n));
}
function Dn(t, e, r) {
  const n = je(r, "u");
  return n.length === 0 ? !1 : n.every((s) => {
    const o = y(s);
    return o !== "" && (o === e || t.proofs.includes(o));
  });
}
function pr(t, e, r, n) {
  const s = y(r);
  if (!s || !e || typeof e != "object") return null;
  const o = e;
  if (!de(o.kind) || yt.includes(o.kind) || !t.sign.includes(o.kind) || se.includes(o.kind) && !Ke(s).includes(o.kind) || typeof o.content != "string" || o.content.length > V.contentChars || !Array.isArray(o.tags) || o.tags.length > (o.kind === 3 ? V.followTags : V.tags)) return null;
  const i = [];
  for (const a of o.tags) {
    if (!Array.isArray(a) || a.length === 0 || a.length > V.tagItems || !a.every((u) => typeof u == "string" && u.length <= V.tagChars)) return null;
    if (a[0] !== Ge) {
      if (a[0] === "nswp:world") {
        if (o.kind !== Nn) continue;
        if (a.length !== 2 || y(a[1]) !== a[1] || i.some((u) => u[0] === "nswp:world")) return null;
      }
      i.push([...a]);
    }
  }
  if (o.kind === Y && !mt(t, i) || o.kind === te && !Dn(t, s, i)) return null;
  if (o.kind === pt) {
    if (i.length > 0) return null;
  } else
    i.push([Ge, s]);
  const c = Math.floor(n), l = typeof o.created_at == "number" && Number.isInteger(o.created_at) ? o.created_at : c, d = Math.abs(l - c) <= V.clockSlackSec ? l : c;
  return { kind: o.kind, created_at: d, tags: i, content: o.content };
}
function yr(t, e, r) {
  return typeof r == "string" && re.test(r) && (r === e || t.peers.includes(r));
}
function gr(t, e) {
  return typeof e == "string" && re.test(e) && t.peers.includes(e);
}
function Pn(t, e, r) {
  if (!de(r.kind) || !t.read.includes(r.kind) || typeof r.pubkey != "string" || !re.test(r.pubkey) || !Array.isArray(r.tags)) return null;
  const n = r.tags.filter((o) => Array.isArray(o) && o.every((i) => typeof i == "string"));
  if (r.kind === Y && !mt(t, n)) return null;
  if (r.pubkey !== e) return r.pubkey;
  const s = je(n, "p")[0];
  return s !== void 0 && re.test(s) ? s : e;
}
function wr(t, e, r) {
  const n = Pn(t, e, r);
  return n ? r.pubkey === e && n !== e ? [n, e] : [n] : [];
}
const Rn = {
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
}, Tn = {
  4: "read your private messages (older kind)",
  13: "read your private messages",
  1059: "read your private messages",
  1573: "read orders sent to you",
  7375: "read the money in your Cashu wallet",
  7376: "read what your Cashu wallet spent",
  1e4: "read who you have muted",
  3e4: "read your private lists"
}, Ye = (t) => {
  try {
    return new URL(t).host;
  } catch {
    return t;
  }
};
function mr(t, e) {
  const r = [], n = [], s = [], o = (i, c) => {
    i.includes(c) || i.push(c);
  };
  t.sign.includes(te) && o(r, `prove who you are to ${[Ye(e), ...t.proofs.map(Ye)].join(", ")}`);
  for (const i of t.sign) {
    if (i === te) continue;
    if (i === Y) {
      t.appData.includes("*") ? o(n, "save application data under any name, including other applications' data") : o(r, `save its own data (${t.appData.join(", ")})`);
      continue;
    }
    const c = Rn[i];
    if (!c) {
      De(i) ? o(r, `save its own kind of data (kind ${i})`) : s.push(i);
      continue;
    }
    o(xn.includes(i) ? n : r, c);
  }
  s.length > 0 && o(r, `sign kinds BitLogin has no words for: ${s.join(", ")}`);
  for (const i of t.read) {
    if (i === Y) {
      t.appData.includes("*") ? o(n, "read application data saved under any name") : o(r, "read its own saved data");
      continue;
    }
    const c = Tn[i];
    c ? o(Ln.includes(i) || i === 7375 ? n : r, c) : o(r, De(i) ? `read its own kind of data (kind ${i})` : `read what is encrypted in kind ${i}`);
  }
  return t.peers.length > 0 && o(r, `exchange encrypted messages with ${t.peers.length === 1 ? "one service" : `${t.peers.length} services`} it names (${t.peers.map((i) => `${i.slice(0, 8)}…`).join(", ")})`), { ordinary: r, sensitive: n };
}
export {
  Vn as $,
  vn as A,
  jn as B,
  H as C,
  ae as D,
  We as E,
  K as F,
  B as G,
  Tt as H,
  Kn as I,
  Fe as J,
  T as K,
  Q as L,
  ve as M,
  wr as N,
  gr as O,
  pe as P,
  Ln as Q,
  se as R,
  ct as S,
  yr as T,
  qn as U,
  Jn as V,
  tn as W,
  Yn as X,
  Qn as Y,
  Zn as Z,
  sn as _,
  fe as a,
  zn as a0,
  Fn as a1,
  it as a2,
  Bn as a3,
  Ae as a4,
  lr as a5,
  ut as a6,
  Gn as a7,
  Hn as a8,
  Xn as a9,
  He as aa,
  Se as ab,
  Wn as ac,
  tr as b,
  y as c,
  rr as d,
  ee as e,
  dr as f,
  er as g,
  or as h,
  pr as i,
  nr as j,
  ar as k,
  hr as l,
  fr as m,
  Sn as n,
  cr as o,
  En as p,
  ir as q,
  wt as r,
  sr as s,
  Me as t,
  xe as u,
  ur as v,
  mr as w,
  Un as x,
  qt as y,
  Yt as z
};
