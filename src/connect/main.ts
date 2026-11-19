/**
 * BitPortal's sign-in window (NSWP-10, "Signing from a world"; BitLogin's
 * docs/sign-in-window.md).
 *
 * A world opens it. It is BitPortal's own page, in a window of its own with
 * its own address bar, and the world can't read it. It finds BitPortal's own
 * hidden signer inside the page that opened it, shows which world that is
 * (the browser's word for it), and waits for Allow. Then it hands the signer
 * a key that can only sign, sealed worker to worker, and closes.
 *
 * It speaks only to a page of BitPortal's own. A message addressed to this
 * origin is delivered to nothing else, so a world posing as the signer hears
 * nothing; and with no signer found, there is no Allow to press.
 *
 * `?signer=test` hands over a throwaway key in place of anyone's: the only
 * way automation tries this.
 */
import { getConversationKey, getPublicKey, handoffMessage, nip44Encrypt, readHandoffMessage, shortNpub } from "@nswp/core";
import { fetchProfiles, profileOf } from "../shared/profiles.js";
import { loadSettings } from "../shared/settings.js";
import { readSignedIn } from "../shared/session.js";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const me = location.origin;
const status = (text: string) => ($("status").textContent = text);
const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
const nonce = hex(crypto.getRandomValues(new Uint8Array(12)));
const testKey = new URLSearchParams(location.search).get("signer") === "test" ? crypto.getRandomValues(new Uint8Array(32)) : null;

type Headless = { restore(): Promise<{ pubkey: string } | null>; exportHandoff(recipient: string): Promise<{ senderPublicKey: string; payload: string }>; destroy(): void };

/** The signer found in the page that opened this window: its window, the world it is in, and the key to seal to. */
let found: { frame: Window; world: string; recipient: string } | null = null;
/** `name` is the one they chose on Nostr, or "" when this browser knows of none: then the key alone is shown, once. */
let who: { pubkey: string; name: string } | null = null;
let finished = false;
/** When the question was put. A press that lands sooner than a person could have read it was meant for the world. */
let askedAt = 0;
const TOO_SOON_MS = 900;

const leave = () => {
  finished = true;
  window.close();
  // A window the browser won't close for us says what to do.
  status("You can close this window.");
  $("ask").hidden = true;
  $("signin").hidden = true;
};

/** Say hello to every frame of the page that opened this. Only one of BitPortal's own can hear it. */
const call = () => {
  if (found || finished || !window.opener) return;
  try {
    const frames = (window.opener as Window).frames;
    for (let i = 0; i < frames.length; i++) frames[i]!.postMessage(handoffMessage({ t: "hello", nonce }), me);
  } catch {
    /* the page that opened this has gone, or cut its link: nothing is found */
  }
};

const show = () => {
  if (!found) return;
  if (!who) {
    status("A site is asking to sign notes as you.");
    $("signin").hidden = false;
    return;
  }
  status("A site is asking to sign notes as you. Check the address.");
  $("world").textContent = found.world;
  $("who").textContent = who.name || shortNpub(who.pubkey);
  $("who-key").textContent = who.name ? ` (${shortNpub(who.pubkey)})` : "";
  $("known").textContent = "Only allow a site you meant to visit. BitPortal shows its address exactly as your browser reports it.";
  $("ask").hidden = false;
  // Allow is never given the keys unasked: a key meant for the world, pressed as this window came up, must not land on it.
  askedAt = performance.now();
};

addEventListener("message", (e) => {
  // Only BitPortal's own pages are listened to.
  if (e.origin !== me || !e.source || e.source === window) return;
  const msg = readHandoffMessage(e.data);
  if (!msg || msg.nonce !== nonce) return;
  if (msg.t === "frame" && !found) {
    found = { frame: e.source as Window, world: msg.world, recipient: msg.recipient };
    show();
  }
  if (msg.t === "done" && found && e.source === found.frame) {
    if (msg.ok) {
      status("Done. That site can sign notes as you until you leave it.");
      $("ask").hidden = true;
      setTimeout(leave, 700);
    } else {
      status("That didn't work, and nothing was handed over. Close this window and try again from the site that opened it.");
      $("ask").hidden = true;
    }
  }
});

$("allow").addEventListener("click", async () => {
  if (!found || !who || performance.now() - askedAt < TOO_SOON_MS) return;
  ($("allow") as HTMLButtonElement).disabled = true;
  status("Handing over a key that can only sign.");
  let headless: Headless | null = null;
  try {
    let sealed: { senderPublicKey: string; payload: string };
    if (testKey) {
      // The same sealing BitLogin's worker does, around a key that is nobody's.
      const sender = crypto.getRandomValues(new Uint8Array(32));
      sealed = { senderPublicKey: getPublicKey(sender), payload: nip44Encrypt(JSON.stringify({ v: 1, purpose: "bitlogin:signer-handoff:v1", key: hex(testKey) }), getConversationKey(sender, found.recipient)) };
    } else {
      const url = "/vendor/bitlogin/bitlogin-headless.js";
      const mod = (await import(/* @vite-ignore */ url)) as { createHeadlessSigner(): Promise<Headless> };
      headless = await mod.createHeadlessSigner();
      const restored = await headless.restore();
      if (!restored || restored.pubkey !== who.pubkey) throw new Error("not signed in");
      // Sealed inside BitLogin's worker to the signer's worker: this page never holds the key.
      sealed = await headless.exportHandoff(found.recipient);
    }
    // To the signer and to nothing else: addressed to BitPortal's own origin.
    found.frame.postMessage(handoffMessage({ t: "grant", nonce, world: found.world, sealed, ...(who.name ? { name: who.name } : {}) }), me);
  } catch {
    status("That didn't work, and nothing was handed over. If you signed in with a browser extension or a phone, this isn't offered for it yet.");
    $("ask").hidden = true;
  } finally {
    headless?.destroy();
  }
});
$("deny").addEventListener("click", leave);
$("deny-2").addEventListener("click", leave);

void (async () => {
  if (!window.opener) return status("This window is opened by a world or a site, when you ask it to sign in. There is nothing to do here on its own.");
  if (testKey) who = { pubkey: getPublicKey(testKey), name: "Test visitor" };
  else {
    const signed = await readSignedIn();
    if (signed) {
      // Their name is the one in their own Nostr profile. What this browser already knows of it is used at once;
      // it is asked for here only when nothing is known, as the Airlock does.
      if (!profileOf(signed.pubkey)?.name) await fetchProfiles([signed.pubkey], loadSettings().relays, { timeoutMs: 2500 });
      who = { pubkey: signed.pubkey, name: profileOf(signed.pubkey)?.name || signed.name || "" };
      if (found) show();
    }
  }
  // The signer may still be loading in the world: ask a few times, then give up plainly.
  call();
  const again = setInterval(call, 350);
  setTimeout(() => {
    clearInterval(again);
    if (!found && !finished) status("No BitPortal signer was found in the page that opened this window, so there is nothing to allow. If a site sent you here, it may not support signing, or your browser kept the two apart.");
  }, 6000);
  if (found) show();
})();
