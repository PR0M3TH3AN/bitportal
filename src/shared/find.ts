/**
 * Finding a world among the ones the lobby already holds (NSWP-08,
 * "Searching"). Nothing here asks anyone anything: it reads what is on the
 * page.
 */
import type { World } from "@nswp/core";

const fold = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

type Findable = Pick<World, "title" | "url" | "topics" | "languages"> & Partial<Pick<World, "summary" | "description">>;

/** Everything about a world a visitor might type. */
function haystack(w: Findable): string {
  let host = "";
  try {
    host = new URL(w.url).hostname;
  } catch {
    /* an invalid address has no host to find it by */
  }
  return fold([w.title, w.summary ?? "", w.description ?? "", host, ...w.topics, ...w.languages].join("\n"));
}

/** True when every word of `query` is somewhere in the world's title, summary, address, topics or languages. */
export function matchesQuery(w: Findable, query: string): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = haystack(w);
  return words.every((word) => text.includes(word));
}

export interface Find {
  query: string;
  /** A topic every match must carry, or "". */
  topic: string;
}

export const isFinding = (f: Find): boolean => f.query.trim() !== "" || f.topic !== "";

export function matches(w: Findable, f: Find): boolean {
  if (f.topic && !w.topics.includes(f.topic)) return false;
  return matchesQuery(w, f.query);
}

/** The topics most worlds here share, commonest first. A topic only one world has is no help in narrowing. */
export function commonTopics(worlds: Pick<World, "topics">[], limit = 8): string[] {
  const count = new Map<string, number>();
  for (const w of worlds) for (const t of new Set(w.topics)) count.set(t, (count.get(t) ?? 0) + 1);
  return [...count.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([t]) => t);
}
