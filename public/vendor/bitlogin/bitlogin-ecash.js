import { s as M, c as D, a as H, b as F, d as U, i as G, e as J, r as Q, f as z } from "./bitlogin-shared-BkXi7a9G.js";
import { L as de, N as he, P as ue, R as fe, S as we, T as pe, U as ye, g as me, h as ge, j as be, k as ke, l as ve, m as Se, n as Te, o as Ie, p as Pe, q as xe, t as Ae, u as Ee, v as Ne, w as Me, x as Ce } from "./bitlogin-shared-BkXi7a9G.js";
import { r as Oe } from "./bitlogin-shared-CjWz8W3w.js";
import { v as W } from "./bitlogin-shared-Cj9s0_W_.js";
let Y = null;
const R = () => Y ??= import("./bitlogin-shared-BooorIKj.js");
class x extends Error {
  constructor(c, s) {
    super(s), this.code = c, this.name = "EcashError";
  }
}
const C = (i) => i.map((c) => ({ id: c.id, amount: typeof c.amount == "number" ? c.amount : c.amount.toNumber(), secret: c.secret, C: c.C }));
function ne(i, c = {}) {
  let s = { mints: [], tokens: [], offline: !1, unsaved: !1 };
  const d = /* @__PURE__ */ new Map(), g = (e) => {
    let t = d.get(e);
    return t || (t = R().then(async ({ Wallet: n }) => {
      const o = new n(e, { unit: "sat" });
      return await o.loadMint(), o;
    }), t.catch(() => d.delete(e)), d.set(e, t)), t;
  }, v = (e) => s.tokens.filter((t) => t.mint === e), b = (e) => v(e).flatMap((t) => t.proofs), l = (e) => M(b(e)), I = (e) => e instanceof x ? e : new x("mint", `The mint did not do that: ${e?.message ?? "no answer"}`), S = () => i.seed ?? null, P = () => c.locks ?? typeof globalThis.navigator?.locks?.request == "function", p = /* @__PURE__ */ new Set(), r = (e, t) => (s.trials ?? []).some((n) => n.mint === e && n.keysetId === t && n.outcome === "passed");
  async function a(e, t) {
    const n = S();
    if (!n || !r(e, t.keysetId) || !P()) return null;
    const { createSeededMint: o } = await import("./bitlogin-shared-IXY9Q-Ln.js"), u = [...new Set((s.counters ?? []).filter((m) => m.keysetId === t.keysetId).map((m) => m.lane))];
    return o({ wallet: t, seed: n, used: u });
  }
  async function h() {
    for (const e of [...new Set(s.tokens.map((t) => t.mint))]) {
      const t = v(e);
      try {
        const { CheckStateEnum: n } = await R(), o = await g(e), u = [], m = [];
        for (const f of t) {
          const E = await o.checkProofsStates(f.proofs), k = f.proofs.filter((w, y) => E[y]?.state !== n.SPENT);
          k.length !== f.proofs.length && (u.push(f), m.push(...k));
        }
        u.length && (s = await i.roll({ destroy: u.map((f) => f.event), keep: [{ mint: e, proofs: m }] }));
      } catch {
      }
    }
  }
  return {
    /**
     * Open the wallet: read it from relays, then (unless `check` is false) put right anything a mint says is spent.
     * The mints can be asked afterwards, with `check()`, so the balance is on screen first.
     */
    async open(e = {}) {
      return s = await i.load(), !s.offline && e.check !== !1 && await h(), s;
    },
    /** What the browser holds, shown at once while `open` reads relays. Nothing is spent or written from it. */
    async peek() {
      return i.peek ? (s = await i.peek(), s) : null;
    },
    /** Ask every mint whether what this wallet holds is still unspent, and put right what isn't. */
    async check() {
      return s.offline || await h(), s;
    },
    state: () => s,
    balance: (e) => e ? l(e) : M(s.tokens.flatMap((t) => t.proofs)),
    balances: () => [.../* @__PURE__ */ new Set([...s.mints, ...s.tokens.map((e) => e.mint)])].map((e) => ({ mint: e, sats: l(e) })),
    /** Add a mint to the wallet, once it has answered as one. Making the wallet, where there is none. */
    async addMint(e) {
      const t = H(e);
      if (!t) throw new x("bad-input", "That is not a mint's address. It starts with https://.");
      try {
        await g(t);
      } catch (n) {
        throw I(n);
      }
      return s = await i.setMints([.../* @__PURE__ */ new Set([...s.mints, t])]), s;
    },
    async removeMint(e) {
      if (l(e) > 0) throw new x("bad-input", "That mint still holds sats of yours. Spend them first.");
      const t = s.mints.filter((n) => n !== e);
      if (t.length === 0) throw new x("bad-input", "A wallet needs one mint.");
      return s = await i.setMints(t), s;
    },
    /** An invoice to pay, to add sats at a mint. Nothing is added until it is paid and `claim` is called. */
    async fund(e, t) {
      if (!s.mints.includes(e)) throw new x("no-wallet", "That mint is not in this wallet.");
      if (!Number.isSafeInteger(t) || t <= 0 || t > 1e6) throw new x("bad-input", "Choose a whole number of sats, up to a million.");
      try {
        const n = await (await g(e)).createMintQuoteBolt11(t), o = typeof n.expiry == "number" && n.expiry > 0 ? n.expiry : void 0;
        return { mint: e, amount: t, invoice: n.request, quote: n.quote, ...o ? { expiresAt: o } : {} };
      } catch (n) {
        throw I(n);
      }
    },
    /**
     * Take the sats of a funding invoice, once it is paid. Resolves false while it is not. `added` is called once the
     * mint has issued them and they are sealed in this browser, before relays have them: from then on they are kept.
     */
    async claim(e, t) {
      try {
        const { MintQuoteState: n } = await R(), o = await g(e.mint), u = await o.checkMintQuoteBolt11(e.quote);
        if (u.state !== n.PAID) return !1;
        const m = await a(e.mint, o);
        let f = null;
        if (m)
          try {
            f = await m.add(e.amount, u);
          } catch (w) {
            const y = w?.code;
            if (y === "pin-mismatch" && p.add(e.mint), y !== "no-lane" && y !== "no-seed-here" && y !== "pin-mismatch") throw w;
          }
        const E = C(f ?? await o.mintProofsBolt11(e.amount, u)), k = () => {
          s = { ...s, tokens: [...s.tokens, { event: "local:sealed", mint: e.mint, proofs: E }], unsaved: !0 }, t?.();
        };
        return s = await i.roll({ destroy: [], keep: [{ mint: e.mint, proofs: E }], history: { direction: "in", amount: M(E) } }, k), !0;
      } catch (n) {
        throw n?.code === "no-dleq" ? new x("mint", n.message) : I(n);
      }
    },
    /** Whether a claim here found the mint's keys aren't the ones pinned for its keyset. */
    keysChanged(e) {
      return p.has(e);
    },
    /**
     * The owner's press (the fourth review's 2): pin the keys this mint gives now for its keyset, in place of the pin.
     * The worker takes them only where they make the keyset's id. Every device takes up the newer pin.
     */
    async repinMint(e) {
      const t = S();
      if (!t) throw new x("no-wallet", "This wallet can't use a seed here.");
      if (!s.mints.includes(e)) throw new x("no-wallet", "That mint is not in this wallet.");
      const { keysetGiven: n } = await import("./bitlogin-shared-IXY9Q-Ln.js");
      try {
        const o = await g(e);
        await t.repin(o.keysetId, n(o.keyChain.getKeyset(o.keysetId)));
      } catch (o) {
        throw I(o);
      }
      p.delete(e);
    },
    /**
     * Whether this wallet can use the seed at all, here: "yes"; "no-seed" where the store has none (nothing is ever
     * added by the seed, and every mint stays relay-kept); "no-locks" where this browser can't keep two tabs apart
     * (rule 3a). Says nothing about any one mint: that is `seededMint`.
     */
    seedHere() {
      return S() ? P() ? "yes" : "no-locks" : "no-seed";
    },
    /**
     * Restore from the mints, at the person's press (rule 3): each of the wallet's mints is asked, in every keyset it
     * lists, every lane and the trial counters, for what it signed for this seed and still owes. Each lane is followed at
     * least as far as the wallet record says it went. What comes back that this wallet doesn't hold is kept with it,
     * and this browser's lane moves forward past what was found in it, by the worker, under its lock. Nothing is spent.
     * A mint that can't be reached, or can't restore, is named and left as it is.
     */
    async restore() {
      const e = S();
      if (!e) throw new x("no-wallet", "This wallet can't use a seed here.");
      const { restoreFromMint: t } = await import("./bitlogin-shared-DikSzaAH.js"), n = [];
      for (const o of s.mints)
        try {
          const u = await g(o), m = /* @__PURE__ */ new Map();
          for (const w of s.counters ?? []) {
            const y = m.get(w.keysetId) ?? {};
            y[w.lane] = Math.max(y[w.lane] ?? 0, w.next - 1), m.set(w.keysetId, y);
          }
          for (const w of u.keyChain.getKeysets()) {
            const y = await e.lane(w.id).catch(() => null);
            if (!y) continue;
            const A = m.get(w.id) ?? {};
            A[y.lane] = Math.max(A[y.lane] ?? 0, y.next - 1), m.set(w.id, A);
          }
          const f = await t({ wallet: u, seed: e, highest: (w) => m.get(w) ?? {} }), E = new Set(b(o).map((w) => w.secret)), k = C(f.proofs).filter((w) => !E.has(w.secret));
          k.length && (s = await i.roll({ destroy: [], keep: [{ mint: o, proofs: k }], history: { direction: "in", amount: M(k) } }));
          for (const [w, y] of Object.entries(f.next)) {
            const A = await e.lane(w).catch(() => null), _ = A ? y[A.lane] : void 0;
            A && _ !== void 0 && _ > A.next && await e.forward(w, _);
          }
          n.push({ mint: o, sats: M(k), ...f.skipped ? { skipped: f.skipped } : {} });
        } catch (u) {
          n.push({ mint: o, sats: 0, trouble: u?.message || "no answer" });
        }
      return { found: n.reduce((o, u) => o + u.sats, 0), mints: n };
    },
    /**
     * Whether a mint says it restores what it signed and proves it (NUT-09, NUT-12; NUT-13 is the wallet's own): only such a mint can be
     * tried, or restored from. Asks the mint's info, nothing else.
     */
    async mintCanSeed(e) {
      try {
        const t = await (await g(e)).mint.getInfo();
        return [9, 12].every((n) => !!t.nuts?.[String(n)] && t.nuts[String(n)].supported !== !1 && t.nuts[String(n)].disabled !== !0);
      } catch {
        return !1;
      }
    },
    /** Whether a mint's current keyset is one the seed is used for (rule 4), as the screen names it. */
    async seededMint(e) {
      if (!S()) return !1;
      try {
        return r(e, (await g(e)).keysetId);
      } catch {
        return !1;
      }
    },
    /**
     * The trial of a mint, at the person's press only (rule 4): one sat of theirs swapped twice into the same output.
     * A mint that refuses the second passes, and the sat stays theirs; one that signs it again fails, and that sat is
     * gone. The outcome is kept with the wallet record, for every device. Never run when the wallet opens.
     */
    async tryMint(e) {
      const t = S();
      if (!t || !i.keepTrial) return { outcome: "not-tried", why: "This wallet can't use a seed here.", cost: 0 };
      if (!s.mints.includes(e)) throw new x("no-wallet", "That mint is not in this wallet.");
      if (l(e) < 1) throw new x("not-enough", "The trial needs 1 sat at this mint. Add some first.");
      const { tryMint: n } = await import("./bitlogin-shared-BSjKngEL.js");
      let o;
      try {
        o = await g(e);
        const k = await o.mint.getInfo();
        if ([9, 12].some((y) => !k.nuts?.[String(y)] || k.nuts[String(y)].supported === !1 || k.nuts[String(y)].disabled === !0)) return { outcome: "not-tried", why: "This mint doesn't say it can restore what it signed and prove it, so it can't be restored from.", cost: 0 };
        if (Number(o.getFeesForKeyset(1, o.keysetId)) > 0) return { outcome: "not-tried", why: "This mint charges for each swap, so it can't be tried for one sat.", cost: 0 };
        if (!b(e).some((y) => y.amount === 1)) {
          const y = v(e), A = await o.send(1, b(e), { includeFees: !0 });
          s = await i.roll({ destroy: y.map((_) => _.event), keep: [{ mint: e, proofs: [...C(A.keep), ...C(A.send)] }] });
        }
      } catch (k) {
        throw I(k);
      }
      const u = b(e).find((k) => k.amount === 1);
      let m = null, f;
      try {
        f = await n({
          wallet: o,
          seed: t,
          proof: u,
          // The proof the first swap made, kept in place of the one it took before the second swap is asked: where
          // the second fails for any reason, the sat is still held (the review's finding 4).
          keep: async (k) => {
            m = C([k])[0];
            const w = v(e), y = b(e).filter((A) => A.secret !== u.secret);
            s = await i.roll({ destroy: w.map((A) => A.event), keep: [{ mint: e, proofs: [...y, m] }] });
          }
        });
      } catch (k) {
        throw await h(), I(k);
      }
      if (f.outcome === "not-tried") return { outcome: "not-tried", why: f.why, cost: 0 };
      const E = m;
      if (f.outcome === "failed" && E && f.cost > 0) {
        const k = b(e).filter((w) => w.secret !== E.secret);
        s = await i.roll({ destroy: v(e).map((w) => w.event), keep: [{ mint: e, proofs: k }], ...f.cost ? { history: { direction: "out", amount: f.cost } } : {} });
      }
      return s = await i.keepTrial({ mint: e, keysetId: f.keysetId, outcome: f.outcome }), { outcome: f.outcome, cost: f.cost, ...f.outcome === "failed" && f.why ? { why: f.why } : {} };
    },
    /** Take in a Cashu token someone gave: it is swapped at its mint for proofs only this wallet knows. */
    async receive(e) {
      const { getTokenMetadata: t } = await R();
      let n;
      try {
        n = t(e.trim());
      } catch {
        throw new x("bad-input", "That is not a Cashu token.");
      }
      const o = H(n.mint);
      if (!o || n.unit !== "sat") throw new x("bad-input", "That token is not in sats, or names no usable mint.");
      if (!s.mints.includes(o)) throw new x("no-wallet", `That token is from ${o}, which is not one of your mints. Add the mint first if you trust it.`);
      try {
        const u = C(await (await g(o)).receive(e.trim()));
        return s = await i.roll({ destroy: [], keep: [{ mint: o, proofs: u }], history: { direction: "in", amount: M(u) } }), { mint: o, sats: M(u) };
      } catch (u) {
        throw I(u);
      }
    },
    /** What paying an invoice would cost, from the mint that can best afford it. Spends nothing. */
    async quote(e, t) {
      const n = D(e);
      if (!n) throw new x("bad-input", "That is not a Lightning invoice.");
      const o = t ?? [...s.mints].sort((u, m) => l(m) - l(u))[0];
      if (!o) throw new x("no-wallet", "There is no ecash wallet for this account yet.");
      try {
        const u = await (await g(o)).createMeltQuoteBolt11(n);
        return { mint: o, invoice: n, amount: u.amount.toNumber(), feeReserve: u.fee_reserve.toNumber(), quote: u };
      } catch (u) {
        throw I(u);
      }
    },
    /**
     * Pay it. The proofs to spend are chosen (and split at the mint if need be), what was not chosen is kept at
     * once, and then the mint is asked to pay. What the mint did not use for routing comes back as change.
     */
    async pay(e) {
      const { mint: t } = e, n = e.amount + e.feeReserve;
      if (l(t) < n) throw new x("not-enough", `This needs up to ${n} sats, and the wallet holds ${l(t)} at that mint.`);
      const o = v(t), u = b(t), m = l(t);
      let f;
      try {
        const j = await (await g(t)).send(n, u, { includeFees: !0 });
        f = C(j.send), s = await i.roll({ destroy: o.map((K) => K.event), keep: [{ mint: t, proofs: [...C(j.keep), ...f] }] });
      } catch (N) {
        throw /insufficient|not enough|balance/iu.test(N?.message ?? "") ? new x("not-enough", "The wallet does not hold enough at that mint to cover this and the mint's fees.") : I(N);
      }
      const E = v(t), k = new Set(f.map((N) => N.secret)), w = b(t).filter((N) => !k.has(N.secret));
      let y;
      try {
        y = await (await g(t)).meltProofsBolt11(e.quote, f);
      } catch (N) {
        throw await h(), I(N);
      }
      const { MeltQuoteState: A } = await R();
      if (y.quote.state !== A.PAID)
        throw await h(), new x("not-paid", "The mint has not paid it yet. If it does, the sats are spent; if not, they stay yours. Open the wallet again in a minute to see.");
      const _ = C(y.change), q = m - M(w) - M(_);
      return s = await i.roll({ destroy: E.map((N) => N.event), keep: [{ mint: t, proofs: [...w, ..._] }], history: { direction: "out", amount: q } }), { paid: e.amount, fee: q - e.amount, preimage: y.quote.payment_preimage ?? null };
    }
  };
}
class Z extends Error {
  constructor(c, s) {
    super("A part of this was paid, and the rest didn't go."), this.paidSats = c, this.cause_ = s, this.name = "PartPaidError";
  }
}
class T extends Error {
  constructor(c, s, d = "") {
    super(s), this.code = c, this.serviceCode = d, this.name = "PurchaseError";
  }
}
const O = /^[0-9a-f]{64}$/u, B = /^order_[A-Za-z0-9_-]{12,80}$/u, V = async (i) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(i))), (c) => c.toString(16).padStart(2, "0")).join(""), $ = () => crypto.randomUUID().replaceAll("-", "");
function L(i, c) {
  const s = () => {
    throw new T("plan", "The seller's service answered with a payment plan that doesn't match what was asked. Nothing was spent.");
  }, d = i;
  if (!d || typeof d != "object" || d.productCoordinate !== c.listing || d.buyerPubkey !== c.buyer || d.currency !== "SAT" || d.completionRule !== "all" || typeof d.orderId != "string" || !B.test(d.orderId) || !Array.isArray(d.legs) || d.legs.length < 1 || d.legs.length > 16) return s();
  const g = d.totalSats;
  if (typeof g != "number" || !Number.isSafeInteger(g) || g < 1 || g > c.priceSats) return s();
  const v = /* @__PURE__ */ new Set(), b = [];
  for (const l of d.legs) {
    const I = l?.amountSats, S = l?.status;
    if (!l || typeof I != "number" || !Number.isSafeInteger(I) || I < 1 || typeof l.paymentHash != "string" || !O.test(l.paymentHash) || v.has(l.paymentHash) || S !== "pending" && S !== "settled" && S !== "expired") return s();
    const P = typeof l.paymentRequest == "string" ? l.paymentRequest.trim().toLowerCase() : "", p = l.rail === "sandbox" && l.adapter === "mock" && /^bitunlock-mock:1:[0-9a-f]{64}$/u.test(P);
    if (S !== "settled" && !(c.sandbox ? p : l.rail === "lightning" && G(P) === I)) return s();
    v.add(l.paymentHash);
    const r = l.role === "share" && typeof l.recipientPubkey == "string" && O.test(l.recipientPubkey) ? l.recipientPubkey : "", a = r ? J(l.label) : "";
    if (l.role === "share" && (!r || !a)) return s();
    b.push({ role: l.role === "seller" ? "seller" : l.role === "bitunlock" ? "service" : r ? "share" : "other", sats: I, invoice: P, hash: l.paymentHash, status: S, ...r ? { to: r, label: a } : {} });
  }
  return b.reduce((l, I) => l + I.sats, 0) !== g ? s() : { order: d.orderId, totalSats: g, legs: b };
}
function se(i, c, s = {}) {
  const d = () => {
    throw new T("plan", "The seller's service answered with a payment plan that isn't what the seller wrote. Nothing was spent.");
  }, g = i.legs.filter((P) => P.role === "seller"), v = i.legs.filter((P) => P.role === "service"), b = i.legs.filter((P) => P.role === "share");
  if (g.length !== 1 || v.length > 1 || i.legs.some((P) => P.role === "other")) return d();
  if (!c.shared) return b.length === 0 ? void 0 : d();
  if (!c.shares) return d();
  const l = v[0]?.sats ?? 0;
  if (s.fee && l !== Math.min(Math.max(Math.floor(c.priceSats * s.fee.bps / 1e4), s.fee.min), s.fee.max) || i.totalSats !== c.priceSats || ![U(c.priceSats, c.shares, c.seller, { ...s.client ? { client: s.client } : {}, charge: l }), U(c.priceSats, c.shares, c.seller, { charge: l })].some((P) => {
    if (!P.ok) return !1;
    const p = P.parts.filter((r) => !r.seller);
    return P.parts.find((r) => r.seller).sats === g[0].sats && p.length === b.length && p.every((r) => b.some((a) => a.to === r.to && a.sats === r.sats && a.label === r.label));
  })) return d();
}
const re = () => $(), X = /^[A-Za-z0-9_-]{16,128}$/u;
async function oe(i, c = (s, d) => fetch(s, d)) {
  const s = await c(`${i.endpoint}/sandbox/v1/sessions`, { method: "POST", credentials: "omit", referrerPolicy: "no-referrer", headers: { accept: "application/json", "content-type": "application/json" }, body: JSON.stringify({ ttlSeconds: 3600 }) }), d = await s.json().catch(() => null);
  if (!s.ok || typeof d?.sessionId != "string" || typeof d.token != "string" || d.sessionId.length > 200 || d.token.length > 400) throw new T("service", "The test service gave no session.");
  return { sessionId: d.sessionId, token: d.token };
}
function ae(i, c, s = {}) {
  const d = s.sandbox ?? null, g = s.fetch ?? ((r, a) => fetch(r, a)), v = () => {
    throw new T("service", "The seller's service didn't answer. Nothing was spent.");
  }, b = async (r, a, h, e = !0) => {
    const t = new URL(r, i.endpoint).toString(), n = h === void 0 ? void 0 : JSON.stringify(h), o = new AbortController(), u = setTimeout(() => o.abort(), 2e4);
    try {
      const m = e ? await c.auth({ url: t, method: a, ...a === "POST" ? { payload: await V(n ?? "") } : {} }) : "", f = await g(t, { method: a, credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", headers: { accept: "application/json", ...m ? { authorization: m } : {}, ...d && e ? { "x-bitunlock-sandbox-session": d.sessionId } : {}, ...n === void 0 ? {} : { "content-type": "application/json" } }, ...n === void 0 ? {} : { body: n }, signal: o.signal }), E = await f.text();
      if (E.length > 1e6) return v();
      const k = E ? JSON.parse(E) : null;
      if (!f.ok) {
        const w = k?.error?.code;
        throw new T("service", "The seller's service refused that. Nothing more was spent.", typeof w == "string" ? w.slice(0, 80) : "");
      }
      return k;
    } catch (m) {
      if (m instanceof T) throw m;
      return v();
    } finally {
      clearTimeout(u);
    }
  }, l = (r) => ({ listing: r.coordinate, buyer: c.pubkey, priceSats: r.priceSats, sandbox: !!d }), I = (r) => r instanceof T ? r.serviceCode : "", S = () => {
    throw new T("withdrawn", "This was withdrawn by its seller, and can't be finished.");
  }, P = (r) => {
    const a = z(r, [i]);
    return a && a.buyer === c.pubkey ? a : null;
  }, p = {
    async policy() {
      const a = (await b("/.well-known/bitunlock.json", "GET", void 0, !1))?.event;
      if (!a || a.pubkey !== i.pubkey || a.kind !== 30078 || !W(a)) return v();
      let h;
      try {
        h = JSON.parse(a.content);
      } catch {
        return v();
      }
      if (h.endpoint !== i.endpoint || h.servicePubkey !== i.pubkey || h.status !== "active") return v();
      const e = Array.isArray(h.relays) ? h.relays.filter((o) => typeof o == "string" && o.length <= 200 && /^wss?:\/\//u.test(o)).slice(0, 6) : [], t = h.feePolicy, n = (o) => typeof o == "number" && Number.isSafeInteger(o) && o >= 0;
      return { relays: e, sandbox: Array.isArray(h.paymentAdapters) && h.paymentAdapters.includes("mock"), fee: t && n(t.feeBps) && n(t.minimumSats) && n(t.maximumSats) ? { bps: t.feeBps, min: t.minimumSats, max: t.maximumSats } : null };
    },
    async quote(r, a, h) {
      try {
        return L(await b("/v1/quotes", "POST", { productCoordinate: r.coordinate, buyerPubkey: c.pubkey, idempotencyKey: a && X.test(a) ? a : $(), ...h && O.test(h) ? { clientPubkey: h } : {} }), l(r));
      } catch (e) {
        throw /sold|inventory|reserved|revoked|inactive/u.test(I(e)) ? new T("sold", "This isn't for sale just now. Nothing was spent.") : I(e) === "shares_unavailable" ? new T("sold", "This can't be sold just now: someone its price is shared with can't be paid. Nothing was spent.") : e;
      }
    },
    async settle(r) {
      if (!d || !O.test(r)) throw new T("plan", "That is not a pretend payment a test service takes.");
      if (!(await g(`${i.endpoint}/sandbox/v1/payments/${r}/settle`, { method: "POST", credentials: "omit", referrerPolicy: "no-referrer", headers: { accept: "application/json", authorization: `Bearer ${d.token}`, "x-bitunlock-sandbox-session": d.sessionId } }).catch(() => null))?.ok) throw new T("service", "The test service didn't settle that pretend payment.");
    },
    async resume(r, a) {
      const h = ["quoted", "partially_paid", "paid", "expired_pending_requote"];
      if (a && B.test(a)) {
        const t = await b(`/v1/orders/${encodeURIComponent(a)}`, "GET").catch(() => null);
        if (!t || t.orderId !== a || !h.includes(String(t.state))) return null;
        try {
          return await p.refresh(r, a);
        } catch (n) {
          if (n instanceof T && n.code === "withdrawn") throw n;
          return L(t.paymentPlan, l(r));
        }
      }
      const e = await b(`/v1/orders?${new URLSearchParams({ productCoordinate: r.coordinate })}`, "GET").catch(() => null);
      for (const t of Array.isArray(e?.orders) ? e.orders.slice(0, 20) : [])
        if (!(t?.state !== "partially_paid" && t?.state !== "paid" && t?.state !== "expired_pending_requote"))
          try {
            const n = L(t.paymentPlan, l(r));
            return await p.refresh(r, n.order).catch((o) => {
              if (o instanceof T && o.code === "withdrawn") throw o;
              return n;
            });
          } catch (n) {
            if (n instanceof T && n.code === "withdrawn") throw n;
            continue;
          }
      return null;
    },
    async refresh(r, a, h = []) {
      const e = h.filter((n) => O.test(n)), t = L(
        await b(`/v1/orders/${encodeURIComponent(a)}/refresh`, "POST", { idempotencyKey: $(), ...e.length ? { preimages: e } : {} }).catch((n) => I(n) === "product_revoked" ? S() : Promise.reject(n)),
        l(r)
      );
      if (t.order !== a) throw new T("plan", "The seller's service answered about a different order.");
      return t;
    },
    async unlock(r, a) {
      const h = await b(`/v1/orders/${encodeURIComponent(a)}/unlock`, "POST", { idempotencyKey: $() });
      if (!h || h.orderId !== a || h.productCoordinate !== r.coordinate || h.buyerPubkey !== c.pubkey) throw new T("delivery", "The seller's service answered about a different order.");
      let e = P(h.fulfillmentEvent);
      if ((!e || e.order !== a) && (e = (await p.receipts()).map((n) => n.receipt).find((n) => n.order === a) ?? null), !e || e.order !== a || !Q(e, { buyer: c.pubkey, listing: r.coordinate, now: Date.now() / 1e3 }))
        throw new T("receipt", "It was paid, but the seller's service gave no receipt. Ask again from the site: you won't be charged twice.");
      let t = "";
      if (typeof h.buyerEnvelope == "string" && h.buyerEnvelope.length > 0 && h.buyerEnvelope.length <= 2e5)
        try {
          const n = JSON.parse(await c.open(i.pubkey, h.buyerEnvelope));
          if (n.orderId !== a || n.productCoordinate !== r.coordinate || n.buyerPubkey !== c.pubkey) throw new Error("another order's");
          t = typeof n.payload == "string" ? n.payload : JSON.stringify(n.payload ?? "");
        } catch {
          throw new T("delivery", "It was paid and the receipt is yours, but what it delivers couldn't be opened. Ask again from the site: you won't be charged twice.");
        }
      return { receipt: e, delivery: t.length <= 2e4 ? t : "" };
    },
    async receipts() {
      const r = await b("/v1/access-entitlements", "GET"), a = [];
      for (const h of Array.isArray(r?.entitlements) ? r.entitlements.slice(0, 500) : []) {
        const e = P(h?.event);
        e && a.push({ receipt: e, status: h.status === "revoked" ? "revoked" : h.status === "expired" ? "expired" : "active" });
      }
      return a;
    }
  };
  return p;
}
async function ie(i) {
  const { client: c, listing: s } = i, d = i.wait ?? ((S) => new Promise((P) => setTimeout(P, S))), g = F(s.coordinate);
  let v = i.plan;
  const b = [];
  let l = 0;
  try {
    return await I();
  } catch (S) {
    throw S instanceof T && (S.code === "receipt" || S.code === "delivery") ? S : l > 0 ? new Z(l, S) : S;
  }
  async function I() {
    const S = (p) => p.role === "service" ? 0 : p.role === "seller" ? 2 : 1, P = [...v.legs].sort((p, r) => S(p) - S(r) || p.sats - r.sats || ((p.to ?? "") < (r.to ?? "") ? -1 : 1));
    for (const p of P) {
      let r = v.legs.find((e) => e.hash === p.hash);
      if (r.status === "settled") continue;
      if (r.status === "expired") throw new T("expired", "This offer ran out before it was paid. Ask again from the site for a new one.");
      i.progress?.({ paying: r });
      const a = await i.pay(r);
      l += r.sats, typeof a.preimage == "string" && O.test(a.preimage) && b.push(a.preimage);
      let h = !1;
      for (let e = 0; e < (i.tries ?? 15) && !h; e++) {
        e > 0 && await d(1e3), v = await c.refresh(s, v.order, b);
        const t = v.legs.find((n) => n.hash === p.hash);
        if (!t) throw new T("plan", "The seller's service changed the payment plan after a part of it was paid. Nothing more was spent.");
        r = t, h = r.status === "settled";
      }
      if (!h) throw new T("not-settled", "The payment was sent, but the seller's service hasn't seen it arrive yet. Ask again from the site in a minute: you won't be charged twice.");
    }
    if (!g || v.legs.some((p) => p.status !== "settled")) throw new T("not-settled", "Not every part of the payment arrived.");
    i.progress?.({ unlocking: !0 });
    try {
      return await c.unlock(s, v.order);
    } catch (p) {
      throw p instanceof T && (p.code === "receipt" || p.code === "delivery") ? p : new T("receipt", "It is paid in full, and the seller's service hasn't given your receipt yet. Nothing more is owed. Try again later: you won't be charged again.", p instanceof T ? p.serviceCode : "");
    }
  }
}
export {
  x as EcashError,
  de as LEAST_PRICE_SATS,
  he as NO_SEED_HERE,
  ue as PAY_LIMIT,
  Z as PartPaidError,
  T as PurchaseError,
  fe as RESTORE_GAP,
  we as SHARE_LIMITS,
  pe as TipError,
  ye as UNLOCK_SERVICES,
  me as belongsTo,
  ge as bestReceipt,
  F as cleanCoordinate,
  D as cleanInvoice,
  be as cleanLightningAddress,
  H as cleanMint,
  ke as cleanPayLimit,
  ve as cleanSats,
  ie as completePurchase,
  ne as createEcashWallet,
  ae as createUnlockClient,
  se as holdToListing,
  Se as invoiceFromAddress,
  G as invoiceSats,
  Te as localService,
  re as newOrderKey,
  oe as openSandboxSession,
  Ie as overPayLimit,
  Pe as readListing,
  L as readPlan,
  z as readReceipt,
  xe as readShares,
  Ae as readWorld,
  Q as receiptGood,
  Oe as renderQrSvg,
  Ee as sellerOf,
  Ne as sharesOpenAt,
  U as splitPrice,
  Me as tipNote,
  Ce as underFloor
};
