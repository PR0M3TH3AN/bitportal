/**
 * What a visitor prefers, in every world: a filled screen, the intense way of
 * moving at a desk, how fast the view turns, how wide they see.
 *
 * These are standing preferences, not a record of what they last did. Someone
 * who prefers a filled screen and pressed Escape in one world still prefers a
 * filled screen in the next (NSWP-11, "Settings that travel"). They are set
 * in Settings here, or with the control for each in any world's menu, and
 * nothing else changes them.
 *
 * They are kept where the kit keeps them, so the room, this page and the
 * Airlock read the same thing: one small entry each in this browser. For
 * someone signed in they go in the sealed note kept with their profile too (sync.ts).
 *
 * `keptSettings` is everything of the visitor's that travels, as this browser
 * has it. The Airlock starts from it, so a door opened from the front page or
 * the jump list, which says nothing about settings, still takes them along.
 */
import { cleanSettings, FOV_RANGE, LOOK_RANGE, type TravelSettings } from "@nswp/core";

/** The kit's own names for these, on this site. */
export const FULL_KEY = "nswp:full";
export const INTENSE_KEY = "bitportal:fps";
export const DESK_KEY = "nswp:desk";
export const PICTURES_KEY = "nswp:pictures";
export const CHAT_KEY = "nswp:chat";
/** Whether anything people carry is drawn for them (NSWP-17): the kit keeps "off" here, and nothing while it is on. */
export const ITEMS_KEY = "nswp:items";
const SOUND_KEY = "bitportal:sound";
const UI_KEY = "nswp:ui";
/** The tabs of the menu they keep on their bar, as the kit keeps them here. */
const PINS_KEY = "nswp:ui:pins";
/** What they last held here, as the kit keeps it (its `HELD_KEY`): an item, its colours and its script's mark, or "" for put away. */
export const HELD_KEY = "nswp:holding";

export interface Prefs {
  full: boolean;
  intense: boolean;
  /** 1 is the kit's own speed. */
  look: number;
  /** Degrees top to bottom at a desk, or null for each world's own. */
  fov: number | null;
  /** Whether other people's own pictures are fetched and shown. On until they say otherwise. */
  pictures: boolean;
  /** Whether what people write in a room is shown to them, and they may write. On until they say otherwise. */
  chat: boolean;
}

/** What Settings offers. The menu in a world steps through the same ones. */
export const LOOK_CHOICES: readonly { value: number; word: string }[] = [
  { value: 0.5, word: "Slow" },
  { value: 0.75, word: "Gentle" },
  { value: 1, word: "Normal" },
  { value: 1.5, word: "Quick" },
  { value: 2, word: "Fast" },
  { value: 3, word: "Fastest" },
];
export const FOV_CHOICES: readonly (number | null)[] = [null, 60, 70, 80, 90, 100, 110];

type Reader = Pick<Storage, "getItem">;
type Writer = Pick<Storage, "setItem" | "removeItem">;

const json = (text: string | null): unknown => {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};
const within = (v: unknown, [least, most]: readonly [number, number]): number | null => (typeof v === "number" && Number.isFinite(v) ? Math.min(most, Math.max(least, v)) : null);

export function loadPrefs(store: Reader | null): Prefs {
  const desk = (json(store?.getItem(DESK_KEY) ?? null) ?? {}) as { look?: unknown; fov?: unknown };
  const fov = within(desk.fov, FOV_RANGE);
  return {
    full: store?.getItem(FULL_KEY) === "1",
    intense: store?.getItem(INTENSE_KEY) === "1",
    look: Math.round((within(desk.look, LOOK_RANGE) ?? 1) * 100) / 100,
    fov: fov === null ? null : Math.round(fov),
    pictures: store?.getItem(PICTURES_KEY) !== "0",
    chat: store?.getItem(CHAT_KEY) !== "0",
  };
}

export function storePrefs(prefs: Prefs, store: Writer | null): void {
  try {
    if (prefs.full) store?.setItem(FULL_KEY, "1");
    else store?.removeItem(FULL_KEY);
    if (prefs.intense) store?.setItem(INTENSE_KEY, "1");
    else store?.removeItem(INTENSE_KEY);
    store?.setItem(DESK_KEY, JSON.stringify({ look: prefs.look, fov: prefs.fov }));
    // Kept as the kit keeps it: nothing when they are on, "0" when they are off.
    if (prefs.pictures) store?.removeItem(PICTURES_KEY);
    else store?.setItem(PICTURES_KEY, "0");
    if (prefs.chat) store?.removeItem(CHAT_KEY);
    else store?.setItem(CHAT_KEY, "0");
  } catch {
    /* a private window: they last as long as the page */
  }
}

/** Everything of the visitor's that travels, as this browser keeps it. Cleaned: preferences and nothing else. */
export function keptSettings(store: Reader | null): TravelSettings {
  const prefs = loadPrefs(store);
  const sound = json(store?.getItem(SOUND_KEY) ?? null);
  const ui = (json(store?.getItem(UI_KEY) ?? null) ?? {}) as { scale?: unknown; motion?: unknown; wrist?: unknown };
  // Said only once they have chosen: an empty list is them taking every tab off, and nothing kept is no choice.
  const pins = json(store?.getItem(PINS_KEY) ?? null);
  // What was in their hand in their own room: it goes on through a door opened from here. Read through the same
  // check as one said on a link, and the world they arrive in takes it in hand only if it is in their own bag.
  const held = json(store?.getItem(HELD_KEY) ?? null);
  return cleanSettings({
    ...(held === "" || (held && typeof held === "object") ? { holding: held } : {}),
    ...(Array.isArray(pins) ? { pins } : {}),
    ...(sound && typeof sound === "object" ? { sound } : {}),
    ...(typeof ui.scale === "number" ? { text: ui.scale } : {}),
    ...(typeof ui.motion === "boolean" ? { motion: ui.motion } : {}),
    ...(typeof ui.wrist === "string" ? { wrist: ui.wrist } : {}),
    full: prefs.full,
    intense: prefs.intense,
    look: prefs.look,
    ...(prefs.fov === null ? {} : { fov: prefs.fov }),
    pictures: prefs.pictures,
    chat: prefs.chat,
    // Their switch for everything people carry, set in the Bag tab of any menu: off here is off in the next world.
    items: store?.getItem(ITEMS_KEY) !== "off",
  });
}

/**
 * What goes on through a door: what this browser keeps, and over it whatever
 * the place they are leaving said they have now. A world's menu is where most
 * settings are changed, so what it says is the newer word.
 */
export function settingsToCarry(kept: TravelSettings, said: TravelSettings | undefined): TravelSettings {
  return cleanSettings({ ...kept, ...said, ...(kept.sound || said?.sound ? { sound: { ...kept.sound, ...said?.sound } } : {}) });
}
