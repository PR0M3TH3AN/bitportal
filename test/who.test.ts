import { describe, expect, it } from "vitest";
import { buildAirlockUrl, parseAirlockFragment } from "@nswp/core";
import { wayBack } from "../src/account/back.js";
import { crossingFor, type CrossingFacts } from "../src/shared/crossing.js";
import { chooseOnce, doorWithoutWho, forgetWhoDoor, GO_AS_ONCE, keepWhoDoor, readWhoDoor, takeOnce, WHO_DOOR, WHO_DOOR_LASTS, whoDoorFrom } from "../src/shared/who.js";

const store = () => {
  const kept = new Map<string, string>();
  return { kept, getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v), removeItem: (k: string) => void kept.delete(k) };
};
const T = 1_800_000_000_000;
const link = (opts = {}) => new URL(buildAirlockUrl("https://portal.example/go/", { url: "https://garden.example/" }, { who: true, ...opts })).hash;

describe("a world's request to say who you are", () => {
  it("is kept as the door alone, with the request taken out", () => {
    const door = whoDoorFrom(link({ immersive: true, joined: true }), T)!;
    expect(door.host).toBe("garden.example");
    expect(door.hash).not.toContain("who");
    const req = parseAirlockFragment(door.hash)!;
    expect(req).toMatchObject({ url: "https://garden.example/", immersive: true, joined: true });
    expect(req.who).toBeUndefined();
  });

  it("is nothing without the request, and nothing without a door", () => {
    expect(whoDoorFrom(new URL(buildAirlockUrl("https://portal.example/go/", { url: "https://garden.example/" })).hash, T)).toBeNull();
    expect(whoDoorFrom("#who=1", T)).toBeNull();
    expect(whoDoorFrom("#who=1&xr=1", T)).toBeNull();
  });

  it("takes every copy of the request out, so the way back can't ask again", () => {
    expect(doorWithoutWho("#to=x&who=1&xr=1&who=1")).toBe("to=x&xr=1");
    expect(doorWithoutWho("#who=1&to=x&who=yes")).toBe("to=x");
  });

  it("is read back for the tab, and runs out", () => {
    const s = store();
    keepWhoDoor(whoDoorFrom(link(), T)!, s);
    expect(readWhoDoor(s, T + 1000)?.host).toBe("garden.example");
    expect(readWhoDoor(s, T + WHO_DOOR_LASTS + 1)).toBeNull();
    forgetWhoDoor(s);
    expect(readWhoDoor(s, T + 1000)).toBeNull();
  });

  it("reads nothing that isn't a door it could have kept", () => {
    const s = store();
    for (const sly of ['{"hash":"who=1&to=https%3A%2F%2Fgarden.example%2F","host":"garden.example","at":' + T + "}", '{"hash":"xr=1","host":"","at":' + T + "}", '{"hash":"https://evil.example/","host":"x","at":' + T + "}", "not json", '{"hash":5}', "null"]) {
      s.setItem(WHO_DOOR, sly);
      expect(readWhoDoor(s, T)).toBeNull();
    }
  });
});

describe("the way back to a world from the sign-in page", () => {
  const door = whoDoorFrom(link(), T)!;
  it("leads to this site's own Airlock and nowhere else", () => {
    const back = wayBack("?back=door", door);
    expect(back.href).toBe(`/go/#${door.hash}`);
    expect(back.href!.startsWith("/go/#")).toBe(true);
    expect(back).toMatchObject({ label: "Back to garden.example", guest: "Go back as a guest", named: "Back to garden.example, by name" });
  });
  it("is the lobby when no door was kept, whatever the link says", () => {
    expect(wayBack("?back=door").href).toBe("/doors/");
    expect(wayBack("?back=door&to=https://evil.example/").href).toBe("/doors/");
    expect(wayBack("?back=door#to=https://evil.example/").href).toBe("/doors/");
  });
  it("is not offered for any other way of coming here", () => {
    expect(wayBack("?back=walk", door).href).toBe("/walk/#back");
    expect(wayBack("", door).href).toBe("/doors/");
    expect(wayBack("", door).door).toBeUndefined();
  });
});

describe("what they pressed on the sign-in page", () => {
  const door = whoDoorFrom(link(), T)!;
  it("is used once, at the door it was pressed for", () => {
    const s = store();
    chooseOnce("name", door, s);
    expect(takeOnce(`#${door.hash}`, s)).toBe("name");
    expect(takeOnce(`#${door.hash}`, s)).toBeNull();
  });
  it("is never used at another door, and is gone once looked at", () => {
    const s = store();
    chooseOnce("name", door, s);
    expect(takeOnce("#to=https%3A%2F%2Felsewhere.example%2F", s)).toBeNull();
    expect(s.kept.has(GO_AS_ONCE)).toBe(false);
  });
  it("is nothing a link could say: only what was kept counts", () => {
    const s = store();
    expect(takeOnce(`#${door.hash}&as=name`, s)).toBeNull();
    s.setItem(GO_AS_ONCE, JSON.stringify({ how: "owner", hash: door.hash }));
    expect(takeOnce(`#${door.hash}`, s)).toBeNull();
  });
});

describe("asking for a name that can't be given", () => {
  const known: CrossingFacts = { verified: true, onList: true, beenBefore: true, approved: false, askAlways: false, publisherChanged: false, warnings: 0, asking: 0, fit: "ok", setting: "known", held: false };
  it("stops at the Airlock, even at a place they know", () => {
    expect(crossingFor(known)).toBe("straight");
    expect(crossingFor({ ...known, unmet: true })).toBe("ask");
    expect(crossingFor({ ...known, approved: true, onList: false, unmet: true })).toBe("ask");
  });
});
