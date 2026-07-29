import type { IdempotencyDecision } from "../schemas/idempotency-decision";
import { buildIdempotencyKey } from "./idempotency-key";

export interface ExistingIdempotentRecord {
  recordId: string;
  contentChecksum?: string;
  metadataChecksum?: string;
  rulesVersion: string;
}

export function decideIdempotency(input: {
  kind: "raw" | "article_version" | "run" | "cluster" | "sector_brief";
  stableInputs: readonly (string | number | boolean | null)[];
  proposedRecordId: string;
  contentChecksum?: string;
  metadataChecksum?: string;
  rulesVersion: string;
  existing?: ExistingIdempotentRecord;
}): IdempotencyDecision {
  const key = buildIdempotencyKey(input.kind, input.stableInputs);
  if (!input.existing) {
    return {
      idempotencyKey: key,
      decision: "create",
      existingRecordId: null,
      newRecordId: input.proposedRecordId,
      duplicateReason: null,
      updateReason: null,
      reviewRequired: false,
      explanationCodes: ["IDEMPOTENCY_KEY_NEW"],
    };
  }
  if (input.existing.rulesVersion !== input.rulesVersion) {
    return {
      idempotencyKey: key,
      decision: "update_existing",
      existingRecordId: input.existing.recordId,
      newRecordId: input.proposedRecordId,
      duplicateReason: null,
      updateReason: "Rules-version reprocessing preserves the earlier record.",
      reviewRequired: false,
      explanationCodes: ["RULES_VERSION_REPROCESS"],
    };
  }
  if (
    input.contentChecksum &&
    input.existing.contentChecksum &&
    input.contentChecksum !== input.existing.contentChecksum
  ) {
    return {
      idempotencyKey: key,
      decision: "link_version",
      existingRecordId: input.existing.recordId,
      newRecordId: input.proposedRecordId,
      duplicateReason: null,
      updateReason: "Content changed under the same stable source identity.",
      reviewRequired: false,
      explanationCodes: ["ARTICLE_VERSION_CONTENT_CHANGED"],
    };
  }
  if (
    input.metadataChecksum &&
    input.existing.metadataChecksum &&
    input.metadataChecksum !== input.existing.metadataChecksum
  ) {
    return {
      idempotencyKey: key,
      decision: "link_version",
      existingRecordId: input.existing.recordId,
      newRecordId: input.proposedRecordId,
      duplicateReason: null,
      updateReason: "Metadata changed under the same stable source identity.",
      reviewRequired: false,
      explanationCodes: ["ARTICLE_VERSION_METADATA_CHANGED"],
    };
  }
  if (
    (input.contentChecksum &&
      input.existing.contentChecksum &&
      input.contentChecksum === input.existing.contentChecksum) ||
    (input.metadataChecksum &&
      input.existing.metadataChecksum &&
      input.metadataChecksum === input.existing.metadataChecksum)
  ) {
    return {
      idempotencyKey: key,
      decision: "skip_exact_duplicate",
      existingRecordId: input.existing.recordId,
      newRecordId: null,
      duplicateReason: "Stable identity and checksums match.",
      updateReason: null,
      reviewRequired: false,
      explanationCodes: ["EXACT_REPLAY_SKIPPED"],
    };
  }
  return {
    idempotencyKey: key,
    decision: "quarantine_collision",
    existingRecordId: input.existing.recordId,
    newRecordId: null,
    duplicateReason: "A stable key collided without comparable checksums.",
    updateReason: null,
    reviewRequired: true,
    explanationCodes: ["IDEMPOTENCY_COLLISION_QUARANTINED"],
  };
}
