/**
 * Who is signed in. BitLogin is BitPortal's only session source (BitBlocks
 * convention D8), and a visitor signs in at BitLogin's own address, in a
 * window of its own: no page of BitPortal has a sign-in form, a password or a
 * key (owner's decision, 2026-11-19). BitPortal is an application to
 * BitLogin's signer: it says what it asks for, the visitor allows it once,
 * and the signer signs that and nothing else.
 *
 * Everything else is handed a signer explicitly and never reaches for
 * `window.nostr`. The signer is NIP-07 shaped. Its results are checked here
 * before use.
 */
import { cleanName, FOLLOWS_KIND, isHex64, queryRelays, RATING_KIND, toLocal, verifyEvent, type EventTemplate, type NostrEvent } from "@nswp/core";
import { INSTANCE } from "./instance.js";

export interface Signer {
  getPublicKey(): Promise<string>;
  signEvent(template: EventTemplate): Promise<NostrEvent>;
}

export interface Session {
  pubkey: string;
  /** How the visitor signed in: 'bitlogin', or 'test'. */
  method: string;
  signer: Signer;
  /** The name the sign-in address knows them by, if any. Their own profile's name is shown before it. */
  name?: string;
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

/** The mark BitLogin's signer puts on what it signs for an application: which site asked (its `docs/sign-in-window.md` §SW9.4). */
export const SITE_MARK = "bitlogin:site";

/**
 * Wraps a signer so every signature is verified before it is used, and what was signed is what was asked.
 *
 * `site` is this page's own address, where the signer is BitLogin's for an application: that signer adds one tag
 * of its own to what it signs, saying which site asked. It is allowed for only as exactly that, once, naming this
 * site. Anything else the signer changed is a refusal.
 */
export function checkedSigner(pubkey: string, raw: { signEvent(e: EventTemplate): Promise<unknown> }, site?: string): Signer {
  return {
    getPublicKey: async () => pubkey,
    async signEvent(template) {
      const signed = await raw.signEvent({ kind: template.kind, created_at: template.created_at, tags: template.tags, content: template.content });
      if (!verifyEvent(signed)) throw new SessionError("bad_signature", "The signer returned an event that doesn't verify.");
      if (signed.pubkey !== pubkey) throw new SessionError("wrong_identity", "The signer signed as a different identity than the one signed in.");
      const marks = site ? signed.tags.filter((t) => t[0] === SITE_MARK) : [];
      const marked = marks.length === 0 || (marks.length === 1 && marks[0]!.length === 2 && marks[0]![1] === site);
      const tags = site ? signed.tags.filter((t) => t[0] !== SITE_MARK) : signed.tags;
      if (!marked || signed.kind !== template.kind || signed.created_at !== template.created_at || signed.content !== template.content || JSON.stringify(tags) !== JSON.stringify(template.tags)) {
        throw new SessionError("event_altered", "The signer changed the event before signing it.");
      }
      return signed;
    },
  };
}

/** Passes and grants: the kinds BitLogin signs only for the address they are reserved to (its §SW9.3, "Reserved"). */
export const RESERVED_KINDS: readonly number[] = [27300, 27302, 27303];

/**
 * The address BitLogin's own site knows BitPortal by, and signs passes and grants for (`KNOWN_APPS` in its
 * `embedded/permissions.ts`). It is what is gone by only where the sign-in address can't be asked: one too old
 * to say, or one that doesn't answer. Everywhere else the sign-in address is asked, and its answer stands.
 */
const NAMED_ADDRESSES: readonly string[] = ["https://portal.bitblocks.network"];
export const namedAddress = (origin: string): boolean => NAMED_ADDRESSES.includes(origin);

/** What the sign-in address said when it was asked whether it will have passes and grants signed here. Null until it has. */
let said: boolean | null = null;

/**
 * Whether a pass or a grant can be signed at this address. The sign-in address decides, and says so when
 * BitPortal tells it what it asks for: at BitPortal's own address, and at a local copy of BitPortal beside a
 * local copy of the sign-in address. Before it has answered, it is taken to be so only at BitPortal's own.
 */
export const holdsReserved = (origin: string = location.origin): boolean => said ?? namedAddress(origin);

export interface AppPermissions {
  name: string;
  sign: number[];
  appData: string[];
  read: number[];
}

/**
 * Everything BitPortal asks BitLogin to let it do as the visitor, which they are shown once, in BitLogin's own
 * window, before they allow it (BitLogin `docs/sign-in-window.md` §SW9.2):
 *
 * - 1: a post, from "My public feed" in their own room (`walk/notes.ts`).
 * - 27300: a pass for BitPortal's own room, and the Airlock's where a host names no sign-in address.
 * - 27302, 27303: a grant for a computer of their own, and for a world they are building (`walk/computers.ts`).
 * - 30004: the operator's list of worlds (`operator.ts`).
 * - 30078 under `bitportal/`: their settings, sealed to their own key, and read back (`sync.ts`).
 * - 37300: a world they announce (`/publish/`).
 *
 * `reserved` false leaves out the pass and the two grants: what is asked for at an address the sign-in address
 * won't sign those for, where naming them would have the whole set turned down.
 *
 * A rating of a world (NSWP-13, kind 37305) was added on 2026-11-20, on the owner's word.
 * Adding to this is adding to what every visitor is asked to allow: it is the owner's to change.
 *
 * `more` is what is asked for only once a visitor has used the thing that needs it (`askFor`; the owner's
 * decision of 2026-11-20: "only when someone first uses People or Messages"):
 *
 * - "people": 3, who they follow (NSWP-14). BitLogin lists it apart, under a warning.
 *
 * Nobody is asked for these at sign-in unless this device has already been let.
 */
export function permissionsFor(reserved: boolean, more: readonly Ask[] = []): AppPermissions {
  const sign = [1, ...(more.includes("people") ? [FOLLOWS_KIND] : []), ...(reserved ? RESERVED_KINDS : []), 30004, 30078, 37300, RATING_KIND];
  return { name: "BitPortal", sign, appData: ["bitportal/"], read: [30078] };
}

/** What BitPortal asks a visitor for only when they first use it, by name. */
export type Ask = "people";
const ASKS: readonly Ask[] = ["people"];
const ASKS_KEY = "bitportal:asks";

/**
 * What has been asked for and allowed on this device, beyond what everyone is asked at sign-in. It is kept for
 * the device, not the person: someone else who signs in here is asked for the same, and shown it.
 */
export function asks(): Ask[] {
  try {
    const kept = JSON.parse(localStorage.getItem(ASKS_KEY) ?? "[]") as unknown;
    return Array.isArray(kept) ? ASKS.filter((a) => kept.includes(a)) : [];
  } catch {
    return [];
  }
}
const keepAsks = (list: readonly Ask[]): void => {
  try {
    localStorage.setItem(ASKS_KEY, JSON.stringify(ASKS.filter((a) => list.includes(a))));
  } catch {
    /* a private window: asked again on the next page */
  }
};

/** Where a visitor signs in when the host names nowhere: BitLogin's own site. */
const SIGN_IN_ADDRESS = "https://bitlogin.network/";

/** The address BitPortal's visitors sign in at: the one this host names for worlds too, so there is one sign-in. */
export const signInAddress = (): string => INSTANCE.signer ?? SIGN_IN_ADDRESS;

/** The sign-in address's name, for saying where a password is typed. */
export function signInHost(): string {
  try {
    return new URL(signInAddress()).host;
  } catch {
    return "your sign-in address";
  }
}

/** What BitLogin's client says of this site: whether the visitor allowed it, and as whom. */
export interface SignInState {
  signedIn: boolean;
  pubkey?: string;
  name?: string;
  /** When what they allowed stops, in seconds. */
  until?: number;
  /** They allowed this site before, for less than it now asks: they have to be asked again. */
  needsMore?: boolean;
  /** Whether the sign-in address will show a visitor what this site asked for. Left out by one too old to say. */
  canAsk?: boolean;
}

/** BitLogin's client for an application (`bitlogin-client.js`), as far as BitPortal uses it. */
interface SignInClient {
  ready(): Promise<SignInState>;
  state(): SignInState;
  onChange(listener: (state: SignInState) => void): () => void;
  signIn(): Promise<boolean>;
  /** Open the window at its account chooser. True if someone is signed in here once it closes. */
  switchAccount?(): Promise<boolean>;
  signOut(): Promise<void>;
  signEvent(e: EventTemplate): Promise<unknown>;
  nip44: { encrypt(peer: string, text: string): Promise<string> };
  decryptEvent(event: NostrEvent): Promise<string>;
  /** Remove its frame and stop listening. */
  destroy(): void;
}

const RECORD = "bitportal:signed-in";

/** Write down who the signer says is signed in: their public key and name, and nothing that could sign. */
function keepRecord(state: SignInState): void {
  try {
    if (state.signedIn && isHex64(state.pubkey)) localStorage.setItem(RECORD, JSON.stringify({ pubkey: state.pubkey, ...(state.name ? { name: state.name } : {}), until: state.until ?? 0 }));
    else localStorage.removeItem(RECORD);
  } catch {
    /* not kept: every page asks the signer anyway */
  }
}

/**
 * Who the signer last said was signed in, read from this browser's own note of it, with nothing loaded and nothing
 * asked. For the Airlock, which must never wait on another site and never shows a sign-in: it decides only whose
 * home to go to and what the screen says. It can sign nothing, and nothing is signed on its word.
 */
export function knownSignedIn(now: number = Date.now()): { pubkey: string; name?: string } | null {
  try {
    const kept = JSON.parse(localStorage.getItem(RECORD) ?? "null") as { pubkey?: unknown; name?: unknown; until?: unknown } | null;
    if (!kept || !isHex64(kept.pubkey)) return null;
    if (typeof kept.until === "number" && kept.until > 0 && kept.until * 1000 <= now) return null;
    const name = typeof kept.name === "string" ? cleanName(kept.name) : "";
    return name ? { pubkey: kept.pubkey, name } : { pubkey: kept.pubkey };
  } catch {
    return null;
  }
}

let client: Promise<SignInClient | null> | null = null;
/** The client once it is made, for a press: a window may only be opened while the press is still being handled. */
let made: SignInClient | null = null;
/** Make a client that asks for the usual and this much more. Set once the first is made. */
let factory: ((more: readonly Ask[]) => SignInClient) | null = null;
/**
 * Everything on this page that is told when who is signed in changes. They are told by whichever client is the
 * page's now, and by none while one is being changed for another (`askFor`): a visitor who is asked for more is
 * not signed out and in again on the page behind the window.
 */
const hub = new Set<(state: SignInState) => void>();
let changing = false;
const attach = (c: SignInClient): void => {
  c.onChange((state) => {
    if (c !== made || changing) return;
    for (const fn of hub) fn(state);
  });
};

/**
 * BitLogin's client for this page: one unseen frame of the sign-in address's signer, told what BitPortal asks
 * for. Made once a page, the first time anything asks who is signed in. Null where it can't be made.
 *
 * BitPortal holds no key and no password, and none is typed on any page of it: the frame signs what the visitor
 * allowed, in BitLogin's own window, and refuses everything else.
 */
function signInClient(): Promise<SignInClient | null> {
  return (client ??= (async () => {
    try {
      const at = new URL(await toLocal(signInAddress())).origin;
      const url = "/vendor/bitlogin/bitlogin-client.js";
      const mod = (await import(/* @vite-ignore */ url)) as { createBitLoginClient(o: { at: string; permissions: unknown }): SignInClient };
      const asking = (reserved: boolean, more: readonly Ask[] = asks()) => mod.createBitLoginClient({ at, permissions: permissionsFor(reserved, more) });
      // Everything is asked for, and the sign-in address says whether it will show a visitor that. Where it won't
      // (an address it signs no pass or grant for), the same is asked again without those, so signing in still
      // works there and only what needs them is missing. One too old to say, or silent, is asked as before: for
      // everything at BitPortal's own address, and for the rest elsewhere.
      let c = asking(true);
      const first = await answered(c);
      const can = first?.canAsk;
      const reserved = can ?? namedAddress(location.origin);
      if (!reserved) {
        c.destroy();
        c = asking(false);
      }
      if (can !== undefined) said = can;
      made = c;
      factory = (more) => asking(reserved, more);
      hub.add(keepRecord);
      attach(c);
      return made;
    } catch {
      return null;
    }
  })());
}

/** How long a page waits for the sign-in address to say who is signed in, before carrying on as nobody. */
const ANSWER_MS = 8000;

/** What the signer says to being told what is asked for, or null if it doesn't answer in time. Nothing is written down. */
async function answered(c: SignInClient): Promise<SignInState | null> {
  try {
    const ok = await Promise.race([c.ready().then(() => true), new Promise<false>((done) => setTimeout(() => done(false), ANSWER_MS))]);
    return ok ? c.state() : null;
  } catch {
    return null;
  }
}

/** What the signer says now, or null if it doesn't answer in time. */
async function settled(c: SignInClient): Promise<SignInState | null> {
  try {
    // `ready()` answers with what was so the first time it was asked. What is so now is `state()`.
    const answered = await Promise.race([c.ready().then(() => true), new Promise<false>((done) => setTimeout(() => done(false), ANSWER_MS))]);
    if (!answered) return null;
    const state = c.state();
    keepRecord(state);
    return state;
  } catch {
    return null;
  }
}

const appSigner = (c: SignInClient, pubkey: string): Signer => checkedSigner(pubkey, c, location.origin);

/**
 * Follows who is signed in on this page: called once with what the signer says, and again whenever that changes
 * (they signed in, in BitLogin's window, or out). `error` says why nobody could be asked.
 */
export function watchSignIn(onChange: (session: Session | null, error?: SessionError, state?: SignInState) => void): void {
  void (async () => {
    const c = await signInClient();
    if (!c) return onChange(null, new SessionError("no_signer", `${signInHost()} couldn't be reached, so nobody can sign in just now.`, true));
    const tell = (state: SignInState) => onChange(state.signedIn && isHex64(state.pubkey) ? { pubkey: state.pubkey, method: "bitlogin", signer: appSigner(made ?? c, state.pubkey), ...(state.name ? { name: state.name } : {}) } : null, undefined, state);
    hub.add(tell);
    const first = await settled(c);
    if (first) tell(first);
    else onChange(null, new SessionError("no_signer", `${signInHost()} didn't answer, so nobody can sign in just now.`, true));
  })();
}

/**
 * Open BitLogin's window, where the visitor signs in and is asked once whether BitPortal may act as them. Call it
 * from their own press, on a page that is already watching (`watchSignIn`): a browser opens a window only for a
 * press. Resolves true once they allowed it, false if they closed the window, said no, or it was blocked.
 */
export async function signIn(): Promise<boolean> {
  const c = made ?? (await signInClient());
  if (!c) return false;
  try {
    return await c.signIn();
  } catch {
    return false;
  }
}

/** A window that was asked for and couldn't be opened while the press lasted: the next press opens it at once. */
let waitingFor: Ask | null = null;

/**
 * Ask the visitor for one thing more, in BitLogin's window: what is needed by something they have just pressed
 * (following someone). Call it from that press.
 *
 * - "allowed": they said yes. It is asked for on this device from now on, and nothing else changed for them.
 * - "declined": they said no, or closed the window. They are signed in as they were, with what they had allowed.
 * - "blocked": the window couldn't be opened while the press lasted (the sign-in address had to be loaded again
 *   first, and some browsers only open a window at once). Press again: it is ready now.
 *
 * The sign-in address shows a site one question, for everything it asks. So this page's frame of it is put away
 * and one that asks for the more is put in its place, before the window opens: two frames would be two questions,
 * and the window would not know which to show. While that is done nothing on the page is told that anyone signed
 * out, because nobody did.
 */
export async function askFor(what: Ask): Promise<"allowed" | "declined" | "blocked"> {
  const old = made;
  if (!old || !factory) return "declined";
  const settle = (c: SignInClient): void => {
    changing = false;
    const state = c.state();
    for (const fn of hub) fn(state);
  };
  const back = async (): Promise<void> => {
    waitingFor = null;
    made?.destroy();
    const c = factory!(asks());
    made = c;
    client = Promise.resolve(c);
    attach(c);
    await answered(c);
    settle(c);
  };
  if (!asks().includes(what) && waitingFor !== what) {
    changing = true;
    old.destroy();
    const c = factory([...asks(), what]);
    made = c;
    client = Promise.resolve(c);
    attach(c);
  }
  const c = made!;
  const began = Date.now();
  let ok = false;
  try {
    ok = await c.signIn();
  } catch {
    ok = false;
  }
  if (ok) {
    waitingFor = null;
    keepAsks([...asks(), what]);
    settle(c);
    return "allowed";
  }
  // Already asked for on this device, and they closed the window: nothing to put back.
  if (asks().includes(what)) {
    settle(c);
    return "declined";
  }
  // No window at all, the first time: it stays ready for one more press, and is put back if none comes.
  if (waitingFor !== what && Date.now() - began < 2500 && !c.state().signedIn) {
    waitingFor = what;
    setTimeout(() => {
      if (waitingFor === what && made === c) void back();
    }, 60_000);
    return "blocked";
  }
  await back();
  return "declined";
}

/**
 * Open BitLogin's window at its account chooser, where the visitor picks who to be here, or signs in as someone
 * new. Call it from their own press. BitPortal never sees the accounts on offer, and stays signed in as before
 * until they allow it as another. Resolves true if someone is signed in here once the window closes; who that is
 * comes the usual way (`watchSignIn`).
 */
export async function switchAccount(): Promise<boolean> {
  const c = made ?? (await signInClient());
  if (!c) return false;
  try {
    return await (c.switchAccount ? c.switchAccount() : c.signIn());
  } catch {
    return false;
  }
}

/** Sign out of BitPortal: BitLogin's signer forgets this site. They stay signed in at the sign-in address itself. */
export async function signOut(): Promise<void> {
  const c = await signInClient();
  await c?.signOut();
  keepRecord({ signedIn: false });
}

/**
 * A signer for someone already signed in, with nothing shown. It can't sign anyone in, which is the point: a page
 * in the middle of a crossing must never ask for a sign-in (NSWP spec §6.3, §12.3), so when the signer doesn't
 * hold BitPortal's permission for `expected` this returns null and the caller carries on without a signature.
 */
export async function quietSigner(expected: string): Promise<{ signer: Signer; close(): void } | null> {
  const c = await signInClient();
  const state = c ? await settled(c) : null;
  if (!c || !state?.signedIn || state.pubkey !== expected) return null;
  // The frame is the page's, and is not put away after one signature.
  return { signer: appSigner(c, expected), close: () => {} };
}

/**
 * The same, for sealing as well as signing: what keeping a visitor's settings with their profile needs
 * (sync.ts). BitLogin's worker seals to the visitor's own key, and opens only a whole signed note of a kind
 * BitPortal was allowed to read; this page never sees the key. Null when nobody is signed in as `expected`.
 */
export async function quietVault(expected: string): Promise<{ pubkey: string; sign(t: EventTemplate): Promise<NostrEvent>; seal(text: string): Promise<string>; open(note: NostrEvent): Promise<string>; close(): void } | null> {
  const c = await signInClient();
  const state = c ? await settled(c) : null;
  if (!c || !state?.signedIn || state.pubkey !== expected) return null;
  const signer = appSigner(c, expected);
  return {
    pubkey: expected,
    sign: (t) => signer.signEvent(t),
    seal: (text) => c.nip44.encrypt(expected, text),
    open: (note) => c.decryptEvent(note),
    close: () => {},
  };
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
 * Who is signed in, as BitLogin's signer says: whoever allowed BitPortal, in BitLogin's window, and hasn't signed
 * out of it since. Null for a guest, and where the sign-in address doesn't answer. It can't sign anything.
 */
export async function readSignedIn(): Promise<{ pubkey: string; name?: string } | null> {
  const c = await signInClient();
  const state = c ? await settled(c) : null;
  if (!state?.signedIn || !isHex64(state.pubkey)) return null;
  return state.name ? { pubkey: state.pubkey, name: state.name } : { pubkey: state.pubkey };
}
