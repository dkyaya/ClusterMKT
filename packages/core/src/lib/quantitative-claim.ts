import type { QuantitativeValue } from "../schemas/claim";

export function parseQuantitativeFixture(input: {
  rawValueText: string;
  unit?: string;
  currency?: string;
  timePeriod?: string;
  precision?: QuantitativeValue["precision"];
}): QuantitativeValue {
  const cleaned = input.rawValueText.replaceAll(",", "").match(/-?\d+(?:\.\d+)?/u)?.[0];
  const numericValue = cleaned === undefined ? undefined : Number(cleaned);
  return {
    rawValueText: input.rawValueText,
    ...(Number.isFinite(numericValue) ? { numericValue } : {}),
    ...(input.unit ? { unit: input.unit } : {}),
    ...(input.currency ? { currency: input.currency } : {}),
    ...(input.timePeriod ? { timePeriod: input.timePeriod } : {}),
    precision: input.precision ?? (input.rawValueText.includes("about") ? "approximate" : "exact"),
  };
}
