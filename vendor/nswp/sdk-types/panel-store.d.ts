/**
 * What a panel is, as data: what it shows and where it hangs. No three.js
 * here, so the rules about what may be kept are tested like arithmetic.
 *
 * A panel shows one of a few things the kit knows how to draw: a note, a
 * picture, a video. It is never a web page. A page can't be drawn into a 3D
 * scene by another page, and this kit doesn't pretend otherwise
 * (browser/spec.md).
 */
export type V3 = [number, number, number];
/** Where a panel hangs, in the world's own metres, and how large it is. */
export interface PanelPlace {
    position: V3;
    /** Which way it faces, in degrees round the vertical: 0 faces +Z. */
    yaw: number;
    /** How far it leans back or forward, in degrees. */
    pitch: number;
    /** Its width in metres. Its height follows from what it shows. */
    width: number;
}
/**
 * What a panel shows, in the form that can be kept. `src` is an address the
 * page is allowed to load, or `kept:<name>` for a file the visitor chose from
 * their own device, which the kit holds in this browser.
 */
export type PanelSource = {
    kind: "note";
    title: string;
    text: string;
} | {
    kind: "picture";
    title: string;
    src: string;
} | {
    kind: "video";
    title: string;
    src: string;
};
export interface PanelRecord {
    id: string;
    source: PanelSource;
    place: PanelPlace;
}
export declare const PANEL_LIMITS: {
    readonly count: 24;
    readonly titleChars: 80;
    readonly noteChars: 4000;
    readonly srcChars: 2048;
    readonly minWidth: 0.3;
    readonly maxWidth: 3;
    /** A panel is never kept further from the middle of a world than this, in metres. */
    readonly reach: 500;
    /** The largest file of the visitor's own that is kept, in bytes. */
    readonly fileBytes: number;
};
export declare function cleanPlace(input: unknown): PanelPlace | null;
export declare function cleanSource(input: unknown): PanelSource | null;
/** Read what was kept, dropping anything that isn't what it claims to be. This comes back from storage. */
export declare function cleanRecords(input: unknown): PanelRecord[];
/** The way a panel at `at` should turn to face a head at `head`: its yaw and pitch, in degrees. */
export declare function facing(at: V3, head: V3): {
    yaw: number;
    pitch: number;
};
/**
 * Where a new panel goes: a comfortable reach in front of the head, at eye
 * height. Each one after the first hangs further round the visitor, to one
 * side and then the other, so none opens on top of another.
 */
export declare function inFront(head: V3, yawDegrees: number, already?: number, distance?: number): V3;
/** A short random name for a panel or a kept file. */
export declare function newId(random?: () => number): string;
/** Break a note into lines no wider than `width` units, where `measure` says how wide some text is. */
export declare function wrapText(text: string, width: number, measure: (s: string) => number, maxLines?: number): string[];
