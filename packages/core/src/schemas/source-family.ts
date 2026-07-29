import { z } from "zod";

export const SourceFamilySchema = z.object({
  sourceFamilyId: z.string().min(1),
  publisherIds: z.array(z.string().min(1)).min(1),
  distributionPlatformIds: z.array(z.string().min(1)).default([]),
  canonicalPublisherId: z.string().min(1),
  knownAttributionLabels: z.array(z.string().min(1)).default([]),
  fixtureStatus: z.literal("fixture"),
});

export type SourceFamily = z.infer<typeof SourceFamilySchema>;
