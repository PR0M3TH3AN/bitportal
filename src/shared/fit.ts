/**
 * Whether a world suits the device a visitor is on, said plainly and before
 * they go.
 *
 * A world's maker says what it is for (`modes`, `perf` in its announcement).
 * That is a declaration, and a declaration can be wrong or out of date. So
 * this copy can also try each world itself, ahead of time, on a phone-sized
 * touch screen, at a desk and with a headset, and keep what it found
 * (`src/starter/checked.json`, written by `scripts/probe.mjs`). What it found
 * is said first, and the maker's word second, and the two are never mixed up.
 *
 * An Airlock can't try a world at the moment of crossing: loading it is
 * visiting it, and the visit is what the Airlock is there to ask about.
 */
import checkedJson from "../starter/checked.json";

export type FormName = "phone" | "desk" | "headset";
export type Verdict = "works" | "fails";
/** What this copy found for one world. A form left out was not confirmed either way. */
export interface Checked {
  phone?: Verdict;
  desk?: Verdict;
  headset?: Verdict;
  /** The day it was tried, as YYYY-MM-DD. */
  at: string;
}
export interface Fit {
  /** "bad": don't expect it to work. "warn": its maker says it isn't for this. "ok": tried and it ran. "plain": only its maker's word, or nothing. */
  tone: "ok" | "plain" | "warn" | "bad";
  /** A sentence for the visitor. */
  text: string;
  /** Two or three words, for a tag. */
  short: string;
}

const NAMES: Record<FormName, { on: string; a: string }> = {
  phone: { on: "on a phone", a: "a phone" },
  desk: { on: "at a desk", a: "a desktop" },
  headset: { on: "in a headset", a: "a headset" },
};
const VERDICTS: readonly unknown[] = ["works", "fails"];

/** What was found, with anything unreadable left out. */
export function cleanChecked(input: unknown): Checked | null {
  if (!input || typeof input !== "object") return null;
  const c = input as Record<string, unknown>;
  if (typeof c.at !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(c.at)) return null;
  const out: Checked = { at: c.at };
  for (const form of ["phone", "desk", "headset"] as const) if (VERDICTS.includes(c[form])) out[form] = c[form] as Verdict;
  return out;
}

const found = new Map<string, Checked>();
for (const [id, value] of Object.entries((checkedJson as { worlds?: Record<string, unknown> }).worlds ?? {})) {
  const clean = cleanChecked(value);
  if (clean) found.set(id, clean);
}
/** What this copy found for a world, by its coordinate (`37300:<pubkey>:<d>`), or undefined if it never tried it. */
export const checkedFor = (id: string | undefined): Checked | undefined => (id ? found.get(id) : undefined);

/** The form a visitor is in: a headset if they left one to come, and otherwise how they are using a flat screen. */
export function formOf(o: { immersive?: boolean; form?: "touch" | "desk" | undefined; touchMain: boolean }): FormName {
  if (o.immersive) return "headset";
  if (o.form === "touch") return "phone";
  if (o.form === "desk") return "desk";
  return o.touchMain ? "phone" : "desk";
}

/** What a world's maker says about a form: true, false, or null where they say nothing that settles it. */
export function declared(world: { modes: string[]; perf?: string } | null | undefined, form: FormName): boolean | null {
  if (!world || world.modes.length === 0) return null;
  const immersiveOnly = world.modes.every((m) => m === "immersive-vr" || m === "immersive-ar");
  if (form === "headset") return world.modes.includes("immersive-vr");
  if (immersiveOnly) return false;
  if (form === "phone" && world.perf === "desktop") return false;
  return true;
}

/**
 * What to tell a visitor about a world and the form they are in. What this
 * copy found comes first: a world that didn't load when tried is said to
 * have failed, whatever its maker says.
 */
export function fitFor(world: { modes: string[]; perf?: string } | null | undefined, form: FormName, checked?: Checked): Fit {
  const n = NAMES[form];
  const said = declared(world, form);
  if (checked?.[form] === "fails") {
    const how = form === "headset" ? "with a made-up headset" : form === "phone" ? "on a phone-sized touch screen" : "at a desk";
    return { tone: "bad", short: `Failed ${n.on}`, text: `When this copy tried it ${how}, on ${checked.at}, it didn't load. It may not work here.` };
  }
  if (said === false) {
    const why = form === "headset" ? "Its maker doesn't say it works in a headset: it opens as an ordinary page." : form === "phone" && world?.perf === "desktop" ? "Its maker says it needs a desktop computer." : "Its maker says it is for VR headsets only.";
    return { tone: "warn", short: `Not made for ${n.a}`, text: why };
  }
  if (checked?.[form] === "works") {
    // A headset was not put on to try it: one was made up on the page. A phone was a phone-sized touch screen. Say so.
    const text =
      form === "headset"
        ? `This copy tried it with a made-up headset, on ${checked.at}, and a VR session started. Nobody has worn one to check.`
        : form === "phone"
          ? `This copy tried it on a phone-sized touch screen, on ${checked.at}, and it ran.`
          : `This copy tried it at a desk, on ${checked.at}, and it ran.`;
    return { tone: "ok", short: `Checked ${n.on}`, text };
  }
  if (said === true) return { tone: "plain", short: `Says it runs ${n.on}`, text: `Its maker says it runs ${n.on}. This copy hasn't confirmed that.` };
  return { tone: "plain", short: "Not checked", text: `Nothing says whether it runs ${n.on}, and this copy hasn't tried it.` };
}
