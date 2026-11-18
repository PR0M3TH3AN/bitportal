# BitPortal

A lobby of doors to independently hosted VR worlds. Each door shows where it
really leads before you go through.

BitPortal is the reference app for the
[Nostr Spatial Web Protocol](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-)
(NSWP) and part of the [BitBlocks](https://bitblocks.network/) family. It covers
**Phase 1** of that spec (the lobby) and the start of **Phase 2** (sign-in and
announcing a world).

Live, and experimental: <https://portal.bitblocks.network/>

BitPortal is one client of the protocol, not the protocol. Anything a second
lobby or a world would need to agree with it on is in
[the protocol documents](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/tree/main/protocol), not here: start with
[how worlds are found](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/08-lists.md) for how a world gets a door, and
[what a world owes a visitor](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/09-what-a-world-owes.md) to build one.

## What it does

- **The lobby** (`/`) opens with the room itself, live, at the top of the
  page: the same doors on the same grid, and choosing one there opens it.
  Below, the same worlds are a list of doors on shelves ranked by
  [BitFeed](https://feed.bitblocks.network/). Each world says why it is there.
  The live room is skipped where it can't be drawn or the visitor has asked
  to save data; the page is whole without it.
- **Your lists.** The lobby starts with BitPortal's own list, and that is
  only one list. Follow anyone's by its address and it gets a shelf of its
  own; put BitPortal's away if you'd rather. A link of the form
  `/?list=<naddr>` looks a list up and asks before following it. Which lists
  you follow is kept on this device and tells nobody.
- **Worlds nobody has listed.** The lobby says how many worlds have announced
  themselves that none of your lists name, and shows them when you ask, on a
  shelf marked unreviewed: three from one key at most, no pictures until you
  ask for each, and nothing checked until you open a door.
- **Find a world** by a word, a topic or an address, among everything on the
  page. It asks nobody.
- **Your doors.** Save a door and it is yours: first on the list, on your own
  wall in the room, and one press away from any page under **Your doors**.
  Saved places are kept on this device and are never published.
- **Your look** (`/look/`) is how other people see you when you share a room:
  a figure built from a few parts and colours, with a mark that is yours. It is
  kept on this device. The page before each world asks whether to go as
  yourself or plain.
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
  you. With controllers of any make, a stick turns you and steps you where
  you point, and B or Y opens the console; tracked hands work by pinching.
  Smooth walking is a choice under **Moving**. All of it is extra: pointing
  and selecting does everything. It has Turn around (the other wall is behind you), the room and
  microphone, the list, and a Look section for its colours. Joining the room
  shows your IP address to the others in it, so nothing connects before you
  ask.
- **Opening a door** checks, at that moment, whether the world's site vouches
  for the key that announced it ("Verified").
- **Going by name.** Signed in, you can go to a verified world as yourself:
  the Airlock makes a throwaway key for the trip and has your own signer sign
  a pass saying it speaks for you there for four hours
  ([NSWP-10](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/10-identity.md)).
  The world never gets your key. People in a room there see your name, and
  your mark with a frame round it. It is a choice on every trip, never the
  first one offered, and the Airlock never asks you to sign in: if your
  session can't sign just then, it says so and you choose again.
- **Panels.** In the room you can hang notes, pictures and video from your
  own device in frames, move them by the bar, resize them and put them away.
  They are kept in this browser, with any file you hang, and are there next
  visit. Nothing is uploaded, and nobody else in the room sees them. A panel
  can't show another website: no page is allowed to draw one. In a headset
  you write on a keyboard drawn in the room, and choose from **Your pictures
  and video**: everything you have hung, and every picture you take with the
  camera. The headset's own files are the browser's to show, so adding a new
  file from the device is done on a flat screen.
- **A terminal on your own computer.** Run a small program, the Bridge
  ([what it is and what it trusts](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/browser/bridge.md)),
  on a computer of yours, and open the link it prints. The room then offers
  **A terminal on** that computer, in a panel: type with a real keyboard, or
  in a headset on the drawn one, which has Esc, Tab, Ctrl and the arrows.
  The computer answers your key and nobody else's, and asks on its own
  screen, with a code that matches the panel's, before a terminal opens.
  Buttons along the panel's foot look back through what has scrolled away,
  make the letters larger or smaller, and copy what is on the screen. Up to
  four terminals can be open on a computer at once.
- **Speak instead of typing.** A terminal has a Speak button, and the
  keyboard drawn in a headset has a Speak key. If your computer's Bridge was
  started with `--voice`, your computer turns what you say into text itself
  and your voice goes nowhere else. Without that, your browser's own speech
  recognition is used if it has one, and you are told first if it would send
  your voice to the browser's maker. What you say is typed; Enter is yours.
- **A home of your own.** If you have built a world, you can start there
  in place of BitPortal's room: Settings → **Where you start**. BitPortal
  checks that the world is yours both ways (you announced it with your key,
  and its site admits your key), that it is on an `https` address, and that
  it says it can be a home. After that, going home from anywhere takes you
  there with nothing asked, and **Your doors** in your home brings you to
  BitPortal's room, where your saved doors, your sign-in and your computers
  stay. If your home doesn't answer, you start in BitPortal's room and are
  told why.
- **Your terminals in a world you are building.** Under Your computers,
  name a world as yours (its address, typed by you), start your Bridge with
  `--world` and that address, and **Go to** it from your room. Your terminals
  come with you, and only you see them there. That world's own page draws
  them, so its code can read and type into your shell: name only worlds you
  write yourself. No other world is ever handed anything of the kind, and
  the computer still asks before each terminal opens.
- **Panels that come along, and a room that stays put.** Any panel can be
  made see-through (dark parts more than light, so a terminal can be letters
  in the air) and pinned in your view. Refreshing the page puts you back
  where you stood, with your terminals where they hung.
  Which computers you have added is kept in this browser and sent nowhere.
  A terminal can do anything you can do on that computer, so add only a
  computer you started the Bridge on yourself. No world can see or reach
  any of this.
- **Crossing costs as little as a browser allows.** Leaving the room, its
  walls rise round you into a small chamber; you arrive in a world standing
  in the same chamber, and its doors open when the world is ready. From a
  headset that is three actions at most: the door, the Airlock's Continue,
  and Enter VR at the other end, which is offered first, large and alone. Two
  to a world you've told the Airlock to skip for. Coming home works the same
  way
  ([NSWP-02](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/02-doors.md)).
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
- The computers you add for a terminal are kept in this browser. What you
  type into a terminal goes straight to your computer, sealed; relays carry
  only the sealed notes the two use to find each other.
- No analytics, and no server-side code.

## The starter set

A signed-out visitor sees a **starter set**: a hand-picked list signed by a
named key (`src/starter/starter-set.json`). It currently holds the eight worlds made for
BitPortal and four existing WebXR sites. The four are described by the
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

## What this copy shows, and who decides

Whoever hosts a copy of BitPortal answers for what it shows. Their answers are
in one file, `src/shared/instance.ts`, and they bind every visitor of that
copy:

| Setting | The copy at bitblocks.network | Means |
|---|---|---|
| `operators` | one key | Whose lists count as this copy's own |
| `allowList` | `bitportal` | The name (`d`) of the operator's list: an ordinary NIP-51 list, kind 30004 |
| `allowListOnly` | `true` | Show a world only when the operator's list or the starter set has it. No lists a visitor follows, no worlds nobody has listed |
| `allowAdult` | `false` | Never show a world that is for adults, and never send anyone to one |

A world says who it is for with `audience` on its announcement: `kids`,
`general` or `adult`
([NSWP-01](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/01-worlds.md)).
A world with a content warning and no audience is taken as adult. That is the
maker's word and a maker can lie, which is why the list comes first: on a
strict copy a world nobody listed isn't shown whatever it says about itself,
and a listed world that says it is for adults is dropped all the same.

The same answer holds in the lobby, the room, saved doors and the Airlock. The
Airlock still shows the address of a world it won't send anyone to: this is
what the site does, not a wall around the visitor. The lobby says in plain
words what the copy shows and how many worlds it is holding back.

**The operator, signed in with their key,** sees a shelf of worlds waiting to
be listed, and each world's page has "List on this site" or "Take off this
site's list". Either signs a new version of the one list and publishes it to
the relays. A world for adults can't be listed. Nobody else sees any of this.

**Hosting your own copy:** put your own key in `operators` and choose your own
answers. `OPEN_POLICY` in the same file is the copy with no host's list and
nothing held back, which is how BitPortal behaved before.

Not built: a list of what a host refuses (a strict copy has no use for one),
a kids-only setting, and BitGate, which will let each visitor tighten what
they see and never loosen what the host decided.

## Sharing a screen in the room

Someone at a desk or laptop, joined in the room, can press "Share your
screen". Everyone in the room is told, and nobody is shown anything: each
person who wants to watch selects the sharer in People and presses "Watch".
It opens on a panel of their own, to move, size, pin or put away. The sharer
sees how many are watching, and stopping or leaving ends it for everyone.

## Staying joined as you travel

Someone who is in a room, in BitPortal's own room or in a world, stays joined
when they go through a door: the world at the other end joins its open room
without asking again and tells them so
([NSWP-02](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/02-doors.md)).
The Airlock shows it, with a box to untick.

A microphone goes along only after the visitor ticks "Keep my microphone on
between worlds" on the Airlock, once. It is remembered in the browser. It is
off by default because the link that says "microphone on" is something anyone
could write and send: without the tick, a link in a message could put a live
microphone into a room of strangers. A private room doesn't travel.

## Hashtags

A world's topics are its hashtags. Press one on a world's page, or in "Find a
world", to see every world here that carries it. "More #tag" and "Less #tag"
tell the ranking what the visitor likes: worlds with a liked hashtag move up
and say so, the first three liked hashtags get a shelf each, and a disliked
one moves its worlds down without hiding them. Settings lists them and can
forget any. What a visitor likes is kept in this browser
(`bitportal:hashtags`) and sent nowhere.

## How a world gets a door

On the copy at bitblocks.network, a world gets a door when the operator lists
it (see "What this copy shows" above). On an open copy nobody has to ask: a
world that announces itself is on the shelf of announced worlds for any
visitor who opens it. Either way anyone can publish a list
([NSWP-08](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/08-lists.md)).

To be on BitPortal's own list, a publisher opens a request with the form at
`.github/ISSUE_TEMPLATE/list-a-world.yml`. To see what is waiting, with or
without a request:

```bash
node ../Nostr-Spatial-Web-Protocol--NSWP-/packages/cli/dist/nswp.mjs worlds --verify --not-on src/starter/starter-set.json
```

It prints every world announced on the relays that the list doesn't have,
newest first, and whether each one's site vouches for it.
Adding a world is the owner's decision each time, and means the steps under
"The starter set" above.

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
| `nswp-sdk/three` (avatars, voice, rooms, the headset console), `nswp-sdk/home` (the room's furniture), `nswp-sdk/ui` (the HUD) and `nswp-sdk/terminal` (the terminal panel, fetched only when one is opened) | the NSWP repo | `vendor/nswp/` |
| BitLogin widget | the bitlogin repo's `release/` folder | `public/vendor/bitlogin/` |
| Ubuntu Sans fonts | the bitblocks repo | `public/fonts/` |

```bash
npm run vendor:check   # vendored files still match integrity.json
```

```bash
npm run vendor         # re-vendor from clean sibling checkouts
```

```bash
npm run vendor -- --only nswp   # one of them (nswp, bitfeed, bitlogin, fonts), leaving the others as recorded
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

Going by name in BitPortal's own room (it works in worlds), profile pages,
a feed, messages and notifications, shelves from the people you follow
(it waits for names and profiles), making a list from inside BitPortal, search
beyond what the page already holds, hashtags in the room (they are in the
lobby), trust labels (BitGate) and paid entry
(BitUnlock). Rooms are a first cut:
guests only, no moderation. See the
NSWP spec's roadmap (§20).

## License

MIT. Vendored packages and the fonts keep their own licences:
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) lists them.
