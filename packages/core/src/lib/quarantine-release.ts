import type { QuarantineRecord } from "../schemas/quarantine-record";

export function releaseQuarantine(
  record: QuarantineRecord,
  resolvedRequirements: readonly string[],
): QuarantineRecord {
  const complete = record.releaseRequirements.every((requirement) =>
    resolvedRequirements.includes(requirement),
  );
  if (!complete) throw new Error("QUARANTINE_RELEASE_REQUIREMENTS_INCOMPLETE");
  return { ...record, reviewStatus: "released", updatedAt: record.updatedAt };
}
