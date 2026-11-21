const u = "root", F = { filesPerFolder: 200, folders: 300, nameChars: 120, servers: 5, fileBytes: 52428800 }, T = /^[0-9a-f]{64}$/u, b = /^[0-9a-f]{16}$/u, M = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (a) => a.toString(16).padStart(2, "0")).join("");
function g(a) {
  if (typeof a != "string") return "";
  const n = (l) => l < 32 || l >= 127 && l <= 159 || l >= 8203 && l <= 8207 || l >= 8232 && l <= 8238 || l >= 8288 && l <= 8297 || l === 65279, f = [...Array.from(a, (l) => n(l.codePointAt(0) ?? 0) || l === "/" || l === "\\" ? " " : l).join("").split(" ").filter(Boolean).join(" ")].slice(0, F.nameChars).join("");
  return f === "." || f === ".." ? "" : f;
}
function R(a) {
  if (typeof a != "string" || a.length > 200) return "";
  try {
    const n = new URL(a.trim()), i = n.hostname === "localhost" || n.hostname === "127.0.0.1";
    return n.protocol !== "https:" && !(n.protocol === "http:" && i) || n.username || n.password ? "" : n.origin;
  } catch {
    return "";
  }
}
const S = (a) => typeof a == "string" && /^[a-z0-9!#$&^_.+-]{1,60}\/[a-z0-9!#$&^_.+-]{1,60}$/iu.test(a) ? a.toLowerCase() : "application/octet-stream";
function k(a) {
  if (!a || typeof a != "object") return null;
  const n = a, i = g(n.name), f = [...new Set((Array.isArray(n.servers) ? n.servers : []).map(R).filter(Boolean))].slice(0, F.servers);
  return typeof n.id != "string" || !b.test(n.id) || !i || typeof n.sha256 != "string" || !T.test(n.sha256) || typeof n.size != "number" || !Number.isSafeInteger(n.size) || n.size < 0 || f.length === 0 || n.key !== void 0 && (typeof n.key != "string" || !T.test(n.key)) ? null : { id: n.id, name: i, sha256: n.sha256, size: n.size, type: S(n.type), servers: f, ...n.key ? { key: n.key } : {}, at: typeof n.at == "number" && Number.isFinite(n.at) ? Math.floor(n.at) : 0 };
}
function B(a) {
  if (!a || typeof a != "object") return null;
  const n = a, i = n.id === u;
  if (typeof n.id != "string" || !i && !b.test(n.id)) return null;
  const f = i ? "Files" : g(n.name), l = i ? "" : typeof n.parent == "string" && (n.parent === u || b.test(n.parent)) ? n.parent : "";
  if (!f || !i && !l || !Array.isArray(n.files) || n.files.length > F.filesPerFolder) return null;
  const d = [];
  for (const m of n.files) {
    const p = k(m);
    if (!p) return null;
    d.push(p);
  }
  let c = "";
  if (typeof n.world == "string")
    try {
      const m = new URL(n.world);
      (m.protocol === "https:" || m.protocol === "http:") && m.origin === n.world && (c = m.origin);
    } catch {
      c = "";
    }
  return { id: n.id, name: f, parent: l, ...c ? { world: c } : {}, files: d, at: typeof n.at == "number" && Number.isFinite(n.at) ? Math.floor(n.at) : 0 };
}
class h extends Error {
  constructor(n) {
    super(n), this.name = "DriveError";
  }
}
function I(a, n = () => Math.floor(Date.now() / 1e3)) {
  const i = /* @__PURE__ */ new Map();
  for (const e of a) i.set(e.id, { ...e, files: e.files.map((t) => ({ ...t })) });
  i.has(u) || i.set(u, { id: u, name: "Files", parent: "", files: [], at: 0 });
  for (const e of i.values()) e.id !== u && !i.has(e.parent) && (e.parent = u);
  const f = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), d = (e) => {
    e.at = Math.max(n(), e.at + 1), f.add(e.id);
  }, c = (e) => {
    const t = i.get(e);
    if (!t) throw new h("That folder is no longer there.");
    return t;
  }, m = (e) => [...i.values()].filter((t) => t.parent === e).sort((t, r) => t.name.localeCompare(r.name)), p = (e) => {
    for (const t of i.values()) {
      const r = t.files.find((s) => s.id === e);
      if (r) return { in: t, file: r };
    }
    throw new h("That file is no longer there.");
  }, w = (e, t) => {
    if (!t.includes(e)) return e;
    const r = e.lastIndexOf("."), [s, o] = r > 0 ? [e.slice(0, r), e.slice(r)] : [e, ""];
    for (let y = 2; y < 1e3; y++) if (!t.includes(`${s} (${y})${o}`)) return `${s} (${y})${o}`;
    throw new h("There are too many things with that name here.");
  }, v = (e) => [...m(e).map((t) => t.name), ...c(e).files.map((t) => t.name)], $ = (e) => {
    if (e.files.length >= F.filesPerFolder) throw new h(`A folder holds ${F.filesPerFolder} files at most. Make another folder for more.`);
  }, z = (e, t) => {
    for (let r = e, s = 0; r && s < 400; r = i.get(r)?.parent ?? "", s++) if (r === t) return !0;
    return !1;
  }, A = (e) => [...i.values()].some((t) => t.files.some((r) => r.sha256 === e));
  return {
    folder: c,
    children: m,
    /** The folders from the top down to this one, for the path a person sees. */
    path(e) {
      const t = [];
      for (let r = e, s = 0; r && s < 400; r = i.get(r)?.parent ?? "", s++) t.unshift(c(r));
      return t;
    },
    folders: () => [...i.values()],
    find: p,
    createFolder(e, t, r) {
      const s = g(t);
      if (!s) throw new h("Give the folder a name.");
      if (i.size >= F.folders) throw new h("There are too many folders. Remove one you don't need.");
      c(e);
      const o = { id: M(), name: w(s, v(e)), parent: e, ...r ? { world: r } : {}, files: [], at: 0 };
      return i.set(o.id, o), l.delete(o.id), d(o), o;
    },
    /**
     * The folder BitLogin keeps for one site: made the first time that site saves anything, under "Worlds", and
     * named by its address. Found by the address it was made for, never by its name, which a person may change.
     */
    worldFolder(e) {
      const t = [...i.values()].find((o) => o.world === e);
      if (t) return t;
      const r = m(u).find((o) => o.name === "Worlds" && !o.world) ?? this.createFolder(u, "Worlds");
      let s = e;
      try {
        s = new URL(e).host;
      } catch {
      }
      return this.createFolder(r.id, s, e);
    },
    renameFolder(e, t) {
      const r = c(e), s = g(t);
      if (e === u || !s) throw new h("Give the folder a name.");
      r.name = w(s, v(r.parent).filter((o) => o !== r.name)), d(r);
    },
    moveFolder(e, t) {
      const r = c(e);
      if (c(t), e === u || z(t, e)) throw new h("A folder can't be moved into itself.");
      r.parent !== t && (r.name = w(r.name, v(t)), r.parent = t, d(r));
    },
    /** Remove a folder and everything in it. Returns the blobs that nothing names any more: theirs to delete from servers. */
    deleteFolder(e) {
      if (e === u) throw new h("The top folder can't be removed.");
      c(e);
      const t = [...i.values()].filter((o) => z(o.id, e)), r = t.flatMap((o) => o.files);
      for (const o of t)
        i.delete(o.id), f.delete(o.id), l.add(o.id);
      const s = /* @__PURE__ */ new Set();
      return r.filter((o) => !A(o.sha256) && !s.has(o.sha256) && !!s.add(o.sha256));
    },
    addFile(e, t) {
      const r = c(e);
      $(r);
      const s = k({ ...t, id: M(), name: w(g(t.name) || "file", v(e)), at: n() });
      if (!s) throw new h("That is not a file this drive can keep.");
      return r.files.push(s), d(r), s;
    },
    renameFile(e, t) {
      const { in: r, file: s } = p(e), o = g(t);
      if (!o) throw new h("Give the file a name.");
      s.name = w(o, v(r.id).filter((y) => y !== s.name)), d(r);
    },
    moveFile(e, t) {
      const { in: r, file: s } = p(e), o = c(t);
      r.id !== t && ($(o), s.name = w(s.name, v(t)), r.files = r.files.filter((y) => y.id !== e), o.files.push(s), d(r), d(o));
    },
    /** A second name for the same bytes: nothing is uploaded again. A private copy opens with the same key. */
    copyFile(e, t) {
      const { file: r } = p(e), s = c(t);
      $(s);
      const o = { ...r, servers: [...r.servers], id: M(), name: w(r.name, v(t)), at: n() };
      return s.files.push(o), d(s), o;
    },
    /** Remove a file. Returns it if no other file names its bytes: then they can be deleted from its servers too. */
    deleteFile(e) {
      const { in: t, file: r } = p(e);
      return t.files = t.files.filter((s) => s.id !== e), d(t), A(r.sha256) ? null : r;
    },
    /** What each server holds for this drive: every blob counted once, however many names it has. */
    usage() {
      const e = /* @__PURE__ */ new Map();
      for (const t of i.values()) for (const r of t.files) for (const s of r.servers) (e.get(s) ?? e.set(s, /* @__PURE__ */ new Map()).get(s)).set(r.sha256, r.size);
      return [...e].map(([t, r]) => ({ server: t, bytes: [...r.values()].reduce((s, o) => s + o, 0), files: r.size })).sort((t, r) => r.bytes - t.bytes);
    },
    /** What has changed since this was last asked: the folders to save, and the ones to remove. Asking clears it. */
    takeChanges() {
      const e = { save: [...f].flatMap((t) => i.has(t) ? [i.get(t)] : []), remove: [...l] };
      return f.clear(), l.clear(), e;
    }
  };
}
function x(a) {
  if (a < 1e3) return `${a} B`;
  const n = ["kB", "MB", "GB", "TB"];
  let i = a, f = -1;
  do
    i /= 1e3, f++;
  while (i >= 1e3 && f < n.length - 1);
  return `${i >= 100 ? Math.round(i) : i.toFixed(1)} ${n[f]}`;
}
export {
  h as D,
  u as R,
  F as a,
  R as b,
  I as c,
  g as d,
  B as e,
  x as s
};
