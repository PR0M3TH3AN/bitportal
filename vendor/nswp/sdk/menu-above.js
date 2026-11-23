import {
  helpWords
} from "./shared-EGXGKKYY.js";
import {
  visitorsOwnRow
} from "./shared-L6FYXGUA.js";
import {
  SUMMON_KEY,
  loadPicture
} from "./shared-GK2URPYT.js";
import {
  changeSettings,
  currentSettings,
  framed,
  hearClientMenu,
  sayToClient,
  setSaver,
  sinceHere,
  speakMenu
} from "./shared-YBP57Z2Q.js";
import "./shared-QLSLERQ3.js";

// packages/sdk/src/menu-above.ts
import { LEAVE_MS, MENU_CARD_PICTURE, MENU_KEYS, reportedSettings, MENU_LIMITS, MENU_SAVE_MS, menuSaveType, MENU_VERSION, MENU_VISITOR_TABS, MENU_WAIT_MS, readMenuWordDown } from "@nswp/core";

// packages/sdk/src/menu-keeper.ts
function keepMenu(controls, above, mount) {
  let own = null;
  let chatPane = null;
  let ownComing = null;
  let chatComing = false;
  let hidden = false;
  let gone = false;
  const chatIfNeeded = () => {
    if (gone || !above.has || own || chatPane || chatComing) return;
    const now = controls.view();
    if (!now.chat.ready && !now.feed.ready && !now.letters.ready) return;
    chatComing = true;
    void Promise.resolve(mount("chat")).then(
      (pane) => {
        chatComing = false;
        if (gone || !above.has || own || chatPane) return pane.remove();
        chatPane = pane;
        if (hidden) pane.setHidden(true);
      },
      () => chatComing = false
    );
  };
  const settle = () => {
    if (gone) return Promise.resolve();
    if (above.has) {
      own?.remove();
      own = null;
      chatIfNeeded();
      return Promise.resolve();
    }
    chatPane?.remove();
    chatPane = null;
    if (own) return Promise.resolve();
    ownComing ??= Promise.resolve(mount()).then(
      (menu) => {
        ownComing = null;
        if (gone || above.has || own) menu.remove();
        else {
          own = menu;
          if (hidden) menu.setHidden(true);
        }
        return settle();
      },
      () => void (ownComing = null)
    );
    return ownComing;
  };
  const stopView = controls.subscribe(chatIfNeeded);
  const stopSignals = controls.onSignal((name) => {
    if ((name === "chatOpen" || name === "feedOpen") && above.has && above.menu.open) above.menu.setOpen(false);
  });
  const stopChange = above.onChange(() => void settle());
  const ready = above.ready.then(() => settle());
  return {
    get open() {
      return own ? own.open : above.menu.open;
    },
    setOpen(open, at) {
      if (own) own.setOpen(open, at);
      else above.menu.setOpen(open);
    },
    setHidden(next) {
      hidden = next;
      own?.setHidden(next);
      chatPane?.setHidden(next);
    },
    get own() {
      return own;
    },
    get chatPane() {
      return !!chatPane;
    },
    ready,
    remove() {
      gone = true;
      stopView();
      stopSignals();
      stopChange();
      own?.remove();
      chatPane?.remove();
      own = null;
      chatPane = null;
    }
  };
}

// packages/sdk/src/menu-above.ts
speakMenu(MENU_VERSION);
async function bitmapOf(from) {
  if (typeof createImageBitmap !== "function") return null;
  const source = typeof from === "string" ? await loadPicture(from) : from;
  if (!source) return null;
  const size = source;
  const w = size.videoWidth || size.naturalWidth || (typeof size.width === "number" ? size.width : 0);
  const h = size.videoHeight || size.naturalHeight || (typeof size.height === "number" ? size.height : 0);
  if (!w || !h) return null;
  const k = Math.min(1, MENU_LIMITS.picture / Math.max(w, h));
  try {
    return await createImageBitmap(source, { resizeWidth: Math.max(1, Math.round(w * k)), resizeHeight: Math.max(1, Math.round(h * k)), resizeQuality: "medium" });
  } catch {
    return null;
  }
}
var CLIENTS = [
  ...MENU_VISITOR_TABS.filter((t) => t !== "following" && t !== "messages"),
  // The kit's one-time questions on how a visitor moves (fps.ts, input.ts). At a desk it is asked by whoever draws
  // the console, which above a world is the client; in a headset the world draws the console, and asks there.
  "how-you-move-desk",
  "how-you-move"
];
var VISITORS_ROWS = ["back", "home", "go-home", "doors", "list"];
var COLOR = /^#[0-9a-f]{6}$/;
var EVERY_MS = 125;
var rowOf = (item, onBar) => ({
  id: item.id,
  label: item.label,
  ...item.short && item.short !== item.label ? { short: item.short } : {},
  ...item.icon ? { icon: item.icon } : {},
  kind: item.kind,
  ...item.on === null ? {} : { on: item.on },
  ...item.tone === "normal" ? {} : { tone: item.tone },
  ...COLOR.test(item.color) ? { color: item.color } : {},
  ...item.mark ? { mark: item.mark } : {},
  ...item.faint ? { faint: true } : {},
  ...onBar ? { bar: true } : {},
  ...item.kind === "copy" ? { copy: item.copy ?? "" } : {},
  ...item.kind === "file" ? { accept: [...item.accept ?? []] } : {}
});
var cardOf = (card) => ({
  title: card.title,
  ...card.tag ? { tag: card.tag } : {},
  ...card.proven ? { proven: true } : {},
  ...card.sub ? { sub: card.sub } : {},
  ...card.copy ? { copy: card.copy } : {},
  ...card.text ? { text: card.text.slice(0, MENU_LIMITS.note) } : {},
  ...COLOR.test(card.color) ? { color: card.color } : {},
  ...card.now.length ? { now: card.now } : {},
  ...card.acts?.length ? { acts: card.acts } : {}
});
function describeWorld(view, state = {}, help = "", own = false) {
  const onBar = new Set(view.hotbar.map((i) => i.id));
  const leftOut = own ? CLIENTS.filter((id) => !MENU_VISITOR_TABS.includes(id)) : CLIENTS;
  const kits = (id) => visitorsOwnRow(id) || own && id.startsWith("look-");
  const about = help.trim().length <= MENU_LIMITS.note ? help.trim() : "";
  return {
    title: view.title.slice(0, MENU_LIMITS.title),
    level: view.presence,
    corner: view.corner,
    // A world that has taken every key says so, and the client leaves the digits alone.
    keys: view.keys.hotbar || view.keys.menu !== null,
    state,
    target: view.target ? [view.target, ...view.detail].slice(0, 6) : [],
    loading: view.loading,
    sections: view.sections.filter((s) => !leftOut.includes(s.id)).map((s) => ({
      id: s.id,
      label: s.label,
      ...s.icon ? { icon: s.icon } : {},
      ...s.id === "help" ? about ? { note: about } : {} : s.note ? { note: s.note } : {},
      ...s.card ? { card: cardOf(s.card) } : {},
      // Not the way home, and not a switch that changes one of the visitor's travelling settings: those are the
      // client's own rows, which it draws itself inside this tab.
      // Not the visitor's own rows, and not a bar that is moved along: no word of these carries one.
      rows: s.items.filter((i) => !(s.id === "travel" && !own && VISITORS_ROWS.includes(i.id)) && !kits(i.id) && i.kind !== "slider").map((i) => rowOf(i, onBar.has(i.id)))
    })).filter((s) => s.rows.length > 0 || s.card || s.id === "help" && about)
  };
}
var nameless = (file) => typeof file.name === "string" ? file.slice(0, file.size, file.type) : file;
var rowsOf = (world) => new Map(world.sections.flatMap((s) => s.rows.map((r) => [r.id, { kind: r.kind, accept: r.accept ?? [] }])));
function portAbove(controls, opts = {}) {
  const above = opts.above ?? { framed, sinceHere, say: sayToClient, hear: hearClientMenu };
  const keys = opts.keys ?? (typeof window === "undefined" ? null : window);
  const watchers = /* @__PURE__ */ new Set();
  let has = false;
  let known = false;
  let settle = () => {
  };
  const ready = new Promise((resolve) => settle = resolve);
  const know = () => {
    if (known) return;
    known = true;
    settle(has);
  };
  if (!above.framed()) {
    know();
    return { ready, has: false, onChange: () => () => {
    }, menu: { open: false, setOpen: () => {
    } }, dispose: () => {
    } };
  }
  let named = /* @__PURE__ */ new Map();
  const makePicture = opts.picture ?? bitmapOf;
  const made = /* @__PURE__ */ new Map();
  const want = (key, from) => {
    if (!from || made.get(key) === from) return;
    made.set(key, from);
    void makePicture(from).then(
      (picture) => {
        if (picture && has && open && made.get(key) === from) above.say({ picture, id: key });
      },
      () => {
      }
    );
  };
  const picturesOf = (view) => {
    if (!open) return;
    for (const s of view.sections) {
      if (CLIENTS.includes(s.id)) continue;
      if (s.card?.picture) want(`${MENU_CARD_PICTURE}${s.id}`, s.card.picture);
      for (const i of s.items) if (i.picture && named.has(i.id)) want(i.id, i.picture());
    }
  };
  let last = "";
  let lastAt = -Infinity;
  let waiting = null;
  const describe = () => {
    waiting = null;
    if (!has) return;
    const view = controls.view();
    const world = describeWorld(view, opts.state?.(), opts.help?.() ?? "", opts.own === true);
    const text = JSON.stringify(world);
    if (text !== last) {
      last = text;
      lastAt = performance.now();
      named = rowsOf(world);
      above.say({ world });
    }
    picturesOf(view);
    reportBack();
  };
  const changed = () => {
    if (!has || waiting) return;
    const wait = EVERY_MS - (performance.now() - lastAt);
    if (wait <= 0) describe();
    else waiting = setTimeout(describe, wait);
  };
  let presenting = false;
  let reported = "";
  let taking = false;
  const comfortNow = () => JSON.stringify(reportedSettings(currentSettings()));
  const reportBack = () => {
    if (taking) return;
    const now = opts.state?.().headset?.presenting === true;
    if (now !== presenting) {
      presenting = now;
      reported = comfortNow();
      return;
    }
    if (!has || !presenting) return;
    const comfort = comfortNow();
    if (comfort === reported) return;
    reported = comfort;
    above.say({ settings: JSON.parse(comfort) });
  };
  const takeSettings = (settings) => {
    taking = true;
    try {
      changeSettings(settings);
    } finally {
      taking = false;
    }
    reported = comfortNow();
  };
  const stopView = controls.subscribe(changed);
  const tick = setInterval(changed, 400);
  const stopSay = controls.onSay((text) => {
    if (has && text) above.say({ say: text.slice(0, MENU_LIMITS.say) });
  });
  const setHas = (next) => {
    if (next === has) return know();
    has = next;
    last = "";
    open = false;
    if (has) describe();
    else {
      if (waiting) clearTimeout(waiting);
      waiting = null;
      named = /* @__PURE__ */ new Map();
      saving = null;
    }
    know();
    for (const fn of [...watchers]) fn(has);
  };
  let saving = null;
  const awaited = () => !!saving && saving.left > 0 && performance.now() < saving.until;
  setSaver({
    handUp(file) {
      if (!has || !awaited() || !menuSaveType(file.type) || file.size < 1 || file.size > MENU_LIMITS.save) return false;
      saving.left--;
      above.say({ save: file, id: saving.id });
      return true;
    },
    waits: () => has && !awaited()
  });
  let leaving = null;
  let open = false;
  above.hear((data) => {
    const word = readMenuWordDown(data);
    if (!word) return;
    if (word.what === "has") {
      if (word.has) takeSettings(word.settings);
      return setHas(word.has);
    }
    if (!has) return;
    if (word.what === "settings") return void takeSettings(word.settings);
    if (word.what === "press") {
      const row = named.get(word.press);
      if (!row) return;
      if (word.file) return void (row.kind === "file" && row.accept.includes(word.kind) && controls.run(word.press, void 0, word.name ? word.file : nameless(word.file)));
      if (row.kind === "save") saving = { id: word.press, until: performance.now() + MENU_SAVE_MS, left: MENU_LIMITS.saves };
      return void controls.run(word.press, word.field);
    }
    if (word.what === "open") {
      if (word.open === open) return;
      open = word.open;
      made.clear();
      controls.signal(open ? "menuOpen" : "menuClose");
      if (open) changed();
      return;
    }
    if (word.what === "sign") return void opts.signOut?.();
    if (word.what === "go" && !leaving) {
      opts.home?.();
      leaving = setTimeout(() => leaving = null, LEAVE_MS);
    }
  });
  const tell = (key) => above.say({ key });
  const typing = (e) => {
    const at = e.composedPath?.()[0];
    return !!at && (at.tagName === "INPUT" || at.tagName === "TEXTAREA" || at.isContentEditable === true);
  };
  const onKey = (e) => {
    if (!has || e.ctrlKey || e.metaKey || e.altKey || typing(e)) return;
    if (e.code === SUMMON_KEY) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!e.repeat) tell("summon");
      return;
    }
    if (e.repeat) return;
    if (e.key === "Escape") return tell("escape");
    const view = controls.view();
    if (view.presence !== "hidden" && view.keys.menu && e.key.toLowerCase() === view.keys.menu) return tell("menu");
    if (view.keys.hotbar && view.presence === "full" && MENU_KEYS.includes(e.key) && /^[1-9]$/.test(e.key)) tell(e.key);
  };
  const swallow = (e) => {
    if (has && e.code === SUMMON_KEY && !e.ctrlKey && !e.metaKey && !e.altKey) e.stopImmediatePropagation();
  };
  const listening = { capture: true };
  keys?.addEventListener("keydown", onKey, listening);
  keys?.addEventListener("keyup", swallow, listening);
  const since = above.sinceHere();
  const left = since === null ? MENU_WAIT_MS : MENU_WAIT_MS - since;
  const giveUp = left <= 0 ? (know(), null) : setTimeout(know, left);
  return {
    ready,
    get has() {
      return has;
    },
    onChange(fn) {
      watchers.add(fn);
      return () => void watchers.delete(fn);
    },
    menu: {
      get open() {
        return has && open;
      },
      setOpen(next) {
        if (has && next !== open) tell("summon");
      }
    },
    dispose() {
      if (giveUp) clearTimeout(giveUp);
      if (waiting) clearTimeout(waiting);
      clearInterval(tick);
      if (leaving) clearTimeout(leaving);
      stopView();
      stopSay();
      above.hear(null);
      setSaver(null);
      keys?.removeEventListener("keydown", onKey, listening);
      keys?.removeEventListener("keyup", swallow, listening);
      watchers.clear();
      know();
    }
  };
}
export {
  describeWorld,
  helpWords,
  keepMenu,
  portAbove
};
