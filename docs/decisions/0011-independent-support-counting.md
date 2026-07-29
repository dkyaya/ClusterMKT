# 0011 — Count independent support by work and source family

## Status

Accepted

## Context

Raw URL or publisher-card counts overstate corroboration when articles are duplicated, versioned, attributed, or syndicated.

## Decision

Count factual support through underlying-work and source-family relationships. Exact duplicates, versions, and syndicated copies count once. A primary source and genuinely independent secondary reporting may count separately. Metadata-only podcasts and related context do not count as direct support.

## Consequences

Agreement strength and displayed source metrics are more conservative. Source registries and normalization decisions must preserve independence relationships, and apparent multi-source coverage can correctly remain single-source.
