import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url));
// BitGate's readers, from its checkout beside this one, for the shadow comparison's test (scripts/shadow/). Without
// the checkout that test says so and stands aside; nothing BitPortal ships uses BitGate.
const bitgate = at("../bitgate/packages");
const withBitgate = existsSync(`${bitgate}/nostr/src/index.js`) ? { "@bitgate/core": `${bitgate}/core/src/index.js`, "@bitgate/nostr": `${bitgate}/nostr/src/index.js` } : {};

export default defineConfig({
  resolve: {
    alias: {
      "@nswp/core": at("./vendor/nswp/nswp-core.js"),
      bitfeed: at("./vendor/bitfeed/bitfeed.js"),
      "nswp-sdk/three": at("./vendor/nswp/sdk/three.js"),
      "nswp-sdk/home": at("./vendor/nswp/sdk/home.js"),
      "nswp-sdk/ui": at("./vendor/nswp/sdk/ui.js"),
      "nswp-sdk/terminal": at("./vendor/nswp/sdk/terminal.js"),
      ...withBitgate,
    },
  },
});
