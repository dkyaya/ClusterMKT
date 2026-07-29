# Scripts

Durable local automation for brand generation, asset synchronization, repository/application validation, cleanup, and relay construction. One-off debug code and application domain logic do not belong here.

- `sync-web-brand-assets.mjs` generates the browser icon bundle from canonical `brand/icons/` files.
- `clean-generated.mjs` removes only known generated workspace outputs.
- `validate-application-foundation.mjs` enforces workspace, product-boundary, brand-integrity, dependency, and CI contracts.
- `build_application_foundation_relay.py` reruns the committed implementation gates and packages the first-commit audit relay.
- `build_frontend_acceptance_repair_relay.py` reruns the accepted interaction gates and packages the committed frontend-repair audit relay.
- `validate_repository_foundation.py` retains the pre-application structural gate.
- `build_brand_relay.py` and `build_repo_foundation_relay.py` preserve earlier relay workflows.

Application tests live with their owning workspaces; cross-package regression fixtures belong in `tests/`.
