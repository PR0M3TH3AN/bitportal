/** The account page: BitLogin's own sign-in surface, and what signing in gives you. */
import { attachJumpList } from "../shared/jump.js";
import { shortKey, watchBitLogin } from "../shared/session.js";
import { loadSettings } from "../shared/settings.js";
import { VERSION } from "../shared/version.js";

declare global {
  interface Window {
    bitportal?: { version: string };
  }
}
window.bitportal = { version: VERSION };

attachJumpList(document.getElementById("jump-button") as HTMLButtonElement, { relays: () => loadSettings().relays, from: "list" });
const who = document.getElementById("who")!;
const next = document.getElementById("next")!;
let settled = false;

watchBitLogin(document.getElementById("bitlogin")!, (session, error) => {
  settled = true;
  next.hidden = !session;
  who.replaceChildren();
  if (session) {
    const key = document.createElement("span");
    key.className = "key";
    key.title = session.pubkey;
    key.textContent = shortKey(session.pubkey);
    who.append("Signed in as ", key, ".");
  } else who.textContent = error ? `${error.message} Try signing in again.` : "You're signed out. Sign in below, or create an account.";
});

// The widget announces a restored session by itself; if nothing arrives, say so.
setTimeout(() => {
  if (!settled) who.textContent = "You're signed out. Sign in below, or create an account.";
}, 2500);
