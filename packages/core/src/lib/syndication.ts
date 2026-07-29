import type { RawSourceRecord } from "../schemas/raw-source-record";
import type { SyndicationRelation } from "../schemas/syndication-relation";
import { tokenJaccardSimilarity } from "./duplicate-scoring";
import { normalizeComparisonText } from "./text-normalization";

function combinedText(record: RawSourceRecord): string {
  return [record.headline, record.publisherAbstract, record.fixtureText].filter(Boolean).join(" ");
}

export function detectSyndication(
  left: RawSourceRecord,
  right: RawSourceRecord,
  rulesVersion: string,
): SyndicationRelation {
  const text = normalizeComparisonText(`${combinedText(left)} ${combinedText(right)}`);
  const explicitAttribution = /\b(reuters|associated press|fixture newswire)\b/.test(text);
  const sameChecksum = Boolean(
    left.contentChecksum && left.contentChecksum === right.contentChecksum,
  );
  const sameArticleId = Boolean(
    left.sourceProvidedArticleId && left.sourceProvidedArticleId === right.sourceProvidedArticleId,
  );
  const similarity = tokenJaccardSimilarity(combinedText(left), combinedText(right));
  const differentPublishers = left.sourceRegistryId !== right.sourceRegistryId;
  if (differentPublishers && (sameChecksum || (explicitAttribution && similarity >= 0.65))) {
    return {
      leftRawRecordId: left.rawRecordId,
      rightRawRecordId: right.rawRecordId,
      relationship: explicitAttribution ? "attributed_republication" : "distribution_copy",
      underlyingWorkId: `work-${left.sourceProvidedArticleId ?? left.rawRecordId}`,
      syndicationFamilyId: `syndication-${left.sourceProvidedArticleId ?? left.rawRecordId}`,
      confidence: sameChecksum ? "high" : "medium",
      explanationCodes: [
        sameChecksum ? "SYNDICATION_IDENTICAL_CONTENT" : "SYNDICATION_ATTRIBUTED_SIMILAR_COPY",
      ],
      reviewStatus: sameChecksum ? "accepted" : "review_required",
      countsAsIndependentConfirmation: false,
      rulesVersion,
    };
  }
  if (!differentPublishers && sameArticleId) {
    return {
      leftRawRecordId: left.rawRecordId,
      rightRawRecordId: right.rawRecordId,
      relationship: "original",
      underlyingWorkId: `work-${left.sourceProvidedArticleId}`,
      confidence: "high",
      explanationCodes: ["SAME_PUBLISHER_WORK_NOT_SYNDICATION"],
      reviewStatus: "accepted",
      countsAsIndependentConfirmation: false,
      rulesVersion,
    };
  }
  return {
    leftRawRecordId: left.rawRecordId,
    rightRawRecordId: right.rawRecordId,
    relationship: "independent_reporting",
    confidence: similarity > 0.85 ? "medium" : "high",
    explanationCodes: ["NO_SYNDICATION_SIGNAL", "EVENT_SIMILARITY_IS_NOT_SYNDICATION"],
    reviewStatus: similarity > 0.85 ? "review_required" : "accepted",
    countsAsIndependentConfirmation: true,
    rulesVersion,
  };
}
