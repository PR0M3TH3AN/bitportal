import { type EventTemplate, type NostrEvent } from "./event.js";
import { type Result } from "./result.js";
/** Experimental, ephemeral-range kind; not allocated by the NIPs process. */
export declare const BRIDGE_GRANT_KIND = 27302;
export declare const BRIDGE_LIMITS: {
    /** How long a grant is good for connecting. The connection it opens may last longer. */
    readonly grantTtlSec: 300;
    /** How far the Bridge's clock and the signer's may disagree. */
    readonly skewSec: 120;
    /** Notes older or newer than this are ignored. */
    readonly signalMaxAgeSec: 60;
    readonly maxSdpChars: 20000;
    readonly minCols: 20;
    readonly maxCols: 300;
    readonly minRows: 5;
    readonly maxRows: 120;
    /** The largest frame either side sends or accepts, in bytes. */
    readonly frameBytes: 65536;
    readonly nameChars: 80;
    readonly whyChars: 200;
};
/** Where a Bridge listens on relays. */
export declare function bridgeTopic(bridge: string): string;
/**
 * Four digits both ends work out from the grant, each on its own. The Bridge
 * shows them when it asks; the panel shows them while it waits. If they
 * differ, the question on the computer is about somebody else's request.
 */
export declare function grantCode(grantId: string): string;
export interface BridgeGrantInput {
    /** The throwaway session public key the grant is for. */
    session: string;
    /** The Bridge's public key. */
    bridge: string;
    createdAt?: number;
    ttlSec?: number;
}
/** A grant, ready for the owner's key to sign. */
export declare function buildBridgeGrant(input: BridgeGrantInput): EventTemplate;
export interface VerifyGrantOptions {
    /** The one key this Bridge answers. */
    owner: string;
    /** This Bridge's own public key. */
    bridge: string;
    /** The key that sent the grant: it must be the session key the grant names. */
    session: string;
    now?: number;
    /** The ids of grants already used. */
    seen?: {
        has(id: string): boolean;
    };
}
export interface VerifiedGrant {
    id: string;
    session: string;
    expiresAt: number;
}
/** Check a grant. Nothing opens until this says so. */
export declare function verifyBridgeGrant(event: unknown, opts: VerifyGrantOptions): Result<VerifiedGrant>;
export type BridgeMessage = {
    t: "open";
    grant: NostrEvent;
    sdp: string;
}
/** The Bridge is asking at the computer. */
 | {
    t: "wait";
} | {
    t: "answer";
    sdp: string;
} | {
    t: "refused";
    why: string;
};
/**
 * A note for the other end, encrypted to its key (NIP-44). `bridge` is the
 * Bridge's public key, whichever end is writing. A reply names the note it
 * answers in `re`, so an old reply is never taken for a new one.
 */
export declare function buildBridgeSignal(bridge: string, key: Uint8Array, to: string, message: BridgeMessage, o?: {
    re?: string;
    createdAt?: number;
}): NostrEvent;
export interface OpenedBridgeSignal {
    from: string;
    message: BridgeMessage;
    id: string;
    /** The id of the note this one answers, when it is a reply. */
    re?: string;
}
/**
 * Check and decrypt a note. Returns null for anything that isn't a valid,
 * fresh note addressed to this key on this Bridge's topic. Who it is from,
 * and what it answers, are for the caller to judge: the Bridge by the grant
 * inside, the page by the Bridge's key and its own request's id.
 */
export declare function openBridgeSignal(event: unknown, key: Uint8Array, bridge: string, now?: number): OpenedBridgeSignal | null;
export type BridgeControl = {
    t: "size";
    cols: number;
    rows: number;
} | {
    t: "here";
} | {
    t: "ready";
    name: string;
} | {
    t: "exit";
    code: number;
};
/** A terminal's size, held to what a Bridge will make. */
export declare function cleanSize(cols: unknown, rows: unknown): {
    cols: number;
    rows: number;
} | null;
/** Read a text frame from the channel. Returns null for anything that isn't one of the few things either side says. */
export declare function parseBridgeControl(text: string): BridgeControl | null;
