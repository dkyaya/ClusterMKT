import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  AnnotationItemSchema,
  ReviewerDecisionSchema,
  amendGoldLabel,
  appendDecisionAmendment,
  blindAnnotationItem,
  calibrateThreshold,
  cohensKappa,
  confusionMatrix,
  createReviewerAssignments,
  evaluateRegressionPromotion,
  evaluateSamplingCoverage,
  fleissKappa,
  partitionCorpus,
  precisionRecallForLabel,
  rawAgreement,
  validateReviewerSubmission,
  weightedKappa,
} from "../../packages/core/src/index";
import {
  calibrationThresholdCandidates,
  annotationLabelDefinitions,
  annotationTaskContracts,
  futureCredentialRequirements,
  goldCorpusSamplingPlan,
} from "../../packages/config/src/index";
import { describe, expect, it } from "vitest";

function hasItemArray(value: unknown): value is { items: unknown[] } {
  return (
    typeof value === "object" && value !== null && "items" in value && Array.isArray(value.items)
  );
}
const fixture: unknown = JSON.parse(
  readFileSync(
    resolve(import.meta.dirname, "../fixtures/gold-corpus/items/corpus-items.json"),
    "utf8",
  ),
) as unknown;
if (!hasItemArray(fixture)) throw new Error("Gold corpus fixture must contain an item array");
const items = fixture.items.map((item) => AnnotationItemSchema.parse(item));

describe("gold calibration candidate corpus", () => {
  it("contains 345 valid review-ready items with no automated gold labels", () => {
    expect(items).toHaveLength(345);
    expect(items.every((item) => item.finalStatus === "pending_review")).toBe(true);
    expect(items.every((item) => item.finalGoldLabelId === null)).toBe(true);
  });

  it("defines every reviewer label with a stable ID, definition, and judgment class", () => {
    const allDefinitions = Object.values(annotationLabelDefinitions).flat();
    expect(new Set(allDefinitions.map(([labelId]) => labelId)).size).toBe(allDefinitions.length);
    for (const [task, contract] of Object.entries(annotationTaskContracts)) {
      const definitions =
        annotationLabelDefinitions[task as keyof typeof annotationLabelDefinitions];
      expect(new Set(definitions.map(([, value]) => value))).toEqual(new Set(contract.labels));
      expect(
        definitions.every(
          ([labelId, , definition, objectiveClass]) =>
            labelId.startsWith("label-") &&
            definition.length > 20 &&
            ["objective", "judgment_based", "mixed"].includes(objectiveClass),
        ),
      ).toBe(true);
    }
  });

  it("meets every sampling minimum and issuer concentration limit", () => {
    const evaluation = evaluateSamplingCoverage(items, goldCorpusSamplingPlan);
    expect(evaluation.passed).toBe(true);
    expect(evaluation.taskFailures).toEqual([]);
  });

  it("hides predictions and peer-review state from initial reviewers", () => {
    const blinded = blindAnnotationItem(items[0]!);
    expect(blinded).not.toHaveProperty("hiddenPrediction");
    expect(blinded).not.toHaveProperty("reviewerDecisionIds");
    expect(blinded).not.toHaveProperty("reviewAssignmentIds");
    expect(blinded).not.toHaveProperty("reviewerNotes");
    expect(blinded).not.toHaveProperty("adjudicationDecisionId");
    expect(blinded).not.toHaveProperty("finalGoldLabelId");
    expect(blinded).not.toHaveProperty("amendmentHistory");
    expect(blinded).not.toHaveProperty("regressionFixtureStatus");
  });

  it("creates distinct deterministic assignments and blocks duplicate submission", () => {
    const assignments = createReviewerAssignments(
      items[0]!,
      ["reviewer-cedar", "reviewer-lake", "reviewer-orbit"],
      "2026-07-29T18:20:00.000Z",
      "seed-v1",
    );
    expect(assignments).toHaveLength(items[0]!.expectedReviewCount);
    expect(new Set(assignments.map(({ reviewerId }) => reviewerId)).size).toBe(assignments.length);
    const decision = ReviewerDecisionSchema.parse({
      decisionId: "decision-1",
      assignmentId: assignments[0]!.assignmentId,
      itemId: items[0]!.itemId,
      task: items[0]!.task,
      reviewerId: assignments[0]!.reviewerId,
      selectedLabelIds: ["label-exact-duplicate"],
      cannotDetermine: false,
      insufficientEvidence: false,
      confidence: "high" as const,
      notes: "Visible evidence only.",
      evidenceCitations: ["headline"],
      predictionVisibleAtSubmission: false,
      peerDecisionsVisibleAtSubmission: false,
      adjudicationVisibleAtSubmission: false,
      submittedAt: "2026-07-29T18:30:00.000Z",
      amendments: [],
      status: "submitted",
    });
    expect(validateReviewerSubmission(assignments[0]!, decision, []).accepted).toBe(true);
    expect(validateReviewerSubmission(assignments[0]!, decision, [decision])).toMatchObject({
      accepted: false,
      explanationCodes: ["DUPLICATE_REVIEWER_SUBMISSION"],
    });
    const amended = appendDecisionAmendment(
      decision,
      ["label-format-variant"],
      "The print-layout field was initially missed.",
      decision.reviewerId,
      "2026-07-29T19:00:00.000Z",
      "0123456789abcdef",
    );
    expect(amended.decisionId).not.toBe(decision.decisionId);
    expect(amended.amendments[0]).toMatchObject({
      priorLabelIds: ["label-exact-duplicate"],
      replacementLabelIds: ["label-format-variant"],
    });
    expect(decision.amendments).toEqual([]);
  });

  it("keeps event groups together across deterministic partitions", () => {
    const result = partitionCorpus(items, "cluster-mkt-gold-v1-seed");
    expect(result.passed).toBe(true);
    expect(result.leakingGroups).toEqual([]);
    expect(result.counts.held_out).toBeGreaterThan(0);
  });

  it("implements agreement metrics on explicit test vectors without fabricating corpus agreement", () => {
    expect(rawAgreement(["a", "b"], ["a", "b"])).toBe(1);
    expect(cohensKappa(["a", "b", "a", "b"], ["a", "b", "a", "b"])).toBe(1);
    expect(weightedKappa([0, 1, 2], [0, 1, 2], 2)).toBe(1);
    expect(
      fleissKappa([
        [2, 0],
        [0, 2],
      ]),
    ).toBe(1);
    expect(confusionMatrix(["a", "b", "a"], ["a", "a", "b"])).toMatchObject({
      labels: ["a", "b"],
      matrix: { a: { a: 1, b: 1 }, b: { a: 1, b: 0 } },
    });
    expect(precisionRecallForLabel(["yes", "no"], ["yes", "yes"], "yes")).toMatchObject({
      precision: 0.5,
      recall: 1,
    });
  });

  it("blocks calibration and regression promotion before human gold exists", () => {
    for (const candidate of calibrationThresholdCandidates) {
      const result = calibrateThreshold(
        candidate.thresholdId,
        candidate.current,
        [],
        candidate.candidates,
        candidate.objective,
      );
      expect(result.approvalStatus).toBe("blocked_pending_human_review");
      expect(result.chosenThreshold).toBeNull();
    }
    expect(evaluateRegressionPromotion(items[0]!, undefined, undefined)).toMatchObject({
      eligible: false,
      reasons: ["FINAL_GOLD_LABEL_REQUIRED", "RESOLVED_ADJUDICATION_REQUIRED"],
    });
  });

  it("amends a synthetic gold-record test vector without mutating history", () => {
    const prior = {
      goldLabelId: "gold-label-0001",
      itemId: "gold-item-0001",
      corpusVersion: "gold-corpus-v1",
      task: "source_normalization" as const,
      finalLabelIds: ["label-exact-duplicate"],
      adjudicationId: "adjudication-0001-1",
      independentReviewerDecisionIds: ["decision-0001-cedar", "decision-0001-lake"],
      confidence: "high" as const,
      provenance: ["fixture:test-vector"],
      finalizedAt: "2026-07-29T19:00:00.000Z",
      finalizedBy: "reviewer-orbit",
      amendments: [],
      status: "final" as const,
    };
    const amended = amendGoldLabel(
      prior,
      ["label-format-variant"],
      "Adjudicated fixture metadata clarified the relationship.",
      "reviewer-orbit",
      "2026-07-29T20:00:00.000Z",
      "fedcba9876543210",
    );
    expect(amended.finalLabelIds).toEqual(["label-format-variant"]);
    expect(amended.amendments[0]?.priorLabelIds).toEqual(["label-exact-duplicate"]);
    expect(prior.amendments).toEqual([]);
  });

  it("keeps all future credential classes disabled", () => {
    expect(futureCredentialRequirements.every(({ liveEnabled }) => !liveEnabled)).toBe(true);
  });
});
