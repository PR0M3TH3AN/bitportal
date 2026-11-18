/** The worlds a visitor is building and brings their terminals to (src/shared/my-worlds.ts). */
import { describe, expect, it } from "vitest";
import { getPublicKey } from "@nswp/core";
import { addMyWorld, cleanWorldUrl, loadMyWorlds, MY_WORLDS_LIMIT, myWorldsOf, parseMyWorlds, removeMyWorld, storeMyWorlds, type MyWorld } from "../src/shared/my-worlds.js";

const key = (n: number) => getPublicKey(new Uint8Array(32).fill(n));
const ME = key(1);
const PC = key(2);
const world = (url: string, over: Partial<MyWorld> = {}) => ({ url, name: "", computer: PC, owner: ME, addedAt: 1, ...over });

describe("an address someone typed", () => {
  it("is an encrypted site, or their own computer", () => {
    expect(cleanWorldUrl("https://my-world.example/rooms/one?x=1#gone")).toBe("https://my-world.example/rooms/one?x=1");
    expect(cleanWorldUrl("my-world.example")).toBe("https://my-world.example/");
    expect(cleanWorldUrl("localhost:5173")).toBe("http://localhost:5173/");
    expect(cleanWorldUrl(" http://127.0.0.1:5173/ ")).toBe("http://127.0.0.1:5173/");
  });

  it("is never a plain site, a script, or a site with a password in it", () => {
    for (const bad of ["http://my-world.example", "javascript:alert(1)", "https://me:pw@my-world.example", "ftp://x.example", "", "  ", 7, "http://localhost.evil.example"]) expect(cleanWorldUrl(bad), String(bad)).toBeNull();
  });
});

describe("the list", () => {
  it("keeps one entry for a world, by its origin, for the key it belongs to", () => {
    let list = addMyWorld([], world("https://my-world.example/a"))!;
    list = addMyWorld(list, world("https://my-world.example/b", { name: "  The  new\nname " }))!;
    expect(list.length).toBe(1);
    expect(list[0]).toMatchObject({ url: "https://my-world.example/b", origin: "https://my-world.example", name: "The new name" });
    list = addMyWorld(list, world("https://my-world.example/", { owner: key(9) }))!;
    expect(myWorldsOf(list, ME).length).toBe(1);
    expect(myWorldsOf(list, key(9)).length).toBe(1);
    expect(myWorldsOf(list, key(8))).toEqual([]);
    expect(removeMyWorld(list, "https://my-world.example", ME).length).toBe(1);
  });

  it("is named after its address when it is given no name", () => {
    expect(addMyWorld([], world("http://127.0.0.1:5173/"))![0]!.name).toBe("127.0.0.1:5173");
  });

  it("drops what isn't a world, a computer or a key, and holds each key to a few", () => {
    expect(addMyWorld([], world("http://my-world.example"))).toBeNull();
    expect(parseMyWorlds([null, {}, world("https://a.example", { computer: "cd".repeat(32) }), world("https://a.example", { owner: PC }), world("https://b.example")]).map((w) => w.origin)).toEqual(["https://b.example"]);
    let list: MyWorld[] = [];
    for (let n = 0; n < MY_WORLDS_LIMIT; n++) list = addMyWorld(list, world(`https://w${n}.example`))!;
    expect(addMyWorld(list, world("https://one-more.example"))).toBeNull();
    expect(addMyWorld(list, world("https://w3.example/changed"))).not.toBeNull();
  });

  it("comes back as it went, under its own name in this browser", () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    storeMyWorlds(addMyWorld([], world("https://my-world.example/"))!, storage);
    expect([...store.keys()]).toEqual(["bitportal:my-worlds"]);
    expect(loadMyWorlds(storage)[0]!.origin).toBe("https://my-world.example");
    expect(loadMyWorlds({ getItem: () => "{broken" })).toEqual([]);
  });
});
