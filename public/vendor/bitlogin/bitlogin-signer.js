import { c as j } from "./bitlogin-shared-DNJrsC_6.js";
import { k as z } from "./bitlogin-shared-C9zlLrai.js";
import { f as T } from "./bitlogin-shared-BR-gO7UJ.js";
import { c as B, a as c, b as m, s as F, d as J, m as K, p as Q, e as U, l as V, f as X, k as Y, A as w, h as Z } from "./bitlogin-shared-BvaZ0lb5.js";
function re(O = {}) {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const L = location.origin;
  let n = B(location.ancestorOrigins?.[0] ?? ""), o = null, i = null, p = null, u = null, d = 0, g = !1, v = c();
  const E = { burst: m.passBurst, perMs: m.perMs, hourly: m.passHourly };
  let G = c(E), l = null, I = null, h = { quiet: c(w.quiet), public: c(w.public), sensitive: c(w.sensitive), read: c(w.read) };
  const P = (e = [], r = []) => ({
    quiet: c(w.quiet),
    public: c(w.public, e),
    sensitive: c(w.sensitive, r),
    read: c(w.read)
  });
  let b = null;
  const q = async () => o ??= await j(O), N = () => {
    const e = o;
    o = null, i = null, p = null, u = null, d = 0, g = !1, l = null, e?.destroy();
  }, H = async () => {
    const e = o;
    !e || !i || !g || !n || await e.checkTakenBack(n).catch(() => "ok") === "ok" || o !== e || (N(), f(k()));
  }, S = () => {
    const e = o, r = n;
    o = null, i = null, p = null, u = null, d = 0, g = !1, l = null, e && (r ? e.forgetSignerGrant(r) : Promise.resolve()).catch(() => {
    }).finally(() => e.destroy());
  };
  let _ = null;
  const x = () => _ ??= (async () => {
    if (n)
      try {
        const e = await (await q()).restoreSignerGrant(n, T(n) || void 0);
        if (!e) return;
        i = e.pubkey, p = e.name ?? null, u = e.profile ?? null, d = e.until, g = !0, l = e.permissions ?? null, l ? h = P(e.signed, e.signedSensitive) : v = c(m, e.signed), e.check === "overdue" ? await H() : e.check === "due" && H(), G = c(E, e.signedPass);
      } catch {
      }
  })(), f = (e) => {
    n && window.parent.postMessage(F(e), n);
  }, k = (e) => (i && Date.now() / 1e3 >= d && S(), {
    t: "state",
    ...e ? { id: e } : {},
    unlocked: !!i,
    ...i ? { pubkey: i, until: d, remembered: g } : {},
    // The name in their own signed profile, where they have one; else the name the sign-in address knew them by.
    ...i && (u?.name || p) ? { name: u?.name || p } : {},
    ...i && u?.picture ? { picture: u.picture } : {},
    ...i && u?.about ? { about: u.about } : {},
    // An application is told what it was approved for, so it can tell that from what it now wants.
    ...i && l ? { permissions: l } : {}
  }), C = async (e) => {
    const r = B(e.origin);
    if (!r || (n ||= r, r !== n)) return;
    const t = J(e.data);
    if (!t) return;
    if (await x(), t.t === "state") return f(k(t.id));
    if (t.t === "lock")
      return S(), f(k(t.id));
    if (t.t === "want")
      return I = K(n, t.permissions) ? t.permissions : null, f(k(t.id));
    const a = () => f({ t: "refused", id: t.id });
    if (i && Date.now() / 1e3 >= d && S(), !o || !i) return a();
    if (t.t === "encrypt" || t.t === "decrypt" || t.t === "read") {
      if (!l || t.t !== "encrypt" && !h.read.take(Date.now())) return a();
      try {
        const y = t.t === "read" ? await o.appDecryptEvent(t.event) : t.t === "encrypt" ? await o.appEncrypt(t.peer, t.text, t.scheme) : await o.appDecrypt(t.peer, t.text, t.scheme);
        return f({ t: "text", id: t.id, text: y });
      } catch {
        return a();
      }
    }
    if (t.t === "pass") {
      if (l || t.session === i || !G.take(Date.now())) return a();
      try {
        const y = await o.roomPass(t.session);
        if (y.pubkey !== i) return a();
        f({ t: "signed", id: t.id, event: y }), o.touchSignerGrant(n, v.times(), void 0, G.times()).catch(() => {
        });
      } catch {
        a();
      }
      return;
    }
    const s = Date.now(), M = l ? Q(l, t.event, n, s / 1e3) : U(t.event, n, s / 1e3);
    if (!M) return a();
    const D = l ? V(M.kind) : null;
    if (!(D ? h[D] : v).take(s)) return a();
    try {
      const y = await o.signEvent(M);
      if (y.pubkey !== i) return a();
      f({ t: "signed", id: t.id, event: y }), D ? D !== "quiet" && o.touchSignerGrant(n, h.public.times(), h.sensitive.times()).catch(() => {
      }) : o.touchSignerGrant(n, v.times()).catch(() => {
      });
    } catch {
      a();
    }
  }, R = async (e) => {
    const r = X(e.data);
    if (!r || !e.source) return;
    const t = (a) => e.source.postMessage(Z(a), L);
    if (r.t === "hello") {
      if (!n) return;
      await x();
      try {
        const a = await (await q()).beginHandoff();
        b = { nonce: r.nonce, from: e.source }, t({ t: "frame", nonce: r.nonce, world: n, recipient: a, ...I ? { wants: I } : {} });
      } catch {
      }
      return;
    }
    if (r.t === "grant" && !(!b || b.nonce !== r.nonce || b.from !== e.source || r.world !== n)) {
      b = null;
      try {
        const a = await q(), s = await a.acceptHandoff(r.sealed);
        if (s.app && s.app.site !== n || s.site && s.site !== n) throw new Error("for another site");
        if (s.family && s.family !== T(n)) throw new Error("for another family");
        u = s.profile ?? null, l = s.app?.permissions ?? null, h = P(), i = s.pubkey, p = r.name ?? null, v = c(), G = c(E);
        const M = s.family ? z(s.family) : Y(n) !== null;
        d = Math.floor(Date.now() / 1e3) + (s.remember ? M ? m.grantSec : m.unknownGrantSec : m.visitSec), g = s.remember === !0 && await a.keepSignerGrant({ site: n, until: d, ...p ? { name: p } : {} }).catch(() => !1), g || (d = Math.min(d, Math.floor(Date.now() / 1e3) + m.visitSec)), t({ t: "done", nonce: r.nonce, ok: !0 });
      } catch {
        S(), t({ t: "done", nonce: r.nonce, ok: !1 });
      }
      f(k());
    }
  }, A = (e) => {
    if (e.source === window.parent) return void C(e);
    e.origin === L && e.source !== window && R(e);
  };
  window.addEventListener("message", A);
  const W = setInterval(() => void H(), 36e5);
  return n && (window.parent.postMessage(F({ t: "ready" }), n), x().then(() => {
    i && f(k());
  })), {
    embedded: !0,
    stop() {
      clearInterval(W), window.removeEventListener("message", A), S();
    }
  };
}
export {
  re as startEmbeddedSigner
};
