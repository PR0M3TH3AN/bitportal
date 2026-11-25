import { v as _ } from "./bitlogin-shared-Cj9s0_W_.js";
import { y as q, z as $, A as z, n as Y, r as D, B as H, l as Q, c as X, C as Z, D as N, E as U, b as G, f as ee, U as K, F as te, G as ne } from "./bitlogin-shared-CEB3PAlL.js";
class b extends Error {
  constructor(s) {
    super(`BitLogin refused to ${s}. The application may not be allowed to, or the user may have signed out.`), this.name = "BitLoginRefused";
  }
}
const ie = (r, s) => !!r && s.sign.every((a) => r.sign.includes(a)) && s.read.every((a) => r.read.includes(a)) && s.appData.every((a) => r.appData.includes(a) || r.appData.includes("*")) && s.proofs.every((a) => r.proofs.includes(a)) && s.peers.every((a) => r.peers.includes(a)), re = 3e3;
function ae(r) {
  const s = q(r.at);
  if (!s) throw new Error("`at` must be the sign-in address's origin, such as https://bitlogin.network");
  const a = $(r.permissions);
  if (!a) throw new Error("`permissions` is not a permission set BitLogin will show a user. See docs/sign-in-window.md §SW9.2.");
  const W = r.timeoutMs ?? 2e4, L = z(s) ? Y(r.localUnlockService) : null, O = (e) => ee(e, L ? [...K, L] : K), c = document.createElement("iframe");
  c.src = `${s}/signer/`, c.title = "BitLogin signer", c.setAttribute("aria-hidden", "true"), c.tabIndex = -1, c.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;top:0;border:0;opacity:0;pointer-events:none";
  let u = { signedIn: !1 }, y = { unlocked: !1 }, I, g;
  const h = typeof r.family == "string" ? r.family : void 0, J = h !== void 0 && r.guest === !0, p = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map();
  let x = !1;
  const A = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (e) => e.toString(16).padStart(2, "0")).join(""), V = (e) => {
    const t = e.unlocked === !0 && typeof e.pubkey == "string";
    typeof e.taken == "boolean" && (I = e.taken), h !== void 0 && typeof e.familyTaken == "boolean" && (g = e.familyTaken);
    const n = t ? $(e.permissions) ?? void 0 : void 0, i = t && ie(n, a);
    y = { unlocked: t, ...t ? { pubkey: e.pubkey } : {} };
    const o = {
      signedIn: i,
      ...i ? { pubkey: e.pubkey } : {},
      ...i && typeof e.name == "string" ? { name: e.name } : {},
      ...i && typeof e.until == "number" ? { until: e.until } : {},
      ...t && !i ? { needsMore: !0 } : {},
      ...I !== void 0 ? { canAsk: I } : {},
      ...g !== void 0 ? { familyTaken: g } : {},
      // A guest is who they are here, for what a guest may do: not this application's set.
      ...t && e.guest === !0 ? { guest: !0, pubkey: e.pubkey } : {}
    }, m = JSON.stringify(o) !== JSON.stringify(u);
    if (u = o, m) for (const f of p) f(u);
  }, P = (e) => {
    if (e.source !== c.contentWindow || e.origin !== s) return;
    const t = e.data;
    if (!t || typeof t != "object" || t.nswp !== N || t.v !== U) return;
    if (t.t === "ready") return void S();
    if (t.t === "state" && V(t), typeof t.id != "string") return;
    const n = l.get(t.id);
    n && (l.delete(t.id), clearTimeout(n.timer), n.resolve(t));
  }, B = (e) => c.contentWindow?.postMessage({ nswp: N, v: U, ...e }, s), d = (e) => new Promise((t, n) => {
    if (x) return n(new Error("This BitLogin client was destroyed."));
    const i = A(), o = setTimeout(() => {
      l.delete(i), n(new Error("BitLogin's signer did not answer."));
    }, W);
    l.set(i, { resolve: t, reject: n, timer: o }), R.then(() => B({ ...e, id: i }));
  });
  let S = () => {
  };
  const R = new Promise((e) => {
    S = e;
  });
  let C = null;
  const w = () => C ??= (async () => (await R, h !== void 0 && (!await Promise.race([d({ t: "want", family: h, ...J ? { guest: !0 } : {} }).then(() => !0, () => !1), new Promise((t) => setTimeout(() => t(!1), re))]) || g === void 0) && (g = !1), await d({ t: "want", permissions: a }), u))().catch((e) => {
    throw C = null, e;
  });
  window.addEventListener("message", P), c.addEventListener("load", () => S()), (r.mount ?? document.body).append(c), w().catch(() => {
  });
  const E = async (e, t) => {
    const n = await d(e);
    if (n.t !== "text" || typeof n.text != "string") throw new b(t);
    return n.text;
  }, M = (e) => ({
    encrypt: (t, n) => E({ t: "encrypt", peer: t, text: n, scheme: e }, "encrypt that"),
    decrypt: (t, n) => E({ t: "decrypt", peer: t, text: n, scheme: e }, "decrypt that")
  });
  return {
    ready: () => w(),
    state: () => u,
    onChange(e) {
      return p.add(e), () => p.delete(e);
    },
    async signIn() {
      await w();
      const e = window.open(`${s}/connect/`, "bitlogin-connect", "popup,width=480,height=760");
      return e ? new Promise((t) => {
        const n = j((o) => o.signedIn ? (clearInterval(i), t(!0), !0) : !1), i = setInterval(() => {
          e.closed && (clearInterval(i), d({ t: "state" }).catch(() => {
          }).then(() => {
            n(), t(u.signedIn);
          }));
        }, 400);
      }) : !1;
    },
    async switchAccount() {
      await w();
      const e = window.open(`${s}/connect/#switch`, "bitlogin-connect", "popup,width=480,height=760");
      return e ? new Promise((t) => {
        const n = setInterval(() => {
          e.closed && (clearInterval(n), d({ t: "state" }).catch(() => {
          }).then(() => t(u.signedIn)));
        }, 400);
      }) : !1;
    },
    async signOut() {
      await d({ t: "lock" });
    },
    async propose(e, t) {
      if (!Z.includes(e.kind)) return null;
      const n = await v({ t: "propose", event: { kind: e.kind, content: e.content, tags: e.tags } }, t), i = n?.event;
      if (n?.t !== "signed" || !_(i)) return null;
      const o = (m) => JSON.stringify(m.filter((f) => f[0] !== te));
      return i.pubkey !== y.pubkey || i.kind !== e.kind || i.content !== e.content || o(i.tags) !== o(e.tags) ? null : i;
    },
    async pay(e, t) {
      const n = X(e);
      if (!n) return null;
      const i = await v({ t: "pay", invoice: n }, t);
      return i?.t !== "paid" ? null : typeof i.preimage == "string" && /^[0-9a-f]{64}$/u.test(i.preimage) ? { preimage: i.preimage } : {};
    },
    async tip(e, t) {
      const n = Q(e.sats);
      if (!n || e.to !== void 0 && !/^[0-9a-f]{64}$/u.test(e.to)) return null;
      const i = await v({ t: "tip", sats: n, ...e.to ? { to: e.to } : {} }, t);
      return i?.t !== "paid" ? null : typeof i.preimage == "string" && /^[0-9a-f]{64}$/u.test(i.preimage) ? { preimage: i.preimage } : {};
    },
    async buy(e, t) {
      const n = G(e);
      if (!n || !H(s)) return null;
      const i = await v({ t: "buy", listing: n }, t), o = i?.t === "bought" ? O(i.receipt) : null;
      return D(o, { buyer: y.pubkey ?? "", listing: n, now: Date.now() / 1e3 }) ? { receipt: o.event, ...typeof i.delivery == "string" ? { delivery: i.delivery } : {} } : null;
    },
    async have(e) {
      const t = G(e);
      if (!t) return null;
      const n = await d({ t: "have", listing: t }).catch(() => null), i = n?.t === "receipt" ? O(n.receipt) : null;
      return D(i, { buyer: y.pubkey ?? "", listing: t, now: Date.now() / 1e3 }) ? i.event : null;
    },
    async getPublicKey() {
      if (!u.signedIn || !u.pubkey) throw new b("say who is signed in");
      return u.pubkey;
    },
    async signEvent(e) {
      const t = await d({ t: "sign", event: e }), n = t.event;
      if (t.t !== "signed" || !_(n)) throw new b("sign that");
      if (n.pubkey !== y.pubkey || n.kind !== e.kind || n.content !== e.content) throw new b("sign that");
      return n;
    },
    nip44: M("nip44"),
    nip04: M("nip04"),
    decryptEvent: (e) => E({ t: "read", event: e }, "read that"),
    destroy() {
      x = !0, window.removeEventListener("message", P);
      for (const e of l.values())
        clearTimeout(e.timer), e.reject(new Error("This BitLogin client was destroyed."));
      l.clear(), p.clear(), c.remove();
    }
  };
  async function v(e, t) {
    if (!y.unlocked) return null;
    await w();
    const n = A(), i = (k) => new Promise((T) => {
      const F = setTimeout(() => {
        l.delete(n), T(null);
      }, k);
      l.set(n, { resolve: T, reject: () => T(null), timer: F });
    }), o = i(8e3);
    if (B({ ...e, id: n }), (await o)?.t !== "asking") return null;
    const m = i(ne + 1e4);
    let f = !1;
    try {
      f = await t?.show?.() === !0;
    } catch {
      f = !1;
    }
    if (!f && !window.open(`${s}/connect/`, "bitlogin-connect", "popup,width=480,height=760")) {
      const k = l.get(n);
      return k && (clearTimeout(k.timer), l.delete(n)), null;
    }
    return m;
  }
  function j(e) {
    const t = (n) => {
      e(n) && p.delete(t);
    };
    return p.add(t), () => p.delete(t);
  }
}
export {
  b as BitLoginRefused,
  ae as createBitLoginClient
};
