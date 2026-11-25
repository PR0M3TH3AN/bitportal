/**
 * BitLogin's own panel, drawn by one of BitPortal's own pages over itself, where no page that keeps the screen
 * frames it (the room opened at its own address, say). The shell draws the same panel the same way
 * (src/shell/panel.ts); this is that, for a page by itself.
 *
 * It is for what a window can't do: "Secure this account" for the family's guest (BitLogin docs/guest-accounts.md
 * G6). The guest lives in BitLogin's storage as framed under bitblocks.network, which a window of BitLogin's own
 * can't see; a frame drawn by a page at BitPortal's own address can, since a browser keeps a frame's storage by the
 * top site. BitLogin lets only BitPortal's own address frame its panel (its `frame-ancestors`), so this is offered
 * only there, and only on a page nothing frames. Signing in is still done as before.
 */
import { createPanel, type Panel, type PanelMode } from "../shell/panel.js";
import { toLocal } from "@nswp/core";
import { namedAddress, signInAddress } from "./session.js";

let made: Promise<Panel> | null = null;
let ended: ((said: { up: boolean; allowed: boolean }) => void) | null = null;
let up = false;

/** Whether this page can draw BitLogin's panel itself: BitPortal's own address, and nothing framing it. */
export function ownPanelOffered(where: { origin: string; framed: boolean } = { origin: location.origin, framed: window.parent !== window }): boolean {
  return !where.framed && namedAddress(where.origin);
}

/**
 * Draw it, from the visitor's press, for `mode`. Resolves once it has gone: `up` is whether it ever came up, and
 * `allowed` whether BitLogin said the visitor said yes. One at a time.
 */
export async function showOwnPanel(mode: PanelMode): Promise<{ up: boolean; allowed: boolean }> {
  if (ended) return { up: false, allowed: false };
  made ??= toLocal(`${signInAddress()}/`)
    .then((at) => new URL(at).origin)
    .catch(() => new URL(signInAddress()).origin)
    .then((at) =>
      createPanel({
        at,
        told: (open, more) => {
          if (open) return void (up = true);
          const done = ended;
          ended = null;
          done?.({ up: up && !more?.failed, allowed: more?.allowed === true });
          up = false;
        },
      }),
    );
  const panel = await made;
  return new Promise((done) => {
    ended = done;
    panel.show(location.origin, mode, null);
  });
}
