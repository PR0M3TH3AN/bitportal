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
  buildArrivalUrl,
  checkDestination,
  finalizeEvent,
  getPublicKey,
  fetchManifest,
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
} from "@nswp/core";

import bundleJson from "../starter/starter-set.json";
import { buildCatalog, type Catalog, type StarterBundle } from "../shared/catalog.js";
import { placeKind } from "../shared/plate.js";
import { readLeft } from "../shared/saved.js";
import { goMode, inlineLook, loadLook, setGoMode, type GoMode } from "../shared/look.js";
import { issuePass } from "../shared/pass.js";
import { checkedSigner, quietSigner, readSignedIn, shortKey, type Signer } from "../shared/session.js";
import { loadSettings } from "../shared/settings.js";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const SELF = `${location.origin}${location.pathname}`;

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
  };
}

function entryFromFragment(): string | undefined {
  return parseAirlockFragment(location.hash)?.entryPoint;
}

async function render(): Promise<void> {
  const main = $("main");
  const req = parseAirlockFragment(location.hash);
  if (!req) {
    // Opened with no destination: the visitor is coming home (NSWP spec §6.3).
    // Nothing is being crossed into, so there is nothing to confirm. A fragment
    // that is present but unreadable still gets the explanation below.
    if (location.hash.length <= 1) {
      // Back to the start they left from: the room if they walked out of it, the list otherwise.
      location.replace(new URL(readLeft()?.from === "walk" ? "/walk/" : "/", location.origin).href);
      return;
    }
    $("landing").hidden = false;
    $("checking").hidden = true;
    return;
  }
  $("landing").hidden = true;
  $("checking").hidden = false;
  const started = performance.now();
  const a = await assess();
  $("checking").hidden = true;
  if ("fatal" in a) {
    main.append(
      el("section", { class: "card blocked" }, el("h1", {}, "This door is blocked"), el("p", {}, a.fatal.message), el("p", { class: "muted small" }, `Reason: ${a.fatal.code}`), el("div", { class: "actions" }, backButton())),
    );
    return;
  }

  const verified = !!a.verification?.verified;
  const entry = entryFromFragment();
  const approvalKey = a.world?.pubkey ? `${a.origin}|${a.world.pubkey}|${a.world.d}` : null;
  const approved = readJson<Record<string, boolean>>(APPROVED, {});
  const fastPath = verified && !!approvalKey && approved[approvalKey] === true && !a.publisherChanged && a.warnings.length === 0;

  const host = el("p", { class: "host" }, el("span", { class: "prefix" }, a.hostPrefix), el("strong", {}, a.domain));
  const status = verified
    ? chip("Verified for this site", "ok")
    : a.world
      ? chip(a.listedBy ? `Listed by ${a.listedBy}, not verified` : "Listed, not verified", "warn")
      : chip("Unlisted destination", "warn");
  const chips = el("div", { class: "chips" }, status);
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

  const device = el("p", { class: "muted" }, vr ? "This device can enter VR. You'll press Enter VR again on arrival." : "This device can't enter VR; the world opens in your browser.");

  const card = el(
    "section",
    { class: "card" },
    el("p", { class: "leaving" }, "This door leads to"),
    host,
    el("p", { class: "full-url muted" }, a.url),
    w ? el("h1", {}, w.title) : el("h1", {}, "An unlisted site"),
    w?.summary ? el("p", {}, w.summary) : "",
    chips,
    device,
  );
  if (a.warnings.length) card.append(issueList(a.warnings, "warn"));

  // How to go: by name, as a guest wearing your look, or plain (NSWP-05,
  // NSWP-10). Only a world that reads the arrival context is told anything,
  // and only on this trip.
  const mine = a.nswpAware ? loadLook() : null;
  // Who is signed in, from BitLogin's public record: no widget, nothing asked. `?signer=test` stands in a throwaway.
  const testKey = new URLSearchParams(location.search).get("signer") === "test" ? crypto.getRandomValues(new Uint8Array(32)) : null;
  const who = !a.nswpAware ? null : testKey ? { pubkey: getPublicKey(testKey), name: "Test visitor" } : await readSignedIn();
  // By name is for a site that has proved it is who it says: a pass names the visitor's key for good.
  const canName = !!who && verified;
  const remembered = goMode();
  const mode: GoMode = remembered === "name" ? (canName ? "name" : mine ? "look" : "plain") : remembered === "look" && !mine ? "plain" : remembered;
  const NOTES: Record<GoMode, string> = {
    name: "This site, and the people in any room you join there, will learn your public key, together with your IP address in a room. The pass that proves it lasts four hours and can't be taken back.",
    look: "Your look lets people here recognise you from other worlds. Nobody is told who you are.",
    plain: "Nothing of yours goes with you. You are a different figure every visit.",
  };
  const note = el("p", { class: "small go-as-note", id: "go-as-note", role: "status" }, NOTES[mode]);
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
          el("p", { class: "small" }, el("a", { href: "/look/" }, mine ? "Change your look" : "Make a look"), ...(who ? [] : [". To go by name, ", el("a", { href: "/account/" }, "sign in first"), "."])),
        )
      : el(
          "p",
          { class: "small go-as-note" },
          a.nswpAware ? "You'll arrive plain: a different figure every visit. " : "This site hasn't adopted the protocol, so nothing about you goes with you. ",
          ...(a.nswpAware ? [el("a", { href: "/look/" }, "Make a look"), " to be recognised from world to world, or ", el("a", { href: "/account/" }, "sign in"), " to go by name."] : []),
        );
  identity.addEventListener("change", () => {
    note.textContent = NOTES[chosen()];
    note.className = "small go-as-note";
  });
  card.append(identity);

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
  card.append(remember);

  // Test aid for people without a headset; only the reference worlds understand ?xr=emulate.
  const isReferenceWorld = !!w && w.topics.includes("nswp") && w.topics.includes("reference");
  if (isReferenceWorld) {
    card.append(
      el(
        "div",
        { class: "remember muted" },
        el("input", { type: "checkbox", id: "emulate" }),
        el("label", { for: "emulate" }, "Testing: emulate a headset at the destination"),
      ),
    );
  }

  const go = el("button", { class: "button primary", id: "continue", type: "button" }, `Continue to ${a.domain}`) as HTMLButtonElement;
  const leave = async (): Promise<void> => {
    if (verified && approvalKey) {
      // Ticked remembers this world; unticking an earlier approval forgets it.
      const next = { ...readJson<Record<string, boolean>>(APPROVED, {}) };
      if (($("remember") as HTMLInputElement).checked) next[approvalKey] = true;
      else delete next[approvalKey];
      writeJson(APPROVED, next);
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
    if (!a.nswpAware) return location.assign(target);
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
          return await issuePass(quiet.signer, { origin: a.origin, ...(who.name ? { name: who.name } : {}) });
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
        return;
      }
    }
    // Remembered once it has worked, so a pass that couldn't be signed doesn't become the habit.
    if (mine || who) setGoMode(how);
    location.assign(buildArrivalUrl(target, { ...(entry ? { entry } : {}), airlock: SELF, ...(look ? { look } : {}), ...(pass ?? {}) }));
  };
  go.addEventListener("click", () => void leave());
  card.append(el("div", { class: "actions" }, backButton(), go));

  const answered = Object.values(a.relayStatus).filter((s) => s === "eose").length;
  const total = Object.keys(a.relayStatus).length;
  card.append(el("p", { class: "small" }, `Checked in ${Math.round(performance.now() - started)} ms${total ? `, with ${answered} of ${total} relays answering` : ""}.`));
  main.append(card);

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
    $("cancel-fast").addEventListener("click", () => {
      clearInterval(timer);
      bar.remove();
    });
  }
  go.focus();
}

function backButton(): HTMLElement {
  const b = el("button", { class: "button", type: "button" }, "Go back");
  b.addEventListener("click", () => history.back());
  return b;
}

addEventListener("hashchange", () => location.reload());
void render();
