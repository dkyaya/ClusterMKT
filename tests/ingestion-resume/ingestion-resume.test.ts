import {
  createCheckpoint,
  createResumeToken,
  recoverFromInterruption,
  validateResumeToken,
} from "../../packages/core/src/index";
import { describe, expect, it } from "vitest";

const checkpoint = createCheckpoint({
  checkpointId: "checkpoint-normalized",
  runId: "run-resume",
  stage: "normalization",
  completedSourceIds: ["source-a"],
  completedRecordIds: ["raw-a"],
  cursorByAdapter: { "mock-rss": "page-2" },
  createdAt: "2026-07-29T12:07:00.000Z",
});
describe("interruption recovery", () => {
  it("creates and validates a stable resume token", () => {
    const token = createResumeToken(checkpoint, "2026-07-29T12:08:00.000Z", "ingestion-v1");
    expect(validateResumeToken(token, checkpoint)).toBe(true);
  });
  it("rejects a token for another checkpoint", () => {
    const token = createResumeToken(checkpoint, "2026-07-29T12:08:00.000Z", "ingestion-v1");
    expect(validateResumeToken(token, { ...checkpoint, checkpointId: "checkpoint-other" })).toBe(
      false,
    );
  });
  it("does not duplicate completed output", () =>
    expect(
      recoverFromInterruption({
        checkpoint,
        completedOutputs: [{ id: "cluster-a" }],
        proposedOutputs: [{ id: "cluster-a" }, { id: "cluster-b" }],
      }),
    ).toEqual([{ id: "cluster-a" }, { id: "cluster-b" }]));
  it("preserves the same run identity", () => expect(checkpoint.runId).toBe("run-resume"));
  it("retains the last safe cursor", () =>
    expect(checkpoint.cursorByAdapter["mock-rss"]).toBe("page-2"));
});
