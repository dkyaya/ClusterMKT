import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ClaimEvidenceSchema,
  compareClaims,
  countIndependentSupport,
  evaluateEvidenceEligibility,
  extractAnnotatedClaim,
  parseQuantitativeFixture,
} from "../../packages/core/src/index";
import { describe, expect, it } from "vitest";
import { makeClaim, makeEvidence, rulesVersion } from "../helpers/claim-fixtures";

const fixtures = JSON.parse(
  readFileSync(resolve(process.cwd(), "tests/fixtures/claims/claims-cases.json"), "utf8"),
) as Array<Record<string, unknown>>;

describe("claim contracts and evidence rules", () => {
  it("keeps all 20 claim and uncertainty fixtures machine-auditable", () => {
    expect(fixtures).toHaveLength(20);
    for (const fixture of fixtures) {
      expect(fixture).toMatchObject({
        inputNormalizedRecords: expect.any(Array),
        expectedClaims: expect.any(Array),
        expectedEvidenceLinks: expect.any(Array),
        expectedUncertainty: expect.any(Array),
        expectedExplanationCodes: expect.any(Array),
      });
    }
  });

  it.each([
    ["headline_only", "quantitative_fact", false, "METADATA_CANNOT_SUPPORT_DETAILED_CLAIM"],
    ["metadata", "event_fact", false, "METADATA_CANNOT_SUPPORT_DETAILED_CLAIM"],
    ["related_listening_only", "event_fact", false, "RELATED_LISTENING_NOT_FACTUAL_EVIDENCE"],
    ["government_release", "policy_fact", true, "PRIMARY_SOURCE_STATEMENT"],
    ["official_transcript", "company_statement", true, "ACCESSIBLE_EVIDENCE_SUPPORT"],
    ["full_fixture_text", "event_fact", true, "ACCESSIBLE_EVIDENCE_SUPPORT"],
  ] as const)("enforces %s for %s claims", (evidenceDepth, claimType, eligible, code) => {
    const evidence = ClaimEvidenceSchema.parse(
      makeEvidence({ evidenceDepth, primary: evidenceDepth === "government_release" }),
    );
    const result = evaluateEvidenceEligibility(evidence, claimType);
    expect(result.eligible).toBe(eligible);
    expect(result.explanationCodes).toContain(code);
  });

  it("counts exact duplicates, versions, and syndication by work rather than URL", () => {
    const evidence = [
      makeEvidence({
        evidenceId: "one",
        sourceRecordId: "record-one",
        underlyingWorkId: "work-shared",
        sourceFamilyId: "wire",
        syndicated: true,
        independent: false,
      }),
      makeEvidence({
        evidenceId: "two",
        sourceRecordId: "record-two",
        underlyingWorkId: "work-shared",
        sourceFamilyId: "republication",
        syndicated: true,
        independent: false,
      }),
      makeEvidence({
        evidenceId: "three",
        sourceRecordId: "record-three",
        underlyingWorkId: "work-independent",
        sourceFamilyId: "journal",
        independent: true,
      }),
    ];
    expect(countIndependentSupport(evidence)).toMatchObject({
      rawEvidenceCount: 3,
      underlyingWorkCount: 2,
      independentSupportCount: 2,
      syndicationAdjustedCount: 2,
    });
  });

  it("extracts only fixture-annotated claims with eligible evidence", () => {
    const claim = extractAnnotatedClaim({
      claimId: "claim-extracted",
      clusterCandidateId: "candidate-one",
      claimText: "The filing reported 10 percent growth.",
      normalizedProposition: "filing report 10 percent growth",
      subjectEntityIds: ["company-northstar"],
      predicate: "reported",
      object: "10 percent growth",
      evidence: [makeEvidence({ evidenceDepth: "regulatory_filing", primary: true })],
      claim: {
        claimType: "quantitative_fact",
        eventType: "earnings",
        timeScope: "2026-Q2",
        geography: "US",
        quantitativeValues: [
          parseQuantitativeFixture({ rawValueText: "10%", unit: "percent", timePeriod: "2026-Q2" }),
        ],
        direction: "increase",
        certaintyLanguage: "filed",
        attribution: "Northstar filing",
        contradictingEvidenceIds: [],
        evidenceDepth: "regulatory_filing",
        claimStatus: "supported",
        confidence: "high",
        reviewStatus: "accepted",
        explanationCodes: ["ANNOTATED_FIXTURE_CLAIM"],
        rulesVersion,
        fixtureStatus: "fixture",
      },
    });
    expect(claim).toMatchObject({
      claimStatus: "supported",
      independentSupportCount: 1,
      evidenceIds: ["evidence-1"],
    });
  });

  it("blocks fixture annotations whose only support is podcast metadata", () => {
    const claim = extractAnnotatedClaim({
      claimId: "claim-podcast",
      clusterCandidateId: "candidate-one",
      claimText: "The podcast says demand rose.",
      normalizedProposition: "demand rise",
      subjectEntityIds: ["company-northstar"],
      predicate: "rose",
      evidence: [
        makeEvidence({ evidenceDepth: "related_listening_only", acceptedForClaim: false }),
      ],
      claim: {
        claimType: "event_fact",
        eventType: "other",
        quantitativeValues: [],
        contradictingEvidenceIds: [],
        evidenceDepth: "related_listening_only",
        claimStatus: "supported",
        confidence: "medium",
        reviewStatus: "accepted",
        explanationCodes: ["ANNOTATED_FIXTURE_CLAIM"],
        rulesVersion,
        fixtureStatus: "fixture",
      },
    });
    expect(claim).toMatchObject({
      claimStatus: "unsupported",
      reviewStatus: "rejected",
      evidenceIds: [],
    });
  });

  it("preserves quantitative raw text, units, periods, and rounding", () => {
    expect(
      parseQuantitativeFixture({
        rawValueText: "about 10.0%",
        unit: "percent",
        timePeriod: "2026-Q3",
      }),
    ).toEqual(
      expect.objectContaining({
        rawValueText: "about 10.0%",
        numericValue: 10,
        unit: "percent",
        timePeriod: "2026-Q3",
        precision: "approximate",
      }),
    );
  });

  it("distinguishes rounding compatibility, numeric conflict, and unrelated predicates", () => {
    const left = makeClaim({
      claimType: "quantitative_fact",
      quantitativeValues: [
        { rawValueText: "10%", numericValue: 10, unit: "percent", precision: "exact" },
      ],
    });
    const rounded = makeClaim({
      claimId: "claim-rounded",
      quantitativeValues: [
        { rawValueText: "10.1%", numericValue: 10.1, unit: "percent", precision: "approximate" },
      ],
    });
    const conflict = makeClaim({
      claimId: "claim-conflict",
      quantitativeValues: [
        { rawValueText: "14%", numericValue: 14, unit: "percent", precision: "exact" },
      ],
    });
    const margins = makeClaim({
      claimId: "claim-margin",
      predicate: "reported margin",
      object: "margin",
      normalizedProposition: "reported margin",
    });
    expect(compareClaims(left, rounded).relationship).toBe("substantively_equivalent");
    expect(compareClaims(left, conflict).relationship).toBe("quantitatively_conflicting");
    expect(compareClaims(left, margins).relationship).toBe("unrelated");
  });
});
