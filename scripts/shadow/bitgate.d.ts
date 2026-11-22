// The few parts of BitGate's readers the shadow comparison uses (PR0M3TH3AN/bitgate packages/core, packages/nostr),
// vendored in vendor/bitgate (built from BitGate's committed tree at a pinned commit). Only their shape is declared here.
declare module "@bitgate/core" {
  export const ALLOWLIST_POLICY: unknown;
  export function createAuthorityState(o: { root: string }): unknown;
  export function reduceAdminState(contributions: unknown[], authority: unknown): unknown;
  export function createSnapshot(o: { authority: unknown; admin: unknown }): unknown;
  export function evaluateTarget(
    target: { type: "address"; kind: string; pubkey: string; identifier: string },
    snapshot: unknown,
    context: { surface: string; policy: unknown; now: number },
  ): { visibility: { effect: string }; reasons?: { id: string }[] };
}
declare module "@bitgate/nostr" {
  export type CurationSetRead = { ok: true; id: string; list: { pubkey: string; coordinate: string; coordinates: string[]; createdAt: number }; futureDated: string[] };
  export type CurationSetRefusal = { ok: false; reason: string; futureDated: string[] };
  export function resolveCurationSet(events: unknown[], query: { pubkey: string; d: string; verify: (e: never) => boolean; now: number }): CurationSetRead | CurationSetRefusal;
  export function curationSetToContribution(list: CurationSetRead["list"]): unknown;
}
