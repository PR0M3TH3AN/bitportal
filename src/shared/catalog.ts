/**
 * The lobby's catalogue: the lists a visitor sees, the worlds those lists
 * name, and the worlds nobody has listed (NSWP-08; spec §5.4, §14).
 */
import { CURATION_SET_KIND, coordinate, getTagValue, parseCoordinate, parseWorldEvent, verifyEvent, WORLD_KIND, type NostrEvent, type World } from "@nswp/core";
import { readList, type FollowedList } from "./lists.js";

export interface StarterBundle {
  curator: string;
  set: NostrEvent;
  worlds: NostrEvent[];
}

export interface Entry {
  /** The world's coordinate, `37300:<pubkey>:<d>`. */
  id: string;
  world: World;
  event: NostrEvent;
  /** Position among the worlds on the visitor's lists, or null for a world on none of them. */
  rank: number | null;
  /** True when a list's curator wrote this description of someone else's site. */
  curatorListing: boolean;
  /** The title of the list whose curator wrote it, when `curatorListing`. */
  listedBy: string | null;
}

/** One list, as the lobby shows it. */
export interface ListView {
  /** The list's coordinate, `30004:<pubkey>:<d>`. */
  id: string;
  title: string;
  description: string;
  pubkey: string;
  updatedAt: number;
  /** BitPortal's own list, which ships with the page. */
  starter: boolean;
  /** The worlds on it that are known and open, in the curator's order. */
  ids: string[];
  /** Worlds it names that no announcement has been found for. */
  missing: number;
}

export interface Catalog {
  /** BitPortal's own list, whether or not the visitor is showing it. */
  curator: { pubkey: string; title: string; description: string; updatedAt: number };
  /** The lists on show: the starter list first, then the ones the visitor follows. */
  lists: ListView[];
  /** Every world on a list on show, once, in that order. */
  entries: Entry[];
  /** Worlds announced on relays that none of those lists name, under the limits below. */
  unlisted: Entry[];
  /** How many more unlisted worlds the limits left out. */
  unlistedHeld: number;
}

export interface CatalogOptions {
  /** Lists the visitor follows. */
  followed?: FollowedList[];
  /** False when the visitor has put BitPortal's own list away. */
  showStarter?: boolean;
  /** Addresses the visitor already has a door to, besides the ones on their lists. */
  taken?: string[];
}

/** What one key can take up among unlisted worlds, and how many are shown in all (NSWP-08). */
export const UNLISTED_LIMITS = { perKey: 3, total: 60 } as const;

export class CatalogError extends Error {
  readonly code: string;
  readonly retryable = false;
  constructor(code: string, message: string) {
    super(message);
    this.name = "BitPortalError";
    this.code = code;
  }
}

function isValidSet(e: unknown, curator: string): e is NostrEvent {
  return verifyEvent(e) && e.kind === CURATION_SET_KIND && e.pubkey === curator;
}

/**
 * Build the catalogue from the bundled starter set, the lists the visitor
 * follows, and anything newer from relays. Every event is signature-checked
 * here; nothing is trusted because of where it came from.
 */
export function buildCatalog(bundle: StarterBundle, relayEvents: unknown[] = [], opts: CatalogOptions = {}): Catalog {
  if (!isValidSet(bundle.set, bundle.curator)) throw new CatalogError("starter_set_invalid", "The bundled starter set failed its signature check.");
  let set = bundle.set;
  const setD = getTagValue(set, "d");
  for (const e of relayEvents) {
    if (isValidSet(e, bundle.curator) && getTagValue(e, "d") === setD && e.created_at > set.created_at) set = e;
  }
  const starterId = coordinate({ kind: CURATION_SET_KIND, pubkey: bundle.curator, identifier: setD ?? "" });
  const curator = {
    pubkey: bundle.curator,
    title: getTagValue(set, "title") ?? "Starter set",
    description: getTagValue(set, "description") ?? "",
    updatedAt: set.created_at,
  };

  // The lists on show, as (who, what they name).
  const shown: { view: Omit<ListView, "ids" | "missing">; names: string[] }[] = [];
  if (opts.showStarter !== false) {
    const names: string[] = [];
    for (const t of set.tags) {
      if (t[0] === "a" && t[1] && parseCoordinate(t[1])?.kind === WORLD_KIND && !names.includes(t[1])) names.push(t[1]);
    }
    shown.push({ view: { id: starterId, ...curator, starter: true }, names });
  }
  const followed = opts.followed ?? [];
  for (const f of followed) {
    const list = readList(f.event);
    if (!list || list.coordinate === starterId || shown.some((s) => s.view.id === list.coordinate)) continue;
    shown.push({ view: { id: list.coordinate, title: list.title, description: list.description, pubkey: list.pubkey, updatedAt: list.createdAt, starter: false }, names: list.worlds });
  }

  // Newest valid event per coordinate.
  const newest = new Map<string, { event: NostrEvent; world: World }>();
  for (const e of [...bundle.worlds, ...followed.flatMap((f) => f.worlds), ...relayEvents]) {
    if (!verifyEvent(e) || e.kind !== WORLD_KIND) continue;
    const parsed = parseWorldEvent(e);
    if (!parsed.ok || !parsed.value.coordinate) continue;
    const id = coordinate({ kind: WORLD_KIND, pubkey: e.pubkey, identifier: parsed.value.d });
    const cur = newest.get(id);
    if (!cur || e.created_at > cur.event.created_at) newest.set(id, { event: e, world: parsed.value });
  }

  const entries: Entry[] = [];
  const byId = new Map<string, Entry>();
  const lists: ListView[] = shown.map(({ view, names }) => {
    const ids: string[] = [];
    let missing = 0;
    for (const id of names) {
      const hit = newest.get(id);
      if (!hit) {
        missing++;
        continue;
      }
      if (hit.world.status === "retired") continue;
      if (!byId.has(id)) {
        const own = hit.event.pubkey === view.pubkey;
        const entry: Entry = { id, world: hit.world, event: hit.event, rank: entries.length, curatorListing: own, listedBy: own ? view.title : null };
        byId.set(id, entry);
        entries.push(entry);
      }
      ids.push(id);
    }
    return { ...view, ids, missing };
  });

  // Worlds nobody on show has listed: newest first, a few per key, and never a
  // second claim on an address the visitor already has a door to.
  const taken = new Set([...entries.map((e) => e.world.url), ...(opts.taken ?? [])]);
  const perKey = new Map<string, number>();
  const unlisted: Entry[] = [];
  let unlistedHeld = 0;
  const loose = [...newest.entries()].filter(([id, hit]) => !byId.has(id) && hit.world.status !== "retired").sort((a, b) => b[1].world.createdAt - a[1].world.createdAt || a[0].localeCompare(b[0]));
  for (const [id, hit] of loose) {
    if (taken.has(hit.world.url)) continue;
    const n = perKey.get(hit.event.pubkey) ?? 0;
    if (n >= UNLISTED_LIMITS.perKey || unlisted.length >= UNLISTED_LIMITS.total) {
      unlistedHeld++;
      continue;
    }
    perKey.set(hit.event.pubkey, n + 1);
    unlisted.push({ id, world: hit.world, event: hit.event, rank: null, curatorListing: false, listedBy: null });
  }

  return { curator, lists, entries, unlisted, unlistedHeld };
}
