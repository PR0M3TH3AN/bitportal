import { v as B } from "./bitlogin-shared-Cj9s0_W_.js";
import { c as K, r as M, A as W, S as N, P as R, a as J, b as U } from "./bitlogin-shared-BqDMTUOp.js";
import { c as j } from "./bitlogin-shared-19Ribcs2.js";
class h extends Error {
  constructor(r) {
    super(`BitLogin refused to ${r}. The application may not be allowed to, or the user may have signed out.`), this.name = "BitLoginRefused";
  }
}
const G = (s, r) => !!s && r.sign.every((o) => s.sign.includes(o)) && r.read.every((o) => s.read.includes(o)) && r.appData.every((o) => s.appData.includes(o) || s.appData.includes("*")) && r.proofs.every((o) => s.proofs.includes(o)) && r.peers.every((o) => s.peers.includes(o));
function F(s) {
  const r = K(s.at);
  if (!r) throw new Error("`at` must be the sign-in address's origin, such as https://bitlogin.network");
  const o = M(s.permissions);
  if (!o) throw new Error("`permissions` is not a permission set BitLogin will show a user. See docs/sign-in-window.md §SW9.2.");
  const _ = s.timeoutMs ?? 2e4, c = document.createElement("iframe");
  c.src = `${r}/signer/`, c.title = "BitLogin signer", c.setAttribute("aria-hidden", "true"), c.tabIndex = -1, c.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;top:0;border:0;opacity:0;pointer-events:none";
  let u = { signedIn: !1 }, y = { unlocked: !1 }, k;
  const l = /* @__PURE__ */ new Set(), d = /* @__PURE__ */ new Map();
  let E = !1;
  const S = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (e) => e.toString(16).padStart(2, "0")).join(""), $ = (e) => {
    const t = e.unlocked === !0 && typeof e.pubkey == "string";
    typeof e.taken == "boolean" && (k = e.taken);
    const n = t ? M(e.permissions) ?? void 0 : void 0, i = t && G(n, o);
    y = { unlocked: t, ...t ? { pubkey: e.pubkey } : {} };
    const a = {
      signedIn: i,
      ...i ? { pubkey: e.pubkey } : {},
      ...i && typeof e.name == "string" ? { name: e.name } : {},
      ...i && typeof e.until == "number" ? { until: e.until } : {},
      ...t && !i ? { needsMore: !0 } : {},
      ...k !== void 0 ? { canAsk: k } : {}
    }, w = JSON.stringify(a) !== JSON.stringify(u);
    if (u = a, w) for (const p of l) p(u);
  }, T = (e) => {
    if (e.source !== c.contentWindow || e.origin !== r) return;
    const t = e.data;
    if (!t || typeof t != "object" || t.nswp !== N || t.v !== R) return;
    if (t.t === "ready") return void v();
    if (t.t === "state" && $(t), typeof t.id != "string") return;
    const n = d.get(t.id);
    n && (d.delete(t.id), clearTimeout(n.timer), n.resolve(t));
  }, x = (e) => c.contentWindow?.postMessage({ nswp: N, v: R, ...e }, r), f = (e) => new Promise((t, n) => {
    if (E) return n(new Error("This BitLogin client was destroyed."));
    const i = S(), a = setTimeout(() => {
      d.delete(i), n(new Error("BitLogin's signer did not answer."));
    }, _);
    d.set(i, { resolve: t, reject: n, timer: a }), L.then(() => x({ ...e, id: i }));
  });
  let v = () => {
  };
  const L = new Promise((e) => {
    v = e;
  });
  let O = null;
  const g = () => O ??= (async () => (await L, await f({ t: "want", permissions: o }), u))().catch((e) => {
    throw O = null, e;
  });
  window.addEventListener("message", T), c.addEventListener("load", () => v()), (s.mount ?? document.body).append(c), g().catch(() => {
  });
  const b = async (e, t) => {
    const n = await f(e);
    if (n.t !== "text" || typeof n.text != "string") throw new h(t);
    return n.text;
  }, P = (e) => ({
    encrypt: (t, n) => b({ t: "encrypt", peer: t, text: n, scheme: e }, "encrypt that"),
    decrypt: (t, n) => b({ t: "decrypt", peer: t, text: n, scheme: e }, "decrypt that")
  });
  return {
    ready: () => g(),
    state: () => u,
    onChange(e) {
      return l.add(e), () => l.delete(e);
    },
    async signIn() {
      await g();
      const e = window.open(`${r}/connect/`, "bitlogin-connect", "popup,width=480,height=760");
      return e ? new Promise((t) => {
        const n = C((a) => a.signedIn ? (clearInterval(i), t(!0), !0) : !1), i = setInterval(() => {
          e.closed && (clearInterval(i), f({ t: "state" }).catch(() => {
          }).then(() => {
            n(), t(u.signedIn);
          }));
        }, 400);
      }) : !1;
    },
    async switchAccount() {
      await g();
      const e = window.open(`${r}/connect/#switch`, "bitlogin-connect", "popup,width=480,height=760");
      return e ? new Promise((t) => {
        const n = setInterval(() => {
          e.closed && (clearInterval(n), f({ t: "state" }).catch(() => {
          }).then(() => t(u.signedIn)));
        }, 400);
      }) : !1;
    },
    async signOut() {
      await f({ t: "lock" });
    },
    async propose(e, t) {
      if (!W.includes(e.kind)) return null;
      const n = await A({ t: "propose", event: { kind: e.kind, content: e.content, tags: e.tags } }, t), i = n?.event;
      if (n?.t !== "signed" || !B(i)) return null;
      const a = (w) => JSON.stringify(w.filter((p) => p[0] !== J));
      return i.pubkey !== y.pubkey || i.kind !== e.kind || i.content !== e.content || a(i.tags) !== a(e.tags) ? null : i;
    },
    async pay(e, t) {
      const n = j(e);
      if (!n) return null;
      const i = await A({ t: "pay", invoice: n }, t);
      return i?.t !== "paid" ? null : typeof i.preimage == "string" && /^[0-9a-f]{64}$/u.test(i.preimage) ? { preimage: i.preimage } : {};
    },
    async getPublicKey() {
      if (!u.signedIn || !u.pubkey) throw new h("say who is signed in");
      return u.pubkey;
    },
    async signEvent(e) {
      const t = await f({ t: "sign", event: e }), n = t.event;
      if (t.t !== "signed" || !B(n)) throw new h("sign that");
      if (n.pubkey !== y.pubkey || n.kind !== e.kind || n.content !== e.content) throw new h("sign that");
      return n;
    },
    nip44: P("nip44"),
    nip04: P("nip04"),
    decryptEvent: (e) => b({ t: "read", event: e }, "read that"),
    destroy() {
      E = !0, window.removeEventListener("message", T);
      for (const e of d.values())
        clearTimeout(e.timer), e.reject(new Error("This BitLogin client was destroyed."));
      d.clear(), l.clear(), c.remove();
    }
  };
  async function A(e, t) {
    if (!y.unlocked) return null;
    await g();
    const n = S(), i = (m) => new Promise((I) => {
      const D = setTimeout(() => {
        d.delete(n), I(null);
      }, m);
      d.set(n, { resolve: I, reject: () => I(null), timer: D });
    }), a = i(8e3);
    if (x({ ...e, id: n }), (await a)?.t !== "asking") return null;
    const w = i(U + 1e4);
    let p = !1;
    try {
      p = await t?.show?.() === !0;
    } catch {
      p = !1;
    }
    if (!p && !window.open(`${r}/connect/`, "bitlogin-connect", "popup,width=480,height=760")) {
      const m = d.get(n);
      return m && (clearTimeout(m.timer), d.delete(n)), null;
    }
    return w;
  }
  function C(e) {
    const t = (n) => {
      e(n) && l.delete(t);
    };
    return l.add(t), () => l.delete(t);
  }
}
export {
  h as BitLoginRefused,
  F as createBitLoginClient
};
