/**
 * The page that holds the screen (src/shared/shell.ts). It fills the screen at one press and shows everything else
 * in a frame: the frame's page changes at every door, and this one never does, so the screen stays filled.
 *
 * It does nothing else. It can't see into a world it frames and doesn't try to: what is in the frame goes from
 * place to place by itself, exactly as it would as a page of its own.
 */
const $ = (id: string): HTMLElement => document.getElementById(id)!;
const start = $("start");
const view = $("view") as HTMLIFrameElement;
const fill = $("fill");

const filled = (): boolean => !!document.fullscreenElement;
/** The way back to a filled screen is offered only while there is something on show and the screen isn't filled. */
const tend = (): void => {
  fill.hidden = !start.hidden || filled() || !document.fullscreenEnabled;
};
const fillScreen = async (): Promise<void> => {
  try {
    await document.documentElement.requestFullscreen();
  } catch {
    /* a browser that won't: what is in the frame is shown all the same */
  }
  tend();
  // The keys are the world's: they go to whatever is in the frame, not to this page.
  view.focus();
};

$("enter").addEventListener("click", () => {
  start.hidden = true;
  view.hidden = false;
  view.src = "/walk/";
  void fillScreen();
});
fill.addEventListener("click", () => void fillScreen());
document.addEventListener("fullscreenchange", () => {
  tend();
  view.focus();
});
// Each place that comes into the frame is given the keys as it arrives: a visitor walks on with no press.
view.addEventListener("load", () => view.focus());
tend();
