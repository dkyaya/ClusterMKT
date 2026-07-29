import type { MarketEdition } from "../schemas/edition";
import type { ClusterScope, ConfidenceLevel } from "../schemas/cluster-entity-relation";

export interface SectorMaterialityInput {
  clusterId: string;
  issuerId?: string;
  subindustryIds: string[];
  supportingSourceIds: string[];
  directSectorNaming: number;
  affectedConstituentCount: number;
  affectedSubindustryCount: number;
  constituentImportance: number;
  supplyChainPropagation: number;
  demandPropagation: number;
  pricingImplications: number;
  capacityImplications: number;
  regulatoryBreadth: number;
  macroBreadth: number;
  sectorSpecificity: number;
  primarySourceEvidence: number;
  independentSourceCount: number;
  recency: number;
  explicitRelationship: boolean;
  confidence: ConfidenceLevel;
  contradictoryEvidence: number;
  incidentalMention?: boolean;
  headlineOnly?: boolean;
  podcastMetadataOnly?: boolean;
  companyLed?: boolean;
  active?: boolean;
  themes?: string[];
}

export interface SectorMaterialityResult {
  materialityScore: number;
  relevanceScore: number;
  recommendedScope: ClusterScope;
  included: boolean;
  explanationCodes: string[];
  whyIncluded: string;
  requiredReview: boolean;
}

export interface SectorFeedCandidate {
  id: string;
  title: string;
  scope: ClusterScope;
  materialityScore: number;
  relevanceScore: number;
  issuerId?: string;
  subindustryIds: string[];
  whyIncluded: string;
  active: boolean;
  sourceCount: number;
  themes: string[];
  pointsOfAgreement?: string[];
  competingArguments?: string[];
  uncertainty?: string[];
  whatWouldChangeThePicture?: string[];
  clusterReviewStatus?: "accepted" | "review_required" | "rejected" | "quarantined";
  eligibleForDisplay?: boolean;
  eligibleForSectorBrief?: boolean;
  claimIds?: string[];
  agreementGroupIds?: string[];
  uncertaintyIds?: string[];
  independentSourceCount?: number;
}

export interface SectorFeedItem extends SectorFeedCandidate {
  originalRank: number;
  adjustedRank: number;
  diversityAdjusted: boolean;
}

export interface SectorFeed {
  sectorId: string;
  marketEdition: MarketEdition;
  marketDate: string;
  items: SectorFeedItem[];
  diversityAdjustments: string[];
  coverageGaps: string[];
  reviewWatchItems: SectorFeedCandidate[];
}
