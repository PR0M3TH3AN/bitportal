/**
 * How much of the Airlock a crossing needs.
 *
 * The Airlock is there so that nobody is taken somewhere new without being
 * shown where and asked. Going back to a place they have already been shown,
 * agreed to and visited is not that, and stopping them every time teaches
 * them to press Continue without reading. So a crossing to a place a visitor
 * knows goes straight through, and the Airlock is seen only when there is
 * something to see.
 *
 * "Knows" is narrow on purpose. Every one of these has to hold:
 *
 * - the site proved it is who it says, this time, as it did before;
 * - it is on this copy's list;
 * - the visitor has been through the Airlock to it before, with the same
 *   publisher;
 * - nothing has changed, nothing is warned about, nothing is waiting for an
 *   answer, and it suits the device they are on;
 * - they haven't said to always stop for this world, or to stop every time,
 *   or pressed Stop on the way.
 *
 * If any one of them fails, the whole screen is shown and they are asked.
 */
export type Crossing = "ask" | "countdown" | "straight";

export interface CrossingFacts {
  /** The site's own manifest names this publisher for this world, checked just now. */
  verified: boolean;
  /** The world is on this copy's list. */
  onList: boolean;
  /** The visitor has gone through the Airlock to this site before, with this same publisher. */
  beenBefore: boolean;
  /** They ticked "skip this screen next time" for this world. */
  approved: boolean;
  /** They ticked "always stop here for this world". */
  askAlways: boolean;
  /** The verified publisher for this site is not the one it was. */
  publisherChanged: boolean;
  /** How many warnings there are to read. */
  warnings: number;
  /** How many questions are waiting for an answer: people to block everywhere. */
  asking: number;
  /** Whether the world suits the device the visitor is on. */
  fit: "ok" | "plain" | "warn" | "bad";
  /** Their setting: go straight through to places they know, or be asked every time. */
  setting: "known" | "ask";
  /** They pressed Stop while the door was being checked. */
  held: boolean;
}

export function crossingFor(f: CrossingFacts): Crossing {
  const nothingToSee = f.verified && !f.publisherChanged && f.warnings === 0 && f.asking === 0 && f.fit !== "warn" && f.fit !== "bad";
  if (!nothingToSee || f.askAlways || f.held) return "ask";
  if (f.setting === "known" && f.onList && f.beenBefore) return "straight";
  // Their own tick for one world, on or off this copy's list: a moment to change their mind, then through.
  return f.approved ? "countdown" : "ask";
}
