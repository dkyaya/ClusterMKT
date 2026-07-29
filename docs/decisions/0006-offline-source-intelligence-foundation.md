# 0006: Offline source-intelligence foundation

- Status: accepted
- Date: 2026-07-29

## Decision

Establish source capabilities, entity relations, sector materiality, evaluation fixtures, and the web demonstration as deterministic local data before connecting collection or inference services.

## Rationale

Offline fixtures make provenance rules, false-promotion caps, ticker collisions, podcast transcript boundaries, syndication deduplication, and diversity behavior reproducible. Capability records can be reviewed separately from assumptions about publisher access.

## Consequences

No live ingestion, database, paid API, publisher credential, AI call, TTS, price data, or private-market entity is introduced. Future connectors must validate into these contracts, preserve source roles, and pass the same critical evaluation gates.
