import {
  ProvenanceGraphSchema,
  type ProvenanceEdge,
  type ProvenanceGraph,
  type ProvenanceNode,
} from "../schemas/provenance-graph";

export function buildProvenanceGraph(input: {
  graphId: string;
  nodes: ProvenanceNode[];
  edges: ProvenanceEdge[];
  visibleClaimIds: string[];
  visibleSectorBriefStatementIds?: string[];
  rulesVersion?: string;
}): ProvenanceGraph {
  return ProvenanceGraphSchema.parse({
    graphId: input.graphId,
    nodes: input.nodes,
    edges: input.edges,
    visibleClaimIds: input.visibleClaimIds,
    visibleSectorBriefStatementIds: input.visibleSectorBriefStatementIds ?? [],
    rulesVersion: input.rulesVersion ?? "normalization-v1",
  });
}

export function findProvenancePath(
  graph: ProvenanceGraph,
  fromNodeId: string,
  targetType: ProvenanceNode["nodeType"],
): string[] | undefined {
  const nodeById = new Map(graph.nodes.map((node) => [node.nodeId, node]));
  const outbound = new Map<string, string[]>();
  for (const edge of graph.edges)
    outbound.set(edge.fromNodeId, [...(outbound.get(edge.fromNodeId) ?? []), edge.toNodeId]);
  const queue: Array<{ id: string; path: string[] }> = [{ id: fromNodeId, path: [fromNodeId] }];
  const visited = new Set<string>();
  while (queue.length) {
    const current = queue.shift();
    if (!current || visited.has(current.id)) continue;
    visited.add(current.id);
    if (nodeById.get(current.id)?.nodeType === targetType) return current.path;
    for (const next of outbound.get(current.id) ?? [])
      queue.push({ id: next, path: [...current.path, next] });
  }
  return undefined;
}
