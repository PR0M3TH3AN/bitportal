import { c as z } from "./bitlogin-shared-BTQ8Ic9W.js";
import { k as J } from "./bitlogin-shared-DJU9OZ1J.js";
import { f as B } from "./bitlogin-shared-C1QD8gk6.js";
import { c as F, a as c, b as w, s as O, d as K, m as Q, p as U, e as V, l as X, f as Y, k as Z, A as g, h as $ } from "./bitlogin-shared-CCVHnhgs.js";
function ie(N = {}) {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const L = location.origin;
  let n = F(location.ancestorOrigins?.[0] ?? ""), o = null, i = null, m = null, d = null, f = 0, y = !1, v = c();
  const E = { burst: w.passBurst, perMs: w.perMs, hourly: w.passHourly };
  let D = c(E), l = null, I = null, P = !1, h = { quiet: c(g.quiet), public: c(g.public), sensitive: c(g.sensitive), read: c(g.read) };
  const A = (e = [], r = []) => ({
    quiet: c(g.quiet),
    public: c(g.public, e),
    sensitive: c(g.sensitive, r),
    read: c(g.read)
  });
  let b = null;
  const q = async () => o ??= await z(N), _ = () => {
    const e = o;
    o = null, i = null, m = null, d = null, f = 0, y = !1, l = null, e?.destroy();
  }, H = async () => {
    const e = o;
    !e || !i || !y || !n || await e.checkTakenBack(n).catch(() => "ok") === "ok" || o !== e || (_(), p(k()));
  }, S = () => {
    const e = o, r = n;
    o = null, i = null, m = null, d = null, f = 0, y = !1, l = null, e && (r ? e.forgetSignerGrant(r) : Promise.resolve()).catch(() => {
    }).finally(() => e.destroy());
  };
  let C = null;
  const x = () => C ??= (async () => {
    if (n)
      try {
        const e = await (await q()).restoreSignerGrant(n, B(n) || void 0);
        if (!e) return;
        i = e.pubkey, m = e.name ?? null, d = e.profile ?? null, f = e.until, y = !0, l = e.permissions ?? null, l ? h = A(e.signed, e.signedSensitive) : v = c(w, e.signed), e.check === "overdue" ? await H() : e.check === "due" && H(), D = c(E, e.signedPass);
      } catch {
      }
  })(), p = (e) => {
    n && window.parent.postMessage(O(e), n);
  }, k = (e) => (i && Date.now() / 1e3 >= f && S(), {
    t: "state",
    ...e ? { id: e } : {},
    unlocked: !!i,
    ...i ? { pubkey: i, until: f, remembered: y } : {},
    // The name in their own signed profile, where they have one; else the name the sign-in address knew them by.
    ...i && (d?.name || m) ? { name: d?.name || m } : {},
    ...i && d?.picture ? { picture: d.picture } : {},
    ...i && d?.about ? { about: d.about } : {},
    // An application is told what it was approved for, so it can tell that from what it now wants.
    ...i && l ? { permissions: l } : {}
  }), R = async (e) => {
    const r = F(e.origin);
    if (!r || (n ||= r, r !== n)) return;
    const t = K(e.data);
    if (!t) return;
    if (await x(), t.t === "state") return p(k(t.id));
    if (t.t === "lock")
      return S(), p(k(t.id));
    if (t.t === "want") {
      const u = Q(n, t.permissions);
      return I = u ? t.permissions : null, P = !u, p({ ...k(t.id), taken: u });
    }
    const a = () => p({ t: "refused", id: t.id });
    if (i && Date.now() / 1e3 >= f && S(), !o || !i) return a();
    if (t.t === "encrypt" || t.t === "decrypt" || t.t === "read") {
      if (!l || t.t !== "encrypt" && !h.read.take(Date.now())) return a();
      try {
        const u = t.t === "read" ? await o.appDecryptEvent(t.event) : t.t === "encrypt" ? await o.appEncrypt(t.peer, t.text, t.scheme) : await o.appDecrypt(t.peer, t.text, t.scheme);
        return p({ t: "text", id: t.id, text: u });
      } catch {
        return a();
      }
    }
    if (t.t === "pass") {
      if (l || t.session === i || !D.take(Date.now())) return a();
      try {
        const u = await o.roomPass(t.session);
        if (u.pubkey !== i) return a();
        p({ t: "signed", id: t.id, event: u }), o.touchSignerGrant(n, v.times(), void 0, D.times()).catch(() => {
        });
      } catch {
        a();
      }
      return;
    }
    const s = Date.now(), M = l ? U(l, t.event, n, s / 1e3) : V(t.event, n, s / 1e3);
    if (!M) return a();
    const G = l ? X(M.kind) : null;
    if (!(G ? h[G] : v).take(s)) return a();
    try {
      const u = await o.signEvent(M);
      if (u.pubkey !== i) return a();
      p({ t: "signed", id: t.id, event: u }), G ? G !== "quiet" && o.touchSignerGrant(n, h.public.times(), h.sensitive.times()).catch(() => {
      }) : o.touchSignerGrant(n, v.times()).catch(() => {
      });
    } catch {
      a();
    }
  }, W = async (e) => {
    const r = Y(e.data);
    if (!r || !e.source) return;
    const t = (a) => e.source.postMessage($(a), L);
    if (r.t === "hello") {
      if (!n) return;
      await x();
      try {
        const a = await (await q()).beginHandoff();
        b = { nonce: r.nonce, from: e.source }, t({ t: "frame", nonce: r.nonce, world: n, recipient: a, ...I ? { wants: I } : {}, ...P ? { turnedDown: !0 } : {} });
      } catch {
      }
      return;
    }
    if (r.t === "grant" && !(!b || b.nonce !== r.nonce || b.from !== e.source || r.world !== n)) {
      b = null;
      try {
        const a = await q(), s = await a.acceptHandoff(r.sealed);
        if (s.app && s.app.site !== n || s.site && s.site !== n) throw new Error("for another site");
        if (s.family && s.family !== B(n)) throw new Error("for another family");
        d = s.profile ?? null, l = s.app?.permissions ?? null, h = A(), i = s.pubkey, m = r.name ?? null, v = c(), D = c(E);
        const M = s.family ? J(s.family) : Z(n) !== null;
        f = Math.floor(Date.now() / 1e3) + (s.remember ? M ? w.grantSec : w.unknownGrantSec : w.visitSec), y = s.remember === !0 && await a.keepSignerGrant({ site: n, until: f, ...m ? { name: m } : {} }).catch(() => !1), y || (f = Math.min(f, Math.floor(Date.now() / 1e3) + w.visitSec)), t({ t: "done", nonce: r.nonce, ok: !0 });
      } catch {
        S(), t({ t: "done", nonce: r.nonce, ok: !1 });
      }
      p(k());
    }
  }, T = (e) => {
    if (e.source === window.parent) return void R(e);
    e.origin === L && e.source !== window && W(e);
  };
  window.addEventListener("message", T);
  const j = setInterval(() => void H(), 36e5);
  return n && (window.parent.postMessage(O({ t: "ready" }), n), x().then(() => {
    i && p(k());
  })), {
    embedded: !0,
    stop() {
      clearInterval(j), window.removeEventListener("message", T), S();
    }
  };
}
export {
  ie as startEmbeddedSigner
};
