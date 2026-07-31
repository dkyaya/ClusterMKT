# Sector coverage review guide

## Question

Classify how an item relates to a public-market sector and whether evidence supports sector-feed inclusion. Sector following is not constituent mirroring. Issuer size, popularity, or coverage volume is not sector breadth.

## Labels

- `sector_wide`: evidence supports material breadth across the sector.
- `company_led_sector_impact`: a company-led event has demonstrated effects beyond that issuer.
- `macro_to_sector`: a macro event has a supported transmission mechanism to the sector.
- `company_specific`: evidence remains bounded to one issuer or direct counterparties.
- `sector_feed_include` or `sector_feed_exclude`: the item meets or fails feed relevance and quality rules.
- `materiality`: supported impact is consequential in the bounded sector context.
- `subindustry_impact`: breadth is supported within a named subindustry but not the entire sector.
- `anti_concentration_relevance`: the item adds defensible breadth rather than appearing only because a dominant issuer generates more coverage.

These labels are judgment-based or mixed. False `sector_wide` promotion is a critical error and precision is prioritized over recall.

## Evidence to consider

Assess affected activities, constituents, subindustries, supply and demand transmission, pricing, capacity, regulation, geography, time horizon, primary and independent support, and evidence depth. Count independent underlying works, not syndicated URLs.

## Positive, negative, and edge examples

- Positive sector-wide: a final regulation applies across several named semiconductor subindustries and the evidence supports material operational consequences.
- Positive company-led impact: one supplier’s disruption has documented effects on multiple independent issuers or activities; keep the company-led label visible.
- Positive macro-to-sector: a policy or rate event has an explicit, material mechanism specific to the sector.
- Negative sector-wide: a large constituent reports issuer-specific earnings with no propagation evidence.
- Negative inclusion: an item mentions the sector only through an unaccepted publisher tag.
- Edge: a macro event affects only one financing-sensitive subindustry; one issuer dominates all available evidence; a supply event affects direct counterparties but not the broader sector.

## Decision tree

```text
Is the evidence bounded to one issuer?
├─ Yes
│  ├─ Demonstrated material propagation beyond the issuer? → company_led_sector_impact
│  └─ No → company_specific
└─ No
   ├─ Sector-level action or multi-subindustry breadth? → sector_wide
   ├─ Supported macro transmission? → macro_to_sector
   ├─ Bounded breadth within one subindustry? → subindustry_impact
   └─ Insufficient breadth evidence? → review_required or sector_feed_exclude
```

Use `insufficient_evidence` when breadth or materiality fields are absent. Use `cannot_determine` when impact breadth is genuinely ambiguous. Escalate every proposed sector-wide label, company-led propagation claim with only one evidence family, anti-concentration concern, or case where a company-specific item could dominate a sector feed.
