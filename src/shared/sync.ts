/**
 * A visitor's settings, kept with their profile so they follow them to
 * another device.
 *
 * Everything BitPortal knows about a visitor lives in the browser they are
 * using. That is the right place for it: it is fast, it works with no
 * network, and nothing about them is anywhere else. It also means a second
 * device starts from nothing. So a signed-in visitor can ask for a copy to be
 * kept with their profile: one note on their relays, **sealed so that only
 * their own key can read it**, which any of their devices can fetch.
 *
 * The browser's own copy stays the one that is used. It is read first, at
 * once, as before. The note is fetched behind it, and whichever of the two
 * changed a setting last wins, a section at a time.
 *
 * What this is careful about:
 *
 * - **It is off until the visitor turns it on.** Putting anything of theirs
 *   on a relay, sealed or not, is theirs to decide.
 * - **Only their own client reads it.** A world never does: it couldn't open
 *   it, and a world asking relays about its visitors would be a way to follow
 *   them. A world is told a visitor's settings the way it always is, by the
 *   visitor's client, as they arrive.
 * - **Some things never go in it.** Where they have been and which publishers
 *   they have seen (a new device should be shown the Airlock once), whether
 *   their microphone may travel (given per device), their computers and the
 *   worlds they are building (a device's own, and a way to a shell), going by
 *   name as a habit (never a default), and files, which are too large.
 * - **Nothing in it is trusted more for having been sealed.** Every value is
 *   read back through the same checks as a value from this browser.
 *
 * The note is NIP-78 application data (kind 30078), addressed
 * `bitportal/settings`, its content sealed with NIP-44 to the visitor's own
 * key.
 */
import type { EventTemplate, NostrEvent } from "@nswp/core";

/** NIP-78: data an application keeps for a user. Replaceable, by its `d` tag. */
export const SETTINGS_KIND = 30078;
export const SETTINGS_D = "bitportal/settings";
/** Where this browser keeps what it knows of the last sync. */
export const SYNC_KEY = "bitportal:sync";
/** The most one section may be, as text. A larger one is left out, and stays in this browser only. */
export const SECTION_LIMIT = 16_000;
/** The most the whole note may be before sealing. NIP-44 takes no more than 65,535 bytes. */
export const NOTE_LIMIT = 56_000;

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** One thing that is kept: where it lives in the browser, and how it is made ready to travel and put back. */
export interface Section {
  name: string;
  key: string;
  /** What goes in the note, from what the browser keeps. Left out, the kept text itself. */
  pack?(kept: string | null, store: Store | null): string | null;
  /** What to keep, given what arrived and what is kept now. Left out, what arrived. */
  unpack?(arrived: string | null, kept: string | null): string | null;
}

const json = (text: string | null): unknown => {
  try {
    return text === null ? null : JSON.parse(text);
  } catch {
    return null;
  }
};

/**
 * Everything that travels, most worth keeping first. If the note would be too
 * large, the last are left out first.
 */
export const SECTIONS: Section[] = [
  { name: "settings", key: "bitportal:settings" },
  {
    name: "sound",
    key: "bitportal:sound",
    // Hearing other people's music is a thing said yes to on each device: it stays where it was said.
    pack(kept) {
      const v = json(kept);
      if (!v || typeof v !== "object") return null;
      const { hearShared: _here, ...rest } = v as Record<string, unknown>;
      return JSON.stringify(rest);
    },
    unpack(arrived, kept) {
      const a = json(arrived);
      if (!a || typeof a !== "object") return kept;
      const here = json(kept) as Record<string, unknown> | null;
      const { hearShared: _theirs, ...rest } = a as Record<string, unknown>;
      return JSON.stringify({ ...rest, ...(here && typeof here.hearShared === "boolean" ? { hearShared: here.hearShared } : {}) });
    },
  },
  { name: "ui", key: "nswp:ui" },
  { name: "comfort", key: "nswp:comfort" },
  { name: "moving", key: "bitportal:fps" },
  // What they prefer in every world: a filled screen, how fast the view turns, how wide they see (prefs.ts).
  { name: "screen", key: "nswp:full" },
  { name: "desk", key: "nswp:desk" },
  // Whether they see other people's pictures: a preference like the rest.
  { name: "pictures", key: "nswp:pictures" },
  // Whether they see what people write in a room: the same.
  { name: "chat", key: "nswp:chat" },
  { name: "blocked", key: "bitportal:blocked" },
  { name: "home", key: "bitportal:home" },
  { name: "lists", key: "bitportal:lists" },
  { name: "hashtags", key: "bitportal:hashtags" },
  {
    name: "saved",
    key: "bitportal:saved",
    // A saved door is kept with its whole signed announcement, which is large and is on the relays already. What
    // travels is which doors, and where on the wall. The announcements are fetched again where they arrive.
    pack(kept, store) {
      // The doors this browser has, and the ones it has been told of and is still fetching: together they are the
      // visitor's doors, so a door that hasn't arrived yet is never mistaken for one that was taken down.
      const have = pointers(json(kept));
      const coming = pointers(json(store?.getItem(WANTED_KEY) ?? null)).filter((w) => !have.some((h) => h.id === w.id));
      const all = tidyDoors([...have, ...coming]);
      return all.length || kept !== null ? JSON.stringify(all) : null;
    },
    // Put back by `reconcileSaved`, which is handed the announcements: this only says which doors are wanted.
    unpack(_arrived, kept) {
      return kept;
    },
  },
  { name: "look", key: "bitportal:look" },
  { name: "room", key: "bitportal:room" },
];

/** Saved doors that have been heard of from the profile and whose announcements haven't been fetched yet. */
export const WANTED_KEY = "bitportal:saved-wanted";
export interface DoorPointer {
  id: string;
  slot: number;
  savedAt: number;
}
/** Which doors, from anything that might be a list of them. */
function pointers(list: unknown): DoorPointer[] {
  if (!Array.isArray(list)) return [];
  return list.flatMap((s: { id?: unknown; slot?: unknown; savedAt?: unknown }) =>
    s && typeof s.id === "string" && /^\d+:[0-9a-f]{64}:.{1,200}$/.test(s.id) ? [{ id: s.id, slot: Number.isInteger(s.slot) && (s.slot as number) >= 0 ? (s.slot as number) : 0, savedAt: typeof s.savedAt === "number" ? s.savedAt : 0 }] : [],
  );
}
/** The same doors always in the same order, once each, and no more than a wall and a list will hold. */
function tidyDoors(doors: DoorPointer[]): DoorPointer[] {
  const seen = new Set<string>();
  return doors
    .filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true)))
    .sort((a, b) => a.slot - b.slot || (a.id < b.id ? -1 : 1))
    .slice(0, 60);
}

/**
 * Make this browser's saved doors the ones the profile has. A saved door is
 * kept with its signed announcement, so each needs one: from the doors
 * already here, or from `find` (the list that ships with the page, or a
 * relay). A door whose announcement can't be found yet is remembered as
 * wanted and asked for again next time. Returns the doors still wanted.
 */
export function reconcileSaved(store: Store | null, wanted: DoorPointer[], find: (id: string) => NostrEvent | null): DoorPointer[] {
  const here = json(store?.getItem("bitportal:saved") ?? null);
  const have = new Map<string, NostrEvent>();
  if (Array.isArray(here)) for (const s of here as { id?: unknown; event?: unknown }[]) if (s && typeof s.id === "string" && s.event) have.set(s.id, s.event as NostrEvent);
  const keep: { id: string; event: NostrEvent; savedAt: number; slot: number }[] = [];
  const missing: DoorPointer[] = [];
  for (const door of tidyDoors(pointers(wanted))) {
    const event = have.get(door.id) ?? find(door.id);
    if (event) keep.push({ id: door.id, event, savedAt: door.savedAt, slot: door.slot });
    else missing.push(door);
  }
  try {
    store?.setItem("bitportal:saved", JSON.stringify(keep));
    if (missing.length) store?.setItem(WANTED_KEY, JSON.stringify(missing));
    else store?.removeItem(WANTED_KEY);
  } catch {
    /* this browser wouldn't keep it */
  }
  return missing;
}

/** What is kept of each section: its value as it travels, and when it last changed, in milliseconds. */
export type Snapshot = Record<string, { at: number; value: string | null }>;

/** What this browser remembers of syncing. */
export interface SyncState {
  /** The visitor has asked for their settings to be kept with their profile. */
  on: boolean;
  /** Whose profile this browser last synced with. */
  who: string;
  /** For each section: when it last changed, and a mark of what it was then, so a change made since can be seen. */
  at: Record<string, number>;
  mark: Record<string, string>;
  /** When the note was last sent or fetched, in milliseconds. */
  syncedAt: number;
}

export const NO_SYNC: SyncState = { on: false, who: "", at: {}, mark: {}, syncedAt: 0 };

export function loadSync(store: Store | null): SyncState {
  const v = json(store?.getItem(SYNC_KEY) ?? null) as Partial<SyncState> | null;
  if (!v || typeof v !== "object") return { ...NO_SYNC };
  const numbers = (o: unknown) => Object.fromEntries(Object.entries(o && typeof o === "object" ? (o as Record<string, unknown>) : {}).filter((e): e is [string, number] => typeof e[1] === "number" && Number.isFinite(e[1])));
  const texts = (o: unknown) => Object.fromEntries(Object.entries(o && typeof o === "object" ? (o as Record<string, unknown>) : {}).filter((e): e is [string, string] => typeof e[1] === "string"));
  return { on: v.on === true, who: typeof v.who === "string" && /^[0-9a-f]{64}$/.test(v.who) ? v.who : "", at: numbers(v.at), mark: texts(v.mark), syncedAt: typeof v.syncedAt === "number" ? v.syncedAt : 0 };
}

export function storeSync(store: Store | null, state: SyncState): void {
  try {
    store?.setItem(SYNC_KEY, JSON.stringify(state));
  } catch {
    /* it is worked out again next time */
  }
}

/** A short mark of a text: enough to tell that it changed, and nothing that could be read back. */
export function markOf(text: string | null): string {
  if (text === null) return "-";
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return `${text.length}:${(h >>> 0).toString(36)}`;
}

/** What this browser has now, as it would travel, with when each section last changed. A change since the last sync is dated now. */
export function snapshot(store: Store | null, state: SyncState, now: number): Snapshot {
  const out: Snapshot = {};
  for (const s of SECTIONS) {
    const kept = store?.getItem(s.key) ?? null;
    const packed = s.pack ? s.pack(kept, store) : kept;
    const value = packed !== null && packed.length > SECTION_LIMIT ? null : packed;
    const changed = markOf(value) !== (state.mark[s.name] ?? "-");
    out[s.name] = { value, at: changed ? now : (state.at[s.name] ?? 0) };
  }
  return out;
}

/**
 * Which copy of each section to keep. The one that changed last wins.
 *
 * The first time a browser syncs with a profile is different: it knows
 * nothing of when its own settings were made, and a fresh browser's defaults
 * must not wipe out what the profile already has. So that once, whatever the
 * profile has is taken, and only what it doesn't have is sent. Saved doors
 * and blocked people are added together that once, so nothing is lost.
 */
export function merge(mine: Snapshot, theirs: Snapshot, first: boolean): { result: Snapshot; take: string[]; send: boolean } {
  const result: Snapshot = {};
  const take: string[] = [];
  let send = false;
  for (const s of SECTIONS) {
    const a = mine[s.name] ?? { at: 0, value: null };
    const b = theirs[s.name];
    if (!b || b.value === null) {
      result[s.name] = a;
      if (a.value !== null) send = true;
      continue;
    }
    if (first && a.value !== null && (s.name === "saved" || s.name === "blocked")) {
      const joined = join(s.name, a.value, b.value);
      result[s.name] = { value: joined, at: Math.max(a.at, b.at) };
      if (joined !== a.value) take.push(s.name);
      if (joined !== b.value) send = true;
      continue;
    }
    const theirsWins = first || b.at > a.at;
    if (theirsWins) {
      result[s.name] = b;
      if (b.value !== a.value) take.push(s.name);
    } else {
      result[s.name] = a;
      if (a.at > b.at && a.value !== b.value) send = true;
    }
  }
  return { result, take, send };
}

/** Two lists of the same kind, as one, with nothing twice. */
function join(name: string, a: string, b: string): string {
  const id = name === "saved" ? "id" : "key";
  const seen = new Set<string>();
  const out: unknown[] = [];
  for (const item of [...((json(a) as unknown[]) ?? []), ...((json(b) as unknown[]) ?? [])]) {
    const k = item && typeof item === "object" ? (item as Record<string, unknown>)[id] : null;
    if (typeof k !== "string" || seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return JSON.stringify(name === "saved" ? tidyDoors(pointers(out)) : out);
}

/** The note's contents before sealing. Sections are left out from the end until it fits. */
export function noteText(snapshot: Snapshot): string {
  const sections: Record<string, { at: number; value: string }> = {};
  for (const s of SECTIONS) {
    const v = snapshot[s.name];
    if (!v || v.value === null) continue;
    sections[s.name] = { at: v.at, value: v.value };
    if (JSON.stringify({ v: 1, sections }).length > NOTE_LIMIT) {
      delete sections[s.name];
      break;
    }
  }
  return JSON.stringify({ v: 1, sections });
}

/** A note's contents, once opened. Anything that isn't a section this client knows, or is out of bounds, is left out. */
export function readNote(text: string): Snapshot {
  const out: Snapshot = {};
  const v = json(text) as { v?: unknown; sections?: unknown } | null;
  if (!v || v.v !== 1 || !v.sections || typeof v.sections !== "object") return out;
  for (const s of SECTIONS) {
    const got = (v.sections as Record<string, unknown>)[s.name] as { at?: unknown; value?: unknown } | undefined;
    if (!got || typeof got.value !== "string" || got.value.length > SECTION_LIMIT) continue;
    if (typeof got.at !== "number" || !Number.isFinite(got.at) || got.at < 0) continue;
    out[s.name] = { at: got.at, value: got.value };
  }
  return out;
}

/** The note to sign, with its contents already sealed. */
export function noteTemplate(sealed: string, now: number): EventTemplate {
  return { kind: SETTINGS_KIND, created_at: Math.floor(now / 1000), tags: [["d", SETTINGS_D]], content: sealed };
}

/** What can sign and seal for the visitor without ever handing over their key. */
export interface Vault {
  pubkey: string;
  sign(template: EventTemplate): Promise<NostrEvent>;
  /** Seal text so that only this same key can open it. */
  seal(text: string): Promise<string>;
  open(sealed: string): Promise<string>;
}

/** Where the note is kept: the visitor's relays. */
export interface Shelf {
  /** The newest note this key has put there, or null. Its signature has been checked. */
  fetch(pubkey: string): Promise<NostrEvent | null>;
  put(event: NostrEvent): Promise<boolean>;
}

export interface SyncOutcome {
  /** Sections whose values in this browser were replaced by what the profile had. */
  took: string[];
  /** The note was sent. */
  sent: boolean;
  /** The profile's saved doors, when they were taken. Null when they weren't. */
  wanted: DoorPointer[] | null;
  /** Of those, the doors whose announcements this browser doesn't have yet. Fetch them and call `reconcileSaved` again. */
  missing?: DoorPointer[];
  /** Why nothing happened, when nothing did. */
  why?: string;
}

/**
 * One round: read what this browser has, fetch the note, keep the newer of
 * each section, put what was taken into the browser, and send the note if
 * this browser had anything newer. Never throws: a relay that doesn't answer
 * or a note that can't be opened leaves everything as it was.
 */
export async function syncOnce(o: { store: Store | null; vault: Vault; shelf: Shelf; now?: number; find?: (id: string) => NostrEvent | null }): Promise<SyncOutcome> {
  const now = o.now ?? Date.now();
  const state = loadSync(o.store);
  const outcome: SyncOutcome = { took: [], sent: false, wanted: null };
  if (!state.on) return { ...outcome, why: "off" };
  const first = state.who !== o.vault.pubkey;
  const fresh: SyncState = first ? { ...NO_SYNC, on: true, who: o.vault.pubkey } : state;
  const mine = snapshot(o.store, fresh, now);
  let theirs: Snapshot = {};
  try {
    const note = await o.shelf.fetch(o.vault.pubkey);
    if (note && note.pubkey === o.vault.pubkey && note.kind === SETTINGS_KIND) theirs = readNote(await o.vault.open(note.content));
  } catch {
    // A note that can't be fetched or opened is not a reason to overwrite it: stop here, and try again another time.
    return { ...outcome, why: "unreadable" };
  }
  const { result, take, send } = merge(mine, theirs, first);
  for (const s of SECTIONS) {
    if (!take.includes(s.name)) continue;
    const arrived = result[s.name]!.value;
    if (s.name === "saved") {
      // Kept as wanted at once, so that until their announcements are fetched this browser still counts them as
      // the visitor's doors and doesn't send word that they were taken down.
      outcome.wanted = tidyDoors(pointers(json(arrived)));
      outcome.missing = reconcileSaved(o.store, outcome.wanted, o.find ?? (() => null));
      continue;
    }
    const kept = o.store?.getItem(s.key) ?? null;
    const next = s.unpack ? s.unpack(arrived, kept) : arrived;
    try {
      if (next === null) o.store?.removeItem(s.key);
      else o.store?.setItem(s.key, next);
    } catch {
      /* this browser wouldn't keep it */
    }
  }
  outcome.took = take;
  if (send) {
    try {
      outcome.sent = await o.shelf.put(await o.vault.sign(noteTemplate(await o.vault.seal(noteText(result)), now)));
    } catch {
      outcome.sent = false;
    }
  }
  // Remember what each section was, so the next change made here can be told from this one. A section that
  // still has to be sent keeps its old mark, and is tried again.
  const next: SyncState = { on: true, who: o.vault.pubkey, at: {}, mark: {}, syncedAt: now };
  for (const s of SECTIONS) {
    const v = result[s.name]!;
    const settled = !send || outcome.sent || take.includes(s.name);
    next.at[s.name] = v.at;
    next.mark[s.name] = settled ? markOf(v.value) : (fresh.mark[s.name] ?? "-");
  }
  storeSync(o.store, next);
  return outcome;
}

/** Take what is kept with the profile off the relays: the note is replaced with an empty one. */
export async function emptyNote(o: { vault: Vault; shelf: Shelf; now?: number }): Promise<boolean> {
  try {
    const now = o.now ?? Date.now();
    return await o.shelf.put(await o.vault.sign(noteTemplate(await o.vault.seal(JSON.stringify({ v: 1, sections: {} })), now)));
  } catch {
    return false;
  }
}
