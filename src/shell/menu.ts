/**
 * The visitor's menu, drawn by the page that keeps the screen (NSWP docs/plans/the-clients-menu.md; protocol
 * "The client has the menu"). One menu, the visitor's own, above whatever world is in the frame: it doesn't change
 * at a door, and what plays in it (their own music) doesn't stop at one.
 *
 * Everything here is the kit's, from this site's own vendored copy (`nswp-sdk/menu`): the menu, the words between
 * this page and the frame, the limits a world's words are held to, and the visitor's own rows. This file says only
 * what is BitPortal's: where Home is, whose panel signs a visitor in, and where their sounds are kept.
 *
 * - **A world that speaks the menu's words** is answered that this page has the menu, and draws none itself.
 * - **A page that doesn't** (a world on an older kit; for now this site's own room and Airlock) keeps its own menu,
 *   and this page draws nothing over it.
 * - **Nothing of the visitor's own tabs is ever said down.** A world is told their settings, and their presses on
 *   the rows it described.
 *
 * It is loaded after the frame has been sent on its way, so a place is never slower to come up for it.
 */
import { addDeskControls, addSoundControls, arriveWith, askDeskMoving, changeSettings, chatSwitch, createSounds, deskMovingSwitch, helpWords, modelsSwitch, mountMenu, picturesSwitch, portBelow, signInRows, watchEscape, type MenuBelow, type Sounds, type TravelSettings } from "nswp-sdk/menu";
import { createControls } from "nswp-sdk/ui";
import { goesAsGuest } from "../shared/look.js";
import { knownGuest, knownSignedIn } from "../shared/session.js";
import { INTENSE_KEY } from "../shared/prefs.js";
import { loadSettings } from "../shared/settings.js";
import { addShellBag } from "./bag.js";
import { framedPictures, type FramedPictures } from "./bag-pictures.js";
import { keepReport, keptReport, shellSettings, storage } from "./settings.js";
import { asOurOwn } from "./own-labels.js";
import type { PanelMode } from "./panel.js";

export interface ShellMenuOptions {
  /** The frame every place is shown in. */
  view: HTMLIFrameElement;
  /** Words from the frame, as this page hears them. Whatever the frame said before this was made is said again. */
  hear: { addEventListener(type: "message", fn: (e: MessageEvent) => void): void; removeEventListener(type: "message", fn: (e: MessageEvent) => void): void };
  /** Whether the frame's first page had finished loading before this was made. */
  loaded: boolean;
  /** The sign-in address's host, as a visitor reads it. */
  signInHost: string;
  /** Show the sign-in address's panel for the place at `origin`, which the visitor has just pressed for. */
  openPanel(origin: string, mode: PanelMode): void;
  /** Whether the panel is up. */
  panelOpen(): boolean;
  /** Send the frame to the room, whatever is in it. */
  goHome(): void;
  /** Whether the place in the frame is the room itself: this site's own, and home already. */
  atRoom(): boolean;
}

export interface ShellMenu {
  /** Whether the sheet is up. */
  readonly open: boolean;
  /** Whether this page is drawing the menu for the place in the frame. */
  readonly shown: boolean;
  /**
   * A new place has come into the frame and said so: the sheet is put away, so nothing of the menu is over what the
   * place shows first (the Airlock's question least of all), and the place has the keys as it arrives. Called when
   * the place says `here`, which it does once, as its script starts. Not when the frame's page has finished
   * loading: that can be many seconds later on a slow line, by when the visitor may have the sheet open in the new
   * place, and it would close under their hand (found by this page's trial on a busy machine, 2026-11-23).
   */
  arrived(): void;
  /**
   * The sign-in address's panel has gone. Where it was asked for from the sheet, the sheet comes back up on the tab
   * it was on, as a world's own menu does (the owner, 2026-11-25: "Yes"). Says whether it did: the keys are then the
   * menu's, and not given to the frame.
   */
  panelClosed(): boolean;
  readonly below: MenuBelow;
}

export function startMenu(o: ShellMenuOptions): ShellMenu {
  // Before any part of the kit starts here: what a world last reported is what each begins from. The kit cleans
  // it as it cleans a link's settings, so nothing kept here can turn on what a link couldn't.
  arriveWith(keptReport(storage()));
  // The visitor's own tabs. Display comes with the controls.
  const controls = createControls({ title: "BitPortal" });
  // Made further down, once there are controls to hang its rows on; asked for before then, nothing is playing.
  let sounds: Sounds | null = null;
  const below = portBelow(o.view, {
    controls,
    hear: o.hear,
    loaded: o.loaded,
    // Following and Messages are still a world's to fill, until this page runs them itself (the plan's step 3).
    also: ["following", "messages"],
    // Whether the visitor's own music is playing here: a world is told, and steps its own music back so the two
    // aren't heard on top of one another. Nothing of the music itself is said.
    playing: () => sounds?.jukebox.playing ?? false,
    // The same reader the page's first file answered a place with (settings.ts): the two can't differ.
    settings: () => shellSettings(),
    // A world's headset report: taken as the visitor's own in this page, and kept.
    onReported: (settings) => {
      changeSettings(settings);
      keepReport(settings, storage());
    },
    home: (left) => {
      // A page of this site's own (the Airlock) holds nothing of theirs to leave behind.
      if (left && below.origin !== location.origin) controls.say("You are home. What was in your hand was left behind: the place you were in didn't answer.");
      o.goHome();
    },
  });
  const presenting = (): boolean => !!below.world?.state.headset.presenting;
  const worldFills = (tab: string): boolean => !!below.world?.sections.some((s) => s.id === tab);

  // Travel: the way home is the visitor's own, in every world, and a guarantee: the world is asked to go, carrying
  // what they carry, and if it hasn't in a moment this page takes them home itself.
  // Not shown in the room, which is home.
  controls.add({ id: "home", section: "travel", icon: "home", label: "Home", hotbar: true, hidden: () => o.atRoom(), act: () => below.leave() });

  // You: signing in to the world in the frame, and out of it, in the menu's own words from the facts the world says.
  // Signing in is the sign-in address's own panel, shown by this page for that world and nobody else.
  /** The tab the sheet was on when a panel was asked for from it: it comes back up there when the panel goes. */
  let asideFor: string | null = null;
  const ask = (mode: PanelMode, tab = "you"): void => {
    if (!below.origin) return;
    // The panel is drawn above the sheet, and nothing of the menu may sit under a press in it: the sheet goes first,
    // and comes back up on its tab when the panel goes (`panelClosed`). Every row that asks for the panel is on You.
    asideFor = menu.open ? tab : null;
    menu.setOpen(false);
    o.openPanel(below.origin, mode);
  };
  // A page of this site's own that fills You itself (the room: signing in to BitPortal, their account, how they
  // look) has those rows of its own there, and this page adds none beside them.
  const filledBelow = (tab: string): boolean => below.origin === location.origin && worldFills(tab);
  controls.add(...signInRows(below, { ask: () => ask("ask") }));
  controls.add(
    // A guest's own press, over any world (BitLogin docs/guest-accounts.md G6): the guest's account made to last.
    { id: "secure", section: "you", icon: "key", tone: "primary", label: "Secure this account", short: "Secure", hidden: () => filledBelow("you") || !!knownSignedIn() || !knownGuest(), act: () => ask("secure") },
    { id: "account", section: "you", icon: "key", label: `Your account, at ${o.signInHost}`, short: "Account", hidden: () => filledBelow("you"), act: () => ask("account") },
    { id: "files", section: "you", icon: "list", label: `Your files, at ${o.signInHost}`, short: "Files", hidden: () => filledBelow("you"), act: () => ask("files") },
    { id: "library", section: "you", icon: "save", label: `Your purchases, at ${o.signInHost}`, short: "Purchases", hidden: () => filledBelow("you"), act: () => ask("library") },
  );

  // The rows that change a setting the visitor carries from world to world are this page's, wherever they stand:
  // look speed (Moving), how wide they see (View), how they move at a desk, and the switches for people's pictures,
  // people's own models (People) and what people write (Room), shown where the world fills that tab.
  addDeskControls(controls, { presenting });
  // How they move at a desk: kept under the name the room keeps it by, so one choice is theirs in the room and over
  // every world, and the one reader of the settings this page says (settings.ts) reads it there.
  controls.add(deskMovingSwitch(controls, { presenting, keep: INTENSE_KEY }));
  controls.add({ ...picturesSwitch(controls), hidden: () => !worldFills("people") }, { ...modelsSwitch(controls), hidden: () => !worldFills("people") }, { ...chatSwitch((text) => controls.say(text)), hidden: () => !worldFills("room") });

  // Bag: theirs, over a world where they are named (bag.ts).
  // Who they are is this browser's own note of who is signed in to BitPortal, kept by this site: read, with
  // nothing loaded and nothing asked. Someone going about as a guest is nobody here either.
  // Each thing is drawn as itself by a page this one frames unseen, only while the sheet is open and never in a
  // headset (bag-pictures.ts). `sheetOpen` is filled in below, once the menu is mounted.
  let sheetOpen = (): boolean => false;
  const pictures: FramedPictures = framedPictures({ open: () => sheetOpen(), presenting });
  // Whose bag: who is signed in to BitPortal, or, where nobody is, this browser's guest account (BitLogin's).
  const bagKey = (): string | null => {
    const known = knownSignedIn()?.pubkey ?? null;
    return known ? (goesAsGuest() ? null : known) : knownGuest();
  };
  addShellBag({ controls, below, signedIn: bagKey, relays: loadSettings().relays, previews: pictures });

  // Sound: the volumes, the switch for a place's hum where the world says it has one, and the visitor's own music,
  // chosen and played by this page, so it doesn't stop at a door. Kept under the names the room keeps them by: one
  // set of volumes and one list of songs, in the room and in every world. This page has no music or hum of its own.
  sounds = createSounds({ kit: "/sounds/kit/", theme: { music: null, hum: null }, keep: { levels: "bitportal:sound", songs: "bitportal:jukebox" } });
  addSoundControls(controls, sounds, { hasHum: () => below.world?.state.hum === true });

  // Help: how to move and how to bring these controls up. What a world says of itself comes after, under its name.
  controls.addSection({ id: "help", label: "Help", icon: "help", note: helpWords("client") });

  // In a place of its own, under everything else this page draws: the sign-in address's panel is always above it.
  const place = document.createElement("div");
  place.className = "shell-menu";
  o.view.after(place);
  // Over a page of this site's own, what the page fills is labelled as this site's own (own-labels.ts). Whether it
  // is, is the origin the browser reported for the page, compared exactly.
  const port = Object.create(below.port, {
    view: { value: () => (below.origin === location.origin && below.world ? asOurOwn(below.port.view(), below.world.title || location.host) : below.port.view()) },
  }) as typeof below.port;
  const menu = mountMenu(port, { parent: place });
  sheetOpen = () => menu.open;
  below.attach(menu);

  // No menu over a page that doesn't speak the words: such a page draws its own.
  let asked = false;
  const show = (): void => {
    menu.setHidden(!below.speaks);
    // "How you move at a desk" is asked once, by whoever draws the menu: here, the first time a world is under it.
    if (below.speaks && !asked) {
      asked = true;
      askDeskMoving(controls, { presenting, keep: INTENSE_KEY });
    }
  };
  below.onChange(show);
  show();

  // Escape, while this page fills the screen, is held where the browser lets it: Escape then brings the menu, and
  // Escape again leaves fullscreen (the kit's rule, in the kit's menu). Elsewhere it is the browser's, as before.
  watchEscape();

  // Who has the keys (the plan, 17.2). While the sheet and the panel are down, the frame has them. The kit hands
  // them back after a press on the bar and as the sheet closes; these are the ways left for this page to come to
  // have them when it shouldn't.
  const frameShouldHaveKeys = (): boolean => !menu.open && !o.panelOpen();
  const giveBack = (): void => {
    if (frameShouldHaveKeys() && document.activeElement !== o.view) o.view.focus();
  };
  // The window comes back from another window or tab.
  addEventListener("focus", giveBack);
  // A press on a bare part of this page.
  document.addEventListener("pointerup", (e) => {
    if (e.target === document.body || e.target === document.documentElement) giveBack();
  });
  // A key heard here with everything down: this page has the keys and shouldn't. The visitor's own few keys (the
  // summons, the menu's key, Escape, the bar's digits) are the menu's, which hears them too and acts. Any other is
  // lost, once: it can't be passed into another site's frame, so the frame is given the keys for the next press.
  addEventListener("keydown", (e: KeyboardEvent) => {
    if (!frameShouldHaveKeys() || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === "Backquote" || e.key === "Escape" || e.key.toLowerCase() === "m" || /^[0-9]$/.test(e.key) || e.key === "Tab") return;
    giveBack();
  });

  // For trials, as the room has (`__bitportalTest`): what this page holds, to be read and never pressed through.
  (window as unknown as { __bitportalShell?: unknown }).__bitportalShell = { below, sounds, controls, pictures };

  return {
    get open() {
      return menu.open;
    },
    get shown() {
      return below.speaks;
    },
    arrived: () => {
      // A new place: nothing comes back up for the last one.
      asideFor = null;
      menu.setOpen(false);
    },
    panelClosed: () => {
      const at = asideFor;
      asideFor = null;
      if (at === null || !below.speaks) return false;
      menu.setOpen(true, at);
      return true;
    },
    below,
  };
}
