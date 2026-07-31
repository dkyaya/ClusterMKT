import type { AnnotationItem } from "../schemas/annotation-item";
import type { SamplingPlan } from "../schemas/sampling-plan";

export function evaluateSamplingCoverage(items: readonly AnnotationItem[], plan: SamplingPlan) {
  const taskCounts = Object.fromEntries(
    Object.keys(plan.taskMinimums).map((task) => [
      task,
      items.filter((item) => item.task === task).length,
    ]),
  );
  const strata = plan.strataMinimums.map((requirement) => {
    const count = items.filter((item) => {
      const values = item.samplingStrata as unknown as Record<string, string>;
      return values[requirement.dimension] === requirement.value;
    }).length;
    return { ...requirement, count, passed: count >= requirement.minimum };
  });
  const taskFailures = Object.entries(plan.taskMinimums)
    .filter(([task, minimum]) => (taskCounts[task] ?? 0) < minimum)
    .map(([task, minimum]) => ({ task, minimum, count: taskCounts[task] ?? 0 }));
  const companyItems = items.filter(
    (item) =>
      item.task === "sector_coverage" && item.samplingStrata.entityType === "public_company",
  );
  const issuerCounts = new Map<string, number>();
  for (const item of companyItems)
    issuerCounts.set(
      item.evidencePackage.structuredFields.issuerId ?? "none",
      (issuerCounts.get(item.evidencePackage.structuredFields.issuerId ?? "none") ?? 0) + 1,
    );
  const maximumIssuerShare = companyItems.length
    ? Math.max(...issuerCounts.values()) / companyItems.length
    : 0;
  return {
    itemCount: items.length,
    targetItemCount: plan.targetItemCount,
    taskCounts,
    taskFailures,
    strata,
    maximumIssuerShare,
    passed:
      items.length >= plan.targetItemCount &&
      taskFailures.length === 0 &&
      strata.every(({ passed }) => passed) &&
      maximumIssuerShare <= plan.maximumCompanyShare,
  };
}
