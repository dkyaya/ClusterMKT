import type { EventSignature, EventType } from "../schemas/event-signature";

export interface EventSignatureInput {
  id: string;
  eventType: EventType;
  primaryEntityIds: string[];
  secondaryEntityIds?: string[];
  sectorId?: string;
  subindustryIds?: string[];
  macroTopicIds?: string[];
  action: string;
  objectOfAction?: string;
  effectiveDate?: string;
  announcementDate?: string;
  geography?: string;
  policyOrFilingId?: string;
  productOrBusinessLine?: string;
  quantitativeAnchors?: string[];
  directionalDescriptors?: string[];
  sourceFamilyEvidence: string[];
  confidence?: "high" | "medium" | "low";
  reviewStatus?: "accepted" | "review_required" | "rejected" | "quarantined";
}

export function buildEventSignature(
  input: EventSignatureInput,
  rulesVersion: string,
): EventSignature {
  return {
    eventSignatureId: input.id,
    eventType: input.eventType,
    primaryEntityIds: input.primaryEntityIds,
    secondaryEntityIds: input.secondaryEntityIds ?? [],
    ...(input.sectorId ? { sectorId: input.sectorId } : {}),
    subindustryIds: input.subindustryIds ?? [],
    macroTopicIds: input.macroTopicIds ?? [],
    action: input.action,
    ...(input.objectOfAction ? { objectOfAction: input.objectOfAction } : {}),
    ...(input.effectiveDate ? { effectiveDate: input.effectiveDate } : {}),
    ...(input.announcementDate ? { announcementDate: input.announcementDate } : {}),
    ...(input.geography ? { geography: input.geography } : {}),
    ...(input.policyOrFilingId ? { policyOrFilingId: input.policyOrFilingId } : {}),
    ...(input.productOrBusinessLine ? { productOrBusinessLine: input.productOrBusinessLine } : {}),
    quantitativeAnchors: input.quantitativeAnchors ?? [],
    directionalDescriptors: input.directionalDescriptors ?? [],
    sourceFamilyEvidence: input.sourceFamilyEvidence,
    confidence: input.confidence ?? "high",
    reviewStatus: input.reviewStatus ?? "accepted",
    explanationCodes: ["EVENT_SIGNATURE_STRUCTURED_EVIDENCE"],
    rulesVersion,
  };
}
