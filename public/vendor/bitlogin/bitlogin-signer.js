import { v as $ } from "./bitlogin-shared-Cj9s0_W_.js";
import { c as ee } from "./bitlogin-shared-C30zwiSn.js";
import { k as te } from "./bitlogin-shared-AdzLHSV8.js";
import { f as K } from "./bitlogin-shared-B_Tl4qF0.js";
import { c as U, d as u, e as b, f as S, g as O, s as F, h as ne, m as ie, p as ae, b as re, i as se, j as oe, l as le, k as de, n as j, o as ce, W as ue, q as fe } from "./bitlogin-shared-BqDMTUOp.js";
function ve(C = {}) {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const N = location.origin;
  let r = U(location.ancestorOrigins?.[0] ?? ""), l = null, a = null, v = null, p = null, w = 0, M = !1, G = u();
  const L = { burst: b.passBurst, perMs: b.perMs, hourly: b.passHourly };
  let q = u(L), d = null, E = null, W = !1, m = [], _ = [], A = { quiet: u(S.quiet), public: u(S.public), sensitive: u(S.sensitive), read: u(S.read) };
  const R = (t = [], i = []) => ({
    quiet: u(S.quiet),
    public: u(S.public, t),
    sensitive: u(S.sensitive, i),
    read: u(S.read)
  });
  let g = null;
  const z = { sign: u(O), wallet: u(O), pay: u(O), save: u(O), pick: u(O) }, I = () => {
    if (!g) return;
    clearTimeout(g.timer);
    const { id: t } = g;
    g = null, r && window.parent.postMessage(F({ t: "refused", id: t }), r);
  };
  let y = null;
  const x = async () => l ??= await ee(C), Q = () => {
    I();
    const t = l;
    l = null, a = null, v = null, p = null, w = 0, M = !1, d = null, t?.destroy();
  }, H = async () => {
    const t = l;
    !t || !a || !M || !r || await t.checkTakenBack(r).catch(() => "ok") === "ok" || l !== t || (Q(), c(D()));
  }, T = () => {
    I();
    const t = l, i = r;
    l = null, a = null, v = null, p = null, w = 0, M = !1, d = null, m = [], t && (i ? t.forgetSignerGrant(i) : Promise.resolve()).catch(() => {
    }).finally(() => t.destroy());
  };
  let V = null;
  const P = () => V ??= (async () => {
    if (r)
      try {
        const t = await (await x()).restoreSignerGrant(r, K(r) || void 0);
        if (!t) return;
        a = t.pubkey, v = t.name ?? null, p = t.profile ?? null, w = t.until, M = !0, d = t.permissions ?? null, m = d ? [] : t.more ?? [], d ? A = R(t.signed, t.signedSensitive) : G = u(b, t.signed), t.check === "overdue" ? await H() : t.check === "due" && H(), q = u(L, t.signedPass);
      } catch {
      }
  })(), c = (t) => {
    r && window.parent.postMessage(F(t), r);
  }, D = (t) => (a && Date.now() / 1e3 >= w && T(), {
    t: "state",
    ...t ? { id: t } : {},
    unlocked: !!a,
    ...a ? { pubkey: a, until: w, remembered: M } : {},
    // The name in their own signed profile, where they have one; else the name the sign-in address knew them by.
    ...a && (p?.name || v) ? { name: p?.name || v } : {},
    ...a && p?.picture ? { picture: p.picture } : {},
    ...a && p?.about ? { about: p.about } : {},
    // An application is told what it was approved for, so it can tell that from what it now wants.
    ...a && d ? { permissions: d } : {},
    // A world is told what more it was let do, so it asks for nothing that isn't there.
    ...a && !d && m.length ? { more: m } : {},
    // What can be asked for here at all, said locked or unlocked. Not to an application: it is held to its set.
    ...d ? {} : { offers: [...ue] }
  }), X = async (t) => {
    const i = U(t.origin);
    if (!i || (r ||= i, i !== r)) return;
    const e = ne(t.data);
    if (!e) return;
    if (await P(), e.t === "state") return c(D(e.id));
    if (e.t === "lock")
      return T(), c(D(e.id));
    if (e.t === "wantMore")
      return _ = e.more, c(D(e.id));
    if (e.t === "want") {
      const s = ie(r, e.permissions);
      return E = s ? e.permissions : null, W = !s, c({ ...D(e.id), taken: s });
    }
    const n = () => c({ t: "refused", id: e.id });
    if (a && Date.now() / 1e3 >= w && T(), !l || !a) return n();
    if (e.t === "propose" || e.t === "wallet" || e.t === "pay" || e.t === "file-save" || e.t === "file-pick") {
      const s = d && e.t === "wallet" ? null : e.t === "wallet" ? { what: "wallet" } : e.t === "pay" ? { what: "pay", invoice: e.invoice } : e.t === "file-pick" ? { what: "pick" } : e.t === "file-save" ? { what: "save", name: e.name, type: e.type, bytes: e.bytes, private: e.private } : /* @__PURE__ */ ((J) => J ? { what: "sign", event: J } : null)(ae(e.event, r, Date.now() / 1e3));
      if (!s || !z[s.what].take(Date.now())) return n();
      I();
      const h = e.id;
      return g = { id: h, ask: s, timer: setTimeout(() => g?.id === h && I(), re) }, c({ t: "asking", id: h });
    }
    if (e.t === "encrypt" || e.t === "decrypt" || e.t === "read") {
      if (!d || e.t !== "encrypt" && !A.read.take(Date.now())) return n();
      try {
        const s = e.t === "read" ? await l.appDecryptEvent(e.event) : e.t === "encrypt" ? await l.appEncrypt(e.peer, e.text, e.scheme) : await l.appDecrypt(e.peer, e.text, e.scheme);
        return c({ t: "text", id: e.id, text: s });
      } catch {
        return n();
      }
    }
    if (e.t === "save" || e.t === "find" || e.t === "open") {
      if (d) return n();
      try {
        if (e.t === "find") return c({ t: "found", id: e.id, d: await l.worldFind(e.slot) });
        if (e.t === "open") return c({ t: "opened", id: e.id, ...await l.worldOpen(e.event) });
        const s = await l.worldSave(e.slot, e.data);
        return s.pubkey !== a ? n() : c({ t: "signed", id: e.id, event: s });
      } catch {
        return n();
      }
    }
    if (e.t === "follow") {
      if (d || !m.includes("follows")) return n();
      try {
        const s = await l.worldFollow(e.list, e.add ? { add: e.add } : { remove: e.remove });
        return s.pubkey !== a ? n() : c({ t: "signed", id: e.id, event: s });
      } catch {
        return n();
      }
    }
    if (e.t === "score" || e.t === "achieve") {
      if (d) return n();
      try {
        const s = e.t === "score" ? await l.worldScore(e.world, e.board, e.score, { ...e.title ? { title: e.title } : {}, ...e.format ? { format: e.format } : {} }) : await l.worldAchieve(e.world, e.achievement, e.title);
        return s.pubkey !== a ? n() : c({ t: "signed", id: e.id, event: s });
      } catch {
        return n();
      }
    }
    if (e.t === "seal" || e.t === "unwrap" || e.t === "reach") {
      if (d || !m.includes("messages")) return n();
      try {
        if (e.t === "unwrap") return c({ t: "message", id: e.id, message: await l.worldUnwrap(e.event) });
        if (e.t === "reach") {
          const h = await l.worldReach(e.relays);
          return h.pubkey !== a ? n() : c({ t: "signed", id: e.id, event: h });
        }
        const s = await l.worldSeal(e.to, e.text);
        return s.message.pubkey !== a || s.seals.some((h) => h.pubkey !== a) ? n() : c({ t: "sealed", id: e.id, message: s.message, seals: s.seals });
      } catch {
        return n();
      }
    }
    if (e.t === "pass") {
      if (d || e.session === a || !q.take(Date.now())) return n();
      try {
        const s = await l.roomPass(e.session);
        if (s.pubkey !== a) return n();
        c({ t: "signed", id: e.id, event: s }), l.touchSignerGrant(r, G.times(), void 0, q.times()).catch(() => {
        });
      } catch {
        n();
      }
      return;
    }
    const o = Date.now(), f = d ? se(d, e.event, r, o / 1e3) : oe(e.event, r, o / 1e3);
    if (!f) return n();
    const k = d ? le(f.kind) : null;
    if (!(k ? A[k] : G).take(o)) return n();
    try {
      const s = await l.signEvent(f);
      if (s.pubkey !== a) return n();
      c({ t: "signed", id: e.id, event: s }), k ? k !== "quiet" && l.touchSignerGrant(r, A.public.times(), A.sensitive.times()).catch(() => {
      }) : l.touchSignerGrant(r, G.times()).catch(() => {
      });
    } catch {
      n();
    }
  }, Y = async (t) => {
    const i = de(t.data);
    if (!i || !t.source) return;
    const e = (n) => t.source.postMessage(fe(n), N);
    if (i.t === "hello") {
      if (!r) return;
      await P();
      try {
        const n = await (await x()).beginHandoff();
        y = { nonce: i.nonce, from: t.source }, e({ t: "frame", nonce: i.nonce, world: r, recipient: n, ...E ? { wants: E } : {}, ...W ? { turnedDown: !0 } : {}, ...!E && _.length ? { more: _ } : {}, ...!E && a && !d && m.length ? { has: m } : {}, ...a && g ? { ask: g.ask, pubkey: a } : {} });
      } catch {
      }
      return;
    }
    if (i.t === "answer") {
      if (!y || y.nonce !== i.nonce || y.from !== t.source || i.world !== r) return;
      const n = g;
      if (!n || !a) return e({ t: "done", nonce: i.nonce, ok: !1 });
      clearTimeout(n.timer), g = null;
      let o = { t: "refused", id: n.id };
      if (n.ask.what === "wallet" && j(i.wallet) && (o = { t: "wallet", id: n.id, uri: j(i.wallet) }), n.ask.what === "pay" && i.paid?.invoice === n.ask.invoice && (o = { t: "paid", id: n.id, ...i.paid.preimage ? { preimage: i.paid.preimage } : {} }), n.ask.what === "save" && i.saved && (o = { t: "file-saved", id: n.id, ...i.saved }), n.ask.what === "pick" && i.file && (o = { t: "file", id: n.id, ...i.file }), n.ask.what === "sign" && i.event) {
        const f = i.event, k = n.ask.event;
        $(f) && f.pubkey === a && f.kind === k.kind && f.content === k.content && JSON.stringify(f.tags) === JSON.stringify(k.tags) && Math.abs(f.created_at - Date.now() / 1e3) < 600 && (o = { t: "signed", id: n.id, event: f });
      }
      return c(o), e({ t: "done", nonce: i.nonce, ok: o.t !== "refused" || !i.event && !i.wallet && !i.paid && !i.saved && !i.file });
    }
    if (i.t === "grant" && !(!y || y.nonce !== i.nonce || y.from !== t.source || i.world !== r)) {
      y = null;
      try {
        const n = await x(), o = await n.acceptHandoff(i.sealed);
        if (o.app && o.app.site !== r || o.site && o.site !== r) throw new Error("for another site");
        if (o.family && o.family !== K(r)) throw new Error("for another family");
        p = o.profile ?? null, d = o.app?.permissions ?? null, m = d || o.family ? [] : o.more ?? [], A = R(), a = o.pubkey, v = i.name ?? null, G = u(), q = u(L), I();
        const k = (o.family ? te(o.family) : ce(r) !== null) && !m.includes("messages") ? b.grantSec : b.unknownGrantSec;
        w = Math.floor(Date.now() / 1e3) + (o.remember ? k : b.visitSec), M = o.remember === !0 && await n.keepSignerGrant({ site: r, until: w, ...v ? { name: v } : {} }).catch(() => !1), M || (w = Math.min(w, Math.floor(Date.now() / 1e3) + b.visitSec)), e({ t: "done", nonce: i.nonce, ok: !0 });
      } catch {
        T(), e({ t: "done", nonce: i.nonce, ok: !1 });
      }
      c(D());
    }
  }, B = (t) => {
    if (t.source === window.parent) return void X(t);
    t.origin === N && t.source !== window && Y(t);
  };
  window.addEventListener("message", B);
  const Z = setInterval(() => void H(), 36e5);
  return r && (window.parent.postMessage(F({ t: "ready" }), r), P().then(() => {
    a && c(D());
  })), {
    embedded: !0,
    stop() {
      clearInterval(Z), window.removeEventListener("message", B), T();
    }
  };
}
export {
  ve as startEmbeddedSigner
};
