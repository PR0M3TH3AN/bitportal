/**
 * A door on the room's list, as the kit's door details show it in the menu
 * (`addDoorControls`; NSWP `docs/backlog/doors-03-details-and-travel.md`):
 * its name, its address, what this browser last found of whether its site
 * vouches for it, and what its world offers, the same as the tiles beside it.
 */
import type { MenuDoor } from "nswp-sdk/ui";
import type { Entry } from "./catalog.js";
import { doorOffers } from "./plate.js";
import type { VerificationResult } from "./verify.js";

export function menuDoor(entry: Entry, checked: VerificationResult | null): MenuDoor {
  return {
    id: entry.id,
    title: entry.world.title,
    url: entry.world.url,
    // Only what this browser last found: a door never asks the site when it is looked at. Nobody looked, nothing said.
    vouched: !checked ? "unknown" : checked.state === "verified" ? "verified" : "listed",
    ...(entry.listedBy ? { listedBy: entry.listedBy } : {}),
    offers: doorOffers(entry),
  };
}
