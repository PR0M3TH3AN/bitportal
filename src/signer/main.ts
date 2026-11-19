/**
 * BitPortal's signer: a page with no interface, embedded unseen in a world
 * (NSWP-10, "Signing from a world"; BitLogin's docs/sign-in-window.md).
 *
 * A world asks it to sign a note. It answers with the signed note, or with a
 * refusal that says nothing. It never hands out a key, and nothing is ever
 * typed into it.
 *
 * It starts locked in every world, and it stays locked until BitPortal's own
 * window (src/connect/main.ts), where the visitor pressed Allow, hands it a
 * key that can only sign. It never uses what this browser keeps for
 * BitPortal, even where a browser would let it: a world on the same site as
 * BitPortal is treated like any other.
 *
 * Who is asking is what the browser says, never what the world says.
 */
import { cleanOrigin, createSignGate, handoffMessage, prepareForWorld, readHandoffMessage, readSignerRequest, SIGN_LIMITS, signerMessage, verifyEvent, type NostrEvent, type SignGate, type SignerReply } from "@nswp/core";

type Headless = {
  beginHandoff(): Promise<string>;
  acceptHandoff(sealed: { senderPublicKey: string; payload: string }): Promise<{ pubkey: string }>;
  signEvent(e: unknown): Promise<unknown>;
  destroy(): void;
};

const me = location.origin;

if (window.parent === window) {
  // Opened on its own: it does nothing, and says so.
  document.getElementById("alone")!.hidden = false;
} else {
  /** The world this page is embedded in: the browser's word for it. */
  let world = cleanOrigin(location.ancestorOrigins?.[0] ?? "");
  let headless: Headless | null = null;
  let pubkey: string | null = null;
  let name: string | null = null;
  /** When what the visitor allowed stops, in seconds. */
  let until = 0;
  let gate: SignGate = createSignGate();
  /** The hand-off in flight: the window that asked, and the word it gave. */
  let asking: { nonce: string; from: MessageEventSource } | null = null;

  const load = async (): Promise<Headless> => {
    if (headless) return headless;
    const url = "/vendor/bitlogin/bitlogin-headless.js";
    const mod = (await import(/* @vite-ignore */ url)) as { createHeadlessSigner(): Promise<Headless> };
    // Never restore(): what this browser keeps for BitPortal is not this world's to use.
    headless = await mod.createHeadlessSigner();
    return headless;
  };
  /** Lock: the key is dropped with the worker that held it. Nothing was ever stored, so there is nothing to clear. */
  const lock = () => {
    headless?.destroy();
    headless = null;
    pubkey = null;
    name = null;
    until = 0;
  };
  const say = (reply: SignerReply) => {
    if (world) window.parent.postMessage(signerMessage(reply), world);
  };
  const state = (id?: string): SignerReply => {
    if (pubkey && Date.now() / 1000 >= until) lock();
    return { t: "state", ...(id ? { id } : {}), unlocked: !!pubkey, ...(pubkey ? { pubkey, until } : {}), ...(pubkey && name ? { name } : {}) };
  };

  const fromWorld = async (e: MessageEvent) => {
    const from = cleanOrigin(e.origin);
    if (!from) return;
    // The first page to speak from outside is the one this is embedded in. Nothing else is listened to after.
    world ||= from;
    if (from !== world) return;
    const ask = readSignerRequest(e.data);
    if (!ask) return;
    if (ask.t === "state") return say(state(ask.id));
    if (ask.t === "lock") {
      lock();
      return say(state(ask.id));
    }
    // "sign". Every way this can fail says the same thing: refused.
    const refuse = () => say({ t: "refused", id: ask.id });
    if (pubkey && Date.now() / 1000 >= until) lock();
    if (!headless || !pubkey) return refuse();
    const note = prepareForWorld(ask.event, world, Date.now() / 1000);
    if (!note || !gate.take(Date.now())) return refuse();
    try {
      const signed = (await headless.signEvent(note)) as NostrEvent;
      if (!verifyEvent(signed) || signed.pubkey !== pubkey) return refuse();
      say({ t: "signed", id: ask.id, event: signed });
    } catch {
      refuse();
    }
  };

  const fromWindow = async (e: MessageEvent) => {
    const msg = readHandoffMessage(e.data);
    if (!msg || !e.source) return;
    const back = (m: Parameters<typeof handoffMessage>[0]) => (e.source as Window).postMessage(handoffMessage(m), me);
    if (msg.t === "hello") {
      // Not yet known which world this is in (it hasn't spoken): the window is left to ask again.
      if (!world) return;
      try {
        const recipient = await (await load()).beginHandoff();
        asking = { nonce: msg.nonce, from: e.source };
        back({ t: "frame", nonce: msg.nonce, world, recipient });
      } catch {
        /* no worker: the window finds no signer, and offers nothing */
      }
      return;
    }
    if (msg.t !== "grant") return;
    // Only from the window that said hello, with the word it gave, and for the world this is really in.
    if (!asking || asking.nonce !== msg.nonce || asking.from !== e.source || msg.world !== world) return;
    asking = null;
    try {
      const got = await (await load()).acceptHandoff(msg.sealed);
      pubkey = got.pubkey;
      name = msg.name ?? null;
      until = Math.floor(Date.now() / 1000) + SIGN_LIMITS.grantSec;
      gate = createSignGate();
      back({ t: "done", nonce: msg.nonce, ok: true });
    } catch {
      lock();
      back({ t: "done", nonce: msg.nonce, ok: false });
    }
    say(state());
  };

  addEventListener("message", (e) => {
    if (e.source === window.parent) return void fromWorld(e);
    // Anything else must be a page of BitPortal's own. The browser vouches for where a message came from.
    if (e.origin === me && e.source !== window) void fromWindow(e);
  });
  // Said to whoever embeds this: it is here. The world's address isn't known yet in every browser, and this says nothing.
  window.parent.postMessage(signerMessage({ t: "ready" }), "*");
}
