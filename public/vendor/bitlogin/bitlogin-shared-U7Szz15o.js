import { C as be, D as Qe, E as et, h as tt, u as ie, a as nt, A as Te, M as rt, B as st, c as ot, p as it, y as at, b as ct, N as lt, v as ft } from "./bitlogin-shared-CFGY85HS.js";
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
function ut(e) {
  return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in e && e.BYTES_PER_ELEMENT === 1;
}
function Ie(e) {
  if (typeof e != "boolean")
    throw new TypeError(`boolean expected, not ${e}`);
}
function ce(e) {
  if (typeof e != "number")
    throw new TypeError("number expected, got " + typeof e);
  if (!Number.isSafeInteger(e) || e < 0)
    throw new RangeError("positive integer expected, got " + e);
}
function T(e, t, n = "") {
  const r = ut(e), s = e?.length, o = t !== void 0;
  if (!r || o && s !== t) {
    const i = n && `"${n}" `, c = o ? ` of length ${t}` : "", l = r ? `length=${s}` : `type=${typeof e}`, d = i + "expected Uint8Array" + c + ", got " + l;
    throw r ? new RangeError(d) : new TypeError(d);
  }
  return e;
}
function U(e) {
  return new Uint32Array(e.buffer, e.byteOffset, Math.floor(e.byteLength / 4));
}
function Se(...e) {
  for (let t = 0; t < e.length; t++)
    e[t].fill(0);
}
const X = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68, dt = (e) => e << 24 & 4278190080 | e << 8 & 16711680 | e >>> 8 & 65280 | e >>> 24 & 255, ht = (e) => {
  for (let t = 0; t < e.length; t++)
    e[t] = dt(e[t]);
  return e;
}, $ = X ? (e) => e : ht;
function pt(e, t) {
  return !e.byteLength || !t.byteLength ? !1 : e.buffer === t.buffer && // best we can do, may fail with an obscure Proxy
  e.byteOffset < t.byteOffset + t.byteLength && // a starts before b end
  t.byteOffset < e.byteOffset + e.byteLength;
}
function tn(e, t) {
  if (pt(e, t) && e.byteOffset < t.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function yt(e, t) {
  if (t == null || typeof t != "object")
    throw new Error("options must be defined");
  return Object.assign(e, t);
}
const nn = /* @__NO_SIDE_EFFECTS__ */ (e, t) => {
  function n(r, ...s) {
    if (T(r, void 0, "key"), e.nonceLength !== void 0) {
      const a = s[0];
      T(a, e.varSizeNonce ? void 0 : e.nonceLength, "nonce");
    }
    const o = e.tagLength;
    o && s[1] !== void 0 && T(s[1], void 0, "AAD");
    const i = t(r, ...s), c = (a, f) => {
      if (f !== void 0) {
        if (a !== 2)
          throw new Error("cipher output not supported");
        T(f, void 0, "output");
      }
    };
    let l = !1;
    return {
      encrypt(a, f) {
        if (l)
          throw new Error("cannot encrypt() twice with same key + nonce");
        return l = !0, T(a), c(i.encrypt.length, f), i.encrypt(a, f);
      },
      decrypt(a, f) {
        if (T(a), o && a.length < o)
          throw new Error('"ciphertext" expected length bigger than tagLength=' + o);
        return c(i.decrypt.length, f), i.decrypt(a, f);
      }
    };
  }
  return Object.assign(n, e), n;
};
function gt(e, t, n = !0) {
  if (t === void 0)
    return new Uint8Array(e);
  if (T(t, void 0, "output"), t.length !== e)
    throw new Error('"output" expected Uint8Array of length ' + e + ", got: " + t.length);
  if (n && !se(t))
    throw new Error("invalid output, must be aligned");
  return t;
}
function se(e) {
  return e.byteOffset % 4 === 0;
}
function xe(e) {
  return Uint8Array.from(T(e));
}
const Re = (e) => Uint8Array.from(e.split(""), (t) => t.charCodeAt(0)), wt = $(U(Re("expand 16-byte k"))), bt = $(U(Re("expand 32-byte k")));
function u(e, t) {
  return e << t | e >>> 32 - t;
}
const G = 64, mt = 16, le = 2 ** 32 - 1, Oe = /* @__PURE__ */ Uint32Array.of();
function At(e, t, n, r, s, o, i, c) {
  const l = s.length, d = new Uint8Array(G), a = U(d), f = X && se(s) && se(o), F = f ? U(s) : Oe, C = f ? U(o) : Oe;
  if (!X) {
    for (let y = 0; y < l; i++) {
      if (e(t, n, r, a, i, c), $(a), i >= le)
        throw new Error("arx: counter overflow");
      const g = Math.min(G, l - y);
      for (let p = 0, h; p < g; p++)
        h = y + p, o[h] = s[h] ^ d[p];
      y += g;
    }
    return;
  }
  for (let y = 0; y < l; i++) {
    if (e(t, n, r, a, i, c), i >= le)
      throw new Error("arx: counter overflow");
    const g = Math.min(G, l - y);
    if (f && g === G) {
      const p = y / 4;
      if (y % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let h = 0, K; h < mt; h++)
        K = p + h, C[K] = F[K] ^ a[h];
      y += G;
      continue;
    }
    for (let p = 0, h; p < g; p++)
      h = y + p, o[h] = s[h] ^ d[p];
    y += g;
  }
}
function Et(e, t) {
  const { allowShortKeys: n, extendNonceFn: r, counterLength: s, counterRight: o, rounds: i } = yt({ allowShortKeys: !1, counterLength: 8, counterRight: !1, rounds: 20 }, t);
  if (typeof e != "function")
    throw new Error("core must be a function");
  return ce(s), ce(i), Ie(o), Ie(n), (c, l, d, a, f = 0) => {
    T(c, void 0, "key"), T(l, void 0, "nonce"), T(d, void 0, "data");
    const F = d.length;
    if (a = gt(F, a, !1), ce(f), f < 0 || f >= le)
      throw new Error("arx: counter overflow");
    const C = [];
    let y = c.length, g, p;
    if (y === 32)
      C.push(g = xe(c)), p = bt;
    else if (y === 16 && n)
      g = new Uint8Array(32), g.set(c), g.set(c, 16), p = wt, C.push(g);
    else
      throw T(c, 32, "arx key"), new Error("invalid key size");
    (!X || !se(l)) && C.push(l = xe(l));
    let h = U(g);
    if (r) {
      if (l.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const j = l.subarray(0, 16);
      if (X)
        r(p, h, U(j), h);
      else {
        const z = $(Uint32Array.from(p));
        r(z, h, U(j), h), Se(z), $(h);
      }
      l = l.subarray(16);
    } else X || $(h);
    const K = 16 - s;
    if (K !== l.length)
      throw new Error(`arx: nonce must be ${K} or 16 bytes`);
    if (K !== 12) {
      const j = new Uint8Array(12);
      j.set(l, o ? 0 : 12 - l.length), l = j, C.push(l);
    }
    const ne = $(U(l));
    try {
      return At(e, p, h, ne, d, a, f, i), a;
    } finally {
      Se(...C);
    }
  };
}
function vt(e, t, n, r, s, o = 20) {
  let i = e[0], c = e[1], l = e[2], d = e[3], a = t[0], f = t[1], F = t[2], C = t[3], y = t[4], g = t[5], p = t[6], h = t[7], K = s, ne = n[0], j = n[1], z = n[2], b = i, m = c, A = l, E = d, v = a, _ = f, N = F, I = C, S = y, x = g, O = p, L = h, k = K, P = ne, D = j, M = z;
  for (let Ne = 0; Ne < o; Ne += 2)
    b = b + v | 0, k = u(k ^ b, 16), S = S + k | 0, v = u(v ^ S, 12), b = b + v | 0, k = u(k ^ b, 8), S = S + k | 0, v = u(v ^ S, 7), m = m + _ | 0, P = u(P ^ m, 16), x = x + P | 0, _ = u(_ ^ x, 12), m = m + _ | 0, P = u(P ^ m, 8), x = x + P | 0, _ = u(_ ^ x, 7), A = A + N | 0, D = u(D ^ A, 16), O = O + D | 0, N = u(N ^ O, 12), A = A + N | 0, D = u(D ^ A, 8), O = O + D | 0, N = u(N ^ O, 7), E = E + I | 0, M = u(M ^ E, 16), L = L + M | 0, I = u(I ^ L, 12), E = E + I | 0, M = u(M ^ E, 8), L = L + M | 0, I = u(I ^ L, 7), b = b + _ | 0, M = u(M ^ b, 16), O = O + M | 0, _ = u(_ ^ O, 12), b = b + _ | 0, M = u(M ^ b, 8), O = O + M | 0, _ = u(_ ^ O, 7), m = m + N | 0, k = u(k ^ m, 16), L = L + k | 0, N = u(N ^ L, 12), m = m + N | 0, k = u(k ^ m, 8), L = L + k | 0, N = u(N ^ L, 7), A = A + I | 0, P = u(P ^ A, 16), S = S + P | 0, I = u(I ^ S, 12), A = A + I | 0, P = u(P ^ A, 8), S = S + P | 0, I = u(I ^ S, 7), E = E + v | 0, D = u(D ^ E, 16), x = x + D | 0, v = u(v ^ x, 12), E = E + v | 0, D = u(D ^ E, 8), x = x + D | 0, v = u(v ^ x, 7);
  let w = 0;
  r[w++] = i + b | 0, r[w++] = c + m | 0, r[w++] = l + A | 0, r[w++] = d + E | 0, r[w++] = a + v | 0, r[w++] = f + _ | 0, r[w++] = F + N | 0, r[w++] = C + I | 0, r[w++] = y + S | 0, r[w++] = g + x | 0, r[w++] = p + O | 0, r[w++] = h + L | 0, r[w++] = K + k | 0, r[w++] = ne + P | 0, r[w++] = j + D | 0, r[w++] = z + M | 0;
}
const Ce = /* @__PURE__ */ Et(vt, {
  counterRight: !1,
  counterLength: 4,
  allowShortKeys: !1
}), Ke = 2, fe = 1, Ue = 65536, _t = 4294967295, Nt = 132, It = 99, ue = 1024 * 1024;
function rn(e, t) {
  const n = be(new Uint8Array([2]), Qe(t)), s = et.getSharedSecret(e, n, !0).slice(1, 33);
  return tt(ie("nip44-v2"), s);
}
function je(e, t) {
  if (e.length !== 32)
    throw new Error("NIP-44 conversation key must be exactly 32 bytes.");
  if (t.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const n = ot(e, t, 76);
  return {
    chachaKey: n.slice(0, 32),
    chachaNonce: n.slice(32, 44),
    hmacKey: n.slice(44, 76)
  };
}
function me(e) {
  if (e <= 32)
    return 32;
  const t = 2 ** Math.floor(Math.log2(e - 1) + 1), n = t <= 256 ? 32 : t / 8;
  return n * (Math.floor((e - 1) / n) + 1);
}
const $e = 39 + me(ue) + 32, St = Math.ceil($e / 3) * 4;
function xt(e) {
  if (e < Ue) {
    const n = new Uint8Array(2);
    return new DataView(n.buffer).setUint16(0, e, !1), n;
  }
  const t = new Uint8Array(6);
  return new DataView(t.buffer).setUint32(2, e, !1), t;
}
function Ot(e) {
  const t = e.length;
  if (t < fe || t > ue)
    throw new Error(`NIP-44 plaintext length must be between ${fe} and ${ue} bytes on this platform.`);
  const n = xt(t), r = me(t), s = new Uint8Array(n.length + r);
  return s.set(n, 0), s.set(e, n.length), s;
}
function Lt(e) {
  const t = new DataView(e.buffer, e.byteOffset, e.byteLength), n = t.getUint16(0, !1);
  let r, s;
  if (n === 0) {
    if (r = t.getUint32(2, !1), s = 6, r < Ue)
      throw new Error("NIP-44 payload has inconsistent padding.");
  } else
    r = n, s = 2;
  if (r < fe || r > _t || e.length !== s + me(r))
    throw new Error("NIP-44 payload has inconsistent padding.");
  return e.slice(s, s + r);
}
function Be(e, t, n) {
  return it(at, e, be(t, n));
}
function kt(e, t) {
  return Pt(e, t, nt(32));
}
function Pt(e, t, n) {
  if (n.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const { chachaKey: r, chachaNonce: s, hmacKey: o } = je(e, n), i = Ot(ie(t)), c = Ce(r, s, i), l = Be(o, n, c);
  return Te.encode(be(new Uint8Array([Ke]), n, c, l));
}
function Dt(e, t) {
  if (t.startsWith("#"))
    throw new Error("Unsupported NIP-44 non-base64 encoding.");
  if (t.length < Nt || t.length > St)
    throw new Error("NIP-44 payload size is outside this platform's supported range.");
  const n = Te.decode(t);
  if (n.length < It || n.length > $e)
    throw new Error("NIP-44 decoded payload size is outside this platform's supported range.");
  if (n[0] !== Ke)
    throw new Error(`Unsupported NIP-44 version: ${n[0]}`);
  const r = n.slice(1, 33);
  if (r.length !== 32)
    throw new Error("NIP-44 nonce must be exactly 32 bytes.");
  const s = n.slice(n.length - 32), o = n.slice(33, n.length - 32), { chachaKey: i, chachaNonce: c, hmacKey: l } = je(e, r), d = Be(l, r, o);
  if (!rt(s, d))
    throw new Error("NIP-44 MAC verification failed: payload is corrupted, tampered, or uses the wrong key.");
  const a = Ce(i, c, o);
  return st(Lt(a));
}
const Fe = 37304, de = {
  /** The most a save may hold, in bytes of UTF-8. It has to fit in one note that any relay will take. */
  dataBytes: 32768,
  /** No more saves than this for one world in `perMs`, and in an hour. Counted apart from notes and passes. */
  burst: 6,
  perMs: 6e4,
  hourly: 60,
  /** A save handed over to be opened is not read past this many characters of content. */
  contentChars: 7e4
}, Mt = /^[a-z0-9][a-z0-9-]{0,31}$/u, Tt = /^[0-9a-f]{64}$/u, Rt = "Something a world keeps for its visitor. Only they can read it.";
function B(e) {
  return typeof e == "string" && Mt.test(e) ? e : "";
}
function Ae(e) {
  return typeof e == "string" && e.length <= de.dataBytes && ie(e).length <= de.dataBytes;
}
function We(e, t, n) {
  const r = R(t), s = B(n);
  return !r || !s ? "" : ct(lt(e, ie(`nswp-save
${r}
${s}`)));
}
function sn(e) {
  const t = R(e.world), n = B(e.slot), r = We(e.conversationKey, t, n);
  if (!r || !Ae(e.data)) return null;
  const s = JSON.stringify({ v: 1, world: t, slot: n, data: e.data });
  return {
    kind: Fe,
    created_at: Math.floor(e.nowSeconds),
    tags: [
      ["d", r],
      ["alt", Rt]
    ],
    content: kt(e.conversationKey, s)
  };
}
function on(e, t) {
  const n = R(t.world);
  if (!n || !e || typeof e != "object" || !Tt.test(t.pubkey)) return null;
  const r = e;
  if (r.kind !== Fe || r.pubkey !== t.pubkey || typeof r.content != "string" || r.content.length > de.contentChars || !Array.isArray(r.tags)) return null;
  let s;
  try {
    s = JSON.parse(Dt(t.conversationKey, r.content));
  } catch {
    return null;
  }
  if (!s || typeof s != "object" || s.v !== 1 || s.world !== n) return null;
  const o = B(s.slot);
  if (!o || !Ae(s.data)) return null;
  const i = r.tags.find((c) => Array.isArray(c) && c[0] === "d");
  return !i || i[1] !== We(t.conversationKey, n, o) ? null : { slot: o, data: s.data, at: typeof r.created_at == "number" && Number.isInteger(r.created_at) ? r.created_at : 0 };
}
const he = 3, an = { burst: 6, perMs: 6e4, hourly: 60 }, re = {
  /** A list handed over to be changed is not read past this many tags, or this much content. */
  tags: 2e4,
  contentChars: 1e5,
  tagItems: 16,
  tagChars: 1e3
}, Ct = ["follows"];
function pe(e) {
  return Array.isArray(e) ? Ct.filter((t) => e.includes(t)) : [];
}
const Kt = ["nswp:world", "bitlogin:site"], Ut = /^[0-9a-f]{64}$/u;
function Le(e, t) {
  if (e && (e.kind !== he || !Array.isArray(e.tags)) || !e && !t.fromNothing) return null;
  const n = typeof t.add == "string" ? t.add.toLowerCase() : "", r = typeof t.remove == "string" ? t.remove.toLowerCase() : "";
  if (n === "" == (r === "")) return null;
  const s = n || r;
  if (!Ut.test(s) || n && (e?.pubkey ?? t.pubkey) === n) return null;
  const o = e ? e.tags.filter((a) => Array.isArray(a) && a.every((f) => typeof f == "string") && !Kt.includes(a[0] ?? "")) : [], i = (a) => a[0] === "p" && typeof a[1] == "string" && a[1].toLowerCase() === s, c = o.some(i);
  if (n ? c : !c) return null;
  const l = n ? [...o.map((a) => [...a]), ["p", n]] : o.filter((a) => !i(a)).map((a) => [...a]), d = Math.max(Math.floor(t.nowSeconds), e ? e.created_at + 1 : 0);
  return { kind: he, created_at: d, tags: l, content: typeof e?.content == "string" ? e.content : "" };
}
function jt(e, t) {
  if (!e || typeof e != "object") return null;
  const n = e;
  if (n.kind !== he || n.pubkey !== t || !Array.isArray(n.tags) || n.tags.length > re.tags || typeof n.content != "string" || n.content.length > re.contentChars) return null;
  for (const r of n.tags)
    if (!Array.isArray(r) || r.length > re.tagItems || !r.every((s) => typeof s == "string" && s.length <= re.tagChars)) return null;
  return ft(e) ? e : null;
}
function cn(e) {
  const t = { add: e.add, remove: e.remove, nowSeconds: e.nowSeconds, pubkey: e.pubkey };
  if (e.list === null || e.list === void 0) return e.seen ? null : Le(null, { ...t, fromNothing: !0 });
  const n = jt(e.list, e.pubkey);
  return !n || e.seen && n.created_at < e.seen ? null : Le(n, t);
}
function ln(e, t) {
  return e === null ? t.answered > 0 && t.newestAt === 0 : e.created_at >= t.newestAt;
}
const Ve = "nswp-signer", Xe = "nswp-handoff", ae = 1, q = {
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
}, $t = [1, 7], Bt = [4, 13, 14, 15, 1059, 1060, 13194, 22242, 23194, 23195, 24133, 27235, 27300, 27301, 30078];
function Ft(e) {
  return typeof e != "number" || !Number.isInteger(e) || e < 0 || e > 65535 || Bt.includes(e) ? "never" : $t.includes(e) ? "ordinary" : "careful";
}
const ke = "nswp:world";
function R(e) {
  if (typeof e != "string" || e.length > 300) return "";
  try {
    const t = new URL(e);
    return (t.protocol === "https:" || t.protocol === "http:") && t.origin !== "null" ? t.origin : "";
  } catch {
    return "";
  }
}
function ye(e) {
  if (typeof e != "string") return "";
  let t = "";
  for (const n of e.slice(0, 400).normalize("NFC")) {
    const r = n.codePointAt(0), s = r <= 31 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8239 || r >= 8288 && r <= 8303 || r === 65279;
    t += s ? " " : n;
  }
  return [...t.replace(/\s+/gu, " ").trim()].slice(0, 48).join("").trim();
}
function fn(e, t, n) {
  const r = R(t);
  if (!r || !e || typeof e != "object") return null;
  const s = e;
  if (Ft(s.kind) !== "ordinary" || typeof s.content != "string" || [...s.content].length > q.contentChars || !Array.isArray(s.tags) || s.tags.length > q.tags) return null;
  const o = [];
  for (const i of s.tags) {
    if (!Array.isArray(i) || i.length === 0 || i.length > q.tagItems || !i.every((c) => typeof c == "string" && c.length <= q.tagChars)) return null;
    i[0] !== ke && o.push([...i]);
  }
  return o.push([ke, r]), { kind: s.kind, created_at: Math.floor(n), tags: o, content: s.content };
}
function un(e = q, t = []) {
  let n = t.filter((r) => typeof r == "number" && Number.isFinite(r));
  return {
    times: () => [...n],
    take(r) {
      return n = n.filter((s) => r - s < 36e5), n.length >= e.hourly || n.filter((s) => r - s < e.perMs).length >= e.burst ? !1 : (n.push(r), !0);
    }
  };
}
const He = /^[0-9a-z-]{1,40}$/iu, J = /^[0-9a-f]{64}$/u, dn = (e) => ({ nswp: Ve, v: ae, ...e });
function hn(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.nswp !== Ve || t.v !== ae || typeof t.id != "string" || !He.test(t.id)) return null;
  if (t.t === "state") return { t: "state", id: t.id };
  if (t.t === "lock") return { t: "lock", id: t.id };
  if (t.t === "sign" && t.event && typeof t.event == "object") return { t: "sign", id: t.id, event: t.event };
  if (t.t === "pass" && typeof t.session == "string" && J.test(t.session)) return { t: "pass", id: t.id, session: t.session };
  if (t.t === "save" && B(t.slot) && Ae(t.data)) return { t: "save", id: t.id, slot: B(t.slot), data: t.data };
  if (t.t === "find" && B(t.slot)) return { t: "find", id: t.id, slot: B(t.slot) };
  if (t.t === "open" && t.event && typeof t.event == "object") return { t: "open", id: t.id, event: t.event };
  if (t.t === "want" && t.permissions === void 0 && Array.isArray(t.more)) return { t: "wantMore", id: t.id, more: pe(t.more) };
  if (t.t === "follow" && (t.list === null || t.list && typeof t.list == "object")) {
    const n = typeof t.add == "string" && J.test(t.add), r = typeof t.remove == "string" && J.test(t.remove);
    return n === r ? null : { t: "follow", id: t.id, list: t.list, ...n ? { add: t.add } : { remove: t.remove } };
  }
  if (t.t === "want") {
    const n = Je(t.permissions);
    return n ? { t: "want", id: t.id, permissions: n } : null;
  }
  return (t.t === "encrypt" || t.t === "decrypt") && typeof t.peer == "string" && J.test(t.peer) && typeof t.text == "string" && t.text.length <= 2e5 ? { t: t.t, id: t.id, peer: t.peer, text: t.text, scheme: t.scheme === "nip04" ? "nip04" : "nip44" } : t.t === "read" && t.event && typeof t.event == "object" ? { t: "read", id: t.id, event: t.event } : null;
}
const pn = (e) => ({ nswp: Xe, v: ae, ...e });
function yn(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  if (t.nswp !== Xe || t.v !== ae || typeof t.nonce != "string" || !He.test(t.nonce)) return null;
  const n = (r) => typeof r == "string" && J.test(r);
  if (t.t === "hello") return { t: "hello", nonce: t.nonce };
  if (t.t === "frame" && R(t.world) && n(t.recipient)) {
    const r = t.wants === void 0 ? void 0 : Je(t.wants);
    return r === null ? null : { t: "frame", nonce: t.nonce, world: R(t.world), recipient: t.recipient, ...r ? { wants: r } : {}, ...t.turnedDown === !0 ? { turnedDown: !0 } : {}, ...!r && pe(t.more).length ? { more: pe(t.more) } : {} };
  }
  if (t.t === "grant" && R(t.world) && t.sealed && typeof t.sealed == "object") {
    const r = t.sealed;
    if (!n(r.senderPublicKey) || typeof r.payload != "string" || r.payload.length > 12e3) return null;
    const s = ye(t.name);
    return { t: "grant", nonce: t.nonce, world: R(t.world), sealed: { senderPublicKey: r.senderPublicKey, payload: r.payload }, ...s ? { name: s } : {} };
  }
  return t.t === "done" && typeof t.ok == "boolean" ? { t: "done", nonce: t.nonce, ok: t.ok } : null;
}
const W = { kinds: 64, prefixes: 8, origins: 8, peers: 8, prefixChars: 64 }, H = 30078, Z = 27235, ze = 24242, Ee = 22242, Ge = 13, Wt = 37304, ge = "bitlogin:", Ye = [13194, 23194, 23195, 24133, 27301, 37304], Q = {
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
}, te = [27300, 27302, 27303], Vt = 27303;
function gn(e) {
  return Object.hasOwn(Q, e) ? Q[e].name : null;
}
function Pe(e) {
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
function Xt(e, t) {
  return Object.hasOwn(Q, e) ? Q[e].reserved ?? [] : Pe(t) && Pe(e) ? te : [];
}
const Ht = () => {
  try {
    return globalThis.location?.origin ?? "";
  } catch {
    return "";
  }
}, ve = (e) => Xt(e, Ht()), wn = (e) => !Object.hasOwn(Q, e) && ve(e).length > 0;
function bn(e, t) {
  const n = ve(e);
  return [...t.sign, ...t.read].every((r) => !te.includes(r) || n.includes(r));
}
const qe = [0, 3, 5, 1e4, 10002, 10050, Ee], zt = [...qe, ze, ...te], Gt = [4, Ge, 1059], Yt = [Z, ze, Ee], ee = /^[0-9a-f]{64}$/u, oe = (e) => typeof e == "number" && Number.isInteger(e) && e >= 0 && e <= 65535, Y = (e) => [...new Set(e)];
function Je(e) {
  if (!e || typeof e != "object" || Array.isArray(e)) return null;
  const t = e, n = (a) => a === void 0 ? [] : Array.isArray(a) ? a : null, r = n(t.sign), s = n(t.appData), o = n(t.proofs), i = n(t.read), c = n(t.peers);
  if (!r || !s || !o || !i || !c || r.length > W.kinds || i.length > W.kinds || s.length > W.prefixes || o.length > W.origins || c.length > W.peers || !r.every(oe) || !i.every(oe) || r.some((a) => Ye.includes(a)) || i.includes(Wt) || r.length === 0 && i.length === 0 && c.length === 0) return null;
  for (const a of s)
    if (typeof a != "string" || a.length === 0 || a.length > W.prefixChars || a !== "*" && (a.startsWith(ge) || ge.startsWith(a)) || ye(a) !== a) return null;
  if ((r.includes(H) || i.includes(H)) !== s.length > 0) return null;
  const l = [];
  for (const a of o) {
    const f = R(a);
    if (!f || f !== a || !f.startsWith("https://")) return null;
    l.push(f);
  }
  if (l.length > 0 && !r.includes(Z) || !c.every((a) => typeof a == "string" && ee.test(a))) return null;
  const d = ye(t.name);
  return {
    ...d ? { name: d } : {},
    sign: Y(r).sort((a, f) => a - f),
    appData: Y(s),
    proofs: Y(l),
    read: Y(i).sort((a, f) => a - f),
    peers: Y(c)
  };
}
const mn = {
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
}, we = (e) => e >= 3e4 && e < 4e4;
function An(e) {
  return qe.includes(e) && e !== Ee || te.includes(e) ? "sensitive" : Yt.includes(e) || we(e) ? "quiet" : "public";
}
const De = "bitlogin:site", _e = (e, t) => e.filter((n) => n[0] === t && typeof n[1] == "string").map((n) => n[1]);
function Ze(e, t) {
  const n = _e(t, "d")[0];
  return n === void 0 || n.startsWith(ge) ? !1 : e.appData.some((r) => r === "*" || n.startsWith(r));
}
function qt(e, t, n) {
  const r = _e(n, "u");
  return r.length === 0 ? !1 : r.every((s) => {
    const o = R(s);
    return o !== "" && (o === t || e.proofs.includes(o));
  });
}
function En(e, t, n, r) {
  const s = R(n);
  if (!s || !t || typeof t != "object") return null;
  const o = t;
  if (!oe(o.kind) || Ye.includes(o.kind) || !e.sign.includes(o.kind) || te.includes(o.kind) && !ve(s).includes(o.kind) || typeof o.content != "string" || o.content.length > V.contentChars || !Array.isArray(o.tags) || o.tags.length > (o.kind === 3 ? V.followTags : V.tags)) return null;
  const i = [];
  for (const a of o.tags) {
    if (!Array.isArray(a) || a.length === 0 || a.length > V.tagItems || !a.every((f) => typeof f == "string" && f.length <= V.tagChars)) return null;
    if (a[0] !== De) {
      if (a[0] === "nswp:world") {
        if (o.kind !== Vt) continue;
        if (a.length !== 2 || R(a[1]) !== a[1] || i.some((f) => f[0] === "nswp:world")) return null;
      }
      i.push([...a]);
    }
  }
  if (o.kind === H && !Ze(e, i) || o.kind === Z && !qt(e, s, i)) return null;
  if (o.kind === Ge) {
    if (i.length > 0) return null;
  } else
    i.push([De, s]);
  const c = Math.floor(r), l = typeof o.created_at == "number" && Number.isInteger(o.created_at) ? o.created_at : c, d = Math.abs(l - c) <= V.clockSlackSec ? l : c;
  return { kind: o.kind, created_at: d, tags: i, content: o.content };
}
function vn(e, t, n) {
  return typeof n == "string" && ee.test(n) && (n === t || e.peers.includes(n));
}
function _n(e, t) {
  return typeof t == "string" && ee.test(t) && e.peers.includes(t);
}
function Jt(e, t, n) {
  if (!oe(n.kind) || !e.read.includes(n.kind) || typeof n.pubkey != "string" || !ee.test(n.pubkey) || !Array.isArray(n.tags)) return null;
  const r = n.tags.filter((o) => Array.isArray(o) && o.every((i) => typeof i == "string"));
  if (n.kind === H && !Ze(e, r)) return null;
  if (n.pubkey !== t) return n.pubkey;
  const s = _e(r, "p")[0];
  return s !== void 0 && ee.test(s) ? s : t;
}
function Nn(e, t, n) {
  const r = Jt(e, t, n);
  return r ? n.pubkey === t && r !== t ? [r, t] : [r] : [];
}
const Zt = {
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
}, Qt = {
  4: "read your private messages (older kind)",
  13: "read your private messages",
  1059: "read your private messages",
  1573: "read orders sent to you",
  7375: "read the money in your Cashu wallet",
  7376: "read what your Cashu wallet spent",
  1e4: "read who you have muted",
  3e4: "read your private lists"
}, Me = (e) => {
  try {
    return new URL(e).host;
  } catch {
    return e;
  }
};
function In(e, t) {
  const n = [], r = [], s = [], o = (i, c) => {
    i.includes(c) || i.push(c);
  };
  e.sign.includes(Z) && o(n, `prove who you are to ${[Me(t), ...e.proofs.map(Me)].join(", ")}`);
  for (const i of e.sign) {
    if (i === Z) continue;
    if (i === H) {
      e.appData.includes("*") ? o(r, "save application data under any name, including other applications' data") : o(n, `save its own data (${e.appData.join(", ")})`);
      continue;
    }
    const c = Zt[i];
    if (!c) {
      we(i) ? o(n, `save its own kind of data (kind ${i})`) : s.push(i);
      continue;
    }
    o(zt.includes(i) ? r : n, c);
  }
  s.length > 0 && o(n, `sign kinds BitLogin has no words for: ${s.join(", ")}`);
  for (const i of e.read) {
    if (i === H) {
      e.appData.includes("*") ? o(r, "read application data saved under any name") : o(n, "read its own saved data");
      continue;
    }
    const c = Qt[i];
    c ? o(Gt.includes(i) || i === 7375 ? r : n, c) : o(n, we(i) ? `read its own kind of data (kind ${i})` : `read what is encrypted in kind ${i}`);
  }
  return e.peers.length > 0 && o(n, `exchange encrypted messages with ${e.peers.length === 1 ? "one service" : `${e.peers.length} services`} it names (${e.peers.map((i) => `${i.slice(0, 8)}…`).join(", ")})`), { ordinary: n, sensitive: r };
}
export {
  mn as A,
  Se as B,
  T as C,
  ye as D,
  pe as E,
  Ft as F,
  Nn as G,
  _n as H,
  vn as I,
  jt as J,
  he as K,
  ln as L,
  Gt as M,
  cn as N,
  on as O,
  ae as P,
  We as Q,
  te as R,
  Ve as S,
  sn as T,
  de as U,
  an as V,
  un as a,
  q as b,
  R as c,
  hn as d,
  fn as e,
  yn as f,
  wn as g,
  pn as h,
  In as i,
  rn as j,
  gn as k,
  An as l,
  bn as m,
  Dt as n,
  kt as o,
  En as p,
  X as q,
  Je as r,
  dn as s,
  se as t,
  xe as u,
  U as v,
  nn as w,
  $ as x,
  gt as y,
  tn as z
};
