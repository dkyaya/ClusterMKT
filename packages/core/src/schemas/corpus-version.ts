import { z } from "zod";

export const CorpusVersionSchema = z.object({
  version: z.string().regex(/^gold-corpus-v\d+$/),
  createdAt: z.iso.datetime(),
  itemIds: z.array(z.string().regex(/^gold-item-\d{4}$/)).min(1),
  parentVersion: z
    .string()
    .regex(/^gold-corpus-v\d+$/)
    .nullable(),
  annotationContractVersion: z.string().regex(/^annotation-v\d+$/),
  status: z.enum(["candidate", "reviewing", "adjudicating", "frozen", "superseded"]),
  changeSummary: z.string().min(1),
  checksum: z.string().min(8),
});

export type CorpusVersion = z.infer<typeof CorpusVersionSchema>;
