import { v as fe } from "./bitlogin-shared-Cj9s0_W_.js";
import { y as j, H as u, I as D, J as A, K as G, A as pe, n as we, U as z, M as K, N as me, B as ge, O as ee, Q as ye, R as he, G as ke, V as ve, W as be, X as Se, Y as Me, Z as te, f as ne, r as De, _ as C, $ as Ae, a0 as Ge, a1 as Ee, h as Ie, a2 as Te } from "./bitlogin-shared-DVgIEj88.js";
import { c as Le } from "./bitlogin-shared-DFaGPwU-.js";
import { f as J } from "./bitlogin-shared-B4ZbP95F.js";
const Oe = { burst: 10, perMs: 6e4, hourly: 60 };
function Ne(ie = {}) {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const H = location.origin;
  let s = j(location.ancestorOrigins?.[0] ?? ""), l = null, a = null, v = null, w = null, m = 0, b = !1, I = u();
  const q = { burst: D.passBurst, perMs: D.perMs, hourly: D.passHourly };
  let _ = u(q), d = null, T = null, V = !1, g = [], F = [], x = !1, E = { quiet: u(A.quiet), public: u(A.public), sensitive: u(A.sensitive), read: u(A.read) };
  const Q = (i = [], t = []) => ({
    quiet: u(A.quiet),
    public: u(A.public, i),
    sensitive: u(A.sensitive, t),
    read: u(A.read)
  });
  let y = null;
  const ae = { sign: u(G), wallet: u(G), pay: u(G), tip: u(G), buy: u(G), guests: u(Oe), save: u(G), pick: u(G) }, L = () => {
    if (!y) return;
    clearTimeout(y.timer);
    const { id: i } = y;
    y = null, s && window.parent.postMessage(K({ t: "refused", id: i }), s);
  };
  let h = null, N = null;
  const X = pe(H) ? we(document.documentElement.dataset.unlockService) : null, O = X ? [...z, X] : z;
  let k = [];
  const P = () => {
    b && a && s && l?.holdReceipts(s, k).catch(() => {
    });
  }, se = async () => {
    k = [], !(!a || !s || !l) && (k = C(await l.heldReceipts(s).catch(() => []), a, O));
  }, Y = () => {
    k = [];
  }, re = (i) => a ? Ie(k.map((t) => ne(t, O)).filter((t) => !!t), { buyer: a, listing: i, now: Date.now() / 1e3 }) : null, U = async () => l ??= await Le(ie), oe = () => {
    L();
    const i = l;
    l = null, a = null, v = null, w = null, m = 0, b = !1, d = null, k = [], i?.destroy();
  }, W = async () => {
    const i = l;
    !i || !a || !b || !s || await i.checkTakenBack(s).catch(() => "ok") === "ok" || l !== i || (oe(), c(S()));
  }, R = () => {
    L();
    const i = l, t = s;
    l = null, a = null, v = null, w = null, m = 0, b = !1, d = null, g = [], Y(), i && (t ? i.forgetSignerGrant(t) : Promise.resolve()).catch(() => {
    }).finally(() => i.destroy());
  };
  let le = null;
  const B = () => le ??= (async () => {
    if (s)
      try {
        const i = await (await U()).restoreSignerGrant(s, J(s) || void 0);
        if (!i) return;
        a = i.pubkey, v = i.name ?? null, w = i.profile ?? null, m = i.until, b = !0, d = i.permissions ?? null, g = d ? [] : i.more ?? [], d ? E = Q(i.signed, i.signedSensitive) : I = u(D, i.signed), i.check === "overdue" ? await W() : i.check === "due" && W(), _ = u(q, i.signedPass), await se();
      } catch {
      }
  })(), c = (i) => {
    s && window.parent.postMessage(K(i), s);
  }, S = (i) => (a && Date.now() / 1e3 >= m && R(), {
    t: "state",
    ...i ? { id: i } : {},
    unlocked: !!a,
    ...a ? { pubkey: a, until: m, remembered: b } : {},
    // The name in their own signed profile, where they have one; else the name the sign-in address knew them by.
    ...a && (w?.name || v) ? { name: w?.name || v } : {},
    ...a && w?.picture ? { picture: w.picture } : {},
    ...a && w?.about ? { about: w.about } : {},
    // An application is told what it was approved for, so it can tell that from what it now wants.
    ...a && d ? { permissions: d } : {},
    // A world is told what more it was let do, so it asks for nothing that isn't there.
    ...a && !d && g.length ? { more: g } : {},
    // What can be asked for here at all, said locked or unlocked. Not to an application: it is held to its set.
    ...d ? {} : { offers: [...Ee] }
  }), de = async (i) => {
    const t = j(i.origin);
    if (!t || (s ||= t, t !== s)) return;
    const e = me(i.data);
    if (!e || e.t === "buy" && !ge(H)) return;
    if (await B(), e.t === "state") return c(S(e.id));
    if (e.t === "lock")
      return R(), c(S(e.id));
    if (e.t === "wantFamily")
      return x = !!e.family && e.family === J(s) && ee(e.family), c({ ...S(e.id), familyTaken: x });
    if (e.t === "wantMore")
      return F = e.more, c(S(e.id));
    if (e.t === "want") {
      const r = ye(s, e.permissions);
      return T = r ? e.permissions : null, V = !r, c({ ...S(e.id), taken: r });
    }
    const n = () => c({ t: "refused", id: e.id });
    if (a && Date.now() / 1e3 >= m && R(), !l || !a) return n();
    if (e.t === "have") {
      const r = re(e.listing);
      return c(r ? { t: "receipt", id: e.id, receipt: r.event } : { t: "none", id: e.id });
    }
    if (e.t === "propose" || e.t === "wallet" || e.t === "pay" || e.t === "tip" || e.t === "buy" || e.t === "guests" || e.t === "file-save" || e.t === "file-pick") {
      const r = d && e.t === "wallet" ? null : e.t === "wallet" ? { what: "wallet" } : e.t === "pay" ? { what: "pay", invoice: e.invoice } : e.t === "tip" ? { what: "tip", sats: e.sats, ...e.to ? { to: e.to } : {} } : e.t === "buy" ? { what: "buy", listing: e.listing } : e.t === "guests" ? d ? null : { what: "guests", world: e.world, list: e.list ?? null, change: e.change, key: e.key, none: e.none } : e.t === "file-pick" ? { what: "pick" } : e.t === "file-save" ? { what: "save", name: e.name, type: e.type, bytes: e.bytes, private: e.private } : /* @__PURE__ */ (($) => $ ? { what: "sign", event: $ } : null)(he(e.event, s, Date.now() / 1e3));
      if (!r || !ae[r.what].take(Date.now())) return n();
      L();
      const M = e.id;
      return y = { id: M, ask: r, timer: setTimeout(() => y?.id === M && L(), ke) }, c({ t: "asking", id: M });
    }
    if (e.t === "encrypt" || e.t === "decrypt" || e.t === "read") {
      if (!d || e.t !== "encrypt" && !E.read.take(Date.now())) return n();
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
        return r.pubkey !== a ? n() : c({ t: "signed", id: e.id, event: r });
      } catch {
        return n();
      }
    }
    if (e.t === "follow") {
      if (d || !g.includes("follows")) return n();
      try {
        const r = await l.worldFollow(e.list, e.add ? { add: e.add } : { remove: e.remove });
        return r.pubkey !== a ? n() : c({ t: "signed", id: e.id, event: r });
      } catch {
        return n();
      }
    }
    if (e.t === "score" || e.t === "achieve") {
      if (d) return n();
      try {
        const r = e.t === "score" ? await l.worldScore(e.world, e.board, e.score, { ...e.title ? { title: e.title } : {}, ...e.format ? { format: e.format } : {} }) : await l.worldAchieve(e.world, e.achievement, e.title);
        return r.pubkey !== a ? n() : c({ t: "signed", id: e.id, event: r });
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
          return M.pubkey !== a ? n() : c({ t: "signed", id: e.id, event: M });
        }
        const r = await l.worldSeal(e.to, e.text);
        return r.message.pubkey !== a || r.seals.some((M) => M.pubkey !== a) ? n() : c({ t: "sealed", id: e.id, message: r.message, seals: r.seals });
      } catch {
        return n();
      }
    }
    if (e.t === "pass") {
      if (d || e.session === a || !_.take(Date.now())) return n();
      try {
        const r = await l.roomPass(e.session);
        if (r.pubkey !== a) return n();
        c({ t: "signed", id: e.id, event: r }), l.touchSignerGrant(s, I.times(), void 0, _.times()).catch(() => {
        });
      } catch {
        n();
      }
      return;
    }
    const o = Date.now(), f = d ? ve(d, e.event, s, o / 1e3) : be(e.event, s, o / 1e3);
    if (!f) return n();
    const p = d ? Se(f.kind) : null;
    if (!(p ? E[p] : I).take(o)) return n();
    try {
      const r = await l.signEvent(f);
      if (r.pubkey !== a) return n();
      c({ t: "signed", id: e.id, event: r }), p ? p !== "quiet" && l.touchSignerGrant(s, E.public.times(), E.sensitive.times()).catch(() => {
      }) : l.touchSignerGrant(s, I.times()).catch(() => {
      });
    } catch {
      n();
    }
  }, ce = async (i) => {
    const t = Me(i.data);
    if (!t || !i.source) return;
    const e = (n) => i.source.postMessage(Te(n), H);
    if (t.t === "hello") {
      if (!s) return;
      await B();
      try {
        const n = await (await U()).beginHandoff();
        h = { nonce: t.nonce, from: i.source }, N = h, e({ t: "frame", nonce: t.nonce, world: s, recipient: n, ...T ? { wants: T } : {}, ...V ? { turnedDown: !0 } : {}, ...!T && F.length ? { more: F } : {}, ...!T && a && !d && g.length ? { has: g } : {}, ...x && !F.length ? { family: !0 } : {}, ...a && y ? { ask: y.ask, pubkey: a } : {} });
      } catch {
      }
      return;
    }
    if (t.t === "answer") {
      if (!h || h.nonce !== t.nonce || h.from !== i.source || t.world !== s) return;
      const n = y;
      if (!n || !a) return e({ t: "done", nonce: t.nonce, ok: !1 });
      clearTimeout(n.timer), y = null;
      let o = { t: "refused", id: n.id };
      if (n.ask.what === "wallet" && te(t.wallet) && (o = { t: "wallet", id: n.id, uri: te(t.wallet) }), n.ask.what === "pay" && t.paid?.invoice === n.ask.invoice && (o = { t: "paid", id: n.id, ...t.paid.preimage ? { preimage: t.paid.preimage } : {} }), n.ask.what === "tip" && t.tipped?.sats === n.ask.sats && (o = { t: "paid", id: n.id, ...t.tipped.preimage ? { preimage: t.tipped.preimage } : {} }), n.ask.what === "buy" && t.bought) {
        const f = ne(t.bought.receipt, O);
        De(f, { buyer: a, listing: n.ask.listing, now: Date.now() / 1e3 }) && (o = { t: "bought", id: n.id, receipt: f.event, ...t.bought.delivery ? { delivery: t.bought.delivery } : {} }, k = C([f.event, ...k.filter((p) => p.id !== f.event.id)], a, O), P());
      }
      if (n.ask.what === "guests" && t.listed && Ae(t.listed, { pubkey: a, world: n.ask.world, change: n.ask.change, key: n.ask.key, list: n.ask.list, now: Date.now() / 1e3 }) && (o = { t: "signed", id: n.id, event: t.listed }), n.ask.what === "save" && t.saved && (o = { t: "file-saved", id: n.id, ...t.saved }), n.ask.what === "pick" && t.file && (o = { t: "file", id: n.id, ...t.file }), n.ask.what === "sign" && t.event) {
        const f = t.event, p = n.ask.event;
        fe(f) && f.pubkey === a && f.kind === p.kind && f.content === p.content && JSON.stringify(f.tags) === JSON.stringify(p.tags) && Math.abs(f.created_at - Date.now() / 1e3) < 600 && (o = { t: "signed", id: n.id, event: f });
      }
      return c(o), e({ t: "done", nonce: t.nonce, ok: o.t !== "refused" || !t.event && !t.wallet && !t.paid && !t.saved && !t.file && !t.tipped && !t.bought && !t.listed });
    }
    if (t.t === "held") {
      if (!N || N.nonce !== t.nonce || N.from !== i.source || t.world !== s || !a) return;
      k = C(t.receipts, a, O), P();
      return;
    }
    if (t.t === "grant" && !(!h || h.nonce !== t.nonce || h.from !== i.source || t.world !== s)) {
      h = null;
      try {
        const n = await U(), o = await n.acceptHandoff(t.sealed);
        if (o.app && o.app.site !== s || o.site && o.site !== s) throw new Error("for another site");
        if (o.family && o.family !== J(s)) throw new Error("for another family");
        w = o.profile ?? null, d = o.app?.permissions ?? null, g = d || o.family ? [] : o.more ?? [], E = Q(), a = o.pubkey, v = t.name ?? null, I = u(), _ = u(q), L(), Y();
        const p = (o.family && !o.app ? ee(o.family) : Ge(s) !== null) && !g.includes("messages") ? D.grantSec : D.unknownGrantSec;
        m = Math.floor(Date.now() / 1e3) + (o.remember ? p : D.visitSec), b = o.remember === !0 && await n.keepSignerGrant({ site: s, until: m, ...v ? { name: v } : {} }).catch(() => !1), b || (m = Math.min(m, Math.floor(Date.now() / 1e3) + D.visitSec)), P(), e({ t: "done", nonce: t.nonce, ok: !0 });
      } catch {
        R(), e({ t: "done", nonce: t.nonce, ok: !1 });
      }
      c(S());
    }
  }, Z = (i) => {
    if (i.source === window.parent) return void de(i);
    i.origin === H && i.source !== window && ce(i);
  };
  window.addEventListener("message", Z);
  const ue = setInterval(() => void W(), 36e5);
  return s && (window.parent.postMessage(K({ t: "ready" }), s), B().then(() => {
    a && c(S());
  })), {
    embedded: !0,
    stop() {
      clearInterval(ue), window.removeEventListener("message", Z), R();
    }
  };
}
export {
  Ne as startEmbeddedSigner
};
