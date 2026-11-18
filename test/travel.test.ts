import { describe, expect, it } from "vitest";
import { carriedOn, micMayTravel, setMicMayTravel } from "../src/shared/travel.js";

const store = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
};

describe("what goes on with a visitor who was in a room", () => {
  it("passes joined on unless they unticked it", () => {
    expect(carriedOn({ joined: true }, { stay: true, mic: false })).toEqual({ joined: true });
    expect(carriedOn({ joined: true }, { stay: false, mic: true })).toEqual({});
    expect(carriedOn({}, { stay: true, mic: true })).toEqual({});
  });

  it("passes a microphone on only when the link says it, they are staying, and they said it may", () => {
    expect(carriedOn({ joined: true, mic: true }, { stay: true, mic: true })).toEqual({ joined: true, mic: true });
    expect(carriedOn({ joined: true, mic: true }, { stay: true, mic: false })).toEqual({ joined: true });
    expect(carriedOn({ joined: true }, { stay: true, mic: true })).toEqual({ joined: true });
    expect(carriedOn({ mic: true }, { stay: true, mic: true })).toEqual({});
    expect(carriedOn({ joined: true, mic: true }, { stay: false, mic: true })).toEqual({});
  });

  it("keeps the microphone choice off until it is made, and can take it back", () => {
    const s = store();
    expect(micMayTravel(s)).toBe(false);
    setMicMayTravel(true, s);
    expect(micMayTravel(s)).toBe(true);
    setMicMayTravel(false, s);
    expect(micMayTravel(s)).toBe(false);
    expect(micMayTravel(null)).toBe(false);
    expect(micMayTravel({ getItem: () => { throw new Error("blocked"); } })).toBe(false);
  });
});
