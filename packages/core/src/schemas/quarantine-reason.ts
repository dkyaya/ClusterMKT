import { z } from "zod";

export const QuarantineReasonSchema = z.enum([
  "invalid_schema",
  "missing_required_metadata",
  "unsupported_language",
  "unsupported_content_type",
  "conflicting_source_identity",
  "idempotency_collision",
  "malformed_url",
  "untrusted_source_tag",
  "terms_not_approved",
  "source_disabled",
  "suspicious_timestamp",
  "future_timestamp",
  "duplicate_raw_id_collision",
  "provenance_incomplete",
  "adapter_contract_violation",
  "content_checksum_conflict",
  "unknown_error",
]);

export type QuarantineReason = z.infer<typeof QuarantineReasonSchema>;
