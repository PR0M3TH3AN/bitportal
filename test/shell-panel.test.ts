import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPanel, type Panel } from "../src/shell/panel.js";

/**
 * The sign-in address's panel, kept between openings (BitLogin's docs/sign-in-window.md, §SW19.8): what this page
 * says to the frame, and when the frame is kept and removed. A page stands in here, just enough of one for
 * panel.ts: elements that can be put in and taken out, and a frame that records what it is told.
 */
const AT = "https://bitlogin.network";
const ROOM = "https://portal.bitblocks.network";
const WORLD = "https://grove.bitblocks.network";

interface El {
  tag: string;
  className: string;
  dataset: Record<string, string>;
  style: { setProperty(k: string, v: string): void };
  children: El[];
  parent: El | null;
  heard: { said: Record<string, unknown>; to: string }[];
  contentWindow: { postMessage(said: Record<string, unknown>, to: string): void };
  listeners: Record<string, (() => void)[]>;
  focused: number;
  [k: string]: unknown;
}
let body: El;
let listeners: Record<string, ((e: unknown) => void)[]>;
const el = (tag: string): El => {
  const e: El = {
    tag,
    className: "",
    dataset: {},
    style: { setProperty() {} },
    children: [],
    parent: null,
    heard: [],
    contentWindow: { postMessage: (said, to) => void e.heard.push({ said, to }) },
    listeners: {},
    focused: 0,
    append(...more: El[]) {
      for (const m of more) {
        m.parent = e;
        e.children.push(m);
      }
    },
    remove() {
      if (e.parent) e.parent.children = e.parent.children.filter((c) => c !== e);
      e.parent = null;
    },
    before(other: El) {
      other.parent = e.parent;
      e.parent!.children.splice(e.parent!.children.indexOf(e), 0, other);
    },
    addEventListener(type: string, fn: () => void) {
      (e.listeners[type] ??= []).push(fn);
    },
    focus() {
      e.focused++;
    },
  };
  return e;
};
const fire = (type: string, e: unknown = {}): void => void (listeners[type] ?? []).forEach((fn) => fn(e));
const frames = (): El[] => body.children.flatMap((c) => c.children).filter((c) => c.tag === "iframe");
const boxes = (): El[] => body.children.filter((c) => c.className === "shell-panel");
const scrims = (): El[] => body.children.filter((c) => c.className === "shell-scrim");
/** BitLogin's page says something from the frame. */
const says = (frame: El, said: Record<string, unknown>, origin = AT): void => fire("message", { source: frame.contentWindow, origin, data: { bitlogin: "bitlogin-panel", v: 1, ...said } });
const last = (frame: El) => frame.heard[frame.heard.length - 1]!;

let panel: Panel;
let told: unknown[];
/** Open it from nothing and have BitLogin's page come up. */
const openCold = (asker: string, mode: "ask" | "wallet" | "account" = "account"): El => {
  panel.show(asker, mode, null);
  const frame = frames()[frames().length - 1]!;
  frame.listeners.load!.forEach((fn) => fn());
  says(frame, { t: "ready" });
  return frame;
};

beforeEach(() => {
  vi.useFakeTimers();
  body = el("body");
  listeners = {};
  told = [];
  Object.assign(globalThis, {
    document: { createElement: el, body },
    addEventListener: (type: string, fn: (e: unknown) => void) => void (listeners[type] ??= []).push(fn),
    innerWidth: 1440,
    innerHeight: 900,
  });
  panel = createPanel({ at: AT, told: (open, more) => void told.push(more ? { open, ...more } : { open }) });
});
afterEach(() => vi.useRealTimers());

describe("the sign-in panel is kept between openings", () => {
  it("is loaded from nothing the first time, told who is asking, and comes up when it says it heard", () => {
    const frame = openCold(WORLD, "ask");
    expect(frame.src).toBe(`${AT}/connect/panel/`);
    expect(frame.heard).toEqual([{ said: { bitlogin: "bitlogin-panel", v: 1, t: "hello", mode: "ask", world: WORLD }, to: AT }]);
    expect(told).toEqual([{ open: true }]);
    expect(panel.open).toBe(true);
  });

  it("is hidden and told so when it closes, with its frame still in the page", () => {
    const frame = openCold(ROOM, "wallet");
    says(frame, { t: "close", allowed: false });
    expect(panel.open).toBe(false);
    expect(panel.kept).toBe(true);
    expect(frames()).toEqual([frame]);
    expect(boxes()[0]!.dataset.kept).toBe("");
    expect(scrims()).toEqual([]);
    expect(last(frame)).toEqual({ said: { bitlogin: "bitlogin-panel", v: 1, t: "hide" }, to: AT });
    expect(told).toEqual([{ open: true }, { open: false, allowed: false }]);
  });

  it("is shown again with `show` for the mode asked, with no new frame, and is up at once", () => {
    const frame = openCold(ROOM, "wallet");
    says(frame, { t: "close" });
    panel.show(ROOM, "account", null);
    expect(frames()).toEqual([frame]);
    expect(last(frame)).toEqual({ said: { bitlogin: "bitlogin-panel", v: 1, t: "show", mode: "account" }, to: AT });
    expect(boxes()[0]!.dataset.kept).toBeUndefined();
    expect(scrims().length).toBe(1);
    expect(told.slice(2)).toEqual([{ open: true }]);
    // It said its size as it drew: it stays, however long it is open.
    says(frame, { t: "size", size: "tall", height: 500 });
    vi.advanceTimersByTime(60_000);
    expect(frames()).toEqual([frame]);
    expect(panel.open).toBe(true);
  });

  it("names the world again when it is shown for a question of the world's", () => {
    const frame = openCold(WORLD, "ask");
    says(frame, { t: "close", allowed: true });
    panel.show(WORLD, "switch", null);
    expect(last(frame).said).toEqual({ bitlogin: "bitlogin-panel", v: 1, t: "show", mode: "switch", world: WORLD });
  });

  it("is told nothing but hello, show and hide, each to the sign-in address alone", () => {
    const frame = openCold(ROOM, "wallet");
    says(frame, { t: "size", size: "tall", height: 400 });
    fire("keydown", { key: "Escape" });
    panel.show(ROOM, "wallet", null);
    says(frame, { t: "size", size: "tall", height: 400 });
    scrims()[0]!.listeners.click!.forEach((fn) => fn());
    fire("resize");
    expect(frame.heard.map((h) => h.said.t)).toEqual(["hello", "hide", "show", "hide"]);
    expect(frame.heard.every((h) => h.to === AT)).toBe(true);
  });

  it("is never shown for another place: a frame kept for one origin is removed, and a new one loaded", () => {
    const first = openCold(ROOM, "wallet");
    says(first, { t: "close" });
    const heard = first.heard.length;
    panel.show(WORLD, "wallet", null);
    expect(frames()).not.toContain(first);
    expect(first.heard.length).toBe(heard);
    expect(frames().length).toBe(1);
    expect(frames()[0]).not.toBe(first);
  });

  it("is removed when the place in the frame becomes another origin's, and kept for a page of the same one", () => {
    const frame = openCold(ROOM, "account");
    says(frame, { t: "close" });
    panel.placeIs(ROOM);
    expect(panel.kept).toBe(true);
    panel.placeIs(WORLD);
    expect(panel.kept).toBe(false);
    expect(frames()).toEqual([]);
  });

  it("is removed after five minutes hidden, and when the page goes, and when it is dropped", () => {
    let frame = openCold(ROOM);
    says(frame, { t: "close" });
    vi.advanceTimersByTime(5 * 60_000 - 1);
    expect(panel.kept).toBe(true);
    vi.advanceTimersByTime(1);
    expect(panel.kept).toBe(false);
    expect(frames()).toEqual([]);

    frame = openCold(ROOM);
    says(frame, { t: "close" });
    fire("pagehide");
    expect(frames()).toEqual([]);

    frame = openCold(ROOM);
    panel.drop();
    expect(panel.open).toBe(false);
    expect(frames()).toEqual([]);
  });

  it("is not heard while hidden, and is heard from nowhere but the sign-in address", () => {
    const frame = openCold(ROOM);
    says(frame, { t: "close" });
    const before = told.length;
    says(frame, { t: "ready" });
    says(frame, { t: "close", allowed: true });
    expect(told.length).toBe(before);
    panel.show(ROOM, "account", null);
    says(frame, { t: "close", allowed: true }, "https://elsewhere.example");
    expect(panel.open).toBe(true);
  });

  it("is loaded anew where a panel shown again never draws: an older panel knows no `show`", () => {
    const old = openCold(ROOM, "wallet");
    says(old, { t: "close" });
    panel.show(ROOM, "wallet", null);
    vi.advanceTimersByTime(1500);
    expect(frames()).not.toContain(old);
    const fresh = frames()[0]!;
    expect(fresh).not.toBe(old);
    fresh.listeners.load!.forEach((fn) => fn());
    expect(fresh.heard[0]!.said).toMatchObject({ t: "hello", mode: "wallet" });
    says(fresh, { t: "ready" });
    // The world was told once that it is up, not twice.
    expect(told.slice(2)).toEqual([{ open: true }]);
    // And that wait is paid once: no frame is kept by this page again.
    says(fresh, { t: "close" });
    expect(panel.kept).toBe(false);
    expect(frames()).toEqual([]);
    expect(fresh.heard.map((h) => h.said.t)).toEqual(["hello"]);
  });

  it("is removed, not kept, where it never came up", () => {
    panel.show(ROOM, "account", null);
    vi.advanceTimersByTime(6000);
    expect(told).toEqual([{ open: false, failed: true }]);
    expect(panel.kept).toBe(false);
    expect(frames()).toEqual([]);
  });
});
