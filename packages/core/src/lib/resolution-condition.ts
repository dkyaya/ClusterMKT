import type { ClusterUncertaintyType } from "../schemas/cluster-uncertainty";

const resolutionByType = {
  rumor: ["regulatory_filing", "An official filing or announcement would resolve the rumor."],
  unresolved_timing: [
    "final_rule",
    "A dated final rule or official schedule would resolve timing.",
  ],
  unresolved_scope: [
    "independent_reporting",
    "Specific affected-entity evidence would resolve scope.",
  ],
  unresolved_quantity: [
    "regulatory_filing",
    "A filed quantitative disclosure would resolve the amount.",
  ],
  conflicting_reports: [
    "independent_reporting",
    "Additional independent reporting or a primary record would resolve the conflict.",
  ],
  forward_looking: [
    "earnings_release",
    "A subsequent results release would test the forward-looking statement.",
  ],
  source_access_limited: [
    "official_transcript",
    "Accessible permitted source text would resolve the access gap.",
  ],
  metadata_limited: [
    "independent_reporting",
    "Accessible text that explicitly states the claim would resolve the gap.",
  ],
  single_source: ["independent_reporting", "Independent corroboration would strengthen the claim."],
  insufficient_evidence: [
    "independent_reporting",
    "Additional eligible evidence would resolve the gap.",
  ],
  review_pending: [
    "independent_reporting",
    "Human review of the cited evidence would resolve routing.",
  ],
} as const;

export function resolutionConditionFor(type: ClusterUncertaintyType) {
  const [futureSourceType, whatWouldResolveIt] = resolutionByType[type];
  return { futureSourceType, whatWouldResolveIt };
}
