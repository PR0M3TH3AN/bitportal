import { describe, expect, it } from "vitest";

/**
 * Wherever a page of BitPortal's own says to sign in, a way to sign in is right there (the owner, 2026-11-25: "can
 * we have a "sign in" button anywhere ... that we say something like "sign into bitlogin to use this feature"").
 * The menu's rows take the kit's own piece for it when the kit has one; these are BitPortal's own pages.
 */
const read = async (path: string): Promise<string> => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("a Sign in press where a page says to sign in", () => {
  it("the doors page, browsing signed out: a link to sign in, and back", async () => {
    const lobby = await read("src/lobby/main.ts");
    expect(lobby).toContain(`["You're browsing signed out. ", el("a", { href: "/account/?back=history" }, "Sign in"), ". "]`);
  });

  it("the publish page, signed out: the same sign-in as its own button, beside the line that says so", async () => {
    const publish = await read("src/publish/main.ts");
    expect(publish).toContain(`who.append("You're signed out. You can check a site and fill this in first, then sign in to publish. ");`);
    expect(publish).toContain('now.addEventListener("click", () => void signInNow?.());');
    expect(publish).toContain('button.addEventListener("click", () => void signInNow?.());');
    // One way of signing in, used by both: never a second copy of what a press does.
    expect(publish.split("await signIn()").length - 1).toBe(1);
  });

  it("the room's sheet about a computer of your own, signed out: its Sign in beside the line", async () => {
    const computers = await read("src/walk/computers.ts");
    expect(computers).toContain('...(who ? [] : [signInButton("Sign in", true)]),');
  });
});
