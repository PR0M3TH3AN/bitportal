import { v as $ } from "./bitlogin-shared-Cj9s0_W_.js";
import { c as ee } from "./bitlogin-shared-Cmu8fEvJ.js";
import { k as te } from "./bitlogin-shared-BASIqHEi.js";
import { f as K } from "./bitlogin-shared-CzbW6ySa.js";
import { c as U, d as u, e as b, f as S, g as P, s as F, h as ne, m as re, p as ae, b as ie, i as se, j as oe, l as le, k as ce, n as j, o as de, W as ue, q as fe } from "./bitlogin-shared-BUDtZbQR.js";
function ye(C = {}) {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const N = location.origin;
  let i = U(location.ancestorOrigins?.[0] ?? ""), o = null, a = null, y = null, p = null, w = 0, M = !1, G = u();
  const q = { burst: b.passBurst, perMs: b.perMs, hourly: b.passHourly };
  let O = u(q), c = null, E = null, W = !1, m = [], L = [], A = { quiet: u(S.quiet), public: u(S.public), sensitive: u(S.sensitive), read: u(S.read) };
  const R = (t = [], r = []) => ({
    quiet: u(S.quiet),
    public: u(S.public, t),
    sensitive: u(S.sensitive, r),
    read: u(S.read)
  });
  let g = null;
  const z = { sign: u(P), wallet: u(P), pay: u(P) }, I = () => {
    if (!g) return;
    clearTimeout(g.timer);
    const { id: t } = g;
    g = null, i && window.parent.postMessage(F({ t: "refused", id: t }), i);
  };
  let h = null;
  const _ = async () => o ??= await ee(C), Q = () => {
    I();
    const t = o;
    o = null, a = null, y = null, p = null, w = 0, M = !1, c = null, t?.destroy();
  }, x = async () => {
    const t = o;
    !t || !a || !M || !i || await t.checkTakenBack(i).catch(() => "ok") === "ok" || o !== t || (Q(), d(D()));
  }, T = () => {
    I();
    const t = o, r = i;
    o = null, a = null, y = null, p = null, w = 0, M = !1, c = null, m = [], t && (r ? t.forgetSignerGrant(r) : Promise.resolve()).catch(() => {
    }).finally(() => t.destroy());
  };
  let V = null;
  const H = () => V ??= (async () => {
    if (i)
      try {
        const t = await (await _()).restoreSignerGrant(i, K(i) || void 0);
        if (!t) return;
        a = t.pubkey, y = t.name ?? null, p = t.profile ?? null, w = t.until, M = !0, c = t.permissions ?? null, m = c ? [] : t.more ?? [], c ? A = R(t.signed, t.signedSensitive) : G = u(b, t.signed), t.check === "overdue" ? await x() : t.check === "due" && x(), O = u(q, t.signedPass);
      } catch {
      }
  })(), d = (t) => {
    i && window.parent.postMessage(F(t), i);
  }, D = (t) => (a && Date.now() / 1e3 >= w && T(), {
    t: "state",
    ...t ? { id: t } : {},
    unlocked: !!a,
    ...a ? { pubkey: a, until: w, remembered: M } : {},
    // The name in their own signed profile, where they have one; else the name the sign-in address knew them by.
    ...a && (p?.name || y) ? { name: p?.name || y } : {},
    ...a && p?.picture ? { picture: p.picture } : {},
    ...a && p?.about ? { about: p.about } : {},
    // An application is told what it was approved for, so it can tell that from what it now wants.
    ...a && c ? { permissions: c } : {},
    // A world is told what more it was let do, so it asks for nothing that isn't there.
    ...a && !c && m.length ? { more: m } : {},
    // What can be asked for here at all, said locked or unlocked. Not to an application: it is held to its set.
    ...c ? {} : { offers: [...ue] }
  }), X = async (t) => {
    const r = U(t.origin);
    if (!r || (i ||= r, r !== i)) return;
    const e = ne(t.data);
    if (!e) return;
    if (await H(), e.t === "state") return d(D(e.id));
    if (e.t === "lock")
      return T(), d(D(e.id));
    if (e.t === "wantMore")
      return L = e.more, d(D(e.id));
    if (e.t === "want") {
      const s = re(i, e.permissions);
      return E = s ? e.permissions : null, W = !s, d({ ...D(e.id), taken: s });
    }
    const n = () => d({ t: "refused", id: e.id });
    if (a && Date.now() / 1e3 >= w && T(), !o || !a) return n();
    if (e.t === "propose" || e.t === "wallet" || e.t === "pay") {
      const s = c && e.t === "wallet" ? null : e.t === "wallet" ? { what: "wallet" } : e.t === "pay" ? { what: "pay", invoice: e.invoice } : /* @__PURE__ */ ((J) => J ? { what: "sign", event: J } : null)(ae(e.event, i, Date.now() / 1e3));
      if (!s || !z[s.what].take(Date.now())) return n();
      I();
      const v = e.id;
      return g = { id: v, ask: s, timer: setTimeout(() => g?.id === v && I(), ie) }, d({ t: "asking", id: v });
    }
    if (e.t === "encrypt" || e.t === "decrypt" || e.t === "read") {
      if (!c || e.t !== "encrypt" && !A.read.take(Date.now())) return n();
      try {
        const s = e.t === "read" ? await o.appDecryptEvent(e.event) : e.t === "encrypt" ? await o.appEncrypt(e.peer, e.text, e.scheme) : await o.appDecrypt(e.peer, e.text, e.scheme);
        return d({ t: "text", id: e.id, text: s });
      } catch {
        return n();
      }
    }
    if (e.t === "save" || e.t === "find" || e.t === "open") {
      if (c) return n();
      try {
        if (e.t === "find") return d({ t: "found", id: e.id, d: await o.worldFind(e.slot) });
        if (e.t === "open") return d({ t: "opened", id: e.id, ...await o.worldOpen(e.event) });
        const s = await o.worldSave(e.slot, e.data);
        return s.pubkey !== a ? n() : d({ t: "signed", id: e.id, event: s });
      } catch {
        return n();
      }
    }
    if (e.t === "follow") {
      if (c || !m.includes("follows")) return n();
      try {
        const s = await o.worldFollow(e.list, e.add ? { add: e.add } : { remove: e.remove });
        return s.pubkey !== a ? n() : d({ t: "signed", id: e.id, event: s });
      } catch {
        return n();
      }
    }
    if (e.t === "score" || e.t === "achieve") {
      if (c) return n();
      try {
        const s = e.t === "score" ? await o.worldScore(e.world, e.board, e.score, { ...e.title ? { title: e.title } : {}, ...e.format ? { format: e.format } : {} }) : await o.worldAchieve(e.world, e.achievement, e.title);
        return s.pubkey !== a ? n() : d({ t: "signed", id: e.id, event: s });
      } catch {
        return n();
      }
    }
    if (e.t === "seal" || e.t === "unwrap" || e.t === "reach") {
      if (c || !m.includes("messages")) return n();
      try {
        if (e.t === "unwrap") return d({ t: "message", id: e.id, message: await o.worldUnwrap(e.event) });
        if (e.t === "reach") {
          const v = await o.worldReach(e.relays);
          return v.pubkey !== a ? n() : d({ t: "signed", id: e.id, event: v });
        }
        const s = await o.worldSeal(e.to, e.text);
        return s.message.pubkey !== a || s.seals.some((v) => v.pubkey !== a) ? n() : d({ t: "sealed", id: e.id, message: s.message, seals: s.seals });
      } catch {
        return n();
      }
    }
    if (e.t === "pass") {
      if (c || e.session === a || !O.take(Date.now())) return n();
      try {
        const s = await o.roomPass(e.session);
        if (s.pubkey !== a) return n();
        d({ t: "signed", id: e.id, event: s }), o.touchSignerGrant(i, G.times(), void 0, O.times()).catch(() => {
        });
      } catch {
        n();
      }
      return;
    }
    const l = Date.now(), f = c ? se(c, e.event, i, l / 1e3) : oe(e.event, i, l / 1e3);
    if (!f) return n();
    const k = c ? le(f.kind) : null;
    if (!(k ? A[k] : G).take(l)) return n();
    try {
      const s = await o.signEvent(f);
      if (s.pubkey !== a) return n();
      d({ t: "signed", id: e.id, event: s }), k ? k !== "quiet" && o.touchSignerGrant(i, A.public.times(), A.sensitive.times()).catch(() => {
      }) : o.touchSignerGrant(i, G.times()).catch(() => {
      });
    } catch {
      n();
    }
  }, Y = async (t) => {
    const r = ce(t.data);
    if (!r || !t.source) return;
    const e = (n) => t.source.postMessage(fe(n), N);
    if (r.t === "hello") {
      if (!i) return;
      await H();
      try {
        const n = await (await _()).beginHandoff();
        h = { nonce: r.nonce, from: t.source }, e({ t: "frame", nonce: r.nonce, world: i, recipient: n, ...E ? { wants: E } : {}, ...W ? { turnedDown: !0 } : {}, ...!E && L.length ? { more: L } : {}, ...!E && a && !c && m.length ? { has: m } : {}, ...a && g ? { ask: g.ask, pubkey: a } : {} });
      } catch {
      }
      return;
    }
    if (r.t === "answer") {
      if (!h || h.nonce !== r.nonce || h.from !== t.source || r.world !== i) return;
      const n = g;
      if (!n || !a) return e({ t: "done", nonce: r.nonce, ok: !1 });
      clearTimeout(n.timer), g = null;
      let l = { t: "refused", id: n.id };
      if (n.ask.what === "wallet" && j(r.wallet) && (l = { t: "wallet", id: n.id, uri: j(r.wallet) }), n.ask.what === "pay" && r.paid?.invoice === n.ask.invoice && (l = { t: "paid", id: n.id, ...r.paid.preimage ? { preimage: r.paid.preimage } : {} }), n.ask.what === "sign" && r.event) {
        const f = r.event, k = n.ask.event;
        $(f) && f.pubkey === a && f.kind === k.kind && f.content === k.content && JSON.stringify(f.tags) === JSON.stringify(k.tags) && Math.abs(f.created_at - Date.now() / 1e3) < 600 && (l = { t: "signed", id: n.id, event: f });
      }
      return d(l), e({ t: "done", nonce: r.nonce, ok: l.t !== "refused" || !r.event && !r.wallet && !r.paid });
    }
    if (r.t === "grant" && !(!h || h.nonce !== r.nonce || h.from !== t.source || r.world !== i)) {
      h = null;
      try {
        const n = await _(), l = await n.acceptHandoff(r.sealed);
        if (l.app && l.app.site !== i || l.site && l.site !== i) throw new Error("for another site");
        if (l.family && l.family !== K(i)) throw new Error("for another family");
        p = l.profile ?? null, c = l.app?.permissions ?? null, m = c || l.family ? [] : l.more ?? [], A = R(), a = l.pubkey, y = r.name ?? null, G = u(), O = u(q), I();
        const k = (l.family ? te(l.family) : de(i) !== null) && !m.includes("messages") ? b.grantSec : b.unknownGrantSec;
        w = Math.floor(Date.now() / 1e3) + (l.remember ? k : b.visitSec), M = l.remember === !0 && await n.keepSignerGrant({ site: i, until: w, ...y ? { name: y } : {} }).catch(() => !1), M || (w = Math.min(w, Math.floor(Date.now() / 1e3) + b.visitSec)), e({ t: "done", nonce: r.nonce, ok: !0 });
      } catch {
        T(), e({ t: "done", nonce: r.nonce, ok: !1 });
      }
      d(D());
    }
  }, B = (t) => {
    if (t.source === window.parent) return void X(t);
    t.origin === N && t.source !== window && Y(t);
  };
  window.addEventListener("message", B);
  const Z = setInterval(() => void x(), 36e5);
  return i && (window.parent.postMessage(F({ t: "ready" }), i), H().then(() => {
    a && d(D());
  })), {
    embedded: !0,
    stop() {
      clearInterval(Z), window.removeEventListener("message", B), T();
    }
  };
}
export {
  ye as startEmbeddedSigner
};
