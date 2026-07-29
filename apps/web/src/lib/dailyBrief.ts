import type { MarketEdition } from "@cluster-mkt/core";

const MARKET_TIME_ZONE = "America/New_York";

export function marketDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: MARKET_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);
  const value = (type: "day" | "month" | "year") =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function dailyBriefStorageKey(date: Date, edition: MarketEdition) {
  return `cluster-mkt:daily-brief-dismissed:${marketDate(date)}:${edition}`;
}
