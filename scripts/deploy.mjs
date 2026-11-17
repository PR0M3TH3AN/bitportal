// Deploys dist/ to the BitPortal Vercel project (production).
// Run `npm run build` first. Needs the Vercel CLI, logged in.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const project = JSON.parse(readFileSync(join(root, "vercel-project.json"), "utf8"));
const dist = join(root, "dist");
if (!existsSync(join(dist, "index.html"))) throw new Error("dist/ is missing; run npm run build");
console.log(`deploying BitPortal → ${project.url}`);
execFileSync("vercel", ["deploy", dist, "--prod", "--yes"], {
  stdio: ["ignore", "inherit", "inherit"],
  env: { ...process.env, VERCEL_ORG_ID: project.orgId, VERCEL_PROJECT_ID: project.projectId },
});
