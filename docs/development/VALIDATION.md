# Validation

`pnpm validate` runs, in order:

1. Canonical browser-brand asset synchronization.
2. Prettier check.
3. ESLint.
4. Strict TypeScript checking across workspaces.
5. All Vitest behavior tests once.
6. Offline sector-coverage evaluation, after its exact-case test project.
7. Offline source-normalization evaluation.
8. Offline entity-resolution evaluation.
9. Offline event-boundary evaluation.
10. Offline Story Cluster candidate and membership evaluation.
11. Offline claim and evidence-depth evaluation.
12. Offline agreement and disagreement evaluation.
13. Offline claim-provenance graph evaluation.
14. Offline source-registry, adapter, idempotency, retry, reconciliation, resume, and ingestion-simulation gates.
15. Gold-corpus generation, focused tests, coverage, agreement, calibration, replay, and regression-promotion gates.
16. Web production build and Worker Wrangler dry-run bundle.
17. Python brand validation.
18. Blind multi-agent calibration pilot validation.
19. Application-foundation validation.

The brand gate checks production vectors, geometry, transparency, image dimensions, icons, contrast, minimum sizes, motion, and its manifest. The application gate checks required files and scripts, one pnpm lockfile, private package identities, prohibited dependencies, environment/secret hygiene, generated asset hashes, route boundaries, honest demonstration labeling, CI, and the five locked-master hashes.

On a new machine, install the brand validator's pinned Python requirements and
Chromium runtime before running the suite:

```sh
python -m pip install --requirement brand/validation/requirements.txt
python -m playwright install chromium
```

CI performs the same setup, including Playwright's system-dependency installer
for the ephemeral Ubuntu runner.

CI repeats the same stages on pull requests and pushes to `main` using a frozen lockfile. Common failures are unsynchronized icons, unformatted authored files, invalid evidence fixtures, edition-boundary regressions, a changed locked master, or a prohibited connection/dependency. Fix the underlying cause, rerun the narrow gate, then rerun `pnpm validate`.

## Controlled browser acceptance

Frontend and browser-interaction acceptance requires inspection of the running application through an available controlled browser such as Playwright MCP. Source review and unit tests alone do not establish visual or interaction acceptance. Exercise the affected flows at representative desktop and mobile viewports, inspect the accessibility structure, review console warnings and errors, inspect failed network requests, and capture evidence for material states.

Nested controls inside draggable or swipeable surfaces require real-browser regression coverage because DOM test environments do not reproduce native pointer-capture retargeting completely. Component tests for this interaction class must include pointerdown before click, assert interactive descendants do not request capture, and cover successful, insufficient, vertical, and cancelled gesture paths.

Playwright MCP remains a local developer and agent tool rather than a workspace dependency. Claude Code and Codex require separate local MCP registration. For Codex local stdio servers, `Auth: Unsupported` can be expected; enabled registration plus successful discovery and invocation in a new session are the relevant signals. Do not commit user-specific MCP configuration or profile paths. Put screenshots, console and network logs, and supported traces under the current phase's `relays/tmp/` staging directory.

Generated reports are written beneath ignored `relays/tmp/application-foundation/` for relay construction.

## Sector source intelligence

`pnpm sector:validate` reruns the source-intelligence test project and writes JSON and Markdown evaluation reports under `relays/tmp/sector-source-intelligence/`. Its gates expose exact failed cases for scope promotion, ticker collisions, podcast transcript rules, provenance, source-family deduplication, brief references, issuer concentration, and coverage gaps. Current results are deterministic fixtures; source capability records do not establish legal authorization unless their review status says so.

Real-browser inspection is required for the sector pages. Verify scope labels, gaps, Story Cluster links, edition and theme behavior, responsive layout, console output, and failed requests. Unit acceptance alone is insufficient.

## Source normalization, entity resolution, and event boundaries

The focused commands are `pnpm source:validate`, `pnpm entities:validate`, and `pnpm events:validate`. Each first runs exact Vitest assertions against production deterministic logic and then writes a corpus-level report with exact critical failures beneath `relays/tmp/source-normalization-entity-resolution/validation/`.

Rule changes must use a stable version such as `normalization-v1` and compare new evaluation results with the prior version rather than silently rewriting history. Real-browser acceptance of the direct-only developer inspector must show raw and derived records, URL decisions, candidate and accepted entities, event signatures, review and quarantine states, console output, and failed requests at desktop and mobile sizes.

## Story Clusters, claims, discourse, and provenance

The focused commands are `pnpm clusters:validate`, `pnpm claims:validate`, `pnpm discourse:validate`, and `pnpm provenance:validate`. Together they evaluate all 62 offline adversarial cases and write JSON plus Markdown reports under `relays/tmp/story-cluster-claim-provenance/validation/`.

Critical gates include zero unsupported visible claims, zero metadata-only detailed claims, zero transcript-free podcast evidence, zero syndicated-source inflation, zero false consensus or manufactured disagreement, and complete claim-to-raw plus brief-to-raw provenance. A candidate requiring review must include reasons and cannot masquerade as accepted output.

Real-browser acceptance of `/dev/clusters` must verify membership decisions, evidence depth, independent support, discourse groups, uncertainty, review routing, eligibility, and provenance at desktop and mobile sizes. The route is direct-only and must remain absent from primary consumer navigation.

## Offline ingestion

`pnpm ingestion:validate` runs seven fixture projects and evaluation reports: source registry, adapter contract, idempotency, retries, reconciliation, resume, and end-to-end simulation. Critical gates require zero live-ready sources, real network calls, unreviewed or prohibited retrieval, infinite retry, unexplained loss, duplicate accepted output, quarantine leakage, podcast-metadata claims, syndication inflation, and broken provenance.

Browser acceptance of `/dev/ingestion` must inspect source selection, adapter results, retrieval provenance, rate-limit and circuit state, quarantine, ledger, checkpoints, resume, reconciliation, status counts, and offline boundary labels at desktop and mobile sizes. It remains absent from consumer navigation.

## Gold calibration corpus

`pnpm corpus:validate` regenerates the deterministic candidate corpus, runs its focused tests, and writes coverage, partition, and regression-promotion reports. `pnpm corpus:agreement`, `pnpm corpus:calibrate`, and `pnpm corpus:replay` emit explicit pending states until real independent reviewer decisions exist. This is a successful safety behavior, not a claim that agreement or held-out accuracy passed.

The corpus gate requires at least 300 items, every task and adversarial stratum minimum, no prediction leakage, event/underlying-work-safe partitions, no automated gold label, and no issuer overconcentration. Browser acceptance must verify blinded evidence, controls, cannot-determine, confidence, local submission, adjudication gating, coverage, pending metrics, responsive layout, absence from consumer navigation, and zero unexpected console/network failures.

## Blind multi-agent calibration pilot

`pnpm agent-review:validate` (run inside `pnpm validate` before `foundation:validate`) checks the deterministic 52-item pilot selection, zero packet answer-leakage, every item's terminal panel state, every high-risk item's adjudicated-or-unresolved status, every owner escalation's recorded reason, and that no disputed panel is marked unanimous. `pnpm agent-review:pilot`, `pnpm agent-review:agreement`, `pnpm agent-review:adjudication`, `pnpm agent-review:stability`, and `pnpm agent-review:owner-escalation` report metrics from the saved pilot results; `pnpm agent-review:report` runs them together. Reports are written under `relays/tmp/blind-multi-agent-calibration-pilot/validation/`.

Real-browser acceptance of `/dev/agent-panels` and `/dev/agent-panels/:itemId` must verify the agent disclosure and provisional-status labeling, reviewer roles, dissent, adjudication with anonymized panel-member ids only (no reviewer identity leakage), owner escalation with reasons, packet hash and prompt/role versions, repeat-run stability, absence from consumer navigation, responsive layout, and zero unexpected console/network failures.
