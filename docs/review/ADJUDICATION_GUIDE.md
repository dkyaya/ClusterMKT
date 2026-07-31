# Adjudication guide

## Entry conditions

Adjudication begins only after the required distinct initial reviewers have submitted under blinding. Route an item when reviewers disagree, confidence is low, `cannot_determine` is selected, a high-risk label or critical evidence rule is implicated, a material pipeline-versus-human difference is revealed after submission, or a prior gold label is amended.

The adjudicator must be independent from the initial reviewers. Critical factual, provenance, quarantine, entity-acceptance, and sector-wide labels are not resolved by simple majority.

## Procedure

1. Confirm the item version, assignment completeness, reviewer independence, and absence of a blinding incident.
2. Read the permitted evidence and current guide before examining the decision comparison.
3. Compare each reviewer’s labels, confidence, notes, and evidence citations.
4. Identify whether disagreement is evidentiary, definitional, procedural, or caused by missing evidence.
5. Apply the task definition. Do not choose a label because it improves agreement or pipeline metrics.
6. Record a final label or explicit unresolved state.
7. Cite the decisive evidence and explain why competing labels do not apply.
8. Record confidence, adjudicator ID, and timestamp.
9. Mark whether a guide clarification, threshold review, sampling expansion, or regression fixture is needed.

## Output contract

Every adjudication records:

- item ID, task, and all reviewer decision IDs considered;
- final label IDs or an explicit unresolved result;
- reason and cited evidence;
- whether guideline clarification is needed;
- whether threshold review is needed;
- whether regression promotion is recommended;
- confidence, adjudicator identity, and timestamp.

An unresolved adjudication blocks gold promotion. A resolved adjudication does not automatically become a regression fixture or change any threshold.

## Difficult cases

- If two labels remain plausible because evidence is missing, preserve `insufficient_evidence` or unresolved status.
- If definitions overlap, resolve the item using the current contract and separately request a guide/schema clarification.
- If a reviewer used unavailable knowledge, disregard that rationale, preserve the submitted decision, and record a workflow issue.
- If a prior gold label is wrong, create an amendment with before/after labels, checksum, reason, actor, and timestamp. Never rewrite history.
- If source rights or fixture integrity are uncertain, quarantine or exclude with a documented reason; do not adjudicate the substantive label from compromised evidence.

## Promotion decision tree

```text
Required independent reviews complete?
├─ No → block
└─ Yes
   ├─ Blinding or provenance failure? → block and investigate
   ├─ Evidence resolves the task? → record final label + rationale
   └─ Evidence does not resolve it? → explicit unresolved state

Resolved + versioned + complete provenance + permitted fixture use?
├─ No → no gold/regression promotion
└─ Yes → gold candidate; regression promotion remains a separate focused decision
```
