// BitGate's shadow comparison, BitPortal's part (scripts/shadow/compare.ts): both answers for every world, from the
// same signed lists, with test keys made here. It stands aside where BitGate's checkout isn't beside this one.
import { describe, expect, it } from "vitest";
import { buildWorldEvent, finalizeEvent, getPublicKey } from "@nswp/core";
import type { InstancePolicy } from "../src/shared/instance.js";

const { existsSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { existsSync(path: URL): boolean };
const haveBitgate = existsSync(new URL("../../bitgate/packages/nostr/src/index.js", import.meta.url));

const key = () => crypto.getRandomValues(new Uint8Array(32)); // throwaways, made here and gone with the test
const now = 1_800_000_000;
const operatorKey = key();
const curatorKey = key();
const makerKey = key();
const operator = getPublicKey(operatorKey);
const curator = getPublicKey(curatorKey);
const maker = getPublicKey(makerKey);
const world = (d: string, more: Record<string, unknown> = {}, signer = makerKey) =>
  finalizeEvent({ ...buildWorldEvent({ d, title: d, url: `https://${d.replace(/[^a-z0-9]/g, "")}.example/`, previews: [{ url: `https://${d.replace(/[^a-z0-9]/g, "")}.example/p.webp`, type: "pano", sha256: "a".repeat(64) }], ...more } as never), created_at: now - 3600 }, signer);
const coord = (pubkey: string, d: string) => `37300:${pubkey}:${d}`;
const list = (signer: Uint8Array, d: string | string[], names: string[], createdAt: number) =>
  finalizeEvent({ kind: 30004, created_at: createdAt, content: "", tags: [...(Array.isArray(d) ? d : [d]).map((x) => ["d", x]), ["title", "A list"], ...names.map((n) => ["a", n])] }, signer);
const policy: InstancePolicy = { operators: [operator], allowList: "bitportal", allowListOnly: true, allowAdult: false } as InstancePolicy;

describe.skipIf(!haveBitgate)("BitGate's shadow, BitPortal's part", async () => {
  const { shadowCompare } = await import("../scripts/shadow/compare.js");
  const starterSet = list(curatorKey, "starter-test", [coord(maker, "on-starter")], now - 7200);
  const bundle = { curator, set: starterSet, worlds: [] };
  const run = (events: unknown[]) => shadowCompare({ bundle, events, policy, now, fetchedAt: now - 30 });
  const worlds = [world("on-starter"), world("on-operator-list"), world("unlisted"), world("name:with:colons"), world("for-adults", { audience: "adult" })];
  const operatorList = list(operatorKey, "bitportal", [coord(maker, "on-operator-list"), coord(maker, "name:with:colons"), coord(maker, "for-adults")], now - 600);

  it("agrees, world by world, when both read the same honest lists", () => {
    const r = run([operatorList, ...worlds]);
    expect(r.counts.disagree).toBe(0);
    expect(r.counts.unavailable).toBe(0);
    expect(r.reconciliation.bitportalOnly).toEqual([]);
    expect(r.reconciliation.bitgateOnly).toEqual([]);
    // Every world listed is shown by both, a colon in a world's name included; the unlisted one by neither. The world
    // for adults is listed, and only the allow list is compared: BitPortal's adult filter stays its own.
    expect(r.counts.worlds).toBe(5);
    expect(r.lines.filter((l) => l.existing === "allow" && l.bitgate === "allow")).toHaveLength(4);
    expect(r.lines.filter((l) => l.existing === "deny" && l.bitgate === "deny")).toHaveLength(1);
    expect(r.reconciliation.lists.onlyBitportal).toEqual([]);
    expect(r.reconciliation.lists.onlyBitgate).toEqual([]);
    expect(r.reconciliation.lists.bitportal).toEqual([coord(maker, "for-adults"), coord(maker, "name:with:colons"), coord(maker, "on-operator-list"), coord(maker, "on-starter")]);
  });

  it("logs the answer and never the world: no key, coordinate or name in a line", () => {
    const r = run([operatorList, ...worlds]);
    const text = JSON.stringify(r.lines);
    for (const secret of [maker, operator, curator, "on-starter", "name:with:colons", "unlisted"]) expect(text).not.toContain(secret);
    expect(Object.keys(r.lines[0]!).sort()).toEqual(["agree", "at", "bitgate", "decision", "event", "existing", "lists", "listsAge", "project", "reasons", "v"]);
    expect(r.lines[0]).toMatchObject({ event: "bitgate_shadow", v: 1, project: "bitportal", decision: "world-shown", listsAge: 30 });
  });

  it("finds the readers' difference over a copy dated in the future: BitPortal takes it, BitGate (NSWP-08) leaves it out", () => {
    const ahead = list(operatorKey, "bitportal", [coord(maker, "unlisted")], now + 86_400);
    const r = run([operatorList, ahead, ...worlds]);
    expect(r.reconciliation.bitportalOnly).toEqual([coord(maker, "unlisted")]);
    expect(r.reconciliation.bitgateOnly).toEqual([coord(maker, "for-adults"), coord(maker, "name:with:colons"), coord(maker, "on-operator-list")]);
    expect(r.reconciliation.read.find((x) => x.list.endsWith(":bitportal"))?.futureDated).toEqual([ahead.id]);
  });

  it("finds the readers' difference over a list with two names: BitPortal reads the first, BitGate refuses it", () => {
    const twoNames = list(operatorKey, ["bitportal", "other"], [coord(maker, "unlisted")], now - 60);
    const r = run([operatorList, twoNames, ...worlds]);
    expect(r.reconciliation.bitportalOnly).toEqual([coord(maker, "unlisted")]);
    expect(r.reconciliation.bitgateOnly).toEqual([coord(maker, "for-adults"), coord(maker, "name:with:colons"), coord(maker, "on-operator-list")]);
  });

  it("finds that BitGate never hides its root's own world, which BitPortal hides when nobody listed it", () => {
    const own = world("operators-own", {}, operatorKey);
    const r = run([operatorList, own, ...worlds]);
    expect(r.reconciliation.bitgateOnly).toEqual([coord(operator, "operators-own")]);
    // BitGate gives no reason for it: its root is never gated by the allowlist.
    expect(r.lines.filter((l) => l.existing === "deny" && l.bitgate === "allow")).toHaveLength(1);
  });

  it("says unavailable, never a guess, with no list read at all", () => {
    const bad = { ...starterSet, sig: "0".repeat(128) };
    const r = shadowCompare({ bundle: { curator, set: starterSet, worlds: [] }, events: [...worlds], policy: { ...policy, operators: [] }, now, fetchedAt: now, verify: (e) => e.id !== starterSet.id });
    expect(bad.sig).not.toBe(starterSet.sig);
    expect(r.counts.unavailable).toBe(r.counts.worlds);
    expect(r.lines.every((l) => !l.agree)).toBe(true);
  });
});
