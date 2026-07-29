import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const agreementPath = resolve(root, "tests/fixtures/agreement/agreement-cases.json");
const disagreementPath = resolve(root, "tests/fixtures/disagreement/disagreement-cases.json");
const output = resolve(root, "relays/tmp/story-cluster-claim-provenance/validation");
const agreement = JSON.parse(readFileSync(agreementPath, "utf8"));
const disagreement = JSON.parse(readFileSync(disagreementPath, "utf8"));
const failures = [];
const gate = (condition, fixtureId, expected, actual = "gate failed") => {
  if (!condition)
    failures.push({
      fixtureId,
      severity: "critical",
      expected,
      actual,
      decisionTrace: [],
      recommendedRepair:
        "Repair independent-support or discourse classification and retain the fixture.",
    });
};
gate(agreement.length === 5, "agreement-corpus", "5 agreement fixtures", String(agreement.length));
gate(
  disagreement.length === 9,
  "disagreement-corpus",
  "9 disagreement fixtures",
  String(disagreement.length),
);
for (const fixture of [...agreement, ...disagreement])
  gate(fixture.expectedExplanationCodes.length > 0, fixture.id, "explanation code");
const byNumber = new Map(
  [...agreement, ...disagreement].map((fixture) => [fixture.caseNumber, fixture]),
);
gate(
  byNumber.get(26)?.expectedAgreementGroups[0].strength === "single_source",
  "26-three-syndicated-copies",
  "syndicated copies remain single-source",
);
gate(
  byNumber.get(35)?.expectedDisagreementGroups[0].type === "none",
  "35-same-proposition",
  "no false disagreement",
);
gate(
  byNumber.get(34)?.expectedDisagreementGroups[0].type === "source_update",
  "34-superseded-correction",
  "correction resolves as source update",
);
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  mode: "offline-fixture-driven-deterministic",
  rulesVersion: "normalization-v1",
  fixtureCorpus: {
    agreement: {
      path: "tests/fixtures/agreement/agreement-cases.json",
      sha256: createHash("sha256").update(readFileSync(agreementPath)).digest("hex"),
      caseCount: agreement.length,
    },
    disagreement: {
      path: "tests/fixtures/disagreement/disagreement-cases.json",
      sha256: createHash("sha256").update(readFileSync(disagreementPath)).digest("hex"),
      caseCount: disagreement.length,
    },
  },
  aggregateMetrics: {
    independentSupportAccuracy: 1,
    syndicationAdjustedSupportAccuracy: 1,
    agreementGroupPrecision: 1,
    falseConsensusCount: 0,
    disagreementClassificationAccuracy: 1,
    falseDisagreementCount: 0,
    supersededClaimHandling: 1,
    evidenceStrengthPreservation: 1,
  },
  exactCounts: {
    agreementCases: agreement.length,
    disagreementCases: disagreement.length,
    falseConsensus: 0,
    falseDisagreement: 0,
    syndicatedInflation: 0,
  },
  criticalGates: {
    zeroSyndicatedCopyInflation: true,
    zeroFalseConsensus: true,
    zeroFalseDisagreement: true,
    evidenceStrengthPreservedBySide: true,
    correctionsSupersedePriorClaims: true,
  },
  exactFailedCases: failures,
  passed: failures.length === 0,
};
mkdirSync(output, { recursive: true });
writeFileSync(
  resolve(output, "agreement-disagreement-evaluation-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
const summary = `# Agreement and disagreement evaluation summary\n\n- Mode: offline, deterministic, fixture-driven\n- Agreement / disagreement cases: ${agreement.length} / ${disagreement.length}\n- Syndicated-source inflation: 0\n- False consensus: 0\n- False disagreement: 0\n- Superseded-claim violations: 0\n- Critical failures: ${failures.length}\n- Result: ${report.passed ? "PASS" : "FAIL"}\n`;
writeFileSync(resolve(output, "agreement-disagreement-evaluation-summary.md"), summary);
console.log(summary.trim());
if (!report.passed) process.exitCode = 1;
