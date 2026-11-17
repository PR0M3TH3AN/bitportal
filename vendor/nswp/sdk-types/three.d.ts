/**
 * nswp-sdk/three — shared presence for Three.js worlds (spec §9.4, §9.8).
 *
 *   const presence = createPresence({ scene, camera, rig, renderer, controllers });
 *   attachRoomControls(presence, { roomButton, micButton, inviteButton, status });
 *   // each frame:
 *   presence.update(dt);
 *
 * It draws other members as avatars (head, body, hands), plays their voices
 * from where they stand, sends your own pose, and keeps personal space.
 *
 * This is the Phase 4b spike: guests only. Joining a room shows your IP
 * address to the other members, so join only after the visitor has agreed.
 */
import * as THREE from "three";
import { type RoomSession } from "./room.js";
export interface PresenceOptions {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    /** The object that moves the visitor around; the camera is inside it. */
    rig: THREE.Object3D;
    renderer: THREE.WebGLRenderer;
    /** XR controller target-ray spaces, as from `renderer.xr.getController(i)`. */
    controllers: THREE.Object3D[];
    /** CSS colour for name labels. */
    labelColor?: string;
    /** Called whenever membership, status or the microphone changes. */
    onChange?: () => void;
}
export interface AvatarInfo {
    pubkey: string;
    name: string;
    visible: boolean;
    opacity: number;
    head: number[] | null;
    hands: [boolean, boolean];
    audioLevel: number;
}
export interface Presence {
    readonly session: RoomSession | null;
    /** The private room's name, or null in a world's open room. */
    readonly roomName: string | null;
    readonly micOn: boolean;
    join(name: string | null): Promise<void>;
    leave(): void;
    setMicrophone(track: MediaStreamTrack | null): Promise<void>;
    /** A quiet test tone to use in place of a microphone. */
    testTone(): MediaStreamTrack;
    /** Call once per frame with the seconds since the last one. */
    update(dt: number): void;
    /** What this visitor currently sees of each member (for tests and debugging). */
    info(): AvatarInfo[];
}
/** A text panel that always faces the viewer. `width` is in metres. */
export declare function textSprite(text: string, color: string, width: number): THREE.Sprite;
export declare function createPresence(d: PresenceOptions): Presence;
export interface RoomControls {
    roomButton: HTMLButtonElement;
    micButton: HTMLButtonElement;
    inviteButton: HTMLButtonElement;
    /** Where room status is written. Give it `role="status"`. */
    status: HTMLElement;
    /** `?mic=tone` uses a test tone instead of asking for the microphone. */
    search?: string;
    /** Called with a small summary whenever the room changes (for tests). */
    onState?: (state: Record<string, unknown> | null) => void;
}
/**
 * Wires a page's Join / microphone / invite buttons to a presence. Nothing
 * connects until Join is pressed, because joining shows the visitor's IP
 * address to the other members. Voice has to be switched on from the page,
 * before entering VR.
 *
 * Wrap the returned `refresh` into the presence's `onChange`.
 */
export declare function attachRoomControls(presence: Presence, c: RoomControls): {
    refresh(): void;
};
