import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  classifyDisagreement,
  detectAgreementGroups,
  detectDisagreement,
} from "../../packages/core/src/index";
import { describe, expect, it } from "vitest";
import { makeClaim, makeEvidence } from "../helpers/claim-fixtures";

const agreementFixtures = JSON.parse(
  readFileSync(resolve(process.cwd(), "tests/fixtures/agreement/agreement-cases.json"), "utf8"),
) as Array<Record<string, unknown>>;
const disagreementFixtures = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "tests/fixtures/disagreement/disagreement-cases.json"),
    "utf8",
  ),
) as Array<Record<string, unknown>>;

describe("agreement and disagreement", () => {
  it("keeps all 14 discourse fixtures machine-auditable", () => {
    expect(agreementFixtures).toHaveLength(5);
    expect(disagreementFixtures).toHaveLength(9);
    for (const fixture of [...agreementFixtures, ...disagreementFixtures])
      expect(fixture).toMatchObject({
        expectedAgreementGroups: expect.any(Array),
        expectedDisagreementGroups: expect.any(Array),
        expectedExplanationCodes: expect.any(Array),
      });
  });

  it("does not call three syndicated copies multi-source agreement", () => {
    const claim = makeClaim();
    const evidence = [1, 2, 3].map((number) =>
      makeEvidence({
        evidenceId: `evidence-${number}`,
        sourceRecordId: `record-${number}`,
        underlyingWorkId: "wire-work",
        sourceFamilyId: "wire-family",
        syndicated: true,
        independent: false,
      }),
    );
    const group = detectAgreementGroups(
      [{ ...claim, evidenceIds: evidence.map((item) => item.evidenceId) }],
      evidence,
    )[0];
    expect(group.agreementStrength).toBe("single_source");
    expect(group.qualification).toMatch(/not consensus/u);
  });

  it("recognizes primary-plus-independent support without treating agreement as proof", () => {
    const claims = [
      makeClaim(),
      makeClaim({ claimId: "claim-two" }),
      makeClaim({ claimId: "claim-three" }),
    ];
    const evidence = [
      makeEvidence({ evidenceId: "evidence-1", primary: true, sourceFamilyId: "company" }),
      makeEvidence({
        evidenceId: "evidence-2",
        underlyingWorkId: "work-2",
        sourceFamilyId: "journal-1",
      }),
      makeEvidence({
        evidenceId: "evidence-3",
        underlyingWorkId: "work-3",
        sourceFamilyId: "journal-2",
      }),
    ];
    const linked = claims.map((claim, index) => ({
      ...claim,
      evidenceIds: [evidence[index].evidenceId],
      supportingUnderlyingWorkIds: [evidence[index].underlyingWorkId],
      supportingSourceFamilyIds: [evidence[index].sourceFamilyId],
    }));
    expect(detectAgreementGroups(linked, evidence)[0].agreementStrength).toBe(
      "primary_plus_independent",
    );
  });

  it("does not manufacture disagreement from different wording, predicates, or periods", () => {
    expect(
      classifyDisagreement(
        makeClaim(),
        makeClaim({ claimId: "same", claimText: "Capacity is under review." }),
      ).type,
    ).toBe("apparent_only");
    expect(
      classifyDisagreement(
        makeClaim(),
        makeClaim({
          claimId: "margin",
          predicate: "reported margin",
          normalizedProposition: "reported margin",
        }),
      ).type,
    ).toBe("apparent_only");
    expect(
      classifyDisagreement(makeClaim(), makeClaim({ claimId: "later", timeScope: "2027-Q1" })).type,
    ).toBe("temporal");
  });

  it("classifies quantitative, causal, forecast, and superseded differences", () => {
    const numericA = makeClaim({
      claimType: "quantitative_fact",
      quantitativeValues: [
        { rawValueText: "10", numericValue: 10, unit: "percent", precision: "exact" },
      ],
    });
    const numericB = makeClaim({
      claimId: "numeric-b",
      quantitativeValues: [
        { rawValueText: "20", numericValue: 20, unit: "percent", precision: "exact" },
      ],
    });
    expect(classifyDisagreement(numericA, numericB).type).toBe("quantitative");
    expect(
      classifyDisagreement(
        makeClaim({
          claimType: "causal_interpretation",
          normalizedProposition: "demand fell because inventory rose",
        }),
        makeClaim({
          claimId: "cause-b",
          claimType: "causal_interpretation",
          normalizedProposition: "demand fell because orders slowed",
        }),
      ).type,
    ).toBe("causal");
    expect(
      classifyDisagreement(
        makeClaim({ certaintyLanguage: "forecast", normalizedProposition: "revenue will rise" }),
        makeClaim({
          claimId: "forecast-b",
          certaintyLanguage: "forecast",
          normalizedProposition: "revenue will fall",
        }),
      ).type,
    ).toBe("forecast");
    const corrected = detectDisagreement(
      makeClaim({ explanationCodes: ["SUPERSEDED_BY_CORRECTION"] }),
      makeClaim({ claimId: "current" }),
      [makeEvidence()],
    );
    expect(corrected).toMatchObject({
      disagreementType: "source_update",
      oneSideSuperseded: true,
      resolutionStatus: "superseded",
    });
  });
});
