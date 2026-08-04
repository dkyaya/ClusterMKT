export const AGENT_REVIEWER_PSEUDONYMS = [
  "reviewer-alpha",
  "reviewer-bravo",
  "reviewer-charlie",
  "reviewer-delta",
  "reviewer-echo",
  "reviewer-foxtrot",
  "reviewer-golf",
] as const;

export type AgentReviewerPseudonym = (typeof AGENT_REVIEWER_PSEUDONYMS)[number];

export interface WorkerIsolationRecord {
  workerId: AgentReviewerPseudonym | "adjudicator-isolated";
  outputPath: string;
  sharedContextWithOtherWorkers: false;
  sawPipelinePrediction: false;
  sawPeerDecisions: false;
  sawPriorAnswerForItem: false;
}

export function workerOutputPath(workerId: string): string {
  return `.tmp/agent-review-pilot/workers/${workerId}/`;
}

export function buildWorkerIsolationRecord(
  workerId: WorkerIsolationRecord["workerId"],
): WorkerIsolationRecord {
  return {
    workerId,
    outputPath: workerOutputPath(workerId),
    sharedContextWithOtherWorkers: false,
    sawPipelinePrediction: false,
    sawPeerDecisions: false,
    sawPriorAnswerForItem: false,
  };
}
