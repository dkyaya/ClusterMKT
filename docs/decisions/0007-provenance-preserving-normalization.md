# 0007: Preserve raw evidence through normalization

Status: accepted

Raw source records are immutable evidence inputs. Derived URLs, source families, normalized text, versions, and routing decisions live in separate records with raw IDs, payload references, explanation codes, confidence, review state, and `normalization-v1`.

This makes rule changes auditable, keeps rejected and quarantined inputs countable, and prevents cleanup from being mistaken for publisher-supplied fact. The tradeoff is additional storage and explicit lineage, which is appropriate for a future provenance-sensitive system.
