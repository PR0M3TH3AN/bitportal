/**
 * The visitor's look (NSWP spec §4.2): how other people see them in a world.
 *
 * It is kept on this device and nowhere else. Nothing is kept until the
 * visitor makes one: before that they go plain, and each world draws them as
 * a different figure every visit. A kept look goes to a world only through
 * the Airlock, and only when the visitor chose to go as themselves.
 */
import { applyChoices, encodeLook, generatedLook, LOOK_COLORS, LOOK_PARTS, type Look, type LookPart } from "@nswp/core";

const KEY = "bitportal:look";
const PLAIN = "bitportal:go-plain";

export interface KeptLook {
  /** Stands in for a key: it decides the mark, and every part not chosen. Made on this device, by chance. */
  seed: string;
  /** The parts and colours the visitor picked. */
  choices: Record<string, string>;
}

const SEED = /^[0-9a-z]{16,64}$/;
const NAMES = new Set<string>([...LOOK_COLORS, ...Object.keys(LOOK_PARTS)]);

/** Read a kept look from storage text. Null for anything that isn't one. */
export function parseKept(text: string | null): KeptLook | null {
  if (!text) return null;
  try {
    const json = JSON.parse(text) as { seed?: unknown; choices?: unknown };
    if (typeof json.seed !== "string" || !SEED.test(json.seed)) return null;
    const choices: Record<string, string> = {};
    if (json.choices && typeof json.choices === "object") {
      for (const [k, v] of Object.entries(json.choices as Record<string, unknown>)) if (NAMES.has(k) && typeof v === "string" && v.length <= 16) choices[k] = v;
    }
    return { seed: json.seed, choices };
  } catch {
    return null;
  }
}

export function loadLook(): KeptLook | null {
  try {
    return parseKept(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function storeLook(kept: KeptLook): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(kept));
  } catch {
    /* a private window: the look lasts as long as the page */
  }
}

export function forgetLook(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(PLAIN);
  } catch {
    /* nothing was kept */
  }
}

/** A new seed, by chance: a new mark, and a new starting point for every part. */
export function newSeed(fill: (bytes: Uint8Array<ArrayBuffer>) => void = (b) => void crypto.getRandomValues(b)): string {
  const bytes = new Uint8Array(12);
  fill(bytes);
  return `g${[...bytes].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/** The look a kept look draws as. Choices that aren't on the lists keep what the seed gives. */
export function lookOf(kept: KeptLook): Look {
  return applyChoices(generatedLook(kept.seed), kept.choices).look;
}

/** The form a look travels in: through the Airlock, and to the others in a room. */
export function inlineLook(kept: KeptLook): string {
  return encodeLook(lookOf(kept), kept.seed);
}

/** Did the visitor last choose to go plain? Only matters once they have a look. */
export function goesPlain(): boolean {
  try {
    return localStorage.getItem(PLAIN) === "1";
  } catch {
    return false;
  }
}

export function setGoesPlain(plain: boolean): void {
  try {
    if (plain) localStorage.setItem(PLAIN, "1");
    else localStorage.removeItem(PLAIN);
  } catch {
    /* the choice lasts for this trip only */
  }
}

/** How a visitor goes through a door: by name, as a guest wearing their look, or with nothing of theirs. */
export type GoMode = "name" | "look" | "plain";
const MODE = "bitportal:go-as";

/** What the visitor last chose. Never "name" until they have chosen it themselves. */
export function goMode(): GoMode {
  try {
    const kept = localStorage.getItem(MODE);
    if (kept === "name" || kept === "look" || kept === "plain") return kept;
  } catch {
    /* fall through */
  }
  return goesPlain() ? "plain" : "look";
}

export function setGoMode(mode: GoMode): void {
  setGoesPlain(mode === "plain");
  try {
    localStorage.setItem(MODE, mode);
  } catch {
    /* the choice lasts for this trip only */
  }
}

/** Pick every part and colour by chance, keeping the seed (and so the mark). */
export function surprise(kept: KeptLook, random: () => number = Math.random): KeptLook {
  const choices: Record<string, string> = {};
  for (const part of Object.keys(LOOK_PARTS) as LookPart[]) {
    const list = LOOK_PARTS[part];
    choices[part] = list[Math.floor(random() * list.length)]!;
  }
  // Colours from another seed's generated look, so they go together the way generated ones do.
  const other = generatedLook(`${kept.seed}:${Math.floor(random() * 1e9)}`);
  for (const c of LOOK_COLORS) choices[c] = other[c];
  return { seed: kept.seed, choices };
}
