# 0010 — Preserve claim-level provenance

## Status

Accepted

## Context

Source-level links alone cannot demonstrate which evidence supports each visible factual statement, especially when source access and evidence depth differ.

## Decision

Represent claims independently from presentation text and require every accepted visible claim to retain a graph path through claim evidence, underlying work, normalized record, and raw record. Evidence depth constrains permitted claim use. Broken, orphaned, quarantined, or unversioned paths block display.

## Consequences

Presentation remains auditable and cannot silently exceed available evidence. Fixtures and future ingestion require more explicit annotations and validation, but downstream Story Clusters and Sector Briefs can expose defensible provenance.
