/**
 * Your doors: the places a visitor saved (NSWP spec §14.1).
 *
 * They are kept on this device and nowhere else. Nothing is published, so
 * saving a place tells nobody. Each saved place keeps its signed announcement,
 * so the door can be drawn and checked without asking a relay first.
 */
import { coordinate, parseWorldEvent, verifyEvent, WORLD_KIND, type NostrEvent } from "@nswp/core";
import type { Catalog, Entry } from "./catalog.js";

export interface SavedPlace {
  /** The world's coordinate, `37300:<pubkey>:<d>`. */
  id: string;
  event: NostrEvent;
  /** Seconds since 1970. */
  savedAt: number;
  /**
   * The door's place on the visitor's wall, 0 upwards. It is kept for as long
   * as the place is saved, so a door a visitor has learned never moves, even
   * when another is removed. Places past the end of the wall are on the list.
   */
  slot: number;
}

const KEY = "bitportal:saved";
const LEFT_KEY = "bitportal:left";
/** A wall shows a dozen; the list shows the rest (spec §14.1). */
export const WALL_DOORS = 12;
export const SAVED_LIMIT = 60;

/** The coordinate a world event announces, or null if it isn't a valid announcement. */
function coordinateOf(event: unknown): string | null {
  if (!verifyEvent(event) || event.kind !== WORLD_KIND) return null;
  const parsed = parseWorldEvent(event);
  if (!parsed.ok) return null;
  return coordinate({ kind: WORLD_KIND, pubkey: event.pubkey, identifier: parsed.value.d });
}

/** The first place on the wall that no saved door has. */
function freeSlot(list: SavedPlace[]): number {
  const taken = new Set(list.map((s) => s.slot));
  let slot = 0;
  while (taken.has(slot)) slot++;
  return slot;
}

const bySlot = (list: SavedPlace[]): SavedPlace[] => [...list].sort((a, b) => a.slot - b.slot);

/** Read a stored list, keeping only entries that still check out. Always in wall order. */
export function parseSaved(raw: unknown): SavedPlace[] {
  if (!Array.isArray(raw)) return [];
  const out: SavedPlace[] = [];
  for (const item of raw as Partial<SavedPlace>[]) {
    if (!item || typeof item !== "object") continue;
    const id = coordinateOf(item.event);
    if (!id || id !== item.id || out.some((s) => s.id === id)) continue;
    const wanted = item.slot;
    const slot = Number.isInteger(wanted) && wanted! >= 0 && wanted! < SAVED_LIMIT && !out.some((s) => s.slot === wanted) ? wanted! : freeSlot(out);
    out.push({ id, event: item.event as NostrEvent, savedAt: typeof item.savedAt === "number" ? item.savedAt : 0, slot });
    if (out.length === SAVED_LIMIT) break;
  }
  return bySlot(out);
}

export function loadSaved(): SavedPlace[] {
  try {
    return parseSaved(JSON.parse(window.localStorage.getItem(KEY) ?? "[]"));
  } catch {
    return [];
  }
}

/** Returns false when this browser wouldn't keep the list. */
export function storeSaved(list: SavedPlace[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export const isSaved = (list: SavedPlace[], id: string): boolean => list.some((s) => s.id === id);

/** Save a place. It takes the first free place on the wall; the doors already there stay where they are. */
export function addSaved(list: SavedPlace[], entry: Pick<Entry, "id" | "event">, now: number): SavedPlace[] {
  if (isSaved(list, entry.id) || list.length >= SAVED_LIMIT || coordinateOf(entry.event) !== entry.id) return list;
  return bySlot([...list, { id: entry.id, event: entry.event, savedAt: now, slot: freeSlot(list) }]);
}

export function removeSaved(list: SavedPlace[], id: string): SavedPlace[] {
  return list.filter((s) => s.id !== id);
}

/** Put a removed place back where it was, or in the first free place if another door has taken that one. */
export function restoreSaved(list: SavedPlace[], place: SavedPlace): SavedPlace[] {
  if (isSaved(list, place.id) || list.length >= SAVED_LIMIT) return list;
  const slot = list.some((s) => s.slot === place.slot) ? freeSlot(list) : place.slot;
  return bySlot([...list, { ...place, slot }]);
}

/** Take a newer announcement of a saved place when one turns up. The publisher can't change: the coordinate names their key. */
export function refreshSaved(list: SavedPlace[], events: unknown[]): SavedPlace[] {
  let changed = false;
  const next = list.map((s) => {
    let best = s.event;
    for (const e of events) if (coordinateOf(e) === s.id && (e as NostrEvent).created_at > best.created_at) best = e as NostrEvent;
    if (best === s.event) return s;
    changed = true;
    return { ...s, event: best };
  });
  return changed ? next : list;
}

/** The addresses the visitor's saved places lead to. */
export function savedUrls(list: SavedPlace[]): string[] {
  return list.flatMap((s) => {
    const parsed = parseWorldEvent(s.event);
    return parsed.ok ? [parsed.value.url] : [];
  });
}

/** Saved places as doors, in wall order. Where the catalogue has a newer announcement, that one is drawn. */
export function savedEntries(list: SavedPlace[], catalog: Pick<Catalog, "entries" | "unlisted"> & Partial<Pick<Catalog, "permits">>): Entry[] {
  const out: Entry[] = [];
  for (const s of bySlot(list)) {
    const known = catalog.entries.find((e) => e.id === s.id) ?? catalog.unlisted.find((e) => e.id === s.id);
    if (known && known.event.created_at >= s.event.created_at) {
      out.push(known);
      continue;
    }
    const parsed = parseWorldEvent(s.event);
    if (!parsed.ok) continue;
    // A door saved before this copy's operator had a policy is kept, and not shown here: the policy is about what
    // this site shows, and it is the same for a saved door as for any other.
    if (catalog.permits && !catalog.permits(s.id, parsed.value)) continue;
    out.push({ id: s.id, world: parsed.value, event: s.event, rank: known?.rank ?? null, curatorListing: known?.curatorListing ?? false, listedBy: known?.listedBy ?? null });
  }
  return out;
}

/**
 * Where a place stands along a wall, in door-widths from its middle: the first
 * two either side of the middle, then alternately further left and right.
 */
export function wallSlot(index: number): number {
  return index % 2 === 0 ? -(index / 2) - 0.5 : (index + 1) / 2 - 0.5;
}

// ------------------------------------------------- the door you left through
export interface Left {
  id: string;
  from: "walk" | "list";
}

/** Remember which door the visitor left through, for this tab only, so they come back facing it. */
export function rememberLeft(left: Left): void {
  try {
    window.sessionStorage.setItem(LEFT_KEY, JSON.stringify(left));
  } catch {
    /* storage unavailable */
  }
}

export function parseLeft(raw: string | null): Left | null {
  try {
    const v = JSON.parse(raw ?? "null") as Partial<Left> | null;
    if (v && typeof v.id === "string" && (v.from === "walk" || v.from === "list")) return { id: v.id, from: v.from };
  } catch {
    /* not ours */
  }
  return null;
}

export function readLeft(): Left | null {
  try {
    return parseLeft(window.sessionStorage.getItem(LEFT_KEY));
  } catch {
    return null;
  }
}
