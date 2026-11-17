/**
 * The BitPortal lobby (NSWP spec Phase 1): a read-only wall of doors.
 *
 * Privacy rule (spec §5.7): drawing the lobby contacts relays only. A world's
 * own site is contacted when the visitor opens its door, never before. The
 * previews on the doors come from BitPortal's own mirror (spec §5.8).
 */
import { buildAirlockUrl, checkDestination, CURATION_SET_KIND, encodeNaddr, queryRelays, WORLD_KIND } from "@nswp/core";
import bundleJson from "../starter/starter-set.json";
import { buildCatalog, type Catalog, type Entry, type StarterBundle } from "../shared/catalog.js";
import { detectTier, deviceFit, type Device } from "../shared/device.js";
import { doorArt } from "../shared/door.js";
import { plateMarks } from "../shared/plate.js";
import { decidePreview, loadedPreview, loadPreview, type PreviewDecision } from "../shared/preview.js";
import { readSignedIn } from "../shared/session.js";
import { cleanRelays, loadSettings, saveSettings, type Settings } from "../shared/settings.js";
import { plainShelf, type Candidate, type Shelf } from "../shared/shelves.js";
import { cachedVerification, verifyWorld, type VerificationResult } from "../shared/verify.js";
import { VERSION } from "../shared/version.js";
import type { FeedRequest, FeedResponse } from "./feed-worker.js";

declare global {
  interface Window {
    bitportal?: { version: string };
  }
}
window.bitportal = { version: VERSION };

const bundle = bundleJson as unknown as StarterBundle;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

type Child = Node | string | null | false | undefined;
function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  for (const c of children) if (c !== null && c !== false && c !== undefined) e.append(c);
  return e;
}
const shortKey = (pubkey: string) => `${pubkey.slice(0, 6)}…${pubkey.slice(-4)}`;

let settings: Settings = loadSettings();
let catalog: Catalog = buildCatalog(bundle);
let device: Device = { vr: false, tier: detectTier(navigator.userAgent, (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile) };
let shelves: Shelf[] = [];
let engine = "";
let notice = "";
let relayNote = "";
let signedIn: { pubkey: string; name?: string } | null = null;
const OPTOUT_KEY = "bitportal:optout";

function optedOut(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(OPTOUT_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function visibleEntries(): Entry[] {
  const hidden = optedOut();
  return catalog.entries.filter((e) => !hidden.has(e.id));
}

function entryById(id: string): Entry | undefined {
  return catalog.entries.find((e) => e.id === id) ?? catalog.unlisted.find((e) => e.id === id);
}

function candidates(): Candidate[] {
  const list = visibleEntries();
  return list.map((e) => ({
    id: e.id,
    createdAt: e.world.createdAt,
    rank: e.rank ?? list.length,
    total: list.length,
    fits: deviceFit(e.world, device).ok,
    intensity: e.world.comfort.intensity ?? null,
  }));
}

// ------------------------------------------------------------- ranking
let worker: Worker | null = null;

function rank(): Promise<void> {
  const input = candidates();
  if (!settings.ranking) {
    shelves = [plainShelf(input)];
    engine = "";
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const fallback = (why: string) => {
      shelves = [plainShelf(input)];
      notice = why;
      resolve();
    };
    try {
      worker ??= new Worker("/feed-worker.js", { type: "module" });
    } catch {
      fallback("Ranking isn't available in this browser, so this is the plain list.");
      return;
    }
    const timer = setTimeout(() => fallback("Ranking didn't start in time, so this is the plain list."), 6000);
    worker.onmessage = (e: MessageEvent<FeedResponse>) => {
      clearTimeout(timer);
      if (!e.data.ok) return fallback("Ranking failed, so this is the plain list.");
      shelves = e.data.shelves.filter((s) => s.items.length > 0);
      engine = e.data.engine;
      notice = "";
      resolve();
    };
    worker.onerror = () => {
      clearTimeout(timer);
      fallback("Ranking couldn't load, so this is the plain list.");
    };
    const req: FeedRequest = { candidates: input, now: Math.floor(Date.now() / 1000), daySeed: new Date().toISOString().slice(0, 10) };
    worker.postMessage(req);
  });
}

// ------------------------------------------------------------- drawing
// -------------------------------------------------------------- previews
/** Worlds whose preview the visitor asked to see, and doors they have opened, this visit. */
const askedPreview = new Set<string>();
const openedDoors = new Set<string>();

function previewFor(entry: Entry): PreviewDecision {
  // Only the curator's own list counts as "chosen". A world that merely turned
  // up on a relay shows a placeholder until the visitor asks (spec §5.8).
  return decidePreview(entry.world, { chosen: entry.rank !== null, asked: askedPreview.has(entry.id), doorOpen: openedDoors.has(entry.id) });
}

function paintPreview(target: HTMLElement, url: string, type: string): void {
  target.style.setProperty("--preview", `url("${url}")`);
  target.classList.add("has-preview", `preview-${type}`);
}

/** Draw a world's preview into `target` if the rules allow it now. Returns whether one is on its way. */
function showPreview(target: HTMLElement, entry: Entry): boolean {
  const d = previewFor(entry);
  if (d.show !== "now") return false;
  const have = loadedPreview(d.preview.sha256);
  if (have) paintPreview(target, have, d.preview.type);
  else
    void loadPreview(d).then((url) => {
      if (url) paintPreview(target, url, d.preview.type);
      else target.dispatchEvent(new Event("previewfailed"));
    });
  return true;
}

/** The preview at the top of a world's details: a picture you can drag to look around. */
function detailPreview(entry: Entry, onChange: () => void): HTMLElement | null {
  const d = previewFor(entry);
  if (d.show === "none" || d.show === "on-open") return null;
  const wrap = el("div", { class: "detail-preview-wrap" });
  if (d.show === "ask") {
    const why =
      d.reason === "content-warning"
        ? "This world carries a content warning, so its preview stays hidden until you ask."
        : "Nobody you've chosen has reviewed this world, so its preview stays hidden until you ask.";
    const show = el("button", { class: "button", type: "button" }, "Show preview");
    show.addEventListener("click", () => {
      askedPreview.add(entry.id);
      const next = detailPreview(entry, onChange);
      if (next) wrap.replaceWith(next);
      else wrap.remove();
      onChange();
    });
    wrap.append(el("p", { class: "preview-held" }, why), show);
    return wrap;
  }
  const pano = d.preview.type === "pano";
  const view = el("div", {
    class: "detail-preview",
    role: "img",
    "aria-label": pano ? `A 360° picture of ${entry.world.title}. Use the arrow keys to look around.` : `A picture of ${entry.world.title}.`,
  });
  const caption = el("p", { class: "preview-caption" }, pano ? "A picture supplied by this world's publisher. Drag to look around." : "A picture supplied by this world's publisher.");
  wrap.append(view, caption);
  view.addEventListener("previewfailed", () => wrap.remove());
  showPreview(view, entry);
  if (pano) {
    view.tabIndex = 0;
    let pan = 0;
    let last: number | null = null;
    const set = (next: number) => {
      pan = next;
      view.style.setProperty("--pan", `${pan}px`);
    };
    view.addEventListener("pointerdown", (e) => {
      last = e.clientX;
      view.setPointerCapture(e.pointerId);
    });
    view.addEventListener("pointermove", (e) => {
      if (last === null) return;
      set(pan + e.clientX - last);
      last = e.clientX;
    });
    const end = () => (last = null);
    view.addEventListener("pointerup", end);
    view.addEventListener("pointercancel", end);
    view.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      set(pan + (e.key === "ArrowLeft" ? 60 : -60));
    });
  }
  return wrap;
}

function hostParts(url: string): { prefix: string; domain: string } {
  const chk = checkDestination(url);
  if (!chk.ok) return { prefix: "", domain: "invalid address" };
  return { prefix: chk.value.hostPrefix, domain: chk.value.registrableDomain ?? chk.value.hostname };
}

function door(entry: Entry, why: string): HTMLElement {
  const art = doorArt(entry.id);
  const fit = deviceFit(entry.world, device);
  const host = hostParts(entry.world.url);
  const verified = cachedVerification(entry.id, entry.world.createdAt)?.state === "verified";
  const view = el("span", { class: "door-view", "aria-hidden": "true" });
  view.style.setProperty("--sky-top", art.skyTop);
  view.style.setProperty("--sky-low", art.skyLow);
  view.style.setProperty("--ground", art.ground);
  view.style.setProperty("--glow", art.glow);
  view.style.setProperty("--glow-x", `${art.glowX}%`);
  view.style.setProperty("--glow-y", `${art.glowY}%`);
  showPreview(view, entry);
  const marks = el(
    "span",
    { class: "door-marks" },
    ...plateMarks(entry.world, fit, verified).map((m) => el("span", { class: m.tone === "ok" ? "mark mark-verified" : m.tone === "warn" ? "mark mark-warn" : "mark" }, m.text)),
  );
  const button = el(
    "button",
    { class: "door", type: "button" },
    view,
    el(
      "span",
      { class: "door-plate" },
      el("span", { class: "door-title" }, entry.world.title),
      el("span", { class: "door-host" }, el("span", { class: "host-prefix" }, host.prefix), host.domain),
      marks.childElementCount > 0 && marks,
    ),
  );
  button.addEventListener("click", () => openDetail(entry, why));
  return el("li", {}, button);
}

function shelfSection(shelf: Shelf, warn = false): HTMLElement {
  const items = shelf.items.map((i) => ({ entry: entryById(i.id), why: i.why })).filter((x): x is { entry: Entry; why: string } => !!x.entry);
  return el(
    "section",
    { class: warn ? "shelf shelf-warn" : "shelf", "aria-labelledby": `shelf-${shelf.id}` },
    el("h2", { id: `shelf-${shelf.id}` }, shelf.title),
    el("p", { class: "shelf-blurb" }, shelf.blurb),
    el("ul", { class: "doors" }, ...items.map((x) => door(x.entry, x.why))),
  );
}

function draw(): void {
  const c = catalog.curator;
  const source = $("source");
  source.replaceChildren(
    signedIn ? "You're signed in, but your follows don't shape this lobby yet. These doors come from " : "You're browsing signed out. These doors come from ",
    el("strong", {}, c.title),
    ", a list signed by ",
    el("span", { class: "key", title: c.pubkey }, shortKey(c.pubkey)),
    ". ",
  );
  const about = el("button", { class: "link", type: "button" }, "About this list");
  about.addEventListener("click", openSettings);
  source.append(about);

  const main = $("shelves");
  main.replaceChildren();
  if (notice) main.append(el("p", { class: "notice", role: "status" }, notice));
  if (visibleEntries().length === 0) {
    main.append(el("p", { class: "empty" }, "The starter set has no worlds to show. Check your relays in Settings, or try again later."));
  }
  for (const s of shelves) main.append(shelfSection(s));
  if (settings.showUnlisted && catalog.unlisted.length > 0) {
    main.append(
      shelfSection(
        {
          id: "unlisted",
          title: "Announced on your relays, not reviewed",
          blurb: "Anyone can publish an announcement. Nobody you've chosen has looked at these.",
          items: catalog.unlisted.map((e) => ({ id: e.id, why: "" })),
        },
        true,
      ),
    );
  }
  $("foot-note").textContent = [
    `BitPortal ${VERSION}`,
    settings.ranking && engine ? `ranking by BitFeed ${engine}` : "ranking off",
    device.vr ? "this device can enter VR" : "this device can't enter VR",
    relayNote,
  ]
    .filter(Boolean)
    .join(", ");
}

// -------------------------------------------------------------- detail
const VERIFY_TEXT: Record<VerificationResult["state"], string> = {
  verified: "Verified. This site vouches for the key that announced it.",
  listed: "Not verified. The site publishes a manifest, but it doesn't vouch for this announcement.",
  "no-manifest": "Not verified. This site hasn't published a manifest.",
  unreachable: "This site didn't answer just now, so it couldn't be checked.",
};

function chip(text: string, kind = ""): HTMLElement {
  return el("span", { class: kind ? `chip ${kind}` : "chip" }, text);
}

function openDetail(entry: Entry, why: string): void {
  const w = entry.world;
  const host = hostParts(w.url);
  const fit = deviceFit(w, device);
  const dialog = $<HTMLDialogElement>("detail");
  const status = el("p", { class: "verify", role: "status" }, `Checking ${host.domain} now. This is when BitPortal first contacts the site.`);
  const chips = el("div", { class: "chips" });
  if (w.modes.includes("immersive-vr")) chips.append(chip("VR"));
  if (w.modes.includes("inline-3d") || w.modes.includes("2d")) chips.append(chip("Works without a headset"));
  if (w.comfort.intensity) chips.append(chip(`Intensity: ${w.comfort.intensity}`, w.comfort.intensity === "high" ? "chip-warn" : ""));
  if (w.comfort.locomotion) chips.append(chip(`Movement: ${w.comfort.locomotion}`));
  if (w.comfort.seated) chips.append(chip(`Seated: ${w.comfort.seated}`));
  if (w.capabilities.includes("rooms")) chips.append(chip("Shared rooms"));
  if (w.status !== "live") chips.append(chip(`Status: ${w.status}`));
  if (w.contentWarning !== undefined) chips.append(chip(`Content warning${w.contentWarning ? `: ${w.contentWarning}` : ""}`, "chip-warn"));
  if (fit.reason) chips.append(chip(fit.reason, fit.ok ? "" : "chip-warn"));

  const naddr = encodeNaddr({ kind: WORLD_KIND, pubkey: entry.event.pubkey, identifier: w.d, relays: settings.relays.slice(0, 2) });
  const visit = el("a", { class: "button primary", href: buildAirlockUrl(new URL("/go/", location.origin).href, { naddr, url: w.url }) }, "Visit this world");
  const close = el("button", { class: "button", type: "button" }, "Close");
  close.addEventListener("click", () => dialog.close());

  // Opening a door is the visitor's interest in this world: from here its own
  // site may be contacted, for verification and for a preview only it holds.
  openedDoors.add(entry.id);
  const parts: (HTMLElement | null)[] = [
    detailPreview(entry, draw),
    el("p", { class: "detail-host" }, el("span", { class: "host-prefix" }, host.prefix), host.domain),
    el("h2", {}, w.title),
    w.summary ? el("p", { class: "lede" }, w.summary) : null,
    chips,
    status,
    el(
      "p",
      { class: "provenance" },
      entry.curatorListing
        ? `This description was written by ${catalog.curator.title}. The site hasn't announced itself.`
        : `Announced by the key ${shortKey(entry.event.pubkey)}.`,
    ),
    why ? el("p", { class: "why" }, why) : null,
    el("p", { class: "next" }, "Visiting opens the Airlock, which shows the address once more before you leave."),
    el("div", { class: "actions" }, close, visit),
  ];
  dialog.replaceChildren(...parts.filter((p): p is HTMLElement => p !== null));
  dialog.showModal();
  visit.focus();

  const show = (r: VerificationResult) => {
    if (r.listingDenied && entry.curatorListing) {
      status.textContent = "This site asks not to be listed, so its door has been removed from your lobby.";
      status.className = "verify verify-warn";
      visit.remove();
      try {
        localStorage.setItem(OPTOUT_KEY, JSON.stringify([...optedOut(), entry.id]));
      } catch {
        /* storage unavailable */
      }
      void rank().then(draw);
      return;
    }
    const text = r.state === "no-manifest" && entry.curatorListing ? "Not verified, as expected for a site that hasn't announced itself." : VERIFY_TEXT[r.state];
    status.textContent = text;
    status.className = r.state === "verified" ? "verify verify-ok" : "verify verify-warn";
    if (r.state === "verified") draw();
  };
  const cached = cachedVerification(entry.id, w.createdAt);
  if (cached) show(cached);
  else void verifyWorld(entry.id, w).then((r) => dialog.open && show(r));
}

// ------------------------------------------------------------ settings
function openSettings(): void {
  const dialog = $<HTMLDialogElement>("settings");
  const c = catalog.curator;
  const rankBox = el("input", { type: "checkbox", id: "set-ranking" });
  rankBox.checked = settings.ranking;
  const unlistedBox = el("input", { type: "checkbox", id: "set-unlisted" });
  unlistedBox.checked = settings.showUnlisted;
  const relays = el("textarea", { id: "set-relays", rows: "4", spellcheck: "false" });
  relays.value = settings.relays.join("\n");
  const save = el("button", { class: "button primary", type: "submit" }, "Save settings");
  const cancel = el("button", { class: "button", type: "button" }, "Cancel");
  cancel.addEventListener("click", () => dialog.close());
  const form = el(
    "form",
    { method: "dialog" },
    el("h2", {}, "Settings"),
    el("h3", {}, "The list behind this lobby"),
    el("p", {}, el("strong", {}, c.title), `. ${c.description}`),
    el("p", { class: "small" }, "Signed by ", el("span", { class: "key" }, c.pubkey), `. Last changed ${new Date(c.updatedAt * 1000).toLocaleDateString()}.`),
    el("p", { class: "small" }, "A starter set is someone's hand-picked list. It decides what a new visitor sees, so its author is always named. Choosing a different list arrives with sign-in."),
    el("h3", {}, "Ranking"),
    el("label", { class: "check", for: "set-ranking" }, rankBox, " Rank shelves with BitFeed and say why each world is there"),
    el("p", { class: "small" }, "Off shows one list in date order, with no ranking code loaded."),
    el("h3", {}, "Relays"),
    el("label", { for: "set-relays" }, "Where BitPortal looks for announcements, one address per line"),
    relays,
    el("label", { class: "check", for: "set-unlisted" }, unlistedBox, " Also show worlds the starter set doesn't include"),
    el("p", { class: "small" }, "Those are unreviewed: anyone can publish an announcement."),
    el("div", { class: "actions" }, cancel, save),
  );
  form.addEventListener("submit", () => {
    const cleaned = cleanRelays(relays.value.split(/\s+/));
    settings = { ranking: rankBox.checked, showUnlisted: unlistedBox.checked, relays: cleaned.length ? cleaned : settings.relays };
    saveSettings(settings);
    void refresh();
  });
  dialog.replaceChildren(form);
  dialog.showModal();
}

// --------------------------------------------------------------- relays
async function refresh(): Promise<void> {
  await rank();
  draw();
  const authors = [...new Set([catalog.curator.pubkey, ...catalog.entries.map((e) => e.event.pubkey)])];
  const known = await queryRelays(settings.relays, { kinds: [WORLD_KIND, CURATION_SET_KIND], authors, limit: 200 }, 4000);
  const extra = settings.showUnlisted ? (await queryRelays(settings.relays, { kinds: [WORLD_KIND], limit: 60 }, 4000)).events : [];
  const answered = Object.values(known.relays).filter((s) => s === "eose").length;
  relayNote = `${answered} of ${Object.keys(known.relays).length} relays answered`;
  const before = JSON.stringify([catalog.entries.map((e) => [e.id, e.event.id]), catalog.unlisted.map((e) => e.id)]);
  catalog = buildCatalog(bundle, [...known.events, ...extra]);
  const after = JSON.stringify([catalog.entries.map((e) => [e.id, e.event.id]), catalog.unlisted.map((e) => e.id)]);
  if (before !== after) await rank();
  draw();
}

async function start(): Promise<void> {
  $("open-settings").addEventListener("click", openSettings);
  draw(); // the bundled set, at once
  // Who is signed in, read from BitLogin's small public record (no widget loaded here).
  void readSignedIn().then((who) => {
    signedIn = who;
    if (!who) return;
    const link = $("account-link");
    link.textContent = who.name ?? shortKey(who.pubkey);
    link.title = "Your identity";
    draw();
  });
  try {
    device = { ...device, vr: navigator.xr ? await navigator.xr.isSessionSupported("immersive-vr") : false };
  } catch {
    /* stays false */
  }
  await refresh();
}

void start();
