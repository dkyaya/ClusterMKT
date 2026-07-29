export function normalizeComparisonText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en-US");
}

export function normalizeDisplayWhitespace(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}
