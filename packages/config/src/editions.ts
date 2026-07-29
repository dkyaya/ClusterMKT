import type { MarketEdition } from "@cluster-mkt/core";

export const MARKET_TIME_ZONE = "America/New_York";

export interface EditionDefinition {
  id: MarketEdition;
  label: string;
  startHour: number;
  endHour: number;
  accentToken: string;
}

export const EDITIONS: readonly EditionDefinition[] = [
  {
    id: "morning",
    label: "Morning Edition",
    startHour: 6,
    endHour: 12,
    accentToken: "--color-warm-ochre",
  },
  {
    id: "midday",
    label: "Midday Edition",
    startHour: 12,
    endHour: 18,
    accentToken: "--color-forest-green",
  },
  {
    id: "closing",
    label: "Closing Edition",
    startHour: 18,
    endHour: 6,
    accentToken: "--color-ink-blue",
  },
];

export function marketHour(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MARKET_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value;
  if (hour === undefined) throw new Error("Unable to determine market hour.");
  return Number(hour);
}

export function editionForDate(date: Date): MarketEdition {
  const hour = marketHour(date);
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "midday";
  return "closing";
}

export function editionDefinition(edition: MarketEdition): EditionDefinition {
  const definition = EDITIONS.find((candidate) => candidate.id === edition);
  if (!definition) throw new Error(`Unknown edition: ${edition}`);
  return definition;
}
