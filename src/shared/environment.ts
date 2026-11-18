/**
 * The ground BitPortal stands on: a dark plane ruled with a grid of light that
 * runs to the horizon, a low glow where it ends, and a skyline of blocks.
 *
 * It is the look of every place BitPortal draws itself: the room, and the
 * live room on the landing page. Three draw calls, no textures, nothing
 * fetched, so it costs a headset almost nothing.
 */
import * as THREE from "three";

export interface Environment {
  group: THREE.Group;
  /** Call each frame with seconds since the start. Pass 0 always to keep it still. */
  update(t: number): void;
}

/** A small, repeatable random number source: the skyline is the same on every visit. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function createEnvironment(accent: THREE.ColorRepresentation, opts: { ground?: THREE.ColorRepresentation; clear?: number } = {}): Environment {
  const group = new THREE.Group();
  group.name = "environment";
  const glow = new THREE.Color(accent);
  const ground = new THREE.Color(opts.ground ?? 0x04070b);
  const clear = opts.clear ?? 14; // metres round the middle that the nearest blocks keep well back from

  // ------------------------------------------------------------ the grid
  // Lines are worked out per pixel from the ground position, so they stay one
  // pixel sharp at any distance instead of shimmering like a textured grid.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.ShaderMaterial({
      uniforms: { uGlow: { value: glow }, uGround: { value: ground }, uTime: { value: 0 } },
      vertexShader: "varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader: `uniform vec3 uGlow; uniform vec3 uGround; uniform float uTime; varying vec3 vWorld;
        float grid(vec2 p, float size){
          vec2 q = p / size;
          vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
          return 1.0 - min(min(g.x, g.y), 1.0);
        }
        void main(){
          vec2 p = vWorld.xz;
          float far = length(p - cameraPosition.xz);
          float fine = grid(p, 1.0) * exp(-far * 0.085);
          float wide = grid(p, 8.0) * exp(-far * 0.022);
          // A slow ring of light that travels out across the floor.
          float ring = smoothstep(2.6, 0.0, abs(far - mod(uTime * 5.0, 90.0))) * exp(-far * 0.03);
          float light = fine * 0.3 + wide * 0.85 + ring * (0.12 + fine * 0.5);
          vec3 c = uGround + uGlow * light;
          // Towards the horizon the floor itself takes on the glow.
          c += uGlow * 0.07 * smoothstep(40.0, 260.0, far);
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.004; // a hair above a home's own floor, which it replaces
  floor.renderOrder = -2;
  group.add(floor);

  // ---------------------------------------------------- the horizon's glow
  const horizon = new THREE.Mesh(
    new THREE.CylinderGeometry(280, 280, 90, 64, 1, true),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      fog: false,
      uniforms: { uGlow: { value: glow } },
      vertexShader: "varying float vY; void main(){ vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 uGlow; varying float vY;
        void main(){
          float low = pow(1.0 - vY, 5.0);
          gl_FragColor = vec4(uGlow * (0.55 * low + 0.9 * pow(1.0 - vY, 26.0)), low);
          #include <colorspace_fragment>
        }`,
    }),
  );
  horizon.position.y = 45;
  horizon.renderOrder = -3;
  group.add(horizon);

  // ------------------------------------------------------- the skyline
  // Blocks on a two-metre lattice, dark with lit edges: built from the same
  // unit as the grid they stand on.
  const rand = seeded(20261117);
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const edge = new THREE.EdgesGeometry(unit).getAttribute("position").array as Float32Array;
  const COUNT = 84;
  const fills = new THREE.InstancedMesh(unit, new THREE.MeshBasicMaterial({ color: ground.clone().multiplyScalar(1.5) }), COUNT);
  const lines = new Float32Array(COUNT * edge.length);
  const m = new THREE.Matrix4();
  const v = new THREE.Vector3();
  for (let i = 0; i < COUNT; i++) {
    const angle = rand() * Math.PI * 2;
    const out = clear + 34 + rand() * rand() * 170;
    const snap = (n: number) => Math.round(n / 2) * 2;
    const w = 2 + Math.floor(rand() * 3) * 2;
    const d = 2 + Math.floor(rand() * 3) * 2;
    // Low near the middle, taller far off: a skyline to stand in front of, not walls to stand between.
    const h = 2 + Math.floor(rand() * rand() * (out > 110 ? 16 : 6)) * 2;
    m.compose(new THREE.Vector3(snap(Math.sin(angle) * out), h / 2, snap(Math.cos(angle) * out)), new THREE.Quaternion(), new THREE.Vector3(w, h, d));
    fills.setMatrixAt(i, m);
    for (let k = 0; k < edge.length; k += 3) {
      v.set(edge[k]!, edge[k + 1]!, edge[k + 2]!).applyMatrix4(m);
      lines.set([v.x, v.y, v.z], i * edge.length + k);
    }
  }
  fills.instanceMatrix.needsUpdate = true;
  const outline = new THREE.BufferGeometry();
  outline.setAttribute("position", new THREE.BufferAttribute(lines, 3));
  group.add(fills, new THREE.LineSegments(outline, new THREE.LineBasicMaterial({ color: glow, transparent: true, opacity: 0.4 })));

  const uniforms = (floor.material as THREE.ShaderMaterial).uniforms;
  return {
    group,
    update(t) {
      uniforms.uTime!.value = t;
    },
  };
}
