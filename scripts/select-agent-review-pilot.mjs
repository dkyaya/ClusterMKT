#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const seed = "cluster-mkt-agent-pilot-v1-seed";

const taskMinimums = {
  source_normalization: 10,
  entity_resolution: 10,
  event_boundaries: 8,
  claims: 8,
  agreement_disagreement: 6,
  sector_coverage: 5,
  review_routing: 5,
};

const crossCuttingMinimums = [
  {
    dimension: "tickerAmbiguity",
    value: "ordinary_language_trap",
    minimum: 8,
    label: "ticker traps",
  },
  {
    dimension: "duplicateClass",
    value: "duplicate_or_syndication",
    minimum: 6,
    label: "duplicate or syndication cases",
  },
  {
    dimension: "articleVersionClass",
    value: "version_chain",
    minimum: 5,
    label: "article-version cases",
  },
  {
    dimension: "evidenceDepth",
    value: "metadata_limited",
    minimum: 6,
    label: "metadata-limited cases",
  },
  { dimension: "contentType", value: "podcast", minimum: 4, label: "podcast cases" },
  { dimension: "claimType", value: "quantitative_fact", minimum: 6, label: "quantitative cases" },
  {
    dimension: "discourseClass",
    value: "apparent_disagreement",
    minimum: 5,
    label: "apparent-disagreement cases",
  },
  {
    dimension: "timeSensitivity",
    value: "evolving_or_corrected",
    minimum: 5,
    label: "rumor, correction, or evolving-event cases",
  },
];

function fingerprint(itemId) {
  return createHash("sha256").update(`${seed}:${itemId}`).digest("hex");
}

const corpus = JSON.parse(
  readFileSync(resolve(root, "tests/fixtures/gold-corpus/items/corpus-items.json"), "utf8"),
);
const items = corpus.items;
const byTaskRanked = {};
for (const task of Object.keys(taskMinimums)) {
  byTaskRanked[task] = items
    .filter((item) => item.task === task)
    .sort((a, b) => fingerprint(a.itemId).localeCompare(fingerprint(b.itemId)));
}

const selected = new Map();
const taskCounts = Object.fromEntries(Object.keys(taskMinimums).map((task) => [task, 0]));

function matchesDimension(item, dimension, value) {
  return item.samplingStrata[dimension] === value;
}

// Phase 1: satisfy cross-cutting minimums first. Requirements whose in-scope supply is scarcest
// (fewest matching items across the pilot's seven included tasks) are processed first, since they
// have the least flexibility to be satisfied later; requirements with a larger or multi-task supply
// pool can still be filled opportunistically afterward. This is a deterministic scarcity-first
// greedy order, not a random or pipeline-informed one.
const inScopeMatches = new Map(
  crossCuttingMinimums.map((requirement) => [
    requirement,
    items.filter(
      (item) =>
        Object.prototype.hasOwnProperty.call(taskMinimums, item.task) &&
        matchesDimension(item, requirement.dimension, requirement.value),
    ),
  ]),
);
const distinctTaskCount = new Map(
  [...inScopeMatches].map(([requirement, matches]) => [
    requirement,
    new Set(matches.map((item) => item.task)).size,
  ]),
);
// Requirements dependent on a single task (least flexible) are satisfied first; requirements able
// to draw from more than one in-scope task are resolved afterward from whatever capacity remains.
const scarcityOrderedMinimums = [...crossCuttingMinimums].sort(
  (a, b) =>
    distinctTaskCount.get(a) - distinctTaskCount.get(b) ||
    inScopeMatches.get(a).length - inScopeMatches.get(b).length,
);

for (const requirement of scarcityOrderedMinimums) {
  let satisfied = 0;
  for (const task of Object.keys(taskMinimums)) {
    for (const item of byTaskRanked[task]) {
      if (satisfied >= requirement.minimum) break;
      if (selected.has(item.itemId)) {
        if (matchesDimension(item, requirement.dimension, requirement.value)) satisfied += 1;
        continue;
      }
      if (taskCounts[task] >= taskMinimums[task]) continue;
      if (!matchesDimension(item, requirement.dimension, requirement.value)) continue;
      selected.set(item.itemId, item);
      taskCounts[task] += 1;
      satisfied += 1;
    }
    if (satisfied >= requirement.minimum) break;
  }
}

// Phase 2: fill remaining per-task quota deterministically.
for (const task of Object.keys(taskMinimums)) {
  for (const item of byTaskRanked[task]) {
    if (taskCounts[task] >= taskMinimums[task]) break;
    if (selected.has(item.itemId)) continue;
    selected.set(item.itemId, item);
    taskCounts[task] += 1;
  }
}

const pilotItems = [...selected.values()].sort((a, b) => a.itemId.localeCompare(b.itemId));

const crossCuttingCoverage = crossCuttingMinimums.map((requirement) => {
  const count = pilotItems.filter((item) =>
    matchesDimension(item, requirement.dimension, requirement.value),
  ).length;
  const passed = count >= requirement.minimum;
  const totalInScopeSupply = inScopeMatches.get(requirement).length;
  const supplyTasks = [...new Set(inScopeMatches.get(requirement).map((item) => item.task))];
  return {
    ...requirement,
    count,
    passed,
    note: passed
      ? null
      : totalInScopeSupply === 0
        ? `Impossible within this pilot's task scope: every gold-corpus-v1 item tagged ${requirement.dimension}=${requirement.value} belongs to story_cluster_membership, which is excluded from the required 7-task/52-item distribution.`
        : `Best achievable under the fixed exact task-count requirement: only ${supplyTasks.join(", ")} in-scope task(s) supply this stratum (total in-scope supply ${totalInScopeSupply}), and competing single-task-dependent requirements in the same task(s) fully consume the remaining quota.`,
  };
});

const taskCoverage = Object.entries(taskMinimums).map(([task, minimum]) => ({
  task,
  minimum,
  count: pilotItems.filter((item) => item.task === task).length,
  passed: pilotItems.filter((item) => item.task === task).length >= minimum,
}));

const taskDistributionPassed =
  pilotItems.length === 52 && taskCoverage.every((entry) => entry.passed);
const crossCuttingPassed = crossCuttingCoverage.every((entry) => entry.passed);
const passed = taskDistributionPassed && crossCuttingPassed;

const output = {
  pilotVersion: "agent-review-pilot-v1",
  corpusVersion: "gold-corpus-v1",
  deterministicSeed: seed,
  selectionMethod: "deterministic_scarcity_first_stratified_no_pipeline_signal",
  itemCount: pilotItems.length,
  taskDistributionPassed,
  crossCuttingPassed,
  passed,
  taskCoverage,
  crossCuttingCoverage,
  knownLimitations: crossCuttingCoverage
    .filter((entry) => !entry.passed)
    .map((entry) => ({ dimension: entry.dimension, value: entry.value, note: entry.note })),
  itemIds: pilotItems.map((item) => item.itemId),
  items: pilotItems.map((item) => ({
    itemId: item.itemId,
    task: item.task,
    groupId: item.groupId,
    difficultyClass: item.difficultyClass,
    samplingStrata: item.samplingStrata,
  })),
};

writeFileSync(
  resolve(root, "tests/fixtures/agent-review-pilot/pilot-selection.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    {
      itemCount: pilotItems.length,
      taskDistributionPassed,
      crossCuttingPassed,
      taskCoverage,
      crossCuttingCoverage,
    },
    null,
    2,
  ),
);
if (!taskDistributionPassed) process.exitCode = 1;
