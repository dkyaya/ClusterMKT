export function rawAgreement(left: readonly string[], right: readonly string[]): number | null {
  if (left.length === 0 || left.length !== right.length) return null;
  return left.filter((value, index) => value === right[index]).length / left.length;
}

export function cohensKappa(left: readonly string[], right: readonly string[]): number | null {
  const observed = rawAgreement(left, right);
  if (observed === null) return null;
  const labels = [...new Set([...left, ...right])];
  const expected = labels.reduce((sum, label) => {
    const leftRate = left.filter((value) => value === label).length / left.length;
    const rightRate = right.filter((value) => value === label).length / right.length;
    return sum + leftRate * rightRate;
  }, 0);
  if (expected === 1) return observed === 1 ? 1 : null;
  return (observed - expected) / (1 - expected);
}

export function weightedKappa(
  left: readonly number[],
  right: readonly number[],
  maximumDistance: number,
): number | null {
  if (!left.length || left.length !== right.length || maximumDistance <= 0) return null;
  const observed =
    left.reduce(
      (sum, value, index) => sum + Math.abs(value - (right[index] ?? value)) / maximumDistance,
      0,
    ) / left.length;
  const expectedPairs = left.flatMap((a) => right.map((b) => Math.abs(a - b) / maximumDistance));
  const expected = expectedPairs.reduce((sum, value) => sum + value, 0) / expectedPairs.length;
  return expected === 0 ? (observed === 0 ? 1 : null) : 1 - observed / expected;
}

export function fleissKappa(rows: readonly (readonly number[])[]): number | null {
  if (!rows.length || rows.some((row) => row.reduce((sum, value) => sum + value, 0) < 2))
    return null;
  const firstRow = rows[0];
  if (!firstRow) return null;
  const ratingsPerItem = firstRow.reduce((sum, value) => sum + value, 0);
  if (rows.some((row) => row.reduce((sum, value) => sum + value, 0) !== ratingsPerItem))
    return null;
  const categoryTotals = firstRow.map((_, index) =>
    rows.reduce((sum, row) => sum + (row[index] ?? 0), 0),
  );
  const proportions = categoryTotals.map((total) => total / (rows.length * ratingsPerItem));
  const expected = proportions.reduce((sum, proportion) => sum + proportion ** 2, 0);
  const observed =
    rows.reduce(
      (sum, row) =>
        sum +
        (row.reduce((inner, count) => inner + count ** 2, 0) - ratingsPerItem) /
          (ratingsPerItem * (ratingsPerItem - 1)),
      0,
    ) / rows.length;
  return expected === 1 ? (observed === 1 ? 1 : null) : (observed - expected) / (1 - expected);
}

export function confusionMatrix(expected: readonly string[], actual: readonly string[]) {
  if (expected.length !== actual.length) return null;
  const labels = [...new Set([...expected, ...actual])].sort();
  const matrix = Object.fromEntries(
    labels.map((expectedLabel) => [
      expectedLabel,
      Object.fromEntries(labels.map((actualLabel) => [actualLabel, 0])),
    ]),
  ) as Record<string, Record<string, number>>;
  expected.forEach((expectedLabel, index) => {
    const actualLabel = actual[index];
    if (actualLabel)
      matrix[expectedLabel]![actualLabel] = (matrix[expectedLabel]![actualLabel] ?? 0) + 1;
  });
  return { labels, matrix };
}

export function precisionRecallForLabel(
  expected: readonly string[],
  actual: readonly string[],
  positiveLabel: string,
) {
  if (!expected.length || expected.length !== actual.length) return null;
  let truePositive = 0;
  let falsePositive = 0;
  let falseNegative = 0;
  expected.forEach((expectedLabel, index) => {
    const actualLabel = actual[index];
    if (actualLabel === positiveLabel && expectedLabel === positiveLabel) truePositive += 1;
    else if (actualLabel === positiveLabel) falsePositive += 1;
    else if (expectedLabel === positiveLabel) falseNegative += 1;
  });
  return {
    precision: truePositive + falsePositive ? truePositive / (truePositive + falsePositive) : null,
    recall: truePositive + falseNegative ? truePositive / (truePositive + falseNegative) : null,
    truePositive,
    falsePositive,
    falseNegative,
  };
}
