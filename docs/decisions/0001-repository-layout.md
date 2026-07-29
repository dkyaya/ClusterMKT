# ADR 0001: Repository layout

## Status

Accepted — 2026-07-28

## Context

The project had a validated brand package but no application structure or documented boundaries. Future web, worker, pipeline, and shared-package work needs clear ownership without prematurely scaffolding a toolchain.

## Decision

Use a repository structure separating the web application, worker/backend, shared core/UI/config packages, pipelines, brand assets, documentation, testing, scripts, and relays.

## Consequences

Future scaffolding has intentional destinations and dependency boundaries. Brand work remains isolated and auditable. Placeholder directories contain responsibility READMEs only until implementation is authorized. Cross-area changes should document why they cross a boundary.
