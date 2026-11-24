/**
 * The Bag's things drawn as themselves, in the menu the page that keeps the screen draws over a world.
 *
 * Drawing a thing from its model needs the renderer, and this page loads no part of it: a page that only frames a
 * world mustn't pay for Three.js to start (scripts/build.mjs stops the build if the menu's file would load it). So
 * the drawing is done by a small page of this site's own, framed unseen (`/shell/pictures/`, pictures/main.ts),
 * which hands each picture up. This file is this page's side of that: the kit's `ItemPreviews`, as the kit's Bag
 * takes them (`previews`).
 *
 * - **The frame is made only when a picture is wanted and there is none:** the Bag tab opened, with something in
 *   it to show. Never before, and not in a headset, where the world's own console draws the Bag.
 * - **It is dropped when the menu's sheet closes.** The pictures already drawn are kept by this page, so opening
 *   the Bag again shows them at once and makes no frame unless something new is to be drawn.
 * - **What crosses** is in pictures-words.ts: down, which thing and which colours; up, a picture and which thing
 *   it is of. Taken only from the frame's own window, at exactly this site's origin. A picture is painted onto a
 *   canvas and never read.
 * - **Where a thing can't be drawn** (no frame, no WebGL, a model that fails the kit's checks, items off) nothing
 *   comes up, and the kit shows the thing's first letters, as it does with no pictures at all.
 * - **Stills only.** The chosen thing is shown by the same still, not turning.
 */
import type { Item } from "@nswp/core";
import type { ItemPreviews } from "nswp-sdk/bag";
import { PICTURE_SIZE, PICTURES_ASKED, PICTURES_PATH, PICTURES_TAG, PICTURES_V, pictureId, readPictureWord, type DrawWord } from "./pictures-words.js";

export interface FramedPicturesOptions {
  /** Whether the menu's sheet is open: the frame lives no longer than that. */
  open(): boolean;
  /** Whether the world is in a headset session: then nothing is drawn here. */
  presenting(): boolean;
  /** Where the frame is put. Left out, this page's body. */
  parent?: HTMLElement;
  /** How often the sheet is looked at, to drop the frame once it has closed. */
  watchMs?: number;
}

export interface FramedPictures extends ItemPreviews {
  /** Whether the frame is there just now. For trials and tests. */
  readonly framed: boolean;
}

const isBitmap = (v: unknown): v is ImageBitmap => typeof ImageBitmap !== "undefined" && v instanceof ImageBitmap;

export function framedPictures(o: FramedPicturesOptions): FramedPictures {
  const watchers = new Set<() => void>();
  /** Pictures that have come, kept for as long as this page lives. */
  const drawn = new Map<string, HTMLCanvasElement>();
  /** Asked for and not yet come: what to say to the frame, once it is there, for each. */
  const asked = new Map<string, DrawWord["draw"]>();
  let frame: HTMLIFrameElement | null = null;
  let loaded = false;
  let watch: ReturnType<typeof setInterval> | null = null;

  const say = (draw: DrawWord["draw"]): void => {
    const word: DrawWord = { bitportal: PICTURES_TAG, v: PICTURES_V, draw };
    frame?.contentWindow?.postMessage(word, location.origin);
  };
  const drop = (): void => {
    if (watch) clearInterval(watch);
    watch = null;
    frame?.remove();
    frame = null;
    loaded = false;
    // What was asked of a frame that is gone is asked afresh of the next one, when the thing is next shown.
    asked.clear();
  };
  const make = (): void => {
    const made = document.createElement("iframe");
    // Unseen: it only draws. No part of it is ever shown, pressed or given the keys.
    made.hidden = true;
    made.tabIndex = -1;
    made.title = "";
    made.setAttribute("aria-hidden", "true");
    made.referrerPolicy = "no-referrer";
    made.src = PICTURES_PATH;
    made.addEventListener("load", () => {
      if (frame !== made) return;
      loaded = true;
      for (const draw of asked.values()) say(draw);
    });
    frame = made;
    (o.parent ?? document.body).append(made);
    watch = setInterval(() => {
      if (!o.open()) drop();
    }, o.watchMs ?? 250);
  };

  addEventListener("message", (e: MessageEvent) => {
    if (!frame || e.source !== frame.contentWindow || e.origin !== location.origin) return;
    const picture = readPictureWord(e.data, (id) => asked.has(id), isBitmap);
    if (!picture) return;
    asked.delete(picture.id);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = PICTURE_SIZE;
    // Painted, and never read back.
    canvas.getContext("2d")?.drawImage(picture.bitmap, 0, 0, PICTURE_SIZE, PICTURE_SIZE);
    picture.bitmap.close();
    drawn.set(picture.id, canvas);
    for (const fn of watchers) fn();
  });

  const still = (item: Item, tints?: Record<string, string>): HTMLCanvasElement | null => {
    const id = pictureId(item, tints);
    const have = drawn.get(id);
    if (have) return have;
    // Wanted, and not here. Asked of the frame, which is made now if this is the first; only with the sheet open.
    if (asked.has(id) || asked.size >= PICTURES_ASKED || o.presenting() || !o.open()) return null;
    const draw = { id, item, tints: tints ?? {} };
    asked.set(id, draw);
    if (!frame) make();
    else if (loaded) say(draw);
    return null;
  };

  return {
    still,
    // The chosen thing, large: the same still. Turning is not drawn here.
    turning: (item, tints) => still(item, tints),
    onChange(fn) {
      watchers.add(fn);
    },
    get framed() {
      return !!frame;
    },
  };
}
