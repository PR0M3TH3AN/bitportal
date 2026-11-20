import { k as L, c as K, r as Y, f as U, m as V, h as I, g as W, R as $ } from "./bitlogin-shared-CCVHnhgs.js";
import { b as fe, i as me } from "./bitlogin-shared-CCVHnhgs.js";
import { r as d, f as C, k as M, i as g } from "./bitlogin-shared-DJU9OZ1J.js";
import { f as G } from "./bitlogin-shared-C1QD8gk6.js";
import { a as we } from "./bitlogin-shared-DoFOySoz.js";
const O = "bitlogin:allowed-sites:v1", f = {
  /** No more entries than this are kept: the oldest go first. */
  entries: 200,
  /** How long an entry is kept after it has ended, in seconds. */
  keepEndedSec: 720 * 3600,
  /** After "Just this one", a family is not offered again for this long, in seconds (docs/site-family.md SF4). */
  familyDeclineSec: 720 * 3600,
  /** No more sites than this are listed under a family. */
  members: 20
}, X = /^[0-9a-f]{64}$/u;
function k(n) {
  if (!n || typeof n != "object") return null;
  const e = n, t = d(e.site), r = t || (typeof e.site == "string" && e.site.includes("*") ? "" : K(e.site));
  if (!r || r !== e.site || typeof e.pubkey != "string" || !X.test(e.pubkey) || typeof e.at != "number" || typeof e.until != "number" || !Number.isFinite(e.at) || !Number.isFinite(e.until) || e.until < e.at) return null;
  const s = e.wants === void 0 ? void 0 : Y(e.wants);
  if (s === null || t && s) return null;
  const i = t && Array.isArray(e.members) ? [...new Set(e.members.filter((a) => g(a, t)))].slice(0, f.members) : [];
  return { site: r, ...i.length ? { members: i } : {}, pubkey: e.pubkey, at: Math.floor(e.at), until: Math.floor(e.until), remembered: e.remembered === !0, ...s ? { wants: s } : {} };
}
function q(n, e) {
  if (!n) return [];
  let t;
  try {
    t = JSON.parse(n);
  } catch {
    return [];
  }
  return Array.isArray(t) ? t.slice(0, f.entries * 2).map(k).filter((r) => r !== null && r.until + f.keepEndedSec > e).sort((r, s) => s.at - r.at).slice(0, f.entries) : [];
}
function z(n, e) {
  const t = k(e);
  if (!t) return [...n];
  const r = n.find((i) => i.site === t.site && i.pubkey === t.pubkey);
  return [d(t.site) && r?.members ? k({ ...t, members: [...t.members ?? [], ...r.members] }) ?? t : t, ...n.filter((i) => !(i.site === t.site && i.pubkey === t.pubkey))].slice(0, f.entries);
}
function ne(n, e, t, r) {
  return !d(t) || !g(e, t) ? null : n.find((s) => s.pubkey === r && s.remembered && s.site !== e && g(s.site, t)) ?? null;
}
function re(n, e, t) {
  return n.filter((r) => !(r.site === e && r.pubkey === t));
}
function se(n, e) {
  const t = n.until <= e, r = C(n.site) || null;
  return {
    known: r ? M(n.site) ? `every site at ${r}` : null : L(n.site),
    family: r,
    ended: t,
    lasts: t ? "Ended." : n.remembered ? "Remembered on this device until then, unless you sign out there sooner." : "For one visit: it ended when that site's page was closed or loaded again, and by then at the latest."
  };
}
const w = () => {
  try {
    return typeof localStorage > "u" ? null : localStorage;
  } catch {
    return null;
  }
};
function B(n = Date.now() / 1e3, e = w()) {
  try {
    return q(e?.getItem(O), n);
  } catch {
    return [];
  }
}
function Q(n, e = w()) {
  try {
    return e?.setItem(O, JSON.stringify(n)), !!e;
  } catch {
    return !1;
  }
}
function ie(n, e = w()) {
  return Q(z(B(n.at, e), n), e);
}
const F = "bitlogin:family-declined:v1", N = (n) => {
  try {
    const e = JSON.parse(n?.getItem(F) ?? "{}");
    return e && typeof e == "object" && !Array.isArray(e) ? e : {};
  } catch {
    return {};
  }
};
function oe(n, e = Date.now() / 1e3, t = w()) {
  if (!d(n)) return !1;
  const r = Math.floor(e), s = Object.fromEntries(Object.entries(N(t)).filter(([i, a]) => d(i) && typeof a == "number" && a > r));
  s[n] = r + f.familyDeclineSec;
  try {
    return t?.setItem(F, JSON.stringify(s)), !!t;
  } catch {
    return !1;
  }
}
function ae(n, e = Date.now() / 1e3, t = w()) {
  const r = N(t)[n];
  return typeof r == "number" && r > e;
}
function le(n = {}) {
  const e = typeof window > "u" ? null : window.opener;
  if (!e) return Promise.resolve(null);
  const t = location.origin, r = crypto.getRandomValues(new Uint8Array(12)), s = Array.from(r, (i) => i.toString(16).padStart(2, "0")).join("");
  return new Promise((i) => {
    let a = null, y = !1, h = null;
    const v = () => {
      if (!a)
        try {
          const l = e.frames;
          for (let o = 0; o < l.length; o++) l[o].postMessage(I({ t: "hello", nonce: s }), t);
        } catch {
        }
    }, A = setInterval(v, 350), _ = setTimeout(() => {
      clearInterval(A), y || (y = !0, window.removeEventListener("message", p), i(null));
    }, n.timeoutMs ?? 6e3), p = (l) => {
      if (l.origin !== t || !l.source || l.source === window) return;
      const o = U(l.data);
      if (!o || o.nonce !== s) return;
      if (o.t === "done" && a && l.source === a) return void h?.(o.ok);
      if (o.t !== "frame" || a) return;
      a = l.source, clearInterval(A), clearTimeout(_), y = !0;
      const { world: u, recipient: j } = o, c = o.wants && V(u, o.wants) ? o.wants : null, P = o.turnedDown === !0 || !!o.wants && !c, m = c ? "" : G(u);
      i({
        site: u,
        wants: c,
        known: L(u) !== null,
        family: m,
        knownFamily: m ? M(m) : !1,
        turnedDown: P,
        local: !!c && W(u) && [...c.sign, ...c.read].some((b) => $.includes(b)),
        async grant(b, E, S, R) {
          const T = R === !0 && S === !0 && !!m, x = await b.exportHandoff(j, c ? { site: u, permissions: c } : void 0, u, S === !0, T ? m : void 0), H = new Promise((D) => {
            h = D, setTimeout(() => D(!1), 8e3);
          });
          a.postMessage(I({ t: "grant", nonce: s, world: u, sealed: x, ...E ? { name: E } : {} }), t);
          const J = await H;
          return window.removeEventListener("message", p), J;
        }
      });
    };
    window.addEventListener("message", p), v();
  });
}
export {
  fe as SIGN_LIMITS,
  we as askLockDevice,
  oe as declineFamily,
  se as describeAllowed,
  me as describePermissions,
  ae as familyDeclined,
  C as familyDomain,
  G as familyOf,
  ne as familyOffer,
  le as findEmbeddedSigner,
  g as inFamily,
  L as knownAppName,
  M as knownFamily,
  B as loadAllowed,
  ie as recordAllowed,
  re as removeAllowed,
  Q as saveAllowed
};
