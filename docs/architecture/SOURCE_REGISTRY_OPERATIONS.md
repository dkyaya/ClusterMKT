# Source registry operations

The operational registry is a versioned, offline contract describing what Cluster MKT knows about a source. Registration is not authorization. Public visibility is not permission, and no current source is live-ready.

Each entry separates publisher and source-family identity; fixture content types and retrieval methods; metadata, abstract, full-text, podcast, and transcript capabilities; terms, technical, and legal review; frequency, retry, rate-limit, attribution, duplicate, syndication, canonical-URL, update, and tagging notes; and explicit fixture versus future-live eligibility. The schema rejects a live-ready state and rejects fixture retrieval when terms have not received a fixture-specific review status.

The v1 registry contains only invented generic fixtures. A prohibited scraper is retained as a negative control and can never be selected. Real publisher endpoints, credentials, permissions, and capability claims are absent.
