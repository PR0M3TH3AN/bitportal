/**
 * The operator's allow list (src/shared/instance.ts): keeping the last one
 * seen, and changing it.
 *
 * The list is a signed Nostr list of worlds (NSWP-08) under an agreed name.
 * Only an operator's own key can change it, and that key stays with their
 * sign-in: this code builds what is to be signed and hands it to the signer.
 * Publishing it is public and is the operator's own act, one press at a time.
 */
import { buildListEvent, parseListEvent, verifyEvent, CURATION_SET_KIND, type EventTemplate, type NostrEvent } from "@nswp/core";
// Relays are asked and sent to with a backup behind them (NIP-66): the kit tries relays that monitors found working when none of these answers.
import { publishBacked as publishEvent } from "nswp-sdk/ui";
import { INSTANCE, type InstancePolicy } from "./instance.js";
import type { Signer } from "./session.js";

const KEY = "bitportal:operator-lists";

/** Whether this key is one of the people who run this copy. */
export const isOperator = (pubkey: string | null | undefined, policy: InstancePolicy = INSTANCE): boolean => !!pubkey && policy.operators.includes(pubkey);

/** The allow lists seen on an earlier visit. They are checked again wherever they are used: nothing is trusted for having been kept. */
export function loadOperatorLists(storage: Pick<Storage, "getItem"> = localStorage): unknown[] {
  try {
    const kept: unknown = JSON.parse(storage.getItem(KEY) ?? "[]");
    return Array.isArray(kept) ? kept.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function storeOperatorLists(lists: NostrEvent[], storage: Pick<Storage, "setItem"> = localStorage): void {
  try {
    storage.setItem(KEY, JSON.stringify(lists.slice(0, 8)));
  } catch {
    /* asked for again next visit */
  }
}

/**
 * The operator's list with one world added or taken off, ready to sign. It
 * starts from the list they last signed, so nothing already on it is lost.
 * `current` is that list, or null when they have never signed one.
 */
export function changedAllowList(current: NostrEvent | null, world: string, on: boolean, o: { policy?: InstancePolicy; now?: number } = {}): EventTemplate {
  const policy = o.policy ?? INSTANCE;
  const had = current && verifyEvent(current) && current.kind === CURATION_SET_KIND ? parseListEvent(current) : null;
  const before = had?.ok ? had.value : null;
  const worlds = (before?.worlds ?? []).filter((w) => w !== world);
  if (on) worlds.push(world);
  return buildListEvent({
    d: policy.allowList,
    title: before?.title || "Listed on BitPortal",
    description: before?.description || "Worlds this copy of BitPortal shows, chosen by whoever runs it.",
    worlds,
    // Never dated before the one it replaces: a relay keeps the newer of two.
    createdAt: Math.max(o.now ?? Math.floor(Date.now() / 1000), (current?.created_at ?? 0) + 1),
  });
}

/** Sign the changed list as the operator and send it to their relays. Returns it, with how many relays took it. */
export async function publishAllowList(signer: Signer, template: EventTemplate, relays: string[]): Promise<{ event: NostrEvent; accepted: number }> {
  const event = await signer.signEvent(template);
  const sent = await publishEvent(relays, event);
  return { event, accepted: Object.values(sent.relays).filter((r) => r === "ok").length };
}
