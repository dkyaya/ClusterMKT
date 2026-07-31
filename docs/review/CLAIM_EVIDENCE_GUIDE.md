# Claim and evidence review guide

## Question

Determine whether a proposed claim is present, how it should be typed, and whether the permitted evidence supports the full bounded proposition. A claim includes subject, predicate, object, time and event scope, quantities, units, attribution, certainty, and qualification.

## Labels and required fields

- `claim_present` or `claim_absent` records whether the proposition appears.
- `fact` or `interpretation` distinguishes a verifiable statement from explanation, evaluation, or inference.
- `quantitative` marks a material number, unit, period, or comparison.
- `attributed_statement` preserves the named speaker or organization.
- `supported`, `partially_supported`, or `unsupported` evaluates the complete proposition.
- `metadata_only` records that factual support is unavailable at the item’s evidence depth.

The reviewer must cite the supporting span or structured field. Quantitative decisions also preserve value, unit, currency where relevant, period, denominator, comparison basis, and rounding. Attribution must not be removed merely because the reviewer believes the statement is true.

## Evidence limits

- Metadata supports source facts only.
- Headlines support limited topic discovery, not detailed, causal, or quantitative claims.
- Abstracts support only propositions explicitly stated.
- Primary filings and releases support attributable official statements, not independent confirmation.
- A permitted transcript supports only statements in the transcript.
- Podcast metadata without a permitted transcript supports zero factual claims.

## Positive, negative, and edge examples

- Positive support: an official fixture states the exact quantity, unit, reporting period, and attribution proposed by the claim.
- Partial support: an abstract states that revenue rose but omits the proposed percentage.
- Unsupported: a headline is used to infer why a company took an action.
- Unsupported: an episode description is used as evidence of something allegedly said in the audio.
- Edge: actual versus forecast, adjusted versus unadjusted values, different denominators, material rounding, negation, conditional guidance, or a number whose period is missing.

## Decision tree

```text
Does the permitted evidence contain the proposition?
├─ No → claim_absent + unsupported (or metadata_only)
└─ Yes
   ├─ Are subject, scope, period, quantity, and attribution all supported? → supported
   ├─ Is only a bounded part supported? → partially_supported
   └─ Does the proposal add an inference or unavailable detail? → unsupported
```

Use `insufficient_evidence` when the proposition might be present only in unavailable content. Use `cannot_determine` when visible evidence is internally ambiguous. Escalate missing provenance, unclear access depth, unsupported visible quantitative detail, quarantined support, or any claim proposed for display without an accepted evidence path.
