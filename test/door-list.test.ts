import { describe, expect, it } from "vitest";
import { buttonsFor, filterRows, hitAt, pageOf, ROWS, type DoorRow } from "../src/walk/door-list.js";

const row = (title: string, host: string, more: Partial<DoorRow> = {}): DoorRow => ({ id: `37300:${"a".repeat(64)}:${title}`, title, host, summary: "", topics: [], saved: false, ...more });
const rows = [
  row("The Gallery", "gallery.bitblocks.network", { summary: "Sculptures made in code.", topics: ["art", "reference"] }),
  row("The Grove", "grove.bitblocks.network", { summary: "A wood at dusk.", topics: ["quiet"] }),
  row("The Arcade", "arcade.bitblocks.network", { summary: "Three small games.", topics: ["games"], saved: true }),
];

describe("looking for a door on the list", () => {
  it("shows every door when nothing is asked for", () => {
    expect(filterRows(rows, "")).toHaveLength(3);
    expect(filterRows(rows, "   ")).toHaveLength(3);
  });

  it("finds a door by its name, its address, its line or its topics, whatever the case", () => {
    expect(filterRows(rows, "grove").map((r) => r.title)).toEqual(["The Grove"]);
    expect(filterRows(rows, "ARCADE.bitblocks").map((r) => r.title)).toEqual(["The Arcade"]);
    expect(filterRows(rows, "sculptures").map((r) => r.title)).toEqual(["The Gallery"]);
    expect(filterRows(rows, "games").map((r) => r.title)).toEqual(["The Arcade"]);
  });

  it("wants every word asked for, and finds nothing for a door that isn't there", () => {
    expect(filterRows(rows, "the bitblocks")).toHaveLength(3);
    expect(filterRows(rows, "the dusk").map((r) => r.title)).toEqual(["The Grove"]);
    expect(filterRows(rows, "casino")).toEqual([]);
  });
});

describe("the list's pages", () => {
  const many = Array.from({ length: 14 }, (_, i) => i);
  it("holds a few doors each, and the last holds what is left", () => {
    expect(pageOf(many, 0)).toEqual({ rows: [0, 1, 2, 3, 4, 5], page: 0, pages: 3 });
    expect(pageOf(many, 2)).toEqual({ rows: [12, 13], page: 2, pages: 3 });
    expect(ROWS).toBe(6);
  });

  it("is the nearest page there is when asked for one there isn't", () => {
    expect(pageOf(many, 9).page).toBe(2);
    expect(pageOf(many, -3).page).toBe(0);
    expect(pageOf(many, Number.NaN).page).toBe(0);
    expect(pageOf([], 4)).toEqual({ rows: [], page: 0, pages: 1 });
  });

  it("offers only the buttons that lead somewhere", () => {
    expect(buttonsFor(0, 1, "")).toEqual(["find"]);
    expect(buttonsFor(0, 3, "")).toEqual(["later", "find"]);
    expect(buttonsFor(1, 3, "")).toEqual(["earlier", "later", "find"]);
    expect(buttonsFor(2, 3, "grove")).toEqual(["earlier", "find", "all"]);
  });
});

describe("what a press on the list is on", () => {
  // The picture is 1170 tall: a head of 150, a bar of buttons of 120, then six rows of 150.
  const y = (px: number) => px / 1170;
  const rowsTop = 270;
  it("is a row, by its place on the page, when there is a door there", () => {
    expect(hitAt(0.5, y(rowsTop + 75), 3, ["find"])).toEqual({ row: 0 });
    expect(hitAt(0.1, y(rowsTop + 2 * 150 + 10), 3, ["find"])).toEqual({ row: 2 });
    expect(hitAt(0.9, y(rowsTop + 5 * 150 + 140), 6, ["find"])).toEqual({ row: 5 });
    // The fourth place is empty on a page of three: nothing.
    expect(hitAt(0.5, y(rowsTop + 3 * 150 + 75), 3, ["find"])).toBeNull();
  });

  it("is a button only when that button is there", () => {
    const bar = y(150 + 60);
    expect(hitAt(0.125, bar, 6, ["earlier", "later", "find"])).toEqual({ button: "earlier" });
    expect(hitAt(0.375, bar, 6, ["earlier", "later", "find"])).toEqual({ button: "later" });
    expect(hitAt(0.625, bar, 6, ["later", "find"])).toEqual({ button: "find" });
    expect(hitAt(0.125, bar, 6, ["later", "find"])).toBeNull();
    expect(hitAt(0.875, bar, 6, ["find"])).toBeNull();
  });

  it("is nothing on the head, between two buttons, or off the picture", () => {
    expect(hitAt(0.5, y(60), 6, ["find"])).toBeNull();
    expect(hitAt(0.25, y(150 + 60), 6, ["earlier", "later", "find"])).toBeNull();
    expect(hitAt(1.2, 0.5, 6, ["find"])).toBeNull();
    expect(hitAt(Number.NaN, 0.5, 6, ["find"])).toBeNull();
  });
});
