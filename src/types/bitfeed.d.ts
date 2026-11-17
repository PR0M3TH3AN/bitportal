// The small part of the vendored BitFeed standalone bundle that BitPortal uses.
// The bundle ships no type declarations; see vendor/bitfeed/bitfeed.js.
export interface BitFeedCandidate<T = unknown> {
  id: string;
  value: T;
  metadata?: Record<string, unknown>;
}
export interface BitFeedContext {
  viewer?: unknown;
  now?: number;
  metadata?: Record<string, unknown>;
}
export interface ScoreResult {
  score: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}
export interface Scorer {
  id: string;
  score(candidate: BitFeedCandidate, context: BitFeedContext, params: Record<string, unknown>): Promise<ScoreResult>;
}
export interface Filter {
  id: string;
  evaluate(candidate: BitFeedCandidate, context: BitFeedContext, params: Record<string, unknown>): Promise<boolean>;
}
export interface Registry {
  registerScorer(id: string, provider: Scorer): Registry;
  registerFilter(id: string, provider: Filter): Registry;
}
export interface BitFeedItem<T = unknown> {
  candidate: BitFeedCandidate<T>;
  score?: number;
}
export interface ExplanationRow {
  label: string;
  contribution: number;
  share: number;
}
export interface Recipe {
  spec: "bitfeed/1";
  name: string;
  seed?: string;
  sources: { provider: string; lane?: string }[];
  filters?: { provider: string; params?: Record<string, unknown> }[];
  scorers?: { provider: string; weight?: number; params?: Record<string, unknown> }[];
}
export interface ComposeResult<T = unknown> {
  items: BitFeedItem<T>[];
}
export function createRegistry(): Registry;
export function createBitFeed(opts: { registry: Registry }): {
  compose<T>(req: { recipe: Recipe; candidates: BitFeedCandidate<T>[]; context?: BitFeedContext; limit?: number }): Promise<ComposeResult<T>>;
};
export function explanationRows(item: BitFeedItem): ExplanationRow[];
export const providers: { registerStandardProviders(registry: Registry): Registry };
export const ENGINE_VERSION: string;
