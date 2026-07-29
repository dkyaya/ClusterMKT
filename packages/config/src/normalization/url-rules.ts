import type { UrlNormalizationRules } from "@cluster-mkt/core";

export const urlNormalizationRules: UrlNormalizationRules = {
  trackingParameterNames: ["fbclid", "gclid", "mc_cid", "mc_eid", "ref", "source", "social"],
  trackingParameterPrefixes: ["utm_"],
  significantParameterNames: ["id", "article", "story", "document", "accession", "p"],
  mobileHostAliases: {
    "m.fixture-financial.test": "www.fixture-financial.test",
  },
  printParameterRules: {
    "www.fixture-financial.test": ["output", "print"],
  },
  ampPathHosts: ["www.fixture-financial.test"],
};
