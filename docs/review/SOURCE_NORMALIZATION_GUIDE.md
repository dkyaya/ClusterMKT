# Source normalization review guide

## Question

Determine the relationship between source records as underlying works. Event similarity is not work identity. Review the configured URL evidence, source and work IDs, bylines, timestamps, checksums, explicit attribution, update notices, and permitted content fields.

## Labels

- `canonical_url_relationship`: fixture evidence establishes that URLs point to the same canonical resource.
- `exact_duplicate`: content is the same underlying work without a material revision.
- `format_variant`: print, mobile, AMP-like, or presentation variants preserve the same work.
- `syndicated_copy`: one record republishes or explicitly attributes another work.
- `independent_report`: evidence was independently produced even if it covers the same event.
- `article_update`: the publisher materially revised the same work.
- `new_underlying_work`: a distinct article, filing, release, or episode exists.
- `quarantine_eligible`: conflicting identity, malformed data, prohibited evidence, or unresolved integrity prevents safe normalization.

Canonical URL, exact publisher ID, and checksum identity are comparatively objective. Syndication, update-versus-new-work, and independence are mixed or judgment-based because attribution and material change must be interpreted.

## Positive, negative, and edge examples

- Positive duplicate: two URLs differ only by a configured campaign parameter, share a publisher work ID, and have identical permitted content.
- Positive syndication: a hosted copy names the originating newsroom and preserves its byline.
- Positive update: the publisher ID is stable, an update timestamp is explicit, and a corrected figure changes the work materially.
- Negative duplicate: independent publishers use similar headlines for the same event but have different bylines and no copying or attribution evidence.
- Negative update: the same publisher publishes a separate analysis after a primary report; topic continuity does not make it a version.
- Edge: canonical hints conflict, an unknown query parameter may select a materially different document, or an abstract changed without an update marker.

## Decision tree

```text
Is there explicit copying/attribution to an origin?
├─ Yes → syndicated_copy (then assess canonical/format relationship)
└─ No
   ├─ Same stable work ID and immaterial representation change? → exact_duplicate or format_variant
   ├─ Same stable work ID and material later revision? → article_update
   ├─ Independent creation evidence? → independent_report or new_underlying_work
   └─ Identity conflict cannot be resolved? → cannot_determine or quarantine_eligible
```

Use `insufficient_evidence` when the package lacks the fields needed to distinguish an update from a new work. Use `cannot_determine` when the visible fields conflict. Cite the specific IDs, URL components, timestamps, attribution, or spans. Escalate checksum collisions, conflicting canonical claims, uncertain syndication, and any classification that could inflate independent support.
