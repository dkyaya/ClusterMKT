import { z } from "zod";
import { RawContentTypeSchema } from "./raw-source-record";
import { RetrievalMethodSchema } from "./retrieval-method";

export const AdapterCapabilitySchema = z.object({
  adapterId: z.string().min(1),
  sourceId: z.string().min(1),
  adapterVersion: z.string().min(1),
  retrievalMethod: RetrievalMethodSchema,
  supportedContentTypes: z.array(RawContentTypeSchema).min(1),
  fixtureOnly: z.literal(true),
});

export type AdapterCapability = z.infer<typeof AdapterCapabilitySchema>;
