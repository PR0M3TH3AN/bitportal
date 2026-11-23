// Which of the kit's entries this site vendors (scripts/vendor.mjs). A file of its own so it can be tested: the
// vendor script does its work as it is loaded.

/**
 * The kit's entries (the `exports` of its packages/sdk/package.json), and what this site does with each. Every one
 * the kit has must be named here, taken or left: a new entry in the kit that this list doesn't know stops the
 * vendoring, so it can't be silently left out. (`nswp-sdk/bag` was, for a kit version: the release vendored without
 * it, and nothing said so.)
 */
export const SDK_TAKEN = ["./three", "./home", "./ui", "./terminal", "./menu", "./menu-above", "./bag"];
export const SDK_LEFT = {
  // A world's own way in (portals, arrival). BitPortal isn't a world: what it uses of that comes with the others.
  ".": "the world's own entry, which this site doesn't use by itself",
};
/** The source files to build, from the kit's own list. Throws where the two lists disagree, saying how. */
export function sdkEntries(exported) {
  const names = Object.keys(exported ?? {});
  const unknown = names.filter((n) => !SDK_TAKEN.includes(n) && !(n in SDK_LEFT));
  if (unknown.length) throw new Error(`The kit has ${unknown.length === 1 ? "an entry" : "entries"} this site's vendor script doesn't know: ${unknown.map((n) => `nswp-sdk${n.slice(1)}`).join(", ")}. Add each to SDK_TAKEN in scripts/vendor.mjs (with its alias in scripts/build.mjs and its path in tsconfig.json), or to SDK_LEFT with why it is left.`);
  const gone = SDK_TAKEN.filter((n) => typeof exported?.[n] !== "string");
  if (gone.length) throw new Error(`This site takes ${gone.map((n) => `nswp-sdk${n.slice(1)}`).join(", ")}, which the kit no longer has.`);
  return SDK_TAKEN.map((n) => exported[n]);
}
