# 0021: Risk-based owner escalation

Status: accepted.

Every agent-panel item resolves to a terminal panel state, but not every item needs owner
attention. Disputed panels, unresolved adjudication, low adjudicator confidence, surviving
high-confidence critical dissent, quantitative or sector-wide disputes, alleged provenance
failures, ambiguous-ticker false-match risk, and unstable repeat-run panels route to a bounded
owner-review queue with an explicit reason. Unanimous low-risk items do not require owner review.
The existing owner-review workflow remains the optional final confirmation layer; agent review
supplements it and cannot promote a case to final human-validated gold on its own. See
[BLIND_MULTI_AGENT_REVIEW](../architecture/BLIND_MULTI_AGENT_REVIEW.md).
