# `@cluster-mkt/core`

Framework-independent Story Cluster schemas, evidence contracts, stable domain types, and deterministic helpers. Presentation components, network collection, persistence, model calls, and application-specific demonstration data do not belong here.

The package is implemented and validated with Zod and Vitest. Web and Worker code may consume its public exports; collection pipelines will eventually produce these contracts.

It also owns entity, sector, relation, source-registry, and Sector Brief schemas plus transparent sector-materiality, diversity, feed, and brief builders. It performs no I/O or model inference.
