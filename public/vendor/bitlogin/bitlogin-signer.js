import { c as H } from "./bitlogin-shared-B2gbCFW0.js";
import { c as b, a as y, s as v, S as M, r as I, p as L, b as O, h as q } from "./bitlogin-shared-DDEwyvg-.js";
function N() {
  if (typeof window > "u" || window.parent === window) return { embedded: !1, stop() {
  } };
  const h = location.origin;
  let t = b(location.ancestorOrigins?.[0] ?? ""), c = null, r = null, i = null, s = 0, u = y(), l = null;
  const w = async () => c ??= await H(), f = () => {
    const e = c, n = t;
    c = null, r = null, i = null, s = 0, e && (n ? e.forgetSignerGrant(n) : Promise.resolve()).catch(() => {
    }).finally(() => e.destroy());
  };
  let G = null;
  const m = () => G ??= (async () => {
    if (t)
      try {
        const e = await (await w()).restoreSignerGrant(t);
        if (!e) return;
        r = e.pubkey, i = e.name ?? null, s = e.until, u = y(M, e.signed);
      } catch {
      }
  })(), d = (e) => {
    t && window.parent.postMessage(v(e), t);
  }, g = (e) => (r && Date.now() / 1e3 >= s && f(), { t: "state", ...e ? { id: e } : {}, unlocked: !!r, ...r ? { pubkey: r, until: s } : {}, ...r && i ? { name: i } : {} }), D = async (e) => {
    const n = b(e.origin);
    if (!n || (t ||= n, n !== t)) return;
    const a = I(e.data);
    if (!a) return;
    if (await m(), a.t === "state") return d(g(a.id));
    if (a.t === "lock")
      return f(), d(g(a.id));
    const o = () => d({ t: "refused", id: a.id });
    if (r && Date.now() / 1e3 >= s && f(), !c || !r) return o();
    const p = L(a.event, t, Date.now() / 1e3);
    if (!p || !u.take(Date.now())) return o();
    try {
      const S = await c.signEvent(p);
      if (S.pubkey !== r) return o();
      d({ t: "signed", id: a.id, event: S }), c.touchSignerGrant(t, u.times()).catch(() => {
      });
    } catch {
      o();
    }
  }, E = async (e) => {
    const n = O(e.data);
    if (!n || !e.source) return;
    const a = (o) => e.source.postMessage(q(o), h);
    if (n.t === "hello") {
      if (!t) return;
      await m();
      try {
        const o = await (await w()).beginHandoff();
        l = { nonce: n.nonce, from: e.source }, a({ t: "frame", nonce: n.nonce, world: t, recipient: o });
      } catch {
      }
      return;
    }
    if (n.t === "grant" && !(!l || l.nonce !== n.nonce || l.from !== e.source || n.world !== t)) {
      l = null;
      try {
        const o = await w();
        r = (await o.acceptHandoff(n.sealed)).pubkey, i = n.name ?? null, s = Math.floor(Date.now() / 1e3) + M.grantSec, u = y(), await o.keepSignerGrant({ site: t, until: s, ...i ? { name: i } : {} }).catch(() => !1), a({ t: "done", nonce: n.nonce, ok: !0 });
      } catch {
        f(), a({ t: "done", nonce: n.nonce, ok: !1 });
      }
      d(g());
    }
  }, k = (e) => {
    if (e.source === window.parent) return void D(e);
    e.origin === h && e.source !== window && E(e);
  };
  return window.addEventListener("message", k), t && (window.parent.postMessage(v({ t: "ready" }), t), m().then(() => {
    r && d(g());
  })), {
    embedded: !0,
    stop() {
      window.removeEventListener("message", k), f();
    }
  };
}
export {
  N as startEmbeddedSigner
};
