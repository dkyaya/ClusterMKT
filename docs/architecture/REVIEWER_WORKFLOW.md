# Reviewer workflow

## State sequence

```text
candidate item
  → deterministic assignment
  → blinded independent submissions
  → agreement/routing check
  → adjudication or explicit unresolved state
  → versioned gold label
  → calibration/held-out evaluation
  → optional regression promotion
```

Assignment, decision, adjudication, gold, and regression records are separate. A later state references earlier immutable records rather than overwriting them.

## Assignment and roles

The local workflow supports `reviewer`, `senior_reviewer`, `adjudicator`, and `corpus_manager`. IDs are fixture-safe pseudonyms. There is no authentication claim. Deterministic ordering accepts a seed so assignments are reproducible; a different seed can change presentation order without changing item identity.

At least two distinct reviewers are assigned to each candidate. Items marked adversarial expect three. Assignment records permanently assert that prediction, peer-decision, and adjudication visibility are false.

## Blinding boundary

The initial reviewer receives the task, instructions, permitted evidence fields, evidence depth, provenance, uncertainty options, confidence control, and notes field. Serialization removes pipeline predictions; assignment and decision IDs; peer notes; adjudication and final-gold links; gold confidence; amendment history; adjudicator notes; and regression state.

Submission records also assert that predictions, peer decisions, and adjudication were not visible. A submission is rejected for assignment, item, task, or reviewer mismatch; a closed assignment; a duplicate assignment submission; incompatible abstention choices; a missing required label; missing escalation notes; or any blinding flag set to true.

## Submission and amendments

One initial decision per assignment is allowed. Decisions preserve task, labels, abstention state, confidence, notes, evidence citations, reviewer, assignment, timestamp, and blinding flags. `insufficient_evidence` and `cannot_determine` are mutually exclusive and cannot be combined with a substantive label.

A correction appends a replacement decision and amendment record. The amendment carries the prior checksum and labels, replacement labels, reason, actor, and timestamp. The prior decision is retained. The same rule applies after gold finalization.

## Adjudication routing

Routing is mandatory for completed-review disagreement, low confidence, cannot-determine, critical evidence rules, selected high-risk labels, material prediction disagreement revealed after initial submission, and prior-label amendments. An adjudicator cannot be one of the item’s initial reviewers.

Adjudication records all decisions considered, final labels or unresolved state, reason, cited evidence, confidence, identity, timestamp, and recommendations for guide clarification, threshold review, or regression promotion. Critical factual and provenance labels are resolved from evidence, never simple majority.

## Agreement

Metrics use the latest non-withdrawn decision per reviewer and item. Pairwise categorical tasks support raw agreement and Cohen’s kappa. Three-reviewer tasks support Fleiss’ kappa only when rating counts are mathematically compatible. Ordered labels support weighted kappa only when the annotation contract defines ranks. Adjudicated gold enables per-label precision/recall and confusion matrices. Reports also include cannot-determine, insufficient-evidence, review-required, and confidence distributions.

All metrics are disaggregated by task, label where gold comparisons exist, difficulty, source category, evidence depth, sector, and reviewer pair. A low value triggers schema, guide, reviewer-training, or sampling review; cases are not deleted to improve scores.

## Developer workbench and CLI

`/dev/review`, `/dev/review/:itemId`, and `/dev/adjudication` are direct-only developer views backed by local demonstration state. They are absent from consumer navigation, make no network calls, expose no real personal data, and do not claim authentication or a production reviewer service.

`scripts/cluster-mkt-corpus.mjs` provides offline list, inspect, assign, submit, adjudicate, agreement, partition, calibrate, replay, promote, and report commands. Local workflow writes go only to ignored `.tmp/gold-corpus-workflow/` state. Assignment is required before submission, promotion needs an explicit confirmation flag, and `--live` is refused with a stable nonzero exit code. Repository fixture promotion remains a separate reviewed operation.
