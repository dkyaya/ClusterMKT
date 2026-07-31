import type { Adjudication } from "../schemas/adjudication";
import type { AnnotationItem } from "../schemas/annotation-item";
import type { GoldLabel } from "../schemas/gold-label";

export function evaluateRegressionPromotion(
  item: AnnotationItem,
  goldLabel: GoldLabel | undefined,
  adjudication: Adjudication | undefined,
) {
  const reasons = [
    ...(!goldLabel || goldLabel.status === "withdrawn" ? ["FINAL_GOLD_LABEL_REQUIRED"] : []),
    ...(!adjudication || adjudication.unresolved ? ["RESOLVED_ADJUDICATION_REQUIRED"] : []),
    ...(!item.provenance.length ? ["PROVENANCE_REQUIRED"] : []),
    ...(item.copyrightClassification === "metadata_only" && item.task === "claims"
      ? ["METADATA_ONLY_CLAIM_NOT_PROMOTABLE"]
      : []),
    ...(item.regressionFixtureStatus === "ineligible" ? ["ITEM_MARKED_INELIGIBLE"] : []),
  ];
  return {
    eligible: reasons.length === 0 && Boolean(adjudication?.regressionFixtureRecommended),
    reasons: reasons.length ? reasons : ["GOLD_EDGE_CASE_READY_FOR_REGRESSION_REVIEW"],
  };
}
