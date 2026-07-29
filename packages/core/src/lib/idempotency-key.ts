function hash32(value: string, seed: number): string {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function stableFingerprint(parts: readonly (string | number | boolean | null)[]): string {
  const value = parts.map((part) => String(part)).join("\u001f");
  return [
    2166136261, 2246822519, 3266489917, 668265263, 374761393, 2654435761, 1597334677, 3812015801,
  ]
    .map((seed) => hash32(value, seed))
    .join("");
}

export function buildIdempotencyKey(
  kind:
    | "retrieval"
    | "raw"
    | "adapter_page"
    | "article_version"
    | "run"
    | "slot"
    | "cluster"
    | "sector_brief",
  stableInputs: readonly (string | number | boolean | null)[],
): string {
  return stableFingerprint([kind, ...stableInputs]);
}
