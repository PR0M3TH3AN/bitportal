/**
 * BitPortal's Airlock (NSWP spec §6.2–§6.5). It is served from the same
 * origin as the lobby, so a visitor returning from a world comes back to
 * their own client. A static page: the destination arrives in the fragment,
 * nothing is sent to a server BitPortal runs, and the visitor confirms before
 * leaving. A visitor who is already signed in can go by name (NSWP-10); the
 * Airlock never asks anyone to sign in.
 *
 * Adapted from the NSWP reference Airlock (MIT).
 */
import {
  audienceOf,
  wayWithoutDestination,
  HOME_CAPABILITY,
  normalizeUrl,
  buildArrivalUrl,
  checkDestination,
  fragmentSaysImmersive,
  finalizeEvent,
  getPublicKey,
  fetchManifest,
  fromLocal,
  latestAddressable,
  parseAirlockFragment,
  parseWorldEvent,
  queryRelays,
  verifyOrigin,
  WORLD_KIND,
  type Issue,
  type Manifest,
  type Verification,
  type World,
  shortNpub,
  toLocal,
} from "@nswp/core";

import bundleJson from "../starter/starter-set.json";
import { buildCatalog, type Catalog, type StarterBundle } from "../shared/catalog.js";
import { placeKind } from "../shared/plate.js";
import { homeOf, loadHome, type HomeChoice } from "../shared/home.js";
import { INSTANCE } from "../shared/instance.js";
import { crossingFor } from "../shared/crossing.js";
import { checkedFor, fitFor, formOf } from "../shared/fit.js";
import { goesAsGuest, goMode, inlineLook, loadLook, setGoesAsGuest, setGoMode, startingMode, type GoMode } from "../shared/look.js";
import { forgetWhoDoor, keepWhoDoor, tabStore, takeOnce, whoDoorFrom } from "../shared/who.js";
import { issuePass } from "../shared/pass.js";
import { checkedSigner, profileName, quietSigner, readSignedIn, shortKey, type Signer } from "../shared/session.js";
import { loadSettings } from "../shared/settings.js";
import { ARRIVED_JOINED, ARRIVED_MOVING, ARRIVED_SETTINGS, carriedOn, micMayTravel, setMicMayTravel } from "../shared/travel.js";
import { blockedToCarry, blocksToAsk, loadBlockedEverywhere, loadPendingBlocks, roomBlocks, storeBlockedEverywhere, storePendingBlocks, withBlockedEverywhere } from "../shared/blocked.js";

/** The last world this Airlock sent the visitor to, as a host: where a block they report was most likely made. */
const LAST_WORLD = "bitportal:last-world";
const lastWorld = (): string => {
  try {
    return sessionStorage.getItem(LAST_WORLD) ?? "";
  } catch {
    return "";
  }
};
/** The form that goes with the visitor: how they pressed this page if they did, and otherwise what the link said. */
const formToCarry = (said: "touch" | "desk" | undefined): { form?: "touch" | "desk" } => {
  const form = pressedWith ?? said;
  return form ? { form } : {};
};
/** The visitor's own block list, as it goes with them: nothing when it is empty. */
const withBlocked = (): { blocked?: string[] } => {
  const keys = blockedToCarry(loadBlockedEverywhere(), roomBlocks());
  return keys.length ? { blocked: keys } : {};
};

/**
 * What the visitor is pressing this page with: their fingers, or a mouse. Seen here, on their own client's page,
 * it is worth more than what a link says of where they came from, so it is what goes on with them when it is known
 * (NSWP-11, "The same form on the other side").
 */
let pressedWith: "touch" | "desk" | undefined;
addEventListener(
  "pointerdown",
  (e) => {
    const type = (e as PointerEvent).pointerType;
    if (type === "touch") pressedWith = "touch";
    else if (type === "mouse") pressedWith = "desk";
  },
  { capture: true, passive: true },
);

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const SELF = `${location.origin}${location.pathname}`;
/**
 * This Airlock's address as a world is given it, for the way back. On a development server that is the real
 * address this copy stands for, which the world follows back to this copy (core, local.ts). Everywhere else it
 * is this page's own address.
 */
const selfForWorlds = (): Promise<string> => fromLocal(SELF);

function store(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function readJson<T>(key: string, fallback: T): T {
  try {
    const v = store()?.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key: string, value: unknown): void {
  try {
    store()?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: features degrade, page still works */
  }
}

const PINS = "bitportal:publisher-pins"; // origin -> verified publisher pubkey (spec §7.3)
const APPROVED = "bitportal:approved"; // "origin|pubkey|d" -> true (spec §6.5 fast path)
const ASK_ALWAYS = "bitportal:airlock-ask"; // "origin|pubkey|d" -> true: always stop at the Airlock for this world

function el(tag: string, attrs: Record<string, string> = {}, ...children: (Node | string)[]): HTMLElement {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...children);
  return e;
}

function chip(text: string, kind: "ok" | "warn" | "bad" | "plain" = "plain"): HTMLElement {
  return el("span", { class: `chip ${kind}` }, text);
}

function issueList(issues: Issue[], kind: "warn" | "bad"): HTMLElement {
  return el("ul", { class: `issues ${kind}` }, ...issues.map((i) => el("li", {}, i.message)));
}

interface Assessment {
  /** The site publishes an NSWP manifest, so it will understand an arrival context. */
  nswpAware: boolean;
  /** Set when the description comes from the starter set's curator, not the site itself. */
  listedBy: string | null;
  url: string;
  origin: string;
  hostPrefix: string;
  domain: string;
  world: World | null;
  manifest: Manifest | null;
  verification: Verification | null;
  warnings: Issue[];
  blockers: Issue[];
  relayStatus: Record<string, string>;
  publisherChanged: boolean;
  /** The world is on this copy's own list. */
  onList: boolean;
  /** The visitor has gone through the Airlock to this site before, with this same publisher. */
  beenBefore: boolean;
}

async function assess(): Promise<Assessment | { fatal: Issue }> {
  const req = parseAirlockFragment(location.hash);
  if (!req) return { fatal: { code: "no_destination", path: "", message: "" } };
  const warnings: Issue[] = [];
  let world: World | null = null;
  let relayStatus: Record<string, string> = {};
  // The starter set ships with BitPortal, signed. Its worlds are known even
  // when no relay has them.
  let starter: Catalog | null = null;
  try {
    starter = buildCatalog(bundleJson as unknown as StarterBundle);
  } catch {
    /* a broken bundle just means no local knowledge */
  }

  // 1. Resolve the world announcement, if the portal named one.
  if (req.to.startsWith("naddr1") && !req.naddr) return { fatal: { code: "naddr_invalid", path: "to", message: "The portal's world reference is malformed." } };
  if (req.naddr) {
    // The visitor's own relays first; the portal's hints are only extra places to look.
    const relays = [...new Set([...loadSettings().relays, ...(req.naddr.relays ?? [])])].slice(0, 6);
    const res = await queryRelays(relays, { kinds: [WORLD_KIND], authors: [req.naddr.pubkey], "#d": [req.naddr.identifier] });
    relayStatus = res.relays;
    const bundled = starter?.entries.find((e) => e.event.pubkey === req.naddr!.pubkey && e.world.d === req.naddr!.identifier)?.event;
    const latest = latestAddressable(bundled ? [...res.events, bundled] : res.events)[0];
    if (latest) {
      const parsed = parseWorldEvent(latest);
      if (parsed.ok) {
        world = parsed.value;
        warnings.push(...parsed.warnings);
      } else warnings.push({ code: "announcement_invalid", path: "", message: "The world's announcement is invalid, so it is treated as unlisted." });
    } else warnings.push({ code: "announcement_not_found", path: "", message: "This world's announcement wasn't found on your relays, so it can't be verified." });
  }

  // 2. Decide the URL. The announcement wins; a differing portal URL is a warning.
  const url = world?.url ?? req.url;
  if (!url) return { fatal: { code: "destination_unresolved", path: "", message: "The world couldn't be found and the portal gave no URL." } };
  if (world && req.url && checkDestination(req.url).ok && new URL(req.url).href !== new URL(world.url).href) {
    warnings.push({ code: "portal_url_mismatch", path: "", message: "The portal's URL differs from the world's announcement. The announcement's URL is used." });
  }
  const dest = checkDestination(url);
  if (!dest.ok) return { fatal: dest.error };
  warnings.push(...dest.warnings);

  // 3. The origin's manifest decides verification (spec §7.3).
  const m = await fetchManifest(dest.value.url);
  let verification: Verification | null = null;
  if (m.manifest && world) verification = verifyOrigin(world, m.manifest, m.url);
  const listedBy = world && starter && world.pubkey === starter.curator.pubkey ? starter.curator.title : null;
  if (!m.manifest) {
    warnings.push(
      listedBy
        ? { code: "curator_listing", path: "", message: `This site hasn't announced itself. Its name and description here come from ${listedBy}, not from the site.` }
        : { code: "no_manifest", path: "", message: "This site has no readable NSWP manifest, so no publisher can be verified for it." },
    );
  }
  if (!world) warnings.push({ code: "unlisted", path: "", message: "This destination isn't a listed world. Check the address carefully." });

  // 4. Publisher pinning: warn if the verified publisher for this origin changed.
  const pins = readJson<Record<string, string>>(PINS, {});
  let publisherChanged = false;
  if (verification?.verified && world?.pubkey) {
    const pinned = pins[dest.value.origin];
    if (pinned && pinned !== world.pubkey) {
      publisherChanged = true;
      warnings.push({
        code: "publisher_changed",
        path: "",
        message: "The verified publisher for this site has changed since your last visit. A lapsed domain bought by someone else looks exactly like this.",
      });
    }
  }

  return {
    nswpAware: !!m.manifest,
    listedBy,
    url: dest.value.url,
    origin: dest.value.origin,
    hostPrefix: dest.value.hostPrefix,
    domain: dest.value.registrableDomain ?? dest.value.hostname,
    world,
    manifest: m.manifest ?? null,
    verification,
    warnings,
    blockers: [],
    relayStatus,
    publisherChanged,
    onList: !!world && !!starter && starter.allowed.has(`${WORLD_KIND}:${world.pubkey}:${world.d}`),
    beenBefore: !!verification?.verified && !!world?.pubkey && pins[dest.value.origin] === world.pubkey,
  };
}

function entryFromFragment(): string | undefined {
  return parseAirlockFragment(location.hash)?.entryPoint;
}

/**
 * Take a visitor to the world they chose as their home (NSWP-07). Nothing is asked: it is theirs, and they chose
 * it. But it is looked at first, quickly. A home that doesn't answer, or whose site no longer admits their key or
 * says it can be a home, is not gone to: they start in BitPortal's room, and are told why. Returns whether it went.
 */
async function goHome(home: HomeChoice, fromHeadset: boolean, carry: { joined?: true; mic?: true; blocked?: string[]; moving?: "intense" } = {}): Promise<boolean> {
  const sorry = (why: string) => {
    try {
      sessionStorage.setItem("bitportal:home-note", why);
    } catch {
      /* they arrive in the room without being told why */
    }
    return false;
  };
  const host = new URL(home.url).host;
  const m = await fetchManifest(home.url, fetch, 3500);
  if (!m.manifest) return sorry(`Your home at ${host} didn't answer, so you are in BitPortal's room.`);
  const entry = m.manifest.worlds[home.d];
  const stillTheirs = !!m.manifest.publishers[home.owner]?.worlds.includes(home.d) && !!entry && normalizeUrl(entry.entry.url) === normalizeUrl(home.url);
  if (!stillTheirs) return sorry(`${host} no longer says it is yours, so you are in BitPortal's room. Choose your home again in Settings.`);
  if (!entry.capabilities.includes(HOME_CAPABILITY)) return sorry(`${host} no longer says it can be a home, so you are in BitPortal's room.`);
  // They arrive as they last chose to go anywhere, short of signing: with their look, or plain.
  const mine = goMode() === "plain" ? null : loadLook();
  location.replace(await toLocal(buildArrivalUrl(home.url, { airlock: await selfForWorlds(), home: true as const, ...(mine ? { look: inlineLook(mine) } : {}), ...(fromHeadset ? { immersive: true as const } : {}), ...carry })));
  return true;
}

async function render(): Promise<void> {
  const main = $("main");
  const req = parseAirlockFragment(location.hash);
  // Asked, from inside a world, for something of their own first: to say who they are, or to change how they look
  // (who.ts). Both are kept here, so they are brought here to do it, with the door kept for the way back: to the
  // place they sign in, or to the room, where a look is changed. Either way they step out of the crossing's room
  // as they would coming home, with their settings and their way of moving as they left the world. Nothing has
  // been checked or decided yet: the door is checked when they come back through here, like any other.
  if (req?.who) {
    const door = whoDoorFrom(location.hash, Date.now());
    if (door) {
      keepWhoDoor(door, tabStore());
      try {
        if (req.settings) sessionStorage.setItem(ARRIVED_SETTINGS, JSON.stringify(req.settings));
        if (req.moving === "intense") sessionStorage.setItem(ARRIVED_MOVING, req.immersive ? "headset" : "desk");
      } catch {
        /* the place they arrive keeps what it had */
      }
      location.replace(req.who === "look" ? `/walk/#look${req.immersive ? "&xr=1" : ""}` : `/account/?back=door${req.immersive ? "&xr=1" : ""}`);
      return;
    }
  }
  // What they pressed on the sign-in page for this door, if they have just come from it. Any crossing ends the offer.
  const once = req ? takeOnce(location.hash, tabStore()) : null;
  forgetWhoDoor(tabStore());
  if (!req) {
    // Opened with no destination: the visitor is coming home (NSWP spec §6.3).
    // Nothing is being crossed into, so there is nothing to confirm. A fragment
    // that is present but unreadable still gets the explanation below.
    // A world may add that the visitor left a headset session to come home (xr=1). It is still the way home.
    const way = wayWithoutDestination(location.hash);
    if (way) {
      const fromHeadset = way.immersive;
      // Someone whose home is a world of their own is taken there. Asked for their doors (a home offers that),
      // or with no home of their own, they go to BitPortal's own place, as everyone does.
      // In the room where they came from: they stay joined at home too. Nothing is asked on the way home, so a
      // microphone goes along only when they have already said theirs may.
      // How they move goes with them too: a preference, with nothing to decide about it.
      const carry = { ...carriedOn(way, { stay: true, mic: micMayTravel() }), ...withBlocked(), ...(way.moving ? { moving: way.moving } : {}), ...formToCarry(undefined), ...(way.settings ? { settings: way.settings } : {}) };
      // Who they blocked where they came from is a link's word. Nothing is asked on the way home, so it waits:
      // for the next door, or for Settings.
      if (way.blocked) storePendingBlocks(blocksToAsk(way.blocked, loadPendingBlocks(), loadBlockedEverywhere(), lastWorld()));
      const theirs = way.doors ? null : homeOf(loadHome(), (await readSignedIn())?.pubkey);
      if (theirs && (await goHome(theirs, fromHeadset, carry))) return;
      // Home is the room, whichever way they left: by one of its doors, from the list, or by a link from somewhere
      // else. They are coming from a world, on foot or in a headset, and a page of text is no place to land from
      // one. The list is one press away in the room. The room is told they are coming back, so they arrive in the
      // chamber they left a world in.
      const home = new URL("/walk/", location.origin);
      home.hash = fromHeadset ? "back&xr=1" : "back";
      // What they set in the world they left comes home with them: the room begins from it.
      if (way.settings) {
        try {
          sessionStorage.setItem(ARRIVED_SETTINGS, JSON.stringify(way.settings));
        } catch {
          /* the room keeps what it had */
        }
      }
      if (way.moving === "intense") {
        try {
          sessionStorage.setItem(ARRIVED_MOVING, fromHeadset ? "headset" : "desk");
        } catch {
          /* they turn it on themselves */
        }
      }
      if ("joined" in carry && carry.joined) {
        try {
          sessionStorage.setItem(ARRIVED_JOINED, carry.mic ? "mic" : "joined");
        } catch {
          /* the room asks, as before */
        }
      }
      location.replace(home.href);
      return;
    }
    $("landing").hidden = false;
    $("checking").hidden = true;
    return;
  }
  $("landing").hidden = true;
  $("checking").hidden = false;
  // A way to stop, while the door is being checked: a crossing to a place they know goes straight through, and this
  // is how they say "not this time". Pressed, the whole screen is shown and they are asked.
  let held = false;
  const stop = el("button", { class: "button", id: "hold", type: "button" }, "Stop here");
  stop.addEventListener("click", () => {
    held = true;
    stop.replaceWith(el("span", { class: "muted", id: "held" }, " You'll be asked before going."));
  });
  $("checking").append(" ", stop);
  const started = performance.now();
  const a = await assess();
  $("checking").hidden = true;
  if ("fatal" in a) {
    main.append(
      el("section", { class: "card blocked" }, el("h1", {}, "This door is blocked"), el("p", {}, a.fatal.message), el("p", { class: "muted small" }, `Reason: ${a.fatal.code}`), el("div", { class: "actions" }, backButton())),
    );
    return;
  }

  // Whoever runs this copy has said it won't send anyone to a world that is for adults. The address is still shown,
  // as it always is: this is about what this site does, not about where a visitor may go.
  if (a.world && !INSTANCE.allowAdult && audienceOf(a.world) === "adult") {
    main.append(
      el(
        "section",
        { class: "card blocked", id: "blocked-adult" },
        el("h1", {}, "This copy of BitPortal doesn't open this door"),
        el("p", { class: "host" }, el("span", { class: "prefix" }, a.hostPrefix), el("strong", {}, a.domain)),
        el("p", {}, a.world.audience === "adult" ? "This world says it is for adults." : "This world carries a content warning and doesn't say who it is for, so it is taken to be for adults."),
        el("p", {}, "Whoever runs this copy has chosen not to send anyone to worlds for adults. That is their decision about this site, not a judgement of the world."),
        el("p", { class: "muted small" }, "Reason: adult_not_allowed"),
        el("div", { class: "actions" }, backButton()),
      ),
    );
    return;
  }

  const verified = !!a.verification?.verified;
  const entry = entryFromFragment();
  // Read on a headset's flat panel with a controller's ray: everything to press is larger.
  if (req.immersive) document.body.classList.add("from-vr");
  const approvalKey = a.world?.pubkey ? `${a.origin}|${a.world.pubkey}|${a.world.d}` : null;
  const approved = readJson<Record<string, boolean>>(APPROVED, {});
  // People a world says the visitor blocked there, and any still waiting from a trip home. A question to answer,
  // so this screen isn't hurried past.
  const asking = blocksToAsk(req.blocked, loadPendingBlocks(), loadBlockedEverywhere(), lastWorld());
  const askAlways = !!approvalKey && readJson<Record<string, boolean>>(ASK_ALWAYS, {})[approvalKey] === true;

  const host = el("p", { class: "host" }, el("span", { class: "prefix" }, a.hostPrefix), el("strong", {}, a.domain));
  const status = verified
    ? chip("Verified for this site", "ok")
    : a.world
      ? chip(a.listedBy ? `Listed by ${a.listedBy}, not verified` : "Listed, not verified", "warn")
      : chip("Unlisted destination", "warn");
  const chips = el("div", { class: "chips" });
  const w = a.world;
  // What kind of place this is, and whether this device can run it (spec §6.7).
  const vr = navigator.xr ? await navigator.xr.isSessionSupported("immersive-vr").catch(() => false) : false;
  if (w) {
    const kind = placeKind(w);
    if (kind) chips.append(chip(kind));
    const immersiveOnly = w.modes.length > 0 && w.modes.every((m) => m === "immersive-vr" || m === "immersive-ar");
    if (immersiveOnly && !vr) chips.append(chip("Needs a VR headset", "warn"));
  }
  if (w?.comfort.intensity) chips.append(chip(`Intensity: ${w.comfort.intensity}`, w.comfort.intensity === "high" ? "warn" : "plain"));
  if (w?.comfort.locomotion) chips.append(chip(`Movement: ${w.comfort.locomotion}`));
  if (w?.comfort.seated) chips.append(chip(`Seated: ${w.comfort.seated}`));
  if (w?.perf) chips.append(chip(`Runs on: ${w.perf} and up`));
  if (w?.status && w.status !== "live") chips.append(chip(`Status: ${w.status}`, w.status === "retired" ? "bad" : "plain"));
  if (w?.contentWarning !== undefined) chips.append(chip(`Content warning${w.contentWarning ? `: ${w.contentWarning}` : ""}`, "bad"));
  if (w?.audience === "kids") chips.append(chip("For kids", "ok"));
  else if (w?.audience === "general") chips.append(chip("Not made for kids"));
  else if (w) chips.append(chip("Not rated by its maker"));

  const device = el("p", { class: "muted" }, vr ? "This device can enter VR. You'll press Enter VR again on arrival." : "This device can't enter VR; the world opens in your browser.");

  // Whether it suits the form the visitor is in: a phone, a desk, a headset. What this copy found when it tried the
  // world itself comes before what the world's maker says (fit.ts). Said up front only when there is a problem.
  const form = formOf({ immersive: req.immersive, form: pressedWith ?? req.form, touchMain: matchMedia("(pointer: coarse)").matches });
  const fit = fitFor(w, form, checkedFor(w ? `${WORLD_KIND}:${w.pubkey}:${w.d}` : undefined));
  const fitLine = el("p", { class: `fit fit-${fit.tone}`, id: "fit" }, fit.text);

  // The screen is three things: where the door leads, anything the visitor has to know or answer before going, and
  // the way through. Everything else is one press away under "More about this place", and reading it holds the
  // crossing where it is.
  const more = el("details", { class: "more", id: "more" }, el("summary", {}, "More about this place")) as HTMLDetailsElement;
  const body = el("div", { class: "more-body" });
  more.append(body);
  body.append(el("p", { class: "full-url muted" }, a.url), w?.summary ? el("p", {}, w.summary) : "", chips, fit.tone === "ok" || fit.tone === "plain" ? fitLine : "", device);

  const card = el(
    "section",
    { class: "card" },
    el("p", { class: "leaving" }, "This door leads to"),
    host,
    el("div", { class: "title-row" }, w ? el("h1", {}, w.title) : el("h1", {}, "An unlisted site"), status),
    fit.tone === "warn" || fit.tone === "bad" ? fitLine : "",
  );
  if (a.warnings.length) card.append(issueList(a.warnings, "warn"));

  // How to go: by name, as a guest wearing your look, or plain (NSWP-05,
  // NSWP-10). Only a world that reads the arrival context is told anything,
  // and only on this trip.
  const mine = a.nswpAware ? loadLook() : null;
  // Who is signed in, from BitLogin's public record: no widget, nothing asked. `?signer=test` stands in a throwaway.
  const testKey = new URLSearchParams(location.search).get("signer") === "test" ? crypto.getRandomValues(new Uint8Array(32)) : null;
  const who: { pubkey: string; name?: string } | null = !a.nswpAware ? null : testKey ? { pubkey: getPublicKey(testKey), name: "Test visitor" } : await readSignedIn();
  // The name people will see is the one in the visitor's own profile, when their sign-in doesn't carry one.
  if (who && !who.name) {
    const name = await profileName(who.pubkey, loadSettings().relays);
    if (name) who.name = name;
  }
  // By name is for a site that has proved it is who it says: a pass names the visitor's key for good.
  const canName = !!who && verified;
  const remembered = goMode();
  // Signed in is signed in everywhere (NSWP-10): to a site that has proved who it is they go by name, with nothing
  // to choose at each door, unless they have said to go as a guest. What they pressed a moment ago where they
  // signed in, for this door, comes first: it is their choice for this trip.
  const mode: GoMode = startingMode({ canName: canName && once !== "guest", hasLook: !!mine, asGuest: once === "name" ? false : goesAsGuest(), last: remembered === "name" ? "look" : remembered });
  // They asked to go by name and can't: that is something to be told, not hurried past.
  const unmet = once === "name" && mode !== "name";
  const NOTES: Record<GoMode, string> = {
    name: "This site, and the people in any room you join there, will learn your public key, together with your IP address in a room. The pass that proves it lasts four hours and can't be taken back.",
    look: "Your look lets people here recognise you from other worlds. Nobody is told who you are.",
    plain: "Nothing of yours goes with you. You are a different figure every visit.",
  };
  const note = el("p", { class: unmet ? "small go-as-note verify-warn" : "small go-as-note", id: "go-as-note", role: "status" }, unmet ? (who ? "This site hasn't proved it is the one its announcement names, so you can't go there by name. You would go as a guest." : "You aren't signed in in this browser, so you would go as a guest.") : NOTES[mode]);
  const option = (value: GoMode, text: string, enabled = true) =>
    el("label", {}, el("input", { type: "radio", name: "go-as", value, id: `go-${value}`, ...(mode === value ? { checked: "" } : {}), ...(enabled ? {} : { disabled: "" }) }), ` ${text}`);
  const chosen = (): GoMode => (document.querySelector<HTMLInputElement>('input[name="go-as"]:checked')?.value as GoMode | undefined) ?? "plain";
  const identity =
    mine || who
      ? el(
          "fieldset",
          { class: "identity" },
          el("legend", {}, "Go as"),
          who ? option("name", `Yourself, by name: ${who.name ?? shortKey(who.pubkey)}${testKey ? " (testing: a throwaway identity)" : ""}${verified ? "" : " (only for verified worlds)"}`, canName) : "",
          mine ? option("look", who ? "A guest, wearing your look" : "Yourself, wearing your look") : "",
          option("plain", "Plain: nothing of yours goes with you"),
          note,
          el("p", { class: "small" }, el("a", { href: "/look/" }, mine ? "Change your look" : "Make a look"), ...(who ? [] : [". To go by name, ", el("a", { href: "/account/?back=history" }, "sign in first"), "."])),
        )
      : el(
          "p",
          { class: "small go-as-note" },
          a.nswpAware ? "You'll arrive plain: a different figure every visit. " : "This site hasn't adopted the protocol, so nothing about you goes with you. ",
          ...(a.nswpAware ? [el("a", { href: "/look/" }, "Make a look"), " to be recognised from world to world, or ", el("a", { href: "/account/?back=history" }, "sign in"), " to go by name."] : []),
        );
  identity.addEventListener("change", () => {
    // Their own hand, on their own client's screen: as a guest from now on, or as themselves again.
    if (who) setGoesAsGuest(chosen() !== "name");
    note.textContent = NOTES[chosen()];
    note.className = "small go-as-note";
  });
  body.append(identity);

  const remember = el(
    "div",
    { class: "remember" },
    el("input", {
      type: "checkbox",
      id: "remember",
      ...(verified ? {} : { disabled: "" }),
      ...(approvalKey && approved[approvalKey] ? { checked: "" } : {}),
    }),
    el("label", { for: "remember" }, "Skip this screen next time for this world", verified ? "" : el("span", { class: "muted" }, " (only for verified worlds)")),
  );
  body.append(remember);
  // The other way about: a place they know, where they would still rather be asked.
  const always = el(
    "div",
    { class: "remember" },
    el("input", { type: "checkbox", id: "always-ask", ...(askAlways ? { checked: "" } : {}), ...(approvalKey ? {} : { disabled: "" }) }),
    el("label", { for: "always-ask" }, "Always stop here for this world", el("span", { class: "muted" }, " (it won't be gone straight through to)")),
  );
  body.append(always);

  // The link says they were in the room where they came from. It is a link's word, so it is shown, and theirs to
  // change: stay among people at the other end or not, and whether their microphone stays on. The second is off
  // until they have said it may be, once, and is remembered here.
  let stayBox: HTMLInputElement | null = null;
  let micBox: HTMLInputElement | null = null;
  // A block made in one world holds in that world. To hold everywhere it has to be on the visitor's own list,
  // here. The link that reports it is a link, so they are shown who, and the box is theirs to tick.
  let blockBox: HTMLInputElement | null = null;
  if (asking.length) {
    blockBox = el("input", { type: "checkbox", id: "block-everywhere" }) as HTMLInputElement;
    const from = asking[0]!.where;
    card.append(
      el(
        "div",
        { class: "remember staying", id: "blocking" },
        el(
          "div",
          {},
          blockBox,
          el(
            "label",
            { for: "block-everywhere" },
            `Block ${asking.length === 1 ? "this person" : `these ${asking.length} people`} everywhere you go`,
            el("span", { class: "muted" }, ` (you blocked them${from ? ` in ${from}` : " where you came from"})`),
          ),
        ),
        el("p", { class: "small muted", id: "blocking-who" }, asking.map((b) => shortNpub(b.key)).join(", "), ". Each world you arrive in is told these keys, so it can keep you apart. Undo it in Settings."),
      ),
    );
  }

  if (req.joined && a.nswpAware) {
    stayBox = el("input", { type: "checkbox", id: "stay-joined", checked: "" }) as HTMLInputElement;
    const staying = el("div", { class: "remember staying", id: "staying" }, el("div", {}, stayBox, el("label", { for: "stay-joined" }, "Stay in the room there, as you were here", el("span", { class: "muted" }, " (others there will see you)"))));
    if (req.mic) {
      micBox = el("input", { type: "checkbox", id: "stay-mic", ...(micMayTravel() ? { checked: "" } : {}) }) as HTMLInputElement;
      staying.append(el("div", {}, micBox, el("label", { for: "stay-mic" }, "Keep my microphone on between worlds", el("span", { class: "muted" }, " (others there will hear you as you arrive)"))));
      stayBox.addEventListener("change", () => {
        micBox!.disabled = !stayBox!.checked;
      });
    }
    body.append(staying);
  }

  // Test aid for people without a headset; only the reference worlds understand ?xr=emulate.
  const isReferenceWorld = !!w && w.topics.includes("nswp") && w.topics.includes("reference");
  if (isReferenceWorld) {
    body.append(
      el(
        "div",
        { class: "remember muted" },
        el("input", { type: "checkbox", id: "emulate" }),
        el("label", { for: "emulate" }, "Testing: emulate a headset at the destination"),
      ),
    );
  }

  const go = el("button", { class: "button primary", id: "continue", type: "button" }, `Continue to ${a.domain}`) as HTMLButtonElement;
  /** Through the door. Returns false if they are still here: a pass couldn't be signed, or they said stop. */
  let stopped = false;
  const leave = async (): Promise<boolean> => {
    if (verified && approvalKey) {
      // Ticked remembers this world; unticking an earlier approval forgets it.
      const next = { ...readJson<Record<string, boolean>>(APPROVED, {}) };
      if (($("remember") as HTMLInputElement).checked) next[approvalKey] = true;
      else delete next[approvalKey];
      writeJson(APPROVED, next);
    }
    if (approvalKey) {
      const asks = { ...readJson<Record<string, boolean>>(ASK_ALWAYS, {}) };
      if (($("always-ask") as HTMLInputElement).checked) asks[approvalKey] = true;
      else delete asks[approvalKey];
      writeJson(ASK_ALWAYS, asks);
    }
    if (verified && w?.pubkey) writeJson(PINS, { ...readJson<Record<string, string>>(PINS, {}), [a.origin]: w.pubkey });
    let target = a.url;
    if (isReferenceWorld && ($("emulate") as HTMLInputElement).checked) {
      const u = new URL(target);
      u.searchParams.set("xr", "emulate");
      target = u.href;
    }
    // A site that hasn't adopted NSWP gets a plain visit: nothing is added to
    // its address that it didn't ask for.
    // On a development server, a site that is being served there is visited there (core, local.ts). The check above
    // was of the real site, and the card says so.
    if (!a.nswpAware) {
      location.assign(await toLocal(target));
      return true;
    }
    // What goes with the visitor is what they chose on this screen. The choice is remembered for next time.
    const how = mine || who ? chosen() : "plain";
    // By name with no look of their own, they wear the one their key generates.
    const look = how === "plain" ? undefined : mine ? inlineLook(mine) : how === "name" && who ? JSON.stringify({ s: who.pubkey }) : undefined;
    let pass: Awaited<ReturnType<typeof issuePass>> | undefined;
    if (how === "name" && who && canName) {
      go.disabled = true;
      note.textContent = "Signing your pass.";
      // The signer is whatever already holds this visitor's session. Nothing here can ask them to sign in.
      const signing = (async () => {
        const quiet: { signer: Signer; close(): void } | null = testKey
          ? { signer: checkedSigner(who.pubkey, { signEvent: async (t) => finalizeEvent(t, testKey) }), close: () => {} }
          : await quietSigner(who.pubkey);
        if (!quiet) throw new Error("locked");
        try {
          // A pass is for the place it is shown at: on a development server, the local copy.
          return await issuePass(quiet.signer, { origin: new URL(await toLocal(a.url)).origin, ...(who.name ? { name: who.name } : {}) });
        } finally {
          quiet.close();
        }
      })();
      try {
        // A signer that never answers must not strand anyone at the door.
        pass = await Promise.race([signing, new Promise<never>((_, no) => setTimeout(() => no(new Error("slow")), 8000))]);
      } catch {
        // Don't go on as something they didn't choose. Say why, and let them pick again.
        note.textContent = "Your sign-in isn't unlocked in this browser, so a pass couldn't be signed. Go as a guest or plain, or open Your identity first and come back.";
        note.className = "small go-as-note verify-warn";
        go.disabled = false;
        return false;
      }
    }
    // Whether a microphone may travel is the visitor's standing choice: kept as they left it on this screen.
    if (micBox && stayBox?.checked) setMicMayTravel(micBox.checked);
    // Their answer about who to block everywhere, given once: ticked, they go on the list; not, they are let go.
    if (asking.length) {
      if (blockBox?.checked) storeBlockedEverywhere(withBlockedEverywhere(loadBlockedEverywhere(), asking.map((b) => b.key), asking[0]!.where));
      storePendingBlocks([]);
    }
    try {
      sessionStorage.setItem(LAST_WORLD, new URL(a.origin).host);
    } catch {
      /* the next report says "where you came from" */
    }
    const carry = { ...carriedOn(req, { stay: !!stayBox?.checked, mic: !!micBox?.checked }), ...(a.nswpAware ? withBlocked() : {}), ...(req.moving ? { moving: req.moving } : {}), ...formToCarry(req.form), ...(req.settings ? { settings: req.settings } : {}) };
    // Remembered once it has worked, so a pass that couldn't be signed doesn't become the habit.
    if (mine || who) setGoMode(how);
    if (stopped) return false;
    location.assign(await toLocal(buildArrivalUrl(target, { ...(entry ? { entry } : {}), airlock: await selfForWorlds(), ...(look ? { look } : {}), ...(pass ?? {}), ...(req.immersive ? { immersive: true as const } : {}), ...carry })));
    return true;
  };
  go.addEventListener("click", () => void leave());
  // On a development server: say plainly that the visit is to a copy on this machine or network, and which.
  const copy = await toLocal(a.url);
  if (copy !== a.url) card.append(el("p", { class: "small muted", id: "local-copy" }, `Development server: you will be taken to the copy at ${new URL(copy).host}, not to ${new URL(a.url).host}. What was checked above is the real site.`));
  // What goes with them, in a line: it is shown without their having to look for it, and changed under "more".
  const going = el("span", { id: "going-as" });
  const sayGoing = () => {
    if (!a.nswpAware) return void (going.textContent = "This site hasn't adopted the protocol, so nothing about you goes with you.");
    const how = mine || who ? chosen() : "plain";
    const as = how === "name" && who ? `by name, as ${who.name ?? shortKey(who.pubkey)}` : how === "look" ? "as a guest, wearing your look" : "as a guest, with nothing of yours";
    const room = stayBox ? (stayBox.checked ? `, staying in the room${micBox?.checked ? " with your microphone on" : ""}` : ", leaving the room you were in") : "";
    going.textContent = `Going ${as}${room}.`;
  };
  sayGoing();
  body.addEventListener("change", sayGoing);
  const change = el("button", { class: "linkish", id: "change-going", type: "button" }, "Change");
  change.addEventListener("click", () => {
    more.open = true;
    (body.querySelector("input") as HTMLElement | null)?.focus();
  });
  card.append(el("p", { class: "small going" }, going, " ", a.nswpAware ? change : ""));
  card.append(el("div", { class: "actions" }, backButton(), go));

  const answered = Object.values(a.relayStatus).filter((s) => s === "eose").length;
  const total = Object.keys(a.relayStatus).length;
  body.append(el("p", { class: "small" }, `Checked in ${Math.round(performance.now() - started)} ms${total ? `, with ${answered} of ${total} relays answering` : ""}.`));
  card.append(more);
  main.append(card);

  // How much of this screen the crossing needs (crossing.ts). A place they know, with nothing changed and nothing to
  // answer, needs none of it: they are shown where they are going, and they go.
  const crossing = crossingFor({
    verified,
    onList: a.onList,
    beenBefore: a.beenBefore,
    approved: !!approvalKey && approved[approvalKey] === true,
    askAlways,
    publisherChanged: a.publisherChanged,
    warnings: a.warnings.length,
    asking: asking.length,
    fit: fit.tone,
    setting: loadSettings().airlock,
    held,
    unmet,
  });
  document.body.dataset.crossing = crossing;
  if (crossing === "straight") {
    card.hidden = true;
    const halt = el("button", { class: "button", id: "stop-passing", type: "button" }, "Stop");
    const passing = el(
      "section",
      { class: "card passing", id: "passing", role: "status" },
      el("p", { class: "leaving" }, "Going to"),
      el("p", { class: "host" }, el("span", { class: "prefix" }, a.hostPrefix), el("strong", {}, a.domain)),
      el("p", { class: "small muted" }, `${w?.title ?? ""}. A place you have been before, and nothing about it has changed.`),
      // Who they are going as, said where it can be seen: it is the one thing about a crossing that is theirs to change.
      el("p", { class: "small", id: "passing-as" }, going.textContent ?? ""),
      el("div", { class: "actions" }, halt),
    );
    main.append(passing);
    // Anything that keeps them here shows the whole screen: they said stop, or a pass couldn't be signed.
    const reveal = () => {
      passing.remove();
      card.hidden = false;
      go.focus();
    };
    halt.addEventListener("click", () => {
      stopped = true;
      reveal();
    });
    void leave().then((went) => {
      if (!went) {
        stopped = false;
        reveal();
      }
    });
    return;
  }
  const fastPath = crossing === "countdown";
  if (fastPath) {
    let n = 3;
    const bar = el("div", { class: "fast" }, el("span", { id: "countdown" }, `Continuing in ${n}…`), el("button", { id: "cancel-fast", class: "button", type: "button" }, "Cancel"));
    card.prepend(bar);
    const timer = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(timer);
        void leave();
      } else $("countdown").textContent = `Continuing in ${n}…`;
    }, 1000);
    const hold = () => {
      clearInterval(timer);
      bar.remove();
    };
    $("cancel-fast").addEventListener("click", hold);
    // Reading more about the place holds the crossing: nobody is taken through while they are reading.
    more.addEventListener("toggle", () => {
      if (more.open) hold();
    });
  }
  go.focus();
}

function backButton(): HTMLElement {
  const b = el("button", { class: "button", type: "button" }, "Go back");
  b.addEventListener("click", () => history.back());
  return b;
}

/**
 * The address on one line, whole, as large as the card allows. It is the one thing on this screen that has to be
 * read exactly, and an address broken across two lines in the middle of a word is harder to read than a smaller
 * one. Only an address too long to fit at the smallest size worth reading is let wrap, and never cut short.
 */
const LEAST = 14;
function fitAddresses(): void {
  for (const host of document.querySelectorAll<HTMLElement>("#main .host")) {
    if (!host.isConnected || host.clientWidth === 0) continue;
    host.classList.remove("wraps");
    host.style.fontSize = "";
    let size = Number.parseFloat(getComputedStyle(host).fontSize);
    while (host.scrollWidth > host.clientWidth + 1 && size > LEAST) {
      size -= 1;
      host.style.fontSize = `${size}px`;
    }
    if (host.scrollWidth > host.clientWidth + 1) host.classList.add("wraps");
  }
}
new MutationObserver(fitAddresses).observe($("main"), { childList: true, subtree: true });
addEventListener("resize", fitAddresses);
void document.fonts?.ready.then(fitAddresses);

addEventListener("hashchange", () => location.reload());
void render();
