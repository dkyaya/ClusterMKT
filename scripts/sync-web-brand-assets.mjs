import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "brand/icons");
const destination = resolve(root, "apps/web/public/brand");
const files = [
  "favicon.ico",
  "favicon-16.png",
  "favicon-32.png",
  "apple-touch-icon-180.png",
  "cluster-mkt-icon-192.png",
  "cluster-mkt-icon-512.png",
  "cluster-mkt-icon-maskable-192.png",
  "cluster-mkt-icon-maskable-512.png",
  "site.webmanifest",
];

await rm(destination, { force: true, recursive: true });
await mkdir(destination, { recursive: true });
for (const file of files) await cp(resolve(source, file), resolve(destination, file));
console.log(`Synced ${files.length} canonical brand assets to apps/web/public/brand/.`);
