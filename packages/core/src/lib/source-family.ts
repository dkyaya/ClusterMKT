import type { RawSourceRecord } from "../schemas/raw-source-record";

export interface SourceFamilyResolution {
  sourceFamilyId: string;
  explanationCodes: string[];
  reviewRequired: boolean;
}

export function resolveSourceFamily(record: RawSourceRecord): SourceFamilyResolution {
  if (record.sourceFamilyId) {
    return {
      sourceFamilyId: record.sourceFamilyId,
      explanationCodes: ["SOURCE_FAMILY_EXPLICIT"],
      reviewRequired: false,
    };
  }
  return {
    sourceFamilyId: `family-${record.sourceRegistryId}`,
    explanationCodes: ["SOURCE_FAMILY_DERIVED_FROM_REGISTRY"],
    reviewRequired: true,
  };
}
