// ../Nostr-Spatial-Web-Protocol--NSWP-/packages/sdk/src/keys.ts
var chars = (row) => [...row].map((c) => ({ id: c, label: c, kind: "char", w: 1 }));
var key = (id, label, kind, w) => ({ id, label, kind, w });
function keyRows(layer, o = {}) {
  const bottom = [key("layer", layer === "letters" ? "123" : "ABC", "layer", 1.5), ...chars(","), key("space", "space", "space", 4.5), ...chars("."), key("enter", o.multiline ? "new line" : "done", "enter", 2)];
  const actions = [key("cancel", "Cancel", "cancel", 3), ...o.system ? [key("system", "Headset's keyboard", "system", 4)] : [], key("done", "Done", "done", 3)];
  if (layer === "letters") return [chars("qwertyuiop"), chars("asdfghjkl"), [key("shift", "shift", "shift", 1.5), ...chars("zxcvbnm"), key("back", "delete", "back", 1.5)], bottom, actions];
  return [chars("1234567890"), chars("-/:;()!?@"), [...chars(`'"_&#+=*`), key("back", "delete", "back", 2)], bottom, actions];
}
function placeKeys(layer, o = {}, rows = keyRows(layer, o)) {
  const gap = 0.012;
  const height = 1 / rows.length;
  return rows.flatMap((row, r) => {
    const total = row.reduce((sum, k) => sum + k.w, 0);
    const spread = r === rows.length - 1;
    const unit = spread ? 1 / total : 1 / 10;
    let x = spread ? 0 : (1 - total * unit) / 2;
    return row.map((k) => {
      const placed = { ...k, x: x + gap / 2, y: r * height + gap / 2, width: k.w * unit - gap, height: height - gap };
      x += k.w * unit;
      return placed;
    });
  });
}
function keyAt(keys, x, y) {
  return keys.find((k) => x >= k.x && x <= k.x + k.width && y >= k.y && y <= k.y + k.height) ?? null;
}
var TextEntry = class {
  value;
  shift;
  layer = "letters";
  multiline;
  maxLength;
  constructor(o = {}) {
    this.multiline = o.multiline ?? false;
    this.maxLength = o.maxLength ?? 2e3;
    this.value = [...o.value ?? ""].slice(0, this.maxLength).join("");
    this.shift = this.startsSentence() ? "once" : "off";
  }
  /** Whether the next letter begins a sentence, and so is a capital unless the visitor says otherwise. */
  startsSentence() {
    return /(^|[.!?]\s|\n)$/.test(this.value);
  }
  /** Add text as it is: from a real keyboard, or pasted. */
  type(text) {
    const clean = this.multiline ? text.replace(/\r/g, "") : text.replace(/[\r\n]+/g, " ");
    this.value = [...this.value + clean].slice(0, this.maxLength).join("");
    if (this.shift !== "lock") this.shift = this.startsSentence() ? "once" : "off";
  }
  erase() {
    this.value = [...this.value].slice(0, -1).join("");
    if (this.shift !== "lock") this.shift = this.startsSentence() ? "once" : "off";
  }
  /** What a key shows now: a letter as a capital while shift is on. */
  label(k) {
    return k.kind === "char" && this.shift !== "off" ? k.label.toUpperCase() : k.label;
  }
  /** Press a key by its id. Returns what happened: still typing, finished, given up, or asked for the headset's own keyboard. */
  press(id, keys = keyRows(this.layer, { multiline: this.multiline, system: true }).flat()) {
    const k = keys.find((x) => x.id === id);
    if (!k) return "typing";
    switch (k.kind) {
      case "char": {
        const was = this.shift;
        this.type(was === "off" ? k.id : k.id.toUpperCase());
        if (was === "once") this.shift = this.startsSentence() ? "once" : "off";
        return "typing";
      }
      case "space":
        this.type(" ");
        return "typing";
      case "back":
        this.erase();
        return "typing";
      case "shift":
        this.shift = this.shift === "off" ? "once" : this.shift === "once" ? "lock" : "off";
        return "typing";
      case "layer":
        this.layer = this.layer === "letters" ? "symbols" : "letters";
        return "typing";
      case "enter":
        if (!this.multiline) return "done";
        this.type("\n");
        return "typing";
      case "done":
        return "done";
      case "cancel":
        return "cancel";
      case "system":
        return "system";
      default:
        return "typing";
    }
  }
};

// ../Nostr-Spatial-Web-Protocol--NSWP-/packages/sdk/src/term-keys.ts
var ESC = "\x1B";
function ctrlCode(ch) {
  if (/^[a-zA-Z]$/.test(ch)) return String.fromCharCode(ch.toUpperCase().charCodeAt(0) - 64);
  const others = { "@": 0, " ": 0, "[": 27, "\\": 28, "]": 29, "^": 30, _: 31, "?": 127 };
  return ch in others ? String.fromCharCode(others[ch]) : ch;
}
var NAMED = {
  Enter: "\r",
  Backspace: "\x7F",
  Tab: "	",
  Escape: ESC,
  ArrowUp: `${ESC}[A`,
  ArrowDown: `${ESC}[B`,
  ArrowRight: `${ESC}[C`,
  ArrowLeft: `${ESC}[D`,
  Home: `${ESC}[H`,
  End: `${ESC}[F`,
  Insert: `${ESC}[2~`,
  Delete: `${ESC}[3~`,
  PageUp: `${ESC}[5~`,
  PageDown: `${ESC}[6~`,
  F1: `${ESC}OP`,
  F2: `${ESC}OQ`,
  F3: `${ESC}OR`,
  F4: `${ESC}OS`
};
function keyBytes(e) {
  if (e.metaKey) return null;
  if (e.ctrlKey && e.shiftKey && /^[cv]$/i.test(e.key)) return null;
  if (e.ctrlKey && !e.altKey && /^v$/i.test(e.key)) return null;
  if (e.key === "Tab" && e.shiftKey) return `${ESC}[Z`;
  const named = NAMED[e.key];
  if (named !== void 0) return e.altKey ? ESC + named : named;
  if ([...e.key].length !== 1) return null;
  const ch = e.ctrlKey ? ctrlCode(e.key) : e.key;
  return e.altKey ? ESC + ch : ch;
}
function forApplication(bytes, applicationCursor) {
  return applicationCursor ? bytes.replace(/^\x1b\[([ABCDHF])$/, `${ESC}O$1`) : bytes;
}
function pasteBytes(text, bracketed) {
  const clean = text.replace(/\r?\n/g, "\r");
  return bracketed ? `${ESC}[200~${clean.replace(/\x1b\[20[01]~/g, "")}${ESC}[201~` : clean;
}
var chars2 = (row) => [...row].map((c) => ({ id: c, label: c, kind: "char", w: 1 }));
var key2 = (id, label, kind, w) => ({ id, label, kind, w });
function liveRows(layer) {
  const top = [key2("esc", "esc", "esc", 1.4), key2("tab", "tab", "tab", 1.4), key2("ctrl", "ctrl", "ctrl", 1.4), key2("left", "\u2190", "left", 1), key2("down", "\u2193", "down", 1), key2("up", "\u2191", "up", 1), key2("right", "\u2192", "right", 1), ...chars2("/-").map((k, i) => ({ ...k, w: i ? 0.8 : 1 }))];
  const next = layer === "letters" ? "123" : layer === "symbols" ? "#+=" : "abc";
  const bottom = [key2("layer", next, "layer", 1.5), ...chars2(","), key2("space", "space", "space", 4.5), ...chars2("."), key2("enter", "enter", "enter", 2)];
  const away = [key2("close", "Put the keyboard away", "close", 10)];
  if (layer === "letters") return [top, ...keyRows("letters").slice(0, 3), bottom, away];
  if (layer === "symbols") return [top, chars2("1234567890"), chars2(`:;()$&@"'_`), [...chars2("|~<>{}[]\\"), key2("back", "del", "back", 1)], bottom, away];
  const pages = [key2("pgup", "page up", "pgup", 2.5), key2("pgdn", "page down", "pgdn", 2.5), key2("home", "home", "home", 1.5), key2("end", "end", "end", 1.5), key2("back", "delete", "back", 2)];
  return [top, chars2("!?`#+=*%^"), pages, bottom, away];
}
function placeLiveKeys(layer) {
  return placeKeys("letters", {}, liveRows(layer));
}
var LiveKeys = class {
  shift = "off";
  /** Ctrl is pressed first, then the letter: there is one pointer, not ten fingers. */
  ctrl = false;
  layer = "letters";
  /** Whether a key should be drawn lit. */
  lit(k) {
    return k.kind === "shift" && this.shift !== "off" || k.kind === "ctrl" && this.ctrl;
  }
  label(k) {
    return k.kind === "char" && this.shift !== "off" ? k.label.toUpperCase() : k.label;
  }
  press(id, keys = liveRows(this.layer).flat()) {
    const k = keys.find((x) => x.id === id);
    if (!k) return null;
    const send = (bytes) => {
      const out = this.ctrl ? ctrlCode(bytes) : bytes;
      this.ctrl = false;
      return { send: out };
    };
    switch (k.kind) {
      case "char": {
        const ch = this.shift === "off" ? k.id : k.id.toUpperCase();
        if (this.shift === "once") this.shift = "off";
        return send(ch);
      }
      case "space":
        return send(" ");
      case "enter":
        return send("\r");
      case "back":
        return send("\x7F");
      case "tab":
        return send("	");
      case "esc":
        return send(ESC);
      case "up":
        return send(`${ESC}[A`);
      case "down":
        return send(`${ESC}[B`);
      case "right":
        return send(`${ESC}[C`);
      case "left":
        return send(`${ESC}[D`);
      case "pgup":
        return send(`${ESC}[5~`);
      case "pgdn":
        return send(`${ESC}[6~`);
      case "home":
        return send(`${ESC}[H`);
      case "end":
        return send(`${ESC}[F`);
      case "shift":
        this.shift = this.shift === "off" ? "once" : this.shift === "once" ? "lock" : "off";
        return null;
      case "ctrl":
        this.ctrl = !this.ctrl;
        return null;
      case "layer":
        this.layer = this.layer === "letters" ? "symbols" : this.layer === "symbols" ? "more" : "letters";
        return null;
      case "close":
        return { close: true };
      default:
        return null;
    }
  }
};

export {
  placeKeys,
  keyAt,
  TextEntry,
  keyBytes,
  forApplication,
  pasteBytes,
  placeLiveKeys,
  LiveKeys
};
