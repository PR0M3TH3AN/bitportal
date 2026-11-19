import { b as L, h as w } from "./bitlogin-shared-DDEwyvg-.js";
function S(p = {}) {
  const l = typeof window > "u" ? null : window.opener;
  if (!l) return Promise.resolve(null);
  const r = location.origin, v = crypto.getRandomValues(new Uint8Array(12)), s = Array.from(v, (o) => o.toString(16).padStart(2, "0")).join("");
  return new Promise((o) => {
    let n = null, a = !1, c = null;
    const d = () => {
      if (!n)
        try {
          const t = l.frames;
          for (let e = 0; e < t.length; e++) t[e].postMessage(w({ t: "hello", nonce: s }), r);
        } catch {
        }
    }, f = setInterval(d, 350), y = setTimeout(() => {
      clearInterval(f), a || (a = !0, window.removeEventListener("message", i), o(null));
    }, p.timeoutMs ?? 6e3), i = (t) => {
      if (t.origin !== r || !t.source || t.source === window) return;
      const e = L(t.data);
      if (!e || e.nonce !== s) return;
      if (e.t === "done" && n && t.source === n) return void c?.(e.ok);
      if (e.t !== "frame" || n) return;
      n = t.source, clearInterval(f), clearTimeout(y), a = !0;
      const { world: u, recipient: M } = e;
      o({
        site: u,
        async grant(h, m) {
          const E = await h.exportHandoff(M), b = new Promise((g) => {
            c = g, setTimeout(() => g(!1), 8e3);
          });
          n.postMessage(w({ t: "grant", nonce: s, world: u, sealed: E, ...m ? { name: m } : {} }), r);
          const I = await b;
          return window.removeEventListener("message", i), I;
        }
      });
    };
    window.addEventListener("message", i), d();
  });
}
export {
  S as findEmbeddedSigner
};
