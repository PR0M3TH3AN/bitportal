/**
 * BitFeed runs here, off the main thread, so ranking never competes with
 * drawing (NSWP spec §14).
 */
import { ENGINE_VERSION, rankShelves } from "../shared/rank.js";
import type { Candidate, Shelf } from "../shared/shelves.js";

export interface FeedRequest {
  candidates: Candidate[];
  now: number;
  daySeed: string;
  /** The hashtags the visitor likes: each of the first few gets a shelf of its own. */
  liked?: string[];
}
export interface FeedResponse {
  ok: boolean;
  shelves: Shelf[];
  engine: string;
  error?: string;
}

self.onmessage = async (e: MessageEvent<FeedRequest>) => {
  const { candidates, now, daySeed, liked } = e.data;
  let res: FeedResponse;
  try {
    res = { ok: true, shelves: await rankShelves(candidates, now, daySeed, liked ?? []), engine: ENGINE_VERSION };
  } catch (err) {
    res = { ok: false, shelves: [], engine: ENGINE_VERSION, error: err instanceof Error ? err.message : String(err) };
  }
  self.postMessage(res);
};
