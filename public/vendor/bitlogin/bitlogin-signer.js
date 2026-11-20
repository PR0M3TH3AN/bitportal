import { c as K } from "./bitlogin-shared-CvOFcR_u.js";
import { k as Q } from "./bitlogin-shared-BfY0khWO.js";
import { f as B } from "./bitlogin-shared-DY8Ndhn6.js";
import { c as N, a as u, b as w, A as g, s as _, d as U, m as V, p as X, e as Y, l as Z, f as $, k as ee, h as te } from "./bitlogin-shared-U7Szz15o.js";
function se(C = {}) {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const P = location.origin;
  let n = N(location.ancestorOrigins?.[0] ?? ""), s = null, i = null, m = null, f = null, p = 0, y = !1, b = u();
  const q = { burst: w.passBurst, perMs: w.perMs, hourly: w.passHourly };
  let G = u(q), l = null, E = null, A = !1, v = [], H = [], k = { quiet: u(g.quiet), public: u(g.public), sensitive: u(g.sensitive), read: u(g.read) };
  const O = (t = [], a = []) => ({
    quiet: u(g.quiet),
    public: u(g.public, t),
    sensitive: u(g.sensitive, a),
    read: u(g.read)
  });
  let S = null;
  const x = async () => s ??= await K(C), R = () => {
    const t = s;
    s = null, i = null, m = null, f = null, p = 0, y = !1, l = null, t?.destroy();
  }, F = async () => {
    const t = s;
    !t || !i || !y || !n || await t.checkTakenBack(n).catch(() => "ok") === "ok" || s !== t || (R(), d(h()));
  }, M = () => {
    const t = s, a = n;
    s = null, i = null, m = null, f = null, p = 0, y = !1, l = null, v = [], t && (a ? t.forgetSignerGrant(a) : Promise.resolve()).catch(() => {
    }).finally(() => t.destroy());
  };
  let W = null;
  const L = () => W ??= (async () => {
    if (n)
      try {
        const t = await (await x()).restoreSignerGrant(n, B(n) || void 0);
        if (!t) return;
        i = t.pubkey, m = t.name ?? null, f = t.profile ?? null, p = t.until, y = !0, l = t.permissions ?? null, v = l ? [] : t.more ?? [], l ? k = O(t.signed, t.signedSensitive) : b = u(w, t.signed), t.check === "overdue" ? await F() : t.check === "due" && F(), G = u(q, t.signedPass);
      } catch {
      }
  })(), d = (t) => {
    n && window.parent.postMessage(_(t), n);
  }, h = (t) => (i && Date.now() / 1e3 >= p && M(), {
    t: "state",
    ...t ? { id: t } : {},
    unlocked: !!i,
    ...i ? { pubkey: i, until: p, remembered: y } : {},
    // The name in their own signed profile, where they have one; else the name the sign-in address knew them by.
    ...i && (f?.name || m) ? { name: f?.name || m } : {},
    ...i && f?.picture ? { picture: f.picture } : {},
    ...i && f?.about ? { about: f.about } : {},
    // An application is told what it was approved for, so it can tell that from what it now wants.
    ...i && l ? { permissions: l } : {},
    // A world is told what more it was let do, so it asks for nothing that isn't there.
    ...i && !l && v.length ? { more: v } : {}
  }), j = async (t) => {
    const a = N(t.origin);
    if (!a || (n ||= a, a !== n)) return;
    const e = U(t.data);
    if (!e) return;
    if (await L(), e.t === "state") return d(h(e.id));
    if (e.t === "lock")
      return M(), d(h(e.id));
    if (e.t === "wantMore")
      return H = e.more, d(h(e.id));
    if (e.t === "want") {
      const c = V(n, e.permissions);
      return E = c ? e.permissions : null, A = !c, d({ ...h(e.id), taken: c });
    }
    const r = () => d({ t: "refused", id: e.id });
    if (i && Date.now() / 1e3 >= p && M(), !s || !i) return r();
    if (e.t === "encrypt" || e.t === "decrypt" || e.t === "read") {
      if (!l || e.t !== "encrypt" && !k.read.take(Date.now())) return r();
      try {
        const c = e.t === "read" ? await s.appDecryptEvent(e.event) : e.t === "encrypt" ? await s.appEncrypt(e.peer, e.text, e.scheme) : await s.appDecrypt(e.peer, e.text, e.scheme);
        return d({ t: "text", id: e.id, text: c });
      } catch {
        return r();
      }
    }
    if (e.t === "save" || e.t === "find" || e.t === "open") {
      if (l) return r();
      try {
        if (e.t === "find") return d({ t: "found", id: e.id, d: await s.worldFind(e.slot) });
        if (e.t === "open") return d({ t: "opened", id: e.id, ...await s.worldOpen(e.event) });
        const c = await s.worldSave(e.slot, e.data);
        return c.pubkey !== i ? r() : d({ t: "signed", id: e.id, event: c });
      } catch {
        return r();
      }
    }
    if (e.t === "follow") {
      if (l || !v.includes("follows")) return r();
      try {
        const c = await s.worldFollow(e.list, e.add ? { add: e.add } : { remove: e.remove });
        return c.pubkey !== i ? r() : d({ t: "signed", id: e.id, event: c });
      } catch {
        return r();
      }
    }
    if (e.t === "pass") {
      if (l || e.session === i || !G.take(Date.now())) return r();
      try {
        const c = await s.roomPass(e.session);
        if (c.pubkey !== i) return r();
        d({ t: "signed", id: e.id, event: c }), s.touchSignerGrant(n, b.times(), void 0, G.times()).catch(() => {
        });
      } catch {
        r();
      }
      return;
    }
    const o = Date.now(), D = l ? X(l, e.event, n, o / 1e3) : Y(e.event, n, o / 1e3);
    if (!D) return r();
    const I = l ? Z(D.kind) : null;
    if (!(I ? k[I] : b).take(o)) return r();
    try {
      const c = await s.signEvent(D);
      if (c.pubkey !== i) return r();
      d({ t: "signed", id: e.id, event: c }), I ? I !== "quiet" && s.touchSignerGrant(n, k.public.times(), k.sensitive.times()).catch(() => {
      }) : s.touchSignerGrant(n, b.times()).catch(() => {
      });
    } catch {
      r();
    }
  }, z = async (t) => {
    const a = $(t.data);
    if (!a || !t.source) return;
    const e = (r) => t.source.postMessage(te(r), P);
    if (a.t === "hello") {
      if (!n) return;
      await L();
      try {
        const r = await (await x()).beginHandoff();
        S = { nonce: a.nonce, from: t.source }, e({ t: "frame", nonce: a.nonce, world: n, recipient: r, ...E ? { wants: E } : {}, ...A ? { turnedDown: !0 } : {}, ...!E && H.length ? { more: H } : {} });
      } catch {
      }
      return;
    }
    if (a.t === "grant" && !(!S || S.nonce !== a.nonce || S.from !== t.source || a.world !== n)) {
      S = null;
      try {
        const r = await x(), o = await r.acceptHandoff(a.sealed);
        if (o.app && o.app.site !== n || o.site && o.site !== n) throw new Error("for another site");
        if (o.family && o.family !== B(n)) throw new Error("for another family");
        f = o.profile ?? null, l = o.app?.permissions ?? null, v = l || o.family ? [] : o.more ?? [], k = O(), i = o.pubkey, m = a.name ?? null, b = u(), G = u(q);
        const D = o.family ? Q(o.family) : ee(n) !== null;
        p = Math.floor(Date.now() / 1e3) + (o.remember ? D ? w.grantSec : w.unknownGrantSec : w.visitSec), y = o.remember === !0 && await r.keepSignerGrant({ site: n, until: p, ...m ? { name: m } : {} }).catch(() => !1), y || (p = Math.min(p, Math.floor(Date.now() / 1e3) + w.visitSec)), e({ t: "done", nonce: a.nonce, ok: !0 });
      } catch {
        M(), e({ t: "done", nonce: a.nonce, ok: !1 });
      }
      d(h());
    }
  }, T = (t) => {
    if (t.source === window.parent) return void j(t);
    t.origin === P && t.source !== window && z(t);
  };
  window.addEventListener("message", T);
  const J = setInterval(() => void F(), 36e5);
  return n && (window.parent.postMessage(_({ t: "ready" }), n), L().then(() => {
    i && d(h());
  })), {
    embedded: !0,
    stop() {
      clearInterval(J), window.removeEventListener("message", T), M();
    }
  };
}
export {
  se as startEmbeddedSigner
};
