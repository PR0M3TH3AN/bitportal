import { c as F, R as H, D as T, a as C, b as B } from "./bitlogin-shared-PwbHDYud.js";
import { d as j, s as V } from "./bitlogin-shared-PwbHDYud.js";
class l extends Error {
  constructor(r, o, t = "") {
    super(o), this.code = r, this.reason = t, this.name = "BlossomError";
  }
}
const U = (e) => Array.from(e, (r) => r.toString(16).padStart(2, "0")).join(""), M = (e) => Uint8Array.from(e.match(/.{2}/gu) ?? [], (r) => Number.parseInt(r, 16)), y = (e) => e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength);
async function A(e) {
  return U(new Uint8Array(await crypto.subtle.digest("SHA-256", y(e))));
}
async function X(e) {
  const r = crypto.getRandomValues(new Uint8Array(32)), o = crypto.getRandomValues(new Uint8Array(12)), t = await crypto.subtle.importKey("raw", y(r), "AES-GCM", !1, ["encrypt"]), s = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: y(o) }, t, y(e))), w = new Uint8Array(12 + s.length);
  return w.set(o, 0), w.set(s, 12), { sealed: w, key: U(r) };
}
async function x(e, r) {
  if (e.length < 28 || !/^[0-9a-f]{64}$/u.test(r)) throw new l("mismatch", "That file can't be opened: it is not what was saved.");
  const o = await crypto.subtle.importKey("raw", y(M(r)), "AES-GCM", !1, ["decrypt"]);
  try {
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: y(e.slice(0, 12)) }, o, y(e.slice(12))));
  } catch {
    throw new l("mismatch", "That file can't be opened: what the server holds is not what was saved.");
  }
}
const u = (e) => (e.headers.get("X-Reason") ?? "").slice(0, 200), k = (e) => ({ Authorization: `Nostr ${e}` });
async function v(e, r) {
  try {
    return await fetch(e, { ...r, cache: "no-store", credentials: "omit", redirect: "follow", referrerPolicy: "no-referrer" });
  } catch {
    throw new l("network", "The file server couldn't be reached.");
  }
}
async function z(e, r, o) {
  let t;
  try {
    t = await v(`${e}/upload`, {
      method: "HEAD",
      headers: { "X-SHA-256": r.sha256, "X-Content-Length": String(r.size), "X-Content-Type": r.type, ...k(await o("upload", e, r.sha256)) }
    });
  } catch {
    return { state: "unreachable", reason: "" };
  }
  const s = u(t);
  return t.ok ? { state: "free", reason: s } : t.status === 402 ? { state: "paid", reason: s, ...E(t) ? { invoice: E(t) } : {} } : t.status === 413 ? { state: "too-large", reason: s } : t.status === 415 ? { state: "media-only", reason: s } : t.status === 401 || t.status === 403 ? { state: "closed", reason: s } : { state: "unknown", reason: s };
}
function E(e) {
  const r = (e.headers.get("X-Lightning") ?? "").trim().toLowerCase();
  return r.length <= 2e3 && /^ln(bc|tb|tbs|bcrt)[0-9a-z]+$/u.test(r) ? r : "";
}
async function D(e, r, o, t, s, w) {
  const h = async (a) => v(`${e}/upload`, {
    method: "PUT",
    headers: { "Content-Type": o, "X-SHA-256": t, ...k(await s("upload", e, t)), ...a ? { "X-Lightning": a } : {} },
    body: y(r)
  });
  let i = await h();
  if (i.status === 402) {
    const a = E(i);
    if (!a) throw new l("payment", "That server wants paying in a way BitLogin can't read here. Choose another server.", u(i));
    const n = w ? await w(a) : null;
    if (!n) throw new l("payment", "That server wants paying first, and it wasn't paid. Nothing was uploaded.", u(i));
    i = await h(n);
  }
  if (i.status === 413) throw new l("too-large", "That file is larger than the server takes.", u(i));
  if (i.status === 415) throw new l("kind", "That server takes only some kinds of file, often pictures and video. A private file is sealed, so a server can't see what kind it is: it needs a server that takes any file.", u(i));
  if (i.status === 429) throw new l("quota", "That server won't take more from you just now: a limit was reached.", u(i));
  if (i.status === 402) throw new l("payment", "The server did not accept the payment.", u(i));
  if (!i.ok) throw new l("refused", "The server would not take the file.", u(i));
  let p;
  try {
    p = await i.json();
  } catch {
    throw new l("mismatch", "The server's answer could not be read.");
  }
  if (p.sha256 !== t) throw new l("mismatch", "The server stored something other than what was sent.");
  return { url: typeof p.url == "string" && p.url.startsWith(`${e}/`) ? p.url : `${e}/${t}` };
}
async function G(e, r, o) {
  let t = await v(`${e}/${r}`, { method: "GET" });
  if ((t.status === 401 || t.status === 403) && o && (t = await v(`${e}/${r}`, { method: "GET", headers: k(await o("get", e, r)) })), t.status === 404) throw new l("not-found", "That server no longer has the file.");
  if (t.status === 402) throw new l("payment", "That server wants paying to hand the file back.", u(t));
  if (!t.ok) throw new l("refused", "The server would not hand the file over.", u(t));
  const s = new Uint8Array(await t.arrayBuffer());
  if (await A(s) !== r) throw new l("mismatch", "The server handed back something other than the file.");
  return s;
}
async function N(e, r, o) {
  try {
    const t = await v(`${e}/${r}`, { method: "DELETE", headers: k(await o("delete", e, r)) });
    return t.ok || t.status === 404;
  } catch {
    return !1;
  }
}
function O(e, r = {}) {
  let o = { folders: [], settings: { autoPaySats: 0 }, offline: !1, unsaved: !1 }, t = F([]), s = [], w = [];
  const h = async () => {
    const a = t.takeChanges();
    a.save.length === 0 && a.remove.length === 0 || (o = await e.save({ save: a.save, remove: a.remove }));
  }, i = (a) => async (n) => {
    const c = await r.payer?.quote(n).catch(() => null);
    return !c || !(c.sats <= o.settings.autoPaySats) && !await r.confirmPay?.(c.sats, a) ? null : c.pay();
  }, p = async (a) => {
    await Promise.all(a.flatMap((n) => n.servers.map((c) => N(c, n.sha256, e.auth))));
  };
  return {
    async open() {
      o = await e.load(), t = F(o.folders);
      const a = await e.servers().catch(() => ({ mine: [], ranked: [] }));
      return s = a.mine, w = a.ranked, o;
    },
    state: () => o,
    drive: () => t,
    servers: () => [...s],
    ranked: () => w.filter((a) => !s.includes(a.server)),
    /** Whether a server would take a file from this account, and whether it wants paying: asked with a small pretend file. */
    async check(a) {
      const n = B(a);
      return n ? z(n, { sha256: await A(new TextEncoder().encode(`bitlogin-check:${n}`)), size: 1024, type: "application/octet-stream" }, e.auth) : { state: "unreachable", reason: "" };
    },
    /** Use these servers, most trusted first: published as the account's server list (BUD-03). */
    async setServers(a) {
      const n = [...new Set(a.map(B).filter(Boolean))].slice(0, C.servers);
      if (n.length === 0) throw new T("Choose at least one file server.");
      return s = await e.setServers(n), s;
    },
    async setAutoPay(a) {
      o = await e.save({ settings: { autoPaySats: a } });
    },
    /** Save a file into a folder: sealed first if private, uploaded to the first server, and to a second where there is one. */
    async put(a, n, c) {
      if (s.length === 0) throw new T("Choose a file server first.");
      if (n.bytes.length > C.fileBytes) throw new T("That file is larger than 50 MB, which is the most this can save.");
      t.folder(a);
      const f = c.private ? await X(n.bytes) : null, d = f ? f.sealed : n.bytes, S = await A(d), L = f ? "application/octet-stream" : n.type || "application/octet-stream", m = [];
      let b = null;
      for (const g of s) {
        if (m.length >= 2) break;
        try {
          await D(g, d, L, S, e.auth, i(g)), m.push(g);
        } catch ($) {
          if (b = $, m.length === 0 && g === s[s.length - 1]) throw $;
        }
      }
      if (m.length === 0) throw b instanceof Error ? b : new l("refused", "No server would take the file.");
      const P = t.addFile(a, { name: n.name, sha256: S, size: d.length, type: n.type || "application/octet-stream", servers: m, ...f ? { key: f.key } : {} });
      return await h(), P;
    },
    /** A file's bytes, as its owner saved them: fetched from whichever of its servers still has it, checked, and opened. */
    async get(a) {
      const { file: n } = t.find(a);
      let c = null;
      for (const f of n.servers)
        try {
          const d = await G(f, n.sha256, e.auth);
          return { name: n.name, type: n.type, bytes: n.key ? await x(d, n.key) : d };
        } catch (d) {
          c = d;
        }
      throw c instanceof Error ? c : new l("not-found", "No server has that file any more.");
    },
    /** Where anyone can fetch a public file. Null for a private one: its bytes mean nothing without its key. */
    link(a) {
      const { file: n } = t.find(a);
      return n.key ? null : `${n.servers[0]}/${n.sha256}`;
    },
    async newFolder(a, n) {
      const c = t.createFolder(a, n);
      return await h(), c;
    },
    async worldFolder(a) {
      const n = t.worldFolder(a);
      return await h(), n;
    },
    async rename(a, n) {
      "file" in a ? t.renameFile(a.file, n) : t.renameFolder(a.folder, n), await h();
    },
    async move(a, n) {
      "file" in a ? t.moveFile(a.file, n) : t.moveFolder(a.folder, n), await h();
    },
    async copy(a, n) {
      const c = t.copyFile(a, n);
      return await h(), c;
    },
    /** Remove a file or a folder. The index first, so it is gone for the person; then the bytes, from their servers. */
    async remove(a) {
      const n = "file" in a ? [t.deleteFile(a.file)].filter((c) => !!c) : t.deleteFolder(a.folder);
      await h(), await p(n);
    },
    usage: () => t.usage(),
    ROOT: H
  };
}
export {
  l as BlossomError,
  C as DRIVE_LIMITS,
  T as DriveError,
  H as ROOT,
  j as cleanFileName,
  B as cleanServer,
  O as createFiles,
  V as sizeWords
};
