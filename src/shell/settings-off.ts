/**
 * What the shell's first file gets in place of the settings reader (settings.ts) in a build with the menu off.
 * With the switch off that file says only "this page hasn't the menu", which carries no settings, so the reader
 * and what it reads from are not loaded at all: an ordinary build asks for nothing more than it did.
 * The build chooses between the two (scripts/build.mjs, `shell-first-settings`).
 */
import type { MenuSettings } from "@nswp/core";

export const shellSettings = (): MenuSettings => ({});
