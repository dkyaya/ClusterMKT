import type { RetrievalAttempt } from "../schemas/retrieval-attempt";
import {
  RetrievalProvenanceSchema,
  type RetrievalProvenance,
} from "../schemas/retrieval-provenance";
import { stableFingerprint } from "./idempotency-key";

export function createRetrievalProvenance(attempt: RetrievalAttempt): RetrievalProvenance {
  return RetrievalProvenanceSchema.parse({
    ...attempt,
    provenanceChecksum: stableFingerprint([
      attempt.retrievalAttemptId,
      attempt.ingestionRunId,
      attempt.requestFingerprint,
      attempt.response.responseFingerprint,
      attempt.registryVersion,
      attempt.rulesVersion,
    ]),
  });
}
