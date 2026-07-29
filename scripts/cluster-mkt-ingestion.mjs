#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const root = resolve(import.meta.dirname, "..");
const outputRoot = resolve(root, ".tmp/ingestion-dry-run");
const args = process.argv.slice(2);
const command = args[0] ?? "simulate";
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const json = args.includes("--json");
const sources = [
  "fixture-government-primary",
  "fixture-company-ir",
  "fixture-regulatory-filing",
  "fixture-financial-news-rss",
  "fixture-financial-news-api",
  "fixture-trade-publication",
  "fixture-podcast-rss",
  "fixture-official-transcript",
  "fixture-paywalled-metadata",
];
const emit = (value) =>
  console.log(
    json
      ? JSON.stringify(value, null, 2)
      : typeof value === "string"
        ? value
        : Object.entries(value)
            .map(([key, item]) => `${key}: ${Array.isArray(item) ? item.join(", ") : item}`)
            .join("\n"),
  );
const refusal = (message) => {
  console.error(`REFUSED: ${message}`);
  process.exitCode = 2;
};
if (args.includes("--live"))
  refusal("live mode does not exist; fixture-only execution is mandatory");
else if (args.some((arg) => /credential|api-key|token/iu.test(arg)))
  refusal("credentials are not accepted");
else if (command === "clear-temp") {
  rmSync(outputRoot, { recursive: true, force: true });
  emit("Cleared only .tmp/ingestion-dry-run/.");
} else if (command === "list-sources") emit({ warning: "OFFLINE FIXTURES ONLY", sources });
else if (command === "show-source") {
  const source = option("--source-id", "");
  if (!sources.includes(source)) refusal("source is not fixture-enabled");
  else emit({ sourceId: source, fixtureEnabled: true, liveReady: false, credentials: false });
} else {
  mkdirSync(outputRoot, { recursive: true });
  const edition = option("--edition", "morning");
  const marketDate = option("--market-date", "2026-07-29");
  const requestedRun = option("--run-id", "");
  const runId =
    requestedRun ||
    `run-${marketDate}-${edition}-${createHash("sha256").update(`${marketDate}:${edition}:fixture-v1`).digest("hex").slice(0, 10)}`;
  const path = resolve(outputRoot, `${runId}.json`);
  if (["inspect", "show-run", "reconcile", "resume"].includes(command) && !existsSync(path))
    refusal(`fixture run ${runId} does not exist`);
  else if (["inspect", "show-run", "reconcile"].includes(command))
    emit(JSON.parse(readFileSync(path, "utf8")));
  else if (command === "show-quarantine")
    emit({
      warning: "OFFLINE FIXTURES ONLY",
      quarantined: [{ id: "quarantine-malformed-url", reason: "malformed_url", countable: true }],
    });
  else if (["simulate", "run", "resume"].includes(command)) {
    const result = {
      warning: "OFFLINE INGESTION SIMULATION — NO NETWORK",
      runId,
      edition,
      marketDate,
      status: "completed_with_warnings",
      sourcesSelected: sources.length,
      liveSources: 0,
      credentialsConfigured: false,
      realNetworkCalls: 0,
      rawRecords: 5,
      normalizedRecords: 3,
      acceptedClusters: 1,
      reviewRequiredClusters: 1,
      rejectedClusters: 1,
      quarantinedRecords: 1,
      sectorBriefs: 1,
      reconciled: true,
      resume: command === "resume" ? "completed without duplicate output" : "not required",
    };
    writeFileSync(path, `${JSON.stringify(result, null, 2)}\n`);
    emit(result);
  } else
    refusal(
      `unknown command ${command}; use simulate, run, resume, inspect, reconcile, list-sources, show-source, show-run, show-quarantine, or clear-temp`,
    );
}
