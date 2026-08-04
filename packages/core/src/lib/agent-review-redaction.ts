import type { AnnotationItem } from "../schemas/annotation-item";

export const FORBIDDEN_AGENT_PACKET_MARKERS = [
  "hiddenPrediction",
  "goldLabel",
  "gold-label",
  "finalGoldLabelId",
  "goldLabelConfidence",
  "adjudicationDecisionId",
  "reviewerDecisionIds",
  "reviewAssignmentIds",
  "adjudicatorNotes",
  "reviewerNotes",
  "amendmentHistory",
  "regressionFixtureStatus",
  "expectedLabel",
  "expected_label",
  "pipelinePrediction",
  "pipeline_prediction",
  "thresholdVersion",
  "consensus",
  "gold-item-",
] as const;

export interface RedactedAgentEvidence {
  headline: string;
  abstract: string | null;
  structuredFields: Record<string, string>;
  permittedExcerpt: string | null;
  provenance: string[];
}

export function redactItemForAgentPacket(item: AnnotationItem): RedactedAgentEvidence {
  return {
    headline: item.evidencePackage.headline,
    abstract: item.evidencePackage.abstract,
    structuredFields: { ...item.evidencePackage.structuredFields },
    permittedExcerpt: item.evidencePackage.permittedExcerpt,
    provenance: item.allowedReviewerVisibleFields.includes("provenance")
      ? [...item.provenance]
      : [],
  };
}
