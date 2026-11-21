import { c as P, t as F, o as J, r as ee, u as B, k as te, m as ne, q as O, v as se, R as re } from "./bitlogin-shared-BqDMTUOp.js";
import { e as Pe, w as je } from "./bitlogin-shared-BqDMTUOp.js";
import { r as g, f as oe, k as H, i as v } from "./bitlogin-shared-AdzLHSV8.js";
import { f as ie } from "./bitlogin-shared-B_Tl4qF0.js";
import { a as _e } from "./bitlogin-shared-D6Hzbnis.js";
const V = "bitlogin-panel", K = 1, le = ["https://portal.bitblocks.network"];
function ge(t, e) {
  const n = P(t);
  return n ? F(e) ? F(n) : le.includes(n) : !1;
}
function be(t) {
  return { bitlogin: V, v: K, ...t };
}
function ke(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.bitlogin !== V || e.v !== K || e.t !== "hello") return null;
  const n = e.mode === void 0 ? e.world === void 0 ? "account" : "ask" : e.mode;
  if (n !== "ask" && n !== "switch" && n !== "account" && n !== "files" && n !== "wallet") return null;
  let s;
  return e.world !== void 0 && (s = P(e.world), !s) || (n === "ask" || n === "switch") && !s ? null : { t: "hello", mode: n, ...s ? { world: s } : {} };
}
function ae(t) {
  const e = [];
  try {
    const n = t.parent;
    for (let s = 0; s < n.frames.length; s++) {
      const r = n.frames[s];
      if (r !== t) {
        e.push(r);
        for (let o = 0; o < r.frames.length; o++) e.push(r.frames[o]);
      }
    }
  } catch {
  }
  return e;
}
const Y = "bitlogin:allowed-sites:v1", y = {
  /** No more entries than this are kept: the oldest go first. */
  entries: 200,
  /** How long an entry is kept after it has ended, in seconds. */
  keepEndedSec: 720 * 3600,
  /** After "Just this one", a family is not offered again for this long, in seconds (docs/site-family.md SF4). */
  familyDeclineSec: 720 * 3600,
  /** No more sites than this are listed under a family. */
  members: 20
}, ue = /^[0-9a-f]{64}$/u;
function D(t) {
  if (!t || typeof t != "object") return null;
  const e = t, n = g(e.site), s = n || (typeof e.site == "string" && e.site.includes("*") ? "" : P(e.site));
  if (!s || s !== e.site || typeof e.pubkey != "string" || !ue.test(e.pubkey) || typeof e.at != "number" || typeof e.until != "number" || !Number.isFinite(e.at) || !Number.isFinite(e.until) || e.until < e.at) return null;
  const r = e.wants === void 0 ? void 0 : ee(e.wants);
  if (r === null || n && r) return null;
  const o = n && Array.isArray(e.members) ? [...new Set(e.members.filter((i) => v(i, n)))].slice(0, y.members) : [];
  return { site: s, ...o.length ? { members: o } : {}, pubkey: e.pubkey, at: Math.floor(e.at), until: Math.floor(e.until), remembered: e.remembered === !0, ...r ? { wants: r } : {} };
}
function ce(t, e) {
  if (!t) return [];
  let n;
  try {
    n = JSON.parse(t);
  } catch {
    return [];
  }
  return Array.isArray(n) ? n.slice(0, y.entries * 2).map(D).filter((s) => s !== null && s.until + y.keepEndedSec > e).sort((s, r) => r.at - s.at).slice(0, y.entries) : [];
}
function de(t, e) {
  const n = D(e);
  if (!n) return [...t];
  const s = t.find((o) => o.site === n.site && o.pubkey === n.pubkey);
  return [g(n.site) && s?.members ? D({ ...n, members: [...n.members ?? [], ...s.members] }) ?? n : n, ...t.filter((o) => !(o.site === n.site && o.pubkey === n.pubkey))].slice(0, y.entries);
}
function Ae(t, e, n, s) {
  return !g(n) || !v(e, n) ? null : t.find((r) => r.pubkey === s && r.remembered && r.site !== e && v(r.site, n)) ?? null;
}
function Le(t, e, n) {
  return t.filter((s) => !(s.site === e && s.pubkey === n));
}
function Se(t, e) {
  const n = t.until <= e, s = oe(t.site) || null;
  return {
    known: s ? H(t.site) ? `every site at ${s}` : null : J(t.site),
    family: s,
    ended: n,
    lasts: n ? "Ended." : t.remembered ? "Remembered on this device until then, unless you sign out there sooner." : "For one visit: it ended when that site's page was closed or loaded again, and by then at the latest."
  };
}
const b = () => {
  try {
    return typeof localStorage > "u" ? null : localStorage;
  } catch {
    return null;
  }
};
function fe(t = Date.now() / 1e3, e = b()) {
  try {
    return ce(e?.getItem(Y), t);
  } catch {
    return [];
  }
}
function me(t, e = b()) {
  try {
    return e?.setItem(Y, JSON.stringify(t)), !!e;
  } catch {
    return !1;
  }
}
function Ee(t, e = b()) {
  return me(de(fe(t.at, e), t), e);
}
const U = "bitlogin:family-declined:v1", W = (t) => {
  try {
    const e = JSON.parse(t?.getItem(U) ?? "{}");
    return e && typeof e == "object" && !Array.isArray(e) ? e : {};
  } catch {
    return {};
  }
};
function $e(t, e = Date.now() / 1e3, n = b()) {
  if (!g(t)) return !1;
  const s = Math.floor(e), r = Object.fromEntries(Object.entries(W(n)).filter(([o, i]) => g(o) && typeof i == "number" && i > s));
  r[t] = s + y.familyDeclineSec;
  try {
    return n?.setItem(U, JSON.stringify(r)), !!n;
  } catch {
    return !1;
  }
}
function Ne(t, e = Date.now() / 1e3, n = b()) {
  const s = W(n)[t];
  return typeof s == "number" && s > e;
}
const u = (t, e = 200) => {
  if (typeof t != "string") return "";
  const n = (r) => r < 32 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8238 || r >= 8288 && r <= 8297 || r === 65279, s = Array.from(t, (r) => n(r.codePointAt(0) ?? 0) ? " " : r).join("").split(" ").filter(Boolean).join(" ");
  return [...s].length > e ? `${[...s].slice(0, e).join("")}…` : s;
}, $ = [
  ["name", "Name"],
  ["display_name", "Display name"],
  ["about", "About"],
  ["picture", "Picture"],
  ["banner", "Banner"],
  ["website", "Website"],
  ["nip05", "Verified name (NIP-05)"],
  ["lud16", "Lightning address"],
  ["lud06", "Lightning address (LNURL)"]
], I = (t) => {
  try {
    const e = JSON.parse(t);
    if (e && typeof e == "object" && !Array.isArray(e)) return e;
  } catch {
  }
  return {};
}, C = new Map($), T = (t, e) => t === "name" || t === "display_name" ? B(e) || u(e, 48) : typeof e == "string" ? u(e) : e == null ? "" : u(JSON.stringify(e), 120);
function he(t, e) {
  const n = (i) => C.get(i) ?? `"${u(i, 40)}"`, s = [...$.map(([i]) => i), ...[.../* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)])].filter((i) => !C.has(i)).sort()], r = [];
  let o = 0;
  for (const i of s) {
    const a = T(i, e[i]), d = T(i, t[i]);
    !a && !d || (a === d && JSON.stringify(e[i]) === JSON.stringify(t[i]) ? o += 1 : a ? d ? r.push(`${n(i)}: ${d}. It was: ${a}`) : r.push(`${n(i)}, removed. It was: ${a}`) : r.push(`${n(i)}, added: ${d}`));
  }
  return r.length === 0 && r.push("Nothing would change: it says what your profile says now."), o > 0 && r.push(`${o} other ${o === 1 ? "field stays" : "fields stay"} as ${o === 1 ? "it is" : "they are"}.`), {
    title: "Change your Nostr profile?",
    warning: "This is what would change, everywhere you use this account. A lightning address is where people send you money: if it is changing, check it.",
    lines: r
  };
}
function Oe(t, e) {
  if (t.kind === 0 && typeof e == "string") return he(I(t.content), I(e));
  if (t.kind === 0) {
    const n = I(t.content), s = $.filter(([o]) => u(n[o])).map(([o, i]) => `${i}: ${o === "name" || o === "display_name" ? B(n[o]) || u(n[o], 48) : u(n[o])}`), r = Object.keys(n).filter((o) => !$.some(([i]) => i === o));
    return r.length && s.push(`And ${r.length} other ${r.length === 1 ? "field" : "fields"}: ${u(r.join(", "), 120)}`), s.length === 0 && s.push("An empty profile: no name, no picture, nothing about you."), e === null && s.push("Your profile as it is now couldn't be read, so this is the whole new one, not only what changes."), {
      title: "Replace your Nostr profile?",
      warning: "This replaces your whole profile, everywhere you use this account. Anything not listed here is removed from it. A lightning address is where people send you money: check it.",
      lines: s
    };
  }
  if (t.kind === 5) {
    const n = t.tags.filter((o) => o[0] === "e" && o[1]).map((o) => `Note ${u(o[1], 64)}`), s = t.tags.filter((o) => o[0] === "a" && o[1]).map((o) => `Item ${u(o[1], 120)}`), r = [...n, ...s].slice(0, 12);
    return n.length + s.length > 12 && r.push(`And ${n.length + s.length - 12} more.`), r.length === 0 && r.push("It names nothing to delete."), u(t.content) && r.push(`Reason given: ${u(t.content)}`), {
      title: `Ask relays to delete ${n.length + s.length === 1 ? "this" : `these ${n.length + s.length} things`}?`,
      warning: "A deletion can't be undone. Relays that honour it remove what is named, anywhere it was posted from, not only what you posted in this world. Some relays, and anyone who already has a copy, keep it.",
      lines: r
    };
  }
  if (t.kind === 10002) {
    const n = t.tags.filter((r) => r[0] === "r" && r[1]), s = n.slice(0, 20).map((r) => `${u(r[1], 120)}${r[2] === "read" ? " (read only)" : r[2] === "write" ? " (write only)" : ""}`);
    return n.length > 20 && s.push(`And ${n.length - 20} more.`), s.length === 0 && s.push("An empty list: no relays at all."), {
      title: "Replace the list of relays you use?",
      warning: "This replaces your whole relay list. Other apps look there to find your notes and to reach you, and BitLogin looks there when you take a site back. A list of relays you don't know could hide you, or what you do, from the people who follow you.",
      lines: s
    };
  }
  return { title: "Sign this?", warning: "BitLogin can't say what this does.", lines: [`Kind ${t.kind}`] };
}
function Ie(t = {}) {
  if (typeof window > "u") return Promise.resolve(null);
  const e = t.inClient ? null : window.opener;
  if (t.inClient ? window.parent === window : !e) return Promise.resolve(null);
  const n = () => t.inClient ? ae(window) : Array.from({ length: e.frames.length }, (i, a) => e.frames[a]), s = location.origin, r = crypto.getRandomValues(new Uint8Array(12)), o = Array.from(r, (i) => i.toString(16).padStart(2, "0")).join("");
  return new Promise((i) => {
    let a = null, d = !1, N = null;
    const j = () => {
      if (!a)
        try {
          for (const m of n()) m.postMessage(O({ t: "hello", nonce: o }), s);
        } catch {
        }
    }, M = setInterval(j, 350), q = setTimeout(() => {
      clearInterval(M), d || (d = !0, window.removeEventListener("message", k), i(null));
    }, t.timeoutMs ?? 6e3), k = (m) => {
      if (m.origin !== s || !m.source || m.source === window) return;
      const l = te(m.data);
      if (!l || l.nonce !== o) return;
      if (l.t === "done" && a && m.source === a) return void N?.(l.ok);
      if (l.t !== "frame" || a || t.world && l.world !== t.world) return;
      a = m.source, clearInterval(M), clearTimeout(q), d = !0;
      const { world: f, recipient: x } = l, c = l.wants && ne(f, l.wants) ? l.wants : null, G = l.turnedDown === !0 || !!l.wants && !c, w = c ? [] : l.has ?? [], A = c ? [] : (l.more ?? []).filter((h) => !w.includes(h)), p = c || A.length || w.length ? "" : ie(f);
      i({
        site: f,
        wants: c,
        known: J(f) !== null,
        family: p,
        knownFamily: p ? H(p) : !1,
        turnedDown: G,
        more: A,
        has: w,
        local: !!c && se(f) && [...c.sign, ...c.read].some((h) => re.includes(h)),
        ask: l.ask ?? null,
        askedAs: l.ask ? l.pubkey ?? null : null,
        async answer(h) {
          const L = new Promise((E) => {
            N = E, setTimeout(() => E(!1), 8e3);
          });
          a.postMessage(O({ t: "answer", nonce: o, world: f, ...h ?? {} }), s);
          const S = await L;
          return window.removeEventListener("message", k), S;
        },
        async grant(h, L, S, E, X) {
          const _ = E === !0 && S === !0 && !!p, z = await h.exportHandoff(x, c ? { site: f, permissions: c } : void 0, f, S === !0, _ ? p : void 0, _ ? void 0 : X === !0 && A.length ? [...w, ...A] : w.length ? w : void 0), Q = new Promise((R) => {
            N = R, setTimeout(() => R(!1), 8e3);
          });
          a.postMessage(O({ t: "grant", nonce: o, world: f, sealed: z, ...L ? { name: L } : {} }), s);
          const Z = await Q;
          return window.removeEventListener("message", k), Z;
        }
      });
    };
    window.addEventListener("message", k), j();
  });
}
export {
  le as PANEL_CLIENTS,
  Pe as SIGN_LIMITS,
  _e as askLockDevice,
  $e as declineFamily,
  Se as describeAllowed,
  Oe as describeAsked,
  je as describePermissions,
  Ne as familyDeclined,
  oe as familyDomain,
  ie as familyOf,
  Ae as familyOffer,
  Ie as findEmbeddedSigner,
  v as inFamily,
  J as knownAppName,
  H as knownFamily,
  fe as loadAllowed,
  ge as panelClientAllowed,
  be as panelMessage,
  ke as readPanelHello,
  Ee as recordAllowed,
  Le as removeAllowed,
  me as saveAllowed
};
