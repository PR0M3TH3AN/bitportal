import { v as _ } from "./bitlogin-shared-CvPtgHf2.js";
const et = 17375, nt = 7375, rt = 7376, S = "sat", N = {
  mints: 5,
  proofsPerToken: 500,
  tokens: 500,
  /**
   * How many proofs this wallet writes into one token record. Kept small so that a record is well under the
   * 64 KB an ordinary NIP-44 message may hold, and under what relays take: another NIP-60 wallet can read it.
   */
  proofsWritten: 100
}, E = /^[0-9a-f]+$/u, j = /^[0-9a-f]{64}$/u;
function y(t) {
  if (typeof t != "string" || t.length > 200) return "";
  let n;
  try {
    n = new URL(t.trim());
  } catch {
    return "";
  }
  const e = n.hostname === "localhost" || n.hostname === "127.0.0.1";
  return n.protocol !== "https:" && !(n.protocol === "http:" && e) || n.username || n.password || n.search || n.hash ? "" : `${n.origin}${n.pathname.replace(/\/+$/u, "")}`;
}
function W(t) {
  if (!t || typeof t != "object") return null;
  const n = t;
  return typeof n.id != "string" || n.id.length < 2 || n.id.length > 66 || !E.test(n.id) || typeof n.amount != "number" || !Number.isSafeInteger(n.amount) || n.amount <= 0 || typeof n.secret != "string" || n.secret.length === 0 || n.secret.length > 2048 || typeof n.C != "string" || n.C.length !== 66 || !E.test(n.C) ? null : { id: n.id, amount: n.amount, secret: n.secret, C: n.C };
}
function F(t, n = N.proofsPerToken) {
  if (!Array.isArray(t) || t.length > n) return null;
  const e = [], r = /* @__PURE__ */ new Set();
  for (const s of t) {
    const o = W(s);
    if (!o || r.has(o.secret)) return null;
    r.add(o.secret), e.push(o);
  }
  return e;
}
const st = (t) => t.reduce((n, e) => n + e.amount, 0);
function ot(t) {
  return JSON.stringify([["privkey", t.privkey], ...t.mints.map((n) => ["mint", n])]);
}
function it(t) {
  let n;
  try {
    n = JSON.parse(t);
  } catch {
    return null;
  }
  if (!Array.isArray(n)) return null;
  let e = "";
  const r = [];
  for (const s of n)
    !Array.isArray(s) || typeof s[0] != "string" || (s[0] === "privkey" && typeof s[1] == "string" && j.test(s[1]) && (e ||= s[1]), s[0] === "mint" && y(s[1]) && !r.includes(y(s[1])) && r.length < N.mints && r.push(y(s[1])));
  return e ? { privkey: e, mints: r } : null;
}
function ct(t) {
  return JSON.stringify({ mint: t.mint, unit: S, proofs: t.proofs.map(({ id: n, amount: e, secret: r, C: s }) => ({ id: n, amount: e, secret: r, C: s })), ...t.del?.length ? { del: [...t.del] } : {} });
}
function at(t) {
  let n;
  try {
    n = JSON.parse(t);
  } catch {
    return null;
  }
  if (!n || typeof n != "object" || Array.isArray(n)) return null;
  const e = n, r = y(e.mint), s = F(e.proofs);
  if (!r || !s || e.unit !== void 0 && e.unit !== S) return null;
  const o = Array.isArray(e.del) ? e.del.filter((i) => typeof i == "string" && j.test(i)).slice(0, 200) : [];
  return { mint: r, proofs: s, del: o };
}
function lt(t, n) {
  const e = new Set(t.flatMap((o) => o.del)), r = /* @__PURE__ */ new Set(), s = [];
  for (const o of [...t].sort((i, l) => l.created_at - i.created_at || i.event.localeCompare(l.event))) {
    if (e.has(o.event) || n.has(o.event)) continue;
    const i = o.proofs.filter((l) => !r.has(l.secret));
    for (const l of i) r.add(l.secret);
    i.length && s.length < N.tokens && s.push({ event: o.event, mint: o.mint, proofs: i });
  }
  return s;
}
function ut(t) {
  return JSON.stringify([
    ["direction", t.direction],
    ["amount", String(t.amount)],
    ["unit", S],
    ...(t.created ?? []).map((n) => ["e", n, "", "created"]),
    ...(t.destroyed ?? []).map((n) => ["e", n, "", "destroyed"])
  ]);
}
const ft = (t) => {
  if (typeof t != "string") return "";
  const n = t.trim().toLowerCase().replace(/^lightning:/u, "");
  return n.length <= 2e3 && /^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(n) ? n : "";
};
class m extends Error {
  constructor(n, e) {
    super(e), this.code = n, this.name = "TipError";
  }
}
const O = { min: 1, max: 1e6 }, K = (t) => typeof t == "number" && Number.isSafeInteger(t) && t >= O.min && t <= O.max ? t : 0, P = { default: 1e3, steps: [1e3, 1e4, 1e5, 0] }, pt = (t) => P.steps.includes(t) ? t : P.default, dt = (t, n) => n !== 0 && t > n;
function D(t) {
  if (typeof t != "string") return null;
  const n = t.trim().toLowerCase(), e = n.lastIndexOf("1");
  if (e < 4) return null;
  const r = /^ln(?:bcrt|tbs|bc|tb)([1-9][0-9]{0,11})([munp]?)$/u.exec(n.slice(0, e));
  if (!r) return null;
  const s = { "": 100000000000n, m: 100000000n, u: 100000n, n: 100n }, o = r[2] === "p" ? BigInt(r[1]) % 10n === 0n ? BigInt(r[1]) / 10n : -1n : BigInt(r[1]) * s[r[2]];
  if (o <= 0n || o % 1000n !== 0n) return null;
  const i = o / 1000n;
  return i <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(i) : null;
}
const k = /^(?:localhost|127\.0\.0\.1)(?::[0-9]{1,5})?$/u, B = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/u;
function v(t, n = {}) {
  if (typeof t != "string" || t.length > 200) return "";
  const e = t.trim().toLowerCase(), r = e.lastIndexOf("@");
  if (r < 1) return "";
  const s = e.slice(0, r), o = e.slice(r + 1);
  return /^[a-z0-9._+-]{1,64}$/u.test(s) && (B.test(o) || n.local && k.test(o)) ? e : "";
}
function mt(t, n = {}) {
  try {
    const e = typeof t == "string" ? JSON.parse(t) : null;
    return e && typeof e == "object" ? v(e.lud16, n) : "";
  } catch {
    return "";
  }
}
const G = 8e3;
async function b(t, n) {
  const e = new AbortController(), r = setTimeout(() => e.abort(), G);
  try {
    const s = await t(n, { method: "GET", credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", headers: { accept: "application/json" }, signal: e.signal });
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
const R = (t, n) => {
  try {
    const e = new URL(String(t));
    return typeof t != "string" || t.length > 2e3 || e.username || e.password ? null : e.protocol === "https:" || n && e.protocol === "http:" && k.test(e.host) ? e : null;
  } catch {
    return null;
  }
};
async function ht(t, n = {}) {
  const e = R(t, n.local === !0);
  if (!e || e.origin !== t) return { tip: "", publishers: [] };
  const r = await b(n.fetch ?? ((o, i) => fetch(o, i)), `${e.origin}/.well-known/nswp.json`), s = r?.publishers && typeof r.publishers == "object" && !Array.isArray(r.publishers) ? Object.keys(r.publishers) : [];
  return { tip: v(r?.tip, n), publishers: s.filter((o) => /^[0-9a-f]{64}$/u.test(o)).slice(0, 16) };
}
async function yt(t, n, e = {}) {
  const r = e.local === !0, s = v(t, { local: r }), o = K(n);
  if (!s || !o) throw new m("no-address", "That is not a lightning address and an amount.");
  const i = e.fetch ?? ((U, M) => fetch(U, M)), [l, f] = [s.slice(0, s.lastIndexOf("@")), s.slice(s.lastIndexOf("@") + 1)], p = r && k.test(f) ? "http" : "https", c = await b(i, `${p}://${f}/.well-known/lnurlp/${encodeURIComponent(l)}`);
  if (!c) throw new m("unreachable", "That lightning address didn't answer. Nothing was spent.");
  const d = R(c.callback, r);
  if (c.tag !== "payRequest" || !d) throw new m("unreachable", "That lightning address didn't answer as one. Nothing was spent.");
  const a = o * 1e3, [T, $] = [Number(c.minSendable), Number(c.maxSendable)];
  if (!(Number.isFinite(T) && Number.isFinite($) && T <= a && a <= $))
    throw new m("refused-amount", "That lightning address doesn't take a payment of this size. Nothing was spent.");
  d.searchParams.set("amount", String(a));
  const x = typeof c.commentAllowed == "number" && Number.isSafeInteger(c.commentAllowed) ? Math.min(c.commentAllowed, 280) : 0, g = x >= 8 ? w(e.note).slice(0, x) : "";
  g && d.searchParams.set("comment", g);
  const C = await b(i, d.href), h = typeof C?.pr == "string" ? C.pr.trim().toLowerCase() : "";
  if (!h || h.length > 2e3 || !/^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(h)) throw new m("unreachable", "That lightning address gave no invoice. Nothing was spent.");
  if (D(h) !== o) throw new m("wrong-invoice", "That lightning address answered with an invoice for a different amount. Nothing was spent.");
  return { invoice: h, note: g };
}
function w(t) {
  return typeof t == "string" ? Array.from(t.normalize("NFC")).filter((n) => {
    const e = n.codePointAt(0);
    return e >= 32 && e !== 127 && !(e >= 8203 && e <= 8207) && !(e >= 8234 && e <= 8238) && !(e >= 8294 && e <= 8297);
  }).join("").trim().slice(0, 280) : "";
}
function gt(t, n) {
  let e = "";
  try {
    e = new URL(n).host;
  } catch {
    e = "";
  }
  const r = w(t).slice(0, 60);
  return w(`${r ? `A tip from ${r}` : "A tip"}${e ? `, in ${e}` : ""}`);
}
const A = /^[0-9a-f]{64}$/u, X = 30078, V = 30078, q = "bitunlock:entitlement:v1:", z = "seller-unlock-service-v1", H = [{ endpoint: "https://api.bitunlock.network", pubkey: "66be61cf5b8d286391f7b1a72ffa7c799ec2dc49eff0830c40df1cc964e6787d" }], Y = /^(?:localhost|127(?:\.[0-9]{1,3}){3}|10(?:\.[0-9]{1,3}){3}|192\.168(?:\.[0-9]{1,3}){2}|172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})$/u;
function bt(t) {
  if (typeof t != "string" || t.length > 300) return null;
  const [n, e] = t.split("|");
  try {
    const r = new URL(n ?? "");
    return r.protocol !== "http:" && r.protocol !== "https:" || !Y.test(r.hostname) || r.origin !== n ? null : e && A.test(e) ? { endpoint: r.origin, pubkey: e } : null;
  } catch {
    return null;
  }
}
function J(t) {
  return typeof t == "string" && /^30078:[0-9a-f]{64}:[^:\r\n][^\r\n]{0,255}$/u.test(t) ? t : "";
}
const I = (t) => t.slice(6, 70), Q = 500, wt = (t) => t.nswp && t.priceSats < Q, u = (t, n) => {
  const e = t.tags.find((r) => r[0] === n);
  return typeof e?.[1] == "string" ? e[1] : "";
}, L = (t, n) => typeof t == "string" ? Array.from(t.normalize("NFC")).filter((e) => {
  const r = e.codePointAt(0);
  return r >= 32 && r !== 127 && !(r >= 8203 && r <= 8207) && !(r >= 8234 && r <= 8238) && !(r >= 8294 && r <= 8297);
}).join("").trim().slice(0, n) : "";
function At(t, n, e = H) {
  const r = J(n), s = t;
  if (!r || !s || typeof s != "object" || !Array.isArray(s.tags) || !_(s) || s.kind !== X || s.pubkey !== I(r) || `30078:${s.pubkey}:${u(s, "d")}` !== r || u(s, "status") !== "active" || u(s, "br:delivery") !== z) return null;
  const o = s.tags.find((c) => c[0] === "price"), i = o && o[2] === "SAT" && /^[1-9][0-9]{0,11}$/u.test(o[1] ?? "") ? Number(o[1]) : 0, l = e.find((c) => c.endpoint === u(s, "br:unlock-service") && c.pubkey === u(s, "br:unlock-service-pubkey"));
  if (!i || !l) return null;
  let f = {};
  try {
    const c = JSON.parse(s.content || "{}");
    c && typeof c == "object" && (f = c);
  } catch {
    f = {};
  }
  const p = u(s, "nswp:term");
  return {
    coordinate: r,
    seller: s.pubkey,
    title: L(u(s, "title") || f.title || f.name, 80) || L(u(s, "d"), 80),
    priceSats: i,
    service: { ...l },
    for: /^3730[0-9]:[0-9a-f]{64}:[^\s]{1,200}$/u.test(u(s, "nswp:for")) ? u(s, "nswp:for") : "",
    termSeconds: /^[1-9][0-9]{0,9}$/u.test(p) ? Number(p) : 0,
    nswp: s.tags.some((c) => typeof c[0] == "string" && c[0].startsWith("nswp:"))
  };
}
function St(t, n = H) {
  const e = t;
  if (!e || typeof e != "object" || !Array.isArray(e.tags) || typeof e.content != "string" || e.content.length > 8e3 || e.kind !== V || !n.some((a) => a.pubkey === e.pubkey) || !_(e)) return null;
  let r;
  try {
    r = JSON.parse(e.content);
  } catch {
    return null;
  }
  if (!r || typeof r != "object" || r.schemaVersion !== 1 || r.protocolVersion !== z || r.status !== "active") return null;
  const s = (a) => typeof a == "string" && a.length > 0 && a.length <= 200 ? a : "", o = J(r.productCoordinate), [i, l, f, p] = [s(r.buyerPubkey), s(r.sellerPubkey), s(r.orderId), s(r.fulfillmentId)], c = typeof r.issuedAt == "number" && Number.isSafeInteger(r.issuedAt) && r.issuedAt > 0 ? r.issuedAt : 0;
  if (!o || !A.test(i) || !A.test(l) || l !== I(o) || !f || !p || !c || u(e, "d") !== q + p) return null;
  let d = 0;
  if (r.accessPolicy !== "perpetual-v1") {
    const a = r.accessPolicy;
    if (!a || typeof a != "object" || a.kind !== "term-v1" || typeof a.expiresAt != "number" || !Number.isSafeInteger(a.expiresAt) || a.expiresAt <= c) return null;
    d = a.expiresAt;
  }
  return { event: { id: e.id, pubkey: e.pubkey, created_at: e.created_at, kind: e.kind, tags: e.tags.map((a) => [...a]), content: e.content, sig: e.sig }, listing: o, seller: l, buyer: i, order: f, fulfillment: p, issuedAt: c, expiresAt: d, service: e.pubkey };
}
function Z(t, n) {
  return !!t && t.buyer === n.buyer && t.listing === n.listing && (t.expiresAt === 0 || n.now < t.expiresAt);
}
function Nt(t, n) {
  const e = t.filter((r) => Z(r, n));
  return e.sort((r, s) => r.expiresAt === 0 ? -1 : s.expiresAt === 0 ? 1 : s.expiresAt - r.expiresAt), e[0] ?? null;
}
function kt(t, n, e) {
  return n.publishers.includes(I(t)) || !!e && e === n.site;
}
export {
  ut as A,
  ct as B,
  mt as C,
  N as E,
  rt as H,
  Q as L,
  P,
  m as T,
  H as U,
  et as W,
  y as a,
  J as b,
  ft as c,
  St as d,
  kt as e,
  Nt as f,
  v as g,
  pt as h,
  D as i,
  K as j,
  yt as k,
  bt as l,
  At as m,
  ht as n,
  dt as o,
  I as p,
  nt as q,
  Z as r,
  st as s,
  gt as t,
  wt as u,
  it as v,
  at as w,
  lt as x,
  ot as y,
  F as z
};
