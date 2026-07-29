# 0014: Use an idempotent ingestion ledger

Status: accepted for the offline foundation.

Decision: retrieval pages, raw records, article versions, runs, scheduled slots, cluster candidates, and Sector Briefs receive deterministic keys from stable inputs. The ledger retains duplicates, updates, review, rejection, and quarantine decisions rather than dropping them.

Consequence: edition replay and interruption recovery do not duplicate accepted output, while rules-version reprocessing remains explicit and auditable.
