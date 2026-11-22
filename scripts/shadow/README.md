# BitGate's shadow comparison, BitPortal's part

`npm run shadow:bitgate` puts two answers to "may this world be shown here" side by side, for every world, as
BitGate's plan asks (PR0M3TH3AN/bitgate `docs/shadow-comparison.md`, "BitPortal"):

- **BitPortal's own:** `buildCatalog(...).permits`, the function the room's doors use. Only its allow-list half is
  compared; the adult filter stays BitPortal's own.
- **BitGate's:** the same signed lists, read through BitGate's 30004 reader and evaluated under its allowlist preset:
  each operator's `d=bitportal` list with the operator as its root, and the starter set under its curator.

It is an operator's script on this machine, never part of a visitor's page. It reads public events only, publishes
nothing, holds no key, and writes only to its own output: the log lines (the plan's shape; they name no world) to
the terminal and `.shadow/`, and the reconciliation (by coordinate) to `.shadow/` alone, which git doesn't keep.
BitGate's readers are BitPortal's vendored copy (`vendor/bitgate`, `npm run vendor -- --only bitgate`, from BitGate's
committed tree at a pinned commit).

## Reading the report

`counts.disagree` is every world the two answer differently. Of those:

- **Expected** (`reconciliation.expected`; `counts.expected`): BitGate's design, not a fault.
  - **A list root's own world.** BitGate's allowlist preset never hides a world its root published: the people who
    curate the list can always be seen. BitPortal hides an operator's world that no list names. Recorded, not fixed.
- **Unexplained** (`counts.unexplained`): everything else. Each one is a reader difference to explain and fix in a
  list or in code before anyone switches to BitGate's answer (the plan's 14 days with no unexplained difference).

Reader differences the test finds (`test/shadow-compare.test.ts`), which BitPortal fixes on its side by choosing a
list's copy with the kit's own `resolveList`, as NSWP-08 says:

- a copy of a list dated more than 600 s in the future: BitPortal took it; BitGate leaves it out;
- a list with two `d` tags: BitPortal read the first; BitGate refuses it.

Switching to BitGate's answer is the owner's word, never this script's.
