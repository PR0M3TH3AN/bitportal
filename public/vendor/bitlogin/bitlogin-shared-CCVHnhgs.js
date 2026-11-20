const L = "nswp-signer", K = "nswp-handoff", ne = 1, y = {
  /** The longest a note's content may be, in characters. */
  contentChars: 8e3,
  tags: 60,
  tagItems: 8,
  tagChars: 400,
  /** How long a remembered site BitLogin knows stays allowed, in seconds: thirty days from Allow, unless the user signs out of it sooner. */
  grantSec: 2592e3,
  /** The same for a site BitLogin does not know: seven days (§SW11). */
  unknownGrantSec: 604800,
  /** How long a site that is not remembered stays allowed while its page stays open, in seconds (§SW11). */
  visitSec: 43200,
  /** No more than this many signatures for one site in `perMs`. The same numbers as NSWP's own (kit 0.28.0). */
  burst: 3,
  perMs: 6e4,
  /** And no more than this many in an hour. */
  hourly: 20,
  /** Room passes are counted apart from notes (§SW16), so signing in does not use up a post: this many in `perMs`. */
  passBurst: 2,
  /** And this many in an hour. */
  passHourly: 10
}, B = [1, 7], G = [4, 13, 14, 15, 1059, 1060, 13194, 22242, 23194, 23195, 24133, 27235, 27300, 27301, 30078];
function H(t) {
  return typeof t != "number" || !Number.isInteger(t) || t < 0 || t > 65535 || G.includes(t) ? "never" : B.includes(t) ? "ordinary" : "careful";
}
const D = "nswp:world";
function c(t) {
  if (typeof t != "string" || t.length > 300) return "";
  try {
    const e = new URL(t);
    return (e.protocol === "https:" || e.protocol === "http:") && e.origin !== "null" ? e.origin : "";
  } catch {
    return "";
  }
}
function A(t) {
  if (typeof t != "string") return "";
  let e = "";
  for (const r of t.slice(0, 400).normalize("NFC")) {
    const n = r.codePointAt(0), i = n <= 31 || n >= 127 && n <= 159 || n >= 8203 && n <= 8207 || n >= 8232 && n <= 8239 || n >= 8288 && n <= 8303 || n === 65279;
    e += i ? " " : r;
  }
  return [...e.replace(/\s+/gu, " ").trim()].slice(0, 48).join("").trim();
}
function re(t, e, r) {
  const n = c(e);
  if (!n || !t || typeof t != "object") return null;
  const i = t;
  if (H(i.kind) !== "ordinary" || typeof i.content != "string" || [...i.content].length > y.contentChars || !Array.isArray(i.tags) || i.tags.length > y.tags) return null;
  const s = [];
  for (const o of i.tags) {
    if (!Array.isArray(o) || o.length === 0 || o.length > y.tagItems || !o.every((l) => typeof l == "string" && l.length <= y.tagChars)) return null;
    o[0] !== D && s.push([...o]);
  }
  return s.push([D, n]), { kind: i.kind, created_at: Math.floor(r), tags: s, content: i.content };
}
function se(t = y, e = []) {
  let r = e.filter((n) => typeof n == "number" && Number.isFinite(n));
  return {
    times: () => [...r],
    take(n) {
      return r = r.filter((i) => n - i < 36e5), r.length >= t.hourly || r.filter((i) => n - i < t.perMs).length >= t.burst ? !1 : (r.push(n), !0);
    }
  };
}
const F = /^[0-9a-z-]{1,40}$/iu, S = /^[0-9a-f]{64}$/u, oe = (t) => ({ nswp: L, v: 1, ...t });
function ie(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.nswp !== L || e.v !== 1 || typeof e.id != "string" || !F.test(e.id)) return null;
  if (e.t === "state") return { t: "state", id: e.id };
  if (e.t === "lock") return { t: "lock", id: e.id };
  if (e.t === "sign" && e.event && typeof e.event == "object") return { t: "sign", id: e.id, event: e.event };
  if (e.t === "pass" && typeof e.session == "string" && S.test(e.session)) return { t: "pass", id: e.id, session: e.session };
  if (e.t === "want") {
    const r = W(e.permissions);
    return r ? { t: "want", id: e.id, permissions: r } : null;
  }
  return (e.t === "encrypt" || e.t === "decrypt") && typeof e.peer == "string" && S.test(e.peer) && typeof e.text == "string" && e.text.length <= 2e5 ? { t: e.t, id: e.id, peer: e.peer, text: e.text, scheme: e.scheme === "nip04" ? "nip04" : "nip44" } : e.t === "read" && e.event && typeof e.event == "object" ? { t: "read", id: e.id, event: e.event } : null;
}
const ae = (t) => ({ nswp: K, v: 1, ...t });
function le(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.nswp !== K || e.v !== 1 || typeof e.nonce != "string" || !F.test(e.nonce)) return null;
  const r = (n) => typeof n == "string" && S.test(n);
  if (e.t === "hello") return { t: "hello", nonce: e.nonce };
  if (e.t === "frame" && c(e.world) && r(e.recipient)) {
    const n = e.wants === void 0 ? void 0 : W(e.wants);
    return n === null ? null : { t: "frame", nonce: e.nonce, world: c(e.world), recipient: e.recipient, ...n ? { wants: n } : {}, ...e.turnedDown === !0 ? { turnedDown: !0 } : {} };
  }
  if (e.t === "grant" && c(e.world) && e.sealed && typeof e.sealed == "object") {
    const n = e.sealed;
    if (!r(n.senderPublicKey) || typeof n.payload != "string" || n.payload.length > 12e3) return null;
    const i = A(e.name);
    return { t: "grant", nonce: e.nonce, world: c(e.world), sealed: { senderPublicKey: n.senderPublicKey, payload: n.payload }, ...i ? { name: i } : {} };
  }
  return e.t === "done" && typeof e.ok == "boolean" ? { t: "done", nonce: e.nonce, ok: e.ok } : null;
}
const f = { kinds: 64, prefixes: 8, origins: 8, peers: 8, prefixChars: 64 }, p = 30078, w = 27235, M = 24242, R = 22242, j = 13, _ = "bitlogin:", $ = [13194, 23194, 23195, 24133, 27301], b = {
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
}, v = [27300, 27302, 27303], z = 27303;
function ue(t) {
  return Object.hasOwn(b, t) ? b[t].name : null;
}
function E(t) {
  if (typeof t != "string" || t.length > 300) return !1;
  let e;
  try {
    const s = new URL(t);
    if (s.protocol !== "https:" && s.protocol !== "http:") return !1;
    e = s.hostname.toLowerCase();
  } catch {
    return !1;
  }
  if (e === "localhost" || e.endsWith(".localhost") || e === "[::1]") return !0;
  const r = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/u.exec(e)?.slice(1).map(Number);
  if (!r || r.some((s) => s > 255)) return !1;
  const [n, i] = r;
  return n === 127 || n === 10 || n === 192 && i === 168 || n === 172 && i >= 16 && i <= 31;
}
function q(t, e) {
  return Object.hasOwn(b, t) ? b[t].reserved ?? [] : E(e) && E(t) ? v : [];
}
const U = () => {
  try {
    return globalThis.location?.origin ?? "";
  } catch {
    return "";
  }
}, N = (t) => q(t, U()), ce = (t) => !Object.hasOwn(b, t) && N(t).length > 0;
function de(t, e) {
  const r = N(t);
  return [...e.sign, ...e.read].every((n) => !v.includes(n) || r.includes(n));
}
const x = [0, 3, 5, 1e4, 10002, 10050, R], X = [...x, M, ...v], Y = [4, j, 1059], Z = [w, M, R], m = /^[0-9a-f]{64}$/u, k = (t) => typeof t == "number" && Number.isInteger(t) && t >= 0 && t <= 65535, h = (t) => [...new Set(t)];
function W(t) {
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const e = t, r = (a) => a === void 0 ? [] : Array.isArray(a) ? a : null, n = r(e.sign), i = r(e.appData), s = r(e.proofs), o = r(e.read), l = r(e.peers);
  if (!n || !i || !s || !o || !l || n.length > f.kinds || o.length > f.kinds || i.length > f.prefixes || s.length > f.origins || l.length > f.peers || !n.every(k) || !o.every(k) || n.some((a) => $.includes(a)) || n.length === 0 && o.length === 0 && l.length === 0) return null;
  for (const a of i)
    if (typeof a != "string" || a.length === 0 || a.length > f.prefixChars || a !== "*" && (a.startsWith(_) || _.startsWith(a)) || A(a) !== a) return null;
  if ((n.includes(p) || o.includes(p)) !== i.length > 0) return null;
  const d = [];
  for (const a of s) {
    const u = c(a);
    if (!u || u !== a || !u.startsWith("https://")) return null;
    d.push(u);
  }
  if (d.length > 0 && !n.includes(w) || !l.every((a) => typeof a == "string" && m.test(a))) return null;
  const O = A(e.name);
  return {
    ...O ? { name: O } : {},
    sign: h(n).sort((a, u) => a - u),
    appData: h(i),
    proofs: h(d),
    read: h(o).sort((a, u) => a - u),
    peers: h(l)
  };
}
const fe = {
  /** Proofs, and the application's own data: what applications sign on timers. */
  quiet: { burst: 300, perMs: 6e4, hourly: 6e3 },
  public: { burst: 60, perMs: 6e4, hourly: 1200 },
  sensitive: { burst: 30, perMs: 6e4, hourly: 300 },
  read: { burst: 600, perMs: 6e4, hourly: 12e3 }
}, g = { contentChars: 1e5, tags: 2500, tagItems: 16, tagChars: 1e3, clockSlackSec: 600 }, I = (t) => t >= 3e4 && t < 4e4;
function pe(t) {
  return x.includes(t) && t !== R || v.includes(t) ? "sensitive" : Z.includes(t) || I(t) ? "quiet" : "public";
}
const C = "bitlogin:site", P = (t, e) => t.filter((r) => r[0] === e && typeof r[1] == "string").map((r) => r[1]);
function V(t, e) {
  const r = P(e, "d")[0];
  return r === void 0 || r.startsWith(_) ? !1 : t.appData.some((n) => n === "*" || r.startsWith(n));
}
function J(t, e, r) {
  const n = P(r, "u");
  return n.length === 0 ? !1 : n.every((i) => {
    const s = c(i);
    return s !== "" && (s === e || t.proofs.includes(s));
  });
}
function he(t, e, r, n) {
  const i = c(r);
  if (!i || !e || typeof e != "object") return null;
  const s = e;
  if (!k(s.kind) || $.includes(s.kind) || !t.sign.includes(s.kind) || v.includes(s.kind) && !N(i).includes(s.kind) || typeof s.content != "string" || s.content.length > g.contentChars || !Array.isArray(s.tags) || s.tags.length > g.tags) return null;
  const o = [];
  for (const a of s.tags) {
    if (!Array.isArray(a) || a.length === 0 || a.length > g.tagItems || !a.every((u) => typeof u == "string" && u.length <= g.tagChars)) return null;
    if (a[0] !== C) {
      if (a[0] === "nswp:world") {
        if (s.kind !== z) continue;
        if (a.length !== 2 || c(a[1]) !== a[1] || o.some((u) => u[0] === "nswp:world")) return null;
      }
      o.push([...a]);
    }
  }
  if (s.kind === p && !V(t, o) || s.kind === w && !J(t, i, o)) return null;
  if (s.kind === j) {
    if (o.length > 0) return null;
  } else
    o.push([C, i]);
  const l = Math.floor(n), d = typeof s.created_at == "number" && Number.isInteger(s.created_at) ? s.created_at : l, O = Math.abs(d - l) <= g.clockSlackSec ? d : l;
  return { kind: s.kind, created_at: O, tags: o, content: s.content };
}
function ge(t, e, r) {
  return typeof r == "string" && m.test(r) && (r === e || t.peers.includes(r));
}
function ye(t, e) {
  return typeof e == "string" && m.test(e) && t.peers.includes(e);
}
function Q(t, e, r) {
  if (!k(r.kind) || !t.read.includes(r.kind) || typeof r.pubkey != "string" || !m.test(r.pubkey) || !Array.isArray(r.tags)) return null;
  const n = r.tags.filter((s) => Array.isArray(s) && s.every((o) => typeof o == "string"));
  if (r.kind === p && !V(t, n)) return null;
  if (r.pubkey !== e) return r.pubkey;
  const i = P(n, "p")[0];
  return i !== void 0 && m.test(i) ? i : e;
}
function we(t, e, r) {
  const n = Q(t, e, r);
  return n ? r.pubkey === e && n !== e ? [n, e] : [n] : [];
}
const ee = {
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
  37300: "announce a world as yours"
}, te = {
  4: "read your private messages (older kind)",
  13: "read your private messages",
  1059: "read your private messages",
  1573: "read orders sent to you",
  7375: "read the money in your Cashu wallet",
  7376: "read what your Cashu wallet spent",
  1e4: "read who you have muted",
  3e4: "read your private lists"
}, T = (t) => {
  try {
    return new URL(t).host;
  } catch {
    return t;
  }
};
function be(t, e) {
  const r = [], n = [], i = [], s = (o, l) => {
    o.includes(l) || o.push(l);
  };
  t.sign.includes(w) && s(r, `prove who you are to ${[T(e), ...t.proofs.map(T)].join(", ")}`);
  for (const o of t.sign) {
    if (o === w) continue;
    if (o === p) {
      t.appData.includes("*") ? s(n, "save application data under any name, including other applications' data") : s(r, `save its own data (${t.appData.join(", ")})`);
      continue;
    }
    const l = ee[o];
    if (!l) {
      I(o) ? s(r, `save its own kind of data (kind ${o})`) : i.push(o);
      continue;
    }
    s(X.includes(o) ? n : r, l);
  }
  i.length > 0 && s(r, `sign kinds BitLogin has no words for: ${i.join(", ")}`);
  for (const o of t.read) {
    if (o === p) {
      t.appData.includes("*") ? s(n, "read application data saved under any name") : s(r, "read its own saved data");
      continue;
    }
    const l = te[o];
    l ? s(Y.includes(o) || o === 7375 ? n : r, l) : s(r, I(o) ? `read its own kind of data (kind ${o})` : `read what is encrypted in kind ${o}`);
  }
  return t.peers.length > 0 && s(r, `exchange encrypted messages with ${t.peers.length === 1 ? "one service" : `${t.peers.length} services`} it names (${t.peers.map((o) => `${o.slice(0, 8)}…`).join(", ")})`), { ordinary: r, sensitive: n };
}
export {
  fe as A,
  Y as M,
  ne as P,
  v as R,
  L as S,
  se as a,
  y as b,
  c,
  ie as d,
  re as e,
  le as f,
  ce as g,
  ae as h,
  be as i,
  A as j,
  ue as k,
  pe as l,
  de as m,
  H as n,
  we as o,
  he as p,
  ye as q,
  W as r,
  oe as s,
  ge as t
};
