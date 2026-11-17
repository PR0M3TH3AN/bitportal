/**
 * The walk-in lobby: the same doors as the list, as a hall you stand in.
 *
 * - Point at a door (mouse, controller ray, or a pinch) and select it, or walk
 *   through it. Either way you go to the Airlock, which is always a flat page:
 *   a 3D scene can't be trusted to show an address (NSWP spec §6.2).
 * - Like the list, drawing the hall contacts relays only. Door art is drawn
 *   from each world's address, never fetched (spec §5.7).
 * - Other visitors appear only after you press "Join the room".
 *
 * Input uses only the WebXR `select` event, so it works with controllers,
 * hand pinches and gaze-and-pinch alike (spec §21.2).
 */
import * as THREE from "three";
import { buildAirlockUrl, checkDestination, CURATION_SET_KIND, encodeNaddr, queryRelays, WORLD_KIND } from "@nswp/core";
import { attachRoomControls, createPresence, textSprite } from "nswp-sdk/three";
import bundleJson from "../starter/starter-set.json";
import { buildCatalog, type Catalog, type Entry, type StarterBundle } from "../shared/catalog.js";
import { detectTier, deviceFit, type Device } from "../shared/device.js";
import { doorArt } from "../shared/door.js";
import { loadSettings } from "../shared/settings.js";
import type { Candidate } from "../shared/shelves.js";
import { cachedVerification } from "../shared/verify.js";
import { VERSION } from "../shared/version.js";
import type { FeedRequest, FeedResponse } from "../lobby/feed-worker.js";

interface Door {
  entry: Entry;
  why: string;
  group: THREE.Group;
  view: THREE.Mesh;
  frame: THREE.Mesh;
  info: THREE.Sprite;
  hover: number;
}

interface TestHooks {
  state: Record<string, unknown>;
  doors(): { id: string; title: string; domain: string; position: number[] }[];
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
const ACCENT = 0x3fc584;
const DOOR_W = 1.5;
const DOOR_H = 2.1;
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

function hostParts(url: string): { prefix: string; domain: string } {
  const chk = checkDestination(url);
  if (!chk.ok) return { prefix: "", domain: "invalid address" };
  return { prefix: chk.value.hostPrefix, domain: chk.value.registrableDomain ?? chk.value.hostname };
}

/** The arch outline, shared by the view and its frame. */
function archPath(g: CanvasRenderingContext2D, w: number, h: number, inset: number): void {
  const ry = h * 0.36;
  g.beginPath();
  g.moveTo(inset, h);
  g.lineTo(inset, ry);
  g.ellipse(w / 2, ry, w / 2 - inset, ry - inset, 0, Math.PI, 0);
  g.lineTo(w - inset, h);
  g.closePath();
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d")!);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** The same generated view the list draws in CSS, painted for a 3D door. */
function viewTexture(id: string): THREE.CanvasTexture {
  const art = doorArt(id);
  const W = 500;
  const H = 700;
  return canvasTexture(W, H, (g) => {
    archPath(g, W, H, 6);
    g.save();
    g.clip();
    const horizon = H * 0.66;
    const sky = g.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, art.skyTop);
    sky.addColorStop(1, art.skyLow);
    g.fillStyle = sky;
    g.fillRect(0, 0, W, horizon);
    const gx = (art.glowX / 100) * W;
    const gy = (art.glowY / 100) * H;
    const glow = g.createRadialGradient(gx, gy, 0, gx, gy, W * 0.3);
    glow.addColorStop(0, art.glow);
    glow.addColorStop(0.25, art.glow);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, W, horizon);
    g.fillStyle = art.ground;
    g.fillRect(0, horizon, W, H - horizon);
    g.globalAlpha = 0.3;
    g.fillStyle = art.glow;
    g.beginPath();
    g.moveTo(W * 0.45, horizon);
    g.lineTo(W * 0.55, horizon);
    g.lineTo(W * 0.76, H);
    g.lineTo(W * 0.24, H);
    g.closePath();
    g.fill();
    g.restore();
  });
}

function frameTexture(): THREE.CanvasTexture {
  const W = 500;
  const H = 700;
  return canvasTexture(W, H, (g) => {
    archPath(g, W, H, 7);
    g.lineWidth = 12;
    g.strokeStyle = "#ffffff";
    g.stroke();
  });
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
  const marks: { text: string; color: string }[] = [];
  if (cachedVerification(entry.id, entry.world.createdAt)?.state === "verified") marks.push({ text: "✓ Verified", color: "#6fdc9b" });
  if (!fit.ok) marks.push({ text: fit.reason, color: "#ffcf70" });
  if (entry.world.comfort.intensity === "high") marks.push({ text: "Intense", color: "#ffcf70" });
  if (entry.world.contentWarning !== undefined) marks.push({ text: "Content warning", color: "#ffcf70" });
  return canvasTexture(W, H, (g) => {
    g.textBaseline = "top";
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
  const hooks: TestHooks = { state, doors: () => [], aim: () => {}, visit: () => {}, roomInfo: () => [], teleport: () => {} };
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
  const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.05, 100);
  camera.position.set(0, 1.6, 0);
  const rig = new THREE.Group();
  rig.add(camera);
  scene.add(rig);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1c22, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.position.set(2, 8, 4);
  scene.add(key);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 72), new THREE.MeshStandardMaterial({ color: 0x101217, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const rings = new THREE.PolarGridHelper(14, 16, 7, 96, 0x2a2e37, 0x1b1e25);
  rings.position.y = 0.005;
  scene.add(rings);

  // ------------------------------------------------------------- doors
  let catalog: Catalog = buildCatalog(bundleJson as unknown as StarterBundle);
  const frameMap = frameTexture();
  const doorGeo = new THREE.PlaneGeometry(DOOR_W, DOOR_H);
  const plateGeo = new THREE.PlaneGeometry(1.9, 1.9 * (420 / 1024));
  const sillGeo = new THREE.BoxGeometry(DOOR_W + 0.1, 0.06, 0.24);
  const doorRoot = new THREE.Group();
  scene.add(doorRoot);
  let doors: Door[] = [];
  let radius = 6;

  const buildDoors = async () => {
    const ordered = await orderEntries(catalog.entries, device, settings.ranking);
    doorRoot.clear();
    doors = [];
    const n = ordered.length;
    const step = THREE.MathUtils.degToRad(19);
    radius = Math.max(6, (n * 2.0) / (Math.PI * 1.1)); // widen the hall before doors crowd
    const spread = Math.min(step, (Math.PI * 1.1) / Math.max(n, 1));
    ordered.forEach(({ entry, why }, i) => {
      const theta = (i - (n - 1) / 2) * spread;
      const group = new THREE.Group();
      group.position.set(Math.sin(theta) * radius, 0, -Math.cos(theta) * radius);
      group.rotation.y = -theta;
      const view = new THREE.Mesh(doorGeo, new THREE.MeshBasicMaterial({ map: viewTexture(entry.id), transparent: true, alphaTest: 0.5 }));
      view.position.y = DOOR_H / 2;
      const frame = new THREE.Mesh(doorGeo, new THREE.MeshBasicMaterial({ map: frameMap, transparent: true, color: 0xffffff }));
      frame.position.set(0, DOOR_H / 2, 0.01);
      const sill = new THREE.Mesh(sillGeo, new THREE.MeshBasicMaterial({ color: 0xf2f3f6 }));
      sill.position.set(0, 0.03, 0.05);
      const plate = new THREE.Mesh(plateGeo, new THREE.MeshBasicMaterial({ map: plateTexture(entry, device), transparent: true }));
      plate.position.set(0, DOOR_H + 0.52, 0);
      // Large and well in front of the door: readable from the middle of the hall.
      const info = textSprite(infoLines(entry, why, vr), INK, 2.6);
      info.position.set(0, 1.25, 2.2);
      info.visible = false;
      info.renderOrder = 2;
      group.add(view, frame, sill, plate, info);
      doorRoot.add(group);
      doors.push({ entry, why, group, view, frame, info, hover: 0 });
    });
    state.doorCount = doors.length;
  };

  const title = textSprite(`BitPortal\nDoors picked by ${catalog.curator.title}`, INK, 4.2);
  title.position.set(0, 4.6, -radius - 0.6);
  scene.add(title);

  // ------------------------------------------------------- leaving
  let leaving = false;
  const visit = async (door: Door) => {
    if (leaving) return;
    leaving = true;
    state.leaving = door.entry.id;
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

  // ------------------------------------------------------ pointing
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(2, 2); // off-screen until the mouse moves
  const doorUnder = (): Door | null => {
    const hit = raycaster.intersectObjects(doors.map((d) => d.view), false)[0];
    return hit ? (doors.find((d) => d.view === hit.object) ?? null) : null;
  };
  const tmp = new THREE.Matrix4();
  const aimFrom = (source: THREE.Object3D): Door | null => {
    tmp.identity().extractRotation(source.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(source.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tmp);
    return doorUnder();
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
    const d = doorUnder();
    if (d) void visit(d);
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
      const d = aimFrom(c);
      if (d) void visit(d);
    });
    rig.add(c);
    controllers.push(c);
  }

  // ------------------------------------------------------- presence
  let refreshRoom = () => {};
  const presence = createPresence({ scene, camera, rig, renderer, controllers, labelColor: INK, onChange: () => refreshRoom() });
  ({ refresh: refreshRoom } = attachRoomControls(presence, {
    roomButton: $<HTMLButtonElement>("room-button"),
    micButton: $<HTMLButtonElement>("mic-button"),
    inviteButton: $<HTMLButtonElement>("invite-button"),
    status: $("room-status"),
    onState: (s) => (state.room = s),
  }));

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
    const limit = radius + 1.5;
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
  const vrButton = $<HTMLButtonElement>("vr-button");
  if (vr) {
    vrButton.disabled = false;
    vrButton.textContent = "Enter VR";
    vrButton.addEventListener("click", async () => {
      if (renderer.xr.isPresenting) {
        await renderer.xr.getSession()?.end();
        return;
      }
      try {
        const session = await navigator.xr!.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "hand-tracking"] });
        await renderer.xr.setSession(session);
        state.xr = "presenting";
        vrButton.textContent = "Exit VR";
        session.addEventListener("end", () => {
          state.xr = "ended";
          vrButton.textContent = "Enter VR";
        });
      } catch (err) {
        state.xr = `error: ${err instanceof Error ? err.message : String(err)}`;
      }
    });
  } else vrButton.textContent = navigator.xr ? "VR isn't available on this device" : "This browser has no WebXR";

  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // ------------------------------------------------------ test hooks
  let aimed: string | null = null;
  hooks.doors = () =>
    doors.map((d) => ({ id: d.entry.id, title: d.entry.world.title, domain: hostParts(d.entry.world.url).domain, position: d.group.position.toArray().map((n) => Math.round(n * 100) / 100) }));
  hooks.aim = (id) => (aimed = id);
  hooks.visit = (id) => {
    const d = doors.find((x) => x.entry.id === id);
    if (d) void visit(d);
  };
  hooks.roomInfo = () => presence.info();
  hooks.teleport = (x, z) => {
    rig.position.x = x - camera.position.x;
    rig.position.z = z - camera.position.z;
  };

  await buildDoors();
  // Test aid: ?aim=2 starts with the third door pointed at.
  const aimIndex = params.get("aim");
  if (aimIndex !== null) aimed = doors[Number(aimIndex)]?.entry.id ?? null;

  // --------------------------------------------------------- frames
  const doorLine = $("door-line");
  const accent = new THREE.Color(ACCENT);
  const white = new THREE.Color(0xffffff);
  const started = performance.now();
  let lastT = 0;
  renderer.setAnimationLoop(() => {
    const t = (performance.now() - started) / 1000;
    const dt = Math.min(t - lastT, 0.1);
    lastT = t;
    presence.update(dt);
    let hovered: Door | null = null;
    if (renderer.xr.isPresenting) {
      for (const c of controllers) hovered = (c.visible ? aimFrom(c) : null) ?? hovered;
      const through = walkedThrough();
      if (through) void visit(through);
    } else {
      walk(dt);
      raycaster.setFromCamera(ndc, camera);
      hovered = doorUnder();
      const through = walkedThrough();
      if (through) void visit(through);
    }
    if (aimed) hovered = doors.find((d) => d.entry.id === aimed) ?? hovered;
    renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
    if ((hovered?.entry.id ?? null) !== state.hovered) {
      state.hovered = hovered?.entry.id ?? null;
      const w = hovered?.entry.world;
      const host = w ? hostParts(w.url) : null;
      doorLine.replaceChildren();
      if (w && host) {
        const where = document.createElement("span");
        where.className = "key";
        where.textContent = `${host.prefix}${host.domain}`;
        doorLine.append(`${w.title} at `, where, w.summary ? `. ${w.summary}` : ".");
      }
    }
    for (const d of doors) {
      d.hover += ((d === hovered ? 1 : 0) - d.hover) * Math.min(1, dt * 12);
      (d.frame.material as THREE.MeshBasicMaterial).color.copy(white).lerp(accent, d.hover);
      d.info.visible = d.hover > 0.5;
      d.view.position.z = -0.12 * d.hover; // the door swings in a little
    }
    renderer.render(scene, camera);
  });
  state.ready = true;

  // Newer announcements from relays, after the bundled set is on screen.
  try {
    const authors = [...new Set([catalog.curator.pubkey, ...catalog.entries.map((e) => e.event.pubkey)])];
    const res = await queryRelays(settings.relays, { kinds: [WORLD_KIND, CURATION_SET_KIND], authors, limit: 200 }, 4000);
    const before = JSON.stringify(catalog.entries.map((e) => [e.id, e.event.id]));
    catalog = buildCatalog(bundleJson as unknown as StarterBundle, res.events);
    if (before !== JSON.stringify(catalog.entries.map((e) => [e.id, e.event.id]))) await buildDoors();
    state.relays = Object.values(res.relays).filter((s) => s === "eose").length;
  } catch {
    /* the bundled set stands */
  }
}

void start();
