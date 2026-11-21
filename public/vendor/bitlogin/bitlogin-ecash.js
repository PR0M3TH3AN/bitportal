import { s as m, c as q, a as B } from "./bitlogin-shared-19Ribcs2.js";
import { r as D } from "./bitlogin-shared-CjWz8W3w.js";
let C = null;
const y = () => C ??= import("./bitlogin-shared-BooorIKj.js");
class i extends Error {
  constructor(n, d) {
    super(d), this.code = n, this.name = "EcashError";
  }
}
const k = (c) => c.map((n) => ({ id: n.id, amount: typeof n.amount == "number" ? n.amount : n.amount.toNumber(), secret: n.secret, C: n.C }));
function $(c) {
  let n = { mints: [], tokens: [], offline: !1, unsaved: !1 };
  const d = /* @__PURE__ */ new Map(), h = (t) => {
    let e = d.get(t);
    return e || (e = y().then(async ({ Wallet: a }) => {
      const s = new a(t, { unit: "sat" });
      return await s.loadMint(), s;
    }), e.catch(() => d.delete(t)), d.set(t, e)), e;
  }, b = (t) => n.tokens.filter((e) => e.mint === t), v = (t) => b(t).flatMap((e) => e.proofs), w = (t) => m(v(t)), u = (t) => t instanceof i ? t : new i("mint", `The mint did not do that: ${t?.message ?? "no answer"}`);
  async function M() {
    for (const t of [...new Set(n.tokens.map((e) => e.mint))]) {
      const e = b(t);
      try {
        const { CheckStateEnum: a } = await y(), s = await h(t), o = [], f = [];
        for (const l of e) {
          const T = await s.checkProofsStates(l.proofs), g = l.proofs.filter((S, p) => T[p]?.state !== a.SPENT);
          g.length !== l.proofs.length && (o.push(l), f.push(...g));
        }
        o.length && (n = await c.roll({ destroy: o.map((l) => l.event), keep: [{ mint: t, proofs: f }] }));
      } catch {
      }
    }
  }
  return {
    /** Open the wallet: read it, then put right anything a mint says is spent. */
    async open() {
      return n = await c.load(), n.offline || await M(), n;
    },
    state: () => n,
    balance: (t) => t ? w(t) : m(n.tokens.flatMap((e) => e.proofs)),
    balances: () => [.../* @__PURE__ */ new Set([...n.mints, ...n.tokens.map((t) => t.mint)])].map((t) => ({ mint: t, sats: w(t) })),
    /** Add a mint to the wallet, once it has answered as one. Making the wallet, where there is none. */
    async addMint(t) {
      const e = B(t);
      if (!e) throw new i("bad-input", "That is not a mint's address. It starts with https://.");
      try {
        await h(e);
      } catch (a) {
        throw u(a);
      }
      return n = await c.setMints([.../* @__PURE__ */ new Set([...n.mints, e])]), n;
    },
    async removeMint(t) {
      if (w(t) > 0) throw new i("bad-input", "That mint still holds sats of yours. Spend them first.");
      const e = n.mints.filter((a) => a !== t);
      if (e.length === 0) throw new i("bad-input", "A wallet needs one mint.");
      return n = await c.setMints(e), n;
    },
    /** An invoice to pay, to add sats at a mint. Nothing is added until it is paid and `claim` is called. */
    async fund(t, e) {
      if (!n.mints.includes(t)) throw new i("no-wallet", "That mint is not in this wallet.");
      if (!Number.isSafeInteger(e) || e <= 0 || e > 1e6) throw new i("bad-input", "Choose a whole number of sats, up to a million.");
      try {
        const a = await (await h(t)).createMintQuoteBolt11(e);
        return { mint: t, amount: e, invoice: a.request, quote: a.quote };
      } catch (a) {
        throw u(a);
      }
    },
    /** Take the sats of a funding invoice, once it is paid. Resolves false while it is not. */
    async claim(t) {
      try {
        const { MintQuoteState: e } = await y(), a = await h(t.mint), s = await a.checkMintQuoteBolt11(t.quote);
        if (s.state !== e.PAID) return !1;
        const o = k(await a.mintProofsBolt11(t.amount, s));
        return n = await c.roll({ destroy: [], keep: [{ mint: t.mint, proofs: o }], history: { direction: "in", amount: m(o) } }), !0;
      } catch (e) {
        throw u(e);
      }
    },
    /** Take in a Cashu token someone gave: it is swapped at its mint for proofs only this wallet knows. */
    async receive(t) {
      const { getTokenMetadata: e } = await y();
      let a;
      try {
        a = e(t.trim());
      } catch {
        throw new i("bad-input", "That is not a Cashu token.");
      }
      const s = B(a.mint);
      if (!s || a.unit !== "sat") throw new i("bad-input", "That token is not in sats, or names no usable mint.");
      if (!n.mints.includes(s)) throw new i("no-wallet", `That token is from ${s}, which is not one of your mints. Add the mint first if you trust it.`);
      try {
        const o = k(await (await h(s)).receive(t.trim()));
        return n = await c.roll({ destroy: [], keep: [{ mint: s, proofs: o }], history: { direction: "in", amount: m(o) } }), { mint: s, sats: m(o) };
      } catch (o) {
        throw u(o);
      }
    },
    /** What paying an invoice would cost, from the mint that can best afford it. Spends nothing. */
    async quote(t, e) {
      const a = q(t);
      if (!a) throw new i("bad-input", "That is not a Lightning invoice.");
      const s = e ?? [...n.mints].sort((o, f) => w(f) - w(o))[0];
      if (!s) throw new i("no-wallet", "There is no ecash wallet for this account yet.");
      try {
        const o = await (await h(s)).createMeltQuoteBolt11(a);
        return { mint: s, invoice: a, amount: o.amount.toNumber(), feeReserve: o.fee_reserve.toNumber(), quote: o };
      } catch (o) {
        throw u(o);
      }
    },
    /**
     * Pay it. The proofs to spend are chosen (and split at the mint if need be), what was not chosen is kept at
     * once, and then the mint is asked to pay. What the mint did not use for routing comes back as change.
     */
    async pay(t) {
      const { mint: e } = t, a = t.amount + t.feeReserve;
      if (w(e) < a) throw new i("not-enough", `This needs up to ${a} sats, and the wallet holds ${w(e)} at that mint.`);
      const s = b(e), o = v(e), f = w(e);
      let l;
      try {
        const P = await (await h(e)).send(a, o, { includeFees: !0 });
        l = k(P.send), n = await c.roll({ destroy: s.map((Q) => Q.event), keep: [{ mint: e, proofs: [...k(P.keep), ...l] }] });
      } catch (r) {
        throw /insufficient|not enough|balance/iu.test(r?.message ?? "") ? new i("not-enough", "The wallet does not hold enough at that mint to cover this and the mint's fees.") : u(r);
      }
      const T = b(e), g = new Set(l.map((r) => r.secret)), S = v(e).filter((r) => !g.has(r.secret));
      let p;
      try {
        p = await (await h(e)).meltProofsBolt11(t.quote, l);
      } catch (r) {
        throw await M(), u(r);
      }
      const { MeltQuoteState: I } = await y();
      if (p.quote.state !== I.PAID)
        throw await M(), new i("not-paid", "The mint has not paid it yet. If it does, the sats are spent; if not, they stay yours. Open the wallet again in a minute to see.");
      const E = k(p.change), A = f - m(S) - m(E);
      return n = await c.roll({ destroy: T.map((r) => r.event), keep: [{ mint: e, proofs: [...S, ...E] }], history: { direction: "out", amount: A } }), { paid: t.amount, fee: A - t.amount, preimage: p.quote.payment_preimage ?? null };
    }
  };
}
export {
  i as EcashError,
  q as cleanInvoice,
  B as cleanMint,
  $ as createEcashWallet,
  D as renderQrSvg
};
