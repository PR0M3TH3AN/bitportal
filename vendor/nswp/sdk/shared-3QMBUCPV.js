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
var watchers = /* @__PURE__ */ new Set();
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
  watchers.add(fn);
  return () => void watchers.delete(fn);
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
      if (failed) for (const fn of watchers) fn();
      return;
    }
    if (said.nswp !== "screen" || typeof said.holds !== "boolean") return;
    const was = `${holds}${filled}${signInAt}`;
    holds = said.holds;
    filled = said.filled === true;
    if (said.signIn !== void 0 && !panelFailed) signInAt = secureOrigin(said.signIn);
    if (was !== `${holds}${filled}${signInAt}`) for (const fn of watchers) fn();
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
var making = () => saver?.making?.() ?? false;
var sent = () => new Promise((resolve) => setTimeout(resolve, 0));
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

export {
  arriveWith,
  arrivedSettings,
  reportSettings,
  changeSettings,
  currentSettings,
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
  making,
  sent,
  handUp,
  savesWait,
  deviceForms,
  formFor,
  arriveAs,
  startingForm,
  currentForm,
  usedForm
};
