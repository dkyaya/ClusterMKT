export interface ComparisonToken {
  value: string;
  start: number;
  end: number;
}

const tokenPattern =
  /(?:\$|€|£)?\d+(?:[.,]\d+)*(?:%|[kmbt])?|[\p{L}\p{N}]+(?:[.&'’-][\p{L}\p{N}]+)*/gu;

export function tokenizeForMatching(value: string): ComparisonToken[] {
  return [...value.matchAll(tokenPattern)].map((match) => ({
    value: match[0],
    start: match.index,
    end: match.index + match[0].length,
  }));
}

export function comparisonTokenValues(value: string, stopwords: readonly string[] = []): string[] {
  const excluded = new Set(stopwords.map((item) => item.toLocaleLowerCase("en-US")));
  return tokenizeForMatching(value)
    .map((token) => token.value.toLocaleLowerCase("en-US"))
    .filter((token) => !excluded.has(token));
}
