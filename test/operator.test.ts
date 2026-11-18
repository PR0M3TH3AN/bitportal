/** The operator's allow list: keeping it and changing it (src/shared/operator.ts). */
import { describe, expect, it } from "vitest";
import { finalizeEvent, getPublicKey, parseListEvent, type NostrEvent } from "@nswp/core";
import { changedAllowList, isOperator, loadOperatorLists, storeOperatorLists } from "../src/shared/operator.js";
import type { InstancePolicy } from "../src/shared/instance.js";

const OPERATOR = new Uint8Array(32).fill(7);
const operator = getPublicKey(OPERATOR);
const policy: InstancePolicy = { operators: [operator], allowList: "bitportal", allowListOnly: true, allowAdult: false };
const A = `37300:${"a".repeat(64)}:pond`;
const B = `37300:${"b".repeat(64)}:hill`;
const worlds = (e: { tags: string[][] }) => e.tags.filter((t) => t[0] === "a").map((t) => t[1]);

describe("who runs this copy", () => {
  it("is the keys its settings name, and nobody else", () => {
    expect(isOperator(operator, policy)).toBe(true);
    expect(isOperator(getPublicKey(new Uint8Array(32).fill(8)), policy)).toBe(false);
    expect(isOperator(null, policy)).toBe(false);
    expect(isOperator(undefined, policy)).toBe(false);
  });
});

describe("changing the list", () => {
  it("starts one, under the agreed name, when there is none", () => {
    const t = changedAllowList(null, A, true, { policy, now: 100 });
    expect(t.kind).toBe(30004);
    expect(t.tags.find((x) => x[0] === "d")).toEqual(["d", "bitportal"]);
    expect(worlds(t)).toEqual([A]);
    expect(parseListEvent(finalizeEvent(t, OPERATOR)).ok).toBe(true);
  });

  it("adds to and takes from the one last signed, losing nothing else on it", () => {
    const first = finalizeEvent(changedAllowList(null, A, true, { policy, now: 100 }), OPERATOR);
    const second = finalizeEvent(changedAllowList(first, B, true, { policy, now: 101 }), OPERATOR);
    expect(worlds(second)).toEqual([A, B]);
    expect(worlds(changedAllowList(second, A, false, { policy, now: 102 }))).toEqual([B]);
    // Listing what is already listed lists it once.
    expect(worlds(changedAllowList(second, A, true, { policy, now: 102 }))).toEqual([B, A]);
    // Its own name and words are kept.
    const named = finalizeEvent({ ...second, tags: second.tags.map((x) => (x[0] === "title" ? ["title", "My picks"] : x)) }, OPERATOR);
    expect(changedAllowList(named, B, false, { policy, now: 103 }).tags.find((x) => x[0] === "title")).toEqual(["title", "My picks"]);
  });

  it("is never dated before the list it replaces, or a relay would keep the old one", () => {
    const first = finalizeEvent(changedAllowList(null, A, true, { policy, now: 500 }), OPERATOR);
    expect(changedAllowList(first, B, true, { policy, now: 400 }).created_at).toBe(501);
  });
});

describe("the list as it was last seen", () => {
  it("is kept in this browser, a few at most, and nothing is trusted for having been kept", () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    const list = finalizeEvent(changedAllowList(null, A, true, { policy, now: 100 }), OPERATOR) as NostrEvent;
    storeOperatorLists([list], storage);
    expect([...store.keys()]).toEqual(["bitportal:operator-lists"]);
    expect(loadOperatorLists(storage)).toEqual([list]);
    expect(loadOperatorLists({ getItem: () => "{broken" })).toEqual([]);
    expect(loadOperatorLists({ getItem: () => '"not a list"' })).toEqual([]);
  });
});
