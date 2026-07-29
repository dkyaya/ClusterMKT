# Offline ingestion dry run

The `@cluster-mkt/ingestion` workspace and `scripts/cluster-mkt-ingestion.mjs` compose the existing evidence pipeline without connecting a source. A dry run loads the operational registry, selects reviewed fixture sources, invokes local mock adapters, records retrieval provenance, applies idempotency and retry rules, validates raw records, normalizes evidence, routes entity and event decisions, constructs review-gated Story Clusters and claims, validates provenance, assembles accepted Sector Briefs, reconciles all counts, writes local `.tmp/ingestion-dry-run/` artifacts, and saves a safe checkpoint.

Morning, Midday, and Closing fixtures are scheduled at 6:07 a.m., 12:07 p.m., and 6:07 p.m. America/New_York. The offset is deliberate. Stable slot identity supports delayed, missed, manual replay, resume, edition transition, and explicit daylight-saving offsets without a real cron job.

Interruption fixtures cover adapter pages, raw persistence, normalization, clustering, Sector Brief assembly, and reconciliation. Resume reuses the run identity and last safe checkpoint; completed output is deduplicated. Resumed and uninterrupted accepted outputs must be semantically equivalent.

All current results are deterministic fixtures. No publisher, API, government service, podcast platform, Cloudflare service, database, credential, AI system, or production scheduler is connected.
