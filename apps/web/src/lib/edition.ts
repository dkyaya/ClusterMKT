import { editionForDate } from "@cluster-mkt/config";
import type { MarketEdition } from "@cluster-mkt/core";

export function currentEdition(now = new Date()): MarketEdition {
  return editionForDate(now);
}
