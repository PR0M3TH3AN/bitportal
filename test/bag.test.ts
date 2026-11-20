import { describe, expect, it } from "vitest";
import { STARTER_ITEMS } from "../src/shared/bag.js";
import starterSet from "../src/starter/starter-set.json";

describe("the items offered at home", () => {
  it("are each an item's coordinate, named once", () => {
    expect(STARTER_ITEMS.length).toBeGreaterThan(0);
    for (const item of STARTER_ITEMS) expect(item).toMatch(/^37303:[0-9a-f]{64}:[a-z0-9][a-z0-9-]{0,63}$/);
    expect(new Set(STARTER_ITEMS).size).toBe(STARTER_ITEMS.length);
  });
  it("are made by someone whose worlds this copy already lists", () => {
    // Not a stranger's: the maker of every starter item has a world in the starter set.
    const makers = new Set(JSON.stringify(starterSet).match(/37300:[0-9a-f]{64}/g)?.map((a) => a.split(":")[1]));
    for (const item of STARTER_ITEMS) expect(makers.has(item.split(":")[1]!)).toBe(true);
  });
});
