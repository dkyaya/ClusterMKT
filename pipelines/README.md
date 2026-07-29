# Pipelines

## Responsibility

Planned workflows for collection, normalization, entity resolution, relevance, duplicate detection, Story Clustering, provenance, and reusable written/audio modules.

## Belongs here

Explicit pipeline stages, validated adapters, scheduled workflow definitions, deterministic transformations, model fallbacks, and provenance-preserving outputs.

## Does not belong here

UI components, publisher credentials, paywall bypasses, application routing, or untraceable model-only decisions.

## Status and dependencies

An offline fixture-only adapter and ingestion dry-run foundation is implemented under `pipelines/ingestion` and `pipelines/adapters/mock`. Future live collection still depends on approved sources, persistence decisions, and explicit authorization.

The sector source-intelligence phase adds no collection path. Future ingestion must validate source capability and provenance, deduplicate syndication families, distinguish discovery metadata from summary evidence, and emit accepted Story Clusters before Sector Brief assembly.

Framework-independent offline normalization primitives now exist in `@cluster-mkt/core`, but this directory still contains no live collector, scheduled job, publisher client, database writer, or AI step. A future ingestion pipeline must preserve raw records, apply a named rules version, retain rejected and quarantined outcomes, and pass the fixture evaluations before connecting any source.

Offline cluster primitives now define the next boundary: normalized records and event signatures become reviewed candidates, claims retain evidence-depth-qualified provenance, and accepted clusters become the only ordinary Sector Brief input. This directory still implements none of those production orchestration steps.

The dry-run now orchestrates those contracts locally: mock adapters emit raw records, retrieval provenance and ledger entries remain auditable, retries are bounded, bad records are isolated, scheduled edition fixtures are idempotent, resumes do not duplicate output, and reconciliation accounts for every item. It includes no network client, production scheduler, credential, database, or live-ready source.
