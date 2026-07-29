# 0015: Separate retry, quarantine, review, and dead-letter states

Status: accepted for the offline foundation.

Decision: transient failures use bounded deterministic retry, suspicious or invalid records enter quarantine, resolvable ambiguity enters human review, and exhausted automatic work enters dead-letter. Resume continues from a validated checkpoint with the same run identity.

Consequence: failures remain countable and provenance-preserving; no state silently enters accepted output or retries forever.
