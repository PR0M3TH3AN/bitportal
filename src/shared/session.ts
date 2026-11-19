/**
 * Who is signed in. BitLogin is BitPortal's only session source (BitBlocks
 * convention D8); everything else is handed a signer explicitly and never
 * reaches for `window.nostr` itself.
 *
 * The signer is NIP-07 shaped. Its results are checked here before use.
 */
import { cleanName, isHex64, queryRelays, verifyEvent, type EventTemplate, type NostrEvent } from "@nswp/core";

export interface Signer {
  getPublicKey(): Promise<string>;
  signEvent(template: EventTemplate): Promise<NostrEvent>;
}

export interface Session {
  pubkey: string;
  /** How the visitor signed in: 'bitlogin', 'nip07', 'nip46', or 'test'. */
  method: string;
  signer: Signer;
}

export class SessionError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  constructor(code: string, message: string, retryable = false) {
    super(message);
    this.name = "BitPortalError";
    this.code = code;
    this.retryable = retryable;
  }
}

declare global {
  interface Window {
    nostr?: { getPublicKey(): Promise<string>; signEvent(e: EventTemplate): Promise<unknown> };
  }
}

/** Wraps a raw NIP-07 provider so every signature is verified before it is used. */
export function checkedSigner(pubkey: string, raw: { signEvent(e: EventTemplate): Promise<unknown> }): Signer {
  return {
    getPublicKey: async () => pubkey,
    async signEvent(template) {
      const signed = await raw.signEvent({ kind: template.kind, created_at: template.created_at, tags: template.tags, content: template.content });
      if (!verifyEvent(signed)) throw new SessionError("bad_signature", "The signer returned an event that doesn't verify.");
      if (signed.pubkey !== pubkey) throw new SessionError("wrong_identity", "The signer signed as a different identity than the one signed in.");
      if (signed.kind !== template.kind || signed.created_at !== template.created_at || signed.content !== template.content || JSON.stringify(signed.tags) !== JSON.stringify(template.tags)) {
        throw new SessionError("event_altered", "The signer changed the event before signing it.");
      }
      return signed;
    },
  };
}

/**
 * Follows a `<bitlogin-auth>` element. Call before the widget's script runs,
 * so a restored session's first event isn't missed.
 */
export function watchBitLogin(el: HTMLElement, onChange: (session: Session | null, error?: SessionError) => void): void {
  let current: string | null = null;
  const onLogin = async (e: Event) => {
    const detail = ((e as CustomEvent).detail ?? {}) as { pubkey?: unknown; publicKey?: unknown; method?: unknown };
    // `pubkey` is the convention (D1); today's widget still says `publicKey`.
    let pubkey = detail.pubkey ?? detail.publicKey;
    const provider = window.nostr;
    if (!provider) return onChange(null, new SessionError("no_signer", "Signed in, but no signer is available on this page."));
    try {
      if (!isHex64(pubkey)) pubkey = await provider.getPublicKey();
      if (!isHex64(pubkey)) throw new SessionError("invalid_pubkey", "The sign-in didn't report a valid public key.");
      if (pubkey === current) return;
      current = pubkey;
      onChange({ pubkey, method: typeof detail.method === "string" ? detail.method : "bitlogin", signer: checkedSigner(pubkey, provider) });
    } catch (err) {
      onChange(null, err instanceof SessionError ? err : new SessionError("sign_in_failed", "Sign-in didn't complete."));
    }
  };
  const onLogout = () => {
    current = null;
    onChange(null);
  };
  // Today's hyphen events, and the colon aliases the conventions plan (D2).
  for (const name of ["bitlogin-login", "bitlogin:login"]) el.addEventListener(name, (e) => void onLogin(e));
  for (const name of ["bitlogin-logout", "bitlogin:logout"]) el.addEventListener(name, onLogout);
}

/**
 * A signer for someone already signed in, with nothing shown: BitLogin's
 * headless module restores the session this browser already holds. It can't
 * sign anyone in, which is the point. A page in the middle of a crossing must
 * never ask for a sign-in (NSWP spec §6.3, §12.3), so when there is no
 * unlocked session for `expected` this returns null and the caller carries on
 * without a signature.
 */
export async function quietSigner(expected: string): Promise<{ signer: Signer; close(): void } | null> {
  type Headless = { restore(): Promise<{ pubkey: string } | null>; signEvent(e: EventTemplate): Promise<unknown>; destroy(): void };
  let headless: Headless | null = null;
  try {
    const url = "/vendor/bitlogin/bitlogin-headless.js";
    const mod = (await import(/* @vite-ignore */ url)) as { createHeadlessSigner(): Promise<Headless> };
    headless = await mod.createHeadlessSigner();
    const who = await headless.restore();
    if (!who || who.pubkey !== expected) {
      headless.destroy();
      return null;
    }
    const held = headless;
    return { signer: checkedSigner(expected, held), close: () => held.destroy() };
  } catch {
    headless?.destroy();
    return null;
  }
}

/**
 * The same, for sealing as well as signing: what keeping a visitor's settings with their profile needs
 * (sync.ts). BitLogin's headless module seals to the visitor's own key inside its worker; this page never sees
 * the key. Null when there is no unlocked session for `expected`, as above.
 */
export async function quietVault(expected: string): Promise<{ pubkey: string; sign(t: EventTemplate): Promise<NostrEvent>; seal(text: string): Promise<string>; open(sealed: string): Promise<string>; close(): void } | null> {
  type Headless = { restore(): Promise<{ pubkey: string } | null>; signEvent(e: EventTemplate): Promise<unknown>; nip44Encrypt?(peer: string, text: string): Promise<string>; nip44Decrypt?(peer: string, payload: string): Promise<string>; destroy(): void };
  let headless: Headless | null = null;
  try {
    const url = "/vendor/bitlogin/bitlogin-headless.js";
    const mod = (await import(/* @vite-ignore */ url)) as { createHeadlessSigner(): Promise<Headless> };
    headless = await mod.createHeadlessSigner();
    const who = await headless.restore();
    if (!who || who.pubkey !== expected || typeof headless.nip44Encrypt !== "function" || typeof headless.nip44Decrypt !== "function") {
      headless.destroy();
      return null;
    }
    const held = headless;
    const signer = checkedSigner(expected, held);
    return {
      pubkey: expected,
      sign: (t) => signer.signEvent(t),
      seal: (text) => held.nip44Encrypt!(expected, text),
      open: (sealed) => held.nip44Decrypt!(expected, sealed),
      close: () => held.destroy(),
    };
  } catch {
    headless?.destroy();
    return null;
  }
}

/** The name in a profile event's content: `display_name`, else `name`, tidied. "" when there is none. */
export function nameFromProfile(content: string): string {
  try {
    const meta = JSON.parse(content) as { display_name?: unknown; displayName?: unknown; name?: unknown };
    for (const v of [meta.display_name, meta.displayName, meta.name]) {
      if (typeof v === "string" && cleanName(v)) return cleanName(v);
    }
  } catch {
    /* not a profile */
  }
  return "";
}

/**
 * The name someone gave themselves in their public profile (kind 0), from the
 * visitor's own relays. Only ever asked about the visitor themselves. "" when
 * they have none, or no relay answers in time.
 */
export async function profileName(pubkey: string, relays: string[], timeoutMs = 2500): Promise<string> {
  try {
    const res = await queryRelays(relays, { kinds: [0], authors: [pubkey], limit: 4 }, timeoutMs);
    const newest = res.events.filter((e) => e.kind === 0 && e.pubkey === pubkey && verifyEvent(e)).sort((a, b) => b.created_at - a.created_at)[0];
    return newest ? nameFromProfile(newest.content) : "";
  } catch {
    return "";
  }
}

export function shortKey(pubkey: string): string {
  return `${pubkey.slice(0, 8)}…${pubkey.slice(-4)}`;
}

/**
 * The public-only record BitLogin keeps beside its session, read with its tiny
 * session module. Lets any page say who is signed in without loading the
 * widget. It can't sign anything.
 */
export async function readSignedIn(): Promise<{ pubkey: string; name?: string } | null> {
  try {
    const url = "/vendor/bitlogin/bitlogin-session.js";
    const mod = (await import(/* @vite-ignore */ url)) as { readCachedSession(): Promise<{ pubkey?: string; name?: string } | null> };
    const who = await mod.readCachedSession();
    if (!who || !isHex64(who.pubkey)) return null;
    return who.name ? { pubkey: who.pubkey, name: who.name } : { pubkey: who.pubkey };
  } catch {
    return null;
  }
}
