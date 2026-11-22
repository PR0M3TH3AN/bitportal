/// <reference path="./bitgate.d.ts" />
/**
 * BitGate's shadow comparison, BitPortal's part (PR0M3TH3AN/bitgate `docs/shadow-comparison.md`, "BitPortal").
 *
 * For every world known, two answers to "may this world be shown here", side by side:
 *
 * - **BitPortal's own:** `buildCatalog(...).permits`, the very function the room's doors use (src/walk/main.ts), with
 *   only its allow-list half compared. The adult filter stays BitPortal's own and is left out of the comparison.
 * - **BitGate's:** the same signed lists read through BitGate's 30004 reader (`resolveCurationSet`), turned into
 *   `address-allow` contributions, and the world evaluated under BitGate's allowlist preset (`evaluateTarget`).
 *   BitPortal's allow list is two kinds of list, so BitGate reads both: each operator's own list (`d` from the
 *   instance policy) with that operator as its root, and the starter set BitPortal ships with, under its curator's
 *   key.
 *
 * Nothing here decides anything, publishes anything or holds a key. It runs on the operator's machine, never in a
 * visitor's page. Its log lines name no world (rule 3 of the plan); the offline reconciliation, which compares the two
 * sets the operator already holds, names coordinates and stays in the operator's own output.
 */
import { audienceOf, CURATION_SET_KIND, getTagValue, parseCoordinate, parseWorldEvent, verifyEvent, WORLD_KIND, type NostrEvent } from "@nswp/core";
import { ALLOWLIST_POLICY, createAuthorityState, createSnapshot, evaluateTarget, reduceAdminState } from "@bitgate/core";
import { curationSetToContribution, resolveCurationSet } from "@bitgate/nostr";
import { buildCatalog, type StarterBundle } from "../../src/shared/catalog.js";
import type { InstancePolicy } from "../../src/shared/instance.js";

/** One decision, in the plan's shape: the answer only, never the world. */
export interface ShadowLine {
  event: "bitgate_shadow";
  v: 1;
  project: "bitportal";
  decision: "world-shown";
  existing: "allow" | "deny";
  bitgate: "allow" | "deny" | "unavailable";
  agree: boolean;
  reasons: string[];
  lists: string[];
  listsAge: number;
  at: number;
}

export interface ShadowReport {
  lines: ShadowLine[];
  /** Kept to the operator's machine: which worlds each side allows that the other doesn't, by coordinate. */
  reconciliation: {
    /** Allowed by BitPortal's own reading and not by BitGate's. */
    bitportalOnly: string[];
    /** Allowed by BitGate and not by BitPortal. */
    bitgateOnly: string[];
    /**
     * The disagreements that are BitGate's design, not a fault (scripts/shadow/README.md): a world published by a
     * list's own root, which BitGate's allowlist preset never hides and BitPortal hides when no list names it. Each
     * is also in `bitgateOnly`; what is left there after these is what needs explaining.
     */
    expected: { coordinate: string; why: "root's own world" }[];
    /** The `a` entries of the lists as BitPortal reads them (`catalog.allowed`) against BitGate's reading of the same events. */
    lists: { bitportal: string[]; bitgate: string[]; onlyBitportal: string[]; onlyBitgate: string[] };
    /** What BitGate's reader made of each list: the copy it chose, or why it chose none. */
    read: { list: string; ok: boolean; id?: string; reason?: string; futureDated: string[]; worlds: number }[];
  };
  counts: { worlds: number; agree: number; disagree: number; expected: number; unexplained: number; unavailable: number; adultLeftOut: number };
}

type Verify = (event: NostrEvent) => boolean;

/** BitGate's target for a world: an address, as its vectors write one. */
const targetOf = (coordinate: string) => {
  const c = parseCoordinate(coordinate);
  return c && c.kind === WORLD_KIND ? { type: "address" as const, kind: String(WORLD_KIND), pubkey: c.pubkey, identifier: c.identifier } : null;
};

export function shadowCompare(o: {
  bundle: StarterBundle;
  /** Every event fetched: lists (30004) and world announcements (37300). Signature-checked by both readers. */
  events: unknown[];
  policy: InstancePolicy;
  /** The reader's clock, unix seconds. */
  now: number;
  /** When the events were fetched, unix seconds (for `listsAge`). */
  fetchedAt: number;
  verify?: Verify;
}): ShadowReport {
  const verify: Verify = o.verify ?? ((e) => verifyEvent(e));
  // BitPortal's own reading: the same function the doors use, with the same clock BitGate's reader is given, so the
  // two choose list copies at the same moment. A neutral world, so only the allow list counts.
  const catalog = buildCatalog(o.bundle, o.events, { policy: o.policy, now: o.now });
  const existingOf = (id: string): "allow" | "deny" => (catalog.permits(id, {}) ? "allow" : "deny");

  // BitGate's reading of the same lists.
  const starterD = getTagValue(o.bundle.set, "d") ?? "";
  const lists: { root: string; d: string; extra: unknown[] }[] = [
    ...o.policy.operators.map((root) => ({ root, d: o.policy.allowList, extra: [] as unknown[] })),
    { root: o.bundle.curator, d: starterD, extra: [o.bundle.set] },
  ];
  const read: ShadowReport["reconciliation"]["read"] = [];
  const snapshots: unknown[] = [];
  const listIds: string[] = [];
  const bitgateListed = new Set<string>();
  for (const l of lists) {
    const name = `${CURATION_SET_KIND}:${l.root}:${l.d}`;
    const got = resolveCurationSet([...l.extra, ...o.events], { pubkey: l.root, d: l.d, verify, now: o.now });
    if (!got.ok) {
      read.push({ list: name, ok: false, reason: got.reason, futureDated: got.futureDated, worlds: 0 });
      continue;
    }
    read.push({ list: name, ok: true, id: got.id, futureDated: got.futureDated, worlds: got.list.coordinates.length });
    listIds.push(got.id);
    for (const c of got.list.coordinates) bitgateListed.add(c);
    const authority = createAuthorityState({ root: l.root });
    const admin = reduceAdminState([curationSetToContribution(got.list)], authority);
    snapshots.push(createSnapshot({ authority, admin }));
  }

  // Every world known: on any list either side read, or announced.
  const known = new Set<string>([...catalog.allowed, ...bitgateListed]);
  let adultLeftOut = 0;
  for (const e of o.events) {
    const parsed = parseWorldEvent(e);
    if (!parsed.ok) continue;
    const ev = e as NostrEvent;
    const id = `${WORLD_KIND}:${ev.pubkey}:${getTagValue(ev, "d") ?? ""}`;
    // The adult filter is BitPortal's own, outside the comparison: such a world is counted, not compared.
    if (audienceOf(parsed.value) === "adult") {
      if (!known.has(id)) adultLeftOut++;
      continue;
    }
    known.add(id);
  }

  const lines: ShadowLine[] = [];
  const bitportalOnly: string[] = [];
  const bitgateOnly: string[] = [];
  const listsAge = Math.max(0, o.now - o.fetchedAt);
  for (const id of [...known].sort()) {
    const existing = existingOf(id);
    const target = targetOf(id);
    let bitgate: ShadowLine["bitgate"] = "unavailable";
    let reasons: string[] = [];
    if (target && snapshots.length) {
      const decisions = snapshots.map((snapshot) => evaluateTarget(target, snapshot, { surface: "default", policy: ALLOWLIST_POLICY, now: o.now }));
      const allowed = decisions.find((d) => d.visibility.effect === "allow");
      bitgate = allowed ? "allow" : "deny";
      reasons = [...new Set((allowed ? [allowed] : decisions).flatMap((d) => (d.reasons ?? []).map((r) => r.id)))].sort();
    }
    if (existing === "allow" && bitgate === "deny") bitportalOnly.push(id);
    if (existing === "deny" && bitgate === "allow") bitgateOnly.push(id);
    lines.push({ event: "bitgate_shadow", v: 1, project: "bitportal", decision: "world-shown", existing, bitgate, agree: existing === bitgate, reasons, lists: listIds, listsAge, at: o.now });
  }
  // BitGate never gates its root by the allowlist: a root's own world is allowed there, by design.
  const roots = new Set(lists.map((l) => l.root));
  const expected = bitgateOnly.filter((id) => roots.has(parseCoordinate(id)?.pubkey ?? "")).map((coordinate) => ({ coordinate, why: "root's own world" as const }));
  const disagree = lines.filter((l) => !l.agree && l.bitgate !== "unavailable").length;
  const bp = [...catalog.allowed].sort();
  const bg = [...bitgateListed].sort();
  return {
    lines,
    reconciliation: {
      bitportalOnly,
      bitgateOnly,
      expected,
      lists: { bitportal: bp, bitgate: bg, onlyBitportal: bp.filter((x) => !bitgateListed.has(x)), onlyBitgate: bg.filter((x) => !catalog.allowed.has(x)) },
      read,
    },
    counts: {
      worlds: lines.length,
      agree: lines.filter((l) => l.agree).length,
      disagree,
      expected: expected.length,
      unexplained: disagree - expected.length,
      unavailable: lines.filter((l) => l.bitgate === "unavailable").length,
      adultLeftOut,
    },
  };
}
