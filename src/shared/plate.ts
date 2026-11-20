/**
 * The marks on a door plate: what a visitor is told before they commit
 * (NSWP spec §6.7). The list and the walk-in hall draw the same marks.
 */
import { categoryWords, type World } from "@nswp/core";

export interface Mark {
  text: string;
  tone: "plain" | "ok" | "warn";
}

/** What kind of place this is, from the modes it announces. */
export function placeKind(world: Pick<World, "modes">): string {
  const kinds: string[] = [];
  if (world.modes.includes("immersive-vr")) kinds.push("VR");
  if (world.modes.includes("immersive-ar")) kinds.push("AR");
  if (world.modes.includes("inline-3d")) kinds.push("3D");
  if (kinds.length > 0) return kinds.join(", ");
  return world.modes.includes("2d") ? "Web page" : "";
}

export function plateMarks(world: Pick<World, "modes" | "comfort" | "contentWarning"> & Partial<Pick<World, "audience" | "category">>, fit: { ok: boolean; reason: string }, verified: boolean): Mark[] {
  const marks: Mark[] = [];
  // What kind of place its maker says it is (NSWP-01): a game, an experience, a place to meet, an app, a site.
  const category = categoryWords(world.category);
  if (category) marks.push({ text: category, tone: "plain" });
  const kind = placeKind(world);
  if (kind) marks.push({ text: kind, tone: "plain" });
  if (verified) marks.push({ text: "Verified", tone: "ok" });
  if (!fit.ok) marks.push({ text: fit.reason, tone: "warn" });
  const intensity = world.comfort.intensity;
  if (intensity === "high") marks.push({ text: "Intense", tone: "warn" });
  else if (intensity === "low") marks.push({ text: "Gentle", tone: "plain" });
  else if (intensity === "medium") marks.push({ text: "Moderate", tone: "plain" });
  if (world.contentWarning !== undefined) marks.push({ text: "Content warning", tone: "warn" });
  // Who its maker says it is for, where that changes anything for the person looking.
  if (world.audience === "kids") marks.push({ text: "For kids", tone: "ok" });
  else if (world.audience === "adult") marks.push({ text: "Adults only", tone: "warn" });
  return marks;
}
