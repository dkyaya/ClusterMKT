import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import {
  AdapterCapabilitySchema,
  AdapterOutputSchema,
  RawSourceRecordSchema,
  stableFingerprint,
  type AdapterCapability,
  type AdapterInput,
  type AdapterOutput,
  type FixtureAdapter,
  type RetrievalMethod,
} from "@cluster-mkt/core";

export function createLocalFixtureAdapter(config: {
  adapterId: string;
  sourceId: string;
  retrievalMethod: RetrievalMethod;
  contentTypes: AdapterCapability["supportedContentTypes"];
  fixtureRelativePath: string;
}): FixtureAdapter {
  const capability = AdapterCapabilitySchema.parse({
    adapterId: config.adapterId,
    sourceId: config.sourceId,
    adapterVersion: "mock-adapter-v1",
    retrievalMethod: config.retrievalMethod,
    supportedContentTypes: config.contentTypes,
    fixtureOnly: true,
  });
  return {
    capability,
    async retrieve(input: AdapterInput): Promise<AdapterOutput> {
      const fixtureRoot = resolve(process.cwd(), "tests/fixtures/ingestion");
      const fixturePath = resolve(fixtureRoot, config.fixtureRelativePath);
      if (!fixturePath.startsWith(`${fixtureRoot}${sep}`))
        throw new Error("FIXTURE_PATH_OUTSIDE_INGESTION_ROOT");
      const payload: unknown = JSON.parse(await readFile(fixturePath, "utf8"));
      const records = Array.isArray(payload)
        ? payload.map((record) => RawSourceRecordSchema.parse(record))
        : [];
      const limited = records.slice(0, input.maximumItemCount);
      return AdapterOutputSchema.parse({
        adapterId: config.adapterId,
        sourceId: config.sourceId,
        adapterVersion: capability.adapterVersion,
        retrievalMethod: config.retrievalMethod,
        resultRecords: limited,
        nextCursor: null,
        nextCheckpoint: `${config.adapterId}:${limited.length}`,
        exhausted: true,
        rateLimitState: "not_applicable",
        retryAfterSeconds: null,
        warnings: [],
        errors: [],
        retrievalProvenanceId: `retrieval-${stableFingerprint([input.ingestionRunId, config.adapterId, input.fixtureId]).slice(0, 16)}`,
        fixtureVersion: "ingestion-fixtures-v1",
      });
    },
  };
}
