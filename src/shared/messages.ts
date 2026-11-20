/**
 * The visitor's private messages at BitPortal's own home (NSWP-14; Nostr's NIP-17).
 *
 * The kit holds the conversations and draws them (`createMessages`, and the Messages tab every world has). This
 * is the hand it is given here: BitLogin's signer, which seals a message to its reader and opens what was sent to
 * the visitor. This page never sees a key.
 *
 * Sending and reading private messages is not among the things BitPortal asks every visitor to allow at
 * sign-in. It is asked for the first time they open Messages or press "Write to", in BitLogin's own window
 * (`askFor`; the owner's decision of 2026-11-20). Until then nothing here can seal or open anything.
 */
import { buildMessage, buildMessageRelays, readMessage, readSeal, sealTemplate } from "@nswp/core";
import { createMessages, type MessagingHand } from "nswp-sdk/three";
import { askFor, asks, signInHost, type quietVault } from "./session.js";

export interface HomeMessagesOptions {
  /** Who is signed in, or null: a guest, or someone going about as one. */
  me(): string | null;
  /** The usual relays, beside the visitor's own. */
  relays: string[];
  vaultFor: typeof quietVault;
  /** Whether a message from this person is one the visitor would expect: someone they follow. */
  known(pubkey: string): boolean;
  say(text: string): void;
  /** In a headset: a window that opens can't be seen from in there. */
  presenting(): boolean;
}

/**
 * BitLogin counts what an application has it read, and refuses past six hundred a minute. Opening a message is
 * two readings. So no more than this many are opened in a minute: the rest wait, and none is lost to a refusal.
 */
const OPENED_A_MINUTE = 220;

export function homeMessages(o: HomeMessagesOptions): MessagingHand {
  const allowed = () => asks().includes("messages");
  let opened: number[] = [];
  const paced = async (): Promise<void> => {
    for (;;) {
      const now = Date.now();
      opened = opened.filter((t) => now - t < 60_000);
      if (opened.length < OPENED_A_MINUTE) return void opened.push(now);
      await new Promise((done) => setTimeout(done, 60_000 - (now - opened[0]!) + 50));
    }
  };
  const messages = createMessages({
    relays: o.relays,
    known: o.known,
    hand: {
      pubkey: o.me,
      ready: allowed,
      async seal(to, text) {
        const me = o.me();
        const vault = me ? await o.vaultFor(me) : null;
        const message = me ? buildMessage({ from: me, to, text, now: Date.now() / 1000 }) : null;
        if (!me || !vault || !message) return null;
        const inside = JSON.stringify(message);
        // Sealed twice: for its reader, and for the visitor to read back what they sent.
        const sealFor = async (reader: string) => vault.sign(sealTemplate(await vault.sealTo(reader, inside), Date.now() / 1000));
        try {
          return { message, seals: [await sealFor(to), await sealFor(me)] };
        } catch {
          return null;
        }
      },
      async open(wrap) {
        const me = o.me();
        const vault = me ? await o.vaultFor(me) : null;
        if (!me || !vault) return null;
        await paced();
        try {
          // Each layer is opened by the signer, and checked here: a seal that is one, and a message written by
          // whoever signed the seal.
          const seal = readSeal(await vault.open(wrap));
          return seal ? readMessage(await vault.open(seal), seal, me) : null;
        } catch {
          return null;
        }
      },
      async reach(relays) {
        const me = o.me();
        const vault = me ? await o.vaultFor(me) : null;
        const made = buildMessageRelays(relays, Date.now() / 1000);
        if (!vault || !made) return null;
        try {
          return await vault.sign(made);
        } catch {
          return null;
        }
      },
    },
  });
  return {
    messages,
    pubkey: o.me,
    allowed,
    ask(then) {
      const where = signInHost();
      if (o.presenting()) return `Private messages are one more thing ${where} asks you about, once, in a window that can't be seen from in here. Step out of the headset and press this again.`;
      void askFor("messages").then((answer) => {
        if (answer === "allowed") then();
        else o.say(answer === "blocked" ? `The window of ${where} is ready now. Press again to open it.` : "Nothing was changed: BitPortal can't send or read your private messages.");
      });
      return `Private messages are one more thing ${where} asks you about, once. Its window is opening.`;
    },
  };
}
