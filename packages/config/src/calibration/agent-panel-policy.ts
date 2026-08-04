import type { AgentPanelPolicyConfig } from "@cluster-mkt/core";

export const agentPanelPolicy: AgentPanelPolicyConfig = {
  riskRoles: {
    low: ["literal_evidence_reviewer", "source_provenance_reviewer", "conservative_gatekeeper"],
    standard: [
      "literal_evidence_reviewer",
      "source_provenance_reviewer",
      "adversarial_reviewer",
      "domain_context_reviewer",
      "conservative_gatekeeper",
    ],
    high: [
      "literal_evidence_reviewer",
      "source_provenance_reviewer",
      "adversarial_reviewer",
      "domain_context_reviewer",
      "conservative_gatekeeper",
      "quantitative_integrity_reviewer",
      "event_boundary_reviewer",
    ],
  },
  panelSizes: { low: 3, standard: 5, high: 7 },
  highRiskStrataTriggers: {
    tickerAmbiguity: ["ordinary_language_trap"],
    duplicateClass: ["duplicate_or_syndication"],
    syndicationClass: ["syndicated_copy"],
    evidenceDepth: ["metadata_limited"],
    contentType: ["podcast"],
    claimType: ["quantitative_fact"],
    discourseClass: ["apparent_disagreement"],
    timeSensitivity: ["evolving_or_corrected"],
  },
  highRiskTasks: ["sector_coverage", "event_boundaries"],
};
