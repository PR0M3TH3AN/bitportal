import { c as K } from "./bitlogin-shared-Dg1jplWn.js";
import { k as Q } from "./bitlogin-shared-3bwrMYp8.js";
import { f as B } from "./bitlogin-shared-DO_m8vK9.js";
import { c as W, a as u, b as g, A as y, s as _, d as V, m as X, p as Y, e as Z, l as $, f as ee, k as te, W as ne, h as re } from "./bitlogin-shared-CPV3bQ-1.js";
function le(N = {}) {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const P = location.origin;
  let r = W(location.ancestorOrigins?.[0] ?? ""), i = null, a = null, m = null, f = null, p = 0, h = !1, S = u();
  const x = { burst: g.passBurst, perMs: g.perMs, hourly: g.passHourly };
  let E = u(x), l = null, M = null, A = !1, w = [], H = [], k = { quiet: u(y.quiet), public: u(y.public), sensitive: u(y.sensitive), read: u(y.read) };
  const R = (t = [], o = []) => ({
    quiet: u(y.quiet),
    public: u(y.public, t),
    sensitive: u(y.sensitive, o),
    read: u(y.read)
  });
  let D = null;
  const L = async () => i ??= await K(N), C = () => {
    const t = i;
    i = null, a = null, m = null, f = null, p = 0, h = !1, l = null, t?.destroy();
  }, O = async () => {
    const t = i;
    !t || !a || !h || !r || await t.checkTakenBack(r).catch(() => "ok") === "ok" || i !== t || (C(), d(v()));
  }, G = () => {
    const t = i, o = r;
    i = null, a = null, m = null, f = null, p = 0, h = !1, l = null, w = [], t && (o ? t.forgetSignerGrant(o) : Promise.resolve()).catch(() => {
    }).finally(() => t.destroy());
  };
  let U = null;
  const F = () => U ??= (async () => {
    if (r)
      try {
        const t = await (await L()).restoreSignerGrant(r, B(r) || void 0);
        if (!t) return;
        a = t.pubkey, m = t.name ?? null, f = t.profile ?? null, p = t.until, h = !0, l = t.permissions ?? null, w = l ? [] : t.more ?? [], l ? k = R(t.signed, t.signedSensitive) : S = u(g, t.signed), t.check === "overdue" ? await O() : t.check === "due" && O(), E = u(x, t.signedPass);
      } catch {
      }
  })(), d = (t) => {
    r && window.parent.postMessage(_(t), r);
  }, v = (t) => (a && Date.now() / 1e3 >= p && G(), {
    t: "state",
    ...t ? { id: t } : {},
    unlocked: !!a,
    ...a ? { pubkey: a, until: p, remembered: h } : {},
    // The name in their own signed profile, where they have one; else the name the sign-in address knew them by.
    ...a && (f?.name || m) ? { name: f?.name || m } : {},
    ...a && f?.picture ? { picture: f.picture } : {},
    ...a && f?.about ? { about: f.about } : {},
    // An application is told what it was approved for, so it can tell that from what it now wants.
    ...a && l ? { permissions: l } : {},
    // A world is told what more it was let do, so it asks for nothing that isn't there.
    ...a && !l && w.length ? { more: w } : {},
    // What can be asked for here at all, said locked or unlocked. Not to an application: it is held to its set.
    ...l ? {} : { offers: [...ne] }
  }), j = async (t) => {
    const o = W(t.origin);
    if (!o || (r ||= o, o !== r)) return;
    const e = V(t.data);
    if (!e) return;
    if (await F(), e.t === "state") return d(v(e.id));
    if (e.t === "lock")
      return G(), d(v(e.id));
    if (e.t === "wantMore")
      return H = e.more, d(v(e.id));
    if (e.t === "want") {
      const s = X(r, e.permissions);
      return M = s ? e.permissions : null, A = !s, d({ ...v(e.id), taken: s });
    }
    const n = () => d({ t: "refused", id: e.id });
    if (a && Date.now() / 1e3 >= p && G(), !i || !a) return n();
    if (e.t === "encrypt" || e.t === "decrypt" || e.t === "read") {
      if (!l || e.t !== "encrypt" && !k.read.take(Date.now())) return n();
      try {
        const s = e.t === "read" ? await i.appDecryptEvent(e.event) : e.t === "encrypt" ? await i.appEncrypt(e.peer, e.text, e.scheme) : await i.appDecrypt(e.peer, e.text, e.scheme);
        return d({ t: "text", id: e.id, text: s });
      } catch {
        return n();
      }
    }
    if (e.t === "save" || e.t === "find" || e.t === "open") {
      if (l) return n();
      try {
        if (e.t === "find") return d({ t: "found", id: e.id, d: await i.worldFind(e.slot) });
        if (e.t === "open") return d({ t: "opened", id: e.id, ...await i.worldOpen(e.event) });
        const s = await i.worldSave(e.slot, e.data);
        return s.pubkey !== a ? n() : d({ t: "signed", id: e.id, event: s });
      } catch {
        return n();
      }
    }
    if (e.t === "follow") {
      if (l || !w.includes("follows")) return n();
      try {
        const s = await i.worldFollow(e.list, e.add ? { add: e.add } : { remove: e.remove });
        return s.pubkey !== a ? n() : d({ t: "signed", id: e.id, event: s });
      } catch {
        return n();
      }
    }
    if (e.t === "seal" || e.t === "unwrap" || e.t === "reach") {
      if (l || !w.includes("messages")) return n();
      try {
        if (e.t === "unwrap") return d({ t: "message", id: e.id, message: await i.worldUnwrap(e.event) });
        if (e.t === "reach") {
          const q = await i.worldReach(e.relays);
          return q.pubkey !== a ? n() : d({ t: "signed", id: e.id, event: q });
        }
        const s = await i.worldSeal(e.to, e.text);
        return s.message.pubkey !== a || s.seals.some((q) => q.pubkey !== a) ? n() : d({ t: "sealed", id: e.id, message: s.message, seals: s.seals });
      } catch {
        return n();
      }
    }
    if (e.t === "pass") {
      if (l || e.session === a || !E.take(Date.now())) return n();
      try {
        const s = await i.roomPass(e.session);
        if (s.pubkey !== a) return n();
        d({ t: "signed", id: e.id, event: s }), i.touchSignerGrant(r, S.times(), void 0, E.times()).catch(() => {
        });
      } catch {
        n();
      }
      return;
    }
    const c = Date.now(), I = l ? Y(l, e.event, r, c / 1e3) : Z(e.event, r, c / 1e3);
    if (!I) return n();
    const b = l ? $(I.kind) : null;
    if (!(b ? k[b] : S).take(c)) return n();
    try {
      const s = await i.signEvent(I);
      if (s.pubkey !== a) return n();
      d({ t: "signed", id: e.id, event: s }), b ? b !== "quiet" && i.touchSignerGrant(r, k.public.times(), k.sensitive.times()).catch(() => {
      }) : i.touchSignerGrant(r, S.times()).catch(() => {
      });
    } catch {
      n();
    }
  }, z = async (t) => {
    const o = ee(t.data);
    if (!o || !t.source) return;
    const e = (n) => t.source.postMessage(re(n), P);
    if (o.t === "hello") {
      if (!r) return;
      await F();
      try {
        const n = await (await L()).beginHandoff();
        D = { nonce: o.nonce, from: t.source }, e({ t: "frame", nonce: o.nonce, world: r, recipient: n, ...M ? { wants: M } : {}, ...A ? { turnedDown: !0 } : {}, ...!M && H.length ? { more: H } : {}, ...!M && a && !l && w.length ? { has: w } : {} });
      } catch {
      }
      return;
    }
    if (o.t === "grant" && !(!D || D.nonce !== o.nonce || D.from !== t.source || o.world !== r)) {
      D = null;
      try {
        const n = await L(), c = await n.acceptHandoff(o.sealed);
        if (c.app && c.app.site !== r || c.site && c.site !== r) throw new Error("for another site");
        if (c.family && c.family !== B(r)) throw new Error("for another family");
        f = c.profile ?? null, l = c.app?.permissions ?? null, w = l || c.family ? [] : c.more ?? [], k = R(), a = c.pubkey, m = o.name ?? null, S = u(), E = u(x);
        const b = (c.family ? Q(c.family) : te(r) !== null) && !w.includes("messages") ? g.grantSec : g.unknownGrantSec;
        p = Math.floor(Date.now() / 1e3) + (c.remember ? b : g.visitSec), h = c.remember === !0 && await n.keepSignerGrant({ site: r, until: p, ...m ? { name: m } : {} }).catch(() => !1), h || (p = Math.min(p, Math.floor(Date.now() / 1e3) + g.visitSec)), e({ t: "done", nonce: o.nonce, ok: !0 });
      } catch {
        G(), e({ t: "done", nonce: o.nonce, ok: !1 });
      }
      d(v());
    }
  }, T = (t) => {
    if (t.source === window.parent) return void j(t);
    t.origin === P && t.source !== window && z(t);
  };
  window.addEventListener("message", T);
  const J = setInterval(() => void O(), 36e5);
  return r && (window.parent.postMessage(_({ t: "ready" }), r), F().then(() => {
    a && d(v());
  })), {
    embedded: !0,
    stop() {
      clearInterval(J), window.removeEventListener("message", T), G();
    }
  };
}
export {
  le as startEmbeddedSigner
};
