import { z } from "zod";

export const EntityTypeSchema = z.enum([
  "public_company",
  "security",
  "sector",
  "industry",
  "subindustry",
  "macro_topic",
  "government_agency",
  "economic_indicator",
]);

export const EntitySchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9_-]*$/),
  displayName: z.string().min(1),
  entityType: EntityTypeSchema,
  aliases: z.array(z.string().min(1)).default([]),
  ticker: z.string().min(1).optional(),
  exchange: z.string().min(1).optional(),
  parentSectorId: z.string().min(1).optional(),
  parentIndustryId: z.string().min(1).optional(),
  parentSubindustryId: z.string().min(1).optional(),
  active: z.boolean(),
});

export type Entity = z.infer<typeof EntitySchema>;
export type EntityType = z.infer<typeof EntityTypeSchema>;
