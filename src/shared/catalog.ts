/** The lobby's catalogue: a curator's signed set, and the world events it names (NSWP spec §5.4, §14). */
import { CURATION_SET_KIND, coordinate, getTagValue, parseCoordinate, parseWorldEvent, verifyEvent, WORLD_KIND, type NostrEvent, type World } from "@nswp/core";

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
  /** Position in the curator's list, or null for a world outside it. */
  rank: number | null;
  /** True when the curator wrote this description of someone else's site. */
  curatorListing: boolean;
}

export interface Catalog {
  curator: { pubkey: string; title: string; description: string; updatedAt: number };
  entries: Entry[];
  /** Worlds seen on relays that the curator's set doesn't include. */
  unlisted: Entry[];
}

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
 * Build the catalogue from the bundled starter set plus anything newer from
 * relays. Every event is signature-checked here; nothing is trusted because
 * of where it came from.
 */
export function buildCatalog(bundle: StarterBundle, relayEvents: unknown[] = []): Catalog {
  if (!isValidSet(bundle.set, bundle.curator)) throw new CatalogError("starter_set_invalid", "The bundled starter set failed its signature check.");
  let set = bundle.set;
  const setD = getTagValue(set, "d");
  for (const e of relayEvents) {
    if (isValidSet(e, bundle.curator) && getTagValue(e, "d") === setD && e.created_at > set.created_at) set = e;
  }
  const order: string[] = [];
  for (const t of set.tags) {
    if (t[0] === "a" && t[1] && parseCoordinate(t[1])?.kind === WORLD_KIND && !order.includes(t[1])) order.push(t[1]);
  }

  // Newest valid event per coordinate.
  const newest = new Map<string, { event: NostrEvent; world: World }>();
  for (const e of [...bundle.worlds, ...relayEvents]) {
    if (!verifyEvent(e) || e.kind !== WORLD_KIND) continue;
    const parsed = parseWorldEvent(e);
    if (!parsed.ok || !parsed.value.coordinate) continue;
    const id = coordinate({ kind: WORLD_KIND, pubkey: e.pubkey, identifier: parsed.value.d });
    const cur = newest.get(id);
    if (!cur || e.created_at > cur.event.created_at) newest.set(id, { event: e, world: parsed.value });
  }

  const toEntry = (id: string, rank: number | null): Entry | null => {
    const hit = newest.get(id);
    if (!hit || hit.world.status === "retired") return null;
    return { id, world: hit.world, event: hit.event, rank, curatorListing: hit.event.pubkey === bundle.curator };
  };
  const entries = order.map((id, i) => toEntry(id, i)).filter((e): e is Entry => e !== null);
  const unlisted = [...newest.keys()]
    .filter((id) => !order.includes(id))
    .map((id) => toEntry(id, null))
    .filter((e): e is Entry => e !== null)
    .sort((a, b) => b.world.createdAt - a.world.createdAt);

  return {
    curator: {
      pubkey: bundle.curator,
      title: getTagValue(set, "title") ?? "Starter set",
      description: getTagValue(set, "description") ?? "",
      updatedAt: set.created_at,
    },
    entries,
    unlisted,
  };
}
