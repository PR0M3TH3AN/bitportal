import { v as C } from "./bitlogin-shared-BZPITbpl.js";
import { c as N, r as E, S as x, P as L } from "./bitlogin-shared-BGjrJsFT.js";
class g extends Error {
  constructor(i) {
    super(`BitLogin refused to ${i}. The application may not be allowed to, or the user may have signed out.`), this.name = "BitLoginRefused";
  }
}
const A = (s, i) => !!s && i.sign.every((r) => s.sign.includes(r)) && i.read.every((r) => s.read.includes(r)) && i.appData.every((r) => s.appData.includes(r) || s.appData.includes("*")) && i.proofs.every((r) => s.proofs.includes(r)) && i.peers.every((r) => s.peers.includes(r));
function U(s) {
  const i = N(s.at);
  if (!i) throw new Error("`at` must be the sign-in address's origin, such as https://bitlogin.network");
  const r = E(s.permissions);
  if (!r) throw new Error("`permissions` is not a permission set BitLogin will show a user. See docs/sign-in-window.md §SW9.2.");
  const O = s.timeoutMs ?? 2e4, a = document.createElement("iframe");
  a.src = `${i}/signer/`, a.title = "BitLogin signer", a.setAttribute("aria-hidden", "true"), a.tabIndex = -1, a.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;top:0;border:0;opacity:0;pointer-events:none";
  let c = { signedIn: !1 }, h = {};
  const d = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
  let m = !1;
  const S = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (e) => e.toString(16).padStart(2, "0")).join(""), B = (e) => {
    const t = e.unlocked === !0 && typeof e.pubkey == "string", n = t ? E(e.permissions) ?? void 0 : void 0, o = t && A(n, r);
    h = { unlocked: t, ...t ? { pubkey: e.pubkey } : {} };
    const l = {
      signedIn: o,
      ...o ? { pubkey: e.pubkey } : {},
      ...o && typeof e.name == "string" ? { name: e.name } : {},
      ...o && typeof e.until == "number" ? { until: e.until } : {},
      ...t && !o ? { needsMore: !0 } : {}
    }, R = JSON.stringify(l) !== JSON.stringify(c);
    if (c = l, R) for (const M of d) M(c);
  }, v = (e) => {
    if (e.source !== a.contentWindow || e.origin !== i) return;
    const t = e.data;
    if (!t || typeof t != "object" || t.nswp !== x || t.v !== L) return;
    if (t.t === "ready") return void y();
    if (t.t === "state" && B(t), typeof t.id != "string") return;
    const n = u.get(t.id);
    n && (u.delete(t.id), clearTimeout(n.timer), n.resolve(t));
  }, P = (e) => a.contentWindow?.postMessage({ nswp: x, v: L, ...e }, i), p = (e) => new Promise((t, n) => {
    if (m) return n(new Error("This BitLogin client was destroyed."));
    const o = S(), l = setTimeout(() => {
      u.delete(o), n(new Error("BitLogin's signer did not answer."));
    }, O);
    u.set(o, { resolve: t, reject: n, timer: l }), b.then(() => P({ ...e, id: o }));
  });
  let y = () => {
  };
  const b = new Promise((e) => {
    y = e;
  });
  let I = null;
  const w = () => I ??= (async () => (await b, await p({ t: "want", permissions: r }), c))().catch((e) => {
    throw I = null, e;
  });
  window.addEventListener("message", v), a.addEventListener("load", () => y()), (s.mount ?? document.body).append(a), w().catch(() => {
  });
  const f = async (e, t) => {
    const n = await p(e);
    if (n.t !== "text" || typeof n.text != "string") throw new g(t);
    return n.text;
  }, k = (e) => ({
    encrypt: (t, n) => f({ t: "encrypt", peer: t, text: n, scheme: e }, "encrypt that"),
    decrypt: (t, n) => f({ t: "decrypt", peer: t, text: n, scheme: e }, "decrypt that")
  });
  return {
    ready: () => w(),
    state: () => c,
    onChange(e) {
      return d.add(e), () => d.delete(e);
    },
    async signIn() {
      await w();
      const e = window.open(`${i}/connect/`, "bitlogin-connect", "popup,width=480,height=760");
      return e ? new Promise((t) => {
        const n = T((l) => l.signedIn ? (clearInterval(o), t(!0), !0) : !1), o = setInterval(() => {
          e.closed && (clearInterval(o), p({ t: "state" }).catch(() => {
          }).then(() => {
            n(), t(c.signedIn);
          }));
        }, 400);
      }) : !1;
    },
    async switchAccount() {
      await w();
      const e = window.open(`${i}/connect/#switch`, "bitlogin-connect", "popup,width=480,height=760");
      return e ? new Promise((t) => {
        const n = setInterval(() => {
          e.closed && (clearInterval(n), p({ t: "state" }).catch(() => {
          }).then(() => t(c.signedIn)));
        }, 400);
      }) : !1;
    },
    async signOut() {
      await p({ t: "lock" });
    },
    async getPublicKey() {
      if (!c.signedIn || !c.pubkey) throw new g("say who is signed in");
      return c.pubkey;
    },
    async signEvent(e) {
      const t = await p({ t: "sign", event: e }), n = t.event;
      if (t.t !== "signed" || !C(n)) throw new g("sign that");
      if (n.pubkey !== h.pubkey || n.kind !== e.kind || n.content !== e.content) throw new g("sign that");
      return n;
    },
    nip44: k("nip44"),
    nip04: k("nip04"),
    decryptEvent: (e) => f({ t: "read", event: e }, "read that"),
    destroy() {
      m = !0, window.removeEventListener("message", v);
      for (const e of u.values())
        clearTimeout(e.timer), e.reject(new Error("This BitLogin client was destroyed."));
      u.clear(), d.clear(), a.remove();
    }
  };
  function T(e) {
    const t = (n) => {
      e(n) && d.delete(t);
    };
    return d.add(t), () => d.delete(t);
  }
}
export {
  g as BitLoginRefused,
  U as createBitLoginClient
};
