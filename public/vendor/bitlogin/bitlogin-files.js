import { c as S, R as H, D as b, a as B, b as U } from "./bitlogin-shared-PwbHDYud.js";
import { d as V, s as K } from "./bitlogin-shared-PwbHDYud.js";
class l extends Error {
  constructor(n, o, t = "") {
    super(o), this.code = n, this.reason = t, this.name = "BlossomError";
  }
}
const L = (e) => Array.from(e, (n) => n.toString(16).padStart(2, "0")).join(""), M = (e) => Uint8Array.from(e.match(/.{2}/gu) ?? [], (n) => Number.parseInt(n, 16)), d = (e) => e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength);
async function E(e) {
  return L(new Uint8Array(await crypto.subtle.digest("SHA-256", d(e))));
}
async function X(e) {
  const n = crypto.getRandomValues(new Uint8Array(32)), o = crypto.getRandomValues(new Uint8Array(12)), t = await crypto.subtle.importKey("raw", d(n), "AES-GCM", !1, ["encrypt"]), s = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: d(o) }, t, d(e))), h = new Uint8Array(12 + s.length);
  return h.set(o, 0), h.set(s, 12), { sealed: h, key: L(n) };
}
async function x(e, n) {
  if (e.length < 28 || !/^[0-9a-f]{64}$/u.test(n)) throw new l("mismatch", "That file can't be opened: it is not what was saved.");
  const o = await crypto.subtle.importKey("raw", d(M(n)), "AES-GCM", !1, ["decrypt"]);
  try {
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: d(e.slice(0, 12)) }, o, d(e.slice(12))));
  } catch {
    throw new l("mismatch", "That file can't be opened: what the server holds is not what was saved.");
  }
}
const u = (e) => (e.headers.get("X-Reason") ?? "").slice(0, 200), T = (e) => ({ Authorization: `Nostr ${e}` });
async function g(e, n) {
  try {
    return await fetch(e, { ...n, cache: "no-store", credentials: "omit", redirect: "follow", referrerPolicy: "no-referrer" });
  } catch {
    throw new l("network", "The file server couldn't be reached.");
  }
}
async function z(e, n, o) {
  let t;
  try {
    t = await g(`${e}/upload`, {
      method: "HEAD",
      headers: { "X-SHA-256": n.sha256, "X-Content-Length": String(n.size), "X-Content-Type": n.type, ...T(await o("upload", e, n.sha256)) }
    });
  } catch {
    return { state: "unreachable", reason: "" };
  }
  const s = u(t);
  return t.ok ? { state: "free", reason: s } : t.status === 402 ? { state: "paid", reason: s, ...$(t) ? { invoice: $(t) } : {} } : t.status === 413 ? { state: "too-large", reason: s } : t.status === 415 ? { state: "media-only", reason: s } : t.status === 401 || t.status === 403 ? { state: "closed", reason: s } : { state: "unknown", reason: s };
}
function $(e) {
  const n = (e.headers.get("X-Lightning") ?? "").trim().toLowerCase();
  return n.length <= 2e3 && /^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(n) ? n : "";
}
async function D(e, n, o, t, s, h) {
  const m = async (p) => g(`${e}/upload`, {
    method: "PUT",
    headers: { "Content-Type": o, "X-SHA-256": t, ...T(await s("upload", e, t)), ...p ? { "X-Lightning": p } : {} },
    body: d(n)
  });
  let i = await m();
  if (i.status === 402) {
    const p = $(i);
    if (!p) throw new l("payment", "That server wants paying in a way BitLogin can't read here. Choose another server.", u(i));
    const a = h ? await h(p) : null;
    if (!a) throw new l("payment", "That server wants paying first, and it wasn't paid. Nothing was uploaded.", u(i));
    i = await m(a);
  }
  if (i.status === 413) throw new l("too-large", "That file is larger than the server takes.", u(i));
  if (i.status === 415) throw new l("kind", "That server takes only some kinds of file, often pictures and video. A private file is sealed, so a server can't see what kind it is: it needs a server that takes any file.", u(i));
  if (i.status === 429) throw new l("quota", "That server won't take more from you just now: a limit was reached.", u(i));
  if (i.status === 402) throw new l("payment", "The server did not accept the payment.", u(i));
  if (!i.ok) throw new l("refused", "The server would not take the file.", u(i));
  let y;
  try {
    y = await i.json();
  } catch {
    throw new l("mismatch", "The server's answer could not be read.");
  }
  if (y.sha256 !== t) throw new l("mismatch", "The server stored something other than what was sent.");
  return { url: typeof y.url == "string" && y.url.startsWith(`${e}/`) ? y.url : `${e}/${t}` };
}
async function G(e, n, o) {
  let t = await g(`${e}/${n}`, { method: "GET" });
  if ((t.status === 401 || t.status === 403) && o && (t = await g(`${e}/${n}`, { method: "GET", headers: T(await o("get", e, n)) })), t.status === 404) throw new l("not-found", "That server no longer has the file.");
  if (t.status === 402) throw new l("payment", "That server wants paying to hand the file back.", u(t));
  if (!t.ok) throw new l("refused", "The server would not hand the file over.", u(t));
  const s = new Uint8Array(await t.arrayBuffer());
  if (await E(s) !== n) throw new l("mismatch", "The server handed back something other than the file.");
  return s;
}
async function N(e, n, o) {
  try {
    const t = await g(`${e}/${n}`, { method: "DELETE", headers: T(await o("delete", e, n)) });
    return t.ok || t.status === 404;
  } catch {
    return !1;
  }
}
function q(e, n = {}) {
  let o = { folders: [], settings: { autoPaySats: 0 }, offline: !1, unsaved: !1 }, t = S([]), s = [], h = !1, m = [];
  const i = async () => {
    const a = t.takeChanges();
    a.save.length === 0 && a.remove.length === 0 || (o = await e.save({ save: a.save, remove: a.remove }));
  }, y = (a) => async (r) => {
    const c = await n.payer?.quote(r).catch(() => null);
    return !c || !(c.sats <= o.settings.autoPaySats) && !await n.confirmPay?.(c.sats, a) ? null : c.pay();
  }, p = async (a) => {
    await Promise.all(a.flatMap((r) => r.servers.map((c) => N(c, r.sha256, e.auth))));
  };
  return {
    /**
     * Read the folders. The account's own server list is read by `loadServers`, which a page may ask for behind them;
     * the servers people use by `rank`, where one is chosen.
     */
    async open(a = {}) {
      return o = await e.load(), t = S(o.folders), a.servers !== !1 && await this.loadServers(), o;
    },
    /** The account's own server list. Until it is read, nothing is uploaded. */
    async loadServers() {
      try {
        s = (await e.servers()).mine, h = !0;
      } catch {
      }
      return s;
    },
    /** The account's own server list was read, so it may be changed. */
    serversRead: () => h,
    /** What the browser holds, shown at once while `open` reads relays. Nothing is written from it. */
    async peek() {
      return e.peek ? (o = await e.peek(), t = S(o.folders), o) : null;
    },
    /** The servers people use, for the screen where a server is chosen. */
    async rank() {
      return m = (await e.servers(!0).catch(() => ({ mine: s, ranked: [] }))).ranked, m.filter((r) => !s.includes(r.server));
    },
    state: () => o,
    drive: () => t,
    servers: () => [...s],
    ranked: () => m.filter((a) => !s.includes(a.server)),
    /** Whether a server would take a file from this account, and whether it wants paying: asked with a small pretend file. */
    async check(a) {
      const r = U(a);
      return r ? z(r, { sha256: await E(new TextEncoder().encode(`bitlogin-check:${r}`)), size: 1024, type: "application/octet-stream" }, e.auth) : { state: "unreachable", reason: "" };
    },
    /** Use these servers, most trusted first: published as the account's server list (BUD-03). */
    async setServers(a) {
      const r = [...new Set(a.map(U).filter(Boolean))].slice(0, B.servers);
      if (r.length === 0) throw new b("Choose at least one file server.");
      if (!h) throw new b("Your server list couldn't be read from your relays, so it can't be changed now. Try again when they answer.");
      return s = await e.setServers(r), s;
    },
    async setAutoPay(a) {
      o = await e.save({ settings: { autoPaySats: a } });
    },
    /** Save a file into a folder: sealed first if private, uploaded to the first server, and to a second where there is one. */
    async put(a, r, c) {
      if (s.length === 0) throw new b("Choose a file server first.");
      if (r.bytes.length > B.fileBytes) throw new b("That file is larger than 50 MB, which is the most this can save.");
      t.folder(a);
      const w = c.private ? await X(r.bytes) : null, f = w ? w.sealed : r.bytes, F = await E(f), P = w ? "application/octet-stream" : r.type || "application/octet-stream", v = [];
      let A = null;
      for (const k of s) {
        if (v.length >= 2) break;
        try {
          await D(k, f, P, F, e.auth, y(k)), v.push(k);
        } catch (C) {
          if (A = C, v.length === 0 && k === s[s.length - 1]) throw C;
        }
      }
      if (v.length === 0) throw A instanceof Error ? A : new l("refused", "No server would take the file.");
      const R = t.addFile(a, { name: r.name, sha256: F, size: f.length, type: r.type || "application/octet-stream", servers: v, ...w ? { key: w.key } : {} });
      return await i(), R;
    },
    /** A file's bytes, as its owner saved them: fetched from whichever of its servers still has it, checked, and opened. */
    async get(a) {
      const { file: r } = t.find(a);
      let c = null;
      for (const w of r.servers)
        try {
          const f = await G(w, r.sha256, e.auth);
          return { name: r.name, type: r.type, bytes: r.key ? await x(f, r.key) : f };
        } catch (f) {
          c = f;
        }
      throw c instanceof Error ? c : new l("not-found", "No server has that file any more.");
    },
    /** Where anyone can fetch a public file. Null for a private one: its bytes mean nothing without its key. */
    link(a) {
      const { file: r } = t.find(a);
      return r.key ? null : `${r.servers[0]}/${r.sha256}`;
    },
    async newFolder(a, r) {
      const c = t.createFolder(a, r);
      return await i(), c;
    },
    async worldFolder(a) {
      const r = t.worldFolder(a);
      return await i(), r;
    },
    async rename(a, r) {
      "file" in a ? t.renameFile(a.file, r) : t.renameFolder(a.folder, r), await i();
    },
    async move(a, r) {
      "file" in a ? t.moveFile(a.file, r) : t.moveFolder(a.folder, r), await i();
    },
    async copy(a, r) {
      const c = t.copyFile(a, r);
      return await i(), c;
    },
    /** Remove a file or a folder. The index first, so it is gone for the person; then the bytes, from their servers. */
    async remove(a) {
      const r = "file" in a ? [t.deleteFile(a.file)].filter((c) => !!c) : t.deleteFolder(a.folder);
      await i(), await p(r);
    },
    usage: () => t.usage(),
    ROOT: H
  };
}
export {
  l as BlossomError,
  B as DRIVE_LIMITS,
  b as DriveError,
  H as ROOT,
  V as cleanFileName,
  U as cleanServer,
  q as createFiles,
  K as sizeWords
};
