# Reviewer handbook

## Purpose and boundary

Cluster MKT’s gold corpus is an offline, human-reviewed calibration asset. It tests whether deterministic source-intelligence rules organize visible evidence safely before any live publisher or API is connected. A candidate item is not a gold label. Gold status requires independent human review and the recorded workflow in this handbook.

Review only the evidence displayed in the assigned package. Do not search the web, infer the contents of an unavailable article, use investment knowledge to fill a gap, or treat a pipeline candidate as evidence. Initial reviewers never see pipeline predictions, other reviewers’ answers, or adjudication results. If any of those appear before initial submission, stop and report a blinding violation.

The corpus excludes private-market coverage, investment attractiveness, buy/sell/hold opinions, price targets, and price predictions. Those are not annotation tasks.

## Reviewer roles

- `reviewer` performs blinded initial annotation.
- `senior_reviewer` performs blinded initial annotation and may be assigned higher-risk cases.
- `adjudicator` compares completed independent decisions and records a resolution or explicit unresolved state. The adjudicator must not be an initial reviewer on that item.
- `corpus_manager` manages versions, assignments, amendments, exclusions, partitions, and regression promotion. The role does not authorize changing a label to improve metrics.

Fixture-safe identities such as `reviewer-cedar` are pseudonyms. They are not authentication or personal-data records.

## Evidence hierarchy

Use the evidence depth shown on the item:

1. Structured source metadata supports source identity, content type, byline, and timestamps only.
2. A headline supports limited discovery and topic identification, not detailed causal, quantitative, or nuanced claims.
3. A publisher abstract supports only propositions stated in that abstract.
4. A permitted short excerpt supports only the cited words and their visible context.
5. A public primary-source fixture supports the official statement it contains; it does not create independent confirmation of the issuer’s own claim.
6. A permitted transcript can support statements present in the transcript.
7. Podcast metadata without a permitted transcript is related-listening metadata and cannot support factual claims.

Never upgrade an evidence package because the missing content seems likely to say more.

## Shared decision procedure

For every item:

1. Confirm the task, item ID, evidence depth, copyright classification, and visible-field allowlist.
2. Read all permitted fields before choosing a label.
3. Identify the exact field or span that supports the decision.
4. Apply the task guide’s positive and negative criteria.
5. Check the listed edge cases and critical evidence rules.
6. Choose a task label, `insufficient_evidence`, or `cannot_determine`.
7. Record confidence and notes. Cite evidence; do not cite unavailable content.
8. Submit once. A correction is a new amendment record, never an overwrite.

Use `insufficient_evidence` when the needed fact is absent from the package. Use `cannot_determine` when relevant evidence is present but reasonably supports more than one classification. These are different outcomes and must not be selected together.

## Confidence

- `high`: the visible evidence satisfies an explicit rule with no material competing reading.
- `medium`: the label is better supported than alternatives, but bounded judgment is required.
- `low`: material ambiguity remains. Low confidence always routes to adjudication and requires explanatory notes.

Confidence is not evidence and does not change the label definition.

## Rules that apply to every task

- Candidate entity generation is not entity acceptance.
- Same company and date do not establish the same event.
- Similar headlines do not establish duplicate or syndicated work.
- Different wording does not establish disagreement.
- Different periods, units, scopes, geographies, actuals, forecasts, or attributions must be normalized before contradiction is considered.
- A company statement is attributable primary evidence, not independent confirmation.
- Syndicated copies, format variants, and article versions count as one underlying work for independent support.
- Quarantine, review-required, rejected, retry, and dead-letter states remain distinct.
- False balance is prohibited. Do not create a disagreement because an opposing view would seem editorially balanced.
- Uncertainty is a valid outcome. Review-required is safer than forced certainty.
- Difficult cases remain in the corpus even when they reduce agreement or system metrics.

## Independent review and blinding

At least two distinct initial reviewers are required for every gold candidate. Adversarial and high-risk factual, provenance, ambiguous-ticker, quarantine, or sector-wide cases may require three. A reviewer cannot submit twice for the same assignment. Initial reviewers cannot see:

- pipeline predictions or scores;
- peer labels, confidence, notes, or decision IDs;
- adjudication state or final gold labels;
- amendment or regression-promotion state that would reveal an earlier outcome.

Reviewers may see source provenance because provenance is evidence, not a prediction.

## Escalation and adjudication

Route an item to adjudication when reviewers disagree, any reviewer has low confidence, a reviewer selects `cannot_determine`, a critical evidence rule is implicated, a high-risk label lacks strong agreement, a later comparison reveals material system-versus-human disagreement, or a prior gold label is amended.

Critical factual or provenance labels are never decided by simple majority. The adjudicator must cite evidence, explain why competing labels do or do not apply, record confidence, and state whether the guide, threshold, or regression suite needs revision. If the evidence cannot resolve the case, preserve an explicit unresolved state.

## Amendments and exclusions

An amendment records the prior checksum and labels, replacement labels, reason, actor, and timestamp. The earlier decision and gold label remain auditable. Corpus managers may exclude an item only with a documented reason such as invalid fixture rights, duplicate annotation identity, corrupted evidence, or scope violation. Low agreement, difficulty, or an inconvenient result is not an exclusion reason.

## Quality gates

Agreement is reported by task, label, difficulty, source category, evidence depth, sector, and reviewer pair. Raw agreement, categorical kappa, ordered-label kappa where applicable, multi-rater kappa where applicable, confusion matrices, precision/recall against adjudicated gold, abstention rates, review-routing rates, and confidence distributions remain separate. No aggregate metric can conceal a critical failure.

The initial targets are raw agreement of at least 0.85 for objective binary tasks and Cohen’s kappa of at least 0.70 for core categorical tasks. Low agreement triggers guideline, schema, training, or sampling review—not label deletion.

## Quick decision tree

```text
Is the needed evidence visible and permitted?
├─ No → insufficient_evidence
└─ Yes
   ├─ Does one task definition clearly apply? → choose it and cite the evidence
   ├─ Do two definitions remain plausible? → cannot_determine + notes
   └─ Is a critical identity/provenance/safety rule implicated? → task label + escalation
```

Use the task-specific guide for the final classification.
