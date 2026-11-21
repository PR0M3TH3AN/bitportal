import { v as de } from "./bitlogin-shared-Cj9s0_W_.js";
import { y as Z, H as u, I as M, J as D, K as G, A as ue, n as fe, U as $, M as B, N as pe, B as we, O as me, Q as ge, G as ve, R as he, V as ye, W as ke, X as be, Y as j, f as z, r as Se, Z as K, _ as Me, $ as De, h as Ae, a0 as Ge } from "./bitlogin-shared-D4lxvcOu.js";
import { c as Ee } from "./bitlogin-shared-BVd_kYfR.js";
import { k as Ie } from "./bitlogin-shared-AERJbEy6.js";
import { f as ee } from "./bitlogin-shared-B-2-3O_E.js";
function _e(te = {}) {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const T = location.origin;
  let r = Z(location.ancestorOrigins?.[0] ?? ""), l = null, a = null, k = null, w = null, m = 0, b = !1, I = u();
  const q = { burst: M.passBurst, perMs: M.perMs, hourly: M.passHourly };
  let _ = u(q), c = null, O = null, C = !1, g = [], x = [], E = { quiet: u(D.quiet), public: u(D.public), sensitive: u(D.sensitive), read: u(D.read) };
  const J = (i = [], t = []) => ({
    quiet: u(D.quiet),
    public: u(D.public, i),
    sensitive: u(D.sensitive, t),
    read: u(D.read)
  });
  let v = null;
  const ne = { sign: u(G), wallet: u(G), pay: u(G), tip: u(G), buy: u(G), save: u(G), pick: u(G) }, R = () => {
    if (!v) return;
    clearTimeout(v.timer);
    const { id: i } = v;
    v = null, r && window.parent.postMessage(B({ t: "refused", id: i }), r);
  };
  let h = null, N = null;
  const V = ue(T) ? fe(document.documentElement.dataset.unlockService) : null, H = V ? [...$, V] : $;
  let y = [];
  const F = () => {
    b && a && r && l?.holdReceipts(r, y).catch(() => {
    });
  }, ie = async () => {
    y = [], !(!a || !r || !l) && (y = K(await l.heldReceipts(r).catch(() => []), a, H));
  }, Q = () => {
    y = [];
  }, ae = (i) => a ? Ae(y.map((t) => z(t, H)).filter((t) => !!t), { buyer: a, listing: i, now: Date.now() / 1e3 }) : null, P = async () => l ??= await Ee(te), re = () => {
    R();
    const i = l;
    l = null, a = null, k = null, w = null, m = 0, b = !1, c = null, y = [], i?.destroy();
  }, W = async () => {
    const i = l;
    !i || !a || !b || !r || await i.checkTakenBack(r).catch(() => "ok") === "ok" || l !== i || (re(), d(A()));
  }, L = () => {
    R();
    const i = l, t = r;
    l = null, a = null, k = null, w = null, m = 0, b = !1, c = null, g = [], Q(), i && (t ? i.forgetSignerGrant(t) : Promise.resolve()).catch(() => {
    }).finally(() => i.destroy());
  };
  let se = null;
  const U = () => se ??= (async () => {
    if (r)
      try {
        const i = await (await P()).restoreSignerGrant(r, ee(r) || void 0);
        if (!i) return;
        a = i.pubkey, k = i.name ?? null, w = i.profile ?? null, m = i.until, b = !0, c = i.permissions ?? null, g = c ? [] : i.more ?? [], c ? E = J(i.signed, i.signedSensitive) : I = u(M, i.signed), i.check === "overdue" ? await W() : i.check === "due" && W(), _ = u(q, i.signedPass), await ie();
      } catch {
      }
  })(), d = (i) => {
    r && window.parent.postMessage(B(i), r);
  }, A = (i) => (a && Date.now() / 1e3 >= m && L(), {
    t: "state",
    ...i ? { id: i } : {},
    unlocked: !!a,
    ...a ? { pubkey: a, until: m, remembered: b } : {},
    // The name in their own signed profile, where they have one; else the name the sign-in address knew them by.
    ...a && (w?.name || k) ? { name: w?.name || k } : {},
    ...a && w?.picture ? { picture: w.picture } : {},
    ...a && w?.about ? { about: w.about } : {},
    // An application is told what it was approved for, so it can tell that from what it now wants.
    ...a && c ? { permissions: c } : {},
    // A world is told what more it was let do, so it asks for nothing that isn't there.
    ...a && !c && g.length ? { more: g } : {},
    // What can be asked for here at all, said locked or unlocked. Not to an application: it is held to its set.
    ...c ? {} : { offers: [...De] }
  }), oe = async (i) => {
    const t = Z(i.origin);
    if (!t || (r ||= t, t !== r)) return;
    const e = pe(i.data);
    if (!e || e.t === "buy" && !we(T)) return;
    if (await U(), e.t === "state") return d(A(e.id));
    if (e.t === "lock")
      return L(), d(A(e.id));
    if (e.t === "wantMore")
      return x = e.more, d(A(e.id));
    if (e.t === "want") {
      const s = me(r, e.permissions);
      return O = s ? e.permissions : null, C = !s, d({ ...A(e.id), taken: s });
    }
    const n = () => d({ t: "refused", id: e.id });
    if (a && Date.now() / 1e3 >= m && L(), !l || !a) return n();
    if (e.t === "have") {
      const s = ae(e.listing);
      return d(s ? { t: "receipt", id: e.id, receipt: s.event } : { t: "none", id: e.id });
    }
    if (e.t === "propose" || e.t === "wallet" || e.t === "pay" || e.t === "tip" || e.t === "buy" || e.t === "file-save" || e.t === "file-pick") {
      const s = c && e.t === "wallet" ? null : e.t === "wallet" ? { what: "wallet" } : e.t === "pay" ? { what: "pay", invoice: e.invoice } : e.t === "tip" ? { what: "tip", sats: e.sats, ...e.to ? { to: e.to } : {} } : e.t === "buy" ? { what: "buy", listing: e.listing } : e.t === "file-pick" ? { what: "pick" } : e.t === "file-save" ? { what: "save", name: e.name, type: e.type, bytes: e.bytes, private: e.private } : /* @__PURE__ */ ((Y) => Y ? { what: "sign", event: Y } : null)(ge(e.event, r, Date.now() / 1e3));
      if (!s || !ne[s.what].take(Date.now())) return n();
      R();
      const S = e.id;
      return v = { id: S, ask: s, timer: setTimeout(() => v?.id === S && R(), ve) }, d({ t: "asking", id: S });
    }
    if (e.t === "encrypt" || e.t === "decrypt" || e.t === "read") {
      if (!c || e.t !== "encrypt" && !E.read.take(Date.now())) return n();
      try {
        const s = e.t === "read" ? await l.appDecryptEvent(e.event) : e.t === "encrypt" ? await l.appEncrypt(e.peer, e.text, e.scheme) : await l.appDecrypt(e.peer, e.text, e.scheme);
        return d({ t: "text", id: e.id, text: s });
      } catch {
        return n();
      }
    }
    if (e.t === "save" || e.t === "find" || e.t === "open") {
      if (c) return n();
      try {
        if (e.t === "find") return d({ t: "found", id: e.id, d: await l.worldFind(e.slot) });
        if (e.t === "open") return d({ t: "opened", id: e.id, ...await l.worldOpen(e.event) });
        const s = await l.worldSave(e.slot, e.data);
        return s.pubkey !== a ? n() : d({ t: "signed", id: e.id, event: s });
      } catch {
        return n();
      }
    }
    if (e.t === "follow") {
      if (c || !g.includes("follows")) return n();
      try {
        const s = await l.worldFollow(e.list, e.add ? { add: e.add } : { remove: e.remove });
        return s.pubkey !== a ? n() : d({ t: "signed", id: e.id, event: s });
      } catch {
        return n();
      }
    }
    if (e.t === "score" || e.t === "achieve") {
      if (c) return n();
      try {
        const s = e.t === "score" ? await l.worldScore(e.world, e.board, e.score, { ...e.title ? { title: e.title } : {}, ...e.format ? { format: e.format } : {} }) : await l.worldAchieve(e.world, e.achievement, e.title);
        return s.pubkey !== a ? n() : d({ t: "signed", id: e.id, event: s });
      } catch {
        return n();
      }
    }
    if (e.t === "seal" || e.t === "unwrap" || e.t === "reach") {
      if (c || !g.includes("messages")) return n();
      try {
        if (e.t === "unwrap") return d({ t: "message", id: e.id, message: await l.worldUnwrap(e.event) });
        if (e.t === "reach") {
          const S = await l.worldReach(e.relays);
          return S.pubkey !== a ? n() : d({ t: "signed", id: e.id, event: S });
        }
        const s = await l.worldSeal(e.to, e.text);
        return s.message.pubkey !== a || s.seals.some((S) => S.pubkey !== a) ? n() : d({ t: "sealed", id: e.id, message: s.message, seals: s.seals });
      } catch {
        return n();
      }
    }
    if (e.t === "pass") {
      if (c || e.session === a || !_.take(Date.now())) return n();
      try {
        const s = await l.roomPass(e.session);
        if (s.pubkey !== a) return n();
        d({ t: "signed", id: e.id, event: s }), l.touchSignerGrant(r, I.times(), void 0, _.times()).catch(() => {
        });
      } catch {
        n();
      }
      return;
    }
    const o = Date.now(), f = c ? he(c, e.event, r, o / 1e3) : ye(e.event, r, o / 1e3);
    if (!f) return n();
    const p = c ? ke(f.kind) : null;
    if (!(p ? E[p] : I).take(o)) return n();
    try {
      const s = await l.signEvent(f);
      if (s.pubkey !== a) return n();
      d({ t: "signed", id: e.id, event: s }), p ? p !== "quiet" && l.touchSignerGrant(r, E.public.times(), E.sensitive.times()).catch(() => {
      }) : l.touchSignerGrant(r, I.times()).catch(() => {
      });
    } catch {
      n();
    }
  }, le = async (i) => {
    const t = be(i.data);
    if (!t || !i.source) return;
    const e = (n) => i.source.postMessage(Ge(n), T);
    if (t.t === "hello") {
      if (!r) return;
      await U();
      try {
        const n = await (await P()).beginHandoff();
        h = { nonce: t.nonce, from: i.source }, N = h, e({ t: "frame", nonce: t.nonce, world: r, recipient: n, ...O ? { wants: O } : {}, ...C ? { turnedDown: !0 } : {}, ...!O && x.length ? { more: x } : {}, ...!O && a && !c && g.length ? { has: g } : {}, ...a && v ? { ask: v.ask, pubkey: a } : {} });
      } catch {
      }
      return;
    }
    if (t.t === "answer") {
      if (!h || h.nonce !== t.nonce || h.from !== i.source || t.world !== r) return;
      const n = v;
      if (!n || !a) return e({ t: "done", nonce: t.nonce, ok: !1 });
      clearTimeout(n.timer), v = null;
      let o = { t: "refused", id: n.id };
      if (n.ask.what === "wallet" && j(t.wallet) && (o = { t: "wallet", id: n.id, uri: j(t.wallet) }), n.ask.what === "pay" && t.paid?.invoice === n.ask.invoice && (o = { t: "paid", id: n.id, ...t.paid.preimage ? { preimage: t.paid.preimage } : {} }), n.ask.what === "tip" && t.tipped?.sats === n.ask.sats && (o = { t: "paid", id: n.id, ...t.tipped.preimage ? { preimage: t.tipped.preimage } : {} }), n.ask.what === "buy" && t.bought) {
        const f = z(t.bought.receipt, H);
        Se(f, { buyer: a, listing: n.ask.listing, now: Date.now() / 1e3 }) && (o = { t: "bought", id: n.id, receipt: f.event, ...t.bought.delivery ? { delivery: t.bought.delivery } : {} }, y = K([f.event, ...y.filter((p) => p.id !== f.event.id)], a, H), F());
      }
      if (n.ask.what === "save" && t.saved && (o = { t: "file-saved", id: n.id, ...t.saved }), n.ask.what === "pick" && t.file && (o = { t: "file", id: n.id, ...t.file }), n.ask.what === "sign" && t.event) {
        const f = t.event, p = n.ask.event;
        de(f) && f.pubkey === a && f.kind === p.kind && f.content === p.content && JSON.stringify(f.tags) === JSON.stringify(p.tags) && Math.abs(f.created_at - Date.now() / 1e3) < 600 && (o = { t: "signed", id: n.id, event: f });
      }
      return d(o), e({ t: "done", nonce: t.nonce, ok: o.t !== "refused" || !t.event && !t.wallet && !t.paid && !t.saved && !t.file && !t.tipped && !t.bought });
    }
    if (t.t === "held") {
      if (!N || N.nonce !== t.nonce || N.from !== i.source || t.world !== r || !a) return;
      y = K(t.receipts, a, H), F();
      return;
    }
    if (t.t === "grant" && !(!h || h.nonce !== t.nonce || h.from !== i.source || t.world !== r)) {
      h = null;
      try {
        const n = await P(), o = await n.acceptHandoff(t.sealed);
        if (o.app && o.app.site !== r || o.site && o.site !== r) throw new Error("for another site");
        if (o.family && o.family !== ee(r)) throw new Error("for another family");
        w = o.profile ?? null, c = o.app?.permissions ?? null, g = c || o.family ? [] : o.more ?? [], E = J(), a = o.pubkey, k = t.name ?? null, I = u(), _ = u(q), R(), Q();
        const p = (o.family ? Ie(o.family) : Me(r) !== null) && !g.includes("messages") ? M.grantSec : M.unknownGrantSec;
        m = Math.floor(Date.now() / 1e3) + (o.remember ? p : M.visitSec), b = o.remember === !0 && await n.keepSignerGrant({ site: r, until: m, ...k ? { name: k } : {} }).catch(() => !1), b || (m = Math.min(m, Math.floor(Date.now() / 1e3) + M.visitSec)), F(), e({ t: "done", nonce: t.nonce, ok: !0 });
      } catch {
        L(), e({ t: "done", nonce: t.nonce, ok: !1 });
      }
      d(A());
    }
  }, X = (i) => {
    if (i.source === window.parent) return void oe(i);
    i.origin === T && i.source !== window && le(i);
  };
  window.addEventListener("message", X);
  const ce = setInterval(() => void W(), 36e5);
  return r && (window.parent.postMessage(B({ t: "ready" }), r), U().then(() => {
    a && d(A());
  })), {
    embedded: !0,
    stop() {
      clearInterval(ce), window.removeEventListener("message", X), L();
    }
  };
}
export {
  _e as startEmbeddedSigner
};
