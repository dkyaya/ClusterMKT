# Offline ingestion pipeline

`@cluster-mkt/ingestion` composes repository-local fixture adapters with source registration, retrieval provenance, idempotency, review routing, Story Cluster eligibility, Sector Brief assembly, and reconciliation. It has no HTTP client, credentials, scheduler, database, Cloudflare binding, or production mode.

The package is a dry-run architecture boundary. Every adapter returns raw source records; downstream normalization and provenance rules remain owned by `@cluster-mkt/core`.
