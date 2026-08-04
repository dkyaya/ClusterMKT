#!/usr/bin/env node
import { emit, loadResults, refuse } from "./lib/agent-review-reporting.mjs";

const results = loadResults();
if (!results) {
  refuse(
    "no pilot results found at .tmp/agent-review-pilot/results/pilot-results.json — run the pilot first",
  );
  process.exit();
}

const mainResults = results.mainResults ?? [];
const mainByItemId = new Map(mainResults.map((r) => [r.itemId, r]));
const repeatByItemId = new Map((results.repeatResults ?? []).map((r) => [r.itemId, r]));

const comparisons = results.stabilityComparison ?? [];
// A comparison is only meaningful when BOTH the first run and the repeat run actually produced at
// least one valid decision. When either run collected zero decisions (session-limit failure), the
// pair is "not comparable" — counting it as "unstable" would conflate an execution gap with a real
// disagreement between isolated agent panels, which is exactly the kind of fabricated-looking
// signal this pilot must not produce.
const executionGaps = [];
const genuinelyComparable = comparisons.filter((c) => {
  const first = mainByItemId.get(c.itemId);
  const repeat = repeatByItemId.get(c.itemId);
  const bothHaveData =
    (first?.panel.validDecisionCount ?? 0) > 0 && (repeat?.panel.validDecisionCount ?? 0) > 0;
  if (!bothHaveData) executionGaps.push(c.itemId);
  return bothHaveData;
});

const labelStableCount = genuinelyComparable.filter((c) => c.labelStable === true).length;
const outcomeStableCount = genuinelyComparable.filter((c) => c.outcomeStable === true).length;
const escalationStableCount = genuinelyComparable.filter((c) => c.escalationStable === true).length;

emit({
  status: "measured_from_pilot_results",
  metricName: "inter_agent_repeat_stability",
  itemCount: comparisons.length,
  comparableItemCount: genuinelyComparable.length,
  executionGapItemIds: executionGaps,
  executionGapNote:
    executionGaps.length > 0
      ? "These items are excluded from the stability rates below because at least one of the two runs collected zero valid decisions (session-limit failure), not because the panels disagreed. Reported separately rather than silently counted as instability."
      : null,
  labelStabilityRate: genuinelyComparable.length
    ? labelStableCount / genuinelyComparable.length
    : null,
  outcomeStabilityRate: genuinelyComparable.length
    ? outcomeStableCount / genuinelyComparable.length
    : null,
  escalationStabilityRate: genuinelyComparable.length
    ? escalationStableCount / genuinelyComparable.length
    : null,
  detail: comparisons,
  warning:
    "This is inter_agent_repeat_stability across fresh isolated agent panels, not human test-retest reliability.",
});
