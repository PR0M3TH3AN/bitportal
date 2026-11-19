import { describe, expect, it } from "vitest";
import { cannotSignInHere, wayBack } from "../src/account/back.js";

describe("the way back from signing in", () => {
  it("is the room for someone who came from the room", () => {
    expect(wayBack("?back=walk")).toMatchObject({ href: "/walk/#back", label: "Back to your room" });
  });
  it("says they left a headset, so the room offers the way back into one", () => {
    expect(wayBack("?back=walk&xr=1").href).toBe("/walk/#back&xr=1");
  });
  it("is the way they came, for someone in the middle of something else", () => {
    expect(wayBack("?back=history")).toMatchObject({ href: null, label: "Back to where you were" });
  });
  it("is the lobby otherwise, and never an address a link supplies", () => {
    expect(wayBack("").href).toBe("/");
    for (const sly of ["?back=https://evil.example/", "?back=//evil.example", "?back=/go/%23to=https://evil.example", "?back=javascript:alert(1)", "?next=https://evil.example/"]) expect(wayBack(sly).href).toBe("/");
  });
  it("lets a guest carry on as a guest", () => {
    expect(wayBack("").guest).toBe("Carry on as a guest");
    expect(wayBack("?back=walk").guest).toContain("as a guest");
  });
});

describe("saying when signing in can't work", () => {
  it("says nothing at an address where a browser gives a page its cryptography", () => {
    expect(cannotSignInHere({ secure: true, subtle: true, host: "portal.bitblocks.network", protocol: "https:" })).toBeNull();
    expect(cannotSignInHere({ secure: true, subtle: true, host: "localhost:4300", protocol: "http:" })).toBeNull();
  });
  it("says so at a plain http address on a network, and names the message they would otherwise be shown", () => {
    const note = cannotSignInHere({ secure: false, subtle: false, host: "192.168.68.84:4300", protocol: "http:" })!;
    expect(note).toContain("192.168.68.84:4300");
    expect(note).toContain("Account not found or credentials incorrect");
    expect(note).toContain("https");
  });
  it("says so wherever the cryptography is missing, whatever the address looks like", () => {
    expect(cannotSignInHere({ secure: true, subtle: false, host: "x.example", protocol: "https:" })).not.toBeNull();
  });
});

describe("coming to sign in from the window a world opened", () => {
  it("leads back to that window, and nowhere a link could name", () => {
    expect(wayBack("?back=connect")).toMatchObject({ href: "/connect/", label: "Back to what the world asked" });
    // Anything else in the link changes nothing: the way back is one of BitPortal's own fixed places.
    expect(wayBack("?back=connect&to=https://evil.example/").href).toBe("/connect/");
    expect(wayBack("?back=https://evil.example/").href).toBe("/");
  });
});

describe("which pages another site may embed", () => {
  it("is the signer, and only the signer", async () => {
    // Read as text: this is a test of what the build says, and the project has no Node types to import by name.
    const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
    const build = readFileSync(new URL("../scripts/build.mjs", import.meta.url), "utf8");
    // Two policies: everything says nobody may embed it, and the signer says any https site may.
    expect(build.split(`"frame-ancestors 'none'"`).length - 1).toBe(1);
    expect(build.split(`"frame-ancestors https:"`).length - 1).toBe(1);
    expect(build).toContain('source: "/signer/(.*)"');
    expect(build).toContain('source: "/((?!signer/).*)"');
    // The signer's own policy lets it load nothing from anywhere else and reach no network but its own files.
    const signer = build.slice(build.indexOf("const signerCsp"), build.indexOf("writeFileSync(", build.indexOf("const signerCsp")));
    expect(signer).toContain("default-src 'none'");
    expect(signer).toContain(`"connect-src 'self'"`);
    // And the signer never uses what this browser keeps for BitPortal.
    const page = readFileSync(new URL("../src/signer/main.ts", import.meta.url), "utf8");
    expect(page).not.toMatch(/\.restore\(\)\s*[;)]|readSignedIn|localStorage|indexedDB|sessionStorage/);
  });
});
