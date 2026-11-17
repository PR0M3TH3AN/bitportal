/**
 * Door art, generated from a world's coordinate. No image is fetched, so a
 * world never learns that its door was shown (NSWP spec §5.7).
 */

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface DoorArt {
  /** CSS colours for the view through the door. */
  skyTop: string;
  skyLow: string;
  ground: string;
  glow: string;
  /** Where the light sits, as percentages of the view. */
  glowX: number;
  glowY: number;
}

export function doorArt(id: string): DoorArt {
  const h = hash(id);
  const hue = h % 360;
  const second = (hue + 40 + ((h >>> 9) % 80)) % 360;
  const night = ((h >>> 17) & 1) === 1;
  return {
    skyTop: `hsl(${hue} ${night ? 45 : 60}% ${night ? 16 : 62}%)`,
    skyLow: `hsl(${second} ${night ? 55 : 70}% ${night ? 34 : 82}%)`,
    ground: `hsl(${(second + 150) % 360} 28% ${night ? 12 : 30}%)`,
    glow: `hsl(${(second + 20) % 360} 95% ${night ? 78 : 96}%)`,
    glowX: 22 + ((h >>> 3) % 56),
    glowY: 16 + ((h >>> 12) % 30), // always above the horizon at 66%
  };
}
