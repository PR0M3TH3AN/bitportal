// Deploys dist/ to the BitPortal Vercel project (production).
// Run `npm run build` first. Needs the Vercel CLI, logged in.
import { execFileSync } from "node:child_process";
import { shellMenuMissing } from "./check-shell-menu.mjs";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const project = JSON.parse(readFileSync(join(root, "vercel-project.json"), "utf8"));
const dist = join(root, "dist");
if (!existsSync(join(dist, "index.html"))) throw new Error("dist/ is missing; run npm run build");
// Never a trial's comparison build: the client's menu is all there in anything that is deployed.
const menuMissing = shellMenuMissing(dist);
if (menuMissing.length) throw new Error(`This build hasn't all of the client's menu, and is not to be deployed:\n  ${menuMissing.join("\n  ")}\nRun npm run build, without BITPORTAL_SHELL_MENU=0.`);
console.log(`deploying BitPortal → ${project.url}`);
execFileSync("vercel", ["deploy", dist, "--prod", "--yes"], {
  stdio: ["ignore", "inherit", "inherit"],
  env: { ...process.env, VERCEL_ORG_ID: project.orgId, VERCEL_PROJECT_ID: project.projectId },
});
