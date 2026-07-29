import type { MarketEdition } from "../schemas/edition";
import type { ScheduledIngestionSlot } from "../schemas/scheduled-ingestion-slot";
import { buildIdempotencyKey } from "./idempotency-key";

const editionTime: Record<MarketEdition, string> = {
  morning: "06:07:00",
  midday: "12:07:00",
  closing: "18:07:00",
};

export function createScheduledSlot(input: {
  marketDate: string;
  edition: MarketEdition;
  utcOffset: "-04:00" | "-05:00";
  scheduleVersion?: string;
  disposition?: ScheduledIngestionSlot["disposition"];
}): ScheduledIngestionSlot {
  const scheduleVersion = input.scheduleVersion ?? "ingestion-schedule-v1";
  const scheduledTimestamp = `${input.marketDate}T${editionTime[input.edition]}${input.utcOffset}`;
  return {
    scheduledSlotId: `slot-${buildIdempotencyKey("slot", [input.marketDate, input.edition, scheduledTimestamp, scheduleVersion]).slice(0, 16)}`,
    marketDate: input.marketDate,
    edition: input.edition,
    scheduledTimestamp,
    timezone: "America/New_York",
    scheduleVersion,
    disposition: input.disposition ?? "on_time",
  };
}
