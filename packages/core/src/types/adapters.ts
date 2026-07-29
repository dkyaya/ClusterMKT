import type { AdapterInput } from "../schemas/adapter-input";
import type { AdapterOutput } from "../schemas/adapter-output";
import type { AdapterCapability } from "../schemas/adapter-capability";

export interface FixtureAdapter {
  capability: AdapterCapability;
  retrieve(input: AdapterInput): Promise<AdapterOutput>;
}
