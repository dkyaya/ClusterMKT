import type { UrlNormalizationResult, UrlNormalizationRules } from "../types/normalization";
import { isConfiguredFormatVariant } from "./url-classification";

const defaultRules: UrlNormalizationRules = {
  trackingParameterNames: ["fbclid", "gclid", "ref", "source"],
  trackingParameterPrefixes: ["utm_"],
  significantParameterNames: ["id", "article", "story", "document", "p"],
  mobileHostAliases: {},
  printParameterRules: {},
  ampPathHosts: [],
};

const unreservedEncoding = /%([0-9a-f]{2})/gi;
function normalizeSafeEncoding(value: string): string {
  return value.replace(unreservedEncoding, (encoded, hex: string) => {
    const character = String.fromCharCode(Number.parseInt(hex, 16));
    return /^[A-Za-z0-9._~-]$/.test(character) ? character : encoded.toUpperCase();
  });
}

export function normalizeSourceUrl(
  inputUrl: string,
  configuredRules: UrlNormalizationRules = defaultRules,
): UrlNormalizationResult {
  const result: UrlNormalizationResult = {
    inputUrl,
    removedParameters: [],
    preservedParameters: [],
    appliedRules: [],
    confidence: "high",
    reviewRequired: false,
    reviewStatus: "accepted",
    explanationCodes: [],
  };
  let url: URL;
  try {
    url = new URL(inputUrl);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("unsupported protocol");
  } catch {
    return {
      ...result,
      confidence: "low",
      reviewRequired: true,
      reviewStatus: "quarantined",
      explanationCodes: ["URL_MALFORMED_OR_UNSUPPORTED"],
    };
  }

  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();
  if (
    (url.protocol === "http:" && url.port === "80") ||
    (url.protocol === "https:" && url.port === "443")
  ) {
    url.port = "";
    result.appliedRules.push("URL_DEFAULT_PORT_REMOVED");
  }
  const canonicalHost = configuredRules.mobileHostAliases[url.hostname];
  if (canonicalHost) {
    url.hostname = canonicalHost;
    result.appliedRules.push("URL_CONFIGURED_MOBILE_HOST_ALIAS");
  }
  const variant = isConfiguredFormatVariant(url, configuredRules);
  if (variant === "amp") {
    url.pathname = url.pathname.replace(/\/amp\/?$/i, "");
    result.appliedRules.push("URL_CONFIGURED_AMP_VARIANT");
  }
  if (url.hash) {
    url.hash = "";
    result.appliedRules.push("URL_FRAGMENT_REMOVED");
  }
  url.pathname = normalizeSafeEncoding(url.pathname.replace(/\/{2,}/g, "/"));
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    result.appliedRules.push("URL_TRAILING_SLASH_REMOVED");
  }

  const nextParameters: Array<[string, string]> = [];
  url.searchParams.forEach((value, name) => {
    const key = name.toLowerCase();
    const configuredPrintValues = configuredRules.printParameterRules[url.hostname] ?? [];
    const isPrintParameter =
      variant === "print" && (key === "output" || configuredPrintValues.includes(key));
    const isTracking =
      configuredRules.trackingParameterNames.includes(key) ||
      configuredRules.trackingParameterPrefixes.some((prefix) => key.startsWith(prefix));
    if (isTracking || isPrintParameter) {
      result.removedParameters.push(name);
      return;
    }
    nextParameters.push([name, value]);
    result.preservedParameters.push(name);
    if (!configuredRules.significantParameterNames.includes(key)) {
      result.reviewRequired = true;
      result.confidence = "medium";
      result.explanationCodes.push("URL_UNKNOWN_PARAMETER_PRESERVED");
    }
  });
  nextParameters.sort(([aName, aValue], [bName, bValue]) =>
    `${aName}=${aValue}`.localeCompare(`${bName}=${bValue}`),
  );
  url.search = "";
  for (const [name, value] of nextParameters) url.searchParams.append(name, value);
  if (result.removedParameters.length)
    result.appliedRules.push("URL_TRACKING_OR_FORMAT_PARAMETER_REMOVED");
  if (nextParameters.length > 1) result.appliedRules.push("URL_QUERY_PARAMETERS_SORTED");
  result.normalizedUrl = url.toString();
  result.reviewStatus = result.reviewRequired ? "review_required" : "accepted";
  result.explanationCodes.unshift("URL_NORMALIZED_WITHOUT_NETWORK");
  return result;
}
