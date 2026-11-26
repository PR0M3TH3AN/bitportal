import { CheckStateEnum as I, Amount as P } from "./bitlogin-shared-BooorIKj.js";
import { bB as j, aE as q, aD as O, aF as A, aG as v } from "./bitlogin-shared-BkXi7a9G.js";
import { keysetGiven as D } from "./bitlogin-shared-IXY9Q-Ln.js";
const y = 100, F = 300, H = 100, K = "This mint doesn't prove what it signs, so restoring from it from your key isn't offered. Its sats are kept on relays.", B = 500;
async function Y(i) {
  const { wallet: t } = i;
  if ((await t.mint.getInfo()).nuts?.["12"]?.supported !== !0) throw Object.assign(new Error(K), { code: "no-dleq" });
  const g = t.keyChain.getKeysets().filter((n) => n.unit === "sat" && n.hasHexId), u = [], w = {};
  let k = 0, E = 0;
  for (const n of g) {
    const f = await t.keyChain.ensureKeysetKeys(n.id), l = f.id, m = [], T = async (e, o, h) => {
      let r = e, s = null;
      for (; ; ) {
        const b = Math.min(h(s), o + 1);
        if (r >= b) break;
        const M = Math.min(H, b - r), d = await i.seed.blinded(l, r, M);
        if (k += d.length, d.length) {
          const { outputs: x, signatures: C } = await t.mint.restore({ outputs: d.map((a) => ({ amount: P.from(1), id: a.id, B_: a.B_ })) }), S = new Map(x.map((a, c) => [a.B_, C[c]]));
          for (const a of d) {
            const c = S.get(a.B_);
            if (!c) continue;
            const p = c.dleq;
            if (typeof p?.e != "string" || typeof p?.s != "string") {
              E++, s = Math.max(s ?? 0, a.counter);
              continue;
            }
            m.push({ counter: a.counter, amount: Number(c.amount), C_: c.C_, dleq: { e: p.e, s: p.s } }), s = Math.max(s ?? 0, a.counter);
          }
        }
        r += M;
      }
      return s;
    }, L = i.highest?.(l) ?? {};
    for (let e = 0; e < j; e++) {
      const o = O(e), h = L[e] ?? 0, r = await T(o, q(e), (s) => Math.max(s === null ? o + y : s + 1 + F, h + 1));
      r !== null && ((w[l] ??= {})[e] = r + 1);
    }
    if (await T(A, v, (e) => e === null ? A + y : e + 1 + y), m.length) {
      const e = D(f);
      for (let o = 0; o < m.length; o += B) u.push(...await i.seed.unblind(l, e, m.slice(o, o + B)));
    }
  }
  const _ = () => t.checkProofsStates(u), N = u.length ? await _().catch((n) => R(n) ? _() : Promise.reject(n)) : [];
  return { proofs: u.filter((n, f) => N[f]?.state !== I.SPENT), next: w, asked: k, keysets: g.map((n) => n.id), skipped: E };
}
function R(i) {
  const t = i;
  return !t || typeof t != "object" || typeof t.status == "number" ? !1 : t.name === "NetworkError" || t.name === "TypeError" || t.cause instanceof Error && t.cause.name === "TypeError";
}
export {
  y as EMPTY_LANE,
  K as NO_DLEQ,
  F as PAST_LAST,
  Y as restoreFromMint
};
