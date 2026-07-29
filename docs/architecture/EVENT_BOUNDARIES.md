# Event boundaries

Event clustering uses structured signatures rather than company and date alone. A signature can preserve event type, primary and secondary entities, sector and subindustries, macro topics, action, object, effective and announcement dates, geography, policy or filing ID, product or business line, quantitative anchors, direction, source-family evidence, confidence, review status, explanations, and the normalization rules version.

Deterministic boundary rules distinguish:

- one event reported or updated by several sources;
- a materially revised version of one underlying work;
- separate earnings and analyst actions on the same date;
- a policy proposal and final rule;
- rumor and confirmation states;
- an initial economic release and correction;
- different quarters, effective dates, geographies, products, or business lines; and
- multiple events mentioned in one article.

Event similarity is evidence for a decision, not the decision itself. Publisher or headline differences do not automatically split an event, and entity/date overlap does not automatically merge one. Ambiguous boundaries remain review-required and countable.

Candidate Story Cluster membership records the boundary rationale for every normalized record, including market reaction, related context, versions, syndication, mixed-event records, and conflicting fields. This prevents presentation or source count from silently overriding event identity.
