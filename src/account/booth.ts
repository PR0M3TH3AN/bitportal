/**
 * The place a visitor signs in.
 *
 * Signing in is BitLogin, on this one page. A visitor comes to it from a
 * world or from the room, on foot or in the middle of a game, and a page of
 * text is no place to land from one. So this page is somewhere to stand: the
 * same ground and sky as the room, and the same crossing's room at both ends
 * of the trip. They step out of it when they arrive, sign in on the panel in
 * front of them, and it comes up round them again as they leave.
 *
 * The panel is still the page. A password is typed into the browser's own
 * page, under its own address, and nothing here draws over that or stands in
 * for it. A headset session can't show a page at all, so from a headset this
 * is seen on the headset's flat screen, as before.
 *
 * With no WebGL the page is the page it always was.
 */
import * as THREE from "three";
import { createEnvironment } from "nswp-sdk/home";
import { arriveWith, createCrossing, resumeFullscreen } from "nswp-sdk/three";
import { ARRIVED_SETTINGS } from "../shared/travel.js";

export interface Booth {
  /** Bring the crossing's room up, saying where they are going. Settles when it has shut, or at once if it can't be drawn. */
  leave(to: { title: string; address: string }): Promise<void>;
}

const ACCENT = 0x3df2a0;
const INK = "#e9f3f2";
/** The longest a visitor is ever kept waiting for the room to shut: a page that has stopped drawing still lets them go. */
const LEAVE_MOST = 3500;

export function createBooth(stage: HTMLElement, o: { arriving: boolean }): Booth | null {
  // What they had set where they came from: a screen that was filled is filled again at their first press here.
  try {
    const came = sessionStorage.getItem(ARRIVED_SETTINGS);
    sessionStorage.removeItem(ARRIVED_SETTINGS);
    if (came) arriveWith(JSON.parse(came));
    resumeFullscreen();
  } catch {
    /* nothing arrived with them */
  }
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  stage.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04070b);
  scene.fog = new THREE.Fog(0x04070b, 60, 300);
  const environment = createEnvironment(ACCENT);
  scene.add(environment.group);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 700);
  camera.position.set(0, 1.6, 0);
  scene.add(camera);
  const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const crossing = createCrossing({ scene, camera, accent: ACCENT, textColor: INK, motion: () => !still() });

  const fit = () => {
    camera.aspect = innerWidth / Math.max(innerHeight, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  };
  addEventListener("resize", fit);
  fit();

  // The page says where the crossing stands, so its panel is out of the way while the room is round them.
  const say = () => (document.body.dataset.crossing = crossing.state);
  document.body.classList.add("booth");
  camera.updateMatrixWorld(true);
  if (o.arriving) crossing.arrive({ title: "Who you are", address: location.host });
  say();

  const started = performance.now();
  let last = started;
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const t = (now - started) / 1000;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    // A slow look from side to side, so it is a place and not a picture. Still for anyone who asked for less motion.
    camera.rotation.y = still() ? 0 : Math.sin(t * 0.11) * 0.09;
    environment.update(still() ? 0 : t);
    crossing.update(t, dt);
    if (document.body.dataset.crossing !== crossing.state) say();
    renderer.render(scene, camera);
  });
  (window as unknown as { __bitportalTest?: Record<string, unknown> }).__bitportalTest = { ...((window as unknown as { __bitportalTest?: Record<string, unknown> }).__bitportalTest ?? {}), crossing: () => crossing.state };

  return {
    leave: (to) => Promise.race([crossing.leave(to), new Promise<void>((done) => setTimeout(done, LEAVE_MOST))]),
  };
}
