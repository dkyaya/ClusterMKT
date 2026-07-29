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

| Route                                                                  | Foundation behavior                                                 |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `/`                                                                    | Today shell, Daily Brief preview, and labeled static Story Clusters |
| `/clusters/:clusterId?tab=overview\|read\|listen`                      | URL-addressable tabs with source provenance demonstrations          |
| `/watchlist`, `/sectors`, `/saved`, `/listen`, `/calendar`, `/profile` | Honest placeholder boundaries                                       |
| `/settings`                                                            | Disabled future preference sections without persistence             |
| `/dev/normalization`                                                   | Direct-only offline developer fixture inspector                     |
| `/dev/clusters`                                                        | Direct-only cluster, claim, review, and provenance inspector        |

There are no authentication gates.

## Prototype interactions

Global search is a controlled, accessible form that accepts user input without filtering fixtures or fabricating results. Submissions state that indexing is not connected. A route-aware profile menu provides Profile, Settings, and Appearance access on desktop and mobile without implying authentication.

On mobile, the sticky header keeps its identity and profile row visible while the search row collapses after meaningful downward scrolling and returns on upward movement, near the document top, or while search is focused. The passive listener is isolated in a reusable hook, and reduced-motion styles remove movement transitions.

The global Daily Brief is edition- and New York market-date-specific. Dismissal works by an accessible button, Escape, or horizontal pointer gesture and is retained only in safe `sessionStorage`. Drag initiation excludes interactive descendants and explicit `data-no-drag` regions, while pointer capture begins only after horizontal intent is established so nested controls and vertical scrolling retain normal browser behavior. Story Cluster cards and tabs use the `tab` query parameter, so refresh and browser history preserve Overview, Read, or Listen. The Listen panel contains a cluster-specific audio preview rather than the global Daily Brief. All audio remains demonstration-only.

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

The application now includes offline sector-source-intelligence contracts, deterministic fixture evaluation, shared Sector Brief assembly from accepted Story Clusters, and a responsive Semiconductors demonstration with visible scope labels. Live source ingestion and inference remain outside the foundation.

The direct-only normalization inspector distinguishes preserved raw evidence from derived records, URL rules, duplicate and syndication status, article versions, candidate and accepted entities, event signatures, decision logs, review cases, and quarantined records. It is not exposed in consumer navigation or presented as a production admin tool.

The direct-only cluster inspector shows candidate membership, accepted and rejected claims, evidence depth, independent support, agreement, disagreement, uncertainty, review routing, and claim-to-source provenance. Consumer demonstration clusters conform to the same supported-claim and provenance contracts without materially changing the approved interface.

All market stories and controls are static demonstrations. There is no ingestion, live data, account system, persistence, external AI, podcast processing, TTS, or production infrastructure. The next bounded architecture phase should design source metadata, capability matrices, entity dictionaries, relevance fixtures, and adversarial clustering cases without connecting live ingestion.
