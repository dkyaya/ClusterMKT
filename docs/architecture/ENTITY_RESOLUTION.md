# Entity resolution

Entity resolution is a two-step deterministic process: configured exact aliases generate candidates, then contextual rules accept, reject, or route each candidate for review. A candidate is never an accepted mention by default.

The alias registry covers a bounded fixture set of public companies, securities, the project-owned semiconductor taxonomy, macro topics, institutions, and indicators. It supports canonical names, case-sensitive forms, ticker symbols, products, subsidiaries, executives, negative contexts, required co-occurrence, forbidden contexts, and effective dates. Duplicate aliases across entities are detected for explicit adjudication.

Ticker-like words require exact case and financial or entity-specific context. `ON`, `AI`, `CAT`, `NOW`, and `META` cannot pass merely because they appear in uppercase; ordinary-language defenses also cover `IT`, `ALL`, `ARE`, `A`, `C`, `F`, `T`, `LIFE`, `LOVE`, `OPEN`, `REAL`, `FAST`, `RACE`, `RUN`, `PLAY`, `WORK`, `GOOD`, and `BEST`. URL slugs and untrusted publisher tags create review candidates only.

Accepted decisions retain the matched alias, source field, character span where available, direct or inferred status, confidence, explanation codes, review status, and supporting raw fields. Private-market entities and fuzzy or embedding-based matching are absent.

Story Cluster membership and claims consume accepted mentions only. An unresolved candidate cannot silently become a subject entity: it routes the cluster for review or rejection and remains visible in the decision trace.
