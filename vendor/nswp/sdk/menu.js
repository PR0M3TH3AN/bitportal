import {
  addSoundControls,
  createSounds,
  download
} from "./shared-3VK5CLME.js";
import {
  mountMenu,
  portHere
} from "./shared-F5L2PUBB.js";
import {
  ICONS,
  STANDARD_TABS,
  standardTab
} from "./shared-OHLBJ3AU.js";
import {
  helpWords
} from "./shared-EGXGKKYY.js";
import {
  VISITOR_SWITCHES,
  addDeskControls,
  askDeskMoving,
  chatSwitch,
  deskMovingSwitch,
  modelsSwitch,
  picturesSwitch
} from "./shared-L6FYXGUA.js";
import "./shared-GK2URPYT.js";
import {
  fullscreenAction,
  watchEscape
} from "./shared-5DKD634P.js";
import {
  arriveWith,
  changeSettings,
  currentSettings
} from "./shared-YBP57Z2Q.js";
import "./shared-QLSLERQ3.js";

// packages/sdk/src/ui/port-below.ts
import { cleanMenuSettings, LEAVE_MS, MENU_CARD_PICTURE, menuFileKind, menuFileName, MENU_LIMITS, MENU_SAVE_MS, menuVersionOf, readMenuWordUp } from "@nswp/core";
var WORLDS = "world:";
var HOLD_MS = 4e3;
var BAR_MOST = 6;
var iconOf = (name) => name && Object.prototype.hasOwnProperty.call(ICONS, name) ? name : null;
var itemOf = (row, sent, from) => ({
  ...from ? { from } : {},
  id: `${WORLDS}${row.id}`,
  label: row.label,
  icon: iconOf(row.icon),
  on: row.on ?? null,
  tone: row.tone ?? "normal",
  key: "",
  short: row.short ?? row.label,
  kind: row.kind,
  ...row.kind === "copy" ? { copy: row.copy ?? "" } : {},
  ...row.kind === "file" ? { accept: row.accept ?? [] } : {},
  color: row.color ?? "",
  mark: iconOf(row.mark),
  faint: row.faint === true,
  ...(sent ?? row.picture) !== void 0 ? { picture: () => sent ?? row.picture } : {}
});
var cardOf = (card, sent) => ({
  title: card.title,
  tag: card.tag ?? "",
  // Only ever so for a page of the client's own: the core's reader drops it from any other world.
  proven: card.proven === true,
  sub: card.sub ?? "",
  copy: card.copy ?? "",
  text: card.text ?? "",
  // An address a world names is never fetched: a world's picture crosses as a bitmap, or not at all.
  picture: "",
  color: card.color ?? "",
  now: card.now ?? [],
  ...(sent ?? card.picture) !== void 0 ? { face: sent ?? card.picture } : {},
  ...card.acts ? { acts: card.acts.map((id) => `${WORLDS}${id}`) } : {}
});
function mergeView(base, world, from) {
  if (!world) return base;
  const order = (id) => {
    const i = STANDARD_TABS.indexOf(id);
    return i === -1 ? STANDARD_TABS.length : i;
  };
  const sections = base.sections.map((s) => ({ ...s, items: [...s.items] }));
  const own = [];
  const onBar = [];
  for (const said of world.sections) {
    const standard = standardTab(said.id);
    const whose = world.title || from.address;
    const items = said.rows.map((row) => itemOf(row, from.pictures?.get(row.id), standard ? whose : void 0));
    for (const [i, row] of said.rows.entries()) if (row.bar) onBar.push(items[i]);
    const card = said.card ? cardOf(said.card, from.pictures?.get(`${MENU_CARD_PICTURE}${said.id}`)) : null;
    const there = sections.find((s) => s.id === said.id);
    if (there) {
      there.items.push(...items);
      there.card ??= card;
      if (said.note) there.said = { from: whose, note: said.note };
      continue;
    }
    const section = {
      id: said.id,
      // A tab of the world's own carries the world's name, so that it is never taken for one of the visitor's.
      label: standard ? standard.label : `${said.label ?? said.id} \xB7 ${world.title || from.address}`.slice(0, MENU_LIMITS.label),
      icon: standard ? standard.icon : iconOf(said.icon),
      // In a tab of the world's own the name is on the tab, and its note is plainly its own.
      note: standard ? "" : said.note ?? "",
      ...standard && said.note ? { said: { from: whose, note: said.note } } : {},
      card,
      items,
      pinned: from.pins.includes(said.id)
    };
    if (standard) sections.push(section);
    else own.push(section);
  }
  ;
  const shown = [...sections.map((s, i) => ({ s, i })).sort((a, b) => order(a.s.id) - order(b.s.id) || a.i - b.i).map((x) => x.s), ...own];
  const bar = [...base.hotbar, ...onBar].slice(0, BAR_MOST);
  const keyOf = new Map(bar.map((item, i) => [item.id, String(i + 1)]));
  for (const s of shown) s.items = s.items.map((item) => ({ ...item, key: keyOf.get(item.id) ?? "" }));
  return {
    ...base,
    title: world.title || base.title,
    address: from.address,
    target: world.target[0] ?? "",
    detail: world.target.slice(1),
    loading: world.loading,
    presence: world.level,
    corner: world.corner ?? base.corner,
    keys: world.keys ? base.keys : { menu: null, hotbar: false, chat: null },
    sections: shown,
    hotbar: bar.map((item) => ({ ...item, key: keyOf.get(item.id) ?? "" })),
    pins: from.pins.flatMap((id, i) => {
      const tab = shown.find((x) => x.id === id);
      const n = bar.length + i + 1;
      return tab ? [{ id, label: tab.label, icon: tab.icon, key: n <= 9 ? String(n) : "" }] : [];
    })
  };
}
var ENDING = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "video/webm": "webm", "video/mp4": "mp4" };
var savedName = (world, kind, type, at) => `${world.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "world"}-${kind === "clip" ? "clip-" : ""}${at.toISOString().slice(0, 19).replace(/[T:]/g, "-")}.${ENDING[type]}`;
var isBitmap = (value) => typeof ImageBitmap !== "undefined" && value instanceof ImageBitmap && value.width <= MENU_LIMITS.picture && value.height <= MENU_LIMITS.picture;
function portBelow(frame, opts) {
  const { controls } = opts;
  const hear = opts.hear ?? {
    addEventListener: (type, fn) => window.addEventListener(type, fn),
    removeEventListener: (type, fn) => window.removeEventListener(type, fn)
  };
  const self = opts.origin ?? location.origin;
  const settingsNow = () => {
    const { filesAnywhere: _notSaid, holding: _saidAtAPress, ...rest } = cleanMenuSettings(opts.settings ? opts.settings() : currentSettings());
    return rest;
  };
  const watchers = /* @__PURE__ */ new Set();
  const viewers = /* @__PURE__ */ new Set();
  const sayers = /* @__PURE__ */ new Set();
  let origin = "";
  let speaks = false;
  let world = null;
  let saving = null;
  const now = opts.now ?? (() => performance.now());
  const pictures = /* @__PURE__ */ new Map();
  let menu = null;
  let open = false;
  let saidSettings = "";
  let leaving = null;
  const changed = () => {
    for (const fn of [...viewers]) fn();
    for (const fn of [...watchers]) fn();
  };
  const say = (word) => {
    if (!speaks || !origin) return;
    try {
      frame.contentWindow?.postMessage({ ...word, nswp: "menu" }, origin);
    } catch {
    }
  };
  const drop = () => {
    const had = !!world || speaks || !!origin;
    origin = "";
    speaks = false;
    world = null;
    saving = null;
    pictures.clear();
    saidSettings = "";
    if (had) changed();
  };
  let awaiting = opts.loaded === true;
  let early = false;
  const onLoad = () => {
    if (leaving) clearTimeout(leaving);
    leaving = null;
    if (early) {
      early = false;
      awaiting = false;
      return;
    }
    awaiting = true;
    drop();
  };
  frame.addEventListener("load", onLoad);
  const onMessage = (e) => {
    if (e.source !== frame.contentWindow || !e.data || typeof e.data !== "object") return;
    const data = e.data;
    if (data.nswp === "here") {
      if (awaiting) awaiting = false;
      else early = true;
      world = null;
      saving = null;
      pictures.clear();
      origin = typeof e.origin === "string" ? e.origin : "";
      speaks = menuVersionOf(data) > 0 && !!origin && origin !== "null";
      if (speaks) {
        const settings = settingsNow();
        saidSettings = JSON.stringify(settings);
        say({ has: true, v: menuVersionOf(data), settings });
        if (open) say({ open: true });
      }
      return changed();
    }
    if (data.nswp !== "menu" || !speaks || e.origin !== origin) return;
    const word = readMenuWordUp(data, { own: origin === self, ...opts.also ? { also: opts.also } : {}, picture: opts.picture ?? isBitmap });
    if (!word) return;
    if (word.what === "world") {
      world = word.world;
      const still = new Set(world.sections.flatMap((s) => [...s.rows.map((r) => r.id), ...s.card ? [`${MENU_CARD_PICTURE}${s.id}`] : []]));
      for (const key of [...pictures.keys()]) if (!still.has(key)) pictures.delete(key);
      return changed();
    }
    if (word.what === "key") return void menu?.pressKey(word.key);
    if (word.what === "say") {
      const text = `${world?.title || new URL(origin).host}: ${word.say}`;
      for (const fn of [...sayers]) fn(text);
      return;
    }
    if (word.what === "settings") return void (world?.state.headset.presenting && (opts.onReported ?? changeSettings)(word.settings));
    if (word.what === "save") {
      if (!saving || saving.id !== word.id || now() > saving.until || saving.left < 1) return;
      saving.left--;
      const kind = word.type.startsWith("video/") ? "clip" : "picture";
      const from = world?.title || host();
      const name = savedName(from, kind, word.type, /* @__PURE__ */ new Date());
      const own = opts.onSave ? opts.onSave(word.save, { name, world: from, kind, type: word.type }) : download(word.save, name);
      controls.say(typeof own === "string" && own ? own.slice(0, MENU_LIMITS.say) : `${kind === "clip" ? "A clip" : "A picture"} from ${from} was saved${opts.onSave ? "" : " to this device"}.`);
      return;
    }
    if (word.what === "picture" && world) {
      const there = world.sections.some((s) => s.card && `${MENU_CARD_PICTURE}${s.id}` === word.id || s.rows.some((r) => r.id === word.id));
      if (!there) return;
      pictures.set(word.id, word.picture);
      changed();
    }
  };
  hear.addEventListener("message", onMessage);
  const stopControls = controls.subscribe(() => {
    if (speaks) {
      const settings = settingsNow();
      const text = JSON.stringify(settings);
      if (text !== saidSettings) {
        saidSettings = text;
        say({ settings });
      }
    }
    for (const fn of [...viewers]) fn();
  });
  const rowOf = (id) => {
    if (!world || !id.startsWith(WORLDS)) return null;
    const rowId = id.slice(WORLDS.length);
    for (const s of world.sections) for (const row of s.rows) if (row.id === rowId) return row;
    return null;
  };
  const host = () => {
    try {
      return origin ? new URL(origin).host : "";
    } catch {
      return "";
    }
  };
  const port = {
    view: () => mergeView(controls.view(), speaks ? world : null, { address: host(), pins: controls.pins, pictures }),
    subscribe(fn) {
      viewers.add(fn);
      return () => void viewers.delete(fn);
    },
    run(id, typed, file) {
      if (!open) setTimeout(() => !open && frame.focus(), 0);
      if (!id.startsWith(WORLDS)) return controls.run(id, typed, file);
      const row = rowOf(id);
      if (!row || row.kind === "line") return false;
      if (row.kind === "file") {
        const kind = file ? menuFileKind(file.type) : null;
        if (!file || !kind || !row.accept?.includes(kind) || file.size < 1 || file.size > MENU_LIMITS.file) return false;
        controls.signal("press");
        const name = file.name;
        say({ press: row.id, file: name === void 0 || menuFileName(name) ? file : file.slice(0, file.size, file.type) });
        return true;
      }
      if (row.kind === "save") saving = { id: row.id, until: now() + MENU_SAVE_MS, left: MENU_LIMITS.saves };
      controls.signal("press");
      say({ press: row.id, ...row.kind === "field" && typed !== void 0 ? { field: typed.slice(0, MENU_LIMITS.field) } : {} });
      return true;
    },
    say: (text) => controls.say(text),
    onSay(fn) {
      sayers.add(fn);
      const stop = controls.onSay(fn);
      return () => {
        sayers.delete(fn);
        stop();
      };
    },
    signal(name) {
      controls.signal(name);
      if (name !== "menuOpen" && name !== "menuClose") return;
      open = name === "menuOpen";
      say({ open });
      if (!open) frame.focus();
    },
    onSignal: (fn) => controls.onSignal(fn),
    setPinned: (tab, pinned) => controls.setPinned(tab, pinned),
    get presence() {
      return speaks && world ? world.level : controls.presence;
    },
    get theme() {
      return controls.theme;
    },
    get chat() {
      return controls.chat;
    },
    get feed() {
      return controls.feed;
    },
    get letters() {
      return controls.letters;
    }
  };
  return {
    port,
    get origin() {
      return origin;
    },
    get speaks() {
      return speaks;
    },
    get world() {
      return world;
    },
    onChange(fn) {
      watchers.add(fn);
      return () => void watchers.delete(fn);
    },
    attach(next) {
      menu = next;
    },
    leave() {
      if (leaving) return;
      const from = origin;
      say({ go: "home" });
      if (!speaks) return void opts.home?.(false);
      leaving = setTimeout(() => {
        leaving = null;
        if (origin === from) opts.home?.(true);
      }, LEAVE_MS);
    },
    signOut() {
      say({ sign: "out" });
    },
    hold(item, how = {}) {
      if (!speaks) return Promise.resolve(false);
      say({ settings: { holding: item ? { item, ...how.tints && Object.keys(how.tints).length ? { tints: how.tints } : {}, ...how.script ? { script: how.script } : {} } : "" } });
      const held = () => (world?.state.holding ?? "") === item;
      if (held()) return Promise.resolve(true);
      return new Promise((resolve) => {
        const done = (ok) => {
          clearTimeout(giveUp);
          watchers.delete(look);
          resolve(ok);
        };
        const look = () => void (held() && done(true));
        const giveUp = setTimeout(() => done(held()), HOLD_MS);
        watchers.add(look);
      });
    },
    dispose() {
      if (leaving) clearTimeout(leaving);
      frame.removeEventListener("load", onLoad);
      hear.removeEventListener("message", onMessage);
      stopControls();
      watchers.clear();
      viewers.clear();
      sayers.clear();
      menu = null;
    }
  };
}
function signInRows(below, opts) {
  const state = () => below.world?.state;
  const where = () => below.world?.title || "this world";
  return [
    {
      id: "world-sign-in",
      section: "you",
      icon: "key",
      hidden: () => !state() || state().named || state().signIn === "none",
      label: () => state()?.signIn === "asking" ? "Asking your sign-in address\u2026" : state()?.signIn === "unanswered" ? "Your sign-in address didn't answer. Press to try again." : `Sign in to ${where()}`,
      short: "Sign in",
      act: () => opts.ask()
    },
    {
      id: "world-sign-out",
      section: "you",
      icon: "key",
      on: () => true,
      hidden: () => !state()?.named,
      label: () => `Signed in to ${where()}. Sign out here`,
      short: "Sign out",
      act: () => below.signOut()
    }
  ];
}
export {
  VISITOR_SWITCHES,
  addDeskControls,
  addSoundControls,
  arriveWith,
  askDeskMoving,
  changeSettings,
  chatSwitch,
  createSounds,
  currentSettings,
  deskMovingSwitch,
  fullscreenAction,
  helpWords,
  mergeView,
  modelsSwitch,
  mountMenu,
  picturesSwitch,
  portBelow,
  portHere,
  signInRows,
  watchEscape
};
