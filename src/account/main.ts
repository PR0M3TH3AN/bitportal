/**
 * Who you are: BitPortal's sign-in page.
 *
 * Three choices, each as easy as the others: stay anonymous, sign in, or
 * switch to another profile. Signing in is BitLogin, drawn in BitPortal's
 * colours (its own theme values, set in bitportal.css). BitPortal holds no
 * key and has no account server: the widget does the signing in, and this
 * page only says who it reports.
 *
 * A visitor comes here from somewhere (the room, the lobby, the Airlock) and
 * goes back there when they are done: `?back=walk`, with `&xr=1` if they left
 * a headset session to come, or `?back=history`.
 *
 * Or from inside a world, whose menu sent them here to say who they are
 * (`?back=door`, who.ts). They are offered the way back to it, by name or as
 * a guest. Which they press is their choice for that one trip, and the
 * Airlock still checks the door before they go.
 */
import { attachJumpList } from "../shared/jump.js";
import { profileName, shortKey, watchBitLogin, type Session } from "../shared/session.js";
import { loadSettings } from "../shared/settings.js";
import { VERSION } from "../shared/version.js";
import { chooseOnce, readWhoDoor, tabStore } from "../shared/who.js";
import { wayBack } from "./back.js";

declare global {
  interface Window {
    bitportal?: { version: string };
  }
}
window.bitportal = { version: VERSION };

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
attachJumpList($<HTMLButtonElement>("jump-button"), { relays: () => loadSettings().relays, from: "list" });

const back = wayBack(location.search, readWhoDoor(tabStore(), Date.now()));
const door = back.door ?? null;
for (const [id, text, how] of [
  ["carry-on", back.named ?? back.label, "name"],
  ["as-guest-in", back.guest, "guest"],
  ["as-guest", back.guest, "guest"],
  ["back-link", back.label, null],
] as const) {
  const link = $<HTMLAnchorElement>(id);
  link.textContent = text;
  if (back.href) link.href = back.href;
  else {
    link.href = "#";
    link.addEventListener("click", (e) => {
      e.preventDefault();
      history.back();
    });
  }
  // Back to a world: which button they press is how they go, for this one trip. The Airlock reads it once.
  if (door && how) link.addEventListener("click", () => chooseOnce(how, door, tabStore()));
}
// Going back to a world, someone signed in can go by name or not; what going by name tells that site is said here.
$("as-guest-in").hidden = !door;
$("name-note").hidden = !door;
if (door) document.title = `Who you are at ${door.host || "the world you were in"} · BitPortal`;

const who = $("who");
const widget = $("bitlogin") as HTMLElement & { logout?: () => Promise<void> };
let settled = false;
let switching = false;
/** They were a guest when the page came up, and have signed in since. */
let wasGuest = false;

const show = (session: Session | null, message?: string) => {
  $("signed-in").hidden = !session;
  $("guest").hidden = !!session;
  // Signed in, the profile is the only card below, and takes the page's width.
  $("choices").classList.toggle("signed", !!session);
  $("sign-in-title").textContent = session ? "Your profile" : switching ? "Who would you like to be?" : "Sign in, or make a profile";
  $("sign-in-why").textContent = session
    ? "Everything about this profile is BitLogin's to show: its keys, its recovery, its other ways to sign in."
    : switching
      ? "Sign in as another profile, or make a new one. Or stay anonymous."
      : "So people can know you by name from world to world, and the worlds you announce are yours.";
  who.textContent =
    message ??
    (session
      ? door
        ? `You're signed in. Go back to ${door.host || "the world you were in"} by name, or as a guest.`
        : "You're signed in."
      : switching
        ? "You're signed out of that profile. Sign in as another, or carry on as a guest."
        : door
          ? `You're a guest. Sign in below to go back to ${door.host || "the world you were in"} by name, or go back as you are.`
          : "You're a guest. That is a fine way to be here: sign in only if you want to be known by name.");
  if (!session) {
    wasGuest = true;
    return;
  }
  // They came from a world to sign in, and have: the way back is the next thing, so it is put under their hand.
  if (door && wasGuest) {
    wasGuest = false;
    $("signed-in").scrollIntoView({ block: "center", behavior: "smooth" });
    $("carry-on").focus({ preventScroll: true });
  }
  $("you-name").textContent = shortKey(session.pubkey);
  $("you-key").textContent = "";
  $("you-key").title = session.pubkey;
  // Their own name for themselves, from their own relays, when they have one.
  void profileName(session.pubkey, loadSettings().relays).then((name) => {
    if (!name || $("signed-in").hidden) return;
    $("you-name").textContent = name;
    $("you-key").textContent = ` ${shortKey(session.pubkey)}`;
  });
};

watchBitLogin(widget, (session, error) => {
  settled = true;
  if (session) switching = false;
  show(session, error ? `${error.message} Try signing in again.` : undefined);
});

/** Sign this profile out of this browser. The widget does it: it is BitLogin's session to end. */
const signOut = async (thenSwitch: boolean): Promise<void> => {
  switching = thenSwitch;
  const buttons = [$<HTMLButtonElement>("switch"), $<HTMLButtonElement>("sign-out")];
  for (const b of buttons) b.disabled = true;
  try {
    if (typeof widget.logout !== "function") throw new Error("no way to sign out from here");
    await widget.logout();
    // The widget says so itself. If it doesn't, say it for it.
    setTimeout(() => {
      if (!$("signed-in").hidden) show(null);
    }, 600);
    if (thenSwitch) widget.scrollIntoView({ block: "center", behavior: "smooth" });
  } catch {
    switching = false;
    who.textContent = "That couldn't be done from here. Use Log out in the BitLogin box below.";
  } finally {
    for (const b of buttons) b.disabled = false;
  }
};
$("switch").addEventListener("click", () => void signOut(true));
$("sign-out").addEventListener("click", () => void signOut(false));

// The widget announces a restored session by itself; if nothing arrives, they are a guest.
setTimeout(() => {
  if (!settled) show(null);
}, 2500);
