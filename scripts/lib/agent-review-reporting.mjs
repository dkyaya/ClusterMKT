import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const root = resolve(import.meta.dirname, "../..");
export const resultsPath = resolve(root, ".tmp/agent-review-pilot/results/pilot-results.json");
export const manifestPath = resolve(
  root,
  ".tmp/agent-review-pilot/coordinator/packet-manifest.json",
);
export const pilotSelectionPath = resolve(
  root,
  "tests/fixtures/agent-review-pilot/pilot-selection.json",
);

export function loadResults() {
  if (!existsSync(resultsPath)) return null;
  return JSON.parse(readFileSync(resultsPath, "utf8"));
}

export function loadManifest() {
  if (!existsSync(manifestPath)) return null;
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

export function loadPilotSelection() {
  if (!existsSync(pilotSelectionPath)) return null;
  return JSON.parse(readFileSync(pilotSelectionPath, "utf8"));
}

export function refuse(message) {
  console.error(`REFUSED: ${message}`);
  process.exitCode = 2;
}

export function emit(value) {
  console.log(JSON.stringify(value, null, 2));
}
