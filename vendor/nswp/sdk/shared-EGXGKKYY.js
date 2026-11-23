// packages/sdk/src/ui/help.ts
function helpWords(whose) {
  const how = "Drag to look around. Walk with W, A, S, D or the up and down arrows; the left and right arrows turn you. Or point at the floor and select to step there: twice to run. Shift runs and Space jumps. The key left of 1 brings these controls up in any world, whatever is on screen; on a touch screen, hold two fingers still. Select a doorway to see where it leads before you go.";
  return whose === "world" ? `${how} These controls are this world's own: your headset's or browser's own controls always get you out.` : `${how} This menu is the same in every world. Home always takes you home, whatever a world does.`;
}

export {
  helpWords
};
