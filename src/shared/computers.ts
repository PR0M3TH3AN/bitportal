/**
 * The computers a visitor has added to their home, to open a terminal on
 * (NSWP's browser/bridge.md).
 *
 * Each is a Bridge: a small program the visitor runs on their own computer,
 * which answers their key and nobody else's. What is kept here is its public
 * key, the name the visitor gave it and whose it is. It stays in this browser
 * and is never published: which computers someone owns is nobody's business.
 */
import { cleanName, decodeNpub, isPublicKey } from "@nswp/core";

export interface Computer {
  /** The Bridge's public key. */
  pubkey: string;
  /** What the visitor calls it. */
  name: string;
  /** The key it answers: whoever was signed in when it was added. */
  owner: string;
  /** Where it listens, when that isn't the usual relays. */
  relays: string[];
  /** Seconds since 1970. */
  addedAt: number;
}

const KEY = "bitportal:computers";
export const COMPUTER_LIMIT = 6;
const RELAY_LIMIT = 4;

/** Relay addresses as they may be kept: encrypted connections only, a few of them. */
export function cleanBridgeRelays(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const r of input) {
    if (typeof r !== "string" || r.length > 200) continue;
    try {
      const u = new URL(r);
      if (u.protocol !== "wss:" || u.username || u.password) continue;
      const tidy = u.href.replace(/\/$/, "");
      if (!out.includes(tidy)) out.push(tidy);
    } catch {
      /* not an address */
    }
    if (out.length === RELAY_LIMIT) break;
  }
  return out;
}

/** Read what was kept, dropping anything that isn't what it claims to be. */
export function parseComputers(raw: unknown): Computer[] {
  if (!Array.isArray(raw)) return [];
  const out: Computer[] = [];
  for (const item of raw as Partial<Computer>[]) {
    if (!item || typeof item !== "object" || !isPublicKey(item.pubkey) || !isPublicKey(item.owner) || item.pubkey === item.owner) continue; // real keys only: the right length is not enough
    if (out.some((c) => c.pubkey === item.pubkey && c.owner === item.owner)) continue;
    out.push({
      pubkey: item.pubkey,
      owner: item.owner,
      name: (typeof item.name === "string" && cleanName(item.name).slice(0, 32)) || "My computer",
      relays: cleanBridgeRelays(item.relays),
      addedAt: typeof item.addedAt === "number" && Number.isFinite(item.addedAt) ? item.addedAt : 0,
    });
    if (out.length === COMPUTER_LIMIT * 4) break;
  }
  return out;
}

export function loadComputers(storage: Pick<Storage, "getItem"> = localStorage): Computer[] {
  try {
    return parseComputers(JSON.parse(storage.getItem(KEY) ?? "[]"));
  } catch {
    return [];
  }
}

export function storeComputers(list: Computer[], storage: Pick<Storage, "setItem"> = localStorage): void {
  try {
    storage.setItem(KEY, JSON.stringify(parseComputers(list)));
  } catch {
    /* a full or closed store loses nothing that matters: the Bridge prints its link again */
  }
}

/** The computers that answer this key, oldest first. */
export function computersOf(list: Computer[], owner: string): Computer[] {
  return list.filter((c) => c.owner === owner).sort((a, b) => a.addedAt - b.addedAt);
}

/** Add one, or rename one already there. Returns null when this owner has as many as may be kept. */
export function addComputer(list: Computer[], c: Computer): Computer[] | null {
  const [clean] = parseComputers([c]);
  if (!clean) return null;
  const others = list.filter((x) => !(x.pubkey === clean.pubkey && x.owner === clean.owner));
  if (computersOf(others, clean.owner).length >= COMPUTER_LIMIT) return null;
  return [...others, clean];
}

export function removeComputer(list: Computer[], pubkey: string, owner: string): Computer[] {
  return list.filter((c) => !(c.pubkey === pubkey && c.owner === owner));
}

export interface PairingRequest {
  pubkey: string;
  relays: string[];
}

/**
 * What a pairing link asks: the part of the address after `#`, as the Bridge
 * prints it (`bridge=npub1…`, and `relay=wss://…` for each relay that isn't
 * one of the usual ones). Null when it asks nothing, or asks it badly.
 */
export function pairingRequest(hash: string): PairingRequest | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const key = params.get("bridge");
  if (!key) return null;
  try {
    return { pubkey: decodeNpub(key), relays: cleanBridgeRelays(params.getAll("relay")) };
  } catch {
    return null;
  }
}
