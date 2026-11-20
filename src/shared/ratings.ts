/**
 * Ratings (NSWP-13): what the people a visitor has reason to trust thought of a world.
 *
 * A count of everyone's ratings would say nothing: keys cost nothing. So BitPortal counts the visitor, the people
 * they follow, and the curators whose lists of worlds are on show here, and says so wherever it shows a tally.
 *
 * What is asked of relays is asked by world, never by person: nobody is told whose ratings are being looked for.
 * Who the visitor follows is asked for at home and kept on the device, so the Airlock asks nothing about them.
 */
import { buildRating, publishEvent, queryRelays, RATING_KIND, tallyRatings, verifyEvent, type NostrEvent, type Tally } from "@nswp/core";
import type { Signer } from "./session.js";

const FOLLOWS_KEY = "bitportal:follows";
/** How long who someone follows is kept before it is asked for again. */
const FOLLOWS_FOR = 6 * 3600 * 1000;
/** No more than this many people's follows are counted: enough for anyone, and a bound on what is kept. */
const FOLLOWS_MOST = 2000;

interface KeptFollows {
  pubkey: string;
  at: number;
  follows: string[];
}

const HEX64 = /^[0-9a-f]{64}$/;

/** Who this person follows, as the device last kept it. Empty for anyone else, or when nothing is kept. */
export function keptFollows(pubkey: string | null | undefined): string[] {
  if (!pubkey) return [];
  try {
    const kept = JSON.parse(localStorage.getItem(FOLLOWS_KEY) ?? "null") as Partial<KeptFollows> | null;
    return kept && kept.pubkey === pubkey && Array.isArray(kept.follows) ? kept.follows.filter((k) => typeof k === "string" && HEX64.test(k)).slice(0, FOLLOWS_MOST) : [];
  } catch {
    return [];
  }
}

/**
 * Keep who this person follows as it is now known: after they follow or unfollow someone here, so that what
 * ratings are counted from is not six hours behind what they just did.
 */
export function keepFollows(pubkey: string, follows: readonly string[], now: number = Date.now()): void {
  try {
    localStorage.setItem(FOLLOWS_KEY, JSON.stringify({ pubkey, at: now, follows: follows.filter((k) => HEX64.test(k)).slice(0, FOLLOWS_MOST) } satisfies KeptFollows));
  } catch {
    /* a private window: counted for this page only */
  }
}

/** The people a follow list (NIP-02, kind 3) names. */
export function followsIn(event: Pick<NostrEvent, "tags"> | null | undefined): string[] {
  if (!event || !Array.isArray(event.tags)) return [];
  return [...new Set(event.tags.filter((t) => t[0] === "p" && HEX64.test(t[1] ?? "")).map((t) => t[1]!))].slice(0, FOLLOWS_MOST);
}

/**
 * Who this person follows: from the device if it was asked for lately, else from relays, and then kept. Called at
 * home, for the visitor's own key. Whatever goes wrong, what the device has stands.
 */
export async function followsOf(pubkey: string, relays: string[], now: number = Date.now()): Promise<string[]> {
  try {
    const kept = JSON.parse(localStorage.getItem(FOLLOWS_KEY) ?? "null") as Partial<KeptFollows> | null;
    if (kept && kept.pubkey === pubkey && typeof kept.at === "number" && now - kept.at < FOLLOWS_FOR) return keptFollows(pubkey);
  } catch {
    /* asked for again */
  }
  try {
    const got = await queryRelays(relays, { kinds: [3], authors: [pubkey], limit: 4 }, 3000);
    const newest = got.events.filter((e) => e.kind === 3 && e.pubkey === pubkey && verifyEvent(e)).sort((a, b) => b.created_at - a.created_at)[0];
    // No list found is not "follows nobody": what was kept before stands, and it is asked for again next time.
    if (!newest) return keptFollows(pubkey);
    const follows = followsIn(newest);
    try {
      localStorage.setItem(FOLLOWS_KEY, JSON.stringify({ pubkey, at: now, follows } satisfies KeptFollows));
    } catch {
      /* a private window: counted for this page only */
    }
    return follows;
  } catch {
    return keptFollows(pubkey);
  }
}

/** Whose ratings count for this visitor: the curators of the lists on show, and the people the visitor follows. */
export function countedFor(curators: Iterable<string>, follows: Iterable<string>): string[] {
  return [...new Set([...curators, ...follows])].filter((k) => HEX64.test(k));
}

/**
 * The ratings relays have of these worlds. Asked by world, with no person named. The curators' own are asked
 * for as well, by their keys, which are public: so a flood of strangers' ratings can't crowd theirs out of what
 * a relay sends back.
 */
export async function fetchRatings(relays: string[], worlds: string[], curators: string[] = []): Promise<NostrEvent[]> {
  const wanted = [...new Set(worlds)].slice(0, 200);
  if (wanted.length === 0) return [];
  const asks = [queryRelays(relays, { kinds: [RATING_KIND], "#a": wanted, limit: 1000 }, 4000)];
  if (curators.length) asks.push(queryRelays(relays, { kinds: [RATING_KIND], authors: curators.slice(0, 100), limit: 500 }, 4000));
  const got = await Promise.all(asks.map((ask) => ask.then((r) => r.events).catch(() => [] as NostrEvent[])));
  const byId = new Map<string, NostrEvent>();
  for (const e of got.flat()) if (e.kind === RATING_KIND) byId.set(e.id, e);
  return [...byId.values()];
}

/** A tally for each world, from what was fetched. Worlds nobody counted has rated are left out. */
export function talliesFor(events: readonly NostrEvent[], worlds: { id: string; url: string }[], counted: string[], me: string | null): Map<string, Tally> {
  const out = new Map<string, Tally>();
  for (const w of worlds) {
    const tally = tallyRatings(events, { world: w.id, counted, me, worldUrl: w.url });
    if (tally.count) out.set(w.id, tally);
  }
  return out;
}

/** A tally as a door's plate says it: "★ 4.5 from 12". "" when there is none. */
export function ratingMark(tally: Pick<Tally, "count" | "average"> | null | undefined): string {
  return tally && tally.count ? `★ ${tally.average.toFixed(1)} from ${tally.count}` : "";
}

/**
 * A tally in full, for where there is room, always with whose it is: "4.5 of 5, from 12 people you follow, or whose
 * lists you use". Signed out, only the curators of the lists on show are counted, and it says so.
 */
export function ratingWords(tally: (Pick<Tally, "count" | "average"> & Partial<Pick<Tally, "mine">>) | null | undefined, signedIn: boolean): string {
  if (!tally || !tally.count) return "";
  const stars = `${tally.average.toFixed(1)} of 5`;
  if (!signedIn) return `${stars}, from ${tally.count} of the curators whose lists are shown here`;
  // Their own is counted, and said apart: it isn't someone they follow.
  const others = tally.count - (tally.mine ? 1 : 0);
  const them = `${others} ${others === 1 ? "person" : "people"} you follow, or whose lists you use`;
  if (tally.mine && others === 0) return `${stars}: your own rating, and nobody else's yet`;
  return `${stars}, from ${tally.mine ? `you and ${them}` : them}`;
}

/**
 * Give a world a rating as the visitor: signed by their own key at their sign-in address, and sent to relays.
 * Resolves with the signed rating and how many relays took it; null if it couldn't be signed.
 */
export async function giveRating(signer: Signer, relays: string[], world: string, stars: number, now: number = Date.now()): Promise<{ event: NostrEvent; took: number } | null> {
  const note = buildRating({ world, stars, now: now / 1000, ...(relays[0] ? { relay: relays[0] } : {}) });
  if (!note) return null;
  let event: NostrEvent;
  try {
    event = await signer.signEvent(note);
  } catch {
    return null;
  }
  const sent = await publishEvent(relays, event).catch(() => null);
  return { event, took: sent ? Object.values(sent.relays).filter((said) => said === "ok").length : 0 };
}
