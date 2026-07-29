import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildProvenanceGraph,
  findProvenancePath,
  validateProvenanceGraph,
} from "../../packages/core/src/index";
import { describe, expect, it } from "vitest";
import { rulesVersion } from "../helpers/claim-fixtures";

const fixtures = JSON.parse(
  readFileSync(resolve(process.cwd(), "tests/fixtures/provenance/provenance-cases.json"), "utf8"),
) as Array<Record<string, unknown>>;

const completeGraph = () =>
  buildProvenanceGraph({
    graphId: "graph-complete",
    rulesVersion,
    visibleClaimIds: ["claim-one"],
    visibleSectorBriefStatementIds: ["brief-one"],
    nodes: [
      ["raw-one", "raw_record"],
      ["normalized-one", "normalized_record"],
      ["work-one", "underlying_work"],
      ["evidence-one", "claim_evidence"],
      ["claim-one", "claim"],
      ["cluster-one", "story_cluster"],
      ["brief-one", "sector_brief"],
    ].map(([nodeId, nodeType]) => ({
      nodeId,
      nodeType: nodeType as "raw_record",
      reviewStatus: "accepted" as const,
      rulesVersion,
    })),
    edges: [
      ["edge-1", "raw-one", "normalized-one", "raw_record_to_normalized_record"],
      ["edge-2", "normalized-one", "work-one", "normalized_record_to_underlying_work"],
      ["edge-3", "work-one", "evidence-one", "underlying_work_to_claim_evidence"],
      ["edge-4", "evidence-one", "claim-one", "claim_evidence_to_claim"],
      ["edge-5", "claim-one", "cluster-one", "claim_to_story_cluster"],
      ["edge-6", "cluster-one", "brief-one", "story_cluster_to_sector_brief"],
    ].map(([edgeId, fromNodeId, toNodeId, relationship]) => ({
      edgeId,
      fromNodeId,
      toNodeId,
      relationship: relationship as "raw_record_to_normalized_record",
      rulesVersion,
    })),
  });

describe("claim-level provenance graph", () => {
  it("keeps all seven provenance fixtures machine-auditable", () => {
    expect(fixtures).toHaveLength(7);
    for (const fixture of fixtures)
      expect(fixture).toMatchObject({
        expectedProvenancePaths: expect.any(Array),
        expectedEvidenceLinks: expect.any(Array),
        expectedExplanationCodes: expect.any(Array),
      });
  });

  it("validates a complete raw-record-to-Sector-Brief path", () => {
    const graph = completeGraph();
    expect(validateProvenanceGraph(graph)).toMatchObject({
      valid: true,
      orphanedAcceptedClaims: [],
      orphanedVisibleStatements: [],
    });
    expect(findProvenancePath(graph, "raw-one", "sector_brief")).toEqual([
      "raw-one",
      "normalized-one",
      "work-one",
      "evidence-one",
      "claim-one",
      "cluster-one",
      "brief-one",
    ]);
  });

  it("reports broken references and orphaned accepted claims", () => {
    const graph = completeGraph();
    graph.nodes = graph.nodes.filter((node) => node.nodeId !== "normalized-one");
    const result = validateProvenanceGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.missingNodes).toContain("normalized-one");
    expect(result.orphanedAcceptedClaims).toContain("claim-one");
  });

  it("blocks quarantined evidence from supporting accepted claims", () => {
    const graph = completeGraph();
    graph.nodes = graph.nodes.map((node) =>
      node.nodeId === "evidence-one" ? { ...node, reviewStatus: "quarantined" as const } : node,
    );
    const result = validateProvenanceGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.quarantinedEvidenceViolations).toContain("edge-4");
  });

  it("detects cycles and syndicated independence inflation", () => {
    const graph = completeGraph();
    graph.nodes = graph.nodes.map((node) =>
      node.nodeId === "work-one" ? { ...node, nodeId: "syndicated-work-one" } : node,
    );
    graph.edges = graph.edges.map((edge) => ({
      ...edge,
      fromNodeId: edge.fromNodeId === "work-one" ? "syndicated-work-one" : edge.fromNodeId,
      toNodeId: edge.toNodeId === "work-one" ? "syndicated-work-one" : edge.toNodeId,
    }));
    const workEdge = graph.edges.find(
      (edge) => edge.relationship === "underlying_work_to_claim_evidence",
    );
    if (workEdge) workEdge.independentContribution = true;
    graph.edges.push({
      edgeId: "cycle-edge",
      fromNodeId: "brief-one",
      toNodeId: "claim-one",
      relationship: "story_cluster_to_sector_brief",
      rulesVersion,
    });
    const result = validateProvenanceGraph(graph);
    expect(result.valid).toBe(false);
    expect(result.cycles.length).toBeGreaterThan(0);
    expect(result.syndicatedIndependenceViolations).toContain("edge-3");
  });
});
