import { k as I, c as Y, r as K, f as R, m as U, h as D } from "./bitlogin-shared-BGjrJsFT.js";
import { b as le, g as ue } from "./bitlogin-shared-BGjrJsFT.js";
import { r as m, f as W, k as L, i as b } from "./bitlogin-shared-D0Tnl0qY.js";
import { f as $ } from "./bitlogin-shared-DoJ9_gbb.js";
import { a as fe } from "./bitlogin-shared-DoFOySoz.js";
const M = "bitlogin:allowed-sites:v1", c = {
  /** No more entries than this are kept: the oldest go first. */
  entries: 200,
  /** How long an entry is kept after it has ended, in seconds. */
  keepEndedSec: 720 * 3600,
  /** After "Just this one", a family is not offered again for this long, in seconds (docs/site-family.md SF4). */
  familyDeclineSec: 720 * 3600,
  /** No more sites than this are listed under a family. */
  members: 20
}, C = /^[0-9a-f]{64}$/u;
function g(n) {
  if (!n || typeof n != "object") return null;
  const e = n, t = m(e.site), r = t || (typeof e.site == "string" && e.site.includes("*") ? "" : Y(e.site));
  if (!r || r !== e.site || typeof e.pubkey != "string" || !C.test(e.pubkey) || typeof e.at != "number" || typeof e.until != "number" || !Number.isFinite(e.at) || !Number.isFinite(e.until) || e.until < e.at) return null;
  const s = e.wants === void 0 ? void 0 : K(e.wants);
  if (s === null || t && s) return null;
  const i = t && Array.isArray(e.members) ? [...new Set(e.members.filter((a) => b(a, t)))].slice(0, c.members) : [];
  return { site: r, ...i.length ? { members: i } : {}, pubkey: e.pubkey, at: Math.floor(e.at), until: Math.floor(e.until), remembered: e.remembered === !0, ...s ? { wants: s } : {} };
}
function G(n, e) {
  if (!n) return [];
  let t;
  try {
    t = JSON.parse(n);
  } catch {
    return [];
  }
  return Array.isArray(t) ? t.slice(0, c.entries * 2).map(g).filter((r) => r !== null && r.until + c.keepEndedSec > e).sort((r, s) => s.at - r.at).slice(0, c.entries) : [];
}
function V(n, e) {
  const t = g(e);
  if (!t) return [...n];
  const r = n.find((i) => i.site === t.site && i.pubkey === t.pubkey);
  return [m(t.site) && r?.members ? g({ ...t, members: [...t.members ?? [], ...r.members] }) ?? t : t, ...n.filter((i) => !(i.site === t.site && i.pubkey === t.pubkey))].slice(0, c.entries);
}
function Z(n, e, t, r) {
  return !m(t) || !b(e, t) ? null : n.find((s) => s.pubkey === r && s.remembered && s.site !== e && b(s.site, t)) ?? null;
}
function ee(n, e, t) {
  return n.filter((r) => !(r.site === e && r.pubkey === t));
}
function te(n, e) {
  const t = n.until <= e, r = W(n.site) || null;
  return {
    known: r ? L(n.site) ? `every site at ${r}` : null : I(n.site),
    family: r,
    ended: t,
    lasts: t ? "Ended." : n.remembered ? "Remembered on this device until then, unless you sign out there sooner." : "For one visit: it ended when that site's page was closed or loaded again, and by then at the latest."
  };
}
const d = () => {
  try {
    return typeof localStorage > "u" ? null : localStorage;
  } catch {
    return null;
  }
};
function X(n = Date.now() / 1e3, e = d()) {
  try {
    return G(e?.getItem(M), n);
  } catch {
    return [];
  }
}
function q(n, e = d()) {
  try {
    return e?.setItem(M, JSON.stringify(n)), !!e;
  } catch {
    return !1;
  }
}
function ne(n, e = d()) {
  return q(V(X(n.at, e), n), e);
}
const O = "bitlogin:family-declined:v1", F = (n) => {
  try {
    const e = JSON.parse(n?.getItem(O) ?? "{}");
    return e && typeof e == "object" && !Array.isArray(e) ? e : {};
  } catch {
    return {};
  }
};
function re(n, e = Date.now() / 1e3, t = d()) {
  if (!m(n)) return !1;
  const r = Math.floor(e), s = Object.fromEntries(Object.entries(F(t)).filter(([i, a]) => m(i) && typeof a == "number" && a > r));
  s[n] = r + c.familyDeclineSec;
  try {
    return t?.setItem(O, JSON.stringify(s)), !!t;
  } catch {
    return !1;
  }
}
function se(n, e = Date.now() / 1e3, t = d()) {
  const r = F(t)[n];
  return typeof r == "number" && r > e;
}
function ie(n = {}) {
  const e = typeof window > "u" ? null : window.opener;
  if (!e) return Promise.resolve(null);
  const t = location.origin, r = crypto.getRandomValues(new Uint8Array(12)), s = Array.from(r, (i) => i.toString(16).padStart(2, "0")).join("");
  return new Promise((i) => {
    let a = null, p = !1, k = null;
    const v = () => {
      if (!a)
        try {
          const l = e.frames;
          for (let o = 0; o < l.length; o++) l[o].postMessage(D({ t: "hello", nonce: s }), t);
        } catch {
        }
    }, h = setInterval(v, 350), N = setTimeout(() => {
      clearInterval(h), p || (p = !0, window.removeEventListener("message", w), i(null));
    }, n.timeoutMs ?? 6e3), w = (l) => {
      if (l.origin !== t || !l.source || l.source === window) return;
      const o = R(l.data);
      if (!o || o.nonce !== s) return;
      if (o.t === "done" && a && l.source === a) return void k?.(o.ok);
      if (o.t !== "frame" || a) return;
      a = l.source, clearInterval(h), clearTimeout(N), p = !0;
      const { world: u, recipient: j } = o, y = o.wants && U(u, o.wants) ? o.wants : null, f = y ? "" : $(u);
      i({
        site: u,
        wants: y,
        known: I(u) !== null,
        family: f,
        knownFamily: f ? L(f) : !1,
        async grant(P, A, S, T) {
          const _ = T === !0 && S === !0 && !!f, x = await P.exportHandoff(j, y ? { site: u, permissions: y } : void 0, u, S === !0, _ ? f : void 0), H = new Promise((E) => {
            k = E, setTimeout(() => E(!1), 8e3);
          });
          a.postMessage(D({ t: "grant", nonce: s, world: u, sealed: x, ...A ? { name: A } : {} }), t);
          const J = await H;
          return window.removeEventListener("message", w), J;
        }
      });
    };
    window.addEventListener("message", w), v();
  });
}
export {
  le as SIGN_LIMITS,
  fe as askLockDevice,
  re as declineFamily,
  te as describeAllowed,
  ue as describePermissions,
  se as familyDeclined,
  W as familyDomain,
  $ as familyOf,
  Z as familyOffer,
  ie as findEmbeddedSigner,
  b as inFamily,
  I as knownAppName,
  L as knownFamily,
  X as loadAllowed,
  ne as recordAllowed,
  ee as removeAllowed,
  q as saveAllowed
};
