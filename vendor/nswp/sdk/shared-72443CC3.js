import {
  arrivedSettings,
  askClientForScreen,
  clientHoldsScreen,
  clientScreenFilled,
  currentForm,
  framed,
  meetClient,
  onClientScreen,
  reportSettings
} from "./shared-YK562XB3.js";

// packages/sdk/src/ui/fullscreen.ts
var resumed = false;
var waiting = false;
var FULL_KEY = "nswp:full";
var prefers = false;
var keepFull = (on) => {
  prefers = on;
  try {
    if (on) localStorage.setItem(FULL_KEY, "1");
    else localStorage.removeItem(FULL_KEY);
  } catch {
  }
};
var prefersFullscreen = () => prefers;
var held = false;
var holdFullscreen = (on) => {
  held = on;
};
function resumeFullscreen(presenting = () => false) {
  if (resumed || typeof document === "undefined") return;
  resumed = true;
  const came = arrivedSettings().full;
  let kept = false;
  try {
    kept = localStorage.getItem(FULL_KEY) === "1";
  } catch {
  }
  if (came === void 0) prefers = kept;
  else keepFull(came);
  reportSettings("screen", () => ({ full: prefers }));
  meetClient();
  const mayAsk = framed();
  waiting = prefers && (document.fullscreenEnabled && !document.fullscreenElement || mayAsk);
  if (!waiting) return;
  const presses = ["keydown", "pointerdown", "pointerup", "touchend"];
  const stop = () => {
    waiting = false;
    for (const type of presses) removeEventListener(type, onPress, true);
    document.removeEventListener("fullscreenchange", onChange);
    forget();
  };
  const onChange = () => {
    if (document.fullscreenElement || clientScreenFilled()) stop();
  };
  const forget = onClientScreen(onChange);
  const onPress = (e) => {
    if (e.code === "Escape" || held || presenting() || document.fullscreenElement) return;
    if (clientHoldsScreen()) return void (clientScreenFilled() ? stop() : askClientForScreen(true));
    if (!document.fullscreenEnabled) return;
    void document.documentElement.requestFullscreen().then(stop, () => {
    });
  };
  for (const type of presses) addEventListener(type, onPress, true);
  document.addEventListener("fullscreenchange", onChange);
  onChange();
}
var isFilled = () => clientHoldsScreen() ? clientScreenFilled() : !!document.fullscreenElement;
var canFill = () => clientHoldsScreen() || document.fullscreenEnabled;
var fullscreenWaiting = () => waiting && canFill() && !isFilled();
function fullscreenAction(controls, presenting) {
  resumeFullscreen(presenting);
  presentingNow = presenting;
  watchEscape();
  setTimeout(() => {
    if (waiting && !held && !presenting() && canFill() && !isFilled()) controls.say("Press any key, or click, to fill the screen again.");
  }, 600);
  onClientScreen(() => controls.setTarget(""));
  return {
    id: "fullscreen",
    section: "view",
    icon: "full",
    on: () => prefers,
    // Not every browser lets a page fill the screen (a phone's often won't), and a headset already does.
    hidden: () => !canFill() || presenting(),
    // It says what they prefer, in every world, and whether the screen is filled just now.
    label: () => !prefers ? "Fullscreen: off" : isFilled() ? "Fullscreen: on, in every world" : "Fullscreen: on, in every world. Press to fill the screen again",
    act: async () => {
      const fill = !isFilled();
      if (!fill) keepFull(false);
      if (clientHoldsScreen()) {
        if (fill) keepFull(true);
        askClientForScreen(fill);
        return void controls.setTarget("");
      }
      try {
        if (fill) {
          await document.documentElement.requestFullscreen();
          keepFull(true);
        } else await leaveFullscreen();
      } catch {
        controls.say("This browser wouldn't go fullscreen.");
      }
      controls.setTarget("");
    }
  };
}
var keyboard = () => typeof navigator === "undefined" ? void 0 : navigator.keyboard;
var holding = false;
var leaving = false;
var watching = false;
var leftByBrowser = /* @__PURE__ */ new Set();
function onBrowserLeftFullscreen(fn) {
  leftByBrowser.add(fn);
  return () => void leftByBrowser.delete(fn);
}
function watchEscape() {
  if (watching || typeof document === "undefined") return;
  watching = true;
  let wasFilled = !!document.fullscreenElement;
  const onChange = () => {
    const filled = !!document.fullscreenElement;
    if (filled) {
      holding = false;
      try {
        const asked = keyboard()?.lock?.(["Escape"]);
        if (asked) void asked.then(() => holding = !!document.fullscreenElement, () => holding = false);
      } catch {
      }
    } else {
      holding = false;
      try {
        keyboard()?.unlock?.();
      } catch {
      }
      if (wasFilled && !leaving) for (const fn of [...leftByBrowser]) fn();
      leaving = false;
    }
    wasFilled = filled;
  };
  document.addEventListener("fullscreenchange", onChange);
}
var escapeHeld = () => holding && typeof document !== "undefined" && !!document.fullscreenElement;
function escapeDoes(state) {
  if (state.menuOpen) return state.held ? "leave-fullscreen" : "close-menu";
  return state.held ? "open-menu" : "nothing";
}
async function leaveFullscreen() {
  if (typeof document === "undefined" || !document.fullscreenElement) return;
  leaving = true;
  try {
    await document.exitFullscreen();
  } catch {
    leaving = false;
  }
}
var presentingNow = () => false;
var fullscreenButton = {
  shown() {
    if (typeof document === "undefined" || presentingNow()) return false;
    return canFill() && !isFilled() && currentForm() === "desk";
  },
  label: "Full screen",
  async press(controls) {
    if (clientHoldsScreen()) {
      keepFull(true);
      askClientForScreen(true);
      return;
    }
    try {
      await document.documentElement.requestFullscreen();
      keepFull(true);
    } catch {
      controls?.say("This browser wouldn't go fullscreen.");
    }
  }
};

export {
  prefersFullscreen,
  holdFullscreen,
  resumeFullscreen,
  fullscreenWaiting,
  fullscreenAction,
  onBrowserLeftFullscreen,
  watchEscape,
  escapeHeld,
  escapeDoes,
  leaveFullscreen,
  fullscreenButton
};
