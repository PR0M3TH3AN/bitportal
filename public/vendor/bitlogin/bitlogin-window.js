import { y as P, A as B, $ as V, z as te, O as K, a2 as j, X as ne, a1 as $, a3 as se, a4 as re } from "./bitlogin-shared-BosVxhRE.js";
import { I as je, a5 as Me, a6 as _e, a7 as Ce, a8 as Fe, a9 as Re, aa as Te } from "./bitlogin-shared-BosVxhRE.js";
import { r as b, f as oe, k as Y, i as I } from "./bitlogin-shared-ocmFRDk5.js";
import { f as ie } from "./bitlogin-shared-BfA24Ad_.js";
import { a as Je } from "./bitlogin-shared-D6Hzbnis.js";
const M = "bitlogin-panel", _ = 1, le = ["https://portal.bitblocks.network"];
function be(t, e) {
  const n = P(t);
  return n ? B(e) ? B(n) : le.includes(n) : !1;
}
function ke(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.bitlogin !== M || e.v !== _) return null;
  if (e.t === "hide") return { t: "hide" };
  if (e.t !== "show") return null;
  const n = ae({ ...e, t: "hello" });
  if (!n) return null;
  const { t: s, ...r } = n;
  return { t: "show", ...r };
}
function Ae(t) {
  return { bitlogin: M, v: _, ...t };
}
function ae(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.bitlogin !== M || e.v !== _ || e.t !== "hello") return null;
  const n = e.mode === void 0 ? e.world === void 0 ? "account" : "ask" : e.mode;
  if (n !== "ask" && n !== "switch" && n !== "account" && n !== "files" && n !== "wallet" && n !== "library") return null;
  let s;
  return e.world !== void 0 && (s = P(e.world), !s) || (n === "ask" || n === "switch") && !s ? null : { t: "hello", mode: n, ...s ? { world: s } : {} };
}
function ue(t) {
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
const U = "bitlogin:allowed-sites:v1", p = {
  /** No more entries than this are kept: the oldest go first. */
  entries: 200,
  /** How long an entry is kept after it has ended, in seconds. */
  keepEndedSec: 720 * 3600,
  /** After "Just this one", a family is not offered again for this long, in seconds (docs/site-family.md SF4). */
  familyDeclineSec: 720 * 3600,
  /** No more sites than this are listed under a family. */
  members: 20
}, ce = /^[0-9a-f]{64}$/u;
function D(t) {
  if (!t || typeof t != "object") return null;
  const e = t, n = b(e.site), s = n || (typeof e.site == "string" && e.site.includes("*") ? "" : P(e.site));
  if (!s || s !== e.site || typeof e.pubkey != "string" || !ce.test(e.pubkey) || typeof e.at != "number" || typeof e.until != "number" || !Number.isFinite(e.at) || !Number.isFinite(e.until) || e.until < e.at) return null;
  const r = e.wants === void 0 ? void 0 : te(e.wants);
  if (n && e.wants !== void 0) return null;
  const o = r === null || r !== void 0 && !K(s, r), i = e.wants?.appData, l = o && Array.isArray(i) ? i.filter((h) => typeof h == "string").map((h) => j(h)).filter(Boolean).slice(0, 8) : [], c = n && Array.isArray(e.members) ? [...new Set(e.members.filter((h) => I(h, n)))].slice(0, p.members) : [];
  return { site: s, ...c.length ? { members: c } : {}, pubkey: e.pubkey, at: Math.floor(e.at), until: Math.floor(e.until), remembered: e.remembered === !0, ...r && !o ? { wants: r } : {}, ...o ? { refused: !0, ...l.length ? { hadNames: l } : {} } : {} };
}
function de(t, e) {
  if (!t) return [];
  let n;
  try {
    n = JSON.parse(t);
  } catch {
    return [];
  }
  return Array.isArray(n) ? n.slice(0, p.entries * 2).map(D).filter((s) => s !== null && s.until + p.keepEndedSec > e).sort((s, r) => r.at - s.at).slice(0, p.entries) : [];
}
function fe(t, e) {
  const n = D(e);
  if (!n) return [...t];
  const s = t.find((o) => o.site === n.site && o.pubkey === n.pubkey);
  return [b(n.site) && s?.members ? D({ ...n, members: [...n.members ?? [], ...s.members] }) ?? n : n, ...t.filter((o) => !(o.site === n.site && o.pubkey === n.pubkey))].slice(0, p.entries);
}
function Le(t, e, n, s) {
  return !b(n) || !I(e, n) ? null : t.find((r) => r.pubkey === s && r.remembered && r.site !== e && I(r.site, n)) ?? null;
}
function Oe(t, e, n) {
  return t.filter((s) => !(s.site === e && s.pubkey === n));
}
function Ee(t, e) {
  const n = t.refused === !0 || t.until <= e, s = oe(t.site) || null;
  return {
    known: s ? Y(t.site) ? `every site at ${s}` : null : V(t.site),
    family: s,
    ended: n,
    lasts: t.refused ? "Ended by BitLogin: it had been allowed to write or read data under names no site may now have, such as BitLogin's own records or every application's. If you use it, it will ask you again." : n ? "Ended." : t.remembered ? "Remembered on this device until then, unless you sign out there sooner." : "For one visit: it ended when that site's page was closed or loaded again, and by then at the latest."
  };
}
const k = () => {
  try {
    return typeof localStorage > "u" ? null : localStorage;
  } catch {
    return null;
  }
};
function he(t = Date.now() / 1e3, e = k()) {
  try {
    return de(e?.getItem(U), t);
  } catch {
    return [];
  }
}
function me(t, e = k()) {
  try {
    return e?.setItem(U, JSON.stringify(t)), !!e;
  } catch {
    return !1;
  }
}
function Se(t, e = k()) {
  return me(fe(he(t.at, e), t), e);
}
const W = "bitlogin:family-declined:v1", X = (t) => {
  try {
    const e = JSON.parse(t?.getItem(W) ?? "{}");
    return e && typeof e == "object" && !Array.isArray(e) ? e : {};
  } catch {
    return {};
  }
};
function $e(t, e = Date.now() / 1e3, n = k()) {
  if (!b(t)) return !1;
  const s = Math.floor(e), r = Object.fromEntries(Object.entries(X(n)).filter(([o, i]) => b(o) && typeof i == "number" && i > s));
  r[t] = s + p.familyDeclineSec;
  try {
    return n?.setItem(W, JSON.stringify(r)), !!n;
  } catch {
    return !1;
  }
}
function ve(t, e = Date.now() / 1e3, n = k()) {
  const s = X(n)[t];
  return typeof s == "number" && s > e;
}
const u = (t, e = 200) => {
  if (typeof t != "string") return "";
  const n = (r) => r < 32 || r >= 127 && r <= 159 || r >= 8203 && r <= 8207 || r >= 8232 && r <= 8238 || r >= 8288 && r <= 8297 || r === 65279, s = Array.from(t, (r) => n(r.codePointAt(0) ?? 0) ? " " : r).join("").split(" ").filter(Boolean).join(" ");
  return [...s].length > e ? `${[...s].slice(0, e).join("")}…` : s;
}, v = [
  ["name", "Name"],
  ["display_name", "Display name"],
  ["about", "About"],
  ["picture", "Picture"],
  ["banner", "Banner"],
  ["website", "Website"],
  ["nip05", "Verified name (NIP-05)"],
  ["lud16", "Lightning address"],
  ["lud06", "Lightning address (LNURL)"]
], N = (t) => {
  try {
    const e = JSON.parse(t);
    if (e && typeof e == "object" && !Array.isArray(e)) return e;
  } catch {
  }
  return {};
}, J = new Map(v), H = (t, e) => t === "name" || t === "display_name" ? j(e) || u(e, 48) : typeof e == "string" ? u(e) : e == null ? "" : u(JSON.stringify(e), 120);
function we(t, e) {
  const n = (i) => J.get(i) ?? `"${u(i, 40)}"`, s = [...v.map(([i]) => i), ...[.../* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)])].filter((i) => !J.has(i)).sort()], r = [];
  let o = 0;
  for (const i of s) {
    const l = H(i, e[i]), c = H(i, t[i]);
    !l && !c || (l === c && JSON.stringify(e[i]) === JSON.stringify(t[i]) ? o += 1 : l ? c ? r.push(`${n(i)}: ${c}. It was: ${l}`) : r.push(`${n(i)}, removed. It was: ${l}`) : r.push(`${n(i)}, added: ${c}`));
  }
  return r.length === 0 && r.push("Nothing would change: it says what your profile says now."), o > 0 && r.push(`${o} other ${o === 1 ? "field stays" : "fields stay"} as ${o === 1 ? "it is" : "they are"}.`), {
    title: "Change your Nostr profile?",
    warning: "This is what would change, everywhere you use this account. A lightning address is where people send you money: if it is changing, check it.",
    lines: r
  };
}
function Ne(t, e) {
  if (t.kind === 0 && typeof e == "string") return we(N(t.content), N(e));
  if (t.kind === 0) {
    const n = N(t.content), s = v.filter(([o]) => u(n[o])).map(([o, i]) => `${i}: ${o === "name" || o === "display_name" ? j(n[o]) || u(n[o], 48) : u(n[o])}`), r = Object.keys(n).filter((o) => !v.some(([i]) => i === o));
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
  const n = () => t.inClient ? ue(window) : Array.from({ length: e.frames.length }, (i, l) => e.frames[l]), s = location.origin, r = crypto.getRandomValues(new Uint8Array(12)), o = Array.from(r, (i) => i.toString(16).padStart(2, "0")).join("");
  return new Promise((i) => {
    let l = null, c = !1, h = null;
    const C = () => {
      if (!l)
        try {
          for (const w of n()) w.postMessage($({ t: "hello", nonce: o }), s);
        } catch {
        }
    }, F = setInterval(C, 350), x = setTimeout(() => {
      clearInterval(F), c || (c = !0, window.removeEventListener("message", A), i(null));
    }, t.timeoutMs ?? 6e3), A = (w) => {
      if (w.origin !== s || !w.source || w.source === window) return;
      const a = ne(w.data);
      if (!a || a.nonce !== o) return;
      if (a.t === "done" && l && w.source === l) return void h?.(a.ok);
      if (a.t !== "frame" || l || t.world && a.world !== t.world) return;
      l = w.source, clearInterval(F), clearTimeout(x), c = !0;
      const { world: d, recipient: z } = a, f = a.wants && K(d, a.wants) ? a.wants : null, G = a.turnedDown === !0 || !!a.wants && !f, y = f ? [] : a.has ?? [], L = f ? [] : (a.more ?? []).filter((m) => !y.includes(m)), g = f || L.length || y.length ? "" : ie(d);
      i({
        site: d,
        wants: f,
        known: V(d) !== null,
        family: g,
        knownFamily: g ? Y(g) : !1,
        turnedDown: G,
        more: L,
        has: y,
        local: !!f && se(d) && [...f.sign, ...f.read].some((m) => re.includes(m)),
        ask: a.ask ?? null,
        askedAs: a.ask ? a.pubkey ?? null : null,
        async answer(m) {
          const O = new Promise((S) => {
            h = S, setTimeout(() => S(!1), 8e3);
          });
          l.postMessage($({ t: "answer", nonce: o, world: d, ...m ?? {} }), s);
          const E = await O;
          return window.removeEventListener("message", A), E;
        },
        hold(m) {
          l.postMessage($({ t: "held", nonce: o, world: d, receipts: m }), s);
        },
        async grant(m, O, E, S, q) {
          const R = S === !0 && E === !0 && !!g, Q = await m.exportHandoff(z, f ? { site: d, permissions: f } : void 0, d, E === !0, R ? g : void 0, R ? void 0 : q === !0 && L.length ? [...y, ...L] : y.length ? y : void 0), Z = new Promise((T) => {
            h = T, setTimeout(() => T(!1), 8e3);
          });
          l.postMessage($({ t: "grant", nonce: o, world: d, sealed: Q, ...O ? { name: O } : {} }), s);
          const ee = await Z;
          return window.removeEventListener("message", A), ee;
        }
      });
    };
    window.addEventListener("message", A), C();
  });
}
export {
  le as PANEL_CLIENTS,
  je as SIGN_LIMITS,
  Me as applyChange,
  Je as askLockDevice,
  $e as declineFamily,
  Ee as describeAllowed,
  Ne as describeAsked,
  _e as describePermissions,
  ve as familyDeclined,
  oe as familyDomain,
  ie as familyOf,
  Le as familyOffer,
  Ie as findEmbeddedSigner,
  I as inFamily,
  Ce as keepersOf,
  V as knownAppName,
  Y as knownFamily,
  he as loadAllowed,
  be as panelClientAllowed,
  Ae as panelMessage,
  Fe as readOwnerList,
  ke as readPanelControl,
  ae as readPanelHello,
  Se as recordAllowed,
  Oe as removeAllowed,
  Re as resolveOwnerList,
  me as saveAllowed,
  Te as scopeOf
};
