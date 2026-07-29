# Local development

Use Node.js 22–24 LTS-compatible behavior and pnpm 10. The current build also runs on the available local Node 25 runtime; CI is authoritative on Node 24 LTS.

```sh
pnpm install
python -m pip install --requirement brand/validation/requirements.txt
python -m playwright install chromium
pnpm dev:web
pnpm dev:worker
```

The Python packages and Chromium runtime are required only by the existing brand
validator. Application development itself remains a pnpm workspace.

## Controlled browser tooling

Playwright MCP is an optional local developer and agent tool, not an application dependency. Claude Code and Codex maintain separate local MCP registrations; configuring one client does not configure the other. Codex may display `Auth: Unsupported` for a local stdio MCP server because that transport does not use OAuth. `Status: enabled`, successful tool discovery in a new Codex session, and actual browser invocation are the meaningful checks.

After changing local MCP configuration, fully restart the active client or start a new Codex session before testing tool discovery. Keep user-specific configuration paths, browser profiles, caches, and credentials outside the repository. Store browser screenshots, logs, and supported traces beneath the phase-specific `relays/tmp/` directory used to build the task relay.

`pnpm dev` runs both development processes in parallel. Runtime browser icons are synchronized automatically before root or web development.

Frontend acceptance checks should exercise the typeable-but-disconnected search form, header profile menu, mobile scroll-direction search row, session-scoped Daily Brief dismissal, and direct Story Cluster tab URLs such as:

```text
/clusters/cluster-grid-review?tab=overview
/clusters/cluster-grid-review?tab=read
/clusters/cluster-grid-review?tab=listen
```

Daily and cluster-specific audio controls are intentionally nonfunctional demonstrations. Clear `sessionStorage` when manually repeating Daily Brief dismissal checks in the same browser session.

Quality commands:

```sh
pnpm test
pnpm test:run
pnpm lint
pnpm typecheck
pnpm format
pnpm format:check
pnpm build
pnpm validate
```

Remove generated build, coverage, Wrangler, and browser-brand outputs with:

```sh
pnpm clean
```

The Worker commands are local only. Do not add deployment flags, credentials, or service bindings during foundation work.
