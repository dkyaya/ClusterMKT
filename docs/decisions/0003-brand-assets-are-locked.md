# ADR 0003: Brand assets are locked

## Status

Accepted — 2026-07-28

## Context

The Cluster MKT mark and full brand package have passed structural, transparency, geometry, accessibility, icon, and minimum-size validation. Casual regeneration would risk geometry, palette, shading, or compatibility drift.

## Decision

Treat the five validated Cluster MKT mark SVGs in `brand/source/locked-masters/` as locked source assets. Any visual change requires explicit approval and the complete brand build and validation suite.

## Consequences

Application work consumes the existing assets and tokens rather than redesigning them. Build tooling verifies hashes before and after generation. Approved future changes must update the recorded hashes, documentation, manifests, previews, and validation evidence together.
