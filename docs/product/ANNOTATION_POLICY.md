# Annotation policy

Gold labels represent independent human judgments about visible, permitted evidence. They are not pipeline predictions, model output, reviewer consensus manufactured after seeing a score, or investment opinions.

Initial review is blinded. At least two distinct reviewers are required, selected adversarial cases require three, disagreements remain visible, and qualified adjudication cites the evidence used. Uncertainty, insufficient evidence, cannot determine, review required, and explicit unresolved adjudication are legitimate outcomes.

Reviewers label source-work relationships, entity identity, event boundaries, cluster membership, claims and support, agreement/disagreement, routing, and sector scope. The annotation contract marks each label objective, judgment-based, or mixed and defines positive, negative, edge, confidence, note, and escalation rules.

The corpus excludes private markets, investment attractiveness, recommendations, and price predictions. It never implies access to unavailable content. Metadata and headlines have limited evidentiary value; company statements are not independent confirmation; syndicated copies are not independent; and podcast content requires a permitted transcript before factual use.

Corrections create amendments and retain prior labels. Difficult or low-agreement examples remain in the corpus. Items may be excluded only for documented rights, corruption, duplicate-identity, or scope reasons—not to improve metrics.

Agreement and system evaluation are reported by task and risk class. Critical evidence failures cannot be hidden by aggregate accuracy. Threshold selection uses separate calibration data; held-out human gold controls approval. No source becomes live merely because a threshold proposal passes. Formal source terms, capabilities, cost, credentials, adapter dry run, bounded smoke-test authorization, and reconciliation remain separate gates.

Where independent human reviewers are unavailable, blinded multi-agent panels may generate provisional `agent-calibration-v1` labels under the same evidentiary discipline — see [BLIND_MULTI_AGENT_REVIEW](../architecture/BLIND_MULTI_AGENT_REVIEW.md). Agent agreement is never described as human inter-rater agreement, and an agent panel can never itself finalize a human gold label.
