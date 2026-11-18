# Third-party notices

BitPortal's own code is MIT licensed (`LICENSE`). It ships with the work of
others, copied in by `npm run vendor` and recorded in `vendor/integrity.json`.
Each keeps its own licence.

| What | Where | Licence | From |
|---|---|---|---|
| NSWP library and SDK | `vendor/nswp/` | MIT | [Nostr Spatial Web Protocol](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-). The libraries built into it are listed in `vendor/nswp/THIRD-PARTY-NOTICES.md` |
| BitFeed, the ranking engine | `vendor/bitfeed/` | MIT (`vendor/bitfeed/LICENSE`) | BitFeed, by the same author. Its source repository is not public yet; the built file here is what runs |
| BitLogin's sign-in widget | `public/vendor/bitlogin/` | MIT (`public/vendor/bitlogin/LICENSE`) | [BitLogin](https://github.com/PR0M3TH3AN/bitlogin) |
| Ubuntu Sans and Ubuntu Sans Mono | `public/fonts/` | Ubuntu Font Licence 1.0 (`public/fonts/LICENCE.txt`) | Canonical Ltd, <https://design.ubuntu.com/font> |
| three.js | built into `dist/` | MIT | [three.js](https://threejs.org/) authors |

The vendored files carry these libraries, each under the MIT licence, with
their short notices left in place:

| Library | In | By |
|---|---|---|
| @noble/curves, @noble/hashes, @noble/ciphers | NSWP, BitFeed, BitLogin | Paul Miller |
| @scure/base | NSWP, BitLogin | Paul Miller |
| @scure/bip39 | BitLogin | Patricio Palladino, Paul Miller |
| tldts, with the [Public Suffix List](https://publicsuffix.org/) (MPL 2.0) inside it | NSWP | Rémi Berson; Mozilla Foundation |
| [xterm.js](https://github.com/xtermjs/xterm.js) (`@xterm/headless`) | NSWP's terminal panel | The xterm.js authors |

A build (`npm run build`) also writes the notices of everything it bundled
next to the scripts in `dist/`.
