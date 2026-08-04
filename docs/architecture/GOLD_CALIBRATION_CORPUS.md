# Gold calibration corpus

## Purpose and status

`gold-corpus-v1` is Cluster MKT’s first versioned, manually reviewable calibration corpus. It exists to test the deterministic source-intelligence pipeline before any real publisher, feed, API, credential, or production service is connected. Candidate generation is automated and deterministic; gold labeling is exclusively human.

The initial corpus contains 345 annotation-task items. An item is a review question, not necessarily a unique article. One source package may produce separate source-normalization, entity, event, membership, claim, discourse, routing, or sector questions.

Current status is `ready_for_human_review`: reviewer-decision, adjudication, and gold-label stores intentionally start empty. Agreement and held-out performance are not claimed until real independent decisions exist.

## Item contract

Every item records a stable item ID, corpus and annotation-contract versions, source fixture IDs, raw and normalized record IDs, one task, sampling strata, difficulty, evidence depth, source category, event type, sector and subindustry, entity ambiguity, duplicate/syndication class, event-or-work group ID, the reviewer evidence package, a visible-field allowlist, expected review count, provenance, fixture-rights classification, timestamps, amendment history, regression status, exclusion state, and final status.

Pipeline predictions may be attached only in `hiddenPrediction`. Blinded serialization removes this field plus peer-decision, adjudication, amendment, and promotion state. Evidence provenance remains visible because it is part of the review evidence.

Final labels live separately from items. A gold label references at least two independent decision IDs, a resolved adjudication, corpus version, provenance, confidence, finalizer, timestamp, and amendment history. Silent mutation is impossible under the schema: a correction creates a new amendment record with prior checksum, prior and replacement labels, reason, actor, and time.

## Annotation tasks

The eight task families are source normalization, entity resolution, event boundaries, Story Cluster membership, claims, agreement/disagreement, review routing, and sector coverage. `packages/config/src/calibration/annotation-tasks.ts` defines the available labels, label-level objective/judgment/mixed classification, positive and negative examples, edge cases, uncertainty options, note requirements, and escalation rule. Detailed human guidance lives under `docs/review/`.

## Sampling

The deterministic sampling target and actual task counts are:

| Task                     | Required minimum | Corpus v1 |
| ------------------------ | ---------------: | --------: |
| Source normalization     |               40 |        45 |
| Entity resolution        |               50 |        60 |
| Event boundaries         |               40 |        45 |
| Story Cluster membership |               40 |        45 |
| Claim evidence           |               50 |        55 |
| Agreement/disagreement   |               30 |        35 |
| Sector coverage          |               25 |        30 |
| Review routing           |               25 |        30 |

Adversarial minima cover ordinary-language ticker traps, duplicate/syndication, article versions, metadata-limited evidence, podcasts, quantitative claims, apparent disagreement, and evolving or corrected events. The plan also spans source categories, evidence depths, content types, sectors, subindustries, macro topics, entity types, language status, time sensitivity, and primary/secondary roles. Company-specific sampling caps any one issuer at 15%; the v1 generator distributes sector items across ten public issuers.

The builder combines references to existing repository fixtures with project-owned synthetic edge cases, metadata-only representations, and short synthetic excerpts. It does not fetch content or include premium full articles.

## Partitioning and leakage control

The target is 60% training/development, 20% calibration, and 20% held-out evaluation. Assignment is deterministic and stratified by task while grouping on event or underlying work. Article versions, syndicated copies, same-event records, and near-duplicate packages share a group and therefore cannot cross partitions. Reports include counts, task balance, group count, deterministic seed, and leaking-group count.

Training/development supports rule design. The calibration partition selects candidate thresholds. Held-out labels are not used for threshold selection and control adoption. A held-out failure remains in the corpus.

## Review, adjudication, and promotion

Every gold candidate needs at least two independent initial reviews; adversarial cases require three. Disagreement, low confidence, cannot-determine, critical rules, high-risk labels, post-submission system disagreement, and amendments route to adjudication. Critical factual and provenance decisions are not simple-majority votes.

Regression promotion is separate from gold finalization. An example must have a finalized gold label, resolved adjudication, complete provenance, permitted fixture use, stable deterministic evidence, an important edge case or prior failure, expected outputs, and a named rule or bug protected. The entire corpus is not copied into ordinary unit tests.

## Versioning, exclusions, and audits

A corpus version records its parent, annotation-contract version, item IDs, state, change summary, and checksum. Corrections create amendments; old labels and reviewer disagreement remain visible. Items may be excluded only for recorded scope, rights, corruption, or duplicate-identity reasons. Difficulty and metric impact are never exclusion reasons.

Generated reports preserve the corpus checksum, sampling manifest, review counts, adjudication state, partition seed, calibration version, old and proposed thresholds, approval state, replay gates, and promotion decisions.

## Gate before a live-source pilot

A bounded pilot remains blocked until:

- required human review and adjudication are complete for the acceptance set;
- objective binary raw agreement is at least 0.85 and core categorical Cohen’s kappa is at least 0.70 where mathematically applicable;
- no critical gold label has fewer than two independent reviews;
- every disagreement is adjudicated or explicitly unresolved;
- partition leakage is zero;
- calibration uses no held-out labels;
- unsupported visible claims, podcast-metadata factual evidence, syndicated inflation, accepted ambiguous-ticker false positives, claims without provenance, quarantine leakage, unexplained record loss, and false company-to-sector-wide promotion are all zero in critical held-out fixtures;
- every gold label is versioned and every correction is amended;
- source terms, capabilities, costs, credentials, dry-run adapter, smoke-test authority, and reconciliation pass the separate source-onboarding gate.

Until then, everything remains offline.

## Blind multi-agent calibration pilot

Independent multi-human review of `gold-corpus-v1` is unavailable in this phase. A bounded 52-item pilot, deterministically stratified-selected from the existing 345-item corpus, is reviewed by blinded isolated agent panels instead — see [BLIND_MULTI_AGENT_REVIEW](BLIND_MULTI_AGENT_REVIEW.md). The resulting `agent-calibration-v1` labels are provisional, never described as independent human review, and never overwrite `calibration-v1`, `owner-calibration-v1`, or any human-gold label recorded above.
