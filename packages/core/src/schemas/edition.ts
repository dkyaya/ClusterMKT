import { z } from "zod";

export const MarketEditionSchema = z.enum(["morning", "midday", "closing"]);
export type MarketEdition = z.infer<typeof MarketEditionSchema>;
