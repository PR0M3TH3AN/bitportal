/**
 * The marks on a door plate: what a visitor is told before they commit
 * (NSWP spec §6.7). The list and the walk-in hall draw the same marks.
 */
import { categoryWords, itemsWords, type World } from "@nswp/core";

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

export function plateMarks(world: Pick<World, "modes" | "comfort" | "contentWarning"> & Partial<Pick<World, "audience" | "category" | "items">>, fit: { ok: boolean; reason: string }, verified: boolean, rating: string = ""): Mark[] {
  const marks: Mark[] = [];
  // What kind of place its maker says it is (NSWP-01): a game, an experience, a place to meet, an app, a site.
  const category = categoryWords(world.category);
  if (category) marks.push({ text: category, tone: "plain" });
  // What the people this visitor has reason to trust thought of it (NSWP-13): "★ 4.5 from 12". Never a count of
  // strangers; with nobody counted there is no mark.
  if (rating) marks.push({ text: rating, tone: "plain" });
  const kind = placeKind(world);
  if (kind) marks.push({ text: kind, tone: "plain" });
  if (verified) marks.push({ text: "Verified", tone: "ok" });
  if (!fit.ok) marks.push({ text: fit.reason, tone: "warn" });
  // What it does with the things visitors carry (NSWP-17), told before anyone goes in: a place where items are
  // part of the game is somewhere other people can reach you with them. Said as a caution; one that only lets
  // items work is said plainly.
  const carried = itemsWords(world.items);
  if (carried) marks.push({ text: world.items === "play" ? "Items in play" : "Items work", tone: world.items === "play" ? "warn" : "plain" });
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
