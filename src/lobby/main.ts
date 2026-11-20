/**
 * The BitPortal lobby (NSWP spec Phase 1): a read-only wall of doors.
 *
 * Privacy rule (spec §5.7): drawing the lobby contacts relays only. A world's
 * own site is contacted when the visitor opens its door, never before. The
 * previews on the doors come from BitPortal's own mirror (spec §5.8).
 */
import { forgetSync, setSyncOn, startSync, syncState, testing as syncTesting } from "../shared/sync-run.js";
import { audienceOf, buildAirlockUrl, categoryWords, checkDestination, CURATION_SET_KIND, encodeNaddr, encodeNpub, queryRelays, shortNpub, WORLD_KIND, type Tally } from "@nswp/core";
import { loadBlockedEverywhere, loadPendingBlocks, storeBlockedEverywhere, storePendingBlocks, withBlockedEverywhere, withoutBlockedEverywhere, type BlockedEverywhere } from "../shared/blocked.js";
import bundleJson from "../starter/starter-set.json";
import { buildCatalog, type Catalog, type Entry, type ListView, type StarterBundle } from "../shared/catalog.js";
import { detectTier, deviceFit, type Device } from "../shared/device.js";
import { doorArt } from "../shared/door.js";
import { commonTopics, isFinding, matches, type Find } from "../shared/find.js";
import { findList, follow, followedAuthors, FOLLOW_LIMIT, isFollowed, loadFollowed, readListAddress, refreshFollowed, storeFollowed, unfollow, type FollowedList } from "../shared/lists.js";
import { plateMarks } from "../shared/plate.js";
import { decidePreview, loadedPreview, loadPreview, type PreviewDecision } from "../shared/preview.js";
import { attachJumpList } from "../shared/jump.js";
import { saveRoomText, storedRoomText } from "../shared/room.js";
import { addSaved, isSaved, loadSaved, readLeft, refreshSaved, rememberLeft, removeSaved, savedEntries, savedUrls, storeSaved, type SavedPlace } from "../shared/saved.js";
import { countedFor, fetchRatings, followsOf, ratingMark, talliesFor } from "../shared/ratings.js";
import { quietSigner, readSignedIn } from "../shared/session.js";
import { label, pictureOf, profileOf, PROFILES_EVENT, wantProfiles } from "../shared/profiles.js";
import { changedAllowList, isOperator, loadOperatorLists, publishAllowList, storeOperatorLists } from "../shared/operator.js";
import { INSTANCE } from "../shared/instance.js";
import { loadTastes, setTaste, storeTastes, tasteFor, tasteOf, type Tastes } from "../shared/tastes.js";
import { checkHome, homeOf, loadHome, storeHome, type HomeChoice } from "../shared/home.js";
import { cleanRelays, loadSettings, saveSettings, type Settings } from "../shared/settings.js";
import { FOV_CHOICES, loadPrefs, LOOK_CHOICES, storePrefs } from "../shared/prefs.js";
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

let settings: Settings = loadSettings();
/** Your doors: kept on this device, drawn first, and left out of the shelves (spec §14.1). */
let saved: SavedPlace[] = loadSaved();
/** The lists you follow: kept on this device too (NSWP-08). */
let followed: FollowedList[] = loadFollowed();
/** What relays have sent this visit. */
let relayEvents: unknown[] = [];
/** The hashtags the visitor likes and doesn't. Kept in this browser. */
let tastes: Tastes = loadTastes();
/** The key signed in here, when it is one of this copy's operators: they see the worlds waiting to be listed, and can list them. */
let operatorKey: string | null = null;
const makeCatalog = (): Catalog => buildCatalog(bundle, relayEvents, { followed, showStarter: settings.showStarter, taken: savedUrls(saved), operatorLists: loadOperatorLists(), operatorView: !!operatorKey });
/** Whether worlds no list names are on the page: where a visitor asked, or for an operator of a copy that shows only its own list. */
const showingUnlisted = (): boolean => settings.showUnlisted || (catalog.policy.allowListOnly && !!operatorKey);
const AUDIENCE_WORDS = { kids: "For kids", general: "Not made for kids", adult: "Adults only", unrated: "Its maker doesn't say who it is for" } as const;
let catalog: Catalog = makeCatalog();
/** What the people this visitor has reason to trust thought of each world, by its coordinate (ratings.ts, NSWP-13). */
let tallies = new Map<string, Tally>();
/** What the visitor is looking for, if anything. */
const find: Find = { query: "", topic: "" };
let device: Device = { vr: false, tier: detectTier(navigator.userAgent, (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile) };
let shelves: Shelf[] = [];
let engine = "";
let notice = "";
let relayNote = "";
let signedIn: { pubkey: string; name?: string } | null = null;
const OPTOUT_KEY = "bitportal:optout";
/** The room at the top of the page, once it is up. The page is whole without it. */
let hero: import("./hero.js").Hero | null = null;

function optedOut(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(OPTOUT_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function visibleEntries(): Entry[] {
  const hidden = optedOut();
  return catalog.entries.filter((e) => !hidden.has(e.id) && !isSaved(saved, e.id));
}

function entryById(id: string): Entry | undefined {
  return savedEntries(saved, catalog).find((e) => e.id === id) ?? catalog.entries.find((e) => e.id === id) ?? catalog.unlisted.find((e) => e.id === id);
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
    topics: e.world.topics,
    taste: tasteFor(tastes, e.world.topics).score,
    tasteWhy: tasteFor(tastes, e.world.topics).why,
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
    const req: FeedRequest = { candidates: input, now: Math.floor(Date.now() / 1000), daySeed: new Date().toISOString().slice(0, 10), liked: tastes.like };
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
  // A place the visitor saved is one they chose themselves.
  return decidePreview(entry.world, { chosen: entry.rank !== null || isSaved(saved, entry.id), asked: askedPreview.has(entry.id), doorOpen: openedDoors.has(entry.id) });
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
    ...plateMarks(entry.world, fit, verified, ratingMark(tallies.get(entry.id))).map((m) => el("span", { class: m.tone === "ok" ? "mark mark-verified" : m.tone === "warn" ? "mark mark-warn" : "mark" }, m.text)),
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
  return el("li", { "data-door": entry.id }, button);
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

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** One shelf for a list on show: its worlds in its curator's order. */
function listShelf(l: ListView, index: number): HTMLElement | null {
  const hidden = optedOut();
  const ids = l.ids.filter((id) => !hidden.has(id) && !isSaved(saved, id));
  if (ids.length === 0 && l.missing === 0) return null;
  const blurb = [
    l.description,
    `A list by ${label(l.pubkey, { key: true })}.`,
    l.missing > 0 ? `${count(l.missing, "world")} on it ${l.missing === 1 ? "hasn't" : "haven't"} been found on your relays.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return shelfSection({ id: `list-${index}`, title: l.title, blurb, items: ids.map((id) => ({ id, why: "" })) });
}

function setShowUnlisted(on: boolean): void {
  settings = { ...settings, showUnlisted: on };
  saveSettings(settings);
  draw();
}

/** Worlds that announced themselves and that no list on show names (NSWP-08, "Worlds nobody has listed"). */
function unlistedSection(): HTMLElement | null {
  const unlisted = catalog.unlisted.filter((e) => !isSaved(saved, e.id));
  if (unlisted.length === 0) return null;
  if (catalog.policy.allowListOnly) {
    // Only an operator gets this far: nobody else is given these worlds at all.
    return shelfSection(
      {
        id: "unlisted",
        title: "Waiting to be listed",
        blurb: "Only you see these, because you run this copy. They announced themselves, and none is on your list. Open one to look at it, and list it if it belongs here. A world for adults can't be listed.",
        items: unlisted.map((e) => ({ id: e.id, why: "" })),
      },
      true,
    );
  }
  if (!settings.showUnlisted) {
    const show = el("button", { class: "button", type: "button", id: "show-unlisted" }, "Show them");
    show.addEventListener("click", () => setShowUnlisted(true));
    return el(
      "section",
      { class: "shelf shelf-held", "aria-labelledby": "shelf-unlisted" },
      el("h2", { id: "shelf-unlisted" }, "Announced, not on your lists"),
      el(
        "p",
        { class: "shelf-blurb" },
        `${count(unlisted.length, "world has", "worlds have")} announced ${unlisted.length === 1 ? "itself" : "themselves"} that none of your lists ${unlisted.length === 1 ? "names" : "name"}. Anyone can publish an announcement, and nobody you've chosen has looked at ${unlisted.length === 1 ? "this one" : "these"}.`,
      ),
      el("p", { class: "shelf-actions" }, show),
    );
  }
  const section = shelfSection(
    {
      id: "unlisted",
      title: "Announced, not on your lists",
      blurb: `Anyone can publish an announcement. Nobody you've chosen has looked at these, and none is checked until you open its door.${catalog.unlistedHeld > 0 ? ` ${count(catalog.unlistedHeld, "more is", "more are")} held back: one key shows three at most.` : ""}`,
      items: unlisted.map((e) => ({ id: e.id, why: "" })),
    },
    true,
  );
  const hide = el("button", { class: "button", type: "button", id: "hide-unlisted" }, "Hide these");
  hide.addEventListener("click", () => setShowUnlisted(false));
  section.append(el("p", { class: "shelf-actions" }, hide));
  return section;
}

/** What the find bar turns up, across everything on the page. */
function foundSection(): HTMLElement {
  const mine = savedEntries(saved, catalog);
  const loose = catalog.unlisted.filter((e) => !isSaved(saved, e.id));
  const pool = [...mine, ...visibleEntries(), ...(showingUnlisted() ? loose : [])];
  const hits = pool.filter((e) => matches(e.world, find));
  const heldHits = showingUnlisted() ? 0 : loose.filter((e) => matches(e.world, find)).length;
  const what = [find.query.trim() ? `"${find.query.trim()}"` : "", find.topic ? `the topic ${find.topic}` : ""].filter(Boolean).join(" and ");
  const section = el(
    "section",
    { class: "shelf", "aria-labelledby": "shelf-found" },
    el("h2", { id: "shelf-found" }, hits.length ? `${count(hits.length, "world matches", "worlds match")}` : "Nothing here matches"),
    el("p", { class: "shelf-blurb", role: "status" }, hits.length ? `Matching ${what}, among your doors and the lists on show.` : `No world among your doors and the lists on show matches ${what}.`),
    el("ul", { class: "doors" }, ...hits.map((e) => door(e, ""))),
  );
  if (heldHits > 0) {
    const show = el("button", { class: "link", type: "button" }, "Show them");
    show.addEventListener("click", () => setShowUnlisted(true));
    section.append(el("p", { class: "shelf-actions small" }, `${count(heldHits, "world", "worlds")} that nobody has listed also ${heldHits === 1 ? "matches" : "match"}. `, show));
  }
  const clear = el("button", { class: "button", type: "button" }, "Clear");
  clear.addEventListener("click", () => {
    find.query = "";
    find.topic = "";
    $<HTMLInputElement>("find-q").value = "";
    draw();
  });
  section.append(el("p", { class: "shelf-actions" }, clear));
  return section;
}

/** The topics worth narrowing by, as buttons under the find bar. */
function drawTopics(): void {
  const pool = [...savedEntries(saved, catalog), ...catalog.entries, ...(showingUnlisted() ? catalog.unlisted : [])];
  const topics = commonTopics(pool.map((e) => e.world));
  if (find.topic && !topics.includes(find.topic)) topics.unshift(find.topic);
  const box = $("find-topics");
  const had = (document.activeElement as HTMLElement | null)?.dataset?.topic;
  // A hashtag the visitor likes is offered even when few worlds carry it: they asked for it.
  for (const t of tastes.like) if (!topics.includes(t) && pool.some((e) => e.world.topics.includes(t))) topics.push(t);
  box.replaceChildren(
    ...topics.map((t) => {
      const b = el("button", { class: `topic${tasteOf(tastes, t) === "like" ? " topic-liked" : tasteOf(tastes, t) === "dislike" ? " topic-disliked" : ""}`, type: "button", "aria-pressed": String(find.topic === t), "data-topic": t }, `#${t}`);
      b.addEventListener("click", () => {
        find.topic = find.topic === t ? "" : t;
        draw();
      });
      return b;
    }),
    ...(find.topic ? [tasteButtons(find.topic)] : []),
  );
  if (had) box.querySelector<HTMLElement>(`[data-topic="${CSS.escape(had)}"]`)?.focus();
}

/** Set what the visitor thinks of a hashtag, keep it, and order the shelves again. */
function changeTaste(tag: string, to: "like" | "dislike" | "none"): void {
  tastes = setTaste(tastes, tag, to);
  storeTastes(tastes);
  void rank().then(draw);
}

/** For the hashtag being looked at: more of it, or less. Pressing the one that is on turns it off again. */
function tasteButtons(tag: string): HTMLElement {
  const now = tasteOf(tastes, tag);
  const more = el("button", { class: "topic-taste", type: "button", id: "taste-more", "aria-pressed": String(now === "like") }, `More #${tag}`);
  const less = el("button", { class: "topic-taste", type: "button", id: "taste-less", "aria-pressed": String(now === "dislike") }, `Less #${tag}`);
  more.addEventListener("click", () => changeTaste(tag, now === "like" ? "none" : "like"));
  less.addEventListener("click", () => changeTaste(tag, now === "dislike" ? "none" : "dislike"));
  return el("span", { class: "topic-tastes" }, more, less);
}

function drawShelves(): void {
  const main = $("shelves");
  main.replaceChildren();
  if (notice) main.append(el("p", { class: "notice", role: "status" }, notice));
  if (isFinding(find)) {
    main.append(foundSection());
    return;
  }
  const mine = savedEntries(saved, catalog);
  if (mine.length > 0) {
    main.append(
      shelfSection({
        id: "yours",
        title: "Your doors",
        blurb: "Places you saved. They're kept on this device and aren't published.",
        items: mine.map((e) => ({ id: e.id, why: "" })),
      }),
    );
  }
  // A list you chose to follow comes before anything ranked: it is your choice, not BitPortal's.
  catalog.lists.forEach((l, i) => {
    if (l.starter) return;
    const shelf = listShelf(l, i);
    if (shelf) main.append(shelf);
  });
  if (visibleEntries().length === 0) {
    if (catalog.lists.length === 0) {
      const open = el("button", { class: "button", type: "button" }, "Your lists");
      open.addEventListener("click", () => openLists());
      main.append(el("p", { class: "empty" }, "You aren't showing any list, so there are no doors here but your own. Follow a list, or bring BitPortal's own back."), el("p", { class: "shelf-actions" }, open));
    } else {
      main.append(el("p", { class: "empty" }, mine.length > 0 ? "You've saved every door on your lists." : "Your lists have no worlds to show. Check your relays in Settings, or try again later."));
    }
  }
  // Ranked shelves are for choosing among many. A single short list of your own is already all there is to see.
  const worthRanking = catalog.lists.some((l) => l.starter) || catalog.lists.length > 1 || visibleEntries().length >= 6;
  if (worthRanking) for (const s of shelves) main.append(shelfSection(s));
  const unlisted = unlistedSection();
  if (unlisted) main.append(unlisted);
}

function draw(): void {
  const source = $("source");
  const lead = signedIn ? "You're signed in, but your follows don't shape this lobby yet. " : "You're browsing signed out. ";
  const only = catalog.lists.length === 1 ? catalog.lists[0]! : null;
  if (only) source.replaceChildren(lead, "These doors come from ", el("strong", {}, only.title), ", a list signed by ", el("span", { class: "key", title: encodeNpub(only.pubkey) }, label(only.pubkey, { key: true })), ". ");
  else if (catalog.lists.length === 0) source.replaceChildren(lead, "You aren't showing any list. ");
  else if (catalog.policy.allowListOnly && !showingUnlisted()) source.replaceChildren(lead, "These doors are the ones this copy's operator has listed. ");
  else source.replaceChildren(lead, `These doors come from the ${catalog.lists.length} lists you've chosen. `);
  const about = el("button", { class: "link", type: "button", id: "open-lists" }, catalog.policy.allowListOnly ? "The lists here" : "Your lists");
  about.addEventListener("click", () => openLists());
  source.append(about);

  $("r-doors").textContent = String(catalog.entries.length);
  $("r-curator").textContent = only ? label(only.pubkey) : catalog.lists.length === 0 ? "nobody" : `${catalog.lists.length} people`;
  // Everyone this page names is asked about, so that it names them by the name they chose (profiles.ts).
  wantProfiles([...catalog.lists.map((l) => l.pubkey), ...catalog.entries.map((e) => e.event.pubkey), ...(signedIn ? [signedIn.pubkey] : [])], () => settings.relays);

  drawTopics();
  drawShelves();
  drawPolicy();
  $("foot-note").textContent = [
    `BitPortal ${VERSION}`,
    settings.ranking && engine ? `ranking by BitFeed ${engine}` : "ranking off",
    device.vr ? "this device can enter VR" : "this device can't enter VR",
    relayNote,
  ]
    .filter(Boolean)
    .join(", ");
}

// ------------------------------------------------------------ the operator
/**
 * For whoever runs this copy, signed in: put this world on the site's list, or take it off. Each press signs the
 * changed list with their own sign-in and publishes it. Nobody else is shown this.
 */
function operatorActions(entry: Entry): HTMLElement | null {
  const me = operatorKey;
  if (!me) return null;
  const note = el("p", { class: "small", role: "status" });
  const mine = () => catalog.operatorLists.find((e) => e.pubkey === me) ?? null;
  const onMine = () => !!mine()?.tags.some((t) => t[0] === "a" && t[1] === entry.id);
  const shipped = catalog.allowed.has(entry.id) && !onMine();
  const button = el("button", { class: "button", type: "button", id: "operator-list" });
  const label = () => (button.textContent = onMine() ? "Take off this site's list" : "List on this site");
  label();
  const box = el("div", { class: "operator", id: "operator-actions" }, el("p", { class: "small" }, "You run this copy of BitPortal. What you list here is what its visitors see."), note);
  if (audienceOf(entry.world) === "adult") {
    note.textContent = "This world is for adults, by its maker's word or because it carries a warning without saying who it is for. This site doesn't list those.";
    return box;
  }
  if (shipped) note.textContent = "It is on the list this copy ships with. Listing it yourself keeps it here whatever that list does.";
  button.addEventListener("click", async () => {
    button.disabled = true;
    const adding = !onMine();
    note.textContent = "Signing with your sign-in…";
    const quiet = await quietSigner(me);
    if (!quiet) {
      note.textContent = "Your sign-in has run out here. Sign in again on the Sign in page, then try again.";
      button.disabled = false;
      return;
    }
    try {
      const { event, accepted } = await publishAllowList(quiet.signer, changedAllowList(mine(), entry.id, adding), settings.relays);
      // Shown at once, and kept: the page doesn't wait for a relay to say it back.
      relayEvents = [...relayEvents, event];
      catalog = makeCatalog();
      storeOperatorLists(catalog.operatorLists);
      note.textContent = `${adding ? "Listed" : "Taken off"}. ${accepted ? `${count(accepted, "relay")} took the change.` : "No relay took the change, so it is only on this device for now. Try again when they answer."}`;
      label();
      void rank().then(draw);
    } catch {
      note.textContent = "That couldn't be signed. Nothing was changed.";
    } finally {
      quiet.close();
      button.disabled = false;
    }
  });
  box.append(el("div", { class: "actions" }, button));
  return box;
}

/**
 * Say, on the page, what this copy shows and what it leaves out. An operator's policy is theirs to set and the
 * visitor's to know about.
 */
function drawPolicy(): void {
  const p = catalog.policy;
  if (!p.allowListOnly && p.allowAdult) return; // nothing is held back: the page says what it always said
  const left = [catalog.withheld.adult ? `${count(catalog.withheld.adult, "world")} for adults` : "", catalog.withheld.notListed ? `${count(catalog.withheld.notListed, "world")} nobody running this copy has listed` : "", catalog.withheld.lists ? `${count(catalog.withheld.lists, "list")} you follow` : ""].filter(Boolean);
  $("yours-title").textContent = p.allowListOnly ? "This copy shows the worlds its operator has listed." : "This copy doesn't show worlds for adults.";
  const lede = document.querySelector(".yours-lede");
  if (lede) {
    lede.textContent = `BitPortal is a client anyone can host, and each copy answers to whoever hosts it. On this one${p.allowListOnly ? ", a world appears when its operator has put it on their list" : ""}${!p.allowAdult ? `${p.allowListOnly ? ", and never" : ", a world never appears"} if it is for adults` : ""}. That is about what this site shows. Where you go is yours to decide: any address can be typed into your browser.${left.length ? ` Not shown here just now: ${left.join(", ")}.` : ""}`;
  }
  const ways = document.querySelector(".yours-ways");
  if (ways && !ways.hasAttribute("data-policy")) {
    ways.setAttribute("data-policy", "");
    const listing = ways.children[1]?.cloneNode(true) as HTMLElement | undefined; // "You want it on BitPortal's list", as the page wrote it
    ways.replaceChildren(
      el("div", {}, el("h3", {}, "You have a world"), el("p", {}, "Announce it with your own key, and say who it is for: kids, not made for kids, or adults. Announcing doesn't put it on this site. The operator's list does."), el("p", {}, el("a", { class: "button", href: "/publish/" }, "Announce a world"))),
      ...(listing ? [listing] : []),
      el("div", {}, el("h3", {}, "You'd rather choose for yourself"), el("p", {}, p.allowListOnly ? "Following other people's lists is switched off on this copy. BitPortal is open source: a copy you host answers to you." : "Follow anyone's list, and it gets a shelf here."), el("p", {}, el("a", { class: "button", href: "https://github.com/PR0M3TH3AN/bitportal" }, "The source"))),
    );
  }
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
  // Its hashtags: pressing one shows every world here that carries it.
  const tags = el("p", { class: "tags", id: "detail-tags" });
  for (const t of w.topics.slice(0, 8)) {
    const b = el("button", { class: "tag", type: "button", "data-tag": t }, `#${t}`);
    b.addEventListener("click", () => {
      dialog.close();
      find.topic = t;
      draw();
      $("find").scrollIntoView({ block: "start" });
    });
    tags.append(b);
  }
  // What kind of place it is, in its maker's own word, where they said.
  const category = categoryWords(w.category);
  if (category) chips.append(chip(category, ""));
  // Who it is for, in its maker's own word, or that they didn't say.
  const audience = audienceOf(w);
  chips.append(chip(AUDIENCE_WORDS[audience], audience === "adult" ? "chip-warn" : ""));
  if (fit.reason) chips.append(chip(fit.reason, fit.ok ? "" : "chip-warn"));

  const naddr = encodeNaddr({ kind: WORLD_KIND, pubkey: entry.event.pubkey, identifier: w.d, relays: settings.relays.slice(0, 2) });
  const visit = el("a", { class: "button primary", href: buildAirlockUrl(new URL("/go/", location.origin).href, { naddr, url: w.url }) }, "Visit this world");
  visit.addEventListener("click", () => rememberLeft({ id: entry.id, from: "list" }));
  const close = el("button", { class: "button", type: "button" }, "Close");
  close.addEventListener("click", () => dialog.close());
  // Saving puts the door on the visitor's own shelf and wall. It tells nobody.
  const keep = el("button", { class: "button", type: "button" });
  const keepNote = el("p", { class: "small", role: "status" });
  const labelKeep = () => (keep.textContent = isSaved(saved, entry.id) ? "Remove from your doors" : "Save to your doors");
  labelKeep();
  keep.addEventListener("click", () => {
    const had = isSaved(saved, entry.id);
    const next = had ? removeSaved(saved, entry.id) : addSaved(saved, entry, Math.floor(Date.now() / 1000));
    if (next === saved) {
      keepNote.textContent = "Your doors are full. Remove one to save another.";
      return;
    }
    saved = next;
    keepNote.textContent = storeSaved(saved)
      ? had
        ? "Removed from your doors."
        : "Saved. It's under Your doors at the top of this page, and on your wall in the walk-in room. It's kept on this device only."
      : "This browser isn't keeping saved places (a private window?), so this lasts until you leave the page.";
    labelKeep();
    void rank().then(draw);
  });

  const onLists = catalog.lists.filter((l) => l.ids.includes(entry.id)).map((l) => l.title);
  const announced = `Announced by ${label(entry.event.pubkey, { key: true })}.`;
  const where = onLists.length ? ` On ${onLists.length === 1 ? "the list" : "the lists"} ${onLists.join(", ")}.` : isSaved(saved, entry.id) ? "" : catalog.policy.allowListOnly ? " It is not on this site's list." : " It is on none of your lists.";
  const provenance = el("p", { class: "provenance" }, entry.curatorListing ? `This description was written by the curator of ${entry.listedBy ?? "a list you follow"}. The site hasn't announced itself.` : announced + where);

  // Opening a door is the visitor's interest in this world: from here its own
  // site may be contacted, for verification and for a preview only it holds.
  openedDoors.add(entry.id);
  const parts: (HTMLElement | null)[] = [
    detailPreview(entry, draw),
    el("p", { class: "detail-host" }, el("span", { class: "host-prefix" }, host.prefix), host.domain),
    el("h2", {}, w.title),
    w.summary ? el("p", { class: "lede" }, w.summary) : null,
    chips,
    w.topics.length ? tags : null,
    status,
    provenance,
    why ? el("p", { class: "why" }, why) : null,
    el("p", { class: "next" }, "Visiting opens the Airlock, which shows the address once more before you leave."),
    keepNote,
    operatorActions(entry),
    el("div", { class: "actions" }, close, keep, visit),
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
    if (r.state === "verified") {
      // The site vouches for this key, so whoever wrote it, it is the site's own word.
      provenance.textContent = announced + where;
      draw();
    }
  };
  const cached = cachedVerification(entry.id, w.createdAt);
  if (cached) show(cached);
  else void verifyWorld(entry.id, w).then((r) => dialog.open && show(r));
}

// ------------------------------------------------------------ settings
function openSettings(): void {
  const dialog = $<HTMLDialogElement>("settings");
  dialog.setAttribute("aria-label", "Settings");
  const rankBox = el("input", { type: "checkbox", id: "set-ranking" });
  rankBox.checked = settings.ranking;
  const airlockBox = el("input", { type: "checkbox", id: "set-airlock" });
  airlockBox.checked = settings.airlock === "known";
  // What they prefer in every world (prefs.ts). Standing preferences: not whatever they last did somewhere.
  const prefs = loadPrefs(localStorage);
  const fullBox = el("input", { type: "checkbox", id: "set-full" }) as HTMLInputElement;
  fullBox.checked = prefs.full;
  const intenseBox = el("input", { type: "checkbox", id: "set-intense" }) as HTMLInputElement;
  intenseBox.checked = prefs.intense;
  const picturesBox = el("input", { type: "checkbox", id: "set-pictures" }) as HTMLInputElement;
  picturesBox.checked = prefs.pictures;
  const chatBox = el("input", { type: "checkbox", id: "set-chat" }) as HTMLInputElement;
  chatBox.checked = prefs.chat;
  const lookPick = el("select", { id: "set-look" }, ...LOOK_CHOICES.map((c) => el("option", { value: String(c.value), ...(c.value === prefs.look ? { selected: "" } : {}) }, c.word))) as HTMLSelectElement;
  // A speed set somewhere else to something not on this list is kept, and shown as what it is.
  if (!LOOK_CHOICES.some((c) => c.value === prefs.look)) lookPick.append(el("option", { value: String(prefs.look), selected: "" }, `${prefs.look} times normal`));
  const fovPick = el("select", { id: "set-fov" }, ...FOV_CHOICES.map((f) => el("option", { value: f === null ? "" : String(f), ...(f === prefs.fov ? { selected: "" } : {}) }, f === null ? "Each world's own" : `${f}°`))) as HTMLSelectElement;
  if (prefs.fov !== null && !FOV_CHOICES.includes(prefs.fov)) fovPick.append(el("option", { value: String(prefs.fov), selected: "" }, `${prefs.fov}°`));
  // Keeping settings with the visitor's profile, sealed, so they follow them to another device (sync.ts). Off until
  // they turn it on. It acts when pressed, not when the sheet is saved: it is a thing done, not a preference noted.
  const syncBox = el("input", { type: "checkbox", id: "set-sync" }) as HTMLInputElement;
  syncBox.checked = syncState().on;
  const syncStatus = el("p", { class: "small", id: "sync-status", role: "status" });
  const syncForget = el("button", { class: "link", type: "button", id: "sync-forget" }, "Take my settings off the relays, and stop");
  const when = (ms: number) => (ms ? new Date(ms).toLocaleString() : "not yet");
  const saySync = (words?: string) => {
    const state = syncState();
    syncForget.hidden = !state.on;
    syncStatus.textContent = words ?? (state.on ? `On. Last kept in step ${when(state.syncedAt)}.` : "Off. Everything stays in this browser.");
  };
  saySync();
  const signedInNow = () => !!signedIn || syncTesting();
  syncBox.addEventListener("change", () => {
    if (syncBox.checked && !signedInNow()) {
      syncBox.checked = false;
      return saySync("Sign in first: your settings are kept with a profile, sealed with its key. A guest's stay in this browser.");
    }
    const round = setSyncOn(syncBox.checked);
    if (!round) return saySync();
    saySync("Sealing your settings and looking for a copy on your relays.");
    void round.then((out) => {
      if (out.why === "locked") {
        syncBox.checked = false;
        setSyncOn(false);
        return saySync("Your sign-in has run out here, so nothing could be sealed. Sign in again and turn this on again.");
      }
      if (out.why === "unreadable") return saySync("On, but your relays couldn't be reached or the copy there couldn't be opened just now. Nothing was changed. It is tried again each time a page opens.");
      saySync(out.took.length ? `On. Settings from your profile arrived (${out.took.join(", ")}). Reload to use them.` : out.sent ? "On. Your settings are kept with your profile now." : undefined);
    });
  });
  syncForget.addEventListener("click", () => {
    saySync("Asking your relays to replace the copy with an empty one.");
    void forgetSync().then((done) => {
      syncBox.checked = syncState().on;
      saySync(done ? "Off. The copy on your relays was replaced with an empty one. A relay may still hold the old one for a while: none of them can read it." : "That couldn't be done just now. Your profile may be locked, or no relay answered.");
    });
  });
  const relays = el("textarea", { id: "set-relays", rows: "4", spellcheck: "false" });
  relays.value = settings.relays.join("\n");
  const roomBox = el("textarea", { id: "set-room", rows: "5", spellcheck: "false", placeholder: '{"room": {"template": "open", "color": "#101217", "accent": "#3df2a0"}, "items": [{"type": "bench", "position": [-3, 0, 0], "rotation": 90}]}' });
  roomBox.value = storedRoomText();
  const roomNote = el("p", { class: "small", role: "status" });
  const lists = el("button", { class: "link", type: "button" }, "Your lists");
  lists.addEventListener("click", () => {
    dialog.close();
    openLists();
  });
  // The hashtags they like and don't, each with a way to drop it.
  const hashtagRows = el("p", { class: "tags", id: "set-hashtags" });
  const drawHashtags = () => {
    const row = (t: string, kind: "like" | "dislike") => {
      const b = el("button", { class: `tag ${kind === "like" ? "topic-liked" : "topic-disliked"}`, type: "button", title: "Forget this one" }, `${kind === "like" ? "More" : "Less"} #${t} ✕`);
      b.addEventListener("click", () => {
        changeTaste(t, "none");
        drawHashtags();
      });
      return b;
    };
    const all = [...tastes.like.map((t) => row(t, "like")), ...tastes.dislike.map((t) => row(t, "dislike"))];
    hashtagRows.replaceChildren(...(all.length ? all : ["None yet."]));
  };
  drawHashtags();
  // The people they have blocked everywhere: on their own list, kept here, and handed to each world they arrive in.
  const blockedRows = el("ul", { class: "blocked-list", id: "set-blocked" });
  const drawBlocked = () => {
    const list = loadBlockedEverywhere();
    const pending = loadPendingBlocks().filter((p) => !list.some((b) => b.key === p.key));
    const when = (at: number) => (at ? new Date(at * 1000).toLocaleDateString() : "");
    const row = (b: BlockedEverywhere, waiting: boolean) => {
      const undo = el("button", { class: "button", type: "button" }, waiting ? "Forget" : "Unblock");
      undo.addEventListener("click", () => {
        if (waiting) storePendingBlocks(loadPendingBlocks().filter((x) => x.key !== b.key));
        else storeBlockedEverywhere(withoutBlockedEverywhere(loadBlockedEverywhere(), b.key));
        drawBlocked();
      });
      const keep = el("button", { class: "button primary", type: "button" }, "Block everywhere");
      keep.addEventListener("click", () => {
        storeBlockedEverywhere(withBlockedEverywhere(loadBlockedEverywhere(), [b.key], b.where, b.at || undefined));
        storePendingBlocks(loadPendingBlocks().filter((x) => x.key !== b.key));
        drawBlocked();
      });
      return el(
        "li",
        { "data-key": b.key, ...(waiting ? { "data-waiting": "" } : {}) },
        el("span", { class: "key", title: encodeNpub(b.key) }, shortNpub(b.key)),
        el("span", { class: "muted small" }, ` blocked ${[b.where && `in ${b.where}`, when(b.at)].filter(Boolean).join(", ") || "on an earlier visit"}${waiting ? ", in that world only so far" : ""} `),
        ...(waiting ? [keep, undo] : [undo]),
      );
    };
    const rows = [...pending.map((b) => row(b, true)), ...list.map((b) => row(b, false))];
    blockedRows.replaceChildren(...(rows.length ? rows : [el("li", { class: "muted" }, "Nobody.")]));
  };
  drawBlocked();
  // Where they start: BitPortal's room, or a world of their own that is shown to be theirs.
  const homeNow = el("p", { class: "small", id: "set-home-now" });
  const homeAddress = el("input", { type: "url", id: "set-home", placeholder: "https://my-world.example" });
  const homeChecks = el("ul", { class: "home-checks", id: "set-home-checks", role: "status" });
  const homeCheck = el("button", { class: "button", type: "button", id: "set-home-check" }, "Check this world");
  const homeUse = el("button", { class: "button primary", type: "button", id: "set-home-use", hidden: "" }, "Start here");
  const homeLeave = el("button", { class: "link", type: "button", id: "set-home-leave" }, "Start in BitPortal's room again");
  let found: HomeChoice | undefined;
  const showHome = async () => {
    const who = await readSignedIn();
    const home = homeOf(loadHome(), who?.pubkey);
    homeNow.replaceChildren(home ? `You start at ${home.title || "your world"}, ${new URL(home.url).host}. Your doors are still here. ` : "You start in BitPortal's room. ", ...(home ? [homeLeave] : []));
  };
  homeLeave.addEventListener("click", () => {
    storeHome(null);
    void showHome();
  });
  homeAddress.addEventListener("input", () => {
    // What was found out about one address says nothing about another.
    found = undefined;
    homeUse.hidden = true;
    homeChecks.replaceChildren();
  });
  homeCheck.addEventListener("click", async () => {
    homeCheck.disabled = true;
    homeChecks.replaceChildren(el("li", {}, "Looking at it…"));
    const who = await readSignedIn();
    const report = await checkHome(homeAddress.value, who?.pubkey ?? null, { relays: settings.relays });
    homeChecks.replaceChildren(...report.checks.map((c) => el("li", { class: c.ok ? "ok" : c.must ? "no" : "maybe" }, c.text)));
    found = report.choice;
    homeUse.hidden = !report.fit;
    homeCheck.disabled = false;
  });
  homeUse.addEventListener("click", () => {
    if (!found) return;
    storeHome(found);
    homeUse.hidden = true;
    homeChecks.replaceChildren(el("li", { class: "ok" }, "Chosen. Going home, from anywhere, now leads there."));
    void showHome();
  });
  void showHome();
  const save = el("button", { class: "button primary", type: "submit" }, "Save settings");
  const cancel = el("button", { class: "button", type: "button" }, "Cancel");
  cancel.addEventListener("click", () => dialog.close());
  const form = el(
    "form",
    { method: "dialog" },
    el("h2", {}, "Settings"),
    el("h3", {}, "Lists"),
    el("p", { class: "small" }, "Which lists fill this lobby, and whether to show worlds nobody has listed, are under ", lists, "."),
    el("h3", {}, "Doors"),
    el("label", { class: "check", for: "set-airlock" }, airlockBox, " Go straight through doors to places I've been before"),
    el(
      "p",
      { class: "small" },
      "The Airlock always stops you the first time you go somewhere, and shows you the real address. With this on, it doesn't stop you again for a place you have already been, as long as the site still proves it is who it says, it is on this copy's list, nothing about it has changed, and nothing needs an answer. You are still shown where you are going, with a Stop button. Off, it stops at every door.",
    ),
    el("h3", {}, "In every world"),
    el("label", { class: "check", for: "set-full" }, fullBox, " Fill the screen"),
    el("label", { class: "check", for: "set-intense" }, intenseBox, " At a desk, move the intense way: the mouse looks round and keys walk"),
    el("label", { class: "check", for: "set-pictures" }, picturesBox, " Show people's own pictures, from their Nostr profiles"),
    el("p", { class: "small" }, "People are shown by the name and picture they chose for themselves on Nostr. A picture is fetched from wherever its owner keeps it, which tells that place your address, as reading Nostr anywhere does. Off, nobody's picture is fetched, here or in any world."),
    el("label", { class: "check", for: "set-chat" }, chatBox, " Show what people write in a room, and let me write"),
    el("p", { class: "small" }, "What is written in a room goes straight to the people in it and is kept nowhere. Turned off, nothing anyone writes is shown to you, and nobody is told."),
    el("label", { for: "set-look" }, "How fast the view turns, with a mouse or a finger"),
    lookPick,
    el("label", { for: "set-fov" }, "How wide you see at a desk (field of view)"),
    fovPick,
    el(
      "p",
      { class: "small" },
      "These are what you prefer, not what you last did. Every world you enter starts this way, and pressing Escape or switching for a moment in one world doesn't change the next. Each has a control in any world's menu too, and changing it there changes it everywhere. A browser fills the screen only on a press, so it happens at your first key or click in each world. In a headset none of these apply.",
    ),
    el("h3", {}, "Your settings, on your other devices"),
    el("label", { class: "check", for: "set-sync" }, syncBox, " Keep my settings with my profile, sealed, so they follow me to other devices"),
    el(
      "p",
      { class: "small" },
      "Off, everything stays in this browser, as it always has. On, a copy is kept on your relays in one note that only your own key can open: your volumes, the size of your text, how you move, whether you fill the screen, how fast the view turns and how wide you see, your saved doors, the lists you follow, your hashtags, your home, your look, your room and who you have blocked. A world never reads it. This browser's own copy is still the one that is used, so nothing waits on a relay.",
    ),
    el(
      "p",
      { class: "small" },
      "Never kept there: where you have been and which sites you have checked (a new device is shown the Airlock once), whether your microphone may travel, your computers, the worlds you are building, and your own music. A relay can see that you use BitPortal and when you last changed something, and nothing else.",
    ),
    syncStatus,
    syncForget,
    el("h3", {}, "Ranking"),
    el("label", { class: "check", for: "set-ranking" }, rankBox, " Rank shelves with BitFeed and say why each world is there"),
    el("p", { class: "small" }, "Off shows one list in date order, with no ranking code loaded."),
    el("h3", {}, "Relays"),
    el("label", { for: "set-relays" }, "Where BitPortal looks for announcements, one address per line"),
    relays,
    el("h3", {}, "Your room"),
    el("label", { for: "set-room" }, "The walk-in room's furniture, as a home layout. Leave empty for BitPortal's own."),
    roomBox,
    el("p", { class: "small" }, "This is the same home.json a world made from the NSWP world template uses. The room takes its colours, plants, lamps, benches, tables, plinths and notes. It doesn't draw pictures or portals: your doors are the wall in front of you. Kept on this device."),
    roomNote,
    el("h3", {}, "Your hashtags"),
    hashtagRows,
    el("p", { class: "small" }, "Worlds say what they are about with hashtags. Pick one under the search box, or on a world's page, and choose More or Less. Worlds with a hashtag you like come first and get a shelf of their own; ones you don't sink. It orders what this copy already shows, and is kept on this device."),
    el("h3", {}, "People you've blocked everywhere"),
    blockedRows,
    el(
      "p",
      { class: "small" },
      "Blocking someone in a world keeps you apart in that world. When you leave it, the Airlock asks whether to block them everywhere you go: say yes, and they are on this list. It is kept in this browser. Each world you arrive in is told the keys on it, so that it can keep you apart: that is what a block that travels costs. Only people who go by a name can be on it. A guest is a new person every visit, and no list can follow one.",
    ),
    el("h3", {}, "Where you start"),
    homeNow,
    el("label", { for: "set-home" }, "A world of your own to start in"),
    homeAddress,
    el("p", { class: "small" }, "It has to be shown to be yours: announced with your key, at a site that admits your key, and saying it can be a home. Your doors, your sign-in and your computers stay here in BitPortal, and your home has a way to them. If your home ever doesn't answer, you start in BitPortal's room."),
    el("p", { class: "small" }, "Two things make a world yours. Its site admits the key you sign in with: in a world from the NSWP template, that is your npub as \"owner\" in world.json. And you announce its address with that key, on ", el("a", { href: "/publish/" }, "Announce a world"), "."),
    homeChecks,
    el("div", { class: "actions" }, homeCheck, homeUse),
    el("div", { class: "actions" }, cancel, save),
  );
  form.addEventListener("submit", (e) => {
    const kept = saveRoomText(roomBox.value);
    if ("error" in kept) {
      e.preventDefault(); // keep the dialog open so the reason can be read
      roomNote.textContent = kept.error;
      roomNote.className = "small verify-warn";
      return;
    }
    const cleaned = cleanRelays(relays.value.split(/\s+/));
    settings = { ...settings, ranking: rankBox.checked, relays: cleaned.length ? cleaned : settings.relays, airlock: airlockBox.checked ? "known" : "ask" };
    saveSettings(settings);
    storePrefs({ full: fullBox.checked, intense: intenseBox.checked, look: Number(lookPick.value) || 1, fov: fovPick.value ? Number(fovPick.value) : null, pictures: picturesBox.checked, chat: chatBox.checked }, localStorage);
    void refresh();
  });
  dialog.replaceChildren(form);
  dialog.showModal();
}

// --------------------------------------------------------------- lists
/** Put a change to the visitor's lists on the page, and say whether this browser is keeping it. */
function keepFollowed(next: FollowedList[]): boolean {
  followed = next;
  const kept = storeFollowed(followed);
  catalog = makeCatalog();
  void rank().then(() => {
    draw();
    hero?.refresh();
  });
  return kept;
}

/**
 * Your lists: what fills the lobby, and the way to follow someone else's.
 * `address` is a list to look up straight away, from a link someone shared.
 */
/** On a copy that shows only its operator's lists: which they are. There is nothing to follow, so there is nothing to choose. */
function openOperatorLists(): void {
  const dialog = $<HTMLDialogElement>("settings");
  dialog.setAttribute("aria-label", "The lists here");
  const close = el("button", { class: "button", type: "button" }, "Close");
  close.addEventListener("click", () => dialog.close());
  dialog.replaceChildren(
    el("h2", {}, "The lists here"),
    el("p", { class: "lede" }, "This copy of BitPortal shows only worlds on lists signed by whoever runs it, and no world that is for adults."),
    el(
      "ul",
      { class: "list-rows" },
      ...catalog.lists.map((l) => el("li", {}, el("p", { class: "list-title" }, l.title), el("p", { class: "small" }, `Signed by ${label(l.pubkey, { key: true })}. ${count(l.ids.length, "world")}, last changed ${new Date(l.updatedAt * 1000).toLocaleDateString()}.`), l.description ? el("p", { class: "small" }, l.description) : "")),
    ),
    el("p", { class: "small" }, followed.length ? `You follow ${count(followed.length, "list")} of other people's. They are kept on this device and not shown on this copy.` : "Following other people's lists is switched off on this copy."),
    el("div", { class: "actions" }, close),
  );
  dialog.showModal();
}

function openLists(address = ""): void {
  if (catalog.policy.allowListOnly) return openOperatorLists();
  const dialog = $<HTMLDialogElement>("settings");
  dialog.setAttribute("aria-label", "Your lists");
  const rows = el("ul", { class: "list-rows" });
  const note = el("p", { class: "small", role: "status" });
  const drawRows = () => {
    const starterOn = settings.showStarter;
    const c = catalog.curator;
    const row = (title: string, meta: string, description: string, ...buttons: HTMLElement[]) =>
      el("li", {}, el("p", { class: "list-title" }, el("strong", {}, title)), el("p", { class: "small" }, meta), description ? el("p", { class: "small" }, description) : null, el("p", { class: "list-actions" }, ...buttons));
    const copy = (naddr: string) => {
      const b = el("button", { class: "link", type: "button" }, "Copy its address");
      b.addEventListener("click", () => {
        void navigator.clipboard?.writeText(naddr).then(
          () => (note.textContent = "Copied. Anyone can follow the list with that address."),
          () => (note.textContent = naddr),
        );
      });
      return b;
    };
    const toggle = el("button", { class: "link", type: "button", id: "toggle-starter" }, starterOn ? "Put it away" : "Show it again");
    toggle.addEventListener("click", () => {
      settings = { ...settings, showStarter: !starterOn };
      saveSettings(settings);
      keepFollowed(followed);
      note.textContent = starterOn ? "Put away. Its worlds are no longer on your shelves." : "Showing again.";
      drawRows();
    });
    const starterView = catalog.lists.find((l) => l.starter);
    rows.replaceChildren(
      row(
        c.title,
        `BitPortal's own list, signed by ${label(c.pubkey, { key: true })}. ${starterOn ? `${count(starterView?.ids.length ?? 0, "world")}, last changed ${new Date(c.updatedAt * 1000).toLocaleDateString()}.` : "Put away."}`,
        c.description,
        toggle,
        copy(encodeNaddr({ kind: CURATION_SET_KIND, pubkey: c.pubkey, identifier: bundle.set.tags.find((t) => t[0] === "d")?.[1] ?? "", relays: settings.relays.slice(0, 2) })),
      ),
      ...followed.map((f) => {
        const view = catalog.lists.find((l) => l.id === f.id);
        const stop = el("button", { class: "link", type: "button" }, "Stop following");
        stop.addEventListener("click", () => {
          keepFollowed(unfollow(followed, f.id));
          note.textContent = `You've stopped following ${view?.title ?? "that list"}.`;
          drawRows();
        });
        const [, pubkey = "", ...d] = f.id.split(":");
        return row(
          view?.title ?? f.id,
          `Signed by ${label(pubkey, { key: true })}. ${count(view?.ids.length ?? 0, "world")}${view?.missing ? `, ${view.missing} more not found on your relays` : ""}, last changed ${new Date((view?.updatedAt ?? 0) * 1000).toLocaleDateString()}.`,
          view?.description ?? "",
          stop,
          copy(encodeNaddr({ kind: CURATION_SET_KIND, pubkey, identifier: d.join(":"), relays: settings.relays.slice(0, 2) })),
        );
      }),
    );
  };
  drawRows();

  // Following someone else's list.
  const input = el("input", { type: "text", id: "list-address", spellcheck: "false", autocomplete: "off", placeholder: "naddr1…" });
  input.value = address;
  const look = el("button", { class: "button", type: "submit" }, "Find it");
  const found = el("div", { class: "list-found" });
  const status = el("p", { class: "small", role: "status" });
  const lookUp = async () => {
    found.replaceChildren();
    const read = readListAddress(input.value);
    if ("error" in read) {
      status.textContent = read.error;
      status.className = "small verify-warn";
      return;
    }
    status.className = "small";
    status.textContent = "Asking your relays for it.";
    look.disabled = true;
    const hit = await findList(read.address, settings.relays).catch(() => null);
    look.disabled = false;
    if (!hit || !hit.list.coordinate || !hit.list.pubkey) {
      status.textContent = "None of your relays has that list. Its curator may have published it somewhere else.";
      status.className = "small verify-warn";
      return;
    }
    const id = hit.list.coordinate;
    status.textContent = "";
    const add = el("button", { class: "button primary", type: "button", id: "follow-list" }, isFollowed(followed, id) ? "Following" : "Follow this list");
    add.disabled = isFollowed(followed, id) || id.startsWith(`${CURATION_SET_KIND}:${catalog.curator.pubkey}:`);
    add.addEventListener("click", () => {
      const next = follow(followed, hit.event, hit.worlds, Math.floor(Date.now() / 1000));
      if (next === followed) {
        status.textContent = `You can follow ${FOLLOW_LIMIT} lists. Stop following one to add another.`;
        status.className = "small verify-warn";
        return;
      }
      const kept = keepFollowed(next);
      found.replaceChildren();
      input.value = "";
      note.textContent = kept ? `You're following ${hit.list.title}. It has a shelf of its own now.` : `You're following ${hit.list.title}, but this browser isn't keeping it (a private window?), so it lasts until you leave the page.`;
      drawRows();
    });
    found.replaceChildren(
      el("p", { class: "list-title" }, el("strong", {}, hit.list.title)),
      el("p", {}, hit.list.description || "Its curator hasn't described it."),
      el("p", { class: "small" }, "Signed by ", el("span", { class: "key" }, hit.list.pubkey), `. It names ${count(hit.list.worlds.length, "world")}; your relays have ${hit.worlds.length === hit.list.worlds.length ? "all of them" : `${hit.worlds.length} of them`}.`),
      el("p", { class: "small" }, "Following it puts its worlds on a shelf here. It doesn't vouch for them: each door still says for itself whether its site is verified."),
      el("p", { class: "list-actions" }, add),
    );
  };
  const form = el("form", { class: "row" }, input, look);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void lookUp();
  });

  const unlistedBox = el("input", { type: "checkbox", id: "set-unlisted" });
  unlistedBox.checked = settings.showUnlisted;
  unlistedBox.addEventListener("change", () => setShowUnlisted(unlistedBox.checked));
  const close = el("button", { class: "button", type: "button" }, "Close");
  close.addEventListener("click", () => dialog.close());

  dialog.replaceChildren(
    el("h2", {}, "Your lists"),
    el("p", {}, "A list is someone's signed choice of worlds. Each list you follow has a shelf here."),
    el("p", { class: "small" }, "Which lists you follow is kept on this device. Following one tells nobody, its curator included."),
    rows,
    note,
    el("h3", {}, "Follow a list"),
    el("label", { for: "list-address" }, "A list's address. Whoever made the list can give it to you."),
    form,
    status,
    found,
    el("h3", {}, "Worlds nobody has listed"),
    el("label", { class: "check", for: "set-unlisted" }, unlistedBox, " Show worlds that have announced themselves and aren't on any of your lists"),
    el("p", { class: "small" }, "They have a shelf of their own, marked unreviewed. Anyone can publish an announcement, so one key shows three there at most."),
    el("h3", {}, "Make a list"),
    el(
      "p",
      { class: "small" },
      "A list is a signed note, and anyone can publish one. BitPortal can't make one for you yet. The nswp tool can: see ",
      el("a", { href: "https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/08-lists.md", rel: "noopener" }, "how worlds are found"),
      ".",
    ),
    el("div", { class: "actions" }, close),
  );
  dialog.showModal();
  if (address) void lookUp();
}

// --------------------------------------------------------------- relays
/** Coming back from a world: the door the visitor left through is in front of them. Once per page. */
let facedLeft = false;
function faceLeftDoor(): void {
  if (facedLeft) return;
  facedLeft = true;
  const left = readLeft();
  if (left?.from !== "list") return;
  const back = [...document.querySelectorAll<HTMLElement>("[data-door]")].find((li) => li.dataset.door === left.id);
  back?.scrollIntoView({ block: "center" });
  back?.querySelector("button")?.focus({ preventScroll: true });
}

async function refresh(): Promise<void> {
  await rank();
  draw();
  faceLeftDoor();
  // The operators' keys are asked about too: their lists are what this copy shows.
  const listed = [...catalog.allowed].map((id) => id.split(":")[1] ?? "").filter(Boolean);
  const authors = [...new Set([catalog.curator.pubkey, ...INSTANCE.operators, ...listed, ...followedAuthors(followed), ...catalog.entries.map((e) => e.event.pubkey), ...saved.map((s) => s.event.pubkey)])].slice(0, 400);
  // Two questions, both to relays and to nobody else: what do the keys on the
  // visitor's lists say now, and who else has announced a world?
  const [known, loose] = await Promise.all([
    queryRelays(settings.relays, { kinds: [WORLD_KIND, CURATION_SET_KIND], authors, limit: 400 }, 4000),
    queryRelays(settings.relays, { kinds: [WORLD_KIND], limit: 200 }, 4000),
  ]);
  const fresher = refreshSaved(saved, known.events);
  if (fresher !== saved) {
    saved = fresher;
    storeSaved(saved);
  }
  const fresherLists = refreshFollowed(followed, known.events);
  if (fresherLists !== followed) {
    followed = fresherLists;
    storeFollowed(followed);
  }
  const answered = Object.values(known.relays).filter((s) => s === "eose").length;
  relayNote = `${answered} of ${Object.keys(known.relays).length} relays answered`;
  const shown = () => JSON.stringify([catalog.lists.map((l) => [l.id, l.updatedAt, l.ids]), catalog.entries.map((e) => e.event.id), catalog.unlisted.map((e) => e.id)]);
  const before = shown();
  relayEvents = [...known.events, ...loose.events];
  catalog = makeCatalog();
  storeOperatorLists(catalog.operatorLists);
  if (before !== shown()) {
    await rank();
    hero?.refresh();
  }
  draw();
  // What people thought of these places, after they are on screen: asked of relays by world, never by person.
  void (async () => {
    const curators = [...new Set([catalog.curator.pubkey, ...INSTANCE.operators, ...catalog.lists.map((l) => l.pubkey)])];
    const worlds = catalog.entries.map((e) => ({ id: e.id, url: e.world.url }));
    const events = await fetchRatings(settings.relays, worlds.map((w) => w.id), curators).catch(() => []);
    const follows = signedIn ? await followsOf(signedIn.pubkey, settings.relays) : [];
    const next = talliesFor(events, worlds, countedFor(curators, follows), signedIn?.pubkey ?? null);
    if (next.size === 0 && tallies.size === 0) return;
    tallies = next;
    draw();
  })();
}

/**
 * Put the room at the top of the page. It draws the doors the list already
 * has, from the same bundled data and the same mirror, so it contacts nothing
 * the list doesn't (spec §5.7). It is skipped for anyone who has asked their
 * browser to save data.
 */
async function startHero(): Promise<void> {
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
  const stage = $("hero-stage");
  const target = $("hero-target");
  try {
    const { mountHero } = await import("./hero.js");
    hero = mountHero(stage, {
      accent: "#3df2a0",
      entries: () => {
        const hidden = optedOut();
        return catalog.entries.filter((e) => !hidden.has(e.id));
      },
      chosen: (e) => e.rank !== null || isSaved(saved, e.id),
      onPoint: (e) => {
        if (!e) return void (target.textContent = "");
        const host = hostParts(e.world.url);
        target.textContent = `${e.world.title}, at ${host.prefix}${host.domain}`;
      },
      onOpen: (e) => openDetail(e, ""),
    });
    if (hero) stage.classList.add("live");
  } catch {
    /* the drawn grid stays */
  }
}

async function start(): Promise<void> {
  $("open-settings").addEventListener("click", openSettings);
  const q = $<HTMLInputElement>("find-q");
  q.addEventListener("input", () => {
    find.query = q.value;
    drawShelves();
  });
  $("find").addEventListener("submit", (e) => e.preventDefault());
  $("open-lists-2").addEventListener("click", () => openLists());
  attachJumpList($<HTMLButtonElement>("jump-button"), { relays: () => settings.relays, from: "list" });
  // Walking in from the page moves into the room first, then goes there.
  $<HTMLAnchorElement>("walk-in").addEventListener("click", (e) => {
    if (!hero || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    void hero.enter().then(() => location.assign("/walk/"));
  });
  void startHero();
  draw(); // the bundled set, at once
  // Who is signed in, read from BitLogin's small public record (no widget loaded here).
  // Settings kept with the visitor's profile: this page has already started from what the browser keeps. If the
  // profile had something newer, it is in the browser now; a visitor who hasn't touched anything yet is shown it at
  // once, and anyone else is told, and it is used from their next page.
  let touched = false;
  for (const type of ["pointerdown", "keydown"] as const) addEventListener(type, () => (touched = true), { once: true, capture: true });
  addEventListener("bitportal:synced", (e) => {
    const took = ((e as CustomEvent).detail as { took?: string[] } | undefined)?.took ?? [];
    if (!took.length) return;
    if (!touched && performance.now() < 15000) return location.reload();
    const note = el("p", { class: "small sync-note", role: "status" }, "Settings from your profile have arrived. ", el("a", { href: location.pathname }, "Use them now"), ", or carry on: they are used from your next page.");
    document.querySelector("main")?.prepend(note);
  });
  // Names this page was drawn without have arrived: it is drawn again with them.
  addEventListener(PROFILES_EVENT, () => draw());
  void readSignedIn().then((who) => {
    signedIn = who;
    startSync();
    if (!who) return;
    const link = $("account-link");
    // By the name they chose for themselves, with their picture: never a string of hex.
    const sayWho = () => {
      link.replaceChildren(profileOf(who.pubkey)?.name || who.name || label(who.pubkey));
      void pictureOf(who.pubkey).then((picture) => picture && link.prepend(picture));
    };
    sayWho();
    addEventListener(PROFILES_EVENT, sayWho);
    wantProfiles([who.pubkey], () => settings.relays);
    link.title = "Your identity";
    // Whoever runs this copy is shown what is waiting for them, which nobody else here is.
    if (isOperator(who.pubkey)) {
      operatorKey = who.pubkey;
      catalog = makeCatalog();
      void rank().then(draw);
    }
    draw();
  });
  try {
    device = { ...device, vr: navigator.xr ? await navigator.xr.isSessionSupported("immersive-vr") : false };
  } catch {
    /* stays false */
  }
  // A link someone shared to a list: look it up and ask, rather than follow it unasked.
  const shared = new URLSearchParams(location.search).get("list");
  if (shared) {
    history.replaceState(null, "", location.pathname + location.hash);
    openLists(shared);
  }
  await refresh();
}

void start();
