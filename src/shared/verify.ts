/**
 * Origin verification, done only when the visitor shows interest in a world
 * (NSWP spec §5.7, §7.3). Results are remembered for a day so a door can show
 * its verified mark without contacting the site again.
 */
import { fetchManifest, verifyOrigin, type Verification, type World } from "@nswp/core";

export type VerificationState = "verified" | "listed" | "no-manifest" | "unreachable";

export interface VerificationResult {
  state: VerificationState;
  checkedAt: number;
  /** The site asks not to be listed by third parties (manifest `listing: deny`). */
  listingDenied: boolean;
  failed: string[];
}

const TTL_MS = 24 * 60 * 60 * 1000;
const KEY = "bitportal:verified:";

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function cachedVerification(id: string, createdAt: number): VerificationResult | null {
  try {
    const raw = storage()?.getItem(KEY + id);
    if (!raw) return null;
    const v = JSON.parse(raw) as VerificationResult & { for: number };
    // A cached result only stands for the exact announcement it checked.
    if (v.for !== createdAt || Date.now() - v.checkedAt > TTL_MS) return null;
    return v;
  } catch {
    return null;
  }
}

export async function verifyWorld(id: string, world: World): Promise<VerificationResult> {
  const m = await fetchManifest(world.url);
  let state: VerificationState;
  let failed: string[] = [];
  if (!m.manifest) state = m.issues.some((i) => i.code === "manifest_not_found") ? "no-manifest" : "unreachable";
  else {
    const v: Verification = verifyOrigin(world, m.manifest, m.url);
    state = v.verified ? "verified" : "listed";
    failed = v.checks.filter((c) => !c.ok).map((c) => c.message);
  }
  const result: VerificationResult = { state, checkedAt: Date.now(), listingDenied: m.manifest?.listing === "deny", failed };
  try {
    if (state !== "unreachable") storage()?.setItem(KEY + id, JSON.stringify({ ...result, for: world.createdAt }));
  } catch {
    /* storage unavailable: the check simply runs again next time */
  }
  return result;
}
