/**
 * The jump list: the visitor's saved places, one press away on any BitPortal
 * page (NSWP spec §14.1). Choosing one goes to the Airlock like any other door.
 */
import { buildAirlockUrl, checkDestination, encodeNaddr, parseWorldEvent, WORLD_KIND, type NostrEvent } from "@nswp/core";
import { loadSaved, rememberLeft, type Left } from "./saved.js";

/** The Airlock address for an announced world. */
export function airlockHref(event: NostrEvent, relays: string[]): string | null {
  const parsed = parseWorldEvent(event);
  if (!parsed.ok) return null;
  const naddr = encodeNaddr({ kind: WORLD_KIND, pubkey: event.pubkey, identifier: parsed.value.d, relays: relays.slice(0, 2) });
  return buildAirlockUrl(new URL("/go/", location.origin).href, { naddr, url: parsed.value.url });
}

function node(tag: string, cls: string, ...children: (Node | string)[]): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  e.append(...children);
  return e;
}

/** Make `button` open the jump list. `from` says which start the visitor returns to. */
export function attachJumpList(button: HTMLButtonElement, opts: { relays: () => string[]; from: Left["from"] }): void {
  const list = createJumpList(opts);
  button.addEventListener("click", list.open);
}

/** The jump list as something to open from anywhere, such as the room's controls. */
export function createJumpList(opts: { relays: () => string[]; from: Left["from"] }): { open(): void } {
  const dialog = document.createElement("dialog");
  dialog.className = "sheet";
  dialog.setAttribute("aria-label", "Your doors");
  document.body.append(dialog);
  const open = () => {
    const saved = loadSaved();
    const list = node("ul", "jump-list");
    for (const s of saved) {
      const parsed = parseWorldEvent(s.event);
      const href = airlockHref(s.event, opts.relays());
      if (!parsed.ok || !href) continue;
      const chk = checkDestination(parsed.value.url);
      const host = chk.ok ? `${chk.value.hostPrefix}${chk.value.registrableDomain ?? chk.value.hostname}` : "invalid address";
      const link = node("a", "jump-row", node("span", "jump-title", parsed.value.title), node("span", "jump-host key", host)) as HTMLAnchorElement;
      link.href = href;
      link.addEventListener("click", () => rememberLeft({ id: s.id, from: opts.from }));
      list.append(node("li", "", link));
    }
    const close = node("button", "button", "Close") as HTMLButtonElement;
    close.type = "button";
    close.addEventListener("click", () => dialog.close());
    dialog.replaceChildren(
      node("h2", "", "Your doors"),
      saved.length
        ? node("p", "small", "Places you saved. Choosing one opens the Airlock, which shows the address before you go.")
        : node("p", "", "Nothing saved yet. Open a door and choose Save, and it will be here from then on."),
      list,
      node("p", "small", "Saved places are kept on this device. They aren't published anywhere."),
      node("div", "actions", close),
    );
    dialog.showModal();
  };
  return { open };
}
