export function deterministicBackoff(input: {
  attemptNumber: number;
  initialDelayMs: number;
  maximumDelayMs: number;
  multiplier: number;
  seed: number;
  retryAfterMs?: number;
}): number {
  if (input.retryAfterMs !== undefined) return Math.min(input.maximumDelayMs, input.retryAfterMs);
  const base = Math.min(
    input.maximumDelayMs,
    input.initialDelayMs * input.multiplier ** Math.max(0, input.attemptNumber - 1),
  );
  const fraction = ((input.seed * 1103515245 + input.attemptNumber * 12345) >>> 0) % 1000;
  return Math.min(input.maximumDelayMs, Math.round(base * (0.9 + fraction / 5000)));
}
