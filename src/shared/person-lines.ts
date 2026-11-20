/**
 * What someone has done in the worlds this copy knows, as a few lines for their card (NSWP-15, NSWP-16, "On a
 * person's card"): the scores they have posted, and the achievements they show.
 *
 * A world can say only what its own boards hold. This is the visitor's own client, so it can say more: it asks
 * relays what a person has posted, as it does for their profile, when the visitor opens their card. It is asked
 * then and not before, and kept for a few minutes.
 *
 * Only what is marked as asked for at a world's own address is shown, and only for a world whose announcement
 * this copy has: that is the one check there is, and without the world's address it can't be made. Every line is
 * what the person says of themselves, and the card it goes on says whose it is.
 */
import { ACHIEVEMENT_KIND, cleanOrigin, isHex64, parseAchievement, parseScore, SCORE_KIND, scoreWords, verifyEvent, type NostrEvent } from "@nswp/core";
import type { PersonLines } from "nswp-sdk/three";
// Relays are asked with a backup behind them (NIP-66): the kit tries relays that monitors found working when none of these answers.
import { queryBacked as queryRelays } from "nswp-sdk/ui";

export interface KnownWorld {
  /** Its coordinate: `37300:<publisher>:<d>`. */
  id: string;
  title: string;
  url: string;
}

/** How many lines a card is given: a card is a glance, not a record. */
const MOST = 6;
const FRESH_MS = 5 * 60_000;

/**
 * The lines for one person, from what relays gave of theirs. Scores first, then achievements, a world at a time
 * in the order this copy lists them.
 */
export function linesFor(events: readonly NostrEvent[], pubkey: string, worlds: readonly KnownWorld[]): string[] {
  const scores: string[] = [];
  const achievements: string[] = [];
  for (const world of worlds) {
    const origin = cleanOrigin(world.url);
    if (!origin) continue;
    // Each board's newest, and each achievement once: really signed, theirs, and asked for at that world.
    const boards = new Map<string, { title: string; words: string; at: number }>();
    const held = new Map<string, { title: string; at: number }>();
    for (const event of events) {
      if (event.pubkey !== pubkey) continue;
      if (event.kind === SCORE_KIND) {
        const s = parseScore(event);
        if (!s || s.world !== world.id || !s.askedAt.includes(origin) || (boards.get(s.board)?.at ?? -1) >= s.at || !verifyEvent(event)) continue;
        boards.set(s.board, { title: s.title || s.board, words: scoreWords({ format: s.format }, s.score), at: s.at });
      } else if (event.kind === ACHIEVEMENT_KIND) {
        const a = parseAchievement(event);
        if (!a || a.world !== world.id || !a.askedAt.includes(origin) || (held.get(a.id)?.at ?? -1) >= a.at || !verifyEvent(event)) continue;
        held.set(a.id, { title: a.title, at: a.at });
      }
    }
    for (const b of boards.values()) scores.push(`In ${world.title}: ${b.title}, ${b.words}`);
    if (held.size) {
      const names = [...held.values()].sort((x, y) => x.at - y.at).map((h) => h.title);
      const shown = names.slice(0, 3).join(", ");
      achievements.push(`In ${world.title}: shows ${names.length === 1 ? "1 achievement" : `${names.length} achievements`}: ${shown}${names.length > 3 ? ` and ${names.length - 3} more` : ""}`);
    }
  }
  return [...scores, ...achievements].slice(0, MOST);
}

export interface HomePersonLinesOptions {
  relays: string[];
  /** The worlds this copy knows, by their announcements: the ones on show, and the visitor's own doors. */
  worlds(): KnownWorld[];
  query?: typeof queryRelays;
  now?: () => number;
}

export function homePersonLines(o: HomePersonLinesOptions): PersonLines {
  const query = o.query ?? queryRelays;
  const now = o.now ?? (() => Date.now());
  const watchers = new Set<() => void>();
  const read = new Map<string, { at: number; events: NostrEvent[] }>();
  const asking = new Set<string>();
  const ask = (pubkey: string) => {
    if (asking.has(pubkey)) return;
    asking.add(pubkey);
    void query(o.relays, { kinds: [SCORE_KIND, ACHIEVEMENT_KIND], authors: [pubkey], limit: 200 }, 4000)
      .then((got) => got.events)
      .catch(() => [] as NostrEvent[])
      .then((events) => {
        asking.delete(pubkey);
        // No more than a few dozen people are kept: the ones looked at lately.
        if (read.size >= 60) read.delete(read.keys().next().value!);
        read.set(pubkey, { at: now(), events });
        for (const fn of watchers) fn();
      });
  };
  return {
    lines(pubkey) {
      if (!isHex64(pubkey)) return [];
      const had = read.get(pubkey);
      if (!had || now() - had.at > FRESH_MS) ask(pubkey);
      return had ? linesFor(had.events, pubkey, o.worlds()) : [];
    },
    onChange(fn) {
      watchers.add(fn);
      return () => void watchers.delete(fn);
    },
  };
}
