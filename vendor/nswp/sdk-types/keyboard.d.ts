/**
 * A keyboard to type on inside a headset.
 *
 * It is drawn by the page, in the scene, so it works on every headset: the
 * keys are pressed with a select, like everything else. A real keyboard
 * joined to the headset types into it as well, and so does a paste. Where a
 * headset's browser offers its own keyboard to a page, one key hands over to
 * it; that is the visitor's choice, because few browsers have it and it has
 * been tried on none here.
 *
 *   const keyboard = createKeyboard({ scene, camera, accent });
 *   const text = await keyboard.ask({ title: "A note", multiline: true });   // null if they gave up
 *   // each frame: keyboard.update(t)
 *   // with a ray: const hit = keyboard.pick(raycaster); keyboard.aim(hit); on select: keyboard.press(hit)
 */
import * as THREE from "three";
export interface KeyboardOptions {
    scene: THREE.Scene;
    camera: THREE.Camera;
    accent?: THREE.ColorRepresentation;
    textColor?: string;
    /** The headset session, if there is one: asked whether its browser has a keyboard of its own to offer. */
    session?: () => XRSession | null | undefined;
}
export interface AskOptions {
    /** What is being asked for, shown over the words. */
    title: string;
    value?: string;
    /** More than one line: enter starts a new one, and Done ends. */
    multiline?: boolean;
    maxLength?: number;
}
export interface Keyboard {
    readonly group: THREE.Group;
    /** Whether it is up. */
    readonly open: boolean;
    /** Put the keyboard up in front of the visitor and wait. Resolves with what they wrote, or null if they gave up. */
    ask(o: AskOptions): Promise<string | null>;
    /** Put it away, as if they gave up. */
    cancel(): void;
    /** What this ray points at: a name to hand to `aim()` and `press()`, or null. While it is up it is in the way of what is behind it. */
    pick(raycaster: THREE.Raycaster): string | null;
    aim(hit: string | null): void;
    press(hit: string): void;
    /** Where a key is in the world, for a test to point at. */
    pointOf(hit: string): THREE.Vector3 | null;
    /** What is written so far, and which keys are showing. */
    info(): {
        open: boolean;
        title: string;
        value: string;
        layer: string;
        shift: string;
        keys: string[];
    };
    update(t: number): void;
    dispose(): void;
}
export declare function createKeyboard(o: KeyboardOptions): Keyboard;
