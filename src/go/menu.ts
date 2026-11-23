/**
 * The Airlock under the visitor's menu (NSWP docs/plans/the-clients-menu.md, section 16, point 1). In the page that
 * keeps the screen, the menu is that page's, over every place: so the Airlock speaks the menu's words too, through
 * the kit's own world's end of them, as any world does. It has no menu of its own to fall back to, and never did.
 *
 * - It describes no tab and no row. The menu over it is the way home and the visitor's own tabs, and nothing else.
 * - The menu is kept to one small mark, in the corner away from this page's own links, so nothing of it is over
 *   what the Airlock asks. The sheet comes up only when the visitor brings it up.
 * - The visitor's own Home, pressed there, is the room.
 *
 * Loading this file is what says so: the kit puts it in this page's `here`. So it is one of the page's first files,
 * and the Airlock doesn't say `here` a second time (shared/shell.ts).
 */
import { portAbove } from "nswp-sdk/menu-above";
import { createControls } from "nswp-sdk/ui";

const controls = createControls({ title: "The Airlock", address: location.host, presence: "quiet", corner: "bottom-left" });
portAbove(controls, { home: () => location.assign("/walk/") });
