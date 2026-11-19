/**
 * How old a world's controls are, said to the visitor (NSWP-01, "Which kit a
 * world was built with").
 *
 * A world carries its own copy of the kit and says which in its manifest.
 * BitPortal carries one too, and knows its version. When a world's is older,
 * the Airlock says so under "More about this place". That is all it does:
 * it is never a warning, it decides nothing about the crossing, and a world
 * that is behind still works.
 */
import { kitAge, KIT_VERSION } from "@nswp/core";

/** What to say about a world's kit, or null when there is nothing worth saying. */
export function kitNote(theirs: string | undefined, adopted: boolean, mine: string = KIT_VERSION): string | null {
  // A site that hasn't adopted the protocol has no kit to be old.
  if (!adopted) return null;
  const age = kitAge(theirs, mine);
  if (age === "older") return `This world was built with an older kit (${theirs}; this copy of BitPortal has ${mine}). It still works. Some newer controls and settings may be missing there.`;
  if (age === "unknown") return "This world doesn't say which kit it was built with, so its controls may be older than the ones you know. It still works.";
  return null;
}
