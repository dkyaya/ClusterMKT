import type { AgentReviewDecision } from "../schemas/agent-review-decision";

function jaccard(a: readonly string[], b: readonly string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = [...setA].filter((value) => setB.has(value)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 1 : intersection / union;
}

function averagePairwiseOverlap(
  decisions: readonly AgentReviewDecision[],
  field: "evidenceReferences" | "explanationCodes",
): number {
  if (decisions.length < 2) return decisions.length === 1 ? 1 : 0;
  let total = 0;
  let pairs = 0;
  for (let left = 0; left < decisions.length; left += 1) {
    for (let right = left + 1; right < decisions.length; right += 1) {
      total += jaccard(decisions[left]![field], decisions[right]![field]);
      pairs += 1;
    }
  }
  return pairs === 0 ? 0 : total / pairs;
}

export function evidenceOverlapRate(decisions: readonly AgentReviewDecision[]): number {
  return averagePairwiseOverlap(decisions, "evidenceReferences");
}

export function explanationCodeOverlapRate(decisions: readonly AgentReviewDecision[]): number {
  return averagePairwiseOverlap(decisions, "explanationCodes");
}
