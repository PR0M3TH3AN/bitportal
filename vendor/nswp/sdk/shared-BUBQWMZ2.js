import {
  arrivedSettings,
  reportSettings
} from "./shared-3QMBUCPV.js";

// packages/sdk/src/picture.ts
import { cleanPicture } from "@nswp/core";
var PICTURES_KEY = "nswp:pictures";
var PICTURE_LIMITS = { bytes: 3e6, size: 128, waitMs: 9e3 };
var shown = null;
var watchers = /* @__PURE__ */ new Set();
function showsPictures() {
  if (shown !== null) return shown;
  const came = arrivedSettings().pictures;
  let kept = null;
  try {
    kept = localStorage.getItem(PICTURES_KEY);
  } catch {
  }
  shown = came ?? kept !== "0";
  if (came !== void 0) keep(shown);
  reportSettings("pictures", () => ({ pictures: showsPictures() }), (now) => void (now.pictures !== void 0 && now.pictures !== shown && setShowsPictures(now.pictures)));
  return shown;
}
var keep = (on) => {
  try {
    if (on) localStorage.removeItem(PICTURES_KEY);
    else localStorage.setItem(PICTURES_KEY, "0");
  } catch {
  }
};
function setShowsPictures(on) {
  showsPictures();
  shown = on;
  keep(on);
  for (const w of watchers) w();
}
function onPicturesChange(cb) {
  watchers.add(cb);
  return () => void watchers.delete(cb);
}
function badge(image, width, height) {
  const size = PICTURE_LIMITS.size;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const g = canvas.getContext("2d");
  g.beginPath();
  g.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
  g.closePath();
  g.clip();
  const side = Math.min(width, height);
  g.drawImage(image, (width - side) / 2, (height - side) / 2, side, side, 0, 0, size, size);
  return canvas;
}
async function byFetch(url) {
  const res = await fetch(url, { mode: "cors", credentials: "omit", referrerPolicy: "no-referrer", redirect: "follow", signal: AbortSignal.timeout(PICTURE_LIMITS.waitMs) });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") ?? "";
  if (!/^image\/(png|jpeg|webp|gif|avif)\b/i.test(type)) return null;
  if (Number(res.headers.get("content-length") ?? 0) > PICTURE_LIMITS.bytes) return null;
  const blob = await res.blob();
  if (blob.size > PICTURE_LIMITS.bytes) return null;
  const bitmap = await createImageBitmap(blob);
  try {
    return badge(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}
function byImage(url) {
  return new Promise((done) => {
    const img = new Image();
    const timer = setTimeout(() => done(null), PICTURE_LIMITS.waitMs);
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";
    img.onload = () => {
      clearTimeout(timer);
      try {
        done(img.naturalWidth > 0 && img.naturalWidth <= 8192 && img.naturalHeight <= 8192 ? badge(img, img.naturalWidth, img.naturalHeight) : null);
      } catch {
        done(null);
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      done(null);
    };
    img.src = url;
  });
}
var loaded = /* @__PURE__ */ new Map();
function loadPicture(address) {
  const url = cleanPicture(address);
  if (!url || !showsPictures() || typeof document === "undefined") return Promise.resolve(null);
  let asked = loaded.get(url);
  if (!asked) {
    asked = byFetch(url).catch(() => null).then((got) => got ?? byImage(url)).catch(() => null);
    loaded.set(url, asked);
  }
  return asked;
}

// packages/sdk/src/ui/theme.ts
var DEFAULT_THEME = { accent: "#ffb65c", ink: "#eef5fb", glass: "#0a1018", warn: "#ff7566", motion: true, scale: 1, wrist: "left" };
var UI_PRESETS = [
  { id: "lantern", label: "Lantern", accent: "#ffb65c" },
  { id: "ion", label: "Ion", accent: "#62d9ff" },
  { id: "verdant", label: "Verdant", accent: "#4fd08b" },
  { id: "rose", label: "Rose", accent: "#ff8fb1" },
  { id: "paper", label: "Paper", accent: "#f2f3f6" }
];
var KEY = "nswp:ui";
var HEX = /^#[0-9a-f]{6}$/i;
function cleanTheme(input) {
  const out = {};
  if (!input || typeof input !== "object") return out;
  const t = input;
  for (const k of ["accent", "ink", "glass", "warn"]) if (typeof t[k] === "string" && HEX.test(t[k])) out[k] = t[k].toLowerCase();
  if (typeof t.motion === "boolean") out.motion = t.motion;
  if (typeof t.scale === "number" && Number.isFinite(t.scale)) out.scale = Math.min(1.5, Math.max(0.85, t.scale));
  if (t.wrist === "left" || t.wrist === "right" || t.wrist === "off") out.wrist = t.wrist;
  return out;
}
function loadVisitorTheme() {
  try {
    return cleanTheme(JSON.parse(globalThis.localStorage?.getItem(KEY) ?? "{}"));
  } catch {
    return {};
  }
}
function saveVisitorTheme(theme) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(cleanTheme(theme)));
  } catch {
  }
}
function prefersStill() {
  try {
    return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  } catch {
    return false;
  }
}
function resolveTheme(world = {}, visitor = loadVisitorTheme()) {
  return { ...DEFAULT_THEME, ...prefersStill() ? { motion: false } : {}, ...cleanTheme(world), ...cleanTheme(visitor) };
}
function rgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return `${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}`;
}

// packages/sdk/src/ui/chat.ts
import { CHAT_LIMITS, cleanChat } from "@nswp/core";
var CHAT_KEY = "nswp:chat";
var shown2 = null;
var watchers2 = /* @__PURE__ */ new Set();
function showsChat() {
  if (shown2 !== null) return shown2;
  const came = arrivedSettings().chat;
  let kept = null;
  try {
    kept = localStorage.getItem(CHAT_KEY);
  } catch {
  }
  shown2 = came ?? kept !== "0";
  if (came !== void 0) keep2(shown2);
  reportSettings("chat", () => ({ chat: showsChat() }), (now) => void (now.chat !== void 0 && now.chat !== shown2 && setShowsChat(now.chat)));
  return shown2;
}
var keep2 = (on) => {
  try {
    if (on) localStorage.removeItem(CHAT_KEY);
    else localStorage.setItem(CHAT_KEY, "0");
  } catch {
  }
};
function setShowsChat(on) {
  showsChat();
  shown2 = on;
  keep2(on);
  for (const w of watchers2) w();
}
function onChatChange(cb) {
  watchers2.add(cb);
  return () => void watchers2.delete(cb);
}
function createUiChat(changed) {
  let send = null;
  let title = "Room chat";
  let lines = [];
  let unread = 0;
  let version = 0;
  let count = 0;
  const bump = () => {
    version++;
    changed();
  };
  onChatChange(() => {
    if (!showsChat()) {
      lines = [];
      unread = 0;
    }
    bump();
  });
  return {
    attach(fn, opts = {}) {
      send = fn;
      title = opts.title ?? "Room chat";
      lines = [];
      unread = 0;
      bump();
    },
    detach() {
      if (!send && !lines.length) return;
      send = null;
      lines = [];
      unread = 0;
      bump();
    },
    add(line) {
      if (!send || !showsChat()) return;
      const text = cleanChat(line.text);
      if (!text) return;
      lines.push({ key: `${line.id ?? "n"}-${++count}`, who: line.note ? "" : cleanChat(line.who ?? "").slice(0, 48), text, mine: !!line.mine, note: !!line.note, color: line.color ?? "", at: Date.now() });
      if (lines.length > CHAT_LIMITS.kept) lines = lines.slice(-CHAT_LIMITS.kept);
      if (!line.mine && !line.note) unread++;
      bump();
    },
    send(text) {
      if (!send || !showsChat()) return "There is nobody to write to: join the room first.";
      if (!cleanChat(text)) return null;
      return send(text) ?? null;
    },
    seen() {
      if (!unread) return;
      unread = 0;
      bump();
    },
    view() {
      return { ready: !!send && showsChat(), title, lines, unread, limit: CHAT_LIMITS.chars, version };
    }
  };
}
function wrapWords(text, measure, width, rows) {
  const out = [];
  let row = "";
  const push = (word) => {
    let rest = [...word];
    while (rest.length) {
      let n = rest.length;
      while (n > 1 && measure(rest.slice(0, n).join("")) > width) n--;
      const piece = rest.slice(0, n).join("");
      rest = rest.slice(n);
      if (rest.length) out.push(piece);
      else row = piece;
    }
  };
  for (const word of text.split(" ").filter(Boolean)) {
    const tried = row ? `${row} ${word}` : word;
    if (measure(tried) <= width) row = tried;
    else {
      if (row) out.push(row);
      row = "";
      if (measure(word) <= width) row = word;
      else push(word);
    }
  }
  if (row) out.push(row);
  if (out.length <= rows) return out;
  const kept = out.slice(0, rows);
  let last = [...kept[rows - 1]];
  while (last.length > 1 && measure(`${last.join("")}\u2026`) > width) last.pop();
  kept[rows - 1] = `${last.join("").trimEnd()}\u2026`;
  return kept;
}

// packages/sdk/src/ui/feed.ts
import { CHAT_LIMITS as CHAT_LIMITS2, cleanChat as cleanChat2, cleanLine } from "@nswp/core";
var FEED_LIMITS = { shown: 420, kept: 30 };
function createUiFeed(changed, now = () => Date.now()) {
  let opts = null;
  let posts = [];
  let loading = false;
  let said = "";
  let version = 0;
  let count = 0;
  let asked = 0;
  const bump = () => {
    version++;
    changed();
  };
  const sort = () => {
    posts.sort((a, b) => b.at - a.at);
    const kept = posts.filter((p, i) => p.state !== "out" || i < FEED_LIMITS.kept);
    posts = kept;
  };
  return {
    attach(next) {
      opts = next;
      posts = [];
      loading = false;
      said = "";
      asked = 0;
      bump();
    },
    detach() {
      if (!opts) return;
      opts = null;
      posts = [];
      loading = false;
      said = "";
      bump();
    },
    opened() {
      const mine = opts;
      if (!mine?.load || loading || asked && now() - asked < 6e4) return;
      asked = now();
      loading = true;
      bump();
      void mine.load().catch(() => null).then((got) => {
        if (opts !== mine) return;
        loading = false;
        if (!got) said = "Your earlier posts couldn't be fetched just now.";
        else {
          const seen = new Set(posts.map((p) => p.key));
          for (const p of got) {
            const text = cleanLine(p.text, FEED_LIMITS.shown);
            if (!text || seen.has(p.id) || !Number.isFinite(p.at)) continue;
            seen.add(p.id);
            posts.push({ key: p.id, text, at: p.at, state: "out", id: p.id });
          }
          sort();
        }
        bump();
      });
    },
    send(text) {
      const mine = opts;
      if (!mine) return "There is nothing to post with: sign in first.";
      const words = cleanChat2(text);
      if (!words) return null;
      const post = { key: `new-${++count}`, text: words, at: Math.floor(now() / 1e3), state: "sending" };
      posts.unshift(post);
      said = "";
      bump();
      void mine.send(words).catch(() => ({ ok: false, said: "That wasn't sent." })).then((how) => {
        if (opts !== mine) return;
        post.state = how.ok ? "out" : "failed";
        if (how.ok && how.id) post.id = how.id;
        said = how.said;
        bump();
      });
      return null;
    },
    remove(key) {
      const mine = opts;
      const post = posts.find((p) => p.key === key);
      if (!mine?.remove || !post?.id || post.state !== "out") return "That post can't be deleted from here.";
      const id = post.id;
      post.state = "removing";
      said = "";
      bump();
      void mine.remove(id).catch(() => ({ ok: false, said: "That wasn't deleted." })).then((how) => {
        if (opts !== mine) return;
        if (how.ok) posts = posts.filter((p) => p !== post);
        else post.state = "out";
        said = how.said;
        bump();
      });
      return null;
    },
    view() {
      const who = typeof opts?.who === "function" ? opts.who() : opts?.who ?? "";
      const back = opts?.remove ? "and deleting it later only asks relays to drop it: copies may remain" : "and it can't be taken back";
      const lead = `Public, like a tweet: anyone can read what you send out here, as ${who}, ${back}.${opts?.marked ? ` Each post is marked as sent from ${opts.marked}.` : ""}`;
      return { ready: !!opts, title: "My public feed", who, posts, loading, said, lead, limit: CHAT_LIMITS2.chars, removable: !!opts?.remove, version };
    }
  };
}
function ago(at, nowSec) {
  const s = Math.max(0, nowSec - at);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const days = Math.floor(s / 86400);
  if (days < 30) return days === 1 ? "1 day ago" : `${days} days ago`;
  return new Date(at * 1e3).toISOString().slice(0, 10);
}

// packages/sdk/src/ui/model.ts
import { cleanMenuWorld, cleanSettings, PINS_MOST } from "@nswp/core";

// packages/sdk/src/ui/letters.ts
import { cleanMessage, MESSAGE_LIMITS } from "@nswp/core";
function createUiLetters(changed, now = () => Date.now()) {
  let opts = null;
  let waiting = [];
  let said = "";
  let version = 0;
  let count = 0;
  const bump = () => {
    version++;
    changed();
  };
  return {
    attach(next) {
      opts = next;
      waiting = [];
      said = "";
      bump();
    },
    detach() {
      if (!opts) return;
      opts = null;
      waiting = [];
      said = "";
      bump();
    },
    touch: bump,
    seen() {
      opts?.seen?.();
    },
    send(text) {
      const mine = opts;
      if (!mine) return "There is nobody to write to: choose someone first.";
      const words = cleanMessage(text);
      if (!words) return null;
      const line = { key: `new-${++count}`, mine: true, who: "You", text: words, at: Math.floor(now() / 1e3), state: "sending" };
      waiting.push(line);
      said = "";
      bump();
      void mine.send(words).catch(() => ({ ok: false, said: "That wasn't sent." })).then((how) => {
        if (opts !== mine) return;
        if (how.ok) waiting = waiting.filter((l) => l !== line);
        else line.state = "failed";
        said = how.said;
        bump();
      });
      return null;
    },
    view() {
      const name = typeof opts?.with === "function" ? opts.with() : opts?.with ?? "";
      const lines = opts ? [...opts.lines().map((l) => ({ ...l, state: "out" })), ...waiting].sort((a, b) => a.at - b.at) : [];
      return {
        ready: !!opts,
        title: name ? `${name}, privately` : "Private messages",
        with: name,
        lines,
        said,
        lead: name ? `Private: only you and ${name} can read what is written here. A relay is told who it is for, and nothing more.` : "",
        limit: MESSAGE_LIMITS.chars,
        version
      };
    }
  };
}

// packages/sdk/src/ui/model.ts
var KIT_QUESTION_TABS = ["how-you-move-desk", "how-you-move"];
var PRESENCES = ["full", "quiet", "hidden"];
var CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"];
function cleanKeys(now, k) {
  const out = { ...now };
  if (k && (k.menu === null || typeof k.menu === "string" && k.menu.length === 1)) out.menu = k.menu === null ? null : k.menu.toLowerCase();
  if (k && typeof k.hotbar === "boolean") out.hotbar = k.hotbar;
  if (k && (k.chat === null || typeof k.chat === "string" && k.chat.length === 1)) out.chat = k.chat === null ? null : k.chat.toLowerCase();
  return out;
}
var read = (t) => typeof t === "function" ? t() : t ?? "";
var STANDARD = [
  { id: "travel", label: "Travel", icon: "door" },
  // Who the visitor is here. It has something in it only for one who came through a client (ui/identity.ts).
  { id: "you", label: "You", icon: "you" },
  // How other people see them. A visitor's own client fills this in, in its own place: a look is changed there and
  // nowhere else (ui/identity.ts, protocol/05-looks.md). In a world it is empty, and isn't shown.
  { id: "figure", label: "Your look", icon: "look" },
  { id: "room", label: "Room", icon: "room" },
  { id: "people", label: "People", icon: "people" },
  // Who the visitor follows (following.ts). Empty, and not shown, for a guest.
  { id: "following", label: "Following", icon: "list" },
  // Their private messages (messaging.ts). Empty, and not shown, for a guest.
  { id: "messages", label: "Messages", icon: "chat" },
  // A world's boards, where it keeps score (scoring.ts). Added by the world; empty, and not shown, otherwise.
  { id: "scores", label: "Scores", icon: "list" },
  // What a world marks, and which of it the visitor has earned (achieving.ts). Added by the world, like Scores.
  { id: "achievements", label: "Achievements", icon: "check" },
  // The items a visitor has, and the one in their hand (bagging.ts). Empty, and not shown, for a guest.
  { id: "bag", label: "Bag", icon: "save" },
  { id: "camera", label: "Camera", icon: "camera" },
  { id: "panels", label: "Panels", icon: "panel" },
  { id: "view", label: "View", icon: "vr" },
  { id: "moving", label: "Moving", icon: "step" },
  { id: "sound", label: "Sound", icon: "sound" },
  // How the controls themselves look. Called "Display", since "your look" is how other people see you.
  { id: "look", label: "Display", icon: "look", note: "How these controls look to you: their colour, the size of their text, whether things move. They go with you from world to world." },
  { id: "help", label: "Help", icon: "help" }
];
var KEEPERS = { id: "guests", label: "Who comes in", icon: "people" };
var STANDARD_TABS = STANDARD.flatMap((s) => s.id === "people" ? [s.id, KEEPERS.id] : [s.id]);
var standardTab = (id) => {
  const s = id === KEEPERS.id ? KEEPERS : STANDARD.find((x) => x.id === id);
  return s ? { label: s.label, icon: s.icon ?? null } : null;
};
var STANDARD_ORDER = ["back", "home", "go-home", "doors", "list", "vr", "room-join", "room-mic", "room-chat", "jump"];
var rank = (id) => {
  const i = STANDARD_ORDER.indexOf(id);
  return i === -1 ? STANDARD_ORDER.length : i;
};
var inOrder = (list) => list.map((a, i) => [a, i]).sort((x, y) => rank(x[0].id) - rank(y[0].id) || x[1] - y[1]).map((x) => x[0]);
var PINS_KEY = "nswp:ui:pins";
function loadPins() {
  try {
    const kept = globalThis.localStorage?.getItem(PINS_KEY);
    return kept === null || kept === void 0 ? null : cleanSettings({ pins: JSON.parse(kept) }).pins ?? null;
  } catch {
    return null;
  }
}
function savePins(pins) {
  try {
    globalThis.localStorage?.setItem(PINS_KEY, JSON.stringify(pins));
  } catch {
  }
}
var LOADING_WORDS = 80;
var SAY_STAYS = { least: 4200, most: 1e4, easy: 60, each: 70 };
var sayStays = (text) => Math.min(SAY_STAYS.most, SAY_STAYS.least + Math.max(0, [...text].length - SAY_STAYS.easy) * SAY_STAYS.each);
function cleanLoading(state) {
  if (!state || typeof state !== "object") return null;
  const raw = typeof state.words === "string" ? state.words : "";
  const words = [...raw.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim()].slice(0, LOADING_WORDS).join("").trim();
  const f = state.fraction;
  const fraction = typeof f === "number" && Number.isFinite(f) ? Math.min(1, Math.max(0, f)) : null;
  return { fraction, words };
}
function createControls(opts) {
  const sections = STANDARD.map((s) => ({ ...s }));
  for (const s of opts.sections ?? []) addSection(s);
  const actions = [];
  const listeners = /* @__PURE__ */ new Set();
  const sayers = /* @__PURE__ */ new Set();
  const signals = /* @__PURE__ */ new Set();
  let visitor = loadVisitorTheme();
  const came = arrivedSettings();
  const brought = { ...came.text !== void 0 ? { scale: came.text } : {}, ...came.motion !== void 0 ? { motion: came.motion } : {}, ...came.wrist !== void 0 ? { wrist: came.wrist } : {} };
  if (Object.keys(brought).length) {
    visitor = { ...visitor, ...brought };
    saveVisitorTheme(visitor);
  }
  reportSettings(
    "look",
    () => ({ ...visitor.scale !== void 0 ? { text: visitor.scale } : {}, ...visitor.motion !== void 0 ? { motion: visitor.motion } : {}, ...visitor.wrist !== void 0 ? { wrist: visitor.wrist } : {} }),
    // Their client's menu changed one (settings.ts, `changeSettings`): as their own hand on it here would.
    (now) => {
      const patch = { ...now.text !== void 0 ? { scale: now.text } : {}, ...now.motion !== void 0 ? { motion: now.motion } : {}, ...now.wrist !== void 0 ? { wrist: now.wrist } : {} };
      if (!Object.keys(patch).length) return;
      visitor = { ...visitor, ...patch };
      saveVisitorTheme(visitor);
      theme = resolveTheme(opts.theme, visitor);
      changed();
    }
  );
  let pins = loadPins();
  if (came.pins !== void 0) {
    pins = [...came.pins];
    savePins(pins);
  }
  reportSettings(
    "pins",
    () => pins ? { pins } : {},
    (now) => {
      if (now.pins === void 0) return;
      pins = [...now.pins];
      savePins(pins);
      changed();
    }
  );
  let theme = resolveTheme(opts.theme, visitor);
  let target = "";
  let detail = [];
  let loading = null;
  let presence = PRESENCES.includes(opts.presence) ? opts.presence : "full";
  let corner = CORNERS.includes(opts.corner) ? opts.corner : "top-left";
  let keys = cleanKeys({ menu: "m", hotbar: true, chat: "t" }, opts.keys);
  let claimed = false;
  const changed = () => {
    for (const fn of listeners) fn();
  };
  const chat = createUiChat(changed);
  const feed = createUiFeed(changed);
  const letters = createUiLetters(changed);
  const toldOfTabs = /* @__PURE__ */ new Set();
  const tellOfTab = (id) => {
    if (toldOfTabs.has(id) || KIT_QUESTION_TABS.includes(id)) return;
    toldOfTabs.add(id);
    if (cleanMenuWorld({ sections: [{ id, label: "a tab", rows: [] }] }, { own: true })?.sections.length) return;
    console.warn(`NSWP: the tab "${id}" is in this world's own menu, but will not be in a client's (BitPortal's): a tab's id is a lowercase word of letters, digits and hyphens, beginning with a letter, twelve at most. Its rows go with it.`);
  };
  function addSection(s) {
    tellOfTab(s.id);
    const i = sections.findIndex((x) => x.id === s.id);
    if (i === -1) sections.push({ ...s });
    else sections[i] = { ...sections[i], ...s };
  }
  const controls = {
    get theme() {
      return theme;
    },
    add(...more) {
      for (const a of more) {
        const i = actions.findIndex((x) => x.id === a.id);
        if (i === -1) actions.push(a);
        else actions[i] = a;
      }
      changed();
    },
    has: (id) => actions.some((x) => x.id === id),
    remove(id) {
      const i = actions.findIndex((x) => x.id === id);
      if (i !== -1) actions.splice(i, 1);
      changed();
    },
    addSection(s) {
      addSection(s);
      changed();
    },
    get presence() {
      return presence;
    },
    setPresence(next) {
      if (!PRESENCES.includes(next) || next === presence) return;
      presence = next;
      changed();
    },
    setCorner(next) {
      if (!CORNERS.includes(next) || next === corner) return;
      corner = next;
      changed();
    },
    setKeys(next) {
      keys = cleanKeys(keys, next);
      changed();
    },
    claimInput(next) {
      if (claimed === next) return;
      claimed = next;
      changed();
    },
    setLoading(state) {
      const next = cleanLoading(state);
      if (JSON.stringify(next) === JSON.stringify(loading)) return;
      loading = next;
      changed();
    },
    setTarget(text, more = []) {
      const next = text ? more.filter((line) => typeof line === "string" && line.trim()).slice(0, 4) : [];
      if (text === target && next.join("\n") === detail.join("\n")) return;
      target = text;
      detail = next;
      changed();
    },
    say(text) {
      for (const fn of sayers) fn(text);
    },
    run(id, typed, file) {
      const a = actions.find((x) => x.id === id);
      if (!a || a.hidden?.() || a.kind === "line") return false;
      for (const fn of signals) fn("press");
      void Promise.resolve().then(() => a.kind === "file" ? a.act(void 0, file) : a.act(a.kind === "field" || a.kind === "slider" ? typed : void 0)).catch(() => {
      }).finally(changed);
      return true;
    },
    setTheme(patch, keep4 = false) {
      if (keep4) {
        visitor = { ...visitor, ...patch };
        saveVisitorTheme(visitor);
      }
      theme = resolveTheme({ ...opts.theme, ...keep4 ? {} : patch }, visitor);
      changed();
    },
    get pins() {
      return pins ?? [];
    },
    setPinned(section, pinned) {
      const now = pins ?? [];
      if (pinned === now.includes(section)) return true;
      if (pinned && (now.length >= PINS_MOST || cleanSettings({ pins: [section] }).pins?.length !== 1)) return false;
      pins = pinned ? [...now, section] : now.filter((id) => id !== section);
      savePins(pins);
      changed();
      return true;
    },
    view() {
      const showing = inOrder(actions.filter((a) => !a.hidden?.()));
      const pressable = showing.filter((a) => a.kind !== "line" && a.kind !== "slider");
      const bar = [...pressable.filter((a) => a.hotbar && a.lead), ...pressable.filter((a) => a.hotbar && !a.lead)].slice(0, 6);
      const item = (a) => {
        const slot = bar.indexOf(a);
        return { id: a.id, label: read(a.label), icon: (typeof a.icon === "function" ? a.icon() : a.icon) ?? null, on: a.on ? a.on() : null, tone: a.tone ?? "normal", key: slot === -1 ? "" : String(slot + 1), short: read(a.short) || read(a.label), kind: a.kind ?? "button", ...a.kind === "copy" ? { copy: read(a.copy) } : {}, ...a.kind === "file" ? { accept: a.accept ?? [] } : {}, ...a.kind === "slider" && a.slider ? { slider: a.slider } : {}, color: read(a.color), ...a.picture ? { picture: a.picture } : {}, mark: (typeof a.mark === "function" ? a.mark() : a.mark) ?? null, faint: a.faint?.() === true };
      };
      const known = new Set(sections.map((s) => s.id));
      const extra = [...new Set(showing.map((a) => a.section ?? "travel").filter((id) => !known.has(id)))].map((id) => ({ id, label: id }));
      const shown3 = [...sections, ...extra].map((s) => ({ id: s.id, label: s.label, icon: s.icon ?? null, note: read(s.note), card: s.card?.() ?? null, items: showing.filter((a) => (a.section ?? "travel") === s.id).map(item), pinned: (pins ?? []).includes(s.id) })).filter((s) => s.items.length > 0 || s.note || s.card);
      return {
        title: opts.title,
        address: opts.address ?? "",
        target,
        detail,
        loading,
        sections: shown3,
        hotbar: bar.map(item),
        // Only tabs this place has: a tab pinned in another world that isn't here is kept, and not shown.
        pins: (pins ?? []).flatMap((id, i) => {
          const tab = shown3.find((x) => x.id === id);
          const n = bar.length + i + 1;
          return tab ? [{ id, label: tab.label, icon: tab.icon, key: n <= 9 ? String(n) : "" }] : [];
        }),
        pinsFull: (pins ?? []).length >= PINS_MOST,
        theme,
        presence,
        corner,
        keys: claimed ? { menu: null, hotbar: false, chat: null } : keys,
        chat: chat.view(),
        feed: feed.view(),
        letters: letters.view()
      };
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    signal(name) {
      for (const fn of signals) {
        try {
          fn(name);
        } catch {
        }
      }
    },
    onSignal(fn) {
      signals.add(fn);
      return () => signals.delete(fn);
    },
    onSay(fn) {
      sayers.add(fn);
      return () => sayers.delete(fn);
    },
    chat,
    feed,
    letters
  };
  const keep3 = (patch) => controls.setTheme(patch, true);
  controls.add(
    ...UI_PRESETS.map(
      (p) => ({ id: `look-${p.id}`, section: "look", kind: "swatch", color: p.accent, label: p.label, on: () => theme.accent === p.accent, act: () => keep3({ accent: p.accent }) })
    ),
    { id: "look-size", section: "look", icon: "size", label: () => theme.scale > 1 ? "Text: larger" : "Text: normal", on: () => theme.scale > 1, act: () => keep3({ scale: theme.scale > 1 ? 1 : 1.25 }) },
    { id: "look-motion", section: "look", icon: "motion", label: () => theme.motion ? "Motion: on" : "Motion: off", on: () => theme.motion, act: () => keep3({ motion: !theme.motion }) },
    {
      id: "look-wrist",
      section: "look",
      icon: "menu",
      label: () => theme.wrist === "off" ? "Wrist console: off" : `Wrist console: ${theme.wrist} hand`,
      on: () => theme.wrist !== "off",
      act: () => keep3({ wrist: theme.wrist === "left" ? "right" : theme.wrist === "right" ? "off" : "left" })
    },
    { id: "look-reset", section: "look", icon: "turn", label: "Back to this world's look", hidden: () => Object.keys(visitor).length === 0, act: () => {
      visitor = {};
      saveVisitorTheme({});
      theme = resolveTheme(opts.theme, visitor);
    } }
  );
  return controls;
}

// packages/sdk/src/ui/summon.ts
var SUMMON_KEY = "Backquote";
var SUMMON_HOLD = 600;
var SUMMON_SLOP = 18;
function createHoldWatch(o) {
  const hold = o.hold ?? SUMMON_HOLD;
  const slop = o.slop ?? SUMMON_SLOP;
  let from = null;
  let timer = null;
  const cancel = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    from = null;
  };
  return {
    touches(points) {
      if (points.length !== 2) return cancel();
      if (!from) {
        from = points.map((p) => ({ x: p.x, y: p.y }));
        timer = setTimeout(() => {
          cancel();
          o.onHeld();
        }, hold);
        return;
      }
      if (points.some((p, i) => Math.hypot(p.x - from[i].x, p.y - from[i].y) > slop)) cancel();
    },
    cancel
  };
}
function createHeldButton(hold = SUMMON_HOLD) {
  let held = 0;
  let fired = false;
  return (down, dt) => {
    if (!down) {
      held = 0;
      fired = false;
      return false;
    }
    held += Math.max(0, dt) * 1e3;
    if (fired || held < hold) return false;
    fired = true;
    return true;
  };
}

export {
  PICTURES_KEY,
  PICTURE_LIMITS,
  showsPictures,
  setShowsPictures,
  onPicturesChange,
  loadPicture,
  DEFAULT_THEME,
  UI_PRESETS,
  cleanTheme,
  resolveTheme,
  rgb,
  CHAT_KEY,
  showsChat,
  setShowsChat,
  onChatChange,
  wrapWords,
  FEED_LIMITS,
  ago,
  KIT_QUESTION_TABS,
  STANDARD_TABS,
  standardTab,
  sayStays,
  createControls,
  SUMMON_KEY,
  SUMMON_HOLD,
  SUMMON_SLOP,
  createHoldWatch,
  createHeldButton
};
