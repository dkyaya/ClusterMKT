import type { EventSignature } from "../schemas/event-signature";

export function buildClusterTitle(event: EventSignature): string {
  const entity = event.primaryEntityIds.join(", ");
  const action = event.action.replaceAll("_", " ");
  const object = event.objectOfAction ? ` ${event.objectOfAction}` : "";
  return `${entity}: ${action}${object}`.replace(/\s+/gu, " ").trim();
}
