import type { IngestionErrorClass } from "../schemas/adapter-error";
import type { RetryDecision } from "../schemas/retry-decision";
import type { RetryPolicy } from "../schemas/retry-policy";
import { deterministicBackoff } from "./backoff";

export function decideRetry(input: {
  policy: RetryPolicy;
  errorClass: IngestionErrorClass;
  attemptNumber: number;
  consecutiveFailures: number;
  retryAfterSeconds?: number;
  seed?: number;
}): RetryDecision {
  const { policy } = input;
  if (policy.nonRetryableErrorClasses.includes(input.errorClass)) {
    const review =
      input.errorClass === "idempotency_collision" ||
      input.errorClass === "authentication_required";
    return {
      action: review ? "review" : "stop",
      attemptNumber: input.attemptNumber,
      simulatedDelayMs: 0,
      circuitState: "closed",
      explanationCodes: [review ? "NON_RETRYABLE_REVIEW" : "NON_RETRYABLE_STOP"],
    };
  }
  if (!policy.retryableErrorClasses.includes(input.errorClass)) {
    return {
      action: "quarantine",
      attemptNumber: input.attemptNumber,
      simulatedDelayMs: 0,
      circuitState: "closed",
      explanationCodes: ["ERROR_CLASS_QUARANTINED"],
    };
  }
  if (input.attemptNumber >= policy.maximumAttempts) {
    return {
      action: "dead_letter",
      attemptNumber: input.attemptNumber,
      simulatedDelayMs: 0,
      circuitState: input.consecutiveFailures >= policy.circuitBreakerThreshold ? "open" : "closed",
      explanationCodes: ["RETRY_POLICY_EXHAUSTED"],
    };
  }
  const circuitState =
    input.consecutiveFailures >= policy.circuitBreakerThreshold ? "open" : "closed";
  return {
    action: "retry",
    attemptNumber: input.attemptNumber,
    simulatedDelayMs: deterministicBackoff({
      attemptNumber: input.attemptNumber,
      initialDelayMs: policy.initialDelayMs,
      maximumDelayMs: policy.maximumDelayMs,
      multiplier: policy.multiplier,
      seed: input.seed ?? 1,
      ...(input.retryAfterSeconds === undefined
        ? {}
        : { retryAfterMs: input.retryAfterSeconds * 1000 }),
    }),
    circuitState,
    explanationCodes: [
      input.errorClass === "rate_limited" ? "RETRY_AFTER_HONORED" : "BOUNDED_RETRY_SCHEDULED",
      circuitState === "open" ? "CIRCUIT_BREAKER_OPEN" : "CIRCUIT_BREAKER_CLOSED",
    ],
  };
}
