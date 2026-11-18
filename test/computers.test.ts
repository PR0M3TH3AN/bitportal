/** The computers a visitor has added to their home (src/shared/computers.ts). */
import { describe, expect, it } from "vitest";
import { encodeNpub, getPublicKey } from "@nswp/core";
import { addComputer, cleanBridgeRelays, COMPUTER_LIMIT, computersOf, loadComputers, pairingRequest, parseComputers, removeComputer, storeComputers, type Computer } from "../src/shared/computers.js";

/** A real public key for each number: a key somebody could hold. */
const key = (n: number) => getPublicKey(new Uint8Array(32).fill(n));
/** The right length and letters, and no key at all. */
const NOT_A_KEY = "cd".repeat(32);
const ME = key(1);
const pc = (n: number, over: Partial<Computer> = {}): Computer => ({ pubkey: key(n), owner: ME, name: `Computer ${n}`, relays: [], addedAt: n, ...over });

describe("a pairing link", () => {
  it("names a Bridge by its key, as the Bridge prints it", () => {
    expect(pairingRequest(`#bridge=${encodeNpub(key(7))}`)).toEqual({ pubkey: key(7), relays: [] });
    expect(pairingRequest(`bridge=${key(7)}`)).toEqual({ pubkey: key(7), relays: [] });
  });

  it("may say where the Bridge listens, over encrypted connections only", () => {
    const r = pairingRequest(`#bridge=${key(7)}&relay=wss%3A%2F%2Fone.example&relay=ws://plain.example&relay=https://not-a-relay.example&relay=wss://two.example/`);
    expect(r?.relays).toEqual(["wss://one.example", "wss://two.example"]);
    expect(cleanBridgeRelays(["wss://user:pass@x.example", "wss://a.example", "wss://a.example/", "wss://b.example", "wss://c.example", "wss://d.example", "wss://e.example"]).length).toBe(4);
  });

  it("asks nothing when there is no key, or not a key", () => {
    for (const hash of ["", "#back", "#back&xr=1", "#bridge=", "#bridge=npub1nonsense", "#bridge=hello", `#room=${key(7)}`, `#bridge=${NOT_A_KEY}`, `#bridge=${encodeNpub(NOT_A_KEY)}`]) expect(pairingRequest(hash), hash).toBeNull();
  });
});

describe("what is kept", () => {
  it("comes back as it went, for the key it belongs to", () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    const list = addComputer(addComputer([], pc(2))!, pc(3, { owner: key(9) }))!;
    storeComputers(list, storage);
    expect([...store.keys()]).toEqual(["bitportal:computers"]);
    expect(computersOf(loadComputers(storage), ME)).toEqual([pc(2)]);
    expect(computersOf(loadComputers(storage), key(9)).map((c) => c.pubkey)).toEqual([key(3)]);
    expect(computersOf(loadComputers(storage), key(8))).toEqual([]);
  });

  it("drops anything that isn't a computer", () => {
    expect(parseComputers("nope")).toEqual([]);
    expect(parseComputers([null, {}, { pubkey: "zz", owner: ME }, { pubkey: key(2), owner: "me" }, { pubkey: ME, owner: ME }, { ...pc(3), pubkey: NOT_A_KEY }, { ...pc(3), owner: NOT_A_KEY }, pc(4), pc(4)])).toEqual([pc(4)]);
    // A name is one tidy line, and there is always one.
    expect(parseComputers([pc(5, { name: "  Desk\n\u202e  PC  " }), pc(6, { name: "" })]).map((c) => c.name)).toEqual(["Desk PC", "My computer"]);
    expect(parseComputers([pc(5, { name: "x".repeat(99) })])[0]!.name.length).toBe(32);
    expect(loadComputers({ getItem: () => "{not json" })).toEqual([]);
  });

  it("renames a computer added twice, and holds each key to a few", () => {
    let list: Computer[] = [];
    for (let n = 2; n < 2 + COMPUTER_LIMIT; n++) list = addComputer(list, pc(n))!;
    expect(addComputer(list, pc(50))).toBeNull();
    const renamed = addComputer(list, pc(3, { name: "Laptop" }))!;
    expect(computersOf(renamed, ME).length).toBe(COMPUTER_LIMIT);
    expect(renamed.find((c) => c.pubkey === key(3))!.name).toBe("Laptop");
    // Another key's computers don't count against this one's.
    expect(addComputer(list, pc(50, { owner: key(9) }))).not.toBeNull();
    expect(removeComputer(list, key(3), ME).length).toBe(COMPUTER_LIMIT - 1);
    expect(removeComputer(list, key(3), key(9)).length).toBe(COMPUTER_LIMIT);
  });
});
