/**
 * The home's end of the Bridge (browser/bridge.md): ask one computer for a
 * terminal, on its owner's say-so.
 *
 * A throwaway session key is made for the one connection. The owner's signer
 * signs a grant for it. The request goes to the Bridge as an encrypted note
 * through relays, and the terminal itself runs over a direct connection.
 * Nothing here holds the owner's key, and nothing a relay carries can be read.
 */
import { type EventTemplate, type NostrEvent } from "@nswp/core";
export type BridgeStatus = 
/** The owner's signer is being asked for a grant. */
{
    at: "signing";
}
/** The request is out. `code` is what the computer will show if it asks. */
 | {
    at: "finding";
    code: string;
}
/** Someone at the computer is being asked. */
 | {
    at: "asking";
    code: string;
} | {
    at: "connecting";
} | {
    at: "open";
    name: string;
}
/** The program ended. */
 | {
    at: "ended";
    code: number;
}
/** It never opened, or stopped. `why` can be shown as it is. */
 | {
    at: "closed";
    why: string;
};
export interface BridgeLinkOptions {
    /** The Bridge's public key, as 64 hex characters. */
    bridge: string;
    relays: string[];
    /** The owner's signer. It is asked for one thing: the grant. */
    sign(template: EventTemplate): Promise<NostrEvent>;
    /** The owner's public key, so a grant signed by anyone else is never sent. */
    owner: string;
    cols: number;
    rows: number;
    onStatus(status: BridgeStatus): void;
    /** What the terminal wrote. */
    onData(bytes: Uint8Array): void;
    iceServers?: RTCIceServer[];
    /** How long to wait for the computer to answer at all. */
    answerMs?: number;
}
export interface BridgeLink {
    readonly status: BridgeStatus;
    /** Keys typed. Nothing is sent until the terminal is open. */
    send(bytes: string | Uint8Array): void;
    resize(cols: number, rows: number): void;
    close(): void;
}
export declare function openBridgeLink(o: BridgeLinkOptions): BridgeLink;
