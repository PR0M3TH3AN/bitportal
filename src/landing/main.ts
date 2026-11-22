/**
 * BitPortal's front page: the way in, and a few words. Its one job is to get
 * someone into the room (NSWP `docs/backlog/landing-01-refresh.md`; the
 * owner, 2026-11-21: "It should be inviting and try to get the user into the
 * game/vr experience first" and "keeping users on the landing is not
 * necessary"). Every door as a list, Settings and the rest are at `/doors/`.
 *
 * It contacts no relay and no world: it draws the room with nobody's doors in
 * it, and says who is signed in from this browser's own note.
 */
import { attachJumpList } from "../shared/jump.js";
import { prototypeNotice } from "../shared/notice.js";
import { loadSettings } from "../shared/settings.js";
import { detectTier } from "../shared/device.js";
import { knownSignedIn } from "../shared/session.js";
import { label, profileOf } from "../shared/profiles.js";
import { oldLinkTarget } from "./forward.js";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

// A link someone kept to the lobby, when it was here: the same thing, where it is now.
const onward = oldLinkTarget(location.search, location.hash);
if (onward) location.replace(onward);
else start();

function start(): void {
  prototypeNotice({ large: detectTier(navigator.userAgent, undefined) === "standalone" });
  attachJumpList($<HTMLButtonElement>("jump-button"), { relays: () => loadSettings().relays, from: "list" });
  // Someone signed in is named, from this browser's own note of it, by the name they chose: never a string of hex.
  const who = knownSignedIn();
  if (who) $("account-link").textContent = profileOf(who.pubkey)?.name || who.name || label(who.pubkey);
  void startRoom();
}

/** The room behind the words, with nobody's doors in it: the way in is the button. */
async function startRoom(): Promise<void> {
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
  const stage = $("hero-stage");
  try {
    const { mountHero } = await import("../lobby/hero.js");
    const room = mountHero(stage, { accent: "#3df2a0", entries: () => [], chosen: () => false, onPoint: () => {}, onOpen: () => {} });
    if (room) stage.classList.add("live");
  } catch {
    /* the drawn grid stays */
  }
}
