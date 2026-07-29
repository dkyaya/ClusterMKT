import { z } from "zod";

export const CapabilityAvailabilitySchema = z.enum([
  "verified_fixture",
  "unverified",
  "unavailable",
  "review_required",
]);

export const OperationalSourceCapabilitySchema = z.object({
  feed: CapabilityAvailabilitySchema,
  api: CapabilityAvailabilitySchema,
  metadata: CapabilityAvailabilitySchema,
  abstract: CapabilityAvailabilitySchema,
  fullText: CapabilityAvailabilitySchema,
  podcast: CapabilityAvailabilitySchema,
  transcript: CapabilityAvailabilitySchema,
});

export type OperationalSourceCapability = z.infer<typeof OperationalSourceCapabilitySchema>;
