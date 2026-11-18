/**
 * The room, live, at the top of the landing page.
 *
 * It is the same room `/walk/` opens into, drawn with the same doors: the
 * curator's list, each with the art or the preview it has everywhere else.
 * Pointing at a door names it, and choosing one opens the same details the
 * list below does. Nothing here contacts a world: it draws from the bundled
 * list and BitPortal's own mirror, like the list (NSWP spec §5.7, §5.8).
 *
 * It is loaded after the page is up, and only where it can be drawn. Without
 * it the page is whole: the list is the same doors.
 */
import * as THREE from "three";
import { createEnvironment, type Alloy } from "nswp-sdk/home";
import { createPortalWindow, panoramaTexture } from "nswp-sdk/three";
import type { Entry } from "../shared/catalog.js";
import { archMaskTexture, DOOR_H, DOOR_W, doorFrame, flatViewTexture, viewTexture } from "../shared/door3d.js";
import { decidePreview, loadPreview } from "../shared/preview.js";

export interface Hero {
  /** Draw the doors again, after the list changed. */
  refresh(): void;
  /** Move in towards the doors, as walking in. Resolves when it is time to go. */
  enter(): Promise<void>;
}

export interface HeroOptions {
  entries(): Entry[];
  /** Whether this door's preview may be shown without asking. */
  chosen(entry: Entry): boolean;
  onPoint(entry: Entry | null): void;
  onOpen(entry: Entry): void;
  accent: string;
}

interface HeroDoor {
  entry: Entry;
  group: THREE.Group;
  view: THREE.Mesh;
  frame: THREE.Mesh;
  metal: Alloy;
  hover: number;
}

const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function mountHero(stage: HTMLElement, opts: HeroOptions): Hero | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
  } catch {
    return null; // no WebGL here: the page keeps its drawn grid
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  stage.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04070b);
  scene.fog = new THREE.Fog(0x04070b, 60, 300);
  const environment = createEnvironment(opts.accent);
  scene.add(environment.group);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 700);
  const rig = new THREE.Group();
  rig.add(camera);
  camera.position.set(0, 1.6, 0);
  scene.add(rig);

  const archMask = archMaskTexture();
  const doorGeo = new THREE.PlaneGeometry(DOOR_W, DOOR_H);
  const wall = new THREE.Group();
  scene.add(wall);
  let doors: HeroDoor[] = [];
  const RADIUS = 11;

  const attachPreview = async (door: HeroDoor) => {
    const decision = decidePreview(door.entry.world, { chosen: opts.chosen(door.entry), asked: false, doorOpen: false });
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
    dirty = true;
  };

  const build = () => {
    wall.traverse((o) => {
      const m = (o as THREE.Mesh).material as (THREE.Material & { map?: THREE.Texture | null }) | undefined;
      if (!m || Array.isArray(m)) return;
      if (m.map && m.map !== archMask) m.map.dispose();
      m.dispose();
    });
    wall.clear();
    const entries = opts.entries().slice(0, 8);
    const step = THREE.MathUtils.degToRad(11);
    doors = entries.map((entry, i) => {
      const theta = (i - (entries.length - 1) / 2) * step;
      const group = new THREE.Group();
      group.position.set(Math.sin(theta) * RADIUS, 0, -Math.cos(theta) * RADIUS);
      group.rotation.y = -theta;
      const view = new THREE.Mesh(doorGeo, new THREE.MeshBasicMaterial({ map: viewTexture(entry.id), transparent: true, alphaTest: 0.5 }));
      view.position.y = DOOR_H / 2;
      const { frame, metal } = doorFrame(opts.accent);
      group.add(view, frame);
      wall.add(group);
      return { entry, group, view, frame, metal, hover: 0 };
    });
    for (const d of doors) void attachPreview(d);
    dirty = true;
  };

  // The copy sits to the left on a wide screen, so the room is drawn to the
  // right of it; on a narrow one the copy is above and the room is centred.
  let dirty = true;
  const size = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep about five doors across whatever the shape of the stage.
    const across = THREE.MathUtils.degToRad(w > 900 ? 62 : 58);
    camera.fov = Math.min(80, Math.max(34, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(across / 2) / camera.aspect))));
    if (w > 900) camera.setViewOffset(w, h, -Math.round(w * 0.2), Math.round(h * 0.06), w, h);
    else camera.setViewOffset(w, h, 0, Math.round(h * 0.1), w, h);
    // Beside the copy, the row of doors is turned so it starts where the words end and runs off the edge.
    wall.rotation.y = w > 900 ? -THREE.MathUtils.degToRad(15) : 0;
    camera.updateProjectionMatrix();
    dirty = true;
  };
  new ResizeObserver(size).observe(stage);

  // ---------------------------------------------------------- pointing
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(2, 2);
  const look = new THREE.Vector2();
  let pointed: HeroDoor | null = null;
  const under = (): HeroDoor | null => {
    raycaster.setFromCamera(ndc, camera);
    for (const hit of raycaster.intersectObjects(doors.map((d) => d.view), false)) {
      const door = doors.find((d) => d.view === hit.object);
      if (!door || !hit.uv) continue;
      // A door is its arch, not the rectangle the arch is drawn on.
      const x = (hit.uv.x - 0.5) * DOOR_W;
      const y = hit.uv.y * DOOR_H;
      const spring = DOOR_H - DOOR_W / 2;
      if (y > spring && Math.hypot(x, y - spring) > DOOR_W / 2) continue;
      return door;
    }
    return null;
  };
  const place = (e: PointerEvent) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    look.set(ndc.x, ndc.y);
    dirty = true;
  };
  renderer.domElement.addEventListener("pointermove", place);
  renderer.domElement.addEventListener("pointerleave", () => {
    ndc.set(2, 2);
    look.set(0, 0);
    dirty = true;
  });
  renderer.domElement.addEventListener("click", (e) => {
    place(e);
    const door = under();
    if (door) opts.onOpen(door.entry);
  });

  // ------------------------------------------------------------ frames
  let visible = true;
  new IntersectionObserver((entries) => {
    visible = entries.some((x) => x.isIntersecting);
    dirty = true;
  }).observe(stage);
  const accent = new THREE.Color(opts.accent);
  const started = performance.now();
  let last = 0;
  let entering = 0; // 0 until Walk in is pressed, then seconds into the move
  let entered: (() => void) | null = null;
  const yaw = { now: 0, pitch: 0 };

  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) return;
    const moving = !still();
    if (!moving && !dirty && !entering) return; // nothing changed: leave the last frame up
    dirty = false;
    const t = (performance.now() - started) / 1000;
    const dt = Math.min(t - last, 0.1);
    last = t;

    const hit = under();
    if (hit !== pointed) {
      pointed = hit;
      renderer.domElement.style.cursor = hit ? "pointer" : "default";
      opts.onPoint(hit?.entry ?? null);
    }
    for (const d of doors) {
      d.hover += ((d === pointed ? 1 : 0) - d.hover) * (moving ? Math.min(1, dt * 12) : 1);
      d.metal.tick(t);
      d.metal.aim(d.hover);
      d.view.position.z = -0.12 * d.hover;
      if (d.hover > 0.01 && d.hover < 0.99) dirty = true;
    }

    // The view drifts a little, and leans towards the pointer.
    const drift = moving ? Math.sin(t / 9) * 0.07 : 0;
    yaw.now += (drift - look.x * 0.07 - yaw.now) * (moving ? Math.min(1, dt * 3) : 1);
    yaw.pitch += (look.y * 0.03 - yaw.pitch) * (moving ? Math.min(1, dt * 3) : 1);
    rig.rotation.y = yaw.now;
    camera.rotation.x = yaw.pitch;

    if (entering) {
      entering += dt;
      const k = Math.min(1, entering / 0.42);
      camera.position.z = -3.2 * k * k;
      renderer.domElement.style.opacity = String(1 - k * 0.6);
      if (k === 1 && entered) {
        entered();
        entered = null;
      }
    }
    environment.update(moving ? t : 0);
    renderer.render(scene, camera);
  });

  size();
  build();
  return {
    refresh: build,
    enter() {
      if (still()) return Promise.resolve();
      return new Promise((resolve) => {
        entering = 0.0001;
        entered = resolve;
        setTimeout(resolve, 700); // never strand the visitor if frames stop
      });
    },
  };
}
