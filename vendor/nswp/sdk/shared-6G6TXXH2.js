import {
  setShowsChat,
  setShowsPictures,
  showsChat,
  showsPictures
} from "./shared-RS6AKN35.js";
import {
  arrivedSettings,
  clientPanelOpen,
  currentForm,
  onClientSignIn,
  reportSettings,
  startingForm
} from "./shared-3QMBUCPV.js";

// packages/sdk/src/desk.ts
import { FOV_RANGE, LOOK_RANGE } from "@nswp/core";
var DESK_PREFS_KEY = "nswp:desk";
var LOOK_STEPS = [
  { value: 0.5, word: "slow" },
  { value: 0.75, word: "gentle" },
  { value: 1, word: "normal" },
  { value: 1.5, word: "quick" },
  { value: 2, word: "fast" },
  { value: 3, word: "fastest" }
];
var FOV_STEPS = [null, 60, 70, 80, 90, 100, 110];
var clampLook = (v) => typeof v === "number" && Number.isFinite(v) ? Math.round(Math.min(LOOK_RANGE[1], Math.max(LOOK_RANGE[0], v)) * 100) / 100 : 1;
var clampFov = (v) => typeof v === "number" && Number.isFinite(v) ? Math.round(Math.min(FOV_RANGE[1], Math.max(FOV_RANGE[0], v))) : null;
var prefs = null;
var watchers = /* @__PURE__ */ new Set();
var keep = (p) => {
  try {
    localStorage.setItem(DESK_PREFS_KEY, JSON.stringify(p));
  } catch {
  }
};
function load() {
  if (prefs) return prefs;
  let kept = {};
  try {
    kept = JSON.parse(localStorage.getItem(DESK_PREFS_KEY) ?? "{}") ?? {};
  } catch {
  }
  const came = arrivedSettings();
  prefs = { look: clampLook(came.look ?? kept.look), fov: came.fov !== void 0 ? clampFov(came.fov) : clampFov(kept.fov) };
  if (came.look !== void 0 || came.fov !== void 0) keep(prefs);
  reportSettings(
    "desk",
    () => ({ look: load().look, ...load().fov === null ? {} : { fov: load().fov } }),
    // Their client's menu changed one (settings.ts, `changeSettings`).
    (now) => {
      if (now.look !== void 0) setLookScale(now.look);
      if (now.fov !== void 0) setVisitorFov(now.fov);
    }
  );
  return prefs;
}
var change = (next) => {
  prefs = next;
  keep(next);
  for (const w of watchers) w();
};
var lookScale = () => load().look;
var aimScaleNow = 1;
var aimScale = () => aimScaleNow;
var setAimScale = (k) => void (aimScaleNow = Number.isFinite(k) ? Math.min(1, Math.max(0.3, k)) : 1);
var setLookScale = (v) => change({ ...load(), look: clampLook(v) });
var visitorFov = () => currentForm() === "desk" ? load().fov : null;
var setVisitorFov = (v) => change({ ...load(), fov: v === null ? null : clampFov(v) });
function onDeskChange(cb) {
  watchers.add(cb);
  return () => void watchers.delete(cb);
}
var after = (steps, at) => steps[(at + 1) % steps.length];
function addDeskControls(controls, o) {
  const lookAt = () => {
    const now = lookScale();
    let best = 0;
    LOOK_STEPS.forEach((s, i) => {
      if (Math.abs(s.value - now) < Math.abs(LOOK_STEPS[best].value - now)) best = i;
    });
    return best;
  };
  controls.add(
    {
      id: "look-speed",
      section: "moving",
      icon: "turn",
      hidden: o.presenting,
      label: () => `Look speed: ${LOOK_STEPS[lookAt()].word}`,
      short: "Look speed",
      act: () => {
        setLookScale(after(LOOK_STEPS, lookAt()).value);
        controls.say(`Look speed: ${LOOK_STEPS[lookAt()].word}. It is the same in every world.`);
      }
    },
    {
      id: "fov",
      section: "view",
      icon: "size",
      // A touch screen's view is fitted to its window by the world, and a headset has its own.
      hidden: () => o.presenting() || currentForm() !== "desk",
      label: () => load().fov === null ? "Field of view: this world's own" : `Field of view: ${load().fov}\xB0`,
      short: "View width",
      act: () => {
        const at = FOV_STEPS.indexOf(load().fov);
        setVisitorFov(after(FOV_STEPS, at === -1 ? 0 : at));
        controls.say(load().fov === null ? "Field of view: each world's own." : `Field of view: ${load().fov}\xB0, in every world.`);
      }
    }
  );
  onDeskChange(() => controls.setTarget(""));
}
function watchFov(camera, o = {}) {
  const first = camera.fov;
  const apply = () => {
    if (o.presenting?.()) return;
    const fov = visitorFov() ?? o.own?.() ?? first;
    if (camera.fov === fov) return;
    camera.fov = fov;
    camera.updateProjectionMatrix();
  };
  onDeskChange(apply);
  apply();
  return apply;
}

// packages/sdk/src/stroll.ts
var WALK_SPEED = 2.4;
var RUN = 1.75;
var KEY_TURN = 1.9;
var TOP_SPEED = WALK_SPEED * RUN;
var DOUBLE_TAP = 400;
var TAP_REACH = 6;
var PATH_MOST = 12;
var FACE_RATE = 2.8;
var DRAG_LOOK = 5e-3;
var TILT_LIMIT = 60 * Math.PI / 180;
var LEVEL_RATE = 1.6;
function dragTurn(yaw, pitch, dx, dy, speed = DRAG_LOOK) {
  const clean = (v) => Number.isFinite(v) ? v : 0;
  return { yaw: yaw + clean(dx) * speed, pitch: Math.min(TILT_LIMIT, Math.max(-TILT_LIMIT, clean(pitch) + clean(dy) * speed)) };
}
function levelled(pitch, dt, rate = LEVEL_RATE) {
  const step = Math.max(0, dt) * rate;
  return Math.abs(pitch) <= step ? 0 : pitch - Math.sign(pitch) * step;
}
function createDragLook(o) {
  let pitch = 0;
  let active = true;
  return {
    drag(dx, dy) {
      if (!active) return;
      const next = dragTurn(o.rig.rotation.y, pitch, dx, dy, DRAG_LOOK * (o.scale?.() ?? 1));
      o.rig.rotation.y = next.yaw;
      pitch = next.pitch;
      o.camera.rotation.x = pitch;
    },
    update(dt, s) {
      if (!s.active) {
        if (active && pitch !== 0) o.camera.rotation.x = 0;
        active = false;
        pitch = 0;
        return;
      }
      active = true;
      if (s.walking && pitch !== 0) {
        pitch = levelled(pitch, dt);
        o.camera.rotation.x = pitch;
      }
    },
    level() {
      pitch = 0;
      o.camera.rotation.x = 0;
    },
    get pitch() {
      return pitch;
    }
  };
}
function reachOf(fromX, fromZ, toX, toZ, reach = TAP_REACH) {
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  const far = Math.hypot(dx, dz);
  if (!Number.isFinite(far) || far <= reach || far === 0) return [toX, toZ];
  return [fromX + dx / far * reach, fromZ + dz / far * reach];
}
function dotsBetween(fromX, fromZ, toX, toZ, opts = {}) {
  const gap = opts.gap ?? 0.4;
  const clear = opts.clear ?? 0.45;
  const short = opts.short ?? 0.3;
  const most = opts.most ?? 40;
  const dx = toX - fromX;
  const dz = toZ - fromZ;
  const far = Math.hypot(dx, dz);
  const out = [];
  if (!Number.isFinite(far) || far <= clear + short || !(gap > 0)) return out;
  for (let d = far - short; d >= clear && out.length < most; d -= gap) out.push([fromX + dx / far * d, fromZ + dz / far * d]);
  return out;
}
function createStepPace(o = {}) {
  const speed = o.speed && o.speed > 0 ? o.speed : TOP_SPEED;
  const now = o.now ?? (() => performance.now());
  let readyAt = -Infinity;
  return {
    take(metres) {
      const t = now();
      if (t < readyAt) return false;
      const far = Number.isFinite(metres) ? Math.max(0, metres) : 0;
      readyAt = t + far / speed * 1e3;
      return true;
    },
    get ready() {
      return now() >= readyAt;
    },
    get wait() {
      return Math.max(0, (readyAt - now()) / 1e3);
    }
  };
}
function createStroll(o) {
  const speed = o.speed ?? WALK_SPEED;
  const reach = o.reach ?? TAP_REACH;
  const now = o.now ?? (() => performance.now());
  let path = [];
  let running = false;
  let asked = -Infinity;
  let heading = null;
  const aim = (fx, fz, tx, tz) => {
    const dx = tx - fx;
    const dz = tz - fz;
    if (Math.hypot(dx, dz) > 0.3) heading = Math.atan2(-dx, -dz);
  };
  const halt = () => {
    path = [];
    running = false;
    heading = null;
  };
  return {
    to(x, z, run) {
      const t = now();
      const again = t - asked <= DOUBLE_TAP;
      asked = t;
      const wasRunning = path.length > 0 && running;
      if (!Number.isFinite(x) || !Number.isFinite(z)) return halt();
      path = [[x, z]];
      running = run === true || again || wasRunning;
      aim(...o.where(), x, z);
    },
    tap(x, z) {
      const t = now();
      const again = t - asked <= DOUBLE_TAP;
      asked = t;
      if (!Number.isFinite(x) || !Number.isFinite(z)) return;
      const [hx, hz] = o.where();
      if (again || path.length === 0) {
        const wasRunning = path.length > 0 && running;
        path = [reachOf(hx, hz, x, z, reach)];
        running = again || wasRunning;
        aim(hx, hz, path[0][0], path[0][1]);
        return;
      }
      const end = path[path.length - 1];
      const next = reachOf(end[0], end[1], x, z, reach);
      if (path.length < PATH_MOST && Math.hypot(next[0] - end[0], next[1] - end[1]) > 0.3) path.push(next);
    },
    reach(x, z) {
      const from = path.length ? path[path.length - 1] : o.where();
      return reachOf(from[0], from[1], x, z, reach);
    },
    stop: halt,
    update(dt) {
      const next = path[0];
      if (!next) return;
      const [x, z] = o.where();
      const dx = next[0] - x;
      const dz = next[1] - z;
      const far = Math.hypot(dx, dz);
      aim(x, z, next[0], next[1]);
      const step = Math.min(far, speed * (running ? RUN : 1) * Math.min(Math.max(dt, 0), 0.1));
      const arrived = () => {
        path.shift();
        if (path.length === 0) halt();
      };
      if (far < 0.02 || step <= 0) {
        if (far < 0.02) arrived();
        return;
      }
      const sx = dx / far * step;
      const sz = dz / far * step;
      if (!o.canStand(x + sx, z + sz)) {
        halt();
        o.onBlocked?.();
        return;
      }
      o.move(sx, sz);
      if (far - step < 0.02) arrived();
    },
    face(yaw, dt) {
      if (heading === null || !(dt > 0)) return yaw;
      const turn = ((heading - yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
      const most = FACE_RATE * Math.min(dt, 0.1);
      return yaw + Math.max(-most, Math.min(most, turn * Math.min(1, dt * 7)));
    },
    get going() {
      return path.length > 0;
    },
    get running() {
      return running;
    },
    get target() {
      return path.length ? path[path.length - 1] : null;
    },
    get path() {
      return path;
    },
    get heading() {
      return heading;
    }
  };
}

// packages/sdk/src/ask-once.ts
function mayAskHowTheyMove() {
  try {
    if (new URLSearchParams(globalThis.location?.search ?? "").get("ask") === "moving") return true;
    return !globalThis.navigator?.webdriver;
  } catch {
    return false;
  }
}

// packages/sdk/src/fps.ts
var LOOK_SPEED = 22e-4;
var PITCH_LIMIT = 85 * Math.PI / 180;
var SPRINT = RUN;
function lookAfter(yaw, pitch, dx, dy, speed = LOOK_SPEED) {
  const clean = (n) => Number.isFinite(n) ? n : 0;
  return { yaw: yaw - clean(dx) * speed, pitch: Math.min(PITCH_LIMIT, Math.max(-PITCH_LIMIT, pitch - clean(dy) * speed)) };
}
function strideOf(held, yaw, speed, dt, sprint = SPRINT) {
  const f = (held.forward ? 1 : 0) - (held.back ? 1 : 0);
  const s = (held.right ? 1 : 0) - (held.left ? 1 : 0);
  if (!f && !s) return [0, 0];
  const pace = speed * (held.sprint ? sprint : 1) * Math.max(0, dt) / Math.hypot(f, s);
  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  return [(s * cos - f * sin) * pace, (-s * sin - f * cos) * pace];
}
function heldKey(code) {
  switch (code) {
    case "KeyW":
    case "ArrowUp":
      return "forward";
    case "KeyS":
    case "ArrowDown":
      return "back";
    case "KeyA":
    case "ArrowLeft":
      return "left";
    case "KeyD":
    case "ArrowRight":
      return "right";
    case "ShiftLeft":
    case "ShiftRight":
      return "sprint";
    default:
      return null;
  }
}
var DESK_KEY = "nswp:fps";
var DESK_WORDS = {
  intense: "Desk controls: intense",
  casual: "Desk controls: casual",
  nowIntense: "Intense: the mouse looks round. W, A, S, D walk, Shift runs, Space jumps, F uses what is in front of you, and Escape brings up this menu.",
  nowCasual: "Casual: click where you want to stand, twice to run there, and drag to look round. W, A, S, D walk, Shift runs and Space jumps."
};
var hasMouse = () => startingForm() === "desk";
function startsIntense(arrived, key = DESK_KEY) {
  if (!hasMouse()) return false;
  const prefers = arrivedSettings().intense;
  if (typeof prefers === "boolean") return prefers;
  try {
    return arrived || localStorage.getItem(key) === "1";
  } catch {
    return arrived;
  }
}
function keepIntense(on, key = DESK_KEY) {
  try {
    localStorage.setItem(key, on ? "1" : "0");
  } catch {
  }
}
function keptIntense(key = DESK_KEY) {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}
var DESK_QUESTION = {
  casual: "Casual: click to walk, drag to look",
  intense: "Intense: the mouse looks, keys walk"
};
function createFps(o) {
  const key = o.keep ?? DESK_KEY;
  const mouse = hasMouse();
  let enabled = startsIntense(o.arrived === true, key);
  let answered = typeof arrivedSettings().intense === "boolean" || o.arrived === true || keptIntense(key);
  if (mouse) {
    if (typeof arrivedSettings().intense === "boolean" || o.arrived) keepIntense(enabled, key);
    reportSettings("moving", () => answered ? { intense: enabled } : {}, (now) => void (typeof now.intense === "boolean" && setEnabled(now.intense)));
  }
  const held = {};
  let pitch = 0;
  let weLetGo = false;
  let closedAt = -1;
  let shown = false;
  const looking = () => document.pointerLockElement === o.dom;
  const active = () => enabled && !o.presenting();
  const dot = document.createElement("div");
  dot.setAttribute("aria-hidden", "true");
  dot.style.cssText = "position:fixed;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#fff;opacity:.75;box-shadow:0 0 0 1px rgba(0,0,0,.55);pointer-events:none;z-index:5;display:none";
  document.body.append(dot);
  const panelUp = () => clientPanelOpen();
  const look = () => {
    if (!active() || o.hud?.open || looking() || panelUp()) return;
    try {
      const asked = o.dom.requestPointerLock();
      asked?.catch?.(() => {
      });
    } catch {
    }
  };
  const letGo = () => {
    if (!looking()) return;
    weLetGo = true;
    document.exitPointerLock();
  };
  const free = (e) => !looking() && !o.hud?.open && !panelUp() && e.target === o.dom && e.buttons === 0;
  const onMove = (e) => {
    if (!active() || !(looking() || free(e))) return;
    const next = lookAfter(o.rig.rotation.y, pitch, e.movementX, e.movementY, LOOK_SPEED * lookScale() * aimScale());
    o.rig.rotation.y = next.yaw;
    pitch = next.pitch;
    o.camera.rotation.x = pitch;
  };
  const onDown = (e) => {
    if (!active() || e.button !== 0 || panelUp()) return;
    if (looking()) o.onUse();
    else look();
  };
  const onLock = () => {
    if (looking()) return;
    for (const k of Object.keys(held)) held[k] = false;
    if (active() && !weLetGo && o.hud && !o.hud.open) o.hud.setOpen(true);
    weLetGo = false;
  };
  const typing = (e) => {
    const t = e.target;
    return !!t && (t.isContentEditable || t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT");
  };
  const onKey = (e) => {
    if (!active() || typing(e)) return;
    if (e.code === "Escape") {
      if (e.defaultPrevented) {
        if (looking()) letGo();
        return;
      }
      if (looking()) {
        letGo();
        o.hud?.setOpen(true);
      } else if (o.hud && !o.hud.open && performance.now() - closedAt > 80) o.hud.setOpen(true);
      return;
    }
    if (o.hud?.open || panelUp()) return;
    if (!looking() && !e.repeat) look();
    const which = heldKey(e.code);
    if (which) {
      held[which] = true;
      if (e.code.startsWith("Arrow")) e.preventDefault();
      return;
    }
    if (e.code === "KeyF" && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) o.onUse();
  };
  const onKeyUp = (e) => {
    const which = heldKey(e.code);
    if (which) held[which] = false;
  };
  const onBlur = () => {
    for (const k of Object.keys(held)) held[k] = false;
  };
  o.dom.addEventListener("mousedown", onDown);
  document.addEventListener("mousemove", onMove);
  document.addEventListener("pointerlockchange", onLock);
  addEventListener("keydown", onKey);
  addEventListener("keyup", onKeyUp);
  addEventListener("blur", onBlur);
  const stopPanel = onClientSignIn((up) => {
    if (!up) return;
    for (const k of Object.keys(held)) held[k] = false;
    letGo();
  });
  const stopSignals = o.controls.onSignal((name) => {
    if (name === "menuOpen") letGo();
    if (name === "menuClose") {
      closedAt = performance.now();
      setTimeout(look, 0);
    }
  });
  const setEnabled = (on) => {
    const next = on && mouse;
    if (mouse) {
      answered = true;
      keepIntense(next, key);
    }
    if (next === enabled) return;
    enabled = next;
    if (!enabled) {
      letGo();
      pitch = 0;
      o.camera.rotation.x = 0;
      onBlur();
      dot.style.display = "none";
      o.dom.style.cursor = "";
    }
  };
  o.controls.add({
    id: "fps",
    section: "moving",
    icon: "step",
    on: () => enabled,
    // No mouse, no mouse look. And not in a headset, where it has no meaning.
    hidden: () => !mouse || o.presenting(),
    label: () => enabled ? DESK_WORDS.intense : DESK_WORDS.casual,
    act: () => {
      setEnabled(!enabled);
      o.controls.say(enabled ? DESK_WORDS.nowIntense : DESK_WORDS.nowCasual);
    }
  });
  let asking = false;
  const answer = (intense) => {
    asking = false;
    setEnabled(intense);
    o.controls.say(intense ? DESK_WORDS.nowIntense : DESK_WORDS.nowCasual);
  };
  o.controls.addSection({ id: "how-you-move-desk", label: "How you move", icon: "step", note: () => asking ? "You can change this whenever you like, in Moving." : "" });
  o.controls.add(
    { id: "desk-casual", section: "how-you-move-desk", icon: "step", hidden: () => !asking || o.presenting(), label: DESK_QUESTION.casual, act: () => answer(false) },
    { id: "desk-intense", section: "how-you-move-desk", icon: "look", hidden: () => !asking || o.presenting(), label: DESK_QUESTION.intense, act: () => answer(true) }
  );
  const stopAskingDesk = o.controls.onSignal((name) => {
    if (name === "menuClose" && asking) answer(false);
  });
  let askTimer = 0;
  if (mouse && !answered && mayAskHowTheyMove()) {
    askTimer = window.setTimeout(() => {
      if (answered || o.presenting() || o.mayAsk?.() === false) return;
      asking = true;
      o.controls.signal("show:how-you-move-desk");
    }, 1200);
  }
  const at = o.camera.position.clone();
  return {
    get enabled() {
      return enabled;
    },
    setEnabled,
    get looking() {
      return looking();
    },
    update(dt) {
      if (!active()) {
        if (looking()) letGo();
        if (shown) {
          shown = false;
          dot.style.display = "none";
          o.dom.style.cursor = "";
        }
        return false;
      }
      const aiming = !o.hud?.open;
      if (aiming !== shown) {
        shown = aiming;
        dot.style.display = aiming ? "block" : "none";
      }
      o.dom.style.cursor = aiming ? "none" : "";
      if (o.hud?.open) return true;
      const [dx, dz] = strideOf(held, o.rig.rotation.y, o.speed ?? 2.4, dt);
      if (!dx && !dz) return true;
      o.camera.getWorldPosition(at);
      if (o.canStand(at.x + dx, at.z + dz)) {
        o.rig.position.x += dx;
        o.rig.position.z += dz;
      } else if (o.canStand(at.x + dx, at.z)) o.rig.position.x += dx;
      else if (o.canStand(at.x, at.z + dz)) o.rig.position.z += dz;
      else o.onBlocked?.();
      return true;
    },
    dispose() {
      clearTimeout(askTimer);
      stopAskingDesk();
      letGo();
      dot.remove();
      stopSignals();
      stopPanel();
      o.controls.remove("fps");
      o.dom.removeEventListener("mousedown", onDown);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerlockchange", onLock);
      removeEventListener("keydown", onKey);
      removeEventListener("keyup", onKeyUp);
      removeEventListener("blur", onBlur);
    }
  };
}

// packages/sdk/src/models-switch.ts
var MODELS_KEY = "nswp:models";
var showing = null;
var modelWatchers = /* @__PURE__ */ new Set();
var keepModels = (on) => {
  try {
    if (on) globalThis.localStorage?.removeItem(MODELS_KEY);
    else globalThis.localStorage?.setItem(MODELS_KEY, "off");
  } catch {
  }
};
function showsModels() {
  if (showing !== null) return showing;
  const came = arrivedSettings().models;
  let kept = null;
  try {
    kept = globalThis.localStorage?.getItem(MODELS_KEY) ?? null;
  } catch {
  }
  showing = came ?? kept !== "off";
  if (came !== void 0) keepModels(showing);
  reportSettings("models", () => ({ models: showsModels() }), (now) => void (now.models !== void 0 && now.models !== showing && setShowsModels(now.models)));
  return showing;
}
function setShowsModels(on) {
  showsModels();
  showing = on;
  keepModels(on);
  for (const fn of modelWatchers) fn();
}
function onModelsChange(fn) {
  modelWatchers.add(fn);
  return () => void modelWatchers.delete(fn);
}

// packages/sdk/src/visitor-switches.ts
var VISITOR_SWITCHES = [
  "people-pictures",
  "people-models",
  "room-chat-show",
  "fov",
  // In Sound, which both fill: the volumes, the hum's switch and the visitor's own music are the client's (sound.ts).
  // What is the world's there is the piece it is playing.
  "sound-all",
  "sound-effects",
  "sound-music",
  "sound-voices",
  "sound-hum",
  "juke-add",
  "juke-play",
  "juke-next",
  "juke-remove",
  "juke-place",
  "juke-previous",
  "juke-back",
  "juke-forward",
  "juke-shuffle",
  "juke-repeat",
  "juke-bar",
  // In Moving, which both fill: how they move at a desk, how fast they look round, and how they move in a headset
  // (fps.ts, desk.ts, input.ts) are the visitor's, each a setting that travels. What is the world's there is what
  // it does for them: a jump.
  "fps",
  "look-speed",
  "move-style",
  "move-mode",
  "turn-mode",
  "move-hand",
  "move-narrow",
  "move-fade"
];
var visitorsOwnRow = (id) => VISITOR_SWITCHES.includes(id) || id.startsWith("juke-") || id.startsWith("song-");
var picturesSwitch = (controls) => ({
  id: "people-pictures",
  section: "people",
  icon: "selfie",
  on: () => showsPictures(),
  label: () => showsPictures() ? "Profile pictures: on" : "Profile pictures: off",
  short: "Pictures",
  act: () => {
    setShowsPictures(!showsPictures());
    controls.say(showsPictures() ? "People's own pictures are shown over their names. Each is fetched from wherever its owner keeps it, which tells that place your address." : "No pictures are fetched or shown, here or in the next world.");
  }
});
var modelsSwitch = (controls) => ({
  id: "people-models",
  section: "people",
  icon: "people",
  on: () => showsModels(),
  label: () => showsModels() ? "Show people's own models: on" : "Show people's own models: off",
  short: "Models",
  act: () => {
    setShowsModels(!showsModels());
    controls.say(showsModels() ? "People who wear a model of their own are drawn as it here, and in the next world that draws them." : "Everyone is drawn as their simple look, here and in the next world.");
  }
});
var chatSwitch = (tell) => ({
  id: "room-chat-show",
  section: "room",
  icon: "chat",
  label: () => showsChat() ? "Written chat: on" : "Written chat: off",
  on: () => showsChat(),
  act: () => {
    setShowsChat(!showsChat());
    tell(showsChat() ? "What people write in a room is shown to you, and you can write. It goes only to the people in the room, and is kept nowhere." : "Nothing anyone writes is shown to you, here or in the next world, and nobody is told.");
  }
});
var desk = null;
var deskChoice = () => {
  if (desk) return desk;
  const now = desk = { intense: startsIntense(false), chosen: typeof arrivedSettings().intense === "boolean" || keptIntense() };
  reportSettings(
    "moving",
    () => now.chosen ? { intense: now.intense } : {},
    (said) => {
      if (typeof said.intense !== "boolean") return;
      now.intense = said.intense;
      now.chosen = true;
      keepIntense(now.intense);
    }
  );
  return now;
};
function deskMovingSwitch(controls, o = {}) {
  const choice = deskChoice();
  return {
    id: "fps",
    section: "moving",
    icon: "step",
    on: () => choice.intense,
    hidden: () => !hasMouse() || o.presenting?.() === true,
    label: () => choice.intense ? DESK_WORDS.intense : DESK_WORDS.casual,
    act: () => {
      choice.intense = !choice.intense;
      choice.chosen = true;
      keepIntense(choice.intense);
      controls.say(choice.intense ? DESK_WORDS.nowIntense : DESK_WORDS.nowCasual);
    }
  };
}
function askDeskMoving(controls, o = {}) {
  const choice = deskChoice();
  let asking = false;
  const answer = (intense) => {
    asking = false;
    choice.intense = intense;
    choice.chosen = true;
    keepIntense(intense);
    controls.say(intense ? DESK_WORDS.nowIntense : DESK_WORDS.nowCasual);
    controls.setTheme({});
  };
  controls.addSection({ id: "how-you-move-desk", label: "How you move", icon: "step", note: () => asking ? "You can change this whenever you like, in Moving." : "" });
  controls.add(
    { id: "desk-casual", section: "how-you-move-desk", icon: "step", hidden: () => !asking || o.presenting?.() === true, label: DESK_QUESTION.casual, act: () => answer(false) },
    { id: "desk-intense", section: "how-you-move-desk", icon: "look", hidden: () => !asking || o.presenting?.() === true, label: DESK_QUESTION.intense, act: () => answer(true) }
  );
  const stopSignals = controls.onSignal((name) => {
    if (name === "menuClose" && asking) answer(false);
  });
  let timer = null;
  if (hasMouse() && !choice.chosen && mayAskHowTheyMove()) {
    timer = setTimeout(() => {
      timer = null;
      if (choice.chosen || o.presenting?.() === true) return;
      asking = true;
      controls.signal("show:how-you-move-desk");
    }, o.after ?? 1200);
  }
  return () => {
    if (timer) clearTimeout(timer);
    stopSignals();
    controls.remove("desk-casual");
    controls.remove("desk-intense");
  };
}

export {
  LOOK_STEPS,
  FOV_STEPS,
  lookScale,
  setAimScale,
  setLookScale,
  visitorFov,
  setVisitorFov,
  onDeskChange,
  addDeskControls,
  watchFov,
  showsModels,
  onModelsChange,
  mayAskHowTheyMove,
  WALK_SPEED,
  RUN,
  KEY_TURN,
  TOP_SPEED,
  DOUBLE_TAP,
  TAP_REACH,
  PATH_MOST,
  FACE_RATE,
  DRAG_LOOK,
  TILT_LIMIT,
  LEVEL_RATE,
  dragTurn,
  levelled,
  createDragLook,
  reachOf,
  dotsBetween,
  createStepPace,
  createStroll,
  LOOK_SPEED,
  PITCH_LIMIT,
  SPRINT,
  lookAfter,
  strideOf,
  heldKey,
  hasMouse,
  createFps,
  VISITOR_SWITCHES,
  visitorsOwnRow,
  picturesSwitch,
  modelsSwitch,
  chatSwitch,
  deskMovingSwitch,
  askDeskMoving
};
