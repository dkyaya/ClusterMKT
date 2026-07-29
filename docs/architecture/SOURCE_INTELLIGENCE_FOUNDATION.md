# Source intelligence foundation

This foundation provides framework-independent, offline contracts for entities, sector taxonomy, cluster relationships, source capabilities, sector materiality, feed assembly, and reusable Sector Briefs.

## Data contracts

`@cluster-mkt/core` validates public companies, securities, sectors, industries, subindustries, macro topics, government agencies, and economic indicators. Private-market categories are intentionally absent. Cluster/entity relations retain scope, normalized materiality and relevance scores, confidence, human-readable relevance, supporting source IDs, explicit versus inferred status, affected dimensions, and editorial review status.

Source-registry records describe capabilities conservatively. A public webpage or unknown feed does not imply legal authorization. `not_reviewed`, `metadata_only`, `public_primary_source`, `authorized_feed`, and `requires_manual_review` distinguish technical discoverability from reviewed use.

## Deterministic materiality

The evaluator's weights live in one exported configuration. It considers sector naming, constituent and subindustry breadth, issuer importance, supply, demand, pricing, capacity, regulation, macro specificity, primary evidence, independent source families, recency, explicitness, confidence, and contradiction.

Hard caps prevent incidental mentions, headline-only records, transcript-free podcast metadata, and a single-company event without propagation from crossing the wrong threshold. A single-source inferred high-impact relation is review-required. Scores range from 0 to 100 and return explanation codes, inclusion status, scope, review status, and “Why this is included” copy.

## Assembly flow

```text
validated fixture evidence
  → materiality and scope relation
  → accepted active Story Clusters
  → scope-aware ranking and diversity adjustment
  → coverage-gap reporting
  → shared sector/date/edition Sector Brief
  → user feed selection
```

The brief builder accepts clusters, not articles. Syndication families count once for source diversity. Competing arguments and uncertainties remain separate. Podcast evidence requires a reviewed, permitted transcript fixture; metadata-only matches remain related listening.

## Semiconductors taxonomy

The taxonomy in `@cluster-mkt/config` is owned by Cluster MKT and is not represented as GICS or another licensed system. It covers chip design and compute, foundries and manufacturing, memory, equipment, analog and power, packaging and testing, and materials, with validated upstream/downstream relationships and representative public-company fixtures.

## Evaluation and runtime boundary

The 35-case adversarial corpus and `pnpm sector:validate` enforce critical failures individually rather than hiding them inside an aggregate score. The browser consumes static demonstration coverage only. There is no runtime fetch, credential, database client, AI SDK, TTS client, or market-price service in this foundation.

## Normalized evidence boundary

The downstream `normalization-v1` contracts now distinguish raw and normalized records, versions, syndication families, accepted entity mentions, and event signatures. Sector evidence counts an underlying syndicated work once and can retain independent reporting on the same event. These contracts remain offline fixtures and do not change the sector materiality thresholds.
