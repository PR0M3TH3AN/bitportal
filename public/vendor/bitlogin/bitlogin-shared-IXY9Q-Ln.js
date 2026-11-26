import { Amount as f } from "./bitlogin-shared-BooorIKj.js";
import { bC as h, aD as g, bD as y } from "./bitlogin-shared-BkXi7a9G.js";
import { N as x } from "./bitlogin-shared-BkXi7a9G.js";
const w = (t) => ({
  keys: Object.fromEntries(Object.entries(t.keys).map(([a, r]) => [String(a), r])),
  unit: t.unit,
  ...t.fee ? { input_fee_ppk: t.fee } : {},
  ...t.expiry ? { final_expiry: t.expiry } : {}
}), p = (t, a) => t.map((r, o) => {
  const n = a[o], e = n.dleq && typeof n.dleq.e == "string" && typeof n.dleq.s == "string" ? { e: n.dleq.e, s: n.dleq.s } : void 0;
  return { counter: r.counter, amount: Number(n.amount), C_: n.C_, ...e ? { dleq: e } : {} };
}), _ = (t) => {
  const a = [];
  for (let r = 1; t > 0; r *= 2, t = Math.floor(t / 2)) t % 2 && a.push(r);
  return a;
};
async function c(t, a) {
  const { outputs: r } = await t.mint.restore({ outputs: a.map((e) => ({ amount: f.from(1), id: e.id, B_: e.B_ })) }), o = new Set(r.map((e) => e.B_)), n = a.filter((e) => o.has(e.B_)).map((e) => e.counter);
  return n.length ? Math.max(...n) : null;
}
function k(t) {
  const a = () => t.wallet.keysetId;
  async function r(o) {
    const n = await t.seed.lane(o);
    if (n) return n;
    const e = new Set(t.used ?? []), l = await h(async (s) => e.has(s) || await c(t.wallet, await t.seed.blinded(o, g(s), y)) !== null, t.random);
    return l === null ? null : t.seed.draw(o, l);
  }
  return {
    lane: () => r(a()),
    /** Claim a paid funding quote's sats as seeded proofs. */
    async add(o, n) {
      const e = a(), l = _(o);
      if (!await r(e)) throw Object.assign(new Error("Every lane of this mint is in use: the wallet stays unseeded here."), { code: "no-lane" });
      for (let s = 0; s < 6; s++) {
        const u = await t.seed.reserve(e, l, w(t.wallet.keyChain.getKeyset(e)));
        if (t.checkFirst !== !1) {
          const i = await c(t.wallet, u.outputs);
          if (i !== null) {
            await t.seed.forward(e, i + 1);
            continue;
          }
        }
        let m;
        try {
          ({ signatures: m } = await t.wallet.mint.mintBolt11({ quote: typeof n == "string" ? n : n.quote, outputs: u.outputs.map((i) => ({ amount: i.amount, id: i.id, B_: i.B_ })) }));
        } catch (i) {
          if (await c(t.wallet, u.outputs).catch(() => null) === null) throw i;
          await t.seed.forward(e, Math.max(...u.outputs.map((d) => d.counter)) + 1);
          continue;
        }
        try {
          return await t.seed.unblind(e, w(t.wallet.keyChain.getKeyset(e)), p(u.outputs, m));
        } catch (i) {
          throw i?.code === "no-dleq" ? Object.assign(new Error("The mint signed these sats but didn't prove it, so BitLogin hasn't finished them. They are at the mint: restoring from your key finds them once it proves them."), { code: "no-dleq" }) : i;
        }
      }
      throw new Error("The mint kept refusing these counters: nothing was spent, and the invoice can be claimed again.");
    }
  };
}
export {
  x as NO_SEED_HERE,
  k as createSeededMint,
  w as keysetGiven,
  c as signedAmong,
  p as signedFor
};
