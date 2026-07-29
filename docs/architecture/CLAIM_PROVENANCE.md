# Claim provenance

Claims are domain records separate from the words shown in a Story Cluster. Each claim preserves its normalized proposition, subject, predicate, object, event and time scope, quantitative detail, attribution, certainty, evidence links, independent support, status, confidence, review state, explanation codes, and rules version.

## Evidence-depth limits

- Headline-only records may support discovery and limited topic identification, never detailed, quantitative, causal, or nuanced claims.
- Metadata supports source identity, authorship, timestamps, and content type only.
- Publisher abstracts support only propositions explicitly present in the abstract.
- Primary releases, regulatory filings, and government releases support their explicit official statements while retaining primary-source attribution.
- Permitted official transcripts and fuller fixture text support only statements present in the reviewed fixture.
- Podcast metadata without a permitted transcript remains related listening and contributes no factual evidence.

Every accepted evidence use names the normalized record, raw record, underlying work, source family, evidence depth, supporting span or field, primary and syndicated status, acceptance decision, and explanation code. Raw evidence remains unchanged.

## Provenance graph

The graph models raw record → normalized record → underlying work → claim evidence → claim → discourse/uncertainty → Story Cluster → Sector Brief. Validation rejects missing nodes, broken references, orphaned visible claims, forbidden cycles, quarantined support, syndicated-count inflation, and missing rule versions. Every visible factual claim and every accepted Sector Brief statement must have a complete path to raw evidence.

`pnpm claims:validate` and `pnpm provenance:validate` enforce these boundaries with fixture-level failure reporting.

Retrieval provenance extends the graph upstream without replacing raw evidence. An accepted dry-run path records registry source → adapter attempt → raw record → normalized record → underlying work → evidence → claim → cluster → Sector Brief. Missing retrieval or claim provenance is reconciled as a failure and blocks accepted output.
