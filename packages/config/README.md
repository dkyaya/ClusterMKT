# `@cluster-mkt/config`

Shared, non-secret product constants: application identity, route paths, navigation, and deterministic America/New_York edition definitions. Environment credentials, deployment settings, user data, and application-specific state do not belong here.

The package is implemented and consumed by the web shell. Appearance preference remains independent from edition selection.

It includes the Cluster MKT-owned Semiconductors editorial taxonomy, public-company fixtures, offline macro-topic and institution definitions, and conservative demonstration source-capability records. These records do not imply publisher authorization.

`src/normalization/` owns the stable `normalization-v1` policy data for URL handling, entity context, and duplicate thresholds. `src/entities/` provides the bounded public-company, security, macro, institution, sector, and subindustry alias registry used by fixtures. Duplicate aliases are surfaced for explicit adjudication; no private-market universe is present.

The same stable rules version is attached to downstream Story Cluster, claim, discourse, and provenance decisions. Configuration supplies transparent policy inputs; it does not contain source credentials, generated conclusions, or runtime network behavior.

`src/sources/` now contains the operational fixture registry, source families, and retrieval policies; `src/ingestion/` contains retry and edition-schedule fixtures. Every source is `fixture_only`, future live eligibility is false, and no endpoint or credential is configured.

`src/calibration/` defines the 345-item sampling plan, eight annotation-task contracts, leakage-safe partition policy, and unapproved `calibration-v1` threshold candidates. `src/sources/credential-requirements.ts` documents future credential classes and the onboarding gate; all live flags remain false and no secret value belongs here.

`src/calibration/agent-reviewer-roles.ts` and `agent-panel-policy.ts` define the seven blind multi-agent reviewer role contracts and the risk-based panel-composition policy (3/5/7 reviewers for low/standard/high risk). `agent-pilot-v1.ts` defines the deterministic 52-item pilot sampling plan. These are policy data only; no live model call, credential, or network behavior lives here.
