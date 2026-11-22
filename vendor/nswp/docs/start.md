# Start here: making a world for the spatial web

This page is for someone, or some agent, who has never seen any of this. It
says what a world is, how to make one, how it gets found, and where to read
next. It is plain Markdown on purpose: fetch it and follow it.

Every command below was run as written, in a fresh copy of the template, on
2026-11-21, and then a fresh agent with nothing but this page made a world
from it. Where a step sends something to the outside world, it says so
before you reach it.

## What a world is

A **world** is a website: a 3D place in a page, on an https address you
control, that works in an ordinary browser and in a VR headset. A **door**
is a link from one world to another. Nobody runs the network: a world says
who it is with signed [Nostr](https://github.com/nostr-protocol/nips) notes,
and anyone's client (BitPortal is one) can show a door to it.

Three things make an ordinary 3D site a world:

1. **It says whose it is**, in a file at `/.well-known/nswp.json` on its own
   site, naming the key allowed to announce it.
2. **It is announced**: a signed note, kind 37300, published to Nostr relays,
   saying its name, its address and what it offers.
3. **It welcomes travellers**: it reads how a visitor arrived, sends them on
   through their own Airlock (the page that shows where a door really leads),
   and offers the way home.

A world can be anything: a game, an app, a gallery, a place to meet.

## Three ways in

| You have | Start from | Then read |
|---|---|---|
| Nothing yet, and you like JavaScript | **The world template** (Three.js): everything above is done, you change a scene | Its [README](https://github.com/PR0M3TH3AN/nswp-world-template#readme) and [AGENTS.md](https://github.com/PR0M3TH3AN/nswp-world-template/blob/main/AGENTS.md) |
| A Godot 4 project | **The Godot addon**: `engines/godot/addons/nswp/` in the protocol's repository, [Nostr-Spatial-Web-Protocol--NSWP-](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-) | [docs/other-engines.md, "Godot"](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/docs/other-engines.md#godot) |
| A site already, in any engine | **The protocol**, and the engine script `engines/nswp-engine.js` in the same repository | [docs/add-your-site.md](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/docs/add-your-site.md), then [docs/other-engines.md](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/docs/other-engines.md) |

The rest of this page walks the first way, because it is the shortest. The
other two reach the same three things by other routes. The Godot addon's
steps are in its own document; they need Godot 4 and were not run for this
page.

## The template, step by step

You need [Node.js](https://nodejs.org) 22 or newer and git.

### 1. Copy it and run it

```bash
git clone https://github.com/PR0M3TH3AN/nswp-world-template my-world
```

```bash
cd my-world
```

```bash
npm install
```

```bash
npm run dev
```

It prints an address, such as `http://127.0.0.1:5173/`, and keeps running
until you stop it with Ctrl+C. Open the address: drag to look around, walk
with W, A, S, D, click a door to go through it. Add `?xr=emulate` to try it
with a pretend headset.

**An agent:** start it in the background with its output going to a file,
and read the address from the file (piped through `tail`, the address is lost
when the server is stopped). For example, this runs it for a minute and stops
by itself:

```bash
timeout 60 npm run dev > dev.log 2>&1 &
```

Without a browser you can only see that the address answers; `npm run check`
(below) is what says the world builds.

What you see deployed with no changes at all:
<https://starter.bitblocks.network/>.

### 2. Make it yours

Three places hold everything that is yours. The page rebuilds as you save.

| File | What it is |
|---|---|
| `home.json` | The room you start with: colours, furniture, doors. No code |
| `src/scene.ts` and `src/scenes/` | The scene itself, in Three.js |
| `world.json` | The facts about your world |

In `world.json`, set `url` to the https address the world will live at, `d`
to a short name of your own (lower case, no spaces), and `title` to its name.
What each kind of thing in `home.json` takes, and how a door names where it
leads, is in the template's README,
["The home"](https://github.com/PR0M3TH3AN/nswp-world-template#the-home-homejson).
Edit the files by hand: a tool that rewrites them whole changes every line.

Then check it:

```bash
npm run check
```

It ends with `All checks passed.` when the world builds and its files agree.

### 3. Make its key

```bash
npm run keygen
```

This makes the key that proves the world is yours, and saves it **outside**
the folder (it says where). Back it up: it can't be recovered, and whoever
holds it can speak for the world.

**The key file is a secret.** It never goes in a repository, in the world's
folder, in a message or in a log. (To keep it somewhere else, set
`NSWP_KEY_FILE` to a path outside every repository.)

### 4. Take its picture, sign it, build it

A door that leads to a world shows a 360° picture of it, and a world must
have one. This opens the built world on this machine in Google Chrome and
photographs it, so it needs Google Chrome itself installed (it asks for
Chrome by name; Chromium alone won't do), and stops with a plain message if it
can't start it:

```bash
npm run preview
```

```bash
npm run sign
```

```bash
npm run check
```

`sign` writes the signed announcement into `signed/`. `check` builds the
site into `dist/` and checks it; when the tools say "Next: npm run build",
`npm run check` does that build too, so either is fine.

`previews/` and `signed/` are part of your world: keep them with it. If the
world is in a repository, this is a good moment to commit, with them in it.
The key never goes with them.

### 5. Put it online

`dist/` is a folder of plain files: upload it to any static host (GitHub
Pages, Netlify, Cloudflare Pages and Vercel all work; how you upload is each
host's own, and putting a site online is yours to decide, so this page gives no
command for it). It must
send `Access-Control-Allow-Origin: *` for `/.well-known/nswp.json`; the
build writes `dist/vercel.json` and `dist/_headers` for Vercel, Netlify and
Cloudflare Pages, and the template's README says what to do elsewhere.

Then check the live site. This only reads: it fetches from the world's own
site and from the relays, and publishes nothing:

```bash
npm run check:live -- https://your-world.example/
```

It ends with `Verified world.` when the site's own file vouches for the key
that announced it. Before the site is up, or before it is announced, it ends
with `Problems found.` and says which: that is expected, not a mistake. Try it on the starter world to see what good looks like:
`npm run check:live -- https://starter.bitblocks.network/`.

### 6. Announce it

This is how lobbies and other worlds find it.

```bash
npm run announce
```

On its own, `announce` **sends nothing**: it shows the world, the key and the
relays it would send to, and stops. Sending is a separate, deliberate step,
`npm run announce -- --yes`, which **publishes to public relays, for good**:
a published note can be replaced by a newer one, never taken back. Nothing in
`announce` checks that the world is online, so be sure first: `check:live`
on its address ends with `Verified world.` once it is up. An agent asks its
person before running it, saying what will be sent and where.

After changing `world.json` or `home.json`: sign, check, upload, announce
again.

## How a world is checked

A client never takes a world's word alone. It reads the announcement from
relays, then fetches `/.well-known/nswp.json` from the world's own address,
and calls the world **verified** only if that file names the key that signed
the announcement, for that world. A door shows the real address, in full,
and the visitor's Airlock shows it again before they cross. What a world says
it offers (voice, saves, items and the rest) is its own claim, lit on its
door only where its announcement says so.

## Where each next thing is written

| To know | Read |
|---|---|
| The protocol, part by part | [protocol/README.md](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/README.md) |
| What every world owes a visitor | [protocol/09-what-a-world-owes.md](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/protocol/09-what-a-world-owes.md) |
| What is required, what comes ready-made, what you may replace | [docs/integrating.md](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/docs/integrating.md) |
| The menu and controls every world shares | [docs/controls-kit.md](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/docs/controls-kit.md) |
| Running worlds on your own machine, phone and headset | [docs/local-server.md](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/docs/local-server.md) |
| Keeping a world up to date with the kit | [docs/keeping-up.md](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/docs/keeping-up.md) |
| Why it is built this way | [spec.md](https://github.com/PR0M3TH3AN/Nostr-Spatial-Web-Protocol--NSWP-/blob/main/spec.md) |

Every link above is also readable as plain text: replace
`github.com/<owner>/<repo>/blob/main/` with
`raw.githubusercontent.com/<owner>/<repo>/main/`.
