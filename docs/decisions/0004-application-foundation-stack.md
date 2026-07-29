# 0004 — Application foundation stack

## Status

Accepted

## Context

Cluster MKT needs a testable browser and edge foundation that shares evidence contracts and brand behavior without connecting production services prematurely.

## Decision

Use a pnpm TypeScript workspace with React, Vite, plain Cloudflare Workers, shared core/UI/config packages, Vitest, ESLint, Prettier, and GitHub Actions.

## Consequences

- Applications share validated types and accessible components through explicit package boundaries.
- One lockfile and root validation sequence make local and CI behavior reproducible.
- Web, Worker, domain, UI, and non-secret configuration responsibilities remain distinct.
- No production service, ingestion source, authentication system, database, AI provider, or deployment is connected yet.
- The workspace adds coordination complexity compared with a single-package application.
- Future persistence, collection, and infrastructure choices remain reversible.
