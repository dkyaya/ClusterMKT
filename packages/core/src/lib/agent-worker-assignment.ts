import type { AgentReviewerRoleId } from "../schemas/agent-reviewer-role";
import { AGENT_REVIEWER_PSEUDONYMS, type AgentReviewerPseudonym } from "./agent-worker-isolation";

export interface AgentWorkerAssignment {
  role: AgentReviewerRoleId;
  reviewerId: AgentReviewerPseudonym;
  anonymizedMemberId: string;
}

export function assignPanelWorkers(roles: readonly AgentReviewerRoleId[]): AgentWorkerAssignment[] {
  if (roles.length > AGENT_REVIEWER_PSEUDONYMS.length) {
    throw new Error("panel exceeds available reviewer pseudonym pool");
  }
  return roles.map((role, index) => ({
    role,
    reviewerId: AGENT_REVIEWER_PSEUDONYMS[index]!,
    anonymizedMemberId: `panel-member-${index + 1}`,
  }));
}
