import { y as C, A as H, a7 as O, a8 as se, Q as D, a6 as Y, a9 as M, z as re, V as x, aa as R, a0 as oe, a5 as S, ab as ie, ac as ae } from "./bitlogin-shared-BkXi7a9G.js";
import { I as je, ad as Ce, ae as Re, af as Fe, ag as Te, ah as Be, ai as Je } from "./bitlogin-shared-BkXi7a9G.js";
import { f as le } from "./bitlogin-shared-BE8A8fPq.js";
import { P as He, a as Ue, d as Ke, n as We, b as Ye, p as xe } from "./bitlogin-shared-CBcVjlY7.js";
import { r as Ge } from "./bitlogin-shared-CjWz8W3w.js";
import { a as Xe } from "./bitlogin-shared-D6Hzbnis.js";
const F = "bitlogin-panel", T = 1, ue = ["https://portal.bitblocks.network"];
function ke(t, e) {
  const n = C(t);
  return n ? H(e) ? H(n) : ue.includes(n) : !1;
}
function ve(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.bitlogin !== F || e.v !== T) return null;
  if (e.t === "hide") return { t: "hide" };
  if (e.t !== "show") return null;
  const n = ce({ ...e, t: "hello" });
  if (!n) return null;
  const { t: r, ...s } = n;
  return { t: "show", ...s };
}
function Le(t) {
  return { bitlogin: F, v: T, ...t };
}
function ce(t) {
  if (!t || typeof t != "object") return null;
  const e = t;
  if (e.bitlogin !== F || e.v !== T || e.t !== "hello") return null;
  const n = e.mode === void 0 ? e.world === void 0 ? "account" : "ask" : e.mode;
  if (n !== "ask" && n !== "switch" && n !== "account" && n !== "files" && n !== "wallet" && n !== "library" && n !== "secure") return null;
  let r;
  return e.world !== void 0 && (r = C(e.world), !r) || (n === "ask" || n === "switch") && !r ? null : { t: "hello", mode: n, ...r ? { world: r } : {} };
}
function de(t) {
  const e = [];
  try {
    const n = t.parent;
    for (let r = 0; r < n.frames.length; r++) {
      const s = n.frames[r];
      if (s !== t) {
        e.push(s);
        for (let o = 0; o < s.frames.length; o++) e.push(s.frames[o]);
      }
    }
  } catch {
  }
  return e;
}
const z = "bitlogin:allowed-sites:v1", v = {
  /** No more entries than this are kept: the oldest go first. */
  entries: 200,
  /** How long an entry is kept after it has ended, in seconds. */
  keepEndedSec: 720 * 3600,
  /** After "Just this one", a family is not offered again for this long, in seconds (docs/site-family.md SF4). */
  familyDeclineSec: 720 * 3600,
  /** No more sites than this are listed under a family. */
  members: 20
}, fe = /^[0-9a-f]{64}$/u, he = /^[0-9a-f]{32}$/u, U = (t, e) => t.site === e.site && t.pubkey === e.pubkey && (t.device ?? "") === (e.device ?? "");
function j(t) {
  if (!t || typeof t != "object") return null;
  const e = t, n = O(e.site), r = n || (typeof e.site == "string" && e.site.includes("*") ? "" : C(e.site));
  if (!r || r !== e.site || typeof e.pubkey != "string" || !fe.test(e.pubkey) || typeof e.at != "number" || typeof e.until != "number" || !Number.isFinite(e.at) || !Number.isFinite(e.until) || e.until < e.at) return null;
  const s = e.wants === void 0 ? void 0 : re(e.wants);
  if (n && e.wants !== void 0) return null;
  const o = s === null || s !== void 0 && !x(r, s), i = e.wants?.appData, a = o && Array.isArray(i) ? i.filter((w) => typeof w == "string").map((w) => R(w)).filter(Boolean).slice(0, 8) : [], c = n && Array.isArray(e.members) ? [...new Set(e.members.filter((w) => M(w, n)))].slice(0, v.members) : [], m = typeof e.device == "string" && he.test(e.device) ? e.device : void 0;
  if (e.device !== void 0 && !m) return null;
  const L = m && typeof e.deviceLabel == "string" && e.deviceLabel.length <= 48 && /^[\p{L}\p{N} ._()-]+$/u.test(e.deviceLabel) ? e.deviceLabel : void 0;
  return { site: r, ...c.length ? { members: c } : {}, pubkey: e.pubkey, at: Math.floor(e.at), until: Math.floor(e.until), remembered: e.remembered === !0, ...s && !o ? { wants: s } : {}, ...o ? { refused: !0, ...a.length ? { hadNames: a } : {} } : {}, ...m ? { device: m, ...L ? { deviceLabel: L } : {} } : {} };
}
function me(t, e) {
  if (!t) return [];
  let n;
  try {
    n = JSON.parse(t);
  } catch {
    return [];
  }
  return Array.isArray(n) ? n.slice(0, v.entries * 2).map(j).filter((r) => r !== null && r.until + v.keepEndedSec > e).sort((r, s) => s.at - r.at).slice(0, v.entries) : [];
}
function we(t, e) {
  const n = j(e);
  if (!n) return [...t];
  const r = t.find((o) => U(o, n));
  return [O(n.site) && r?.members ? j({ ...n, members: [...n.members ?? [], ...r.members] }) ?? n : n, ...t.filter((o) => !U(o, n))].slice(0, v.entries);
}
function Ee(t, e, n, r) {
  return !O(n) || !M(e, n) ? null : t.find((s) => s.pubkey === r && s.remembered && !s.device && s.site !== e && M(s.site, n)) ?? null;
}
function Se(t, e, n, r) {
  return t.filter((s) => !(s.site === e && s.pubkey === n && (s.device ?? "") === (r ?? "")));
}
function Oe(t, e) {
  const n = t.refused === !0 || t.until <= e, r = se(t.site) || null;
  return {
    known: r ? D(t.site) ? `every site at ${r}` : null : Y(t.site),
    family: r,
    ended: n,
    lasts: t.refused ? "Ended by BitLogin: it had been allowed to write or read data under names no site may now have, such as BitLogin's own records or every application's. If you use it, it will ask you again." : n ? "Ended." : t.remembered ? "Remembered on this device until then, unless you sign out there sooner." : "For one visit: it ended when that site's page was closed or loaded again, and by then at the latest."
  };
}
const $ = () => {
  try {
    return typeof localStorage > "u" ? null : localStorage;
  } catch {
    return null;
  }
};
function ye(t = Date.now() / 1e3, e = $()) {
  try {
    return me(e?.getItem(z), t);
  } catch {
    return [];
  }
}
function pe(t, e = $()) {
  try {
    return e?.setItem(z, JSON.stringify(t)), !!e;
  } catch {
    return !1;
  }
}
function $e(t, e = $()) {
  return pe(we(ye(t.at, e), t), e);
}
const G = "bitlogin:family-declined:v1", Q = (t) => {
  try {
    const e = JSON.parse(t?.getItem(G) ?? "{}");
    return e && typeof e == "object" && !Array.isArray(e) ? e : {};
  } catch {
    return {};
  }
};
function Ie(t, e = Date.now() / 1e3, n = $()) {
  if (!O(t)) return !1;
  const r = Math.floor(e), s = Object.fromEntries(Object.entries(Q(n)).filter(([o, i]) => O(o) && typeof i == "number" && i > r));
  s[t] = r + v.familyDeclineSec;
  try {
    return n?.setItem(G, JSON.stringify(s)), !!n;
  } catch {
    return !1;
  }
}
function Ne(t, e = Date.now() / 1e3, n = $()) {
  const r = Q(n)[t];
  return typeof r == "number" && r > e;
}
const u = (t, e = 200) => {
  if (typeof t != "string") return "";
  const n = (s) => s < 32 || s >= 127 && s <= 159 || s >= 8203 && s <= 8207 || s >= 8232 && s <= 8238 || s >= 8288 && s <= 8297 || s === 65279, r = Array.from(t, (s) => n(s.codePointAt(0) ?? 0) ? " " : s).join("").split(" ").filter(Boolean).join(" ");
  return [...r].length > e ? `${[...r].slice(0, e).join("")}…` : r;
}, P = [
  ["name", "Name"],
  ["display_name", "Display name"],
  ["about", "About"],
  ["picture", "Picture"],
  ["banner", "Banner"],
  ["website", "Website"],
  ["nip05", "Verified name (NIP-05)"],
  ["lud16", "Lightning address"],
  ["lud06", "Lightning address (LNURL)"]
], _ = (t) => {
  try {
    const e = JSON.parse(t);
    if (e && typeof e == "object" && !Array.isArray(e)) return e;
  } catch {
  }
  return {};
}, K = new Map(P), W = (t, e) => t === "name" || t === "display_name" ? R(e) || u(e, 48) : typeof e == "string" ? u(e) : e == null ? "" : u(JSON.stringify(e), 120);
function ge(t, e) {
  const n = (i) => K.get(i) ?? `"${u(i, 40)}"`, r = [...P.map(([i]) => i), ...[.../* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)])].filter((i) => !K.has(i)).sort()], s = [];
  let o = 0;
  for (const i of r) {
    const a = W(i, e[i]), c = W(i, t[i]);
    !a && !c || (a === c && JSON.stringify(e[i]) === JSON.stringify(t[i]) ? o += 1 : a ? c ? s.push(`${n(i)}: ${c}. It was: ${a}`) : s.push(`${n(i)}, removed. It was: ${a}`) : s.push(`${n(i)}, added: ${c}`));
  }
  return s.length === 0 && s.push("Nothing would change: it says what your profile says now."), o > 0 && s.push(`${o} other ${o === 1 ? "field stays" : "fields stay"} as ${o === 1 ? "it is" : "they are"}.`), {
    title: "Change your Nostr profile?",
    warning: "This is what would change, everywhere you use this account. A lightning address is where people send you money: if it is changing, check it.",
    lines: s
  };
}
function De(t, e) {
  if (t.kind === 0 && typeof e == "string") return ge(_(t.content), _(e));
  if (t.kind === 0) {
    const n = _(t.content), r = P.filter(([o]) => u(n[o])).map(([o, i]) => `${i}: ${o === "name" || o === "display_name" ? R(n[o]) || u(n[o], 48) : u(n[o])}`), s = Object.keys(n).filter((o) => !P.some(([i]) => i === o));
    return s.length && r.push(`And ${s.length} other ${s.length === 1 ? "field" : "fields"}: ${u(s.join(", "), 120)}`), r.length === 0 && r.push("An empty profile: no name, no picture, nothing about you."), e === null && r.push("Your profile as it is now couldn't be read, so this is the whole new one, not only what changes."), {
      title: "Replace your Nostr profile?",
      warning: "This replaces your whole profile, everywhere you use this account. Anything not listed here is removed from it. A lightning address is where people send you money: check it.",
      lines: r
    };
  }
  if (t.kind === 5) {
    const n = t.tags.filter((o) => o[0] === "e" && o[1]).map((o) => `Note ${u(o[1], 64)}`), r = t.tags.filter((o) => o[0] === "a" && o[1]).map((o) => `Item ${u(o[1], 120)}`), s = [...n, ...r].slice(0, 12);
    return n.length + r.length > 12 && s.push(`And ${n.length + r.length - 12} more.`), s.length === 0 && s.push("It names nothing to delete."), u(t.content) && s.push(`Reason given: ${u(t.content)}`), {
      title: `Ask relays to delete ${n.length + r.length === 1 ? "this" : `these ${n.length + r.length} things`}?`,
      warning: "A deletion can't be undone. Relays that honour it remove what is named, anywhere it was posted from, not only what you posted in this world. Some relays, and anyone who already has a copy, keep it.",
      lines: s
    };
  }
  if (t.kind === 10002) {
    const n = t.tags.filter((s) => s[0] === "r" && s[1]), r = n.slice(0, 20).map((s) => `${u(s[1], 120)}${s[2] === "read" ? " (read only)" : s[2] === "write" ? " (write only)" : ""}`);
    return n.length > 20 && r.push(`And ${n.length - 20} more.`), r.length === 0 && r.push("An empty list: no relays at all."), {
      title: "Replace the list of relays you use?",
      warning: "This replaces your whole relay list. Other apps look there to find your notes and to reach you, and BitLogin looks there when you take a site back. A list of relays you don't know could hide you, or what you do, from the people who follow you.",
      lines: r
    };
  }
  return { title: "Sign this?", warning: "BitLogin can't say what this does.", lines: [`Kind ${t.kind}`] };
}
function Pe(t = {}) {
  if (typeof window > "u") return Promise.resolve(null);
  const e = t.inClient ? null : window.opener;
  if (t.inClient ? window.parent === window : !e) return Promise.resolve(null);
  const n = () => t.inClient ? de(window) : Array.from({ length: e.frames.length }, (i, a) => e.frames[a]), r = location.origin, s = crypto.getRandomValues(new Uint8Array(12)), o = Array.from(s, (i) => i.toString(16).padStart(2, "0")).join("");
  return new Promise((i) => {
    let a = null, c = !1, m = null;
    const L = () => {
      if (!a)
        try {
          for (const y of n()) y.postMessage(S({ t: "hello", nonce: o }), r);
        } catch {
        }
    }, w = setInterval(L, 350), X = setTimeout(() => {
      clearInterval(w), c || (c = !0, window.removeEventListener("message", E), i(null));
    }, t.timeoutMs ?? 6e3), E = (y) => {
      if (y.origin !== r || !y.source || y.source === window) return;
      const l = oe(y.data);
      if (!l || l.nonce !== o) return;
      if (l.t === "done" && a && y.source === a) return void m?.(l.ok);
      if (l.t !== "frame" || a || t.world && l.world !== t.world) return;
      a = y.source, clearInterval(w), clearTimeout(X), c = !0;
      const { world: d, recipient: B } = l, h = l.wants && x(d, l.wants) ? l.wants : null, q = l.turnedDown === !0 || !!l.wants && !h, b = h ? [] : l.has ?? [], I = h ? [] : (l.more ?? []).filter((f) => !b.includes(f)), N = le(d), p = h ? l.family === !0 && N && D(N) ? N : "" : I.length || b.length ? "" : N;
      i({
        site: d,
        wants: h,
        known: Y(d) !== null,
        family: p,
        knownFamily: p ? D(p) : !1,
        // Worked out again on this page: its own family, by the browser's address for it, and one BitLogin knows.
        familyAsked: l.family === !0 && !!p && D(p),
        turnedDown: q,
        more: I,
        has: b,
        local: !!h && ie(d) && [...h.sign, ...h.read].some((f) => ae.includes(f)),
        ask: l.ask ?? null,
        askedAs: l.ask ? l.pubkey ?? null : null,
        async answer(f) {
          const A = new Promise((g) => {
            m = g, setTimeout(() => g(!1), 8e3);
          });
          a.postMessage(S({ t: "answer", nonce: o, world: d, ...f ?? {} }), r);
          const k = await A;
          return window.removeEventListener("message", E), k;
        },
        recipient: B,
        async passOn(f) {
          const A = new Promise((g) => {
            m = g, setTimeout(() => g(!1), 8e3);
          });
          a.postMessage(S({ t: "grant", nonce: o, world: d, sealed: f }), r);
          const k = await A;
          return window.removeEventListener("message", E), k;
        },
        hold(f) {
          a.postMessage(S({ t: "held", nonce: o, world: d, receipts: f }), r);
        },
        async grant(f, A, k, g, Z) {
          const J = g === !0 && k === !0 && !!p, ee = await f.exportHandoff(B, h ? { site: d, permissions: h } : void 0, d, k === !0, J ? p : void 0, J ? void 0 : Z === !0 && I.length ? [...b, ...I] : b.length ? b : void 0), te = new Promise((V) => {
            m = V, setTimeout(() => V(!1), 8e3);
          });
          a.postMessage(S({ t: "grant", nonce: o, world: d, sealed: ee, ...A ? { name: A } : {} }), r);
          const ne = await te;
          return window.removeEventListener("message", E), ne;
        }
      });
    };
    window.addEventListener("message", E), L();
  });
}
export {
  He as PAIRING_PAUSED,
  ue as PANEL_CLIENTS,
  Ue as PAUSED_WORDS,
  je as SIGN_LIMITS,
  Ce as applyChange,
  Xe as askLockDevice,
  Ie as declineFamily,
  Oe as describeAllowed,
  De as describeAsked,
  Re as describePermissions,
  Ke as deviceLabel,
  Ne as familyDeclined,
  se as familyDomain,
  le as familyOf,
  Ee as familyOffer,
  Pe as findEmbeddedSigner,
  M as inFamily,
  Fe as keepersOf,
  Y as knownAppName,
  D as knownFamily,
  ye as loadAllowed,
  We as normalizeCode,
  Ye as numberChoices,
  xe as pairUrl,
  ke as panelClientAllowed,
  Le as panelMessage,
  Te as readOwnerList,
  ve as readPanelControl,
  ce as readPanelHello,
  $e as recordAllowed,
  Se as removeAllowed,
  Ge as renderQrSvg,
  Be as resolveOwnerList,
  pe as saveAllowed,
  Je as scopeOf
};
