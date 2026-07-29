# Ingestion ledger

The offline ledger records stable run and scheduled-slot identity, source and adapter attempts, retrieval provenance, raw and normalized records, duplicate and version decisions, cluster and Sector Brief outputs, warnings, errors, checkpoints, resume tokens, and a manifest checksum.

Idempotency keys use stable source, record, checksum, rule, market-date, edition, and slot inputs. An exact replay is skipped, a correction links a version, a rules-version reprocessing preserves prior results, and an unexplained collision is quarantined. Random IDs are not the sole replay defense.

Every raw record ends in exactly one continuing or terminal state. Reconciliation rejects unexplained loss, multiple terminal states, and provenance failures.
