import { describe, expect, it } from "vitest";
import { blockedToCarry, blocksToAsk, cleanBlockedEverywhere, loadBlockedEverywhere, loadPendingBlocks, roomBlocks, storeBlockedEverywhere, storePendingBlocks, withBlockedEverywhere, withoutBlockedEverywhere } from "../src/shared/blocked.js";

const k = (n: number) => n.toString(16).padStart(64, "0");
const store = () => {
  const m = new Map<string, string>();
  return { getItem: (x: string) => m.get(x) ?? null, setItem: (x: string, v: string) => void m.set(x, v), removeItem: (x: string) => void m.delete(x), m };
};

describe("the people a visitor has blocked everywhere", () => {
  it("is a list of keys with where and when, trusting nothing it reads back", () => {
    const read = cleanBlockedEverywhere([{ key: k(1), at: 10, where: "Grove.Example" }, { key: k(1), at: 20 }, { key: "nope" }, null, { key: k(2), at: -5, where: "<script>" }]);
    expect(read).toEqual([{ key: k(1), at: 10, where: "grove.example" }, { key: k(2), at: 0, where: "" }]);
    expect(cleanBlockedEverywhere("x")).toEqual([]);
    expect(cleanBlockedEverywhere(Array.from({ length: 200 }, (_, i) => ({ key: k(i + 1) })))).toHaveLength(64);
  });

  it("gains people once, newest first, and loses them one at a time", () => {
    let list = withBlockedEverywhere([], [k(1)], "grove.example", 100);
    list = withBlockedEverywhere(list, [k(2), k(1), "junk"], "gallery.example", 200);
    expect(list.map((b) => [b.key, b.where, b.at])).toEqual([[k(2), "gallery.example", 200], [k(1), "grove.example", 100]]);
    expect(withoutBlockedEverywhere(list, k(2)).map((b) => b.key)).toEqual([k(1)]);
  });

  it("asks about what a link reports and what was waiting, and never about someone already blocked", () => {
    const list = withBlockedEverywhere([], [k(1)], "grove.example", 100);
    const pending = withBlockedEverywhere([], [k(2)], "arcade.example", 150);
    const ask = blocksToAsk([k(1), k(3)], pending, list, "gallery.example", 200);
    expect(ask.map((b) => [b.key, b.where])).toEqual([[k(3), "gallery.example"], [k(2), "arcade.example"]]);
    expect(blocksToAsk(undefined, [], list, "x")).toEqual([]);
    expect(blocksToAsk(["not a key"], [], [], "x")).toEqual([]);
  });

  it("is kept in this browser, with what is waiting kept apart", () => {
    const s = store();
    storeBlockedEverywhere(withBlockedEverywhere([], [k(1)], "grove.example", 100), s);
    storePendingBlocks(withBlockedEverywhere([], [k(2)], "", 150), s);
    expect(loadBlockedEverywhere(s).map((b) => b.key)).toEqual([k(1)]);
    expect(loadPendingBlocks(s).map((b) => b.key)).toEqual([k(2)]);
    storePendingBlocks([], s);
    expect(s.m.has("bitportal:blocked-pending")).toBe(false);
    s.m.set("bitportal:blocked", "{broken");
    expect(loadBlockedEverywhere(s)).toEqual([]);
    expect(loadBlockedEverywhere(null)).toEqual([]);
  });

  it("goes with the visitor as keys: their list and their room's, once each, within the limit", () => {
    const s = store();
    s.m.set("nswp:blocked", JSON.stringify([{ key: k(5), name: "Ada", at: 1 }, { key: "bad" }, "junk"]));
    expect(roomBlocks(s)).toEqual([k(5)]);
    const list = withBlockedEverywhere([], [k(1), k(5)], "x", 1);
    expect(blockedToCarry(list, roomBlocks(s))).toEqual([k(1), k(5)]);
    expect(blockedToCarry([], [])).toEqual([]);
    expect(blockedToCarry(cleanBlockedEverywhere(Array.from({ length: 64 }, (_, i) => ({ key: k(i + 1) }))), [k(900)])).toHaveLength(64);
  });
});
