# BitPortal

A lobby of doors to independently hosted VR worlds. Each door shows where it
really leads before you go through.

BitPortal is the reference app for the
[Nostr Spatial Web Protocol](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-)
(NSWP) and part of the [BitBlocks](https://bitblocks.network/) family. It covers
**Phase 1** of that spec (the lobby) and the start of **Phase 2** (sign-in and
announcing a world).

Live, and experimental: <https://portal.bitblocks.network/>

## What it does

- **The lobby** (`/`) opens with the room itself, live, at the top of the
  page: the same doors on the same grid, and choosing one there opens it.
  Below, the same worlds are a list of doors on shelves ranked by
  [BitFeed](https://feed.bitblocks.network/). Each world says why it is there.
  The live room is skipped where it can't be drawn or the visitor has asked
  to save data; the page is whole without it.
- **Your doors.** Save a door and it is yours: first on the list, on your own
  wall in the room, and one press away from any page under **Your doors**.
  Saved places are kept on this device and are never published.
- **The room** (`/walk/`) is where you start when you would rather stand
  somewhere than read a list, on a screen or in a VR headset. Your doors are
  on the wall ahead, each in a place it keeps. Suggested doors are on the wall
  behind. Point at a door and select it, or walk through it. Coming back from
  a world, you face the door you left through. The room's furniture is a home
  layout, the same format as a world template's `home.json`, and can be
  replaced in Settings. Click, tap or point at the floor and select to step
  closer to a door. The room's controls come from the NSWP controls kit, the
  same as every world's: on a flat screen a HUD with a row of keys along the
  bottom (1 to 6 press them) and a Menu; in a headset a console that comes up
  above your left wrist, or from the small **Menu** button low in front of
  you. It has Turn around (the other wall is behind you), the room and
  microphone, the list, and a Look section for its colours. Joining the room
  shows your IP address to the others in it, so nothing connects before you
  ask.
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
  when you open its door, not before.
- A door shows a world's **preview** (its own 360° picture) only from a copy
  BitPortal serves itself, checked against the hash in the world's signed
  announcement. A preview BitPortal doesn't mirror is fetched when you open
  that door. Without one, door art is generated from the world's address.
- A preview is held back until you ask for any world with a content warning,
  and for any world that nobody you've chosen has listed.
- Destinations travel in the URL fragment, which servers never see.
- A site that hasn't adopted NSWP gets a plain visit, with nothing added to
  its address.
- Saved doors and the room's layout stay in this browser. The room draws only
  built-in furniture from a layout: no pictures and nothing else that would
  contact another site.
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

When a reference world's announcement changes (a new preview, say), take the
new one without re-signing anything:

```bash
npm run starter-set -- --reference-only
```

Then mirror the previews the set names onto BitPortal's own site:

```bash
npm run previews         # copy each preview into public/previews/, checked against its hash
npm run previews:check   # the mirrored files still match
```

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
| `nswp-sdk/three` (avatars, voice, rooms, the headset console), `nswp-sdk/home` (the room's furniture) and `nswp-sdk/ui` (the HUD) | the NSWP repo | `vendor/nswp/` |
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

MIT. Vendored packages and the fonts keep their own licences:
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) lists them.
