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

CI repeats the same stages on pull requests and pushes to `main` using a frozen lockfile. Common failures are unsynchronized icons, unformatted authored files, invalid evidence fixtures, edition-boundary regressions, a changed locked master, or a prohibited connection/dependency. Fix the underlying cause, rerun the narrow gate, then rerun `pnpm validate`.

Generated reports are written beneath ignored `relays/tmp/application-foundation/` for relay construction.
