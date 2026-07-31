# Entity resolution review guide

## Question

Determine whether visible evidence identifies a configured public company, security, institution, sector, or macro topic. Candidate generation is not acceptance. Private-market entities are outside this corpus.

## Labels

- `candidate_entity`: visible evidence makes a registry entity plausible.
- `accepted_entity`: the acceptance rule is satisfied.
- `rejected_false_match`: ordinary language, another referent, or conflicting context disproves the candidate.
- `direct_mention`: the entity is explicitly named or unambiguously identified.
- `inferred_mention`: the evidence implies but does not explicitly identify the entity.
- `ticker_mention`: the token is used as a security ticker in context.
- `sector_match` or `macro_topic_match`: visible evidence directly concerns the configured sector or topic.
- `review_required`: acceptance or rejection is unsafe without qualified review.

Direct names and bounded registry identifiers are mostly objective. Ticker use, shared aliases, inference, and contextual sector matches require judgment. Ambiguous ticker acceptance is a critical label and prioritizes zero false positives.

## Positive, negative, and edge examples

- Positive accepted entity: the legal issuer name and `NVDA` appear beside shares, earnings, and a matching filing identifier.
- Positive sector match: the evidence explicitly concerns semiconductor manufacturing across named activities without identifying one issuer.
- Negative ticker: “all are open,” “now expects,” “a race,” and similar ordinary phrases do not identify securities merely because a token matches a symbol.
- Negative issuer inference: a sector tag or URL slug does not establish that a constituent is mentioned.
- Edge: a product name is shared by several issuers; a subsidiary is named without the parent; a publisher tag contradicts the visible text; or a ticker is also an ordinary word.

## Decision tree

```text
Is the entity explicitly named or identified by a bounded registry identifier?
├─ Yes → direct_mention; accept only if context is consistent
└─ No
   ├─ Is the only signal a ticker-like ordinary word? → rejected_false_match
   ├─ Is there a plausible but incomplete contextual link? → candidate_entity + review_required
   └─ Is no qualified entity evidence present? → rejected_false_match or claim absent
```

Use `insufficient_evidence` when a required identity field is missing. Use `cannot_determine` when multiple configured entities remain plausible. Cite the exact field and character span where available. Escalate every unresolved ambiguous ticker, shared product alias, subsidiary-parent ambiguity, source-tag contradiction, or identity decision that controls downstream cluster acceptance.
