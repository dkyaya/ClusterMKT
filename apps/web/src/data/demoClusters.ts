import { StoryClusterSchema } from "@cluster-mkt/core";

const sharedPodcast = {
  kind: "podcast" as const,
  publisher: { id: "demo-audio-desk", name: "Demonstration Audio Desk" },
  title: "Context Desk",
  publishedAt: "2026-07-28T13:30:00.000Z",
  accessType: "public" as const,
  evidenceRole: "related" as const,
  evidenceDepth: "metadata-only" as const,
  relevance: "context" as const,
  usedInOverview: false,
  transcriptReviewed: false,
  relatedListeningOnly: true,
  contributedEvidence: false,
};

export const demoClusters = StoryClusterSchema.array().parse([
  {
    id: "cluster-grid-review",
    title: "Infrastructure review moves into its next public phase",
    shortOverview:
      "A fictional planning update illustrates how Cluster MKT separates primary records, interpretation, and related listening.",
    whyItMatters:
      "Review timing may shape capacity planning, but the available demonstration record does not establish a final schedule.",
    stocks: ["Northstar Systems"],
    sectors: ["Industrials", "Utilities"],
    themes: ["Infrastructure", "Grid capacity"],
    firstDetectedAt: "2026-07-28T12:00:00.000Z",
    lastUpdatedAt: "2026-07-28T13:30:00.000Z",
    relevance: "high",
    sourceCount: 3,
    independentSourceCount: 2,
    primarySourceCount: 1,
    claimIds: ["claim-grid-review-active", "claim-grid-schedule-unknown"],
    agreementGroupIds: ["agreement-grid-review-status"],
    disagreementGroupIds: ["disagreement-grid-timing-interpretation"],
    uncertaintyRecordIds: ["uncertainty-grid-final-timing"],
    claimProvenance: [
      {
        claimId: "claim-grid-review-active",
        evidenceSourceIds: ["grid-filing"],
        rawRecordIds: ["raw-grid-filing"],
        pathSummary: "Primary fixture record → accepted event fact → Story Cluster overview.",
      },
      {
        claimId: "claim-grid-schedule-unknown",
        evidenceSourceIds: ["grid-filing", "grid-analysis"],
        rawRecordIds: ["raw-grid-filing", "raw-grid-analysis"],
        pathSummary:
          "Primary record plus independent abstract → uncertainty → future evidence condition.",
      },
    ],
    reviewStatus: "accepted",
    eligibleForDisplay: true,
    eligibleForSectorBrief: true,
    rulesVersion: "normalization-v1",
    sections: [
      {
        key: "what-happened",
        title: "What happened",
        body: "A fictional issuer published a demonstration planning document and opened a review period.",
        evidenceSourceIds: ["grid-filing"],
      },
      {
        key: "why-it-matters",
        title: "Why it matters",
        body: "The next review could clarify timing, capacity, and stakeholder requirements without resolving them today.",
        evidenceSourceIds: ["grid-filing", "grid-analysis"],
      },
    ],
    agreementPoints: [
      "The review is active.",
      "A final implementation schedule has not been published.",
    ],
    competingArguments: [
      {
        id: "grid-fast",
        label: "Faster path",
        summary: "Some observers read the update as procedural progress.",
        sourceIds: ["grid-analysis"],
      },
      {
        id: "grid-caution",
        label: "Longer review",
        summary: "Others emphasize unresolved permitting and capacity questions.",
        sourceIds: ["grid-filing"],
      },
    ],
    uncertainty: [
      {
        id: "grid-date",
        summary: "The final timing remains unknown.",
        evidenceNeeded: "A final published schedule and approved capacity plan.",
      },
    ],
    whatWouldChangeThePicture: [
      "A final review decision",
      "A published implementation schedule",
      "New primary capacity documentation",
    ],
    readSources: [
      {
        kind: "article",
        id: "grid-filing",
        publisher: { id: "demo-ir", name: "Demonstration Issuer IR" },
        title: "Public planning review notice",
        publishedAt: "2026-07-28T12:00:00.000Z",
        accessType: "public",
        evidenceRole: "primary",
        evidenceDepth: "full-text",
        relevance: "high",
        whyIncluded:
          "The fictional primary record establishes the scope and status of the demonstration review.",
        usedInOverview: true,
        url: "https://example.com/",
      },
      {
        kind: "article",
        id: "grid-analysis",
        publisher: { id: "demo-journal", name: "Demonstration Market Journal" },
        title: "What the next review could clarify",
        publishedAt: "2026-07-28T13:00:00.000Z",
        accessType: "public",
        evidenceRole: "secondary",
        evidenceDepth: "authorized-abstract",
        relevance: "moderate",
        whyIncluded: "Provides a clearly labeled interpretation of unresolved timing questions.",
        usedInOverview: true,
      },
    ],
    listenSources: [
      {
        ...sharedPodcast,
        id: "grid-podcast",
        episodeTitle: "Planning for a changing grid",
        whyIncluded:
          "Related industry context only; no transcript was reviewed and it did not inform the overview.",
      },
    ],
  },
  {
    id: "cluster-supply-update",
    title: "Supply planning assumptions draw competing interpretations",
    shortOverview:
      "A second fictional cluster demonstrates source counts, uncertainty, and proportionate competing arguments without market predictions.",
    whyItMatters:
      "Planning assumptions can affect future operations, while the demonstration evidence leaves demand and execution unresolved.",
    stocks: ["Harbor Components"],
    sectors: ["Technology"],
    themes: ["Supply resilience"],
    firstDetectedAt: "2026-07-28T14:00:00.000Z",
    lastUpdatedAt: "2026-07-28T15:15:00.000Z",
    relevance: "moderate",
    sourceCount: 2,
    independentSourceCount: 1,
    primarySourceCount: 1,
    claimIds: ["claim-supply-planning-changed", "claim-supply-execution-unverified"],
    agreementGroupIds: ["agreement-supply-planning-change"],
    disagreementGroupIds: [],
    uncertaintyRecordIds: ["uncertainty-supply-execution"],
    claimProvenance: [
      {
        claimId: "claim-supply-planning-changed",
        evidenceSourceIds: ["supply-update"],
        rawRecordIds: ["raw-supply-update"],
        pathSummary: "Company fixture update → attributed company statement → Story Cluster.",
      },
      {
        claimId: "claim-supply-execution-unverified",
        evidenceSourceIds: ["supply-update"],
        rawRecordIds: ["raw-supply-update"],
        pathSummary: "Primary fixture limits → uncertainty → subsequent disclosure condition.",
      },
    ],
    reviewStatus: "accepted",
    eligibleForDisplay: true,
    eligibleForSectorBrief: false,
    rulesVersion: "normalization-v1",
    sections: [
      {
        key: "what-happened",
        title: "What happened",
        body: "A fictional operating update described changes to supplier planning assumptions.",
        evidenceSourceIds: ["supply-update"],
      },
      {
        key: "why-it-matters",
        title: "Why it matters",
        body: "The assumptions offer context for future operations but are not evidence of a completed outcome.",
        evidenceSourceIds: ["supply-update"],
      },
    ],
    agreementPoints: ["Supplier planning changed.", "Execution evidence is not yet available."],
    competingArguments: [
      {
        id: "supply-range",
        label: "Range of outcomes",
        summary: "The same planning change can support several operational interpretations.",
        sourceIds: ["supply-context"],
      },
    ],
    uncertainty: [
      {
        id: "supply-execution",
        summary: "Execution and demand remain unverified.",
        evidenceNeeded: "Subsequent primary operating disclosures.",
      },
    ],
    whatWouldChangeThePicture: [
      "Subsequent operating disclosure",
      "Verified supplier delivery evidence",
    ],
    readSources: [
      {
        kind: "article",
        id: "supply-update",
        publisher: { id: "demo-company", name: "Demonstration Company Updates" },
        title: "Supplier planning assumptions updated",
        publishedAt: "2026-07-28T14:00:00.000Z",
        accessType: "public",
        evidenceRole: "primary",
        evidenceDepth: "full-text",
        relevance: "high",
        whyIncluded:
          "The fictional primary update is the only direct evidence of the planning change.",
        usedInOverview: true,
      },
    ],
    listenSources: [
      {
        ...sharedPodcast,
        id: "supply-context",
        episodeTitle: "Resilient supply planning",
        whyIncluded: "Metadata suggests topical context, but no transcript was available or used.",
      },
    ],
  },
]);
