/**
 * Where a visitor starts, when that is a world of their own (NSWP-07, "A home
 * someone starts in"; spec §14.1).
 *
 * BitPortal's own room is where everyone starts, and it stays the place a
 * visitor's doors are kept. Someone who has built a world can choose it as
 * their home instead. Going home from anywhere then leads there, and their
 * home offers the way to their doors.
 *
 * A world may be a home only when it is shown to be the visitor's own, both
 * ways: they announced its address with their key, and its site admits that
 * key. Anyone can write a key into a manifest, and anyone can announce an
 * address they don't run; a home needs both. The choice is made here, in
 * Settings, by the visitor, and kept in this browser. No link, door or world
 * can make it.
 */
import { checkDestination, fetchManifest, HOME_CAPABILITY, isPublicKey, normalizeUrl, parseWorldEvent, verifyEvent, verifyOrigin, WORLD_KIND, type FetchManifestResult, type NostrEvent, type World } from "@nswp/core";
// Relays are asked and sent to with a backup behind them (NIP-66): the kit tries relays that monitors found working when none of these answers.
import { queryBacked as queryRelays } from "nswp-sdk/ui";

export interface HomeChoice {
  /** The world's entry address. */
  url: string;
  origin: string;
  /** Whose home it is: the key that announced it, signed in when it was chosen. */
  owner: string;
  /** The world's name in its publisher's announcements. */
  d: string;
  title: string;
  chosenAt: number;
}

const KEY = "bitportal:home";

export function parseHome(raw: unknown): HomeChoice | null {
  if (!raw || typeof raw !== "object") return null;
  const h = raw as Partial<HomeChoice>;
  if (typeof h.url !== "string" || !isPublicKey(h.owner) || typeof h.d !== "string" || !h.d || h.d.length > 200) return null;
  const chk = checkDestination(h.url);
  if (!chk.ok) return null;
  return { url: chk.value.url, origin: new URL(chk.value.url).origin, owner: h.owner, d: h.d, title: typeof h.title === "string" ? h.title.slice(0, 120) : "", chosenAt: typeof h.chosenAt === "number" && Number.isFinite(h.chosenAt) ? h.chosenAt : 0 };
}

export function loadHome(storage: Pick<Storage, "getItem"> = localStorage): HomeChoice | null {
  try {
    return parseHome(JSON.parse(storage.getItem(KEY) ?? "null"));
  } catch {
    return null;
  }
}

export function storeHome(home: HomeChoice | null, storage: Pick<Storage, "setItem" | "removeItem"> = localStorage): void {
  try {
    if (home) storage.setItem(KEY, JSON.stringify(home));
    else storage.removeItem(KEY);
  } catch {
    /* not kept: BitPortal's room is where they start */
  }
}

/** The home of whoever is signed in, or null: someone else's choice on this browser is not theirs. */
export function homeOf(home: HomeChoice | null, owner: string | null | undefined): HomeChoice | null {
  return home && owner && home.owner === owner ? home : null;
}

export type HomeCheckId = "address" | "signed-in" | "answers" | "announced" | "admits" | "says-so" | "headset";

export interface HomeCheck {
  id: HomeCheckId;
  ok: boolean;
  /** Whether a world can't be a home without it. The rest is worth knowing. */
  must: boolean;
  text: string;
}

export interface HomeReport {
  checks: HomeCheck[];
  /** Every `must` holds. */
  fit: boolean;
  /** What would be kept, when it is fit. */
  choice?: HomeChoice;
}

export interface HomeCheckDeps {
  relays: string[];
  fetchManifest?: (url: string) => Promise<FetchManifestResult>;
  /** The world announcements signed by one key, from the visitor's relays. */
  announcements?: (owner: string, relays: string[]) => Promise<NostrEvent[]>;
  now?: () => number;
}

const fromRelays = async (owner: string, relays: string[]): Promise<NostrEvent[]> => (await queryRelays(relays, { kinds: [WORLD_KIND], authors: [owner], limit: 100 }, 5000)).events;

/**
 * Is this world fit to be `owner`'s home? Every check is made afresh: nothing
 * about a home is taken on trust, or from what a page says about itself
 * alone.
 */
export async function checkHome(input: string, owner: string | null, deps: HomeCheckDeps): Promise<HomeReport> {
  const checks: HomeCheck[] = [];
  const done = (): HomeReport => ({ checks, fit: false });
  const add = (id: HomeCheckId, ok: boolean, text: string, must = true) => checks.push({ id, ok, must, text });

  const typed = /^[a-z][a-z0-9+.-]*:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
  const dest = checkDestination(typed);
  add("address", dest.ok, dest.ok ? "It is at an encrypted address anyone can reach." : "A home needs an https address anyone can reach. One on this computer alone is nowhere to start on another device.");
  if (!dest.ok) return done();
  const url = dest.value.url;

  add("signed-in", !!owner, owner ? "You are signed in, so it can be shown to be yours." : "Sign in first. A home has to be shown to be yours, and that takes your key.");
  if (!owner) return done();

  const m = await (deps.fetchManifest ?? fetchManifest)(url);
  add("answers", !!m.manifest, m.manifest ? "It answers, and says who may announce it." : "It didn't answer, or has no manifest at /.well-known/nswp.json. A world from the template gets one when it is signed.");
  if (!m.manifest) return done();

  // The newest valid announcement of this very address, signed by the visitor.
  let mine: (World & { createdAt: number }) | null = null;
  try {
    for (const event of await (deps.announcements ?? fromRelays)(owner, deps.relays)) {
      if (!verifyEvent(event) || event.kind !== WORLD_KIND || event.pubkey !== owner) continue;
      const world = parseWorldEvent(event);
      if (!world.ok || normalizeUrl(world.value.url) !== normalizeUrl(url)) continue;
      if (!mine || event.created_at > mine.createdAt) mine = { ...world.value, createdAt: event.created_at };
    }
  } catch {
    /* no relay answered: it stays unannounced as far as this check knows */
  }
  add("announced", !!mine, mine ? `You announced it, as "${mine.title}".` : "No announcement of this address signed by your key was found on your relays. Announce it on BitPortal's Announce a world page, signed in, giving the ID the world itself uses. The key a world's own folder signs with is a different key, and doesn't count as yours.");

  const v = mine ? verifyOrigin(mine, m.manifest, m.url) : null;
  const admits = !!m.manifest.publishers[owner] && (!v || v.verified);
  add("admits", admits, admits ? (mine ? "Its site admits your key. Together with your announcement, that makes it yours." : "Its site names your key. By itself that shows nothing: anyone can write a key there.") : !m.manifest.publishers[owner] ? "Its site doesn't name your key as one that may announce it. Anyone could announce an address; the site has to agree. In a world from the template, put your npub as \"owner\" in world.json and put it online again." : `Your announcement and its site disagree: ${v!.checks.filter((c) => !c.ok).map((c) => c.message).join(" ")}`);

  // What it says about itself, read from the site: the entry for the world you announced, or the one at this address.
  const d = mine?.d ?? Object.keys(m.manifest.worlds).find((k) => normalizeUrl(m.manifest!.worlds[k]!.entry.url) === normalizeUrl(url)) ?? "";
  const entry = d ? m.manifest.worlds[d] : undefined;
  const says = !!entry?.capabilities.includes(HOME_CAPABILITY);
  add("says-so", says, says ? "It says it can be a home, so it offers the way to your doors." : 'It doesn\'t say it can be a home ("home" among its capabilities). A world from the current template does; an older one needs bringing up to date.');

  const vr = !!entry?.entry.modes.some((mode) => /vr/i.test(mode));
  add("headset", vr, vr ? "It can be entered in a headset." : "It doesn't say it can be entered in a headset. You could still start there on a flat screen.", false);

  const fit = checks.every((c) => c.ok || !c.must);
  return { checks, fit, ...(fit && mine ? { choice: { url, origin: new URL(url).origin, owner, d: mine.d, title: mine.title, chosenAt: (deps.now ?? (() => Math.floor(Date.now() / 1000)))() } } : {}) };
}
