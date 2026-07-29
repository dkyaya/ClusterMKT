import { decideRetry } from "../../packages/core/src/index";
import { fixtureRetryPolicies } from "../../packages/config/src/index";
import { describe, expect, it } from "vitest";

const policy = fixtureRetryPolicies[0]!;
describe("bounded retry and circuit-breaker policy", () => {
  it("retries transient failures with deterministic delay", () => {
    const a = decideRetry({
      policy,
      errorClass: "timeout",
      attemptNumber: 1,
      consecutiveFailures: 1,
      seed: 7,
    });
    const b = decideRetry({
      policy,
      errorClass: "timeout",
      attemptNumber: 1,
      consecutiveFailures: 1,
      seed: 7,
    });
    expect(a).toEqual(b);
    expect(a.action).toBe("retry");
  });
  it("honors fixture retry-after", () =>
    expect(
      decideRetry({
        policy,
        errorClass: "rate_limited",
        attemptNumber: 1,
        consecutiveFailures: 1,
        retryAfterSeconds: 12,
      }).simulatedDelayMs,
    ).toBe(12000));
  it.each(["authentication_required", "permission_denied", "terms_not_approved"] as const)(
    "does not retry %s",
    (errorClass) =>
      expect(
        decideRetry({ policy, errorClass, attemptNumber: 1, consecutiveFailures: 1 }).action,
      ).not.toBe("retry"),
  );
  it("opens the circuit at the threshold", () =>
    expect(
      decideRetry({ policy, errorClass: "server_error", attemptNumber: 2, consecutiveFailures: 3 })
        .circuitState,
    ).toBe("open"));
  it("dead-letters exhausted retries and cannot loop forever", () =>
    expect(
      decideRetry({
        policy,
        errorClass: "timeout",
        attemptNumber: policy.maximumAttempts,
        consecutiveFailures: 3,
      }).action,
    ).toBe("dead_letter"));
});
