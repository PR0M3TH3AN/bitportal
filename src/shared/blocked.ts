/**
 * The people a visitor has blocked everywhere (NSWP-02 and NSWP-03, "Blocks that travel").
 *
 * A block made in a world holds in that world: each world is its own site, and one site can't tell another
 * anything. What goes everywhere a visitor goes is their own client. So the list is kept here, in this browser,
 * and the Airlock hands it to each world they arrive in, for that visit.
 *
 * - **How someone gets on it.** A world they are leaving reports who they blocked there. That report is a link,
 *   which anyone can write, so nothing is added unseen: the Airlock names who, and the visitor ticks a box. People
 *   they blocked in BitPortal's own room are on it already, since that room is this site.
 * - **How someone gets off it.** Only here, in Settings. Never from a link.
 * - **What it holds.** Identity keys: people who came by name. A guest is a new key each visit, and no list
 *   can follow one.
 * - **Who learns it.** Each world arrived in is told the keys, so that it can leave them unconnected. That is
 *   the cost of a block that travels, and Settings says so.
 */
import { cleanKeys, LIMITS } from "@nswp/core";

export interface BlockedEverywhere {
  /** Their identity key, as 64 hex characters. */
  key: string;
  /** When, in seconds. */
  at: number;
  /** The site they were blocked on, as a host name, or "" when it isn't known. */
  where: string;
}

const KEY = "bitportal:blocked";
const PENDING = "bitportal:blocked-pending";
/** The room is this site, and keeps the blocks made in it under the kit's own name. */
const ROOM = "nswp:blocked";
type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const local = (): Store | null => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
};
const host = (where: unknown): string => (typeof where === "string" && /^[a-z0-9.-]{1,253}(:\d{1,5})?$/i.test(where) ? where.toLowerCase() : "");

/** Read a kept list, trusting nothing in it. */
export function cleanBlockedEverywhere(input: unknown): BlockedEverywhere[] {
  if (!Array.isArray(input)) return [];
  const out: BlockedEverywhere[] = [];
  for (const b of input) {
    if (!b || typeof b !== "object") continue;
    const { key, at, where } = b as Record<string, unknown>;
    if (typeof key !== "string" || !/^[0-9a-f]{64}$/.test(key) || out.some((x) => x.key === key)) continue;
    out.push({ key, at: typeof at === "number" && Number.isFinite(at) && at > 0 ? Math.floor(at) : 0, where: host(where) });
    if (out.length >= LIMITS.maxBlocked) break;
  }
  return out;
}

const read = (name: string, storage: Store | null): unknown => {
  try {
    return JSON.parse(storage?.getItem(name) ?? "[]");
  } catch {
    return [];
  }
};
const write = (name: string, list: BlockedEverywhere[], storage: Store | null) => {
  try {
    if (list.length) storage?.setItem(name, JSON.stringify(list));
    else storage?.removeItem(name);
  } catch {
    /* it holds for this visit only */
  }
};

export const loadBlockedEverywhere = (storage: Store | null = local()): BlockedEverywhere[] => cleanBlockedEverywhere(read(KEY, storage));
export const storeBlockedEverywhere = (list: BlockedEverywhere[], storage: Store | null = local()): void => write(KEY, cleanBlockedEverywhere(list), storage);

/** The list with these people on it too, newest first. Someone already on it keeps their place. */
export function withBlockedEverywhere(list: BlockedEverywhere[], keys: string[], where: string, now = Math.floor(Date.now() / 1000)): BlockedEverywhere[] {
  const fresh = cleanKeys(keys, LIMITS.maxBlockedOnLink).filter((k) => !list.some((b) => b.key === k));
  return cleanBlockedEverywhere([...fresh.map((key) => ({ key, at: now, where })), ...list]);
}

export function withoutBlockedEverywhere(list: BlockedEverywhere[], key: string): BlockedEverywhere[] {
  return list.filter((b) => b.key !== key);
}

/**
 * People a world reported as blocked, waiting for the visitor's answer. A report that came on the way home has
 * no screen to be answered on, so it waits here until the next one, or until Settings.
 */
export const loadPendingBlocks = (storage: Store | null = local()): BlockedEverywhere[] => cleanBlockedEverywhere(read(PENDING, storage));
export const storePendingBlocks = (list: BlockedEverywhere[], storage: Store | null = local()): void => write(PENDING, cleanBlockedEverywhere(list), storage);

/** What is waiting to be asked about: what was already waiting, and what this link reports, less anyone already blocked. */
export function blocksToAsk(reported: string[] | undefined, pending: BlockedEverywhere[], list: BlockedEverywhere[], where: string, now = Math.floor(Date.now() / 1000)): BlockedEverywhere[] {
  const known = new Set(list.map((b) => b.key));
  return withBlockedEverywhere(pending, reported ?? [], where, now).filter((b) => !known.has(b.key));
}

/** The keys blocked in BitPortal's own room, which is this site: they are part of "everywhere" without being asked about. */
export function roomBlocks(storage: Store | null = local()): string[] {
  const kept = read(ROOM, storage);
  return cleanKeys(Array.isArray(kept) ? kept.map((b) => (b && typeof b === "object" ? (b as { key?: unknown }).key : null)) : [], LIMITS.maxBlocked);
}

/** The keys that go with the visitor to the next world: their list and their room's, once each, within the limit. */
export function blockedToCarry(list: BlockedEverywhere[], room: string[]): string[] {
  return cleanKeys([...list.map((b) => b.key), ...room], LIMITS.maxBlocked);
}
