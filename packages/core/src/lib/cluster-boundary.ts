import type { EventSignature } from "../schemas/event-signature";
import { compareClusterEvents } from "./cluster-similarity";

export function explainClusterBoundary(seed: EventSignature, candidate: EventSignature): string {
  const comparison = compareClusterEvents(seed, candidate);
  if (comparison.compatible) {
    return `Compatible event boundary based on ${comparison.supportingFields.join(", ")}.`;
  }
  if (comparison.conflictingFields.length > 0) {
    return `Separate or review because ${comparison.conflictingFields.join(", ")} conflict.`;
  }
  return "Related entity context is insufficient to establish one event.";
}
