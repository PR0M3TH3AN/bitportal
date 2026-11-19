const f = "nswp-signer", g = "nswp-handoff";
const i = {
  /** The longest a note's content may be, in characters. */
  contentChars: 8e3,
  tags: 60,
  tagItems: 8,
  tagChars: 400,
  /** How long a site stays allowed, in seconds: thirty days from Allow, unless the user signs out of it sooner. */
  grantSec: 2592e3,
  /** No more than this many signatures for one site in `perMs`. */
  burst: 6,
  perMs: 6e4,
  /** And no more than this many in an hour. */
  hourly: 60
}, d = [1, 7], y = [4, 13, 14, 15, 1059, 1060, 13194, 22242, 23194, 23195, 24133, 27235, 27300, 27301, 30078];
function h(n) {
  return typeof n != "number" || !Number.isInteger(n) || n < 0 || n > 65535 || y.includes(n) ? "never" : d.includes(n) ? "ordinary" : "careful";
}
const a = "nswp:world";
function l(n) {
  if (typeof n != "string" || n.length > 300) return "";
  try {
    const e = new URL(n);
    return (e.protocol === "https:" || e.protocol === "http:") && e.origin !== "null" ? e.origin : "";
  } catch {
    return "";
  }
}
function O(n) {
  if (typeof n != "string") return "";
  let e = "";
  for (const o of n.slice(0, 400).normalize("NFC")) {
    const t = o.codePointAt(0), r = t <= 31 || t >= 127 && t <= 159 || t >= 8203 && t <= 8207 || t >= 8232 && t <= 8239 || t >= 8288 && t <= 8303 || t === 65279;
    e += r ? " " : o;
  }
  return [...e.replace(/\s+/gu, " ").trim()].slice(0, 48).join("").trim();
}
function I(n, e, o) {
  const t = l(e);
  if (!t || !n || typeof n != "object") return null;
  const r = n;
  if (h(r.kind) !== "ordinary" || typeof r.content != "string" || [...r.content].length > i.contentChars || !Array.isArray(r.tags) || r.tags.length > i.tags) return null;
  const c = [];
  for (const s of r.tags) {
    if (!Array.isArray(s) || s.length === 0 || s.length > i.tagItems || !s.every((u) => typeof u == "string" && u.length <= i.tagChars)) return null;
    s[0] !== a && c.push([...s]);
  }
  return c.push([a, t]), { kind: r.kind, created_at: Math.floor(o), tags: c, content: r.content };
}
function b(n = i, e = []) {
  let o = e.filter((t) => typeof t == "number" && Number.isFinite(t));
  return {
    times: () => [...o],
    take(t) {
      return o = o.filter((r) => t - r < 36e5), o.length >= n.hourly || o.filter((r) => t - r < n.perMs).length >= n.burst ? !1 : (o.push(t), !0);
    }
  };
}
const p = /^[0-9a-z-]{1,40}$/iu, R = /^[0-9a-f]{64}$/u, N = (n) => ({ nswp: f, v: 1, ...n });
function S(n) {
  if (!n || typeof n != "object") return null;
  const e = n;
  return e.nswp !== f || e.v !== 1 || typeof e.id != "string" || !p.test(e.id) ? null : e.t === "state" ? { t: "state", id: e.id } : e.t === "lock" ? { t: "lock", id: e.id } : e.t === "sign" && e.event && typeof e.event == "object" ? { t: "sign", id: e.id, event: e.event } : null;
}
const m = (n) => ({ nswp: g, v: 1, ...n });
function w(n) {
  if (!n || typeof n != "object") return null;
  const e = n;
  if (e.nswp !== g || e.v !== 1 || typeof e.nonce != "string" || !p.test(e.nonce)) return null;
  const o = (t) => typeof t == "string" && R.test(t);
  if (e.t === "hello") return { t: "hello", nonce: e.nonce };
  if (e.t === "frame" && l(e.world) && o(e.recipient)) return { t: "frame", nonce: e.nonce, world: l(e.world), recipient: e.recipient };
  if (e.t === "grant" && l(e.world) && e.sealed && typeof e.sealed == "object") {
    const t = e.sealed;
    if (!o(t.senderPublicKey) || typeof t.payload != "string" || t.payload.length > 4e3) return null;
    const r = O(e.name);
    return { t: "grant", nonce: e.nonce, world: l(e.world), sealed: { senderPublicKey: t.senderPublicKey, payload: t.payload }, ...r ? { name: r } : {} };
  }
  return e.t === "done" && typeof e.ok == "boolean" ? { t: "done", nonce: e.nonce, ok: e.ok } : null;
}
export {
  i as S,
  b as a,
  w as b,
  l as c,
  m as h,
  I as p,
  S as r,
  N as s
};
