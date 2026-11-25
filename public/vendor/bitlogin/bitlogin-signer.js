import { v as we } from "./bitlogin-shared-Cj9s0_W_.js";
import { y as ee, H as u, I as A, J as D, K as E, A as me, n as ge, U as te, M as C, N as ye, B as ke, O as ne, Q as he, R as ve, G as be, V as Se, W as Me, X as Ae, Y as De, Z as Ge, _ as Ee, $ as ie, f as ae, r as Ie, a0 as J, a1 as Te, a2 as Le, a3 as Oe, h as Re, a4 as He } from "./bitlogin-shared-waDFdrWm.js";
import { c as _e } from "./bitlogin-shared-CYbPHXTd.js";
import { f as V } from "./bitlogin-shared-BDiN4O4-.js";
const Fe = { burst: 10, perMs: 6e4, hourly: 60 };
function Pe(se = {}) {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const F = location.origin;
  let s = ee(location.ancestorOrigins?.[0] ?? ""), l = null, i = null, v = null, w = null, m = 0, b = !1, T = u();
  const x = { burst: A.passBurst, perMs: A.perMs, hourly: A.passHourly };
  let N = u(x), d = null, L = null, Q = !1, g = [], U = [], O = !1, I = { quiet: u(D.quiet), public: u(D.public), sensitive: u(D.sensitive), read: u(D.read) };
  const X = (a = [], t = []) => ({
    quiet: u(D.quiet),
    public: u(D.public, a),
    sensitive: u(D.sensitive, t),
    read: u(D.read)
  });
  let y = null;
  const re = { sign: u(E), wallet: u(E), pay: u(E), tip: u(E), buy: u(E), guests: u(Fe), save: u(E), pick: u(E) }, R = () => {
    if (!y) return;
    clearTimeout(y.timer);
    const { id: a } = y;
    y = null, s && window.parent.postMessage(C({ t: "refused", id: a }), s);
  };
  let k = null, q = null;
  const Y = me(F) ? ge(document.documentElement.dataset.unlockService) : null, H = Y ? [...te, Y] : te;
  let h = [];
  const P = () => {
    b && i && s && l?.holdReceipts(s, h).catch(() => {
    });
  }, oe = async () => {
    h = [], !(!i || !s || !l) && (h = J(await l.heldReceipts(s).catch(() => []), i, H));
  }, Z = () => {
    h = [];
  }, le = (a) => i ? Re(h.map((t) => ae(t, H)).filter((t) => !!t), { buyer: i, listing: a, now: Date.now() / 1e3 }) : null, W = async () => l ??= await _e(se), de = () => {
    R();
    const a = l;
    l = null, i = null, v = null, w = null, m = 0, b = !1, d = null, h = [], a?.destroy();
  }, B = async () => {
    const a = l;
    !a || !i || !b || !s || await a.checkTakenBack(s).catch(() => "ok") === "ok" || l !== a || (de(), c(S()));
  }, _ = () => {
    R();
    const a = l, t = s;
    l = null, i = null, v = null, w = null, m = 0, b = !1, d = null, g = [], G = !1, Z(), a && (t ? a.forgetSignerGrant(t) : Promise.resolve()).catch(() => {
    }).finally(() => a.destroy());
  };
  let ce = null, G = !1;
  const $ = async (a = !1) => {
    if (!s) return;
    const t = await (await W()).restoreSignerGrant(s, V(s) || void 0, a);
    t && (G = t.guest === !0, i = t.pubkey, v = t.name ?? null, w = t.profile ?? null, m = t.until, b = !G, d = t.permissions ?? null, g = d ? [] : t.more ?? [], d ? I = X(t.signed, t.signedSensitive) : T = u(A, t.signed), t.check === "overdue" ? await B() : t.check === "due" && B(), N = u(x, t.signedPass), await oe());
  }, K = () => ce ??= (async () => {
    try {
      await $();
    } catch {
    }
  })(), c = (a) => {
    s && window.parent.postMessage(C(a), s);
  }, S = (a) => (i && Date.now() / 1e3 >= m && _(), {
    t: "state",
    ...a ? { id: a } : {},
    unlocked: !!i,
    ...i ? { pubkey: i, until: m, remembered: b } : {},
    ...i && G ? { guest: !0 } : {},
    // The name in their own signed profile, where they have one; else the name the sign-in address knew them by.
    ...i && (w?.name || v) ? { name: w?.name || v } : {},
    ...i && w?.picture ? { picture: w.picture } : {},
    ...i && w?.about ? { about: w.about } : {},
    // An application is told what it was approved for, so it can tell that from what it now wants.
    ...i && d ? { permissions: d } : {},
    // A world is told what more it was let do, so it asks for nothing that isn't there.
    ...i && !d && g.length ? { more: g } : {},
    // What can be asked for here at all, said locked or unlocked. Not to an application: it is held to its set.
    ...d ? {} : { offers: [...Oe] }
  }), ue = async (a) => {
    const t = ee(a.origin);
    if (!t || (s ||= t, t !== s)) return;
    const e = ye(a.data);
    if (!e || e.t === "buy" && !ke(F)) return;
    if (await K(), e.t === "state") return c(S(e.id));
    if (e.t === "lock")
      return _(), c(S(e.id));
    if (e.t === "wantFamily")
      return O = !!e.family && e.family === V(s) && ne(e.family), e.guest && O && !i && await $(!0).catch(() => {
      }), c({ ...S(e.id), familyTaken: O, ...e.guest ? { guestTaken: O && G && !!i } : {} });
    if (e.t === "wantMore")
      return U = e.more, c(S(e.id));
    if (e.t === "want") {
      const r = he(s, e.permissions);
      return L = r ? e.permissions : null, Q = !r, c({ ...S(e.id), taken: r });
    }
    const n = () => c({ t: "refused", id: e.id });
    if (i && Date.now() / 1e3 >= m && _(), !l || !i) return n();
    if (e.t === "have") {
      const r = le(e.listing);
      return c(r ? { t: "receipt", id: e.id, receipt: r.event } : { t: "none", id: e.id });
    }
    if (e.t === "propose" || e.t === "wallet" || e.t === "pay" || e.t === "tip" || e.t === "buy" || e.t === "guests" || e.t === "file-save" || e.t === "file-pick") {
      const r = d && e.t === "wallet" ? null : e.t === "wallet" ? { what: "wallet" } : e.t === "pay" ? { what: "pay", invoice: e.invoice } : e.t === "tip" ? { what: "tip", sats: e.sats, ...e.to ? { to: e.to } : {} } : e.t === "buy" ? { what: "buy", listing: e.listing } : e.t === "guests" ? d ? null : { what: "guests", world: e.world, list: e.list ?? null, change: e.change, key: e.key, none: e.none } : e.t === "file-pick" ? { what: "pick" } : e.t === "file-save" ? { what: "save", name: e.name, type: e.type, bytes: e.bytes, private: e.private } : /* @__PURE__ */ ((z) => z ? { what: "sign", event: z } : null)(ve(e.event, s, Date.now() / 1e3));
      if (!r || !re[r.what].take(Date.now())) return n();
      R();
      const M = e.id;
      return y = { id: M, ask: r, timer: setTimeout(() => y?.id === M && R(), be) }, c({ t: "asking", id: M });
    }
    if (e.t === "encrypt" || e.t === "decrypt" || e.t === "read") {
      if (!d || e.t !== "encrypt" && !I.read.take(Date.now())) return n();
      try {
        const r = e.t === "read" ? await l.appDecryptEvent(e.event) : e.t === "encrypt" ? await l.appEncrypt(e.peer, e.text, e.scheme) : await l.appDecrypt(e.peer, e.text, e.scheme);
        return c({ t: "text", id: e.id, text: r });
      } catch {
        return n();
      }
    }
    if (e.t === "save" || e.t === "find" || e.t === "open") {
      if (d) return n();
      try {
        if (e.t === "find") return c({ t: "found", id: e.id, d: await l.worldFind(e.slot) });
        if (e.t === "open") return c({ t: "opened", id: e.id, ...await l.worldOpen(e.event) });
        const r = await l.worldSave(e.slot, e.data);
        return r.pubkey !== i ? n() : c({ t: "signed", id: e.id, event: r });
      } catch {
        return n();
      }
    }
    if (e.t === "follow") {
      if (d || !g.includes("follows")) return n();
      try {
        const r = await l.worldFollow(e.list, e.add ? { add: e.add } : { remove: e.remove });
        return r.pubkey !== i ? n() : c({ t: "signed", id: e.id, event: r });
      } catch {
        return n();
      }
    }
    if (e.t === "score" || e.t === "achieve") {
      if (d) return n();
      try {
        const r = e.t === "score" ? await l.worldScore(e.world, e.board, e.score, { ...e.title ? { title: e.title } : {}, ...e.format ? { format: e.format } : {} }) : await l.worldAchieve(e.world, e.achievement, e.title);
        return r.pubkey !== i ? n() : c({ t: "signed", id: e.id, event: r });
      } catch {
        return n();
      }
    }
    if (e.t === "seal" || e.t === "unwrap" || e.t === "reach") {
      if (d || !g.includes("messages")) return n();
      try {
        if (e.t === "unwrap") return c({ t: "message", id: e.id, message: await l.worldUnwrap(e.event) });
        if (e.t === "reach") {
          const M = await l.worldReach(e.relays);
          return M.pubkey !== i ? n() : c({ t: "signed", id: e.id, event: M });
        }
        const r = await l.worldSeal(e.to, e.text);
        return r.message.pubkey !== i || r.seals.some((M) => M.pubkey !== i) ? n() : c({ t: "sealed", id: e.id, message: r.message, seals: r.seals });
      } catch {
        return n();
      }
    }
    if (e.t === "pass") {
      if (!Se(d) || e.session === i || !N.take(Date.now())) return n();
      try {
        const r = await l.roomPass(e.session);
        if (r.pubkey !== i) return n();
        c({ t: "signed", id: e.id, event: r }), l.touchSignerGrant(s, T.times(), void 0, N.times()).catch(() => {
        });
      } catch {
        n();
      }
      return;
    }
    const o = Date.now(), f = d ? Me(d, e.event, s, o / 1e3) : G ? Ae(e.event, s, o / 1e3) : De(e.event, s, o / 1e3);
    if (!f) return n();
    const p = d ? Ge(f.kind) : null;
    if (!(p ? I[p] : T).take(o)) return n();
    try {
      const r = await l.signEvent(f);
      if (r.pubkey !== i) return n();
      c({ t: "signed", id: e.id, event: r }), p ? p !== "quiet" && l.touchSignerGrant(s, I.public.times(), I.sensitive.times()).catch(() => {
      }) : l.touchSignerGrant(s, T.times()).catch(() => {
      });
    } catch {
      n();
    }
  }, fe = async (a) => {
    const t = Ee(a.data);
    if (!t || !a.source) return;
    const e = (n) => a.source.postMessage(He(n), F);
    if (t.t === "hello") {
      if (!s) return;
      await K();
      try {
        const n = await (await W()).beginHandoff();
        k = { nonce: t.nonce, from: a.source }, q = k, e({ t: "frame", nonce: t.nonce, world: s, recipient: n, ...L ? { wants: L } : {}, ...Q ? { turnedDown: !0 } : {}, ...!L && U.length ? { more: U } : {}, ...!L && i && !d && g.length ? { has: g } : {}, ...O && !U.length ? { family: !0 } : {}, ...i && y ? { ask: y.ask, pubkey: i } : {} });
      } catch {
      }
      return;
    }
    if (t.t === "answer") {
      if (!k || k.nonce !== t.nonce || k.from !== a.source || t.world !== s) return;
      const n = y;
      if (!n || !i) return e({ t: "done", nonce: t.nonce, ok: !1 });
      clearTimeout(n.timer), y = null;
      let o = { t: "refused", id: n.id };
      if (n.ask.what === "wallet" && ie(t.wallet) && (o = { t: "wallet", id: n.id, uri: ie(t.wallet) }), n.ask.what === "pay" && t.paid?.invoice === n.ask.invoice && (o = { t: "paid", id: n.id, ...t.paid.preimage ? { preimage: t.paid.preimage } : {} }), n.ask.what === "tip" && t.tipped?.sats === n.ask.sats && (o = { t: "paid", id: n.id, ...t.tipped.preimage ? { preimage: t.tipped.preimage } : {} }), n.ask.what === "buy" && t.bought) {
        const f = ae(t.bought.receipt, H);
        Ie(f, { buyer: i, listing: n.ask.listing, now: Date.now() / 1e3 }) && (o = { t: "bought", id: n.id, receipt: f.event, ...t.bought.delivery ? { delivery: t.bought.delivery } : {} }, h = J([f.event, ...h.filter((p) => p.id !== f.event.id)], i, H), P());
      }
      if (n.ask.what === "guests" && t.listed && Te(t.listed, { pubkey: i, world: n.ask.world, change: n.ask.change, key: n.ask.key, list: n.ask.list, now: Date.now() / 1e3 }) && (o = { t: "signed", id: n.id, event: t.listed }), n.ask.what === "save" && t.saved && (o = { t: "file-saved", id: n.id, ...t.saved }), n.ask.what === "pick" && t.file && (o = { t: "file", id: n.id, ...t.file }), n.ask.what === "sign" && t.event) {
        const f = t.event, p = n.ask.event;
        we(f) && f.pubkey === i && f.kind === p.kind && f.content === p.content && JSON.stringify(f.tags) === JSON.stringify(p.tags) && Math.abs(f.created_at - Date.now() / 1e3) < 600 && (o = { t: "signed", id: n.id, event: f });
      }
      return c(o), e({ t: "done", nonce: t.nonce, ok: o.t !== "refused" || !t.event && !t.wallet && !t.paid && !t.saved && !t.file && !t.tipped && !t.bought && !t.listed });
    }
    if (t.t === "held") {
      if (!q || q.nonce !== t.nonce || q.from !== a.source || t.world !== s || !i) return;
      h = J(t.receipts, i, H), P();
      return;
    }
    if (t.t === "grant" && !(!k || k.nonce !== t.nonce || k.from !== a.source || t.world !== s)) {
      k = null;
      try {
        const n = await W(), o = await n.acceptHandoff(t.sealed);
        if (o.app && o.app.site !== s || o.site && o.site !== s) throw new Error("for another site");
        if (o.family && o.family !== V(s)) throw new Error("for another family");
        w = o.profile ?? null, G = !1, d = o.app?.permissions ?? null, g = d || o.family ? [] : o.more ?? [], I = X(), i = o.pubkey, v = t.name ?? null, T = u(), N = u(x), R(), Z();
        const p = (o.family && !o.app ? ne(o.family) : Le(s) !== null) && !g.includes("messages") ? A.grantSec : A.unknownGrantSec;
        m = Math.floor(Date.now() / 1e3) + (o.remember ? p : A.visitSec), b = o.remember === !0 && await n.keepSignerGrant({ site: s, until: m, ...v ? { name: v } : {} }).catch(() => !1), b || (m = Math.min(m, Math.floor(Date.now() / 1e3) + A.visitSec)), P(), e({ t: "done", nonce: t.nonce, ok: !0 });
      } catch {
        _(), e({ t: "done", nonce: t.nonce, ok: !1 });
      }
      c(S());
    }
  }, j = (a) => {
    if (a.source === window.parent) return void ue(a);
    a.origin === F && a.source !== window && fe(a);
  };
  window.addEventListener("message", j);
  const pe = setInterval(() => void B(), 36e5);
  return s && (window.parent.postMessage(C({ t: "ready" }), s), K().then(() => {
    i && c(S());
  })), {
    embedded: !0,
    stop() {
      clearInterval(pe), window.removeEventListener("message", j), _();
    }
  };
}
export {
  Pe as startEmbeddedSigner
};
