# Pipelines

## Responsibility

Planned workflows for collection, normalization, entity resolution, relevance, duplicate detection, Story Clustering, provenance, and reusable written/audio modules.

## Belongs here

Explicit pipeline stages, validated adapters, scheduled workflow definitions, deterministic transformations, model fallbacks, and provenance-preserving outputs.

## Does not belong here

UI components, publisher credentials, paywall bypasses, application routing, or untraceable model-only decisions.

## Status and dependencies

Not implemented. Future work depends on approved sources, domain contracts in `packages/core`, persistence decisions, and test fixtures.

The sector source-intelligence phase adds no collection path. Future ingestion must validate source capability and provenance, deduplicate syndication families, distinguish discovery metadata from summary evidence, and emit accepted Story Clusters before Sector Brief assembly.
