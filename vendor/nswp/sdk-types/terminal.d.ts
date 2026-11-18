/**
 * A terminal on the visitor's own computer, in a panel (browser/bridge.md).
 *
 * This is for a home, never for a world: it needs the owner's signer, and a
 * world is never given one. It is its own entry (`nswp-sdk/terminal`) so that
 * nothing else pays for the terminal emulator.
 *
 * The panel shows what stage the connection is at, with the code the
 * computer will show when it asks. Once open, press the panel to type into
 * it: with a real keyboard anywhere, and with the kit's drawn one in a
 * headset. Press anywhere else to stop typing into it.
 *
 *   const term = openTerminalPanel({ panels, bridge, owner, relays, sign, presenting });
 *   term.close();
 */
import * as THREE from "three";
import { type BridgeStatus } from "./bridge-link.js";
import type { Panel, Panels } from "./panels.js";
import type { EventTemplate, NostrEvent } from "@nswp/core";
export type { BridgeStatus } from "./bridge-link.js";
export interface TerminalPanelOptions {
    panels: Panels;
    /** The computer's Bridge, as 64 hex characters. */
    bridge: string;
    /** The owner's public key and signer. The signer is asked for one grant per connection. */
    owner: string;
    sign(template: EventTemplate): Promise<NostrEvent>;
    relays: string[];
    /** What the owner calls this computer, for the panel's bar. */
    name?: string;
    cols?: number;
    rows?: number;
    accent?: THREE.ColorRepresentation;
    /** Whether the visitor is in a headset now: there, pressing the panel brings up the drawn keyboard. */
    presenting?: () => boolean;
    iceServers?: RTCIceServer[];
    onStatus?(status: BridgeStatus): void;
    /** The panel was put away, and the connection with it. */
    onClosed?(): void;
}
export interface TerminalPanel {
    readonly panel: Panel;
    readonly status: BridgeStatus;
    /** Whether keys typed go to it. */
    readonly focused: boolean;
    focus(): void;
    blur(): void;
    /** Send keys, as if typed. */
    type(bytes: string): void;
    /** What is on its screen, as lines of text. */
    text(): string[];
    close(): void;
}
export declare function openTerminalPanel(o: TerminalPanelOptions): TerminalPanel;
