# Tests

Cross-workspace regression fixtures and future integration tests belong here. Unit and component behavior tests currently live beside their owning core, config, UI, web, and Worker code and are orchestrated by `vitest.workspace.ts`.

Do not place meaningless snapshots, generated coverage, live-service tests, publisher credentials, or production data here. Future failed relevance, entity-resolution, and ticker-collision cases should become durable fixtures in this boundary.
