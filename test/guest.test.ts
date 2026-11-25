// A guest (BitLogin docs/guest-accounts.md): the account BitLogin makes for a visitor who arrived signed out, the same
// in every bitblocks.network site. The owner, 2026-11-25: the bag "should be available with our starter items to any
// guest". A guest is nobody here for everything but its bag, which BitLogin signs for it with no press (G4).
import { afterEach, describe, expect, it } from "vitest";
import { getPublicKey } from "@nswp/core";
import { guestOf, knownGuest } from "../src/shared/session.js";
import { homeBag } from "../src/shared/bag.js";

const key = (n: number) => getPublicKey(new Uint8Array(32).fill(n));
const guest = key(7);
const someone = key(9);
const read = async (path: string): Promise<string> => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("which guest this browser is", () => {
  it("is the guest BitLogin says, only where nobody is signed in, and only a public key", () => {
    expect(guestOf({ signedIn: false, guest: true, pubkey: guest })).toBe(guest);
    expect(guestOf({ signedIn: true, guest: true, pubkey: guest })).toBeNull();
    expect(guestOf({ signedIn: false, pubkey: guest })).toBeNull();
    expect(guestOf({ signedIn: false, guest: true, pubkey: "not a key" })).toBeNull();
    expect(guestOf({ signedIn: false, guest: true })).toBeNull();
    expect(guestOf(null)).toBeNull();
  });

  describe("from this browser's own note of it, for the page that keeps the screen", () => {
    const kept = new Map<string, string>();
    const store = { getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v), removeItem: (k: string) => void kept.delete(k) };
    afterEach(() => {
      kept.clear();
      delete (globalThis as { localStorage?: unknown }).localStorage;
    });
    it("is none where nothing was kept, or nothing can be", () => {
      expect(knownGuest()).toBeNull();
      (globalThis as { localStorage?: unknown }).localStorage = store;
      expect(knownGuest()).toBeNull();
    });
    it("is the guest kept, and none where someone is signed in: an account wins", () => {
      (globalThis as { localStorage?: unknown }).localStorage = store;
      kept.set("bitportal:guest", JSON.stringify({ pubkey: guest }));
      expect(knownGuest()).toBe(guest);
      kept.set("bitportal:signed-in", JSON.stringify({ pubkey: someone, until: 0 }));
      expect(knownGuest()).toBeNull();
      kept.delete("bitportal:signed-in");
      kept.set("bitportal:guest", JSON.stringify({ pubkey: "not a key" }));
      expect(knownGuest()).toBeNull();
    });
    it("is written with who is signed in, and gone once they are", async () => {
      const src = await read("src/shared/session.ts");
      expect(src).toContain("if (guest) localStorage.setItem(GUEST_RECORD, JSON.stringify({ pubkey: guest }));");
      expect(src).toContain("else localStorage.removeItem(GUEST_RECORD);");
    });
  });
});

describe("a guest's bag at home", () => {
  const made = (o: { guest: boolean; asked?: string[] }) => {
    const used: string[] = [];
    const bag = homeBag({
      me: () => (o.guest ? guest : someone),
      guest: () => o.guest,
      relays: [],
      signerFor: async () => (used.push("account"), null),
      guestSignerFor: async () => (used.push("guest"), null),
      say: () => {},
      presenting: () => false,
    });
    return { bag, used };
  };
  it("may be changed with nothing asked: BitLogin signs a guest's bag unasked", () => {
    expect(made({ guest: true }).bag.allowed()).toBe(true);
  });
  it("is still asked for, once, for someone signed in", () => {
    expect(made({ guest: false }).bag.allowed()).toBe(false);
  });
  it("is signed by the guest's own signer, never the account's", async () => {
    const src = await read("src/shared/bag.ts");
    expect(src).toContain("const quiet = me ? await (o.guest() ? o.guestSignerFor(me) : o.signerFor(me)) : null;");
  });
  it("is the guest's in the room only where nobody is signed in, and nothing else in the room is", async () => {
    const room = await read("src/walk/main.ts");
    expect(room).toContain("const bagKey = (): string | null => (signedInKey ? (goesAsGuest() ? null : signedInKey) : guestKey);");
    expect(room).toContain("guest: () => !signedInKey && !!guestKey");
    // Follows and messages stay with who is signed in.
    expect(room).toContain("const follows = homeFollows({ me: () => (goesAsGuest() ? null : signedInKey),");
  });
});

describe("a guest is themselves in the room (the owner: \"the same guest in every world\")", () => {
  it("is named by the kit's own words for its key, the same in the room and every world", async () => {
    const { guestName: kits } = await import("@nswp/core");
    const { guestName: ours } = await import("../src/shared/guest.js");
    expect(ours).toBe(kits);
    expect(ours(guest)).toBe(ours(guest));
    const room = await read("src/walk/main.ts");
    expect(room).toContain('return { title: guestName(guestKey), tag: "Guest", proven: false,');
  });
  it("posts as itself, signed by the guest's own signer, and is put no deletion it can't reach", async () => {
    const room = await read("src/walk/main.ts");
    expect(room).toContain("signerFor: (pubkey) => (isGuest(pubkey) ? quietGuestSigner(pubkey) : quietSigner(pubkey)),");
    expect(room).toContain("propose: (note) => (isGuest() ? Promise.resolve(null) : proposeToPerson(note)),");
    expect(room).toContain("homeNotes.setWho(guestKey);");
  });
  it("is told to secure the account first where a lasting account is needed, with where to do it", async () => {
    const { SECURE_FIRST, SECURE_WHERE } = await import("../src/shared/guest.js");
    expect(SECURE_FIRST).toBe("Secure this account first");
    expect(SECURE_WHERE).toBe("under You, then Your account");
    const room = await read("src/walk/main.ts");
    expect(room).toContain("if (!signedInKey && guestKey) return `${SECURE_FIRST} (${SECURE_WHERE}) to say what you thought of a place.");
    expect(room).toContain("if (!signedInKey && guestKey) return say(`${SECURE_FIRST} to rate a place:");
    const computers = await read("src/walk/computers.ts");
    expect(computers).toContain("o.guest?.() ? `You're a guest on this browser. ${SECURE_FIRST} (${SECURE_WHERE}), or sign in:");
  });
  it("is told who it is under You in BitLogin's words, and in Brave that the browser forgets guests", async () => {
    const { guestNote, isBrave } = await import("../src/shared/guest.js");
    expect(guestNote(false)).toBe("You're a guest. Every world in BitPortal knows it's the same guest. This account lives in this browser only. Clearing this site's data loses it.");
    expect(guestNote(true)).toBe("You're a guest. Every world in BitPortal knows it's the same guest. This browser forgets guests when it closes. Secure this account to keep it.");
    expect(isBrave({ brave: {} })).toBe(true);
    expect(isBrave({})).toBe(false);
    expect(isBrave(undefined)).toBe(false);
  });
});
