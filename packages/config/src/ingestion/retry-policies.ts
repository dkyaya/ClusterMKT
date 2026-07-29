import { RetryPolicySchema, type RetryPolicy } from "@cluster-mkt/core";

export const fixtureRetryPolicies: RetryPolicy[] = [
  RetryPolicySchema.parse({
    retryPolicyId: "fixture-standard",
    maximumAttempts: 3,
    initialDelayMs: 1000,
    maximumDelayMs: 30000,
    multiplier: 2,
    jitterPolicy: "deterministic_fraction",
    retryableErrorClasses: [
      "network_transient",
      "rate_limited",
      "timeout",
      "server_error",
      "malformed_response",
    ],
    nonRetryableErrorClasses: [
      "client_error",
      "authentication_required",
      "permission_denied",
      "source_disabled",
      "terms_not_approved",
      "idempotency_collision",
    ],
    honorRetryAfter: true,
    circuitBreakerThreshold: 3,
    cooldownMs: 60000,
    reviewEscalationThreshold: 2,
  }),
];
