# Tests

Cross-workspace regression fixtures and future integration tests belong here. Unit and component behavior tests currently live beside their owning core, config, UI, web, and Worker code and are orchestrated by `vitest.workspace.ts`.

Do not place meaningless snapshots, generated coverage, live-service tests, publisher credentials, or production data here. Future failed relevance, entity-resolution, and ticker-collision cases should become durable fixtures in this boundary.

`fixtures/source-intelligence/` contains 35 machine-testable adversarial cases. `source-intelligence/` exercises the production evaluator, anti-concentration, coverage gaps, podcast and headline evidence boundaries, ticker collisions, and shared Sector Brief references.

`source-normalization/`, `entity-resolution/`, and `event-boundaries/` exercise the production normalization foundation against 80 machine-readable fixture cases. The suites enforce URL safety, duplicate and syndication distinctions, version chains, ambiguous ticker defenses, provenance completeness, quarantine retention, and event separation.

`story-clusters/`, `claims/`, `agreement-disagreement/`, and `provenance/` exercise 62 adversarial cases. They enforce candidate membership, evidence-depth limits, quantitative distinctions, independent support, genuine discourse, review routing, accepted Sector Brief boundaries, and complete raw-to-visible provenance paths.

The ingestion suites exercise 50 registry, adapter, duplicate, version, policy, failure, retry, cursor, checkpoint, edition, quarantine, cluster, brief, rules-version, and resume fixtures. Seven focused projects require local-only adapters, zero live-ready sources, stable replay behavior, bounded retry, complete raw-record accounting, resume equivalence, and a provenance-complete fixture-to-brief path.

`fixtures/gold-corpus/` contains 345 review candidates plus deliberately empty decision, adjudication, and gold-label stores. `gold-calibration/` verifies schema validity, required strata, blinding, independent assignment, duplicate-submission defense, event-group-safe partitions, metric implementations, fail-closed calibration, and zero automatic regression promotion. Human labels must be collected outside automated test generation.

`fixtures/agent-review-pilot/pilot-selection.json` records the deterministic 52-item blind multi-agent calibration pilot selection drawn from the gold corpus, its per-task and cross-cutting coverage, and any strata that were mathematically unreachable within the required task distribution (with a recorded root cause rather than a silent gap). Agent-panel decisions, dissent, adjudication, and owner-escalation results are not committed as test fixtures; they are pilot run output evaluated by the `agent-review:*` scripts.
