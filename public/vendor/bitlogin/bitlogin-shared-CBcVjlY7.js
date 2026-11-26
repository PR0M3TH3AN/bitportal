import { I as g } from "./bitlogin-shared-Cj9s0_W_.js";
import { y } from "./bitlogin-shared-BkXi7a9G.js";
const R = !0, h = "Signing in a headset from your phone is paused while we make it safe. Sign in on the headset with the sign-in window instead.";
function v() {
  throw Object.assign(new Error(h), { code: "paused" });
}
const A = 27304, m = 300, E = 120, w = "nswp:pair", d = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function I() {
  const e = crypto.getRandomValues(new Uint8Array(8)), n = Array.from(e, (t) => d[t & 31]).join("");
  return `${n.slice(0, 4)}-${n.slice(4)}`;
}
function S(e) {
  if (typeof e != "string") return "";
  const n = e.toUpperCase().replace(/[\s-]/gu, "").replace(/O/gu, "0").replace(/[IL]/gu, "1");
  return n.length !== 8 || ![...n].every((t) => d.includes(t)) ? "" : `${n.slice(0, 4)}-${n.slice(4)}`;
}
function N(e) {
  const n = S(e);
  return n ? Array.from(g(`bitlogin/pair/v1:${n}`), (t) => t.toString(16).padStart(2, "0")).join("") : "";
}
const _ = (e, n) => `${e}/pair/#${n}`, p = /^[0-9a-f]{64}$/u, l = (e, n) => Array.isArray(e) ? e.find((t) => Array.isArray(t) && t[0] === n && typeof t[1] == "string")?.[1] : void 0;
function $(e, n) {
  const t = e;
  if (!t || t.kind !== A || typeof t.id != "string" || typeof t.pubkey != "string" || !p.test(t.pubkey)) return null;
  const r = l(t.tags, w), i = l(t.tags, "nswp:origin"), s = Number(l(t.tags, "expiration")), c = y(i);
  if (!r || !p.test(r) || !c || c !== i || !Number.isSafeInteger(s) || s <= n || s > n + m + 30) return null;
  let f = "a device", u;
  try {
    const a = JSON.parse(String(t.content ?? "")), o = a.device;
    typeof o == "string" && o.length > 0 && o.length <= 48 && /^[\p{L}\p{N} ._()-]+$/u.test(o) && (f = o), typeof a.to == "string" && p.test(a.to) && (u = a.to);
  } catch {
  }
  return { id: t.id, key: t.pubkey, hash: r, site: c, device: f, expires: s, ...u ? { to: u } : {} };
}
function k(e) {
  return /OculusBrowser|Quest/u.test(e) ? "Meta Quest Browser" : /PicoBrowser|Pico/u.test(e) ? "Pico Browser" : /Wolvic/u.test(e) ? "Wolvic" : /visionOS|Vision Pro/u.test(e) ? "Apple Vision Pro" : "a browser";
}
function O(e) {
  const n = () => 10 + crypto.getRandomValues(new Uint32Array(1))[0] % 90, t = /* @__PURE__ */ new Set([e]);
  for (; t.size < 3; ) t.add(n());
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const s = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [r[i], r[s]] = [r[s], r[i]];
  }
  return r;
}
const U = () => 10 + crypto.getRandomValues(new Uint32Array(1))[0] % 90;
export {
  E as A,
  R as P,
  h as a,
  O as b,
  U as c,
  k as d,
  N as e,
  m as f,
  A as g,
  w as h,
  v as i,
  I as m,
  S as n,
  _ as p,
  $ as r
};
