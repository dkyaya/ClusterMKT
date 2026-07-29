export function reportRun(input: {
  runId: string;
  sourceCount: number;
  rawCount: number;
  normalizedCount: number;
  acceptedClusterCount: number;
  sectorBriefCount: number;
  reconciled: boolean;
}) {
  return {
    ...input,
    mode: "offline-fixture-only",
    liveNetworkCalls: 0,
    credentialsConfigured: false,
  };
}
