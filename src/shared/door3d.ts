/**
 * A door as it is drawn in 3D: the arch, the view through it, and its frame.
 * Shared by the room and by the live room on the landing page, so a door looks
 * the same in both.
 */
import * as THREE from "three";
import { doorArt } from "./door.js";

export const DOOR_W = 1.5;
export const DOOR_H = 2.1;

/** The arch outline, shared by the view and its frame. */
export function archPath(g: CanvasRenderingContext2D, w: number, h: number, inset: number): void {
  const ry = h * 0.36;
  g.beginPath();
  g.moveTo(inset, h);
  g.lineTo(inset, ry);
  g.ellipse(w / 2, ry, w / 2 - inset, ry - inset, 0, Math.PI, 0);
  g.lineTo(w - inset, h);
  g.closePath();
}

export function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
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
export function viewTexture(id: string): THREE.CanvasTexture {
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

/** The arch as a cut-out, for a preview window to be seen through. */
export function archMaskTexture(): THREE.CanvasTexture {
  return canvasTexture(500, 700, (g) => {
    archPath(g, 500, 700, 6);
    g.fillStyle = "#ffffff";
    g.fill();
  });
}

/** An ordinary picture (a web page's screenshot) fitted into the arch. */
export function flatViewTexture(image: HTMLImageElement): THREE.CanvasTexture {
  const W = 500;
  const H = 700;
  return canvasTexture(W, H, (g) => {
    archPath(g, W, H, 6);
    g.clip();
    g.fillStyle = "#0a0b0d";
    g.fillRect(0, 0, W, H);
    const scale = Math.max(W / image.naturalWidth, H / image.naturalHeight);
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    g.drawImage(image, (W - w) / 2, (H - h) / 2, w, h);
  });
}

export function frameTexture(): THREE.CanvasTexture {
  const W = 500;
  const H = 700;
  return canvasTexture(W, H, (g) => {
    archPath(g, W, H, 7);
    g.lineWidth = 12;
    g.strokeStyle = "#ffffff";
    g.stroke();
  });
}

