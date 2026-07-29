import { z } from "zod";
import { MarketEditionSchema } from "./edition";

export const SectorBriefSchema = z.object({
  id: z.string().regex(/^sector-brief-[a-z0-9-]+$/),
  sectorId: z.string().min(1),
  sectorName: z.string().min(1),
  marketEdition: MarketEditionSchema,
  marketDate: z.iso.date(),
  generatedAt: z.iso.datetime(),
  activeClusterIds: z.array(z.string().min(1)),
  sectorWideClusterIds: z.array(z.string().min(1)),
  companyLedImpactClusterIds: z.array(z.string().min(1)),
  macroToSectorClusterIds: z.array(z.string().min(1)),
  keyThemes: z.array(z.string().min(1)),
  mostAffectedSubindustries: z.array(z.string().min(1)),
  pointsOfAgreement: z.array(z.string().min(1)),
  competingArguments: z.array(z.string().min(1)),
  uncertainty: z.array(z.string().min(1)),
  coverageGaps: z.array(z.string().min(1)),
  whatWouldChangeThePicture: z.array(z.string().min(1)),
  breadthMetrics: z.object({
    materialDevelopmentCount: z.number().int().nonnegative(),
    issuerCount: z.number().int().nonnegative(),
    subindustryCount: z.number().int().nonnegative(),
    sectorWideCount: z.number().int().nonnegative(),
    companyLedCount: z.number().int().nonnegative(),
    macroToSectorCount: z.number().int().nonnegative(),
  }),
  demonstrationData: z.boolean(),
});

export type SectorBrief = z.infer<typeof SectorBriefSchema>;
