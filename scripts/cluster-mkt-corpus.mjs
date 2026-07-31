#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  loadCorpus,
  root,
  stratifiedPartition,
  taskCounts,
} from "./lib/gold-corpus-evaluation.mjs";

const args = process.argv.slice(2);
const command = args[0] ?? "report";
const json = args.includes("--json");
const option = (name, fallback = "") => {
  const index = args.indexOf(name);
  return index >= 0 ? (args[index + 1] ?? fallback) : fallback;
};
const corpus = loadCorpus();
const stateRoot = resolve(root, ".tmp/gold-corpus-workflow");
const statePath = resolve(stateRoot, "reviewer-drafts.json");
const emit = (value) =>
  console.log(
    json
      ? JSON.stringify(value, null, 2)
      : typeof value === "string"
        ? value
        : Object.entries(value)
            .map(
              ([key, item]) =>
                `${key}: ${Array.isArray(item) ? item.join(", ") : typeof item === "object" ? JSON.stringify(item) : item}`,
            )
            .join("\n"),
  );
const refuse = (message) => {
  console.error(`REFUSED: ${message}`);
  process.exitCode = 2;
};
const itemId = option("--item-id");
const item = corpus.items.find((candidate) => candidate.itemId === itemId);
const readDrafts = () =>
  existsSync(statePath)
    ? JSON.parse(readFileSync(statePath, "utf8"))
    : { assignments: [], decisions: [], adjudications: [], goldLabels: [], amendments: [] };
const writeDrafts = (drafts) => {
  mkdirSync(stateRoot, { recursive: true });
  writeFileSync(statePath, `${JSON.stringify(drafts, null, 2)}\n`);
};

if (args.includes("--live")) refuse("live mode does not exist for the calibration corpus");
else if (command === "list")
  emit({
    warning: "OFFLINE CANDIDATE CORPUS — HUMAN LABELS REQUIRED",
    itemCount: corpus.items.length,
    taskCounts: taskCounts(corpus.items),
  });
else if (command === "inspect") {
  if (!item) refuse(`unknown item ${itemId}`);
  else
    emit({
      itemId: item.itemId,
      task: item.task,
      evidencePackage: item.evidencePackage,
      evidenceDepth: item.evidenceDepth,
      allowedReviewerVisibleFields: item.allowedReviewerVisibleFields,
      predictionVisible: false,
      peerDecisionsVisible: false,
      partition: stratifiedPartition(corpus.items).byGroup[item.groupId],
    });
} else if (command === "assign") {
  const reviewerId = option("--reviewer-id");
  const reviewerRole = option("--role", "reviewer");
  if (!item || !/^reviewer-[a-z0-9-]+$/.test(reviewerId))
    refuse("assign requires a valid --item-id and fixture-safe --reviewer-id");
  else if (!["reviewer", "senior_reviewer"].includes(reviewerRole))
    refuse("initial assignments allow reviewer or senior_reviewer roles only");
  else {
    const drafts = readDrafts();
    if (
      drafts.assignments.some(
        (assignment) => assignment.itemId === itemId && assignment.reviewerId === reviewerId,
      )
    )
      refuse("that reviewer already has an assignment for this item");
    else {
      const assignment = {
        assignmentId: `assignment-${itemId.replace("gold-item-", "")}-${reviewerId.replace("reviewer-", "")}`,
        itemId,
        task: item.task,
        reviewerId,
        reviewerRole,
        assignmentOrder:
          drafts.assignments.filter((candidate) => candidate.itemId === itemId).length + 1,
        predictionVisible: false,
        peerDecisionsVisible: false,
        adjudicationVisible: false,
        assignedAt: new Date().toISOString(),
        dueAt: null,
        status: "assigned",
      };
      drafts.assignments.push(assignment);
      writeDrafts(drafts);
      emit({ ...assignment, requiredIndependentReviews: item.expectedReviewCount });
    }
  }
} else if (command === "submit") {
  const reviewerId = option("--reviewer-id");
  const label = option("--label");
  const cannotDetermine = args.includes("--cannot-determine");
  const insufficientEvidence = args.includes("--insufficient-evidence");
  if (!item || !reviewerId || (!label && !cannotDetermine && !insufficientEvidence))
    refuse(
      "submit requires --item-id, --reviewer-id, and one of --label, --cannot-determine, or --insufficient-evidence",
    );
  else if ([Boolean(label), cannotDetermine, insufficientEvidence].filter(Boolean).length !== 1)
    refuse("choose exactly one label or abstention option");
  else {
    const drafts = readDrafts();
    const assignment = drafts.assignments.find(
      (candidate) => candidate.itemId === itemId && candidate.reviewerId === reviewerId,
    );
    if (!assignment) {
      refuse("reviewer must receive a blinded assignment before submitting");
      process.exit();
    }
    if (
      drafts.decisions.some(
        (decision) => decision.itemId === itemId && decision.reviewerId === reviewerId,
      )
    )
      refuse("reviewer already submitted an initial decision; use an amendment workflow");
    else {
      const decision = {
        decisionId: `decision-${itemId.replace("gold-item-", "")}-${reviewerId.replace("reviewer-", "")}`,
        assignmentId: assignment.assignmentId,
        itemId,
        task: item.task,
        reviewerId,
        selectedLabelIds: label ? [label.startsWith("label-") ? label : `label-${label}`] : [],
        cannotDetermine,
        insufficientEvidence,
        confidence: option("--confidence", "medium"),
        notes: option("--notes"),
        evidenceCitations: option("--evidence", "visible-evidence-package")
          .split(",")
          .filter(Boolean),
        submittedAt: new Date().toISOString(),
        predictionVisibleAtSubmission: false,
        peerDecisionsVisibleAtSubmission: false,
        adjudicationVisibleAtSubmission: false,
        amendments: [],
        status: "submitted",
      };
      drafts.decisions.push(decision);
      assignment.status = "submitted";
      writeDrafts(drafts);
      emit({ ...decision, localStateOnly: true, goldLabel: false });
    }
  }
} else if (command === "adjudicate") {
  const drafts = readDrafts();
  const decisions = drafts.decisions.filter((decision) => decision.itemId === itemId);
  const adjudicatorId = option("--adjudicator-id");
  const finalLabel = option("--label");
  const reason = option("--reason");
  const evidence = option("--evidence");
  if (!item || new Set(decisions.map(({ reviewerId }) => reviewerId)).size < 2)
    refuse("adjudication requires at least two independent local human decisions");
  else if (!/^reviewer-[a-z0-9-]+$/.test(adjudicatorId) || !finalLabel || !reason || !evidence)
    refuse("adjudicate requires --adjudicator-id, --label, --reason, and --evidence");
  else if (decisions.some(({ reviewerId }) => reviewerId === adjudicatorId))
    refuse("the adjudicator must be independent from initial reviewers");
  else {
    const adjudication = {
      adjudicationId: `adjudication-${itemId.replace("gold-item-", "")}-${drafts.adjudications.length + 1}`,
      itemId,
      task: item.task,
      reviewerDecisionIds: decisions.map(({ decisionId }) => decisionId),
      finalLabelIds: [finalLabel.startsWith("label-") ? finalLabel : `label-${finalLabel}`],
      reason,
      evidenceCited: evidence.split(",").filter(Boolean),
      guidelineClarificationNeeded: args.includes("--guideline-clarification"),
      regressionFixtureRecommended: args.includes("--regression-candidate"),
      thresholdReviewRecommended: args.includes("--threshold-review"),
      confidence: option("--confidence", "medium"),
      adjudicatorId,
      adjudicatedAt: new Date().toISOString(),
      unresolved: args.includes("--unresolved"),
    };
    drafts.adjudications.push(adjudication);
    writeDrafts(drafts);
    emit({ ...adjudication, localStateOnly: true });
  }
} else if (command === "agreement") {
  const decisions = readDrafts().decisions;
  const byItem = Object.groupBy(decisions, ({ itemId: decisionItemId }) => decisionItemId);
  const paired = Object.values(byItem).filter((values) => values?.length >= 2);
  const comparable = paired.map((values) =>
    values
      .slice(0, 2)
      .map((decision) =>
        decision.cannotDetermine
          ? "cannot_determine"
          : decision.insufficientEvidence
            ? "insufficient_evidence"
            : [...decision.selectedLabelIds].sort().join("|"),
      ),
  );
  const agreements = comparable.filter(([left, right]) => left === right).length;
  emit({
    status: comparable.length ? "measurable_local_drafts" : "blocked_pending_human_review",
    pairedItems: comparable.length,
    rawAgreement: comparable.length ? agreements / comparable.length : null,
    fabricatedValues: 0,
    warning: "Local draft metrics are not corpus gold metrics.",
  });
} else if (command === "partition")
  emit({
    seed: "cluster-mkt-gold-v1-seed",
    groupingKey: "event_or_underlying_work",
    ...stratifiedPartition(corpus.items),
  });
else if (command === "calibrate")
  emit({
    calibrationVersion: "calibration-v1",
    status: "blocked_pending_human_review",
    thresholdChanges: 0,
  });
else if (command === "replay")
  emit({
    status: "blocked_pending_human_review",
    heldOutAccuracy: null,
    criticalFixtureRegressions: 0,
  });
else if (command === "promote") {
  const drafts = readDrafts();
  const adjudication = [...drafts.adjudications]
    .reverse()
    .find((candidate) => candidate.itemId === itemId && !candidate.unresolved);
  const decisions = drafts.decisions.filter((decision) => decision.itemId === itemId);
  if (!item || !adjudication || new Set(decisions.map(({ reviewerId }) => reviewerId)).size < 2)
    refuse("promotion requires a resolved adjudication and two independent reviews");
  else if (!args.includes("--confirm-local-promotion"))
    refuse("promotion is explicit; repeat with --confirm-local-promotion to write local state");
  else {
    const goldLabel = {
      goldLabelId: `gold-label-${itemId.replace("gold-item-", "")}`,
      itemId,
      corpusVersion: item.corpusVersion,
      finalLabelIds: adjudication.finalLabelIds,
      adjudicationId: adjudication.adjudicationId,
      independentReviewerDecisionIds: decisions.map(({ decisionId }) => decisionId),
      status: "local_candidate_not_corpus_gold",
    };
    drafts.goldLabels.push(goldLabel);
    writeDrafts(drafts);
    emit({ ...goldLabel, promotedToRepositoryFixtures: false });
  }
} else if (command === "report")
  emit({
    corpusVersion: "gold-corpus-v1",
    itemCount: corpus.items.length,
    reviewerDecisions: corpus.decisions.length,
    adjudications: corpus.adjudications.length,
    goldLabels: corpus.goldLabels.length,
    status: "ready_for_human_review",
  });
else
  refuse(
    "use list, inspect, assign, submit, adjudicate, agreement, partition, calibrate, replay, promote, or report",
  );
