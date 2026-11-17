/** Per-browser preferences. They never leave this device. */
import { DEFAULT_RELAYS } from "@nswp/core";

export interface Settings {
  /** Use BitFeed ranking. Off = the plain, no-BitBlocks list. */
  ranking: boolean;
  relays: string[];
  /** Also show worlds found on relays that the starter set doesn't include. */
  showUnlisted: boolean;
}

const KEY = "bitportal:settings";
export const DEFAULTS: Settings = { ranking: true, relays: DEFAULT_RELAYS, showUnlisted: false };

export function cleanRelays(input: string[]): string[] {
  const out: string[] = [];
  for (const raw of input) {
    try {
      const u = new URL(raw.trim());
      if (u.protocol === "wss:" && !out.includes(u.href.replace(/\/$/, ""))) out.push(u.href.replace(/\/$/, ""));
    } catch {
      /* skip anything that isn't a URL */
    }
  }
  return out.slice(0, 8);
}

export function loadSettings(search = location.search): Settings {
  let saved: Partial<Settings> = {};
  try {
    saved = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Partial<Settings>;
  } catch {
    /* fall back to defaults */
  }
  const relays = Array.isArray(saved.relays) ? cleanRelays(saved.relays) : [];
  const s: Settings = {
    ranking: typeof saved.ranking === "boolean" ? saved.ranking : DEFAULTS.ranking,
    relays: relays.length ? relays : DEFAULTS.relays,
    showUnlisted: saved.showUnlisted === true,
  };
  // ?plain=1 forces the no-BitBlocks lobby without changing saved settings.
  if (new URLSearchParams(search).get("plain") === "1") s.ranking = false;
  return s;
}

export function saveSettings(s: Settings): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}
