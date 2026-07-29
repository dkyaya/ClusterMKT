# `@cluster-mkt/config`

Shared, non-secret product constants: application identity, route paths, navigation, and deterministic America/New_York edition definitions. Environment credentials, deployment settings, user data, and application-specific state do not belong here.

The package is implemented and consumed by the web shell. Appearance preference remains independent from edition selection.

It includes the Cluster MKT-owned Semiconductors editorial taxonomy, public-company fixtures, offline macro-topic and institution definitions, and conservative demonstration source-capability records. These records do not imply publisher authorization.

`src/normalization/` owns the stable `normalization-v1` policy data for URL handling, entity context, and duplicate thresholds. `src/entities/` provides the bounded public-company, security, macro, institution, sector, and subindustry alias registry used by fixtures. Duplicate aliases are surfaced for explicit adjudication; no private-market universe is present.

The same stable rules version is attached to downstream Story Cluster, claim, discourse, and provenance decisions. Configuration supplies transparent policy inputs; it does not contain source credentials, generated conclusions, or runtime network behavior.
