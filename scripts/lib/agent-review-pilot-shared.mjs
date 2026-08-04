import { createHash } from "node:crypto";

export const AGENT_REVIEWER_PSEUDONYMS = [
  "reviewer-alpha",
  "reviewer-bravo",
  "reviewer-charlie",
  "reviewer-delta",
  "reviewer-echo",
  "reviewer-foxtrot",
  "reviewer-golf",
];

export const agentPanelPolicy = {
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

export function classifyAgentReviewRisk(item) {
  const strata = item.samplingStrata;
  const reasons = Object.entries(agentPanelPolicy.highRiskStrataTriggers)
    .filter(([dimension, values]) => values.includes(strata[dimension]))
    .map(([dimension]) => `HIGH_RISK_STRATUM_${dimension}_${strata[dimension]}`);
  if (agentPanelPolicy.highRiskTasks.includes(item.task))
    reasons.push(`HIGH_RISK_TASK_${item.task}`);
  if (item.difficultyClass === "adversarial") reasons.push("ADVERSARIAL_DIFFICULTY");
  if (reasons.length > 0) return { riskClass: "high", reasons };
  if (item.difficultyClass === "challenging")
    return { riskClass: "standard", reasons: ["CHALLENGING_DIFFICULTY"] };
  return { riskClass: "low", reasons: [] };
}

export const taskLabelValues = {
  source_normalization: [
    "canonical_url_relationship",
    "exact_duplicate",
    "format_variant",
    "syndicated_copy",
    "independent_report",
    "article_update",
    "new_underlying_work",
    "quarantine_eligible",
  ],
  entity_resolution: [
    "candidate_entity",
    "accepted_entity",
    "rejected_false_match",
    "direct_mention",
    "inferred_mention",
    "ticker_mention",
    "sector_match",
    "macro_topic_match",
    "review_required",
  ],
  event_boundaries: [
    "same_event",
    "related_event",
    "separate_event",
    "update",
    "correction",
    "proposal",
    "final_action",
    "rumor",
    "confirmation",
    "multi_event_record",
  ],
  claims: [
    "claim_present",
    "claim_absent",
    "fact",
    "interpretation",
    "quantitative",
    "attributed_statement",
    "supported",
    "partially_supported",
    "unsupported",
    "metadata_only",
  ],
  agreement_disagreement: [
    "equivalent",
    "compatible",
    "contradictory",
    "temporal_difference",
    "scope_difference",
    "quantitative_disagreement",
    "interpretive_disagreement",
    "apparent_disagreement",
    "superseded_claim",
  ],
  review_routing: [
    "accepted",
    "review_required",
    "rejected",
    "quarantined",
    "display_eligible",
    "sector_brief_eligible",
    "blocking_reason",
  ],
  sector_coverage: [
    "sector_wide",
    "company_led_sector_impact",
    "macro_to_sector",
    "company_specific",
    "sector_feed_include",
    "sector_feed_exclude",
    "materiality",
    "subindustry_impact",
    "anti_concentration_relevance",
  ],
};

export function labelIdsForTask(task) {
  return taskLabelValues[task].map((value) => `label-${value.replace(/_/g, "-")}`);
}

export const roleContracts = {
  literal_evidence_reviewer: {
    purpose: "Choose the narrowest label directly supported by visible evidence.",
    checklist: [
      "Identify the narrowest label the visible text directly supports.",
      "Reject any label that requires an inference beyond the visible evidence.",
      "Flag cannot-determine when the evidence package does not resolve the question.",
    ],
  },
  source_provenance_reviewer: {
    purpose:
      "Evaluate source depth, source independence, syndication, primary-source status, and provenance completeness.",
    checklist: [
      "Determine whether the source role is primary, secondary, or mixed.",
      "Determine whether apparent independent corroboration is actually syndicated.",
      "Flag incomplete or missing provenance.",
    ],
  },
  adversarial_reviewer: {
    purpose:
      "Search for unsupported inferences, false merges, ticker collisions, hidden ambiguity, contradictory evidence, and unsafe automatic acceptance.",
    checklist: [
      "Actively look for a reason the obvious label could be wrong.",
      "Check for ordinary-language ticker collisions and false entity merges.",
      "Recommend against automatic acceptance whenever a plausible failure mode exists.",
    ],
  },
  domain_context_reviewer: {
    purpose:
      "Evaluate finance, policy, filing, sector, event, and quantitative context without expanding beyond evidence.",
    checklist: [
      "Situate the evidence within known finance, policy, filing, sector, or event context.",
      "Do not add facts not present in the evidence package.",
      "Flag when domain context is required but absent from the packet.",
    ],
  },
  conservative_gatekeeper: {
    purpose: "Decide whether the item is safe for automatic acceptance or should route to review.",
    checklist: [
      "Default to review-required whenever any material doubt exists.",
      "Never recommend automatic acceptance for a critical factual or provenance question.",
      "State the single strongest reason to withhold automatic acceptance, if any.",
    ],
  },
  quantitative_integrity_reviewer: {
    purpose:
      "Review values, units, periods, denominators, revisions, rounding, and incompatible quantities.",
    checklist: [
      "Verify units, periods, and denominators are compatible before treating figures as comparable.",
      "Check for rounding or revision issues that change the substantive claim.",
      "Flag incompatible or mismatched quantities rather than reconciling them silently.",
    ],
  },
  event_boundary_reviewer: {
    purpose:
      "Review whether records concern the same event, an update, a correction, a related event, or a distinct event.",
    checklist: [
      "Determine event identity from structured signature fields, not entity plus date alone.",
      "Distinguish update, correction, proposal, final action, rumor, and confirmation.",
      "Flag ambiguous event boundaries rather than merging by default.",
    ],
  },
};

const FORBIDDEN_AGENT_PACKET_MARKERS = [
  "hiddenPrediction",
  "goldLabel",
  "gold-label",
  "finalGoldLabelId",
  "goldLabelConfidence",
  "adjudicationDecisionId",
  "reviewerDecisionIds",
  "reviewAssignmentIds",
  "adjudicatorNotes",
  "reviewerNotes",
  "amendmentHistory",
  "regressionFixtureStatus",
  "expectedLabel",
  "expected_label",
  "pipelinePrediction",
  "pipeline_prediction",
  "thresholdVersion",
  "consensus",
  "gold-item-",
];

export function validatePacketLeakage(packet) {
  const serialized = JSON.stringify(packet);
  const forbiddenFieldsFound = FORBIDDEN_AGENT_PACKET_MARKERS.filter((marker) =>
    serialized.includes(marker),
  );
  return {
    packetId: packet.packetId,
    forbiddenFieldsFound,
    passed: forbiddenFieldsFound.length === 0,
  };
}

export function buildAgentReviewPacket({ item, role, riskClass, seed, requiredResponseFields }) {
  const packetId = `agent-packet-${createHash("sha256")
    .update(`${seed}:${item.itemId}:${item.task}:${role}`)
    .digest("hex")
    .slice(0, 12)}`;
  const draft = {
    packetId,
    packetVersion: "agent-packet-v1",
    task: item.task,
    role,
    riskClass,
    difficultyClass: item.difficultyClass,
    reviewerInstructions: `${roleContracts[role].purpose} Checklist: ${roleContracts[role].checklist.join(" ")}`,
    handbookExcerpt:
      "Reviewers label visible fixture evidence independently. Metadata and headlines have limited evidentiary value; company statements are not independent confirmation; syndicated copies are not independent corroboration; podcast content requires a permitted transcript before factual use. Use insufficient_evidence or cannot_determine rather than guessing.",
    allowedLabelIds: labelIdsForTask(item.task),
    evidencePackage: item.evidencePackage,
    allowedProvenanceFields: item.allowedReviewerVisibleFields,
    requiredResponseFields,
  };
  const packetHash = createHash("sha256").update(JSON.stringify(draft)).digest("hex");
  return { ...draft, packetHash };
}

export const REQUIRED_RESPONSE_FIELDS = [
  "selectedLabelId",
  "alternativeLabelId",
  "evidenceReferences",
  "supportingFields",
  "conflictingFields",
  "missingEvidence",
  "explanationCodes",
  "confidence",
  "automaticAcceptanceRecommended",
  "humanReviewRecommended",
  "dissentExpected",
  "cannotDetermine",
];
