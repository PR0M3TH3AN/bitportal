import { describe, expect, it } from "vitest";

/**
 * "Sign In using Phone" (the owner's words), in a headset where nothing can be typed: BitLogin's own /headset/ page
 * (its client's `signInFromPhone`, BitLogin docs/pair-a-headset.md), out of VR for a moment, then "Back into VR".
 * "Create an account using Phone" has its place, hidden until BitLogin has it.
 */
const read = async (path: string): Promise<string> => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("signing in from a phone, in a headset", () => {
  it("is BitLogin's own, through its client, and nothing of it is shown on this site", async () => {
    const session = await read("src/shared/session.ts");
    expect(session).toContain("if (!c?.signInFromPhone) return false;");
    expect(session).toContain("return await c.signInFromPhone();");
    expect(session).toContain('return typeof made?.signInFromPhone === "function";');
  });
  it("is offered under You only in a headset, to nobody signed in or a guest, where the sign-in address can", async () => {
    const you = await read("src/walk/you.ts");
    expect(you).toContain('{ id: "identity-phone", section: "you", icon: "you", tone: "primary", label: "Sign In using Phone", short: "Phone", hidden: () => !(o.phoneSignIn && o.canPhone?.() && o.presenting?.() && !o.signedInAs()), act: () => o.phoneSignIn?.() },');
  });
  it("has a place for making an account from the phone, hidden until it is given", async () => {
    const you = await read("src/walk/you.ts");
    expect(you).toContain('label: "Create an account using Phone", short: "New", hidden: () => !(o.phoneCreate && o.canPhone?.() && o.presenting?.() && !o.signedInAs())');
    const room = await read("src/walk/main.ts");
    expect(room).not.toContain("phoneCreate:");
  });
  it("reads the room again once someone is signed in, and says so where nobody was", async () => {
    const room = await read("src/walk/main.ts");
    expect(room).toContain("if (await signInFromPhone()) return readAgain();");
    expect(room).toContain("phoneSignIn: () => void phoneSignInHere(),");
  });
});
