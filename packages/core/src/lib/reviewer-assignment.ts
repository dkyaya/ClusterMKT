import type { AnnotationItem } from "../schemas/annotation-item";
import type { ReviewerAssignment, ReviewerRole } from "../schemas/reviewer-assignment";
import { stableFingerprint } from "./idempotency-key";

export function deterministicReviewerOrder(reviewerIds: readonly string[], seed: string): string[] {
  return [...new Set(reviewerIds)].sort((left, right) =>
    stableFingerprint([seed, left]).localeCompare(stableFingerprint([seed, right])),
  );
}

export function createReviewerAssignments(
  item: AnnotationItem,
  reviewerIds: readonly string[],
  assignedAt: string,
  seed = "gold-corpus-v1",
  role: ReviewerRole = "reviewer",
): ReviewerAssignment[] {
  const ordered = deterministicReviewerOrder(reviewerIds, `${seed}:${item.itemId}`);
  if (ordered.length < item.expectedReviewCount) {
    throw new Error("Gold candidates require enough distinct independent reviewers");
  }
  return ordered.slice(0, item.expectedReviewCount).map((reviewerId, index) => ({
    assignmentId: `assignment-${item.itemId.replace("gold-item-", "")}-${index + 1}`,
    itemId: item.itemId,
    task: item.task,
    reviewerId,
    reviewerRole: role,
    assignmentOrder: index + 1,
    predictionVisible: false,
    peerDecisionsVisible: false,
    adjudicationVisible: false,
    assignedAt,
    dueAt: null,
    status: "assigned",
  }));
}
