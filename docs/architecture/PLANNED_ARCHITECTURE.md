# Planned architecture

## Status

The repository now implements the application foundation: pnpm workspace, React/Vite web shell, plain Cloudflare Worker boundary, shared core/UI/config packages, canonical brand integration, Vitest, ESLint, Prettier, and non-deploying GitHub Actions CI.

The demonstration shell is not a connected production system. Ingestion, a source registry, entity resolution, relevance scoring, duplicate detection, Story Cluster generation, claim provenance, persistent storage, Supabase authentication, user preferences, scheduled workflows, Kokoro TTS, and deployment remain planned.

## Planned information flow

```text
Publisher feeds, APIs, filings, investor-relations sources, and podcast metadata
↓
Collection and normalization
↓
Entity resolution and relevance scoring
↓
Duplicate detection and Story Clustering
↓
Claim-level provenance and cluster summaries
↓
Reusable written and audio modules
↓
Personalized web experience
```

None of the upstream collection or generation stages is connected. Current fixtures are static, validated demonstration objects.

## Implemented boundaries

- `apps/web`: accessible routes, Today and cluster-detail demonstrations, settings placeholders, responsive navigation, appearance-aware edition accents, and generated runtime icons.
- `apps/worker`: `GET /health`, `GET /api/status`, and explicit 404/method handling without databases or service bindings.
- `packages/core`: Zod schemas for Story Clusters, source evidence, podcasts, and deterministic helpers.
- `packages/ui`: reusable semantic primitives and keyboard-accessible tabs.
- `packages/config`: identity, navigation, routes, and America/New_York edition selection.
- `brand`: locked sources, tokens, production assets, and Python validation.
- `tests` and workspace-local tests: behavior checks for schemas, editions, UI, web, and Worker routing.
- `scripts`: deterministic brand sync, validation, cleanup, and relay tools.

## Still planned

- `pipelines`: collection, normalization, entity resolution, duplicate detection, relevance scoring, clustering, claim provenance, and reusable summary/audio modules.
- Supabase authentication, PostgreSQL persistence, user preferences, and account data.
- Scheduled collection workflows and approved publisher/feed integrations.
- Kokoro TTS experiments and reusable audio generation.
- Cloudflare Pages/Workers production configuration and deployment.

All future transformations must validate external data, preserve source provenance, distinguish unavailable content, and expose explicit failure states. See [application foundation](APPLICATION_FOUNDATION.md) for the implemented route and package map.
