/**
 * Where a visitor came to the sign-in page from, and so where "carry on"
 * leads. Only the places named here: an address is never taken from the link,
 * so a link to this page can't be made to send anyone somewhere else.
 */
export interface WayBack {
  /** Where to go, or null to go back the way they came. */
  href: string | null;
  /** What the way back is called. */
  label: string;
  /** The same, for someone who chose to stay anonymous. */
  guest: string;
}

export function wayBack(search: string): WayBack {
  const q = new URLSearchParams(search);
  const back = q.get("back");
  if (back === "walk") {
    // They left a headset session to come here: the room offers the way back into one first.
    return { href: q.get("xr") === "1" ? "/walk/#back&xr=1" : "/walk/#back", label: "Back to your room", guest: "Back to your room, as a guest" };
  }
  if (back === "history") return { href: null, label: "Back to where you were", guest: "Go back, as a guest" };
  return { href: "/", label: "Back to the lobby", guest: "Carry on as a guest" };
}
