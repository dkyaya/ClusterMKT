import type { AgentAdjudication } from "../schemas/agent-adjudication";

const REQUIRED_ADJUDICATION_FIELDS = [
  "panelId",
  "packetId",
  "packetHash",
  "confidence",
  "outcome",
  "adjudicatedAt",
] as const;

export interface AdjudicationShapeValidation {
  passed: boolean;
  missingFields: string[];
}

export function validateAgentAdjudicationShape(candidate: unknown): AdjudicationShapeValidation {
  if (typeof candidate !== "object" || candidate === null) {
    return { passed: false, missingFields: [...REQUIRED_ADJUDICATION_FIELDS] };
  }
  const record = candidate as Record<string, unknown>;
  const missingFields = REQUIRED_ADJUDICATION_FIELDS.filter((field) => !(field in record));
  return { passed: missingFields.length === 0, missingFields };
}

export function adjudicationReferencesAnonymizedReviewers(
  adjudication: AgentAdjudication,
): boolean {
  return [...adjudication.decisionsAccepted, ...adjudication.decisionsRejected].every((id) =>
    /^panel-member-\d+$/.test(id),
  );
}
