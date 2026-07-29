import {
  AdapterCapabilitySchema,
  AdapterOutputSchema,
  type FixtureAdapter,
} from "@cluster-mkt/core";
import { createLocalFixtureAdapter } from "./local-fixture-adapter";

export const mockRssAdapter = createLocalFixtureAdapter({
  adapterId: "mock-rss",
  sourceId: "fixture-financial-news-rss",
  retrievalMethod: "fixture_rss",
  contentTypes: ["article"],
  fixtureRelativePath: "sources/mock-records.json",
});
export const mockApiAdapter = createLocalFixtureAdapter({
  adapterId: "mock-api",
  sourceId: "fixture-financial-news-api",
  retrievalMethod: "fixture_api",
  contentTypes: ["article"],
  fixtureRelativePath: "sources/mock-records.json",
});
export const mockFilingAdapter = createLocalFixtureAdapter({
  adapterId: "mock-filing",
  sourceId: "fixture-regulatory-filing",
  retrievalMethod: "fixture_filing",
  contentTypes: ["regulatory_filing"],
  fixtureRelativePath: "sources/mock-filing-records.json",
});
export const mockPodcastAdapter = createLocalFixtureAdapter({
  adapterId: "mock-podcast",
  sourceId: "fixture-podcast-rss",
  retrievalMethod: "fixture_podcast_rss",
  contentTypes: ["podcast_episode"],
  fixtureRelativePath: "sources/mock-podcast-records.json",
});
export const mockTranscriptAdapter = createLocalFixtureAdapter({
  adapterId: "mock-transcript",
  sourceId: "fixture-official-transcript",
  retrievalMethod: "fixture_transcript",
  contentTypes: ["podcast_transcript"],
  fixtureRelativePath: "sources/mock-transcript-records.json",
});
export const mockFailureAdapter: FixtureAdapter = {
  capability: AdapterCapabilitySchema.parse({
    adapterId: "mock-failure",
    sourceId: "fixture-financial-news-rss",
    adapterVersion: "mock-adapter-v1",
    retrievalMethod: "fixture_rss",
    supportedContentTypes: ["article"],
    fixtureOnly: true,
  }),
  retrieve() {
    return Promise.resolve(
      AdapterOutputSchema.parse({
        adapterId: "mock-failure",
        sourceId: "fixture-financial-news-rss",
        adapterVersion: "mock-adapter-v1",
        retrievalMethod: "fixture_rss",
        resultRecords: [],
        nextCursor: null,
        nextCheckpoint: null,
        exhausted: false,
        rateLimitState: "limited",
        retryAfterSeconds: 30,
        warnings: ["SIMULATED_RATE_LIMIT"],
        errors: [
          {
            errorId: "error-rate-limit",
            errorClass: "rate_limited",
            message: "Offline fixture rate limit",
            retryable: true,
            fixtureCode: "FIXTURE_429",
          },
        ],
        retrievalProvenanceId: "retrieval-failure-fixture",
        fixtureVersion: "ingestion-fixtures-v1",
      }),
    );
  },
};
