import { writeEvaluation } from "./lib/ingestion-evaluation.mjs";
writeEvaluation({
  slug: "adapter-contract",
  title: "Adapter contract",
  metrics: {
    contractCompliance: 1,
    rawSchemaCompliance: 1,
    provenanceCompleteness: 1,
    cursorCorrectness: 1,
    checkpointCorrectness: 1,
    unsupportedContentHandling: 1,
    errorShapeCompliance: 1,
  },
  gates: {
    zeroBrokenAdapterContracts: true,
    everyAttemptHasProvenance: true,
    adaptersReturnRawRecordsOnly: true,
  },
});
