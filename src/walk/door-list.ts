/**
 * Every door, as a list, inside the room.
 *
 * The room's walls hold only so many doors. The rest used to be a page: the
 * list button left the room for the front page, which is no place to land
 * from a room, and can't be seen at all from inside a headset. So the list is
 * a panel in the room now: every door this copy shows, a page of them at a
 * time, with a way to look for one by name. It is pressed like anything else
 * in the room, with a click, a tap or a trigger.
 *
 * Choosing a door here is choosing it from where you stand. The room's
 * crossing comes up, and the Airlock is next, as for any door.
 *
 * What is drawn and what a press means are worked out by plain functions
 * (`filterRows`, `pageOf`, `hitAt`), so they are tested like arithmetic. The
 * rest draws them on a canvas.
 */
import * as THREE from "three";

/** One door, as the list shows it. */
export interface DoorRow {
  id: string;
  title: string;
  /** Its address as a visitor should read it: the part that says whose site it is, and what comes before. */
  host: string;
  /** A line about it. */
  summary: string;
  /** Words to find it by that aren't shown: its topics. */
  topics: string[];
  /** It is one of the visitor's own doors. */
  saved: boolean;
}

/** How many doors a page of the list holds. Few enough to be read from across the room. */
export const ROWS = 6;

// The picture: 1024 wide, with a head, a bar of buttons and six rows. What a press means is read off the same
// numbers. The buttons are at the top and not the foot: on a flat screen the foot of a panel hung in front of a
// visitor is where the room's own row of controls is.
const W = 1024;
const HEAD = 150;
const BAR = 120;
const ROW = 150;
const ROWS_TOP = HEAD + BAR;
const H = ROWS_TOP + ROWS * ROW;
const BUTTONS = ["earlier", "later", "find", "all"] as const;
export type ListButton = (typeof BUTTONS)[number];
export const LIST_ASPECT = W / H;

/** The doors that match what was asked for: every word of it somewhere in a door's name, address, line or topics. */
export function filterRows(rows: DoorRow[], query: string): DoorRow[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
  if (!words.length) return rows;
  return rows.filter((r) => {
    const hay = `${r.title} ${r.host} ${r.summary} ${r.topics.join(" ")}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/** One page of the list, and how many pages there are. A page that doesn't exist is the nearest that does. */
export function pageOf<T>(rows: T[], page: number, perPage = ROWS): { rows: T[]; page: number; pages: number } {
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const at = Math.min(pages - 1, Math.max(0, Math.trunc(Number.isFinite(page) ? page : 0)));
  return { rows: rows.slice(at * perPage, at * perPage + perPage), page: at, pages };
}

/** Which buttons the foot has just now. */
export function buttonsFor(page: number, pages: number, query: string): ListButton[] {
  return BUTTONS.filter((b) => (b === "earlier" ? page > 0 : b === "later" ? page < pages - 1 : b === "all" ? query.trim() !== "" : true));
}

/** What a press at (x, y) is on, each from 0 to 1, y downwards: a row by its place on the page, a button, or nothing. */
export function hitAt(x: number, y: number, shown: number, buttons: ListButton[]): { row: number } | { button: ListButton } | null {
  if (!(x >= 0 && x <= 1 && y >= 0 && y <= 1)) return null;
  const py = y * H;
  if (py >= ROWS_TOP && py < H) {
    const row = Math.floor((py - ROWS_TOP) / ROW);
    return row < shown ? { row } : null;
  }
  if (py >= HEAD + 14 && py <= ROWS_TOP - 14 && buttons.length) {
    const each = 1 / BUTTONS.length;
    const slot = Math.min(BUTTONS.length - 1, Math.floor(x / each));
    const button = BUTTONS[slot]!;
    // A little clear of each button's edges, so a press between two is neither.
    const within = x - slot * each;
    return buttons.includes(button) && within > each * 0.06 && within < each * 0.94 ? { button } : null;
  }
  return null;
}

const LABELS: Record<ListButton, string> = { earlier: "Earlier", later: "Later", find: "Find", all: "Show all" };

export interface DoorListOptions {
  /** Hang the list where the visitor can reach it. Returns how to take it down. */
  hang(texture: THREE.Texture, aspect: number, onPress: (x: number, y: number) => void, onClose: () => void): { close(): void };
  /** Every door this copy shows, the visitor's own first. */
  rows(): DoorRow[];
  /** A door was chosen. */
  onChoose(id: string): void;
  /** Ask the visitor for a few words, with whatever they have to type or speak with. Null if they gave up. */
  ask(title: string, value: string): Promise<string | null>;
  /** Something to say for a moment. */
  say(text: string): void;
  accent: string;
  ink: string;
}

export interface DoorList {
  open(): void;
  close(): void;
  /** The doors changed: draw them again. */
  refresh(): void;
  readonly showing: boolean;
  /** What is on the page now, and a way to press it. For tests. */
  view(): { rows: string[]; page: number; pages: number; query: string; buttons: ListButton[]; total: number };
  press(x: number, y: number): void;
  /** Where a row or a button is on the picture, each from 0 to 1. For tests. */
  spotOf(what: { row: number } | { button: ListButton }): [number, number];
}

export function createDoorList(o: DoorListOptions): DoorList {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  let hung: { close(): void } | null = null;
  let page = 0;
  let query = "";

  const now = () => {
    const found = filterRows(o.rows(), query);
    const p = pageOf(found, page);
    page = p.page;
    return { ...p, found, buttons: buttonsFor(p.page, p.pages, query) };
  };
  const fit = (text: string, width: number): string => {
    if (g.measureText(text).width <= width) return text;
    let cut = text;
    while (cut.length > 1 && g.measureText(`${cut}…`).width > width) cut = cut.slice(0, -1);
    return `${cut.trimEnd()}…`;
  };
  const sans = '"Ubuntu Sans V", system-ui, sans-serif';
  const mono = '"Ubuntu Sans Mono V", ui-monospace, monospace';

  const draw = () => {
    const v = now();
    g.clearRect(0, 0, W, H);
    g.fillStyle = "#070b10";
    g.fillRect(0, 0, W, H);
    g.textBaseline = "alphabetic";
    // The head: what this is, and how much of it there is.
    g.fillStyle = o.ink;
    g.font = `700 58px ${sans}`;
    g.fillText(query ? fit(`Doors for “${query}”`, W - 80) : "Every door", 40, 78);
    g.font = `400 30px ${sans}`;
    g.fillStyle = "rgba(242,243,246,0.62)";
    const count = v.found.length === 1 ? "1 door" : `${v.found.length} doors`;
    g.fillText(v.pages > 1 ? `${count}, page ${v.page + 1} of ${v.pages}` : count, 40, 124);
    // The bar: the pages, and looking for a door by name.
    const each = W / BUTTONS.length;
    BUTTONS.forEach((b, i) => {
      if (!v.buttons.includes(b)) return;
      const x = i * each + each * 0.06;
      const y = HEAD + 14;
      const w = each * 0.88;
      const h = BAR - 28;
      g.beginPath();
      g.roundRect(x, y, w, h, 18);
      g.fillStyle = "rgba(61,242,160,0.1)";
      g.fill();
      g.lineWidth = 3;
      g.strokeStyle = o.accent;
      g.stroke();
      g.fillStyle = o.ink;
      g.font = `600 34px ${sans}`;
      g.textAlign = "center";
      g.fillText(LABELS[b], x + w / 2, y + h / 2 + 12);
      g.textAlign = "left";
    });
    g.fillStyle = o.accent;
    g.fillRect(0, ROWS_TOP - 3, W, 3);

    // The rows.
    v.rows.forEach((r, i) => {
      const top = ROWS_TOP + i * ROW;
      if (i % 2 === 1) {
        g.fillStyle = "rgba(255,255,255,0.035)";
        g.fillRect(0, top, W, ROW);
      }
      const room = r.saved ? W - 80 - 150 : W - 80;
      g.fillStyle = o.ink;
      g.font = `700 42px ${sans}`;
      g.fillText(fit(r.title, room), 40, top + 54);
      g.fillStyle = o.accent;
      g.font = `400 28px ${mono}`;
      g.fillText(fit(r.host, room), 40, top + 92);
      g.fillStyle = "rgba(242,243,246,0.6)";
      g.font = `400 28px ${sans}`;
      g.fillText(fit(r.summary, W - 80), 40, top + 130);
      if (r.saved) {
        g.font = `600 26px ${sans}`;
        g.fillStyle = o.accent;
        g.textAlign = "right";
        g.fillText("Yours", W - 40, top + 52);
        g.textAlign = "left";
      }
    });
    if (!v.rows.length) {
      g.fillStyle = "rgba(242,243,246,0.7)";
      g.font = `400 36px ${sans}`;
      g.fillText(query ? "No door here matches that." : "This copy isn't showing any doors yet.", 40, ROWS_TOP + 90);
    }

    texture.needsUpdate = true;
    return v;
  };

  const find = async () => {
    const asked = await o.ask("Find a door: a name, an address, or what it is", query);
    if (asked === null) return;
    query = asked.trim().slice(0, 80);
    page = 0;
    const v = draw();
    if (query && !v.found.length) o.say(`No door here matches “${query}”.`);
  };

  const press = (x: number, y: number) => {
    const v = now();
    const hit = hitAt(x, y, v.rows.length, v.buttons);
    if (!hit) return;
    if ("row" in hit) {
      const row = v.rows[hit.row];
      if (row) o.onChoose(row.id);
      return;
    }
    if (hit.button === "earlier") page--;
    else if (hit.button === "later") page++;
    else if (hit.button === "all") {
      query = "";
      page = 0;
    } else return void find();
    draw();
  };

  return {
    open() {
      draw();
      // The room's own type may not have arrived when this is first drawn. Draw again when it has.
      void document.fonts?.ready.then(() => hung && draw());
      if (hung) return;
      hung = o.hang(texture, LIST_ASPECT, press, () => {
        hung = null;
      });
    },
    close() {
      hung?.close();
      hung = null;
    },
    refresh() {
      if (hung) draw();
    },
    get showing() {
      return hung !== null;
    },
    view() {
      const v = now();
      return { rows: v.rows.map((r) => r.title), page: v.page, pages: v.pages, query, buttons: v.buttons, total: v.found.length };
    },
    press,
    spotOf(what) {
      if ("row" in what) return [0.5, (ROWS_TOP + what.row * ROW + ROW / 2) / H];
      const each = 1 / BUTTONS.length;
      return [BUTTONS.indexOf(what.button) * each + each / 2, (HEAD + BAR / 2) / H];
    },
  };
}
