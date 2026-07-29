import type { QuarantineReason } from "../schemas/quarantine-reason";
import type { QuarantineRecord } from "../schemas/quarantine-record";

export function routeToQuarantine(
  input: Omit<QuarantineRecord, "reviewStatus" | "releaseRequirements"> & {
    reason: QuarantineReason;
  },
): QuarantineRecord {
  return {
    ...input,
    reviewStatus: "pending",
    releaseRequirements: [
      "Human review",
      `Resolve ${input.reason}`,
      "Revalidate provenance before release",
    ],
  };
}
