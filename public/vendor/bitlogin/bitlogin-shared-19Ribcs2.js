const m = 17375, h = 7375, y = 7376;
const l = {
  mints: 5,
  proofsPerToken: 500,
  tokens: 500,
  /**
   * How many proofs this wallet writes into one token record. Kept small so that a record is well under the
   * 64 KB an ordinary NIP-44 message may hold, and under what relays take: another NIP-60 wallet can read it.
   */
  proofsWritten: 100
}, u = /^[0-9a-f]+$/u, f = /^[0-9a-f]{64}$/u;
function c(e) {
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
function p(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.id != "string" || t.id.length < 2 || t.id.length > 66 || !u.test(t.id) || typeof t.amount != "number" || !Number.isSafeInteger(t.amount) || t.amount <= 0 || typeof t.secret != "string" || t.secret.length === 0 || t.secret.length > 2048 || typeof t.C != "string" || t.C.length !== 66 || !u.test(t.C) ? null : { id: t.id, amount: t.amount, secret: t.secret, C: t.C };
}
function d(e, t = l.proofsPerToken) {
  if (!Array.isArray(e) || e.length > t) return null;
  const n = [], o = /* @__PURE__ */ new Set();
  for (const r of e) {
    const s = p(r);
    if (!s || o.has(s.secret)) return null;
    o.add(s.secret), n.push(s);
  }
  return n;
}
const g = (e) => e.reduce((t, n) => t + n.amount, 0);
function S(e) {
  return JSON.stringify([["privkey", e.privkey], ...e.mints.map((t) => ["mint", t])]);
}
function A(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  if (!Array.isArray(t)) return null;
  let n = "";
  const o = [];
  for (const r of t)
    !Array.isArray(r) || typeof r[0] != "string" || (r[0] === "privkey" && typeof r[1] == "string" && f.test(r[1]) && (n ||= r[1]), r[0] === "mint" && c(r[1]) && !o.includes(c(r[1])) && o.length < l.mints && o.push(c(r[1])));
  return n ? { privkey: n, mints: o } : null;
}
function v(e) {
  return JSON.stringify({ mint: e.mint, unit: "sat", proofs: e.proofs.map(({ id: t, amount: n, secret: o, C: r }) => ({ id: t, amount: n, secret: o, C: r })), ...e.del?.length ? { del: [...e.del] } : {} });
}
function N(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const n = t, o = c(n.mint), r = d(n.proofs);
  if (!o || !r || n.unit !== void 0 && n.unit !== "sat") return null;
  const s = Array.isArray(n.del) ? n.del.filter((i) => typeof i == "string" && f.test(i)).slice(0, 200) : [];
  return { mint: o, proofs: r, del: s };
}
function T(e, t) {
  const n = new Set(e.flatMap((s) => s.del)), o = /* @__PURE__ */ new Set(), r = [];
  for (const s of [...e].sort((i, a) => a.created_at - i.created_at || i.event.localeCompare(a.event))) {
    if (n.has(s.event) || t.has(s.event)) continue;
    const i = s.proofs.filter((a) => !o.has(a.secret));
    for (const a of i) o.add(a.secret);
    i.length && r.length < l.tokens && r.push({ event: s.event, mint: s.mint, proofs: i });
  }
  return r;
}
function C(e) {
  return JSON.stringify([
    ["direction", e.direction],
    ["amount", String(e.amount)],
    ["unit", "sat"],
    ...(e.created ?? []).map((t) => ["e", t, "", "created"]),
    ...(e.destroyed ?? []).map((t) => ["e", t, "", "destroyed"])
  ]);
}
const I = (e) => {
  if (typeof e != "string") return "";
  const t = e.trim().toLowerCase().replace(/^lightning:/u, "");
  return t.length <= 2e3 && /^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(t) ? t : "";
};
export {
  l as E,
  y as H,
  h as T,
  m as W,
  c as a,
  N as b,
  I as c,
  d,
  C as e,
  v as f,
  T as l,
  A as r,
  g as s,
  S as w
};
