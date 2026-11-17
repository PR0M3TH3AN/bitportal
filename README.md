# BitPortal

A lobby of doors to independently hosted VR worlds. Each door shows where it
really leads before you go through.

BitPortal is the reference app for the
[Nostr Spatial Web Protocol](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-)
(NSWP) and part of the [BitBlocks](https://bitblocks.network/) family. This is
**Phase 1** of that spec: a read-only lobby. There is no sign-in yet.

Test build: <https://bitportal.vercel.app/>

## What it does

- **The lobby** (`/`) shows worlds as doors, on shelves ranked by
  [BitFeed](https://feed.bitblocks.network/). Each world says why it is there.
- **Opening a door** checks, at that moment, whether the world's site vouches
  for the key that announced it ("Verified").
- **The Airlock** (`/go/`) is the last stop before leaving: the real address,
  the verification result, comfort notes, and a button to continue. Worlds
  send visitors back here when they take a portal.
- **Plain mode** (`/?plain=1`, or Settings) is the same lobby with no BitFeed:
  one list in date order. It exists so the protocol never depends on BitBlocks.

## Privacy rules it follows

- Drawing the lobby contacts Nostr relays only. A world's own site is contacted
  when you open its door, not before. Door art is generated from the world's
  address, so no image is fetched from anyone.
- Destinations travel in the URL fragment, which servers never see.
- A site that hasn't adopted NSWP gets a plain visit, with nothing added to
  its address.
- No analytics, and no server-side code.

## The starter set

A signed-out visitor sees a **starter set**: a hand-picked list signed by a
named key (`src/starter/starter-set.json`). It currently holds the two NSWP
reference worlds and four existing WebXR sites. The four are described by the
curator and always shown as "listed by", never as verified.

To change it, edit `src/starter/listings.json` and run:

```bash
npm run starter-set
```

The curator key lives outside the repo, at `~/.config/nswp/bitportal-curator.key`.

## Develop

Requires Node 22+.

```bash
npm install
```

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npm run build
```

`dist/` is a complete static site; any static host can serve it.

### Vendored dependencies

BitPortal vendors what it depends on and records the exact source commit and
file hashes in `vendor/integrity.json` (BitBlocks convention D7):

| Package | From | Where |
|---|---|---|
| `@nswp/core` | the NSWP repo | `vendor/nswp/` |
| BitFeed standalone | the BitFeed repo | `vendor/bitfeed/` |
| Ubuntu Sans fonts | the bitblocks repo | `public/fonts/` |

```bash
npm run vendor:check   # vendored files still match integrity.json
```

```bash
npm run vendor         # re-vendor from clean sibling checkouts
```

### Deploy

```bash
npm run build && npm run deploy
```

## Not built yet

Sign-in (BitLogin), publishing a world, trust labels (BitGate), paid entry
(BitUnlock), a lobby you can walk around in VR, and rooms in the lobby. See the
NSWP spec's roadmap (§20).

## License

MIT. Vendored packages keep their own licenses.
