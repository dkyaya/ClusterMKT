export const retrievalPolicies = {
  "fixture-rss-policy": {
    retrievalMethod: "fixture_rss",
    adapterId: "mock-rss",
    localFixturesOnly: true,
  },
  "fixture-api-policy": {
    retrievalMethod: "fixture_api",
    adapterId: "mock-api",
    localFixturesOnly: true,
  },
  "fixture-filing-policy": {
    retrievalMethod: "fixture_filing",
    adapterId: "mock-filing",
    localFixturesOnly: true,
  },
  "fixture-podcast-policy": {
    retrievalMethod: "fixture_podcast_rss",
    adapterId: "mock-podcast",
    localFixturesOnly: true,
  },
  "fixture-transcript-policy": {
    retrievalMethod: "fixture_transcript",
    adapterId: "mock-transcript",
    localFixturesOnly: true,
  },
} as const;
