import { s as P, c as j, a as R, b as q, i as L, r as U, d as H } from "./bitlogin-shared-BK8HgLxP.js";
import { L as te, P as ne, T as oe, U as re, e as se, f as ae, g as ie, h as ce, j as le, k as de, l as ue, o as he, m as pe, n as we, p as fe, t as ye, u as me } from "./bitlogin-shared-BK8HgLxP.js";
import { r as be } from "./bitlogin-shared-CjWz8W3w.js";
import { v as B } from "./bitlogin-shared-CvPtgHf2.js";
let K = null;
const x = () => K ??= import("./bitlogin-shared-BooorIKj.js");
class v extends Error {
  constructor(r, h) {
    super(h), this.code = r, this.name = "EcashError";
  }
}
const N = (l) => l.map((r) => ({ id: r.id, amount: typeof r.amount == "number" ? r.amount : r.amount.toNumber(), secret: r.secret, C: r.C }));
function F(l) {
  let r = { mints: [], tokens: [], offline: !1, unsaved: !1 };
  const h = /* @__PURE__ */ new Map(), i = (t) => {
    let e = h.get(t);
    return e || (e = x().then(async ({ Wallet: s }) => {
      const o = new s(t, { unit: "sat" });
      return await o.loadMint(), o;
    }), e.catch(() => h.delete(t)), h.set(t, e)), e;
  }, m = (t) => r.tokens.filter((e) => e.mint === t), y = (t) => m(t).flatMap((e) => e.proofs), f = (t) => P(y(t)), u = (t) => t instanceof v ? t : new v("mint", `The mint did not do that: ${t?.message ?? "no answer"}`);
  async function g() {
    for (const t of [...new Set(r.tokens.map((e) => e.mint))]) {
      const e = m(t);
      try {
        const { CheckStateEnum: s } = await x(), o = await i(t), n = [], a = [];
        for (const d of e) {
          const p = await o.checkProofsStates(d.proofs), c = d.proofs.filter((k, S) => p[S]?.state !== s.SPENT);
          c.length !== d.proofs.length && (n.push(d), a.push(...c));
        }
        n.length && (r = await l.roll({ destroy: n.map((d) => d.event), keep: [{ mint: t, proofs: a }] }));
      } catch {
      }
    }
  }
  return {
    /** Open the wallet: read it, then put right anything a mint says is spent. */
    async open() {
      return r = await l.load(), r.offline || await g(), r;
    },
    state: () => r,
    balance: (t) => t ? f(t) : P(r.tokens.flatMap((e) => e.proofs)),
    balances: () => [.../* @__PURE__ */ new Set([...r.mints, ...r.tokens.map((t) => t.mint)])].map((t) => ({ mint: t, sats: f(t) })),
    /** Add a mint to the wallet, once it has answered as one. Making the wallet, where there is none. */
    async addMint(t) {
      const e = R(t);
      if (!e) throw new v("bad-input", "That is not a mint's address. It starts with https://.");
      try {
        await i(e);
      } catch (s) {
        throw u(s);
      }
      return r = await l.setMints([.../* @__PURE__ */ new Set([...r.mints, e])]), r;
    },
    async removeMint(t) {
      if (f(t) > 0) throw new v("bad-input", "That mint still holds sats of yours. Spend them first.");
      const e = r.mints.filter((s) => s !== t);
      if (e.length === 0) throw new v("bad-input", "A wallet needs one mint.");
      return r = await l.setMints(e), r;
    },
    /** An invoice to pay, to add sats at a mint. Nothing is added until it is paid and `claim` is called. */
    async fund(t, e) {
      if (!r.mints.includes(t)) throw new v("no-wallet", "That mint is not in this wallet.");
      if (!Number.isSafeInteger(e) || e <= 0 || e > 1e6) throw new v("bad-input", "Choose a whole number of sats, up to a million.");
      try {
        const s = await (await i(t)).createMintQuoteBolt11(e);
        return { mint: t, amount: e, invoice: s.request, quote: s.quote };
      } catch (s) {
        throw u(s);
      }
    },
    /** Take the sats of a funding invoice, once it is paid. Resolves false while it is not. */
    async claim(t) {
      try {
        const { MintQuoteState: e } = await x(), s = await i(t.mint), o = await s.checkMintQuoteBolt11(t.quote);
        if (o.state !== e.PAID) return !1;
        const n = N(await s.mintProofsBolt11(t.amount, o));
        return r = await l.roll({ destroy: [], keep: [{ mint: t.mint, proofs: n }], history: { direction: "in", amount: P(n) } }), !0;
      } catch (e) {
        throw u(e);
      }
    },
    /** Take in a Cashu token someone gave: it is swapped at its mint for proofs only this wallet knows. */
    async receive(t) {
      const { getTokenMetadata: e } = await x();
      let s;
      try {
        s = e(t.trim());
      } catch {
        throw new v("bad-input", "That is not a Cashu token.");
      }
      const o = R(s.mint);
      if (!o || s.unit !== "sat") throw new v("bad-input", "That token is not in sats, or names no usable mint.");
      if (!r.mints.includes(o)) throw new v("no-wallet", `That token is from ${o}, which is not one of your mints. Add the mint first if you trust it.`);
      try {
        const n = N(await (await i(o)).receive(t.trim()));
        return r = await l.roll({ destroy: [], keep: [{ mint: o, proofs: n }], history: { direction: "in", amount: P(n) } }), { mint: o, sats: P(n) };
      } catch (n) {
        throw u(n);
      }
    },
    /** What paying an invoice would cost, from the mint that can best afford it. Spends nothing. */
    async quote(t, e) {
      const s = j(t);
      if (!s) throw new v("bad-input", "That is not a Lightning invoice.");
      const o = e ?? [...r.mints].sort((n, a) => f(a) - f(n))[0];
      if (!o) throw new v("no-wallet", "There is no ecash wallet for this account yet.");
      try {
        const n = await (await i(o)).createMeltQuoteBolt11(s);
        return { mint: o, invoice: s, amount: n.amount.toNumber(), feeReserve: n.fee_reserve.toNumber(), quote: n };
      } catch (n) {
        throw u(n);
      }
    },
    /**
     * Pay it. The proofs to spend are chosen (and split at the mint if need be), what was not chosen is kept at
     * once, and then the mint is asked to pay. What the mint did not use for routing comes back as change.
     */
    async pay(t) {
      const { mint: e } = t, s = t.amount + t.feeReserve;
      if (f(e) < s) throw new v("not-enough", `This needs up to ${s} sats, and the wallet holds ${f(e)} at that mint.`);
      const o = m(e), n = y(e), a = f(e);
      let d;
      try {
        const I = await (await i(e)).send(s, n, { includeFees: !0 });
        d = N(I.send), r = await l.roll({ destroy: o.map(($) => $.event), keep: [{ mint: e, proofs: [...N(I.keep), ...d] }] });
      } catch (b) {
        throw /insufficient|not enough|balance/iu.test(b?.message ?? "") ? new v("not-enough", "The wallet does not hold enough at that mint to cover this and the mint's fees.") : u(b);
      }
      const p = m(e), c = new Set(d.map((b) => b.secret)), k = y(e).filter((b) => !c.has(b.secret));
      let S;
      try {
        S = await (await i(e)).meltProofsBolt11(t.quote, d);
      } catch (b) {
        throw await g(), u(b);
      }
      const { MeltQuoteState: T } = await x();
      if (S.quote.state !== T.PAID)
        throw await g(), new v("not-paid", "The mint has not paid it yet. If it does, the sats are spent; if not, they stay yours. Open the wallet again in a minute to see.");
      const E = N(S.change), A = a - P(k) - P(E);
      return r = await l.roll({ destroy: p.map((b) => b.event), keep: [{ mint: e, proofs: [...k, ...E] }], history: { direction: "out", amount: A } }), { paid: t.amount, fee: A - t.amount, preimage: S.quote.payment_preimage ?? null };
    }
  };
}
class D extends Error {
  constructor(r, h) {
    super("A part of this was paid, and the rest didn't go."), this.paidSats = r, this.cause_ = h, this.name = "PartPaidError";
  }
}
class w extends Error {
  constructor(r, h, i = "") {
    super(h), this.code = r, this.serviceCode = i, this.name = "PurchaseError";
  }
}
const _ = /^[0-9a-f]{64}$/u, M = /^order_[A-Za-z0-9_-]{12,80}$/u, J = async (l) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(l))), (r) => r.toString(16).padStart(2, "0")).join(""), O = () => crypto.randomUUID().replaceAll("-", "");
function C(l, r) {
  const h = () => {
    throw new w("plan", "The seller's service answered with a payment plan that doesn't match what was asked. Nothing was spent.");
  }, i = l;
  if (!i || typeof i != "object" || i.productCoordinate !== r.listing || i.buyerPubkey !== r.buyer || i.currency !== "SAT" || i.completionRule !== "all" || typeof i.orderId != "string" || !M.test(i.orderId) || !Array.isArray(i.legs) || i.legs.length < 1 || i.legs.length > 16) return h();
  const m = i.totalSats;
  if (typeof m != "number" || !Number.isSafeInteger(m) || m < 1 || m > r.priceSats) return h();
  const y = /* @__PURE__ */ new Set(), f = [];
  for (const u of i.legs) {
    const g = u?.amountSats, t = u?.status;
    if (!u || typeof g != "number" || !Number.isSafeInteger(g) || g < 1 || typeof u.paymentHash != "string" || !_.test(u.paymentHash) || y.has(u.paymentHash) || t !== "pending" && t !== "settled" && t !== "expired") return h();
    const e = typeof u.paymentRequest == "string" ? u.paymentRequest.trim().toLowerCase() : "", s = u.rail === "sandbox" && u.adapter === "mock" && /^bitunlock-mock:1:[0-9a-f]{64}$/u.test(e);
    if (t !== "settled" && !(r.sandbox ? s : u.rail === "lightning" && L(e) === g)) return h();
    y.add(u.paymentHash), f.push({ role: u.role === "seller" ? "seller" : u.role === "bitunlock" ? "service" : "other", sats: g, invoice: e, hash: u.paymentHash, status: t });
  }
  return f.reduce((u, g) => u + g.sats, 0) !== m ? h() : { order: i.orderId, totalSats: m, legs: f };
}
const W = () => O(), Q = /^[A-Za-z0-9_-]{16,128}$/u;
async function Y(l, r = (h, i) => fetch(h, i)) {
  const h = await r(`${l.endpoint}/sandbox/v1/sessions`, { method: "POST", credentials: "omit", referrerPolicy: "no-referrer", headers: { accept: "application/json", "content-type": "application/json" }, body: JSON.stringify({ ttlSeconds: 3600 }) }), i = await h.json().catch(() => null);
  if (!h.ok || typeof i?.sessionId != "string" || typeof i.token != "string" || i.sessionId.length > 200 || i.token.length > 400) throw new w("service", "The test service gave no session.");
  return { sessionId: i.sessionId, token: i.token };
}
function Z(l, r, h = {}) {
  const i = h.sandbox ?? null, m = h.fetch ?? ((o, n) => fetch(o, n)), y = () => {
    throw new w("service", "The seller's service didn't answer. Nothing was spent.");
  }, f = async (o, n, a, d = !0) => {
    const p = new URL(o, l.endpoint).toString(), c = a === void 0 ? void 0 : JSON.stringify(a), k = new AbortController(), S = setTimeout(() => k.abort(), 2e4);
    try {
      const T = d ? await r.auth({ url: p, method: n, ...n === "POST" ? { payload: await J(c ?? "") } : {} }) : "", E = await m(p, { method: n, credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", headers: { accept: "application/json", ...T ? { authorization: T } : {}, ...i && d ? { "x-bitunlock-sandbox-session": i.sessionId } : {}, ...c === void 0 ? {} : { "content-type": "application/json" } }, ...c === void 0 ? {} : { body: c }, signal: k.signal }), A = await E.text();
      if (A.length > 1e6) return y();
      const b = A ? JSON.parse(A) : null;
      if (!E.ok) {
        const I = b?.error?.code;
        throw new w("service", "The seller's service refused that. Nothing more was spent.", typeof I == "string" ? I.slice(0, 80) : "");
      }
      return b;
    } catch (T) {
      if (T instanceof w) throw T;
      return y();
    } finally {
      clearTimeout(S);
    }
  }, u = (o) => ({ listing: o.coordinate, buyer: r.pubkey, priceSats: o.priceSats, sandbox: !!i }), g = (o) => o instanceof w ? o.serviceCode : "", t = () => {
    throw new w("withdrawn", "This was withdrawn by its seller, and can't be finished.");
  }, e = (o) => {
    const n = H(o, [l]);
    return n && n.buyer === r.pubkey ? n : null;
  }, s = {
    async policy() {
      const n = (await f("/.well-known/bitunlock.json", "GET", void 0, !1))?.event;
      if (!n || n.pubkey !== l.pubkey || n.kind !== 30078 || !B(n)) return y();
      let a;
      try {
        a = JSON.parse(n.content);
      } catch {
        return y();
      }
      return a.endpoint !== l.endpoint || a.servicePubkey !== l.pubkey || a.status !== "active" ? y() : { relays: Array.isArray(a.relays) ? a.relays.filter((p) => typeof p == "string" && p.length <= 200 && /^wss?:\/\//u.test(p)).slice(0, 6) : [], sandbox: Array.isArray(a.paymentAdapters) && a.paymentAdapters.includes("mock") };
    },
    async quote(o, n) {
      try {
        return C(await f("/v1/quotes", "POST", { productCoordinate: o.coordinate, buyerPubkey: r.pubkey, idempotencyKey: n && Q.test(n) ? n : O() }), u(o));
      } catch (a) {
        throw /sold|inventory|reserved|revoked|inactive/u.test(g(a)) ? new w("sold", "This isn't for sale just now. Nothing was spent.") : a;
      }
    },
    async settle(o) {
      if (!i || !_.test(o)) throw new w("plan", "That is not a pretend payment a test service takes.");
      if (!(await m(`${l.endpoint}/sandbox/v1/payments/${o}/settle`, { method: "POST", credentials: "omit", referrerPolicy: "no-referrer", headers: { accept: "application/json", authorization: `Bearer ${i.token}`, "x-bitunlock-sandbox-session": i.sessionId } }).catch(() => null))?.ok) throw new w("service", "The test service didn't settle that pretend payment.");
    },
    async resume(o, n) {
      const a = ["quoted", "partially_paid", "paid", "expired_pending_requote"];
      if (n && M.test(n)) {
        const p = await f(`/v1/orders/${encodeURIComponent(n)}`, "GET").catch(() => null);
        if (!p || p.orderId !== n || !a.includes(String(p.state))) return null;
        try {
          return await s.refresh(o, n);
        } catch (c) {
          if (c instanceof w && c.code === "withdrawn") throw c;
          return C(p.paymentPlan, u(o));
        }
      }
      const d = await f(`/v1/orders?${new URLSearchParams({ productCoordinate: o.coordinate })}`, "GET").catch(() => null);
      for (const p of Array.isArray(d?.orders) ? d.orders.slice(0, 20) : [])
        if (!(p?.state !== "partially_paid" && p?.state !== "paid" && p?.state !== "expired_pending_requote"))
          try {
            const c = C(p.paymentPlan, u(o));
            return await s.refresh(o, c.order).catch((k) => {
              if (k instanceof w && k.code === "withdrawn") throw k;
              return c;
            });
          } catch (c) {
            if (c instanceof w && c.code === "withdrawn") throw c;
            continue;
          }
      return null;
    },
    async refresh(o, n, a = []) {
      const d = a.filter((c) => _.test(c)), p = C(
        await f(`/v1/orders/${encodeURIComponent(n)}/refresh`, "POST", { idempotencyKey: O(), ...d.length ? { preimages: d } : {} }).catch((c) => g(c) === "product_revoked" ? t() : Promise.reject(c)),
        u(o)
      );
      if (p.order !== n) throw new w("plan", "The seller's service answered about a different order.");
      return p;
    },
    async unlock(o, n) {
      const a = await f(`/v1/orders/${encodeURIComponent(n)}/unlock`, "POST", { idempotencyKey: O() });
      if (!a || a.orderId !== n || a.productCoordinate !== o.coordinate || a.buyerPubkey !== r.pubkey) throw new w("delivery", "The seller's service answered about a different order.");
      let d = e(a.fulfillmentEvent);
      if ((!d || d.order !== n) && (d = (await s.receipts()).map((c) => c.receipt).find((c) => c.order === n) ?? null), !d || d.order !== n || !U(d, { buyer: r.pubkey, listing: o.coordinate, now: Date.now() / 1e3 }))
        throw new w("receipt", "It was paid, but the seller's service gave no receipt. Ask again from the site: you won't be charged twice.");
      let p = "";
      if (typeof a.buyerEnvelope == "string" && a.buyerEnvelope.length > 0 && a.buyerEnvelope.length <= 2e5)
        try {
          const c = JSON.parse(await r.open(l.pubkey, a.buyerEnvelope));
          if (c.orderId !== n || c.productCoordinate !== o.coordinate || c.buyerPubkey !== r.pubkey) throw new Error("another order's");
          p = typeof c.payload == "string" ? c.payload : JSON.stringify(c.payload ?? "");
        } catch {
          throw new w("delivery", "It was paid and the receipt is yours, but what it delivers couldn't be opened. Ask again from the site: you won't be charged twice.");
        }
      return { receipt: d, delivery: p.length <= 2e4 ? p : "" };
    },
    async receipts() {
      const o = await f("/v1/access-entitlements", "GET"), n = [];
      for (const a of Array.isArray(o?.entitlements) ? o.entitlements.slice(0, 500) : []) {
        const d = e(a?.event);
        d && n.push({ receipt: d, status: a.status === "revoked" ? "revoked" : a.status === "expired" ? "expired" : "active" });
      }
      return n;
    }
  };
  return s;
}
async function V(l) {
  const { client: r, listing: h } = l, i = l.wait ?? ((t) => new Promise((e) => setTimeout(e, t))), m = q(h.coordinate);
  let y = l.plan;
  const f = [];
  let u = 0;
  try {
    return await g();
  } catch (t) {
    throw t instanceof w && (t.code === "receipt" || t.code === "delivery") ? t : u > 0 ? new D(u, t) : t;
  }
  async function g() {
    const t = [...y.legs].sort((e, s) => +(e.role === "seller") - +(s.role === "seller") || e.sats - s.sats);
    for (const e of t) {
      let s = y.legs.find((a) => a.hash === e.hash);
      if (s.status === "settled") continue;
      if (s.status === "expired") throw new w("expired", "This offer ran out before it was paid. Ask again from the site for a new one.");
      l.progress?.({ paying: s });
      const o = await l.pay(s);
      u += s.sats, typeof o.preimage == "string" && _.test(o.preimage) && f.push(o.preimage);
      let n = !1;
      for (let a = 0; a < (l.tries ?? 15) && !n; a++) {
        a > 0 && await i(1e3), y = await r.refresh(h, y.order, f);
        const d = y.legs.find((p) => p.hash === e.hash);
        if (!d) throw new w("plan", "The seller's service changed the payment plan after a part of it was paid. Nothing more was spent.");
        s = d, n = s.status === "settled";
      }
      if (!n) throw new w("not-settled", "The payment was sent, but the seller's service hasn't seen it arrive yet. Ask again from the site in a minute: you won't be charged twice.");
    }
    if (!m || y.legs.some((e) => e.status !== "settled")) throw new w("not-settled", "Not every part of the payment arrived.");
    l.progress?.({ unlocking: !0 });
    try {
      return await r.unlock(h, y.order);
    } catch (e) {
      throw e instanceof w && (e.code === "receipt" || e.code === "delivery") ? e : new w("receipt", "It is paid in full, and the seller's service hasn't given your receipt yet. Nothing more is owed. Try again later: you won't be charged again.", e instanceof w ? e.serviceCode : "");
    }
  }
}
export {
  v as EcashError,
  te as LEAST_PRICE_SATS,
  ne as PAY_LIMIT,
  D as PartPaidError,
  w as PurchaseError,
  oe as TipError,
  re as UNLOCK_SERVICES,
  se as belongsTo,
  ae as bestReceipt,
  q as cleanCoordinate,
  j as cleanInvoice,
  ie as cleanLightningAddress,
  R as cleanMint,
  ce as cleanPayLimit,
  le as cleanSats,
  V as completePurchase,
  F as createEcashWallet,
  Z as createUnlockClient,
  de as invoiceFromAddress,
  L as invoiceSats,
  ue as localService,
  W as newOrderKey,
  Y as openSandboxSession,
  he as overPayLimit,
  pe as readListing,
  C as readPlan,
  H as readReceipt,
  we as readWorld,
  U as receiptGood,
  be as renderQrSvg,
  fe as sellerOf,
  ye as tipNote,
  me as underFloor
};
