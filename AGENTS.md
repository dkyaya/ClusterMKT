# Cluster MKT agent guidance

## Project mission

Cluster MKT is a market-information hub for retail investors.

Product promise: Cluster MKT™ does not tell investors what to buy. It provides a clearer, faster way to understand the information that may influence their investment decisions.

Tagline: All your sources, in one Cluster™

See [product foundation](docs/product/PRODUCT_FOUNDATION.md), [planned architecture](docs/architecture/PLANNED_ARCHITECTURE.md), and [brand guidance](brand/BRAND_GUIDELINES.md) for detail.

## Product boundaries

- Organize evidence; do not make investment decisions.
- Do not add buy, sell, hold, price-target, or prediction features without explicit authorization.
- Do not bypass publisher paywalls.
- Do not store publisher usernames, passwords, cookies, session tokens, or subscription credentials.
- Full articles open through their original publishers. Publisher OAuth is not in the current plan.
- Build on article metadata, authorized abstracts, public feeds, primary sources, and outbound links.
- Podcast content must not affect summaries unless an accessible, permitted transcript is available.
- Podcast cards may use publisher metadata, but must disclose whether the episode was used as evidence.
- Represent competing interpretations and uncertainty honestly; avoid false balance.
- Preserve provenance in every AI-assisted output.
- Never imply the application read or listened to unavailable content.

## Story Cluster requirements

- Story Clusters are the core product unit. Their tabs are Overview, Read, and Listen.
- Give every included source a concise “Why this is included” explanation.
- Separate verified facts, interpretation, disagreement, uncertainty, and future evidence.
- Preserve primary-source and secondary-source distinctions.
- Material claims require traceable evidence.
- Every visible factual claim must preserve claim-to-source provenance.
- Syndicated support must not be counted as independent corroboration.
- Agreement and disagreement must be evidence-derived, without manufactured balance.
- Review-required clusters must not masquerade as accepted output.
- Label podcast metadata-only matches.
- Distinguish sources used in summaries from related reading or listening.
- Aggressively stress-test relevance and clustering. Turn failed edge cases into permanent regression tests where practical.

## Blind multi-agent calibration review

- Independent human review of the gold calibration corpus is unavailable in this phase; blinded multi-agent panels are the interim substitute, never a claimed equivalent.
- A coordinator builds isolated, blinded evidence packets and assigns them to independent agent reviewer workers that cannot see pipeline predictions, existing gold labels, each other's decisions, adjudication outcomes, consensus statistics, coordinator preferences, or prior answers for the same item.
- Panel size and required roles scale with risk class: 3 reviewers for low risk, 5 for standard, 7 for high risk. Quantitative claims, ambiguous tickers, event merges, sector-wide promotion, rumors, corrections, metadata-limited or podcast-only evidence, and syndication disputes are high risk.
- Multi-agent agreement is a reliability signal, not human inter-rater agreement. Never call it that, and never call provisional agent labels independently validated gold.
- A simple majority is never sufficient for a high-risk case. Disputed panels are never marked unanimous, and dissent is never hidden.
- Disputed or high-risk panels route to a separate isolated adjudicator that does not know reviewer identities and cannot be silently overridden by the coordinator.
- Provisional agent-panel labels live in the `agent-calibration-v1` family and never overwrite `calibration-v1`, `owner-calibration-v1`, or human-gold labels. Agent panels cannot promote a case to final human-validated gold on their own.
- High-risk and disputed cases remain eligible for owner review; the existing owner-review workflow is the optional final confirmation layer and is not replaced.
- See `docs/architecture/BLIND_MULTI_AGENT_REVIEW.md` and `docs/product/AGENT_REVIEW_DISCLOSURE.md` for the full mechanism and disclosure rules.

## Planned architecture

Planned choices are React, Vite, TypeScript, Cloudflare Pages and Workers, Supabase authentication and PostgreSQL, scheduled collection workflows, shared Story Cluster generation, Kokoro for initial TTS experimentation, and user-specific assembly from reusable summary and audio modules.

The pnpm TypeScript workspace, React/Vite shell, Worker boundary, shared packages, and an offline fixture-only ingestion dry run are implemented. Supabase, live ingestion, production scheduling, TTS, external AI, and production deployment remain planned and unconnected.

Workspace packages are `@cluster-mkt/web`, `@cluster-mkt/worker`, `@cluster-mkt/core`, `@cluster-mkt/ui`, and `@cluster-mkt/config`. Use pnpm exclusively. Run `pnpm validate` as the full gate; narrow gates include `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, `pnpm build`, `pnpm brand:validate`, and `pnpm foundation:validate`.

## Design principles

- Keep the interface minimal, clean, editorial, and generous with whitespace.
- Avoid overly technological, brokerage, cryptocurrency, or trading-terminal visuals.
- Use the validated package in `brand/`; do not casually modify locked assets.
- Canonical marks live in `brand/source/locked-masters/`. Generated browser icons live in ignored `apps/web/public/brand/`; regenerate them with `pnpm assets:sync`.
- Preserve light and dark modes plus Morning, Midday, and Closing edition accents.
- Use a newspaper-style editorial serif for headlines, DM Sans for interface text, and tabular sans-serif numerals for prices, percentages, dates, scores, and timestamps.
- Accessibility and reduced-motion support are mandatory.
- Use animation sparingly and intentionally; preserve restrained hierarchy.

## Engineering rules

- Prefer strict TypeScript. Avoid `any` unless documented and unavoidable.
- Validate all external data and keep domain logic separate from presentation.
- Preserve source provenance and metadata through every transformation.
- Never expose secrets to the client or commit real `.env` files.
- Add dependencies only for a clear need. Paid APIs and services require explicit approval.
- Prefer deterministic logic before model inference where practical.
- Every model-generated output needs a fallback or explicit failure state.
- Keep implementations testable and reproducible.
- The current application shell uses labeled demonstration data. Do not describe it as live or connected.
- Use stable identifiers for stories, sources, entities, and clusters.
- Respect publisher terms and robots or feed constraints.
- Model confidence is not evidence.

## Working discipline

- Inspect before editing and avoid unrelated changes.
- Never delete a unique file without verification.
- Run relevant tests and validators after changes.
- Do not push remotes or commit unless explicitly authorized.
- Preserve filenames that are documented contracts.
- Update documentation when architecture or behavior changes.
- State blockers and uncertainty instead of guessing.
- Record meaningful design and architecture decisions.
- Keep generated files separate from sources.
- For frontend or browser-interaction tasks, use an available controlled browser such as Playwright MCP to inspect the running application, exercise affected flows at desktop and mobile sizes, check console and network failures, and capture validation evidence. Do not claim visual acceptance based only on source review.
- Interactive descendants inside draggable or swipeable surfaces must be excluded from drag initiation and validated in a real browser.
- Sector-wide coverage requires breadth evidence; company-led impacts keep their label, and sector feeds must not collapse into the largest constituent.
- Never count syndicated copies as independent sources; preserve raw evidence and normalization provenance.
- Candidate entity matches must not be treated as accepted mentions.
- Event identity must not be reduced to entity plus date.
- Cluster membership must preserve its event-boundary rationale and rejected or review-required outcomes.
- No live source may be activated without explicit terms, legal, and capability review.
- Every retrieval attempt must preserve provenance; ingestion must be idempotent, resumable, and fully reconciled.
- Quarantine, review, retry, and dead-letter states must remain distinct and cannot silently enter accepted output.
- Gold labels require blinded independent human review; never substitute pipeline or model output for reviewer decisions.
- Preserve reviewer disagreement and amendment history. Threshold changes require leakage-safe calibration and held-out evaluation.
- Do not claim completion while required validation fails.

## Relay requirement

Every substantial agent task ends with a relay package containing what changed; exact created and modified files; validation results; decisions; uncertainties and blockers; a recommended next step; reproduction commands; SHA-256 hashes; and a plain-English translation.

Use `relays/cluster-mkt-<phase>-relay-YYYY-MM-DD-<short-hash>.zip`.
