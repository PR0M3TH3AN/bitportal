/**
 * Nostr profiles: the name and the picture people gave themselves (kind 0).
 *
 * BitPortal shows people by the name they chose, never by a string of hex.
 * The name is theirs to choose and anyone may choose any name, so where what
 * matters is *which key* did something (who signed a list, who announced a
 * world), the short form of the key is shown beside the name. Where there is
 * no name at all, the short key stands in for it.
 *
 * Profiles are kept in this browser once they have been fetched, so a page
 * shows names at once and asks the visitor's own relays again in the
 * background. Asking a relay about a key tells that relay which keys this
 * browser looked at: the same as reading Nostr anywhere.
 *
 * A picture is fetched from wherever its owner keeps it, which tells that
 * place the visitor's address. It is shown only while the visitor has
 * pictures on (the kit's switch, `showsPictures`), and it is only ever drawn.
 */
import { cleanName, cleanPicture, isHex64, queryRelays, shortNpub, verifyEvent, type NostrEvent } from "@nswp/core";
import { loadPicture } from "nswp-sdk/ui";

export interface Profile {
  name: string;
  /** Where their picture is, or "". */
  picture: string;
  /** When they wrote it. A newer one replaces an older one, never the other way. */
  at: number;
  /** When this browser last asked, in milliseconds. */
  asked: number;
}

export const PROFILES_KEY = "bitportal:profiles";
/** How many are kept, and how long one is taken as it stands before being asked about again. */
export const PROFILES_MOST = 400;
export const PROFILE_FRESH_MS = 6 * 3600 * 1000;
/** What a page hears when names or pictures it may be showing have arrived. */
export const PROFILES_EVENT = "bitportal:profiles";

type Store = Pick<Storage, "getItem" | "setItem">;
const local = (): Store | null => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
};

/** The name and picture in a profile event's content. Either may be "". */
export function readProfile(content: string): { name: string; picture: string } {
  try {
    const meta = JSON.parse(content) as Record<string, unknown>;
    let name = "";
    for (const v of [meta.display_name, meta.displayName, meta.name]) {
      if (typeof v === "string" && cleanName(v)) {
        name = cleanName(v);
        break;
      }
    }
    return { name, picture: cleanPicture(meta.picture) };
  } catch {
    return { name: "", picture: "" };
  }
}

let cache: Map<string, Profile> | null = null;
function all(store: Store | null = local()): Map<string, Profile> {
  if (cache) return cache;
  cache = new Map();
  try {
    const kept = JSON.parse(store?.getItem(PROFILES_KEY) ?? "{}") as Record<string, Partial<Profile>>;
    for (const [key, p] of Object.entries(kept)) {
      if (!isHex64(key) || !p || typeof p !== "object") continue;
      cache.set(key, { name: typeof p.name === "string" ? cleanName(p.name) : "", picture: cleanPicture(p.picture), at: Number(p.at) || 0, asked: Number(p.asked) || 0 });
    }
  } catch {
    /* nothing kept */
  }
  return cache;
}
function keep(store: Store | null = local()): void {
  const map = all(store);
  // The ones asked about longest ago go first when there are too many.
  const newest = [...map].sort((a, b) => b[1].asked - a[1].asked).slice(0, PROFILES_MOST);
  cache = new Map(newest);
  try {
    store?.setItem(PROFILES_KEY, JSON.stringify(Object.fromEntries(newest)));
  } catch {
    /* they last for this page */
  }
}

/** What this browser knows of someone, or null. */
export const profileOf = (pubkey: string): Profile | null => all().get(pubkey) ?? null;

/**
 * What to call someone. Their own name when they have one. `key` adds the
 * short form of their key beside it: for a place where which key it is
 * matters. With no name, the short key alone.
 */
export function label(pubkey: string, opts: { key?: boolean } = {}): string {
  const name = profileOf(pubkey)?.name ?? "";
  if (!name) return shortNpub(pubkey);
  return opts.key ? `${name} (${shortNpub(pubkey)})` : name;
}

/** Take what relays said, newest for each key, into what is kept. Returns the keys whose name or picture changed. */
export function takeProfiles(events: NostrEvent[], asked: string[], now: number, store: Store | null = local()): string[] {
  const map = all(store);
  const changed = new Set<string>();
  for (const e of events) {
    if (e.kind !== 0 || !asked.includes(e.pubkey) || !verifyEvent(e)) continue;
    const had = map.get(e.pubkey);
    if (had && had.at >= e.created_at) continue;
    const read = readProfile(e.content);
    if (!had || had.name !== read.name || had.picture !== read.picture) changed.add(e.pubkey);
    map.set(e.pubkey, { ...read, at: e.created_at, asked: now });
  }
  // Asked about and nothing came: remembered too, so a key with no profile isn't asked about on every page.
  for (const key of asked) {
    const had = map.get(key);
    if (had) had.asked = now;
    else map.set(key, { name: "", picture: "", at: 0, asked: now });
  }
  keep(store);
  return [...changed];
}

/** Ask the relays about these keys, unless they were asked about lately. Settles with the keys that changed. */
export async function fetchProfiles(pubkeys: string[], relays: string[], opts: { now?: number; timeoutMs?: number; force?: boolean } = {}): Promise<string[]> {
  const now = opts.now ?? Date.now();
  const stale = [...new Set(pubkeys)].filter((k) => isHex64(k) && (opts.force || now - (profileOf(k)?.asked ?? 0) > PROFILE_FRESH_MS)).slice(0, 200);
  if (!stale.length || !relays.length) return [];
  try {
    const res = await queryRelays(relays, { kinds: [0], authors: stale, limit: stale.length * 2 }, opts.timeoutMs ?? 3500);
    // No relay answered: nothing is learned, and nothing is marked as asked.
    if (!Object.values(res.relays).some((s) => s === "eose")) return [];
    return takeProfiles(res.events, stale, now);
  } catch {
    return [];
  }
}

let wanted = new Set<string>();
let timer: ReturnType<typeof setTimeout> | undefined;
/**
 * Say which keys a page is showing. They are asked about together, a moment
 * later, and the page hears (`PROFILES_EVENT`) if any name or picture turned
 * out different from what it drew.
 */
export function wantProfiles(pubkeys: Iterable<string>, relays: () => string[]): void {
  for (const k of pubkeys) if (isHex64(k)) wanted.add(k);
  if (timer !== undefined || typeof window === "undefined") return;
  timer = setTimeout(() => {
    timer = undefined;
    const asking = [...wanted];
    wanted = new Set();
    void fetchProfiles(asking, relays()).then((changed) => {
      if (changed.length) window.dispatchEvent(new CustomEvent(PROFILES_EVENT, { detail: { changed } }));
    });
  }, 60);
}

/**
 * Someone's picture as a small round badge, to put on a page, or null. It is
 * the kit's own loader: only https, nothing sent with the request, a limit on
 * size, and nothing fetched while the visitor has pictures off.
 */
export async function pictureOf(pubkey: string): Promise<HTMLCanvasElement | null> {
  const from = profileOf(pubkey)?.picture ?? "";
  if (!from) return null;
  const drawn = await loadPicture(from);
  if (!drawn) return null;
  // Each place on a page gets a copy of its own: a canvas can only be in one place.
  const copy = document.createElement("canvas");
  copy.width = drawn.width;
  copy.height = drawn.height;
  copy.getContext("2d")!.drawImage(drawn, 0, 0);
  copy.className = "who-picture";
  copy.setAttribute("aria-hidden", "true");
  return copy;
}

/** For tests: forget what was read from storage. */
export function resetProfiles(): void {
  cache = null;
  wanted = new Set();
}
