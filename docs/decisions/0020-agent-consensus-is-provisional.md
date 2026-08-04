# 0020: Agent consensus is provisional, not human-validated gold

Status: accepted.

Multi-agent agreement is a reliability signal, not a substitute for independent human validation.
Agent-panel outcomes use the corpus label family `agent-calibration-v1` and never overwrite
`calibration-v1`, `owner-calibration-v1`, or any human-gold label. No public-facing or internal
report may describe agent-panel review as equivalent to, or a replacement for, independent expert
human review. Provisional promotion still requires passing the gates in
[THRESHOLD_CALIBRATION](../architecture/THRESHOLD_CALIBRATION.md) and
[BLIND_MULTI_AGENT_REVIEW](../architecture/BLIND_MULTI_AGENT_REVIEW.md).
