import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { format as formatWithPrettier } from "prettier";

const root = "tests/fixtures/gold-corpus";
const directories = ["items", "reviewer-decisions", "adjudications", "gold-labels", "sampling"];
for (const directory of directories) mkdirSync(join(root, directory), { recursive: true });

const taskCounts = [
  ["source_normalization", 45],
  ["entity_resolution", 60],
  ["event_boundaries", 45],
  ["story_cluster_membership", 45],
  ["claims", 55],
  ["agreement_disagreement", 35],
  ["sector_coverage", 30],
  ["review_routing", 30],
];

const sources = [
  "government_primary",
  "company_primary",
  "regulatory_primary",
  "financial_news",
  "general_news",
  "trade_publication",
  "podcast",
  "research_or_analysis",
];
const evidenceDepths = [
  "full_fixture_text",
  "government_release",
  "regulatory_filing",
  "publisher_abstract",
  "metadata",
  "headline_only",
  "official_transcript",
];
const sectors = ["semiconductors", "technology", "industrials", "energy", "consumer", "macro"];
const subindustries = [
  "chip_design_and_compute",
  "foundries_and_manufacturing",
  "memory",
  "semiconductor_equipment",
  "analog_and_power",
  "packaging_and_testing",
  "semiconductor_materials",
];
const eventTypes = [
  "earnings",
  "guidance",
  "capital_expenditure",
  "product_announcement",
  "regulation",
  "export_control",
  "monetary_policy",
  "economic_release",
  "management_change",
  "supply_disruption",
  "pricing_change",
  "capacity_change",
];
const issuers = [
  "nvidia",
  "amd",
  "intel",
  "tsmc",
  "asml",
  "micron",
  "broadcom",
  "texas-instruments",
  "applied-materials",
  "lam-research",
];
const existingFixturePaths = [
  "tests/fixtures/normalization/source-normalization-cases.json",
  "tests/fixtures/entity-resolution/entity-resolution-cases.json",
  "tests/fixtures/event-boundaries/event-boundary-cases.json",
  "tests/fixtures/story-clusters/story-clusters-cases.json",
  "tests/fixtures/claims/claims-cases.json",
  "tests/fixtures/agreement/agreement-cases.json",
  "tests/fixtures/disagreement/disagreement-cases.json",
  "tests/fixtures/source-intelligence/sector-coverage-cases.json",
  "tests/fixtures/ingestion/sources/mock-podcast-records.json",
  "tests/fixtures/ingestion/quarantine/quarantine-cases.json",
];
const taskScenarios = {
  source_normalization: [
    [
      "Print and web URLs share a publisher work identifier",
      "Compare canonical hints, significant query parameters, timestamps, and visible content identity.",
      "The print record attributes the same publisher and work ID; the web record adds only a configured campaign parameter.",
    ],
    [
      "Two similar headlines come from unrelated source families",
      "Headline similarity is visible, but no attribution, copied byline, or shared work identifier is present.",
      "Treat event overlap separately from work identity and source independence.",
    ],
    [
      "A later record changes one disclosed quantity",
      "The publisher ID is stable and an explicit update timestamp is visible.",
      "Determine whether this is an update, correction, or a new underlying work from the permitted fields.",
    ],
    [
      "Republished copy attributes an originating newsroom",
      "Byline and attribution fields name the originating work; publication hosts differ.",
      "Syndication must not add independent corroboration.",
    ],
  ],
  entity_resolution: [
    [
      "Ordinary-language token overlaps a configured ticker",
      "The token appears in prose without exchange, security, issuer, or market context.",
      "Candidate generation is not entity acceptance.",
    ],
    [
      "Issuer legal name and ticker appear beside a filing identifier",
      "The visible fields jointly identify one public-company registry entry.",
      "Classify directness and whether acceptance is safe.",
    ],
    [
      "Product name is shared by multiple registered issuers",
      "The evidence names a product but does not identify its owner or issuer.",
      "Use cannot determine or review required instead of guessing.",
    ],
    [
      "Sector name appears without a company mention",
      "The record concerns a configured sector and macro topic but names no constituent.",
      "Do not convert sector relevance into an inferred issuer mention.",
    ],
  ],
  event_boundaries: [
    [
      "Proposal and final rule share an agency and policy identifier",
      "Action state and effective date differ while the policy lineage is visible.",
      "Preserve proposal, final action, and update relationships without collapsing states.",
    ],
    [
      "Earnings release and analyst action occur on the same date",
      "Issuer and date match; action, actor, object, and evidence family differ.",
      "Company plus date does not establish one event.",
    ],
    [
      "Rumor precedes an official company confirmation",
      "The records have different certainty and source roles but concern one evolving occurrence.",
      "Classify event relationship and preserve the certainty transition.",
    ],
    [
      "One record discusses a product launch and a management departure",
      "Two materially different actions and objects appear in the permitted excerpt.",
      "Mark multi-event evidence rather than forcing one boundary.",
    ],
  ],
  story_cluster_membership: [
    [
      "Independent reaction report explicitly analyzes the bounded event",
      "The report cites the event but adds market reaction rather than primary facts.",
      "Decide accepted evidence role versus related context.",
    ],
    [
      "Background profile shares the issuer but predates the event",
      "No direct event action, object, or bounded claim is present.",
      "Entity overlap alone cannot create membership.",
    ],
    [
      "Record straddles two distinct event signatures",
      "Only one event belongs to the candidate cluster and the excerpt cannot be split safely.",
      "Route mixed-event ambiguity instead of silently accepting it.",
    ],
    [
      "Quarantined evidence otherwise matches the event",
      "Terminal-state metadata marks the record quarantined.",
      "Quarantine remains distinct and cannot enter accepted output.",
    ],
  ],
  claims: [
    [
      "Official fixture states a quantity, unit, and reporting period",
      "All quantitative fields are visible in a permitted primary-source fixture.",
      "Support is bounded to the exact number, unit, period, and attribution.",
    ],
    [
      "Headline proposes a detailed causal explanation",
      "Only headline and source metadata are available.",
      "Headline-only evidence cannot support detailed causal or quantitative claims.",
    ],
    [
      "Podcast card has no permitted transcript",
      "Episode title, publisher, and timestamp are visible; spoken content is unavailable.",
      "Metadata may support related listening, never a factual summary claim.",
    ],
    [
      "Abstract supports direction but omits the proposed magnitude",
      "The qualitative change is explicit; the numeric detail appears nowhere in permitted evidence.",
      "Distinguish partial support from complete support.",
    ],
  ],
  agreement_disagreement: [
    [
      "Two claims use different periods for otherwise similar quantities",
      "Period fields differ and both values may be accurate.",
      "A temporal difference is not automatically a contradiction.",
    ],
    [
      "Corrected release supersedes an earlier disclosed value",
      "The correction relationship and later timestamp are explicit.",
      "Preserve the earlier claim while marking supersession.",
    ],
    [
      "Sources agree on facts but disagree on likely consequences",
      "Factual predicates align; causal interpretations differ.",
      "Classify interpretive disagreement without manufacturing factual conflict.",
    ],
    [
      "Comparable quantities conflict after unit normalization",
      "Scope, period, attribution, and units align; values exceed the permitted tolerance.",
      "This may be a genuine quantitative disagreement requiring review.",
    ],
  ],
  sector_coverage: [
    [
      "Rule applies across several named semiconductor subindustries",
      "Affected activities span design, manufacturing, equipment, and materials.",
      "Assess breadth, materiality, and anti-concentration relevance.",
    ],
    [
      "Large constituent reports issuer-specific earnings",
      "No propagation evidence or sector-wide mechanism is visible.",
      "Issuer size does not turn a company event into a sector-wide event.",
    ],
    [
      "Macro change affects one financing-sensitive subindustry",
      "The transmission mechanism is supported only for a bounded subindustry.",
      "Do not over-promote a selective macro effect.",
    ],
    [
      "Supplier disruption has documented effects on several independent issuers",
      "The evidence identifies multiple affected works and subindustries.",
      "Evaluate whether the company-led origin has a defensible sector impact.",
    ],
  ],
  review_routing: [
    [
      "Accepted claims retain complete raw-to-visible provenance",
      "Identity, event boundary, evidence depth, and terminal state all pass.",
      "Determine display and Sector Brief eligibility separately.",
    ],
    [
      "One accepted-looking claim relies on quarantined evidence",
      "The evidence link is present but its terminal state is quarantined.",
      "Quarantined support cannot silently enter display.",
    ],
    [
      "Ambiguous ticker affects the candidate subject entity",
      "The unresolved match is material to the proposed cluster identity.",
      "Critical identity ambiguity should route to review or rejection.",
    ],
    [
      "Metadata-only podcast is related but not summary evidence",
      "The episode may be displayed as related listening with a disclosure.",
      "Separate related-display eligibility from factual-evidence eligibility.",
    ],
  ],
};
const tasks = taskCounts.flatMap(([task, count]) => Array.from({ length: count }, () => task));
const createdAt = "2026-07-29T18:00:00.000Z";

const items = tasks.map((task, index) => {
  const sequence = index + 1;
  const id = String(sequence).padStart(4, "0");
  const tickerTrap = index < 40;
  const duplicateCase = index >= 40 && index < 70;
  const versionCase = index >= 70 && index < 100;
  const metadataLimited = index >= 100 && index < 135;
  const podcastCase = index >= 135 && index < 160;
  const quantitativeCase = index >= 160 && index < 190;
  const apparentDisagreement = index >= 190 && index < 215;
  const evolving = index >= 215 && index < 240;
  const sourceCategory = podcastCase ? "podcast" : sources[index % sources.length];
  const evidenceDepth = metadataLimited
    ? "metadata_limited"
    : podcastCase
      ? index % 2
        ? "metadata"
        : "official_transcript"
      : evidenceDepths[index % evidenceDepths.length];
  const difficulty = index % 5 === 0 ? "adversarial" : index % 3 === 0 ? "challenging" : "routine";
  const issuerId = task === "sector_coverage" ? issuers[index % issuers.length] : "not_applicable";
  const scenario = taskScenarios[task][index % taskScenarios[task].length];
  const existingFixturePath = existingFixturePaths[index % existingFixturePaths.length];
  return {
    itemId: `gold-item-${id}`,
    corpusVersion: "gold-corpus-v1",
    sourceFixtureIds: [
      existingFixturePath,
      `synthetic-source-${String((index % 50) + 1).padStart(2, "0")}`,
    ],
    rawRecordIds: [`raw-gold-${id}`],
    normalizedRecordIds: [`normalized-gold-${id}`],
    task,
    samplingStrata: {
      sourceCategory,
      evidenceDepth,
      contentType: podcastCase ? "podcast" : index % 7 === 0 ? "regulatory_filing" : "article",
      sector: sectors[index % sectors.length],
      subindustry: subindustries[index % subindustries.length],
      macroTopic: index % 4 === 0 ? "interest_rates" : "not_applicable",
      eventType: eventTypes[index % eventTypes.length],
      entityType:
        task === "sector_coverage"
          ? "public_company"
          : index % 6 === 0
            ? "government_agency"
            : "public_company",
      tickerAmbiguity: tickerTrap ? "ordinary_language_trap" : "none",
      duplicateClass: duplicateCase ? "duplicate_or_syndication" : "independent_or_not_applicable",
      syndicationClass: duplicateCase && index % 2 === 0 ? "syndicated_copy" : "not_syndicated",
      articleVersionClass: versionCase ? "version_chain" : "single_version",
      claimType: quantitativeCase ? "quantitative_fact" : "event_fact",
      discourseClass: apparentDisagreement ? "apparent_disagreement" : "not_applicable",
      reviewRoutingStatus: difficulty === "adversarial" ? "review_required" : "pending_review",
      difficulty,
      languageStatus: index % 19 === 0 ? "unsupported_fixture" : "english",
      timeSensitivity: evolving ? "evolving_or_corrected" : "stable_fixture_time",
      sourceRole: index % 3 === 0 ? "primary" : index % 3 === 1 ? "secondary" : "mixed",
    },
    difficultyClass: difficulty,
    evidenceDepth,
    sourceCategory,
    eventType: eventTypes[index % eventTypes.length],
    sectorId: sectors[index % sectors.length],
    subindustryId: subindustries[index % subindustries.length],
    entityAmbiguityClass: tickerTrap ? "ordinary_language_ticker_collision" : "none",
    duplicateOrSyndicationClass: duplicateCase
      ? "duplicate_or_syndication"
      : versionCase
        ? "article_version"
        : "independent",
    groupId: `event-group-${String(Math.floor(index / 3) + 1).padStart(3, "0")}`,
    evidencePackage: {
      headline: `${scenario[0]} · case ${id}`,
      abstract: metadataLimited ? null : scenario[1],
      structuredFields: {
        issuerId,
        sourceFixturePath: existingFixturePath,
        reviewerQuestion: scenario[2],
        fixtureClass: tickerTrap
          ? "ticker_trap"
          : duplicateCase
            ? "duplication"
            : versionCase
              ? "versioning"
              : "general",
        copyright: "project_synthetic",
      },
      permittedExcerpt: metadataLimited ? null : scenario[2],
    },
    allowedReviewerVisibleFields: [
      "headline",
      "abstract",
      "structuredFields",
      "permittedExcerpt",
      "sourceProvenance",
      "evidenceDepth",
    ],
    hiddenPrediction:
      sequence <= 8 ? { systemCandidateOnly: true, disclosure: "hidden_until_submission" } : null,
    expectedReviewCount: difficulty === "adversarial" ? 3 : 2,
    reviewAssignmentIds: [],
    reviewerDecisionIds: [],
    adjudicationDecisionId: null,
    finalGoldLabelId: null,
    goldLabelConfidence: null,
    reviewerNotes: [],
    adjudicatorNotes: [],
    provenance: [
      `tests/fixtures/gold-corpus/items/corpus-items.json#${id}`,
      existingFixturePath,
      `synthetic-source-${String((index % 50) + 1).padStart(2, "0")}`,
    ],
    copyrightClassification: "project_synthetic",
    createdAt,
    updatedAt: createdAt,
    amendmentHistory: [],
    regressionFixtureStatus: "not_reviewed",
    exclusionStatus: "included",
    exclusionReason: null,
    finalStatus: "pending_review",
  };
});

const checksum = createHash("sha256").update(JSON.stringify(items)).digest("hex");
const write = async (path, value) =>
  writeFileSync(
    join(root, path),
    await formatWithPrettier(JSON.stringify(value), { parser: "json", printWidth: 100 }),
  );
await write("items/corpus-items.json", {
  corpusVersion: "gold-corpus-v1",
  generatedFrom: "deterministic synthetic candidate builder",
  goldLabelsGeneratedByAutomation: false,
  items,
});
await write("reviewer-decisions/reviewer-decisions.json", {
  corpusVersion: "gold-corpus-v1",
  decisions: [],
  status: "awaiting_independent_human_review",
});
await write("adjudications/adjudications.json", {
  corpusVersion: "gold-corpus-v1",
  adjudications: [],
  status: "no_items_ready_for_adjudication",
});
await write("gold-labels/gold-labels.json", {
  corpusVersion: "gold-corpus-v1",
  goldLabels: [],
  status: "blocked_pending_human_review",
});
await write("sampling/corpus-version.json", {
  version: "gold-corpus-v1",
  createdAt,
  itemIds: items.map(({ itemId }) => itemId),
  parentVersion: null,
  annotationContractVersion: "annotation-v1",
  status: "candidate",
  changeSummary:
    "Initial 345-item blinded candidate corpus; no gold labels are assigned by automation.",
  checksum,
});
await write("sampling/sampling-manifest.json", {
  corpusVersion: "gold-corpus-v1",
  itemCount: items.length,
  taskCounts: Object.fromEntries(taskCounts),
  deterministicSeed: "cluster-mkt-gold-v1-seed",
  humanReviewStatus: "pending",
  goldLabelsGeneratedByAutomation: false,
});
console.log(`Wrote ${items.length} candidate annotation items with zero automated gold labels.`);
