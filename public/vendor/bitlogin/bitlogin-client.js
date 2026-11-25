import { v as _ } from "./bitlogin-shared-Cj9s0_W_.js";
import { y as F, z as $, A as q, n as z, r as D, B as Y, l as H, c as Q, C as X, D as N, E as U, b as K, f as Z, U as W, F as ee, G as te } from "./bitlogin-shared-DVgIEj88.js";
class k extends Error {
  constructor(r) {
    super(`BitLogin refused to ${r}. The application may not be allowed to, or the user may have signed out.`), this.name = "BitLoginRefused";
  }
}
const ne = (s, r) => !!s && r.sign.every((a) => s.sign.includes(a)) && r.read.every((a) => s.read.includes(a)) && r.appData.every((a) => s.appData.includes(a) || s.appData.includes("*")) && r.proofs.every((a) => s.proofs.includes(a)) && r.peers.every((a) => s.peers.includes(a)), ie = 3e3;
function oe(s) {
  const r = F(s.at);
  if (!r) throw new Error("`at` must be the sign-in address's origin, such as https://bitlogin.network");
  const a = $(s.permissions);
  if (!a) throw new Error("`permissions` is not a permission set BitLogin will show a user. See docs/sign-in-window.md §SW9.2.");
  const G = s.timeoutMs ?? 2e4, L = q(r) ? z(s.localUnlockService) : null, O = (e) => Z(e, L ? [...W, L] : W), c = document.createElement("iframe");
  c.src = `${r}/signer/`, c.title = "BitLogin signer", c.setAttribute("aria-hidden", "true"), c.tabIndex = -1, c.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;top:0;border:0;opacity:0;pointer-events:none";
  let l = { signedIn: !1 }, y = { unlocked: !1 }, b, g;
  const I = typeof s.family == "string" ? s.family : void 0, p = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
  let x = !1;
  const A = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (e) => e.toString(16).padStart(2, "0")).join(""), J = (e) => {
    const t = e.unlocked === !0 && typeof e.pubkey == "string";
    typeof e.taken == "boolean" && (b = e.taken), I !== void 0 && typeof e.familyTaken == "boolean" && (g = e.familyTaken);
    const n = t ? $(e.permissions) ?? void 0 : void 0, i = t && ne(n, a);
    y = { unlocked: t, ...t ? { pubkey: e.pubkey } : {} };
    const o = {
      signedIn: i,
      ...i ? { pubkey: e.pubkey } : {},
      ...i && typeof e.name == "string" ? { name: e.name } : {},
      ...i && typeof e.until == "number" ? { until: e.until } : {},
      ...t && !i ? { needsMore: !0 } : {},
      ...b !== void 0 ? { canAsk: b } : {},
      ...g !== void 0 ? { familyTaken: g } : {}
    }, m = JSON.stringify(o) !== JSON.stringify(l);
    if (l = o, m) for (const f of p) f(l);
  }, P = (e) => {
    if (e.source !== c.contentWindow || e.origin !== r) return;
    const t = e.data;
    if (!t || typeof t != "object" || t.nswp !== N || t.v !== U) return;
    if (t.t === "ready") return void S();
    if (t.t === "state" && J(t), typeof t.id != "string") return;
    const n = u.get(t.id);
    n && (u.delete(t.id), clearTimeout(n.timer), n.resolve(t));
  }, B = (e) => c.contentWindow?.postMessage({ nswp: N, v: U, ...e }, r), d = (e) => new Promise((t, n) => {
    if (x) return n(new Error("This BitLogin client was destroyed."));
    const i = A(), o = setTimeout(() => {
      u.delete(i), n(new Error("BitLogin's signer did not answer."));
    }, G);
    u.set(i, { resolve: t, reject: n, timer: o }), R.then(() => B({ ...e, id: i }));
  });
  let S = () => {
  };
  const R = new Promise((e) => {
    S = e;
  });
  let C = null;
  const w = () => C ??= (async () => (await R, I !== void 0 && (!await Promise.race([d({ t: "want", family: I }).then(() => !0, () => !1), new Promise((t) => setTimeout(() => t(!1), ie))]) || g === void 0) && (g = !1), await d({ t: "want", permissions: a }), l))().catch((e) => {
    throw C = null, e;
  });
  window.addEventListener("message", P), c.addEventListener("load", () => S()), (s.mount ?? document.body).append(c), w().catch(() => {
  });
  const E = async (e, t) => {
    const n = await d(e);
    if (n.t !== "text" || typeof n.text != "string") throw new k(t);
    return n.text;
  }, M = (e) => ({
    encrypt: (t, n) => E({ t: "encrypt", peer: t, text: n, scheme: e }, "encrypt that"),
    decrypt: (t, n) => E({ t: "decrypt", peer: t, text: n, scheme: e }, "decrypt that")
  });
  return {
    ready: () => w(),
    state: () => l,
    onChange(e) {
      return p.add(e), () => p.delete(e);
    },
    async signIn() {
      await w();
      const e = window.open(`${r}/connect/`, "bitlogin-connect", "popup,width=480,height=760");
      return e ? new Promise((t) => {
        const n = V((o) => o.signedIn ? (clearInterval(i), t(!0), !0) : !1), i = setInterval(() => {
          e.closed && (clearInterval(i), d({ t: "state" }).catch(() => {
          }).then(() => {
            n(), t(l.signedIn);
          }));
        }, 400);
      }) : !1;
    },
    async switchAccount() {
      await w();
      const e = window.open(`${r}/connect/#switch`, "bitlogin-connect", "popup,width=480,height=760");
      return e ? new Promise((t) => {
        const n = setInterval(() => {
          e.closed && (clearInterval(n), d({ t: "state" }).catch(() => {
          }).then(() => t(l.signedIn)));
        }, 400);
      }) : !1;
    },
    async signOut() {
      await d({ t: "lock" });
    },
    async propose(e, t) {
      if (!X.includes(e.kind)) return null;
      const n = await h({ t: "propose", event: { kind: e.kind, content: e.content, tags: e.tags } }, t), i = n?.event;
      if (n?.t !== "signed" || !_(i)) return null;
      const o = (m) => JSON.stringify(m.filter((f) => f[0] !== ee));
      return i.pubkey !== y.pubkey || i.kind !== e.kind || i.content !== e.content || o(i.tags) !== o(e.tags) ? null : i;
    },
    async pay(e, t) {
      const n = Q(e);
      if (!n) return null;
      const i = await h({ t: "pay", invoice: n }, t);
      return i?.t !== "paid" ? null : typeof i.preimage == "string" && /^[0-9a-f]{64}$/u.test(i.preimage) ? { preimage: i.preimage } : {};
    },
    async tip(e, t) {
      const n = H(e.sats);
      if (!n || e.to !== void 0 && !/^[0-9a-f]{64}$/u.test(e.to)) return null;
      const i = await h({ t: "tip", sats: n, ...e.to ? { to: e.to } : {} }, t);
      return i?.t !== "paid" ? null : typeof i.preimage == "string" && /^[0-9a-f]{64}$/u.test(i.preimage) ? { preimage: i.preimage } : {};
    },
    async buy(e, t) {
      const n = K(e);
      if (!n || !Y(r)) return null;
      const i = await h({ t: "buy", listing: n }, t), o = i?.t === "bought" ? O(i.receipt) : null;
      return D(o, { buyer: y.pubkey ?? "", listing: n, now: Date.now() / 1e3 }) ? { receipt: o.event, ...typeof i.delivery == "string" ? { delivery: i.delivery } : {} } : null;
    },
    async have(e) {
      const t = K(e);
      if (!t) return null;
      const n = await d({ t: "have", listing: t }).catch(() => null), i = n?.t === "receipt" ? O(n.receipt) : null;
      return D(i, { buyer: y.pubkey ?? "", listing: t, now: Date.now() / 1e3 }) ? i.event : null;
    },
    async getPublicKey() {
      if (!l.signedIn || !l.pubkey) throw new k("say who is signed in");
      return l.pubkey;
    },
    async signEvent(e) {
      const t = await d({ t: "sign", event: e }), n = t.event;
      if (t.t !== "signed" || !_(n)) throw new k("sign that");
      if (n.pubkey !== y.pubkey || n.kind !== e.kind || n.content !== e.content) throw new k("sign that");
      return n;
    },
    nip44: M("nip44"),
    nip04: M("nip04"),
    decryptEvent: (e) => E({ t: "read", event: e }, "read that"),
    destroy() {
      x = !0, window.removeEventListener("message", P);
      for (const e of u.values())
        clearTimeout(e.timer), e.reject(new Error("This BitLogin client was destroyed."));
      u.clear(), p.clear(), c.remove();
    }
  };
  async function h(e, t) {
    if (!y.unlocked) return null;
    await w();
    const n = A(), i = (v) => new Promise((T) => {
      const j = setTimeout(() => {
        u.delete(n), T(null);
      }, v);
      u.set(n, { resolve: T, reject: () => T(null), timer: j });
    }), o = i(8e3);
    if (B({ ...e, id: n }), (await o)?.t !== "asking") return null;
    const m = i(te + 1e4);
    let f = !1;
    try {
      f = await t?.show?.() === !0;
    } catch {
      f = !1;
    }
    if (!f && !window.open(`${r}/connect/`, "bitlogin-connect", "popup,width=480,height=760")) {
      const v = u.get(n);
      return v && (clearTimeout(v.timer), u.delete(n)), null;
    }
    return m;
  }
  function V(e) {
    const t = (n) => {
      e(n) && p.delete(t);
    };
    return p.add(t), () => p.delete(t);
  }
}
export {
  k as BitLoginRefused,
  oe as createBitLoginClient
};
