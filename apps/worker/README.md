# `@cluster-mkt/worker`

Minimal Cloudflare Worker boundary with plain request routing. It currently exposes `GET /health` and `GET /api/status` plus structured 404 and method responses.

No Supabase, storage, queue, scheduled workflow, publisher, market-data, AI, or authentication connection exists. `pnpm build:worker` performs a local Wrangler dry-run bundle and never deploys.
