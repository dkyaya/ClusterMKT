import type { Claim } from "../schemas/claim";

export function comparedClaimFields(
  left: Claim,
  right: Claim,
): {
  same: string[];
  different: string[];
} {
  const same: string[] = [];
  const different: string[] = [];
  const fields = ["predicate", "object", "timeScope", "geography", "direction"] as const;
  for (const field of fields) {
    if ((left[field] ?? "") === (right[field] ?? "")) same.push(field);
    else different.push(field);
  }
  if (left.subjectEntityIds.some((id) => right.subjectEntityIds.includes(id)))
    same.push("subjectEntityIds");
  else different.push("subjectEntityIds");
  return { same, different };
}
