import { z } from "zod";
import { MarketEditionSchema } from "./edition";

export const ScheduledIngestionSlotSchema = z.object({
  scheduledSlotId: z.string().min(1),
  marketDate: z.iso.date(),
  edition: MarketEditionSchema,
  scheduledTimestamp: z.iso.datetime({ offset: true }),
  timezone: z.literal("America/New_York"),
  scheduleVersion: z.string().regex(/^ingestion-schedule-v\d+$/),
  disposition: z.enum(["on_time", "delayed", "missed", "manual_replay", "resumed", "duplicate"]),
});

export type ScheduledIngestionSlot = z.infer<typeof ScheduledIngestionSlotSchema>;
