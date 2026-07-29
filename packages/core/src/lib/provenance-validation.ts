import type { ProvenanceGraph } from "../schemas/provenance-graph";

export interface ProvenanceValidationResult {
  valid: boolean;
  missingNodes: string[];
  brokenReferences: string[];
  cycles: string[];
  orphanedAcceptedClaims: string[];
  orphanedVisibleStatements: string[];
  quarantinedEvidenceViolations: string[];
  syndicatedIndependenceViolations: string[];
  missingRulesVersion: string[];
}

export function validateProvenanceGraph(graph: ProvenanceGraph): ProvenanceValidationResult {
  const nodeById = new Map(graph.nodes.map((node) => [node.nodeId, node]));
  const missingNodes: string[] = [];
  const brokenReferences: string[] = [];
  const quarantinedEvidenceViolations: string[] = [];
  const syndicatedIndependenceViolations: string[] = [];
  const missingRulesVersion = graph.nodes
    .filter((node) => !node.rulesVersion)
    .map((node) => node.nodeId);
  const inbound = new Map<string, string[]>();
  const outbound = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (!nodeById.has(edge.fromNodeId)) missingNodes.push(edge.fromNodeId);
    if (!nodeById.has(edge.toNodeId)) missingNodes.push(edge.toNodeId);
    if (!nodeById.has(edge.fromNodeId) || !nodeById.has(edge.toNodeId))
      brokenReferences.push(edge.edgeId);
    inbound.set(edge.toNodeId, [...(inbound.get(edge.toNodeId) ?? []), edge.fromNodeId]);
    outbound.set(edge.fromNodeId, [...(outbound.get(edge.fromNodeId) ?? []), edge.toNodeId]);
    const source = nodeById.get(edge.fromNodeId);
    const target = nodeById.get(edge.toNodeId);
    if (source?.reviewStatus === "quarantined" && target?.reviewStatus === "accepted")
      quarantinedEvidenceViolations.push(edge.edgeId);
    if (
      edge.independentContribution &&
      edge.relationship === "underlying_work_to_claim_evidence" &&
      source?.nodeId.includes("syndicated")
    )
      syndicatedIndependenceViolations.push(edge.edgeId);
  }
  const hasRawAncestor = (id: string, visited = new Set<string>()): boolean => {
    if (visited.has(id)) return false;
    if (!nodeById.has(id)) return false;
    visited.add(id);
    if (nodeById.get(id)?.nodeType === "raw_record") return true;
    return (inbound.get(id) ?? []).some((parent) => hasRawAncestor(parent, new Set(visited)));
  };
  const orphanedAcceptedClaims = graph.nodes
    .filter(
      (node) =>
        node.nodeType === "claim" &&
        node.reviewStatus === "accepted" &&
        !hasRawAncestor(node.nodeId),
    )
    .map((node) => node.nodeId);
  const orphanedVisibleStatements = [
    ...graph.visibleClaimIds,
    ...graph.visibleSectorBriefStatementIds,
  ].filter((id) => !nodeById.has(id) || !hasRawAncestor(id));
  const cycles: string[] = [];
  const visit = (id: string, path: string[]) => {
    if (path.includes(id)) {
      cycles.push([...path, id].join(" -> "));
      return;
    }
    for (const next of outbound.get(id) ?? []) visit(next, [...path, id]);
  };
  for (const node of graph.nodes) visit(node.nodeId, []);
  const result = {
    missingNodes: [...new Set(missingNodes)],
    brokenReferences,
    cycles: [...new Set(cycles)],
    orphanedAcceptedClaims,
    orphanedVisibleStatements,
    quarantinedEvidenceViolations,
    syndicatedIndependenceViolations,
    missingRulesVersion,
  };
  return { valid: Object.values(result).every((items) => items.length === 0), ...result };
}
