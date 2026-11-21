import { s as P, c as j, a as O, b as q, d as R, i as U, e as B, r as H, f as D } from "./bitlogin-shared-D4lxvcOu.js";
import { L as se, P as oe, S as ae, T as ie, U as ce, g as le, h as de, j as he, k as ue, l as pe, m as fe, n as we, o as me, p as ye, q as be, t as ge, u as ve, v as Se, w as ke, x as Te } from "./bitlogin-shared-D4lxvcOu.js";
import { r as Ae } from "./bitlogin-shared-CjWz8W3w.js";
import { v as J } from "./bitlogin-shared-Cj9s0_W_.js";
let Q = null;
const N = () => Q ??= import("./bitlogin-shared-BooorIKj.js");
class S extends Error {
  constructor(s, u) {
    super(u), this.code = s, this.name = "EcashError";
  }
}
const C = (h) => h.map((s) => ({ id: s.id, amount: typeof s.amount == "number" ? s.amount : s.amount.toNumber(), secret: s.secret, C: s.C }));
function Y(h) {
  let s = { mints: [], tokens: [], offline: !1, unsaved: !1 };
  const u = /* @__PURE__ */ new Map(), a = (t) => {
    let r = u.get(t);
    return r || (r = N().then(async ({ Wallet: o }) => {
      const e = new o(t, { unit: "sat" });
      return await e.loadMint(), e;
    }), r.catch(() => u.delete(t)), u.set(t, r)), r;
  }, y = (t) => s.tokens.filter((r) => r.mint === t), m = (t) => y(t).flatMap((r) => r.proofs), f = (t) => P(m(t)), c = (t) => t instanceof S ? t : new S("mint", `The mint did not do that: ${t?.message ?? "no answer"}`);
  async function b() {
    for (const t of [...new Set(s.tokens.map((r) => r.mint))]) {
      const r = y(t);
      try {
        const { CheckStateEnum: o } = await N(), e = await a(t), n = [], i = [];
        for (const l of r) {
          const p = await e.checkProofsStates(l.proofs), d = l.proofs.filter((g, k) => p[k]?.state !== o.SPENT);
          d.length !== l.proofs.length && (n.push(l), i.push(...d));
        }
        n.length && (s = await h.roll({ destroy: n.map((l) => l.event), keep: [{ mint: t, proofs: i }] }));
      } catch {
      }
    }
  }
  return {
    /** Open the wallet: read it, then put right anything a mint says is spent. */
    async open() {
      return s = await h.load(), s.offline || await b(), s;
    },
    state: () => s,
    balance: (t) => t ? f(t) : P(s.tokens.flatMap((r) => r.proofs)),
    balances: () => [.../* @__PURE__ */ new Set([...s.mints, ...s.tokens.map((t) => t.mint)])].map((t) => ({ mint: t, sats: f(t) })),
    /** Add a mint to the wallet, once it has answered as one. Making the wallet, where there is none. */
    async addMint(t) {
      const r = O(t);
      if (!r) throw new S("bad-input", "That is not a mint's address. It starts with https://.");
      try {
        await a(r);
      } catch (o) {
        throw c(o);
      }
      return s = await h.setMints([.../* @__PURE__ */ new Set([...s.mints, r])]), s;
    },
    async removeMint(t) {
      if (f(t) > 0) throw new S("bad-input", "That mint still holds sats of yours. Spend them first.");
      const r = s.mints.filter((o) => o !== t);
      if (r.length === 0) throw new S("bad-input", "A wallet needs one mint.");
      return s = await h.setMints(r), s;
    },
    /** An invoice to pay, to add sats at a mint. Nothing is added until it is paid and `claim` is called. */
    async fund(t, r) {
      if (!s.mints.includes(t)) throw new S("no-wallet", "That mint is not in this wallet.");
      if (!Number.isSafeInteger(r) || r <= 0 || r > 1e6) throw new S("bad-input", "Choose a whole number of sats, up to a million.");
      try {
        const o = await (await a(t)).createMintQuoteBolt11(r);
        return { mint: t, amount: r, invoice: o.request, quote: o.quote };
      } catch (o) {
        throw c(o);
      }
    },
    /** Take the sats of a funding invoice, once it is paid. Resolves false while it is not. */
    async claim(t) {
      try {
        const { MintQuoteState: r } = await N(), o = await a(t.mint), e = await o.checkMintQuoteBolt11(t.quote);
        if (e.state !== r.PAID) return !1;
        const n = C(await o.mintProofsBolt11(t.amount, e));
        return s = await h.roll({ destroy: [], keep: [{ mint: t.mint, proofs: n }], history: { direction: "in", amount: P(n) } }), !0;
      } catch (r) {
        throw c(r);
      }
    },
    /** Take in a Cashu token someone gave: it is swapped at its mint for proofs only this wallet knows. */
    async receive(t) {
      const { getTokenMetadata: r } = await N();
      let o;
      try {
        o = r(t.trim());
      } catch {
        throw new S("bad-input", "That is not a Cashu token.");
      }
      const e = O(o.mint);
      if (!e || o.unit !== "sat") throw new S("bad-input", "That token is not in sats, or names no usable mint.");
      if (!s.mints.includes(e)) throw new S("no-wallet", `That token is from ${e}, which is not one of your mints. Add the mint first if you trust it.`);
      try {
        const n = C(await (await a(e)).receive(t.trim()));
        return s = await h.roll({ destroy: [], keep: [{ mint: e, proofs: n }], history: { direction: "in", amount: P(n) } }), { mint: e, sats: P(n) };
      } catch (n) {
        throw c(n);
      }
    },
    /** What paying an invoice would cost, from the mint that can best afford it. Spends nothing. */
    async quote(t, r) {
      const o = j(t);
      if (!o) throw new S("bad-input", "That is not a Lightning invoice.");
      const e = r ?? [...s.mints].sort((n, i) => f(i) - f(n))[0];
      if (!e) throw new S("no-wallet", "There is no ecash wallet for this account yet.");
      try {
        const n = await (await a(e)).createMeltQuoteBolt11(o);
        return { mint: e, invoice: o, amount: n.amount.toNumber(), feeReserve: n.fee_reserve.toNumber(), quote: n };
      } catch (n) {
        throw c(n);
      }
    },
    /**
     * Pay it. The proofs to spend are chosen (and split at the mint if need be), what was not chosen is kept at
     * once, and then the mint is asked to pay. What the mint did not use for routing comes back as change.
     */
    async pay(t) {
      const { mint: r } = t, o = t.amount + t.feeReserve;
      if (f(r) < o) throw new S("not-enough", `This needs up to ${o} sats, and the wallet holds ${f(r)} at that mint.`);
      const e = y(r), n = m(r), i = f(r);
      let l;
      try {
        const I = await (await a(r)).send(o, n, { includeFees: !0 });
        l = C(I.send), s = await h.roll({ destroy: e.map(($) => $.event), keep: [{ mint: r, proofs: [...C(I.keep), ...l] }] });
      } catch (v) {
        throw /insufficient|not enough|balance/iu.test(v?.message ?? "") ? new S("not-enough", "The wallet does not hold enough at that mint to cover this and the mint's fees.") : c(v);
      }
      const p = y(r), d = new Set(l.map((v) => v.secret)), g = m(r).filter((v) => !d.has(v.secret));
      let k;
      try {
        k = await (await a(r)).meltProofsBolt11(t.quote, l);
      } catch (v) {
        throw await b(), c(v);
      }
      const { MeltQuoteState: T } = await N();
      if (k.quote.state !== T.PAID)
        throw await b(), new S("not-paid", "The mint has not paid it yet. If it does, the sats are spent; if not, they stay yours. Open the wallet again in a minute to see.");
      const x = C(k.change), A = i - P(g) - P(x);
      return s = await h.roll({ destroy: p.map((v) => v.event), keep: [{ mint: r, proofs: [...g, ...x] }], history: { direction: "out", amount: A } }), { paid: t.amount, fee: A - t.amount, preimage: k.quote.payment_preimage ?? null };
    }
  };
}
class G extends Error {
  constructor(s, u) {
    super("A part of this was paid, and the rest didn't go."), this.paidSats = s, this.cause_ = u, this.name = "PartPaidError";
  }
}
class w extends Error {
  constructor(s, u, a = "") {
    super(u), this.code = s, this.serviceCode = a, this.name = "PurchaseError";
  }
}
const E = /^[0-9a-f]{64}$/u, L = /^order_[A-Za-z0-9_-]{12,80}$/u, K = async (h) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(h))), (s) => s.toString(16).padStart(2, "0")).join(""), M = () => crypto.randomUUID().replaceAll("-", "");
function _(h, s) {
  const u = () => {
    throw new w("plan", "The seller's service answered with a payment plan that doesn't match what was asked. Nothing was spent.");
  }, a = h;
  if (!a || typeof a != "object" || a.productCoordinate !== s.listing || a.buyerPubkey !== s.buyer || a.currency !== "SAT" || a.completionRule !== "all" || typeof a.orderId != "string" || !L.test(a.orderId) || !Array.isArray(a.legs) || a.legs.length < 1 || a.legs.length > 16) return u();
  const y = a.totalSats;
  if (typeof y != "number" || !Number.isSafeInteger(y) || y < 1 || y > s.priceSats) return u();
  const m = /* @__PURE__ */ new Set(), f = [];
  for (const c of a.legs) {
    const b = c?.amountSats, t = c?.status;
    if (!c || typeof b != "number" || !Number.isSafeInteger(b) || b < 1 || typeof c.paymentHash != "string" || !E.test(c.paymentHash) || m.has(c.paymentHash) || t !== "pending" && t !== "settled" && t !== "expired") return u();
    const r = typeof c.paymentRequest == "string" ? c.paymentRequest.trim().toLowerCase() : "", o = c.rail === "sandbox" && c.adapter === "mock" && /^bitunlock-mock:1:[0-9a-f]{64}$/u.test(r);
    if (t !== "settled" && !(s.sandbox ? o : c.rail === "lightning" && U(r) === b)) return u();
    m.add(c.paymentHash);
    const e = c.role === "share" && typeof c.recipientPubkey == "string" && E.test(c.recipientPubkey) ? c.recipientPubkey : "", n = e ? B(c.label) : "";
    if (c.role === "share" && (!e || !n)) return u();
    f.push({ role: c.role === "seller" ? "seller" : c.role === "bitunlock" ? "service" : e ? "share" : "other", sats: b, invoice: r, hash: c.paymentHash, status: t, ...e ? { to: e, label: n } : {} });
  }
  return f.reduce((c, b) => c + b.sats, 0) !== y ? u() : { order: a.orderId, totalSats: y, legs: f };
}
function Z(h, s, u = {}) {
  const a = () => {
    throw new w("plan", "The seller's service answered with a payment plan that isn't what the seller wrote. Nothing was spent.");
  }, y = h.legs.filter((r) => r.role === "seller"), m = h.legs.filter((r) => r.role === "service"), f = h.legs.filter((r) => r.role === "share");
  if (y.length !== 1 || m.length > 1 || h.legs.some((r) => r.role === "other")) return a();
  if (!s.shared) return f.length === 0 ? void 0 : a();
  if (!s.shares) return a();
  const c = m[0]?.sats ?? 0;
  if (u.fee && c !== Math.min(Math.max(Math.floor(s.priceSats * u.fee.bps / 1e4), u.fee.min), u.fee.max) || h.totalSats !== s.priceSats || ![R(s.priceSats, s.shares, s.seller, { ...u.client ? { client: u.client } : {}, charge: c }), R(s.priceSats, s.shares, s.seller, { charge: c })].some((r) => {
    if (!r.ok) return !1;
    const o = r.parts.filter((e) => !e.seller);
    return r.parts.find((e) => e.seller).sats === y[0].sats && o.length === f.length && o.every((e) => f.some((n) => n.to === e.to && n.sats === e.sats && n.label === e.label));
  })) return a();
}
const V = () => M(), z = /^[A-Za-z0-9_-]{16,128}$/u;
async function X(h, s = (u, a) => fetch(u, a)) {
  const u = await s(`${h.endpoint}/sandbox/v1/sessions`, { method: "POST", credentials: "omit", referrerPolicy: "no-referrer", headers: { accept: "application/json", "content-type": "application/json" }, body: JSON.stringify({ ttlSeconds: 3600 }) }), a = await u.json().catch(() => null);
  if (!u.ok || typeof a?.sessionId != "string" || typeof a.token != "string" || a.sessionId.length > 200 || a.token.length > 400) throw new w("service", "The test service gave no session.");
  return { sessionId: a.sessionId, token: a.token };
}
function ee(h, s, u = {}) {
  const a = u.sandbox ?? null, y = u.fetch ?? ((e, n) => fetch(e, n)), m = () => {
    throw new w("service", "The seller's service didn't answer. Nothing was spent.");
  }, f = async (e, n, i, l = !0) => {
    const p = new URL(e, h.endpoint).toString(), d = i === void 0 ? void 0 : JSON.stringify(i), g = new AbortController(), k = setTimeout(() => g.abort(), 2e4);
    try {
      const T = l ? await s.auth({ url: p, method: n, ...n === "POST" ? { payload: await K(d ?? "") } : {} }) : "", x = await y(p, { method: n, credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", headers: { accept: "application/json", ...T ? { authorization: T } : {}, ...a && l ? { "x-bitunlock-sandbox-session": a.sessionId } : {}, ...d === void 0 ? {} : { "content-type": "application/json" } }, ...d === void 0 ? {} : { body: d }, signal: g.signal }), A = await x.text();
      if (A.length > 1e6) return m();
      const v = A ? JSON.parse(A) : null;
      if (!x.ok) {
        const I = v?.error?.code;
        throw new w("service", "The seller's service refused that. Nothing more was spent.", typeof I == "string" ? I.slice(0, 80) : "");
      }
      return v;
    } catch (T) {
      if (T instanceof w) throw T;
      return m();
    } finally {
      clearTimeout(k);
    }
  }, c = (e) => ({ listing: e.coordinate, buyer: s.pubkey, priceSats: e.priceSats, sandbox: !!a }), b = (e) => e instanceof w ? e.serviceCode : "", t = () => {
    throw new w("withdrawn", "This was withdrawn by its seller, and can't be finished.");
  }, r = (e) => {
    const n = D(e, [h]);
    return n && n.buyer === s.pubkey ? n : null;
  }, o = {
    async policy() {
      const n = (await f("/.well-known/bitunlock.json", "GET", void 0, !1))?.event;
      if (!n || n.pubkey !== h.pubkey || n.kind !== 30078 || !J(n)) return m();
      let i;
      try {
        i = JSON.parse(n.content);
      } catch {
        return m();
      }
      if (i.endpoint !== h.endpoint || i.servicePubkey !== h.pubkey || i.status !== "active") return m();
      const l = Array.isArray(i.relays) ? i.relays.filter((g) => typeof g == "string" && g.length <= 200 && /^wss?:\/\//u.test(g)).slice(0, 6) : [], p = i.feePolicy, d = (g) => typeof g == "number" && Number.isSafeInteger(g) && g >= 0;
      return { relays: l, sandbox: Array.isArray(i.paymentAdapters) && i.paymentAdapters.includes("mock"), fee: p && d(p.feeBps) && d(p.minimumSats) && d(p.maximumSats) ? { bps: p.feeBps, min: p.minimumSats, max: p.maximumSats } : null };
    },
    async quote(e, n, i) {
      try {
        return _(await f("/v1/quotes", "POST", { productCoordinate: e.coordinate, buyerPubkey: s.pubkey, idempotencyKey: n && z.test(n) ? n : M(), ...i && E.test(i) ? { clientPubkey: i } : {} }), c(e));
      } catch (l) {
        throw /sold|inventory|reserved|revoked|inactive/u.test(b(l)) ? new w("sold", "This isn't for sale just now. Nothing was spent.") : b(l) === "shares_unavailable" ? new w("sold", "This can't be sold just now: someone its price is shared with can't be paid. Nothing was spent.") : l;
      }
    },
    async settle(e) {
      if (!a || !E.test(e)) throw new w("plan", "That is not a pretend payment a test service takes.");
      if (!(await y(`${h.endpoint}/sandbox/v1/payments/${e}/settle`, { method: "POST", credentials: "omit", referrerPolicy: "no-referrer", headers: { accept: "application/json", authorization: `Bearer ${a.token}`, "x-bitunlock-sandbox-session": a.sessionId } }).catch(() => null))?.ok) throw new w("service", "The test service didn't settle that pretend payment.");
    },
    async resume(e, n) {
      const i = ["quoted", "partially_paid", "paid", "expired_pending_requote"];
      if (n && L.test(n)) {
        const p = await f(`/v1/orders/${encodeURIComponent(n)}`, "GET").catch(() => null);
        if (!p || p.orderId !== n || !i.includes(String(p.state))) return null;
        try {
          return await o.refresh(e, n);
        } catch (d) {
          if (d instanceof w && d.code === "withdrawn") throw d;
          return _(p.paymentPlan, c(e));
        }
      }
      const l = await f(`/v1/orders?${new URLSearchParams({ productCoordinate: e.coordinate })}`, "GET").catch(() => null);
      for (const p of Array.isArray(l?.orders) ? l.orders.slice(0, 20) : [])
        if (!(p?.state !== "partially_paid" && p?.state !== "paid" && p?.state !== "expired_pending_requote"))
          try {
            const d = _(p.paymentPlan, c(e));
            return await o.refresh(e, d.order).catch((g) => {
              if (g instanceof w && g.code === "withdrawn") throw g;
              return d;
            });
          } catch (d) {
            if (d instanceof w && d.code === "withdrawn") throw d;
            continue;
          }
      return null;
    },
    async refresh(e, n, i = []) {
      const l = i.filter((d) => E.test(d)), p = _(
        await f(`/v1/orders/${encodeURIComponent(n)}/refresh`, "POST", { idempotencyKey: M(), ...l.length ? { preimages: l } : {} }).catch((d) => b(d) === "product_revoked" ? t() : Promise.reject(d)),
        c(e)
      );
      if (p.order !== n) throw new w("plan", "The seller's service answered about a different order.");
      return p;
    },
    async unlock(e, n) {
      const i = await f(`/v1/orders/${encodeURIComponent(n)}/unlock`, "POST", { idempotencyKey: M() });
      if (!i || i.orderId !== n || i.productCoordinate !== e.coordinate || i.buyerPubkey !== s.pubkey) throw new w("delivery", "The seller's service answered about a different order.");
      let l = r(i.fulfillmentEvent);
      if ((!l || l.order !== n) && (l = (await o.receipts()).map((d) => d.receipt).find((d) => d.order === n) ?? null), !l || l.order !== n || !H(l, { buyer: s.pubkey, listing: e.coordinate, now: Date.now() / 1e3 }))
        throw new w("receipt", "It was paid, but the seller's service gave no receipt. Ask again from the site: you won't be charged twice.");
      let p = "";
      if (typeof i.buyerEnvelope == "string" && i.buyerEnvelope.length > 0 && i.buyerEnvelope.length <= 2e5)
        try {
          const d = JSON.parse(await s.open(h.pubkey, i.buyerEnvelope));
          if (d.orderId !== n || d.productCoordinate !== e.coordinate || d.buyerPubkey !== s.pubkey) throw new Error("another order's");
          p = typeof d.payload == "string" ? d.payload : JSON.stringify(d.payload ?? "");
        } catch {
          throw new w("delivery", "It was paid and the receipt is yours, but what it delivers couldn't be opened. Ask again from the site: you won't be charged twice.");
        }
      return { receipt: l, delivery: p.length <= 2e4 ? p : "" };
    },
    async receipts() {
      const e = await f("/v1/access-entitlements", "GET"), n = [];
      for (const i of Array.isArray(e?.entitlements) ? e.entitlements.slice(0, 500) : []) {
        const l = r(i?.event);
        l && n.push({ receipt: l, status: i.status === "revoked" ? "revoked" : i.status === "expired" ? "expired" : "active" });
      }
      return n;
    }
  };
  return o;
}
async function te(h) {
  const { client: s, listing: u } = h, a = h.wait ?? ((t) => new Promise((r) => setTimeout(r, t))), y = q(u.coordinate);
  let m = h.plan;
  const f = [];
  let c = 0;
  try {
    return await b();
  } catch (t) {
    throw t instanceof w && (t.code === "receipt" || t.code === "delivery") ? t : c > 0 ? new G(c, t) : t;
  }
  async function b() {
    const t = (o) => o.role === "service" ? 0 : o.role === "seller" ? 2 : 1, r = [...m.legs].sort((o, e) => t(o) - t(e) || o.sats - e.sats || ((o.to ?? "") < (e.to ?? "") ? -1 : 1));
    for (const o of r) {
      let e = m.legs.find((l) => l.hash === o.hash);
      if (e.status === "settled") continue;
      if (e.status === "expired") throw new w("expired", "This offer ran out before it was paid. Ask again from the site for a new one.");
      h.progress?.({ paying: e });
      const n = await h.pay(e);
      c += e.sats, typeof n.preimage == "string" && E.test(n.preimage) && f.push(n.preimage);
      let i = !1;
      for (let l = 0; l < (h.tries ?? 15) && !i; l++) {
        l > 0 && await a(1e3), m = await s.refresh(u, m.order, f);
        const p = m.legs.find((d) => d.hash === o.hash);
        if (!p) throw new w("plan", "The seller's service changed the payment plan after a part of it was paid. Nothing more was spent.");
        e = p, i = e.status === "settled";
      }
      if (!i) throw new w("not-settled", "The payment was sent, but the seller's service hasn't seen it arrive yet. Ask again from the site in a minute: you won't be charged twice.");
    }
    if (!y || m.legs.some((o) => o.status !== "settled")) throw new w("not-settled", "Not every part of the payment arrived.");
    h.progress?.({ unlocking: !0 });
    try {
      return await s.unlock(u, m.order);
    } catch (o) {
      throw o instanceof w && (o.code === "receipt" || o.code === "delivery") ? o : new w("receipt", "It is paid in full, and the seller's service hasn't given your receipt yet. Nothing more is owed. Try again later: you won't be charged again.", o instanceof w ? o.serviceCode : "");
    }
  }
}
export {
  S as EcashError,
  se as LEAST_PRICE_SATS,
  oe as PAY_LIMIT,
  G as PartPaidError,
  w as PurchaseError,
  ae as SHARE_LIMITS,
  ie as TipError,
  ce as UNLOCK_SERVICES,
  le as belongsTo,
  de as bestReceipt,
  q as cleanCoordinate,
  j as cleanInvoice,
  he as cleanLightningAddress,
  O as cleanMint,
  ue as cleanPayLimit,
  pe as cleanSats,
  te as completePurchase,
  Y as createEcashWallet,
  ee as createUnlockClient,
  Z as holdToListing,
  fe as invoiceFromAddress,
  U as invoiceSats,
  we as localService,
  V as newOrderKey,
  X as openSandboxSession,
  me as overPayLimit,
  ye as readListing,
  _ as readPlan,
  D as readReceipt,
  be as readShares,
  ge as readWorld,
  H as receiptGood,
  Ae as renderQrSvg,
  ve as sellerOf,
  Se as sharesOpenAt,
  R as splitPrice,
  ke as tipNote,
  Te as underFloor
};
