/**
 * The lobby's shelves. Each BitFeed shelf is a recipe: a plain description of
 * how to rank the same set of worlds (NSWP spec §14). The plain mode needs no
 * BitFeed at all (spec §1.3).
 */
import type { Recipe } from "bitfeed";

export interface Candidate {
  id: string;
  createdAt: number;
  /** Position among the worlds on the visitor's lists, 0 first. */
  rank: number;
  total: number;
  fits: boolean;
  intensity: string | null;
  /** Its hashtags, as its maker gave them. */
  topics?: string[];
  /** How well those suit the visitor: 1 for one they like, 0 for one they don't, 0.5 otherwise (src/shared/tastes.ts). */
  taste?: number;
  /** A few words on why, when it is because of a hashtag they like. */
  tasteWhy?: string;
}

export interface ShelfItem {
  id: string;
  /** "Here because …", or "" when there is nothing to explain. */
  why: string;
}

export interface Shelf {
  id: string;
  title: string;
  blurb: string;
  items: ShelfItem[];
}

export interface ShelfDef {
  id: string;
  title: string;
  blurb: string;
  limit?: number;
  recipe: Recipe;
}

const DAY = 86400;

/** A shelf for one hashtag the visitor likes: every world that carries it, newest first. */
function tagShelf(tag: string): ShelfDef {
  return {
    id: `tag-${tag}`,
    title: `#${tag}`,
    blurb: "A hashtag you asked for more of.",
    recipe: {
      spec: "bitfeed/1",
      name: `#${tag}`,
      sources: [{ provider: "bitfeed.input", lane: "all" }],
      filters: [{ provider: "bitportal.hasTopic", params: { topic: tag } }],
      scorers: [{ provider: "bitfeed.recency", weight: 1, params: { field: "createdAt", halfLife: 30 * DAY } }],
    },
  };
}

/** The shelves, in order. `liked` adds one for each of the first few hashtags the visitor likes. */
export function shelfDefs(daySeed: string, liked: readonly string[] = []): ShelfDef[] {
  return [
    {
      id: "start",
      title: "Good places to start",
      blurb: "Your lists' order, nudged towards what suits this device and the hashtags you like.",
      recipe: {
        spec: "bitfeed/1",
        name: "Good places to start",
        seed: daySeed,
        sources: [{ provider: "bitfeed.input", lane: "all" }],
        scorers: [
          { provider: "bitportal.curatorOrder", weight: 0.35 },
          // What the visitor asked for more and less of. With no tastes every world scores the same here, and the
          // order is the lists' and the device's, as it was.
          { provider: "bitportal.tastes", weight: 0.4 },
          { provider: "bitportal.deviceFit", weight: 0.15 },
          { provider: "bitfeed.random", weight: 0.1 },
        ],
      },
    },
    {
      id: "gentle",
      title: "Easy on the stomach",
      blurb: "Worlds that suit this device and don't move you around.",
      recipe: {
        spec: "bitfeed/1",
        name: "Easy on the stomach",
        sources: [{ provider: "bitfeed.input", lane: "all" }],
        filters: [{ provider: "bitportal.fitsDevice" }, { provider: "bitportal.notIntense" }],
        scorers: [
          { provider: "bitportal.gentle", weight: 0.7 },
          { provider: "bitfeed.recency", weight: 0.3, params: { field: "createdAt", halfLife: 30 * DAY } },
        ],
      },
    },
    {
      id: "new",
      title: "Newest",
      blurb: "Most recently announced or updated.",
      limit: 4,
      recipe: {
        spec: "bitfeed/1",
        name: "Newest",
        sources: [{ provider: "bitfeed.input", lane: "all" }],
        scorers: [{ provider: "bitfeed.recency", weight: 1, params: { field: "createdAt", halfLife: 30 * DAY } }],
      },
    },
    ...liked.slice(0, 3).map(tagShelf),
  ];
}

/** The no-BitBlocks lobby: one list, newest first, no ranking and no explanations. */
export function plainShelf(candidates: Candidate[]): Shelf {
  return {
    id: "plain",
    title: "All worlds, newest first",
    blurb: "Ranking is off. These are the worlds on your lists, in date order.",
    items: [...candidates].sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id)).map((c) => ({ id: c.id, why: "" })),
  };
}

const REASON_TEXT: Record<string, string> = {
  recency: "it is new",
  exploration: "a little variety",
};

/** Turn the strongest reasons behind a ranking into one sentence. */
export function whySentence(rows: { label: string; contribution: number }[]): string {
  const top = rows
    .filter((r) => r.contribution > 0.02)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 2)
    .map((r) => REASON_TEXT[r.label] ?? r.label)
    .filter(Boolean);
  if (top.length === 0) return "";
  return `Here because ${top.join(" and ")}.`;
}
