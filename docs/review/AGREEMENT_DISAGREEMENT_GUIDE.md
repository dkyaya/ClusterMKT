# Agreement and disagreement review guide

## Question

Compare normalized propositions after accounting for subject, predicate, object, time, scope, units, quantitative tolerance, attribution, certainty, and supersession. Source count is not agreement: versions, format variants, duplicates, and syndicated copies represent one underlying work.

## Labels

- `equivalent`: claims express the same bounded proposition.
- `compatible`: both claims can be true but are not equivalent.
- `contradictory`: both cannot be true under the same normalized conditions.
- `temporal_difference`: distinct times or reporting periods explain the difference.
- `scope_difference`: geography, population, product, denominator, or business scope differs.
- `quantitative_disagreement`: comparable quantities conflict beyond the configured tolerance.
- `interpretive_disagreement`: compatible facts lead to materially different interpretations.
- `apparent_disagreement`: wording differs but no genuine conflict remains after normalization.
- `superseded_claim`: a later correction or authoritative update replaces the earlier proposition.

Most labels require bounded judgment. Explicit corrections and normalized field differences can be more objective. Contradiction and quantitative disagreement are critical because false disagreement manufactures balance.

## Positive, negative, and edge examples

- Equivalent: independent works report the same value for the same period and scope.
- Compatible: one claim concerns revenue and another margin, or one describes a whole sector and another a subindustry.
- Temporal difference: annual and quarterly changes use different periods.
- Apparent disagreement: “slowed” and “continued growing” can both be true when growth remains positive at a lower rate.
- Interpretive disagreement: sources agree on the filing facts but differ on the likely consequence.
- Quantitative disagreement: values remain materially different after units, currency, period, and denominator are aligned.
- Superseded: a correction explicitly replaces an earlier reported value.

## Decision tree

```text
Do subject, time, scope, units, attribution, and certainty align?
├─ No → temporal_difference, scope_difference, compatible, or cannot_determine
└─ Yes
   ├─ Same proposition within tolerance? → equivalent
   ├─ Can both still be true? → compatible or apparent_disagreement
   ├─ Is conflict quantitative? → quantitative_disagreement
   ├─ Is conflict interpretive rather than factual? → interpretive_disagreement
   └─ Otherwise → contradictory

Was one claim explicitly corrected or replaced? → superseded_claim
```

Use `insufficient_evidence` when a comparison field is missing. Use `cannot_determine` when scopes cannot be aligned. Preserve unequal evidence strength; do not force two sides into parity. Escalate every proposed contradiction with incomplete normalization, every material quantitative conflict, and every case in which syndication could inflate support.
