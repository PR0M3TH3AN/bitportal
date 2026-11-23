// packages/sdk/src/settings.ts
import { cleanMenuSettings, cleanSettings } from "@nswp/core";
var arrived = {};
var parts = /* @__PURE__ */ new Map();
var takers = /* @__PURE__ */ new Map();
function arriveWith(settings) {
  arrived = cleanSettings(settings);
}
function arrivedSettings() {
  return arrived;
}
function reportSettings(part, now, take) {
  parts.set(part, now);
  if (take) takers.set(part, take);
  else takers.delete(part);
  return () => {
    if (parts.get(part) !== now) return;
    parts.delete(part);
    takers.delete(part);
  };
}
function changeSettings(settings) {
  const changed = cleanMenuSettings(settings);
  arrived = { ...arrived, ...changed, ...changed.sound || arrived.sound ? { sound: { ...arrived.sound, ...changed.sound } } : {} };
  for (const take of [...takers.values()]) {
    try {
      take(changed);
    } catch {
    }
  }
  return changed;
}
function currentSettings() {
  let out = cleanSettings(arrived);
  for (const now of parts.values()) {
    let said = {};
    try {
      said = cleanSettings(now());
    } catch {
    }
    out = { ...out, ...said, ...said.sound || out.sound ? { sound: { ...out.sound, ...said.sound } } : {} };
  }
  return cleanSettings(out);
}

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

// packages/sdk/src/client-frame.ts
var framed = () => {
  try {
    return typeof window !== "undefined" && window.parent !== window;
  } catch {
    return false;
  }
};
var copiedRefused = (copy, inFrame = framed()) => inFrame ? `What you copied can't be read in a world shown inside another page. Open this world by its own address, ${copy.charAt(0).toLowerCase()}${copy.slice(1)}, and press again.` : `What you copied couldn't be read here. ${copy}, allow this site to read what you copy, and press again.`;
var mayShareScreen = (inFrame = framed()) => {
  if (!inFrame) return true;
  try {
    const policy = document;
    const says = policy.permissionsPolicy?.allowsFeature ?? policy.featurePolicy?.allowsFeature;
    return typeof says === "function" ? says.call(policy.permissionsPolicy ?? policy.featurePolicy, "display-capture") === true : null;
  } catch {
    return null;
  }
};
var framedBy = () => {
  try {
    const above = framed() ? location.ancestorOrigins?.[0] : void 0;
    return above ? new URL(above).host : "";
  } catch {
    return "";
  }
};
var screenNotHere = (by = framedBy()) => {
  const named = `Sharing your screen isn't available in a world shown inside ${by}.`;
  return [by && named.length <= 120 ? named : "Sharing your screen isn't available in a world shown inside another page.", "Open this world by its own address."];
};
var holds = false;
var filled = false;
var menuSpoken = 0;
var saidHereAt = null;
var menuHearer = null;
var menuUnheard = [];
var met = false;
var watchers2 = /* @__PURE__ */ new Set();
var signInAt = null;
var panelOpen = false;
var panelFailed = false;
var panelWatchers = /* @__PURE__ */ new Set();
var menuPlace = null;
function setMenuPlace(fn) {
  menuPlace = fn;
}
var clientHoldsScreen = () => holds;
var clientScreenFilled = () => holds && filled;
function onClientScreen(fn) {
  watchers2.add(fn);
  return () => void watchers2.delete(fn);
}
var say = (words) => {
  try {
    window.parent.postMessage({ nswp: words.nswp, ...words }, "*");
  } catch {
  }
};
function speakMenu(version) {
  if (saidHereAt === null) menuSpoken = version;
}
var sinceHere = () => saidHereAt === null ? null : performance.now() - saidHereAt;
function hearClientMenu(fn) {
  menuHearer = fn;
  if (!fn) return;
  const waiting = menuUnheard;
  menuUnheard = [];
  for (const word of waiting) fn(word);
}
function sayToClient(word) {
  if (framed()) say({ ...word, nswp: "menu" });
}
function askClientForScreen(fill) {
  if (framed()) say({ nswp: "screen", fill });
}
var clientSignsInAt = () => signInAt;
var clientPanelOpen = () => panelOpen;
function onClientSignIn(fn) {
  panelWatchers.add(fn);
  return () => void panelWatchers.delete(fn);
}
function askClientForSignIn(mode = "ask") {
  if (!framed() || !signInAt) return false;
  let menu = null;
  try {
    menu = menuPlace?.() ?? null;
  } catch {
  }
  say({ nswp: "sign-in", mode, ...menu ? { menu } : {} });
  return true;
}
var secureOrigin = (address) => {
  if (typeof address !== "string" || address.length > 200) return null;
  try {
    const u = new URL(address);
    return u.protocol === "https:" && u.origin === address.replace(/\/$/, "") ? u.origin : null;
  } catch {
    return null;
  }
};
function meetClient() {
  if (met || !framed()) return;
  met = true;
  addEventListener("message", (e) => {
    if (e.source !== window.parent) return;
    const said = e.data;
    if (!said || typeof said !== "object") return;
    if (said.nswp === "menu") {
      if (menuHearer) menuHearer(said);
      else if (menuSpoken && menuUnheard.length < 32) menuUnheard.push(said);
      return;
    }
    if (said.nswp === "sign-in" && typeof said.open === "boolean") {
      const failed = !said.open && said.failed === true;
      if (failed) {
        panelFailed = true;
        signInAt = null;
      }
      if (panelOpen === said.open && !failed) return;
      panelOpen = said.open;
      for (const fn of panelWatchers) fn(panelOpen, failed, !said.open && said.allowed === true);
      if (failed) for (const fn of watchers2) fn();
      return;
    }
    if (said.nswp !== "screen" || typeof said.holds !== "boolean") return;
    const was = `${holds}${filled}${signInAt}`;
    holds = said.holds;
    filled = said.filled === true;
    if (said.signIn !== void 0 && !panelFailed) signInAt = secureOrigin(said.signIn);
    if (was !== `${holds}${filled}${signInAt}`) for (const fn of watchers2) fn();
  });
  let at = "/";
  try {
    at = `${location.pathname}${location.search}`.slice(0, 300);
  } catch {
  }
  const hello = () => {
    saidHereAt = performance.now();
    say({ nswp: "here", at, ...menuSpoken ? { menu: menuSpoken } : {} });
  };
  if (typeof queueMicrotask === "function") queueMicrotask(hello);
  else hello();
}
meetClient();
var saver = null;
function setSaver(next) {
  saver = next;
}
var handUp = (file) => saver?.handUp(file) ?? false;
var savesWait = () => saver?.waits() ?? false;

// packages/sdk/src/form.ts
var matches = (query) => {
  try {
    return typeof matchMedia === "function" && matchMedia(query).matches;
  } catch {
    return false;
  }
};
function deviceForms() {
  const touch = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0 || matches("(any-pointer: coarse)");
  const mouse = matches("(any-pointer: fine)");
  return { touch, mouse, main: matches("(pointer: fine)") ? "desk" : "touch" };
}
function formFor(said, device) {
  if (said === "touch" && device.touch) return "touch";
  if (said === "desk" && device.mouse) return "desk";
  return device.main;
}
var arrived2;
var used;
var watching = false;
function arriveAs(form) {
  arrived2 = form;
  watch();
}
function startingForm() {
  return formFor(arrived2, deviceForms());
}
function currentForm() {
  watch();
  return used ?? startingForm();
}
function usedForm() {
  watch();
  return used;
}
function watch() {
  if (watching || typeof addEventListener !== "function") return;
  watching = true;
  addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType === "touch") used = "touch";
      else if (e.pointerType === "mouse") used = "desk";
    },
    { capture: true, passive: true }
  );
}

// packages/sdk/src/ui/chat.ts
import { CHAT_LIMITS, cleanChat } from "@nswp/core";
var CHAT_KEY = "nswp:chat";
var shown2 = null;
var watchers3 = /* @__PURE__ */ new Set();
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
  for (const w of watchers3) w();
}
function onChatChange(cb) {
  watchers3.add(cb);
  return () => void watchers3.delete(cb);
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
  arriveWith,
  arrivedSettings,
  reportSettings,
  changeSettings,
  currentSettings,
  PICTURES_KEY,
  PICTURE_LIMITS,
  showsPictures,
  setShowsPictures,
  onPicturesChange,
  loadPicture,
  framed,
  copiedRefused,
  mayShareScreen,
  screenNotHere,
  setMenuPlace,
  clientHoldsScreen,
  clientScreenFilled,
  onClientScreen,
  speakMenu,
  sinceHere,
  hearClientMenu,
  sayToClient,
  askClientForScreen,
  clientSignsInAt,
  clientPanelOpen,
  onClientSignIn,
  askClientForSignIn,
  meetClient,
  setSaver,
  handUp,
  savesWait,
  deviceForms,
  formFor,
  arriveAs,
  startingForm,
  currentForm,
  usedForm,
  CHAT_KEY,
  showsChat,
  setShowsChat,
  onChatChange,
  createUiChat,
  wrapWords,
  SUMMON_KEY,
  SUMMON_HOLD,
  SUMMON_SLOP,
  createHoldWatch,
  createHeldButton
};
