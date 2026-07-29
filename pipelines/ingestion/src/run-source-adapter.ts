import { executeFixtureAdapter, type AdapterInput, type FixtureAdapter } from "@cluster-mkt/core";
export async function runSourceAdapter(adapter: FixtureAdapter, input: AdapterInput) {
  return executeFixtureAdapter(adapter, input);
}
