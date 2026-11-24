/**
 * What the page that keeps the screen and its picture frame say to each other (bag-pictures.ts, pictures/main.ts).
 *
 * This is BitPortal's own, between two pages of this site: it is no word of NSWP's and no world ever hears it.
 * Down, to the frame: which thing to draw, and in which colours. Up, to the shell: a picture, and which thing it
 * is of. Nothing else crosses either way, and each side takes a message only from the other's own window, at
 * exactly this site's origin.
 */
import type { Item } from "@nswp/core";

export const PICTURES_TAG = "bag-pictures";
export const PICTURES_V = 1;
/** Where the frame's page is served (scripts/build.mjs gives it rules of its own). */
export const PICTURES_PATH = "/shell/pictures/";
/** Pixels along each side of a picture. */
export const PICTURE_SIZE = 256;
/** The most pictures asked for and not yet come: a bag is looked through a page at a time. */
export const PICTURES_ASKED = 36;

/** Down: draw this thing. `id` says which picture is meant, and comes back with it. */
export interface DrawWord {
  bitportal: typeof PICTURES_TAG;
  v: typeof PICTURES_V;
  draw: { id: string; item: Item; tints: Record<string, string> };
}
/** Up: the picture of the thing asked for under `id`. */
export interface PictureWord {
  bitportal: typeof PICTURES_TAG;
  v: typeof PICTURES_V;
  picture: { id: string; bitmap: ImageBitmap };
}

/** Which picture a thing in these colours is: the thing, the very model, the colours. */
export const pictureId = (item: Pick<Item, "id" | "model">, tints?: Record<string, string>): string => `${item.id}|${item.model.sha256}|${JSON.stringify(tints ?? {})}`;

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const tagged = (v: unknown): v is Record<string, unknown> => isRecord(v) && v.bitportal === PICTURES_TAG && v.v === PICTURES_V;
const SHA = /^[0-9a-f]{64}$/;

/** A word down, read by the frame: null unless it is exactly a thing to draw. Its model is fetched only over https. */
export function readDrawWord(said: unknown): DrawWord["draw"] | null {
  if (!tagged(said) || !isRecord(said.draw)) return null;
  const { id, item, tints } = said.draw;
  if (typeof id !== "string" || id.length === 0 || id.length > 2000 || !isRecord(item) || !isRecord(tints)) return null;
  const model = item.model;
  if (typeof item.id !== "string" || !isRecord(model) || typeof model.url !== "string" || !/^https:\/\//.test(model.url) || typeof model.sha256 !== "string" || !SHA.test(model.sha256)) return null;
  const size = item.size;
  if (!Array.isArray(size) || size.length !== 3 || !size.every((n) => typeof n === "number" && Number.isFinite(n) && n > 0)) return null;
  if (!Array.isArray(item.tints) || !Object.values(tints).every((c) => typeof c === "string" && c.length <= 32)) return null;
  return { id, item: item as unknown as Item, tints: tints as Record<string, string> };
}

/**
 * A word up, read by the shell: null unless it is exactly a picture, of the size pictures are, for a thing that was
 * asked for. `bitmap` says what counts as a picture (the browser's `ImageBitmap`; a test gives its own).
 */
export function readPictureWord(said: unknown, asked: (id: string) => boolean, bitmap: (v: unknown) => v is ImageBitmap): PictureWord["picture"] | null {
  if (!tagged(said) || !isRecord(said.picture)) return null;
  const { id, bitmap: picture } = said.picture;
  if (Object.keys(said).length !== 3 || Object.keys(said.picture).length !== 2) return null;
  if (typeof id !== "string" || !asked(id) || !bitmap(picture)) return null;
  if (picture.width !== PICTURE_SIZE || picture.height !== PICTURE_SIZE) return null;
  return { id, bitmap: picture };
}
