# Ingestion retry, quarantine, and review

Retry policy is bounded and deterministic. Fixture clocks and seeded jitter simulate delay without sleeping. Transient network, timeout, server, configured malformed-response, and rate-limit failures may retry; retry-after is honored. Authentication, permission, terms, disabled-source, and idempotency failures do not retry automatically. Repeated transient failures open a simulated circuit breaker, and exhausted work enters dead-letter rather than an infinite loop.

Quarantine isolates invalid, suspicious, conflicting, policy-blocked, or provenance-incomplete records. Human review handles ambiguity that may be resolvable. Dead-letter retains exhausted automatic failures. The retry queue contains only pending transient attempts. All four states preserve provenance, remain countable, and cannot silently support accepted output.

Release from quarantine requires explicit resolution evidence and revalidation. Current queues are in-memory or local fixture artifacts, not production infrastructure.
