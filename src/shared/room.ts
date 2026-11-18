/**
 * The walk-in room's furniture (NSWP spec §4.5, §14.1).
 *
 * The room is drawn from a home layout: the same format a world built from
 * the NSWP world template keeps in home.json. BitPortal keeps the visitor's
 * layout on this device. It draws the room's colours and the built-in
 * furniture, and nothing that would contact another site: no pictures, and no
 * published items. The doors are BitPortal's own two walls, not the layout's.
 */
import { buildLayoutEvent, parseLayoutEvent, type Layout, type LayoutInput } from "@nswp/core";
import defaultRoom from "../starter/room.json";

const KEY = "bitportal:room";
const DRAWN = new Set(["plant", "lamp", "bench", "table", "plinth", "note"]);

export interface Room {
  layout: Layout;
  /** Placements in the layout that this room doesn't draw. */
  skipped: number;
}

/** Turn a home layout, as written in a home.json, into the room BitPortal draws. Null if it isn't a layout. */
export function roomFromInput(input: unknown): Room | null {
  try {
    if (!input || typeof input !== "object") return null;
    const given = input as { room?: unknown; items?: unknown };
    if (typeof given.room !== "object" && !Array.isArray(given.items)) return null; // some other JSON
    // A layout's name only matters when it is published, which this one never is.
    const parsed = parseLayoutEvent(buildLayoutEvent({ d: "room", ...(input as Partial<LayoutInput>) } as LayoutInput));
    if (!parsed.ok) return null;
    const items = parsed.value.items.filter((i) => i.source === "builtin" && DRAWN.has(i.type));
    // Always the open room: a hall's walls would stand across the doors.
    return { layout: { ...parsed.value, room: { ...parsed.value.room, template: "open" }, items }, skipped: parsed.value.items.length - items.length };
  } catch {
    return null;
  }
}

export const DEFAULT_ROOM: Room = roomFromInput(defaultRoom)!;

/** The visitor's own layout as they pasted it, or "" when they use the default. */
export function storedRoomText(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function loadRoom(): Room {
  const text = storedRoomText();
  if (!text) return DEFAULT_ROOM;
  try {
    return roomFromInput(JSON.parse(text)) ?? DEFAULT_ROOM;
  } catch {
    return DEFAULT_ROOM;
  }
}

/** Keep a pasted layout, or go back to the default with "". Returns what it drew, or an error to show. */
export function saveRoomText(text: string): { room: Room } | { error: string } {
  const trimmed = text.trim();
  try {
    if (!trimmed) {
      window.localStorage.removeItem(KEY);
      return { room: DEFAULT_ROOM };
    }
    let json: unknown;
    try {
      json = JSON.parse(trimmed);
    } catch {
      return { error: "That isn't valid JSON, so the room was left as it was." };
    }
    const room = roomFromInput(json);
    if (!room) return { error: "That isn't a home layout, so the room was left as it was. It needs a room with a colour and an accent, and a list of items." };
    window.localStorage.setItem(KEY, trimmed);
    return { room };
  } catch {
    return { error: "This browser isn't keeping settings, so the room was left as it was." };
  }
}
