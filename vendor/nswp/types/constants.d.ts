/** Experimental event kinds. Not allocated by the NIPs process (spec §5.1, §22). */
export declare const WORLD_KIND = 37300;
export declare const AVATAR_KIND = 37301;
/** NIP-98 HTTP auth shape, reused for entry assertions (spec §4.4, Q3). */
export declare const ENTRY_ASSERTION_KIND = 27235;
/** NIP-51 curation sets, used for third-party world listings (spec §5.4). */
export declare const CURATION_SET_KIND = 30004;
export declare const SCHEMAS: {
    readonly manifest: "nswp/manifest/0.3";
    readonly portal: "nswp/portal/0.3";
    readonly arrival: "nswp/arrival/0.3";
};
export declare const WELL_KNOWN_PATH = "/.well-known/nswp.json";
export declare const MODES: readonly ["2d", "inline-3d", "immersive-vr", "immersive-ar"];
export declare const CAPABILITIES: readonly ["webxr", "rooms", "multiplayer", "voice", "spatial-portals", "avatars", "entry-assertion", "payments"];
export declare const COMFORT: {
    readonly locomotion: readonly ["stationary", "teleport", "smooth", "vehicle"];
    readonly intensity: readonly ["low", "medium", "high"];
    readonly seated: readonly ["supported", "required", "unsupported"];
};
export declare const INPUTS: readonly ["controllers", "hands", "gaze", "keyboard-mouse", "touch", "gamepad"];
export declare const PERF_TIERS: readonly ["mobile", "standalone", "desktop"];
export declare const STATUSES: readonly ["live", "beta", "maintenance", "retired"];
export declare const LIMITS: {
    readonly manifestBytes: number;
    readonly arrivalChars: number;
    readonly maxReceipts: 8;
    readonly maxIdLength: 128;
    readonly maxTitleLength: 200;
    readonly maxUrlLength: 2048;
    readonly assertionTtlSec: 60;
    readonly assertionFutureSkewSec: 10;
    readonly minNonceLength: 16;
};
export type Mode = (typeof MODES)[number];
export type Capability = (typeof CAPABILITIES)[number];
export type Locomotion = (typeof COMFORT.locomotion)[number];
export type Intensity = (typeof COMFORT.intensity)[number];
export type Seated = (typeof COMFORT.seated)[number];
export type Input = (typeof INPUTS)[number];
export type PerfTier = (typeof PERF_TIERS)[number];
export type Status = (typeof STATUSES)[number];
