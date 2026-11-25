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
  it("is told to secure the account first where a lasting account is needed, with the press right there", async () => {
    const { SECURE, SECURE_FIRST } = await import("../src/shared/guest.js");
    expect(SECURE_FIRST).toBe("Secure this account first");
    expect(SECURE).toBe("Secure this account");
    const room = await read("src/walk/main.ts");
    expect(room).toContain("if (!signedInKey && guestKey) return `${SECURE_FIRST} to say what you thought of a place.");
    expect(room).toContain("if (!signedInKey && guestKey) return say(`${SECURE_FIRST} to rate a place.`);");
    // The press, under the line: in Rate, under You, and on the computers sheet. No directions in place of it.
    expect(room).toContain('controls.add({ id: "rate-secure", section: "rate", icon: "key", tone: "primary", label: SECURE, short: "Secure", hidden: () => !isGuest(), act: () => void secureHere() });');
    expect(room).not.toMatch(/under You, then Your account/);
    const you = await read("src/walk/you.ts");
    expect(you).toContain('{ id: "identity-secure", section: "you", icon: "key", tone: "primary", label: "Secure this account", short: "Secure", hidden: () => !(o.secure && o.guest?.()), act: () => o.secure?.() },');
    const computers = await read("src/walk/computers.ts");
    expect(computers).toContain("o.guest?.() ? `You're a guest on this browser. ${SECURE_FIRST}, or sign in:");
    expect(computers).toContain("o.guest?.() && o.secure ? [secureButton(), signInButton(\"Sign in\")]");
    expect(computers).toContain("onclick: () => (dialog.close(), o.secure?.())");
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

describe("the guest's pass in the room, made by BitLogin", () => {
  it("is BitLogin's own pass for the session key, checked as any pass is, and refused as anyone else's", async () => {
    const { buildRoomPass, finalizeEvent } = await import("@nswp/core");
    const { issueGuestPass } = await import("../src/shared/pass.js");
    const secret = new Uint8Array(32).fill(7);
    const origin = "https://portal.bitblocks.network";
    // A stand-in for BitLogin's `roomPass`: the whole pass, made and signed there, saying it is a guest.
    const roomPass = async (session: string) => {
      const made = buildRoomPass({ session, origin, createdAt: Math.floor(Date.now() / 1000) });
      return finalizeEvent({ ...made, tags: [...made.tags, ["nswp:guest", "1"]] }, secret);
    };
    const issued = await issueGuestPass(roomPass, guest, origin);
    expect(issued.pass.pubkey).toBe(guest);
    expect(issued.pass.tags).toContainEqual(["nswp:guest", "1"]);
    expect(issued.sessionKey).toMatch(/^[0-9a-f]{64}$/);
    // For another site, or as someone else: not used.
    await expect(issueGuestPass(roomPass, guest, "https://elsewhere.example")).rejects.toThrow();
    await expect(issueGuestPass(roomPass, someone, origin)).rejects.toThrow();
  });
  it("is asked of BitLogin's client only for this browser's guest, and is BitLogin's to write", async () => {
    const session = await read("src/shared/session.ts");
    expect(session).toContain("if (!c?.roomPass || guestOf(state) !== expected) return null;");
    expect(session).toContain('if (pass.pubkey !== expected) throw new SessionError("wrong_identity"');
    const room = await read("src/walk/main.ts");
    expect(room).toContain("roomIdentity = await issueGuestPass(make, pubkey, location.origin);");
    expect(room).not.toMatch(/nswp:guest/);
  });
});

describe("\"Secure this account\", in BitLogin's panel and never a window", () => {
  it("is the panel's own mode, for no world in particular", async () => {
    const { isPanelMode } = await import("../src/shell/panel.js");
    expect(isPanelMode("secure")).toBe(true);
    const panel = await read("src/shell/panel.ts");
    expect(panel).toContain('const ownPage = (mode: PanelMode): boolean => mode === "account" || mode === "files" || mode === "wallet" || mode === "library" || mode === "secure";');
  });
  it("is drawn by BitPortal's own page itself only at BitPortal's own address, with nothing framing it", async () => {
    const { ownPanelOffered } = await import("../src/shared/own-panel.js");
    expect(ownPanelOffered({ origin: "https://portal.bitblocks.network", framed: false })).toBe(true);
    expect(ownPanelOffered({ origin: "https://portal.bitblocks.network", framed: true })).toBe(false);
    expect(ownPanelOffered({ origin: "https://arcade.bitblocks.network", framed: false })).toBe(false);
    expect(ownPanelOffered({ origin: "https://192.168.68.84:4800", framed: false })).toBe(false);
  });
  it("is the panel of the page that keeps the screen first, then the page's own, and says where else when neither can be", async () => {
    const session = await read("src/shared/session.ts");
    expect(session).toContain('const shown = panel?.offered() ? panel.ask("secure") : own?.offered() ? own.show("secure") : null;');
    expect(session).toContain('if (!shown) return "no-panel";');
    const room = await read("src/walk/main.ts");
    expect(room).toContain("const said = await secureAccount({ offered: ownPanelOffered, show: (mode) => showOwnPanel(mode) });");
    expect(room).toContain('if (said === "secured") return readAgain();');
    expect(room).toContain('if (said === "no-panel") controls.say(SECURE_ELSEWHERE);');
  });
});

describe("\"Secure this account\" in the menu over a world", () => {
  it("is under You for a guest, where the world doesn't fill You itself, and opens the panel on it", async () => {
    const menu = await read("src/shell/menu.ts");
    expect(menu).toContain('{ id: "secure", section: "you", icon: "key", tone: "primary", label: "Secure this account", short: "Secure", hidden: () => filledBelow("you") || !!knownSignedIn() || !knownGuest(), act: () => ask("secure") },');
  });
});

describe("a guest's first bag, with the starter items in it (the kit's bag.start)", () => {
  const run = async (results: { ok: boolean; why?: string; said: string }[]) => {
    const kept = new Map<string, string>();
    const store = { getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v) };
    const asked: string[][] = [];
    const said: string[] = [];
    const { startGuestBag } = await import("../src/shared/bag.js");
    const bag = { start: async (items: string[]) => (asked.push(items), results.shift() as never) };
    const go = () => startGuestBag({ bag, guest, items: ["37303:a:x", "37303:a:y"], say: (t) => said.push(t) }, store);
    return { go, asked, said, kept };
  };
  it("is written once, with every starter item in one call, and says the kit's words", async () => {
    const r = await run([{ ok: true, said: "Your bag has 2 things in it." }]);
    await r.go();
    await r.go();
    expect(r.asked).toEqual([["37303:a:x", "37303:a:y"]]);
    expect(r.said).toEqual(["Your bag has 2 things in it."]);
  });
  it("says nothing of a bag already found, and isn't looked for again", async () => {
    const r = await run([{ ok: false, why: "already", said: "You have a bag already." }]);
    await r.go();
    await r.go();
    expect(r.asked.length).toBe(1);
    expect(r.said).toEqual([]);
  });
  it("is tried again next time where it couldn't be, and says why each time", async () => {
    for (const why of ["unreachable", "refused", "not-sent"]) {
      const r = await run([
        { ok: false, why, said: `Not now: ${why}.` },
        { ok: true, said: "Started." },
      ]);
      await r.go();
      await r.go();
      expect(r.asked.length).toBe(2);
      expect(r.said).toEqual([`Not now: ${why}.`, "Started."]);
    }
  });
  it("is started in the room when a guest is first known there, with the starter set", async () => {
    const room = await read("src/walk/main.ts");
    expect(room).toContain("startBag = (guest) => void startGuestBag({ bag: carried.bag, guest, items: STARTER_ITEMS, say: (text) => controls.say(text) }).then(() => baggingTab.refresh());");
    expect(room).toContain("      startBag(guest);");
  });
});
