/**
 * The worlds a visitor is building, and has chosen to bring their terminals
 * to (NSWP's browser/bridge.md, "A world of your own").
 *
 * Naming a world here is a serious thing to do: when the visitor goes there
 * from their room, that world's own page is handed leave to open a terminal
 * on their computer. So a world gets on this list one way only: the visitor
 * types its address themselves, on a flat screen, and presses the button.
 * No link, door or world can add one. The list stays in this browser.
 *
 * It is one of three locks. The second is at the computer: its Bridge
 * honours only worlds it was started with. The third is the question the
 * Bridge asks there before each terminal opens.
 */
import { cleanName, cleanWorldOrigin, isPublicKey } from "@nswp/core";

export interface MyWorld {
  /** The address to open: the world's page, without anything after `#`. */
  url: string;
  /** What the grant names: the address's origin. */
  origin: string;
  name: string;
  /** The Bridge of the computer whose terminals go there. */
  computer: string;
  /** Whose world and computer these are: the key signed in when it was named. */
  owner: string;
  addedAt: number;
}

const KEY = "bitportal:my-worlds";
export const MY_WORLDS_LIMIT = 8;

/** An address a visitor typed, as the page to open: https, or their own computer. Null for anything else. */
export function cleanWorldUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const text = input.trim();
  // Someone typing "my-world.example" means the encrypted site of that name; "localhost:5173" means this computer.
  const typed = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : /^(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(text) ? `http://${text}` : `https://${text}`;
  if (!cleanWorldOrigin(typed)) return null;
  const u = new URL(typed);
  u.hash = "";
  return u.href;
}

export function parseMyWorlds(raw: unknown): MyWorld[] {
  if (!Array.isArray(raw)) return [];
  const out: MyWorld[] = [];
  for (const item of raw as Partial<MyWorld>[]) {
    if (!item || typeof item !== "object") continue;
    const url = cleanWorldUrl(item.url);
    const origin = url ? cleanWorldOrigin(url) : null;
    if (!url || !origin || !isPublicKey(item.computer) || !isPublicKey(item.owner) || item.computer === item.owner) continue;
    if (out.some((w) => w.origin === origin && w.owner === item.owner)) continue; // one entry for a world: its origin is what is trusted
    out.push({
      url,
      origin,
      name: (typeof item.name === "string" && cleanName(item.name).slice(0, 32)) || new URL(url).host,
      computer: item.computer,
      owner: item.owner,
      addedAt: typeof item.addedAt === "number" && Number.isFinite(item.addedAt) ? item.addedAt : 0,
    });
    if (out.length === MY_WORLDS_LIMIT * 4) break;
  }
  return out;
}

export function loadMyWorlds(storage: Pick<Storage, "getItem"> = localStorage): MyWorld[] {
  try {
    return parseMyWorlds(JSON.parse(storage.getItem(KEY) ?? "[]"));
  } catch {
    return [];
  }
}

export function storeMyWorlds(list: MyWorld[], storage: Pick<Storage, "setItem"> = localStorage): void {
  try {
    storage.setItem(KEY, JSON.stringify(parseMyWorlds(list)));
  } catch {
    /* not kept: it is named again next time */
  }
}

export function myWorldsOf(list: MyWorld[], owner: string): MyWorld[] {
  return list.filter((w) => w.owner === owner).sort((a, b) => a.addedAt - b.addedAt);
}

/** Add one, or change the one already there for that origin. Null when it isn't a world, or this owner has as many as are kept. */
export function addMyWorld(list: MyWorld[], w: Omit<MyWorld, "origin"> & { origin?: string }): MyWorld[] | null {
  const [clean] = parseMyWorlds([w]);
  if (!clean) return null;
  const others = list.filter((x) => !(x.origin === clean.origin && x.owner === clean.owner));
  if (myWorldsOf(others, clean.owner).length >= MY_WORLDS_LIMIT) return null;
  return [...others, clean];
}

export function removeMyWorld(list: MyWorld[], origin: string, owner: string): MyWorld[] {
  return list.filter((w) => !(w.origin === origin && w.owner === owner));
}
