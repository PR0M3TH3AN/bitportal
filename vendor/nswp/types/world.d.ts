import { type EventTemplate } from "./event.js";
import { type Result } from "./result.js";
export interface WorldComfort {
    locomotion?: string;
    intensity?: string;
    seated?: string;
}
export interface WorldInput {
    d: string;
    title: string;
    url: string;
    summary?: string;
    description?: string;
    image?: {
        url: string;
        dimensions?: string;
    };
    modes?: string[];
    capabilities?: string[];
    comfort?: WorldComfort;
    inputs?: string[];
    perf?: string;
    topics?: string[];
    /** ISO-639-1 codes. */
    languages?: string[];
    /** `true` for a warning with no reason. */
    contentWarning?: string | true;
    status?: string;
    /** Only when the manifest is not at the well-known path (it then can't verify). */
    manifest?: string;
    coCreators?: string[];
    /** Coordinate of an access product, e.g. a BitUnlock product (`30078:<pubkey>:<d>`). */
    access?: string;
    createdAt?: number;
}
export interface World {
    /** `37300:<pubkey>:<d>` when the event has a pubkey. */
    coordinate?: string;
    pubkey?: string;
    d: string;
    title: string;
    url: string;
    summary?: string;
    description: string;
    image?: {
        url: string;
        dimensions?: string;
    };
    modes: string[];
    capabilities: string[];
    comfort: WorldComfort;
    inputs: string[];
    perf?: string;
    topics: string[];
    languages: string[];
    contentWarning?: string;
    status: string;
    manifest?: string;
    coCreators: string[];
    access?: string;
    createdAt: number;
}
/** Build an unsigned world announcement, tag-first (spec §5.2). */
export declare function buildWorldEvent(w: WorldInput): EventTemplate;
export interface ParseWorldOptions {
    /** Require `id`, `pubkey` and `sig` fields (signature itself is checked by `verifyEvent`). */
    requireSigned?: boolean;
}
/** Validate a world announcement and return its structured form. */
export declare function parseWorldEvent(input: unknown, opts?: ParseWorldOptions): Result<World>;
