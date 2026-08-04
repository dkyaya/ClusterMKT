# 0019: Blind multi-agent calibration

Status: accepted.

Independent human review of the gold calibration corpus remains unavailable in this phase. Rather
than block calibration entirely or substitute a single reviewing agent, Cluster MKT runs blinded
multi-agent panels: a coordinator builds isolated evidence packets per item and assigns them to
independent agent workers who cannot see pipeline predictions, existing gold labels, each other's
decisions, adjudication outcomes, consensus statistics, coordinator preferences, or prior answers
for the same item. See [BLIND_MULTI_AGENT_REVIEW](../architecture/BLIND_MULTI_AGENT_REVIEW.md) for
the mechanism and [0020](0020-agent-consensus-is-provisional.md) for what the resulting labels may
and may not claim.
