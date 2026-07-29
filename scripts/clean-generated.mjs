import { rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const path of [
  "apps/web/dist",
  "apps/web/public/brand",
  "apps/worker/dist",
  "apps/worker/.wrangler",
  "coverage",
]) {
  await rm(resolve(root, path), { force: true, recursive: true });
}
console.log("Removed generated build, coverage, Wrangler, and runtime-brand outputs.");
