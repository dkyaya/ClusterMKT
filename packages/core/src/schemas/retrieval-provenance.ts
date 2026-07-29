import { z } from "zod";
import { RetrievalAttemptSchema } from "./retrieval-attempt";

export const RetrievalProvenanceSchema = RetrievalAttemptSchema.extend({
  provenanceChecksum: z.string().length(64),
});

export type RetrievalProvenance = z.infer<typeof RetrievalProvenanceSchema>;
