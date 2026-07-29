# Tests

Cross-workspace regression fixtures and future integration tests belong here. Unit and component behavior tests currently live beside their owning core, config, UI, web, and Worker code and are orchestrated by `vitest.workspace.ts`.

Do not place meaningless snapshots, generated coverage, live-service tests, publisher credentials, or production data here. Future failed relevance, entity-resolution, and ticker-collision cases should become durable fixtures in this boundary.

`fixtures/source-intelligence/` contains 35 machine-testable adversarial cases. `source-intelligence/` exercises the production evaluator, anti-concentration, coverage gaps, podcast and headline evidence boundaries, ticker collisions, and shared Sector Brief references.

`source-normalization/`, `entity-resolution/`, and `event-boundaries/` exercise the production normalization foundation against 80 machine-readable fixture cases. The suites enforce URL safety, duplicate and syndication distinctions, version chains, ambiguous ticker defenses, provenance completeness, quarantine retention, and event separation.
