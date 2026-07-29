import { buildIdempotencyKey } from "@cluster-mkt/core";
export function processSectorBriefs(input: {
  sectorId: string;
  marketDate: string;
  edition: string;
  acceptedClusterIds: readonly string[];
}) {
  if (!input.acceptedClusterIds.length) return [];
  return [
    {
      id: `sector-brief-${buildIdempotencyKey("sector_brief", [input.sectorId, input.marketDate, input.edition]).slice(0, 12)}`,
      clusterIds: [...input.acceptedClusterIds],
    },
  ];
}
