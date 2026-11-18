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
import { buildAirlockUrl, checkDestination, CURATION_SET_KIND, encodeNaddr, queryRelays, WORLD_KIND } from "@nswp/core";
import { createHome, type Alloy } from "nswp-sdk/home";
import { addCameraControls, addRoomControls, addViewControls, createConsole, createFigure, createPortalWindow, createPresence, panoramaTexture, textSprite, type Figure, type XrConsole } from "nswp-sdk/three";
import { inlineLook, loadLook, lookOf } from "../shared/look.js";
import { createControls, mountHud, type Controls } from "nswp-sdk/ui";
import bundleJson from "../starter/starter-set.json";
import { buildCatalog, type Catalog, type Entry, type StarterBundle } from "../shared/catalog.js";
import { detectTier, deviceFit, type Device } from "../shared/device.js";
import { archMaskTexture, canvasTexture, DOOR_H, DOOR_W, doorFrame, flatViewTexture, viewTexture } from "../shared/door3d.js";
import { createJumpList } from "../shared/jump.js";
import { plateMarks } from "../shared/plate.js";
import { decidePreview, loadPreview } from "../shared/preview.js";
import { loadRoom } from "../shared/room.js";
import { addSaved, loadSaved, readLeft, refreshSaved, rememberLeft, removeSaved, restoreSaved, savedEntries, storeSaved, WALL_DOORS, wallSlot, type SavedPlace } from "../shared/saved.js";
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
  /** What selecting it does, in words, for the line under the room. */
  say: string;
  act(): void;
  door?: Door;
}

interface TestHooks {
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
  /** Point the mouse ray at a door, as if hovering it. */
  aim(id: string | null): void;
  visit(id: string): void;
  roomInfo(): unknown;
  teleport(x: number, z: number): void;
  device?: unknown;
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
  const controls = createControls({ title: "Your room", address: location.host, theme: { accent: room.layout.room.accent } });
  const hud = mountHud(controls);
  hooks.controls = controls;
  const jumpList = createJumpList({ relays: () => settings.relays, from: "walk" });
  // The editor is a page, which can't be seen in a headset.
  controls.addSection({ id: "you", label: "You", icon: "room", note: "How other people see you when you share a room. It is kept on this device." });
  controls.add({ id: "figure", section: "you", icon: "room", label: "Change how you look", short: "You", hidden: () => renderer.xr.isPresenting, act: () => location.assign("/look/") });
  controls.add(
    // The jump list is a page dialog, which can't be seen in a headset. There, the wall is the list.
    { id: "doors", section: "travel", icon: "save", hotbar: true, label: "Your doors, as a list", short: "Doors", hidden: () => renderer.xr.isPresenting, act: () => jumpList.open() },
    { id: "list", section: "travel", icon: "list", hotbar: true, label: "Every door, as a list", short: "List", act: () => location.assign("/") },
  );
  controls.addSection({
    id: "help",
    label: "Help",
    icon: "help",
    note: "Your doors are on one wall, and suggested ones on the wall behind it. Drag to look around. Walk with W, A, S, D, or point at the floor and select to step there. Select a door, or walk through it, to see where it leads before you go.",
  });
  // The ground and the skyline come with the home (nswp-sdk/home), in the room's own colours.
  scene.background = new THREE.Color(0x04070b);
  scene.fog = new THREE.Fog(0x04070b, 60, 300);

  // ------------------------------------------------------------- doors
  let catalog: Catalog = buildCatalog(bundleJson as unknown as StarterBundle);
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
    // Large and well in front of the door: readable from the middle of the room.
    const info = textSprite(infoLines(entry, why, vr), INK, 2.6);
    info.position.set(0, 1.25, 2.2);
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
    clickables.push({ mesh: b, say: "Leave the room for the full list of doors.", act: () => location.assign("/") });
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
    header("suggested", ordered.length ? `Suggested\nPicked by ${catalog.curator.title}` : "Suggested\nYou've saved every door on this list");

    state.doorCount = doors.length;
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
  const visit = async (door: Door) => {
    if (leaving) return;
    leaving = true;
    state.leaving = door.entry.id;
    rememberLeft({ id: door.entry.id, from: "walk" });
    try {
      localStorage.setItem(USED_A_DOOR, "1"); // they know how a door works now
    } catch {
      /* storage unavailable */
    }
    document.body.classList.add("leaving");
    const w = door.entry.world;
    const naddr = encodeNaddr({ kind: WORLD_KIND, pubkey: door.entry.event.pubkey, identifier: w.d, relays: settings.relays.slice(0, 2) });
    try {
      await renderer.xr.getSession()?.end();
    } catch {
      /* already ended */
    }
    location.assign(buildAirlockUrl(new URL("/go/", location.origin).href, { naddr, url: w.url }));
  };

  const raycaster = new THREE.Raycaster();
  raycaster.camera = camera; // rays from a hand don't set it, and signs need it

  // ------------------------------------------------- the console in a headset
  // In a headset the page can't be seen, so the room's controls go on a console
  // in the scene. Turn around matters most there: the other wall is behind the
  // visitor, and someone seated can't turn to face it.
  const xrConsole = createConsole(controls, { renderer, rig });
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
    if (far > 5) {
      dx *= 5 / far;
      dz *= 5 / far;
    }
    spot.set(headNow.x + dx, 0, headNow.z + dz);
    const out = Math.hypot(spot.x, spot.z);
    const limit = RADIUS - 1.2;
    if (out > limit) spot.multiplyScalar(limit / out);
    return spot;
  };
  const stepToFloor = () => {
    const to = floorSpot();
    if (!to) return;
    camera.getWorldPosition(headNow);
    rig.position.x += to.x - headNow.x;
    rig.position.z += to.z - headNow.z;
    state.steps = ((state.steps as number | undefined) ?? 0) + 1;
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
  hooks.where = () => {
    camera.getWorldPosition(headNow);
    return [Math.round(headNow.x * 100) / 100, Math.round(headNow.z * 100) / 100];
  };

  const ndc = new THREE.Vector2(2, 2); // off-screen until the mouse moves
  /** What the current ray points at: a door, or one of the room's buttons. */
  const under = (): Clickable | null => {
    const button = xrConsole.pick(raycaster);
    if (button) return { mesh: null, onConsole: button, say: "", act: () => xrConsole.press(button) };
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
  renderer.domElement.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    moved = 0;
  });
  window.addEventListener("pointerup", (e) => {
    dragging = false;
    if (moved > 6 || renderer.xr.isPresenting || e.target !== renderer.domElement) return;
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
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
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
      if (thing) thing.act();
      else stepToFloor();
    });
    rig.add(c);
    controllers.push(c);
  }

  // ------------------------------------------------------- presence
  let refreshRoom = () => {};
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
  ({ refresh: refreshRoom } = addRoomControls(controls, presence, { onState: (s) => (state.room = s) }));

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
    stepVec.set(strafe, 0, -forward).normalize().multiplyScalar(2.2 * dt).applyAxisAngle(THREE.Object3D.DEFAULT_UP, rig.rotation.y);
    rig.position.add(stepVec);
    const limit = RADIUS + 1.5;
    const dist = Math.hypot(rig.position.x, rig.position.z);
    if (dist > limit) rig.position.multiplyScalar(limit / dist);
  };

  // Walking through a doorway counts as choosing it.
  const head = new THREE.Vector3();
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
  void addViewControls(controls, { renderer, rig, camera, hud, onState: (s) => (state.xr = s) });

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
  // The visitor's camera: a picture, a selfie, a short clip, saved to their own device.
  hooks.camera = addCameraControls(controls, {
    renderer,
    scene,
    camera,
    look: () => presence.selfLook(),
    recording: (on) => presence.setRecording(on),
    hide: () => [xrConsole.group, reticle, ...(toast ? [toast] : [])],
    name: "BitPortal room",
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
  const leftDoor = left?.from === "walk" ? doors.find((d) => d.entry.id === left.id) : undefined;
  if (leftDoor) {
    leftDoor.group.getWorldPosition(where);
    rig.rotation.y = Math.atan2(-where.x, -where.z);
    state.facing = "door";
  } else if (doors.some((d) => d.wall === "yours")) state.facing = "yours";
  else {
    rig.rotation.y = Math.PI;
    state.facing = "suggested";
  }

  // A first visit gets one line on how a door is used, low in front of the
  // visitor, below the doors. It is never shown again once they have used one.
  let knowsDoors = true;
  try {
    knowsDoors = localStorage.getItem(USED_A_DOOR) === "1";
  } catch {
    /* storage unavailable: say nothing */
  }
  if (!knowsDoors) {
    const hint = textSprite("Point at a door and select it: click, tap, pull the trigger or pinch.\nYou'll see where it leads before you go.", INK, 2.6);
    hint.position.set(-Math.sin(rig.rotation.y) * 3.4, 0.62, -Math.cos(rig.rotation.y) * 3.4);
    scene.add(hint);
    state.hint = true;
  }

  // --------------------------------------------------------- frames

  const accent = new THREE.Color(ACCENT);
  const started = performance.now();
  let lastT = 0;
  renderer.setAnimationLoop(() => {
    const t = (performance.now() - started) / 1000;
    const dt = Math.min(t - lastT, 0.1);
    lastT = t;
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
      if (through) void visit(through);
    } else {
      walk(dt);
      raycaster.setFromCamera(ndc, camera);
      pointed = under();
      const through = walkedThrough();
      if (through) void visit(through);
    }
    if (aimed) pointed = clickables.find((c) => c.door?.entry.id === aimed && c.mesh === c.door.view) ?? pointed;
    renderer.domElement.style.cursor = pointed ? "pointer" : "grab";
    const hovered = pointed?.door ?? null;
    const key = pointed ? `${hovered?.entry.id ?? ""}|${pointed.say}` : null;
    if (key !== state.pointed) {
      state.pointed = key;
      state.hovered = hovered?.entry.id ?? null;
      if (pointed?.say) controls.setTarget(pointed.say);
      else if (hovered) {
        const w = hovered.entry.world;
        const host = hostParts(w.url);
        controls.setTarget(`${w.title}, at ${host.prefix}${host.domain}`);
      } else controls.setTarget("");
    }
    for (const d of doors) {
      // A door answers to being pointed at; its button answers on its own.
      const onDoor = pointed?.door === d && pointed.mesh === d.view;
      d.hover += ((onDoor ? 1 : 0) - d.hover) * Math.min(1, dt * 12);
      d.metal.tick(t);
      d.metal.aim(d.hover);
      d.info.visible = d.hover > 0.5;
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
    xrConsole.update(dt, camera, renderer.xr.isPresenting);
    furniture.update(t, dt);
    mirror?.tick(t);
    renderer.render(scene, camera);
  });
  state.ready = true;

  // Newer announcements from relays, after the bundled set is on screen.
  try {
    const authors = [...new Set([catalog.curator.pubkey, ...catalog.entries.map((e) => e.event.pubkey), ...saved.map((x) => x.event.pubkey)])];
    const res = await queryRelays(settings.relays, { kinds: [WORLD_KIND, CURATION_SET_KIND], authors, limit: 200 }, 4000);
    const shown = () => JSON.stringify([catalog.entries.map((e) => [e.id, e.event.id]), saved.map((x) => x.event.id)]);
    const before = shown();
    catalog = buildCatalog(bundleJson as unknown as StarterBundle, res.events);
    const fresher = refreshSaved(saved, res.events);
    if (fresher !== saved) keep(fresher);
    if (before !== shown()) await buildDoors();
    state.relays = Object.values(res.relays).filter((x) => x === "eose").length;
  } catch {
    /* the bundled set stands */
  }
}

void start();
