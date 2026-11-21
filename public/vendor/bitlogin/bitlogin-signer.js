import { v as de } from "./bitlogin-shared-CvPtgHf2.js";
import { l as ue, U as X, d as Y, r as fe, f as pe } from "./bitlogin-shared-BK8HgLxP.js";
import { c as we } from "./bitlogin-shared-BVd_kYfR.js";
import { k as me } from "./bitlogin-shared-DkdmxQvn.js";
import { f as Z } from "./bitlogin-shared-B-Mf8qJ5.js";
import { c as $, e as u, f as M, g as D, h as E, i as ge, s as B, j as ve, b as he, m as ke, p as ye, d as be, k as Se, l as Me, n as De, o as Ae, q as ee, t as C, u as Ee, W as Ge, v as Ie } from "./bitlogin-shared-BkM-XX5B.js";
function qe(te = {}) {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const T = location.origin;
  let r = $(location.ancestorOrigins?.[0] ?? ""), l = null, a = null, y = null, w = null, m = 0, b = !1, I = u();
  const x = { burst: M.passBurst, perMs: M.perMs, hourly: M.passHourly };
  let _ = u(x), c = null, O = null, K = !1, g = [], F = [], G = { quiet: u(D.quiet), public: u(D.public), sensitive: u(D.sensitive), read: u(D.read) };
  const J = (i = [], t = []) => ({
    quiet: u(D.quiet),
    public: u(D.public, i),
    sensitive: u(D.sensitive, t),
    read: u(D.read)
  });
  let v = null;
  const ne = { sign: u(E), wallet: u(E), pay: u(E), tip: u(E), buy: u(E), save: u(E), pick: u(E) }, R = () => {
    if (!v) return;
    clearTimeout(v.timer);
    const { id: i } = v;
    v = null, r && window.parent.postMessage(B({ t: "refused", id: i }), r);
  };
  let h = null, q = null;
  const j = ge(T) ? ue(document.documentElement.dataset.unlockService) : null, H = j ? [...X, j] : X;
  let k = [];
  const N = () => {
    b && a && r && l?.holdReceipts(r, k).catch(() => {
    });
  }, ie = async () => {
    k = [], !(!a || !r || !l) && (k = C(await l.heldReceipts(r).catch(() => []), a, H));
  }, V = () => {
    k = [];
  }, ae = (i) => a ? pe(k.map((t) => Y(t, H)).filter((t) => !!t), { buyer: a, listing: i, now: Date.now() / 1e3 }) : null, P = async () => l ??= await we(te), re = () => {
    R();
    const i = l;
    l = null, a = null, y = null, w = null, m = 0, b = !1, c = null, k = [], i?.destroy();
  }, W = async () => {
    const i = l;
    !i || !a || !b || !r || await i.checkTakenBack(r).catch(() => "ok") === "ok" || l !== i || (re(), d(A()));
  }, L = () => {
    R();
    const i = l, t = r;
    l = null, a = null, y = null, w = null, m = 0, b = !1, c = null, g = [], V(), i && (t ? i.forgetSignerGrant(t) : Promise.resolve()).catch(() => {
    }).finally(() => i.destroy());
  };
  let se = null;
  const U = () => se ??= (async () => {
    if (r)
      try {
        const i = await (await P()).restoreSignerGrant(r, Z(r) || void 0);
        if (!i) return;
        a = i.pubkey, y = i.name ?? null, w = i.profile ?? null, m = i.until, b = !0, c = i.permissions ?? null, g = c ? [] : i.more ?? [], c ? G = J(i.signed, i.signedSensitive) : I = u(M, i.signed), i.check === "overdue" ? await W() : i.check === "due" && W(), _ = u(x, i.signedPass), await ie();
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
    ...a && (w?.name || y) ? { name: w?.name || y } : {},
    ...a && w?.picture ? { picture: w.picture } : {},
    ...a && w?.about ? { about: w.about } : {},
    // An application is told what it was approved for, so it can tell that from what it now wants.
    ...a && c ? { permissions: c } : {},
    // A world is told what more it was let do, so it asks for nothing that isn't there.
    ...a && !c && g.length ? { more: g } : {},
    // What can be asked for here at all, said locked or unlocked. Not to an application: it is held to its set.
    ...c ? {} : { offers: [...Ge] }
  }), oe = async (i) => {
    const t = $(i.origin);
    if (!t || (r ||= t, t !== r)) return;
    const e = ve(i.data);
    if (!e || e.t === "buy" && !he(T)) return;
    if (await U(), e.t === "state") return d(A(e.id));
    if (e.t === "lock")
      return L(), d(A(e.id));
    if (e.t === "wantMore")
      return F = e.more, d(A(e.id));
    if (e.t === "want") {
      const s = ke(r, e.permissions);
      return O = s ? e.permissions : null, K = !s, d({ ...A(e.id), taken: s });
    }
    const n = () => d({ t: "refused", id: e.id });
    if (a && Date.now() / 1e3 >= m && L(), !l || !a) return n();
    if (e.t === "have") {
      const s = ae(e.listing);
      return d(s ? { t: "receipt", id: e.id, receipt: s.event } : { t: "none", id: e.id });
    }
    if (e.t === "propose" || e.t === "wallet" || e.t === "pay" || e.t === "tip" || e.t === "buy" || e.t === "file-save" || e.t === "file-pick") {
      const s = c && e.t === "wallet" ? null : e.t === "wallet" ? { what: "wallet" } : e.t === "pay" ? { what: "pay", invoice: e.invoice } : e.t === "tip" ? { what: "tip", sats: e.sats, ...e.to ? { to: e.to } : {} } : e.t === "buy" ? { what: "buy", listing: e.listing } : e.t === "file-pick" ? { what: "pick" } : e.t === "file-save" ? { what: "save", name: e.name, type: e.type, bytes: e.bytes, private: e.private } : /* @__PURE__ */ ((Q) => Q ? { what: "sign", event: Q } : null)(ye(e.event, r, Date.now() / 1e3));
      if (!s || !ne[s.what].take(Date.now())) return n();
      R();
      const S = e.id;
      return v = { id: S, ask: s, timer: setTimeout(() => v?.id === S && R(), be) }, d({ t: "asking", id: S });
    }
    if (e.t === "encrypt" || e.t === "decrypt" || e.t === "read") {
      if (!c || e.t !== "encrypt" && !G.read.take(Date.now())) return n();
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
    const o = Date.now(), f = c ? Se(c, e.event, r, o / 1e3) : Me(e.event, r, o / 1e3);
    if (!f) return n();
    const p = c ? De(f.kind) : null;
    if (!(p ? G[p] : I).take(o)) return n();
    try {
      const s = await l.signEvent(f);
      if (s.pubkey !== a) return n();
      d({ t: "signed", id: e.id, event: s }), p ? p !== "quiet" && l.touchSignerGrant(r, G.public.times(), G.sensitive.times()).catch(() => {
      }) : l.touchSignerGrant(r, I.times()).catch(() => {
      });
    } catch {
      n();
    }
  }, le = async (i) => {
    const t = Ae(i.data);
    if (!t || !i.source) return;
    const e = (n) => i.source.postMessage(Ie(n), T);
    if (t.t === "hello") {
      if (!r) return;
      await U();
      try {
        const n = await (await P()).beginHandoff();
        h = { nonce: t.nonce, from: i.source }, q = h, e({ t: "frame", nonce: t.nonce, world: r, recipient: n, ...O ? { wants: O } : {}, ...K ? { turnedDown: !0 } : {}, ...!O && F.length ? { more: F } : {}, ...!O && a && !c && g.length ? { has: g } : {}, ...a && v ? { ask: v.ask, pubkey: a } : {} });
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
      if (n.ask.what === "wallet" && ee(t.wallet) && (o = { t: "wallet", id: n.id, uri: ee(t.wallet) }), n.ask.what === "pay" && t.paid?.invoice === n.ask.invoice && (o = { t: "paid", id: n.id, ...t.paid.preimage ? { preimage: t.paid.preimage } : {} }), n.ask.what === "tip" && t.tipped?.sats === n.ask.sats && (o = { t: "paid", id: n.id, ...t.tipped.preimage ? { preimage: t.tipped.preimage } : {} }), n.ask.what === "buy" && t.bought) {
        const f = Y(t.bought.receipt, H);
        fe(f, { buyer: a, listing: n.ask.listing, now: Date.now() / 1e3 }) && (o = { t: "bought", id: n.id, receipt: f.event, ...t.bought.delivery ? { delivery: t.bought.delivery } : {} }, k = C([f.event, ...k.filter((p) => p.id !== f.event.id)], a, H), N());
      }
      if (n.ask.what === "save" && t.saved && (o = { t: "file-saved", id: n.id, ...t.saved }), n.ask.what === "pick" && t.file && (o = { t: "file", id: n.id, ...t.file }), n.ask.what === "sign" && t.event) {
        const f = t.event, p = n.ask.event;
        de(f) && f.pubkey === a && f.kind === p.kind && f.content === p.content && JSON.stringify(f.tags) === JSON.stringify(p.tags) && Math.abs(f.created_at - Date.now() / 1e3) < 600 && (o = { t: "signed", id: n.id, event: f });
      }
      return d(o), e({ t: "done", nonce: t.nonce, ok: o.t !== "refused" || !t.event && !t.wallet && !t.paid && !t.saved && !t.file && !t.tipped && !t.bought });
    }
    if (t.t === "held") {
      if (!q || q.nonce !== t.nonce || q.from !== i.source || t.world !== r || !a) return;
      k = C(t.receipts, a, H), N();
      return;
    }
    if (t.t === "grant" && !(!h || h.nonce !== t.nonce || h.from !== i.source || t.world !== r)) {
      h = null;
      try {
        const n = await P(), o = await n.acceptHandoff(t.sealed);
        if (o.app && o.app.site !== r || o.site && o.site !== r) throw new Error("for another site");
        if (o.family && o.family !== Z(r)) throw new Error("for another family");
        w = o.profile ?? null, c = o.app?.permissions ?? null, g = c || o.family ? [] : o.more ?? [], G = J(), a = o.pubkey, y = t.name ?? null, I = u(), _ = u(x), R(), V();
        const p = (o.family ? me(o.family) : Ee(r) !== null) && !g.includes("messages") ? M.grantSec : M.unknownGrantSec;
        m = Math.floor(Date.now() / 1e3) + (o.remember ? p : M.visitSec), b = o.remember === !0 && await n.keepSignerGrant({ site: r, until: m, ...y ? { name: y } : {} }).catch(() => !1), b || (m = Math.min(m, Math.floor(Date.now() / 1e3) + M.visitSec)), N(), e({ t: "done", nonce: t.nonce, ok: !0 });
      } catch {
        L(), e({ t: "done", nonce: t.nonce, ok: !1 });
      }
      d(A());
    }
  }, z = (i) => {
    if (i.source === window.parent) return void oe(i);
    i.origin === T && i.source !== window && le(i);
  };
  window.addEventListener("message", z);
  const ce = setInterval(() => void W(), 36e5);
  return r && (window.parent.postMessage(B({ t: "ready" }), r), U().then(() => {
    a && d(A());
  })), {
    embedded: !0,
    stop() {
      clearInterval(ce), window.removeEventListener("message", z), L();
    }
  };
}
export {
  qe as startEmbeddedSigner
};
