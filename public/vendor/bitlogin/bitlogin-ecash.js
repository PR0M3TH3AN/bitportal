import { s as P, c as j, a as O, b as q, d as R, i as U, e as B, r as H, f as D } from "./bitlogin-shared-DVgIEj88.js";
import { L as se, P as oe, S as ae, T as ie, U as ce, g as le, h as de, j as he, k as ue, l as pe, m as fe, n as we, o as ye, p as me, q as be, t as ge, u as ve, v as ke, w as Se, x as Te } from "./bitlogin-shared-DVgIEj88.js";
import { r as Ae } from "./bitlogin-shared-CjWz8W3w.js";
import { v as J } from "./bitlogin-shared-Cj9s0_W_.js";
let Q = null;
const N = () => Q ??= import("./bitlogin-shared-BooorIKj.js");
class k extends Error {
  constructor(n, u) {
    super(u), this.code = n, this.name = "EcashError";
  }
}
const C = (d) => d.map((n) => ({ id: n.id, amount: typeof n.amount == "number" ? n.amount : n.amount.toNumber(), secret: n.secret, C: n.C }));
function Y(d) {
  let n = { mints: [], tokens: [], offline: !1, unsaved: !1 };
  const u = /* @__PURE__ */ new Map(), a = (t) => {
    let s = u.get(t);
    return s || (s = N().then(async ({ Wallet: o }) => {
      const e = new o(t, { unit: "sat" });
      return await e.loadMint(), e;
    }), s.catch(() => u.delete(t)), u.set(t, s)), s;
  }, m = (t) => n.tokens.filter((s) => s.mint === t), y = (t) => m(t).flatMap((s) => s.proofs), f = (t) => P(y(t)), l = (t) => t instanceof k ? t : new k("mint", `The mint did not do that: ${t?.message ?? "no answer"}`);
  async function b() {
    for (const t of [...new Set(n.tokens.map((s) => s.mint))]) {
      const s = m(t);
      try {
        const { CheckStateEnum: o } = await N(), e = await a(t), r = [], i = [];
        for (const c of s) {
          const p = await e.checkProofsStates(c.proofs), h = c.proofs.filter((g, S) => p[S]?.state !== o.SPENT);
          h.length !== c.proofs.length && (r.push(c), i.push(...h));
        }
        r.length && (n = await d.roll({ destroy: r.map((c) => c.event), keep: [{ mint: t, proofs: i }] }));
      } catch {
      }
    }
  }
  return {
    /**
     * Open the wallet: read it from relays, then (unless `check` is false) put right anything a mint says is spent.
     * The mints can be asked afterwards, with `check()`, so the balance is on screen first.
     */
    async open(t = {}) {
      return n = await d.load(), !n.offline && t.check !== !1 && await b(), n;
    },
    /** What the browser holds, shown at once while `open` reads relays. Nothing is spent or written from it. */
    async peek() {
      return d.peek ? (n = await d.peek(), n) : null;
    },
    /** Ask every mint whether what this wallet holds is still unspent, and put right what isn't. */
    async check() {
      return n.offline || await b(), n;
    },
    state: () => n,
    balance: (t) => t ? f(t) : P(n.tokens.flatMap((s) => s.proofs)),
    balances: () => [.../* @__PURE__ */ new Set([...n.mints, ...n.tokens.map((t) => t.mint)])].map((t) => ({ mint: t, sats: f(t) })),
    /** Add a mint to the wallet, once it has answered as one. Making the wallet, where there is none. */
    async addMint(t) {
      const s = O(t);
      if (!s) throw new k("bad-input", "That is not a mint's address. It starts with https://.");
      try {
        await a(s);
      } catch (o) {
        throw l(o);
      }
      return n = await d.setMints([.../* @__PURE__ */ new Set([...n.mints, s])]), n;
    },
    async removeMint(t) {
      if (f(t) > 0) throw new k("bad-input", "That mint still holds sats of yours. Spend them first.");
      const s = n.mints.filter((o) => o !== t);
      if (s.length === 0) throw new k("bad-input", "A wallet needs one mint.");
      return n = await d.setMints(s), n;
    },
    /** An invoice to pay, to add sats at a mint. Nothing is added until it is paid and `claim` is called. */
    async fund(t, s) {
      if (!n.mints.includes(t)) throw new k("no-wallet", "That mint is not in this wallet.");
      if (!Number.isSafeInteger(s) || s <= 0 || s > 1e6) throw new k("bad-input", "Choose a whole number of sats, up to a million.");
      try {
        const o = await (await a(t)).createMintQuoteBolt11(s), e = typeof o.expiry == "number" && o.expiry > 0 ? o.expiry : void 0;
        return { mint: t, amount: s, invoice: o.request, quote: o.quote, ...e ? { expiresAt: e } : {} };
      } catch (o) {
        throw l(o);
      }
    },
    /**
     * Take the sats of a funding invoice, once it is paid. Resolves false while it is not. `added` is called once the
     * mint has issued them and they are sealed in this browser, before relays have them: from then on they are kept.
     */
    async claim(t, s) {
      try {
        const { MintQuoteState: o } = await N(), e = await a(t.mint), r = await e.checkMintQuoteBolt11(t.quote);
        if (r.state !== o.PAID) return !1;
        const i = C(await e.mintProofsBolt11(t.amount, r)), c = () => {
          n = { ...n, tokens: [...n.tokens, { event: "local:sealed", mint: t.mint, proofs: i }], unsaved: !0 }, s?.();
        };
        return n = await d.roll({ destroy: [], keep: [{ mint: t.mint, proofs: i }], history: { direction: "in", amount: P(i) } }, c), !0;
      } catch (o) {
        throw l(o);
      }
    },
    /** Take in a Cashu token someone gave: it is swapped at its mint for proofs only this wallet knows. */
    async receive(t) {
      const { getTokenMetadata: s } = await N();
      let o;
      try {
        o = s(t.trim());
      } catch {
        throw new k("bad-input", "That is not a Cashu token.");
      }
      const e = O(o.mint);
      if (!e || o.unit !== "sat") throw new k("bad-input", "That token is not in sats, or names no usable mint.");
      if (!n.mints.includes(e)) throw new k("no-wallet", `That token is from ${e}, which is not one of your mints. Add the mint first if you trust it.`);
      try {
        const r = C(await (await a(e)).receive(t.trim()));
        return n = await d.roll({ destroy: [], keep: [{ mint: e, proofs: r }], history: { direction: "in", amount: P(r) } }), { mint: e, sats: P(r) };
      } catch (r) {
        throw l(r);
      }
    },
    /** What paying an invoice would cost, from the mint that can best afford it. Spends nothing. */
    async quote(t, s) {
      const o = j(t);
      if (!o) throw new k("bad-input", "That is not a Lightning invoice.");
      const e = s ?? [...n.mints].sort((r, i) => f(i) - f(r))[0];
      if (!e) throw new k("no-wallet", "There is no ecash wallet for this account yet.");
      try {
        const r = await (await a(e)).createMeltQuoteBolt11(o);
        return { mint: e, invoice: o, amount: r.amount.toNumber(), feeReserve: r.fee_reserve.toNumber(), quote: r };
      } catch (r) {
        throw l(r);
      }
    },
    /**
     * Pay it. The proofs to spend are chosen (and split at the mint if need be), what was not chosen is kept at
     * once, and then the mint is asked to pay. What the mint did not use for routing comes back as change.
     */
    async pay(t) {
      const { mint: s } = t, o = t.amount + t.feeReserve;
      if (f(s) < o) throw new k("not-enough", `This needs up to ${o} sats, and the wallet holds ${f(s)} at that mint.`);
      const e = m(s), r = y(s), i = f(s);
      let c;
      try {
        const I = await (await a(s)).send(o, r, { includeFees: !0 });
        c = C(I.send), n = await d.roll({ destroy: e.map(($) => $.event), keep: [{ mint: s, proofs: [...C(I.keep), ...c] }] });
      } catch (v) {
        throw /insufficient|not enough|balance/iu.test(v?.message ?? "") ? new k("not-enough", "The wallet does not hold enough at that mint to cover this and the mint's fees.") : l(v);
      }
      const p = m(s), h = new Set(c.map((v) => v.secret)), g = y(s).filter((v) => !h.has(v.secret));
      let S;
      try {
        S = await (await a(s)).meltProofsBolt11(t.quote, c);
      } catch (v) {
        throw await b(), l(v);
      }
      const { MeltQuoteState: T } = await N();
      if (S.quote.state !== T.PAID)
        throw await b(), new k("not-paid", "The mint has not paid it yet. If it does, the sats are spent; if not, they stay yours. Open the wallet again in a minute to see.");
      const E = C(S.change), A = i - P(g) - P(E);
      return n = await d.roll({ destroy: p.map((v) => v.event), keep: [{ mint: s, proofs: [...g, ...E] }], history: { direction: "out", amount: A } }), { paid: t.amount, fee: A - t.amount, preimage: S.quote.payment_preimage ?? null };
    }
  };
}
class G extends Error {
  constructor(n, u) {
    super("A part of this was paid, and the rest didn't go."), this.paidSats = n, this.cause_ = u, this.name = "PartPaidError";
  }
}
class w extends Error {
  constructor(n, u, a = "") {
    super(u), this.code = n, this.serviceCode = a, this.name = "PurchaseError";
  }
}
const x = /^[0-9a-f]{64}$/u, L = /^order_[A-Za-z0-9_-]{12,80}$/u, K = async (d) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(d))), (n) => n.toString(16).padStart(2, "0")).join(""), M = () => crypto.randomUUID().replaceAll("-", "");
function _(d, n) {
  const u = () => {
    throw new w("plan", "The seller's service answered with a payment plan that doesn't match what was asked. Nothing was spent.");
  }, a = d;
  if (!a || typeof a != "object" || a.productCoordinate !== n.listing || a.buyerPubkey !== n.buyer || a.currency !== "SAT" || a.completionRule !== "all" || typeof a.orderId != "string" || !L.test(a.orderId) || !Array.isArray(a.legs) || a.legs.length < 1 || a.legs.length > 16) return u();
  const m = a.totalSats;
  if (typeof m != "number" || !Number.isSafeInteger(m) || m < 1 || m > n.priceSats) return u();
  const y = /* @__PURE__ */ new Set(), f = [];
  for (const l of a.legs) {
    const b = l?.amountSats, t = l?.status;
    if (!l || typeof b != "number" || !Number.isSafeInteger(b) || b < 1 || typeof l.paymentHash != "string" || !x.test(l.paymentHash) || y.has(l.paymentHash) || t !== "pending" && t !== "settled" && t !== "expired") return u();
    const s = typeof l.paymentRequest == "string" ? l.paymentRequest.trim().toLowerCase() : "", o = l.rail === "sandbox" && l.adapter === "mock" && /^bitunlock-mock:1:[0-9a-f]{64}$/u.test(s);
    if (t !== "settled" && !(n.sandbox ? o : l.rail === "lightning" && U(s) === b)) return u();
    y.add(l.paymentHash);
    const e = l.role === "share" && typeof l.recipientPubkey == "string" && x.test(l.recipientPubkey) ? l.recipientPubkey : "", r = e ? B(l.label) : "";
    if (l.role === "share" && (!e || !r)) return u();
    f.push({ role: l.role === "seller" ? "seller" : l.role === "bitunlock" ? "service" : e ? "share" : "other", sats: b, invoice: s, hash: l.paymentHash, status: t, ...e ? { to: e, label: r } : {} });
  }
  return f.reduce((l, b) => l + b.sats, 0) !== m ? u() : { order: a.orderId, totalSats: m, legs: f };
}
function Z(d, n, u = {}) {
  const a = () => {
    throw new w("plan", "The seller's service answered with a payment plan that isn't what the seller wrote. Nothing was spent.");
  }, m = d.legs.filter((s) => s.role === "seller"), y = d.legs.filter((s) => s.role === "service"), f = d.legs.filter((s) => s.role === "share");
  if (m.length !== 1 || y.length > 1 || d.legs.some((s) => s.role === "other")) return a();
  if (!n.shared) return f.length === 0 ? void 0 : a();
  if (!n.shares) return a();
  const l = y[0]?.sats ?? 0;
  if (u.fee && l !== Math.min(Math.max(Math.floor(n.priceSats * u.fee.bps / 1e4), u.fee.min), u.fee.max) || d.totalSats !== n.priceSats || ![R(n.priceSats, n.shares, n.seller, { ...u.client ? { client: u.client } : {}, charge: l }), R(n.priceSats, n.shares, n.seller, { charge: l })].some((s) => {
    if (!s.ok) return !1;
    const o = s.parts.filter((e) => !e.seller);
    return s.parts.find((e) => e.seller).sats === m[0].sats && o.length === f.length && o.every((e) => f.some((r) => r.to === e.to && r.sats === e.sats && r.label === e.label));
  })) return a();
}
const V = () => M(), z = /^[A-Za-z0-9_-]{16,128}$/u;
async function X(d, n = (u, a) => fetch(u, a)) {
  const u = await n(`${d.endpoint}/sandbox/v1/sessions`, { method: "POST", credentials: "omit", referrerPolicy: "no-referrer", headers: { accept: "application/json", "content-type": "application/json" }, body: JSON.stringify({ ttlSeconds: 3600 }) }), a = await u.json().catch(() => null);
  if (!u.ok || typeof a?.sessionId != "string" || typeof a.token != "string" || a.sessionId.length > 200 || a.token.length > 400) throw new w("service", "The test service gave no session.");
  return { sessionId: a.sessionId, token: a.token };
}
function ee(d, n, u = {}) {
  const a = u.sandbox ?? null, m = u.fetch ?? ((e, r) => fetch(e, r)), y = () => {
    throw new w("service", "The seller's service didn't answer. Nothing was spent.");
  }, f = async (e, r, i, c = !0) => {
    const p = new URL(e, d.endpoint).toString(), h = i === void 0 ? void 0 : JSON.stringify(i), g = new AbortController(), S = setTimeout(() => g.abort(), 2e4);
    try {
      const T = c ? await n.auth({ url: p, method: r, ...r === "POST" ? { payload: await K(h ?? "") } : {} }) : "", E = await m(p, { method: r, credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", headers: { accept: "application/json", ...T ? { authorization: T } : {}, ...a && c ? { "x-bitunlock-sandbox-session": a.sessionId } : {}, ...h === void 0 ? {} : { "content-type": "application/json" } }, ...h === void 0 ? {} : { body: h }, signal: g.signal }), A = await E.text();
      if (A.length > 1e6) return y();
      const v = A ? JSON.parse(A) : null;
      if (!E.ok) {
        const I = v?.error?.code;
        throw new w("service", "The seller's service refused that. Nothing more was spent.", typeof I == "string" ? I.slice(0, 80) : "");
      }
      return v;
    } catch (T) {
      if (T instanceof w) throw T;
      return y();
    } finally {
      clearTimeout(S);
    }
  }, l = (e) => ({ listing: e.coordinate, buyer: n.pubkey, priceSats: e.priceSats, sandbox: !!a }), b = (e) => e instanceof w ? e.serviceCode : "", t = () => {
    throw new w("withdrawn", "This was withdrawn by its seller, and can't be finished.");
  }, s = (e) => {
    const r = D(e, [d]);
    return r && r.buyer === n.pubkey ? r : null;
  }, o = {
    async policy() {
      const r = (await f("/.well-known/bitunlock.json", "GET", void 0, !1))?.event;
      if (!r || r.pubkey !== d.pubkey || r.kind !== 30078 || !J(r)) return y();
      let i;
      try {
        i = JSON.parse(r.content);
      } catch {
        return y();
      }
      if (i.endpoint !== d.endpoint || i.servicePubkey !== d.pubkey || i.status !== "active") return y();
      const c = Array.isArray(i.relays) ? i.relays.filter((g) => typeof g == "string" && g.length <= 200 && /^wss?:\/\//u.test(g)).slice(0, 6) : [], p = i.feePolicy, h = (g) => typeof g == "number" && Number.isSafeInteger(g) && g >= 0;
      return { relays: c, sandbox: Array.isArray(i.paymentAdapters) && i.paymentAdapters.includes("mock"), fee: p && h(p.feeBps) && h(p.minimumSats) && h(p.maximumSats) ? { bps: p.feeBps, min: p.minimumSats, max: p.maximumSats } : null };
    },
    async quote(e, r, i) {
      try {
        return _(await f("/v1/quotes", "POST", { productCoordinate: e.coordinate, buyerPubkey: n.pubkey, idempotencyKey: r && z.test(r) ? r : M(), ...i && x.test(i) ? { clientPubkey: i } : {} }), l(e));
      } catch (c) {
        throw /sold|inventory|reserved|revoked|inactive/u.test(b(c)) ? new w("sold", "This isn't for sale just now. Nothing was spent.") : b(c) === "shares_unavailable" ? new w("sold", "This can't be sold just now: someone its price is shared with can't be paid. Nothing was spent.") : c;
      }
    },
    async settle(e) {
      if (!a || !x.test(e)) throw new w("plan", "That is not a pretend payment a test service takes.");
      if (!(await m(`${d.endpoint}/sandbox/v1/payments/${e}/settle`, { method: "POST", credentials: "omit", referrerPolicy: "no-referrer", headers: { accept: "application/json", authorization: `Bearer ${a.token}`, "x-bitunlock-sandbox-session": a.sessionId } }).catch(() => null))?.ok) throw new w("service", "The test service didn't settle that pretend payment.");
    },
    async resume(e, r) {
      const i = ["quoted", "partially_paid", "paid", "expired_pending_requote"];
      if (r && L.test(r)) {
        const p = await f(`/v1/orders/${encodeURIComponent(r)}`, "GET").catch(() => null);
        if (!p || p.orderId !== r || !i.includes(String(p.state))) return null;
        try {
          return await o.refresh(e, r);
        } catch (h) {
          if (h instanceof w && h.code === "withdrawn") throw h;
          return _(p.paymentPlan, l(e));
        }
      }
      const c = await f(`/v1/orders?${new URLSearchParams({ productCoordinate: e.coordinate })}`, "GET").catch(() => null);
      for (const p of Array.isArray(c?.orders) ? c.orders.slice(0, 20) : [])
        if (!(p?.state !== "partially_paid" && p?.state !== "paid" && p?.state !== "expired_pending_requote"))
          try {
            const h = _(p.paymentPlan, l(e));
            return await o.refresh(e, h.order).catch((g) => {
              if (g instanceof w && g.code === "withdrawn") throw g;
              return h;
            });
          } catch (h) {
            if (h instanceof w && h.code === "withdrawn") throw h;
            continue;
          }
      return null;
    },
    async refresh(e, r, i = []) {
      const c = i.filter((h) => x.test(h)), p = _(
        await f(`/v1/orders/${encodeURIComponent(r)}/refresh`, "POST", { idempotencyKey: M(), ...c.length ? { preimages: c } : {} }).catch((h) => b(h) === "product_revoked" ? t() : Promise.reject(h)),
        l(e)
      );
      if (p.order !== r) throw new w("plan", "The seller's service answered about a different order.");
      return p;
    },
    async unlock(e, r) {
      const i = await f(`/v1/orders/${encodeURIComponent(r)}/unlock`, "POST", { idempotencyKey: M() });
      if (!i || i.orderId !== r || i.productCoordinate !== e.coordinate || i.buyerPubkey !== n.pubkey) throw new w("delivery", "The seller's service answered about a different order.");
      let c = s(i.fulfillmentEvent);
      if ((!c || c.order !== r) && (c = (await o.receipts()).map((h) => h.receipt).find((h) => h.order === r) ?? null), !c || c.order !== r || !H(c, { buyer: n.pubkey, listing: e.coordinate, now: Date.now() / 1e3 }))
        throw new w("receipt", "It was paid, but the seller's service gave no receipt. Ask again from the site: you won't be charged twice.");
      let p = "";
      if (typeof i.buyerEnvelope == "string" && i.buyerEnvelope.length > 0 && i.buyerEnvelope.length <= 2e5)
        try {
          const h = JSON.parse(await n.open(d.pubkey, i.buyerEnvelope));
          if (h.orderId !== r || h.productCoordinate !== e.coordinate || h.buyerPubkey !== n.pubkey) throw new Error("another order's");
          p = typeof h.payload == "string" ? h.payload : JSON.stringify(h.payload ?? "");
        } catch {
          throw new w("delivery", "It was paid and the receipt is yours, but what it delivers couldn't be opened. Ask again from the site: you won't be charged twice.");
        }
      return { receipt: c, delivery: p.length <= 2e4 ? p : "" };
    },
    async receipts() {
      const e = await f("/v1/access-entitlements", "GET"), r = [];
      for (const i of Array.isArray(e?.entitlements) ? e.entitlements.slice(0, 500) : []) {
        const c = s(i?.event);
        c && r.push({ receipt: c, status: i.status === "revoked" ? "revoked" : i.status === "expired" ? "expired" : "active" });
      }
      return r;
    }
  };
  return o;
}
async function te(d) {
  const { client: n, listing: u } = d, a = d.wait ?? ((t) => new Promise((s) => setTimeout(s, t))), m = q(u.coordinate);
  let y = d.plan;
  const f = [];
  let l = 0;
  try {
    return await b();
  } catch (t) {
    throw t instanceof w && (t.code === "receipt" || t.code === "delivery") ? t : l > 0 ? new G(l, t) : t;
  }
  async function b() {
    const t = (o) => o.role === "service" ? 0 : o.role === "seller" ? 2 : 1, s = [...y.legs].sort((o, e) => t(o) - t(e) || o.sats - e.sats || ((o.to ?? "") < (e.to ?? "") ? -1 : 1));
    for (const o of s) {
      let e = y.legs.find((c) => c.hash === o.hash);
      if (e.status === "settled") continue;
      if (e.status === "expired") throw new w("expired", "This offer ran out before it was paid. Ask again from the site for a new one.");
      d.progress?.({ paying: e });
      const r = await d.pay(e);
      l += e.sats, typeof r.preimage == "string" && x.test(r.preimage) && f.push(r.preimage);
      let i = !1;
      for (let c = 0; c < (d.tries ?? 15) && !i; c++) {
        c > 0 && await a(1e3), y = await n.refresh(u, y.order, f);
        const p = y.legs.find((h) => h.hash === o.hash);
        if (!p) throw new w("plan", "The seller's service changed the payment plan after a part of it was paid. Nothing more was spent.");
        e = p, i = e.status === "settled";
      }
      if (!i) throw new w("not-settled", "The payment was sent, but the seller's service hasn't seen it arrive yet. Ask again from the site in a minute: you won't be charged twice.");
    }
    if (!m || y.legs.some((o) => o.status !== "settled")) throw new w("not-settled", "Not every part of the payment arrived.");
    d.progress?.({ unlocking: !0 });
    try {
      return await n.unlock(u, y.order);
    } catch (o) {
      throw o instanceof w && (o.code === "receipt" || o.code === "delivery") ? o : new w("receipt", "It is paid in full, and the seller's service hasn't given your receipt yet. Nothing more is owed. Try again later: you won't be charged again.", o instanceof w ? o.serviceCode : "");
    }
  }
}
export {
  k as EcashError,
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
  ye as overPayLimit,
  me as readListing,
  _ as readPlan,
  D as readReceipt,
  be as readShares,
  ge as readWorld,
  H as receiptGood,
  Ae as renderQrSvg,
  ve as sellerOf,
  ke as sharesOpenAt,
  R as splitPrice,
  Se as tipNote,
  Te as underFloor
};
