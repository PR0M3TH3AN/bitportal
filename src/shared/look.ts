/**
 * The visitor's look (NSWP spec §4.2): how other people see them in a world.
 *
 * It is kept on this device and nowhere else. Nothing is kept until the
 * visitor makes one: before that they go plain, and each world draws them as
 * a different figure every visit. A kept look goes to a world only through
 * the Airlock, and only when the visitor chose to go as themselves.
 */
import { applyChoices, encodeLook, generatedLook, LOOK_COLORS, LOOK_PARTS, type Look, type LookColor, type LookPart } from "@nswp/core";

/** What each list and choice is called, on the page and in the room's menu. The values stay the protocol's. */
export const LOOK_TITLES: Record<LookPart | LookColor, string> = {
  color: "Main colour",
  accent: "Trim",
  light: "Light",
  build: "Build",
  head: "Head",
  face: "Face",
  accessory: "On top",
  body: "Body",
  shoulders: "Shoulders",
  pattern: "Pattern",
  finish: "Finish",
};
const WORDS: Record<string, string> = { none: "Nothing", split: "Two bars", dots: "Two dots", tee: "A T", plain: "Plain" };
export const lookWord = (value: string): string => WORDS[value] ?? value[0]!.toUpperCase() + value.slice(1);

/**
 * Colours to step through where there is no colour picker: in the room's menu, on a phone, on a headset's wrist.
 * The page's picker still gives any colour at all, and a colour chosen there is kept.
 */
export const LOOK_PALETTE: readonly { name: string; hex: string }[] = [
  { name: "Mint", hex: "#3df2a0" },
  { name: "Teal", hex: "#22b8b0" },
  { name: "Sky", hex: "#5ab0ff" },
  { name: "Indigo", hex: "#5b62e8" },
  { name: "Violet", hex: "#a56bff" },
  { name: "Rose", hex: "#ff6fa5" },
  { name: "Ember", hex: "#ff6b4a" },
  { name: "Amber", hex: "#ffb65c" },
  { name: "Lemon", hex: "#f2e35a" },
  { name: "Moss", hex: "#7fae4e" },
  { name: "Bone", hex: "#e9e3d2" },
  { name: "Slate", hex: "#5d6b7a" },
  { name: "Ink", hex: "#1b2230" },
];

const rgbOf = (hex: string): [number, number, number] => {
  const n = /^#?([0-9a-f]{6})$/i.exec(hex.trim())?.[1] ?? "000000";
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
};

/** What a colour is called: the name of the one on the list it is nearest to. The chip beside it shows the colour itself. */
export function colourName(hex: string): string {
  const [r, g, b] = rgbOf(hex);
  let best = LOOK_PALETTE[0]!;
  let least = Infinity;
  for (const c of LOOK_PALETTE) {
    const [cr, cg, cb] = rgbOf(c.hex);
    const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (d < least) [best, least] = [c, d];
  }
  return best.name;
}

/** The next choice on a list after this one, going round. */
export function nextOf<T>(list: readonly T[], now: T): T {
  return list[(list.indexOf(now) + 1) % list.length]!;
}

/** The look with one part or colour stepped on to the next choice. */
export function stepLook(kept: KeptLook, what: LookPart | LookColor): KeptLook {
  const now = lookOf(kept);
  if ((LOOK_COLORS as readonly string[]).includes(what)) {
    const hexes = LOOK_PALETTE.map((c) => c.hex);
    return { seed: kept.seed, choices: { ...kept.choices, [what]: nextOf(hexes, String(now[what as LookColor]).toLowerCase()) } };
  }
  const list = LOOK_PARTS[what as LookPart] as readonly string[];
  return { seed: kept.seed, choices: { ...kept.choices, [what]: nextOf(list, String(now[what as LookPart])) } };
}

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

const AS_GUEST = "bitportal:as-guest";

/**
 * Whether someone signed in has said to go to worlds as a guest all the same.
 *
 * Signed in is signed in everywhere: a world that has proved who it is is
 * told who they are, with nothing to choose at each door (NSWP-10, "Signed in
 * everywhere"). This is the way out of that, and it is theirs: set only by
 * their own hand, on the sign-in page or at the Airlock, and kept on this
 * device.
 */
export function goesAsGuest(): boolean {
  try {
    return localStorage.getItem(AS_GUEST) === "1";
  } catch {
    return false;
  }
}

export function setGoesAsGuest(guest: boolean): void {
  try {
    if (guest) localStorage.setItem(AS_GUEST, "1");
    else localStorage.removeItem(AS_GUEST);
  } catch {
    /* the choice lasts for this trip only */
  }
}

/**
 * How a visitor goes through a door, before they change anything on the way.
 * Signed in, to a site that may be told: by name, unless they said otherwise.
 * Anyone else: as they last went, wearing their look or plain.
 */
export function startingMode(o: { canName: boolean; hasLook: boolean; asGuest: boolean; last: GoMode }): GoMode {
  if (o.canName && !o.asGuest) return "name";
  if (o.last === "plain") return "plain";
  return o.hasLook ? "look" : "plain";
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
