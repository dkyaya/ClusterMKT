import type { ArticleRelationship, ArticleVersion } from "../schemas/article-version";
import type { RawSourceRecord } from "../schemas/raw-source-record";
import { detectArticleChanges } from "./article-update-detection";

export interface ArticleVersionDecision {
  relationship: ArticleRelationship;
  sameUnderlyingWork: boolean;
  version: ArticleVersion;
}

export function classifyArticleVersion(
  previous: RawSourceRecord,
  next: RawSourceRecord,
  previousVersion: ArticleVersion | undefined,
  rulesVersion: string,
  sameEvent = true,
): ArticleVersionDecision {
  const samePublisher = previous.sourceRegistryId === next.sourceRegistryId;
  const sameStableId = Boolean(
    previous.sourceProvidedArticleId &&
    previous.sourceProvidedArticleId === next.sourceProvidedArticleId,
  );
  const sameUrlClaim = Boolean(
    previous.sourceCanonicalUrlClaim &&
    previous.sourceCanonicalUrlClaim === next.sourceCanonicalUrlClaim,
  );
  const changes = detectArticleChanges(previous, next);
  let relationship: ArticleRelationship;
  let sameUnderlyingWork = samePublisher && (sameStableId || sameUrlClaim);
  if (previous.metadataChecksum === next.metadataChecksum) relationship = "exact_duplicate";
  else if (sameUnderlyingWork)
    relationship = changes.materialChange ? "materially_revised_version" : "updated_version";
  else if (sameEvent) relationship = "new_article_same_event";
  else relationship = "new_event_same_entity";
  if (relationship.startsWith("new_")) sameUnderlyingWork = false;
  const workId = sameUnderlyingWork
    ? (previousVersion?.underlyingWorkId ??
      `work-${previous.sourceProvidedArticleId ?? previous.rawRecordId}`)
    : `work-${next.sourceProvidedArticleId ?? next.rawRecordId}`;
  const versionNumber = sameUnderlyingWork ? (previousVersion?.versionNumber ?? 1) + 1 : 1;
  return {
    relationship,
    sameUnderlyingWork,
    version: {
      articleVersionId: `version-${next.rawRecordId}`,
      underlyingWorkId: workId,
      versionNumber,
      ...(sameUnderlyingWork && previousVersion
        ? { predecessorVersionId: previousVersion.articleVersionId }
        : {}),
      firstSeenAt: previousVersion?.firstSeenAt ?? previous.retrievedAt,
      latestSeenAt: next.retrievedAt,
      changedFields: changes.changedFields,
      materialChange: changes.materialChange,
      superseded: false,
      relationship,
      explanationCodes: [
        sameUnderlyingWork ? "VERSION_STABLE_WORK_IDENTIFIER" : "VERSION_DISTINCT_WORK",
        changes.materialChange ? "VERSION_MATERIAL_CHANGE" : "VERSION_NON_MATERIAL_CHANGE",
      ],
      provenance: [
        {
          rawRecordId: next.rawRecordId,
          field: "metadata",
          payloadRef: next.originalMetadataPayloadRef,
        },
      ],
      rulesVersion,
    },
  };
}
