import type { CalibrationResult } from "../schemas/calibration-result";

export interface ThresholdObservation {
  score: number;
  expectedPositive: boolean;
  critical: boolean;
}

export function calibrateThreshold(
  thresholdId: string,
  oldThreshold: number,
  observations: readonly ThresholdObservation[],
  candidateThresholds: readonly number[],
  objective: string,
): CalibrationResult {
  if (!observations.length) {
    return {
      calibrationVersion: "calibration-v1",
      thresholdId,
      trainingCorpusVersion: "gold-corpus-v1:training",
      calibrationCorpusVersion: "gold-corpus-v1:calibration",
      heldOutCorpusVersion: "gold-corpus-v1:held-out-untouched",
      objective,
      oldThreshold,
      chosenThreshold: null,
      alternatives: [],
      metrics: { precision: null, recall: null, criticalFailures: null },
      tradeoffs: ["No threshold change is permitted before independent human labels exist."],
      approvalStatus: "blocked_pending_human_review",
      blockingReasons: ["NO_ADJUDICATED_GOLD_OBSERVATIONS", "HELD_OUT_EVALUATION_NOT_AVAILABLE"],
    };
  }
  const alternatives = candidateThresholds.map((threshold) => {
    const accepted = observations.filter(({ score }) => score >= threshold);
    const truePositive = accepted.filter(({ expectedPositive }) => expectedPositive).length;
    const falsePositive = accepted.length - truePositive;
    const positives = observations.filter(({ expectedPositive }) => expectedPositive).length;
    const criticalFailures = accepted.filter(
      ({ expectedPositive, critical }) => !expectedPositive && critical,
    ).length;
    return {
      threshold,
      precision: accepted.length ? truePositive / accepted.length : 1,
      recall: positives ? truePositive / positives : 1,
      criticalFailures,
      falsePositive,
    };
  });
  const viable = alternatives
    .filter(({ criticalFailures }) => criticalFailures === 0)
    .sort((a, b) => b.precision - a.precision || b.recall - a.recall || b.threshold - a.threshold);
  const chosen = viable[0];
  return {
    calibrationVersion: "calibration-v1",
    thresholdId,
    trainingCorpusVersion: "gold-corpus-v1:training",
    calibrationCorpusVersion: "gold-corpus-v1:calibration",
    heldOutCorpusVersion: "gold-corpus-v1:held-out-untouched",
    objective,
    oldThreshold,
    chosenThreshold: chosen?.threshold ?? null,
    alternatives: alternatives.map(({ threshold, precision, recall, criticalFailures }) => ({
      threshold,
      precision,
      recall,
      criticalFailures,
    })),
    metrics: {
      precision: chosen?.precision ?? null,
      recall: chosen?.recall ?? null,
      criticalFailures: chosen?.criticalFailures ?? null,
    },
    tradeoffs: [
      "Critical precision is ranked before recall.",
      "Held-out approval is still required.",
    ],
    approvalStatus: "proposed",
    blockingReasons: ["HELD_OUT_APPROVAL_REQUIRED"],
  };
}
