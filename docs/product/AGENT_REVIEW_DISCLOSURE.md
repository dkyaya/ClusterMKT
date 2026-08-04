# Agent review disclosure

Cluster MKT's gold calibration corpus is normally reviewed by independent human reviewers
(`docs/architecture/REVIEWER_WORKFLOW.md`). While multi-human review capacity is unavailable, a
bounded pilot uses blinded multi-agent review instead, described fully in
[BLIND_MULTI_AGENT_REVIEW](../architecture/BLIND_MULTI_AGENT_REVIEW.md).

## What agent review is

Independent AI agent workers, operating in isolated contexts with no visibility into pipeline
predictions, existing gold labels, each other's decisions, or prior answers for the same item,
each label a blinded evidence packet. A separate isolated agent adjudicates disputed or high-risk
panels. The result is a provisional, versioned label in the `agent-calibration-v1` family.

## What agent review is not

- It is not independent human review, and multi-agent agreement is not human inter-rater
  agreement.
- It is not equivalent to, and does not imply, external expert validation.
- It cannot promote an item to final human-validated gold on its own.
- It does not imply the system read, listened to, or verified content beyond the permitted
  evidence package supplied to reviewers.

## What stays visible

Every provisional label discloses its label family, panel outcome (unanimous, strong consensus,
majority, split, disputed, insufficient), any surviving dissent, whether it was adjudicated, and
whether it is eligible for or pending owner review. Disagreement is never hidden to present a
falsely confident result, and review-required items never masquerade as accepted output. This
mirrors the existing commitments in `docs/product/ANNOTATION_POLICY.md`.

## Path back to human review

The existing owner-review workflow remains available as an optional final confirmation layer for
any agent-panel outcome, and is unmodified by this system. Nothing here removes the requirement,
described in `docs/architecture/GOLD_CALIBRATION_CORPUS.md`, that a live-source pilot needs
completed independent human review and adjudication for its acceptance set.
