# ADR 0002: Shared agent guidance

## Status

Accepted — 2026-07-28

## Context

Codex, Claude Code, and other coding agents need one durable set of product, engineering, working, and relay rules. Duplicated instruction files would drift or conflict.

## Decision

Use `AGENTS.md` as the canonical cross-agent guidance. `CLAUDE.md` imports it with `@AGENTS.md` and contains only Claude-specific compatibility guidance. Local Claude preferences belong in ignored `CLAUDE.local.md`.

## Consequences

Shared rules have one review surface. Claude Code and Codex receive consistent boundaries. Agent-specific local settings remain untracked, and detailed product or architecture material stays in linked documentation rather than bloating the instruction file.
