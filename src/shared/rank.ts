/**
 * Ranks the lobby's shelves with BitFeed. World-specific signals are
 * BitPortal's own providers; BitFeed itself has no opinion about worlds.
 * Pure: no DOM, no network, so it runs in a worker and in tests alike.
 */
import { createBitFeed, createRegistry, ENGINE_VERSION, explanationRows, providers, type BitFeedCandidate } from "bitfeed";
import { shelfDefs, whySentence, type Candidate, type Shelf } from "./shelves.js";

export { ENGINE_VERSION };

const meta = (c: BitFeedCandidate) => (c.metadata ?? {}) as unknown as Candidate;

const registry = providers.registerStandardProviders(createRegistry());
registry
  .registerScorer("bitportal.curatorOrder", {
    id: "bitportal.curatorOrder",
    async score(c) {
      const m = meta(c);
      return { score: m.total > 1 ? 1 - m.rank / (m.total - 1) : 1, reason: "the starter set ranks it highly" };
    },
  })
  .registerScorer("bitportal.deviceFit", {
    id: "bitportal.deviceFit",
    async score(c) {
      return { score: meta(c).fits ? 1 : 0, reason: "it runs on this device" };
    },
  })
  .registerScorer("bitportal.gentle", {
    id: "bitportal.gentle",
    async score(c) {
      const i = meta(c).intensity;
      return { score: i === "low" ? 1 : i === "medium" ? 0.5 : 0.3, reason: "it is gentle on comfort" };
    },
  })
  .registerFilter("bitportal.fitsDevice", {
    id: "bitportal.fitsDevice",
    async evaluate(c) {
      return meta(c).fits;
    },
  })
  .registerFilter("bitportal.notIntense", {
    id: "bitportal.notIntense",
    async evaluate(c) {
      return meta(c).intensity !== "high";
    },
  });

const feed = createBitFeed({ registry });

export async function rankShelves(candidates: Candidate[], now: number, daySeed: string): Promise<Shelf[]> {
  const input = candidates.map((c) => ({ id: c.id, value: c.id, metadata: c as unknown as Record<string, unknown> }));
  const shelves: Shelf[] = [];
  for (const def of shelfDefs(daySeed)) {
    const result = await feed.compose({ recipe: def.recipe, candidates: input, context: { now }, ...(def.limit ? { limit: def.limit } : {}) });
    shelves.push({
      id: def.id,
      title: def.title,
      blurb: def.blurb,
      items: result.items.map((item) => ({ id: item.candidate.id, why: whySentence(explanationRows(item)) })),
    });
  }
  return shelves;
}
