import { describe, expect, it } from "vitest";
import { wayBack } from "../src/account/back.js";

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
