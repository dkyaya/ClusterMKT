import type {
  Claim,
  ClaimEvidence,
  EventSignature,
  NormalizedSourceRecord,
} from "../../packages/core/src/index";

export const rulesVersion = "normalization-v1";

export function makeEvidence(overrides: Partial<ClaimEvidence> = {}): ClaimEvidence {
  return {
    evidenceId: "evidence-1",
    sourceRecordId: "normalized-1",
    rawRecordIds: ["raw-1"],
    underlyingWorkId: "work-1",
    sourceFamilyId: "family-1",
    evidenceDepth: "full_fixture_text",
    supportingSpan: "The fixture explicitly states the claim.",
    independent: true,
    primary: false,
    syndicated: false,
    acceptedForClaim: true,
    explanationCode: "FIXTURE_TEXT_SUPPORT",
    rulesVersion,
    ...overrides,
  };
}

export function makeClaim(overrides: Partial<Claim> = {}): Claim {
  return {
    claimId: "claim-one",
    clusterCandidateId: "candidate-one",
    claimType: "event_fact",
    claimText: "Northstar announced a capacity review.",
    normalizedProposition: "northstar announce capacity review",
    subjectEntityIds: ["company-northstar"],
    predicate: "announced",
    object: "capacity review",
    eventType: "capacity_change",
    timeScope: "2026-Q3",
    geography: "US",
    quantitativeValues: [],
    direction: "neutral",
    certaintyLanguage: "stated",
    attribution: "Northstar",
    evidenceIds: ["evidence-1"],
    independentSupportCount: 1,
    supportingUnderlyingWorkIds: ["work-1"],
    supportingSourceFamilyIds: ["family-1"],
    contradictingEvidenceIds: [],
    evidenceDepth: "full_fixture_text",
    claimStatus: "supported",
    confidence: "high",
    reviewStatus: "accepted",
    explanationCodes: ["FIXTURE_TEXT_SUPPORT"],
    rulesVersion,
    fixtureStatus: "fixture",
    ...overrides,
  };
}

export function makeEvent(overrides: Partial<EventSignature> = {}): EventSignature {
  return {
    eventSignatureId: "event-one",
    eventType: "capacity_change",
    primaryEntityIds: ["company-northstar"],
    secondaryEntityIds: [],
    sectorId: "semiconductors",
    subindustryIds: ["foundries_and_manufacturing"],
    macroTopicIds: [],
    action: "reviewed",
    objectOfAction: "capacity",
    effectiveDate: "2026-08-01",
    announcementDate: "2026-07-29",
    geography: "US",
    productOrBusinessLine: "foundry",
    quantitativeAnchors: ["10 percent"],
    directionalDescriptors: ["increase"],
    sourceFamilyEvidence: ["family-1"],
    confidence: "high",
    reviewStatus: "accepted",
    explanationCodes: ["DIRECT_EVENT_EVIDENCE"],
    rulesVersion,
    ...overrides,
  };
}

export function makeRecord(
  overrides: Partial<NormalizedSourceRecord> = {},
): NormalizedSourceRecord {
  return {
    normalizedRecordId: "normalized-1",
    contributingRawRecordIds: ["raw-1"],
    canonicalUrl: "https://fixture.invalid/article",
    normalizedPublisher: "Fixture Journal",
    sourceFamilyId: "family-1",
    sourceRole: "secondary",
    contentType: "article",
    normalizedHeadline: "Northstar reviews capacity",
    normalizedAuthors: ["Fixture Desk"],
    publishedAt: "2026-07-29T12:00:00.000Z",
    latestUpdatedAt: "2026-07-29T12:00:00.000Z",
    language: "en",
    accessType: "public",
    evidenceDepth: "full-text",
    textAvailable: true,
    podcastTranscriptStatus: "not_applicable",
    articleVersionId: "article-version-1",
    underlyingWorkId: "work-1",
    normalizationConfidence: "high",
    reviewStatus: "accepted",
    decisionCodes: ["NORMALIZED"],
    provenanceReferences: [
      { rawRecordId: "raw-1", field: "headline", payloadRef: "fixture://raw-1" },
    ],
    fixtureStatus: "fixture",
    rulesVersion,
    ...overrides,
  };
}
