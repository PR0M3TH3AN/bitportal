import {
  DEFAULT_THEME,
  rgb
} from "./shared-BUBQWMZ2.js";

// packages/sdk/src/ui/icons.ts
var ICONS = {
  home: "M4 11.5 12 4l8 7.5M6 10v10h12V10M10 20v-5h4v5",
  turn: "M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5",
  room: "M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20a6 6 0 0 1 12 0M16.5 11.5a2.5 2.5 0 1 0 0-5M17.5 14.6A5 5 0 0 1 21.5 20",
  leave: "M10 4H5v16h5M14 8l4 4-4 4M18 12H9",
  mic: "M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6",
  micOff: "M9 9v2a3 3 0 0 0 4.6 2.5M15 10.5V6a3 3 0 0 0-5.7-1.3M6 11a6 6 0 0 0 9.6 4.8M18 11a6 6 0 0 1-.4 2.2M12 17v4M9 21h6M4 4l16 16",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  vr: "M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3.5l-2-2.5h-3L8.5 17H5a2 2 0 0 1-2-2V9ZM8 12h.01M16 12h.01",
  exit: "M18 6 6 18M6 6l12 12",
  look: "M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11ZM9 14a3 3 0 0 0 3 3",
  help: "M9.2 9a3 3 0 1 1 4.6 2.5c-1 .7-1.8 1.4-1.8 2.7M12 18h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
  menu: "M4 7h16M4 12h16M4 17h10",
  /** An arched doorway: this project's mark for a way through. */
  door: "M7 21V10a5 5 0 0 1 10 0v11M5 21h14M14.5 14h.01",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.700l1-1",
  save: "M7 4h10v17l-5-3.5L7 21V4Z",
  /** For the visitor's own music: play, pause, the song after and before, a little way on and back, and how it goes. */
  play: "M7 4.5v15l12-7.5Z",
  pause: "M8 5v14M16 5v14",
  next: "M6 5.5v13l10-6.5ZM19 5v14",
  previous: "M18 5.5v13L8 12ZM5 5v14",
  rewind: "M11 7v10l-7-5ZM20 7v10l-7-5Z",
  forward: "M13 7v10l7-5ZM4 7v10l7-5Z",
  shuffle: "M3 7h4l8 10h5M3 17h4l2.5-3.1M12.5 10.100 15 7h5M17 4l3 3-3 3M17 14l3 3-3 3",
  repeat: "M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4",
  music: "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  pin: "M9 4h6l-1 6 3 3H7l3-3-1-6ZM12 13v7",
  step: "M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.800-6 10-6 10ZM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  size: "M4 18 9 6l5 12M5.700 14h6.600M15 18l3.500-8 3.500 8M16 15.700h5",
  /** Filling the screen: four corners drawn out. */
  full: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
  motion: "M3 12h4l3-7 4 14 3-7h4",
  check: "M5 12.500 10 17.500 19 7",
  camera: "M4 8h3l1.5-2h7L17 8h3v11H4ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  selfie: "M4 5h16v14H4ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM7.5 19a4.5 4.5 0 0 1 9 0",
  record: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  /** A panel: a frame with a bar along its top. */
  panel: "M4 5h16v14H4ZM4 9h16M15 7h.01M17.5 7h.01",
  note: "M6 3h9l4 4v14H6ZM14 3v5h5M9 13h7M9 17h5",
  /** A loudspeaker, sounding and crossed out. */
  sound: "M4 9.500v5h3.500L13 19V5L7.500 9.500ZM16.500 9a4.500 4.500 0 0 1 0 6M19 6.500a8 8 0 0 1 0 11",
  soundOff: "M4 9.500v5h3.500L13 19V5L7.500 9.500ZM16.500 9.500l4.500 5M21 9.500l-4.500 5",
  you: "M12 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM5 20.5a7 7 0 0 1 14 0",
  close: "M6 6l12 12M18 6 6 18",
  key: "M14.5 9.5a3.5 3.5 0 1 0-3.4 3.5L4 20v-3h3v-3h3l1.6-1.6M16 8h.01",
  chat: "M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM8 10h8M8 13h5",
  people: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a6 6 0 0 1 12 0M16 11a2.5 2.5 0 1 0 0-5M21 20a5 5 0 0 0-4-4.9",
  // What a door says its world offers (door-offers.ts), where no drawing above already says it.
  bag: "M6 8h12l1.2 12H4.8L6 8ZM9 8V6.5a3 3 0 0 1 6 0V8",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4",
  tip: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  // An envelope: a world that is by invitation (the eighth thing a door shows).
  invite: "M4 6h16v12H4ZM4 7l8 6 8-6",
  coin: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM14.6 9.6c-.5-1-1.4-1.6-2.6-1.6-1.5 0-2.6.8-2.6 2s1 1.7 2.6 2 2.6.8 2.6 2-1.1 2-2.6 2c-1.2 0-2.1-.6-2.6-1.6M12 6.5V8M12 16v1.5"
};

// packages/sdk/src/ui/mark.ts
var MARK = {
  /** The tile: its size, the round of its top corners and of its bottom ones, and its edge. */
  tile: { w: 44, h: 48, top: 22, bottom: 8, edge: 1 },
  /** The arch: its size, where it stands in the tile, the round of its top (a half circle) and of its foot. */
  arch: { w: 18, h: 24, x: 13, y: 11, top: 9, bottom: 2 },
  /** The line it stands on: how far it reaches past the arch on each side, how thick, and how far below its foot. */
  sill: { over: 3, h: 2, below: 3 },
  /** How far the arch's glow reaches. */
  glow: 14,
  /** The arch's fill: the accent at the top, and at the foot. */
  fill: { top: 0.95, foot: 0.25 },
  /** The glow's strength, the tile's glass, and its edge when it isn't lit. */
  glowAlpha: 0.55,
  glass: 0.7,
  edgeAlpha: 0.34
};
var sillBox = () => {
  const { arch, sill } = MARK;
  return [arch.x - sill.over, arch.y + arch.h + sill.below - sill.h, arch.w + sill.over * 2, sill.h];
};
var roundedPath = (c, x, y, w, h, top, bottom) => {
  c.beginPath();
  c.moveTo(x + top, y);
  c.lineTo(x + w - top, y);
  c.arcTo(x + w, y, x + w, y + top, top);
  c.lineTo(x + w, y + h - bottom);
  c.arcTo(x + w, y + h, x + w - bottom, y + h, bottom);
  c.lineTo(x + bottom, y + h);
  c.arcTo(x, y + h, x, y + h - bottom, bottom);
  c.lineTo(x, y + top);
  c.arcTo(x, y, x + top, y, top);
  c.closePath();
};
function paintMark(c, o) {
  const s = o.scale;
  const { tile, arch } = MARK;
  const accent = rgb(o.accent);
  if (o.tile !== false) {
    roundedPath(c, o.x, o.y, tile.w * s, tile.h * s, tile.top * s, tile.bottom * s);
    c.fillStyle = `rgba(${rgb(o.glass)}, ${o.glassAlpha ?? MARK.glass})`;
    c.fill();
    c.lineWidth = Math.max(1, tile.edge * s);
    c.strokeStyle = o.lit ? `rgb(${accent})` : `rgba(${accent}, ${MARK.edgeAlpha})`;
    c.stroke();
  }
  const ax = o.x + arch.x * s;
  const ay = o.y + arch.y * s;
  const fill = c.createLinearGradient(0, ay, 0, ay + arch.h * s);
  fill.addColorStop(0, `rgba(${accent}, ${MARK.fill.top})`);
  fill.addColorStop(1, `rgba(${accent}, ${MARK.fill.foot})`);
  c.save();
  c.shadowColor = `rgba(${accent}, ${MARK.glowAlpha})`;
  c.shadowBlur = MARK.glow * s;
  roundedPath(c, ax, ay, arch.w * s, arch.h * s, arch.top * s, arch.bottom * s);
  c.fillStyle = fill;
  c.fill();
  c.restore();
  const [lx, ly, lw, lh] = sillBox();
  roundedPath(c, o.x + lx * s, o.y + ly * s, lw * s, lh * s, lh / 2 * s, lh / 2 * s);
  c.fillStyle = o.ink;
  c.fill();
}
var colourOr = (value, fallback) => typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : fallback;
function markSvg(o = {}) {
  const accent = colourOr(o.accent, DEFAULT_THEME.accent);
  const ink = colourOr(o.ink, DEFAULT_THEME.ink);
  const glass = colourOr(o.glass, DEFAULT_THEME.glass);
  const { tile, arch, sill } = MARK;
  const tiled = o.tile !== false;
  const pad = MARK.glow;
  const box = tiled ? { x: 0, y: 0, w: tile.w, h: tile.h } : { x: arch.x - sill.over, y: arch.y, w: arch.w + sill.over * 2, h: arch.h + sill.below };
  const vx = box.x - (tiled ? 0 : pad);
  const vy = box.y - (tiled ? 0 : pad);
  const vw = box.w + (tiled ? 0 : pad * 2);
  const vh = box.h + (tiled ? 0 : pad * 2);
  const rounded = (x, y, w, h, top, bottom) => `M${x + top} ${y}H${x + w - top}A${top} ${top} 0 0 1 ${x + w} ${y + top}V${y + h - bottom}A${bottom} ${bottom} 0 0 1 ${x + w - bottom} ${y + h}H${x + bottom}A${bottom} ${bottom} 0 0 1 ${x} ${y + h - bottom}V${y + top}A${top} ${top} 0 0 1 ${x + top} ${y}Z`;
  const [lx, ly, lw, lh] = sillBox();
  const half = tile.edge / 2;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${vw}" height="${vh}">`,
    `<defs><linearGradient id="nswp-mark-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${accent}" stop-opacity="${MARK.fill.top}"/><stop offset="1" stop-color="${accent}" stop-opacity="${MARK.fill.foot}"/></linearGradient>`,
    `<filter id="nswp-mark-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${MARK.glow / 2}"/></filter></defs>`,
    tiled ? `<path d="${rounded(half, half, tile.w - tile.edge, tile.h - tile.edge, tile.top - half, tile.bottom - half)}" fill="${glass}" stroke="${accent}" stroke-opacity="${MARK.edgeAlpha}" stroke-width="${tile.edge}"/>` : "",
    `<path d="${rounded(arch.x, arch.y, arch.w, arch.h, arch.top, arch.bottom)}" fill="${accent}" opacity="${MARK.glowAlpha}" filter="url(#nswp-mark-glow)"/>`,
    `<path d="${rounded(arch.x, arch.y, arch.w, arch.h, arch.top, arch.bottom)}" fill="url(#nswp-mark-fill)"/>`,
    `<path d="${rounded(lx, ly, lw, lh, lh / 2, lh / 2)}" fill="${ink}"/>`,
    `</svg>`
  ].join("");
}

// packages/sdk/src/ui/sheet-look.ts
var SHEET_LOOK = {
  /** The menu's words: 13 px, 1.35 lines apart. An icon is 1.55 times the words, drawn with lines 1.6 wide (of 24). */
  text: { size: 13, line: 1.35, icon: 1.55, iconLine: 1.6, family: 'ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", sans-serif', mono: 'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace' },
  /** Glass: its fill and its edge. */
  glass: { fill: 0.7, edge: 0.34 },
  /**
   * The sheet. At a desk (`desk`, at least that wide and high) it is `wide` across, in two columns; else `narrow`,
   * in one. It is at most `tall` high, or that share of the screen. Its top edge is lit by a line, glowing.
   */
  sheet: { wide: 780, narrow: 480, desk: { width: 900, height: 560 }, side: 20, deskSide: 40, tall: { desk: 780, deskShare: 74, narrow: 640, narrowShare: 70 }, corners: [22, 22, 12, 12], top: { line: 2, glow: 16 } },
  /** The strip of tabs: its room, and each tab. A tab brought into sight is kept `clear` of the arrows at the ends. */
  tabs: { pad: [12, 12, 0], gap: 4, clear: 46, more: { width: 40, inset: 9, fade: 45 }, tab: { pad: [9, 13, 8], gap: 7, corners: 14, under: 2, ink: 0.72, on: 0.1 } },
  /** The list of rows under the strip: its gap, its room, and the line over it. */
  rows: { gap: 6, pad: 12, line: 0.22 },
  /** A row to press. */
  row: { height: 46, pad: [8, 12], corners: 10, gap: 12, edge: 0.12, fill: 0.03, hoverFill: 0.13, hoverEdge: 0.7, onEdge: 0.8, primaryFill: 0.16, primaryEdge: 0.75, state: 0.86, stateInk: 0.6 },
  /** A line to read. */
  line: { pad: [4, 12], gap: 12, dim: 0.55, iconDim: 0.55, iconAt: 1 },
  /** A row typed into: a box and its button, and a line under them. */
  field: { pad: [8, 12], gap: [6, 8], box: 40, boxPad: [6, 10], boxCorners: 8, boxEdge: 0.25, boxGlass: 0.6, buttonPad: [6, 14], to: 0.86, toInk: 0.6 },
  /** A song's bar: its words, the bar, and where it is. */
  slide: { pad: [8, 12], gap: [4, 12], bar: 28, time: 0.86, timeInk: 0.7, onEdge: 0.5 },
  /** A row that takes a file, and the line under it. */
  takes: { gap: 4, to: 0.86, toInk: 0.6 },
  /** Choices of colour: small doorways in a row. */
  swatches: { gap: [6, 4], pad: [4, 2, 8] },
  swatch: { width: 66, gap: 6, text: 0.86, ink: 0.8, arch: [38, 44], corners: [19, 5], sill: [46, 2], sillAt: -3, sillInk: 0.25 },
  /** Things with pictures, side by side: each at least `min` wide at a desk, `narrowMin` on a phone. */
  tiles: { min: 112, narrowMin: 104, gap: 8, pad: [2, 0, 4] },
  tile: { pad: [8, 6, 9], gap: 4, corners: [14, 8], text: 0.9, line: 1.2, ink: 0.85, glow: 0.13, letter: 1.9, mark: { size: 24, inset: 6, corners: 8, icon: 15, glass: 0.85, edge: 0.55 } },
  /** A card at the head of a tab: who, or what, it is about. */
  card: { pad: 12, corners: [16, 8], face: 56, gap: [3, 12], edge: 0.45, fill: 0.07, title: 1.15, tag: 0.76, keyline: 0.9, quote: 7, thing: 200 },
  /** A world's own part of a tab, under its name. */
  from: { top: 6, padX: 12, text: 0.82, ink: 0.55 },
  /** A tab's note. */
  note: { pad: [4, 12, 0, 12], inset: 12, text: 0.95, edge: 0.6, ink: 0.78 },
  /** The strip a said line has in the sheet, above its foot: one line high and `pad` more, then `after`. */
  says: { pad: 18, after: 8 },
  /** The foot: keep this tab on the bar, and Close. */
  foot: { pad: [0, 12, 12], gap: 10, pin: { pad: [7, 12], corners: 10, text: 0.93, icon: 16, gap: 7, edge: 0.22, ink: 0.82 }, close: { height: 38, padX: 14, corners: 10, edge: 0.22 } },
  /** The bar of things at hand: its keys, each a small doorway on a sill. */
  bar: { corners: [20, 10], pad: [12, 14, 8], gap: 10, more: 30, theirs: 0.2 },
  key: { width: 62, gap: 7, arch: [52, 54], corners: [26, 7], sill: [60, 2], sillAt: -4, name: 0.84, line: 1.2, ink: 0.82, fill: 0.08, edge: 0.42, sillInk: 0.28, hoverFill: 0.2, onFill: 0.26 }
};
var alpha = (a) => String(a).replace(/^0\./, ".");
var lengths = (p) => p.map((n) => n ? `${n}px` : "0").join(" ");

export {
  ICONS,
  SHEET_LOOK,
  alpha,
  lengths,
  MARK,
  paintMark,
  markSvg
};
