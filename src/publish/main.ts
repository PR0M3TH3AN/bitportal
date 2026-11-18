/**
 * Announce a world (NSWP spec §20, Phase 2).
 *
 * Checking a site and filling the form need no account. Publishing needs a
 * signer, which comes from BitLogin and is handed to this page's code
 * explicitly. Nothing is published until the visitor presses the button.
 *
 * Test aid: `?signer=test` signs with a throwaway key and never publishes.
 */
import {
  buildAirlockUrl,
  encodeNaddr,
  fetchManifest,
  finalizeEvent,
  getPublicKey,
  latestAddressable,
  parseWorldEvent,
  publishEvent,
  queryRelays,
  verifyOrigin,
  WORLD_KIND,
  type Manifest,
  type NostrEvent,
} from "@nswp/core";
import { formToEvent, manifestFor, manifestLocation, slugify, validateForm, worldToForm, writeRelays, type WorldForm } from "../shared/publishing.js";
import { checkedSigner, shortKey, watchBitLogin, type Session } from "../shared/session.js";
import { attachJumpList } from "../shared/jump.js";
import { loadSettings } from "../shared/settings.js";
import { VERSION } from "../shared/version.js";

declare global {
  interface Window {
    bitportal?: { version: string };
  }
}
window.bitportal = { version: VERSION };

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const settings = loadSettings();
attachJumpList($<HTMLButtonElement>("jump-button"), { relays: () => settings.relays, from: "list" });
const dryRun = new URLSearchParams(location.search).get("signer") === "test";

const form = $<HTMLFormElement>("form");
const who = $("who");
const identity = $<HTMLDetailsElement>("identity");
const checkButton = $<HTMLButtonElement>("check");
const checkResult = $("check-result");
const publishButton = $<HTMLButtonElement>("publish");
const publishResult = $("publish-result");
const issuesBox = $("form-issues");
const relayNote = $("relay-note");
const manifestBox = $("manifest-box");
const manifestIntro = $("manifest-intro");

let session: Session | null = null;
let manifest: Manifest | null = null;
let manifestUrl = "";
let checkedOrigin = "";
let targets: { relays: string[]; fromOwnList: boolean } = { relays: settings.relays, fromOwnList: false };
let idTouched = false;

type Child = Node | string | null | false | undefined;
function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  for (const c of children) if (c !== null && c !== false && c !== undefined) e.append(c);
  return e;
}
const line = (kind: "ok" | "warn" | "bad" | "", ...children: Child[]) => el("p", kind ? { class: `verify verify-${kind}` } : { class: "verify" }, ...children);

function readForm(): WorldForm {
  const data = new FormData(form);
  const text = (k: string) => String(data.get(k) ?? "").trim();
  return {
    url: text("url"),
    id: text("id"),
    title: text("title"),
    summary: text("summary"),
    modes: data.getAll("modes").map(String),
    locomotion: text("locomotion"),
    intensity: text("intensity"),
    seated: text("seated"),
    perf: text("perf"),
    topics: text("topics"),
    status: text("status") || "live",
    rooms: data.get("rooms") !== null,
  };
}

function fillForm(f: WorldForm): void {
  const set = (name: string, value: string) => {
    const input = form.elements.namedItem(name);
    if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) input.value = value;
  };
  for (const k of ["url", "id", "title", "summary", "locomotion", "intensity", "seated", "perf", "topics", "status"] as const) set(k, f[k]);
  for (const box of form.querySelectorAll<HTMLInputElement>('input[name="modes"]')) box.checked = f.modes.includes(box.value);
  $<HTMLInputElement>("f-rooms").checked = f.rooms;
  idTouched = true;
}

/** Redraw everything that depends on the form, the session or the last check. */
function refresh(): void {
  const f = readForm();
  who.replaceChildren();
  if (session) {
    who.append("Announcing as ", el("span", { class: "key", title: session.pubkey }, shortKey(session.pubkey)), dryRun ? " (a test key: nothing will be published)." : ".");
  } else who.textContent = "You're signed out. You can check a site and fill this in first, then sign in to publish.";

  // The manifest the creator needs to host, once we know who they are and where.
  const sameSite = !!checkedOrigin && f.url.startsWith(checkedOrigin);
  if (session && f.url && f.id) {
    manifestBox.hidden = false;
    $("manifest-path").textContent = manifestLocation(f.url);
    $("manifest-json").textContent = JSON.stringify(manifestFor(session.pubkey, f, sameSite ? manifest : null, targets.relays), null, 2);
    const listed = sameSite && !!manifest?.publishers[session.pubkey]?.worlds.includes(f.id);
    manifestIntro.textContent = listed
      ? "Your site already lists your key for this world. If its entry address matches, the announcement will show as verified."
      : "Your site doesn't list your key for this world yet. Host this file to be shown as verified.";
  } else {
    manifestBox.hidden = true;
    manifestIntro.textContent = "Sign in and enter your address to see the file your site needs to host.";
  }

  relayNote.textContent = session
    ? `${dryRun ? "Would publish" : "Publishes"} to ${targets.relays.map((r) => r.replace("wss://", "")).join(", ")} (${targets.fromOwnList ? "your own write relays" : "BitPortal's relays, because you have no relay list"}).`
    : "";
  publishButton.disabled = !session;
  publishButton.textContent = dryRun ? "Sign (test run, nothing is published)" : "Sign and publish";
}

// ------------------------------------------------------------- identity
async function onSession(next: Session | null): Promise<void> {
  session = next;
  identity.open = !next;
  targets = { relays: settings.relays, fromOwnList: false };
  refresh();
  if (!next || dryRun) return;
  // Where this person publishes: their own relay list, if they have one.
  const lists = await queryRelays(settings.relays, { kinds: [10002], authors: [next.pubkey], limit: 4 }, 4000);
  if (session?.pubkey !== next.pubkey) return;
  targets = writeRelays(lists.events, next.pubkey, settings.relays);
  refresh();
}

if (dryRun) {
  const key = crypto.getRandomValues(new Uint8Array(32));
  const pubkey = getPublicKey(key);
  void onSession({ pubkey, method: "test", signer: checkedSigner(pubkey, { signEvent: async (t) => finalizeEvent(t, key) }) });
} else {
  let settled = false;
  watchBitLogin($("bitlogin"), (s, error) => {
    settled = true;
    void onSession(s);
    if (error) who.textContent = `${error.message} Try signing in again.`;
  });
  setTimeout(() => {
    if (!settled) {
      identity.open = true;
      refresh();
    }
  }, 2500);
}

// ---------------------------------------------------------- check a site
checkButton.addEventListener("click", async () => {
  const f = readForm();
  const urlIssue = validateForm(f).find((i) => i.field === "url");
  checkResult.replaceChildren();
  if (urlIssue) {
    checkResult.append(line("bad", urlIssue.message));
    return;
  }
  checkButton.disabled = true;
  checkResult.append(line("", "Checking the site."));
  try {
    const origin = new URL(f.url).origin;
    const m = await fetchManifest(f.url);
    manifest = m.manifest ?? null;
    manifestUrl = m.url;
    checkedOrigin = origin;
    checkResult.replaceChildren();
    if (m.manifest) {
      const worlds = Object.keys(m.manifest.worlds);
      checkResult.append(line("ok", `Found a manifest listing ${worlds.length} world${worlds.length === 1 ? "" : "s"}${worlds.length ? `: ${worlds.join(", ")}` : ""}.`));
      if (session && !m.manifest.publishers[session.pubkey]) checkResult.append(line("warn", "It doesn't list your key. Add it with the file below to be shown as verified."));
      if (m.manifest.listing === "deny") checkResult.append(line("warn", "It asks not to be listed by third parties. Your own announcement is unaffected."));
    } else {
      const notFound = m.issues.every((i) => i.code === "manifest_not_found");
      checkResult.append(
        line(
          "warn",
          notFound
            ? "This site has no manifest yet. You can still announce it; it will show as listed, not verified."
            : `The manifest couldn't be read: ${m.issues.map((i) => i.message).join(" ")}`,
        ),
      );
    }
    for (const w of m.warnings) checkResult.append(line("warn", w.message));

    // An earlier announcement of this address by this person: start from it.
    if (session && !dryRun) {
      const mine = await queryRelays(targets.relays, { kinds: [WORLD_KIND], authors: [session.pubkey], "#r": [new URL(f.url).href] }, 4000);
      const latest = latestAddressable(mine.events)[0];
      const parsed = latest ? parseWorldEvent(latest) : null;
      if (parsed?.ok) {
        fillForm(worldToForm(parsed.value));
        checkResult.append(line("", "You've announced this address before. The form now shows that announcement; publishing replaces it."));
      }
    }
  } finally {
    checkButton.disabled = false;
    refresh();
  }
});

// ------------------------------------------------------------- the form
$<HTMLInputElement>("f-id").addEventListener("input", () => (idTouched = true));
$<HTMLInputElement>("f-title").addEventListener("input", (e) => {
  if (!idTouched) $<HTMLInputElement>("f-id").value = slugify((e.target as HTMLInputElement).value);
});
form.addEventListener("input", refresh);
form.addEventListener("change", refresh);

$("copy-manifest").addEventListener("click", async () => {
  const button = $<HTMLButtonElement>("copy-manifest");
  try {
    await navigator.clipboard.writeText($("manifest-json").textContent ?? "");
    button.textContent = "Copied";
  } catch {
    button.textContent = "Select the text above and copy it";
  }
  setTimeout(() => (button.textContent = "Copy the file's contents"), 2500);
});

// -------------------------------------------------------------- publish
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  publishResult.replaceChildren();
  const f = readForm();
  const issues = validateForm(f);
  issuesBox.hidden = issues.length === 0;
  issuesBox.replaceChildren(...issues.map((i) => el("li", {}, i.message)));
  if (issues.length || !session) return;

  publishButton.disabled = true;
  try {
    let signed: NostrEvent;
    try {
      signed = await session.signer.signEvent(formToEvent(f, Math.floor(Date.now() / 1000)));
    } catch (err) {
      publishResult.append(line("bad", `Signing didn't complete: ${err instanceof Error ? err.message : "the signer refused"}`));
      return;
    }
    const parsed = parseWorldEvent(signed, { requireSigned: true });
    if (!parsed.ok) {
      publishResult.append(line("bad", `The announcement is invalid: ${parsed.errors.map((x) => x.message).join(" ")}`));
      return;
    }
    const verified = !!manifest && f.url.startsWith(checkedOrigin) && verifyOrigin(parsed.value, manifest, manifestUrl).verified;
    const naddr = encodeNaddr({ kind: WORLD_KIND, pubkey: signed.pubkey, identifier: parsed.value.d, relays: targets.relays.slice(0, 2) });

    if (dryRun) {
      publishResult.append(
        line("ok", "Test run: the announcement was signed and is valid. Nothing was published."),
        line(verified ? "ok" : "warn", verified ? "It would show as verified for this site." : "It would show as listed, not verified."),
        el("pre", { class: "code", tabindex: "0" }, JSON.stringify(signed, null, 2)),
      );
      return;
    }

    const sent = await publishEvent(targets.relays, signed);
    const accepted = Object.entries(sent.relays).filter(([, s]) => s === "ok");
    const refused = Object.entries(sent.relays).filter(([, s]) => s !== "ok");
    if (accepted.length === 0) {
      publishResult.append(line("bad", `No relay accepted the announcement. ${refused.map(([r, s]) => `${r.replace("wss://", "")}: ${s}`).join("; ")}`));
      return;
    }
    publishResult.append(line("ok", `Published to ${accepted.length} of ${Object.keys(sent.relays).length} relays.`));
    if (refused.length) publishResult.append(line("warn", `Not accepted by ${refused.map(([r, s]) => `${r.replace("wss://", "")} (${s})`).join(", ")}.`));
    publishResult.append(
      line(verified ? "ok" : "warn", verified ? "It shows as verified for this site." : "It shows as listed, not verified, until your site hosts the file above."),
      el("p", {}, el("a", { class: "button", href: buildAirlockUrl(new URL("/go/", location.origin).href, { naddr, url: parsed.value.url }) }, "See it in the Airlock")),
      el("p", { class: "small" }, "Share this address so others can find it: ", el("span", { class: "key" }, naddr)),
    );
  } finally {
    publishButton.disabled = !session;
  }
});

refresh();
