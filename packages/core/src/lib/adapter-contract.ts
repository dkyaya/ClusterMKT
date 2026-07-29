import { AdapterInputSchema, type AdapterInput } from "../schemas/adapter-input";
import { AdapterOutputSchema, type AdapterOutput } from "../schemas/adapter-output";
import type { FixtureAdapter } from "../types/adapters";

export function validateAdapterInput(input: unknown): AdapterInput {
  return AdapterInputSchema.parse(input);
}

export function validateAdapterOutput(output: unknown): AdapterOutput {
  return AdapterOutputSchema.parse(output);
}

export async function executeFixtureAdapter(
  adapter: FixtureAdapter,
  input: unknown,
): Promise<AdapterOutput> {
  const parsedInput = validateAdapterInput(input);
  if (!adapter.capability.fixtureOnly || !parsedInput.dryRun) {
    throw new Error("ADAPTER_LIVE_MODE_REFUSED");
  }
  const output = validateAdapterOutput(await adapter.retrieve(parsedInput));
  if (
    output.adapterId !== adapter.capability.adapterId ||
    output.sourceId !== adapter.capability.sourceId
  ) {
    throw new Error("ADAPTER_IDENTITY_MISMATCH");
  }
  return output;
}
