# Validation

`pnpm validate` runs, in order:

1. Canonical browser-brand asset synchronization.
2. Prettier check.
3. ESLint.
4. Strict TypeScript checking across workspaces.
5. All Vitest behavior tests once.
6. Web production build and Worker Wrangler dry-run bundle.
7. Python brand validation.
8. Application-foundation validation.

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
