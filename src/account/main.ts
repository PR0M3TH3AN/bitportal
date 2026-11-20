/**
 * Who you are: BitPortal's sign-in page.
 *
 * Three choices, each as easy as the others: stay anonymous, sign in, or
 * be someone else. Signing in is done at BitLogin's own address, in a window
 * of its own: this page has a button that opens it, and nothing to type
 * into. BitPortal holds no key, no password and no account server. It is an
 * application to BitLogin's signer: the window lists what BitPortal asks
 * for, the visitor allows it once, and this page says who the signer
 * reports (`shared/session.ts`).
 *
 * A visitor comes here from somewhere (the room, the lobby, the Airlock) and
 * goes back there when they are done: `?back=walk`, with `&xr=1` if they left
 * a headset session to come, or `?back=history`.
 *
 * Or from inside a world, whose menu sent them here to say who they are
 * (`?back=door`, who.ts). They are offered the way back to it, and the
 * Airlock still checks the door before they go. To be known by name in that
 * world they sign in there, in BitLogin's window: this page sends no name
 * with them (on a copy that names no sign-in address, it still offers the
 * way back by name or as a guest, for that one trip).
 */
import { attachJumpList } from "../shared/jump.js";
import { encodeNpub, toLocal } from "@nswp/core";
import { label, pictureOf, profileOf, PROFILES_EVENT, wantProfiles } from "../shared/profiles.js";
import { signIn, signInAddress, signInHost, signOut, switchAccount, watchSignIn, type Session } from "../shared/session.js";
import { loadSettings } from "../shared/settings.js";
import { VERSION } from "../shared/version.js";
import { sendsPass } from "../shared/instance.js";
import { goesAsGuest, setGoesAsGuest } from "../shared/look.js";
import { chooseOnce, readWhoDoor, tabStore } from "../shared/who.js";
import { wayBack } from "./back.js";
import { createBooth } from "./booth.js";

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
const query = new URLSearchParams(location.search);
// Come from a world or from the room: they step out of the crossing's room, and leave by it.
const fromAPlace = query.get("back") === "door" || query.get("back") === "walk";
// Read on a headset's flat panel with a controller's ray: everything to press is larger.
if (query.get("xr") === "1") document.body.classList.add("from-vr");
const booth = createBooth($("booth"), { arriving: fromAPlace });
/** Leave for a place by the crossing's room, when that is how they came and where they are going. */
const leaveFor = async (go: () => void, label: string): Promise<void> => {
  const toAPlace = !!back.href && (back.href.startsWith("/go/") || back.href.startsWith("/walk/"));
  if (booth && toAPlace) await booth.leave({ title: door ? door.host || "The world you came from" : "Your room", address: door ? door.host : location.host });
  void label;
  go();
};
// Where this host names a sign-in address, a visitor signs in at the world itself (NSWP-10, "A pass from the
// signer"): there is no going back "by name" from here, only going back.
const signsThere = !sendsPass();
for (const [id, text, how] of [
  ["carry-on", signsThere ? back.label : (back.named ?? back.label), signsThere ? null : "name"],
  ["as-guest-in", back.guest, "guest"],
  ["as-guest", back.guest, "guest"],
  ["back-link", back.label, null],
] as const) {
  const link = $<HTMLAnchorElement>(id);
  link.textContent = text;
  link.href = back.href ?? "#";
  let going = false;
  link.addEventListener("click", (e) => {
    // A press with a key held is the visitor asking their browser for something else: left to it.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (going) return;
    going = true;
    // Back to a world: which button they press is how they go, for this one trip. The Airlock reads it once.
    if (door && how) chooseOnce(how, door, tabStore());
    const href = back.href;
    void leaveFor(() => (href ? location.assign(href) : history.back()), text);
  });
}
// Going back to a world, someone signed in can go by name or not, for that one trip.
$("as-guest-in").hidden = !door || signsThere;
// Signed in is signed in everywhere, unless they say otherwise. It is theirs to say, here, by their own hand.
const asMyself = $<HTMLInputElement>("as-myself");
asMyself.checked = !goesAsGuest();
asMyself.addEventListener("change", () => setGoesAsGuest(!asMyself.checked));
if (!signsThere) {
  // A host with no sign-in address of its own vouches for its visitors at each door, as before.
  $("as-myself-words").textContent = "Go to worlds as myself";
  $("name-note").textContent =
    "Signed in here is signed in everywhere: you don't sign in to worlds one by one. Each world you visit that has proved who it is is told your public key, and so are the people in any room you join there. The pass that proves it lasts four hours and can't be taken back. Your key itself never leaves this browser. Untick this to visit worlds as a guest.";
}
// Said by its name, wherever this page says "your sign-in address".
const host = signInHost();
for (const id of ["name-note", "sign-in-how", "note-where", "switch-note"]) $(id).textContent = ($(id).textContent ?? "").replace("your sign-in address", host);
if (door) document.title = `Who you are at ${door.host || "the world you were in"} · BitPortal`;

const who = $("who");
const signInButton = $<HTMLButtonElement>("sign-in");
const said = $("sign-in-said");
signInButton.textContent = `Sign in at ${host}`;
/** They were a guest when the page came up, and have signed in since. */
let wasGuest = false;
/** The sign-in address, for a link to it: on a development server, the local copy. */
let address = signInAddress();
void toLocal(address).then((local) => (address = local));

const say = (words: string) => {
  said.textContent = words;
  said.hidden = !words;
};

const show = (session: Session | null, message?: string) => {
  $("signed-in").hidden = !session;
  $("guest").hidden = !!session;
  // Signed in, the profile is the only card below, and takes the page's width.
  $("choices").classList.toggle("signed", !!session);
  signInButton.hidden = !!session;
  $("sign-in-title").textContent = session ? "Your profile" : "Sign in, or make a profile";
  const why = $("sign-in-why");
  if (session) {
    // Its keys, its recovery, its other ways to sign in and the sites it has allowed are BitLogin's to show.
    const link = document.createElement("a");
    link.href = address;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = host;
    why.replaceChildren("This profile is kept by BitLogin. Its keys, its recovery, its other ways to sign in and the sites you have allowed are at ", link, ".");
  } else {
    why.textContent = "So people can know you by name from world to world, and the worlds you announce are yours.";
  }
  $("sign-in-how").hidden = !!session;
  who.textContent =
    message ??
    (session
      ? door
        ? `You're signed in. Go back to ${door.host || "the world you were in"}.`
        : "You're signed in."
      : door
          ? `You're a guest. Sign in below, or go back to ${door.host || "the world you were in"} as you are.`
          : "You're a guest. That is a fine way to be here: sign in only if you want to be known by name.");
  if (!session) {
    wasGuest = true;
    return;
  }
  say("");
  // They came from a world to sign in, and have: the way back is the next thing, so it is put under their hand.
  if (door && wasGuest) {
    wasGuest = false;
    $("signed-in").scrollIntoView({ block: "center", behavior: "smooth" });
    $("carry-on").focus({ preventScroll: true });
  }
  // By the name they chose for themselves, with their picture: never a string of hex. Until their profile has
  // been read, and for someone with no name, the name the sign-in address knows them by, or the short form of
  // their public key, stands in.
  // Whoever was shown before is not this one: their picture goes until this one's has been read.
  $("you-mark").replaceChildren();
  $("you-mark").classList.remove("has-picture");
  const sayWho = () => {
    if ($("signed-in").hidden) return;
    $("you-name").textContent = profileOf(session.pubkey)?.name || session.name || label(session.pubkey);
    $("you-key").textContent = "";
    $("you-key").title = encodeNpub(session.pubkey);
    void pictureOf(session.pubkey).then((picture) => {
      if (!picture || $("signed-in").hidden) return;
      $("you-mark").replaceChildren(picture);
      $("you-mark").classList.add("has-picture");
    });
  };
  sayWho();
  addEventListener(PROFILES_EVENT, sayWho, { once: true });
  wantProfiles([session.pubkey], () => loadSettings().relays);
};

watchSignIn((session, error, state) => {
  // The button works once the signer's frame is up: a window opens only for a press, and can't wait for one.
  signInButton.disabled = false;
  if (error) say(error.message);
  else if (state?.needsMore) say(`You allowed BitPortal at ${host} before, for less than it asks for now. Sign in again and it will list the rest.`);
  show(session, error ? "You're a guest for now." : undefined);
});

signInButton.addEventListener("click", async () => {
  say("");
  signInButton.disabled = true;
  const done = await signIn();
  signInButton.disabled = false;
  // Allowed: the signer says so itself, and the page is drawn from that.
  if (!done) say(`You weren't signed in: the window at ${host} was closed before you allowed BitPortal, or your browser didn't let it open. Press the button to try again.`);
});

/** Sign BitPortal out: BitLogin's signer forgets this site. The sign-in address itself still remembers the profile. */
const leave = async (): Promise<void> => {
  const buttons = [$<HTMLButtonElement>("switch"), $<HTMLButtonElement>("sign-out")];
  for (const b of buttons) b.disabled = true;
  try {
    await signOut();
    // The signer says so itself. If it doesn't, say it for it.
    setTimeout(() => {
      if (!$("signed-in").hidden) show(null);
    }, 600);
  } catch {
    who.textContent = `That couldn't be done from here: ${host} didn't answer. Try again in a moment.`;
  } finally {
    for (const b of buttons) b.disabled = false;
  }
};
$("sign-out").addEventListener("click", () => void leave());
// Being someone else is chosen in BitLogin's own window, which shows the profiles this browser has used there and
// offers a new one. BitPortal never sees that list, and stays signed in as before until they choose.
$("switch").addEventListener("click", async () => {
  const button = $<HTMLButtonElement>("switch");
  button.disabled = true;
  say("");
  const still = await switchAccount();
  button.disabled = false;
  if (!still) say(`Nobody is signed in to BitPortal now: the window at ${host} was closed, or your browser didn't let it open.`);
});
