import type { ClusterScope } from "@cluster-mkt/core";
import { Badge } from "@cluster-mkt/ui";

const labels: Record<ClusterScope, string> = {
  sector_wide: "Sector-wide",
  company_led_sector_impact: "Company-led impact",
  macro_to_sector: "Macro-to-sector",
  company_specific: "Company-specific",
};

const explanations: Record<ClusterScope, string> = {
  sector_wide: "Broad development affecting multiple parts of the sector.",
  company_led_sector_impact:
    "Company-specific event with material implications for the wider sector.",
  macro_to_sector: "Macroeconomic or policy development with sector-level relevance.",
  company_specific:
    "Company event included because its demonstrated sector relevance exceeds the inclusion threshold.",
};

export function SectorScopeBadge({ scope }: { scope: ClusterScope }) {
  return (
    <span className="sector-scope-badge">
      <Badge tone={scope === "sector_wide" ? "accent" : "neutral"}>{labels[scope]}</Badge>
      <span className="sector-scope-badge__explanation">{explanations[scope]}</span>
    </span>
  );
}
