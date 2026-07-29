import type { EntityAliasRule, UrlNormalizationRules } from "../types/normalization";
import { RawSourceRecordSchema, type RawSourceRecord } from "../schemas/raw-source-record";
import type { NormalizedSourceRecord } from "../schemas/normalized-source-record";
import type { NormalizationDecision } from "../schemas/normalization-decision";
import type { EntityResolutionDecision } from "../schemas/entity-resolution-decision";
import type { EventSignature } from "../schemas/event-signature";
import type { EventSignatureInput } from "./event-signature";
import { normalizeSourceUrl } from "./url-normalization";
import { normalizeDisplayWhitespace } from "./text-normalization";
import { resolveSourceFamily } from "./source-family";
import { resolveEntities } from "./entity-resolution";
import { buildEventSignature } from "./event-signature";

export interface NormalizationPipelineOptions {
  rulesVersion: string;
  processedAt: string;
  urlRules: UrlNormalizationRules;
  entityRules: readonly EntityAliasRule[];
  knownSources: Readonly<Record<string, string>>;
  event?: EventSignatureInput;
}

export interface NormalizationPipelineResult {
  rawRecordId: string;
  route: "accepted" | "review_required" | "rejected" | "quarantined";
  normalizedRecord?: NormalizedSourceRecord;
  entityDecision?: EntityResolutionDecision;
  eventSignature?: EventSignature;
  decisions: NormalizationDecision[];
  retained: true;
}

function evidenceDepth(record: RawSourceRecord): NormalizedSourceRecord["evidenceDepth"] {
  if (
    record.contentType === "podcast_transcript" &&
    record.transcriptStatus === "reviewed_permitted"
  )
    return "transcript";
  if (record.fixtureText && record.textAvailable) return "full-text";
  if (record.publisherAbstract) return "authorized-abstract";
  return "metadata-only";
}

export function normalizeRawSourceRecord(
  input: unknown,
  options: NormalizationPipelineOptions,
): NormalizationPipelineResult {
  const parsed = RawSourceRecordSchema.safeParse(input);
  const fallbackId =
    typeof input === "object" &&
    input &&
    "rawRecordId" in input &&
    typeof input.rawRecordId === "string"
      ? input.rawRecordId
      : "unknown-raw-record";
  if (!parsed.success) {
    return {
      rawRecordId: fallbackId,
      route: "quarantined",
      retained: true,
      decisions: [
        {
          decisionId: `decision-${fallbackId}-validation`,
          stage: "raw_validation",
          inputIds: [fallbackId],
          outputIds: [],
          ruleIds: ["RAW_SCHEMA_V1"],
          explanation:
            "The untrusted raw record failed schema validation and remains countable in quarantine.",
          explanationCodes: ["RAW_RECORD_SCHEMA_INVALID"],
          confidence: "high",
          reviewStatus: "quarantined",
          processedAt: options.processedAt,
          rulesVersion: options.rulesVersion,
          provenance: [
            { rawRecordId: fallbackId, field: "raw_record", payloadRef: "unvalidated-input" },
          ],
        },
      ],
    };
  }
  const record = parsed.data;
  const provenance = [
    {
      rawRecordId: record.rawRecordId,
      field: "metadata",
      payloadRef: record.originalMetadataPayloadRef,
    },
  ];
  const decisions: NormalizationDecision[] = [];
  const log = (
    stage: NormalizationDecision["stage"],
    codes: string[],
    explanation: string,
    reviewStatus: NormalizationDecision["reviewStatus"] = "accepted",
  ) =>
    decisions.push({
      decisionId: `decision-${record.rawRecordId}-${stage}`,
      stage,
      inputIds: [record.rawRecordId],
      outputIds: reviewStatus === "quarantined" ? [] : [`normalized-${record.rawRecordId}`],
      ruleIds: [options.rulesVersion, ...codes],
      explanation,
      explanationCodes: codes,
      confidence: reviewStatus === "accepted" ? "high" : "medium",
      reviewStatus,
      processedAt: options.processedAt,
      rulesVersion: options.rulesVersion,
      provenance,
    });
  log(
    "raw_validation",
    ["RAW_RECORD_SCHEMA_VALID"],
    "The raw fixture record satisfies the untrusted-input contract.",
  );

  const normalizedPublisher = options.knownSources[record.sourceRegistryId];
  if (!normalizedPublisher) {
    log(
      "routing",
      ["SOURCE_REGISTRY_ID_UNKNOWN"],
      "The source registry ID is not in the configured offline registry.",
      "quarantined",
    );
    return {
      rawRecordId: record.rawRecordId,
      route: "quarantined",
      decisions,
      retained: true,
    };
  }
  if (!record.publishedAt) {
    log(
      "routing",
      ["PUBLICATION_DATE_MISSING"],
      "Publication date is required before automated normalization.",
      "review_required",
    );
    return {
      rawRecordId: record.rawRecordId,
      route: "review_required",
      decisions,
      retained: true,
    };
  }
  if (record.language !== "en") {
    log(
      "routing",
      ["LANGUAGE_UNSUPPORTED_V1"],
      "The v1 comparison rules support English fixture text only.",
      "quarantined",
    );
    return {
      rawRecordId: record.rawRecordId,
      route: "quarantined",
      decisions,
      retained: true,
    };
  }
  const urlDecision = normalizeSourceUrl(record.originalUrl, options.urlRules);
  log(
    "url_normalization",
    urlDecision.explanationCodes,
    "URL rules removed only configured tracking or format parameters and preserved unknown values.",
    urlDecision.reviewStatus,
  );
  if (!urlDecision.normalizedUrl) {
    return {
      rawRecordId: record.rawRecordId,
      route: "quarantined",
      decisions,
      retained: true,
    };
  }
  log(
    "text_normalization",
    ["DISPLAY_TEXT_PRESERVED", "COMPARISON_TEXT_DERIVED"],
    "Original display text remains intact; normalization creates comparison-only values.",
  );
  const family = resolveSourceFamily(record);
  log(
    "source_family",
    family.explanationCodes,
    "Source-family resolution uses configured or registry-derived fixture identity.",
    family.reviewRequired ? "review_required" : "accepted",
  );
  log(
    "exact_duplicate",
    ["DUPLICATE_COMPARISON_DEFERRED_TO_CORPUS"],
    "Duplicate comparison requires another retained record.",
  );
  log(
    "format_variant",
    ["FORMAT_VARIANT_RULES_APPLIED"],
    "Only explicitly configured print, AMP, or mobile variants may collapse.",
  );
  log(
    "syndication",
    ["SYNDICATION_COMPARISON_DEFERRED_TO_CORPUS"],
    "Syndication requires pairwise evidence and is not inferred from event similarity.",
  );
  log(
    "article_version",
    ["ARTICLE_INITIAL_VERSION"],
    "This record starts an initial version unless a stable prior work is supplied.",
  );
  log(
    "entity_candidate_generation",
    ["ENTITY_CANDIDATES_GENERATED"],
    "Exact configured aliases generated candidates without accepting them.",
  );
  const entityDecision = resolveEntities(
    record.rawRecordId,
    {
      headline: record.headline,
      ...(record.publisherAbstract ? { abstract: record.publisherAbstract } : {}),
      ...(record.fixtureText ? { text: record.fixtureText } : {}),
      url: record.originalUrl,
      sourceTags: [
        ...(record.rawTickerTags ?? []),
        ...(record.rawCompanyTags ?? []),
        ...(record.rawSectorTags ?? []),
      ],
    },
    options.entityRules,
    options.rulesVersion,
  );
  log(
    "entity_resolution",
    ["ENTITY_CANDIDATES_ADJUDICATED"],
    "Context rules separated accepted, rejected, and review-required entity candidates.",
    entityDecision.reviewRequiredEntityIds.length ? "review_required" : "accepted",
  );

  const eventSignature = options.event
    ? buildEventSignature(options.event, options.rulesVersion)
    : undefined;
  log(
    "event_signature",
    [eventSignature ? "EVENT_SIGNATURE_BUILT" : "EVENT_SIGNATURE_REVIEW_REQUIRED"],
    eventSignature
      ? "Structured fixture evidence produced a versioned event signature."
      : "No event contract was supplied; event identity remains review-required.",
    eventSignature ? "accepted" : "review_required",
  );
  log(
    "event_relationship",
    ["EVENT_RELATIONSHIP_REQUIRES_COMPARISON"],
    "Event merging is deferred until another versioned signature is available.",
    "review_required",
  );

  const route =
    urlDecision.reviewRequired ||
    family.reviewRequired ||
    entityDecision.reviewRequiredEntityIds.length ||
    !eventSignature
      ? "review_required"
      : "accepted";
  const normalizedRecord: NormalizedSourceRecord = {
    normalizedRecordId: `normalized-${record.rawRecordId}`,
    contributingRawRecordIds: [record.rawRecordId],
    canonicalUrl: urlDecision.normalizedUrl,
    normalizedPublisher,
    sourceFamilyId: family.sourceFamilyId,
    sourceRole: record.sourceRole,
    contentType: record.contentType,
    normalizedHeadline: normalizeDisplayWhitespace(record.headline),
    normalizedAuthors: (record.authorNames ?? []).map(normalizeDisplayWhitespace),
    publishedAt: record.publishedAt,
    latestUpdatedAt: record.updatedAt ?? record.publishedAt,
    language: record.language,
    accessType: record.accessType,
    evidenceDepth: evidenceDepth(record),
    textAvailable: record.textAvailable,
    podcastTranscriptStatus: record.transcriptStatus,
    articleVersionId: `version-${record.rawRecordId}-1`,
    underlyingWorkId: `work-${record.sourceProvidedArticleId ?? record.rawRecordId}`,
    normalizationConfidence: route === "accepted" ? "high" : "medium",
    reviewStatus: route,
    decisionCodes: decisions.flatMap((decision) => decision.explanationCodes),
    provenanceReferences: provenance,
    fixtureStatus: record.fixtureStatus,
    rulesVersion: options.rulesVersion,
  };
  log(
    "normalized_record",
    ["NORMALIZED_RECORD_EMITTED_WITH_PROVENANCE"],
    "The normalized record points back to preserved raw evidence.",
    route,
  );
  log(
    "routing",
    [route === "accepted" ? "ROUTED_ACCEPTED" : "ROUTED_REVIEW_REQUIRED"],
    `Record routed to ${route} without being dropped.`,
    route,
  );
  return {
    rawRecordId: record.rawRecordId,
    route,
    normalizedRecord,
    entityDecision,
    ...(eventSignature ? { eventSignature } : {}),
    decisions,
    retained: true,
  };
}
