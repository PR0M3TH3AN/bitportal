const m = 17375, h = 7375, y = 7376;
const l = { mints: 5, proofsPerToken: 500, tokens: 500 }, u = /^[0-9a-f]+$/u, f = /^[0-9a-f]{64}$/u;
function c(e) {
  if (typeof e != "string" || e.length > 200) return "";
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    return "";
  }
  const r = t.hostname === "localhost" || t.hostname === "127.0.0.1";
  return t.protocol !== "https:" && !(t.protocol === "http:" && r) || t.username || t.password || t.search || t.hash ? "" : `${t.origin}${t.pathname.replace(/\/+$/u, "")}`;
}
function p(e) {
  if (!e || typeof e != "object") return null;
  const t = e;
  return typeof t.id != "string" || t.id.length < 2 || t.id.length > 66 || !u.test(t.id) || typeof t.amount != "number" || !Number.isSafeInteger(t.amount) || t.amount <= 0 || typeof t.secret != "string" || t.secret.length === 0 || t.secret.length > 2048 || typeof t.C != "string" || t.C.length !== 66 || !u.test(t.C) ? null : { id: t.id, amount: t.amount, secret: t.secret, C: t.C };
}
function d(e) {
  if (!Array.isArray(e) || e.length > l.proofsPerToken) return null;
  const t = [], r = /* @__PURE__ */ new Set();
  for (const o of e) {
    const n = p(o);
    if (!n || r.has(n.secret)) return null;
    r.add(n.secret), t.push(n);
  }
  return t;
}
const g = (e) => e.reduce((t, r) => t + r.amount, 0);
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
  let r = "";
  const o = [];
  for (const n of t)
    !Array.isArray(n) || typeof n[0] != "string" || (n[0] === "privkey" && typeof n[1] == "string" && f.test(n[1]) && (r ||= n[1]), n[0] === "mint" && c(n[1]) && !o.includes(c(n[1])) && o.length < l.mints && o.push(c(n[1])));
  return r ? { privkey: r, mints: o } : null;
}
function v(e) {
  return JSON.stringify({ mint: e.mint, unit: "sat", proofs: e.proofs.map(({ id: t, amount: r, secret: o, C: n }) => ({ id: t, amount: r, secret: o, C: n })), ...e.del?.length ? { del: [...e.del] } : {} });
}
function N(e) {
  let t;
  try {
    t = JSON.parse(e);
  } catch {
    return null;
  }
  if (!t || typeof t != "object" || Array.isArray(t)) return null;
  const r = t, o = c(r.mint), n = d(r.proofs);
  if (!o || !n || r.unit !== void 0 && r.unit !== "sat") return null;
  const s = Array.isArray(r.del) ? r.del.filter((i) => typeof i == "string" && f.test(i)).slice(0, 200) : [];
  return { mint: o, proofs: n, del: s };
}
function T(e, t) {
  const r = new Set(e.flatMap((s) => s.del)), o = /* @__PURE__ */ new Set(), n = [];
  for (const s of [...e].sort((i, a) => a.created_at - i.created_at || i.event.localeCompare(a.event))) {
    if (r.has(s.event) || t.has(s.event)) continue;
    const i = s.proofs.filter((a) => !o.has(a.secret));
    for (const a of i) o.add(a.secret);
    i.length && n.length < l.tokens && n.push({ event: s.event, mint: s.mint, proofs: i });
  }
  return n;
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
