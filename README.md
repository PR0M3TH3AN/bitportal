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
  microphone, the list, and a Display section for its colours. Any tab of
  the Menu can be kept on the row of keys ("Keep this tab on your bar", four
  at most), and the tabs you keep go with you into every world. Signed in,
  "Send out a post" under Room opens "My public feed": your own Nostr posts,
  and the place to write another. Joining the room
  shows your IP address to the others in it, so nothing connects before you
  ask.
- **Opening a door** checks, at that moment, whether the world's site vouches
  for the key that announced it ("Verified").
- **Going by name.** A world is told nothing about who you are as you
  arrive: the Airlock sends no pass and no key. To be known by name in a
  world you sign in there, once: "Sign in, at bitlogin.network" under You in
  its menu opens BitLogin's own window, and BitLogin's signer makes a pass
  saying a throwaway key speaks for you there for four hours at most
  ([NSWP-10](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/10-identity.md)).
  The world never gets your key. People in a room there see your name, and
  your mark with a frame round it. The Airlock never asks you to sign in and
  never offers "by name": its line says that signing in is done there.
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
- **Your identity** (`/account/`) is where you sign in to BitPortal. Its
  button opens a window at [BitLogin](https://bitlogin.network/)'s own
  address, and you sign in there: nothing is typed on a page of BitPortal.
  Announce a world has the same button, and no other page asks.
- **Announce a world** (`/publish/`) checks your site, builds the announcement,
  writes the manifest file your site needs to host to be shown as verified,
  and publishes to your own relays. Nothing is published until you press the
  button.
- **Plain mode** (`/?plain=1`, or Settings) is the same lobby with no BitFeed:
  one list in date order. It exists so the protocol never depends on BitBlocks.

## The Airlock, kept short

The Airlock shows three things: where the door leads, anything you have to
know or answer before going, and the way through. Everything else is one
press away under "More about this place": the full address, what the world
says about itself, how you will arrive, whether to stay in the room you were
in, and whether to skip this screen next time. Opening it holds the crossing
where it is, including the countdown to a world you have told it to skip
for, so nobody is taken through while they are reading.

One line always says what goes with you ("Going with nothing of yours,
staying in the room. Signing in is done there, with bitlogin.network."),
with Change beside it. A question that has to
be answered, such as whether to block someone everywhere, stays in front.

The address is on one line, whole, sized to fit. It is never cut short.

A screen you had filled is the first thing looked for when you arrive
anywhere, the room included, and it is filled again at your first press of
any kind. A browser won't fill the screen with no press at all.

### Only seen when there is something to see

The first time you go anywhere, the Airlock stops you and shows the real
address. After that it goes straight through to a place you have been
before: you are shown where you are going, with a Stop button, for the
second or so the door takes to check, and then you are there.

It only does that when every one of these holds:

- the site still proves it is who it says, checked that moment;
- it is on this copy's list;
- you have been through the Airlock to it before, and its publisher is the
  same one;
- nothing about it has changed, nothing is warned about, nothing is waiting
  for an answer, and it suits the device you are on.

If any one fails, the whole screen comes back and you are asked. You can
bring it back yourself three ways: "Stop here" while the door is being
checked, "Always stop here for this world" under "More about this place",
or the switch in Settings ("Go straight through doors to places I've been
before"), which makes it stop at every door.

On the way through, staying in a room goes along with you and a microphone
only if you had already said it may, as on the way home.

## Whether a world suits your device

A world's maker says what it is for. BitPortal also tries each world on its
list itself, on a phone-sized touch screen, at a desk and with a made-up
headset (`npm run probe`, which writes `src/starter/checked.json`), and the
Airlock tells you what it found before what the maker says:

- **It failed when tried** on the kind of device you are on: said in red,
  before you go.
- **Its maker says it isn't for this:** a headset-only world on a phone, a
  desktop-only world on a phone, a page that isn't made for a headset. Said
  in amber, before you go.
- **It ran when tried**, or only its maker's word is known: under "More
  about this place", and the two are never mixed up.

The Airlock can't try a world at the moment you cross. Loading a world is
visiting it, and the visit is what the Airlock asks about. So the trying is
done ahead of time by whoever runs this copy. A form the probe couldn't
confirm either way is left out: a world is never called broken for something
only a software renderer or a made-up headset might get wrong.

## Who you are

`/account/` is the one page where anyone starts signing in. It offers three
things, each as easy as the others: stay anonymous, sign in or make a
profile, and, once signed in, be someone else or sign out. Signing in is
done at BitLogin's own address (bitlogin.network), in a window of its own
that the page's button opens, with "Powered by BitLogin" under the button.
The page has no sign-in form and no password field. BitPortal is an
application to BitLogin's signer: it says what it asks for, the window
lists it, you allow it once, and the signer signs that and nothing else.
BitPortal holds no key and no session. "Be someone else" opens that window
at BitLogin's account chooser.

It is the same page on a phone, a computer and a headset's own screen. The
room's menu leads to it ("You", then "You are a guest. Sign in"), and it
leads back to the room. From inside VR the session is ended to show the
page, and the way back takes you into VR again.

It is a place, not only a page. Behind the page is the room's own ground
and sky, and the crossing's room is at both ends: it opens round you as you
arrive from a world or from your room, and comes up again as you leave. The
panel in front of you is still the page, at this site's address, and what
is on it is a button: what you type is typed in BitLogin's window, at
BitLogin's address. In a headset it is seen on the headset's flat
screen, because an immersive session can't show a page.

### Signed in at each world, once

You sign in to BitPortal once, here. A world is told nothing about who you
are as you arrive: the Airlock sends no pass and no key, and offers no "by
name". To be known by name in a world you sign in there, once, in
BitLogin's window, as the same profile, and BitLogin's signer makes the
pass. A world never has a sign-in form of its own.

"Go by my name in my own room" on this page is ticked until you untick it.
It is only about BitPortal's own room: unticked, you stay signed in here
and are a guest in your room too. Nothing on a link can make you signed in
or send you anywhere by name.

### Your look, changed in your room

"Change how you look" is in the room's menu under "You", and opens "Your
look": every colour and part, each stepping through its list, and "Surprise
me". Your own figure stands in the room and changes as you do. It is the
same menu on a phone, at a desk and on a headset's wrist. The page at
`/look/` still does the same with a colour picker.

Every world's menu has "Change how you look" too. It brings you here by the
crossing's room, with the menu already open on your look, and "Back" (the
first key) takes you to the world you came from, wearing it. A world never
changes your look itself: a look a world could set is a mark it could follow
you by. Your look is kept in this browser, and with your profile if you keep
your settings there, so another device starts from it.

### Signing in from inside a world

Every world's menu has one row for it under "You": "Sign in, at
bitlogin.network". A world never shows a sign-in form of its own, so
pressing it opens BitLogin's own window, which asks you once. Nothing is
typed in the world, and you don't leave it. The row then reads "Signed in
as" and your name, with "Sign out here"; your profile card is at the head of
the You tab, and "Signed in as" shows at the top centre of the view when
that changes. Signing out there makes you a guest in that world, and
nowhere else.

The older row, "You are a guest here. Sign in", left the world for this
page. It is not shown where the client named a signer, and BitPortal does.
A world can still ask for this page with `who=1` on a door back to itself
(NSWP-10). A link is something anyone can write, so that request only ever
shows you this page. It signs nobody in, and the page offers only the way
back: "Back to *that world*", or "Go back as a guest" if you haven't signed
in. Either takes you through the Airlock, which checks the door as it
checks any other. The door is kept for the tab by the Airlock: this page
never takes a way back from its own address.

Signed in, your profile takes the width of the page.

## Names and pictures

People are shown by the name they chose for themselves on Nostr, never by a
string of hex: you, on every page, and whoever signed a list or announced a
world. Where which key did something is what matters (a list's signer, a
world's announcer), the short form of the key is shown beside the name,
because anyone can call themselves anything. Someone with no name is shown
by the short form of their key.

Profiles are read from your own relays, kept in this browser, and asked for
again in the background, so a page shows names at once. Your own picture is
on the sign-in page and beside your name.

When you sign in at a world, the pass BitLogin's signer makes carries your
name and where your picture is, both from your Nostr profile, so the people
in a room see who you are. Your own room here does the same: BitLogin's
signer signs a pass for BitPortal's own room, and
you see each other's names and pictures. A picture over someone's head is a
button: press it to choose them, and the menu comes up on what you can do.

A picture is fetched from wherever its owner keeps it, which tells that
place your address, as reading Nostr anywhere does. "Show people's own
pictures" in Settings turns that off, here and in every world. A picture
shows only if the place that holds it lets a web page read it.

## How old a world's controls are

Each world carries its own copy of the kit that draws its menu and moves
you about, and says which version in its manifest. When that is older than
the one this copy of BitPortal has, or the world doesn't say, the Airlock
tells you under "More about this place". The world still works: it only
misses what was added since. It is not a warning, and it changes nothing
about whether or how you go through the door.

Signing in, your look, the Airlock and your lists are BitPortal's, so they
are always the newest whatever a world was built with.

## What you prefer, in every world

Settings has "In every world": fill the screen, move the intense way at a
desk (the mouse looks round, keys walk), how fast the view turns, and how
wide you see. They are what you prefer, not what you last did. Every world
you enter starts that way: pressing Escape in one world, or using a phone
for a while, doesn't change the next. Each has a control in any world's menu
as well, and changing it there changes it everywhere.

The Airlock starts from these, so a door opened from the front page or from
your list of doors takes them along as a door in the room does. A browser
fills the screen only on a press, so that happens at your first key or click
in each world. The field of view is for a desk: on a phone each world fits
its own view to the window, and a headset has its own.

## Your settings, on your other devices

Everything BitPortal knows about you is kept in the browser you are using.
That is fast, works with no network, and means nothing about you is anywhere
else. It also means a second device starts from nothing.

So, once you are signed in, one note is kept on your relays,
sealed with your own key (NIP-44) so that nobody else can open it, relays
included. It is ordinary Nostr application data (NIP-78, kind 30078), named
`bitportal/settings`.

- **The browser's copy is still the one that is used.** A page starts from
  it at once, as before. The note is fetched behind it, and whichever of the
  two changed a setting last is kept, a section at a time. The first time a
  browser meets your profile, it takes what the profile has.
- **What is in it:** your volumes, the size of your text and whether things
  move, how you move at a desk and in a headset, your saved doors (which
  doors and where, not their announcements), the lists you follow, your
  hashtags, your home, your look, your room, the Airlock's switch, and who
  you have blocked.
- **What never is:** where you have been and which sites you have checked,
  so a new device is shown the Airlock once; whether your microphone may
  travel and whether you hear other people's music, which are said on each
  device; going by name as a habit; your computers and the worlds you are
  building; and your own music, which is files.
- **A world never reads it.** It couldn't open it, and a world asking relays
  about its visitors would be a way to follow them. A world is told your
  settings the way it always is: by BitPortal, as you arrive.
- **What a relay can see:** that your key keeps a BitPortal settings note,
  and when it last changed. Nothing in it.
- **Taking it back:** "Take my settings off the relays, and stop" replaces
  the note with an empty one. A relay may keep the old one for a while; it
  still can't read it.
- A guest's settings stay in the browser. There is no key to seal them with.

It needs BitLogin unlocked in the browser, since BitLogin does the sealing
and BitPortal never holds your key.

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
- Everything BitPortal knows about you stays in this browser. Once you sign
  in, one copy of your settings is also kept on your relays, sealed so that
  only your own key can open it (below): the sign-in window lists it before
  you allow anything.
- Saved doors and the room's layout stay in this browser. The room draws only
  built-in furniture from a layout: no pictures and nothing else that would
  contact another site.
- The computers you add for a terminal are kept in this browser. What you
  type into a terminal goes straight to your computer, sealed; relays carry
  only the sealed notes the two use to find each other.
- No analytics, and no server-side code.

## The starter set

A signed-out visitor sees a **starter set**: a hand-picked list signed by a
named key (`src/starter/starter-set.json`). It currently holds the nine worlds made for
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

## Following people

Choose someone in your home room (People, in the menu, or the picture over their head) and their card has **Follow**
on it, if they came by name and you are signed in. It changes your own Nostr follow list: the same one every other
Nostr app reads, and the one ratings here are counted from. Who you follow is public.

The menu has a **Following** tab too: everyone you follow, by name. Choose one to see who they are or to unfollow them, or follow someone by a key you copied. At a door, **See who made it** (in Rate) shows the world's maker there, to follow or not. It is the same tab in every world built with the kit.

The first time you press it, your sign-in address asks whether BitPortal may change who you follow. It is not part of
what you are asked when you sign in. Say no and nothing changes; you stay signed in.

BitPortal changes one line of your list and keeps the rest. If none of your relays can be reached it changes nothing,
so a list is never written over one it couldn't find.

## What someone has done

A person's card (in People and in Following) says what they have posted in the worlds BitPortal knows: a score on a
world's board, and the achievements they show. "In The Arcade: Lantern Run, 41.2 s."

- It is what they say of themselves. Nothing checks a score or an achievement yet, and the card doesn't pretend to.
- Only what was posted from the world itself is shown: a score marked as coming from anywhere else is left out.
- Relays are asked about a person when you open their card, and not before.

## Private messages

The menu has a **Messages** tab: your private messages with one person at a time. They are Nostr's own (NIP-17), so
a conversation started here carries on in any other Nostr app that speaks it. Write to someone from their card in
People, or from Following.

- A conversation is on a panel of its own, named for who it is with, beside the room's chat. Only you and they can
  read it. A relay is told who a message is for, and nothing of who sent it or what it says.
- The first time, your sign-in address asks whether BitPortal may send and read your private messages. It is not part
  of what you are asked when you sign in, and it is asked apart from following.
- You say where messages should reach you (a short public list of relays) before you send your first. Someone who
  hasn't said where theirs reach them can't be written to this way, and BitPortal says so.
- A message from someone you don't follow and haven't written to waits apart, as a request.
- Nothing you read is kept on the device once the page is closed.

## What people thought of a place

A visitor who is signed in can rate a place from one to five stars
([NSWP-13](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/13-ratings.md)).
Standing at a door at home, **Rate** is on the bar, and opens the menu's Rate
tab. The rating is signed with their own key at their sign-in address and
sent to their relays. It is public, and the tab says so before the first one.

A door's plate, the lobby and the Airlock show a tally: "★ 4.5 from 12".
It counts the visitor, the people they follow, and the curators of the lists
on show here, and nobody else: keys cost nothing, so an average of everyone's
ratings would mean nothing. Signed out, only the curators are counted. A
rating that was signed at the world it rates is left out, and so is the
world's own publisher. With nobody counted there is no tally, never "0
stars".

Relays are asked about worlds, never about people. Who the visitor follows
is asked for at home and kept on the device (`bitportal:follows`), so the
Airlock asks nothing about them.

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
| `sharedMusic` | `true` | Visitors in this copy's own room may share the music they are playing with people near them. `false` leaves it out |

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

## Moving in the room

There are two ways to move, called the same thing at a desk and in a
headset: casual and intense. Casual is what a visitor gets. At a desk that
is: click where you want to stand, drag to look round, or walk with W A S D.
Intense, chosen in the menu under Moving, is for people who play games: the
mouse looks, W A S D walk, Shift runs, F or a click uses the door or button
in the middle of the view, and Escape brings up the menu. In a headset,
casual is stepping and intense is walking and turning smoothly. Each device
keeps its own choice.

Your controls are always one gesture away, here and in every world, whatever
that world is showing on screen: the key left of 1 at a desk, two fingers
held still on a touch screen, or B or Y held in a headset. The same gesture
puts them away, and leaves the world's own screen as it was.

You arrive in a world the way you left the last one: laid out for touch if
you were tapping, for a mouse and keys if you were at a desk, and offered the
way back into your headset if you left one. The Airlock passes that on, and
goes by how you pressed its own button when it can see that.

Every door this copy shows is on a list inside the room: "Every door, as a
list", in the menu under Travel. On a flat screen it opens the Doors tab of
the menu, with a row for every door, yours first. In a headset it hangs a
panel in front of you, which shows six doors at a time, with
Earlier and Later for the rest and Find to look for one by its name, its
address or what it is. Pressing a door on either is choosing that door, as
if it were on the wall, so nobody leaves the room to read a list. Neither
"Doors" nor "List" is on the row of controls: to have the Doors tab to
hand, keep it on your bar. A door's Save is a small tag on the door, shown
only while you stand at it, with a Save key in the row of controls for as
long as you do. The front page is still
there for what needs a page (signing in, settings, announcing a world), from
the menu under Travel.

What you set goes with you. Your volumes, the size of your text, whether
things move, how your hands are set in a headset and whether your screen was
filled are the same in the next world as in the last, and are still the same
when you come home. Nothing is set twice. A screen you had filled is filled
again at your first key or press, since a browser only does that on a press.

Moving the casual way, a ring on the floor follows your pointer and shows
where a press would take you; once you press, a dot marks where you are
going and a dotted line the way there. Only you see them. A door lights up,
and can be pressed, from within ten feet of it; from further off a press on
it walks you towards it, so a stray click across the room doesn't send you
anywhere. Moving the intense way, you walk into a door to go through it.

Moving the intense way, you are moving that way the moment you arrive
anywhere: the mouse looks at once, with nothing to click first. Walking into
a door goes straight through it; choosing a door from across the room brings
the crossing's chamber up round you first.

You can run and jump whichever way you move. At a desk, Shift runs and Space
jumps, and two clicks on the floor run there. On a touch screen, two taps
run, and Jump is with the controls at the bottom. In a headset, A or X
jumps, and pressing the moving stick in runs while you are walking smoothly. Fullscreen is in the menu under View. The choice is
kept in this browser and goes with the visitor into the worlds they visit.

## Sound

The room has sound: steps, presses, doors, people coming and going, a low
hum, and eight pieces of music that play in turn. All of it is recorded, was
chosen by ear, and is served from this site
([where each file came from](public/sounds/README.md)). The Sound part of the menu holds the
visitor's own volumes (effects, music, voices, all off) and their own music:
songs added from their device, kept in this browser, and heard by nobody
else. Each world has its own sounds and its own copy of that menu; a
visitor's songs don't follow them from site to site, because a browser keeps
each site's files apart.

The Sound part of the menu says which piece of the room's music is playing,
by name ("Playing here: room-e. Next of 8"). Pressing it goes on to the
next, and "Music: off" silences it.

### Music between visitors

A visitor playing their own music in the room can offer it to people near
them. Nobody hears it unless they turned on "Hear music others share". It is
full beside the person sharing, fades with distance to nothing at twelve
metres, and steps back while anyone is speaking. It goes from one browser to
another and through no server. The host can leave it out of this copy's room
with `sharedMusic: false` in `src/shared/instance.ts`.

## Sharing a screen in the room

Someone at a desk or laptop, joined in the room, can press "Share your
screen". Everyone in the room is told, and nobody is shown anything: each
person who wants to watch selects the sharer in People and presses "Watch".
It opens on a panel of their own, to move, size, pin or put away. The sharer
sees how many are watching, and stopping or leaving ends it for everyone.

## Blocking someone everywhere

Blocking someone in a world keeps the two of you apart in that world: you
don't see or hear each other, and everyone else still sees you both. Each
world is its own site, so that block stops at its door. To make it hold
everywhere, BitPortal keeps a list of its own.

When a visitor leaves a world where they blocked someone, the Airlock names
who and offers "Block this person everywhere you go". Ticked, they go on the
list, and the Airlock hands the list to every world the visitor arrives in,
which keeps them apart there too. The box starts unticked, because the link
that reports a block is something anyone could write. People blocked in
BitPortal's own room are on the list already.

Settings, on the front page, shows the list with Unblock beside each person,
and anyone reported on the way home who is still waiting for an answer. Two
things to know: each world arrived in learns the keys on the list, which is
the cost of a block that travels; and only people who go by a name can be on
it, since a guest is a new person every visit.

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

Trying it beside the worlds on your own machine: build it, then run
`node scripts/serve-local.mjs --lan --https` in the NSWP repository next to
this one. Each site is served at one `https` address on the machine's
network address, never `localhost` or plain `http`: BitPortal on port 4300
and the reference worlds beside it. Each device shows a warning about the
certificate the first time, since it is made on your machine. The
links between them lead to those copies: a door here goes through this
Airlock to the local world, and the way home comes back here. The Airlock
still checks the real site, and says on its card when it is sending you to a
copy. Once deployed, every link is the real address, with nothing to switch.

### Vendored dependencies

BitPortal vendors what it depends on and records the exact source commit and
file hashes in `vendor/integrity.json` (BitBlocks convention D7):

| Package | From | Where |
|---|---|---|
| `@nswp/core` | the NSWP repo | `vendor/nswp/` |
| BitFeed standalone | the BitFeed repo | `vendor/bitfeed/` |
| `nswp-sdk/three` (avatars, voice, rooms, the headset console), `nswp-sdk/home` (the room's furniture), `nswp-sdk/ui` (the HUD) and `nswp-sdk/terminal` (the terminal panel, fetched only when one is opened) | the NSWP repo | `vendor/nswp/` |
| BitLogin's build (BitPortal loads its client, `bitlogin-client.js`) | the bitlogin repo's `release/` folder | `public/vendor/bitlogin/` |
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
static files under `/vendor/bitlogin/`, never bundled. Pages load only
`/vendor/bitlogin/bitlogin-client.js`, which embeds BitLogin's signer from
bitlogin.network in an unseen frame: no page loads the widget or shows a
sign-in form. That file, and what it imports from the same folder, runs
same-origin with BitPortal, so
it is part of what BitPortal has to trust. The vendor script refuses a copy
that doesn't match BitLogin's own `integrity.json`. Before vendoring, run
`npm run release:artifacts` in the bitlogin checkout.

### Deploy

BitPortal is deployed together with the worlds, from the NSWP repository
next to this one, so that every site carries the same kit. Deploying
BitPortal alone is not the way. The first command says what would be
deployed and changes nothing. The second deploys.

```bash
npm run release:all
```

```bash
npm run release:all -- --go
```

## Not built yet

Profile pages,
messages and notifications, shelves from the people you follow
(it waits for names and profiles), making a list from inside BitPortal, search
beyond what the page already holds, hashtags in the room (they are in the
lobby), trust labels (BitGate) and paid entry
(BitUnlock). Rooms are a first cut:
no moderation. See the
NSWP spec's roadmap (§20).

## License

MIT. Vendored packages and the fonts keep their own licences:
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) lists them.
