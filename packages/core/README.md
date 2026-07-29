# `@cluster-mkt/core`

Framework-independent Story Cluster schemas, evidence contracts, stable domain types, and deterministic helpers. Presentation components, network collection, persistence, model calls, and application-specific demonstration data do not belong here.

The package is implemented and validated with Zod and Vitest. Web and Worker code may consume its public exports; collection pipelines will eventually produce these contracts.

It also owns entity, sector, relation, source-registry, and Sector Brief schemas plus transparent sector-materiality, diversity, feed, and brief builders. It performs no I/O or model inference.

The package now also owns raw and normalized source schemas, URL/text normalization, source-family and syndication decisions, article version chains, entity candidate and acceptance decisions, event signatures and boundaries, deduplication, and provenance-preserving pipeline logs. Rules are supplied by configuration; no network or persistence exists here.

Story Cluster candidate construction, membership decisions, structured claims, evidence eligibility, quantitative preservation, independent-support counting, agreement and disagreement, uncertainty, review routing, presentation contracts, and provenance graphs also live here. These helpers are deterministic and side-effect free; rejected and quarantined outcomes remain countable.

Operational registry, adapter, retrieval-provenance, ledger, idempotency, retry, quarantine, queue, schedule, reconciliation, and resume contracts now extend the framework-independent boundary. They use injected fixture time and local orchestration; `@cluster-mkt/core` still performs no network or production persistence.
