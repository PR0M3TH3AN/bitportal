// How big a world says it is, on the Airlock's destination screen (src/go/airlock.ts): its own claim in the kit's
// words (`worldDownload`), up front only when it is a lot, and never a blocker.
import { describe, expect, it } from "vitest";
import { DOWNLOAD_WARN_MB, worldDownload } from "@nswp/core";

const read = async (path: string) => {
  const { readFileSync } = (await import(/* @vite-ignore */ ["node", "fs"].join(":"))) as { readFileSync(path: URL, encoding: string): string };
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
};

describe("a world's own word on its download, at the Airlock", () => {
  it("is said in the kit's words: the size, and a caution only above the budget", () => {
    expect(worldDownload({ budgets: { initialDownloadMb: 45 } })).toMatchObject({ mb: 45, heavy: false });
    expect(worldDownload({ budgets: { initialDownloadMb: 45 } })!.words).toMatch(/^The world says about 45 MB to download$/);
    const big = worldDownload({ budgets: { initialDownloadMb: DOWNLOAD_WARN_MB + 30 } })!;
    expect(big.heavy).toBe(true);
    expect(big.words).toMatch(/a lot on a phone's data/);
    // A world that says nothing has nothing said for it.
    expect(worldDownload({})).toBeNull();
    expect(worldDownload(null)).toBeNull();
  });

  it("is read from the destination world's own entry in its manifest, and never stops a crossing", async () => {
    const airlock = await read("src/go/airlock.ts");
    expect(airlock).toContain("const download = worldDownload(w ? a.manifest?.worlds[w.d] : null);");
    // Up front only when it is a lot; with the rest of what there is to know otherwise. Nothing of it is a blocker.
    expect(airlock).toContain("download?.heavy && downloadLine ? downloadLine : \"\",");
    expect(airlock).toContain("if (downloadLine && !download!.heavy) body.append(downloadLine);");
    expect(airlock).not.toMatch(/blockers\.push\([^)]*download/);
  });
});
