import { EntitySchema, type Entity } from "@cluster-mkt/core";

const topicNames = {
  federal_reserve: "Federal Reserve",
  interest_rates: "Interest rates",
  inflation: "Inflation",
  employment: "Employment",
  unemployment: "Unemployment",
  wages: "Wages",
  gross_domestic_product: "Gross domestic product",
  consumer_spending: "Consumer spending",
  fiscal_policy: "Fiscal policy",
  monetary_policy: "Monetary policy",
  treasury_issuance: "Treasury issuance",
  trade_policy: "Trade policy",
  tariffs: "Tariffs",
  oil_and_energy: "Oil and energy",
  currencies: "Currencies",
  credit_conditions: "Credit conditions",
  housing: "Housing",
} as const;

export const macroTopics: Entity[] = Object.entries(topicNames).map(([id, displayName]) =>
  EntitySchema.parse({ id, displayName, entityType: "macro_topic", aliases: [], active: true }),
);

export const governmentInstitutionFixtures: Entity[] = [
  ["agency-federal-reserve", "Federal Reserve"],
  ["agency-bls", "Bureau of Labor Statistics"],
  ["agency-bea", "Bureau of Economic Analysis"],
  ["agency-us-treasury", "U.S. Treasury"],
  ["agency-cbo", "Congressional Budget Office"],
  ["agency-census", "U.S. Census Bureau"],
  ["agency-sec", "Securities and Exchange Commission"],
].map(([id, displayName]) =>
  EntitySchema.parse({
    id,
    displayName,
    entityType: "government_agency",
    aliases: [],
    active: true,
  }),
);

export const economicIndicatorFixtures: Entity[] = [
  ["indicator-cpi", "Consumer Price Index"],
  ["indicator-unemployment-rate", "Unemployment rate"],
  ["indicator-average-hourly-earnings", "Average hourly earnings"],
  ["indicator-gdp", "Gross domestic product"],
  ["indicator-retail-sales", "Retail sales"],
  ["indicator-housing-starts", "Housing starts"],
].map(([id, displayName]) =>
  EntitySchema.parse({
    id,
    displayName,
    entityType: "economic_indicator",
    aliases: [],
    active: true,
  }),
);
