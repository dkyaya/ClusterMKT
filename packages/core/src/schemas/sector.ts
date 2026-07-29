import { z } from "zod";

export const SubindustrySchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  displayName: z.string().min(1),
  description: z.string().min(1),
  commonTerminology: z.array(z.string().min(1)).min(1),
  representativePublicCompanyIds: z.array(z.string().min(1)),
  upstreamSubindustryIds: z.array(z.string().min(1)),
  downstreamSubindustryIds: z.array(z.string().min(1)),
});

export const IndustrySchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  displayName: z.string().min(1),
  subindustryIds: z.array(z.string().min(1)).min(1),
});

export const SectorSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  name: z.string().min(1),
  description: z.string().min(1),
  editorialTaxonomyVersion: z.string().min(1),
  industries: z.array(IndustrySchema).min(1),
  subindustries: z.array(SubindustrySchema).min(1),
  representativeConstituentIds: z.array(z.string().min(1)),
  followable: z.boolean(),
});

export type Sector = z.infer<typeof SectorSchema>;
export type Subindustry = z.infer<typeof SubindustrySchema>;
