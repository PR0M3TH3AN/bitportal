/**
 * Previews: the view through a door (NSWP spec §5.8).
 *
 * Three rules shape this file.
 *
 * - Privacy (§5.7). While a world is only listed, its preview comes from
 *   BitPortal's own mirror and nowhere else. The spec would also allow storage
 *   that isn't the world's site, but that storage is still named by the
 *   publisher and would still see the visitor, so BitPortal is stricter: a
 *   preview it doesn't mirror waits until the visitor opens that door.
 * - Consent. A preview is shown without asking only for a world the visitor's
 *   own choices brought here, and never for one that carries a content warning.
 * - Proof. Whatever arrives is checked against the hash in the world's signed
 *   announcement before it is drawn, wherever it came from.
 */
import { checkPreviewBytes, PREVIEW_LIMITS, previewOnWorldOrigin, type Preview, type World } from "@nswp/core";
import mirrorJson from "../starter/previews.json";

export interface Mirrored {
  file: string;
  mime: string;
  bytes: number;
}
/** Previews BitPortal serves from its own site, by SHA-256. */
export const MIRROR: Readonly<Record<string, Mirrored>> = mirrorJson;

export type PreviewDecision =
  | { show: "none" }
  /** Hold a placeholder until the visitor asks. */
  | { show: "ask"; reason: "content-warning" | "unreviewed"; preview: Preview }
  /** BitPortal doesn't mirror it; wait until the visitor opens the door. */
  | { show: "on-open"; preview: Preview }
  | { show: "now"; preview: Preview; url: string; from: "mirror" | "storage" | "origin" };

export interface PreviewContext {
  /** The world reached the visitor through something they chose: their starter set, say. */
  chosen: boolean;
  /** The visitor asked to see this world's preview. */
  asked: boolean;
  /** The visitor opened this world's door, so its own site may be contacted. */
  doorOpen: boolean;
  mirror?: Readonly<Record<string, Mirrored>>;
}

type Previewed = Pick<World, "url" | "previews" | "modes" | "contentWarning">;

/** A 360° picture for places you can stand in; a screenshot for ordinary pages. */
export function pickPreview(world: Pick<World, "previews" | "modes">): Preview | undefined {
  const spatial = world.modes.some((m) => m !== "2d");
  const order = spatial || world.modes.length === 0 ? ["pano", "flat"] : ["flat", "pano"];
  for (const type of order) {
    const hit = world.previews.find((p) => p.type === type);
    if (hit) return hit;
  }
  return undefined;
}

export function decidePreview(world: Previewed, ctx: PreviewContext): PreviewDecision {
  const preview = pickPreview(world);
  if (!preview) return { show: "none" };
  if (!ctx.asked) {
    if (world.contentWarning !== undefined) return { show: "ask", reason: "content-warning", preview };
    if (!ctx.chosen) return { show: "ask", reason: "unreviewed", preview };
  }
  const mirrored = (ctx.mirror ?? MIRROR)[preview.sha256];
  if (mirrored) return { show: "now", preview, url: `/previews/${mirrored.file}`, from: "mirror" };
  if (!ctx.doorOpen) return { show: "on-open", preview };
  return { show: "now", preview, url: preview.url, from: previewOnWorldOrigin(world, preview) ? "origin" : "storage" };
}

/** What kind of image the bytes are. The first bytes decide, never the address. */
export function sniffImage(bytes: Uint8Array): string | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(1, 4) === "PNG" && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  return null;
}

/** Read a response, giving up as soon as it passes `limit` bytes. */
async function readCapped(res: Response, limit: number): Promise<Uint8Array | null> {
  const declared = Number(res.headers.get("content-length") ?? "0");
  if (declared > limit) return null;
  if (!res.body) {
    const all = new Uint8Array(await res.arrayBuffer());
    return all.length > limit ? null : all;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > limit) {
      void reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

const ready = new Map<string, string>();
const pending = new Map<string, Promise<string | null>>();

/** A preview that has already been fetched and checked this visit, as an object URL. */
export function loadedPreview(sha256: string): string | undefined {
  return ready.get(sha256);
}

/**
 * Fetch a preview, check it, and return an object URL for it, or null when it
 * can't be shown. A file is fetched at most once per visit.
 */
export function loadPreview(decision: Extract<PreviewDecision, { show: "now" }>): Promise<string | null> {
  const { preview, url } = decision;
  const have = ready.get(preview.sha256);
  if (have) return Promise.resolve(have);
  let job = pending.get(preview.sha256);
  if (!job) {
    job = (async () => {
      try {
        const res = await fetch(url, { credentials: "omit", referrerPolicy: "no-referrer", redirect: decision.from === "mirror" ? "error" : "follow" });
        if (!res.ok) return null;
        const bytes = await readCapped(res, PREVIEW_LIMITS[preview.type].bytes);
        if (!bytes || !checkPreviewBytes(preview, bytes).ok) return null;
        const mime = sniffImage(bytes);
        if (!mime) return null;
        const objectUrl = URL.createObjectURL(new Blob([bytes as Uint8Array<ArrayBuffer>], { type: mime }));
        ready.set(preview.sha256, objectUrl);
        return objectUrl;
      } catch {
        return null;
      }
    })();
    pending.set(preview.sha256, job);
  }
  return job;
}
