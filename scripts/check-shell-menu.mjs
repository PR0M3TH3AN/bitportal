// Checks that the site as built has the client's menu on (scripts/build.mjs): the menu's own file was built and
// the shell's first file names it, and the page that draws the Bag's things was built with its own rules. The gate
// runs it after the build, and the deploy runs it before anything is sent, so a build made without the menu (a
// trial's comparison, `BITPORTAL_SHELL_MENU=0`) can't go out by mistake.
//
//   node scripts/check-shell-menu.mjs
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
/** What is wrong with a built site that should have the menu off: nothing, if it is off. (A trial's comparison build.) */
export function shellMenuFaults(dir = dist) {
  const main = join(dir, "shell", "main.js");
  if (!existsSync(main)) return ["dist/shell/main.js is missing: run npm run build"];
  const faults = [];
  if (existsSync(join(dir, "shell", "menu.js"))) faults.push("dist/shell/menu.js was built: the menu's code is in this build");
  if (existsSync(join(dir, "shell", "pictures"))) faults.push("dist/shell/pictures was built: the page that draws the Bag's things for the menu is in this build");
  const served = join(dir, "vercel.json");
  if (existsSync(served) && readFileSync(served, "utf8").includes("/shell/pictures")) faults.push("dist/vercel.json has rules for /shell/pictures: the headers are a build's with the menu on");
  if (readFileSync(main, "utf8").includes("/shell/menu.js")) faults.push("dist/shell/main.js names the menu's file: the shell would load it");
  return faults;
}

/** What is missing from a built site that should have the menu on: nothing, if every part of it is there. */
export function shellMenuMissing(dir = dist) {
  const main = join(dir, "shell", "main.js");
  if (!existsSync(main)) return ["dist/shell/main.js is missing: run npm run build"];
  const missing = [];
  if (!existsSync(join(dir, "shell", "menu.js"))) missing.push("dist/shell/menu.js was not built: the menu's code is not in this build");
  if (!readFileSync(main, "utf8").includes("/shell/menu.js")) missing.push("dist/shell/main.js does not name the menu's file: the shell would not load it");
  for (const page of ["index.html", "main.js"]) if (!existsSync(join(dir, "shell", "pictures", page))) missing.push(`dist/shell/pictures/${page} was not built: the Bag's things would be shown by their letters`);
  const served = join(dir, "vercel.json");
  if (!existsSync(served) || !readFileSync(served, "utf8").includes('"/shell/pictures(/.*)?"')) missing.push("dist/vercel.json has no rules of its own for /shell/pictures");
  return missing;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const missing = shellMenuMissing();
  if (missing.length) {
    console.error(`The client's menu is not all in the built site, and it has to be:\n  ${missing.join("\n  ")}\nBuild again without BITPORTAL_SHELL_MENU=0 (npm run build).`);
    process.exit(1);
  }
  console.log("shell menu: on in the built site");
}
