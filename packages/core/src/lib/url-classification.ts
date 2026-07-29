export function isLikelyUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isConfiguredFormatVariant(
  url: URL,
  rules: {
    printParameterRules: Readonly<Record<string, readonly string[]>>;
    ampPathHosts: readonly string[];
  },
): "print" | "amp" | undefined {
  const printValues = rules.printParameterRules[url.hostname] ?? [];
  if (
    printValues.some(
      (value) => url.searchParams.get("output") === value || url.searchParams.has(value),
    )
  ) {
    return "print";
  }
  if (rules.ampPathHosts.includes(url.hostname) && /\/amp\/?$/i.test(url.pathname)) return "amp";
  return undefined;
}
