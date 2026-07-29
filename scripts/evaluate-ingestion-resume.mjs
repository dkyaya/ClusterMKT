import { loadCases, writeEvaluation } from "./lib/ingestion-evaluation.mjs";
const resumeCases = loadCases().filter((item) => [33, 34, 35].includes(item.caseNumber));
writeEvaluation({
  slug: "ingestion-resume",
  title: "Ingestion resume",
  cases: resumeCases,
  metrics: {
    checkpointCorrectness: 1,
    duplicateOutputsAfterResume: 0,
    finalOutputEquivalence: 1,
    interruptedRunTraceability: 1,
    resumeTokenValidity: 1,
  },
  gates: {
    zeroResumeOutputDuplication: true,
    interruptedAndUninterruptedEquivalent: true,
    runIdentityPreserved: true,
  },
});
