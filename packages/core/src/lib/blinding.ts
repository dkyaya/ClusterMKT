import type { AnnotationItem } from "../schemas/annotation-item";
import type { BlindedAnnotationItem } from "../types/calibration";

export function blindAnnotationItem(item: AnnotationItem): BlindedAnnotationItem {
  const {
    hiddenPrediction: _hiddenPrediction,
    reviewAssignmentIds: _reviewAssignmentIds,
    reviewerDecisionIds: _reviewerDecisionIds,
    reviewerNotes: _reviewerNotes,
    adjudicationDecisionId: _adjudicationDecisionId,
    finalGoldLabelId: _finalGoldLabelId,
    goldLabelConfidence: _goldLabelConfidence,
    adjudicatorNotes: _adjudicatorNotes,
    amendmentHistory: _amendmentHistory,
    regressionFixtureStatus: _regressionFixtureStatus,
    ...visible
  } = item;
  void _hiddenPrediction;
  void _reviewAssignmentIds;
  void _reviewerDecisionIds;
  void _reviewerNotes;
  void _adjudicationDecisionId;
  void _finalGoldLabelId;
  void _goldLabelConfidence;
  void _adjudicatorNotes;
  void _amendmentHistory;
  void _regressionFixtureStatus;
  return {
    ...visible,
    blinding: {
      predictionHidden: true,
      peerDecisionsHidden: true,
      adjudicationHidden: true,
    },
  };
}
