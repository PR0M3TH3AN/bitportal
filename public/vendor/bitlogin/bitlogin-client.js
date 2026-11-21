import { v as $ } from "./bitlogin-shared-CvPtgHf2.js";
import { c as J, r as C, i as V, b as q, A as z, S as N, P as D, a as F, d as H } from "./bitlogin-shared-BkM-XX5B.js";
import { l as Q, r as M, j as X, c as Y, b as _, d as Z, U } from "./bitlogin-shared-BK8HgLxP.js";
class v extends Error {
  constructor(r) {
    super(`BitLogin refused to ${r}. The application may not be allowed to, or the user may have signed out.`), this.name = "BitLoginRefused";
  }
}
const ee = (s, r) => !!s && r.sign.every((a) => s.sign.includes(a)) && r.read.every((a) => s.read.includes(a)) && r.appData.every((a) => s.appData.includes(a) || s.appData.includes("*")) && r.proofs.every((a) => s.proofs.includes(a)) && r.peers.every((a) => s.peers.includes(a));
function re(s) {
  const r = J(s.at);
  if (!r) throw new Error("`at` must be the sign-in address's origin, such as https://bitlogin.network");
  const a = C(s.permissions);
  if (!a) throw new Error("`permissions` is not a permission set BitLogin will show a user. See docs/sign-in-window.md §SW9.2.");
  const K = s.timeoutMs ?? 2e4, E = V(r) ? Q(s.localUnlockService) : null, L = (e) => Z(e, E ? [...U, E] : U), c = document.createElement("iframe");
  c.src = `${r}/signer/`, c.title = "BitLogin signer", c.setAttribute("aria-hidden", "true"), c.tabIndex = -1, c.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;top:0;border:0;opacity:0;pointer-events:none";
  let u = { signedIn: !1 }, y = { unlocked: !1 }, b;
  const d = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map();
  let O = !1;
  const T = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (e) => e.toString(16).padStart(2, "0")).join(""), W = (e) => {
    const t = e.unlocked === !0 && typeof e.pubkey == "string";
    typeof e.taken == "boolean" && (b = e.taken);
    const n = t ? C(e.permissions) ?? void 0 : void 0, i = t && ee(n, a);
    y = { unlocked: t, ...t ? { pubkey: e.pubkey } : {} };
    const o = {
      signedIn: i,
      ...i ? { pubkey: e.pubkey } : {},
      ...i && typeof e.name == "string" ? { name: e.name } : {},
      ...i && typeof e.until == "number" ? { until: e.until } : {},
      ...t && !i ? { needsMore: !0 } : {},
      ...b !== void 0 ? { canAsk: b } : {}
    }, w = JSON.stringify(o) !== JSON.stringify(u);
    if (u = o, w) for (const g of d) g(u);
  }, x = (e) => {
    if (e.source !== c.contentWindow || e.origin !== r) return;
    const t = e.data;
    if (!t || typeof t != "object" || t.nswp !== N || t.v !== D) return;
    if (t.t === "ready") return void k();
    if (t.t === "state" && W(t), typeof t.id != "string") return;
    const n = l.get(t.id);
    n && (l.delete(t.id), clearTimeout(n.timer), n.resolve(t));
  }, A = (e) => c.contentWindow?.postMessage({ nswp: N, v: D, ...e }, r), p = (e) => new Promise((t, n) => {
    if (O) return n(new Error("This BitLogin client was destroyed."));
    const i = T(), o = setTimeout(() => {
      l.delete(i), n(new Error("BitLogin's signer did not answer."));
    }, K);
    l.set(i, { resolve: t, reject: n, timer: o }), P.then(() => A({ ...e, id: i }));
  });
  let k = () => {
  };
  const P = new Promise((e) => {
    k = e;
  });
  let R = null;
  const f = () => R ??= (async () => (await P, await p({ t: "want", permissions: a }), u))().catch((e) => {
    throw R = null, e;
  });
  window.addEventListener("message", x), c.addEventListener("load", () => k()), (s.mount ?? document.body).append(c), f().catch(() => {
  });
  const I = async (e, t) => {
    const n = await p(e);
    if (n.t !== "text" || typeof n.text != "string") throw new v(t);
    return n.text;
  }, B = (e) => ({
    encrypt: (t, n) => I({ t: "encrypt", peer: t, text: n, scheme: e }, "encrypt that"),
    decrypt: (t, n) => I({ t: "decrypt", peer: t, text: n, scheme: e }, "decrypt that")
  });
  return {
    ready: () => f(),
    state: () => u,
    onChange(e) {
      return d.add(e), () => d.delete(e);
    },
    async signIn() {
      await f();
      const e = window.open(`${r}/connect/`, "bitlogin-connect", "popup,width=480,height=760");
      return e ? new Promise((t) => {
        const n = j((o) => o.signedIn ? (clearInterval(i), t(!0), !0) : !1), i = setInterval(() => {
          e.closed && (clearInterval(i), p({ t: "state" }).catch(() => {
          }).then(() => {
            n(), t(u.signedIn);
          }));
        }, 400);
      }) : !1;
    },
    async switchAccount() {
      await f();
      const e = window.open(`${r}/connect/#switch`, "bitlogin-connect", "popup,width=480,height=760");
      return e ? new Promise((t) => {
        const n = setInterval(() => {
          e.closed && (clearInterval(n), p({ t: "state" }).catch(() => {
          }).then(() => t(u.signedIn)));
        }, 400);
      }) : !1;
    },
    async signOut() {
      await p({ t: "lock" });
    },
    async propose(e, t) {
      if (!z.includes(e.kind)) return null;
      const n = await m({ t: "propose", event: { kind: e.kind, content: e.content, tags: e.tags } }, t), i = n?.event;
      if (n?.t !== "signed" || !$(i)) return null;
      const o = (w) => JSON.stringify(w.filter((g) => g[0] !== F));
      return i.pubkey !== y.pubkey || i.kind !== e.kind || i.content !== e.content || o(i.tags) !== o(e.tags) ? null : i;
    },
    async pay(e, t) {
      const n = Y(e);
      if (!n) return null;
      const i = await m({ t: "pay", invoice: n }, t);
      return i?.t !== "paid" ? null : typeof i.preimage == "string" && /^[0-9a-f]{64}$/u.test(i.preimage) ? { preimage: i.preimage } : {};
    },
    async tip(e, t) {
      const n = X(e.sats);
      if (!n || e.to !== void 0 && !/^[0-9a-f]{64}$/u.test(e.to)) return null;
      const i = await m({ t: "tip", sats: n, ...e.to ? { to: e.to } : {} }, t);
      return i?.t !== "paid" ? null : typeof i.preimage == "string" && /^[0-9a-f]{64}$/u.test(i.preimage) ? { preimage: i.preimage } : {};
    },
    async buy(e, t) {
      const n = _(e);
      if (!n || !q(r)) return null;
      const i = await m({ t: "buy", listing: n }, t), o = i?.t === "bought" ? L(i.receipt) : null;
      return M(o, { buyer: y.pubkey ?? "", listing: n, now: Date.now() / 1e3 }) ? { receipt: o.event, ...typeof i.delivery == "string" ? { delivery: i.delivery } : {} } : null;
    },
    async have(e) {
      const t = _(e);
      if (!t) return null;
      const n = await p({ t: "have", listing: t }).catch(() => null), i = n?.t === "receipt" ? L(n.receipt) : null;
      return M(i, { buyer: y.pubkey ?? "", listing: t, now: Date.now() / 1e3 }) ? i.event : null;
    },
    async getPublicKey() {
      if (!u.signedIn || !u.pubkey) throw new v("say who is signed in");
      return u.pubkey;
    },
    async signEvent(e) {
      const t = await p({ t: "sign", event: e }), n = t.event;
      if (t.t !== "signed" || !$(n)) throw new v("sign that");
      if (n.pubkey !== y.pubkey || n.kind !== e.kind || n.content !== e.content) throw new v("sign that");
      return n;
    },
    nip44: B("nip44"),
    nip04: B("nip04"),
    decryptEvent: (e) => I({ t: "read", event: e }, "read that"),
    destroy() {
      O = !0, window.removeEventListener("message", x);
      for (const e of l.values())
        clearTimeout(e.timer), e.reject(new Error("This BitLogin client was destroyed."));
      l.clear(), d.clear(), c.remove();
    }
  };
  async function m(e, t) {
    if (!y.unlocked) return null;
    await f();
    const n = T(), i = (h) => new Promise((S) => {
      const G = setTimeout(() => {
        l.delete(n), S(null);
      }, h);
      l.set(n, { resolve: S, reject: () => S(null), timer: G });
    }), o = i(8e3);
    if (A({ ...e, id: n }), (await o)?.t !== "asking") return null;
    const w = i(H + 1e4);
    let g = !1;
    try {
      g = await t?.show?.() === !0;
    } catch {
      g = !1;
    }
    if (!g && !window.open(`${r}/connect/`, "bitlogin-connect", "popup,width=480,height=760")) {
      const h = l.get(n);
      return h && (clearTimeout(h.timer), l.delete(n)), null;
    }
    return w;
  }
  function j(e) {
    const t = (n) => {
      e(n) && d.delete(t);
    };
    return d.add(t), () => d.delete(t);
  }
}
export {
  v as BitLoginRefused,
  re as createBitLoginClient
};
