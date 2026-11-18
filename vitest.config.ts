import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@nswp/core": at("./vendor/nswp/nswp-core.js"),
      bitfeed: at("./vendor/bitfeed/bitfeed.js"),
      "nswp-sdk/three": at("./vendor/nswp/sdk/three.js"),
      "nswp-sdk/home": at("./vendor/nswp/sdk/home.js"),
      "nswp-sdk/ui": at("./vendor/nswp/sdk/ui.js"),
      "nswp-sdk/terminal": at("./vendor/nswp/sdk/terminal.js"),
    },
  },
});
