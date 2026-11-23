// Every check this repository has, one after another, on this machine: what a change must pass before it is merged.
// There is no check run anywhere else (the owner, 2026-11-21: "We should do the CI tests local"), so this is the gate.
// It stops at the first step that fails and exits with that step's code, so `npm run gate && git merge …` means it.
//
//   npm run gate
import { spawnSync } from "node:child_process";

const steps = [
  ["vendor:check", "what is vendored is what was recorded"],
  ["previews:check", "every mirrored preview still matches its hash"],
  ["typecheck", "types"],
  ["test", "tests"],
  ["build", "every page"],
  ["shell-menu:off", "the built site has the client's menu off"],
];
const began = Date.now();
const done = [];
for (const [step, what] of steps) {
  const at = Date.now();
  process.stdout.write(`\n── ${step}: ${what}\n`);
  const args = step === "test" ? ["test"] : ["run", step];
  const ran = spawnSync("npm", args, { stdio: "inherit", shell: process.platform === "win32" });
  const secs = Math.round((Date.now() - at) / 1000);
  if (ran.status !== 0) {
    console.error(`\n✘ ${step} failed (exit ${ran.status ?? "killed"}) after ${secs}s. Passed before it: ${done.join(", ") || "nothing"}.`);
    console.error("  Nothing is to be merged on this. A test that only fails while the machine is busy still failed: run it again when it is quiet, and say so.");
    process.exit(ran.status ?? 1);
  }
  done.push(`${step} ${secs}s`);
}
console.log(`\n✔ all ${steps.length} steps passed in ${Math.round((Date.now() - began) / 1000)}s: ${done.join(", ")}`);
