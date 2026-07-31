# Story Cluster membership review guide

## Question

Determine the role of a normalized record relative to one bounded Story Cluster event. Membership must preserve the event-boundary rationale, evidence depth, version and syndication relationships, terminal state, and provenance.

## Labels

- `accepted_member`: direct event evidence with an eligible role.
- `related_context`: relevant background, analysis, or market reaction that does not establish the core event.
- `rejected`: outside the event boundary or irrelevant.
- `review_required`: plausible membership remains materially ambiguous.
- `quarantined`: the record is isolated by a critical integrity, rights, provenance, or evidence rule.

Quarantine status is objective once recorded. Accepted versus related context is judgment-based. All accepted membership decisions are critical because they control visible claims and downstream Sector Brief assembly.

## Positive, negative, and edge examples

- Positive accepted member: a filing and independent report share the same event signature while preserving primary and secondary evidence roles.
- Positive related context: a reaction report explicitly analyzes the bounded event but does not establish its primary facts.
- Negative membership: an issuer profile shares an entity but predates and never mentions the event.
- Negative membership: a different product announcement occurs on the same company and date.
- Edge: a mixed-event record partly concerns the cluster; metadata-only evidence identifies a topic but cannot establish detailed membership; a quarantined record otherwise appears relevant.

## Decision tree

```text
Is the record quarantined or provenance-invalid?
├─ Yes → quarantined
└─ No
   ├─ Does it directly satisfy the cluster event signature? → accepted_member
   ├─ Does it provide bounded background or reaction only? → related_context
   ├─ Is it outside the event boundary? → rejected
   └─ Are material boundary signals unresolved? → review_required
```

Use `insufficient_evidence` when the package lacks event-boundary fields. Use `cannot_determine` when visible fields support competing membership roles. Cite the compatible and conflicting fields. Escalate mixed-event records, unresolved entity candidates, metadata-only records proposed as primary evidence, and any record whose terminal state conflicts with proposed acceptance.
