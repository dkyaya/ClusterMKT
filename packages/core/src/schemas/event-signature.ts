import { z } from "zod";
import {
  NormalizationConfidenceSchema,
  NormalizationReviewStatusSchema,
} from "./normalization-decision";

export const EventTypeSchema = z.enum([
  "earnings",
  "guidance",
  "capital_expenditure",
  "product_announcement",
  "regulation",
  "export_control",
  "tariff",
  "monetary_policy",
  "economic_release",
  "merger_or_acquisition",
  "management_change",
  "supply_disruption",
  "pricing_change",
  "capacity_change",
  "legal_or_regulatory_action",
  "analyst_action",
  "market_reaction",
  "other",
]);

export const EventSignatureSchema = z.object({
  eventSignatureId: z.string().min(1),
  eventType: EventTypeSchema,
  primaryEntityIds: z.array(z.string().min(1)).min(1),
  secondaryEntityIds: z.array(z.string().min(1)).default([]),
  sectorId: z.string().min(1).optional(),
  subindustryIds: z.array(z.string().min(1)).default([]),
  macroTopicIds: z.array(z.string().min(1)).default([]),
  action: z.string().min(1),
  objectOfAction: z.string().min(1).optional(),
  effectiveDate: z.iso.date().optional(),
  announcementDate: z.iso.date().optional(),
  geography: z.string().min(1).optional(),
  policyOrFilingId: z.string().min(1).optional(),
  productOrBusinessLine: z.string().min(1).optional(),
  quantitativeAnchors: z.array(z.string().min(1)).default([]),
  directionalDescriptors: z.array(z.string().min(1)).default([]),
  sourceFamilyEvidence: z.array(z.string().min(1)).min(1),
  confidence: NormalizationConfidenceSchema,
  reviewStatus: NormalizationReviewStatusSchema,
  explanationCodes: z.array(z.string().min(1)).min(1),
  rulesVersion: z.string().regex(/^normalization-v\d+$/),
});

export type EventSignature = z.infer<typeof EventSignatureSchema>;
export type EventType = z.infer<typeof EventTypeSchema>;
