import { v as O } from "./bitlogin-shared-Cj9s0_W_.js";
import { y as z, z as D, A as Y, n as H, r as N, B as Q, l as X, c as Z, C as ee, D as U, E as W, b as G, f as te, U as K, F as ne, G as ie } from "./bitlogin-shared-BkXi7a9G.js";
class h extends Error {
  constructor(s) {
    super(`BitLogin refused to ${s}. The application may not be allowed to, or the user may have signed out.`), this.name = "BitLoginRefused";
  }
}
const re = (o, s) => !!o && s.sign.every((a) => o.sign.includes(a)) && s.read.every((a) => o.read.includes(a)) && s.appData.every((a) => o.appData.includes(a) || o.appData.includes("*")) && s.proofs.every((a) => o.proofs.includes(a)) && s.peers.every((a) => o.peers.includes(a)), se = 3e3;
function ce(o) {
  const s = z(o.at);
  if (!s) throw new Error("`at` must be the sign-in address's origin, such as https://bitlogin.network");
  const a = D(o.permissions);
  if (!a) throw new Error("`permissions` is not a permission set BitLogin will show a user. See docs/sign-in-window.md §SW9.2.");
  const F = o.timeoutMs ?? 2e4, A = Y(s) ? H(o.localUnlockService) : null, $ = (e) => te(e, A ? [...K, A] : K), u = document.createElement("iframe");
  u.src = `${s}/signer/`, u.title = "BitLogin signer", u.setAttribute("aria-hidden", "true"), u.tabIndex = -1, u.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;top:0;border:0;opacity:0;pointer-events:none";
  let c = { signedIn: !1 }, w = { unlocked: !1 }, E, m;
  const v = typeof o.family == "string" ? o.family : void 0, J = v !== void 0 && o.guest === !0, f = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map();
  let B = !1;
  const b = /* @__PURE__ */ new Map(), T = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (e) => e.toString(16).padStart(2, "0")).join(""), V = (e) => {
    const t = e.unlocked === !0 && typeof e.pubkey == "string";
    typeof e.taken == "boolean" && (E = e.taken), v !== void 0 && typeof e.familyTaken == "boolean" && (m = e.familyTaken);
    const n = t ? D(e.permissions) ?? void 0 : void 0, i = t && re(n, a);
    w = { unlocked: t, ...t ? { pubkey: e.pubkey } : {} };
    const r = {
      signedIn: i,
      ...i ? { pubkey: e.pubkey } : {},
      ...i && typeof e.name == "string" ? { name: e.name } : {},
      ...i && typeof e.until == "number" ? { until: e.until } : {},
      ...t && !i ? { needsMore: !0 } : {},
      ...E !== void 0 ? { canAsk: E } : {},
      ...m !== void 0 ? { familyTaken: m } : {},
      // A guest is who they are here, for what a guest may do: not this application's set.
      ...t && e.guest === !0 ? { guest: !0, pubkey: e.pubkey } : {}
    }, y = JSON.stringify(r) !== JSON.stringify(c);
    if (c = r, y) for (const g of f) g(c);
  }, C = (e) => {
    if (e.source !== u.contentWindow || e.origin !== s) return;
    const t = e.data;
    if (!t || typeof t != "object" || t.nswp !== U || t.v !== W) return;
    if (t.t === "ready") return void x();
    if (t.t === "state" && V(t), typeof t.id != "string") return;
    const n = b.get(t.id);
    if (n) return n(t);
    const i = l.get(t.id);
    i && (l.delete(t.id), clearTimeout(i.timer), i.resolve(t));
  }, k = (e) => u.contentWindow?.postMessage({ nswp: U, v: W, ...e }, s), p = (e) => new Promise((t, n) => {
    if (B) return n(new Error("This BitLogin client was destroyed."));
    const i = T(), r = setTimeout(() => {
      l.delete(i), n(new Error("BitLogin's signer did not answer."));
    }, F);
    l.set(i, { resolve: t, reject: n, timer: r }), M.then(() => k({ ...e, id: i }));
  });
  let x = () => {
  };
  const M = new Promise((e) => {
    x = e;
  });
  let R = null;
  const d = () => R ??= (async () => (await M, v !== void 0 && (!await Promise.race([p({ t: "want", family: v, ...J ? { guest: !0 } : {} }).then(() => !0, () => !1), new Promise((t) => setTimeout(() => t(!1), se))]) || m === void 0) && (m = !1), await p({ t: "want", permissions: a }), c))().catch((e) => {
    throw R = null, e;
  });
  window.addEventListener("message", C), u.addEventListener("load", () => x()), (o.mount ?? document.body).append(u), d().catch(() => {
  });
  const L = async (e, t) => {
    const n = await p(e);
    if (n.t !== "text" || typeof n.text != "string") throw new h(t);
    return n.text;
  }, _ = (e) => ({
    encrypt: (t, n) => L({ t: "encrypt", peer: t, text: n, scheme: e }, "encrypt that"),
    decrypt: (t, n) => L({ t: "decrypt", peer: t, text: n, scheme: e }, "decrypt that")
  });
  return {
    ready: () => d(),
    state: () => c,
    onChange(e) {
      return f.add(e), () => f.delete(e);
    },
    async signIn() {
      await d();
      const e = window.open(`${s}/connect/`, "bitlogin-connect", "popup,width=480,height=760");
      return e ? new Promise((t) => {
        const n = j((r) => r.signedIn ? (clearInterval(i), t(!0), !0) : !1), i = setInterval(() => {
          e.closed && (clearInterval(i), p({ t: "state" }).catch(() => {
          }).then(() => {
            n(), t(c.signedIn);
          }));
        }, 400);
      }) : !1;
    },
    async signInFromPhone() {
      await d();
      const e = window.open(`${s}/headset/`, "bitlogin-headset", "popup");
      return e ? new Promise((t) => {
        const n = setInterval(() => {
          e.closed && (clearInterval(n), p({ t: "state" }).catch(() => {
          }).then(() => t(c.signedIn)));
        }, 400);
      }) : !1;
    },
    async switchAccount() {
      await d();
      const e = window.open(`${s}/connect/#switch`, "bitlogin-connect", "popup,width=480,height=760");
      return e ? new Promise((t) => {
        const n = setInterval(() => {
          e.closed && (clearInterval(n), p({ t: "state" }).catch(() => {
          }).then(() => t(c.signedIn)));
        }, 400);
      }) : !1;
    },
    async roomPass(e) {
      await d();
      const t = await p({ t: "pass", session: e });
      if (t.t !== "signed" || !O(t.event)) throw new h("make a room pass");
      return t.event;
    },
    async signOut() {
      await p({ t: "lock" });
    },
    pair(e) {
      const t = T();
      let n = () => {
      };
      const i = new Promise((r) => {
        n = (y) => {
          b.delete(t), r(y);
        };
      });
      return b.set(t, (r) => {
        if (r.t === "pairing" && typeof r.code == "string" && typeof r.url == "string" && r.url.startsWith(`${s}/pair/#`) && typeof r.expires == "number") {
          e({ code: r.code, url: r.url, expires: r.expires, ...typeof r.number == "number" ? { number: r.number } : {} });
          return;
        }
        if (r.t === "paired") return n(!0);
        if (r.t === "pairing-expired" || r.t === "refused") return n(!1);
      }), d().then(() => k({ t: "pair", id: t })).catch(() => n(!1)), {
        done: i,
        cancel() {
          b.has(t) && (k({ t: "pairCancel", id: t }), n(!1));
        }
      };
    },
    async propose(e, t) {
      if (!ee.includes(e.kind)) return null;
      const n = await I({ t: "propose", event: { kind: e.kind, content: e.content, tags: e.tags } }, t), i = n?.event;
      if (n?.t !== "signed" || !O(i)) return null;
      const r = (y) => JSON.stringify(y.filter((g) => g[0] !== ne));
      return i.pubkey !== w.pubkey || i.kind !== e.kind || i.content !== e.content || r(i.tags) !== r(e.tags) ? null : i;
    },
    async pay(e, t) {
      const n = Z(e);
      if (!n) return null;
      const i = await I({ t: "pay", invoice: n }, t);
      return i?.t !== "paid" ? null : typeof i.preimage == "string" && /^[0-9a-f]{64}$/u.test(i.preimage) ? { preimage: i.preimage } : {};
    },
    async tip(e, t) {
      const n = X(e.sats);
      if (!n || e.to !== void 0 && !/^[0-9a-f]{64}$/u.test(e.to)) return null;
      const i = await I({ t: "tip", sats: n, ...e.to ? { to: e.to } : {} }, t);
      return i?.t !== "paid" ? null : typeof i.preimage == "string" && /^[0-9a-f]{64}$/u.test(i.preimage) ? { preimage: i.preimage } : {};
    },
    async buy(e, t) {
      const n = G(e);
      if (!n || !Q(s)) return null;
      const i = await I({ t: "buy", listing: n }, t), r = i?.t === "bought" ? $(i.receipt) : null;
      return N(r, { buyer: w.pubkey ?? "", listing: n, now: Date.now() / 1e3 }) ? { receipt: r.event, ...typeof i.delivery == "string" ? { delivery: i.delivery } : {} } : null;
    },
    async have(e) {
      const t = G(e);
      if (!t) return null;
      const n = await p({ t: "have", listing: t }).catch(() => null), i = n?.t === "receipt" ? $(n.receipt) : null;
      return N(i, { buyer: w.pubkey ?? "", listing: t, now: Date.now() / 1e3 }) ? i.event : null;
    },
    async getPublicKey() {
      if (!c.signedIn || !c.pubkey) throw new h("say who is signed in");
      return c.pubkey;
    },
    async signEvent(e) {
      const t = await p({ t: "sign", event: e }), n = t.event;
      if (t.t !== "signed" || !O(n)) throw new h("sign that");
      if (n.pubkey !== w.pubkey || n.kind !== e.kind || n.content !== e.content) throw new h("sign that");
      return n;
    },
    nip44: _("nip44"),
    nip04: _("nip04"),
    decryptEvent: (e) => L({ t: "read", event: e }, "read that"),
    destroy() {
      B = !0, window.removeEventListener("message", C);
      for (const e of l.values())
        clearTimeout(e.timer), e.reject(new Error("This BitLogin client was destroyed."));
      l.clear(), f.clear(), u.remove();
    }
  };
  async function I(e, t) {
    if (!w.unlocked) return null;
    await d();
    const n = T(), i = (S) => new Promise((P) => {
      const q = setTimeout(() => {
        l.delete(n), P(null);
      }, S);
      l.set(n, { resolve: P, reject: () => P(null), timer: q });
    }), r = i(8e3);
    if (k({ ...e, id: n }), (await r)?.t !== "asking") return null;
    const y = i(ie + 1e4);
    let g = !1;
    try {
      g = await t?.show?.() === !0;
    } catch {
      g = !1;
    }
    if (!g && !window.open(`${s}/connect/`, "bitlogin-connect", "popup,width=480,height=760")) {
      const S = l.get(n);
      return S && (clearTimeout(S.timer), l.delete(n)), null;
    }
    return y;
  }
  function j(e) {
    const t = (n) => {
      e(n) && f.delete(t);
    };
    return f.add(t), () => f.delete(t);
  }
}
export {
  h as BitLoginRefused,
  ce as createBitLoginClient
};
