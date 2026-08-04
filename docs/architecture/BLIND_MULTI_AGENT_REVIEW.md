# Blind multi-agent calibration review

## Purpose and status

Independent multi-human review of `gold-corpus-v1` is unavailable in this phase. This document
describes the substitute used to keep calibration moving without pretending the substitute is
human review: a coordinator builds isolated, blinded evidence packets from existing corpus items
and assigns them to independent agent reviewer workers who cannot see pipeline predictions,
existing gold labels, each other's decisions, adjudication outcomes, consensus statistics,
coordinator preferences, or prior answers for the same item. See
[0019](../decisions/0019-blind-multi-agent-calibration.md),
[0020](../decisions/0020-agent-consensus-is-provisional.md), and
[0021](../decisions/0021-risk-based-owner-escalation.md) for the decisions this document
implements, and [AGENT_REVIEW_DISCLOSURE](../product/AGENT_REVIEW_DISCLOSURE.md) for the
public-facing framing.

Agent review supplements but does not equal independent human review. It produces provisional
labels in a separate corpus label family (`agent-calibration-v1`) that never overwrites
`calibration-v1`, `owner-calibration-v1`, or human-gold labels. The existing
[reviewer workflow](REVIEWER_WORKFLOW.md) remains the primary, unmodified path to final gold; this
system is additive.

## Coordinator and worker isolation

One coordinator process builds packets and assigns them to isolated worker contexts. Each worker
receives exactly one role-specific prompt and one blinded packet (or a bounded batch with no
cross-item answer keys) and has no memory of any other worker's context, no memory of prior runs
for the same item, and no access to the coordinator's expectations. Worker identity is pseudonymous
(`reviewer-alpha` through `reviewer-golf`); these are agents, never described as humans. Reviewer
outputs are immutable once submitted — a correction is a new record, never an overwrite. Worker
outputs are written to `.tmp/agent-review-pilot/workers/<worker-id>/`, isolated per worker.

Isolation here is content isolation plus explicit instruction, not a hard tool sandbox: the calling
mechanism (`Agent`/`Workflow`) does not expose a parameter to revoke a spawned subagent's tool
access. Packets never contain the internal `gold-item-XXXX` id, a repository file path, or any
other string that would let a worker locate hidden-prediction or gold-label data, and every worker
prompt instructs the agent not to read repository files. This boundary is recorded here rather than
asserted away; see `relays/tmp/blind-multi-agent-calibration-pilot/worker-capability-assessment.md`
in the originating relay for the assessment.

## Reviewer roles

Seven roles exist, each with a role ID, purpose, allowed/forbidden evidence, required checklist,
allowed labels, required explanation fields, confidence scale, escalation rules, and versioned
prompt/role identifiers (`packages/core/src/schemas/agent-reviewer-role.ts`,
`packages/config/src/calibration/agent-reviewer-roles.ts`):

| Role                              | Purpose                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `literal_evidence_reviewer`       | Choose the narrowest label directly supported by visible evidence.                                                                         |
| `source_provenance_reviewer`      | Evaluate source depth, independence, syndication, primary-source status, and provenance completeness.                                      |
| `adversarial_reviewer`            | Search for unsupported inferences, false merges, ticker collisions, hidden ambiguity, contradictory evidence, unsafe automatic acceptance. |
| `domain_context_reviewer`         | Evaluate finance, policy, filing, sector, event, and quantitative context without expanding beyond evidence.                               |
| `conservative_gatekeeper`         | Decide whether the item is safe for automatic acceptance or should route to review.                                                        |
| `quantitative_integrity_reviewer` | Review values, units, periods, denominators, revisions, rounding, incompatible quantities.                                                 |
| `event_boundary_reviewer`         | Review whether records concern the same event, an update, a correction, a related event, or a distinct event.                              |

## Blinded packets

A packet (`agent-review-packet.ts`) includes only: a blinded packet ID (an opaque hash, never the
internal item ID), task type, evidence package, reviewer instructions, allowed labels, a relevant
handbook excerpt, the required structured-response shape, permitted provenance fields, difficulty
class, risk class, and packet version. It excludes: expected/gold labels, pipeline predictions and
confidence, explanation codes, thresholds, other reviewers' decisions, prior adjudication,
consensus information, the unblinded item ID, fixture file names or paths that would reveal
expected outcomes, and any hidden answer key. `agent-review-validation.ts` fails a packet build if
any forbidden field is present. Every packet carries a SHA-256 hash so the coordinator can prove
every reviewer on a panel received byte-identical evidence.

## Panel composition

Panel size and required role combination are driven by an item's risk class
(`packages/config/src/calibration/agent-panel-policy.ts`,
`packages/core/src/lib/agent-panel-policy.ts`):

| Risk     | Panel size | Roles                                                        |
| -------- | ---------- | ------------------------------------------------------------ |
| Low      | 3          | literal_evidence, source_provenance, conservative_gatekeeper |
| Standard | 5          | + adversarial, domain_context                                |
| High     | 7          | + quantitative_integrity, event_boundary                     |

An item is classified high-risk when its sampling strata indicate a quantitative claim, an
ambiguous ticker, an event-boundary dispute, sector-wide promotion, a rumor or correction, a
metadata-limited or podcast-only evidence depth, or a syndication dispute. Everything else is
standard or low risk by difficulty class.

## Structured output and quarantine

Every reviewer decision (`agent-review-decision.ts`) records the packet ID and hash, role, reviewer
ID, selected label, plausible alternative, evidence references, supporting/conflicting fields,
missing evidence, explanation codes, confidence, automatic-acceptance and human-review
recommendations, dissent expectation, cannot-determine flag, prompt version, and submission
timestamp. `agent-review-validation.ts` rejects and quarantines malformed or free-form-only
submissions rather than accepting them.

## Aggregation and dissent

`agent-panel-aggregation.ts` and `inter-agent-agreement.ts` compute exact and majority label
agreement, unanimity, confidence distribution, evidence-reference and explanation-code overlap,
cannot-determine rate, automatic-acceptance agreement, human-review recommendation rate, and
role-specific disagreement. `agent-dissent-analysis.ts` flags high-confidence minority dissent.
Outcomes are one of: `agent_panel_unanimous`, `agent_panel_strong_consensus`,
`agent_panel_majority`, `agent_panel_split`, `agent_panel_disputed`, `agent_panel_insufficient`,
`agent_panel_invalid`. A simple majority is never sufficient for a high-risk case, and a disputed
panel is never mislabeled unanimous.

## Adjudication

Disputed, split, or otherwise routed panels go to a separate isolated adjudicator worker
(`agent-adjudication.ts`, `agent-adjudication-routing.ts`, `agent-adjudication-validation.ts`). The
adjudicator receives the original blinded packet, anonymized reviewer decisions, relevant handbook
sections, panel outcome, and dissent summary — never the pipeline prediction, expected fixture
label, gold label, reviewer identities, prior adjudication, or the coordinator's preferred answer.
Outcomes: `agent_adjudicated`, `agent_adjudicated_review_required`,
`agent_adjudicated_insufficient_evidence`, `agent_adjudicated_schema_issue`,
`agent_adjudicated_fixture_issue`, `agent_adjudicated_unresolved`. The coordinator cannot silently
override an adjudication.

## Owner escalation

`owner-escalation.ts` routes to a bounded owner-review queue (statuses: `not_required`,
`recommended`, `required_before_calibration`, `required_before_display`, `owner_confirmed`,
`owner_overridden`, `owner_deferred`) using the criteria in
[0021](../decisions/0021-risk-based-owner-escalation.md). The pilot produces a queue; it does not
pause execution waiting for owner input. The existing owner-review workflow
(`docs/architecture/REVIEWER_WORKFLOW.md`) remains available as an optional final confirmation
layer and is unmodified by this system.

## Provisional label promotion

Provisional labels (`provisional-benchmark-label.ts`, `provisional-benchmark-promotion.ts`) use
states `agent_panel_consensus`, `agent_panel_majority`, `agent_panel_disputed`,
`agent_adjudicated`, `owner_review_required`, `owner_confirmed`, `owner_overridden`, `unresolved`.
Promotion rules differ by risk: low-risk items may reach `agent_panel_consensus` on unanimity or
strong consensus with no critical dissent or provenance concern; standard-risk items require
adjudication whenever substantive dissent exists; high-risk items always require adjudication, no
unresolved critical dissent, and preserve owner-review eligibility. No agent-only outcome may be
described as independent human gold, and the label family `agent-calibration-v1` never overwrites
`calibration-v1`, `owner-calibration-v1`, or human-gold labels.

## Repeat-run stability

A subset of pilot items is re-run through a second isolated panel (fresh worker contexts, same
packet, different reviewer assignment IDs, no access to the first run) to measure
`inter_agent_repeat_stability` — label, consensus, confidence, evidence-reference, and
owner-escalation stability across runs. This is explicitly not human test-retest reliability.

## Developer surfaces

`/dev/agent-panels` and `/dev/agent-panels/:itemId` are direct-only developer views, absent from
consumer navigation, alongside the existing `/dev/review`, `/dev/review/:itemId`, and
`/dev/adjudication` pages. They label agents as agents, mark results provisional, hide reviewer
identity in adjudication display, and show packet hashes, prompt/role versions, dissent, and
repeat-run stability.

## What this system does not do

It does not connect a live source, obtain credentials, use a paid API, expand scope to private
markets, or introduce investment recommendations or price predictions. It does not claim external
expert validation. It does not silently promote a majority vote into a final label, and it does not
substitute for the held-out human-gold gate described in
[GOLD_CALIBRATION_CORPUS](GOLD_CALIBRATION_CORPUS.md) and
[THRESHOLD_CALIBRATION](THRESHOLD_CALIBRATION.md).
