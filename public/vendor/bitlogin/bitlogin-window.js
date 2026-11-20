import { k as O, c as U, r as V, f as W, m as $, h as M, g as C, R as G } from "./bitlogin-shared-U7Szz15o.js";
import { b as de, i as we } from "./bitlogin-shared-U7Szz15o.js";
import { r as d, f as X, k as F, i as h } from "./bitlogin-shared-BfY0khWO.js";
import { f as q } from "./bitlogin-shared-DY8Ndhn6.js";
import { a as pe } from "./bitlogin-shared-D74d_dQp.js";
const N = "bitlogin:allowed-sites:v1", f = {
  /** No more entries than this are kept: the oldest go first. */
  entries: 200,
  /** How long an entry is kept after it has ended, in seconds. */
  keepEndedSec: 720 * 3600,
  /** After "Just this one", a family is not offered again for this long, in seconds (docs/site-family.md SF4). */
  familyDeclineSec: 720 * 3600,
  /** No more sites than this are listed under a family. */
  members: 20
}, z = /^[0-9a-f]{64}$/u;
function k(n) {
  if (!n || typeof n != "object") return null;
  const e = n, t = d(e.site), r = t || (typeof e.site == "string" && e.site.includes("*") ? "" : U(e.site));
  if (!r || r !== e.site || typeof e.pubkey != "string" || !z.test(e.pubkey) || typeof e.at != "number" || typeof e.until != "number" || !Number.isFinite(e.at) || !Number.isFinite(e.until) || e.until < e.at) return null;
  const s = e.wants === void 0 ? void 0 : V(e.wants);
  if (s === null || t && s) return null;
  const i = t && Array.isArray(e.members) ? [...new Set(e.members.filter((a) => h(a, t)))].slice(0, f.members) : [];
  return { site: r, ...i.length ? { members: i } : {}, pubkey: e.pubkey, at: Math.floor(e.at), until: Math.floor(e.until), remembered: e.remembered === !0, ...s ? { wants: s } : {} };
}
function B(n, e) {
  if (!n) return [];
  let t;
  try {
    t = JSON.parse(n);
  } catch {
    return [];
  }
  return Array.isArray(t) ? t.slice(0, f.entries * 2).map(k).filter((r) => r !== null && r.until + f.keepEndedSec > e).sort((r, s) => s.at - r.at).slice(0, f.entries) : [];
}
function Q(n, e) {
  const t = k(e);
  if (!t) return [...n];
  const r = n.find((i) => i.site === t.site && i.pubkey === t.pubkey);
  return [d(t.site) && r?.members ? k({ ...t, members: [...t.members ?? [], ...r.members] }) ?? t : t, ...n.filter((i) => !(i.site === t.site && i.pubkey === t.pubkey))].slice(0, f.entries);
}
function se(n, e, t, r) {
  return !d(t) || !h(e, t) ? null : n.find((s) => s.pubkey === r && s.remembered && s.site !== e && h(s.site, t)) ?? null;
}
function oe(n, e, t) {
  return n.filter((r) => !(r.site === e && r.pubkey === t));
}
function ie(n, e) {
  const t = n.until <= e, r = X(n.site) || null;
  return {
    known: r ? F(n.site) ? `every site at ${r}` : null : O(n.site),
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
function Z(n = Date.now() / 1e3, e = w()) {
  try {
    return B(e?.getItem(N), n);
  } catch {
    return [];
  }
}
function ee(n, e = w()) {
  try {
    return e?.setItem(N, JSON.stringify(n)), !!e;
  } catch {
    return !1;
  }
}
function ae(n, e = w()) {
  return ee(Q(Z(n.at, e), n), e);
}
const _ = "bitlogin:family-declined:v1", j = (n) => {
  try {
    const e = JSON.parse(n?.getItem(_) ?? "{}");
    return e && typeof e == "object" && !Array.isArray(e) ? e : {};
  } catch {
    return {};
  }
};
function le(n, e = Date.now() / 1e3, t = w()) {
  if (!d(n)) return !1;
  const r = Math.floor(e), s = Object.fromEntries(Object.entries(j(t)).filter(([i, a]) => d(i) && typeof a == "number" && a > r));
  s[n] = r + f.familyDeclineSec;
  try {
    return t?.setItem(_, JSON.stringify(s)), !!t;
  } catch {
    return !1;
  }
}
function ue(n, e = Date.now() / 1e3, t = w()) {
  const r = j(t)[n];
  return typeof r == "number" && r > e;
}
function ce(n = {}) {
  const e = typeof window > "u" ? null : window.opener;
  if (!e) return Promise.resolve(null);
  const t = location.origin, r = crypto.getRandomValues(new Uint8Array(12)), s = Array.from(r, (i) => i.toString(16).padStart(2, "0")).join("");
  return new Promise((i) => {
    let a = null, p = !1, v = null;
    const A = () => {
      if (!a)
        try {
          const l = e.frames;
          for (let o = 0; o < l.length; o++) l[o].postMessage(M({ t: "hello", nonce: s }), t);
        } catch {
        }
    }, E = setInterval(A, 350), P = setTimeout(() => {
      clearInterval(E), p || (p = !0, window.removeEventListener("message", b), i(null));
    }, n.timeoutMs ?? 6e3), b = (l) => {
      if (l.origin !== t || !l.source || l.source === window) return;
      const o = W(l.data);
      if (!o || o.nonce !== s) return;
      if (o.t === "done" && a && l.source === a) return void v?.(o.ok);
      if (o.t !== "frame" || a) return;
      a = l.source, clearInterval(E), clearTimeout(P), p = !0;
      const { world: c, recipient: R } = o, u = o.wants && $(c, o.wants) ? o.wants : null, T = o.turnedDown === !0 || !!o.wants && !u, y = u ? [] : o.more ?? [], m = u || y.length ? "" : q(c);
      i({
        site: c,
        wants: u,
        known: O(c) !== null,
        family: m,
        knownFamily: m ? F(m) : !1,
        turnedDown: T,
        more: y,
        local: !!u && C(c) && [...u.sign, ...u.read].some((g) => G.includes(g)),
        async grant(g, S, D, x, H) {
          const I = x === !0 && D === !0 && !!m, J = await g.exportHandoff(R, u ? { site: c, permissions: u } : void 0, c, D === !0, I ? m : void 0, H === !0 && y.length && !I ? y : void 0), K = new Promise((L) => {
            v = L, setTimeout(() => L(!1), 8e3);
          });
          a.postMessage(M({ t: "grant", nonce: s, world: c, sealed: J, ...S ? { name: S } : {} }), t);
          const Y = await K;
          return window.removeEventListener("message", b), Y;
        }
      });
    };
    window.addEventListener("message", b), A();
  });
}
export {
  de as SIGN_LIMITS,
  pe as askLockDevice,
  le as declineFamily,
  ie as describeAllowed,
  we as describePermissions,
  ue as familyDeclined,
  X as familyDomain,
  q as familyOf,
  se as familyOffer,
  ce as findEmbeddedSigner,
  h as inFamily,
  O as knownAppName,
  F as knownFamily,
  Z as loadAllowed,
  ae as recordAllowed,
  oe as removeAllowed,
  ee as saveAllowed
};
