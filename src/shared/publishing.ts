/**
 * The pure parts of publishing a world (NSWP spec §20, Phase 2): turning a
 * form into an announcement, writing the manifest a creator must host, and
 * choosing where to publish.
 */
import { buildWorldEvent, checkDestination, getTags, SCHEMAS, WELL_KNOWN_PATH, type EventTemplate, type Manifest, type NostrEvent, type World, type WorldInput } from "@nswp/core";

export interface WorldForm {
  url: string;
  id: string;
  title: string;
  summary: string;
  modes: string[];
  locomotion: string;
  intensity: string;
  seated: string;
  perf: string;
  topics: string;
  /** Who the world is for: "kids", "general" or "adult". "" until its maker says. */
  audience: string;
  status: string;
  rooms: boolean;
}

export interface FormIssue {
  field: keyof WorldForm;
  message: string;
}

/** A stable, readable world ID from a title: lowercase words joined by hyphens. */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function validateForm(f: WorldForm): FormIssue[] {
  const issues: FormIssue[] = [];
  const dest = checkDestination(f.url);
  if (!dest.ok) issues.push({ field: "url", message: dest.error.message });
  if (!f.title.trim()) issues.push({ field: "title", message: "Give the world a name." });
  if (f.title.length > 120) issues.push({ field: "title", message: "Keep the name under 120 characters." });
  if (!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(f.id)) issues.push({ field: "id", message: "The ID needs 2 to 64 lowercase letters, digits, dots, hyphens or underscores." });
  if (f.summary.length > 200) issues.push({ field: "summary", message: "Keep the one-line description under 200 characters." });
  if (f.modes.length === 0) issues.push({ field: "modes", message: "Tick at least one way the world can be viewed." });
  // Asked of every maker, and never guessed: a site that keeps adult worlds out reads this.
  if (!["kids", "general", "adult"].includes(f.audience)) issues.push({ field: "audience", message: "Say who the world is for." });
  return issues;
}

export function formToInput(f: WorldForm, createdAt: number): WorldInput {
  const dest = checkDestination(f.url);
  if (!dest.ok) throw new Error(dest.error.message);
  const comfort: WorldInput["comfort"] = {};
  if (f.locomotion) comfort.locomotion = f.locomotion;
  if (f.intensity) comfort.intensity = f.intensity;
  if (f.seated) comfort.seated = f.seated;
  const topics = [...new Set(f.topics.split(/[,\s]+/).map((t) => t.replace(/^#/, "").toLowerCase()).filter(Boolean))].slice(0, 8);
  const input: WorldInput = {
    d: f.id,
    title: f.title.trim(),
    url: dest.value.url,
    modes: f.modes,
    capabilities: ["webxr", ...(f.rooms ? ["rooms"] : [])],
    comfort,
    topics,
    languages: [],
    createdAt,
  };
  if (f.summary.trim()) {
    input.summary = f.summary.trim();
    input.description = f.summary.trim();
  }
  if (f.audience === "kids" || f.audience === "general" || f.audience === "adult") input.audience = f.audience;
  if (f.perf) input.perf = f.perf;
  if (f.status && f.status !== "live") input.status = f.status;
  return input;
}

export function formToEvent(f: WorldForm, createdAt: number): EventTemplate {
  return buildWorldEvent(formToInput(f, createdAt));
}

/** Fill the form from an announcement the visitor published before. */
export function worldToForm(w: World): WorldForm {
  return {
    url: w.url,
    id: w.d,
    title: w.title,
    summary: w.summary ?? "",
    modes: w.modes,
    locomotion: w.comfort.locomotion ?? "",
    intensity: w.comfort.intensity ?? "",
    seated: w.comfort.seated ?? "",
    perf: w.perf ?? "",
    topics: w.topics.join(", "),
    audience: w.audience ?? "",
    status: w.status,
    rooms: w.capabilities.includes("rooms"),
  };
}

/**
 * The manifest a creator hosts so their announcement shows as verified
 * (spec §7). Keeps everything an existing manifest already says and adds
 * this publisher and world.
 */
export function manifestFor(pubkey: string, f: WorldForm, existing: Manifest | null, relays: string[]): Record<string, unknown> {
  const dest = checkDestination(f.url);
  const url = dest.ok ? dest.value.url : f.url;
  const publishers: Record<string, { worlds: string[] }> = {};
  for (const [pk, v] of Object.entries(existing?.publishers ?? {})) publishers[pk] = { worlds: [...v.worlds] };
  const mine = publishers[pubkey] ?? { worlds: [] };
  if (!mine.worlds.includes(f.id)) mine.worlds.push(f.id);
  publishers[pubkey] = mine;
  const worlds: Record<string, unknown> = {};
  for (const [id, w] of Object.entries(existing?.worlds ?? {})) {
    worlds[id] = { entry: { url: w.entry.url, modes: w.entry.modes }, ...(w.entryPoints.length ? { entry_points: w.entryPoints } : {}), ...(w.capabilities.length ? { capabilities: w.capabilities } : {}) };
  }
  worlds[f.id] = { ...(worlds[f.id] as object | undefined), entry: { url, modes: f.modes }, capabilities: ["webxr", ...(f.rooms ? ["rooms"] : [])] };
  return {
    schema: SCHEMAS.manifest,
    listing: existing?.listing ?? "allow",
    publishers,
    worlds,
    relays: existing?.relays.length ? existing.relays : relays.slice(0, 4),
  };
}

export function manifestLocation(url: string): string {
  const dest = checkDestination(url);
  return dest.ok ? `${dest.value.origin}${WELL_KNOWN_PATH}` : WELL_KNOWN_PATH;
}

/**
 * Where to publish: the visitor's own write relays from their NIP-65 list
 * (kind 10002), newest list wins. Falls back to BitPortal's relays.
 */
export function writeRelays(relayLists: NostrEvent[], pubkey: string, fallback: string[]): { relays: string[]; fromOwnList: boolean } {
  const latest = relayLists.filter((e) => e.kind === 10002 && e.pubkey === pubkey).sort((a, b) => b.created_at - a.created_at)[0];
  const own: string[] = [];
  for (const t of latest ? getTags(latest, "r") : []) {
    if (!t[1] || (t[2] && t[2] !== "write")) continue;
    try {
      const u = new URL(t[1]);
      const clean = u.href.replace(/\/$/, "");
      if (u.protocol === "wss:" && !own.includes(clean)) own.push(clean);
    } catch {
      /* skip malformed entries */
    }
  }
  return own.length ? { relays: own.slice(0, 6), fromOwnList: true } : { relays: fallback.slice(0, 6), fromOwnList: false };
}
