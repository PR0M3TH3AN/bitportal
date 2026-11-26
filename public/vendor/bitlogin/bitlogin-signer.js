import { v as ge } from "./bitlogin-shared-Cj9s0_W_.js";
import { y as ee, H as c, I as A, J as D, K as G, A as ye, n as ke, U as te, M as K, O as he, B as ve, Q as ie, V as be, W as Se, G as Me, X as Ae, Y as De, Z as Ge, _ as Ee, $ as Ie, a0 as Te, a1 as ne, f as ae, r as He, a2 as J, a3 as Le, a4 as Oe, h as Re, a5 as _e, a6 as Fe } from "./bitlogin-shared-BkXi7a9G.js";
import { c as xe } from "./bitlogin-shared-C99Ztz6J.js";
import { f as V } from "./bitlogin-shared-BE8A8fPq.js";
const Ue = { burst: 10, perMs: 6e4, hourly: 60 };
function Be(se = {}) {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const F = location.origin;
  let s = ee(location.ancestorOrigins?.[0] ?? ""), o = null, n = null, b = null, p = null, w = 0, S = !1, T = c();
  const N = { burst: A.passBurst, perMs: A.perMs, hourly: A.passHourly };
  let x = c(N), d = null, H = null, Q = !1, m = [], U = [], L = !1, I = { quiet: c(D.quiet), public: c(D.public), sensitive: c(D.sensitive), read: c(D.read) };
  const X = (a = [], t = []) => ({
    quiet: c(D.quiet),
    public: c(D.public, a),
    sensitive: c(D.sensitive, t),
    read: c(D.read)
  });
  let g = null;
  const re = { sign: c(G), wallet: c(G), pay: c(G), tip: c(G), buy: c(G), guests: c(Ue), save: c(G), pick: c(G) }, O = () => {
    if (!g) return;
    clearTimeout(g.timer);
    const { id: a } = g;
    g = null, s && window.parent.postMessage(K({ t: "refused", id: a }), s);
  };
  let k = null, q = null;
  const Y = ye(F) ? ke(document.documentElement.dataset.unlockService) : null, R = Y ? [...te, Y] : te;
  let h = [];
  const P = () => {
    S && n && s && o?.holdReceipts(s, h).catch(() => {
    });
  }, oe = async () => {
    h = [], !(!n || !s || !o) && (h = J(await o.heldReceipts(s).catch(() => []), n, R));
  }, Z = () => {
    h = [];
  }, le = (a) => n ? Re(h.map((t) => ae(t, R)).filter((t) => !!t), { buyer: n, listing: a, now: Date.now() / 1e3 }) : null, W = async () => o ??= await xe(se), de = () => {
    O();
    const a = o;
    o = null, n = null, b = null, p = null, w = 0, S = !1, d = null, h = [], a?.destroy();
  }, B = async () => {
    const a = o;
    !a || !n || !S || !s || await a.checkTakenBack(s).catch(() => "ok") === "ok" || o !== a || (de(), l(v()));
  };
  let ce = null;
  c(G);
  const _ = () => {
    O();
    const a = o, t = s;
    o = null, n = null, b = null, p = null, w = 0, S = !1, d = null, m = [], E = !1, Z(), a && (t ? a.forgetSignerGrant(t) : Promise.resolve()).catch(() => {
    }).finally(() => a.destroy());
  };
  let ue = null, E = !1;
  const $ = async (a = !1) => {
    if (!s) return;
    const t = await (await W()).restoreSignerGrant(s, V(s) || void 0, a);
    t && (E = t.guest === !0, n = t.pubkey, b = t.name ?? null, p = t.profile ?? null, w = t.until, S = !E, d = t.permissions ?? null, m = d ? [] : t.more ?? [], d ? I = X(t.signed, t.signedSensitive) : T = c(A, t.signed), t.check === "overdue" ? await B() : t.check === "due" && B(), x = c(N, t.signedPass), await oe());
  }, C = () => ue ??= (async () => {
    try {
      await $();
    } catch {
    }
  })(), l = (a) => {
    s && window.parent.postMessage(K(a), s);
  }, v = (a) => (n && Date.now() / 1e3 >= w && _(), {
    t: "state",
    ...a ? { id: a } : {},
    unlocked: !!n,
    ...n ? { pubkey: n, until: w, remembered: S } : {},
    ...n && E ? { guest: !0 } : {},
    // The name in their own signed profile, where they have one; else the name the sign-in address knew them by.
    ...n && (p?.name || b) ? { name: p?.name || b } : {},
    ...n && p?.picture ? { picture: p.picture } : {},
    ...n && p?.about ? { about: p.about } : {},
    // An application is told what it was approved for, so it can tell that from what it now wants.
    ...n && d ? { permissions: d } : {},
    // A world is told what more it was let do, so it asks for nothing that isn't there.
    ...n && !d && m.length ? { more: m } : {},
    // What can be asked for here at all, said locked or unlocked. Not to an application: it is held to its set.
    ...d ? {} : { offers: [...Oe] }
  }), fe = async (a) => {
    const t = ee(a.origin);
    if (!t || (s ||= t, t !== s)) return;
    const e = he(a.data);
    if (!e || e.t === "buy" && !ve(F)) return;
    if (await C(), e.t === "state") return l(v(e.id));
    if (e.t === "lock")
      return _(), l(v(e.id));
    if (e.t === "wantFamily")
      return L = !!e.family && e.family === V(s) && ie(e.family), e.guest && L && !n && await $(!0).catch(() => {
      }), l({ ...v(e.id), familyTaken: L, ...e.guest ? { guestTaken: L && E && !!n } : {} });
    if (e.t === "wantMore")
      return U = e.more, l(v(e.id));
    if (e.t === "want") {
      const r = be(s, e.permissions);
      return H = r ? e.permissions : null, Q = !r, l({ ...v(e.id), taken: r });
    }
    if (e.t === "pairCancel")
      return ce?.id, e.id, l(v(e.id));
    if (e.t === "pair")
      return l({ t: "pairing-expired", id: e.id, why: "paused" });
    const i = () => l({ t: "refused", id: e.id });
    if (n && Date.now() / 1e3 >= w && _(), !o || !n) return i();
    if (e.t === "have") {
      const r = le(e.listing);
      return l(r ? { t: "receipt", id: e.id, receipt: r.event } : { t: "none", id: e.id });
    }
    if (e.t === "propose" || e.t === "wallet" || e.t === "pay" || e.t === "tip" || e.t === "buy" || e.t === "guests" || e.t === "file-save" || e.t === "file-pick") {
      const r = d && e.t === "wallet" ? null : e.t === "wallet" ? { what: "wallet" } : e.t === "pay" ? { what: "pay", invoice: e.invoice } : e.t === "tip" ? { what: "tip", sats: e.sats, ...e.to ? { to: e.to } : {} } : e.t === "buy" ? { what: "buy", listing: e.listing } : e.t === "guests" ? d ? null : { what: "guests", world: e.world, list: e.list ?? null, change: e.change, key: e.key, none: e.none } : e.t === "file-pick" ? { what: "pick" } : e.t === "file-save" ? { what: "save", name: e.name, type: e.type, bytes: e.bytes, private: e.private } : /* @__PURE__ */ ((z) => z ? { what: "sign", event: z } : null)(Se(e.event, s, Date.now() / 1e3));
      if (!r || !re[r.what].take(Date.now())) return i();
      O();
      const M = e.id;
      return g = { id: M, ask: r, timer: setTimeout(() => g?.id === M && O(), Me) }, l({ t: "asking", id: M });
    }
    if (e.t === "encrypt" || e.t === "decrypt" || e.t === "read") {
      if (!d || e.t !== "encrypt" && !I.read.take(Date.now())) return i();
      try {
        const r = e.t === "read" ? await o.appDecryptEvent(e.event) : e.t === "encrypt" ? await o.appEncrypt(e.peer, e.text, e.scheme) : await o.appDecrypt(e.peer, e.text, e.scheme);
        return l({ t: "text", id: e.id, text: r });
      } catch {
        return i();
      }
    }
    if (e.t === "save" || e.t === "find" || e.t === "open") {
      if (d) return i();
      try {
        if (e.t === "find") return l({ t: "found", id: e.id, d: await o.worldFind(e.slot) });
        if (e.t === "open") return l({ t: "opened", id: e.id, ...await o.worldOpen(e.event) });
        const r = await o.worldSave(e.slot, e.data);
        return r.pubkey !== n ? i() : l({ t: "signed", id: e.id, event: r });
      } catch {
        return i();
      }
    }
    if (e.t === "follow") {
      if (d || !m.includes("follows")) return i();
      try {
        const r = await o.worldFollow(e.list, e.add ? { add: e.add } : { remove: e.remove });
        return r.pubkey !== n ? i() : l({ t: "signed", id: e.id, event: r });
      } catch {
        return i();
      }
    }
    if (e.t === "score" || e.t === "achieve") {
      if (d) return i();
      try {
        const r = e.t === "score" ? await o.worldScore(e.world, e.board, e.score, { ...e.title ? { title: e.title } : {}, ...e.format ? { format: e.format } : {} }) : await o.worldAchieve(e.world, e.achievement, e.title);
        return r.pubkey !== n ? i() : l({ t: "signed", id: e.id, event: r });
      } catch {
        return i();
      }
    }
    if (e.t === "seal" || e.t === "unwrap" || e.t === "reach") {
      if (d || !m.includes("messages")) return i();
      try {
        if (e.t === "unwrap") return l({ t: "message", id: e.id, message: await o.worldUnwrap(e.event) });
        if (e.t === "reach") {
          const M = await o.worldReach(e.relays);
          return M.pubkey !== n ? i() : l({ t: "signed", id: e.id, event: M });
        }
        const r = await o.worldSeal(e.to, e.text);
        return r.message.pubkey !== n || r.seals.some((M) => M.pubkey !== n) ? i() : l({ t: "sealed", id: e.id, message: r.message, seals: r.seals });
      } catch {
        return i();
      }
    }
    if (e.t === "pass") {
      if (!Ae(d) || e.session === n || !x.take(Date.now())) return i();
      try {
        const r = await o.roomPass(e.session);
        if (r.pubkey !== n) return i();
        l({ t: "signed", id: e.id, event: r }), o.touchSignerGrant(s, T.times(), void 0, x.times()).catch(() => {
        });
      } catch {
        i();
      }
      return;
    }
    const u = Date.now(), f = d ? De(d, e.event, s, u / 1e3) : E ? Ge(e.event, s, u / 1e3) : Ee(e.event, s, u / 1e3);
    if (!f) return i();
    const y = d ? Ie(f.kind) : null;
    if (!(y ? I[y] : T).take(u)) return i();
    try {
      const r = await o.signEvent(f);
      if (r.pubkey !== n) return i();
      l({ t: "signed", id: e.id, event: r }), y ? y !== "quiet" && o.touchSignerGrant(s, I.public.times(), I.sensitive.times()).catch(() => {
      }) : o.touchSignerGrant(s, T.times()).catch(() => {
      });
    } catch {
      i();
    }
  }, pe = async (a, t, e) => {
    if (t.app && t.app.site !== s || t.site && t.site !== s) throw new Error("for another site");
    if (t.family && t.family !== V(s)) throw new Error("for another family");
    p = t.profile ?? null, E = !1, d = t.app?.permissions ?? null, m = d || t.family ? [] : t.more ?? [], I = X(), n = t.pubkey, b = e ?? null, T = c(), x = c(N), O(), Z();
    const u = (t.family && !t.app ? ie(t.family) : Fe(s) !== null) && !m.includes("messages") ? A.grantSec : A.unknownGrantSec;
    w = Math.floor(Date.now() / 1e3) + (t.remember ? u : A.visitSec), S = t.remember === !0 && await a.keepSignerGrant({ site: s, until: w, ...b ? { name: b } : {} }).catch(() => !1), S || (w = Math.min(w, Math.floor(Date.now() / 1e3) + A.visitSec)), P();
  }, we = async (a) => {
    const t = Te(a.data);
    if (!t || !a.source) return;
    const e = (i) => a.source.postMessage(_e(i), F);
    if (t.t === "hello") {
      if (!s) return;
      await C();
      try {
        const i = await (await W()).beginHandoff();
        k = { nonce: t.nonce, from: a.source }, q = k, e({ t: "frame", nonce: t.nonce, world: s, recipient: i, ...H ? { wants: H } : {}, ...Q ? { turnedDown: !0 } : {}, ...!H && U.length ? { more: U } : {}, ...!H && n && !d && m.length ? { has: m } : {}, ...L && !U.length ? { family: !0 } : {}, ...n && g ? { ask: g.ask, pubkey: n } : {} });
      } catch {
      }
      return;
    }
    if (t.t === "answer") {
      if (!k || k.nonce !== t.nonce || k.from !== a.source || t.world !== s) return;
      const i = g;
      if (!i || !n) return e({ t: "done", nonce: t.nonce, ok: !1 });
      clearTimeout(i.timer), g = null;
      let u = { t: "refused", id: i.id };
      if (i.ask.what === "wallet" && ne(t.wallet) && (u = { t: "wallet", id: i.id, uri: ne(t.wallet) }), i.ask.what === "pay" && t.paid?.invoice === i.ask.invoice && (u = { t: "paid", id: i.id, ...t.paid.preimage ? { preimage: t.paid.preimage } : {} }), i.ask.what === "tip" && t.tipped?.sats === i.ask.sats && (u = { t: "paid", id: i.id, ...t.tipped.preimage ? { preimage: t.tipped.preimage } : {} }), i.ask.what === "buy" && t.bought) {
        const f = ae(t.bought.receipt, R);
        He(f, { buyer: n, listing: i.ask.listing, now: Date.now() / 1e3 }) && (u = { t: "bought", id: i.id, receipt: f.event, ...t.bought.delivery ? { delivery: t.bought.delivery } : {} }, h = J([f.event, ...h.filter((y) => y.id !== f.event.id)], n, R), P());
      }
      if (i.ask.what === "guests" && t.listed && Le(t.listed, { pubkey: n, world: i.ask.world, change: i.ask.change, key: i.ask.key, list: i.ask.list, now: Date.now() / 1e3 }) && (u = { t: "signed", id: i.id, event: t.listed }), i.ask.what === "save" && t.saved && (u = { t: "file-saved", id: i.id, ...t.saved }), i.ask.what === "pick" && t.file && (u = { t: "file", id: i.id, ...t.file }), i.ask.what === "sign" && t.event) {
        const f = t.event, y = i.ask.event;
        ge(f) && f.pubkey === n && f.kind === y.kind && f.content === y.content && JSON.stringify(f.tags) === JSON.stringify(y.tags) && Math.abs(f.created_at - Date.now() / 1e3) < 600 && (u = { t: "signed", id: i.id, event: f });
      }
      return l(u), e({ t: "done", nonce: t.nonce, ok: u.t !== "refused" || !t.event && !t.wallet && !t.paid && !t.saved && !t.file && !t.tipped && !t.bought && !t.listed });
    }
    if (t.t === "held") {
      if (!q || q.nonce !== t.nonce || q.from !== a.source || t.world !== s || !n) return;
      h = J(t.receipts, n, R), P();
      return;
    }
    if (t.t === "grant" && !(!k || k.nonce !== t.nonce || k.from !== a.source || t.world !== s)) {
      k = null;
      try {
        const i = await W();
        await pe(i, await i.acceptHandoff(t.sealed), t.name), e({ t: "done", nonce: t.nonce, ok: !0 });
      } catch {
        _(), e({ t: "done", nonce: t.nonce, ok: !1 });
      }
      l(v());
    }
  }, j = (a) => {
    if (a.source === window.parent) return void fe(a);
    a.origin === F && a.source !== window && we(a);
  };
  window.addEventListener("message", j);
  const me = setInterval(() => void B(), 36e5);
  return s && (window.parent.postMessage(K({ t: "ready" }), s), C().then(() => {
    n && l(v());
  })), {
    embedded: !0,
    stop() {
      clearInterval(me), window.removeEventListener("message", j), _();
    }
  };
}
export {
  Be as startEmbeddedSigner
};
