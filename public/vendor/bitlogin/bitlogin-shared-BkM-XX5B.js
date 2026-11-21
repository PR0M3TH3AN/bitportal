import { x as $t, y as Ne, z as Ie, u as wt, a as ke, F as Oe, w as Le, n as xe, t as Me, b as De, v as Kt, G as ee } from "./bitlogin-shared-CvPtgHf2.js";
import { h as Pe, b as ne, a as Re, d as Te } from "./bitlogin-shared-rALvK5cw.js";
import { c as G, j as Y, b as lt, d as Ce } from "./bitlogin-shared-BK8HgLxP.js";
import { d as At } from "./bitlogin-shared-PwbHDYud.js";
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function $e(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
function Ht(e) {
  if (typeof e != "boolean")
    throw new TypeError(`boolean expected, not ${e}`);
}
function mt(e) {
  if (typeof e != "number")
    throw new TypeError("number expected, got " + typeof e);
  if (!Number.isSafeInteger(e) || e < 0)
    throw new RangeError("positive integer expected, got " + e);
}
function C(e, t, r = "") {
  const n = $e(e), s = e?.length, o = t !== void 0;
  if (!n || o && s !== t) {
    const i = r && `"${r}" `, c = o ? ` of length ${t}` : "", l = n ? `length=${s}` : `type=${typeof e}`, d = i + "expected Uint8Array" + c + ", got " + l;
    throw n ? new RangeError(d) : new TypeError(d);
  }
  return e;
}
function U(e) {
  return new Uint32Array(e.buffer, e.byteOffset, Math.floor(e.byteLength / 4));
}
function Xt(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
const X = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68, Ke = (e) => e << 24 & 4278190080 | e << 8 & 16711680 | e >>> 8 & 65280 | e >>> 24 & 255, je = (e) => {
  for (let t = 0; t < e.length; t++)
    e[t] = Ke(e[t]);
  return e;
}, B = X ? (e) => e : je;
function Ue(e, t) {
  return !e.byteLength || !t.byteLength ? !1 : e.buffer === t.buffer && // best we can do, may fail with an obscure Proxy
  e.byteOffset < t.byteOffset + t.byteLength && // a starts before b end
  t.byteOffset < e.byteOffset + e.byteLength;
}
function Jn(e, t) {
  if (Ue(e, t) && e.byteOffset < t.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function Fe(e, t) {
  if (t == null || typeof t != "object")
    throw new Error("options must be defined");
  return Object.assign(e, t);
}
const qn = /* @__NO_SIDE_EFFECTS__ */ (e, t) => {
  function r(n, ...s) {
    if (C(n, void 0, "key"), e.nonceLength !== void 0) {
      const a = s[0];
      C(a, e.varSizeNonce ? void 0 : e.nonceLength, "nonce");
    }
    const o = e.tagLength;
    o && s[1] !== void 0 && C(s[1], void 0, "AAD");
    const i = t(n, ...s), c = (a, u) => {
      if (u !== void 0) {
        if (a !== 2)
          throw new Error("cipher output not supported");
        C(u, void 0, "output");
      }
    };
    let l = !1;
    return {
      encrypt(a, u) {
        if (l)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return l = !0, C(a), c(i.encrypt.length, u), i.encrypt(a, u);
      },
      decrypt(a, u) {
        if (C(a), o && a.length < o)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + o);
        return c(i.decrypt.length, u), i.decrypt(a, u);
      }
    };
  }
  return Object.assign(r, e), r;
};
function Be(e, t, r = !0) {
  if (t === void 0)
    return new Uint8Array(e);
  if (C(t, void 0, "output"), t.length !== e)
    throw new Error('"output" expected Uint8Array of length ' + e + ", got: " + t.length);
  if (r && !ut(t))
    throw new Error("invalid output, must be aligned");
  return t;
}
function ut(e) {
  return e.byteOffset % 4 === 0;
}
function Gt(e) {
  return Uint8Array.from(C(e));
}
const re = (e) => Uint8Array.from(e.split(""), (t) => t.charCodeAt(0)), We = B(U(re("expand 16-byte k"))), ze = B(U(re("expand 32-byte k")));
function f(e, t) {
  return e << t | e >>> 32 - t;
}
const Z = 64, Ve = 16, Et = 2 ** 32 - 1, Yt = /* @__PURE__ */ Uint32Array.of();
function He(e, t, r, n, s, o, i, c) {
  const l = s.length, d = new Uint8Array(Z), a = U(d), u = X && ut(s) && ut(o), $ = u ? U(s) : Yt, w = u ? U(o) : Yt;
  if (!X) {
    for (let p = 0; p < l; i++) {
      if (e(t, r, n, a, i, c), B(a), i >= Et)
        throw new Error("arx: counter overflow");
      const b = Math.min(Z, l - p);
      for (let g = 0, y; g < b; g++)
        y = p + g, o[y] = s[y] ^ d[g];
      p += b;
    }
    return;
  }
  for (let p = 0; p < l; i++) {
    if (e(t, r, n, a, i, c), i >= Et)
      throw new Error("arx: counter overflow");
    const b = Math.min(Z, l - p);
    if (u && b === Z) {
      const g = p / 4;
      if (p % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let y = 0, K; y < Ve; y++)
        K = g + y, w[K] = $[K] ^ a[y];
      p += Z;
      continue;
    }
    for (let g = 0, y; g < b; g++)
      y = p + g, o[y] = s[y] ^ d[g];
    p += b;
  }
}
function Xe(e, t) {
  const { allowShortKeys: r, extendNonceFn: n, counterLength: s, counterRight: o, rounds: i } = Fe({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, t);
  if (typeof e != "function")
    throw new Error("core must be a function");
  return mt(s), mt(i), Ht(o), Ht(r), (c, l, d, a, u = 0) => {
    C(c, void 0, "key"), C(l, void 0, "nonce"), C(d, void 0, "data");
    const $ = d.length;
    if (a = Be($, a, !1), mt(u), u < 0 || u >= Et)
      throw new Error("arx: counter overflow");
    const w = [];
    let p = c.length, b, g;
    if (p === 32)
      w.push(b = Gt(c)), g = ze;
    else if (p === 16 && r)
      b = new Uint8Array(32), b.set(c), b.set(c, 16), g = We, w.push(b);
    else
      throw C(c, 32, "arx key"), new Error("invalid key size");
    (!X || !ut(l)) && w.push(l = Gt(l));
    let y = U(b);
    if (n) {
      if (l.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const F = l.subarray(0, 16);
      if (X)
        n(g, y, U(F), y);
      else {
        const q = B(Uint32Array.from(g));
        n(q, y, U(F), y), Xt(q), B(y);
      }
      l = l.subarray(16);
    } else X || B(y);
    const K = 16 - s;
    if (K !== l.length)
      throw new Error(`arx: nonce must be ${K} or 16 bytes`);
    if (K !== 12) {
      const F = new Uint8Array(12);
      F.set(l, o ? 0 : 12 - l.length), l = F, w.push(l);
    }
    const it = B(U(l));
    try {
      return He(e, g, y, it, d, a, u, i), a;
    } finally {
      Xt(...w);
    }
  };
}
function Ge(e, t, r, n, s, o = 20) {
  let i = e[0], c = e[1], l = e[2], d = e[3], a = t[0], u = t[1], $ = t[2], w = t[3], p = t[4], b = t[5], g = t[6], y = t[7], K = s, it = r[0], F = r[1], q = r[2], v = i, A = c, E = l, S = d, _ = a, N = u, I = $, k = w, O = p, L = b, x = g, M = y, D = K, P = it, R = F, T = q;
  for (let Vt = 0; Vt < o; Vt += 2)
    v = v + _ | 0, D = f(D ^ v, 16), O = O + D | 0, _ = f(_ ^ O, 12), v = v + _ | 0, D = f(D ^ v, 8), O = O + D | 0, _ = f(_ ^ O, 7), A = A + N | 0, P = f(P ^ A, 16), L = L + P | 0, N = f(N ^ L, 12), A = A + N | 0, P = f(P ^ A, 8), L = L + P | 0, N = f(N ^ L, 7), E = E + I | 0, R = f(R ^ E, 16), x = x + R | 0, I = f(I ^ x, 12), E = E + I | 0, R = f(R ^ E, 8), x = x + R | 0, I = f(I ^ x, 7), S = S + k | 0, T = f(T ^ S, 16), M = M + T | 0, k = f(k ^ M, 12), S = S + k | 0, T = f(T ^ S, 8), M = M + T | 0, k = f(k ^ M, 7), v = v + N | 0, T = f(T ^ v, 16), x = x + T | 0, N = f(N ^ x, 12), v = v + N | 0, T = f(T ^ v, 8), x = x + T | 0, N = f(N ^ x, 7), A = A + I | 0, D = f(D ^ A, 16), M = M + D | 0, I = f(I ^ M, 12), A = A + I | 0, D = f(D ^ A, 8), M = M + D | 0, I = f(I ^ M, 7), E = E + k | 0, P = f(P ^ E, 16), O = O + P | 0, k = f(k ^ O, 12), E = E + k | 0, P = f(P ^ E, 8), O = O + P | 0, k = f(k ^ O, 7), S = S + _ | 0, R = f(R ^ S, 16), L = L + R | 0, _ = f(_ ^ L, 12), S = S + _ | 0, R = f(R ^ S, 8), L = L + R | 0, _ = f(_ ^ L, 7);
  let m = 0;
  n[m++] = i + v | 0, n[m++] = c + A | 0, n[m++] = l + E | 0, n[m++] = d + S | 0, n[m++] = a + _ | 0, n[m++] = u + N | 0, n[m++] = $ + I | 0, n[m++] = w + k | 0, n[m++] = p + O | 0, n[m++] = b + L | 0, n[m++] = g + x | 0, n[m++] = y + M | 0, n[m++] = K + D | 0, n[m++] = it + P | 0, n[m++] = F + R | 0, n[m++] = q + T | 0;
}
const se = /* @__PURE__ */ Xe(Ge, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
}), oe = 2, St = 1, ie = 65536, Ye = 4294967295, Je = 132, qe = 99, _t = 1024 * 1024;
function Zn(e, t) {
  const r = $t(new Uint8Array([2]), Ne(t)), s = Ie.getSharedSecret(e, r, !0).slice(1, 33);
  return Pe(wt("nip44-v2"), s);
}
function ae(e, t) {
  if (e.length !== 32)
    throw new Error("NIP-44 conversation key must be exactly 32 bytes.");
  if (t.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const r = Re(e, t, 76);
  return {
    chachaKey: r.slice(0, 32),
    chachaNonce: r.slice(32, 44),
    hmacKey: r.slice(44, 76)
  };
}
function jt(e) {
  if (e <= 32)
    return 32;
  const t = 2 ** Math.floor(Math.log2(e - 1) + 1), r = t <= 256 ? 32 : t / 8;
  return r * (Math.floor((e - 1) / r) + 1);
}
const ce = 39 + jt(_t) + 32, Ze = Math.ceil(ce / 3) * 4;
function Qe(e) {
  if (e < ie) {
    const r = new Uint8Array(2);
    return new DataView(r.buffer).setUint16(0, e, !1), r;
  }
  const t = new Uint8Array(6);
  return new DataView(t.buffer).setUint32(2, e, !1), t;
}
function tn(e) {
  const t = e.length;
  if (t < St || t > _t)
    throw new Error(`NIP-44 plaintext length must be between ${St} and ${_t} bytes on this platform.`);
  const r = Qe(t), n = jt(t), s = new Uint8Array(r.length + n);
  return s.set(r, 0), s.set(e, r.length), s;
}
function en(e) {
  const t = new DataView(e.buffer, e.byteOffset, e.byteLength), r = t.getUint16(0, !1);
  let n, s;
  if (r === 0) {
    if (n = t.getUint32(2, !1), s = 6, n < ie)
      throw new Error("NIP-44 payload has inconsistent padding.");
  } else
    n = r, s = 2;
  if (n < St || n > Ye || e.length !== s + jt(n))
    throw new Error("NIP-44 payload has inconsistent padding.");
  return e.slice(s, s + n);
}
function le(e, t, r) {
  return xe(Me, e, $t(t, r));
}
function nn(e, t) {
  return rn(e, t, ke(32));
}
function rn(e, t, r) {
  if (r.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const { chachaKey: n, chachaNonce: s, hmacKey: o } = ae(e, r), i = tn(wt(t)), c = se(n, s, i), l = le(o, r, c);
  return ne.encode($t(new Uint8Array([oe]), r, c, l));
}
function sn(e, t) {
  if (t.startsWith("#"))
    throw new Error("Unsupported NIP-44 non-base64 encoding.");
  if (t.length < Je || t.length > Ze)
    throw new Error("NIP-44 payload size is outside this platform's supported range.");
  const r = ne.decode(t);
  if (r.length < qe || r.length > ce)
    throw new Error("NIP-44 decoded payload size is outside this platform's supported range.");
  if (r[0] !== oe)
    throw new Error(`Unsupported NIP-44 version: ${r[0]}`);
  const n = r.slice(1, 33);
  if (n.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const s = r.slice(r.length - 32), o = r.slice(33, r.length - 32), { chachaKey: i, chachaNonce: c, hmacKey: l } = ae(e, n), d = le(l, n, o);
  if (!Oe(s, d))
    throw new Error("NIP-44 MAC verification failed: payload is corrupted, tampered, or uses the wrong key.");
  const a = se(i, c, o);
  return Le(en(a));
}
const ue = 37304, Nt = {
  /** The most a save may hold, in bytes of UTF-8. It has to fit in one note that any relay will take. */
  dataBytes: 32768,
  /** No more saves than this for one world in `perMs`, and in an hour. Counted apart from notes and passes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** A save handed over to be opened is not read past this many characters of content. */
  contentChars: 7e4
}, on = /^[a-z0-9][a-z0-9-]{0,31}$/u, an = /^[0-9a-f]{64}$/u, cn = "Something a world keeps for its visitor. Only they can read it.";
function W(e) {
  return typeof e == "string" && on.test(e) ? e : "";
}
function Ut(e) {
  return typeof e == "string" && e.length <= Nt.dataBytes && wt(e).length <= Nt.dataBytes;
}
function fe(e, t, r) {
  const n = h(t), s = W(r);
  return !n || !s ? "" : De(Te(e, wt(`nswp-save
${n}
${s}`)));
}
function Qn(e) {
  const t = h(e.world), r = W(e.slot), n = fe(e.conversationKey, t, r);
  if (!n || !Ut(e.data)) return null;
  const s = JSON.stringify({ v: 1, world: t, slot: r, data: e.data });
  return {
    kind: ue,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", n],
      ["alt", cn]
    ],
    content: nn(e.conversationKey, s)
  };
}
function tr(e, t) {
  const r = h(t.world);
  if (!r || !e || typeof e != "object" || !an.test(t.pubkey)) return null;
  const n = e;
  if (n.kind !== ue || n.pubkey !== t.pubkey || typeof n.content != "string" || n.content.length > Nt.contentChars || !Array.isArray(n.tags)) return null;
  let s;
  try {
    s = JSON.parse(sn(t.conversationKey, n.content));
  } catch {
    return null;
  }
  if (!s || typeof s != "object" || s.v !== 1 || s.world !== r) return null;
  const o = W(s.slot);
  if (!o || !Ut(s.data)) return null;
  const i = n.tags.find((c) => Array.isArray(c) && c[0] === "d");
  return !i || i[1] !== fe(t.conversationKey, r, o) ? null : { slot: o, data: s.data, at: typeof n.created_at == "number" && Number.isInteger(n.created_at) ? n.created_at : 0 };
}
const It = 3, er = { burst: 6, perMs: 6e4, hourly: 60 }, at = {
  /** A list handed over to be changed is not read past this many tags, or this much content. */
  tags: 2e4,
  contentChars: 1e5,
  tagItems: 16,
  tagChars: 1e3
}, ln = ["follows", "messages"];
function tt(e) {
  return Array.isArray(e) ? ln.filter((t) => e.includes(t)) : [];
}
const un = ["nswp:world", "bitlogin:site"], fn = /^[0-9a-f]{64}$/u;
function Jt(e, t) {
  if (e && (e.kind !== It || !Array.isArray(e.tags)) || !e && !t.fromNothing) return null;
  const r = typeof t.add == "string" ? t.add.toLowerCase() : "", n = typeof t.remove == "string" ? t.remove.toLowerCase() : "";
  if (r === "" == (n === "")) return null;
  const s = r || n;
  if (!fn.test(s) || r && (e?.pubkey ?? t.pubkey) === r) return null;
  const o = e ? e.tags.filter((a) => Array.isArray(a) && a.every((u) => typeof u == "string") && !un.includes(a[0] ?? "")) : [], i = (a) => a[0] === "p" && typeof a[1] == "string" && a[1].toLowerCase() === s, c = o.some(i);
  if (r ? c : !c) return null;
  const l = r ? [...o.map((a) => [...a]), ["p", r]] : o.filter((a) => !i(a)).map((a) => [...a]), d = Math.max(Math.floor(t.nowSeconds), e ? e.created_at + 1 : 0);
  return { kind: It, created_at: d, tags: l, content: typeof e?.content == "string" ? e.content : "" };
}
function dn(e, t) {
  if (!e || typeof e != "object") return null;
  const r = e;
  if (r.kind !== It || r.pubkey !== t || !Array.isArray(r.tags) || r.tags.length > at.tags || typeof r.content != "string" || r.content.length > at.contentChars) return null;
  for (const n of r.tags)
    if (!Array.isArray(n) || n.length > at.tagItems || !n.every((s) => typeof s == "string" && s.length <= at.tagChars)) return null;
  return Kt(e) ? e : null;
}
function nr(e) {
  const t = { add: e.add, remove: e.remove, nowSeconds: e.nowSeconds, pubkey: e.pubkey };
  if (e.list === null || e.list === void 0) return e.seen ? null : Jt(null, { ...t, fromNothing: !0 });
  const r = dn(e.list, e.pubkey);
  return !r || e.seen && r.created_at < e.seen ? null : Jt(r, t);
}
function rr(e, t) {
  return e === null ? t.answered > 0 && t.newestAt === 0 : e.created_at >= t.newestAt;
}
const kt = 14, de = 13, pn = 1059, yn = 10050, ft = {
  /** The most characters in one message. */
  chars: 2e3,
  /** No more than this many relays are put in a list of where messages reach someone. */
  relays: 4,
  /** A wrap handed over to be opened is not read past this many characters of content. */
  wrapChars: 6e4
}, sr = { burst: 10, perMs: 6e4, hourly: 200 }, or = { burst: 600, perMs: 6e4, hourly: 12e3 }, ir = { burst: 3, perMs: 6e4, hourly: 12 }, dt = /^[0-9a-f]{64}$/u, hn = [
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
function pt(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const r of e.slice(0, ft.chars * 8).normalize("NFC")) {
    const n = r.codePointAt(0);
    t += hn.some(([s, o]) => n >= s && n <= o) ? " " : r;
  }
  return t = t.replace(/[^\S\n]+/gu, " ").replace(/ ?\n ?/gu, `
`).replace(/\n{3,}/gu, `

`).trim(), [...t].slice(0, ft.chars).join("").trim();
}
function gn(e) {
  const t = pt(e.text);
  if (!dt.test(e.from) || typeof e.to != "string" || !dt.test(e.to) || e.from === e.to || !t) return null;
  const r = { kind: kt, pubkey: e.from, created_at: Math.floor(e.nowSeconds), tags: [["p", e.to]], content: t };
  return { ...r, id: ee(r) };
}
function ar(e, t) {
  const r = e.getPublicKey(), n = gn({ from: r, to: t.to, text: t.text, nowSeconds: t.nowSeconds });
  if (!n) return null;
  const s = JSON.stringify(n), o = (i) => e.signEvent({ kind: de, created_at: Math.floor(t.nowSeconds), tags: [], content: e.nip44Encrypt(i, s) });
  return { message: n, seals: [o(n.tags[0][1]), o(r)] };
}
function wn(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  return !Kt(t) || t.kind !== de || t.tags.length !== 0 ? null : t;
}
function bn(e, t, r) {
  let n;
  try {
    n = JSON.parse(e);
  } catch {
    return null;
  }
  if (!n || typeof n != "object" || n.kind !== kt || n.pubkey !== t || typeof n.pubkey != "string" || !dt.test(n.pubkey) || typeof n.content != "string" || typeof n.created_at != "number" || !Number.isInteger(n.created_at) || !Array.isArray(n.tags) || !n.tags.every((c) => Array.isArray(c) && c.every((l) => typeof l == "string"))) return null;
  const s = [...new Set(n.tags.filter((c) => c[0] === "p" && typeof c[1] == "string" && dt.test(c[1])).map((c) => c[1]))], o = pt(n.content);
  return s.length === 0 || !o || n.pubkey !== r && !s.includes(r) ? null : { id: ee({ kind: kt, pubkey: n.pubkey, created_at: n.created_at, tags: n.tags, content: n.content }), from: n.pubkey, to: s, text: o, at: n.created_at };
}
function cr(e, t) {
  const r = e.getPublicKey();
  if (!t || typeof t != "object") return null;
  const n = t;
  if (n.kind !== pn || typeof n.content != "string" || n.content.length > ft.wrapChars || !Array.isArray(n.tags) || n.tags.length > 20 || !Kt(t) || !t.tags.some((s) => s[0] === "p" && s[1] === r)) return null;
  try {
    const s = wn(e.nip44Decrypt(t.pubkey, t.content));
    return s ? bn(e.nip44Decrypt(s.pubkey, s.content), s.pubkey, r) : null;
  } catch {
    return null;
  }
}
function mn(e) {
  if (typeof e != "string" || e.length > 200) return "";
  try {
    const t = new URL(e.trim()), r = t.hostname;
    return t.protocol !== "wss:" || t.username || t.password || !r.includes(".") || r.startsWith("[") || /^[0-9.]+$/u.test(r) || /\.(local|localhost|internal|lan|home)$/iu.test(r) ? "" : (t.hash = "", t.href.replace(/\/$/u, ""));
  } catch {
    return "";
  }
}
function lr(e, t) {
  if (!Array.isArray(e) || e.length > 8) return null;
  const r = [...new Set(e.map(mn).filter(Boolean))].slice(0, ft.relays);
  return r.length === 0 ? null : { kind: yn, created_at: Math.floor(t), tags: r.map((n) => ["relay", n]), content: "" };
}
const vn = 37306, qt = 37300, Ot = {
  /** No more scores than this for one world in `perMs`, and in an hour. Counted apart from notes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** The most a score may be. */
  most: 9007199254740991,
  /** The longest a board's title may be, in characters. */
  title: 60
}, An = /^[a-z0-9][a-z0-9-]{0,31}$/u, En = /^(\d+):([0-9a-f]{64}):(.*)$/su;
function H(e) {
  if (typeof e != "string" || e.length > 200) return "";
  const t = En.exec(e);
  return t && Number(t[1]) === qt && t[3] !== "" ? `${qt}:${t[2]}:${t[3]}` : "";
}
function Lt(e) {
  return typeof e == "string" && An.test(e) ? e : "";
}
function xt(e) {
  const t = typeof e == "string" && /^\d{1,16}$/u.test(e) ? Number(e) : e;
  return typeof t == "number" && Number.isSafeInteger(t) && t >= 0 && t <= Ot.most ? t : null;
}
function Mt(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const r of e.slice(0, Ot.title * 8).normalize("NFC")) {
    const n = r.codePointAt(0), s = n <= 31 || n >= 127 && n <= 159 || n >= 8203 && n <= 8207 || n >= 8232 && n <= 8239 || n >= 8288 && n <= 8303 || n === 65279;
    t += s ? " " : r;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, Ot.title).join("").trim();
}
function Sn(e, t) {
  if (e !== "time") return String(t).replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
  const r = Math.round(t / 100), n = Math.floor(r / 600), s = r % 600 / 10;
  return n ? `${n} min ${s.toFixed(1)} s` : `${s.toFixed(1)} s`;
}
function ur(e) {
  const t = h(e.origin), r = H(e.world), n = Lt(e.board), s = xt(e.score);
  if (!t || !r || !n || s === null) return null;
  const o = Mt(e.title), i = e.format === "time" ? "time" : "number";
  return {
    kind: vn,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", `${r}/${n}`],
      ["a", r],
      ["board", n, ...o ? [o] : []],
      ["score", String(s), ...i === "time" ? ["time"] : []],
      ["alt", `A score in a world: ${o ? `${o}: ` : ""}${Sn(i, s)}`],
      [yt, t]
    ],
    content: ""
  };
}
const _n = 37307, Zt = {
  /** No more than this many for one world in `perMs`, and in an hour. Counted apart from notes and scores. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** The longest a title may be, in characters. */
  title: 60
}, Nn = /^[a-z0-9][a-z0-9-]{0,31}$/u;
function Dt(e) {
  return typeof e == "string" && Nn.test(e) ? e : "";
}
function Pt(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const r of e.slice(0, Zt.title * 8).normalize("NFC")) {
    const n = r.codePointAt(0), s = n <= 31 || n >= 127 && n <= 159 || n >= 8203 && n <= 8207 || n >= 8232 && n <= 8239 || n >= 8288 && n <= 8303 || n === 65279;
    t += s ? " " : r;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, Zt.title).join("").trim();
}
function fr(e) {
  const t = h(e.origin), r = H(e.world), n = Dt(e.id), s = Pt(e.title);
  return !t || !r || !n || !s ? null : {
    kind: _n,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", `${r}/${n}`],
      ["a", r],
      ["achievement", n],
      ["title", s],
      ["alt", `An achievement in a world: ${s}`],
      [yt, t]
    ],
    content: ""
  };
}
const pe = "nswp-signer", ye = "nswp-handoff", bt = 1, et = {
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
}, In = [1, 7], kn = [4, 13, 14, 15, 1059, 1060, 13194, 22242, 23194, 23195, 24133, 27235, 27300, 27301, 30078], On = [0, 5, 10002], dr = { burst: 2, perMs: 6e4, hourly: 10 }, pr = 5 * 6e4;
function he(e) {
  return typeof e != "number" || !Number.isInteger(e) || e < 0 || e > 65535 || kn.includes(e) ? "never" : In.includes(e) ? "ordinary" : "careful";
}
const yt = "nswp:world";
function h(e) {
  if (typeof e != "string" || e.length > 300) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin !== "null" ? t.origin : "";
  } catch {
    return "";
  }
}
function Rt(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const r of e.slice(0, 400).normalize("NFC")) {
    const n = r.codePointAt(0), s = n <= 31 || n >= 127 && n <= 159 || n >= 8203 && n <= 8207 || n >= 8232 && n <= 8239 || n >= 8288 && n <= 8303 || n === 65279;
    t += s ? " " : r;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, 48).join("").trim();
}
function yr(e, t, r) {
  return ge(e, t, r, (n) => he(n) === "ordinary");
}
function Ln(e, t, r) {
  return ge(e, t, r, (n) => he(n) === "careful" && On.includes(n));
}
function ge(e, t, r, n) {
  const s = h(t);
  if (!s || !e || typeof e != "object") return null;
  const o = e;
  if (!n(o.kind) || typeof o.content != "string" || [...o.content].length > et.contentChars || !Array.isArray(o.tags) || o.tags.length > et.tags) return null;
  const i = [];
  for (const c of o.tags) {
    if (!Array.isArray(c) || c.length === 0 || c.length > et.tagItems || !c.every((l) => typeof l == "string" && l.length <= et.tagChars)) return null;
    c[0] !== yt && i.push([...c]);
  }
  return i.push([yt, s]), { kind: o.kind, created_at: Math.floor(r), tags: i, content: o.content };
}
function hr(e = et, t = []) {
  let r = t.filter((n) => typeof n == "number" && Number.isFinite(n));
  return {
    times: () => [...r],
    take(n) {
      return r = r.filter((s) => n - s < 36e5), r.length >= e.hourly || r.filter((s) => n - s < e.perMs).length >= e.burst ? !1 : (r.push(n), !0);
    }
  };
}
const we = /^[0-9a-z-]{1,40}$/iu, j = /^[0-9a-f]{64}$/u, gr = (e) => ({ nswp: pe, v: bt, ...e });
function wr(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.nswp !== pe || t.v !== bt || typeof t.id != "string" || !we.test(t.id)) return null;
  if (t.t === "state") return { t: "state", id: t.id };
  if (t.t === "lock") return { t: "lock", id: t.id };
  if (t.t === "sign" && t.event && typeof t.event == "object") return { t: "sign", id: t.id, event: t.event };
  if (t.t === "propose" && t.event && typeof t.event == "object") return { t: "propose", id: t.id, event: t.event };
  if (t.t === "wallet") return { t: "wallet", id: t.id };
  if (t.t === "pay" && G(t.invoice)) return { t: "pay", id: t.id, invoice: G(t.invoice) };
  if (t.t === "tip" && Y(t.sats) && (t.to === void 0 || typeof t.to == "string" && j.test(t.to))) return { t: "tip", id: t.id, sats: Y(t.sats), ...typeof t.to == "string" ? { to: t.to } : {} };
  if ((t.t === "buy" || t.t === "have") && lt(t.listing)) return { t: t.t, id: t.id, listing: lt(t.listing) };
  if (t.t === "file-pick") return { t: "file-pick", id: t.id };
  if (t.t === "file-save") {
    const r = Ft(t);
    return r ? { t: "file-save", id: t.id, ...r, private: t.private !== !1 } : null;
  }
  if (t.t === "pass" && typeof t.session == "string" && j.test(t.session)) return { t: "pass", id: t.id, session: t.session };
  if (t.t === "save" && W(t.slot) && Ut(t.data)) return { t: "save", id: t.id, slot: W(t.slot), data: t.data };
  if (t.t === "find" && W(t.slot)) return { t: "find", id: t.id, slot: W(t.slot) };
  if (t.t === "open" && t.event && typeof t.event == "object") return { t: "open", id: t.id, event: t.event };
  if (t.t === "want" && t.permissions === void 0 && Array.isArray(t.more)) return { t: "wantMore", id: t.id, more: tt(t.more) };
  if (t.t === "follow" && (t.list === null || t.list && typeof t.list == "object")) {
    const r = typeof t.add == "string" && j.test(t.add), n = typeof t.remove == "string" && j.test(t.remove);
    return r === n ? null : { t: "follow", id: t.id, list: t.list, ...r ? { add: t.add } : { remove: t.remove } };
  }
  if (t.t === "score" && H(t.world) && Lt(t.board) && xt(t.score) !== null) return { t: "score", id: t.id, world: H(t.world), board: Lt(t.board), score: xt(t.score), ...Mt(t.title) ? { title: Mt(t.title) } : {}, ...t.format === "time" ? { format: "time" } : {} };
  if (t.t === "achieve" && H(t.world) && Dt(t.achievement) && Pt(t.title))
    return { t: "achieve", id: t.id, world: H(t.world), achievement: Dt(t.achievement), title: Pt(t.title) };
  if (t.t === "seal" && typeof t.to == "string" && j.test(t.to) && pt(t.text)) return { t: "seal", id: t.id, to: t.to, text: pt(t.text) };
  if (t.t === "unwrap" && t.event && typeof t.event == "object") return { t: "unwrap", id: t.id, event: t.event };
  if (t.t === "reach" && Array.isArray(t.relays) && t.relays.length <= 8 && t.relays.every((r) => typeof r == "string" && r.length <= 200)) return { t: "reach", id: t.id, relays: t.relays };
  if (t.t === "want") {
    const r = Se(t.permissions);
    return r ? { t: "want", id: t.id, permissions: r } : null;
  }
  return (t.t === "encrypt" || t.t === "decrypt") && typeof t.peer == "string" && j.test(t.peer) && typeof t.text == "string" && t.text.length <= 2e5 ? { t: t.t, id: t.id, peer: t.peer, text: t.text, scheme: t.scheme === "nip04" ? "nip04" : "nip44" } : t.t === "read" && t.event && typeof t.event == "object" ? { t: "read", id: t.id, event: t.event } : null;
}
const xn = 2e4, be = 60, Mn = 25 * 1024 * 1024;
function Ft(e) {
  if (!e || typeof e != "object") return null;
  const t = e, r = At(t.name), n = t.bytes instanceof Uint8Array ? t.bytes : t.bytes instanceof ArrayBuffer ? new Uint8Array(t.bytes) : null;
  return !r || !n || n.length === 0 || n.length > Mn ? null : { name: r, type: typeof t.type == "string" && /^[\x21-\x7e]{3,120}$/u.test(t.type) && t.type.includes("/") ? t.type.toLowerCase() : "application/octet-stream", bytes: n };
}
const ct = (e) => {
  try {
    const t = new URL(String(e));
    return typeof e == "string" && e.length <= 400 && (t.protocol === "https:" || t.protocol === "http:") ? t.href : "";
  } catch {
    return "";
  }
}, Dn = (e) => typeof e == "string" && e.length <= 2e3 && /^nostr\+walletconnect:\/\/[0-9a-f]{64}\?[\x21-\x7e]+$/u.test(e) ? e : "";
function vt(e, t) {
  if (!e || typeof e != "object") return null;
  const r = e;
  if (r.what === "wallet") return { what: "wallet" };
  if (r.what === "pick") return { what: "pick" };
  if (r.what === "save") {
    const s = Ft(r);
    return s ? { what: "save", ...s, private: r.private !== !1 } : null;
  }
  if (r.what === "tip") {
    const s = r;
    return !Y(s.sats) || s.to !== void 0 && !(typeof s.to == "string" && j.test(s.to)) ? null : { what: "tip", sats: Y(s.sats), ...typeof s.to == "string" ? { to: s.to } : {} };
  }
  if (r.what === "buy") return lt(r.listing) ? { what: "buy", listing: lt(r.listing) } : null;
  if (r.what === "pay") return G(r.invoice) ? { what: "pay", invoice: G(r.invoice) } : null;
  if (r.what !== "sign") return null;
  const n = Ln(r.event, t, r.event?.created_at ?? 0);
  return n && JSON.stringify(n.tags) === JSON.stringify(r.event.tags) ? { what: "sign", event: n } : null;
}
const br = (e) => ({ nswp: ye, v: bt, ...e });
function mr(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.nswp !== ye || t.v !== bt || typeof t.nonce != "string" || !we.test(t.nonce)) return null;
  const r = (n) => typeof n == "string" && j.test(n);
  if (t.t === "hello") return { t: "hello", nonce: t.nonce };
  if (t.t === "frame" && h(t.world) && r(t.recipient)) {
    const n = t.wants === void 0 ? void 0 : Se(t.wants);
    return n === null ? null : { t: "frame", nonce: t.nonce, world: h(t.world), recipient: t.recipient, ...n ? { wants: n } : {}, ...t.turnedDown === !0 ? { turnedDown: !0 } : {}, ...!n && tt(t.more).length ? { more: tt(t.more) } : {}, ...!n && tt(t.has).length ? { has: tt(t.has) } : {}, ...vt(t.ask, h(t.world)) && r(t.pubkey) && !(n && vt(t.ask, h(t.world)).what === "wallet") ? { ask: vt(t.ask, h(t.world)), pubkey: t.pubkey } : {} };
  }
  if (t.t === "answer" && h(t.world)) {
    const n = t.wallet === void 0 ? "" : Dn(t.wallet);
    if (t.wallet !== void 0 && !n) return null;
    const s = t.event && typeof t.event == "object" ? t.event : void 0, o = t.paid && typeof t.paid == "object" ? t.paid : null, i = o && G(o.invoice) ? { invoice: G(o.invoice), ...typeof o.preimage == "string" && j.test(o.preimage) ? { preimage: o.preimage } : {} } : null;
    if (t.paid !== void 0 && !i) return null;
    const c = t.saved && typeof t.saved == "object" ? t.saved : null, l = c && At(c.name) && typeof c.size == "number" && Number.isSafeInteger(c.size) && c.size >= 0 ? { name: At(c.name), size: c.size, private: c.private !== !1, ...c.private === !1 && ct(c.url) ? { url: ct(c.url) } : {} } : null;
    if (t.saved !== void 0 && !l) return null;
    const d = t.file === void 0 ? null : Ft(t.file);
    if (t.file !== void 0 && !d) return null;
    const a = d ? { ...d, ...ct(t.file.url) ? { url: ct(t.file.url) } : {} } : null, u = t.tipped && typeof t.tipped == "object" ? t.tipped : null, $ = u && Y(u.sats) ? { sats: Y(u.sats), ...typeof u.preimage == "string" && j.test(u.preimage) ? { preimage: u.preimage } : {} } : null;
    if (t.tipped !== void 0 && !$) return null;
    const w = t.bought && typeof t.bought == "object" ? t.bought : null, p = w && w.receipt && typeof w.receipt == "object" ? { receipt: w.receipt, ...typeof w.delivery == "string" && w.delivery.length > 0 && w.delivery.length <= xn ? { delivery: w.delivery } : {} } : null;
    return t.bought !== void 0 && !p || [s, n, i, l, a, $, p].filter(Boolean).length > 1 ? null : { t: "answer", nonce: t.nonce, world: h(t.world), ...s ? { event: s } : {}, ...n ? { wallet: n } : {}, ...i ? { paid: i } : {}, ...l ? { saved: l } : {}, ...a ? { file: a } : {}, ...$ ? { tipped: $ } : {}, ...p ? { bought: p } : {} };
  }
  if (t.t === "held" && h(t.world) && Array.isArray(t.receipts) && t.receipts.length <= be && t.receipts.every((n) => n && typeof n == "object"))
    return { t: "held", nonce: t.nonce, world: h(t.world), receipts: t.receipts };
  if (t.t === "grant" && h(t.world) && t.sealed && typeof t.sealed == "object") {
    const n = t.sealed;
    if (!r(n.senderPublicKey) || typeof n.payload != "string" || n.payload.length > 12e3) return null;
    const s = Rt(t.name);
    return { t: "grant", nonce: t.nonce, world: h(t.world), sealed: { senderPublicKey: n.senderPublicKey, payload: n.payload }, ...s ? { name: s } : {} };
  }
  return t.t === "done" && typeof t.ok == "boolean" ? { t: "done", nonce: t.nonce, ok: t.ok } : null;
}
function vr(e, t, r) {
  const n = [];
  for (const s of e.slice(0, be)) {
    const o = Ce(s, r);
    o && o.buyer === t && n.push(o.event);
  }
  return n;
}
const z = { kinds: 64, prefixes: 8, origins: 8, peers: 8, prefixChars: 64 }, J = 30078, nt = 27235, me = 24242, Bt = 22242, ve = 13, Pn = 37304, Tt = "bitlogin:", Ae = [13194, 23194, 23195, 24133, 27301, 37304], rt = {
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
}, ot = [27300, 27302, 27303], Rn = 27303;
function Ar(e) {
  return Object.hasOwn(rt, e) ? rt[e].name : null;
}
function ht(e) {
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
  const r = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/u.exec(t)?.slice(1).map(Number);
  if (!r || r.some((o) => o > 255)) return !1;
  const [n, s] = r;
  return n === 127 || n === 10 || n === 192 && s === 168 || n === 172 && s >= 16 && s <= 31;
}
const Tn = ["https://bitlogin.network", "https://bitlogin-beta.vercel.app"], Er = (e) => typeof e == "string" && (Tn.includes(e) || ht(e)), Cn = ["https://bitlogin-beta.vercel.app"], Sr = (e) => typeof e == "string" && (Cn.includes(e) || ht(e));
function $n(e, t) {
  return Object.hasOwn(rt, e) ? rt[e].reserved ?? [] : ht(t) && ht(e) ? ot : [];
}
const Kn = () => {
  try {
    return globalThis.location?.origin ?? "";
  } catch {
    return "";
  }
}, Wt = (e) => $n(e, Kn()), _r = (e) => !Object.hasOwn(rt, e) && Wt(e).length > 0;
function Nr(e, t) {
  const r = Wt(e);
  return [...t.sign, ...t.read].every((n) => !ot.includes(n) || r.includes(n));
}
const Ee = [0, 3, 5, 1e4, 10002, 10050, Bt], jn = [...Ee, me, ...ot], Un = [4, ve, 1059], Fn = [nt, me, Bt], st = /^[0-9a-f]{64}$/u, gt = (e) => typeof e == "number" && Number.isInteger(e) && e >= 0 && e <= 65535, Q = (e) => [...new Set(e)];
function Se(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, r = (a) => a === void 0 ? [] : Array.isArray(a) ? a : null, n = r(t.sign), s = r(t.appData), o = r(t.proofs), i = r(t.read), c = r(t.peers);
  if (!n || !s || !o || !i || !c || n.length > z.kinds || i.length > z.kinds || s.length > z.prefixes || o.length > z.origins || c.length > z.peers || !n.every(gt) || !i.every(gt) || n.some((a) => Ae.includes(a)) || i.includes(Pn) || n.length === 0 && i.length === 0 && c.length === 0) return null;
  for (const a of s)
    if (typeof a != "string" || a.length === 0 || a.length > z.prefixChars || a !== "*" && (a.startsWith(Tt) || Tt.startsWith(a)) || Rt(a) !== a) return null;
  if ((n.includes(J) || i.includes(J)) !== s.length > 0) return null;
  const l = [];
  for (const a of o) {
    const u = h(a);
    if (!u || u !== a || !u.startsWith("https://")) return null;
    l.push(u);
  }
  if (l.length > 0 && !n.includes(nt) || !c.every((a) => typeof a == "string" && st.test(a))) return null;
  const d = Rt(t.name);
  return {
    ...d ? { name: d } : {},
    sign: Q(n).sort((a, u) => a - u),
    appData: Q(s),
    proofs: Q(l),
    read: Q(i).sort((a, u) => a - u),
    peers: Q(c)
  };
}
const Ir = {
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
}, Ct = (e) => e >= 3e4 && e < 4e4;
function kr(e) {
  return Ee.includes(e) && e !== Bt || ot.includes(e) ? "sensitive" : Fn.includes(e) || Ct(e) ? "quiet" : "public";
}
const Qt = "bitlogin:site", zt = (e, t) => e.filter((r) => r[0] === t && typeof r[1] == "string").map((r) => r[1]);
function _e(e, t) {
  const r = zt(t, "d")[0];
  return r === void 0 || r.startsWith(Tt) ? !1 : e.appData.some((n) => n === "*" || r.startsWith(n));
}
function Bn(e, t, r) {
  const n = zt(r, "u");
  return n.length === 0 ? !1 : n.every((s) => {
    const o = h(s);
    return o !== "" && (o === t || e.proofs.includes(o));
  });
}
function Or(e, t, r, n) {
  const s = h(r);
  if (!s || !t || typeof t != "object") return null;
  const o = t;
  if (!gt(o.kind) || Ae.includes(o.kind) || !e.sign.includes(o.kind) || ot.includes(o.kind) && !Wt(s).includes(o.kind) || typeof o.content != "string" || o.content.length > V.contentChars || !Array.isArray(o.tags) || o.tags.length > (o.kind === 3 ? V.followTags : V.tags)) return null;
  const i = [];
  for (const a of o.tags) {
    if (!Array.isArray(a) || a.length === 0 || a.length > V.tagItems || !a.every((u) => typeof u == "string" && u.length <= V.tagChars)) return null;
    if (a[0] !== Qt) {
      if (a[0] === "nswp:world") {
        if (o.kind !== Rn) continue;
        if (a.length !== 2 || h(a[1]) !== a[1] || i.some((u) => u[0] === "nswp:world")) return null;
      }
      i.push([...a]);
    }
  }
  if (o.kind === J && !_e(e, i) || o.kind === nt && !Bn(e, s, i)) return null;
  if (o.kind === ve) {
    if (i.length > 0) return null;
  } else
    i.push([Qt, s]);
  const c = Math.floor(n), l = typeof o.created_at == "number" && Number.isInteger(o.created_at) ? o.created_at : c, d = Math.abs(l - c) <= V.clockSlackSec ? l : c;
  return { kind: o.kind, created_at: d, tags: i, content: o.content };
}
function Lr(e, t, r) {
  return typeof r == "string" && st.test(r) && (r === t || e.peers.includes(r));
}
function xr(e, t) {
  return typeof t == "string" && st.test(t) && e.peers.includes(t);
}
function Wn(e, t, r) {
  if (!gt(r.kind) || !e.read.includes(r.kind) || typeof r.pubkey != "string" || !st.test(r.pubkey) || !Array.isArray(r.tags)) return null;
  const n = r.tags.filter((o) => Array.isArray(o) && o.every((i) => typeof i == "string"));
  if (r.kind === J && !_e(e, n)) return null;
  if (r.pubkey !== t) return r.pubkey;
  const s = zt(n, "p")[0];
  return s !== void 0 && st.test(s) ? s : t;
}
function Mr(e, t, r) {
  const n = Wn(e, t, r);
  return n ? r.pubkey === t && n !== t ? [n, t] : [n] : [];
}
const zn = {
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
}, Vn = {
  4: "read your private messages (older kind)",
  13: "read your private messages",
  1059: "read your private messages",
  1573: "read orders sent to you",
  7375: "read the money in your Cashu wallet",
  7376: "read what your Cashu wallet spent",
  1e4: "read who you have muted",
  3e4: "read your private lists"
}, te = (e) => {
  try {
    return new URL(e).host;
  } catch {
    return e;
  }
};
function Dr(e, t) {
  const r = [], n = [], s = [], o = (i, c) => {
    i.includes(c) || i.push(c);
  };
  e.sign.includes(nt) && o(r, `prove who you are to ${[te(t), ...e.proofs.map(te)].join(", ")}`);
  for (const i of e.sign) {
    if (i === nt) continue;
    if (i === J) {
      e.appData.includes("*") ? o(n, "save application data under any name, including other applications' data") : o(r, `save its own data (${e.appData.join(", ")})`);
      continue;
    }
    const c = zn[i];
    if (!c) {
      Ct(i) ? o(r, `save its own kind of data (kind ${i})`) : s.push(i);
      continue;
    }
    o(jn.includes(i) ? n : r, c);
  }
  s.length > 0 && o(r, `sign kinds BitLogin has no words for: ${s.join(", ")}`);
  for (const i of e.read) {
    if (i === J) {
      e.appData.includes("*") ? o(n, "read application data saved under any name") : o(r, "read its own saved data");
      continue;
    }
    const c = Vn[i];
    c ? o(Un.includes(i) || i === 7375 ? n : r, c) : o(r, Ct(i) ? `read its own kind of data (kind ${i})` : `read what is encrypted in kind ${i}`);
  }
  return e.peers.length > 0 && o(r, `exchange encrypted messages with ${e.peers.length === 1 ? "one service" : `${e.peers.length} services`} it names (${e.peers.map((i) => `${i.slice(0, 8)}…`).join(", ")})`), { ordinary: r, sensitive: n };
}
export {
  ur as $,
  On as A,
  sn as B,
  nn as C,
  qn as D,
  X as E,
  ut as F,
  Gt as G,
  U as H,
  B as I,
  Be as J,
  Jn as K,
  Xt as L,
  C as M,
  tt as N,
  It as O,
  bt as P,
  Mr as Q,
  ot as R,
  pe as S,
  xr as T,
  Un as U,
  Lr as V,
  ln as W,
  lr as X,
  cr as Y,
  ar as Z,
  fr as _,
  yt as a,
  dn as a0,
  rr as a1,
  nr as a2,
  tr as a3,
  fe as a4,
  Qn as a5,
  Nt as a6,
  Er as a7,
  he as a8,
  ir as a9,
  or as aa,
  sr as ab,
  Zt as ac,
  Ot as ad,
  er as ae,
  be as af,
  Sr as b,
  h as c,
  pr as d,
  hr as e,
  et as f,
  Ir as g,
  dr as h,
  ht as i,
  wr as j,
  Or as k,
  yr as l,
  Nr as m,
  kr as n,
  mr as o,
  Ln as p,
  Dn as q,
  Se as r,
  gr as s,
  vr as t,
  Ar as u,
  br as v,
  Rt as w,
  _r as x,
  Dr as y,
  Zn as z
};
