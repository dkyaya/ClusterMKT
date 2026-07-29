import { normalizeRawSourceRecord, type NormalizationPipelineOptions } from "@cluster-mkt/core";
export function processNormalization(
  records: readonly unknown[],
  options: NormalizationPipelineOptions,
) {
  return records.map((record) => normalizeRawSourceRecord(record, options));
}
