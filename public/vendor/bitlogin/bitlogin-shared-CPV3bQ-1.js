import { C as _e, D as it, E as at, h as ct, u as ue, a as lt, A as $e, M as ut, B as ft, c as dt, p as ht, y as pt, b as yt, N as gt, v as ve, O as je } from "./bitlogin-shared-Cj9s0_W_.js";
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function wt(t) {
  return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in t && t.BYTES_PER_ELEMENT === 1;
}
function Oe(t) {
  if (typeof t != "boolean")
    throw new TypeError(`boolean expected, not ${t}`);
}
function de(t) {
  if (typeof t != "number")
    throw new TypeError("number expected, got " + typeof t);
  if (!Number.isSafeInteger(t) || t < 0)
    throw new RangeError("positive integer expected, got " + t);
}
function R(t, e, r = "") {
  const n = wt(t), s = t?.length, o = e !== void 0;
  if (!n || o && s !== e) {
    const i = r && `"${r}" `, c = o ? ` of length ${e}` : "", l = n ? `length=${s}` : `type=${typeof t}`, d = i + "expected Uint8Array" + c + ", got " + l;
    throw n ? new RangeError(d) : new TypeError(d);
  }
  return t;
}
function U(t) {
  return new Uint32Array(t.buffer, t.byteOffset, Math.floor(t.byteLength / 4));
}
function De(...t) {
  for (let e = 0; e < t.length; e++)
    t[e].fill(0);
}
const H = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68, bt = (t) => t << 24 & 4278190080 | t << 8 & 16711680 | t >>> 8 & 65280 | t >>> 24 & 255, mt = (t) => {
  for (let e = 0; e < t.length; e++)
    t[e] = bt(t[e]);
  return t;
}, j = H ? (t) => t : mt;
function At(t, e) {
  return !t.byteLength || !e.byteLength ? !1 : t.buffer === e.buffer && // best we can do, may fail with an obscure Proxy
  t.byteOffset < e.byteOffset + e.byteLength && // a starts before b end
  e.byteOffset < t.byteOffset + t.byteLength;
}
function yn(t, e) {
  if (At(t, e) && t.byteOffset < e.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function Et(t, e) {
  if (e == null || typeof e != "object")
    throw new Error("options must be defined");
  return Object.assign(t, e);
}
const gn = /* @__NO_SIDE_EFFECTS__ */ (t, e) => {
  function r(n, ...s) {
    if (R(n, void 0, "key"), t.nonceLength !== void 0) {
      const a = s[0];
      R(a, t.varSizeNonce ? void 0 : t.nonceLength, "nonce");
    }
    const o = t.tagLength;
    o && s[1] !== void 0 && R(s[1], void 0, "AAD");
    const i = e(n, ...s), c = (a, u) => {
      if (u !== void 0) {
        if (a !== 2)
          throw new Error("cipher output not supported");
        R(u, void 0, "output");
      }
    };
    let l = !1;
    return {
      encrypt(a, u) {
        if (l)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return l = !0, R(a), c(i.encrypt.length, u), i.encrypt(a, u);
      },
      decrypt(a, u) {
        if (R(a), o && a.length < o)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + o);
        return c(i.decrypt.length, u), i.decrypt(a, u);
      }
    };
  }
  return Object.assign(r, t), r;
};
function _t(t, e, r = !0) {
  if (e === void 0)
    return new Uint8Array(t);
  if (R(e, void 0, "output"), e.length !== t)
    throw new Error('"output" expected Uint8Array of length ' + t + ", got: " + e.length);
  if (r && !oe(e))
    throw new Error("invalid output, must be aligned");
  return e;
}
function oe(t) {
  return t.byteOffset % 4 === 0;
}
function Me(t) {
  return Uint8Array.from(R(t));
}
const Be = (t) => Uint8Array.from(t.split(""), (e) => e.charCodeAt(0)), vt = j(U(Be("expand 16-byte k"))), St = j(U(Be("expand 32-byte k")));
function f(t, e) {
  return t << e | t >>> 32 - e;
}
const Y = 64, Nt = 16, he = 2 ** 32 - 1, Pe = /* @__PURE__ */ Uint32Array.of();
function It(t, e, r, n, s, o, i, c) {
  const l = s.length, d = new Uint8Array(Y), a = U(d), u = H && oe(s) && oe(o), F = u ? U(s) : Pe, C = u ? U(o) : Pe;
  if (!H) {
    for (let y = 0; y < l; i++) {
      if (t(e, r, n, a, i, c), j(a), i >= he)
        throw new Error("arx: counter overflow");
      const g = Math.min(Y, l - y);
      for (let p = 0, h; p < g; p++)
        h = y + p, o[h] = s[h] ^ d[p];
      y += g;
    }
    return;
  }
  for (let y = 0; y < l; i++) {
    if (t(e, r, n, a, i, c), i >= he)
      throw new Error("arx: counter overflow");
    const g = Math.min(Y, l - y);
    if (u && g === Y) {
      const p = y / 4;
      if (y % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let h = 0, K; h < Nt; h++)
        K = p + h, C[K] = F[K] ^ a[h];
      y += Y;
      continue;
    }
    for (let p = 0, h; p < g; p++)
      h = y + p, o[h] = s[h] ^ d[p];
    y += g;
  }
}
function kt(t, e) {
  const { allowShortKeys: r, extendNonceFn: n, counterLength: s, counterRight: o, rounds: i } = Et({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, e);
  if (typeof t != "function")
    throw new Error("core must be a function");
  return de(s), de(i), Oe(o), Oe(r), (c, l, d, a, u = 0) => {
    R(c, void 0, "key"), R(l, void 0, "nonce"), R(d, void 0, "data");
    const F = d.length;
    if (a = _t(F, a, !1), de(u), u < 0 || u >= he)
      throw new Error("arx: counter overflow");
    const C = [];
    let y = c.length, g, p;
    if (y === 32)
      C.push(g = Me(c)), p = St;
    else if (y === 16 && r)
      g = new Uint8Array(32), g.set(c), g.set(c, 16), p = vt, C.push(g);
    else
      throw R(c, 32, "arx key"), new Error("invalid key size");
    (!H || !oe(l)) && C.push(l = Me(l));
    let h = U(g);
    if (n) {
      if (l.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const $ = l.subarray(0, 16);
      if (H)
        n(p, h, U($), h);
      else {
        const z = j(Uint32Array.from(p));
        n(z, h, U($), h), De(z), j(h);
      }
      l = l.subarray(16);
    } else H || j(h);
    const K = 16 - s;
    if (K !== l.length)
      throw new Error(`arx: nonce must be ${K} or 16 bytes`);
    if (K !== 12) {
      const $ = new Uint8Array(12);
      $.set(l, o ? 0 : 12 - l.length), l = $, C.push(l);
    }
    const re = j(U(l));
    try {
      return It(t, p, h, re, d, a, u, i), a;
    } finally {
      De(...C);
    }
  };
}
function xt(t, e, r, n, s, o = 20) {
  let i = t[0], c = t[1], l = t[2], d = t[3], a = e[0], u = e[1], F = e[2], C = e[3], y = e[4], g = e[5], p = e[6], h = e[7], K = s, re = r[0], $ = r[1], z = r[2], b = i, m = c, A = l, E = d, _ = a, v = u, S = F, N = C, I = y, k = g, x = p, L = h, O = K, D = re, M = $, P = z;
  for (let Le = 0; Le < o; Le += 2)
    b = b + _ | 0, O = f(O ^ b, 16), I = I + O | 0, _ = f(_ ^ I, 12), b = b + _ | 0, O = f(O ^ b, 8), I = I + O | 0, _ = f(_ ^ I, 7), m = m + v | 0, D = f(D ^ m, 16), k = k + D | 0, v = f(v ^ k, 12), m = m + v | 0, D = f(D ^ m, 8), k = k + D | 0, v = f(v ^ k, 7), A = A + S | 0, M = f(M ^ A, 16), x = x + M | 0, S = f(S ^ x, 12), A = A + S | 0, M = f(M ^ A, 8), x = x + M | 0, S = f(S ^ x, 7), E = E + N | 0, P = f(P ^ E, 16), L = L + P | 0, N = f(N ^ L, 12), E = E + N | 0, P = f(P ^ E, 8), L = L + P | 0, N = f(N ^ L, 7), b = b + v | 0, P = f(P ^ b, 16), x = x + P | 0, v = f(v ^ x, 12), b = b + v | 0, P = f(P ^ b, 8), x = x + P | 0, v = f(v ^ x, 7), m = m + S | 0, O = f(O ^ m, 16), L = L + O | 0, S = f(S ^ L, 12), m = m + S | 0, O = f(O ^ m, 8), L = L + O | 0, S = f(S ^ L, 7), A = A + N | 0, D = f(D ^ A, 16), I = I + D | 0, N = f(N ^ I, 12), A = A + N | 0, D = f(D ^ A, 8), I = I + D | 0, N = f(N ^ I, 7), E = E + _ | 0, M = f(M ^ E, 16), k = k + M | 0, _ = f(_ ^ k, 12), E = E + _ | 0, M = f(M ^ E, 8), k = k + M | 0, _ = f(_ ^ k, 7);
  let w = 0;
  n[w++] = i + b | 0, n[w++] = c + m | 0, n[w++] = l + A | 0, n[w++] = d + E | 0, n[w++] = a + _ | 0, n[w++] = u + v | 0, n[w++] = F + S | 0, n[w++] = C + N | 0, n[w++] = y + I | 0, n[w++] = g + k | 0, n[w++] = p + x | 0, n[w++] = h + L | 0, n[w++] = K + O | 0, n[w++] = re + D | 0, n[w++] = $ + M | 0, n[w++] = z + P | 0;
}
const Fe = /* @__PURE__ */ kt(xt, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
}), We = 2, pe = 1, Xe = 65536, Lt = 4294967295, Ot = 132, Dt = 99, ye = 1024 * 1024;
function wn(t, e) {
  const r = _e(new Uint8Array([2]), it(e)), s = at.getSharedSecret(t, r, !0).slice(1, 33);
  return ct(ue("nip44-v2"), s);
}
function Ve(t, e) {
  if (t.length !== 32)
    throw new Error("NIP-44 conversation key must be exactly 32 bytes.");
  if (e.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const r = dt(t, e, 76);
  return {
    chachaKey: r.slice(0, 32),
    chachaNonce: r.slice(32, 44),
    hmacKey: r.slice(44, 76)
  };
}
function Se(t) {
  if (t <= 32)
    return 32;
  const e = 2 ** Math.floor(Math.log2(t - 1) + 1), r = e <= 256 ? 32 : e / 8;
  return r * (Math.floor((t - 1) / r) + 1);
}
const He = 39 + Se(ye) + 32, Mt = Math.ceil(He / 3) * 4;
function Pt(t) {
  if (t < Xe) {
    const r = new Uint8Array(2);
    return new DataView(r.buffer).setUint16(0, t, !1), r;
  }
  const e = new Uint8Array(6);
  return new DataView(e.buffer).setUint32(2, t, !1), e;
}
function Rt(t) {
  const e = t.length;
  if (e < pe || e > ye)
    throw new Error(`NIP-44 plaintext length must be between ${pe} and ${ye} bytes on this platform.`);
  const r = Pt(e), n = Se(e), s = new Uint8Array(r.length + n);
  return s.set(r, 0), s.set(t, r.length), s;
}
function Tt(t) {
  const e = new DataView(t.buffer, t.byteOffset, t.byteLength), r = e.getUint16(0, !1);
  let n, s;
  if (r === 0) {
    if (n = e.getUint32(2, !1), s = 6, n < Xe)
      throw new Error("NIP-44 payload has inconsistent padding.");
  } else
    n = r, s = 2;
  if (n < pe || n > Lt || t.length !== s + Se(n))
    throw new Error("NIP-44 payload has inconsistent padding.");
  return t.slice(s, s + n);
}
function Ge(t, e, r) {
  return ht(pt, t, _e(e, r));
}
function Ct(t, e) {
  return Kt(t, e, lt(32));
}
function Kt(t, e, r) {
  if (r.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const { chachaKey: n, chachaNonce: s, hmacKey: o } = Ve(t, r), i = Rt(ue(e)), c = Fe(n, s, i), l = Ge(o, r, c);
  return $e.encode(_e(new Uint8Array([We]), r, c, l));
}
function Ut(t, e) {
  if (e.startsWith("#"))
    throw new Error("Unsupported NIP-44 non-base64 encoding.");
  if (e.length < Ot || e.length > Mt)
    throw new Error("NIP-44 payload size is outside this platform's supported range.");
  const r = $e.decode(e);
  if (r.length < Dt || r.length > He)
    throw new Error("NIP-44 decoded payload size is outside this platform's supported range.");
  if (r[0] !== We)
    throw new Error(`Unsupported NIP-44 version: ${r[0]}`);
  const n = r.slice(1, 33);
  if (n.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const s = r.slice(r.length - 32), o = r.slice(33, r.length - 32), { chachaKey: i, chachaNonce: c, hmacKey: l } = Ve(t, n), d = Ge(l, n, o);
  if (!ut(s, d))
    throw new Error("NIP-44 MAC verification failed: payload is corrupted, tampered, or uses the wrong key.");
  const a = Fe(i, c, o);
  return ft(Tt(a));
}
const ze = 37304, ge = {
  /** The most a save may hold, in bytes of UTF-8. It has to fit in one note that any relay will take. */
  dataBytes: 32768,
  /** No more saves than this for one world in `perMs`, and in an hour. Counted apart from notes and passes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** A save handed over to be opened is not read past this many characters of content. */
  contentChars: 7e4
}, $t = /^[a-z0-9][a-z0-9-]{0,31}$/u, jt = /^[0-9a-f]{64}$/u, Bt = "Something a world keeps for its visitor. Only they can read it.";
function B(t) {
  return typeof t == "string" && $t.test(t) ? t : "";
}
function Ne(t) {
  return typeof t == "string" && t.length <= ge.dataBytes && ue(t).length <= ge.dataBytes;
}
function Ye(t, e, r) {
  const n = T(e), s = B(r);
  return !n || !s ? "" : yt(gt(t, ue(`nswp-save
${n}
${s}`)));
}
function bn(t) {
  const e = T(t.world), r = B(t.slot), n = Ye(t.conversationKey, e, r);
  if (!n || !Ne(t.data)) return null;
  const s = JSON.stringify({ v: 1, world: e, slot: r, data: t.data });
  return {
    kind: ze,
    created_at: Math.floor(t.nowSeconds),
    tags: [
      ["d", n],
      ["alt", Bt]
    ],
    content: Ct(t.conversationKey, s)
  };
}
function mn(t, e) {
  const r = T(e.world);
  if (!r || !t || typeof t != "object" || !jt.test(e.pubkey)) return null;
  const n = t;
  if (n.kind !== ze || n.pubkey !== e.pubkey || typeof n.content != "string" || n.content.length > ge.contentChars || !Array.isArray(n.tags)) return null;
  let s;
  try {
    s = JSON.parse(Ut(e.conversationKey, n.content));
  } catch {
    return null;
  }
  if (!s || typeof s != "object" || s.v !== 1 || s.world !== r) return null;
  const o = B(s.slot);
  if (!o || !Ne(s.data)) return null;
  const i = n.tags.find((c) => Array.isArray(c) && c[0] === "d");
  return !i || i[1] !== Ye(e.conversationKey, r, o) ? null : { slot: o, data: s.data, at: typeof n.created_at == "number" && Number.isInteger(n.created_at) ? n.created_at : 0 };
}
const we = 3, An = { burst: 6, perMs: 6e4, hourly: 60 }, se = {
  /** A list handed over to be changed is not read past this many tags, or this much content. */
  tags: 2e4,
  contentChars: 1e5,
  tagItems: 16,
  tagChars: 1e3
}, Ft = ["follows", "messages"];
function q(t) {
  return Array.isArray(t) ? Ft.filter((e) => t.includes(e)) : [];
}
const Wt = ["nswp:world", "bitlogin:site"], Xt = /^[0-9a-f]{64}$/u;
function Re(t, e) {
  if (t && (t.kind !== we || !Array.isArray(t.tags)) || !t && !e.fromNothing) return null;
  const r = typeof e.add == "string" ? e.add.toLowerCase() : "", n = typeof e.remove == "string" ? e.remove.toLowerCase() : "";
  if (r === "" == (n === "")) return null;
  const s = r || n;
  if (!Xt.test(s) || r && (t?.pubkey ?? e.pubkey) === r) return null;
  const o = t ? t.tags.filter((a) => Array.isArray(a) && a.every((u) => typeof u == "string") && !Wt.includes(a[0] ?? "")) : [], i = (a) => a[0] === "p" && typeof a[1] == "string" && a[1].toLowerCase() === s, c = o.some(i);
  if (r ? c : !c) return null;
  const l = r ? [...o.map((a) => [...a]), ["p", r]] : o.filter((a) => !i(a)).map((a) => [...a]), d = Math.max(Math.floor(e.nowSeconds), t ? t.created_at + 1 : 0);
  return { kind: we, created_at: d, tags: l, content: typeof t?.content == "string" ? t.content : "" };
}
function Vt(t, e) {
  if (!t || typeof t != "object") return null;
  const r = t;
  if (r.kind !== we || r.pubkey !== e || !Array.isArray(r.tags) || r.tags.length > se.tags || typeof r.content != "string" || r.content.length > se.contentChars) return null;
  for (const n of r.tags)
    if (!Array.isArray(n) || n.length > se.tagItems || !n.every((s) => typeof s == "string" && s.length <= se.tagChars)) return null;
  return ve(t) ? t : null;
}
function En(t) {
  const e = { add: t.add, remove: t.remove, nowSeconds: t.nowSeconds, pubkey: t.pubkey };
  if (t.list === null || t.list === void 0) return t.seen ? null : Re(null, { ...e, fromNothing: !0 });
  const r = Vt(t.list, t.pubkey);
  return !r || t.seen && r.created_at < t.seen ? null : Re(r, e);
}
function _n(t, e) {
  return t === null ? e.answered > 0 && e.newestAt === 0 : t.created_at >= e.newestAt;
}
const be = 14, Je = 13, Ht = 1059, Gt = 10050, ie = {
  /** The most characters in one message. */
  chars: 2e3,
  /** No more than this many relays are put in a list of where messages reach someone. */
  relays: 4,
  /** A wrap handed over to be opened is not read past this many characters of content. */
  wrapChars: 6e4
}, vn = { burst: 10, perMs: 6e4, hourly: 200 }, Sn = { burst: 600, perMs: 6e4, hourly: 12e3 }, Nn = { burst: 3, perMs: 6e4, hourly: 12 }, ae = /^[0-9a-f]{64}$/u, zt = [
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
function ce(t) {
  if (typeof t != "string") return "";
  let e = "";
  for (const r of t.slice(0, ie.chars * 8).normalize("NFC")) {
    const n = r.codePointAt(0);
    e += zt.some(([s, o]) => n >= s && n <= o) ? " " : r;
  }
  return e = e.replace(/[^\S\n]+/gu, " ").replace(/ ?\n ?/gu, `
`).replace(/\n{3,}/gu, `

`).trim(), [...e].slice(0, ie.chars).join("").trim();
}
function Yt(t) {
  const e = ce(t.text);
  if (!ae.test(t.from) || typeof t.to != "string" || !ae.test(t.to) || t.from === t.to || !e) return null;
  const r = { kind: be, pubkey: t.from, created_at: Math.floor(t.nowSeconds), tags: [["p", t.to]], content: e };
  return { ...r, id: je(r) };
}
function In(t, e) {
  const r = t.getPublicKey(), n = Yt({ from: r, to: e.to, text: e.text, nowSeconds: e.nowSeconds });
  if (!n) return null;
  const s = JSON.stringify(n), o = (i) => t.signEvent({ kind: Je, created_at: Math.floor(e.nowSeconds), tags: [], content: t.nip44Encrypt(i, s) });
  return { message: n, seals: [o(n.tags[0][1]), o(r)] };
}
function Jt(t) {
  let e;
  try {
    e = JSON.parse(t);
  } catch {
    return null;
  }
  return !ve(e) || e.kind !== Je || e.tags.length !== 0 ? null : e;
}
function qt(t, e, r) {
  let n;
  try {
    n = JSON.parse(t);
  } catch {
    return null;
  }
  if (!n || typeof n != "object" || n.kind !== be || n.pubkey !== e || typeof n.pubkey != "string" || !ae.test(n.pubkey) || typeof n.content != "string" || typeof n.created_at != "number" || !Number.isInteger(n.created_at) || !Array.isArray(n.tags) || !n.tags.every((c) => Array.isArray(c) && c.every((l) => typeof l == "string"))) return null;
  const s = [...new Set(n.tags.filter((c) => c[0] === "p" && typeof c[1] == "string" && ae.test(c[1])).map((c) => c[1]))], o = ce(n.content);
  return s.length === 0 || !o || n.pubkey !== r && !s.includes(r) ? null : { id: je({ kind: be, pubkey: n.pubkey, created_at: n.created_at, tags: n.tags, content: n.content }), from: n.pubkey, to: s, text: o, at: n.created_at };
}
function kn(t, e) {
  const r = t.getPublicKey();
  if (!e || typeof e != "object") return null;
  const n = e;
  if (n.kind !== Ht || typeof n.content != "string" || n.content.length > ie.wrapChars || !Array.isArray(n.tags) || n.tags.length > 20 || !ve(e) || !e.tags.some((s) => s[0] === "p" && s[1] === r)) return null;
  try {
    const s = Jt(t.nip44Decrypt(e.pubkey, e.content));
    return s ? qt(t.nip44Decrypt(s.pubkey, s.content), s.pubkey, r) : null;
  } catch {
    return null;
  }
}
function Zt(t) {
  if (typeof t != "string" || t.length > 200) return "";
  try {
    const e = new URL(t.trim()), r = e.hostname;
    return e.protocol !== "wss:" || e.username || e.password || !r.includes(".") || r.startsWith("[") || /^[0-9.]+$/u.test(r) || /\.(local|localhost|internal|lan|home)$/iu.test(r) ? "" : (e.hash = "", e.href.replace(/\/$/u, ""));
  } catch {
    return "";
  }
}
function xn(t, e) {
  if (!Array.isArray(t) || t.length > 8) return null;
  const r = [...new Set(t.map(Zt).filter(Boolean))].slice(0, ie.relays);
  return r.length === 0 ? null : { kind: Gt, created_at: Math.floor(e), tags: r.map((n) => ["relay", n]), content: "" };
}
const qe = "nswp-signer", Ze = "nswp-handoff", fe = 1, Z = {
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
}, Qt = [1, 7], en = [4, 13, 14, 15, 1059, 1060, 13194, 22242, 23194, 23195, 24133, 27235, 27300, 27301, 30078];
function tn(t) {
  return typeof t != "number" || !Number.isInteger(t) || t < 0 || t > 65535 || en.includes(t) ? "never" : Qt.includes(t) ? "ordinary" : "careful";
}
const Te = "nswp:world";
function T(t) {
  if (typeof t != "string" || t.length > 300) return "";
  try {
    const e = new URL(t);
    return (e.protocol === "https:" || e.protocol === "http:") && e.origin !== "null" ? e.origin : "";
  } catch {
    return "";
  }
}
function me(t) {
  if (typeof t != "string") return "";
  let e = "";
  for (const r of t.slice(0, 400).normalize("NFC")) {
    const n = r.codePointAt(0), s = n <= 31 || n >= 127 && n <= 159 || n >= 8203 && n <= 8207 || n >= 8232 && n <= 8239 || n >= 8288 && n <= 8303 || n === 65279;
    e += s ? " " : r;
  }
  return [...e.replace(/\s+/gu, " ").trim()].slice(0, 48).join("").trim();
}
function Ln(t, e, r) {
  const n = T(e);
  if (!n || !t || typeof t != "object") return null;
  const s = t;
  if (tn(s.kind) !== "ordinary" || typeof s.content != "string" || [...s.content].length > Z.contentChars || !Array.isArray(s.tags) || s.tags.length > Z.tags) return null;
  const o = [];
  for (const i of s.tags) {
    if (!Array.isArray(i) || i.length === 0 || i.length > Z.tagItems || !i.every((c) => typeof c == "string" && c.length <= Z.tagChars)) return null;
    i[0] !== Te && o.push([...i]);
  }
  return o.push([Te, n]), { kind: s.kind, created_at: Math.floor(r), tags: o, content: s.content };
}
function On(t = Z, e = []) {
  let r = e.filter((n) => typeof n == "number" && Number.isFinite(n));
  return {
    times: () => [...r],
    take(n) {
      return r = r.filter((s) => n - s < 36e5), r.length >= t.hourly || r.filter((s) => n - s < t.perMs).length >= t.burst ? !1 : (r.push(n), !0);
    }
  };
}
const Qe = /^[0-9a-z-]{1,40}$/iu, V = /^[0-9a-f]{64}$/u, Dn = (t) => ({ nswp: qe, v: fe, ...t });
function Mn(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.nswp !== qe || e.v !== fe || typeof e.id != "string" || !Qe.test(e.id)) return null;
  if (e.t === "state") return { t: "state", id: e.id };
  if (e.t === "lock") return { t: "lock", id: e.id };
  if (e.t === "sign" && e.event && typeof e.event == "object") return { t: "sign", id: e.id, event: e.event };
  if (e.t === "pass" && typeof e.session == "string" && V.test(e.session)) return { t: "pass", id: e.id, session: e.session };
  if (e.t === "save" && B(e.slot) && Ne(e.data)) return { t: "save", id: e.id, slot: B(e.slot), data: e.data };
  if (e.t === "find" && B(e.slot)) return { t: "find", id: e.id, slot: B(e.slot) };
  if (e.t === "open" && e.event && typeof e.event == "object") return { t: "open", id: e.id, event: e.event };
  if (e.t === "want" && e.permissions === void 0 && Array.isArray(e.more)) return { t: "wantMore", id: e.id, more: q(e.more) };
  if (e.t === "follow" && (e.list === null || e.list && typeof e.list == "object")) {
    const r = typeof e.add == "string" && V.test(e.add), n = typeof e.remove == "string" && V.test(e.remove);
    return r === n ? null : { t: "follow", id: e.id, list: e.list, ...r ? { add: e.add } : { remove: e.remove } };
  }
  if (e.t === "seal" && typeof e.to == "string" && V.test(e.to) && ce(e.text)) return { t: "seal", id: e.id, to: e.to, text: ce(e.text) };
  if (e.t === "unwrap" && e.event && typeof e.event == "object") return { t: "unwrap", id: e.id, event: e.event };
  if (e.t === "reach" && Array.isArray(e.relays) && e.relays.length <= 8 && e.relays.every((r) => typeof r == "string" && r.length <= 200)) return { t: "reach", id: e.id, relays: e.relays };
  if (e.t === "want") {
    const r = st(e.permissions);
    return r ? { t: "want", id: e.id, permissions: r } : null;
  }
  return (e.t === "encrypt" || e.t === "decrypt") && typeof e.peer == "string" && V.test(e.peer) && typeof e.text == "string" && e.text.length <= 2e5 ? { t: e.t, id: e.id, peer: e.peer, text: e.text, scheme: e.scheme === "nip04" ? "nip04" : "nip44" } : e.t === "read" && e.event && typeof e.event == "object" ? { t: "read", id: e.id, event: e.event } : null;
}
const Pn = (t) => ({ nswp: Ze, v: fe, ...t });
function Rn(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.nswp !== Ze || e.v !== fe || typeof e.nonce != "string" || !Qe.test(e.nonce)) return null;
  const r = (n) => typeof n == "string" && V.test(n);
  if (e.t === "hello") return { t: "hello", nonce: e.nonce };
  if (e.t === "frame" && T(e.world) && r(e.recipient)) {
    const n = e.wants === void 0 ? void 0 : st(e.wants);
    return n === null ? null : { t: "frame", nonce: e.nonce, world: T(e.world), recipient: e.recipient, ...n ? { wants: n } : {}, ...e.turnedDown === !0 ? { turnedDown: !0 } : {}, ...!n && q(e.more).length ? { more: q(e.more) } : {}, ...!n && q(e.has).length ? { has: q(e.has) } : {} };
  }
  if (e.t === "grant" && T(e.world) && e.sealed && typeof e.sealed == "object") {
    const n = e.sealed;
    if (!r(n.senderPublicKey) || typeof n.payload != "string" || n.payload.length > 12e3) return null;
    const s = me(e.name);
    return { t: "grant", nonce: e.nonce, world: T(e.world), sealed: { senderPublicKey: n.senderPublicKey, payload: n.payload }, ...s ? { name: s } : {} };
  }
  return e.t === "done" && typeof e.ok == "boolean" ? { t: "done", nonce: e.nonce, ok: e.ok } : null;
}
const W = { kinds: 64, prefixes: 8, origins: 8, peers: 8, prefixChars: 64 }, G = 30078, Q = 27235, et = 24242, Ie = 22242, tt = 13, nn = 37304, Ae = "bitlogin:", nt = [13194, 23194, 23195, 24133, 27301, 37304], ee = {
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
}, ne = [27300, 27302, 27303], rn = 27303;
function Tn(t) {
  return Object.hasOwn(ee, t) ? ee[t].name : null;
}
function Ce(t) {
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
function sn(t, e) {
  return Object.hasOwn(ee, t) ? ee[t].reserved ?? [] : Ce(e) && Ce(t) ? ne : [];
}
const on = () => {
  try {
    return globalThis.location?.origin ?? "";
  } catch {
    return "";
  }
}, ke = (t) => sn(t, on()), Cn = (t) => !Object.hasOwn(ee, t) && ke(t).length > 0;
function Kn(t, e) {
  const r = ke(t);
  return [...e.sign, ...e.read].every((n) => !ne.includes(n) || r.includes(n));
}
const rt = [0, 3, 5, 1e4, 10002, 10050, Ie], an = [...rt, et, ...ne], cn = [4, tt, 1059], ln = [Q, et, Ie], te = /^[0-9a-f]{64}$/u, le = (t) => typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 65535, J = (t) => [...new Set(t)];
function st(t) {
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const e = t, r = (a) => a === void 0 ? [] : Array.isArray(a) ? a : null, n = r(e.sign), s = r(e.appData), o = r(e.proofs), i = r(e.read), c = r(e.peers);
  if (!n || !s || !o || !i || !c || n.length > W.kinds || i.length > W.kinds || s.length > W.prefixes || o.length > W.origins || c.length > W.peers || !n.every(le) || !i.every(le) || n.some((a) => nt.includes(a)) || i.includes(nn) || n.length === 0 && i.length === 0 && c.length === 0) return null;
  for (const a of s)
    if (typeof a != "string" || a.length === 0 || a.length > W.prefixChars || a !== "*" && (a.startsWith(Ae) || Ae.startsWith(a)) || me(a) !== a) return null;
  if ((n.includes(G) || i.includes(G)) !== s.length > 0) return null;
  const l = [];
  for (const a of o) {
    const u = T(a);
    if (!u || u !== a || !u.startsWith("https://")) return null;
    l.push(u);
  }
  if (l.length > 0 && !n.includes(Q) || !c.every((a) => typeof a == "string" && te.test(a))) return null;
  const d = me(e.name);
  return {
    ...d ? { name: d } : {},
    sign: J(n).sort((a, u) => a - u),
    appData: J(s),
    proofs: J(l),
    read: J(i).sort((a, u) => a - u),
    peers: J(c)
  };
}
const Un = {
  /** Proofs, and the application's own data: what applications sign on timers. */
  quiet: { burst: 300, perMs: 6e4, hourly: 6e3 },
  public: { burst: 60, perMs: 6e4, hourly: 1200 },
  sensitive: { burst: 30, perMs: 6e4, hourly: 300 },
  read: { burst: 600, perMs: 6e4, hourly: 12e3 }
}, X = {
  contentChars: 1e5,
  tags: 2500,
  /** Who someone follows (kind 3) is one note with a tag for each person: more are let through. */
  followTags: 2e4,
  tagItems: 16,
  tagChars: 1e3,
  clockSlackSec: 600
}, Ee = (t) => t >= 3e4 && t < 4e4;
function $n(t) {
  return rt.includes(t) && t !== Ie || ne.includes(t) ? "sensitive" : ln.includes(t) || Ee(t) ? "quiet" : "public";
}
const Ke = "bitlogin:site", xe = (t, e) => t.filter((r) => r[0] === e && typeof r[1] == "string").map((r) => r[1]);
function ot(t, e) {
  const r = xe(e, "d")[0];
  return r === void 0 || r.startsWith(Ae) ? !1 : t.appData.some((n) => n === "*" || r.startsWith(n));
}
function un(t, e, r) {
  const n = xe(r, "u");
  return n.length === 0 ? !1 : n.every((s) => {
    const o = T(s);
    return o !== "" && (o === e || t.proofs.includes(o));
  });
}
function jn(t, e, r, n) {
  const s = T(r);
  if (!s || !e || typeof e != "object") return null;
  const o = e;
  if (!le(o.kind) || nt.includes(o.kind) || !t.sign.includes(o.kind) || ne.includes(o.kind) && !ke(s).includes(o.kind) || typeof o.content != "string" || o.content.length > X.contentChars || !Array.isArray(o.tags) || o.tags.length > (o.kind === 3 ? X.followTags : X.tags)) return null;
  const i = [];
  for (const a of o.tags) {
    if (!Array.isArray(a) || a.length === 0 || a.length > X.tagItems || !a.every((u) => typeof u == "string" && u.length <= X.tagChars)) return null;
    if (a[0] !== Ke) {
      if (a[0] === "nswp:world") {
        if (o.kind !== rn) continue;
        if (a.length !== 2 || T(a[1]) !== a[1] || i.some((u) => u[0] === "nswp:world")) return null;
      }
      i.push([...a]);
    }
  }
  if (o.kind === G && !ot(t, i) || o.kind === Q && !un(t, s, i)) return null;
  if (o.kind === tt) {
    if (i.length > 0) return null;
  } else
    i.push([Ke, s]);
  const c = Math.floor(n), l = typeof o.created_at == "number" && Number.isInteger(o.created_at) ? o.created_at : c, d = Math.abs(l - c) <= X.clockSlackSec ? l : c;
  return { kind: o.kind, created_at: d, tags: i, content: o.content };
}
function Bn(t, e, r) {
  return typeof r == "string" && te.test(r) && (r === e || t.peers.includes(r));
}
function Fn(t, e) {
  return typeof e == "string" && te.test(e) && t.peers.includes(e);
}
function fn(t, e, r) {
  if (!le(r.kind) || !t.read.includes(r.kind) || typeof r.pubkey != "string" || !te.test(r.pubkey) || !Array.isArray(r.tags)) return null;
  const n = r.tags.filter((o) => Array.isArray(o) && o.every((i) => typeof i == "string"));
  if (r.kind === G && !ot(t, n)) return null;
  if (r.pubkey !== e) return r.pubkey;
  const s = xe(n, "p")[0];
  return s !== void 0 && te.test(s) ? s : e;
}
function Wn(t, e, r) {
  const n = fn(t, e, r);
  return n ? r.pubkey === e && n !== e ? [n, e] : [n] : [];
}
const dn = {
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
  37305: "rate worlds, from one to five stars"
}, hn = {
  4: "read your private messages (older kind)",
  13: "read your private messages",
  1059: "read your private messages",
  1573: "read orders sent to you",
  7375: "read the money in your Cashu wallet",
  7376: "read what your Cashu wallet spent",
  1e4: "read who you have muted",
  3e4: "read your private lists"
}, Ue = (t) => {
  try {
    return new URL(t).host;
  } catch {
    return t;
  }
};
function Xn(t, e) {
  const r = [], n = [], s = [], o = (i, c) => {
    i.includes(c) || i.push(c);
  };
  t.sign.includes(Q) && o(r, `prove who you are to ${[Ue(e), ...t.proofs.map(Ue)].join(", ")}`);
  for (const i of t.sign) {
    if (i === Q) continue;
    if (i === G) {
      t.appData.includes("*") ? o(n, "save application data under any name, including other applications' data") : o(r, `save its own data (${t.appData.join(", ")})`);
      continue;
    }
    const c = dn[i];
    if (!c) {
      Ee(i) ? o(r, `save its own kind of data (kind ${i})`) : s.push(i);
      continue;
    }
    o(an.includes(i) ? n : r, c);
  }
  s.length > 0 && o(r, `sign kinds BitLogin has no words for: ${s.join(", ")}`);
  for (const i of t.read) {
    if (i === G) {
      t.appData.includes("*") ? o(n, "read application data saved under any name") : o(r, "read its own saved data");
      continue;
    }
    const c = hn[i];
    c ? o(cn.includes(i) || i === 7375 ? n : r, c) : o(r, Ee(i) ? `read its own kind of data (kind ${i})` : `read what is encrypted in kind ${i}`);
  }
  return t.peers.length > 0 && o(r, `exchange encrypted messages with ${t.peers.length === 1 ? "one service" : `${t.peers.length} services`} it names (${t.peers.map((i) => `${i.slice(0, 8)}…`).join(", ")})`), { ordinary: r, sensitive: n };
}
export {
  vn as $,
  Un as A,
  De as B,
  R as C,
  me as D,
  q as E,
  tn as F,
  Wn as G,
  Fn as H,
  Bn as I,
  xn as J,
  kn as K,
  In as L,
  cn as M,
  Vt as N,
  we as O,
  fe as P,
  _n as Q,
  ne as R,
  qe as S,
  En as T,
  mn as U,
  Ye as V,
  Ft as W,
  bn as X,
  ge as Y,
  Nn as Z,
  Sn as _,
  On as a,
  An as a0,
  Z as b,
  T as c,
  Mn as d,
  Ln as e,
  Rn as f,
  Cn as g,
  Pn as h,
  Xn as i,
  wn as j,
  Tn as k,
  $n as l,
  Kn as m,
  Ut as n,
  Ct as o,
  jn as p,
  H as q,
  st as r,
  Dn as s,
  oe as t,
  Me as u,
  U as v,
  gn as w,
  j as x,
  _t as y,
  yn as z
};
