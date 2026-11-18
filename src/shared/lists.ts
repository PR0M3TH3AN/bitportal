/**
 * The lists a visitor follows (NSWP-08, "Following one").
 *
 * A list is someone's signed choice of worlds. The visitor follows one by its
 * address, and it becomes a shelf of its own. Which lists they follow is kept
 * on this device and nowhere else: following tells the curator nothing.
 *
 * Each followed list keeps the last copy of itself and of its worlds'
 * announcements, so its shelf is there before any relay answers.
 */
import {
  coordinate,
  CURATION_SET_KIND,
  decodeNaddr,
  latestAddressable,
  parseCoordinate,
  parseListEvent,
  parseWorldEvent,
  queryRelays,
  verifyEvent,
  WORLD_KIND,
  type NostrEvent,
  type WorldList,
} from "@nswp/core";

export interface FollowedList {
  /** The list's coordinate, `30004:<pubkey>:<d>`. It fixes the curator's key. */
  id: string;
  event: NostrEvent;
  /** The newest announcements seen for the worlds it names. */
  worlds: NostrEvent[];
  /** Seconds since 1970. */
  followedAt: number;
}

const KEY = "bitportal:lists";
export const FOLLOW_LIMIT = 8;
/** How many of a list's announcements are kept between visits. */
export const KEPT_WORLDS = 60;

/** A list event that checks out, with its coordinate. Anything else is null. */
export function readList(event: unknown): (WorldList & { coordinate: string; pubkey: string }) | null {
  if (!verifyEvent(event) || event.kind !== CURATION_SET_KIND) return null;
  const parsed = parseListEvent(event);
  if (!parsed.ok || !parsed.value.coordinate || !parsed.value.pubkey) return null;
  return parsed.value as WorldList & { coordinate: string; pubkey: string };
}

function worldId(event: unknown): string | null {
  if (!verifyEvent(event) || event.kind !== WORLD_KIND) return null;
  const parsed = parseWorldEvent(event);
  return parsed.ok ? coordinate({ kind: WORLD_KIND, pubkey: event.pubkey, identifier: parsed.value.d }) : null;
}

/** The newest valid announcement for each world `list` names, in the list's order. */
function worldsFor(list: WorldList, events: unknown[]): NostrEvent[] {
  const newest = new Map<string, NostrEvent>();
  for (const e of events) {
    const id = worldId(e);
    if (!id || !list.worlds.includes(id)) continue;
    const cur = newest.get(id);
    if (!cur || (e as NostrEvent).created_at > cur.created_at) newest.set(id, e as NostrEvent);
  }
  return list.worlds.flatMap((id) => newest.get(id) ?? []).slice(0, KEPT_WORLDS);
}

/** Read a stored set of followed lists, keeping only what still checks out. */
export function parseFollowed(raw: unknown): FollowedList[] {
  if (!Array.isArray(raw)) return [];
  const out: FollowedList[] = [];
  for (const item of raw as Partial<FollowedList>[]) {
    if (!item || typeof item !== "object") continue;
    const list = readList(item.event);
    if (!list || list.coordinate !== item.id || out.some((f) => f.id === list.coordinate)) continue;
    out.push({
      id: list.coordinate,
      event: item.event as NostrEvent,
      worlds: worldsFor(list, Array.isArray(item.worlds) ? item.worlds : []),
      followedAt: typeof item.followedAt === "number" ? item.followedAt : 0,
    });
    if (out.length === FOLLOW_LIMIT) break;
  }
  return out;
}

export function loadFollowed(): FollowedList[] {
  try {
    return parseFollowed(JSON.parse(window.localStorage.getItem(KEY) ?? "[]"));
  } catch {
    return [];
  }
}

/** Returns false when this browser isn't keeping it. */
export function storeFollowed(list: FollowedList[]): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export const isFollowed = (list: FollowedList[], id: string): boolean => list.some((f) => f.id === id);

/** Follow a list. Returns the same array when the event isn't a list, or there is no room. */
export function follow(list: FollowedList[], event: unknown, worlds: unknown[], now: number): FollowedList[] {
  const read = readList(event);
  if (!read) return list;
  const kept = list.filter((f) => f.id !== read.coordinate);
  if (kept.length >= FOLLOW_LIMIT) return list;
  return [...kept, { id: read.coordinate, event: event as NostrEvent, worlds: worldsFor(read, worlds), followedAt: now }];
}

export function unfollow(list: FollowedList[], id: string): FollowedList[] {
  return list.some((f) => f.id === id) ? list.filter((f) => f.id !== id) : list;
}

/**
 * Take newer copies from what relays sent. A list changes only when the same
 * key signed a later copy of the same list; its worlds' announcements are
 * refreshed alongside. Returns the same array when nothing changed.
 */
export function refreshFollowed(list: FollowedList[], events: unknown[]): FollowedList[] {
  let changed = false;
  const next = list.map((f) => {
    let event = f.event;
    for (const e of events) {
      const read = readList(e);
      if (read && read.coordinate === f.id && (e as NostrEvent).created_at > event.created_at) event = e as NostrEvent;
    }
    const read = readList(event)!;
    const worlds = worldsFor(read, [...f.worlds, ...events]);
    if (event === f.event && worlds.length === f.worlds.length && worlds.every((w, i) => w.id === f.worlds[i]!.id)) return f;
    changed = true;
    return { ...f, event, worlds };
  });
  return changed ? next : list;
}

/** The keys to ask relays about: each list's curator, and the author of each world it names. */
export function followedAuthors(list: FollowedList[]): string[] {
  const out = new Set<string>();
  for (const f of list) {
    const read = readList(f.event);
    if (!read) continue;
    out.add(read.pubkey);
    for (const w of read.worlds) {
      const c = parseCoordinate(w);
      if (c) out.add(c.pubkey);
    }
  }
  return [...out];
}

export interface ListAddress {
  pubkey: string;
  d: string;
  relays: string[];
}

/**
 * Read what a visitor typed or pasted as a list's address: an `naddr`, with or
 * without `nostr:` in front, a link that carries one as `?list=`, or the bare
 * coordinate.
 */
export function readListAddress(text: string): { address: ListAddress } | { error: string } {
  let t = text.trim();
  if (!t) return { error: "Paste a list's address. It starts with naddr1." };
  try {
    const fromLink = new URL(t).searchParams.get("list");
    if (fromLink) t = fromLink;
  } catch {
    /* not a link */
  }
  t = t.replace(/^nostr:/i, "");
  if (t.startsWith("naddr1")) {
    try {
      const p = decodeNaddr(t);
      if (p.kind === WORLD_KIND) return { error: "That is the address of a world, not of a list." };
      if (p.kind !== CURATION_SET_KIND) return { error: "That address isn't a list of worlds." };
      return { address: { pubkey: p.pubkey, d: p.identifier, relays: (p.relays ?? []).filter((r) => r.startsWith("wss://")).slice(0, 3) } };
    } catch {
      return { error: "That address is damaged. Copy it again, whole." };
    }
  }
  const c = parseCoordinate(t);
  if (c && c.kind === CURATION_SET_KIND) return { address: { pubkey: c.pubkey, d: c.identifier, relays: [] } };
  return { error: "That isn't a list's address. It starts with naddr1." };
}

/** Find a list on relays, with the announcements of the worlds it names. Null when no relay has it. */
export async function findList(address: ListAddress, relays: string[]): Promise<{ event: NostrEvent; list: WorldList; worlds: NostrEvent[] } | null> {
  const ask = [...new Set([...relays, ...address.relays])].slice(0, 8);
  const res = await queryRelays(ask, { kinds: [CURATION_SET_KIND], authors: [address.pubkey], "#d": [address.d] }, 5000);
  const event = latestAddressable(res.events.filter((e) => readList(e)?.d === address.d && e.pubkey === address.pubkey))[0];
  const list = event ? readList(event) : null;
  if (!event || !list) return null;
  const authors = [...new Set(list.worlds.flatMap((w) => parseCoordinate(w)?.pubkey ?? []))].slice(0, 100);
  const worlds = authors.length ? (await queryRelays(ask, { kinds: [WORLD_KIND], authors, limit: 400 }, 5000)).events : [];
  return { event, list, worlds: worldsFor(list, worlds) };
}
