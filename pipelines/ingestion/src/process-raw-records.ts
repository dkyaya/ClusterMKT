import { RawSourceRecordSchema } from "@cluster-mkt/core";
export function processRawRecords(records: readonly unknown[]) {
  return records.map((record) => RawSourceRecordSchema.safeParse(record));
}
