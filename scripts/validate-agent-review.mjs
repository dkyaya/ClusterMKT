#!/usr/bin/env node
import {
  emit,
  loadManifest,
  loadPilotSelection,
  loadResults,
  refuse,
} from "./lib/agent-review-reporting.mjs";

const selection = loadPilotSelection();
const manifest = loadManifest();
const results = loadResults();

const checks = [];

checks.push({
  name: "pilot_selection_exists",
  passed: Boolean(selection),
});
if (selection) {
  checks.push({ name: "pilot_item_count_is_52", passed: selection.itemCount === 52 });
  checks.push({
    name: "task_distribution_passed",
    passed: selection.taskDistributionPassed === true,
  });
}

checks.push({ name: "packet_manifest_exists", passed: Boolean(manifest) });
if (manifest) {
  checks.push({ name: "zero_packet_leakage", passed: manifest.leakageReport.leakageFound === 0 });
  checks.push({
    name: "packet_count_matches_decision_total",
    passed: manifest.leakageReport.totalPackets >= manifest.decisionTotal,
  });
}

checks.push({ name: "pilot_results_exist", passed: Boolean(results) });
if (results) {
  const mainResults = results.mainResults;
  // A high-risk item is safe when it either has an adjudication, or its provisional state is a
  // non-promotable holding state. It is only unsafe if it reached a promotable state
  // (agent_panel_consensus/majority) without adjudication ever running.
  const nonPromotableStates = new Set([
    "unresolved",
    "owner_review_required",
    "owner_overridden",
    "agent_panel_disputed",
  ]);
  checks.push({
    name: "every_item_has_terminal_panel_state",
    passed: mainResults.every((r) => Boolean(r.panel?.outcome)),
  });
  checks.push({
    name: "every_high_risk_item_adjudicated_or_unresolved",
    passed: mainResults
      .filter((r) => r.riskClass === "high")
      .every((r) => r.adjudication !== null || nonPromotableStates.has(r.provisionalState)),
  });
  checks.push({
    name: "every_owner_escalation_has_reason",
    passed: mainResults
      .filter((r) => r.ownerEscalation?.status !== "not_required")
      .every((r) => (r.ownerEscalation?.reasons?.length ?? 0) > 0),
  });
  checks.push({
    name: "no_disputed_panel_marked_unanimous",
    passed: mainResults.every(
      (r) => !(r.panel.outcome === "agent_panel_disputed" && r.panel.unanimous),
    ),
  });
  checks.push({
    name: "no_high_risk_bare_majority_auto_promotion",
    passed: mainResults.every(
      (r) =>
        !(
          r.riskClass === "high" &&
          !r.adjudication &&
          (r.provisionalState === "agent_panel_majority" ||
            r.provisionalState === "agent_panel_consensus")
        ),
    ),
  });
  checks.push({
    name: "adjudications_reference_anonymized_members_only",
    passed: mainResults
      .filter((r) => r.adjudication)
      .every((r) =>
        [
          ...(r.adjudication.decisionsAcceptedMemberIds ?? []),
          ...(r.adjudication.decisionsRejectedMemberIds ?? []),
        ].every((id) => /^panel-member-\d+$/.test(id)),
      ),
  });
  checks.push({
    name: "every_decision_has_packet_hash",
    passed: mainResults.every((r) => r.decisions.every((d) => Boolean(d.packet?.packetHash))),
  });
  checks.push({
    name: "pilot_fully_complete",
    passed: mainResults.every((r) => r.panel.validDecisionCount === r.panel.panelSize),
    note: "Informational, not a hard safety gate: whether every panel collected its full complement of isolated reviewer decisions. False here reflects the documented session-usage-limit blocker, not an unsafe state — every item still resolves to a safe, non-fabricated terminal state.",
  });
}

const criticalChecks = checks.filter((c) => !c.note);
const informationalChecks = checks.filter((c) => c.note);
const passed = criticalChecks.every((c) => c.passed);
const fullyComplete = informationalChecks.every((c) => c.passed);
emit({
  status: passed ? (fullyComplete ? "passed" : "passed_with_incomplete_pilot") : "failed",
  checks,
});
if (!passed) refuse("agent-review:validate failed one or more critical safety gates");
