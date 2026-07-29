import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export const root = resolve(import.meta.dirname, "../..");
const files = [
  "sources/source-cases.json",
  "failures/failure-cases.json",
  "resume/resume-cases.json",
  "runs/run-cases.json",
  "quarantine/quarantine-cases.json",
];
export function loadCases() {
  return files
    .flatMap((file) =>
      JSON.parse(readFileSync(resolve(root, "tests/fixtures/ingestion", file), "utf8")),
    )
    .sort((a, b) => a.caseNumber - b.caseNumber);
}
export function writeEvaluation({
  slug,
  title,
  metrics,
  gates,
  cases = loadCases(),
  failures = [],
}) {
  const output = resolve(root, "relays/tmp/offline-ingestion-dry-run/validation");
  mkdirSync(output, { recursive: true });
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    mode: "offline-fixture-driven-deterministic",
    registryVersion: "source-registry-v1",
    rulesVersion: "normalization-v1",
    fixtureCorpus: {
      caseCount: cases.length,
      sha256: createHash("sha256").update(JSON.stringify(cases)).digest("hex"),
    },
    aggregateMetrics: metrics,
    criticalGates: gates,
    exactFailedCases: failures,
    passed: failures.length === 0 && Object.values(gates).every(Boolean),
  };
  writeFileSync(
    resolve(output, `${slug}-evaluation-report.json`),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  const summary = `# ${title} evaluation summary\n\n- Mode: offline, deterministic, fixture-driven\n- Cases: ${cases.length}\n${Object.entries(
    metrics,
  )
    .map(([key, value]) => `- ${key}: ${value}`)
    .join(
      "\n",
    )}\n- Critical failures: ${failures.length}\n- Result: ${report.passed ? "PASS" : "FAIL"}\n`;
  writeFileSync(resolve(output, `${slug}-evaluation-summary.md`), summary);
  console.log(summary.trim());
  if (!report.passed) process.exitCode = 1;
  return report;
}
