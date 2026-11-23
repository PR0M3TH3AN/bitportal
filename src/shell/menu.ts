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
import { addDeskControls, addSoundControls, askDeskMoving, chatSwitch, createSounds, deskMovingSwitch, helpWords, modelsSwitch, mountMenu, picturesSwitch, portBelow, signInRows, type MenuBelow } from "nswp-sdk/menu";
import { createControls } from "nswp-sdk/ui";
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
}

export interface ShellMenu {
  /** Whether the sheet is up. */
  readonly open: boolean;
  /** Whether this page is drawing the menu for the place in the frame. */
  readonly shown: boolean;
  readonly below: MenuBelow;
}

export function startMenu(o: ShellMenuOptions): ShellMenu {
  // The visitor's own tabs. Display comes with the controls.
  const controls = createControls({ title: "BitPortal" });
  const below = portBelow(o.view, {
    controls,
    hear: o.hear,
    loaded: o.loaded,
    // Following and Messages are still a world's to fill, until this page runs them itself (the plan's step 3).
    also: ["following", "messages"],
    home: (left) => {
      if (left) controls.say("You are home. What was in your hand was left behind: the place you were in didn't answer.");
      o.goHome();
    },
  });
  const presenting = (): boolean => !!below.world?.state.headset.presenting;
  const worldFills = (tab: string): boolean => !!below.world?.sections.some((s) => s.id === tab);

  // Travel: the way home is the visitor's own, in every world, and a guarantee: the world is asked to go, carrying
  // what they carry, and if it hasn't in a moment this page takes them home itself.
  controls.add({ id: "home", section: "travel", icon: "home", label: "Home", hotbar: true, act: () => below.leave() });

  // You: signing in to the world in the frame, and out of it, in the menu's own words from the facts the world says.
  // Signing in is the sign-in address's own panel, shown by this page for that world and nobody else.
  const ask = (mode: PanelMode): void => {
    if (!below.origin) return;
    // The panel is drawn above the sheet, and nothing of the menu may sit under a press in it: the sheet goes first.
    menu.setOpen(false);
    o.openPanel(below.origin, mode);
  };
  controls.add(...signInRows(below, { ask: () => ask("ask") }));
  controls.add(
    { id: "account", section: "you", icon: "key", label: `Your account, at ${o.signInHost}`, short: "Account", act: () => ask("account") },
    { id: "files", section: "you", icon: "list", label: `Your files, at ${o.signInHost}`, short: "Files", act: () => ask("files") },
    { id: "library", section: "you", icon: "save", label: `Your purchases, at ${o.signInHost}`, short: "Purchases", act: () => ask("library") },
  );

  // The rows that change a setting the visitor carries from world to world are this page's, wherever they stand:
  // look speed (Moving), how wide they see (View), how they move at a desk, and the switches for people's pictures,
  // people's own models (People) and what people write (Room), shown where the world fills that tab.
  addDeskControls(controls, { presenting });
  controls.add(deskMovingSwitch(controls, { presenting }));
  controls.add({ ...picturesSwitch(controls), hidden: () => !worldFills("people") }, { ...modelsSwitch(controls), hidden: () => !worldFills("people") }, { ...chatSwitch((text) => controls.say(text)), hidden: () => !worldFills("room") });

  // Sound: the volumes, the switch for a place's hum where the world says it has one, and the visitor's own music,
  // chosen and played by this page, so it doesn't stop at a door. Kept under the names the room keeps them by: one
  // set of volumes and one list of songs, in the room and in every world. This page has no music or hum of its own.
  const sounds = createSounds({ kit: "/sounds/kit/", theme: { music: null, hum: null }, keep: { levels: "bitportal:sound", songs: "bitportal:jukebox" } });
  addSoundControls(controls, sounds, { hasHum: () => below.world?.state.hum === true });

  // Help: how to move and how to bring these controls up. What a world says of itself comes after, under its name.
  controls.addSection({ id: "help", label: "Help", icon: "help", note: helpWords("client") });

  // In a place of its own, under everything else this page draws: the sign-in address's panel is always above it.
  const place = document.createElement("div");
  place.className = "shell-menu";
  o.view.after(place);
  const menu = mountMenu(below.port, { parent: place });
  below.attach(menu);

  // No menu over a page that doesn't speak the words: such a page draws its own.
  let asked = false;
  const show = (): void => {
    menu.setHidden(!below.speaks);
    // "How you move at a desk" is asked once, by whoever draws the menu: here, the first time a world is under it.
    if (below.speaks && !asked) {
      asked = true;
      askDeskMoving(controls, { presenting });
    }
  };
  below.onChange(show);
  show();

  // Who has the keys (the plan, 17.2). While the sheet and the panel are down, the frame has them. The kit hands
  // them back after a press on the bar and as the sheet closes; these are the ways left for this page to come to
  // have them when it shouldn't.
  const frameShouldHaveKeys = (): boolean => !menu.open && !o.panelOpen();
  const giveBack = (): void => {
    if (frameShouldHaveKeys() && document.activeElement !== o.view) o.view.focus();
  };
  // The sheet has just closed. The kit gives the frame the keys as it does, and its menu then takes them back for
  // the key the sheet was opened from, which is right for a world's own page and strands a framed world's keys
  // (found by this page's trial, 2026-11-23; reported for the kit). So they are given again, after it.
  controls.onSignal((name) => {
    if (name === "menuClose") setTimeout(giveBack, 0);
  });
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
  (window as unknown as { __bitportalShell?: unknown }).__bitportalShell = { below, sounds, controls };

  return {
    get open() {
      return menu.open;
    },
    get shown() {
      return below.speaks;
    },
    below,
  };
}
