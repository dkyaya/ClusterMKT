# Product foundation

## Mission and problem

Retail investors face an information-asymmetry problem: relevant market information is fragmented across filings, investor-relations pages, news publishers, public feeds, and podcasts. Speed alone does not solve the problem; readers also need source context, provenance, competing interpretations, and an honest account of uncertainty.

Cluster MKT is a market-information hub for retail investors. It organizes evidence so people can understand what may influence an investment decision more clearly and quickly. Human judgment remains central. Cluster MKT does not provide investment advice or make investment decisions.

Product promise: Cluster MKT™ does not tell investors what to buy. It provides a clearer, faster way to understand the information that may influence their investment decisions.

## Story Clusters

A Story Cluster is the core product unit. It groups materially related sources without erasing provenance or disagreement. A cluster separates verified facts, interpretation, competing arguments, agreement, uncertainty, and evidence that could change the picture.

Each cluster has three tabs:

- **Overview** summarizes the situation with traceable evidence and clear uncertainty.
- **Read** presents source cards, relevance context, and outbound links to original publishers.
- **Listen** presents permitted audio modules and related podcast cards.

Each source card should identify the publisher or primary source, content type, time, relevance score or label, and a concise “Why this is included” explanation. Full articles open through their original publishers. Sources used as summary evidence must be distinguishable from related reading or listening.

## Evidence and relevance

Primary and secondary sources retain their distinct roles. Material claims require traceable evidence. Competing interpretations should be represented proportionally to the available evidence; the product must avoid false balance.

Source relevance and clustering are safety-critical quality concerns. Relevance scores or labels must be interpretable, stress-tested, and paired with explanations. Unavailable content must never be presented as if the system read or heard it.

## Publishers and podcasts

The initial product does not link publisher accounts, bypass paywalls, or store publisher credentials, cookies, session tokens, or subscription data. It relies on public feeds, authorized metadata or abstracts, filings, investor-relations sources, and outbound publisher links.

Podcast embeds or cards may be attached through publisher metadata. Podcast content may influence a cluster summary only when an accessible and permitted transcript is available. Metadata-only matches must be labeled, and cards must disclose whether the episode was used as evidence.

## Editions and customization

The product supports Morning, Midday, and Closing editions. Editions adjust selected surfaces and accents without overriding the user’s light or dark appearance setting or radically recoloring the application.

The user customization hub is planned to cover stocks, sectors, ETFs, themes, and source preferences. Personalization should assemble relevant reusable modules; it must not turn the product into a recommendation engine.

## Written and audio modules

Cluster summaries and audio are planned as reusable modules that can be assembled into user-specific experiences. Kokoro is the initial direction for text-to-speech experimentation. Audio output must preserve provenance, provide explicit failure states, and never imply evidence beyond the written source record.

## Product boundary

Sector following is not constituent mirroring. It combines a shared sector/date/edition brief with genuinely sector-wide clusters, visibly company-led sector impacts, defensible macro-to-sector links, and only threshold-qualified company-specific context. Private-market coverage remains deferred.

The initial product will not generate automatic price predictions, buy/sell/hold signals, or price targets. Cluster MKT provides information organization rather than investment advice. The intended outcome is better-informed human judgment, not automated investment decisions.

## Source identity boundary

Raw source records are untrusted and remain preserved. Deterministic normalization creates versioned URLs, work and syndication relationships, accepted or review-required entity mentions, and event signatures without overwriting evidence. Syndicated copies never inflate confirmation, article updates remain linked, and metadata-only records retain limited evidence depth. Live ingestion and AI inference remain unimplemented.

## Claim and cluster boundary

Story Cluster membership is an explicit, reviewable event decision. Claims are separate from presentation text, and every visible factual statement retains a path to raw evidence. Evidence depth controls permitted use: headlines and metadata cannot support detailed summaries, while transcript-free podcast metadata remains related listening only. Agreement is adjusted for source independence; disagreement is represented only when propositions genuinely differ. Review-required candidates remain separate from accepted output, and Sector Briefs consume accepted eligible clusters rather than raw articles.

## Offline ingestion boundary

The operational source registry does not authorize live access. Current adapters load reviewed repository fixtures only and emit raw records with retrieval provenance. Deterministic edition runs are idempotent, bounded in retry, resumable from checkpoints, and fully reconciled. Quarantine, review, retry, and dead-letter states remain separate and cannot support accepted product output. No credential, network collector, database, production scheduler, or live-ready source exists.

## Calibration boundary

The initial gold corpus is a human-review workflow, not a generated answer key. Initial reviews are blinded, at least two independent people are required, disagreements remain visible and are adjudicated, and corrections append amendments. Thresholds use event-group-safe training, calibration, and held-out partitions. No API key or live source is authorized until critical held-out gates and formal source onboarding pass.

While independent multi-human review capacity is unavailable, blind multi-agent review supplements the same workflow: isolated agent reviewers label blinded evidence packets without seeing predictions, gold labels, or each other's answers, and disputed or high-risk cases route to isolated adjudication and, when warranted, owner review. Agent agreement is a reliability signal, not human inter-rater agreement, and provisional agent-panel labels can never substitute for the held-out human-gold gate above.
