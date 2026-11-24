/**
 * The page that draws the things in a visitor's Bag for the page that keeps the screen (`/shell/pictures/`).
 *
 * That page draws the visitor's menu over a world and loads no renderer; this one has it, is framed by that page
 * unseen, and is there only while the Bag has something to draw (src/shell/bag-pictures.ts). Its own rules
 * (scripts/build.mjs): framed by this site and nobody else, scripts from this site only, it frames nothing, and it
 * reaches out only for a thing's model, over https, with no word of where the visitor is.
 *
 * - **It draws what it is told to, and says nothing else.** Down comes a thing's description (already checked as
 *   really its maker's by the page above, through the kit's own store) and the colours chosen for it. Up goes a
 *   picture and which thing it is of (pictures-words.ts).
 * - **The model is the kit's to fetch and check** (`createItems` from `nswp-sdk/three`): asked for with nothing of
 *   the visitor's sent, taken only if its bytes have the hash its description gives, counted against the kit's
 *   budget, fitted and tinted as in a world. Where any of that fails there is no picture, and nothing is said.
 * - **The picture is the kit's to draw** (`createItemPreviews`, from the same entry): a thing is stood, lit and
 *   drawn here by the code that draws it in a world's Bag. Nothing of that is written in this site.
 * - **It listens only to the page that frames it**, at exactly this site's origin. Opened by itself, or framed by
 *   anything else (which its rules forbid), it does nothing.
 * - It knows nothing of who the visitor is: it is told no key, reads none, and asks no relay for anything.
 */
import { createItemPreviews, createItems } from "nswp-sdk/three";
import { PICTURE_SIZE, PICTURES_TAG, PICTURES_V, readDrawWord, type PictureWord } from "../pictures-words.js";

const above = parent;
if (above !== window) {
  // A guest's reach: the thing's own address and the hosts everyone uses, and no list of the visitor's own asked for.
  const items = createItems({ viewer: () => null });
  // The kit's own picture maker: the very code that draws a thing in a world's Bag, with the same view and light.
  const stills = createItemPreviews({ model: (item, tints) => items.model(item, tints), size: PICTURE_SIZE });
  /** Asked for and not yet sent up. */
  const wanted = new Map<string, NonNullable<ReturnType<typeof readDrawWord>>>();

  const send = (): void => {
    for (const [id, want] of wanted) {
      const canvas = stills.still(want.item, want.tints);
      if (!canvas) continue;
      wanted.delete(id);
      void createImageBitmap(canvas).then((bitmap) => {
        const word: PictureWord = { bitportal: PICTURES_TAG, v: PICTURES_V, picture: { id, bitmap } };
        above.postMessage(word, location.origin, [bitmap]);
      });
    }
  };
  stills.onChange(send);

  addEventListener("message", (e: MessageEvent) => {
    if (e.source !== above || e.origin !== location.origin) return;
    const draw = readDrawWord(e.data);
    if (!draw) return;
    wanted.set(draw.id, draw);
    send();
  });
}
