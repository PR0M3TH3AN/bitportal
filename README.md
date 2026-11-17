# BitPortal

A lobby of doors to independently hosted VR worlds. Each door shows where it
really leads before you go through.

BitPortal is the reference app for the
[Nostr Spatial Web Protocol](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-)
(NSWP) and part of the [BitBlocks](https://bitblocks.network/) family. It covers
**Phase 1** of that spec (the lobby) and the start of **Phase 2** (sign-in and
announcing a world).

Test build: <https://bitportal.vercel.app/>

## What it does

- **The lobby** (`/`) shows worlds as doors, on shelves ranked by
  [BitFeed](https://feed.bitblocks.network/). Each world says why it is there.
- **The walk-in lobby** (`/walk/`) is the same doors as a hall you stand in,
  on a screen or in a VR headset. Point at a door and select it, or walk
  through it. Press **Join the room** to see and talk to other visitors;
  joining shows your IP address to them, so nothing connects before you ask.
- **Opening a door** checks, at that moment, whether the world's site vouches
  for the key that announced it ("Verified").
- **The Airlock** (`/go/`) is the last stop before leaving: the real address,
  the verification result, comfort notes, and a button to continue. Worlds
  send visitors back here when they take a portal.
- **Your identity** (`/account/`) is where you sign in, with
  [BitLogin](https://login.bitblocks.network/) or any Nostr signer it supports.
  It is the only place BitPortal ever asks you to sign in.
- **Announce a world** (`/publish/`) checks your site, builds the announcement,
  writes the manifest file your site needs to host to be shown as verified,
  and publishes to your own relays. Nothing is published until you press the
  button.
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

The set and the curator's four listings are also **published to public Nostr
relays**, so any NSWP client can read them. The lobby starts from the bundled
copy and takes a newer one from relays if the same curator key has signed it.
After re-signing, publish each new event with the NSWP repo's CLI:

```bash
node ../Nostr-Spatial-Web-Protocol--NSWP-/packages/cli/dist/nswp.mjs publish <event.json>
```

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

Testing without a headset: `/walk/?xr=emulate` loads an in-page emulator that
pretends to be a Meta Quest 3, and `?mic=tone` sends a test tone instead of
asking for the microphone. `/publish/?signer=test` signs with a throwaway key
and never publishes, to try the form without an account.

### Vendored dependencies

BitPortal vendors what it depends on and records the exact source commit and
file hashes in `vendor/integrity.json` (BitBlocks convention D7):

| Package | From | Where |
|---|---|---|
| `@nswp/core` | the NSWP repo | `vendor/nswp/` |
| BitFeed standalone | the BitFeed repo | `vendor/bitfeed/` |
| `nswp-sdk/three` (avatars, voice, rooms) | the NSWP repo | `vendor/nswp/` |
| BitLogin widget | the bitlogin repo's `release/` folder | `public/vendor/bitlogin/` |
| Ubuntu Sans fonts | the bitblocks repo | `public/fonts/` |

```bash
npm run vendor:check   # vendored files still match integrity.json
```

```bash
npm run vendor         # re-vendor from clean sibling checkouts
```

BitLogin is different from the others in one way: it is served as its own
static files under `/vendor/bitlogin/`, never bundled, because the widget finds
its worker relative to its own address. It runs same-origin with BitPortal, so
it is part of what BitPortal has to trust. The vendor script refuses a copy
that doesn't match BitLogin's own `integrity.json`. Before vendoring, run
`npm run release:artifacts` in the bitlogin checkout.

### Deploy

```bash
npm run build && npm run deploy
```

## Not built yet

Entering a world under your identity, shelves from the people you follow,
trust labels (BitGate) and paid entry (BitUnlock). Rooms are a first cut:
guests only, no moderation. See the
NSWP spec's roadmap (§20).

## License

MIT. Vendored packages keep their own licenses.
