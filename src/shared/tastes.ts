/**
 * The hashtags a visitor likes and doesn't: what they would see more of, and
 * less of. Worlds say what they are about with hashtags (NSWP-01); this is
 * the visitor's side of that.
 *
 * Kept in this browser. It tells nobody what they like, and it never brings
 * in a world this copy wouldn't show anyway: it orders what is already here.
 */
export interface Tastes {
  like: string[];
  dislike: string[];
}

export const TASTE_LIMIT = 30;
const KEY = "bitportal:hashtags";

/** A hashtag as it is kept: lowercase, no `#`, letters, digits, `-` and `_`. "" for anything else. */
export function cleanTag(tag: unknown): string {
  if (typeof tag !== "string") return "";
  const t = tag.trim().replace(/^#+/, "").toLowerCase();
  return /^[\p{L}\p{N}_-]{1,40}$/u.test(t) ? t : "";
}

export function parseTastes(raw: unknown): Tastes {
  const o = (raw && typeof raw === "object" ? raw : {}) as Partial<Tastes>;
  const tidy = (list: unknown) => [...new Set((Array.isArray(list) ? list : []).map(cleanTag).filter(Boolean))].slice(0, TASTE_LIMIT);
  const like = tidy(o.like);
  // A tag can't be both. If it is somehow kept as both, liking wins: it is the one that was asked for by name.
  return { like, dislike: tidy(o.dislike).filter((t) => !like.includes(t)) };
}

export function loadTastes(storage: Pick<Storage, "getItem"> = localStorage): Tastes {
  try {
    return parseTastes(JSON.parse(storage.getItem(KEY) ?? "{}"));
  } catch {
    return { like: [], dislike: [] };
  }
}

export function storeTastes(tastes: Tastes, storage: Pick<Storage, "setItem"> = localStorage): void {
  try {
    storage.setItem(KEY, JSON.stringify(parseTastes(tastes)));
  } catch {
    /* it lasts for the visit */
  }
}

export type Taste = "like" | "dislike" | "none";

export function tasteOf(tastes: Tastes, tag: string): Taste {
  const t = cleanTag(tag);
  return tastes.like.includes(t) ? "like" : tastes.dislike.includes(t) ? "dislike" : "none";
}

/** Like a hashtag, dislike it, or go back to having no view of it. */
export function setTaste(tastes: Tastes, tag: string, taste: Taste): Tastes {
  const t = cleanTag(tag);
  if (!t) return tastes;
  const like = tastes.like.filter((x) => x !== t);
  const dislike = tastes.dislike.filter((x) => x !== t);
  if (taste === "like") like.push(t);
  if (taste === "dislike") dislike.push(t);
  return parseTastes({ like: like.slice(-TASTE_LIMIT), dislike: dislike.slice(-TASTE_LIMIT) });
}

/**
 * How well a world's hashtags suit a visitor: 1 when it has one they like,
 * 0 when it has one they don't, and 0.5 when it has neither or they have no
 * tastes at all. Something disliked outweighs something liked: "less of
 * this" is the stronger wish. `why` is a few words for the page.
 */
export function tasteFor(tastes: Tastes, topics: readonly string[]): { score: number; why: string } {
  const has = topics.map(cleanTag).filter(Boolean);
  const bad = has.find((t) => tastes.dislike.includes(t));
  if (bad) return { score: 0, why: "" };
  const good = has.filter((t) => tastes.like.includes(t));
  if (good.length) return { score: 1, why: `it has #${good[0]}, which you asked for more of` };
  return { score: 0.5, why: "" };
}
