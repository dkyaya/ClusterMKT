# Application foundation

## Workspace structure

Cluster MKT uses one private pnpm workspace and lockfile. Applications live in `apps/*`; reusable packages live in `packages/*`. Root scripts coordinate deterministic asset synchronization, linting, type-checking, behavior tests, local builds, brand validation, and foundation validation.

## Package responsibilities

- `@cluster-mkt/web` owns browser routing and presentation using demonstration fixtures.
- `@cluster-mkt/worker` owns the plain request boundary and no external connections.
- `@cluster-mkt/core` owns framework-independent source, podcast, evidence, and Story Cluster contracts.
- `@cluster-mkt/ui` owns accessible primitives, semantic behavior, and token-driven styles.
- `@cluster-mkt/config` owns non-secret product identity, route, navigation, and edition definitions.

## Web route map

| Route                                                                  | Foundation behavior                                                   |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `/`                                                                    | Today shell, Daily Brief preview, and labeled static Story Clusters   |
| `/clusters/:clusterId`                                                 | Overview, Read, and Listen tabs with source provenance demonstrations |
| `/watchlist`, `/sectors`, `/saved`, `/listen`, `/calendar`, `/profile` | Honest placeholder boundaries                                         |
| `/settings`                                                            | Disabled future preference sections without persistence               |

There are no authentication gates.

## Worker route map

- `GET /health` returns service, status, current timestamp, and environment label.
- `GET /api/status` reports the application foundation and explicitly reports live data, authentication, and external AI as disconnected.
- Unknown routes return 404; non-GET methods return 405.

Wrangler performs only local development and dry-run bundling. No deployment or Cloudflare resource exists.

## Brand integration

The web and UI packages import canonical CSS tokens from `brand/`. Dimensional light and dark SVG masters are bundled directly from `brand/source/locked-masters/`; their bytes are not changed. `scripts/sync-web-brand-assets.mjs` copies exactly nine canonical icon/manifest files into ignored `apps/web/public/brand/`. Validation compares every generated file hash with its source.

## Edition handling

`@cluster-mkt/config` selects Morning, Midday, or Closing from an absolute timestamp using `America/New_York`. The application root receives `data-edition`. CSS edition accents and the user’s `prefers-color-scheme` appearance remain separate; Closing does not force dark mode.

## Testing and CI

Vitest workspaces cover domain validation, evidence flags, edition boundaries, accessible UI interaction, app rendering, demonstration labels, cluster cards, and Worker routes. GitHub Actions uses Node 24, pnpm 10, Python 3.12, the frozen lockfile, and the same staged gates as local validation. CI does not deploy.

## Current limitations and next phase

All market stories and controls are static demonstrations. There is no ingestion, live data, account system, persistence, external AI, podcast processing, TTS, or production infrastructure. The next bounded architecture phase should design source metadata, capability matrices, entity dictionaries, relevance fixtures, and adversarial clustering cases without connecting live ingestion.
