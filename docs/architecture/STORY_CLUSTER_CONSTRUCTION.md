# Story Cluster construction

Story Clusters are deterministic, reviewable products of normalized records and resolved event signatures. They are not bags of articles selected by company name, date, or an opaque similarity score.

## Candidate boundary

Every considered record receives an explicit membership decision: `accepted`, `related_context`, `rejected`, `review_required`, or `quarantined`. Decisions preserve compatible and conflicting fields, confidence, review state, event-boundary rationale, and explanation codes. Entity overlap alone cannot merge events. Article versions and syndicated copies remain visible while contributing only one underlying work; market-reaction and background records retain distinct evidence roles.

Candidates retain primary and secondary entities, sector and subindustry scope, macro topics, geography, timestamps, source and work identities, evidence limitations, claims, discourse groups, uncertainty, and the rules version. A candidate becomes visible only after review routing confirms supported claims and complete provenance.

## Presentation boundary

Titles identify the event without sensationalism. Overview, why-it-matters, agreement, competing arguments, uncertainty, and resolution conditions are assembled only from accepted structured records. Presentation text never upgrades metadata into evidence, conceals review status, or combines materially different propositions into false consensus.

Current extraction and presentation are fixture-annotated and template-based. There is no publisher retrieval, persistence, embedding, AI inference, or generated prose.

## Evaluation

`pnpm clusters:validate` evaluates grouping, event separation, membership roles, review routing, and display eligibility against adversarial offline fixtures. Exact failed cases remain visible; aggregate scores cannot override a critical gate.
