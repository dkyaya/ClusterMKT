#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  AGENT_REVIEWER_PSEUDONYMS,
  agentPanelPolicy,
  buildAgentReviewPacket,
  classifyAgentReviewRisk,
  REQUIRED_RESPONSE_FIELDS,
  validatePacketLeakage,
} from "./lib/agent-review-pilot-shared.mjs";

const root = resolve(import.meta.dirname, "..");
const seed = "cluster-mkt-agent-pilot-v1-seed";

const pilotSelection = JSON.parse(
  readFileSync(resolve(root, "tests/fixtures/agent-review-pilot/pilot-selection.json"), "utf8"),
);
const corpus = JSON.parse(
  readFileSync(resolve(root, "tests/fixtures/gold-corpus/items/corpus-items.json"), "utf8"),
);
const corpusById = new Map(corpus.items.map((item) => [item.itemId, item]));

function assignPanel(roles, offset = 0) {
  return roles.map((role, index) => ({
    role,
    reviewerId: AGENT_REVIEWER_PSEUDONYMS[(index + offset) % AGENT_REVIEWER_PSEUDONYMS.length],
    anonymizedMemberId: `panel-member-${index + 1}`,
  }));
}

function leanEvidence(fullItem) {
  const reviewerQuestion = fullItem.evidencePackage.structuredFields?.reviewerQuestion ?? null;
  return {
    headline: fullItem.evidencePackage.headline,
    abstract: fullItem.evidencePackage.abstract,
    reviewerQuestion,
    permittedExcerpt: fullItem.evidencePackage.permittedExcerpt,
  };
}

let totalPackets = 0;
let leakageFound = 0;
const fullPilotItems = [];
const leanPilotItems = [];

for (const selection of pilotSelection.items) {
  const fullItem = corpusById.get(selection.itemId);
  if (!fullItem) throw new Error(`missing corpus item ${selection.itemId}`);
  const { riskClass, reasons } = classifyAgentReviewRisk(fullItem);
  const roles = agentPanelPolicy.riskRoles[riskClass];
  const assignments = assignPanel(roles);
  const panel = assignments.map((assignment) => {
    const packet = buildAgentReviewPacket({
      item: fullItem,
      role: assignment.role,
      riskClass,
      seed,
      requiredResponseFields: REQUIRED_RESPONSE_FIELDS,
    });
    totalPackets += 1;
    const leakage = validatePacketLeakage(packet);
    if (!leakage.passed) leakageFound += 1;
    return { ...assignment, packet, leakage };
  });
  fullPilotItems.push({
    itemId: selection.itemId,
    task: selection.task,
    riskClass,
    riskReasons: reasons,
    panelSize: roles.length,
    panel,
  });
  leanPilotItems.push({
    itemId: selection.itemId,
    task: selection.task,
    difficultyClass: fullItem.difficultyClass,
    riskClass,
    riskReasons: reasons,
    roles,
    evidence: leanEvidence(fullItem),
  });
}

// 10-item repeat-stability subset: 3 low, 4 standard, 3 high risk, deterministically first by itemId.
const byRisk = { low: [], standard: [], high: [] };
for (const item of [...fullPilotItems].sort((a, b) => a.itemId.localeCompare(b.itemId))) {
  byRisk[item.riskClass].push(item);
}
const repeatTargetIds = new Set(
  [...byRisk.low.slice(0, 3), ...byRisk.standard.slice(0, 4), ...byRisk.high.slice(0, 3)].map(
    (item) => item.itemId,
  ),
);
const leanRepeatItems = leanPilotItems.filter((item) => repeatTargetIds.has(item.itemId));

const decisionTotal = fullPilotItems.reduce((sum, item) => sum + item.panel.length, 0);
const riskDistribution = fullPilotItems.reduce((acc, item) => {
  acc[item.riskClass] = (acc[item.riskClass] ?? 0) + 1;
  return acc;
}, {});

const fullManifest = {
  pilotVersion: "agent-review-pilot-v1",
  corpusVersion: "gold-corpus-v1",
  deterministicSeed: seed,
  itemCount: fullPilotItems.length,
  decisionTotal,
  riskDistribution,
  panelSizePolicy: agentPanelPolicy.panelSizes,
  pilotItems: fullPilotItems,
  repeatStabilityItemCount: leanRepeatItems.length,
  repeatStabilityItemIds: [...repeatTargetIds],
  leakageReport: { totalPackets, leakageFound, passed: leakageFound === 0 },
};

const leanManifest = {
  pilotVersion: "agent-review-pilot-v1",
  corpusVersion: "gold-corpus-v1",
  deterministicSeed: seed,
  runTimestamp: "2026-07-31T00:00:00.000Z",
  items: leanPilotItems,
  repeatItems: leanRepeatItems,
};

const outDir = resolve(root, ".tmp/agent-review-pilot/coordinator");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  resolve(outDir, "packet-manifest.json"),
  `${JSON.stringify(fullManifest, null, 2)}\n`,
);
writeFileSync(resolve(outDir, "workflow-args.json"), `${JSON.stringify(leanManifest, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      itemCount: fullPilotItems.length,
      decisionTotal,
      riskDistribution,
      repeatStabilityItemCount: leanRepeatItems.length,
      leakageReport: fullManifest.leakageReport,
      leanManifestBytes: Buffer.byteLength(JSON.stringify(leanManifest)),
    },
    null,
    2,
  ),
);
if (leakageFound > 0) process.exitCode = 1;
