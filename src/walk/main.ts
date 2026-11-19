/**
 * The walk-in room: where a visitor starts when they'd rather stand somewhere
 * than read a list (NSWP spec §14.1). One room with two walls of doors. Ahead
 * is the visitor's own wall, the places they saved, which changes only when
 * they change it. Behind is the suggested wall, which may change every visit.
 *
 * - Point at a door (mouse, controller ray, or a pinch) and select it, or walk
 *   through it. Either way you go to the Airlock, which is always a flat page:
 *   a 3D scene can't be trusted to show an address (NSWP spec §6.2).
 * - Like the list, drawing the hall contacts relays only. A door looks into
 *   its world's preview when BitPortal mirrors one (spec §5.8); otherwise its
 *   art is drawn from the world's address. Nothing is fetched from a world.
 * - Other visitors appear only after you press "Join the room".
 *
 * Input uses only the WebXR `select` event, so it works with controllers,
 * hand pinches and gaze-and-pinch alike (spec §21.2).
 */
import * as THREE from "three";
import { buildAirlockUrl, buildWayUrl, checkDestination, CURATION_SET_KIND, encodeNaddr, queryRelays, WORLD_KIND } from "@nswp/core";
import { ARRIVED_JOINED, ARRIVED_MOVING, ARRIVED_SETTINGS } from "../shared/travel.js";
import { loadBlockedEverywhere, loadPendingBlocks } from "../shared/blocked.js";
import { createHome, type Alloy } from "nswp-sdk/home";
import { addCameraControls, addPanelControls, addRoomControls, viewScale, createFps, type Fps, addSoundControls, createSounds, addJump, arriveWith, currentSettings, currentForm, createStroll, RUN, WALK_SPEED, TAP_REACH, addViewControls, createConsole, createPanels, type Panels, createCrossing, createFigure, createPortalWindow, createPresence, createStay, createXrInput, panoramaTexture, textSprite, type Figure, type XrConsole, type XrInput } from "nswp-sdk/three";
import { inlineLook, loadLook, lookOf } from "../shared/look.js";
import { createControls, mountHud, type Controls } from "nswp-sdk/ui";
import bundleJson from "../starter/starter-set.json";
import { buildCatalog, type Catalog, type Entry, type StarterBundle } from "../shared/catalog.js";
import { createDoorList, type DoorList, type DoorRow } from "./door-list.js";
import { detectTier, deviceFit, type Device } from "../shared/device.js";
import { archMaskTexture, canvasTexture, DOOR_H, DOOR_W, doorFrame, flatViewTexture, viewTexture } from "../shared/door3d.js";
import { homeOf, loadHome } from "../shared/home.js";
import { INSTANCE } from "../shared/instance.js";
import { loadOperatorLists, storeOperatorLists } from "../shared/operator.js";
import { readSignedIn } from "../shared/session.js";
import { createJumpList } from "../shared/jump.js";
import { addComputers, type Computers } from "./computers.js";
import { plateMarks } from "../shared/plate.js";
import { decidePreview, loadPreview } from "../shared/preview.js";
import { loadRoom } from "../shared/room.js";
import { addSaved, loadSaved, readLeft, refreshSaved, rememberLeft, removeSaved, restoreSaved, savedEntries, storeSaved, WALL_DOORS, wallSlot, type SavedPlace } from "../shared/saved.js";
import { followedAuthors, loadFollowed, refreshFollowed, storeFollowed } from "../shared/lists.js";
import { loadSettings } from "../shared/settings.js";
import type { Candidate } from "../shared/shelves.js";
import { cachedVerification } from "../shared/verify.js";
import { VERSION } from "../shared/version.js";
import type { FeedRequest, FeedResponse } from "../lobby/feed-worker.js";

type Wall = "yours" | "suggested";

interface Door {
  entry: Entry;
  why: string;
  wall: Wall;
  group: THREE.Group;
  view: THREE.Mesh;
  frame: THREE.Mesh;
  /** The frame's own metal: it brightens when the door is pointed at. */
  metal: Alloy;
  info: THREE.Sprite;
  hover: number;
}

/** Anything in the room that can be pointed at and selected. */
interface Clickable {
  /** Null for something on the headset console, which isn't one of the room's own meshes. */
  mesh: THREE.Mesh | null;
  /** What it is called on the console, when it is there. */
  onConsole?: string;
  /** What it is called on one of the visitor's panels, when it is there. */
  onPanel?: string;
  /** What selecting it does, in words, for the line under the room. */
  say: string;
  act(): void;
  door?: Door;
}

interface TestHooks {
  everyDoor?: DoorList;
  jump?: { jump(): boolean; readonly height: number; readonly airborne: boolean };
  /** Game controls on a desk: the mouse looks, keys walk. */
  fps?: Fps;
  /** The menu on a flat screen. */
  hud?: { readonly open: boolean; setOpen(open: boolean): void };
  /** What the room sounds like: cues, its music, and the visitor's own. */
  sounds?: unknown;
  state: Record<string, unknown>;
  doors(): { id: string; title: string; domain: string; wall: Wall; position: number[] }[];
  /** Save a suggested door, or remove one of the visitor's own, as selecting its button would. */
  toggle(id: string): void;
  /** Put the last removed door back. */
  putBack(): void;
  /** Step towards a spot on the floor, as pointing at it and selecting would. */
  step(x: number, z: number): void;
  /** Where the visitor's head is over the floor: [x, z] in metres. */
  where(): [number, number];
  /** Everything a visitor can do in the room. */
  controls?: Controls;
  /** The visitor's camera: what it has taken. */
  camera?: unknown;
  /** The console shown in a headset. */
  console?: XrConsole;
  /** What the visitor's hands are doing in a headset, as the input layer reads them. */
  input?: () => unknown;
  /** Where a crossing stands: arriving in the chamber, its doors opening, leaving, or none. */
  crossing?: () => string;
  /** The visitor's panels. */
  panels?: Panels;
  /** Where a named thing is on the page, in pixels. */
  screenOf?: (name: string) => number[] | null;
  /** Where a named thing is, in the space a headset's controllers are placed in. */
  thing?: (name: string) => { world: number[]; local: number[] } | null;
  /** Point the mouse ray at a door, as if hovering it. */
  aim(id: string | null): void;
  visit(id: string): void;
  roomInfo(): unknown;
  teleport(x: number, z: number): void;
  device?: unknown;
  spot?: (name: string, u: number, v: number) => { local: number[]; screen: number[] } | null;
  computers?: Computers;
}
declare global {
  interface Window {
    bitportal?: { version: string };
    __bitportalTest?: TestHooks;
  }
}
window.bitportal = { version: VERSION };

const INK = "#f2f3f6";
const ACCENT = 0x3df2a0;
/** Metres from the middle of the room to either wall of doors. */
const RADIUS = 8;
/** The angle between neighbouring doors: twelve fit on a wall. */
const SLOT = THREE.MathUtils.degToRad(13);
const PLATE_W = 1.7;
const USED_A_DOOR = "bitportal:used-a-door";
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

function hostParts(url: string): { prefix: string; domain: string } {
  const chk = checkDestination(url);
  if (!chk.ok) return { prefix: "", domain: "invalid address" };
  return { prefix: chk.value.hostPrefix, domain: chk.value.registrableDomain ?? chk.value.hostname };
}

function wrap(g: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width <= maxWidth || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1]!.replace(/\s+\S*$/, "")}…`;
  }
  return lines;
}

/** The door plate: name, address and marks, as on the list. */
function plateTexture(entry: Entry, device: Device): THREE.CanvasTexture {
  const W = 1024;
  const H = 420;
  const host = hostParts(entry.world.url);
  const fit = deviceFit(entry.world, device);
  const verified = cachedVerification(entry.id, entry.world.createdAt)?.state === "verified";
  const marks = plateMarks(entry.world, fit, verified).map((m) => ({
    text: m.tone === "ok" ? `✓ ${m.text}` : m.text,
    color: m.tone === "ok" ? "#6fdc9b" : m.tone === "warn" ? "#ffcf70" : "#8b91a0",
  }));
  return canvasTexture(W, H, (g) => {
    g.textBaseline = "top";
    // The plate hangs in front of a lit skyline: a dark edge round every letter keeps it readable.
    g.shadowColor = "rgba(2, 4, 7, 0.95)";
    g.shadowBlur = 16;
    g.fillStyle = INK;
    g.font = '700 76px "Ubuntu Sans V", system-ui, sans-serif';
    let y = 8;
    for (const line of wrap(g, entry.world.title, W - 20, 2)) {
      g.fillText(line, 10, y);
      y += 88;
    }
    g.font = '400 50px "Ubuntu Sans Mono V", ui-monospace, monospace';
    y += 6;
    g.fillStyle = "#8b91a0";
    g.fillText(host.prefix, 10, y, W - 20);
    const px = Math.min(g.measureText(host.prefix).width, W - 20);
    g.fillStyle = INK;
    g.fillText(host.domain, 10 + px, y, W - 20 - px);
    y += 78;
    g.font = '600 46px "Ubuntu Sans V", system-ui, sans-serif';
    let x = 10;
    for (const m of marks) {
      const tw = g.measureText(m.text).width;
      g.strokeStyle = m.color;
      g.lineWidth = 4;
      g.strokeRect(x + 2, y + 2, tw + 36, 66);
      g.fillStyle = m.color;
      g.fillText(m.text, x + 20, y + 10);
      x += tw + 56;
    }
  });
}

/** A small button on the wall: a word on a dark pill. */
function pillTexture(text: string): THREE.CanvasTexture {
  return canvasTexture(640, 192, (g) => {
    g.fillStyle = "rgba(16,18,23,0.94)";
    g.strokeStyle = INK;
    g.lineWidth = 6;
    g.beginPath();
    g.roundRect(6, 6, 628, 180, 90);
    g.fill();
    g.stroke();
    g.fillStyle = INK;
    g.font = '600 84px "Ubuntu Sans V", system-ui, sans-serif';
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, 320, 100, 560);
  });
}

function infoLines(entry: Entry, why: string, vr: boolean): string {
  const host = hostParts(entry.world.url);
  const g = document.createElement("canvas").getContext("2d")!;
  g.font = "44px system-ui, sans-serif";
  const lines = [`${host.prefix}${host.domain}`];
  if (entry.world.summary) lines.push(...wrap(g, entry.world.summary, 900, 3));
  if (why) lines.push(...wrap(g, why, 900, 2));
  lines.push(vr ? "Pull the trigger or pinch to visit" : "Click to visit");
  return lines.join("\n");
}

async function orderEntries(entries: Entry[], device: Device, ranking: boolean): Promise<{ entry: Entry; why: string }[]> {
  const plain = entries.map((entry) => ({ entry, why: "" }));
  if (!ranking || entries.length === 0) return plain;
  const candidates: Candidate[] = entries.map((e) => ({
    id: e.id,
    createdAt: e.world.createdAt,
    rank: e.rank ?? entries.length,
    total: entries.length,
    fits: deviceFit(e.world, device).ok,
    intensity: e.world.comfort.intensity ?? null,
  }));
  return new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker("/feed-worker.js", { type: "module" });
    } catch {
      resolve(plain);
      return;
    }
    const timer = setTimeout(() => resolve(plain), 5000);
    worker.onerror = () => {
      clearTimeout(timer);
      resolve(plain);
    };
    worker.onmessage = (e: MessageEvent<FeedResponse>) => {
      clearTimeout(timer);
      worker.terminate();
      const start = e.data.ok ? e.data.shelves.find((s) => s.id === "start") : undefined;
      if (!start) return resolve(plain);
      const byId = new Map(entries.map((x) => [x.id, x]));
      resolve(start.items.map((i) => ({ entry: byId.get(i.id)!, why: i.why })).filter((x) => x.entry));
    };
    const req: FeedRequest = { candidates, now: Math.floor(Date.now() / 1000), daySeed: new Date().toISOString().slice(0, 10) };
    worker.postMessage(req);
  });
}

async function start(): Promise<void> {
  const settings = loadSettings();
  const params = new URLSearchParams(location.search);
  const emulate = params.get("xr") === "emulate";
  const state: Record<string, unknown> = { ready: false, xr: "idle", emulate, leaving: null, hovered: null };
  const hooks: TestHooks = { state, doors: () => [], aim: () => {}, visit: () => {}, toggle: () => {}, putBack: () => {}, step: () => {}, where: () => [0, 0], roomInfo: () => [], teleport: () => {} };
  window.__bitportalTest = hooks;
  if (emulate) {
    // Test aid for people without a headset: pretend to be a Meta Quest 3.
    const { XRDevice, metaQuest3 } = await import("iwer");
    const xrDevice = new XRDevice(metaQuest3, { stereoEnabled: false });
    xrDevice.installRuntime({ forceInstall: true });
    hooks.device = xrDevice;
  }

  // The plates are drawn on canvases, so the fonts have to be ready first.
  await Promise.all([document.fonts.load('700 76px "Ubuntu Sans V"'), document.fonts.load('400 50px "Ubuntu Sans Mono V"')]).catch(() => {});

  let vr = false;
  try {
    vr = navigator.xr ? await navigator.xr.isSessionSupported("immersive-vr") : false;
  } catch {
    /* stays false */
  }
  const device: Device = { vr, tier: detectTier(navigator.userAgent, (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile) };

  // ------------------------------------------------------------- scene
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType("local-floor");
  $("stage").append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0b0d);
  scene.fog = new THREE.Fog(0x0a0b0d, 10, 30);
  const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.05, 700);
  camera.position.set(0, 1.6, 0);
  const rig = new THREE.Group();
  rig.add(camera);
  scene.add(rig);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1c22, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.position.set(2, 8, 4);
  scene.add(key);

  // The floor and the furniture come from the visitor's room layout (spec
  // §4.5). Only built-in furniture is drawn, which costs nothing to load, so it
  // goes up with the floor. Anything a layout has to fetch must wait for the doors.
  const room = loadRoom();
  const furniture = createHome(room.layout, { lights: false, textColor: INK });
  scene.add(furniture.group);
  state.furniture = room.layout.items.length;

  // ---------------------------------------------------------- controls
  // One list of what a visitor can do in the room (the NSWP controls kit). The
  // HUD draws it on a flat screen and the console draws it in a headset. The
  // look starts from the room's own accent; the visitor can change it.
  // What the visitor set in the world they have just come home from (their volumes, the size of their text and
  // the rest) is what the room begins from. The kit cleans it: it is preferences and nothing else.
  try {
    const came = sessionStorage.getItem(ARRIVED_SETTINGS);
    sessionStorage.removeItem(ARRIVED_SETTINGS);
    if (came) arriveWith(JSON.parse(came));
  } catch {
    /* the room keeps what it had */
  }
  const controls = createControls({ title: "Your room", address: location.host, theme: { accent: room.layout.room.accent } });
  const hud = mountHud(controls);
  hooks.controls = controls;
  hooks.hud = hud;
  // Which of the two ways the visitor is moving, on the device they are using. Worked out further down.
  let movingNow = (): "intense" | "casual" => "casual";
  const movingFlag = (): { moving?: "intense" } => (movingNow() === "intense" ? { moving: "intense" } : {});
  // Sound in the room: the kit's cues, a quiet music of the room's own, and the visitor's own songs. The volumes
  // are the visitor's, kept in this browser. A world's sounds stop at its own door: here they are BitPortal's.
  const sounds = createSounds({ context: THREE.AudioContext.getContext() as unknown as AudioContext, seed: "BitPortal",
    kit: "/sounds/kit/",
    // The room's own music: eight pieces, in turn, starting with the one the owner picked first. The two kinds
    // (made in code, a to d; made with a music model, e to h) take turns, so neither runs for long.
    theme: { music: ["b", "e", "a", "f", "c", "g", "d", "h"].map((n) => `/sounds/room-${n}.ogg`) },
    keep: { levels: "bitportal:sound", songs: "bitportal:jukebox" },
  });
  addSoundControls(controls, sounds);
  hooks.sounds = sounds;
  const jumpList = createJumpList({ relays: () => settings.relays, from: "walk" });
  // The editor is a page, which can't be seen in a headset.
  controls.addSection({ id: "you", label: "You", icon: "room", note: "How other people see you when you share a room. It is kept on this device." });
  controls.add({ id: "figure", section: "you", icon: "room", label: "Change how you look", short: "You", hidden: () => renderer.xr.isPresenting, act: () => location.assign("/look/") });
  controls.add(
    // The jump list is a page dialog, which can't be seen in a headset. There, the wall is the list.
    { id: "doors", section: "travel", icon: "save", hotbar: true, label: "Your doors, as a list", short: "Doors", hidden: () => renderer.xr.isPresenting, act: () => jumpList.open() },
    // Every door this copy shows, on a panel in the room: nobody is sent out of the room to read a list.
    { id: "list", section: "travel", icon: "list", hotbar: true, label: "Every door, as a list", short: "List", act: () => everyDoor?.open() },
    // The front page still has what needs a page: signing in, settings, announcing a world. It can't be seen from a headset.
    { id: "front-page", section: "travel", icon: "list", label: "The front page: sign in, settings, announce a world", short: "Page", hidden: () => renderer.xr.isPresenting, act: () => location.assign("/") },
  );
  // Someone whose home is a world of their own keeps their doors here, and goes home from here. Nothing is asked
  // of them on the way: the Airlock looks at their home first, and brings them back here if it doesn't answer.
  void readSignedIn().then((who) => {
    const home = homeOf(loadHome(), who?.pubkey);
    if (!home) return;
    controls.add({ id: "go-home", section: "travel", icon: "home", hotbar: true, label: `Go home, to ${home.title || new URL(home.url).host}`, short: "Home", act: () => location.assign(buildWayUrl(new URL("/go/", location.origin).href, { immersive: renderer.xr.isPresenting, joined: travelling().joined, mic: travelling().mic, ...movingFlag(), settings: currentSettings() })) });
  });
  try {
    // Said once, when they were meant to arrive at their home and didn't.
    const note = sessionStorage.getItem("bitportal:home-note");
    if (note) {
      sessionStorage.removeItem("bitportal:home-note");
      setTimeout(() => controls.say(note), 1200);
    }
  } catch {
    /* nothing to say */
  }
  controls.addSection({
    id: "help",
    label: "Help",
    icon: "help",
    note: "Your doors are on one wall, and suggested ones on the wall behind it. Drag to look around. Walk with W, A, S, D, or point at the floor and select to step there: twice to run. Shift runs and Space jumps. The key left of 1 brings these controls up here and in any world, whatever is on screen; on a touch screen, hold two fingers still. Select a door, or walk through it, to see where it leads before you go.",
  });
  // The ground and the skyline come with the home (nswp-sdk/home), in the room's own colours.
  scene.background = new THREE.Color(0x04070b);
  scene.fog = new THREE.Fog(0x04070b, 60, 300);

  // ------------------------------------------------------------- doors
  // The same lists as the page: BitPortal's own, unless it is put away, and the ones the visitor follows.
  let followed = loadFollowed();
  // And the same policy: what this copy's operator lists, and nothing that is for adults (src/shared/instance.ts).
  const makeCatalog = (events: unknown[] = []): Catalog => buildCatalog(bundleJson as unknown as StarterBundle, events, { followed, showStarter: settings.showStarter, operatorLists: loadOperatorLists() });
  let catalog: Catalog = makeCatalog();
  let saved: SavedPlace[] = loadSaved();
  /** The last door removed this visit, so one slip of the hand can be undone. */
  let lastRemoved: { place: SavedPlace; title: string } | null = null;
  /** Where each suggested door stands, for this visit: saving one leaves a gap, and the rest stay put. */
  const suggestedAt = new Map<string, number>();
  // ?wall=2 shows two doors a wall: a test aid for what happens when a wall is full.
  const perWall = Math.max(1, Math.min(WALL_DOORS, Number(params.get("wall")) || WALL_DOORS));
  const archMask = archMaskTexture();
  const pillMaps = { save: pillTexture("Save"), remove: pillTexture("Remove"), back: pillTexture("Put it back"), list: pillTexture("See the list") };
  const shared = new Set<THREE.Texture>([archMask, ...Object.values(pillMaps)]);
  const doorGeo = new THREE.PlaneGeometry(DOOR_W, DOOR_H);
  const plateH = PLATE_W * (420 / 1024);
  const plateGeo = new THREE.PlaneGeometry(PLATE_W, plateH);
  // A button has to be hit from across the room with a hand-held ray, so it is
  // a metre wide, and stands clear of the door it belongs to.
  const pillGeo = new THREE.PlaneGeometry(1.0, 0.3);
  const widePillGeo = pillGeo;
  /** Frames standing where no door is yet: they are still, and their light is low. */
  const emptyMetals: Alloy[] = [];
  // Your wall is ahead of where a visitor first stands; the suggested wall is behind.
  const walls: Record<Wall, THREE.Group> = { yours: new THREE.Group(), suggested: new THREE.Group() };
  walls.suggested.rotation.y = Math.PI;
  scene.add(walls.yours, walls.suggested);
  let doors: Door[] = [];
  let clickables: Clickable[] = [];
  /** Every door this copy shows, the visitor's own first: what the list in the room reads. */
  let listed: { entry: Entry; saved: boolean }[] = [];
  let everyDoor: DoorList | null = null;

  /** Stand something at a place along a wall, facing the middle of the room. */
  const place = (object: THREE.Object3D, slot: number) => {
    const theta = wallSlot(slot) * SLOT;
    object.position.set(Math.sin(theta) * RADIUS, 0, -Math.cos(theta) * RADIUS);
    object.rotation.y = -theta;
  };
  const emptyWall = (wall: THREE.Group) => {
    wall.traverse((o) => {
      const m = (o as THREE.Mesh).material as (THREE.Material & { map?: THREE.Texture | null }) | undefined;
      if (!m || Array.isArray(m)) return;
      if (m.map && !shared.has(m.map)) m.map.dispose();
      m.dispose();
    });
    wall.clear();
  };
  const pill = (map: THREE.Texture, geo = pillGeo) => new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map, transparent: true }));

  // A door looks into its world when there is a preview BitPortal may show
  // without asking (spec §5.8). The generated view stays underneath as the
  // fallback, so a door never goes blank while a picture loads or if it fails.
  const attachPreview = async (door: Door) => {
    // Both walls hold places someone chose: the curator, or the visitor.
    const decision = decidePreview(door.entry.world, { chosen: true, asked: false, doorOpen: false });
    if (decision.show !== "now") return;
    const url = await loadPreview(decision);
    if (!url || !doors.includes(door)) return;
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      return;
    }
    if (!doors.includes(door)) return;
    if (decision.preview.type === "pano") {
      const through = createPortalWindow(doorGeo, panoramaTexture(image), { mask: archMask });
      through.position.z = 0.004;
      door.view.add(through);
    } else {
      const material = door.view.material as THREE.MeshBasicMaterial;
      material.map = flatViewTexture(image);
      material.needsUpdate = true;
    }
    state.previews = ((state.previews as number | undefined) ?? 0) + 1;
  };

  const makeDoor = (entry: Entry, why: string, wall: Wall, slot: number): Door => {
    const group = new THREE.Group();
    place(group, slot);
    const view = new THREE.Mesh(doorGeo, new THREE.MeshBasicMaterial({ map: viewTexture(entry.id), transparent: true, alphaTest: 0.5 }));
    view.position.y = DOOR_H / 2;
    const { frame, metal } = doorFrame(ACCENT);
    const plate = new THREE.Mesh(plateGeo, new THREE.MeshBasicMaterial({ map: plateTexture(entry, device), transparent: true }));
    plate.position.set(0, DOOR_H + 0.74 + plateH / 2, 0);
    // The door's one button, in a row of its own between the arch and the plate.
    const button = pill(wall === "yours" ? pillMaps.remove : pillMaps.save);
    button.position.set(0, DOOR_H + 0.52, 0.03);
    // What a door says about itself, for a headset: low on the door, so the view through it stays clear, and
    // kept the same size in the visitor's view however near they stand (it is scaled every frame). On a flat
    // screen it isn't drawn at all: the same words are beside the controls, where they are never in the way.
    const info = textSprite(infoLines(entry, why, vr), INK, 2.6);
    info.position.set(0, 0.95, 0.45);
    info.userData.natural = info.scale.clone();
    info.visible = false;
    info.renderOrder = 2;
    group.add(view, frame, plate, button, info);
    walls[wall].add(group);
    const door: Door = { entry, why, wall, group, view, frame, metal, info, hover: 0 };
    clickables.push({ mesh: view, door, say: "", act: () => void visit(door) });
    clickables.push({
      mesh: button,
      door,
      say: wall === "yours" ? `Remove ${entry.world.title} from your doors.` : `Save ${entry.world.title}. It moves to your own wall and stays there.`,
      act: () => void toggle(door),
    });
    return door;
  };

  /** A place on the visitor's wall with no door yet. It says what will go there. */
  const makeEmpty = (slot: number, text: string, button?: { map: THREE.Texture; say: string; act: () => void }) => {
    const group = new THREE.Group();
    place(group, slot);
    const { frame, metal } = doorFrame(new THREE.Color(ACCENT).multiplyScalar(0.3), { still: true });
    emptyMetals.push(metal);
    const label = textSprite(text, "#aab0bd", 1.3);
    label.position.set(0, 1.25, 0.05);
    group.add(frame, label);
    if (button) {
      const b = pill(button.map, widePillGeo);
      b.position.set(0, 0.62, 0.05);
      group.add(b);
      clickables.push({ mesh: b, say: button.say, act: button.act });
    }
    walls.yours.add(group);
  };

  /** A sign past the last door of a full wall, leading to everything as a list. */
  const makeMore = (wall: Wall, slot: number, hidden: number) => {
    const group = new THREE.Group();
    place(group, slot);
    const label = textSprite(`${hidden} more\non the list`, INK, 1.2);
    label.position.set(0, 1.5, 0.05);
    const b = pill(pillMaps.list, widePillGeo);
    b.position.set(0, 0.9, 0.05);
    group.add(label, b);
    walls[wall].add(group);
    clickables.push({ mesh: b, say: "Every door, as a list.", act: () => everyDoor?.open() });
  };

  const header = (wall: Wall, text: string) => {
    const sign = textSprite(text, INK, 4.2);
    sign.position.set(0, 4.3, -RADIUS - 0.4); // low enough to clear the page's top bar on a tall screen
    walls[wall].add(sign);
  };

  const buildDoors = async () => {
    const mine = savedEntries(saved, catalog);
    const mineIds = new Set(mine.map((e) => e.id));
    // A suggestion never repeats a door the visitor already has (spec §14.1).
    const ordered = await orderEntries(catalog.entries.filter((e) => !mineIds.has(e.id)), device, settings.ranking);
    emptyWall(walls.yours);
    emptyWall(walls.suggested);
    doors = [];
    clickables = [];

    // Your wall: every saved place has a place of its own (see saved.ts).
    const slotOf = new Map(saved.map((x) => [x.id, x.slot]));
    const used = new Set<number>();
    let beyond = 0;
    for (const entry of mine) {
      const slot = slotOf.get(entry.id) ?? perWall;
      if (slot >= perWall) beyond++;
      else {
        used.add(slot);
        doors.push(makeDoor(entry, "", "yours", slot));
      }
    }
    if (lastRemoved && lastRemoved.place.slot < perWall && !used.has(lastRemoved.place.slot)) {
      const removed = lastRemoved;
      used.add(removed.place.slot);
      makeEmpty(removed.place.slot, `Removed\n${removed.title}`, { map: pillMaps.back, say: `Put ${removed.title} back on your wall.`, act: () => void putBack() });
    }
    // Never a bare wall: a new visitor sees where their doors will go.
    for (let slot = 0; slot < Math.min(3, perWall); slot++) if (!used.has(slot)) makeEmpty(slot, "A place you save\nwill appear here");
    if (beyond > 0) makeMore("yours", perWall, beyond);
    header("yours", mine.length ? "Your doors\nKept on this device" : "Your doors\nSave a door and it stays on this wall");

    // The suggested wall: best in the middle. Doors already standing keep their places.
    const wanted = new Set(ordered.map((o) => o.entry.id));
    for (const id of [...suggestedAt.keys()]) if (!wanted.has(id)) suggestedAt.delete(id);
    const taken = new Set(suggestedAt.values());
    let hidden = 0;
    for (const { entry, why } of ordered) {
      let slot = suggestedAt.get(entry.id);
      if (slot === undefined) {
        slot = 0;
        while (taken.has(slot)) slot++;
        if (slot >= perWall) {
          hidden++;
          continue;
        }
        taken.add(slot);
        suggestedAt.set(entry.id, slot);
      }
      doors.push(makeDoor(entry, why, "suggested", slot));
    }
    if (hidden > 0) makeMore("suggested", perWall, hidden);
    const from = catalog.lists.length === 1 ? `Picked by ${catalog.lists[0]!.title}` : catalog.lists.length === 0 ? "You aren't showing any list" : `From the ${catalog.lists.length} lists you've chosen`;
    header("suggested", ordered.length ? `Suggested\n${from}` : catalog.lists.length === 0 ? `Suggested\n${from}` : "Suggested\nYou've saved every door on your lists");

    // The list has all of them, however many fit on the walls. Each has passed what this copy shows (catalog.permits).
    listed = [...mine.map((entry) => ({ entry, saved: true })), ...ordered.map((x) => ({ entry: x.entry, saved: false }))].filter((x) => catalog.permits(x.entry.id, x.entry.world));
    everyDoor?.refresh();
    state.doorCount = doors.length;
    state.listed = listed.length;
    state.yours = mine.length;
    state.suggested = ordered.length;
    state.previews = 0;
    for (const door of doors) void attachPreview(door);
  };

  // A few words in front of the visitor, for a moment: the only feedback that
  // also reaches someone in a headset, where the page around the room is gone.
  let toast: THREE.Sprite | null = null;
  let toastUntil = 0;
  const say = (text: string) => {
    if (toast) {
      camera.remove(toast);
      toast.material.map?.dispose();
      toast.material.dispose();
    }
    toast = textSprite(text, INK, 1.1);
    toast.position.set(0, -0.32, -1.6);
    toast.renderOrder = 10;
    toast.material.depthTest = false;
    camera.add(toast);
    toastUntil = performance.now() + 3600;
    state.said = text;
    controls.say(text.replace(/\n/g, " "));
  };

  const keep = (next: SavedPlace[]): boolean => {
    saved = next;
    return storeSaved(saved);
  };
  const toggle = async (door: Door) => {
    const title = door.entry.world.title;
    if (door.wall === "yours") {
      const removed = saved.find((x) => x.id === door.entry.id);
      if (!removed) return;
      lastRemoved = { place: removed, title };
      keep(removeSaved(saved, door.entry.id));
      say(`Removed ${title}`);
    } else {
      const next = addSaved(saved, door.entry, Math.floor(Date.now() / 1000));
      if (next === saved) return say("Your doors are full.\nRemove one to save another.");
      if (lastRemoved?.place.id === door.entry.id) lastRemoved = null;
      say(keep(next) ? `Saved ${title}\nIt's on your own wall, opposite this one` : `Saved ${title} for this visit\nThis browser isn't keeping saved places`);
    }
    await buildDoors();
  };
  const putBack = async () => {
    if (!lastRemoved) return;
    const { place: removed, title } = lastRemoved;
    lastRemoved = null;
    keep(restoreSaved(saved, removed));
    say(`${title} is back`);
    await buildDoors();
  };

  // ------------------------------------------------------- leaving
  let leaving = false;
  // Leaving and coming back happen in the kit's chamber: the same small room at both ends of every trip.
  // The crossing's room is drawn over everything where it stands. The visitor's own hands and console are drawn
  // over it: they are added to this as they are made.
  const keptInSight: THREE.Object3D[] = [rig];
  const crossing = createCrossing({ scene, camera, accent: ACCENT, textColor: INK, motion: () => controls.theme.motion, keep: keptInSight });
  hooks.crossing = () => crossing.state;
  /**
   * Through a door. Chosen from where they stand (a click, a trigger, the list), the crossing's room comes up round
   * them first, with where the door leads over it. Walked into, there is nothing to bring up: they are already going
   * through it, so they go. Either way the Airlock is next, and it is what checks.
   */
  const visit = (door: Door, how: "chosen" | "walked" = "chosen") => visitEntry(door.entry, how);
  /** To a world, whether its door is on a wall or only on the list. */
  const visitEntry = async (entry: Entry, how: "chosen" | "walked" = "chosen") => {
    if (leaving) return;
    leaving = true;
    state.leaving = entry.id;
    state.left = how;
    everyDoor?.close();
    rememberLeft({ id: entry.id, from: "walk" });
    try {
      localStorage.setItem(USED_A_DOOR, "1"); // they know how a door works now
    } catch {
      /* storage unavailable */
    }
    const w = entry.world;
    // The walls come up, with where this door leads over them. The Airlock is next, and it is what checks.
    const to = hostParts(w.url);
    sounds.play("cross");
    if (how === "chosen") await crossing.leave({ title: w.title, address: `${to.prefix}${to.domain}` });
    document.body.classList.add("leaving");
    const naddr = encodeNaddr({ kind: WORLD_KIND, pubkey: entry.event.pubkey, identifier: w.d, relays: settings.relays.slice(0, 2) });
    // Left from a headset: say so, and the world at the other end offers the way back into one first.
    const immersive = renderer.xr.isPresenting;
    try {
      await renderer.xr.getSession()?.end();
    } catch {
      /* already ended */
    }
    // In the room here, and heard: that goes along, so the world at the other end needn't ask again.
    location.assign(buildAirlockUrl(new URL("/go/", location.origin).href, { naddr, url: w.url }, { immersive, joined: travelling().joined, mic: travelling().mic, ...movingFlag(), form: currentForm(), settings: currentSettings() }));
  };

  const raycaster = new THREE.Raycaster();
  raycaster.camera = camera; // rays from a hand don't set it, and signs need it

  // ------------------------------------------------- the console in a headset
  // In a headset the page can't be seen, so the room's controls go on a console
  // in the scene. Turn around matters most there: the other wall is behind the
  // visitor, and someone seated can't turn to face it.
  const xrConsole = createConsole(controls, { renderer, rig });
  keptInSight.push(xrConsole.group);
  scene.add(xrConsole.group);
  hooks.console = xrConsole;

  // ------------------------------------------------------ pointing
  // Stepping: point at the floor and select to stand there. It is how someone
  // with no keyboard gets close enough to a door to read it. A step is a jump,
  // never a slide, and it stops short of the walls: going through a door is
  // done by choosing the door.
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const spot = new THREE.Vector3();
  const headNow = new THREE.Vector3();
  const floorSpot = (): THREE.Vector3 | null => {
    if (!raycaster.ray.intersectPlane(floorPlane, spot)) return null;
    camera.getWorldPosition(headNow);
    let dx = spot.x - headNow.x;
    let dz = spot.z - headNow.z;
    const far = Math.hypot(dx, dz);
    if (far < 0.3) return null;
    // A jump of up to five metres in a headset. On a flat screen, a few steps: a tap is a walk there.
    const most = renderer.xr.isPresenting ? 5 : TAP_REACH;
    if (far > most) {
      dx *= most / far;
      dz *= most / far;
    }
    spot.set(headNow.x + dx, 0, headNow.z + dz);
    const out = Math.hypot(spot.x, spot.z);
    const limit = RADIUS - 1.2;
    if (out > limit) spot.multiplyScalar(limit / out);
    return spot;
  };
  // On a flat screen a tap is a walk at the keys' pace (the kit's stroll), not a jump.
  const stroll = createStroll({
    where: () => {
      camera.getWorldPosition(headNow);
      return [headNow.x, headNow.z];
    },
    canStand: (x, z) => Math.hypot(x, z) <= RADIUS + 1.5,
    move: (dx, dz) => {
      rig.position.x += dx;
      rig.position.z += dz;
    },
    speed: 2.2,
    onBlocked: () => sounds.bump(),
  });
  const stepToFloor = () => {
    const to = floorSpot();
    if (!to) return;
    state.steps = ((state.steps as number | undefined) ?? 0) + 1;
    // Unless the visitor is in a headset, where a slide turns stomachs, or has asked for less motion.
    if (!renderer.xr.isPresenting && controls.theme.motion) return stroll.to(to.x, to.z);
    camera.getWorldPosition(headNow);
    rig.position.x += to.x - headNow.x;
    rig.position.z += to.z - headNow.z;
  };
  const reticle = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.28, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthTest: false }));
  reticle.rotation.x = -Math.PI / 2;
  reticle.renderOrder = 5;
  reticle.visible = false;
  scene.add(reticle);
  hooks.step = (x, z) => {
    camera.getWorldPosition(raycaster.ray.origin);
    raycaster.ray.direction.set(x, 0, z).sub(raycaster.ray.origin).normalize();
    if (!under()) stepToFloor();
  };
  hooks.screenOf = (name) => {
    const object = scene.getObjectByName(name);
    if (!object) return null;
    const at = object.getWorldPosition(new THREE.Vector3()).project(camera);
    return at.z > 1 ? null : [Math.round(((at.x + 1) / 2) * innerWidth), Math.round(((1 - at.y) / 2) * innerHeight)];
  };
  hooks.thing = (name) => {
    const object = scene.getObjectByName(name);
    // A key of the keyboard or a cell of the library has no object of its own: the kit says where it is.
    const world = object ? object.getWorldPosition(new THREE.Vector3()) : (panels?.pointOf(name) ?? null);
    if (!world) return null;
    return { world: world.toArray().map((n) => Math.round(n * 1000) / 1000), local: rig.worldToLocal(world.clone()).toArray() };
  };
  // A spot on something flat, by how far across and down it is (each from 0 to 1): where a button drawn on a panel is.
  hooks.spot = (name, u, v) => {
    const object = scene.getObjectByName(name);
    if (!object) return null;
    const world = object.localToWorld(new THREE.Vector3(u - 0.5, 0.5 - v, 0));
    const at = world.clone().project(camera);
    return { local: rig.worldToLocal(world.clone()).toArray(), screen: [Math.round(((at.x + 1) / 2) * innerWidth), Math.round(((1 - at.y) / 2) * innerHeight)] };
  };
  hooks.where = () => {
    camera.getWorldPosition(headNow);
    return [Math.round(headNow.x * 100) / 100, Math.round(headNow.z * 100) / 100];
  };

  const ndc = new THREE.Vector2(2, 2); // off-screen until the mouse moves
  // The visitor's own panels: notes, pictures and video they hang in their room. Set up further down.
  let panels: Panels | null = null;
  /** What the current ray points at: a door, or one of the room's buttons. */
  const under = (): Clickable | null => {
    // While the keyboard is up it is in front of everything, the console's own button included.
    const key = panels?.keyboard.pick(raycaster);
    if (key) return { mesh: null, onPanel: key, say: "", act: () => panels!.press(key) };
    const button = xrConsole.pick(raycaster);
    if (button) return { mesh: null, onConsole: button, say: "", act: () => xrConsole.press(button) };
    // A panel hangs in front of whatever is behind it, a door included.
    const onPanel = panels?.pick(raycaster);
    if (onPanel) return { mesh: null, onPanel, say: "", act: () => panels!.press(onPanel) };
    for (const hit of raycaster.intersectObjects(clickables.flatMap((c) => (c.mesh ? [c.mesh] : [])), false)) {
      const found = clickables.find((c) => c.mesh === hit.object);
      if (!found) continue;
      // A door is its arch, not the rectangle the arch is drawn on. The corners
      // above the curve are empty wall, and they are right beside the door's button.
      if (found.door?.view === found.mesh && hit.uv) {
        const x = (hit.uv.x - 0.5) * DOOR_W;
        const y = hit.uv.y * DOOR_H;
        const spring = DOOR_H - DOOR_W / 2;
        if (y > spring && Math.hypot(x, y - spring) > DOOR_W / 2) continue;
      }
      return found;
    }
    return null;
  };
  const tmp = new THREE.Matrix4();
  const aimFrom = (source: THREE.Object3D): Clickable | null => {
    tmp.identity().extractRotation(source.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(source.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tmp);
    return under();
  };

  let dragging = false;
  let lastX = 0;
  let moved = 0;
  // A panel taken by its bar is dragged; anything else, and the drag turns the view.
  let panelDrag = false;
  // Game controls, for a visitor who turned them on: the mouse looks, keys walk, F uses. While they are on, the
  // clicks and drags below stand down. Arriving from a world where they were on, they are on here.
  let fps: Fps | null = null;
  const gameControls = () => !!fps?.enabled && !renderer.xr.isPresenting;
  // They came back from a world where they were moving the intense way: the same here, on that device.
  let arrivedMoving: string | null = null;
  try {
    arrivedMoving = sessionStorage.getItem(ARRIVED_MOVING);
    sessionStorage.removeItem(ARRIVED_MOVING);
  } catch {
    /* they choose it themselves */
  }
  /** Which of the two ways the visitor is moving now, on the device they are using: it goes with them through a door. */
  movingNow = () => ((renderer.xr.isPresenting ? xrInput.intense : fps?.enabled) ? "intense" : "casual");
  fps = createFps({
    dom: renderer.domElement,
    camera,
    rig,
    controls,
    hud,
    canStand: (x, z) => Math.hypot(x, z) <= RADIUS + 1.5,
    presenting: () => renderer.xr.isPresenting,
    // Use what the middle of the view points at: a door, a button, a panel.
    onUse: () => {
      ndc.set(0, 0);
      raycaster.setFromCamera(ndc, camera);
      under()?.act();
    },
    onBlocked: () => sounds.bump(),
    speed: 2.2,
    arrived: arrivedMoving === "desk",
    keep: "bitportal:fps",
  });
  hooks.fps = fps;
  renderer.domElement.addEventListener("pointerdown", (e) => {
    if (gameControls()) return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    panelDrag = !renderer.xr.isPresenting && !!panels?.pointer("down", raycaster);
    dragging = !panelDrag;
    lastX = e.clientX;
    moved = 0;
  });
  window.addEventListener("pointerup", (e) => {
    dragging = false;
    if (panelDrag) {
      panelDrag = false;
      raycaster.setFromCamera(ndc, camera);
      panels?.pointer("up", raycaster);
      return;
    }
    if (moved > 6 || renderer.xr.isPresenting || gameControls() || e.target !== renderer.domElement) return;
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const thing = under();
    if (thing) thing.act();
    else stepToFloor();
  });
  window.addEventListener("pointermove", (e) => {
    if (dragging && !renderer.xr.isPresenting) {
      rig.rotation.y += (e.clientX - lastX) * 0.005;
      moved += Math.abs(e.clientX - lastX);
      lastX = e.clientX;
    }
    if (!gameControls()) ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    if (panelDrag) {
      raycaster.setFromCamera(ndc, camera);
      panels?.pointer("move", raycaster);
    }
  });

  const controllers: THREE.Group[] = [];
  for (let i = 0; i < 2; i++) {
    const c = renderer.xr.getController(i);
    c.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -6)]),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }),
      ),
    );
    c.addEventListener("select", () => {
      const thing = aimFrom(c); // leaves the ray pointing where this hand points
      if (thing) {
        xrInput.pulse(i, 0.5, 30);
        thing.act();
      } else stepToFloor();
    });
    rig.add(c);
    controllers.push(c);
  }
  // Sticks and buttons, for visitors who have them, from any make of controller (the NSWP kit's input
  // layer). They add to pointing and selecting and never replace it: a stick's step is the same step.
  // Nothing in this room is picked up, and nothing about a controller is fetched from anywhere.
  const xrInput: XrInput = createXrInput({
    renderer,
    scene,
    arrivedIntense: arrivedMoving === "headset",
    rig,
    camera,
    controls,
    accent: ACCENT,
    // Walking smoothly reaches as far as walking with the keys does: into a doorway, which is how one is chosen on foot.
    canStand: (x, z) => crossing.allows(x, z) && Math.hypot(x, z) <= RADIUS + 1.5,
    stepFrom: (i) => {
      if (!aimFrom(controllers[i]!)) stepToFloor();
    },
    onMenu: () => xrConsole.setOpen(!xrConsole.open),
    onJump: () => void jump.jump(),
    // The visitor's own way to their controls, in this room as in any world: the menu button held (NSWP-11).
    onSummon: () => xrConsole.setOpen(true),
  });
  hooks.input = () => xrInput.info();
  // The visitor's panels are theirs: kept in this browser, with any file they hang, and sent nowhere. They are
  // not published, and nobody else in the room sees them.
  panels = createPanels({ scene, camera, accent: ACCENT, textColor: INK, input: xrInput, keep: "bitportal:panels", session: () => renderer.xr.getSession() });
  // Every door, as a list, on a panel in the room (door-list.ts).
  everyDoor = createDoorList({
    accent: `#${ACCENT.toString(16).padStart(6, "0")}`,
    ink: INK,
    rows: (): DoorRow[] =>
      listed.map(({ entry, saved: mine }) => {
        const host = hostParts(entry.world.url);
        return { id: entry.id, title: entry.world.title, host: `${host.prefix}${host.domain}`, summary: entry.world.summary ?? "", topics: entry.world.topics, saved: mine };
      }),
    hang: (texture, aspect, onPress, onClose) => panels!.open({ kind: "custom", title: "Every door", texture, aspect, onPress, onClose }, { id: "every-door", keep: false }),
    ask: (title, value) => panels!.keyboard.ask({ title, value, maxLength: 80 }),
    say: (text) => controls.say(text),
    onChoose: (id) => {
      const found = listed.find((x) => x.entry.id === id);
      if (found) void visitEntry(found.entry, "chosen");
    },
  });
  hooks.everyDoor = everyDoor;
  addPanelControls(controls, panels, { presenting: () => renderer.xr.isPresenting, kept: true });
  hooks.panels = panels;
  // The visitor's own computers: a terminal on one, in a panel. Theirs alone, and never offered to a world.
  const computers = addComputers({ controls, panels: () => panels ?? undefined, presenting: () => renderer.xr.isPresenting, relays: () => settings.relays, accent: ACCENT });
  hooks.computers = computers;

  // ------------------------------------------------------- presence
  let refreshRoom = () => {};
  // Whether the visitor is in the room here, and heard: it goes with them through a door.
  let travelling = (): { joined: boolean; mic: boolean } => ({ joined: false, mic: false });
  // In their own room a visitor is seen as they made themselves, if they have (spec §4.2).
  const myLook = loadLook();
  const presence = createPresence({ scene, camera, rig, renderer, controllers, labelColor: INK, look: () => (myLook ? inlineLook(myLook) : undefined), onChange: () => refreshRoom() });
  // And they can see it too: their own figure stands to one side, as others will see it.
  let mirror: Figure | null = null;
  if (myLook) {
    mirror = createFigure(lookOf(myLook));
    // Ahead and to the left of where a visitor first stands, turned to face them.
    mirror.group.position.set(1.9, 1.6, 4.6);
    mirror.group.rotation.y = Math.atan2(1.9, 4.6);
    const sign = textSprite("How others see you\nMenu: Change how you look", INK, 1.3);
    sign.position.set(1.9, 2.32, 4.6);
    scene.add(mirror.group, sign);
    state.mirror = mirror.look;
  }
  // Brought here by the Airlock from a world where they were in the room: it says so once, on this site only.
  // The people they have blocked everywhere are blocked here too: this room is their own client's.
  let arrived: { joined?: boolean; mic?: boolean; blocked?: string[] } = { blocked: loadBlockedEverywhere().map((b) => b.key) };
  try {
    const note = sessionStorage.getItem(ARRIVED_JOINED);
    sessionStorage.removeItem(ARRIVED_JOINED);
    if (note) arrived = { ...arrived, joined: true, mic: note === "mic" };
  } catch {
    /* storage unavailable: they are asked, as before */
  }
  // Someone they blocked in a world, reported on the way home, is waiting for their answer.
  const waiting = loadPendingBlocks().length;
  if (waiting) setTimeout(() => controls.say(`You blocked ${waiting === 1 ? "1 person" : `${waiting} people`} in a world. To block them everywhere you go, say so in Settings on the front page, or at your next door.`), 3000);
  ({ refresh: refreshRoom, travelling } = addRoomControls(controls, presence, { onState: (s) => (state.room = s), arrived, panels, sounds, sharedMusic: INSTANCE.sharedMusic !== false }));

  // -------------------------------------------------------- walking
  const keys = new Set<string>();
  window.addEventListener("keydown", (e) => {
    if (!(e.target instanceof HTMLButtonElement)) keys.add(e.code);
  });
  window.addEventListener("keyup", (e) => keys.delete(e.code));
  window.addEventListener("blur", () => keys.clear());
  const stepVec = new THREE.Vector3();
  const walk = (dt: number) => {
    const forward = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
    const strafe = (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);
    if (!forward && !strafe) return;
    stroll.stop(); // the keys take over from a walk a tap began
    // The kit's own walking pace, and Shift runs, moving the casual way as it does the intense way.
    const pace = WALK_SPEED * (keys.has("ShiftLeft") || keys.has("ShiftRight") ? RUN : 1);
    stepVec.set(strafe, 0, -forward).normalize().multiplyScalar(pace * dt).applyAxisAngle(THREE.Object3D.DEFAULT_UP, rig.rotation.y);
    rig.position.x += stepVec.x;
    rig.position.z += stepVec.z;
    const limit = RADIUS + 1.5;
    const dist = Math.hypot(rig.position.x, rig.position.z);
    if (dist > limit) {
      // Over the floor only: how high they are is the jump's.
      rig.position.x *= limit / dist;
      rig.position.z *= limit / dist;
      sounds.bump();
    }
  };

  // Walking through a doorway counts as choosing it.
  const head = new THREE.Vector3();
  const signAt = new THREE.Vector3();
  const eyeAt = new THREE.Vector3();
  const local = new THREE.Vector3();
  const walkedThrough = (): Door | null => {
    camera.getWorldPosition(head);
    for (const d of doors) {
      local.copy(head);
      d.group.worldToLocal(local);
      if (Math.abs(local.x) < DOOR_W / 2 - 0.15 && Math.abs(local.z) < 0.25) return d;
    }
    return null;
  };

  // ------------------------------------------------------------- VR
  // Back from a world (the Airlock says so in the address, and it is taken off at once). Someone who left a
  // headset session to come home is offered the way back into one, first and alone.
  const back = location.hash.replace(/^#/, "").split("&");
  const cameBack = back.includes("back");
  const cameFromHeadset = cameBack && back.includes("xr=1");
  // A link the Bridge printed asks to add a computer. It is taken off the address too, so a reload doesn't ask again.
  const pairing = computers.fromAddress(location.hash);
  if (cameBack || pairing) history.replaceState(history.state, "", location.pathname + location.search);
  // A refresh is not an arrival. Whoever was here is put back where they stood (further down), and if the refresh
  // ended a headset session, the way back into one is offered first, as it is to someone coming home.
  const stay = createStay();
  const stood = cameBack ? null : stay.before;
  const backToHeadset = cameFromHeadset || !!stood?.headset;
  let offered = backToHeadset;
  void addViewControls(controls, {
    renderer,
    rig,
    camera,
    hud,
    onState: (s) => (state.xr = s),
    ...(backToHeadset ? { arrived: { title: "BitPortal" } } : {}),
    onOffer: (showing) => (offered = showing),
  }).then((supported) => {
    if (!supported) offered = false;
  });

  // On a flat screen the page's own controls cover the bottom of the picture,
  // and on a phone that is where the doors are. So the picture is shifted up
  // until eye level sits in the middle of the space the controls leave free.
  // Pointing still lines up: rays are made from the same shifted camera.
  let covered = "";
  const fit = () => {
    if (renderer.xr.isPresenting) return; // the headset sets its own view
    camera.aspect = innerWidth / innerHeight;
    // A tall screen sees a wider slice top to bottom, so that it still takes in
    // three doors side by side and not one and a half.
    const across = THREE.MathUtils.degToRad(52);
    camera.fov = Math.min(90, Math.max(62, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(across / 2) / camera.aspect))));
    const cover = hud.cover();
    covered = `${cover.top}|${cover.bottom}`;
    const shift = Math.min(Math.round((cover.bottom - cover.top) / 2), Math.round(innerHeight * 0.3));
    if (shift > 0) camera.setViewOffset(innerWidth, innerHeight, 0, shift, innerWidth, innerHeight);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    state.shift = Math.max(shift, 0);
  };
  window.addEventListener("resize", fit);
  // The controls change height as keys come and go on the hotbar.
  setInterval(() => {
    const cover = hud.cover();
    if (`${cover.top}|${cover.bottom}` !== covered) fit();
  }, 500);
  renderer.xr.addEventListener("sessionend", fit);
  fit();

  // ------------------------------------------------------ test hooks
  let aimed: string | null = null;
  const where = new THREE.Vector3();
  hooks.doors = () =>
    doors.map((d) => ({
      id: d.entry.id,
      title: d.entry.world.title,
      domain: hostParts(d.entry.world.url).domain,
      wall: d.wall,
      position: d.group.getWorldPosition(where).toArray().map((n) => Math.round(n * 100) / 100),
    }));
  hooks.toggle = (id) => {
    const d = doors.find((x) => x.entry.id === id);
    if (d) void toggle(d);
  };
  hooks.putBack = () => void putBack();
  hooks.aim = (id) => (aimed = id);
  hooks.visit = (id) => {
    const d = doors.find((x) => x.entry.id === id);
    if (d) void visit(d);
  };
  hooks.roomInfo = () => presence.info();
  // How loud other people are is the visitor's to set, with the rest of their volumes.
  sounds.onChange((levels) => presence.setVolume(levels.off ? 0 : levels.voices));
  // The visitor's camera: a picture, a selfie, a short clip, saved to their own device.
  hooks.camera = addCameraControls(controls, {
    renderer,
    scene,
    camera,
    look: () => presence.selfLook(),
    recording: (on) => presence.setRecording(on),
    hide: () => [xrConsole.group, reticle, ...(toast ? [toast] : [])],
    name: "BitPortal room",
    // Whatever is taken here goes into the visitor's library, so it can be hung without leaving the headset.
    onCapture: (capture) => void panels?.library.add(capture.blob, capture.name),
  });
  hooks.teleport = (x, z) => {
    rig.position.x = x - camera.position.x;
    rig.position.z = z - camera.position.z;
  };

  await buildDoors();
  // Test aid: ?aim=2 starts with the third door pointed at.
  const aimIndex = params.get("aim");
  if (aimIndex !== null) aimed = doors[Number(aimIndex)]?.entry.id ?? null;

  // Which way the visitor faces on arriving (spec §14.1). Back from a world:
  // the door they left through. Otherwise their own wall if it has doors, and
  // the suggestions if it doesn't, so nobody starts by facing empty frames.
  const left = readLeft();
  // Whether they left by this room's door or from the list: if the room has a door to where they went, they face it.
  const leftDoor = left ? doors.find((d) => d.entry.id === left.id) : undefined;
  if (leftDoor) {
    leftDoor.group.getWorldPosition(where);
    rig.rotation.y = Math.atan2(-where.x, -where.z);
    state.facing = "door";
  } else if (doors.some((d) => d.wall === "yours")) state.facing = "yours";
  else {
    rig.rotation.y = Math.PI;
    state.facing = "suggested";
  }

  if (stood) {
    rig.position.x = stood.x;
    rig.position.z = stood.z;
    rig.rotation.y = THREE.MathUtils.degToRad(stood.yaw);
    state.facing = "as before";
  }
  const keepPlace = () => stay.keep({ x: rig.position.x, z: rig.position.z, yaw: THREE.MathUtils.radToDeg(rig.rotation.y), headset: renderer.xr.isPresenting });
  addEventListener("pagehide", keepPlace);
  setInterval(keepPlace, 1000);

  // A first visit gets one line on how a door is used, low in front of the
  // visitor, below the doors. It is never shown again once they have used one.
  let knowsDoors = true;
  try {
    knowsDoors = localStorage.getItem(USED_A_DOOR) === "1";
  } catch {
    /* storage unavailable: say nothing */
  }
  // For someone who hasn't been through a door yet. In a headset it is a sign in the room, kept the same size in
  // their view; on a flat screen it is said beside the controls, where it is never in the way of the doors.
  let hint: THREE.Sprite | null = null;
  if (!knowsDoors) {
    hint = textSprite("Point at a door and select it: pull the trigger or pinch.\nYou'll see where it leads before you go.", INK, 2.6);
    hint.position.set(-Math.sin(rig.rotation.y) * 3.4, 0.62, -Math.cos(rig.rotation.y) * 3.4);
    hint.userData.natural = hint.scale.clone();
    hint.visible = false;
    scene.add(hint);
    state.hint = true;
    setTimeout(() => {
      if (!renderer.xr.isPresenting) controls.say("Point at a door and click it. You'll see where it leads before you go.");
    }, 2500);
  }

  // --------------------------------------------------------- frames

  const accent = new THREE.Color(ACCENT);
  const started = performance.now();
  let lastT = 0;
  let wasBusy = false;
  const movedFrom = rig.position.clone();
  // A jump, the same however they are moving: Space, the Jump control where there is no keyboard, A or X in a headset.
  const floorY = rig.position.y;
  const jump = addJump(controls, { presenting: () => renderer.xr.isPresenting, sounds, hud, busy: () => !!panels?.keyboard.open });
  hooks.jump = jump;
  renderer.setAnimationLoop(() => {
    // Steps are made from how far the visitor was moved, not from how their head sways, and not while they are in the air.
    if (state.ready && !jump.airborne) sounds.moved(Math.hypot(rig.position.x - movedFrom.x, rig.position.z - movedFrom.z));
    movedFrom.copy(rig.position);
    const t = (performance.now() - started) / 1000;
    const dt = Math.min(t - lastT, 0.1);
    lastT = t;
    rig.position.y = floorY + jump.update(dt);
    xrInput.update(dt);
    panels!.update(t, dt);
    // The keyboard and the library's board come up where the console is: it steps aside for them.
    const busy = panels!.keyboard.open || panels!.library.showing;
    if (busy && !wasBusy) xrConsole.setOpen(false);
    wasBusy = busy;
    crossing.update(t, dt);
    // Shut in the crossing's room, nobody else is in it with the visitor, wherever they happen to be standing.
    presence.setHidden(crossing.state !== "none");
    presence.update(dt);
    let pointed: Clickable | null = null;
    reticle.visible = false;
    if (renderer.xr.isPresenting) {
      for (const c of controllers) {
        if (!c.visible) continue;
        const thing = aimFrom(c);
        pointed = thing ?? pointed;
        const to = thing ? null : floorSpot();
        if (to) {
          reticle.position.set(to.x, 0.02, to.z);
          reticle.visible = true;
        }
      }
      const through = walkedThrough();
      if (through) void visit(through, "walked");
    } else {
      // Game controls have the visitor's movement when they are on, and aim from the middle of the view.
      if (fps!.update(dt)) ndc.set(0, 0);
      else {
        walk(dt);
        stroll.update(dt);
      }
      raycaster.setFromCamera(ndc, camera);
      pointed = under();
      const through = walkedThrough();
      if (through) void visit(through, "walked");
    }
    if (aimed) pointed = clickables.find((c) => c.door?.entry.id === aimed && c.mesh === c.door.view) ?? pointed;
    // Moving the intense way, the pointer's picture is the kit's to hide: the middle of the view is what points.
    if (renderer.xr.isPresenting || !fps!.enabled) renderer.domElement.style.cursor = pointed ? "pointer" : "grab";
    const hovered = pointed?.door ?? null;
    const key = pointed ? `${hovered?.entry.id ?? ""}|${pointed.say}` : null;
    if (key !== state.pointed) {
      state.pointed = key;
      state.hovered = hovered?.entry.id ?? null;
      if (pointed?.say) controls.setTarget(pointed.say);
      else if (hovered) {
        const w = hovered.entry.world;
        const host = hostParts(w.url);
        // Beside the controls, at a size that doesn't depend on where the visitor stands: what it is, why it is
        // here, and how to go.
        controls.setTarget(`${w.title}, at ${host.prefix}${host.domain}`, [w.summary ?? "", hovered.why, fps?.enabled ? "F or click to visit" : "Click to visit"]);
      } else controls.setTarget("");
    }
    if (hint) {
      hint.visible = renderer.xr.isPresenting;
      if (hint.visible) hint.scale.copy(hint.userData.natural as THREE.Vector3).multiplyScalar(viewScale(hint.getWorldPosition(signAt).distanceTo(camera.getWorldPosition(eyeAt)), { at: 3.4, least: 0.3, most: 1.3 }));
    }
    for (const d of doors) {
      // A door answers to being pointed at; its button answers on its own.
      const onDoor = pointed?.door === d && pointed.mesh === d.view;
      d.hover += ((onDoor ? 1 : 0) - d.hover) * Math.min(1, dt * 12);
      d.metal.tick(t);
      d.metal.aim(d.hover);
      // The sign in the world is a headset's. It keeps its size in the view, and steps aside when the visitor
      // is at the door itself.
      const away = d.info.visible || onDoor ? d.info.getWorldPosition(signAt).distanceTo(camera.getWorldPosition(eyeAt)) : 0;
      d.info.visible = d.hover > 0.5 && renderer.xr.isPresenting && away > 0.9;
      if (d.info.visible) d.info.scale.copy(d.info.userData.natural as THREE.Vector3).multiplyScalar(viewScale(away, { at: 6, least: 0.16, most: 1.1 }));
      d.view.position.z = -0.12 * d.hover; // the door swings in a little
    }
    for (const c of clickables) if (c.mesh && c.mesh !== c.door?.view) c.mesh.scale.setScalar(c === pointed ? 1.12 : 1);
    if (toast && performance.now() > toastUntil) {
      camera.remove(toast);
      toast.material.map?.dispose();
      toast.material.dispose();
      toast = null;
    }
    xrConsole.aim(pointed?.onConsole ?? null);
    panels!.aim(pointed?.onPanel ?? null);
    xrConsole.update(dt, camera, renderer.xr.isPresenting);
    // The console's own button sits where the keyboard comes up, and shows through it: away while typing.
    if (panels!.keyboard.open) xrConsole.group.visible = false;
    furniture.update(t, dt);
    mirror?.tick(t);
    renderer.render(scene, camera);
  });
  // Coming home, the visitor steps out of the same room they left the world in, facing the door they went through.
  if (cameBack) {
    camera.updateMatrixWorld(true);
    crossing.arrive({ title: "BitPortal", address: location.host, hold: () => offered });
  }
  state.ready = true;

  // Newer announcements from relays, after the bundled set is on screen.
  try {
    // Whoever announced a world the operators listed is asked too, or a listed world nobody here has heard from stays missing.
    const listed = [...catalog.allowed].map((id) => id.split(":")[1] ?? "").filter(Boolean);
    const authors = [...new Set([catalog.curator.pubkey, ...INSTANCE.operators, ...listed, ...followedAuthors(followed), ...catalog.entries.map((e) => e.event.pubkey), ...saved.map((x) => x.event.pubkey)])].slice(0, 400);
    const res = await queryRelays(settings.relays, { kinds: [WORLD_KIND, CURATION_SET_KIND], authors, limit: 400 }, 4000);
    const fresherLists = refreshFollowed(followed, res.events);
    if (fresherLists !== followed) {
      followed = fresherLists;
      storeFollowed(followed);
    }
    const shown = () => JSON.stringify([catalog.entries.map((e) => [e.id, e.event.id]), saved.map((x) => x.event.id)]);
    const before = shown();
    catalog = makeCatalog(res.events);
    storeOperatorLists(catalog.operatorLists);
    if (catalog.operatorLists.length) {
      // The operators' lists may name worlds this page only now knows to ask about.
      const more = [...new Set([...catalog.allowed].map((id) => id.split(":")[1] ?? "").filter((k) => k && !authors.includes(k)))].slice(0, 200);
      if (more.length) catalog = makeCatalog([...res.events, ...(await queryRelays(settings.relays, { kinds: [WORLD_KIND], authors: more, limit: 400 }, 4000)).events]);
    }
    const fresher = refreshSaved(saved, res.events);
    if (fresher !== saved) keep(fresher);
    if (before !== shown()) await buildDoors();
    state.relays = Object.values(res.relays).filter((x) => x === "eose").length;
  } catch {
    /* the bundled set stands */
  }
}

void start();
