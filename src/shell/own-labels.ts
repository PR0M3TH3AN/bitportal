/**
 * The menu over a page of this site's own (the room, the Airlock), labelled as this site's own.
 *
 * The kit's menu puts a world's name on everything a world says, so that nothing of a world's is ever taken for the
 * visitor's own: its rows stand under its name in a tab every place has, a tab of its own carries its name
 * ("Doors · The Grove"), and what it says of itself is said under its name. That is right for a world, which is
 * somebody else's. BitPortal's own room is not: its rows are BitPortal's, in BitPortal's menu, and "YOUR ROOM" over
 * them reads as if the room were a stranger.
 *
 * So for a page whose origin is exactly this site's (the browser's word for it, never the page's), the name is
 * taken off: its rows stand with the menu's own, its tabs are called what it called them, and its words are the
 * tab's own note. Nothing else of the view changes, and nothing changes for any other page.
 */
import type { UiSectionView, UiView } from "nswp-sdk/ui";

/** The view, with `title`'s name taken off everything said under it. `title` is what the kit labelled them with. */
export function asOurOwn(view: UiView, title: string): UiView {
  if (!title) return view;
  const suffix = ` · ${title}`;
  const unnamed = <T extends { from?: string }>(item: T): T => {
    if (item.from !== title) return item;
    const { from: _theirs, ...rest } = item;
    return rest as T;
  };
  const sections = view.sections.map((s): UiSectionView => {
    const { said, ...rest } = s;
    return {
      ...rest,
      label: s.label.endsWith(suffix) ? s.label.slice(0, -suffix.length) : s.label,
      items: s.items.map(unnamed),
      // What it says in the tab is the tab's own note, after any the menu already has.
      ...(said ? (said.from === title ? { note: [s.note, said.note].filter(Boolean).join("\n\n") } : { said }) : {}),
    };
  });
  return {
    ...view,
    sections,
    hotbar: view.hotbar.map(unnamed),
    pins: view.pins.map((p) => (p.label.endsWith(suffix) ? { ...p, label: p.label.slice(0, -suffix.length) } : p)),
  };
}
