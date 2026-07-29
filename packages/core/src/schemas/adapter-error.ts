import { z } from "zod";

export const IngestionErrorClassSchema = z.enum([
  "network_transient",
  "rate_limited",
  "timeout",
  "server_error",
  "client_error",
  "authentication_required",
  "permission_denied",
  "malformed_response",
  "schema_invalid",
  "unsupported_content",
  "source_disabled",
  "terms_not_approved",
  "idempotency_collision",
  "unknown",
]);

export const AdapterErrorSchema = z.object({
  errorId: z.string().min(1),
  errorClass: IngestionErrorClassSchema,
  message: z.string().min(1),
  retryable: z.boolean(),
  fixtureCode: z.string().min(1),
});

export type IngestionErrorClass = z.infer<typeof IngestionErrorClassSchema>;
export type AdapterError = z.infer<typeof AdapterErrorSchema>;
