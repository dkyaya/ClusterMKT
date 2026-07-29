# Local development

Use Node.js 22–24 LTS-compatible behavior and pnpm 10. The current build also runs on the available local Node 25 runtime; CI is authoritative on Node 24 LTS.

```sh
pnpm install
pnpm dev:web
pnpm dev:worker
```

`pnpm dev` runs both development processes in parallel. Runtime browser icons are synchronized automatically before root or web development.

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
