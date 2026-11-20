/**
 * The visitor's own computers, in their room: add one from the link its
 * Bridge prints, and open a terminal on it in a panel (NSWP's
 * browser/bridge.md).
 *
 * A terminal runs commands on the visitor's computer, so this is the most
 * careful part of the room:
 *
 * - A computer is added only on a flat screen, where its whole key can be
 *   read, and only by the visitor pressing the button. A link can ask; it
 *   can't add.
 * - Each terminal needs a grant signed by the visitor's key. The signer is
 *   BitLogin's headless one, which restores a session and can't start one;
 *   it is asked for a grant and nothing else.
 * - The Bridge asks at the computer before it opens anything. This page can't
 *   answer for the visitor.
 * - None of it is offered to a world. A world is never given the visitor's
 *   signer, their panels or this list.
 */
import { buildWorldGrant, DEFAULT_RELAYS, encodeNpub, finalizeEvent, getPublicKey, packBrought, shortNpub, verifyWorldGrant, type EventTemplate, type NostrEvent } from "@nswp/core";
import { wasRefreshed, type Panels } from "nswp-sdk/three";
import type { Controls } from "nswp-sdk/ui";
import type { TerminalPanel } from "nswp-sdk/terminal";
import { addComputer, computersOf, loadComputers, pairingRequest, removeComputer, storeComputers, type Computer, type PairingRequest } from "../shared/computers.js";
import { addMyWorld, cleanWorldUrl, loadMyWorlds, myWorldsOf, removeMyWorld, storeMyWorlds, type MyWorld } from "../shared/my-worlds.js";
import { checkedSigner, holdsReserved, quietSigner, readSignedIn, type Signer } from "../shared/session.js";

const GUIDE = "https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/browser/bridge.md";

export interface ComputersOptions {
  controls: Controls;
  panels: () => Panels | undefined;
  presenting: () => boolean;
  /** The visitor's own relays, tried as well as the usual ones. */
  relays: () => string[];
  accent: number;
}

export interface Computers {
  /** Act on a pairing link, if the address is one. Returns true if it was. */
  fromAddress(hash: string): boolean;
  /**
   * For tests: stand in a throwaway identity, made in this page, and return
   * its public key. Nothing in an address can do this. A test that refreshes
   * the page hands back the key it was given, to be the same visitor again.
   */
  useTestIdentity(secretKey?: Uint8Array): string;
  /** Bring back the terminals that were open before a refresh, one at a time. Done by itself when the page comes up; here for a test. */
  restore(): Promise<void>;
  list(): Computer[];
  /** The worlds this visitor is building and brings their terminals to. */
  worlds(): MyWorld[];
  /**
   * Go to one of them, with leave for it to open terminals on the visitor's
   * computer. Resolves with the address gone to, or null if it couldn't be
   * done. `stay` makes the address without going, for a test to read.
   */
  bringTo(origin: string, stay?: boolean): Promise<string | null>;
  /** The open terminals, oldest first. */
  terminals(): TerminalPanel[];
}

/** How many terminals may be open on one computer at once: as many as its Bridge keeps. */
export const TERMINALS_EACH = 4;
const LETTERS = "bitportal:terminal-letters";
/** Which terminals are open, and how each hangs: for this tab only, so that a refresh brings them back as they were. */
const OPEN = "bitportal:terminals-open";

interface Hung {
  pubkey: string;
  place: unknown;
  look: unknown;
  pin: unknown;
  cols: number;
}

/** How many letters across the visitor last chose, on a flat screen and in a headset. Kept in this browser. */
function lettersKept(): { flat?: number; headset?: number } {
  try {
    const kept = JSON.parse(localStorage.getItem(LETTERS) ?? "{}") as { flat?: unknown; headset?: unknown };
    const ok = (n: unknown) => (typeof n === "number" && n >= 40 && n <= 200 ? n : undefined);
    const [flat, headset] = [ok(kept.flat), ok(kept.headset)];
    return { ...(flat ? { flat } : {}), ...(headset ? { headset } : {}) };
  } catch {
    return {};
  }
}

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
};

export function addComputers(o: ComputersOptions): Computers {
  const { controls } = o;
  const dialog = document.getElementById("pair") as HTMLDialogElement;
  const open: { pubkey: string; term: TerminalPanel }[] = [];
  let test: { pubkey: string; signer: Signer } | null = null;
  let who: string | null = null;
  let shown: string[] = [];

  controls.addSection({
    id: "computers",
    label: "Your computers",
    icon: "panel",
    note: () => (o.presenting() ? "Open a terminal on a computer of yours. It asks at that computer before it opens." : "A terminal on your own computer, in a panel here. The computer answers your key and nobody else's, and asks there before it opens."),
  });

  /** Who is signed in, from BitLogin's public record. Nothing is asked of them. */
  const identify = async (): Promise<string | null> => {
    who = test ? test.pubkey : ((await readSignedIn())?.pubkey ?? null);
    return who;
  };

  const sheet = (...content: (Node | string)[]) => {
    dialog.replaceChildren(...content);
    if (!dialog.open) dialog.showModal();
  };
  const closeButton = (label: string) => el("button", { className: "button", type: "button", textContent: label, onclick: () => dialog.close() });

  const explain = () => {
    const me = who ? encodeNpub(who) : "npub1…";
    sheet(
      el("h2", { textContent: "A terminal on your own computer" }),
      el("p", { className: "lede", textContent: "Run a small program, the Bridge, on a computer of yours. It answers your key and nobody else's, and you can open a terminal on it from a panel in this room: in a headset, or here." }),
      el("p", { textContent: "From a copy of the NSWP repository on that computer:" }),
      el("p", { className: "detail-host", textContent: `npm run bridge -- --owner ${me}` }),
      el("p", { textContent: "It prints a link. Open the link in this browser to add the computer here." }),
      el("p", { className: "why", textContent: "A terminal can do anything you can do on that computer. The Bridge asks there, on its own screen, before each one opens." }),
      el("p", { className: "why", textContent: "Add --tmux for terminals that carry on when this page is closed or refreshed, and --voice to speak instead of typing: your computer turns what you say into text itself, and your voice goes nowhere else." }),
      ...(who ? [] : [el("p", { className: "verify verify-warn", textContent: "You aren't signed in on this browser. Sign in on the front page first: the computer needs to know whose it is." })]),
      el("div", { className: "actions" }, el("a", { className: "button", href: GUIDE, target: "_blank", rel: "noopener noreferrer", textContent: "What it trusts, and how it works" }), closeButton("Close")),
    );
  };

  const offer = (ask: PairingRequest) => {
    if (!who) {
      return sheet(
        el("h2", { textContent: "Sign in first" }),
        el("p", { className: "lede", textContent: "This link adds a computer to your home. A computer answers one key, so this browser needs to know which is yours." }),
        el("p", { textContent: "Sign in on the front page, then open the link again." }),
        el("div", { className: "actions" }, el("a", { className: "button primary", href: "/", textContent: "Go to the front page" }), closeButton("Not now")),
      );
    }
    const owner = who;
    const known = computersOf(loadComputers(), owner).find((c) => c.pubkey === ask.pubkey);
    const name = el("input", { type: "text", id: "pair-name", maxLength: 32, value: known?.name ?? "My computer" });
    const add = el("button", { className: "button primary", type: "button", textContent: known ? "Keep it, with this name" : "Add this computer" });
    add.onclick = () => {
      const next = addComputer(loadComputers(), { pubkey: ask.pubkey, owner, name: name.value, relays: ask.relays, addedAt: Math.floor(Date.now() / 1000) });
      if (!next) {
        add.disabled = true;
        add.textContent = "You have as many as are kept. Forget one first.";
        return;
      }
      storeComputers(next);
      dialog.close();
      refresh();
      controls.say("Added. It is under Your computers.");
    };
    sheet(
      el("h2", { textContent: known ? "This computer is already in your home" : "Add this computer to your home?" }),
      el("p", { className: "detail-host", textContent: encodeNpub(ask.pubkey) }),
      el("p", { className: "verify verify-warn", textContent: "Only add a computer you started the Bridge on yourself. This should be the key it printed, letter for letter. A terminal on someone else's computer would show them everything you typed into it." }),
      el("p", { textContent: `It will answer ${shortNpub(owner)}, the key signed in here, and nobody else. Each time you open a terminal it asks at the computer first, and shows a code that should match the one on the panel.` }),
      ...(ask.relays.length ? [el("p", { className: "why", textContent: `It listens at ${ask.relays.map((r) => new URL(r).host).join(", ")}.` })] : []),
      el("label", { htmlFor: "pair-name", textContent: "What do you call it?" }),
      name,
      el("div", { className: "actions" }, closeButton("Not now"), add),
    );
  };

  const signer = async (owner: string): Promise<{ signer: Signer; close(): void } | null> => (test ? { signer: test.signer, close: () => {} } : quietSigner(owner));
  /** A grant is one of the kinds BitLogin signs for BitPortal's own address and no other (session.ts). */
  const NO_GRANT_HERE = `A grant for a computer can't be signed at this address: your sign-in signs one only for BitPortal's own.`;

  /** Note how each open terminal hangs. Kept for this tab, and only so a refresh can put them back. */
  const noteOpen = () => {
    try {
      const hung: Hung[] = open.map(({ pubkey, term }) => ({ pubkey, place: term.panel.place(), look: term.panel.look, pin: term.panel.pin, cols: term.size.cols }));
      sessionStorage.setItem(OPEN, JSON.stringify(hung));
    } catch {
      /* not kept: after a refresh they are opened by hand */
    }
  };
  addEventListener("pagehide", noteOpen);

  const openTerminal = async (c: Computer, as?: Hung): Promise<TerminalPanel | null> => {
    const panels = o.panels();
    const no = (why: string) => {
      controls.say(why);
      return null;
    };
    if (!panels) return null;
    if (open.filter((t) => t.pubkey === c.pubkey).length >= TERMINALS_EACH) return no(`${TERMINALS_EACH} terminals are open on ${c.name}. Put one away first.`);
    if (!test && !holdsReserved()) return no(NO_GRANT_HERE);
    if ((await identify()) !== c.owner) return no("Sign in on the front page first, as the key this computer answers.");
    const quiet = await signer(c.owner);
    if (!quiet) return no("Your sign-in has run out here. Sign in again on the front page, then try again.");
    try {
      // The terminal's code is fetched now, the first time one is opened, and not before.
      const { openTerminalPanel } = await import("nswp-sdk/terminal");
      const headset = o.presenting();
      const term = openTerminalPanel({
        panels,
        bridge: c.pubkey,
        owner: c.owner,
        sign: (template: EventTemplate): Promise<NostrEvent> => quiet.signer.signEvent(template),
        relays: [...new Set([...c.relays, ...(c.relays.length ? [] : [...DEFAULT_RELAYS, ...o.relays()])])].slice(0, 8),
        name: c.name,
        // Fewer, larger letters in a headset, where the panel is read from a step away; or what they chose last time.
        cols: as?.cols ?? (headset ? lettersKept().headset : lettersKept().flat) ?? (headset ? 80 : 100),
        // Back as it hung before a refresh: where, how see-through, and whether pinned in the view.
        ...(as?.place && typeof as.place === "object" ? { place: as.place as object } : {}),
        ...(as?.look && typeof as.look === "object" ? { look: as.look as object } : {}),
        ...(Array.isArray(as?.pin) ? { pin: as.pin as [number, number, number] } : {}),
        onColumns(cols) {
          try {
            localStorage.setItem(LETTERS, JSON.stringify({ ...lettersKept(), [headset ? "headset" : "flat"]: cols }));
          } catch {
            /* not kept this time */
          }
        },
        accent: o.accent,
        presenting: o.presenting,
        onStatus(status) {
          if (status.at === "asking") controls.say(`Say yes at ${c.name}. The code is ${status.code}.`);
        },
        onClosed() {
          const at = open.findIndex((t) => t.term === term);
          if (at >= 0) open.splice(at, 1);
          quiet.close();
          noteOpen();
        },
      });
      open.push({ pubkey: c.pubkey, term });
      noteOpen();
      return term;
    } catch {
      quiet.close();
      return no("The terminal couldn't be opened. Put a panel away and try again.");
    }
  };

  /**
   * After a refresh, the terminals that were open come back where they hung. Each needs its own grant, and its
   * computer asks for each unless it was told not to for a while, so they are opened one at a time.
   */
  const restore = async () => {
    let hung: Hung[] = [];
    try {
      const kept: unknown = JSON.parse(sessionStorage.getItem(OPEN) ?? "[]");
      if (Array.isArray(kept)) hung = (kept as Hung[]).filter((h) => h && typeof h.pubkey === "string" && typeof h.cols === "number").slice(0, TERMINALS_EACH * 2);
    } catch {
      return;
    }
    if (!hung.length || open.length) return;
    const mine = who ? computersOf(loadComputers(), who) : [];
    for (const h of hung) {
      const c = mine.find((x) => x.pubkey === h.pubkey);
      const term = c ? await openTerminal(c, h) : null;
      if (!term) continue;
      // Wait for this one to be let in, or turned away, before asking for the next.
      await new Promise<void>((done) => {
        const started = Date.now();
        const look = setInterval(() => {
          const at = term.status.at;
          if (at === "open" || at === "closed" || at === "ended" || Date.now() - started > 90_000) {
            clearInterval(look);
            done();
          }
        }, 250);
      });
    }
  };

  // ----------------------------------------------------- a world of the visitor's own
  /**
   * Go to a world the visitor is building, handing it leave to open terminals on their computer. This is the one
   * place a world is given anything of the kind, so it is done for worlds on the visitor's own list and no others,
   * with a grant made for that world's address alone, signed now and good for some hours.
   */
  const bringTo = async (origin: string, stay = false): Promise<string | null> => {
    const no = (why: string) => {
      controls.say(why);
      return null;
    };
    if (!test && !holdsReserved()) return no(NO_GRANT_HERE);
    const owner = await identify();
    const world = owner ? myWorldsOf(loadMyWorlds(), owner).find((w) => w.origin === origin) : undefined;
    const computer = world && owner ? computersOf(loadComputers(), owner).find((c) => c.pubkey === world.computer) : undefined;
    if (!owner || !world) return no("That isn't one of the worlds you are building.");
    if (!computer) return no("The computer for that world has been forgotten. Name the world again.");
    const quiet = await signer(owner);
    if (!quiet) return no("Your sign-in has run out here. Sign in again on the front page, then try again.");
    try {
      const secret = crypto.getRandomValues(new Uint8Array(32));
      const session = getPublicKey(secret);
      const grant = await quiet.signer.signEvent(buildWorldGrant({ session, bridge: computer.pubkey, world: world.origin }));
      // Checked the way the computer will check it, before it leaves this page.
      if (!verifyWorldGrant(grant, { owner, bridge: computer.pubkey, session, worlds: [world.origin] }).ok) return no("The permission that was signed wouldn't be believed, so it wasn't used.");
      const brought = packBrought({ grant, sessionKey: [...secret].map((b) => b.toString(16).padStart(2, "0")).join(""), bridge: computer.pubkey, name: computer.name, relays: computer.relays, immersive: o.presenting() });
      // After the #, which no server is sent. The world takes it out of its address at once.
      const to = `${world.url}#nswp-bring=${brought}`;
      if (!stay) location.assign(to);
      return to;
    } catch {
      return no("Your key didn't sign it. Check you are still signed in.");
    } finally {
      quiet.close();
    }
  };

  /** Name a world as one the visitor is building. Only here, only on a flat screen, only by their own typing and pressing. */
  const nameWorld = () => {
    if (!who) return explain();
    const owner = who;
    const mine = computersOf(loadComputers(), owner);
    if (!mine.length) return explain();
    const address = el("input", { type: "url", id: "world-address", placeholder: "http://127.0.0.1:5173 or https://my-world.example" });
    const name = el("input", { type: "text", id: "world-name", maxLength: 32, placeholder: "What you call it" });
    const pick = el("select", { id: "world-computer" }, ...mine.map((c) => el("option", { value: c.pubkey, textContent: c.name })));
    const command = el("p", { className: "detail-host", textContent: "npm run bridge -- --world <its address>" });
    const problem = el("p", { className: "verify verify-warn", hidden: true });
    address.oninput = () => {
      problem.hidden = true; // what was wrong with the last address says nothing about this one
      const url = cleanWorldUrl(address.value);
      command.textContent = `npm run bridge -- --tmux --voice --world ${url ? new URL(url).origin : "<its address>"}`;
    };
    const keep = el("button", { className: "button primary", type: "button", textContent: "This world is mine" });
    keep.onclick = () => {
      const url = cleanWorldUrl(address.value);
      if (!url) {
        problem.hidden = false;
        problem.textContent = "That isn't an address a world of yours could have. It must be https, or on this computer (http://127.0.0.1 or http://localhost).";
        return;
      }
      const next = addMyWorld(loadMyWorlds(), { url, name: name.value, computer: pick.value, owner, addedAt: Math.floor(Date.now() / 1000) });
      if (!next) {
        problem.hidden = false;
        problem.textContent = "You have as many as are kept. Forget one first.";
        return;
      }
      storeMyWorlds(next);
      dialog.close();
      refresh();
      controls.say("Named. Go there from Your computers.");
    };
    sheet(
      el("h2", { textContent: "A world you are building" }),
      el("p", { className: "lede", textContent: "Bring your terminals into a world whose code is yours, so you can work on it from inside it. Only you will see them there." }),
      el("p", {
        className: "verify verify-warn",
        textContent:
          "That world's own page will draw the terminal, so its code can read what you type and type for you. Name only a world you write yourself. If its site, or anything it loads, were ever tampered with, this is a way to a shell on your computer.",
      }),
      el("label", { htmlFor: "world-address", textContent: "Its address" }),
      address,
      el("label", { htmlFor: "world-name", textContent: "A name for it" }),
      name,
      ...(mine.length > 1 ? [el("label", { htmlFor: "world-computer", textContent: "Which computer's terminals" }), pick] : []),
      el("p", { textContent: "Your computer has to be told as well. Start its Bridge naming the world, and it will let that world's page ask:" }),
      command,
      el("p", { className: "why", textContent: "It still asks at the computer before each terminal opens there, and says which world is asking. What the world is handed lasts eight hours and works nowhere else." }),
      problem,
      el("div", { className: "actions" }, closeButton("Not now"), keep),
    );
  };

  /** One action to open each computer's terminal, and one to forget it. Rebuilt whenever the list or the visitor changes. */
  const refresh = () => {
    for (const id of shown) controls.remove(id);
    const mine = who ? computersOf(loadComputers(), who) : [];
    const worlds = who && mine.length ? myWorldsOf(loadMyWorlds(), who) : [];
    const slug = (origin: string) => origin.replace(/[^a-z0-9]+/gi, "-").slice(0, 40);
    shown = [...mine.flatMap((c) => [`terminal-${c.pubkey.slice(0, 12)}`, `forget-${c.pubkey.slice(0, 12)}`]), ...worlds.flatMap((w) => [`bring-${slug(w.origin)}`, `unname-${slug(w.origin)}`]), "world-name"];
    controls.add(
      ...worlds.flatMap((w) => [
        { id: `bring-${slug(w.origin)}`, section: "computers", icon: "door" as const, label: `Go to ${w.name}, with your terminals`, short: "Build", act: () => void bringTo(w.origin) },
        {
          id: `unname-${slug(w.origin)}`,
          section: "computers",
          icon: "exit" as const,
          label: `${w.name} is no longer one of yours`,
          short: "Forget",
          hidden: o.presenting,
          act: () => {
            storeMyWorlds(removeMyWorld(loadMyWorlds(), w.origin, w.owner));
            refresh();
            controls.say(`${w.name} is forgotten here. Start your Bridge without it too.`);
          },
        },
      ]),
      // Named where the whole warning can be read, and where its address can be typed.
      ...(mine.length ? [{ id: "world-name", section: "computers", icon: "door" as const, label: "A world you are building", short: "World", hidden: o.presenting, act: () => void identify().then(nameWorld) }] : []),
    );
    controls.add(
      ...mine.flatMap((c) => [
        { id: `terminal-${c.pubkey.slice(0, 12)}`, section: "computers", icon: "panel" as const, label: `A terminal on ${c.name}`, short: "Terminal", act: () => void openTerminal(c) }, // each press opens another, up to a few
        // Forgetting is done where the whole of what is forgotten can be read.
        {
          id: `forget-${c.pubkey.slice(0, 12)}`,
          section: "computers",
          icon: "exit" as const,
          label: `Forget ${c.name}`,
          short: "Forget",
          hidden: o.presenting,
          act: () => {
            for (const t of open.filter((x) => x.pubkey === c.pubkey)) t.term.close();
            storeComputers(removeComputer(loadComputers(), c.pubkey, c.owner));
            refresh();
            controls.say(`${c.name} is forgotten here. Stop the Bridge on it too.`);
          },
        },
      ]),
    );
  };
  controls.add({ id: "computer-how", section: "computers", icon: "help", label: "Add a computer", short: "Add", hidden: o.presenting, act: () => void identify().then(explain) });
  void identify()
    .then(refresh)
    .then(() => (wasRefreshed() ? restore() : undefined));

  return {
    fromAddress(hash) {
      const ask = pairingRequest(hash);
      if (!ask) {
        // A link that set out to name a computer and didn't: say so, where silence would look like nothing happened.
        if (!/(^|[#&])bridge=/.test(hash)) return false;
        controls.say("That link doesn't name a computer. Copy the whole link its Bridge printed.");
        return true;
      }
      void identify().then(() => offer(ask));
      return true;
    },
    restore,
    useTestIdentity(secretKey) {
      const key = secretKey ?? crypto.getRandomValues(new Uint8Array(32));
      const pubkey = getPublicKey(key);
      test = { pubkey, signer: checkedSigner(pubkey, { signEvent: async (t) => finalizeEvent(t, key) }) };
      who = pubkey;
      refresh();
      return pubkey;
    },
    list: () => (who ? computersOf(loadComputers(), who) : []),
    worlds: () => (who ? myWorldsOf(loadMyWorlds(), who) : []),
    bringTo,
    terminals: () => open.map((t) => t.term),
  };
}
