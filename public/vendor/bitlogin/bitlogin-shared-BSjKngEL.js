import { CheckStateEnum as d } from "./bitlogin-shared-BooorIKj.js";
import { keysetGiven as m, signedFor as p } from "./bitlogin-shared-IXY9Q-Ln.js";
import { aF as _, aG as F } from "./bitlogin-shared-BkXi7a9G.js";
const f = (e, o) => {
  const t = e.nuts?.[String(o)];
  return !!t && t.supported !== !1 && t.disabled !== !0;
}, y = (e) => /already signed/iu.test(String(e?.message ?? "")) || e?.code === 10002;
async function b(e) {
  const { wallet: o } = e, t = o.keysetId, r = await o.mint.getInfo();
  if (!f(r, 9)) return { keysetId: t, outcome: "not-tried", why: "This mint doesn't say it can restore what it signed.", cost: 0 };
  if (!f(r, 12)) return { keysetId: t, outcome: "not-tried", why: "This mint doesn't prove what it signs, so it can't be restored from.", cost: 0 };
  const u = o.keyChain.getKeyset(t);
  if (Number(o.getFeesForKeyset(1, t)) > 0) return { keysetId: t, outcome: "not-tried", why: "This mint charges for each swap, so it can't be tried for one sat.", cost: 0 };
  if (Number(e.proof.amount) !== 1) return { keysetId: t, outcome: "not-tried", why: "The trial is made with a 1-sat proof, and none was given.", cost: 0 };
  let n = null;
  for (let s = 0; s < 8 && !n; s++) {
    const a = await e.seed.trialOutput(t, m(u)), { outputs: l } = await o.mint.restore({ outputs: [{ amount: a.amount, id: a.id, B_: a.B_ }] });
    l.length === 0 && (n = a);
  }
  if (!n) return { keysetId: t, outcome: "not-tried", why: "No unused trial counter was found.", cost: 0 };
  const c = { amount: n.amount, id: n.id, B_: n.B_ }, h = await o.mint.swap({ inputs: [e.proof], outputs: [c] });
  let i;
  try {
    [i] = await e.seed.unblind(t, m(u), p([n], h.signatures));
  } catch (s) {
    if (s?.code === "no-dleq") return { keysetId: t, outcome: "failed", cost: 1, why: "This mint signed the trial's sat but didn't prove it, so the sat couldn't be kept." };
    throw s;
  }
  if (!i) throw new Error("The mint's answer could not be finished into a proof.");
  await e.keep(i);
  try {
    await o.mint.swap({ inputs: [i], outputs: [c] });
  } catch (s) {
    if (!y(s)) throw s;
    const [a] = await o.checkProofsStates([i]);
    return a?.state === d.UNSPENT ? { keysetId: t, outcome: "passed", cost: 0, kept: i } : { keysetId: t, outcome: "failed", cost: 1 };
  }
  const [w] = await o.checkProofsStates([i]);
  return { keysetId: t, outcome: "failed", cost: w?.state === d.SPENT ? 1 : 0 };
}
export {
  _ as TRIAL_FROM,
  F as TRIAL_TO,
  b as tryMint
};
