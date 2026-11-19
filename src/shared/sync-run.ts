/**
 * Keeping a visitor's settings with their profile, as it runs on a page:
 * who signs and seals, where the note is kept, and when a round is made.
 * What a round does, and what may be in the note, is sync.ts.
 *
 * A round is made when a page comes up, and again when the page is put away
 * if anything changed. Nothing is ever waited for: the page has already
 * started from what this browser keeps.
 */
import { finalizeEvent, getConversationKey, getPublicKey, latestAddressable, nip44Decrypt, nip44Encrypt, publishEvent, queryRelays, verifyEvent, WORLD_KIND, type NostrEvent } from "@nswp/core";
import bundleJson from "../starter/starter-set.json";
import { quietVault, readSignedIn } from "./session.js";
import { loadSettings } from "./settings.js";
import { emptyNote, loadSync, reconcileSaved, SETTINGS_D, SETTINGS_KIND, storeSync, syncOnce, WANTED_KEY, type DoorPointer, type Shelf, type SyncOutcome, type Vault } from "./sync.js";

const store = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/** The note's home: the visitor's own relays, the ones BitPortal already reads. */
const relayShelf = (): Shelf => ({
  async fetch(pubkey) {
    const res = await queryRelays(loadSettings().relays, { kinds: [SETTINGS_KIND], authors: [pubkey], "#d": [SETTINGS_D], limit: 4 }, 4000);
    // No relay answered at all: that is not the same as there being no note, and must not look like it.
    if (!Object.values(res.relays).some((s) => s === "eose")) throw new Error("no relay answered");
    const mine = res.events.filter((e) => e.kind === SETTINGS_KIND && e.pubkey === pubkey && verifyEvent(e) && e.tags.some((t) => t[0] === "d" && t[1] === SETTINGS_D));
    return latestAddressable(mine)[0] ?? null;
  },
  async put(event) {
    const sent = await publishEvent(loadSettings().relays, event);
    return Object.values(sent.relays).some((answer) => answer === "ok");
  },
});

// ---- for trying it without anyone signing in --------------------------------------------------------------
// `?signer=test` stands in a throwaway key, made in this tab and gone with it, and a shelf that is this tab's own
// storage. Nothing is signed in, and nothing reaches a relay: it is how the round trip is tried by a test.
const TEST_KEY = "bitportal:test-sync-key";
const TEST_SHELF = "bitportal:test-sync-shelf";
export const testing = (): boolean => new URLSearchParams(location.search).get("signer") === "test";
function testVault(): Vault {
  let hex = sessionStorage.getItem(TEST_KEY);
  if (!hex || !/^[0-9a-f]{64}$/.test(hex)) {
    hex = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, "0")).join("");
    sessionStorage.setItem(TEST_KEY, hex);
  }
  const secret = Uint8Array.from(hex.match(/../g)!.map((h) => Number.parseInt(h, 16)));
  const pubkey = getPublicKey(secret);
  const key = getConversationKey(secret, pubkey);
  return { pubkey, sign: async (t) => finalizeEvent(t, secret), seal: async (text) => nip44Encrypt(text, key), open: async (sealed) => nip44Decrypt(sealed, key) };
}
const testShelf: Shelf = {
  async fetch(pubkey) {
    try {
      const note = JSON.parse(sessionStorage.getItem(TEST_SHELF) ?? "null") as NostrEvent | null;
      return note && note.pubkey === pubkey && verifyEvent(note) ? note : null;
    } catch {
      return null;
    }
  },
  async put(event) {
    sessionStorage.setItem(TEST_SHELF, JSON.stringify(event));
    return true;
  },
};

/** Who the visitor is for this, and what signs and seals for them. Null for a guest, or a profile that is locked here. */
async function vaultNow(): Promise<(Vault & { close?(): void }) | null> {
  if (testing()) return testVault();
  const who = await readSignedIn();
  return who ? await quietVault(who.pubkey) : null;
}

/** An announcement for a saved door, from the list that ships with this page. */
const bundled = new Map<string, NostrEvent>();
for (const event of (bundleJson as unknown as { worlds: NostrEvent[] }).worlds) {
  const d = event.tags.find((t) => t[0] === "d")?.[1];
  if (d) bundled.set(`${event.kind}:${event.pubkey}:${d}`, event);
}

/** Doors heard of from the profile whose announcements aren't here yet: ask the relays for them. */
async function fetchWanted(all: DoorPointer[], missing: DoorPointer[]): Promise<void> {
  if (!missing.length || testing()) return;
  const parts = missing.map((m) => m.id.split(":")).filter((p) => p.length >= 3 && Number(p[0]) === WORLD_KIND);
  if (!parts.length) return;
  try {
    const res = await queryRelays(loadSettings().relays, { kinds: [WORLD_KIND], authors: [...new Set(parts.map((p) => p[1]!))], "#d": [...new Set(parts.map((p) => p.slice(2).join(":")))] }, 4000);
    const found = new Map<string, NostrEvent>();
    for (const e of latestAddressable(res.events.filter((x) => verifyEvent(x)))) {
      const d = e.tags.find((t) => t[0] === "d")?.[1];
      if (d) found.set(`${e.kind}:${e.pubkey}:${d}`, e);
    }
    reconcileSaved(store(), all, (id) => found.get(id) ?? bundled.get(id) ?? null);
  } catch {
    /* asked for again next time */
  }
}

let running: Promise<SyncOutcome> | null = null;
/**
 * One round, if the visitor has asked for their settings to be kept with
 * their profile and that profile is unlocked here. Tells the page what
 * arrived (`bitportal:synced`) so it can say so.
 */
export function runSync(): Promise<SyncOutcome> {
  if (running) return running;
  running = (async (): Promise<SyncOutcome> => {
    const nothing: SyncOutcome = { took: [], sent: false, wanted: null };
    if (!loadSync(store()).on) return { ...nothing, why: "off" };
    const vault = await vaultNow();
    if (!vault) return { ...nothing, why: "locked" };
    try {
      const out = await syncOnce({ store: store(), vault, shelf: testing() ? testShelf : relayShelf(), find: (id) => bundled.get(id) ?? null });
      if (out.wanted && out.missing?.length) await fetchWanted(out.wanted, out.missing);
      else if (!out.wanted) {
        // Doors still wanted from an earlier round.
        try {
          const still = JSON.parse(store()?.getItem(WANTED_KEY) ?? "[]") as DoorPointer[];
          const here = (JSON.parse(store()?.getItem("bitportal:saved") ?? "[]") as DoorPointer[]).map((s) => ({ id: s.id, slot: s.slot, savedAt: s.savedAt }));
          if (Array.isArray(still) && still.length) await fetchWanted([...here, ...still], still);
        } catch {
          /* nothing wanted */
        }
      }
      window.dispatchEvent(new CustomEvent("bitportal:synced", { detail: out }));
      return out;
    } finally {
      vault.close?.();
    }
  })().finally(() => {
    running = null;
  });
  return running;
}

/** Turn it on or off. Turning it on makes a round at once. */
export function setSyncOn(on: boolean): Promise<SyncOutcome> | null {
  storeSync(store(), { ...loadSync(store()), on });
  return on ? runSync() : null;
}

/** Take the visitor's settings off the relays, and stop keeping them there. */
export async function forgetSync(): Promise<boolean> {
  const vault = await vaultNow();
  if (!vault) return false;
  try {
    const done = await emptyNote({ vault, shelf: testing() ? testShelf : relayShelf() });
    if (done) storeSync(store(), { on: false, who: "", at: {}, mark: {}, syncedAt: 0 });
    return done;
  } finally {
    vault.close?.();
  }
}

/** Make a round as the page comes up, and another as it is put away. Call once on a page. */
export function startSync(): void {
  void runSync();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void runSync();
  });
}

/** What this browser remembers of syncing: whether it is on, and when it was last in step. */
export const syncState = () => loadSync(store());
