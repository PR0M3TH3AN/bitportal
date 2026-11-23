import {
  arrivedSettings,
  handUp,
  reportSettings
} from "./shared-KUNAPS23.js";

// packages/sdk/src/sound-store.ts
var CUES = [
  "step",
  // a footstep, walking
  "land",
  // arriving at the end of a jump: a step in a headset, or one taken at once
  "bump",
  // walking into something that can't be walked through
  "grab",
  "drop",
  "hover",
  "press",
  "menuOpen",
  "menuClose",
  "cross",
  // leaving through a door
  "arrive",
  // coming out of one
  "join",
  // someone is in the room who wasn't: the visitor, or another person
  "leave",
  "micOn",
  "micOff",
  "notice",
  // the kit has something to say
  "chat",
  // someone in the room wrote something: heard from where they stand
  "error"
];
var tone = (from, to, at, dur, gain, wave = "sine") => ({
  kind: "tone",
  wave,
  from,
  ...to === void 0 ? {} : { to },
  at,
  dur,
  gain
});
var noise = (band, at, dur, gain) => ({ kind: "noise", band, at, dur, gain });
var RECIPES = {
  step: [noise(850, 0, 0.06, 0.2), tone(120, 70, 0, 0.07, 0.16)],
  land: [tone(190, 62, 0, 0.16, 0.3), noise(480, 0, 0.11, 0.2)],
  bump: [tone(96, 58, 0, 0.12, 0.28, "triangle"), noise(260, 0, 0.05, 0.14)],
  grab: [tone(520, 780, 0, 0.07, 0.16, "triangle")],
  drop: [tone(700, 420, 0, 0.08, 0.16, "triangle")],
  hover: [tone(1400, void 0, 0, 0.025, 0.05)],
  press: [tone(880, 1320, 0, 0.05, 0.15, "triangle")],
  menuOpen: [tone(660, void 0, 0, 0.05, 0.12), tone(990, void 0, 0.05, 0.07, 0.12)],
  menuClose: [tone(990, void 0, 0, 0.05, 0.12), tone(660, void 0, 0.05, 0.07, 0.12)],
  cross: [tone(196, 784, 0, 0.5, 0.22), noise(1400, 0.05, 0.45, 0.07), tone(392, 1568, 0.1, 0.4, 0.08)],
  arrive: [tone(784, 392, 0, 0.42, 0.2), tone(1176, 588, 0.04, 0.38, 0.08), noise(900, 0, 0.2, 0.05)],
  join: [tone(523.25, void 0, 0, 0.09, 0.14), tone(783.99, void 0, 0.09, 0.14, 0.14)],
  leave: [tone(783.99, void 0, 0, 0.09, 0.12), tone(523.25, void 0, 0.09, 0.14, 0.12)],
  micOn: [tone(600, 900, 0, 0.08, 0.14)],
  micOff: [tone(900, 600, 0, 0.08, 0.14)],
  notice: [tone(1046.5, void 0, 0, 0.08, 0.09), tone(1318.5, void 0, 0.08, 0.12, 0.08)],
  // Two soft syllables, low and falling at the end, with a breath in front: somebody said something. It is two
  // octaves under the kit's own notice, which is high, clean and rises, so the two are never taken for each other.
  chat: [noise(1900, 0, 0.03, 0.06), tone(360, 440, 5e-3, 0.07, 0.15, "triangle"), tone(330, 262, 0.1, 0.11, 0.13, "triangle")],
  error: [tone(220, void 0, 0, 0.11, 0.13, "square"), tone(185, void 0, 0.14, 0.14, 0.13, "square")]
};
function cueRecipe(cue) {
  return RECIPES[cue];
}
var SOUND_LIMITS = {
  /** A world's own cue: a file this size at most, this long at most. Longer ones aren't sounds for something that happened. */
  cueBytes: 512 * 1024,
  cueSeconds: 3,
  /** Kinds of file a world may name. */
  extensions: ["ogg", "oga", "opus", "mp3", "m4a", "aac", "wav", "webm", "flac"],
  /** Files for one cue: one is chosen each time, so a sound heard often isn't the same sound every time. */
  variants: 6,
  /** Pieces of music for one place: they play in turn. */
  tracks: 8,
  /** The visitor's own songs: this many, each this size at most. */
  songs: 60,
  songBytes: 40 * 1024 * 1024,
  titleChars: 80
};
function ownSound(address, base) {
  if (typeof address !== "string" || address.length > 2e3) return null;
  let u;
  let b;
  try {
    b = new URL(base);
    u = new URL(address, b);
  } catch {
    return null;
  }
  if (u.origin !== b.origin || u.protocol !== "https:" && u.protocol !== "http:") return null;
  const ext = u.pathname.split(".").pop()?.toLowerCase() ?? "";
  if (!SOUND_LIMITS.extensions.includes(ext)) return null;
  u.hash = "";
  return u.href;
}
function ownSounds(value, base, limit) {
  const out = [];
  for (const v of Array.isArray(value) ? value : [value]) {
    const address = ownSound(v, base);
    if (address && !out.includes(address)) out.push(address);
    if (out.length >= limit) break;
  }
  return out;
}
function cleanTheme(input, base) {
  const out = { cues: {} };
  if (!input || typeof input !== "object") return out;
  const { cues, music, hum } = input;
  if (cues && typeof cues === "object") {
    for (const cue of CUES) {
      const v = cues[cue];
      if (v === null) out.cues[cue] = null;
      else if (v !== void 0) {
        const files2 = ownSounds(v, base, SOUND_LIMITS.variants);
        if (files2.length) out.cues[cue] = files2;
      }
    }
  }
  if (music === null) out.music = null;
  else if (music !== void 0) {
    const tracks = ownSounds(music, base, SOUND_LIMITS.tracks);
    if (tracks.length) out.music = tracks;
  }
  if (hum === null) out.hum = null;
  else if (hum !== void 0) {
    const address = ownSound(hum, base);
    if (address) out.hum = address;
  }
  return out;
}
function cleanKit(input, folder, playsOgg) {
  const out = { cues: {} };
  if (!input || typeof input !== "object") return out;
  const pick = (entry) => {
    if (!entry || typeof entry !== "object") return entry;
    const { ogg, mp3 } = entry;
    return playsOgg ? ogg ?? mp3 : mp3 ?? ogg;
  };
  const many = (value, limit) => ownSounds((Array.isArray(value) ? value : [value]).map(pick), folder, limit);
  const { cues, music, hum } = input;
  if (cues && typeof cues === "object") {
    for (const cue of CUES) {
      const files2 = many(cues[cue], SOUND_LIMITS.variants);
      if (files2.length) out.cues[cue] = files2;
    }
  }
  const tracks = many(music, SOUND_LIMITS.tracks);
  if (tracks.length) out.music = tracks;
  const h = ownSound(pick(hum), folder);
  if (h) out.hum = h;
  return out;
}
function pieceName(address) {
  let name = address;
  try {
    name = decodeURIComponent(new URL(address, "https://x.invalid/").pathname.split("/").pop() ?? "");
  } catch {
    name = address.split(/[/?#]/).filter(Boolean).pop() ?? "";
  }
  name = name.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[\u0000-\u001f]/g, "").trim();
  return name.slice(0, 60) || "a piece with no name";
}
var STEP_LEVEL = 0.45;
var JUMP_STEPS = { louder: 1.35, gap: 0.09 };
var STRIDE = 0.75;
var HEARD = { near: 2, far: 25, floor: 0.14, fall: 6 };
function heardFrom(place) {
  const d = Number.isFinite(place.distance) ? Math.max(0, place.distance) : HEARD.far;
  const beyond = Math.max(0, d - HEARD.near);
  const gain = Math.max(HEARD.floor, 1 / (1 + (beyond / HEARD.fall) ** 2));
  const along = Math.min(1, beyond / (HEARD.far - HEARD.near));
  const cutoff = Math.round(7e3 * (1100 / 7e3) ** along);
  const side = Number.isFinite(place.pan) ? Math.max(-1, Math.min(1, place.pan)) : 0;
  return { gain: Math.round(gain * 1e3) / 1e3, cutoff, pan: Math.round(side * 0.8 * 100) / 100, rate: 1 };
}
function stepShape(foot, random = Math.random) {
  const right = Math.abs(Math.trunc(foot)) % 2 === 1;
  const side = right ? 1 : -1;
  return {
    // Between a little over half and all of the step's level: a light tread now and then.
    gain: STEP_LEVEL * (0.6 + 0.4 * random()),
    // One foot falls a touch lower than the other, and each step is up to a semitone and a half either way.
    rate: (1 + side * 0.025) * Math.pow(2, (random() * 2 - 1) * (1.5 / 12)),
    cutoff: 1600 + random() * 3400,
    pan: side * (0.08 + random() * 0.1)
  };
}
function nextVariant(count, last, random = Math.random) {
  if (count <= 1) return 0;
  if (last < 0 || last >= count) return Math.min(count - 1, Math.floor(random() * count));
  const i = Math.floor(random() * (count - 1));
  return i >= last ? i + 1 : i;
}
var DEFAULT_LEVELS = { off: false, effects: 0.7, music: 0.45, voices: 1, hearShared: false, shared: 0.7, hum: true };
var LEVEL_STEPS = [0, 0.35, 0.7, 1];
var LEVEL_WORDS = ["off", "low", "medium", "high"];
var unit = (v, fallback) => typeof v === "number" && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback;
function cleanLevels(input) {
  const i = input && typeof input === "object" ? input : {};
  return {
    off: i.off === true,
    effects: unit(i.effects, DEFAULT_LEVELS.effects),
    music: unit(i.music, DEFAULT_LEVELS.music),
    voices: unit(i.voices, DEFAULT_LEVELS.voices),
    hearShared: i.hearShared === true,
    shared: unit(i.shared, DEFAULT_LEVELS.shared),
    hum: i.hum !== false
  };
}
function levelStep(v) {
  let best = 0;
  LEVEL_STEPS.forEach((s, i) => {
    if (Math.abs(s - v) < Math.abs(LEVEL_STEPS[best] - v)) best = i;
  });
  return best;
}
function nextLevel(v) {
  return LEVEL_STEPS[(levelStep(v) + 1) % LEVEL_STEPS.length];
}
var MUSIC_RANGE = 12;
var MUSIC_SOURCES = 2;
var MUSIC_DUCK = 0.35;
function musicToHear(sharing, hear) {
  if (!hear) return [];
  return sharing.filter((s) => !s.refused && Number.isFinite(s.metres) && s.metres <= MUSIC_RANGE).sort((a, b) => a.metres - b.metres || a.pubkey.localeCompare(b.pubkey)).slice(0, MUSIC_SOURCES).map((s) => s.pubkey);
}
function musicFade(metres) {
  if (!(metres >= 0)) return 0;
  const near = 2;
  if (metres <= near) return 1;
  if (metres >= MUSIC_RANGE) return 0;
  const t = (metres - near) / (MUSIC_RANGE - near);
  return (1 - t) * (1 - t);
}
function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a = a + 1831565813 >>> 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var ROOTS = [98, 110, 116.54, 130.81, 146.83, 155.56];
var SCALES = [
  [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3],
  // major pentatonic: open, bright
  [1, 6 / 5, 4 / 3, 3 / 2, 9 / 5],
  // minor pentatonic: darker
  [1, 9 / 8, 4 / 3, 3 / 2, 16 / 9],
  // suspended: unresolved, still
  [1, 5 / 4, 3 / 2, 15 / 8, 9 / 4]
  // major seventh: warm
];
function ambiencePlan(seed) {
  const r = seeded(`ambience:${seed}`);
  const root = ROOTS[Math.floor(r() * ROOTS.length)];
  const scale = SCALES[Math.floor(r() * SCALES.length)];
  const fifth = scale.includes(3 / 2) ? 3 / 2 : scale[3];
  const drones = [1, fifth, 2, scale[2] * 2].map((m) => ({ hz: root * m, detune: (r() - 0.5) * 14, swell: 11 + r() * 18 }));
  const least = 3.5 + r() * 3;
  return { root, scale, drones, colour: 500 + r() * 900, gap: [least, least + 3 + r() * 4] };
}
function songTitle(fileName) {
  const raw = typeof fileName === "string" ? fileName : "";
  const cleaned = raw.split(/[\\/]/).pop().replace(/\.[a-z0-9]{1,5}$/i, "").normalize("NFC").replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff]/g, " ").replace(/[_\s]+/g, " ").trim();
  return [...cleaned].slice(0, SOUND_LIMITS.titleChars).join("").trim() || "A song";
}
function cleanSongs(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const s of input) {
    if (!s || typeof s !== "object") continue;
    const { id, title, size, at } = s;
    if (typeof id !== "string" || !/^[a-z0-9-]{4,40}$/.test(id) || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, title: songTitle(title), size: typeof size === "number" && size > 0 ? Math.floor(size) : 0, at: typeof at === "number" && at > 0 ? Math.floor(at) : 0 });
    if (out.length >= SOUND_LIMITS.songs) break;
  }
  return out;
}
function songRefusal(file, have) {
  const ext = (file.name ?? "").split(".").pop()?.toLowerCase() ?? "";
  const isSound = (file.type ?? "").startsWith("audio/") || SOUND_LIMITS.extensions.includes(ext);
  if (!isSound) return "That isn't a sound file.";
  if (!file.size) return "That file is empty.";
  if (file.size > SOUND_LIMITS.songBytes) return `That file is over ${Math.round(SOUND_LIMITS.songBytes / 1024 / 1024)} MB, which is more than is kept here.`;
  if (have >= SOUND_LIMITS.songs) return `${SOUND_LIMITS.songs} songs are kept here at most. Take one out first.`;
  return null;
}

// packages/sdk/src/panel-store.ts
var PANEL_LOOKS = [
  { name: "Solid", opacity: 1, dark: 1 },
  { name: "Dark parts see-through", opacity: 1, dark: 0.4 },
  { name: "Dark parts clear", opacity: 1, dark: 0.08 },
  { name: "All of it faint", opacity: 0.6, dark: 0.35 }
];
function cleanLook(input) {
  const l = input && typeof input === "object" ? input : {};
  return { opacity: finite(l.opacity) ? clamp(l.opacity, 0.15, 1) : 1, dark: finite(l.dark) ? clamp(l.dark, 0, 1) : 1 };
}
function nextLook(now) {
  const at = PANEL_LOOKS.findIndex((l) => Math.abs(l.opacity - now.opacity) < 0.01 && Math.abs(l.dark - now.dark) < 0.01);
  return PANEL_LOOKS[(at + 1) % PANEL_LOOKS.length];
}
var PANEL_LIMITS = {
  count: 24,
  titleChars: 80,
  noteChars: 4e3,
  srcChars: 2048,
  minWidth: 0.3,
  maxWidth: 3,
  /** A panel is never kept further from the middle of a world than this, in metres. */
  reach: 500,
  /** The largest file of the visitor's own that is kept, in bytes. */
  fileBytes: 64 * 1024 * 1024
};
var ID = /^[a-z0-9-]{4,40}$/;
var finite = (n) => typeof n === "number" && Number.isFinite(n);
var clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
function tidy(text, max, lines = false) {
  if (typeof text !== "string") return "";
  const cleaned = text.replace(lines ? /[\u0000-\u0009\u000b-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff]/g : /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff]/g, " ");
  return [...lines ? cleaned : cleaned.replace(/\s+/g, " ").trim()].slice(0, max).join("");
}
function cleanPlace(input) {
  if (!input || typeof input !== "object") return null;
  const p = input;
  const at = p.position;
  if (!Array.isArray(at) || at.length !== 3 || !at.every(finite) || at.some((n) => Math.abs(n) > PANEL_LIMITS.reach)) return null;
  if (!finite(p.width)) return null;
  return {
    position: [at[0], at[1], at[2]],
    yaw: finite(p.yaw) ? (p.yaw % 360 + 360) % 360 : 0,
    pitch: finite(p.pitch) ? clamp(p.pitch, -60, 60) : 0,
    width: clamp(p.width, PANEL_LIMITS.minWidth, PANEL_LIMITS.maxWidth)
  };
}
function cleanSource(input) {
  if (!input || typeof input !== "object") return null;
  const s = input;
  const title = tidy(s.title, PANEL_LIMITS.titleChars);
  if (s.kind === "note") {
    const text = tidy(s.text, PANEL_LIMITS.noteChars, true);
    return text.trim() || title ? { kind: "note", title, text } : null;
  }
  if (s.kind === "picture" || s.kind === "video") {
    if (typeof s.src !== "string" || s.src.length === 0 || s.src.length > PANEL_LIMITS.srcChars) return null;
    if (!/^(kept:[a-z0-9-]{4,40}|https:\/\/|\/|\.\/|blob:)/.test(s.src)) return null;
    return { kind: s.kind, title, src: s.src };
  }
  return null;
}
function cleanRecords(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const item of input) {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || !ID.test(item.id) || out.some((r) => r.id === item.id)) continue;
    const source = cleanSource(item.source);
    const place = cleanPlace(item.place);
    if (!source || !place || "src" in source && source.src.startsWith("blob:")) continue;
    const look = item.look ? cleanLook(item.look) : null;
    const pin = cleanPin(item.pin);
    out.push({ id: item.id, source, place, ...look && (look.opacity < 1 || look.dark < 1) ? { look } : {}, ...pin ? { pin } : {} });
    if (out.length === PANEL_LIMITS.count) break;
  }
  return out;
}
function cleanPin(input) {
  if (!Array.isArray(input) || input.length !== 3 || !input.every(finite)) return null;
  const z = clamp(input[2], -6, -0.25);
  return [clamp(input[0], -4, 4), clamp(input[1], -2.5, 2.5), z];
}
var turn = (from, to) => ((to - from) % 360 + 540) % 360 - 180;
function tagAlong(now, head, dt, o = {}) {
  const ease = Math.min(1, dt * 5);
  const off = turn(now.yaw, head.yaw);
  const turning = Math.abs(off) > (o.turn ?? 38) || now.turning && Math.abs(off) > 3;
  const [dx, dy, dz] = [head.position[0] - now.position[0], head.position[1] - now.position[1], head.position[2] - now.position[2]];
  const far = Math.hypot(dx, dy, dz);
  const moving = far > (o.reach ?? 0.4) || now.moving && far > 0.03;
  return {
    yaw: turning ? ((now.yaw + off * ease) % 360 + 360) % 360 : now.yaw,
    position: moving ? [now.position[0] + dx * ease, now.position[1] + dy * ease, now.position[2] + dz * ease] : now.position,
    turning,
    moving
  };
}
function facing(at, head) {
  const [dx, dy, dz] = [head[0] - at[0], head[1] - at[1], head[2] - at[2]];
  const flat = Math.hypot(dx, dz);
  if (flat < 1e-6) return { yaw: 0, pitch: 0 };
  const deg = 180 / Math.PI;
  return { yaw: (Math.atan2(dx, dz) * deg % 360 + 360) % 360, pitch: clamp(-Math.atan2(dy, flat) * deg, -35, 35) };
}
function inFront(head, yawDegrees, already = 0, distance = 1.3) {
  const step = Math.ceil(already % 7 / 2) * 48 * (already % 2 ? -1 : 1);
  const a = (yawDegrees + step) * Math.PI / 180;
  return [head[0] - Math.sin(a) * distance, clamp(head[1] - 0.05, 0.6, 3), head[2] - Math.cos(a) * distance];
}
function newId(random = Math.random) {
  return `p-${Array.from({ length: 10 }, () => Math.floor(random() * 36).toString(36)).join("")}`;
}
function wrapText(text, width, measure, maxLines = 40) {
  const out = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (measure(next) <= width || !line) line = next;
      else {
        out.push(line);
        line = word;
      }
      while (measure(line) > width && line.length > 1) {
        let cut = line.length - 1;
        while (cut > 1 && measure(line.slice(0, cut)) > width) cut--;
        out.push(line.slice(0, cut));
        line = line.slice(cut);
      }
    }
    out.push(line);
    if (out.length > maxLines) break;
  }
  if (out.length > maxLines) {
    out.length = maxLines;
    out[maxLines - 1] = `${out[maxLines - 1].replace(/.$/u, "")}\u2026`;
  }
  return out;
}
var LIBRARY_LIMITS = { count: 60, thumbChars: 6e4 };
function cleanLibrary(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const item of input) {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || !ID.test(item.id) || out.some((x) => x.id === item.id)) continue;
    if (item.kind !== "picture" && item.kind !== "video") continue;
    const thumb = typeof item.thumb === "string" && item.thumb.length <= LIBRARY_LIMITS.thumbChars && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(item.thumb) ? item.thumb : "";
    out.push({ id: item.id, kind: item.kind, title: tidy(item.title, PANEL_LIMITS.titleChars), bytes: finite(item.bytes) && item.bytes >= 0 ? item.bytes : 0, addedAt: finite(item.addedAt) ? item.addedAt : 0, thumb });
  }
  return out.sort((a, b) => b.addedAt - a.addedAt).slice(0, LIBRARY_LIMITS.count);
}
function libraryPage(items, page, perPage) {
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const at = Math.min(pages - 1, Math.max(0, Math.floor(page)));
  return { items: items.slice(at * perPage, (at + 1) * perPage), page: at, pages };
}

// packages/sdk/src/library.ts
import * as THREE from "three";
var DB = "nswp-panels";
function files() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore("files");
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}
async function fileStore(mode, run) {
  try {
    const db = await files();
    return await new Promise((resolve, reject) => {
      const request = run(db.transaction("files", mode).objectStore("files"));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return void 0;
  }
}
async function thumbnail(file, kind) {
  const draw = (source, w, h) => {
    if (!w || !h) return "";
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = Math.max(1, Math.round(240 * h / w));
    canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", 0.7);
    return data.length <= LIBRARY_LIMITS.thumbChars ? data : "";
  };
  try {
    if (kind === "picture") {
      const bitmap = await createImageBitmap(file);
      const data = draw(bitmap, bitmap.width, bitmap.height);
      bitmap.close();
      return data;
    }
    const url = URL.createObjectURL(file);
    try {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.src = url;
      await new Promise((resolve, reject) => {
        video.addEventListener("loadeddata", () => resolve(), { once: true });
        video.addEventListener("error", () => reject(new Error("unreadable")), { once: true });
        setTimeout(() => reject(new Error("slow")), 4e3);
      });
      return draw(video, video.videoWidth, video.videoHeight);
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return "";
  }
}
var W = 1024;
var H = 768;
var COLS = 4;
var ROWS = 2;
var TOP = 96;
var FOOT = 104;
var WIDTH = 1.1;
function createLibrary(o) {
  const accent = `#${new THREE.Color(o.accent ?? 16758364).getHexString()}`;
  const ink = o.textColor ?? "#eef5fb";
  let items = [];
  if (o.keep) {
    try {
      items = cleanLibrary(JSON.parse(localStorage.getItem(`${o.keep}:library`) ?? "[]"));
    } catch {
    }
  }
  const save = () => {
    stale = true;
    o.onChange?.();
    if (!o.keep) return;
    try {
      localStorage.setItem(`${o.keep}:library`, JSON.stringify(items));
    } catch {
    }
  };
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(WIDTH, WIDTH * H / W), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  board.name = "library";
  const group = new THREE.Group();
  group.name = "library";
  group.add(board);
  group.visible = false;
  o.scene.add(group);
  let page = 0;
  let removing = false;
  let aimed = null;
  let stale = true;
  let regions = [];
  const thumbs = /* @__PURE__ */ new Map();
  const thumbOf = (item) => {
    if (!item.thumb) return null;
    let image = thumbs.get(item.id);
    if (!image) {
      image = new Image();
      image.onload = () => stale = true;
      image.src = item.thumb;
      thumbs.set(item.id, image);
    }
    return image.complete && image.naturalWidth ? image : null;
  };
  const paint = () => {
    stale = false;
    regions = [];
    const shown = libraryPage(items, page, COLS * ROWS);
    page = shown.page;
    g.fillStyle = "#0a1018";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#101a26";
    g.fillRect(0, 0, W, TOP);
    g.fillStyle = ink;
    g.textBaseline = "middle";
    g.textAlign = "left";
    g.font = "bold 40px system-ui, sans-serif";
    g.fillText(removing ? "Select one to remove it" : "Your pictures and video", 36, TOP / 2 + 2, W - 200);
    const button = (id, label, x, y, w, h, on = false) => {
      regions.push({ id, x, y, w, h });
      const lit = aimed === id || on;
      g.fillStyle = lit ? accent : "#162231";
      g.beginPath();
      g.roundRect(x, y, w, h, 16);
      g.fill();
      g.fillStyle = lit ? "#04070b" : ink;
      g.textAlign = "center";
      g.font = "bold 30px system-ui, sans-serif";
      g.fillText(label, x + w / 2, y + h / 2 + 2, w - 16);
      g.textAlign = "left";
    };
    button("close", "Close", W - 164, 18, 140, TOP - 36);
    if (shown.items.length === 0) {
      g.fillStyle = ink;
      g.globalAlpha = 0.8;
      g.font = "34px system-ui, sans-serif";
      g.textAlign = "center";
      g.fillText("Nothing here yet.", W / 2, H / 2 - 40);
      g.fillText("Hang a picture or video on a flat screen,", W / 2, H / 2 + 10);
      g.fillText("or take a picture with the camera.", W / 2, H / 2 + 56);
      g.textAlign = "left";
      g.globalAlpha = 1;
    }
    const cellW = (W - 48) / COLS;
    const cellH = (H - TOP - FOOT - 24) / ROWS;
    shown.items.forEach((item, i) => {
      const [x, y] = [24 + i % COLS * cellW + 10, TOP + 12 + Math.floor(i / COLS) * cellH + 8];
      const [w, h] = [cellW - 20, cellH - 16];
      const id = `item:${item.id}`;
      regions.push({ id, x, y, w, h });
      g.fillStyle = aimed === id ? accent : "#162231";
      g.beginPath();
      g.roundRect(x, y, w, h, 14);
      g.fill();
      const image = thumbOf(item);
      const [px, py, pw, ph] = [x + 8, y + 8, w - 16, h - 60];
      g.fillStyle = "#05090e";
      g.fillRect(px, py, pw, ph);
      if (image) {
        const scale = Math.min(pw / image.naturalWidth, ph / image.naturalHeight);
        const [dw, dh] = [image.naturalWidth * scale, image.naturalHeight * scale];
        g.drawImage(image, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
      }
      if (item.kind === "video") {
        g.fillStyle = "rgba(4, 7, 11, 0.7)";
        g.beginPath();
        g.arc(px + pw / 2, py + ph / 2, 30, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = ink;
        g.beginPath();
        g.moveTo(px + pw / 2 - 10, py + ph / 2 - 15);
        g.lineTo(px + pw / 2 + 16, py + ph / 2);
        g.lineTo(px + pw / 2 - 10, py + ph / 2 + 15);
        g.fill();
      }
      g.fillStyle = aimed === id ? "#04070b" : ink;
      g.font = "26px system-ui, sans-serif";
      g.fillText(item.title || (item.kind === "video" ? "A video" : "A picture"), x + 12, y + h - 26, w - 24);
    });
    const fy = H - FOOT + 14;
    if (shown.pages > 1) {
      button("prev", "Earlier", 24, fy, 170, FOOT - 28);
      button("next", "Later", 206, fy, 170, FOOT - 28);
      g.fillStyle = ink;
      g.font = "28px system-ui, sans-serif";
      g.fillText(`${shown.page + 1} of ${shown.pages}`, 400, fy + (FOOT - 28) / 2 + 2);
    }
    if (items.length) button("removing", removing ? "Stop removing" : "Remove one", W - 300, fy, 276, FOOT - 28, removing);
    texture.needsUpdate = true;
  };
  const at = new THREE.Vector3();
  const facing2 = new THREE.Vector3();
  const api = {
    group,
    list: () => items,
    async add(file, name = "") {
      const kind = file.type.startsWith("image/") ? "picture" : file.type.startsWith("video/") ? "video" : null;
      if (!kind || file.size > PANEL_LIMITS.fileBytes || items.length >= LIBRARY_LIMITS.count) return null;
      const id = newId();
      if (await fileStore("readwrite", (s) => s.put(file, id)) === void 0) return null;
      const item = { id, kind, title: name.replace(/\.[a-z0-9]+$/i, "").slice(0, PANEL_LIMITS.titleChars), bytes: file.size, addedAt: Math.floor(Date.now() / 1e3), thumb: await thumbnail(file, kind) };
      items = cleanLibrary([item, ...items]);
      save();
      return items.find((x) => x.id === id) ?? null;
    },
    async remove(id) {
      if (!items.some((x) => x.id === id)) return;
      items = items.filter((x) => x.id !== id);
      thumbs.delete(id);
      await fileStore("readwrite", (s) => s.delete(id));
      save();
    },
    get showing() {
      return group.visible;
    },
    set showing(v) {
      if (v === group.visible) return;
      group.visible = v;
      removing = false;
      aimed = null;
      stale = true;
      if (v) {
        o.camera.getWorldPosition(at);
        o.camera.getWorldDirection(facing2);
        facing2.y = 0;
        if (facing2.lengthSq() < 1e-6) facing2.set(0, 0, -1);
        facing2.normalize();
        group.position.set(at.x + facing2.x * 1.15, Math.max(0.8, at.y - 0.05), at.z + facing2.z * 1.15);
        group.rotation.set(0, Math.atan2(-facing2.x, -facing2.z), 0);
      }
      o.onChange?.();
    },
    pick(raycaster) {
      if (!group.visible) return null;
      const hit = raycaster.intersectObject(board, false)[0];
      if (!hit?.uv) return null;
      const [x, y] = [hit.uv.x * W, (1 - hit.uv.y) * H];
      const r = regions.find((q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h);
      return `lib:${r?.id ?? ""}`;
    },
    aim(hit) {
      const id = hit?.startsWith("lib:") ? hit.slice(4) || null : null;
      if (id === aimed) return;
      aimed = id;
      stale = true;
    },
    press(hit) {
      if (!group.visible || !hit.startsWith("lib:")) return;
      const id = hit.slice(4);
      if (id === "close") api.showing = false;
      else if (id === "prev") page--;
      else if (id === "next") page++;
      else if (id === "removing") removing = !removing;
      else if (id.startsWith("item:")) {
        const item = items.find((x) => x.id === id.slice(5));
        if (item && removing) void api.remove(item.id);
        else if (item) o.onChoose(item);
      }
      stale = true;
    },
    pointOf(hit) {
      const r = hit.startsWith("lib:") ? regions.find((q) => q.id === hit.slice(4)) : null;
      if (!r || !group.visible) return null;
      const height = WIDTH * H / W;
      group.updateMatrixWorld(true);
      return board.localToWorld(new THREE.Vector3(((r.x + r.w / 2) / W - 0.5) * WIDTH, (0.5 - (r.y + r.h / 2) / H) * height, 0));
    },
    info: () => ({ showing: group.visible, page, pages: libraryPage(items, page, COLS * ROWS).pages, removing, cells: regions.map((r) => r.id) }),
    update() {
      if (group.visible && stale) paint();
    },
    dispose() {
      o.scene.remove(group);
      board.geometry.dispose();
      board.material.dispose();
      texture.dispose();
    }
  };
  return api;
}

// packages/sdk/src/sound.ts
var FOREIGN_SOUND = { seconds: 4, peak: 0.7, fades: 25, gone: 45 };
var GAP = { step: 0.14, hover: 0.08, bump: 0.5, land: 0.2, notice: 0.25, chat: 0.3 };
var JUMP = 1.2;
function createSounds(o = {}) {
  const ctx = o.context ?? new AudioContext();
  const base = o.base ?? location.href;
  const theme = cleanTheme(o.theme, base);
  const levelsKey = o.keep?.levels ?? "nswp:sound";
  const songsKey = o.keep?.songs ?? "nswp:jukebox";
  const read = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "null");
    } catch {
      return null;
    }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
    }
  };
  const came = arrivedSettings().sound;
  let levels = cleanLevels({ ...read(levelsKey), ...came });
  let songs = cleanSongs(read(songsKey));
  let disposed = false;
  if (came) write(levelsKey, levels);
  const stopReporting = reportSettings(
    "sound",
    () => ({ sound: { off: levels.off, effects: levels.effects, music: levels.music, voices: levels.voices, hum: levels.hum } }),
    // Their client's menu changed a volume (settings.ts, `changeSettings`): as their own hand on it here would.
    (now) => {
      if (!now.sound || disposed) return;
      levels = cleanLevels({ ...levels, ...now.sound });
      write(levelsKey, levels);
      apply();
      changed();
    }
  );
  const master = ctx.createGain();
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -14;
  limiter.knee.value = 10;
  limiter.ratio.value = 12;
  limiter.attack.value = 3e-3;
  limiter.release.value = 0.25;
  const meter = ctx.createAnalyser();
  meter.fftSize = 1024;
  master.connect(limiter);
  limiter.connect(meter);
  limiter.connect(ctx.destination);
  const effects = ctx.createGain();
  const placeMusic = ctx.createGain();
  const ownMusic = ctx.createGain();
  for (const g of [effects, placeMusic, ownMusic]) g.connect(master);
  const humGain = ctx.createGain();
  humGain.connect(placeMusic);
  const listeners = /* @__PURE__ */ new Set();
  const changed = () => {
    for (const fn of listeners) {
      try {
        fn(levels);
      } catch (err) {
        console.error("nswp-sdk sound listener failed", err);
      }
    }
  };
  const juke = { audio: null, url: "", current: null, playing: false, tap: null };
  const apply = () => {
    const t = ctx.currentTime;
    master.gain.setTargetAtTime(levels.off ? 0 : 1, t, 0.05);
    effects.gain.setTargetAtTime(levels.effects, t, 0.05);
    placeMusic.gain.setTargetAtTime(levels.music * (juke.playing ? 0.1 : 1), t, 0.4);
    ownMusic.gain.setTargetAtTime(levels.music, t, 0.05);
    humGain.gain.setTargetAtTime(levels.hum ? 1 : 0, t, 0.3);
  };
  apply();
  let noiseBuffer = null;
  const noise2 = () => {
    if (noiseBuffer) return noiseBuffer;
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  };
  const playPart = (p, when, to = effects, rate = 1) => {
    const start = when + p.at;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(p.gain, start + Math.min(6e-3, p.dur / 3));
    gain.gain.exponentialRampToValueAtTime(8e-4, start + p.dur);
    gain.connect(to);
    if (p.kind === "tone") {
      const osc = ctx.createOscillator();
      osc.type = p.wave;
      osc.frequency.setValueAtTime(p.from * rate, start);
      if (p.to !== void 0) osc.frequency.exponentialRampToValueAtTime(p.to * rate, start + p.dur);
      osc.connect(gain);
      osc.start(start);
      osc.stop(start + p.dur + 0.02);
    } else {
      const src = ctx.createBufferSource();
      src.buffer = noise2();
      const band = ctx.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = p.band * rate;
      band.Q.value = 1.1;
      src.connect(band);
      band.connect(gain);
      src.start(start, Math.random() * 0.5);
      src.stop(start + p.dur + 0.02);
    }
  };
  const CUE_LOUDNESS = 0.14;
  const loudnessOf = (buffer) => {
    let sum = 0;
    let n = 0;
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < data.length; i += 4) {
        sum += data[i] * data[i];
        n++;
      }
    }
    return n ? Math.sqrt(sum / n) : 0;
  };
  const loadCue = async (address) => {
    try {
      const res = await fetch(address);
      if (!res.ok) return null;
      const bytes = await res.arrayBuffer();
      if (bytes.byteLength > SOUND_LIMITS.cueBytes) return null;
      const buffer = await ctx.decodeAudioData(bytes);
      if (buffer.duration > SOUND_LIMITS.cueSeconds || disposed) return null;
      const loud = loudnessOf(buffer);
      return { buffer, gain: loud > CUE_LOUDNESS ? CUE_LOUDNESS / loud : 1 };
    } catch {
      return null;
    }
  };
  const own = /* @__PURE__ */ new Map();
  const fromKit = /* @__PURE__ */ new Map();
  const loadInto = (into, files2) => {
    for (const [cue, addresses] of Object.entries(files2)) {
      for (const address of addresses ?? []) {
        void loadCue(address).then((loaded) => {
          if (loaded) into.set(cue, [...into.get(cue) ?? [], loaded]);
        });
      }
    }
  };
  let kit = { cues: {} };
  const kitReady = o.kit ? (async () => {
    try {
      const folder = new URL(o.kit.endsWith("/") ? o.kit : `${o.kit}/`, base).href;
      const res = await fetch(new URL("sounds.json", folder).href);
      if (!res.ok) return;
      const playsOgg = new Audio().canPlayType('audio/ogg; codecs="opus"') !== "";
      kit = cleanKit(await res.json(), folder, playsOgg);
    } catch {
    }
  })() : Promise.resolve();
  let cuesAsked = false;
  const loadCues = () => {
    if (cuesAsked || disposed) return;
    cuesAsked = true;
    loadInto(own, theme.cues);
    void kitReady.then(() => {
      const rest = Object.fromEntries(Object.entries(kit.cues).filter(([cue]) => theme.cues[cue] === void 0));
      loadInto(fromKit, rest);
    });
  };
  const last = /* @__PURE__ */ new Map();
  const lastVariant = /* @__PURE__ */ new Map();
  let foot = 0;
  const shaped = (shape) => {
    const soft = ctx.createBiquadFilter();
    soft.type = "lowpass";
    soft.frequency.value = shape.cutoff;
    soft.Q.value = 0.5;
    const level = ctx.createGain();
    level.gain.value = shape.gain;
    soft.connect(level);
    if (typeof ctx.createStereoPanner === "function") {
      const side = ctx.createStereoPanner();
      side.pan.value = shape.pan;
      level.connect(side);
      side.connect(effects);
    } else level.connect(effects);
    return soft;
  };
  let foreignPlayed = 0;
  const play = (cue, from) => {
    if (disposed || levels.off || levels.effects <= 0 || ctx.state !== "running") return;
    if (theme.cues[cue] === null) return;
    const now = ctx.currentTime;
    if (now - (last.get(cue) ?? -1) < (GAP[cue] ?? 0.03)) return;
    last.set(cue, now);
    sound(cue, now, from);
  };
  const sound = (cue, at, from, louder = 1) => {
    const now = at;
    const stepped = cue === "step" ? stepShape(foot++) : null;
    const shape = stepped ? { ...stepped, gain: stepped.gain * louder } : from ? heardFrom(from) : null;
    const out = shape ? shaped(shape) : effects;
    const files2 = own.get(cue) ?? fromKit.get(cue);
    if (files2?.length) {
      const which = nextVariant(files2.length, lastVariant.get(cue) ?? -1);
      lastVariant.set(cue, which);
      const src = ctx.createBufferSource();
      src.buffer = files2[which].buffer;
      if (shape) src.playbackRate.value = shape.rate;
      const level = ctx.createGain();
      level.gain.value = files2[which].gain;
      src.connect(level);
      level.connect(out);
      src.start(now);
      return;
    }
    for (const part of cueRecipe(cue)) playPart(part, now + 5e-3, out, shape?.rate ?? 1);
  };
  const jumped = () => {
    if (disposed || levels.off || levels.effects <= 0 || ctx.state !== "running") return;
    if (theme.cues.step === null) return;
    const now = ctx.currentTime;
    sound("step", now, void 0, JUMP_STEPS.louder);
    sound("step", now + JUMP_STEPS.gap, void 0, JUMP_STEPS.louder);
    last.set("step", now + JUMP_STEPS.gap);
  };
  let walked = 0;
  const moved = (metres) => {
    if (!(metres > 5e-4)) return;
    if (metres > JUMP) {
      walked = 0;
      return play("land");
    }
    walked += metres;
    if (walked >= STRIDE) {
      walked = 0;
      play("step");
    }
  };
  const loopPlayer = (tracks, into, opts = {}) => {
    const fade = opts.fade ?? 2;
    const out = ctx.createGain();
    out.gain.value = opts.gain ?? 1;
    out.connect(into);
    const deck = () => {
      const audio = new Audio();
      audio.preload = "auto";
      const gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(audio).connect(gain);
      gain.connect(out);
      return { audio, gain };
    };
    const decks = [deck(), deck()];
    let active = 0;
    let index = 0;
    let heard = 0;
    let turning = false;
    let stopped = false;
    const curve = (rising) => Float32Array.from({ length: 32 }, (_, k) => (rising ? Math.sin : Math.cos)(k / 31 * Math.PI / 2));
    const turn2 = () => {
      if (turning || stopped) return;
      turning = true;
      const from = decks[active];
      const to = decks[1 - active];
      index = (index + 1) % tracks.length;
      to.audio.src = tracks[index];
      to.audio.currentTime = 0;
      void to.audio.play().then(
        () => {
          const t = ctx.currentTime + 0.02;
          from.gain.gain.cancelScheduledValues(t);
          to.gain.gain.cancelScheduledValues(t);
          from.gain.gain.setValueCurveAtTime(curve(false), t, fade);
          to.gain.gain.setValueCurveAtTime(curve(true), t, fade);
          active = 1 - active;
          heard = index;
          opts.onTurn?.();
          setTimeout(() => {
            from.audio.pause();
            turning = false;
          }, (fade + 0.1) * 1e3);
        },
        () => {
          turning = false;
        }
      );
    };
    for (const d of decks) {
      d.audio.addEventListener("timeupdate", () => {
        if (d !== decks[active] || !Number.isFinite(d.audio.duration)) return;
        if (d.audio.duration - d.audio.currentTime <= fade + 0.35) turn2();
      });
      d.audio.addEventListener("ended", () => {
        if (d === decks[active]) turn2();
      });
      d.audio.addEventListener("error", () => {
        if (stopped || d !== decks[active] || turning) return;
        stopped = true;
        opts.onFail?.();
      });
    }
    const first = decks[0];
    first.audio.src = tracks[0];
    void first.audio.play().then(
      () => first.gain.gain.setTargetAtTime(1, ctx.currentTime, 0.8),
      () => {
      }
    );
    return {
      stop() {
        stopped = true;
        for (const d of decks) {
          d.audio.pause();
          d.audio.removeAttribute("src");
        }
        out.disconnect();
      },
      /** How many times one piece has handed on to the next. For tests. */
      get index() {
        return index;
      },
      /** Where the piece that is heard now is kept. */
      get now() {
        return tracks[heard];
      },
      get count() {
        return tracks.length;
      },
      /** Hand on to the next piece now. */
      next() {
        if (tracks.length < 2 || turning || stopped) return false;
        turn2();
        return true;
      }
    };
  };
  let kind = theme.music === null ? "none" : theme.music ? "world" : "made";
  let stopMusic = null;
  let pieces = null;
  let stopHum = null;
  let humAddress = null;
  let musicAsked = false;
  const startMusic = () => {
    if (musicAsked || disposed) return;
    musicAsked = true;
    loadCues();
    void kitReady.then(() => {
      if (disposed) return;
      humAddress = theme.hum === null ? null : theme.hum ?? kit.hum ?? null;
      if (humAddress) stopHum = loopPlayer([humAddress], humGain, { gain: 0.55 }).stop;
      const tracks = theme.music === null ? null : theme.music ?? kit.music ?? null;
      if (theme.music === void 0 && kit.music) kind = "kit";
      changed();
      if (theme.music === null) return;
      if (tracks) {
        const player2 = loopPlayer(tracks, placeMusic, {
          gain: 0.6,
          onTurn: () => changed(),
          onFail: () => {
            stopMusic?.();
            pieces = null;
            kind = "made";
            stopMusic = madeMusic();
            changed();
          }
        });
        pieces = player2;
        stopMusic = player2.stop;
        changed();
        return;
      }
      stopMusic = madeMusic();
    });
  };
  const madeMusic = () => {
    const plan = ambiencePlan(o.seed ?? location.host);
    const bed = ctx.createGain();
    bed.gain.value = 0.12;
    const colour = ctx.createBiquadFilter();
    colour.type = "lowpass";
    colour.frequency.value = plan.colour;
    colour.connect(bed);
    bed.connect(placeMusic);
    const running = [];
    plan.drones.forEach((d, i) => {
      const osc = ctx.createOscillator();
      osc.type = i < 2 ? "sine" : "triangle";
      osc.frequency.value = d.hz;
      osc.detune.value = d.detune;
      const swell = ctx.createGain();
      swell.gain.value = i < 2 ? 0.3 : 0.14;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 1 / d.swell;
      const depth = ctx.createGain();
      depth.gain.value = swell.gain.value * 0.8;
      lfo.connect(depth);
      depth.connect(swell.gain);
      osc.connect(swell);
      swell.connect(colour);
      osc.start();
      lfo.start();
      running.push(osc, lfo);
    });
    const random = seeded(`notes:${o.seed ?? location.host}`);
    let timer;
    const note = () => {
      if (disposed) return;
      if (ctx.state === "running" && !levels.off && levels.music > 0) {
        const hz = plan.root * plan.scale[Math.floor(random() * plan.scale.length)] * (random() < 0.5 ? 2 : 4);
        const t = ctx.currentTime + 0.05;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = hz;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.11, t + 0.5);
        g.gain.exponentialRampToValueAtTime(8e-4, t + 4.5);
        osc.connect(g);
        g.connect(bed);
        osc.start(t);
        osc.stop(t + 4.6);
      }
      timer = setTimeout(note, (plan.gap[0] + random() * (plan.gap[1] - plan.gap[0])) * 1e3);
    };
    timer = setTimeout(note, 1500);
    return () => {
      clearTimeout(timer);
      for (const n of running) {
        try {
          n.stop();
        } catch {
        }
      }
      bed.disconnect();
    };
  };
  const wake = () => {
    void ctx.resume().then(startMusic, () => {
    });
    if (ctx.state === "running") startMusic();
  };
  const onTouch = () => wake();
  addEventListener("pointerdown", onTouch, true);
  addEventListener("keydown", onTouch, true);
  if (ctx.state === "running") startMusic();
  const keepSongs = () => write(songsKey, songs);
  const stopOwn = () => {
    juke.audio?.pause();
    juke.playing = false;
    apply();
    changed();
  };
  const player = () => {
    if (!juke.audio || !juke.tap) {
      juke.audio = new Audio();
      const source = ctx.createMediaElementSource(juke.audio);
      source.connect(ownMusic);
      juke.tap = ctx.createMediaStreamDestination();
      source.connect(juke.tap);
      juke.audio.addEventListener("ended", () => void jukebox.next());
    }
    return { audio: juke.audio, tap: juke.tap };
  };
  const jukebox = {
    list: () => [...songs],
    async add(file) {
      const refusal = songRefusal({ type: file.type, size: file.size, ...file.name ? { name: file.name } : {} }, songs.length);
      if (refusal) return refusal;
      const id = `song-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const kept = await fileStore("readwrite", (s) => s.put(file, `song:${id}`));
      if (kept === void 0) return "This browser couldn't keep that file.";
      songs = cleanSongs([...songs, { id, title: songTitle(file.name ?? ""), size: file.size, at: Math.floor(Date.now() / 1e3) }]);
      keepSongs();
      changed();
      return null;
    },
    async remove(id) {
      if (juke.current?.id === id) {
        stopOwn();
        juke.current = null;
      }
      songs = songs.filter((s) => s.id !== id);
      keepSongs();
      await fileStore("readwrite", (s) => s.delete(`song:${id}`));
      changed();
    },
    async play(id) {
      const song = id ? songs.find((s) => s.id === id) : juke.current ?? songs[0];
      if (!song || disposed) return false;
      player();
      if (juke.current?.id !== song.id || !juke.url) {
        const file = await fileStore("readonly", (s) => s.get(`song:${song.id}`));
        if (!file) return false;
        if (juke.url) URL.revokeObjectURL(juke.url);
        juke.url = URL.createObjectURL(file);
        juke.audio.src = juke.url;
        juke.current = song;
      }
      try {
        await ctx.resume();
        await juke.audio.play();
      } catch {
        juke.playing = false;
        apply();
        changed();
        return false;
      }
      juke.playing = true;
      apply();
      changed();
      return true;
    },
    pause: stopOwn,
    async next() {
      if (songs.length === 0) return false;
      const at = songs.findIndex((s) => s.id === juke.current?.id);
      return jukebox.play(songs[(at + 1) % songs.length].id);
    },
    get playing() {
      return juke.playing;
    },
    get current() {
      return juke.current;
    },
    output: () => player().tap.stream.getAudioTracks()[0]
  };
  const samples = new Float32Array(meter.fftSize);
  return {
    play,
    moved,
    bump: () => play("bump"),
    jumped,
    get levels() {
      return levels;
    },
    setLevels(patch) {
      levels = cleanLevels({ ...levels, ...patch });
      write(levelsKey, levels);
      apply();
      changed();
    },
    jukebox,
    onChange(fn) {
      listeners.add(fn);
      fn(levels);
      return () => listeners.delete(fn);
    },
    get music() {
      return kind;
    },
    get piece() {
      return pieces ? { name: pieceName(pieces.now), of: pieces.count } : null;
    },
    nextPiece() {
      return pieces?.next() ?? false;
    },
    get hasHum() {
      return !!humAddress;
    },
    async decode(bytes) {
      try {
        const buffer = await ctx.decodeAudioData(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
        if (!(buffer.duration > 0) || buffer.duration > FOREIGN_SOUND.seconds) return null;
        let peak = 0;
        for (let c = 0; c < buffer.numberOfChannels; c++) for (const x of buffer.getChannelData(c)) peak = Math.max(peak, Math.abs(x));
        return { buffer, gain: peak > 0 ? Math.min(1, FOREIGN_SOUND.peak / peak) : 1 };
      } catch {
        return null;
      }
    },
    playForeign(sound2, from) {
      if (disposed || levels.off || levels.effects <= 0 || ctx.state !== "running") return;
      const far = from && Number.isFinite(from.distance) ? Math.max(0, from.distance) : 0;
      const reach = far <= FOREIGN_SOUND.fades ? 1 : Math.max(0, 1 - (far - FOREIGN_SOUND.fades) / (FOREIGN_SOUND.gone - FOREIGN_SOUND.fades));
      if (reach <= 0) return;
      const src = ctx.createBufferSource();
      src.buffer = sound2.buffer;
      const level = ctx.createGain();
      level.gain.value = sound2.gain * reach;
      src.connect(level);
      level.connect(from ? shaped(heardFrom(from)) : effects);
      src.start();
      foreignPlayed++;
    },
    get foreignPlayed() {
      return foreignPlayed;
    },
    loudness() {
      meter.getFloatTimeDomainData(samples);
      return Math.sqrt(samples.reduce((s, x) => s + x * x, 0) / samples.length);
    },
    dispose() {
      stopReporting();
      disposed = true;
      removeEventListener("pointerdown", onTouch, true);
      removeEventListener("keydown", onTouch, true);
      stopMusic?.();
      stopHum?.();
      juke.audio?.pause();
      if (juke.url) URL.revokeObjectURL(juke.url);
      master.disconnect();
    }
  };
}
function addSoundControls(controls, sounds, opts = {}) {
  const word = (v) => LEVEL_WORDS[levelStep(v)];
  let listed = [];
  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = "audio/*";
  picker.multiple = true;
  picker.hidden = true;
  document.body.append(picker);
  picker.addEventListener("change", async () => {
    let added = 0;
    let refused = "";
    for (const file of [...picker.files ?? []]) {
      const no = await sounds.jukebox.add(file);
      if (no) refused = no;
      else added++;
    }
    picker.value = "";
    controls.say(added ? `${added === 1 ? "1 song" : `${added} songs`} added. Only you hear your music.${refused ? ` ${refused}` : ""}` : refused || "Nothing was added.");
    refresh();
  });
  const refresh = () => {
    for (const id of listed) controls.remove(id);
    const songs = sounds.jukebox.list();
    listed = songs.map((s) => `song-${s.id}`);
    controls.addSection({
      id: "sound",
      label: "Sound",
      icon: "sound",
      note: () => `${sounds.levels.off ? "All sound is off. " : ""}${sounds.music === "none" ? "This place has no music of its own." : sounds.music === "world" ? "This place plays its own music." : sounds.music === "kit" ? "This place plays the music every world starts with." : "This place's music is made by your browser, from its name."} Your own music is kept in this browser, for this site, and only you hear it.`
    });
    songs.forEach(
      (s, i) => controls.add({
        id: listed[i],
        section: "sound",
        icon: "note",
        on: () => sounds.jukebox.playing && sounds.jukebox.current?.id === s.id,
        label: () => sounds.jukebox.playing && sounds.jukebox.current?.id === s.id ? `Playing: ${s.title}` : s.title,
        act: async () => {
          if (sounds.jukebox.playing && sounds.jukebox.current?.id === s.id) sounds.jukebox.pause();
          else if (!await sounds.jukebox.play(s.id)) controls.say(`${s.title} couldn't be played.`);
        }
      })
    );
  };
  const level = (id, name, key) => ({
    id,
    section: "sound",
    label: () => `${name}: ${word(sounds.levels[key])}`,
    on: () => sounds.levels[key] > 0,
    act: () => sounds.setLevels({ [key]: nextLevel(sounds.levels[key]) })
  });
  controls.addSection({ id: "sound", label: "Sound", icon: "sound" });
  controls.add(
    {
      id: "sound-all",
      section: "sound",
      icon: () => sounds.levels.off ? "soundOff" : "sound",
      on: () => !sounds.levels.off,
      label: () => sounds.levels.off ? "All sound: off" : "All sound: on",
      act: () => sounds.setLevels({ off: !sounds.levels.off })
    },
    level("sound-effects", "Effects", "effects"),
    level("sound-music", "Music", "music"),
    {
      // What the place is playing, by name, so a visitor can say which piece they mean. Pressing goes on to the next.
      id: "sound-piece",
      section: "sound",
      icon: "note",
      hidden: () => sounds.music === "none" || sounds.music === "made" || !sounds.piece,
      label: () => {
        const p = sounds.piece;
        if (!p) return "This place's music";
        return `Playing here: ${p.name}${p.of > 1 ? `. Next of ${p.of}` : ""}`;
      },
      act: () => {
        const p = sounds.piece;
        if (!p) return;
        if (sounds.nextPiece()) controls.say(`Going on from ${p.name} to this place's next piece.`);
        else controls.say(`${p.name} is the only piece this place has. Music: off, above, silences it.`);
      }
    },
    level("sound-voices", "Voices", "voices"),
    {
      id: "sound-hum",
      section: "sound",
      icon: "sound",
      on: () => sounds.levels.hum,
      hidden: () => !(opts.hasHum ? opts.hasHum() : sounds.hasHum),
      label: () => sounds.levels.hum ? "The room's hum: on" : "The room's hum: off",
      act: () => sounds.setLevels({ hum: !sounds.levels.hum })
    },
    {
      id: "juke-add",
      section: "sound",
      icon: "save",
      label: "Add music from this device",
      act: () => picker.click()
    },
    {
      id: "juke-play",
      section: "sound",
      icon: "note",
      on: () => sounds.jukebox.playing,
      hidden: () => sounds.jukebox.list().length === 0,
      label: () => sounds.jukebox.playing ? "Pause your music" : "Play your music",
      act: async () => {
        if (sounds.jukebox.playing) return sounds.jukebox.pause();
        if (!await sounds.jukebox.play()) controls.say("Your music couldn't be played.");
      }
    },
    {
      id: "juke-next",
      section: "sound",
      icon: "turn",
      hidden: () => sounds.jukebox.list().length < 2,
      label: "Next song",
      act: () => void sounds.jukebox.next()
    },
    {
      id: "juke-remove",
      section: "sound",
      icon: "exit",
      hidden: () => !sounds.jukebox.current,
      label: () => `Take out ${sounds.jukebox.current?.title ?? "this song"}`,
      act: async () => {
        const song = sounds.jukebox.current;
        if (!song) return;
        await sounds.jukebox.remove(song.id);
        controls.say(`${song.title} was taken out of this browser.`);
        refresh();
      }
    }
  );
  refresh();
  controls.onSignal((name) => {
    if (CUES.includes(name) && !opts.quiet?.(name)) sounds.play(name);
  });
  controls.onSay(() => void (opts.quiet?.("notice") || sounds.play("notice")));
  sounds.onChange(() => refresh());
  return { refresh };
}

// packages/sdk/src/save-file.ts
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3e4);
}
function saveFile(blob, name) {
  if (handUp(blob)) return true;
  download(blob, name);
  return false;
}

export {
  CUES,
  STRIDE,
  LEVEL_WORDS,
  levelStep,
  nextLevel,
  MUSIC_RANGE,
  MUSIC_DUCK,
  musicToHear,
  musicFade,
  PANEL_LOOKS,
  cleanLook,
  nextLook,
  PANEL_LIMITS,
  cleanPlace,
  cleanSource,
  cleanRecords,
  cleanPin,
  tagAlong,
  facing,
  inFront,
  newId,
  wrapText,
  LIBRARY_LIMITS,
  fileStore,
  createLibrary,
  createSounds,
  addSoundControls,
  download,
  saveFile
};
