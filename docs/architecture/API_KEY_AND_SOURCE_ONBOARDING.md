# API key and source onboarding

No credentials are obtained or used in this phase. `.env.example` names possible future variables but contains no values. Registration never means authorization, and no source becomes enabled automatically.

## No key expected

- SEC public data APIs, subject to documented identification and rate policies
- Formally approved public RSS/Atom and podcast feeds
- Spotify embeds/oEmbed
- Permitted public company and government feeds

## Key or OAuth may be required

- New York Times developer API: `NYT_API_KEY`, only after terms and limits review
- Spotify Web API beyond embeds: `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
- Other formally reviewed developer APIs

## Commercial agreement may be required

Premium financial-news datasets, licensed full text, real-time market data, and commercial transcripts.

## Required onboarding gate

Each source must pass all steps in order:

1. Identify the exact source, operator, endpoint family, and intended use.
2. Review current official documentation.
3. Record an approved terms and legal status for the intended use.
4. Record required fields, evidence depth, attribution, rate limits, retention limits, and technical constraints.
5. Record expected cost, including a zero-cost finding where applicable.
6. Record credential type: none, API key, OAuth, or commercial entitlement.
7. Implement and validate an offline/dry-run adapter against repository fixtures.
8. Store any future secret outside Git and outside client bundles.
9. Obtain explicit authorization for a small bounded live smoke test.
10. Reconcile every attempted and returned record, including quarantine and failure states.
11. Explicitly enable the reviewed source in a separate change.

A credential alone never enables retrieval. Passing calibration does not skip source-specific review, and a no-key source is not automatically permitted.

## Secret boundary

`.env.example` contains future variable names with empty values only. Real `.env` files remain ignored and prohibited from commits. No current package reads these names, no current registry entry is live-ready, and no browser bundle may receive a server credential.
