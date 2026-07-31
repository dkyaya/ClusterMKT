import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export const root = resolve(import.meta.dirname, "../..");
export const fixtureRoot = resolve(root, "tests/fixtures/gold-corpus");
export const outputRoot = resolve(root, "relays/tmp/gold-calibration-corpus/validation");

export function readJson(relativePath) {
  return JSON.parse(readFileSync(resolve(fixtureRoot, relativePath), "utf8"));
}

export function loadCorpus() {
  return {
    items: readJson("items/corpus-items.json").items,
    decisions: readJson("reviewer-decisions/reviewer-decisions.json").decisions,
    adjudications: readJson("adjudications/adjudications.json").adjudications,
    goldLabels: readJson("gold-labels/gold-labels.json").goldLabels,
    manifest: readJson("sampling/sampling-manifest.json"),
  };
}

export function partitionFor(groupId, seed = "cluster-mkt-gold-v1-seed") {
  const bucket =
    Number.parseInt(
      createHash("sha256").update(`${seed}:${groupId}`).digest("hex").slice(0, 8),
      16,
    ) % 100;
  return bucket < 60 ? "training" : bucket < 80 ? "calibration" : "held_out";
}

export function stratifiedPartition(items, seed = "cluster-mkt-gold-v1-seed") {
  const ratios = { training: 0.6, calibration: 0.2, held_out: 0.2 };
  const partitions = Object.keys(ratios);
  const groups = new Map();
  for (const item of items) groups.set(item.groupId, [...(groups.get(item.groupId) ?? []), item]);
  const orderedGroups = [...groups].sort(([left], [right]) =>
    createHash("sha256")
      .update(`${seed}:${left}`)
      .digest("hex")
      .localeCompare(createHash("sha256").update(`${seed}:${right}`).digest("hex")),
  );
  const target = Object.fromEntries(
    partitions.map((partition) => [partition, items.length * ratios[partition]]),
  );
  const counts = { training: 0, calibration: 0, held_out: 0 };
  const taskTotals = taskCounts(items);
  const taskBalance = Object.fromEntries(
    Object.keys(taskTotals).map((task) => [task, { training: 0, calibration: 0, held_out: 0 }]),
  );
  const byGroup = {};
  for (const [groupId, groupItems] of orderedGroups) {
    const groupTasks = taskCounts(groupItems);
    const score = (partition) =>
      (target[partition] - counts[partition]) / items.length +
      Object.keys(groupTasks).reduce(
        (sum, task) =>
          sum +
          (taskTotals[task] * ratios[partition] - taskBalance[task][partition]) / taskTotals[task],
        0,
      );
    const partition = [...partitions].sort(
      (left, right) =>
        score(right) - score(left) || partitions.indexOf(left) - partitions.indexOf(right),
    )[0];
    byGroup[groupId] = partition;
    counts[partition] += groupItems.length;
    for (const [task, count] of Object.entries(groupTasks)) taskBalance[task][partition] += count;
  }
  return {
    assignments: items.map((item) => ({
      itemId: item.itemId,
      groupId: item.groupId,
      partition: byGroup[item.groupId],
    })),
    byGroup,
    counts,
    taskBalance,
  };
}

export function writeReport({
  slug,
  title,
  status,
  summary,
  metrics,
  gates,
  blockers = [],
  details = {},
}) {
  mkdirSync(outputRoot, { recursive: true });
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    mode: "offline-human-review-centered",
    corpusVersion: "gold-corpus-v1",
    status,
    summary,
    aggregateMetrics: metrics,
    gates,
    blockers,
    details,
    passed: Object.values(gates).every(Boolean),
  };
  writeFileSync(resolve(outputRoot, `${slug}-report.json`), `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# ${title}`,
    "",
    `- Status: ${status}`,
    `- Summary: ${summary}`,
    ...Object.entries(metrics).map(([key, value]) => `- ${key}: ${value ?? "not measurable"}`),
    `- Safety gates: ${report.passed ? "PASS" : "FAIL"}`,
    `- Blockers: ${blockers.length ? blockers.join("; ") : "none"}`,
  ];
  writeFileSync(resolve(outputRoot, `${slug}-summary.md`), `${lines.join("\n")}\n`);
  console.log(lines.join("\n"));
  if (!report.passed) process.exitCode = 1;
  return report;
}

export function taskCounts(items) {
  return Object.fromEntries(
    [...new Set(items.map(({ task }) => task))]
      .sort()
      .map((task) => [task, items.filter((item) => item.task === task).length]),
  );
}

export function corpusFingerprint(items) {
  return createHash("sha256").update(JSON.stringify(items)).digest("hex");
}
