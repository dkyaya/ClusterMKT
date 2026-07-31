# Threshold calibration

## Boundary

`calibration-v1` defines candidate thresholds for URL near-duplicates, syndication, article versions, entity acceptance, ticker disambiguation, event similarity, cluster membership, claim equivalence, sector materiality, and review routing. It does not authorize automatic threshold replacement.

No threshold is chosen from candidate labels or pipeline predictions alone. Required inputs are adjudicated human gold, recorded pipeline scores generated without seeing the item’s gold label, the deterministic partition assignment, and a task-specific objective.

## Partitions

- Training/development (60% target) supports deterministic rule design and debugging.
- Calibration (20% target) compares candidate thresholds and selects a proposal.
- Held-out evaluation (20% target) is untouched during selection and controls approval.

Partitioning uses event or underlying-work groups. Article versions, syndicated copies, near-duplicates, and same-event packages cannot cross splits.

## Objectives

Critical precision ranks before recall. In particular:

- ambiguous-ticker acceptance targets zero false positives;
- sector-wide promotion targets zero company-specific false promotion;
- unsupported visible-claim rate remains zero;
- syndication never inflates independent support;
- event and cluster thresholds do not merge on company plus date alone;
- claim equivalence preserves periods, units, scope, attribution, and material quantitative differences;
- review routing may increase when uncertainty protects a critical precision gate.

Candidate alternatives are evaluated with true positives, false positives, precision, recall, and critical failures. A candidate with any prohibited critical false positive is not viable even if its aggregate score is higher.

## Result contract

Every threshold result records:

- calibration version and threshold ID;
- training, calibration, and held-out corpus versions;
- objective;
- old configured value;
- candidate alternatives and their metrics;
- selected proposal or `null`;
- tradeoffs and blocking reasons;
- approval status;
- explicit `automaticallyApplied: false` until held-out approval.

Held-out evaluation reports critical gates individually. It cannot be summarized into one accuracy number. A threshold proposal is rejected or returned for repair when any critical gate fails. Failed examples stay in the corpus and may become regression candidates after human finalization.

## Current result

The candidate sets and objectives are configured, but the status is `blocked_pending_human_review`. There are no adjudicated calibration observations or held-out human labels, so chosen thresholds remain `null`, configured values remain unchanged, and held-out performance is not claimed. This is the required fail-closed state.
