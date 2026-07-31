import type { AnnotationItem } from "../schemas/annotation-item";
import { stableFingerprint } from "./idempotency-key";

export type CorpusPartition = "training" | "calibration" | "held_out";

export function partitionGroup(groupId: string, seed: string): CorpusPartition {
  const bucket = Number.parseInt(stableFingerprint([seed, groupId]).slice(0, 8), 16) % 100;
  if (bucket < 60) return "training";
  if (bucket < 80) return "calibration";
  return "held_out";
}

export function partitionCorpus(items: readonly AnnotationItem[], seed: string) {
  const grouped = new Map<string, AnnotationItem[]>();
  for (const item of items) grouped.set(item.groupId, [...(grouped.get(item.groupId) ?? []), item]);
  const groups = [...grouped].sort(([left], [right]) =>
    stableFingerprint([seed, left]).localeCompare(stableFingerprint([seed, right])),
  );
  const ratio = { training: 0.6, calibration: 0.2, held_out: 0.2 } as const;
  const partitions: CorpusPartition[] = ["training", "calibration", "held_out"];
  const targetItems = Object.fromEntries(
    partitions.map((partition) => [partition, items.length * ratio[partition]]),
  ) as Record<CorpusPartition, number>;
  const assignedItems = { training: 0, calibration: 0, held_out: 0 };
  const taskTotals = Object.fromEntries(
    [...new Set(items.map((item) => item.task))].map((task) => [
      task,
      items.filter((item) => item.task === task).length,
    ]),
  );
  const assignedByTask = Object.fromEntries(
    Object.keys(taskTotals).map((task) => [task, { training: 0, calibration: 0, held_out: 0 }]),
  ) as Record<string, Record<CorpusPartition, number>>;
  const groupPartition = new Map<string, CorpusPartition>();
  for (const [groupId, groupItems] of groups) {
    const groupTaskCounts = Object.fromEntries(
      [...new Set(groupItems.map((item) => item.task))].map((task) => [
        task,
        groupItems.filter((item) => item.task === task).length,
      ]),
    );
    const partition = [...partitions].sort((left, right) => {
      const score = (candidate: CorpusPartition) => {
        const globalDeficit = (targetItems[candidate] - assignedItems[candidate]) / items.length;
        const stratumDeficit = Object.keys(groupTaskCounts).reduce(
          (sum, task) =>
            sum +
            ((taskTotals[task] ?? 0) * ratio[candidate] -
              (assignedByTask[task]?.[candidate] ?? 0)) /
              Math.max(1, taskTotals[task] ?? 0),
          0,
        );
        return globalDeficit + stratumDeficit;
      };
      return score(right) - score(left) || partitions.indexOf(left) - partitions.indexOf(right);
    })[0]!;
    groupPartition.set(groupId, partition);
    assignedItems[partition] += groupItems.length;
    for (const [task, count] of Object.entries(groupTaskCounts)) {
      assignedByTask[task]![partition] += count;
    }
  }
  const assignments = items.map((item) => ({
    itemId: item.itemId,
    groupId: item.groupId,
    partition: groupPartition.get(item.groupId)!,
  }));
  const groupPartitions = new Map<string, Set<CorpusPartition>>();
  for (const assignment of assignments)
    groupPartitions.set(
      assignment.groupId,
      new Set([...(groupPartitions.get(assignment.groupId) ?? []), assignment.partition]),
    );
  const leakingGroups = [...groupPartitions]
    .filter(([, partitions]) => partitions.size > 1)
    .map(([groupId]) => groupId);
  const counts = {
    training: assignments.filter(({ partition }) => partition === "training").length,
    calibration: assignments.filter(({ partition }) => partition === "calibration").length,
    held_out: assignments.filter(({ partition }) => partition === "held_out").length,
  };
  const stratumBalance = Object.fromEntries(
    Object.entries(assignedByTask).map(([task, taskCounts]) => [task, taskCounts]),
  );
  return {
    assignments,
    counts,
    stratumBalance,
    leakingGroups,
    passed: leakingGroups.length === 0 && counts.held_out > 0 && counts.calibration > 0,
  };
}
