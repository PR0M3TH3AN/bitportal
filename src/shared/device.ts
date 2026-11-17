/** What this device can do, and whether a world suits it (NSWP spec §5.3 `mode`, `perf`). */

export type Tier = "mobile" | "standalone" | "desktop";

export interface Device {
  /** Can start an immersive VR session. */
  vr: boolean;
  tier: Tier;
}

const TIER_RANK: Record<Tier, number> = { mobile: 0, standalone: 1, desktop: 2 };
const HEADSET_UA = /OculusBrowser|Quest|Pico|PICO|Steam ?Frame|Android XR|Wolvic/i;
const MOBILE_UA = /Android|iPhone|iPad|Mobile/i;

/** A best guess from the browser's own description of itself. It only drives hints, never access. */
export function detectTier(userAgent: string, mobileHint: boolean | undefined): Tier {
  if (HEADSET_UA.test(userAgent)) return "standalone";
  if (mobileHint === true || (mobileHint === undefined && MOBILE_UA.test(userAgent))) return "mobile";
  return "desktop";
}

export interface Fit {
  ok: boolean;
  /** Plain-language reason, or "" when there is nothing to say. */
  reason: string;
}

export function deviceFit(world: { modes: string[]; perf?: string }, device: Device): Fit {
  const immersiveOnly = world.modes.length > 0 && world.modes.every((m) => m === "immersive-vr" || m === "immersive-ar");
  if (immersiveOnly && !device.vr) return { ok: false, reason: "Needs a VR headset" };
  const need = world.perf && world.perf in TIER_RANK ? TIER_RANK[world.perf as Tier] : null;
  if (need !== null && need > TIER_RANK[device.tier]) return { ok: false, reason: "Built for more powerful devices" };
  if (need !== null || world.modes.length > 0) return { ok: true, reason: "Runs on this device" };
  return { ok: true, reason: "" };
}
