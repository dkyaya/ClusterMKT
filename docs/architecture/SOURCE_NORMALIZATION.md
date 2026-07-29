# Source normalization

Cluster MKT treats every raw source record as untrusted, preserved input. The offline `normalization-v1` pipeline validates records, derives comparison text, normalizes URLs through configured rules, resolves source families, evaluates duplicates and syndication, links article versions, adjudicates entity candidates, constructs event signatures, and emits a stage-by-stage decision log. It never overwrites source evidence or silently drops rejected records.

## URL policy

URL normalization is deterministic and makes no network request. It lowercases schemes and hosts, removes default ports and fragments, sorts query parameters, removes configured tracking parameters, preserves significant and unknown parameters, and collapses mobile, print, or AMP forms only for configured fixture hosts. Unknown parameters are preserved and route the record to review; malformed URLs are quarantined.

## Evidence depth and provenance

Full text is optional. Headline-only, abstract, full-text, and reviewed-transcript records remain distinguishable. Metadata-only podcasts and inaccessible paywalled headlines cannot become detailed factual evidence. Every normalized record names its contributing raw IDs, payload reference, rules version, explanation codes, confidence level, and review status.

## Identity layers

Publisher, source family, distribution platform, syndication family, and underlying work are separate concepts. Syndicated copies count as one source family, while independent reporting on the same event remains independent. Updated headlines or corrected facts can form new versions of one underlying work; follow-up analysis remains a distinct work.

This is an offline fixture foundation. Redirect resolution, live collection, publisher APIs, persistence, and AI inference are not implemented.
