import { v as ce } from "./bitlogin-shared-Cj9s0_W_.js";
import { y as Z, H as u, I as M, J as D, K as G, A as ue, n as fe, U as $, M as B, N as pe, B as we, O as me, Q as ge, G as he, R as ke, V as ye, W as ve, X as be, Y as j, f as z, r as Se, Z as K, _ as Me, $ as De, a0 as Ae, h as Ge, a1 as Ee } from "./bitlogin-shared-BosVxhRE.js";
import { c as Ie } from "./bitlogin-shared-DFaGPwU-.js";
import { k as Le } from "./bitlogin-shared-ocmFRDk5.js";
import { f as ee } from "./bitlogin-shared-BfA24Ad_.js";
const Oe = { burst: 10, perMs: 6e4, hourly: 60 };
function qe(te = {}) {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const H = location.origin;
  let s = Z(location.ancestorOrigins?.[0] ?? ""), l = null, a = null, v = null, w = null, m = 0, b = !1, I = u();
  const q = { burst: M.passBurst, perMs: M.perMs, hourly: M.passHourly };
  let _ = u(q), d = null, L = null, C = !1, g = [], x = [], E = { quiet: u(D.quiet), public: u(D.public), sensitive: u(D.sensitive), read: u(D.read) };
  const J = (i = [], t = []) => ({
    quiet: u(D.quiet),
    public: u(D.public, i),
    sensitive: u(D.sensitive, t),
    read: u(D.read)
  });
  let h = null;
  const ne = { sign: u(G), wallet: u(G), pay: u(G), tip: u(G), buy: u(G), guests: u(Oe), save: u(G), pick: u(G) }, O = () => {
    if (!h) return;
    clearTimeout(h.timer);
    const { id: i } = h;
    h = null, s && window.parent.postMessage(B({ t: "refused", id: i }), s);
  };
  let k = null, N = null;
  const V = ue(H) ? fe(document.documentElement.dataset.unlockService) : null, R = V ? [...$, V] : $;
  let y = [];
  const F = () => {
    b && a && s && l?.holdReceipts(s, y).catch(() => {
    });
  }, ie = async () => {
    y = [], !(!a || !s || !l) && (y = K(await l.heldReceipts(s).catch(() => []), a, R));
  }, Q = () => {
    y = [];
  }, ae = (i) => a ? Ge(y.map((t) => z(t, R)).filter((t) => !!t), { buyer: a, listing: i, now: Date.now() / 1e3 }) : null, P = async () => l ??= await Ie(te), se = () => {
    O();
    const i = l;
    l = null, a = null, v = null, w = null, m = 0, b = !1, d = null, y = [], i?.destroy();
  }, U = async () => {
    const i = l;
    !i || !a || !b || !s || await i.checkTakenBack(s).catch(() => "ok") === "ok" || l !== i || (se(), c(A()));
  }, T = () => {
    O();
    const i = l, t = s;
    l = null, a = null, v = null, w = null, m = 0, b = !1, d = null, g = [], Q(), i && (t ? i.forgetSignerGrant(t) : Promise.resolve()).catch(() => {
    }).finally(() => i.destroy());
  };
  let re = null;
  const W = () => re ??= (async () => {
    if (s)
      try {
        const i = await (await P()).restoreSignerGrant(s, ee(s) || void 0);
        if (!i) return;
        a = i.pubkey, v = i.name ?? null, w = i.profile ?? null, m = i.until, b = !0, d = i.permissions ?? null, g = d ? [] : i.more ?? [], d ? E = J(i.signed, i.signedSensitive) : I = u(M, i.signed), i.check === "overdue" ? await U() : i.check === "due" && U(), _ = u(q, i.signedPass), await ie();
      } catch {
      }
  })(), c = (i) => {
    s && window.parent.postMessage(B(i), s);
  }, A = (i) => (a && Date.now() / 1e3 >= m && T(), {
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
    ...d ? {} : { offers: [...Ae] }
  }), oe = async (i) => {
    const t = Z(i.origin);
    if (!t || (s ||= t, t !== s)) return;
    const e = pe(i.data);
    if (!e || e.t === "buy" && !we(H)) return;
    if (await W(), e.t === "state") return c(A(e.id));
    if (e.t === "lock")
      return T(), c(A(e.id));
    if (e.t === "wantMore")
      return x = e.more, c(A(e.id));
    if (e.t === "want") {
      const r = me(s, e.permissions);
      return L = r ? e.permissions : null, C = !r, c({ ...A(e.id), taken: r });
    }
    const n = () => c({ t: "refused", id: e.id });
    if (a && Date.now() / 1e3 >= m && T(), !l || !a) return n();
    if (e.t === "have") {
      const r = ae(e.listing);
      return c(r ? { t: "receipt", id: e.id, receipt: r.event } : { t: "none", id: e.id });
    }
    if (e.t === "propose" || e.t === "wallet" || e.t === "pay" || e.t === "tip" || e.t === "buy" || e.t === "guests" || e.t === "file-save" || e.t === "file-pick") {
      const r = d && e.t === "wallet" ? null : e.t === "wallet" ? { what: "wallet" } : e.t === "pay" ? { what: "pay", invoice: e.invoice } : e.t === "tip" ? { what: "tip", sats: e.sats, ...e.to ? { to: e.to } : {} } : e.t === "buy" ? { what: "buy", listing: e.listing } : e.t === "guests" ? d ? null : { what: "guests", world: e.world, list: e.list ?? null, change: e.change, key: e.key, none: e.none } : e.t === "file-pick" ? { what: "pick" } : e.t === "file-save" ? { what: "save", name: e.name, type: e.type, bytes: e.bytes, private: e.private } : /* @__PURE__ */ ((Y) => Y ? { what: "sign", event: Y } : null)(ge(e.event, s, Date.now() / 1e3));
      if (!r || !ne[r.what].take(Date.now())) return n();
      O();
      const S = e.id;
      return h = { id: S, ask: r, timer: setTimeout(() => h?.id === S && O(), he) }, c({ t: "asking", id: S });
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
          const S = await l.worldReach(e.relays);
          return S.pubkey !== a ? n() : c({ t: "signed", id: e.id, event: S });
        }
        const r = await l.worldSeal(e.to, e.text);
        return r.message.pubkey !== a || r.seals.some((S) => S.pubkey !== a) ? n() : c({ t: "sealed", id: e.id, message: r.message, seals: r.seals });
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
    const o = Date.now(), f = d ? ke(d, e.event, s, o / 1e3) : ye(e.event, s, o / 1e3);
    if (!f) return n();
    const p = d ? ve(f.kind) : null;
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
  }, le = async (i) => {
    const t = be(i.data);
    if (!t || !i.source) return;
    const e = (n) => i.source.postMessage(Ee(n), H);
    if (t.t === "hello") {
      if (!s) return;
      await W();
      try {
        const n = await (await P()).beginHandoff();
        k = { nonce: t.nonce, from: i.source }, N = k, e({ t: "frame", nonce: t.nonce, world: s, recipient: n, ...L ? { wants: L } : {}, ...C ? { turnedDown: !0 } : {}, ...!L && x.length ? { more: x } : {}, ...!L && a && !d && g.length ? { has: g } : {}, ...a && h ? { ask: h.ask, pubkey: a } : {} });
      } catch {
      }
      return;
    }
    if (t.t === "answer") {
      if (!k || k.nonce !== t.nonce || k.from !== i.source || t.world !== s) return;
      const n = h;
      if (!n || !a) return e({ t: "done", nonce: t.nonce, ok: !1 });
      clearTimeout(n.timer), h = null;
      let o = { t: "refused", id: n.id };
      if (n.ask.what === "wallet" && j(t.wallet) && (o = { t: "wallet", id: n.id, uri: j(t.wallet) }), n.ask.what === "pay" && t.paid?.invoice === n.ask.invoice && (o = { t: "paid", id: n.id, ...t.paid.preimage ? { preimage: t.paid.preimage } : {} }), n.ask.what === "tip" && t.tipped?.sats === n.ask.sats && (o = { t: "paid", id: n.id, ...t.tipped.preimage ? { preimage: t.tipped.preimage } : {} }), n.ask.what === "buy" && t.bought) {
        const f = z(t.bought.receipt, R);
        Se(f, { buyer: a, listing: n.ask.listing, now: Date.now() / 1e3 }) && (o = { t: "bought", id: n.id, receipt: f.event, ...t.bought.delivery ? { delivery: t.bought.delivery } : {} }, y = K([f.event, ...y.filter((p) => p.id !== f.event.id)], a, R), F());
      }
      if (n.ask.what === "guests" && t.listed && Me(t.listed, { pubkey: a, world: n.ask.world, change: n.ask.change, key: n.ask.key, list: n.ask.list, now: Date.now() / 1e3 }) && (o = { t: "signed", id: n.id, event: t.listed }), n.ask.what === "save" && t.saved && (o = { t: "file-saved", id: n.id, ...t.saved }), n.ask.what === "pick" && t.file && (o = { t: "file", id: n.id, ...t.file }), n.ask.what === "sign" && t.event) {
        const f = t.event, p = n.ask.event;
        ce(f) && f.pubkey === a && f.kind === p.kind && f.content === p.content && JSON.stringify(f.tags) === JSON.stringify(p.tags) && Math.abs(f.created_at - Date.now() / 1e3) < 600 && (o = { t: "signed", id: n.id, event: f });
      }
      return c(o), e({ t: "done", nonce: t.nonce, ok: o.t !== "refused" || !t.event && !t.wallet && !t.paid && !t.saved && !t.file && !t.tipped && !t.bought && !t.listed });
    }
    if (t.t === "held") {
      if (!N || N.nonce !== t.nonce || N.from !== i.source || t.world !== s || !a) return;
      y = K(t.receipts, a, R), F();
      return;
    }
    if (t.t === "grant" && !(!k || k.nonce !== t.nonce || k.from !== i.source || t.world !== s)) {
      k = null;
      try {
        const n = await P(), o = await n.acceptHandoff(t.sealed);
        if (o.app && o.app.site !== s || o.site && o.site !== s) throw new Error("for another site");
        if (o.family && o.family !== ee(s)) throw new Error("for another family");
        w = o.profile ?? null, d = o.app?.permissions ?? null, g = d || o.family ? [] : o.more ?? [], E = J(), a = o.pubkey, v = t.name ?? null, I = u(), _ = u(q), O(), Q();
        const p = (o.family ? Le(o.family) : De(s) !== null) && !g.includes("messages") ? M.grantSec : M.unknownGrantSec;
        m = Math.floor(Date.now() / 1e3) + (o.remember ? p : M.visitSec), b = o.remember === !0 && await n.keepSignerGrant({ site: s, until: m, ...v ? { name: v } : {} }).catch(() => !1), b || (m = Math.min(m, Math.floor(Date.now() / 1e3) + M.visitSec)), F(), e({ t: "done", nonce: t.nonce, ok: !0 });
      } catch {
        T(), e({ t: "done", nonce: t.nonce, ok: !1 });
      }
      c(A());
    }
  }, X = (i) => {
    if (i.source === window.parent) return void oe(i);
    i.origin === H && i.source !== window && le(i);
  };
  window.addEventListener("message", X);
  const de = setInterval(() => void U(), 36e5);
  return s && (window.parent.postMessage(B({ t: "ready" }), s), W().then(() => {
    a && c(A());
  })), {
    embedded: !0,
    stop() {
      clearInterval(de), window.removeEventListener("message", X), T();
    }
  };
}
export {
  qe as startEmbeddedSigner
};
