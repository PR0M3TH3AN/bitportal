/**
 * The look editor (NSWP spec §4.2). The lists of parts come from the
 * protocol's own; this page shows them, draws the result, and keeps the
 * choice on this device. Nothing here contacts anything.
 */
import * as THREE from "three";
import { generatedLook, LOOK_COLORS, LOOK_PARTS, type LookPart } from "@nswp/core";
import { createEnvironment } from "nswp-sdk/home";
import { createFigure, type Figure } from "nswp-sdk/three";
import { forgetLook, loadLook, LOOK_TITLES, lookOf, lookWord, newSeed, storeLook, surprise, type KeptLook } from "../shared/look.js";

const $ = (id: string) => document.getElementById(id)!;

// What each list and choice is called: the same words as the room's menu uses (shared/look.ts).
const TITLES = LOOK_TITLES;
const word = lookWord;

// Until the visitor changes something, this is only a suggestion: nothing is kept.
let kept: KeptLook = loadLook() ?? { seed: newSeed(), choices: {} };
let saved = loadLook() !== null;

// ------------------------------------------------------------- the figure
const stage = $("look-stage");
let draw: () => void = () => {};
let turnTo = (_: number) => {};
try {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  stage.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04070b);
  const environment = createEnvironment(0x3df2a0, { skyline: false, dust: false, constellations: false });
  scene.add(environment.group);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 700);
  camera.position.set(0, 1.5, 2.45);
  camera.lookAt(0, 1.36, 0);
  const turntable = new THREE.Group();
  scene.add(turntable);
  let figure: Figure | null = null;
  let target = Math.PI; // facing the visitor
  let dragging = false;
  let lastX = 0;
  draw = () => {
    if (figure) {
      turntable.remove(figure.group);
      figure.dispose();
    }
    figure = createFigure(lookOf(kept));
    figure.group.position.y = 1.6;
    turntable.add(figure.group);
  };
  turnTo = (angle) => (target = angle);
  renderer.domElement.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    target += (e.clientX - lastX) * 0.012;
    lastX = e.clientX;
  });
  renderer.domElement.addEventListener("pointerup", () => (dragging = false));
  const fit = () => {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(fit).observe(stage);
  fit();
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const started = performance.now();
  renderer.setAnimationLoop(() => {
    if (document.hidden) return;
    const t = (performance.now() - started) / 1000;
    turntable.rotation.y += (target - turntable.rotation.y) * (still ? 1 : 0.14);
    environment.update(still ? 0 : t);
    figure?.tick(still ? 0 : t);
    renderer.render(scene, camera);
  });
  (window as unknown as { __bitportalTest?: unknown }).__bitportalTest = { state: { ready: true }, kept: () => kept, saved: () => saved };
} catch {
  // No WebGL: the choices still work, there is just no picture of them.
  stage.textContent = "This device can't draw the figure, but your choices are still kept.";
  stage.removeAttribute("aria-hidden");
}

// ------------------------------------------------------------- the choices
const form = $("look-form") as HTMLFormElement;
const state = $("look-state");

function tell(): void {
  state.textContent = saved
    ? "Kept on this device. You wear it in your room, and in a world when you go there as yourself."
    : "You have no look yet, so you go plain: a different figure every visit. Change anything here to keep one.";
  ($("look-forget") as HTMLButtonElement).disabled = !saved;
}

function keep(next: KeptLook): void {
  kept = next;
  saved = true;
  storeLook(kept);
  draw();
  fill();
  tell();
}

function fill(): void {
  const look = lookOf(kept);
  for (const c of LOOK_COLORS) (form.elements.namedItem(c) as HTMLInputElement).value = look[c];
  for (const part of Object.keys(LOOK_PARTS) as LookPart[]) {
    for (const input of form.querySelectorAll<HTMLInputElement>(`input[name="${part}"]`)) input.checked = input.value === look[part];
  }
}

const colours = document.createElement("fieldset");
colours.className = "look-set look-colours";
colours.append(Object.assign(document.createElement("legend"), { textContent: "Colours" }));
for (const c of LOOK_COLORS) {
  const label = document.createElement("label");
  const input = Object.assign(document.createElement("input"), { type: "color", name: c });
  input.addEventListener("input", () => keep({ seed: kept.seed, choices: { ...kept.choices, [c]: input.value.toLowerCase() } }));
  label.append(input, ` ${TITLES[c]}`);
  colours.append(label);
}
form.append(colours);
for (const part of Object.keys(LOOK_PARTS) as LookPart[]) {
  const set = document.createElement("fieldset");
  set.className = "look-set";
  set.append(Object.assign(document.createElement("legend"), { textContent: TITLES[part] }));
  const row = document.createElement("div");
  row.className = "look-options";
  for (const value of LOOK_PARTS[part]) {
    const label = document.createElement("label");
    const input = Object.assign(document.createElement("input"), { type: "radio", name: part, value });
    input.addEventListener("change", () => keep({ seed: kept.seed, choices: { ...kept.choices, [part]: value } }));
    label.append(input, Object.assign(document.createElement("span"), { textContent: word(value) }));
    row.append(label);
  }
  set.append(row);
  form.append(set);
}

$("look-surprise").addEventListener("click", () => keep(surprise(kept)));
let back = false;
$("look-turn").addEventListener("click", () => {
  back = !back;
  turnTo(back ? 0 : Math.PI);
  $("look-turn").textContent = back ? "See the front" : "See the back";
});
$("look-again").addEventListener("click", () => keep({ seed: newSeed(), choices: kept.choices }));
$("look-forget").addEventListener("click", () => {
  forgetLook();
  kept = { seed: newSeed(), choices: {} };
  saved = false;
  draw();
  fill();
  tell();
});

// A sanity check for anyone reading this: the page never invents a part the protocol doesn't list.
void generatedLook;
draw();
fill();
tell();
