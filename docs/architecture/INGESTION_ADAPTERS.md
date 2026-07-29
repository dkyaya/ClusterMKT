# Ingestion adapters

All adapters implement one fixture-only contract: validated input window, cursor, checkpoint, maximum item count, dry-run marker, timestamp, and fixture ID produce raw source records or explicit classified errors plus next cursor, checkpoint, exhaustion, rate-limit, warnings, and retrieval provenance.

Adapters never return normalized records. The current RSS-, API-, filing-, podcast-, transcript-, and failure-shaped adapters read repository-local JSON only. There is no HTTP client or hidden network fallback. Identity mismatches and non-dry-run requests fail closed.

Future adapters can implement the same boundary only after source terms, legal, and technical reviews; the core pipeline contract does not need to change.
