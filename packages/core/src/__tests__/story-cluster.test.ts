import { describe, expect, it } from "vitest";
import { StoryClusterSchema } from "../schemas/story-cluster";

const article = {
  kind: "article",
  id: "source-filing",
  publisher: { id: "publisher-ir", name: "Demonstration issuer IR" },
  title: "Demonstration filing update",
  publishedAt: "2026-07-28T12:00:00.000Z",
  accessType: "public",
  evidenceRole: "primary",
  evidenceDepth: "full-text",
  relevance: "high",
  whyIncluded: "Primary demonstration record for the event.",
  usedInOverview: true,
};

const podcast = {
  kind: "podcast",
  id: "source-podcast",
  publisher: { id: "publisher-audio", name: "Demonstration Audio" },
  title: "Context Desk",
  episodeTitle: "A related industry conversation",
  publishedAt: "2026-07-28T13:00:00.000Z",
  accessType: "public",
  evidenceRole: "related",
  evidenceDepth: "metadata-only",
  relevance: "context",
  whyIncluded: "Related listening; not evidence for the overview.",
  usedInOverview: false,
  transcriptReviewed: false,
  relatedListeningOnly: true,
  contributedEvidence: false,
};

const validCluster = {
  id: "cluster-demo-infrastructure",
  title: "Infrastructure planning enters a new review phase",
  shortOverview: "A fictional demonstration cluster showing evidence structure.",
  whyItMatters: "The review illustrates how timing and capacity questions can be organized.",
  stocks: ["Northstar Systems"],
  sectors: ["Industrials"],
  themes: ["Infrastructure"],
  firstDetectedAt: "2026-07-28T12:00:00.000Z",
  lastUpdatedAt: "2026-07-28T13:00:00.000Z",
  relevance: "high",
  sourceCount: 2,
  primarySourceCount: 1,
  sections: [
    {
      key: "what-happened",
      title: "What happened",
      body: "A fictional review milestone was published.",
      evidenceSourceIds: ["source-filing"],
    },
  ],
  agreementPoints: ["The review remains incomplete."],
  competingArguments: [
    {
      id: "argument-timing",
      label: "Timing",
      summary: "The schedule may change.",
      sourceIds: ["source-filing"],
    },
  ],
  uncertainty: [
    {
      id: "uncertainty-date",
      summary: "No final date exists.",
      evidenceNeeded: "A final published schedule.",
    },
  ],
  whatWouldChangeThePicture: ["A final published schedule."],
  readSources: [article],
  listenSources: [podcast],
};

describe("StoryClusterSchema", () => {
  it("parses a valid cluster and preserves evidence-use flags", () => {
    const parsed = StoryClusterSchema.parse(validCluster);
    expect(parsed.readSources[0]?.usedInOverview).toBe(true);
    expect(parsed.listenSources[0]?.usedInOverview).toBe(false);
  });

  it("rejects invalid source evidence", () => {
    expect(() => StoryClusterSchema.parse({ ...validCluster, sourceCount: 99 })).toThrow();
  });

  it("rejects podcast evidence without a reviewed transcript", () => {
    const invalidPodcast = { ...podcast, contributedEvidence: true, relatedListeningOnly: false };
    expect(() =>
      StoryClusterSchema.parse({ ...validCluster, listenSources: [invalidPodcast] }),
    ).toThrow();
  });
});
