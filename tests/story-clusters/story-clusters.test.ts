import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  StoryClusterCandidateSchema,
  assembleSectorFeed,
  decideClusterMembership,
  routeClusterReview,
} from "../../packages/core/src/index";
import { describe, expect, it } from "vitest";
import {
  makeClaim,
  makeEvidence,
  makeEvent,
  makeRecord,
  rulesVersion,
} from "../helpers/claim-fixtures";

const fixtures = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "tests/fixtures/story-clusters/story-clusters-cases.json"),
    "utf8",
  ),
) as Array<Record<string, unknown>>;

describe("Story Cluster candidates and review routing", () => {
  it("keeps the 21 candidate, review, and Sector Brief fixtures machine-auditable", () => {
    expect(fixtures).toHaveLength(21);
    for (const fixture of fixtures) {
      expect(fixture).toMatchObject({
        inputNormalizedRecords: expect.any(Array),
        expectedCandidateClusters: expect.any(Array),
        expectedMembershipDecisions: expect.any(Array),
        expectedClaims: expect.any(Array),
        expectedEvidenceLinks: expect.any(Array),
        expectedAgreementGroups: expect.any(Array),
        expectedDisagreementGroups: expect.any(Array),
        expectedUncertainty: expect.any(Array),
        expectedReviewState: expect.any(String),
        expectedProvenancePaths: expect.any(Array),
        expectedExplanationCodes: expect.any(Array),
      });
    }
  });

  it("accepts a compatible update and explains every membership decision", () => {
    const decision = decideClusterMembership({
      candidateClusterId: "candidate-capacity-review",
      seedEvent: makeEvent(),
      record: makeRecord(),
      recordEvent: makeEvent(),
      articleVersionDuplicate: true,
    });
    expect(decision.membershipStatus).toBe("accepted");
    expect(decision.explanationCodes).toEqual(
      expect.arrayContaining(["same_event_signature", "compatible_update"]),
    );
    expect(decision.eventBoundaryRationale).toMatch(/Compatible event boundary/u);
  });

  it("does not merge same-entity records when event fields conflict", () => {
    const decision = decideClusterMembership({
      candidateClusterId: "candidate-capacity-review",
      seedEvent: makeEvent(),
      record: makeRecord({ normalizedRecordId: "normalized-management" }),
      recordEvent: makeEvent({
        eventSignatureId: "event-management",
        eventType: "management_change",
        objectOfAction: "chief executive",
      }),
    });
    expect(decision.membershipStatus).toBe("related_context");
    expect(decision.explanationCodes).toContain("different_event_type");
  });

  it("routes multi-event records to review and quarantined records to quarantine", () => {
    const multi = decideClusterMembership({
      candidateClusterId: "candidate-capacity-review",
      seedEvent: makeEvent(),
      record: makeRecord(),
      recordEvent: makeEvent(),
      multiEventRecord: true,
    });
    const quarantined = decideClusterMembership({
      candidateClusterId: "candidate-capacity-review",
      seedEvent: makeEvent(),
      record: makeRecord({ reviewStatus: "quarantined" }),
      recordEvent: makeEvent(),
    });
    expect(multi).toMatchObject({
      membershipStatus: "review_required",
      reviewStatus: "review_required",
    });
    expect(quarantined).toMatchObject({
      membershipStatus: "quarantined",
      reviewStatus: "quarantined",
    });
  });

  it("blocks unsupported visible claims and accepts supported provenance", () => {
    const supported = makeClaim();
    const accepted = routeClusterReview({
      claims: [supported],
      evidence: [makeEvidence()],
      independentSourceCount: 1,
      primarySourceCount: 0,
    });
    const blocked = routeClusterReview({
      claims: [makeClaim({ evidenceIds: [], claimStatus: "unsupported" })],
      evidence: [],
      independentSourceCount: 0,
      primarySourceCount: 0,
    });
    expect(accepted).toMatchObject({
      status: "accepted",
      eligibleForDisplay: true,
      eligibleForSectorBrief: true,
    });
    expect(blocked).toMatchObject({ status: "rejected", eligibleForDisplay: false });
    expect(blocked.blockingIssues).toEqual(
      expect.arrayContaining(["MISSING_CLAIM_PROVENANCE", "UNSUPPORTED_VISIBLE_CLAIM"]),
    );
  });

  it("keeps review-required and rejected candidates out of an ordinary Sector Brief feed", () => {
    const feed = assembleSectorFeed({
      sectorId: "semiconductors",
      marketEdition: "midday",
      marketDate: "2026-07-29",
      expectedSubindustryIds: ["memory"],
      candidates: [
        {
          id: "cluster-accepted",
          title: "Accepted",
          scope: "sector_wide",
          materialityScore: 90,
          relevanceScore: 90,
          subindustryIds: ["memory"],
          whyIncluded: "Supported.",
          active: true,
          sourceCount: 2,
          themes: ["capacity"],
          clusterReviewStatus: "accepted",
          eligibleForDisplay: true,
          eligibleForSectorBrief: true,
          claimIds: ["claim-one"],
          independentSourceCount: 2,
        },
        {
          id: "cluster-review",
          title: "Review",
          scope: "sector_wide",
          materialityScore: 88,
          relevanceScore: 88,
          subindustryIds: ["memory"],
          whyIncluded: "Pending.",
          active: true,
          sourceCount: 3,
          themes: ["rumor"],
          clusterReviewStatus: "review_required",
          eligibleForDisplay: false,
          eligibleForSectorBrief: false,
        },
        {
          id: "cluster-rejected",
          title: "Rejected",
          scope: "company_specific",
          materialityScore: 70,
          relevanceScore: 70,
          subindustryIds: ["memory"],
          whyIncluded: "Rejected.",
          active: true,
          sourceCount: 1,
          themes: [],
          clusterReviewStatus: "rejected",
          eligibleForDisplay: false,
          eligibleForSectorBrief: false,
        },
      ],
    });
    expect(feed.items.map((item) => item.id)).toEqual(["cluster-accepted"]);
    expect(feed.reviewWatchItems.map((item) => item.id)).toEqual(["cluster-review"]);
  });

  it("validates the complete Story Cluster candidate contract", () => {
    expect(() =>
      StoryClusterCandidateSchema.parse({
        candidateClusterId: "candidate-capacity-review",
        eventSignatureId: "event-one",
        primaryEventType: "capacity_change",
        primaryEntityIds: ["company-northstar"],
        secondaryEntityIds: [],
        sectorId: "semiconductors",
        subindustryIds: ["foundries_and_manufacturing"],
        macroTopicIds: [],
        geography: "US",
        firstSeenAt: "2026-07-29T12:00:00.000Z",
        latestUpdatedAt: "2026-07-29T13:00:00.000Z",
        normalizedSourceRecordIds: ["normalized-1"],
        underlyingWorkIds: ["work-1"],
        independentSourceFamilyIds: ["family-1"],
        syndicationFamilyIds: [],
        primarySourceIds: [],
        metadataOnlySourceIds: [],
        transcriptBackedPodcastIds: [],
        relatedListeningOnlyPodcastIds: [],
        candidateScope: "company_specific",
        membershipDecisions: [
          decideClusterMembership({
            candidateClusterId: "candidate-capacity-review",
            seedEvent: makeEvent(),
            record: makeRecord(),
            recordEvent: makeEvent(),
          }),
        ],
        candidateTitle: "Northstar reviews capacity",
        candidateShortOverview: "Northstar announced a capacity review.",
        candidateWhyItMatters: "The accepted relation connects the review to foundry capacity.",
        claimIds: ["claim-one"],
        agreementGroupIds: [],
        disagreementGroupIds: [],
        uncertaintyIds: [],
        coverageGaps: [],
        clusterConfidence: "high",
        reviewStatus: "accepted",
        reviewReasons: [],
        rulesVersion,
        fixtureStatus: "fixture",
      }),
    ).not.toThrow();
  });
});
