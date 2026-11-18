import {
  ICONS,
  rgb
} from "./shared-KPLONJID.js";

// ../Nostr-Spatial-Web-Protocol--NSWP-/packages/sdk/src/three.ts
import * as THREE7 from "three";
import { decodeLook as decodeLook2, spawnOffset } from "@nswp/core";

// ../Nostr-Spatial-Web-Protocol--NSWP-/packages/sdk/src/figure.ts
import * as THREE3 from "three";
import { generatedLook, markGrid } from "@nswp/core";

// ../Nostr-Spatial-Web-Protocol--NSWP-/packages/sdk/src/alloy.ts
import * as THREE from "three";
var SKY_GLSL = `
vec3 skyGlow(vec3 d, vec3 accent, vec3 ground){
  float h = clamp(d.y, -1.0, 1.0);
  float band = pow(1.0 - abs(h), 9.0);
  float line = pow(1.0 - abs(h), 60.0);
  vec3 up = mix(ground * 0.55, ground * 0.2, smoothstep(0.0, 0.7, h));
  vec3 base = h > 0.0 ? up : ground;
  return base + accent * (band * 0.4 + line * 0.9);
}`;
function createAlloy(accent, opts = {}) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uAccent: { value: new THREE.Color(accent) },
      uGround: { value: new THREE.Color(opts.ground ?? 263947) },
      uTime: { value: 0 },
      uAim: { value: 0 },
      uGloss: { value: opts.gloss ?? 0.5 },
      uSpeed: { value: opts.speed ?? 1 },
      uSheen: { value: opts.sheen ?? 0 },
      uReach: { value: opts.reach ?? 3 },
      uOpacity: { value: 1 }
    },
    vertexShader: `
      attribute vec3 tone; attribute float glow; attribute float flow;
      varying vec3 vWorld; varying vec3 vNormal; varying vec3 vTone; varying float vGlow; varying float vFlow;
      void main(){
        mat4 m = modelMatrix;
        #ifdef USE_INSTANCING
          m = modelMatrix * instanceMatrix;
        #endif
        vec4 w = m * vec4(position, 1.0);
        vWorld = w.xyz;
        vNormal = normalize(mat3(m) * normal);
        vTone = tone; vGlow = glow; vFlow = flow;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: `
      uniform vec3 uAccent; uniform vec3 uGround; uniform float uTime; uniform float uAim; uniform float uGloss; uniform float uSpeed; uniform float uSheen; uniform float uReach; uniform float uOpacity;
      varying vec3 vWorld; varying vec3 vNormal; varying vec3 vTone; varying float vGlow; varying float vFlow;
      ${SKY_GLSL}
      void main(){
        vec3 N = normalize(vNormal);
        vec3 V = normalize(cameraPosition - vWorld);
        float facing = max(dot(N, V), 0.0);
        // Form: a light from above and in front, and more from the sky than from the floor.
        float key = max(dot(N, normalize(vec3(0.35, 0.8, 0.5))), 0.0);
        float dome = 0.5 + 0.5 * N.y;
        vec3 c = vTone * (0.3 + 0.6 * dome + 0.75 * key);
        // The place reflected in it, strongest at a glancing angle, as on real metal.
        float fresnel = pow(1.0 - facing, 4.0);
        vec3 mirror = skyGlow(reflect(-V, N), uAccent, uGround);
        c += mirror * (0.1 + 0.75 * fresnel) * uGloss;
        // A rim of the place's light where the surface turns away.
        c += uAccent * pow(1.0 - facing, 3.0) * 0.16;
        // Colours that shift with the angle, for things meant to be looked at.
        if (uSheen > 0.0) {
          vec3 shift = 0.5 + 0.5 * cos(6.2831 * (facing * 1.2 + vec3(0.0, 0.33, 0.67)) + vWorld.y * 1.5);
          c = mix(c, c + shift * uAccent * 0.8 + shift * 0.1, uSheen * (0.3 + 0.7 * fresnel));
        }
        // Lights: the place's colour, with a brighter pulse travelling along them.
        if (vGlow > 0.001) {
          float run = fract(vFlow / uReach - uTime * 0.22 * uSpeed);
          float pulse = smoothstep(0.8, 1.0, run) + smoothstep(0.1, 0.0, run) * 0.6;
          vec3 light = mix(uAccent, vec3(1.0), 0.06 + 0.5 * pulse + 0.3 * uAim);
          c = mix(c, light * (0.8 + 0.6 * pulse + 0.5 * uAim), vGlow);
        }
        // Distance takes it into the ground's colour.
        float far = length(cameraPosition - vWorld);
        c = mix(c, uGround, smoothstep(55.0, 290.0, far) * (1.0 - vGlow * 0.5));
        gl_FragColor = vec4(c, uOpacity);
        #include <colorspace_fragment>
      }`
  });
  Object.defineProperty(material, "opacity", {
    get: () => material.uniforms.uOpacity.value,
    set: (value) => {
      if (material.uniforms?.uOpacity) material.uniforms.uOpacity.value = value;
    }
  });
  material.tick = (t) => {
    material.uniforms.uTime.value = t;
  };
  material.aim = (amount) => {
    material.uniforms.uAim.value = amount;
  };
  return material;
}

// ../Nostr-Spatial-Web-Protocol--NSWP-/packages/sdk/src/mesh.ts
import * as THREE2 from "three";
var va = new THREE2.Vector3();
var vb = new THREE2.Vector3();
var vc = new THREE2.Vector3();
var vd = new THREE2.Vector3();
var e1 = new THREE2.Vector3();
var e2 = new THREE2.Vector3();
var nn = new THREE2.Vector3();
var hint = new THREE2.Vector3();
var col = new THREE2.Color();
var MeshBuilder = class {
  positions = [];
  normals = [];
  tones = [];
  glows = [];
  flows = [];
  matrix = new THREE2.Matrix4();
  rotation = new THREE2.Matrix3();
  /** The colour faces take when they don't say. */
  tone = new THREE2.Color(791837);
  /** The colour of this piece's lights, for a material that reads plain vertex colours (see `geometry`). */
  light = new THREE2.Color(16777215);
  colors = [];
  get triangles() {
    return this.positions.length / 9;
  }
  /** Place and turn everything added from now on: a position, and degrees about the vertical. */
  at(position = [0, 0, 0], degrees = 0, scale = 1) {
    this.matrix.makeRotationY(THREE2.MathUtils.degToRad(degrees)).scale(vc.set(scale, scale, scale)).setPosition(position[0], position[1], position[2]);
    this.rotation.setFromMatrix4(this.matrix);
    return this;
  }
  /** Place everything added from now on by any matrix: for a piece that leans or lies on its side. */
  place(matrix) {
    this.matrix.copy(matrix);
    this.rotation.setFromMatrix4(this.matrix);
    return this;
  }
  /** A flat four-sided face. Pass `out`, roughly which way it faces, and the corners may be given in either order. */
  quad(a, b, c, d, paint = {}, out) {
    const f = paint.flow;
    const fl = Array.isArray(f) ? f : [f ?? 0, f ?? 0, f ?? 0, f ?? 0];
    va.set(...a);
    vb.set(...b);
    vc.set(...c);
    vd.set(...d);
    nn.crossVectors(e1.subVectors(vb, va), e2.subVectors(vd, va));
    if (nn.lengthSq() < 1e-12) nn.crossVectors(e1.subVectors(vc, vb), e2.subVectors(vd, vb));
    let order = [va, vb, vc, va, vc, vd];
    let fo = [fl[0], fl[1], fl[2], fl[0], fl[2], fl[3]];
    if (out && nn.dot(hint.set(...out)) < 0) {
      nn.negate();
      order = [va, vd, vc, va, vc, vb];
      fo = [fl[0], fl[3], fl[2], fl[0], fl[2], fl[1]];
    }
    nn.applyMatrix3(this.rotation).normalize();
    col.set(paint.color ?? this.tone).multiplyScalar(paint.shade ?? 1);
    for (let i = 0; i < 6; i++) {
      const v = e1.copy(order[i]).applyMatrix4(this.matrix);
      this.positions.push(v.x, v.y, v.z);
      this.normals.push(nn.x, nn.y, nn.z);
      this.tones.push(col.r, col.g, col.b);
      this.glows.push(paint.glow ?? 0);
      const g = paint.glow ?? 0;
      this.colors.push(col.r + (this.light.r - col.r) * g, col.g + (this.light.g - col.g) * g, col.b + (this.light.b - col.b) * g);
      this.flows.push(fo[i]);
    }
  }
  tri(a, b, c, paint = {}, out) {
    this.quad(a, b, c, c, paint, out);
  }
  /** A face with a panel pressed into it. Corners in order round the face; `out` is which way it faces. */
  panel(corners, out, o, paint = {}) {
    const [a, b, c, d] = corners.map((p) => new THREE2.Vector3(...p));
    const n = new THREE2.Vector3(...out).normalize();
    const mid = new THREE2.Vector3().add(a).add(b).add(c).add(d).multiplyScalar(0.25);
    const inner = [a, b, c, d].map((p, i, all2) => {
      const next = all2[(i + 1) % 4];
      const prev = all2[(i + 3) % 4];
      return p.clone().add(next.clone().sub(p).setLength(o.margin)).add(prev.clone().sub(p).setLength(o.margin));
    });
    const deep = inner.map((p) => p.clone().addScaledVector(n, -o.depth));
    const arr = (v) => [v.x, v.y, v.z];
    const all = [a, b, c, d];
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      this.quad(arr(all[i]), arr(all[j]), arr(inner[j]), arr(inner[i]), paint, out);
      const wallMid = inner[i].clone().add(inner[j]).multiplyScalar(0.5);
      const inward = mid.clone().sub(wallMid);
      this.quad(arr(inner[i]), arr(inner[j]), arr(deep[j]), arr(deep[i]), { ...paint, glow: o.glow ?? 0, shade: (paint.shade ?? 1) * (o.glow ? 1 : 0.6) }, arr(inward));
    }
    this.quad(arr(deep[0]), arr(deep[1]), arr(deep[2]), arr(deep[3]), { ...paint, shade: (paint.shade ?? 1) * 0.55 }, out);
  }
  /** A box with its edges bevelled, and panels pressed into the faces named: "x+ x- y+ y- z+ z-", or "sides". */
  box(size, at, o = {}) {
    const [hx, hy, hz] = [size[0] / 2, size[1] / 2, size[2] / 2];
    const b = Math.min(o.bevel ?? 0, hx * 0.9, hy * 0.9, hz * 0.9);
    const h = [hx, hy, hz];
    const want = (o.panel?.faces ?? "sides").replace("sides", "x+ x- z+ z-").split(/\s+/);
    const point = (axis, s) => {
      const p = [0, 0, 0];
      for (let k = 0; k < 3; k++) p[k] = at[k] + s[k] * (k === axis ? h[k] : h[k] - b);
      return p;
    };
    const signs = [-1, 1];
    for (let axis = 0; axis < 3; axis++) {
      const [u, v] = [(axis + 1) % 3, (axis + 2) % 3];
      for (const s of signs) {
        const corner = (su, sv) => {
          const q = [0, 0, 0];
          q[axis] = s;
          q[u] = su;
          q[v] = sv;
          return point(axis, q);
        };
        const out = [0, 0, 0];
        out[axis] = s;
        const face = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
        const name = `${"xyz"[axis]}${s > 0 ? "+" : "-"}`;
        if (o.panel && want.includes(name) && Math.min(h[u], h[v]) - b > o.panel.margin * 1.2) this.panel(face, out, o.panel, o);
        else this.quad(...face, o, out);
      }
    }
    if (b <= 0) return;
    for (let axis = 0; axis < 3; axis++) {
      const [u, v] = [(axis + 1) % 3, (axis + 2) % 3];
      for (const su of signs)
        for (const sv of signs) {
          const s = (along) => {
            const q = [0, 0, 0];
            q[axis] = along;
            q[u] = su;
            q[v] = sv;
            return q;
          };
          const out = [0, 0, 0];
          out[u] = su;
          out[v] = sv;
          this.quad(point(u, s(-1)), point(u, s(1)), point(v, s(1)), point(v, s(-1)), { ...o, shade: (o.shade ?? 1) * 1.25 }, out);
        }
    }
    for (const sx of signs) for (const sy of signs) for (const sz of signs) this.tri(point(0, [sx, sy, sz]), point(1, [sx, sy, sz]), point(2, [sx, sy, sz]), { ...o, shade: (o.shade ?? 1) * 1.25 }, [sx, sy, sz]);
  }
  /**
   * Sweep a profile along a path. The profile is a closed outline drawn
   * anticlockwise in each frame's own x and y; `paint(i)` colours the side that
   * runs from point i to the next. Open ends are capped.
   */
  sweep(profile, frames, paint = () => ({}), o = {}) {
    const at = (k, i) => {
      const f = frames[k];
      const [u, v] = profile[i % profile.length];
      return [f.p[0] + f.x[0] * u + f.y[0] * v, f.p[1] + f.x[1] * u + f.y[1] * v, f.p[2] + f.x[2] * u + f.y[2] * v];
    };
    const last = o.loop ? frames.length : frames.length - 1;
    for (let k = 0; k < last; k++) {
      const k2 = (k + 1) % frames.length;
      const [t1, t2] = [frames[k].t ?? k, frames[k2].t ?? k + 1];
      for (let i = 0; i < profile.length; i++) {
        const p = paint(i);
        this.quad(at(k, i), at(k, i + 1), at(k2, i + 1), at(k2, i), { ...p, flow: p.flow ?? [t1, t1, t2, t2] });
      }
    }
    if (o.loop || o.caps === false) return;
    for (const [k, dir] of [[0, -1], [frames.length - 1, 1]]) {
      const f = frames[k];
      const tangent = new THREE2.Vector3(...f.x).cross(new THREE2.Vector3(...f.y)).multiplyScalar(dir);
      for (let i = 1; i < profile.length - 1; i++) this.tri(at(k, 0), at(k, i), at(k, i + 1), paint(-1), [tangent.x, tangent.y, tangent.z]);
    }
  }
  /**
   * Turn a profile on a lathe about the vertical through `at`. The profile is
   * [radius, height] pairs from the bottom up. `sides` is how many faces round:
   * 4 makes a square column, 6 a hexagon, 24 a round one. `twist` turns it as it rises.
   * `paint(row, side)` colours each face: `row` counts up the profile, `side` round it.
   */
  lathe(profile, at, sides, paint = () => ({}), o = {}) {
    const top = profile[profile.length - 1][1];
    const ring = (row, s) => {
      const [r, y] = profile[row];
      const a = s / sides * Math.PI * 2 + (o.turn ?? 0) + (o.twist ?? 0) * (top ? y / top : 0);
      return [at[0] + Math.cos(a) * r, at[1] + y, at[2] + Math.sin(a) * r];
    };
    for (let row = 0; row < profile.length - 1; row++) {
      const [r1, y1] = profile[row];
      const [r2, y2] = profile[row + 1];
      for (let s = 0; s < sides; s++) {
        const a = (s + 0.5) / sides * Math.PI * 2 + (o.turn ?? 0);
        const out = [Math.cos(a) * (y2 - y1), -(r2 - r1), Math.sin(a) * (y2 - y1)];
        if (Math.abs(out[0]) + Math.abs(out[1]) + Math.abs(out[2]) < 1e-9) continue;
        const p = paint(row, s);
        this.quad(ring(row, s), ring(row, s + 1), ring(row + 1, s + 1), ring(row + 1, s), { ...p, flow: p.flow ?? [y1, y1, y2, y2] }, out);
      }
    }
  }
  /** A thin lit line lying just proud of a surface: from a to b, `width` wide, on a face that points `out`. */
  line(a, b, width, out, paint = {}) {
    const n = new THREE2.Vector3(...out).normalize();
    const along = new THREE2.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const side = along.clone().cross(n).setLength(width / 2);
    const lift = n.clone().multiplyScalar(4e-3);
    const A = new THREE2.Vector3(...a).add(lift);
    const B = new THREE2.Vector3(...b).add(lift);
    const len = along.length();
    this.quad(
      [A.x - side.x, A.y - side.y, A.z - side.z],
      [B.x - side.x, B.y - side.y, B.z - side.z],
      [B.x + side.x, B.y + side.y, B.z + side.z],
      [A.x + side.x, A.y + side.y, A.z + side.z],
      { glow: 1, ...paint, flow: paint.flow ?? [0, len, len, 0] },
      out
    );
  }
  /** Everything added, as one geometry. */
  geometry() {
    const g = new THREE2.BufferGeometry();
    g.setAttribute("position", new THREE2.Float32BufferAttribute(this.positions, 3));
    g.setAttribute("normal", new THREE2.Float32BufferAttribute(this.normals, 3));
    g.setAttribute("tone", new THREE2.Float32BufferAttribute(this.tones, 3));
    g.setAttribute("glow", new THREE2.Float32BufferAttribute(this.glows, 1));
    g.setAttribute("flow", new THREE2.Float32BufferAttribute(this.flows, 1));
    g.setAttribute("color", new THREE2.Float32BufferAttribute(this.colors, 3));
    g.computeBoundingSphere();
    return g;
  }
  /** Everything added, as one mesh in this material (see alloy.ts). */
  build(material) {
    return new THREE2.Mesh(this.geometry(), material);
  }
};

// ../Nostr-Spatial-Web-Protocol--NSWP-/packages/sdk/src/figure.ts
var DARK = new THREE3.Color(659221);
var DEPTH = 0.4;
function nearest(color, palette) {
  let best = palette[0];
  let far = Infinity;
  for (const p of palette) {
    const d = (p.r - color.r) ** 2 + (p.g - color.g) ** 2 + (p.b - color.b) ** 2;
    if (d < far) [best, far] = [p, d];
  }
  return best.clone();
}
function buildHead(b, look, main, accent, omit) {
  let fit2;
  const shade = (row) => ({ color: main, shade: 0.85 + row * 0.1 });
  switch (look.head) {
    case "square":
      b.box([0.24, 0.24, 0.24], [0, 0, 0], { color: main, bevel: 0.03, panel: { margin: 0.045, depth: 0.012, faces: "x+ x- z+ y+" } });
      fit2 = { front: 0.12, top: 0.12, half: 0.085 };
      break;
    case "tall":
      b.lathe([[5e-4, -0.14], [0.09, -0.13], [0.115, -0.02], [0.105, 0.14], [0.06, 0.2], [5e-4, 0.21]], [0, 0, 0], 6, shade);
      fit2 = { front: 0.098, top: 0.21, half: 0.058 };
      break;
    case "wedge":
      b.lathe([[5e-4, -0.12], [0.17, -0.1], [0.18, 0.09], [5e-4, 0.12]], [0, 0, 0], 3, shade, { turn: Math.PI / 2 });
      fit2 = { front: 0.088, top: 0.12, half: 0.11 };
      break;
    case "flat":
      b.lathe([[5e-4, -0.085], [0.15, -0.06], [0.165, 0.03], [0.09, 0.085], [5e-4, 0.09]], [0, 0, 0], 10, shade);
      fit2 = { front: 0.152, top: 0.09, half: 0.09 };
      break;
    case "faceted":
      b.lathe([[5e-4, -0.15], [0.1, -0.07], [0.14, 0.03], [0.08, 0.13], [5e-4, 0.165]], [0, 0, 0], 5, (row) => ({ color: main, shade: 0.8 + row * 0.16 }), { turn: Math.PI / 10 });
      fit2 = { front: 0.108, top: 0.165, half: 0.064 };
      break;
    default:
      b.lathe([[5e-4, -0.135], [0.07, -0.125], [0.118, -0.05], [0.13, 0.02], [0.112, 0.085], [0.06, 0.128], [5e-4, 0.14]], [0, 0, 0], 8, shade, { turn: Math.PI / 8 });
      fit2 = { front: 0.122, top: 0.14, half: 0.075 };
  }
  b.lathe([[0.06, -0.135], [0.075, -0.125]], [0, 0, 0], 8, () => ({ glow: 0.8 }), { turn: Math.PI / 8 });
  const { front, half } = fit2;
  const tallFace = look.face === "tee" || look.face === "wide";
  b.box([half * 2 + 0.03, tallFace ? 0.13 : 0.085, 0.03], [0, tallFace ? 0 : 0.02, -(front - 6e-3)], { color: DARK, bevel: 8e-3 });
  const z = -(front + 95e-4);
  const lit = (w, h, x, y) => b.quad([x - w / 2, y - h / 2, z], [x + w / 2, y - h / 2, z], [x + w / 2, y + h / 2, z], [x - w / 2, y + h / 2, z], { glow: 1 }, [0, 0, -1]);
  switch (look.face) {
    case "split":
      lit(half * 0.72, 0.04, -half * 0.52, 0.02);
      lit(half * 0.72, 0.04, half * 0.52, 0.02);
      break;
    case "dots":
      lit(0.036, 0.036, -half * 0.5, 0.02);
      lit(0.036, 0.036, half * 0.5, 0.02);
      break;
    case "tee":
      lit(half * 1.9, 0.03, 0, 0.035);
      lit(0.03, 0.075, 0, -0.018);
      break;
    case "slit":
      lit(half * 2, 0.014, 0, 0.02);
      break;
    case "wide":
      lit(half * 1.8, 0.085, 0, 0);
      break;
    default:
      lit(half * 1.9, 0.04, 0, 0.02);
  }
  if (omit.has("accessory")) return;
  const t = fit2.top;
  switch (look.accessory) {
    case "antenna":
      b.lathe([[0.012, t - 0.03], [6e-3, t + 0.2]], [fit2.half * 0.8, 0, 0.02], 4, () => ({ color: accent }));
      b.box([0.024, 0.024, 0.024], [fit2.half * 0.8, t + 0.21, 0.02], { glow: 1 });
      break;
    case "halo":
      b.lathe([[0.13, t + 0.08], [0.165, t + 0.08], [0.165, t + 0.098], [0.13, t + 0.098], [0.13, t + 0.08]], [0, 0, 0], 12, () => ({ glow: 1 }));
      break;
    case "hat":
      b.lathe([[0.09, t - 0.012], [0.21, t - 0.012], [0.21, t + 4e-3], [0.1, t + 0.01], [0.1, t + 0.035], [0.09, t + 0.035], [0.085, t + 0.12], [5e-4, t + 0.125]], [0, 0, 0], 10, (row) => row === 4 ? { glow: 0.8 } : { color: accent, shade: row === 2 ? 1.2 : 0.95 });
      break;
    case "crest":
      b.box([0.022, 0.09, 0.22], [0, t + 0.02, 0.01], { color: accent, bevel: 6e-3 });
      b.box([0.012, 0.01, 0.2], [0, t + 0.068, 0.01], { glow: 1 });
      break;
    case "fins":
      for (const side of [-1, 1]) {
        b.box([0.016, 0.13, 0.1], [side * (fit2.half + 0.068), 0.035, 0.02], { color: accent, bevel: 5e-3 });
        b.box([8e-3, 0.11, 0.012], [side * (fit2.half + 0.078), 0.035, 0.066], { glow: 1 });
      }
      break;
  }
}
function buildBody(b, look, main, accent, omit) {
  const k = look.build === "slight" ? 0.86 : look.build === "broad" ? 1.2 : 1;
  const cloth = (row, rows, side, sides, turn = 0) => {
    const a = (side + 0.5) / sides * Math.PI * 2 + turn;
    switch (look.pattern) {
      case "halves":
        return Math.cos(a) > 0 ? accent : main;
      case "stripe":
        return Math.abs(Math.cos(a)) < 0.35 ? accent : main;
      case "bands":
        return row % 2 === 1 ? accent : main;
      case "yoke":
        return row >= rows - 3 ? accent : main;
      default:
        return main;
    }
  };
  const turned = (profile, sides, band, turn = 0) => b.lathe(profile, [0, 0, 0], sides, (row, side) => row === 0 ? { glow: 0.4 } : row === band ? { glow: 0.75 } : { color: cloth(row, profile.length - 1, side, sides, turn), shade: 0.9 + row % 2 * 0.18 }, { turn });
  let chest;
  switch (look.body) {
    case "coat":
      turned([[0.03, -0.24], [0.165 * k, -0.25], [0.18 * k, 0.1], [0.205 * k, 0.17], [0.205 * k, 0.195], [0.1, 0.25], [5e-4, 0.25]], 4, 3, Math.PI / 4);
      chest = 0.125 * k;
      break;
    case "plate":
      b.lathe([[0.03, -0.2], [0.11 * k, -0.25], [0.08 * k, -0.02]], [0, 0, 0], 8, (row) => row === 0 ? { glow: 0.4 } : { color: main, shade: 0.9 }, { turn: Math.PI / 8 });
      b.box([0.31 * k, 0.26, 0.18], [0, 0.11, 0], { color: look.pattern === "plain" ? main : accent, bevel: 0.035, panel: { margin: 0.05, depth: 0.014, faces: "z+ x+ x-" } });
      b.box([0.33 * k, 0.012, 0.2], [0, -0.022, 0], { glow: 0.75 });
      chest = 0.09;
      break;
    case "robe":
      turned([[0.03, -0.4], [0.2 * k, -0.45], [0.16 * k, -0.2], [0.115 * k, 0.1], [0.135 * k, 0.17], [0.135 * k, 0.195], [0.07, 0.25], [5e-4, 0.25]], 10, 4);
      chest = 0.112 * k;
      break;
    default:
      turned([[0.03, -0.2], [0.17 * k, -0.25], [0.12 * k, 0.12], [0.145 * k, 0.165], [0.145 * k, 0.19], [0.08, 0.25], [5e-4, 0.25]], 6, 3);
      chest = 0.108 * k;
  }
  if (!omit.has("shoulders")) {
    switch (look.shoulders) {
      case "pads":
        for (const side of [-1, 1]) {
          b.box([0.12, 0.06, 0.15], [side * (0.17 * k + 0.03), 0.2, 0], { color: accent, bevel: 0.02 });
          b.box([8e-3, 0.02, 0.13], [side * (0.17 * k + 0.092), 0.2, 0], { glow: 1 });
        }
        break;
      case "mantle":
        b.lathe([[0.09, 0.2], [0.24 * k, 0.165], [0.25 * k, 0.19], [0.1, 0.262]], [0, 0, 0], 8, (row) => row === 1 ? { glow: 0.7 } : { color: accent, shade: row === 2 ? 1.15 : 0.8 }, { turn: Math.PI / 8 });
        break;
      case "collar":
        b.lathe([[0.1, 0.22], [0.15, 0.31], [0.135, 0.318], [0.09, 0.24]], [0, 0, 0], 8, (row) => row === 1 ? { glow: 0.9 } : { color: accent, shade: row === 0 ? 1.1 : 0.7 }, { turn: Math.PI / 8 });
        break;
    }
  }
  if (omit.has("mark")) return;
  const plate = (x, y, z, cell, facing) => {
    const pitch = cell * 1.14;
    const wide = pitch * 5 + cell * 0.7;
    b.box([wide, wide, 0.02], [x, y, z - facing * 8e-3], { color: DARK, bevel: 6e-3 });
    markGrid(look.mark).forEach(
      (row, r) => row.forEach((on, c) => {
        if (!on) return;
        const [cx, cy, cz] = [x + (c - 2) * pitch, y + (2 - r) * pitch, z + facing * 25e-4];
        b.quad([cx - cell / 2, cy - cell / 2, cz], [cx + cell / 2, cy - cell / 2, cz], [cx + cell / 2, cy + cell / 2, cz], [cx - cell / 2, cy + cell / 2, cz], { glow: 1 }, [0, 0, facing]);
      })
    );
  };
  plate(0, 0.04, chest + 0.012, 0.026, 1);
  plate(-chest * 0.42, 0.105, -(chest + 4e-3), 95e-4, -1);
}
function createFigure(look, style = {}) {
  const wearing = typeof look === "string" ? generatedLook(look) : look;
  const omit = new Set(style.omit ?? []);
  let [main, accent, light] = [new THREE3.Color(wearing.color), new THREE3.Color(wearing.accent), new THREE3.Color(wearing.light)];
  if (style.palette?.length) {
    const palette = style.palette.map((c) => new THREE3.Color(c));
    [main, accent, light] = [nearest(main, palette), nearest(accent, palette), nearest(light, palette)];
  }
  const depth = style.material ? 1 : DEPTH;
  const [cloth, trim] = [main.clone().multiplyScalar(depth), accent.clone().multiplyScalar(depth)];
  const builder = () => {
    const b = new MeshBuilder().at();
    b.tone = cloth.clone();
    b.light = light.clone();
    return b;
  };
  const headShape = builder();
  buildHead(headShape, wearing, cloth, trim, omit);
  const bodyShape = builder();
  buildBody(bodyShape, wearing, cloth, trim, omit);
  const handShape = builder();
  handShape.lathe([[5e-4, -0.06], [0.04, 0], [5e-4, 0.06]], [0, 0, 0], 4, () => ({ glow: 0.75 }));
  const metal = style.material ? style.material(light, wearing) : createAlloy(light, { gloss: wearing.finish === "matte" ? 0.25 : wearing.finish === "gloss" ? 0.85 : 0.7, sheen: wearing.finish === "sheen" ? 0.45 : 0 });
  const geometries = [headShape.geometry(), bodyShape.geometry(), handShape.geometry()];
  const head = new THREE3.Group();
  head.add(new THREE3.Mesh(geometries[0], metal));
  const torso = new THREE3.Mesh(geometries[1], metal);
  torso.position.y = -0.45;
  const hands = [new THREE3.Mesh(geometries[2], metal), new THREE3.Mesh(geometries[2], metal)];
  hands[0].position.set(-0.28, -0.5, -0.12);
  hands[1].position.set(0.28, -0.5, -0.12);
  const group = new THREE3.Group();
  group.add(head, torso, ...hands);
  return {
    group,
    head,
    torso,
    hands,
    metal,
    look: wearing,
    tick(t) {
      metal.tick?.(t);
    },
    dispose() {
      for (const g of geometries) g.dispose();
      metal.dispose();
    }
  };
}

// ../Nostr-Spatial-Web-Protocol--NSWP-/node_modules/@noble/hashes/_u64.js
var fromNumH = (n) => n / 2 ** 32 | 0;
var fromNumL = (n) => n >>> 0;
function setU64FromNum(view, byteOffset, n, isLE) {
  const h = fromNumH(n);
  const l = fromNumL(n);
  view.setUint32(byteOffset, isLE ? l : h, isLE);
  view.setUint32(byteOffset + 4, isLE ? h : l, isLE);
}

// ../Nostr-Spatial-Web-Protocol--NSWP-/node_modules/@noble/hashes/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
var atitle = (title) => title ? `"${title}" ` : "";
function anumber(n, title = "") {
  if (typeof n !== "number")
    throw new TypeError(atitle(title) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError(atitle(title) + "expected integer >= 0, got " + n);
  return n;
}
function abytes(value, length, title = "") {
  if (isBytes(value) && (length === void 0 || value.length === length))
    return value;
  if (length !== void 0)
    anumber(length, "length");
  const bytes = isBytes(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message);
  throw new RangeError(message);
}
var aobject = (value, label) => {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError((label === "object" ? "" : `"${label}" `) + "expected object, got type=" + typeof value);
};
var aopts = (value, label) => {
  aobject(value, label);
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null)
    throw new TypeError(`"${label}" expected plain object`);
  if (Object.hasOwn(value, "__proto__"))
    throw new TypeError(`"${label}.__proto__" is not allowed`);
};
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("hash was destroyed");
  if (checkFinished && instance.finished)
    throw new Error("digest() was already called");
}
function aoutput(out, instance) {
  abytes(out, void 0, "output");
  const min = instance.outputLen;
  if (!(out.length >= min)) {
    throw new RangeError('"output" expected length >= ' + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
var hasHexBuiltin = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex(bytes) {
  abytes(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
function asciiToBase16(ch) {
  return ch >= 48 && ch <= 57 ? ch - 48 : ch >= 65 && ch <= 70 ? ch - (65 - 10) : ch >= 97 && ch <= 102 ? ch - (97 - 10) : void 0;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new TypeError("hex string expected, got " + typeof hex);
  if (hasHexBuiltin) {
    try {
      return Uint8Array.fromHex(hex);
    } catch (error) {
      if (error instanceof SyntaxError)
        throw new RangeError(error.message);
      throw error;
    }
  }
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new RangeError("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new RangeError('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function checkOpts(defaults, opts, title = "opts") {
  aopts(defaults, "defaults");
  if (opts !== void 0)
    aopts(opts, title);
  const merged = Object.assign(/* @__PURE__ */ Object.create(null), defaults, opts);
  return merged;
}
function createHasher(hashCons, info = {}) {
  if (typeof hashCons !== "function")
    throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
  info = checkOpts({}, info, "info");
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes(bytesLength = 32) {
  anumber(bytesLength, "bytesLength");
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof cr?.getRandomValues !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  if (bytesLength > 65536)
    throw new RangeError(`"bytesLength" expected <= 65536, got ${bytesLength}`);
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
var oidNist = (suffix) => ({
  // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
  // Larger suffix values would need base-128 OID encoding and a different length byte.
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// ../Nostr-Spatial-Web-Protocol--NSWP-/node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class {
  blockLen;
  outputLen;
  canXOF = false;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = false;
  length = 0;
  pos = 0;
  destroyed = false;
  constructor(blockLen, outputLen, padOffset, isLE) {
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    let processed = false;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        processed = true;
        continue;
      }
      buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
        processed = true;
      }
    }
    this.length += data.length;
    if (processed)
      this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    buffer.fill(0, pos);
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      buffer.fill(0);
    }
    setU64FromNum(view, blockLen - 8, this.length * 8, isLE);
    this.process(view, 0);
    this.roundClean();
    const oview = out === buffer ? view : createView(out);
    const len = this.outputLen;
    const outLen = len / 4;
    const state = this.get();
    if (len % 4 || outLen > state.length)
      throw new Error("invalid outputLen");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneIntoMeta(to) {
    const { buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (pos)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// ../Nostr-Spatial-Web-Protocol--NSWP-/node_modules/@noble/hashes/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA2_32B = class extends HashMD {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  // Numeric initializers matter: starting the fields as `undefined` changes
  // V8's field representation and makes sha256 3x slower (measured).
  A = 0;
  B = 0;
  C = 0;
  D = 0;
  E = 0;
  F = 0;
  G = 0;
  H = 0;
  constructor(outputLen, IV) {
    super(64, outputLen, 8, false);
    this.A = IV[0] | 0;
    this.B = IV[1] | 0;
    this.C = IV[2] | 0;
    this.D = IV[3] | 0;
    this.E = IV[4] | 0;
    this.F = IV[5] | 0;
    this.G = IV[6] | 0;
    this.H = IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H: H2 } = this;
    return [A, B, C, D, E, F, G, H2];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H2) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H2 | 0;
  }
  _cloneInto(to) {
    (to ||= new this.constructor()).set(...this.get());
    return this._cloneIntoMeta(to);
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H: H2 } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H2 + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H2 = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H2 = H2 + this.H | 0;
    this.set(A, B, C, D, E, F, G, H2);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.destroyed = true;
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var _SHA256 = class extends SHA2_32B {
  constructor() {
    super(32, SHA256_IV);
  }
};
var sha256 = /* @__PURE__ */ createHasher(
  () => new _SHA256(),
  /* @__PURE__ */ oidNist(1)
);

// ../Nostr-Spatial-Web-Protocol--NSWP-/node_modules/@noble/curves/utils.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function aarray(item, title, inner = () => {
}) {
  if (!Array.isArray(item))
    throw new TypeError(`"${title}" expected array, got type=${typeof item}`);
  for (let i = 0; i < item.length; i++)
    inner(item[i], `${title}[${i}]`);
  return item;
}
var abytes2 = (value, length, title) => abytes(value, length, title);
var anumber2 = anumber;
function aobject2(value, title = "object") {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(title === "object" ? "expected valid options object" : `"${title}" expected object, got type=${typeof value}`);
  return value;
}
function afunction(value, title) {
  if (typeof value !== "function")
    throw new TypeError(`"${title}" is invalid: expected function, got ${typeof value}`);
  return value;
}
var bytesToHex2 = bytesToHex;
var concatBytes2 = (...arrays) => concatBytes(...arrays);
var hexToBytes2 = (hex) => hexToBytes(hex);
var isBytes2 = isBytes;
var randomBytes2 = (bytesLength) => randomBytes(bytesLength);
var _0n = /* @__PURE__ */ BigInt(0);
var _1n = /* @__PURE__ */ BigInt(1);
var atitle2 = (title) => title ? `"${title}" ` : "";
function abool(value, title = "") {
  if (typeof value !== "boolean")
    throw new TypeError(atitle2(title) + "expected boolean, got type=" + typeof value);
  return value;
}
function abignumber(n) {
  if (typeof n === "bigint") {
    if (!isPosBig(n))
      throw new RangeError("positive bigint expected, got " + n);
  } else
    anumber2(n);
  return n;
}
function asafenumber(value, title = "") {
  if (typeof value !== "number") {
    const prefix = title && `"${title}" `;
    throw new TypeError(prefix + "expected number, got type=" + typeof value);
  }
  if (!Number.isSafeInteger(value)) {
    const prefix = title && `"${title}" `;
    throw new RangeError(prefix + "expected safe integer, got " + value);
  }
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new TypeError("hex string expected, got " + typeof hex);
  return hex === "" ? _0n : BigInt("0x" + hex);
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
  return hexToNumber(bytesToHex(copyBytes(abytes(bytes)).reverse()));
}
function numberToBytesBE(n, len) {
  anumber(len);
  if (len === 0)
    throw new Error("zero output length is invalid");
  n = abignumber(n);
  const expectedLen = len * 2;
  const hex = n.toString(16);
  if (hex.length > expectedLen)
    throw new RangeError("number is too large");
  return hexToBytes(hex.padStart(expectedLen, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function copyBytes(bytes) {
  return Uint8Array.from(abytes2(bytes));
}
function asciiToBytes(ascii) {
  if (typeof ascii !== "string")
    throw new TypeError("ascii string expected, got " + typeof ascii);
  return Uint8Array.from(ascii, (c, i) => {
    const charCode = c.charCodeAt(0);
    if (c.length !== 1 || charCode > 127) {
      throw new RangeError(`string contains non-ASCII character "${ascii[i]}" with code ${charCode} at position ${i}`);
    }
    return charCode;
  });
}
function isPosBig(n) {
  return typeof n === "bigint" && _0n <= n;
}
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new RangeError("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  if (n < _0n)
    throw new Error("expected non-negative bigint, got " + n);
  return n === _0n ? 0 : n.toString(2).length;
}
var bitMask = (n) => {
  asafenumber(n, "n");
  return (_1n << BigInt(n)) - _1n;
};
function validateObject(object, fields = {}, optFields = {}, title = "object") {
  aobject2(object, title);
  aobject2(fields, "fields");
  aobject2(optFields, "optFields");
  function checkField(fieldName, expectedType, isOpt) {
    const label = title === "object" ? `param "${String(fieldName)}"` : `"${title}.${String(fieldName)}"`;
    const val = object[fieldName];
    if (!Object.hasOwn(object, fieldName) && (isOpt ? val !== void 0 : expectedType !== "function")) {
      throw new TypeError(`${label} is invalid: expected own property`);
    }
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new TypeError(`${label} is invalid: expected ${expectedType}, got ${current}`);
  }
  const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
  iter(fields, false);
  iter(optFields, true);
}

// ../Nostr-Spatial-Web-Protocol--NSWP-/node_modules/@noble/curves/abstract/modular.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n2 = /* @__PURE__ */ BigInt(0);
var _1n2 = /* @__PURE__ */ BigInt(1);
var _2n = /* @__PURE__ */ BigInt(2);
var _3n = /* @__PURE__ */ BigInt(3);
var _4n = /* @__PURE__ */ BigInt(4);
var _5n = /* @__PURE__ */ BigInt(5);
var _7n = /* @__PURE__ */ BigInt(7);
var _8n = /* @__PURE__ */ BigInt(8);
var _9n = /* @__PURE__ */ BigInt(9);
var _15n = /* @__PURE__ */ BigInt(15);
var _16n = /* @__PURE__ */ BigInt(16);
var POW_WINDOWED_MIN = /* @__PURE__ */ BigInt("0x10000000000000000");
function mod(a, b) {
  if (b <= _0n2)
    throw new Error("mod: expected positive modulus, got " + b);
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function pow(num2, power, modulo) {
  if (modulo <= _1n2)
    throw new Error("pow: expected modulus > 1, got " + modulo);
  if (typeof power !== "bigint")
    throw new TypeError("invalid exponent: expected bigint, got " + typeof power);
  if (power < _0n2)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n2)
    return _1n2;
  if (power === _1n2)
    return num2;
  let d = num2 % modulo;
  if (d < _0n2)
    d += modulo;
  if (power < POW_WINDOWED_MIN) {
    let p2 = _1n2;
    while (power > _0n2) {
      if (power & _1n2)
        p2 = p2 * d % modulo;
      d = d * d % modulo;
      power >>= _1n2;
    }
    return p2;
  }
  const digits = [];
  while (power > _0n2) {
    digits.push(Number(power & _15n));
    power >>= _4n;
  }
  const table = new Array(16);
  table[0] = _1n2;
  table[1] = d;
  for (let i = 2; i < 16; i++)
    table[i] = table[i - 1] * d % modulo;
  let p = table[digits[digits.length - 1]];
  for (let w = digits.length - 2; w >= 0; w--) {
    p = p * p % modulo;
    p = p * p % modulo;
    p = p * p % modulo;
    p = p * p % modulo;
    const digit = digits[w];
    if (digit !== 0)
      p = p * table[digit] % modulo;
  }
  return p;
}
function pow2(x, power, modulo) {
  if (modulo <= _1n2)
    throw new Error("pow2: expected modulus > 1, got " + modulo);
  if (power < _0n2)
    throw new Error("pow2: expected non-negative exponent, got " + power);
  let res = x;
  while (power-- > _0n2) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n2)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _1n2)
    throw new Error("invert: expected modulus > 1, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n2, u = _1n2;
  while (a !== _0n2) {
    const q = b / a;
    const r = b - a * q;
    const m = x - u * q;
    b = a, a = r, x = u, u = m;
  }
  const gcd = b;
  if (gcd !== _1n2)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function assertIsSquare(Fp, root, n) {
  const F = Fp;
  if (!F.eql(F.sqr(root), n))
    throw new Error("Cannot find square root");
}
function aoddModulus(order, fnName) {
  if ((order & _1n2) === _0n2)
    throw new Error(fnName + ": expected odd modulus, got " + order);
}
function sqrt3mod4(Fp, n) {
  const F = Fp;
  const p1div4 = (F.ORDER + _1n2) / _4n;
  const root = F.pow(n, p1div4);
  assertIsSquare(F, root, n);
  return root;
}
function sqrt5mod8(Fp, n) {
  const F = Fp;
  const p5div8 = (F.ORDER - _5n) / _8n;
  const n2 = F.mul(n, _2n);
  const v = F.pow(n2, p5div8);
  const nv = F.mul(n, v);
  const i = F.mul(F.mul(nv, _2n), v);
  const root = F.mul(nv, F.sub(i, F.ONE));
  assertIsSquare(F, root, n);
  return root;
}
function sqrt9mod16(P) {
  const Fp_ = Field(P);
  const tn = tonelliShanks(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n) / _16n;
  return ((Fp, n) => {
    const F = Fp;
    let tv1 = F.pow(n, c4);
    let tv2 = F.mul(tv1, c1);
    const tv3 = F.mul(tv1, c2);
    const tv4 = F.mul(tv1, c3);
    const e12 = F.eql(F.sqr(tv2), n);
    const e22 = F.eql(F.sqr(tv3), n);
    tv1 = F.cmov(tv1, tv2, e12);
    tv2 = F.cmov(tv4, tv3, e22);
    const e3 = F.eql(F.sqr(tv2), n);
    const root = F.cmov(tv1, tv2, e3);
    assertIsSquare(F, root, n);
    return root;
  });
}
function tonelliShanks(P) {
  if (P < _3n)
    throw new Error("sqrt is not defined for small field");
  aoddModulus(P, "tonelliShanks");
  let Q = P - _1n2;
  let S = 0;
  while (Q % _2n === _0n2) {
    Q /= _2n;
    S++;
  }
  let Z = _2n;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n2) / _2n;
  return function tonelliSlow(Fp, n) {
    const F = Fp;
    if (F.is0(n))
      return n;
    if (FpLegendre(F, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = F.mul(F.ONE, cc);
    let t = F.pow(n, Q);
    let R = F.pow(n, Q1div2);
    while (!F.eql(t, F.ONE)) {
      if (F.is0(t))
        throw new Error("Cannot find square root: probably non-prime P");
      let i = 1;
      let t_tmp = F.sqr(t);
      while (!F.eql(t_tmp, F.ONE)) {
        i++;
        t_tmp = F.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n2 << BigInt(M - i - 1);
      const b = F.pow(c, exponent);
      M = i;
      c = F.sqr(b);
      t = F.mul(t, c);
      R = F.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  aoddModulus(P, "Fp.sqrt");
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  if (P % _16n === _9n)
    return sqrt9mod16(P);
  return tonelliShanks(P);
}
var FIELD_FIELDS = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField(field) {
  aobject2(field, "field");
  if (typeof field.ORDER !== "bigint")
    throw new TypeError('param "ORDER" is invalid: expected bigint, got ' + typeof field.ORDER);
  asafenumber(field.BYTES, "BYTES");
  asafenumber(field.BITS, "BITS");
  for (const name of FIELD_FIELDS)
    afunction(field[name], "field." + name);
  if (field.BYTES < 1 || field.BITS < 1)
    throw new Error("invalid field: expected BYTES/BITS > 0");
  if (field.ORDER <= _1n2)
    throw new Error("invalid field: expected ORDER > 1, got " + field.ORDER);
  return field;
}
function FpInvertBatch(Fp, nums, passZero = false) {
  validateField(Fp);
  aarray(nums, "nums");
  abool(passZero, "passZero");
  const F = Fp;
  const inverted = new Array(nums.length).fill(passZero ? F.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num2, i) => {
    if (F.is0(num2))
      return acc;
    inverted[i] = acc;
    return F.mul(acc, num2);
  }, F.ONE);
  const invertedAcc = F.inv(multipliedAcc);
  nums.reduceRight((acc, num2, i) => {
    if (F.is0(num2))
      return acc;
    inverted[i] = F.mul(acc, inverted[i]);
    return F.mul(acc, num2);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp, n) {
  validateField(Fp);
  const F = Fp;
  aoddModulus(F.ORDER, "FpLegendre");
  const p1mod2 = (F.ORDER - _1n2) / _2n;
  const powered = F.pow(n, p1mod2);
  const yes = F.eql(powered, F.ONE);
  const zero = F.eql(powered, F.ZERO);
  const no = F.eql(powered, F.neg(F.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber2(nBitLength);
  if (n <= _0n2)
    throw new Error("invalid n length: expected positive n, got " + n);
  if (nBitLength !== void 0 && nBitLength < 1)
    throw new Error("invalid n length: expected positive bit length, got " + nBitLength);
  const bits = bitLen(n);
  if (nBitLength !== void 0 && nBitLength < bits)
    throw new Error(`invalid n length: expected nBitLength (${nBitLength}) >= bitLen(n) (${bits})`);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : bits;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
var FIELD_SQRT = /* @__PURE__ */ new WeakMap();
var _Field = class {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = _0n2;
  ONE = _1n2;
  _lengths;
  _mod;
  constructor(ORDER, opts = {}) {
    if (ORDER <= _1n2)
      throw new Error("invalid field: expected ORDER > 1, got " + ORDER);
    let _nbitLength = void 0;
    this.isLE = false;
    if (opts != null && typeof opts === "object") {
      if (typeof opts.BITS === "number")
        _nbitLength = opts.BITS;
      if (typeof opts.sqrt === "function")
        Object.defineProperty(this, "sqrt", { value: opts.sqrt, enumerable: true });
      if (typeof opts.isLE === "boolean")
        this.isLE = opts.isLE;
      if (opts.allowedLengths)
        this._lengths = Object.freeze(opts.allowedLengths.slice());
      if (typeof opts.modFromBytes === "boolean")
        this._mod = opts.modFromBytes;
    }
    const { nBitLength, nByteLength } = nLength(ORDER, _nbitLength);
    if (nByteLength > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = ORDER;
    this.BITS = nBitLength;
    this.BYTES = nByteLength;
    Object.freeze(this);
  }
  create(num2) {
    return mod(num2, this.ORDER);
  }
  isValid(num2) {
    if (typeof num2 !== "bigint")
      throw new TypeError("invalid field element: expected bigint, got " + typeof num2);
    return _0n2 <= num2 && num2 < this.ORDER;
  }
  is0(num2) {
    return num2 === _0n2;
  }
  // is valid and invertible
  isValidNot0(num2) {
    return !this.is0(num2) && this.isValid(num2);
  }
  isOdd(num2) {
    return (num2 & _1n2) === _1n2;
  }
  neg(num2) {
    return mod(-num2, this.ORDER);
  }
  eql(lhs, rhs) {
    return lhs === rhs;
  }
  sqr(num2) {
    return mod(num2 * num2, this.ORDER);
  }
  add(lhs, rhs) {
    return mod(lhs + rhs, this.ORDER);
  }
  sub(lhs, rhs) {
    return mod(lhs - rhs, this.ORDER);
  }
  mul(lhs, rhs) {
    return mod(lhs * rhs, this.ORDER);
  }
  pow(num2, power) {
    return pow(num2, power, this.ORDER);
  }
  div(lhs, rhs) {
    return mod(lhs * invert(rhs, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(num2) {
    return num2 * num2;
  }
  addN(lhs, rhs) {
    return lhs + rhs;
  }
  subN(lhs, rhs) {
    return lhs - rhs;
  }
  mulN(lhs, rhs) {
    return lhs * rhs;
  }
  inv(num2) {
    return invert(num2, this.ORDER);
  }
  sqrt(num2) {
    let sqrt = FIELD_SQRT.get(this);
    if (!sqrt)
      FIELD_SQRT.set(this, sqrt = FpSqrt(this.ORDER));
    return sqrt(this, num2);
  }
  toBytes(num2) {
    return this.isLE ? numberToBytesLE(num2, this.BYTES) : numberToBytesBE(num2, this.BYTES);
  }
  fromBytes(bytes, skipValidation = false) {
    abytes2(bytes);
    const { _lengths: allowedLengths, BYTES, isLE, ORDER, _mod: modFromBytes } = this;
    if (allowedLengths) {
      if (bytes.length < 1 || !allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
        throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
      }
      const padded = new Uint8Array(BYTES);
      padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
      bytes = padded;
    }
    if (bytes.length !== BYTES)
      throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
    let scalar = isLE ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    if (modFromBytes)
      scalar = mod(scalar, ORDER);
    if (!skipValidation) {
      if (!this.isValid(scalar))
        throw new Error("invalid field element: outside of range 0..ORDER");
    }
    return scalar;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(lst) {
    return FpInvertBatch(this, lst, true);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(a, b, condition) {
    abool(condition, "condition");
    return condition ? b : a;
  }
};
function Field(ORDER, opts = {}) {
  Object.freeze(_Field.prototype);
  return new _Field(ORDER, opts);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  if (fieldOrder <= _1n2)
    throw new Error("field order must be greater than 1");
  const bitLength = bitLen(fieldOrder - _1n2);
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE = false) {
  abytes2(key);
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = Math.max(getMinHashLength(fieldOrder), 16);
  if (len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num2 = isLE ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num2, fieldOrder - _1n2) + _1n2;
  return isLE ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}

// ../Nostr-Spatial-Web-Protocol--NSWP-/node_modules/@noble/curves/abstract/curve.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var _0n3 = /* @__PURE__ */ BigInt(0);
var _1n3 = /* @__PURE__ */ BigInt(1);
var _4n2 = /* @__PURE__ */ BigInt(4);
var BLIND_BYTES = 16;
var BLIND_BITS = 128;
var FW_WINDOW = 5;
var TABLE_BYTES_MAX = /* @__PURE__ */ (() => 2 ** 31)();
function validatePointCons(Point) {
  const pc = Point;
  if (typeof pc !== "function")
    throw new TypeError('"Point" expected constructor, got type=' + typeof Point);
  afunction(pc.fromAffine, "Point.fromAffine");
  afunction(pc.fromBytes, "Point.fromBytes");
  afunction(pc.fromHex, "Point.fromHex");
  aobject2(pc.BASE, "Point.BASE");
  aobject2(pc.ZERO, "Point.ZERO");
  validateField(pc.Fp);
  validateField(pc.Fn);
}
function normalizeZ(c, points) {
  validatePointCons(c);
  validateMSMPoints(points, c);
  const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
  return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
}
function validateW(W2, bits, min = 1) {
  if (!Number.isSafeInteger(W2) || W2 < min || W2 > bits)
    throw new Error("invalid window size, expected [" + min + ".." + bits + "], got W=" + W2);
}
function validateTableBytes(numPoints, fpBytes) {
  const bytes = numPoints * (4 * fpBytes + 128);
  if (bytes > TABLE_BYTES_MAX)
    throw new Error("invalid window size: table would need ~" + Math.ceil(bytes / 2 ** 20) + " MiB, max " + TABLE_BYTES_MAX / 2 ** 20 + " MiB");
}
function probeRandomBytes(randomBytes3, length) {
  if (randomBytes3 === void 0)
    return void 0;
  afunction(randomBytes3, "randomBytes");
  try {
    const probe = randomBytes3(length);
    if (!isBytes2(probe) || probe.length !== length)
      return void 0;
  } catch {
    return void 0;
  }
  return randomBytes3;
}
function validateMSMPoints(points, c) {
  aarray(points, "points");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars(scalars, field, maxScalar) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    const ok = maxScalar === void 0 ? field.isValid(s) : isPosBig(s) && s < maxScalar;
    if (!ok)
      throw new Error("invalid scalar at index " + i);
  });
}
var pointWindowSizes = /* @__PURE__ */ new WeakMap();
function getWindowSize(P) {
  return pointWindowSizes.get(P) || 1;
}
function oddMultiples(p, size) {
  const dbl = p.double();
  const t = [p];
  for (let j = 1; j < size; j++)
    t.push(t[j - 1].add(dbl));
  return t;
}
function wnafDigits(n, W2) {
  const size = 2 ** W2;
  const half = size / 2;
  const mask = BigInt(size - 1);
  const d = [];
  while (n > _0n3) {
    let w = 0;
    if (n & _1n3) {
      w = Number(n & mask);
      if (w >= half)
        w -= size;
      n -= BigInt(w);
    }
    d.push(w);
    n >>= _1n3;
  }
  return d;
}
function signedWindowDigits(n, W2, windows) {
  const size = 2 ** W2;
  const half = size / 2;
  const mask = BigInt(size - 1);
  const shiftBy = BigInt(W2);
  const d = [];
  for (let w = 0; w < windows; w++) {
    let v = Number(n & mask);
    n >>= shiftBy;
    if (v > half) {
      v -= size;
      n += _1n3;
    }
    d.push(v);
  }
  if (n !== _0n3)
    throw new Error("invalid wnaf");
  return d;
}
function wnafWalk(zero, tables, digits) {
  let max = 0;
  for (const d of digits)
    max = Math.max(max, d.length);
  let acc = zero;
  for (let bit = max - 1; bit >= 0; bit--) {
    if (bit !== max - 1)
      acc = acc.double();
    for (let i = 0; i < digits.length; i++) {
      const w = digits[i][bit];
      if (w) {
        const item = tables[i][Math.abs(w) - 1 >> 1];
        acc = acc.add(w < 0 ? item.negate() : item);
      }
    }
  }
  return acc;
}
var ScalarMultiplier = class {
  Point;
  BASE;
  ZERO;
  randomBytes;
  wnafPrecomputes = /* @__PURE__ */ new WeakMap();
  baseCanBeBlinded;
  bits;
  // Parametrized with a given Point class (not individual point)
  constructor(Point, randomBytes3) {
    validatePointCons(Point);
    this.randomBytes = probeRandomBytes(randomBytes3, BLIND_BYTES);
    this.Point = Point;
    this.BASE = Point.BASE;
    this.ZERO = Point.ZERO;
    this.bits = Point.Fn.BITS;
  }
  /**
   * Creates a signed fixed-window wNAF precomputation table: for every window w, the
   * multiples `[1..2^(W−1)]⋅2^(w⋅W)⋅P`, flattened. All doublings are baked into the table,
   * so cached multiplication is additions-only. `windows = ceil(bits/W) + 1`: the extra
   * window absorbs the final carry of signed-digit recoding.
   * For a 256-bit curve and W=6, the table is 44⋅32 = 1408 points.
   * @param point - Point instance
   * @param W - window size
   * @param bits - scalar bitlength the table must cover
   */
  buildWnafTable(point, W2, bits) {
    const windows = Math.ceil(bits / W2) + 1;
    const half = 2 ** (W2 - 1);
    const comp = [];
    let base = point;
    for (let w = 0; w < windows; w++) {
      let acc = base;
      for (let i = 0; i < half; i++) {
        comp.push(acc);
        acc = acc.add(base);
      }
      base = comp[comp.length - 1].double();
    }
    return { W: W2, bits, windows, comp };
  }
  /**
   * Implements ec multiplication using precomputed signed fixed-window wNAF tables.
   * Constant-time: fixed window count with one table addition per window — zero digits feed
   * the fake accumulator — and no doublings; the lookup scans the whole window slice.
   * Scalar bounds are validated by the public entry points ({@link ScalarMultiplier.mulCT},
   * {@link ScalarMultiplier.mulCTBlinded}, {@link ScalarMultiplier.mulUnsafe});
   * signedWindowDigits throws if `n` exceeds the table.
   * @returns real and fake (for const-time) points
   */
  wnafCachedCT(precomputes, n) {
    const { W: W2, windows, comp } = precomputes;
    const half = 2 ** (W2 - 1);
    const digits = signedWindowDigits(n, W2, windows);
    let p = this.ZERO;
    let f = this.BASE;
    for (let w = 0; w < windows; w++) {
      const digit = digits[w];
      const start = w * half;
      const idx = Math.abs(digit) - 1;
      let sel = comp[start];
      for (let i = 1; i < half; i++)
        sel = i === idx ? comp[start + i] : sel;
      const neg = sel.negate();
      if (digit === 0)
        f = f.add(comp[start]);
      else
        p = p.add(digit < 0 ? neg : sel);
    }
    return { p, f };
  }
  // Cache key is point identity plus (W, bits); at most two entries exist per point (public-width
  // `Fn.BITS` and blinded `Fn.BITS + BLIND_BITS`). Callers must not reuse the same point with
  // incompatible `transform(...)` layouts and expect a separate cache entry.
  getWnafPrecomputes(W2, point, bits, transform) {
    let entries = this.wnafPrecomputes.get(point);
    let comp = entries?.find((entry) => entry.W === W2 && entry.bits === bits);
    if (!comp) {
      comp = this.buildWnafTable(point, W2, bits);
      if (typeof transform === "function")
        comp = { ...comp, comp: transform(comp.comp) };
      if (!entries) {
        entries = [];
        this.wnafPrecomputes.set(point, entries);
      }
      entries.push(comp);
    }
    return comp;
  }
  assertPoint(point) {
    if (!(point instanceof this.Point))
      throw new TypeError('"point" expected Point instance, got type=' + typeof point);
  }
  // Shared prologue of the constant-time entry points. Rejects scalar 0: in key/signature-style
  // callers a zero scalar means broken upstream plumbing, and concrete Points already reject it.
  // Uses inRange instead of Fn.isValidNot0: validateField() only certifies the arithmetic subset.
  validateMulInput(point, scalar) {
    this.assertPoint(point);
    if (!inRange(scalar, _1n3, this.Point.Fn.ORDER))
      throw new Error("invalid scalar");
  }
  // Constant-time dispatch shared by mulCT / mulCTBlinded. Un-precomputed points (W===1, e.g.
  // ECDH peer keys) skip building a throwaway cached table in favor of a small fixed-window
  // multiply. `n` must be < 2^bits.
  runCT(point, n, bits, transform) {
    const W2 = getWindowSize(point);
    if (W2 === 1)
      return this.fixedWindowCT(point, n, bits);
    return this.wnafCachedCT(this.getWnafPrecomputes(W2, point, bits, transform), n);
  }
  mulCT(point, scalar, transform) {
    this.validateMulInput(point, scalar);
    return this.runCT(point, scalar, this.bits, transform);
  }
  mulCTBlinded(point, scalar, transform) {
    this.validateMulInput(point, scalar);
    if (this.randomBytes === void 0)
      throw new Error("randomBytes is required for scalar blinding");
    const bits = this.Point.Fn.BITS + BLIND_BITS;
    const blind = this.randomBytes(BLIND_BYTES);
    if (!isBytes2(blind) || blind.length !== BLIND_BYTES)
      throw new Error("randomBytes returned invalid byte array");
    blind[0] = blind[0] & 63 | 128;
    const n = scalar + bytesToNumberBE(blind) * this.Point.Fn.ORDER;
    return this.runCT(point, n, bits, transform);
  }
  /**
   * Constant-time multiplication `n*point` for an un-precomputed point, via a small fixed window.
   * A cached wNAF table only pays off when reused; a flat 2^FW_WINDOW table (`size-1` adds) is
   * far cheaper to build for a single use. The point-operation sequence is independent of `n`:
   * build the table, then per window exactly FW_WINDOW doublings, a data-oblivious scan over
   * every table entry, and one addition (adds the identity when the window digit is 0 — never
   * skipped).
   *
   * `n` must be `< 2^bits`. Assumes complete addition (adding the identity costs the same as any
   * add), which holds for the Weierstrass/Edwards point types used here. The table is left in
   * projective form (no normalizeZ): normalizing this small a table costs more than the
   * mixed-add savings it would buy for a single multiply.
   * @returns real point `p`; `f` duplicates it only to match {@link wnafCachedCT}'s return shape
   * (this path needs no fake accumulator — its op-count is already scalar-independent).
   */
  fixedWindowCT(point, n, bits) {
    const W2 = FW_WINDOW;
    const size = 1 << W2;
    const mask = bitMask(W2);
    const table = new Array(size);
    table[0] = this.ZERO;
    for (let i = 1; i < size; i++)
      table[i] = table[i - 1].add(point);
    const windows = Math.ceil(bits / W2);
    let acc = this.ZERO;
    for (let window = windows - 1; window >= 0; window--) {
      if (window !== windows - 1)
        for (let d = 0; d < W2; d++)
          acc = acc.double();
      const digit = Number(n >> BigInt(window * W2) & mask);
      let sel = table[0];
      for (let i = 1; i < size; i++)
        sel = i === digit ? table[i] : sel;
      acc = acc.add(sel);
    }
    return { p: acc, f: acc };
  }
  shouldBlind(point, cofactor) {
    if (this.randomBytes === void 0)
      return false;
    if (cofactor === _1n3)
      return true;
    if (point !== this.BASE)
      return false;
    if (this.baseCanBeBlinded === void 0)
      this.baseCanBeBlinded = this.mulUnsafe(this.BASE, this.Point.Fn.ORDER).is0();
    return this.baseCanBeBlinded;
  }
  mulSecret(point, scalar, cofactor, transform) {
    return this.shouldBlind(point, cofactor) ? this.mulCTBlinded(point, scalar, transform) : this.mulCT(point, scalar, transform);
  }
  mulUnsafe(point, scalar, transform) {
    this.assertPoint(point);
    if (!isPosBig(scalar))
      throw new Error("invalid scalar");
    const W2 = getWindowSize(point);
    if (W2 === 1 || scalar >= this.Point.Fn.ORDER)
      return mulAddUnsafe(this.Point, [point], [scalar], true);
    const precomputes = this.getWnafPrecomputes(W2, point, this.bits, transform);
    return this.wnafCachedCT(precomputes, scalar).p;
  }
  // Remembers the window size used for precomputed wNAF multiplication of the given point
  // and drops any previously built tables. Usually only the base point is precomputed.
  // W=1 resets the point to the un-precomputed (table-less) paths.
  // W is additionally capped so tables stay under ~2 GiB ({@link TABLE_BYTES_MAX}).
  setWindowSize(point, W2) {
    this.assertPoint(point);
    validateW(W2, this.bits);
    const windows = Math.ceil((this.bits + BLIND_BITS) / W2) + 1;
    validateTableBytes(windows * 2 ** (W2 - 1), this.Point.Fp.BYTES);
    pointWindowSizes.set(point, W2);
    this.wnafPrecomputes.delete(point);
  }
  // True when a window size is set: tables themselves are built lazily on first multiply.
  hasWindowSize(point) {
    return getWindowSize(point) !== 1;
  }
};
function mulAddUnsafe(c, points, scalars, allowOversized = false) {
  validatePointCons(c);
  validateMSMPoints(points, c);
  abool(allowOversized, "allowOversized");
  validateMSMScalars(scalars, c.Fn, allowOversized ? c.Fn.ORDER ** _4n2 : void 0);
  if (points.length !== scalars.length)
    throw new Error("arrays of points and scalars must have equal length");
  const tables = points.map((p) => oddMultiples(p, 4));
  const digits = scalars.map((n) => wnafDigits(n, 4));
  return wnafWalk(c.ZERO, tables, digits);
}
function createField(order, field, isLE) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField(field);
    return field;
  } else {
    return Field(order, { isLE });
  }
}
function createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (type !== "weierstrass" && type !== "edwards")
    throw new Error('expected curve type "weierstrass" or "edwards"');
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  validateObject(curveOpts);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(isPosBig(val) && val !== _0n3))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp, Fn };
}
function createKeygen(randomSecretKey, getPublicKey2) {
  return function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey2(secretKey) };
  };
}

// ../Nostr-Spatial-Web-Protocol--NSWP-/node_modules/@noble/curves/abstract/weierstrass.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var divNearest = (num2, den) => (num2 + (num2 >= 0 ? den : -den) / _2n2) / den;
function _splitEndoScalar(k, basis, n) {
  aInRange("scalar", k, _0n4, n);
  const [[a1, b1], [a2, b2]] = basis;
  const c1 = divNearest(b2 * k, n);
  const c2 = divNearest(-b1 * k, n);
  let k1 = k - c1 * a1 - c2 * a2;
  let k2 = -c1 * b1 - c2 * b2;
  const k1neg = k1 < _0n4;
  const k2neg = k2 < _0n4;
  if (k1neg)
    k1 = -k1;
  if (k2neg)
    k2 = -k2;
  const MAX_NUM = bitMask(Math.ceil(bitLen(n) / 2)) + _1n4;
  if (k1 < _0n4 || k1 >= MAX_NUM || k2 < _0n4 || k2 >= MAX_NUM) {
    throw new Error("splitScalar (endomorphism): failed for k");
  }
  return { k1neg, k1, k2neg, k2 };
}
var _0n4 = /* @__PURE__ */ BigInt(0);
var _1n4 = /* @__PURE__ */ BigInt(1);
var _2n2 = /* @__PURE__ */ BigInt(2);
var _3n2 = /* @__PURE__ */ BigInt(3);
var _4n3 = /* @__PURE__ */ BigInt(4);
function weierstrass(params, extraOpts = {}) {
  const validated = createCurveFields("weierstrass", params, extraOpts);
  const Fp = validated.Fp;
  const Fn = validated.Fn;
  let CURVE = validated.CURVE;
  const { h: cofactor, n: CURVE_ORDER } = CURVE;
  validateObject(extraOpts, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object",
    randomBytes: "function"
  });
  const { endo: endoOpts, allowInfinityPoint, clearCofactor, isTorsionFree, fromBytes, toBytes } = extraOpts;
  const randomBytes3 = extraOpts.randomBytes === void 0 ? randomBytes2 : extraOpts.randomBytes;
  if (endoOpts) {
    if (!Fp.is0(CURVE.a) || typeof endoOpts.beta !== "bigint" || !Array.isArray(endoOpts.basises)) {
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    }
  }
  const endo = endoOpts ? {
    beta: endoOpts.beta,
    basises: endoOpts.basises.map((basis) => [...basis])
  } : void 0;
  const lengths = getWLengths(Fp, Fn);
  function assertCompressionIsSupported() {
    if (!Fp.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function pointToBytes2(_c, point, isCompressed) {
    if (point.is0()) {
      if (!allowInfinityPoint)
        throw new Error("bad point: ZERO");
      return Uint8Array.of(0);
    }
    const { x, y } = point.toAffine();
    const bx = Fp.toBytes(x);
    abool(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp.isOdd(y);
      return concatBytes2(pprefix(hasEvenY), bx);
    } else {
      return concatBytes2(Uint8Array.of(4), bx, Fp.toBytes(y));
    }
  }
  function pointFromBytes(bytes) {
    abytes2(bytes, void 0, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length = bytes.length;
    const head = bytes[0];
    const tail = bytes.subarray(1);
    if (allowInfinityPoint && length === 1 && head === 0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (length === comp && (head === 2 || head === 3)) {
      const x = Fp.fromBytes(tail);
      if (!Fp.isValid(x))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x);
      let y;
      try {
        y = Fp.sqrt(y2);
      } catch (sqrtError) {
        const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err);
      }
      assertCompressionIsSupported();
      const evenY = Fp.isOdd(y);
      const evenH = (head & 1) === 1;
      if (evenH !== evenY)
        y = Fp.neg(y);
      return { x, y };
    } else if (length === uncomp && head === 4) {
      const L = Fp.BYTES;
      const x = Fp.fromBytes(tail.subarray(0, L));
      const y = Fp.fromBytes(tail.subarray(L, L * 2));
      if (!isValidXY(x, y))
        throw new Error("bad point: is not on curve");
      return { x, y };
    } else {
      throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = toBytes === void 0 ? pointToBytes2 : toBytes;
  const decodePoint = fromBytes === void 0 ? pointFromBytes : fromBytes;
  const b3 = Fp.mul(CURVE.b, _3n2);
  const mulA = Fp.is0(CURVE.a) ? (_) => Fp.ZERO : (x) => Fp.mul(CURVE.a, x);
  function weierstrassEquation(x) {
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
  }
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n3);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function acoord(title, n, banZero = false) {
    if (!Fp.isValid(n) || banZero && Fp.is0(n))
      throw new Error(`bad point coordinate ${title}`);
    return typeof n === "object" && n !== null ? Fp.create(n) : n;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point))
      throw new Error("Weierstrass Point expected");
  }
  function splitEndoScalarN(k) {
    if (!endo || !endo.basises)
      throw new Error("no endo");
    return _splitEndoScalar(k, endo.basises, Fn.ORDER);
  }
  function pushWnafPair(points, scalars, p, k) {
    if (!Fn.isValid(k))
      throw new RangeError("invalid scalar: out of range");
    if (endo) {
      const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(k);
      const psi = new Point(Fp.mul(p.X, endo.beta), p.Y, p.Z);
      points.push(k1neg ? p.negate() : p, k2neg ? psi.negate() : psi);
      scalars.push(k1, k2);
    } else {
      points.push(p);
      scalars.push(k);
    }
  }
  const validityCache = /* @__PURE__ */ new WeakSet();
  class Point {
    static BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
    static ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
    static Fp = Fp;
    static Fn = Fn;
    X;
    Y;
    Z;
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(X, Y, Z) {
      this.X = acoord("x", X);
      this.Y = acoord("y", Y, true);
      this.Z = acoord("z", Z);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point)
        throw new Error("projective point not allowed");
      if (Fp.is0(x) && Fp.is0(y))
        return Point.ZERO;
      return new Point(x, y, Fp.ONE);
    }
    static fromBytes(bytes) {
      const P = Point.fromAffine(decodePoint(abytes2(bytes, void 0, "point")));
      P.assertValidity();
      return P;
    }
    static fromHex(hex) {
      return Point.fromBytes(hexToBytes2(hex));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     * @param isLazy - true will defer table computation until the first multiplication
     */
    precompute(windowSize = 6, isLazy = true) {
      wnaf.setWindowSize(this, windowSize);
      if (!isLazy)
        this.multiply(_3n2);
      return this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      const p = this;
      if (p.is0()) {
        if (allowInfinityPoint && Fp.is0(p.X) && Fp.eql(p.Y, Fp.ONE) && Fp.is0(p.Z))
          return;
        throw new Error("bad point: ZERO");
      }
      if (validityCache.has(p))
        return;
      const { x, y } = p.toAffine();
      if (!Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("bad point: x or y not field elements");
      if (!isValidXY(x, y))
        throw new Error("bad point: equation left != right");
      if (!p.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
      validityCache.add(p);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (!Fp.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp.isOdd(y);
    }
    /** Compare one point to another. */
    equals(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new Point(this.X, Fp.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { X: X1, Y: Y1, Z: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = mulA(Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = mulA(t2);
      t3 = Fp.sub(t0, t2);
      t3 = mulA(t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = mulA(t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = mulA(t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = mulA(t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point(X3, Y3, Z3);
    }
    subtract(other) {
      aprjpoint(other);
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses precomputed tables (signed fixed-window wNAF) when available.
     * Uses scalar blinding and avoids endomorphism splitting in the secret-scalar path.
     * @param scalar - by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      if (!Fn.isValidNot0(scalar))
        throw new RangeError("invalid scalar: out of range");
      const { p, f } = wnaf.mulSecret(this, scalar, cofactor, normalize);
      return normalize([p, f])[0];
    }
    /**
     * Non-constant-time multiplication. Uses width-4 wNAF with GLV endomorphism splitting
     * when available (two half-width scalars sharing one halved doubling chain).
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(scalar) {
      const p = this;
      const sc = scalar;
      if (!Fn.isValid(sc))
        throw new RangeError("invalid scalar: out of range");
      if (sc === _0n4 || p.is0())
        return Point.ZERO;
      if (sc === _1n4)
        return p;
      if (wnaf.hasWindowSize(this))
        return wnaf.mulUnsafe(p, sc, normalize);
      const points = [];
      const scalars = [];
      pushWnafPair(points, scalars, p, sc);
      return mulAddUnsafe(Point, points, scalars);
    }
    /**
     * Non-constant-time double-scalar multiplication `a⋅this + b⋅other` (Strauss–Shamir).
     * Both walks share one doubling chain via {@link mulAddUnsafe}, and GLV endomorphism
     * (when available) halves the chain again by splitting each scalar into two half-width
     * parts. Used by ECDSA verification and public-key recovery for `R = u1⋅G + u2⋅P`.
     * Only for public scalars.
     */
    mulAddUnsafe(a, other, b) {
      aprjpoint(other);
      const points = [];
      const scalars = [];
      pushWnafPair(points, scalars, this, a);
      pushWnafPair(points, scalars, other, b);
      return mulAddUnsafe(Point, points, scalars);
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * (X, Y, Z) ∋ (x=X/Z, y=Y/Z).
     * @param invertedZ - Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(invertedZ) {
      const p = this;
      let iz = invertedZ;
      if (iz != null && !Fp.isValid(iz))
        throw new RangeError('"invertedZ" expected valid field element');
      const { X, Y, Z } = p;
      if (Fp.eql(Z, Fp.ONE))
        return { x: X, y: Y };
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp.ONE : Fp.inv(Z);
      const x = Fp.mul(X, iz);
      const y = Fp.mul(Y, iz);
      const zz = Fp.mul(Z, iz);
      if (is0)
        return { x: Fp.ZERO, y: Fp.ZERO };
      if (!Fp.eql(zz, Fp.ONE))
        throw new Error("invZ was invalid");
      return { x, y };
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      if (cofactor === _1n4)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point, this);
      return wnaf.mulUnsafe(this, CURVE_ORDER).is0();
    }
    clearCofactor() {
      if (cofactor === _1n4)
        return this;
      if (clearCofactor)
        return clearCofactor(Point, this);
      return this.multiplyUnsafe(cofactor);
    }
    isSmallOrder() {
      if (cofactor === _1n4)
        return this.is0();
      return this.clearCofactor().is0();
    }
    toBytes(isCompressed = true) {
      abool(isCompressed, "isCompressed");
      this.assertValidity();
      return encodePoint(Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex2(this.toBytes(isCompressed));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const normalize = (points) => normalizeZ(Point, points);
  const wnaf = new ScalarMultiplier(Point, randomBytes3);
  if (wnaf.bits >= 6)
    Point.BASE.precompute(6);
  Object.freeze(Point.prototype);
  Object.freeze(Point);
  return Point;
}
function pprefix(hasEvenY) {
  return Uint8Array.of(hasEvenY ? 2 : 3);
}
function getWLengths(Fp, Fn) {
  return {
    secretKey: Fn.BYTES,
    publicKey: 1 + Fp.BYTES,
    publicKeyUncompressed: 1 + 2 * Fp.BYTES,
    publicKeyHasPrefix: true,
    // Raw compact `(r || s)` signature width; DER and recovered signatures use
    // different lengths outside this helper.
    signature: 2 * Fn.BYTES
  };
}

// ../Nostr-Spatial-Web-Protocol--NSWP-/node_modules/@noble/curves/secp256k1.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
var secp256k1_CURVE = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: BigInt(1),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
  Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
};
var secp256k1_ENDO = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  basises: [
    [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
    [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
  ]
};
var _0n5 = /* @__PURE__ */ BigInt(0);
var _2n3 = /* @__PURE__ */ BigInt(2);
function sqrtMod(y) {
  const P = secp256k1_CURVE.p;
  const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2(b3, _3n3, P) * b3 % P;
  const b9 = pow2(b6, _3n3, P) * b3 % P;
  const b11 = pow2(b9, _2n3, P) * b2 % P;
  const b22 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b22, _22n, P) * b22 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n3, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b22 % P;
  const t2 = pow2(t1, _6n, P) * b2 % P;
  const root = pow2(t2, _2n3, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
var Fpk1 = /* @__PURE__ */ Field(secp256k1_CURVE.p, { sqrt: sqrtMod });
var Pointk1 = /* @__PURE__ */ weierstrass(secp256k1_CURVE, {
  Fp: Fpk1,
  endo: secp256k1_ENDO
});
var TAGGED_HASH_PREFIXES = /* @__PURE__ */ Object.create(null);
function taggedHash(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag];
  if (tagP === void 0) {
    const tagH = sha256(asciiToBytes(tag));
    tagP = concatBytes2(tagH, tagH);
    TAGGED_HASH_PREFIXES[tag] = tagP;
  }
  return sha256(concatBytes2(tagP, ...messages));
}
var pointToBytes = (point) => point.toBytes(true).slice(1);
var affineXToBytes = ({ x }) => Fpk1.toBytes(x);
var hasEven = (y) => !Fpk1.isOdd(y);
function schnorrGetExtPubKey(priv) {
  const { Fn, BASE } = Pointk1;
  const d_ = Fn.fromBytes(abytes2(priv, 32, "secretKey"));
  const p = BASE.multiply(d_);
  const affine = p.toAffine();
  const scalar = hasEven(affine.y) ? d_ : Fn.neg(d_);
  return { scalar, bytes: affineXToBytes(affine) };
}
function lift_x(x) {
  const Fp = Fpk1;
  if (!Fp.isValidNot0(x))
    throw new Error("invalid x: Fail if x \u2265 p");
  const xx = Fp.sqr(x);
  const c = Fp.add(Fp.mulN(xx, x), BigInt(7));
  let y = Fp.sqrt(c);
  if (!hasEven(y))
    y = Fp.neg(y);
  const p = Pointk1.fromAffine({ x, y });
  p.assertValidity();
  return p;
}
var num = bytesToNumberBE;
function challenge(...args) {
  return Pointk1.Fn.create(num(taggedHash("BIP0340/challenge", ...args)));
}
function schnorrGetPublicKey(secretKey) {
  return schnorrGetExtPubKey(secretKey).bytes;
}
function schnorrSign(message, secretKey, auxRand = randomBytes(32)) {
  const { Fn, BASE } = Pointk1;
  const m = copyBytes(abytes2(message, void 0, "message"));
  const { bytes: px, scalar: d } = schnorrGetExtPubKey(secretKey);
  const a = abytes2(auxRand, 32, "auxRand");
  const t = Fn.toBytes(d ^ num(taggedHash("BIP0340/aux", a)));
  const rand = taggedHash("BIP0340/nonce", t, px, m);
  const k_ = Fn.create(num(rand));
  if (k_ === _0n5)
    throw new Error("sign failed: k is zero");
  const p = BASE.multiply(k_);
  const affine = p.toAffine();
  const k = hasEven(affine.y) ? k_ : Fn.neg(k_);
  const rx = affineXToBytes(affine);
  const e = challenge(rx, px, m);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(Fn.toBytes(Fn.create(k + e * d)), 32);
  if (!schnorrVerify(sig, m, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
function schnorrVerify(signature, message, publicKey) {
  const { Fp, Fn, BASE } = Pointk1;
  const sig = abytes2(signature, 64, "signature");
  const m = abytes2(message, void 0, "message");
  const pub = abytes2(publicKey, 32, "publicKey");
  try {
    const P = lift_x(num(pub));
    const rBytes = sig.subarray(0, 32);
    const r = num(rBytes);
    if (!Fp.isValidNot0(r))
      return false;
    const s = num(sig.subarray(32, 64));
    if (!Fn.isValidNot0(s))
      return false;
    const e = challenge(rBytes, pointToBytes(P), m);
    const R = BASE.mulAddUnsafe(s, P, Fn.neg(e));
    const { x, y } = R.toAffine();
    if (R.is0() || !hasEven(y) || !Fp.eql(x, r))
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
var schnorr = /* @__PURE__ */ (() => {
  const size = 32;
  const seedLength = 48;
  const randomSecretKey = (seed) => {
    seed = seed === void 0 ? randomBytes(seedLength) : seed;
    return mapHashToField(abytes2(seed, seedLength, "seed"), secp256k1_CURVE.n);
  };
  return Object.freeze({
    keygen: createKeygen(randomSecretKey, schnorrGetPublicKey),
    getPublicKey: schnorrGetPublicKey,
    sign: schnorrSign,
    verify: schnorrVerify,
    Point: Pointk1,
    utils: Object.freeze({
      randomSecretKey,
      taggedHash,
      lift_x,
      pointToBytes
    }),
    lengths: Object.freeze({
      secretKey: size,
      publicKey: size,
      publicKeyHasPrefix: false,
      signature: size * 2,
      seed: seedLength
    })
  });
})();

// ../Nostr-Spatial-Web-Protocol--NSWP-/packages/sdk/src/room.ts
import {
  buildHello,
  buildSignal,
  DEFAULT_RELAYS,
  getPublicKey,
  guestColor,
  guestName,
  openSignal,
  packPose,
  ROOM_LIMITS,
  ROOM_SIGNAL_KIND,
  roomTopic,
  shouldInitiate,
  unpackPose,
  decodeLook,
  generatedLook as generatedLook2
} from "@nswp/core";
var DEFAULT_ICE = [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }];
var HELLO_EVERY_MS = 2e4;
var RECORDING_HOLD_MS = 6e3;
var CONNECT_TIMEOUT_MS = 25e3;
var SILENT_TIMEOUT_MS = 8e3;
var GATHER_TIMEOUT_MS = 2500;
var RoomSession = class {
  self;
  name;
  topic;
  status = "connecting";
  key;
  relays;
  maxMembers;
  iceServers;
  sockets = /* @__PURE__ */ new Map();
  peers = /* @__PURE__ */ new Map();
  seen = /* @__PURE__ */ new Set();
  listeners = {
    member: /* @__PURE__ */ new Set(),
    leave: /* @__PURE__ */ new Set(),
    pose: /* @__PURE__ */ new Set(),
    look: /* @__PURE__ */ new Set(),
    recording: /* @__PURE__ */ new Set(),
    audio: /* @__PURE__ */ new Set(),
    status: /* @__PURE__ */ new Set()
  };
  look;
  recordingTimer;
  mic = null;
  timers = [];
  closed = false;
  constructor(opts = {}) {
    this.key = schnorr.utils.randomSecretKey();
    const pubkey = getPublicKey(this.key);
    const mine = opts.look ? decodeLook(opts.look) : null;
    this.look = mine?.ok ? opts.look : null;
    this.self = { pubkey, guest: true, name: guestName(pubkey), color: guestColor(pubkey), look: mine?.ok ? mine.value.look : generatedLook2(pubkey), recording: false };
    this.name = (opts.name ?? "lobby").slice(0, ROOM_LIMITS.maxNameChars);
    this.topic = roomTopic(opts.world ?? `${location.origin}${location.pathname}`, this.name);
    this.relays = opts.relays ?? DEFAULT_RELAYS;
    this.maxMembers = opts.maxMembers ?? ROOM_LIMITS.defaultMaxMembers;
    this.iceServers = opts.iceServers ?? DEFAULT_ICE;
  }
  on(event, fn) {
    this.listeners[event].add(fn);
    return () => this.listeners[event].delete(fn);
  }
  emit(event, ...args) {
    for (const fn of this.listeners[event]) {
      try {
        fn(...args);
      } catch (err) {
        console.error("nswp-sdk room listener failed", err);
      }
    }
  }
  get members() {
    return [...this.peers.values()].filter((p) => p.open).map((p) => p.member);
  }
  /** How many relays are currently connected. */
  get relayCount() {
    return [...this.sockets.values()].filter((s) => s.readyState === WebSocket.OPEN).length;
  }
  start() {
    for (const url of this.relays) this.connectRelay(url);
    this.timers.push(
      setInterval(() => this.announce(), HELLO_EVERY_MS),
      setInterval(() => this.sweep(), 2e3)
    );
    addEventListener("pagehide", this.onPageHide);
    setTimeout(() => {
      if (!this.closed && this.relayCount === 0) this.setStatus("no-relays");
    }, 8e3);
  }
  onPageHide = () => this.leave();
  setStatus(s) {
    if (this.status === s) return;
    this.status = s;
    this.emit("status", s);
  }
  connectRelay(url) {
    if (this.closed) return;
    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      return;
    }
    this.sockets.set(url, ws);
    ws.onopen = () => {
      ws.send(JSON.stringify(["REQ", "room", { kinds: [ROOM_SIGNAL_KIND], "#x": [this.topic], since: Math.floor(Date.now() / 1e3) - 5 }]));
      ws.send(JSON.stringify(["EVENT", buildHello(this.topic, this.key)]));
      this.setStatus("open");
    };
    ws.onmessage = (msg) => {
      let data;
      try {
        data = JSON.parse(String(msg.data));
      } catch {
        return;
      }
      if (Array.isArray(data) && data[0] === "EVENT" && data[1] === "room") void this.onEvent(data[2]);
    };
    ws.onclose = () => {
      if (this.sockets.get(url) === ws) this.sockets.delete(url);
      if (!this.closed) setTimeout(() => this.connectRelay(url), 5e3);
    };
    ws.onerror = () => {
    };
  }
  publish(event) {
    const frame = JSON.stringify(["EVENT", event]);
    for (const ws of this.sockets.values()) if (ws.readyState === WebSocket.OPEN) ws.send(frame);
  }
  announce() {
    if (!this.closed && this.peers.size < this.maxMembers - 1) this.publish(buildHello(this.topic, this.key));
  }
  async onEvent(raw) {
    const id = raw?.id;
    if (typeof id !== "string" || this.seen.has(id)) return;
    this.seen.add(id);
    if (this.seen.size > 2e3) this.seen.clear();
    const opened = openSignal(raw, this.key, this.topic);
    if (!opened || this.closed) return;
    const { from, message } = opened;
    const existing = this.peers.get(from);
    try {
      switch (message.t) {
        case "hello":
        case "welcome": {
          if (existing) return;
          if (this.peers.size >= this.maxMembers - 1) return;
          if (shouldInitiate(this.self.pubkey, from)) await this.offerTo(from);
          else if (message.t === "hello") this.publish(buildSignal(this.topic, this.key, from, { t: "welcome" }));
          return;
        }
        case "offer": {
          if (existing?.open) return;
          if (shouldInitiate(this.self.pubkey, from)) return;
          if (!existing && this.peers.size >= this.maxMembers - 1) return;
          if (existing) this.drop(from, false);
          await this.answerTo(from, message.sdp);
          return;
        }
        case "answer": {
          if (!existing || existing.pc.signalingState !== "have-local-offer") return;
          await existing.pc.setRemoteDescription({ type: "answer", sdp: message.sdp });
          return;
        }
        case "bye":
          this.drop(from, true);
          return;
      }
    } catch (err) {
      console.warn("nswp-sdk room handshake failed", err);
      this.drop(from, false);
    }
  }
  createPeer(pubkey) {
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    const peer = {
      member: { pubkey, guest: true, name: guestName(pubkey), color: guestColor(pubkey), look: generatedLook2(pubkey), recording: false },
      pc,
      open: false,
      lastSeen: Date.now(),
      startedAt: Date.now()
    };
    this.peers.set(pubkey, peer);
    pc.ontrack = (e) => {
      const stream = e.streams[0] ?? new MediaStream([e.track]);
      this.emit("audio", peer.member, stream);
    };
    pc.onconnectionstatechange = () => {
      if ((pc.connectionState === "failed" || pc.connectionState === "closed") && this.peers.get(pubkey) === peer) this.drop(pubkey, peer.open);
    };
    return peer;
  }
  wirePoseChannel(peer, ch) {
    ch.binaryType = "arraybuffer";
    peer.pose = ch;
    ch.onopen = () => {
      if (peer.open || this.peers.get(peer.member.pubkey) !== peer) return;
      peer.open = true;
      peer.lastSeen = Date.now();
      this.emit("member", peer.member);
      this.sayLook(ch);
    };
    ch.onmessage = (e) => {
      if (e.data === "rec:1" || e.data === "rec:0") {
        peer.recordingUntil = e.data === "rec:1" ? Date.now() + RECORDING_HOLD_MS : 0;
        this.markRecording(peer);
        return;
      }
      if (typeof e.data === "string") {
        const said = e.data.startsWith("look:") ? decodeLook(e.data.slice(5)) : null;
        if (said?.ok && JSON.stringify(said.value.look) !== JSON.stringify(peer.member.look)) {
          peer.member.look = said.value.look;
          this.emit("look", peer.member, said.value.look);
        }
        return;
      }
      if (!(e.data instanceof ArrayBuffer)) return;
      const pose = unpackPose(e.data);
      if (!pose) return;
      peer.lastSeen = Date.now();
      this.emit("pose", peer.member, pose);
    };
    ch.onclose = () => {
      if (this.peers.get(peer.member.pubkey) === peer) this.drop(peer.member.pubkey, peer.open);
    };
  }
  /**
   * Tell one member how you look. The channel drops what it can't deliver at
   * once, so it is said a few times over the first seconds.
   */
  sayLook(ch) {
    if (!this.look) return;
    const text = `look:${this.look}`;
    let left = 4;
    const say = () => {
      if (this.closed || ch.readyState !== "open") return;
      try {
        ch.send(text);
      } catch {
      }
      if (--left > 0) setTimeout(say, 1500);
    };
    say();
  }
  async gathered(pc) {
    if (pc.iceGatheringState !== "complete") {
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, GATHER_TIMEOUT_MS);
        pc.addEventListener("icegatheringstatechange", () => {
          if (pc.iceGatheringState === "complete") {
            clearTimeout(timer);
            resolve();
          }
        });
      });
    }
    return pc.localDescription.sdp;
  }
  audioTransceiver(pc) {
    return pc.getTransceivers().find((t) => t.receiver.track.kind === "audio");
  }
  async offerTo(pubkey) {
    const peer = this.createPeer(pubkey);
    const audio = peer.pc.addTransceiver("audio", { direction: "sendrecv" });
    if (this.mic) await audio.sender.replaceTrack(this.mic);
    this.wirePoseChannel(peer, peer.pc.createDataChannel("pose", { ordered: false, maxRetransmits: 0 }));
    await peer.pc.setLocalDescription(await peer.pc.createOffer());
    const sdp = await this.gathered(peer.pc);
    if (this.peers.get(pubkey) === peer) this.publish(buildSignal(this.topic, this.key, pubkey, { t: "offer", sdp }));
  }
  async answerTo(pubkey, sdp) {
    const peer = this.createPeer(pubkey);
    peer.pc.ondatachannel = (e) => {
      if (e.channel.label === "pose") this.wirePoseChannel(peer, e.channel);
    };
    await peer.pc.setRemoteDescription({ type: "offer", sdp });
    const audio = this.audioTransceiver(peer.pc);
    if (audio) {
      audio.direction = "sendrecv";
      if (this.mic) await audio.sender.replaceTrack(this.mic);
    }
    await peer.pc.setLocalDescription(await peer.pc.createAnswer());
    const answer = await this.gathered(peer.pc);
    if (this.peers.get(pubkey) === peer) this.publish(buildSignal(this.topic, this.key, pubkey, { t: "answer", sdp: answer }));
  }
  markRecording(peer) {
    const on = (peer.recordingUntil ?? 0) > Date.now();
    if (on === peer.member.recording) return;
    peer.member.recording = on;
    this.emit("recording", peer.member, on);
  }
  /**
   * Say that you are recording what you see, or have stopped. The others are
   * shown a light on your figure while it is true. An honest client says so
   * whenever it records other people; nothing can make a dishonest one.
   */
  setRecording(on) {
    if (on === this.self.recording) return;
    this.self.recording = on;
    clearInterval(this.recordingTimer);
    const say = () => {
      for (const peer of this.peers.values()) {
        if (!peer.open || peer.pose?.readyState !== "open") continue;
        try {
          peer.pose.send(on ? "rec:1" : "rec:0");
        } catch {
        }
      }
    };
    say();
    if (on) this.recordingTimer = setInterval(say, 2e3);
    else setTimeout(say, 400);
  }
  drop(pubkey, announce) {
    const peer = this.peers.get(pubkey);
    if (!peer) return;
    this.peers.delete(pubkey);
    try {
      peer.pc.close();
    } catch {
    }
    if (announce && peer.open) this.emit("leave", peer.member);
  }
  sweep() {
    const now = Date.now();
    for (const [pubkey, peer] of this.peers) {
      this.markRecording(peer);
      if (!peer.open && now - peer.startedAt > CONNECT_TIMEOUT_MS) this.drop(pubkey, false);
      else if (peer.open && now - peer.lastSeen > SILENT_TIMEOUT_MS) this.drop(pubkey, true);
    }
  }
  /** Send your pose to everyone. Call 10–20 times a second, from a timer rather than the render loop. */
  sendPose(pose) {
    if (this.closed) return;
    let packet;
    for (const peer of this.peers.values()) {
      if (peer.open && peer.pose?.readyState === "open" && peer.pose.bufferedAmount < 4096) {
        packet ??= packPose(pose);
        peer.pose.send(packet);
      }
    }
  }
  /** Start or stop sending a microphone track to everyone. */
  async setMicrophone(track) {
    this.mic = track;
    await Promise.all(
      [...this.peers.values()].map(async (peer) => {
        try {
          await this.audioTransceiver(peer.pc)?.sender.replaceTrack(track);
        } catch {
        }
      })
    );
  }
  leave() {
    if (this.closed) return;
    for (const pubkey of this.peers.keys()) {
      try {
        this.publish(buildSignal(this.topic, this.key, pubkey, { t: "bye" }));
      } catch {
      }
    }
    this.closed = true;
    for (const t of this.timers) clearInterval(t);
    removeEventListener("pagehide", this.onPageHide);
    for (const pubkey of [...this.peers.keys()]) this.drop(pubkey, true);
    for (const ws of this.sockets.values()) {
      try {
        ws.close();
      } catch {
      }
    }
    this.sockets.clear();
    this.setStatus("closed");
  }
};
var room = {
  /**
   * Join a peer-to-peer room. Other members will see your IP address, so
   * call this only after the user has agreed.
   */
  async join(opts = {}) {
    if (typeof RTCPeerConnection === "undefined") throw new Error("nswp-sdk: this browser has no WebRTC support");
    const session = new RoomSession(opts);
    session.start();
    return session;
  }
};

// ../Nostr-Spatial-Web-Protocol--NSWP-/packages/sdk/src/turn.ts
import * as THREE4 from "three";
function turnVisitor(rig, camera, degrees) {
  const head = camera.getWorldPosition(new THREE4.Vector3());
  const a = THREE4.MathUtils.degToRad(degrees);
  const dx = rig.position.x - head.x;
  const dz = rig.position.z - head.z;
  rig.position.x = head.x + dx * Math.cos(a) + dz * Math.sin(a);
  rig.position.z = head.z - dx * Math.sin(a) + dz * Math.cos(a);
  rig.rotation.y += a;
}

// ../Nostr-Spatial-Web-Protocol--NSWP-/packages/sdk/src/console.ts
import * as THREE5 from "three";
var W = 1024;
var H = 640;
var FLOAT_W = 0.84;
var WRIST_W = 0.36;
var ASPECT = H / W;
function strokeIcon(g, name, x, y, size) {
  if (!name) return;
  g.save();
  g.translate(x, y);
  g.scale(size / 24, size / 24);
  g.lineWidth = 1.7;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.stroke(new Path2D(ICONS[name]));
  g.restore();
}
function fit(g, text, max) {
  if (g.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && g.measureText(`${t}\u2026`).width > max) t = t.slice(0, -1);
  return `${t.trimEnd()}\u2026`;
}
function wrap(g, text, max, lines) {
  const out = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width <= max || !line) line = next;
    else {
      out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  if (out.length > lines) {
    out.length = lines;
    out[lines - 1] = fit(g, `${out[lines - 1]} \u2026`, max);
  }
  return out;
}
var SANS = 'system-ui, "Segoe UI", Roboto, sans-serif';
var MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
function holoMaterial(map) {
  return new THREE5.ShaderMaterial({
    transparent: true,
    depthTest: false,
    side: THREE5.DoubleSide,
    uniforms: { map: { value: map }, uOpen: { value: 1 }, uTime: { value: 0 }, uAccent: { value: new THREE5.Color() }, uLines: { value: 1 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform sampler2D map; uniform float uOpen; uniform float uTime; uniform vec3 uAccent; uniform float uLines; varying vec2 vUv;
      void main(){
        if (vUv.y > uOpen) discard;
        vec4 c = texture2D(map, vUv);
        float lines = 1.0 - uLines * 0.05 * (0.5 + 0.5 * sin(vUv.y * 420.0 - uTime * 1.2));
        float lead = (1.0 - step(0.999, uOpen)) * smoothstep(0.03, 0.0, uOpen - vUv.y);
        gl_FragColor = vec4(c.rgb * lines + uAccent * lead, max(c.a, lead * 0.9));
        #include <colorspace_fragment>
      }`
  });
}
function createConsole(controls, opts) {
  const group = new THREE5.Group();
  group.name = "nswp-console";
  group.visible = false;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d");
  const texture = new THREE5.CanvasTexture(canvas);
  texture.colorSpace = THREE5.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = holoMaterial(texture);
  const panel = new THREE5.Mesh(new THREE5.PlaneGeometry(1, ASPECT), material);
  panel.renderOrder = 30;
  panel.visible = false;
  group.add(panel);
  const openerCanvas = document.createElement("canvas");
  openerCanvas.width = 256;
  openerCanvas.height = 300;
  const openerTexture = new THREE5.CanvasTexture(openerCanvas);
  openerTexture.colorSpace = THREE5.SRGBColorSpace;
  const opener = new THREE5.Mesh(new THREE5.PlaneGeometry(0.15, 0.15 * 300 / 256), new THREE5.MeshBasicMaterial({ map: openerTexture, transparent: true, depthTest: false }));
  opener.renderOrder = 30;
  group.add(opener);
  let open = false;
  let mount = "floating";
  let section = "";
  let aimed = null;
  let regions = [];
  let painted = "";
  let unfold = 1;
  let clock = 0;
  let sinceRead = 0;
  let placed = false;
  let settling = false;
  let wristFor = 0;
  let wristAway = 0;
  let noteNow = "";
  const paintOpener = (hot) => {
    const t = controls.theme;
    const c = openerCanvas.getContext("2d");
    const w = openerCanvas.width;
    const h = openerCanvas.height;
    c.clearRect(0, 0, w, h);
    c.beginPath();
    c.moveTo(28, h - 44);
    c.lineTo(28, 128);
    c.arc(w / 2, 128, w / 2 - 28, Math.PI, 0);
    c.lineTo(w - 28, h - 44);
    c.closePath();
    c.fillStyle = hot ? `rgba(${rgb(t.accent)}, 0.34)` : `rgba(${rgb(t.glass)}, 0.82)`;
    c.fill();
    c.lineWidth = 6;
    c.strokeStyle = t.accent;
    c.stroke();
    c.fillStyle = hot ? t.accent : t.ink;
    c.fillRect(14, h - 34, w - 28, 8);
    c.strokeStyle = hot ? t.accent : t.ink;
    strokeIcon(c, "menu", w / 2 - 44, 60, 88);
    c.fillStyle = t.ink;
    c.font = `600 40px ${SANS}`;
    c.textAlign = "center";
    c.fillText("Menu", w / 2, 208);
    openerTexture.needsUpdate = true;
  };
  const paint = () => {
    const view = controls.view();
    const t = view.theme;
    if (!view.sections.some((s) => s.id === section)) section = view.sections[0]?.id ?? "";
    const signature = JSON.stringify([view.title, view.address, view.sections, section, aimed, t]);
    if (signature === painted) return;
    painted = signature;
    const A = rgb(t.accent);
    const I = rgb(t.ink);
    const k = Math.min(1.2, t.scale);
    regions = [];
    g.clearRect(0, 0, W, H);
    g.beginPath();
    g.roundRect(4, 4, W - 8, H - 8, [56, 56, 18, 18]);
    g.fillStyle = `rgba(${rgb(t.glass)}, 0.86)`;
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = `rgba(${A}, 0.55)`;
    g.stroke();
    const top = g.createLinearGradient(80, 0, W - 80, 0);
    top.addColorStop(0, `rgba(${A}, 0)`);
    top.addColorStop(0.5, `rgba(${A}, 1)`);
    top.addColorStop(1, `rgba(${A}, 0)`);
    g.fillStyle = top;
    g.fillRect(80, 4, W - 160, 4);
    const mark = g.createLinearGradient(0, 30, 0, 96);
    mark.addColorStop(0, `rgba(${A}, 0.95)`);
    mark.addColorStop(1, `rgba(${A}, 0.25)`);
    g.fillStyle = mark;
    g.beginPath();
    g.roundRect(40, 30, 44, 60, [22, 22, 4, 4]);
    g.fill();
    g.fillStyle = t.ink;
    g.fillRect(32, 94, 60, 4);
    g.textAlign = "left";
    g.textBaseline = "alphabetic";
    g.font = `650 ${Math.round(38 * k)}px ${SANS}`;
    g.fillText(fit(g, view.title, W - 300), 112, 62);
    g.font = `400 ${Math.round(24 * k)}px ${MONO}`;
    g.fillStyle = `rgba(${I}, 0.66)`;
    g.fillText(fit(g, view.address, W - 300), 112, 96);
    const button = (r, draw) => {
      regions.push(r);
      draw(aimed === r.id);
    };
    button({ id: "close", x: W - 150, y: 26, w: 116, h: 72, label: "Close" }, (hot) => {
      g.beginPath();
      g.roundRect(W - 150, 26, 116, 72, 16);
      g.fillStyle = hot ? `rgba(${I}, 0.18)` : `rgba(${I}, 0.05)`;
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = `rgba(${I}, ${hot ? 0.9 : 0.3})`;
      g.stroke();
      g.strokeStyle = t.ink;
      strokeIcon(g, "exit", W - 150 + 38, 26 + 16, 40);
    });
    g.fillStyle = `rgba(${A}, 0.22)`;
    g.fillRect(28, 122, W - 56, 2);
    const tabH = Math.min(88, (H - 150) / Math.max(view.sections.length, 1));
    view.sections.forEach((s, i) => {
      const y = 134 + i * tabH;
      const on = s.id === section;
      button({ id: `tab:${s.id}`, x: 24, y, w: 236, h: tabH - 8, label: s.label }, (hot) => {
        if (on || hot) {
          g.beginPath();
          g.roundRect(24, y, 236, tabH - 8, [6, 18, 18, 6]);
          g.fillStyle = `rgba(${A}, ${on ? 0.16 : 0.08})`;
          g.fill();
        }
        if (on) {
          g.fillStyle = t.accent;
          g.fillRect(24, y, 5, tabH - 8);
        }
        g.strokeStyle = g.fillStyle = on ? t.accent : hot ? t.ink : `rgba(${I}, 0.72)`;
        strokeIcon(g, s.icon, 44, y + (tabH - 8) / 2 - 18, 36);
        g.font = `${on ? 650 : 500} ${Math.round(30 * k)}px ${SANS}`;
        g.textBaseline = "middle";
        g.fillText(fit(g, s.label, 150), 96, y + (tabH - 8) / 2 + 2);
        g.textBaseline = "alphabetic";
      });
    });
    const current = view.sections.find((s) => s.id === section);
    const items = current?.items ?? [];
    noteNow = current?.note ?? "";
    g.font = `400 ${Math.round(24 * k)}px ${SANS}`;
    const noteLines = noteNow ? wrap(g, noteNow, W - 330, 3) : [];
    const noteH = noteLines.length ? noteLines.length * 32 + 20 : 0;
    const left = 284;
    const areaW = W - left - 30;
    const cols = items.length > 8 ? 3 : 2;
    const rowsN = Math.max(1, Math.ceil(items.length / cols));
    const cellW = (areaW - (cols - 1) * 14) / cols;
    const cellH = Math.min(96, (H - 150 - noteH - (rowsN - 1) * 12) / rowsN);
    items.forEach((item, i) => {
      const x = left + i % cols * (cellW + 14);
      const y = 138 + Math.floor(i / cols) * (cellH + 12);
      const tone = item.tone === "warn" ? rgb(t.warn) : A;
      button({ id: `act:${item.id}`, x, y, w: cellW, h: cellH, label: item.label }, (hot) => {
        g.beginPath();
        g.roundRect(x, y, cellW, cellH, [18, 18, 6, 6]);
        g.fillStyle = hot ? `rgba(${tone}, 0.3)` : item.tone === "primary" || item.on ? `rgba(${tone}, 0.16)` : `rgba(${I}, 0.05)`;
        g.fill();
        g.lineWidth = hot ? 4 : 2;
        g.strokeStyle = hot || item.on ? `rgba(${tone}, 1)` : `rgba(${tone}, 0.4)`;
        g.stroke();
        g.fillStyle = item.on ? `rgb(${tone})` : `rgba(${I}, 0.22)`;
        g.fillRect(x + 14, y + cellH - 7, cellW - 28, 3);
        g.strokeStyle = g.fillStyle = item.tone === "warn" ? t.warn : item.on ? t.accent : t.ink;
        const iconSize = Math.min(40, cellH - 30);
        if (item.kind === "swatch") {
          const ink = g.fillStyle;
          g.fillStyle = item.color;
          g.beginPath();
          g.roundRect(x + 20, y + (cellH - iconSize) / 2 - 4, iconSize * 0.78, iconSize, [iconSize * 0.39, iconSize * 0.39, 4, 4]);
          g.fill();
          g.fillStyle = ink;
        } else strokeIcon(g, item.icon, x + 18, y + (cellH - iconSize) / 2 - 2, iconSize);
        const size = Math.round((cols === 3 ? 23 : 28) * k);
        g.font = `600 ${size}px ${SANS}`;
        g.textBaseline = "middle";
        const words = wrap(g, item.label, cellW - iconSize - 44, cellH > 70 ? 2 : 1);
        words.forEach((line, n) => g.fillText(line, x + iconSize + 30, y + cellH / 2 - 2 + (n - (words.length - 1) / 2) * (size + 3)));
        g.textBaseline = "alphabetic";
      });
    });
    if (noteLines.length) {
      const y = H - noteH - 14;
      g.fillStyle = `rgba(${A}, 0.7)`;
      g.fillRect(left, y, 3, noteH - 8);
      g.font = `400 ${Math.round(24 * k)}px ${SANS}`;
      g.fillStyle = `rgba(${I}, 0.82)`;
      noteLines.forEach((line, i) => g.fillText(line, left + 16, y + 24 + i * 32));
    }
    texture.needsUpdate = true;
    material.uniforms.uAccent.value.set(t.accent);
    material.uniforms.uLines.value = t.motion ? 1 : 0;
  };
  const grips = [0, 1].map((i) => {
    const grip = opts.renderer.xr.getControllerGrip(i);
    const info = { grip, hand: "" };
    grip.addEventListener("connected", ((e) => {
      info.hand = e.data?.handedness ?? "";
    }));
    grip.addEventListener("disconnected", (() => {
      info.hand = "";
    }));
    opts.rig.add(grip);
    return info;
  });
  const head = new THREE5.Vector3();
  const facing = new THREE5.Vector3();
  const want = new THREE5.Vector3();
  const hand = new THREE5.Vector3();
  const toHand = new THREE5.Vector3();
  const setOpen = (next, where = "floating") => {
    if (open === next && mount === where) return;
    open = next;
    mount = where;
    placed = false;
    aimed = null;
    unfold = controls.theme.motion && next ? 0 : 1;
    panel.visible = next;
    opener.visible = !next;
    if (next) {
      painted = "";
      paint();
    }
  };
  const stop = controls.subscribe(() => {
    painted = "";
    paintOpener(aimed === "open");
  });
  void stop;
  paintOpener(false);
  const con = {
    group,
    get open() {
      return open;
    },
    setOpen: (next) => setOpen(next, "floating"),
    pick(raycaster) {
      if (!group.visible) return null;
      if (!open) return opener.visible && raycaster.intersectObject(opener, false).length ? "open" : null;
      const hit = raycaster.intersectObject(panel, false)[0];
      if (!hit?.uv) return null;
      const x = hit.uv.x * W;
      const y = (1 - hit.uv.y) * H;
      return regions.find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h)?.id ?? "pane";
    },
    aim(hit) {
      const next = hit === "pane" ? null : hit;
      if (next === aimed) return;
      aimed = next;
      if (open) paint();
      else paintOpener(aimed === "open");
    },
    press(hit) {
      if (hit === "open") return setOpen(true, "floating");
      if (hit === "close") return setOpen(false, mount);
      if (hit.startsWith("tab:")) {
        section = hit.slice(4);
        paint();
        return;
      }
      if (hit.startsWith("act:")) {
        controls.run(hit.slice(4));
        sinceRead = 1;
      }
    },
    update(dt, camera, presenting) {
      if (!presenting) {
        if (group.visible) {
          group.visible = false;
          setOpen(false);
        }
        return;
      }
      clock += dt;
      camera.getWorldPosition(head);
      camera.getWorldDirection(facing);
      const t = controls.theme;
      const presence = controls.presence;
      const tracked = t.wrist === "off" || presence === "hidden" ? void 0 : grips.find((x) => x.hand === t.wrist && x.grip.visible);
      if (tracked) {
        tracked.grip.getWorldPosition(hand);
        toHand.copy(hand).sub(head);
        const far = toHand.length();
        const inView = toHand.normalize().dot(facing);
        if (far < 0.48 && inView > 0.88) {
          wristFor += dt;
          wristAway = 0;
        } else if (far > 0.6 || inView < 0.72) {
          wristAway += dt;
          wristFor = 0;
        }
        if (!open && wristFor > 0.35) setOpen(true, "wrist");
        if (open && mount === "wrist" && wristAway > 0.4) setOpen(false, "wrist");
      } else if (open && mount === "wrist") setOpen(false, "wrist");
      const flat = Math.hypot(facing.x, facing.z) || 1;
      if (open && mount === "wrist" && tracked) {
        want.set(hand.x, hand.y + 0.16, hand.z);
        if (!placed) group.position.copy(want);
        else group.position.lerp(want, Math.min(1, dt * 14));
        placed = true;
        panel.scale.setScalar(WRIST_W);
        group.lookAt(head);
      } else {
        const reach = open ? 1.05 : 0.75;
        want.set(head.x + facing.x / flat * reach, Math.max(0.4, head.y - (open ? 0.18 : 0.52)), head.z + facing.z / flat * reach);
        if (!placed) {
          group.position.copy(want);
          placed = true;
          settling = false;
        } else if (open) {
          if (Math.hypot(head.x - group.position.x, head.z - group.position.z) > 2.6) setOpen(false);
        } else {
          if (group.position.distanceTo(want) > 0.6) settling = true;
          if (settling) {
            group.position.lerp(want, Math.min(1, dt * 6));
            if (group.position.distanceTo(want) < 0.02) settling = false;
          }
        }
        panel.scale.setScalar(FLOAT_W);
        group.rotation.set(0, Math.atan2(head.x - group.position.x, head.z - group.position.z), 0);
      }
      group.visible = true;
      if (open) {
        unfold = Math.min(1, unfold + dt * 4.5);
        material.uniforms.uOpen.value = unfold;
        material.uniforms.uTime.value = t.motion ? clock : 0;
        if ((sinceRead += dt) > 0.3) {
          sinceRead = 0;
          paint();
        }
      } else {
        opener.visible = presence === "full" || presence === "quiet" && !tracked;
        opener.scale.setScalar((presence === "quiet" ? 0.7 : 1) * (aimed === "open" ? 1.1 : 1));
      }
    },
    describe() {
      const view = controls.view();
      const current = view.sections.find((s) => s.id === section) ?? view.sections[0];
      return {
        showing: group.visible,
        open,
        mount,
        section: open ? current?.id ?? "" : "",
        sections: open ? view.sections.map((s) => s.label) : [],
        buttons: open ? current?.items.map((i) => i.label) ?? [] : opener.visible ? ["Menu"] : [],
        note: open ? current?.note ?? "" : ""
      };
    },
    pressLabelled(label) {
      if (!open) {
        if (label !== "Menu" || !opener.visible) return false;
        con.press("open");
        return true;
      }
      paint();
      const region = regions.find((r) => r.label === label);
      if (!region) return false;
      con.press(region.id);
      return true;
    }
  };
  return con;
}

// ../Nostr-Spatial-Web-Protocol--NSWP-/packages/sdk/src/camera.ts
import * as THREE6 from "three";
async function takePicture(renderer, scene, camera, opts = {}) {
  const width = Math.round(opts.width ?? 1920);
  const height = Math.round(opts.height ?? 1080);
  const hidden = (opts.hide ?? []).filter((o) => o.visible);
  const xrWasEnabled = renderer.xr.enabled;
  const previousTarget = renderer.getRenderTarget();
  const target = new THREE6.WebGLRenderTarget(width, height, { samples: 4 });
  target.texture.colorSpace = THREE6.SRGBColorSpace;
  const eye = new THREE6.PerspectiveCamera(camera.fov, width / height, camera.near, camera.far);
  camera.updateWorldMatrix(true, false);
  camera.matrixWorld.decompose(eye.position, eye.quaternion, eye.scale);
  eye.updateMatrixWorld(true);
  try {
    for (const o of hidden) o.visible = false;
    renderer.xr.enabled = false;
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, eye);
    const pixels = new Uint8Array(width * height * 4);
    renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const g = canvas.getContext("2d");
    const image = g.createImageData(width, height);
    for (let y = 0; y < height; y++) image.data.set(pixels.subarray((height - 1 - y) * width * 4, (height - y) * width * 4), y * width * 4);
    g.putImageData(image, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", opts.quality ?? 0.92));
    if (!blob) throw new Error("nswp-sdk: this browser couldn't encode the picture");
    return blob;
  } finally {
    for (const o of hidden) o.visible = true;
    renderer.xr.enabled = xrWasEnabled;
    renderer.setRenderTarget(previousTarget);
    target.dispose();
  }
}
async function takeSelfie(renderer, scene, head, look, opts = {}) {
  head.updateWorldMatrix(true, false);
  const at = new THREE6.Vector3();
  const facing = new THREE6.Quaternion();
  head.matrixWorld.decompose(at, facing, new THREE6.Vector3());
  const ahead = new THREE6.Vector3(0, 0, -1).applyQuaternion(facing).setY(0);
  if (ahead.lengthSq() < 1e-6) ahead.set(0, 0, -1);
  ahead.normalize();
  const figure = createFigure(look);
  figure.group.position.copy(at);
  figure.group.rotation.y = Math.atan2(-ahead.x, -ahead.z);
  scene.add(figure.group);
  const eye = new THREE6.PerspectiveCamera(58, 1, 0.05, head.far);
  eye.position.copy(at).addScaledVector(ahead, opts.reach ?? 1.7);
  eye.position.y = at.y + 0.08;
  eye.lookAt(at.x, at.y - 0.22, at.z);
  try {
    return await takePicture(renderer, scene, eye, { width: 1600, height: 1200, ...opts });
  } finally {
    scene.remove(figure.group);
    figure.dispose();
  }
}
function canRecord() {
  return typeof MediaRecorder !== "undefined" && typeof HTMLCanvasElement !== "undefined" && "captureStream" in HTMLCanvasElement.prototype;
}
function recordClip(canvas, opts = {}) {
  if (!canRecord()) throw new Error("nswp-sdk: this browser can't record its canvas");
  const type = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
  const stream = canvas.captureStream(opts.fps ?? 30);
  const recorder = new MediaRecorder(stream, { ...type ? { mimeType: type } : {}, videoBitsPerSecond: 6e6 });
  const parts = [];
  const started = performance.now();
  recorder.ondataavailable = (e) => {
    if (e.data.size) parts.push(e.data);
  };
  const done = new Promise((resolve) => {
    recorder.onstop = () => {
      for (const track of stream.getTracks()) track.stop();
      resolve(new Blob(parts, { type: recorder.mimeType || type || "video/webm" }));
    };
  });
  recorder.start(500);
  const limit = setTimeout(() => recorder.state !== "inactive" && recorder.stop(), (opts.maxSeconds ?? 30) * 1e3);
  return {
    done,
    seconds: () => (performance.now() - started) / 1e3,
    stop() {
      clearTimeout(limit);
      if (recorder.state !== "inactive") recorder.stop();
      return done;
    }
  };
}
function saveFile(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3e4);
}
var stamp = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/[T:]/g, "-");
var slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "world";
function addCameraControls(controls, d) {
  const name = slug(d.name ?? "world");
  const presenting = () => d.renderer.xr.isPresenting;
  const kept = [];
  let clip = null;
  const plain = `plain-${Math.random().toString(36).slice(2, 12)}`;
  let last = "Pictures and clips are saved to this device. Nothing is sent anywhere.";
  const tell = (text) => {
    last = text;
    controls.say(text);
  };
  let latest = null;
  const keep = (capture) => {
    latest = capture;
    if (presenting()) {
      kept.push(capture);
      tell(`Kept. Save ${kept.length === 1 ? "it" : `all ${kept.length}`} from the Camera menu when you leave VR.`);
    } else {
      saveFile(capture.blob, capture.name);
      tell(capture.kind === "clip" ? "Clip saved to this device." : "Picture saved to this device.");
    }
  };
  const shoot = async (kind) => {
    try {
      const hide = d.hide?.() ?? [];
      const blob = kind === "selfie" ? await takeSelfie(d.renderer, d.scene, d.camera, d.look?.() ?? plain, { hide }) : await takePicture(d.renderer, d.scene, d.camera, { hide });
      keep({ kind, blob, name: `${name}-${kind === "selfie" ? "selfie-" : ""}${stamp()}.jpg` });
    } catch {
      tell("That picture couldn't be taken on this device.");
    }
  };
  const finish = (blob) => {
    clip = null;
    d.recording?.(false);
    keep({ kind: "clip", blob, name: `${name}-clip-${stamp()}.${blob.type.includes("mp4") ? "mp4" : "webm"}` });
  };
  controls.addSection({ id: "camera", label: "Camera", icon: "camera", note: () => clip ? `Recording: ${Math.floor(clip.seconds())} s. Others in the room can see that you are.` : last });
  controls.add(
    { id: "camera-picture", section: "camera", icon: "camera", label: "Take a picture", short: "Picture", act: () => shoot("picture") },
    { id: "camera-selfie", section: "camera", icon: "selfie", label: "Take a selfie", short: "Selfie", act: () => shoot("selfie") },
    {
      id: "camera-clip",
      section: "camera",
      icon: "record",
      label: () => clip ? "Stop recording" : "Record a clip",
      short: () => clip ? "Stop" : "Clip",
      on: () => !!clip,
      tone: "warn",
      // The page's canvas isn't what a headset is shown, so there is nothing to record there.
      hidden: () => !canRecord() || presenting() && !clip,
      act: async () => {
        if (clip) return void clip.stop();
        try {
          clip = recordClip(d.renderer.domElement, { maxSeconds: d.maxSeconds ?? 30 });
          d.recording?.(true);
          tell(`Recording, picture only, for up to ${d.maxSeconds ?? 30} seconds. Others in the room can see that you are.`);
          void clip.done.then(finish);
        } catch {
          clip = null;
          tell("This device can't record a clip.");
        }
      }
    },
    {
      id: "camera-save",
      section: "camera",
      icon: "save",
      label: () => kept.length === 1 ? "Save 1 picture" : `Save ${kept.length} pictures`,
      short: "Save",
      tone: "primary",
      hidden: () => kept.length === 0 || presenting(),
      act: () => {
        for (const c of kept.splice(0)) saveFile(c.blob, c.name);
        tell("Saved to this device.");
      }
    }
  );
  return {
    waiting: () => [...kept],
    last: () => latest,
    get recording() {
      return !!clip;
    }
  };
}

// ../Nostr-Spatial-Web-Protocol--NSWP-/packages/sdk/src/three.ts
var SEND_EVERY_MS = 66;
var FADE_START = 0.9;
var FADE_END = 0.45;
var TOO_CLOSE = 1;
var ARRIVAL_GAP = 1.4;
function textSprite(text, color, width) {
  const lines = text.split("\n");
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 64 + lines.length * 72;
  const g = canvas.getContext("2d");
  g.fillStyle = "rgba(10,12,18,0.72)";
  g.beginPath();
  g.roundRect(0, 0, canvas.width, canvas.height, 32);
  g.fill();
  g.fillStyle = color;
  g.textBaseline = "top";
  lines.forEach((line, i) => {
    g.font = i === 0 ? "bold 56px system-ui, sans-serif" : "44px system-ui, sans-serif";
    g.fillText(line, 40, 32 + i * 72, canvas.width - 80);
  });
  const tex = new THREE7.CanvasTexture(canvas);
  tex.colorSpace = THREE7.SRGBColorSpace;
  const sprite = new THREE7.Sprite(new THREE7.SpriteMaterial({ map: tex, depthWrite: false }));
  sprite.scale.set(width, width * canvas.height / canvas.width, 1);
  return sprite;
}
function createPresence(d) {
  const labelColor = d.labelColor ?? "#ffffff";
  const changed = () => d.onChange?.();
  const listener = new THREE7.AudioListener();
  d.camera.add(listener);
  const avatars = /* @__PURE__ */ new Map();
  const pendingStreams = /* @__PURE__ */ new Map();
  let session = null;
  let roomName = null;
  let sendTimer;
  let micTrack = null;
  let offsetApplied = false;
  let plainSeed;
  let dot = null;
  const glow = (color) => {
    if (!dot) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 64;
      const g = canvas.getContext("2d");
      const fade = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      fade.addColorStop(0, "rgba(255,255,255,1)");
      fade.addColorStop(0.35, "rgba(255,255,255,0.85)");
      fade.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = fade;
      g.fillRect(0, 0, 64, 64);
      dot = new THREE7.CanvasTexture(canvas);
    }
    return new THREE7.Sprite(new THREE7.SpriteMaterial({ map: dot, color, transparent: true, depthWrite: false }));
  };
  const showRecording = (a, on) => {
    if (on && !a.light) {
      a.light = glow(16726832);
      a.light.scale.setScalar(0.16);
      a.light.position.set(0, 0.46, 0);
    }
    if (a.light) {
      a.light.visible = on;
      a.head.add(a.light);
    }
  };
  const dress = (a, look) => {
    const was = a.figure;
    const figure = createFigure(look, d.figureStyle);
    figure.head.position.copy(was?.head.position ?? figure.head.position);
    figure.head.quaternion.copy(was?.head.quaternion ?? figure.head.quaternion);
    figure.head.add(a.label);
    figure.hands.forEach((h, i) => {
      h.visible = was?.hands[i].visible ?? false;
      if (was) {
        h.position.copy(was.hands[i].position);
        h.quaternion.copy(was.hands[i].quaternion);
      }
    });
    if (was) {
      if (a.audio) figure.head.add(a.audio);
      a.root.remove(was.group);
      was.dispose();
    }
    if (a.light) figure.head.add(a.light);
    if (a.beam) figure.head.add(a.beam);
    a.root.add(figure.group);
    a.figure = figure;
    a.head = figure.head;
    a.torso = figure.torso;
    a.hands = figure.hands;
    a.materials = [figure.metal, a.label.material].map((material) => {
      const opacity = material === a.label.material ? 1 : material.opacity;
      material.transparent = true;
      return { material, opacity };
    });
  };
  const makeAvatar = (member) => {
    const root = new THREE7.Group();
    root.visible = false;
    const label = textSprite(member.name, labelColor, 0.5);
    label.position.set(0, 0.3, 0);
    d.scene.add(root);
    const a = { member, root, label, target: null, placed: false };
    dress(a, member.look);
    return a;
  };
  const attachAudio = (avatar, stream) => {
    if (avatar.audio) return;
    const el = new Audio();
    el.muted = true;
    el.srcObject = stream;
    void el.play().catch(() => {
    });
    const pa = new THREE7.PositionalAudio(listener);
    pa.setMediaStreamSource(stream);
    pa.setRefDistance(1.5);
    pa.setRolloffFactor(1.2);
    avatar.head.add(pa);
    const analyser = listener.context.createAnalyser();
    analyser.fftSize = 512;
    listener.context.createMediaStreamSource(stream).connect(analyser);
    avatar.audio = pa;
    avatar.element = el;
    avatar.analyser = analyser;
  };
  const removeAvatar = (pubkey) => {
    const a = avatars.get(pubkey);
    if (!a) return;
    avatars.delete(pubkey);
    a.audio?.disconnect();
    if (a.element) a.element.srcObject = null;
    d.scene.remove(a.root);
    a.figure.dispose();
  };
  const v = new THREE7.Vector3();
  const q = new THREE7.Quaternion();
  const worldTransform = (o) => {
    o.getWorldPosition(v);
    o.getWorldQuaternion(q);
    return { position: [v.x, v.y, v.z], quaternion: [q.x, q.y, q.z, q.w] };
  };
  const ownPose = () => {
    const pose = { head: worldTransform(d.camera) };
    if (d.renderer.xr.isPresenting) {
      if (d.controllers[0]?.visible) pose.left = worldTransform(d.controllers[0]);
      if (d.controllers[1]?.visible) pose.right = worldTransform(d.controllers[1]);
    }
    return pose;
  };
  const stepApart = (self, other, pose) => {
    if (self < other || d.renderer.xr.isPresenting) return;
    d.camera.getWorldPosition(v);
    const dx = v.x - pose.head.position[0];
    const dz = v.z - pose.head.position[2];
    const dist = Math.hypot(dx, dz);
    if (dist >= TOO_CLOSE) return;
    const ux = dist > 0.01 ? dx / dist : 1;
    const uz = dist > 0.01 ? dz / dist : 0;
    d.rig.position.x += ux * (ARRIVAL_GAP - dist);
    d.rig.position.z += uz * (ARRIVAL_GAP - dist);
  };
  const leave = () => {
    if (sendTimer) clearInterval(sendTimer);
    sendTimer = void 0;
    session?.leave();
    session = null;
    for (const key of [...avatars.keys()]) removeAvatar(key);
    pendingStreams.clear();
    changed();
  };
  const join = async (name) => {
    leave();
    roomName = name;
    void listener.context.resume();
    const look = typeof d.look === "function" ? d.look() : d.look;
    const s = await room.join({ ...name ? { name } : {}, ...look ? { look } : {} });
    session = s;
    if (!offsetApplied) {
      const off = spawnOffset(s.self.pubkey);
      d.rig.position.x += off.x;
      d.rig.position.z += off.z;
      offsetApplied = true;
    }
    s.on("status", changed);
    s.on("recording", (m, on) => {
      const a = avatars.get(m.pubkey);
      if (a) showRecording(a, on);
      changed();
    });
    s.on("look", (m, look2) => {
      const a = avatars.get(m.pubkey);
      if (a) dress(a, look2);
      changed();
    });
    s.on("member", (m) => {
      const a = makeAvatar(m);
      avatars.set(m.pubkey, a);
      const pending = pendingStreams.get(m.pubkey);
      if (pending) attachAudio(a, pending);
      changed();
    });
    s.on("leave", (m) => {
      removeAvatar(m.pubkey);
      pendingStreams.delete(m.pubkey);
      changed();
    });
    s.on("pose", (m, pose) => {
      const a = avatars.get(m.pubkey);
      if (!a) return;
      if (!a.target) stepApart(s.self.pubkey, m.pubkey, pose);
      a.target = pose;
    });
    s.on("audio", (m, stream) => {
      pendingStreams.set(m.pubkey, stream);
      const a = avatars.get(m.pubkey);
      if (a) attachAudio(a, stream);
    });
    if (micTrack) await s.setMicrophone(micTrack);
    sendTimer = setInterval(() => s.sendPose(ownPose()), SEND_EVERY_MS);
    changed();
  };
  const tp = new THREE7.Vector3();
  const tq = new THREE7.Quaternion();
  const euler = new THREE7.Euler();
  const apply = (o, t, k) => {
    o.position.lerp(tp.set(...t.position), k);
    o.quaternion.slerp(tq.set(...t.quaternion), k);
  };
  return {
    get session() {
      return session;
    },
    get roomName() {
      return roomName;
    },
    get micOn() {
      return !!micTrack;
    },
    join,
    leave,
    async setMicrophone(track) {
      if (!track && micTrack) micTrack.stop();
      micTrack = track;
      await session?.setMicrophone(track);
      changed();
    },
    setRecording(on) {
      session?.setRecording(on);
    },
    selfLook() {
      if (session) return session.self.look;
      const mine = typeof d.look === "function" ? d.look() : d.look;
      const read = mine ? decodeLook2(mine) : null;
      return read?.ok ? read.value.look : plainSeed ??= `plain-${Math.random().toString(36).slice(2, 12)}`;
    },
    pointOut(pubkey) {
      const a = avatars.get(pubkey);
      if (!a) return;
      if (!a.beam) {
        a.beam = glow(a.member.look.light);
        a.beam.scale.set(0.5, 3.2, 1);
        a.beam.position.set(0, 2.1, 0);
      }
      a.head.add(a.beam);
      a.beam.visible = true;
      a.beamUntil = performance.now() + 4e3;
    },
    people() {
      return [...avatars.values()].map((a) => a.member);
    },
    testTone() {
      const ctx = listener.context;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.2;
      const dest = ctx.createMediaStreamDestination();
      osc.connect(gain).connect(dest);
      osc.start();
      return dest.stream.getAudioTracks()[0];
    },
    update(dt) {
      const k = 1 - Math.exp(-dt * 14);
      d.camera.getWorldPosition(v);
      for (const a of avatars.values()) {
        if (!a.target) continue;
        const near = THREE7.MathUtils.clamp((a.head.position.distanceTo(v) - FADE_END) / (FADE_START - FADE_END), 0, 1);
        for (const m of a.materials) m.material.opacity = m.opacity * near;
        a.materials[0].material.tick?.(performance.now() / 1e3);
        if (a.beam?.visible && performance.now() > (a.beamUntil ?? 0)) a.beam.visible = false;
        const snap = a.placed ? k : 1;
        apply(a.head, a.target.head, snap);
        a.placed = true;
        a.root.visible = true;
        euler.setFromQuaternion(a.head.quaternion, "YXZ");
        a.torso.position.set(a.head.position.x, a.head.position.y - 0.45, a.head.position.z);
        a.torso.rotation.set(0, euler.y, 0);
        const hands = [a.target.left, a.target.right];
        hands.forEach((t, i) => {
          const mesh = a.hands[i];
          if (t) {
            apply(mesh, t, mesh.visible ? k : 1);
            mesh.visible = true;
          } else mesh.visible = false;
        });
      }
    },
    info() {
      const buf = new Float32Array(512);
      return [...avatars.values()].map((a) => {
        let level = 0;
        if (a.analyser) {
          a.analyser.getFloatTimeDomainData(buf);
          level = Math.sqrt(buf.reduce((s, x) => s + x * x, 0) / buf.length);
        }
        return {
          pubkey: a.member.pubkey,
          name: a.member.name,
          visible: a.root.visible,
          opacity: Math.round((a.materials[0]?.material.opacity ?? 1) * 100) / 100,
          head: a.target?.head.position.map((n) => Math.round(n * 100) / 100) ?? null,
          hands: [!!a.target?.left, !!a.target?.right],
          audioLevel: Math.round(level * 1e3) / 1e3,
          look: a.member.look
        };
      });
    }
  };
}
function roomNameFromHash(hash) {
  for (const part of hash.replace(/^#/, "").split("&")) {
    if (part.startsWith("room=")) {
      try {
        const v = decodeURIComponent(part.slice(5));
        if (/^[A-Za-z0-9_-]{4,48}$/.test(v)) return v;
      } catch {
      }
    }
  }
  return null;
}
async function capturePanorama(renderer, scene, position, opts = {}) {
  const width = Math.min(4096, Math.max(256, Math.round(opts.width ?? 2048)));
  const height = width / 2;
  const hidden = (opts.hide ?? []).filter((o) => o.visible);
  const xrWasEnabled = renderer.xr.enabled;
  const previousTarget = renderer.getRenderTarget();
  const autoClearWas = renderer.autoClear;
  const fog = scene.fog;
  const faceTarget = new THREE7.WebGLRenderTarget(Math.min(2048, width / 2), Math.min(2048, width / 2), { type: THREE7.HalfFloatType });
  const flatTarget = new THREE7.WebGLRenderTarget(width, height);
  flatTarget.texture.colorSpace = THREE7.SRGBColorSpace;
  const material = new THREE7.ShaderMaterial({
    uniforms: { face: { value: faceTarget.texture }, forward: { value: new THREE7.Vector3() }, up: { value: new THREE7.Vector3() }, right: { value: new THREE7.Vector3() } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `uniform sampler2D face; uniform vec3 forward; uniform vec3 up; uniform vec3 right; varying vec2 vUv;
      void main(){
        float lon = (vUv.x - 0.5) * 6.283185307179586;
        float lat = (vUv.y - 0.5) * 3.141592653589793;
        vec3 dir = vec3(sin(lon) * cos(lat), sin(lat), -cos(lon) * cos(lat));
        float along = dot(dir, forward);
        // Only the directions this view is the best one for (with a hair of overlap).
        if (along < max(abs(dir.x), max(abs(dir.y), abs(dir.z))) - 0.0005) discard;
        vec2 p = vec2(dot(dir, right), dot(dir, up)) / along;
        gl_FragColor = texture2D(face, clamp(p * 0.5 + 0.5, 0.0, 1.0));
        #include <colorspace_fragment>
      }`,
    depthTest: false,
    depthWrite: false
  });
  const quad = new THREE7.Mesh(new THREE7.PlaneGeometry(2, 2), material);
  const quadScene = new THREE7.Scene();
  quadScene.add(quad);
  const quadCamera = new THREE7.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const faceCamera = new THREE7.PerspectiveCamera(90, 1, 0.05, 700);
  faceCamera.position.copy(position);
  const views = [
    [new THREE7.Vector3(0, 0, -1), new THREE7.Vector3(0, 1, 0)],
    [new THREE7.Vector3(1, 0, 0), new THREE7.Vector3(0, 1, 0)],
    [new THREE7.Vector3(0, 0, 1), new THREE7.Vector3(0, 1, 0)],
    [new THREE7.Vector3(-1, 0, 0), new THREE7.Vector3(0, 1, 0)],
    [new THREE7.Vector3(0, 1, 0), new THREE7.Vector3(0, 0, 1)],
    [new THREE7.Vector3(0, -1, 0), new THREE7.Vector3(0, 0, -1)]
  ];
  try {
    for (const o of hidden) o.visible = false;
    scene.fog = null;
    renderer.xr.enabled = false;
    renderer.setRenderTarget(flatTarget);
    renderer.clear();
    for (const [forward, up] of views) {
      faceCamera.up.copy(up);
      faceCamera.lookAt(position.clone().add(forward));
      faceCamera.updateMatrixWorld(true);
      renderer.autoClear = true;
      renderer.setRenderTarget(faceTarget);
      renderer.render(scene, faceCamera);
      material.uniforms.forward.value.copy(forward);
      material.uniforms.up.value.copy(up);
      material.uniforms.right.value.crossVectors(forward, up);
      renderer.autoClear = false;
      renderer.setRenderTarget(flatTarget);
      renderer.render(quadScene, quadCamera);
    }
    const pixels = new Uint8Array(width * height * 4);
    renderer.readRenderTargetPixels(flatTarget, 0, 0, width, height, pixels);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const g = canvas.getContext("2d");
    const image = g.createImageData(width, height);
    for (let y = 0; y < height; y++) image.data.set(pixels.subarray((height - 1 - y) * width * 4, (height - y) * width * 4), y * width * 4);
    g.putImageData(image, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", opts.quality ?? 0.82));
    if (!blob) throw new Error("nswp-sdk: this browser couldn't encode the preview");
    return blob;
  } finally {
    for (const o of hidden) o.visible = true;
    scene.fog = fog;
    renderer.xr.enabled = xrWasEnabled;
    renderer.autoClear = autoClearWas;
    renderer.setRenderTarget(previousTarget);
    faceTarget.dispose();
    flatTarget.dispose();
    material.dispose();
    quad.geometry.dispose();
  }
}
function panoramaTexture(image) {
  const texture = new THREE7.Texture(image);
  texture.colorSpace = THREE7.SRGBColorSpace;
  texture.wrapS = THREE7.RepeatWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = THREE7.LinearFilter;
  texture.magFilter = THREE7.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
function createPortalWindow(geometry, pano, opts = {}) {
  const reach = opts.reach ?? 1.5;
  const material = new THREE7.ShaderMaterial({
    uniforms: {
      pano: { value: pano },
      mask: { value: opts.mask ?? null },
      useMask: { value: opts.mask ? 1 : 0 },
      toLocal: { value: new THREE7.Matrix3() },
      center: { value: new THREE7.Vector3() },
      reach: { value: Number.isFinite(reach) ? reach : 0 }
    },
    vertexShader: `varying vec3 vWorld; varying vec2 vUv;
      void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D pano; uniform sampler2D mask; uniform float useMask; uniform mat3 toLocal; uniform vec3 center; uniform float reach;
      varying vec3 vWorld; varying vec2 vUv;
      void main(){
        if (useMask > 0.5 && texture2D(mask, vUv).a < 0.5) discard;
        vec3 eye = cameraPosition;
        if (reach > 0.0) {
          vec3 away = cameraPosition - center;
          eye = center + away * (reach / (length(away) + reach));
        }
        vec3 dir = normalize(toLocal * (vWorld - eye));
        float lon = atan(dir.x, -dir.z);
        float lat = asin(clamp(dir.y, -1.0, 1.0));
        gl_FragColor = vec4(texture2D(pano, vec2(lon / 6.283185307179586 + 0.5, lat / 3.141592653589793 + 0.5)).rgb, 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE7.DoubleSide
  });
  const mesh = new THREE7.Mesh(geometry, material);
  const rotation = new THREE7.Matrix4();
  mesh.onBeforeRender = () => {
    rotation.extractRotation(mesh.matrixWorld);
    material.uniforms.toLocal.value.setFromMatrix4(rotation).invert();
    material.uniforms.center.value.setFromMatrixPosition(mesh.matrixWorld);
  };
  return mesh;
}
function addRoomControls(controls, presence, opts = {}) {
  const useTone = new URLSearchParams(opts.search ?? location.search).get("mic") === "tone";
  let invited = roomNameFromHash(location.hash);
  let busy = false;
  let last = invited ? "You were invited to a private room. Joining shows your IP address to the others in it." : "Joining lets you see and hear others here. It shows your IP address to them.";
  const tell = (text) => {
    last = text;
    controls.say(text);
  };
  const status = () => {
    const s = presence.session;
    if (!s) return last;
    const others = s.members.length;
    const who = s.status === "no-relays" ? "can't reach any relay" : others === 0 ? "nobody else here yet" : others === 1 ? "1 other person here" : `${others} other people here`;
    return `${presence.roomName ? "Private room" : "Open room"}: ${who}.${presence.micOn ? " Your microphone is on." : ""}`;
  };
  const refresh = () => {
    const s = presence.session;
    opts.onState?.(
      s ? { name: s.name, private: !!presence.roomName, status: s.status, self: s.self.pubkey, members: s.members.map((m) => m.pubkey), relays: s.relayCount, mic: presence.micOn } : null
    );
    controls.addSection({ id: "room", label: "Room", icon: "room", note: status });
    people();
  };
  let listed = [];
  const recorders = /* @__PURE__ */ new Set();
  const people = () => {
    const here = presence.session ? presence.people() : [];
    for (const id of listed) controls.remove(id);
    listed = here.map((m) => `person-${m.pubkey.slice(0, 12)}`);
    controls.addSection({
      id: "people",
      label: "People",
      icon: "people",
      note: () => !presence.session ? "Join the room to see who else is here." : here.length === 0 ? "Nobody else is here yet." : `${here.length === 1 ? "1 person is" : `${here.length} people are`} here with you. Select one to see where they are.`
    });
    here.forEach(
      (m, i) => controls.add({
        id: listed[i],
        section: "people",
        kind: "swatch",
        color: m.look.light,
        label: () => m.recording ? `${m.name}, recording` : m.name,
        act: () => {
          presence.pointOut(m.pubkey);
          controls.say(`${m.name} is under the column of light.`);
        }
      })
    );
    for (const m of here) {
      if (m.recording && !recorders.has(m.pubkey)) controls.say(`${m.name} is recording what they see.`);
      if (m.recording) recorders.add(m.pubkey);
      else recorders.delete(m.pubkey);
    }
  };
  controls.add(
    {
      id: "room-join",
      section: "room",
      hotbar: true,
      icon: () => presence.session ? "leave" : "room",
      label: () => presence.session ? "Leave the room" : "Join the room",
      short: () => presence.session ? "Leave" : "Join",
      on: () => !!presence.session,
      hidden: () => busy,
      act: async () => {
        if (presence.session) {
          presence.leave();
          tell("You left the room.");
          return refresh();
        }
        busy = true;
        try {
          await presence.join(invited);
        } catch (err) {
          tell(`Couldn't join: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
          busy = false;
          refresh();
        }
      }
    },
    {
      id: "room-mic",
      section: "room",
      hotbar: true,
      icon: () => presence.micOn ? "mic" : "micOff",
      label: () => presence.micOn ? "Turn microphone off" : "Turn microphone on",
      short: "Mic",
      on: () => presence.micOn,
      hidden: () => !presence.session,
      act: async () => {
        if (presence.micOn) await presence.setMicrophone(null);
        else {
          try {
            const track = useTone ? presence.testTone() : (await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })).getAudioTracks()[0];
            await presence.setMicrophone(track);
          } catch {
            tell("The microphone is blocked or unavailable.");
          }
        }
        refresh();
      }
    },
    {
      id: "room-invite",
      section: "room",
      icon: "link",
      label: () => presence.roomName ? "Copy invite link" : "Make a private room",
      hidden: () => !presence.session,
      act: async () => {
        if (!presence.roomName) {
          const bytes = crypto.getRandomValues(new Uint8Array(9));
          const code = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_");
          history.replaceState(history.state, "", `${location.pathname}${location.search}#room=${code}`);
          invited = code;
          await presence.join(code);
        }
        try {
          await navigator.clipboard.writeText(location.href);
          tell("Invite link copied. Anyone with it can join.");
        } catch {
          tell("Copy this page's address to invite someone.");
        }
        refresh();
      }
    }
  );
  refresh();
  return { refresh };
}
async function addViewControls(controls, d) {
  const xr = navigator.xr;
  let supported = false;
  try {
    supported = xr ? await xr.isSessionSupported("immersive-vr") : false;
  } catch {
  }
  const presenting = () => d.renderer.xr.isPresenting;
  d.renderer.xr.addEventListener("sessionstart", () => d.hud?.setHidden(true));
  d.renderer.xr.addEventListener("sessionend", () => d.hud?.setHidden(false));
  controls.add(
    {
      id: "vr",
      section: "view",
      icon: "vr",
      tone: "primary",
      hotbar: true,
      hidden: () => !supported,
      label: () => presenting() ? "Leave VR" : "Enter VR",
      short: "VR",
      act: async () => {
        if (presenting()) return void await d.renderer.xr.getSession()?.end();
        try {
          const session = await xr.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "hand-tracking"] });
          await d.renderer.xr.setSession(session);
          d.onState?.("presenting");
          session.addEventListener("end", () => d.onState?.("ended"));
        } catch (err) {
          d.onState?.(`error: ${err instanceof Error ? err.message : String(err)}`);
          controls.say("Couldn't start VR on this device.");
        }
      }
    },
    { id: "turn", section: "view", icon: "turn", label: "Turn around", act: () => turnVisitor(d.rig, d.camera, 180) }
  );
  controls.addSection({
    id: "view",
    label: "View",
    icon: "vr",
    note: supported ? "In a headset, raise your wrist or select the small Menu button low in front of you to reach these controls." : "This device can't enter VR. Everything here works without it."
  });
  return supported;
}

export {
  SKY_GLSL,
  createAlloy,
  MeshBuilder,
  createFigure,
  turnVisitor,
  createConsole,
  takePicture,
  takeSelfie,
  canRecord,
  recordClip,
  saveFile,
  addCameraControls,
  textSprite,
  createPresence,
  capturePanorama,
  panoramaTexture,
  createPortalWindow,
  addRoomControls,
  addViewControls
};
