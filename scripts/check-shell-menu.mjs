// Checks that the site as built has the client's menu off (scripts/build.mjs says why it is behind a switch):
// the shell's first file names no menu file, and none was built. The gate runs it after the build, and the deploy
// runs it before anything is sent, so a trial's build can't go out by mistake.
//
//   node scripts/check-shell-menu.mjs
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
/** What is wrong with a built site that should have the menu off: nothing, if it is off. */
export function shellMenuFaults(dir = dist) {
  const main = join(dir, "shell", "main.js");
  if (!existsSync(main)) return ["dist/shell/main.js is missing: run npm run build"];
  const faults = [];
  if (existsSync(join(dir, "shell", "menu.js"))) faults.push("dist/shell/menu.js was built: the menu's code is in this build");
  if (readFileSync(main, "utf8").includes("/shell/menu.js")) faults.push("dist/shell/main.js names the menu's file: the shell would load it");
  return faults;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const faults = shellMenuFaults();
  if (faults.length) {
    console.error(`The client's menu is ON in the built site, and it has to be off:\n  ${faults.join("\n  ")}\nBuild again without BITPORTAL_SHELL_MENU (npm run build).`);
    process.exit(1);
  }
  console.log("shell menu: off in the built site");
}
