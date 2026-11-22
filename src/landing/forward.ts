/**
 * Old links to the front page. Until 2026-11-21 the lobby was the front page,
 * so a link someone kept to `/#…` (a world's details, the doors, a list) or
 * `/?list=…` (a list someone shared) meant the lobby. It is at `/doors/` now,
 * and an old link lands on the same thing there, with the same words after
 * the `?` and the `#`.
 *
 * Only what this site's own pages ever put there is carried: anything else
 * after the `?` stays where it is, so a link can't send someone on with a
 * question of its own.
 */
/** What only the front page reads, and the lobby never wrote: these stay. */
const OWN = new Set(["notice", "plain"]);

export function oldLinkTarget(search: string, hash: string): string | null {
  const query = new URLSearchParams(search);
  const kept = new URLSearchParams();
  for (const [key, value] of query) if (!OWN.has(key)) kept.set(key, value);
  const rest = kept.toString();
  const after = hash.replace(/^#/, "");
  if (!rest && !after) return null;
  return `/doors/${rest ? `?${rest}` : ""}${after ? `#${after}` : ""}`;
}
