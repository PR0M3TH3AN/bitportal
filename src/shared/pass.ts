/**
 * Issuing a pass (NSWP-10): how a visitor goes by name in a world that never
 * holds their key.
 *
 * A throwaway session key is made here, for one trip. The visitor's signer
 * signs a pass saying that key speaks for them at one site for a few hours.
 * The world is handed the pass and the throwaway. The identity key stays with
 * the signer, which this code never sees inside.
 */
import { buildRoomPass, getPublicKey, verifyRoomPass, type NostrEvent } from "@nswp/core";
import type { Signer } from "./session.js";

export interface IssuedPass {
  pass: NostrEvent;
  /** The throwaway's secret half, as hex. It goes to the world, with the pass. */
  sessionKey: string;
}

export class PassError extends Error {
  readonly code: string;
  readonly retryable = false;
  constructor(code: string, message: string) {
    super(message);
    this.name = "BitPortalError";
    this.code = code;
  }
}

const hex = (bytes: Uint8Array): string => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

/**
 * Make a session key and have `signer` sign a pass for it, good at `origin`.
 * The result is checked the way a world will check it before it is returned,
 * so a pass that wouldn't be believed is never sent.
 */
export async function issuePass(
  signer: Signer,
  to: { origin: string; name?: string },
  opts: { now?: number; random?: (bytes: Uint8Array<ArrayBuffer>) => void } = {},
): Promise<IssuedPass> {
  const now = opts.now ?? Math.floor(Date.now() / 1000);
  const secret = new Uint8Array(32);
  let session = "";
  // A random 32 bytes is a valid key all but never; ask again in the case it isn't.
  for (let tries = 0; tries < 4 && !session; tries++) {
    (opts.random ?? ((b) => void crypto.getRandomValues(b)))(secret);
    try {
      session = getPublicKey(secret);
    } catch {
      /* try again */
    }
  }
  if (!session) throw new PassError("no_session_key", "Couldn't make a session key.");
  const identity = await signer.getPublicKey();
  if (session === identity) throw new PassError("no_session_key", "Couldn't make a session key.");
  const pass = await signer.signEvent(buildRoomPass({ session, origin: to.origin, ...(to.name ? { name: to.name } : {}), createdAt: now }));
  const checked = verifyRoomPass(pass, { origin: to.origin, session, now });
  if (!checked.ok || checked.value.pubkey !== identity) throw new PassError("pass_invalid", "The pass that was signed wouldn't be believed, so it wasn't used.");
  return { pass, sessionKey: hex(secret) };
}
